import {
  AddNote,
  AddQuote,
  DeleteNote,
  DeleteQuote,
  ShareNote,
  ShareQuote,
  UpdateNote,
  UpdateQuote,
  DeleteBookEntry,
  ChangeBookStatus,
  CreateBookEntry,
  GetBookEntry,
  ListAllNotes,
  ListAllQuotes,
  ListBookEntries,
  ListNotesByBook,
  ListQuotesByBook,
  ListMilestones,
  UpdateBookEntry,
  UpdateBookProgress,
  ExportBackup,
  ImportBackup,
  InspectBackup,
  type BackupArtifact,
  type BackupCounts,
  type RestoreInspection,
  type RestoreProtection,
  type BackupFileSavePort,
  type BackupFileSharePort,
  type SaveBackupResult,
  type ShareBackupResult,
  BackupFileError,
  BackupError,
  type AudioPort,
  type DialogueErrorReporter,
  type DialogueHistoryPort,
  type DialoguePort,
  DialogueSelector,
  DialogueService,
  ExperiencePreferencesService,
  type ExperienceErrorReporter,
  type ExperiencePreferencesPort,
  type ExperienceSettingsPort,
  type AnnotationSharePort,
} from "../application";
import { MILESTONE_ID, MilestoneEngine } from "../domain";
import { ContentLocalizer, PROTOTYPE_CONTENT } from "../content";
import {
  BibliotecaDatabase,
  BrowserStoragePersistence,
  CryptoIdGenerator,
  DATABASE_NAME,
  DexieActivityRepository,
  DexieBookDeletionStore,
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
  DexieTransactionRunner,
  DexieMilestoneStore,
  DiagnosticsService,
  LocalEventBus,
  SCHEMA_MARKER_KEY,
  SystemClock,
  createPlatformBackupFiles,
  DexieBackupSnapshotStore,
  JsonBackupCodec,
  DATABASE_VERSION,
  type DatabaseDiagnostics,
  type StoragePersistencePort,
  type StoragePersistenceStatus,
  BrowserPlatformCapabilities,
  AudioService,
  BrowserAudioBackend,
  DexieAudioSettingsRepository,
  consoleAudioErrorReporter,
  type AudioBackend,
  type AudioErrorReporter,
  consoleDialogueErrorReporter,
  DexieDialogueHistoryRepository,
  type PlatformCapabilitiesPort,
  type PlatformCapabilitySnapshot,
  consoleExperienceErrorReporter,
  DexieExperienceSettingsRepository,
  PlatformAnnotationShare,
} from "../infrastructure";
import packageMetadata from "../../package.json";

export interface ApplicationDiagnostics {
  inspect(): Promise<DatabaseDiagnostics>;
  requestPersistence(): Promise<StoragePersistenceStatus>;
}

export type ApplicationDiagnosticsSnapshot = DatabaseDiagnostics;

export interface ApplicationRuntime {
  readonly appVersion: string;
  readonly audio: AudioPort;
  readonly dialogue: DialoguePort;
  readonly experience: ExperiencePreferencesPort;
  readonly platform: PlatformCapabilitySnapshot;
  readonly backup: {
    readonly nativeSaveAvailable: boolean;
    readonly export: () => Promise<BackupArtifact>;
    readonly saveBackupFile: (
      artifact: BackupArtifact,
    ) => Promise<SaveBackupResult>;
    readonly shareBackupFile: (
      artifact: BackupArtifact,
    ) => Promise<ShareBackupResult>;
    readonly inspect: (content: string) => Promise<RestoreInspection>;
    readonly import: (
      content: string,
      protection: RestoreProtection,
    ) => Promise<BackupCounts>;
  };
  readonly commands: {
    readonly addNote: AddNote;
    readonly addQuote: AddQuote;
    readonly changeBookStatus: ChangeBookStatus;
    readonly createBookEntry: CreateBookEntry;
    readonly deleteBookEntry: DeleteBookEntry;
    readonly deleteNote: DeleteNote;
    readonly deleteQuote: DeleteQuote;
    readonly shareNote: ShareNote;
    readonly shareQuote: ShareQuote;
    readonly updateNote: UpdateNote;
    readonly updateQuote: UpdateQuote;
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
    readonly listMilestones: ListMilestones;
  };
  readonly diagnostics: ApplicationDiagnostics;
  readonly events: LocalEventBus;
  close(): void;
}

