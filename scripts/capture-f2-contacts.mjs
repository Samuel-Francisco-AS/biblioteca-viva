import process from "node:process";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const out = "docs/audits/evidence/bv-f2";
await mkdir(out, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4191 },
  plugins: [
    {
      name: "f2-contacts",
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url !== "/f2-contacts") return next();
          res.setHeader("Content-Type", "text/html");
          res.end('<html><body style="margin:0"></body></html>');
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
  const page = await browser.newPage({ viewport: { width: 720, height: 700 } });
  await page.goto("http://127.0.0.1:4191/f2-contacts");
  await page.evaluate(async () => {
    const T = await import("/node_modules/three/build/three.module.js");
    const { GLTFLoader } =
      await import("/node_modules/three/examples/jsm/loaders/GLTFLoader.js");
    const { createLibraryFurnishing } =
      await import("/src/features/library/three/proceduralLibraryFurnishing.ts");
    const { LIBRARY_FURNISHING, furnitureWorldPoint } =
      await import("/src/features/library/three/libraryFurnishingLayout.ts");
    const { SESSION_SEATS, seatForInhabitant } =
      await import("/src/features/library/sessionStations.ts");
    const { disposeObjectTree } =
      await import("/src/features/library/three/referenceScene.ts");
    globalThis.document.body.replaceChildren();
    globalThis.document.body.style.margin = "0";
    const renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(720, 700);
    renderer.setPixelRatio(1);
    globalThis.document.body.append(renderer.domElement);
    const building = createLibraryFurnishing(true);
    const seat = SESSION_SEATS[0];
    const scene = new T.Scene();
    scene.background = new T.Color("#222638");
    scene.add(building);
    scene.add(new T.HemisphereLight(0xb9d5ff, 0x534031, 2.4));
    const light = new T.DirectionalLight(0xffe8ca, 3);
    light.position.set(-3, 6, 5);
    scene.add(light);
    const floor = new T.Mesh(
      new T.PlaneGeometry(80, 80),
      new T.MeshStandardMaterial({ color: "#413844" }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.002, 0);
    scene.add(floor);
    const camera = new T.OrthographicCamera(-1.55, 1.55, 1.5, -1.5, 0.1, 50);
    camera.position.set(seat.center.x + 3.8, 2.5, seat.center.z - 5);
    camera.lookAt(seat.center.x, 0.85, seat.center.z);
    let current = null,
      glTF = null,
      currentKey = null,
      mixer = null;
    globalThis.capturePhysical = async (key, action, time) => {
      if (key !== currentKey) {
        if (current) {
          mixer.stopAllAction();
          mixer.uncacheRoot(current);
          disposeObjectTree(current);
        }
        glTF = await new GLTFLoader().loadAsync(
          `/src/features/library/three/assets/${key}.glb`,
        );
        current = glTF.scene;
        currentKey = key;
        scene.add(current);
        mixer = new T.AnimationMixer(current);
      }
      mixer.stopAllAction();
      const activeSeat = action === "study_seated" ? SESSION_SEATS[1] : seat;
      const tailored = seatForInhabitant(activeSeat, key);
      const kind =
        action === "workshop"
          ? "work"
          : action === "train"
            ? "physical_activity"
            : action === "watch"
              ? "viewing"
              : null;
      const stationId =
        kind === "work"
          ? "bf4-prop:16"
          : kind === "physical_activity"
            ? "bf4-prop:14"
            : "bf4-prop:6";
      const station = LIBRARY_FURNISHING.find((p) => p.id === stationId);
      const origin = kind
        ? furnitureWorldPoint(station, {
            x: kind === "work" ? 0 : kind === "viewing" ? 2.4 : -3.1,
            y: 0,
            z: kind === "work" ? 1.65 : kind === "viewing" ? -2.8 : 1.45,
          })
        : tailored.dock;
      const facing =
        kind === "work"
          ? Math.PI + station.rotation
          : kind === "viewing"
            ? Math.atan2(station.x - origin.x, station.z - origin.z) +
              station.rotation
            : kind === "physical_activity"
              ? station.rotation
              : activeSeat.facing;
      current.position.set(origin.x, 0, origin.z);
      current.rotation.y = facing;
      const focus = new T.Vector3(origin.x, 0.85, origin.z);
      camera.position
        .copy(focus)
        .add(
          new T.Vector3(3.8, 1.65, 5).applyAxisAngle(
            new T.Vector3(0, 1, 0),
            facing,
          ),
        );
      camera.lookAt(focus);
      const clip = glTF.animations.find((c) => c.name === action);
      const a = mixer.clipAction(clip);
      a.setLoop(T.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.play();
      mixer.update(Math.min(time, clip.duration - 0.0001));
      renderer.render(scene, camera);
      return {
        key,
        action,
        time,
        seat: current
          .getObjectByName("socket_seat")
          .getWorldPosition(new T.Vector3())
          .toArray(),
        hand: current
          .getObjectByName("socket_carry")
          .getWorldPosition(new T.Vector3())
          .toArray(),
      };
    };
    globalThis.disposeContacts = () => {
      mixer?.stopAllAction();
      if (current) mixer.uncacheRoot(current);
      disposeObjectTree(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  });
  const poses = [];
  const filter = process.argv[2]?.split(",");
  for (const key of ["samael", "aryn", "ytha", "lua"])
    for (const [name, action, time] of [
      ["sit-mid", "sit", 1],
      ["seated", "read_seated", 1],
      ["stand-mid", "stand", 1],
      ["study", "study_seated", 1],
      ["workshop", "workshop", 1],
      ...(key === "ytha" ? [["train", "train", 1]] : []),
      ...(key === "samael" ? [["watch", "watch", 1]] : []),
    ]) {
      if (filter && !filter.includes(name)) continue;
      poses.push(
        await page.evaluate(
          ([key, action, time]) =>
            globalThis.capturePhysical(key, action, time),
          [key, action, time],
        ),
      );
      await page.screenshot({ path: `${out}/${key}-${name}.png` });
    }
  await writeFile(
    `${out}/${filter ? "supplement-poses" : "poses"}.json`,
    JSON.stringify(poses, null, 2) + "\n",
  );
  await page.evaluate(() => globalThis.disposeContacts());
} finally {
  await browser.close();
  await server.close();
}
