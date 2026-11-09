import { describe, expect, it } from "vitest";
import { fixtureMatch } from "./fixtures.test";
import {
  cardAt,
  createDuel,
  legalActions,
  replayDuel,
  transition,
  unitStats,
  validateMatch,
} from "./engine";
import {
  definitionSchema,
  RULES,
  type DuelAction,
  type DuelMatch,
} from "./contracts";
function act(m: DuelMatch, action: DuelAction, player = m.active) {
  return transition(m, {
    id: `cmd-${m.revision}`,
    revision: m.revision,
    player,
    action,
  }).state;
}
function play(m: DuelMatch) {
  const a = legalActions(m).find((a) => a.type === "play");
  if (!a) throw new Error("fixture without play");
  return act(m, a);
}
describe("Duelo Arcano v1", () => {
  it("prepares immutable decks, compensates second hand and recovers resources", () => {
    let m = fixtureMatch();
    expect(m.players.map((p) => p.hand.length)).toEqual([4, 5]);
    expect(m.players[0].energy).toBe(1);
    const before = structuredClone(m);
    m = play(m);
    expect(before.players[0].hand).toHaveLength(4);
    expect(m.players[0].energy).toBe(0);
    expect(legalActions(m).filter((a) => a.type === "attack")).toHaveLength(0);
    m = act(m, { type: "end" });
    expect(m.players[1].hand).toHaveLength(6);
    expect(m.active).toBe(1);
    m = act(m, { type: "end" });
    expect(m.players[0].energy).toBe(2);
    expect(legalActions(m).some((a) => a.type === "attack")).toBe(true);
  });
  it("rejects wrong turn, missing zone, illegal target, duplicate commands and terminal actions", () => {
    const m = fixtureMatch();
    expect(() => act(m, { type: "end" }, 1)).toThrow();
    expect(() =>
      act(m, { type: "play", card: m.players[1].hand[0] }),
    ).toThrow();
    const next = play(m);
    expect(() =>
      transition(next, {
        id: "cmd-0",
        revision: next.revision,
        player: 0,
        action: { type: "end" },
      }),
    ).toThrow();
    expect(() =>
      act(next, {
        type: "attack",
        source: next.players[0].units[0].id,
        target: "p1",
      }),
    ).toThrow();
    const ended = act(next, { type: "abandon" }, 0);
    expect(ended.result).toEqual({ winner: 1, reason: "abandon" });
    expect(() => act(ended, { type: "end" })).toThrow();
  });
  it("uses guards, haste, simultaneous retaliation and removes dead units", () => {
    let m = fixtureMatch();
    const id = m.players[0].hand[0];
    cardAt(m, id).definition.keywords = ["haste"];
    m = act(m, { type: "play", card: id });
    m = act(m, { type: "attack", source: id, target: "p1" });
    expect(m.players[1].life).toBe(18);
    expect(() =>
      act(m, { type: "attack", source: id, target: "p1" }),
    ).toThrow();
    m = act(m, { type: "end" });
    const defender = m.players[1].hand[0];
    cardAt(m, defender).definition.keywords = ["guard"];
    m = act(m, { type: "play", card: defender });
    m = act(m, { type: "end" });
    expect(legalActions(m).filter((a) => a.type === "attack")).toEqual([
      { type: "attack", source: id, target: defender },
    ]);
    m = act(m, { type: "attack", source: id, target: defender });
    expect(m.players.map((p) => unitStats(m, p.units[0]).health)).toEqual([
      1, 1,
    ]);
  });
  it("resolves shields, targeted magic, temporary growth, healing, exhaustion and artifacts", () => {
    let m = fixtureMatch();
    const first = m.players[0].hand[0];
    cardAt(m, first).definition.abilities = [
      {
        id: "veil",
        trigger: "play",
        cost: 0,
        effects: [
          {
            definitionId: "shield",
            value: 2,
            target: "self",
            duration: "permanent",
          },
        ],
      },
    ];
    m = act(m, { type: "play", card: first });
    expect(m.players[0].units[0].shield).toBe(2);
    m = act(m, { type: "end" });
    const spell = m.players[1].hand[0];
    cardAt(m, spell).definition = {
      version: 1,
      kind: "spell",
      affinity: "neutral",
      cost: 1,
      keywords: [],
      abilities: [
        {
          id: "blast",
          trigger: "play",
          cost: 0,
          effects: [
            {
              definitionId: "damage",
              value: 3,
              target: "enemy-unit",
              duration: "permanent",
            },
          ],
        },
      ],
      flavor: "fixture",
      artId: "fixture",
    };
    expect(() => act(m, { type: "play", card: spell, target: "p0" })).toThrow();
    m = act(m, { type: "play", card: spell, target: first });
    expect(m.players[0].units[0].damage).toBe(1);
    expect(m.players[0].units[0].shield).toBe(0);
    m = act(m, { type: "end" });
    const artifact = m.players[0].hand[0];
    cardAt(m, artifact).definition = {
      version: 1,
      kind: "artifact",
      affinity: "neutral",
      cost: 1,
      keywords: [],
      abilities: [
        {
          id: "grow",
          trigger: "activate",
          cost: 1,
          effects: [
            {
              definitionId: "empower",
              value: 2,
              target: "ally-unit",
              duration: "turn",
            },
          ],
        },
      ],
      flavor: "fixture",
      artId: "fixture",
    };
    m = act(m, { type: "play", card: artifact });
    m = act(m, {
      type: "activate",
      source: artifact,
      ability: "grow",
      target: first,
    });
    expect(unitStats(m, m.players[0].units[0]).attack).toBe(4);
    expect(() =>
      act(m, {
        type: "activate",
        source: artifact,
        ability: "grow",
        target: first,
      }),
    ).toThrow();
    m = act(m, { type: "end" });
    expect(unitStats(m, m.players[0].units[0]).attack).toBe(2);
  });
  it("persists pause and resumes without replaying effects", () => {
    let m = play(fixtureMatch());
    const zones = structuredClone(m.players);
    m = act(m, { type: "pause" }, 0);
    expect(() => act(m, { type: "end" })).toThrow();
    m = act(m, { type: "resume" }, 0);
    expect(m.players).toEqual(zones);
    validateMatch(m);
  });
  it("finishes by fatigue, permits simultaneous defeat and limits turns/actions", () => {
    let m = fixtureMatch();
    m.players[1].grave.push(...m.players[1].deck);
    m.players[1].deck = [];
    m.players[1].life = 1;
    m = act(m, { type: "end" });
    expect(m.result).toEqual({ winner: 0, reason: "fatigue" });
    m = fixtureMatch();
    m.turn = RULES.turns;
    m = act(m, { type: "end" });
    expect(m.result?.reason).toBe("turn-limit");
    m = fixtureMatch();
    m.actionsThisTurn = 64;
    expect(legalActions(m)).toEqual([{ type: "end" }]);
    m = fixtureMatch();
    const id = m.players[0].hand[0];
    m.players.forEach((p) => (p.life = 1));
    cardAt(m, id).definition.abilities = [
      {
        id: "risk",
        trigger: "play",
        cost: 0,
        effects: [
          {
            definitionId: "damage",
            target: "enemy",
            value: 1,
            duration: "permanent",
          },
          {
            definitionId: "damage",
            target: "ally",
            value: 1,
            duration: "permanent",
          },
        ],
      },
    ];
    // Consequences resolve with the whole action before terminal evaluation.
    m = act(m, { type: "play", card: id });
    expect(m.result).toEqual({ winner: null, reason: "simultaneous" });
  });
  it("replays seeded full matches exactly and keeps every instance in exactly one zone", () => {
    for (let seed = 0; seed < 12; seed++) {
      let m = fixtureMatch(seed);
      let steps = 0;
      while (!m.result && steps++ < 1000) {
        const choices = legalActions(m);
        m = act(
          m,
          choices.find(
            (a) => a.type === "attack" && a.target.startsWith("p"),
          ) ??
            choices.find((a) => a.type === "play") ??
            choices[0],
        );
        validateMatch(m);
      }
      expect(m.result).toBeDefined();
      expect(replayDuel(m)).toEqual(m);
    }
  });
  it("rejects arbitrary effects, invalid parameters and creature attributes on spells", () => {
    expect(() =>
      definitionSchema.parse({
        ...fixtureMatch().cards[0].definition,
        kind: "spell",
      }),
    ).toThrow();
    expect(() =>
      definitionSchema.parse({
        ...fixtureMatch().cards[0].definition,
        abilities: [
          {
            id: "bad",
            trigger: "play",
            cost: 0,
            effects: [
              {
                definitionId: "eval",
                value: 1,
                target: "enemy",
                duration: "permanent",
              },
            ],
          },
        ],
      }),
    ).toThrow();
    expect(() =>
      createDuel(
        [
          { name: "x", affinity: "ruin", deckName: "x", cards: [] },
          { name: "y", affinity: "bloom", deckName: "y", cards: [] },
        ],
        1,
      ),
    ).toThrow();
  });
});
