import { z } from "zod";
import {
  cardContentSchema,
  knowledgeTagSchema,
  type ArcanariumData,
  type Card,
} from "./arcanarium";
import { packIdSchema, sourceUrlSchema } from "./packManifest";
const short = z.string().trim().min(1).max(160);
export const officialIdentitySchema = z.strictObject({
  exam: short,
  year: z.int().min(1900).max(9999),
  application: short,
  booklet: short,
  language: short,
  number: z.int().min(1).max(10000),
  canonicalId: short.optional(),
  equivalentTo: z.array(short).max(20).optional(),
});
export type OfficialIdentity = z.infer<typeof officialIdentitySchema>;
/** Tuple includes booklet, application and language. Equivalence NEVER silently coalesces IDs. */
export function educationalCardId(i: OfficialIdentity) {
  return `exam:${JSON.stringify([i.exam, i.year, i.application, i.booklet, i.language, i.number])}`;
}
export const packQuestionSchema = z
  .strictObject({
    identity: officialIdentitySchema,
    revision: z.int().positive(),
    publishedAt: z.iso.datetime(),
    content: cardContentSchema,
    source: sourceUrlSchema,
    correctionSource: sourceUrlSchema.optional(),
  })
  .refine(
    (q) =>
      q.content.type === "question" &&
      q.content.statement.length <= 16000 &&
      q.content.alternatives.length <= 5 &&
      q.content.alternatives.every((a) => a.text.length <= 4000) &&
      (q.content.explanation?.length ?? 0) <= 16000,
  );
export type PackQuestion = z.infer<typeof packQuestionSchema>;
export const packLotSchema = z.strictObject({
  formatVersion: z.literal(1),
  packId: packIdSchema,
  lotId: packIdSchema,
  tags: z.array(knowledgeTagSchema).max(1000),
  questions: z.array(packQuestionSchema).min(1).max(2000),
});
export type PackLot = z.infer<typeof packLotSchema>;
export function packOwned(card: Pick<Card, "id" | "origin">) {
  return (
    card.id.startsWith("exam:") &&
    (card.origin.kind === "official" || card.origin.kind === "imported")
  );
}
export function cardAvailable(card: Card, data: ArcanariumData) {
  if (card.archived) return false;
  if (!packOwned(card)) return true;
  const origin = card.origin;
  if (origin.kind !== "official" && origin.kind !== "imported") return false;
  return (
    data.packs?.some(
      (p) =>
        p.id === origin.packId &&
        p.status === "installed" &&
        p.items.some((i) => i.cardId === card.id),
    ) ?? false
  );
}
export function gradable(card: Card) {
  return (
    card.content.type !== "question" ||
    !card.content.editorial ||
    (card.content.editorial.status === "valid" &&
      card.content.editorial.answerKey !== "preliminary")
  );
}
