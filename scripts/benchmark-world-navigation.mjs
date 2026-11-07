import process from "node:process";
// Same mounted fictional world, deterministic routes. Host CPU, never GPU/Android.
import { createServer } from "vite";
import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { performance } from "node:perf_hooks";
const output = process.argv[2];
if (!output) throw new Error("Expected output.json");
globalThis.__bvCollisionTests = 0;
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  plugins: [
    {
      name: "navigation-probe",
      enforce: "pre",
      transform(code, id) {
        if (id.endsWith("/inhabitantNavigation.ts"))
          return code.replace(
            /(export function segmentHits\([\s\S]*?\): boolean \{)/,
            "$1 globalThis.__bvCollisionTests++;",
          );
      },
    },
  ],
});
try {
  const load = (file) =>
    server.ssrLoadModule(`/src/features/library/${file}.ts`);
  const { Scene } = await import("three");
  const { createProceduralLibraryBuilding } = await load(
    "three/proceduralLibraryBuilding",
  );
  const { createProceduralComposition } = await load(
    "three/proceduralComposition",
  );
  const { LIBRARY_SHELVES } = await load("libraryShelfLayout");
  const { createLibraryRecordComposition } = await load(
    "three/libraryRecordComposition",
  );
  const { INITIAL_LIBRARY_RECORD_SLOTS } = await load("libraryRecordLayout");
  const { collectInhabitantObstacles } = await load(
    "three/inhabitantObstacles",
  );
  const { createLivingVisuals } = await load("three/livingVisuals");
  const { LivingSession } = await load("livingObjects");
  const { createInhabitantSceneProps } = await load(
    "three/inhabitantSceneProps",
  );
  const { InhabitantNavigation } = await load("inhabitantNavigation");
  const { INHABITANTS, INHABITANT_ENVELOPES } = await load("inhabitants");
  const { LIBRARY_ACTIVITY_POINTS } = await load("librarySpatialLayout");
  const { disposeObjectTree } = await load("three/referenceScene");
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
  const percentiles = (samples) => {
    const sorted = [...samples].sort((a, b) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  };
  let start = performance.now();
  const obstacles = collectInhabitantObstacles([scene]);
  const collectionMs = performance.now() - start;
  const graphs = [];
  for (const radius of [
    ...new Set(INHABITANTS.map((a) => INHABITANT_ENVELOPES[a.key].travel)),
  ]) {
    const times = [];
    let edges = 0,
      tests = 0,
      nodes = 0;
    for (let i = 0; i < 7; i++) {
      const nav = new InhabitantNavigation(obstacles);
      globalThis.__bvCollisionTests = 0;
      start = performance.now();
      const graph = nav.graph(radius);
      times.push(performance.now() - start);
      nodes = nav.nodes.length;
      edges = graph.reduce((n, links) => n + links.length, 0) / 2;
      tests = globalThis.__bvCollisionTests;
    }
    graphs.push({
      radius,
      nodes,
      edges,
      collisionTests: tests,
      buildMs: percentiles(times),
    });
  }
  const routes = [],
    repeated = [],
    queries = [];
  globalThis.__bvCollisionTests = 0;
  for (const a of INHABITANTS) {
    const nav = new InhabitantNavigation(obstacles),
      radius = INHABITANT_ENVELOPES[a.key].travel;
    for (const to of LIBRARY_ACTIVITY_POINTS) {
      start = performance.now();
      const route = nav.route(a, to, radius);
      const coldMs = performance.now() - start;
      const samples = [];
      for (let i = 0; i < 20; i++) {
        start = performance.now();
        nav.route(a, to, radius);
        samples.push(performance.now() - start);
      }
      repeated.push(...samples);
      routes.push({
        inhabitant: a.key,
        from: { x: a.x, z: a.z },
        to: { x: to.x, z: to.z },
        radius,
        valid: route !== null,
        points: route,
        coldMs,
      });
    }
    for (let i = 0; i < 200; i++) {
      start = performance.now();
      nav.clear(a, { x: Math.sin(i) * 7, z: Math.cos(i) * 7 }, radius);
      queries.push(performance.now() - start);
    }
  }
  const dynamicNav = new InhabitantNavigation(obstacles),
    target = { x: 2, z: 0 };
  const dynamic = {
    free: dynamicNav.route({ x: 0, z: 0 }, target, 0.7) !== null,
    occupied:
      dynamicNav.route({ x: 0, z: 0 }, target, 0.7, [
        { id: "temporary", minX: 1.5, maxX: 2.5, minZ: -0.5, maxZ: 0.5 },
      ]) !== null,
    released: dynamicNav.route({ x: 0, z: 0 }, target, 0.7) !== null,
  };
  const result = {
    label: process.argv[3],
    base: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    node: process.version,
    scope:
      "Host CPU; same full fictional slots, shelves, building, living props; 7 graph builds per envelope; 20 repetitions per pair; no WebGL/device",
    obstacleCount: obstacles.length,
    collectionMs,
    graphs,
    repeatedRouteMs: percentiles(repeated),
    queryMs: percentiles(queries),
    routeAndQueryCollisionTests: globalThis.__bvCollisionTests,
    dynamic,
    routes,
    obstacles,
  };
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  disposeObjectTree(scene);
} finally {
  await server.close();
  delete globalThis.__bvCollisionTests;
}
