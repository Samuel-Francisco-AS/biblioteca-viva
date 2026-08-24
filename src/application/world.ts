import { z } from "zod";

export const TEST_OBJECT_DEFINITION_ID = "object.reading-table" as const;
export const TEST_OBJECT_INSTANCE_ID = "placed-object.reading-table" as const;

export type ObjectRotation = 0 | 90 | 180 | 270;

export interface ObjectDefinition {
  readonly id: string;
  readonly footprint: { readonly height: number; readonly width: number };
  readonly rotations: readonly ObjectRotation[];
}

export interface PlacedObject {
  readonly definitionId: string;
  readonly instanceId: string;
  readonly rotation: ObjectRotation;
  readonly spaceId: "space-a" | "space-b";
  readonly x: number;
  readonly y: number;
}

export const OBJECT_DEFINITIONS: readonly ObjectDefinition[] = Object.freeze([
  Object.freeze({
    id: TEST_OBJECT_DEFINITION_ID,
    footprint: Object.freeze({ height: 48, width: 64 }),
    rotations: Object.freeze([0, 90, 180, 270] as const),
  }),
]);

export const DEFAULT_PLACED_OBJECT: PlacedObject = Object.freeze({
  definitionId: TEST_OBJECT_DEFINITION_ID,
  instanceId: TEST_OBJECT_INSTANCE_ID,
  rotation: 0,
  spaceId: "space-a",
  x: 192,
  y: 224,
});

export const WORLD_PLACEMENT_AREAS: Readonly<
  Record<PlacedObject["spaceId"], PlacementArea>
> = Object.freeze({
  "space-a": Object.freeze({ x: 96, y: 128, width: 384, height: 288 }),
  "space-b": Object.freeze({ x: 480, y: 416, width: 320, height: 256 }),
});

export const placedObjectSchema = z.strictObject({
  definitionId: z.literal(TEST_OBJECT_DEFINITION_ID),
  instanceId: z.literal(TEST_OBJECT_INSTANCE_ID),
  rotation: z.union([
    z.literal(0),
    z.literal(90),
    z.literal(180),
    z.literal(270),
  ]),
  spaceId: z.union([z.literal("space-a"), z.literal("space-b")]),
  x: z.number().finite().nonnegative(),
  y: z.number().finite().nonnegative(),
});

export function objectDefinition(id: string): ObjectDefinition | undefined {
  return OBJECT_DEFINITIONS.find((definition) => definition.id === id);
}

export interface PlacementArea {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/** Pure W2 guard. The two fixed rooms are the only valid placement areas. */
export function placementIsValid(
  placed: PlacedObject,
  spaces: Readonly<Record<PlacedObject["spaceId"], PlacementArea>>,
): boolean {
  const definition = objectDefinition(placed.definitionId);
  if (!definition || !definition.rotations.includes(placed.rotation))
    return false;
  const space = spaces[placed.spaceId];
  const swapped = placed.rotation === 90 || placed.rotation === 270;
  const width = swapped
    ? definition.footprint.height
    : definition.footprint.width;
  const height = swapped
    ? definition.footprint.width
    : definition.footprint.height;
  return (
    placed.x >= space.x &&
    placed.y >= space.y &&
    placed.x + width <= space.x + space.width &&
    placed.y + height <= space.y + space.height
  );
}
