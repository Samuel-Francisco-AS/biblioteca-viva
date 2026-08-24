import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLACED_OBJECT,
  WORLD_PLACEMENT_AREAS,
  placementIsValid,
} from "./world";
import type { PlacedObject } from "./world";

describe("W2 placement validation", () => {
  const cases: readonly (readonly [PlacedObject, boolean])[] = [
    [DEFAULT_PLACED_OBJECT, true],
    [{ ...DEFAULT_PLACED_OBJECT, x: 448 }, false],
    [{ ...DEFAULT_PLACED_OBJECT, rotation: 90, x: 448 }, false],
    [
      { ...DEFAULT_PLACED_OBJECT, spaceId: "space-b" as const, x: 512, y: 448 },
      true,
    ],
  ];
  it.each(cases)(
    "validates the footprint inside a fixed space",
    (object, expected) => {
      expect(placementIsValid(object, WORLD_PLACEMENT_AREAS)).toBe(expected);
    },
  );
});
