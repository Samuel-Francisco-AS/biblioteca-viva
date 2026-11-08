import { expect, it, vi } from "vitest";
import {
  Box3,
  DataTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Raycaster,
  Vector3,
} from "three";
import { createMagicHalo } from "./magicHalo";
import {
  createInhabitantPresence,
  inhabitantPresenceLevel,
} from "./inhabitantPresence";
import { disposeObjectTree } from "./referenceScene";
it("unlit halo is decorative, bounded and releases its own texture/material/geometry", () => {
  const halo = createMagicHalo(0xffcc77, 0.8);
  const map = halo.material.map;
  if (!(map instanceof DataTexture))
    throw new Error("Expected owned radial data texture");
  const parent = new Group();
  parent.add(halo);
  const geometry = vi.spyOn(halo.geometry, "dispose"),
    material = vi.spyOn(halo.material, "dispose"),
    texture = vi.spyOn(map, "dispose");
  expect(halo.material.depthWrite).toBe(false);
  expect(halo.material.toneMapped).toBe(false);
  expect(map.image.width).toBe(32);
  expect(
    new Raycaster(new Vector3(0, 0, 3), new Vector3(0, 0, -1)).intersectObject(
      halo,
    ),
  ).toEqual([]);
  disposeObjectTree(parent);
  expect(geometry).toHaveBeenCalledOnce();
  expect(material).toHaveBeenCalledOnce();
  expect(texture).toHaveBeenCalledOnce();
});
it("presence glow is outside exact selectable bounds, follows the bone, and leaves Ytha light unchanged", () => {
  const parent = new Group(),
    scene = new Group(),
    torso = new Group();
  torso.name = "Torso";
  scene.add(torso);
  parent.add(scene);
  const fx = new MeshStandardMaterial();
  fx.name = "FX signature";
  scene.add(new Mesh(undefined, fx));
  const before = new Box3().setFromObject(scene, true);
  const owner = createInhabitantPresence(scene, "ytha", parent);
  owner.update(0.05, "magic", false);
  expect(new Box3().setFromObject(scene, true)).toEqual(before);
  const glow = parent.getObjectByName("inhabitant-glow:ytha")!;
  expect(glow.parent).toBe(parent);
  expect(glow.parent).not.toBe(scene);
  expect(glow.position).toEqual(torso.getWorldPosition(new Vector3()));
  const light = scene.getObjectByName("ytha-fey-light");
  expect(light).toBeInstanceOf(PointLight);
  if (!(light instanceof PointLight)) throw new Error("Missing Ytha point");
  expect(light.intensity).toBeCloseTo(
    0.34 * inhabitantPresenceLevel("ytha", "magic", 0.05, 0.05, false),
  );
  owner.update(0.05, "idle", true);
  const stable = glow.position.clone();
  owner.update(10, "idle", true);
  expect(glow.position).toEqual(stable);
  owner.dispose();
  owner.dispose();
  expect(parent.getObjectByName("inhabitant-glow:ytha")).toBeUndefined();
  disposeObjectTree(parent);
});
