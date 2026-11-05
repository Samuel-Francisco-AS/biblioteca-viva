// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it } from "vitest";
import {
  createPhysicalActivity,
  createStudy,
  createTimedSession,
} from "../../domain";
import { createDay } from "../../domain/workouts";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V10, persistedLibraryEntrySchema } from "./schema";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { JsonBackupCodec } from "../backup/backupCodec";
import { DexiePhysicalProfile } from "./physicalProfile";
const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
it("upgrades v10 verbatim, reopens and round-trips/restores v6 with schedule, day groups, estimate and global profile, keeping old backups", async () => {
  const name = `v11-${crypto.randomUUID()}`;
  names.push(name);
  const now = "2026-11-04T12:00:00.000Z";
  const entry = createPhysicalActivity({
    id: "training",
    title: "Treino fictício",
    category: "strength",
    exercises: [{ name: "Supino", sets: 3, repetitions: 15, loadKg: 12.5 }],
    createdAt: now,
  });
  const study = {
    ...createStudy({
      id: "study",
      title: "Estudo fictício",
      progressUnit: "hours",
      createdAt: now,
    }),
    flashCards: [{ id: "c", front: "Frente", back: "Verso" }],
  };
  const session = {
    ...createTimedSession({
      id: "session",
      entryId: "study",
      entryType: "study",
      startedAt: now,
    }),
    focusDurationSeconds: 1500,
  };
  const old = new Dexie(name);
  old.version(10).stores(DATABASE_SCHEMA_V10);
  await old.open();
  await old.table("libraryEntries").bulkPut([entry, study]);
  await old.table("sessions").put(session);
  old.close();
  const db = new BibliotecaDatabase(name);
  await db.open();
  expect(db.verno).toBe(12);
  expect(await db.libraryEntries.get(entry.id)).toEqual(entry);
  expect(await db.libraryEntries.get(study.id)).toEqual(study);
  expect(await db.sessions.get(session.id)).toEqual(session);
  const codec = new JsonBackupCodec();
  const store = new DexieBackupSnapshotStore(db);
  const oldBackup = await codec.encode({
    appVersion: "test",
    createdAt: now,
    databaseVersion: 10,
    data: await store.read(),
  });
  const day = createDay(entry, "2026-11-04");
  day.movements[0].actual.push({ count: 1, target: 10 });
  day.movements[0].done = true;
  day.durationMinutes = 30;
  day.intensity = 5;
  day.estimate = { method: "met-v1", weightKg: 70, met: 3.5, kcal: 130 };
  const updated = {
    ...entry,
    schedule: { start: "2026-11-01", end: "2026-12-01", weekdays: [1, 3, 5] },
    workoutDays: [day],
  };
  await db.libraryEntries.put(updated);
  const profile = new DexiePhysicalProfile(db, {
    now: () => Promise.resolve(now),
  });
  await profile.save({ weightKg: 70 });
  db.close();
  await db.open();
  expect(await db.libraryEntries.get(entry.id)).toEqual(updated);
  expect(await profile.load()).toEqual({ weightKg: 70 });
  const backup = await codec.encode({
    appVersion: "test",
    createdAt: now,
    databaseVersion: 11,
    data: await store.read(),
  });
  const parsed = await codec.inspect(backup.content);
  expect(parsed.summary.formatVersion).toBe(6);
  await store.replace(parsed.data);
  expect(await db.libraryEntries.get(entry.id)).toEqual(updated);
  expect(await profile.load()).toEqual({ weightKg: 70 });
  expect(await db.libraryEntries.get(study.id)).toEqual(study);
  expect(
    persistedLibraryEntrySchema.safeParse({
      ...updated,
      workoutDays: [day, day],
    }).success,
  ).toBe(false);
  await expect(
    codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 11,
      data: {
        ...parsed.data,
        settings: [
          {
            key: "physical.profile.v1",
            value: { weightKg: 70, secret: "unexpected" },
            updatedAt: now,
          },
        ],
      },
    }),
  ).rejects.toThrow();
  const oldParsed = await codec.inspect(oldBackup.content);
  await store.replace(oldParsed.data);
  expect(await db.libraryEntries.get(entry.id)).toEqual(entry);
  expect(await profile.load()).toBeUndefined();
  expect(await db.sessions.get(session.id)).toEqual(session);
  db.close();
});
