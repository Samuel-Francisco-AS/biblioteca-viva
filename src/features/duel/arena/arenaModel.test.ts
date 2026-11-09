import { describe, expect, it } from "vitest";
import { fixtureMatch } from "../../../test/duelFixtures";
import { transition } from "../../../domain/duel/engine";
import {
  arenaActionIsLegal,
  arenaActionsForSelection,
  projectArena,
} from "./arenaModel";
import { arenaRouteFor, isArenaRoute, legacyDuelRouteFor } from "./arenaRoute";

describe("BF-5.6F1 — contrato de apresentação da arena", () => {
  it("shows current game zones but never exposes hidden opponent cards or decks", () => {
    const match = fixtureMatch();
    const view = projectArena(match);

    expect(view.hand).toHaveLength(4);
    expect(view.player.handCount).toBe(4);
    expect(view.opponent.handCount).toBe(5);
    expect(view.opponent.units).toHaveLength(0);
    expect(view.actions.some((action) => action.type === "play")).toBe(true);
    expect(JSON.stringify(view)).not.toContain(match.players[1].hand[0]);
    expect(JSON.stringify(view)).not.toContain(match.players[1].deck[0]);
    expect("cards" in view).toBe(false);
    expect("history" in view).toBe(false);
  });

  it("offers only exact legal actions from a selected local card", () => {
    const match = fixtureMatch();
    const view = projectArena(match);
    const firstPlay = view.actions.find((a) => a.type === "play");
    expect(firstPlay).toBeDefined();
    if (!firstPlay || firstPlay.type !== "play") return;

    const choices = arenaActionsForSelection(view, firstPlay.card);
    expect(choices).toContainEqual(firstPlay);
    expect(choices.every((a) => arenaActionIsLegal(view, a))).toBe(true);
    expect(arenaActionsForSelection(view, match.players[1].hand[0])).toEqual(
      [],
    );
    expect(arenaActionIsLegal(view, { type: "end" })).toBe(true);
    expect(
      arenaActionIsLegal(view, {
        type: "attack",
        source: "fake",
        target: "p1",
      }),
    ).toBe(false);
  });

  it("disables local gameplay actions while the opponent acts", () => {
    const match = fixtureMatch();
    const next = transition(match, {
      id: "arena-f1-end",
      revision: match.revision,
      player: 0,
      action: { type: "end" },
    }).state;
    const view = projectArena(next);
    expect(view.active).toBe(1);
    expect(view.actions).toEqual([]);
  });

  it("redacts hidden IDs from confirmation events", () => {
    const match = structuredClone(fixtureMatch());
    match.history = [
      {
        command: {
          id: "synthetic",
          revision: 0,
          player: 0,
          action: { type: "end" },
        },
        events: [
          { type: "draw", player: 1, target: match.players[1].hand[0] },
          {
            type: "scout",
            player: 1,
            source: match.players[1].hand[1],
            value: 2,
          },
        ],
      },
    ];
    const events = projectArena(match).events;
    expect(events).toEqual([
      { type: "draw", player: 1, value: undefined },
      { type: "scout", player: 1, value: 2 },
    ]);
  });

  it("reserves the F2 immersive URL without replacing the live 2D route", () => {
    const id = "duel:abc/123";
    const path = arenaRouteFor(id);
    expect(path).toBe("/arcanario/duelos/arena/duel%3Aabc%2F123");
    expect(isArenaRoute(path)).toBe(true);
    expect(isArenaRoute(legacyDuelRouteFor(id))).toBe(false);
    expect(isArenaRoute("/arcanario/duelos")).toBe(false);
  });
});
