import { readFileSync } from "node:fs";
import {
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SkinnedMesh,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { expect, it, vi } from "vitest";
import {
  createInhabitantPresence,
  inhabitantPresenceLevel,
} from "./inhabitantPresence";
import { INHABITANT_ENVELOPES } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";

it("Samael has quiet intervals and finite reaction peaks; Lua's decorative magic is frequent without changing agency actions", () => {
  expect(inhabitantPresenceLevel("samael", "idle", 0, 0, false)).toBe(0);
  expect(
    inhabitantPresenceLevel("samael", "idle", 7.5, 7.5, false),
  ).toBeCloseTo(0.62);
  expect(inhabitantPresenceLevel("samael", "idle", 15, 15, false)).toBe(0);
  expect(inhabitantPresenceLevel("samael", "react", 1, 0.9, false)).toBeCloseTo(
    1,
  );
  expect(inhabitantPresenceLevel("samael", "recover", 15, 3, false)).toBe(0);
  expect(
    inhabitantPresenceLevel("lua", "idle", 3.5, 3.5, false),
  ).toBeGreaterThan(0.35);
  for (const key of ["samael", "aryn", "ytha", "lua"] as const)
    for (let i = 0; i < 100; i++) {
      const level = inhabitantPresenceLevel(
        key,
        "magic",
        i * 0.2,
        i * 0.2,
        false,
      );
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
      expect(inhabitantPresenceLevel(key, "idle", i, 0, true)).toBe(
        inhabitantPresenceLevel(key, "magic", 0, 4, true),
      );
    }
});

it("presence modifies only its FX materials/light; reduced motion is static, dispose is idempotent", () => {
  const scene = new Group();
  const torso = new Object3D();
  torso.name = "Torso";
  scene.add(torso);
  const fx = new MeshStandardMaterial({ transparent: true });
  fx.name = "FX signature";
  const skin = new MeshStandardMaterial();
  skin.name = "Skin";
  scene.add(new Mesh(undefined, fx), new Mesh(undefined, skin));
  const owner = createInhabitantPresence(scene, "ytha");
  const light = scene.getObjectByName("ytha-fey-light");
  expect(light).toBeInstanceOf(PointLight);
  owner.setPointLightEnabled(false);
  owner.update(0.05, "idle", false);
  expect(light?.visible).toBe(false);
  owner.setPointLightEnabled(true);
  expect(light?.visible).toBe(true);
  const initial = scene.position.clone();
  const dispose = vi.spyOn(fx, "dispose");
  owner.update(0.05, "magic", false);
  expect(fx.opacity).toBeLessThan(1);
  expect(skin.opacity).toBe(1);
  owner.update(0.05, "idle", true);
  const frozen = fx.opacity;
  for (let i = 0; i < 50; i++) owner.update(20, "magic", true);
  expect(fx.opacity).toBe(frozen);
  expect(scene.position.equals(initial)).toBe(true);
  owner.dispose();
  owner.dispose();
  expect(light?.parent).toBeNull();
  expect(dispose).not.toHaveBeenCalled();
  owner.update(2, "magic", false);
  expect(fx.opacity).toBe(frozen);
  disposeObjectTree(scene);
  expect(dispose).toHaveBeenCalledOnce();
});

it("Ytha's real hover clips retain clearance, stable X/Z and the 0.92 m navigation envelope", async () => {
  const gltf = await new GLTFLoader().parseAsync(
    new Uint8Array(readFileSync("src/features/library/three/assets/ytha.glb"))
      .buffer,
    "",
  );
  const facing = gltf.scene.getObjectByName("Facing")!;
  const meshes: SkinnedMesh[] = [];
  const isSkin = (o: Object3D): o is SkinnedMesh => o instanceof SkinnedMesh;
  gltf.scene.traverse((o) => {
    if (isSkin(o) && o.name.includes("Ink_leather")) meshes.push(o);
  });
  expect(meshes.length).toBeGreaterThan(0);
  expect(INHABITANT_ENVELOPES.ytha.travel).toBe(0.92);
  const p = new Vector3();
  for (const clip of gltf.animations) {
    const mixer = new AnimationMixer(gltf.scene);
    mixer.clipAction(clip).play();
    for (let frame = 0; frame < 9; frame++) {
      mixer.setTime((clip.duration * frame) / 9);
      gltf.scene.updateMatrixWorld(true);
      expect(facing.position.x).toBeCloseTo(0, 6);
      expect(facing.position.z).toBeCloseTo(0, 6);
      for (const mesh of meshes)
        for (let i = 0; i < mesh.geometry.getAttribute("position").count; i++) {
          mesh.getVertexPosition(i, p).applyMatrix4(mesh.matrixWorld);
          expect(p.y).toBeGreaterThan(0.12);
        }
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(gltf.scene);
  }
  disposeObjectTree(gltf.scene);
});
