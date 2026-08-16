import { describe, expect, it } from "vitest";

import type { LibraryViewModel } from "../contracts";
import { librarySceneRenderState } from "./sceneProjection";

const viewModel: LibraryViewModel = {
  completedBooks: 1,
  decorationUnlockAnimation: null,
  hasCompletedBook: true,
  hasFirstCompletionMilestone: true,
  highlightedBook: {
    entryId: "book-1",
    progress: { currentPage: 3, kind: "bounded", totalPages: 10 },
    status: "in_progress",
  },
  inProgressBooks: 2,
  roomState: "default",
  shelfOccupancy: "full",
  shelfVisualGroupCount: 8,
  totalBooks: 100,
  unlockedDecorationIds: ["decoration.reading-lamp"],
};

describe("projeção renderizável da cena", () => {
  it.each([
    ["empty", 0],
    ["initial", 2],
    ["growing", 5],
    ["full", 8],
  ] as const)("preserva a escolha visual %s", (shelfOccupancy, groups) => {
    expect(
      librarySceneRenderState({
        ...viewModel,
        shelfOccupancy,
        shelfVisualGroupCount: groups,
      }),
    ).toMatchObject({ shelfOccupancy, shelfVisualGroupCount: groups });
  });

  it("mantém a quantidade visual limitada, inclusive para cem livros", () => {
    expect(librarySceneRenderState(viewModel)).toMatchObject({
      completedBooks: 1,
      hasFirstCompletionMilestone: true,
      inProgressBooks: 2,
      shelfVisualGroupCount: 8,
      totalBooks: 100,
    });
  });

  it("usa rótulo genérico e remove o estado de destaque ausente", () => {
    expect(librarySceneRenderState(viewModel).highlightedBookLabel).toBe(
      "Livro recente",
    );
    expect(
      librarySceneRenderState({ ...viewModel, highlightedBook: null }),
    ).toMatchObject({
      highlightedBookLabel: null,
      highlightedBookProgressLabel: null,
      highlightedBookStatusLabel: null,
    });
  });

  it("representa conclusão como complemento sem alterar a ocupação", () => {
    const withoutCompletion = librarySceneRenderState({
      ...viewModel,
      completedBooks: 0,
      hasCompletedBook: false,
      hasFirstCompletionMilestone: false,
    });
    const withCompletion = librarySceneRenderState(viewModel);
    expect(withoutCompletion.shelfOccupancy).toBe("full");
    expect(withCompletion.shelfOccupancy).toBe("full");
    expect(withoutCompletion.hasFirstCompletionMilestone).toBe(false);
    expect(withCompletion.hasFirstCompletionMilestone).toBe(true);
  });

  it("substitui o destaque sem manter o título anterior ou expor ID", () => {
    const next = librarySceneRenderState({
      ...viewModel,
      highlightedBook: {
        entryId: "private-id",
        progress: { kind: "none" },
        status: "planned",
      },
    });
    expect(next.highlightedBookLabel).toBe("Livro recente");
    expect(JSON.stringify(next)).not.toMatch(/private-id|title|note|quote/iu);
  });
});
