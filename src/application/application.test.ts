// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  AddNote,
  AddQuote,
  ApplicationError,
  ChangeBookStatus,
  CreateBookEntry,
  GetBookEntry,
  ListAllNotes,
  ListAllQuotes,
  ListBookEntries,
  ListNotesByBook,
  ListQuotesByBook,
  UpdateBookEntry,
  UpdateBookProgress,
  type Activity,
  type ActivityRepository,
  type ApplicationDependencies,
  type ApplicationEventBus,
  type ApplicationTransactionRunner,
  type Clock,
  type IdGenerator,
  type LibraryEntryRepository,
  type NoteRepository,
  type QuoteRepository,
  type SessionRepository,
  type TagRepository,
} from "./index";
import {
  changeBookStatus,
  completeBook,
  createBook,
  type BookEntry,
  type DomainEvent,
  type Note,
  type Quote,
} from "../domain";

const T0 = "2026-07-29T10:00:00.000Z";
const T1 = "2026-07-29T11:00:00.000Z";
const T2 = "2026-07-29T12:00:00.000Z";

type FailureTarget =
  | "book_get"
  | "book_list"
  | "book_save"
  | "note_save"
  | "note_list"
  | "quote_save"
  | "quote_list"
  | "activity_save"
  | "event_publish";

class FakeLibraryEntryRepository implements LibraryEntryRepository {
  readonly entries = new Map<string, BookEntry>();

  constructor(
    private readonly state: TestState,
    entries: readonly BookEntry[] = [],
  ) {
    entries.forEach((entry) => this.entries.set(entry.id, entry));
  }

  getById(id: string): Promise<BookEntry | undefined> {
    if (this.state.failures.has("book_get"))
      return Promise.reject(new Error("database host leaked"));
    return Promise.resolve(this.entries.get(id));
  }

  list(): Promise<readonly BookEntry[]> {
    if (this.state.failures.has("book_list"))
      return Promise.reject(new Error("SQL list leaked"));
    return Promise.resolve([...this.entries.values()]);
  }

  save(entry: BookEntry): Promise<void> {
    this.state.timeline.push("entity");
    if (this.state.failures.has("book_save"))
      return Promise.reject(new Error("disk path leaked"));
    this.entries.set(entry.id, entry);
    return Promise.resolve();
  }
}

class FakeNoteRepository implements NoteRepository {
  readonly notes = new Map<string, Note>();
  constructor(private readonly state: TestState) {}
  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.notes.delete(id));
  }
  getById(id: string): Promise<Note | undefined> {
    return Promise.resolve(this.notes.get(id));
  }
  list(): Promise<readonly Note[]> {
    if (this.state.failures.has("note_list"))
      return Promise.reject(new Error("note table leaked"));
    return Promise.resolve([...this.notes.values()]);
  }
  listByEntryId(entryId: string): Promise<readonly Note[]> {
    if (this.state.failures.has("note_list"))
      return Promise.reject(new Error("note table leaked"));
    return Promise.resolve(
      [...this.notes.values()].filter((note) => note.entryId === entryId),
    );
  }
  save(note: Note): Promise<void> {
    this.state.timeline.push("entity");
    if (this.state.failures.has("note_save"))
      return Promise.reject(new Error("note table leaked"));
    this.notes.set(note.id, note);
    return Promise.resolve();
  }
}

class FakeQuoteRepository implements QuoteRepository {
  readonly quotes = new Map<string, Quote>();
  constructor(private readonly state: TestState) {}
  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.quotes.delete(id));
  }
  getById(id: string): Promise<Quote | undefined> {
    return Promise.resolve(this.quotes.get(id));
  }
  list(): Promise<readonly Quote[]> {
    if (this.state.failures.has("quote_list"))
      return Promise.reject(new Error("quote table leaked"));
    return Promise.resolve([...this.quotes.values()]);
  }
  listByEntryId(entryId: string): Promise<readonly Quote[]> {
    if (this.state.failures.has("quote_list"))
      return Promise.reject(new Error("quote table leaked"));
    return Promise.resolve(
      [...this.quotes.values()].filter((quote) => quote.entryId === entryId),
    );
  }
  save(quote: Quote): Promise<void> {
    this.state.timeline.push("entity");
    if (this.state.failures.has("quote_save"))
      return Promise.reject(new Error("quote table leaked"));
    this.quotes.set(quote.id, quote);
    return Promise.resolve();
  }
}

