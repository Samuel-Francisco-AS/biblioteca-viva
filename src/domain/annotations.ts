import { InvalidProgressError } from "./errors";
import type {
  AnnotationLocation,
  BookEntry,
  CreateAnnotationInput,
  CreateQuoteInput,
  Note,
  Quote,
  UpdateAnnotationInput,
  UpdateQuoteInput,
} from "./types";
import {
  nextMetadata,
  requireId,
  requireIsoUtc,
  requireText,
  validateBook,
  validatePage,
} from "./validation";

function normalizedTagIds(values: readonly string[] | undefined) {
  return Object.freeze([
    ...new Set((values ?? []).map((value) => requireId(value, "tagIds"))),
  ]);
}

function validateLocation(
  location: AnnotationLocation | undefined,
  book?: BookEntry,
): AnnotationLocation | undefined {
  if (location === undefined) return undefined;
  if (location.type === "book") {
    const page = validatePage(location.page, "page");
    if (page === 0)
      throw new InvalidProgressError("page deve ser positiva", "page");
    if (book?.totalPages !== undefined && page > book.totalPages)
      throw new InvalidProgressError(
        "page não pode exceder totalPages",
        "page",
      );
    return Object.freeze({ type: "book", page });
  }
  if (location.type === "movie")
    return Object.freeze({
      type: "movie",
      minute: validatePage(location.minute, "minute"),
    });
  if (location.type === "series") {
    const season = validatePage(location.season, "season");
    const episode = validatePage(location.episode, "episode");
    if (season === 0 || episode === 0)
      throw new InvalidProgressError(
        "temporada e episódio devem ser positivos",
        "location",
      );
    return Object.freeze({
      type: "series",
      season,
      episode,
      ...(location.minute !== undefined && {
        minute: validatePage(location.minute, "minute"),
      }),
    });
  }
  const module = location.module?.trim();
  const topic = location.topic?.trim();
  if (!module && !topic)
    throw new InvalidProgressError(
      "localização de estudo exige módulo ou tópico",
      "location",
    );
  return Object.freeze({
    type: "study",
    ...(module && { module }),
    ...(topic && { topic }),
  });
}

export function createNote(input: CreateAnnotationInput): Note {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  const location = validateLocation(input.location);
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    content: requireText(input.content, "content"),
    favorite: input.favorite ?? false,
    tagIds: normalizedTagIds(input.tagIds),
    ...(location !== undefined && { location }),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  });
}

export function createQuote(input: CreateQuoteInput, book?: BookEntry): Quote {
  const createdAt = requireIsoUtc(input.createdAt, "createdAt");
  if (book !== undefined) {
    validateBook(book);
    if (book.id !== input.entryId)
      throw new InvalidProgressError(
        "a citação referencia outro livro",
        "entryId",
      );
  }
  const location = validateLocation(input.location, book);
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    content: requireText(input.content, "content"),
    favorite: input.favorite ?? false,
    tagIds: normalizedTagIds(input.tagIds),
    ...(location !== undefined && { location }),
    createdAt,
    updatedAt: createdAt,
    revision: 1,
  });
}

export function updateNote(note: Note, input: UpdateAnnotationInput): Note {
  return Object.freeze({
    ...note,
    ...nextMetadata(note, input.updatedAt),
    content: requireText(input.content, "content"),
  });
}

export function organizeAnnotation(
  annotation: Note,
  input: { readonly favorite?: boolean; readonly tagIds?: readonly string[] },
  updatedAt: string,
): Note;
export function organizeAnnotation(
  annotation: Quote,
  input: { readonly favorite?: boolean; readonly tagIds?: readonly string[] },
  updatedAt: string,
): Quote;
export function organizeAnnotation(
  annotation: Note | Quote,
  input: { readonly favorite?: boolean; readonly tagIds?: readonly string[] },
  updatedAt: string,
): Note | Quote {
  return Object.freeze({
    ...annotation,
    ...nextMetadata(annotation, updatedAt),
    ...(input.favorite !== undefined && { favorite: input.favorite }),
    ...(input.tagIds !== undefined && {
      tagIds: normalizedTagIds(input.tagIds),
    }),
  });
}

export function updateQuote(
  quote: Quote,
  input: UpdateQuoteInput,
  book?: BookEntry,
): Quote {
  const validated = createQuote(
    {
      id: quote.id,
      entryId: quote.entryId,
      content: input.content,
      createdAt: quote.createdAt,
      favorite: quote.favorite,
      tagIds: quote.tagIds,
      ...(input.location !== undefined && { location: input.location }),
    },
    book,
  );
  return Object.freeze({
    ...validated,
    ...nextMetadata(quote, input.updatedAt),
  });
}
