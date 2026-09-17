import { describe, expect, it } from "vitest";

import {
  DEFAULT_PERFORMANCE_SCENARIO,
  PERFORMANCE_SCENARIOS,
} from "./performanceScenarios";

describe("cenários experimentais de performance F5-A", () => {
  it("preserva uma escada pequena, identificável e determinística", () => {
    expect(PERFORMANCE_SCENARIOS.map(({ id }) => id)).toEqual([
      "f1-baseline",
      "f4-corpus",
      "f4-corpus-x4",
    ]);
    expect(DEFAULT_PERFORMANCE_SCENARIO.id).toBe("f1-baseline");
    expect(PERFORMANCE_SCENARIOS.map(({ assets }) => assets.length)).toEqual([
      1, 5, 17,
    ]);
  });

  it("usa somente o fixture F1 e os quatro fixtures F4 registrados", () => {
    const identifiers = PERFORMANCE_SCENARIOS.flatMap(({ assets }) =>
      assets.map(({ id }) => id.replace(/^[a-d]-/u, "")),
    );

    expect(new Set(identifiers)).toEqual(
      new Set([
        "f1-technical-pyramid",
        "kaykit",
        "kenney",
        "polyhaven",
        "quaternius",
      ]),
    );
  });

  it("mantém as cópias do stress em posições estáveis e distintas", () => {
    const stress = PERFORMANCE_SCENARIOS[2];
    const positions = stress.assets.map(({ position }) => position.join(","));

    expect(new Set(positions)).toHaveLength(stress.assets.length);
    expect(
      stress.assets.filter(({ id }) => id.endsWith("-polyhaven")),
    ).toHaveLength(4);
  });
});
