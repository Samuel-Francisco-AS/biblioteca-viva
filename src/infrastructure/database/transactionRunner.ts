import type { ApplicationTransactionRunner } from "../../application";
import type { BibliotecaDatabase } from "./database";

export class DexieTransactionRunner implements ApplicationTransactionRunner {
  constructor(private readonly database: BibliotecaDatabase) {}

  run<T>(operation: () => Promise<T>): Promise<T> {
    return this.database.transaction(
      "rw",
      [
        this.database.libraryEntries,
        this.database.notes,
        this.database.quotes,
        this.database.activities,
        this.database.milestones,
        this.database.tags,
        this.database.sessions,
      ],
      operation,
    );
  }
}
