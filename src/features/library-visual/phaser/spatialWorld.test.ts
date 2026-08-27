import { describe, expect, it } from "vitest";

import {
  CAMERA_PAN_THRESHOLD,
  CELL_SIZE,
  CORRIDOR_WIDTH,
  DOOR_WIDTH,
  WALL_THICKNESS,
  EXTERIOR_CAMERA_MARGIN,
  CameraPanPolicy,
  LatestValue,
  cameraBoundsFor,
  clampCameraScroll,
  initialCameraScroll,
  spatialWorldLayout,
} from "./spatialWorld";

describe("projeção espacial W3", () => {
  const viewport = { height: 640, width: 360 };
  const world = spatialWorldLayout();

  it("projeta o cômodo inicial persistente na escala do grid", () => {
    expect(CELL_SIZE).toBe(32);
    expect(WALL_THICKNESS).toBe(CELL_SIZE);
    expect(DOOR_WIDTH).toBe(CELL_SIZE * 2);
    expect(CORRIDOR_WIDTH).toBe(CELL_SIZE * 3);
    expect(world.spaceA).toEqual({ height: 320, width: 384, x: 96, y: 128 });
    expect(world.floorAreas).toEqual([world.spaceA]);
    expect(world.spaceB).toEqual(world.spaceA);
    expect(world.connection.doorwayA.floor.width).toBe(DOOR_WIDTH);
    expect(world.connection.doorwayB.floor.width).toBe(DOOR_WIDTH);
    expect(world.connection.doorwayB.orientation).toBe("south");
  });

  it("mantém a abertura horizontal dentro do único cômodo", () => {
    expect(world.connection.doorwayA.orientation).toBe("south");
    expect(world.connection.doorwayA.floor).toEqual({
      height: 32,
      width: 64,
      x: 256,
      y: 416,
    });
    expect(world.connection.doorwayA.wall.y).toBe(448);
  });

  it("deriva bounds finitos com perímetro exterior configurado", () => {
    expect(EXTERIOR_CAMERA_MARGIN).toBe(CELL_SIZE * 4);
    expect(world.bounds).toEqual({ height: 640, width: 704, x: -64, y: -32 });
    expect(world.bounds.width).toBeGreaterThan(viewport.width);
    expect(world.bounds.height).toBeGreaterThanOrEqual(viewport.height);
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
    ).toEqual({ x: 280, y: -32 });
    expect(
      clampCameraScroll({ x: 0, y: 9_999 }, world.bounds, viewport),
    ).toEqual({ x: 0, y: -32 });
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

  it("retém somente a posição de drag mais recente até o próximo frame", () => {
    const latest = new LatestValue<{
      readonly x: number;
      readonly y: number;
    }>();
    latest.push({ x: 32, y: 64 });
    latest.push({ x: 96, y: 128 });
    expect(latest.take()).toEqual({ x: 96, y: 128 });
    expect(latest.take()).toBeUndefined();
    latest.push({ x: 160, y: 192 });
    latest.clear();
    expect(latest.take()).toBeUndefined();
  });
});
