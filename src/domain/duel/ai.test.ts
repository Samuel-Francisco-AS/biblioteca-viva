import { expect, it } from "vitest";
import { chooseDuelAction, observeDuel } from "./ai";
import { combatSnapshot } from "../../application/duels";
import { officialCards, starterDecks } from "./catalogue";
import {
  createDuel,
  legalActions,
  replayDuel,
  transition,
  validateMatch,
  type DuelSetup,
} from "./engine";
import { fixtureMatch } from "../../test/duelFixtures";
export function officialSetup(index: number): DuelSetup {
  const d = starterDecks[index];
  if (!d.combat || d.selection.kind !== "static")
    throw new Error("Invalid starter");
  return {
    name: d.name.split(" · ")[0],
    affinity: d.combat.affinity,
    deckName: d.name,
    cards: d.selection.cards.flatMap((r) =>
      Array.from({ length: d.combat!.copies[r.cardId] }, () =>
        combatSnapshot(officialCards.find((c) => c.id === r.cardId)!),
      ),
    ),
  };
}
it("AI chooses immediate lethal, defends and never uses the opponent hidden hand or deck", () => {
  let m = fixtureMatch();
  const first = m.players[0].hand[0];
  m.cards.find((c) => c.id === first)!.definition.keywords = ["haste"];
  m = transition(m, {
    id: "play",
    revision: 0,
    player: 0,
    action: { type: "play", card: first },
  }).state;
  m.players[1].life = 2;
  expect(chooseDuelAction(m)).toEqual({
    type: "attack",
    source: first,
    target: "p1",
  });
  const hidden = structuredClone(m);
  hidden.players[1].hand.reverse();
  hidden.players[1].deck.reverse();
  const ids = new Set([...hidden.players[1].deck, ...hidden.players[1].hand]);
  hidden.cards
    .filter((c) => ids.has(c.id))
    .forEach((c) => {
      c.name = "Oculto";
      c.definition.attack = 8;
    });
  expect(chooseDuelAction(hidden)).toEqual(chooseDuelAction(m));
  expect(observeDuel(m).state.players[1].hand).toHaveLength(0);
  expect(observeDuel(m).state.players[0].deck).toHaveLength(0);
  expect(observeDuel(m).state.history).toHaveLength(0);
  m.players[0].energy = 0;
  m.players[0].units[0].attacked = true;
  expect(chooseDuelAction(m)).toEqual({ type: "end" });
});
it.each(
  Array.from({ length: 16 }, (_, n) => [Math.floor(n / 4), n % 4] as const),
)(
  "AI completes affinity %i vs %i with legal actions, bounded history and exact replay",
  (i, j) => {
    let m = createDuel([officialSetup(i), officialSetup(j)], 100 + i * 4 + j);
    let commands = 0;
    while (!m.result && commands++ < 1000) {
      const action = chooseDuelAction(m);
      expect(legalActions(m)).toContainEqual(action);
      m = transition(m, {
        id: `ai-${m.revision}`,
        revision: m.revision,
        player: m.active,
        action,
      }).state;
    }
    expect(m.result).toBeDefined();
    expect(m.revision).toBeLessThan(1000);
    validateMatch(m);
    expect(replayDuel(m)).toEqual(m);
  },
);
