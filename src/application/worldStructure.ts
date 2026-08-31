import { z } from "zod";
import {
  STRUCTURAL_INVENTORY_FAMILY_ID,
  isStructuralInventoryFamilyId,
  type ReachedMilestone,
  type StructuralInventoryFamilyId,
} from "../domain";

/** Shared world grid contract; renderers consume it but do not define it. */
export const WORLD_CELL_SIZE = 32;

export const WORLD_STRUCTURE_ID = "world.main" as const;
export const INITIAL_WORLD_BLUEPRINT_VERSION = 1 as const;

export type EdgeAxis = "horizontal" | "vertical";
export type CornerOrientation = "ne" | "nw" | "se" | "sw";
export type StructureDefinitionId =
  | "architecture.floor.wood-01"
  | "architecture.wall.stone-01.corner-ne"
  | "architecture.wall.stone-01.corner-nw"
  | "architecture.wall.stone-01.corner-se"
  | "architecture.wall.stone-01.corner-sw"
  | "architecture.wall.stone-01.horizontal-1"
  | "architecture.wall.stone-01.horizontal-2"
  | "architecture.wall.stone-01.horizontal-4"
  | "architecture.wall.stone-01.vertical-1"
  | "architecture.wall.stone-01.vertical-2"
  | "architecture.wall.stone-01.vertical-4"
  | "architecture.wall.stone-01.door-horizontal.open"
  | "architecture.wall.stone-01.door-horizontal.closed";

export interface GridPoint {
  readonly x: number;
  readonly y: number;
}

/** A floor square whose north-west vertex is (x, y). */
export type FloorCell = GridPoint;

/** A unit segment starts at (x, y) and extends one grid unit in its axis. */
export interface UnitEdge extends GridPoint {
  readonly axis: EdgeAxis;
}

export interface StructurePlacement {
  readonly anchor: GridPoint;
  readonly definitionId: StructureDefinitionId;
  readonly instanceId: string;
}

export interface WorldStructureState {
  readonly blueprintVersion: number;
  readonly createdAt: string;
  readonly floorCells: readonly FloorCell[];
  readonly id: typeof WORLD_STRUCTURE_ID;
  readonly placements: readonly StructurePlacement[];
  readonly revision: number;
  readonly updatedAt: string;
}

export type StructuralCategory = "corner" | "door" | "floor" | "wall";

export interface StructureDefinition {
  readonly assetId?: string;
  readonly category: StructuralCategory;
  readonly corner?: CornerOrientation;
  readonly fallback: "procedural-door" | "procedural-floor" | "procedural-wall";
  readonly id: StructureDefinitionId;
  readonly inventoryFamilyId: StructuralInventoryFamilyId;
  readonly logicalSpanCells?: number;
  readonly movable: boolean;
  readonly orientation?: EdgeAxis;
  readonly pivot: { readonly x: number; readonly y: number };
  readonly rotatable: boolean;
  readonly visualOffsetCells: { readonly x: number; readonly y: number };
  readonly visualSpanCells?: number;
}

const wall = (
  id: Extract<StructureDefinitionId, `architecture.wall.stone-01.${string}`>,
  orientation: EdgeAxis,
  spanCells: number,
): StructureDefinition => ({
  assetId: id,
  category: "wall",
  fallback: "procedural-wall",
  id,
  inventoryFamilyId:
    spanCells === 1
      ? STRUCTURAL_INVENTORY_FAMILY_ID.wallShort
      : spanCells === 2
        ? STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium
        : STRUCTURAL_INVENTORY_FAMILY_ID.wallLong,
  logicalSpanCells: spanCells,
  movable: true,
  orientation,
  pivot: { x: 0, y: 0 },
  rotatable: true,
  visualOffsetCells: { x: 0, y: 0 },
  visualSpanCells: spanCells,
});

