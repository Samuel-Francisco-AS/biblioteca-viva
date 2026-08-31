import {
  CELL_SIZE,
  type SpatialDoorway,
  type WorldRectangle,
} from "./spatialWorld";
import {
  wallAsset,
  type WallAssetDefinition,
  type WallCorner,
  type WallDepthPolicy,
  type WallOrientation,
} from "./wallAssets";

export type WallDoorState = "closed" | "open";
export type WallEdge = "east" | "north" | "south" | "west";

export interface WallRenderPiece {
  readonly asset: WallAssetDefinition;
  readonly edge: WallEdge | "corner" | "door";
  readonly heightCells: number;
  readonly key: string;
  readonly widthCells: number;
  readonly x: number;
  readonly y: number;
}

export interface WallCompositionInput {
  readonly doorState: WallDoorState;
  readonly doorways: readonly SpatialDoorway[];
  readonly floorAreas: readonly WorldRectangle[];
}

/**
 * Pure W3-A composition: floor-cell geometry is the source of truth; this
 * module only chooses declared art pieces and never inspects image pixels.
 */
export function composeWalls(
  input: WallCompositionInput,
): readonly WallRenderPiece[] {
  const floor = floorCellKeys(input.floorAreas);
  const segments = exposedWallRuns(floor, input.doorways).flatMap((run) =>
    composeRun(run),
  );
  const corners = convexCorners(floor).map((corner) => composeCorner(corner));
  const doors = input.doorways.map((doorway, index) =>
    composeDoorway(doorway, input.doorState, index),
  );
  return Object.freeze(
    [...segments, ...corners, ...doors].sort((first, second) =>
      first.key.localeCompare(second.key),
    ),
  );
}

/** Depth is explicit and based on world Y, never insertion order. */
export function wallPieceDepth(piece: WallRenderPiece): number {
  const policy: WallDepthPolicy = piece.asset.depthPolicy;
  return (policy === "architecture-front" ? 50 : 10) + piece.y;
}

interface WallRun {
  readonly edge: WallEdge;
  readonly lengthCells: number;
  readonly orientation: WallOrientation;
  readonly x: number;
  readonly y: number;
}

function composeRun(run: WallRun): readonly WallRenderPiece[] {
  const result: WallRenderPiece[] = [];
  let remaining = run.lengthCells;
  let offset = 0;
  for (const length of [4, 2, 1] as const) {
    while (remaining >= length) {
      const asset = segmentAsset(run.orientation, length);
      const x =
        run.x + (run.orientation === "horizontal" ? offset * CELL_SIZE : 0);
      const y =
        run.y + (run.orientation === "vertical" ? offset * CELL_SIZE : 0);
      result.push({
        asset,
        edge: run.edge,
        heightCells: run.orientation === "vertical" ? length : 1,
        key: `segment:${run.edge}:${x}:${y}:${length}`,
        widthCells: run.orientation === "horizontal" ? length : 1,
        x,
        y,
      });
      remaining -= length;
      offset += length;
    }
  }
  return result;
}

function composeCorner(corner: {
  readonly corner: WallCorner;
  readonly x: number;
  readonly y: number;
}): WallRenderPiece {
  const asset = requiredAsset(
    `architecture.wall.stone-01.corner-${corner.corner}`,
  );
  return {
    asset,
    edge: "corner",
    heightCells: asset.logicalLengthCells,
    key: `corner:${corner.corner}:${corner.x}:${corner.y}`,
    widthCells: asset.logicalLengthCells,
    x: corner.x,
    y: corner.y,
  };
}

function composeDoorway(
  doorway: SpatialDoorway,
  state: WallDoorState,
  index: number,
): WallRenderPiece {
  const asset = requiredAsset(
    `architecture.wall.stone-01.door-horizontal.${state}`,
  );
  return {
    asset,
    edge: "door",
    heightCells: 1,
    key: `door:${index}:${state}:${doorway.wall.x}:${doorway.wall.y}`,
    widthCells: doorway.wall.width / CELL_SIZE,
    x: doorway.wall.x,
    y: doorway.wall.y,
  };
}

function segmentAsset(
  orientation: WallOrientation,
  length: 1 | 2 | 4,
): WallAssetDefinition {
  return requiredAsset(`architecture.wall.stone-01.${orientation}-${length}`);
}

function requiredAsset(id: string): WallAssetDefinition {
  const asset = wallAsset(id);
  if (!asset) throw new Error(`Asset de parede não registrado: ${id}`);
  return asset;
}

