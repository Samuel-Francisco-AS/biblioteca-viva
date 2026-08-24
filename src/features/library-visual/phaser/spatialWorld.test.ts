import { describe, expect, it } from "vitest";

import {
  CAMERA_PAN_THRESHOLD,
  CELL_SIZE,
  CORRIDOR_WIDTH,
  DOOR_WIDTH,
  WALL_THICKNESS,
  EXTERIOR_CAMERA_MARGIN,
  CameraPanPolicy,
  cameraBoundsFor,
  clampCameraScroll,
  initialCameraScroll,
  rectanglesOverlap,
  spatialWorldLayout,
} from "./spatialWorld";

describe("spike espacial W1", () => {
  const viewport = { height: 640, width: 360 };
  const world = spatialWorldLayout();

  it("fixa a malha e os dois espaços neutros na escala W1", () => {
    expect(CELL_SIZE).toBe(32);
    expect(WALL_THICKNESS).toBe(CELL_SIZE);
    expect(DOOR_WIDTH).toBe(CELL_SIZE * 2);
    expect(CORRIDOR_WIDTH).toBe(CELL_SIZE * 3);
    expect(world.spaceA).toEqual({ height: 288, width: 384, x: 96, y: 128 });
    expect(world.spaceB).toEqual({ height: 256, width: 320, x: 480, y: 416 });
    expect(world.connection.corridor.width).toBe(CORRIDOR_WIDTH);
    expect(world.connection.doorwayA.floor.width).toBe(DOOR_WIDTH);
    expect(world.connection.doorwayB.floor.height).toBe(DOOR_WIDTH);
  });

  it("mantém A e B próximos, com uma conexão contínua e curta em L", () => {
    expect(rectanglesOverlap(world.spaceA, world.spaceB)).toBe(false);
    expect(world.spaceA.x).toBeLessThan(world.spaceB.x);
    expect(world.spaceA.y).toBeLessThan(world.spaceB.y);
    expect(world.connection.doorwayA.floor.y).toBe(
      world.spaceA.y + world.spaceA.height,
    );
    expect(
      world.connection.doorwayB.floor.x + world.connection.doorwayB.floor.width,
    ).toBe(world.spaceB.x);
    expect(world.connection.turn.y).toBeGreaterThan(
      world.connection.corridor.y,
    );
    expect(
      world.connection.corridor.y + world.connection.corridor.height,
    ).toBeGreaterThan(world.connection.turn.y);
    expect(world.connection.turn.x + world.connection.turn.width).toBe(
      world.spaceB.x,
    );
    expect(world.floorAreas).toHaveLength(6);
  });

  it("deriva bounds finitos com perímetro exterior configurado", () => {
    expect(EXTERIOR_CAMERA_MARGIN).toBe(CELL_SIZE * 4);
    expect(world.bounds).toEqual({ height: 864, width: 1024, x: -64, y: -32 });
    expect(world.bounds.width).toBeGreaterThan(viewport.width);
    expect(world.bounds.height).toBeGreaterThan(viewport.height);
    expect(world.bounds.x).toBeLessThan(world.spaceA.x - WALL_THICKNESS);
    expect(world.bounds.y).toBeLessThan(world.spaceA.y - WALL_THICKNESS);
  });

  it("inicia em A, deslocado para a saída, sem revelar o mundo inteiro", () => {
    expect(initialCameraScroll(world, viewport)).toEqual({ x: 199.2, y: 96 });
    expect(initialCameraScroll(world, viewport).x).toBeGreaterThan(
      world.bounds.x,
    );
    expect(initialCameraScroll(world, viewport).y).toBeGreaterThanOrEqual(
      world.bounds.y,
    );
  });

  it("clampa a câmera nos limites X e Y após resize", () => {
    expect(
      clampCameraScroll({ x: 9_999, y: -20 }, world.bounds, viewport),
    ).toEqual({ x: 600, y: -20 });
    expect(
      clampCameraScroll({ x: 0, y: 9_999 }, world.bounds, viewport),
    ).toEqual({ x: 0, y: 192 });
    const samples = [
      initialCameraScroll(world, viewport),
      { x: world.bounds.x, y: world.bounds.y },
      clampCameraScroll(
        { x: Number.MAX_SAFE_INTEGER, y: world.bounds.y },
        world.bounds,
        viewport,
      ),
      clampCameraScroll(
        { x: 320, y: world.connection.turn.y - 160 },
        world.bounds,
        viewport,
      ),
      clampCameraScroll(
        {
          x: world.connection.doorwayB.floor.x,
          y: world.connection.doorwayB.floor.y - 256,
        },
        world.bounds,
        viewport,
      ),
      clampCameraScroll(
        { x: 320, y: Number.MAX_SAFE_INTEGER },
        world.bounds,
        viewport,
      ),
    ];

    for (const scroll of samples) {
      expect(scroll.x).toBeGreaterThanOrEqual(world.bounds.x);
      expect(scroll.y).toBeGreaterThanOrEqual(world.bounds.y);
    }
  });

  it("preserva intervalo vertical real em viewport alta e após resize", () => {
    const tallViewport = { height: 800, width: 360 };
    const bounds = cameraBoundsFor(world.bounds, tallViewport);
    expect(bounds.height - tallViewport.height).toBe(
      EXTERIOR_CAMERA_MARGIN * 2,
    );
    expect(clampCameraScroll({ x: 0, y: -9_999 }, bounds, tallViewport).y).toBe(
      bounds.y,
    );
    expect(clampCameraScroll({ x: 0, y: 9_999 }, bounds, tallViewport).y).toBe(
      bounds.y + bounds.height - tallViewport.height,
    );
    expect(bounds.height - tallViewport.height).toBeGreaterThan(0);
  });

  it("só inicia pan após o limiar e limpa o gesto no cancelamento", () => {
    const pan = new CameraPanPolicy();
    pan.begin(7, 100, 100, { x: 50, y: 75 });
    expect(pan.move(7, 100 + CAMERA_PAN_THRESHOLD, 100)).toBeUndefined();
    expect(pan.move(7, 116, 128)).toEqual({ x: 34, y: 47 });
    expect(pan.end(7)).toBe(true);
    pan.begin(8, 0, 0, { x: 0, y: 0 });
    pan.cancel();
    expect(pan.end(8)).toBe(false);
  });
});