export const STRUCTURE_CATALOG: readonly StructureDefinition[] = Object.freeze([
  {
    assetId: "architecture.floor.wood-01",
    category: "floor",
    fallback: "procedural-floor",
    id: "architecture.floor.wood-01",
    inventoryFamilyId: STRUCTURAL_INVENTORY_FAMILY_ID.floorWood,
    movable: true,
    pivot: { x: 0, y: 0 },
    rotatable: true,
    visualOffsetCells: { x: 0, y: 0 },
  },
  ...(["ne", "nw", "se", "sw"] as const).map((corner) => ({
    assetId: `architecture.wall.stone-01.corner-${corner}`,
    category: "corner" as const,
    corner,
    fallback: "procedural-wall" as const,
    id: `architecture.wall.stone-01.corner-${corner}` as StructureDefinitionId,
    inventoryFamilyId: STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone,
    logicalSpanCells: 4,
    movable: true,
    pivot: { x: 0, y: 0 },
    rotatable: false,
    visualOffsetCells:
      corner === "ne"
        ? { x: -4, y: -4 }
        : corner === "nw"
          ? { x: 0, y: -4 }
          : corner === "se"
            ? { x: -4, y: 0 }
            : { x: 0, y: 0 },
    visualSpanCells: 4,
  })),
  wall("architecture.wall.stone-01.horizontal-1", "horizontal", 1),
  wall("architecture.wall.stone-01.horizontal-2", "horizontal", 2),
  wall("architecture.wall.stone-01.horizontal-4", "horizontal", 4),
  wall("architecture.wall.stone-01.vertical-1", "vertical", 1),
  wall("architecture.wall.stone-01.vertical-2", "vertical", 2),
  wall("architecture.wall.stone-01.vertical-4", "vertical", 4),
  ...(["closed", "open"] as const).map((state) => ({
    assetId: `architecture.wall.stone-01.door-horizontal.${state}`,
    category: "door" as const,
    fallback: "procedural-door" as const,
    id: `architecture.wall.stone-01.door-horizontal.${state}` as StructureDefinitionId,
    inventoryFamilyId: STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal,
    logicalSpanCells: 4,
    movable: true,
    orientation: "horizontal" as const,
    pivot: { x: 0, y: 0 },
    rotatable: false,
    visualOffsetCells: { x: -1, y: 0 },
    visualSpanCells: 4,
  })),
]);

const ROTATED_STRUCTURE_DEFINITION: Readonly<
  Partial<Record<StructureDefinitionId, StructureDefinitionId>>
> = Object.freeze({
  "architecture.wall.stone-01.horizontal-1":
    "architecture.wall.stone-01.vertical-1",
  "architecture.wall.stone-01.vertical-1":
    "architecture.wall.stone-01.horizontal-1",
  "architecture.wall.stone-01.horizontal-2":
    "architecture.wall.stone-01.vertical-2",
  "architecture.wall.stone-01.vertical-2":
    "architecture.wall.stone-01.horizontal-2",
  "architecture.wall.stone-01.horizontal-4":
    "architecture.wall.stone-01.vertical-4",
  "architecture.wall.stone-01.vertical-4":
    "architecture.wall.stone-01.horizontal-4",
  "architecture.wall.stone-01.corner-ne":
    "architecture.wall.stone-01.corner-se",
  "architecture.wall.stone-01.corner-se":
    "architecture.wall.stone-01.corner-sw",
  "architecture.wall.stone-01.corner-sw":
    "architecture.wall.stone-01.corner-nw",
  "architecture.wall.stone-01.corner-nw":
    "architecture.wall.stone-01.corner-ne",
});

export function structureDefinition(
  id: string,
): StructureDefinition | undefined {
  return STRUCTURE_CATALOG.find((definition) => definition.id === id);
}

export function structuralInventoryFamilyForDefinition(
  id: StructureDefinitionId,
): StructuralInventoryFamilyId {
  const definition = structureDefinition(id);
  if (!definition) throw new Error(`Definição estrutural ausente: ${id}`);
  return definition.inventoryFamilyId;
}

export function rotatedStructureDefinitionId(
  id: StructureDefinitionId,
): StructureDefinitionId | undefined {
  return ROTATED_STRUCTURE_DEFINITION[id];
}

export function floorCellKey(cell: FloorCell): string {
  return `${cell.x}:${cell.y}`;
}

export function unitEdgeKey(edge: UnitEdge): string {
  return `${edge.axis}:${edge.x}:${edge.y}`;
}

export interface LogicalSegment {
  readonly axis: EdgeAxis;
  readonly end: GridPoint;
  readonly spanCells: number;
  readonly start: GridPoint;
}

