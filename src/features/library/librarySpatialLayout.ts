import {
  LIBRARY_PASSAGES,
  LIBRARY_ROOMS,
  type LibraryRoomId,
} from "./libraryBuildingGeometry";
import { LIBRARY_FURNISHING } from "./three/libraryFurnishingLayout";
import {
  connectedWithClearance,
  containsRectangle,
  coveredByRectangles,
  validRectangle,
  type SpatialRectangle,
} from "./librarySpatialGeometry";

// Provisional geometric reservation, not an anthropometric/accessibility standard.
// 1.2 m leaves 0.6 m on each side of a centreline, below the 2.2 m clear portals.
export const LIBRARY_CIRCULATION_CLEARANCE = 1.2;
export interface CirculationRegion extends SpatialRectangle {
  readonly id: string;
}
export type LibraryActivity =
  "reading" | "study" | "rest" | "observation" | "circulation";
export interface LibraryActivityZone extends SpatialRectangle {
  readonly id: string;
  readonly roomId: LibraryRoomId;
  readonly activity: LibraryActivity;
  readonly furnishingId?: string;
}
export interface LibraryActivityPoint {
  readonly id: string;
  readonly zoneId: string;
  readonly x: number;
  readonly z: number;
  readonly radius: number;
  /** Radians about +Y, where zero faces +Z. Approach, not a seated pose. */
  readonly facing: number;
}

function corridor(
  id: string,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
): CirculationRegion {
  const half = LIBRARY_CIRCULATION_CLEARANCE / 2;
  return Object.freeze({
    id: `bf4-circulation:${id}`,
    minX: Math.min(x1, x2) - half,
    maxX: Math.max(x1, x2) + half,
    minZ: Math.min(z1, z2) - half,
    maxZ: Math.max(z1, z2) + half,
  });
}
const { x: passageX, z: passageZ } = LIBRARY_PASSAGES;
const sideX = passageX + 2.1;
export const LIBRARY_CIRCULATION = Object.freeze([
  corridor("north-link", -sideX, -passageZ, sideX, -passageZ),
  corridor("south-link", -sideX, passageZ, sideX, passageZ),
  corridor("hall-spine", 0, -5.7, 0, 6.3),
  corridor("hall-gallery", -4, -5.7, 6, -5.7),
  corridor("hall-study", -4.5, -passageZ, -4.5, -4.3),
  corridor("b-spine", -sideX, -9.5, -sideX, -passageZ),
  corridor("b-gallery", -16.5, -9.5, -sideX, -9.5),
  corridor("b-lounge", -15.2, -6.8, -sideX, -6.8),
  corridor("b-work", -15.2, -9.5, -15.2, -6.8),
  corridor("c-spine", sideX, -9.8, sideX, -passageZ),
  corridor("c-gallery", sideX, -9.8, 16.1, -9.8),
  corridor("c-study", sideX, -6.9, 16, -6.9),
  corridor("d-spine", -sideX, passageZ, -sideX, 9.6),
  corridor("d-reading", -16, passageZ, -sideX, passageZ),
  corridor("d-gallery", -17.1, 9.6, -sideX, 9.6),
  corridor("e-spine", sideX, passageZ, sideX, 9.5),
  corridor("e-observation", sideX, passageZ, 16.1, passageZ),
  corridor("e-gallery", sideX, 9.5, 17, 9.5),
]);

