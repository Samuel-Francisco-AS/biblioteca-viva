import { describe, expect, it, vi } from "vitest";

import {
  INITIAL_WORLD_STRUCTURE,
  type StructurePlacement,
} from "../../../application";
import type { LibraryViewModel } from "../contracts";
import {
  applyStructureSpriteProjection,
  destroyStructureRenderObjects,
  renderStructurePieceToTarget,
  SpatialWorldScene,
  type StructureFallbackRenderTarget,
  type StructurePieceRenderTarget,
  type StructureSpriteRenderTarget,
} from "./SpatialWorldScene";
import {
  structurePieceDepth,
  structureRenderPlan,
  structureSpriteProjection,
  type StructureRenderPiece,
} from "./structureRenderPlan";
import { STRUCTURE_VISUAL_ASSETS } from "./structureVisualGeometry";

vi.mock("phaser", () => ({
  default: {
    Scene: class {},
    Textures: {
      FilterMode: { LINEAR: "LINEAR", NEAREST: "NEAREST" },
    },
  },
}));

const emptyProjection: LibraryViewModel = {
  completedBooks: 0,
  decorationUnlockAnimation: null,
  hasCompletedBook: false,
  hasFirstCompletionMilestone: false,
  highlightedBook: null,
  inProgressBooks: 0,
  roomState: "default",
  shelfOccupancy: "empty",
  shelfVisualGroupCount: 0,
  totalBooks: 0,
  unlockedDecorationIds: [],
};

function pieceFor(placement: StructurePlacement): StructureRenderPiece {
  return structureRenderPlan({
    ...INITIAL_WORLD_STRUCTURE,
    placements: [placement],
  })[0];
}

function mockSprite() {
  return {
    destroy: vi.fn<() => void>(),
    setDepth: vi.fn<(value: number) => unknown>(),
    setOrigin: vi.fn<(x: number, y?: number) => unknown>(),
    setScale: vi.fn<(x: number, y?: number) => unknown>(),
  } satisfies StructureSpriteRenderTarget;
}

function mockFallback() {
  return {
    destroy: vi.fn<() => void>(),
    fillRect:
      vi.fn<(x: number, y: number, width: number, height: number) => unknown>(),
    fillStyle: vi.fn<(color: number, alpha?: number) => unknown>(),
    lineStyle:
      vi.fn<(width: number, color: number, alpha?: number) => unknown>(),
    setData: vi.fn<(key: string, value: unknown) => unknown>(),
    setDepth: vi.fn<(value: number) => unknown>(),
    strokeRect:
      vi.fn<(x: number, y: number, width: number, height: number) => unknown>(),
  } satisfies StructureFallbackRenderTarget;
}

function mockRenderTarget(textureAvailable: () => boolean) {
  const fallback = mockFallback();
  const sprite = mockSprite();
  const target = {
    configureTexture: vi.fn<(textureKey: string) => void>(),
    createFallback: vi.fn(() => fallback),
    createSprite: vi.fn<
      (x: number, y: number, textureKey: string) => typeof sprite
    >(() => sprite),
    textureExists: vi.fn<(textureKey: string) => boolean>(() =>
      textureAvailable(),
    ),
  } satisfies StructurePieceRenderTarget;
  return { fallback, sprite, target };
}

