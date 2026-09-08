import "fake-indexeddb/auto";

import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";

import {
  MILESTONE_ID,
  MilestoneEngine,
  PRODUCT_MILESTONE_DEFINITIONS,
  createBook,
  createLibraryEntryCreatedEvent,
} from "../../domain";
import { BibliotecaDatabase } from "./database";
import { DexieMilestoneStore } from "./milestoneStore";

const databases: string[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map((name) => Dexie.delete(name)));
});

describe("DexieMilestoneStore", () => {
  it("persiste marco convencional de forma idempotente", async () => {
    const name = `milestones-${crypto.randomUUID()}`;
    databases.push(name);
    const database = new BibliotecaDatabase(name);
    await database.open();
    await database.libraryEntries.add(
      createBook({
        id: "book-1",
        title: "Livro fictício",
        createdAt: "2026-09-08T10:00:00.000Z",
      }),
    );
    const store = new DexieMilestoneStore(
      database,
      new MilestoneEngine(),
      PRODUCT_MILESTONE_DEFINITIONS,
    );
    const event = createLibraryEntryCreatedEvent({
      aggregateId: "book-1",
      eventId: "event-1",
      occurredAt: "2026-09-08T10:00:00.000Z",
      payload: { entryType: "book", status: "planned" },
      revision: 1,
    });

    expect((await store.process(event)).map(({ id }) => id)).toEqual([
      MILESTONE_ID.firstBook,
    ]);
    expect(await store.process(event)).toEqual([]);
    expect(await store.list()).toHaveLength(1);
    database.close();
  });
});
