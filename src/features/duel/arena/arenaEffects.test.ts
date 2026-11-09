import { expect, it, vi } from "vitest";
import { MeshBasicMaterial, Scene, Vector3 } from "three";
import { fixtureMatch } from "../../../test/duelFixtures";
import { projectArena, type ArenaEventView } from "./arenaModel";
import { createArenaEffects } from "./arenaEffects";
it("keeps damage, restoration, shielding and destruction channels distinct, pooled and disposable", () => {
  const scene = new Scene(),
    fx = createArenaEffects(scene),
    view = projectArena(fixtureMatch());
  const events: ArenaEventView[] = [
    { type: "attack", player: 0, source: "unit", target: "p1" },
    { type: "damage", player: 0, target: "p1", value: 3 },
    { type: "heal", player: 0, target: "p0", value: 2 },
    { type: "shield", player: 0, target: "unit", value: 2 },
    { type: "death", player: 1, target: "enemy" },
    { type: "roll", player: 1, value: 3 },
  ];
  fx.confirm(
    { ...view, revision: 1, events },
    (id) => new Vector3(id === "p1" ? 1 : -1, 0.2, 0),
    100,
  );
  const objects = scene.children[0].children.length;
  fx.update(300, false);
  expect(scene.children[0].children.filter((c) => c.visible).length).toBe(7);
  fx.confirm({ ...view, revision: 1, events }, () => new Vector3(), 600);
  expect(fx.active(1300)).toBe(false);
  fx.update(400, true);
  expect(scene.children[0].children.some((c) => c.visible)).toBe(false);
  fx.confirm(
    {
      ...view,
      revision: 2,
      events: [{ type: "result", player: 0 }],
      result: { winner: 0, reason: "life" },
    },
    () => new Vector3(),
    1400,
  );
  expect(fx.active(2000)).toBe(true);
  expect(scene.children[0].children.length).toBe(objects);
  const disposed = vi.spyOn(MeshBasicMaterial.prototype, "dispose");
  fx.dispose();
  expect(disposed).toHaveBeenCalled();
  expect(scene.children.length).toBe(0);
  disposed.mockRestore();
});
