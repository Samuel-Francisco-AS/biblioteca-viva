import type { PlacedObjectRepository } from "../../application";
import type { PlacedObject } from "../../application/world";
import type { BibliotecaDatabase } from "./database";
import { InfrastructureError } from "./errors";
import { persistedPlacedObjectSchema } from "./schema";

export class DexiePlacedObjectRepository implements PlacedObjectRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async getById(id: string): Promise<PlacedObject | undefined> {
    try {
      const stored: unknown = await this.database.placedObjects.get(id);
      return stored === undefined
        ? undefined
        : Object.freeze(persistedPlacedObjectSchema.parse(stored));
    } catch {
      throw new InfrastructureError(
        "DATABASE_READ_FAILED",
        "get_placed_object",
      );
    }
  }

  async list(): Promise<readonly PlacedObject[]> {
    try {
      return Object.freeze(
        (await this.database.placedObjects.toArray())
          .map((stored) =>
            Object.freeze(persistedPlacedObjectSchema.parse(stored)),
          )
          .sort((left, right) =>
            left.instanceId.localeCompare(right.instanceId),
          ),
      );
    } catch {
      throw new InfrastructureError(
        "DATABASE_READ_FAILED",
        "list_placed_objects",
      );
    }
  }

  async save(object: PlacedObject): Promise<void> {
    const parsed = persistedPlacedObjectSchema.safeParse(object);
    if (!parsed.success)
      throw new InfrastructureError(
        "DATABASE_WRITE_FAILED",
        "save_placed_object",
      );
    try {
      await this.database.placedObjects.put(parsed.data);
    } catch {
      throw new InfrastructureError(
        "DATABASE_WRITE_FAILED",
        "save_placed_object",
      );
    }
  }
}
