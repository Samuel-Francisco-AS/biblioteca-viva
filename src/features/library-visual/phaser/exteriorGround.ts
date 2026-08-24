import { CELL_SIZE, type WorldRectangle } from "./spatialWorld";

export const EXTERIOR_GROUND_TEXTURES = {
  a: "/assets/world/architecture/floors/exterior/exterior-ground-01-a.png",
  b: "/assets/world/architecture/floors/exterior/exterior-ground-01-b.png",
  c: "/assets/world/architecture/floors/exterior/exterior-ground-01-c.png",
  d: "/assets/world/architecture/floors/exterior/exterior-ground-01-d.png",
} as const;
export const EXTERIOR_GROUND_WORLD_SIZE = CELL_SIZE * 2;
export const EXTERIOR_GROUND_SOURCE_SIZE = 1280;
export const EXTERIOR_GROUND_CROP_SIZE = EXTERIOR_GROUND_SOURCE_SIZE / 2;
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
  readonly cropX: number;
  readonly cropY: number;
  readonly x: number;
  readonly y: number;
  readonly variant: ExteriorGroundVariant;
}[] {
  const size = EXTERIOR_GROUND_WORLD_SIZE;
  const startX = Math.floor(bounds.x / size) * size;
  const startY = Math.floor(bounds.y / size) * size;
  const result = [] as {
    cropX: number;
    cropY: number;
    x: number;
    y: number;
    variant: ExteriorGroundVariant;
  }[];
  for (let y = startY; y < bounds.y + bounds.height; y += size) {
    for (let x = startX; x < bounds.x + bounds.width; x += size) {
      result.push({
        cropX: exteriorGroundCropOffset(x / size, y / size, 0x51),
        cropY: exteriorGroundCropOffset(x / size, y / size, 0xa7),
        x,
        y,
        variant: exteriorGroundVariantAt(x / size, y / size),
      });
    }
  }
  return Object.freeze(result);
}

function exteriorGroundCropOffset(
  cellX: number,
  cellY: number,
  salt: number,
): number {
  const hash =
    Math.imul(cellX, 0x9e3779b1) ^ Math.imul(cellY, 0x85ebca6b) ^ salt;
  return (hash >>> 0) % 2 === 0 ? 0 : EXTERIOR_GROUND_CROP_SIZE;
}
