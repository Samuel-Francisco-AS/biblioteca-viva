import type {
  Activity,
  ActivityRepository,
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
} from "../../application";
import type { BookEntry, Note, Quote } from "../../domain";
import type { BibliotecaDatabase } from "./database";
import { InfrastructureError } from "./errors";
import {
  persistedActivitySchema,
  persistedBookSchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  type PersistedActivity,
  type PersistedBook,
  type PersistedNote,
  type PersistedQuote,
} from "./schema";

function readFailure(operation: string): InfrastructureError {
  return new InfrastructureError("DATABASE_READ_FAILED", operation);
}

function writeFailure(operation: string): InfrastructureError {
  return new InfrastructureError("DATABASE_WRITE_FAILED", operation);
}

function immutableBook(value: unknown): BookEntry {
  const parsed = persistedBookSchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_book");
  return Object.freeze({ ...parsed.data });
}

export class DexieLibraryEntryRepository implements LibraryEntryRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async getById(id: string): Promise<BookEntry | undefined> {
    try {
      const stored: unknown = await this.database.libraryEntries.get(id);
      return stored === undefined ? undefined : immutableBook(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_book");
    }
  }

  async list(): Promise<readonly BookEntry[]> {
    try {
      const stored: unknown[] = await this.database.libraryEntries.toArray();
      const books = stored
        .map(immutableBook)
        .sort(
          (left, right) =>
            left.createdAt.localeCompare(right.createdAt) ||
            left.id.localeCompare(right.id),
        );
      return Object.freeze(books);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_books");
    }
  }

  async save(entry: BookEntry): Promise<void> {
    const parsed = persistedBookSchema.safeParse(entry);
    if (!parsed.success) throw writeFailure("save_book");
    try {
      await this.database.libraryEntries.put({
        ...parsed.data,
      } satisfies PersistedBook);
    } catch {
      throw writeFailure("save_book");
    }
  }
}

export class DexieNoteRepository implements NoteRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async save(note: Note): Promise<void> {
    const parsed = persistedNoteSchema.safeParse(note);
    if (!parsed.success) throw writeFailure("save_note");
    try {
      await this.database.notes.put({ ...parsed.data } satisfies PersistedNote);
    } catch {
      throw writeFailure("save_note");
    }
  }
}

export class DexieQuoteRepository implements QuoteRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async save(quote: Quote): Promise<void> {
    const parsed = persistedQuoteSchema.safeParse(quote);
    if (!parsed.success) throw writeFailure("save_quote");
    try {
      await this.database.quotes.put({
        ...parsed.data,
      } satisfies PersistedQuote);
    } catch {
      throw writeFailure("save_quote");
    }
  }
}

export class DexieActivityRepository implements ActivityRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async save(activity: Activity): Promise<void> {
    const parsed = persistedActivitySchema.safeParse(activity);
    if (!parsed.success) throw writeFailure("save_activity");
    try {
      await this.database.activities.put(
        parsed.data satisfies PersistedActivity,
      );
    } catch {
      throw writeFailure("save_activity");
    }
  }
}
