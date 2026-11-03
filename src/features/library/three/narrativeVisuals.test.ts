import { it, expect, vi } from "vitest";
import { Group, Scene, Mesh, MeshLambertMaterial, PointLight } from "three";
import { createNarrativeVisuals } from "./narrativeVisuals";
import { NarrativeSession } from "../narrative/session";
import { LivingSession } from "../livingObjects";
import { createLivingVisuals } from "./livingVisuals";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { disposeObjectTree } from "./referenceScene";
it("F4 owns visual consequences independently of BF-4E's secret; restores flower color and releases its resources once", () => {
  const scene = new Scene(),
    building = createProceduralLibraryBuilding(true);
  scene.add(building);
  const living = new LivingSession();
  createLivingVisuals(building, scene, living);
  const before = living.getSnapshot(),
    events = vi.fn();
  living.onEvents(events);
  const visuals = createNarrativeVisuals(building),
    session = new NarrativeSession();
  session.open("petals");
  visuals.update(session.getSnapshot(), 0.05, true);
  const flower = building.getObjectByName("narrative-memory-flower")!;
  const petal = flower.children.find(
    (c): c is Mesh =>
      c instanceof Mesh &&
      c.material instanceof MeshLambertMaterial &&
      c.material.color.getHex() === 0x8a8490,
  )!;
  expect(petal).toBeDefined();
  for (const key of ["lua", "window", "living-map"])
    expect(
      session.choose(`petals:choice:${key}`, session.getSnapshot().revision),
    ).toBe(true);
  visuals.update(session.getSnapshot(), 0.05, true);
  expect(petal.material).toBeInstanceOf(MeshLambertMaterial);
  if (petal.material instanceof MeshLambertMaterial)
    expect(petal.material.color.getHex()).toBe(0xe99bc2);
  session.open("rift");
  visuals.update(session.getSnapshot(), 0.05, true);
  const rift = building.getObjectByName("narrative-lilac-rift")!;
  expect(rift.visible).toBe(true);
  expect(
    rift.children.find((c): c is PointLight => c instanceof PointLight)
      ?.intensity,
  ).toBeGreaterThan(0);
  expect(living.getSnapshot()).toBe(before);
  expect(events).not.toHaveBeenCalled();
  for (const key of [
    "omen-ask",
    "omen-map",
    "visit-samael",
    "samael-proof",
    "visit-aryn",
    "aryn-consent",
    "visit-ytha",
    "ytha-lead",
    "visit-lua",
    "lua-review",
    "gather",
    "experiment",
    "experiment-ytha",
    "energy-count",
    "structure-open",
    "life-voice",
    "finish-open",
  ])
    expect(
      session.choose(`rift:choice:${key}`, session.getSnapshot().revision),
    ).toBe(true);
  visuals.update(session.getSnapshot(), 0.05, true);
  if (petal.material instanceof MeshLambertMaterial)
    expect(petal.material.color.getHex()).toBe(0xb18be0);
  expect(
    session.choose("rift:choice:surge-rhythm", session.getSnapshot().revision),
  ).toBe(true);
  visuals.update(session.getSnapshot(), 0.05, true);
  if (petal.material instanceof MeshLambertMaterial)
    expect(petal.material.color.getHex()).toBe(0xe99bc2);
  expect(
    rift.children.find((c): c is PointLight => c instanceof PointLight)
      ?.intensity,
  ).toBe(0);
  expect(living.getSnapshot()).toBe(before);
  expect(events).not.toHaveBeenCalled();
  session.reset();
  visuals.update(session.getSnapshot(), 0.05, true);
  expect(rift.visible).toBe(false);
  expect(flower.visible).toBe(false);
  const resources = new Set<MeshLambertMaterial>();
  visuals.root.traverse((c) => {
    if (c instanceof Mesh && c.material instanceof MeshLambertMaterial)
      resources.add(c.material);
  });
  const releases = [...resources].map((m) => vi.spyOn(m, "dispose"));
  disposeObjectTree(scene);
  for (const release of releases) expect(release).toHaveBeenCalledOnce();
  expect(building.parent === null && scene.children.length === 0).toBe(true);
  living.dispose();
  session.dispose();
});
it("does not create a second owner for preexisting environmental props", () => {
  const building = new Group(),
    sentinel = new Group();
  sentinel.name = "living:plant";
  building.add(sentinel);
  const visuals = createNarrativeVisuals(building);
  expect(sentinel.parent).toBe(building);
  expect(visuals.root.parent).toBe(building);
  disposeObjectTree(building);
});
