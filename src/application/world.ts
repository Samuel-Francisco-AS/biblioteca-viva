import { z } from "zod";

export const TEST_OBJECT_DEFINITION_ID = "object.reading-table" as const;
export const TEST_OBJECT_INSTANCE_ID = "placed-object.reading-table" as const;
export const DESK_OBJECT_DEFINITION_ID = "furniture.desk.wood-01" as const;
export const CHAIR_OBJECT_DEFINITION_ID = "furniture.chair.wood-01" as const;
export const DESK_OBJECT_INSTANCE_ID =
  "placed-object.furniture.desk.wood-01" as const;
export const CHAIR_OBJECT_INSTANCE_ID =
  "placed-object.furniture.chair.wood-01" as const;

export type ObjectRotation = 0 | 90 | 180 | 270;
export type ObjectOrientation = "north" | "east" | "south" | "west";

export interface ObjectDefinition {
  readonly id: string;
  readonly footprint: { readonly height: number; readonly width: number };
  readonly rotations: readonly ObjectRotation[];
  readonly visual?: {
    readonly displayHeight: number;
    readonly displayWidth: number;
    readonly hitArea: { readonly height: number; readonly width: number };
    /** Origin is the base centre, deliberately not the texture centre. */
    readonly pivot: { readonly x: number; readonly y: number };
    readonly sources: Readonly<Record<ObjectOrientation, string>>;
  };
}

export interface PlacedObject {
  readonly definitionId: string;
  readonly instanceId: string;
  readonly rotation: ObjectRotation;
  readonly spaceId: "space-a" | "space-b";
  /** Top-left of the ground footprint; sprite pivots derive its base centre. */
  readonly x: number;
  readonly y: number;
}

const rotations = Object.freeze([0, 90, 180, 270] as const);

const deskSources = Object.freeze({
  north: "/assets/world/furniture/desks/wood-desk-01-north.png",
  east: "/assets/world/furniture/desks/wood-desk-01-east.png",
  south: "/assets/world/furniture/desks/wood-desk-01-south.png",
  west: "/assets/world/furniture/desks/wood-desk-01-west.png",
});

const chairSources = Object.freeze({
  north: "/assets/world/furniture/seating/wood-chair-01-north.png",
  east: "/assets/world/furniture/seating/wood-chair-01-east.png",
  south: "/assets/world/furniture/seating/wood-chair-01-south.png",
  west: "/assets/world/furniture/seating/wood-chair-01-west.png",
});

export const OBJECT_DEFINITIONS: readonly ObjectDefinition[] = Object.freeze([
  // Kept exclusively to render and transform persisted W2 state created before
  // the real furniture integration. It intentionally has no runtime sprite.
  Object.freeze({
    id: TEST_OBJECT_DEFINITION_ID,
    footprint: Object.freeze({ height: 48, width: 64 }),
    rotations,
  }),
  Object.freeze({
    id: DESK_OBJECT_DEFINITION_ID,
    footprint: Object.freeze({ height: 64, width: 96 }),
    rotations,
    visual: Object.freeze({
      displayHeight: 128,
      displayWidth: 128,
      hitArea: Object.freeze({ height: 112, width: 128 }),
      pivot: Object.freeze({ x: 0.5, y: 0.9 }),
      sources: deskSources,
    }),
  }),
  Object.freeze({
    id: CHAIR_OBJECT_DEFINITION_ID,
    footprint: Object.freeze({ height: 32, width: 32 }),
    rotations,
    visual: Object.freeze({
      displayHeight: 96,
      displayWidth: 80,
      hitArea: Object.freeze({ height: 88, width: 80 }),
      pivot: Object.freeze({ x: 0.5, y: 0.9 }),
      sources: chairSources,
    }),
  }),
]);

export const DEFAULT_PLACED_OBJECTS: readonly PlacedObject[] = Object.freeze([
  Object.freeze({
    definitionId: DESK_OBJECT_DEFINITION_ID,
    instanceId: DESK_OBJECT_INSTANCE_ID,
    rotation: 0,
    spaceId: "space-a",
    x: 192,
    y: 224,
  }),
  Object.freeze({
    definitionId: CHAIR_OBJECT_DEFINITION_ID,
    instanceId: CHAIR_OBJECT_INSTANCE_ID,
    rotation: 0,
    spaceId: "space-a",
    x: 320,
    y: 256,
  }),
]);

/** @deprecated Compatibility fallback for W2 callers from before the assets. */
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
  // W3 structural blueprint is one 12×10-cell room. `space-b` remains only as
  // a legacy persisted identifier and maps to the same recoverable footprint.
  "space-a": Object.freeze({ x: 96, y: 128, width: 384, height: 320 }),
  "space-b": Object.freeze({ x: 96, y: 128, width: 384, height: 320 }),
});

const definitionIds = [
  TEST_OBJECT_DEFINITION_ID,
  DESK_OBJECT_DEFINITION_ID,
  CHAIR_OBJECT_DEFINITION_ID,
] as const;

export const placedObjectSchema = z.strictObject({
  definitionId: z.enum(definitionIds),
  instanceId: z.string().trim().min(1),
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

export function defaultPlacedObject(
  instanceId: string,
): PlacedObject | undefined {
  return DEFAULT_PLACED_OBJECTS.find(
    (object) => object.instanceId === instanceId,
  );
}

export function orientationForRotation(
  rotation: ObjectRotation,
): ObjectOrientation {
  const orientations: Readonly<Record<ObjectRotation, ObjectOrientation>> = {
    0: "north",
    90: "east",
    180: "south",
    270: "west",
  };
  return orientations[rotation];
}

export function sourceForObject(object: PlacedObject): string | undefined {
  const definition = objectDefinition(object.definitionId);
  return definition?.visual?.sources[orientationForRotation(object.rotation)];
}

export function nextObjectRotation(rotation: ObjectRotation): ObjectRotation {
  return rotations[(rotations.indexOf(rotation) + 1) % rotations.length];
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
