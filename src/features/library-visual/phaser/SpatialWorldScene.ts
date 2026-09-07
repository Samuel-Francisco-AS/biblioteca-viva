import Phaser from "phaser";
import {
  markStartupEvent,
  markStartupMilestone,
  measureStartupPhase,
  startupNow,
} from "../../../startupPerformance";

import type {
  LibraryInteraction,
  ConstructionSceneState,
  LibraryVisualPeriod,
  LibraryVisualRuntimeSnapshot,
  LibraryViewModel,
  RoomViewModel,
} from "../contracts";
import {
  CELL_SIZE,
  CameraPanPolicy,
  LatestValue,
  clampCameraScroll,
  initialCameraScroll,
  cameraBoundsFor,
  spatialWorldLayout,
  type WorldRectangle,
} from "./spatialWorld";
import {
  WOOD_FLOOR_FILTERING,
  WOOD_FLOOR_TEXTURES,
  WOOD_FLOOR_WORLD_SIZE,
  woodFloorTiles,
} from "./woodFloorMaterial";
import {
  EXTERIOR_GROUND_FILTERING,
  EXTERIOR_GROUND_TEXTURES,
  EXTERIOR_GROUND_WORLD_SIZE,
  exteriorGroundTiles,
} from "./exteriorGround";
import {
  structureSpriteProjection,
  structurePieceDepth,
  structureRenderPlan,
  type StructureRenderPiece,
  type StructureSpriteProjection,
} from "./structureRenderPlan";
import { STRUCTURE_VISUAL_ASSETS } from "./structureVisualGeometry";
import { structureVisualFallbackGeometry } from "./structureVisualFallback";
import {
  FloorGestureBatch,
  constructionHitAreas,
  isStructurePreviewValid,
  snapFloorCell,
  snapStructureAnchor,
  structureAtWorldPoint,
  structureHitRegions,
} from "./constructionInput";
import { TapSelectionPolicy } from "./tapSelectionPolicy";
import {
  shouldPresentStructuralUnlockFeedback,
  structuralUnlockFeedbackDuration,
} from "./structuralUnlockFeedback";
import {
  DEFAULT_PLACED_OBJECTS,
  evaluateFloorEdit,
  objectDefinition,
  orientationForRotation,
  placementIsValid,
  type PlacedObject,
  type StructurePlacement,
} from "../../../application";
import { worldBounds } from "../../../application";

interface RenderedObject {
  readonly graphics?: Phaser.GameObjects.Graphics;
  readonly sprite?: Phaser.GameObjects.Image;
  readonly zone: Phaser.GameObjects.Zone;
}

interface StructureProjectionTarget {
  setDepth(value: number): unknown;
  setOrigin(x: number, y?: number): unknown;
  setScale(x: number, y?: number): unknown;
}

interface StructureDestroyable {
  destroy(): void;
}

export interface StructureFallbackRenderTarget extends StructureDestroyable {
  fillRect(x: number, y: number, width: number, height: number): unknown;
  fillStyle(color: number, alpha?: number): unknown;
  lineStyle(width: number, color: number, alpha?: number): unknown;
  setData(key: string, value: unknown): unknown;
  setDepth(value: number): unknown;
  strokeRect(x: number, y: number, width: number, height: number): unknown;
}

export interface StructureSpriteRenderTarget
  extends StructureDestroyable, StructureProjectionTarget {}

export interface StructurePieceRenderTarget {
  configureTexture(textureKey: string): void;
  createFallback(): StructureFallbackRenderTarget;
  createSprite(
    x: number,
    y: number,
    textureKey: string,
  ): StructureSpriteRenderTarget;
  textureExists(textureKey: string): boolean;
}

export type RenderedStructurePiece =
  | {
      readonly kind: "fallback";
      readonly object: StructureFallbackRenderTarget;
    }
  | {
      readonly kind: "sprite";
      readonly object: StructureSpriteRenderTarget;
    };

/** Applies a canonical projection without introducing renderer-side geometry. */
export function applyStructureSpriteProjection(
  sprite: StructureProjectionTarget,
  projection: StructureSpriteProjection,
  depth: number,
): void {
  sprite.setOrigin(projection.origin.x, projection.origin.y);
  sprite.setScale(projection.scaleX, projection.scaleY);
  sprite.setDepth(depth);
}

/** Chooses exactly one visual path while sharing canonical geometry and depth. */
export function renderStructurePieceToTarget(
  piece: StructureRenderPiece,
  target: StructurePieceRenderTarget,
): RenderedStructurePiece {
  const projection = structureSpriteProjection(piece);
  const depth = structurePieceDepth(piece);
  if (target.textureExists(projection.textureKey)) {
    target.configureTexture(projection.textureKey);
    const sprite = target.createSprite(
      projection.x,
      projection.y,
      projection.textureKey,
    );
    applyStructureSpriteProjection(sprite, projection, depth);
    return Object.freeze({ kind: "sprite", object: sprite });
  }

  const fallback = structureVisualFallbackGeometry(
    piece.transform,
    piece.depth,
  );
  const graphics = target.createFallback();
  graphics.setDepth(fallback.depth);
  graphics.setData("structureInstanceId", fallback.instanceId);
  graphics.fillStyle(piece.kind === "door" ? 0x6b5136 : 0x45473f, 0.96);
  for (const { bounds } of fallback.regions)
    graphics.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  graphics.lineStyle(1, 0xaaa07a, 0.75);
  for (const { bounds } of fallback.regions)
    graphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  return Object.freeze({ kind: "fallback", object: graphics });
}

export function destroyStructureRenderObjects(
  objects: readonly StructureDestroyable[],
): void {
  for (const object of objects) object.destroy();
}

