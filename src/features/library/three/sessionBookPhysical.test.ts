import { readFileSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { Scene, Vector3, Raycaster } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { InhabitantAgency } from "../inhabitantAgency";
import { InhabitantNavigation } from "../inhabitantNavigation";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { createProceduralComposition } from "./proceduralComposition";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import { reconcileReadingAreaBookVisuals } from "./readingAreaBookVisuals";
import { createInhabitantVisuals } from "./inhabitantVisuals";
import {
  createSessionBookVisuals,
  clearBookSegment,
} from "./sessionBookVisuals";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { LivingSession } from "../livingObjects";
import { createLivingVisuals } from "./livingVisuals";
import { INHABITANTS } from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";
import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";

it("original canonical volume reaches a real R5 hand and the reserved seat, then returns without duplication", async () => {
  const scene = new Scene(),
    building = createProceduralLibraryBuilding(true),
    shelves = createProceduralComposition(LIBRARY_SHELVES);
  scene.add(building, shelves.root);
  createLivingVisuals(building, scene, new LivingSession());
  const books = new Map(
    reconcileReadingAreaBookVisuals(
      shelves,
      [
        {
          entryId: "fiction",
          instanceId: "reading-book:fiction",
          modelTypeId: "book-volume",
          title: "Livro fictício",
          readingProgress: { currentPage: 0 },
        },
      ],
      new Map(),
    ).visible.map((v) => [v.book.instanceId, v]),
  );
  let time = 0;
  const navigation = new InhabitantNavigation(
    collectInhabitantObstacles([building, shelves.root]),
  );
  const agency = new InhabitantAgency(navigation, {
    now: () => time,
    seed: 51,
    canPhysicalStep: (pose) =>
      pose.interactionObjectId?.startsWith("reading-book:")
        ? (inhabitants.probePhysicalPose(pose, (socket) =>
            controller.checkHandPose(socket, pose),
          ) ?? false)
        : true,
  });
  const inhabitants = createInhabitantVisuals(
    scene,
    async (url) => {
      const key = INHABITANTS.find((a) => url.includes(a.key))!.key;
      return new GLTFLoader().parseAsync(
        new Uint8Array(
          readFileSync(`src/features/library/three/assets/${key}.glb`),
        ).buffer,
        "",
      );
    },
    (id) => agency.setAvailable(id, true),
    true,
  );
  await new Promise<void>((resolve, reject) => {
    let count = 0;
    const check = () => {
      if (
        inhabitants.selectables.every(
          (s) => s.root.userData.loadState === "ready",
        )
      )
        resolve();
      else if (++count > 100) reject(new Error("models not ready"));
      else setTimeout(check, 0);
    };
    check();
  });
  const blocked: unknown[] = [];
  const controller = createSessionBookVisuals({
    onContactBlocked: (a, b, half, obstacles) => {
      if (blocked.length < 3)
        blocked.push({
          a,
          b,
          half,
          boxes: obstacles.filter((o) => !clearBookSegment(a, b, half, [o])),
        });
    },
    books: () => books,
    obstacleRoots: [building, shelves.root],
    interactions: agency.interactions,
    now: () => agency.interactionTime,
    navigation,
    pickupProfiles: () => inhabitants.getPickupProfiles(),
  });
  let activity: WorldSessionActivity | null = {
    sessionId: "fiction-session",
    entryId: "fiction",
    instanceId: "reading-book:fiction",
    entryType: "book",
    kind: "reading",
    status: "active",
    revision: 1,
  };
  controller.apply(activity);
  agency.setMode("running");
  const visual = books.get("reading-book:fiction")!,
    node = visual.node,
    home = node.position.clone(),
    parent = node.parent;
  let carried = false,
    seated = false;
  const history: unknown[] = [];
  const step = () => {
    time += 50;
    controller.update(0.05, false, agency.getPoses());
    agency.update({
      physicalObstacles: controller.navigationObstacles(),
      readingCandidate: controller.candidate(),
      scrollCandidates: [],
      sessionActivity: activity,
    });
    const poses = agency.getPoses();
    controller.reconcileCarrier(poses);
    inhabitants.drive(poses);
    inhabitants.update(0.05, false);
    controller.followInhabitant(0.05, poses, (id) =>
      inhabitants.getSocket(id, "socket_carry"),
    );
    if (node.parent?.name === "socket_carry") carried = true;
    if (poses.some((p) => p.action === "read_seated")) seated = true;
    if (time % 1000 === 0)
      history.push({
        time,
        book: controller.snapshot(),
        candidate: controller.candidate(),
        poses: poses.filter((p) => p.physicalSessionId),
      });
  };
  // Interrupt the first grasp in flight, then reconcile the same confirmed
  // session on resume. No fake replacement object may survive either cycle.
  for (let i = 0; i < 2000 && !carried; i++) step();
  expect(carried, "original object reaches the named hand").toBe(true);
  activity = { ...activity, status: "paused", revision: 2 };
  controller.apply(activity);
  for (let i = 0; i < 2000 && controller.snapshot().state !== "shelf"; i++)
    step();
  expect(controller.snapshot().state).toBe("shelf");
  expect(node.parent).toBe(parent);
  expect(node.position.distanceTo(home)).toBeLessThan(1e-6);
  activity = { ...activity, status: "active", revision: 3 };
  controller.apply(activity);
  for (let i = 0; i < 4000 && !seated; i++) step();

  writeFileSync(
    "/tmp/bv-f2-reading.json",
    JSON.stringify(
      {
        carried,
        seated,
        blocked,
        profiles: [...inhabitants.getPickupProfiles()],
        history,
      },
      null,
      2,
    ),
  );
  expect(carried, "named anatomical hand contact").toBe(true);
  expect(seated, "same book at reserved seat").toBe(true);
  expect(node).toBe(books.get("reading-book:fiction")!.node);
  for (let i = 0; i < 40; i++) step();
  expect(controller.snapshot().opening).toBeGreaterThan(0.5);
  const reader = agency.getPoses().find((p) => p.action === "read_seated")!;
  expect(
    Math.abs(
      Math.atan2(
        Math.sin(reader.facing - Math.PI),
        Math.cos(reader.facing - Math.PI),
      ),
    ),
  ).toBeLessThan(0.01);
  const seatContact = inhabitants
    .getSocket(reader.id, "socket_seat")!
    .getWorldPosition(new Vector3());
  const supportRay = new Raycaster(
    seatContact.clone().add(new Vector3(0, 0.02, 0)),
    new Vector3(0, -1, 0),
    0,
    0.05,
  );
  expect(supportRay.intersectObject(building, true).length).toBeGreaterThan(0);
  activity = null;
  controller.apply(null);
  for (let i = 0; i < 4000 && controller.snapshot().state !== "shelf"; i++)
    step();
  writeFileSync(
    "/tmp/bv-f2-reading-return.json",
    JSON.stringify(
      {
        snapshot: controller.snapshot(),
        poses: agency.getPoses(),
        leases: agency.interactions.snapshot(),
        position: node.getWorldPosition(new (await import("three")).Vector3()),
      },
      null,
      2,
    ),
  );
  expect(controller.snapshot().state).toBe("shelf");
  expect(node.parent).toBe(parent);
  expect(node.position.distanceTo(home)).toBeLessThan(1e-6);
  const remaining = agency.interactions.snapshot();
  expect(
    remaining.some(
      (l) =>
        l.owner === "session" ||
        l.resourceId.startsWith("seat:") ||
        l.resourceId.startsWith("reader:"),
    ),
  ).toBe(false);
  expect(
    remaining.every((l) =>
      agency
        .getPoses()
        .some(
          (p) => p.key === l.owner && p.interactionObjectId === l.resourceId,
        ),
    ),
  ).toBe(true);
  expect(books.size).toBe(1);
  controller.dispose();
  inhabitants.dispose();
  agency.dispose();
  expect(agency.interactions.snapshot()).toHaveLength(0);
  disposeObjectTree(scene);
});
