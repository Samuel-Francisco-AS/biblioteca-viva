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
  visualSpanCells: number,
): StructureDefinition => ({
  assetId: id,
  category: "wall",
  fallback: "procedural-wall",
  id,
  inventoryFamilyId:
    visualSpanCells === 1
      ? STRUCTURAL_INVENTORY_FAMILY_ID.wallShort
      : visualSpanCells === 2
        ? STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium
        : STRUCTURAL_INVENTORY_FAMILY_ID.wallLong,
  movable: true,
  orientation,
  pivot: { x: 0, y: 0 },
  rotatable: true,
  visualOffsetCells: { x: 0, y: 0 },
  visualSpanCells,
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
    movable: true,
    orientation: "horizontal" as const,
    pivot: { x: 0, y: 0 },
    rotatable: false,
    visualOffsetCells: { x: -1, y: 0 },
    visualSpanCells: 4,
  })),
]);

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

export function floorCellKey(cell: FloorCell): string {
  return `${cell.x}:${cell.y}`;
}

export function unitEdgeKey(edge: UnitEdge): string {
  return `${edge.axis}:${edge.x}:${edge.y}`;
}

export function placementEdges(
  placement: StructurePlacement,
): readonly UnitEdge[] {
  const definition = requiredDefinition(placement.definitionId);
  const { x, y } = placement.anchor;
  if (definition.category === "floor") return [];
  if (definition.category === "door")
    return horizontalEdges(x, y, definition.visualSpanCells ?? 0);
  if (definition.category === "wall")
    return definition.orientation === "horizontal"
      ? horizontalEdges(x, y, definition.visualSpanCells ?? 0)
      : verticalEdges(x, y, definition.visualSpanCells ?? 0);
  const length = definition.visualSpanCells ?? 0;
  switch (definition.corner) {
    case "ne":
      return [
        ...horizontalEdges(x - length, y, length),
        ...verticalEdges(x, y - length, length),
      ];
    case "nw":
      return [
        ...horizontalEdges(x, y, length),
        ...verticalEdges(x, y - length, length),
      ];
    case "se":
      return [
        ...horizontalEdges(x - length, y, length),
        ...verticalEdges(x, y, length),
      ];
    case "sw":
      return [...horizontalEdges(x, y, length), ...verticalEdges(x, y, length)];
    default:
      throw new Error(`Canto inválido: ${placement.definitionId}`);
  }
}

export function passableEdges(
  placement: StructurePlacement,
): readonly UnitEdge[] {
  if (
    placement.definitionId !==
    "architecture.wall.stone-01.door-horizontal.closed"
  )
    return [];
  return horizontalEdges(placement.anchor.x + 1, placement.anchor.y, 2);
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
      definition.category === "door" &&
      definition.orientation !== "horizontal"
    )
      throw new Error(`Porta vertical não aprovada: ${definition.id}`);
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
  const edges = new Set<string>();
  for (const placement of state.placements) {
    if (ids.has(placement.instanceId))
      throw new Error(`Peça estrutural duplicada: ${placement.instanceId}`);
    ids.add(placement.instanceId);
    assertIntegerPoint(placement.anchor, "Âncora estrutural");
    requiredDefinition(placement.definitionId);
    for (const edge of placementEdges(placement)) {
      const key = unitEdgeKey(edge);
      if (edges.has(key))
        throw new Error(`Aresta estrutural duplicada: ${key}`);
      edges.add(key);
    }
  }
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
function requiredDefinition(id: StructureDefinitionId): StructureDefinition {
  const definition = structureDefinition(id);
  if (!definition) throw new Error(`Definição estrutural ausente: ${id}`);
  return definition;
}
function assertIntegerPoint(point: GridPoint, label: string): void {
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y))
    throw new Error(`${label} deve usar coordenadas inteiras`);
}
