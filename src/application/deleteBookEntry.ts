import { ApplicationError, toValidationError } from "./errors";
import type { BookDeletionStore } from "./ports";
import { bookIdSchema } from "./schemas";

export interface DeleteBookEntryResult {
  readonly deleted: true;
}

export class DeleteBookEntry {
  constructor(private readonly store: BookDeletionStore) {}

  async execute(input: unknown): Promise<DeleteBookEntryResult> {
    let id: string;
    try {
      id = bookIdSchema.parse(input).id;
    } catch (error: unknown) {
      throw toValidationError(error);
    }

    try {
      const result = await this.store.deleteBookEntry(id);
      if (result === "not-found") {
        throw new ApplicationError(
          "BOOK_NOT_FOUND",
          "Este livro não foi encontrado.",
          { operation: "delete_book" },
        );
      }
      return Object.freeze({ deleted: true });
    } catch (error: unknown) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(
        "DELETE_BOOK_FAILED",
        "Não foi possível excluir o livro. Nenhum dado foi removido.",
        { operation: "delete_book" },
      );
    }
  }
}
