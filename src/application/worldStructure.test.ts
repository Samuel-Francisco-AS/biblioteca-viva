import { describe, expect, it } from "vitest";
import {
  STRUCTURAL_INVENTORY_FAMILY_ID,
  type ReachedMilestone,
} from "../domain";

import {
  INITIAL_WORLD_STRUCTURE,
  INITIAL_STRUCTURAL_RESERVE,
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
    expect(inventory.placed[STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]).toBe(
      120,
    );
    expect(inventory.available[STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]).toBe(
      24,
    );
    expect(inventory.available[STRUCTURAL_INVENTORY_FAMILY_ID.wallLong]).toBe(
      1,
    );
    expect(
      inventory.available[STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal],
    ).toBe(0);
  });

  it("agrupa variantes físicas sem inflar a reserva de orientação", () => {
    expect(INITIAL_STRUCTURAL_RESERVE).toEqual({
      [STRUCTURAL_INVENTORY_FAMILY_ID.floorWood]: 24,
      [STRUCTURAL_INVENTORY_FAMILY_ID.wallShort]: 2,
      [STRUCTURAL_INVENTORY_FAMILY_ID.wallMedium]: 2,
      [STRUCTURAL_INVENTORY_FAMILY_ID.wallLong]: 1,
      [STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone]: 1,
      [STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal]: 0,
    });
    expect(
      structureDefinition("architecture.wall.stone-01.horizontal-1")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.wallShort);
    expect(
      structureDefinition("architecture.wall.stone-01.vertical-1")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.wallShort);
    expect(
      structureDefinition("architecture.wall.stone-01.corner-ne")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone);
    expect(
      structureDefinition("architecture.wall.stone-01.corner-sw")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.cornerStone);
    expect(
      structureDefinition("architecture.wall.stone-01.door-horizontal.closed")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal);
    expect(
      structureDefinition("architecture.wall.stone-01.door-horizontal.open")
        ?.inventoryFamilyId,
    ).toBe(STRUCTURAL_INVENTORY_FAMILY_ID.doorHorizontal);
  });

  it("consome ao colocar, devolve ao guardar e não muda com rotação", () => {
    const placed = {
      ...INITIAL_WORLD_STRUCTURE,
      placements: [
        ...INITIAL_WORLD_STRUCTURE.placements,
        {
          anchor: { x: 7, y: 8 },
          definitionId: "architecture.wall.stone-01.horizontal-1" as const,
          instanceId: "structure.short-new",
        },
      ],
    };
    const rotated = {
      ...placed,
      placements: placed.placements.map((placement) =>
        placement.instanceId === "structure.short-new"
          ? {
              ...placement,
              definitionId: "architecture.wall.stone-01.vertical-1" as const,
            }
          : placement,
      ),
    };
    expect(
      structuralInventory(placed).available[
        STRUCTURAL_INVENTORY_FAMILY_ID.wallShort
      ],
    ).toBe(1);
    expect(
      structuralInventory(rotated).available[
        STRUCTURAL_INVENTORY_FAMILY_ID.wallShort
      ],
    ).toBe(1);
    expect(
      structuralInventory(INITIAL_WORLD_STRUCTURE).available[
        STRUCTURAL_INVENTORY_FAMILY_ID.wallShort
      ],
    ).toBe(2);
  });

  it("soma grants cumulativos uma vez e ignora milestones alheios", () => {
    const structural: ReachedMilestone = {
      id: "milestone.structure.first-activity",
      reachedAt: "2026-08-27T12:00:00.000Z",
      rewards: [
        {
          familyId: STRUCTURAL_INVENTORY_FAMILY_ID.wallShort,
          id: "reward.structure.first-activity.wall-short",
          quantity: 4,
          type: "structure-grant",
        },
      ],
      ruleVersion: 1,
      source: { eventId: "session-1", eventType: "SessionChanged" },
    };
    const decoration: ReachedMilestone = {
      id: "milestone.first-completed-book",
      reachedAt: structural.reachedAt,
      rewards: [
        {
          decorationId: "decoration.reading-lamp",
          id: "reward.first-completion-reading-lamp",
          type: "decoration",
        },
      ],
      ruleVersion: 1,
      source: structural.source,
    };
    expect(
      structuralInventory(INITIAL_WORLD_STRUCTURE, [structural, decoration])
        .available[STRUCTURAL_INVENTORY_FAMILY_ID.wallShort],
    ).toBe(6);
    expect(
      structuralInventory(INITIAL_WORLD_STRUCTURE, [structural, structural])
        .available[STRUCTURAL_INVENTORY_FAMILY_ID.wallShort],
    ).toBe(6);
  });

  it("rejeita layout que excede uma família sem concessão", () => {
    const excess = {
      ...INITIAL_WORLD_STRUCTURE,
      placements: [
        ...INITIAL_WORLD_STRUCTURE.placements,
        ...[6, 8, 10].map((x) => ({
          anchor: { x, y: 6 },
          definitionId: "architecture.wall.stone-01.horizontal-1" as const,
          instanceId: `structure.short-${x}`,
        })),
      ],
    };
    expect(() => structuralInventory(excess)).toThrow(
      /Inventário estrutural negativo/u,
    );
  });
});
