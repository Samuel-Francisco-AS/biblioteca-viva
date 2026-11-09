import { z } from "zod";
import type { CardMedia, CardMediaPort } from "../../application/cardMedia";
import { posterSchema } from "./media";
import type { BibliotecaDatabase } from "./database";
/** Reuse byte/dimension validation, never the posters table or its ownership. */
export const cardMediaSchema = z
  .strictObject({
    id: z.string().min(1).max(300),
    cardId: z.string().min(1).max(1000),
    dataUrl: posterSchema.shape.dataUrl,
    width: posterSchema.shape.width,
    height: posterSchema.shape.height,
  })
  .superRefine((m, ctx) => {
    if (
      !posterSchema.safeParse({
        entryId: m.cardId,
        dataUrl: m.dataUrl,
        width: m.width,
        height: m.height,
      }).success
    )
      ctx.addIssue({
        code: "custom",
        message: "Imagem do Relicário inválida.",
      });
  });
export class DexieCardMedia implements CardMediaPort {
  constructor(private readonly db: BibliotecaDatabase) {}
  async list() {
    return (await this.db.cardMedia.toArray()).map((m) =>
      cardMediaSchema.parse(m),
    );
  }
  async get(id: string) {
    const m = await this.db.cardMedia.get(id);
    return m ? cardMediaSchema.parse(m) : undefined;
  }
  async add(m: CardMedia) {
    await this.db.cardMedia.add(cardMediaSchema.parse(m));
  }
  async delete(id: string) {
    await this.db.cardMedia.delete(id);
  }
}
