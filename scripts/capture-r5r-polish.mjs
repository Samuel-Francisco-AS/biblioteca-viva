// Paired real-world stills/counters; NOT an Android/GPU/presentation benchmark.
import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2];
if (!directory) throw new Error("Expected evidence directory");
await mkdir(directory, { recursive: true });
const root = process.env.BV_R5R_ROOT;
const idleOnly = process.env.BV_R5R_IDLE_ONLY === "1";
const uiOnly = process.env.BV_R5R_UI_ONLY === "1";
const server = await createServer({
  root,
  cacheDir: root ? "/tmp/bv-r5r-base-vite" : "/tmp/bv-r5r-current-vite",
  server: {
    host: "127.0.0.1",
    port: 4190,
    strictPort: true,
    hmr: false,
    watch: { ignored: ["**/src/**"] },
  },
  plugins: [
    {
      name: "r5r-stills",
      resolveId(id) {
        if (id === "/__r5r-ui.js") return id;
      },
      load(id) {
        if (id === "/__r5r-ui.js")
          return `
        import React from 'react';import {createRoot} from 'react-dom/client';
        import {NarrativePanel} from '/src/features/library/NarrativePanel.tsx';
        import {NarrativeSession} from '/src/features/library/narrative/session.ts';
        import '/src/styles.css';import '/src/styles-legacy.css';import '/src/styles-atelier.css';
        const session=new NarrativeSession();session.talk('lua');
        createRoot(globalThis.document.getElementById('root')).render(React.createElement(NarrativePanel,{session,failed:false}));
      `;
      },
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url === "/__r5r-ui") {
            res.setHeader("Content-Type", "text/html");
            res.end(
              '<html><body style="margin:0"><div class="app-shell" data-route="library"><div id="root" class="library-page"></div></div><script type="module" src="/__r5r-ui.js"></script></body></html>',
            );
            return;
          }
          if (req.url !== "/__r5r") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            '<html><body style="margin:0"><div id="world" style="width:800px;height:600px"></div></body></html>',
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
try {
  if (uiOnly) {
    await page.setViewportSize({ width: 412, height: 892 });
    await page.goto("http://127.0.0.1:4190/__r5r-ui");
    await page.waitForFunction(
      () => globalThis.document.activeElement?.tagName === "H3",
    );
    const styles = [];
    for (const reduced of [false, true]) {
      await page.emulateMedia({
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      const observed = await page.evaluate(() => {
        const card = globalThis.document.querySelector(".rpg-dialogue"),
          content = globalThis.document.querySelector(".rpg-dialogue-content");
        const css = globalThis.getComputedStyle(card);
        return {
          animation: css.animationName,
          duration: css.animationDuration,
          opacity: css.opacity,
          contentAnimation: content
            ? globalThis.getComputedStyle(content).animationName
            : null,
          contentDuration: content
            ? globalThis.getComputedStyle(content).animationDuration
            : null,
          focus: globalThis.document.activeElement.tagName,
        };
      });
      await page.screenshot({
        path: directory + `/card-mobile${reduced ? "-reduced" : ""}.jpg`,
        type: "jpeg",
        quality: 86,
      });
      styles.push({ reduced, ...observed });
      if (
        reduced &&
        observed.contentAnimation &&
        observed.contentAnimation !== "none"
      )
        throw new Error("Reduced motion still animated");
    }
    await writeFile(
      directory + "/ui.json",
      JSON.stringify(
        {
          scope:
            "Real NarrativePanel/final CSS, mobile412x892 DPR1, fictional Lua card. Static layout/native CSS observations, NOT input latency or physical presentation.",
          styles,
          errors,
        },
        null,
        2,
      ) + "\n",
    );
  } else {
    await page.goto("http://127.0.0.1:4190/__r5r");
    await page.evaluate(async () => {
      const T = await import("/node_modules/three/build/three.module.js");
      const { ThreeWorldRuntime } =
        await import("/src/features/library/three/ThreeWorldRuntime.ts");
      const { LivingSession } =
        await import("/src/features/library/livingObjects.ts");
      const { NightLightingSession } =
        await import("/src/features/library/nightLighting.ts");
      let hour = 12;
      const date = () => new Date(2026, 10, 8, hour);
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
        entries: Array.from({ length: type === "book" ? 3 : 1 }, (_, i) => ({
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
          createdAt: "2026-11-08T12:00:00Z",
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
          scrolls: [
            {
              id: "scroll:note:fiction",
              annotationId: "fiction",
              entryId: "fiction-book-0",
              kind: "note",
              category: "book",
              updatedAt: "2026-11-08T12:00:00Z",
            },
          ],
        },
        frameScheduler: {
          request() {
            return 1;
          },
          cancel() {},
        },
        createRenderer() {
          renderer = new T.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
          });
          const render = renderer.render.bind(renderer);
          renderer.render = (s, c) => {
            scene = s;
            camera = c;
            render(s, c);
          };
          return renderer;
        },
      });
      runtime.mount(globalThis.document.getElementById("world"));
      runtime.start();
      globalThis.p = {
        T,
        runtime,
        living,
        night,
        renderer,
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
          for (let i = 0; i < 400; i++)
            runtime.livingVisuals.update(1 / 60, false);
        },
      };
    });
    await page.waitForFunction(
      () =>
        globalThis.document.querySelector("canvas")?.dataset
          .inhabitantsReady === "4",
    );
    await page.evaluate((idleOnly) => {
      const { runtime } = globalThis.p;
      // Identical autonomous poses; actual authored clips and presence clocks advance.
      for (const key of ["samael", "aryn", "ytha", "lua"])
        runtime.inhabitants.play(
          "character:" + key,
          idleOnly ? "idle" : "magic",
        );
      for (let i = 0; i < (idleOnly ? 150 : 36); i++)
        runtime.inhabitants.update(0.05, false);
      runtime.applyWorldSession({
        sessionId: "fiction-session",
        entryId: "fiction-book-0",
        instanceId: "reading-book:fiction-book-0",
        entryType: "book",
        kind: "reading",
        status: "active",
        revision: 1,
      });
      for (let i = 0; i < 500; i++)
        runtime.sessionBooks.update(0.05, false, []);
      if (!runtime.sessionBooks.candidate())
        throw new Error("Reading book did not reach its real stage");
    }, idleOnly);
    const results = [];
    for (const hour of [12, 23])
      for (const target of idleOnly
        ? ["samael"]
        : ["samael", "aryn", "ytha", "lua", "scroll", "reading"])
        for (const zoom of [0.7, 1.5]) {
          const result = await page.evaluate(
            ({ hour, target, zoom }) => {
              const p = globalThis.p;
              p.setHour(hour);
              let object;
              if (target === "scroll")
                object = p.runtime.scrollVisuals.selectables[0].root;
              else if (target === "reading")
                object = p.runtime.readingAreaBookVisuals?.get(
                  "reading-book:fiction-book-0",
                )?.node;
              else object = p.scene.getObjectByName("character:" + target);
              if (!object) throw new Error("Missing target " + target);
              const position = object.getWorldPosition(new p.T.Vector3());
              p.runtime.navigation.commit({
                targetX: position.x,
                targetZ: position.z,
                zoom,
              });
              p.renderer.render(p.scene, p.camera);
              const times = [];
              for (let i = 0; i < 5; i++) {
                const start = globalThis.performance.now();
                p.renderer.render(p.scene, p.camera);
                times.push(globalThis.performance.now() - start);
              }
              const points = [];
              p.scene.traverse((o) => {
                if (o.isPointLight)
                  points.push({
                    name: o.name,
                    intensity: o.intensity,
                    visible: o.visible,
                  });
              });
              return {
                hour,
                target,
                zoom,
                camera: p.runtime.navigation.getState(),
                points,
                calls: p.renderer.info.render.calls,
                triangles: p.renderer.info.render.triangles,
                geometries: p.renderer.info.memory.geometries,
                textures: p.renderer.info.memory.textures,
                programs: p.renderer.info.programs.length,
                submitCpuSamples: times,
                session: p.runtime.sessionBooks.snapshot(),
              };
            },
            { hour, target, zoom },
          );
          const file = `${idleOnly ? "idle-" : ""}${hour}-${target}-${zoom}.jpg`;
          await page.screenshot({
            path: directory + "/" + file,
            type: "jpeg",
            quality: 82,
          });
          results.push({ ...result, file });
        }
    const teardown = await page.evaluate(() => {
      const p = globalThis.p;
      p.runtime.dispose();
      return {
        state: p.runtime.getDiagnostics().runtimeState,
        canvases: globalThis.document.querySelectorAll("canvas").length,
      };
    });
    await writeFile(
      directory + (idleOnly ? "/idle-metrics.json" : "/metrics.json"),
      JSON.stringify(
        {
          scope:
            "Chromium/SwiftShader real world, 800x600 DPR1, same fictional records, fixed poses, camera/lighting/reading stage. CPU render samples NOT GPU/Android or sustained FPS.",
          pose: idleOnly ? "idle at 7.5s" : "magic at 1.8s",
          results,
          errors,
          teardown,
        },
        null,
        2,
      ) + "\n",
    );
    if (errors.length) throw new Error(errors.join("; "));
  }
} finally {
  await browser.close();
  await server.close();
}
