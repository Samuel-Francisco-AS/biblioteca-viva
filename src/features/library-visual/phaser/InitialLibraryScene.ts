import Phaser from "phaser";
import { DECORATION_ID } from "../../../domain";

import type {
  LibraryInteraction,
  LibraryVisualPeriod,
  LibraryVisualRuntimeSnapshot,
  LibraryViewModel,
  RoomViewModel,
} from "../contracts";
import {
  LIBRARY_ROOM_ANIMATIONS,
  LIBRARY_ATMOSPHERES,
  LIBRARY_ATMOSPHERE_TRANSITION_MS,
  LIBRARY_ROOM_INTERACTION,
  LIBRARY_ROOM_PALETTE as COLOR,
  decorationUnlockMotion,
  libraryRoomMotionPlan,
} from "./roomConfig";
import {
  librarySceneLayout,
  type LibrarySceneLayout,
  type LibrarySceneLayoutMode,
  type SceneRectangle,
} from "./sceneLayout";
import {
  LIBRARY_VISUAL_MANIFEST,
  resolveVisualSource,
  type EssentialVisualId,
} from "./roomManifest";
import {
  SceneMotionLifecycle,
  type MotionReconciliationReason,
  type SceneMotionDefinition,
} from "./motionLifecycle";
import {
  highlightMotionNeedsReplacement,
  resizeMotionAction,
} from "./motionPolicy";
import {
  TapSelectionPolicy,
  type LibraryTapTarget,
} from "./tapSelectionPolicy";

function rectangleContains(
  hitArea: Phaser.Geom.Rectangle,
  x: number,
  y: number,
): boolean {
  return hitArea.contains(x, y);
}

export class InitialLibraryScene extends Phaser.Scene {
  private atmosphere?: Phaser.GameObjects.Graphics;
  private atmosphereTween?: Phaser.Tweens.Tween;
  private background?: Phaser.GameObjects.Graphics;
  private counter?: Phaser.GameObjects.Graphics;
  private creature?: Phaser.GameObjects.Container;
  private creatureFigure?: Phaser.GameObjects.Graphics;
  private readonly creaturePhase = { value: 0 };
  private creatureZone?: Phaser.GameObjects.Zone;
  private currentLayout?: LibrarySceneLayout;
  private failedAssetIds = new Set<EssentialVisualId>();
  private highlightedBook?: Phaser.GameObjects.Container;
  private highlightedBookFigure?: Phaser.GameObjects.Graphics;
  private readonly highlightedBookPhase = { value: 0 };
  private highlightedBookZone?: Phaser.GameObjects.Zone;
  private interactionHandler?: (interaction: LibraryInteraction) => void;
  private librarian?: Phaser.GameObjects.Container;
  private librarianFigure?: Phaser.GameObjects.Graphics;
  private readonly librarianPhase = { value: 0 };
  private librarianZone?: Phaser.GameObjects.Zone;
  private lighting?: Phaser.GameObjects.Graphics;
  private readonly motion = new SceneMotionLifecycle();
  private readonly presentedUnlockEventIds = new Set<string>();
  private projection: LibraryViewModel;
  private period: LibraryVisualPeriod;
  private readingLamp?: Phaser.GameObjects.Container;
  private room: RoomViewModel;
  private readingLampFigure?: Phaser.GameObjects.Graphics;
  private reducedMotion: boolean;
  private renderedSize?: { readonly height: number; readonly width: number };
  private shelf?: Phaser.GameObjects.Graphics;
  private shelfZone?: Phaser.GameObjects.Zone;
  private readonly tapSelection = new TapSelectionPolicy();
  private unlockTween?: Phaser.Tweens.Tween;

  constructor(
    projection: LibraryViewModel,
    reducedMotion: boolean,
    room: RoomViewModel,
    interactionHandler?: (interaction: LibraryInteraction) => void,
    period: LibraryVisualPeriod = "night",
  ) {
    super("initial-library");
    this.projection = projection;
    this.period = period;
    this.reducedMotion = reducedMotion;
    this.room = room;
    this.interactionHandler = interactionHandler;
  }

