import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  analyzeStructurePerimeter,
  validateWorldStructure,
  type GridPoint,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";

import { structureRenderPlan } from "./structureRenderPlan";
import {
  analyzeStructureVisualContinuity,
  type StructureVisualContinuityAnalysis,
  type StructureVisualContinuitySource,
} from "./structureVisualContinuity";
import { structureVisualDepth } from "./structureVisualDepth";
import { structureVisualFallbackGeometry } from "./structureVisualFallback";
import {
  STRUCTURE_VISUAL_ASSETS,
  structureVisualTransform,
  type HalfOpenInterval,
  type StructureVisualSide,
  type StructureVisualTransform,
  type TransverseOccupiedSide,
  type WorldJoinPlane,
} from "./structureVisualGeometry";

const FIXED_TIMESTAMP = "2026-09-02T00:00:00.000Z";

function placement(
  definitionId: StructurePlacement["definitionId"],
  anchor: GridPoint,
  instanceId: string,
): StructurePlacement {
  return { anchor, definitionId, instanceId };
}

function requiredPlane(
  transform: StructureVisualTransform,
  side: StructureVisualSide,
): WorldJoinPlane {
  const plane = transform.joinPlanes.find(
    (candidate) => candidate.side === side,
  );
  if (!plane)
    throw new Error(`Plano ${side} ausente: ${transform.placementKey}`);
  return plane;
}

function sourceWithPlanes(
  transform: StructureVisualTransform,
  planes: readonly WorldJoinPlane[],
): StructureVisualContinuitySource {
  return {
    definitionId: transform.definitionId,
    joinPlanes: planes,
    placementKey: transform.placementKey,
  };
}

function sourceAtSides(
  transform: StructureVisualTransform,
  ...sides: readonly StructureVisualSide[]
): StructureVisualContinuitySource {
  return sourceWithPlanes(
    transform,
    sides.map((side) => requiredPlane(transform, side)),
  );
}

function sourceWithPlane(
  transform: StructureVisualTransform,
  plane: WorldJoinPlane,
): StructureVisualContinuitySource {
  return sourceWithPlanes(transform, [plane]);
}

function withCoordinate(
  plane: WorldJoinPlane,
  coordinate: number,
): WorldJoinPlane {
  return { ...plane, coordinate };
}

function withLogicalEndpoint(
  plane: WorldJoinPlane,
  logicalEndpoint: GridPoint,
): WorldJoinPlane {
  return { ...plane, logicalEndpoint };
}

function occupiedSide(
  interval: HalfOpenInterval,
  logicalAxisCoordinate: number,
): TransverseOccupiedSide {
  if (interval.end <= logicalAxisCoordinate) return "negative";
  if (interval.start >= logicalAxisCoordinate) return "positive";
  return "straddles-axis";
}

function withProfile(
  plane: WorldJoinPlane,
  start: number,
  end: number,
  sourcePixelTolerance = plane.transverseProfile.sourcePixelTolerance,
  logicalAxisCoordinate = plane.transverseProfile.logicalAxisCoordinate,
): WorldJoinPlane {
  const interval = Object.freeze({ end, start });
  const axisRelativeInterval = Object.freeze({
    end: end - logicalAxisCoordinate,
    start: start - logicalAxisCoordinate,
  });
  return {
    ...plane,
    profile: interval,
    transverseProfile: Object.freeze({
      ...plane.transverseProfile,
      axisRelativeCenterline:
        (axisRelativeInterval.start + axisRelativeInterval.end) / 2,
      axisRelativeInterval,
      centerline: (start + end) / 2,
      interval,
      logicalAxisCoordinate,
      occupiedSide: occupiedSide(interval, logicalAxisCoordinate),
      sourcePixelTolerance,
      thickness: end - start,
    }),
  };
}

function horizontalPair(): readonly [
  StructureVisualTransform,
  StructureVisualTransform,
] {
  return [
    structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-1",
        { x: -1, y: 0 },
        "synthetic.horizontal.left",
      ),
    ),
    structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-1",
        { x: 0, y: 0 },
        "synthetic.horizontal.right",
      ),
    ),
  ];
}

