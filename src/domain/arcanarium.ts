import { z } from "zod";

const id = z.string().min(1);
const text = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0);
const revision = z.int().positive();
const uniqueIds = z.array(id).refine((ids) => new Set(ids).size === ids.length);
export const cardOriginSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("local") }),
  z.strictObject({ kind: z.literal("study"), studyId: id, legacyCardId: id }),
  z.strictObject({
    kind: z.literal("official"),
    packId: id,
    itemId: id,
    version: text,
  }),
  z.strictObject({
    kind: z.literal("imported"),
    packId: id,
    itemId: id,
    version: text,
  }),
]);
export const classificationSchema = z
  .strictObject({
    primarySubjectId: id.optional(),
    knowledgeTagIds: uniqueIds,
    personalTagIds: uniqueIds,
  })
  .refine(
    (value) =>
      !value.primarySubjectId ||
      value.knowledgeTagIds.includes(value.primarySubjectId),
  );
export const cardContentSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("flashcard"),
    front: text.max(4000),
    back: text.max(8000),
  }),
  z
    .strictObject({
      type: z.literal("question"),
      statement: text,
      alternatives: z.array(z.strictObject({ id, text })).min(2),
      correctAlternativeId: id,
      explanation: text.optional(),
      classification: classificationSchema,
      source: z
        .strictObject({
          exam: text.optional(),
          year: z.int().positive().optional(),
          board: text.optional(),
          institution: text.optional(),
          booklet: text.optional(),
        })
        .optional(),
    })
    .refine(
      (value) =>
        new Set(value.alternatives.map((a) => a.id)).size ===
          value.alternatives.length &&
        value.alternatives.some((a) => a.id === value.correctAlternativeId),
    ),
  z.strictObject({
    type: z.literal("memory"),
    title: text,
    text: text.optional(),
    entryIds: uniqueIds,
  }),
  z.strictObject({
    type: z.literal("combat"),
    name: text,
    attributes: z.record(id, z.number().finite()),
    effects: z.array(
      z.strictObject({
        definitionId: id,
        parameters: z.record(
          id,
          z.union([z.string(), z.number().finite(), z.boolean()]),
        ),
      }),
    ),
  }),
]);
export const cardSchema = z
  .strictObject({
    id,
    revision,
    type: z.enum(["flashcard", "question", "memory", "combat"]),
    origin: cardOriginSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    archived: z.boolean(),
    content: cardContentSchema,
  })
  .refine(
    (card) =>
      card.type === card.content.type && card.updatedAt >= card.createdAt,
  );
export type Card = z.infer<typeof cardSchema>;
export type CardContent = z.infer<typeof cardContentSchema>;
export const cardVersionSchema = z
  .strictObject({ cardId: id, revision, card: cardSchema })
  .refine(
    (version) =>
      version.card.id === version.cardId &&
      version.card.revision === version.revision,
  );
export type CardVersion = z.infer<typeof cardVersionSchema>;
export const cardReferenceSchema = z.strictObject({ cardId: id, revision });
export type CardReference = z.infer<typeof cardReferenceSchema>;
export const deckSelectionSchema = z.discriminatedUnion("kind", [
  z
    .strictObject({
      kind: z.literal("static"),
      cards: z.array(
        z.strictObject({ cardId: id, revision: revision.optional() }),
      ),
    })
    .refine(
      (value) =>
        new Set(value.cards.map((c) => c.cardId)).size === value.cards.length,
    ),
  z.strictObject({
    kind: z.literal("dynamic"),
    criteria: z.strictObject({
      version: z.literal(1),
      types: z.array(z.enum(["flashcard", "question", "memory", "combat"])),
      knowledgeTagIds: uniqueIds,
      personalTagIds: uniqueIds,
    }),
  }),
]);
export const deckSchema = z
  .strictObject({
    id,
    name: text.max(160),
    revision,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    origin: cardOriginSchema,
    selection: deckSelectionSchema,
  })
  .refine((deck) => deck.updatedAt >= deck.createdAt);
