import { describe, expect, it } from "vitest";
import { Scene } from "three";
import { LivingSession } from "./livingObjects";
import { createLivingVisuals } from "./three/livingVisuals";
import { createInhabitantSceneProps } from "./three/inhabitantSceneProps";
import { InhabitantAgency } from "./inhabitantAgency";
import { NightLightingSession } from "./nightLighting";
import { INHABITANTS, INHABITANT_ENVELOPES } from "./inhabitants";
import {
  InhabitantNavigation,
  distance,
  roomAt,
  type Position,
} from "./inhabitantNavigation";
import { LIBRARY_ACTIVITY_POINTS } from "./librarySpatialLayout";
import { createProceduralLibraryBuilding } from "./three/proceduralLibraryBuilding";
import { createProceduralComposition } from "./three/proceduralComposition";
import { LIBRARY_SHELVES } from "./libraryShelfLayout";
import { createLibraryRecordComposition } from "./three/libraryRecordComposition";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "./libraryRecordLayout";
import { collectInhabitantObstacles } from "./three/inhabitantObstacles";
import { disposeObjectTree } from "./three/referenceScene";

function realNavigation() {
  const world = new Scene(),
    building = createProceduralLibraryBuilding(true);
  world.add(
    building,
    createProceduralComposition(LIBRARY_SHELVES).root,
    createLibraryRecordComposition(
      INITIAL_LIBRARY_RECORD_SLOTS.map((s) => ({
        ...s,
        entryId: `fiction:${s.slotId}`,
        instanceId: `fiction:${s.slotId}`,
      })),
    ).root,
  );
  createLivingVisuals(building, world, new LivingSession());
  createInhabitantSceneProps(building);
  const obstacles = collectInhabitantObstacles([world]);
  disposeObjectTree(world);
  return new InhabitantNavigation(obstacles);
}
function session(navigation: InhabitantNavigation, seed = 42) {
  let time = 0;
  const agency = new InhabitantAgency(navigation, {
    now: () => time,
    hour: () => 22,
    seed,
  });
  for (const a of INHABITANTS) agency.setAvailable(a.id, true);
  agency.setMode("running");
  agency.update();
  return {
    agency,
    step: (seconds: number) => {
      for (let i = 0; i < Math.round(seconds * 10); i++) {
        time += 100;
        agency.update();
      }
    },
    jump: () => {
      time += 3_600_000;
      agency.update();
    },
  };
}

describe("BF-4F3 real spatial navigation", () => {
  it("verifies routes for every inhabitant to all five rooms through the four real passages with a full fictional collection", () => {
    const nav = realNavigation();
    const missing: string[] = [];
    let crossings = 0;
    for (const a of INHABITANTS)
      for (const room of ["room-a", "room-b", "room-c", "room-d", "room-e"]) {
        const routes = LIBRARY_ACTIVITY_POINTS.filter((p) => roomAt(p) === room)
          .map((p) => nav.route(a, p, INHABITANT_ENVELOPES[a.key].travel))
          .filter((r) => r !== null);
        if (!routes.length) missing.push(`${a.key}:${room}`);
        for (const route of routes) {
          let from: Position = { x: a.x, z: a.z };
          for (const p of route) {
            expect(nav.clear(from, p, INHABITANT_ENVELOPES[a.key].travel)).toBe(
              true,
            );
            if (
              (Math.abs(from.x) < 9.5 && Math.abs(p.x) > 10.7) ||
              (Math.abs(p.x) < 9.5 && Math.abs(from.x) > 10.7)
            )
              crossings++;
            from = p;
          }
        }
      }
    expect(missing).toEqual([]);
    expect(crossings).toBeGreaterThan(4);
  });
  it("rejects walls, furniture, unreachable/occupied destinations and invalid geometry", () => {
    const nav = realNavigation(),
      from = { x: 0, z: 0 };
    expect(nav.route(from, { x: 100, z: 100 }, 0.7)).toBeNull();
    expect(nav.clear({ x: 9, z: 0 }, { x: 12, z: 0 }, 0.7)).toBe(false);
    expect(nav.route(from, { x: -4.5, z: -2 }, 0.7)).toBeNull();
    expect(
      nav.route(from, { x: 2, z: 0 }, 0.7, [
        { id: "other", minX: 1.5, maxX: 2.5, minZ: -0.5, maxZ: 0.5 },
      ]),
    ).toBeNull();
    expect(nav.route(from, { x: NaN, z: 0 }, 0.7)).toBeNull();
  });
});

