import { expect, it } from "vitest";
import {
  cardContentSchema,
  cardPackManifestSchema,
  knowledgeTagSchema,
  emptyArcanarium,
  validateArcanarium,
  cardSchema,
  type KnowledgeTag,
} from "./arcanarium";
it("discriminates four semantic families without graphics or executable effects", () => {
  expect(
    cardContentSchema.parse({
      type: "flashcard",
      front: "  Pista\n",
      back: "Verso",
    }).type,
  ).toBe("flashcard");
  expect(
    cardContentSchema.parse({
      type: "memory",
      title: "Uma lembrança",
      entryIds: [],
    }).type,
  ).toBe("memory");
  expect(
    cardContentSchema.parse({
      type: "combat",
      name: "Criatura fictícia",
      attributes: { cost: 2 },
      effects: [{ definitionId: "draw", parameters: { count: 1 } }],
    }).type,
  ).toBe("combat");
  expect(
    cardContentSchema.safeParse({
      type: "combat",
      name: "X",
      attributes: {},
      effects: [{ script: "alert(1)" }],
    }).success,
  ).toBe(false);
  const question = {
    type: "question",
    statement: "Enunciado",
    alternatives: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
    ],
    correctAlternativeId: "a",
    explanation: "Explicação",
    classification: {
      primarySubjectId: "subject",
      knowledgeTagIds: ["subject", "skill"],
      personalTagIds: ["mine"],
    },
    source: { exam: "Prova fictícia", year: 2026, board: "Banca fictícia" },
  };
  expect(cardContentSchema.safeParse(question).success).toBe(true);
  expect(
    cardContentSchema.safeParse({
      ...question,
      correctAlternativeId: "missing",
    }).success,
  ).toBe(false);
  expect(
    cardContentSchema.safeParse({
      ...question,
      alternatives: [
        { id: "a", text: "A" },
        { id: "a", text: "B" },
      ],
    }).success,
  ).toBe(false);
  expect(
    cardContentSchema.safeParse({
      ...question,
      classification: {
        ...question.classification,
        knowledgeTagIds: ["skill"],
      },
    }).success,
  ).toBe(false);
});
it("validates taxonomy references, multiple classifications, personal/editorial separation and cycles without seeding a catalogue", () => {
  const tag = (id: string, level: KnowledgeTag["level"]): KnowledgeTag => ({
    id,
    revision: 1,
    label: id,
    namespace: level === "label" ? "personal" : "editorial",
    level,
    parentIds: [],
    relatedIds: [],
    synonyms: ["Sinônimo fictício"],
  });
  const data = emptyArcanarium();
  data.tags = [
    tag("area", "area"),
    { ...tag("subject", "subject"), parentIds: ["area"] },
    tag("skill", "skill"),
    tag("mine", "label"),
  ];
  const card = cardSchema.parse({
    id: "question",
    revision: 1,
    type: "question",
    origin: { kind: "local" },
    createdAt: "2026-11-08T12:00:00.000Z",
    updatedAt: "2026-11-08T12:00:00.000Z",
    archived: false,
    content: {
      type: "question",
      statement: "Enunciado",
      alternatives: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctAlternativeId: "a",
      classification: {
        primarySubjectId: "subject",
        knowledgeTagIds: ["subject", "skill"],
        personalTagIds: ["mine"],
      },
    },
  });
  data.cards = [card];
  data.versions = [{ cardId: card.id, revision: 1, card }];
  expect(() => validateArcanarium(data, new Set())).not.toThrow();
  expect(() =>
    validateArcanarium(
      { ...data, tags: data.tags.filter((t) => t.id !== "skill") },
      new Set(),
    ),
  ).toThrow();
  expect(() =>
    validateArcanarium(
      {
        ...data,
        tags: data.tags.map((t) =>
          t.id === "area" ? { ...t, parentIds: ["subject"] } : t,
        ),
      },
      new Set(),
    ),
  ).toThrow();
  expect(
    knowledgeTagSchema.safeParse({
      ...tag("mine", "label"),
      namespace: "editorial",
    }).success,
  ).toBe(false);
});
it("defines bounded package publication/integrity contracts without installing content", () => {
  const manifest = {
    id: "sample",
    version: "1",
    origin: "official",
    license: "Licença fictícia",
    expectedCount: 10,
    publishedCount: 2,
    files: [{ path: "cards.json", sha256: "a".repeat(64) }],
  };
  expect(cardPackManifestSchema.safeParse(manifest).success).toBe(true);
  expect(
    cardPackManifestSchema.safeParse({ ...manifest, publishedCount: 11 })
      .success,
  ).toBe(false);
  expect(
    cardPackManifestSchema.safeParse({
      ...manifest,
      files: [{ path: "cards.json", sha256: "invalid" }],
    }).success,
  ).toBe(false);
});