export type LogicalStructureIntervalPart =
  "corner-horizontal-arm" | "corner-vertical-arm" | "main";

export interface LogicalStructureInterval extends LogicalSegment {
  readonly category: Exclude<StructuralCategory, "floor">;
  readonly definitionId: StructureDefinitionId;
  readonly instanceId: string;
  readonly part: LogicalStructureIntervalPart;
}

export interface LogicalLinearPlacementGeometry {
  readonly interval: LogicalStructureInterval;
  readonly kind: "door" | "wall";
}

export interface LogicalCornerPlacementGeometry {
  readonly horizontalArm: LogicalStructureInterval;
  readonly kind: "corner";
  readonly orientation: CornerOrientation;
  readonly vertex: GridPoint;
  readonly verticalArm: LogicalStructureInterval;
}

export type LogicalPlacementGeometry =
  LogicalCornerPlacementGeometry | LogicalLinearPlacementGeometry;

/** Creates an interval in logical cells; bitmap dimensions never participate. */
export function createLogicalSegment(
  axis: EdgeAxis,
  start: GridPoint,
  spanCells: number,
): LogicalSegment {
  if (axis !== "horizontal" && axis !== "vertical")
    throw new Error(`Eixo lógico inválido: ${String(axis)}`);
  assertIntegerPoint(start, "Início do segmento");
  if (!Number.isSafeInteger(spanCells) || spanCells <= 0)
    throw new Error(
      "Span lógico deve ser um inteiro positivo seguro em células",
    );
  const end = Object.freeze({
    x: start.x + (axis === "horizontal" ? spanCells : 0),
    y: start.y + (axis === "vertical" ? spanCells : 0),
  });
  assertIntegerPoint(end, "Fim do segmento");
  return Object.freeze({
    axis,
    end,
    spanCells,
    start: Object.freeze({ ...start }),
  });
}

export function logicalSegmentKey(segment: LogicalSegment): string {
  return `${segment.axis}:${segment.start.x}:${segment.start.y}:${segment.end.x}:${segment.end.y}`;
}

/** Derives the cells/edges/vertices occupied by one persisted placement. */
export function placementGeometry(
  placement: StructurePlacement,
): LogicalPlacementGeometry {
  assertIntegerPoint(placement.anchor, "Âncora estrutural");
  const definition = requiredDefinition(placement.definitionId);
  if (definition.category === "floor")
    throw new Error(
      "Piso ocupa floorCells e não pode ser um placement estrutural",
    );
  const spanCells = requiredLogicalSpan(definition);
  const { x, y } = placement.anchor;
  if (definition.category === "wall" || definition.category === "door") {
    if (!definition.orientation)
      throw new Error(`Eixo lógico ausente: ${definition.id}`);
    return Object.freeze({
      interval: logicalStructureInterval(
        placement,
        definition.category,
        "main",
        createLogicalSegment(definition.orientation, { x, y }, spanCells),
      ),
      kind: definition.category,
    });
  }
  if (!definition.corner)
    throw new Error(`Orientação lógica de canto ausente: ${definition.id}`);
  const extendsWest = definition.corner === "ne" || definition.corner === "se";
  const extendsNorth = definition.corner === "ne" || definition.corner === "nw";
  const vertex = Object.freeze({ x, y });
  return Object.freeze({
    horizontalArm: logicalStructureInterval(
      placement,
      "corner",
      "corner-horizontal-arm",
      createLogicalSegment(
        "horizontal",
        { x: extendsWest ? x - spanCells : x, y },
        spanCells,
      ),
    ),
    kind: "corner",
    orientation: definition.corner,
    vertex,
    verticalArm: logicalStructureInterval(
      placement,
      "corner",
      "corner-vertical-arm",
      createLogicalSegment(
        "vertical",
        { x, y: extendsNorth ? y - spanCells : y },
        spanCells,
      ),
    ),
  });
}

/** Returns a stable interval order regardless of persisted placement order. */
export function logicalStructureIntervals(
  placements: readonly StructurePlacement[],
): readonly LogicalStructureInterval[] {
  const intervals = placements.flatMap((placement) =>
    geometryIntervals(placementGeometry(placement)),
  );
  intervals.sort(compareLogicalStructureIntervals);
  return Object.freeze(intervals);
}

