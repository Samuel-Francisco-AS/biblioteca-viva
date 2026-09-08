import {
  AddNote,
  AddQuote,
  BackupError,
  BackupFileError,
  ChangeBookStatus,
  ChangeLibraryEntryStatus,
  CompleteSession,
  CreateBookEntry,
  CreateLibraryEntry,
  CreateManualSession,
  CreateTag,
  DeleteBookEntry,
  DeleteLibraryEntry,
  DeleteNote,
  DeleteQuote,
  DeleteSession,
  DeleteTag,
  EditSession,
  ExperiencePreferencesService,
  ExportBackup,
  GetBookEntry,
  GetLibraryEntry,
  GetOpenSession,
  GetStatistics,
  ImportBackup,
  InspectBackup,
  ListAllNotes,
  ListAllQuotes,
  ListBookEntries,
  ListLibraryEntries,
  ListMilestones,
  ListNotesByBook,
  ListNotesByEntry,
  ListQuotesByBook,
  ListQuotesByEntry,
  ListSessions,
  ListSessionsByEntry,
  ListTags,
  OrganizeLibraryEntry,
  OrganizeNote,
  OrganizeQuote,
  PauseSession,
  RenameTag,
  ResumeSession,
  ShareNote,
  ShareQuote,
  StartSession,
  UpdateBookEntry,
  UpdateBookProgress,
  UpdateLibraryEntry,
  UpdateLibraryEntryProgress,
  UpdateNote,
  UpdateQuote,
  type AnnotationSharePort,
  type AudioPort,
  type BackupArtifact,
  type BackupCounts,
  type BackupFileSavePort,
  type BackupFileSharePort,
  type ExperienceErrorReporter,
  type ExperiencePreferencesPort,
  type ExperienceSettingsPort,
  type RestoreInspection,
  type RestoreProtection,
  type SaveBackupResult,
  type ShareBackupResult,
} from "../application";
import {
  MILESTONE_ID,
  MilestoneEngine,
  PRODUCT_MILESTONE_DEFINITIONS,
} from "../domain";
import {
  AudioService,
  BibliotecaDatabase,
  BrowserAudioBackend,
  BrowserPlatformCapabilities,
  BrowserStoragePersistence,
  CryptoIdGenerator,
  DATABASE_NAME,
  DATABASE_VERSION,
  DexieActivityRepository,
  DexieAudioSettingsRepository,
  DexieBackupSnapshotStore,
  DexieBookDeletionStore,
  DexieExperienceSettingsRepository,
  DexieLibraryEntryDeletionStore,
  DexieLibraryEntryRepository,
  DexieMilestoneStore,
  DexieNoteRepository,
  DexieQuoteRepository,
  DexieSessionRepository,
  DexieTagRepository,
  DexieTransactionRunner,
  DiagnosticsService,
  JsonBackupCodec,
  LocalEventBus,
  PlatformAnnotationShare,
  SCHEMA_MARKER_KEY,
  SystemClock,
  consoleAudioErrorReporter,
  consoleExperienceErrorReporter,
  createPlatformBackupFiles,
  type AudioBackend,
  type AudioErrorReporter,
  type DatabaseDiagnostics,
  type PlatformCapabilitiesPort,
  type PlatformCapabilitySnapshot,
  type StoragePersistencePort,
  type StoragePersistenceStatus,
} from "../infrastructure";
import packageMetadata from "../../package.json";
import { measureStartupPhase, startupNow } from "../startupPerformance";

export interface ApplicationDiagnostics {
  inspect(): Promise<DatabaseDiagnostics>;
  requestPersistence(): Promise<StoragePersistenceStatus>;
}

export type ApplicationDiagnosticsSnapshot = DatabaseDiagnostics;

