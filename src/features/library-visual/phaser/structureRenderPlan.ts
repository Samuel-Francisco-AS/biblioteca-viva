import {
  INITIAL_WORLD_STRUCTURE,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import {
  structureVisualAsset,
  structureVisualTransform,
  type StructureVisualAssetMetadata,
  type StructureVisualTransform,
  type WorldRectangle,
} from "./structureVisualGeometry";
import { resolveStructureInteriorNormals } from "./structureVisualTopology";
import {
  compareStructureVisualDepth,
  structureVisualDepth,
  type StructureVisualDepth,
} from "./structureVisualDepth";

export interface StructureRenderPiece {
  readonly depth: StructureVisualDepth;
  readonly heightCells: number;
  readonly key: string;
  readonly kind: "corner" | "door" | "wall";
  readonly metadata: StructureVisualAssetMetadata;
  readonly transform: StructureVisualTransform;
  readonly widthCells: number;
}

export interface StructureSpriteProjection {
  readonly alphaBounds: WorldRectangle;
  readonly canvasBounds: WorldRectangle;
  readonly instanceId: string;
  readonly origin: { readonly x: 0; readonly y: 0 };
  readonly scale: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly textureKey: string;
  readonly x: number;
  readonly y: number;
}

/**
 * Pure projection of already validated placements. Floor adjacency only
 * resolves each existing arm's interior side; it never manufactures a piece.
 */
export function structureRenderPlan(
  structure: WorldStructureState = INITIAL_WORLD_STRUCTURE,
): readonly StructureRenderPiece[] {
  return Object.freeze(
    structure.placements
      .map((placement) => renderPiece(structure, placement))
      .sort((a, b) => compareStructureVisualDepth(a.depth, b.depth)),
  );
}

export function structurePieceDepth(piece: StructureRenderPiece): number {
  return piece.depth.value;
}

/** Renderer adapter only; all geometry remains owned by the canonical transform. */
export function structureSpriteProjection(
  piece: StructureRenderPiece,
): StructureSpriteProjection {
  const { transform } = piece;
  return Object.freeze({
    alphaBounds: transform.alphaBounds,
    canvasBounds: transform.canvasBounds,
    instanceId: transform.placementKey,
    origin: Object.freeze({ x: 0, y: 0 }),
    scale: transform.scale,
    scaleX: transform.spriteRendering.scale.x,
    scaleY: transform.spriteRendering.scale.y,
    textureKey: transform.textureKey,
    x: transform.spriteRendering.position.x,
    y: transform.spriteRendering.position.y,
  });
}

/** Derives topology explicitly before invoking the pure canonical transform. */
export function structureVisualTransformForState(
  structure: WorldStructureState,
  placement: StructurePlacement,
): StructureVisualTransform {
  return structureVisualTransform(
    placement,
    resolveStructureInteriorNormals(structure, placement),
  );
}

function renderPiece(
  structure: WorldStructureState,
  placement: StructurePlacement,
): StructureRenderPiece {
  const metadata = structureVisualAsset(placement.definitionId);
  if (!metadata)
    throw new Error(`Peça estrutural sem asset: ${placement.definitionId}`);
  const transform = structureVisualTransformForState(structure, placement);
  const depth = structureVisualDepth(transform);
  const span = metadata.logicalSpanCells;
  const vertical = metadata.orientation === "vertical";
  return Object.freeze({
    depth,
    heightCells: vertical ? span : 1,
    key: placement.instanceId,
    kind:
      metadata.role === "door-horizontal"
        ? "door"
        : metadata.role === "corner"
          ? "corner"
          : "wall",
    metadata,
    transform,
    widthCells: vertical ? 1 : span,
  });
}