class FakeActivityRepository implements ActivityRepository {
  readonly activities: Activity[] = [];
  constructor(private readonly state: TestState) {}
  save(activity: Activity): Promise<void> {
    this.state.timeline.push("activity");
    if (this.state.failures.has("activity_save"))
      return Promise.reject(new Error("activity table leaked"));
    this.activities.push(activity);
    return Promise.resolve();
  }
}

class FakeEventBus implements ApplicationEventBus {
  readonly events: DomainEvent[] = [];
  constructor(private readonly state: TestState) {}
  publish(event: DomainEvent): Promise<void> {
    this.state.timeline.push("event");
    if (this.state.failures.has("event_publish"))
      return Promise.reject(new Error("broker leaked"));
    this.events.push(event);
    return Promise.resolve();
  }
}

class FakeIdGenerator implements IdGenerator {
  calls = 0;
  constructor(private readonly values: readonly string[]) {}
  generate(): Promise<string> {
    const value = this.values[this.calls];
    this.calls += 1;
    if (value === undefined)
      return Promise.reject(new Error("ID fake esgotado"));
    return Promise.resolve(value);
  }
}

class FakeClock implements Clock {
  calls = 0;
  constructor(private readonly value: string) {}
  now(): Promise<string> {
    this.calls += 1;
    return Promise.resolve(this.value);
  }
}

class FakeTransactionRunner implements ApplicationTransactionRunner {
  constructor(private readonly createRollback: () => () => void) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const rollback = this.createRollback();
    try {
      return await operation();
    } catch (error: unknown) {
      rollback();
      throw error;
    }
  }
}

interface TestState {
  readonly failures: Set<FailureTarget>;
  readonly timeline: string[];
}

interface TestContext {
  readonly activities: FakeActivityRepository;
  readonly clock: FakeClock;
  readonly dependencies: ApplicationDependencies;
  readonly events: FakeEventBus;
  readonly ids: FakeIdGenerator;
  readonly library: FakeLibraryEntryRepository;
  readonly notes: FakeNoteRepository;
  readonly quotes: FakeQuoteRepository;
  readonly state: TestState;
}

function setup(entries: readonly BookEntry[] = []): TestContext {
  const state: TestState = { failures: new Set(), timeline: [] };
  const library = new FakeLibraryEntryRepository(state, entries);
  const notes = new FakeNoteRepository(state);
  const quotes = new FakeQuoteRepository(state);
  const activities = new FakeActivityRepository(state);
  const events = new FakeEventBus(state);
  const ids = new FakeIdGenerator([
    "entity-1",
    "activity-1",
    "event-1",
    "extra-1",
    "extra-2",
  ]);
  const clock = new FakeClock(T1);
  const transaction = new FakeTransactionRunner(() => {
    const entries = new Map(library.entries);
    const savedNotes = new Map(notes.notes);
    const savedQuotes = new Map(quotes.quotes);
    const savedActivities = [...activities.activities];
    return () => {
      library.entries.clear();
      entries.forEach((entry, id) => library.entries.set(id, entry));
      notes.notes.clear();
      savedNotes.forEach((note, id) => notes.notes.set(id, note));
      quotes.quotes.clear();
      savedQuotes.forEach((quote, id) => quotes.quotes.set(id, quote));
      activities.activities.splice(
        0,
        activities.activities.length,
        ...savedActivities,
      );
    };
  });
  const sessions: SessionRepository = {
    delete: () => Promise.resolve(false),
    getById: () => Promise.resolve(undefined),
    getOpen: () => Promise.resolve(undefined),
    list: () => Promise.resolve([]),
    listByEntryId: () => Promise.resolve([]),
    save: () => Promise.resolve(),
  };
  const tags: TagRepository = {
    delete: () => Promise.resolve(false),
    getById: () => Promise.resolve(undefined),
    getByNormalizedName: () => Promise.resolve(undefined),
    list: () => Promise.resolve([]),
    save: () => Promise.resolve(),
  };
  return {
    activities,
    clock,
    dependencies: {
      activities,
      clock,
      events,
      ids,
      libraryEntries: library,
      notes,
      quotes,
      sessions,
      tags,
      transaction,
    },
    events,
    ids,
    library,
    notes,
    quotes,
    state,
  };
}