/** W1 procedural world: visual/transient only, with no persistent spatial data. */
export class SpatialWorldScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Graphics;
  private architecture?: Phaser.GameObjects.Graphics;
  private floorMasks: Phaser.GameObjects.Graphics[] = [];
  private floorTiles: Phaser.GameObjects.Image[] = [];
  private exteriorTiles: Phaser.GameObjects.Image[] = [];
  private wallFallbacks: StructureFallbackRenderTarget[] = [];
  private wallSprites: StructureSpriteRenderTarget[] = [];
  private objectZones: Phaser.GameObjects.Zone[] = [];
  private objectGraphics: Phaser.GameObjects.Graphics[] = [];
  private objectSprites: Phaser.GameObjects.Image[] = [];
  private structureZones: Phaser.GameObjects.Zone[] = [];
  private constructionPreview?: Phaser.GameObjects.Graphics;
  private selectionHighlight?: Phaser.GameObjects.Graphics;
  private structuralUnlockHighlight?: Phaser.GameObjects.Graphics;
  private structuralUnlockTimer?: Phaser.Time.TimerEvent;
  private structuralUnlockTween?: Phaser.Tweens.Tween;
  private lastStructuralUnlockToken?: string;
  private reducedMotion: boolean;
  private construction: ConstructionSceneState = {
    active: false,
    tool: "explore",
  };
  private constructionPointerId?: number;
  private floorGesture?: {
    readonly batch: FloorGestureBatch;
    readonly mode: "paint-floor" | "remove-floor";
    readonly pointerId: number;
  };
  private selectionCandidate?: StructurePlacement;
  private readonly selectionTap = new TapSelectionPolicy<
    "empty" | "structure"
  >();
  private renderedObjects = new Map<string, RenderedObject>();
  private projection: LibraryViewModel;
  private interactionHandler?: (interaction: LibraryInteraction) => void;
  private placementModeInstanceId?: string;
  private placementPreview?: PlacedObject;
  private drag?: { readonly pointerId: number; object: PlacedObject };
  private readonly pendingDragPointer = new LatestValue<Phaser.Input.Pointer>();
  private readonly pan = new CameraPanPolicy();
  private rendered = false;
  private textureLoadStartedAt?: number;
  private deferredTextureKeys = new Set<string>();
  private readonly world = spatialWorldLayout();
  private cameraBounds = this.world.bounds;

  constructor(
    projection: LibraryViewModel,
    reducedMotion: boolean,
    _room: RoomViewModel,
    interactionHandler?: (interaction: LibraryInteraction) => void,
    _period: LibraryVisualPeriod = "night",
  ) {
    super("spatial-world");
    this.projection = projection;
    this.reducedMotion = reducedMotion;
    this.interactionHandler = interactionHandler;
    void [_room, _period];
  }

  preload(): void {
    this.textureLoadStartedAt = startupNow();
    markStartupEvent("texture-load-requested");
    for (const [variant, path] of Object.entries(WOOD_FLOOR_TEXTURES)) {
      this.load.image(`architecture.floor.wood-01.${variant}`, path);
    }
    for (const [variant, path] of Object.entries(EXTERIOR_GROUND_TEXTURES))
      this.load.image(`architecture.floor.exterior-ground-01.${variant}`, path);
    const requiredTextureKeys = this.requiredTextureKeys();
    for (const asset of STRUCTURE_VISUAL_ASSETS) {
      if (requiredTextureKeys.has(asset.textureKey))
        this.load.image(asset.textureKey, asset.runtimePath);
      else this.deferredTextureKeys.add(asset.textureKey);
    }
    for (const object of this.objects()) {
      const definition = objectDefinition(object.definitionId);
      if (!definition?.visual) continue;
      for (const [orientation, path] of Object.entries(
        definition.visual.sources,
      )) {
        const textureKey = `${definition.id}.${orientation}`;
        if (requiredTextureKeys.has(textureKey))
          this.load.image(textureKey, path);
        else this.deferredTextureKeys.add(textureKey);
      }
    }
  }

  create(): void {
    if (this.textureLoadStartedAt !== undefined)
      measureStartupPhase("texture-load-decode", this.textureLoadStartedAt);
    this.background = this.add.graphics().setDepth(0);
    this.architecture = this.add.graphics().setDepth(2);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.renderWorld, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.beginPan, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.movePan, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.endPan, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.cancelPan, this);
    this.game.canvas.addEventListener("pointercancel", this.cancelPan);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.renderWorld(this.scale.gameSize);
    this.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
      markStartupMilestone("first-map-visible-frame");
      this.time.delayedCall(250, this.loadDeferredTextures, [], this);
    });
    const feedback = this.projection.structuralUnlockFeedback;
    if (feedback) {
      this.lastStructuralUnlockToken = feedback.token;
      this.presentStructuralUnlockFeedback();
    }
  }

  pauseMotion(): void {
    this.cancelPan();
    this.clearStructuralUnlockFeedback();
  }

  resumeMotion(): void {}

  runtimeSnapshot(): LibraryVisualRuntimeSnapshot {
    if (!this.rendered) {
      return Object.freeze({
        activeTweens: 0,
        displayObjects: 0,
        fps: null,
        interactiveZones: 0,
      });
    }
    return Object.freeze({
      activeTweens: this.tweens.getTweens().length,
      displayObjects: this.children.length,
      fps: this.game.loop.actualFps > 0 ? this.game.loop.actualFps : null,
      interactiveZones: [...this.objectZones, ...this.structureZones].filter(
        (zone) => zone.input?.enabled,
      ).length,
    });
  }

  setAtmosphere(_period: LibraryVisualPeriod, _animate: boolean): void {
    void [_period, _animate];
  }

  setInteractionHandler(
    handler: ((interaction: LibraryInteraction) => void) | undefined,
  ): void {
    this.interactionHandler = handler;
  }

  setObjectPlacementMode(instanceId: string | undefined): void {
    this.placementModeInstanceId = instanceId;
    this.drag = undefined;
    this.pendingDragPointer.clear();
  }

  setConstructionState(state: ConstructionSceneState): void {
    const previousSelectedInstanceId = this.construction.selectedInstanceId;
    this.construction = state;
    this.cancelConstructionGesture();
    this.setSelectedStructure(
      state.active ? state.selectedInstanceId : undefined,
    );
    this.clearConstructionPreview();
    if (this.rendered) {
      this.updateHitAreas();
      this.restoreConstructionPreview();
      if (
        state.active &&
        state.selectedInstanceId &&
        state.selectedInstanceId !== previousSelectedInstanceId
      )
        this.focusStructureIfNeeded(state.selectedInstanceId);
    }
  }

  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
  }

  updateProjection(projection: LibraryViewModel): void {
    this.projection = projection;
    const feedback = projection.structuralUnlockFeedback;
    if (!feedback) this.clearStructuralUnlockFeedback();
    else if (
      shouldPresentStructuralUnlockFeedback(
        this.lastStructuralUnlockToken,
        feedback,
      )
    ) {
      this.lastStructuralUnlockToken = feedback.token;
      this.presentStructuralUnlockFeedback();
    }
    this.cancelConstructionGesture();
    this.clearConstructionPreview();
    const selectedStillExists = projection.worldStructure?.placements.some(
      (placement) =>
        placement.instanceId === this.construction.selectedInstanceId,
    );
    if (!selectedStillExists) {
      this.setSelectedStructure(undefined);
    }
    const preview = this.placementPreview;
    if (preview) {
      const projected = projection.placedObjects?.find(
        (object) => object.instanceId === preview.instanceId,
      );
      if (projected) this.placementPreview = undefined;
    }
    if (this.rendered) this.renderWorld(this.scale.gameSize);
    if (selectedStillExists)
      this.setSelectedStructure(this.construction.selectedInstanceId);
  }

  update(): void {
    const pointer = this.pendingDragPointer.take();
    const drag = this.drag;
    if (!pointer || !drag || pointer.id !== drag.pointerId) return;
    drag.object = this.objectAtPointer(drag.object, pointer);
    this.updateDragPreview(drag.object);
  }

  updateRoom(_room: RoomViewModel): void {
    void _room;
  }

  private requiredTextureKeys(): Set<string> {
    const keys = new Set<string>(
      this.projection.worldStructure?.placements.map(
        (placement) => placement.definitionId,
      ) ?? [],
    );
    for (const object of this.objects()) {
      const definition = objectDefinition(object.definitionId);
      if (!definition?.visual) continue;
      keys.add(
        `${definition.id}.${orientationForRotation(object.rotation)}`,
      );
    }
    return keys;
  }

  private loadDeferredTextures(): void {
    if (this.deferredTextureKeys.size === 0) return;
    const sources = new Map<string, string>();
    for (const asset of STRUCTURE_VISUAL_ASSETS)
      sources.set(asset.textureKey, asset.runtimePath);
    for (const object of this.objects()) {
      const definition = objectDefinition(object.definitionId);
      if (!definition?.visual) continue;
      for (const [orientation, path] of Object.entries(
        definition.visual.sources,
      ))
        sources.set(`${definition.id}.${orientation}`, path);
    }
    const queuedKeys = [...this.deferredTextureKeys].filter(
      (key) => !this.textures.exists(key) && sources.has(key),
    );
    this.deferredTextureKeys.clear();
    if (queuedKeys.length === 0) return;
    markStartupEvent("deferred-texture-load-requested");
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      markStartupEvent("deferred-texture-load-completed");
      const required = this.requiredTextureKeys();
      if (queuedKeys.some((key) => required.has(key)) && this.rendered)
        this.renderWorld(this.scale.gameSize);
    });
    for (const key of queuedKeys) {
      const source = sources.get(key);
      if (source) this.load.image(key, source);
    }
    this.load.start();
  }

  private readonly beginPan = (pointer: Phaser.Input.Pointer): void => {
    if (this.construction.active) {
      if (this.construction.tool === "explore") {
        const camera = this.cameras.main;
        this.pan.begin(pointer.id, pointer.x, pointer.y, {
          x: camera.scrollX,
          y: camera.scrollY,
        });
        return;
      }
      if (this.construction.tool === "select") {
        this.selectionCandidate = this.structureAt(pointer);
        this.selectionTap.begin(
          this.selectionCandidate ? "structure" : "empty",
          pointer.id,
          pointer.x,
          pointer.y,
        );
        return;
      }
      if (
        this.construction.tool === "paint-floor" ||
        this.construction.tool === "remove-floor"
      ) {
        const batch = new FloorGestureBatch();
        for (const cell of this.construction.floorPreviewCells ?? [])
          batch.add(cell);
        this.floorGesture = {
          batch,
          mode: this.construction.tool,
          pointerId: pointer.id,
        };
        this.collectFloorCell(pointer);
        return;
      }
      if (
        this.construction.tool === "place-structure" &&
        (this.construction.placingDefinitionId ||
          this.construction.movingInstanceId)
      ) {
        this.constructionPointerId = pointer.id;
        this.updateConstructionPreview(pointer);
        return;
      }
      return;
    }
    const selected = this.objectAt(pointer.worldX, pointer.worldY);
    if (this.placementModeInstanceId) {
      const object = this.objects().find(
        (candidate) => candidate.instanceId === this.placementModeInstanceId,
      );
      if (object) this.drag = { pointerId: pointer.id, object };
      return;
    }
    if (selected) {
      this.interactionHandler?.({
        type: "PlacedObjectSelected",
        instanceId: selected.instanceId,
      });
      return;
    }
    const camera = this.cameras.main;
    this.pan.begin(pointer.id, pointer.x, pointer.y, {
      x: camera.scrollX,
      y: camera.scrollY,
    });
  };

  private readonly movePan = (pointer: Phaser.Input.Pointer): void => {
    this.selectionTap.move(pointer.id, pointer.x, pointer.y);
    if (this.floorGesture?.pointerId === pointer.id) {
      this.autoPanConstruction(pointer);
      this.collectFloorCell(pointer);
      return;
    }
    if (this.constructionPointerId === pointer.id) {
      this.autoPanConstruction(pointer);
      this.updateConstructionPreview(pointer);
      return;
    }
    if (this.drag?.pointerId === pointer.id) {
      this.pendingDragPointer.push(pointer);
      return;
    }
    const target = this.pan.move(pointer.id, pointer.x, pointer.y);
    if (!target) return;
    const camera = this.cameras.main;
    const scroll = clampCameraScroll(target, this.cameraBounds, camera);
    camera.setScroll(scroll.x, scroll.y);
  };

  private readonly endPan = (pointer: Phaser.Input.Pointer): void => {
    const selection = this.selectionTap.end(pointer.id, pointer.wasCanceled);
    if (selection) {
      const selected =
        selection === "structure" ? this.selectionCandidate : undefined;
      this.selectionCandidate = undefined;
      this.setSelectedStructure(selected?.instanceId);
      this.interactionHandler?.({
        instanceId: selected?.instanceId ?? "",
        type: "StructureSelected",
      });
      return;
    }
    if (this.floorGesture?.pointerId === pointer.id) {
      const gesture = this.floorGesture;
      this.floorGesture = undefined;
      const evaluation = this.floorEvaluation(
        gesture.batch.values(),
        gesture.mode,
      );
      const previewCells =
        evaluation.cells.length > 0 ? evaluation.cells : gesture.batch.values();
      if (previewCells.length > 0 && !pointer.wasCanceled)
        this.interactionHandler?.({
          cells: previewCells,
          ...(evaluation.issue && { issue: evaluation.issue }),
          mode: gesture.mode,
          type: "FloorPreviewChanged",
          valid: evaluation.valid,
        });
      return;
    }
    if (this.constructionPointerId === pointer.id) {
      this.constructionPointerId = undefined;
      const anchor = this.snappedStructureAnchor(pointer);
      const valid = this.isConstructionPreviewValid(anchor);
      if (!pointer.wasCanceled) {
        this.drawConstructionPreview(anchor);
        this.interactionHandler?.({
          anchor,
          type: "StructurePreviewChanged",
          valid,
        });
      }
      return;
    }
    if (this.drag?.pointerId === pointer.id) {
      this.pendingDragPointer.clear();
      this.drag.object = this.objectAtPointer(this.drag.object, pointer);
      const object = this.drag.object;
      this.drag = undefined;
      if (placementIsValid(object, this.world.placementSpaces)) {
        this.placementPreview = object;
        this.interactionHandler?.({
          type: "PlacedObjectTransformCommitted",
          ...object,
        });
      } else {
        this.renderObjects();
      }
      return;
    }
    this.pan.end(pointer.id);
  };

  private readonly cancelPan = (): void => {
    this.pan.cancel();
    this.pendingDragPointer.clear();
    this.cancelConstructionGesture();
    if (!this.drag) return;
    this.drag = undefined;
    if (this.rendered) this.renderObjects();
  };

  private readonly renderWorld = (size: Phaser.Structs.Size): void => {
    const firstRender = !this.rendered;
    const renderStartedAt = startupNow();
    markStartupEvent("render-world-called");
    const camera = this.cameras.main;
    const previousScroll = { x: camera.scrollX, y: camera.scrollY };
    const zoom = Math.min(
      1,
      size.width / (this.world.spaceA.width + CELL_SIZE * 2),
    );
    camera.setZoom(zoom);
    const structure = this.projection.worldStructure;
    const floorBounds = structure ? worldBounds(structure) : undefined;
    const dynamicBounds = floorBounds
      ? {
          x: floorBounds.x - CELL_SIZE * 10,
          y: floorBounds.y - CELL_SIZE * 10,
          width: floorBounds.width + CELL_SIZE * 20,
          height: floorBounds.height + CELL_SIZE * 20,
        }
      : this.world.bounds;
    this.cameraBounds = cameraBoundsFor(dynamicBounds, size);
    camera.setBounds(
      this.cameraBounds.x,
      this.cameraBounds.y,
      this.cameraBounds.width,
      this.cameraBounds.height,
    );
    const scroll = this.rendered
      ? clampCameraScroll(previousScroll, this.cameraBounds, size)
      : floorBounds
        ? clampCameraScroll(
            {
              x: floorBounds.x + floorBounds.width / 2 - size.width / 2,
              y: floorBounds.y + floorBounds.height / 2 - size.height / 2,
            },
            this.cameraBounds,
            size,
          )
        : initialCameraScroll(this.world, size);
    camera.setScroll(scroll.x, scroll.y);
    this.rendered = true;

    const background = this.background;
    const architecture = this.architecture;
    if (!background || !architecture) return;
    background
      .clear()
      .fillStyle(0x0a160f)
      .fillRect(
        this.cameraBounds.x,
        this.cameraBounds.y,
        this.cameraBounds.width,
        this.cameraBounds.height,
      );
    architecture.clear();
    this.clearExteriorTiles();
    this.renderExteriorGround();
    this.clearFloorTiles();
    this.renderFloorCells(structure?.floorCells);
    this.clearWallPieces();
    this.renderWallPlan();
    this.renderObjects();
    this.restoreConstructionPreview();
    if (firstRender)
      measureStartupPhase("first-render-world", renderStartedAt);
  };

  private renderExteriorGround(): void {
    for (const tile of exteriorGroundTiles(this.cameraBounds)) {
      const key = `architecture.floor.exterior-ground-01.${tile.variant}`;
      this.textures
        .get(key)
        .setFilter(
          EXTERIOR_GROUND_FILTERING === "LINEAR"
            ? Phaser.Textures.FilterMode.LINEAR
            : Phaser.Textures.FilterMode.NEAREST,
        );
      this.exteriorTiles.push(
        this.add
          .image(tile.x, tile.y, key)
          .setOrigin(0)
          .setDepth(0)
          .setDisplaySize(
            EXTERIOR_GROUND_WORLD_SIZE,
            EXTERIOR_GROUND_WORLD_SIZE,
          ),
      );
    }
  }

  private renderObjects(): void {
    for (const zone of this.objectZones) zone.destroy();
    for (const graphics of this.objectGraphics) graphics.destroy();
    for (const sprite of this.objectSprites) sprite.destroy();
    this.objectZones = [];
    this.objectGraphics = [];
    this.objectSprites = [];
    this.renderedObjects.clear();
    this.clearStructureZones();
    const objects = this.drag
      ? this.objects().map((object) =>
          object.instanceId === this.drag?.object.instanceId
            ? this.drag.object
            : object,
        )
      : this.visibleObjects();
    for (const object of objects) {
      const valid = placementIsValid(object, this.world.placementSpaces);
      const definition = objectDefinition(object.definitionId);
      if (!definition) continue;
      const { footprint } = definition;
      const depth = 40 + object.y + footprint.height;
      if (definition.visual) {
        const sprite = this.add
          .image(
            object.x + footprint.width / 2,
            object.y + footprint.height / 2,
            `${definition.id}.${orientationForRotation(object.rotation)}`,
          )
          .setDisplaySize(
            definition.visual.displayWidth,
            definition.visual.displayHeight,
          )
          .setOrigin(definition.visual.pivot.x, definition.visual.pivot.y)
          .setDepth(depth);
        this.objectSprites.push(sprite);
      } else {
        const graphics = this.add.graphics().setDepth(depth);
        this.objectGraphics.push(graphics);
        graphics
          .fillStyle(valid ? 0x8e5e35 : 0x9d3434, 0.95)
          .fillRoundedRect(
            object.x,
            object.y,
            footprint.width,
            footprint.height,
            6,
          )
          .lineStyle(2, 0xe7c47b, 0.95)
          .strokeRoundedRect(
            object.x,
            object.y,
            footprint.width,
            footprint.height,
            6,
          );
        graphics
          .fillStyle(0x312117)
          .fillRect(object.x + 8, object.y + 9, footprint.width - 16, 10);
      }
      const hitArea = definition.visual?.hitArea ?? footprint;
      const zone = this.add
        .zone(
          object.x + footprint.width / 2,
          object.y +
            footprint.height / 2 -
            (hitArea.height - footprint.height) / 2,
          hitArea.width,
          hitArea.height,
        )
        .setDepth(depth + 1)
        .setData("placedObject", object);
      this.objectZones.push(zone);
      this.renderedObjects.set(object.instanceId, {
        ...(definition.visual
          ? { sprite: this.objectSprites.at(-1) }
          : {
              graphics: this.objectGraphics.at(-1),
            }),
        zone,
      });
    }
    this.renderStructureZones();
    this.updateHitAreas();
  }

  private renderStructureZones(): void {
    const structure = this.projection.worldStructure;
    if (!structure) return;
    for (const placement of structure.placements) {
      for (const area of structureHitRegions(placement, structure)) {
        const zone = this.add
          .zone(
            area.x + area.width / 2,
            area.y + area.height / 2,
            area.width,
            area.height,
          )
          .setDepth(80);
        zone.setData("structurePlacement", placement);
        this.structureZones.push(zone);
      }
    }
  }

  private clearStructureZones(): void {
    for (const zone of this.structureZones) zone.destroy();
    this.structureZones = [];
  }

  private updateHitAreas(): void {
    const hitAreas = constructionHitAreas(this.construction);
    for (const zone of this.objectZones) {
      if (hitAreas.objects) zone.setInteractive({ useHandCursor: true });
      else zone.disableInteractive();
    }
    for (const zone of this.structureZones) {
      if (hitAreas.structures) zone.setInteractive({ useHandCursor: true });
      else zone.disableInteractive();
    }
  }

  private structureAt(
    pointer: Phaser.Input.Pointer,
  ): StructurePlacement | undefined {
    return structureAtWorldPoint(
      this.projection.worldStructure,
      this.worldPoint(pointer),
    );
  }

  private focusStructureIfNeeded(instanceId: string): void {
    const structure = this.projection.worldStructure;
    const placement = structure?.placements.find(
      (item) => item.instanceId === instanceId,
    );
    if (!structure || !placement) return;
    const regions = structureHitRegions(placement, structure);
    if (regions.length === 0) return;
    const left = Math.min(...regions.map((region) => region.x));
    const top = Math.min(...regions.map((region) => region.y));
    const right = Math.max(
      ...regions.map((region) => region.x + region.width),
    );
    const bottom = Math.max(
      ...regions.map((region) => region.y + region.height),
    );
    const view = this.cameras.main.worldView;
    const padding = CELL_SIZE;
    const visible =
      left >= view.left + padding &&
      right <= view.right - padding &&
      top >= view.top + padding &&
      bottom <= view.bottom - padding;
    if (visible) return;
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    if (this.reducedMotion) this.cameras.main.centerOn(x, y);
    else this.cameras.main.pan(x, y, 260, "Sine.easeOut", true);
  }

  private worldPoint(pointer: Phaser.Input.Pointer): {
    readonly x: number;
    readonly y: number;
  } {
    return { x: pointer.worldX, y: pointer.worldY };
  }

  private snappedStructureAnchor(pointer: Phaser.Input.Pointer): {
    readonly x: number;
    readonly y: number;
  } {
    return snapStructureAnchor(this.worldPoint(pointer));
  }

  private collectFloorCell(pointer: Phaser.Input.Pointer): void {
    const gesture = this.floorGesture;
    if (!gesture) return;
    const cell = snapFloorCell(this.worldPoint(pointer));
    gesture.batch.add(cell);
    const evaluation = this.floorEvaluation(gesture.batch.values(), gesture.mode);
    this.drawFloorPreview(
      evaluation.cells.length > 0 ? evaluation.cells : gesture.batch.values(),
      evaluation.valid,
    );
  }

  private updateConstructionPreview(pointer: Phaser.Input.Pointer): void {
    this.drawConstructionPreview(this.snappedStructureAnchor(pointer));
  }

  private drawConstructionPreview(anchor: {
    readonly x: number;
    readonly y: number;
  }): void {
    const definitionId =
      this.construction.placingDefinitionId ??
      this.projection.worldStructure?.placements.find(
        (item) => item.instanceId === this.construction.movingInstanceId,
      )?.definitionId;
    if (!definitionId) return;
    const areas = structureHitRegions(
      {
        anchor,
        definitionId,
        instanceId: "construction.preview",
      },
      this.projection.worldStructure,
    );
    if (areas.length === 0) return;
    const valid = isStructurePreviewValid(
      this.projection.worldStructure,
      definitionId,
      anchor,
      this.construction.movingInstanceId,
    );
    const preview =
      this.constructionPreview ?? this.add.graphics().setDepth(90);
    preview.clear();
    const color = valid ? 0x8cd790 : 0xe16b6b;
    for (const area of areas) {
      preview
        .lineStyle(3, color, 0.95)
        .strokeRect(area.x, area.y, area.width, area.height)
        .fillStyle(color, valid ? 0.18 : 0.12)
        .fillRect(area.x, area.y, area.width, area.height);
      if (!valid)
        preview
          .lineStyle(2, 0xffe2a8, 0.95)
          .lineBetween(
            area.x,
            area.y,
            area.x + area.width,
            area.y + area.height,
          )
          .lineBetween(
            area.x + area.width,
            area.y,
            area.x,
            area.y + area.height,
          );
    }
    this.constructionPreview = preview;
  }

  private drawFloorPreview(
    cells: readonly { readonly x: number; readonly y: number }[],
    valid: boolean,
  ): void {
    const preview =
      this.constructionPreview ?? this.add.graphics().setDepth(90);
    preview.clear();
    const color = valid ? 0x8cd790 : 0xe16b6b;
    for (const cell of cells) {
      const x = cell.x * CELL_SIZE;
      const y = cell.y * CELL_SIZE;
      preview
        .lineStyle(2, color, 0.95)
        .strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        .fillStyle(color, 0.16)
        .fillRect(x, y, CELL_SIZE, CELL_SIZE);
      if (!valid)
        preview
          .lineStyle(2, 0xffe2a8, 0.95)
          .lineBetween(x, y, x + CELL_SIZE, y + CELL_SIZE)
          .lineBetween(x + CELL_SIZE, y, x, y + CELL_SIZE);
    }
    this.constructionPreview = preview;
  }

  private floorEvaluation(
    cells: readonly { readonly x: number; readonly y: number }[],
    mode: "paint-floor" | "remove-floor",
  ) {
    const structure = this.projection.worldStructure;
    if (!structure)
      return {
        cells: Object.freeze([]),
        issue: "NO_FLOOR_CHANGE" as const,
        valid: false,
      };
    return evaluateFloorEdit(
      structure,
      cells,
      mode,
      this.construction.floorAvailable ?? 0,
      this.projection.placedObjects,
    );
  }

  private clearConstructionPreview(): void {
    this.constructionPreview?.destroy();
    this.constructionPreview = undefined;
  }

  private isConstructionPreviewValid(anchor: {
    readonly x: number;
    readonly y: number;
  }): boolean {
    const definitionId =
      this.construction.placingDefinitionId ??
      this.projection.worldStructure?.placements.find(
        (placement) =>
          placement.instanceId === this.construction.movingInstanceId,
      )?.definitionId;
    return Boolean(
      definitionId &&
      isStructurePreviewValid(
        this.projection.worldStructure,
        definitionId,
        anchor,
        this.construction.movingInstanceId,
      ),
    );
  }

  private restoreConstructionPreview(): void {
    if (!this.construction.active) return;
    if (
      this.construction.tool === "paint-floor" ||
      this.construction.tool === "remove-floor"
    ) {
      const cells = this.construction.floorPreviewCells ?? [];
      if (cells.length > 0) {
        const evaluation = this.floorEvaluation(cells, this.construction.tool);
        this.drawFloorPreview(
          evaluation.cells.length > 0 ? evaluation.cells : cells,
          evaluation.valid,
        );
      }
      return;
    }
    if (
      this.construction.tool !== "place-structure" ||
      (!this.construction.placingDefinitionId &&
        !this.construction.movingInstanceId)
    )
      return;
    const camera = this.cameras.main;
    const anchor =
      this.construction.previewAnchor ??
      snapStructureAnchor({
        x: camera.scrollX + camera.width / 2,
        y: camera.scrollY + camera.height / 2,
      });
    this.drawConstructionPreview(anchor);
    this.interactionHandler?.({
      anchor,
      type: "StructurePreviewChanged",
      valid: this.isConstructionPreviewValid(anchor),
    });
  }

  private autoPanConstruction(pointer: Phaser.Input.Pointer): void {
    const camera = this.cameras.main;
    const edge = Math.min(
      64,
      Math.max(40, Math.min(camera.width, camera.height) * 0.12),
    );
    const speed = 12;
    const deltaX =
      pointer.x < edge ? -speed : pointer.x > camera.width - edge ? speed : 0;
    const deltaY =
      pointer.y < edge ? -speed : pointer.y > camera.height - edge ? speed : 0;
    if (deltaX === 0 && deltaY === 0) return;
    const scroll = clampCameraScroll(
      { x: camera.scrollX + deltaX, y: camera.scrollY + deltaY },
      this.cameraBounds,
      camera,
    );
    camera.setScroll(scroll.x, scroll.y);
  }

  private setSelectedStructure(instanceId: string | undefined): void {
    this.selectionHighlight?.destroy();
    this.selectionHighlight = undefined;
    const placement = this.projection.worldStructure?.placements.find(
      (candidate) => candidate.instanceId === instanceId,
    );
    const areas = placement
      ? structureHitRegions(placement, this.projection.worldStructure)
      : [];
    if (areas.length === 0) return;
    const highlight = this.add.graphics().setDepth(89);
    for (const area of areas)
      highlight
        .lineStyle(3, 0xfff1b8, 0.98)
        .strokeRect(area.x - 2, area.y - 2, area.width + 4, area.height + 4);
    this.selectionHighlight = highlight;
  }

  private cancelConstructionGesture(): void {
    this.constructionPointerId = undefined;
    this.floorGesture?.batch.clear();
    this.floorGesture = undefined;
    this.selectionCandidate = undefined;
    this.selectionTap.cancel();
    this.clearConstructionPreview();
  }

  /** Hot path: mutates the selected preview only; no GameObjects are rebuilt. */
  private updateDragPreview(object: PlacedObject): void {
    const definition = objectDefinition(object.definitionId);
    const rendered = this.renderedObjects.get(object.instanceId);
    if (!definition || !rendered) return;
    const { footprint } = definition;
    const depth = 40 + object.y + footprint.height;
    const hitArea = definition.visual?.hitArea ?? footprint;
    rendered.sprite
      ?.setPosition(
        object.x + footprint.width / 2,
        object.y + footprint.height / 2,
      )
      .setDepth(depth);
    rendered.zone
      .setPosition(
        object.x + footprint.width / 2,
        object.y +
          footprint.height / 2 -
          (hitArea.height - footprint.height) / 2,
      )
      .setDepth(depth + 1)
      .setData("placedObject", object);
    if (rendered.graphics) {
      const valid = placementIsValid(object, this.world.placementSpaces);
      rendered.graphics
        .clear()
        .fillStyle(valid ? 0x8e5e35 : 0x9d3434, 0.95)
        .fillRoundedRect(
          object.x,
          object.y,
          footprint.width,
          footprint.height,
          6,
        )
        .lineStyle(2, 0xe7c47b, 0.95)
        .strokeRoundedRect(
          object.x,
          object.y,
          footprint.width,
          footprint.height,
          6,
        )
        .fillStyle(0x312117)
        .fillRect(object.x + 8, object.y + 9, footprint.width - 16, 10)
        .setDepth(depth);
    }
  }

  private objectAt(x: number, y: number): PlacedObject | undefined {
    return this.objects().find((object) => {
      const definition = objectDefinition(object.definitionId);
      if (!definition) return false;
      const hitArea = definition.visual?.hitArea ?? definition.footprint;
      const hitX = object.x + (definition.footprint.width - hitArea.width) / 2;
      const hitY =
        object.y + (definition.footprint.height - hitArea.height) / 2;
      return (
        x >= hitX &&
        x <= hitX + hitArea.width &&
        y >= hitY &&
        y <= hitY + hitArea.height
      );
    });
  }

  private objects(): readonly PlacedObject[] {
    return this.projection.placedObjects ?? DEFAULT_PLACED_OBJECTS;
  }

  private visibleObjects(): readonly PlacedObject[] {
    const preview = this.placementPreview;
    if (!preview) return this.objects();
    return this.objects().map((object) =>
      object.instanceId === preview.instanceId ? preview : object,
    );
  }

  private objectAtPointer(
    object: PlacedObject,
    pointer: Phaser.Input.Pointer,
  ): PlacedObject {
    const definition = objectDefinition(object.definitionId);
    if (!definition) return object;
    const candidate = {
      ...object,
      x:
        Math.round(
          (pointer.worldX - definition.footprint.width / 2) / CELL_SIZE,
        ) * CELL_SIZE,
      y:
        Math.round(
          (pointer.worldY - definition.footprint.height / 2) / CELL_SIZE,
        ) * CELL_SIZE,
    };
    const space = Object.entries(this.world.placementSpaces).find(
      ([, area]) =>
        candidate.x >= area.x &&
        candidate.x < area.x + area.width &&
        candidate.y >= area.y &&
        candidate.y < area.y + area.height,
    )?.[0] as PlacedObject["spaceId"] | undefined;
    return { ...candidate, spaceId: space ?? object.spaceId };
  }

  private renderWallPlan(): void {
    const plan = structureRenderPlan(this.projection.worldStructure);
    for (const piece of plan) this.renderWallPiece(piece);
  }

  private renderWallPiece(piece: StructureRenderPiece): void {
    const rendered = renderStructurePieceToTarget(piece, {
      configureTexture: (textureKey) => {
        this.textures
          .get(textureKey)
          .setFilter(Phaser.Textures.FilterMode.LINEAR);
      },
      createFallback: () => this.add.graphics(),
      createSprite: (x, y, textureKey) => this.add.image(x, y, textureKey),
      textureExists: (textureKey) => this.textures.exists(textureKey),
    });
    if (rendered.kind === "sprite") this.wallSprites.push(rendered.object);
    else this.wallFallbacks.push(rendered.object);
  }

  private renderFloor(space: WorldRectangle): void {
    const mask = this.add.graphics().setVisible(false);
    mask
      .fillStyle(0xffffff)
      .fillRect(space.x, space.y, space.width, space.height);
    this.floorMasks.push(mask);
    for (const tile of woodFloorTiles(space)) {
      const textureKey = `architecture.floor.wood-01.${tile.variant}`;
      this.textures
        .get(textureKey)
        .setFilter(
          WOOD_FLOOR_FILTERING === "LINEAR"
            ? Phaser.Textures.FilterMode.LINEAR
            : Phaser.Textures.FilterMode.NEAREST,
        );
      const floorTile = this.add
        .image(tile.x, tile.y, textureKey)
        .setDepth(1)
        .setMask(mask.createGeometryMask())
        .setOrigin(0)
        .setDisplaySize(WOOD_FLOOR_WORLD_SIZE, WOOD_FLOOR_WORLD_SIZE);
      this.floorTiles.push(floorTile);
    }
  }

  /** A single mask keeps cell persistence without creating a display object per cell. */
  private renderFloorCells(
    cells: readonly { readonly x: number; readonly y: number }[] | undefined,
  ): void {
    if (!cells || cells.length === 0) {
      for (const area of this.world.floorAreas) this.renderFloor(area);
      return;
    }
    const bounds = worldBounds({
      ...this.projection.worldStructure!,
      floorCells: cells,
    });
    const mask = this.add.graphics().setVisible(false);
    for (const cell of cells)
      mask
        .fillStyle(0xffffff)
        .fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    this.floorMasks.push(mask);
    const area = { ...bounds };
    for (const tile of woodFloorTiles(area)) {
      const textureKey = `architecture.floor.wood-01.${tile.variant}`;
      this.textures
        .get(textureKey)
        .setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.floorTiles.push(
        this.add
          .image(tile.x, tile.y, textureKey)
          .setDepth(1)
          .setMask(mask.createGeometryMask())
          .setOrigin(0)
          .setDisplaySize(WOOD_FLOOR_WORLD_SIZE, WOOD_FLOOR_WORLD_SIZE),
      );
    }
  }

  private clearFloorTiles(): void {
    for (const tile of this.floorTiles) tile.destroy();
    for (const mask of this.floorMasks) mask.destroy();
    this.floorTiles = [];
    this.floorMasks = [];
  }

  private clearExteriorTiles(): void {
    for (const tile of this.exteriorTiles) tile.destroy();
    this.exteriorTiles = [];
  }

  private clearWallPieces(): void {
    destroyStructureRenderObjects(this.wallSprites);
    destroyStructureRenderObjects(this.wallFallbacks);
    this.wallSprites = [];
    this.wallFallbacks = [];
  }

  private presentStructuralUnlockFeedback(): void {
    this.clearStructuralUnlockFeedback();
    const highlight = this.add.graphics().setDepth(50).setScrollFactor(0);
    highlight.fillStyle(0xd5a83a, 0.24);
    highlight.fillRoundedRect(12, 12, 164, 48, 12);
    highlight.lineStyle(2, 0xf8dfa0, 0.9);
    highlight.strokeRoundedRect(12, 12, 164, 48, 12);
    this.structuralUnlockHighlight = highlight;
    if (!this.reducedMotion) {
      this.structuralUnlockTween = this.tweens.add({
        alpha: 0.58,
        duration: 360,
        ease: "Sine.easeInOut",
        targets: highlight,
        yoyo: true,
      });
    }
    this.structuralUnlockTimer = this.time.delayedCall(
      structuralUnlockFeedbackDuration(this.reducedMotion),
      () => this.clearStructuralUnlockFeedback(),
      [],
      this,
    );
  }

  private clearStructuralUnlockFeedback(): void {
    this.structuralUnlockTimer?.remove(false);
    this.structuralUnlockTimer = undefined;
    this.structuralUnlockTween?.remove();
    this.structuralUnlockTween = undefined;
    this.structuralUnlockHighlight?.destroy();
    this.structuralUnlockHighlight = undefined;
  }

  private readonly shutdown = (): void => {
    this.pan.cancel();
    this.cancelConstructionGesture();
    this.selectionHighlight?.destroy();
    this.selectionHighlight = undefined;
    this.clearFloorTiles();
    this.clearExteriorTiles();
    this.clearWallPieces();
    this.clearStructureZones();
    this.clearConstructionPreview();
    this.clearStructuralUnlockFeedback();
    for (const zone of this.objectZones) zone.destroy();
    for (const graphics of this.objectGraphics) graphics.destroy();
    for (const sprite of this.objectSprites) sprite.destroy();
    this.renderedObjects.clear();
    this.interactionHandler = undefined;
    this.game.canvas.removeEventListener("pointercancel", this.cancelPan);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.renderWorld, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.beginPan, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.movePan, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.endPan, this);
    this.input.off(
      Phaser.Input.Events.POINTER_UP_OUTSIDE,
      this.cancelPan,
      this,
    );
  };
}
