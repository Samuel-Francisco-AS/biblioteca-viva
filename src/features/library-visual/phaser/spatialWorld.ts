export const CELL_SIZE = 32;
export const WALL_THICKNESS = CELL_SIZE;
export const DOOR_WIDTH = CELL_SIZE * 2;
export const CORRIDOR_WIDTH = CELL_SIZE * 3;

/** Navigable exterior revealed around the building; intentionally finite. */
export const EXTERIOR_CAMERA_MARGIN = CELL_SIZE * 4;

export interface WorldSize {
  readonly height: number;
  readonly width: number;
}

export interface WorldRectangle {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export interface SpatialDoorway {
  /** Free floor immediately outside a two-cell architectural opening. */
  readonly floor: WorldRectangle;
  /** W3-A supports only a wall parallel to the X axis. */
  readonly orientation: "south";
  /** Logical wall line occupied by the matching open/closed door asset. */
  readonly wall: Pick<WorldRectangle, "width" | "x" | "y">;
}

export interface SpatialWorldLayout {
  readonly bounds: WorldRectangle;
  readonly connection: {
    readonly corridor: WorldRectangle;
    readonly doorwayA: SpatialDoorway;
    readonly doorwayB: SpatialDoorway;
    readonly turn: WorldRectangle;
  };
  readonly floorAreas: readonly WorldRectangle[];
  readonly spaceA: WorldRectangle;
  readonly spaceB: WorldRectangle;
  readonly placementSpaces: Readonly<
    Record<"space-a" | "space-b", WorldRectangle>
  >;
}

export interface CameraScroll {
  readonly x: number;
  readonly y: number;
}

/** Retains only the newest input value until the next render-frame consumer. */
export class LatestValue<T> {
  private latest?: T;

  push(value: T): void {
    this.latest = value;
  }

  take(): T | undefined {
    const value = this.latest;
    this.latest = undefined;
    return value;
  }

  clear(): void {
    this.latest = undefined;
  }
}

export interface ViewportComposition {
  /** Portion of the viewport occupied by its largest connected floor shape. */
  readonly largestConnectedFloorRatio: number;
  /** The central half of the viewport remains attached to the building. */
  readonly reachesViewportCenter: boolean;
}

/**
 * Compatibility projection of the persistent W3 blueprint. The legacy space
 * keys remain only so W2 transforms can be recovered without changing schema.
 */
export function spatialWorldLayout(): SpatialWorldLayout {
  const spaceA = cells(3, 4, 12, 10);
  const spaceB = spaceA;
  const doorwayA: SpatialDoorway = {
    floor: cells(8, 13, 2, 1),
    orientation: "south",
    wall: { width: DOOR_WIDTH, x: 8 * CELL_SIZE, y: 14 * CELL_SIZE },
  };
  const doorwayB = doorwayA;
  const corridor = cells(8, 13, 2, 1);
  const turn = corridor;
  const floorAreas = [spaceA] as const;

  return {
    bounds: boundsForFloorAreas(floorAreas),
    connection: { corridor, doorwayA, doorwayB, turn },
    floorAreas,
    spaceA,
    spaceB,
    placementSpaces: Object.freeze({ "space-a": spaceA, "space-b": spaceB }),
  };
}

export function initialCameraScroll(
  world: SpatialWorldLayout,
  viewport: WorldSize,
): CameraScroll {
  const preferred = {
    x: world.spaceA.x + world.spaceA.width - viewport.width * 0.78,
    y: world.spaceA.y + world.spaceA.height - viewport.height * 0.5,
  };
  return clampCameraScroll(
    preferred,
    cameraBoundsFor(world.bounds, viewport),
    viewport,
  );
}

/**
 * Keeps the configured exterior perimeter traversable even when a tall mobile
 * viewport is close to (or taller than) the building itself.
 */
export function cameraBoundsFor(
  worldBounds: WorldRectangle,
  viewport: WorldSize,
): WorldRectangle {
  return expandBoundsToAtLeast(
    worldBounds,
    viewport.width + EXTERIOR_CAMERA_MARGIN * 2,
    viewport.height + EXTERIOR_CAMERA_MARGIN * 2,
  );
}

export function clampCameraScroll(
  scroll: CameraScroll,
  bounds: WorldRectangle,
  viewport: WorldSize,
): CameraScroll {
  return {
    x: clamp(
      scroll.x,
      bounds.x,
      bounds.x + Math.max(0, bounds.width - viewport.width),
    ),
    y: clamp(
      scroll.y,
      bounds.y,
      bounds.y + Math.max(0, bounds.height - viewport.height),
    ),
  };
}

/**
 * A deliberately coarse, pure guard against camera positions that show only
 * exterior with disconnected slivers of the building at their edges. It is a
 * layout invariant, not a pixel or screenshot assertion.
 */
export function viewportComposition(
  world: SpatialWorldLayout,
  scroll: CameraScroll,
  viewport: WorldSize,
): ViewportComposition {
  const visible = { height: viewport.height, width: viewport.width, ...scroll };
  const visibleCells = floorCellsInRectangle(world.floorAreas, visible);
  const largestConnectedFloorRatio =
    largestConnectedCellCount(visibleCells) /
    ((viewport.width / CELL_SIZE) * (viewport.height / CELL_SIZE));
  const centralArea = {
    height: viewport.height / 2,
    width: viewport.width / 2,
    x: scroll.x + viewport.width / 4,
    y: scroll.y + viewport.height / 4,
  };
  return {
    largestConnectedFloorRatio,
    reachesViewportCenter: world.floorAreas.some((area) =>
      rectanglesOverlap(area, centralArea),
    ),
  };
}

export function rectanglesOverlap(
  first: WorldRectangle,
  second: WorldRectangle,
): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

export class CameraPanPolicy {
  private pending?: {
    readonly pointerId: number;
    readonly scroll: CameraScroll;
    readonly x: number;
    readonly y: number;
  };
  private panning = false;

