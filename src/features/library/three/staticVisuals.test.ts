import {
  Box3,
  BufferGeometry,
  Group,
  Mesh,
  Raycaster,
  Vector3,
  type Object3D,
  type Material,
} from "three";
import { expect, it, vi, type MockInstance } from "vitest";
import { createProceduralBookshelf } from "./proceduralContent";
import { batchStaticBookshelf, freezeLocalTransform } from "./staticVisuals";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { flightObstacles } from "./scrollFlightRoutes";
import { disposeObjectTree } from "./referenceScene";

function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh && object.geometry instanceof BufferGeometry;
}
function geometryStats(root: Object3D) {
  let meshes = 0,
    triangles = 0,
    bytes = 0;
  const geometries = new Set<BufferGeometry>();
  root.traverse((o) => {
    if (isMesh(o)) {
      meshes++;
      triangles +=
        (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
      geometries.add(o.geometry);
    }
  });
  for (const g of geometries) {
    bytes += g.index?.array.byteLength ?? 0;
    for (const a of Object.values(g.attributes)) bytes += a.array.byteLength;
  }
  return { meshes, triangles, geometries: geometries.size, bytes };
}
it.each([
  "reading-balanced",
  "reading-dark-tall",
  "reading-light-wide",
] as const)(
  "bakes %s without losing triangles, bounds, exact picking, physical bays or ownership",
  (variant) => {
    const shelf = createProceduralBookshelf(
      { instanceId: "fiction", modelTypeId: "bookshelf" },
      variant,
    );
    const root = shelf.root,
      bounds = new Box3().setFromObject(root),
      before = geometryStats(root);
    const nav = collectInhabitantObstacles([root]),
      flight = flightObstacles(root);
    const ray = new Raycaster(new Vector3(0, 1, 3), new Vector3(0, 0, -1));
    const hit = ray.intersectObject(root, true)[0];
    expect(hit).toBeDefined();
    const disposals = new Map<BufferGeometry, MockInstance<() => void>>();
    root.traverse((o) => {
      if (isMesh(o) && !disposals.has(o.geometry))
        disposals.set(o.geometry, vi.spyOn(o.geometry, "dispose"));
    });
    batchStaticBookshelf(root);
    const after = geometryStats(root),
      newBounds = new Box3().setFromObject(root);
    expect(after.triangles).toBe(before.triangles);
    expect(after.meshes).toBe(3);
    for (const key of ["x", "y", "z"] as const) {
      expect(newBounds.min[key]).toBeCloseTo(bounds.min[key], 6);
      expect(newBounds.max[key]).toBeCloseTo(bounds.max[key], 6);
    }
    expect(ray.intersectObject(root, true)[0].distance).toBeCloseTo(
      hit.distance,
      6,
    );
    expect(collectInhabitantObstacles([root])).toEqual(nav);
    expect(flightObstacles(root)).toEqual(flight);
    expect(
      [...disposals.values()].every((spy) => spy.mock.calls.length === 1),
    ).toBe(true);
    const mesh = root.children[0];
    if (!isMesh(mesh) || Array.isArray(mesh.material))
      throw new Error("Missing static batch");
    const geometryDispose = vi.spyOn(mesh.geometry, "dispose"),
      materialDispose = vi.spyOn(mesh.material, "dispose");
    disposeObjectTree(root);
    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(
      [...disposals.values()].every((spy) => spy.mock.calls.length === 1),
    ).toBe(true);
  },
);
it("frozen local transforms continue following their parent, and dynamic children remain live", () => {
  const parent = new Group(),
    child = new Group();
  parent.add(child);
  child.position.set(1, 2, 3);
  freezeLocalTransform(child);
  parent.position.x = 5;
  parent.updateMatrixWorld(true);
  expect(child.getWorldPosition(new Vector3()).toArray()).toEqual([6, 2, 3]);
  const dynamic = new Group();
  child.add(dynamic);
  dynamic.position.z = 4;
  parent.updateMatrixWorld(true);
  expect(dynamic.getWorldPosition(new Vector3()).toArray()).toEqual([6, 2, 7]);
});
