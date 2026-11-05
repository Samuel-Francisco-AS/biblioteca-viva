import { expect, it } from "vitest";
import { Group } from "three";
import {
  createLivingScrollVisuals,
  enchantmentAt,
} from "./livingScrollVisuals";
import { InhabitantAgency } from "../inhabitantAgency";
import { InhabitantNavigation } from "../inhabitantNavigation";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { disposeObjectTree } from "./referenceScene";
const scroll = {
  id: "scroll:note:fiction",
  annotationId: "fiction",
  entryId: "book",
  kind: "note" as const,
  category: "book" as const,
  updatedAt: "2026-11-05T12:00:00.000Z",
};
it("has an enchantment cycle independent of day and night", () => {
  expect(enchantmentAt(10)).toBe(0);
  expect(enchantmentAt(75)).toBe(1);
  expect(enchantmentAt(90)).toBe(0);
});
it("autonomously reserves, reaches and examines a real scroll through the existing agency", () => {
  let now = 0;
  const building = createProceduralLibraryBuilding(true);
  const visuals = createLivingScrollVisuals(building, [scroll]);
  const agency = new InhabitantAgency(
    new InhabitantNavigation(collectInhabitantObstacles([building])),
    {
      now: () => now,
      hour: () => 12,
      seed: 51,
      scrollCandidates: visuals.candidates,
    },
  );
  agency.setAvailable("character:samael", true);
  agency.setAvailable("character:aryn", true);
  agency.setAvailable("character:ytha", true);
  agency.setAvailable("character:lua", true);
  agency.setMode("running");
  const states = new Set<string>();
  const anchor = new Group();
  anchor.position.set(-3, 1.3, -2);
  for (let i = 0; i < 2500; i++) {
    now += 100;
    agency.update();
    const poses = agency.getPoses();
    const owners = poses.filter((p) => p.interactionObjectId === scroll.id);
    expect(owners.length).toBeLessThanOrEqual(1);
    owners.forEach((p) => states.add(p.interactionState!));
    visuals.update(0.1, false, poses, () => anchor);
    if (states.has("returning")) break;
  }
  expect(states).toContain("approaching");
  expect(states).toContain("picking");
  expect(states).toContain("carrying");
  expect(states).toContain("returning");
  agency.setMode("paused");
  expect(agency.getPoses().every((p) => p.interactionObjectId === null)).toBe(
    true,
  );
  agency.dispose();
  disposeObjectTree(building);
});

it("recovers the same carried object when its agency is discarded during transport", () => {
  let now = 0;
  const building = createProceduralLibraryBuilding(true);
  const visuals = createLivingScrollVisuals(building, [scroll]);
  const agency = new InhabitantAgency(
    new InhabitantNavigation(collectInhabitantObstacles([building])),
    {
      now: () => now,
      hour: () => 12,
      seed: 51,
      scrollCandidates: visuals.candidates,
    },
  );
  for (const key of ["samael", "aryn", "ytha", "lua"])
    agency.setAvailable(`character:${key}`, true);
  agency.setMode("running");
  const anchor = new Group();
  anchor.position.set(-3, 1.3, -2);
  let carrying = false;
  for (let i = 0; i < 2500; i++) {
    now += 100;
    agency.update();
    const poses = agency.getPoses();
    visuals.update(0.1, false, poses, () => anchor);
    if (
      poses.some(
        (p) =>
          p.interactionObjectId === scroll.id &&
          p.interactionState === "carrying",
      )
    ) {
      carrying = true;
      break;
    }
  }
  expect(carrying).toBe(true);
  const original = visuals.selectables[0].root;
  agency.dispose();
  expect(agency.getPoses().every((p) => p.interactionObjectId === null)).toBe(
    true,
  );
  visuals.update(0.1, true, agency.getPoses(), () => anchor);
  expect(visuals.selectables[0].root).toBe(original);
  expect(original.position.y).toBeCloseTo(visuals.selectables[0].rest.y);
  disposeObjectTree(building);
  expect(building.getObjectById(original.id)).toBeUndefined();
});
