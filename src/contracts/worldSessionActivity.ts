/**
 * BF-5.5F: minimal, immutable facts that the world may receive after a session
 * is persisted. Do not include entry titles, notes, exercises or private text.
 * The renderer never queries repositories or treats gestures as confirmation.
 */
export const WORLD_SESSION_ENTRY_TYPES = [
  "book",
  "movie",
  "series",
  "study",
  "physical_activity",
  "work",
] as const;

export type WorldSessionEntryType =
  (typeof WORLD_SESSION_ENTRY_TYPES)[number];

export const WORLD_SESSION_KINDS = [
  "reading",
  "viewing",
  "study",
  "physical_activity",
  "work",
] as const;

export type WorldSessionKind = (typeof WORLD_SESSION_KINDS)[number];

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
