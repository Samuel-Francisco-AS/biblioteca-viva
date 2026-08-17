// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { createBook, createNote, createQuote } from "../domain";
import {
  BibliotecaDatabase,
  DexieActivityRepository,
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
  DexieSessionRepository,
  DexieTagRepository,
  DexieTransactionRunner,
  LocalEventBus,
} from "../infrastructure";
import {
  CreateTag,
  DeleteTag,
  OrganizeLibraryEntry,
  OrganizeNote,
  OrganizeQuote,
  RenameTag,
  type ApplicationDependencies,
} from ".";

const names = new Set<string>();
afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

async function dependencies(): Promise<{
  database: BibliotecaDatabase;
  value: ApplicationDependencies;
}> {
  const name = `tags-${crypto.randomUUID()}`;
  names.add(name);
  const database = new BibliotecaDatabase(name);
  await database.open();
  let id = 0;
  return {
    database,
    value: {
      activities: new DexieActivityRepository(database),
      clock: { now: () => Promise.resolve("2026-08-16T10:00:00.000Z") },
      events: new LocalEventBus(),
      ids: { generate: () => Promise.resolve(`id-${++id}`) },
      libraryEntries: new DexieLibraryEntryRepository(database),
      notes: new DexieNoteRepository(database),
      quotes: new DexieQuoteRepository(database),
      sessions: new DexieSessionRepository(database),
      tags: new DexieTagRepository(database),
      transaction: new DexieTransactionRunner(database),
    },
  };
}

describe("casos de uso de etiquetas e favoritos", () => {
  it("impede duplicata Unicode/case-insensitive, associa e renomeia por ID", async () => {
    const test = await dependencies();
    const first = await new CreateTag(test.value).execute({ name: " Python " });
    await expect(
      new CreateTag(test.value).execute({ name: "PYTHON" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    const book = createBook({
      id: "book-1",
      title: "Livro",
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    await test.value.libraryEntries.save(book);
    expect(
      await new OrganizeLibraryEntry(test.value).execute({
        id: book.id,
        favorite: true,
        tagIds: [first.id],
      }),
    ).toMatchObject({ favorite: true, tagIds: [first.id] });
    expect(
      await new RenameTag(test.value).execute({
        id: first.id,
        name: "TypeScript",
      }),
    ).toMatchObject({ id: first.id, normalizedName: "typescript" });
    test.database.close();
  });

  it("exclui tag de entry/note/quote atomicamente sem excluir conteúdo", async () => {
    const test = await dependencies();
    const tag = await new CreateTag(test.value).execute({ name: "Importante" });
    const book = createBook({
      id: "book-1",
      title: "Livro",
      tagIds: [tag.id],
      createdAt: "2026-08-16T09:00:00.000Z",
    });
    const note = createNote({
      id: "note-1",
      entryId: book.id,
      content: "Nota",
      tagIds: [tag.id],
      createdAt: book.createdAt,
    });
    const quote = createQuote({
      id: "quote-1",
      entryId: book.id,
      content: "Citação",
      tagIds: [tag.id],
      createdAt: book.createdAt,
    });
    await test.value.libraryEntries.save(book);
    await test.value.notes.save(note);
    await test.value.quotes.save(quote);
    await new OrganizeNote(test.value).execute({
      id: note.id,
      favorite: true,
      tagIds: [tag.id],
    });
    await new OrganizeQuote(test.value).execute({
      id: quote.id,
      favorite: true,
      tagIds: [tag.id],
    });
    await new DeleteTag(test.value).execute({ id: tag.id });
    expect(await test.value.tags.list()).toEqual([]);
    expect(await test.value.libraryEntries.getById(book.id)).toMatchObject({
      tagIds: [],
    });
    expect(await test.value.notes.getById(note.id)).toMatchObject({
      favorite: true,
      tagIds: [],
    });
    expect(await test.value.quotes.getById(quote.id)).toMatchObject({
      favorite: true,
      tagIds: [],
    });
    test.database.close();
  });
});
