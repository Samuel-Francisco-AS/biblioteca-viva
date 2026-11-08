// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { readFile } from "node:fs/promises";
import { afterEach, expect, it } from "vitest";
import { createBook, createMovie, createStudy } from "../../domain";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V12 } from "./schema";
import { DexiePosters } from "./media";
import { DexieLibraryEntryDeletionStore } from "./bookDeletionStore";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { JsonBackupCodec } from "../backup/backupCodec";
const now = "2026-11-04T12:00:00.000Z";
const names: string[] = [];
afterEach(async () => {
  for (const name of names.splice(0)) await Dexie.delete(name);
});
it("upgrades v12 without rewriting any record, reopens book covers and movie posters, replaces/removes in isolation and restores both", async () => {
  const name = `covers-${crypto.randomUUID()}`;
  names.push(name);
  const book = createBook({
    id: "b",
    title: "Códice fictício",
    createdAt: now,
    currentPage: 5,
    totalPages: 100,
  });
  const movie = createMovie({
    id: "m",
    title: "Aurora fictícia",
    createdAt: now,
  });
  const dataUrl = `data:image/jpeg;base64,${(await readFile("e2e/fixtures/entertainment/ceu-ficticio.jpg")).toString("base64")}`;
  const old = new Dexie(name);
  old.version(12).stores(DATABASE_SCHEMA_V12);
  await old.open();
  await old.table("libraryEntries").bulkAdd([book, movie]);
  await old
    .table("media")
    .put({ entryId: "m", dataUrl, width: 720, height: 1080 });
  old.close();
  const db = new BibliotecaDatabase(name);
  await db.open();
  try {
    const images = new DexiePosters(db);
    expect(db.verno).toBe(16);
    expect(await db.libraryEntries.toArray()).toEqual([book, movie]);
    const image = { entryId: "b", dataUrl, width: 720, height: 1080 };
    await images.save(image);
    db.close();
    await db.open();
    expect(await images.get("b")).toEqual(image);
    expect(await images.get("m")).toBeDefined();
    await images.save(image);
    expect(await db.media.count()).toBe(2);
    const backup = new DexieBackupSnapshotStore(db),
      codec = new JsonBackupCodec();
    const artifact = await codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 13,
      data: await backup.read(),
    });
    const parsed = await codec.inspect(artifact.content);
    expect(parsed.data.media).toHaveLength(2);
    await images.remove("b");
    expect(await images.get("b")).toBeUndefined();
    expect(await images.get("m")).toBeDefined();
    await backup.replace(parsed.data);
    expect(await images.get("b")).toEqual(image);
    await new DexieLibraryEntryDeletionStore(db).deleteLibraryEntry("b");
    expect(await images.get("b")).toBeUndefined();
    expect(await images.get("m")).toBeDefined();
    const study = createStudy({
      id: "study",
      title: "Estudo",
      createdAt: now,
      progressUnit: "sessions",
    });
    await db.libraryEntries.put(study);
    await expect(images.save({ ...image, entryId: "study" })).rejects.toThrow(
      "não encontrada",
    );
    await expect(
      codec.encode({
        appVersion: "test",
        createdAt: now,
        databaseVersion: 13,
        data: {
          ...(await backup.read()),
          media: [{ ...image, entryId: "study" }],
        },
      }),
    ).rejects.toThrow("correspondente");
    await expect(
      codec.encode({
        appVersion: "test",
        createdAt: now,
        databaseVersion: 13,
        data: { ...parsed.data, media: [image, image] },
      }),
    ).rejects.toThrow();
  } finally {
    db.close();
  }
});
