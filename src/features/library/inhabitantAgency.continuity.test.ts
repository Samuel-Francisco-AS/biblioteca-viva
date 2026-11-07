import { describe, expect, it } from "vitest";
import { InhabitantAgency } from "./inhabitantAgency";
import { InhabitantNavigation, distance } from "./inhabitantNavigation";
import { INHABITANTS, INHABITANT_ENVELOPES } from "./inhabitants";

function fixture() {
  let now = 0;
  const agency = new InhabitantAgency(new InhabitantNavigation([]), {
    now: () => now,
    hour: () => 22,
    seed: 51,
  });
  INHABITANTS.forEach((a) => agency.setAvailable(a.id, true));
  agency.setMode("running");
  agency.update();
  return {
    agency,
    advance(seconds: number) {
      for (let i = 0; i < seconds * 10; i++) {
        now += 100;
        agency.update();
      }
    },
  };
}

describe("BF-5.5A real agency continuity", () => {
  it("restores positions and progresses its random sequence", () => {
    const before = fixture();
    before.advance(12);
    const checkpoint = before.agency.captureContinuity(
      "2026-11-05T12:00:00.000Z",
    );
    const after = fixture();
    expect(
      after.agency.restoreContinuity(
        checkpoint,
        Date.parse(checkpoint.savedAt) + 1000,
      ),
    ).toBe(true);
    for (const descriptor of INHABITANTS) {
      const stored = checkpoint.agents.find((a) => a.id === descriptor.id)!;
      const restored = after.agency
        .getPoses()
        .find((a) => a.id === descriptor.id)!;
      expect(distance(stored, restored)).toBeLessThan(0.01);
    }
    expect(after.agency.captureContinuity().randomState).not.toBe(51);
  });

  it("rejects an invalid position outside the floor", () => {
    const before = fixture().agency.captureContinuity(
      "2026-11-05T12:00:00.000Z",
    );
    const corrupted = {
      ...before,
      agents: before.agents.map((a) =>
        a.id === "character:samael" ? { ...a, x: 999, z: 999 } : a,
      ),
    };
    const after = fixture();
    expect(
      after.agency.restoreContinuity(corrupted, Date.parse(before.savedAt)),
    ).toBe(true);
    const actor = after.agency.getPoses().find((a) => a.key === "samael")!;
    expect(actor.x).not.toBe(999);
    expect(
      after.agency.navigation.clear(
        actor,
        actor,
        INHABITANT_ENVELOPES.samael.travel,
      ),
    ).toBe(true);
  });

  it("cancels a physical interaction checkpoint instead of restoring a ghost lease", () => {
    const source = fixture().agency.captureContinuity(
      "2026-11-05T12:00:00.000Z",
    );
    const interrupted = {
      ...source,
      agents: source.agents.map((agent) =>
        agent.id === "character:aryn"
          ? {
              ...agent,
              x: 15.4,
              z: -6.9,
              phase: "work" as const,
              taskId: "c-study",
              destination: null,
            }
          : agent,
      ),
    };
    const restored = fixture();
    expect(
      restored.agency.restoreContinuity(
        interrupted,
        Date.parse(interrupted.savedAt) + 1000,
      ),
    ).toBe(true);
    const aryn = restored.agency
      .getPoses()
      .find((pose) => pose.key === "aryn")!;
    expect(aryn.interactionObjectId).toBeNull();
    expect(aryn.interactionState).toBeNull();
    expect(aryn.state).not.toBe("work");
  });
});
