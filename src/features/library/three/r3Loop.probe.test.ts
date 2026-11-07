import { mkdirSync, writeFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import {
  Color,
  HemisphereLight,
  DirectionalLight,
  Scene,
  Vector3,
  Box3,
} from "three";
import { LivingSession } from "../livingObjects";
import { NightLightingSession } from "../nightLighting";
import { InteractionCoordinator } from "../inhabitantInteractions";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { createProceduralComposition } from "./proceduralComposition";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { reconcileReadingAreaBookVisuals } from "./readingAreaBookVisuals";
import { createLivingVisuals } from "./livingVisuals";
import { createLivingScrollVisuals } from "./livingScrollVisuals";
import { createSessionBookVisuals } from "./sessionBookVisuals";
import { disposeObjectTree } from "./referenceScene";

// Deterministic host work counters, no renderer/GPU or timing thresholds.
// BV_R3_PROBE=before|after writes a reviewable artifact; normal CI checks behavior.
it("R3 paired probe: 600 idle frames, identical day world and resting personal book", () => {
  const scene = new Scene();
  scene.background = new Color(0x18342d);
  scene.add(new HemisphereLight(0xffffff, 0xffffff, 2), new DirectionalLight());
  const building = createProceduralLibraryBuilding(true);
  const shelves = createProceduralComposition(LIBRARY_SHELVES);
  scene.add(building, shelves.root);
  const date = new Date(2026, 10, 7, 12);
  const living = createLivingVisuals(
    building,
    scene,
    new LivingSession(() => date),
    new NightLightingSession(() => date),
  );
  const scrolls = createLivingScrollVisuals(
    building,
    [
      {
        id: "scroll:note:fiction",
        annotationId: "fiction",
        entryId: "fiction-2",
        kind: "note",
        category: "book",
        updatedAt: "2026-11-07T12:00:00.000Z",
      },
    ],
    [],
  );
  const visuals = reconcileReadingAreaBookVisuals(
    shelves,
    Array.from({ length: 3 }, (_, i) => ({
      entryId: `fiction-${i}`,
      instanceId: `reading-book:fiction-${i}`,
      modelTypeId: "book-volume" as const,
      title: "Livro fictício",
      readingProgress: { currentPage: 0 },
    })),
    new Map(),
  ).visible;
  const interactions = new InteractionCoordinator();
  let now = 0;
  const book = createSessionBookVisuals({
    books: () => new Map(visuals.map((v) => [v.book.instanceId, v])),
    obstacleRoots: [building, shelves.root],
    interactions,
    now: () => now,
  });
  book.apply({
    sessionId: "fiction-session",
    entryId: "fiction-2",
    instanceId: "reading-book:fiction-2",
    entryType: "book",
    kind: "reading",
    status: "active",
    revision: 1,
  });
  for (let i = 0; i < 900; i++) {
    now += 50;
    book.update(0.05, false);
  }
  expect(book.snapshot()).toMatchObject({ state: "resting", opening: 1 });
  for (let i = 0; i < 600; i++) living.update(1 / 60, false);
  const traverse = vi.spyOn(scene, "traverse");
  const lerp = vi.spyOn(Color.prototype, "lerp");
  const bounds = vi.spyOn(Box3.prototype, "setFromObject");
  const opening = vi.spyOn(visuals[2].representation.animation, "setOpening");
  const glow = vi.spyOn(visuals[2].representation, "setSessionGlow");
  const reserve = vi.spyOn(interactions, "reserve");
  const clone = vi.spyOn(Vector3.prototype, "clone");
  for (let i = 0; i < 600; i++) {
    now += 1000 / 60;
    living.update(1 / 60, false);
    book.update(1 / 60, false);
    book.navigationObstacles();
    scrolls.update(1 / 60, false, [], () => null);
  }
  const counters = {
    frames: 600,
    sceneTraversals: traverse.mock.calls.length,
    colorLerps: lerp.mock.calls.length,
    boxFromObject: bounds.mock.calls.length,
    coverWrites: opening.mock.calls.length,
    glowWrites: glow.mock.calls.length,
    leaseReservations: reserve.mock.calls.length,
    vectorClones: clone.mock.calls.length,
  };
  vi.restoreAllMocks();
  expect(book.snapshot()).toMatchObject({ state: "resting", opening: 1 });
  expect(interactions.snapshot()).toHaveLength(2);
  expect(scrolls.hasFlight()).toBe(false);
  const label = process.env.BV_R3_PROBE;
  if (label) {
    const path = "docs/audits/evidence/bv-r3";
    mkdirSync(path, { recursive: true });
    writeFileSync(
      `${path}/${label}.json`,
      `${JSON.stringify({ scenario: "600x1/60s; day; three books; one resting scroll; personal reading landed; no GPU", counters }, null, 2)}\n`,
    );
  }
  book.dispose();
  disposeObjectTree(scene);
});
