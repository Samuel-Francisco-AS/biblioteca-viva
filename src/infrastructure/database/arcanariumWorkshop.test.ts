// @vitest-environment node
import "fake-indexeddb/auto";
import { readFile } from "node:fs/promises";
import Dexie from "dexie";
import { afterEach, expect, it, vi } from "vitest";
import { createBook, createStudy } from "../../domain";
import { ArcanariumService } from "../../application/arcanarium";
import { ArcanariumWorkshop } from "../../application/arcanariumWorkshop";
import { CardExchange } from "../../application/cardExchange";
import { SaveFlashCard, DeleteFlashCard } from "../../application/flashCards";
import { BibliotecaDatabase } from "./database";
import { DATABASE_SCHEMA_V15 } from "./schema";
import { DexieCardMedia } from "./cardMedia";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { DexieLibraryEntryRepository } from "./repositories";
import { DexieLibraryEntryDeletionStore } from "./bookDeletionStore";
import { DexieTransactionRunner } from "./transactionRunner";
import { DexieBackupSnapshotStore } from "../backup/dexieBackupStore";
import {
  JsonBackupCodec,
  canonicalize,
  checksumMaterial,
} from "../backup/backupCodec";
import { JsonCardExchangeCodec } from "../files/cardExchangeCodec";
import { imageDimensions } from "../files/localImage";
const now = "2026-11-08T15:00:00.000Z";
const names: string[] = [],
  opened: Dexie[] = [];
