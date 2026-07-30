import type { BookEntry, EntryStatus } from "../../domain";

export const statusLabels: Readonly<Record<EntryStatus, string>> = {
  abandoned: "Abandonado",
  completed: "Concluído",
  in_progress: "Em andamento",
  paused: "Pausado",
  planned: "Planejado",
};

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(value),
  );
}

export function progressPercentage(book: BookEntry): number | undefined {
  if (book.totalPages === undefined) return undefined;
  return Math.min(
    100,
    Math.max(0, Math.round((book.currentPage / book.totalPages) * 100)),
  );
}

export function progressText(book: BookEntry): string {
  const percentage = progressPercentage(book);
  if (book.totalPages === undefined || percentage === undefined) {
    return `${book.currentPage} ${book.currentPage === 1 ? "página lida" : "páginas lidas"}; total não informado`;
  }
  return `${book.currentPage} de ${book.totalPages} páginas (${percentage}%)`;
}
