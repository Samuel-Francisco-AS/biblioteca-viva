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
  | "NO_FLOOR_CHANGE"
  | "FLOOR_NOT_CONNECTED"
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
  NO_FLOOR_CHANGE: "Marque pelo menos uma célula que possa ser alterada.",
  FLOOR_NOT_CONNECTED: "O piso novo precisa tocar a área construída.",
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

export function structurePlacementIssue(
  state: WorldStructureState,
  placement: StructurePlacement,
  exceptInstanceId?: string,
): StructureOperationCode | undefined {
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

export interface FloorEditEvaluation {
  readonly cells: readonly FloorCell[];
  readonly issue?: StructureOperationCode;
  readonly valid: boolean;
}

/** Shared authority for the preview color, primary action and persisted edit. */
export function evaluateFloorEdit(
  state: WorldStructureState,
  input: readonly FloorCell[],
  mode: "paint-floor" | "remove-floor",
  availableFloor: number,
  objects: readonly PlacedObject[] = [],
): FloorEditEvaluation {
  const existing = new Set(state.floorCells.map(floorCellKey));
  const seen = new Set<string>();
  const candidates: FloorCell[] = [];
  for (const cell of input) {
    const key = floorCellKey(cell);
    if (seen.has(key)) continue;
    seen.add(key);
    if (mode === "paint-floor" ? !existing.has(key) : existing.has(key))
      candidates.push(cell);
  }
  if (candidates.length === 0)
    return { cells: Object.freeze([]), issue: "NO_FLOOR_CHANGE", valid: false };

  if (mode === "paint-floor") {
    if (candidates.length > availableFloor)
      return {
        cells: Object.freeze(candidates),
        issue: "NO_AVAILABILITY",
        valid: false,
      };
    const connected = new Set(existing);
    for (const cell of candidates) {
      const touchesFloor = [
        `${cell.x + 1}:${cell.y}`,
        `${cell.x - 1}:${cell.y}`,
        `${cell.x}:${cell.y + 1}`,
        `${cell.x}:${cell.y - 1}`,
      ].some((key) => connected.has(key));
      if (!touchesFloor)
        return {
          cells: Object.freeze(candidates),
          issue: "FLOOR_NOT_CONNECTED",
          valid: false,
        };
      connected.add(floorCellKey(cell));
    }
    return { cells: Object.freeze(candidates), valid: true };
  }

  let floorCells = state.floorCells;
  for (const cell of candidates) {
    const working = { ...state, floorCells };
    const issue = floorAllowedToRemove(working, cell, objects);
    if (issue)
      return { cells: Object.freeze(candidates), issue, valid: false };
    floorCells = floorCells.filter(
      (item) => floorCellKey(item) !== floorCellKey(cell),
    );
  }
  return { cells: Object.freeze(candidates), valid: true };
}

export function structureOperationMessage(code: StructureOperationCode): string {
  return messages[code];
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
    const violation = structurePlacementIssue(state, placement);
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
    const violation = structurePlacementIssue(state, next, previous.instanceId);
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
    const violation = structurePlacementIssue(state, next, previous.instanceId);
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
    const inventory = await inventoryFor(state, this.deps.milestones);
    const evaluation = evaluateFloorEdit(
      state,
      parsed.cells,
      "paint-floor",
      inventory.available["structure-family.floor.wood"],
    );
    if (!evaluation.valid) throw editError(evaluation.issue ?? "NO_FLOOR_CHANGE");
    const next = stateWith(
      state,
      {
        floorCells: [...state.floorCells, ...evaluation.cells],
        placements: state.placements,
      },
      await this.deps.clock.now(),
    );
    return {
      ignored: parsed.cells.length - evaluation.cells.length,
      placed: evaluation.cells.length,
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
    const evaluation = evaluateFloorEdit(
      state,
      parsed.cells,
      "remove-floor",
      Number.POSITIVE_INFINITY,
      objects,
    );
    if (!evaluation.valid) throw editError(evaluation.issue ?? "NO_FLOOR_CHANGE");
    const removedKeys = new Set(evaluation.cells.map(floorCellKey));
    const next = stateWith(
      state,
      {
        floorCells: state.floorCells.filter(
          (cell) => !removedKeys.has(floorCellKey(cell)),
        ),
        placements: state.placements,
      },
      await this.deps.clock.now(),
    );
    return {
      ignored: parsed.cells.length - evaluation.cells.length,
      removed: evaluation.cells.length,
      state: await commit(this.deps, next, state.revision),
    };
  }
}
