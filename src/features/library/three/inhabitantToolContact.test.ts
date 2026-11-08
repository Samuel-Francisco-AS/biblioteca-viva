import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  AnimationMixer,
  Raycaster,
  SkinnedMesh,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { INHABITANTS } from "../inhabitants";
import { withPreparedSkinning } from "./preparedSkinning";
import { disposeObjectTree } from "./referenceScene";

function isSkin(o: Object3D): o is SkinnedMesh {
  return o instanceof SkinnedMesh;
}

for (const actor of INHABITANTS)
  for (const action of ["study_seated", "workshop"])
    it(`${actor.key}: ${action} has a real stylus tip on the real board`, async () => {
      const g = await new GLTFLoader().parseAsync(
        new Uint8Array(
          readFileSync(`src/features/library/three/assets/${actor.key}.glb`),
        ).buffer,
        "",
      );
      g.scene.updateMatrixWorld(true);
      const skins: SkinnedMesh[] = [];
      g.scene.traverse((o) => {
        if (isSkin(o)) skins.push(o);
      });
      const candidates: { mesh: SkinnedMesh; index: number; y: number }[] = [];
      for (const mesh of skins) {
        const bone = mesh.skeleton.bones.findIndex((b) => b.name === "ToolR");
        const indices = mesh.geometry.getAttribute("skinIndex"),
          weights = mesh.geometry.getAttribute("skinWeight");
        for (let i = 0; i < indices.count; i++)
          for (let j = 0; j < 4; j++)
            if (
              indices.getComponent(i, j) === bone &&
              weights.getComponent(i, j) > 0.99
            ) {
              const p = mesh
                .getVertexPosition(i, new Vector3())
                .applyMatrix4(mesh.matrixWorld);
              candidates.push({ mesh, index: i, y: p.y });
              break;
            }
      }
      const tip = candidates.sort((a, b) => a.y - b.y)[0];
      expect(tip).toBeDefined();
      const mixer = new AnimationMixer(g.scene);
      mixer.clipAction(g.animations.find((c) => c.name === action)!).play();
      for (let sample = 0; sample < 16; sample++) {
        mixer.setTime(sample * 0.25);
        g.scene.updateMatrixWorld(true);
        withPreparedSkinning([g.scene], () => {
          const point = tip.mesh
            .getVertexPosition(tip.index, new Vector3())
            .applyMatrix4(tip.mesh.matrixWorld);
          for (const mesh of skins) {
            mesh.computeBoundingBox();
            mesh.computeBoundingSphere();
          }
          const ray = new Raycaster(
            point.clone().add(new Vector3(0, 0.015, 0)),
            new Vector3(0, -1, 0),
            0,
            0.03,
          );
          const hit = ray.intersectObject(g.scene, true).find((hit) => {
            if (
              !isSkin(hit.object) ||
              !hit.face ||
              !hit.object.name.includes("Ivory_linen")
            )
              return false;
            const mesh = hit.object,
              bone = mesh.skeleton.bones.findIndex((b) => b.name === "ToolL");
            const indices = mesh.geometry.getAttribute("skinIndex"),
              weights = mesh.geometry.getAttribute("skinWeight");
            return [hit.face.a, hit.face.b, hit.face.c].every((i) =>
              [0, 1, 2, 3].some(
                (j) =>
                  indices.getComponent(i, j) === bone &&
                  weights.getComponent(i, j) > 0.99,
              ),
            );
          });
          expect(hit, `${action}:${sample}: tip touches paper`).toBeDefined();
          expect(
            Math.abs(hit!.distance - 0.015),
            `${action}:${sample}: contact distance`,
          ).toBeLessThan(0.003);
        });
      }
      mixer.stopAllAction();
      mixer.uncacheRoot(g.scene);
      disposeObjectTree(g.scene);
    });
