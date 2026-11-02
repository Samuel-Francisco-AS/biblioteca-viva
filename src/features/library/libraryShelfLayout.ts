import type { LibraryRoomId } from "./libraryBuildingGeometry";
import { READING_SHELF_COMPOSITION_DEFINITIONS } from "./three/readingShelfDefinitions";

// BF-4D only changes the composed building. Legacy BF-2/F5 keep their fixture.
// Fronts remain +Z: readable from the fixed orthographic camera (+X,+Z).
const locations: readonly (readonly [LibraryRoomId, number, number])[] = [
  ["room-a", -3, -7.2],
  ["room-c", 15.8, -11.2],
  ["room-d", -15.5, 3.6],
];
export const LIBRARY_SHELVES = Object.freeze(
  READING_SHELF_COMPOSITION_DEFINITIONS.map((definition, index) => {
    const [roomId, x, z] = locations[index];
    return Object.freeze({
      ...definition,
      roomId,
      position: Object.freeze([x, 0, z] as const),
    });
  }),
);
