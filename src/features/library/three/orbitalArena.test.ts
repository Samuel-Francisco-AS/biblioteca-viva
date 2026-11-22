import { Box3, Raycaster, Vector3 } from "three";
import { expect, it } from "vitest";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
import {
  createOrbitalArena,
  ORBITAL_ARENA_ID,
  ORBITAL_RADIUS,
} from "./orbitalArena";
import { disposeObjectTree } from "./referenceScene";

it("orbits the middle library ring outside every room, keeping the same pickable grimoire", () => {
  const orbital = createOrbitalArena();
  const book = orbital.root.getObjectByName("orbital-living-grimoire");
  expect(book).toBeDefined();
  expect(orbital.descriptor.id).toBe(ORBITAL_ARENA_ID);
  const first = orbital.root.position.clone(),
    angle = book!.rotation.y;
  for (let i = 0; i < 8400; i++) {
    orbital.update(0.05, false);
    if (i % 200 !== 0) continue;
    const bounds = new Box3().setFromObject(orbital.root);
    expect(
      Math.hypot(orbital.root.position.x, orbital.root.position.z),
    ).toBeCloseTo(ORBITAL_RADIUS);
    expect(bounds.min.y).toBeGreaterThan(3);
    for (const room of LIBRARY_ROOMS)
      expect(
        bounds.max.x < room.minX ||
          bounds.min.x > room.maxX ||
          bounds.max.z < room.minZ ||
          bounds.min.z > room.maxZ,
        JSON.stringify({
          position: orbital.root.position.toArray(),
          min: bounds.min.toArray(),
          max: bounds.max.toArray(),
          room,
        }),
      ).toBe(true);
    const center = bounds.getCenter(new Vector3());
    const ray = new Raycaster(
      center.clone().add(new Vector3(0, 0, 10)),
      new Vector3(0, 0, -1),
    );
    expect(ray.intersectObject(orbital.root, true).length).toBeGreaterThan(0);
  }
  expect(orbital.root.position.distanceTo(first)).toBeLessThan(0.01);
  expect(book!.rotation.y).toBeGreaterThan(angle + 100);
  disposeObjectTree(orbital.root);
});
it("freezes reduced motion and resumes without wall-clock jumps or rebuilding a selectable", () => {
  const orbital = createOrbitalArena(),
    identity = orbital.root;
  orbital.update(0.05, false);
  const p = identity.position.clone();
  const book = identity.getObjectByName("orbital-living-grimoire")!,
    r = book.rotation.y;
  orbital.update(600, true);
  expect(identity.position.equals(p)).toBe(true);
  expect(book.rotation.y).toBe(r);
  orbital.update(0.05, false);
  expect(identity.position.distanceTo(p)).toBeLessThan(0.03);
  expect(orbital.root).toBe(identity);
  disposeObjectTree(identity);
});

it.each([60, 30, 20, 10])(
  "keeps real angular speed and articulated effects at %i FPS",
  (fps) => {
    const orbital = createOrbitalArena();
    const seconds = 12;
    for (let i = 0; i < seconds * fps; i++) orbital.update(1 / fps, false);
    const angle = 1.8 + (seconds * Math.PI * 2) / 420;
    expect(orbital.root.position.x).toBeCloseTo(Math.sin(angle) * 28, 9);
    expect(orbital.root.position.z).toBeCloseTo(Math.cos(angle) * 28, 9);
    expect(orbital.root.position.y).toBeCloseTo(5.4, 9);
    expect(
      orbital.root.getObjectByName("orbital-living-grimoire")!.rotation.y,
    ).toBeCloseTo(0.3 + seconds * 0.4, 9);
    disposeObjectTree(orbital.root);
  },
);
it("consumes irregular active intervals without losing time and ignores invalid deltas", () => {
  const orbital = createOrbitalArena();
  for (const delta of [0.016, 0.034, 0.1, 0.25, 0.6])
    orbital.update(delta, false);
  const angle = 1.8 + (Math.PI * 2) / 420;
  expect(orbital.root.position.x).toBeCloseTo(Math.sin(angle) * 28, 9);
  const position = orbital.root.position.clone();
  for (const delta of [NaN, Infinity, -1, 0]) orbital.update(delta, false);
  expect(orbital.root.position.equals(position)).toBe(true);
  disposeObjectTree(orbital.root);
});
