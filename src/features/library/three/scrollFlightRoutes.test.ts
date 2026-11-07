import { expect, it } from "vitest";
import { Vector3 } from "three";
import {
  SCROLL_SURFACES,
  flightObstacles,
  planScrollFlight,
  clearFlight,
  sampleScrollFlight,
} from "./scrollFlightRoutes";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createLivingScrollVisuals } from "./livingScrollVisuals";
import { disposeObjectTree } from "./referenceScene";
const scroll = {
  id: "scroll:note:fixture",
  annotationId: "fixture",
  entryId: "fiction",
  kind: "note" as const,
  category: "book" as const,
  updatedAt: "2026-11-05T12:00:00.000Z",
};
it("validates real routes between distinct furniture against the actual building", () => {
  const building = createProceduralLibraryBuilding(true);
  const boxes = flightObstacles(building);
  let count = 0;
  for (const from of SCROLL_SURFACES)
    for (const to of SCROLL_SURFACES) {
      const route = planScrollFlight(from, to, boxes);
      if (!route) continue;
      count++;
      expect(from.furnitureId).not.toBe(to.furnitureId);
      expect(from.roomId).toBe(to.roomId);
      expect(clearFlight(route, boxes)).toBe(true);
      for (let i = 0; i <= 100; i++) {
        const p = sampleScrollFlight(route, i / 100);
        expect(boxes.some((b) => b.containsPoint(p))).toBe(false);
      }
    }
  expect(count).toBeGreaterThan(4);
  disposeObjectTree(building);
});
it("autonomously departs, lands on another furnishing, preserves identity and recovers reduced motion", () => {
  const building = createProceduralLibraryBuilding(true);
  const boxes = flightObstacles(building);
  const visual = createLivingScrollVisuals(building, [scroll]);
  const s = visual.selectables[0];
  const original = s.root;
  const origin = s.rest.furnitureId;
  let airborne = false;
  for (let i = 0; i < 600; i++) {
    visual.update(0.1, false, [], () => null);
    airborne ||= !!s.flight;
    if (airborne && !s.flight) break;
  }
  expect(
    airborne,
    JSON.stringify(
      SCROLL_SURFACES.map((from) => [
        from.id,
        SCROLL_SURFACES.filter((to) => planScrollFlight(from, to, boxes)).map(
          (to) => to.id,
        ),
      ]),
    ),
  ).toBe(true);
  expect(s.rest.furnitureId).not.toBe(origin);
  expect(s.root).toBe(original);
  expect(visual.selectables).toHaveLength(1);
  for (let i = 0; i < 500; i++) {
    visual.update(0.1, false, [], () => null);
    if (s.flight) break;
  }
  expect(s.flight).not.toBeNull();
  expect(visual.candidates()).toEqual([]);
  visual.update(0.1, true, [], () => null);
  expect(s.flight).toBeNull();
  expect(
    s.root.position.distanceTo(new Vector3(s.rest.x, s.rest.y, s.rest.z)),
  ).toBeLessThan(0.001);
  disposeObjectTree(building);
  expect(building.children).toHaveLength(0);
});

it("disposes an airborne scroll and reopens an empty projection without a ghost object", () => {
  const building = createProceduralLibraryBuilding(true);
  const visuals = createLivingScrollVisuals(building, [scroll]);
  const item = visuals.selectables[0];
  for (let i = 0; i < 500 && !item.flight; i++)
    visuals.update(0.1, false, [], () => null);
  expect(item.flight).not.toBeNull();
  const original = item.root;
  disposeObjectTree(building);
  expect(building.getObjectById(original.id)).toBeUndefined();
  const restored = createLivingScrollVisuals(building, []);
  expect(restored.selectables).toEqual([]);
  expect(restored.candidates()).toEqual([]);
});
