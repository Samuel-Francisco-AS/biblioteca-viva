// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import {
  createBook,
  createNote,
  createQuote,
  updateNote,
  updateQuote,
} from "../../domain";
import { BibliotecaDatabase } from "./database";
import {
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
} from "./repositories";

const databases = new Set<string>();
afterEach(async () => {
  await Promise.all([...databases].map((name) => Dexie.delete(name)));
  databases.clear();
});

describe("repositórios Dexie de anotações", () => {
  it("atualiza, exclui, consulta global/por livro e preserva outras entidades após reabrir", async () => {
    const name = `annotations-${crypto.randomUUID()}`;
    databases.add(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const books = new DexieLibraryEntryRepository(database);
    const notes = new DexieNoteRepository(database);
    const quotes = new DexieQuoteRepository(database);
    const createdAt = "2026-08-16T10:00:00.000Z";
    const book = createBook({
      id: "book-1",
      title: "Livro fictício",
      totalPages: 80,
      createdAt,
    });
    const noteA = createNote({
      id: "note-a",
      entryId: book.id,
      content: "Nota A",
      createdAt,
    });
    const noteB = createNote({
      id: "note-b",
      entryId: book.id,
      content: "Nota B",
      createdAt,
    });
    const quote = createQuote(
      {
        id: "quote-a",
        entryId: book.id,
        content: "Citação A",
        location: { type: "book", page: 8 },
        createdAt,
      },
      book,
    );
    await books.save(book);
    await notes.save(noteA);
    await notes.save(noteB);
    await quotes.save(quote);
    await notes.save(
      updateNote(noteA, {
        content: "Nota atualizada",
        updatedAt: "2026-08-16T11:00:00.000Z",
      }),
    );
    await quotes.save(
      updateQuote(
        quote,
        {
          content: "Citação atualizada",
          location: { type: "book", page: 9 },
          updatedAt: "2026-08-16T11:00:00.000Z",
        },
        book,
      ),
    );
    expect(await notes.delete(noteB.id)).toBe(true);
    expect(await notes.delete(noteB.id)).toBe(false);
    database.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    const reopenedNotes = new DexieNoteRepository(reopened);
    const reopenedQuotes = new DexieQuoteRepository(reopened);
    await expect(reopenedNotes.getById(noteA.id)).resolves.toMatchObject({
      content: "Nota atualizada",
      revision: 2,
    });
    await expect(reopenedNotes.listByEntryId(book.id)).resolves.toHaveLength(1);
    await expect(reopenedNotes.list()).resolves.toHaveLength(1);
    await expect(reopenedQuotes.getById(quote.id)).resolves.toMatchObject({
      content: "Citação atualizada",
      location: { type: "book", page: 9 },
      revision: 2,
    });
    await expect(
      new DexieLibraryEntryRepository(reopened).getById(book.id),
    ).resolves.toEqual(book);
    reopened.close();
  });
});
