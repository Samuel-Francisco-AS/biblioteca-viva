import {
  changeBookStatus,
  completeBook,
  createBook,
  createLibraryEntryCompletedEvent,
  createLibraryEntryCreatedEvent,
  createLibraryEntryUpdatedEvent,
  createNote,
  createNoteCreatedEvent,
  createProgressUpdatedEvent,
  createQuote,
  createQuoteCreatedEvent,
  updateBibliographicData,
  updateProgress,
  type BookEntry,
  type Note,
  type Quote,
} from "../domain";
import { createActivity } from "./activities";
import { ApplicationError, notFound } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
  saveActivity,
  saveEntity,
} from "./internal";
import type { ApplicationDependencies } from "./ports";
import {
  addNoteSchema,
  addQuoteSchema,
  changeBookStatusSchema,
  createBookEntrySchema,
  updateBookEntrySchema,
  updateBookProgressSchema,
} from "./schemas";

type WriteDependencies = Pick<
  ApplicationDependencies,
  "activities" | "clock" | "events" | "ids" | "transaction"
>;
type BookWriteDependencies = WriteDependencies &
  Pick<ApplicationDependencies, "libraryEntries">;
type NoteWriteDependencies = BookWriteDependencies &
  Pick<ApplicationDependencies, "notes">;
type QuoteWriteDependencies = BookWriteDependencies &
  Pick<ApplicationDependencies, "quotes">;

async function loadBook(
  dependencies: Pick<ApplicationDependencies, "libraryEntries">,
  id: string,
): Promise<BookEntry> {
  let book: BookEntry | undefined;
  try {
    book = await dependencies.libraryEntries.getById(id);
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

export class CreateBookEntry {
  constructor(private readonly dependencies: BookWriteDependencies) {}

  async execute(input: unknown): Promise<BookEntry> {
    const parsed = parseInput(createBookEntrySchema, input);
    const id = await generatedId(this.dependencies, "generate_book_id");
    const occurredAt = await currentTime(this.dependencies);
    const book = applyDomain(() =>
      createBook({ ...parsed, id, createdAt: occurredAt }),
    );

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "book_created",
      aggregateId: book.id,
      occurredAt,
      revision: book.revision,
      metadata: { status: book.status },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(book),
        "save_book",
      );
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await publishEvent(
      this.dependencies,
      createLibraryEntryCreatedEvent({
        eventId,
        aggregateId: book.id,
        occurredAt,
        revision: book.revision,
        payload: { entryType: "book", status: book.status },
      }),
    );
    return book;
  }
}

export class UpdateBookEntry {
  constructor(private readonly dependencies: BookWriteDependencies) {}

  async execute(input: unknown): Promise<BookEntry> {
    const parsed = parseInput(updateBookEntrySchema, input);
    const existing = await loadBook(this.dependencies, parsed.id);
    const occurredAt = await currentTime(this.dependencies);
    const changes = {
      title: parsed.title,
      author: parsed.author,
      totalPages: parsed.totalPages,
      rating: parsed.rating,
    };
    const updated = applyDomain(() =>
      updateBibliographicData(existing, { ...changes, updatedAt: occurredAt }),
    );
    const changedFields = Object.entries(changes)
      .filter(([, value]) => value !== undefined)
      .map(([field]) => field);

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "book_updated",
      aggregateId: updated.id,
      occurredAt,
      revision: updated.revision,
      metadata: { changedFields: Object.freeze(changedFields) },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(updated),
        "save_book",
      );
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await publishEvent(
      this.dependencies,
      createLibraryEntryUpdatedEvent({
        eventId,
        aggregateId: updated.id,
        occurredAt,
        revision: updated.revision,
        payload: { changedFields },
      }),
    );
    return updated;
  }
}

export class UpdateBookProgress {
  constructor(private readonly dependencies: BookWriteDependencies) {}