export type Deck = z.infer<typeof deckSchema>;
export const studyCardLinkSchema = z.strictObject({
  studyId: id,
  legacyCardId: id.max(160),
  cardId: id,
  position: z.int().nonnegative(),
  active: z.boolean(),
});
export type StudyCardLink = z.infer<typeof studyCardLinkSchema>;
export const knowledgeTagSchema = z
  .strictObject({
    id,
    revision,
    label: text,
    namespace: z.enum(["editorial", "personal"]),
    level: z.enum([
      "area",
      "discipline",
      "subject",
      "subsubject",
      "skill",
      "label",
    ]),
    parentIds: uniqueIds,
    relatedIds: uniqueIds,
    synonyms: z.array(text),
  })
  .refine(
    (tag) =>
      !tag.parentIds.includes(tag.id) &&
      !tag.relatedIds.includes(tag.id) &&
      (tag.namespace !== "personal" || tag.level === "label") &&
      (tag.namespace !== "editorial" || tag.level !== "label"),
  );
export type KnowledgeTag = z.infer<typeof knowledgeTagSchema>;
export const cardSessionSchema = z.discriminatedUnion("kind", [
  z
    .strictObject({
      id,
      kind: z.literal("flashcard_review"),
      startedAt: z.iso.datetime(),
      cards: z.array(cardReferenceSchema).min(1),
      answers: z.array(
        z.strictObject({ recalled: z.boolean(), answeredAt: z.iso.datetime() }),
      ),
    })
    .refine(
      (s) =>
        s.answers.length <= s.cards.length &&
        s.answers.every(
          (a, i) =>
            a.answeredAt >= (i ? s.answers[i - 1].answeredAt : s.startedAt),
        ),
    ),
  z.strictObject({
    id,
    kind: z.literal("question_session"),
    startedAt: z.iso.datetime(),
    cards: z.array(cardReferenceSchema),
  }),
  z.strictObject({
    id,
    kind: z.literal("combat_match"),
    startedAt: z.iso.datetime(),
    cards: z.array(cardReferenceSchema),
    rulesetVersion: text,
  }),
]);
export type CardSession = z.infer<typeof cardSessionSchema>;
/** Contract only; installation/catalogue and media belong to BF-5.6D. */
export const cardPackManifestSchema = z
  .strictObject({
    id,
    version: text,
    origin: z.enum(["official", "external"]),
    license: text,
    expectedCount: z.int().nonnegative(),
    publishedCount: z.int().nonnegative(),
    files: z.array(
      z.strictObject({
        path: text,
        sha256: z.string().regex(/^[a-f0-9]{64}$/u),
      }),
    ),
  })
  .refine((pack) => pack.publishedCount <= pack.expectedCount);
export type CardPackManifest = z.infer<typeof cardPackManifestSchema>;
export const arcanariumDataSchema = z.strictObject({
  cards: z.array(cardSchema),
  versions: z.array(cardVersionSchema),
  decks: z.array(deckSchema),
  studyLinks: z.array(studyCardLinkSchema),
  tags: z.array(knowledgeTagSchema),
  sessions: z.array(cardSessionSchema),
});
export type ArcanariumData = z.infer<typeof arcanariumDataSchema>;
export function emptyArcanarium(): ArcanariumData {
  return {
    cards: [],
    versions: [],
    decks: [],
    studyLinks: [],
    tags: [],
    sessions: [],
  };
}
export function reviseCard(
  card: Card,
  content: CardContent,
  now: string,
): Card {
  if (now < card.updatedAt) throw new Error("Invalid revision chronology");
  return cardSchema.parse({
    ...card,
    content,
    revision: card.revision + 1,
    updatedAt: now,
  });
}

