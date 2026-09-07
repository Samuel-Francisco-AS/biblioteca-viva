import {
  floorCellKey,
  logicalStructureIntervals,
  type EdgeAxis,
  type FloorCell,
  type LogicalStructureInterval,
  type LogicalStructureIntervalPart,
  type StructurePlacement,
  type UnitEdge,
  type WorldStructureState,
} from "../../../application";

export type StructureInteriorNormal =
  | {
      readonly axis: "x";
      readonly direction: "negative";
      readonly side: "west";
    }
  | {
      readonly axis: "x";
      readonly direction: "positive";
      readonly side: "east";
    }
  | {
      readonly axis: "y";
      readonly direction: "negative";
      readonly side: "north";
    }
  | {
      readonly axis: "y";
      readonly direction: "positive";
      readonly side: "south";
    };

export type StructureEdgeFloorRelation =
  "both-sides" | "neither-side" | "negative-only" | "positive-only";

export interface StructureEdgeFloorAdjacency {
  readonly edge: UnitEdge;
  readonly negativeCell: FloorCell;
  readonly negativeHasFloor: boolean;
  readonly positiveCell: FloorCell;
  readonly positiveHasFloor: boolean;
  readonly relation: StructureEdgeFloorRelation;
}

interface StructureInteriorNormalResolutionBase {
  readonly longitudinalAxis: EdgeAxis;
  readonly observations: readonly StructureEdgeFloorAdjacency[];
  readonly part: LogicalStructureIntervalPart;
}

export type StructureInteriorNormalResolution =
  | (StructureInteriorNormalResolutionBase & {
      readonly kind: "resolved";
      readonly normal: StructureInteriorNormal;
    })
  | (StructureInteriorNormalResolutionBase & {
      readonly kind: "ambiguous";
      readonly reason:
        "floor-on-both-sides" | "mixed-edge-adjacency" | "no-adjacent-floor";
    })
  | (StructureInteriorNormalResolutionBase & {
      readonly kind: "inconsistent";
      readonly normals: readonly [
        StructureInteriorNormal,
        StructureInteriorNormal,
      ];
      readonly reason: "contradictory-floor-sides";
    });

export interface StructurePlacementInteriorNormals {
  readonly parts: readonly StructureInteriorNormalResolution[];
}

/**
 * Resolves each logical arm from floor adjacency only. Placement order,
 * blueprint identity and visual metadata do not participate.
 */
export function resolveStructureInteriorNormals(
  state: WorldStructureState,
  placement: StructurePlacement,
): StructurePlacementInteriorNormals {
  const floorCells = new Set(state.floorCells.map(floorCellKey));
  const parts = logicalStructureIntervals([placement]).map((interval) =>
    resolveIntervalInteriorNormal(interval, floorCells),
  );
  return Object.freeze({
    parts: Object.freeze(parts),
  });
}

function resolveIntervalInteriorNormal(
  interval: LogicalStructureInterval,
  floorCells: ReadonlySet<string>,
): StructureInteriorNormalResolution {
  const observations = Object.freeze(
    intervalEdges(interval).map((edge) => observeEdge(edge, floorCells)),
  );
  const negative = observations.some(
    ({ relation }) => relation === "negative-only",
  );
  const positive = observations.some(
    ({ relation }) => relation === "positive-only",
  );
  const base = {
    longitudinalAxis: interval.axis,
    observations,
    part: interval.part,
  } as const;

  if (negative && positive) {
    const normals: readonly [StructureInteriorNormal, StructureInteriorNormal] =
      [
        interiorNormal(interval.axis, "negative"),
        interiorNormal(interval.axis, "positive"),
      ];
    return Object.freeze({
      ...base,
      kind: "inconsistent",
      normals: Object.freeze(normals),
      reason: "contradictory-floor-sides",
    });
  }

  const allNegative = observations.every(
    ({ relation }) => relation === "negative-only",
  );
  const allPositive = observations.every(
    ({ relation }) => relation === "positive-only",
  );
  if (allNegative || allPositive) {
    return Object.freeze({
      ...base,
      kind: "resolved",
      normal: interiorNormal(
        interval.axis,
        allNegative ? "negative" : "positive",
      ),
    });
  }

  const allWithoutFloor = observations.every(
    ({ relation }) => relation === "neither-side",
  );
  const allWithFloorOnBothSides = observations.every(
    ({ relation }) => relation === "both-sides",
  );
  return Object.freeze({
    ...base,
    kind: "ambiguous",
    reason: allWithoutFloor
      ? "no-adjacent-floor"
      : allWithFloorOnBothSides
        ? "floor-on-both-sides"
        : "mixed-edge-adjacency",
  });
}

function observeEdge(
  edge: UnitEdge,
  floorCells: ReadonlySet<string>,
): StructureEdgeFloorAdjacency {
  const negativeCell =
    edge.axis === "horizontal"
      ? { x: edge.x, y: edge.y - 1 }
      : { x: edge.x - 1, y: edge.y };
  const positiveCell = { x: edge.x, y: edge.y };
  const negativeHasFloor = floorCells.has(floorCellKey(negativeCell));
  const positiveHasFloor = floorCells.has(floorCellKey(positiveCell));
  return Object.freeze({
    edge: Object.freeze({ ...edge }),
    negativeCell: Object.freeze(negativeCell),
    negativeHasFloor,
    positiveCell: Object.freeze(positiveCell),
    positiveHasFloor,
    relation:
      negativeHasFloor && positiveHasFloor
        ? "both-sides"
        : negativeHasFloor
          ? "negative-only"
          : positiveHasFloor
            ? "positive-only"
            : "neither-side",
  });
}

function intervalEdges(
  interval: LogicalStructureInterval,
): readonly UnitEdge[] {
  return Object.freeze(
    Array.from({ length: interval.spanCells }, (_unused, offset) =>
      Object.freeze({
        axis: interval.axis,
        x: interval.start.x + (interval.axis === "horizontal" ? offset : 0),
        y: interval.start.y + (interval.axis === "vertical" ? offset : 0),
      }),
    ),
  );
}

function interiorNormal(
  longitudinalAxis: EdgeAxis,
  direction: "negative" | "positive",
): StructureInteriorNormal {
  if (longitudinalAxis === "horizontal") {
    return direction === "negative"
      ? Object.freeze({ axis: "y", direction, side: "north" })
      : Object.freeze({ axis: "y", direction, side: "south" });
  }
  return direction === "negative"
    ? Object.freeze({ axis: "x", direction, side: "west" })
    : Object.freeze({ axis: "x", direction, side: "east" });
}
