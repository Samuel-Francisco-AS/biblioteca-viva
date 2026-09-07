import { describe, expect, it } from "vitest";

import type {
  GridPoint,
  StructureDefinitionId,
  StructurePlacement,
} from "../../../application";
import {
  STRUCTURE_VISUAL_ASSETS,
  structureVisualTransform,
  type StructureInteractionRegion,
  type StructureVisualTransform,
} from "./structureVisualGeometry";
import { structureVisualDepth } from "./structureVisualDepth";
import { structureVisualFallbackGeometry } from "./structureVisualFallback";

function placement(
  definitionId: StructureDefinitionId,
  anchor: GridPoint = { x: 0, y: 0 },
): StructurePlacement {
  return {
    anchor,
    definitionId,
    instanceId: `fallback.${definitionId}.${anchor.x}.${anchor.y}`,
  };
}

function fallbackFor(definitionId: StructureDefinitionId, anchor?: GridPoint) {
  const transform = structureVisualTransform(placement(definitionId, anchor));
  return {
    fallback: structureVisualFallbackGeometry(
      transform,
      structureVisualDepth(transform),
    ),
    transform,
  };
}

function contains(
  region: StructureInteractionRegion,
  point: GridPoint,
): boolean {
  return (
    point.x >= region.bounds.x &&
    point.x < region.bounds.x + region.bounds.width &&
    point.y >= region.bounds.y &&
    point.y < region.bounds.y + region.bounds.height
  );
}

function expectPlaneOnVisibleRegion(transform: StructureVisualTransform) {
  for (const plane of transform.joinPlanes) {
    const region = transform.interactionRegions.find(
      ({ part }) => part === plane.part,
    );
    if (!region) throw new Error(`Região ${plane.part} ausente`);
    const { bounds } = region;
    const coordinate =
      plane.side === "west"
        ? bounds.x
        : plane.side === "east"
          ? bounds.x + bounds.width
          : plane.side === "north"
            ? bounds.y
            : bounds.y + bounds.height;
    const profile =
      plane.axis === "x"
        ? { end: bounds.y + bounds.height, start: bounds.y }
        : { end: bounds.x + bounds.width, start: bounds.x };
    expect(plane.coordinate).toBeCloseTo(coordinate, 10);
    expect(plane.visualProfile.start).toBeCloseTo(profile.start, 10);
    expect(plane.visualProfile.end).toBeCloseTo(profile.end, 10);
  }
}

describe("W3-A-R3-C-B1 pure structural fallback geometry", () => {
  it("projects all 12 assets from their canonical visible regions and depth", () => {
    expect(STRUCTURE_VISUAL_ASSETS).toHaveLength(12);
    for (const [index, metadata] of STRUCTURE_VISUAL_ASSETS.entries()) {
      const { fallback, transform } = fallbackFor(metadata.definitionId, {
        x: index - 6,
        y: Math.floor(index / 3) - 2,
      });
      expect(fallback.definitionId).toBe(metadata.definitionId);
      expect(fallback.instanceId).toBe(transform.placementKey);
      expect(fallback.regions).toBe(transform.interactionRegions);
      expect(fallback.joinPlanes).toBe(transform.joinPlanes);
      expect(fallback.depth).toBe(structureVisualDepth(transform).value);
      expect(fallback.bounds.x).toBeCloseTo(transform.alphaBounds.x, 10);
      expect(fallback.bounds.y).toBeCloseTo(transform.alphaBounds.y, 10);
      expect(fallback.bounds.width).toBeCloseTo(
        transform.alphaBounds.width,
        10,
      );
      expect(fallback.bounds.height).toBeCloseTo(
        transform.alphaBounds.height,
        10,
      );
      expectPlaneOnVisibleRegion(transform);
    }
  });

  it.each(["ne", "nw", "se", "sw"] as const)(
    "keeps corner %s as two arms without filling its transparent interior",
    (orientation) => {
      const { fallback, transform } = fallbackFor(
        `architecture.wall.stone-01.corner-${orientation}`,
      );
      const center = {
        x: fallback.bounds.x + fallback.bounds.width / 2,
        y: fallback.bounds.y + fallback.bounds.height / 2,
      };

      expect(fallback.regions.map(({ part }) => part).sort()).toEqual([
        "horizontal-arm",
        "vertical-arm",
      ]);
      expect(fallback.regions.some((region) => contains(region, center))).toBe(
        false,
      );
      expect(fallback.bounds).toEqual(transform.alphaBounds);
      expectPlaneOnVisibleRegion(transform);
    },
  );

  it("keeps both doors on the same longitudinal planes while preserving distinct visible shapes", () => {
    const closed = fallbackFor(
      "architecture.wall.stone-01.door-horizontal.closed",
      { x: 7, y: 14 },
    );
    const open = fallbackFor(
      "architecture.wall.stone-01.door-horizontal.open",
      { x: 7, y: 14 },
    );

    expect(closed.fallback.bounds.x).toBe(224);
    expect(closed.fallback.bounds.width).toBe(128);
    expect(open.fallback.bounds.x).toBe(224);
    expect(open.fallback.bounds.width).toBe(128);
    expect(open.fallback.bounds.height).toBeGreaterThan(
      closed.fallback.bounds.height,
    );
    expect(
      closed.fallback.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
    expect(
      open.fallback.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
    expect(closed.fallback.joinPlanes.map(({ profile }) => profile)).toEqual(
      open.fallback.joinPlanes.map(({ profile }) => profile),
    );
    expect(open.fallback.joinPlanes[0]?.visualProfile.end).toBeGreaterThan(
      closed.fallback.joinPlanes[0]?.visualProfile.end ?? 0,
    );
  });

  it("preserves negative and fractional world geometry through movement and rotation", () => {
    const first = fallbackFor("architecture.wall.stone-01.horizontal-4", {
      x: -3,
      y: -2,
    });
    const moved = fallbackFor("architecture.wall.stone-01.horizontal-4", {
      x: -1,
      y: 1,
    });
    const rotated = fallbackFor("architecture.wall.stone-01.vertical-4", {
      x: -3,
      y: -2,
    });

    expect(first.fallback.bounds.x).toBe(-96);
    expect(first.fallback.bounds.y).toBe(-64);
    expect(Number.isInteger(first.fallback.bounds.height)).toBe(false);
    expect(moved.fallback.bounds.x - first.fallback.bounds.x).toBe(64);
    expect(moved.fallback.bounds.y - first.fallback.bounds.y).toBe(96);
    expect(rotated.fallback.bounds.width).not.toBe(first.fallback.bounds.width);
    expect(rotated.fallback.bounds.height).not.toBe(
      first.fallback.bounds.height,
    );
    expect(rotated.fallback.depth).toBe(
      structureVisualDepth(rotated.transform).value,
    );
  });

  it("ignores compatibility-only legacy fields and rejects mismatched depth", () => {
    const transform = structureVisualTransform(
      placement("architecture.wall.stone-01.corner-ne"),
    );
    const depth = structureVisualDepth(transform);
    const decorated = {
      ...transform,
      offset: { xCells: 99, yCells: -99 },
      pivot: { x: 0.5, y: 0.5 },
      visualSpanCells: 99,
    };

    expect(structureVisualFallbackGeometry(decorated, depth)).toEqual(
      structureVisualFallbackGeometry(transform, depth),
    );
    expect(() =>
      structureVisualFallbackGeometry(transform, {
        ...depth,
        stableKey: "outra-instancia",
      }),
    ).toThrow("Depth de fallback incoerente");
  });
});
