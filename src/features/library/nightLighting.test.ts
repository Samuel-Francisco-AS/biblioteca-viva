import { describe, expect, it } from "vitest";
import { LivingSession } from "./livingObjects";
import {
  NIGHT_LAMPS,
  NightLightingSession,
  nightCycleKey,
  parseNightLightingCheckpoint,
} from "./nightLighting";

describe("BF-5.5C independent night lighting", () => {
  it("finds existing shades in all five rooms and excludes the secret lamp", () => {
    expect(NIGHT_LAMPS).toHaveLength(9);
    expect(new Set(NIGHT_LAMPS.map((lamp) => lamp.id)).size).toBe(9);
    expect(new Set(NIGHT_LAMPS.map((lamp) => lamp.roomId)).size).toBe(5);
    expect(
      NIGHT_LAMPS.some((lamp) => lamp.id === "night-lamp:bf4-prop:0"),
    ).toBe(false);
    expect(
      NIGHT_LAMPS.every((lamp) =>
        [lamp.x, lamp.y, lamp.z].every(Number.isFinite),
      ),
    ).toBe(true);
  });

  it("spans midnight, starts usable at dusk and reaches full brightness without an NPC", () => {
    let now = new Date(2026, 10, 5, 17, 59, 59);
    const session = new NightLightingSession(() => now);
    expect(session.pending()).toHaveLength(0);
    now = new Date(2026, 10, 5, 18, 0, 0);
    session.refreshContext();
    expect(session.pending()).toHaveLength(NIGHT_LAMPS.length);
    expect(session.power(NIGHT_LAMPS[0].id)).toBe(0.68);
    now = new Date(2026, 10, 5, 18, 0, 46);
    expect(session.power(NIGHT_LAMPS[0].id)).toBe(1);
    now = new Date(2026, 10, 6, 3);
    session.refreshContext();
    expect(session.getSnapshot().cycleKey).toBe("2026-11-05");
    now = new Date(2026, 10, 6, 6);
    session.refreshContext();
    expect(session.getSnapshot().cycleKey).toBeNull();
    expect(session.power(NIGHT_LAMPS[0].id)).toBe(0);
    expect(nightCycleKey(new Date(2026, 10, 6, 18))).toBe("2026-11-06");
  });

  it("keeps the BF-4E story lamp manual even while the other shades glow", () => {
    const date = new Date(2026, 10, 5, 22);
    const ritual = new NightLightingSession(() => date);
    const story = new LivingSession(() => date);
    for (const lamp of ritual.pending()) ritual.complete(lamp.id);
    expect(story.getSnapshot().discovery).toBe(0);
    expect(story.getSnapshot().objects["living:lamp"]?.active).toBe(false);
    story.act("living:lamp", "toggle");
    expect(story.getSnapshot().discovery).toBe(1);
    story.act("living:lamp", "toggle");
    expect(story.getSnapshot().objects["living:lamp"]?.active).toBe(false);
    expect(ritual.pending()).toHaveLength(0);
  });

  it("records gestures once per cycle and reconstructs safe state after reopening", () => {
    const date = new Date(2026, 10, 5, 22);
    const session = new NightLightingSession(() => date);
    const id = NIGHT_LAMPS[0].id;
    expect(session.complete(id)).toBe(true);
    expect(session.complete(id)).toBe(false);
    const saved = session.capture();
    expect(saved.completedLampIds).toEqual([id]);
    const restored = new NightLightingSession(() => date);
    expect(restored.restore(saved)).toBe(true);
    expect(restored.pending()).toHaveLength(NIGHT_LAMPS.length - 1);
    expect(restored.restore({ ...saved, completedLampIds: [id, id] })).toBe(
      false,
    );
    expect(restored.restore({ ...saved, completedLampIds: ["unknown"] })).toBe(
      false,
    );
    expect(
      parseNightLightingCheckpoint({ ...saved, version: 2 }),
    ).toBeUndefined();
    expect(restored.restore({ ...saved, cycleKey: "2026-11-04" })).toBe(false);
  });
});
