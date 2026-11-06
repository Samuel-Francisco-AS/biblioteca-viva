import type { LibraryEntry, Session } from "../domain";
import type {
  WorldSessionActivity,
  WorldSessionEntryType,
  WorldSessionKind,
} from "../contracts/worldSessionActivity";

const TARGETS: Readonly<
  Record<
    WorldSessionEntryType,
    { readonly prefix: string; readonly kind: WorldSessionKind }
  >
> = Object.freeze({
  book: { prefix: "reading-book:", kind: "reading" },
  movie: { prefix: "library-movie:", kind: "viewing" },
  series: { prefix: "library-series:", kind: "viewing" },
  study: { prefix: "library-study:", kind: "study" },
  physical_activity: {
    prefix: "library-physical-activity:",
    kind: "physical_activity",
  },
  work: { prefix: "library-work:", kind: "work" },
});

/**
 * Deterministic projection of a CONFIRMED open session, never a pointer event
 * or optimistic form state. A missing/deleted or mismatched entry cannot create
 * a phantom world object. No private session or entry text crosses the boundary.
 *
 * Callers must reconcile from getOpenSession + the current entry snapshot
 * after SessionChanged, on first mount and on returning to the Library.
 */
export function projectWorldSessionActivity(
  session: Session | undefined,
  entries: readonly LibraryEntry[],
): WorldSessionActivity | null {
  if (!session || session.status === "completed") return null;
  const entry = entries.find((candidate) => candidate.id === session.entryId);
  if (!entry || entry.type !== session.entryType) return null;
  const target = TARGETS[session.entryType];
  if (session.kind !== target.kind) return null;
  return Object.freeze({
    sessionId: session.id,
    entryId: entry.id,
    entryType: session.entryType,
    instanceId: `${target.prefix}${entry.id}`,
    kind: session.kind,
    status: session.status,
    revision: session.revision,
  });
}
