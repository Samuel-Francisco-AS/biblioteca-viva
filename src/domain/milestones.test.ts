import { describe, expect, it } from "vitest";

import {
  MILESTONE_ID,
  MILESTONE_IDS,
  MilestoneEngine,
  PRODUCT_MILESTONE_DEFINITIONS,
  createLibraryEntryCreatedEvent,
} from "./index";

describe("marcos convencionais", () => {
  it("mantém somente os dez marcos de produto", () => {
    expect(MILESTONE_IDS).toHaveLength(10);
    expect(MILESTONE_IDS).toEqual([
      "milestone.first-book",
      "milestone.first-completed-book",
      "milestone.first-note",
      "milestone.first-quote",
      "milestone.first-movie",
      "milestone.first-series",
      "milestone.first-study",
      "milestone.first-physical-activity",
      "milestone.first-work",
      "milestone.first-session",
    ]);
  });

  it("apura marco sem recompensa ou efeito visual", () => {
    const reached = new MilestoneEngine().evaluate({
      definitions: PRODUCT_MILESTONE_DEFINITIONS,
      event: createLibraryEntryCreatedEvent({
        aggregateId: "book-1",
        eventId: "event-1",
        occurredAt: "2026-09-08T10:00:00.000Z",
        payload: { entryType: "book", status: "planned" },
        revision: 1,
      }),
      facts: {
        completedBooks: 0,
        totalBooks: 1,
        totalNotes: 0,
        totalQuotes: 0,
      },
      reached: [],
    });
    expect(reached).toEqual([
      {
        id: MILESTONE_ID.firstBook,
        reachedAt: "2026-09-08T10:00:00.000Z",
        ruleVersion: 1,
        source: { eventId: "event-1", eventType: "LibraryEntryCreated" },
      },
    ]);
  });
});
