// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import { INHABITANTS } from "../../features/library/inhabitants";
import { BibliotecaDatabase } from "./database";
import {
  DexieInhabitantContinuityRepository,
  INHABITANT_CONTINUITY_KEY,
} from "./inhabitantContinuityRepository";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";

const names: string[] = [];
afterEach(async () => {
  for (const name of names.splice(0)) await Dexie.delete(name);
});

describe("BF-5.5A checkpoint in existing IndexedDB settings", () => {
  it("reopens and round-trips via backup snapshot", async () => {
    const name = `bf55a-${crypto.randomUUID()}`;
    names.push(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    const snapshot = {
      version: 1 as const,
      savedAt: "2026-11-05T12:00:00.000Z",
      randomState: 78,
      agents: INHABITANTS.map((a) => ({
        id: a.id,
        x: a.x,
        z: a.z,
        facing: 1,
        phase: "idle" as const,
        taskId: null,
        destination: null,
        remainingSeconds: 2,
        recentTaskIds: [],
        taskCount: 7,
      })),
    };
    const store = new DexieInhabitantContinuityRepository(database);
    await Promise.all([
      store.save(snapshot),
      store.save({ ...snapshot, randomState: 79 }),
    ]);
    expect((await store.load())?.randomState).toBe(79);
    const copied = await new DexieBackupSnapshotStore(database).read();
    expect(
      copied.settings.some(
        (setting) => setting.key === INHABITANT_CONTINUITY_KEY,
      ),
    ).toBe(true);
    database.close();

    const reopened = new BibliotecaDatabase(name);
    await reopened.open();
    expect(
      (await new DexieInhabitantContinuityRepository(reopened).load())?.agents,
    ).toHaveLength(4);
    await reopened.settings.put({
      key: INHABITANT_CONTINUITY_KEY,
      value: { broken: true },
      updatedAt: snapshot.savedAt,
    });
    expect(
      await new DexieInhabitantContinuityRepository(reopened).load(),
    ).toBeUndefined();
    await new DexieBackupSnapshotStore(reopened).replace(copied);
    expect(
      (await new DexieInhabitantContinuityRepository(reopened).load())
        ?.randomState,
    ).toBe(79);
    reopened.close();
  });
});
