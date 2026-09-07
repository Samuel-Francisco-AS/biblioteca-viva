import { describe, expect, it } from "vitest";

import type { GridPoint, StructurePlacement } from "../../../application";
import {
  STRUCTURE_VISUAL_ASSETS,
  structureVisualTransform,
  type StructureVisualDepthLayer,
  type StructureVisualTransform,
} from "./structureVisualGeometry";
import {
  STRUCTURE_DEPTH_CONTRACT,
  compareStructureVisualDepth,
  structureVisualDepth,
} from "./structureVisualDepth";

function placement(
  definitionId: StructurePlacement["definitionId"],
  anchor: GridPoint = { x: 0, y: 0 },
  instanceId = `depth.${definitionId}`,
): StructurePlacement {
  return { anchor, definitionId, instanceId };
}

function withLayer(
  transform: StructureVisualTransform,
  layer: StructureVisualDepthLayer,
): StructureVisualTransform {
  return {
    ...transform,
    depth: { ...transform.depth, layer },
  };
}

describe("W3-A-R3-C-A canonical structure depth", () => {
  it("uses the bottommost visible occupied region for all 12 assets", () => {
    expect(STRUCTURE_VISUAL_ASSETS).toHaveLength(12);
    for (const [index, metadata] of STRUCTURE_VISUAL_ASSETS.entries()) {
      expect(metadata.depth.sortReference).toBe("visible-bounds-bottom");
      const transform = structureVisualTransform(
        placement(
          metadata.definitionId,
          { x: index - 5, y: index - 4 },
          `depth.coverage.${index}`,
        ),
      );
      const expectedVisualY = Math.max(
        ...transform.interactionRegions.map(
          ({ bounds }) => bounds.y + bounds.height,
        ),
      );
      const depth = structureVisualDepth(transform);
      expect(transform.depth.visualSortY).toBeCloseTo(expectedVisualY, 10);
      expect(depth.visualSortY).toBeCloseTo(expectedVisualY, 10);
      expect(Number.isFinite(depth.value)).toBe(true);
    }
  });

  it("places back and front structures around the interior baseline at equal visual Y", () => {
    const transform = structureVisualTransform(
      placement("architecture.wall.stone-01.horizontal-1"),
    );
    const back = structureVisualDepth(
      withLayer(transform, "architecture-back"),
    );
    const front = structureVisualDepth(
      withLayer(transform, "architecture-front"),
    );
    const interior =
      STRUCTURE_DEPTH_CONTRACT.interiorDepthOrigin + back.visualSortY;

    expect(back.value).toBe(
      interior + STRUCTURE_DEPTH_CONTRACT.layerOffsets["architecture-back"],
    );
    expect(front.value).toBe(
      interior + STRUCTURE_DEPTH_CONTRACT.layerOffsets["architecture-front"],
    );
    expect(back.value).toBeLessThan(interior);
    expect(front.value).toBeGreaterThan(interior);
  });

  it("orders different visible Y coordinates rather than logical anchors alone", () => {
    const short = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-1",
          { x: 0, y: 2 },
          "depth.short",
        ),
      ),
    );
    const tall = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.door-horizontal.open",
          { x: 0, y: 2 },
          "depth.tall",
        ),
      ),
    );
    expect(tall.visualSortY).toBeGreaterThan(short.visualSortY);
    expect(tall.value).toBeGreaterThan(short.value);
  });

  it("preserves negative placements and fractional visual coordinates", () => {
    const depth = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-1",
          { x: -3, y: -5 },
          "depth.negative-fractional",
        ),
      ),
    );
    expect(depth.visualSortY).toBeLessThan(0);
    expect(Number.isInteger(depth.visualSortY)).toBe(false);
    expect(Number.isInteger(depth.value)).toBe(false);
  });

  it("recalculates from visual geometry after movement and rotation", () => {
    const before = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-2",
          { x: 2, y: 3 },
          "depth.moving",
        ),
      ),
    );
    const moved = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.horizontal-2",
          { x: 2, y: 5 },
          "depth.moving",
        ),
      ),
    );
    const rotated = structureVisualDepth(
      structureVisualTransform(
        placement(
          "architecture.wall.stone-01.vertical-2",
          { x: 2, y: 3 },
          "depth.moving",
        ),
      ),
    );
    expect(moved.value - before.value).toBeCloseTo(64, 10);
    expect(rotated.visualSortY).not.toBe(before.visualSortY);
  });

  it("keeps open and closed doors in the back layer while respecting visible height", () => {
    const doors = (["closed", "open"] as const).map((state) =>
      structureVisualDepth(
        structureVisualTransform(
          placement(
            `architecture.wall.stone-01.door-horizontal.${state}`,
            { x: 7, y: 14 },
            `depth.door.${state}`,
          ),
        ),
      ),
    );
    expect(doors.every(({ layer }) => layer === "architecture-back")).toBe(
      true,
    );
    expect(doors[1].visualSortY).toBeGreaterThan(doors[0].visualSortY);
  });

  it.each([
    ["ne", "architecture-back"],
    ["nw", "architecture-back"],
    ["se", "architecture-front"],
    ["sw", "architecture-front"],
  ] as const)("keeps corner-%s in %s", (corner, layer) => {
    const depth = structureVisualDepth(
      structureVisualTransform(
        placement(`architecture.wall.stone-01.corner-${corner}`),
      ),
    );
    expect(depth.layer).toBe(layer);
  });

  it("breaks equal visual coordinates by stable key, independent of input order", () => {
    const depths = ["z-last", "a-first"].map((instanceId) =>
      structureVisualDepth(
        structureVisualTransform(
          placement(
            "architecture.wall.stone-01.horizontal-1",
            { x: 0, y: 4 },
            instanceId,
          ),
        ),
      ),
    );
    expect(depths[0].value).toBe(depths[1].value);
    expect(
      [...depths]
        .sort(compareStructureVisualDepth)
        .map(({ stableKey }) => stableKey),
    ).toEqual(["a-first", "z-last"]);
    expect([...depths].reverse().sort(compareStructureVisualDepth)).toEqual(
      [...depths].sort(compareStructureVisualDepth),
    );
  });

  it("ignores compatibility offsets, pivots and spans", () => {
    const transform = structureVisualTransform(
      placement(
        "architecture.wall.stone-01.door-horizontal.closed",
        { x: 7, y: 14 },
        "depth.legacy-proof",
      ),
    );
    const decorated = {
      ...transform,
      offset: { xCells: 500, yCells: -500 },
      pivot: { x: 99, y: -99 },
      visualSpanCells: 999,
    };
    expect(structureVisualDepth(decorated)).toEqual(
      structureVisualDepth(transform),
    );
  });
});
