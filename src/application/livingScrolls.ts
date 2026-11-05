import type { LibraryEntry, Note, Quote } from "../domain";

/** Renderer-neutral projection: deliberately excludes personal text and titles. */
export interface LivingScroll {
  readonly id: string;
  readonly annotationId: string;
  readonly entryId: string;
  readonly kind: "note" | "quote";
  readonly category: "book" | "study" | "movie" | "series";
  readonly updatedAt: string;
}
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
