import { z } from "zod";

import { ApplicationError, toValidationError } from "./errors";
import type { PlacedObject } from "./world";
import { objectDefinition } from "./world";
import {
  floorCellKey,
  placementEdges,
  rotatedStructureDefinitionId,
  structureDefinition,
  structuralInventoryFamilyForDefinition,
  structuralInventory,
  unitEdgeKey,
  validateWorldStructure,
  WORLD_CELL_SIZE,
  type FloorCell,
  type GridPoint,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "./worldStructure";
import type { WorldStructureRepository } from "./worldStructureRepository";
import type { MilestoneRepository } from "./milestones";

export type StructureOperationCode =
  | "NO_AVAILABILITY"
  | "DESTINATION_OCCUPIED"
  | "NO_ADJACENT_FLOOR"
  | "INVALID_COORDINATE"
  | "ORIENTATION_UNAVAILABLE"
  | "FLOOR_OCCUPIED_BY_OBJECT"
  | "FLOOR_DISCONNECTED"
  | "STRUCTURE_UNSUPPORTED"
  | "STALE_STATE"
  | "TECHNICAL_LIMIT"
  | "PERSISTENCE_FAILED";

const messages: Readonly<Record<StructureOperationCode, string>> = {
  NO_AVAILABILITY: "Esta peça não está disponível no inventário.",
  DESTINATION_OCCUPIED: "O destino já possui uma peça estrutural.",
  NO_ADJACENT_FLOOR: "A peça precisa tocar o piso existente.",
  INVALID_COORDINATE: "A posição informada não é válida.",
  ORIENTATION_UNAVAILABLE: "Esta peça não possui outra orientação aprovada.",
  FLOOR_OCCUPIED_BY_OBJECT: "Há um objeto ocupando esta célula de piso.",
  FLOOR_DISCONNECTED: "A remoção desconectaria o piso da Biblioteca.",
  STRUCTURE_UNSUPPORTED: "Uma peça estrutural ficaria sem apoio no piso.",
  STALE_STATE: "A construção foi atualizada. Tente novamente.",
  TECHNICAL_LIMIT: "Este ponto está além da área atual de expansão.",
  PERSISTENCE_FAILED: "Não foi possível salvar a construção.",
};

function editError(code: StructureOperationCode): ApplicationError {
  return new ApplicationError(
    code === "STALE_STATE"
      ? "CONFLICT"
      : code === "PERSISTENCE_FAILED"
        ? "PERSISTENCE_FAILED"
        : "VALIDATION_FAILED",
    messages[code],
    { operation: `structure_${code.toLowerCase()}` },
  );
}

const pointSchema = z.strictObject({ x: z.int(), y: z.int() });
const expectedSchema = z.int().positive();
const structureIdSchema = z.string().trim().min(1);

export interface StructureEditingDependencies {
  readonly clock: { now(): Promise<string> };
  readonly ids: { generate(): Promise<string> };
  readonly objects: { list(): Promise<readonly PlacedObject[]> };
  readonly repository: WorldStructureRepository;
  readonly milestones?: MilestoneRepository;
}

async function inventoryFor(
  state: WorldStructureState,
  milestones?: MilestoneRepository,
) {
  return structuralInventory(state, milestones ? await milestones.list() : []);
}

function stateWith(
  state: WorldStructureState,
  changes: Pick<WorldStructureState, "floorCells" | "placements">,
  updatedAt: string,
): WorldStructureState {
  const next: WorldStructureState = {
    ...state,
    ...changes,
    revision: state.revision + 1,
    updatedAt,
  };
  validateWorldStructure(next);
  return Object.freeze(next);
}

function technicalEnvelope(state: WorldStructureState): {
  readonly maxX: number;
  readonly maxY: number;
  readonly minX: number;
  readonly minY: number;
} {
  const xs = state.floorCells.map((cell) => cell.x);
  const ys = state.floorCells.map((cell) => cell.y);
  return {
    maxX: Math.max(...xs) + 4,
    maxY: Math.max(...ys) + 4,
    minX: Math.min(...xs) - 4,
    minY: Math.min(...ys) - 4,
  };
}

function inEnvelope(point: GridPoint, state: WorldStructureState): boolean {
  const bounds = technicalEnvelope(state);
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

function hasFloorContact(
  placement: StructurePlacement,
  floorCells: readonly FloorCell[],
): boolean {
  const floors = new Set(floorCells.map(floorCellKey));
  return placementEdges(placement).some((edge) =>
    edge.axis === "horizontal"
      ? floors.has(`${edge.x}:${edge.y}`) ||
        floors.has(`${edge.x}:${edge.y - 1}`)
      : floors.has(`${edge.x}:${edge.y}`) ||
        floors.has(`${edge.x - 1}:${edge.y}`),
  );
}

function placementAllowed(
  state: WorldStructureState,
  placement: StructurePlacement,
  exceptInstanceId?: string,
): StructureOperationCode | undefined {
  if (!inEnvelope(placement.anchor, state)) return "TECHNICAL_LIMIT";
  const existing = new Set<string>();
  for (const candidate of state.placements) {
    if (candidate.instanceId === exceptInstanceId) continue;
    for (const edge of placementEdges(candidate))
      existing.add(unitEdgeKey(edge));
  }
  if (placementEdges(placement).some((edge) => existing.has(unitEdgeKey(edge))))
    return "DESTINATION_OCCUPIED";
  if (!hasFloorContact(placement, state.floorCells)) return "NO_ADJACENT_FLOOR";
  return undefined;
}

function isConnected(cells: readonly FloorCell[]): boolean {
  if (cells.length === 0) return false;
  const keys = new Set(cells.map(floorCellKey));
  const seen = new Set<string>();
  const queue = [cells[0]];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (!cell) continue;
    const key = floorCellKey(cell);
    if (seen.has(key)) continue;
    seen.add(key);
    for (const [x, y] of [
      [cell.x + 1, cell.y],
      [cell.x - 1, cell.y],
      [cell.x, cell.y + 1],
      [cell.x, cell.y - 1],
    ] as const) {
      const next = `${x}:${y}`;
      if (keys.has(next) && !seen.has(next)) queue.push({ x, y });
    }
  }
  return seen.size === keys.size;
}

function objectCoversCell(object: PlacedObject, cell: FloorCell): boolean {
  const definition = objectDefinition(object.definitionId);
  if (!definition) return true;
  const swapped = object.rotation === 90 || object.rotation === 270;
  const width =
    (swapped ? definition.footprint.height : definition.footprint.width) /
    WORLD_CELL_SIZE;
  const height =
    (swapped ? definition.footprint.width : definition.footprint.height) /
    WORLD_CELL_SIZE;
  const x = object.x / WORLD_CELL_SIZE;
  const y = object.y / WORLD_CELL_SIZE;
  return (
    cell.x >= x && cell.x < x + width && cell.y >= y && cell.y < y + height
  );
}

function floorAllowedToRemove(
  state: WorldStructureState,
  candidate: FloorCell,
  objects: readonly PlacedObject[],
): StructureOperationCode | undefined {
  if (candidate.x === 3 && candidate.y === 4) return "FLOOR_DISCONNECTED";
  if (objects.some((object) => objectCoversCell(object, candidate)))
    return "FLOOR_OCCUPIED_BY_OBJECT";
  const floorCells = state.floorCells.filter(
    (cell) => floorCellKey(cell) !== floorCellKey(candidate),
  );
  if (!isConnected(floorCells)) return "FLOOR_DISCONNECTED";
  if (
    state.placements.some(
      (placement) => !hasFloorContact(placement, floorCells),
    )
  )
    return "STRUCTURE_UNSUPPORTED";
  return undefined;
}

async function load(
  deps: StructureEditingDependencies,
): Promise<WorldStructureState> {
  try {
    const state = await deps.repository.get();
    if (!state) throw editError("PERSISTENCE_FAILED");
    return state;
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    throw editError("PERSISTENCE_FAILED");
  }
}

async function commit(
  deps: StructureEditingDependencies,
  state: WorldStructureState,
  expectedRevision: number,
): Promise<WorldStructureState> {
  try {
    return await deps.repository.save(state, expectedRevision);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "stale_structure")
      throw editError("STALE_STATE");
    throw editError("PERSISTENCE_FAILED");
  }
}

