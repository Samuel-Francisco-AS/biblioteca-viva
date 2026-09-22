import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";

/** Unattached local root. Its eventual owner releases it with disposeObjectTree(). */
export function createProceduralLibraryBuilding(): Group {
  const root = new Group();
  root.name = "procedural-library-building";
  const floor = new MeshStandardMaterial({ color: 0x9b9d83, roughness: 1 });
  const wall = new MeshStandardMaterial({ color: 0xb8b59c, roughness: 1 });
  const passage = new MeshStandardMaterial({ color: 0xaca991, roughness: 1 });
  const wallHeight = 0.85;
  const wallThickness = 0.14;

  function box(
    name: string,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    material: MeshStandardMaterial,
  ): void {
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    root.add(mesh);
  }

  function verticalWall(
    name: string,
    x: number,
    minZ: number,
    maxZ: number,
    opening?: readonly [number, number],
  ): void {
    const segments = opening
      ? [
          [minZ, opening[0]],
          [opening[1], maxZ],
        ]
      : [[minZ, maxZ]];
    for (const [start, end] of segments) {
      box(
        name,
        x,
        wallHeight / 2,
        (start + end) / 2,
        wallThickness,
        wallHeight,
        end - start,
        wall,
      );
    }
  }

  for (const room of LIBRARY_ROOMS) {
    const centerX = (room.minX + room.maxX) / 2;
    const centerZ = (room.minZ + room.maxZ) / 2;
    box(
      `${room.id}-floor`,
      centerX,
      -0.08,
      centerZ,
      room.maxX - room.minX,
      0.16,
      room.maxZ - room.minZ,
      floor,
    );
    for (const z of [room.minZ, room.maxZ]) {
      box(
        `${room.id}-outer-wall`,
        centerX,
        wallHeight / 2,
        z,
        room.maxX - room.minX,
        wallHeight,
        wallThickness,
        wall,
      );
    }
    if (room.id === "room-a") {
      for (const x of [room.minX, room.maxX]) {
        // Separate openings toward the two rooms on each side.
        verticalWall(`${room.id}-passage-wall`, x, room.minZ, -3.6);
        verticalWall(`${room.id}-passage-wall`, x, -1.8, 1.8);
        verticalWall(`${room.id}-passage-wall`, x, 3.6, room.maxZ);
      }
    } else {
      const openingZ = centerZ < 0 ? -2.7 : 2.7;
      const innerX = centerX < 0 ? room.maxX : room.minX;
      const outerX = centerX < 0 ? room.minX : room.maxX;
      verticalWall(`${room.id}-outer-wall`, outerX, room.minZ, room.maxZ);
      verticalWall(`${room.id}-passage-wall`, innerX, room.minZ, room.maxZ, [
        openingZ - 0.9,
        openingZ + 0.9,
      ]);
    }
  }

  for (const x of [-5.4, 5.4]) {
    for (const z of [-2.7, 2.7]) {
      box("passage-floor", x, -0.08, z, 0.8, 0.16, 1.8, passage);
    }
  }
  return root;
}
