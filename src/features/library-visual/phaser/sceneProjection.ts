import type {
  LibraryProgressSummary,
  LibraryViewModel,
  ShelfOccupancy,
} from "../contracts";
import { DECORATION_ID } from "../../../domain";

export interface LibrarySceneRenderState {
  readonly completedBooks: number;
  readonly hasCompletedBook: boolean;
  readonly hasFirstCompletionMilestone: boolean;
  readonly hasReadingLamp: boolean;
  readonly highlightedBookLabel: string | null;
  readonly highlightedBookProgressLabel: string | null;
  readonly highlightedBookStatusLabel: string | null;
  readonly inProgressBooks: number;
  readonly shelfOccupancy: ShelfOccupancy;
  readonly shelfVisualGroupCount: number;
  readonly totalBooks: number;
}

export function truncateSceneLabel(value: string, maximumLength = 28): string {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(0, maximumLength - 1))}…`;
}

export function librarySceneRenderState(
  viewModel: LibraryViewModel,
): LibrarySceneRenderState {
  return {
    completedBooks: viewModel.completedBooks,
    hasCompletedBook: viewModel.hasCompletedBook,
    hasFirstCompletionMilestone: viewModel.hasFirstCompletionMilestone,
    hasReadingLamp: viewModel.unlockedDecorationIds.includes(
      DECORATION_ID.readingLamp,
    ),
    highlightedBookLabel: viewModel.highlightedBook ? "Livro recente" : null,
    highlightedBookProgressLabel: viewModel.highlightedBook
      ? sceneProgressLabel(viewModel.highlightedBook.progress)
      : null,
    highlightedBookStatusLabel: viewModel.highlightedBook
      ? sceneStatusLabel(viewModel.highlightedBook.status)
      : null,
    inProgressBooks: viewModel.inProgressBooks,
    shelfOccupancy: viewModel.shelfOccupancy,
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
