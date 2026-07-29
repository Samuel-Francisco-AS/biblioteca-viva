import type {
  BookEntry,
  CreateAnnotationInput,
  CreateQuoteInput,
  Note,
  Quote,
} from "./types";
import {
  requireId,
  requireIsoUtc,
  requireText,
  validateBook,
  validatePage,
} from "./validation";
import { InvalidProgressError } from "./errors";

export function createNote(input: CreateAnnotationInput): Note {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    content: requireText(input.content, "content"),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  });
}

export function createQuote(input: CreateQuoteInput, book?: BookEntry): Quote {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  if (book !== undefined) {
    validateBook(book);
    if (book.id !== input.entryId) {
      throw new InvalidProgressError(
        "a citação referencia outro livro",
        "entryId",
      );
    }
  }
  const page =
    input.page === undefined ? undefined : validatePage(input.page, "page");
  if (page === 0) {
    throw new InvalidProgressError("page deve ser positiva", "page");
  }
  if (
    page !== undefined &&
    book?.totalPages !== undefined &&
    page > book.totalPages
  ) {
    throw new InvalidProgressError("page não pode exceder totalPages", "page");
  }
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    content: requireText(input.content, "content"),
    ...(page !== undefined && { page }),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  });
}
