import type {
  Activity,
  ActivityRepository,
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
  SessionRepository,
  TagRepository,
} from "../../application";
import type { LibraryEntry, Note, Quote, Session, Tag } from "../../domain";
import type { BibliotecaDatabase } from "./database";
import { InfrastructureError } from "./errors";
import {
  persistedActivitySchema,
  persistedLibraryEntrySchema,
  persistedNoteSchema,
  persistedQuoteSchema,
  persistedSessionSchema,
  persistedTagSchema,
  type PersistedActivity,
  type PersistedLibraryEntry,
  type PersistedNote,
  type PersistedQuote,
  type PersistedSession,
  type PersistedTag,
} from "./schema";

function readFailure(operation: string): InfrastructureError {
  return new InfrastructureError("DATABASE_READ_FAILED", operation);
}

function writeFailure(operation: string): InfrastructureError {
  return new InfrastructureError("DATABASE_WRITE_FAILED", operation);
}

function immutableEntry(value: unknown): LibraryEntry {
  const parsed = persistedLibraryEntrySchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_book");
  return Object.freeze({ ...parsed.data });
}

function immutableNote(value: unknown): Note {
  const parsed = persistedNoteSchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_note");
  return Object.freeze({ ...parsed.data });
}

function immutableQuote(value: unknown): Quote {
  const parsed = persistedQuoteSchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_quote");
  return Object.freeze({ ...parsed.data });
}

function immutableTag(value: unknown): Tag {
  const parsed = persistedTagSchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_tag");
  return Object.freeze({ ...parsed.data });
}

function immutableSession(value: unknown): Session {
  const parsed = persistedSessionSchema.safeParse(value);
  if (!parsed.success) throw readFailure("read_session");
  return Object.freeze({ ...parsed.data });
}

function chronological<
  T extends { readonly createdAt: string; readonly id: string },
>(values: readonly T[]): readonly T[] {
  return Object.freeze(
    [...values].sort(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id),
    ),
  );
}

export class DexieLibraryEntryRepository implements LibraryEntryRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async getById(id: string): Promise<LibraryEntry | undefined> {
    try {
      const stored: unknown = await this.database.libraryEntries.get(id);
      return stored === undefined ? undefined : immutableEntry(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_book");
    }
  }

