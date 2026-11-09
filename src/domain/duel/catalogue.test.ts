// @vitest-environment node
import fs from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { officialCards, officialEntries, starterDecks } from "./catalogue";
import { combatSnapshot } from "../../application/duels";
import { validateDuelDeck } from "./engine";
import { privateArcanarium } from "../packBackup";
import { emptyArcanarium, validateArcanarium } from "../arcanarium";
it("contains 48 stable, distinct official cards, all three types and four complete decks", () => {
  expect(officialCards).toHaveLength(48);
  expect(new Set(officialCards.map((c) => c.id)).size).toBe(48);
  expect(
    ["ruin", "knowledge", "bloom", "chaos", "neutral"].map(
      (a) => officialEntries.filter((e) => e.affinity === a).length,
    ),
  ).toEqual([10, 10, 10, 10, 8]);
  expect(new Set(officialEntries.map((e) => e.kind))).toEqual(
    new Set(["creature", "spell", "artifact"]),
  );
  for (const d of starterDecks) {
    if (!d.combat || d.selection.kind !== "static")
      throw new Error("Invalid starter");
    const cards = d.selection.cards.flatMap((r) =>
      Array.from({ length: d.combat!.copies[r.cardId] }, () =>
        combatSnapshot(officialCards.find((c) => c.id === r.cardId)!),
      ),
    );
    expect(cards).toHaveLength(24);
    validateDuelDeck(cards, d.combat.affinity, "official");
  }
  validateArcanarium(
    {
      ...emptyArcanarium(),
      cards: [...officialCards],
      versions: officialCards.map((card) => ({
        cardId: card.id,
        revision: card.revision,
        card,
      })),
      decks: [...starterDecks],
    },
    new Set(),
  );
});
it("ships 48 original safe illustrations with exact provenance hashes and distinct subjects", () => {
  const manifest = JSON.parse(
    fs.readFileSync("assets/duel/source/manifest.json", "utf8"),
  ) as {
    illustrations: {
      id: string;
      subject: string;
      file: string;
      sha256: string;
      bytes: number;
    }[];
  };
  expect(manifest.illustrations).toHaveLength(48);
  expect(new Set(manifest.illustrations.map((a) => a.subject)).size).toBe(48);
  for (const a of manifest.illustrations) {
    const data = fs.readFileSync(a.file);
    expect(data.byteLength).toBe(a.bytes);
    expect(createHash("sha256").update(data).digest("hex")).toBe(a.sha256);
    expect(data.toString()).not.toMatch(
      /<script|foreignObject|href=|<image|onload=|https?:\/\/(?!www.w3.org)/i,
    );
    expect(data.toString()).toContain("<title");
    expect(data.byteLength).toBeGreaterThan(6000);
  }
});
it("omits reinstallable catalog and starter decks from private backups, retains personal references", () => {
  const data = {
    ...emptyArcanarium(),
    cards: [...officialCards],
    versions: officialCards.map((card) => ({
      cardId: card.id,
      revision: card.revision,
      card,
    })),
    decks: [...starterDecks],
  };
  expect(privateArcanarium(data).cards).toHaveLength(0);
  expect(privateArcanarium(data).decks).toHaveLength(0);
  const cardId = officialCards[0].id;
  data.decks.push({
    ...starterDecks[0],
    id: "local:personal",
    origin: { kind: "local" },
    selection: { kind: "static", cards: [{ cardId }] },
    combat: undefined,
  });
  const projection = privateArcanarium(data);
  expect(projection.cards.map((c) => c.id)).toEqual([cardId]);
  expect(projection.versions).toHaveLength(1);
});