/**
 * Validates one collinear run. Every neighbour must share exactly one endpoint;
 * gaps, overlaps and duplicate intervals are reported rather than repaired.
 */
export function validateCollinearSegments(
  segments: readonly LogicalSegment[],
): true {
  if (segments.length < 2)
    throw new Error("Conexão colinear requer pelo menos dois segmentos");
  for (const segment of segments) validateLogicalSegment(segment);
  const ordered = [...segments].sort(compareLogicalSegments);
  const axis = ordered[0].axis;
  const line = fixedCoordinate(ordered[0]);
  for (const segment of ordered) {
    if (segment.axis !== axis)
      throw new Error("Segmentos incompatíveis devem usar o mesmo eixo");
    if (fixedCoordinate(segment) !== line)
      throw new Error("Segmentos do mesmo eixo não são colineares");
  }
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    const previousEnd = endCoordinate(previous);
    const currentStart = startCoordinate(current);
    if (logicalSegmentKey(previous) === logicalSegmentKey(current))
      throw new Error(
        `Intervalo estrutural duplicado: ${logicalSegmentKey(current)}`,
      );
    if (currentStart < previousEnd)
      throw new Error(
        `Intervalos estruturais sobrepostos: ${logicalSegmentKey(previous)} / ${logicalSegmentKey(current)}`,
      );
    if (currentStart > previousEnd)
      throw new Error(
        `Gap lógico entre segmentos: ${logicalSegmentKey(previous)} / ${logicalSegmentKey(current)}`,
      );
  }
  return true;
}

/** Validates the two perpendicular neighbours attached to a corner's free ends. */
export function validateCornerConnection(
  corner: StructurePlacement,
  firstNeighbour: StructurePlacement,
  secondNeighbour: StructurePlacement,
): true {
  const geometry = placementGeometry(corner);
  if (geometry.kind !== "corner")
    throw new Error("A conexão de canto exige um canto como vértice");
  const neighbours = [firstNeighbour, secondNeighbour].map((placement) => {
    const neighbour = placementGeometry(placement);
    if (neighbour.kind === "corner")
      throw new Error("A conexão de canto exige segmentos lineares vizinhos");
    return neighbour.interval;
  });
  const horizontal = neighbours.filter(
    (interval) => interval.axis === "horizontal",
  );
  const vertical = neighbours.filter(
    (interval) => interval.axis === "vertical",
  );
  if (horizontal.length !== 1 || vertical.length !== 1)
    throw new Error(
      "Canto exige um segmento horizontal e um vertical compatíveis",
    );
  validateCornerArmConnection(
    geometry.horizontalArm,
    horizontal[0],
    geometry.vertex,
  );
  validateCornerArmConnection(
    geometry.verticalArm,
    vertical[0],
    geometry.vertex,
  );
  return true;
}

/** Validates a horizontal door as the middle replacement in a wall run. */
export function validateHorizontalDoorConnection(
  door: StructurePlacement,
  firstNeighbour: StructurePlacement,
  secondNeighbour: StructurePlacement,
): true {
  const geometry = placementGeometry(door);
  if (geometry.kind !== "door" || geometry.interval.axis !== "horizontal")
    throw new Error("A conexão exige uma porta horizontal");
  const neighbours = [firstNeighbour, secondNeighbour].map((placement) => {
    const neighbour = placementGeometry(placement);
    if (neighbour.kind === "door")
      throw new Error("Uma porta não pode substituir outra porta adjacente");
    return neighbour.kind === "corner"
      ? neighbour.horizontalArm
      : neighbour.interval;
  });
  if (neighbours.some((interval) => interval.axis !== "horizontal"))
    throw new Error("Porta horizontal exige segmentos horizontais vizinhos");
  const run = [neighbours[0], geometry.interval, neighbours[1]];
  validateCollinearSegments(run);
  const ordered = [...run].sort(compareLogicalSegments);
  if (ordered[1] !== geometry.interval)
    throw new Error(
      "Porta horizontal deve substituir o intervalo entre dois segmentos",
    );
  return true;
}

