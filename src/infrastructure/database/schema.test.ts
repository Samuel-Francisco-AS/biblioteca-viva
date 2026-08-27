// @vitest-environment node
import { describe, expect, it } from "vitest";

import { persistedMilestoneSchema } from "./schema";

const milestone = {
  id: "milestone.structure.first-activity",
  reachedAt: "2026-08-27T12:00:00.000Z",
  rewards: [
    {
      familyId: "structure-family.floor.wood",
      id: "reward.structure.first-activity.floor",
      quantity: 12,
      type: "structure-grant",
    },
  ],
  ruleVersion: 1,
  source: {
    eventId: "session-1",
    eventType: "SessionChanged",
  },
};

describe("codec persistido de concessões estruturais", () => {
  it("aceita concessão estrutural válida e milestone de decoração legado", () => {
    expect(persistedMilestoneSchema.parse(milestone)).toEqual(milestone);
    expect(
      persistedMilestoneSchema.parse({
        ...milestone,
        id: "milestone.first-completed-book",
        rewards: [
          {
            decorationId: "decoration.reading-lamp",
            id: "reward.first-completion-reading-lamp",
            type: "decoration",
          },
        ],
      }),
    ).toMatchObject({ id: "milestone.first-completed-book" });
  });

  it.each([
    ["família desconhecida", { familyId: "structure-family.unknown" }],
    ["quantidade zero", { quantity: 0 }],
    ["quantidade negativa", { quantity: -1 }],
    ["quantidade fracionária", { quantity: 1.5 }],
  ])("rejeita %s", (_label, change) => {
    expect(() =>
      persistedMilestoneSchema.parse({
        ...milestone,
        rewards: [{ ...milestone.rewards[0], ...change }],
      }),
    ).toThrow();
  });
});
