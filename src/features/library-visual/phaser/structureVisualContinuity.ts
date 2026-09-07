import type { EdgeAxis, GridPoint } from "../../../application";

import type {
  StructureVisualDefinitionId,
  TransverseOccupiedSide,
  WorldJoinPlane,
  WorldTransverseProfile,
} from "./structureVisualGeometry";

export interface StructureVisualContinuitySource {
  readonly definitionId: StructureVisualDefinitionId;
  readonly joinPlanes: readonly WorldJoinPlane[];
  readonly placementKey: string;
}

export interface StructureVisualJunctionParticipant {
  readonly definitionId: StructureVisualDefinitionId;
  readonly placementKey: string;
  readonly plane: WorldJoinPlane;
}

export type StructureVisualContinuityIssue =
  | {
      readonly distance: number;
      readonly kind: "longitudinal-gap" | "longitudinal-overlap";
    }
  | {
      readonly first: TransverseOccupiedSide;
      readonly kind: "transverse-side-mismatch";
      readonly second: TransverseOccupiedSide;
    }
  | {
      readonly distance: number;
      readonly kind: "centerline-jump" | "transverse-gap";
    }
  | {
      readonly kind: "transverse-overlap";
      readonly overlap: number;
    }
  | {
      readonly endDifference: number;
      readonly kind: "transverse-interval-mismatch";
      readonly startDifference: number;
    }
  | {
      readonly difference: number;
      readonly kind: "thickness-mismatch";
    };

export type LongitudinalPlaneRelation = "aligned" | "gap" | "overlap";
export type TransverseIntervalRelation =
  "aligned" | "contained" | "disjoint" | "partial-overlap" | "touching";

export interface StructureVisualJunctionMetrics {
  readonly longitudinal: {
    /** Positive is a gap; negative is an overlap. */
    readonly signedDistance: number;
    readonly relation: LongitudinalPlaneRelation;
    /** The asset contract requires exact longitudinal planes. */
    readonly tolerance: 0;
  };
  readonly transverse: {
    readonly centerlineDifference: number;
    readonly endDifference: number;
    readonly first: WorldTransverseProfile;
    readonly gap: number;
    readonly intervalRelation: TransverseIntervalRelation;
    readonly overlap: number;
    readonly second: WorldTransverseProfile;
    readonly startDifference: number;
    readonly thicknessDifference: number;
    /** At most one source pixel, converted by the coarser input scale. */
    readonly tolerance: number;
  };
}

export interface StructureVisualJunctionAnalysis {
  readonly compatible: boolean;
  readonly issues: readonly StructureVisualContinuityIssue[];
  readonly key: string;
  readonly logicalEndpoint: GridPoint;
  readonly longitudinalAxis: EdgeAxis;
  /** Ordered from the negative-coordinate run into the positive-coordinate run. */
  readonly participants: readonly StructureVisualJunctionParticipant[];
  readonly metrics: StructureVisualJunctionMetrics;
}

export interface UnpairedStructureVisualEndpoint {
  readonly key: string;
  readonly logicalEndpoint: GridPoint;
  readonly longitudinalAxis: EdgeAxis;
  readonly participants: readonly StructureVisualJunctionParticipant[];
  readonly reason: "ambiguous-opposite-planes" | "missing-opposite-plane";
}

export interface StructureVisualContinuityAnalysis {
  readonly compatible: boolean;
  readonly junctions: readonly StructureVisualJunctionAnalysis[];
  readonly unpairedEndpoints: readonly UnpairedStructureVisualEndpoint[];
}

/**
 * Pure collection oracle. Neighbour discovery is explicit in the supplied
 * sources and uses logical endpoint + tangent axis, never blueprint identity.
 */
