import { readFileSync } from "node:fs";
import { AnimationMixer, Vector3, type Quaternion } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { expect, it } from "vitest";
import { INHABITANT_ENVELOPES } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";

for (const key of ["samael", "aryn", "lua"] as const)
  for (const name of ["walk", "carry_walk"]) {
    it(`${key}/${name}: stance cancels real agency travel, feet lift in swing and the authored cycle closes`, async () => {
      const gltf = await new GLTFLoader().parseAsync(
        new Uint8Array(
          readFileSync(`src/features/library/three/assets/${key}.glb`),
        ).buffer,
        "",
      );
      const mixer = new AnimationMixer(gltf.scene);
      const clip = gltf.animations.find((c) => c.name === name)!;
      mixer.clipAction(clip).play();
      const foot = gltf.scene.getObjectByName("FootL")!;
      const at = (time: number) => {
        mixer.setTime(time);
        gltf.scene.updateMatrixWorld(true);
        return foot.getWorldPosition(new Vector3());
      };
      const start = at(0.1);
      for (const t of [0.2, 0.3, 0.4]) {
        const p = at(t);
        expect(
          Math.abs(p.z + INHABITANT_ENVELOPES[key].speed * (t - 0.1) - start.z),
        ).toBeLessThan(0.006);
        expect(Math.abs(p.y - start.y)).toBeLessThan(0.003);
        expect(Math.abs(p.x - start.x)).toBeLessThan(0.003);
      }
      expect(at(0.68).y - start.y).toBeGreaterThan(0.035);
      expect(at(0).distanceTo(at(clip.duration - 0.00001))).toBeLessThan(0.003);
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
      disposeObjectTree(gltf.scene);
    });
  }

it("Ytha flies on the vertical axis with wingbeats, trailing legs and stable navigation X/Z", async () => {
  const gltf = await new GLTFLoader().parseAsync(
    new Uint8Array(readFileSync("src/features/library/three/assets/ytha.glb"))
      .buffer,
    "",
  );
  const mixer = new AnimationMixer(gltf.scene);
  const facing = gltf.scene.getObjectByName("Facing")!;
  const wing = gltf.scene.getObjectByName("WingL")!;
  const knee = gltf.scene.getObjectByName("KneeL")!;
  for (const name of ["idle", "walk", "carry_walk", "turn"]) {
    mixer.stopAllAction();
    mixer.clipAction(gltf.animations.find((c) => c.name === name)!).play();
    const heights: number[] = [];
    const wings: Quaternion[] = [];
    const knees: Quaternion[] = [];
    for (let i = 0; i < 48; i++) {
      mixer.setTime(i / 15);
      gltf.scene.updateMatrixWorld(true);
      heights.push(facing.position.y);
      wings.push(wing.quaternion.clone());
      knees.push(knee.quaternion.clone());
      expect(facing.position.x).toBeCloseTo(0, 6);
      expect(facing.position.z).toBeCloseTo(0, 6);
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(0.04);
    expect(Math.min(...heights)).toBeGreaterThan(0.16);
    expect(
      Math.max(...wings.flatMap((q) => wings.map((other) => q.angleTo(other)))),
    ).toBeGreaterThan(0.3);
    expect(Math.max(...knees.map((q) => q.angleTo(knees[0])))).toBeGreaterThan(
      0.03,
    );
  }
  expect(INHABITANT_ENVELOPES.ytha.travel).toBe(0.92);
  mixer.stopAllAction();
  mixer.uncacheRoot(gltf.scene);
  disposeObjectTree(gltf.scene);
});
