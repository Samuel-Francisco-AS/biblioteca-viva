import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { PREVIEW_ROOMS } from "../bf3c3PreviewLayout";

/** Disposable preview structure: one floor per neutral positional room, open shared passages. */
export function createBf3c3PreviewBuilding(): Group {
  const root = new Group();
  root.name = "bf3c3-preview-building";
  const floor = new MeshStandardMaterial({ color: 0x9b9d83, roughness: 1 });
  const wall = new MeshStandardMaterial({ color: 0xb8b59c, roughness: 1 });
  function box(
    name: string,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    material: MeshStandardMaterial,
  ) {
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    root.add(mesh);
  }
  for (const room of PREVIEW_ROOMS) {
    box(
      `${room.id}-floor`,
      (room.minX + room.maxX) / 2,
      -0.08,
      (room.minZ + room.maxZ) / 2,
      room.maxX - room.minX,
      0.16,
      room.maxZ - room.minZ,
      floor,
    );
  }
  // Low walls keep interiors readable from the existing elevated camera.
  box("north-wall", 0, 0.55, -5, 14, 1.1, 0.12, wall);
  box("south-wall", 0, 0.55, 5, 14, 1.1, 0.12, wall);
  box("west-wall", -7, 0.55, 0, 0.12, 1.1, 10, wall);
  box("east-wall", 7, 0.55, 0, 0.12, 1.1, 10, wall);
  // Four wide passages connect room-a to each lower room.
  for (const [x0, x1] of [
    [-7, -5.95],
    [-4.55, -2.45],
    [-1.05, 1.05],
    [2.45, 4.55],
    [5.95, 7],
  ] as const) {
    box("cross-wall-segment", (x0 + x1) / 2, 0.5, 0, x1 - x0, 1, 0.12, wall);
  }
  // Three further passages connect neighboring lower rooms.
  for (const x of [-3.5, 0, 3.5]) {
    box("partition-segment", x, 0.5, 0.85, 0.12, 1, 1.7, wall);
    box("partition-segment", x, 0.5, 4.15, 0.12, 1, 1.7, wall);
  }
  return root;
}
