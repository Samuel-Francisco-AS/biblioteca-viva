import type {
  ProceduralBookshelfVariant,
  ProceduralContentIdentity,
} from "./proceduralContent";

export type ProceduralContentPosition = readonly [
  x: number,
  y: number,
  z: number,
];

/** A Three-independent declaration of one procedural world occurrence. */
export interface ProceduralContentDefinition {
  readonly identity: ProceduralContentIdentity;
  readonly position: ProceduralContentPosition;
  readonly variant: ProceduralBookshelfVariant;
}

export const READING_SHELF_COMPOSITION_DEFINITIONS: readonly ProceduralContentDefinition[] =
  Object.freeze([
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-01",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([-3, 0, -2] as [number, number, number]),
      variant: "reading-balanced",
    }),
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-02",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([0, 0, -2] as [number, number, number]),
      variant: "reading-dark-tall",
    }),
    Object.freeze({
      identity: Object.freeze({
        instanceId: "reading-shelf-03",
        modelTypeId: "bookshelf" as const,
      }),
      position: Object.freeze([3, 0, -2.1] as [number, number, number]),
      variant: "reading-light-wide",
    }),
  ]);
