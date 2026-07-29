// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  DomainError,
  InvalidDateError,
  InvalidFieldError,
  InvalidProgressError,
  InvalidRevisionError,
  InvalidStatusTransitionError,
  changeBookStatus,
  changeStatusInputSchema,
  completeBook,
  createBook,
  createBookInputSchema,
  createLibraryEntryCompletedEvent,
  createLibraryEntryCreatedEvent,
  createLibraryEntryUpdatedEvent,
  createNote,
  createNoteCreatedEvent,
  createNoteInputSchema,
  createProgressUpdatedEvent,
  createQuote,
  createQuoteCreatedEvent,
  createQuoteInputSchema,
  getAllowedStatusTransitions,
  updateBibliographicData,
  updateProgress,
  updateProgressInputSchema,
  type BookEntry,
  type EntryStatus,
  type LibraryEntry,
} from "./index";

const T0 = "2026-07-29T10:00:00.000Z";
const T1 = "2026-07-29T11:00:00.000Z";
const T2 = "2026-07-29T12:00:00.000Z";

function minimalBook(
  overrides: Partial<Parameters<typeof createBook>[0]> = {},
) {
  return createBook({
    id: "book-1",
    title: "Livro",
    createdAt: T0,
    ...overrides,
  });
}

function bookInStatus(status: EntryStatus): BookEntry {
  const planned = minimalBook();
  if (status === "planned") return planned;
  const reading = changeBookStatus(planned, "in_progress", T1);
  if (status === "in_progress") return reading;
  if (status === "paused") return changeBookStatus(reading, "paused", T2);
  if (status === "completed") return completeBook(reading, T2);
  return changeBookStatus(reading, "abandoned", T2);
}

