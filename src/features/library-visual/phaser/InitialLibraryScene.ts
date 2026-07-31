import Phaser from "phaser";

import type { LibraryInteraction, LibraryViewModel } from "../contracts";
import { librarySceneLayout, type SceneTextPlacement } from "./sceneLayout";
import { librarySceneRenderState } from "./sceneProjection";

const COLORS = {
  completed: 0xd6b74c,
  counter: 0x9a6741,
  creature: 0x799b66,
  floor: 0xd8c5a3,
  inProgress: 0x466f99,
  librarian: 0x80649c,
  shelf: 0x67452f,
  spine: 0xc69b67,
  wall: 0x4c6378,
};

export class InitialLibraryScene extends Phaser.Scene {
  private graphics?: Phaser.GameObjects.Graphics;
  private interactionHandler?: (interaction: LibraryInteraction) => void;
  private labels?: Phaser.GameObjects.Container;
  private projection: LibraryViewModel;
  private shelfZone?: Phaser.GameObjects.Zone;

  constructor(
    projection: LibraryViewModel,
    interactionHandler?: (interaction: LibraryInteraction) => void,
  ) {
    super("initial-library");
    this.projection = projection;
    this.interactionHandler = interactionHandler;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.shelfZone = this.add.zone(0, 0, 1, 1).setOrigin(0).setInteractive({
      useHandCursor: true,
    });
    this.shelfZone.on("pointerup", this.selectShelf, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.draw, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.draw, this);
      this.shelfZone?.off("pointerup", this.selectShelf, this);
      this.shelfZone?.destroy();
      this.labels?.destroy();
    });
    this.draw(this.scale.gameSize);
  }

  setInteractionHandler(
    interactionHandler: ((interaction: LibraryInteraction) => void) | undefined,
  ): void {
    this.interactionHandler = interactionHandler;
  }

  updateProjection(projection: LibraryViewModel): void {
    this.projection = projection;
    if (this.graphics) this.draw(this.scale.gameSize);
  }

  private selectShelf = (): void => {
    this.interactionHandler?.({ type: "ShelfSelected" });
  };

  private draw = (size: Phaser.Structs.Size): void => {
    const graphics = this.graphics;
    if (!graphics) return;
    const { height, width } = size;
    const layout = librarySceneLayout({ height, width });
    const state = librarySceneRenderState(
      this.projection,
      layout.highlightedBookMaximumLength,
    );

    graphics.clear();
    this.labels?.destroy();
    this.labels = this.add.container();
    graphics.fillStyle(COLORS.floor).fillRect(0, 0, width, height);
    graphics.fillStyle(COLORS.wall).fillRect(0, 0, width, layout.wallHeight);
    graphics
      .fillStyle(COLORS.shelf)
      .fillRect(
        layout.shelf.x,
        layout.shelf.y,
        layout.shelf.width,
        layout.shelf.height,
      );
    graphics.lineStyle(3, COLORS.spine);
    for (let row = 1; row < 4; row += 1) {
      graphics.lineBetween(
        layout.shelf.x,
        layout.shelf.y + (layout.shelf.height * row) / 4,
        layout.shelf.x + layout.shelf.width,
        layout.shelf.y + (layout.shelf.height * row) / 4,
      );
    }
    this.drawBookGroups(
      graphics,
      layout.shelf.x,
      layout.shelf.y,
      layout.shelf.width,
      layout.shelf.height,
      state.shelfVisualGroupCount,
    );
    this.shelfZone
      ?.setPosition(layout.shelf.x, layout.shelf.y)
      .setSize(layout.shelf.width, layout.shelf.height);
    if (this.shelfZone?.input?.hitArea instanceof Phaser.Geom.Rectangle) {
      this.shelfZone.input.hitArea.setSize(
        layout.shelf.width,
        layout.shelf.height,
      );
    }
    graphics
      .fillStyle(COLORS.counter)
      .fillRect(
        layout.counter.x,
        layout.counter.y,
        layout.counter.width,
        layout.counter.height,
      );
    graphics
      .fillStyle(COLORS.librarian)
      .fillCircle(
        layout.librarian.x,
        layout.librarian.y,
        layout.librarian.radius,
      );
    graphics
      .fillStyle(COLORS.creature)
      .fillCircle(layout.creature.x, layout.creature.y, layout.creature.radius);

    if (state.hasFirstCompletionMilestone) {
      graphics
        .fillStyle(COLORS.completed)
        .fillRect(
          layout.milestoneMarker.x,
          layout.milestoneMarker.y,
          layout.milestoneMarker.width,
          layout.milestoneMarker.height,
        );
    }

    this.addLabel(layout.header.title, "Biblioteca", "#ffffff");
    this.addLabel(
      layout.header.totalAndInProgress,
      `Total: ${state.totalBooks} · Lendo: ${state.inProgressBooks}`,
      "#ffffff",
    );
    this.addLabel(
      layout.header.completed,
      `Concluídos: ${state.completedBooks}`,
      "#ffffff",
    );
    this.addLabel(
      layout.shelfLabel,
      layout.mode === "compact"
        ? "Estante (toque)"
        : "Estante — toque para ver resumo",
    );
    this.addOptionalLabel(layout.compactCounterLabel, "Balcão");
    this.addOptionalLabel(layout.librarianLabel, "Bibliotecária");
    this.addOptionalLabel(layout.creatureLabel, "Criatura");
    if (state.highlightedBookLabel) {
      this.addLabel(
        layout.highlightedBook,
        `${layout.mode === "compact" ? "Recente" : "Atualizado"}: ${state.highlightedBookLabel}`,
      );
      const highlightedBookDetail = [
        state.highlightedBookStatusLabel,
        state.highlightedBookProgressLabel,
      ]
        .filter((part): part is string => part !== null)
        .join(" · ");
      if (highlightedBookDetail && layout.highlightedBookDetail) {
        this.addLabel(layout.highlightedBookDetail, highlightedBookDetail);
      }
    }
  };

  private addLabel(
    placement: SceneTextPlacement,
    text: string,
    color = "#28343d",
  ): void {
    const label = this.add.text(placement.x, placement.y, text, {
      color,
      fontFamily: "system-ui, sans-serif",
      fontSize: placement.fontSize,
    });
    label.setCrop(0, 0, placement.maxWidth, placement.fontSize * 1.4);
    this.labels?.add(label);
  }

  private addOptionalLabel(
    placement: SceneTextPlacement | null,
    text: string,
  ): void {
    if (placement) this.addLabel(placement, text);
  }

  private drawBookGroups(
    graphics: Phaser.GameObjects.Graphics,
    shelfLeft: number,
    shelfTop: number,
    shelfWidth: number,
    shelfHeight: number,
    groupCount: number,
  ): void {
    const maxGroups = Math.max(1, groupCount);
    const spineWidth = Math.max(8, Math.round(shelfWidth / 18));
    const availableWidth = shelfWidth - spineWidth * groupCount;
    for (let index = 0; index < groupCount; index += 1) {
      const row = index % 3;
      const x =
        shelfLeft + 8 + index * (spineWidth + availableWidth / maxGroups);
      const y = shelfTop + shelfHeight * (0.13 + row * 0.27);
      const color =
        index === 0 && this.projection.inProgressBooks > 0
          ? COLORS.inProgress
          : index === 1 && this.projection.completedBooks > 0
            ? COLORS.completed
            : COLORS.spine;
      graphics.fillStyle(color).fillRect(x, y, spineWidth, shelfHeight * 0.18);
    }
  }
}
