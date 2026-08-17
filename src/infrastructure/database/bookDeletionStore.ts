import type {
  BookDeletionStore,
  LibraryEntryDeletionStore,
} from "../../application";
import type { BibliotecaDatabase } from "./database";
import { InfrastructureError } from "./errors";

export class DexieLibraryEntryDeletionStore implements LibraryEntryDeletionStore {
  constructor(private readonly database: BibliotecaDatabase) {}

  async deleteLibraryEntry(id: string): Promise<"deleted" | "not-found"> {
    try {
      return await this.database.transaction(
        "rw",
        [
          this.database.libraryEntries,
          this.database.notes,
          this.database.quotes,
          this.database.activities,
        ],
        async () => {
          const existing = await this.database.libraryEntries.get(id);
          if (existing === undefined) return "not-found";

          await this.database.libraryEntries.delete(id);
          await this.database.notes.where("entryId").equals(id).delete();
          await this.database.quotes.where("entryId").equals(id).delete();
          await this.database.activities
            .where("aggregateId")
            .equals(id)
            .delete();
          return "deleted";
        },
      );
    } catch {
      throw new InfrastructureError("DATABASE_WRITE_FAILED", "delete_entry");
    }
  }
}

export class DexieBookDeletionStore implements BookDeletionStore {
  private readonly generic: DexieLibraryEntryDeletionStore;

  constructor(database: BibliotecaDatabase) {
    this.generic = new DexieLibraryEntryDeletionStore(database);
  }

  deleteBookEntry(id: string): Promise<"deleted" | "not-found"> {
    return this.generic.deleteLibraryEntry(id);
  }
}
