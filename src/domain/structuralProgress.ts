import type { LibraryEntry, Session } from "./types";

export const STRUCTURAL_INVENTORY_FAMILY_ID = Object.freeze({
  cornerStone: "structure-family.corner.stone",
  doorHorizontal: "structure-family.door.horizontal",
  floorWood: "structure-family.floor.wood",
  wallLong: "structure-family.wall.long",
  wallMedium: "structure-family.wall.medium",
  wallShort: "structure-family.wall.short",
} as const);

export const STRUCTURAL_INVENTORY_FAMILY_IDS = Object.freeze(
  Object.values(STRUCTURAL_INVENTORY_FAMILY_ID),
);

export type StructuralInventoryFamilyId =
  (typeof STRUCTURAL_INVENTORY_FAMILY_IDS)[number];

export interface StructuralProgressFacts {
  readonly eligibleCompletedSessionCount: number;
}

/** A session contributes only after the real session model has completed it. */
export function isStructuralProgressSessionEligible(
  session: Session,
  entries: readonly Pick<LibraryEntry, "id" | "type">[],
): boolean {
  if (
    session.status !== "completed" ||
    session.accumulatedDuration <= 0 ||
    session.id.trim() === ""
  )
    return false;
  return entries.some(
    (entry) => entry.id === session.entryId && entry.type === session.entryType,
  );
}

/**
 * A current, reversible projection of sessions. Reached milestones remain
 * persistent elsewhere and are intentionally not inferred by this count.
 */
export function deriveStructuralProgressFacts(
  sessions: readonly Session[],
  entries: readonly Pick<LibraryEntry, "id" | "type">[],
): StructuralProgressFacts {
  const seen = new Set<string>();
  let eligibleCompletedSessionCount = 0;
  for (const session of sessions) {
    if (seen.has(session.id)) continue;
    seen.add(session.id);
    if (isStructuralProgressSessionEligible(session, entries))
      eligibleCompletedSessionCount += 1;
  }
  return Object.freeze({ eligibleCompletedSessionCount });
}

export function isStructuralInventoryFamilyId(
  value: string,
): value is StructuralInventoryFamilyId {
  return (STRUCTURAL_INVENTORY_FAMILY_IDS as readonly string[]).includes(value);
}
