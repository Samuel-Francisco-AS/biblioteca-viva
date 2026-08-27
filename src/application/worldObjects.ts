import {
  DEFAULT_PLACED_OBJECTS,
  TEST_OBJECT_DEFINITION_ID,
  TEST_OBJECT_INSTANCE_ID,
  defaultPlacedObject,
  placedObjectSchema,
  type PlacedObject,
} from "./world";
import { ApplicationError, toValidationError } from "./errors";
import { parseInput } from "./internal";
import { z } from "zod";

export interface PlacedObjectRepository {
  getById(id: string): Promise<PlacedObject | undefined>;
  list(): Promise<readonly PlacedObject[]>;
  save(object: PlacedObject): Promise<void>;
}

const transformSchema = z.strictObject({
  instanceId: z.string().trim().min(1),
  rotation: placedObjectSchema.shape.rotation,
  spaceId: placedObjectSchema.shape.spaceId,
  x: z.number().finite().nonnegative(),
  y: z.number().finite().nonnegative(),
});

export class ListPlacedObjects {
  constructor(private readonly repository: PlacedObjectRepository) {}
  async execute(): Promise<readonly PlacedObject[]> {
    try {
      const objects = await this.repository.list();
      const visibleObjects = objects.filter(
        (object) =>
          !(
            object.definitionId === TEST_OBJECT_DEFINITION_ID &&
            object.instanceId === TEST_OBJECT_INSTANCE_ID
          ),
      );
      const existingIds = new Set(
        visibleObjects.map((object) => object.instanceId),
      );
      return Object.freeze([
        ...visibleObjects,
        ...DEFAULT_PLACED_OBJECTS.filter(
          (object) => !existingIds.has(object.instanceId),
        ),
      ]);
    } catch {
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível consultar o objeto da Biblioteca.",
        { operation: "list_placed_objects" },
      );
    }
  }
}

export class UpdatePlacedObjectTransform {
  constructor(
    private readonly repository: PlacedObjectRepository,
    private readonly validate: (object: PlacedObject) => boolean,
  ) {}

  async execute(input: unknown): Promise<PlacedObject> {
    let transform: z.infer<typeof transformSchema>;
    try {
      transform = parseInput(transformSchema, input);
    } catch (error) {
      throw toValidationError(error);
    }
    try {
      const existing =
        (await this.repository.getById(transform.instanceId)) ??
        defaultPlacedObject(transform.instanceId);
      if (!existing) {
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "O objeto selecionado não está disponível.",
          { operation: "find_placed_object" },
        );
      }
      const next = placedObjectSchema.parse({ ...existing, ...transform });
      if (!this.validate(next)) {
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "O objeto precisa permanecer dentro de um espaço válido.",
          { operation: "validate_placed_object" },
        );
      }
      await this.repository.save(next);
      return Object.freeze(next);
    } catch (error: unknown) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(
        "PERSISTENCE_FAILED",
        "Não foi possível salvar a posição do objeto.",
        { operation: "save_placed_object" },
      );
    }
  }
}
