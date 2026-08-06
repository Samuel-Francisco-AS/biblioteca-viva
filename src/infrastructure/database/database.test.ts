// @vitest-environment node

import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createActivity } from "../../application";
import { createBook, createNote, createQuote } from "../../domain";
import { BibliotecaDatabase } from "./database";
import { DexieBookDeletionStore } from "./bookDeletionStore";
import { InfrastructureError } from "./errors";
import {
  DexieActivityRepository,
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
} from "./repositories";
import {
  DATABASE_SCHEMA_V1,
  DATABASE_VERSION,
  SCHEMA_MARKER_KEY,
  type PersistedBook,
} from "./schema";
import { DexieTransactionRunner } from "./transactionRunner";

const T0 = "2026-07-29T10:00:00.000Z";
const T1 = "2026-07-29T11:00:00.000Z";
let databaseSequence = 0;
const databases = new Set<string>();

function databaseName(label: string): string {
  databaseSequence += 1;
  const name = `biblioteca-viva-test-${label}-${databaseSequence}`;
  databases.add(name);
  return name;
}

function book(id = "book-1", createdAt = T0) {
  return createBook({ id, title: `Livro ${id}`, createdAt });
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all([...databases].map((name) => Dexie.delete(name)));
  databases.clear();
});

async function seedDeletionGraph(database: BibliotecaDatabase) {
  const firstBook = book("book-1");
  const otherBook = book("book-2", T1);
  await database.libraryEntries.bulkPut([firstBook, otherBook]);
  await database.notes.bulkPut([
    createNote({
      id: "note-1",
      entryId: firstBook.id,
      content: "Nota fictícia",
      createdAt: T0,
    }),
    createNote({
      id: "note-2",
      entryId: otherBook.id,
      content: "Outra nota fictícia",
      createdAt: T1,
    }),
  ]);
  await database.quotes.bulkPut([
    createQuote({
      id: "quote-1",
      entryId: firstBook.id,
      content: "Citação fictícia",
      createdAt: T0,
    }),
    createQuote({
      id: "quote-2",
      entryId: otherBook.id,
      content: "Outra citação fictícia",
      createdAt: T1,
    }),
  ]);
  await database.activities.bulkPut([
    createActivity({
      id: "activity-1",
      type: "book_created",
      aggregateId: firstBook.id,
      occurredAt: T0,
      revision: 1,
      metadata: { status: "planned" },
    }),
    createActivity({
      id: "activity-2",
      type: "book_created",
      aggregateId: otherBook.id,
      occurredAt: T1,
      revision: 1,
      metadata: { status: "planned" },
    }),
  ]);
  await database.settings.put({ key: "motion", value: false, updatedAt: T0 });
  await database.metadata.put({
    key: "technical",
    value: "kept",
    updatedAt: T0,
  });
}

