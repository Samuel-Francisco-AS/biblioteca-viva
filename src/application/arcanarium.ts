import { packOwned } from "../domain/educationalPacks";
import { validateCardMediaOwnership, type CardMediaPort } from "./cardMedia";
import { normalizeKnowledge } from "../domain/provations";
import { z } from "zod";
import {
  cardContentSchema,
  cardSchema,
  deckSchema,
  deckSelectionSchema,
  knowledgeTagSchema,
  cardSessionSchema,
  reviseCard,
  validateArcanarium,
  type Card,
  type CardContent,
  type CardReference,
} from "../domain/arcanarium";
import { createLibraryEntryUpdatedEvent } from "../domain";
import { nextMetadata } from "../domain/validation";
import type { ApplicationDependencies } from "./ports";
import type { ArcanariumRepository } from "./arcanariumPort";
import { ApplicationError } from "./errors";
import {
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  runTransaction,
} from "./internal";
export type ArcanariumDependencies = Pick<
  ApplicationDependencies,
  "clock" | "ids" | "events" | "libraryEntries" | "transaction"
> & {
  readonly arcanarium: ArcanariumRepository;
  readonly cardMedia?: CardMediaPort;
};
const id = z.string().min(1);
const expected = z.int().positive();
export function requireRevision(actual: number, revision: number) {
  if (actual !== revision)
    throw new ApplicationError(
      "CONFLICT",
      "Os dados mudaram. Reabra antes de editar.",
    );
}
export async function persistCard(repo: ArcanariumRepository, card: Card) {
  await repo.addVersion({ cardId: card.id, revision: card.revision, card });
  await repo.putCard(card);
}
function missing(): never {
  throw new ApplicationError(
    "NOT_FOUND",
    "Referência do Arcanário não encontrada.",
  );
}
export class ArcanariumService {
  constructor(private readonly deps: ArcanariumDependencies) {}
  async getCard(cardId: string) {
    return this.deps.arcanarium.getCard(parseInput(id, cardId));
  }
  async getVersion(cardId: string, revision: number) {
    return this.deps.arcanarium.getVersion(
      parseInput(id, cardId),
      parseInput(expected, revision),
    );
  }
  async getDeck(deckId: string) {
    return this.deps.arcanarium.getDeck(parseInput(id, deckId));
  }
  async overview() {
    if (this.deps.arcanarium.overview) return this.deps.arcanarium.overview();
    const data = await this.list();
    return {
      cards: data.cards.filter((c) => !c.archived).length,
      decks: data.decks.length,
      reviews: data.sessions.filter((s) => s.kind === "flashcard_review")
        .length,
    };
  }
  async list() {
    try {
      return await this.deps.arcanarium.read();
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar o Arcanário.",
      );
    }
  }
  private async validate() {
    const entries = await this.deps.libraryEntries.list();
    try {
      const data = await this.deps.arcanarium.read();
      validateCardMediaOwnership(
        data.versions,
        (await this.deps.cardMedia?.list()) ?? [],
      );
      validateArcanarium(
        data,
        new Set(entries.filter((e) => e.type === "study").map((e) => e.id)),
      );
    } catch {
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Os vínculos ou revisões do Arcanário são inválidos.",
      );
    }
  }
  async createCard(input: unknown): Promise<Card> {
    const content = parseInput(cardContentSchema, input);
    const now = await currentTime(this.deps);
    const cardId = `local:${await generatedId(this.deps, "card")}`;
    return runTransaction(this.deps, async () => {
      if (await this.deps.arcanarium.getCard(cardId))
        throw new ApplicationError("CONFLICT", "Identidade já existente.");
      const card = cardSchema.parse({
        id: cardId,
        revision: 1,
        type: content.type,
        origin: { kind: "local" },
        createdAt: now,
        updatedAt: now,
        archived: false,
        content,
      });
      await persistCard(this.deps.arcanarium, card);
      await this.validate();
      return card;
    });
  }
  async updateCard(input: unknown): Promise<Card> {
    const parsed = parseInput(
      z.strictObject({
        cardId: id,
        expectedRevision: expected,
        content: cardContentSchema,
      }),
      input,
    );
    return this.changeCard(
      parsed.cardId,
      parsed.expectedRevision,
      parsed.content,
      false,
    );
  }
  async archiveCard(input: unknown): Promise<Card> {
    const parsed = parseInput(
      z.strictObject({ cardId: id, expectedRevision: expected }),
      input,
    );
    return this.changeCard(
      parsed.cardId,
      parsed.expectedRevision,
      undefined,
      true,
    );
  }
  private async changeCard(
    cardId: string,
    expectedRevision: number,
    content: CardContent | undefined,
    archive: boolean,
  ) {
    const now = await currentTime(this.deps);
    const eventId = await generatedId(this.deps, "card_event");
    const { card, changed } = await runTransaction(this.deps, async () => {
      const previous =
        (await this.deps.arcanarium.getCard(cardId)) ?? missing();
      requireRevision(previous.revision, expectedRevision);
      if (previous.origin.kind === "official" || packOwned(previous))
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Carta oficial não é autoral.",
        );
      const card = cardSchema.parse({
        ...reviseCard(previous, content ?? previous.content, now),
        archived: archive || previous.archived,
      });
      await persistCard(this.deps.arcanarium, card);
      const links = (await this.deps.arcanarium.read()).studyLinks.filter(
        (link) => link.active && link.cardId === cardId,
      );
      const changed: { id: string; revision: number }[] = [];
      for (const studyId of new Set(links.map((link) => link.studyId))) {
        const study =
          (await this.deps.libraryEntries.getById(studyId)) ?? missing();
        const updated = { ...study, ...nextMetadata(study, now) };
        await this.deps.libraryEntries.save(updated);
        changed.push({ id: updated.id, revision: updated.revision });
      }
      await this.validate();
      return { card, changed };
    });
    for (const study of changed)
      await publishEvent(
        this.deps,
        createLibraryEntryUpdatedEvent({
          eventId: `${eventId}:${study.id}`,
          aggregateId: study.id,
          occurredAt: now,
          revision: study.revision,
          payload: { entryType: "study", changedFields: ["flashCards"] },
        }),
      );
    return card;
  }
  async saveDeck(input: unknown) {
    const parsed = parseInput(
      z.strictObject({
        id: id.optional(),
        expectedRevision: expected.optional(),
        name: z.string().trim().min(1).max(160),
        selection: deckSelectionSchema,
      }),
      input,
    );
    const now = await currentTime(this.deps);
    const deckId = parsed.id ?? `local:${await generatedId(this.deps, "deck")}`;
    return runTransaction(this.deps, async () => {
      const previous = await this.deps.arcanarium.getDeck(deckId);
      if (parsed.id && !previous) missing();
      if (
        previous?.combat ||
        (parsed.selection.kind === "static" &&
          (
            await Promise.all(
              parsed.selection.cards.map((r) =>
                this.deps.arcanarium.getCard(r.cardId),
              ),
            )
          ).some((c) => c?.content.type === "combat" && c.content.combat))
      )
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Organize cartas de combate nos baralhos do Duelo Arcano.",
        );
      if (previous) {
        if (previous.origin.kind === "official" || packOwned(previous))
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Baralho oficial não é autoral.",
          );
        requireRevision(previous.revision, parsed.expectedRevision ?? 0);
      }
      const deck = deckSchema.parse({
        id: deckId,
        name: parsed.name,
        selection: parsed.selection,
        origin: previous?.origin ?? { kind: "local" },
        revision: (previous?.revision ?? 0) + 1,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
      });
      await this.deps.arcanarium.putDeck(deck);
      await this.validate();
      return deck;
    });
  }
  async deleteDeck(input: unknown) {
    const parsed = parseInput(
      z.strictObject({ id, expectedRevision: expected }),
      input,
    );
    await runTransaction(this.deps, async () => {
      const deck = (await this.deps.arcanarium.getDeck(parsed.id)) ?? missing();
      if (deck.origin.kind === "official")
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Baralho oficial não é autoral.",
        );
      requireRevision(deck.revision, parsed.expectedRevision);
      await this.deps.arcanarium.deleteDeck(deck.id);
    });
  }
  async saveTag(input: unknown, expectedRevision?: number) {
    const tag = parseInput(knowledgeTagSchema, input);
    if (tag.id.startsWith("pack:"))
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "Classificações de pacote são editoriais. Crie uma etiqueta pessoal separada.",
      );
    return runTransaction(this.deps, async () => {
      const previous = (await this.deps.arcanarium.read()).tags.find(
        (t) => t.id === tag.id,
      );
      if (previous) requireRevision(previous.revision, expectedRevision ?? 0);
      if (
        tag.revision !== (previous?.revision ?? 0) + 1 ||
        (previous &&
          (tag.namespace !== previous.namespace ||
            tag.level !== previous.level))
      )
        throw new ApplicationError(
          "CONFLICT",
          "Versão ou identidade da classificação inválida.",
        );
      const all = (await this.deps.arcanarium.read()).tags;
      const names = [tag.label, ...tag.synonyms].map(normalizeKnowledge);
      const siblings = all.filter(
        (t) =>
          t.id !== tag.id &&
          t.namespace === tag.namespace &&
          JSON.stringify([...t.parentIds].sort()) ===
            JSON.stringify([...tag.parentIds].sort()),
      );
      const levels = ["area", "discipline", "subject", "subsubject", "skill"];
      if (
        new Set(names).size !== names.length ||
        siblings.some((t) =>
          [t.label, ...t.synonyms].some((n) =>
            names.includes(normalizeKnowledge(n)),
          ),
        ) ||
        (tag.namespace === "personal" && tag.parentIds.length > 0) ||
        (tag.namespace === "editorial" &&
          (tag.level === "area"
            ? tag.parentIds.length !== 0
            : tag.parentIds.length !== 1 ||
              all.find((t) => t.id === tag.parentIds[0])?.level !==
                levels[levels.indexOf(tag.level) - 1]))
      )
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Classificação duplicada, sinônimo repetido ou hierarquia inválida. Escolha um pai do nível imediatamente anterior.",
        );
      await this.deps.arcanarium.putTag(tag);
      await this.validate();
      return tag;
    });
  }
  async startReview(input: unknown) {
    const refs = parseInput(
      z.array(z.strictObject({ cardId: id, revision: expected })).min(1),
      input,
    );
    const now = await currentTime(this.deps);
    const sessionId = await generatedId(this.deps, "review");
    return runTransaction(this.deps, async () => {
      if (await this.deps.arcanarium.getSession(sessionId))
        throw new ApplicationError("CONFLICT", "Sessão já existente.");
      const session = cardSessionSchema.parse({
        id: sessionId,
        kind: "flashcard_review",
        startedAt: now,
        cards: refs,
        answers: [],
      });
      await this.deps.arcanarium.putSession(session);
      await this.validate();
      return session;
    });
  }
  async answerReview(input: unknown) {
    const parsed = parseInput(
      z.strictObject({
        sessionId: id,
        index: z.int().nonnegative(),
        recalled: z.boolean(),
      }),
      input,
    );
    const now = await currentTime(this.deps);
    return runTransaction(this.deps, async () => {
      const session =
        (await this.deps.arcanarium.getSession(parsed.sessionId)) ?? missing();
      if (
        session.kind !== "flashcard_review" ||
        session.answers.length !== parsed.index ||
        parsed.index >= session.cards.length
      )
        throw new ApplicationError(
          "CONFLICT",
          "Esta resposta já foi registrada ou está fora de ordem.",
        );
      const updated = cardSessionSchema.parse({
        ...session,
        answers: [
          ...session.answers,
          { recalled: parsed.recalled, answeredAt: now },
        ],
      });
      await this.deps.arcanarium.putSession(updated);
      return updated;
    });
  }
  async progress(cardId: string) {
    const data = await this.list();
    const attempts = data.sessions.flatMap((session) =>
      session.kind !== "flashcard_review"
        ? []
        : session.answers.flatMap((answer, index) =>
            session.cards[index].cardId === cardId
              ? [
                  {
                    ...answer,
                    reference: session.cards[index] satisfies CardReference,
                    sessionId: session.id,
                  },
                ]
              : [],
          ),
    );
    return {
      cardId,
      reviews: attempts.length,
      recalled: attempts.filter((a) => a.recalled).length,
      attempts,
    };
  }
}
