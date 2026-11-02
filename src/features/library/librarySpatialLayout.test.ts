import {
  Box3,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  OrthographicCamera,
  Raycaster,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";
import { describe, expect, it } from "vitest";
import { createBook } from "../../domain";
import { LIBRARY_ROOMS } from "./libraryBuildingGeometry";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "./libraryRecordLayout";
import { LIBRARY_SHELVES } from "./libraryShelfLayout";
import {
  LIBRARY_ACTIVITY_POINTS,
  LIBRARY_ACTIVITY_ZONES,
  LIBRARY_CIRCULATION,
  LIBRARY_CIRCULATION_CLEARANCE,
  validateLibrarySpatialLayout,
} from "./librarySpatialLayout";
import {
  connectedWithClearance,
  containsRectangle,
  coveredByRectangles,
  rectanglesOverlap,
  type SpatialRectangle,
} from "./librarySpatialGeometry";
import { projectReadingAreaBooks } from "./readingAreaBooks";
import { CameraNavigation } from "./three/CameraNavigation";
import { LIBRARY_FURNISHING } from "./three/libraryFurnishingLayout";
import { createLibraryRecordComposition } from "./three/libraryRecordComposition";
import {
  createProceduralComposition,
  replaceProceduralBookshelfRepresentation,
} from "./three/proceduralComposition";
import { createProceduralLibraryBuilding } from "./three/proceduralLibraryBuilding";
import { reconcileReadingAreaBookVisuals } from "./three/readingAreaBookVisuals";
import { disposeObjectTree } from "./three/referenceScene";

function rect(box: Box3): SpatialRectangle {
  return { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z };
}
function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}
function isBatch(
  object: Object3D,
): object is InstancedMesh<BufferGeometry, Material | Material[]> {
  return object instanceof InstancedMesh;
}

/** Expand the actual instance matrices, including their parent transforms. */
function measuredParts(root: Object3D) {
  const result: { id: string; box: Box3 }[] = [];
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!isMesh(object)) return;
    object.geometry.computeBoundingBox();
    const local = object.geometry.boundingBox;
    if (!local) throw new Error("Geometria sem bounds");
    if (!isBatch(object)) {
      result.push({
        id: object.name,
        box: local.clone().applyMatrix4(object.matrixWorld),
      });
      return;
    }
    const ids: unknown = object.userData.placements;
    for (let i = 0; i < object.count; i++) {
      const matrix = new Matrix4();
      object.getMatrixAt(i, matrix);
      const id: unknown = Array.isArray(ids) ? ids[i] : object.name;
      if (typeof id !== "string") throw new Error("Instância sem ID");
      result.push({
        id,
        box: local.clone().applyMatrix4(matrix.premultiply(object.matrixWorld)),
      });
    }
  });
  return result;
}

function composition(populated: boolean) {
  const root = new Group();
  const building = createProceduralLibraryBuilding();
  const shelves = createProceduralComposition(LIBRARY_SHELVES);
  const books = reconcileReadingAreaBookVisuals(
    shelves,
    projectReadingAreaBooks(
      populated
        ? Array.from({ length: 70 }, (_, i) =>
            createBook({
              id: `spatial-book-${i}`,
              title: `Livro fictício ${i}`,
              author: "Teste",
              currentPage: 0,
              createdAt: "2026-09-01T00:00:00.000Z",
            }),
          )
        : [],
    ),
    new Map(),
  );
  const records = createLibraryRecordComposition(
    populated
      ? INITIAL_LIBRARY_RECORD_SLOTS.map((slot) => ({
          ...slot,
          entryId: `test:${slot.slotId}`,
          instanceId: `test:${slot.slotId}`,
        }))
      : [],
  );
  root.add(building, shelves.root, records.root);
  root.updateMatrixWorld(true);
  return { root, building, shelves, books, records };
}