function analyzeHorizontalPair(
  firstPlane: WorldJoinPlane,
  secondPlane: WorldJoinPlane,
): StructureVisualContinuityAnalysis {
  const [first, second] = horizontalPair();
  return analyzeStructureVisualContinuity([
    sourceWithPlane(first, firstPlane),
    sourceWithPlane(second, secondPlane),
  ]);
}

function issueKinds(
  analysis: StructureVisualContinuityAnalysis,
): readonly string[] {
  return analysis.junctions.flatMap(({ issues }) =>
    issues.map(({ kind }) => kind),
  );
}

function analysisForStructure(
  structure: WorldStructureState,
): StructureVisualContinuityAnalysis {
  return analyzeStructureVisualContinuity(
    structureRenderPlan(structure).map(({ transform }) => transform),
  );
}

function unalignedAnalysisForStructure(
  structure: WorldStructureState,
): StructureVisualContinuityAnalysis {
  return analyzeStructureVisualContinuity(
    structure.placements.map((item) => structureVisualTransform(item)),
  );
}

function rectangularFloor(
  x: number,
  y: number,
  width: number,
  height: number,
): readonly GridPoint[] {
  return Array.from({ length: height }, (_row, row) =>
    Array.from({ length: width }, (_column, column) => ({
      x: x + column,
      y: y + row,
    })),
  ).flat();
}

const MODIFIED_WORLD_STRUCTURE: WorldStructureState = {
  blueprintVersion: 1,
  createdAt: FIXED_TIMESTAMP,
  floorCells: rectangularFloor(2, 2, 15, 13),
  id: "world.main",
  placements: [
    placement(
      "architecture.wall.stone-01.corner-sw",
      { x: 2, y: 2 },
      "modified.corner.top-left",
    ),
    placement(
      "architecture.wall.stone-01.corner-se",
      { x: 17, y: 2 },
      "modified.corner.top-right",
    ),
    placement(
      "architecture.wall.stone-01.corner-nw",
      { x: 2, y: 15 },
      "modified.corner.bottom-left",
    ),
    placement(
      "architecture.wall.stone-01.corner-ne",
      { x: 17, y: 15 },
      "modified.corner.bottom-right",
    ),
    placement(
      "architecture.wall.stone-01.horizontal-4",
      { x: 6, y: 2 },
      "modified.top.long",
    ),
    placement(
      "architecture.wall.stone-01.horizontal-2",
      { x: 10, y: 2 },
      "modified.top.medium",
    ),
    placement(
      "architecture.wall.stone-01.horizontal-1",
      { x: 12, y: 2 },
      "modified.top.short",
    ),
    placement(
      "architecture.wall.stone-01.door-horizontal.open",
      { x: 6, y: 15 },
      "modified.bottom.door",
    ),
    placement(
      "architecture.wall.stone-01.horizontal-2",
      { x: 10, y: 15 },
      "modified.bottom.medium",
    ),
    placement(
      "architecture.wall.stone-01.horizontal-1",
      { x: 12, y: 15 },
      "modified.bottom.short",
    ),
    placement(
      "architecture.wall.stone-01.vertical-4",
      { x: 2, y: 6 },
      "modified.left.long",
    ),
    placement(
      "architecture.wall.stone-01.vertical-1",
      { x: 2, y: 10 },
      "modified.left.short",
    ),
    placement(
      "architecture.wall.stone-01.vertical-2",
      { x: 17, y: 6 },
      "modified.right.medium-a",
    ),
    placement(
      "architecture.wall.stone-01.vertical-2",
      { x: 17, y: 8 },
      "modified.right.medium-b",
    ),
    placement(
      "architecture.wall.stone-01.vertical-1",
      { x: 17, y: 10 },
      "modified.right.short",
    ),
  ],
  revision: 2,
  updatedAt: FIXED_TIMESTAMP,
};

const DOOR_STATES_WORLD_STRUCTURE: WorldStructureState = {
  ...INITIAL_WORLD_STRUCTURE,
  createdAt: FIXED_TIMESTAMP,
  placements: INITIAL_WORLD_STRUCTURE.placements.map((item) =>
    item.instanceId === "initial.wall.top"
      ? {
          anchor: item.anchor,
          definitionId:
            "architecture.wall.stone-01.door-horizontal.open" as const,
          instanceId: "detail.door.open",
        }
      : item,
  ),
  revision: 2,
  updatedAt: FIXED_TIMESTAMP,
};

