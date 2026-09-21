import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

/** A stable semantic model type; it is not an asset filename or GLB asset ID. */
export type ProceduralModelTypeId = "bookshelf";

/**
 * Logical identity for a procedural world occurrence.
 *
 * `entryId` is optional because BF-1A does not associate content with a
 * conventional record yet. None of these values are derived from the Three
 * root, a mesh name, a URL, or a spatial position.
 */
export interface ProceduralContentIdentity {
  readonly entryId?: string;
  readonly instanceId: string;
  readonly modelTypeId: ProceduralModelTypeId;
}

export interface ProceduralBookshelf {
  readonly identity: ProceduralContentIdentity;
  readonly root: Group;
}

interface BoxPart {
  readonly geometry: BoxGeometry;
  readonly material: MeshStandardMaterial;
  readonly name: string;
  readonly position: readonly [number, number, number];
}

function addBox(root: Group, part: BoxPart): Mesh {
  const mesh = new Mesh(part.geometry, part.material);
  mesh.name = part.name;
  mesh.position.set(...part.position);
  root.add(mesh);
  return mesh;
}

/**
 * Creates an unattached, locally grounded bookshelf representation.
 *
 * The caller that attaches `root` owns its lifecycle and releases it through
 * `disposeObjectTree()`. Resources are private to this factory call, while
 * repeated shelves intentionally share their geometry and material inside the
 * returned root.
 */
export function createProceduralBookshelf(
  identity: ProceduralContentIdentity,
): ProceduralBookshelf {
  const root = new Group();
  root.name = "procedural-bookshelf";

  const commonMaterial = { metalness: 0, roughness: 0.82 } as const;
  const frameMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: 0x6f4e37,
  });
  const shelfMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: 0xb4875b,
  });
  const backGeometry = new BoxGeometry(2, 2.4, 0.1);
  const sideGeometry = new BoxGeometry(0.16, 2.4, 0.48);
  const shelfGeometry = new BoxGeometry(1.68, 0.16, 0.48);

  addBox(root, {
    geometry: backGeometry,
    material: frameMaterial,
    name: "bookshelf-back",
    position: [0, 1.2, 0.19],
  });
  for (const x of [-0.92, 0.92]) {
    addBox(root, {
      geometry: sideGeometry,
      material: frameMaterial,
      name: "bookshelf-side",
      position: [x, 1.2, 0],
    });
  }
  for (const y of [0.08, 0.78, 1.48, 2.18]) {
    addBox(root, {
      geometry: shelfGeometry,
      material: shelfMaterial,
      name: "bookshelf-shelf",
      position: [0, y, 0],
    });
  }

  return { identity, root };
}
