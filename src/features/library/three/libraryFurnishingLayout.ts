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
// Environmental islands, not records or future navigation/agent contracts.
const placements: readonly (readonly [
  LibraryRoomId,
  FurnishingKind,
  number,
  number,
  number,
])[] = [
  ["room-a", "study", -5.5, -5.5, 0],
  ["room-a", "study", 4.8, 4.8, 0],
  ["room-a", "lounge", -5.5, 5.3, 0],
  ["room-a", "cabinet", 6.5, -6.8, 0],
  ["room-a", "plant", -8, -7, 0],
  ["room-a", "plant", 8, 7, 0],
  ["room-b", "lounge", -14.6, -4.4, Math.PI],
  ["room-b", "cabinet", -12.1, -10.8, Math.PI / 2],
  ["room-b", "plant", -17.2, -3.5, 0],
  ["room-c", "study", 14.6, -4.4, 0],
  ["room-c", "plant", 17.2, -3.5, 0],
  ["room-c", "bench", 12, -10.7, Math.PI / 2],
  ["room-d", "study", -14.6, 4.4, 0],
  ["room-d", "plant", -17.2, 3.5, 0],
  ["room-d", "bench", -12, 10.7, Math.PI / 2],
  ["room-e", "lounge", 14.6, 4.4, 0],
  ["room-e", "cabinet", 12, 10.7, Math.PI / 2],
  ["room-e", "plant", 17.2, 3.5, 0],
];
export const LIBRARY_FURNISHING: readonly FurnishingPlacement[] =
  placements.map(([roomId, kind, x, z, rotation], index) => ({
    id: `bf4-prop:${index}`,
    roomId,
    kind,
    x,
    z,
    rotation,
  }));
