import { InvalidProgressError, InvalidRevisionError } from "./errors";
import type { EntryStatus } from "./types";
import {
  requireId,
  requireIsoUtc,
  requireText,
  validatePage,
  validateTotalPages,
} from "./validation";

interface EventMetadata {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly revision: number;
}

export interface LibraryEntryCreated extends EventMetadata {
  readonly type: "LibraryEntryCreated";
  readonly payload: {
    readonly entryType: "book";
    readonly status: EntryStatus;
  };
}
export interface LibraryEntryUpdated extends EventMetadata {
  readonly type: "LibraryEntryUpdated";
  readonly payload: { readonly changedFields: readonly string[] };
}
export interface ProgressUpdated extends EventMetadata {
  readonly type: "ProgressUpdated";
  readonly payload: {
    readonly currentPage: number;
    readonly totalPages?: number;
  };
}
export interface LibraryEntryCompleted extends EventMetadata {
  readonly type: "LibraryEntryCompleted";
  readonly payload: { readonly completedAt: string };
}
export interface NoteCreated extends EventMetadata {
  readonly type: "NoteCreated";
  readonly payload: { readonly noteId: string };
}
export interface QuoteCreated extends EventMetadata {
  readonly type: "QuoteCreated";
  readonly payload: { readonly quoteId: string; readonly page?: number };
}

export type DomainEvent =
  | LibraryEntryCreated
  | LibraryEntryUpdated
  | ProgressUpdated
  | LibraryEntryCompleted
  | NoteCreated
  | QuoteCreated;

type EventInput<TPayload> = EventMetadata & { readonly payload: TPayload };

function event<T extends DomainEvent>(value: T): T {
  requireId(value.eventId, "eventId");
  requireId(value.aggregateId, "aggregateId");
  requireIsoUtc(value.occurredAt, "occurredAt");
  if (!Number.isInteger(value.revision) || value.revision < 1) {
    throw new InvalidRevisionError(
      "evento deve referenciar revisão inteira positiva",
    );
  }
  Object.freeze(value.payload);
  return Object.freeze(value);
}

export const createLibraryEntryCreatedEvent = (
  input: EventInput<LibraryEntryCreated["payload"]>,
): LibraryEntryCreated => event({ type: "LibraryEntryCreated", ...input });

export function createLibraryEntryUpdatedEvent(
  input: EventInput<LibraryEntryUpdated["payload"]>,
): LibraryEntryUpdated {
  if (input.payload.changedFields.length === 0) {
    throw new InvalidRevisionError(
      "evento de atualização deve informar campos alterados",
    );
  }
  input.payload.changedFields.forEach((field) =>
    requireText(field, "changedFields"),
  );
  return event({
    type: "LibraryEntryUpdated",
    ...input,
    payload: { changedFields: Object.freeze([...input.payload.changedFields]) },
  });
}

export function createProgressUpdatedEvent(
  input: EventInput<ProgressUpdated["payload"]>,
): ProgressUpdated {
  const currentPage = validatePage(input.payload.currentPage, "currentPage");
  const totalPages = validateTotalPages(input.payload.totalPages);
  if (totalPages !== undefined && currentPage > totalPages) {
    throw new InvalidProgressError("currentPage não pode exceder totalPages");
  }
  return event({ type: "ProgressUpdated", ...input });
}

export function createLibraryEntryCompletedEvent(
  input: EventInput<LibraryEntryCompleted["payload"]>,
): LibraryEntryCompleted {
  requireIsoUtc(input.payload.completedAt, "completedAt");
  return event({ type: "LibraryEntryCompleted", ...input });
}

export function createNoteCreatedEvent(
  input: EventInput<NoteCreated["payload"]>,
): NoteCreated {
  requireId(input.payload.noteId, "noteId");
  return event({ type: "NoteCreated", ...input });
}

export function createQuoteCreatedEvent(
  input: EventInput<QuoteCreated["payload"]>,
): QuoteCreated {
  requireId(input.payload.quoteId, "quoteId");
  if (input.payload.page !== undefined) {
    const page = validatePage(input.payload.page, "page");
    if (page === 0)
      throw new InvalidProgressError("page deve ser positiva", "page");
  }
  return event({ type: "QuoteCreated", ...input });
}
