import { describe, expect, it } from "vitest";

import { CELL_SIZE, spatialWorldLayout } from "./spatialWorld";
import { composeWalls } from "./wallComposition";

const rectangle = (widthCells: number, heightCells: number) => ({
  height: heightCells * CELL_SIZE,
  width: widthCells * CELL_SIZE,
  x: 0,
  y: 0,
});

describe("compositor modular de paredes W3-A", () => {
  it("é determinístico e escolhe explicitamente os quatro cantos", () => {
    const plan = composeWalls({
      doorState: "closed",
      doorways: [],
      floorAreas: [rectangle(2, 2)],
    });
    expect(plan).toEqual(
      composeWalls({
        doorState: "closed",
        doorways: [],
        floorAreas: [rectangle(2, 2)],
      }),
    );
    expect(
      plan
        .filter((piece) => piece.edge === "corner")
        .map((piece) => piece.asset.corner)
        .sort(),
    ).toEqual(["ne", "nw", "se", "sw"]);
  });

  it("nunca troca o eixo das peças retas", () => {
    const plan = composeWalls({
      doorState: "closed",
      doorways: [],
      floorAreas: [rectangle(5, 3)],
    });
    for (const piece of plan.filter((piece) => piece.edge !== "corner")) {
      if (piece.asset.role === "segment-horizontal")
        expect(piece.asset.orientation).toBe("horizontal");
      if (piece.asset.role === "segment-vertical")
        expect(piece.asset.orientation).toBe("vertical");
    }
  });

  it("prefere quatro células e completa comprimentos pares e ímpares", () => {
    const even = composeWalls({
      doorState: "closed",
      doorways: [],
      floorAreas: [rectangle(6, 1)],
    });
    const odd = composeWalls({
      doorState: "closed",
      doorways: [],
      floorAreas: [rectangle(5, 1)],
    });
    const horizontalLengths = (plan: ReturnType<typeof composeWalls>) =>
      plan
        .filter((piece) => piece.asset.role === "segment-horizontal")
        .map((piece) => piece.asset.logicalLengthCells)
        .sort((first, second) => first - second);
    expect(horizontalLengths(even)).toEqual([2, 2, 4, 4]);
    expect(horizontalLengths(odd)).toEqual([1, 1, 4, 4]);
  });

  it("cobre cada trecho reto uma vez, sem lacuna ou duplicação lógica", () => {
    const plan = composeWalls({
      doorState: "closed",
      doorways: [],
      floorAreas: [rectangle(5, 3)],
    });
    const coverage = new Set<string>();
    for (const piece of plan.filter((piece) =>
      piece.asset.role.startsWith("segment-"),
    )) {
      const vertical = piece.asset.orientation === "vertical";
      const length = piece.asset.logicalLengthCells;
      for (let offset = 0; offset < length; offset += 1) {
        const key = vertical
          ? `${piece.edge}:${piece.x}:${piece.y + offset * CELL_SIZE}`
          : `${piece.edge}:${piece.x + offset * CELL_SIZE}:${piece.y}`;
        expect(coverage.has(key)).toBe(false);
        coverage.add(key);
      }
    }
    expect(coverage.size).toBe(16);
  });

  it("mantém abertura horizontal igual nos dois estados sem parede reta atrás", () => {
    const world = spatialWorldLayout();
    const closed = composeWalls({
      doorState: "closed",
      doorways: [world.connection.doorwayA, world.connection.doorwayB],
      floorAreas: world.floorAreas,
    });
    const open = composeWalls({
      doorState: "open",
      doorways: [world.connection.doorwayA, world.connection.doorwayB],
      floorAreas: world.floorAreas,
    });
    const doors = (plan: ReturnType<typeof composeWalls>) =>
      plan.filter((piece) => piece.edge === "door");
    expect(
      doors(closed).map(({ x, y, widthCells }) => ({ x, y, widthCells })),
    ).toEqual(
      doors(open).map(({ x, y, widthCells }) => ({ x, y, widthCells })),
    );
    expect(
      doors(open).every((piece) => piece.asset.orientation === "horizontal"),
    ).toBe(true);
    for (const door of doors(closed)) {
      expect(
        closed.some(
          (piece) =>
            piece.asset.role === "segment-horizontal" &&
            piece.y === door.y &&
            piece.x < door.x + door.widthCells * CELL_SIZE &&
            piece.x + piece.widthCells * CELL_SIZE > door.x,
        ),
      ).toBe(false);
    }
  });
});
