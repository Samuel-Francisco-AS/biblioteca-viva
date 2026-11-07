import { readFileSync } from "node:fs";
import {
  AnimationMixer,
  Box3,
  Mesh,
  Raycaster,
  SkinnedMesh,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { expect, it } from "vitest";
import { withPreparedSkinning } from "./preparedSkinning";
import { disposeObjectTree } from "./referenceScene";

it("preserves exact deformed bounds, spheres, ray hits and every CPU vertex on four real rigs across clips", async () => {
  for (const key of ["samael", "aryn", "ytha", "lua"]) {
    const gltf = await new GLTFLoader().parseAsync(
      new Uint8Array(
        readFileSync(`src/features/library/three/assets/${key}.glb`),
      ).buffer,
      "",
    );
    const mixer = new AnimationMixer(gltf.scene),
      skins: SkinnedMesh[] = [];
    const isSkin = (n: Object3D): n is SkinnedMesh => n instanceof SkinnedMesh;
    gltf.scene.traverse((n) => {
      if (isSkin(n)) skins.push(n);
    });
    let hitCount = 0;
    for (const name of ["idle", "walk", "magic"]) {
      mixer.stopAllAction();
      const clip = gltf.animations.find((c) => c.name === name)!;
      mixer.clipAction(clip).play();
      mixer.setTime(clip.duration * 0.31);
      gltf.scene.updateMatrixWorld(true);
      const read = () => {
        const vertices: number[] = [];
        for (const skin of skins) {
          skin.computeBoundingBox();
          skin.computeBoundingSphere();
          const p = new Vector3();
          for (
            let i = 0;
            i < skin.geometry.getAttribute("position").count;
            i++
          ) {
            skin.getVertexPosition(i, p);
            vertices.push(p.x, p.y, p.z);
          }
        }
        const box = new Box3().setFromObject(gltf.scene, true),
          center = box.getCenter(new Vector3());
        const ray = new Raycaster(
          new Vector3(center.x, center.y, box.max.z + 3),
          new Vector3(0, 0, -1),
        );
        const hits = ray.intersectObject(gltf.scene, true).map((h) => ({
          id: h.object.uuid,
          face: h.faceIndex,
          distance: h.distance,
          point: h.point.toArray(),
        }));
        return {
          vertices,
          box: [box.min.toArray(), box.max.toArray()],
          spheres: skins.map((s) => [
            s.boundingSphere?.center.toArray(),
            s.boundingSphere?.radius,
          ]),
          meshBoxes: skins.map((s) => [
            s.boundingBox?.min.toArray(),
            s.boundingBox?.max.toArray(),
          ]),
          hits,
        };
      };
      const original = read(),
        prepared = withPreparedSkinning([gltf.scene], read);
      expect(prepared).toEqual(original);
      hitCount += prepared.hits.length;
      expect(skins.every((s) => !Object.hasOwn(s, "getVertexPosition"))).toBe(
        true,
      );
    }
    expect(hitCount).toBeGreaterThan(0);
    const reader = skins[0].getVertexPosition.bind(skins[0]);
    expect(() =>
      withPreparedSkinning([gltf.scene], () => {
        throw new Error("query failed");
      }),
    ).toThrow("query failed");
    expect(skins.every((s) => !Object.hasOwn(s, "getVertexPosition"))).toBe(
      true,
    );
    expect(skins[0].getVertexPosition(0, new Vector3())).toEqual(
      reader(0, new Vector3()),
    );
    mixer.stopAllAction();
    mixer.uncacheRoot(gltf.scene);
    disposeObjectTree(gltf.scene);
  }
});
it("leaves non-skinned and custom vertex readers intact, including nested queries", () => {
  const mesh = new Mesh();
  const custom = () => new Vector3(1, 2, 3);
  mesh.getVertexPosition = custom;
  expect(
    withPreparedSkinning([mesh], () =>
      withPreparedSkinning([mesh], () =>
        mesh.getVertexPosition(0, new Vector3()),
      ),
    ),
  ).toEqual(new Vector3(1, 2, 3));
  expect(
    Object.getOwnPropertyDescriptor(mesh, "getVertexPosition")?.value ===
      custom,
  ).toBe(true);
  disposeObjectTree(mesh);
});