describe("W3-A-R3-C-B2-FIX-A transverse contract", () => {
  it("defines tangent, signed normal, half-open profile, centerline and thickness", () => {
    const horizontal = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-1",
        { x: -3, y: -2 },
        "contract.horizontal",
      ),
    );
    const vertical = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.vertical-1",
        { x: -3, y: -2 },
        "contract.vertical",
      ),
    );
    const horizontalPlane = requiredPlane(horizontal, "east");
    const verticalPlane = requiredPlane(vertical, "south");

    expect(horizontalPlane.longitudinalAxis).toBe("horizontal");
    expect(horizontalPlane.axis).toBe("x");
    expect(horizontalPlane.transverseProfile.normal).toEqual({
      axis: "y",
      negativeDirection: "north",
      positiveDirection: "south",
    });
    expect(verticalPlane.longitudinalAxis).toBe("vertical");
    expect(verticalPlane.axis).toBe("y");
    expect(verticalPlane.transverseProfile.normal).toEqual({
      axis: "x",
      negativeDirection: "west",
      positiveDirection: "east",
    });
    for (const plane of [horizontalPlane, verticalPlane]) {
      const profile = plane.transverseProfile;
      expect(profile.interval).toBe(plane.profile);
      expect(profile.centerline).toBe(
        (profile.interval.start + profile.interval.end) / 2,
      );
      expect(profile.thickness).toBe(
        profile.axisRelativeInterval.end - profile.axisRelativeInterval.start,
      );
      expect(profile.sourcePixelTolerance).toBe(32 / 300);
      expect(Number.isInteger(profile.centerline)).toBe(false);
      expect(profile.centerline).toBeLessThan(0);
    }
  });

  it("classifies exact half-open axis boundaries without an epsilon", () => {
    const corner = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.corner-se",
        { x: 0, y: 0 },
        "half-open.corner",
      ),
    );
    const straight = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.vertical-2",
        { x: 0, y: 4 },
        "half-open.straight",
      ),
    );
    const cornerPlane = requiredPlane(corner, "south");
    const straightPlane = requiredPlane(straight, "north");

    expect(cornerPlane.profile.end).toBe(0);
    expect(cornerPlane.transverseProfile.occupiedSide).toBe("negative");
    expect(straightPlane.profile.start).toBe(0);
    expect(straightPlane.transverseProfile.occupiedSide).toBe("positive");
    const analysis = analyzeStructureVisualContinuity([
      sourceWithPlane(corner, cornerPlane),
      sourceWithPlane(straight, straightPlane),
    ]);
    expect(analysis.junctions[0]?.metrics.transverse.intervalRelation).toBe(
      "touching",
    );
    expect(analysis.junctions[0]?.metrics.transverse.gap).toBe(0);
    expect(analysis.junctions[0]?.metrics.transverse.overlap).toBe(0);
    expect(issueKinds(analysis)).toContain("transverse-side-mismatch");
  });
});

