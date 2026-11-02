import {
  Box3,
  InstancedMesh,
  Matrix4,
  Mesh,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, it, vi } from "vitest";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";
import { createLibraryFurnishing } from "./proceduralLibraryFurnishing";
import { disposeObjectTree } from "./referenceScene";
import {
  clampCameraNavigationState,
  navigationPlanePointForScreenPosition,
  zoomCameraNavigationStateBetweenScreenPoints,
} from "./cameraMath";

function isBatch(
  object: Object3D,
): object is InstancedMesh<BufferGeometry, Material | Material[]> {
  return object instanceof InstancedMesh;
}
function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}

describe("BF-4C planta e mobília", () => {
  it("amplia área útil em 3.61×/2.56× e permite centralizar todos os cômodos em ambos viewports", () => {
    for (const room of LIBRARY_ROOMS) {
      const central = room.id === "room-a";
      expect(room.maxX - room.minX).toBeCloseTo(central ? 19 : 7.68);
      expect(room.maxZ - room.minZ).toBeCloseTo(central ? 17.1 : 10.08);
      for (const [width, height] of [
        [324, 244],
        [760, 468],
      ]) {
        const state = {
          targetX: (room.minX + room.maxX) / 2,
          targetZ: (room.minZ + room.maxZ) / 2,
          zoom: 2.2,
        };
        const clamped = clampCameraNavigationState(
          state,
          width,
          height,
          LIBRARY_ROOMS,
        );
        expect(clamped?.targetX).toBeCloseTo(state.targetX);
        expect(clamped?.targetZ).toBeCloseTo(state.targetZ);
        const point = navigationPlanePointForScreenPosition(
          state,
          width / 2,
          height / 2,
          width,
          height,
          LIBRARY_ROOMS,
        );
        expect(point?.x).toBeCloseTo(state.targetX);
        expect(point?.z).toBeCloseTo(state.targetZ);
        const zoomed = zoomCameraNavigationStateBetweenScreenPoints(
          state,
          { x: width / 2, y: height / 2 },
          { x: width / 2, y: height / 2 },
          1,
          width,
          height,
          LIBRARY_ROOMS,
        );
        expect(zoomed?.targetX).toBeCloseTo(state.targetX);
        expect(zoomed?.targetZ).toBeCloseTo(state.targetZ);
      }
    }
  });
  it("distribui ilhas reais dentro das salas com circulação, ownership isolado e descarte único", () => {
    const root = createLibraryFurnishing();
    const other = createLibraryFurnishing();
    const boxes = new Map<string, Box3>();
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    let triangles = 0;
    root.traverse((object) => {
      if (!isBatch(object)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        materials.add(material);
      triangles +=
        ((object.geometry.index?.count ??
          object.geometry.attributes.position.count) /
          3) *
        object.count;
      for (let i = 0; i < object.count; i++) {
        const matrix = new Matrix4();
        object.getMatrixAt(i, matrix);
        const mesh = new Mesh(object.geometry);
        mesh.applyMatrix4(matrix);
        const ids: unknown = object.userData.placements;
        if (!Array.isArray(ids)) throw new Error("Missing placements");
        const id: unknown = ids[i];
        if (typeof id !== "string") throw new Error("Missing placement");
        const box = boxes.get(id) ?? new Box3();
        box.union(new Box3().setFromObject(mesh));
        boxes.set(id, box);
      }
    });
    expect(boxes.size).toBe(18);
    for (const room of LIBRARY_ROOMS) {
      const placements = LIBRARY_FURNISHING.filter((p) => p.roomId === room.id);
      expect(placements.length).toBeGreaterThanOrEqual(3);
      expect(
        new Set(placements.map((p) => p.kind)).size,
      ).toBeGreaterThanOrEqual(3);
      for (const placement of placements) {
        const box = boxes.get(placement.id);
        if (!box) throw new Error("Missing bounds");
        expect(box.min.x).toBeGreaterThan(room.minX + 0.3);
        expect(box.max.x).toBeLessThan(room.maxX - 0.3);
        expect(box.min.z).toBeGreaterThan(room.minZ + 0.3);
        expect(box.max.z).toBeLessThan(room.maxZ - 0.3);
      }
    }
    const bounds = [...boxes.values()];
    for (const [i, box] of bounds.entries())
      for (const next of bounds.slice(i + 1)) {
        const overlap = box.clone().intersect(next).getSize(new Vector3());
        expect(overlap.x * overlap.y * overlap.z).toBe(0);
      }
    const disposal = [...geometries, ...materials].map((value) =>
      vi.spyOn(value, "dispose"),
    );
    other.traverse((object) => {
      if (isMesh(object)) expect(geometries.has(object.geometry)).toBe(false);
    });
    console.info("BF-4C furniture", {
      meshes: root.children.filter((o) => o instanceof InstancedMesh).length,
      geometries: geometries.size,
      materials: materials.size,
      triangles,
    });
    disposeObjectTree(root);
    disposeObjectTree(root);
    for (const spy of disposal) expect(spy).toHaveBeenCalledOnce();
    disposeObjectTree(other);
  });
});
