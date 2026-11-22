// @vitest-environment node
import "fake-indexeddb/auto";
import { readFile } from "node:fs/promises";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  createMovie,
  createSeries,
  createTimedSession,
  type DomainEvent,
} from "../../domain";
import { SaveEntertainment } from "../../application/entertainment";
import { BibliotecaDatabase } from "./database";
import {
  DATABASE_SCHEMA_V11,
  SCHEMA_MARKER_KEY,
  persistedLibraryEntrySchema,
} from "./schema";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieTransactionRunner } from "./transactionRunner";
import { DexiePosters, posterSchema } from "./media";
import { DexieLibraryEntryDeletionStore } from "./bookDeletionStore";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { JsonBackupCodec } from "../backup/backupCodec";
const now = "2026-11-04T12:00:00.000Z";
const dbs: BibliotecaDatabase[] = [];
afterEach(async () => {
  for (const db of dbs.splice(0)) {
    db.close();
    await Dexie.delete(db.name);
  }
});
async function setup() {
  const db = new BibliotecaDatabase(`entertainment-${crypto.randomUUID()}`);
  dbs.push(db);
  await db.open();
  const entries = new DexieLibraryEntryRepository(db);
  const events: DomainEvent[] = [];
  const deps = {
    clock: { now: () => Promise.resolve(now) },
    ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
    events: {
      publish: vi.fn((event: DomainEvent) => {
        expect(Dexie.currentTransaction).toBeNull();
        events.push(event);
        return Promise.resolve();
      }),
    },
    libraryEntries: entries,
    transaction: new DexieTransactionRunner(db),
  };
  return {
    db,
    entries,
    deps,
    events,
    save: new SaveEntertainment(deps),
    posters: new DexiePosters(db),
    backup: new DexieBackupSnapshotStore(db),
    codec: new JsonBackupCodec(),
  };
}
async function poster(entryId: string) {
  return {
    entryId,
    width: 720,
    height: 1080,
    dataUrl: `data:image/jpeg;base64,${(await readFile("e2e/fixtures/entertainment/ceu-ficticio.jpg")).toString("base64")}`,
  };
}
it("upgrades v11 verbatim, reopens legacy sessions and adds one poster table without spatial data", async () => {
  const name = `entertainment-upgrade-${crypto.randomUUID()}`;
  const movie = createMovie({ id: "movie", title: "Antigo", createdAt: now });
  const series = createSeries({
    id: "series",
    title: "Antiga",
    createdAt: now,
    episodesWatched: 4,
    totalEpisodes: 12,
  });
  const session = createTimedSession({
    id: "s",
    entryId: series.id,
    entryType: "series",
    startedAt: now,
  });
  const old = new Dexie(name);
  old.version(11).stores(DATABASE_SCHEMA_V11);
  await old.open();
  await old.table("libraryEntries").bulkAdd([movie, series]);
  await old.table("sessions").put(session);
  old.close();
  const db = new BibliotecaDatabase(name);
  dbs.push(db);
  await db.open();
  expect(db.verno).toBe(19);
  expect(await db.libraryEntries.toArray()).toEqual([movie, series]);
  expect(await db.metadata.get(SCHEMA_MARKER_KEY)).toMatchObject({
    value: "19",
  });
  const store = new DexiePosters(db);
  await store.save(await poster(movie.id));
  db.close();
  await db.open();
  expect(await db.sessions.get("s")).toEqual(session);
  expect(await store.get(movie.id)).toEqual(await poster(movie.id));
  expect(db.tables.map((t) => t.name)).not.toContain("placedObjects");
});
it("saves progress, personal lists and completed seasons atomically, preserving IDs and emitting after commit", async () => {
  const s = await setup();
  const series = createSeries({
    id: "s",
    title: "Crônicas",
    createdAt: now,
    totalEpisodes: 12,
  });
  await s.entries.save(series);
  const updated = await s.save.execute({
    id: "s",
    expectedRevision: 1,
    episodesWatched: 12,
    currentSeason: 2,
    currentEpisode: 6,
    catalog: {
      format: "anime",
      seasonCount: 2,
      completedSeasons: [1, 2],
      wishlist: true,
      rating: 5,
    },
  });
  expect(updated).toMatchObject({
    id: "s",
    type: "series",
    revision: 2,
    episodesWatched: 12,
    status: "completed",
    catalog: { format: "anime", wishlist: true },
  });
  expect(s.events).toHaveLength(1);
  expect(await s.entries.getById("s")).toEqual(updated);
  await expect(
    s.save.execute({ id: "s", expectedRevision: 1, state: "rewatching" }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  expect(s.events).toHaveLength(1);
  const rewatch = await s.save.execute({
    id: "s",
    expectedRevision: 2,
    state: "rewatching",
  });
  expect(rewatch.status).toBe("in_progress");
  expect(rewatch.catalog?.intent).toBe("rewatch");
});
it("failed progress validation rolls back without events or revision changes", async () => {
  const s = await setup();
  const series = createSeries({
    id: "s",
    title: "Crônicas",
    totalEpisodes: 2,
    createdAt: now,
  });
  await s.entries.save(series);
  await expect(
    s.save.execute({ id: "s", expectedRevision: 1, episodesWatched: 3 }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  expect(await s.entries.getById("s")).toEqual(series);
  expect(s.events).toHaveLength(0);
});
it("round-trips v6 with bounded posters and catalog, restores old v6 without media and cleans only owned posters", async () => {
  const s = await setup();
  const movie = createMovie({
    id: "m",
    title: "Aurora",
    createdAt: now,
    catalog: { format: "animation", releaseDate: "2026-11-16", wishlist: true },
  });
  const other = createSeries({ id: "s", title: "Céu", createdAt: now });
  await s.entries.save(movie);
  await s.entries.save(other);
  await s.posters.save(await poster("m"));
  await s.posters.save(await poster("s"));
  const encode = (data: Awaited<ReturnType<typeof s.backup.read>>) =>
    s.codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 12,
      data,
    });
  const snapshot = await s.backup.read();
  const artifact = await encode(snapshot);
  const parsed = await s.codec.inspect(artifact.content);
  expect(parsed.summary.formatVersion).toBe(12);
  expect(parsed.data.media).toHaveLength(2);
  await s.backup.replace(parsed.data);
  expect(await s.entries.getById("m")).toEqual(movie);
  expect(await s.posters.get("m")).toEqual(await poster("m"));
  await new DexieLibraryEntryDeletionStore(s.db).deleteLibraryEntry("m");
  expect(await s.posters.get("m")).toBeUndefined();
  expect(await s.posters.get("s")).toBeDefined();
  const { media, ...oldData } = snapshot;
  expect(media).toHaveLength(2);
  const oldArtifact = await s.codec.encode({
    appVersion: "old",
    createdAt: now,
    databaseVersion: 11,
    data: oldData,
  });
  const oldParsed = await s.codec.inspect(oldArtifact.content);
  expect(oldParsed.data.media).toBeUndefined();
  await s.backup.replace(oldParsed.data);
  expect(await s.db.media.count()).toBe(0);
  expect(await s.entries.getById("m")).toEqual(movie);
});
it("rejects orphan ownership, payload abuse, remote URLs and invalid formats at data boundaries", async () => {
  const s = await setup();
  const p = await poster("missing");
  await expect(s.posters.save(p)).rejects.toThrow();
  for (const invalid of [
    { ...p, width: 1601 },
    { ...p, dataUrl: "https://example.org/poster.jpg" },
    { ...p, width: 1 },
    { ...p, dataUrl: p.dataUrl + "A".repeat(350001) },
  ])
    expect(posterSchema.safeParse(invalid).success).toBe(false);
  const snapshot = await s.backup.read();
  await expect(
    s.codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 12,
      data: { ...snapshot, media: [p] },
    }),
  ).rejects.toThrow("correspondente");
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...createMovie({ id: "m", title: "Aurora", createdAt: now }),
      catalog: { format: "series" },
    }).success,
  ).toBe(false);
});
