import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const out = "docs/audits/evidence/bv-f2";
await mkdir(out, { recursive: true });
const server = await createServer({
  server: { host: "127.0.0.1", port: 4192 },
  plugins: [
    {
      name: "f2-capture",
      configureServer(s) {
        s.middlewares.use((req, res, next) => {
          if (req.url !== "/f2-capture") return next();
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
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  await page.goto("http://127.0.0.1:4192/f2-capture");
  await page.evaluate(async () => {
    const T = await import("/node_modules/three/build/three.module.js");
    const { InhabitantAgency } =
      await import("/src/features/library/inhabitantAgency.ts");
    const { InhabitantNavigation } =
      await import("/src/features/library/inhabitantNavigation.ts");
    const { createInhabitantVisuals } =
      await import("/src/features/library/three/inhabitantVisuals.ts");
    const { createSessionBookVisuals } =
      await import("/src/features/library/three/sessionBookVisuals.ts");
    const { createProceduralLibraryBuilding } =
      await import("/src/features/library/three/proceduralLibraryBuilding.ts");
    const { createProceduralComposition } =
      await import("/src/features/library/three/proceduralComposition.ts");
    const { LIBRARY_SHELVES } =
      await import("/src/features/library/libraryShelfLayout.ts");
    const { reconcileReadingAreaBookVisuals } =
      await import("/src/features/library/three/readingAreaBookVisuals.ts");
    const { collectInhabitantObstacles } =
      await import("/src/features/library/three/inhabitantObstacles.ts");
    const { createLivingVisuals } =
      await import("/src/features/library/three/livingVisuals.ts");
    const { LivingSession } =
      await import("/src/features/library/livingObjects.ts");
    const { disposeObjectTree } =
      await import("/src/features/library/three/referenceScene.ts");
    const scene = new T.Scene();
    scene.background = new T.Color("#222638");
    scene.add(new T.HemisphereLight(0xb9d5ff, 0x534031, 2.4));
    const light = new T.DirectionalLight(0xffe8ca, 3);
    light.position.set(-3, 6, 5);
    scene.add(light);
    const building = createProceduralLibraryBuilding(true),
      shelves = createProceduralComposition(LIBRARY_SHELVES);
    scene.add(building, shelves.root);
    const living = createLivingVisuals(building, scene, new LivingSession());
    const books = new Map(
      reconcileReadingAreaBookVisuals(
        shelves,
        [
          {
            entryId: "fiction",
            instanceId: "reading-book:fiction",
            modelTypeId: "book-volume",
            title: "Livro fictício F2",
            readingProgress: { currentPage: 0 },
          },
        ],
        new Map(),
      ).visible.map((v) => [v.book.instanceId, v]),
    );
    const navigation = new InhabitantNavigation(
      collectInhabitantObstacles([building, shelves.root]),
    );
    let time = 0,
      controller,
      inhabitants;
    const agency = new InhabitantAgency(navigation, {
      now: () => time,
      seed: 51,
      canPhysicalActor: (id) => inhabitants.hasPhysicalActions(id),
      canPhysicalStep: (pose) =>
        pose.interactionObjectId?.startsWith("reading-book:")
          ? (inhabitants.probePhysicalPose(pose, (socket) =>
              controller.checkHandPose(socket, pose),
            ) ?? false)
          : true,
    });
    let resolveReady;
    const ready = new Promise((resolve) => (resolveReady = resolve));
    let count = 0;
    inhabitants = createInhabitantVisuals(
      scene,
      undefined,
      (id) => {
        agency.setAvailable(id, true);
        if (++count === 4) resolveReady();
      },
      true,
    );
    await ready;
    controller = createSessionBookVisuals({
      books: () => books,
      obstacleRoots: [building, shelves.root],
      interactions: agency.interactions,
      now: () => agency.interactionTime,
      navigation,
      pickupProfiles: () => inhabitants.getPickupProfiles(),
    });
    let session = {
      sessionId: "fiction-session",
      entryId: "fiction",
      instanceId: "reading-book:fiction",
      entryType: "book",
      kind: "reading",
      status: "active",
      revision: 1,
    };
    controller.apply(session);
    agency.setMode("running");
    const node = books.get("reading-book:fiction").node;
    const renderer = new T.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(900, 800);
    renderer.setPixelRatio(1);
    globalThis.document.body.append(renderer.domElement);
    const camera = new T.OrthographicCamera(-2.05, 2.05, 1.82, -1.82, 0.1, 40);
    const cpu = [];
    const step = () => {
      const start = globalThis.performance.now();
      time += 50;
      controller.update(0.05, false, agency.getPoses());
      const bookEnd = globalThis.performance.now();
      agency.update({
        physicalObstacles: controller.navigationObstacles(),
        readingCandidate: controller.candidate(),
        scrollCandidates: [],
        sessionActivity: session,
      });
      const agencyEnd = globalThis.performance.now();
      const poses = agency.getPoses();
      controller.reconcileCarrier(poses);
      inhabitants.drive(poses);
      inhabitants.update(0.05, false);
      const poseEnd = globalThis.performance.now();
      controller.followInhabitant(0.05, poses, (id) =>
        inhabitants.getSocket(id, "socket_carry"),
      );
      cpu.push({
        book: bookEnd - start,
        agency: agencyEnd - bookEnd,
        pose: poseEnd - agencyEnd,
        follow: globalThis.performance.now() - poseEnd,
      });
    };
    globalThis.captureReading = (marker) => {
      if (marker === "returned") {
        session = null;
        controller.apply(null);
      }
      let actor;
      for (let i = 0; i < 5000; i++) {
        step();
        actor = agency
          .getPoses()
          .find((p) => p.physicalSessionId === "fiction-session");
        if (marker === "held" && node.parent?.name === "socket_carry") break;
        if (
          marker === "sitting" &&
          actor?.interactionState === "sitting" &&
          actor.physicalActionTime > 0.9
        )
          break;
        if (
          marker === "reading" &&
          actor?.action === "read_seated" &&
          controller.snapshot().opening > 0.9
        )
          break;
        if (marker === "returned" && controller.snapshot().state === "shelf")
          break;
        if (i === 4999) throw new Error(`F2 marker not reached: ${marker}`);
      }
      if (node !== books.get("reading-book:fiction").node)
        throw new Error("Canonical book changed");
      const position = node.getWorldPosition(new T.Vector3());
      const focus = actor
        ? new T.Vector3(actor.x, 0.9, actor.z).lerp(position, 0.25)
        : position.clone();
      const offset = new T.Vector3(3, 2.6, 4.8).applyAxisAngle(
        new T.Vector3(0, 1, 0),
        actor?.facing ?? 0,
      );
      camera.position.copy(focus).add(offset);
      camera.lookAt(focus);
      renderer.render(scene, camera);
      return {
        marker,
        time,
        actor,
        book: controller.snapshot(),
        parent: node.parent?.name,
        canonical: true,
        cpu: {
          scope:
            "Headless host CPU simulation phases; no render/Android frame-rate claim",
          samples: cpu.length,
          phases: Object.fromEntries(
            ["book", "agency", "pose", "follow"].map((key) => {
              const values = cpu.map((v) => v[key]).sort((a, b) => a - b);
              return [
                key,
                {
                  p50: values[Math.floor(values.length * 0.5)],
                  p95: values[Math.floor(values.length * 0.95)],
                },
              ];
            }),
          ),
        },
        render: {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        },
      };
    };
    globalThis.disposeCapture = () => {
      controller.dispose();
      inhabitants.dispose();
      agency.dispose();
      living.dispose();
      disposeObjectTree(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  });
  const frames = [];
  for (const marker of ["held", "sitting", "reading", "returned"]) {
    frames.push(
      await page.evaluate(
        (marker) => globalThis.captureReading(marker),
        marker,
      ),
    );
    await page.screenshot({ path: `${out}/reading-${marker}.png` });
  }
  await writeFile(
    `${out}/reading-sequence.json`,
    JSON.stringify(frames, null, 2) + "\n",
  );
  await page.evaluate(() => globalThis.disposeCapture());
} finally {
  await browser.close();
  await server.close();
}
