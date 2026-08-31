import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  type FloorCell,
  type StructurePlacement,
  type UnitEdge,
  type WorldStructureState,
} from "./worldStructure";
import {
  CANONICAL_WORLD_STRUCTURE_V1_SIGNATURE,
  analyzeStructurePerimeter,
  classifyWorldStructureIdentity,
  deriveFloorPerimeterEdges,
  normalizeWorldStructureSignature,
  worldStructureSignature,
} from "./worldStructureAnalysis";

function rectangle(
  width: number,
  height: number,
  originX = 0,
  originY = 0,
): readonly FloorCell[] {
  return Array.from({ length: height }, (_row, y) =>
    Array.from({ length: width }, (_column, x) => ({
      x: originX + x,
      y: originY + y,
    })),
  ).flat();
}

function placementsForEdges(
  edges: readonly UnitEdge[],
): readonly StructurePlacement[] {
  return edges.map((edge, index) => ({
    anchor: { x: edge.x, y: edge.y },
    definitionId:
      edge.axis === "horizontal"
        ? "architecture.wall.stone-01.horizontal-1"
        : "architecture.wall.stone-01.vertical-1",
    instanceId: `perimeter-${index}`,
  }));
}

function exactAnalysis(floorCells: readonly FloorCell[]) {
  const placements = placementsForEdges(deriveFloorPerimeterEdges(floorCells));
  return analyzeStructurePerimeter({ floorCells, placements });
}

function changedState(
  changes: Partial<WorldStructureState>,
): WorldStructureState {
  return { ...INITIAL_WORLD_STRUCTURE, ...changes };
}