describe("W3-A-R3-C-B2-FIX-A pure continuity analyzer", () => {
  it("accepts two fully aligned profiles", () => {
    const [first, second] = horizontalPair();
    const analysis = analyzeStructureVisualContinuity([
      sourceAtSides(first, "east"),
      sourceAtSides(second, "west"),
    ]);

    expect(analysis.compatible).toBe(true);
    expect(analysis.unpairedEndpoints).toEqual([]);
    expect(analysis.junctions).toHaveLength(1);
    expect(analysis.junctions[0]?.issues).toEqual([]);
    expect(analysis.junctions[0]?.metrics.longitudinal).toEqual({
      relation: "aligned",
      signedDistance: 0,
      tolerance: 0,
    });
  });

  it("reports profiles on opposite transverse sides and their centerline jump", () => {
    const [first, second] = horizontalPair();
    const firstPlane = withProfile(requiredPlane(first, "east"), -10, 0);
    const secondPlane = withProfile(requiredPlane(second, "west"), 0, 10);
    const analysis = analyzeHorizontalPair(firstPlane, secondPlane);

    expect(issueKinds(analysis)).toEqual([
      "transverse-side-mismatch",
      "centerline-jump",
      "transverse-interval-mismatch",
    ]);
    expect(analysis.junctions[0]?.metrics.transverse.centerlineDifference).toBe(
      10,
    );
  });

  it("distinguishes longitudinal gaps from longitudinal overlaps", () => {
    const [first, second] = horizontalPair();
    const firstPlane = requiredPlane(first, "east");
    const secondPlane = requiredPlane(second, "west");
    const gap = analyzeHorizontalPair(
      firstPlane,
      withCoordinate(secondPlane, secondPlane.coordinate + 0.25),
    );
    const overlap = analyzeHorizontalPair(
      firstPlane,
      withCoordinate(secondPlane, secondPlane.coordinate - 0.5),
    );

    expect(issueKinds(gap)).toEqual(["longitudinal-gap"]);
    expect(gap.junctions[0]?.metrics.longitudinal.signedDistance).toBe(0.25);
    expect(issueKinds(overlap)).toEqual(["longitudinal-overlap"]);
    expect(overlap.junctions[0]?.metrics.longitudinal.signedDistance).toBe(
      -0.5,
    );
  });

  it("detects a transverse gap and an improper partial overlap", () => {
    const [first, second] = horizontalPair();
    const firstPlane = withProfile(requiredPlane(first, "east"), 0, 10, 0.1);
    const gap = analyzeHorizontalPair(
      firstPlane,
      withProfile(requiredPlane(second, "west"), 12, 22, 0.1),
    );
    const overlap = analyzeHorizontalPair(
      firstPlane,
      withProfile(requiredPlane(second, "west"), 2, 12, 0.1),
    );

    expect(issueKinds(gap)).toContain("transverse-gap");
    expect(gap.junctions[0]?.metrics.transverse.gap).toBe(2);
    expect(issueKinds(overlap)).toContain("transverse-overlap");
    expect(overlap.junctions[0]?.metrics.transverse.overlap).toBe(8);
  });

  it("derives thickness tolerance from the coarser of two source scales", () => {
    const [first, second] = horizontalPair();
    const firstPlane = withProfile(requiredPlane(first, "east"), 0, 10, 0.1);
    const within = analyzeHorizontalPair(
      firstPlane,
      withProfile(requiredPlane(second, "west"), 0, 10.2, 0.2),
    );
    const outside = analyzeHorizontalPair(
      firstPlane,
      withProfile(requiredPlane(second, "west"), 0, 10.201, 0.2),
    );

    expect(within.junctions[0]?.metrics.transverse.tolerance).toBe(0.2);
    expect(within.compatible).toBe(true);
    expect(issueKinds(outside)).toContain("thickness-mismatch");
    expect(
      outside.junctions[0]?.metrics.transverse.thicknessDifference,
    ).toBeCloseTo(0.201, 10);
  });

  it("uses logical endpoints to find neighbours and reports unmatched endpoints", () => {
    const [first, second] = horizontalPair();
    const firstPlane = requiredPlane(first, "east");
    const secondPlane = requiredPlane(second, "west");
    const analysis = analyzeHorizontalPair(
      firstPlane,
      withLogicalEndpoint(secondPlane, {
        x: secondPlane.logicalEndpoint.x + 1,
        y: secondPlane.logicalEndpoint.y,
      }),
    );

    expect(analysis.junctions).toEqual([]);
    expect(analysis.unpairedEndpoints).toHaveLength(2);
    expect(
      analysis.unpairedEndpoints.every(
        ({ reason }) => reason === "missing-opposite-plane",
      ),
    ).toBe(true);
  });

  it("is deterministic and independent of source and plane order", () => {
    const plan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    const direct = analyzeStructureVisualContinuity(
      plan.map(({ transform }) => transform),
    );
    const reversed = analyzeStructureVisualContinuity(
      [...plan].reverse().map(({ transform }) => ({
        ...transform,
        joinPlanes: [...transform.joinPlanes].reverse(),
      })),
    );

    expect(reversed).toEqual(direct);
  });
});

