import { expect, it } from "vitest";
import { fixtureMatch } from "../../test/duelFixtures";
import {
  cardAt,
  legalActions,
  transition,
  unitStats,
  validateDuelDeck,
  validateMatch,
} from "./engine";
import {
  definitionSchema,
  validateCreation,
  type DuelAction,
  type DuelEffect,
  type DuelMatch,
} from "./contracts";
function act(m: DuelMatch, action: DuelAction) {
  return transition(m, {
    id: `test-${m.revision}`,
    revision: m.revision,
    player: m.active,
    action,
  }).state;
}
function stage() {
  let m = fixtureMatch();
  m = act(m, { type: "play", card: m.players[0].hand[0] });
  m = act(m, { type: "end" });
  m = act(m, { type: "play", card: m.players[1].hand[0] });
  return act(m, { type: "end" });
}
function cast(m: DuelMatch, effects: DuelEffect[], target?: string) {
  const id = m.players[m.active].hand[0];
  cardAt(m, id).definition = {
    version: 1,
    kind: "spell",
    affinity: "neutral",
    cost: 1,
    keywords: [],
    abilities: [{ id: "test", trigger: "play", cost: 0, effects }],
    flavor: "Fixture",
    artId: "fissure",
  };
  return act(m, { type: "play", card: id, ...(target && { target }) });
}
const effect = (
  definitionId: DuelEffect["definitionId"],
  value: number,
  target: DuelEffect["target"],
  duration: DuelEffect["duration"] = "permanent",
): DuelEffect => ({ definitionId, value, target, duration });
it("drains actual damage after shield, heals marked damage and limits permanent shields", () => {
  let m = stage();
  const target = m.players[1].units[0].id;
  m.players[0].life = 10;
  m.players[1].units[0].shield = 2;
  m = cast(m, [effect("drain", 3, "enemy-unit")], target);
  expect(m.players[0].life).toBe(11);
  expect(m.players[1].units[0].damage).toBe(1);
  m = act(m, { type: "end" });
  m = cast(m, [effect("heal", 4, "ally-unit")], target);
  expect(m.players[1].units[0].damage).toBe(0);
  m.players[1].units[0].shield = 11;
  m = cast(m, [effect("shield", 3, "ally-unit")], target);
  expect(m.players[1].units[0].shield).toBe(12);
});
it("exhaustion prevents the next controller turn and allows attacking after its duration", () => {
  let m = stage();
  const target = m.players[1].units[0].id;
  m = cast(m, [effect("exhaust", 1, "enemy-unit")], target);
  m = act(m, { type: "end" });
  expect(
    legalActions(m).some((a) => a.type === "attack" && a.source === target),
  ).toBe(false);
  m = act(m, { type: "end" });
  m = act(m, { type: "end" });
  expect(
    legalActions(m).some((a) => a.type === "attack" && a.source === target),
  ).toBe(true);
});
it("expiration can defeat a damaged unit; all-target growth is bounded and removes no unrelated unit", () => {
  let m = stage();
  const id = m.players[0].units[0].id;
  m = cast(m, [effect("empower", 2, "all-allies", "turn")]);
  m.players[0].units[0].damage = 4;
  expect(unitStats(m, m.players[0].units[0]).health).toBe(1);
  m = act(m, { type: "end" });
  expect(m.players[0].units).toHaveLength(0);
  expect(m.players[0].grave).toContain(id);
  expect(m.players[1].units).toHaveLength(1);
  validateMatch(m);
});
it("scout stably sorts only the top cards, draw over hand limit burns and fatigue keeps increasing", () => {
  let m = stage();
  const deck = m.players[0].deck;
  [4, 1, 3].forEach((cost, i) => (cardAt(m, deck[i]).definition.cost = cost));
  const tail = deck.slice(3);
  m = cast(m, [effect("scout", 3, "ally")]);
  expect(
    m.players[0].deck.slice(0, 3).map((id) => cardAt(m, id).definition.cost),
  ).toEqual([1, 3, 4]);
  expect(m.players[0].deck.slice(3)).toEqual(tail);
  m.players[0].hand.push(
    ...m.players[0].deck.splice(0, 8 - m.players[0].hand.length),
  );
  const grave = m.players[0].grave.length;
  m = cast(m, [effect("draw", 2, "ally")]);
  expect(m.players[0].hand).toHaveLength(8);
  expect(m.players[0].grave.length).toBe(grave + 2); // cast + one overflow
  m = act(m, { type: "end" });
  m.players[0].grave.push(...m.players[0].deck);
  m.players[0].deck = [];
  m = act(m, { type: "end" });
  expect(m.players[0].fatigue).toBe(1);
  m = cast(m, [effect("draw", 2, "ally")]);
  expect(m.players[0].fatigue).toBe(3);
  expect(m.players[0].life).toBe(14);
});
it("artifact activation is once per turn, start is automatic, and shatter removes the oldest artifact", () => {
  let m = stage();
  const id = m.players[0].hand[0];
  cardAt(m, id).definition = {
    version: 1,
    kind: "artifact",
    affinity: "neutral",
    cost: 1,
    keywords: [],
    abilities: [
      {
        id: "dawn",
        trigger: "start",
        cost: 0,
        effects: [effect("heal", 2, "ally")],
      },
      {
        id: "beam",
        trigger: "activate",
        cost: 1,
        effects: [effect("damage", 1, "enemy")],
      },
    ],
    flavor: "Fixture",
    artId: "wayfarer-lantern",
  };
  m = act(m, { type: "play", card: id });
  m = act(m, { type: "activate", source: id, ability: "beam" });
  expect(m.players[1].life).toBe(19);
  expect(legalActions(m).some((a) => a.type === "activate")).toBe(false);
  m.players[0].life = 10;
  m = act(m, { type: "end" });
  m = act(m, { type: "end" });
  expect(m.players[0].life).toBe(12);
  expect(legalActions(m).some((a) => a.type === "activate")).toBe(true);
  m = act(m, { type: "end" });
  m = cast(m, [effect("shatter", 1, "enemy")]);
  expect(m.players[0].artifacts).toHaveLength(0);
  expect(m.players[0].grave).toContain(id);
});
it("creator budget, copy limits, mode permissions and incompatible effect chains are explicit", () => {
  const m = fixtureMatch(),
    cards = m.cards.filter((c) => c.id.startsWith("0:"));
  expect(() => validateDuelDeck(cards.slice(1), "ruin", "official")).toThrow();
  expect(() =>
    validateDuelDeck([...cards, cards[0]], "ruin", "official"),
  ).toThrow();
  cards[0].official = false;
  expect(() => validateDuelDeck(cards, "ruin", "official")).toThrow();
  cards[0].definition.attack = 8;
  expect(() => validateDuelDeck(cards, "ruin", "creator")).toThrow();
  validateDuelDeck(cards, "chaos", "free");
  expect(() => validateCreation(cards[0].definition)).toThrow();
  expect(() =>
    definitionSchema.parse({
      ...cards[0].definition,
      abilities: [
        {
          id: "bad",
          trigger: "play",
          cost: 0,
          effects: [
            effect("damage", 1, "enemy-unit"),
            effect("heal", 1, "ally-unit"),
          ],
        },
      ],
    }),
  ).toThrow();
  expect(() =>
    definitionSchema.parse({
      ...cards[0].definition,
      abilities: [
        {
          id: "script",
          trigger: "play",
          cost: 0,
          effects: [{ ...effect("draw", 1, "ally"), value: 100 }],
        },
      ],
    }),
  ).toThrow();
});
it("rejects future rules without reinterpreting history, invalid fixed parameters and excessive chains", () => {
  const m = fixtureMatch();
  expect(() =>
    validateMatch({ ...m, ruleset: "duelo-arcano/2.0.0" }),
  ).toThrow();
  expect(() =>
    definitionSchema.parse({
      ...m.cards[0].definition,
      abilities: [
        {
          id: "loop",
          trigger: "play",
          cost: 0,
          effects: [
            effect("damage", 1, "enemy"),
            effect("damage", 1, "enemy"),
            effect("damage", 1, "enemy"),
          ],
        },
      ],
    }),
  ).toThrow();
  expect(() =>
    definitionSchema.parse({
      ...m.cards[0].definition,
      abilities: [
        {
          id: "bad",
          trigger: "play",
          cost: 0,
          effects: [effect("exhaust", 2, "enemy-unit")],
        },
      ],
    }),
  ).toThrow();
  m.revision = 4095;
  m.history = Array.from({ length: 4095 }, (_, i) => ({
    command: {
      id: `limit-${i}`,
      revision: i,
      player: 0,
      action: { type: "pause" },
    },
    events: [],
  }));
  const terminal = transition(m, {
    id: "limit-final",
    revision: 4095,
    player: 0,
    action: { type: "pause" },
  }).state;
  expect(terminal.result).toEqual({ winner: null, reason: "command-limit" });
  expect(terminal.status).toBe("completed");
});
it("records the random roll even when shield absorbs all damage", () => {
  let m = stage();
  const target = m.players[1].units[0].id;
  m.players[1].units[0].shield = 12;
  const previous = m.rng;
  m = cast(m, [effect("chaos", 6, "enemy-unit")], target);
  const roll = m.history.at(-1)?.events.find((e) => e.type === "roll");
  expect(roll?.value).toBeGreaterThanOrEqual(1);
  expect(roll?.value).toBeLessThanOrEqual(6);
  expect(m.rng).not.toBe(previous);
  expect(m.players[1].units[0].damage).toBe(0);
});
