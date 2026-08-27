import { describe, expect, it } from "vitest";
import {
  CHAIR_OBJECT_DEFINITION_ID,
  DEFAULT_PLACED_OBJECTS,
  DESK_OBJECT_DEFINITION_ID,
  DEFAULT_PLACED_OBJECT,
  WORLD_PLACEMENT_AREAS,
  objectDefinition,
  orientationForRotation,
  placedObjectSchema,
  placementIsValid,
  sourceForObject,
} from "./world";
import type { PlacedObject } from "./world";

describe("W2 placement validation", () => {
  const cases: readonly (readonly [PlacedObject, boolean])[] = [
    [DEFAULT_PLACED_OBJECT, true],
    [{ ...DEFAULT_PLACED_OBJECT, x: 448 }, false],
    [{ ...DEFAULT_PLACED_OBJECT, rotation: 90, x: 448 }, false],
    [
      { ...DEFAULT_PLACED_OBJECT, spaceId: "space-b" as const, x: 448, y: 576 },
      true,
    ],
  ];
  it.each(cases)(
    "validates the footprint inside a fixed space",
    (object, expected) => {
      expect(placementIsValid(object, WORLD_PLACEMENT_AREAS)).toBe(expected);
    },
  );

  it("declares four distinct runtime sprites for the wood desk and chair", () => {
    for (const definitionId of [
      DESK_OBJECT_DEFINITION_ID,
      CHAIR_OBJECT_DEFINITION_ID,
    ]) {
      const definition = objectDefinition(definitionId);
      expect(definition).toBeDefined();
      const sources = definition?.visual?.sources;
      expect(sources).toBeDefined();
      expect(sources?.north).toMatch(/-north\.png$/);
      expect(sources?.east).toMatch(/-east\.png$/);
      expect(sources?.south).toMatch(/-south\.png$/);
      expect(sources?.west).toMatch(/-west\.png$/);
      expect(new Set(Object.values(sources ?? {})).size).toBe(4);
    }
  });

  it("maps logical rotation to the authored orientation without bitmap rotation", () => {
    const desk = DEFAULT_PLACED_OBJECTS[0];
    expect(orientationForRotation(0)).toBe("north");
    expect(sourceForObject({ ...desk, rotation: 90 })).toMatch(/-east\.png$/);
    expect(sourceForObject({ ...desk, rotation: 180 })).toMatch(/-south\.png$/);
    expect(sourceForObject({ ...desk, rotation: 270 })).toMatch(/-west\.png$/);
  });

  it("validates the 3×2 desk and 1×1 chair footprints", () => {
    const [desk, chair] = DEFAULT_PLACED_OBJECTS;
    expect(placementIsValid(desk, WORLD_PLACEMENT_AREAS)).toBe(true);
    expect(placementIsValid({ ...desk, x: 416 }, WORLD_PLACEMENT_AREAS)).toBe(
      false,
    );
    expect(placementIsValid(chair, WORLD_PLACEMENT_AREAS)).toBe(true);
    expect(placementIsValid({ ...chair, x: 480 }, WORLD_PLACEMENT_AREAS)).toBe(
      false,
    );
  });

  it("keeps the former procedural definition readable", () => {
    const legacy = {
      definitionId: "object.reading-table",
      instanceId: "placed-object.reading-table",
      rotation: 0,
      spaceId: "space-a",
      x: 192,
      y: 224,
    } as const;
    expect(placedObjectSchema.parse(legacy)).toEqual(legacy);
    expect(placementIsValid(legacy, WORLD_PLACEMENT_AREAS)).toBe(true);
  });
});
