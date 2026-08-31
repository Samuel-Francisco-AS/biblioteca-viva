import {
  INITIAL_WORLD_BLUEPRINT_VERSION,
  INITIAL_WORLD_STRUCTURE,
  floorCellKey,
  placementEdges,
  placementGeometry,
  unitEdgeKey,
  type CornerOrientation,
  type EdgeAxis,
  type FloorCell,
  type GridPoint,
  type StructureDefinitionId,
  type StructurePlacement,
  type UnitEdge,
  type WorldStructureState,
} from "./worldStructure";

export interface PerimeterVertexDegree {
  readonly degree: number;
  readonly vertex: GridPoint;
}

export interface StructuralEdgeComponent {
  readonly closed: boolean;
  readonly edges: readonly UnitEdge[];
  readonly vertexDegrees: readonly PerimeterVertexDegree[];
}

export interface StructurePerimeterAnalysis {
  readonly closed: boolean;
  readonly connectedComponents: readonly StructuralEdgeComponent[];
  readonly duplicateEdges: readonly UnitEdge[];
  readonly endpoints: readonly GridPoint[];
  readonly extraEdges: readonly UnitEdge[];
  readonly incompatibleDegrees: readonly PerimeterVertexDegree[];
  readonly missingEdges: readonly UnitEdge[];
  readonly perimeterEdges: readonly UnitEdge[];
  readonly structuralEdges: readonly UnitEdge[];
}

export type NormalizedStructureOrientation = EdgeAxis | CornerOrientation;
export type NormalizedStructureState = "closed" | "open" | null;

export interface NormalizedStructurePlacement {
  readonly anchor: GridPoint;
  readonly definitionId: StructureDefinitionId;
  readonly orientation: NormalizedStructureOrientation;
  readonly state: NormalizedStructureState;
}

export interface NormalizedWorldStructureSignature {
  readonly floorCells: readonly FloorCell[];
  readonly placements: readonly NormalizedStructurePlacement[];
}

export type WorldStructureIdentity =
  "canonical-v1" | "future/unknown" | "modified-v1";

/** Derives every exposed unit edge of an arbitrary set of floor cells. */
export function deriveFloorPerimeterEdges(
  floorCells: readonly FloorCell[],
): readonly UnitEdge[] {
  const cells = new Set<string>();
  const exposed = new Map<string, UnitEdge>();
  for (const cell of floorCells) {
    assertIntegerPoint(cell, "Célula de piso");
    const cellKey = floorCellKey(cell);
    if (cells.has(cellKey))
      throw new Error(`Célula de piso duplicada: ${cellKey}`);
    cells.add(cellKey);
    for (const edge of floorCellEdges(cell)) {
      const edgeKey = unitEdgeKey(edge);
      if (exposed.has(edgeKey)) exposed.delete(edgeKey);
      else exposed.set(edgeKey, edge);
    }
  }
  return frozenSortedEdges(exposed.values());
}

/**
 * Compares floor boundary and structural occupancy without changing editing
 * validity. Closure is diagnostic only and never mutates the supplied state.
 */
export function analyzeStructurePerimeter(
  state: Pick<WorldStructureState, "floorCells" | "placements">,
): StructurePerimeterAnalysis {
  const perimeterEdges = deriveFloorPerimeterEdges(state.floorCells);
  const perimeterKeys = new Set(perimeterEdges.map(unitEdgeKey));
  const occupied = new Map<
    string,
    { readonly edge: UnitEdge; count: number }
  >();
  for (const placement of state.placements) {
    for (const edge of placementEdges(placement)) {
      const edgeKey = unitEdgeKey(edge);
      const current = occupied.get(edgeKey);
      if (current) current.count += 1;
      else occupied.set(edgeKey, { count: 1, edge });
    }
  }

  const structuralEdges = frozenSortedEdges(
    [...occupied.values()].map(({ edge }) => edge),
  );
  const structuralKeys = new Set(structuralEdges.map(unitEdgeKey));
  const missingEdges = frozenSortedEdges(
    perimeterEdges.filter((edge) => !structuralKeys.has(unitEdgeKey(edge))),
  );
  const extraEdges = frozenSortedEdges(
    structuralEdges.filter((edge) => !perimeterKeys.has(unitEdgeKey(edge))),
  );
  const duplicateEdges = frozenSortedEdges(
    [...occupied.values()]
      .filter(({ count }) => count > 1)
      .map(({ edge }) => edge),
  );
  const connectedComponents = connectedEdgeComponents(structuralEdges);
  const incompatibleDegrees = Object.freeze(
    connectedComponents
      .flatMap(({ vertexDegrees }) => vertexDegrees)
      .filter(({ degree }) => degree !== 2)
      .sort(compareVertexDegrees),
  );
  const endpoints = Object.freeze(
    incompatibleDegrees
      .filter(({ degree }) => degree === 1)
      .map(({ vertex }) => vertex),
  );
  return Object.freeze({
    closed:
      perimeterEdges.length > 0 &&
      missingEdges.length === 0 &&
      extraEdges.length === 0 &&
      duplicateEdges.length === 0 &&
      connectedComponents.every((component) => component.closed),
    connectedComponents,
    duplicateEdges,
    endpoints,
    extraEdges,
    incompatibleDegrees,
    missingEdges,
    perimeterEdges,
    structuralEdges,
  });
}

