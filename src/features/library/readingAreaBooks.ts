import type { BookEntry } from "../../domain";

/** A semantic visual type, distinct from the domain entry type `book`. */
export type ReadingAreaBookModelTypeId = "book-volume";

/** Presentation metadata available without creating a spatial representation. */
export interface ReadingAreaBookReadingProgress {
  readonly currentPage: number;
  readonly totalPages?: number;
}

/**
 * A future occurrence of one conventional book in the reading area.
 *
 * This is intentionally a neutral projection: it does not describe a shelf,
 * a spatial slot, or a rendering implementation.
 */
export interface ReadingAreaBook {
  readonly author?: string;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: ReadingAreaBookModelTypeId;
  readonly readingProgress: ReadingAreaBookReadingProgress;
  readonly title: string;
}

function compareBooks(left: BookEntry, right: BookEntry): number {
  return (
    left.createdAt.localeCompare(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

function validateDistinctEntryIds(entries: readonly BookEntry[]): void {
  const entryIds = new Set<string>();
  for (const entry of entries) {
    if (entryIds.has(entry.id)) {
      throw new Error(
        `A projeção da área de leitura contém entryId duplicado: ${entry.id}.`,
      );
    }
    entryIds.add(entry.id);
  }
}

/**
 * Projects conventional books into deterministic, renderer-independent reading
 * area occurrences. The projection owns its chronological `createdAt`, then
 * `id`, ordering because `ListBookEntries` preserves repository order without
 * making that order part of its application contract.
 */
export function projectReadingAreaBooks(
  entries: readonly BookEntry[],
): readonly ReadingAreaBook[] {
  validateDistinctEntryIds(entries);

  return Object.freeze(
    [...entries].sort(compareBooks).map((entry) =>
      Object.freeze({
        ...(entry.author !== undefined && { author: entry.author }),
        entryId: entry.id,
        instanceId: `reading-book:${entry.id}`,
        modelTypeId: "book-volume" as const,
        readingProgress: Object.freeze({
          currentPage: entry.currentPage,
          ...(entry.totalPages !== undefined && {
            totalPages: entry.totalPages,
          }),
        }),
        title: entry.title,
      }),
    ),
  );
}
