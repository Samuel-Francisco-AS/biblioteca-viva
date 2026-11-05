import { z } from "zod";
import type { LocalPoster, PosterPort } from "../../application/media";
import { imageDimensions } from "../files/localImage";
import type { BibliotecaDatabase } from "./database";
export const posterSchema = z
  .strictObject({
    entryId: z.string().trim().min(1),
    dataUrl: z
      .string()
      .max(350000)
      .regex(/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/),
    width: z.int().min(1).max(1600),
    height: z.int().min(1).max(1600),
  })
  .superRefine((value, ctx) => {
    try {
      const bytes = Uint8Array.from(atob(value.dataUrl.split(",")[1]), (c) =>
        c.charCodeAt(0),
      );
      const d = imageDimensions(bytes);
      if (
        d.type !== "image/jpeg" ||
        d.width !== value.width ||
        d.height !== value.height
      )
        throw new Error();
    } catch {
      ctx.addIssue({ code: "custom", message: "Imagem de capa inválida" });
    }
  });
export class DexiePosters implements PosterPort {
  constructor(private readonly db: BibliotecaDatabase) {}
  async get(entryId: string) {
    const poster = await this.db.media.get(entryId);
    return poster ? posterSchema.parse(poster) : undefined;
  }
  async save(input: LocalPoster) {
    const poster = posterSchema.parse(input);
    await this.db.transaction(
      "rw",
      [this.db.media, this.db.libraryEntries],
      async () => {
        const owner = await this.db.libraryEntries.get(poster.entryId);
        if (
          !owner ||
          (owner.type !== "book" &&
            owner.type !== "movie" &&
            owner.type !== "series")
        )
          throw new Error("Obra não encontrada.");
        await this.db.media.put(poster);
      },
    );
  }
  async remove(entryId: string) {
    await this.db.media.delete(entryId);
  }
}
