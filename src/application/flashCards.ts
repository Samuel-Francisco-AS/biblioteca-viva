import { z } from "zod";
import {
  createLibraryEntryUpdatedEvent,
  flashCardSchema,
  replaceFlashCards,
  type StudyEntry,
} from "../domain";
import type { ApplicationDependencies } from "./ports";
import { ApplicationError } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
  saveEntity,
} from "./internal";

const id = z.string().trim().min(1);
const saveSchema = z.strictObject({
  entryId: id,
  cardId: id.optional(),
  front: flashCardSchema.shape.front,
  back: flashCardSchema.shape.back,
});
const deleteSchema = z.strictObject({ entryId: id, cardId: id });
type Dependencies = Pick<
  ApplicationDependencies,
  "clock" | "ids" | "events" | "libraryEntries" | "transaction"
>;

async function mutate(
  deps: Dependencies,
  entryId: string,
  change: (entry: StudyEntry, now: string) => StudyEntry,
) {
  const now = await currentTime(deps);
  const eventId = await generatedId(deps, "flash_card_event");
  const updated = await runTransaction(deps, async () => {
    const entry = await deps.libraryEntries.getById(entryId);
    if (!entry || entry.type !== "study")
      throw new ApplicationError("NOT_FOUND", "Estudo não encontrado.");
    const result = applyDomain(() => change(entry, now));
    await saveEntity(
      () => deps.libraryEntries.save(result),
      "save_flash_cards",
    );
    return result;
  });
  await publishEvent(
    deps,
    createLibraryEntryUpdatedEvent({
      eventId,
      aggregateId: entryId,
      occurredAt: now,
      revision: updated.revision,
      payload: { entryType: "study", changedFields: ["flashCards"] },
    }),
  );
  return updated;
}
export class SaveFlashCard {
  constructor(private readonly deps: Dependencies) {}
  async execute(input: unknown): Promise<StudyEntry> {
    const parsed = parseInput(saveSchema, input);
    const cardId =
      parsed.cardId ?? (await generatedId(this.deps, "flash_card_id"));
    return mutate(this.deps, parsed.entryId, (entry, now) => {
      const cards = [...(entry.flashCards ?? [])];
      const index = cards.findIndex((card) => card.id === cardId);
      if (parsed.cardId && index < 0)
        throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
      const card = { id: cardId, front: parsed.front, back: parsed.back };
      if (index < 0) cards.push(card);
      else cards[index] = card;
      return replaceFlashCards(entry, cards, now);
    });
  }
}
export class DeleteFlashCard {
  constructor(private readonly deps: Dependencies) {}
  async execute(input: unknown): Promise<StudyEntry> {
    const parsed = parseInput(deleteSchema, input);
    return mutate(this.deps, parsed.entryId, (entry, now) => {
      if (!entry.flashCards?.some((card) => card.id === parsed.cardId))
        throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
      return replaceFlashCards(
        entry,
        entry.flashCards.filter((card) => card.id !== parsed.cardId),
        now,
      );
    });
  }
}
