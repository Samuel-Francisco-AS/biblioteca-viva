// Directed R3 harness. Real WebGL/GLBs in Chromium/SwiftShader, not Android/GPU bytes.
import process from "node:process";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2];
if (!directory) throw new Error("Expected evidence directory");
const cycles = Number(process.argv[3] ?? 10);
assert(cycles >= 1 && cycles <= 10);
const sourceRef = process.argv[4];
await mkdir(directory, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4179, strictPort: true },
  plugins: [
    {
      name: "r3-lifecycle-evidence",
      enforce: "pre",
      transform(code, id) {
        const name = id.split("/").at(-1);
        return sourceRef &&
          ["ThreeWorldRuntime.ts", "referenceScene.ts"].includes(name)
          ? execFileSync(
              "git",
              ["show", `${sourceRef}:src/features/library/three/${name}`],
              { encoding: "utf8" },
            )
          : code;
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/__bv_lifecycle") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><style>body{margin:0}#world{width:100vw;height:100vh}</style><div id="world"></div></html>',
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
const context = await browser.newContext({
  viewport: { width: 800, height: 600 },
  deviceScaleFactor: 1,
});
await context.tracing.start({
  screenshots: false,
  snapshots: false,
  sources: true,
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
let failed = false;
try {
  await page.goto("http://127.0.0.1:4179/__bv_lifecycle");
  // Initialize Playwright's injected event guards before counting runtime listeners.
  await page.waitForFunction(() => true);
  await page.evaluate(() => {
    const tracked = new WeakMap();
    const add = globalThis.EventTarget.prototype.addEventListener;
    const remove = globalThis.EventTarget.prototype.removeEventListener;
    let listeners = 0;
    const relevant = (target) =>
      target === globalThis.window ||
      target === globalThis.document ||
      target instanceof globalThis.HTMLCanvasElement;
    const key = (type, options) =>
      `${type}:${typeof options === "boolean" ? options : Boolean(options?.capture)}`;
    globalThis.EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (listener && relevant(this)) {
        let map = tracked.get(this);
        if (!map) {
          map = new Map();
          tracked.set(this, map);
        }
        const id = key(type, options);
        const set = map.get(id) ?? new Set();
        if (!set.has(listener)) {
          set.add(listener);
          listeners++;
        }
        map.set(id, set);
      }
      return add.call(this, type, listener, options);
    };
    globalThis.EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      if (
        relevant(this) &&
        tracked.get(this)?.get(key(type, options))?.delete(listener)
      )
        listeners--;
      return remove.call(this, type, listener, options);
    };
    const observers = new Set();
    const NativeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class extends NativeObserver {
      observe(...args) {
        observers.add(this);
        return super.observe(...args);
      }
      disconnect() {
        observers.delete(this);
        super.disconnect();
      }
    };
    globalThis.__lifecycleCounters = () => ({
      listeners,
      observers: observers.size,
    });
  });
  for (let cycle = 0; cycle < cycles; cycle++) {
    await page.evaluate(async () => {
      const three = await import("/node_modules/three/build/three.module.js");
      const { ThreeWorldRuntime } =
        await import("/src/features/library/three/ThreeWorldRuntime.ts");
      const { LivingSession } =
        await import("/src/features/library/livingObjects.ts");
      const { NightLightingSession } =
        await import("/src/features/library/nightLighting.ts");
      const baseline = globalThis.__lifecycleCounters();
      const frames = new Map();
      let id = 0,
        now = 0,
        renderer,
        scene;
      const date = () => new Date(2026, 10, 7, 12);
      const living = new LivingSession(date);
      const runtime = new ThreeWorldRuntime({
        livingSession: living,
        nightLighting: new NightLightingSession(date),
        libraryWorldSnapshot: {
          categories: [
            "book",
            "movie",
            "series",
            "study",
            "physical_activity",
            "work",
          ].map((type) => ({
            type,
            entries: Array.from(
              { length: type === "book" ? 3 : 1 },
              (_, i) => ({
                type,
                entryId: `fiction-${type}-${i}`,
                instanceId:
                  type === "book"
                    ? `reading-book:fiction-book-${i}`
                    : `library-${type}:fiction-${i}`,
                modelTypeId:
                  type === "book"
                    ? "book-volume"
                    : type === "physical_activity"
                      ? "physical-activity-record"
                      : `${type}-record`,
                title: "Registro fictício",
                createdAt: "2026-11-07T12:00:00Z",
                readingProgress: { currentPage: 0 },
                episodesWatched: 0,
                progressCurrent: 0,
                progressUnit: "hours",
                category: "mixed",
              }),
            ),
          })),
          scrolls: [
            {
              id: "scroll:note:fiction",
              entryId: "fiction-book-2",
              annotationId: "fiction",
              kind: "note",
              category: "book",
              updatedAt: "2026-11-07T12:00:00Z",
            },
          ],
        },
        now: () => now,
        frameScheduler: {
          request(cb) {
            frames.set(++id, cb);
            return id;
          },
          cancel(id) {
            frames.delete(id);
          },
        },
        createRenderer() {
          renderer = new three.WebGLRenderer({ antialias: true });
          const render = renderer.render.bind(renderer);
          renderer.render = (s, c) => {
            scene = s;
            render(s, c);
          };
          return renderer;
        },
      });
      runtime.mount(globalThis.document.getElementById("world"));
      runtime.start();
      const step = () => {
        const [id, cb] = frames.entries().next().value;
        frames.delete(id);
        now += 50;
        cb(now);
      };
      globalThis.__cycle = {
        runtime,
        renderer,
        baseline,
        get scene() {
          return scene;
        },
        frames,
        step,
      };
    });
    await page.waitForFunction(
      () =>
        globalThis.document.querySelector("canvas")?.dataset
          .inhabitantsReady === "4",
    );
    await page.evaluate(() => {
      const p = globalThis.__cycle;
      p.step();
      p.runtime.selectObject("living:book");
      p.canvas = p.renderer.domElement;
      p.oldFrame = p.frames.values().next().value;
      p.resources = new Map();
      p.scene.traverse((o) => {
        for (const resource of [
          o.geometry,
          ...(Array.isArray(o.material) ? o.material : [o.material]),
        ].filter(Boolean)) {
          if (!p.resources.has(resource)) {
            p.resources.set(resource, 0);
            resource.addEventListener("dispose", () =>
              p.resources.set(resource, p.resources.get(resource) + 1),
            );
          }
          if (resource.isMaterial)
            for (const t of Object.values(resource))
              if (t?.isTexture && !p.resources.has(t)) {
                p.resources.set(t, 0);
                t.addEventListener("dispose", () =>
                  p.resources.set(t, p.resources.get(t) + 1),
                );
              }
        }
      });
      p.mounted = {
        ownedResources: p.resources.size,
        gpuCounters: { ...p.renderer.info.memory },
        contextLost: p.renderer.getContext().isContextLost(),
        ...globalThis.__lifecycleCounters(),
      };
    });
    await page.mouse.move(150, 150);
    await page.mouse.down();
    const paused = await page.evaluate(() => {
      const p = globalThis.__cycle;
      const capturedBefore = p.canvas.hasPointerCapture(1);
      p.runtime.pause();
      const out = {
        state: p.runtime.getDiagnostics().runtimeState,
        frames: p.frames.size,
        canvas: globalThis.document.querySelectorAll("canvas").length,
        gesture: p.canvas.dataset.gesture,
        capturedBefore,
        capturedAfter: p.canvas.hasPointerCapture(1),
        ...globalThis.__lifecycleCounters(),
      };
      // An inactive route must remain paused even after foreground changes.
      Object.defineProperty(globalThis.document, "hidden", {
        configurable: true,
        value: true,
      });
      globalThis.document.dispatchEvent(
        new globalThis.Event("visibilitychange"),
      );
      Object.defineProperty(globalThis.document, "hidden", {
        configurable: true,
        value: false,
      });
      globalThis.document.dispatchEvent(
        new globalThis.Event("visibilitychange"),
      );
      out.inactiveForegroundState = p.runtime.getDiagnostics().runtimeState;
      return out;
    });
    await page.mouse.up();
    await page.setViewportSize(
      cycle % 2 ? { width: 800, height: 600 } : { width: 600, height: 800 },
    );
    const resumed = await page.evaluate(() => {
      const p = globalThis.__cycle;
      p.runtime.resize();
      p.runtime.resume();
      p.runtime.resume();
      const currentFrame = p.frames.values().next().value;
      p.oldFrame(1000); // cancelled callback must not replace/duplicate the current RAF
      const staleFrameIgnored =
        p.frames.size === 1 && p.frames.values().next().value === currentFrame;
      Object.defineProperty(globalThis.document, "hidden", {
        configurable: true,
        value: true,
      });
      globalThis.document.dispatchEvent(
        new globalThis.Event("visibilitychange"),
      );
      const backgroundFrames = p.frames.size;
      Object.defineProperty(globalThis.document, "hidden", {
        configurable: true,
        value: false,
      });
      globalThis.document.dispatchEvent(
        new globalThis.Event("visibilitychange"),
      );
      delete globalThis.document.hidden;
      p.step();
      return {
        state: p.runtime.getDiagnostics().runtimeState,
        frames: p.frames.size,
        backgroundFrames,
        sameCanvas: globalThis.document.querySelector("canvas") === p.canvas,
        selection: p.canvas.dataset.selectedObject,
        staleFrameIgnored,
      };
    });
    // Record baseline violations before fixing; final run asserts below after persistence.
    let contextLoss = "not-requested";
    if (cycle === cycles - 1) {
      contextLoss = await page.evaluate(() => {
        const extension = globalThis.__cycle.renderer
          .getContext()
          .getExtension("WEBGL_lose_context");
        globalThis.__cycle.extension = extension;
        extension?.loseContext();
        return extension ? "requested" : "unsupported";
      });
      if (contextLoss === "requested") {
        await page.waitForFunction(
          () =>
            globalThis.__cycle.runtime.getDiagnostics().runtimeState ===
            "failed",
        );
        await page.evaluate(() =>
          globalThis.__cycle.extension.restoreContext(),
        );
        await page.waitForFunction(
          () => !globalThis.__cycle.renderer.getContext().isContextLost(),
        );
        contextLoss = "restored-terminal";
        // The harness deliberately restored an already terminal context. Release
        // that test-owned restoration; the runtime must remain failed/inert.
        await page.evaluate(() => globalThis.__cycle.extension.loseContext());
      }
    }
    const disposed = await page.evaluate(() => {
      const p = globalThis.__cycle;
      const interactions = p.runtime.agency?.interactions;
      const mounted = p.mounted;
      p.runtime.dispose();
      p.runtime.dispose();
      p.renderer.domElement.dispatchEvent(
        new globalThis.Event("webglcontextrestored"),
      );
      const out = {
        mounted,
        baseline: p.baseline,
        frames: p.frames.size,
        canvas: globalThis.document.querySelectorAll("canvas").length,
        state: p.runtime.getDiagnostics().runtimeState,
        leases: interactions?.snapshot().length ?? 0,
        undisposed: [...p.resources.values()].filter((n) => n === 0).length,
        repeatedDisposals: [...p.resources.values()].filter((n) => n > 1)
          .length,
        gpuCounters: { ...p.renderer.info.memory },
        contextLost: p.renderer.getContext().isContextLost(),
        ...globalThis.__lifecycleCounters(),
      };
      p.resources.clear();
      globalThis.__cycle = null;
      return out;
    });
    await cdp.send("HeapProfiler.collectGarbage");
    const domAfterGc = await cdp.send("Memory.getDOMCounters");
    const heapAfterGc = await cdp.send("Runtime.getHeapUsage");
    // Do not bind detached nodes into the CDP DOM agent: those handles themselves
    // retain nodes across cycles and would contaminate this ownership measurement.
    results.push({
      heapAfterGc,
      cycle: cycle + 1,
      paused,
      resumed,
      contextLoss,
      disposed,
      domAfterGc,
    });
  }
  await writeFile(
    `${directory}/lifecycle.json`,
    `${JSON.stringify({ environment: "Chromium / SwiftShader / DPR1; real runtime, six categories, four GLBs, one scroll; host counters, no Android bytes/FPS", sourceRef: sourceRef ?? "working-tree", cycles: results, pageErrors: errors }, null, 2)}\n`,
  );
  for (const r of results) {
    assert.equal(r.paused.state, "paused");
    assert.equal(r.paused.frames, 0);
    assert.equal(r.paused.canvas, 1);
    assert.equal(r.paused.gesture, "idle");
    assert.equal(r.paused.capturedAfter, false);
    assert.equal(r.paused.inactiveForegroundState, "paused");
    assert.equal(r.resumed.state, "running");
    assert.equal(r.resumed.backgroundFrames, 0);
    assert.equal(r.resumed.sameCanvas, true);
    assert.equal(r.resumed.selection, "living:book");
    assert.equal(r.resumed.frames, 1);
    assert.equal(r.resumed.staleFrameIgnored, true);
    assert.equal(r.disposed.undisposed, 0);
    assert.equal(r.disposed.contextLost, true);
    assert.equal(r.disposed.repeatedDisposals, 0);
    assert.equal(
      r.disposed.frames +
        r.disposed.canvas +
        (r.disposed.listeners - r.disposed.baseline.listeners) +
        r.disposed.observers +
        r.disposed.leases,
      0,
    );
  }
  assert.deepEqual(errors, []);
  globalThis.console.log(`PASS: ${cycles} directed lifecycle cycles`);
} catch (error) {
  failed = true;
  await context.tracing.stop({ path: `${directory}/failure-trace.zip` });
  throw error;
} finally {
  if (!failed) await context.tracing.stop();
  await browser.close();
  await server.close();
}
