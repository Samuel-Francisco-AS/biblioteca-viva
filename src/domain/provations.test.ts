import { describe, expect, it } from "vitest";
import {
  cardSchema,
  emptyArcanarium,
  type ArcanariumData,
  type KnowledgeTag,
  type DynamicCriteria,
} from "./arcanarium";
import {
  createTrial,
  isTrial,
  learningReport,
  reportCSV,
  selectDeck,
  transitionTrial,
  trialPresentation,
  trialScore,
  type Question,
} from "./provations";
const now = "2026-11-08T15:00:00.000Z";
const tags: KnowledgeTag[] = [
  {
    id: "area",
    revision: 1,
    label: "Ciências fictícias",
    namespace: "editorial",
    level: "area",
    parentIds: [],
    relatedIds: [],
    synonyms: [],
  },
  {
    id: "discipline",
    revision: 1,
    label: "Lógica fictícia",
    namespace: "editorial",
    level: "discipline",
    parentIds: ["area"],
    relatedIds: [],
    synonyms: [],
  },
  {
    id: "subject",
    revision: 1,
    label: "Padrões fictícios",
    namespace: "editorial",
    level: "subject",
    parentIds: ["discipline"],
    relatedIds: [],
    synonyms: ["Sequências fictícias"],
  },
  {
    id: "subsubject",
    revision: 1,
    label: "Relações fictícias",
    namespace: "editorial",
    level: "subsubject",
    parentIds: ["subject"],
    relatedIds: [],
    synonyms: [],
  },
  {
    id: "skill",
    revision: 1,
    label: "Comparar padrões",
    namespace: "editorial",
    level: "skill",
    parentIds: ["subsubject"],
    relatedIds: [],
    synonyms: [],
  },
  {
    id: "personal",
    revision: 1,
    label: "Revisar",
    namespace: "personal",
    level: "label",
    parentIds: [],
    relatedIds: [],
    synonyms: [],
  },
];
const question: Question = {
  type: "question",
  statement: "Qual a alternativa fictícia?",
  alternatives: [
    { id: "stable-a", text: "Resposta certa" },
    { id: "stable-b", text: "Outra resposta" },
  ],
  correctAlternativeId: "stable-a",
  explanation: "Uma explicação fictícia.",
  classification: {
    primarySubjectId: "subject",
    knowledgeTagIds: ["subject", "skill"],
    personalTagIds: ["personal"],
  },
  difficulty: "medium",
  source: { exam: "Exame fictício", year: 2026, board: "Banca fictícia" },
};
function fixture(n = 10): ArcanariumData {
  const data = emptyArcanarium();
  data.tags = structuredClone(tags);
  for (let i = 0; i < n; i++) {
    const c = cardSchema.parse({
      id: `q${String(i).padStart(2, "0")}`,
      revision: 1,
      type: "question",
      origin: { kind: "local" },
      createdAt: now,
      updatedAt: now,
      archived: false,
      content: question,
    });
    data.cards.push(c);
    data.versions.push({ cardId: c.id, revision: 1, card: c });
  }
  return data;
}
const criteria: Extract<DynamicCriteria, { version: 2 }> = {
  version: 2,
  types: ["question"],
  knowledgeTagIds: [],
  personalTagIds: [],
  history: "all",
  limit: 10,
};
function start(data: ArcanariumData, id = "s", time = now) {
  const s = createTrial(
    data,
    selectDeck(data, { kind: "dynamic", criteria }),
    id,
    time,
  );
  data.sessions.push(s);
  return s;
}
function apply(
  data: ArcanariumData,
  s: ReturnType<typeof start>,
  command: Parameters<typeof transitionTrial>[2],
  time = now,
) {
  const next = transitionTrial(data, s, command, time);
  data.sessions = data.sessions.map((old) => (old.id === s.id ? next : old));
  return next;
}
describe("deterministic concrete selection", () => {
  it("combines all filters, includes ancestors, clamps to collection and rejects absent tags", () => {
    const data = fixture(3);
    const select = (c: Partial<typeof criteria>) =>
      selectDeck(data, { kind: "dynamic", criteria: { ...criteria, ...c } });
    expect(
      select({
        knowledgeTagIds: ["area", "discipline", "subsubject"],
        personalTagIds: ["personal"],
        exam: " EXAME FICTÍCIO ",
        year: 2026,
        board: "banca fictícia",
        difficulty: "medium",
        origin: "local",
        limit: 30,
      }),
    ).toHaveLength(3);
    expect(select({ year: 2025 })).toEqual([]);
    expect(select({ exam: "Exame" })).toEqual([]);
    expect(select({ board: "Outra" })).toEqual([]);
    expect(select({ difficulty: "hard" })).toEqual([]);
    expect(() => select({ knowledgeTagIds: ["missing"] })).toThrow();
    data.cards.reverse();
    expect(select({ limit: 2 }).map((r) => r.cardId)).toEqual(["q00", "q01"]);
    expect(selectDeck(fixture(0), { kind: "dynamic", criteria })).toEqual([]);
  });
  it("executes original v1 criteria and fixed static revisions in saved order", () => {
    const data = fixture(2);
    expect(
      selectDeck(data, {
        kind: "dynamic",
        criteria: {
          version: 1,
          types: ["question"],
          knowledgeTagIds: ["area"],
          personalTagIds: [],
        },
      }),
    ).toHaveLength(2);
    const latest = {
      ...data.cards[0],
      revision: 2,
      content: { ...question, statement: "Nova" },
    };
    data.cards[0] = latest;
    data.versions.push({ cardId: latest.id, revision: 2, card: latest });
    expect(
      selectDeck(data, {
        kind: "static",
        cards: [{ cardId: "q01" }, { cardId: "q00", revision: 1 }],
      }),
    ).toEqual([
      { cardId: "q01", revision: 1 },
      { cardId: "q00", revision: 1 },
    ]);
    data.cards[1] = { ...data.cards[1], archived: true };
    expect(selectDeck(data, { kind: "dynamic", criteria })).toHaveLength(1);
  });
  it("filters never answered, any historical error and attempt bounds without double counting tags", () => {
    const data = fixture(3);
    let s = start(data);
    s = apply(data, s, { kind: "answer", alternativeId: "stable-b" });
    s = apply(data, s, { kind: "next" });
    apply(data, s, { kind: "answer", alternativeId: "stable-a" });
    const select = (c: Partial<typeof criteria>) =>
      selectDeck(data, {
        kind: "dynamic",
        criteria: { ...criteria, ...c },
      }).map((r) => r.cardId);
    expect(select({ history: "never" })).toEqual(["q02"]);
    expect(select({ history: "incorrect" })).toEqual(["q00"]);
    expect(
      select({ history: "answered", minAttempts: 1, maxAttempts: 1 }),
    ).toEqual(["q00", "q01"]);
    expect(select({ minAttempts: 2 })).toEqual([]);
  });
});
describe("trial integrity and correction", () => {
  it("runs ten questions, requires confirmation, blocks duplicate/out-of-order answers and scores honestly", () => {
    const data = fixture();
    let s = start(data);
    expect(s.cards).toHaveLength(10);
    expect(trialPresentation(data, s)).not.toHaveProperty("correction");
    expect(JSON.stringify(trialPresentation(data, s))).not.toContain(
      'stable-a","explanation',
    );
    expect(() => apply(data, s, { kind: "next" })).toThrow();
    expect(() =>
      apply(data, s, { kind: "answer", alternativeId: "missing" }),
    ).toThrow();
    for (let i = 0; i < 10; i++) {
      s = apply(data, s, {
        kind: "answer",
        alternativeId: i % 2 ? "stable-b" : "stable-a",
      });
      expect(trialPresentation(data, s).correction?.explanation).toBe(
        question.explanation,
      );
      expect(() =>
        apply(data, s, { kind: "answer", alternativeId: "stable-a" }),
      ).toThrow();
      s = apply(data, s, { kind: "next" });
    }
    expect(s.trial.status).toBe("completed");
    expect(trialScore(s)).toEqual({
      presented: 10,
      answered: 10,
      correct: 5,
      incorrect: 5,
      unanswered: 0,
      accuracy: 50,
    });
    expect(() => apply(data, s, { kind: "resume" })).toThrow();
  });
  it("pauses on correction, resumes after serialization and preserves keys, alternatives and taxonomy after edits", () => {
    const data = fixture(2);
    let s = start(data);
    s = apply(data, s, { kind: "answer", alternativeId: "stable-a" });
    s = apply(data, s, { kind: "pause" });
    expect(() =>
      apply(data, s, { kind: "answer", alternativeId: "stable-b" }),
    ).toThrow();
    const parsed: unknown = JSON.parse(JSON.stringify(s));
    const restored = data.sessions.find((v) => v.id === s.id);
    expect(parsed).toEqual(restored);
    const latest = {
      ...data.cards[0],
      revision: 2,
      content: {
        ...question,
        correctAlternativeId: "stable-b",
        alternatives: [...question.alternatives].reverse(),
      },
    };
    data.cards[0] = latest;
    data.versions.push({ cardId: latest.id, revision: 2, card: latest });
    data.tags[2] = { ...data.tags[2], revision: 2, label: "Outro nome" };
    s = apply(data, s, { kind: "resume" });
    expect(trialPresentation(data, s).correction?.correctAlternativeId).toBe(
      "stable-a",
    );
    expect(s.trial.taxonomy[2].label).toBe("Padrões fictícios");
    expect(s.cards).toHaveLength(2);
    s = apply(data, s, { kind: "complete" });
    expect(trialScore(s).unanswered).toBe(1);
    expect(trialScore(s).accuracy).toBe(100);
  });
  it("preserves confirmed answers when abandoned and rejects invalid/empty/duplicate references", () => {
    const data = fixture(1);
    let s = start(data);
    s = apply(data, s, { kind: "answer", alternativeId: "stable-b" });
    s = apply(data, s, { kind: "abandon" });
    expect(s.trial.status).toBe("abandoned");
    expect(trialScore(s).incorrect).toBe(1);
    expect(() => createTrial(data, [], "empty", now)).toThrow();
    expect(() =>
      createTrial(data, [...s.cards, ...s.cards], "dupe", now),
    ).toThrow();
    expect(() =>
      createTrial(data, [{ cardId: "q00", revision: 99 }], "bad", now),
    ).toThrow();
  });
});
describe("local educational reports", () => {
  it("distinguishes five repetitions from five independent questions and avoids duplicated totals", () => {
    const data = fixture(1);
    for (let i = 0; i < 5; i++) {
      const s = start(data, `s${i}`);
      apply(data, s, {
        kind: "answer",
        alternativeId: i ? "stable-a" : "stable-b",
      });
    }
    const report = learningReport(data, now);
    expect(report.summary).toMatchObject({
      attempts: 5,
      distinct: 1,
      repetitions: 4,
      correct: 4,
      incorrect: 1,
      evidence: "insuficiente",
    });
    expect(
      report.subjects.find((s) => s.classification.id === "subject"),
    ).toMatchObject({ attempts: 5, distinct: 1 });
    expect(
      report.subjects.find((s) => s.classification.id === "area"),
    ).toMatchObject({ attempts: 5 });
    expect(report.questions[0].history).toHaveLength(5);
    expect(report.subjects[0].trend).toBe("dados insuficientes");
    expect(reportCSV(report)).toContain('"Questões distintas"');
    expect(report.formatVersion).toBe(1);
  });
  it("reports only descriptive trends with sufficient diversity and different dates, and filters a period", () => {
    const data = fixture(6);
    let s = start(data);
    for (let i = 0; i < 6; i++) {
      s = apply(
        data,
        s,
        { kind: "answer", alternativeId: i < 3 ? "stable-b" : "stable-a" },
        i < 3 ? now : "2026-11-09T15:00:00.000Z",
      );
      s = apply(
        data,
        s,
        { kind: "next" },
        i < 3 ? now : "2026-11-09T15:00:00.000Z",
      );
    }
    const report = learningReport(data, "2026-11-09T16:00:00.000Z");
    expect(
      report.subjects.find((s) => s.classification.id === "subject")?.trend,
    ).toBe("acertos observados aumentaram");
    expect(
      learningReport(data, now, { from: now, to: "2026-11-08T23:59:59.999Z" })
        .summary.attempts,
    ).toBe(3);
  });
  it("keeps historical label revisions separate and escapes spreadsheet formulas in CSV", () => {
    const data = fixture(1);
    data.tags[2] = { ...data.tags[2], label: "=unsafe" };
    let s = start(data, "old");
    apply(data, s, { kind: "answer", alternativeId: "stable-a" });
    data.tags[2] = { ...data.tags[2], label: "Renomeado", revision: 2 };
    s = start(data, "new");
    s = apply(data, s, { kind: "answer", alternativeId: "stable-b" });
    const report = learningReport(data, now);
    expect(
      report.subjects.filter((s) => s.classification.id === "subject"),
    ).toHaveLength(2);
    expect(reportCSV(report)).toContain("'=unsafe");
    expect(report.summary.attempts).toBe(2);
    expect(isTrial(s)).toBe(true);
  });
});
