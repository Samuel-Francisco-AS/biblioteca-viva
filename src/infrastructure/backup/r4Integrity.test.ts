// @vitest-environment node
import "fake-indexeddb/auto";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  createBook,
  createMovie,
  createSeries,
  createStudy,
  createPhysicalActivity,
  createWork,
  createManualSession,
} from "../../domain";
import { ExportBackup, ImportBackup, type BackupData } from "../../application";
import { BibliotecaDatabase } from "../database/database";
import { DexieBackupSnapshotStore } from "./dexieBackupStore";
import { canonicalize, checksumMaterial, JsonBackupCodec } from "./backupCodec";
import { INHABITANTS } from "../../features/library/inhabitants";
import { NIGHT_LAMPS } from "../../features/library/nightLighting";
const date = "2026-11-07T12:00:00.000Z";
const names: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const name of names.splice(0)) await Dexie.delete(name);
});
async function setup() {
  const name = `r4-fiction-${crypto.randomUUID()}`;
  names.push(name);
  const db = new BibliotecaDatabase(name);
  await db.open();
  const store = new DexieBackupSnapshotStore(db);
  const codec = new JsonBackupCodec();
  const exporter = new ExportBackup(
    store,
    codec,
    { now: () => Promise.resolve(date) },
    "fixture",
    14,
  );
  const importer = new ImportBackup(store, codec, exporter, {
    shareBackupFile: () => Promise.resolve("flow-finished"),
  });
  return { name, db, store, codec, exporter, importer };
}
async function populated(): Promise<BackupData> {
  const common = { createdAt: date };
  const entries = [
    createBook({
      ...common,
      id: "book",
      title: "Livro fictício",
      author: "Autoria fictícia",
    }),
    createMovie({ ...common, id: "movie", title: "Filme fictício" }),
    createSeries({
      ...common,
      id: "series",
      title: "Série fictícia",
      episodesWatched: 0,
    }),
    createStudy({
      ...common,
      id: "study",
      title: "Estudo fictício",
      progressCurrent: 0,
      progressUnit: "hours",
    }),
    createPhysicalActivity({
      ...common,
      id: "physical",
      title: "Treino fictício",
      category: "mixed",
    }),
    createWork({ ...common, id: "work", title: "Trabalho fictício" }),
  ];
  const image = await readFile("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  return {
    libraryEntries: entries,
    notes: [
      {
        id: "note",
        entryId: "book",
        content: "Nota fictícia",
        favorite: true,
        tagIds: ["tag"],
        createdAt: date,
        updatedAt: date,
        revision: 1,
      },
    ],
    quotes: [
      {
        id: "quote",
        entryId: "study",
        content: "Citação fictícia",
        favorite: false,
        tagIds: [],
        location: { type: "study", topic: "Tópico fictício" },
        createdAt: date,
        updatedAt: date,
        revision: 1,
      },
    ],
    tags: [
      {
        id: "tag",
        name: "Fictício",
        normalizedName: "ficticio",
        createdAt: date,
        updatedAt: date,
        revision: 1,
      },
    ],
    sessions: entries.map((entry, i) =>
      createManualSession({
        id: `session-${i}`,
        entryId: entry.id,
        entryType: entry.type,
        occurredAt: date,
        duration: 60,
      }),
    ),
    activities: [],
    milestones: [],
    media: [
      {
        entryId: "movie",
        dataUrl: `data:image/jpeg;base64,${image.toString("base64")}`,
        width: 720,
        height: 1080,
      },
    ],
    settings: [
      {
        key: "world.inhabitants.continuity.v1",
        updatedAt: date,
        value: {
          version: 1,
          savedAt: date,
          randomState: 7,
          agents: INHABITANTS.map((a) => ({
            id: a.id,
            x: a.x,
            z: a.z,
            facing: 1,
            phase: "idle",
            taskId: null,
            destination: null,
            remainingSeconds: 2,
            recentTaskIds: [],
            taskCount: 3,
          })),
        },
      },
      {
        key: "world.night-lighting.ritual.v1",
        updatedAt: date,
        value: {
          version: 1,
          cycleKey: "2026-11-07",
          completedLampIds: [NIGHT_LAMPS[0].id],
        },
      },
    ],
  };
}
it("R4 full v6 codec preserves four inhabitants and night ritual", async () => {
  const { codec } = await setup();
  const data = await populated();
  const artifact = await codec.encode({
    data,
    createdAt: date,
    appVersion: "fixture",
    databaseVersion: 14,
  });
  expect((await codec.inspect(artifact.content)).data.settings).toEqual(
    data.settings,
  );
});
it.each([false, true])(
  "R4 round-trip empty/populated=%s through codec/import, closing and reopening",
  async (full) => {
    const { name, db, store, exporter, importer } = await setup();
    if (full) await store.replace(await populated());
    const before = await store.read();
    const artifact = await exporter.execute();
    await importer.execute(
      artifact.content,
      full ? "confirmed-without-backup" : "empty-destination",
    );
    db.close();
    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(await new DexieBackupSnapshotStore(reopened).read()).toEqual(before);
    expect(await reopened.libraryEntries.count()).toBe(full ? 6 : 0);
    reopened.close();
  },
);
it("R4 rolls back all cleared and inserted tables when a write fails mid-transaction", async () => {
  const { name, db, store } = await setup();
  const initial = await populated();
  await store.replace(initial);
  const before = await store.read();
  const failure = vi
    .spyOn(db.sessions, "bulkAdd")
    .mockRejectedValueOnce(new Error("Synthetic write failure"));
  await expect(store.replace({ ...initial, notes: [] })).rejects.toThrow(
    "Synthetic write failure",
  );
  failure.mockRestore();
  expect(await store.read()).toEqual(before);
  db.close();
  const reopened = new BibliotecaDatabase(name);
  await reopened.open();
  expect(await new DexieBackupSnapshotStore(reopened).read()).toEqual(before);
  reopened.close();
});
it("R4 invalid JSON/checksum/foreign references/duplicates/legacy leave destination unchanged", async () => {
  const { db, store, codec, exporter, importer } = await setup();
  const data = await populated();
  await store.replace(data);
  const before = await store.read();
  const artifact = await exporter.execute();
  for (const content of [
    "",
    "{",
    artifact.content.slice(0, -40),
    artifact.content.replace("Livro fictício", "Livro alterado"),
    JSON.stringify({ kind: "biblioteca-viva-backup", formatVersion: 5 }),
  ]) {
    await expect(
      importer.execute(content, "confirmed-without-backup"),
    ).rejects.toBeDefined();
    expect(await store.read()).toEqual(before);
  }
  for (const invalid of [
    { ...data, notes: [{ ...data.notes[0], entryId: "missing" }] },
    {
      ...data,
      sessions: [{ ...data.sessions[0], entryId: "work" }],
    },
    { ...data, notes: [{ ...data.notes[0], tagIds: ["missing"] }] },
    {
      ...data,
      libraryEntries: [...data.libraryEntries, data.libraryEntries[0]],
    },
    { ...data, settings: [{ ...data.settings[0], value: { invalid: true } }] },
  ]) {
    await expect(
      codec.encode({
        data: invalid,
        createdAt: date,
        appVersion: "fixture",
        databaseVersion: 14,
      }),
    ).rejects.toBeDefined();
    const unsigned = {
      kind: "biblioteca-viva-backup",
      formatVersion: 6,
      createdAt: date,
      appVersion: "fixture",
      databaseVersion: 14,
      data: invalid,
      metadata: { policy: "replace" },
    };
    const digest = createHash("sha256")
      .update(canonicalize(checksumMaterial(unsigned)))
      .digest("hex");
    await expect(
      importer.execute(
        JSON.stringify({
          ...unsigned,
          integrity: { algorithm: "SHA-256", digest },
        }),
        "confirmed-without-backup",
      ),
    ).rejects.toBeDefined();
    expect(await store.read()).toEqual(before);
  }
  db.close();
});
it("R4 safety cancellation, read failure and concurrent nonempty destination refuse replacement", async () => {
  const { db, store, codec, exporter } = await setup();
  await store.replace(await populated());
  const before = await store.read();
  const artifact = await exporter.execute();
  const cancelled = new ImportBackup(store, codec, exporter, {
    shareBackupFile: () => Promise.resolve("cancelled"),
  });
  await expect(cancelled.execute(artifact.content)).rejects.toMatchObject({
    code: "BACKUP_DELIVERY_CANCELLED",
  });
  await expect(
    cancelled.execute(artifact.content, "empty-destination"),
  ).rejects.toMatchObject({ code: "RESTORE_DECISION_REQUIRED" });
  expect(await store.read()).toEqual(before);
  const read = vi
    .spyOn(store, "read")
    .mockRejectedValueOnce(new Error("Synthetic read failure"));
  await expect(exporter.execute()).rejects.toMatchObject({
    code: "BACKUP_EXPORT_FAILED",
  });
  read.mockRestore();
  expect(await store.read()).toEqual(before);
  db.close();
});
