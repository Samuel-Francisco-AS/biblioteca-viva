import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  BufferGeometry,
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  INHABITANTS,
  INHABITANT_WALK_DISTANCE,
  type InhabitantAction,
} from "../inhabitants";
import { createInhabitantAnimator } from "./inhabitantAnimator";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createProceduralComposition } from "./proceduralComposition";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { createLibraryRecordComposition } from "./libraryRecordComposition";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "../libraryRecordLayout";
import { disposeObjectTree } from "./referenceScene";

async function model(key: string) {
  return new GLTFLoader().parseAsync(
    new Uint8Array(readFileSync(`src/features/library/three/assets/${key}.glb`))
      .buffer,
    "",
  );
}
function advance(
  animator: ReturnType<typeof createInhabitantAnimator>,
  seconds: number,
  reduced = false,
) {
  for (let i = 0; i < seconds * 40; i++) animator.update(0.025, reduced);
}
const names: InhabitantAction[] = [
  "idle",
  "walk",
  "turn",
  "react",
  "gesture",
  "work",
  "magic",
  "recover",
];
for (const actor of INHABITANTS) {
  it(`${actor.key}: eight real clips, articulated limbs, finite transitions, repeated selection, reduced motion and disposal`, async () => {
    const gltf = await model(actor.key);
    expect(gltf.animations.map((c) => c.name).sort()).toEqual(
      [...names].sort(),
    );
    const wrapper = new Group();
    wrapper.add(gltf.scene);
    const animator = createInhabitantAnimator(
      gltf.scene,
      gltf.animations,
      wrapper,
      INHABITANT_WALK_DISTANCE[actor.key],
      actor.key === "lua",
    );
    const elbow = gltf.scene.getObjectByName(
      actor.key === "ytha" ? "ElbowR" : "ElbowL",
    )!;
    const hip = gltf.scene.getObjectByName("HipL")!;
    expect(elbow).toBeDefined();
    expect(hip).toBeDefined();
    animator.play("work");
    advance(animator, 1.5);
    expect(Math.abs(elbow.quaternion.x)).toBeGreaterThan(0.1);
    for (const name of names.filter((n) => n !== "idle")) {
      animator.play(name);
      advance(animator, 0.35);
      if (name === "walk") {
        expect(wrapper.position.x).toBeGreaterThan(0.02);
        expect(Math.abs(hip.quaternion.x)).toBeGreaterThan(0.02);
      }
      if (name === "react") {
        for (let i = 0; i < 12; i++) animator.play("react");
      }
      advance(animator, 8);
      expect(animator.action).toBe("idle");
      expect(wrapper.position.x).toBeCloseTo(0, 5);
    }
    animator.play("magic");
    advance(animator, 0.7);
    animator.update(0.025, true);
    const frozen = elbow.quaternion.clone();
    advance(animator, 2, true);
    expect(elbow.quaternion.equals(frozen)).toBe(true);
    expect(animator.play("work")).toBe(false);
    animator.update(0.025, false);
    expect(animator.action).toBe("idle");
    animator.dispose();
    animator.dispose();
    expect(animator.play("walk")).toBe(false);
    disposeObjectTree(wrapper);
  });
  it(`${actor.key}: directed walk clears real BF-4D walls, furniture, shelves and all record slots`, async () => {
    const environment = new Group();
    environment.add(
      createProceduralLibraryBuilding(true),
      createProceduralComposition(LIBRARY_SHELVES).root,
      createLibraryRecordComposition(
        INITIAL_LIBRARY_RECORD_SLOTS.map((slot) => ({
          ...slot,
          entryId: `test:${slot.slotId}`,
          instanceId: `test:${slot.slotId}`,
        })),
      ).root,
    );
    environment.updateMatrixWorld(true);
    const obstacles: Box3[] = [];
    environment.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const geometry: unknown = o.geometry;
      if (!(geometry instanceof BufferGeometry))
        throw new Error("Unexpected geometry");
      geometry.computeBoundingBox();
      const local = geometry.boundingBox!;
      const add = (matrix: Matrix4) => {
        const box = local.clone().applyMatrix4(matrix);
        if (box.max.y > 0.15) obstacles.push(box);
      };
      if (o instanceof InstancedMesh)
        for (let i = 0; i < o.count; i++) {
          const matrix = new Matrix4();
          o.getMatrixAt(i, matrix);
          add(matrix.premultiply(o.matrixWorld));
        }
      else add(o.matrixWorld);
    });
    const gltf = await model(actor.key);
    const wrapper = new Group();
    wrapper.position.set(actor.x, 0, actor.z);
    wrapper.add(gltf.scene);
    const animator = createInhabitantAnimator(
      gltf.scene,
      gltf.animations,
      wrapper,
      INHABITANT_WALK_DISTANCE[actor.key],
      false,
    );
    animator.play("walk");
    const collisions: string[] = [];
    for (let i = 0; i < 128; i++) {
      animator.update(0.025, false);
      const box = new Box3().setFromObject(wrapper);
      for (const obstacle of obstacles)
        if (box.intersectsBox(obstacle))
          collisions.push(
            `${actor.key} frame ${i} obstacle ${JSON.stringify(obstacle)}`,
          );
    }
    expect(collisions).toEqual([]);
    animator.dispose();
    disposeObjectTree(wrapper);
    disposeObjectTree(environment);
  });
}