describe("exclusão transacional de livro", () => {
  it("remove o agregado e preserva todos os dados não associados", async () => {
    const name = databaseName("delete-book");
    const database = new BibliotecaDatabase(name);
    await database.open();
    await seedDeletionGraph(database);

    await expect(
      new DexieBookDeletionStore(database).deleteBookEntry("book-1"),
    ).resolves.toBe("deleted");
    expect(await database.libraryEntries.toCollection().primaryKeys()).toEqual([
      "book-2",
    ]);
    expect(await database.notes.toCollection().primaryKeys()).toEqual([
      "note-2",
    ]);
    expect(await database.quotes.toCollection().primaryKeys()).toEqual([
      "quote-2",
    ]);
    expect(await database.activities.toCollection().primaryKeys()).toEqual([
      "activity-2",
    ]);
    expect(await database.settings.get("motion")).toBeDefined();
    expect(await database.metadata.get("technical")).toBeDefined();
    database.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.get("book-1")).toBeUndefined();
    expect(await reopened.notes.where("entryId").equals("book-1").count()).toBe(
      0,
    );
    reopened.close();
  });

  it("não altera nada quando o livro não existe", async () => {
    const database = new BibliotecaDatabase(databaseName("delete-missing"));
    await database.open();
    await seedDeletionGraph(database);
    const before = await Promise.all(
      database.tables.map((table) => table.count()),
    );
    await expect(
      new DexieBookDeletionStore(database).deleteBookEntry("missing"),
    ).resolves.toBe("not-found");
    const after = await Promise.all(
      database.tables.map((table) => table.count()),
    );
    expect(after).toEqual(before);
    database.close();
  });

  it("preserva tudo quando a transação não consegue iniciar", async () => {
    const name = databaseName("transaction-start-failure");
    const database = new BibliotecaDatabase(name);
    await database.open();
    await seedDeletionGraph(database);
    database.close({ disableAutoOpen: true });

    await expect(
      new DexieBookDeletionStore(database).deleteBookEntry("book-1"),
    ).rejects.toMatchObject({ name: "InfrastructureError" });

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.count()).toBe(2);
    expect(await reopened.notes.count()).toBe(2);
    expect(await reopened.quotes.count()).toBe(2);
    expect(await reopened.activities.count()).toBe(2);
    reopened.close();
  });

  it.each(["notes", "quotes", "activities"] as const)(
    "faz rollback quando a remoção falha em %s",
    async (tableName) => {
      const database = new BibliotecaDatabase(
        databaseName(`rollback-${tableName}`),
      );
      await database.open();
      await seedDeletionGraph(database);
      vi.spyOn(database[tableName], "where").mockImplementationOnce(() => {
        throw new Error("falha injetada");
      });

      await expect(
        new DexieBookDeletionStore(database).deleteBookEntry("book-1"),
      ).rejects.toMatchObject({ name: "InfrastructureError" });
      expect(await database.libraryEntries.get("book-1")).toBeDefined();
      expect(
        await database.notes.where("entryId").equals("book-1").count(),
      ).toBe(1);
      expect(
        await database.quotes.where("entryId").equals("book-1").count(),
      ).toBe(1);
      expect(
        await database.activities.where("aggregateId").equals("book-1").count(),
      ).toBe(1);
      database.close();
    },
  );
});

describe("BibliotecaDatabase e migrações", () => {
  it("abre o schema atual com as seis tabelas e versão 2", async () => {
    const database = new BibliotecaDatabase(databaseName("open"));
    await database.open();

    expect(database.verno).toBe(DATABASE_VERSION);
    expect(database.tables.map(({ name }) => name).sort()).toEqual([
      "activities",
      "libraryEntries",
      "metadata",
      "notes",
      "quotes",
      "settings",
    ]);
    database.close();
  });

  it("migra v1 para v2 preservando livro e criando marcador técnico", async () => {
    const name = databaseName("migration");
    const legacy = new Dexie(name);
    legacy.version(1).stores(DATABASE_SCHEMA_V1);
    await legacy.open();
    const original = book();
    await legacy
      .table<PersistedBook, string>("libraryEntries")
      .put({ ...original });
    legacy.close();

    const migrated = new BibliotecaDatabase(name);
    await migrated.open();
    const repository = new DexieLibraryEntryRepository(migrated);
    expect(await repository.getById(original.id)).toEqual(original);
    expect(await migrated.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
      key: SCHEMA_MARKER_KEY,
      value: "2",
    });
    migrated.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.count()).toBe(1);
    expect(
      await reopened.metadata.where("key").equals(SCHEMA_MARKER_KEY).count(),
    ).toBe(1);
    reopened.close();
  });

  it("fecha, reabre e mantém bancos de teste isolados", async () => {
    const firstName = databaseName("first");
    const secondName = databaseName("second");
    const first = new BibliotecaDatabase(firstName);
    const second = new BibliotecaDatabase(secondName);
    await Promise.all([first.open(), second.open()]);
    await new DexieLibraryEntryRepository(first).save(book());
    first.close();
    second.close();

    const reopenedFirst = new BibliotecaDatabase(firstName);
    const reopenedSecond = new BibliotecaDatabase(secondName);
    await Promise.all([reopenedFirst.open(), reopenedSecond.open()]);
    expect(await reopenedFirst.libraryEntries.count()).toBe(1);
    expect(await reopenedSecond.libraryEntries.count()).toBe(0);
    reopenedFirst.close();
    reopenedSecond.close();
  });
});