function exposedWallRuns(
  floor: ReadonlySet<string>,
  doorways: readonly SpatialDoorway[],
): readonly WallRun[] {
  const horizontal = new Map<string, number[]>();
  const vertical = new Map<string, number[]>();
  const horizontalOpenings = new Set<string>();
  for (const doorway of doorways) {
    for (
      let x = doorway.wall.x / CELL_SIZE;
      x < (doorway.wall.x + doorway.wall.width) / CELL_SIZE;
      x += 1
    )
      horizontalOpenings.add(`${x}:${doorway.wall.y / CELL_SIZE}`);
  }
  for (const key of floor) {
    const { x, y } = parseCellKey(key);
    if (!floor.has(cellKey(x, y - 1)) && !horizontalOpenings.has(`${x}:${y}`))
      addLineCell(horizontal, `north:${y}`, x);
    if (!floor.has(cellKey(x, y + 1)))
      if (!horizontalOpenings.has(`${x}:${y + 1}`))
        addLineCell(horizontal, `south:${y + 1}`, x);
    if (!floor.has(cellKey(x - 1, y))) addLineCell(vertical, `west:${x}`, y);
    if (!floor.has(cellKey(x + 1, y)))
      addLineCell(vertical, `east:${x + 1}`, y);
  }
  return Object.freeze([
    ...runsFromLines(horizontal, "horizontal"),
    ...runsFromLines(vertical, "vertical"),
  ]);
}

function runsFromLines(
  lines: ReadonlyMap<string, readonly number[]>,
  orientation: WallOrientation,
): readonly WallRun[] {
  const runs: WallRun[] = [];
  for (const [line, coordinates] of [...lines].sort(([first], [second]) =>
    first.localeCompare(second),
  )) {
    const [edge, fixed] = line.split(":") as [WallEdge, string];
    const sorted = [...coordinates].sort((first, second) => first - second);
    let start = sorted[0];
    let previous = sorted[0];
    for (const coordinate of sorted.slice(1)) {
      if (coordinate === previous + 1) {
        previous = coordinate;
        continue;
      }
      runs.push(createRun(edge, orientation, Number(fixed), start, previous));
      start = coordinate;
      previous = coordinate;
    }
    if (start !== undefined && previous !== undefined)
      runs.push(createRun(edge, orientation, Number(fixed), start, previous));
  }
  return runs;
}

function createRun(
  edge: WallEdge,
  orientation: WallOrientation,
  fixed: number,
  start: number,
  end: number,
): WallRun {
  return {
    edge,
    lengthCells: end - start + 1,
    orientation,
    x: (orientation === "horizontal" ? start : fixed) * CELL_SIZE,
    y: (orientation === "vertical" ? start : fixed) * CELL_SIZE,
  };
}

function convexCorners(floor: ReadonlySet<string>): readonly {
  readonly corner: WallCorner;
  readonly x: number;
  readonly y: number;
}[] {
  const vertices = new Set<string>();
  for (const key of floor) {
    const { x, y } = parseCellKey(key);
    for (const vertex of [
      cellKey(x, y),
      cellKey(x + 1, y),
      cellKey(x, y + 1),
      cellKey(x + 1, y + 1),
    ])
      vertices.add(vertex);
  }
  const result = [] as {
    corner: WallCorner;
    x: number;
    y: number;
  }[];
  for (const vertex of vertices) {
    const { x, y } = parseCellKey(vertex);
    const quadrants = {
      ne: floor.has(cellKey(x, y - 1)),
      nw: floor.has(cellKey(x - 1, y - 1)),
      se: floor.has(cellKey(x, y)),
      sw: floor.has(cellKey(x - 1, y)),
    };
    if (Object.values(quadrants).filter(Boolean).length !== 1) continue;
    const corner = quadrants.ne
      ? "sw"
      : quadrants.nw
        ? "se"
        : quadrants.se
          ? "nw"
          : "ne";
    result.push({ corner, x: x * CELL_SIZE, y: y * CELL_SIZE });
  }
  return result.sort((first, second) =>
    `${first.y}:${first.x}:${first.corner}`.localeCompare(
      `${second.y}:${second.x}:${second.corner}`,
    ),
  );
}

function floorCellKeys(floorAreas: readonly WorldRectangle[]): Set<string> {
  const cells = new Set<string>();
  for (const area of floorAreas) {
    for (
      let y = area.y / CELL_SIZE;
      y < (area.y + area.height) / CELL_SIZE;
      y += 1
    ) {
      for (
        let x = area.x / CELL_SIZE;
        x < (area.x + area.width) / CELL_SIZE;
        x += 1
      )
        cells.add(cellKey(x, y));
    }
  }
  return cells;
}

function addLineCell(
  lines: Map<string, number[]>,
  line: string,
  coordinate: number,
): void {
  const current = lines.get(line);
  if (current) current.push(coordinate);
  else lines.set(line, [coordinate]);
}

function cellKey(x: number, y: number): string {
  return `${x}:${y}`;
}

function parseCellKey(key: string): { readonly x: number; readonly y: number } {
  const [x, y] = key.split(":");
  return { x: Number(x), y: Number(y) };
}