/** Rejects exact duplicates and partial interval overlap deterministically. */
export function validateStructuralOccupancy(
  placements: readonly StructurePlacement[],
): true {
  const intervals = logicalStructureIntervals(placements);
  const cornerVertices = placements
    .map((placement) => ({
      geometry: placementGeometry(placement),
      instanceId: placement.instanceId,
    }))
    .filter(
      (
        item,
      ): item is {
        readonly geometry: LogicalCornerPlacementGeometry;
        readonly instanceId: string;
      } => item.geometry.kind === "corner",
    )
    .sort(
      (first, second) =>
        first.geometry.vertex.y - second.geometry.vertex.y ||
        first.geometry.vertex.x - second.geometry.vertex.x ||
        first.instanceId.localeCompare(second.instanceId),
    );
  const occupiedVertices = new Set<string>();
  for (const corner of cornerVertices) {
    const vertexKey = `${corner.geometry.vertex.x}:${corner.geometry.vertex.y}`;
    if (occupiedVertices.has(vertexKey))
      throw new Error(`Vértice de canto duplicado: ${vertexKey}`);
    occupiedVertices.add(vertexKey);
  }
  const exact = new Set<string>();
  const occupiedEdges = new Set<string>();
  for (const interval of intervals) {
    const intervalKey = logicalSegmentKey(interval);
    if (exact.has(intervalKey))
      throw new Error(`Intervalo estrutural duplicado: ${intervalKey}`);
    exact.add(intervalKey);
    for (const edge of logicalSegmentEdges(interval)) {
      const edgeKey = unitEdgeKey(edge);
      if (occupiedEdges.has(edgeKey))
        throw new Error(`Intervalo estrutural sobreposto: ${edgeKey}`);
      occupiedEdges.add(edgeKey);
    }
  }
  return true;
}

export function placementEdges(
  placement: StructurePlacement,
): readonly UnitEdge[] {
  return geometryIntervals(placementGeometry(placement)).flatMap(
    logicalSegmentEdges,
  );
}

export function passableEdges(
  placement: StructurePlacement,
): readonly UnitEdge[] {
  if (
    placement.definitionId !== "architecture.wall.stone-01.door-horizontal.open"
  )
    return [];
  const geometry = placementGeometry(placement);
  if (geometry.kind !== "door") return [];
  return logicalSegmentEdges(
    createLogicalSegment(
      "horizontal",
      {
        x: geometry.interval.start.x + 1,
        y: geometry.interval.start.y,
      },
      2,
    ),
  );
}

export function validateStructureCatalog(
  catalog: readonly StructureDefinition[] = STRUCTURE_CATALOG,
): true {
  const ids = new Set<string>();
  for (const definition of catalog) {
    if (ids.has(definition.id))
      throw new Error(`Definição estrutural duplicada: ${definition.id}`);
    ids.add(definition.id);
    if (
      !Number.isInteger(definition.visualOffsetCells.x) ||
      !Number.isInteger(definition.visualOffsetCells.y)
    )
      throw new Error(`Offset estrutural inválido: ${definition.id}`);
    if (
      definition.category !== "floor" &&
      (!definition.visualSpanCells || definition.visualSpanCells < 1)
    )
      throw new Error(`Extensão estrutural inválida: ${definition.id}`);
    if (
      definition.category !== "floor" &&
      (!Number.isSafeInteger(definition.logicalSpanCells) ||
        (definition.logicalSpanCells ?? 0) <= 0)
    )
      throw new Error(
        `Span lógico deve ser inteiro positivo: ${definition.id}`,
      );
    if (definition.category === "wall" && !definition.orientation)
      throw new Error(`Eixo lógico ausente: ${definition.id}`);
    if (definition.category === "corner" && !definition.corner)
      throw new Error(`Orientação lógica de canto ausente: ${definition.id}`);
    if (
      definition.category === "door" &&
      definition.orientation !== "horizontal"
    )
      throw new Error(`Porta vertical não aprovada: ${definition.id}`);
    if (definition.category === "door" && definition.logicalSpanCells !== 4)
      throw new Error(
        `Porta horizontal deve ocupar quatro células: ${definition.id}`,
      );
    if (!isStructuralInventoryFamilyId(definition.inventoryFamilyId))
      throw new Error(`Família estrutural inválida: ${definition.id}`);
  }
  return true;
}

