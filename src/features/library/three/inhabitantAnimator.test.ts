import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  BufferGeometry,
  BufferAttribute,
  InterleavedBufferAttribute,
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  SkinnedMesh,
  Vector3,
  AnimationMixer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  INHABITANTS,
  PHYSICAL_ACTIONS,
  inhabitantActionRadius,
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

function vertexAttribute(geometry: unknown, name: string) {
  if (!(geometry instanceof BufferGeometry))
    throw new Error("Unexpected geometry");
  const value: unknown = geometry.getAttribute(name);
  if (
    !(value instanceof BufferAttribute) &&
    !(value instanceof InterleavedBufferAttribute)
  )
    throw new Error(`Missing vertex attribute: ${name}`);
  return value;
}
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
  it(`${actor.key}: nineteen real clips, articulated limbs, finite transitions, repeated selection, reduced motion and disposal`, async () => {
    const gltf = await model(actor.key);
    expect(gltf.animations.map((c) => c.name).sort()).toEqual(
      [...names, ...PHYSICAL_ACTIONS].sort(),
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

it("F3 external navigation owns translation and yaw; body walk loops, manual actions finish and reduced motion never returns to the F1 origin", async () => {
  const gltf = await model("ytha"),
    root = new Group();
  root.position.set(7, 0, -3);
  root.add(gltf.scene);
  const animator = createInhabitantAnimator(
    gltf.scene,
    gltf.animations,
    root,
    0.55,
    false,
    true,
  );
  animator.play("walk", true);
  advance(animator, 5);
  expect(animator.action).toBe("walk");
  expect(root.position.toArray()).toEqual([7, 0, -3]);
  expect(gltf.scene.getObjectByName("Facing")!.quaternion.y).toBeCloseTo(0, 5);
  root.position.set(-11.6, 0, 4.8);
  root.rotation.y = 1.2;
  animator.play("work");
  advance(animator, 6);
  expect(animator.action).toBe("idle");
  advance(animator, 2, true);
  expect(root.position.toArray()).toEqual([-11.6, 0, 4.8]);
  expect(root.rotation.y).toBe(1.2);
  advance(animator, 1, false);
  expect(root.position.toArray()).toEqual([-11.6, 0, 4.8]);
  animator.dispose();
  disposeObjectTree(root);
});

for (const actor of INHABITANTS)
  it(`F3 ${actor.key}: measured radial envelopes include wings, props and every authored action`, async () => {
    const gltf = await model(actor.key);
    const excess: string[] = [];
    const p = new Vector3();
    const baseVertex = new Vector3();
    const influencedVertex = new Vector3();
    for (const clip of gltf.animations) {
      const mixer = new AnimationMixer(gltf.scene);
      mixer.clipAction(clip).play();
      const name = [...names, ...PHYSICAL_ACTIONS].find(
        (name) => name === clip.name,
      );
      expect(name).toBeDefined();
      if (!name) throw new Error("Unknown exported action");
      const limit = inhabitantActionRadius(actor.key, name);
      for (let frame = 0; frame <= 32; frame++) {
        mixer.setTime((clip.duration * frame) / 32);
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((o) => {
          if (!(o instanceof Mesh)) return;
          const geometry: unknown = o.geometry;
          if (!(geometry instanceof BufferGeometry))
            throw new Error("Unexpected geometry");
          const positions: unknown = geometry.getAttribute("position");
          if (
            !(positions instanceof BufferAttribute) &&
            !(positions instanceof InterleavedBufferAttribute)
          )
            throw new Error("Unexpected vertex attribute");
          // Cache the per-bone matrix product once per sampled pose, not once
          // per vertex. Same weighted deformation, every vertex/frame retained.
          const palette =
            o instanceof SkinnedMesh
              ? o.skeleton.bones.map((bone, index) =>
                  new Matrix4().multiplyMatrices(
                    bone.matrixWorld,
                    o.skeleton.boneInverses[index],
                  ),
                )
              : null;
          const weights = palette
            ? vertexAttribute(geometry, "skinWeight")
            : null;
          const indices = palette
            ? vertexAttribute(geometry, "skinIndex")
            : null;
          for (let i = 0; i < positions.count; i++) {
            p.fromBufferAttribute(positions, i);
            if (o instanceof SkinnedMesh && palette && weights && indices) {
              baseVertex.copy(p).applyMatrix4(o.bindMatrix);
              p.set(0, 0, 0);
              for (let influence = 0; influence < 4; influence++) {
                const weight = weights.getComponent(i, influence);
                if (weight === 0) continue;
                influencedVertex
                  .copy(baseVertex)
                  .applyMatrix4(palette[indices.getComponent(i, influence)]);
                p.addScaledVector(influencedVertex, weight);
              }
              p.applyMatrix4(o.bindMatrixInverse);
            }
            p.applyMatrix4(o.matrixWorld);
            if (Math.hypot(p.x, p.z) > limit)
              excess.push(`${clip.name}:${frame}:${o.name}`);
          }
        });
      }
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
    }
    expect(excess).toEqual([]);
    disposeObjectTree(gltf.scene);
  }, 30_000);
