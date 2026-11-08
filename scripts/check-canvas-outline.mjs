// Isolate the R5R CSS artifact with real gesture handling and NO WebGL context.
import process from "node:process";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const directory = process.argv[2],
  before = process.argv[3] === "before";
assert(directory, "Expected evidence directory");
await mkdir(directory, { recursive: true });
const originalCss = execFileSync(
  "git",
  ["show", "34f1c02470273abb52c8fb641934b06075895812:src/styles-atelier.css"],
  { encoding: "utf8" },
);
const server = await createServer({
  server: { host: "127.0.0.1", port: 4191, strictPort: true, hmr: false },
  plugins: [
    {
      name: "outline-reproduction",
      resolveId(id) {
        if (id === "/__outline.js") return id;
      },
      load(id) {
        if (id === "/__outline.js")
          return `
import {Scene,OrthographicCamera} from 'three';
import {ThreeWorldInteraction} from '/src/features/library/three/ThreeWorldInteraction.ts';
import {CameraNavigation} from '/src/features/library/three/CameraNavigation.ts';
const canvas=document.querySelector('canvas'), camera=new OrthographicCamera(-2,2,2,-2,.1,100),navigation=new CameraNavigation(camera);
const box=canvas.getBoundingClientRect();navigation.setViewport(box.width,box.height);
const interaction=new ThreeWorldInteraction({camera,canvas,navigation,scene:new Scene(),catalog:[],selectables:[],render(){},onSelectionChange(){}});
interaction.setViewport(box.width,box.height);
globalThis.probe={canvas,navigation,interaction};
`;
      },
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url === "/__outline-before.css") {
            res.setHeader("Content-Type", "text/css");
            res.end(originalCss);
            return;
          }
          if (req.url !== "/__outline") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(
            `<html><head><link rel="stylesheet" href="/src/styles.css"><link rel="stylesheet" href="/src/styles-legacy.css"><link rel="stylesheet" href="${before ? "/__outline-before.css" : "/src/styles-atelier.css"}"></head><body style="margin:0"><div class="app-shell" data-route="library"><div class="library-page"><div class="living-world-stage"><div class="world-host"><canvas class="three-world-canvas" style="background:#25362d"></canvas></div></div><button class="button" style="position:fixed;top:24px;left:24px">Verificar foco</button></div></div><script type="module" src="/__outline.js"></script></body></html>`,
          );
        });
      },
    },
  ],
});
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 412, height: 892 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:4191/__outline");
  await page.waitForFunction(() => Boolean(globalThis.probe));
  const snapshot = () =>
    page.evaluate(() => {
      const p = globalThis.probe,
        s = globalThis.getComputedStyle(p.canvas);
      return {
        gesture: p.canvas.dataset.gesture,
        outline: s.outlineStyle,
        width: s.outlineWidth,
        color: s.outlineColor,
        offset: s.outlineOffset,
        bounds: p.canvas.getBoundingClientRect().toJSON(),
        camera: p.navigation.getState(),
        rendererCreated: false,
        focusVisible: p.canvas.matches(":focus-visible"),
        activeTag: globalThis.document.activeElement?.tagName,
      };
    });
  const idle = await snapshot();
  await page.mouse.move(140, 350);
  await page.mouse.down();
  const tap = await snapshot();
  assert.equal(tap.gesture, "tap");
  assert.equal(tap.width, before ? "2px" : idle.width);
  assert.equal(tap.outline, before ? "solid" : idle.outline);
  if (before) {
    assert.equal(tap.color, "rgb(181, 233, 223)");
    assert.equal(tap.offset, "-2px");
  }
  await page.screenshot({ path: directory + "/tap.png" });
  await page.mouse.move(340, 350);
  const pan = await snapshot();
  assert.equal(pan.gesture, "pan");
  assert.equal(pan.outline, "none");
  assert.notDeepEqual(pan.camera, idle.camera);
  await page.mouse.up();
  const released = await snapshot();
  assert.equal(released.gesture, "idle");
  const pinch = await page.evaluate(() => {
    const p = globalThis.probe;
    const send = (type, id, x) =>
      p.canvas.dispatchEvent(
        new globalThis.PointerEvent(type, {
          pointerId: id,
          pointerType: "touch",
          clientX: x,
          clientY: 400,
          bubbles: true,
          cancelable: true,
        }),
      );
    const initial = p.navigation.getState().zoom;
    send("pointerdown", 31, 120);
    send("pointerdown", 32, 240);
    send("pointermove", 32, 320);
    const observed = {
      gesture: p.canvas.dataset.gesture,
      initialZoom: initial,
      zoom: p.navigation.getState().zoom,
    };
    send("pointerup", 32, 320);
    send("pointerup", 31, 120);
    return observed;
  });
  assert.equal(pinch.gesture, "pinch");
  assert.notEqual(pinch.zoom, pinch.initialZoom);
  await page.mouse.wheel(0, 120);
  const wheel = await snapshot();
  assert.notEqual(wheel.camera.zoom, pinch.zoom);
  await page.keyboard.press("Tab");
  const focus = await page
    .getByRole("button", { name: "Verificar foco" })
    .evaluate((button) => ({
      visible: button.matches(":focus-visible"),
      style: globalThis.getComputedStyle(button).outlineStyle,
      width: globalThis.getComputedStyle(button).outlineWidth,
    }));
  assert.equal(focus.visible, true);
  assert.equal(focus.style, "solid");
  assert(parseFloat(focus.width) > 0);
  await page.screenshot({ path: directory + "/keyboard-focus.png" });
  await page.evaluate(() => globalThis.probe.interaction.dispose());
  assert.deepEqual(errors, []);
  await writeFile(
    directory + "/reproduction.json",
    JSON.stringify(
      {
        scope:
          "Chromium mobile412x892 DPR1, productive CSS and ThreeWorldInteraction/CameraNavigation; no renderer/WebGL context. Held initial tap exposes the CSS frame; not Moto G06 physical frame timing.",
        before,
        idle,
        tap,
        pan,
        released,
        pinch,
        wheel,
        focus,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
  await server.close();
}
