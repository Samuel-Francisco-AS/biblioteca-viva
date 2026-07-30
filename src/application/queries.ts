import type { BookEntry, Note, Quote } from "../domain";
import { ApplicationError, notFound, toValidationError } from "./errors";
import type {
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
} from "./ports";
import { bookIdSchema } from "./schemas";

export class GetBookEntry {
  constructor(private readonly repository: LibraryEntryRepository) {}

  async execute(input: unknown): Promise<BookEntry> {
    let id: string;
    try {
      id = bookIdSchema.parse(input).id;
    } catch (error: unknown) {
      throw toValidationError(error);
    }
    let book: BookEntry | undefined;
    try {
      book = await this.repository.getById(id);
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar os dados.",
        { operation: "get_book" },
      );
    }
    if (book === undefined) throw notFound();
    return book;
  }
}

export class ListBookEntries {
  constructor(private readonly repository: LibraryEntryRepository) {}

  async execute(): Promise<readonly BookEntry[]> {
    try {
      const entries = await this.repository.list();
      return Object.freeze([...entries]);
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar os dados.",
        { operation: "list_books" },
      );
    }
  }
}

async function listAnnotations<T>(
  input: unknown,
  operation: string,
  list: (entryId: string) => Promise<readonly T[]>,
): Promise<readonly T[]> {
  let entryId: string;
  try {
    entryId = bookIdSchema.parse(input).id;
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

export class ListNotesByBook {
  constructor(private readonly repository: NoteRepository) {}

  execute(input: unknown): Promise<readonly Note[]> {
    return listAnnotations(input, "list_notes_by_book", (entryId) =>
      this.repository.listByEntryId(entryId),
    );
  }
}

export class ListQuotesByBook {
  constructor(private readonly repository: QuoteRepository) {}

  execute(input: unknown): Promise<readonly Quote[]> {
    return listAnnotations(input, "list_quotes_by_book", (entryId) =>
      this.repository.listByEntryId(entryId),
    );
  }
}

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