export function validateWorldStructure(state: WorldStructureState): true {
  if (state.id !== WORLD_STRUCTURE_ID)
    throw new Error("Mundo estrutural desconhecido");
  if (!Number.isInteger(state.blueprintVersion) || state.blueprintVersion < 1)
    throw new Error("Versão de blueprint inválida");
  if (!Number.isInteger(state.revision) || state.revision < 1)
    throw new Error("Revisão estrutural inválida");
  const cells = new Set<string>();
  for (const cell of state.floorCells) {
    assertIntegerPoint(cell, "Célula de piso");
    const key = floorCellKey(cell);
    if (cells.has(key)) throw new Error(`Célula de piso duplicada: ${key}`);
    cells.add(key);
  }
  const ids = new Set<string>();
  for (const placement of state.placements) {
    if (ids.has(placement.instanceId))
      throw new Error(`Peça estrutural duplicada: ${placement.instanceId}`);
    ids.add(placement.instanceId);
    assertIntegerPoint(placement.anchor, "Âncora estrutural");
    requiredDefinition(placement.definitionId);
  }
  validateStructuralOccupancy(state.placements);
  return true;
}

export const INITIAL_WORLD_STRUCTURE: WorldStructureState = Object.freeze({
  blueprintVersion: INITIAL_WORLD_BLUEPRINT_VERSION,
  createdAt: "1970-01-01T00:00:00.000Z",
  floorCells: Object.freeze(
    Array.from({ length: 10 }, (_unused, row) =>
      Array.from({ length: 12 }, (_unused, column) => ({
        x: column + 3,
        y: row + 4,
      })),
    ).flat(),
  ),
  id: WORLD_STRUCTURE_ID,
  placements: Object.freeze([
    {
      anchor: { x: 3, y: 4 },
      definitionId: "architecture.wall.stone-01.corner-sw",
      instanceId: "initial.corner.top-left",
    },
    {
      anchor: { x: 15, y: 4 },
      definitionId: "architecture.wall.stone-01.corner-se",
      instanceId: "initial.corner.top-right",
    },
    {
      anchor: { x: 3, y: 14 },
      definitionId: "architecture.wall.stone-01.corner-nw",
      instanceId: "initial.corner.bottom-left",
    },
    {
      anchor: { x: 15, y: 14 },
      definitionId: "architecture.wall.stone-01.corner-ne",
      instanceId: "initial.corner.bottom-right",
    },
    {
      anchor: { x: 7, y: 4 },
      definitionId: "architecture.wall.stone-01.horizontal-4",
      instanceId: "initial.wall.top",
    },
    {
      anchor: { x: 3, y: 8 },
      definitionId: "architecture.wall.stone-01.vertical-2",
      instanceId: "initial.wall.left",
    },
    {
      anchor: { x: 15, y: 8 },
      definitionId: "architecture.wall.stone-01.vertical-2",
      instanceId: "initial.wall.right",
    },
    {
      anchor: { x: 7, y: 14 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      instanceId: "initial.door.bottom",
    },
  ] satisfies readonly StructurePlacement[]),
  revision: 1,
  updatedAt: "1970-01-01T00:00:00.000Z",
});

export function initialWorldStructure(now: string): WorldStructureState {
  return Object.freeze({
    ...INITIAL_WORLD_STRUCTURE,
    createdAt: now,
    updatedAt: now,
  });
}

export interface StructuralInventory {
  readonly available: Readonly<Record<StructuralInventoryFamilyId, number>>;
  readonly granted: Readonly<Record<StructuralInventoryFamilyId, number>>;
  readonly placed: Readonly<Record<StructuralInventoryFamilyId, number>>;
}

/**
 * The former reserve repeated orientated assets. A physical family uses the
 * maximum reserve of its interchangeable variants, never their sum.
 */
export const INITIAL_STRUCTURAL_RESERVE: Readonly<
  Record<StructuralInventoryFamilyId, number>
> = Object.freeze({
  [STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]: 24,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallShort]: 2,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium]: 2,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallLong]: 1,
  [STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone]: 1,
  [STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal]: 0,
});

/** Blueprint placements plus the physical reserve, fixed at first creation. */
const INITIAL_STRUCTURAL_GRANTED: Readonly<
  Record<StructuralInventoryFamilyId, number>
