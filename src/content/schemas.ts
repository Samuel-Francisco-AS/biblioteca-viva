import { z } from "zod";

import { DIALOGUE_EVENTS, DIALOGUE_FACTS } from "../application";
import { DECORATION_IDS, MILESTONE_IDS } from "../domain";

const stableIdSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)+$/u);
const textKeySchema = stableIdSchema;
const localeSchema = z.string().regex(/^[a-z]{2}-[A-Z]{2}$/u);
const isoUtcSchema = z.iso.datetime({ offset: false });

export const dialogueConditionSchema = z.strictObject({
  fact: z.enum(DIALOGUE_FACTS),
  operator: z.enum(["eq", "gte", "lte"]),
  value: z.number().nonnegative(),
});

export const dialogueDefinitionSchema = z.strictObject({
  characterId: stableIdSchema,
  conditions: z.array(dialogueConditionSchema),
  cooldownHours: z.number().nonnegative(),
  events: z.array(z.enum(DIALOGUE_EVENTS)).min(1),
  id: stableIdSchema,
  once: z.boolean(),
  priority: z.int(),
  textKey: textKeySchema,
});

export const characterDefinitionSchema = z.strictObject({
  dialogueEvents: z.array(z.enum(DIALOGUE_EVENTS)).min(1),
  eyebrowKey: textKeySchema,
  id: stableIdSchema,
  nameKey: textKeySchema,
  panelTitleKey: textKeySchema,
});

export const roomDefinitionSchema = z.strictObject({
  characterIds: z.array(stableIdSchema),
  decorationIds: z.array(stableIdSchema),
  id: stableIdSchema,
  nameKey: textKeySchema,
});

export const decorationDefinitionSchema = z.strictObject({
  descriptionKey: textKeySchema,
  id: stableIdSchema,
  nameKey: textKeySchema,
  state: z.enum(["available", "reserved", "unlockable"]),
});

export const milestoneRewardDefinitionSchema = z.strictObject({
  decorationId: z.enum(DECORATION_IDS),
  id: stableIdSchema,
  type: z.literal("decoration"),
});

export const milestoneConditionSchema = z.strictObject({
  fact: z.enum(["totalBooks", "totalNotes", "totalQuotes", "completedBooks"]),
  operator: z.literal("gte"),
  value: z.int().positive(),
});

export const milestoneDefinitionSchema = z.strictObject({
  conditions: z.array(milestoneConditionSchema).min(1),
  eventType: z.enum([
    "LibraryEntryCreated",
    "NoteCreated",
    "QuoteCreated",
    "LibraryEntryCompleted",
  ]),
  id: z.enum(MILESTONE_IDS),
  rewardIds: z.array(stableIdSchema),
  ruleVersion: z.int().positive(),
});

export const interfaceTextDefinitionSchema = z.strictObject({
  id: stableIdSchema,
  textKey: textKeySchema,
});

export const localizedContentSchema = z.strictObject({
  locale: localeSchema,
  messages: z.record(textKeySchema, z.string().trim().min(1)),
});

export const contentCatalogSchema = z.strictObject({
  characters: z.array(characterDefinitionSchema).min(1),
  decorations: z.array(decorationDefinitionSchema),
  defaultLocale: localeSchema,
  dialogues: z.array(dialogueDefinitionSchema).min(1),
  fallbacks: z.strictObject({
    "book.first-completed": stableIdSchema,
    "creature.interaction": stableIdSchema,
    "librarian.interaction": stableIdSchema,
  }),
  interfaceTexts: z.array(interfaceTextDefinitionSchema),
  locales: z.array(localizedContentSchema).min(1),
  milestones: z.array(milestoneDefinitionSchema).min(1),
  rewards: z.array(milestoneRewardDefinitionSchema),
  rooms: z.array(roomDefinitionSchema).min(1),
  version: z.int().positive(),
});

