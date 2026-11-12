import { promoteLegacyFlashCards } from "./promoteLegacyFlashCards";
// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it } from "vitest";
import { createStudy, createTimedSession } from "../../domain";
import { BibliotecaDatabase } from "./database";
import {
  DATABASE_SCHEMA_V9,
  persistedLibraryEntrySchema,
  persistedSessionSchema,
} from "./schema";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { JsonBackupCodec } from "../backup/backupCodec";
const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});
it("upgrades v9 without rewriting entries, restores v6 backups with and without study fields, and reopens", async () => {
  const name = `v10-${crypto.randomUUID()}`;
  names.push(name);
  const now = "2026-11-04T12:00:00.000Z";
  const entry = createStudy({
    id: "study",
    title: "Curso fictício",
    progressUnit: "hours",
    progressCurrent: 90,
    createdAt: now,
  });
  const session = createTimedSession({
    id: "session",
    entryId: "study",
    entryType: "study",
    startedAt: now,
  });
  const legacy = new Dexie(name);
  legacy.version(9).stores(DATABASE_SCHEMA_V9);
  await legacy.open();
  await legacy.table("libraryEntries").put(entry);
  await legacy.table("sessions").put(session);
  legacy.close();
  const db = new BibliotecaDatabase(name);
  await db.open();
  expect(db.verno).toBe(19);
  expect(await db.libraryEntries.get(entry.id)).toEqual(entry);
  expect(await db.sessions.get(session.id)).toEqual(session);
  const codec = new JsonBackupCodec();
  const snapshots = new DexieBackupSnapshotStore(db);
  const original = await snapshots.read();
  const oldBackup = await codec.encode({
    appVersion: "test",
    createdAt: now,
    databaseVersion: 9,
    data: original,
  });
  const oldParsed = await codec.inspect(oldBackup.content);
  expect(oldParsed.data.libraryEntries).toEqual([entry]);
  const updated = {
    ...entry,
    studyTimeBaselineSeconds: 5400,
    flashCards: [{ id: "card", front: "Pista?", back: "Uma\ndescoberta" }],
  };
  const timed = { ...session, focusDurationSeconds: 1500 };
  await db.libraryEntries.put(updated);
  await db.sessions.put(timed);
  // This synthetic write models legacy input after upgrade; production restore uses the same promotion.
  await db.transaction("rw", db.tables, (transaction) =>
    promoteLegacyFlashCards(transaction),
  );
  db.close();
  await db.open();
  expect(await db.libraryEntries.get(entry.id)).toEqual(updated);
  expect(await db.sessions.get(session.id)).toEqual(timed);
  const backup = await codec.encode({
    appVersion: "test",
    createdAt: now,
    databaseVersion: 10,
    data: await snapshots.read(),
  });
  const restored = await codec.inspect(backup.content);
  expect(restored.summary.formatVersion).toBe(12);
  expect(restored.data.libraryEntries).toEqual([updated]);
  expect(restored.data.sessions).toEqual([timed]);
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...updated,
      flashCards: [updated.flashCards[0], updated.flashCards[0]],
    }).success,
  ).toBe(false);
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...updated,
      flashCards: [{ id: "bad", front: " ", back: "Resposta" }],
    }).success,
  ).toBe(false);
  expect(
    persistedSessionSchema.safeParse({ ...timed, focusDurationSeconds: -1 })
      .success,
  ).toBe(false);
  expect(
    persistedSessionSchema.safeParse({ ...timed, accumulatedDuration: 1501 })
      .success,
  ).toBe(false);
  await snapshots.replace(restored.data);
  expect(await db.libraryEntries.get(entry.id)).toEqual(updated);
  await snapshots.replace(oldParsed.data);
  expect(await db.libraryEntries.get(entry.id)).toEqual(entry);
  expect(await db.sessions.get(session.id)).toEqual(session);
  db.close();
});
