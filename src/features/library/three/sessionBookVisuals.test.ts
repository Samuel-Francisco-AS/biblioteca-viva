import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { describe, expect, it } from "vitest";
import { Box3, Raycaster, Scene, Vector3 } from "three";
import { InteractionCoordinator } from "../inhabitantInteractions";
import { createProceduralComposition } from "./proceduralComposition";
import { reconcileReadingAreaBookVisuals } from "./readingAreaBookVisuals";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import {
  createSessionBookVisuals,
  SESSION_READING_RESOURCE,
  SESSION_READING_SUPPORT,
} from "./sessionBookVisuals";
import { disposeObjectTree } from "./referenceScene";
import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import { createLivingVisuals } from "./livingVisuals";
import { LivingSession } from "../livingObjects";
import { createInhabitantSceneProps } from "./inhabitantSceneProps";
import { READING_AREA_BOOK_CAPACITY } from "./readingAreaBookLayout";

const activity: WorldSessionActivity = {
  sessionId: "session-fiction",
  entryId: "fiction-2",
  instanceId: "reading-book:fiction-2",
  entryType: "book",
  kind: "reading",
  status: "active",
  revision: 1,
};
function setup(count = 3, occupiedSurfaces = () => [] as string[]) {
  const scene = new Scene();
  const shelves = createProceduralComposition(LIBRARY_SHELVES);
  const building = createProceduralLibraryBuilding(true);
  scene.add(shelves.root, building);
  createLivingVisuals(building, scene, new LivingSession());
  createInhabitantSceneProps(building);
  const entries = Array.from({ length: count }, (_, i) => ({
    entryId: `fiction-${i}`,
    instanceId: `reading-book:fiction-${i}`,
    modelTypeId: "book-volume" as const,
    title: "Livro fictício",
    readingProgress: { currentPage: 0 },
  }));
  const visuals = reconcileReadingAreaBookVisuals(
    shelves,
    entries,
    new Map(),
  ).visible;
  const books = new Map(visuals.map((v) => [v.book.instanceId, v]));
  const interactions = new InteractionCoordinator();
  let time = 0;
  const controller = createSessionBookVisuals({
    books: () => books,
    obstacleRoots: [building, shelves.root],
    interactions,
    now: () => time,
    occupiedSurfaces,
  });
  function step(seconds: number) {
    for (let t = 0; t < seconds; t += 0.05) {
      time += 50;
      controller.update(0.05, false);
    }
  }
  return {
    scene,
    shelves,
    entries,
    books,
    visuals,
    interactions,
    controller,
    step,
    now: () => time,
    dispose() {
      controller.dispose();
      disposeObjectTree(scene);
    },
  };
}
describe("BF-5.5F2A original session book", () => {
  it.each([
    [3, activity.instanceId],
    [3, SESSION_READING_RESOURCE],
    [40, activity.instanceId],
    [40, SESSION_READING_RESOURCE],
  ] as const)(
    "recovers a lost lease after %s seconds (%s) without moving or stealing ownership",
    (seconds, resource) => {
      const f = setup();
      const visual = f.visuals[2];
      const home = visual.node.position.clone();
      f.controller.apply(activity);
      f.step(seconds);
      const before = visual.node.position.clone();
      const opening = f.controller.snapshot().opening;
      f.interactions.release(
        resource,
        "session",
        `session:${activity.sessionId}`,
      );
      expect(
        f.interactions.reserve(resource, "lua", "other-interaction", f.now()),
      ).not.toBeNull();
      f.step(1);
      expect(visual.node.position.equals(before)).toBe(true);
      expect(f.controller.snapshot().opening).toBe(opening);
      expect(f.controller.candidate()).toBeNull();
      expect(
        f.interactions.owns(resource, "lua", "other-interaction", f.now()),
      ).toBe(true);
      f.controller.apply(null);
      f.interactions.release(resource, "lua", "other-interaction");
      f.controller.update(0.05, false);
      expect(visual.node.position.distanceTo(before)).toBeLessThan(0.1);
      f.step(45);
      expect(visual.node.position.equals(home)).toBe(true);
      expect(f.controller.snapshot().opening).toBe(0);
      expect(f.interactions.snapshot()).toHaveLength(0);
      f.dispose();
    },
  );
  it("extracts, flies, lands and opens the SAME selectable in a full collection; returns on completion", () => {
    const f = setup(READING_AREA_BOOK_CAPACITY);
    const original = f.visuals[2],
      node = original.node,
      root = original.representation.root;
    const home = node.position.clone();
    f.controller.apply(activity);
    f.step(2);
    expect(f.controller.snapshot().state).toBe("transport");
    expect(node.position.equals(home)).toBe(false);
    expect(original.sessionControlled).toBe(true);
    const position = node.position.clone();
    reconcileReadingAreaBookVisuals(f.shelves, f.entries, f.books);
    expect(node.position.equals(position)).toBe(true);
    f.step(40);
    expect(f.controller.snapshot()).toMatchObject({
      state: "resting",
      opening: 1,
    });
    expect(original.node).toBe(node);
    expect(original.representation.root).toBe(root);
    const matching: unknown[] = [];
    f.scene.traverse((o) => {
      if (o.userData.readingAreaBookInstanceId === activity.instanceId)
        matching.push(o);
    });
    expect(matching).toEqual([node]);
    const box = new Box3().setFromObject(node);
    expect(box.min.y).toBeCloseTo(SESSION_READING_SUPPORT.y + 0.006, 3);
    const center = box.getCenter(new Vector3());
    const hits = new Raycaster(
      center.clone().add(new Vector3(0, 2, 0)),
      new Vector3(0, -1, 0),
    ).intersectObject(node, true);
    expect(hits.length).toBeGreaterThan(0);
    expect(f.interactions.snapshot().map((l) => l.resourceId)).toContain(
      SESSION_READING_RESOURCE,
    );
    f.controller.apply(null);
    f.step(45);
    expect(f.controller.snapshot().state).toBe("shelf");
    expect(node.position.equals(home)).toBe(true);
    expect(f.interactions.snapshot()).toHaveLength(0);
    expect(original.representation.coverHinge.rotation.y).toBe(0);
    f.controller.apply(activity); // delayed old callback cannot resurrect completed session
    f.step(2);
    expect(f.controller.snapshot().state).toBe("shelf");
    f.dispose();
  });
  it("cancels mid-transport continuously, pauses at safe rest, resumes idempotently and recovers on reopen", () => {
    const f = setup();
    const home = f.visuals[2].node.position.clone();
    f.controller.apply(activity);
    f.step(3);
    const before = f.visuals[2].node.position.clone();
    f.controller.apply(null);
    f.controller.update(0.05, false);
    expect(f.visuals[2].node.position.distanceTo(before)).toBeLessThan(0.1);
    f.step(30);
    expect(f.visuals[2].node.position.equals(home)).toBe(true);
    const second = { ...activity, sessionId: "session-second", revision: 2 };
    f.controller.apply(second);
    f.step(3);
    f.controller.apply({ ...second, status: "paused", revision: 3 });
    f.step(40);
    expect(f.controller.snapshot()).toMatchObject({
      state: "resting",
      opening: 0,
    });
    f.controller.apply({ ...second, revision: 4 });
    f.step(3);
    expect(f.controller.snapshot().opening).toBe(1);
    f.controller.apply({ ...second, status: "paused", revision: 3 });
    f.step(1);
    expect(f.controller.snapshot().opening).toBe(1);
    f.dispose();
    expect(f.interactions.snapshot()).toHaveLength(0);
    const reopened = setup();
    reopened.controller.apply(second);
    reopened.step(40);
    expect(reopened.controller.snapshot().state).toBe("resting");
    expect(reopened.visuals).toHaveLength(3);
    reopened.dispose();
  });
  it("does not create overflow books, steal an occupied support or teleport for reduced motion", () => {
    const occupied = setup(3, () => ["bf4-prop:2"]);
    occupied.controller.apply(activity);
    occupied.step(5);
    expect(occupied.controller.snapshot().state).toBe("shelf");
    occupied.dispose();
    const f = setup();
    f.controller.apply({
      ...activity,
      instanceId: "reading-book:absent",
      entryId: "absent",
    });
    f.step(1);
    expect(f.interactions.snapshot()).toHaveLength(0);
    f.controller.apply({ ...activity, sessionId: "reduced" });
    f.controller.update(10, true);
    expect(f.controller.snapshot().state).toBe("shelf");
    f.step(3);
    const before = f.visuals[2].node.position.clone();
    f.controller.update(0.05, true);
    expect(f.visuals[2].node.position.distanceTo(before)).toBeLessThan(0.1);
    f.dispose();
    expect(f.interactions.snapshot()).toHaveLength(0);
  });
});

