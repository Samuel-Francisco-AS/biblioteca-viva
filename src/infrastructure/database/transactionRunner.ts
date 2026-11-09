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
        this.database.arcanariumCards,
        this.database.arcanariumVersions,
        this.database.arcanariumDecks,
        this.database.studyCardLinks,
        this.database.knowledgeTags,
        this.database.cardSessions,
        this.database.cardMedia,
        this.database.educationalPacks,
      ],
      operation,
    );
  }
}
