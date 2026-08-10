// @vitest-environment node
import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import type { Clock } from "../../application";
import { BibliotecaDatabase } from "../database/database";
import {
  DIALOGUE_HISTORY_KEY,
  DexieDialogueHistoryRepository,
} from "./dialogueHistoryRepository";

const names = new Set<string>();
const clock: Clock = {
  now: () => Promise.resolve("2026-08-10T12:00:00.000Z"),
};

function database(): BibliotecaDatabase {
  const name = `dialogue-history-${crypto.randomUUID()}`;
  names.add(name);
  return new BibliotecaDatabase(name);
}

afterEach(async () => {
  await Promise.all([...names].map((name) => Dexie.delete(name)));
  names.clear();
});

describe("DexieDialogueHistoryRepository", () => {
  it("salva e carrega somente histórico mínimo na settings existente", async () => {
    const db = database();
    await db.open();
    const repository = new DexieDialogueHistoryRepository(db, clock);
    await repository.save({
      lastLibraryVisitAt: "2026-08-09T12:00:00.000Z",
      lastShownAt: {
        "dialogue.librarian.empty": "2026-08-10T10:00:00.000Z",
      },
      shownOnceIds: ["dialogue.librarian.first-book"],
    });
    await expect(repository.load()).resolves.toEqual({
      lastLibraryVisitAt: "2026-08-09T12:00:00.000Z",
      lastShownAt: {
        "dialogue.librarian.empty": "2026-08-10T10:00:00.000Z",
      },
      shownOnceIds: ["dialogue.librarian.first-book"],
    });
    const stored = await db.settings.get(DIALOGUE_HISTORY_KEY);
    expect(stored?.key).toBe("dialogue.history.v1");
    expect(stored?.value).toMatchObject({ version: 1 });
    expect(JSON.stringify(stored?.value)).not.toMatch(
      /title|author|note|quote|content/iu,
    );
    db.close();
  });

  it("carrega ausência e rejeita valor externo inválido", async () => {
    const db = database();
    await db.open();
    const repository = new DexieDialogueHistoryRepository(db, clock);
    await expect(repository.load()).resolves.toBeUndefined();
    await db.settings.put({
      key: DIALOGUE_HISTORY_KEY,
      updatedAt: "2026-08-10T12:00:00.000Z",
      value: { shownOnceIds: ["sem versão"] },
    });
    await expect(repository.load()).rejects.toThrow();
    db.close();
  });

  it("normaliza IDs once duplicados ao carregar", async () => {
    const db = database();
    await db.open();
    await db.settings.put({
      key: DIALOGUE_HISTORY_KEY,
      updatedAt: "2026-08-10T12:00:00.000Z",
      value: {
        lastShownAt: {},
        shownOnceIds: [
          "dialogue.librarian.first-book",
          "dialogue.librarian.first-book",
        ],
        version: 1,
      },
    });
    const repository = new DexieDialogueHistoryRepository(db, clock);
    expect((await repository.load())?.shownOnceIds).toEqual([
      "dialogue.librarian.first-book",
    ]);
    db.close();
  });
});
