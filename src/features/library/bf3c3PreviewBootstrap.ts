import {
  BF3C3_PREVIEW_SCENARIOS,
  createBf3c3PreviewScenarioResult,
} from "./bf3c3PreviewScenarios";
import {
  mountBf3c3Preview,
  type Bf3c3PreviewScenarioView,
} from "./three/bf3c3Preview";

const scenarios: readonly Bf3c3PreviewScenarioView[] = Object.freeze(
  BF3C3_PREVIEW_SCENARIOS.map((scenario) => {
    const result = createBf3c3PreviewScenarioResult(scenario);
    return Object.freeze({
      description: scenario.description,
      id: scenario.id,
      overflowByCategory: result.overflowByCategory,
      placementsByCategory: result.placementsByCategory,
      snapshot: result.snapshot,
    });
  }),
);

mountBf3c3Preview(scenarios);
