import { describe, expect, it } from "vitest";

import cornerContract from "../../../../art-guides/w3-a-r2-a/wall-corner-contract.json";
import validatorReport from "../../../../art-guides/w3-a-r2-a/validator-report.json";
import {
  INITIAL_WORLD_STRUCTURE,
  placementGeometry,
  structureDefinition,
  type CornerOrientation,
  type GridPoint,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";

import { CELL_SIZE } from "./spatialWorld";
import {
  HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
  STRUCTURE_CONNECTION_PROFILE_CLASSES,
  STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX,
  STRUCTURE_VISUAL_ASSETS,
  structureConnectionProfileClass,
  structureVisualAsset,
  structureVisualTransform,
  structureVisualTransforms,
  transformStructureVisual,
  validateStructureVisualCatalog,
  type StructureVisualTransform,
  type StructureVisualSide,
} from "./structureVisualGeometry";
import { resolveStructureInteriorNormals } from "./structureVisualTopology";
import { WALL_ASSETS, validateWallAssetCatalog } from "./wallAssets";

const CORNER_IDS: Readonly<Record<CornerOrientation, StructureDefinitionId>> = {
  ne: "architecture.wall.stone-01.corner-ne",
  nw: "architecture.wall.stone-01.corner-nw",
  se: "architecture.wall.stone-01.corner-se",
  sw: "architecture.wall.stone-01.corner-sw",
};

function placement(
  definitionId: StructureDefinitionId,
  anchor: GridPoint = { x: 0, y: 0 },
  instanceId = `fixture.${definitionId}`,
): StructurePlacement {
  return { anchor, definitionId, instanceId };
}

function requiredMetadata(definitionId: StructureDefinitionId) {
  const metadata = structureVisualAsset(definitionId);
  if (!metadata) throw new Error(`Fixture sem metadado: ${definitionId}`);
  return metadata;
}

function requiredDefinition(definitionId: StructureDefinitionId) {
  const definition = structureDefinition(definitionId);
  if (!definition) throw new Error(`Fixture sem definição: ${definitionId}`);
  return definition;
}

function joinPlane(
  transform: StructureVisualTransform,
  side: StructureVisualSide,
) {
  const result = transform.joinPlanes.find(
    (candidate) => candidate.side === side,
  );
  if (!result)
    throw new Error(`Plano ${side} ausente em ${transform.definitionId}`);
  return result;
}

function expectSamePlane(
  first: StructureVisualTransform,
  firstSide: StructureVisualSide,
  second: StructureVisualTransform,
  secondSide: StructureVisualSide,
): void {
  const firstPlane = joinPlane(first, firstSide);
  const secondPlane = joinPlane(second, secondSide);
  expect(firstPlane.axis).toBe(secondPlane.axis);
  expect(firstPlane.coordinate).toBeCloseTo(secondPlane.coordinate, 10);
}

function parseGeometry(value: string) {
  const match = /^(\d+)x(\d+)(?:\+(\d+)\+(\d+))?$/u.exec(value);
  if (!match) throw new Error(`Geometria de fixture inválida: ${value}`);
  return {
    height: Number(match[2]),
    width: Number(match[1]),
    x: Number(match[3] ?? 0),
    y: Number(match[4] ?? 0),
  };
}

function structureWithFloor(
  subject: StructurePlacement,
  floorCells: readonly GridPoint[],
): WorldStructureState {
  return {
    ...INITIAL_WORLD_STRUCTURE,
    floorCells,
    placements: [subject],
  };
}

function topologyTransform(
  subject: StructurePlacement,
  floorCells: readonly GridPoint[],
): StructureVisualTransform {
  const structure = structureWithFloor(subject, floorCells);
  return structureVisualTransform(
    subject,
    resolveStructureInteriorNormals(structure, subject),
  );
}

describe("W3-A-R3-A canonical visual metadata", () => {
  it("covers exactly the 12 active structural definitions", () => {
    expect(validateStructureVisualCatalog()).toBe(true);
    expect(STRUCTURE_VISUAL_ASSETS).toHaveLength(12);
    expect(
      new Set(STRUCTURE_VISUAL_ASSETS.map(({ definitionId }) => definitionId))
        .size,
    ).toBe(12);
    expect(
      STRUCTURE_VISUAL_ASSETS.map(({ definitionId }) => definitionId).sort(),
    ).toEqual(WALL_ASSETS.map(({ id }) => id).sort());
  });

  it("matches all measured canvas and alpha bounds from the generated report", () => {
    for (const reported of validatorReport.assets) {
      const metadata = STRUCTURE_VISUAL_ASSETS.find(({ runtimePath }) =>
        runtimePath.endsWith(`/${reported.name}`),
      );
      if (!metadata)
        throw new Error(`Asset reportado sem metadado: ${reported.name}`);
      const canvas = parseGeometry(reported.canvas);
      const alpha = parseGeometry(reported.alphaBounds);
      expect(metadata.canvasPx).toEqual({
        height: canvas.height,
        width: canvas.width,
      });
      expect(metadata.alphaBoundsPx).toEqual(alpha);
      expect(metadata.sourcePixelsPerCell).toBe(
        cornerContract.pixelsPerLogicalCell,
      );
    }
  });

  it("matches every production corner vertex, region and external join plane", () => {
    for (const contracted of cornerContract.orientations) {
      const definitionId = STRUCTURE_VISUAL_ASSETS.find(
        ({ corner }) => corner === contracted.id,
      )?.definitionId;
      if (!definitionId)
        throw new Error(`Orientação contratual desconhecida: ${contracted.id}`);
      const metadata = requiredMetadata(definitionId);
      expect(metadata.sourceReferencePx).toEqual(contracted.logicalVertex);
      expect(metadata.occupiedRegionsPx.map(({ bounds }) => bounds)).toEqual(
        contracted.allowedAlphaRectangles,
      );
      expect(
        metadata.joinPlanesPx.map(({ axis, coordinate, side }) => ({
          axis,
          coordinate,
          side,
        })),
      ).toEqual(
        contracted.externalJoinPlanes.map(({ axis, coordinate, side }) => ({
          axis,
          coordinate,
          side,
        })),
      );
      expect(metadata.canvasPx).toEqual(cornerContract.cornerCanvas);
      expect(metadata.alphaBoundsPx).toEqual({
        height: 1200,
        width: 1200,
        x: cornerContract.outerPaddingPx,
        y: cornerContract.outerPaddingPx,
      });
    }
  });

  it("resolves one shared structural corridor for horizontal walls, corner arms and doors", () => {
    const contracted = cornerContract.referenceProfiles.horizontal;
    const profileClass = structureConnectionProfileClass(
      HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
    );

    expect(STRUCTURE_CONNECTION_PROFILE_CLASSES).toHaveLength(1);
    expect(profileClass).toEqual({
      axis: "horizontal",
      compatibilityClass: contracted.compatibilityClass,
      referenceAsset: contracted.asset,
      sourceInterval: {
        end: contracted.alphaEndExclusive,
        start: contracted.alphaStart,
      },
      sourceThicknessPx: contracted.alphaThickness,
    });
    expect(contracted.alphaEndExclusive - contracted.alphaStart).toBe(429);
    expect(contracted.semantics).toMatchObject({
      alphaOutsideProfile: "visual-envelope-only",
      endpointSupportTolerance: "tolerancePx.transverseProfileEdge",
      kind: "continuous-structural-connection-profile",
    });
    expect(
      cornerContract.assets
        .filter(({ axis }) => axis === "horizontal")
        .every(
          ({ connectionProfileClass }) =>
            connectionProfileClass === contracted.compatibilityClass,
        ),
    ).toBe(true);
    expect(
      cornerContract.orientations.every(
        ({ horizontalConnectionProfileClass }) =>
          horizontalConnectionProfileClass === contracted.compatibilityClass,
      ),
    ).toBe(true);
    for (const metadata of STRUCTURE_VISUAL_ASSETS) {
      for (const plane of metadata.joinPlanesPx) {
        if (plane.axis === "x") {
          expect(plane.connectionProfile).toMatchObject({
            compatibilityClass: HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
            kind: "compatibility-reference",
          });
          expect(plane.profile.end - plane.profile.start).toBe(429);
        } else {
          expect(plane.connectionProfile).toEqual({ kind: "measured" });
        }
      }
    }
  });

  it("keeps door alpha envelopes distinct while both endpoints use [24,453)", () => {
    const closed = requiredMetadata(
      "architecture.wall.stone-01.door-horizontal.closed",
    );
    const open = requiredMetadata(
      "architecture.wall.stone-01.door-horizontal.open",
    );

    expect(closed.alphaBoundsPx).toEqual({
      height: 564,
      width: 1200,
      x: 24,
      y: 24,
    });
    expect(open.alphaBoundsPx).toEqual({
      height: 740,
      width: 1200,
      x: 24,
      y: 24,
    });
    for (const metadata of [closed, open]) {
      expect(metadata.joinPlanesPx.map(({ profile }) => profile)).toEqual([
        { end: 453, start: 24 },
        { end: 453, start: 24 },
      ]);
      expect(
        metadata.joinPlanesPx.map(({ connectionProfile }) =>
          connectionProfile.kind === "compatibility-reference"
            ? connectionProfile.compatibilityClass
            : connectionProfile.kind,
        ),
      ).toEqual([
        HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
        HORIZONTAL_STRUCTURE_CONNECTION_PROFILE_CLASS,
      ]);
    }
    expect(closed.joinPlanesPx[0]?.visualProfile).toEqual({
      end: 588,
      start: 24,
    });
    expect(open.joinPlanesPx[0]?.visualProfile).toEqual({
      end: 764,
      start: 24,
    });
  });

  it("derives scale from the existing CELL_SIZE authority", () => {
    const transformed = structureVisualTransform(
      placement("architecture.wall.stone-01.horizontal-1"),
    );
    expect(transformed.scale).toBe(CELL_SIZE / 300);
    expect(transformed.alphaBounds.width).toBeCloseTo(CELL_SIZE, 10);
  });

  it("adds measured longitudinal seam coverage only to straight sprites", () => {
    for (const metadata of STRUCTURE_VISUAL_ASSETS) {
      const transformed = structureVisualTransform(
        placement(metadata.definitionId),
      );
      const rendering = transformed.spriteRendering;

      if (metadata.role === "corner") {
        expect(rendering).toEqual({
          longitudinalOverdraw: undefined,
          position: transformed.spriteCanvasPosition,
          scale: { x: transformed.scale, y: transformed.scale },
        });
        continue;
      }

      const longitudinalAxis =
        metadata.orientation === "horizontal" ? "x" : "y";
      const transverseAxis = longitudinalAxis === "x" ? "y" : "x";
      const worldOverdraw =
        STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX * transformed.scale;
      expect(rendering.longitudinalOverdraw).toEqual({
        axis: metadata.orientation,
        sourcePixelsPerEndpoint: STRUCTURE_LONGITUDINAL_SEAM_OVERDRAW_SOURCE_PX,
        worldUnitsPerEndpoint: worldOverdraw,
      });
      expect(rendering.position[transverseAxis]).toBe(
        transformed.spriteCanvasPosition[transverseAxis],
      );
      expect(rendering.scale[transverseAxis]).toBe(transformed.scale);

      for (const [index, sourcePlane] of metadata.joinPlanesPx.entries()) {
        const renderedCoordinate =
          rendering.position[longitudinalAxis] +
          sourcePlane.coordinate * rendering.scale[longitudinalAxis];
        const expectedDirection =
          sourcePlane.side === "west" || sourcePlane.side === "north" ? -1 : 1;
        expect(renderedCoordinate).toBeCloseTo(
          (transformed.joinPlanes[index]?.coordinate ?? Number.NaN) +
            expectedDirection * worldOverdraw,
          10,
        );
      }
    }
  });

  it("keeps the legacy wallAssets API stable as a compatibility projection", () => {
    expect(validateWallAssetCatalog()).toBe(true);
    expect(
      WALL_ASSETS.map(
        ({ corner, id, logicalLengthCells, offset, orientation, role }) => ({
          corner,
          id,
          logicalLengthCells,
          offset,
          orientation,
          role,
        }),
      ),
    ).toEqual([
      {
        corner: "ne",
        id: "architecture.wall.stone-01.corner-ne",
        logicalLengthCells: 4,
        offset: { xCells: -4, yCells: -4 },
        orientation: "horizontal",
        role: "corner",
      },
      {
        corner: "nw",
        id: "architecture.wall.stone-01.corner-nw",
        logicalLengthCells: 4,
        offset: { xCells: 0, yCells: -4 },
        orientation: "horizontal",
        role: "corner",
      },
      {
        corner: "se",
        id: "architecture.wall.stone-01.corner-se",
        logicalLengthCells: 4,
        offset: { xCells: -4, yCells: 0 },
        orientation: "horizontal",
        role: "corner",
      },
      {
        corner: "sw",
        id: "architecture.wall.stone-01.corner-sw",
        logicalLengthCells: 4,
        offset: { xCells: 0, yCells: 0 },
        orientation: "horizontal",
        role: "corner",
      },
      ...(["closed", "open"] as const).map((state) => ({
        corner: undefined,
        id: `architecture.wall.stone-01.door-horizontal.${state}`,
        logicalLengthCells: 4,
        offset: { xCells: -1, yCells: 0 },
        orientation: "horizontal",
        role: "door-horizontal",
      })),
      ...([1, 2, 4] as const).flatMap((span) => [
        {
          corner: undefined,
          id: `architecture.wall.stone-01.horizontal-${span}`,
          logicalLengthCells: span,
          offset: { xCells: 0, yCells: 0 },
          orientation: "horizontal",
          role: "segment-horizontal",
        },
        {
          corner: undefined,
          id: `architecture.wall.stone-01.vertical-${span}`,
          logicalLengthCells: span,
          offset: { xCells: 0, yCells: 0 },
          orientation: "vertical",
          role: "segment-vertical",
        },
      ]),
    ]);
  });
});

describe("W3-A-R3-A pure visual transform", () => {
  it.each([
    {
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      floorCells: [{ x: 0, y: 0 }],
      interval: { end: 429 * (CELL_SIZE / 300), start: 0 },
      translation: { x: 0, y: 0 },
    },
    {
      definitionId: "architecture.wall.stone-01.horizontal-1" as const,
      floorCells: [{ x: 0, y: -1 }],
      interval: { end: 0, start: -429 * (CELL_SIZE / 300) },
      translation: { x: 0, y: -429 * (CELL_SIZE / 300) },
    },
    {
      definitionId: "architecture.wall.stone-01.vertical-1" as const,
      floorCells: [{ x: 0, y: 0 }],
      interval: { end: 235 * (CELL_SIZE / 300), start: 0 },
      translation: { x: 0, y: 0 },
    },
    {
      definitionId: "architecture.wall.stone-01.vertical-1" as const,
      floorCells: [{ x: -1, y: 0 }],
      interval: { end: 0, start: -235 * (CELL_SIZE / 300) },
      translation: { x: -235 * (CELL_SIZE / 300), y: 0 },
    },
  ])(
    "maps the $definitionId profile to the signed $interval interval",
    ({ definitionId, floorCells, interval, translation }) => {
      const transformed = topologyTransform(
        placement(definitionId),
        floorCells,
      );

      expect(transformed.alignment).toMatchObject({
        issues: [],
        kind: "applied",
        translation,
      });
      for (const plane of transformed.joinPlanes) {
        expect(plane.transverseProfile.axisRelativeInterval).toEqual(interval);
        expect(plane.transverseProfile.axisRelativeCenterline).toBe(
          (interval.start + interval.end) / 2,
        );
        expect(plane.transverseProfile.thickness).toBeCloseTo(
          interval.end - interval.start,
          10,
        );
      }
    },
  );

  it.each([
    ["architecture.wall.stone-01.horizontal-1", "horizontal", 1, 429],
    ["architecture.wall.stone-01.horizontal-2", "horizontal", 2, 429],
    ["architecture.wall.stone-01.horizontal-4", "horizontal", 4, 429],
    ["architecture.wall.stone-01.vertical-1", "vertical", 1, 235],
    ["architecture.wall.stone-01.vertical-2", "vertical", 2, 235],
    ["architecture.wall.stone-01.vertical-4", "vertical", 4, 236],
  ] as const)(
    "preserves the measured thickness of %s under negative alignment",
    (definitionId, axis, span, thicknessPx) => {
      const subject = placement(definitionId);
      const floorCells = Array.from({ length: span }, (_unused, offset) =>
        axis === "horizontal" ? { x: offset, y: -1 } : { x: -1, y: offset },
      );
      const transformed = topologyTransform(subject, floorCells);

      expect(transformed.alignment.kind).toBe("applied");
      for (const plane of transformed.joinPlanes) {
        expect(plane.transverseProfile.axisRelativeInterval).toEqual({
          end: 0,
          start: -thicknessPx * (CELL_SIZE / 300),
        });
        expect(plane.transverseProfile.thickness).toBeCloseTo(
          thicknessPx * (CELL_SIZE / 300),
          10,
        );
      }
    },
  );

  it("keeps both door states on the shared profile while their envelopes remain distinct", () => {
    const transforms = (["closed", "open"] as const).map((state) => {
      const subject = placement(
        `architecture.wall.stone-01.door-horizontal.${state}`,
      );
      return topologyTransform(
        subject,
        Array.from({ length: 4 }, (_unused, x) => ({ x, y: -1 })),
      );
    });

    for (const transformed of transforms) {
      expect(transformed.alignment.translation.y).toBeCloseTo(-45.76, 10);
      for (const plane of transformed.joinPlanes) {
        expect(plane.transverseProfile.axisRelativeInterval.end).toBe(0);
        expect(plane.transverseProfile.axisRelativeInterval.start).toBeCloseTo(
          -45.76,
          10,
        );
      }
    }
    expect(transforms[0]?.alphaBounds.height).not.toBe(
      transforms[1]?.alphaBounds.height,
    );
  });

  it("preserves an ambiguous placement and exposes a typed diagnostic", () => {
    const subject = placement("architecture.wall.stone-01.horizontal-1");
    const original = structureVisualTransform(subject);
    const transformed = topologyTransform(subject, []);

    expect(transformed.alignment).toMatchObject({
      issues: [
        {
          kind: "ambiguous-interior-normal",
          part: "main",
          reason: "no-adjacent-floor",
        },
      ],
      kind: "preserved",
      translation: { x: 0, y: 0 },
    });
    expect(transformed.spriteCanvasPosition).toEqual(
      original.spriteCanvasPosition,
    );
  });

  it("preserves a placement whose unit edges resolve contradictory normals", () => {
    const subject = placement("architecture.wall.stone-01.horizontal-2");
    const original = structureVisualTransform(subject);
    const transformed = topologyTransform(subject, [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
    ]);

    expect(transformed.alignment).toMatchObject({
      issues: [
        {
          kind: "inconsistent-interior-normal",
          part: "main",
          reason: "contradictory-floor-sides",
        },
      ],
      kind: "preserved",
      translation: { x: 0, y: 0 },
    });
    expect(transformed.spriteCanvasPosition).toEqual(
      original.spriteCanvasPosition,
    );
  });

  it("rejects disagreeing same-axis constraints without averaging", () => {
    const subject = placement("architecture.wall.stone-01.vertical-1");
    const definition = requiredDefinition(subject.definitionId);
    const geometry = placementGeometry(subject);
    const metadata = requiredMetadata(subject.definitionId);
    const secondPlane = metadata.joinPlanesPx[1];
    if (!secondPlane) throw new Error("Segundo plano vertical ausente.");
    const changedMetadata = {
      ...metadata,
      joinPlanesPx: [
        metadata.joinPlanesPx[0],
        {
          ...secondPlane,
          profile: {
            end: secondPlane.profile.end + 2,
            start: secondPlane.profile.start + 2,
          },
        },
      ],
    };
    const structure = structureWithFloor(subject, [{ x: -1, y: 0 }]);
    const transformed = transformStructureVisual({
      definition,
      geometry,
      interiorNormals: resolveStructureInteriorNormals(structure, subject),
      metadata: changedMetadata,
      orientation: "vertical",
      placement: subject,
    });

    expect(transformed.alignment).toMatchObject({
      issues: [{ axis: "x", kind: "conflicting-axis-translations" }],
      kind: "preserved",
      translation: { x: 0, y: 0 },
    });
  });

  it("combines the perpendicular constraints of all four canonical corners", () => {
    const corners = INITIAL_WORLD_STRUCTURE.placements.filter(
      ({ definitionId }) => definitionId.includes(".corner-"),
    );

    expect(corners).toHaveLength(4);
    for (const corner of corners) {
      const transformed = topologyTransform(
        corner,
        INITIAL_WORLD_STRUCTURE.floorCells,
      );
      expect(transformed.alignment).toMatchObject({
        issues: [],
        kind: "applied",
        translation: { x: 0, y: 0 },
      });
      expect(transformed.alignment.constraints).toHaveLength(2);
      expect(
        new Set(transformed.alignment.constraints.map(({ axis }) => axis)),
      ).toEqual(new Set(["x", "y"]));
    }
  });

  it("transforms horizontal and vertical intervals from their logical starts", () => {
    const horizontal = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-2",
        { x: 3, y: 5 },
        "horizontal",
      ),
    );
    const vertical = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.vertical-2",
        { x: 7, y: 11 },
        "vertical",
      ),
    );
    expect(horizontal.logicalReference).toEqual({ x: 3, y: 5 });
    expect(horizontal.orientation).toBe("horizontal");
    expect(joinPlane(horizontal, "west").coordinate).toBe(3 * CELL_SIZE);
    expect(joinPlane(horizontal, "east").coordinate).toBe(5 * CELL_SIZE);
    expect(vertical.logicalReference).toEqual({ x: 7, y: 11 });
    expect(vertical.orientation).toBe("vertical");
    expect(joinPlane(vertical, "north").coordinate).toBe(11 * CELL_SIZE);
    expect(joinPlane(vertical, "south").coordinate).toBe(13 * CELL_SIZE);
  });

  it.each(["ne", "nw", "se", "sw"] as const)(
    "maps the %s source vertex exactly to the logical corner vertex",
    (corner) => {
      const transformed = structureVisualTransform(
        placement(CORNER_IDS[corner], { x: 8, y: 9 }, `corner.${corner}`),
      );
      expect(transformed.logicalReference).toEqual({ x: 8, y: 9 });
      expect(transformed.joinOrigin).toEqual({
        x: 8 * CELL_SIZE,
        y: 9 * CELL_SIZE,
      });
      expect(transformed.orientation).toBe(corner);
      expect(transformed.joinPlanes).toHaveLength(2);
    },
  );

  it("places open and closed doors on the same four-edge logical interval without -1 cell", () => {
    for (const state of ["closed", "open"] as const) {
      const transformed = structureVisualTransform(
        placement(
          `architecture.wall.stone-01.door-horizontal.${state}`,
          { x: 7, y: 14 },
          `door.${state}`,
        ),
      );
      expect(joinPlane(transformed, "west").coordinate).toBe(7 * CELL_SIZE);
      expect(joinPlane(transformed, "east").coordinate).toBe(11 * CELL_SIZE);
      expect(transformed.logicalReference.x).toBe(7);
      expect(transformed.spriteCanvasPosition.x).toBeCloseTo(
        7 * CELL_SIZE - 24 * (CELL_SIZE / 300),
        10,
      );
      expect(transformed.spriteCanvasPosition.y).toBeCloseTo(
        14 * CELL_SIZE - 24 * (CELL_SIZE / 300),
        10,
      );
      expect(transformed.scale).toBe(CELL_SIZE / 300);
      expect(transformed.interactionRegions).toEqual([
        { bounds: transformed.alphaBounds, part: "main" },
      ]);
      for (const plane of transformed.joinPlanes) {
        expect(plane.transverseProfile.axisRelativeInterval.start).toBe(0);
        expect(plane.transverseProfile.axisRelativeInterval.end).toBeCloseTo(
          429 * (CELL_SIZE / 300),
          10,
        );
        expect(plane.visualProfile.end - plane.visualProfile.start).toBeCloseTo(
          (state === "closed" ? 564 : 740) * (CELL_SIZE / 300),
          10,
        );
      }
    }
  });

  it.each(["ne", "nw", "se", "sw"] as const)(
    "aligns both external planes of %s to compatible straight segments",
    (corner) => {
      const cornerTransform = structureVisualTransform(
        placement(CORNER_IDS[corner], { x: 0, y: 0 }, `corner.${corner}`),
      );
      const extendsWest = corner === "ne" || corner === "se";
      const extendsNorth = corner === "ne" || corner === "nw";
      const horizontal = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-4",
          { x: extendsWest ? -8 : 4, y: 0 },
          `horizontal.${corner}`,
        ),
      );
      const vertical = structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-4",
          { x: 0, y: extendsNorth ? -8 : 4 },
          `vertical.${corner}`,
        ),
      );
      expectSamePlane(
        cornerTransform,
        extendsWest ? "west" : "east",
        horizontal,
        extendsWest ? "east" : "west",
      );
      expectSamePlane(
        cornerTransform,
        extendsNorth ? "north" : "south",
        vertical,
        extendsNorth ? "south" : "north",
      );
    },
  );

  it("aligns a door exactly between neighbouring horizontal segments", () => {
    const left = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-4",
        { x: -4, y: 2 },
        "left",
      ),
    );
    const door = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.door-horizontal.closed",
        { x: 0, y: 2 },
        "door",
      ),
    );
    const right = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-4",
        { x: 4, y: 2 },
        "right",
      ),
    );
    expectSamePlane(left, "east", door, "west");
    expectSamePlane(door, "east", right, "west");
  });

  it("is independent of placement reading order", () => {
    const direct = structureVisualTransforms(
      INITIAL_WORLD_STRUCTURE.placements,
    );
    const reversed = structureVisualTransforms(
      [...INITIAL_WORLD_STRUCTURE.placements].reverse(),
    );
    expect(reversed).toEqual(direct);
  });

  it("preserves fractional world coordinates for negative logical coordinates", () => {
    const transformed = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.vertical-1",
        { x: -3, y: -2 },
        "negative",
      ),
    );
    expect(transformed.joinOrigin).toEqual({
      x: -3 * CELL_SIZE,
      y: -2 * CELL_SIZE,
    });
    expect(transformed.spriteCanvasPosition.x).toBeCloseTo(
      -3 * CELL_SIZE - 25 * (CELL_SIZE / 300),
      10,
    );
    expect(Number.isInteger(transformed.spriteCanvasPosition.x)).toBe(false);
  });

  it("does not mutate the definition, placement, geometry or metadata", () => {
    const candidate = placement(
      "architecture.wall.stone-01.corner-ne",
      { x: -2, y: 4 },
      "immutable",
    );
    const definition = requiredDefinition(candidate.definitionId);
    const geometry = placementGeometry(candidate);
    const metadata = requiredMetadata(candidate.definitionId);
    const before = JSON.stringify({
      candidate,
      definition,
      geometry,
      metadata,
    });
    const transformed = transformStructureVisual({
      definition,
      geometry,
      metadata,
      orientation: "ne",
      placement: candidate,
    });
    expect(JSON.stringify({ candidate, definition, geometry, metadata })).toBe(
      before,
    );
    expect(Object.isFrozen(transformed)).toBe(true);
    expect(Object.isFrozen(transformed.interactionRegions)).toBe(true);
  });

  it("keeps canvas bounds, alpha bounds and occupied interaction regions distinct", () => {
    const horizontal = structureVisualTransform(
      placement("architecture.wall.stone-01.horizontal-1"),
    );
    expect(horizontal.canvasBounds.width).toBeGreaterThan(
      horizontal.alphaBounds.width,
    );
    expect(horizontal.canvasBounds.height).toBeGreaterThan(
      horizontal.alphaBounds.height,
    );
    expect(horizontal.interactionRegions).toEqual([
      { bounds: horizontal.alphaBounds, part: "main" },
    ]);

    const corner = structureVisualTransform(
      placement("architecture.wall.stone-01.corner-sw"),
    );
    const interactionArea = corner.interactionRegions.reduce(
      (sum, current) => sum + current.bounds.width * current.bounds.height,
      0,
    );
    expect(corner.interactionRegions).toHaveLength(2);
    expect(interactionArea).toBeLessThan(
      corner.alphaBounds.width * corner.alphaBounds.height,
    );
  });

  it("rejects missing and internally incoherent visual metadata", () => {
    expect(() =>
      structureVisualTransform(
        placement("architecture.floor.wood-01", { x: 0, y: 0 }, "floor"),
      ),
    ).toThrow(/Metadado visual ausente/u);

    const first = STRUCTURE_VISUAL_ASSETS[0];
    const incoherentCatalog = [
      { ...first, canvasPx: { height: 1, width: 1 } },
      ...STRUCTURE_VISUAL_ASSETS.slice(1),
    ];
    expect(() => validateStructureVisualCatalog(incoherentCatalog)).toThrow(
      /Alpha bounds incoerente/u,
    );
  });

  it("rejects a transform whose definition, geometry and metadata disagree", () => {
    const candidate = placement("architecture.wall.stone-01.horizontal-1");
    expect(() =>
      transformStructureVisual({
        definition: requiredDefinition(candidate.definitionId),
        geometry: placementGeometry(candidate),
        metadata: requiredMetadata("architecture.wall.stone-01.vertical-1"),
        orientation: "horizontal",
        placement: candidate,
      }),
    ).toThrow(/Definição visual incoerente/u);
  });

  it("does not read legacy offsets, pivots or visual spans", () => {
    const candidate = placement(
      "architecture.wall.stone-01.door-horizontal.closed",
      { x: 7, y: 14 },
      "legacy-proof",
    );
    const definition = requiredDefinition(candidate.definitionId);
    const geometry = placementGeometry(candidate);
    const metadata = requiredMetadata(candidate.definitionId);
    const canonical = transformStructureVisual({
      definition,
      geometry,
      metadata,
      orientation: "horizontal",
      placement: candidate,
    });
    const changedLegacyFields = {
      ...definition,
      pivot: { x: 999, y: -999 },
      visualOffsetCells: { x: 100, y: 200 },
      visualSpanCells: 99,
    };
    expect(
      transformStructureVisual({
        definition: changedLegacyFields,
        geometry,
        metadata,
        orientation: "horizontal",
        placement: candidate,
      }),
    ).toEqual(canonical);
  });

  it("uses stable definition identity without special-casing instance IDs", () => {
    const first = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-1",
        { x: 1, y: 2 },
        "arbitrary-a",
      ),
    );
    const second = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.horizontal-1",
        { x: 1, y: 2 },
        "arbitrary-b",
      ),
    );
    expect({ ...first, placementKey: "ignored" }).toEqual({
      ...second,
      placementKey: "ignored",
    });
  });
});

