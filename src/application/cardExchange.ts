import { z } from "zod";
import { cardContentSchema } from "../domain/arcanarium";
import type { CardMedia } from "./cardMedia";
import { ApplicationError } from "./errors";
import {
  currentTime,
  generatedId,
  parseInput,
  runTransaction,
} from "./internal";
import { persistCard } from "./arcanarium";
import type { WorkshopDependencies } from "./arcanariumWorkshop";
import { cardSchema, deckSchema } from "../domain/arcanarium";
export const MAX_EXCHANGE_BYTES = 10 * 1024 * 1024;
export const exchangeDataSchema = z.strictObject({
  name: z.string().trim().min(1).max(160),
  cards: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(1000),
        content: cardContentSchema,
      }),
    )
    .max(500)
    .refine((cards) => new Set(cards.map((c) => c.id)).size === cards.length)
    .refine((cards) =>
      cards.every(
        (c) =>
          c.content.type === "flashcard" ||
          (c.content.type === "memory" && c.content.entryIds.length === 0),
      ),
    ),
});
export interface ExchangeData extends z.infer<typeof exchangeDataSchema> {
  media: CardMedia[];
}
export interface CardExchangeCodec {
  encode(data: ExchangeData): Promise<string>;
  inspect(content: string): Promise<ExchangeData>;
}
export class CardExchange {
  constructor(
    private readonly deps: WorkshopDependencies,
    private readonly codec: CardExchangeCodec,
  ) {}
  inspect(content: string) {
    return this.codec.inspect(content);
  }
  async exportDeck(deckId: string) {
    const data = await runTransaction(this.deps, async () => {
      const deck = await this.deps.arcanarium.getDeck(deckId);
      if (
        !deck ||
        deck.origin.kind === "official" ||
        deck.selection.kind !== "static"
      )
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "Exporte um baralho estático autoral.",
        );
      const cards = [];
      const media: CardMedia[] = [];
      for (const ref of deck.selection.cards) {
        const card = ref.revision
          ? (await this.deps.arcanarium.getVersion(ref.cardId, ref.revision))
              ?.card
          : await this.deps.arcanarium.getCard(ref.cardId);
        if (
          !card ||
          card.archived ||
          card.origin.kind === "official" ||
          (card.content.type !== "flashcard" && card.content.type !== "memory")
        )
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "O baralho contém carta arquivada ou de família ainda não exportável.",
          );
        const content =
          card.content.type === "memory"
            ? { ...card.content, entryIds: [] }
            : card.content;
        cards.push({ id: card.id, content });
        if (content.type === "memory" && content.imageId) {
          const image = await this.deps.cardMedia.get(content.imageId);
          if (!image || image.cardId !== card.id)
            throw new ApplicationError(
              "VALIDATION_FAILED",
              "Imagem indisponível.",
            );
          media.push(image);
        }
      }
      return { name: deck.name, cards, media };
    });
    return this.codec.encode(data);
  }
  async importCopy(content: string) {
    const decoded = await this.codec.inspect(content);
    // Revalidate the application boundary; the infrastructure also inspects all image bytes.
    const data = parseInput(exchangeDataSchema, {
      name: decoded.name,
      cards: decoded.cards,
    });
    const now = await currentTime(this.deps);
    const deckId = `local:${await generatedId(this.deps, "deck")}`;
    const ids = new Map<string, string>();
    for (const c of data.cards)
      ids.set(c.id, `local:${await generatedId(this.deps, "card")}`);
    const images = new Map<string, string>();
    for (const m of decoded.media)
      images.set(m.id, `local:${await generatedId(this.deps, "card_image")}`);
    if (
      new Set([deckId, ...ids.values(), ...images.values()]).size !==
      1 + ids.size + images.size
    )
      throw new ApplicationError(
        "CONFLICT",
        "Gerador de identidades produziu colisão. Nada foi importado.",
      );
    return runTransaction(this.deps, async () => {
      const repo = this.deps.arcanarium;
      if (await repo.getDeck(deckId))
        throw new ApplicationError("CONFLICT", "Baralho já existente.");
      for (const [oldId, newId] of ids) {
        if (await repo.getCard(newId))
          throw new ApplicationError("CONFLICT", "Carta já existente.");
        const c = data.cards.find((c) => c.id === oldId)!;
        const cardContent =
          c.content.type === "memory" && c.content.imageId
            ? { ...c.content, imageId: images.get(c.content.imageId) }
            : c.content;
        await persistCard(
          repo,
          cardSchema.parse({
            id: newId,
            type: c.content.type,
            content: cardContent,
            origin: { kind: "local" },
            revision: 1,
            archived: false,
            createdAt: now,
            updatedAt: now,
          }),
        );
      }
      for (const m of decoded.media) {
        const newId = images.get(m.id),
          owner = ids.get(m.cardId);
        if (!newId || !owner)
          throw new ApplicationError(
            "VALIDATION_FAILED",
            "Imagem sem proprietário.",
          );
        await this.deps.cardMedia.add({ ...m, id: newId, cardId: owner });
      }
      const deck = deckSchema.parse({
        id: deckId,
        name: data.name,
        revision: 1,
        origin: { kind: "local" },
        createdAt: now,
        updatedAt: now,
        selection: {
          kind: "static",
          cards: data.cards.map((c) => ({ cardId: ids.get(c.id) })),
        },
      });
      await repo.putDeck(deck);
      return deck;
    });
  }
}
