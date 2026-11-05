/** Renderer-neutral projection: deliberately excludes personal text and titles. */
export interface LivingScroll {
  readonly id: string;
  readonly annotationId: string;
  readonly entryId: string;
  readonly kind: "note" | "quote";
  readonly category: "book" | "study" | "movie" | "series";
  readonly updatedAt: string;
}
