import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  AnimationMixer,
  Box3,
  InstancedMesh,
  Matrix4,
  Mesh,
  Raycaster,
  Triangle,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { withPreparedSkinning } from "./preparedSkinning";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { SESSION_SEATS, seatForInhabitant } from "../sessionStations";
import { INHABITANTS, INHABITANT_GROUND_CLEARANCE } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";

function isMesh(o: Object3D): o is Mesh {
  return o instanceof Mesh;
}
function isInstanced(o: Object3D): o is InstancedMesh {
  return o instanceof InstancedMesh;
}

for (const actor of INHABITANTS)
  it(`${actor.key}: real seat support, soles and solid contact throughout sit/read/study/stand`, async () => {
    const building = createProceduralLibraryBuilding(true);
    building.updateMatrixWorld(true);
    const seat = seatForInhabitant(SESSION_SEATS[0], actor.key);
    const solids: { part: string; box: Box3 }[] = [];
    building.traverse((o) => {
      if (!isInstanced(o)) return;
      const parts: unknown = o.userData.parts,
        placements: unknown = o.userData.contacts;
      if (!Array.isArray(parts) || !Array.isArray(placements)) return;
      o.geometry.computeBoundingBox();
      for (let i = 0; i < o.count; i++)
        if (placements[i] === seat.id) {
          const matrix = new Matrix4();
          o.getMatrixAt(i, matrix);
          solids.push({
            part: String(parts[i]),
            box: o.geometry
              .boundingBox!.clone()
              .applyMatrix4(matrix.premultiply(o.matrixWorld))
              .expandByScalar(-0.005),
          });
        }
    });
    expect(solids.length).toBeGreaterThan(5);
    const g = await new GLTFLoader().parseAsync(
      new Uint8Array(
        readFileSync(`src/features/library/three/assets/${actor.key}.glb`),
      ).buffer,
      "",
    );
    g.scene.position.set(seat.dock.x, 0, seat.dock.z);
    g.scene.rotation.y = seat.facing;
    const mixer = new AnimationMixer(g.scene);
    const violations: string[] = [];
    for (const name of ["sit", "read_seated", "study_seated", "stand"]) {
      mixer.stopAllAction();
      const clip = g.animations.find((c) => c.name === name)!;
      expect(clip).toBeDefined();
      mixer.clipAction(clip).play();
      for (let frame = 0; frame <= 16; frame++) {
        mixer.setTime(Math.max(0, (clip.duration * frame) / 16 - 0.00001));
        g.scene.updateMatrixWorld(true);
        let bottom = Infinity;
        withPreparedSkinning([g.scene], () =>
          g.scene.traverse((o) => {
            if (!isMesh(o) || o.name.includes("_FX_")) return; // intangible auras have no material contact
            const vertices: Vector3[] = [];
            for (
              let j = 0;
              j < o.geometry.getAttribute("position").count;
              j++
            ) {
              const p = o
                .getVertexPosition(j, new Vector3())
                .applyMatrix4(o.matrixWorld);
              vertices.push(p);
              bottom = Math.min(bottom, p.y);
            }
            const indices = o.geometry.index;
            const count = indices?.count ?? vertices.length;
            const triangle = new Triangle(),
              bounds = new Box3();
            for (let j = 0; j < count; j += 3) {
              triangle.set(
                vertices[indices?.getX(j) ?? j],
                vertices[indices?.getX(j + 1) ?? j + 1],
                vertices[indices?.getX(j + 2) ?? j + 2],
              );
              bounds
                .makeEmpty()
                .expandByPoint(triangle.a)
                .expandByPoint(triangle.b)
                .expandByPoint(triangle.c);
              for (const solid of solids)
                if (
                  bounds.intersectsBox(solid.box) &&
                  solid.box.intersectsTriangle(triangle)
                ) {
                  violations.push(`${name}:${frame}:${o.name}:${solid.part}`);
                  break;
                }
            }
          }),
        );
        expect(bottom, `${name}:${frame}: floor`).toBeCloseTo(
          INHABITANT_GROUND_CLEARANCE[actor.key],
          3,
        );
        if (name === "read_seated") {
          const contact = g.scene
            .getObjectByName("socket_seat")!
            .getWorldPosition(new Vector3());
          expect(contact.y).toBeCloseTo(seat.height, 3);
          const ray = new Raycaster(
            contact.clone().add(new Vector3(0, 0.02, 0)),
            new Vector3(0, -1, 0),
            0,
            0.05,
          );
          expect(
            ray.intersectObject(building, true).length,
            `${actor.key}: actual cushion support`,
          ).toBeGreaterThan(0);
        }
      }
    }
    expect(violations.slice(0, 20)).toEqual([]);
    mixer.stopAllAction();
    mixer.uncacheRoot(g.scene);
    disposeObjectTree(g.scene);
    disposeObjectTree(building);
  });
