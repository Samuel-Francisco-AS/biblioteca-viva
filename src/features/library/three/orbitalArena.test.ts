import { Box3 } from "three";
import { expect, it } from "vitest";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
import { createOrbitalArena, ORBITAL_ARENA_ID } from "./orbitalArena";
import { disposeObjectTree } from "./referenceScene";
it("keeps the pickable orbital construction outside every walkable room and releases its resources", () => {
  const orbital = createOrbitalArena(),
    box = new Box3().setFromObject(orbital.root);
  expect(orbital.descriptor.id).toBe(ORBITAL_ARENA_ID);
  expect(box.min.y).toBeGreaterThan(2);
  for (const room of LIBRARY_ROOMS)
    expect(
      box.max.x < room.minX ||
        box.min.x > room.maxX ||
        box.max.z < room.minZ ||
        box.min.z > room.maxZ,
    ).toBe(true);
  expect(orbital.root.children.length).toBe(9);
  disposeObjectTree(orbital.root);
});
