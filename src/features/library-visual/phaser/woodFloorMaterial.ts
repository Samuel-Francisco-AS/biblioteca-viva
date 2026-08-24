import type { WorldRectangle } from "./spatialWorld";

export const WOOD_FLOOR_WORLD_SIZE = 320;
export const WOOD_FLOOR_WORLD_CELLS = 10;
export const WOOD_FLOOR_FILTERING = "LINEAR" as const;

const woodFloorVariants = ["a", "b", "c", "d"] as const;

export type WoodFloorVariant = (typeof woodFloorVariants)[number];

export interface WoodFloorTile {
  readonly height: number;
  readonly variant: WoodFloorVariant;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export const WOOD_FLOOR_TEXTURES: Readonly<Record<WoodFloorVariant, string>> =
  Object.freeze({
    a: "/assets/world/architecture/floors/interior/wood-floor-01-a.png",
    b: "/assets/world/architecture/floors/interior/wood-floor-01-b.png",
    c: "/assets/world/architecture/floors/interior/wood-floor-01-c.png",
    d: "/assets/world/architecture/floors/interior/wood-floor-01-d.png",
  });

export function woodFloorTiles(
  space: WorldRectangle,
): readonly WoodFloorTile[] {
  const startX =
    Math.floor(space.x / WOOD_FLOOR_WORLD_SIZE) * WOOD_FLOOR_WORLD_SIZE;
  const startY =
    Math.floor(space.y / WOOD_FLOOR_WORLD_SIZE) * WOOD_FLOOR_WORLD_SIZE;
  const endX = space.x + space.width;
  const endY = space.y + space.height;
  const tiles: WoodFloorTile[] = [];

  for (let y = startY; y < endY; y += WOOD_FLOOR_WORLD_SIZE) {
    for (let x = startX; x < endX; x += WOOD_FLOOR_WORLD_SIZE) {
      tiles.push({
        height: Math.min(WOOD_FLOOR_WORLD_SIZE, endY - y),
        variant: woodFloorVariantAt(x, y),
        width: Math.min(WOOD_FLOOR_WORLD_SIZE, endX - x),
        x,
        y,
      });
    }
  }

  return tiles;
}

function woodFloorVariantAt(x: number, y: number): WoodFloorVariant {
  const tileX = Math.floor(x / WOOD_FLOOR_WORLD_SIZE);
  const tileY = Math.floor(y / WOOD_FLOOR_WORLD_SIZE);
  const index = positiveModulo(tileX * 2 + tileY, woodFloorVariants.length);
  return woodFloorVariants[index];
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
