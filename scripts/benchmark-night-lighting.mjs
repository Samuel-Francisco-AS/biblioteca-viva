// Diagnostic only: real ThreeWorldRuntime and full fictional composition, manual clock.
// CPU submission is not GPU timing, and SwiftShader is not an Android device.
import process from "node:process";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2];
// Older sources use a complete BV_R5P_ROOT archive, never mixed-file overrides.
const sourceRef = process.argv[4] || undefined;
if (!directory) throw new Error("Expected evidence directory");
await mkdir(directory, { recursive: true });
const server = await createServer({
  root: process.env.BV_R5P_ROOT,
  cacheDir: "/tmp/bv-r5p-probe-vite",
  server: {
    host: "127.0.0.1",
    port: 4188,
    strictPort: true,
    hmr: false,
    watch: { ignored: ["**/src/**"] },
  },
  plugins: [
    {
      name: "recovery-diagnostic-page",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/__bv_render_probe") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><head><style>body{margin:0;background:#18342d}#world{width:800px;height:600px}</style></head><body><div id="world"></div></body></html>',
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
  viewport: { width: 800, height: 600 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
try {
  await page.goto("http://127.0.0.1:4188/__bv_render_probe");
  const initialize = async () => {
    const three = await import("/node_modules/three/build/three.module.js");
    const { ThreeWorldRuntime } =
      await import("/src/features/library/three/ThreeWorldRuntime.ts");
    const { LivingSession } =
      await import("/src/features/library/livingObjects.ts");
    const { NightLightingSession } =
      await import("/src/features/library/nightLighting.ts");
    let minute = 0,
      second = 0;
    let hour = 12,
      timestamp = 0,
      scheduled = null,
      renderMs = 0,
      matrixUpdates = 0;
    const date = () => new Date(2026, 10, 6, hour, minute, second);
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
          preserveDrawingBuffer: false,
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
      renderWithoutOverride: renderer.render.bind(renderer),
      living,
      night,
      get scene() {
        return scene;
      },
      get camera() {
        return camera;
      },
      setHour(h, m = 0, s = 0) {
        hour = h;
        minute = m;
        second = s;
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
  };
  await page.evaluate(initialize);
  await page.waitForFunction(
    () =>
      globalThis.document.querySelector("canvas")?.dataset.inhabitantsReady ===
      "4",
  );
  const results = [];
  const modes =
    process.env.BV_R5P_CHECK_ONLY === "1"
      ? []
      : [
          "A-day",
          "B-night",
          "C-no-lamps",
          "D-three-lamps",
          "E-no-ytha",
          "A-no-ytha",
        ];
  for (const mode of modes) {
    for (const motion of ["still", "pan-pinch"]) {
      if (results.length) {
        await page.reload();
        await page.evaluate(initialize);
        await page.waitForFunction(
          () =>
            globalThis.document.querySelector("canvas")?.dataset
              .inhabitantsReady === "4",
        );
      }
      const result = await page.evaluate(
        async ({ mode, motion }) => {
          const p = globalThis.__bvProbe;
          const three =
            await import("/node_modules/three/build/three.module.js");
          const pct = (values) => {
            const a = [...values].sort((a, b) => a - b);
            const at = (q) =>
              a.length ? a[Math.ceil(a.length * q) - 1] : null;
            return {
              count: a.length,
              p50: at(0.5),
              p95: at(0.95),
              p99: at(0.99),
              max: a.at(-1) ?? null,
            };
          };
          // Isolate illumination: keep four spawn poses, clips, and simulation
          // deltas identical. Agency decisions/motion are excluded in ALL cases.
          p.runtime.agency.update = () => {};
          p.runtime.navigation.commit({ targetX: 0, targetZ: 0, zoom: 0.7 });
          p.setHour(mode.startsWith("A-") ? 12 : 22);
          for (let i = 0; i < 400; i++)
            p.runtime.livingVisuals.update(1 / 60, false);
          const lamps = [];
          p.scene.traverse((o) => {
            if (o.isPointLight && o.name.startsWith("night-lamp:"))
              lamps.push(o);
          });
          const selected = [...lamps]
            .sort((a, b) => {
              const x = a.getWorldPosition(new three.Vector3());
              const y = b.getWorldPosition(new three.Vector3());
              return x.x * x.x + x.z * x.z - y.x * y.x - y.z * y.z;
            })
            .slice(0, 3);
          const withoutYtha = mode.endsWith("no-ytha");
          const originalRender = p.renderer.render.bind(p.renderer);
          p.renderWithoutOverride = originalRender;
          p.renderer.render = (s, c) => {
            if (mode === "C-no-lamps") for (const l of lamps) l.visible = false;
            if (mode === "D-three-lamps")
              for (const l of lamps) l.visible = selected.includes(l);
            const y = p.scene.getObjectByName("ytha-fey-light");
            if (y) y.visible = !withoutYtha;
            originalRender(s, c);
          };
          const unsubscribe = p.runtime.onDiagnosticsChange(() => {});
          if (p.runtime.resetPerformanceProbe)
            p.runtime.gpuTimer = {
              begin() {},
              end() {},
              dispose() {},
              snapshot() {
                return { supported: false };
              },
            };
          const gl = p.renderer.getContext();
          const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2");
          const gpu = [],
            pending = [];
          const longTasks = [];
          const supported =
            globalThis.PerformanceObserver.supportedEntryTypes.includes(
              "longtask",
            );
          const obs = supported
            ? new globalThis.PerformanceObserver((list) =>
                longTasks.push(...list.getEntries().map((e) => e.duration)),
              )
            : null;
          const raf = [],
            cpu = [],
            submit = [],
            updates = [],
            counts = [];
          let previous;
          const frames = 32,
            warmup = 8;
          for (let i = 0; i < frames + warmup; i++) {
            const t = await new Promise(globalThis.requestAnimationFrame);
            if (i === warmup) obs?.observe({ type: "longtask" });
            if (i > warmup) raf.push(t - previous);
            previous = t;
            if (motion !== "still") {
              // Exact same continuous trajectory, independent of host speed.
              p.runtime.navigation.panBetweenScreenPoints(
                { x: 400, y: 300 },
                {
                  x: 400 + Math.cos(i * 0.17) * 3,
                  y: 300 + Math.sin(i * 0.17) * 2,
                },
              );
              p.runtime.navigation.zoomBetweenScreenPoints(
                { x: 400, y: 300 },
                { x: 400, y: 300 },
                0.9 + 0.18 * Math.sin(i * 0.11),
              );
            }
            if (ext) {
              while (
                pending.length &&
                gl.getQueryParameter(
                  pending[0].query,
                  gl.QUERY_RESULT_AVAILABLE,
                )
              ) {
                const { query: q, sample } = pending.shift();
                if (sample && !gl.getParameter(ext.GPU_DISJOINT_EXT))
                  gpu.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6);
                gl.deleteQuery(q);
              }
            }
            const q =
              ext && i >= warmup && pending.length < 4
                ? gl.createQuery()
                : null;
            if (q) gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
            const data = p.step();
            if (q) {
              gl.endQuery(ext.TIME_ELAPSED_EXT);
              pending.push({ query: q, sample: i >= warmup });
            }
            if (i >= warmup) {
              cpu.push(data.frameJsMs);
              submit.push(data.renderSubmissionMs);
              updates.push(data.otherJsMs);
              counts.push({
                calls: p.renderer.info.render.calls,
                triangles: p.renderer.info.render.triangles,
                programs: p.renderer.info.programs.length,
              });
            }
          }
          await new Promise(globalThis.requestAnimationFrame);
          longTasks.push(...(obs?.takeRecords().map((e) => e.duration) ?? []));
          obs?.disconnect();
          const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          while (fence && gl.clientWaitSync(fence, 0, 0) === gl.TIMEOUT_EXPIRED)
            await new Promise(globalThis.requestAnimationFrame);
          if (fence) gl.deleteSync(fence);
          for (const { query, sample } of pending) {
            if (
              sample &&
              gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE) &&
              !gl.getParameter(ext.GPU_DISJOINT_EXT)
            )
              gpu.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
            gl.deleteQuery(query);
          }
          unsubscribe();
          let active = 0,
            transparentMeshes = 0;
          p.scene.traverseVisible((o) => {
            if (o.isPointLight) active++;
            if (
              o.isMesh &&
              (Array.isArray(o.material) ? o.material : [o.material]).some(
                (m) => m.transparent,
              )
            )
              transparentMeshes++;
          });
          return {
            mode,
            motion,
            raf: pct(raf),
            frameCpu: pct(cpu),
            submitCpu: pct(submit),
            otherCpu: pct(updates),
            longTasksSupported: supported,
            longTasks: pct(longTasks),
            gpuTimerSupported: !!ext,
            gpuTimerMs: pct(gpu),
            webgl: counts,
            activePointLights: active,
            visibleTransparentMeshes: transparentMeshes,
            cpuMetrics: p.runtime.getDiagnostics().cpuMetrics,
            framebuffer: [
              p.renderer.domElement.width,
              p.renderer.domElement.height,
            ],
            camera: p.runtime.navigation.getState(),
            inhabitants: p.runtime.agency
              .getPoses()
              .map(({ id, x, z, action }) => ({ id, x, z, action })),
            shadows: p.renderer.shadowMap.enabled,
          };
        },
        { mode, motion },
      );
      results.push(result);
      await writeFile(
        `${directory}/samples.partial.json`,
        JSON.stringify(results, null, 2) + "\n",
      );
      // Drain only AFTER measurement, asynchronously. Software WebGL may queue
      // work faster than it executes; never confuse screenshot backlog with FPS.
      await page.evaluate(async () => {
        const gl = globalThis.__bvProbe.renderer.getContext();
        const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        while (fence && gl.clientWaitSync(fence, 0, 0) === gl.TIMEOUT_EXPIRED)
          await new Promise(globalThis.requestAnimationFrame);
        if (fence) gl.deleteSync(fence);
      });
      await page.screenshot({ path: `${directory}/${mode}-${motion}.png` });
      await writeFile(
        `${directory}/metrics.json`,
        JSON.stringify(
          {
            label: process.argv[3],
            sourceRef: sourceRef ?? "working-tree",
            browser: browser.version(),
            scope:
              "Chromium/SwiftShader host only; 800x600 DPR1 AA; fixed four R5E poses/clips, 24 fictional records and 4 scrolls; 8 warmup + 32 native RAF-driven frames at fixed animation dt. Agency decisions excluded equally; CPU submission is NOT GPU/Android FPS. D pins the three nearest lamps to initial target.",
            errors,
            results,
          },
          null,
          2,
        ) + "\n",
      );
    }
  }
  const regressions = await page.evaluate(async () => {
    const p = globalThis.__bvProbe;
    if (!p.runtime.setLightingExperiment)
      return { scope: "baseline; no experiment controls" };
    p.renderer.render = p.renderWithoutOverride;
    p.runtime.agency.update = () => {};
    const assert = (value, label) => {
      if (!value) throw new Error(label);
    };
    const { NIGHT_LAMPS } =
      await import("/src/features/library/nightLighting.ts");
    const lamps = NIGHT_LAMPS.map((l) =>
      p.scene.getObjectByName(`${l.id}:light`),
    );
    const cores = NIGHT_LAMPS.map((l) =>
      p.scene.getObjectByName(`${l.id}:ember`),
    );
    const powers = [];
    for (const [h, m, s, expected] of [
      [17, 59, 59, 0],
      [18, 0, 0, 0.68],
      [18, 0, 44, 0.68],
      [18, 0, 45, 1],
      [6, 0, 0, 0],
    ]) {
      p.setHour(h, m, s);
      p.runtime.livingVisuals.update(0, true);
      assert(
        lamps.length === 9 &&
          lamps.every((l) => Math.abs(l.intensity - 4.2 * expected) < 1e-8),
        "nine lamp powers across dusk/dawn",
      );
      powers.push({ h, m, s, power: expected });
    }
    p.setHour(18, 0, 10);
    p.night.complete(NIGHT_LAMPS[0].id);
    const checkpoint = JSON.stringify(p.night.capture()),
      living = p.living.getSnapshot();
    const unsub = p.runtime.onDiagnosticsChange(() => {});
    const modes = [];
    for (const mode of [
      "day",
      "original",
      "no-lamps",
      "limited",
      "candidate",
    ]) {
      p.runtime.setLightingExperiment({ mode, ythaLight: false });
      p.runtime.livingVisuals.update(0, true);
      const count = lamps.filter((l) => l.visible).length;
      assert(
        count ===
          (mode === "day" || mode === "no-lamps"
            ? 0
            : mode === "limited"
              ? 3
              : 9),
        "experiment light count",
      );
      assert(
        cores.filter((l) => l.visible).length === (mode === "day" ? 0 : 9),
        "visual lamp cores",
      );
      assert(
        !p.scene.getObjectByName("ytha-fey-light").visible,
        "isolated Ytha toggle",
      );
      assert(
        JSON.stringify(p.night.capture()) === checkpoint &&
          p.living.getSnapshot() === living,
        "no session mutation",
      );
      p.step(0);
      modes.push({ mode, points: count });
    }
    const canvas = p.renderer.domElement;
    p.runtime.pause();
    p.runtime.resume();
    assert(
      p.renderer.domElement === canvas &&
        p.runtime.getDiagnostics().activeFrameLoops === 1,
      "resident resume with one loop",
    );
    for (const id of [
      "character:samael",
      "character:aryn",
      "character:ytha",
      "character:lua",
    ]) {
      p.runtime.selectObject(id);
      p.step(0);
      assert(
        canvas.dataset.selectedObject === id &&
          canvas.dataset.highlightedObject === id,
        "selection/highlight",
      );
    }
    p.runtime.selectObject(null);
    unsub();
    p.runtime.livingVisuals.update(0, true);
    assert(
      p.runtime.getDiagnostics().lightingExperiment === null,
      "normal restored on diagnostic close",
    );
    assert(p.scene.getObjectByName("ytha-fey-light").visible, "Ytha restored");
    assert(
      lamps[0].intensity === 4.2 && lamps[1].intensity === 4.2 * 0.68,
      "ritual and fallback restored",
    );
    return {
      powers,
      modes,
      selection: "four real rigs/highlights PASS",
      resume: "same canvas; one loop",
      normal: "clock/ritual/Ytha restored",
      sessionsUnchanged: true,
    };
  });
  await writeFile(
    `${directory}/regressions.json`,
    JSON.stringify(regressions, null, 2) + "\n",
  );
  const disposal = await page.evaluate(() => {
    const p = globalThis.__bvProbe;
    p.runtime.dispose();
    return {
      state: p.runtime.getDiagnostics().runtimeState,
      canvases: globalThis.document.querySelectorAll("canvas").length,
    };
  });
  await writeFile(
    `${directory}/disposal.json`,
    JSON.stringify(disposal, null, 2) + "\n",
  );
  if (errors.length) throw new Error(errors.join("; "));
  if (modes.length) await unlink(`${directory}/samples.partial.json`);
} finally {
  await browser.close();
  await server.close();
}
