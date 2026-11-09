/** Owned by a global memory card; immutable bytes may be referenced by old revisions. */
export interface CardMedia {
  readonly id: string;
  readonly cardId: string;
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
}
export type PreparedCardImage = Omit<CardMedia, "id" | "cardId">;
export interface CardMediaPort {
  list(): Promise<CardMedia[]>;
  get(id: string): Promise<CardMedia | undefined>;
  add(media: CardMedia): Promise<void>;
  delete(id: string): Promise<void>;
}
export function validateCardMediaOwnership(
  versions: readonly import("../domain/arcanarium").CardVersion[],
  media: readonly CardMedia[],
) {
  const ids = new Set(media.map((m) => m.id));
  if (ids.size !== media.length)
    throw new Error("Identidade de imagem duplicada.");
  const references = new Map<string, string>();
  for (const { card } of versions) {
    if (card.content.type !== "memory" || !card.content.imageId) continue;
    const id = card.content.imageId;
    if (references.has(id) && references.get(id) !== card.id)
      throw new Error("Imagem compartilhada entre proprietários diferentes.");
    references.set(id, card.id);
    if (!ids.has(id)) throw new Error("Imagem do Relicário ausente.");
  }
  if (media.some((m) => references.get(m.id) !== m.cardId))
    throw new Error("Imagem sem revisão proprietária.");
}
