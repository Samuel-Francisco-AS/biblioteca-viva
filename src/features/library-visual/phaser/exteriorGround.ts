import { CELL_SIZE, type WorldRectangle } from "./spatialWorld";

export const EXTERIOR_GROUND_TEXTURES = {
  a: "/assets/world/architecture/floors/exterior/exterior-ground-01-a.png",
  b: "/assets/world/architecture/floors/exterior/exterior-ground-01-b.png",
  c: "/assets/world/architecture/floors/exterior/exterior-ground-01-c.png",
  d: "/assets/world/architecture/floors/exterior/exterior-ground-01-d.png",
} as const;
/** Full source textures remove the visible 64-unit crop grid. */
export const EXTERIOR_GROUND_WORLD_SIZE = CELL_SIZE * 8;
export const EXTERIOR_GROUND_FILTERING = "LINEAR" as const;
export type ExteriorGroundVariant = keyof typeof EXTERIOR_GROUND_TEXTURES;

/** Coordinate hash: stable, inexpensive and deliberately not checkerboard-like. */
export function exteriorGroundVariantAt(
  cellX: number,
  cellY: number,
): ExteriorGroundVariant {
  let hash = Math.imul(cellX, 0x45d9f3b) ^ Math.imul(cellY, 0x27d4eb2d);
  hash ^= hash >>> 16;
  return (["a", "c", "d", "b"] as const)[(hash >>> 0) % 4];
}

export function exteriorGroundTiles(bounds: WorldRectangle): readonly {
  readonly x: number;
  readonly y: number;
  readonly variant: ExteriorGroundVariant;
}[] {
  const size = EXTERIOR_GROUND_WORLD_SIZE;
  const startX = Math.floor(bounds.x / size) * size;
  const startY = Math.floor(bounds.y / size) * size;
  const result = [] as {
    x: number;
    y: number;
    variant: ExteriorGroundVariant;
  }[];
  for (let y = startY; y < bounds.y + bounds.height; y += size) {
    for (let x = startX; x < bounds.x + bounds.width; x += size) {
      result.push({
        x,
        y,
        variant: exteriorGroundVariantAt(x / size, y / size),
      });
    }
  }
  return Object.freeze(result);
}
