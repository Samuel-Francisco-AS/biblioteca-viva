import type { BibliotecaDatabase } from "./database";
import { DATABASE_VERSION } from "./schema";
import type {
  StoragePersistencePort,
  StoragePersistenceStatus,
} from "../platform/storagePersistence";

export interface DatabaseCounts {
  readonly activities: number;
  readonly libraryEntries: number;
  readonly metadata: number;
  readonly notes: number;
  readonly quotes: number;
  readonly settings: number;
}

export interface DatabaseDiagnostics {
  readonly databaseName: string;
  readonly databaseVersion: number;
  readonly isOpen: boolean;
  readonly persistence: StoragePersistenceStatus;
  readonly counts: DatabaseCounts;
  readonly lastFailure?: string;
}

const EMPTY_COUNTS: DatabaseCounts = {
  activities: 0,
  libraryEntries: 0,
  metadata: 0,
  notes: 0,
  quotes: 0,
  settings: 0,
};

export class DiagnosticsService {
  private lastFailure: string | undefined;

  constructor(
    private readonly database: BibliotecaDatabase,
    private readonly storage: StoragePersistencePort,
  ) {}

  async inspect(): Promise<DatabaseDiagnostics> {
    try {
      const counts = this.database.isOpen()
        ? {
            activities: await this.database.activities.count(),
            libraryEntries: await this.database.libraryEntries.count(),
            metadata: await this.database.metadata.count(),
            notes: await this.database.notes.count(),
            quotes: await this.database.quotes.count(),
            settings: await this.database.settings.count(),
          }
        : EMPTY_COUNTS;
      return {
        databaseName: this.database.name,
        databaseVersion: DATABASE_VERSION,
        isOpen: this.database.isOpen(),
        persistence: await this.storage.inspect(),
        counts,
        ...(this.lastFailure !== undefined && {
          lastFailure: this.lastFailure,
        }),
      };
    } catch {
      this.lastFailure = "Falha técnica ao consultar o diagnóstico.";
      return {
        databaseName: this.database.name,
        databaseVersion: DATABASE_VERSION,
        isOpen: this.database.isOpen(),
        persistence: "error",
        counts: EMPTY_COUNTS,
        lastFailure: this.lastFailure,
      };
    }
  }

  async requestPersistence(): Promise<StoragePersistenceStatus> {
    const status = await this.storage.request();
    if (status === "error") {
      this.lastFailure =
        "Falha técnica ao solicitar armazenamento persistente.";
    }
    return status;
  }
}