describe("W3-A-R3-C-B2-FIX-A catalog and composed regressions", () => {
  it("accepts horizontal and vertical runs containing walls 1, 2 and 4", () => {
    const horizontal = [
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-1",
          { x: -7, y: -3 },
          "run.h1",
        ),
      ),
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-2",
          { x: -6, y: -3 },
          "run.h2",
        ),
      ),
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-4",
          { x: -4, y: -3 },
          "run.h4",
        ),
      ),
    ];
    const vertical = [
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-1",
          { x: -3, y: -7 },
          "run.v1",
        ),
      ),
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-2",
          { x: -3, y: -6 },
          "run.v2",
        ),
      ),
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-4",
          { x: -3, y: -4 },
          "run.v4",
        ),
      ),
    ];
    const analysis = analyzeStructureVisualContinuity([
      sourceAtSides(horizontal[0], "east"),
      sourceAtSides(horizontal[1], "west", "east"),
      sourceAtSides(horizontal[2], "west"),
      sourceAtSides(vertical[0], "south"),
      sourceAtSides(vertical[1], "north", "south"),
      sourceAtSides(vertical[2], "north"),
    ]);

    expect(analysis.junctions).toHaveLength(4);
    expect(analysis.compatible).toBe(true);
    expect(
      analysis.junctions.map(({ metrics }) => metrics.transverse.tolerance),
    ).toEqual([32 / 300, 32 / 300, 32 / 300, 32 / 300]);
  });

  it("evaluates both arms of all four corners under the same convention", () => {
    const sources: StructureVisualContinuitySource[] = [];
    for (const [index, corner] of (
      ["ne", "nw", "se", "sw"] as const
    ).entries()) {
      const anchor = { x: index * 20, y: index * 20 };
      const extendsWest = corner === "ne" || corner === "se";
      const extendsNorth = corner === "ne" || corner === "nw";
      const cornerTransform = structureVisualTransform(
        placement(
          `architecture.wall.stone-01.corner-${corner}`,
          anchor,
          `corners.${corner}`,
        ),
      );
      const horizontal = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-4",
          { x: anchor.x + (extendsWest ? -8 : 4), y: anchor.y },
          `corners.${corner}.horizontal`,
        ),
      );
      const vertical = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-4",
          { x: anchor.x, y: anchor.y + (extendsNorth ? -8 : 4) },
          `corners.${corner}.vertical`,
        ),
      );
      const horizontalCornerSide = extendsWest ? "west" : "east";
      const verticalCornerSide = extendsNorth ? "north" : "south";
      sources.push(
        sourceAtSides(
          cornerTransform,
          horizontalCornerSide,
          verticalCornerSide,
        ),
        sourceAtSides(horizontal, extendsWest ? "east" : "west"),
        sourceAtSides(vertical, extendsNorth ? "south" : "north"),
      );
    }
    const analysis = analyzeStructureVisualContinuity(sources);

    expect(analysis.junctions).toHaveLength(8);
    expect(analysis.unpairedEndpoints).toEqual([]);
    expect(
      analysis.junctions.filter(({ compatible }) => compatible),
    ).toHaveLength(4);
    expect(
      analysis.junctions.filter(({ compatible }) => !compatible),
    ).toHaveLength(4);
    expect(
      new Set(
        analysis.junctions.flatMap(({ participants }) =>
          participants
            .filter(({ definitionId }) => definitionId.includes("corner-"))
            .map(({ definitionId }) => definitionId),
        ),
      ).size,
    ).toBe(4);
  });

  it("uses the shared structural profile for open and closed doors without moving them", () => {
    const sources: StructureVisualContinuitySource[] = [];
    for (const [index, state] of (["closed", "open"] as const).entries()) {
      const y = index * 10;
      const left = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-1",
          { x: -1, y },
          `door.${state}.left`,
        ),
      );
      const door = structureVisualTransform(
        placement(
          `architecture.wall.stone-01.door-horizontal.${state}`,
          { x: 0, y },
          `door.${state}`,
        ),
      );
      const right = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-1",
          { x: 4, y },
          `door.${state}.right`,
        ),
      );
      sources.push(
        sourceAtSides(left, "east"),
        sourceAtSides(door, "west", "east"),
        sourceAtSides(right, "west"),
      );
    }
    const analysis = analyzeStructureVisualContinuity(sources);

    expect(analysis.junctions).toHaveLength(4);
    expect(
      analysis.junctions.every(
        ({ metrics }) => metrics.longitudinal.relation === "aligned",
      ),
    ).toBe(true);
    expect(analysis.compatible).toBe(true);
    expect(analysis.junctions.every(({ issues }) => issues.length === 0)).toBe(
      true,
    );
    expect(
      new Set(
        analysis.junctions.flatMap(({ participants }) =>
          participants
            .filter(({ definitionId }) =>
              definitionId.includes("door-horizontal"),
            )
            .map(({ definitionId }) => definitionId),
        ),
      ).size,
    ).toBe(2);
    for (const state of ["closed", "open"] as const) {
      const door = structureVisualTransform(
        placement(
          `architecture.wall.stone-01.door-horizontal.${state}`,
          { x: 0, y: 0 },
          `profile.${state}`,
        ),
      );
      for (const plane of door.joinPlanes) {
        expect(plane.transverseProfile.axisRelativeInterval.start).toBe(0);
        expect(plane.transverseProfile.axisRelativeInterval.end).toBeCloseTo(
          45.76,
          10,
        );
        expect(plane.transverseProfile.thickness).toBeCloseTo(45.76, 10);
        expect(plane.visualProfile.end - plane.visualProfile.start).toBeCloseTo(
          state === "closed" ? 60.16 : 78.93333333333334,
          10,
        );
      }
    }
  });

  it("uses the exact geometry exposed by the procedural fallback", () => {
    const plan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    const transformAnalysis = analyzeStructureVisualContinuity(
      plan.map(({ transform }) => transform),
    );
    const fallbackAnalysis = analyzeStructureVisualContinuity(
      plan.map(({ depth, transform }) => {
        const fallback = structureVisualFallbackGeometry(transform, depth);
        return {
          definitionId: fallback.definitionId,
          joinPlanes: fallback.joinPlanes,
          placementKey: fallback.instanceId,
        };
      }),
    );

    expect(fallbackAnalysis).toEqual(transformAnalysis);
  });

  it("raises the three preserved compositions from 19/31 to 31/31", () => {
    const fixtures = [
      {
        afterCompatible: 8,
        beforeCompatible: 4,
        structure: INITIAL_WORLD_STRUCTURE,
      },
      {
        afterCompatible: 15,
        beforeCompatible: 11,
        structure: MODIFIED_WORLD_STRUCTURE,
      },
      {
        afterCompatible: 8,
        beforeCompatible: 4,
        structure: DOOR_STATES_WORLD_STRUCTURE,
      },
    ] as const;
    const beforeAnalyses: StructureVisualContinuityAnalysis[] = [];
    const afterAnalyses: StructureVisualContinuityAnalysis[] = [];

    for (const { afterCompatible, beforeCompatible, structure } of fixtures) {
      const stateBeforeAnalysis = JSON.stringify(structure);
      expect(validateWorldStructure(structure)).toBe(true);
      expect(analyzeStructurePerimeter(structure).closed).toBe(true);
      const before = unalignedAnalysisForStructure(structure);
      const after = analysisForStructure(structure);
      beforeAnalyses.push(before);
      afterAnalyses.push(after);

      expect(before.unpairedEndpoints).toEqual([]);
      expect(after.unpairedEndpoints).toEqual([]);
      expect(after.junctions).toHaveLength(afterCompatible);
      expect(
        before.junctions.filter(({ compatible }) => compatible),
      ).toHaveLength(beforeCompatible);
      expect(after.junctions.every(({ compatible }) => compatible)).toBe(true);
      expect(after.junctions.flatMap(({ issues }) => issues)).toEqual([]);
      expect(
        structureRenderPlan(structure).every(
          ({ transform }) =>
            transform.alignment.kind === "applied" &&
            transform.alignment.issues.length === 0,
        ),
      ).toBe(true);

      expect(
        after.junctions.map(({ key, metrics }) => ({
          key,
          longitudinal: metrics.longitudinal,
        })),
      ).toEqual(
        before.junctions.map(({ key, metrics }) => ({
          key,
          longitudinal: metrics.longitudinal,
        })),
      );
      expect(JSON.stringify(structure)).toBe(stateBeforeAnalysis);
    }

    expect(
      beforeAnalyses
        .flatMap(({ junctions }) => junctions)
        .filter(({ compatible }) => compatible),
    ).toHaveLength(19);
    expect(
      afterAnalyses
        .flatMap(({ junctions }) => junctions)
        .filter(({ compatible }) => compatible),
    ).toHaveLength(31);

    expect(
      beforeAnalyses
        .flatMap(({ junctions }) => junctions)
        .flatMap(({ issues }) => issues)
        .filter(({ kind }) => kind === "thickness-mismatch"),
    ).toEqual([]);

    const canonicalJumps = beforeAnalyses[0]?.junctions.flatMap(({ issues }) =>
      issues.flatMap((issue) =>
        issue.kind === "centerline-jump" ? [issue.distance] : [],
      ),
    );
    const modifiedJumps = beforeAnalyses[1]?.junctions.flatMap(({ issues }) =>
      issues.flatMap((issue) =>
        issue.kind === "centerline-jump" ? [issue.distance] : [],
      ),
    );
    expect(canonicalJumps).toEqual(
      expect.arrayContaining([expect.closeTo(25.12, 10)]),
    );
    expect(modifiedJumps).toEqual(
      expect.arrayContaining([expect.closeTo(45.76, 10)]),
    );
  });

  it("keeps the B2 door-state composition at 8/8 under the same oracle", () => {
    expect(validateWorldStructure(DOOR_STATES_WORLD_STRUCTURE)).toBe(true);
    expect(analyzeStructurePerimeter(DOOR_STATES_WORLD_STRUCTURE).closed).toBe(
      true,
    );
    const analysis = analysisForStructure(DOOR_STATES_WORLD_STRUCTURE);

    expect(analysis.unpairedEndpoints).toEqual([]);
    expect(analysis.junctions).toHaveLength(8);
    expect(
      analysis.junctions.filter(({ compatible }) => compatible),
    ).toHaveLength(8);
    expect(
      analysis.junctions
        .flatMap(({ issues }) => issues)
        .filter(({ kind }) => kind === "thickness-mismatch"),
    ).toEqual([]);
  });

  it("does not mutate or change renderer, depth, fallback or interaction values", () => {
    expect(STRUCTURE_VISUAL_ASSETS).toHaveLength(12);
    const beforePlan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    const before = JSON.stringify(
      beforePlan.map(({ depth, metadata, transform }) => ({
        alphaBounds: transform.alphaBounds,
        canvasBounds: transform.canvasBounds,
        depth,
        interactionRegions: transform.interactionRegions,
        joinOrigin: transform.joinOrigin,
        sourceReferencePx: metadata.sourceReferencePx,
        scale: transform.scale,
        spriteCanvasPosition: transform.spriteCanvasPosition,
        fallback: structureVisualFallbackGeometry(
          transform,
          structureVisualDepth(transform),
        ),
      })),
    );

    analyzeStructureVisualContinuity(
      beforePlan.map(({ transform }) => transform),
    );

    const afterPlan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    const after = JSON.stringify(
      afterPlan.map(({ depth, metadata, transform }) => ({
        alphaBounds: transform.alphaBounds,
        canvasBounds: transform.canvasBounds,
        depth,
        interactionRegions: transform.interactionRegions,
        joinOrigin: transform.joinOrigin,
        sourceReferencePx: metadata.sourceReferencePx,
        scale: transform.scale,
        spriteCanvasPosition: transform.spriteCanvasPosition,
        fallback: structureVisualFallbackGeometry(
          transform,
          structureVisualDepth(transform),
        ),
      })),
    );
    expect(after).toBe(before);
    expect(afterPlan.map(({ key }) => key)).toEqual(
      beforePlan.map(({ key }) => key),
    );
  });
});
