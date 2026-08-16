import { describe, expect, it } from "vitest";

import { createBook } from "./book";
import {
  createNote,
  createQuote,
  updateNote,
  updateQuote,
} from "./annotations";

const createdAt = "2026-08-16T10:00:00.000Z";
const updatedAt = "2026-08-16T11:00:00.000Z";
const book = createBook({
  id: "book-1",
  title: "Livro fictício",
  totalPages: 100,
  createdAt,
});

describe("edição de anotações", () => {
  it("edita nota preservando identidade e histórico", () => {
    const note = createNote({
      id: "note-1",
      entryId: book.id,
      content: "Antes",
      createdAt,
    });
    const updated = updateNote(note, {
      content: "  Depois   revisado ",
      updatedAt,
    });
    expect(updated).toEqual({
      ...note,
      content: "Depois revisado",
      updatedAt,
      revision: 2,
    });
    expect(updated).not.toBe(note);
  });

  it("rejeita nota vazia e instante anterior", () => {
    const note = createNote({
      id: "note-1",
      entryId: book.id,
      content: "Antes",
      createdAt,
    });
    expect(() => updateNote(note, { content: "  ", updatedAt })).toThrow();
    expect(() =>
      updateNote(note, {
        content: "Depois",
        updatedAt: "2026-08-15T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("edita citação, permite remover página e respeita total conhecido", () => {
    const quote = createQuote(
      {
        id: "quote-1",
        entryId: book.id,
        content: "Antes",
        page: 20,
        createdAt,
      },
      book,
    );
    expect(updateQuote(quote, { content: "Depois", updatedAt }, book)).toEqual({
      ...quote,
      content: "Depois",
      page: undefined,
      updatedAt,
      revision: 2,
    });
    expect(() =>
      updateQuote(quote, { content: "Depois", page: 101, updatedAt }, book),
    ).toThrow();
    expect(() =>
      updateQuote(quote, { content: "Depois", page: 0, updatedAt }, book),
    ).toThrow();
  });

  it("aceita página positiva sem total conhecido e preserva ID", () => {
    const withoutTotal = createBook({
      id: "book-2",
      title: "Sem total",
      createdAt,
    });
    const quote = createQuote({
      id: "quote-2",
      entryId: withoutTotal.id,
      content: "Antes",
      createdAt,
    });
    const updated = updateQuote(
      quote,
      { content: "Depois", page: 900, updatedAt },
      withoutTotal,
    );
    expect(updated).toMatchObject({
      id: quote.id,
      createdAt,
      page: 900,
      revision: 2,
    });
  });
});
