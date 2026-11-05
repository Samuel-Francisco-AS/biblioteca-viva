import { describe, expect, it } from "vitest";
import {
  parseInhabitantContinuity,
  type InhabitantContinuitySnapshot,
} from "./inhabitantContinuity";
import { INHABITANTS } from "./inhabitants";

const sample = (): InhabitantContinuitySnapshot => ({
  version: 1,
  savedAt: "2026-11-05T12:00:00.000Z",
  randomState: 123,
  agents: INHABITANTS.map((a) => ({
    id: a.id,
    x: a.x,
    z: a.z,
    facing: 0,
    phase: "idle" as const,
    taskId: null,
    destination: null,
    remainingSeconds: 4,
    recentTaskIds: [],
    taskCount: 0,
  })),
});

describe("BF-5.5A versioned continuity contract", () => {
  it("rejects duplicate IDs, corruption and personal fields", () => {
    const value = sample();
    expect(parseInhabitantContinuity(value)).toEqual(value);
    const first = value.agents[0];
    const duplicated = [first, first, ...value.agents.slice(2)];
    const infinite = [{ ...first, x: Infinity }, ...value.agents.slice(1)];
    const withSecret = [
      { ...first, privateContent: "forbidden" },
      ...value.agents.slice(1),
    ];
    const invalid: unknown[] = [
      { ...value, version: 2 },
      { ...value, savedAt: "broken" },
      { ...value, agents: duplicated },
      { ...value, agents: infinite },
      { ...value, agents: withSecret },
    ];
    for (const input of invalid) {
      expect(parseInhabitantContinuity(input)).toBeUndefined();
    }
  });
});
