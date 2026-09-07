import { describe, expect, it } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  type StructurePlacement,
  type WorldStructureState,
} from "../../../application";
import { CELL_SIZE } from "./spatialWorld";
import {
  structurePieceDepth,
  structureRenderPlan,
  structureSpriteProjection,
  structureVisualTransformForState,
} from "./structureRenderPlan";
import {
  STRUCTURE_VISUAL_ASSETS,
  structureVisualTransform,
} from "./structureVisualGeometry";
import { structureHitRegions } from "./constructionInput";
import {
  compareStructureVisualDepth,
  structureVisualDepth,
} from "./structureVisualDepth";
import { structureVisualFallbackGeometry } from "./structureVisualFallback";

function structureWith(
  placements: readonly StructurePlacement[],
): WorldStructureState {
  return { ...INITIAL_WORLD_STRUCTURE, placements };
}

describe("structureRenderPlan", () => {
  it("renders explicit placements only and never manufactures a vertical door", () => {
    const plan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    expect(plan).toHaveLength(INITIAL_WORLD_STRUCTURE.placements.length);
    expect(plan.filter((piece) => piece.kind === "corner")).toHaveLength(4);
    expect(plan.filter((piece) => piece.kind === "door")).toHaveLength(1);
    expect(
      plan.every(
        (piece) =>
          piece.kind !== "door" || piece.transform.orientation === "horizontal",
      ),
    ).toBe(true);
    expect(plan.map(({ depth }) => depth)).toEqual(
      [...plan.map(({ depth }) => depth)].sort(compareStructureVisualDepth),
    );
    expect(new Set(plan.map((piece) => piece.key)).size).toBe(plan.length);
  });

  it("projects all 12 definitions through the canonical transform", () => {
    const placements = STRUCTURE_VISUAL_ASSETS.map(
      ({ definitionId }, index): StructurePlacement => ({
        anchor: { x: index - 6, y: 2 - index },
        definitionId,
        instanceId: `render.${definitionId}`,
      }),
    );
    const structure = structureWith(placements);
    const plan = structureRenderPlan(structure);
    expect(plan).toHaveLength(12);

    for (const piece of plan) {
      const placement = placements.find(
        ({ instanceId }) => instanceId === piece.key,
      );
      if (!placement) throw new Error(`Placement ausente: ${piece.key}`);
      const canonical = structureVisualTransformForState(structure, placement);
      const projection = structureSpriteProjection(piece);
      expect(piece.transform).toEqual(canonical);
      expect(projection).toEqual({
        alphaBounds: canonical.alphaBounds,
        canvasBounds: canonical.canvasBounds,
        instanceId: placement.instanceId,
        origin: { x: 0, y: 0 },
        scale: canonical.scale,
        scaleX: canonical.spriteRendering.scale.x,
        scaleY: canonical.spriteRendering.scale.y,
        textureKey: placement.definitionId,
        x: canonical.spriteRendering.position.x,
        y: canonical.spriteRendering.position.y,
      });
      expect(structureHitRegions(placement, structure)).toEqual(
        piece.transform.interactionRegions.map(({ bounds }) => bounds),
      );
    }
  });

  it("keeps fractional and negative render positions without rounding", () => {
    const placement: StructurePlacement = {
      anchor: { x: -3, y: -2 },
      definitionId: "architecture.wall.stone-01.vertical-1",
      instanceId: "render.negative",
    };
    const piece = structureRenderPlan(structureWith([placement]))[0];
    const projection = structureSpriteProjection(piece);
    expect(projection.x).toBeCloseTo(
      -3 * CELL_SIZE - 25 * (CELL_SIZE / 300),
      10,
    );
    expect(projection.y).toBe(piece.transform.spriteRendering.position.y);
    expect(Number.isInteger(projection.x)).toBe(false);
    expect(projection.x).toBeLessThan(0);
    expect(projection.y).toBeLessThan(0);
  });

  it("places the door on x=224..352 without the historical -1 cell", () => {
    const placement: StructurePlacement = {
      anchor: { x: 7, y: 14 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      instanceId: "render.door",
    };
    const piece = structureRenderPlan(structureWith([placement]))[0];
    const projection = structureSpriteProjection(piece);
    expect(
      piece.transform.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
    expect(projection.x).toBe(piece.transform.spriteRendering.position.x);
    expect(projection.x).toBeLessThan(224 - 24 * (CELL_SIZE / 300));
    expect(projection.x).not.toBe(6 * CELL_SIZE);
  });

  it("propagates the single signed transform to sprite, hit regions, fallback and depth", () => {
    const plan = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    for (const [instanceId, axis, expected] of [
      ["initial.wall.right", "x", -235 * (CELL_SIZE / 300)],
      ["initial.door.bottom", "y", -429 * (CELL_SIZE / 300)],
    ] as const) {
      const piece = plan.find(({ key }) => key === instanceId);
      const placement = INITIAL_WORLD_STRUCTURE.placements.find(
        (candidate) => candidate.instanceId === instanceId,
      );
      if (!piece || !placement)
        throw new Error(`Fixture ausente: ${instanceId}`);
      const unaligned = structureVisualTransform(placement);
      const fallback = structureVisualFallbackGeometry(
        piece.transform,
        piece.depth,
      );

      expect(piece.transform.alignment).toMatchObject({ kind: "applied" });
      expect(piece.transform.alignment.translation[axis]).toBeCloseTo(
        expected,
        10,
      );
      expect(piece.transform.spriteCanvasPosition[axis]).toBeCloseTo(
        unaligned.spriteCanvasPosition[axis] + expected,
        10,
      );
      expect(structureHitRegions(placement, INITIAL_WORLD_STRUCTURE)).toEqual(
        piece.transform.interactionRegions.map(({ bounds }) => bounds),
      );
      expect(fallback.regions).toEqual(piece.transform.interactionRegions);
      expect(piece.depth).toEqual(structureVisualDepth(piece.transform));
    }
  });

  it("does not accept compatibility offsets or pivots as renderer input", () => {
    const piece = structureRenderPlan(
      structureWith([
        {
          anchor: { x: 7, y: 14 },
          definitionId: "architecture.wall.stone-01.door-horizontal.closed",
          instanceId: "render.legacy-proof",
        },
      ]),
    )[0];
    const changedCompatibility = {
      ...piece,
      legacyAsset: {
        offset: { xCells: 100, yCells: -200 },
        pivot: { x: 99, y: -99 },
      },
    };
    expect(structureSpriteProjection(changedCompatibility)).toEqual(
      structureSpriteProjection(piece),
    );
  });

  it("keeps R3-B position, scale, join planes and hit regions independent of depth", () => {
    const placement: StructurePlacement = {
      anchor: { x: 15, y: 4 },
      definitionId: "architecture.wall.stone-01.corner-se",
      instanceId: "render.geometry-proof",
    };
    const piece = structureRenderPlan(structureWith([placement]))[0];
    const changedDepth = {
      ...piece,
      depth: { ...piece.depth, value: piece.depth.value + 10_000 },
    };
    expect(structureSpriteProjection(changedDepth)).toEqual(
      structureSpriteProjection(piece),
    );
    expect(changedDepth.transform.joinPlanes).toEqual(
      piece.transform.joinPlanes,
    );
    expect(structureHitRegions(placement, structureWith([placement]))).toEqual(
      piece.transform.interactionRegions.map(({ bounds }) => bounds),
    );
  });

  it("uses canonical depth and keeps lifecycle order independent of input order", () => {
    const first = structureRenderPlan(INITIAL_WORLD_STRUCTURE);
    const second = structureRenderPlan({
      ...INITIAL_WORLD_STRUCTURE,
      placements: [...INITIAL_WORLD_STRUCTURE.placements].reverse(),
    });
    expect(second.map(({ key }) => key)).toEqual(first.map(({ key }) => key));
    expect(second.map(structureSpriteProjection)).toEqual(
      first.map(structureSpriteProjection),
    );

    for (const piece of first) {
      expect(piece.depth).toEqual(structureVisualDepth(piece.transform));
      expect(structurePieceDepth(piece)).toBe(piece.depth.value);
    }
  });
});