  preload(): void {
    const assetEntries = LIBRARY_VISUAL_MANIFEST.filter(
      (entry) => entry.assetPath !== null,
    );
    if (assetEntries.length === 0) return;
    this.load.on(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      this.registerAssetFailure,
      this,
    );
    assetEntries.forEach((entry) => {
      if (entry.assetPath) this.load.image(entry.id, entry.assetPath);
    });
  }

  create(): void {
    this.load.off(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      this.registerAssetFailure,
      this,
    );
    this.background = this.add.graphics().setDepth(0);
    this.shelf = this.add.graphics().setDepth(20);
    this.counter = this.add.graphics().setDepth(30);
    this.librarianFigure = this.add.graphics();
    this.librarian = this.add
      .container(0, 0, [this.librarianFigure])
      .setDepth(40);
    this.creatureFigure = this.add.graphics();
    this.creature = this.add
      .container(0, 0, [this.creatureFigure])
      .setDepth(45);
    this.highlightedBookFigure = this.add.graphics();
    this.highlightedBook = this.add
      .container(0, 0, [this.highlightedBookFigure])
      .setDepth(50);
    this.readingLampFigure = this.add.graphics();
    this.readingLamp = this.add
      .container(0, 0, [this.readingLampFigure])
      .setDepth(55);
    this.lighting = this.add.graphics().setDepth(60);
    this.atmosphere = this.add.graphics().setDepth(58);

    this.shelfZone = this.createInteractiveZone(this.beginShelfSelection);
    this.librarianZone = this.createInteractiveZone(
      this.beginLibrarianSelection,
    );
    this.creatureZone = this.createInteractiveZone(this.beginCreatureSelection);
    this.highlightedBookZone = this.createInteractiveZone(
      this.beginHighlightedBookSelection,
    );

    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.trackSelection, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.finishSelection, this);
    this.input.on(
      Phaser.Input.Events.POINTER_UP_OUTSIDE,
      this.cancelSelection,
      this,
    );

    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.renderLayout(this.scale.gameSize, "initial");
  }

  setInteractionHandler(
    interactionHandler: ((interaction: LibraryInteraction) => void) | undefined,
  ): void {
    this.interactionHandler = interactionHandler;
  }

  setAtmosphere(period: LibraryVisualPeriod, animate: boolean): void {
    if (this.period === period) return;
    this.period = period;
    const layout = this.currentLayout;
    if (!layout || !this.renderedSize) return;
    this.atmosphereTween?.remove();
    this.atmosphereTween = undefined;
    this.drawAtmosphere(
      layout,
      this.renderedSize.width,
      this.renderedSize.height,
    );
    if (!animate || this.reducedMotion) {
      this.atmosphere?.setAlpha(1);
      return;
    }
    this.atmosphere?.setAlpha(0);
    this.atmosphereTween = this.tweens.add({
      alpha: 1,
      duration: LIBRARY_ATMOSPHERE_TRANSITION_MS,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.atmosphereTween = undefined;
      },
      targets: this.atmosphere,
    });
  }

  setReducedMotion(reducedMotion: boolean): void {
    if (this.reducedMotion === reducedMotion) return;
    this.reducedMotion = reducedMotion;
    if (!this.currentLayout) return;
    if (reducedMotion && this.unlockTween) {
      this.unlockTween.remove();
      this.unlockTween = undefined;
      this.readingLamp?.setAlpha(1).setScale(1);
      const animation = this.projection.decorationUnlockAnimation;
      if (animation)
        this.interactionHandler?.({
          decorationId: animation.decorationId,
          eventId: animation.eventId,
          type: "DecorationUnlockPresented",
        });
    }
    this.resetMotionPhases();
    this.startMotion("preference-change");
    this.applyMotionFrame();
    this.presentPendingUnlock();
  }

  updateProjection(projection: LibraryViewModel): void {
    const highlightPresenceChanged = highlightMotionNeedsReplacement(
      this.projection.highlightedBook !== null,
      projection.highlightedBook !== null,
    );
    this.projection = projection;
    const layout = this.currentLayout;
    if (!this.background || !layout) return;
    this.drawShelf(layout);
    this.drawHighlightedBook(layout, projection.highlightedBook !== null);
    this.drawReadingLamp(layout);
    this.updateZone(
      this.highlightedBookZone,
      layout.highlightedBookHitArea,
      projection.highlightedBook !== null,
    );
    if (highlightPresenceChanged) {
      this.highlightedBookPhase.value = 0;
      const highlightedBookMoves = libraryRoomMotionPlan(
        this.reducedMotion,
      ).highlightedBookMoves;
      this.motion.replaceOne(
        projection.highlightedBook && highlightedBookMoves
          ? this.highlightedBookMotionDefinition()
          : undefined,
        "highlighted-book",
        "highlight-presence-change",
      );
    }
    this.applyMotionFrame();
    this.presentPendingUnlock();
  }

  updateRoom(room: RoomViewModel): void {
    this.room = room;
  }

  pauseMotion(): void {
    this.motion.pause();
  }

  resumeMotion(): void {
    this.motion.resume();
  }

  runtimeSnapshot(): LibraryVisualRuntimeSnapshot {
    void this.room.roomId;
    return Object.freeze({
      activeTweens: this.tweens.getTweens().length,
      displayObjects: this.children.length,
      fps:
        Number.isFinite(this.game.loop.actualFps) &&
        this.game.loop.actualFps > 0
          ? this.game.loop.actualFps
          : null,
      interactiveZones: [
        this.shelfZone,
        this.librarianZone,
        this.creatureZone,
        this.highlightedBookZone,
      ].filter((zone) => zone?.active).length,
    });
  }

  private createInteractiveZone(
    callback: (pointer: Phaser.Input.Pointer) => void,
  ): Phaser.GameObjects.Zone {
    const zone = this.add.zone(0, 0, 1, 1).setOrigin(0).setDepth(90);
    zone.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 1, 1),
      rectangleContains,
    );
    zone.on("pointerdown", callback, this);
    return zone;
  }

  private drawBackground(
    layout: LibrarySceneLayout,
    width: number,
    height: number,
  ): void {
    const graphics = this.background;
    if (!graphics) return;
    graphics.clear();
    graphics.fillStyle(COLOR.floor).fillRect(0, 0, width, height);
    graphics.lineStyle(1, COLOR.floorLine, 0.48);
    const boardHeight = Math.max(18, Math.round(height / 10));
    for (let y = layout.wallHeight; y < height; y += boardHeight) {
      graphics.lineBetween(0, y, width, y);
    }
    graphics.fillStyle(COLOR.wall).fillRect(0, 0, width, layout.wallHeight);
    graphics
      .fillStyle(COLOR.wallTrim)
      .fillRect(0, layout.wallHeight - 4, width, 4);
  }

  private drawShelf(layout: LibrarySceneLayout): void {
    const graphics = this.shelf;
    if (!graphics) return;
    const { shelf } = layout;
    graphics.clear();
    this.drawShelfFrame(graphics, shelf);
    this.drawShelfFrame(graphics, layout.sideShelf);
    this.drawBookGroups(graphics, layout);
    if (this.projection.hasCompletedBook) {
      const marker = layout.milestoneMarker;
      graphics
        .fillStyle(COLOR.bookCompleted)
        .fillCircle(
          marker.x + marker.width / 2,
          marker.y + marker.height / 2,
          Math.min(marker.width, marker.height) / 2,
        );
      graphics
        .lineStyle(2, COLOR.bookPaper)
        .strokeCircle(
          marker.x + marker.width / 2,
          marker.y + marker.height / 2,
          Math.min(marker.width, marker.height) / 3,
        );
    }
  }

  private drawShelfFrame(
    graphics: Phaser.GameObjects.Graphics,
    shelf: SceneRectangle,
  ): void {
    graphics
      .fillStyle(COLOR.shelfDark)
      .fillRoundedRect(shelf.x, shelf.y, shelf.width, shelf.height, 5);
    graphics
      .fillStyle(COLOR.shelfLight)
      .fillRect(shelf.x + 6, shelf.y + 6, shelf.width - 12, shelf.height - 12);
    graphics.lineStyle(4, COLOR.shelfDark);
    for (let row = 1; row < 4; row += 1) {
      graphics.lineBetween(
        shelf.x + 4,
        shelf.y + (shelf.height * row) / 4,
        shelf.x + shelf.width - 4,
        shelf.y + (shelf.height * row) / 4,
      );
    }
  }

  private drawBookGroups(
    graphics: Phaser.GameObjects.Graphics,
    layout: LibrarySceneLayout,
  ): void {
    const count = this.projection.shelfVisualGroupCount;
    const { shelf } = layout;
    const spineWidth = Math.max(5, Math.min(12, shelf.width / 18));
    const horizontalRoom = Math.max(
      2,
      (shelf.width - 18 - spineWidth * count) / Math.max(1, count),
    );
    for (let index = 0; index < count; index += 1) {
      const row = index % 3;
      const x = shelf.x + 9 + index * (spineWidth + horizontalRoom);
      const y = shelf.y + shelf.height * (0.1 + row * 0.25);
      const color =
        index === 0 && this.projection.inProgressBooks > 0
          ? COLOR.bookInProgress
          : index === 1 && this.projection.completedBooks > 0
            ? COLOR.bookCompleted
            : COLOR.spine;
      graphics
        .fillStyle(color)
        .fillRoundedRect(x, y, spineWidth, shelf.height * 0.17, 1);
      graphics
        .fillStyle(COLOR.bookPaper, 0.8)
        .fillRect(x + 2, y + 3, Math.max(1, spineWidth - 4), 2);
    }
  }

  private drawCounter(layout: LibrarySceneLayout): void {
    const graphics = this.counter;
    if (!graphics) return;
    const { counter } = layout;
    graphics.clear();
    graphics
      .fillStyle(COLOR.counterDark)
      .fillRoundedRect(counter.x, counter.y, counter.width, counter.height, 5);
    graphics
      .fillStyle(COLOR.counterLight)
      .fillRect(
        counter.x + 5,
        counter.y + 6,
        counter.width - 10,
        counter.height - 10,
      );
    graphics
      .fillStyle(COLOR.counterDark)
      .fillRect(counter.x - 3, counter.y, counter.width + 6, 6);
  }

  private drawLibrarian(layout: LibrarySceneLayout): void {
    const graphics = this.librarianFigure;
    if (!graphics || !this.librarian) return;
    const radius = layout.librarian.radius;
    graphics.clear();
    graphics
      .fillStyle(COLOR.librarianHair)
      .fillCircle(0, -radius * 0.7, radius * 0.72);
    graphics
      .fillStyle(COLOR.bookPaper)
      .fillCircle(0, -radius * 0.58, radius * 0.5);
    graphics
      .fillStyle(COLOR.librarianBody)
      .fillRoundedRect(
        -radius * 0.85,
        -radius * 0.1,
        radius * 1.7,
        radius * 1.65,
        4,
      );
    graphics
      .fillStyle(COLOR.librarianApron)
      .fillRoundedRect(-radius * 0.45, radius * 0.25, radius * 0.9, radius, 3);
    graphics
      .fillStyle(COLOR.textDark)
      .fillCircle(-radius * 0.18, -radius * 0.62, 1.3);
    graphics
      .fillStyle(COLOR.textDark)
      .fillCircle(radius * 0.18, -radius * 0.62, 1.3);
  }

  private drawCreature(layout: LibrarySceneLayout): void {
    const graphics = this.creatureFigure;
    if (!graphics || !this.creature) return;
    const radius = layout.creature.radius;
    graphics.clear();
    graphics
      .fillStyle(COLOR.creatureBody)
      .fillEllipse(0, 0, radius * 2, radius * 1.5);
    graphics.fillTriangle(
      -radius * 0.65,
      -radius * 0.45,
      -radius * 0.35,
      -radius * 1.15,
      -radius * 0.05,
      -radius * 0.45,
    );
    graphics.fillTriangle(
      radius * 0.05,
      -radius * 0.45,
      radius * 0.35,
      -radius * 1.15,
      radius * 0.65,
      -radius * 0.45,
    );
    graphics.fillStyle(COLOR.creatureDetail).fillCircle(-radius * 0.28, -1, 2);
    graphics.fillStyle(COLOR.creatureDetail).fillCircle(radius * 0.28, -1, 2);
  }

  private drawHighlightedBook(
    layout: LibrarySceneLayout,
    visible: boolean,
  ): void {
    const graphics = this.highlightedBookFigure;
    const container = this.highlightedBook;
    if (!graphics || !container) return;
    graphics.clear();
    container.setVisible(visible);
    if (!visible) return;
    const { height, width } = layout.highlightedBook;
    graphics
      .fillStyle(COLOR.bookPaper)
      .fillRoundedRect(-width / 2, -height / 2, width, height, 3);
    graphics
      .lineStyle(2, COLOR.bookCompleted)
      .strokeRoundedRect(-width / 2, -height / 2, width, height, 3);
    graphics
      .lineStyle(1, COLOR.counterDark)
      .lineBetween(0, -height / 2 + 2, 0, height / 2 - 2);
  }

  private drawReadingLamp(layout: LibrarySceneLayout): void {
    const graphics = this.readingLampFigure;
    const container = this.readingLamp;
    if (!graphics || !container) return;
    const visible = this.projection.unlockedDecorationIds.includes(
      DECORATION_ID.readingLamp,
    );
    container
      .setPosition(
        layout.readingLamp.x + layout.readingLamp.width / 2,
        layout.readingLamp.y + layout.readingLamp.height / 2,
      )
      .setVisible(visible);
    graphics.clear();
    if (!visible) return;
    const { height, width } = layout.readingLamp;
    graphics
      .fillStyle(COLOR.counterDark)
      .fillRect(-1.5, -height * 0.08, 3, height * 0.55);
    graphics
      .fillStyle(COLOR.bookCompleted)
      .fillTriangle(
        -width / 2,
        -height * 0.12,
        width / 2,
        -height * 0.12,
        0,
        -height / 2,
      );
    graphics
      .fillStyle(COLOR.warmLight, 0.22)
      .fillCircle(0, -height * 0.18, width * 0.75);
    graphics
      .fillStyle(COLOR.counterDark)
      .fillRoundedRect(-width * 0.35, height * 0.42, width * 0.7, 3, 1);
  }

  private presentPendingUnlock(): void {
    const animation = this.projection.decorationUnlockAnimation;
    const lamp = this.readingLamp;
    if (
      !animation ||
      !lamp?.visible ||
      this.presentedUnlockEventIds.has(animation.eventId)
    )
      return;
    this.presentedUnlockEventIds.add(animation.eventId);
    const notify = () =>
      this.interactionHandler?.({
        decorationId: animation.decorationId,
        eventId: animation.eventId,
        type: "DecorationUnlockPresented",
      });
    const motion = decorationUnlockMotion(this.reducedMotion);
    if (!motion.animated) {
      lamp.setAlpha(1).setScale(1);
      notify();
      return;
    }
    lamp.setAlpha(0.35).setScale(0.78);
    this.unlockTween?.remove();
    this.unlockTween = this.tweens.add({
      alpha: 1,
      duration: motion.durationMs,
      ease: LIBRARY_ROOM_ANIMATIONS.unlock.ease,
      onComplete: () => {
        this.unlockTween = undefined;
        notify();
      },
      scale: 1,
      targets: lamp,
    });
  }

  private drawLighting(layout: LibrarySceneLayout): void {
    const graphics = this.lighting;
    if (!graphics) return;
    graphics.clear();
    layout.lightAreas.forEach((area) => {
      graphics
        .fillStyle(COLOR.warmLight, 0.08)
        .fillCircle(area.x, area.y, area.radius);
      graphics
        .fillStyle(COLOR.warmLight, 0.06)
        .fillCircle(area.x, area.y, area.radius * 0.62);
    });
  }

  private drawAtmosphere(
    layout: LibrarySceneLayout,
    width: number,
    height: number,
  ): void {
    const graphics = this.atmosphere;
    if (!graphics) return;
    const atmosphere = LIBRARY_ATMOSPHERES[this.period];
    graphics.clear();
    graphics
      .fillStyle(atmosphere.overlayColor, atmosphere.overlayAlpha)
      .fillRect(0, 0, width, height);
    graphics.fillStyle(
      atmosphere.directionalColor,
      atmosphere.directionalAlpha,
    );
    graphics.fillTriangle(
      width,
      0,
      width,
      height * 0.72,
      Math.max(layout.shelf.x + layout.shelf.width, width * 0.36),
      0,
    );
  }

  private updateZone(
    zone: Phaser.GameObjects.Zone | undefined,
    rectangle: SceneRectangle,
    enabled = true,
  ): void {
    if (!zone) return;
    zone
      .setPosition(rectangle.x, rectangle.y)
      .setSize(rectangle.width, rectangle.height);
    if (zone.input?.hitArea instanceof Phaser.Geom.Rectangle) {
      zone.input.hitArea.setSize(rectangle.width, rectangle.height);
      zone.input.enabled = enabled;
    }
  }

  private renderLayout(
    size: Phaser.Structs.Size,
    reconciliationReason?: MotionReconciliationReason,
    preparedLayout?: LibrarySceneLayout,
  ): void {
    const layout =
      preparedLayout ??
      librarySceneLayout({ height: size.height, width: size.width });
    if (reconciliationReason) this.resetMotionPhases();
    this.currentLayout = layout;
    this.renderedSize = { height: size.height, width: size.width };
    this.recordFallbackChoices();
    this.drawBackground(layout, size.width, size.height);
    this.drawShelf(layout);
    this.drawCounter(layout);
    this.drawLibrarian(layout);
    this.drawCreature(layout);
    const hasHighlight = this.projection.highlightedBook !== null;
    this.drawHighlightedBook(layout, hasHighlight);
    this.drawReadingLamp(layout);
    this.drawLighting(layout);
    this.drawAtmosphere(layout, size.width, size.height);
    this.updateZone(this.shelfZone, layout.shelfHitArea);
    this.updateZone(this.librarianZone, layout.librarianHitArea);
    this.updateZone(this.creatureZone, layout.creatureHitArea);
    this.updateZone(
      this.highlightedBookZone,
      layout.highlightedBookHitArea,
      hasHighlight,
    );
    this.applyMotionFrame();
    if (reconciliationReason) this.startMotion(reconciliationReason);
    this.presentPendingUnlock();
  }

  private recordFallbackChoices(): void {
    const loadedAssetIds = new Set(
      LIBRARY_VISUAL_MANIFEST.filter((entry) =>
        this.textures.exists(entry.id),
      ).map((entry) => entry.id),
    );
    LIBRARY_VISUAL_MANIFEST.forEach((entry) => {
      resolveVisualSource(entry, {
        failedAssetIds: this.failedAssetIds,
        loadedAssetIds,
      });
    });
  }

  private startMotion(reason: MotionReconciliationReason): void {
    const definitions: SceneMotionDefinition[] = [];
    const plan = libraryRoomMotionPlan(this.reducedMotion);
    if (plan.librarianMoves) {
      definitions.push(this.librarianMotionDefinition());
    }
    if (plan.creatureMoves) {
      definitions.push(this.creatureMotionDefinition());
    }
    if (plan.highlightedBookMoves && this.projection.highlightedBook) {
      definitions.push(this.highlightedBookMotionDefinition());
    }
    this.motion.replace(definitions, reason);
  }

  private librarianMotionDefinition(): SceneMotionDefinition {
    return {
      create: (onUnexpectedEnd) =>
        this.tweens.add({
          duration: LIBRARY_ROOM_ANIMATIONS.librarian.durationMs,
          ease: LIBRARY_ROOM_ANIMATIONS.librarian.ease,
          onComplete: onUnexpectedEnd,
          onStop: onUnexpectedEnd,
          onUpdate: this.applyMotionFrame,
          repeat: LIBRARY_ROOM_ANIMATIONS.librarian.repeat,
          targets: this.librarianPhase,
          value: 1,
          yoyo: LIBRARY_ROOM_ANIMATIONS.librarian.yoyo,
        }),
      id: "librarian",
    };
  }

  private creatureMotionDefinition(): SceneMotionDefinition {
    return {
      create: (onUnexpectedEnd) =>
        this.tweens.add({
          duration: LIBRARY_ROOM_ANIMATIONS.creature.durationMs,
          ease: LIBRARY_ROOM_ANIMATIONS.creature.ease,
          onComplete: onUnexpectedEnd,
          onStop: onUnexpectedEnd,
          onUpdate: this.applyMotionFrame,
          repeat: LIBRARY_ROOM_ANIMATIONS.creature.repeat,
          targets: this.creaturePhase,
          value: 1,
          yoyo: LIBRARY_ROOM_ANIMATIONS.creature.yoyo,
        }),
      id: "creature",
    };
  }

  private highlightedBookMotionDefinition(): SceneMotionDefinition {
    return {
      create: (onUnexpectedEnd) =>
        this.tweens.add({
          duration: LIBRARY_ROOM_ANIMATIONS.highlightedBook.durationMs,
          ease: LIBRARY_ROOM_ANIMATIONS.highlightedBook.ease,
          onComplete: onUnexpectedEnd,
          onStop: onUnexpectedEnd,
          onUpdate: this.applyMotionFrame,
          repeat: LIBRARY_ROOM_ANIMATIONS.highlightedBook.repeat,
          targets: this.highlightedBookPhase,
          value: 1,
          yoyo: LIBRARY_ROOM_ANIMATIONS.highlightedBook.yoyo,
        }),
      id: "highlighted-book",
    };
  }

  private resetMotionPhases(): void {
    this.librarianPhase.value = 0;
    this.creaturePhase.value = 0;
    this.highlightedBookPhase.value = 0;
  }

  private applyMotionFrame = (): void => {
    const layout = this.currentLayout;
    if (!layout) return;
    this.librarian?.setPosition(
      layout.librarian.x,
      layout.librarian.y -
        LIBRARY_ROOM_ANIMATIONS.librarian.idleAmplitude *
          this.librarianPhase.value,
    );
    const creatureLeft =
      layout.creatureMovementBounds.x + layout.creature.radius;
    const creatureRight =
      layout.creatureMovementBounds.x +
      layout.creatureMovementBounds.width -
      layout.creature.radius;
    const creatureX =
      creatureLeft + (creatureRight - creatureLeft) * this.creaturePhase.value;
    this.creature?.setPosition(creatureX, layout.creature.y);
    const creatureTargetSize = LIBRARY_ROOM_INTERACTION.minimumTargetSize;
    this.creatureZone?.setPosition(
      creatureX - creatureTargetSize / 2,
      layout.creature.y - creatureTargetSize / 2,
    );
    const highlighted = layout.highlightedBook;
    this.highlightedBook
      ?.setPosition(
        highlighted.x + highlighted.width / 2,
        highlighted.y + highlighted.height / 2,
      )
      .setScale(
        this.projection.highlightedBook
          ? 1 +
              LIBRARY_ROOM_ANIMATIONS.highlightedBook.idleAmplitude *
                this.highlightedBookPhase.value
          : 1,
      );
  };

  private registerAssetFailure = (file: Phaser.Loader.File): void => {
    const match = LIBRARY_VISUAL_MANIFEST.find(
      (entry) => entry.id === file.key,
    );
    if (match) this.failedAssetIds.add(match.id);
  };

  private handleResize = (size: Phaser.Structs.Size): void => {
    const previousMode: LibrarySceneLayoutMode | undefined =
      this.currentLayout?.mode;
    const nextLayout = librarySceneLayout({
      height: size.height,
      width: size.width,
    });
    const action = resizeMotionAction(
      this.renderedSize,
      previousMode,
      { height: size.height, width: size.width },
      nextLayout.mode,
    );
    if (action === "ignore") return;
    this.renderLayout(
      size,
      action === "replace-all" ? "layout-mode-change" : undefined,
      nextLayout,
    );
  };

  private beginSelection(
    target: LibraryTapTarget,
    pointer: Phaser.Input.Pointer,
  ): void {
    this.tapSelection.begin(target, pointer.id, pointer.x, pointer.y);
  }

  private beginShelfSelection = (pointer: Phaser.Input.Pointer): void => {
    this.beginSelection("shelf", pointer);
  };

  private beginLibrarianSelection = (pointer: Phaser.Input.Pointer): void => {
    this.beginSelection("librarian", pointer);
  };

  private beginCreatureSelection = (pointer: Phaser.Input.Pointer): void => {
    this.beginSelection("creature", pointer);
  };

  private beginHighlightedBookSelection = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    this.beginSelection("highlighted-book", pointer);
  };

  private trackSelection = (pointer: Phaser.Input.Pointer): void => {
    this.tapSelection.move(pointer.id, pointer.x, pointer.y);
  };

  private finishSelection = (pointer: Phaser.Input.Pointer): void => {
    const target = this.tapSelection.end(pointer.id, pointer.wasCanceled);
    if (target === "shelf")
      this.interactionHandler?.({ type: "ShelfSelected" });
    if (target === "librarian")
      this.interactionHandler?.({ type: "LibrarianSelected" });
    if (target === "creature")
      this.interactionHandler?.({ type: "CreatureSelected" });
    if (target === "highlighted-book") {
      const entryId = this.projection.highlightedBook?.entryId;
      if (entryId)
        this.interactionHandler?.({ entryId, type: "HighlightedBookSelected" });
    }
  };

  private cancelSelection = (): void => {
    this.tapSelection.cancel();
  };

  private shutdown = (): void => {
    this.tapSelection.cancel();
    this.motion.destroy();
    this.unlockTween?.remove();
    this.unlockTween = undefined;
    this.atmosphereTween?.remove();
    this.atmosphereTween = undefined;
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.load.off(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      this.registerAssetFailure,
      this,
    );
    [
      [this.shelfZone, this.beginShelfSelection],
      [this.librarianZone, this.beginLibrarianSelection],
      [this.creatureZone, this.beginCreatureSelection],
      [this.highlightedBookZone, this.beginHighlightedBookSelection],
    ].forEach(([zone, handler]) => {
      if (
        zone instanceof Phaser.GameObjects.Zone &&
        typeof handler === "function"
      ) {
        zone.off("pointerdown", handler, this);
        zone.destroy();
      }
    });
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.trackSelection, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.finishSelection, this);
    this.input.off(
      Phaser.Input.Events.POINTER_UP_OUTSIDE,
      this.cancelSelection,
      this,
    );
    this.interactionHandler = undefined;
  };
}
