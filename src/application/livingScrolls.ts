import type { LibraryEntry, Note, Quote } from "../domain";

import type { LivingScroll } from "../contracts/livingScroll";
export type { LivingScroll } from "../contracts/livingScroll";
export function projectLivingScrolls(
  entries: readonly LibraryEntry[],
  notes: readonly Note[],
  quotes: readonly Quote[],
): readonly LivingScroll[] {
  const categories = new Map(entries.map((e) => [e.id, e.type]));
  const candidates: LivingScroll[] = [];
  for (const [kind, items] of [
    ["note", notes],
    ["quote", quotes],
  ] as const) {
    for (const item of items) {
      const category = categories.get(item.entryId);
      if (
        category !== "book" &&
        category !== "study" &&
        category !== "movie" &&
        category !== "series"
      )
        continue;
      candidates.push({
        id: `scroll:${kind}:${item.id}`,
        annotationId: item.id,
        entryId: item.entryId,
        kind,
        category,
        updatedAt: item.updatedAt,
      });
    }
  }
  candidates.sort(
    (a, b) =>
      b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id),
  );
  const unique = new Map<string, LivingScroll>();
  for (const candidate of candidates)
    if (!unique.has(candidate.id)) unique.set(candidate.id, candidate);
  return Object.freeze(
    [...unique.values()].slice(0, 10).map((c) => Object.freeze(c)),
  );
}
