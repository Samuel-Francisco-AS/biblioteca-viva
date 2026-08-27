import {
  INITIAL_WORLD_STRUCTURE,
  structureDefinition,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import { CELL_SIZE } from "./spatialWorld";
import { wallAsset, type WallAssetDefinition } from "./wallAssets";

export interface StructureRenderPiece {
  readonly asset: WallAssetDefinition;
  readonly anchor: { readonly x: number; readonly y: number };
  readonly heightCells: number;
  readonly key: string;
  readonly kind: "corner" | "door" | "wall";
  readonly widthCells: number;
}

/**
 * Pure projection of already validated placements. It does not infer a wall
 * from floor boundaries, and therefore never puts a segment under a corner.
 */
export function structureRenderPlan(
  structure: WorldStructureState = INITIAL_WORLD_STRUCTURE,
): readonly StructureRenderPiece[] {
  return Object.freeze(
    structure.placements
      .map((placement) => renderPiece(placement))
      .sort((a, b) => a.key.localeCompare(b.key)),
  );
}

export function structurePieceDepth(piece: StructureRenderPiece): number {
  return (
    (piece.asset.depthPolicy === "architecture-front" ? 50 : 10) +
    piece.anchor.y
  );
}

function renderPiece(placement: StructurePlacement): StructureRenderPiece {
  const definition = structureDefinition(placement.definitionId);
  const asset = definition?.assetId ? wallAsset(definition.assetId) : undefined;
  if (!definition || !asset)
    throw new Error(`Peça estrutural sem asset: ${placement.definitionId}`);
  const span = definition.visualSpanCells ?? 1;
  return Object.freeze({
    anchor: {
      x: placement.anchor.x * CELL_SIZE,
      y: placement.anchor.y * CELL_SIZE,
    },
    asset,
    heightCells: asset.orientation === "vertical" ? span : 1,
    key: placement.instanceId,
    kind:
      definition.category === "door"
        ? "door"
        : definition.category === "corner"
          ? "corner"
          : "wall",
    widthCells: asset.orientation === "horizontal" ? span : 1,
  });
}
