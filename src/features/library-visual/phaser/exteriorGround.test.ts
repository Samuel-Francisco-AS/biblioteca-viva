import { describe, expect, it } from "vitest";
import {
  EXTERIOR_GROUND_WORLD_SIZE,
  exteriorGroundTiles,
  exteriorGroundVariantAt,
} from "./exteriorGround";

describe("exterior ground", () => {
  it("selects all variants deterministically without a checkerboard", () => {
    const first = exteriorGroundTiles({
      x: 0,
      y: 0,
      width: 1024,
      height: 1024,
    });
    const second = exteriorGroundTiles({
      x: 0,
      y: 0,
      width: 1024,
      height: 1024,
    });
    expect(first).toEqual(second);
    expect(new Set(first.map((tile) => tile.variant))).toEqual(
      new Set(["a", "b", "c", "d"]),
    );
    expect(exteriorGroundVariantAt(3, 7)).toBe(exteriorGroundVariantAt(3, 7));
    expect(EXTERIOR_GROUND_WORLD_SIZE).toBe(256);
    expect(first).toHaveLength(16);
  });
});
