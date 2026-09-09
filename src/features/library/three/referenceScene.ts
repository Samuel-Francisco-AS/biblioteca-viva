import {
  BoxGeometry,
  BufferGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  DirectionalLight,
  Texture,
  type Material,
} from "three";

import type { WorldSelectableObject } from "../worldRuntime";

export const REFERENCE_SCENE_PROXY_TYPES = 4;

export interface ReferenceScene {
  readonly meshCount: number;
  readonly root: Group;
  readonly selectables: readonly ReferenceSelectableObject[];
}

export interface ReferenceSelectableObject {
  readonly descriptor: WorldSelectableObject;
  readonly root: Object3D;
}

function isDisposableMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}

interface BoxPart {
  readonly color: MeshStandardMaterial;
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number, number];
}

function addBox(parent: Object3D, part: BoxPart): Mesh {
  const mesh = new Mesh(new BoxGeometry(...part.size), part.color);
  mesh.position.set(...part.position);
  parent.add(mesh);
  return mesh;
}

function createBookcase(
  materials: ReferenceMaterials,
  x: number,
  z: number,
): Group {
  const bookcase = new Group();
  bookcase.name = "bookcase-proxy";
  const parts: readonly BoxPart[] = [
    { color: materials.wood, position: [0, 1.65, 0], size: [2.2, 3.3, 0.18] },
    {
      color: materials.darkWood,
      position: [-1.02, 1.65, 0.25],
      size: [0.16, 3.3, 0.55],
    },
    {
      color: materials.darkWood,
      position: [1.02, 1.65, 0.25],
      size: [0.16, 3.3, 0.55],
    },
    { color: materials.wood, position: [0, 0.18, 0.25], size: [2, 0.14, 0.52] },
    { color: materials.wood, position: [0, 1.15, 0.25], size: [2, 0.14, 0.52] },
    { color: materials.wood, position: [0, 2.12, 0.25], size: [2, 0.14, 0.52] },
    { color: materials.wood, position: [0, 3.12, 0.25], size: [2, 0.14, 0.52] },
  ];
  for (const part of parts) addBox(bookcase, part);
  bookcase.position.set(x, 0.1, z);
  return bookcase;
}

function createTable(
  materials: ReferenceMaterials,
  x: number,
  z: number,
): Group {
  const table = new Group();
  table.name = "table-proxy";
  addBox(table, {
    color: materials.green,
    position: [0, 1.15, 0],
    size: [2.8, 0.18, 1.5],
  });
  for (const legX of [-1.15, 1.15]) {
    for (const legZ of [-0.5, 0.5]) {
      addBox(table, {
        color: materials.darkWood,
        position: [legX, 0.58, legZ],
        size: [0.16, 1.15, 0.16],
      });
    }
  }
  table.position.set(x, 0.1, z);
  return table;
}

function createBench(
  materials: ReferenceMaterials,
  x: number,
  z: number,
): Group {
  const bench = new Group();
  bench.name = "bench-proxy";
  addBox(bench, {
    color: materials.blue,
    position: [0, 0.72, 0],
    size: [2.2, 0.2, 0.72],
  });
  for (const legX of [-0.82, 0.82]) {
    addBox(bench, {
      color: materials.darkWood,
      position: [legX, 0.36, 0],
      size: [0.18, 0.72, 0.5],
    });
  }
  bench.position.set(x, 0.1, z);
  return bench;
}

interface ReferenceMaterials {
  readonly blue: MeshStandardMaterial;
  readonly darkWood: MeshStandardMaterial;
  readonly floor: MeshStandardMaterial;
  readonly green: MeshStandardMaterial;
  readonly wall: MeshStandardMaterial;
  readonly wood: MeshStandardMaterial;
}

function createMaterials(): ReferenceMaterials {
  const common = { metalness: 0, roughness: 0.82 } as const;
  return {
    blue: new MeshStandardMaterial({ ...common, color: 0x477b91 }),
    darkWood: new MeshStandardMaterial({ ...common, color: 0x493f35 }),
    floor: new MeshStandardMaterial({ ...common, color: 0xb9b39f }),
    green: new MeshStandardMaterial({ ...common, color: 0x547c65 }),
    wall: new MeshStandardMaterial({ ...common, color: 0xe0d7c4 }),
    wood: new MeshStandardMaterial({ ...common, color: 0x9c7550 }),
  };
}

