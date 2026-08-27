import {
  floorCellKey,
  placementEdges,
  structureDefinition,
  unitEdgeKey,
  type GridPoint,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import type { ConstructionSceneState } from "../contracts";

import { CELL_SIZE } from "./spatialWorld";

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
): StructureHitArea | undefined {
  const definition = structureDefinition(placement.definitionId);
  if (!definition) return undefined;
  const span = (definition.visualSpanCells ?? 1) * CELL_SIZE;
  const x = (placement.anchor.x + definition.visualOffsetCells.x) * CELL_SIZE;
  const y = (placement.anchor.y + definition.visualOffsetCells.y) * CELL_SIZE;
  if (definition.category === "corner")
    return { height: span, width: span, x, y };
  if (definition.orientation === "vertical")
    return { height: span, width: CELL_SIZE, x, y };
  return { height: CELL_SIZE, width: span, x, y };
}

/** Deliberately geometric: no PNG alpha or display bounds take part in input. */
export function structureAtWorldPoint(
  structure: WorldStructureState | undefined,
  world: ScreenPoint,
): StructurePlacement | undefined {
  if (!structure) return undefined;
  return [...structure.placements].reverse().find((placement) => {
    const area = structureHitArea(placement);
    return (
      area !== undefined &&
      world.x >= area.x &&
      world.x <= area.x + area.width &&
      world.y >= area.y &&
      world.y <= area.y + area.height
    );
  });
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
  const occupiedEdges = new Set<string>();
  for (const placement of structure.placements) {
    if (placement.instanceId === movingInstanceId) continue;
    for (const edge of placementEdges(placement))
      occupiedEdges.add(unitEdgeKey(edge));
  }
  if (
    placementEdges(candidate).some((edge) =>
      occupiedEdges.has(unitEdgeKey(edge)),
    )
  )
    return false;

  const floorCells = new Set(structure.floorCells.map(floorCellKey));
  return placementEdges(candidate).some(
    (edge) =>
      (edge.axis === "horizontal" &&
        (floorCells.has(`${edge.x}:${edge.y}`) ||
          floorCells.has(`${edge.x}:${edge.y - 1}`))) ||
      (edge.axis === "vertical" &&
        (floorCells.has(`${edge.x}:${edge.y}`) ||
          floorCells.has(`${edge.x - 1}:${edge.y}`))),
  );
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
