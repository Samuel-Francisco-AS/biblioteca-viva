// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it } from "vitest";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V16 } from "./schema";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieTransactionRunner } from "./transactionRunner";
import { DexieCardMedia } from "./cardMedia";
import { ArcanariumService } from "../../application/arcanarium";
import { ArcanariumWorkshop } from "../../application/arcanariumWorkshop";
import { ProvationsService } from "../../application/provations";
import {
  JsonBackupCodec,
  canonicalize,
  checksumMaterial,
} from "../backup/backupCodec";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import {
  isTrial,
  learningReport,
  trialPresentation,
  type Question,
} from "../../domain/provations";
const now = "2026-11-08T15:00:00.000Z";
const databases: Dexie[] = [],
  names: string[] = [];
afterEach(async () => {
  databases.forEach((d) => d.close());
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
  databases.length = 0;
});
async function setup(name = `provations-${crypto.randomUUID()}`) {
  names.push(name);
  const db = new BibliotecaDatabase(name);
  databases.push(db);
  await db.open();
  const repo = new DexieArcanariumRepository(db),
    deps = {
      arcanarium: repo,
      cardMedia: new DexieCardMedia(db),
      libraryEntries: new DexieLibraryEntryRepository(db),
      transaction: new DexieTransactionRunner(db),
      clock: { now: () => Promise.resolve(now) },
      ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
      events: { publish: () => Promise.resolve() },
    };
  return {
    db,
    repo,
    api: new ArcanariumService(deps),
    workshop: new ArcanariumWorkshop(deps),
    trials: new ProvationsService(deps),
    snapshots: new DexieBackupSnapshotStore(db),
    backup: new JsonBackupCodec(),
  };
}
const question: Question = {
  type: "question",
  title: "Identificação fictícia",
  statement: "Enunciado fictício",
  alternatives: [
    { id: "a", text: "Correta" },
    { id: "b", text: "Incorreta" },
  ],
  correctAlternativeId: "a",
  explanation: "Resolução fictícia",
  classification: { knowledgeTagIds: [], personalTagIds: [] },
  source: {
    exam: "Prova fictícia",
    year: 2026,
    board: "Banca fictícia",
    institution: "Instituição fictícia",
    booklet: "Azul",
  },
  difficulty: "easy",
  provenance: "Autoria de teste",
};
async function taxonomy(api: ArcanariumService) {
  for (const [id, level, parent] of [
    ["area", "area", ""],
    ["discipline", "discipline", "area"],
    ["subject", "subject", "discipline"],
    ["subsubject", "subsubject", "subject"],
    ["skill", "skill", "subsubject"],
    ["personal", "label", ""],
  ])
    await api.saveTag({
      id,
      revision: 1,
      label: id,
      namespace: level === "label" ? "personal" : "editorial",
      level,
      parentIds: parent ? [parent] : [],
      relatedIds: [],
      synonyms: [],
    });
}
async function sign(value: object) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalize(checksumMaterial(value))),
  );
  return JSON.stringify({
    ...value,
    integrity: {
      algorithm: "SHA-256",
      digest: [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    },
  });
}
it("upgrades original v16 rows unchanged and reopens v17 idempotently", async () => {
  const name = `v16-${crypto.randomUUID()}`,
    old = new Dexie(name);
  databases.push(old);
  old.version(16).stores(DATABASE_SCHEMA_V16);
  await old.open();
  const row = {
    id: "legacy",
    revision: 1,
    type: "flashcard",
    content: {
      type: "flashcard",
      title: "Nome",
      front: "Frente independente",
      back: "Verso",
      appearance: { frame: "herbarium", theme: "astral" },
    },
    origin: { kind: "local" },
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await old.table("arcanariumCards").add(row);
  await old
    .table("arcanariumVersions")
    .add({ cardId: row.id, revision: 1, card: row });
  old.close();
  const { db, api } = await setup(name);
  expect(db.verno).toBe(17);
  expect(await api.getCard(row.id)).toEqual(row);
  db.close();
  await db.open();
  expect(await api.getCard(row.id)).toEqual(row);
  expect(await db.arcanariumVersions.count()).toBe(1);
});
it("saves author questions with taxonomy and metadata; rejects invalid keys and stale edits atomically", async () => {
  const { api, workshop, snapshots } = await setup();
  await taxonomy(api);
  const content = {
    ...question,
    classification: {
      primarySubjectId: "subject",
      knowledgeTagIds: ["subject", "skill"],
      personalTagIds: ["personal"],
    },
  };
  const c = await workshop.save({ content, studyIds: [], decks: [] });
  expect(c.content).toEqual(content);
  const next = await workshop.save({
    cardId: c.id,
    expectedRevision: 1,
    content: { ...content, alternatives: [...content.alternatives].reverse() },
    studyIds: [],
    decks: [],
  });
  expect(next.revision).toBe(2);
  expect((await api.getVersion(c.id, 1))?.card.content).toEqual(content);
  const before = await snapshots.read();
  for (const bad of [
    { ...content, correctAlternativeId: "missing" },
    {
      ...content,
      alternatives: [content.alternatives[0], content.alternatives[0]],
    },
    {
      ...content,
      classification: { knowledgeTagIds: ["missing"], personalTagIds: [] },
    },
  ])
    await expect(
      workshop.save({ content: bad, studyIds: [], decks: [] }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(
    workshop.save({
      cardId: c.id,
      expectedRevision: 1,
      content,
      studyIds: [],
      decks: [],
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  expect(await snapshots.read()).toEqual(before);
});
it("validates adjacent hierarchy, synonyms, duplicates, missing parents, cycles, personal tags and optimistic revisions", async () => {
  const { api, snapshots } = await setup();
  await taxonomy(api);
  const before = await snapshots.read(),
    area = (await api.list()).tags.find((t) => t.id === "area")!;
  for (const bad of [
    { ...area, id: "duplicate", label: " AREA " },
    { ...area, id: "synonym", label: "Other", synonyms: ["area"] },
    { ...area, id: "cycle", parentIds: ["subject"] },
    { ...area, id: "missing", level: "discipline", parentIds: ["none"] },
    { ...area, id: "skip", level: "subject", parentIds: ["area"] },
    {
      ...area,
      id: "personal2",
      namespace: "personal",
      level: "label",
      parentIds: ["area"],
    },
  ])
    await expect(api.saveTag(bad)).rejects.toThrow();
  expect(await snapshots.read()).toEqual(before);
  await api.saveTag(
    { ...area, revision: 2, label: "Novo nome", synonyms: ["Antigo nome"] },
    1,
  );
  await expect(
    api.saveTag({ ...area, revision: 2, label: "Conflito" }, 1),
  ).rejects.toMatchObject({ code: "CONFLICT" });
});
it("persists ten selections and ordered answers before advancing; reopens, resumes and preserves a changed answer key", async () => {
  const { api, workshop, trials, repo, db } = await setup();
  const refs = [];
  for (let i = 0; i < 10; i++) {
    const c = await workshop.save({
      content: { ...question, title: `Questão ${i}` },
      studyIds: [],
      decks: [],
    });
    refs.push({ cardId: c.id, revision: 1 });
  }
  const deck = await api.saveDeck({
    name: "Dez fictícias",
    selection: { kind: "static", cards: refs },
  });
  let s = await trials.start({ deckId: deck.id });
  expect(s.cards).toEqual(refs);
  s = await trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "a" },
  });
  expect(s.trial.position).toBe(0);
  expect(await repo.getSession(s.id)).toEqual(s);
  await expect(
    trials.command({
      sessionId: s.id,
      expectedRevision: 1,
      command: { kind: "answer", alternativeId: "b" },
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  s = await trials.command({
    sessionId: s.id,
    expectedRevision: s.trial.revision,
    command: { kind: "pause" },
  });
  db.close();
  await db.open();
  const recovered = await repo.getSession(s.id);
  expect(recovered).toEqual(s);
  await api.updateCard({
    cardId: refs[0].cardId,
    expectedRevision: 1,
    content: { ...question, correctAlternativeId: "b" },
  });
  s = await trials.command({
    sessionId: s.id,
    expectedRevision: s.trial.revision,
    command: { kind: "resume" },
  });
  expect(
    trialPresentation(await api.list(), s).correction?.correctAlternativeId,
  ).toBe("a");
  for (let i = 0; i < 10; i++) {
    if (i > 0)
      s = await trials.command({
        sessionId: s.id,
        expectedRevision: s.trial.revision,
        command: { kind: "answer", alternativeId: i % 2 ? "b" : "a" },
      });
    s = await trials.command({
      sessionId: s.id,
      expectedRevision: s.trial.revision,
      command: { kind: "next" },
    });
  }
  expect((await trials.report()).sessions[0]).toMatchObject({
    correct: 5,
    incorrect: 5,
    unanswered: 0,
    accuracy: 50,
    status: "completed",
  });
});
it("materializes dynamic v1/v2 criteria, preserves taxonomy meaning and selection after later insertions", async () => {
  const { api, trials } = await setup();
  await taxonomy(api);
  const c = await api.createCard({
    ...question,
    classification: {
      primarySubjectId: "subject",
      knowledgeTagIds: ["subject", "skill"],
      personalTagIds: ["personal"],
    },
  });
  const deck = await api.saveDeck({
    name: "Dinâmico",
    selection: {
      kind: "dynamic",
      criteria: {
        version: 1,
        types: ["question"],
        knowledgeTagIds: ["area"],
        personalTagIds: ["personal"],
      },
    },
  });
  expect(await trials.preview({ deckId: deck.id })).toEqual([
    { cardId: c.id, revision: 1 },
  ]);
  let s = await trials.start({ deckId: deck.id });
  await api.createCard(question);
  const area = (await api.list()).tags.find((t) => t.id === "area")!;
  await api.saveTag({ ...area, revision: 2, label: "Área renomeada" }, 1);
  s = await trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "b" },
  });
  expect(s.cards).toHaveLength(1);
  expect(
    (await trials.report()).subjects.find((t) => t.classification.id === "area")
      ?.classification.label,
  ).toBe("area");
  const selection = {
    kind: "dynamic",
    criteria: {
      version: 2,
      types: ["question"],
      knowledgeTagIds: [],
      personalTagIds: [],
      history: "incorrect",
      limit: 10,
      exam: "Prova fictícia",
      year: 2026,
      board: "Banca fictícia",
    },
  };
  expect(await trials.preview({ selection })).toEqual([
    { cardId: c.id, revision: 1 },
  ]);
});
it("rolls back interrupted response persistence and leaves no duplicate attempt", async () => {
  const { api, trials, db, snapshots } = await setup();
  const c = await api.createCard(question);
  const s = await trials.start({
    selection: { kind: "static", cards: [{ cardId: c.id }] },
  });
  const before = await snapshots.read();
  const fail = () => {
    throw new Error("disk interrupted");
  };
  db.cardSessions.hook("updating", fail);
  await expect(
    trials.command({
      sessionId: s.id,
      expectedRevision: 1,
      command: { kind: "answer", alternativeId: "a" },
    }),
  ).rejects.toMatchObject({ code: "PERSISTENCE_FAILED" });
  db.cardSessions.hook("updating").unsubscribe(fail);
  expect(await snapshots.read()).toEqual(before);
  expect((await trials.report()).summary.attempts).toBe(0);
});
it("round-trips v9 trials with snapshots and answers, rejects forged results and retains restore rollback", async () => {
  const a = await setup(),
    b = await setup();
  await taxonomy(a.api);
  const c = await a.api.createCard({
    ...question,
    classification: { knowledgeTagIds: ["skill"], personalTagIds: [] },
  });
  const s = await a.trials.start({
    selection: { kind: "static", cards: [{ cardId: c.id }] },
  });
  await a.trials.command({
    sessionId: s.id,
    expectedRevision: 1,
    command: { kind: "answer", alternativeId: "b" },
  });
  const before = await a.snapshots.read(),
    file = await a.backup.encode({
      data: before,
      appVersion: "test",
      databaseVersion: 17,
      createdAt: now,
    });
  expect(file.summary.formatVersion).toBe(9);
  await b.snapshots.replace((await b.backup.inspect(file.content)).data);
  expect(await b.snapshots.read()).toEqual(before);
  b.db.close();
  await b.db.open();
  expect((await b.trials.report()).summary).toMatchObject({
    attempts: 1,
    incorrect: 1,
    distinct: 1,
  });
  const corrupted = structuredClone(before);
  const saved = corrupted.arcanarium?.sessions.find(isTrial);
  if (!saved) throw new Error("fixture");
  saved.trial.answers[0].correct = true;
  await expect(
    a.backup.encode({
      data: corrupted,
      appVersion: "test",
      databaseVersion: 17,
      createdAt: now,
    }),
  ).rejects.toThrow();
  const fail = () => {
    throw new Error("restore interrupted");
  };
  b.db.cardSessions.hook("creating", fail);
  await expect(b.snapshots.replace(before)).rejects.toThrow();
  b.db.cardSessions.hook("creating").unsubscribe(fail);
  expect(await b.snapshots.read()).toEqual(before);
  expect(learningReport(await b.api.list(), now).kind).toBe(
    "biblioteca-viva-learning-report",
  );
});
it("imports an original checksummed v8 without C fields and rejects an oversized backup explicitly", async () => {
  const a = await setup(),
    b = await setup();
  await a.api.createCard({
    type: "flashcard",
    front: "Frente v8",
    back: "Verso v8",
  });
  const { isEmpty: _empty, ...data } = await a.snapshots.read();
  void _empty;
  const old = await sign({
    kind: "biblioteca-viva-backup",
    formatVersion: 8,
    databaseVersion: 16,
    appVersion: "original-b",
    createdAt: now,
    data,
    metadata: { policy: "replace" },
  });
  expect((await b.backup.inspect(old)).summary.formatVersion).toBe(8);
  await b.snapshots.replace((await b.backup.inspect(old)).data);
  expect((await b.api.list()).cards[0].content).toEqual({
    type: "flashcard",
    front: "Frente v8",
    back: "Verso v8",
  });
  await expect(
    b.backup.inspect(" ".repeat(10 * 1024 * 1024 + 1)),
  ).rejects.toMatchObject({ code: "BACKUP_TOO_LARGE" });
});
