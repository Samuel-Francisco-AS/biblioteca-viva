import Phaser from "phaser";

import type {
  LibraryInteraction,
  LibraryVisualPeriod,
  LibraryVisualRuntimeSnapshot,
  LibraryViewModel,
  RoomViewModel,
} from "../contracts";
import {
  CELL_SIZE,
  CameraPanPolicy,
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
  EXTERIOR_GROUND_CROP_SIZE,
  EXTERIOR_GROUND_TEXTURES,
  EXTERIOR_GROUND_WORLD_SIZE,
  exteriorGroundTiles,
} from "./exteriorGround";
import {
  DEFAULT_PLACED_OBJECT,
  placementIsValid,
  type PlacedObject,
} from "../../../application";

/** W1 procedural world: visual/transient only, with no persistent spatial data. */
export class SpatialWorldScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Graphics;
  private architecture?: Phaser.GameObjects.Graphics;
  private floorMasks: Phaser.GameObjects.Graphics[] = [];
  private floorTiles: Phaser.GameObjects.Image[] = [];
  private exteriorTiles: Phaser.GameObjects.Image[] = [];
  private objectZones: Phaser.GameObjects.Zone[] = [];
  private objectGraphics: Phaser.GameObjects.Graphics[] = [];
  private projection: LibraryViewModel;
  private interactionHandler?: (interaction: LibraryInteraction) => void;
  private placementModeInstanceId?: string;
  private drag?: { readonly pointerId: number; object: PlacedObject };
  private readonly pan = new CameraPanPolicy();
  private rendered = false;
  private readonly world = spatialWorldLayout();
  private cameraBounds = this.world.bounds;

  constructor(
    projection: LibraryViewModel,
    _reducedMotion: boolean,
    _room: RoomViewModel,
    interactionHandler?: (interaction: LibraryInteraction) => void,
    _period: LibraryVisualPeriod = "night",
  ) {
    super("spatial-world");
    this.projection = projection;
    this.interactionHandler = interactionHandler;
    void [_reducedMotion, _room, _period];
  }

  preload(): void {
    for (const [variant, path] of Object.entries(WOOD_FLOOR_TEXTURES)) {
      this.load.image(`architecture.floor.wood-01.${variant}`, path);
    }
    for (const [variant, path] of Object.entries(EXTERIOR_GROUND_TEXTURES))
      this.load.image(`architecture.floor.exterior-ground-01.${variant}`, path);
  }

  create(): void {
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
  }

  pauseMotion(): void {
    this.pan.cancel();
  }

  resumeMotion(): void {}

  runtimeSnapshot(): LibraryVisualRuntimeSnapshot {
    return Object.freeze({
      activeTweens: this.tweens.getTweens().length,
      displayObjects: this.children.length,
      fps: this.game.loop.actualFps > 0 ? this.game.loop.actualFps : null,
      interactiveZones: 0,
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
  }

  setReducedMotion(_reducedMotion: boolean): void {
    void _reducedMotion;
  }

  updateProjection(projection: LibraryViewModel): void {
    this.projection = projection;
    if (this.rendered) this.renderObjects();
  }

  updateRoom(_room: RoomViewModel): void {
    void _room;
  }

  private readonly beginPan = (pointer: Phaser.Input.Pointer): void => {
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
    if (this.drag?.pointerId === pointer.id) {
      this.drag.object = this.objectAtPointer(this.drag.object, pointer);
      this.renderObjects();
      return;
    }
    const target = this.pan.move(pointer.id, pointer.x, pointer.y);
    if (!target) return;
    const camera = this.cameras.main;
    const scroll = clampCameraScroll(target, this.cameraBounds, camera);
    camera.setScroll(scroll.x, scroll.y);
  };

  private readonly endPan = (pointer: Phaser.Input.Pointer): void => {
    if (this.drag?.pointerId === pointer.id) {
      const object = this.drag.object;
      this.drag = undefined;
      if (placementIsValid(object, this.world.placementSpaces)) {
        this.interactionHandler?.({
          type: "PlacedObjectTransformCommitted",
          ...object,
        });
      }
      this.renderObjects();
      return;
    }
    this.pan.end(pointer.id);
  };

  private readonly cancelPan = (): void => {
    this.pan.cancel();
  };

  private readonly renderWorld = (size: Phaser.Structs.Size): void => {
    const camera = this.cameras.main;
    const previousScroll = { x: camera.scrollX, y: camera.scrollY };
    this.cameraBounds = cameraBoundsFor(this.world.bounds, size);
    camera.setBounds(
      this.cameraBounds.x,
      this.cameraBounds.y,
      this.cameraBounds.width,
      this.cameraBounds.height,
    );
    const scroll = this.rendered
      ? clampCameraScroll(previousScroll, this.cameraBounds, size)
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
    for (const floorArea of this.world.floorAreas) this.renderFloor(floorArea);
    this.renderModularWalls(architecture);
    this.renderScaleAnchors(architecture);
    this.renderObjects();
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
          .setCrop(
            tile.cropX,
            tile.cropY,
            EXTERIOR_GROUND_CROP_SIZE,
            EXTERIOR_GROUND_CROP_SIZE,
          )
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
    this.objectZones = [];
    this.objectGraphics = [];
    const objects = this.drag
      ? this.objects().map((object) =>
          object.instanceId === this.drag?.object.instanceId
            ? this.drag.object
            : object,
        )
      : this.objects();
    for (const object of objects) {
      const valid = placementIsValid(object, this.world.placementSpaces);
      const graphics = this.add.graphics().setDepth(40);
      this.objectGraphics.push(graphics);
      graphics
        .fillStyle(valid ? 0x8e5e35 : 0x9d3434, 0.95)
        .fillRoundedRect(object.x, object.y, 64, 48, 6)
        .lineStyle(2, 0xe7c47b, 0.95)
        .strokeRoundedRect(object.x, object.y, 64, 48, 6);
      graphics.fillStyle(0x312117).fillRect(object.x + 8, object.y + 9, 48, 10);
      const zone = this.add
        .zone(object.x + 32, object.y + 24, 64, 48)
        .setDepth(41)
        .setInteractive({ useHandCursor: true })
        .setData("placedObject", object);
      this.objectZones.push(zone);
    }
  }

  private objectAt(x: number, y: number): PlacedObject | undefined {
    return this.objects().find(
      (object) =>
        x >= object.x &&
        x <= object.x + 64 &&
        y >= object.y &&
        y <= object.y + 48,
    );
  }

  private objects(): readonly PlacedObject[] {
    return this.projection.placedObjects ?? [DEFAULT_PLACED_OBJECT];
  }

  private objectAtPointer(
    object: PlacedObject,
    pointer: Phaser.Input.Pointer,
  ): PlacedObject {
    const candidate = {
      ...object,
      x: Math.round((pointer.worldX - 32) / CELL_SIZE) * CELL_SIZE,
      y: Math.round((pointer.worldY - 24) / CELL_SIZE) * CELL_SIZE,
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

  private renderModularWalls(graphics: Phaser.GameObjects.Graphics): void {
    const floorCells = floorCellKeys(this.world.floorAreas);
    for (const key of floorCells) {
      const { x, y } = parseCellKey(key);
      if (!floorCells.has(cellKey(x, y - 1)))
        this.renderWallCell(graphics, x, y - 1, "horizontal");
      if (!floorCells.has(cellKey(x, y + 1)))
        this.renderWallCell(graphics, x, y + 1, "horizontal");
      if (!floorCells.has(cellKey(x - 1, y)))
        this.renderWallCell(graphics, x - 1, y, "vertical");
      if (!floorCells.has(cellKey(x + 1, y)))
        this.renderWallCell(graphics, x + 1, y, "vertical");
    }
    this.renderDoorwayThresholds(graphics);
  }

  private renderWallCell(
    graphics: Phaser.GameObjects.Graphics,
    cellX: number,
    cellY: number,
    orientation: "horizontal" | "vertical",
  ): void {
    const x = cellX * CELL_SIZE;
    const y = cellY * CELL_SIZE;
    graphics
      .fillStyle(0x3f4039)
      .fillRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3)
      .fillStyle(0x57564b)
      .fillRect(
        x + 5,
        y + 5,
        orientation === "horizontal" ? CELL_SIZE - 10 : 5,
        orientation === "horizontal" ? 5 : CELL_SIZE - 10,
      )
      .lineStyle(1, 0x92876a, 0.72)
      .strokeRoundedRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
  }

  private renderDoorwayThresholds(graphics: Phaser.GameObjects.Graphics): void {
    for (const doorway of [
      this.world.connection.doorwayA,
      this.world.connection.doorwayB,
    ]) {
      const { floor } = doorway;
      graphics
        .fillStyle(0x69513a, 0.9)
        .fillRect(floor.x + 3, floor.y + 3, floor.width - 6, floor.height - 6)
        .lineStyle(2, 0xb08a58, 0.8)
        .strokeRect(
          floor.x + 4,
          floor.y + 4,
          floor.width - 8,
          floor.height - 8,
        );
    }
  }

  private renderScaleAnchors(graphics: Phaser.GameObjects.Graphics): void {
    const { spaceA, spaceB } = this.world;
    graphics
      .fillStyle(0x5b3825)
      .fillRoundedRect(
        spaceA.x + CELL_SIZE * 2,
        spaceA.y + CELL_SIZE * 2,
        CELL_SIZE * 3,
        CELL_SIZE * 1.5,
        5,
      )
      .lineStyle(3, 0xba8c57)
      .strokeRoundedRect(
        spaceA.x + CELL_SIZE * 2,
        spaceA.y + CELL_SIZE * 2,
        CELL_SIZE * 3,
        CELL_SIZE * 1.5,
        5,
      )
      .fillStyle(0x2c211a)
      .fillRect(
        spaceA.x + spaceA.width - CELL_SIZE * 1.5,
        spaceA.y + CELL_SIZE * 2,
        CELL_SIZE * 0.5,
        CELL_SIZE * 4,
      )
      .fillStyle(0x765136)
      .fillRect(
        spaceA.x + spaceA.width - CELL_SIZE * 1.25,
        spaceA.y + CELL_SIZE * 2.25,
        CELL_SIZE * 0.25,
        CELL_SIZE * 3.5,
      )
      .fillStyle(0x614431)
      .fillRoundedRect(
        spaceB.x + CELL_SIZE * 2,
        spaceB.y + CELL_SIZE * 2,
        CELL_SIZE * 2,
        CELL_SIZE * 2,
        6,
      )
      .lineStyle(3, 0xc29862)
      .strokeRoundedRect(
        spaceB.x + CELL_SIZE * 2,
        spaceB.y + CELL_SIZE * 2,
        CELL_SIZE * 2,
        CELL_SIZE * 2,
        6,
      );
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

  private readonly shutdown = (): void => {
    this.pan.cancel();
    this.clearFloorTiles();
    this.clearExteriorTiles();
    for (const zone of this.objectZones) zone.destroy();
    for (const graphics of this.objectGraphics) graphics.destroy();
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

function floorCellKeys(floorAreas: readonly WorldRectangle[]): Set<string> {
  const cells = new Set<string>();
  for (const area of floorAreas) {
    for (
      let y = area.y / CELL_SIZE;
      y < (area.y + area.height) / CELL_SIZE;
      y += 1
    ) {
      for (
        let x = area.x / CELL_SIZE;
        x < (area.x + area.width) / CELL_SIZE;
        x += 1
      ) {
        cells.add(cellKey(x, y));
      }
    }
  }
  return cells;
}

function cellKey(x: number, y: number): string {
  return `${x}:${y}`;
}

function parseCellKey(key: string): { readonly x: number; readonly y: number } {
  const [x, y] = key.split(":");
  return { x: Number(x), y: Number(y) };
}