/** Normalizes only construction-relevant fields; metadata and instance IDs vanish. */
export function normalizeWorldStructureSignature(
  state: Pick<WorldStructureState, "floorCells" | "placements">,
): NormalizedWorldStructureSignature {
  const floorCells = Object.freeze(
    state.floorCells
      .map((cell) => {
        assertIntegerPoint(cell, "Célula de piso");
        return Object.freeze({ x: cell.x, y: cell.y });
      })
      .sort(compareGridPoints),
  );
  const placements = Object.freeze(
    state.placements.map(normalizePlacement).sort(compareNormalizedPlacements),
  );
  return Object.freeze({ floorCells, placements });
}

/** Stable, non-persisted serialization of the normalized construction. */
export function worldStructureSignature(
  state: Pick<WorldStructureState, "floorCells" | "placements">,
): string {
  return JSON.stringify(normalizeWorldStructureSignature(state));
}

export const CANONICAL_WORLD_STRUCTURE_V1_SIGNATURE = worldStructureSignature(
  INITIAL_WORLD_STRUCTURE,
);

export function classifyWorldStructureIdentity(
  state: WorldStructureState,
): WorldStructureIdentity {
  if (state.blueprintVersion !== INITIAL_WORLD_BLUEPRINT_VERSION)
    return "future/unknown";
  return worldStructureSignature(state) ===
    CANONICAL_WORLD_STRUCTURE_V1_SIGNATURE
    ? "canonical-v1"
    : "modified-v1";
}

function floorCellEdges(cell: FloorCell): readonly UnitEdge[] {
  return [
    unitEdge("horizontal", cell.x, cell.y),
    unitEdge("horizontal", cell.x, safeIncrement(cell.y)),
    unitEdge("vertical", cell.x, cell.y),
    unitEdge("vertical", safeIncrement(cell.x), cell.y),
  ];
}

function unitEdge(axis: EdgeAxis, x: number, y: number): UnitEdge {
  const edge = { axis, x, y };
  assertIntegerPoint(edge, "Aresta de perímetro");
  return Object.freeze(edge);
}

function safeIncrement(value: number): number {
  const result = value + 1;
  if (!Number.isSafeInteger(result))
    throw new Error("Perímetro excede os limites inteiros seguros");
  return result;
}

function frozenSortedEdges(edges: Iterable<UnitEdge>): readonly UnitEdge[] {
  return Object.freeze(
    [...edges].map((edge) => Object.freeze({ ...edge })).sort(compareUnitEdges),
  );
}

function compareUnitEdges(first: UnitEdge, second: UnitEdge): number {
  const byAxis = first.axis.localeCompare(second.axis);
  if (byAxis !== 0) return byAxis;
  const firstLine = first.axis === "horizontal" ? first.y : first.x;
  const secondLine = second.axis === "horizontal" ? second.y : second.x;
  const byLine = firstLine - secondLine;
  if (byLine !== 0) return byLine;
  const firstStart = first.axis === "horizontal" ? first.x : first.y;
  const secondStart = second.axis === "horizontal" ? second.x : second.y;
  return firstStart - secondStart;
}

