import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  STRUCTURE_CATALOG,
  createLogicalSegment,
  logicalStructureIntervals,
  passableEdges,
  placementEdges,
  placementGeometry,
  rotatedStructureDefinitionId,
  unitEdgeKey,
  validateCollinearSegments,
  validateCornerConnection,
  validateHorizontalDoorConnection,
  validateStructuralOccupancy,
  validateStructureCatalog,
  validateWorldStructure,
  type CornerOrientation,
  type EdgeAxis,
  type GridPoint,
  type StructurePlacement,
} from "./worldStructure";

const WALL_DEFINITION_IDS = {
  horizontal: {
    1: "architecture.wall.stone-01.horizontal-1",
    2: "architecture.wall.stone-01.horizontal-2",
    4: "architecture.wall.stone-01.horizontal-4",
  },
  vertical: {
    1: "architecture.wall.stone-01.vertical-1",
    2: "architecture.wall.stone-01.vertical-2",
    4: "architecture.wall.stone-01.vertical-4",
  },
} as const;

const CORNER_DEFINITION_IDS = {
  ne: "architecture.wall.stone-01.corner-ne",
  nw: "architecture.wall.stone-01.corner-nw",
  se: "architecture.wall.stone-01.corner-se",
  sw: "architecture.wall.stone-01.corner-sw",
} as const;

type WallSpan = 1 | 2 | 4;

function wallPlacement(
  axis: EdgeAxis,
  span: WallSpan,
  anchor: GridPoint,
  instanceId: string,
): StructurePlacement {
  return {
    anchor,
    definitionId: WALL_DEFINITION_IDS[axis][span],
    instanceId,
  };
}

function cornerPlacement(
  orientation: CornerOrientation,
  instanceId: string,
): StructurePlacement {
  return {
    anchor: { x: 0, y: 0 },
    definitionId: CORNER_DEFINITION_IDS[orientation],
    instanceId,
  };
}

function doorPlacement(
  state: "closed" | "open",
  anchor: GridPoint,
  instanceId: string,
): StructurePlacement {
  return {
    anchor,
    definitionId: `architecture.wall.stone-01.door-horizontal.${state}`,
    instanceId,
  };
}

