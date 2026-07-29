import type { BookEntry } from "../domain";
import { ApplicationError, notFound, toValidationError } from "./errors";
import type { LibraryEntryRepository } from "./ports";
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
