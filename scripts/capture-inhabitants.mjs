import process from "node:process";
// Actual imported GLBs, paired orthographic views; no synthetic replacement render.
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const out = process.argv[2] || "docs/audits/evidence/bv-r5/portraits";
await mkdir(out, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4189 },
  plugins: [
    {
      name: "portraits",
      configureServer(s) {
        s.middlewares.use(async (req, res, next) => {
          if (req.url === "/portraits") {
            res.setHeader("Content-Type", "text/html");
            res.end('<html><body style="margin:0"></body></html>');
          } else if (req.url.startsWith("/before/")) {
            res.setHeader("Content-Type", "model/gltf-binary");
            res.end(
              await readFile("/tmp/bv-r5-before/" + req.url.split("/").at(-1)),
            );
          } else next();
        });
      },
    },
  ],
});
await server.listen();
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 600, height: 700 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:4189/portraits");
  await page.evaluate(async () => {
    const T = await import("/node_modules/three/build/three.module.js");
    const { GLTFLoader } =
      await import("/node_modules/three/examples/jsm/loaders/GLTFLoader.js");
    const r = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    r.setSize(600, 700);
    r.setPixelRatio(1);
    globalThis.document.body.append(r.domElement);
    globalThis.capture = async (key, version, view) => {
      const scene = new T.Scene();
      scene.background = new T.Color("#171a2c");
      const gltf = await new GLTFLoader().loadAsync(
        version === "before"
          ? `/before/${key}.glb`
          : `/src/features/library/three/assets/${key}.glb`,
      );
      scene.add(gltf.scene);
      scene.add(
        new T.HemisphereLight(0xb9d5ff, 0x514036, view === "night" ? 0.7 : 2),
      );
      for (const [pos, color, power] of [
        [[2, 3, 4], 0xffe0b0, view === "night" ? 1 : 3],
        [[-2, 2, -3], 0xa69aff, 3],
      ]) {
        const l = new T.DirectionalLight(color, power);
        l.position.set(...pos);
        scene.add(l);
      }
      const camera = new T.OrthographicCamera(
        -1.05,
        1.05,
        1.225,
        -1.225,
        0.1,
        50,
      );
      camera.position.set(
        view === "front" ? 0 : 2,
        1.45,
        view === "front" ? 5 : 4,
      );
      camera.lookAt(0, 1, 0);
      if (view === "magic") {
        const mixer = new T.AnimationMixer(gltf.scene);
        mixer
          .clipAction(gltf.animations.find((c) => c.name === "magic"))
          .play();
        mixer.setTime(1.6);
      }
      r.render(scene, camera);
      return {
        calls: r.info.render.calls,
        triangles: r.info.render.triangles,
        geometries: r.info.memory.geometries,
      };
    };
  });
  const metrics = {};
  for (const key of ["samael", "aryn", "ytha", "lua"])
    for (const version of ["before", "after"])
      for (const view of ["front", "three-quarter", "night", "magic"]) {
        metrics[`${key}-${version}-${view}`] = await page.evaluate(
          ([k, v, w]) => globalThis.capture(k, v, w),
          [key, version, view],
        );
        await page.screenshot({ path: `${out}/${key}-${version}-${view}.png` });
      }
  await writeFile(
    `${out}/metrics.json`,
    JSON.stringify({ metrics, errors }, null, 2),
  );
} finally {
  await browser.close();
  await server.close();
}