describe("BF-4D reservas espaciais", () => {
  it("mantém pan contínuo através das quatro passagens nos extremos de zoom e nas duas orientações", () => {
    for (const [width, height] of [
      [760, 468],
      [324, 244],
    ])
      for (const zoom of [0.7, 2.2]) {
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        const navigation = new CameraNavigation(camera, zoom, LIBRARY_ROOMS);
        navigation.setViewport(width, height);
        for (const xSign of [-1, 1])
          for (const zSign of [-1, 1]) {
            for (let step = 0; step <= 24; step++) {
              const x = xSign * step * 0.5;
              const z = zSign * 4.8;
              camera.updateMatrixWorld(true);
              const projected = new Vector3(x, 1.1, z).project(camera);
              navigation.panBetweenScreenPoints(
                {
                  x: ((projected.x + 1) * width) / 2,
                  y: ((1 - projected.y) * height) / 2,
                },
                { x: width / 2, y: height / 2 },
              );
              expect(navigation.getState().targetX).toBeCloseTo(x);
              expect(navigation.getState().targetZ).toBeCloseTo(z);
              expect(navigation.getState().zoom).toBe(zoom);
            }
          }
      }
  });
  it("declara áreas e pontos imutáveis, determinísticos, conectados e sem entidades persistentes", () => {
    const before = JSON.stringify([
      LIBRARY_CIRCULATION,
      LIBRARY_ACTIVITY_ZONES,
      LIBRARY_ACTIVITY_POINTS,
    ]);
    expect(validateLibrarySpatialLayout()).toEqual([]);
    expect(validateLibrarySpatialLayout()).toEqual([]);
    expect(
      JSON.stringify([
        LIBRARY_CIRCULATION,
        LIBRARY_ACTIVITY_ZONES,
        LIBRARY_ACTIVITY_POINTS,
      ]),
    ).toBe(before);
    expect(LIBRARY_CIRCULATION).toHaveLength(18);
    expect(LIBRARY_ACTIVITY_ZONES).toHaveLength(18);
    expect(LIBRARY_ACTIVITY_POINTS).toHaveLength(18);
    expect(
      LIBRARY_ACTIVITY_ZONES.filter((z) => z.activity === "circulation"),
    ).toHaveLength(8);
    for (const item of [
      ...LIBRARY_CIRCULATION,
      ...LIBRARY_ACTIVITY_ZONES,
      ...LIBRARY_ACTIVITY_POINTS,
      ...LIBRARY_FURNISHING,
      ...LIBRARY_SHELVES,
    ]) {
      expect(Object.isFrozen(item)).toBe(true);
      expect(Object.hasOwn(item, "entryId")).toBe(false);
    }
    for (const p of LIBRARY_FURNISHING)
      expect([p.x, p.z, p.rotation].every(Number.isFinite)).toBe(true);
    expect(new Set(LIBRARY_FURNISHING.map((p) => p.id)).size).toBe(18);
    for (const room of LIBRARY_ROOMS)
      expect(
        LIBRARY_ACTIVITY_ZONES.some(
          (z) => z.roomId === room.id && z.activity !== "circulation",
        ),
      ).toBe(true);
  });

  it("rejeita NaN, dimensão negativa, IDs duplicados, pontos fora da zona, referência errada e circulação interrompida", () => {
    const [region] = LIBRARY_CIRCULATION;
    const [zone] = LIBRARY_ACTIVITY_ZONES;
    const [point] = LIBRARY_ACTIVITY_POINTS;
    expect(
      validateLibrarySpatialLayout([...LIBRARY_CIRCULATION, region]),
    ).not.toEqual([]);
    expect(
      validateLibrarySpatialLayout([{ ...region, minX: NaN }]),
    ).not.toEqual([]);
    expect(
      validateLibrarySpatialLayout([{ ...region, maxX: region.minX - 1 }]),
    ).not.toEqual([]);
    expect(
      validateLibrarySpatialLayout(LIBRARY_CIRCULATION, [
        { ...zone, roomId: "room-e" },
      ]),
    ).not.toEqual([]);
    expect(
      validateLibrarySpatialLayout(LIBRARY_CIRCULATION, [
        { ...zone, furnishingId: "bf4-prop:17" },
      ]),
    ).not.toEqual([]);
    for (const invalid of [
      { ...point, x: point.x + 2 },
      { ...point, radius: -1 },
      { ...point, facing: Infinity },
      { ...point, zoneId: "missing" },
    ])
      expect(
        validateLibrarySpatialLayout(
          LIBRARY_CIRCULATION,
          LIBRARY_ACTIVITY_ZONES,
          [invalid],
        ),
      ).not.toEqual([]);
    expect(
      connectedWithClearance(
        LIBRARY_CIRCULATION.filter((r) => !r.id.endsWith("hall-spine")),
        LIBRARY_CIRCULATION_CLEARANCE,
      ),
    ).toBe(false);
    // A corner/sliver overlap cannot masquerade as 1.2 m of usable connection.
    expect(
      connectedWithClearance(
        [
          { minX: 0, maxX: 2, minZ: 0, maxZ: 2 },
          { minX: 1.9, maxX: 4, minZ: 1.9, maxZ: 4 },
        ],
        1.2,
      ),
    ).toBe(false);
    expect(
      coveredByRectangles({ minX: 0, maxX: 3, minZ: 0, maxZ: 1 }, [
        { minX: 0, maxX: 1, minZ: 0, maxZ: 1 },
        { minX: 2, maxX: 3, minZ: 0, maxZ: 1 },
      ]),
    ).toBe(false);
  });

  it.each([false, true])(
    "composição real (registros=%s): paredes, 18 ilhas e reservas livres sem colisões",
    (populated) => {
      const made = composition(populated);
      try {
        expect(made.shelves.instances).toHaveLength(3);
        expect(made.books.visible).toHaveLength(populated ? 70 : 0);
        expect(made.records.instances).toHaveLength(populated ? 13 : 0);
        const parts = measuredParts(made.building);
        const islands = new Map<string, Box3>();
        for (const part of parts.filter((p) => p.id.startsWith("bf4-prop:")))
          islands.set(
            part.id,
            (islands.get(part.id) ?? new Box3()).union(part.box),
          );
        expect(islands.size).toBe(18);
        const objects = [
          ...LIBRARY_FURNISHING.map((p) => ({
            id: p.id,
            roomId: p.roomId,
            box: islands.get(p.id)!,
          })),
          ...made.shelves.instances.map((s, i) => ({
            id: s.identity.instanceId,
            roomId: LIBRARY_SHELVES[i].roomId,
            box: new Box3().setFromObject(s.node),
          })),
          ...made.records.instances.map((r, i) => ({
            id: r.instanceId,
            roomId: INITIAL_LIBRARY_RECORD_SLOTS[i].roomId,
            box: new Box3().setFromObject(r.node),
          })),
        ];
        const walls = parts.filter(
          (p) => !p.id.startsWith("bf4-prop:") && p.box.max.y > 0.05,
        );
        for (const [i, object] of objects.entries()) {
          const room = LIBRARY_ROOMS.find((r) => r.id === object.roomId);
          expect(room).toBeDefined();
          if (!room) throw new Error("Cômodo ausente");
          expect(containsRectangle(room, rect(object.box)), object.id).toBe(
            true,
          );
          expect(
            [...object.box.min.toArray(), ...object.box.max.toArray()].every(
              Number.isFinite,
            ),
          ).toBe(true);
          for (const other of objects.slice(i + 1))
            expect(
              rectanglesOverlap(rect(object.box), rect(other.box)),
              `${object.id} × ${other.id}`,
            ).toBe(false);
          for (const wall of walls)
            expect(
              rectanglesOverlap(rect(object.box), rect(wall.box)),
              `${object.id} × parede`,
            ).toBe(false);
        }
        for (const region of [
          ...LIBRARY_CIRCULATION,
          ...LIBRARY_ACTIVITY_ZONES,
        ]) {
          for (const object of [...objects, ...walls])
            expect(
              rectanglesOverlap(region, rect(object.box)),
              `${region.id} × ${object.id}`,
            ).toBe(false);
        }
        for (const zone of LIBRARY_ACTIVITY_ZONES.filter(
          (z) => z.furnishingId,
        )) {
          const point = LIBRARY_ACTIVITY_POINTS.find(
            (p) => p.zoneId === zone.id,
          );
          const furnishing = LIBRARY_FURNISHING.find(
            (p) => p.id === zone.furnishingId,
          );
          if (!point || !furnishing)
            throw new Error("Referência de atividade ausente");
          const dx = furnishing.x - point.x;
          const dz = furnishing.z - point.z;
          expect(Math.hypot(dx, dz)).toBeLessThan(3);
          expect(
            Math.sin(point.facing) * dx + Math.cos(point.facing) * dz,
          ).toBeGreaterThan(0);
        }
        // Reserve a 1.2 m wide approach from the network to at least one side
        // of every real shelf/record. The final 5 cm separation avoids contact.
        for (const object of objects.filter(
          (o) => !o.id.startsWith("bf4-prop:"),
        )) {
          const footprint = rect(object.box);
          const cx = (footprint.minX + footprint.maxX) / 2;
          const cz = (footprint.minZ + footprint.maxZ) / 2;
          const half = LIBRARY_CIRCULATION_CLEARANCE / 2;
          const approaches = [
            [cx, footprint.minZ - half - 0.05],
            [cx, footprint.maxZ + half + 0.05],
            [footprint.minX - half - 0.05, cz],
            [footprint.maxX + half + 0.05, cz],
          ];
          const accessible = approaches.some(([x, z]) =>
            LIBRARY_CIRCULATION.some((region) => {
              const nx = Math.max(
                region.minX + half,
                Math.min(region.maxX - half, x),
              );
              const nz = Math.max(
                region.minZ + half,
                Math.min(region.maxZ - half, z),
              );
              if (Math.hypot(x - nx, z - nz) > 2) return false;
              const swept = {
                minX: Math.min(x, nx) - half,
                maxX: Math.max(x, nx) + half,
                minZ: Math.min(z, nz) - half,
                maxZ: Math.max(z, nz) + half,
              };
              const room = LIBRARY_ROOMS.find((r) => r.id === object.roomId);
              return (
                room &&
                containsRectangle(room, swept) &&
                [...objects, ...walls].every(
                  (other) => !rectanglesOverlap(swept, rect(other.box)),
                )
              );
            }),
          );
          expect(accessible, `Aproximação livre: ${object.id}`).toBe(true);
        }
      } finally {
        disposeObjectTree(made.root);
      }
    },
  );

  it.each([
    [760, 468],
    [324, 244],
  ])(
    "raycast visível em %s×%s para 3 estantes, 70 livros e 13 registros após pan",
    (width, height) => {
      const made = composition(true);
      try {
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        const navigation = new CameraNavigation(camera, 2.2, LIBRARY_ROOMS);
        navigation.setViewport(width, height);
        const raycaster = new Raycaster();
        const targets = [
          ...made.shelves.instances.map((s) => s.node),
          ...made.books.visible.map((b) => b.node),
          ...made.records.instances.map((r) => r.node),
        ];
        for (const target of targets) {
          const box = new Box3().setFromObject(target);
          const center = box.getCenter(new Vector3());
          camera.updateMatrixWorld(true);
          const projected = center.clone().project(camera);
          navigation.panBetweenScreenPoints(
            {
              x: ((projected.x + 1) * width) / 2,
              y: ((1 - projected.y) * height) / 2,
            },
            { x: width / 2, y: height / 2 },
          );
          camera.updateMatrixWorld(true);
          const meshes: Object3D[] = [];
          target.traverse((o) => {
            if (isMesh(o)) meshes.push(o);
          });
          const visible = meshes.some((mesh) => {
            const bounds = new Box3().setFromObject(mesh);
            for (const fx of [0.25, 0.5, 0.75])
              for (const fy of [0.25, 0.5, 0.75]) {
                const p = new Vector3(
                  bounds.min.x + (bounds.max.x - bounds.min.x) * fx,
                  bounds.min.y + (bounds.max.y - bounds.min.y) * fy,
                  bounds.max.z,
                ).project(camera);
                if (Math.abs(p.x) > 1 || Math.abs(p.y) > 1) continue;
                raycaster.setFromCamera(new Vector2(p.x, p.y), camera);
                const first = raycaster.intersectObject(made.root, true)[0]
                  ?.object;
                let ancestor: Object3D | null | undefined = first;
                while (ancestor) {
                  if (ancestor === target) return true;
                  ancestor = ancestor.parent;
                }
              }
            return false;
          });
          expect(
            visible,
            `${target.name} ${target.position.toArray().join(",")}`,
          ).toBe(true);
        }
        // Replacement retains the relocated wrapper; books remain owned by it.
        const shelf = made.shelves.instances[1];
        const position = shelf.node.position.clone();
        replaceProceduralBookshelfRepresentation(
          made.shelves,
          shelf.identity.instanceId,
          "reading-balanced",
        );
        expect(shelf.node.position).toEqual(position);
        expect(
          made.books.visible.filter((b) => b.node.parent === shelf.node),
        ).toHaveLength(25);
      } finally {
        disposeObjectTree(made.root);
      }
    },
  );
});
