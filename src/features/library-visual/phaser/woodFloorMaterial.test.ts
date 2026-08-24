import { describe, expect, it } from "vitest";

import {
  WOOD_FLOOR_FILTERING,
  WOOD_FLOOR_TEXTURES,
  WOOD_FLOOR_WORLD_CELLS,
  WOOD_FLOOR_WORLD_SIZE,
  woodFloorTiles,
} from "./woodFloorMaterial";

describe("material architecture.floor.wood-01", () => {
  it("declara os quatro caminhos de runtime e a escala do material", () => {
    expect(WOOD_FLOOR_TEXTURES).toEqual({
      a: "/assets/world/architecture/floors/interior/wood-floor-01-a.png",
      b: "/assets/world/architecture/floors/interior/wood-floor-01-b.png",
      c: "/assets/world/architecture/floors/interior/wood-floor-01-c.png",
      d: "/assets/world/architecture/floors/interior/wood-floor-01-d.png",
    });
    expect(WOOD_FLOOR_WORLD_SIZE).toBe(320);
    expect(WOOD_FLOOR_WORLD_CELLS).toBe(10);
    expect(WOOD_FLOOR_FILTERING).toBe("LINEAR");
  });

  it("distribui variantes por coordenadas de forma determinística", () => {
    const space = { height: 320, width: 640, x: 0, y: 0 };
    expect(woodFloorTiles(space)).toEqual([
      { height: 320, variant: "a", width: 320, x: 0, y: 0 },
      { height: 320, variant: "c", width: 320, x: 320, y: 0 },
    ]);
    expect(woodFloorTiles({ height: 320, width: 640, x: 0, y: 320 })).toEqual([
      { height: 320, variant: "b", width: 320, x: 0, y: 320 },
      { height: 320, variant: "d", width: 320, x: 320, y: 320 },
    ]);
  });
});