export class GetStructuralInventory {
  constructor(
    private readonly repository: WorldStructureRepository,
    private readonly milestones?: MilestoneRepository,
  ) {}
  async execute() {
    const state = await this.repository.get();
    if (!state) throw editError("PERSISTENCE_FAILED");
    return inventoryFor(state, this.milestones);
  }
}

export class PlaceStructure {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<WorldStructureState> {
    let parsed: {
      anchor: GridPoint;
      definitionId: StructureDefinitionId;
      expectedRevision: number;
    };
    try {
      parsed = z
        .strictObject({
          anchor: pointSchema,
          definitionId: structureIdSchema,
          expectedRevision: expectedSchema,
        })
        .parse(input) as typeof parsed;
    } catch (error) {
      throw toValidationError(error);
    }
    const state = await load(this.deps);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    const definition = structureDefinition(parsed.definitionId);
    if (!definition || definition.category === "floor")
      throw editError("INVALID_COORDINATE");
    if (
      (await inventoryFor(state, this.deps.milestones)).available[
        structuralInventoryFamilyForDefinition(parsed.definitionId)
      ] < 1
    )
      throw editError("NO_AVAILABILITY");
    const placement = {
      anchor: parsed.anchor,
      definitionId: parsed.definitionId,
      instanceId: await this.deps.ids.generate(),
    };
    const violation = placementAllowed(state, placement);
    if (violation) throw editError(violation);
    return commit(
      this.deps,
      stateWith(
        state,
        {
          floorCells: state.floorCells,
          placements: [...state.placements, placement],
        },
        await this.deps.clock.now(),
      ),
      state.revision,
    );
  }
}

