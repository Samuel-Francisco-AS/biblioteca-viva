import { describe, expect, it } from "vitest";

import type {
  SceneCircle,
  SceneRectangle,
  SceneTextPlacement,
} from "./sceneLayout";
import {
  COMPACT_LIBRARY_SCENE_MAX_WIDTH,
  librarySceneLayout,
  librarySceneLayoutMode,
  sceneRectanglesOverlap,
} from "./sceneLayout";
import { librarySceneRenderState } from "./sceneProjection";
import type { LibraryViewModel } from "../contracts";

const viewModel: LibraryViewModel = {
  completedBooks: 1,
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
};

describe("layout responsivo da cena", () => {
  it("escolhe o layout regular para largura regular", () => {
    expect(librarySceneLayoutMode(640)).toBe("regular");
  });

  it("escolhe o layout compacto para largura estreita", () => {
    expect(librarySceneLayoutMode(320)).toBe("compact");
  });

  it("mantém a fronteira centralizada entre os dois modos", () => {
    expect(librarySceneLayoutMode(COMPACT_LIBRARY_SCENE_MAX_WIDTH)).toBe(
      "compact",
    );
    expect(librarySceneLayoutMode(COMPACT_LIBRARY_SCENE_MAX_WIDTH + 1)).toBe(
      "regular",
    );
  });

  it("separa as áreas principais no layout compacto", () => {
    const layout = librarySceneLayout({ height: 192, width: 288 });
    const areas = [
      { height: 60, width: 288, x: 0, y: 0 },
      layout.shelf,
      textBounds(layout.highlightedBook),
      circleBounds(layout.librarian),
      circleBounds(layout.creature),
      layout.counter,
    ];

    for (const [index, area] of areas.entries()) {
      for (const otherArea of areas.slice(index + 1)) {
        expect(sceneRectanglesOverlap(area, otherArea)).toBe(false);
      }
    }

    const labels = [
      layout.header.title,
      layout.header.totalAndInProgress,
      layout.header.completed,
      layout.shelfLabel,
      layout.highlightedBook,
    ].map(textBounds);
    for (const [index, label] of labels.entries()) {
      for (const otherLabel of labels.slice(index + 1)) {
        expect(sceneRectanglesOverlap(label, otherLabel)).toBe(false);
      }
    }
  });

  it("limita o texto recente e preserva os contadores no modo compacto", () => {
    const layout = librarySceneLayout({ height: 192, width: 288 });
    const state = librarySceneRenderState(
      viewModel,
      layout.highlightedBookMaximumLength,
    );

    expect(state.highlightedBookLabel).toHaveLength(
      layout.highlightedBookMaximumLength,
    );
    expect(state).toMatchObject({
      completedBooks: 1,
      inProgressBooks: 2,
      totalBooks: 100,
    });
  });

  it("mantém uma estante tocável e um marcador de conclusão", () => {
    const layout = librarySceneLayout({ height: 192, width: 288 });
    const state = librarySceneRenderState(viewModel);

    expect(layout.shelf.width).toBeGreaterThan(240);
    expect(layout.shelf.height).toBeGreaterThanOrEqual(52);
    expect(state.hasFirstCompletionMilestone).toBe(true);
    expect(
      layout.milestoneMarker.width * layout.milestoneMarker.height,
    ).toBeGreaterThan(0);
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

function textBounds(placement: SceneTextPlacement): SceneRectangle {
  return {
    height: placement.fontSize * 1.4,
    width: placement.maxWidth,
    x: placement.x,
    y: placement.y,
  };
}