describe("W3-A-R3-A pure canonical room composition", () => {
  it("matches all eight logical encounters through canonical join planes", () => {
    const transforms = new Map(
      structureVisualTransforms(INITIAL_WORLD_STRUCTURE.placements).map(
        (transform) => [transform.placementKey, transform],
      ),
    );
    const required = (key: string) => {
      const transform = transforms.get(key);
      if (!transform) throw new Error(`Transform ausente: ${key}`);
      return transform;
    };
    const encounters = [
      ["initial.corner.top-left", "east", "initial.wall.top", "west"],
      ["initial.wall.top", "east", "initial.corner.top-right", "west"],
      ["initial.corner.top-left", "south", "initial.wall.left", "north"],
      ["initial.wall.left", "south", "initial.corner.bottom-left", "north"],
      ["initial.corner.top-right", "south", "initial.wall.right", "north"],
      ["initial.wall.right", "south", "initial.corner.bottom-right", "north"],
      ["initial.corner.bottom-left", "east", "initial.door.bottom", "west"],
      ["initial.door.bottom", "east", "initial.corner.bottom-right", "west"],
    ] as const;

    for (const [firstKey, firstSide, secondKey, secondSide] of encounters)
      expectSamePlane(
        required(firstKey),
        firstSide,
        required(secondKey),
        secondSide,
      );
    expect(encounters).toHaveLength(8);
  });
});