export class MoveStructure {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<WorldStructureState> {
    let parsed: {
      anchor: GridPoint;
      expectedRevision: number;
      instanceId: string;
    };
    try {
      parsed = z
        .strictObject({
          anchor: pointSchema,
          expectedRevision: expectedSchema,
          instanceId: structureIdSchema,
        })
        .parse(input);
    } catch (error) {
      throw toValidationError(error);
    }
    const state = await load(this.deps);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    const previous = state.placements.find(
      (item) => item.instanceId === parsed.instanceId,
    );
    if (!previous) throw editError("INVALID_COORDINATE");
    const next = { ...previous, anchor: parsed.anchor };
    const violation = placementAllowed(state, next, previous.instanceId);
    if (violation) throw editError(violation);
    return commit(
      this.deps,
      stateWith(
        state,
        {
          floorCells: state.floorCells,
          placements: state.placements.map((item) =>
            item.instanceId === previous.instanceId ? next : item,
          ),
        },
        await this.deps.clock.now(),
      ),
      state.revision,
    );
  }
}

export class RotateStructure {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<WorldStructureState> {
    let parsed: { expectedRevision: number; instanceId: string };
    try {
      parsed = z
        .strictObject({
          expectedRevision: expectedSchema,
          instanceId: structureIdSchema,
        })
        .parse(input);
    } catch (error) {
      throw toValidationError(error);
    }
    const state = await load(this.deps);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    const previous = state.placements.find(
      (item) => item.instanceId === parsed.instanceId,
    );
    const definitionId =
      previous && rotatedStructureDefinitionId(previous.definitionId);
    if (!previous || !definitionId) throw editError("ORIENTATION_UNAVAILABLE");
    const next = { ...previous, definitionId };
    const violation = placementAllowed(state, next, previous.instanceId);
    if (violation) throw editError(violation);
    return commit(
      this.deps,
      stateWith(
        state,
        {
          floorCells: state.floorCells,
          placements: state.placements.map((item) =>
            item.instanceId === previous.instanceId ? next : item,
          ),
        },
        await this.deps.clock.now(),
      ),
      state.revision,
    );
  }
}

