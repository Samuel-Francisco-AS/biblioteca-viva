import { packOwned } from "../domain/educationalPacks";
import { z } from "zod";
import {
  cardContentSchema,
  cardSchema,
  reviseCard,
  validateArcanarium,
  type CardContent,
} from "../domain/arcanarium";
import { createLibraryEntryUpdatedEvent } from "../domain";
import { nextMetadata } from "../domain/validation";
import { ApplicationError } from "./errors";
import {
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
} from "./internal";
import {
  persistCard,
  requireRevision,
  type ArcanariumDependencies,
} from "./arcanarium";
import { validateCardMediaOwnership, type CardMediaPort } from "./cardMedia";
const id = z.string().min(1);
const imageSchema = z.strictObject({
  dataUrl: z.string().max(350000),
  width: z.int().positive().max(1600),
  height: z.int().positive().max(1600),
});
export const workshopSaveSchema = z.strictObject({
  cardId: id.optional(),
  expectedRevision: z.int().positive().optional(),
  content: cardContentSchema,
  studyIds: z
    .array(id)
    .max(100)
    .refine((v) => new Set(v).size === v.length),
  decks: z
    .array(
      z.strictObject({
        id,
        expectedRevision: z.int().positive(),
        included: z.boolean(),
      }),
    )
    .max(500)
    .refine((v) => new Set(v.map((d) => d.id)).size === v.length),
  image: imageSchema.nullable().optional(),
});
export type WorkshopSave = z.infer<typeof workshopSaveSchema>;
export type WorkshopDependencies = ArcanariumDependencies & {
  cardMedia: CardMediaPort;
};
export class ArcanariumWorkshop {
  constructor(private readonly deps: WorkshopDependencies) {}
  async media(id: string) {
    return this.deps.cardMedia.get(id);
  }
  async save(input: unknown) {
    const p = parseInput(workshopSaveSchema, input);
    if (
      p.content.type !== "flashcard" &&
      p.content.type !== "memory" &&
      p.content.type !== "question"
    )
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "A Oficina cria Ecos, questões e lembranças.",
      );
    if (
      p.content.type === "memory" &&
      (p.content.title.length > 160 ||
        (p.content.text?.length ?? 0) > 8000 ||
        p.content.entryIds.length > 100)
    )
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Texto ou referências acima do limite da Oficina.",
      );
    if (p.content.type !== "memory" && p.image !== undefined)
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Somente lembranças recebem imagem.",
      );
    if (
      p.content.type === "question" &&
      (p.content.statement.length > 16000 ||
        (p.content.explanation?.length ?? 0) > 16000 ||
        p.content.alternatives.length > 5 ||
        p.content.alternatives.some((a) => a.text.length > 4000))
    )
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Use de 2 a 5 alternativas (até 4.000 caracteres), enunciado e explicação até 16.000 caracteres.",
      );
    const now = await currentTime(this.deps);
    const cardId = p.cardId ?? `local:${await generatedId(this.deps, "card")}`;
    const mediaId = p.image
      ? `local:${await generatedId(this.deps, "card_image")}`
      : undefined;
    const eventId = await generatedId(this.deps, "workshop_event");
    const result = await runTransaction(this.deps, async () => {
      const repo = this.deps.arcanarium;
      const previous = await repo.getCard(cardId);
      if (p.cardId && !previous)
        throw new ApplicationError("NOT_FOUND", "Carta não encontrada.");
      if (!p.cardId && previous)
        throw new ApplicationError("CONFLICT", "Identidade já existente.");
      if (previous) {
        requireRevision(previous.revision, p.expectedRevision ?? 0);
        if (
          previous.origin.kind === "official" ||
          packOwned(previous) ||
          previous.archived ||
          previous.type !== p.content.type
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Esta carta não pode ser editada na Oficina.",
          );
      }
      let content: CardContent = p.content;
      if (content.type === "memory") {
        const { imageId: _old, ...withoutImage } = content;
        void _old;
        content =
          p.image === null
            ? withoutImage
            : { ...content, ...(mediaId && { imageId: mediaId }) };
        if (mediaId && p.image)
          await this.deps.cardMedia.add({ id: mediaId, cardId, ...p.image });
        if (
          content.imageId &&
          (await this.deps.cardMedia.get(content.imageId))?.cardId !== cardId
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Imagem sem propriedade desta carta.",
          );
        // References are optional; an absent origin remains valid after later deletion.
        const entries = await this.deps.libraryEntries.list();
        const existing = new Set(entries.map((e) => e.id));
        const oldRefs = new Set(
          previous?.content.type === "memory" ? previous.content.entryIds : [],
        );
        if (
          content.entryIds.some((id) => !existing.has(id) && !oldRefs.has(id))
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Registro de origem indisponível.",
          );
      }
      const card = previous
        ? reviseCard(previous, content, now)
        : cardSchema.parse({
            id: cardId,
            revision: 1,
            type: content.type,
            content,
            origin: { kind: "local" },
            createdAt: now,
            updatedAt: now,
            archived: false,
          });
      await persistCard(repo, card);
      const before = await repo.read();
      const changed = new Set(
        before.studyLinks
          .filter((l) => l.cardId === card.id && l.active)
          .map((l) => l.studyId),
      );
      const wanted = new Set(card.type === "flashcard" ? p.studyIds : []);
      if (card.type !== "flashcard" && p.studyIds.length)
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Somente Ecos são vinculados como flashcards de Estudos.",
        );
      for (const link of before.studyLinks.filter(
        (l) => l.cardId === card.id,
      )) {
        const active = wanted.has(link.studyId);
        if (link.active !== active) {
          await repo.putLink({ ...link, active });
          changed.add(link.studyId);
        }
        wanted.delete(link.studyId);
      }
      for (const studyId of wanted) {
        const study = await this.deps.libraryEntries.getById(studyId);
        if (!study || study.type !== "study")
          throw new ApplicationError("NOT_FOUND", "Estudo indisponível.");
        const links = await repo.linksForStudy(studyId);
        const alias = await generatedId(this.deps, "study_alias");
        if (links.some((l) => l.legacyCardId === alias))
          throw new ApplicationError(
            "CONFLICT",
            "Identidade de vínculo já existente.",
          );
        await repo.putLink({
          studyId,
          legacyCardId: alias,
          cardId,
          position: Math.max(-1, ...links.map((l) => l.position)) + 1,
          active: true,
        });
        changed.add(studyId);
      }
      for (const choice of p.decks) {
        const deck = await repo.getDeck(choice.id);
        if (
          !deck ||
          deck.selection.kind !== "static" ||
          deck.origin.kind === "official"
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Baralho indisponível para organização.",
          );
        const included = deck.selection.cards.some((r) => r.cardId === card.id);
        if (included === choice.included) continue;
        requireRevision(deck.revision, choice.expectedRevision);
        await repo.putDeck({
          ...deck,
          revision: deck.revision + 1,
          updatedAt: now,
          selection: {
            kind: "static",
            cards: choice.included
              ? [...deck.selection.cards, { cardId: card.id }]
              : deck.selection.cards.filter((r) => r.cardId !== card.id),
          },
        });
      }
      const events = [];
      for (const studyId of changed) {
        const study = await this.deps.libraryEntries.getById(studyId);
        if (!study) continue;
        const updated = { ...study, ...nextMetadata(study, now) };
        await this.deps.libraryEntries.save(updated);
        events.push({ studyId, revision: updated.revision });
      }
      const data = await repo.read();
      const studies = (await this.deps.libraryEntries.list()).filter(
        (e) => e.type === "study",
      );
      try {
        validateArcanarium(data, new Set(studies.map((s) => s.id)));
        // Remove only bytes not referenced by ANY retained revision.
        const used = new Set(
          data.versions.flatMap((v) =>
            v.card.content.type === "memory" && v.card.content.imageId
              ? [v.card.content.imageId]
              : [],
          ),
        );
        for (const m of await this.deps.cardMedia.list())
          if (!used.has(m.id)) await this.deps.cardMedia.delete(m.id);
        validateCardMediaOwnership(
          data.versions,
          await this.deps.cardMedia.list(),
        );
      } catch {
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Os vínculos ou imagens são inválidos. Nada foi salvo.",
        );
      }
      return { card, events };
    });
    for (const e of result.events)
      await publishEvent(
        this.deps,
        createLibraryEntryUpdatedEvent({
          eventId: `${eventId}:${e.studyId}`,
          aggregateId: e.studyId,
          revision: e.revision,
          occurredAt: now,
          payload: { entryType: "study", changedFields: ["flashCards"] },
        }),
      );
    return result.card;
  }
}