  begin(pointerId: number, x: number, y: number, scroll: CameraScroll): void {
    this.pending = { pointerId, scroll, x, y };
    this.panning = false;
  }

  move(pointerId: number, x: number, y: number): CameraScroll | undefined {
    const pending = this.pending;
    if (!pending || pending.pointerId !== pointerId) return undefined;
    const deltaX = x - pending.x;
    const deltaY = y - pending.y;
    if (!this.panning && Math.hypot(deltaX, deltaY) <= CAMERA_PAN_THRESHOLD)
      return undefined;
    this.panning = true;
    return { x: pending.scroll.x - deltaX, y: pending.scroll.y - deltaY };
  }

  end(pointerId: number): boolean {
    if (!this.pending || this.pending.pointerId !== pointerId) return false;
    const wasPanning = this.panning;
    this.cancel();
    return wasPanning;
  }

  cancel(): void {
    this.pending = undefined;
    this.panning = false;
  }
}

/** Keeps taps distinct while removing the perceptible mobile drag deadzone. */
export const CAMERA_PAN_THRESHOLD = 6;

function boundsForFloorAreas(
  floorAreas: readonly WorldRectangle[],
): WorldRectangle {
  const left = Math.min(...floorAreas.map((area) => area.x)) - WALL_THICKNESS;
  const top = Math.min(...floorAreas.map((area) => area.y)) - WALL_THICKNESS;
  const right =
    Math.max(...floorAreas.map((area) => area.x + area.width)) + WALL_THICKNESS;
  const bottom =
    Math.max(...floorAreas.map((area) => area.y + area.height)) +
    WALL_THICKNESS;
  return {
    height: bottom - top + EXTERIOR_CAMERA_MARGIN * 2,
    width: right - left + EXTERIOR_CAMERA_MARGIN * 2,
    x: left - EXTERIOR_CAMERA_MARGIN,
    y: top - EXTERIOR_CAMERA_MARGIN,
  };
}

function expandBoundsToAtLeast(
  bounds: WorldRectangle,
  minimumWidth: number,
  minimumHeight: number,
): WorldRectangle {
  const width = Math.max(bounds.width, minimumWidth);
  const height = Math.max(bounds.height, minimumHeight);
  return {
    width,
    height,
    x: bounds.x - (width - bounds.width) / 2,
    y: bounds.y - (height - bounds.height) / 2,
  };
}

function cells(
  x: number,
  y: number,
  width: number,
  height: number,
): WorldRectangle {
  return {
    height: height * CELL_SIZE,
    width: width * CELL_SIZE,
    x: x * CELL_SIZE,
    y: y * CELL_SIZE,
  };
}

function floorCellsInRectangle(
  floorAreas: readonly WorldRectangle[],
  visible: WorldRectangle,
): Set<string> {
  const result = new Set<string>();
  for (const area of floorAreas) {
    const left = Math.max(area.x, visible.x) / CELL_SIZE;
    const top = Math.max(area.y, visible.y) / CELL_SIZE;
    const right =
      Math.min(area.x + area.width, visible.x + visible.width) / CELL_SIZE;
    const bottom =
      Math.min(area.y + area.height, visible.y + visible.height) / CELL_SIZE;
    for (let y = Math.ceil(top); y < Math.floor(bottom); y += 1) {
      for (let x = Math.ceil(left); x < Math.floor(right); x += 1) {
        result.add(`${x}:${y}`);
      }
    }
  }
  return result;
}

function largestConnectedCellCount(cells: ReadonlySet<string>): number {
  const visited = new Set<string>();
  let largest = 0;
  for (const cell of cells) {
    if (visited.has(cell)) continue;
    const component = [cell];
    visited.add(cell);
    let count = 0;
    while (component.length > 0) {
      const current = component.pop();
      if (!current) continue;
      count += 1;
      const [x, y] = current.split(":").map(Number);
      for (const neighbor of [
        `${x - 1}:${y}`,
        `${x + 1}:${y}`,
        `${x}:${y - 1}`,
        `${x}:${y + 1}`,
      ]) {
        if (cells.has(neighbor) && !visited.has(neighbor)) {
          visited.add(neighbor);
          component.push(neighbor);
        }
      }
    }
    largest = Math.max(largest, count);
  }
  return largest;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
