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
  ["room-c", "bench", 17.3, -8.3, Math.PI / 2],
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
