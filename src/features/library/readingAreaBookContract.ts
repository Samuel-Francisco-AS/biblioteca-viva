/** A semantic visual type, distinct from the domain entry type `book`. */
export type ReadingAreaBookModelTypeId = "book-volume";

/** Presentation metadata available without creating a spatial representation. */
export interface ReadingAreaBookReadingProgress {
  readonly currentPage: number;
  readonly totalPages?: number;
}

/**
 * A renderer-neutral occurrence of one conventional book in the reading area.
 *
 * It deliberately contains no shelf, slot, renderer, or domain dependency.
 */
export interface ReadingAreaBook {
  readonly author?: string;
  readonly entryId: string;
  readonly instanceId: string;
  readonly modelTypeId: ReadingAreaBookModelTypeId;
  readonly readingProgress: ReadingAreaBookReadingProgress;
  readonly title: string;
}
