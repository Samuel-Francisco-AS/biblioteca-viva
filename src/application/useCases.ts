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
  type DomainEvent,
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
  processMilestones,
  publishEvent,
  publishEvents,
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
  "activities" | "clock" | "events" | "ids" | "milestones" | "transaction"
>;
type BookWriteDependencies = WriteDependencies &
  Pick<ApplicationDependencies, "libraryEntries">;
type NoteWriteDependencies = BookWriteDependencies &
  Pick<ApplicationDependencies, "notes">;
type QuoteWriteDependencies = BookWriteDependencies &
  Pick<ApplicationDependencies, "quotes">;

interface PersistBookMutationInput {
  readonly activity: ReturnType<typeof createActivity>;
  readonly existing: BookEntry;
  readonly fallbackEvent: DomainEvent;
  readonly occurredAt: string;
  readonly updated: BookEntry;
}

async function persistBookMutation(
  dependencies: BookWriteDependencies,
  input: PersistBookMutationInput,
): Promise<void> {
  const event =
    input.existing.status !== "completed" &&
    input.updated.status === "completed"
      ? createLibraryEntryCompletedEvent({
          eventId: input.fallbackEvent.eventId,
          aggregateId: input.updated.id,
          occurredAt: input.occurredAt,
          revision: input.updated.revision,
          payload: {
            completedAt: input.updated.completedAt ?? input.occurredAt,
            entryType: "book",
          },
        })
      : input.fallbackEvent;
  let milestoneEvents = Object.freeze([]) as readonly DomainEvent[];
  await runTransaction(dependencies, async () => {
    await saveEntity(
      () => dependencies.libraryEntries.save(input.updated),
      "save_book",
    );
    await saveActivity(dependencies, input.activity);
    milestoneEvents = await processMilestones(dependencies, event);
  });
  await publishEvents(dependencies, [event, ...milestoneEvents]);
}

async function loadBook(
  dependencies: Pick<ApplicationDependencies, "libraryEntries">,
  id: string,
): Promise<BookEntry> {
  let book: BookEntry | undefined;
  try {
    const entry = await dependencies.libraryEntries.getById(id);
    book = entry?.type === "book" ? entry : undefined;
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

async function loadLibraryEntry(
  dependencies: Pick<ApplicationDependencies, "libraryEntries">,
  id: string,
) {
  try {
    const entry = await dependencies.libraryEntries.getById(id);
    if (!entry) throw notFound();
    return entry;
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw new ApplicationError(
      "PERSISTENCE_FAILED",
      "Não foi possível consultar os dados.",
      { operation: "get_entry" },
    );
  }
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
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    const event = createLibraryEntryCreatedEvent({
      eventId,
      aggregateId: book.id,
      occurredAt,
      revision: book.revision,
      payload: { entryType: "book", status: book.status },
    });
    let milestoneEvents = Object.freeze([]) as readonly DomainEvent[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.libraryEntries.save(book),
        "save_book",
      );
      await saveActivity(this.dependencies, activity);
      milestoneEvents = await processMilestones(this.dependencies, event);
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
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
        payload: { changedFields, entryType: "book" },
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
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await persistBookMutation(this.dependencies, {
      activity,
      existing,
      fallbackEvent: createProgressUpdatedEvent({
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
      occurredAt,
      updated,
    });
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
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    await persistBookMutation(this.dependencies, {
      activity,
      existing,
      fallbackEvent: createLibraryEntryUpdatedEvent({
        eventId,
        aggregateId: updated.id,
        occurredAt,
        revision: updated.revision,
        payload: { changedFields: ["status"], entryType: "book" },
      }),
      occurredAt,
      updated,
    });
    return updated;
  }
}

export class AddNote {
  constructor(private readonly dependencies: NoteWriteDependencies) {}

  async execute(input: unknown): Promise<Note> {
    const parsed = parseInput(addNoteSchema, input);
    const entry = await loadLibraryEntry(this.dependencies, parsed.entryId);
    if (parsed.location !== undefined && parsed.location.type !== entry.type)
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "A localização não corresponde ao tipo de registro.",
      );
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
      aggregateId: entry.id,
      occurredAt,
      revision: note.revision,
      metadata: { noteId: note.id },
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    const event = createNoteCreatedEvent({
      eventId,
      aggregateId: entry.id,
      occurredAt,
      revision: note.revision,
      payload: { noteId: note.id },
    });
    let milestoneEvents = Object.freeze([]) as readonly DomainEvent[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(() => this.dependencies.notes.save(note), "save_note");
      await saveActivity(this.dependencies, activity);
      milestoneEvents = await processMilestones(this.dependencies, event);
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return note;
  }
}

export class AddQuote {
  constructor(private readonly dependencies: QuoteWriteDependencies) {}

  async execute(input: unknown): Promise<Quote> {
    const parsed = parseInput(addQuoteSchema, input);
    const entry = await loadLibraryEntry(this.dependencies, parsed.entryId);
    if (entry.type === "physical_activity" || entry.type === "work")
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Citações estão disponíveis para livros, filmes, séries e estudos.",
      );
    if (
      (parsed.location !== undefined && parsed.location.type !== entry.type) ||
      (parsed.page !== undefined && entry.type !== "book")
    )
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "A localização não corresponde ao tipo de registro.",
      );
    const id = await generatedId(this.dependencies, "generate_quote_id");
    const occurredAt = await currentTime(this.dependencies);
    const quote = applyDomain(() =>
      createQuote(
        {
          ...parsed,
          id,
          createdAt: occurredAt,
          ...(parsed.location !== undefined
            ? { location: parsed.location }
            : parsed.page !== undefined && {
                location: { type: "book", page: parsed.page },
              }),
        },
        entry.type === "book" ? entry : undefined,
      ),
    );
    const page =
      quote.location?.type === "book" ? quote.location.page : undefined;

    const activityId = await generatedId(
      this.dependencies,
      "generate_activity_id",
    );
    const activity = createActivity({
      id: activityId,
      type: "quote_added",
      aggregateId: entry.id,
      occurredAt,
      revision: quote.revision,
      metadata: {
        quoteId: quote.id,
        ...(page !== undefined && { page }),
      },
    });
    const eventId = await generatedId(this.dependencies, "generate_event_id");
    const event = createQuoteCreatedEvent({
      eventId,
      aggregateId: entry.id,
      occurredAt,
      revision: quote.revision,
      payload: {
        quoteId: quote.id,
        ...(page !== undefined && { page }),
      },
    });
    let milestoneEvents = Object.freeze([]) as readonly DomainEvent[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.quotes.save(quote),
        "save_quote",
      );
      await saveActivity(this.dependencies, activity);
      milestoneEvents = await processMilestones(this.dependencies, event);
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return quote;
  }
}
