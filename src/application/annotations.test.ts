// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  createBook,
  createNote,
  createQuote,
  type Note,
  type Quote,
} from "../domain";
import {
  DeleteNote,
  DeleteQuote,
  ShareNote,
  ShareQuote,
  UpdateNote,
  UpdateQuote,
} from "./annotations";
import type {
  AnnotationSharePort,
  ApplicationTransactionRunner,
  LibraryEntryRepository,
  NoteRepository,
  QuoteRepository,
} from "./ports";

const createdAt = "2026-08-16T10:00:00.000Z";
const updatedAt = "2026-08-16T11:00:00.000Z";
const book = createBook({
  id: "book-1",
  title: "Livro de Ensaio",
  author: "Pessoa Fictícia",
  totalPages: 120,
  createdAt,
});
const note = createNote({
  id: "note-1",
  entryId: book.id,
  content: "Nota inicial",
  createdAt,
});
const quote = createQuote(
  {
    id: "quote-1",
    entryId: book.id,
    content: "Citação inicial",
    location: { type: "book", page: 12 },
    createdAt,
  },
  book,
);

class Notes implements NoteRepository {
  readonly values = new Map([[note.id, note]]);
  failSave = false;
  delete(id: string) {
    return Promise.resolve(this.values.delete(id));
  }
  getById(id: string) {
    return Promise.resolve(this.values.get(id));
  }
  list() {
    return Promise.resolve([...this.values.values()]);
  }
  listByEntryId(entryId: string) {
    return Promise.resolve(
      [...this.values.values()].filter((item) => item.entryId === entryId),
    );
  }
  save(value: Note) {
    if (this.failSave)
      return Promise.reject(new Error("private database path"));
    this.values.set(value.id, value);
    return Promise.resolve();
  }
}

class Quotes implements QuoteRepository {
  readonly values = new Map([[quote.id, quote]]);
  failDelete = false;
  delete(id: string) {
    if (this.failDelete)
      return Promise.reject(new Error("private database path"));
    return Promise.resolve(this.values.delete(id));
  }
  getById(id: string) {
    return Promise.resolve(this.values.get(id));
  }
  list() {
    return Promise.resolve([...this.values.values()]);
  }
  listByEntryId(entryId: string) {
    return Promise.resolve(
      [...this.values.values()].filter((item) => item.entryId === entryId),
    );
  }
  save(value: Quote) {
    this.values.set(value.id, value);
    return Promise.resolve();
  }
}

const books: LibraryEntryRepository = {
  getById: (id) => Promise.resolve(id === book.id ? book : undefined),
  list: () => Promise.resolve([book]),
  save: () => Promise.resolve(),
};
const transaction: ApplicationTransactionRunner = {
  run: (operation) => operation(),
};
const clock = { now: () => Promise.resolve(updatedAt) };

describe("casos de uso de anotações", () => {
  it("atualiza nota e citação sem novo ID, evento de criação ou milestone", async () => {
    const notes = new Notes();
    const quotes = new Quotes();
    const updatedNote = await new UpdateNote({
      clock,
      notes,
      transaction,
    }).execute({
      id: note.id,
      content: "Nota revisada",
    });
    const updatedQuote = await new UpdateQuote({
      clock,
      libraryEntries: books,
      quotes,
      transaction,
    }).execute({ id: quote.id, content: "Citação revisada", page: 20 });
    expect(updatedNote).toMatchObject({
      id: note.id,
      revision: 2,
      content: "Nota revisada",
    });
    expect(updatedQuote).toMatchObject({
      id: quote.id,
      revision: 2,
      location: { type: "book", page: 20 },
    });
    expect(notes.values.size).toBe(1);
    expect(quotes.values.size).toBe(1);
  });

  it("retorna not-found e sanitiza falha de persistência", async () => {
    const notes = new Notes();
    await expect(
      new UpdateNote({ clock, notes, transaction }).execute({
        id: "missing",
        content: "x",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    notes.failSave = true;
    await expect(
      new UpdateNote({ clock, notes, transaction }).execute({
        id: note.id,
        content: "x",
      }),
    ).rejects.toMatchObject({
      code: "PERSISTENCE_FAILED",
      message: "Não foi possível salvar os dados.",
    });
  });

  it("exclui cada tipo e preserva os demais", async () => {
    const notes = new Notes();
    const quotes = new Quotes();
    await expect(
      new DeleteNote({ notes, transaction }).execute({ id: note.id }),
    ).resolves.toEqual({ deleted: true });
    expect(notes.values.size).toBe(0);
    expect(quotes.values.size).toBe(1);
    await expect(
      new DeleteQuote({ quotes, transaction }).execute({ id: quote.id }),
    ).resolves.toEqual({ deleted: true });
    expect(quotes.values.size).toBe(0);
  });

  it("falha de exclusão mantém item e retorna erro público", async () => {
    const quotes = new Quotes();
    quotes.failDelete = true;
    await expect(
      new DeleteQuote({ quotes, transaction }).execute({ id: quote.id }),
    ).rejects.toMatchObject({
      code: "PERSISTENCE_FAILED",
    });
    expect(quotes.values.get(quote.id)).toEqual(quote);
  });

  it("compartilha somente texto humano e trata cancelamento, indisponibilidade e falha", async () => {
    const notes = new Notes();
    const quotes = new Quotes();
    const shareCall = vi.fn<AnnotationSharePort["share"]>(() =>
      Promise.resolve("flow-finished"),
    );
    const share: AnnotationSharePort = { share: shareCall };
    await expect(
      new ShareNote(notes, books, share).execute({ id: note.id }),
    ).resolves.toBe("flow-finished");
    await expect(
      new ShareQuote(quotes, books, share).execute({ id: quote.id }),
    ).resolves.toBe("flow-finished");
    const texts = shareCall.mock.calls.map(([input]) => input.text);
    expect(texts[0]).toContain("Nota inicial");
    expect(texts[1]).toContain("Página 12");
    expect(texts.join(" ")).not.toMatch(/note-1|quote-1|revision|2026-08/u);

    shareCall.mockResolvedValueOnce("cancelled");
    await expect(
      new ShareNote(notes, books, share).execute({ id: note.id }),
    ).resolves.toBe("cancelled");
    shareCall.mockResolvedValueOnce("unavailable");
    await expect(
      new ShareNote(notes, books, share).execute({ id: note.id }),
    ).rejects.toMatchObject({ code: "SHARE_UNAVAILABLE" });
    shareCall.mockRejectedValueOnce(new Error("private"));
    await expect(
      new ShareNote(notes, books, share).execute({ id: note.id }),
    ).rejects.toMatchObject({ code: "SHARE_FAILED" });
  });
});
