import { validateArcanarium } from "../../domain/arcanarium";
import type { BibliotecaDatabase } from "./database";
import { DexieArcanariumRepository } from "./arcanariumRepository";

const marker = "arcanarium.retired-combat.v1";
/** One atomic data repair for intermediate v19 installations. Unknown corruption
 * still fails validation and rolls back, including the completion marker. */
export async function retireCombatData(db: BibliotecaDatabase) {
  await db.transaction("rw", db.tables, async () => {
    if (await db.metadata.get(marker)) return;
    const cards = db.table<Record<string, unknown>>("arcanariumCards");
    const versions = db.table<Record<string, unknown>>("arcanariumVersions");
    const decks = db.table<Record<string, unknown>>("arcanariumDecks");
    const sessions = db.table<Record<string, unknown>>("cardSessions");
    const removed = new Set<string>();
    await cards
      .filter((c) => c.type === "combat")
      .each((c) => {
        if (typeof c.id === "string") removed.add(c.id);
      });
    await cards.filter((c) => c.type === "combat").delete();
    await versions
      .filter(
        (v) =>
          removed.has(String(v.cardId)) ||
          (typeof v.card === "object" &&
            v.card !== null &&
            "type" in v.card &&
            v.card.type === "combat"),
      )
      .delete();
    await decks.filter((d) => "combat" in d).delete();
    await db.studyCardLinks.filter((l) => removed.has(l.cardId)).delete();
    await sessions.filter((s) => s.kind === "combat_match").delete();
    // Educational containers keep their identity and all surviving references.
    await db.arcanariumDecks.toCollection().modify((d) => {
      if (d.selection.kind === "static")
        d.selection.cards = d.selection.cards.filter(
          (c) => !removed.has(c.cardId),
        );
      else
        d.selection.criteria.types = d.selection.criteria.types.filter(
          (t) => String(t) !== "combat",
        );
    });
    // A session snapshot cannot be shortened without changing answer positions.
    // Refuse ambiguous mixed sessions rather than damaging educational history.
    const data = await new DexieArcanariumRepository(db).read();
    const studies = await db.libraryEntries
      .filter((e) => e.type === "study")
      .primaryKeys();
    validateArcanarium(data, new Set(studies));
    await db.metadata.put({
      key: marker,
      value: "completed",
      updatedAt: "2026-11-12T00:00:00.000Z",
    });
  });
}
