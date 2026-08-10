import { describe, expect, it } from "vitest";

import type { LibraryViewModel } from "../contracts";
import { LIBRARY_ROOM_INTERACTION } from "./roomConfig";
import type { SceneCircle, SceneRectangle } from "./sceneLayout";
import {
  COMPACT_LIBRARY_SCENE_MAX_WIDTH,
  librarySceneLayout,
  librarySceneLayoutMode,
  sceneRectangleContains,
  sceneRectanglesOverlap,
} from "./sceneLayout";
import { librarySceneRenderState } from "./sceneProjection";

const viewModel: LibraryViewModel = {
  completedBooks: 1,
  decorationUnlockAnimation: null,
  hasCompletedBook: true,
  hasFirstCompletionMilestone: true,
  highlightedBook: {
    entryId: "recent-book",
    progress: { currentPage: 3, kind: "bounded", totalPages: 10 },
    status: "in_progress",
    title: "Um título deliberadamente muito longo para a área visual",
  },
  inProgressBooks: 2,
  roomState: "default",
  shelfOccupancy: "full",
  shelfVisualGroupCount: 8,
  totalBooks: 100,
  unlockedDecorationIds: ["decoration.reading-lamp"],
};

describe("layout responsivo da cena", () => {
  it("escolhe regular, compacto e a fronteira centralizada de 520", () => {
    expect(librarySceneLayoutMode(640)).toBe("regular");
    expect(librarySceneLayoutMode(320)).toBe("compact");
    expect(librarySceneLayoutMode(COMPACT_LIBRARY_SCENE_MAX_WIDTH)).toBe(
      "compact",
    );
    expect(librarySceneLayoutMode(COMPACT_LIBRARY_SCENE_MAX_WIDTH + 1)).toBe(
      "regular",
    );
  });

  it.each([
    [320, 180],
    [360, 203],
    [520, 293],
    [800, 450],
  ])("representa a sala dentro de %i × %i", (width, height) => {
    const layout = librarySceneLayout({ height, width });
    const canvas = { height, width, x: 0, y: 0 };
    [
      layout.shelf,
      layout.counter,
      layout.highlightedBook,
      layout.shelfHitArea,
      layout.librarianHitArea,
      layout.creatureHitArea,
      layout.highlightedBookHitArea,
      layout.creatureMovementBounds,
    ].forEach((area) =>
      expect(sceneRectangleContains(canvas, area)).toBe(true),
    );
  });

  it.each([
    [320, 180],
    [360, 203],
    [800, 450],
  ])(
    "mantém móveis, personagens e alvos separados em %i px",
    (width, height) => {
      const layout = librarySceneLayout({ height, width });
      expect(sceneRectanglesOverlap(layout.shelf, layout.counter)).toBe(false);
      expect(
        sceneRectanglesOverlap(
          circleBounds(layout.librarian),
          circleBounds(layout.creature),
        ),
      ).toBe(false);
      expect(
        sceneRectanglesOverlap(layout.shelfHitArea, layout.librarianHitArea),
      ).toBe(false);
      expect(
        sceneRectanglesOverlap(layout.shelfHitArea, layout.creatureHitArea),
      ).toBe(false);
      expect(
        sceneRectanglesOverlap(layout.librarianHitArea, layout.creatureHitArea),
      ).toBe(false);
    },
  );

  it("oferece alvos mínimos e movimento da criatura explicitamente delimitado", () => {
    const layout = librarySceneLayout({ height: 180, width: 320 });
    [
      layout.shelfHitArea,
      layout.librarianHitArea,
      layout.creatureHitArea,
    ].forEach((area) => {
      expect(area.width).toBeGreaterThanOrEqual(
        LIBRARY_ROOM_INTERACTION.minimumTargetSize,
      );
      expect(area.height).toBeGreaterThanOrEqual(
        LIBRARY_ROOM_INTERACTION.minimumTargetSize,
      );
    });
    expect(layout.creature.x).toBeGreaterThanOrEqual(
      layout.creatureMovementBounds.x,
    );
    expect(layout.creature.x).toBeLessThanOrEqual(
      layout.creatureMovementBounds.x + layout.creatureMovementBounds.width,
    );
    expect(layout.creature.y).toBeGreaterThanOrEqual(
      layout.creatureMovementBounds.y,
    );
    expect(layout.creature.y).toBeLessThanOrEqual(
      layout.creatureMovementBounds.y + layout.creatureMovementBounds.height,
    );
  });

  it("mantém destaque fora dos contadores textuais e luz sem área interativa", () => {
    const layout = librarySceneLayout({ height: 450, width: 800 });
    const headerArea = { height: layout.wallHeight, width: 800, x: 0, y: 0 };
    expect(sceneRectanglesOverlap(headerArea, layout.highlightedBook)).toBe(
      false,
    );
    expect(layout.lightAreas.length).toBeGreaterThan(0);
    expect("lightHitArea" in layout).toBe(false);
  });

  it("limita título recente no compacto e preserva estado visual determinístico", () => {
    const layout = librarySceneLayout({ height: 180, width: 320 });
    const first = librarySceneRenderState(
      viewModel,
      layout.highlightedBookMaximumLength,
    );
    const second = librarySceneRenderState(
      viewModel,
      layout.highlightedBookMaximumLength,
    );
    expect(first.highlightedBookLabel).toHaveLength(
      layout.highlightedBookMaximumLength,
    );
    expect(second).toEqual(first);
  });

  it("troca regular ↔ compacto sem alterar a função ou manter coordenadas antigas", () => {
    const regular = librarySceneLayout({ height: 450, width: 800 });
    const compact = librarySceneLayout({ height: 180, width: 320 });
    const regularAgain = librarySceneLayout({ height: 450, width: 800 });
    expect(regular.mode).toBe("regular");
    expect(compact.mode).toBe("compact");
    expect(regularAgain).toEqual(regular);
    expect(compact.shelfHitArea).not.toEqual(regular.shelfHitArea);
    expect(compact.creatureMovementBounds).not.toEqual(
      regular.creatureMovementBounds,
    );
  });
});

function circleBounds(circle: SceneCircle): SceneRectangle {
  return {
    height: circle.radius * 2,
    width: circle.radius * 2,
    x: circle.x - circle.radius,
    y: circle.y - circle.radius,
  };
}
