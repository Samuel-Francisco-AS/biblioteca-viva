import { SCENIC_BOOK_ANCHORS } from "./libraryFurnishingLayout";
import { LIBRARY_CIRCULATION } from "../librarySpatialLayout";
import { rectanglesOverlap } from "../librarySpatialGeometry";
import { describe, expect, it, vi } from "vitest";
import {
  Box3,
  HemisphereLight,
  PointLight,
  Mesh,
  Object3D,
  Scene,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";
function isMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material | Material[]> {
  return object instanceof Mesh;
}
import { LivingSession } from "../livingObjects";
import { NIGHT_LAMPS, NightLightingSession } from "../nightLighting";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createLivingVisuals } from "./livingVisuals";
import { disposeObjectTree } from "./referenceScene";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
describe("living visuals", () => {
  it("illuminates nine real shades after dusk and preserves the manually controlled secret lamp", () => {
    let now = new Date(2026, 10, 5, 17, 59);
    const night = new NightLightingSession(() => now);
    const scene = new Scene();
    const building = createProceduralLibraryBuilding(true);
    scene.add(building);
    const living = new LivingSession(() => now);
    const visuals = createLivingVisuals(building, scene, living, night);
    const fixtures = NIGHT_LAMPS.map((fixture) =>
      building.getObjectByName(`${fixture.id}:light`),
    );
    expect(fixtures).toHaveLength(9);
    expect(fixtures.every((fixture) => fixture instanceof PointLight)).toBe(
      true,
    );
    visuals.update(0, true);
    expect(
      fixtures.every((fixture) => (fixture as PointLight).intensity === 0),
    ).toBe(true);
    expect(fixtures.every((fixture) => fixture?.visible === false)).toBe(true);
    now = new Date(2026, 10, 5, 18, 0);
    night.refreshContext();
    living.refreshContext();
    visuals.update(0, true);
    expect(
      fixtures.every((fixture) => (fixture as PointLight).intensity > 0),
    ).toBe(true);
    expect(
      visuals.selectables.find((item) => item.descriptor.id === "living:lamp")
        ?.light?.intensity,
    ).toBe(0);
    expect(living.getSnapshot().discovery).toBe(0);
    expect(fixtures.every((fixture) => fixture?.visible)).toBe(true);
    night.complete(NIGHT_LAMPS[0].id);
    visuals.update(0, true);
    expect((fixtures[0] as PointLight).intensity).toBe(4.2);
    now = new Date(2026, 10, 6, 6);
    night.refreshContext();
    living.refreshContext();
    visuals.update(0, true);
    expect(
      fixtures.every((fixture) => (fixture as PointLight).intensity === 0),
    ).toBe(true);
    expect(fixtures.every((fixture) => fixture?.visible === false)).toBe(true);
    disposeObjectTree(scene);
  });

  it("animates real pieces, lights the scene and disposes resources exactly once", () => {
    const scene = new Scene();
    const building = createProceduralLibraryBuilding(true);
    scene.add(building);
    const light = new HemisphereLight(0xffffff, 0xffffff, 2);
    scene.add(light);
    const session = new LivingSession();
    const visuals = createLivingVisuals(building, scene, session);
    const find = (id: string) => {
      const item = visuals.selectables.find((i) => i.descriptor.id === id);
      if (!item) throw new Error(id);
      return item;
    };
    visuals.update(0, true);
    expect(find("living:lamp").light?.intensity).toBe(0);
    session.act("living:lamp", "toggle");
    visuals.update(0, true);
    expect(find("living:lamp").light?.intensity).toBeGreaterThan(0);
    session.act("living:cabinet", "toggle");
    visuals.update(0, true);
    // Drawer now opens into the accessible room, away from the rear wall.
    expect(find("living:cabinet").moving.position.z).toBe(0.42);
    session.act("living:cabinet", "toggle");
    visuals.update(0, true);
    expect(find("living:cabinet").moving.position.z).toBeCloseTo(0);
    session.act("living:seat", "touch");
    visuals.update(0, true);
    expect(
      find("living:seat").moving.getObjectByName("living-seat-cushion"),
    ).toBeDefined();
    expect(find("living:seat").moving.scale.y).toBe(0.65);
    session.act("living:globe", "turn");
    visuals.update(0, true);
    expect(find("living:globe").moving.rotation.y).toBe(Math.PI / 2);
    session.act("living:book", "toggle");
    visuals.update(0, true);
    expect(find("living:book").moving.rotation.z).toBe(2.1);
    session.setAtmosphere("noturna");
    visuals.update(0, true);
    expect(light.intensity).toBe(1.08);
    for (const item of visuals.selectables) {
      const room = LIBRARY_ROOMS.find(
        (r) => r.id === `room-${item.object.room.toLowerCase()}`,
      );
      if (!room) throw new Error("room");
      const bounds = new Box3().setFromObject(item.root);
      for (const corridor of LIBRARY_CIRCULATION)
        expect(
          rectanglesOverlap(corridor, {
            minX: bounds.min.x,
            maxX: bounds.max.x,
            minZ: bounds.min.z,
            maxZ: bounds.max.z,
          }),
          item.descriptor.id,
        ).toBe(false);
      expect(bounds.min.x).toBeGreaterThan(room.minX);
      expect(bounds.max.x).toBeLessThan(room.maxX);
      expect(bounds.min.z).toBeGreaterThan(room.minZ);
      expect(bounds.max.z).toBeLessThan(room.maxZ);
    }
    const resources = new Set<{ dispose: () => void }>();
    building.traverse((o) => {
      if (isMesh(o)) {
        resources.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          resources.add(m);
      }
    });
    const spies = [...resources].map((r) => vi.spyOn(r, "dispose"));
    disposeObjectTree(building);
    disposeObjectTree(building);
    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
  });

  it("moves the original selectable book through a real carry anchor and restores it", () => {
    const scene = new Scene();
    const building = createProceduralLibraryBuilding(true);
    scene.add(building);
    const session = new LivingSession();
    const visuals = createLivingVisuals(building, scene, session);
    const book = visuals.selectables.find(
      (item) => item.descriptor.id === "living:book",
    )!;
    const original = book.root;
    const anchor = new Object3D();
    anchor.position.set(18, 1, -6);
    scene.add(anchor);
    session.act("living:book", "toggle");
    session.act("living:book", "turn");
    visuals.update(0, true);
    visuals.update(0, true);
    expect(book.root.getObjectByName("living-page-pivot")!.rotation.x).toBe(
      -2.4,
    );

    visuals.driveInhabitantInteractions(
      [
        {
          id: "character:aryn",
          key: "aryn",
          label: "Aryn",
          x: 0,
          z: 0,
          facing: 0,
          state: "work",
          activity: "transport",
          room: "CÔMODO C",
          destination: null,
          action: "walk",
          available: true,
          interactionObjectId: "living:book",
          interactionState: "carrying",
        },
      ],
      () => anchor,
    );
    session.act("living:book", "examine");
    visuals.update(0.05, false);
    expect(book.moving.rotation.z).toBe(0);
    expect(book.root.getObjectByName("living-page-pivot")!.rotation.x).toBe(0);
    expect(book.root).toBe(original);
    const carriedBounds = new Box3().setFromObject(book.root);
    expect(carriedBounds.getCenter(new Vector3()).y).toBeCloseTo(
      anchor.position.y,
      2,
    );
    expect(book.root.position.y).not.toBe(0);

    visuals.driveInhabitantInteractions(
      [
        {
          id: "character:aryn",
          key: "aryn",
          label: "Aryn",
          x: SCENIC_BOOK_ANCHORS.destinationApproach.x,
          z: SCENIC_BOOK_ANCHORS.destinationApproach.z,
          facing: 0,
          state: "work",
          activity: "placing",
          room: "CÔMODO C",
          destination: null,
          action: "gesture",
          available: true,
          interactionObjectId: "living:book",
          interactionState: "placing",
        },
      ],
      () => anchor,
    );
    const placedBounds = new Box3().setFromObject(book.root);
    expect(placedBounds.min.y).toBeCloseTo(
      SCENIC_BOOK_ANCHORS.destination.y + 0.004,
      3,
    );
    expect(placedBounds.getCenter(new Vector3()).x).toBeCloseTo(
      SCENIC_BOOK_ANCHORS.destination.x,
      2,
    );
    visuals.update(0.05, false);
    expect(book.moving.rotation.z).toBeGreaterThan(0);

    visuals.driveInhabitantInteractions(
      [
        {
          id: "character:aryn",
          key: "aryn",
          label: "Aryn",
          x: SCENIC_BOOK_ANCHORS.destinationApproach.x,
          z: SCENIC_BOOK_ANCHORS.destinationApproach.z,
          facing: 0,
          state: "work",
          activity: "recollecting",
          room: "CÔMODO C",
          destination: null,
          action: "gesture",
          available: true,
          interactionObjectId: "living:book",
          interactionState: "recollecting",
        },
      ],
      () => anchor,
    );
    visuals.driveInhabitantInteractions([], () => null);
    expect(book.root.position.x).toBeCloseTo(14.75);
    expect(book.root.position.z).toBeCloseTo(-4.8);
    for (let i = 0; i < 120; i++) {
      visuals.driveInhabitantInteractions([], () => null);
      visuals.update(1 / 60, false);
    }
    expect(book.moving.rotation.z).toBe(2.1);
    expect(session.getSnapshot().objects["living:book"].active).toBe(true);
    disposeObjectTree(scene);
  });
});

