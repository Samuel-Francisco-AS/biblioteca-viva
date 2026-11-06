import { describe, expect, it, vi } from "vitest";
import {
  Box3,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhongMaterial,
  Raycaster,
  Scene,
  Texture,
  Vector3,
  type Object3D,
  type BufferGeometry,
  type Material,
} from "three";
import {
  LIBRARY_FURNISHING,
  furnitureLamp,
  SCENIC_BOOK_ANCHORS,
} from "./libraryFurnishingLayout";
import { createLibraryFurnishing } from "./proceduralLibraryFurnishing";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { SCROLL_SURFACES } from "./scrollFlightRoutes";
import { disposeObjectTree } from "./referenceScene";
import { NIGHT_LAMPS, NightLightingSession } from "../nightLighting";
import { LivingSession } from "../livingObjects";
import { createInhabitantSceneProps } from "./inhabitantSceneProps";
import { createLivingVisuals } from "./livingVisuals";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { InhabitantNavigation, distance } from "../inhabitantNavigation";
import { INHABITANT_ENVELOPES } from "../inhabitants";

function isMesh(o: Object3D): o is Mesh<BufferGeometry, Material | Material[]> {
  return o instanceof Mesh;
}
function isBatch(
  o: Object3D,
): o is InstancedMesh<BufferGeometry, Material | Material[]> {
  return o instanceof InstancedMesh;
}
function isTexture(value: unknown): value is Texture {
  return value instanceof Texture;
}
function metadataString(o: Object3D, key: string, index: number): string {
  const values: unknown = o.userData[key];
  if (!Array.isArray(values)) throw new Error(`Missing ${key}`);
  const value: unknown = values[index];
  if (typeof value !== "string") throw new Error(`Invalid ${key}`);
  return value;
}
function solids(root: Object3D) {
  const result: { id: string; part: string; bounds: Box3 }[] = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!isMesh(o)) return;
    o.geometry.computeBoundingBox();
    const box = o.geometry.boundingBox;
    if (!box) throw new Error("Missing physical bounds");
    if (isBatch(o))
      for (let i = 0; i < o.count; i++) {
        const matrix = new Matrix4();
        o.getMatrixAt(i, matrix);
        result.push({
          id: metadataString(o, "placements", i),
          part: metadataString(o, "parts", i),
          bounds: box.clone().applyMatrix4(matrix.premultiply(o.matrixWorld)),
        });
      }
    else
      result.push({
        id: o.parent?.name ?? "",
        part: o.name,
        bounds: box.clone().applyMatrix4(o.matrixWorld),
      });
  });
  return result;
}