describe("repositórios Dexie", () => {
  it("salva, obtém e atualiza revisão de livro", async () => {
    const database = new BibliotecaDatabase(databaseName("book"));
    await database.open();
    const repository = new DexieLibraryEntryRepository(database);
    const original = book();
    await repository.save(original);
    expect(await repository.getById(original.id)).toEqual(original);

    const updated = Object.freeze({ ...original, updatedAt: T1, revision: 2 });
    await repository.save(updated);
    expect(await repository.getById(original.id)).toEqual(updated);
    database.close();
  });

  it("grava e lê início e conclusão anteriores à criação do registro", async () => {
    const database = new BibliotecaDatabase(databaseName("historical-start"));
    await database.open();
    const repository = new DexieLibraryEntryRepository(database);
    const historical = createBook({
      id: "book-historical",
      title: "Livro histórico",
      status: "completed",
      startedAt: "2020-01-15T23:59:59.999Z",
      completedAt: "2020-02-15T23:59:59.999Z",
      createdAt: T0,
    });
    await repository.save(historical);
    await expect(repository.getById(historical.id)).resolves.toEqual(
      historical,
    );
    database.close();
  });

  it("lista vazio e ordena tecnicamente por createdAt e id", async () => {
    const database = new BibliotecaDatabase(databaseName("list"));
    await database.open();
    const repository = new DexieLibraryEntryRepository(database);
    expect(await repository.list()).toEqual([]);
    await repository.save(book("book-b", T0));
    await repository.save(book("book-c", T1));
    await repository.save(book("book-a", T0));
    const result = await repository.list();
    expect(result.map(({ id }) => id)).toEqual(["book-a", "book-b", "book-c"]);
    expect(Object.isFrozen(result)).toBe(true);
    database.close();
  });

  it("retorna cópia congelada sem permitir alteração silenciosa", async () => {
    const database = new BibliotecaDatabase(databaseName("immutable"));
    await database.open();
    const repository = new DexieLibraryEntryRepository(database);
    await repository.save(book());
    const loaded = await repository.getById("book-1");
    expect(Object.isFrozen(loaded)).toBe(true);
    expect(() => Object.assign(loaded ?? {}, { title: "Alterado" })).toThrow();
    expect((await repository.getById("book-1"))?.title).toBe("Livro book-1");
    database.close();
  });

  it("rejeita dado externo inválido com erro sanitizado", async () => {
    const database = new BibliotecaDatabase(databaseName("invalid"));
    await database.open();
    await database.table<unknown, string>("libraryEntries").put({
      id: "invalid",
      type: "book",
      title: "",
    });
    const repository = new DexieLibraryEntryRepository(database);
    await expect(repository.getById("invalid")).rejects.toMatchObject({
      name: "InfrastructureError",
      message: "Falha controlada de infraestrutura.",
    });
    database.close();
  });

  it("salva Note e Quote em tabelas próprias e preserva vínculo e página", async () => {
    const database = new BibliotecaDatabase(databaseName("annotations"));
    await database.open();
    const notes = new DexieNoteRepository(database);
    const quotes = new DexieQuoteRepository(database);
    const note = createNote({
      id: "note-1",
      entryId: "book-1",
      content: "Nota",
      createdAt: T0,
    });
    const quote = createQuote({
      id: "quote-1",
      entryId: "book-1",
      content: "Trecho",
      page: 9,
      createdAt: T0,
    });
    await notes.save(note);
    await quotes.save(quote);
    expect(
      await database.notes.where("entryId").equals("book-1").first(),
    ).toEqual(note);
    expect(
      await database.quotes.where("entryId").equals("book-1").first(),
    ).toEqual(quote);
    database.close();
  });

  it("lista notas e citações somente do livro solicitado em ordem estável", async () => {
    const database = new BibliotecaDatabase(databaseName("annotation-list"));
    await database.open();
    const notes = new DexieNoteRepository(database);
    const quotes = new DexieQuoteRepository(database);
    const laterNote = createNote({
      id: "note-b",
      entryId: "book-1",
      content: "Depois",
      createdAt: T1,
    });
    const firstNote = createNote({
      id: "note-a",
      entryId: "book-1",
      content: "Antes",
      createdAt: T0,
    });
    const otherNote = createNote({
      id: "note-other",
      entryId: "book-2",
      content: "Outro",
      createdAt: T0,
    });
    const quote = createQuote({
      id: "quote-1",
      entryId: "book-1",
      content: "Trecho",
      page: 5,
      createdAt: T0,
    });
    await notes.save(laterNote);
    await notes.save(otherNote);
    await notes.save(firstNote);
    await quotes.save(quote);

    expect(await notes.listByEntryId("book-1")).toEqual([firstNote, laterNote]);
    expect(await quotes.listByEntryId("book-1")).toEqual([quote]);
    expect(await notes.listByEntryId("missing")).toEqual([]);
    database.close();
  });

  it("lista globalmente anotações validadas da mais recente para a mais antiga", async () => {
    const database = new BibliotecaDatabase(databaseName("annotation-global"));
    await database.open();
    const notes = new DexieNoteRepository(database);
    const quotes = new DexieQuoteRepository(database);
    const firstNote = createNote({
      id: "note-a",
      entryId: "book-1",
      content: "Antes",
      createdAt: T0,
    });
    const laterNote = createNote({
      id: "note-b",
      entryId: "book-2",
      content: "Depois",
      createdAt: T1,
    });
    const firstQuote = createQuote({
      id: "quote-a",
      entryId: "book-1",
      content: "Antes",
      createdAt: T0,
    });
    const laterQuote = createQuote({
      id: "quote-b",
      entryId: "book-2",
      content: "Depois",
      createdAt: T1,
    });
    await notes.save(firstNote);
    await notes.save(laterNote);
    await quotes.save(firstQuote);
    await quotes.save(laterQuote);

    const allNotes = await notes.list();
    const allQuotes = await quotes.list();
    expect(allNotes).toEqual([laterNote, firstNote]);
    expect(allQuotes).toEqual([laterQuote, firstQuote]);
    expect(Object.isFrozen(allNotes)).toBe(true);
    expect(Object.isFrozen(allQuotes)).toBe(true);
    database.close();
  });

  it("rejeita anotação global inválida na fronteira", async () => {
    const database = new BibliotecaDatabase(databaseName("annotation-invalid"));
    await database.open();
    await database
      .table<unknown, string>("notes")
      .put({ id: "invalid", entryId: "book-1" });
    await expect(
      new DexieNoteRepository(database).list(),
    ).rejects.toBeInstanceOf(InfrastructureError);
    database.close();
  });

  it("sanitiza falhas de escrita após fechamento", async () => {
    const database = new BibliotecaDatabase(databaseName("failure"));
    await database.open();
    const repository = new DexieNoteRepository(database);
    database.close();
    await expect(
      repository.save(
        createNote({
          id: "note-1",
          entryId: "book-1",
          content: "Nota",
          createdAt: T0,
        }),
      ),
    ).rejects.toBeInstanceOf(InfrastructureError);
  });

  it("salva atividade mínima e permite inspeção temporal pelo índice", async () => {
    const database = new BibliotecaDatabase(databaseName("activity"));
    await database.open();
    const repository = new DexieActivityRepository(database);
    const activity = createActivity({
      id: "activity-1",
      type: "progress_updated",
      aggregateId: "book-1",
      occurredAt: T0,
      revision: 2,
      metadata: { currentPage: 12, totalPages: 100 },
    });
    await repository.save(activity);
    const stored = await database.activities
      .where("aggregateId")
      .equals("book-1")
      .sortBy("occurredAt");
    expect(stored).toEqual([activity]);
    expect(JSON.stringify(stored)).not.toMatch(/title|author|content/i);
    database.close();
  });
});