describe("SpatialWorldScene canonical structure projection", () => {
  it("returns empty diagnostics before Phaser injects the scene systems", () => {
    const scene = new SpatialWorldScene(
      emptyProjection,
      false,
      {
        dayPeriod: "night",
        highContrast: false,
        reducedMotion: false,
        roomId: "main-library",
        stage: 1,
        unlocked: true,
      },
      undefined,
      "night",
    );

    expect(scene.runtimeSnapshot()).toEqual({
      activeTweens: 0,
      displayObjects: 0,
      fps: null,
      interactiveZones: 0,
    });
  });

  it("applies topology alignment and seam coverage from the canonical projection", () => {
    const door: StructurePlacement = {
      anchor: { x: 7, y: 14 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      instanceId: "scene.door",
    };
    const piece = structureRenderPlan({
      ...INITIAL_WORLD_STRUCTURE,
      placements: [door],
    })[0];
    const projection = structureSpriteProjection(piece);
    const depth = structurePieceDepth(piece);
    const sprite = {
      setDepth: vi.fn(),
      setOrigin: vi.fn(),
      setScale: vi.fn(),
    };

    applyStructureSpriteProjection(sprite, projection, depth);

    expect(projection.textureKey).toBe(door.definitionId);
    expect(projection.instanceId).toBe(door.instanceId);
    expect(projection.x).toBe(piece.transform.spriteRendering.position.x);
    expect(projection.y).toBeCloseTo(399.68, 10);
    expect(Number.isInteger(projection.x)).toBe(false);
    expect(sprite.setOrigin).toHaveBeenCalledOnce();
    expect(sprite.setOrigin).toHaveBeenCalledWith(0, 0);
    expect(sprite.setScale).toHaveBeenCalledOnce();
    expect(sprite.setScale).toHaveBeenCalledWith(
      projection.scaleX,
      projection.scaleY,
    );
    expect(projection.scaleX).toBeGreaterThan(projection.scale);
    expect(projection.scaleY).toBe(projection.scale);
    expect(sprite.setDepth).toHaveBeenCalledOnce();
    expect(sprite.setDepth).toHaveBeenCalledWith(piece.depth.value);
    expect(piece.depth.value).toBeCloseTo(
      40 + piece.transform.depth.visualSortY - 0.25,
      10,
    );
  });

  it("reapplying a projection does not create or identify another sprite", () => {
    const piece = structureRenderPlan(INITIAL_WORLD_STRUCTURE)[0];
    const projection = structureSpriteProjection(piece);
    const sprite = {
      setDepth: vi.fn(),
      setOrigin: vi.fn(),
      setScale: vi.fn(),
    };

    applyStructureSpriteProjection(
      sprite,
      projection,
      structurePieceDepth(piece),
    );
    applyStructureSpriteProjection(
      sprite,
      projection,
      structurePieceDepth(piece),
    );

    expect(projection.instanceId).toBe(piece.key);
    expect(sprite.setOrigin).toHaveBeenCalledTimes(2);
    expect(sprite.setScale).toHaveBeenCalledTimes(2);
    expect(sprite.setDepth).toHaveBeenCalledTimes(2);
  });
});

describe("W3-A-R3-C-B1 structural fallback integration", () => {
  it("keeps the normal textured path unchanged and creates no fallback Graphics", () => {
    const placement: StructurePlacement = {
      anchor: { x: 7, y: 14 },
      definitionId: "architecture.wall.stone-01.door-horizontal.closed",
      instanceId: "scene.normal-door",
    };
    const piece = pieceFor(placement);
    const projection = structureSpriteProjection(piece);
    const { fallback, sprite, target } = mockRenderTarget(() => true);

    const rendered = renderStructurePieceToTarget(piece, target);

    expect(rendered).toEqual({ kind: "sprite", object: sprite });
    expect(target.textureExists).toHaveBeenCalledWith(projection.textureKey);
    expect(target.configureTexture).toHaveBeenCalledWith(projection.textureKey);
    expect(target.createSprite).toHaveBeenCalledWith(
      projection.x,
      projection.y,
      projection.textureKey,
    );
    expect(target.createFallback).not.toHaveBeenCalled();
    expect(fallback.fillRect).not.toHaveBeenCalled();
    expect(sprite.setOrigin).toHaveBeenCalledWith(0, 0);
    expect(sprite.setScale).toHaveBeenCalledWith(
      projection.scaleX,
      projection.scaleY,
    );
    expect(sprite.setDepth).toHaveBeenCalledWith(piece.depth.value);
  });

  it("forces exactly one canonical fallback for each of the 12 structural assets", () => {
    expect(STRUCTURE_VISUAL_ASSETS).toHaveLength(12);
    for (const [index, metadata] of STRUCTURE_VISUAL_ASSETS.entries()) {
      const placement: StructurePlacement = {
        anchor: { x: index - 6, y: Math.floor(index / 3) - 2 },
        definitionId: metadata.definitionId,
        instanceId: `scene.fallback.${metadata.definitionId}`,
      };
      const piece = pieceFor(placement);
      const { fallback, sprite, target } = mockRenderTarget(() => false);

      const rendered = renderStructurePieceToTarget(piece, target);
      const expectedRects = piece.transform.interactionRegions.map(
        ({ bounds }) => [bounds.x, bounds.y, bounds.width, bounds.height],
      );

      expect(rendered).toEqual({ kind: "fallback", object: fallback });
      expect(target.createFallback).toHaveBeenCalledOnce();
      expect(target.createSprite).not.toHaveBeenCalled();
      expect(sprite.setDepth).not.toHaveBeenCalled();
      expect(fallback.setDepth).toHaveBeenCalledWith(piece.depth.value);
      expect(fallback.setData).toHaveBeenCalledWith(
        "structureInstanceId",
        placement.instanceId,
      );
      expect(fallback.fillRect.mock.calls).toEqual(expectedRects);
      expect(fallback.strokeRect.mock.calls).toEqual(expectedRects);
    }
  });

  it.each(["ne", "nw", "se", "sw"] as const)(
    "draws corner %s as two oriented arms and not as an outer square",
    (orientation) => {
      const piece = pieceFor({
        anchor: { x: -2, y: 3 },
        definitionId: `architecture.wall.stone-01.corner-${orientation}`,
        instanceId: `scene.corner.${orientation}`,
      });
      const { fallback, target } = mockRenderTarget(() => false);

      renderStructurePieceToTarget(piece, target);

      expect(fallback.fillRect).toHaveBeenCalledTimes(2);
      expect(fallback.fillRect.mock.calls).toEqual(
        piece.transform.interactionRegions.map(({ bounds }) => [
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
        ]),
      );
      expect(fallback.fillRect).not.toHaveBeenCalledWith(
        piece.transform.alphaBounds.x,
        piece.transform.alphaBounds.y,
        piece.transform.alphaBounds.width,
        piece.transform.alphaBounds.height,
      );
    },
  );

  it("keeps doors unshifted and distinguishes open from closed geometry", () => {
    const renderDoor = (state: "closed" | "open") => {
      const piece = pieceFor({
        anchor: { x: 7, y: 14 },
        definitionId: `architecture.wall.stone-01.door-horizontal.${state}`,
        instanceId: `scene.door.${state}`,
      });
      const { fallback, target } = mockRenderTarget(() => false);
      renderStructurePieceToTarget(piece, target);
      return { call: fallback.fillRect.mock.calls[0], piece };
    };
    const closed = renderDoor("closed");
    const open = renderDoor("open");

    expect(closed.call[0]).toBe(224);
    expect(closed.call[2]).toBe(128);
    expect(open.call[0]).toBe(224);
    expect(open.call[2]).toBe(128);
    expect(open.call[3]).toBeGreaterThan(closed.call[3]);
    expect(
      closed.piece.transform.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
    expect(
      open.piece.transform.joinPlanes.map(({ coordinate }) => coordinate),
    ).toEqual([224, 352]);
  });

  it("updates without duplicate objects and cleans fallback-to-texture lifecycle", () => {
    const piece = pieceFor({
      anchor: { x: -3, y: -2 },
      definitionId: "architecture.wall.stone-01.vertical-1",
      instanceId: "scene.lifecycle",
    });
    let available = false;
    const { fallback, sprite, target } = mockRenderTarget(() => available);

    const missing = renderStructurePieceToTarget(piece, target);
    expect(missing.kind).toBe("fallback");
    destroyStructureRenderObjects([missing.object]);
    expect(fallback.destroy).toHaveBeenCalledOnce();

    available = true;
    const textured = renderStructurePieceToTarget(piece, target);
    expect(textured.kind).toBe("sprite");
    expect(target.createFallback).toHaveBeenCalledOnce();
    expect(target.createSprite).toHaveBeenCalledOnce();
    expect(fallback.destroy).toHaveBeenCalledOnce();

    destroyStructureRenderObjects([textured.object]);
    expect(sprite.destroy).toHaveBeenCalledOnce();
  });
});
