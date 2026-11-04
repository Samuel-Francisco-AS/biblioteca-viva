import {
  entertainmentFormat,
  isEntertainment,
  isWishlisted,
  releaseDays,
  formatLabels,
} from "../../domain/entertainment";
import type { LibraryEntry } from "../../domain";
export const VISIBLE_GROUPS = [
  "book",
  "entertainment",
  "study",
  "physical_activity",
  "work",
] as const;
export const groupLabels = {
  book: "Livro",
  entertainment: "Entretenimento",
  study: "Estudo",
  physical_activity: "Atividade física",
  work: "Trabalho",
} as const;
export const CATALOG_FILTERS = [
  "all",
  "film",
  "series",
  "anime",
  "animation",
  "wishlist",
  "releases",
  "favorites",
  "watching",
  "completed",
] as const;
export const catalogFilterLabels = {
  all: "Todos",
  ...formatLabels,
  wishlist: "Desejos",
  releases: "Lançamentos",
  favorites: "Favoritos",
  watching: "Em andamento",
  completed: "Concluídos",
} as const;
export function matchesGroup(
  entry: LibraryEntry | undefined,
  group: string,
): boolean {
  return (
    group === "all" ||
    (group === "entertainment"
      ? Boolean(entry && isEntertainment(entry))
      : entry?.type === group)
  );
}
export function matchesCatalog(
  entry: LibraryEntry,
  filter: string,
  today?: string,
) {
  if (filter === "all") return true;
  if (!isEntertainment(entry)) return false;
  if (filter === "wishlist") return isWishlisted(entry);
  if (filter === "favorites") return entry.favorite;
  if (filter === "releases")
    return (releaseDays(entry.catalog?.releaseDate, today) ?? -1) > 0;
  if (filter === "watching") return entry.status === "in_progress";
  if (filter === "completed") return entry.status === "completed";
  return entertainmentFormat(entry) === filter;
}
