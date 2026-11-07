// Paired mechanism probe: identical synthetic hierarchy, real Three raycasts,
// legacy interaction loaded from the audited SHA versus the current checkout.
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import process from "node:process";
import { createServer } from "vite";
import { JSDOM } from "jsdom";
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
} from "three";

const output = process.argv[2];
if (!output)
  throw new Error(
    "Usage: node scripts/benchmark-world-picking.mjs output.json",
  );
const baseline = "254ae15d48a10896d00b8a6b539532725375d13c";
const dom = new JSDOM();
const results = [];
try {
  for (const mode of ["before", "after"]) {
    const server = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      plugins: [
        {
          name: "audited-interaction",
          enforce: "pre",
          transform(source, id) {
            if (
              mode === "before" &&
              id.endsWith("/three/ThreeWorldInteraction.ts")
            ) {
              return execFileSync(
                "git",
                [
                  "show",
                  `${baseline}:src/features/library/three/ThreeWorldInteraction.ts`,
                ],
                { encoding: "utf8" },
              );
            }
            return source;
          },
        },
      ],
    });
    try {
      const { ThreeWorldInteraction } = await server.ssrLoadModule(
        "/src/features/library/three/ThreeWorldInteraction.ts",
      );
      const { CameraNavigation } = await server.ssrLoadModule(
        "/src/features/library/three/CameraNavigation.ts",
      );
      const scene = new Scene();
      const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 100);
      const navigation = new CameraNavigation(camera);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      const geometry = new BoxGeometry(0.2, 0.2, 0.1);
      const material = new MeshBasicMaterial();
      const selectables = [];
      const priority = [];
      const counts = {
        meshRaycasts: 0,
        sceneMatrixForces: 0,
        decorationMatrixVisits: 0,
      };
      const selections = [];
      const addMesh = (parent) => {
        const mesh = new Mesh(geometry, material);
        const raycast = mesh.raycast;
        mesh.raycast = function (...args) {
          counts.meshRaycasts++;
          return raycast.apply(this, args);
        };
        parent.add(mesh);
        return mesh;
      };
      for (let i = 0; i < 30; i++) {
        const root = new Group();
        root.position.set(
          ((i % 6) - 2.5) * 0.4,
          (Math.floor(i / 6) - 2) * 0.4,
          0,
        );
        scene.add(root);
        addMesh(root);
        const id = i % 3 === 0 ? `character:actor-${i}` : `record:object-${i}`;
        selectables.push({ descriptor: { id, label: id }, root });
        if (i % 3 !== 0) priority.push(root);
        // Registered book below a registered shelf, as in the real runtime.
        const child = new Group();
        child.position.z = 0.2;
        root.add(child);
        addMesh(child);
        selectables.push({
          descriptor: { id: `book:${i}`, label: `book:${i}` },
          root: child,
        });
      }
      for (let i = 0; i < 100; i++) {
        const decoration = addMesh(scene);
        decoration.position.x = 20;
        const update = decoration.updateMatrixWorld;
        decoration.updateMatrixWorld = function (...args) {
          counts.decorationMatrixVisits++;
          return update.apply(this, args);
        };
        const updateWorld = decoration.updateWorldMatrix;
        decoration.updateWorldMatrix = function (...args) {
          counts.decorationMatrixVisits++;
          return updateWorld.apply(this, args);
        };
      }
      const sceneUpdate = scene.updateMatrixWorld;
      scene.updateMatrixWorld = function (...args) {
        if (args[0] === true) counts.sceneMatrixForces++;
        return sceneUpdate.apply(this, args);
      };
      const canvas = dom.window.document.createElement("canvas");
      canvas.getBoundingClientRect = () =>
        new dom.window.DOMRect(0, 0, 400, 400);
      const interaction = new ThreeWorldInteraction({
        camera,
        canvas,
        scene,
        navigation,
        selectables,
        catalog: selectables.map((s) => s.descriptor),
        pickingPriorityRoots: priority,
        render: () => {},
        onSelectionChange: () => {},
      });
      for (const [x, y] of [
        [180, 200],
        [140, 120],
        [220, 280],
        [399, 1],
        [1, 399],
        [180, 200],
      ]) {
        for (const type of ["pointerdown", "pointerup"]) {
          const event = new dom.window.MouseEvent(type, {
            clientX: x,
            clientY: y,
            cancelable: true,
          });
          Object.defineProperty(event, "pointerId", { value: 1 });
          canvas.dispatchEvent(event);
        }
        selections.push(canvas.dataset.selectedObject);
      }
      if (!selections.some(Boolean) || selections.every(Boolean))
        throw new Error("Probe must exercise both hits and misses");
      results.push({ mode, taps: selections.length, counts, selections });
      interaction.dispose();
      geometry.dispose();
      material.dispose();
    } finally {
      await server.close();
    }
  }
  if (
    JSON.stringify(results[0].selections) !==
    JSON.stringify(results[1].selections)
  )
    throw new Error(`Picking behavior changed: ${JSON.stringify(results)}`);
  await writeFile(
    output,
    JSON.stringify(
      {
        baseline,
        scope:
          "Synthetic 60 selectables, 100 decorations; same geometry and rays in both versions; not a full scene or GPU/Android benchmark",
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  dom.window.close();
}
