// @vitest-environment node
import "fake-indexeddb/auto";
import Dexie from "dexie";
import { expect, it } from "vitest";
import fixture from "../../test/fixtures/backup-v11-tcg.json";
import { BibliotecaDatabase } from "./database";
import { DexieArcanariumRepository } from "./arcanariumRepository";
import { retireCombatData } from "./retireCombatData";
const now = "2026-11-12T00:00:00.000Z";
const educational = {
  id: "local:education",
  type: "flashcard",
  revision: 1,
  createdAt: now,
  updatedAt: now,
  archived: false,
  origin: { kind: "local" },
  content: { type: "flashcard", front: "Pista", back: "Resposta" },
};
for (const [name, tcg, education] of [
  ["clean", false, false],
  ["intermediate", true, false],
  ["mixed", true, true],
  ["educational", false, true],
] as const) {
  it(`repairs ${name} v19 atomically across reopen without repeated reset`, async () => {
    const db = new BibliotecaDatabase(`repair-${crypto.randomUUID()}`);
    try {
      await db.open();
      if (tcg) {
        await db
          .table("arcanariumCards")
          .bulkPut(fixture.data.arcanarium.cards);
        await db
          .table("arcanariumVersions")
          .bulkPut(fixture.data.arcanarium.versions);
        await db
          .table("arcanariumDecks")
          .bulkPut(fixture.data.arcanarium.decks);
      }
      if (tcg)
        await db
          .table("cardSessions")
          .bulkPut(fixture.data.arcanarium.sessions);
      const review = {
        id: "education-review",
        kind: "flashcard_review",
        startedAt: now,
        cards: [{ cardId: educational.id, revision: 1 }],
        answers: [],
      };
      if (education) {
        await db.table("cardSessions").put(review);
        await db.table("arcanariumCards").put(educational);
        await db
          .table("arcanariumVersions")
          .put({ cardId: educational.id, revision: 1, card: educational });
      }
      db.close();
      await db.open();
      if (tcg)
        await expect(
          new DexieArcanariumRepository(db).read(),
        ).rejects.toThrow();
      await retireCombatData(db);
      const repaired = await new DexieArcanariumRepository(db).read();
      expect(repaired.cards).toEqual(education ? [educational] : []);
      expect(repaired.decks).toEqual([]);
      expect(repaired.sessions).toEqual(education ? [review] : []);
      db.close();
      await db.open();
      await retireCombatData(db);
      expect(await new DexieArcanariumRepository(db).read()).toEqual(repaired);
      expect(db.verno).toBe(19);
    } finally {
      db.close();
      await Dexie.delete(db.name);
    }
  });
}
it("rolls back deletion and marker when surviving data is corrupt", async () => {
  const db = new BibliotecaDatabase(`rollback-${crypto.randomUUID()}`);
  try {
    await db.open();
    await db
      .table("arcanariumCards")
      .bulkPut([...fixture.data.arcanarium.cards, educational]);
    // Missing educational revision is unrelated corruption, never silently erased.
    await expect(retireCombatData(db)).rejects.toThrow(
      "Missing current revision",
    );
    db.close();
    await db.open();
    expect(await db.arcanariumCards.count()).toBe(
      fixture.data.arcanarium.cards.length + 1,
    );
    expect(
      await db.metadata.get("arcanarium.retired-combat.v1"),
    ).toBeUndefined();
  } finally {
    db.close();
    await Dexie.delete(db.name);
  }
});
it("preserves an educational deck while pruning its retired references", async () => {
  const db = new BibliotecaDatabase(`references-${crypto.randomUUID()}`);
  try {
    await db.open();
    await db
      .table("arcanariumCards")
      .bulkPut([...fixture.data.arcanarium.cards, educational]);
    await db
      .table("arcanariumVersions")
      .put({ cardId: educational.id, revision: 1, card: educational });
    await db.table("arcanariumDecks").put({
      id: "education-deck",
      name: "Coleção fictícia",
      revision: 1,
      createdAt: now,
      updatedAt: now,
      origin: { kind: "local" },
      selection: {
        kind: "static",
        cards: [
          { cardId: educational.id },
          { cardId: fixture.data.arcanarium.cards[0].id },
        ],
      },
    });
    db.close();
    await db.open();
    await retireCombatData(db);
    db.close();
    await db.open();
    expect(
      (await new DexieArcanariumRepository(db).read()).decks[0].selection,
    ).toEqual({ kind: "static", cards: [{ cardId: educational.id }] });
  } finally {
    db.close();
    await Dexie.delete(db.name);
  }
});
