import {
  AddNote,
  AddQuote,
  ChangeBookStatus,
  CreateBookEntry,
  GetBookEntry,
  ListAllNotes,
  ListAllQuotes,
  ListBookEntries,
  ListNotesByBook,
  ListQuotesByBook,
  UpdateBookEntry,
  UpdateBookProgress,
  ExportBackup,
  ImportBackup,
  InspectBackup,
  type BackupArtifact,
  type BackupCounts,
  type BackupSummary,
  type FileDeliveryResult,
  type FileDeliveryPort,
  BackupError,
} from "../application";
import {
  BibliotecaDatabase,
  BrowserStoragePersistence,
  CryptoIdGenerator,
  DATABASE_NAME,
  DexieActivityRepository,
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
  DexieTransactionRunner,
  DiagnosticsService,
  LocalEventBus,
  SCHEMA_MARKER_KEY,
  SystemClock,
  BrowserFileDelivery,
  DexieBackupSnapshotStore,
  JsonBackupCodec,
  DATABASE_VERSION,
  type DatabaseDiagnostics,
  type StoragePersistencePort,
  type StoragePersistenceStatus,
  BrowserPlatformCapabilities,
  type PlatformCapabilitiesPort,
  type PlatformCapabilitySnapshot,
} from "../infrastructure";
import packageMetadata from "../../package.json";

export interface ApplicationDiagnostics {
  inspect(): Promise<DatabaseDiagnostics>;
  requestPersistence(): Promise<StoragePersistenceStatus>;
}

export type ApplicationDiagnosticsSnapshot = DatabaseDiagnostics;

export interface ApplicationRuntime {
  readonly appVersion: string;
  readonly platform: PlatformCapabilitySnapshot;
  readonly backup: {
    readonly export: () => Promise<BackupArtifact>;
    readonly deliver: (artifact: BackupArtifact) => Promise<FileDeliveryResult>;
    readonly inspect: (content: string) => Promise<BackupSummary>;
    readonly import: (content: string) => Promise<BackupCounts>;
  };
  readonly commands: {
    readonly addNote: AddNote;
    readonly addQuote: AddQuote;
    readonly changeBookStatus: ChangeBookStatus;
    readonly createBookEntry: CreateBookEntry;
    readonly updateBookEntry: UpdateBookEntry;
    readonly updateBookProgress: UpdateBookProgress;
  };
  readonly queries: {
    readonly getBookEntry: GetBookEntry;
    readonly listAllNotes: ListAllNotes;
    readonly listAllQuotes: ListAllQuotes;
    readonly listBookEntries: ListBookEntries;
    readonly listNotesByBook: ListNotesByBook;
    readonly listQuotesByBook: ListQuotesByBook;
  };
  readonly diagnostics: ApplicationDiagnostics;
  readonly events: LocalEventBus;
  close(): void;
}

export interface CreateApplicationOptions {
  readonly databaseName?: string;
  readonly fileDelivery?: FileDeliveryPort;
  readonly platformCapabilities?: PlatformCapabilitiesPort;
  readonly storage?: StoragePersistencePort;
}

function unsafeContextError(): BackupError {
  return new BackupError(
    "PLATFORM_CAPABILITY_UNAVAILABLE",
    "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.",
  );
}

export async function createApplication(
  options: CreateApplicationOptions = {},
): Promise<ApplicationRuntime> {
  const platformCapabilities =
    options.platformCapabilities ?? new BrowserPlatformCapabilities();
  const platform = platformCapabilities.inspect();
  const database = new BibliotecaDatabase(
    options.databaseName ?? DATABASE_NAME,
  );
  await database.open();
  await database.metadata.put({
    key: SCHEMA_MARKER_KEY,
    value: "2",
    updatedAt: "1970-01-01T00:00:00.000Z",
  });

  const libraryEntries = new DexieLibraryEntryRepository(database);
  const notes = new DexieNoteRepository(database);
  const quotes = new DexieQuoteRepository(database);
  const activities = new DexieActivityRepository(database);
  const transaction = new DexieTransactionRunner(database);
  const clock = new SystemClock();
  const ids = new CryptoIdGenerator(platform);
  const events = new LocalEventBus();
  const storage = options.storage ?? new BrowserStoragePersistence();
  const snapshots = new DexieBackupSnapshotStore(database);
  const codec = new JsonBackupCodec();
  const files = options.fileDelivery ?? new BrowserFileDelivery();
  const exportBackup = new ExportBackup(
    snapshots,
    codec,
    clock,
    packageMetadata.version,
    DATABASE_VERSION,
  );
  const inspectBackup = new InspectBackup(codec);
  const importBackup = new ImportBackup(snapshots, codec, exportBackup, files);
  const diagnosticsService = new DiagnosticsService(database, storage);
  const dependencies = {
    activities,
    clock,
    events,
    ids,
    libraryEntries,
    notes,
    quotes,
    transaction,
  };

  return {
    appVersion: packageMetadata.version,
    platform,
    backup: {
      export: async () => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return exportBackup.execute();
      },
      deliver: async (artifact) => {
        try {
          return await files.deliver({
            name: artifact.fileName,
            content: artifact.content,
          });
        } catch {
          throw new BackupError(
            "BACKUP_DELIVERY_FAILED",
            "Não foi possível entregar o arquivo de backup.",
          );
        }
      },
      inspect: async (content) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return (await inspectBackup.execute(content)).summary;
      },
      import: async (content) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return importBackup.execute(content);
      },
    },
    commands: {
      addNote: new AddNote(dependencies),
      addQuote: new AddQuote(dependencies),
      changeBookStatus: new ChangeBookStatus(dependencies),
      createBookEntry: new CreateBookEntry(dependencies),
      updateBookEntry: new UpdateBookEntry(dependencies),
      updateBookProgress: new UpdateBookProgress(dependencies),
    },
    queries: {
      getBookEntry: new GetBookEntry(libraryEntries),
      listAllNotes: new ListAllNotes(notes),
      listAllQuotes: new ListAllQuotes(quotes),
      listBookEntries: new ListBookEntries(libraryEntries),
      listNotesByBook: new ListNotesByBook(notes),
      listQuotesByBook: new ListQuotesByBook(quotes),
    },
    diagnostics: {
      inspect: () => diagnosticsService.inspect(),
      requestPersistence: () => diagnosticsService.requestPersistence(),
    },
    events,
    close: () => database.close(),
  };
}
