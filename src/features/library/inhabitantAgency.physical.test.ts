import { expect, it } from "vitest";
import { InhabitantAgency } from "./inhabitantAgency";
import { InhabitantNavigation } from "./inhabitantNavigation";
import {
  INHABITANTS,
  INHABITANT_ENVELOPES,
  PHYSICAL_ACTIONS,
} from "./inhabitants";
import { createProceduralLibraryBuilding } from "./three/proceduralLibraryBuilding";
import { collectInhabitantObstacles } from "./three/inhabitantObstacles";
import { disposeObjectTree } from "./three/referenceScene";
import type { WorldSessionActivity } from "../../contracts/worldSessionActivity";
import { EMPTY_AGENCY_ENVIRONMENT } from "./inhabitantEnvironment";
import { SESSION_SEATS, SESSION_STATIONS } from "./sessionStations";

for (const kind of ["study", "work", "physical_activity", "viewing"] as const)
  for (const actor of INHABITANTS) {
    it(`${actor.key}: confirmed ${kind}, exclusive station, full safe exit`, () => {
      const building = createProceduralLibraryBuilding(true);
      const agency = new InhabitantAgency(
        new InhabitantNavigation(collectInhabitantObstacles([building])),
        { now: () => now, seed: 51 },
      );
      let now = 0;
      const session: WorldSessionActivity = {
        sessionId: "fiction-session",
        entryId: "fiction",
        instanceId: "fiction",
        entryType: kind === "viewing" ? "movie" : kind,
        kind,
        status: "active",
        revision: 1,
      };
      agency.setAvailable(actor.id, true);
      agency.setMode("running");
      const step = (sessionActivity: WorldSessionActivity | null = session) => {
        now += 50;
        agency.update({ ...EMPTY_AGENCY_ENVIRONMENT, sessionActivity });
      };
      let active = false;
      const states = new Set<string | null>();
      for (let i = 0; i < 2200; i++) {
        step();
        const pose = agency.getPoses().find((a) => a.id === actor.id)!;
        states.add(pose.interactionState);
        if (
          ["study_seated", "workshop", "train", "watch"].includes(pose.action)
        ) {
          active = true;
          break;
        }
      }
      expect(
        active,
        JSON.stringify(agency.getPoses().find((a) => a.id === actor.id)),
      ).toBe(true);
      const seat = SESSION_SEATS.find(
        (s) => s.stationId === SESSION_STATIONS[kind],
      );
      if (seat) {
        expect(states.has("sitting")).toBe(true);
        expect(
          agency.interactions.occupancy(seat.id, agency.interactionTime)?.owner,
        ).toBe(actor.key);
      }
      expect(
        agency.interactions
          .snapshot()
          .some((l) => l.resourceId === `surface:${SESSION_STATIONS[kind]}`),
      ).toBe(true);
      for (let i = 0; i < 200; i++) step(null);
      expect(agency.interactions.snapshot()).toHaveLength(0);
      expect(
        agency.getPoses().find((a) => a.id === actor.id)?.physicalSessionId,
      ).toBeUndefined();
      agency.dispose();
      disposeObjectTree(building);
    });
  }

function studyFixture() {
  const building = createProceduralLibraryBuilding(true);
  let time = 0;
  const agency = new InhabitantAgency(
    new InhabitantNavigation(collectInhabitantObstacles([building])),
    { now: () => time, seed: 51 },
  );
  const activity: WorldSessionActivity = {
    sessionId: "study-fiction",
    entryId: "study-fiction",
    instanceId: "study-fiction",
    entryType: "study",
    kind: "study",
    status: "active",
    revision: 1,
  };
  agency.setAvailable("character:samael", true);
  agency.setAvailable("character:aryn", true);
  agency.setMode("running");
  const step = (sessionActivity: WorldSessionActivity | null = activity) => {
    time += 50;
    agency.update({ ...EMPTY_AGENCY_ENVIRONMENT, sessionActivity });
  };
  const until = (
    predicate: () => boolean,
    sessionActivity: WorldSessionActivity | null = activity,
  ) => {
    for (let i = 0; i < 2200 && !predicate(); i++) step(sessionActivity);
    expect(predicate()).toBe(true);
  };
  return {
    building,
    agency,
    activity,
    step,
    until,
    dispose() {
      agency.dispose();
      disposeObjectTree(building);
    },
  };
}

it("reserves one seat for two candidates, distinguishes approach/occupancy, and refuses a competing owner", () => {
  const f = studyFixture(),
    seat = SESSION_SEATS.find((s) => s.stationId === "bf4-prop:9")!;
  f.until(() =>
    f.agency.getPoses().some((p) => p.physicalSessionId !== undefined),
  );
  const approaching = f.agency.getPoses().filter((p) => p.physicalSessionId);
  expect(approaching).toHaveLength(1);
  expect(approaching[0].state).toBe("navigate");
  expect(
    f.agency.interactions.occupancy(seat.id, f.agency.interactionTime),
  ).toBeNull();
  expect(
    f.agency.interactions.reserve(
      seat.id,
      "lua",
      "competing",
      f.agency.interactionTime,
    ),
  ).toBeNull();
  f.until(() => f.agency.getPoses().some((p) => p.action === "study_seated"));
  expect(
    f.agency.interactions.occupancy(seat.id, f.agency.interactionTime)?.owner,
  ).toBe(approaching[0].key);
  f.dispose();
  expect(f.agency.interactions.snapshot()).toHaveLength(0);
});

