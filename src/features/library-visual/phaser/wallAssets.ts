import {
  STRUCTURE_VISUAL_ASSETS,
  type StructureVisualAssetMetadata,
  type StructureVisualDepthLayer,
  type StructureVisualRole,
} from "./structureVisualGeometry";

export type WallAssetRole = StructureVisualRole;

export type WallCorner = "ne" | "nw" | "se" | "sw";
export type WallOrientation = "horizontal" | "vertical";
export type WallDepthPolicy = StructureVisualDepthLayer;

export interface WallAssetDefinition {
  readonly corner?: WallCorner;
  readonly depthPolicy: WallDepthPolicy;
  readonly fallback: "procedural-wall" | "procedural-door";
  readonly id: string;
  readonly logicalLengthCells: number;
  /** Anchor is the top-left of the canvas; offsets preserve source padding. */
  readonly offset: { readonly xCells: number; readonly yCells: number };
  readonly orientation: WallOrientation;
  /** Whole family is rendered at 32 world units for every 300 source pixels. */
  readonly pixelsPerLogicalCell: number;
  readonly pivot: { readonly x: number; readonly y: number };
  readonly role: WallAssetRole;
  readonly runtimePath: string;
}

/**
 * Compatibility projection retained for historical composition and fallback
 * APIs. Active structure rendering and input use STRUCTURE_VISUAL_ASSETS and
 * never these legacy offsets or pivots.
 */
export const WALL_ASSETS: readonly WallAssetDefinition[] = Object.freeze(
  STRUCTURE_VISUAL_ASSETS.map((metadata) => legacyWallAsset(metadata)),
);

export function wallAsset(id: string): WallAssetDefinition | undefined {
  return WALL_ASSETS.find((asset) => asset.id === id);
}

export function validateWallAssetCatalog(
  assets: readonly WallAssetDefinition[] = WALL_ASSETS,
): true {
  const ids = new Set<string>();
  for (const asset of assets) {
    if (ids.has(asset.id))
      throw new Error(`ID de parede duplicado: ${asset.id}`);
    ids.add(asset.id);
    if (!asset.runtimePath.startsWith("/assets/world/architecture/walls/"))
      throw new Error(`Caminho de parede inválido: ${asset.id}`);
    if (
      !Number.isInteger(asset.logicalLengthCells) ||
      asset.logicalLengthCells < 1
    )
      throw new Error(`Extensão lógica inválida: ${asset.id}`);
    if (
      asset.role === "segment-horizontal" &&
      asset.orientation !== "horizontal"
    )
      throw new Error(`Segmento horizontal inválido: ${asset.id}`);
    if (asset.role === "segment-vertical" && asset.orientation !== "vertical")
      throw new Error(`Segmento vertical inválido: ${asset.id}`);
    if (asset.role === "door-horizontal" && asset.orientation !== "horizontal")
      throw new Error(`Porta não horizontal: ${asset.id}`);
  }
  return true;
}

function legacyWallAsset(
  metadata: StructureVisualAssetMetadata,
): WallAssetDefinition {
  return Object.freeze({
    ...(metadata.corner ? { corner: metadata.corner } : {}),
    depthPolicy: metadata.depth.layer,
    fallback:
      metadata.role === "door-horizontal"
        ? "procedural-door"
        : "procedural-wall",
    id: metadata.definitionId,
    logicalLengthCells: metadata.logicalSpanCells,
    offset: legacyOffset(metadata),
    orientation:
      metadata.role === "segment-vertical" ? "vertical" : "horizontal",
    pixelsPerLogicalCell: metadata.sourcePixelsPerCell,
    pivot: Object.freeze({ x: 0, y: 0 }),
    role: metadata.role,
    runtimePath: metadata.runtimePath,
  });
}

function legacyOffset(metadata: StructureVisualAssetMetadata): {
  readonly xCells: number;
  readonly yCells: number;
} {
  if (metadata.role === "door-horizontal")
    return Object.freeze({ xCells: -1, yCells: 0 });
  if (metadata.corner === "ne")
    return Object.freeze({ xCells: -4, yCells: -4 });
  if (metadata.corner === "nw") return Object.freeze({ xCells: 0, yCells: -4 });
  if (metadata.corner === "se") return Object.freeze({ xCells: -4, yCells: 0 });
  return Object.freeze({ xCells: 0, yCells: 0 });
}
