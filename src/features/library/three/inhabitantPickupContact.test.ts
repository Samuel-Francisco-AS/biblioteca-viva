import { readFileSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  AnimationMixer,
  Box3,
  InstancedMesh,
  Matrix4,
  Mesh,
  Triangle,
  TorusGeometry,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createProceduralBookVolume } from "./proceduralContent";
import { withPreparedSkinning } from "./preparedSkinning";
import { SESSION_READING_SUPPORT } from "./sessionBookVisuals";
import { InhabitantNavigation } from "../inhabitantNavigation";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { INHABITANT_ENVELOPES } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";

function isMesh(o: Object3D): o is Mesh {
  return o instanceof Mesh;
}
function isInstanced(o: Object3D): o is InstancedMesh {
  return o instanceof InstancedMesh;
}

for (const key of ["aryn", "samael"] as const)
  it(`${key} reaches the original volume edge without crossing the real tabletop, furniture or floor during pickup`, async () => {
    const building = createProceduralLibraryBuilding(true);
    building.updateMatrixWorld(true);
    // Ground-level rugs are soft support; furniture solids use the same
    // >15 cm threshold as the approved physical/navigation contract.
    const solids: Box3[] = [];
    building.traverse((o) => {
      if (!isInstanced(o)) return;
      const placements: unknown = o.userData.placements;
      if (!Array.isArray(placements)) return;
      o.geometry.computeBoundingBox();
      const pieces: Box3[] = [];
      if (o.geometry instanceof TorusGeometry) {
        const { radius, tube } = o.geometry.parameters;
        // Bounding the whole torus would fill its real central opening.
        for (let arc = 0; arc < 64; arc++) {
          const a = (arc * Math.PI) / 32,
            b = ((arc + 1) * Math.PI) / 32;
          pieces.push(
            new Box3()
              .setFromPoints([
                new Vector3(radius * Math.cos(a), radius * Math.sin(a), 0),
                new Vector3(radius * Math.cos(b), radius * Math.sin(b), 0),
              ])
              .expandByScalar(tube),
          );
        }
      } else pieces.push(o.geometry.boundingBox!);
      for (let i = 0; i < o.count; i++)
        if (placements[i] === "bf4-prop:2") {
          const matrix = new Matrix4();
          o.getMatrixAt(i, matrix);
          matrix.premultiply(o.matrixWorld);
          for (const piece of pieces) {
            const box = piece.clone().applyMatrix4(matrix);
            if (box.max.y > 0.15) solids.push(box.expandByScalar(-0.005));
          }
        }
    });
    const book = createProceduralBookVolume({
      entryId: "fiction",
      instanceId: "reading-book:fiction",
      modelTypeId: "book-volume",
    });
    const g = await new GLTFLoader().parseAsync(
      new Uint8Array(
        readFileSync(`src/features/library/three/assets/${key}.glb`),
      ).buffer,
      "",
    );
    const mixer = new AnimationMixer(g.scene),
      clip = g.animations.find((c) => c.name === "pickup")!;
    mixer.clipAction(clip).play();
    mixer.setTime(0.8);
    g.scene.updateMatrixWorld(true);
    const grip = g.scene
        .getObjectByName("socket_carry")!
        .getWorldPosition(new Vector3()),
      facing = Math.PI;
    const target = new Vector3(
      SESSION_READING_SUPPORT.x + 0.15,
      SESSION_READING_SUPPORT.y + book.dimensions.width / 2 + 0.006,
      SESSION_READING_SUPPORT.z + book.dimensions.depth / 2,
    );
    grip.applyAxisAngle(new Vector3(0, 1, 0), facing);
    const origin = target.clone().sub(grip);
    origin.y = 0;
    const navigation = new InhabitantNavigation(
      collectInhabitantObstacles([building]),
    );
    expect(
      navigation.clear(origin, origin, INHABITANT_ENVELOPES[key].travel),
    ).toBe(true);
    g.scene.position.copy(origin);
    g.scene.rotation.y = facing;
    const violations: string[] = [];
    const details: unknown[] = [];
    for (let sample = 0; sample <= 32; sample++) {
      mixer.setTime(Math.max(0, (clip.duration * sample) / 32 - 0.00001));
      g.scene.updateMatrixWorld(true);
      let minimum = Infinity;
      withPreparedSkinning([g.scene], () =>
        g.scene.traverse((o) => {
          if (!isMesh(o) || o.name.includes("_FX_")) return;
          const vertices = Array.from(
            { length: o.geometry.getAttribute("position").count },
            (_, i) =>
              o.getVertexPosition(i, new Vector3()).applyMatrix4(o.matrixWorld),
          );
          for (const p of vertices) minimum = Math.min(minimum, p.y);
          const indices = o.geometry.index,
            count = indices?.count ?? vertices.length,
            triangle = new Triangle(),
            bounds = new Box3();
          for (let i = 0; i < count; i += 3) {
            triangle.set(
              vertices[indices?.getX(i) ?? i],
              vertices[indices?.getX(i + 1) ?? i + 1],
              vertices[indices?.getX(i + 2) ?? i + 2],
            );
            bounds
              .makeEmpty()
              .expandByPoint(triangle.a)
              .expandByPoint(triangle.b)
              .expandByPoint(triangle.c);
            if (
              solids.some(
                (b) =>
                  bounds.intersectsBox(b) && b.intersectsTriangle(triangle),
              )
            ) {
              violations.push(`${sample}:${o.name}`);
              if (details.length < 5)
                details.push({
                  sample,
                  mesh: o.name,
                  points: [
                    triangle.a.clone(),
                    triangle.b.clone(),
                    triangle.c.clone(),
                  ],
                  boxes: solids.filter(
                    (b) =>
                      bounds.intersectsBox(b) && b.intersectsTriangle(triangle),
                  ),
                });
            }
          }
        }),
      );
      expect(minimum).toBeGreaterThan(-0.001);
    }
    writeFileSync(
      "/tmp/bv-f2-pickup-contact.json",
      JSON.stringify(details, null, 2),
    );
    expect(violations.slice(0, 20)).toEqual([]);
    mixer.stopAllAction();
    mixer.uncacheRoot(g.scene);
    disposeObjectTree(g.scene);
    disposeObjectTree(book.root);
    disposeObjectTree(building);
  });
