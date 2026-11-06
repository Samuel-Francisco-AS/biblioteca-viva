import { Group, Mesh, PointLight } from "three";
import { describe, expect, it } from "vitest";

import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import { disposeObjectTree } from "./referenceScene";
import { createSessionWorldVisuals } from "./sessionWorldVisuals";

const ENTRY_TYPES = {
  reading: "book",
  viewing: "movie",
  study: "study",
  physical_activity: "physical_activity",
  work: "work",
} as const;

function session(
  kind: WorldSessionActivity["kind"],
  status: WorldSessionActivity["status"] = "active",
): WorldSessionActivity {
  return {
    sessionId: "session-1",
    entryId: "entry-1",
    entryType: ENTRY_TYPES[kind],
    instanceId: "reading-book:entry-1",
    kind,
    status,
    revision: 1,
  };
}

describe("BF-5.5F confirmed activity stage", () => {
  it("uses existing furniture, pauses and disposes once", () => {
    const building = new Group();
    const visuals = createSessionWorldVisuals(building);
    expect(visuals.root.visible).toBe(false);
    for (const kind of [
      "reading",
      "study",
      "work",
      "physical_activity",
      "viewing",
    ] as const) {
      visuals.apply(session(kind));
      expect(visuals.root.visible).toBe(true);
      expect(visuals.root.position.toArray().every(Number.isFinite)).toBe(true);
    }
    expect(building.children).toHaveLength(1);
    visuals.apply(session("study", "paused"));
    const light = visuals.root.getObjectByName("bf55f-session-light");
    expect(light).toBeInstanceOf(PointLight);
    expect((light as PointLight).intensity).toBe(0.06);
    visuals.apply(null);
    expect(visuals.root.visible).toBe(false);
    expect(building.children).toHaveLength(1);
    expect(
      visuals.root.getObjectByName("bf55f-session-rune"),
    ).toBeInstanceOf(Mesh);
    disposeObjectTree(building);
    expect(building.children).toHaveLength(0);
  });
});