describe("W3-A-R1 logical structure geometry", () => {
  it.each(["horizontal", "vertical"] as const)(
    "derives walls 1, 2 and 4 on the %s axis from logical metadata",
    (axis) => {
      for (const span of [1, 2, 4] as const) {
        const geometry = placementGeometry(
          wallPlacement(axis, span, { x: -3, y: -2 }, `${axis}-${span}`),
        );
        if (geometry.kind !== "wall")
          throw new Error("Fixture deveria produzir uma parede");
        expect(geometry.interval).toMatchObject({
          axis,
          spanCells: span,
          start: { x: -3, y: -2 },
        });
        expect(geometry.interval.end).toEqual(
          axis === "horizontal"
            ? { x: -3 + span, y: -2 }
            : { x: -3, y: -2 + span },
        );
      }
    },
  );

  it("accepts integer negative coordinates and rejects invalid coordinates or spans", () => {
    expect(createLogicalSegment("horizontal", { x: -4, y: -3 }, 4)).toEqual({
      axis: "horizontal",
      end: { x: 0, y: -3 },
      spanCells: 4,
      start: { x: -4, y: -3 },
    });
    expect(() => createLogicalSegment("horizontal", { x: 0, y: 0 }, 0)).toThrow(
      /inteiro positivo/u,
    );
    expect(() => createLogicalSegment("vertical", { x: 0, y: 0 }, -1)).toThrow(
      /inteiro positivo/u,
    );
    expect(() =>
      createLogicalSegment("horizontal", { x: 0, y: 0 }, 1.5),
    ).toThrow(/inteiro positivo/u);
    expect(() => createLogicalSegment("vertical", { x: 0.5, y: 0 }, 1)).toThrow(
      /coordenadas inteiras/u,
    );
    expect(
      createLogicalSegment(
        "horizontal",
        { x: Number.MAX_SAFE_INTEGER - 1, y: Number.MIN_SAFE_INTEGER },
        1,
      ).end,
    ).toEqual({
      x: Number.MAX_SAFE_INTEGER,
      y: Number.MIN_SAFE_INTEGER,
    });
    expect(() =>
      createLogicalSegment(
        "horizontal",
        { x: Number.MAX_SAFE_INTEGER, y: 0 },
        1,
      ),
    ).toThrow(/coordenadas inteiras seguras/u);
  });

  it.each([
    [1, 1],
    [1, 2],
    [2, 2],
    [2, 4],
    [4, 4],
  ] as const)(
    "connects adjacent %i+%i spans on both axes at exactly one endpoint",
    (firstSpan, secondSpan) => {
      for (const axis of ["horizontal", "vertical"] as const) {
        const first = createLogicalSegment(axis, { x: -2, y: -2 }, firstSpan);
        const second = createLogicalSegment(
          axis,
          { x: first.end.x, y: first.end.y },
          secondSpan,
        );
        expect(validateCollinearSegments([second, first])).toBe(true);
      }
    },
  );

  it.each([
    {
      horizontal: { x: -5, y: 0 },
      orientation: "ne",
      vertical: { x: 0, y: -5 },
    },
    {
      horizontal: { x: 4, y: 0 },
      orientation: "nw",
      vertical: { x: 0, y: -5 },
    },
    {
      horizontal: { x: -5, y: 0 },
      orientation: "se",
      vertical: { x: 0, y: 4 },
    },
    {
      horizontal: { x: 4, y: 0 },
      orientation: "sw",
      vertical: { x: 0, y: 4 },
    },
  ] as const)(
    "connects the $orientation corner vertex to compatible perpendicular intervals",
    ({ horizontal, orientation, vertical }) => {
      const corner = cornerPlacement(orientation, `corner-${orientation}`);
      const horizontalNeighbour = wallPlacement(
        "horizontal",
        1,
        horizontal,
        `horizontal-${orientation}`,
      );
      const verticalNeighbour = wallPlacement(
        "vertical",
        1,
        vertical,
        `vertical-${orientation}`,
      );
      expect(
        validateCornerConnection(
          corner,
          verticalNeighbour,
          horizontalNeighbour,
        ),
      ).toBe(true);
      const geometry = placementGeometry(corner);
      if (geometry.kind !== "corner")
        throw new Error("Fixture deveria produzir um canto");
      expect(geometry.vertex).toEqual({ x: 0, y: 0 });
      expect(geometry.horizontalArm.axis).toBe("horizontal");
      expect(geometry.verticalArm.axis).toBe("vertical");
      expect(geometry.horizontalArm.spanCells).toBe(4);
      expect(geometry.verticalArm.spanCells).toBe(4);
    },
  );

  it("integrates an open or closed horizontal door as a four-cell middle interval", () => {
    const left = wallPlacement("horizontal", 2, { x: 0, y: 3 }, "left");
    const right = wallPlacement("horizontal", 2, { x: 6, y: 3 }, "right");
    const closed = doorPlacement("closed", { x: 2, y: 3 }, "door-closed");
    const open = doorPlacement("open", { x: 2, y: 3 }, "door-open");

    expect(validateHorizontalDoorConnection(closed, right, left)).toBe(true);
    expect(validateHorizontalDoorConnection(open, left, right)).toBe(true);
    expect(placementEdges(open).map(unitEdgeKey)).toEqual([
      "horizontal:2:3",
      "horizontal:3:3",
      "horizontal:4:3",
      "horizontal:5:3",
    ]);
    expect(passableEdges(closed)).toEqual([]);
    expect(passableEdges(open).map(unitEdgeKey)).toEqual([
      "horizontal:3:3",
      "horizontal:4:3",
    ]);
    expect(() =>
      validateHorizontalDoorConnection(
        doorPlacement("closed", { x: 0, y: 3 }, "external-door"),
        wallPlacement("horizontal", 2, { x: 4, y: 3 }, "external-left"),
        wallPlacement("horizontal", 2, { x: 6, y: 3 }, "external-right"),
      ),
    ).toThrow(/substituir o intervalo entre dois segmentos/u);
  });

  it("validates the blueprint door between the two real corner arms", () => {
    const door = INITIAL_WORLD_STRUCTURE.placements.find(
      (placement) => placement.instanceId === "initial.door.bottom",
    );
    const leftCorner = INITIAL_WORLD_STRUCTURE.placements.find(
      (placement) => placement.instanceId === "initial.corner.bottom-left",
    );
    const rightCorner = INITIAL_WORLD_STRUCTURE.placements.find(
      (placement) => placement.instanceId === "initial.corner.bottom-right",
    );
    if (!door || !leftCorner || !rightCorner)
      throw new Error("Blueprint inicial incompleto");
    expect(
      validateHorizontalDoorConnection(door, rightCorner, leftCorner),
    ).toBe(true);
    const blueprintEdges =
      INITIAL_WORLD_STRUCTURE.placements.flatMap(placementEdges);
    expect(blueprintEdges).toHaveLength(44);
    expect(new Set(blueprintEdges.map(unitEdgeKey)).size).toBe(44);
  });

  it("rejects gaps, partial overlaps, duplicates and incompatible axes", () => {
    const first = createLogicalSegment("horizontal", { x: 0, y: 0 }, 2);
    expect(() =>
      validateCollinearSegments([
        first,
        createLogicalSegment("horizontal", { x: 3, y: 0 }, 2),
      ]),
    ).toThrow(/Gap lógico/u);
    expect(() =>
      validateCollinearSegments([
        first,
        createLogicalSegment("horizontal", { x: 1, y: 0 }, 2),
      ]),
    ).toThrow(/sobrepostos/u);
    expect(() => validateCollinearSegments([first, first])).toThrow(
      /duplicado/u,
    );
    expect(() =>
      validateCollinearSegments([
        first,
        createLogicalSegment("vertical", { x: 2, y: 0 }, 2),
      ]),
    ).toThrow(/mesmo eixo/u);
    expect(() =>
      validateCollinearSegments([
        first,
        createLogicalSegment("horizontal", { x: 2, y: 1 }, 2),
      ]),
    ).toThrow(/não são colineares/u);
  });

  it("rejects duplicate and overlapping occupied intervals in a state", () => {
    const wall = wallPlacement("horizontal", 4, { x: 0, y: 0 }, "wall");
    const duplicateDoor = doorPlacement("closed", { x: 0, y: 0 }, "door");
    expect(() => validateStructuralOccupancy([wall, duplicateDoor])).toThrow(
      /duplicado/u,
    );
    expect(() =>
      validateStructuralOccupancy([
        wall,
        wallPlacement("horizontal", 2, { x: 3, y: 0 }, "overlap"),
      ]),
    ).toThrow(/sobreposto/u);
    expect(() =>
      validateStructuralOccupancy([
        cornerPlacement("ne", "corner-ne"),
        cornerPlacement("sw", "corner-sw"),
      ]),
    ).toThrow(/Vértice de canto duplicado/u);
  });

  it.each([1, 2, 4] as const)(
    "rotates a %i-cell wall by changing its axis and preserving its span",
    (span) => {
      const horizontalId = WALL_DEFINITION_IDS.horizontal[span];
      const verticalId = rotatedStructureDefinitionId(horizontalId);
      if (!verticalId) throw new Error("Rotação de parede ausente");
      const geometry = placementGeometry({
        anchor: { x: 1, y: 2 },
        definitionId: verticalId,
        instanceId: `rotated-${span}`,
      });
      if (geometry.kind !== "wall")
        throw new Error("Rotação deveria continuar sendo parede");
      expect(geometry.interval.axis).toBe("vertical");
      expect(geometry.interval.spanCells).toBe(span);
      expect(rotatedStructureDefinitionId(verticalId)).toBe(horizontalId);
    },
  );

  it("normalizes placement reading order without changing validation", () => {
    const placements = [
      wallPlacement("horizontal", 1, { x: -1, y: 2 }, "first"),
      wallPlacement("horizontal", 2, { x: 0, y: 2 }, "second"),
      wallPlacement("horizontal", 4, { x: 2, y: 2 }, "third"),
    ];
    const orders = [
      [placements[0], placements[1], placements[2]],
      [placements[0], placements[2], placements[1]],
      [placements[1], placements[0], placements[2]],
      [placements[1], placements[2], placements[0]],
      [placements[2], placements[0], placements[1]],
      [placements[2], placements[1], placements[0]],
    ];
    const originalOrder = placements.map((placement) => placement.instanceId);
    const normalized = logicalStructureIntervals(placements);
    for (const order of orders) {
      expect(logicalStructureIntervals(order)).toEqual(normalized);
      expect(validateCollinearSegments(logicalStructureIntervals(order))).toBe(
        true,
      );
    }
    expect(placements.map((placement) => placement.instanceId)).toEqual(
      originalOrder,
    );
    expect(
      validateWorldStructure({
        ...INITIAL_WORLD_STRUCTURE,
        placements: [...INITIAL_WORLD_STRUCTURE.placements].reverse(),
      }),
    ).toBe(true);
  });

  it("rejects a non-positive logical catalog span with a clear error", () => {
    const invalidCatalog = STRUCTURE_CATALOG.map((definition) =>
      definition.id === "architecture.wall.stone-01.horizontal-1"
        ? { ...definition, logicalSpanCells: 0 }
        : definition,
    );
    expect(() => validateStructureCatalog(invalidCatalog)).toThrow(
      /Span lógico deve ser inteiro positivo/u,
    );
  });
});
