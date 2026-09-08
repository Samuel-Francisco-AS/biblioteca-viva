// @vitest-environment node
import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { createBook } from "../../domain";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V7, SCHEMA_MARKER_KEY } from "./schema";

const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});

describe("migração Dexie v7 para v8", () => {
  it("descarta dados anteriores e remove as tabelas do mundo", async () => {
    const name = `migration-v8-${crypto.randomUUID()}`;
    names.push(name);
    const legacy = new Dexie(name);
    legacy.version(7).stores(DATABASE_SCHEMA_V7);
    await legacy.open();
    await legacy.table("libraryEntries").add(
      createBook({
        id: "legacy-book",
        title: "Registro descartável",
        createdAt: "2026-09-08T10:00:00.000Z",
      }),
    );
    await legacy.table("placedObjects").add({
      instanceId: "legacy-object",
      definitionId: "legacy",
      rotation: 0,
      spaceId: "space-a",
      x: 0,
      y: 0,
    });
    await legacy.table("worldStructures").add({ id: "world.main" });
    await legacy.table("settings").add({
      key: "dialogue.history.v1",
      value: {},
      updatedAt: "2026-09-08T10:00:00.000Z",
    });
    legacy.close();

    const migrated = new BibliotecaDatabase(name);
    await migrated.open();
    expect(migrated.tables.map(({ name: table }) => table).sort()).toEqual([
      "activities",
      "libraryEntries",
      "metadata",
      "milestones",
      "notes",
      "quotes",
      "sessions",
      "settings",
      "tags",
    ]);
    expect(await migrated.libraryEntries.count()).toBe(0);
    expect(await migrated.settings.count()).toBe(0);
    expect(await migrated.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
      value: "8",
    });

    const fresh = createBook({
      id: "new-book",
      title: "Novo registro",
      createdAt: "2026-09-08T10:00:00.000Z",
    });
    await migrated.libraryEntries.add(fresh);
    migrated.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.get(fresh.id)).toEqual(fresh);
    reopened.close();
  });

  it("permite criar e reabrir um banco v8 limpo", async () => {
    const name = `clean-v8-${crypto.randomUUID()}`;
    names.push(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const record = createBook({
      id: "book-1",
      title: "Persistente",
      createdAt: "2026-09-08T10:00:00.000Z",
    });
    await database.libraryEntries.add(record);
    database.close();
    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.libraryEntries.get(record.id)).toEqual(record);
    reopened.close();
  });
});