export interface ApplicationRuntime {
  readonly appVersion: string;
  readonly audio: AudioPort;
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
    readonly changeLibraryEntryStatus: ChangeLibraryEntryStatus;
    readonly completeSession: CompleteSession;
    readonly createBookEntry: CreateBookEntry;
    readonly createLibraryEntry: CreateLibraryEntry;
    readonly createManualSession: CreateManualSession;
    readonly createTag: CreateTag;
    readonly deleteBookEntry: DeleteBookEntry;
    readonly deleteLibraryEntry: DeleteLibraryEntry;
    readonly deleteNote: DeleteNote;
    readonly deleteQuote: DeleteQuote;
    readonly deleteSession: DeleteSession;
    readonly deleteTag: DeleteTag;
    readonly editSession: EditSession;
    readonly organizeLibraryEntry: OrganizeLibraryEntry;
    readonly organizeNote: OrganizeNote;
    readonly organizeQuote: OrganizeQuote;
    readonly pauseSession: PauseSession;
    readonly renameTag: RenameTag;
    readonly resumeSession: ResumeSession;
    readonly shareNote: ShareNote;
    readonly shareQuote: ShareQuote;
    readonly startSession: StartSession;
    readonly updateBookEntry: UpdateBookEntry;
    readonly updateBookProgress: UpdateBookProgress;
    readonly updateLibraryEntry: UpdateLibraryEntry;
    readonly updateLibraryEntryProgress: UpdateLibraryEntryProgress;
    readonly updateNote: UpdateNote;
    readonly updateQuote: UpdateQuote;
  };
  readonly queries: {
    readonly getBookEntry: GetBookEntry;
    readonly getLibraryEntry: GetLibraryEntry;
    readonly getOpenSession: GetOpenSession;
    readonly getStatistics: GetStatistics;
    readonly listAllNotes: ListAllNotes;
    readonly listAllQuotes: ListAllQuotes;
    readonly listBookEntries: ListBookEntries;
    readonly listLibraryEntries: ListLibraryEntries;
    readonly listMilestones: ListMilestones;
    readonly listNotesByBook: ListNotesByBook;
    readonly listNotesByEntry: ListNotesByEntry;
    readonly listQuotesByBook: ListQuotesByBook;
    readonly listQuotesByEntry: ListQuotesByEntry;
    readonly listSessions: ListSessions;
    readonly listSessionsByEntry: ListSessionsByEntry;
    readonly listTags: ListTags;
  };
  readonly diagnostics: ApplicationDiagnostics;
  readonly events: LocalEventBus;
  close(): void;
}

export interface CreateApplicationOptions {
  readonly annotationShare?: AnnotationSharePort;
  readonly audioBackend?: AudioBackend;
  readonly audioReporter?: AudioErrorReporter;
  readonly backupFileSave?: BackupFileSavePort;
  readonly backupFileShare?: BackupFileSharePort;
  readonly databaseName?: string;
  readonly experienceReporter?: ExperienceErrorReporter;
  readonly experienceSettings?: ExperienceSettingsPort;
  readonly nativeSaveAvailable?: boolean;
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
  const dexieBootstrapStartedAt = startupNow();
  const platform = (
    options.platformCapabilities ?? new BrowserPlatformCapabilities()
  ).inspect();
  const database = new BibliotecaDatabase(
    options.databaseName ?? DATABASE_NAME,
  );
  await database.open();
  await database.metadata.put({
    key: SCHEMA_MARKER_KEY,
    value: String(DATABASE_VERSION),
    updatedAt: "1970-01-01T00:00:00.000Z",
  });

  const libraryEntries = new DexieLibraryEntryRepository(database);
  const notes = new DexieNoteRepository(database);
  const quotes = new DexieQuoteRepository(database);
  const activities = new DexieActivityRepository(database);
  const sessions = new DexieSessionRepository(database);
  const tags = new DexieTagRepository(database);
  const clock = new SystemClock();
  const events = new LocalEventBus();
  const milestones = new DexieMilestoneStore(
    database,
    new MilestoneEngine(),
    PRODUCT_MILESTONE_DEFINITIONS,
  );
  const dependencies = {
    activities,
    clock,
    events,
    ids: new CryptoIdGenerator(platform),
    libraryEntries,
    milestones,
    notes,
    quotes,
    sessions,
    tags,
    transaction: new DexieTransactionRunner(database),
  };

  const audioReporter = options.audioReporter ?? consoleAudioErrorReporter;
  const audio = new AudioService(
    options.audioBackend ?? new BrowserAudioBackend(audioReporter),
    new DexieAudioSettingsRepository(database, clock),
    audioReporter,
  );
  await audio.loadPreferences();
  events.subscribe("MilestoneReached", (event) => {
    if (
      event.type === "MilestoneReached" &&
      event.payload.milestoneId === MILESTONE_ID.firstCompletedBook
    )
      audio.emit({ type: "BookCompleted" });
  });
  const experience = new ExperiencePreferencesService(
    options.experienceSettings ??
      new DexieExperienceSettingsRepository(database, clock),
    options.experienceReporter ?? consoleExperienceErrorReporter,
  );
  await experience.loadPreferences();
  measureStartupPhase("dexie-bootstrap", dexieBootstrapStartedAt);

  const snapshots = new DexieBackupSnapshotStore(database);
  const codec = new JsonBackupCodec();
  const platformFiles = createPlatformBackupFiles();
  const fileSave = options.backupFileSave ?? platformFiles.save;
  const fileShare = options.backupFileShare ?? platformFiles.share;
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
  const diagnosticsService = new DiagnosticsService(
    database,
    options.storage ?? new BrowserStoragePersistence(),
  );
  const annotationShare =
    options.annotationShare ?? new PlatformAnnotationShare();