describe("DexieTransactionRunner", () => {
  it("confirma entidade e atividade juntas", async () => {
    const database = new BibliotecaDatabase(databaseName("commit"));
    await database.open();
    const runner = new DexieTransactionRunner(database);
    const books = new DexieLibraryEntryRepository(database);
    const activities = new DexieActivityRepository(database);
    await runner.run(async () => {
      await books.save(book());
      await activities.save(
        createActivity({
          id: "activity-1",
          type: "book_created",
          aggregateId: "book-1",
          occurredAt: T0,
          revision: 1,
          metadata: { status: "planned" },
        }),
      );
    });
    expect(await database.libraryEntries.count()).toBe(1);
    expect(await database.activities.count()).toBe(1);
    database.close();
  });

  it("aborta todas as escritas quando a segunda operação falha", async () => {
    const database = new BibliotecaDatabase(databaseName("rollback"));
    await database.open();
    const runner = new DexieTransactionRunner(database);
    const books = new DexieLibraryEntryRepository(database);
    await expect(
      runner.run(async () => {
        await books.save(book());
        throw new Error("falha controlada de teste");
      }),
    ).rejects.toThrow("falha controlada de teste");
    expect(await database.libraryEntries.count()).toBe(0);
    expect(await database.activities.count()).toBe(0);
    database.close();
  });
});
