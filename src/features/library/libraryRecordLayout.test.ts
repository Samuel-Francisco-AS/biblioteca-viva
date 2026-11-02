import {
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  Mesh,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, it, vi } from "vitest";
import {
  createBook,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  type LibraryEntry,
} from "../../domain";
import { CameraNavigation } from "./three/CameraNavigation";
import { LIBRARY_ROOMS } from "./libraryBuildingGeometry";
import { projectLibraryWorldEntries } from "./libraryWorldEntries";
import {
  assignLibraryRecordSlots,
  INITIAL_LIBRARY_RECORD_SLOTS,
} from "./libraryRecordLayout";
import { createProceduralLibraryBuilding } from "./three/proceduralLibraryBuilding";
import {
  createProceduralMovieRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralWorkRecord,
} from "./three/libraryRecordRepresentations";
import { getProceduralLibraryRecordDimensions } from "./three/libraryRecordDimensions";
import {
  createProceduralComposition,
  READING_SHELF_COMPOSITION_DEFINITIONS,
} from "./three/proceduralComposition";
import { reconcileReadingAreaBookVisuals } from "./three/readingAreaBookVisuals";
import { disposeObjectTree } from "./three/referenceScene";

const counts = {
  movie: 4,
  series: 2,
  study: 5,
  physical_activity: 3,
  work: 3,
} as const;
function snapshot() {
  const entries: LibraryEntry[] = [];
  for (let index = 0; index < 70; index++)
    entries.push(
      createBook({
        id: `book-${index}`,
        title: `Livro fictício ${index}`,
        author: "Teste",
        currentPage: 0,
        createdAt: "2026-09-01T00:00:00.000Z",
      }),
    );
  for (const [type, count] of Object.entries(counts))
    for (let index = 0; index < count; index++) {
      const common = {
        id: `${type}-${index}`,
        title: `Registro fictício ${type} ${index}`,
        createdAt: new Date(Date.UTC(2026, 8, index + 1)).toISOString(),
      };
      switch (type) {
        case "movie":
          entries.push(
            createMovie({ ...common, durationMinutes: 90, year: 2025 }),
          );
          break;
        case "series":
          entries.push(createSeries({ ...common, episodesWatched: 1 }));
          break;
        case "study":
          entries.push(
            createStudy({
              ...common,
              progressCurrent: 1,
              progressUnit: "sessions",
            }),
          );
          break;
        case "physical_activity":
          entries.push(
            createPhysicalActivity({ ...common, category: "cardio" }),
          );
          break;
        case "work":
          entries.push(createWork(common));
          break;
      }
    }
  return projectLibraryWorldEntries(entries);
}
function representation(
  placement: ReturnType<typeof assignLibraryRecordSlots>["placements"][number],
) {
  switch (placement.modelTypeId) {
    case "movie-record":
      return createProceduralMovieRecord({
        ...placement,
        modelTypeId: "movie-record",
      });
    case "series-record":
      return createProceduralSeriesRecord({
        ...placement,
        modelTypeId: "series-record",
      });
    case "study-record":
      return createProceduralStudyRecord({
        ...placement,
        modelTypeId: "study-record",
      });
    case "physical-activity-record":
      return createProceduralPhysicalActivityRecord({
        ...placement,
        modelTypeId: "physical-activity-record",
      });
    case "work-record":
      return createProceduralWorkRecord({
        ...placement,
        modelTypeId: "work-record",
      });
  }
}
function bounds(root: Group) {
  return new Box3().setFromObject(root);
}
function positiveOverlap(a: Box3, b: Box3) {
  const size = a.clone().intersect(b).getSize(new Vector3());
  return size.x > 0.000001 && size.y > 0.000001 && size.z > 0.000001;
}
type DisposableMesh = Mesh<BufferGeometry, Material | Material[]>;
function isMesh(object: Object3D): object is DisposableMesh {
  return object instanceof Mesh;
}
function isInstancedMesh(
  object: Object3D,
): object is InstancedMesh<BufferGeometry, Material | Material[]> {
  return object instanceof InstancedMesh;
}
function meshes(root: Group) {
  const result: DisposableMesh[] = [];
  root.traverse((object) => {
    if (isInstancedMesh(object)) {
      object.updateWorldMatrix(true, false);
      for (let index = 0; index < object.count; index++) {
        const matrix = new Matrix4();
        object.getMatrixAt(index, matrix);
        const part = new Mesh(object.geometry, object.material);
        part.applyMatrix4(object.matrixWorld.clone().multiply(matrix));
        part.name = object.name;
        result.push(part);
      }
    } else if (isMesh(object)) result.push(object);
  });
  return result;
}