// Stable semantic IDs, independent of entries, meshes and placement order.
const activities: readonly (readonly [
  string,
  LibraryRoomId,
  LibraryActivity,
  number,
  number,
  number,
  string?,
])[] = [
  ["a-reading", "room-a", "reading", -3, -5.7, Math.PI],
  ["a-study", "room-a", "study", -4.5, -4.3, 0, "bf4-prop:0"],
  ["a-rest", "room-a", "rest", -4.5, 4.8, 0, "bf4-prop:2"],
  ["b-rest", "room-b", "rest", -15.2, -6.8, 0, "bf4-prop:6"],
  ["c-reading", "room-c", "reading", 15.8, -9.8, Math.PI],
  ["c-study", "room-c", "study", 15.4, -6.9, 0, "bf4-prop:9"],
  ["d-reading", "room-d", "reading", -15.5, passageZ, Math.PI],
  ["d-study", "room-d", "study", -14.9, 9.6, Math.PI, "bf4-prop:12"],
  ["e-rest", "room-e", "rest", 15.3, 9.5, Math.PI, "bf4-prop:15"],
  ["e-observation", "room-e", "observation", 16.1, passageZ, Math.PI],
];
const entrances = LIBRARY_ROOMS.slice(1).flatMap((room) => {
  const signX = room.minX < 0 ? -1 : 1;
  const z = room.maxZ < 0 ? -passageZ : passageZ;
  return [
    [
      `${room.id}-inner`,
      "room-a",
      "circulation",
      signX * (passageX - 1.5),
      z,
      (signX * Math.PI) / 2,
    ],
    [
      `${room.id}-outer`,
      room.id,
      "circulation",
      signX * (passageX + 1.5),
      z,
      (-signX * Math.PI) / 2,
    ],
  ] as const;
});
const definitions = [...activities, ...entrances];
export const LIBRARY_ACTIVITY_ZONES: readonly LibraryActivityZone[] =
  Object.freeze(
    definitions.map(([id, roomId, activity, x, z, , furnishingId]) =>
      Object.freeze({
        id: `bf4-zone:${id}`,
        roomId,
        activity,
        ...(furnishingId ? { furnishingId } : {}),
        minX: x - 0.6,
        maxX: x + 0.6,
        minZ: z - 0.6,
        maxZ: z + 0.6,
      }),
    ),
  );
export const LIBRARY_ACTIVITY_POINTS: readonly LibraryActivityPoint[] =
  Object.freeze(
    definitions.map(([id, , , x, z, facing]) =>
      Object.freeze({
        id: `bf4-point:${id}`,
        zoneId: `bf4-zone:${id}`,
        x,
        z,
        radius: 0.35,
        facing,
      }),
    ),
  );

/** Pure validation; actual factory geometry is independently checked by Box3 tests. */
export function validateLibrarySpatialLayout(
  regions = LIBRARY_CIRCULATION,
  zones = LIBRARY_ACTIVITY_ZONES,
  points = LIBRARY_ACTIVITY_POINTS,
): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of [...regions, ...zones, ...points]) {
    if (!item.id.trim() || ids.has(item.id))
      errors.push(`Identificador inválido: ${item.id}`);
    ids.add(item.id);
  }
  const bridges = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz) => ({
      minX: sx * passageX - LIBRARY_PASSAGES.length / 2,
      maxX: sx * passageX + LIBRARY_PASSAGES.length / 2,
      minZ: sz * passageZ - LIBRARY_PASSAGES.width / 2,
      maxZ: sz * passageZ + LIBRARY_PASSAGES.width / 2,
    })),
  );
  for (const region of regions) {
    if (
      !validRectangle(region) ||
      !coveredByRectangles(region, [...LIBRARY_ROOMS, ...bridges])
    )
      errors.push(`Circulação fora do piso: ${region.id}`);
  }
  if (!connectedWithClearance(regions, LIBRARY_CIRCULATION_CLEARANCE))
    errors.push("Circulação desconectada ou estreita.");
  for (const zone of zones) {
    const room = LIBRARY_ROOMS.find((r) => r.id === zone.roomId);
    if (
      !validRectangle(zone) ||
      !room ||
      !containsRectangle(room, zone) ||
      !coveredByRectangles(zone, regions)
    )
      errors.push(`Zona fora da área livre: ${zone.id}`);
    if (
      zone.furnishingId &&
      !LIBRARY_FURNISHING.some(
        (p) => p.id === zone.furnishingId && p.roomId === zone.roomId,
      )
    )
      errors.push(`Mobília incompatível: ${zone.id}`);
    if (
      !["reading", "study", "rest", "observation", "circulation"].includes(
        zone.activity,
      )
    )
      errors.push(`Atividade inválida: ${zone.id}`);
  }
  for (const point of points) {
    const zone = zones.find((z) => z.id === point.zoneId);
    if (
      ![point.x, point.z, point.radius, point.facing].every(Number.isFinite) ||
      point.radius <= 0 ||
      !zone ||
      !containsRectangle(zone, {
        minX: point.x - point.radius,
        maxX: point.x + point.radius,
        minZ: point.z - point.radius,
        maxZ: point.z + point.radius,
      })
    )
      errors.push(`Ponto inválido: ${point.id}`);
  }
  return Object.freeze(errors);
}
