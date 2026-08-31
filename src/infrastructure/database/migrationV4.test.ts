// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { BibliotecaDatabase } from "./database";
import {
  DexieLibraryEntryRepository,
  DexieNoteRepository,
  DexieQuoteRepository,
} from "./repositories";
import { DATABASE_SCHEMA_V3, SCHEMA_MARKER_KEY } from "./schema";

const names = new Set<string>();
const T0 = "2026-08-15T10:00:00.000Z";
const T1 = "2026-08-16T10:00:00.000Z";

function name(label: string) {
  const value = `migration-v4-${label}-${crypto.randomUUID()}`;
  names.add(value);
  return value;
}

afterEach(async () => {
  await Promise.all(
    [...names].map((databaseName) => Dexie.delete(databaseName)),
  );
  names.clear();
});

async function legacyV3(databaseName: string) {
  const legacy = new Dexie(databaseName);
  legacy.version(3).stores(DATABASE_SCHEMA_V3);
  await legacy.open();
  return legacy;
}

describe("migração aditiva do schema v3 para v4", () => {
  it("abre banco vazio, registra uma única versão e reabre sem efeitos adicionais", async () => {
    const databaseName = name("empty");
    const legacy = await legacyV3(databaseName);
    legacy.close();
    const migrated = new BibliotecaDatabase(databaseName);
    await migrated.open();
    expect(await migrated.libraryEntries.count()).toBe(0);
    expect(await migrated.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
      value: "7",
    });
    migrated.close();
    const reopened = new BibliotecaDatabase(databaseName);
    await reopened.open();
    expect(
      await reopened.metadata.where("key").equals(SCHEMA_MARKER_KEY).count(),
    ).toBe(1);
    expect(await reopened.libraryEntries.count()).toBe(0);
    reopened.close();
  });

  it("preserva livros, Unicode, anotações, atividades, settings e milestones", async () => {
    const databaseName = name("complete");
    const legacy = await legacyV3(databaseName);
    const books = [
      {
        id: "book-planned",
        type: "book",
        title: "Planejado 漢字",
        author: "Pessoa Fictícia",
        status: "planned",
        currentPage: 0,
        createdAt: T0,
        updatedAt: T0,
        revision: 1,
      },
      {
        id: "book-progress",
        type: "book",
        title: "Ação 🌿",
        status: "in_progress",
        currentPage: 12,
        totalPages: 100,
        startedAt: T0,
        createdAt: T0,
        updatedAt: T1,
        revision: 2,
      },
      {
        id: "book-complete",
        type: "book",
        title: "Concluído",
        status: "completed",
        currentPage: 80,
        totalPages: 80,
        startedAt: T0,
        completedAt: T1,
        createdAt: T0,
        updatedAt: T1,
        revision: 3,
      },
      {
        id: "book-unknown",
        type: "book",
        title: "Sem total",
        status: "in_progress",
        currentPage: 900,
        startedAt: T0,
        createdAt: T0,
        updatedAt: T1,
        revision: 4,
      },
    ];
    await legacy.table("libraryEntries").bulkAdd(books);
    await legacy.table("notes").add({
      id: "note-1",
      entryId: "book-progress",
      content: "Nota fictícia",
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    await legacy.table("quotes").add({
      id: "quote-1",
      entryId: "book-progress",
      content: "Citação fictícia",
      page: 12,
      createdAt: T0,
      updatedAt: T0,
      revision: 1,
    });
    await legacy.table("activities").add({
      id: "activity-1",
      type: "progress_updated",
      aggregateId: "book-progress",
      occurredAt: T1,
      revision: 2,
      metadata: { currentPage: 12, totalPages: 100 },
    });
    await legacy.table("settings").add({
      key: "audio.preferences.v1",
      value: { muted: true, musicVolume: 0.2, effectsVolume: 0.4 },
      updatedAt: T0,
    });
    await legacy.table("milestones").add({
      id: "milestone.first-completed-book",
      reachedAt: T1,
      rewards: [
        {
          id: "reward.first-completion-reading-lamp",
          type: "decoration",
          decorationId: "decoration.reading-lamp",
        },
      ],
      ruleVersion: 1,
      source: { eventId: "event-1", eventType: "LibraryEntryCompleted" },
    });
    legacy.close();

    const migrated = new BibliotecaDatabase(databaseName);
    await migrated.open();
    const entries = await new DexieLibraryEntryRepository(migrated).list();
    expect(entries).toHaveLength(books.length);
    for (const original of books) {
      expect(entries.find(({ id }) => id === original.id)).toEqual({
        ...original,
        favorite: false,
        tagIds: [],
      });
    }
    expect(
      await new DexieNoteRepository(migrated).getById("note-1"),
    ).toMatchObject({
      favorite: false,
      tagIds: [],
      createdAt: T0,
      revision: 1,
    });
    expect(
      await new DexieQuoteRepository(migrated).getById("quote-1"),
    ).toMatchObject({
      favorite: false,
      tagIds: [],
      location: { type: "book", page: 12 },
      createdAt: T0,
      revision: 1,
    });
    expect(await migrated.activities.count()).toBe(1);
    expect(await migrated.settings.get("audio.preferences.v1")).toBeDefined();
    expect(
      await migrated.milestones.get("milestone.first-completed-book"),
    ).toMatchObject({ rewards: [{ decorationId: "decoration.reading-lamp" }] });
    migrated.close();

    const reopened = new BibliotecaDatabase(databaseName);
    await reopened.open();
    expect(await reopened.libraryEntries.count()).toBe(books.length);
    expect(await reopened.quotes.get("quote-1")).not.toHaveProperty("page");
    expect(
      await reopened.metadata.where("key").equals(SCHEMA_MARKER_KEY).count(),
    ).toBe(1);
    reopened.close();
  });
});
