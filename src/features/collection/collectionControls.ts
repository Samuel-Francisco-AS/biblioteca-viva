import { ENTRY_STATUSES, type BookEntry, type EntryStatus } from "../../domain";

export const COLLECTION_SORTS = ["recent", "title", "progress"] as const;
export type CollectionSort = (typeof COLLECTION_SORTS)[number];
export type StatusFilter = EntryStatus | "all";

const collator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  usage: "sort",
});

export function normalizeSearch(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
}

export function parseStatusFilter(value: string | null): StatusFilter {
  if (value !== null) {
    for (const status of ENTRY_STATUSES) {
      if (value === status) return status;
    }
  }
  return "all";
}

export function parseCollectionSort(value: string | null): CollectionSort {
  if (value !== null) {
    for (const sort of COLLECTION_SORTS) {
      if (value === sort) return sort;
    }
  }
  return "recent";
}

function compareTitle(left: BookEntry, right: BookEntry): number {
  return (
    collator.compare(left.title, right.title) || left.id.localeCompare(right.id)
  );
}

function knownProgress(book: BookEntry): number | undefined {
  if (book.totalPages === undefined || book.totalPages <= 0) return undefined;
  return Math.min(1, Math.max(0, book.currentPage / book.totalPages));
}

export function deriveCollection(
  books: readonly BookEntry[],
  query: string,
  status: StatusFilter,
  sort: CollectionSort,
): readonly BookEntry[] {
  const normalizedQuery = normalizeSearch(query);
  const result = books.filter((book) => {
    const matchesStatus = status === "all" || book.status === status;
    const searchable = normalizeSearch(`${book.title} ${book.author ?? ""}`);
    return matchesStatus && searchable.includes(normalizedQuery);
  });

  return [...result].sort((left, right) => {
    if (sort === "title") return compareTitle(left, right);
    if (sort === "recent") {
      return (
        right.updatedAt.localeCompare(left.updatedAt) ||
        compareTitle(left, right)
      );
    }
    const leftProgress = knownProgress(left);
    const rightProgress = knownProgress(right);
    if (leftProgress !== undefined && rightProgress !== undefined) {
      return rightProgress - leftProgress || compareTitle(left, right);
    }
    if (leftProgress !== undefined) return -1;
    if (rightProgress !== undefined) return 1;
    return right.currentPage - left.currentPage || compareTitle(left, right);
  });
}
