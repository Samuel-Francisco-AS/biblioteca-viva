import {
  DEFAULT_PLACED_OBJECT,
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
  instanceId: z.literal(DEFAULT_PLACED_OBJECT.instanceId),
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
      return objects.length > 0
        ? Object.freeze([...objects])
        : Object.freeze([DEFAULT_PLACED_OBJECT]);
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
        DEFAULT_PLACED_OBJECT;
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