describe("W3-A-R1-B floor perimeter analysis", () => {
  it("derives and closes a simple rectangle", () => {
    const analysis = exactAnalysis(rectangle(2, 2));
    expect(analysis.perimeterEdges).toHaveLength(8);
    expect(analysis.structuralEdges).toHaveLength(8);
    expect(analysis.missingEdges).toEqual([]);
    expect(analysis.extraEdges).toEqual([]);
    expect(analysis.duplicateEdges).toEqual([]);
    expect(analysis.connectedComponents).toHaveLength(1);
    expect(analysis.endpoints).toEqual([]);
    expect(analysis.incompatibleDegrees).toEqual([]);
    expect(analysis.closed).toBe(true);
  });

  it("derives a closed concave contour", () => {
    const floorCells = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const analysis = exactAnalysis(floorCells);
    expect(analysis.perimeterEdges).toHaveLength(8);
    expect(analysis.connectedComponents).toHaveLength(1);
    expect(analysis.incompatibleDegrees).toEqual([]);
    expect(analysis.closed).toBe(true);
  });

  it("reports outer and inner closed components for a shape with a hole", () => {
    const floorCells = rectangle(3, 3).filter(
      (cell) => cell.x !== 1 || cell.y !== 1,
    );
    const analysis = exactAnalysis(floorCells);
    expect(analysis.perimeterEdges).toHaveLength(16);
    expect(analysis.connectedComponents).toHaveLength(2);
    expect(
      analysis.connectedComponents.every((component) => component.closed),
    ).toBe(true);
    expect(analysis.closed).toBe(true);
  });

  it("reports multiple disconnected closed components", () => {
    const floorCells = [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
    ];
    const analysis = exactAnalysis(floorCells);
    expect(analysis.perimeterEdges).toHaveLength(8);
    expect(analysis.connectedComponents).toHaveLength(2);
    expect(analysis.closed).toBe(true);
  });

  it("reports a missing edge, its endpoints and incompatible degrees", () => {
    const floorCells = rectangle(2, 2);
    const perimeter = deriveFloorPerimeterEdges(floorCells);
    const analysis = analyzeStructurePerimeter({
      floorCells,
      placements: placementsForEdges(perimeter.slice(1)),
    });
    expect(analysis.missingEdges).toEqual([perimeter[0]]);
    expect(analysis.extraEdges).toEqual([]);
    expect(analysis.duplicateEdges).toEqual([]);
    expect(analysis.endpoints).toHaveLength(2);
    expect(analysis.incompatibleDegrees).toHaveLength(2);
    expect(analysis.closed).toBe(false);
  });

  it("reports an extra detached edge", () => {
    const floorCells = rectangle(2, 2);
    const placements = placementsForEdges(
      deriveFloorPerimeterEdges(floorCells),
    );
    const extra: StructurePlacement = {
      anchor: { x: 10, y: 10 },
      definitionId: "architecture.wall.stone-01.horizontal-1",
      instanceId: "extra",
    };
    const analysis = analyzeStructurePerimeter({
      floorCells,
      placements: [...placements, extra],
    });
    expect(analysis.missingEdges).toEqual([]);
    expect(analysis.extraEdges).toHaveLength(1);
    expect(analysis.connectedComponents).toHaveLength(2);
    expect(analysis.endpoints).toHaveLength(2);
    expect(analysis.closed).toBe(false);
  });

  it("reports duplicate structural occupancy without hiding full coverage", () => {
    const floorCells = rectangle(2, 2);
    const perimeter = deriveFloorPerimeterEdges(floorCells);
    const placements = placementsForEdges(perimeter);
    const duplicate = {
      ...placements[0],
      instanceId: "duplicate",
    };
    const analysis = analyzeStructurePerimeter({
      floorCells,
      placements: [...placements, duplicate],
    });
    expect(analysis.structuralEdges).toHaveLength(8);
    expect(analysis.missingEdges).toEqual([]);
    expect(analysis.extraEdges).toEqual([]);
    expect(analysis.duplicateEdges).toEqual([perimeter[0]]);
    expect(analysis.incompatibleDegrees).toEqual([]);
    expect(analysis.closed).toBe(false);
  });

  it("is deterministic and does not mutate either input order", () => {
    const floorCells = rectangle(3, 2);
    const placements = placementsForEdges(
      deriveFloorPerimeterEdges(floorCells),
    );
    const floorOrder = floorCells.map(({ x, y }) => `${x}:${y}`);
    const placementOrder = placements.map(({ instanceId }) => instanceId);
    const normal = analyzeStructurePerimeter({ floorCells, placements });
    const reversed = analyzeStructurePerimeter({
      floorCells: [...floorCells].reverse(),
      placements: [...placements].reverse(),
    });
    expect(reversed).toEqual(normal);
    expect(floorCells.map(({ x, y }) => `${x}:${y}`)).toEqual(floorOrder);
    expect(placements.map(({ instanceId }) => instanceId)).toEqual(
      placementOrder,
    );
  });

  it("proves the complete 120/44/44/0/0/0 blueprint-v1 diagnostic", () => {
    const analysis = analyzeStructurePerimeter(INITIAL_WORLD_STRUCTURE);
    expect(INITIAL_WORLD_STRUCTURE.floorCells).toHaveLength(120);
    expect(analysis.perimeterEdges).toHaveLength(44);
    expect(analysis.structuralEdges).toHaveLength(44);
    expect(analysis.missingEdges).toHaveLength(0);
    expect(analysis.extraEdges).toHaveLength(0);
    expect(analysis.duplicateEdges).toHaveLength(0);
    expect(analysis.connectedComponents).toHaveLength(1);
    expect(analysis.incompatibleDegrees).toEqual([]);
    expect(analysis.closed).toBe(true);
  });
});