afterEach(async () => {
  opened.splice(0).forEach((d) => d.close());
  await Promise.all(names.splice(0).map((n) => Dexie.delete(n)));
});
async function setup(name = `workshop-${crypto.randomUUID()}`) {
  names.push(name);
  const db = new BibliotecaDatabase(name);
  opened.push(db);
  await db.open();
  const repo = new DexieArcanariumRepository(db),
    media = new DexieCardMedia(db),
    entries = new DexieLibraryEntryRepository(db);
  const publish = vi.fn(() => {
    expect(Dexie.currentTransaction).toBeNull();
    return Promise.resolve();
  });
  const deps = {
    arcanarium: repo,
    cardMedia: media,
    libraryEntries: entries,
    transaction: new DexieTransactionRunner(db),
    clock: { now: () => Promise.resolve(now) },
    ids: {
      generate: (): Promise<string> => Promise.resolve(crypto.randomUUID()),
    },
    events: { publish },
  };
  const api = new ArcanariumService(deps),
    workshop = new ArcanariumWorkshop(deps),
    codec = new JsonCardExchangeCodec();
  return {
    db,
    repo,
    media,
    entries,
    deps,
    publish,
    api,
    workshop,
    codec,
    exchange: new CardExchange(deps, codec),
    snapshots: new DexieBackupSnapshotStore(db),
    backup: new JsonBackupCodec(),
  };
}
const echo = {
  type: "flashcard" as const,
  front: "O céu fictício?",
  back: "Violeta.",
  title: "Astronomia fictícia",
  appearance: { theme: "astral" as const, frame: "constellation" as const },
};
const memory = {
  type: "memory" as const,
  title: "O jardim fictício",
  text: "Uma obra que ficou.",
  entryIds: [],
  category: "Obra",
  appearance: { theme: "verdant" as const, frame: "herbarium" as const },
};
async function image() {
  const bytes = await readFile("e2e/fixtures/entertainment/ceu-ficticio.jpg");
  const { width, height } = imageDimensions(bytes);
  return {
    dataUrl: `data:image/jpeg;base64,${bytes.toString("base64")}`,
    width,
    height,
  };
}
async function signed(value: object) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalize(checksumMaterial(value))),
  );
  return JSON.stringify({
    ...value,
    integrity: {
      algorithm: "SHA-256",
      digest: [...new Uint8Array(hash)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    },
  });
}
it("upgrades v15 to current v17, preserving every existing aggregate and reopens without rewriting", async () => {
  const name = `v15-${crypto.randomUUID()}`,
    old = new Dexie(name);
  opened.push(old);
  old.version(15).stores(DATABASE_SCHEMA_V15);
  await old.open();
  const book = createBook({
    id: "book",
    title: "Livro fictício",
    createdAt: now,
  });
  await old.table("libraryEntries").add(book);
  old.close();
  const { db, api } = await setup(name);
  expect(db.verno).toBe(17);
  expect(await db.libraryEntries.get("book")).toEqual(book);
  expect(await db.cardMedia.count()).toBe(0);
  const card = await api.createCard(echo);
  db.close();
  await db.open();
  expect(await api.getCard(card.id)).toEqual(card);
});
it("saves canonical Echo with shared decks, study links, appearance and immutable versions atomically", async () => {
  const { db, workshop, api, entries, deps, publish } = await setup();
  await db.libraryEntries.add(
    createStudy({
      id: "study",
      title: "Estudo fictício",
      progressUnit: "topics",
      createdAt: now,
    }),
  );
  const a = await api.saveDeck({
      name: "Primeiro",
      selection: { kind: "static", cards: [] },
    }),
    b = await api.saveDeck({
      name: "Segundo",
      selection: { kind: "static", cards: [] },
    });
  const c = await workshop.save({
    content: echo,
    studyIds: ["study"],
    decks: [a, b].map((d) => ({
      id: d.id,
      expectedRevision: 1,
      included: true,
    })),
  });
  expect(await entries.getById("study")).toMatchObject({
    flashCards: [{ globalCardId: c.id, front: echo.front }],
  });
  expect((await api.getDeck(a.id))?.selection).toEqual({
    kind: "static",
    cards: [{ cardId: c.id }],
  });
  expect((await api.list()).cards).toHaveLength(1);
  expect(publish).toHaveBeenCalledTimes(1);
  const link = (await api.list()).studyLinks[0];
  await new SaveFlashCard(deps).execute({
    entryId: "study",
    cardId: link.legacyCardId,
    expectedRevision: 1,
    front: "Mudou pelo fólio",
    back: "Verso",
  });
  expect((await api.getCard(c.id))?.content).toMatchObject({
    front: "Mudou pelo fólio",
    appearance: echo.appearance,
    title: echo.title,
  });
  await new DeleteFlashCard(deps).execute({
    entryId: "study",
    cardId: link.legacyCardId,
    expectedRevision: 2,
  });
  expect(await entries.getById("study")).toMatchObject({ flashCards: [] });
  const latest = await api.getCard(c.id);
  await workshop.save({
    cardId: c.id,
    expectedRevision: 2,
    content: latest!.content,
    studyIds: ["study"],
    decks: [],
  });
  expect((await api.list()).studyLinks).toHaveLength(1);
  expect(await entries.getById("study")).toMatchObject({
    flashCards: [{ front: "Mudou pelo fólio" }],
  });
  await workshop.save({
    cardId: c.id,
    expectedRevision: 3,
    content: echo,
    studyIds: [],
    decks: [],
  });
  expect(await entries.getById("study")).toMatchObject({ flashCards: [] });
  await api.deleteDeck({ id: a.id, expectedRevision: 2 });
  expect(await api.getCard(c.id)).toBeDefined();
  expect((await api.getDeck(b.id))?.selection).toMatchObject({
    cards: [{ cardId: c.id }],
  });
});
it("rolls back card, media, links and deck on stale membership or injected disk failure", async () => {
  const { api, workshop, db, snapshots } = await setup();
  const d = await api.saveDeck({
    name: "Deck",
    selection: { kind: "static", cards: [] },
  });
  await api.saveDeck({
    id: d.id,
    expectedRevision: 1,
    name: "Outro",
    selection: d.selection,
  });
  const before = await snapshots.read();
  await expect(
    workshop.save({
      content: memory,
      image: await image(),
      studyIds: [],
      decks: [{ id: d.id, expectedRevision: 1, included: true }],
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  expect(await snapshots.read()).toEqual(before);
  const fail = () => {
    throw new Error("disk failure");
  };
  db.arcanariumVersions.hook("creating", fail);
  await expect(
    workshop.save({
      content: memory,
      image: await image(),
      studyIds: [],
      decks: [],
    }),
  ).rejects.toThrow();
  db.arcanariumVersions.hook("creating").unsubscribe(fail);
  expect(await snapshots.read()).toEqual(before);
});
it("rejects stale card edits and invalid input without changing the previous state", async () => {
  const { workshop, api, snapshots } = await setup();
  const c = await workshop.save({ content: echo, studyIds: [], decks: [] });
  await api.updateCard({
    cardId: c.id,
    expectedRevision: 1,
    content: { ...echo, front: "Outra tela" },
  });
  const before = await snapshots.read();
  await expect(
    workshop.save({
      cardId: c.id,
      expectedRevision: 1,
      content: echo,
      studyIds: [],
      decks: [],
    }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  await expect(
    workshop.save({
      content: { ...echo, front: " " },
      studyIds: [],
      decks: [],
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  await expect(
    workshop.save({ content: echo, studyIds: ["missing"], decks: [] }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  expect(await snapshots.read()).toEqual(before);
});
it("owns local memory images independently, keeps historical bytes and safe orphan references after origin deletion", async () => {
  const { db, workshop, api, media, snapshots } = await setup();
  const book = createBook({
    id: "book",
    title: "Livro fictício",
    createdAt: now,
  });
  await db.libraryEntries.add(book);
  const c = await workshop.save({
    content: { ...memory, entryIds: [book.id] },
    image: await image(),
    studyIds: [],
    decks: [],
  });
  expect(await media.list()).toHaveLength(1);
  expect(await db.media.count()).toBe(0);
  db.close();
  await db.open();
  expect(await api.getCard(c.id)).toEqual(c);
  await new DexieLibraryEntryDeletionStore(db).deleteLibraryEntry(book.id);
  expect((await api.getCard(c.id))?.content).toMatchObject({
    entryIds: [book.id],
  });
  const updated = await workshop.save({
    cardId: c.id,
    expectedRevision: 1,
    content: c.content,
    image: null,
    studyIds: [],
    decks: [],
  });
  expect(updated.content).not.toHaveProperty("imageId");
  expect(await media.list()).toHaveLength(1);
  const before = await snapshots.read();
  const owned = (await media.list())[0];
  await expect(
    workshop.save({
      content: { ...memory, imageId: owned.id },
      studyIds: [],
      decks: [],
    }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  expect(await snapshots.read()).toEqual(before);
  await db.cardMedia.add({ ...owned, id: "orphan" });
  await workshop.save({
    cardId: c.id,
    expectedRevision: 2,
    content: memory,
    studyIds: [],
    decks: [],
  });
  expect((await media.list()).map((m) => m.id)).toEqual([owned.id]);
  await api.archiveCard({ cardId: c.id, expectedRevision: 3 });
  expect(await media.list()).toHaveLength(1);
  expect((await api.getVersion(c.id, 1))?.card.content).toHaveProperty(
    "imageId",
    owned.id,
  );
});
it("rejects forged formats, dimensions, oversized images and absent or foreign ownership", async () => {
  const { workshop, api, snapshots } = await setup();
  const before = await snapshots.read(),
    valid = await image();
  for (const bad of [
    { ...valid, width: valid.width + 1 },
    { ...valid, dataUrl: "https://invalid/image.jpg" },
    { ...valid, dataUrl: "data:image/svg+xml,<script/>" },
    { ...valid, dataUrl: "x".repeat(350001) },
  ])
    await expect(
      workshop.save({ content: memory, image: bad, studyIds: [], decks: [] }),
    ).rejects.toThrow();
  await expect(
    api.createCard({ ...memory, imageId: "missing" }),
  ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  expect(await snapshots.read()).toEqual(before);
});
it("snapshots a round, rejects duplicate responses, reopens and resumes at the first unconfirmed card", async () => {
  const { api, workshop, db, repo } = await setup();
  const a = await workshop.save({ content: echo, studyIds: [], decks: [] }),
    b = await workshop.save({
      content: { ...echo, front: "Segunda" },
      studyIds: [],
      decks: [],
    });
  const s = await api.startReview(
    [a, b].map((c) => ({ cardId: c.id, revision: 1 })),
  );
  await api.answerReview({ sessionId: s.id, index: 0, recalled: true });
  await expect(
    api.answerReview({ sessionId: s.id, index: 0, recalled: false }),
  ).rejects.toMatchObject({ code: "CONFLICT" });
  db.close();
  await db.open();
  const resumed = await repo.getSession(s.id);
  expect(resumed).toMatchObject({ answers: [{ recalled: true }] });
  await api.updateCard({
    cardId: b.id,
    expectedRevision: 1,
    content: { ...echo, front: "Editada depois" },
  });
  expect((await api.getVersion(b.id, 1))?.card.content).toMatchObject({
    front: "Segunda",
  });
  await api.answerReview({ sessionId: s.id, index: 1, recalled: false });
  expect(await api.progress(a.id)).toMatchObject({ reviews: 1, recalled: 1 });
  expect(await api.progress(b.id)).toMatchObject({ reviews: 1, recalled: 0 });
});
it("round-trips v9 with B images and history; restores a checksummed original v7 without new fields", async () => {
  const source = await setup(),
    target = await setup();
  const c = await source.workshop.save({
    content: memory,
    image: await image(),
    studyIds: [],
    decks: [],
  });
  const before = await source.snapshots.read();
  const encoded = await source.backup.encode({
    data: before,
    appVersion: "test",
    databaseVersion: 16,
    createdAt: now,
  });
  expect(encoded.summary.formatVersion).toBe(9);
  await target.snapshots.replace(
    (await target.backup.inspect(encoded.content)).data,
  );
  expect(await target.snapshots.read()).toEqual(before);
  target.db.close();
  await target.db.open();
  expect(await target.api.getCard(c.id)).toEqual(c);
  const legacy = await setup();
  const originalV7Card = {
    type: "flashcard" as const,
    front: echo.front,
    back: echo.back,
  };
  await legacy.api.createCard(originalV7Card);
  const {
    cardMedia: _media,
    isEmpty: _empty,
    ...data
  } = await legacy.snapshots.read();
  void _media;
  void _empty;
  const content = await signed({
    kind: "biblioteca-viva-backup",
    formatVersion: 7,
    databaseVersion: 15,
    appVersion: "legacy",
    createdAt: now,
    data,
    metadata: { policy: "replace" },
  });
  const validated = await target.backup.inspect(content);
  expect(validated.summary.formatVersion).toBe(7);
  await target.snapshots.replace(validated.data);
  expect(await target.media.list()).toHaveLength(0);
  expect((await target.api.list()).cards[0].content).toEqual(originalV7Card);
});
it("rejects corrupt image graphs and restores atomically on failure after clearing v8 destination", async () => {
  const { workshop, snapshots, backup, db } = await setup();
  await workshop.save({
    content: memory,
    image: await image(),
    studyIds: [],
    decks: [],
  });
  const before = await snapshots.read();
  await expect(
    backup.encode({
      data: { ...before, cardMedia: [] },
      appVersion: "test",
      databaseVersion: 16,
      createdAt: now,
    }),
  ).rejects.toThrow();
  const fail = () => {
    throw new Error("write interrupted");
  };
  db.cardMedia.hook("creating", fail);
  await expect(snapshots.replace(before)).rejects.toThrow("write interrupted");
  db.cardMedia.hook("creating").unsubscribe(fail);
  expect(await snapshots.read()).toEqual(before);
});
it("exchanges a deck with both families, images and shared references as a fresh independent copy on each import", async () => {
  const source = await setup(),
    target = await setup();
  const a = await source.api.createCard(echo),
    b = await source.workshop.save({
      content: memory,
      image: await image(),
      studyIds: [],
      decks: [],
    });
  const deck = await source.api.saveDeck({
    name: "Coleção fictícia",
    selection: { kind: "static", cards: [{ cardId: b.id }, { cardId: a.id }] },
  });
  await source.api.saveDeck({
    name: "Compartilhado",
    selection: { kind: "static", cards: [{ cardId: a.id }] },
  });
  const content = await source.exchange.exportDeck(deck.id);
  const preview = await target.exchange.inspect(content);
  expect(preview.cards).toHaveLength(2);
  expect((await target.api.list()).cards).toHaveLength(0);
  const one = await target.exchange.importCopy(content),
    two = await target.exchange.importCopy(content);
  expect(one.id).not.toBe(two.id);
  const data = await target.api.list();
  expect(data.cards).toHaveLength(4);
  expect(new Set(data.cards.map((c) => c.id)).size).toBe(4);
  expect(data.cards.some((c) => c.id === a.id)).toBe(false);
  expect(await target.media.list()).toHaveLength(2);
  const roundtrip = await target.exchange.inspect(
    await target.exchange.exportDeck(one.id),
  );
  expect(roundtrip.cards.map((c) => c.content.type)).toEqual([
    "memory",
    "flashcard",
  ]);
  expect(roundtrip.cards[1].content).toEqual(echo);
});
it("rejects malformed, future, duplicate, foreign, tampered and oversized exchange files without partial writes", async () => {
  const { exchange, codec, snapshots } = await setup();
  const valid = {
    name: "Fictício",
    cards: [{ id: "external", content: echo }],
    media: [],
  };
  const content = await codec.encode(valid),
    before = await snapshots.read();
  const bads = [
    "{",
    content.replace('"formatVersion": 1', '"formatVersion": 9'),
    content.replace("Violeta", "Corrompido"),
    " ".repeat(10 * 1024 * 1024 + 1),
    await signed({
      kind: "biblioteca-viva-author-deck",
      formatVersion: 1,
      data: { ...valid, cards: [...valid.cards, ...valid.cards] },
    }),
    await signed({
      kind: "biblioteca-viva-author-deck",
      formatVersion: 1,
      data: {
        ...valid,
        cards: [
          {
            id: "memory",
            content: { ...memory, entryIds: ["private-origin"] },
          },
        ],
      },
    }),
  ];
  for (const bad of bads)
    await expect(exchange.importCopy(bad)).rejects.toThrow();
  expect(await snapshots.read()).toEqual(before);
});
it("rolls back exchange on generated ID collision and disk failure", async () => {
  const { exchange, codec, api, deps, snapshots, db } = await setup();
  const content = await codec.encode({
    name: "Fictício",
    cards: [{ id: "x", content: echo }],
    media: [],
  });
  const original = deps.ids.generate;
  deps.ids.generate = () => Promise.resolve("collision");
  const before = await snapshots.read();
  await expect(exchange.importCopy(content)).rejects.toMatchObject({
    code: "CONFLICT",
  });
  expect(await snapshots.read()).toEqual(before);
  deps.ids.generate = original;
  const fail = () => {
    throw new Error("disk");
  };
  db.arcanariumDecks.hook("creating", fail);
  await expect(exchange.importCopy(content)).rejects.toThrow();
  db.arcanariumDecks.hook("creating").unsubscribe(fail);
  expect(await snapshots.read()).toEqual(before);
  expect((await api.list()).cards).toHaveLength(0);
});
