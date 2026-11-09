import type { PackStore } from "../../application/educationalPacks";
import { packReceiptSchema, type PackReceipt } from "../../domain/packManifest";
import type { BibliotecaDatabase } from "./database";
export class DexiePackStore implements PackStore {
  constructor(private readonly db: BibliotecaDatabase) {}
  async list() {
    return (await this.db.educationalPacks.toArray()).map((p) =>
      packReceiptSchema.parse(p),
    );
  }
  async put(p: PackReceipt) {
    await this.db.educationalPacks.put(packReceiptSchema.parse(p));
  }
}
