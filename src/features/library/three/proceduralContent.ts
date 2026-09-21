import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

/** A stable semantic model type; it is not an asset filename or GLB asset ID. */
export type ProceduralModelTypeId = "bookshelf" | "book-volume";
export type ProceduralBookshelfVariant =
  "reading-balanced" | "reading-dark-tall" | "reading-light-wide";
export type ProceduralBookVolumeVariant =
  "book-amber" | "book-blue" | "book-green" | "book-red";

/**
 * Logical identity for a procedural world occurrence.
 *
 * `entryId` is optional because not every visual occurrence represents a
 * conventional record: furniture such as `bookshelf` has no required
 * association. Specific representations such as `book-volume` may require
 * it through narrower contracts. None of these values are derived from the
 * Three root, a mesh name, a URL, or a spatial position.
 */
export interface ProceduralContentIdentity {
  readonly entryId?: string;
  readonly instanceId: string;
  readonly modelTypeId: ProceduralModelTypeId;
}

/** Identity required by the procedural representation of a conventional book. */
export interface ProceduralBookVolumeIdentity extends ProceduralContentIdentity {
  readonly entryId: string;
  readonly modelTypeId: "book-volume";
}

/** Identity valid exclusively for a procedural bookshelf representation. */
export interface ProceduralBookshelfIdentity extends ProceduralContentIdentity {
  readonly modelTypeId: "bookshelf";
}

export interface ProceduralBookshelf {
  readonly identity: ProceduralBookshelfIdentity;
  readonly root: Group;
  readonly variant: ProceduralBookshelfVariant;
}

export interface ProceduralBookVolume {
  readonly identity: ProceduralBookVolumeIdentity;
  readonly root: Group;
  readonly variant: ProceduralBookVolumeVariant;
}

export interface ProceduralBookVolumeDimensions {
  readonly depth: number;
  readonly height: number;
  readonly width: number;
}

export interface ProceduralBookshelfShelf {
  readonly bottomY: number;
  readonly topY: number;
}