export interface CreateApplicationOptions {
  readonly audioBackend?: AudioBackend;
  readonly audioReporter?: AudioErrorReporter;
  readonly dialogueHistory?: DialogueHistoryPort;
  readonly dialogueReporter?: DialogueErrorReporter;
  readonly experienceReporter?: ExperienceErrorReporter;
  readonly experienceSettings?: ExperienceSettingsPort;
  readonly databaseName?: string;
  readonly backupFileSave?: BackupFileSavePort;
  readonly backupFileShare?: BackupFileSharePort;
  readonly nativeSaveAvailable?: boolean;
  readonly platformCapabilities?: PlatformCapabilitiesPort;
  readonly storage?: StoragePersistencePort;
  readonly annotationShare?: AnnotationSharePort;
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
    value: "3",
    updatedAt: "1970-01-01T00:00:00.000Z",
  });

  const libraryEntries = new DexieLibraryEntryRepository(database);
  const notes = new DexieNoteRepository(database);
  const quotes = new DexieQuoteRepository(database);
  const activities = new DexieActivityRepository(database);
  const bookDeletion = new DexieBookDeletionStore(database);
  const transaction = new DexieTransactionRunner(database);
  const milestoneStore = new DexieMilestoneStore(
    database,
    new MilestoneEngine(),
    PROTOTYPE_CONTENT.milestones,
    PROTOTYPE_CONTENT.rewards,
  );
  const clock = new SystemClock();
  const ids = new CryptoIdGenerator(platform);
  const events = new LocalEventBus();
  const audioReporter = options.audioReporter ?? consoleAudioErrorReporter;
  const audio = new AudioService(
    options.audioBackend ?? new BrowserAudioBackend(audioReporter),
    new DexieAudioSettingsRepository(database, clock),
    audioReporter,
  );
  await audio.loadPreferences();
  const dialogueReporter =
    options.dialogueReporter ?? consoleDialogueErrorReporter;
  const dialogue = new DialogueService(
    PROTOTYPE_CONTENT,
    new DialogueSelector(),
    new ContentLocalizer(PROTOTYPE_CONTENT),
    options.dialogueHistory ??
      new DexieDialogueHistoryRepository(database, clock),
    clock,
    dialogueReporter,
  );
  await dialogue.loadHistory();
  const experience = new ExperiencePreferencesService(
    options.experienceSettings ??
      new DexieExperienceSettingsRepository(database, clock),
    options.experienceReporter ?? consoleExperienceErrorReporter,
  );
  await experience.loadPreferences();
  events.subscribe("MilestoneReached", (event) => {
    if (event.type !== "MilestoneReached") return;
    if (event.payload.milestoneId === MILESTONE_ID.firstCompletedBook)
      audio.emit({ type: "BookCompleted" });
  });
  const storage = options.storage ?? new BrowserStoragePersistence();
  const snapshots = new DexieBackupSnapshotStore(database);
  const codec = new JsonBackupCodec();
  const platformFiles = createPlatformBackupFiles();
  const fileSave = options.backupFileSave ?? platformFiles.save;
  const fileShare = options.backupFileShare ?? platformFiles.share;
  const nativeSaveAvailable =
    options.nativeSaveAvailable ?? platformFiles.isNativeAndroid;
  const exportBackup = new ExportBackup(
    snapshots,
    codec,
    clock,
    packageMetadata.version,
    DATABASE_VERSION,
  );
  const inspectBackup = new InspectBackup(codec, snapshots);
  const importBackup = new ImportBackup(
    snapshots,
    codec,
    exportBackup,
    fileShare,
  );
  const diagnosticsService = new DiagnosticsService(database, storage);
  const dependencies = {
    activities,
    clock,
    events,
    ids,
    libraryEntries,
    milestones: milestoneStore,
    notes,
    quotes,
    transaction,
  };
  const annotationShare =
    options.annotationShare ?? new PlatformAnnotationShare();

  return {
    appVersion: packageMetadata.version,
    audio,
    dialogue,
    experience,
    platform,
    backup: {
      nativeSaveAvailable,
      export: async () => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return exportBackup.execute();
      },
      saveBackupFile: async (artifact) => {
        if (!fileSave) {
          throw new BackupError(
            "PLATFORM_CAPABILITY_UNAVAILABLE",
            "O salvamento direto não está disponível nesta plataforma.",
          );
        }
        try {
          return await fileSave.saveBackupFile({
            name: artifact.fileName,
            content: artifact.content,
          });
        } catch (error: unknown) {
          if (error instanceof BackupFileError) {
            throw new BackupError(
              error.code === "DOCUMENT_PICKER_FAILED"
                ? "BACKUP_DOCUMENT_PICKER_FAILED"
                : "BACKUP_DOCUMENT_WRITE_FAILED",
              "Não foi possível salvar o arquivo de backup.",
            );
          }
          throw new BackupError(
            "BACKUP_DOCUMENT_WRITE_FAILED",
            "Não foi possível salvar o arquivo de backup.",
          );
        }
      },
      shareBackupFile: async (artifact) => {
        try {
          return await fileShare.shareBackupFile({
            name: artifact.fileName,
            content: artifact.content,
          });
        } catch (error: unknown) {
          if (error instanceof BackupFileError) {
            throw new BackupError(
              error.code === "TEMPORARY_WRITE_FAILED"
                ? "BACKUP_TEMPORARY_WRITE_FAILED"
                : "BACKUP_SHARE_FAILED",
              error.code === "TEMPORARY_WRITE_FAILED"
                ? "Não foi possível preparar o arquivo temporário de backup."
                : "Não foi possível abrir o compartilhamento do backup.",
            );
          }
          throw new BackupError(
            "BACKUP_DELIVERY_FAILED",
            "Não foi possível entregar o arquivo de backup.",
          );
        }
      },
      inspect: async (content) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return inspectBackup.execute(content);
      },
      import: async (content, protection) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return importBackup.execute(content, protection);
      },
    },
    commands: {
      addNote: new AddNote(dependencies),
      addQuote: new AddQuote(dependencies),
      changeBookStatus: new ChangeBookStatus(dependencies),
      createBookEntry: new CreateBookEntry(dependencies),
      deleteBookEntry: new DeleteBookEntry(bookDeletion),
      deleteNote: new DeleteNote(dependencies),
      deleteQuote: new DeleteQuote(dependencies),
      shareNote: new ShareNote(notes, libraryEntries, annotationShare),
      shareQuote: new ShareQuote(quotes, libraryEntries, annotationShare),
      updateNote: new UpdateNote(dependencies),
      updateQuote: new UpdateQuote(dependencies),
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
      listMilestones: new ListMilestones(milestoneStore),
    },
    diagnostics: {
      inspect: () => diagnosticsService.inspect(),
      requestPersistence: () => diagnosticsService.requestPersistence(),
    },
    events,
    close: () => {
      audio.dispose();
      database.close();
    },
  };
}
