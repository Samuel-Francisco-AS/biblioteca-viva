import { cardAvailable, gradable } from "./educationalPacks";
import {
  cardSessionSchema,
  validateArcanarium,
  type ArcanariumData,
  type Card,
  type CardReference,
  type CardSession,
  type Deck,
  type KnowledgeTag,
} from "./arcanarium";
export type Question = Extract<Card["content"], { type: "question" }>;
export type Trial = Extract<CardSession, { kind: "question_session" }> & {
  trial: NonNullable<
    Extract<CardSession, { kind: "question_session" }>["trial"]
  >;
};
export const isTrial = (session: CardSession): session is Trial =>
  session.kind === "question_session" && !!session.trial;
export const normalizeKnowledge = (value: string) =>
  value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("pt-BR");
export function taxonomyClosure(
  ids: readonly string[],
  tags: readonly KnowledgeTag[],
): Set<string> {
  const byId = new Map(tags.map((t) => [t.id, t]));
  const result = new Set<string>();
  const visit = (id: string) => {
    if (result.has(id)) return;
    const tag = byId.get(id);
    if (!tag) throw new Error("Classificação inexistente.");
    result.add(id);
    tag.parentIds.forEach(visit);
  };
  ids.forEach(visit);
  return result;
}
export function questionAt(data: ArcanariumData, ref: CardReference): Question {
  const content = data.versions.find(
    (v) => v.cardId === ref.cardId && v.revision === ref.revision,
  )?.card.content;
  if (content?.type !== "question")
    throw new Error("Revisão de questão indisponível.");
  return content;
}
export function attempts(data: ArcanariumData) {
  const versions = new Map(
    data.versions.map((v) => [
      JSON.stringify([v.cardId, v.revision]),
      v.card.content,
    ]),
  );
  return data.sessions
    .filter(isTrial)
    .flatMap((s) =>
      s.trial.answers.map((a, i) => ({
        ...a,
        sessionId: s.id,
        cardId: s.cards[i].cardId,
        revision: s.cards[i].revision,
        classification: (() => {
          const q = versions.get(
            JSON.stringify([s.cards[i].cardId, s.cards[i].revision]),
          );
          if (q?.type !== "question") throw new Error("Revisão indisponível");
          return q.classification;
        })(),
        taxonomy: s.trial.taxonomy,
      })),
    )
    .sort((a, b) =>
      a.answeredAt < b.answeredAt
        ? -1
        : a.answeredAt > b.answeredAt
          ? 1
          : a.sessionId < b.sessionId
            ? -1
            : 1,
    );
}
/** All populated criteria are AND; tag lists are ALL, with ancestors included. v1 remains executable. */
export function selectDeck(
  data: ArcanariumData,
  selection: Deck["selection"],
): CardReference[] {
  if (selection.kind === "static")
    return selection.cards.flatMap((ref) => {
      const current = data.cards.find((c) => c.id === ref.cardId);
      const card = ref.revision
        ? data.versions.find(
            (v) => v.cardId === ref.cardId && v.revision === ref.revision,
          )?.card
        : current;
      if (!card) throw new Error("Referência de baralho indisponível.");
      return current &&
        cardAvailable(current, data) &&
        !card.archived &&
        gradable(card)
        ? [{ cardId: card.id, revision: card.revision }]
        : [];
    });
  const c = selection.criteria;
  for (const id of c.knowledgeTagIds)
    if (!data.tags.some((t) => t.id === id && t.namespace === "editorial"))
      throw new Error("Filtro editorial inexistente.");
  for (const id of c.personalTagIds)
    if (!data.tags.some((t) => t.id === id && t.namespace === "personal"))
      throw new Error("Etiqueta pessoal inexistente.");
  const history = attempts(data);
  const cards = data.cards
    .filter((card) => {
      if (
        !cardAvailable(card, data) ||
        !gradable(card) ||
        (c.types.length && !c.types.includes(card.type))
      )
        return false;
      const q = card.content.type === "question" ? card.content : undefined;
      const closure = taxonomyClosure(
        q?.classification.knowledgeTagIds ?? [],
        data.tags,
      );
      if (
        !c.knowledgeTagIds.every((id) => closure.has(id)) ||
        !c.personalTagIds.every((id) =>
          q?.classification.personalTagIds.includes(id),
        )
      )
        return false;
      if (c.version === 1) return true;
      const h = history.filter((a) => a.cardId === card.id);
      if (
        (c.origin && card.origin.kind !== c.origin) ||
        (c.exam &&
          normalizeKnowledge(q?.source?.exam ?? "") !==
            normalizeKnowledge(c.exam)) ||
        (c.board &&
          normalizeKnowledge(q?.source?.board ?? "") !==
            normalizeKnowledge(c.board)) ||
        (c.year !== undefined && q?.source?.year !== c.year) ||
        (c.difficulty && q?.difficulty !== c.difficulty)
      )
        return false;
      return !(
        (c.history === "never" && h.length) ||
        (c.history === "answered" && !h.length) ||
        (c.history === "incorrect" && !h.some((a) => !a.correct)) ||
        (c.minAttempts !== undefined && h.length < c.minAttempts) ||
        (c.maxAttempts !== undefined && h.length > c.maxAttempts)
      );
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return (c.version === 2 ? cards.slice(0, c.limit) : cards).map((card) => ({
    cardId: card.id,
    revision: card.revision,
  }));
}
export function createTrial(
  data: ArcanariumData,
  refs: CardReference[],
  id: string,
  now: string,
  deck?: Deck,
): Trial {
  if (
    !refs.length ||
    refs.length > 500 ||
    new Set(refs.map((r) => r.cardId)).size !== refs.length
  )
    throw new Error("Selecione de 1 a 500 questões distintas.");
  refs.forEach((ref) => {
    const q = questionAt(data, ref);
    if (
      q.editorial &&
      (q.editorial.status !== "valid" || q.editorial.answerKey !== "final")
    )
      throw new Error("Questão sem gabarito definitivo válido.");
    if (!data.cards.some((c) => c.id === ref.cardId && cardAvailable(c, data)))
      throw new Error("Questão arquivada.");
  });
  const session = cardSessionSchema.parse({
    id,
    kind: "question_session",
    startedAt: now,
    cards: refs,
    trial: {
      version: 1,
      revision: 1,
      status: "active",
      position: 0,
      updatedAt: now,
      answers: [],
      taxonomy: data.tags,
      ...(deck && {
        deck: { id: deck.id, name: deck.name, revision: deck.revision },
      }),
    },
  });
  if (!isTrial(session)) throw new Error("Sessão inválida.");
  return session;
}
export type TrialCommand =
  | { kind: "answer"; alternativeId: string }
  | { kind: "next" | "pause" | "resume" | "complete" | "abandon" };
export function transitionTrial(
  data: ArcanariumData,
  s: Trial,
  command: TrialCommand,
  now: string,
): Trial {
  if (
    now < s.trial.updatedAt ||
    ["completed", "abandoned"].includes(s.trial.status)
  )
    throw new Error("Esta sessão está encerrada ou a data é inválida.");
  const t = {
    ...s.trial,
    revision: s.trial.revision + 1,
    updatedAt: now,
    answers: [...s.trial.answers],
  };
  if (command.kind === "answer") {
    if (t.status !== "active" || t.answers.length !== t.position)
      throw new Error("Resposta já confirmada ou sessão pausada.");
    const q = questionAt(data, s.cards[t.position]);
    if (!q.alternatives.some((a) => a.id === command.alternativeId))
      throw new Error("Alternativa inexistente.");
    t.answers.push({
      alternativeId: command.alternativeId,
      correct: command.alternativeId === q.correctAlternativeId,
      answeredAt: now,
    });
  } else if (command.kind === "next") {
    if (t.status !== "active" || t.answers.length !== t.position + 1)
      throw new Error("Confirme uma resposta antes de avançar.");
    if (t.position + 1 === s.cards.length) {
      t.status = "completed";
      t.endedAt = now;
    } else t.position++;
  } else if (command.kind === "pause") t.status = "paused";
  else if (command.kind === "resume") t.status = "active";
  else {
    t.status = command.kind === "complete" ? "completed" : "abandoned";
    t.endedAt = now;
  }
  const next = { ...s, trial: t };
  validateArcanarium(
    {
      ...data,
      sessions: data.sessions.map((old) => (old.id === s.id ? next : old)),
    },
    new Set(data.studyLinks.filter((l) => l.active).map((l) => l.studyId)),
  );
  return next;
}
/** This DTO deliberately contains no correct answer or explanation before confirmation. */
export function trialPresentation(
  data: ArcanariumData,
  s: Trial,
  index = s.trial.position,
) {
  const q = questionAt(data, s.cards[index]);
  const answer = s.trial.answers[index];
  return {
    statement: q.statement,
    alternatives: q.alternatives,
    answer,
    ...(answer && {
      correction: {
        correctAlternativeId: q.correctAlternativeId,
        explanation: q.explanation,
      },
    }),
  };
}
export function trialScore(s: Trial) {
  const correct = s.trial.answers.filter((a) => a.correct).length,
    answered = s.trial.answers.length;
  return {
    presented: s.cards.length,
    answered,
    correct,
    incorrect: answered - correct,
    unanswered: s.cards.length - answered,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
  };
}
export const REPORT_LIMITATIONS = [
  "Desempenho observado; não é nota oficial, domínio ou probabilidade de aprovação.",
  "Sessões listadas intersectam o período e têm estatísticas integrais; totais de tentativas/assuntos usam respostas no período.",
  "Percentual usa respostas confirmadas como denominador; não respondidas são informadas separadamente.",
  "Repetições não são questões independentes. Assuntos sobrepostos não devem ser somados ao total.",
  "Evidência insuficiente indica menos de cinco questões distintas; é um limiar descritivo, sem precisão estatística.",
  "Tendência compara metades cronológicas apenas com três questões distintas em cada metade e datas diferentes; não estima aprendizagem causal.",
  "Inclui respostas confirmadas de sessões em andamento, pausadas e abandonadas. Não respondidas não viram erros.",
];
export function learningReport(
  data: ArcanariumData,
  generatedAt: string,
  period?: { from: string; to: string },
) {
  const rows = attempts(data).filter(
    (a) =>
      !period || (a.answeredAt >= period.from && a.answeredAt <= period.to),
  );
  const summarize = (values: typeof rows) => {
    const distinct = new Set(values.map((a) => a.cardId)).size,
      correct = values.filter((a) => a.correct).length;
    return {
      attempts: values.length,
      distinct,
      repetitions: values.length - distinct,
      correct,
      incorrect: values.length - correct,
      accuracy: values.length
        ? Math.round((correct / values.length) * 100)
        : null,
      evidence:
        distinct < 5
          ? "insuficiente"
          : "observações disponíveis; não certifica domínio",
    };
  };
  const groups = new Map<
    string,
    { classification: KnowledgeTag; rows: typeof rows }
  >();
  for (const a of rows) {
    const closure = taxonomyClosure(
      a.classification.knowledgeTagIds,
      a.taxonomy,
    );
    for (const tag of a.taxonomy.filter((t) => closure.has(t.id))) {
      const key = JSON.stringify(tag);
      const group = groups.get(key) ?? { classification: tag, rows: [] };
      group.rows.push(a);
      groups.set(key, group);
    }
  }
  const subjects = [...groups.values()]
    .map((g) => {
      const half = Math.floor(g.rows.length / 2),
        first = g.rows.slice(0, half),
        last = g.rows.slice(half);
      const enough =
        new Set(first.map((a) => a.cardId)).size >= 3 &&
        new Set(last.map((a) => a.cardId)).size >= 3 &&
        first[0]?.answeredAt.slice(0, 10) !==
          last.at(-1)?.answeredAt.slice(0, 10);
      const change = enough
        ? (summarize(last).accuracy ?? 0) - (summarize(first).accuracy ?? 0)
        : null;
      return {
        classification: g.classification,
        ...summarize(g.rows),
        trend:
          change === null
            ? "dados insuficientes"
            : change > 0
              ? "acertos observados aumentaram"
              : change < 0
                ? "acertos observados diminuíram"
                : "acertos observados estáveis",
      };
    })
    .sort((a, b) => b.incorrect - a.incorrect || a.distinct - b.distinct);
  const questions = [...new Set(rows.map((a) => a.cardId))].map((cardId) => ({
    cardId,
    ...summarize(rows.filter((a) => a.cardId === cardId)),
    history: rows
      .filter((a) => a.cardId === cardId)
      .map(({ sessionId, revision, alternativeId, correct, answeredAt }) => ({
        sessionId,
        revision,
        alternativeId,
        correct,
        answeredAt,
      })),
  }));
  const unexercised = data.tags.filter(
    (t) =>
      ["subject", "subsubject", "skill"].includes(t.level) &&
      !subjects.some((s) => s.classification.id === t.id),
  );
  return {
    kind: "biblioteca-viva-learning-report",
    formatVersion: 1,
    generatedAt,
    period: period ?? null,
    summary: summarize(rows),
    sessions: data.sessions
      .filter(isTrial)
      .filter(
        (s) =>
          !period ||
          (s.startedAt <= period.to &&
            (s.trial.endedAt ?? generatedAt) >= period.from),
      )
      .map((s) => ({
        id: s.id,
        startedAt: s.startedAt,
        status: s.trial.status,
        ...trialScore(s),
      })),
    subjects,
    questions,
    unexercised,
    taxonomy: data.tags,
    limitations: REPORT_LIMITATIONS,
  };
}
export function reportCSV(report: ReturnType<typeof learningReport>) {
  const cell = (value: string | number | null) =>
    `"${String(value ?? "")
      .replace(/^[=+@\-\t\r]/u, "'$&")
      .replaceAll('"', '""')}"`;
  return (
    "\ufeff" +
    [
      [
        "Classificação",
        "ID",
        "Revisão",
        "Questões distintas",
        "Tentativas",
        "Repetições",
        "Acertos",
        "Erros",
        "Acertos %",
        "Evidência",
        "Tendência",
      ],
      ...report.subjects.map((s) => [
        s.classification.label,
        s.classification.id,
        s.classification.revision,
        s.distinct,
        s.attempts,
        s.repetitions,
        s.correct,
        s.incorrect,
        s.accuracy,
        s.evidence,
        s.trend,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n")
  );
}
