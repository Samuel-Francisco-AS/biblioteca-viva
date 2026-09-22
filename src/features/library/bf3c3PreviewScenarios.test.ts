import { describe, expect, it } from "vitest";

import {
  BF3C3_PREVIEW_SCENARIOS,
  createBf3c3PreviewScenarioResult,
} from "./bf3c3PreviewScenarios";

describe("cenários sintéticos da prévia BF-3C3", () => {
  it("projeta as identidades convencionais sintéticas pela fronteira BF-3B", () => {
    const lowDensity = createBf3c3PreviewScenarioResult(
      BF3C3_PREVIEW_SCENARIOS[0],
    );
    expect(lowDensity.snapshot.categories[1].entries[0]).toMatchObject({
      entryId: "bf3c3-movie-01",
      instanceId: "library-movie:bf3c3-movie-01",
      modelTypeId: "movie-record",
    });
    expect(lowDensity.snapshot.categories[0].entries).toHaveLength(18);
  });

  it("mostra baixa densidade, capacidade exata e overflow sem slots inventados", () => {
    const results = BF3C3_PREVIEW_SCENARIOS.map(
      createBf3c3PreviewScenarioResult,
    );
    expect(
      results.map(({ placementsByCategory }) =>
        Object.values(placementsByCategory).reduce(
          (total, value) => total + value,
          0,
        ),
      ),
    ).toEqual([5, 37, 37]);
    expect(
      results.map(({ overflowByCategory }) =>
        Object.values(overflowByCategory).reduce(
          (total, value) => total + value,
          0,
        ),
      ),
    ).toEqual([0, 0, 4]);
    expect(results[2]?.overflowByCategory).toEqual({
      movie: 2,
      physical_activity: 0,
      series: 0,
      study: 2,
      work: 0,
    });
  });
});
