import {
  InvalidDateError,
  InvalidFieldError,
  InvalidProgressError,
  InvalidRevisionError,
} from "./errors";
import { ENTRY_STATUSES, type BookEntry, type EntityMetadata } from "./types";

const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

export function requireText(value: string, field: string): string {
  const normalized = normalizeText(value);
  if (normalized.length === 0) {
    throw new InvalidFieldError(field, "deve possuir conteúdo");
  }
  return normalized;
}

export function optionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = normalizeText(value);
  return normalized.length === 0 ? undefined : normalized;
}

export function requireId(value: string, field = "id"): string {
  return requireText(value, field);
}

export function requireIsoUtc(value: string, field: string): string {
  if (!ISO_UTC_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    throw new InvalidDateError(field, "deve usar ISO 8601 UTC canônico");
  }
  const canonical = new Date(value).toISOString();
  const normalizedInput = value.includes(".")
    ? value
    : value.replace("Z", ".000Z");
  if (canonical !== normalizedInput) {
    throw new InvalidDateError(field, "representa uma data inexistente");
  }
  return canonical;
}

export function validateMetadata(metadata: EntityMetadata): void {
  requireId(metadata.id);
  const createdAt = requireIsoUtc(metadata.createdAt, "createdAt");
  const updatedAt = requireIsoUtc(metadata.updatedAt, "updatedAt");
  if (updatedAt < createdAt) {
    throw new InvalidDateError("updatedAt", "não pode anteceder createdAt");
  }
  if (!Number.isInteger(metadata.revision) || metadata.revision < 1) {
    throw new InvalidRevisionError("deve ser um inteiro positivo");
  }
}

export function nextMetadata(
  entity: EntityMetadata,
  updatedAtInput: string,
): EntityMetadata {
  validateMetadata(entity);
  const updatedAt = requireIsoUtc(updatedAtInput, "updatedAt");
  if (updatedAt < entity.createdAt || updatedAt < entity.updatedAt) {
    throw new InvalidDateError(
      "updatedAt",
      "não pode anteceder createdAt nem a atualização anterior",
    );
  }
  const revision = entity.revision + 1;
  if (!Number.isSafeInteger(revision)) {
    throw new InvalidRevisionError("não pode ultrapassar o limite seguro");
  }
  return { id: entity.id, createdAt: entity.createdAt, updatedAt, revision };
}

export function validatePage(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidProgressError(
      `${field} deve ser inteiro e não negativo`,
      field,
    );
  }
  return value;
}

export function validateTotalPages(
  value: number | undefined,
): number | undefined {
  if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
    throw new InvalidProgressError(
      "totalPages deve ser inteiro e positivo",
      "totalPages",
    );
  }
  return value;
}

export function validateRating(value: number | undefined): number | undefined {
  if (
    value !== undefined &&
    (!Number.isInteger(value) || value < 1 || value > 5)
  ) {
    throw new InvalidFieldError("rating", "deve ser um inteiro entre 1 e 5");
  }
  return value;
}

export function validateBook(book: BookEntry): void {
  validateMetadata(book);
  if (book.type !== "book")
    throw new InvalidFieldError("type", 'deve ser "book"');
  if (!ENTRY_STATUSES.includes(book.status)) {
    throw new InvalidFieldError("status", "não pertence a EntryStatus");
  }
  requireText(book.title, "title");
  book.tagIds.forEach((id) => requireId(id, "tagIds"));
  if (new Set(book.tagIds).size !== book.tagIds.length) {
    throw new InvalidFieldError("tagIds", "não pode conter duplicatas");
  }
  const totalPages = validateTotalPages(book.totalPages);
  validateRating(book.rating);
  validatePage(book.currentPage, "currentPage");
  if (totalPages !== undefined && book.currentPage > totalPages) {
    throw new InvalidProgressError("currentPage não pode exceder totalPages");
  }
  if (book.startedAt !== undefined) {
    requireIsoUtc(book.startedAt, "startedAt");
  }
  if (book.completedAt !== undefined) {
    const completedAt = requireIsoUtc(book.completedAt, "completedAt");
    if (book.startedAt !== undefined && completedAt < book.startedAt) {
      throw new InvalidDateError("completedAt", "não pode anteceder startedAt");
    }
  }
  if (book.status === "completed") {
    if (book.completedAt === undefined) {
      throw new InvalidDateError(
        "completedAt",
        "é obrigatória em livro concluído",
      );
    }
    if (totalPages !== undefined && book.currentPage !== totalPages) {
      throw new InvalidProgressError(
        "livro concluído deve estar na última página conhecida",
      );
    }
  } else if (book.completedAt !== undefined) {
    throw new InvalidDateError(
      "completedAt",
      "só pode existir em livro concluído",
    );
  }
}
