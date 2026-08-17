import { InvalidStatusTransitionError } from "./errors";
import type {
  BookEntry,
  CreateBookInput,
  EntryStatus,
  UpdateBibliographicDataInput,
} from "./types";
import {
  nextMetadata,
  normalizeText,
  optionalText,
  requireIsoUtc,
  requireText,
  validateBook,
  validatePage,
  validateRating,
  validateTotalPages,
} from "./validation";

const ALLOWED_TRANSITIONS: Readonly<
  Record<EntryStatus, readonly EntryStatus[]>
> = {
  planned: Object.freeze(["in_progress", "abandoned"]),
  in_progress: Object.freeze(["paused", "completed", "abandoned"]),
  paused: Object.freeze(["in_progress", "completed", "abandoned"]),
  completed: Object.freeze(["in_progress"]),
  abandoned: Object.freeze(["in_progress"]),
};

function immutableBook(book: BookEntry): BookEntry {
  return Object.freeze({ ...book });
}

export function createBook(input: CreateBookInput): BookEntry {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  const status = input.status ?? "planned";
  const totalPages = validateTotalPages(input.totalPages);
  const currentPage = validatePage(input.currentPage ?? 0, "currentPage");
  const completedAt =
    status === "completed"
      ? requireIsoUtc(input.completedAt ?? createdAt, "completedAt")
      : input.completedAt;
  const book: BookEntry = {
    id: normalizeText(input.id),
    type: "book",
    title: requireText(input.title, "title"),
    ...(optionalText(input.author) !== undefined && {
      author: optionalText(input.author),
    }),
    status,
    favorite: input.favorite ?? false,
    tagIds: Object.freeze([...(input.tagIds ?? [])]),
    ...(totalPages !== undefined && { totalPages }),
    currentPage:
      status === "completed" && totalPages !== undefined
        ? totalPages
        : currentPage,
    ...(validateRating(input.rating) !== undefined && { rating: input.rating }),
    ...(input.startedAt !== undefined && {
      startedAt: requireIsoUtc(input.startedAt, "startedAt"),
    }),
    ...(completedAt !== undefined && { completedAt }),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  };
  validateBook(book);
  return immutableBook(book);
}

export function updateBibliographicData(
  book: BookEntry,
  input: UpdateBibliographicDataInput,
): BookEntry {
  validateBook(book);
  const totalPages =
    input.totalPages === null
      ? undefined
      : validateTotalPages(input.totalPages ?? book.totalPages);
  const rating =
    input.rating === null
      ? undefined
      : validateRating(input.rating ?? book.rating);
  const updated: BookEntry = {
    ...book,
    ...nextMetadata(book, input.updatedAt),
    title:
      input.title === undefined
        ? book.title
        : requireText(input.title, "title"),
    author:
      input.author === undefined ? book.author : optionalText(input.author),
    totalPages,
    rating,
  };
  validateBook(updated);
  return immutableBook(updated);
}

export function updateProgress(
  book: BookEntry,
  currentPage: number,
  updatedAt: string,
): BookEntry {
  validateBook(book);
  if (book.status === "completed" && currentPage !== book.currentPage) {
    throw new InvalidStatusTransitionError(
      "completed",
      "completed",
      "altere o status antes de reduzir o progresso",
    );
  }
  const validatedPage = validatePage(currentPage, "currentPage");
  const startsReading = book.status === "planned" && validatedPage > 0;
  const progressed: BookEntry = {
    ...book,
    currentPage: validatedPage,
    ...(startsReading && {
      status: "in_progress",
      ...(book.startedAt === undefined && {
        startedAt: requireIsoUtc(updatedAt, "startedAt"),
      }),
    }),
  };
  validateBook(progressed);
  if (
    progressed.totalPages !== undefined &&
    progressed.currentPage === progressed.totalPages &&
    (progressed.status === "in_progress" || progressed.status === "paused")
  ) {
    return completeBook(progressed, updatedAt);
  }
  return immutableBook({
    ...progressed,
    ...nextMetadata(book, updatedAt),
  });
}

export function changeBookStatus(
  book: BookEntry,
  status: EntryStatus,
  updatedAt: string,
): BookEntry {
  validateBook(book);
  if (status === book.status) {
    throw new InvalidStatusTransitionError(
      book.status,
      status,
      "status já aplicado",
    );
  }
  if (!ALLOWED_TRANSITIONS[book.status].includes(status)) {
    throw new InvalidStatusTransitionError(book.status, status);
  }
  if (status === "completed") return completeBook(book, updatedAt);
  const updated: BookEntry = {
    ...book,
    ...nextMetadata(book, updatedAt),
    status,
    completedAt: undefined,
    ...(status === "in_progress" && book.startedAt === undefined
      ? { startedAt: requireIsoUtc(updatedAt, "startedAt") }
      : {}),
  };
  validateBook(updated);
  return immutableBook(updated);
}

export function completeBook(book: BookEntry, completedAt: string): BookEntry {
  validateBook(book);
  if (book.status === "completed") return book;
  if (!ALLOWED_TRANSITIONS[book.status].includes("completed")) {
    throw new InvalidStatusTransitionError(book.status, "completed");
  }
  const timestamp = requireIsoUtc(completedAt, "completedAt");
  const completed: BookEntry = {
    ...book,
    ...nextMetadata(book, timestamp),
    status: "completed",
    currentPage: book.totalPages ?? book.currentPage,
    completedAt: timestamp,
  };
  validateBook(completed);
  return immutableBook(completed);
}

export function getAllowedStatusTransitions(
  status: EntryStatus,
): readonly EntryStatus[] {
  return ALLOWED_TRANSITIONS[status];
}
