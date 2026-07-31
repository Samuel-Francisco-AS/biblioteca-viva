import { describe, expect, it } from "vitest";

import type { LibraryViewModel } from "../contracts";
import { librarySceneRenderState, truncateSceneLabel } from "./sceneProjection";

const viewModel: LibraryViewModel = {
  completedBooks: 1,
  hasFirstCompletionMilestone: true,
  highlightedBook: {
    entryId: "book-1",
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

describe("projeção renderizável da cena", () => {
  it("mantém a quantidade visual limitada, inclusive para cem livros", () => {
    expect(librarySceneRenderState(viewModel)).toMatchObject({
      completedBooks: 1,
      hasFirstCompletionMilestone: true,
      inProgressBooks: 2,
      shelfVisualGroupCount: 8,
      totalBooks: 100,
    });
  });

  it("trunca o destaque e remove o estado de destaque ausente", () => {
    expect(truncateSceneLabel(viewModel.highlightedBook?.title ?? "")).toMatch(
      /…$/u,
    );
    expect(
      librarySceneRenderState({ ...viewModel, highlightedBook: null }),
    ).toMatchObject({
      highlightedBookLabel: null,
      highlightedBookProgressLabel: null,
      highlightedBookStatusLabel: null,
    });
  });
});