export class StoreStructure {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<WorldStructureState> {
    let parsed: { expectedRevision: number; instanceId: string };
    try {
      parsed = z
        .strictObject({
          expectedRevision: expectedSchema,
          instanceId: structureIdSchema,
        })
        .parse(input);
    } catch (error) {
      throw toValidationError(error);
    }
    const state = await load(this.deps);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    if (!state.placements.some((item) => item.instanceId === parsed.instanceId))
      throw editError("INVALID_COORDINATE");
    return commit(
      this.deps,
      stateWith(
        state,
        {
          floorCells: state.floorCells,
          placements: state.placements.filter(
            (item) => item.instanceId !== parsed.instanceId,
          ),
        },
        await this.deps.clock.now(),
      ),
      state.revision,
    );
  }
}

export class AddFloorCells {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<{
    readonly ignored: number;
    readonly placed: number;
    readonly state: WorldStructureState;
  }> {
    let parsed: { cells: readonly FloorCell[]; expectedRevision: number };
    try {
      parsed = z
        .strictObject({
          cells: z.array(pointSchema),
          expectedRevision: expectedSchema,
        })
        .parse(input);
    } catch (error) {
      throw toValidationError(error);
    }
    const state = await load(this.deps);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    let working = state;
    let placed = 0;
    const seen = new Set<string>();
    for (const cell of parsed.cells) {
      const key = floorCellKey(cell);
      if (seen.has(key)) continue;
      seen.add(key);
      if (
        !inEnvelope(cell, working) ||
        working.floorCells.some((item) => floorCellKey(item) === key)
      )
        continue;
      if (
        (await inventoryFor(working, this.deps.milestones)).available[
          "structure-family.floor.wood"
        ] < 1
      )
        continue;
      if (
        !working.floorCells.some(
          (item) => Math.abs(item.x - cell.x) + Math.abs(item.y - cell.y) === 1,
        )
      )
        continue;
      working = stateWith(
        working,
        {
          floorCells: [...working.floorCells, cell],
          placements: working.placements,
        },
        working.updatedAt,
      );
      placed += 1;
    }
    if (placed === 0) return { ignored: parsed.cells.length, placed: 0, state };
    const next = stateWith(
      state,
      { floorCells: working.floorCells, placements: state.placements },
      await this.deps.clock.now(),
    );
    return {
      ignored: parsed.cells.length - placed,
      placed,
      state: await commit(this.deps, next, state.revision),
    };
  }
}

export class RemoveFloorCells {
  constructor(private readonly deps: StructureEditingDependencies) {}
  async execute(input: unknown): Promise<{
    readonly ignored: number;
    readonly removed: number;
    readonly state: WorldStructureState;
  }> {
    let parsed: { cells: readonly FloorCell[]; expectedRevision: number };
    try {
      parsed = z
        .strictObject({
          cells: z.array(pointSchema),
          expectedRevision: expectedSchema,
        })
        .parse(input);
    } catch (error) {
      throw toValidationError(error);
    }
    const [state, objects] = await Promise.all([
      load(this.deps),
      this.deps.objects.list(),
    ]);
    if (state.revision !== parsed.expectedRevision)
      throw editError("STALE_STATE");
    let working = state;
    let removed = 0;
    const seen = new Set<string>();
    for (const cell of parsed.cells) {
      const key = floorCellKey(cell);
      if (seen.has(key)) continue;
      seen.add(key);
      if (!working.floorCells.some((item) => floorCellKey(item) === key))
        continue;
      if (floorAllowedToRemove(working, cell, objects)) continue;
      working = stateWith(
        working,
        {
          floorCells: working.floorCells.filter(
            (item) => floorCellKey(item) !== key,
          ),
          placements: working.placements,
        },
        working.updatedAt,
      );
      removed += 1;
    }
    if (removed === 0)
      return { ignored: parsed.cells.length, removed: 0, state };
    const next = stateWith(
      state,
      { floorCells: working.floorCells, placements: state.placements },
      await this.deps.clock.now(),
    );
    return {
      ignored: parsed.cells.length - removed,
      removed,
      state: await commit(this.deps, next, state.revision),
    };
  }
}