it("converges on the requested star-book cover pose in runtime frame order", () => {
  const scene = new Scene();
  const building = createProceduralLibraryBuilding(true);
  scene.add(building);
  const session = new LivingSession();
  const visuals = createLivingVisuals(building, scene, session);
  const book = visuals.selectables.find(
    (item) => item.descriptor.id === "living:book",
  )!;
  session.act("living:book", "toggle");
  for (let i = 0; i < 120; i++) {
    visuals.driveInhabitantInteractions([], () => null);
    visuals.update(1 / 60, false);
  }
  expect(session.getSnapshot().objects["living:book"].active).toBe(true);
  expect(book.moving.rotation.z).toBeCloseTo(2.1, 5);
  disposeObjectTree(scene);
});

it.each([false, true])(
  "handles rapid reversals, page/examine commands and repeated star-book toggles (reduced=%s)",
  (reduced) => {
    const scene = new Scene();
    const building = createProceduralLibraryBuilding(true);
    scene.add(building);
    const session = new LivingSession();
    const visuals = createLivingVisuals(building, scene, session);
    const book = visuals.selectables.find(
      (item) => item.descriptor.id === "living:book",
    )!;
    const frame = () => {
      visuals.driveInhabitantInteractions([], () => null);
      visuals.update(1 / 60, reduced);
      expect(book.moving.rotation.z).toBeGreaterThanOrEqual(0);
      expect(book.moving.rotation.z).toBeLessThanOrEqual(2.1);
    };
    const settle = () => {
      for (let i = 0; i < 120; i++) frame();
    };
    const initial = session.getSnapshot();
    expect(session.act("living:book", "turn")).toEqual([]);
    expect(session.getSnapshot()).toBe(initial);
    // A double command before the next frame cancels to closed.
    session.act("living:book", "toggle");
    session.act("living:book", "toggle");
    settle();
    expect(book.moving.rotation.z).toBe(0);
    for (let cycle = 0; cycle < 4; cycle++) {
      session.act("living:book", "toggle");
      frame();
      const opening = book.moving.rotation.z;
      expect(opening).toBeGreaterThan(0);
      session.act("living:book", "examine");
      expect(session.getSnapshot().objects["living:book"].active).toBe(true);
      session.act("living:book", "turn");
      // Page intent during opening waits for safe cover clearance.
      frame();
      if (!reduced)
        expect(book.root.getObjectByName("living-page-pivot")!.rotation.x).toBe(
          0,
        );
      settle();
      expect(book.moving.rotation.z).toBeCloseTo(2.1, 5);
      expect(
        book.root.getObjectByName("living-page-pivot")!.rotation.x,
      ).toBeCloseTo(
        -(session.getSnapshot().objects["living:book"].turns % 2) * 2.4,
        5,
      );
      session.act("living:book", "toggle");
      frame();
      session.act("living:book", "toggle"); // Reverse a close already in progress.
      frame();
      session.act("living:book", "toggle");
      settle();
      expect(book.moving.rotation.z).toBeCloseTo(0, 5);
      expect(
        book.root.getObjectByName("living-page-pivot")!.rotation.x,
      ).toBeCloseTo(0, 5);
      expect(session.getSnapshot().objects["living:book"].active).toBe(false);
    }
    disposeObjectTree(scene);
  },
);