export const dialogueHistorySchema = z.strictObject({
  lastLibraryVisitAt: isoUtcSchema.optional(),
  lastShownAt: z.record(stableIdSchema, isoUtcSchema),
  shownOnceIds: z.array(stableIdSchema),
  version: z.literal(1),
});

export type ContentCatalog = z.infer<typeof contentCatalogSchema>;
export type LocalizedContent = z.infer<typeof localizedContentSchema>;

function duplicateIds(
  label: string,
  values: readonly { readonly id: string }[],
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of values) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates].map((id) => `${label}: ID duplicado ${id}`);
}

export function validateContentReferences(catalog: ContentCatalog): string[] {
  const issues = [
    ...duplicateIds("dialogues", catalog.dialogues),
    ...duplicateIds("characters", catalog.characters),
    ...duplicateIds("rooms", catalog.rooms),
    ...duplicateIds("decorations", catalog.decorations),
    ...duplicateIds("interfaceTexts", catalog.interfaceTexts),
    ...duplicateIds("milestones", catalog.milestones),
    ...duplicateIds("rewards", catalog.rewards),
  ];
  const localeIds = catalog.locales.map(({ locale }) => ({ id: locale }));
  issues.push(...duplicateIds("locales", localeIds));

  const dialogues = new Map(catalog.dialogues.map((item) => [item.id, item]));
  const characters = new Set(catalog.characters.map(({ id }) => id));
  const decorations = new Set(catalog.decorations.map(({ id }) => id));
  const rewards = new Map(catalog.rewards.map((reward) => [reward.id, reward]));
  const defaultMessages = catalog.locales.find(
    ({ locale }) => locale === catalog.defaultLocale,
  )?.messages;
  if (!defaultMessages)
    issues.push(`Locale padrão inexistente: ${catalog.defaultLocale}`);

  for (const event of DIALOGUE_EVENTS) {
    const fallback = dialogues.get(catalog.fallbacks[event]);
    if (!fallback || !fallback.events.includes(event))
      issues.push(`Fallback inválido para ${event}`);
  }
  for (const dialogue of catalog.dialogues) {
    if (!characters.has(dialogue.characterId))
      issues.push(`Personagem inexistente: ${dialogue.characterId}`);
  }
  for (const room of catalog.rooms) {
    for (const id of room.characterIds)
      if (!characters.has(id)) issues.push(`Personagem inexistente: ${id}`);
    for (const id of room.decorationIds)
      if (!decorations.has(id)) issues.push(`Decoração inexistente: ${id}`);
  }
  for (const milestone of catalog.milestones) {
    for (const rewardId of milestone.rewardIds) {
      if (!rewards.has(rewardId))
        issues.push(`Recompensa inexistente: ${rewardId}`);
    }
  }
  for (const reward of catalog.rewards) {
    if (reward.decorationId && !decorations.has(reward.decorationId))
      issues.push(`Decoração inexistente: ${reward.decorationId}`);
  }

  const referencedTextKeys = [
    ...catalog.dialogues.map(({ textKey }) => textKey),
    ...catalog.characters.flatMap(({ eyebrowKey, nameKey, panelTitleKey }) => [
      eyebrowKey,
      nameKey,
      panelTitleKey,
    ]),
    ...catalog.rooms.map(({ nameKey }) => nameKey),
    ...catalog.decorations.flatMap(({ descriptionKey, nameKey }) => [
      descriptionKey,
      nameKey,
    ]),
    ...catalog.interfaceTexts.map(({ textKey }) => textKey),
  ];
  for (const key of referencedTextKeys)
    if (!defaultMessages?.[key]) issues.push(`Chave inexistente: ${key}`);
  return issues;
}

export function parseContentCatalog(input: unknown): ContentCatalog {
  const catalog = contentCatalogSchema.parse(input);
  const issues = validateContentReferences(catalog);
  if (issues.length > 0)
    throw new Error(`CONTENT_INVALID: ${issues.join("; ")}`);
  return Object.freeze(catalog);
}
