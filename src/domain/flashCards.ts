import { flashCardsSchema } from "./schemas";
import type { FlashCard, StudyEntry } from "./types";
import { nextMetadata } from "./validation";

export function replaceFlashCards(
  entry: StudyEntry,
  cards: readonly FlashCard[],
  now: string,
): StudyEntry {
  const validated = flashCardsSchema.parse(cards);
  return Object.freeze({
    ...entry,
    ...nextMetadata(entry, now),
    flashCards: Object.freeze(validated.map((card) => Object.freeze(card))),
  });
}
