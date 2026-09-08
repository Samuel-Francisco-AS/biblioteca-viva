import { describe, expect, it } from "vitest";

import {
  DATABASE_SCHEMA_V8,
  DATABASE_VERSION,
  persistedMilestoneSchema,
} from "./schema";

describe("schema pós-reset", () => {
  it("declara Dexie v8 sem tabelas espaciais ativas", () => {
    expect(DATABASE_VERSION).toBe(8);
    expect(DATABASE_SCHEMA_V8.placedObjects).toBeNull();
    expect(DATABASE_SCHEMA_V8.worldStructures).toBeNull();
  });

  it("aceita apenas marcos convencionais sem recompensas", () => {
    expect(
      persistedMilestoneSchema.parse({
        id: "milestone.first-book",
        reachedAt: "2026-09-08T10:00:00.000Z",
        ruleVersion: 1,
        source: {
          eventId: "event-1",
          eventType: "LibraryEntryCreated",
        },
      }),
    ).toMatchObject({ id: "milestone.first-book" });
    expect(() =>
      persistedMilestoneSchema.parse({
        id: "milestone.first-book",
        reachedAt: "2026-09-08T10:00:00.000Z",
        obsoleteField: true,
        ruleVersion: 1,
        source: { eventId: "event-1", eventType: "SessionChanged" },
      }),
    ).toThrow();
  });
});
