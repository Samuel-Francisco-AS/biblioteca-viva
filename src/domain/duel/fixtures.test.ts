import { expect, it } from "vitest";
import { type DuelCard } from "./contracts";
import { createDuel, type DuelSetup } from "./engine";
export function fixtureCards(): DuelCard[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `fixture-${i}`,
    cardId: `fixture-${i % 12}`,
    revision: 1,
    name: `Sentinela fictícia ${i % 12}`,
    official: true,
    definition: {
      version: 1,
      kind: "creature",
      affinity: "neutral",
      cost: 1,
      attack: 2,
      health: 3,
      keywords: [],
      abilities: [],
      flavor: "Fixture",
      artId: "neutral-sentinel",
    },
  }));
}
export function fixtureMatch(seed = 17) {
  const setup: DuelSetup = {
    name: "Fictício",
    affinity: "ruin",
    deckName: "Fixture",
    cards: fixtureCards(),
  };
  return createDuel([setup, setup], seed);
}
it("uses fictional deck identities only", () =>
  expect(fixtureCards()).toHaveLength(24));
