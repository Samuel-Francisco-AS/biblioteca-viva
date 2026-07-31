import type { LibraryProgressSummary, LibraryViewModel } from "../contracts";

export interface LibrarySceneRenderState {
  readonly completedBooks: number;
  readonly hasFirstCompletionMilestone: boolean;
  readonly highlightedBookLabel: string | null;
  readonly highlightedBookProgressLabel: string | null;
  readonly highlightedBookStatusLabel: string | null;
  readonly inProgressBooks: number;
  readonly shelfVisualGroupCount: number;
  readonly totalBooks: number;
}

export function truncateSceneLabel(value: string, maximumLength = 28): string {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(0, maximumLength - 1))}…`;
}

export function librarySceneRenderState(
  viewModel: LibraryViewModel,
  highlightedBookMaximumLength = 28,
): LibrarySceneRenderState {
  return {
    completedBooks: viewModel.completedBooks,
    hasFirstCompletionMilestone: viewModel.hasFirstCompletionMilestone,
    highlightedBookLabel: viewModel.highlightedBook
      ? truncateSceneLabel(
          viewModel.highlightedBook.title,
          highlightedBookMaximumLength,
        )
      : null,
    highlightedBookProgressLabel: viewModel.highlightedBook
      ? sceneProgressLabel(viewModel.highlightedBook.progress)
      : null,
    highlightedBookStatusLabel: viewModel.highlightedBook
      ? sceneStatusLabel(viewModel.highlightedBook.status)
      : null,
    inProgressBooks: viewModel.inProgressBooks,
    shelfVisualGroupCount: viewModel.shelfVisualGroupCount,
    totalBooks: viewModel.totalBooks,
  };
}

function sceneProgressLabel(progress: LibraryProgressSummary): string | null {
  if (progress.kind === "none") return null;
  if (progress.kind === "open") return `${progress.currentPage} páginas`;
  return `${progress.currentPage}/${progress.totalPages} páginas`;
}

function sceneStatusLabel(
  status: NonNullable<LibraryViewModel["highlightedBook"]>["status"],
): string {
  const labels = {
    abandoned: "Abandonado",
    completed: "Concluído",
    in_progress: "Em andamento",
    paused: "Pausado",
    planned: "Planejado",
  } as const;
  return labels[status];
}
