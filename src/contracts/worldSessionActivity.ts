/**
 * BF-5.5F: minimal, immutable facts that the world may receive after a session
 * is persisted. Do not include entry titles, notes, exercises or private text.
 * The renderer never queries repositories or treats gestures as confirmation.
 */
export type WorldSessionEntryType =
  | "book"
  | "movie"
  | "series"
  | "study"
  | "physical_activity"
  | "work";

export type WorldSessionKind =
  | "reading"
  | "viewing"
  | "study"
  | "physical_activity"
  | "work";

export interface WorldSessionActivity {
  readonly sessionId: string;
  readonly entryId: string;
  readonly entryType: WorldSessionEntryType;
  /** Deterministic identity of the original conventional world occurrence. */
  readonly instanceId: string;
  readonly kind: WorldSessionKind;
  /** Only open sessions are projected; completed/deleted means null. */
  readonly status: "active" | "paused";
  readonly revision: number;
}