it.each(["reading-shelf-01", "reading-shelf-02", "reading-shelf-03"])(
  "validates physical departure, passage route and return from %s",
  (shelf) => {
    const f = setup(READING_AREA_BOOK_CAPACITY);
    const original = f.visuals.filter(
      (v) => v.placement.hostInstanceId === shelf,
    )[2];
    const home = original.node.position.clone();
    f.controller.apply({
      ...activity,
      entryId: original.book.entryId,
      instanceId: original.book.instanceId,
    });
    f.step(90);
    expect(f.controller.snapshot()).toMatchObject({
      state: "resting",
      opening: 1,
    });
    expect(original.node.position.equals(home)).toBe(false);
    f.controller.apply(null);
    f.step(90);
    expect(original.node.position.equals(home)).toBe(true);
    expect(f.interactions.snapshot()).toHaveLength(0);
    f.dispose();
  },
);

it("does not move through a real obstacle or another inhabitant, and releases on disposal during transport", () => {
  const f = setup();
  f.controller.apply(activity);
  f.step(1);
  const visual = f.visuals[2];
  const home = new Vector3(...visual.placement.position);
  const position = visual.node.getWorldPosition(new Vector3());
  const pose = {
    id: "character:aryn" as const,
    key: "aryn" as const,
    label: "Aryn",
    x: position.x,
    z: position.z + 0.4,
    state: "idle" as const,
    activity: "",
    room: "room-a",
    destination: null,
    facing: 0,
    action: "idle" as const,
    available: true,
    interactionObjectId: null,
    interactionState: null,
  };
  const before = visual.node.position.clone();
  for (let i = 0; i < 20; i++) f.controller.update(0.05, false, [pose]);
  expect(visual.node.position.equals(before)).toBe(true);
  f.controller.dispose();
  expect(visual.node.position.equals(home)).toBe(true);
  expect(f.interactions.snapshot()).toHaveLength(0);
  f.controller.apply(activity);
  f.step(5);
  expect(visual.node.position.equals(home)).toBe(true);
  f.dispose();
});
