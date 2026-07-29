import type { EntryStatus } from "../domain";

interface ActivityMetadata {
  readonly id: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly revision: number;
}

export interface BookCreatedActivity extends ActivityMetadata {
  readonly type: "book_created";
  readonly metadata: { readonly status: EntryStatus };
}

export interface BookUpdatedActivity extends ActivityMetadata {
  readonly type: "book_updated";
  readonly metadata: { readonly changedFields: readonly string[] };
}

export interface ProgressUpdatedActivity extends ActivityMetadata {
  readonly type: "progress_updated";
  readonly metadata: {
    readonly currentPage: number;
    readonly totalPages?: number;
  };
}

export interface StatusChangedActivity extends ActivityMetadata {
  readonly type: "status_changed";
  readonly metadata: {
    readonly from: EntryStatus;
    readonly to: EntryStatus;
  };
}

export interface NoteAddedActivity extends ActivityMetadata {
  readonly type: "note_added";
  readonly metadata: { readonly noteId: string };
}

export interface QuoteAddedActivity extends ActivityMetadata {
  readonly type: "quote_added";
  readonly metadata: { readonly quoteId: string; readonly page?: number };
}

export type Activity =
  | BookCreatedActivity
  | BookUpdatedActivity
  | ProgressUpdatedActivity
  | StatusChangedActivity
  | NoteAddedActivity
  | QuoteAddedActivity;

export function createActivity<T extends Activity>(activity: T): T {
  Object.freeze(activity.metadata);
  return Object.freeze(activity);
}