function connectedEdgeComponents(
  edges: readonly UnitEdge[],
): readonly StructuralEdgeComponent[] {
  const edgesByKey = new Map(edges.map((edge) => [unitEdgeKey(edge), edge]));
  const verticesByKey = new Map<string, GridPoint>();
  const edgesByVertex = new Map<string, Set<string>>();
  for (const edge of edges) {
    for (const vertex of edgeVertices(edge)) {
      const vertexKey = gridPointKey(vertex);
      verticesByKey.set(vertexKey, vertex);
      const connected = edgesByVertex.get(vertexKey) ?? new Set<string>();
      connected.add(unitEdgeKey(edge));
      edgesByVertex.set(vertexKey, connected);
    }
  }

  const unseen = new Set(edges.map(unitEdgeKey));
  const components: StructuralEdgeComponent[] = [];
  for (const seed of edges) {
    const seedKey = unitEdgeKey(seed);
    if (!unseen.has(seedKey)) continue;
    const queue = [seedKey];
    const componentEdgeKeys = new Set<string>();
    const componentVertexKeys = new Set<string>();
    while (queue.length > 0) {
      const edgeKey = queue.shift();
      if (!edgeKey || !unseen.delete(edgeKey)) continue;
      componentEdgeKeys.add(edgeKey);
      const edge = edgesByKey.get(edgeKey);
      if (!edge) continue;
      for (const vertex of edgeVertices(edge)) {
        const vertexKey = gridPointKey(vertex);
        componentVertexKeys.add(vertexKey);
        for (const neighbour of edgesByVertex.get(vertexKey) ?? []) {
          if (unseen.has(neighbour)) queue.push(neighbour);
        }
      }
    }
    const componentEdges = frozenSortedEdges(
      [...componentEdgeKeys].flatMap((edgeKey) => {
        const edge = edgesByKey.get(edgeKey);
        return edge ? [edge] : [];
      }),
    );
    const vertexDegrees = Object.freeze(
      [...componentVertexKeys]
        .flatMap((vertexKey) => {
          const vertex = verticesByKey.get(vertexKey);
          return vertex
            ? [
                Object.freeze({
                  degree: edgesByVertex.get(vertexKey)?.size ?? 0,
                  vertex: Object.freeze({ ...vertex }),
                }),
              ]
            : [];
        })
        .sort(compareVertexDegrees),
    );
    components.push(
      Object.freeze({
        closed:
          componentEdges.length > 0 &&
          vertexDegrees.every(({ degree }) => degree === 2),
        edges: componentEdges,
        vertexDegrees,
      }),
    );
  }
  return Object.freeze(components);
}

function edgeVertices(edge: UnitEdge): readonly [GridPoint, GridPoint] {
  const start = Object.freeze({ x: edge.x, y: edge.y });
  const end = Object.freeze({
    x: edge.x + (edge.axis === "horizontal" ? 1 : 0),
    y: edge.y + (edge.axis === "vertical" ? 1 : 0),
  });
  assertIntegerPoint(start, "Endpoint estrutural");
  assertIntegerPoint(end, "Endpoint estrutural");
  return [start, end];
}

function compareVertexDegrees(
  first: PerimeterVertexDegree,
  second: PerimeterVertexDegree,
): number {
  return compareGridPoints(first.vertex, second.vertex);
}

function compareGridPoints(first: GridPoint, second: GridPoint): number {
  return first.y - second.y || first.x - second.x;
}

function gridPointKey(point: GridPoint): string {
  return `${point.x}:${point.y}`;
}

function normalizePlacement(
  placement: StructurePlacement,
): NormalizedStructurePlacement {
  const geometry = placementGeometry(placement);
  return Object.freeze({
    anchor: Object.freeze({ ...placement.anchor }),
    definitionId: placement.definitionId,
    orientation:
      geometry.kind === "corner"
        ? geometry.orientation
        : geometry.interval.axis,
    state:
      geometry.kind !== "door"
        ? null
        : placement.definitionId ===
            "architecture.wall.stone-01.door-horizontal.open"
          ? "open"
          : "closed",
  });
}

function compareNormalizedPlacements(
  first: NormalizedStructurePlacement,
  second: NormalizedStructurePlacement,
): number {
  return (
    compareGridPoints(first.anchor, second.anchor) ||
    first.definitionId.localeCompare(second.definitionId) ||
    first.orientation.localeCompare(second.orientation) ||
    (first.state ?? "").localeCompare(second.state ?? "")
  );
}

function assertIntegerPoint(point: GridPoint, label: string): void {
  if (!Number.isSafeInteger(point.x) || !Number.isSafeInteger(point.y))
    throw new Error(`${label} deve usar coordenadas inteiras seguras`);
}