export function analyzeStructureVisualContinuity(
  sources: readonly StructureVisualContinuitySource[],
): StructureVisualContinuityAnalysis {
  const grouped = new Map<string, StructureVisualJunctionParticipant[]>();
  for (const source of sources) {
    for (const plane of source.joinPlanes) {
      assertPlane(plane, source.placementKey);
      const participant = Object.freeze({
        definitionId: source.definitionId,
        placementKey: source.placementKey,
        plane,
      });
      const key = endpointKey(plane.longitudinalAxis, plane.logicalEndpoint);
      grouped.set(key, [...(grouped.get(key) ?? []), participant]);
    }
  }

  const junctions: StructureVisualJunctionAnalysis[] = [];
  const unpairedEndpoints: UnpairedStructureVisualEndpoint[] = [];
  for (const [key, unsortedParticipants] of [...grouped].sort(
    ([first], [second]) => first.localeCompare(second),
  )) {
    const participants = Object.freeze(
      [...unsortedParticipants].sort(compareParticipants),
    );
    const firstPlane = participants[0]?.plane;
    if (!firstPlane) continue;
    const { longitudinalAxis, logicalEndpoint } = firstPlane;
    const [negativeRunEndSide, positiveRunStartSide] =
      opposingSides(longitudinalAxis);
    const negativeRunEnds = participants.filter(
      ({ plane }) => plane.side === negativeRunEndSide,
    );
    const positiveRunStarts = participants.filter(
      ({ plane }) => plane.side === positiveRunStartSide,
    );
    const negativeRunEnd = negativeRunEnds[0];
    const positiveRunStart = positiveRunStarts[0];

    if (
      participants.length !== 2 ||
      negativeRunEnds.length !== 1 ||
      positiveRunStarts.length !== 1 ||
      !negativeRunEnd ||
      !positiveRunStart
    ) {
      unpairedEndpoints.push(
        Object.freeze({
          key,
          logicalEndpoint: freezePoint(logicalEndpoint),
          longitudinalAxis,
          participants,
          reason:
            participants.length > 1
              ? "ambiguous-opposite-planes"
              : "missing-opposite-plane",
        }),
      );
      continue;
    }

    junctions.push(compareJunction(key, negativeRunEnd, positiveRunStart));
  }

  return Object.freeze({
    compatible:
      unpairedEndpoints.length === 0 &&
      junctions.every(({ compatible }) => compatible),
    junctions: Object.freeze(junctions),
    unpairedEndpoints: Object.freeze(unpairedEndpoints),
  });
}

function compareJunction(
  key: string,
  negativeRunEnd: StructureVisualJunctionParticipant,
  positiveRunStart: StructureVisualJunctionParticipant,
): StructureVisualJunctionAnalysis {
  const firstPlane = negativeRunEnd.plane;
  const secondPlane = positiveRunStart.plane;
  const first = firstPlane.transverseProfile;
  const second = secondPlane.transverseProfile;
  const longitudinalDistance = secondPlane.coordinate - firstPlane.coordinate;
  const startDifference = Math.abs(
    first.axisRelativeInterval.start - second.axisRelativeInterval.start,
  );
  const endDifference = Math.abs(
    first.axisRelativeInterval.end - second.axisRelativeInterval.end,
  );
  const centerlineDifference = Math.abs(
    first.axisRelativeCenterline - second.axisRelativeCenterline,
  );
  const thicknessDifference = Math.abs(first.thickness - second.thickness);
  const tolerance = Math.max(
    first.sourcePixelTolerance,
    second.sourcePixelTolerance,
  );
  const gap = Math.max(
    0,
    Math.max(
      first.axisRelativeInterval.start,
      second.axisRelativeInterval.start,
    ) -
      Math.min(first.axisRelativeInterval.end, second.axisRelativeInterval.end),
  );
  const overlap = Math.max(
    0,
    Math.min(first.axisRelativeInterval.end, second.axisRelativeInterval.end) -
      Math.max(
        first.axisRelativeInterval.start,
        second.axisRelativeInterval.start,
      ),
  );
  const intervalAligned =
    startDifference <= tolerance && endDifference <= tolerance;
  const intervalRelation = transverseIntervalRelation(
    first,
    second,
    gap,
    overlap,
    intervalAligned,
  );
  const issues: StructureVisualContinuityIssue[] = [];

  if (longitudinalDistance > 0)
    issues.push(
      Object.freeze({
        distance: longitudinalDistance,
        kind: "longitudinal-gap",
      }),
    );
  else if (longitudinalDistance < 0)
    issues.push(
      Object.freeze({
        distance: Math.abs(longitudinalDistance),
        kind: "longitudinal-overlap",
      }),
    );
  if (first.occupiedSide !== second.occupiedSide)
    issues.push(
      Object.freeze({
        first: first.occupiedSide,
        kind: "transverse-side-mismatch",
        second: second.occupiedSide,
      }),
    );
  if (centerlineDifference > tolerance)
    issues.push(
      Object.freeze({
        distance: centerlineDifference,
        kind: "centerline-jump",
      }),
    );
  if (gap > tolerance)
    issues.push(Object.freeze({ distance: gap, kind: "transverse-gap" }));
  if (intervalRelation === "partial-overlap" && !intervalAligned)
    issues.push(Object.freeze({ kind: "transverse-overlap", overlap }));
  if (!intervalAligned)
    issues.push(
      Object.freeze({
        endDifference,
        kind: "transverse-interval-mismatch",
        startDifference,
      }),
    );
  if (thicknessDifference > tolerance)
    issues.push(
      Object.freeze({
        difference: thicknessDifference,
        kind: "thickness-mismatch",
      }),
    );

  return Object.freeze({
    compatible: issues.length === 0,
    issues: Object.freeze(issues),
    key,
    logicalEndpoint: freezePoint(firstPlane.logicalEndpoint),
    longitudinalAxis: firstPlane.longitudinalAxis,
    metrics: Object.freeze({
      longitudinal: Object.freeze({
        relation:
          longitudinalDistance > 0
            ? "gap"
            : longitudinalDistance < 0
              ? "overlap"
              : "aligned",
        signedDistance: longitudinalDistance,
        tolerance: 0,
      }),
      transverse: Object.freeze({
        centerlineDifference,
        endDifference,
        first,
        gap,
        intervalRelation,
        overlap,
        second,
        startDifference,
        thicknessDifference,
        tolerance,
      }),
    }),
    participants: Object.freeze([negativeRunEnd, positiveRunStart]),
  });
}