> = Object.freeze({
  [STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]: 144,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallShort]: 2,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium]: 4,
  [STRUCTURAL_INVENTORY_FAMILY_ID.wallLong]: 2,
  [STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone]: 5,
  [STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal]: 1,
});

export function structuralInventory(
  state: WorldStructureState,
  milestones: readonly ReachedMilestone[] = [],
): StructuralInventory {
  validateWorldStructure(state);
  const placed = emptyFamilyCounts();
  placed[STRUCTURAL_INVENTORY_FAMILY_ID.floorWood] = state.floorCells.length;
  for (const placement of state.placements)
    placed[structuralInventoryFamilyForDefinition(placement.definitionId)] += 1;
  const granted = { ...INITIAL_STRUCTURAL_GRANTED };
  const processedMilestones = new Set<string>();
  for (const milestone of milestones) {
    if (processedMilestones.has(milestone.id)) continue;
    processedMilestones.add(milestone.id);
    for (const reward of milestone.rewards) {
      if (reward.type !== "structure-grant") continue;
      if (
        !isStructuralInventoryFamilyId(reward.familyId) ||
        !Number.isInteger(reward.quantity) ||
        reward.quantity <= 0
      )
        throw new Error("Recompensa estrutural inválida");
      granted[reward.familyId] += reward.quantity;
    }
  }
  const available = emptyFamilyCounts();
  for (const familyId of Object.keys(
    granted,
  ) as readonly StructuralInventoryFamilyId[]) {
    const remaining = granted[familyId] - placed[familyId];
    if (remaining < 0)
      throw new Error(`Inventário estrutural negativo: ${familyId}`);
    available[familyId] = remaining;
  }
  return Object.freeze({
    available: Object.freeze(available),
    granted: Object.freeze(granted),
    placed: Object.freeze(placed),
  });
}

function emptyFamilyCounts(): Record<StructuralInventoryFamilyId, number> {
  return {
    [STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]: 0,
    [STRUCTURAL_INVENTORY_FAMILY_ID.wallShort]: 0,
    [STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium]: 0,
    [STRUCTURAL_INVENTORY_FAMILY_ID.wallLong]: 0,
    [STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone]: 0,
    [STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal]: 0,
  };
}

export function worldBounds(state: WorldStructureState): {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
} {
  validateWorldStructure(state);
  const xs = state.floorCells.map((cell) => cell.x);
  const ys = state.floorCells.map((cell) => cell.y);
  return Object.freeze({
    height: (Math.max(...ys) - Math.min(...ys) + 1) * WORLD_CELL_SIZE,
    width: (Math.max(...xs) - Math.min(...xs) + 1) * WORLD_CELL_SIZE,
    x: Math.min(...xs) * WORLD_CELL_SIZE,
    y: Math.min(...ys) * WORLD_CELL_SIZE,
  });
}

const integer = z.int();
const gridPointSchema = z.strictObject({ x: integer, y: integer });
export const worldStructureSchema = z
  .strictObject({
    blueprintVersion: z.int().positive(),
    createdAt: z.iso.datetime({ offset: false }),
    floorCells: z.array(gridPointSchema),
    id: z.literal(WORLD_STRUCTURE_ID),
    placements: z.array(
      z.strictObject({
        anchor: gridPointSchema,
        definitionId: z.string().trim().min(1),
        instanceId: z.string().trim().min(1),
      }),
    ),
    revision: z.int().positive(),
    updatedAt: z.iso.datetime({ offset: false }),
  })
  .transform((value) => value as WorldStructureState);

