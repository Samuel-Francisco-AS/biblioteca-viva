import { describe, expect, it } from "vitest";

import { WALL_ASSETS, validateWallAssetCatalog } from "./wallAssets";

describe("catálogo W3-A de paredes", () => {
  it("tem IDs únicos, campos válidos e caminhos runtime centralizados", () => {
    expect(validateWallAssetCatalog()).toBe(true);
    expect(WALL_ASSETS).toHaveLength(12);
    expect(new Set(WALL_ASSETS.map((asset) => asset.id)).size).toBe(
      WALL_ASSETS.length,
    );
    for (const asset of WALL_ASSETS) {
      expect(asset.logicalLengthCells).toBeGreaterThan(0);
      expect(asset.pixelsPerLogicalCell).toBe(300);
      expect(asset.runtimePath).toMatch(
        /^\/assets\/world\/architecture\/walls\//u,
      );
    }
  });

  it("declara os quatro cantos e somente portas horizontais", () => {
    expect(
      WALL_ASSETS.filter((asset) => asset.role === "corner").map(
        (asset) => asset.corner,
      ),
    ).toEqual(["ne", "nw", "se", "sw"]);
    expect(
      WALL_ASSETS.filter((asset) => asset.role === "door-horizontal").every(
        (asset) => asset.orientation === "horizontal",
      ),
    ).toBe(true);
  });
});
