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
}

export const SHELF_OCCUPANCY_RANGES = {
  fullFrom: 15,
  growingFrom: 5,
  initialFrom: 1,
} as const;

export const SHELF_VISUAL_GROUP_COUNTS: Readonly<
  Record<ShelfOccupancy, number>
> = {
  empty: 0,
  full: 8,
  growing: 5,
  initial: 2,
};

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
    title: recent.title,
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
      shelfVisualGroupCount: SHELF_VISUAL_GROUP_COUNTS[shelfOccupancy],
      totalBooks,
      unlockedDecorationIds,
    };
  }
}

export function projectLibrary(
  input: LibraryProjectionInput,
): LibraryViewModel {
  return new LibraryProjectionService().project(input);
}
