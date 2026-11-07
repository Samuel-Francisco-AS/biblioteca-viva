import { expect, it, vi } from "vitest";
import { InhabitantAgency } from "./inhabitantAgency";
import { InteractionCoordinator } from "./inhabitantInteractions";
import { InhabitantNavigation } from "./inhabitantNavigation";
import { INHABITANTS } from "./inhabitants";
import { NightLightingSession } from "./nightLighting";

it("never abandons a scroll lease when autonomous social activity replaces its route", () => {
  const spy = vi.spyOn(InteractionCoordinator.prototype, "reserve");
  const reservations = () => {
    const owner: unknown = spy.mock.contexts[0];
    return owner instanceof InteractionCoordinator ? owner.snapshot() : [];
  };
  let now = 0;
  const agency = new InhabitantAgency(new InhabitantNavigation([]), {
    now: () => now,
    seed: 51,
    hour: () => 12,
  });
  INHABITANTS.filter((a) => a.key === "aryn" || a.key === "lua").forEach((a) =>
    agency.setAvailable(a.id, true),
  );
  agency.setMode("running");
  let reserves = 0;
  let social = false;
  for (let i = 0; i < 5000; i++) {
    now += 100;
    agency.update({
      physicalObstacles: [],
      readingCandidate: null,
      scrollCandidates: [
        { id: "scroll:note:fiction", source: { x: 17, z: 8 } },
      ],
    });
    const poses = agency.getPoses();
    const leases = reservations() ?? [];
    reserves += leases.length;
    social ||= poses.some((p) => p.state === "socialize");
    for (const lease of leases.filter((l) =>
      l.resourceId.startsWith("scroll:"),
    )) {
      expect(
        poses.find((p) => p.key === lease.owner)?.interactionObjectId,
      ).toBe(lease.resourceId);
    }
  }
  expect(reserves).toBeGreaterThan(0);
  expect(social).toBe(true);
  agency.dispose();
  expect(reservations()).toEqual([]);
  spy.mockRestore();
});
it.each(["paused", "reduced", "unavailable"] as const)(
  "releases reservations on %s and resumes without orphaned ownership",
  (mode) => {
    const spy = vi.spyOn(InteractionCoordinator.prototype, "reserve");
    const reservations = () => {
      const owner: unknown = spy.mock.contexts[0];
      return owner instanceof InteractionCoordinator ? owner.snapshot() : [];
    };
    let now = 0;
    const night = new NightLightingSession(() => new Date(2026, 10, 5, 22));
    const agency = new InhabitantAgency(new InhabitantNavigation([]), {
      now: () => now,
      nightLighting: night,
      seed: 51,
    });
    INHABITANTS.forEach((a) => agency.setAvailable(a.id, true));
    agency.setMode("running");
    for (let i = 0; i < 1000 && !reservations().length; i++) {
      now += 100;
      agency.update();
    }
    expect(reservations().length).toBeGreaterThan(0);
    agency.setMode(mode);
    expect(reservations()).toEqual([]);
    agency.setMode("running");
    for (let i = 0; i < 200; i++) {
      now += 100;
      agency.update();
    }
    agency.dispose();
    expect(reservations()).toEqual([]);
    spy.mockRestore();
  },
);
it("differentiates all four magic responses while protecting conversations and reserved tasks", () => {
  for (let index = 0; index < 4; index++) {
    let now = 0;
    const agency = new InhabitantAgency(new InhabitantNavigation([]), {
      now: () => now,
    });
    const actor = INHABITANTS[index];
    agency.setAvailable(actor.id, true);
    agency.setMode("running");
    agency.reactToMagic(index);
    const pose = agency.getPoses().find((p) => p.key === actor.key)!;
    expect(pose.state).toBe("react");
    expect(pose.activity).toMatch(
      [/desconfiança/, /restauradora/, /floral/, /desajeitado/][index],
    );
    agency.setConversation(actor.key);
    agency.reactToMagic(index + 4);
    for (let j = 0; j < 100; j++) {
      now += 100;
      agency.update();
    }
    expect(agency.getPoses().find((p) => p.key === actor.key)?.state).toBe(
      "converse",
    );
    agency.dispose();
  }
});
