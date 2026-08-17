import type { BookEntry, LibraryEntry, Note, Quote } from "../domain";
import { ApplicationError, notFound, toValidationError } from "./errors";
import type {
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
} from "./ports";
import { libraryEntryIdSchema } from "./schemas";

export class GetLibraryEntry {
  constructor(private readonly repository: LibraryEntryRepository) {}

  async execute(input: unknown): Promise<LibraryEntry> {
    let id: string;
    try {
      id = libraryEntryIdSchema.parse(input).id;
    } catch (error: unknown) {
      throw toValidationError(error);
    }
    let entry: LibraryEntry | undefined;
    try {
      entry = await this.repository.getById(id);
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar os dados.",
        { operation: "get_entry" },
      );
    }
    if (entry === undefined) throw notFound();
    return entry;
  }
}

export class ListLibraryEntries {
  constructor(private readonly repository: LibraryEntryRepository) {}

  async execute(): Promise<readonly LibraryEntry[]> {
    try {
      const entries = await this.repository.list();
      return Object.freeze([...entries]);
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar os dados.",
        { operation: "list_entries" },
      );
    }
  }
}

export class GetBookEntry {
  private readonly generic: GetLibraryEntry;

  constructor(repository: LibraryEntryRepository) {
    this.generic = new GetLibraryEntry(repository);
  }

  async execute(input: unknown): Promise<BookEntry> {
    const entry = await this.generic.execute(input);
    if (entry.type !== "book") throw notFound();
    return entry;
  }
}

export class ListBookEntries {
  private readonly generic: ListLibraryEntries;

  constructor(repository: LibraryEntryRepository) {
    this.generic = new ListLibraryEntries(repository);
  }

  async execute(): Promise<readonly BookEntry[]> {
    const entries = await this.generic.execute();
    return Object.freeze(entries.filter((entry) => entry.type === "book"));
  }
}

async function listAnnotations<T>(
  input: unknown,
  operation: string,
  list: (entryId: string) => Promise<readonly T[]>,
): Promise<readonly T[]> {
  let entryId: string;
  try {
    entryId = libraryEntryIdSchema.parse(input).id;
  } catch (error: unknown) {
    throw toValidationError(error);
  }
  try {
    return Object.freeze([...(await list(entryId))]);
  } catch {
    throw new ApplicationError(
      "PERSISTENCE_FAILED",
      "Não foi possível consultar os dados.",
      { operation },
    );
  }
}

export class ListNotesByEntry {
  constructor(private readonly repository: NoteRepository) {}

  execute(input: unknown): Promise<readonly Note[]> {
    return listAnnotations(input, "list_notes_by_entry", (entryId) =>
      this.repository.listByEntryId(entryId),
    );
  }
}

export class ListQuotesByEntry {
  constructor(private readonly repository: QuoteRepository) {}

  execute(input: unknown): Promise<readonly Quote[]> {
    return listAnnotations(input, "list_quotes_by_entry", (entryId) =>
      this.repository.listByEntryId(entryId),
    );
  }
}

export class ListNotesByBook extends ListNotesByEntry {}
export class ListQuotesByBook extends ListQuotesByEntry {}

async function listAllAnnotations<T>(
  operation: string,
  list: () => Promise<readonly T[]>,
): Promise<readonly T[]> {
  try {
    return Object.freeze([...(await list())]);
  } catch {
    throw new ApplicationError(
      "PERSISTENCE_FAILED",
      "Não foi possível consultar os dados.",
      { operation },
    );
  }
}

export class ListAllNotes {
  constructor(private readonly repository: NoteRepository) {}

  execute(): Promise<readonly Note[]> {
    return listAllAnnotations("list_all_notes", () => this.repository.list());
  }
}

export class ListAllQuotes {
  constructor(private readonly repository: QuoteRepository) {}

  execute(): Promise<readonly Quote[]> {
    return listAllAnnotations("list_all_quotes", () => this.repository.list());
  }
}
