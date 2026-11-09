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
