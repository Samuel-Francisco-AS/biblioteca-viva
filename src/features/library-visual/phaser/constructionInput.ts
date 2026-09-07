import {
  floorCellKey,
  structureDefinition,
  structurePlacementIssue,
  type GridPoint,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import type { ConstructionSceneState } from "../contracts";

import { CELL_SIZE } from "./spatialWorld";
import {
  structureVisualAsset,
  structureVisualTransform,
} from "./structureVisualGeometry";
import { structureVisualTransformForState } from "./structureRenderPlan";

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export interface CameraCoordinates {
  readonly scrollX: number;
  readonly scrollY: number;
  readonly zoom?: number;
}

export interface StructureHitArea {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export function constructionHitAreas(state: ConstructionSceneState): {
  readonly objects: boolean;
  readonly structures: boolean;
} {
  return {
    objects: !state.active,
    structures: state.active && state.tool === "select",
  };
}

/** Converts a viewport point before any construction snap is applied. */
export function screenToWorld(
  screen: ScreenPoint,
  camera: CameraCoordinates,
): ScreenPoint {
  const zoom = camera.zoom ?? 1;
  return {
    x: screen.x / zoom + camera.scrollX,
    y: screen.y / zoom + camera.scrollY,
  };
}

/** Structural anchors use grid vertices, while floor gestures use cell origins. */
export function snapStructureAnchor(world: ScreenPoint): GridPoint {
  return {
    x: normalizeZero(Math.round(world.x / CELL_SIZE)),
    y: normalizeZero(Math.round(world.y / CELL_SIZE)),
  };
}

export function snapFloorCell(world: ScreenPoint): GridPoint {
  return {
    x: Math.floor(world.x / CELL_SIZE),
    y: Math.floor(world.y / CELL_SIZE),
  };
}

export function structureHitArea(
  placement: StructurePlacement,
  structure?: WorldStructureState,
): StructureHitArea | undefined {
  const regions = structureHitRegions(placement, structure);
  if (regions.length === 0) return undefined;
  if (regions.length === 1) return regions[0];
  const left = Math.min(...regions.map((area) => area.x));
  const top = Math.min(...regions.map((area) => area.y));
  const right = Math.max(...regions.map((area) => area.x + area.width));
  const bottom = Math.max(...regions.map((area) => area.y + area.height));
  return Object.freeze({
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  });
}

/** Exact occupied regions shared with the renderer's canonical transform. */
export function structureHitRegions(
  placement: StructurePlacement,
  structure?: WorldStructureState,
): readonly StructureHitArea[] {
  if (!structureVisualAsset(placement.definitionId)) return Object.freeze([]);
  const transform = structure
    ? structureVisualTransformForState(structure, placement)
    : structureVisualTransform(placement);
  return Object.freeze(
    transform.interactionRegions.map(({ bounds }) =>
      Object.freeze({ ...bounds }),
    ),
  );
}

export function structureContainsWorldPoint(
  placement: StructurePlacement,
  world: ScreenPoint,
  structure?: WorldStructureState,
): boolean {
  return structureHitRegions(placement, structure).some(
    (area) =>
      world.x >= area.x &&
      world.x < area.x + area.width &&
      world.y >= area.y &&
      world.y < area.y + area.height,
  );
}

/** Selection is evaluated once per placement, even when regions overlap. */
export function structureAtWorldPoint(
  structure: WorldStructureState | undefined,
  world: ScreenPoint,
): StructurePlacement | undefined {
  if (!structure) return undefined;
  return [...structure.placements]
    .reverse()
    .find((placement) =>
      structureContainsWorldPoint(placement, world, structure),
    );
}

/**
 * Fast advisory feedback only. The application still evaluates all structural
 * constraints and is the sole authority for persistence.
 */
export function isStructurePreviewValid(
  structure: WorldStructureState | undefined,
  definitionId: StructureDefinitionId,
  anchor: GridPoint,
  movingInstanceId?: string,
): boolean {
  if (!structure || !structureDefinition(definitionId)) return false;
  const candidate: StructurePlacement = {
    anchor,
    definitionId,
    instanceId: "construction.preview",
  };
  return structurePlacementIssue(structure, candidate, movingInstanceId) === undefined;
}

/** Preserves first encounter order and never emits a duplicate cell. */
export class FloorGestureBatch {
  private readonly cells = new Map<string, GridPoint>();

  add(cell: GridPoint): boolean {
    const key = floorCellKey(cell);
    if (this.cells.has(key)) return false;
    this.cells.set(key, cell);
    return true;
  }

  clear(): void {
    this.cells.clear();
  }

  values(): readonly GridPoint[] {
    return [...this.cells.values()];
  }
}

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}