export function createReferenceScene(): ReferenceScene {
  const root = new Group();
  root.name = "f1-b-reference-scene";
  const materials = createMaterials();

  addBox(root, {
    color: materials.floor,
    position: [0, 0, 0],
    size: [14, 0.2, 10],
  }).name = "floor";

  const walls: readonly BoxPart[] = [
    { color: materials.wall, position: [-4.6, 1.6, -5], size: [4.6, 3, 0.2] },
    { color: materials.wall, position: [3.1, 1.6, -5], size: [7.6, 3, 0.2] },
    { color: materials.wall, position: [-7, 1.6, -3.35], size: [0.2, 3, 3.3] },
    { color: materials.wall, position: [-7, 1.6, 1.65], size: [0.2, 3, 6.7] },
  ];
  for (const [index, wall] of walls.entries()) {
    addBox(root, wall).name = `wall-${index + 1}`;
  }

  const bookcases = [
    createBookcase(materials, -5.1, -4.65),
    createBookcase(materials, -2.45, -4.65),
    createBookcase(materials, 4.65, -4.65),
  ] as const;
  const tables = [
    createTable(materials, -2.2, -0.9),
    createTable(materials, 2.7, 1.75),
  ] as const;
  const benches = [
    createBench(materials, -3.8, 2.65),
    createBench(materials, 3.6, -1.35),
  ] as const;
  root.add(...bookcases, ...tables, ...benches);

  const cratePositions: readonly (readonly [number, number, number])[] = [
    [5.3, 0.55, 3.75],
    [5.95, 0.4, 3.1],
    [4.7, 0.32, 3.05],
  ];
  const crates: Mesh[] = [];
  for (const [index, position] of cratePositions.entries()) {
    const crate = addBox(root, {
      color: materials.wood,
      position,
      size: [0.9 - index * 0.12, 0.9 - index * 0.12, 0.9 - index * 0.12],
    });
    crate.name = "crate-proxy";
    crates.push(crate);
  }

  const selectables: readonly ReferenceSelectableObject[] = [
    ...bookcases.map((selectableRoot, index) => ({
      descriptor: {
        id: `bookshelf-${String(index + 1).padStart(2, "0")}`,
        label: `Estante técnica ${index + 1}`,
      },
      root: selectableRoot,
    })),
    ...tables.map((selectableRoot, index) => ({
      descriptor: {
        id: `table-${String(index + 1).padStart(2, "0")}`,
        label: `Mesa técnica ${index + 1}`,
      },
      root: selectableRoot,
    })),
    ...benches.map((selectableRoot, index) => ({
      descriptor: {
        id: `bench-${String(index + 1).padStart(2, "0")}`,
        label: `Banco técnico ${index + 1}`,
      },
      root: selectableRoot,
    })),
    ...crates.map((selectableRoot, index) => ({
      descriptor: {
        id: `crate-${String(index + 1).padStart(2, "0")}`,
        label: `Caixa técnica ${index + 1}`,
      },
      root: selectableRoot,
    })),
  ];

  const hemisphere = new HemisphereLight(0xf5efe2, 0x263c36, 2.15);
  hemisphere.name = "reference-hemisphere-light";
  root.add(hemisphere);

  const directional = new DirectionalLight(0xfff2d5, 2.7);
  directional.name = "reference-directional-light";
  directional.position.set(7, 11, 8);
  directional.castShadow = false;
  root.add(directional);

  let meshCount = 0;
  root.traverse((object) => {
    if (isDisposableMesh(object)) meshCount += 1;
  });

  return { meshCount, root, selectables };
}

function materialTextures(material: Material): readonly Texture[] {
  return Object.values(material).filter(
    (value): value is Texture => value instanceof Texture,
  );
}

export function disposeObjectTree(root: Object3D): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();

  root.traverse((object) => {
    if (!isDisposableMesh(object)) return;
    geometries.add(object.geometry);
    const meshMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const texture of materialTextures(material)) textures.add(texture);
    }
  });

  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
  root.removeFromParent();
  root.clear();
}
