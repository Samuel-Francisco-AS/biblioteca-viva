// Directed CPU benchmark, deliberately separate from CI and Android frame metrics.
import process from "node:process";
import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";
import { OrthographicCamera } from "three";

const output = process.argv[2];
if (!output)
  throw new Error("Usage: node scripts/benchmark-world-input.mjs output.json");
const counts = { hulls: 0, constraints: 0, closestPoints: 0 };
globalThis.__bvInputBenchmark = counts;
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  plugins: [
    {
      name: "count-camera-work",
      enforce: "pre",
      transform(source, id) {
        if (!id.endsWith("/three/cameraMath.ts")) return;
        for (const [name, counter] of [
          ["convexHull", "hulls"],
          ["cameraNavigationConstraintForViewport", "constraints"],
          ["closestPointInConvexPolygon", "closestPoints"],
        ]) {
          const pattern = new RegExp(
            `(function ${name}\\([\\s\\S]*?\\)\\s*:[^{]*\\{)`,
          );
          if (!pattern.test(source))
            throw new Error(`Missing benchmark hook: ${name}`);
          source = source.replace(
            pattern,
            `$1 globalThis.__bvInputBenchmark.${counter}++;`,
          );
        }
        return source;
      },
    },
  ],
});
try {
  const { CameraNavigation } = await server.ssrLoadModule(
    "/src/features/library/three/CameraNavigation.ts",
  );
  const { LIBRARY_ROOMS } = await server.ssrLoadModule(
    "/src/features/library/libraryBuildingGeometry.ts",
  );
  const results = [];
  for (const [width, height] of [
    [412, 840],
    [840, 412],
  ]) {
    for (const gesture of ["pan", "pinch"]) {
      const navigation = new CameraNavigation(
        new OrthographicCamera(),
        1,
        LIBRARY_ROOMS,
      );
      navigation.setViewport(width, height);
      const previous = { x: width * 0.4, y: height * 0.4 };
      const run = (i) => {
        const current = {
          x: previous.x + Math.sin(i / 17) * 6,
          y: previous.y + Math.cos(i / 19) * 6,
        };
        if (gesture === "pan")
          navigation.panBetweenScreenPoints(previous, current);
        else
          navigation.zoomBetweenScreenPoints(
            previous,
            current,
            1.45 + Math.sin(i / 70) * 0.7,
          );
      };
      for (let i = 0; i < 100; i++) run(i);
      for (const key of Object.keys(counts)) counts[key] = 0;
      const samples = [];
      const states = [];
      for (let i = 0; i < 600; i++) {
        const start = performance.now();
        run(i);
        samples.push(performance.now() - start);
        if (i % 60 === 0) states.push(navigation.getState());
      }
      samples.sort((a, b) => a - b);
      results.push({
        width,
        height,
        gesture,
        events: samples.length,
        counts: { ...counts },
        milliseconds: {
          p50: samples[300],
          p95: samples[570],
          p99: samples[594],
          max: samples.at(-1),
        },
        states,
      });
    }
  }
  await writeFile(
    output,
    JSON.stringify(
      {
        label: process.argv[3] ?? "unlabelled",
        base: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        node: process.version,
        platform: process.platform,
        scope:
          "CPU host; same five floors; no WebGL, no Android FPS or presentation latency",
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await server.close();
  delete globalThis.__bvInputBenchmark;
}
