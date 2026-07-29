import {
  AddNote,
  AddQuote,
  ChangeBookStatus,
  CreateBookEntry,
  GetBookEntry,
  ListBookEntries,
  UpdateBookEntry,
  UpdateBookProgress,
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
  type DatabaseDiagnostics,
  type StoragePersistencePort,
  type StoragePersistenceStatus,
} from "../infrastructure";

export interface ApplicationDiagnostics {
  createDiagnosticBook(): Promise<void>;
  inspect(): Promise<DatabaseDiagnostics>;
  requestPersistence(): Promise<StoragePersistenceStatus>;
}

export type ApplicationDiagnosticsSnapshot = DatabaseDiagnostics;

export interface ApplicationRuntime {
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
    readonly listBookEntries: ListBookEntries;
  };
  readonly diagnostics: ApplicationDiagnostics;
  readonly events: LocalEventBus;
  close(): void;
}

export interface CreateApplicationOptions {
  readonly databaseName?: string;
  readonly storage?: StoragePersistencePort;
}

export async function createApplication(
  options: CreateApplicationOptions = {},
): Promise<ApplicationRuntime> {
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
  const ids = new CryptoIdGenerator();
  const events = new LocalEventBus();
  const storage = options.storage ?? new BrowserStoragePersistence();
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

  const createBookEntry = new CreateBookEntry(dependencies);
  return {
    commands: {
      addNote: new AddNote(dependencies),
      addQuote: new AddQuote(dependencies),
      changeBookStatus: new ChangeBookStatus(dependencies),
      createBookEntry,
      updateBookEntry: new UpdateBookEntry(dependencies),
      updateBookProgress: new UpdateBookProgress(dependencies),
    },
    queries: {
      getBookEntry: new GetBookEntry(libraryEntries),
      listBookEntries: new ListBookEntries(libraryEntries),
    },
    diagnostics: {
      async createDiagnosticBook(): Promise<void> {
        await createBookEntry.execute({ title: "Livro de diagnóstico" });
      },
      inspect: () => diagnosticsService.inspect(),
      requestPersistence: () => diagnosticsService.requestPersistence(),
    },
    events,
    close: () => database.close(),
  };
}