describe("BookEntry", () => {
  it("cria o livro mínimo com metadados e defaults", () => {
    const book: LibraryEntry = minimalBook();

    expect(book).toEqual({
      id: "book-1",
      type: "book",
      title: "Livro",
      status: "planned",
      currentPage: 0,
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    expect(Object.isFrozen(book)).toBe(true);
  });

  it("cria livro completo somente com campos aprovados", () => {
    const book = minimalBook({
      title: "  Cem   anos de solidão ",
      author: " Gabriel   García Márquez ",
      status: "in_progress",
      totalPages: 432,
      currentPage: 21,
      rating: 5,
      startedAt: T0,
    });

    expect(book).toMatchObject({
      title: "Cem anos de solidão",
      author: "Gabriel García Márquez",
      totalPages: 432,
      currentPage: 21,
      rating: 5,
      startedAt: T0,
    });
  });

  it("normaliza espaços externos, internos, quebras e tabs no título", () => {
    expect(minimalBook({ title: "  A\n\t longa   viagem  " }).title).toBe(
      "A longa viagem",
    );
  });

  it.each(["", "   ", "\n\t"])("rejeita título vazio %#", (title) => {
    expect(() => minimalBook({ title })).toThrow(InvalidFieldError);
  });

  it.each([0, -1, 1.5])(
    "rejeita total de páginas inválido: %s",
    (totalPages) => {
      expect(() => minimalBook({ totalPages })).toThrow(InvalidProgressError);
    },
  );

  it("rejeita ID vazio", () => {
    expect(() => minimalBook({ id: "  " })).toThrow(InvalidFieldError);
  });

  it("rejeita página atual negativa ou decimal", () => {
    expect(() => minimalBook({ currentPage: -1 })).toThrow(
      InvalidProgressError,
    );
    expect(() => minimalBook({ currentPage: 1.5 })).toThrow(
      InvalidProgressError,
    );
  });

  it("rejeita página acima do total conhecido", () => {
    expect(() => minimalBook({ totalPages: 10, currentPage: 11 })).toThrow(
      InvalidProgressError,
    );
  });

  it("aceita progresso sem total conhecido", () => {
    expect(minimalBook({ currentPage: 900 }).currentPage).toBe(900);
  });

  it.each([1, 5])("aceita avaliação no limite %s", (rating) => {
    expect(minimalBook({ rating }).rating).toBe(rating);
  });

  it.each([0, 6, 2.5])("rejeita avaliação fora da faixa: %s", (rating) => {
    expect(() => minimalBook({ rating })).toThrow(InvalidFieldError);
  });

  it("rejeita datas não UTC, impossíveis ou posteriores regressivas", () => {
    expect(() => minimalBook({ createdAt: "2026-07-29" })).toThrow(
      InvalidDateError,
    );
    expect(() =>
      minimalBook({ createdAt: "2026-02-30T10:00:00.000Z" }),
    ).toThrow(InvalidDateError);
    expect(() =>
      updateProgress(minimalBook(), 1, "2026-07-29T09:00:00.000Z"),
    ).toThrow(InvalidDateError);
  });

  it("não expõe DOM no ambiente dos testes de domínio", () => {
    expect("document" in globalThis).toBe(false);
    expect("window" in globalThis).toBe(false);
  });
});

describe("operações de livro", () => {
  it("atualiza dados bibliográficos, normaliza e incrementa revisão", () => {
    const original = minimalBook({
      author: "Autora",
      totalPages: 100,
      rating: 3,
    });
    const updated = updateBibliographicData(original, {
      title: "  Novo   título ",
      author: " ",
      totalPages: 120,
      rating: 5,
      updatedAt: T1,
    });

    expect(updated).toMatchObject({
      id: original.id,
      title: "Novo título",
      totalPages: 120,
      rating: 5,
      revision: 2,
      createdAt: original.createdAt,
      updatedAt: T1,
    });
    expect(updated.author).toBeUndefined();
  });

  it("remove total e avaliação somente por null explícito", () => {
    const updated = updateBibliographicData(
      minimalBook({ totalPages: 100, rating: 4 }),
      { totalPages: null, rating: null, updatedAt: T1 },
    );
    expect(updated.totalPages).toBeUndefined();
    expect(updated.rating).toBeUndefined();
  });

  it("preserva ID e createdAt e não altera o objeto recebido", () => {
    const original = minimalBook();
    const snapshot = { ...original };
    const updated = updateProgress(original, 12, T1);

    expect(original).toEqual(snapshot);
    expect(updated).not.toBe(original);
    expect(updated.id).toBe(original.id);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.revision).toBe(original.revision + 1);
  });

  it("não conclui automaticamente ao alcançar o total", () => {
    const reading = bookInStatus("in_progress");
    const withTotal = updateBibliographicData(reading, {
      totalPages: 10,
      updatedAt: T2,
    });
    const progressed = updateProgress(withTotal, 10, T2);
    expect(progressed.status).toBe("in_progress");
    expect(progressed.completedAt).toBeUndefined();
  });

  it("conclui com total conhecido ajustando a página e a revisão", () => {
    const reading = changeBookStatus(
      minimalBook({ totalPages: 200, currentPage: 53 }),
      "in_progress",
      T1,
    );
    const completed = completeBook(reading, T2);
    expect(completed).toMatchObject({
      status: "completed",
      currentPage: 200,
      completedAt: T2,
      revision: 3,
    });
  });

  it("conclui manualmente sem total conhecido", () => {
    const completed = completeBook(bookInStatus("in_progress"), T2);
    expect(completed.status).toBe("completed");
    expect(completed.totalPages).toBeUndefined();
  });

  it("torna a conclusão repetida idempotente", () => {
    const completed = bookInStatus("completed");
    expect(completeBook(completed, T2)).toBe(completed);
  });

  it("exige sair de concluído antes de reduzir progresso", () => {
    const completed = completeBook(
      changeBookStatus(minimalBook({ totalPages: 100 }), "in_progress", T1),
      T2,
    );
    expect(() => updateProgress(completed, 80, T2)).toThrow(
      InvalidStatusTransitionError,
    );
    const reopened = changeBookStatus(completed, "in_progress", T2);
    expect(updateProgress(reopened, 80, T2).currentPage).toBe(80);
  });

  it("retoma pausado e preserva progresso ao abandonar", () => {
    const reading = updateProgress(bookInStatus("in_progress"), 37, T2);
    const paused = changeBookStatus(reading, "paused", T2);
    const resumed = changeBookStatus(paused, "in_progress", T2);
    const abandoned = changeBookStatus(resumed, "abandoned", T2);
    expect(resumed.currentPage).toBe(37);
    expect(abandoned.currentPage).toBe(37);
  });

  it.each([
    ["planned", "in_progress"],
    ["planned", "abandoned"],
    ["in_progress", "paused"],
    ["in_progress", "completed"],
    ["in_progress", "abandoned"],
    ["paused", "in_progress"],
    ["paused", "completed"],
    ["paused", "abandoned"],
    ["completed", "in_progress"],
    ["abandoned", "in_progress"],
  ] as const)("permite transição %s → %s", (from, to) => {
    const source = bookInStatus(from);
    expect(changeBookStatus(source, to, T2).status).toBe(to);
  });

  it.each([
    ["planned", "paused"],
    ["planned", "completed"],
    ["paused", "planned"],
    ["completed", "abandoned"],
    ["abandoned", "completed"],
  ] as const)("proíbe transição %s → %s", (from, to) => {
    expect(() => changeBookStatus(bookInStatus(from), to, T2)).toThrow(
      InvalidStatusTransitionError,
    );
  });

  it("expõe a matriz sem permitir mutação do estado interno", () => {
    expect(getAllowedStatusTransitions("planned")).toEqual([
      "in_progress",
      "abandoned",
    ]);
  });
});

describe("Note e Quote", () => {
  it("cria nota normalizada com metadados", () => {
    expect(
      createNote({
        id: "note-1",
        entryId: "book-1",
        content: "  uma\n nota ",
        createdAt: T0,
      }),
    ).toEqual({
      id: "note-1",
      entryId: "book-1",
      content: "uma nota",
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
  });

  it("rejeita nota vazia", () => {
    expect(() =>
      createNote({
        id: "note-1",
        entryId: "book-1",
        content: "  ",
        createdAt: T0,
      }),
    ).toThrow(InvalidFieldError);
  });

  it("cria citação com página válida no livro relacionado", () => {
    const book = minimalBook({ totalPages: 90 });
    expect(
      createQuote(
        {
          id: "quote-1",
          entryId: book.id,
          content: " Trecho ",
          page: 90,
          createdAt: T0,
        },
        book,
      ),
    ).toMatchObject({ content: "Trecho", page: 90, revision: 1 });
  });

  it.each([0, -1, 91])("rejeita página de citação inválida: %s", (page) => {
    const book = minimalBook({ totalPages: 90 });
    expect(() =>
      createQuote(
        {
          id: "quote-1",
          entryId: book.id,
          content: "Trecho",
          page,
          createdAt: T0,
        },
        book,
      ),
    ).toThrow(InvalidProgressError);
  });

  it("rejeita contexto de livro diferente da referência", () => {
    expect(() =>
      createQuote(
        { id: "quote-1", entryId: "outro", content: "Trecho", createdAt: T0 },
        minimalBook(),
      ),
    ).toThrow(InvalidProgressError);
  });
});

describe("schemas Zod de fronteira", () => {
  it("recebe unknown, valida, normaliza e produz entrada para a factory", () => {
    const unknownInput: unknown = {
      id: " book-1 ",
      title: "  Título   seguro ",
      totalPages: 100,
      createdAt: T0,
    };
    const parsed = createBookInputSchema.parse(unknownInput);
    expect(createBook(parsed).title).toBe("Título seguro");
  });

  it("rejeita tipos, campos extras e data sem UTC", () => {
    expect(createBookInputSchema.safeParse({ title: 1 }).success).toBe(false);
    expect(
      createBookInputSchema.safeParse({
        id: "1",
        title: "x",
        createdAt: T0,
        secret: true,
      }).success,
    ).toBe(false);
    expect(
      createBookInputSchema.safeParse({
        id: "1",
        title: "x",
        createdAt: "2026-07-29",
      }).success,
    ).toBe(false);
  });

  it("valida fronteiras de progresso, status, nota e citação", () => {
    expect(
      updateProgressInputSchema.safeParse({ currentPage: -1, updatedAt: T1 })
        .success,
    ).toBe(false);
    expect(
      changeStatusInputSchema.safeParse({ status: "movie", updatedAt: T1 })
        .success,
    ).toBe(false);
    expect(
      createNoteInputSchema.safeParse({
        id: "n",
        entryId: "b",
        content: " ",
        createdAt: T1,
      }).success,
    ).toBe(false);
    expect(
      createQuoteInputSchema.safeParse({
        id: "q",
        entryId: "b",
        content: "x",
        page: 0,
        createdAt: T1,
      }).success,
    ).toBe(false);
  });

  it("não substitui invariantes relacionais do domínio", () => {
    const parsed = createBookInputSchema.parse({
      id: "book-1",
      title: "Livro",
      totalPages: 10,
      currentPage: 11,
      createdAt: T0,
    });
    expect(() => createBook(parsed)).toThrow(InvalidProgressError);
  });
});

describe("eventos de domínio", () => {
  const metadata = {
    eventId: "event-1",
    aggregateId: "book-1",
    occurredAt: T1,
    revision: 2,
  };

  it("define os seis eventos com nomes estáveis e payload mínimo", () => {
    const events = [
      createLibraryEntryCreatedEvent({
        ...metadata,
        payload: { entryType: "book", status: "planned" },
      }),
      createLibraryEntryUpdatedEvent({
        ...metadata,
        payload: { changedFields: ["title"] },
      }),
      createProgressUpdatedEvent({
        ...metadata,
        payload: { currentPage: 12, totalPages: 100 },
      }),
      createLibraryEntryCompletedEvent({
        ...metadata,
        payload: { completedAt: T1 },
      }),
      createNoteCreatedEvent({ ...metadata, payload: { noteId: "note-1" } }),
      createQuoteCreatedEvent({
        ...metadata,
        payload: { quoteId: "quote-1", page: 7 },
      }),
    ];
    expect(events.map(({ type }) => type)).toEqual([
      "LibraryEntryCreated",
      "LibraryEntryUpdated",
      "ProgressUpdated",
      "LibraryEntryCompleted",
      "NoteCreated",
      "QuoteCreated",
    ]);
    expect(JSON.stringify(events)).not.toContain("conteúdo pessoal");
    expect(events.every(Object.isFrozen)).toBe(true);
  });

  it("valida IDs, data e revisão dos eventos", () => {
    expect(() =>
      createNoteCreatedEvent({
        ...metadata,
        eventId: "",
        payload: { noteId: "n" },
      }),
    ).toThrow(InvalidFieldError);
    expect(() =>
      createNoteCreatedEvent({
        ...metadata,
        occurredAt: "agora",
        payload: { noteId: "n" },
      }),
    ).toThrow(InvalidDateError);
    expect(() =>
      createNoteCreatedEvent({
        ...metadata,
        revision: 0,
        payload: { noteId: "n" },
      }),
    ).toThrow(InvalidRevisionError);
  });
});

describe("estratégia de erros", () => {
  it("oferece código e campo tipados", () => {
    try {
      minimalBook({ title: "" });
      throw new Error("esperava falha");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(DomainError);
      if (error instanceof DomainError) {
        expect(error.code).toBe("INVALID_FIELD");
        expect(error.field).toBe("title");
        expect(error.message).not.toBe("Erro");
      }
    }
  });
});