function transverseIntervalRelation(
  first: WorldTransverseProfile,
  second: WorldTransverseProfile,
  gap: number,
  overlap: number,
  aligned: boolean,
): TransverseIntervalRelation {
  if (aligned) return "aligned";
  if (gap > 0) return "disjoint";
  if (overlap === 0) return "touching";
  if (contains(first, second) || contains(second, first)) return "contained";
  return "partial-overlap";
}

function contains(
  outer: WorldTransverseProfile,
  inner: WorldTransverseProfile,
): boolean {
  return (
    outer.axisRelativeInterval.start <= inner.axisRelativeInterval.start &&
    outer.axisRelativeInterval.end >= inner.axisRelativeInterval.end
  );
}

function opposingSides(
  axis: EdgeAxis,
): readonly ["east" | "south", "north" | "west"] {
  return axis === "horizontal" ? ["east", "west"] : ["south", "north"];
}

function compareParticipants(
  first: StructureVisualJunctionParticipant,
  second: StructureVisualJunctionParticipant,
): number {
  return (
    first.placementKey.localeCompare(second.placementKey) ||
    first.plane.part.localeCompare(second.plane.part) ||
    first.plane.side.localeCompare(second.plane.side)
  );
}

function endpointKey(axis: EdgeAxis, point: GridPoint): string {
  return `${axis}:${normalizeZero(point.x)}:${normalizeZero(point.y)}`;
}

function assertPlane(plane: WorldJoinPlane, placementKey: string): void {
  const profile = plane.transverseProfile;
  if (
    !Number.isFinite(plane.coordinate) ||
    !Number.isFinite(plane.logicalEndpoint.x) ||
    !Number.isFinite(plane.logicalEndpoint.y) ||
    !Number.isFinite(profile.interval.start) ||
    !Number.isFinite(profile.interval.end) ||
    profile.interval.start >= profile.interval.end ||
    !Number.isFinite(profile.axisRelativeInterval.start) ||
    !Number.isFinite(profile.axisRelativeInterval.end) ||
    profile.axisRelativeInterval.start >= profile.axisRelativeInterval.end ||
    !Number.isFinite(profile.axisRelativeCenterline) ||
    !Number.isFinite(profile.centerline) ||
    !Number.isFinite(profile.logicalAxisCoordinate) ||
    !Number.isFinite(profile.thickness) ||
    profile.thickness <= 0 ||
    !Number.isFinite(profile.sourcePixelTolerance) ||
    profile.sourcePixelTolerance <= 0
  )
    throw new Error(`Plano visual inválido: ${placementKey}`);
  const expectedAxis = plane.axis === "x" ? "horizontal" : "vertical";
  const expectedNormal =
    plane.axis === "x"
      ? { axis: "y", negativeDirection: "north", positiveDirection: "south" }
      : { axis: "x", negativeDirection: "west", positiveDirection: "east" };
  if (
    plane.longitudinalAxis !== expectedAxis ||
    profile.normal.axis !== expectedNormal.axis ||
    profile.normal.negativeDirection !== expectedNormal.negativeDirection ||
    profile.normal.positiveDirection !== expectedNormal.positiveDirection ||
    profile.interval.start !== plane.profile.start ||
    profile.interval.end !== plane.profile.end
  )
    throw new Error(`Contrato transversal incoerente: ${placementKey}`);
}

function freezePoint(point: GridPoint): GridPoint {
  return Object.freeze({ x: point.x, y: point.y });
}

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}