  return {
    appVersion: packageMetadata.version,
    audio,
    experience,
    platform,
    backup: {
      nativeSaveAvailable:
        options.nativeSaveAvailable ?? platformFiles.isNativeAndroid,
      export: async () => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return await exportBackup.execute();
      },
      saveBackupFile: async (artifact) => {
        if (!fileSave)
          throw new BackupError(
            "PLATFORM_CAPABILITY_UNAVAILABLE",
            "O salvamento direto não está disponível nesta plataforma.",
          );
        try {
          return await fileSave.saveBackupFile({
            name: artifact.fileName,
            content: artifact.content,
          });
        } catch (error: unknown) {
          if (error instanceof BackupFileError)
            throw new BackupError(
              error.code === "DOCUMENT_PICKER_FAILED"
                ? "BACKUP_DOCUMENT_PICKER_FAILED"
                : "BACKUP_DOCUMENT_WRITE_FAILED",
              "Não foi possível salvar o arquivo de backup.",
            );
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
          if (error instanceof BackupFileError)
            throw new BackupError(
              error.code === "TEMPORARY_WRITE_FAILED"
                ? "BACKUP_TEMPORARY_WRITE_FAILED"
                : "BACKUP_SHARE_FAILED",
              error.code === "TEMPORARY_WRITE_FAILED"
                ? "Não foi possível preparar o arquivo temporário de backup."
                : "Não foi possível abrir o compartilhamento do backup.",
            );
          throw new BackupError(
            "BACKUP_DELIVERY_FAILED",
            "Não foi possível entregar o arquivo de backup.",
          );
        }
      },
      inspect: (content) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return inspectBackup.execute(content);
      },
      import: (content, protection) => {
        if (!platform.backupIntegrity) throw unsafeContextError();
        return importBackup.execute(content, protection);
      },
    },
    commands: {
      addNote: new AddNote(dependencies),
      addQuote: new AddQuote(dependencies),
      changeBookStatus: new ChangeBookStatus(dependencies),
      changeLibraryEntryStatus: new ChangeLibraryEntryStatus(dependencies),
      completeSession: new CompleteSession(dependencies),
      createBookEntry: new CreateBookEntry(dependencies),
      createLibraryEntry: new CreateLibraryEntry(dependencies),
      createManualSession: new CreateManualSession(dependencies),
      createTag: new CreateTag(dependencies),
      deleteBookEntry: new DeleteBookEntry(
        new DexieBookDeletionStore(database),
      ),
      deleteLibraryEntry: new DeleteLibraryEntry(
        new DexieLibraryEntryDeletionStore(database),
      ),
      deleteNote: new DeleteNote(dependencies),
      deleteQuote: new DeleteQuote(dependencies),
      deleteSession: new DeleteSession(dependencies),
      deleteTag: new DeleteTag(dependencies),
      editSession: new EditSession(dependencies),
      organizeLibraryEntry: new OrganizeLibraryEntry(dependencies),
      organizeNote: new OrganizeNote(dependencies),
      organizeQuote: new OrganizeQuote(dependencies),
      pauseSession: new PauseSession(dependencies),
      renameTag: new RenameTag(dependencies),
      resumeSession: new ResumeSession(dependencies),
      shareNote: new ShareNote(notes, libraryEntries, annotationShare),
      shareQuote: new ShareQuote(quotes, libraryEntries, annotationShare),
      startSession: new StartSession(dependencies),
      updateBookEntry: new UpdateBookEntry(dependencies),
      updateBookProgress: new UpdateBookProgress(dependencies),
      updateLibraryEntry: new UpdateLibraryEntry(dependencies),
      updateLibraryEntryProgress: new UpdateLibraryEntryProgress(dependencies),
      updateNote: new UpdateNote(dependencies),
      updateQuote: new UpdateQuote(dependencies),
    },
    queries: {
      getBookEntry: new GetBookEntry(libraryEntries),
      getLibraryEntry: new GetLibraryEntry(libraryEntries),
      getOpenSession: new GetOpenSession(sessions),
      getStatistics: new GetStatistics({
        activities,
        clock,
        libraryEntries,
        sessions,
      }),
      listAllNotes: new ListAllNotes(notes),
      listAllQuotes: new ListAllQuotes(quotes),
      listBookEntries: new ListBookEntries(libraryEntries),
      listLibraryEntries: new ListLibraryEntries(libraryEntries),
      listMilestones: new ListMilestones(milestones),
      listNotesByBook: new ListNotesByBook(notes),
      listNotesByEntry: new ListNotesByEntry(notes),
      listQuotesByBook: new ListQuotesByBook(quotes),
      listQuotesByEntry: new ListQuotesByEntry(quotes),
      listSessions: new ListSessions(sessions),
      listSessionsByEntry: new ListSessionsByEntry(sessions),
      listTags: new ListTags(tags),
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
