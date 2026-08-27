import type {
  PlacedObject,
  WorldStructureRepository,
  WorldStructureState,
} from "../../application";
import {
  validateWorldStructure,
  worldStructureSchema,
} from "../../application";
import type { BibliotecaDatabase } from "./database";
import {
  persistedPlacedObjectSchema,
  persistedWorldStructureSchema,
} from "./schema";

export class DexieWorldStructureRepository implements WorldStructureRepository {
  constructor(private readonly database: BibliotecaDatabase) {}

  async get(): Promise<WorldStructureState | undefined> {
    const stored: unknown =
      await this.database.worldStructures.get("world.main");
    if (!stored) return undefined;
    const state = persistedWorldStructureSchema.parse(stored);
    validateWorldStructure(state);
    return Object.freeze(state);
  }

  async initializeIfAbsent(
    state: WorldStructureState,
    recoverObjects: (
      objects: readonly PlacedObject[],
    ) => readonly PlacedObject[],
  ): Promise<WorldStructureState> {
    validateWorldStructure(state);
    const parsed = worldStructureSchema.parse(state);
    return this.database.transaction(
      "rw",
      [this.database.worldStructures, this.database.placedObjects],
      async () => {
        const current = await this.database.worldStructures.get(parsed.id);
        if (current) {
          const existing = persistedWorldStructureSchema.parse(current);
          validateWorldStructure(existing);
          return Object.freeze(existing);
        }
        const existingObjects = (
          await this.database.placedObjects.toArray()
        ).map((object) => persistedPlacedObjectSchema.parse(object));
        const recovered = recoverObjects(existingObjects).map((object) =>
          persistedPlacedObjectSchema.parse(object),
        );
        await this.database.worldStructures.add(parsed);
        if (recovered.length > 0) {
          await this.database.placedObjects.clear();
          await this.database.placedObjects.bulkAdd(recovered);
        }
        return Object.freeze(parsed);
      },
    );
  }

  async save(
    state: WorldStructureState,
    expectedRevision: number,
  ): Promise<WorldStructureState> {
    validateWorldStructure(state);
    const parsed = worldStructureSchema.parse(state);
    try {
      return await this.database.transaction(
        "rw",
        this.database.worldStructures,
        async () => {
          const current = await this.database.worldStructures.get(parsed.id);
          if (!current) throw new Error("missing_structure");
          const existing = persistedWorldStructureSchema.parse(current);
          if (existing.revision !== expectedRevision)
            throw new Error("stale_structure");
          await this.database.worldStructures.put(parsed);
          return Object.freeze(parsed);
        },
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "stale_structure")
        throw error;
      throw new Error("save_structure_failed", { cause: error });
    }
  }
}