describe("construção e layout provisórios consolidados", () => {
  it("enquadra todos os acabamentos em retrato e paisagem sem mudar F3", () => {
    const building = createProceduralLibraryBuilding();
    for (const [width, height] of [
      [760, 468],
      [324, 244],
    ]) {
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      const navigation = new CameraNavigation(camera, 0.7);
      navigation.setViewport(width, height);
      camera.updateMatrixWorld(true);
      for (const mesh of meshes(building)) {
        const bounds = new Box3().setFromObject(mesh);
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
              const projected = new Vector3(x, y, z).project(camera);
              expect(Math.abs(projected.x)).toBeLessThan(1);
              expect(Math.abs(projected.y)).toBeLessThan(1);
            }
      }
    }
    disposeObjectTree(building);
  });
  it("mantém cinco cômodos neutros, pisos finitos e quatro passagens realmente abertas", () => {
    expect(LIBRARY_ROOMS.map(({ id }) => id)).toEqual([
      "room-a",
      "room-b",
      "room-c",
      "room-d",
      "room-e",
    ]);
    expect(
      LIBRARY_ROOMS.every((room) => !Object.hasOwn(room, "category")),
    ).toBe(true);
    const building = createProceduralLibraryBuilding();
    expect(building.parent).toBeNull();
    expect(building.position.toArray()).toEqual([0, 0, 0]);
    const floors = meshes(building).filter(
      ({ name }) => name.endsWith("-floor") && name !== "passage-floor",
    );
    const passages = meshes(building).filter(
      ({ name }) => name === "passage-floor",
    );
    const walls = meshes(building).filter(
      (mesh) => new Box3().setFromObject(mesh).max.y > 0.01,
    );
    expect(floors).toHaveLength(5);
    expect(passages).toHaveLength(4);
    for (const room of LIBRARY_ROOMS) {
      const floor = floors.find(({ name }) => name === `${room.id}-floor`);
      expect(floor).toBeDefined();
      if (!floor) continue;
      const box = new Box3().setFromObject(floor);
      for (const [index, actual] of [
        box.min.x,
        box.max.x,
        box.min.z,
        box.max.z,
      ].entries())
        expect(actual).toBeCloseTo(
          [room.minX, room.maxX, room.minZ, room.maxZ][index],
          5,
        );
    }
    for (const mesh of meshes(building)) {
      const box = new Box3().setFromObject(mesh);
      expect(
        [...box.min.toArray(), ...box.max.toArray()].every(Number.isFinite),
      ).toBe(true);
      expect(
        box
          .getSize(new Vector3())
          .toArray()
          .every((value) => value > 0),
      ).toBe(true);
    }
    for (const x of [-5.4, 5.4])
      for (const z of [-2.7, 2.7]) {
        const bridge = passages.find(
          (mesh) =>
            Math.abs(mesh.position.x - x) < 0.001 &&
            Math.abs(mesh.position.z - z) < 0.001,
        );
        expect(bridge).toBeDefined();
        if (!bridge) continue;
        const box = new Box3().setFromObject(bridge);
        expect(box.min.x).toBeCloseTo(x - 0.4);
        expect(box.max.x).toBeCloseTo(x + 0.4);
        const walk = new Box3(
          new Vector3(x - 0.5, 0.05, z - 0.7),
          new Vector3(x + 0.5, 2, z + 0.7),
        );
        expect(
          walls.some((wall) =>
            positiveOverlap(walk, new Box3().setFromObject(wall)),
          ),
        ).toBe(false);
      }

    // BF-4B: brass passage inlays must project slightly above the stone top.
    // Coplanar top faces previously risked z-fighting on mobile GPUs.
    const inlays = meshes(building).filter((mesh) => {
      const dimensions = new Box3()
        .setFromObject(mesh)
        .getSize(new Vector3());
      return (
        Math.abs(dimensions.x - 0.8) < 0.000001 &&
        Math.abs(dimensions.y - 0.02) < 0.000001 &&
        Math.abs(dimensions.z - 0.06) < 0.000001
      );
    });
    expect(inlays).toHaveLength(8);
    for (const inlay of inlays) {
      const box = new Box3().setFromObject(inlay);
      const center = box.getCenter(new Vector3());
      const bridge = passages.find(
        (passage) =>
          Math.abs(passage.position.x - center.x) < 0.001 &&
          Math.abs(passage.position.z - center.z) < 0.9,
      );
      expect(bridge).toBeDefined();
      if (!bridge) continue;
      const stoneTop = new Box3().setFromObject(bridge).max.y;
      expect(box.min.y).toBeLessThan(stoneTop);
      expect(box.max.y).toBeGreaterThan(stoneTop + 0.001);
    }
    disposeObjectTree(building);
  });

  it("atribui 13 slots derivados, instancia fábricas reais e não cruza sala, paredes, outros registros ou BF-2", () => {
    const source = snapshot();
    const before = structuredClone(source);
    const assignment = assignLibraryRecordSlots(source);
    expect(INITIAL_LIBRARY_RECORD_SLOTS).toHaveLength(13);
    expect(
      new Set(INITIAL_LIBRARY_RECORD_SLOTS.map(({ slotId }) => slotId)).size,
    ).toBe(INITIAL_LIBRARY_RECORD_SLOTS.length);
    expect(
      INITIAL_LIBRARY_RECORD_SLOTS.every(
        ({ position }) =>
          Object.isFrozen(position) && position.every(Number.isFinite),
      ),
    ).toBe(true);
    expect(assignment).toEqual(assignLibraryRecordSlots(source));
    expect(source).toEqual(before);
    expect(assignment.placements).toHaveLength(
      INITIAL_LIBRARY_RECORD_SLOTS.length,
    );
    expect(assignment.overflow).toHaveLength(4);
    expect(Object.isFrozen(assignment.placements)).toBe(true);
    expect(Object.isFrozen(assignment.overflow)).toBe(true);
    const building = createProceduralLibraryBuilding();
    const composition = createProceduralComposition(
      READING_SHELF_COMPOSITION_DEFINITIONS,
    );
    const books = reconcileReadingAreaBookVisuals(
      composition,
      source.categories[0].entries,
      new Map(),
    );
    expect(composition.instances).toHaveLength(3);
    expect(books.visible).toHaveLength(70);
    const structure = meshes(building).filter(
      (mesh) => new Box3().setFromObject(mesh).max.y > 0.01,
    );
    const bf2 = meshes(composition.root);
    for (const part of bf2) {
      const box = new Box3().setFromObject(part);
      expect(
        structure.some((wall) =>
          positiveOverlap(box, new Box3().setFromObject(wall)),
        ),
      ).toBe(false);
    }
    const recordRoots: Group[] = [];
    const recordBoxes: Box3[] = [];
    for (const placement of assignment.placements) {
      const made = representation(placement);
      const root = made.root;
      root.position.set(...placement.position);
      recordRoots.push(root);
      const box = bounds(root);
      recordBoxes.push(box);
      const size = box.getSize(new Vector3());
      const declared = getProceduralLibraryRecordDimensions(
        placement.modelTypeId,
      );
      expect(size.x).toBeCloseTo(declared.width, 6);
      expect(size.y).toBeCloseTo(declared.height, 6);
      expect(size.z).toBeCloseTo(declared.depth, 6);
      const room = LIBRARY_ROOMS.find(({ id }) => id === placement.roomId);
      expect(room).toBeDefined();
      if (!room) continue;
      expect(box.min.x).toBeGreaterThan(room.minX);
      expect(box.max.x).toBeLessThan(room.maxX);
      expect(box.min.z).toBeGreaterThan(room.minZ);
      expect(box.max.z).toBeLessThan(room.maxZ);
      expect(
        structure.some((wall) =>
          positiveOverlap(box, new Box3().setFromObject(wall)),
        ),
      ).toBe(false);
      expect(
        bf2.some((part) =>
          positiveOverlap(box, new Box3().setFromObject(part)),
        ),
      ).toBe(false);
    }
    for (const [index, box] of recordBoxes.entries())
      for (const other of recordBoxes.slice(index + 1))
        expect(positiveOverlap(box, other)).toBe(false);
    expect(assignment.placements.map(({ instanceId }) => instanceId)).toEqual(
      INITIAL_LIBRARY_RECORD_SLOTS.map(({ modelTypeId }, index) => {
        const prefix = modelTypeId
          .replace("-record", "")
          .replace("physical-activity", "physical_activity");
        const previous = INITIAL_LIBRARY_RECORD_SLOTS.slice(0, index).filter(
          (slot) => slot.modelTypeId === modelTypeId,
        ).length;
        return `library-${modelTypeId.replace("-record", "")}:${prefix}-${previous}`;
      }),
    );
    expect(
      assignment.overflow.every(
        (item) =>
          Object.keys(item).sort().join() === "entryId,instanceId,modelTypeId",
      ),
    ).toBe(true);
    expect(assignment.overflow.map(({ entryId }) => entryId)).toEqual([
      "movie-2",
      "movie-3",
      "study-3",
      "study-4",
    ]);
    for (const root of recordRoots) disposeObjectTree(root);
    disposeObjectTree(composition.root);
    disposeObjectTree(building);
  });

  it("rejeita identidades duplicadas e libera recursos independentes uma vez", () => {
    const source = snapshot();
    const movie = source.categories[1];
    const duplicate = {
      ...source,
      categories: [
        source.categories[0],
        { ...movie, entries: [movie.entries[0], movie.entries[0]] },
        source.categories[2],
        source.categories[3],
        source.categories[4],
        source.categories[5],
      ] as const,
    };
    expect(() => assignLibraryRecordSlots(duplicate)).toThrow(
      "Identidade inválida",
    );
    const first = createProceduralLibraryBuilding();
    const second = createProceduralLibraryBuilding();
    const firstMesh = meshes(first)[0];
    const secondMesh = meshes(second)[0];
    expect(firstMesh.geometry).not.toBe(secondMesh.geometry);
    expect(firstMesh.material).not.toBe(secondMesh.material);
    const batches = first.children.filter(
      (child) => child instanceof InstancedMesh,
    );
    expect(batches.length).toBeGreaterThan(0);
    const batchDisposals = batches.map((batch) => vi.spyOn(batch, "dispose"));
    const materials = new Set(
      meshes(first).flatMap((mesh) =>
        Array.isArray(mesh.material) ? mesh.material : [mesh.material],
      ),
    );
    const materialDisposals = [...materials].map((material) =>
      vi.spyOn(material, "dispose"),
    );
    const disposed = vi.spyOn(firstMesh.geometry, "dispose");
    const untouched = vi.spyOn(secondMesh.geometry, "dispose");
    disposeObjectTree(first);
    disposeObjectTree(first);
    expect(disposed).toHaveBeenCalledOnce();
    for (const spy of [...batchDisposals, ...materialDisposals])
      expect(spy).toHaveBeenCalledOnce();
    expect(untouched).not.toHaveBeenCalled();
    disposeObjectTree(second);
    expect(untouched).toHaveBeenCalledOnce();
  });
});
