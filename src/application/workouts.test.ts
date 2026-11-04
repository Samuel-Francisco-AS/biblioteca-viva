// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import { createPhysicalActivity, updateLibraryEntryDetails } from "../domain";
import { createDay } from "../domain/workouts";
import { BibliotecaDatabase } from "../infrastructure/database/database";
import { DexieLibraryEntryRepository } from "../infrastructure/database/repositories";
import { DexieTransactionRunner } from "../infrastructure/database/transactionRunner";
import { DexiePhysicalProfile } from "../infrastructure/database/physicalProfile";
import { PhysicalProfileService, SaveWorkoutDay } from "./workouts";
const names: string[] = [];
afterEach(async () => {
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
it("persists per-exercise and full days, isolates adaptations/base revisions, protects estimates, rejects stale writes and publishes only after commit", async () => {
  const name = `workout-${crypto.randomUUID()}`;
  names.push(name);
  const db = new BibliotecaDatabase(name);
  await db.open();
  const now = "2026-11-04T12:00:00.000Z";
  const clock = { now: () => Promise.resolve(now) };
  const profile = new PhysicalProfileService(
    new DexiePhysicalProfile(db, clock),
  );
  await profile.save({ weightKg: 70 });
  const entries = new DexieLibraryEntryRepository(db);
  let sequence = 0;
  const publish = vi.fn(async () => {
    expect(Dexie.currentTransaction).toBeNull();
    expect((await entries.getById("training"))?.revision).toBeGreaterThan(1);
  });
  const deps = {
    libraryEntries: entries,
    clock,
    ids: { generate: () => Promise.resolve(`w${++sequence}`) },
    events: { publish },
    transaction: new DexieTransactionRunner(db),
  };
  const command = new SaveWorkoutDay(deps, profile);
  const original = createPhysicalActivity({
    id: "training",
    title: "Treino fictício",
    category: "strength",
    exercises: [
      { name: "Supino", sets: 3, repetitions: 15 },
      { name: "Prancha", sets: 4, durationSeconds: 40 },
    ],
    createdAt: now,
  });
  await entries.save(original);
  const day = createDay(original, "2026-11-03");
  day.movements[0].done = true;
  day.movements[0].actual.push({ count: 1, target: 10 });
  day.durationMinutes = 30;
  day.intensity = 5;
  const first = await command.execute({
    entryId: original.id,
    revision: original.revision,
    date: day.date,
    day,
  });
  expect(first.workoutDays?.[0].movements[0].done).toBe(true);
  expect(first.workoutDays?.[0].movements[1].done).toBe(false);
  expect(first.exercises).toEqual(original.exercises);
  expect(first.workoutDays?.[0].estimate?.kcal).toBe(130);
  await expect(
    command.execute({
      entryId: original.id,
      revision: original.revision,
      date: day.date,
      day,
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  const full = {
    ...day,
    movements: day.movements.map((m) => ({ ...m, done: true })),
  };
  await profile.save({ weightKg: 90 });
  const second = await command.execute({
    entryId: original.id,
    revision: first.revision,
    date: day.date,
    day: full,
  });
  expect(second.workoutDays).toHaveLength(1);
  expect(second.workoutDays?.[0].estimate?.weightKg).toBe(70);
  const changed = updateLibraryEntryDetails(
    second,
    {
      type: "physical_activity",
      title: "Ficha revista",
      category: "strength",
      exercises: [{ name: "Remada", sets: 2, repetitions: 10 }],
    },
    now,
  );
  await entries.save(changed);
  if (changed.type !== "physical_activity") throw new Error("unexpected type");
  const next = createDay(changed, "2026-11-04");
  next.movements[0].done = true;
  const third = await command.execute({
    entryId: original.id,
    revision: changed.revision,
    date: next.date,
    day: next,
  });
  expect(third.workoutDays?.[0].movements[0].base).toEqual([
    { count: 3, target: 15 },
  ]);
  expect(third.workoutDays?.[1].movements[0].name).toBe("Remada");
  expect(third.workoutDays?.[1].estimate).toBeUndefined();
  await profile.save(undefined);
  expect(await profile.load()).toBeUndefined();
  db.close();
  await db.open();
  expect(await entries.getById(original.id)).toEqual(third);
  const failingPublish = vi.fn();
  const failing = new SaveWorkoutDay(
    {
      ...deps,
      events: { publish: failingPublish },
      transaction: {
        run: (operation) =>
          deps.transaction.run(async () => {
            await operation();
            throw new Error("rollback");
          }),
      },
    },
    profile,
  );
  await expect(
    failing.execute({
      entryId: original.id,
      revision: third.revision,
      date: next.date,
      day: null,
    }),
  ).rejects.toMatchObject({ code: "PERSISTENCE_FAILED" });
  expect(await entries.getById(original.id)).toEqual(third);
  expect(failingPublish).not.toHaveBeenCalled();
  const cleared = await command.execute({
    entryId: original.id,
    revision: third.revision,
    date: next.date,
    day: null,
  });
  expect(cleared.workoutDays).toHaveLength(1);
  expect(cleared.exercises?.[0].name).toBe("Remada");
  await expect(
    command.execute({
      entryId: original.id,
      revision: cleared.revision,
      date: "2026-11-05",
      day: null,
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(profile.save({ weightKg: -1 })).rejects.toThrow();
  expect(publish).toHaveBeenCalledTimes(4);
  db.close();
});