  async list(): Promise<readonly LibraryEntry[]> {
    try {
      const stored: unknown[] = await this.database.libraryEntries.toArray();
      const books = stored
        .map(immutableEntry)
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

  async save(entry: LibraryEntry): Promise<void> {
    const parsed = persistedLibraryEntrySchema.safeParse(entry);
    if (!parsed.success) throw writeFailure("save_book");
    try {
      await this.database.libraryEntries.put({
        ...parsed.data,
      } satisfies PersistedLibraryEntry);
    } catch {
      throw writeFailure("save_book");
    }
  }
}

export class DexieNoteRepository implements NoteRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async delete(id: string): Promise<boolean> {
    try {
      if ((await this.database.notes.get(id)) === undefined) return false;
      await this.database.notes.delete(id);
      return true;
    } catch {
      throw writeFailure("delete_note");
    }
  }

  async getById(id: string): Promise<Note | undefined> {
    try {
      const stored: unknown = await this.database.notes.get(id);
      return stored === undefined ? undefined : immutableNote(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_note");
    }
  }

  async list(): Promise<readonly Note[]> {
    try {
      const stored: unknown[] = await this.database.notes.toArray();
      return Object.freeze(
        [...chronological(stored.map(immutableNote))].reverse(),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_all_notes");
    }
  }

  async listByEntryId(entryId: string): Promise<readonly Note[]> {
    try {
      const stored: unknown[] = await this.database.notes
        .where("entryId")
        .equals(entryId)
        .toArray();
      return chronological(stored.map(immutableNote));
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_notes_by_book");
    }
  }

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

  async delete(id: string): Promise<boolean> {
    try {
      if ((await this.database.quotes.get(id)) === undefined) return false;
      await this.database.quotes.delete(id);
      return true;
    } catch {
      throw writeFailure("delete_quote");
    }
  }

  async getById(id: string): Promise<Quote | undefined> {
    try {
      const stored: unknown = await this.database.quotes.get(id);
      return stored === undefined ? undefined : immutableQuote(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_quote");
    }
  }

  async list(): Promise<readonly Quote[]> {
    try {
      const stored: unknown[] = await this.database.quotes.toArray();
      return Object.freeze(
        [...chronological(stored.map(immutableQuote))].reverse(),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_all_quotes");
    }
  }

  async listByEntryId(entryId: string): Promise<readonly Quote[]> {
    try {
      const stored: unknown[] = await this.database.quotes
        .where("entryId")
        .equals(entryId)
        .toArray();
      return chronological(stored.map(immutableQuote));
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_quotes_by_book");
    }
  }

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

export class DexieTagRepository implements TagRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async delete(id: string): Promise<boolean> {
    try {
      if ((await this.database.tags.get(id)) === undefined) return false;
      await this.database.tags.delete(id);
      return true;
    } catch {
      throw writeFailure("delete_tag");
    }
  }

  async getById(id: string): Promise<Tag | undefined> {
    try {
      const stored: unknown = await this.database.tags.get(id);
      return stored === undefined ? undefined : immutableTag(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_tag");
    }
  }

  async getByNormalizedName(normalizedName: string): Promise<Tag | undefined> {
    try {
      const stored: unknown = await this.database.tags
        .where("normalizedName")
        .equals(normalizedName)
        .first();
      return stored === undefined ? undefined : immutableTag(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_tag_by_name");
    }
  }

  async list(): Promise<readonly Tag[]> {
    try {
      const stored: unknown[] = await this.database.tags.toArray();
      return Object.freeze(
        stored
          .map(immutableTag)
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_tags");
    }
  }

  async save(tag: Tag): Promise<void> {
    const parsed = persistedTagSchema.safeParse(tag);
    if (!parsed.success) throw writeFailure("save_tag");
    try {
      await this.database.tags.put({ ...parsed.data } satisfies PersistedTag);
    } catch {
      throw writeFailure("save_tag");
    }
  }
}

export class DexieSessionRepository implements SessionRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async delete(id: string): Promise<boolean> {
    try {
      if ((await this.database.sessions.get(id)) === undefined) return false;
      await this.database.sessions.delete(id);
      return true;
    } catch {
      throw writeFailure("delete_session");
    }
  }

  async getById(id: string): Promise<Session | undefined> {
    try {
      const stored: unknown = await this.database.sessions.get(id);
      return stored === undefined ? undefined : immutableSession(stored);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_session");
    }
  }

  async getOpen(): Promise<Session | undefined> {
    try {
      const stored: unknown[] = await this.database.sessions
        .where("status")
        .anyOf("active", "paused")
        .toArray();
      if (stored.length > 1) throw readFailure("multiple_open_sessions");
      return stored[0] === undefined ? undefined : immutableSession(stored[0]);
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("get_open_session");
    }
  }

  async list(): Promise<readonly Session[]> {
    try {
      const stored: unknown[] = await this.database.sessions.toArray();
      return Object.freeze(
        stored
          .map(immutableSession)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_sessions");
    }
  }

  async listByEntryId(entryId: string): Promise<readonly Session[]> {
    try {
      const stored: unknown[] = await this.database.sessions
        .where("entryId")
        .equals(entryId)
        .toArray();
      return Object.freeze(
        stored
          .map(immutableSession)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw readFailure("list_entry_sessions");
    }
  }

  async save(session: Session): Promise<void> {
    const parsed = persistedSessionSchema.safeParse(session);
    if (!parsed.success) throw writeFailure("save_session");
    try {
      await this.database.sessions.put({
        ...parsed.data,
      } satisfies PersistedSession);
    } catch {
      throw writeFailure("save_session");
    }
  }
}
