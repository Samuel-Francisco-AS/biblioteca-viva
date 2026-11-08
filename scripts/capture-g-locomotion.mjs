// Paired real-GLB poses. Fixed light/camera/phase; never an Android FPS claim.
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
const out = "docs/audits/evidence/bv-g";
await mkdir(out, { recursive: true });
const before = Object.fromEntries(
  ["samael", "aryn", "ytha", "lua"].map((key) => [
    key,
    execFileSync(
      "git",
      ["show", `d8b2c4e:src/features/library/three/assets/${key}.glb`],
      { maxBuffer: 8 * 1024 * 1024 },
    ),
  ]),
);
const server = await createServer({
  server: { host: "127.0.0.1", port: 4193 },
  plugins: [
    {
      name: "g-locomotion",
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url === "/g-poses") {
            res.setHeader("Content-Type", "text/html");
            res.end(
              '<html><body style="margin:0;background:#171a2c;color:#eee;font:16px serif"><div id="caption" style="padding:12px"></div></body></html>',
            );
          } else if (req.url.startsWith("/g-before/")) {
            const key = req.url.split("/").at(-1).replace(".glb", "");
            if (!before[key]) return next();
            res.setHeader("Content-Type", "model/gltf-binary");
            res.end(before[key]);
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
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 680 },
  });
  await page.goto("http://127.0.0.1:4193/g-poses");
  await page.evaluate(async () => {
    const T = await import("/node_modules/three/build/three.module.js");
    const { GLTFLoader } =
      await import("/node_modules/three/examples/jsm/loaders/GLTFLoader.js");
    const { disposeObjectTree } =
      await import("/src/features/library/three/referenceScene.ts");
    const renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(1200, 620);
    renderer.setPixelRatio(1);
    renderer.setScissorTest(true);
    globalThis.document.body.append(renderer.domElement);
    globalThis.posePair = async (key) => {
      globalThis.document.getElementById("caption").textContent =
        `${key.toUpperCase()} · walk · F2 (acima) / G (abaixo) · fases 0,10 / 0,25 / 0,40 / 0,55 / 0,70 s · mesma câmera/luz`;
      for (const [row, version] of ["before", "after"].entries()) {
        const gltf = await new GLTFLoader().loadAsync(
          version === "before"
            ? `/g-before/${key}.glb`
            : `/src/features/library/three/assets/${key}.glb`,
        );
        const scene = new T.Scene();
        scene.background = new T.Color("#171a2c");
        scene.add(gltf.scene, new T.HemisphereLight(0xb9d5ff, 0x514036, 2));
        const light = new T.DirectionalLight(0xffe0b0, 3);
        light.position.set(-2, 4, 5);
        scene.add(light);
        const floor = new T.Mesh(
          new T.PlaneGeometry(8, 8),
          new T.MeshStandardMaterial({ color: "#424254" }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.005;
        scene.add(floor);
        const camera = new T.OrthographicCamera(
          -0.95,
          0.95,
          1.23,
          -1.23,
          0.1,
          50,
        );
        camera.position.set(3, 1.8, 4);
        camera.lookAt(0, 0.92, 0);
        const mixer = new T.AnimationMixer(gltf.scene);
        mixer.clipAction(gltf.animations.find((c) => c.name === "walk")).play();
        for (const [col, t] of [0.1, 0.25, 0.4, 0.55, 0.7].entries()) {
          mixer.setTime(t);
          renderer.setViewport(col * 240, (1 - row) * 310, 240, 310);
          renderer.setScissor(col * 240, (1 - row) * 310, 240, 310);
          renderer.render(scene, camera);
        }
        mixer.stopAllAction();
        mixer.uncacheRoot(gltf.scene);
        disposeObjectTree(scene);
      }
    };
  });
  for (const key of ["samael", "aryn", "ytha", "lua"]) {
    await page.evaluate((key) => globalThis.posePair(key), key);
    await page.screenshot({ path: `${out}/${key}-locomotion.png` });
  }
  await writeFile(
    `${out}/capture.json`,
    JSON.stringify(
      {
        base: "d8b2c4eb151f8fe2643cd3e3e0a3ceaf534e53ea",
        description:
          "GLBs reais, walk, mesma câmera/luz e fases; Chromium SwiftShader; sem aceite humano ou FPS Android",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
  await server.close();
}