/** Physical measurements exposed for deterministic local shelf layout. */
export interface ProceduralBookshelfLayout {
  readonly backFrontZ: number;
  readonly interiorWidth: number;
  readonly shelfFrontZ: number;
  readonly shelves: readonly ProceduralBookshelfShelf[];
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

interface BookVolumeVariantSpec extends ProceduralBookVolumeDimensions {
  readonly coverColor: number;
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

const BOOK_VOLUME_VARIANTS: Readonly<
  Record<ProceduralBookVolumeVariant, BookVolumeVariantSpec>
> = Object.freeze({
  "book-amber": Object.freeze({
    coverColor: 0xb86e35,
    depth: 0.22,
    height: 0.31,
    width: 0.13,
  }),
  "book-blue": Object.freeze({
    coverColor: 0x426e96,
    depth: 0.24,
    height: 0.34,
    width: 0.16,
  }),
  "book-green": Object.freeze({
    coverColor: 0x527b59,
    depth: 0.2,
    height: 0.29,
    width: 0.12,
  }),
  "book-red": Object.freeze({
    coverColor: 0x9a4a42,
    depth: 0.23,
    height: 0.33,
    width: 0.15,
  }),
});

const BOOK_VOLUME_VARIANT_IDS = Object.freeze(
  Object.keys(BOOK_VOLUME_VARIANTS) as ProceduralBookVolumeVariant[],
);

/** Largest dimensions a reading-area slot must accommodate. */
export const PROCEDURAL_BOOK_VOLUME_MAX_DIMENSIONS: Readonly<ProceduralBookVolumeDimensions> =
  Object.freeze({
    depth: Math.max(
      ...Object.values(BOOK_VOLUME_VARIANTS).map(({ depth }) => depth),
    ),
    height: Math.max(
      ...Object.values(BOOK_VOLUME_VARIANTS).map(({ height }) => height),
    ),
    width: Math.max(
      ...Object.values(BOOK_VOLUME_VARIANTS).map(({ width }) => width),
    ),
  });

/** Returns whether an external replacement request names a supported variant. */
export function isProceduralBookshelfVariant(
  value: string,
): value is ProceduralBookshelfVariant {
  return Object.hasOwn(BOOKSHELF_VARIANTS, value);
}

/** Returns the exact internal measures used by the current bookshelf factory. */
export function getProceduralBookshelfLayout(
  variant: ProceduralBookshelfVariant,
): ProceduralBookshelfLayout {
  const spec = BOOKSHELF_VARIANTS[variant];
  const frameThickness = 0.18;
  const shelfThickness = 0.14;
  const backDepth = 0.12;
  const bodyHeight = spec.height - spec.baseHeight - spec.topTrimHeight;
  const interiorWidth = spec.width - frameThickness * 2 - 0.06;
  const shelfSpacing = (bodyHeight - shelfThickness) / (spec.shelfCount - 1);
  const shelves = Array.from({ length: spec.shelfCount }, (_, index) => {
    const centerY = spec.baseHeight + shelfThickness / 2 + index * shelfSpacing;
    return Object.freeze({
      bottomY: centerY - shelfThickness / 2,
      topY: centerY + shelfThickness / 2,
    });
  });

  return Object.freeze({
    backFrontZ: -spec.depth / 2 + backDepth,
    interiorWidth,
    shelfFrontZ: spec.depth / 2,
    shelves: Object.freeze(shelves),
  });
}

/** Returns the deterministic visual variant associated with a stable identity. */
export function getProceduralBookVolumeVariant(
  identity: Pick<ProceduralBookVolumeIdentity, "entryId" | "instanceId">,
): ProceduralBookVolumeVariant {
  let hash = 0;
  const stableValue = `${identity.instanceId}:${identity.entryId}`;
  for (let index = 0; index < stableValue.length; index += 1) {
    hash = (hash * 31 + stableValue.charCodeAt(index)) >>> 0;
  }
  return BOOK_VOLUME_VARIANT_IDS[hash % BOOK_VOLUME_VARIANT_IDS.length];
}

/** Returns immutable physical dimensions for a supported book-volume variant. */
export function getProceduralBookVolumeDimensions(
  variant: ProceduralBookVolumeVariant,
): Readonly<ProceduralBookVolumeDimensions> {
  const { depth, height, width } = BOOK_VOLUME_VARIANTS[variant];
  return Object.freeze({ depth, height, width });
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
  identity: ProceduralBookshelfIdentity,
  variant: string = "reading-balanced",
): ProceduralBookshelf {
  if (!isProceduralBookshelfVariant(variant)) {
    throw new Error(`Variante procedural de estante desconhecida: ${variant}.`);
  }
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

/**
 * Creates an unattached, locally grounded upright book representation.
 *
 * The caller that attaches `root` owns its lifecycle and releases it through
 * `disposeObjectTree()`. All resources belong to this call; no cache or
 * inter-book resource sharing is used.
 */
export function createProceduralBookVolume(
  identity: ProceduralBookVolumeIdentity,
): ProceduralBookVolume {
  if (identity.modelTypeId !== "book-volume") {
    throw new Error("O volume procedural exige modelTypeId: book-volume.");
  }
  if (identity.instanceId.trim().length === 0) {
    throw new Error("O volume procedural exige instanceId não vazio.");
  }
  if (
    typeof identity.entryId !== "string" ||
    identity.entryId.trim().length === 0
  ) {
    throw new Error("O volume procedural exige entryId não vazio.");
  }

  const variant = getProceduralBookVolumeVariant(identity);
  const spec = BOOK_VOLUME_VARIANTS[variant];
  const root = new Group();
  root.name = "procedural-book-volume";
  const commonMaterial = { metalness: 0, roughness: 0.78 } as const;
  const coverMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: spec.coverColor,
  });
  const pagesMaterial = new MeshStandardMaterial({
    ...commonMaterial,
    color: 0xd8c9a7,
  });
  const coverThickness = 0.018;
  const pageReveal = 0.012;
  const pageDepth = spec.depth - coverThickness * 2 - pageReveal * 2;
  const coverGeometry = new BoxGeometry(
    spec.width,
    spec.height,
    coverThickness,
  );

  addBox(root, {
    geometry: new BoxGeometry(
      spec.width - pageReveal * 2,
      spec.height - pageReveal * 2,
      pageDepth,
    ),
    material: pagesMaterial,
    name: "book-page-block",
    position: [0, spec.height / 2, 0],
  });
  for (const z of [
    -spec.depth / 2 + coverThickness / 2,
    spec.depth / 2 - coverThickness / 2,
  ]) {
    addBox(root, {
      geometry: coverGeometry,
      material: coverMaterial,
      name: "book-cover",
      position: [0, spec.height / 2, z],
    });
  }

  return { identity, root, variant };
}
