import { z } from "zod";
import {
  cardSessionSchema,
  type Card,
  type Deck,
  type CardSession,
} from "../domain/arcanarium";
import {
  DuelRuleError,
  combatDeckSchema,
  modeSchema,
  RULESET,
  type DuelAction,
  type DuelCard,
} from "../domain/duel/contracts";
import {
  createDuel,
  transition,
  validateDuelDeck,
  validateMatch,
} from "../domain/duel/engine";
import {
  currentTime,
  generatedId,
  parseInput,
  runTransaction,
} from "./internal";
import { requireRevision, type ArcanariumDependencies } from "./arcanarium";
import { ApplicationError } from "./errors";
export type DuelSession = Extract<CardSession, { kind: "combat_match" }>;
export function combatSnapshot(card: Card): DuelCard {
  if (card.content.type !== "combat" || !card.content.combat || card.archived)
    throw new DuelRuleError("Carta de combate indisponível.");
  return {
    id: card.id,
    cardId: card.id,
    revision: card.revision,
    name: card.content.name,
    official:
      card.origin.kind === "official" && card.id.startsWith("arcane-v1:"),
    definition: card.content.combat,
  };
}
export class DuelService {
  constructor(private readonly deps: ArcanariumDependencies) {}
  private transaction<T>(operation: () => Promise<T>): Promise<T> {
    return runTransaction(this.deps, async () => {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof DuelRuleError)
          throw new ApplicationError("VALIDATION_FAILED", error.message);
        throw error;
      }
    });
  }
  async list() {
    return (await this.deps.arcanarium.read()).sessions.filter(
      (s): s is DuelSession => s.kind === "combat_match" && !!s.duel,
    );
  }
  async get(id: string) {
    const s = await this.deps.arcanarium.getSession(id);
    if (s?.kind !== "combat_match" || !s.duel)
      throw new DuelRuleError("Duelo não encontrado.");
    validateMatch(s.duel);
    return s;
  }
  private async resolveDeck(deck: Deck) {
    if (!deck.combat || deck.selection.kind !== "static")
      throw new DuelRuleError("Escolha um baralho de combate.");
    const cards: DuelCard[] = [];
    for (const r of deck.selection.cards) {
      const c = r.revision
        ? (await this.deps.arcanarium.getVersion(r.cardId, r.revision))?.card
        : await this.deps.arcanarium.getCard(r.cardId);
      if (!c || (await this.deps.arcanarium.getCard(r.cardId))?.archived)
        throw new DuelRuleError("Carta arquivada ou indisponível no baralho.");
      const snapshot = combatSnapshot(c);
      for (let i = 0; i < (deck.combat.copies[r.cardId] ?? 0); i++)
        cards.push(snapshot);
    }
    return cards;
  }
  async start(input: unknown) {
    const p = parseInput(
      z.strictObject({
        deckId: z.string().min(1),
        opponentId: z.string().min(1),
        mode: modeSchema,
        seed: z.int().min(0).max(0xffffffff),
      }),
      input,
    );
    const id = `duel:${await generatedId(this.deps, "duel")}`,
      now = await currentTime(this.deps);
    return this.transaction(async () => {
      if ((await this.list()).some((s) => s.duel?.status !== "completed"))
        throw new DuelRuleError(
          "Retome ou abandone o duelo em andamento antes de iniciar outro.",
        );
      const deck = await this.deps.arcanarium.getDeck(p.deckId),
        opponent = await this.deps.arcanarium.getDeck(p.opponentId);
      if (!deck?.combat || !opponent?.combat)
        throw new DuelRuleError("Baralho de combate não encontrado.");
      const own = await this.resolveDeck(deck),
        other = await this.resolveDeck(opponent);
      validateDuelDeck(own, deck.combat.affinity, p.mode);
      validateDuelDeck(other, opponent.combat.affinity, p.mode);
      const duel = createDuel(
        [
          {
            name: "Você",
            affinity: deck.combat.affinity,
            deckName: deck.name,
            cards: own,
          },
          {
            name: opponent.name.split(" · ")[0],
            affinity: opponent.combat.affinity,
            deckName: opponent.name,
            cards: other,
          },
        ],
        p.seed,
        p.mode,
      );
      const refs = [
        ...new Map(
          [...own, ...other].map((c) => [
            JSON.stringify([c.cardId, c.revision]),
            { cardId: c.cardId, revision: c.revision },
          ]),
        ).values(),
      ];
      const session = cardSessionSchema.parse({
        id,
        kind: "combat_match",
        startedAt: now,
        updatedAt: now,
        cards: refs,
        rulesetVersion: RULESET,
        duel,
      });
      if (session.kind !== "combat_match")
        throw new DuelRuleError("Sessão incompatível.");
      await this.deps.arcanarium.putSession(session);
      return session;
    });
  }
  async command(
    sessionId: string,
    revision: number,
    commandId: string,
    player: number,
    action: DuelAction,
  ) {
    const now = await currentTime(this.deps);
    return this.transaction(async () => {
      const s = await this.get(sessionId);
      if (!s.duel) throw new DuelRuleError("Duelo ausente.");
      if (now < (s.updatedAt ?? s.startedAt))
        throw new DuelRuleError(
          "Relógio anterior à última confirmação. Ajuste o horário para continuar.",
        );
      const { state } = transition(s.duel, {
        id: commandId,
        revision,
        player,
        action,
      });
      validateMatch(state);
      const updated: DuelSession = { ...s, duel: state, updatedAt: now };
      await this.deps.arcanarium.putSession(updated);
      return updated;
    });
  }
  async saveDeck(input: unknown) {
    const p = parseInput(
      z.strictObject({
        id: z.string().optional(),
        expectedRevision: z.int().positive().optional(),
        name: z.string().trim().min(1).max(160),
        combat: combatDeckSchema,
      }),
      input,
    );
    const now = await currentTime(this.deps),
      id = p.id ?? `local:${await generatedId(this.deps, "duel-deck")}`;
    return this.transaction(async () => {
      const previous = await this.deps.arcanarium.getDeck(id);
      if (p.id && !previous) throw new DuelRuleError("Baralho indisponível.");
      if (previous) {
        requireRevision(previous.revision, p.expectedRevision ?? 0);
        if (previous.origin.kind === "official" || !previous.combat)
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Use uma cópia autoral do baralho oficial.",
          );
      }
      const deck: Deck = {
        id,
        name: p.name,
        origin: { kind: "local" },
        revision: (previous?.revision ?? 0) + 1,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
        selection: {
          kind: "static",
          cards: Object.keys(p.combat.copies).map((cardId) => ({ cardId })),
        },
        combat: p.combat,
      };
      const cards = await this.resolveDeck(deck);
      validateDuelDeck(cards, p.combat.affinity, p.combat.mode);
      await this.deps.arcanarium.putDeck(deck);
      return deck;
    });
  }
}