describe("BF-5.5E physical furniture", () => {
  it("retains the 18 IDs and distinguishes functional silhouettes at actual scale", () => {
    const root = createLibraryFurnishing();
    const parts = solids(root);
    expect(new Set(parts.map((p) => p.id))).toEqual(
      new Set(LIBRARY_FURNISHING.map((p) => p.id)),
    );
    const work = parts.filter((p) => p.id === "bf4-prop:16");
    expect(
      work.find((p) => p.part === "cabinet-top")?.bounds.max.y,
    ).toBeCloseTo(1.09);
    expect(
      work.find((p) => p.part === "mallet-head")?.bounds.min.y,
    ).toBeGreaterThan(1.09);
    const training = parts.filter((p) => p.id === "bf4-prop:14");
    expect(training.filter((p) => p.part === "stone-weight")).toHaveLength(2);
    const bar = training.find((p) => p.part === "training-bar")!.bounds;
    expect(bar.getSize(new Vector3()).z).toBeCloseTo(1.84, 5); // bench rotated 90°
    expect(bar.min.y).toBeGreaterThan(1.2);
    for (const p of parts)
      expect(
        [...p.bounds.min.toArray(), ...p.bounds.max.toArray()].every(
          Number.isFinite,
        ),
      ).toBe(true);
    root.traverse((o) => expect(o.userData.entryId).toBeUndefined());
    disposeObjectTree(root);
  });

  it("supports every scroll footprint on real geometry with clear overhead at rest", () => {
    const scene = new Scene();
    const root = createLibraryFurnishing(true);
    scene.add(root);
    createLivingVisuals(root, scene, new LivingSession());
    createInhabitantSceneProps(root);
    root.updateMatrixWorld(true);
    const physical = solids(root);
    for (const s of SCROLL_SURFACES) {
      const paper = new Box3(
        new Vector3(s.x - 0.13, s.y - 0.005, s.z - 0.175),
        new Vector3(s.x + 0.13, s.y + 0.065, s.z + 0.175),
      );
      for (const solid of physical)
        expect(
          solid.bounds.intersectsBox(paper),
          `${s.id} × ${solid.part}`,
        ).toBe(false);
    }
    for (const s of SCROLL_SURFACES)
      for (const dx of [-0.12, 0, 0.12])
        for (const dz of [-0.14, 0.14]) {
          const ray = new Raycaster(
            new Vector3(s.x + dx, s.y + 0.005, s.z + dz),
            new Vector3(0, -1, 0),
            0,
            0.055,
          );
          const hits = ray.intersectObject(root, true);
          expect(hits.length, `${s.id} footprint ${dx}/${dz}`).toBeGreaterThan(
            0,
          );
          expect(hits[0].point.y).toBeGreaterThanOrEqual(s.y - 0.05);
          expect(hits[0].point.y).toBeLessThanOrEqual(s.y);
        }
    disposeObjectTree(root);
  });

  it("places every light inside its authored shade and keeps manual/night emission independent", () => {
    const scene = new Scene(),
      root = createProceduralLibraryBuilding(true);
    scene.add(root);
    const session = new LivingSession(() => new Date(2026, 10, 5, 22));
    const night = new NightLightingSession(() => new Date(2026, 10, 5, 22));
    const visuals = createLivingVisuals(root, scene, session, night);
    visuals.update(0, true);
    for (const p of LIBRARY_FURNISHING) {
      const a = furnitureLamp(p);
      if (!a) continue;
      const shade = root.getObjectByName(`living-shade:${p.id}`);
      expect(shade).toBeInstanceOf(Mesh);
      if (
        !(shade instanceof Mesh) ||
        !(shade.material instanceof MeshPhongMaterial)
      )
        throw new Error("Missing shade");
      const point = new Vector3(a.world.x, a.world.y, a.world.z);
      expect(new Box3().setFromObject(shade).containsPoint(point)).toBe(true);
      expect(shade.material.emissiveIntensity).toBe(
        p.id === "bf4-prop:0" ? 0 : 0.55,
      );
      if (p.id !== "bf4-prop:0") {
        const fixture = NIGHT_LAMPS.find((l) => l.id === `night-lamp:${p.id}`)!;
        const light = root.getObjectByName(`${fixture.id}:light`)!;
        expect(
          light.getWorldPosition(new Vector3()).distanceTo(point),
        ).toBeLessThan(1e-6);
      }
    }
    session.act("living:lamp", "toggle");
    visuals.update(0, true);
    const manual = root.getObjectByName("living-shade:bf4-prop:0");
    if (
      !(manual instanceof Mesh) ||
      !(manual.material instanceof MeshPhongMaterial)
    )
      throw new Error("Missing manual lamp");
    expect(manual.material.emissiveIntensity).toBe(0.55);
    expect(night.pending()).toHaveLength(9);
    disposeObjectTree(root);
  });

  it("has a reachable carry route, contact support and no stationary duplicate of B's book", () => {
    const root = createProceduralLibraryBuilding(true),
      scene = new Scene();
    scene.add(root);
    const visuals = createLivingVisuals(root, scene, new LivingSession());
    const nav = new InhabitantNavigation(collectInhabitantObstacles([root]));
    for (const key of ["aryn", "samael", "lua", "ytha"] as const) {
      const route = nav.route(
        SCENIC_BOOK_ANCHORS.approach,
        SCENIC_BOOK_ANCHORS.destinationApproach,
        INHABITANT_ENVELOPES[key].travel,
      );
      expect(route, key).not.toBeNull();
    }
    expect(
      distance(SCENIC_BOOK_ANCHORS.source, SCENIC_BOOK_ANCHORS.approach),
    ).toBeLessThan(1.5);
    expect(
      distance(
        SCENIC_BOOK_ANCHORS.destination,
        SCENIC_BOOK_ANCHORS.destinationApproach,
      ),
    ).toBeLessThan(1.5);
    const book = visuals.selectables.find(
      (s) => s.descriptor.id === "living:book",
    )!;
    expect(book.root.getObjectByName("living-book-base")).toBeDefined();
    const before = collectInhabitantObstacles([root]);
    book.root.position.set(0, 1, 0);
    expect(collectInhabitantObstacles([root])).toEqual(before);
    // The tabletop remains solid even though the book itself is carried.
    expect(
      nav.clear(SCENIC_BOOK_ANCHORS.source, SCENIC_BOOK_ANCHORS.source, 0.62),
    ).toBe(false);
    const point = SCENIC_BOOK_ANCHORS.destination;
    const hit = new Raycaster(
      new Vector3(point.x, point.y + 0.01, point.z),
      new Vector3(0, -1, 0),
      0,
      0.02,
    ).intersectObject(root, true)[0];
    expect(hit?.point.y).toBeCloseTo(0.904, 5);
    disposeObjectTree(root);
  });

  it("owns and disposes original grain textures and interactive resources exactly once", () => {
    const first = createLibraryFurnishing(true),
      second = createLibraryFurnishing(true);
    const resources = new Set<{ dispose(): void }>();
    const textures = new Set<Texture>();
    first.traverse((o) => {
      if (!isMesh(o)) return;
      resources.add(o.geometry);
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of materials) {
        resources.add(m);
        for (const value of Object.values(m))
          if (isTexture(value)) {
            textures.add(value);
            resources.add(value);
          }
      }
    });
    expect(textures.size).toBe(1);
    second.traverse((o) => {
      if (isMesh(o)) {
        expect(resources.has(o.geometry)).toBe(false);
        if (o.material instanceof MeshPhongMaterial && o.material.map)
          expect(textures.has(o.material.map)).toBe(false);
      }
    });
    const spies = [...resources].map((r) => vi.spyOn(r, "dispose"));
    disposeObjectTree(first);
    disposeObjectTree(first);
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
    disposeObjectTree(second);
  });
});
