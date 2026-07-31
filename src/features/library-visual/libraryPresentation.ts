import type {
  LibraryProgressSummary,
  LibraryViewModel,
  ShelfOccupancy,
} from "./contracts";

const shelfDescriptions: Readonly<Record<ShelfOccupancy, string>> = {
  empty: "A estante está vazia.",
  full: "A estante está cheia de livros organizados.",
  growing: "A coleção está crescendo na estante.",
  initial: "Os primeiros livros já estão organizados na estante.",
};

export function shelfDescription(occupancy: ShelfOccupancy): string {
  return shelfDescriptions[occupancy];
}

export function progressDescription(
  progress: LibraryProgressSummary,
): string | null {
  if (progress.kind === "none") return null;
  if (progress.kind === "open") return `${progress.currentPage} páginas lidas`;
  return `${progress.currentPage} de ${progress.totalPages} páginas`;
}

export function libraryPanelSummary(viewModel: LibraryViewModel) {
  return {
    milestone: viewModel.hasFirstCompletionMilestone
      ? "Já há ao menos uma leitura concluída."
      : "Ainda não há leituras concluídas.",
    shelf: shelfDescription(viewModel.shelfOccupancy),
  };
}
