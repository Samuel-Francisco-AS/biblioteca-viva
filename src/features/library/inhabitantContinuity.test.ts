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
    expect(parseInhabitantContinuity(sample())).toEqual(sample());
    const value = sample();
    expect(parseInhabitantContinuity({ ...value, version: 2 })).toBeUndefined();
    expect(
      parseInhabitantContinuity({
        ...value,
        agents: [
          value.agents[0],
          value.agents[0],
          value.agents[2],
          value.agents[3],
        ],
      }),
    ).toBeUndefined();
    expect(
      parseInhabitantContinuity({
        ...value,
        agents: [
          { ...value.agents[0], x: Infinity },
          ...value.agents.slice(1),
        ],
      }),
    ).toBeUndefined();
    expect(
      parseInhabitantContinuity({ ...value, savedAt: "broken" }),
    ).toBeUndefined();
    expect(
      parseInhabitantContinuity({
        ...value,
        agents: [
          { ...value.agents[0], privateContent: "forbidden" },
          ...value.agents.slice(1),
        ],
      }),
    ).toBeUndefined();
  });
});
