import { setSpatialComponents, spatialBox } from "./spatialComponents";
import {
  BoxGeometry,
  CylinderGeometry,
  TorusGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
} from "three";
import { createLibraryBuildingMaterials } from "./libraryBuildingMaterials";
import { createLibraryFurnishing } from "./proceduralLibraryFurnishing";
import { LIBRARY_PASSAGES, LIBRARY_ROOMS } from "../libraryBuildingGeometry";

function isBuildingBox(
  object: Object3D,
): object is Mesh<BoxGeometry, MeshLambertMaterial> {
  return (
    object instanceof Mesh &&
    object.geometry instanceof BoxGeometry &&
    object.material instanceof MeshLambertMaterial
  );
}

/** Unattached local root. Its eventual owner releases it with disposeObjectTree(). */
export function createProceduralLibraryBuilding(interactive = false): Group {
  const root = new Group();
  root.name = "procedural-library-building";
  const physical: ReturnType<typeof spatialBox>[] = [];
  const materials = createLibraryBuildingMaterials();
  const floor = materials.timber;
  const wall = materials.plaster;
  const passage = materials.stone;
  const {
    x: passageX,
    z: passageZ,
    length: passageLength,
    width: passageWidth,
  } = LIBRARY_PASSAGES;
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
    material: MeshLambertMaterial,
  ): void {
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    root.add(mesh);
    if (name.endsWith("wall") || name === "passage-pier")
      physical.push(
        spatialBox(
          x,
          y,
          z,
          Math.max(width, 0.24),
          name.endsWith("wall") ? 0.96 : height,
          Math.max(depth, 0.24),
        ),
      );
    if (name.endsWith("wall")) {
      const alongX = width > depth;
      const length = alongX ? width : depth;
      const trim = (
        suffix: string,
        elevation: number,
        height: number,
        thickness: number,
        material: MeshLambertMaterial,
      ) => {
        box(
          `${name}-${suffix}`,
          x,
          elevation,
          z,
          alongX ? length : thickness,
          height,
          alongX ? thickness : length,
          material,
        );
      };
      trim("plinth", 0.1, 0.2, 0.22, materials.stone);
      trim(
        "panel",
        0.36,
        0.32,
        0.16,
        x < 0 ? materials.burgundy : materials.green,
      );
      trim("rail", 0.56, 0.07, 0.2, materials.timber);
      trim("crown", 0.86, 0.09, 0.24, materials.timber);
      trim("inlay", 0.915, 0.02, 0.2, materials.brass);
      // Pilasters stay on the wall line, leaving the original openings clear.
      const count = Math.max(1, Math.ceil(length / 2.4));
      for (let i = 0; i <= count; i++) {
        const offset = -length / 2 + 0.13 + ((length - 0.26) * i) / count;
        box(
          `${name}-pilaster`,
          x + (alongX ? offset : 0),
          0.47,
          z + (alongX ? 0 : offset),
          0.22,
          0.94,
          0.22,
          materials.timber,
        );
      }
    }
  }

  // Exterior court is scenery only: never included in picking or room bounds.
  // It continues below the finite timber rooms, so the gaps have real depth.
  box("sanctuary-bedrock", 0, -1.6, 0, 500, 1, 500, materials.stone);
  const courtMaterial = new MeshLambertMaterial({ color: 0x293e43 });
  const court = new Mesh(new CylinderGeometry(34, 36, 0.7, 96), courtMaterial);
  court.name = "sanctuary-court";
  court.position.y = -0.7;
  root.add(court);
  for (const radius of [23, 28, 33]) {
    const ring = new Mesh(
      new TorusGeometry(radius, 0.035, 4, 128),
      materials.brass,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.33;
    root.add(ring);
  }
  for (let i = 0; i < 32; i++) {
    const angle = (i * Math.PI) / 16;
    const marker = new Mesh(
      new BoxGeometry(0.09, 0.03, i % 4 === 0 ? 1.2 : 0.4),
      materials.brass,
    );
    marker.position.set(Math.sin(angle) * 30, -0.32, Math.cos(angle) * 30);
    marker.rotation.y = angle;
    root.add(marker);
  }

  const lantern = new MeshLambertMaterial({
    color: 0xb9e6d7,
    emissive: 0x477f72,
    emissiveIntensity: 0.7,
  });
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x = Math.sin(angle) * 26;
    const z = Math.cos(angle) * 26;
    box("court-pedestal", x, -0.1, z, 0.9, 0.5, 0.9, materials.stone);
    box("court-pillar", x, 0.8, z, 0.4, 1.5, 0.4, materials.stone);
    box("court-capital", x, 1.6, z, 0.7, 0.15, 0.7, materials.brass);
    box("court-lantern", x, 1.9, z, 0.3, 0.5, 0.3, lantern);
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
      -0.1,
      centerZ,
      room.maxX - room.minX,
      0.16,
      room.maxZ - room.minZ,
      floor,
    );
    const width = room.maxX - room.minX;
    const depth = room.maxZ - room.minZ;
    box(
      `${room.id}-foundation`,
      centerX,
      -0.23,
      centerZ,
      width + 0.32,
      0.18,
      depth + 0.32,
      materials.stone,
    );
    // Broad staggered boards: real relief without textures, coplanar faces or tiny mobile noise.
    const rows = Math.ceil((depth - 0.48) / 0.65);
    const rowDepth = (depth - 0.48) / rows;
    for (let row = 0; row < rows; row++) {
      const split = width * (row % 2 === 0 ? 0.42 : 0.58);
      const start = room.minX + 0.24;
      const end = room.maxX - 0.24;
      const seam = room.minX + split;
      for (const [left, right] of [
        [start, seam],
        [seam, end],
      ]) {
        box(
          `${room.id}-board`,
          (left + right) / 2,
          -0.012,
          room.minZ + 0.24 + (row + 0.5) * rowDepth,
          right - left - 0.018,
          0.02,
          rowDepth - 0.018,
          row % 3 === 0 ? materials.oakLight : materials.oak,
        );
      }
    }
    for (const z of [room.minZ + 0.18, room.maxZ - 0.18]) {
      box(
        `${room.id}-border`,
        centerX,
        -0.01,
        z,
        width - 0.24,
        0.02,
        0.09,
        materials.brass,
      );
    }
    for (const x of [room.minX + 0.18, room.maxX - 0.18]) {
      box(
        `${room.id}-border`,
        x,
        -0.01,
        centerZ,
        0.09,
        0.02,
        depth - 0.24,
        materials.brass,
      );
    }
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
        verticalWall(
          `${room.id}-passage-wall`,
          x,
          room.minZ,
          -passageZ - passageWidth / 2,
        );
        verticalWall(
          `${room.id}-passage-wall`,
          x,
          -passageZ + passageWidth / 2,
          passageZ - passageWidth / 2,
        );
        verticalWall(
          `${room.id}-passage-wall`,
          x,
          passageZ + passageWidth / 2,
          room.maxZ,
        );
      }
    } else {
      const openingZ = centerZ < 0 ? -passageZ : passageZ;
      const innerX = centerX < 0 ? room.maxX : room.minX;
      const outerX = centerX < 0 ? room.minX : room.maxX;
      verticalWall(`${room.id}-outer-wall`, outerX, room.minZ, room.maxZ);
      verticalWall(`${room.id}-passage-wall`, innerX, room.minZ, room.maxZ, [
        openingZ - passageWidth / 2,
        openingZ + passageWidth / 2,
      ]);
    }
  }

  for (const x of [-passageX, passageX]) {
    for (const z of [-passageZ, passageZ]) {
      box(
        "passage-floor",
        x,
        -0.08,
        z,
        passageLength,
        0.16,
        passageWidth,
        passage,
      );
      for (const edge of [-passageWidth / 2 + 0.06, passageWidth / 2 - 0.06]) {
        box(
          "passage-inlay",
          x,
          -0.004, // Top at +0.006 m, above the stone threshold (Y=0): no coplanar top faces.
          z + edge,
          passageLength,
          0.02,
          0.06,
          materials.brass,
        );
        for (const side of [-passageLength / 2, passageLength / 2]) {
          box(
            "passage-pier",
            x + side,
            0.53,
            z + edge + Math.sign(edge) * 0.12,
            0.26,
            1.06,
            0.22,
            materials.stone,
          );
          box(
            "passage-cap",
            x + side,
            1.08,
            z + edge + Math.sign(edge) * 0.12,
            0.3,
            0.08,
            0.26,
            materials.brass,
          );
        }
      }
    }
  }
  // The first integrated measurement reached 458 calls with empty shelves.
  // Batch repeated architectural boxes per material, owned solely by this root.
  const batches = new Map<
    MeshLambertMaterial,
    Mesh<BoxGeometry, MeshLambertMaterial>[]
  >();
  for (const child of [...root.children]) {
    if (!isBuildingBox(child)) continue;
    if (child.name.endsWith("-floor")) continue;
    const parts = batches.get(child.material) ?? [];
    parts.push(child);
    batches.set(child.material, parts);
  }
  for (const [material, parts] of batches) {
    const batch = new InstancedMesh(
      new BoxGeometry(1, 1, 1),
      material,
      parts.length,
    );
    batch.name = "architectural-details";
    parts.forEach((part, index) => {
      const { width, height, depth } = part.geometry.parameters;
      const matrix = new Matrix4().compose(
        part.position,
        part.quaternion,
        part.scale.clone().set(width, height, depth),
      );
      batch.setMatrixAt(index, matrix);
      part.geometry.dispose();
      root.remove(part);
    });
    batch.computeBoundingBox();
    batch.computeBoundingSphere();
    root.add(batch);
  }
  // This node owns architecture only; independent furnishing/props remain discoverable.
  const architecture = new Group();
  architecture.name = "library-architecture";
  for (const child of [...root.children])
    if (!child.name.endsWith("-floor")) architecture.add(child);
  setSpatialComponents(architecture, {
    physical,
    navigation: physical,
    mobility: "static",
  });
  root.add(architecture);
  root.add(createLibraryFurnishing(interactive));
  return root;
}
