export type EssentialVisualId =
  | "floor"
  | "shelf"
  | "counter"
  | "librarian"
  | "creature"
  | "highlighted-book"
  | "ambient-light";

export type VisualFallbackKind =
  | "floorboards"
  | "wooden-shelf"
  | "wooden-counter"
  | "librarian-figure"
  | "round-creature"
  | "open-book"
  | "warm-overlay";

export type SemanticPositionId =
  | "room-floor"
  | "main-shelf"
  | "reading-counter"
  | "librarian-post"
  | "creature-path"
  | "recent-book-stand"
  | "ambient-light-area";

export interface VisualElementManifestEntry {
  readonly assetPath: string | null;
  readonly depth: number;
  readonly fallback: VisualFallbackKind;
  readonly id: EssentialVisualId;
  readonly interactive: boolean;
  readonly position: SemanticPositionId;
}

/**
 * Prompt 13 deliberately ships without binary art. Every optional asset path is
 * null and every essential element has an independent procedural fallback.
 */
export const LIBRARY_VISUAL_MANIFEST: readonly VisualElementManifestEntry[] = [
  {
    assetPath: null,
    depth: 0,
    fallback: "floorboards",
    id: "floor",
    interactive: false,
    position: "room-floor",
  },
  {
    assetPath: null,
    depth: 20,
    fallback: "wooden-shelf",
    id: "shelf",
    interactive: true,
    position: "main-shelf",
  },
  {
    assetPath: null,
    depth: 30,
    fallback: "wooden-counter",
    id: "counter",
    interactive: false,
    position: "reading-counter",
  },
  {
    assetPath: null,
    depth: 40,
    fallback: "librarian-figure",
    id: "librarian",
    interactive: true,
    position: "librarian-post",
  },
  {
    assetPath: null,
    depth: 45,
    fallback: "round-creature",
    id: "creature",
    interactive: true,
    position: "creature-path",
  },
  {
    assetPath: null,
    depth: 50,
    fallback: "open-book",
    id: "highlighted-book",
    interactive: true,
    position: "recent-book-stand",
  },
  {
    assetPath: null,
    depth: 60,
    fallback: "warm-overlay",
    id: "ambient-light",
    interactive: false,
    position: "ambient-light-area",
  },
] as const;

export const ESSENTIAL_VISUAL_IDS: readonly EssentialVisualId[] = [
  "floor",
  "shelf",
  "counter",
  "librarian",
  "creature",
  "highlighted-book",
  "ambient-light",
] as const;

export interface VisualAssetAvailability {
  readonly failedAssetIds: ReadonlySet<EssentialVisualId>;
  readonly loadedAssetIds: ReadonlySet<EssentialVisualId>;
}

export type VisualSourceChoice =
  | { readonly kind: "asset"; readonly path: string }
  | { readonly fallback: VisualFallbackKind; readonly kind: "fallback" };

export function resolveVisualSource(
  entry: VisualElementManifestEntry,
  availability: VisualAssetAvailability,
): VisualSourceChoice {
  if (
    entry.assetPath &&
    availability.loadedAssetIds.has(entry.id) &&
    !availability.failedAssetIds.has(entry.id)
  ) {
    return { kind: "asset", path: entry.assetPath };
  }
  return { fallback: entry.fallback, kind: "fallback" };
}

export function visualManifestEntry(
  id: EssentialVisualId,
): VisualElementManifestEntry {
  const entry = LIBRARY_VISUAL_MANIFEST.find(
    (candidate) => candidate.id === id,
  );
  if (!entry)
    throw new Error(`Elemento visual essencial não registrado: ${id}`);
  return entry;
}

export function validateVisualManifest(
  manifest: readonly VisualElementManifestEntry[],
): true {
  const ids = new Set<EssentialVisualId>();
  manifest.forEach((entry) => {
    if (ids.has(entry.id)) throw new Error(`ID visual duplicado: ${entry.id}`);
    ids.add(entry.id);
    if (!Number.isFinite(entry.depth) || entry.depth < 0)
      throw new Error(`Profundidade visual inválida: ${entry.id}`);
    if (
      entry.assetPath !== null &&
      (!entry.assetPath.startsWith("/assets/phaser/") ||
        /^(?:data:|https?:)/u.test(entry.assetPath))
    ) {
      throw new Error(`Caminho de asset inválido: ${entry.id}`);
    }
  });
  ESSENTIAL_VISUAL_IDS.forEach((id) => {
    if (!ids.has(id)) throw new Error(`Fallback essencial ausente: ${id}`);
  });
  return true;
}
