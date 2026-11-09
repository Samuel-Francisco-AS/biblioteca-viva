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
