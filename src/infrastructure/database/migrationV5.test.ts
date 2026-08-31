// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V4, SCHEMA_MARKER_KEY } from "./schema";

const names = new Set<string>();
afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

describe("migração aditiva do schema v4 para v5", () => {
  it("preserva registros e cria tags/sessions vazias apenas uma vez", async () => {
    const name = `migration-v5-${crypto.randomUUID()}`;
    names.add(name);
    const legacy = new Dexie(name);
    legacy.version(4).stores(DATABASE_SCHEMA_V4);
    await legacy.open();
    const entry = {
      id: "book-unicode",
      type: "book",
      title: "Ação 🌿",
      status: "planned",
      currentPage: 0,
      favorite: false,
      tagIds: [],
      createdAt: "2026-08-16T10:00:00.000Z",
      updatedAt: "2026-08-16T10:00:00.000Z",
      revision: 1,
    };
    await legacy.table("libraryEntries").put(entry);
    legacy.close();

    const migrated = new BibliotecaDatabase(name);
    await migrated.open();
    expect(await migrated.libraryEntries.get(entry.id)).toEqual(entry);
    expect(await migrated.tags.count()).toBe(0);
    expect(await migrated.sessions.count()).toBe(0);
    expect(await migrated.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
      value: "7",
    });
    migrated.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.count()).toBe(1);
    expect(
      await reopened.metadata.where("key").equals(SCHEMA_MARKER_KEY).count(),
    ).toBe(1);
    expect(await reopened.tags.count()).toBe(0);
    expect(await reopened.sessions.count()).toBe(0);
    reopened.close();
  });
});
