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
  rewards: Array<{ decorationId: string; id: string }>;
}

function mutableCatalog(): MutableMilestoneCatalog & Record<string, unknown> {
  return structuredClone(PROTOTYPE_CONTENT);
}

describe("definições declarativas de marcos", () => {
  it("valida as quatro regras, a recompensa e a decoração do protótipo", () => {
    expect(PROTOTYPE_CONTENT.milestones.map(({ id }) => id)).toEqual([
      "milestone.first-book",
      "milestone.first-note",
      "milestone.first-quote",
      "milestone.first-completed-book",
    ]);
    expect(PROTOTYPE_CONTENT.rewards).toEqual([
      {
        decorationId: "decoration.reading-lamp",
        id: "reward.first-completion-reading-lamp",
        type: "decoration",
      },
    ]);
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