describe("BF-4F3 local agency", () => {
  it("performs a reachable autonomous night-lamp ritual with an exclusive lease", () => {
    let elapsed = 0;
    const night = new NightLightingSession(() => new Date(2026, 10, 5, 22));
    const agency = new InhabitantAgency(realNavigation(), {
      now: () => elapsed,
      hour: () => 22,
      seed: 42,
      nightLighting: night,
    });
    const aryn = INHABITANTS.find((a) => a.key === "aryn")!;
    agency.setAvailable(aryn.id, true);
    agency.setMode("running");
    agency.update();
    let observedGesture = false;
    for (
      let step = 0;
      step < 10000 && night.getSnapshot().completedLampIds.length === 0;
      step++
    ) {
      elapsed += 100;
      agency.update();
      observedGesture ||= agency
        .getPoses()
        .some((pose) => pose.key === "aryn" && pose.action === "gesture");
    }
    expect(observedGesture).toBe(true);
    expect(night.getSnapshot().completedLampIds.length).toBeGreaterThan(0);
    expect(night.getSnapshot().completedLampIds.length).toBeLessThanOrEqual(9);
    const completed = night.getSnapshot().completedLampIds[0]!;
    expect(night.complete(completed)).toBe(false);
    agency.setMode("paused");
    expect(
      agency.getPoses().some((pose) => pose.interactionObjectId === completed),
    ).toBe(false);
    agency.dispose();
  });

  it("completes the autonomous book interaction from canonical layout point to release", () => {
    const navigation = realNavigation();
    const s = session(navigation);
    for (const inhabitant of INHABITANTS.filter((item) => item.key !== "aryn"))
      s.agency.setAvailable(inhabitant.id, false);
    const states = new Set<string>();
    let completed = false;
    for (let i = 0; i < 30_000 && !completed; i++) {
      s.step(0.1);
      const poses = s.agency.getPoses();
      const book = poses.find(
        (pose) => pose.interactionObjectId === "living:book",
      );
      if (book) states.add(book.interactionState ?? "none");
      completed =
        states.has("placing") &&
        states.has("recollecting") &&
        states.has("returning") &&
        !book;
    }
    expect(states).toEqual(
      new Set([
        "orienting",
        "picking",
        "carrying",
        "placing",
        "recollecting",
        "returning",
      ]),
    );
    expect(completed).toBe(true);
    expect(
      s.agency
        .getPoses()
        .some((pose) => pose.interactionObjectId === "living:book"),
    ).toBe(false);
  });

  it("reproduces decisions from clock/seed; preserves positions over pause, reduced motion, manual interruption and disposal", () => {
    const nav = realNavigation(),
      a = session(nav),
      b = session(nav);
    a.step(12);
    b.step(12);
    expect(a.agency.getSnapshot()).toEqual(b.agency.getSnapshot());
    const before = a.agency.getPoses().map((p) => ({ x: p.x, z: p.z }));
    a.agency.setMode("paused");
    a.jump();
    a.step(8);
    expect(a.agency.getPoses().map((p) => ({ x: p.x, z: p.z }))).toEqual(
      before,
    );
    a.agency.setMode("reduced");
    a.step(8);
    expect(a.agency.getPoses().map((p) => ({ x: p.x, z: p.z }))).toEqual(
      before,
    );
    a.agency.setMode("running");
    a.step(0.1);
    const actor = a.agency.getPoses().find((p) => p.key === "samael")!;
    expect(a.agency.interrupt(actor.id, "gesture")).toBe(true);
    a.step(4);
    expect(
      distance(
        actor,
        a.agency.getPoses().find((p) => p.id === actor.id)!,
      ),
    ).toBe(0);
    a.step(20);
    expect(
      a.agency.getPoses().find((p) => p.id === actor.id)?.activity,
    ).not.toContain("Atenção manual");
    const snapshot = a.agency.getSnapshot();
    a.agency.dispose();
    a.step(20);
    expect(a.agency.getSnapshot()).toBe(snapshot);
  });
  it("perceives authorized environmental events with cooldown and no distant fabricated reaction", () => {
    const s = session(realNavigation());
    s.step(1);
    s.agency.perceive([{ type: "acted", objectId: "living:clock" }]);
    expect(s.agency.getPoses().find((a) => a.key === "aryn")?.state).toBe(
      "react",
    );
    expect(s.agency.getPoses().find((a) => a.key === "samael")?.state).not.toBe(
      "react",
    );
    s.step(3);
    const state = s.agency.getPoses().find((a) => a.key === "aryn")?.state;
    s.agency.perceive([{ type: "acted", objectId: "living:clock" }]);
    expect(s.agency.getPoses().find((a) => a.key === "aryn")?.state).toBe(
      state,
    );
  });
  it("enacts autonomous encounters, six mutable pairs, conflict, cooperation and cosmetic repair without collisions", () => {
    const nav = realNavigation(),
      s = session(nav);
    const events = new Set<string>(),
      states = new Set<string>(),
      rooms = new Set<string>(),
      cosmetic = new Set<string>();
    const collisions: string[] = [];
    let previous = s.agency.getPoses();
    for (let i = 0; i < 12000; i++) {
      s.step(0.1);
      const snap = s.agency.getSnapshot(),
        poses = s.agency.getPoses();
      for (const event of snap.recent) events.add(event);
      cosmetic.add(snap.cosmetic);
      for (const p of poses) {
        states.add(p.state);
        rooms.add(p.room);
        const last = previous.find((a) => a.id === p.id)!;
        if (distance(last, p) > 0.7) collisions.push(`jump:${p.key}`);
        if (!nav.clear(last, p, INHABITANT_ENVELOPES[p.key].travel))
          collisions.push(`static:${p.key}`);
        for (const q of poses)
          if (
            p.id < q.id &&
            distance(p, q) <
              INHABITANT_ENVELOPES[p.key].travel +
                INHABITANT_ENVELOPES[q.key].travel
          )
            collisions.push(`pair:${p.key}:${q.key}`);
      }
      previous = poses;
      if (
        snap.relations.every((r) => r.history.length > 0) &&
        cosmetic.has("repairing") &&
        snap.cosmetic === "intact" &&
        rooms.size >= 5
      )
        break;
    }
    const snap = s.agency.getSnapshot();

    expect(collisions).toEqual([]);
    expect(states).toContain("navigate");
    expect(states).toContain("work");
    expect(states).toContain("socialize");
    expect(snap.relations).toHaveLength(6);
    expect(
      snap.relations.filter((r) => r.history.length === 0).map((r) => r.id),
      [...events].join("\n"),
    ).toEqual([]);
    expect(
      [...events].some(
        (e) =>
          e.includes("contrariada") ||
          e.includes("sarcas") ||
          e.includes("atrito"),
      ),
    ).toBe(true);
    expect(cosmetic).toEqual(
      new Set(["intact", "damaged-cosmetic", "repairing"]),
    );
    expect(snap.recent.length).toBeLessThanOrEqual(8);
    expect(snap.relations.every((r) => r.history.length <= 5)).toBe(true);
    expect(rooms.size).toBeGreaterThanOrEqual(5);
  });
});

