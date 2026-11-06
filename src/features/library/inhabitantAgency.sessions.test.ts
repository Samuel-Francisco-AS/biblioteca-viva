import { expect, it } from "vitest";
import { Scene } from "three";
import { InhabitantAgency } from "./inhabitantAgency";
import { InhabitantNavigation, distance } from "./inhabitantNavigation";
import { INHABITANTS } from "./inhabitants";
import { createProceduralLibraryBuilding } from "./three/proceduralLibraryBuilding";
import { collectInhabitantObstacles } from "./three/inhabitantObstacles";
import { createLivingVisuals } from "./three/livingVisuals";
import { LivingSession } from "./livingObjects";
import { disposeObjectTree } from "./three/referenceScene";
import { SESSION_READING_SUPPORT } from "./three/sessionBookVisuals";

it("prioritizes a real reading opportunity, walks a clear route, reserves exclusively and releases on dialogue/completion", () => {
  const scene = new Scene(),
    building = createProceduralLibraryBuilding(true);
  scene.add(building);
  createLivingVisuals(building, scene, new LivingSession());
  let now = 0;
  let candidate: {
    id: string;
    sessionId: string;
    source: typeof SESSION_READING_SUPPORT;
  } | null = {
    id: "reading-book:fiction",
    sessionId: "session-fiction",
    source: SESSION_READING_SUPPORT,
  };
  const agency = new InhabitantAgency(
    new InhabitantNavigation(collectInhabitantObstacles([building])),
    {
      now: () => now,
      seed: 51,
      sessionReadingCandidate: () => candidate,
    },
  );
  for (const a of INHABITANTS) agency.setAvailable(a.id, true);
  agency.setMode("running");
  let reader = agency.getPoses().find((p) => p.interactionState === "reading");
  for (let i = 0; i < 1500 && !reader; i++) {
    now += 100;
    agency.update();
    const poses = agency.getPoses();
    expect(
      poses.filter((p) => p.interactionObjectId === candidate?.id),
    ).toHaveLength(
      agency.interactions
        .snapshot()
        .filter((l) => l.resourceId === "reader:reading-book:fiction").length,
    );
    reader = poses.find((p) => p.interactionState === "reading");
  }
  expect(reader).toBeDefined();
  expect(distance(reader!, SESSION_READING_SUPPORT)).toBeLessThan(1.65);
  expect(reader!.state).toBe("work");
  expect(reader!.action).toBe("work");
  agency.setConversation(reader!.key);
  expect(
    agency.interactions
      .snapshot()
      .filter((l) => l.resourceId.startsWith("reader:")),
  ).toHaveLength(0);
  expect(agency.getPoses().find((p) => p.key === reader!.key)?.state).toBe(
    "converse",
  );
  candidate = null;
  now += 100;
  agency.update();
  agency.setConversation(null);
  agency.dispose();
  expect(agency.interactions.snapshot()).toHaveLength(0);
  disposeObjectTree(scene);
});
