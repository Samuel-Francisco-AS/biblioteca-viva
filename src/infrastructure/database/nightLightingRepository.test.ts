// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import {
  NIGHT_LAMPS,
  NightLightingSession,
} from "../../features/library/nightLighting";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import { BibliotecaDatabase } from "./database";
import {
  DexieNightLightingRepository,
  NIGHT_LIGHTING_KEY,
} from "./nightLightingRepository";

const names: string[] = [];
afterEach(async () => {
  for (const name of names.splice(0)) await Dexie.delete(name);
});

describe("BF-5.5C ritual ledger in the existing settings table", () => {
  it("orders writes, survives reopening and backup, rejects damaged data", async () => {
    const name = `bf55c-${crypto.randomUUID()}`;
    names.push(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const date = new Date(2026, 10, 5, 22);
    const night = new NightLightingSession(() => date);
    const repository = new DexieNightLightingRepository(database);
    const first = night.capture();
    night.complete(NIGHT_LAMPS[0]!.id);
    await Promise.all([repository.save(first), repository.save(night.capture())]);
    expect((await repository.load())?.completedLampIds).toEqual([
      NIGHT_LAMPS[0]!.id,
    ]);
    const backup = await new DexieBackupSnapshotStore(database).read();
    expect(backup.settings.some((row) => row.key === NIGHT_LIGHTING_KEY)).toBe(true);
    database.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    const fresh = new DexieNightLightingRepository(reopened);
    expect((await fresh.load())?.cycleKey).toBe("2026-11-05");
    await reopened.settings.put({
      key: NIGHT_LIGHTING_KEY,
      value: { version: 1, cycleKey: "2026-11-05", completedLampIds: ["invalid"] },
      updatedAt: date.toISOString(),
    });
    expect(await fresh.load()).toBeUndefined();
    await new DexieBackupSnapshotStore(reopened).replace(backup);
    expect((await fresh.load())?.completedLampIds).toEqual([
      NIGHT_LAMPS[0]!.id,
    ]);
    reopened.close();
  });
});
