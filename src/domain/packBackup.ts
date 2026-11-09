import { type ArcanariumData } from "./arcanarium";
import { packOwned } from "./educationalPacks";
/** Keep a contiguous revision chain only for public identities referenced by personal data.
 * No catalog-only statement is copied; restored receipts explicitly require reinstallation. */
export function privateArcanarium(data: ArcanariumData): ArcanariumData {
  const retained = new Set<string>();
  data.sessions.forEach((s) => s.cards.forEach((r) => retained.add(r.cardId)));
  const decks = data.decks.filter(
    (d) =>
      !(d.origin.kind === "official" && d.origin.packId === "duelo-arcano-v1"),
  );
  decks.forEach((d) => {
    if (d.selection.kind === "static")
      d.selection.cards.forEach((r) => retained.add(r.cardId));
  });
  data.studyLinks.forEach((l) => retained.add(l.cardId));
  const cards = data.cards.filter(
    (c) =>
      (!(
        c.origin.kind === "official" && c.origin.packId === "duelo-arcano-v1"
      ) &&
        !packOwned(c)) ||
      retained.has(c.id),
  );
  const ids = new Set(cards.map((c) => c.id));
  return {
    ...data,
    cards,
    decks,
    versions: data.versions.filter((v) => ids.has(v.cardId)),
    packs: (data.packs ?? []).map((p) => ({
      ...p,
      status: p.status === "removed" ? "removed" : "restore-required",
    })),
  };
}
