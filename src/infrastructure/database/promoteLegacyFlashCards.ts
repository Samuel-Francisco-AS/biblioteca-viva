import type { Transaction } from "dexie";
import {
  cardSchema,
  studyCardLinkSchema,
  type Card,
  type CardVersion,
  type StudyCardLink,
} from "../../domain/arcanarium";
import {
  persistedLibraryEntrySchema,
  type PersistedLibraryEntry,
} from "./schema";

/** Caller owns the transaction: upgrade and restore use the same promotion. Never mutate the legacy archive. */
export async function promoteLegacyFlashCards(
  transaction: Transaction,
): Promise<void> {
  const entries = await transaction
    .table<PersistedLibraryEntry>("libraryEntries")
    .toArray();
  for (const entry of entries) {
    persistedLibraryEntrySchema.parse(entry);
    if (entry.type !== "study") continue;
    for (const [position, legacy] of (entry.flashCards ?? []).entries()) {
      const key = [entry.id, legacy.id];
      const links = transaction.table<StudyCardLink>("studyCardLinks");
      // Inactive mappings are tombstones too: deletions must never resurrect archived text.
      if (await links.get(key)) continue;
      const cardId = `study-flashcard:${JSON.stringify(key)}`;
      if (await transaction.table<Card>("arcanariumCards").get(cardId))
        throw new Error("Migration identity collision");
      const card = cardSchema.parse({
        id: cardId,
        type: "flashcard",
        revision: 1,
        archived: false,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        origin: { kind: "study", studyId: entry.id, legacyCardId: legacy.id },
        content: { type: "flashcard", front: legacy.front, back: legacy.back },
      });
      await transaction.table<Card>("arcanariumCards").add(card);
      await transaction
        .table<CardVersion>("arcanariumVersions")
        .add({ cardId, revision: 1, card });
      await links.add(
        studyCardLinkSchema.parse({
          studyId: entry.id,
          legacyCardId: legacy.id,
          cardId,
          position,
          active: true,
        }),
      );
    }
  }
}
