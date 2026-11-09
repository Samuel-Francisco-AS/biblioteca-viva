import { expect, it, vi } from "vitest";
import { Texture, TextureLoader } from "three";
import { fixtureMatch } from "../../../test/duelFixtures";
import { transition } from "../../../domain/duel/engine";
import { projectArena } from "./arenaModel";
import { arenaSlot, createArenaScene } from "./arenaScene";

it("frames every creature/artifact zone in portrait and landscape without sharing a renderer", () => {
  const world = createArenaScene();
  for (const [w, h] of [
    [390, 480],
    [650, 300],
  ]) {
    world.resize(w, h);
    for (let player = 0; player < 2; player++)
      for (let kind = 0; kind < 2; kind++)
        for (let i = 0; i < (kind ? 2 : 4); i++) {
          const p = arenaSlot(i, player, kind === 1, w / h > 1.4).project(
            world.camera,
          );
          expect(Math.abs(p.x)).toBeLessThan(0.9);
          expect(Math.abs(p.y)).toBeLessThan(0.9);
        }
  }
  world.dispose();
  expect(world.scene.children).toHaveLength(0);
});

it("places only public confirmed creatures and releases unique materials on removal", () => {
  vi.spyOn(TextureLoader.prototype, "load").mockReturnValue(new Texture());
  const world = createArenaScene();
  const match = fixtureMatch();
  const played = transition(match, {
    id: "f2-summon",
    revision: 0,
    player: 0,
    action: { type: "play", card: match.players[0].hand[0] },
  }).state;
  world.resize(390, 480);
  world.update(projectArena(played));
  expect(world.anchors().map((a) => a.id)).toEqual([
    played.players[0].units[0].id,
    "p0",
    "p1",
  ]);
  world.update(projectArena(played)); // Same revision is reconciliation, not another effect/command.
  expect(world.anchors()).toHaveLength(3);
  world.dispose();
  vi.restoreAllMocks();
});

it("plays committed multi-effect feedback once, expires it and does not replay after reconcile or reopen", () => {
  vi.spyOn(TextureLoader.prototype, "load").mockReturnValue(new Texture());
  const world = createArenaScene(),
    match = fixtureMatch();
  world.resize(390, 480);
  world.update(projectArena(match), 1000);
  expect(world.effectsActive(1000)).toBe(false);
  const played = transition(match, {
    id: "art-confirm",
    revision: 0,
    player: 0,
    action: { type: "play", card: match.players[0].hand[0] },
  }).state;
  world.update(projectArena(played), 1100);
  expect(world.effectsActive(1200)).toBe(true);
  world.animate(1200, false);
  world.update(projectArena(played), 1800);
  world.resize(650, 300);
  expect(world.effectsActive(2300)).toBe(false);
  world.animate(2300, true);
  world.dispose();
  const reopened = createArenaScene();
  reopened.update(projectArena(played), 2400);
  expect(reopened.effectsActive(2400)).toBe(false);
  reopened.dispose();
  vi.restoreAllMocks();
});
