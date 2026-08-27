import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  placementEdges,
  structuralInventory,
  structureDefinition,
  unitEdgeKey,
  validateStructureCatalog,
  validateWorldStructure,
  worldBounds,
} from "./worldStructure";

describe("W3 structural model", () => {
  it("has a validated, unique catalog and explicit four-cell corners", () => {
    expect(validateStructureCatalog()).toBe(true);
    expect(
      structureDefinition("architecture.wall.stone-01.corner-ne")
        ?.visualSpanCells,
    ).toBe(4);
    expect(
      structureDefinition("architecture.wall.stone-01.door-horizontal.closed")
        ?.orientation,
    ).toBe("horizontal");
  });

  it("has a continuous initial rectangle with no shared structural edge", () => {
    expect(validateWorldStructure(INITIAL_WORLD_STRUCTURE)).toBe(true);
    expect(INITIAL_WORLD_STRUCTURE.floorCells).toHaveLength(120);
    const edges = INITIAL_WORLD_STRUCTURE.placements.flatMap(placementEdges);
    expect(new Set(edges.map(unitEdgeKey)).size).toBe(edges.length);
    expect(worldBounds(INITIAL_WORLD_STRUCTURE)).toEqual({
      x: 96,
      y: 128,
      width: 384,
      height: 320,
    });
  });

  it("derives grant, placed and available amounts without negative inventory", () => {
    const inventory = structuralInventory(INITIAL_WORLD_STRUCTURE);
    expect(inventory.placed["architecture.floor.wood-01"]).toBe(120);
    expect(inventory.available["architecture.floor.wood-01"]).toBe(24);
    expect(inventory.available["architecture.wall.stone-01.horizontal-4"]).toBe(
      1,
    );
    expect(
      inventory.available["architecture.wall.stone-01.door-horizontal.closed"],
    ).toBe(0);
  });
});
