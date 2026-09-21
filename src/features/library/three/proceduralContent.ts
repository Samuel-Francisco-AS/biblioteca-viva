import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

/** A stable semantic model type; it is not an asset filename or GLB asset ID. */
export type ProceduralModelTypeId = "bookshelf";
export type ProceduralBookshelfVariant =
  "reading-balanced" | "reading-dark-tall" | "reading-light-wide";

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
  readonly variant: ProceduralBookshelfVariant;
}

interface BookshelfVariantSpec {
  readonly baseHeight: number;
  readonly depth: number;
  readonly frameColor: number;
  readonly height: number;
  readonly shelfColor: number;
  readonly shelfCount: number;
  readonly topTrimHeight: number;
  readonly topTrimOverhang: number;
  readonly width: number;
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

const BOOKSHELF_VARIANTS: Readonly<
  Record<ProceduralBookshelfVariant, BookshelfVariantSpec>
> = Object.freeze({
  "reading-balanced": Object.freeze({
    baseHeight: 0.14,
    depth: 0.62,
    frameColor: 0x805b3c,
    height: 3.1,
    shelfColor: 0xb8875f,
    shelfCount: 5,
    topTrimHeight: 0.12,
    topTrimOverhang: 0.04,
    width: 2.1,
  }),
  "reading-dark-tall": Object.freeze({
    baseHeight: 0.18,
    depth: 0.6,
    frameColor: 0x4d3527,
    height: 3.38,
    shelfColor: 0x79513a,
    shelfCount: 6,
    topTrimHeight: 0.16,
    topTrimOverhang: 0.1,
    width: 1.86,
  }),
  "reading-light-wide": Object.freeze({
    baseHeight: 0.12,
    depth: 0.66,
    frameColor: 0x9a6d49,
    height: 2.86,
    shelfColor: 0xd0a06f,
    shelfCount: 4,
    topTrimHeight: 0.12,
    topTrimOverhang: 0.08,
    width: 2.34,
  }),
});

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
  variant: ProceduralBookshelfVariant = "reading-balanced",
): ProceduralBookshelf {
  const root = new Group();
  root.name = "procedural-bookshelf";

  const spec = BOOKSHELF_VARIANTS[variant];
  const commonMaterial = { metalness: 0, roughness: 0.82 } as const;
  const frameMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: spec.frameColor,
  });
  const shelfMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: spec.shelfColor,
  });
  const frameThickness = 0.18;
  const shelfThickness = 0.14;
  const backDepth = 0.12;
  const shelfDepth = spec.depth - 0.2;
  const bodyHeight = spec.height - spec.baseHeight - spec.topTrimHeight;
  const interiorWidth = spec.width - frameThickness * 2 - 0.06;
  const backGeometry = new BoxGeometry(interiorWidth, bodyHeight, backDepth);
  const sideGeometry = new BoxGeometry(frameThickness, bodyHeight, spec.depth);
  const shelfGeometry = new BoxGeometry(
    interiorWidth,
    shelfThickness,
    shelfDepth,
  );

  addBox(root, {
    geometry: new BoxGeometry(spec.width, spec.baseHeight, spec.depth),
    material: frameMaterial,
    name: "bookshelf-base",
    position: [0, spec.baseHeight / 2, 0],
  });
  addBox(root, {
    geometry: backGeometry,
    material: frameMaterial,
    name: "bookshelf-back",
    position: [
      0,
      spec.baseHeight + bodyHeight / 2,
      -spec.depth / 2 + backDepth / 2,
    ],
  });
  for (const x of [
    -spec.width / 2 + frameThickness / 2,
    spec.width / 2 - frameThickness / 2,
  ]) {
    addBox(root, {
      geometry: sideGeometry,
      material: frameMaterial,
      name: "bookshelf-side",
      position: [x, spec.baseHeight + bodyHeight / 2, 0],
    });
  }
  for (let index = 0; index < spec.shelfCount; index += 1) {
    const y =
      spec.baseHeight +
      shelfThickness / 2 +
      (index * (bodyHeight - shelfThickness)) / (spec.shelfCount - 1);
    addBox(root, {
      geometry: shelfGeometry,
      material: shelfMaterial,
      name: "bookshelf-shelf",
      position: [0, y, spec.depth / 2 - shelfDepth / 2],
    });
  }
  addBox(root, {
    geometry: new BoxGeometry(
      spec.width + spec.topTrimOverhang * 2,
      spec.topTrimHeight,
      spec.depth,
    ),
    material: frameMaterial,
    name: "bookshelf-top-trim",
    position: [0, spec.height - spec.topTrimHeight / 2, 0],
  });

  return { identity, root, variant };
}
