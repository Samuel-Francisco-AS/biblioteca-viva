import { z } from "zod";
import {
  createLibraryEntryUpdatedEvent,
  flashCardSchema,
  type StudyEntry,
} from "../domain";
import { nextMetadata } from "../domain/validation";
import { cardSchema, reviseCard } from "../domain/arcanarium";
import {
  persistCard,
  requireRevision,
  type ArcanariumDependencies,
} from "./arcanarium";
import { ApplicationError } from "./errors";
import {
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
} from "./internal";
const id = z.string().trim().min(1);
const saveSchema = z.strictObject({
  entryId: id,
  cardId: id.optional(),
  expectedRevision: z.int().positive().optional(),
  front: flashCardSchema.shape.front,
  back: flashCardSchema.shape.back,
});
const deleteSchema = z.strictObject({
  entryId: id,
  cardId: id,
  expectedRevision: z.int().positive().optional(),
});
async function mutate(
  deps: ArcanariumDependencies,
  entryId: string,
  change: (entry: StudyEntry, now: string) => Promise<void>,
) {
  const now = await currentTime(deps);
  const eventId = await generatedId(deps, "flash_card_event");
  const updated = await runTransaction(deps, async () => {
    const entry = await deps.libraryEntries.getById(entryId);
    if (!entry || entry.type !== "study")
      throw new ApplicationError("NOT_FOUND", "Estudo não encontrado.");
    await change(entry, now);
    await deps.libraryEntries.save({ ...entry, ...nextMetadata(entry, now) });
    const result = await deps.libraryEntries.getById(entryId);
    if (!result || result.type !== "study")
      throw new ApplicationError("NOT_FOUND", "Estudo não encontrado.");
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
  constructor(private readonly deps: ArcanariumDependencies) {}
  async execute(input: unknown): Promise<StudyEntry> {
    const parsed = parseInput(saveSchema, input);
    const alias =
      parsed.cardId ?? (await generatedId(this.deps, "flash_card_id"));
    return mutate(this.deps, parsed.entryId, async (entry, now) => {
      const repo = this.deps.arcanarium;
      const links = await repo.linksForStudy(entry.id);
      const link = links.find((l) => l.active && l.legacyCardId === alias);
      const content = {
        type: "flashcard" as const,
        front: parsed.front,
        back: parsed.back,
      };
      if (parsed.cardId) {
        const previous = link && (await repo.getCard(link.cardId));
        if (!previous || previous.archived)
          throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
        if (parsed.expectedRevision !== undefined)
          requireRevision(previous.revision, parsed.expectedRevision);
        await persistCard(
          repo,
          reviseCard(previous, { ...previous.content, ...content }, now),
        );
      } else {
        if (
          links.some((l) => l.legacyCardId === alias) ||
          (await repo.getCard(`local:${alias}`))
        )
          throw new ApplicationError(
            "CONFLICT",
            "Identidade de carta já existente.",
          );
        if (links.filter((l) => l.active).length >= 1000)
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Limite de cartas deste estudo atingido.",
          );
        const card = cardSchema.parse({
          id: `local:${alias}`,
          type: "flashcard",
          content,
          revision: 1,
          origin: { kind: "study", studyId: entry.id, legacyCardId: alias },
          createdAt: now,
          updatedAt: now,
          archived: false,
        });
        await persistCard(repo, card);
        await repo.putLink({
          studyId: entry.id,
          legacyCardId: alias,
          cardId: card.id,
          position: Math.max(-1, ...links.map((l) => l.position)) + 1,
          active: true,
        });
      }
    });
  }
}
export class DeleteFlashCard {
  constructor(private readonly deps: ArcanariumDependencies) {}
  async execute(input: unknown): Promise<StudyEntry> {
    const parsed = parseInput(deleteSchema, input);
    return mutate(this.deps, parsed.entryId, async () => {
      const link = (
        await this.deps.arcanarium.linksForStudy(parsed.entryId)
      ).find((l) => l.active && l.legacyCardId === parsed.cardId);
      if (!link)
        throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
      const card = await this.deps.arcanarium.getCard(link.cardId);
      if (!card)
        throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
      if (parsed.expectedRevision !== undefined)
        requireRevision(card.revision, parsed.expectedRevision);
      await this.deps.arcanarium.putLink({ ...link, active: false });
    });
  }
}
