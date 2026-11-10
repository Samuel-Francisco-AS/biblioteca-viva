// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import {
  createBook,
  createMovie,
  createSeries,
  createStudy,
  createWork,
  createPhysicalActivity,
  type StudyEntry,
} from "../../domain";
import { emptyArcanarium } from "../../domain/arcanarium";
import { ArcanariumService } from "../../application/arcanarium";
import { SaveFlashCard, DeleteFlashCard } from "../../application/flashCards";
import { ExportBackup, ImportBackup } from "../../application/backup";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V14 } from "./schema";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { DexieTransactionRunner } from "./transactionRunner";
import { DexieLibraryEntryDeletionStore } from "./bookDeletionStore";
import { promoteLegacyFlashCards } from "./promoteLegacyFlashCards";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import {
  JsonBackupCodec,
  canonicalize,
  checksumMaterial,
} from "../backup/backupCodec";
const now = "2026-11-08T12:00:00.000Z";
const names: string[] = [];
const opened: Dexie[] = [];
afterEach(async () => {
  opened.splice(0).forEach((db) => db.close());
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)));
});
function study(
  id = "study",
  cards = [
    { id: "same", front: "  Pista\ninteira  ", back: "\nVerso completo\n" },
  ],
): StudyEntry {
  return {
    ...createStudy({
      id,
      title: "Estudo fictício",
      progressUnit: "topics",
      createdAt: now,
    }),
    flashCards: cards,
  };
}
async function legacy(entries: unknown[]) {
  const name = `arcanarium-${crypto.randomUUID()}`;
  names.push(name);
  const db = new Dexie(name);
  opened.push(db);
  db.version(14).stores(DATABASE_SCHEMA_V14);
  await db.open();
  await db.table("libraryEntries").bulkAdd(entries);
  db.close();
  return name;
}
async function setup(name?: string) {
  name ??= await legacy([]);
  const db = new BibliotecaDatabase(name);
  opened.push(db);
  await db.open();
  const entries = new DexieLibraryEntryRepository(db);
  const repo = new DexieArcanariumRepository(db);
  const publish = vi.fn(() => {
    expect(Dexie.currentTransaction).toBeNull();
    return Promise.resolve();
  });
  const deps = {
    libraryEntries: entries,
    arcanarium: repo,
    transaction: new DexieTransactionRunner(db),
    clock: { now: () => Promise.resolve(now) },
    ids: { generate: () => Promise.resolve(crypto.randomUUID()) },
    events: { publish },
  };
  return {
    db,
    entries,
    repo,
    deps,
    publish,
    api: new ArcanariumService(deps),
    snapshots: new DexieBackupSnapshotStore(db),
    codec: new JsonBackupCodec(),
  };
}
it("upgrades an empty v14 additively and preserves all six record types", async () => {
  const records = [
    createBook({ id: "b", title: "Livro fictício", createdAt: now }),
    createMovie({ id: "m", title: "Filme fictício", createdAt: now }),
    createSeries({ id: "s", title: "Série fictícia", createdAt: now }),
    study("e", []),
    createWork({ id: "w", title: "Trabalho fictício", createdAt: now }),
    createPhysicalActivity({
      id: "p",
      title: "Treino fictício",
      createdAt: now,
      category: "cardio",
    }),
  ];
  const { db, repo } = await setup(await legacy(records));
  expect(await db.libraryEntries.toArray()).toEqual(
    [...records].sort((a, b) => a.id.localeCompare(b.id)),
  );
  expect(await repo.read()).toEqual(emptyArcanarium());
  expect(db.verno).toBe(19);
});
it("promotes multiple cards, disambiguates equal legacy IDs, preserves bytes/archive and reopens idempotently", async () => {
  const original = [
    study("a", [
      ...study().flashCards!,
      { id: "other", front: "Outra", back: "Resposta" },
    ]),
    study("b"),
  ];
  const { db, entries, repo, deps } = await setup(await legacy(original));
  const data = await repo.read();
  expect(data.cards).toHaveLength(3);
  expect(new Set(data.cards.map((c) => c.id)).size).toBe(3);
  expect(
    data.cards.find(
      (card) =>
        card.origin.kind === "study" &&
        card.origin.studyId === "a" &&
        card.origin.legacyCardId === "same",
    )?.content,
  ).toMatchObject({
    front: original[0].flashCards![0].front,
    back: original[0].flashCards![0].back,
  });
  expect(await db.libraryEntries.toArray()).toEqual(original);
  await deps.transaction.run(async () => {
    const tx = Dexie.currentTransaction;
    if (!tx) throw new Error("No transaction");
    await promoteLegacyFlashCards(tx);
  });
  db.close();
  await db.open();
  expect(await repo.read()).toEqual(data);
  expect((await entries.getById("a"))?.type).toBe("study");
});
it("rolls back an invalid upgrade and can recover on a later open", async () => {
  const invalid = study("z", [{ id: "invalid", front: " ", back: "Verso" }]);
  const name = await legacy([study("a"), invalid]);
  const db = new BibliotecaDatabase(name);
  opened.push(db);
  await expect(db.open()).rejects.toThrow();
  const old = new Dexie(name);
  opened.push(old);
  old.version(14).stores(DATABASE_SCHEMA_V14);
  await old.open();
  expect(await old.table("libraryEntries").count()).toBe(2);
  expect(old.verno).toBe(14);
  expect(old.tables.some((t) => t.name === "arcanariumCards")).toBe(false);
  await old.table("libraryEntries").put(study("z"));
  old.close();
  const recovered = await setup(name);
  expect((await recovered.repo.read()).cards).toHaveLength(2);
});
it("rolls back an interruption after promotion and repeats safely", async () => {
  const { db, deps, repo } = await setup();
  await db.libraryEntries.put(study());
  await expect(
    deps.transaction.run(async () => {
      const tx = Dexie.currentTransaction;
      if (!tx) throw new Error();
      await promoteLegacyFlashCards(tx);
      throw new Error("simulated interruption");
    }),
  ).rejects.toThrow("simulated interruption");
  expect((await repo.read()).cards).toHaveLength(0);
  await deps.transaction.run(async () => {
    const tx = Dexie.currentTransaction;
    if (!tx) throw new Error();
    await promoteLegacyFlashCards(tx);
  });
  expect((await repo.read()).cards).toHaveLength(1);
});
it("uses one editable source across study commands and global edits, preserves the archive, and rejects stale revisions", async () => {
  const { db, entries, deps, api, repo, publish } = await setup(
    await legacy([study()]),
  );
  const first = (await repo.read()).cards[0];
  const updated = await api.updateCard({
    cardId: first.id,
    expectedRevision: 1,
    content: { type: "flashcard", front: "Global", back: "Novo verso" },
  });
  expect(await entries.getById("study")).toMatchObject({
    flashCards: [{ front: "Global", revision: 2 }],
  });
  const result = await new SaveFlashCard(deps).execute({
    entryId: "study",
    cardId: "same",
    expectedRevision: 2,
    front: "Tela antiga",
    back: "Resposta",
  });
  expect(result.flashCards?.[0].revision).toBe(3);
  expect((await api.getCard(first.id))?.content).toMatchObject({
    front: "Tela antiga",
  });
  expect((await api.getVersion(first.id, 1))?.card.content).toMatchObject({
    front: study().flashCards![0].front,
  });
  expect(await db.libraryEntries.get("study")).toEqual({
    ...study(),
    revision: 3,
    updatedAt: now,
  });
  const before = await repo.read();
  await expect(
    api.updateCard({
      cardId: first.id,
      expectedRevision: updated.revision,
      content: { type: "flashcard", front: "Stale", back: "Stale" },
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  expect(await repo.read()).toEqual(before);
  expect(publish).toHaveBeenCalledTimes(2);
  await entries.save({ ...result, title: "Título revisto" });
  expect(await entries.getById("study")).toMatchObject({
    flashCards: [{ front: "Tela antiga" }],
  });
});
it("shares cards in ordered decks, rejects dangling references, revises memberships safely and deletes only a deck", async () => {
  const { api } = await setup();
  const a = await api.createCard({ type: "flashcard", front: "A", back: "a" });
  const b = await api.createCard({ type: "flashcard", front: "B", back: "b" });
  const one = await api.saveDeck({
    name: "Um",
    selection: {
      kind: "static",
      cards: [{ cardId: b.id }, { cardId: a.id, revision: 1 }],
    },
  });
  const two = await api.saveDeck({
    name: "Dois",
    selection: { kind: "static", cards: [{ cardId: a.id }] },
  });
  expect((await api.getDeck(one.id))?.selection).toEqual(one.selection);
  await expect(
    api.saveDeck({
      id: one.id,
      expectedRevision: 1,
      name: "Inválido",
      selection: { kind: "static", cards: [{ cardId: "missing" }] },
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  expect(await api.getDeck(one.id)).toEqual(one);
  const reordered = await api.saveDeck({
    id: one.id,
    expectedRevision: 1,
    name: "Um",
    selection: { kind: "static", cards: [{ cardId: a.id }, { cardId: b.id }] },
  });
  expect(reordered.revision).toBe(2);
  await expect(
    api.deleteDeck({ id: one.id, expectedRevision: 1 }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  await api.deleteDeck({ id: one.id, expectedRevision: 2 });
  expect(await api.getCard(a.id)).toEqual(a);
  expect(await api.getDeck(two.id)).toEqual(two);
  const dynamic = await api.saveDeck({
    name: "Filtro",
    selection: {
      kind: "dynamic",
      criteria: {
        version: 1,
        types: ["question"],
        knowledgeTagIds: [],
        personalTagIds: [],
      },
    },
  });
  expect(await api.getDeck(dynamic.id)).toEqual(dynamic);
});
it("detaches study cards without resurrection and preserves global cards, decks and review history after deleting origin", async () => {
  const { db, api, repo, deps } = await setup(await legacy([study()]));
  const card = (await repo.read()).cards[0];
  const deck = await api.saveDeck({
    name: "Conservado",
    selection: { kind: "static", cards: [{ cardId: card.id }] },
  });
  const review = await api.startReview([{ cardId: card.id, revision: 1 }]);
  await api.answerReview({ sessionId: review.id, index: 0, recalled: true });
  await new DeleteFlashCard(deps).execute({
    entryId: "study",
    cardId: "same",
    expectedRevision: 1,
  });
  await deps.transaction.run(async () => {
    const tx = Dexie.currentTransaction;
    if (!tx) throw new Error();
    await promoteLegacyFlashCards(tx);
  });
  expect((await repo.linksForStudy("study"))[0].active).toBe(false);
  await new DexieLibraryEntryDeletionStore(db).deleteLibraryEntry("study");
  expect(await api.getCard(card.id)).toEqual(card);
  expect(await api.getDeck(deck.id)).toEqual(deck);
  expect((await api.progress(card.id)).reviews).toBe(1);
  await expect(
    new SaveFlashCard(deps).execute({
      entryId: "study",
      front: "X",
      back: "Y",
    }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
});
it("snapshots review revisions/order, persists answers independently of live decks and rejects duplicate results", async () => {
  const { db, api, repo } = await setup();
  const card = await api.createCard({
    type: "flashcard",
    front: "Original",
    back: "Resposta",
  });
  const session = await api.startReview([{ cardId: card.id, revision: 1 }]);
  await api.updateCard({
    cardId: card.id,
    expectedRevision: 1,
    content: { type: "flashcard", front: "Editada", back: "Outra" },
  });
  await api.answerReview({ sessionId: session.id, index: 0, recalled: false });
  await expect(
    api.answerReview({ sessionId: session.id, index: 0, recalled: true }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  db.close();
  await db.open();
  expect((await repo.getSession(session.id))?.cards).toEqual([
    { cardId: card.id, revision: 1 },
  ]);
  expect((await api.getVersion(card.id, 1))?.card.content).toMatchObject({
    front: "Original",
  });
  expect(await api.progress(card.id)).toMatchObject({
    reviews: 1,
    recalled: 0,
  });
  await api.archiveCard({ cardId: card.id, expectedRevision: 2 });
  expect((await api.progress(card.id)).reviews).toBe(1);
});
it("round-trips v7 cards, tags, dynamic/static decks, tombstones, revisions and answers into empty/filled databases", async () => {
  const source = await setup(await legacy([study()]));
  const card = (await source.repo.read()).cards[0];
  await source.api.saveTag({
    id: "personal",
    revision: 1,
    label: "Minha etiqueta",
    namespace: "personal",
    level: "label",
    parentIds: [],
    relatedIds: [],
    synonyms: [],
  });
  await source.api.saveDeck({
    name: "Meu filtro",
    selection: {
      kind: "dynamic",
      criteria: {
        version: 1,
        types: ["flashcard"],
        knowledgeTagIds: [],
        personalTagIds: ["personal"],
      },
    },
  });
  const session = await source.api.startReview([
    { cardId: card.id, revision: 1 },
  ]);
  await source.api.answerReview({
    sessionId: session.id,
    index: 0,
    recalled: true,
  });
  await new DeleteFlashCard(source.deps).execute({
    entryId: "study",
    cardId: "same",
  });
  const data = await source.snapshots.read();
  const artifact = await source.codec.encode({
    appVersion: "test",
    createdAt: now,
    databaseVersion: 15,
    data,
  });
  expect(artifact.summary.formatVersion).toBe(11);
  await expect(
    source.codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 15,
      data: { ...data, arcanarium: { ...data.arcanarium!, studyLinks: [] } },
    }),
  ).rejects.toMatchObject({ code: "INVALID_BACKUP_DATA" });
  const target = await setup();
  const exporter = new ExportBackup(
    target.snapshots,
    target.codec,
    target.deps.clock,
    "test",
    15,
  );
  const files = {
    shareBackupFile: vi.fn(() => Promise.resolve("flow-finished" as const)),
  };
  const importer = new ImportBackup(
    target.snapshots,
    target.codec,
    exporter,
    files,
  );
  await importer.execute(artifact.content, "empty-destination");
  expect(await target.snapshots.read()).toEqual(data);
  await expect(
    importer.execute(artifact.content, "empty-destination"),
  ).rejects.toMatchObject({ code: "RESTORE_DECISION_REQUIRED" });
  await importer.execute(artifact.content);
  expect(files.shareBackupFile).toHaveBeenCalledTimes(1);
  expect(await target.snapshots.read()).toEqual(data);
  target.db.close();
  await target.db.open();
  expect(await target.repo.read()).toEqual(data.arcanarium);
});
it("imports an actual checksummed v6 after v15 is installed, promotes twice without duplicates, and replaces safely", async () => {
  const source = await setup();
  const snapshot = await source.snapshots.read();
  const {
    arcanarium: _ignored,
    cardMedia: _media,
    isEmpty: _empty,
    ...data
  } = snapshot;
  void _ignored;
  void _media;
  void _empty;
  const unsigned = {
    kind: "biblioteca-viva-backup",
    formatVersion: 6,
    createdAt: now,
    appVersion: "legacy-test",
    databaseVersion: 14,
    data: {
      ...data,
      libraryEntries: [
        study("a", [
          { id: "same", front: "Pista inteira", back: "Verso completo" },
        ]),
        study("b", [
          { id: "same", front: "Pista inteira", back: "Verso completo" },
        ]),
      ],
    },
    metadata: { policy: "replace" },
  };
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalize(checksumMaterial(unsigned))),
  );
  const digest = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const content = JSON.stringify({
    ...unsigned,
    integrity: { algorithm: "SHA-256", digest },
  });
  const validated = await source.codec.inspect(content);
  expect(validated.summary.formatVersion).toBe(6);
  await source.api.createCard({
    type: "memory",
    title: "Fictícia",
    entryIds: [],
  });
  await source.snapshots.replace(validated.data);
  const promoted = await source.repo.read();
  expect(promoted.cards).toHaveLength(2);
  await source.snapshots.replace(validated.data);
  expect(await source.repo.read()).toEqual(promoted);
  const before = await source.snapshots.read();
  await expect(
    source.snapshots.replace({
      ...validated.data,
      libraryEntries: [study("bad", [{ id: "x", front: " ", back: "y" }])],
    }),
  ).rejects.toThrow();
  expect(await source.snapshots.read()).toEqual(before);
  await expect(
    source.codec.inspect(content.replace("Pista", "Alterada")),
  ).rejects.toMatchObject({ code: "CHECKSUM_MISMATCH" });
});
it("rejects a corrupted v7 graph and rolls back a replacement failure after clearing tables", async () => {
  const { snapshots, api, codec, db } = await setup();
  const card = await api.createCard({
    type: "flashcard",
    front: "Pista",
    back: "Verso",
  });
  const before = await snapshots.read();
  const broken = {
    ...before,
    arcanarium: { ...before.arcanarium!, versions: [] },
  };
  await expect(
    codec.encode({
      appVersion: "test",
      createdAt: now,
      databaseVersion: 15,
      data: broken,
    }),
  ).rejects.toThrow();
  const hook = () => {
    throw new Error("simulated disk failure");
  };
  db.arcanariumCards.hook("creating", hook);
  await expect(snapshots.replace(before)).rejects.toThrow(
    "simulated disk failure",
  );
  db.arcanariumCards.hook("creating").unsubscribe(hook);
  expect(await snapshots.read()).toEqual(before);
  expect((await api.getCard(card.id))?.revision).toBe(1);
});

it("batches canonical study projections across entries without losing order, archival or invalid-reference checks", async () => {
  const name = await legacy(
    Array.from({ length: 12 }, (_, i) => study(`study-${i}`)),
  );
  const { db, entries, repo } = await setup(name);
  const get = vi.spyOn(db.arcanariumCards, "get");
  const batch = vi.spyOn(db.arcanariumCards, "bulkGet");
  const projected = await entries.list();
  expect(projected).toHaveLength(12);
  expect(
    projected.every(
      (e) =>
        e.type === "study" && e.flashCards?.[0].front === "  Pista\ninteira  ",
    ),
  ).toBe(true);
  expect(get).not.toHaveBeenCalled();
  expect(batch).toHaveBeenCalledOnce();
  const first = projected[0];
  if (first.type !== "study") throw new Error("Expected synthetic study");
  const id = first.flashCards![0].globalCardId!;
  const card = await repo.getCard(id);
  if (!card) throw new Error("Expected canonical card");
  await repo.putCard({ ...card, archived: true });
  expect(await entries.getById(first.id)).toMatchObject({ flashCards: [] });
  await db.arcanariumCards.delete(id);
  await expect(entries.getById(first.id)).rejects.toMatchObject({
    code: "DATABASE_READ_FAILED",
  });
});

it("reads the Arcanarium atomically in readonly mode without locking unrelated user tables", async () => {
  const { db, api } = await setup();
  const read = vi
    .spyOn(db.arcanariumCards, "toArray")
    .mockImplementation(() => {
      expect(Dexie.currentTransaction?.mode).toBe("readonly");
      expect(Dexie.currentTransaction?.storeNames).not.toContain(
        "libraryEntries",
      );
      return Dexie.Promise.resolve([]);
    });
  expect((await api.list()).cards).toEqual([]);
  expect(read).toHaveBeenCalledOnce();
});