for (const phase of ["approaching", "sitting", "seated"] as const)
  it(`cancels during ${phase}, unwinds contact continuously and releases resources`, () => {
    const f = studyFixture();
    f.until(() =>
      f.agency
        .getPoses()
        .some(
          (p) =>
            p.interactionState === phase &&
            (phase !== "sitting" || (p.physicalActionTime ?? 0) > 0.5),
        ),
    );
    const before = f.agency
      .getPoses()
      .find((p) => p.interactionState === phase)!;
    // F1 changes are reconciled on the existing 250 ms logic cadence.
    for (let i = 0; i < 6; i++) f.step(null);
    const after = f.agency.getPoses().find((p) => p.id === before.id)!;
    if (phase === "sitting") {
      expect(after.action).toBe("stand");
      expect(after.physicalActionTime).toBeGreaterThanOrEqual(
        2 - before.physicalActionTime! - 0.3,
      );
      expect(after.x).toBeCloseTo(before.x, 5);
      expect(after.z).toBeCloseTo(before.z, 5);
    }
    f.until(() => !f.agency.getPoses().some((p) => p.physicalSessionId), null);
    expect(f.agency.interactions.snapshot()).toHaveLength(0);
    f.dispose();
  });

it("safely yields to dialogue and queues a direct gesture after standing/exiting", () => {
  const f = studyFixture();
  f.until(() => f.agency.getPoses().some((p) => p.action === "study_seated"));
  const reader = f.agency.getPoses().find((p) => p.action === "study_seated")!;
  f.agency.setConversation(reader.key);
  expect(f.agency.getPoses().find((p) => p.id === reader.id)?.action).toBe(
    "stand",
  );
  f.until(
    () =>
      f.agency.getPoses().find((p) => p.id === reader.id)?.state === "converse",
  );
  expect(
    f.agency.interactions.snapshot().some((l) => l.owner === reader.key),
  ).toBe(false);
  f.agency.setConversation(null);
  f.until(() => f.agency.getPoses().some((p) => p.action === "study_seated"));
  const next = f.agency.getPoses().find((p) => p.action === "study_seated")!;
  expect(f.agency.interrupt(next.id, "gesture")).toBe(true);
  expect(f.agency.getPoses().find((p) => p.id === next.id)?.action).toBe(
    "stand",
  );
  f.until(
    () =>
      f.agency.getPoses().find((p) => p.id === next.id)?.action === "gesture",
  );
  expect(
    f.agency.getPoses().find((p) => p.id === next.id)?.physicalSessionId,
  ).toBeUndefined();
  f.dispose();
});

it("freezes a resident task in background, then safely exits in reduced motion without starting a replacement", () => {
  const f = studyFixture();
  f.until(() =>
    f.agency.getPoses().some((p) => p.interactionState === "sitting"),
  );
  f.agency.setMode("paused");
  const before = f.agency.getPoses();
  const clock = f.agency.interactionTime;
  for (let i = 0; i < 300; i++) f.step();
  expect(f.agency.getPoses()).toEqual(before);
  expect(f.agency.interactionTime).toBe(clock);
  f.agency.setMode("reduced");
  f.until(() => !f.agency.getPoses().some((p) => p.physicalSessionId));
  expect(f.agency.interactions.snapshot()).toHaveLength(0);
  for (let i = 0; i < 30; i++) f.step();
  expect(f.agency.getPoses().some((p) => p.physicalSessionId)).toBe(false);
  f.dispose();
});

it("reopens from a seated checkpoint using geometry/F1, never restoring leases or a transient pose", () => {
  const f = studyFixture();
  f.until(() => f.agency.getPoses().some((p) => p.action === "study_seated"));
  const selected = f.agency
    .getPoses()
    .find((p) => p.action === "study_seated")!;
  const checkpoint = f.agency.captureContinuity("2026-11-08T12:00:00.000Z");
  const reopened = new InhabitantAgency(f.agency.navigation, { seed: 51 });
  expect(
    reopened.restoreContinuity(
      checkpoint,
      Date.parse(checkpoint.savedAt) + 1000,
    ),
  ).toBe(true);
  expect(reopened.interactions.snapshot()).toHaveLength(0);
  for (const pose of reopened.getPoses()) {
    expect(pose.physicalSessionId).toBeUndefined();
    expect(PHYSICAL_ACTIONS).not.toContain(pose.action);
    if (pose.id === selected.id) expect(pose.action).toBe("idle");
    expect(
      reopened.navigation.clear(
        pose,
        pose,
        INHABITANT_ENVELOPES[pose.key].travel,
      ),
    ).toBe(true);
  }
  reopened.dispose();
  f.dispose();
});
