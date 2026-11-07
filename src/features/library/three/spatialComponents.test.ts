import baseline from "../../../../docs/audits/evidence/bv-recovery-r2/navigation-before.json";
import { Scene } from "three";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { createProceduralComposition } from "./proceduralComposition";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { createLibraryRecordComposition } from "./libraryRecordComposition";
import { INITIAL_LIBRARY_RECORD_SLOTS } from "../libraryRecordLayout";
import { createLivingVisuals } from "./livingVisuals";
import { LivingSession } from "../livingObjects";
import { createInhabitantSceneProps } from "./inhabitantSceneProps";
import { expect, it } from "vitest";
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { InhabitantNavigation, segmentHits } from "../inhabitantNavigation";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { flightObstacles } from "./scrollFlightRoutes";
import { setSpatialComponents, spatialBox } from "./spatialComponents";
import { disposeObjectTree } from "./referenceScene";

it("keeps authored physical, navigation and selectable geometry independent through transforms and decoration changes", () => {
  const root = new Group();
  const physical = [spatialBox(0, 0.5, 0, 2, 1, 1)];
  setSpatialComponents(root, {
    physical,
    navigation: physical,
    mobility: "static",
    picking: [spatialBox(0, 0.5, 0, 2.2, 1.2, 1.2)],
    supports: [{ id: "top", position: [0, 1, 0] }],
  });
  root.position.set(4, 0, 2);
  root.rotation.y = Math.PI / 2;
  root.scale.set(2, 1, 1);
  const before = collectInhabitantObstacles([root]);
  const ornament = new Mesh(new BoxGeometry(9, 9, 9), new MeshBasicMaterial());
  root.add(ornament);
  expect(collectInhabitantObstacles([root])).toEqual(before);
  for (const [key, value] of Object.entries({
    minX: 3.5,
    maxX: 4.5,
    minZ: 0,
    maxZ: 4,
  }))
    expect(before[0][key as "minX" | "maxX" | "minZ" | "maxZ"]).toBeCloseTo(
      value,
      10,
    );
  expect(flightObstacles(root)).toHaveLength(1);
  const dynamic = new Group();
  setSpatialComponents(dynamic, {
    physical,
    navigation: physical,
    mobility: "dynamic",
  });
  root.add(dynamic);
  expect(collectInhabitantObstacles([root])).toHaveLength(2);
  expect(collectInhabitantObstacles([root, root, dynamic])).toHaveLength(2);
  dynamic.userData.carriedObject = true;
  expect(collectInhabitantObstacles([root])).toHaveLength(1);
  disposeObjectTree(root);
});

it("matches exact brute collision queries and reuses static graphs with changing temporary occupancy", () => {
  const boxes = Array.from({ length: 48 }, (_, i) => ({
    id: `box:${i}`,
    minX: -7 + (i % 8) * 2,
    maxX: -6.7 + (i % 8) * 2,
    minZ: -6 + Math.floor(i / 8) * 2,
    maxZ: -5.7 + Math.floor(i / 8) * 2,
  }));
  const nav = new InhabitantNavigation(boxes),
    floors = new InhabitantNavigation([]);
  for (let i = 0; i < 400; i++) {
    const a = { x: Math.sin(i * 1.73) * 8, z: Math.cos(i * 0.32) * 8 },
      b = { x: Math.cos(i * 1.13) * 8, z: Math.sin(i * 0.69) * 8 },
      radius = 0.58 + (i % 4) * 0.12;
    expect(nav.clear(a, b, radius)).toBe(
      floors.clear(a, b, radius) &&
        !boxes.some((box) => segmentHits(a, b, box, radius)),
    );
  }
  const from = { x: 0, z: 0 },
    to = { x: 2, z: 0 },
    block = [{ id: "lease", minX: 1.5, maxX: 2.5, minZ: -0.5, maxZ: 0.5 }];
  floors.prepare([0.7]);
  expect(floors.route(from, to, 0.7)).toEqual([to]);
  expect(floors.route(from, to, 0.7, block)).toBeNull();
  expect(floors.route(from, to, 0.7)).toEqual([to]);
  expect(floors.route(from, { x: NaN, z: 0 }, 0.7)).toBeNull();
});

it("preserves every R1 valid route pair and rejects its invalid pairs without crossing the R1 detailed geometry", () => {
  const scene = new Scene(),
    building = createProceduralLibraryBuilding(true);
  scene.add(
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
  createLivingVisuals(building, scene, new LivingSession());
  createInhabitantSceneProps(building);
  const navigation = new InhabitantNavigation(
    collectInhabitantObstacles([scene]),
  );
  for (const pair of baseline.routes) {
    const route = navigation.route(pair.from, pair.to, pair.radius);
    expect(route !== null, JSON.stringify(pair)).toBe(pair.valid);
    let last = pair.from;
    for (const point of route ?? []) {
      expect(
        baseline.obstacles.some((o) =>
          segmentHits(last, point, o, pair.radius),
        ),
        JSON.stringify({ pair, last, point }),
      ).toBe(false);
      last = point;
    }
  }
  disposeObjectTree(scene);
});

it("keeps new ambient decorations out of real living-object colliders", () => {
  const scene = new Scene(),
    building = createProceduralLibraryBuilding(true);
  scene.add(building);
  createLivingVisuals(building, scene, new LivingSession());
  const before = collectInhabitantObstacles([building]),
    living = building.getObjectByName("living-objects");
  if (!living) throw new Error("Missing living owner");
  const decoration = new Mesh(
    new BoxGeometry(20, 2, 20),
    new MeshBasicMaterial(),
  );
  decoration.position.y = 1;
  living.add(decoration);
  expect(collectInhabitantObstacles([building])).toEqual(before);
  disposeObjectTree(scene);
});
