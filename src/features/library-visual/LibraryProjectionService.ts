import type { EntryStatus } from "../../domain";
import {
  DECORATION_ID,
  MILESTONE_ID,
  type ReachedMilestone,
} from "../../domain";
import type {
  HighlightedLibraryBook,
  LibraryProgressSummary,
  LibraryViewModel,
  ShelfOccupancy,
} from "./contracts";
import { DEFAULT_PLACED_OBJECT, type PlacedObject } from "../../application";

export interface LibraryProjectionBook {
  readonly currentPage: number;
  readonly id: string;
  readonly status: EntryStatus;
  readonly title: string;
  readonly totalPages?: number;
  readonly updatedAt: string;
}

export interface LibraryProjectionInput {
  readonly books: readonly LibraryProjectionBook[];
  readonly milestones?: readonly ReachedMilestone[];
  readonly pendingDecorationUnlock?: { readonly eventId: string };
  readonly placedObjects?: readonly PlacedObject[];
}

export const SHELF_OCCUPANCY_RANGES = {
  fullFrom: 15,
  growingFrom: 5,
  initialFrom: 1,
} as const;

export const SHELF_DIRECT_REPRESENTATION_LIMIT = 5;
export const SHELF_MAX_VISUAL_GROUPS = 8;

function shelfVisualGroupCountFor(totalBooks: number): number {
  if (totalBooks <= SHELF_DIRECT_REPRESENTATION_LIMIT) return totalBooks;
  return Math.min(
    SHELF_MAX_VISUAL_GROUPS,
    Math.ceil(totalBooks / SHELF_DIRECT_REPRESENTATION_LIMIT) +
      SHELF_DIRECT_REPRESENTATION_LIMIT -
      1,
  );
}

function shelfOccupancyFor(totalBooks: number): ShelfOccupancy {
  if (totalBooks < SHELF_OCCUPANCY_RANGES.initialFrom) return "empty";
  if (totalBooks < SHELF_OCCUPANCY_RANGES.growingFrom) return "initial";
  if (totalBooks < SHELF_OCCUPANCY_RANGES.fullFrom) return "growing";
  return "full";
}

function progressFor(book: LibraryProjectionBook): LibraryProgressSummary {
  if (book.currentPage <= 0) return { kind: "none" };
  if (book.totalPages === undefined)
    return { currentPage: book.currentPage, kind: "open" };
  return {
    currentPage: book.currentPage,
    kind: "bounded",
    totalPages: book.totalPages,
  };
}

function highlightedBookFor(
  books: readonly LibraryProjectionBook[],
): HighlightedLibraryBook | null {
  const recent = [...books].sort(
    (left, right) =>
      right.updatedAt.localeCompare(left.updatedAt) ||
      left.id.localeCompare(right.id),
  )[0];
  if (!recent) return null;
  return {
    entryId: recent.id,
    progress: progressFor(recent),
    status: recent.status,
  };
}

/**
 * Pure projection boundary between persisted reading data and the Phaser view.
 * It deliberately accepts a minimal serializable input rather than BookEntry.
 */
export class LibraryProjectionService {
  project(input: LibraryProjectionInput): LibraryViewModel {
    const totalBooks = input.books.length;
    const inProgressBooks = input.books.filter(
      (book) => book.status === "in_progress",
    ).length;
    const completedBooks = input.books.filter(
      (book) => book.status === "completed",
    ).length;
    const shelfOccupancy = shelfOccupancyFor(totalBooks);
    const milestones = input.milestones ?? Object.freeze([]);
    const unlockedDecorationIds = Object.freeze(
      milestones.some((milestone) =>
        milestone.rewards.some(
          (reward) => reward.decorationId === DECORATION_ID.readingLamp,
        ),
      )
        ? [DECORATION_ID.readingLamp]
        : [],
    );

    return {
      completedBooks,
      decorationUnlockAnimation:
        input.pendingDecorationUnlock && unlockedDecorationIds.length > 0
          ? {
              decorationId: DECORATION_ID.readingLamp,
              eventId: input.pendingDecorationUnlock.eventId,
            }
          : null,
      hasCompletedBook: completedBooks > 0,
      hasFirstCompletionMilestone: milestones.some(
        ({ id }) => id === MILESTONE_ID.firstCompletedBook,
      ),
      highlightedBook: highlightedBookFor(input.books),
      inProgressBooks,
      roomState: "default",
      shelfOccupancy,
      shelfVisualGroupCount: shelfVisualGroupCountFor(totalBooks),
      totalBooks,
      unlockedDecorationIds,
      placedObjects: Object.freeze([
        ...(input.placedObjects ?? [DEFAULT_PLACED_OBJECT]),
      ]),
    };
  }
}

export function projectLibrary(
  input: LibraryProjectionInput,
): LibraryViewModel {
  return new LibraryProjectionService().project(input);
}