function plannedBook(
  overrides: Partial<Parameters<typeof createBook>[0]> = {},
): BookEntry {
  return createBook({
    id: "book-1",
    title: "Livro",
    createdAt: T0,
    ...overrides,
  });
}

async function expectApplicationError(
  promise: Promise<unknown>,
  code: ApplicationError["code"],
): Promise<ApplicationError> {
  try {
    await promise;
    throw new Error("Esperava ApplicationError");
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(ApplicationError);
    if (!(error instanceof ApplicationError)) throw error;
    expect(error.code).toBe(code);
    return error;
  }
}

describe("CreateBookEntry", () => {
  it("valida, usa ID e Clock, persiste, registra atividade e publica depois", async () => {
    const context = setup();
    const book = await new CreateBookEntry(context.dependencies).execute({
      title: "  Livro   novo ",
      author: " Autora ",
      totalPages: 120,
    });

    expect(book).toMatchObject({
      id: "entity-1",
      title: "Livro novo",
      author: "Autora",
      createdAt: T1,
      revision: 1,
    });
    expect(context.ids.calls).toBe(3);
    expect(context.clock.calls).toBe(1);
    expect(context.library.entries.get(book.id)).toBe(book);
    expect(context.activities.activities).toEqual([
      expect.objectContaining({
        id: "activity-1",
        type: "book_created",
        aggregateId: book.id,
        metadata: { status: "planned" },
      }),
    ]);
    expect(context.events.events).toEqual([
      expect.objectContaining({
        type: "LibraryEntryCreated",
        eventId: "event-1",
      }),
    ]);
    expect(context.state.timeline).toEqual(["entity", "activity", "event"]);
  });

  it("rejeita entrada inválida antes de gerar ID ou escrever", async () => {
    const context = setup();
    await expectApplicationError(
      new CreateBookEntry(context.dependencies).execute({ title: " " }),
      "VALIDATION_FAILED",
    );
    expect(context.ids.calls).toBe(0);
    expect(context.state.timeline).toEqual([]);
  });

  it("converte falha ao salvar e não registra atividade nem evento", async () => {
    const context = setup();
    context.state.failures.add("book_save");
    const error = await expectApplicationError(
      new CreateBookEntry(context.dependencies).execute({ title: "Livro" }),
      "PERSISTENCE_FAILED",
    );
    expect(error.message).not.toContain("disk path");
    expect(context.activities.activities).toHaveLength(0);
    expect(context.events.events).toHaveLength(0);
  });

  it("relata falha de atividade honestamente e não publica evento", async () => {
    const context = setup();
    context.state.failures.add("activity_save");
    await expectApplicationError(
      new CreateBookEntry(context.dependencies).execute({ title: "Livro" }),
      "ACTIVITY_PERSISTENCE_FAILED",
    );
    expect(context.library.entries.has("entity-1")).toBe(false);
    expect(context.events.events).toHaveLength(0);
  });

  it("relata falha de publicação depois das duas gravações", async () => {
    const context = setup();
    context.state.failures.add("event_publish");
    await expectApplicationError(
      new CreateBookEntry(context.dependencies).execute({ title: "Livro" }),
      "EVENT_PUBLICATION_FAILED",
    );
    expect(context.library.entries.has("entity-1")).toBe(true);
    expect(context.activities.activities).toHaveLength(1);
    expect(context.events.events).toHaveLength(0);
  });
});

