import { describe, expect, it } from "vitest";

import { PROTOTYPE_CONTENT, parseContentCatalog } from "./index";

interface MutableMilestoneCatalog {
  decorations: Array<{ id: string; state: string }>;
  milestones: Array<{
    conditions: Array<{ fact: string; operator: string; value: number }>;
    id: string;
    rewardIds: string[];
    ruleVersion: number;
  }>;
  rewards: Array<Record<string, unknown>>;
}

function mutableCatalog(): MutableMilestoneCatalog & Record<string, unknown> {
  return structuredClone(PROTOTYPE_CONTENT);
}

describe("definições declarativas de marcos", () => {
  it("preserva regras históricas e declara as concessões estruturais", () => {
    expect(PROTOTYPE_CONTENT.milestones.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "milestone.first-book",
        "milestone.first-session",
        "milestone.structure.first-activity",
        "milestone.structure.library-expansion",
        "milestone.structure.new-space",
        "milestone.structure.consolidated",
      ]),
    );
    expect(PROTOTYPE_CONTENT.rewards).toEqual(
      expect.arrayContaining([
        {
          decorationId: "decoration.reading-lamp",
          id: "reward.first-completion-reading-lamp",
          type: "decoration",
        },
        {
          familyId: "structure-family.floor.wood",
          id: "reward.structure.first-activity.floor",
          quantity: 12,
          type: "structure-grant",
        },
      ]),
    );
  });

  it("rejeita ID de marco duplicado", () => {
    const candidate = mutableCatalog();
    candidate.milestones.push(structuredClone(candidate.milestones[0]));
    expect(() => parseContentCatalog(candidate)).toThrow(/ID duplicado/u);
  });

  it("rejeita recompensa inexistente", () => {
    const candidate = mutableCatalog();
    candidate.milestones[0].rewardIds = ["reward.missing"];
    expect(() => parseContentCatalog(candidate)).toThrow(
      /Recompensa inexistente/u,
    );
  });

  it("rejeita condição inválida e versão não positiva", () => {
    const invalidCondition = mutableCatalog();
    invalidCondition.milestones[0].conditions[0].fact = "privateTitle";
    expect(() => parseContentCatalog(invalidCondition)).toThrow();

    const invalidVersion = mutableCatalog();
    invalidVersion.milestones[0].ruleVersion = 0;
    expect(() => parseContentCatalog(invalidVersion)).toThrow();
  });

  it("rejeita decoração referenciada inexistente", () => {
    const candidate = mutableCatalog();
    candidate.rewards[0].decorationId = "decoration.missing";
    expect(() => parseContentCatalog(candidate)).toThrow();
  });
});