/** Cross-aggregate integrity, shared by persistence and backup boundaries. Origins are historical, not ownership. */
export function validateArcanarium(
  data: ArcanariumData,
  studies: ReadonlySet<string>,
): void {
  const unique = (ids: string[]) => {
    if (new Set(ids).size !== ids.length)
      throw new Error("Duplicate Arcanarium identity");
  };
  unique(data.cards.map((v) => v.id));
  unique(data.decks.map((v) => v.id));
  unique(data.tags.map((v) => v.id));
  unique(data.sessions.map((v) => v.id));
  unique(data.versions.map((v) => JSON.stringify([v.cardId, v.revision])));
  unique(
    data.studyLinks.map((v) => JSON.stringify([v.studyId, v.legacyCardId])),
  );
  const cards = new Map(data.cards.map((card) => [card.id, card]));
  const versions = new Map(
    data.versions.map((v) => [JSON.stringify([v.cardId, v.revision]), v.card]),
  );
  const tags = new Map(data.tags.map((tag) => [tag.id, tag]));
  const requireRef = (ref: { cardId: string; revision?: number }) => {
    if (
      !cards.has(ref.cardId) ||
      (ref.revision !== undefined &&
        !versions.has(JSON.stringify([ref.cardId, ref.revision])))
    )
      throw new Error("Missing card reference");
  };
  for (const card of data.cards) {
    const stored = versions.get(JSON.stringify([card.id, card.revision]));
    if (!stored || JSON.stringify(stored) !== JSON.stringify(card))
      throw new Error("Missing current revision");
    const history = data.versions
      .filter((version) => version.cardId === card.id)
      .sort((a, b) => a.revision - b.revision);
    if (
      history.length !== card.revision ||
      history.some(
        (version, index) =>
          version.revision !== index + 1 ||
          version.card.createdAt !== card.createdAt ||
          JSON.stringify(version.card.origin) !== JSON.stringify(card.origin) ||
          (index > 0 &&
            version.card.updatedAt < history[index - 1].card.updatedAt),
      )
    )
      throw new Error("Invalid revision history");
  }
  for (const version of data.versions) {
    const current = cards.get(version.cardId);
    if (
      !current ||
      version.revision > current.revision ||
      current.type !== version.card.type
    )
      throw new Error("Invalid revision");
    if (version.card.content.type === "question") {
      const c = version.card.content.classification;
      if (
        c.knowledgeTagIds.some(
          (id) => tags.get(id)?.namespace !== "editorial",
        ) ||
        c.personalTagIds.some((id) => tags.get(id)?.namespace !== "personal")
      )
        throw new Error("Missing classification");
      if (
        c.primarySubjectId &&
        !["subject", "subsubject"].includes(
          tags.get(c.primarySubjectId)?.level ?? "",
        )
      )
        throw new Error("Invalid primary subject");
    }
  }
  for (const deck of data.decks) {
    if (deck.selection.kind === "static")
      deck.selection.cards.forEach(requireRef);
    else if (
      deck.selection.criteria.knowledgeTagIds.some(
        (id) => tags.get(id)?.namespace !== "editorial",
      ) ||
      deck.selection.criteria.personalTagIds.some(
        (id) => tags.get(id)?.namespace !== "personal",
      )
    )
      throw new Error("Missing filter tag");
  }
  for (const link of data.studyLinks) {
    if (
      cards.get(link.cardId)?.type !== "flashcard" ||
      (link.active && !studies.has(link.studyId))
    )
      throw new Error("Invalid study link");
  }
  for (const studyId of studies) {
    const active = data.studyLinks.filter(
      (link) => link.active && link.studyId === studyId,
    );
    unique(active.map((link) => String(link.position)));
    unique(active.map((link) => link.cardId));
    if (active.length > 1000) throw new Error("Too many study cards");
  }
  for (const session of data.sessions) {
    session.cards.forEach(requireRef);
    if (
      session.kind === "flashcard_review" &&
      session.cards.some(
        (ref) =>
          versions.get(JSON.stringify([ref.cardId, ref.revision]))?.type !==
          "flashcard",
      )
    )
      throw new Error("Invalid review card");
  }
  const levelOrder = {
    area: 0,
    discipline: 1,
    subject: 2,
    subsubject: 3,
    skill: 4,
    label: 5,
  };
  for (const tag of data.tags) {
    if (
      tag.namespace === "editorial" &&
      tag.parentIds.some((parent) => {
        const parentTag = tags.get(parent);
        return (
          parentTag !== undefined &&
          levelOrder[parentTag.level] >= levelOrder[tag.level]
        );
      })
    )
      throw new Error("Invalid taxonomy hierarchy");
    if (
      [...tag.parentIds, ...tag.relatedIds].some(
        (id) => tags.get(id)?.namespace !== tag.namespace,
      )
    )
      throw new Error("Missing taxonomy reference");
    const visit = (id: string, path: Set<string>) => {
      if (path.has(id)) throw new Error("Taxonomy cycle");
      const next = new Set(path).add(id);
      tags.get(id)?.parentIds.forEach((parent) => visit(parent, next));
    };
    visit(tag.id, new Set());
  }
}