it("F4 holds a conversation indefinitely at the real position and facing, ignores incompatible attention and resumes safely", () => {
  const s = session(realNavigation());
  s.step(4);
  const before = s.agency.getPoses().find((a) => a.key === "samael")!;
  s.agency.setConversation("samael", "gesture");
  s.step(30);
  const during = s.agency.getPoses().find((a) => a.key === "samael")!;
  expect([during.x, during.z, during.facing]).toEqual([
    before.x,
    before.z,
    before.facing,
  ]);
  expect(during.state).toBe("converse");
  expect(s.agency.interrupt(during.id, "walk")).toBe(false);
  s.agency.perceive([{ type: "acted", objectId: "living:hearth" }]);
  expect(s.agency.getPoses().find((a) => a.key === "samael")?.state).toBe(
    "converse",
  );
  s.agency.setMode("paused");
  s.jump();
  s.agency.setMode("running");
  s.step(0.2);
  expect(s.agency.getPoses().find((a) => a.key === "samael")?.state).toBe(
    "converse",
  );
  s.agency.setConversation(null);
  s.step(5);
  expect(s.agency.getPoses().find((a) => a.key === "samael")?.state).not.toBe(
    "converse",
  );
  s.agency.dispose();
});
it("F4 separates narrative bonds from autonomous history and can remove its channel without erasing spontaneous relations", () => {
  const s = session(realNavigation());
  const before = s.agency
    .getSnapshot()
    .relations.find(
      (r) => r.pair.includes("samael") && r.pair.includes("aryn"),
    )!;
  const bonds = [
    {
      eventId: "fiction:consent",
      pair: ["samael", "aryn"] as const,
      change: "trust" as const,
      text: "Reparo consentido na história.",
    },
  ];
  s.agency.setNarrativeBonds(bonds);
  s.agency.setNarrativeBonds(bonds);
  const after = s.agency
    .getSnapshot()
    .relations.find((r) => r.id === before.id)!;
  expect(after.trust).toBe(before.trust + 1);
  expect(after.history).toEqual(before.history);
  expect(after.narrativeHistory).toEqual(["Reparo consentido na história."]);
  s.agency.setNarrativeBonds([]);
  expect(
    s.agency.getSnapshot().relations.find((r) => r.id === before.id)?.trust,
  ).toBe(before.trust);
  s.agency.dispose();
});
