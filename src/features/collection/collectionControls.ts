import {
  ENTRY_STATUSES,
  ENTRY_TYPES,
  type EntryStatus,
  type EntryType,
  type LibraryEntry,
} from "../../domain";

export const COLLECTION_SORTS = ["recent", "created", "title"] as const;
export type CollectionSort = (typeof COLLECTION_SORTS)[number];
export type StatusFilter = EntryStatus | "all";
export type TypeFilter = EntryType | "all";

export const entryTypeLabels: Readonly<Record<EntryType, string>> = {
  book: "Livro",
  movie: "Filme",
  series: "Série",
  study: "Estudo",
  physical_activity: "Atividade física",
  work: "Trabalho",
};

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
  return ENTRY_STATUSES.find((status) => status === value) ?? "all";
}

export function parseTypeFilter(value: string | null): TypeFilter {
  return ENTRY_TYPES.find((type) => type === value) ?? "all";
}

export function parseCollectionSort(value: string | null): CollectionSort {
  return COLLECTION_SORTS.find((sort) => sort === value) ?? "recent";
}

function compareTitle(left: LibraryEntry, right: LibraryEntry): number {
  return (
    collator.compare(left.title, right.title) || left.id.localeCompare(right.id)
  );
}

function searchableFields(entry: LibraryEntry): string {
  switch (entry.type) {
    case "book":
      return `${entry.title} ${entry.author ?? ""}`;
    case "movie":
      return `${entry.title} ${entry.director ?? ""} ${entry.platform ?? ""}`;
    case "series":
      return `${entry.title} ${entry.platform ?? ""}`;
    case "study":
      return `${entry.title} ${entry.area ?? ""} ${entry.discipline ?? ""}`;
    case "physical_activity":
      return `${entry.title} ${entry.category} ${entry.modality ?? ""}`;
    case "work":
      return `${entry.title} ${entry.area ?? ""} ${entry.organization ?? ""}`;
  }
}

export function deriveCollection(
  entries: readonly LibraryEntry[],
  query: string,
  status: StatusFilter,
  sort: CollectionSort,
  type: TypeFilter = "all",
  favoritesOnly = false,
): readonly LibraryEntry[] {
  const normalizedQuery = normalizeSearch(query);
  const result = entries.filter(
    (entry) =>
      (status === "all" || entry.status === status) &&
      (type === "all" || entry.type === type) &&
      (!favoritesOnly || entry.favorite) &&
      normalizeSearch(searchableFields(entry)).includes(normalizedQuery),
  );
  return [...result].sort((left, right) => {
    if (sort === "title") return compareTitle(left, right);
    const field = sort === "created" ? "createdAt" : "updatedAt";
    return right[field].localeCompare(left[field]) || compareTitle(left, right);
  });
}
