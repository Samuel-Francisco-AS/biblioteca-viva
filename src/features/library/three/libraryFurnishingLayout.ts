import type { LibraryRoomId } from "../libraryBuildingGeometry";

export type FurnishingKind = "study" | "lounge" | "bench" | "plant" | "cabinet";
export interface FurnishingPlacement {
  readonly id: string;
  readonly roomId: LibraryRoomId;
  readonly kind: FurnishingKind;
  readonly x: number;
  readonly z: number;
  readonly rotation: number;
}
// Environmental islands: stable IDs retain the BF-4C order; no entryId.
const placements: readonly (readonly [
  LibraryRoomId,
  FurnishingKind,
  number,
  number,
  number,
])[] = [
  ["room-a", "study", -4.5, -2, 0],
  ["room-a", "study", 4.5, 2, 0],
  ["room-a", "lounge", -4.5, 6.8, 0],
  ["room-a", "cabinet", 7.7, -7.2, 0],
  ["room-a", "plant", -8, 7, 0],
  ["room-a", "plant", 8, 7, 0],
  ["room-b", "lounge", -15.4, -4.6, 0],
  ["room-b", "cabinet", -17, -6.8, 0],
  ["room-b", "plant", -11.7, -3.4, 0],
  ["room-c", "study", 15.4, -4.8, 0],
  ["room-c", "plant", 11.7, -3.4, 0],
  ["room-c", "bench", 17.5, -8.3, Math.PI / 2],
  ["room-d", "study", -14.9, 7.1, 0],
  ["room-d", "plant", -11.7, 3.4, 0],
  ["room-d", "bench", -17.55, 7.2, Math.PI / 2],
  ["room-e", "lounge", 15.3, 6.9, Math.PI],
  ["room-e", "cabinet", 13.7, 3.4, 0],
  ["room-e", "plant", 11.7, 3.4, 0],
];
export const LIBRARY_FURNISHING: readonly FurnishingPlacement[] = Object.freeze(
  placements.map(([roomId, kind, x, z, rotation], index) =>
    Object.freeze({
      id: `bf4-prop:${index}`,
      roomId,
      kind,
      x,
      z,
      rotation,
    }),
  ),
);

export interface FurniturePoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
export const FURNITURE_DIMENSIONS = Object.freeze({
  study: { width: 2.45, depth: 1.08, top: 0.9 },
  lounge: { width: 0.9, depth: 0.9, top: 0.66 },
  bench: { width: 1.9, depth: 0.7, top: 0.62 },
  cabinet: { width: 1.9, depth: 0.6, top: 1.09 },
});
export function furnitureWorldPoint(
  p: FurnishingPlacement,
  point: FurniturePoint,
): FurniturePoint {
  const c = Math.cos(p.rotation),
    s = Math.sin(p.rotation);
  return {
    x: p.x + point.x * c + point.z * s,
    y: point.y,
    z: p.z - point.x * s + point.z * c,
  };
}
export function furnitureLamp(p: FurnishingPlacement) {
  if (p.kind === "plant" || p.kind === "bench") return null;
  const base = p.kind === "lounge" ? 0.04 : FURNITURE_DIMENSIONS[p.kind].top;
  const height = p.kind === "lounge" ? 1.41 : 0.73;
  const local = {
    x: p.kind === "lounge" ? 1.2 : p.kind === "cabinet" ? 0.5 : 0,
    y: base + height,
    z: p.kind === "lounge" ? -0.9 : 0,
  };
  return { local, world: furnitureWorldPoint(p, local), base, height };
}
/** Clear landing patches; the 3 cm offset accommodates the paper's curled underside. */
export function furnitureScrollSupports(
  p: FurnishingPlacement,
): readonly FurniturePoint[] {
  switch (p.kind) {
    case "study":
      return [-1.08, 1.08].flatMap((x) =>
        [-0.22, 0.22].map((z) => ({
          x,
          y: FURNITURE_DIMENSIONS.study.top + 0.03,
          z,
        })),
      );
    case "bench":
      return [{ x: 0, y: FURNITURE_DIMENSIONS.bench.top + 0.03, z: 0 }];
    case "cabinet":
      // The BF-4E clock occupies B's upper display; it is not a landing pad.
      if (p.id === "bf4-prop:7") return [];
      return [
        { x: -0.72, y: FURNITURE_DIMENSIONS.cabinet.top + 0.03, z: -0.1 },
      ];
    // The hearth in E occupies the centre; land on the uncovered front rim.
    case "lounge":
      return p.roomId === "room-e"
        ? []
        : [{ x: 0, y: FURNITURE_DIMENSIONS.lounge.top + 0.03, z: -0.3 }];
    default:
      return [];
  }
}
const study = LIBRARY_FURNISHING.find((p) => p.id === "bf4-prop:9")!;
/** B uses the same solid desk for source and placement, with separate floor approaches. */
export const SCENIC_BOOK_ANCHORS = Object.freeze({
  furnitureId: study.id,
  source: furnitureWorldPoint(study, { x: -0.65, y: 0.9, z: 0.05 }),
  approach: furnitureWorldPoint(study, { x: -1.9, y: 0, z: 0 }),
  destination: furnitureWorldPoint(study, { x: 0.65, y: 0.9, z: 0.05 }),
  destinationApproach: furnitureWorldPoint(study, { x: 1.9, y: 0, z: 0 }),
});

const practiceDesk = LIBRARY_FURNISHING.find((p) => p.id === "bf4-prop:12")!;
export const PRACTICE_FOLIO_ANCHOR = furnitureWorldPoint(practiceDesk, {
  x: -0.52,
  y: 0.93,
  z: 0.02,
});
