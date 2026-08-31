// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V6, SCHEMA_MARKER_KEY } from "./schema";

const names = new Set<string>();

afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

describe("migração aditiva do schema v6 para v7", () => {
  it("preserva objetos colocados e cria a coleção estrutural vazia uma única vez", async () => {
    const name = `migration-v7-${crypto.randomUUID()}`;
    names.add(name);
    const legacy = new Dexie(name);
    legacy.version(6).stores(DATABASE_SCHEMA_V6);
    await legacy.open();
    const placedObject = {
      definitionId: "object.reading-table",
      instanceId: "placed-object.legacy",
      rotation: 0,
      spaceId: "space-a",
      x: 192,
      y: 224,
    };
    await legacy.table("placedObjects").put(placedObject);
    legacy.close();

    const migrated = new BibliotecaDatabase(name);
    await migrated.open();
    expect(await migrated.placedObjects.get(placedObject.instanceId)).toEqual(
      placedObject,
    );
    expect(await migrated.worldStructures.count()).toBe(0);
    expect(await migrated.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
      value: "7",
    });
    migrated.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await reopened.placedObjects.count()).toBe(1);
    expect(await reopened.worldStructures.count()).toBe(0);
    expect(
      await reopened.metadata.where("key").equals(SCHEMA_MARKER_KEY).count(),
    ).toBe(1);
    reopened.close();
  });
});