function horizontalEdges(
  x: number,
  y: number,
  length: number,
): readonly UnitEdge[] {
  return Array.from({ length }, (_unused, offset) => ({
    axis: "horizontal" as const,
    x: x + offset,
    y,
  }));
}
function verticalEdges(
  x: number,
  y: number,
  length: number,
): readonly UnitEdge[] {
  return Array.from({ length }, (_unused, offset) => ({
    axis: "vertical" as const,
    x,
    y: y + offset,
  }));
}
function logicalStructureInterval(
  placement: StructurePlacement,
  category: Exclude<StructuralCategory, "floor">,
  part: LogicalStructureIntervalPart,
  segment: LogicalSegment,
): LogicalStructureInterval {
  return Object.freeze({
    ...segment,
    category,
    definitionId: placement.definitionId,
    instanceId: placement.instanceId,
    part,
  });
}
function geometryIntervals(
  geometry: LogicalPlacementGeometry,
): readonly LogicalStructureInterval[] {
  return geometry.kind === "corner"
    ? [geometry.horizontalArm, geometry.verticalArm]
    : [geometry.interval];
}
function requiredLogicalSpan(definition: StructureDefinition): number {
  const spanCells = definition.logicalSpanCells;
  if (
    typeof spanCells !== "number" ||
    !Number.isSafeInteger(spanCells) ||
    spanCells <= 0
  )
    throw new Error(`Span lógico inválido: ${definition.id}`);
  return spanCells;
}
function logicalSegmentEdges(segment: LogicalSegment): readonly UnitEdge[] {
  return segment.axis === "horizontal"
    ? horizontalEdges(segment.start.x, segment.start.y, segment.spanCells)
    : verticalEdges(segment.start.x, segment.start.y, segment.spanCells);
}
function validateLogicalSegment(segment: LogicalSegment): void {
  const expected = createLogicalSegment(
    segment.axis,
    segment.start,
    segment.spanCells,
  );
  assertIntegerPoint(segment.end, "Fim do segmento");
  if (!pointsEqual(expected.end, segment.end))
    throw new Error(
      `Endpoint incompatível com eixo/span: ${logicalSegmentKey(segment)}`,
    );
}
function compareLogicalSegments(
  first: LogicalSegment,
  second: LogicalSegment,
): number {
  const byAxis = first.axis.localeCompare(second.axis);
  if (byAxis !== 0) return byAxis;
  const byLine = fixedCoordinate(first) - fixedCoordinate(second);
  if (byLine !== 0) return byLine;
  const byStart = startCoordinate(first) - startCoordinate(second);
  if (byStart !== 0) return byStart;
  const byEnd = endCoordinate(first) - endCoordinate(second);
  if (byEnd !== 0) return byEnd;
  return logicalSegmentKey(first).localeCompare(logicalSegmentKey(second));
}
function compareLogicalStructureIntervals(
  first: LogicalStructureInterval,
  second: LogicalStructureInterval,
): number {
  const byGeometry = compareLogicalSegments(first, second);
  if (byGeometry !== 0) return byGeometry;
  const byCategory = first.category.localeCompare(second.category);
  if (byCategory !== 0) return byCategory;
  const byDefinition = first.definitionId.localeCompare(second.definitionId);
  if (byDefinition !== 0) return byDefinition;
  const byPart = first.part.localeCompare(second.part);
  if (byPart !== 0) return byPart;
  return first.instanceId.localeCompare(second.instanceId);
}
function fixedCoordinate(segment: LogicalSegment): number {
  return segment.axis === "horizontal" ? segment.start.y : segment.start.x;
}
function startCoordinate(segment: LogicalSegment): number {
  return segment.axis === "horizontal" ? segment.start.x : segment.start.y;
}
function endCoordinate(segment: LogicalSegment): number {
  return segment.axis === "horizontal" ? segment.end.x : segment.end.y;
}
function pointsEqual(first: GridPoint, second: GridPoint): boolean {
  return first.x === second.x && first.y === second.y;
}
function validateCornerArmConnection(
  arm: LogicalSegment,
  neighbour: LogicalSegment,
  vertex: GridPoint,
): void {
  validateCollinearSegments([arm, neighbour]);
  const freeEndpoint = pointsEqual(arm.start, vertex) ? arm.end : arm.start;
  const neighbourTouchesFreeEndpoint =
    pointsEqual(neighbour.start, freeEndpoint) ||
    pointsEqual(neighbour.end, freeEndpoint);
  if (!neighbourTouchesFreeEndpoint)
    throw new Error(
      `Segmento ${arm.axis} não se conecta à extremidade livre do canto`,
    );
}
function requiredDefinition(id: StructureDefinitionId): StructureDefinition {
  const definition = structureDefinition(id);
  if (!definition) throw new Error(`Definição estrutural ausente: ${id}`);
  return definition;
}
function assertIntegerPoint(point: GridPoint, label: string): void {
  if (!Number.isSafeInteger(point.x) || !Number.isSafeInteger(point.y))
    throw new Error(`${label} deve usar coordenadas inteiras seguras`);
}
