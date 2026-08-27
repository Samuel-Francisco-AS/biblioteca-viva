// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  MILESTONE_ID,
  STRUCTURAL_INVENTORY_FAMILY_ID,
  createBook,
  createManualSession,
  type ReachedMilestone,
} from "../domain";
import {
  projectStructuralProgress,
  structuralGrants,
} from "./structuralProgression";

const entry = createBook({
  id: "book-structural",
  title: "Fixture estrutural",
  createdAt: "2026-08-27T10:00:00.000Z",
});

function session(index: number) {
  return createManualSession({
    id: `session-${index}`,
    entryId: entry.id,
    entryType: "book",
    occurredAt: `2026-08-27T10:${String(index).padStart(2, "0")}:00.000Z`,
    duration: 60,
  });
}

function reached(id: ReachedMilestone["id"]): ReachedMilestone {
  return {
    id,
    reachedAt: "2026-08-27T11:00:00.000Z",
    rewards: [],
    ruleVersion: 1,
    source: { eventId: "event-structural", eventType: "SessionChanged" },
  };
}

describe("projeção estrutural", () => {
  it("informa o próximo marco e limita a porcentagem", () => {
    const progress = projectStructuralProgress({
      entries: [entry],
      milestones: [reached(MILESTONE_ID.structureFirstActivity)],
      sessions: [session(1), session(1), session(2)],
    });
    expect(progress).toMatchObject({
      eligibleCompletedSessionCount: 2,
      isComplete: false,
      progressCurrent: 2,
      progressPercent: 40,
      progressRequired: 3,
    });
    expect(progress.nextMilestone?.id).toBe(
      MILESTONE_ID.structureLibraryExpansion,
    );
  });

  it("representa a conclusão sem próximo marco inválido", () => {
    const progress = projectStructuralProgress({
      entries: [entry],
      milestones: [
        reached(MILESTONE_ID.structureFirstActivity),
        reached(MILESTONE_ID.structureLibraryExpansion),
        reached(MILESTONE_ID.structureNewSpace),
        reached(MILESTONE_ID.structureConsolidated),
      ],
      sessions: Array.from({ length: 30 }, (_, index) => session(index)),
    });
    expect(progress).toMatchObject({
      isComplete: true,
      progressPercent: 100,
      progressRequired: 0,
    });
    expect(progress.nextMilestone).toBeUndefined();
  });

  it("expõe somente grants estruturais recém-apurados", () => {
    const grants = structuralGrants([
      {
        ...reached(MILESTONE_ID.structureFirstActivity),
        rewards: [
          {
            familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
            id: "reward.fixture.floor",
            quantity: 2,
            type: "structure-grant" as const,
          },
        ],
      },
      reached(MILESTONE_ID.firstSession),
    ]);
    expect(grants).toEqual([
      expect.objectContaining({
        familyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
        quantity: 2,
      }),
    ]);
  });
});