describe("UpdateBookEntry", () => {
  it("atualiza, incrementa revisão e preserva ID e createdAt", async () => {
    const original = plannedBook({ totalPages: 100 });
    const context = setup([original]);
    const updated = await new UpdateBookEntry(context.dependencies).execute({
      id: original.id,
      title: " Título atualizado ",
      rating: 5,
    });

    expect(updated).toMatchObject({
      id: original.id,
      createdAt: original.createdAt,
      updatedAt: T1,
      revision: 2,
      title: "Título atualizado",
      rating: 5,
    });
    expect(context.activities.activities[0]).toMatchObject({
      type: "book_updated",
      metadata: { changedFields: ["title", "rating"] },
    });
    expect(context.events.events[0]?.type).toBe("LibraryEntryUpdated");
  });

  it("retorna NOT_FOUND para livro inexistente", async () => {
    const context = setup();
    await expectApplicationError(
      new UpdateBookEntry(context.dependencies).execute({
        id: "missing",
        title: "Novo",
      }),
      "NOT_FOUND",
    );
  });

  it("rejeita ID, campos protegidos, atualização vazia e dado inválido", async () => {
    const context = setup([plannedBook()]);
    const useCase = new UpdateBookEntry(context.dependencies);
    await expectApplicationError(
      useCase.execute({ id: "", title: "Novo" }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      useCase.execute({ id: "book-1" }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      useCase.execute({ id: "book-1", createdAt: T2, title: "Novo" }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      useCase.execute({ id: "book-1", totalPages: 0 }),
      "VALIDATION_FAILED",
    );
  });

  it("não publica quando o repositório falha", async () => {
    const context = setup([plannedBook()]);
    context.state.failures.add("book_save");
    await expectApplicationError(
      new UpdateBookEntry(context.dependencies).execute({
        id: "book-1",
        title: "Novo",
      }),
      "PERSISTENCE_FAILED",
    );
    expect(context.events.events).toHaveLength(0);
  });
});

describe("GetBookEntry e ListBookEntries", () => {
  it("obtém livro sem modificá-lo", async () => {
    const book = plannedBook();
    const context = setup([book]);
    const result = await new GetBookEntry(context.library).execute({
      id: book.id,
    });
    expect(result).toBe(book);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("valida ID e retorna NOT_FOUND", async () => {
    const context = setup();
    await expectApplicationError(
      new GetBookEntry(context.library).execute({ id: " " }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      new GetBookEntry(context.library).execute({ id: "missing" }),
      "NOT_FOUND",
    );
  });

  it("lista coleção vazia em array congelado", async () => {
    const result = await new ListBookEntries(setup().library).execute();
    expect(result).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("preserva a ordem delegada pelo repositório e não modifica entidades", async () => {
    const second = plannedBook({ id: "book-2", title: "Segundo" });
    const first = plannedBook({ id: "book-1", title: "Primeiro" });
    const result = await new ListBookEntries(
      setup([second, first]).library,
    ).execute();
    expect(result.map(({ id }) => id)).toEqual(["book-2", "book-1"]);
    expect(result[0]).toBe(second);
    expect(Object.isFrozen(result[0])).toBe(true);
  });

  it.each(["book_get", "book_list"] as const)(
    "converte erro de consulta %s sem vazar mensagem interna",
    async (failure) => {
      const context = setup();
      context.state.failures.add(failure);
      const promise =
        failure === "book_get"
          ? new GetBookEntry(context.library).execute({ id: "book-1" })
          : new ListBookEntries(context.library).execute();
      const error = await expectApplicationError(promise, "PERSISTENCE_FAILED");
      expect(error.message).not.toMatch(/SQL|database/i);
    },
  );
});

describe("ListNotesByBook e ListQuotesByBook", () => {
  it("lista somente anotações do livro solicitado e preserva a ordem", async () => {
    const context = setup();
    const note1 = Object.freeze({
      id: "note-1",
      entryId: "book-1",
      content: "Primeira",
      favorite: false,
      tagIds: [],
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    const note2 = Object.freeze({ ...note1, id: "note-2", content: "Segunda" });
    const otherNote = Object.freeze({
      ...note1,
      id: "note-3",
      entryId: "book-2",
    });
    context.notes.notes.set(note1.id, note1);
    context.notes.notes.set(note2.id, note2);
    context.notes.notes.set(otherNote.id, otherNote);
    const quote = Object.freeze({
      id: "quote-1",
      entryId: "book-1",
      content: "Trecho",
      favorite: false,
      tagIds: [],
      location: { type: "book" as const, page: 8 },
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    context.quotes.quotes.set(quote.id, quote);

    const notes = await new ListNotesByBook(context.notes).execute({
      id: "book-1",
    });
    const quotes = await new ListQuotesByBook(context.quotes).execute({
      id: "book-1",
    });

    expect(notes).toEqual([note1, note2]);
    expect(quotes).toEqual([quote]);
    expect(Object.isFrozen(notes)).toBe(true);
    expect(Object.isFrozen(quotes)).toBe(true);
  });

  it("valida o ID e sanitiza falhas de cada repositório", async () => {
    const invalidContext = setup();
    await expectApplicationError(
      new ListNotesByBook(invalidContext.notes).execute({ id: " " }),
      "VALIDATION_FAILED",
    );

    for (const failure of ["note_list", "quote_list"] as const) {
      const context = setup();
      context.state.failures.add(failure);
      const promise =
        failure === "note_list"
          ? new ListNotesByBook(context.notes).execute({ id: "book-1" })
          : new ListQuotesByBook(context.quotes).execute({ id: "book-1" });
      const error = await expectApplicationError(promise, "PERSISTENCE_FAILED");
      expect(error.message).not.toContain("table");
    }
  });
});

describe("ListAllNotes e ListAllQuotes", () => {
  it("lista globalmente em uma única chamada e devolve arrays congelados", async () => {
    const context = setup();
    const note = Object.freeze({
      id: "note-global",
      entryId: "book-1",
      content: "Nota global",
      favorite: false,
      tagIds: [],
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    const quote = Object.freeze({
      id: "quote-global",
      entryId: "book-2",
      content: "Citação global",
      favorite: false,
      tagIds: [],
      createdAt: T1,
      updatedAt: T1,
      revision: 1,
    });
    context.notes.notes.set(note.id, note);
    context.quotes.quotes.set(quote.id, quote);

    const notes = await new ListAllNotes(context.notes).execute();
    const quotes = await new ListAllQuotes(context.quotes).execute();

    expect(notes).toEqual([note]);
    expect(quotes).toEqual([quote]);
    expect(Object.isFrozen(notes)).toBe(true);
    expect(Object.isFrozen(quotes)).toBe(true);
  });

  it("encapsula falhas globais sem expor infraestrutura", async () => {
    for (const failure of ["note_list", "quote_list"] as const) {
      const context = setup();
      context.state.failures.add(failure);
      const promise =
        failure === "note_list"
          ? new ListAllNotes(context.notes).execute()
          : new ListAllQuotes(context.quotes).execute();
      const error = await expectApplicationError(promise, "PERSISTENCE_FAILED");
      expect(error.message).not.toContain("table");
    }
  });
});

describe("UpdateBookProgress", () => {
  it("persiste progresso, atividade e evento na ordem correta", async () => {
    const reading = changeBookStatus(
      plannedBook({ totalPages: 100 }),
      "in_progress",
      T0,
    );
    const context = setup([reading]);
    const updated = await new UpdateBookProgress(context.dependencies).execute({
      id: reading.id,
      currentPage: 45,
    });
    expect(updated).toMatchObject({
      currentPage: 45,
      status: "in_progress",
      revision: 3,
    });
    expect(context.activities.activities[0]?.type).toBe("progress_updated");
    expect(context.events.events[0]?.type).toBe("ProgressUpdated");
    expect(context.state.timeline).toEqual(["entity", "activity", "event"]);
  });

  it("inicia automaticamente um planejado e registra a data do relógio", async () => {
    const original = plannedBook();
    const context = setup([original]);
    const updated = await new UpdateBookProgress(context.dependencies).execute({
      id: original.id,
      currentPage: 1,
    });
    expect(updated).toMatchObject({ status: "in_progress", startedAt: T1 });
    expect(context.events.events[0]?.type).toBe("ProgressUpdated");
  });

  it("mantém um planejado na página zero", async () => {
    const original = plannedBook();
    const context = setup([original]);
    const updated = await new UpdateBookProgress(context.dependencies).execute({
      id: original.id,
      currentPage: 0,
    });
    expect(updated.status).toBe("planned");
    expect(updated.startedAt).toBeUndefined();
  });

  it("conclui ao chegar à última página pela cadeia compartilhada", async () => {
    const reading = changeBookStatus(
      plannedBook({ totalPages: 100 }),
      "in_progress",
      T0,
    );
    const context = setup([reading]);
    const updated = await new UpdateBookProgress(context.dependencies).execute({
      id: reading.id,
      currentPage: 100,
    });
    expect(updated).toMatchObject({
      completedAt: T1,
      currentPage: 100,
      status: "completed",
    });
    expect(context.activities.activities[0]).toMatchObject({
      type: "progress_updated",
      metadata: { currentPage: 100, totalPages: 100 },
    });
    expect(context.events.events[0]?.type).toBe("LibraryEntryCompleted");
    expect(context.state.timeline).toEqual(["entity", "activity", "event"]);
  });

  it("não publica conclusão quando a transação falha", async () => {
    const reading = changeBookStatus(
      plannedBook({ totalPages: 10 }),
      "in_progress",
      T0,
    );
    const context = setup([reading]);
    context.state.failures.add("activity_save");
    await expectApplicationError(
      new UpdateBookProgress(context.dependencies).execute({
        id: reading.id,
        currentPage: 10,
      }),
      "ACTIVITY_PERSISTENCE_FAILED",
    );
    expect(context.library.entries.get(reading.id)).toBe(reading);
    expect(context.events.events).toHaveLength(0);
  });

  it("rejeita progresso inválido e livro inexistente", async () => {
    const context = setup([plannedBook({ totalPages: 10 })]);
    const useCase = new UpdateBookProgress(context.dependencies);
    await expectApplicationError(
      useCase.execute({ id: "book-1", currentPage: -1 }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      useCase.execute({ id: "book-1", currentPage: 11 }),
      "VALIDATION_FAILED",
    );
    await expectApplicationError(
      useCase.execute({ id: "missing", currentPage: 1 }),
      "NOT_FOUND",
    );
  });

  it("não publica evento quando salvar ou registrar atividade falha", async () => {
    for (const failure of ["book_save", "activity_save"] as const) {
      const context = setup([plannedBook()]);
      context.state.failures.add(failure);
      await expectApplicationError(
        new UpdateBookProgress(context.dependencies).execute({
          id: "book-1",
          currentPage: 1,
        }),
        failure === "book_save"
          ? "PERSISTENCE_FAILED"
          : "ACTIVITY_PERSISTENCE_FAILED",
      );
      expect(context.events.events).toHaveLength(0);
    }
  });
});

describe("ChangeBookStatus", () => {
  it.each([
    ["planned", "in_progress"],
    ["planned", "abandoned"],
    ["in_progress", "paused"],
    ["in_progress", "abandoned"],
    ["paused", "in_progress"],
    ["paused", "abandoned"],
    ["abandoned", "in_progress"],
  ] as const)("aplica transição permitida %s → %s", async (from, to) => {
    let book = plannedBook();
    if (from !== "planned") book = changeBookStatus(book, "in_progress", T0);
    if (from === "paused") book = changeBookStatus(book, "paused", T0);
    if (from === "abandoned") book = changeBookStatus(book, "abandoned", T0);
    const context = setup([book]);
    const updated = await new ChangeBookStatus(context.dependencies).execute({
      id: book.id,
      status: to,
    });
    expect(updated.status).toBe(to);
    expect(context.events.events).toHaveLength(1);
    expect(context.events.events[0]?.type).toBe("LibraryEntryUpdated");
  });

  it("conclui uma vez com evento específico e sem duplicação", async () => {
    const reading = changeBookStatus(
      plannedBook({ totalPages: 50, currentPage: 10 }),
      "in_progress",
      T0,
    );
    const context = setup([reading]);
    const useCase = new ChangeBookStatus(context.dependencies);
    const completed = await useCase.execute({
      id: reading.id,
      status: "completed",
    });
    expect(completed).toMatchObject({
      status: "completed",
      currentPage: 50,
      completedAt: T1,
    });
    expect(context.activities.activities).toHaveLength(1);
    expect(context.events.events.map(({ type }) => type)).toEqual([
      "LibraryEntryCompleted",
    ]);

    const repeated = await useCase.execute({
      id: reading.id,
      status: "completed",
    });
    expect(repeated).toBe(completed);
    expect(context.activities.activities).toHaveLength(1);
    expect(context.events.events).toHaveLength(1);
  });

  it("conclui um livro pausado com o mesmo evento específico", async () => {
    const reading = changeBookStatus(
      plannedBook({ totalPages: 20, currentPage: 8 }),
      "in_progress",
      T0,
    );
    const paused = changeBookStatus(reading, "paused", T0);
    const context = setup([paused]);
    const completed = await new ChangeBookStatus(context.dependencies).execute({
      id: paused.id,
      status: "completed",
    });
    expect(completed.status).toBe("completed");
    expect(context.events.events[0]?.type).toBe("LibraryEntryCompleted");
  });

  it("reabre concluído e permite progresso posterior", async () => {
    const completed = completeBook(
      changeBookStatus(plannedBook({ totalPages: 30 }), "in_progress", T0),
      T0,
    );
    const context = setup([completed]);
    const reopened = await new ChangeBookStatus(context.dependencies).execute({
      id: completed.id,
      status: "in_progress",
    });
    expect(reopened.status).toBe("in_progress");
    expect(reopened.completedAt).toBeUndefined();
  });

  it("abandona sem apagar progresso", async () => {
    const reading = changeBookStatus(
      plannedBook({ currentPage: 12 }),
      "in_progress",
      T0,
    );
    const context = setup([reading]);
    const abandoned = await new ChangeBookStatus(context.dependencies).execute({
      id: reading.id,
      status: "abandoned",
    });
    expect(abandoned.currentPage).toBe(12);
  });

  it("converte transição proibida em CONFLICT sem efeitos", async () => {
    const context = setup([plannedBook()]);
    await expectApplicationError(
      new ChangeBookStatus(context.dependencies).execute({
        id: "book-1",
        status: "paused",
      }),
      "CONFLICT",
    );
    expect(context.state.timeline).toEqual([]);
  });

  it("não publica evento quando a persistência falha", async () => {
    const context = setup([plannedBook()]);
    context.state.failures.add("book_save");
    await expectApplicationError(
      new ChangeBookStatus(context.dependencies).execute({
        id: "book-1",
        status: "in_progress",
      }),
      "PERSISTENCE_FAILED",
    );
    expect(context.events.events).toHaveLength(0);
  });
});

describe("AddNote", () => {
  it("confirma o livro, persiste e publica evento sem conteúdo", async () => {
    const context = setup([plannedBook()]);
    const note = await new AddNote(context.dependencies).execute({
      entryId: "book-1",
      content: "  Minha   observação ",
    });
    expect(note).toMatchObject({
      id: "entity-1",
      content: "Minha observação",
      createdAt: T1,
    });
    expect(context.notes.notes.get(note.id)).toBe(note);
    expect(context.activities.activities[0]).toMatchObject({
      type: "note_added",
      metadata: { noteId: note.id },
    });
    expect(context.events.events[0]).toMatchObject({
      type: "NoteCreated",
      payload: { noteId: note.id },
    });
    expect(JSON.stringify(context.events.events)).not.toContain(note.content);
  });

  it("rejeita livro inexistente e conteúdo vazio", async () => {
    const missing = setup();
    await expectApplicationError(
      new AddNote(missing.dependencies).execute({
        entryId: "missing",
        content: "Nota",
      }),
      "NOT_FOUND",
    );
    const existing = setup([plannedBook()]);
    await expectApplicationError(
      new AddNote(existing.dependencies).execute({
        entryId: "book-1",
        content: " ",
      }),
      "VALIDATION_FAILED",
    );
  });

  it("não cria atividade nem evento em falha de persistência", async () => {
    const context = setup([plannedBook()]);
    context.state.failures.add("note_save");
    await expectApplicationError(
      new AddNote(context.dependencies).execute({
        entryId: "book-1",
        content: "Nota",
      }),
      "PERSISTENCE_FAILED",
    );
    expect(context.activities.activities).toHaveLength(0);
    expect(context.events.events).toHaveLength(0);
  });
});

describe("AddQuote", () => {
  it("valida página contra o livro, persiste e omite texto do evento", async () => {
    const context = setup([plannedBook({ totalPages: 80 })]);
    const quote = await new AddQuote(context.dependencies).execute({
      entryId: "book-1",
      content: "  Uma   passagem ",
      page: 80,
    });
    expect(quote).toMatchObject({
      id: "entity-1",
      content: "Uma passagem",
      location: { type: "book", page: 80 },
    });
    expect(context.quotes.quotes.get(quote.id)).toBe(quote);
    expect(context.activities.activities[0]?.type).toBe("quote_added");
    expect(context.events.events[0]).toMatchObject({
      type: "QuoteCreated",
      payload: { quoteId: quote.id, page: 80 },
    });
    expect(JSON.stringify(context.events.events)).not.toContain(quote.content);
  });

  it("rejeita livro inexistente e página superior ao total", async () => {
    const missing = setup();
    await expectApplicationError(
      new AddQuote(missing.dependencies).execute({
        entryId: "missing",
        content: "Trecho",
      }),
      "NOT_FOUND",
    );
    const context = setup([plannedBook({ totalPages: 10 })]);
    await expectApplicationError(
      new AddQuote(context.dependencies).execute({
        entryId: "book-1",
        content: "Trecho",
        page: 11,
      }),
      "VALIDATION_FAILED",
    );
  });

  it("não publica em falha do QuoteRepository", async () => {
    const context = setup([plannedBook()]);
    context.state.failures.add("quote_save");
    await expectApplicationError(
      new AddQuote(context.dependencies).execute({
        entryId: "book-1",
        content: "Trecho",
      }),
      "PERSISTENCE_FAILED",
    );
    expect(context.events.events).toHaveLength(0);
  });
});

describe("isolamento da aplicação", () => {
  it("roda em Node sem DOM, window ou IndexedDB", () => {
    expect("window" in globalThis).toBe(false);
    expect("document" in globalThis).toBe(false);
    expect("indexedDB" in globalThis).toBe(false);
  });

  it("mantém atividades e eventos sem conteúdo pessoal", async () => {
    const context = setup();
    await new CreateBookEntry(context.dependencies).execute({
      title: "Título que não deve aparecer",
      author: "Pessoa privada",
    });
    const serialized = JSON.stringify({
      activities: context.activities.activities,
      events: context.events.events,
    });
    expect(serialized).not.toContain("Título que não deve aparecer");
    expect(serialized).not.toContain("Pessoa privada");
  });
});