  async execute(input: unknown): Promise<BookEntry> {
    const parsed = parseInput(updateBookProgressSchema, input);
    const existing = await loadBook(this.dependencies, parsed.id);
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      updateProgress(existing, parsed.currentPage, occurredAt),
    );

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "progress_updated",
      aggregateId: updated.id,
      occurredAt,
      revision: updated.revision,
      metadata: {
        currentPage: updated.currentPage,
        ...(updated.totalPages !== undefined && {
          totalPages: updated.totalPages,
        }),
      },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(updated),
        "save_book",
      );
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await publishEvent(
      this.dependencies,
      createProgressUpdatedEvent({
        eventId,
        aggregateId: updated.id,
        occurredAt,
        revision: updated.revision,
        payload: {
          currentPage: updated.currentPage,
          ...(updated.totalPages !== undefined && {
            totalPages: updated.totalPages,
          }),
        },
      }),
    );
    return updated;
  }
}

export class ChangeBookStatus {
  constructor(private readonly dependencies: BookWriteDependencies) {}

  async execute(input: unknown): Promise<BookEntry> {
    const parsed = parseInput(changeBookStatusSchema, input);
    const existing = await loadBook(this.dependencies, parsed.id);
    const occurredAt = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      parsed.status === "completed"
        ? completeBook(existing, occurredAt)
        : changeBookStatus(existing, parsed.status, occurredAt),
    );
    if (updated === existing) return existing;

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "status_changed",
      aggregateId: updated.id,
      occurredAt,
      revision: updated.revision,
      metadata: { from: existing.status, to: updated.status },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(updated),
        "save_book",
      );
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    const event =
      updated.status === "completed"
        ? createLibraryEntryCompletedEvent({
            eventId,
            aggregateId: updated.id,
            occurredAt,
            revision: updated.revision,
            payload: { completedAt: updated.completedAt ?? occurredAt },
          })
        : createLibraryEntryUpdatedEvent({
            eventId,
            aggregateId: updated.id,
            occurredAt,
            revision: updated.revision,
            payload: { changedFields: ["status"] },
          });
    await publishEvent(this.dependencies, event);
    return updated;
  }
}

export class AddNote {
  constructor(private readonly dependencies: NoteWriteDependencies) {}

  async execute(input: unknown): Promise<Note> {
    const parsed = parseInput(addNoteSchema, input);
    const book = await loadBook(this.dependencies, parsed.entryId);
    const id = await generatedId(this.dependencies, "generate_note_id");
    const occurredAt = await currentTime(this.dependencies);
    const note = applyDomain(() =>
      createNote({ ...parsed, id, createdAt: occurredAt }),
    );

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "note_added",
      aggregateId: book.id,
      occurredAt,
      revision: note.revision,
      metadata: { noteId: note.id },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(() => this.dependencies.notes.save(note), "save_note");
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await publishEvent(
      this.dependencies,
      createNoteCreatedEvent({
        eventId,
        aggregateId: book.id,
        occurredAt,
        revision: note.revision,
        payload: { noteId: note.id },
      }),
    );
    return note;
  }
}

export class AddQuote {
  constructor(private readonly dependencies: QuoteWriteDependencies) {}

  async execute(input: unknown): Promise<Quote> {
    const parsed = parseInput(addQuoteSchema, input);
    const book = await loadBook(this.dependencies, parsed.entryId);
    const id = await generatedId(this.dependencies, "generate_quote_id");
    const occurredAt = await currentTime(this.dependencies);
    const quote = applyDomain(() =>
      createQuote({ ...parsed, id, createdAt: occurredAt }, book),
    );

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "quote_added",
      aggregateId: book.id,
      occurredAt,
      revision: quote.revision,
      metadata: {
        quoteId: quote.id,
        ...(quote.page !== undefined && { page: quote.page }),
      },
    });
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.quotes.save(quote),
        "save_quote",
      );
      await saveActivity(this.dependencies, activity);
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await publishEvent(
      this.dependencies,
      createQuoteCreatedEvent({
        eventId,
        aggregateId: book.id,
        occurredAt,
        revision: quote.revision,
        payload: {
          quoteId: quote.id,
          ...(quote.page !== undefined && { page: quote.page }),
        },
      }),
    );
    return quote;
  }
}