describe("W3-A-R1-B normalized blueprint identity", () => {
  it("classifies the explicit intact blueprint-v1 signature as canonical", () => {
    const normalized = normalizeWorldStructureSignature(
      INITIAL_WORLD_STRUCTURE,
    );
    expect(
      normalized.placements.find(
        ({ definitionId }) =>
          definitionId === "architecture.wall.stone-01.door-horizontal.closed",
      ),
    ).toEqual({
      anchor: { x: 7, y: 14 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      orientation: "horizontal",
      state: "closed",
    });
    expect(
      normalized.placements.find(
        ({ definitionId }) =>
          definitionId === "architecture.wall.stone-01.corner-sw",
      ),
    ).toMatchObject({ orientation: "sw", state: null });
    expect(worldStructureSignature(INITIAL_WORLD_STRUCTURE)).toBe(
      CANONICAL_WORLD_STRUCTURE_V1_SIGNATURE,
    );
    expect(classifyWorldStructureIdentity(INITIAL_WORLD_STRUCTURE)).toBe(
      "canonical-v1",
    );
  });

  it("ignores order, timestamps, revision and instance IDs", () => {
    const reordered = changedState({
      createdAt: "2099-01-01T00:00:00.000Z",
      floorCells: [...INITIAL_WORLD_STRUCTURE.floorCells].reverse(),
      placements: [...INITIAL_WORLD_STRUCTURE.placements]
        .reverse()
        .map((placement, index) => ({
          ...placement,
          instanceId: `renamed-${index}`,
        })),
      revision: 999,
      updatedAt: "2099-01-02T00:00:00.000Z",
    });
    expect(normalizeWorldStructureSignature(reordered)).toEqual(
      normalizeWorldStructureSignature(INITIAL_WORLD_STRUCTURE),
    );
    expect(classifyWorldStructureIdentity(reordered)).toBe("canonical-v1");
  });

  it("classifies changed floor geometry as modified-v1", () => {
    expect(
      classifyWorldStructureIdentity(
        changedState({
          floorCells: INITIAL_WORLD_STRUCTURE.floorCells.slice(1),
        }),
      ),
    ).toBe("modified-v1");
  });

  it.each(["added", "removed", "moved"] as const)(
    "classifies a %s placement as modified-v1",
    (change) => {
      const placements = [...INITIAL_WORLD_STRUCTURE.placements];
      if (change === "added")
        placements.push({
          anchor: { x: 30, y: 30 },
          definitionId: "architecture.wall.stone-01.horizontal-1",
          instanceId: "added",
        });
      if (change === "removed") placements.pop();
      if (change === "moved")
        placements[0] = {
          ...placements[0],
          anchor: {
            x: placements[0].anchor.x + 1,
            y: placements[0].anchor.y,
          },
        };
      expect(classifyWorldStructureIdentity(changedState({ placements }))).toBe(
        "modified-v1",
      );
    },
  );

  it("classifies a changed orientation as modified-v1", () => {
    const placements = INITIAL_WORLD_STRUCTURE.placements.map((placement) =>
      placement.instanceId === "initial.wall.top"
        ? {
            ...placement,
            definitionId: "architecture.wall.stone-01.vertical-4" as const,
          }
        : placement,
    );
    expect(classifyWorldStructureIdentity(changedState({ placements }))).toBe(
      "modified-v1",
    );
  });

  it("classifies an open canonical door as modified-v1", () => {
    const placements = INITIAL_WORLD_STRUCTURE.placements.map((placement) =>
      placement.instanceId === "initial.door.bottom"
        ? {
            ...placement,
            definitionId:
              "architecture.wall.stone-01.door-horizontal.open" as const,
          }
        : placement,
    );
    expect(classifyWorldStructureIdentity(changedState({ placements }))).toBe(
      "modified-v1",
    );
  });

  it("classifies a changed definitionId as modified-v1", () => {
    const placements = INITIAL_WORLD_STRUCTURE.placements.map((placement) =>
      placement.instanceId === "initial.wall.left"
        ? {
            ...placement,
            definitionId: "architecture.wall.stone-01.vertical-1" as const,
          }
        : placement,
    );
    expect(classifyWorldStructureIdentity(changedState({ placements }))).toBe(
      "modified-v1",
    );
  });

  it.each([0, 2, 99])(
    "classifies blueprint version %i as future/unknown",
    (blueprintVersion) => {
      expect(
        classifyWorldStructureIdentity(changedState({ blueprintVersion })),
      ).toBe("future/unknown");
    },
  );
});
