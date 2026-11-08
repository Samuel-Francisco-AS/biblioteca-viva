// Host CPU isolation: actual R5E rigs/FX, exact deformed highlight and tap bounds.
// No renderer, GPU, RAF, Android or input-to-photon measurement.
import process from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { AnimationMixer, Box3, SkinnedMesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createServer } from "vite";
const output = process.argv[2];
if (!output) throw new Error("Expected output.json");
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { createInhabitantPresence } = await server.ssrLoadModule(
    "/src/features/library/three/inhabitantPresence.ts",
  );
  const { distribution } = await server.ssrLoadModule(
    "/src/features/library/three/performanceProbe.ts",
  );
  const { disposeObjectTree } = await server.ssrLoadModule(
    "/src/features/library/three/referenceScene.ts",
  );
  const { withPreparedSkinning } = await server.ssrLoadModule(
    "/src/features/library/three/preparedSkinning.ts",
  );
  const versions = {};
  for (const mode of ["original", "prepared"]) {
    const actors = [];
    for (const key of ["samael", "aryn", "ytha", "lua"]) {
      const bytes = await readFile(
        `src/features/library/three/assets/${key}.glb`,
      );
      const gltf = await new GLTFLoader().parseAsync(
        new Uint8Array(bytes).buffer,
        "",
      );
      const mixer = new AnimationMixer(gltf.scene);
      mixer.clipAction(gltf.animations.find((c) => c.name === "idle")).play();
      const presence = createInhabitantPresence(gltf.scene, key);
      const skins = [];
      gltf.scene.traverse((n) => {
        if (n instanceof SkinnedMesh) skins.push(n);
      });
      const skeletons = new Set(skins.map((s) => s.skeleton));
      actors.push({
        key,
        scene: gltf.scene,
        mixer,
        presence,
        skins,
        skeletons,
        box: new Box3(),
      });
    }
    const samples = {
      animationAndPresence: [],
      tapBoundsAllFour: [],
      ...Object.fromEntries(actors.map((a) => [`highlight:${a.key}`, []])),
    };
    const measure = (name, run, record, roots = []) => {
      const start = performance.now();
      if (mode === "prepared" && roots.length) withPreparedSkinning(roots, run);
      else run();
      if (record) samples[name].push(performance.now() - start);
    };
    for (let frame = 0; frame < 40; frame++) {
      const record = frame >= 8;
      measure(
        "animationAndPresence",
        () => {
          for (const a of actors) {
            a.mixer.update(1 / 60);
            a.presence.update(1 / 60, "idle", false);
            a.scene.updateMatrixWorld(true);
            for (const s of a.skeletons) s.update();
          }
        },
        record,
      );
      for (const a of actors)
        measure(
          `highlight:${a.key}`,
          () => {
            a.scene.updateWorldMatrix(true, false);
            a.scene.updateMatrixWorld(true);
            a.box.setFromObject(a.scene, true);
          },
          record,
          [a.scene],
        );
      measure(
        "tapBoundsAllFour",
        () => {
          for (const a of actors)
            for (const skin of a.skins) {
              skin.computeBoundingBox();
              skin.computeBoundingSphere();
            }
        },
        record,
        actors.map((a) => a.scene),
      );
    }
    versions[mode] = Object.fromEntries(
      Object.entries(samples).map(([k, v]) => [k, distribution(v)]),
    );
    for (const a of actors) {
      a.presence.dispose();
      a.mixer.stopAllAction();
      a.mixer.uncacheRoot(a.scene);
      disposeObjectTree(a.scene);
    }
  }
  await writeFile(
    output,
    JSON.stringify(
      {
        scope:
          "Node host CPU; 8 warmup + 32 samples; actual GLBs, idle clips, presence, world/palettes, precise selected-character bounds and all-four tap bounds. No renderer/RAF/GPU/Android. Highlights measured individually, not four selected simultaneously. Original and prepared paths use the same exact Three bounding/raycast readers; preparation costs included.",
        node: process.version,
        milliseconds: versions,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await server.close();
}
