// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V18 } from "./schema";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieTransactionRunner } from "./transactionRunner";
import { ArcanariumService } from "../../application/arcanarium";
import { DuelService } from "../../application/duels";
import { legalActions, replayDuel } from "../../domain/duel/engine";
import { officialCards } from "../../domain/duel/catalogue";
import { JsonBackupCodec } from "../backup/backupCodec";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
const now = "2026-11-09T12:00:00.000Z";
const dbs: Dexie[] = [],
  names: string[] = [];
afterEach(async () => {
  dbs.splice(0).forEach((d) => d.close());
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
async function setup(name = `duels-${crypto.randomUUID()}`) {
  if (!names.includes(name)) names.push(name);
  const db = new BibliotecaDatabase(name);
  dbs.push(db);
  await db.open();
  const repo = new DexieArcanariumRepository(db),
    deps = {
      arcanarium: repo,
      libraryEntries: new DexieLibraryEntryRepository(db),
      transaction: new DexieTransactionRunner(db),
      clock: { now: () => Promise.resolve(now) },
      ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
      events: { publish: () => Promise.resolve() },
    };
  return {
    db,
    repo,
    deps,
    api: new ArcanariumService(deps),
    duels: new DuelService(deps),
    store: new DexieBackupSnapshotStore(db),
    codec: new JsonBackupCodec(),
  };
}
async function deck(s: Awaited<ReturnType<typeof setup>>) {
  const copies: Record<string, number> = {};
  for (let i = 0; i < 12; i++) {
    const c = await s.api.createCard({
      type: "combat",
      name: `Sentinela fictícia ${i}`,
      attributes: {},
      effects: [],
      combat: {
        version: 1,
        kind: "creature",
        affinity: "neutral",
        cost: 1,
        attack: 2,
        health: 3,
        keywords: [],
        abilities: [],
        flavor: "Fixture",
        artId: "neutral-sentinel",
      },
    });
    copies[c.id] = 2;
  }
  return s.duels.saveDeck({
    name: "Baralho fictício",
    combat: { version: 1, affinity: "ruin", mode: "creator", copies },
  });
}
it("upgrades v18 without rewriting existing reserved cards", async () => {
  const name = `duels-upgrade-${crypto.randomUUID()}`;
  names.push(name);
  const old = new Dexie(name);
  dbs.push(old);
  old.version(18).stores(DATABASE_SCHEMA_V18);
  await old.open();
  const reserved = {
    id: "local:reserved",
    type: "combat",
    revision: 1,
    createdAt: now,
    updatedAt: now,
    archived: false,
    origin: { kind: "local" },
    content: { type: "combat", name: "Reservada", attributes: {}, effects: [] },
  };
  await old.table("arcanariumCards").add(reserved);
  old.close();
  const s = await setup(name);
  expect(s.db.verno).toBe(19);
  expect(await s.repo.getCard(reserved.id)).toEqual(reserved);
  s.db.close();
  const reopen = await setup(name);
  expect(await reopen.repo.getCard(reserved.id)).toEqual(reserved);
});
it("commits actions once, reopens exact state, retains snapshots after edits and keeps history", async () => {
  const s = await setup(),
    d = await deck(s);
  let session = await s.duels.start({
    deckId: d.id,
    opponentId: d.id,
    mode: "creator",
    seed: 29,
  });
  if (!session.duel) throw new Error("Missing duel");
  session = await s.duels.command(
    session.id,
    0,
    "first",
    0,
    legalActions(session.duel).find((a) => a.type === "play")!,
  );
  await expect(
    s.duels.command(session.id, 1, "first", 0, { type: "end" }),
  ).rejects.toThrow();
  const expected = structuredClone(session);
  s.db.close();
  const reopen = await setup(s.db.name);
  expect(await reopen.duels.get(session.id)).toEqual(expected);
  const c = (await reopen.api.list()).cards[0];
  await reopen.api.updateCard({
    cardId: c.id,
    expectedRevision: c.revision,
    content: { ...c.content, name: "Nome futuro" },
  });
  expect((await reopen.duels.get(session.id)).duel).toEqual(expected.duel);
  session = await reopen.duels.command(session.id, 1, "pause", 0, {
    type: "pause",
  });
  expect(session.duel?.status).toBe("paused");
  session = await reopen.duels.command(session.id, 2, "resume", 0, {
    type: "resume",
  });
  session = await reopen.duels.command(session.id, 3, "abandon", 0, {
    type: "abandon",
  });
  expect(replayDuel(session.duel!)).toEqual(session.duel);
  await reopen.duels.start({
    deckId: d.id,
    opponentId: d.id,
    mode: "creator",
    seed: 30,
  });
  expect(await reopen.duels.list()).toHaveLength(2);
});
it("preserves an authored combat card revision, deck and match across v11 restore", async () => {
  const s = await setup(),
    d = await deck(s);
  const session = await s.duels.start({
    deckId: d.id,
    opponentId: d.id,
    mode: "creator",
    seed: 32,
  });
  const authored = (await s.api.list()).cards.find(
    (card) => card.type === "combat",
  );
  if (!authored) throw new Error("Missing authored combat card");
  await s.api.updateCard({
    cardId: authored.id,
    expectedRevision: authored.revision,
    content: { ...authored.content, name: "Sentinela revisada" },
  });

  const reopened = await setup(s.db.name);
  expect(await reopened.duels.get(session.id)).toEqual(session);
  const artifact = await reopened.codec.encode({
    data: await reopened.store.read(),
    appVersion: "test",
    createdAt: now,
    databaseVersion: 19,
  });
  expect(artifact.summary.formatVersion).toBe(11);

  const inspected = await reopened.codec.inspect(artifact.content),
    target = await setup();
  await target.store.replace(inspected.data);
  const restored = await target.duels.get(session.id);
  expect(restored).toEqual(session);
  expect(replayDuel(restored.duel!)).toEqual(restored.duel);
  expect(await target.repo.getVersion(authored.id, 1)).toBeDefined();
  expect(await target.repo.getVersion(authored.id, 2)).toBeDefined();
  expect((await target.api.list()).decks).toHaveLength(1);
});
it("retains referenced official cards for historical matches without reseeding the catalogue", async () => {
  const s = await setup();
  await s.duels.ensureCatalogue();
  const session = await s.duels.start({
    deckId: "arcane-deck:chaos",
    opponentId: "arcane-deck:ruin",
    mode: "official",
    seed: 33,
  });
  const referenced = new Set(session.cards.map((card) => card.cardId));
  const unreferenced = officialCards.find((card) => !referenced.has(card.id));
  if (!unreferenced) throw new Error("Missing unreferenced official card");

  const artifact = await s.codec.encode({
    data: await s.store.read(),
    appVersion: "test",
    createdAt: now,
    databaseVersion: 19,
  });
  const inspected = await s.codec.inspect(artifact.content);
  const retained = inspected.data.arcanarium;
  if (!retained) throw new Error("Missing Arcanarium backup");
  expect(
    [...referenced].every((id) =>
      retained.cards.some((card) => card.id === id),
    ),
  ).toBe(true);
  expect(retained.cards.some((card) => card.id === unreferenced.id)).toBe(
    false,
  );
  expect(
    retained.decks.some(
      (deck) =>
        deck.origin.kind === "official" &&
        deck.origin.packId === "duelo-arcano-v1",
    ),
  ).toBe(false);

  const target = await setup();
  await target.store.replace(inspected.data);
  expect(await target.duels.get(session.id)).toEqual(session);
  expect(
    (
      await Promise.all(
        [...referenced].map(
          async (id) => (await target.repo.getCard(id)) !== undefined,
        ),
      )
    ).every(Boolean),
  ).toBe(true);
  expect((await target.duels.list()).map((match) => match.id)).toEqual([
    session.id,
  ]);
});
it("rolls back a failed save after write and restores v11 into a disposable database", async () => {
  const s = await setup(),
    d = await deck(s),
    session = await s.duels.start({
      deckId: d.id,
      opponentId: d.id,
      mode: "creator",
      seed: 31,
    });
  const original = s.repo.putSession.bind(s.repo);
  vi.spyOn(s.repo, "putSession").mockImplementationOnce(async (value) => {
    await original(value);
    throw new Error("Fictitious disk failure");
  });
  await expect(
    s.duels.command(session.id, 0, "end", 0, { type: "end" }),
  ).rejects.toMatchObject({
    code: "PERSISTENCE_FAILED",
    context: { operation: "transaction" },
  });
  expect(await s.duels.get(session.id)).toEqual(session);
  const artifact = await s.codec.encode({
    data: await s.store.read(),
    appVersion: "test",
    createdAt: now,
    databaseVersion: 19,
  });
  expect(artifact.summary.formatVersion).toBe(11);
  const inspected = await s.codec.inspect(artifact.content),
    target = await setup();
  await target.store.replace(inspected.data);
  expect(await target.duels.get(session.id)).toEqual(session);
});
it("installs the bundled catalogue idempotently, protects official cards and validates all deck constraints", async () => {
  const s = await setup();
  await s.duels.ensureCatalogue();
  await s.duels.ensureCatalogue();
  const data = await s.api.list();
  expect(data.cards).toHaveLength(48);
  expect(data.decks).toHaveLength(4);
  expect(data.versions).toHaveLength(48);
  const official = data.cards[0];
  await expect(
    s.api.updateCard({
      cardId: official.id,
      expectedRevision: 1,
      content: official.content,
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  const starter = data.decks[0];
  if (!starter.combat) throw new Error("Missing starter definition");
  for (const combat of [
    { ...starter.combat, copies: {} },
    {
      ...starter.combat,
      copies: { ...starter.combat.copies, [official.id]: 3 },
    },
    { ...starter.combat, affinity: "knowledge" },
  ])
    await expect(
      s.duels.saveDeck({ name: "Inválido", combat }),
    ).rejects.toThrow();
  const personal = await s.duels.saveDeck({
    name: "Meu baralho",
    combat: starter.combat,
  });
  expect(personal.combat).toEqual(starter.combat);
  await expect(
    s.api.saveDeck({
      id: personal.id,
      expectedRevision: 1,
      name: "Mistura",
      selection: { kind: "static", cards: [{ cardId: official.id }] },
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  const artifact = await s.codec.encode({
    data: await s.store.read(),
    appVersion: "test",
    databaseVersion: 19,
    createdAt: now,
  });
  const inspected = await s.codec.inspect(artifact.content);
  expect(inspected.data.arcanarium?.decks).toHaveLength(1);
  expect(inspected.data.arcanarium?.cards).toHaveLength(12);
  const target = await setup();
  await target.store.replace(inspected.data);
  await target.duels.ensureCatalogue();
  expect((await target.api.list()).cards).toHaveLength(48);
  const session = await target.duels.start({
    deckId: personal.id,
    opponentId: "arcane-deck:chaos",
    mode: "official",
    seed: 100,
  });
  expect(session.duel?.mode).toBe("official");
});
it("author workshop revisions preserve creators, reject arbitrary effects and allow explicit Free budget exceptions", async () => {
  const s = await setup();
  const { ArcanariumWorkshop } =
      await import("../../application/arcanariumWorkshop"),
    { DexieCardMedia } = await import("./cardMedia");
  const workshop = new ArcanariumWorkshop({
    ...s.deps,
    cardMedia: new DexieCardMedia(s.db),
  });
  const content = {
    type: "combat",
    name: "Criatura fictícia",
    attributes: {},
    effects: [],
    combat: {
      version: 1,
      kind: "creature",
      affinity: "ruin",
      cost: 2,
      attack: 2,
      health: 3,
      keywords: [],
      abilities: [],
      flavor: "Autoria fictícia",
      artId: "cinder-imp",
    },
  };
  const first = await workshop.save({ content, studyIds: [], decks: [] });
  const edited = await workshop.save({
    cardId: first.id,
    expectedRevision: 1,
    content: { ...content, name: "Nova revisão fictícia" },
    studyIds: [],
    decks: [],
  });
  expect(edited.revision).toBe(2);
  expect((await s.api.getVersion(first.id, 1))?.card.content).toEqual(content);
  await expect(
    workshop.save({
      cardId: first.id,
      expectedRevision: 1,
      content,
      studyIds: [],
      decks: [],
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  const powerful = {
    ...content,
    combat: { ...content.combat, cost: 1, attack: 8, health: 10 },
  };
  await expect(
    workshop.save({ content: powerful, studyIds: [], decks: [] }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(
    workshop.save({
      content: powerful,
      studyIds: [],
      decks: [],
      combatMode: "free",
    }),
  ).resolves.toMatchObject({ type: "combat" });
  await expect(
    workshop.save({
      content: {
        ...content,
        combat: {
          ...content.combat,
          abilities: [
            {
              id: "evil",
              trigger: "play",
              cost: 0,
              effects: [
                {
                  definitionId: "execute",
                  value: 1,
                  target: "enemy",
                  duration: "permanent",
                },
              ],
            },
          ],
        },
      },
      studyIds: [],
      decks: [],
      combatMode: "free",
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await s.duels.ensureCatalogue();
  const d = (await s.api.list()).decks[0];
  if (!d.combat) throw new Error("Missing deck");
  const personal = await s.duels.saveDeck({
    name: "Fictício",
    combat: d.combat,
  });
  await expect(
    workshop.save({
      content,
      studyIds: [],
      decks: [{ id: personal.id, expectedRevision: 1, included: true }],
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await s.api.archiveCard({ cardId: first.id, expectedRevision: 2 });
  expect((await s.api.getVersion(first.id, 1))?.card.archived).toBe(false);
});
it("imports original v6–v10 envelopes, rejects checksum tampering and verifies combat replay at backup boundaries", async () => {
  const s = await setup();
  const { canonicalize, checksumMaterial } =
    await import("../backup/backupCodec");
  async function sign(raw: object) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonicalize(checksumMaterial(raw))),
    );
    return JSON.stringify({
      ...raw,
      integrity: {
        algorithm: "SHA-256",
        digest: [...new Uint8Array(digest)]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      },
    });
  }
  for (const formatVersion of [6, 7, 8, 9, 10]) {
    const raw = {
      kind: "biblioteca-viva-backup",
      formatVersion,
      createdAt: now,
      appVersion: "test",
      databaseVersion: 18,
      metadata: { policy: "replace" },
      data: {
        libraryEntries: [],
        notes: [],
        quotes: [],
        activities: [],
        settings: [],
        milestones: [],
        sessions: [],
        tags: [],
        ...(formatVersion >= 7 && {
          arcanarium: {
            cards: [],
            versions: [],
            decks: [],
            studyLinks: [],
            tags: [],
            sessions: [],
            ...(formatVersion >= 10 && { packs: [] }),
          },
        }),
        ...(formatVersion >= 8 && { cardMedia: [] }),
      },
    };
    const file = await sign(raw);
    expect((await s.codec.inspect(file)).summary.formatVersion).toBe(
      formatVersion,
    );
    await expect(
      s.codec.inspect(
        file.replace('"appVersion":"test"', '"appVersion":"tampered"'),
      ),
    ).rejects.toThrow();
  }
  const d = await deck(s);
  await s.duels.start({
    deckId: d.id,
    opponentId: d.id,
    mode: "creator",
    seed: 10,
  });
  const snapshot = await s.store.read();
  const session = snapshot.arcanarium?.sessions[0];
  if (session?.kind !== "combat_match" || !session.duel)
    throw new Error("Missing session");
  session.duel.players[0].life = 19;
  await expect(
    s.codec.encode({
      data: snapshot,
      appVersion: "test",
      createdAt: now,
      databaseVersion: 19,
    }),
  ).rejects.toMatchObject({ code: "INVALID_BACKUP_DATA" });
});
it("round-trips a completed official match with combat events and frozen revisions in canonical backup", async () => {
  const s = await setup();
  await s.duels.ensureCatalogue();
  let session = await s.duels.start({
    deckId: "arcane-deck:chaos",
    opponentId: "arcane-deck:ruin",
    mode: "official",
    seed: 27,
  });
  const { chooseDuelAction } = await import("../../domain/duel/ai");
  while (session.duel && !session.duel.result) {
    const m = session.duel;
    session = await s.duels.command(
      session.id,
      m.revision,
      `official-${m.revision}`,
      m.active,
      chooseDuelAction(m),
    );
  }
  expect(session.duel?.result).toBeDefined();
  expect(
    session.duel?.history.some((h) => h.events.some((e) => e.source)),
  ).toBe(true);
  const file = await s.codec.encode({
    data: await s.store.read(),
    appVersion: "test",
    createdAt: now,
    databaseVersion: 19,
  });
  const valid = await s.codec.inspect(file.content);
  const target = await setup();
  await target.store.replace(valid.data);
  expect(await target.duels.get(session.id)).toEqual(session);
});
it("keeps educational reviews, questions and memories independent while an official duel is paused", async () => {
  const s = await setup();
  await s.duels.ensureCatalogue();
  let duel = await s.duels.start({
    deckId: "arcane-deck:bloom",
    opponentId: "arcane-deck:chaos",
    mode: "official",
    seed: 42,
  });
  duel = await s.duels.command(duel.id, 0, "pause", 0, { type: "pause" });
  const { ArcanariumWorkshop } =
      await import("../../application/arcanariumWorkshop"),
    { DexieCardMedia } = await import("./cardMedia"),
    { ProvationsService } = await import("../../application/provations");
  const workshop = new ArcanariumWorkshop({
      ...s.deps,
      cardMedia: new DexieCardMedia(s.db),
    }),
    trials = new ProvationsService(s.deps);
  const echo = await workshop.save({
    content: {
      type: "flashcard",
      front: "Pista fictícia",
      back: "Resposta fictícia",
    },
    studyIds: [],
    decks: [],
  });
  const memory = await workshop.save({
    content: { type: "memory", title: "Lembrança fictícia", entryIds: [] },
    studyIds: [],
    decks: [],
  });
  expect(memory.content.type).toBe("memory");
  const review = await s.api.startReview([{ cardId: echo.id, revision: 1 }]);
  await s.api.answerReview({ sessionId: review.id, index: 0, recalled: true });
  const question = await workshop.save({
    content: {
      type: "question",
      statement: "Questão fictícia",
      alternatives: [
        { id: "a", text: "Correta" },
        { id: "b", text: "Incorreta" },
      ],
      correctAlternativeId: "a",
      classification: { knowledgeTagIds: [], personalTagIds: [] },
    },
    studyIds: [],
    decks: [],
  });
  const d = await s.api.saveDeck({
    name: "Questões fictícias",
    selection: { kind: "static", cards: [{ cardId: question.id }] },
  });
  let trial = await trials.start({ deckId: d.id });
  trial = await trials.command({
    sessionId: trial.id,
    expectedRevision: trial.trial.revision,
    command: { kind: "answer", alternativeId: "a" },
  });
  expect(trial.trial.answers[0].correct).toBe(true);
  expect(await s.duels.get(duel.id)).toEqual(duel);
  expect((await s.duels.list()).map((s) => s.id)).toEqual([duel.id]);
  const file = await s.codec.encode({
    data: await s.store.read(),
    appVersion: "test",
    createdAt: now,
    databaseVersion: 19,
  });
  const target = await setup();
  await target.store.replace((await s.codec.inspect(file.content)).data);
  expect(await target.duels.get(duel.id)).toEqual(duel);
  expect((await target.api.list()).sessions).toHaveLength(3);
});
