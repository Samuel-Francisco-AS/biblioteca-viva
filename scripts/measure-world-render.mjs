// Diagnostic only: real ThreeWorldRuntime and full fictional composition, manual clock.
// CPU submission is not GPU timing, and SwiftShader is not an Android device.
import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2];
const sourceRef = process.argv[4] || undefined;
if (!directory) throw new Error("Expected evidence directory");
await mkdir(directory, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4178, strictPort: true },
  plugins: [
    {
      name: "recovery-source-reference",
      enforce: "pre",
      transform(code, id) {
        const files = [
          "ThreeWorldRuntime.ts",
          "proceduralLibraryBuilding.ts",
          "proceduralLibraryFurnishing.ts",
          "livingVisuals.ts",
          "recordArtifactModels.ts",
          "libraryRecordRepresentations.ts",
        ];
        if (sourceRef && files.some((file) => id.endsWith(`/three/${file}`)))
          return execFileSync(
            "git",
            [
              "show",
              `${sourceRef}:src/features/library/three/${id.split("/").at(-1)}`,
            ],
            { encoding: "utf8" },
          );
        return code;
      },
    },
    {
      name: "recovery-diagnostic-page",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            sourceRef &&
            process.argv[5] === "inhabitants" &&
            /^\/src\/features\/library\/three\/assets\/(samael|aryn|ytha|lua)\.glb$/.test(
              req.url,
            )
          ) {
            res.setHeader("Content-Type", "model/gltf-binary");
            res.end(
              execFileSync("git", ["show", `${sourceRef}:${req.url.slice(1)}`]),
            );
            return;
          }
          if (req.url !== "/__bv_render_probe") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><head><style>body{margin:0;background:#18342d}#world{width:1280px;height:900px}</style></head><body><div id="world"></div></body></html>',
          );
        });
      },
    },
  ],
});
await server.listen();
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:4178/__bv_render_probe");
  await page.evaluate(async () => {
    const three = await import("/node_modules/three/build/three.module.js");
    const { ThreeWorldRuntime } =
      await import("/src/features/library/three/ThreeWorldRuntime.ts");
    const { LivingSession } =
      await import("/src/features/library/livingObjects.ts");
    const { NightLightingSession } =
      await import("/src/features/library/nightLighting.ts");
    let hour = 12,
      timestamp = 0,
      scheduled = null,
      renderMs = 0,
      matrixUpdates = 0;
    const date = () => new Date(2026, 10, 6, hour);
    const living = new LivingSession(date),
      night = new NightLightingSession(date);
    const categories = [
      "book",
      "movie",
      "series",
      "study",
      "physical_activity",
      "work",
    ].map((type) => ({
      type,
      entries: Array.from({ length: type === "book" ? 12 : 2 }, (_, i) => ({
        type,
        entryId: `fiction-${type}-${i}`,
        instanceId:
          type === "book"
            ? `reading-book:fiction-book-${i}`
            : `library-${type}:fiction-${type}-${i}`,
        modelTypeId:
          type === "book"
            ? "book-volume"
            : type === "physical_activity"
              ? "physical-activity-record"
              : `${type}-record`,
        createdAt: "2026-11-06T12:00:00Z",
        title: "Registro fictício",
        readingProgress: { currentPage: 0 },
        episodesWatched: 0,
        progressCurrent: 0,
        progressUnit: "hours",
        category: "mixed",
      })),
    }));
    let renderer, scene, camera;
    const runtime = new ThreeWorldRuntime({
      livingSession: living,
      nightLighting: night,
      libraryWorldSnapshot: {
        categories,
        scrolls: Array.from({ length: 4 }, (_, i) => ({
          id: `scroll:note:fiction-${i}`,
          annotationId: `fiction-${i}`,
          entryId: "fiction-book-0",
          kind: "note",
          category: "book",
          updatedAt: "2026-11-06T12:00:00Z",
        })),
      },
      frameScheduler: {
        request(cb) {
          scheduled = cb;
          return 1;
        },
        cancel() {
          scheduled = null;
        },
      },
      createRenderer() {
        renderer = new three.WebGLRenderer({
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        });
        const render = renderer.render.bind(renderer);
        renderer.render = (s, c) => {
          scene = s;
          camera = c;
          const start = globalThis.performance.now();
          render(s, c);
          renderMs = globalThis.performance.now() - start;
        };
        return renderer;
      },
    });
    runtime.mount(globalThis.document.getElementById("world"));
    runtime.start();
    const objectPrototype = Object.getPrototypeOf(Object.getPrototypeOf(scene));
    const original = objectPrototype.updateMatrix;
    objectPrototype.updateMatrix = function () {
      matrixUpdates++;
      return original.call(this);
    };
    globalThis.__bvProbe = {
      runtime,
      renderer,
      living,
      night,
      get scene() {
        return scene;
      },
      get camera() {
        return camera;
      },
      setHour(h) {
        hour = h;
        living.refreshContext();
        night.refreshContext();
      },
      step(delta = 16.667) {
        timestamp += delta;
        const cb = scheduled;
        scheduled = null;
        const start = globalThis.performance.now();
        cb?.(timestamp);
        const total = globalThis.performance.now() - start;
        return {
          frameJsMs: total,
          renderSubmissionMs: renderMs,
          otherJsMs: Math.max(0, total - renderMs),
        };
      },
      reset() {
        matrixUpdates = 0;
      },
      get matrices() {
        return matrixUpdates;
      },
    };
  });
  await page.waitForFunction(
    () =>
      globalThis.document.querySelector("canvas")?.dataset.inhabitantsReady ===
      "4",
  );
  const scenarios =
    process.argv[5] === "inhabitants"
      ? [
          "inhabitant-samael",
          "inhabitant-aryn",
          "inhabitant-ytha",
          "inhabitant-lua",
          "night",
        ]
      : process.argv[5] === "flight"
        ? ["scroll-flight"]
        : process.argv[5] === "book"
          ? ["record-book-normal", "record-book-near"]
          : ["records", "post-r2"].includes(process.argv[5])
            ? ["book", "movie", "series", "study", "physical_activity", "work"]
                .filter(
                  (type) =>
                    process.argv[5] !== "post-r2" ||
                    !["book", "series"].includes(type),
                )
                .flatMap((type) => [
                  `record-${type}-normal`,
                  `record-${type}-near`,
                  ...(process.argv[5] === "post-r2"
                    ? [`record-${type}-selected`]
                    : []),
                ])
            : [
                "static",
                "active-four",
                "night",
                "scrolls-active",
                "book-transport",
                "camera-near",
                "camera-far",
                "reduced",
                "return",
              ];
  const results = [];
  for (const name of scenarios) {
    const result = await page.evaluate(
      async ({ name, postR2 }) => {
        const p = globalThis.__bvProbe;
        if (name === "scroll-flight")
          for (const scroll of p.runtime.scrollVisuals.selectables)
            scroll.wakeAt = 0;
        let focusNode = null;
        if (name.startsWith("record-")) {
          const [, type, view] = name.split("-");
          let id;
          if (type === "book") {
            id = "reading-book:fiction-book-2";
            focusNode = p.runtime.readingAreaBookVisuals.get(id).node;
          } else {
            const placement = p.runtime.libraryRecordPlacements.find(
              (record) =>
                record.modelTypeId ===
                (type === "physical_activity"
                  ? "physical-activity-record"
                  : `${type}-record`),
            );
            id = placement.instanceId;
            focusNode = p.scene.getObjectByName(
              `library-record-instance:${id}`,
            );
          }
          const { Vector3 } =
            await import("/node_modules/three/build/three.module.js");
          // The stable wrapper pivot keeps before/after cameras identical even
          // when ornament changes the visual bounds slightly after batching.
          const center = focusNode.getWorldPosition(new Vector3());
          p.runtime.navigation.commit({
            targetX: center.x,
            targetZ: center.z,
            zoom: view === "normal" ? 1 : 2.2,
          });
          p.runtime.selectObject(
            name.endsWith("selected") || (!postR2 && name.endsWith("near"))
              ? id
              : null,
          );
        }
        if (name.startsWith("inhabitant-")) {
          const key = name.slice("inhabitant-".length);
          const actor = p.scene.getObjectByName(`character:${key}`);
          p.runtime.navigation.commit({
            targetX: actor.position.x,
            targetZ: actor.position.z,
            zoom: 2.5,
          });
          p.runtime.selectObject(`character:${key}`);
        }
        const stages = {};
        const originals = [];
        if (name === "night") p.setHour(22);
        if (name === "book-transport")
          p.runtime.applyWorldSession({
            sessionId: "fiction-session",
            entryId: "fiction-book-2",
            instanceId: "reading-book:fiction-book-2",
            entryType: "book",
            kind: "reading",
            status: "active",
            revision: 1,
          });
        if (name === "camera-near") p.runtime.navigation.setZoom(2.5);
        if (name === "camera-far") p.runtime.navigation.setZoom(0.7);
        if (name === "return") {
          p.runtime.pause();
          p.runtime.resume();
        }
        for (const key of [
          "livingVisuals",
          "ambientMagic",
          "scrollVisuals",
          "sessionBooks",
        ]) {
          const owner = p.runtime[key];
          if (!owner) continue;
          originals.push([owner, owner.update]);
          const fn = owner.update.bind(owner);
          owner.update = (...args) => {
            const t = globalThis.performance.now();
            const value = fn(...args);
            stages[key] = (stages[key] ?? 0) + globalThis.performance.now() - t;
            return value;
          };
        }
        for (let i = 0; i < 3; i++)
          p.step(name === "static" || name.startsWith("record-") ? 0 : 50);
        p.reset();
        for (const key in stages) stages[key] = 0;
        const samples = [];
        for (let i = 0; i < 6; i++)
          samples.push(
            p.step(name === "static" || name.startsWith("record-") ? 0 : 50),
          );
        const materials = new Set(),
          geometries = new Set();
        let meshes = 0,
          objects = 0,
          potentialTriangles = 0,
          visibleObjects = 0,
          pointLights = 0;
        p.scene.traverse((o) => {
          objects++;
          if (o.isPointLight) pointLights++;
          if (o.isMesh) {
            meshes++;
            geometries.add(o.geometry);
            for (const m of Array.isArray(o.material)
              ? o.material
              : [o.material])
              materials.add(m);
            potentialTriangles +=
              ((o.geometry.index?.count ??
                o.geometry.attributes.position.count) /
                3) *
              (o.isInstancedMesh ? o.count : 1);
          }
        });
        p.scene.traverseVisible(() => visibleObjects++);
        for (const [owner, fn] of originals) owner.update = fn;
        const bufferBytes = [...geometries].reduce(
          (sum, g) =>
            sum +
            (g.index?.array.byteLength ?? 0) +
            Object.values(g.attributes).reduce(
              (n, a) => n + a.array.byteLength,
              0,
            ),
          0,
        );
        const pct = (key) => {
          const s = samples.map((v) => v[key]).sort((a, b) => a - b);
          return { p50: s[3], p95: s[5] };
        };
        const focusedMaterials = new Set();
        let focusedTriangles = 0,
          focusedMeshes = 0;
        focusNode?.traverse((o) => {
          if (o.isMesh) {
            focusedMeshes++;
            for (const material of Array.isArray(o.material)
              ? o.material
              : [o.material])
              focusedMaterials.add(material);
            focusedTriangles +=
              ((o.geometry.index?.count ??
                o.geometry.attributes.position.count) /
                3) *
              (o.isInstancedMesh ? o.count : 1);
          }
        });
        return {
          name,
          focusedTriangles,
          focusedMeshes,
          focusedMaterials: focusedMaterials.size,
          selected: p.renderer.domElement.dataset.selectedObject,
          highlighted: p.renderer.domElement.dataset.highlightedObject,
          drawCalls: p.renderer.info.render.calls,
          renderedTriangles: p.renderer.info.render.triangles,
          gpuGeometries: p.renderer.info.memory.geometries,
          gpuTextures: p.renderer.info.memory.textures,
          programs: p.renderer.info.programs.length,
          bufferBytes,
          materials: materials.size,
          geometries: geometries.size,
          meshes,
          objects,
          visibleObjects,
          potentialTriangles,
          pointLights,
          matrixUpdates: p.matrices,
          frameJsMs: pct("frameJsMs"),
          renderSubmissionMs: pct("renderSubmissionMs"),
          otherJsMs: pct("otherJsMs"),
          stagesTotalMs: stages,
          book: p.runtime.sessionBooks?.snapshot(),
          inhabitants: p.runtime.agency?.getPoses().filter((a) => a.available)
            .length,
          scrolls: p.runtime.scrollVisuals?.selectables.length,
          flyingScrolls: p.runtime.scrollVisuals?.selectables.filter(
            (s) => s.flight,
          ).length,
          activePointLights: (() => {
            let n = 0;
            p.scene.traverseVisible((o) => {
              if (o.isPointLight) n++;
            });
            return n;
          })(),
          viewport: [1280, 900],
          framebuffer: [
            p.renderer.domElement.width,
            p.renderer.domElement.height,
          ],
          camera: p.runtime.navigation.getState(),
        };
      },
      { name, postR2: process.argv[5] === "post-r2" },
    );
    results.push(result);
    await writeFile(
      `${directory}/samples.partial.json`,
      JSON.stringify(results, null, 2) + "\n",
    );
    await page.screenshot({ path: `${directory}/${name}.png` });
    if (name === "camera-far")
      await page.emulateMedia({ reducedMotion: "reduce" });
  }
  const browserVersion = browser.version();
  const disposal = await page.evaluate(() => {
    const p = globalThis.__bvProbe;
    p.runtime.dispose();
    return {
      canvases: globalThis.document.querySelectorAll("canvas").length,
      state: p.runtime.getDiagnostics().runtimeState,
    };
  });
  await writeFile(
    `${directory}/metrics.json`,
    JSON.stringify(
      {
        label: process.argv[3],
        sourceRef: sourceRef ?? "working-tree",
        base: execFileSync("git", ["rev-parse", sourceRef ?? "HEAD"], {
          encoding: "utf8",
        }).trim(),
        browser: browserVersion,
        scope:
          "Chromium headless SwiftShader, DPR1, antialias, same complete fictional world and four GLBs, manual deterministic frames; CPU submission not GPU time; no Android or React shell",
        errors,
        disposal,
        results,
      },
      null,
      2,
    ) + "\n",
  );
  if (errors.length) throw new Error(errors.join("; "));
} finally {
  await browser.close();
  await server.close();
}
