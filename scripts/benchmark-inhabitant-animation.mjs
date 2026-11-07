// CPU host diagnostic, four real GLBs simultaneously; no Android/GPU claim.
import { performance } from "node:perf_hooks";
import process from "node:process";
import { freemem, totalmem } from "node:os";
import { readFile, writeFile } from "node:fs/promises";
import { AnimationMixer } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const result = {
  scope:
    "Node CPU host, parse excludes disk read; four mixers + world matrices + skeleton palette; no GPU or device memory",
  node: process.version,
  hostMemory: { total: totalmem(), available: freemem() },
  versions: {},
};
for (const [label, folder] of [
  ["before", "/tmp/bv-r5-before"],
  ["after", "src/features/library/three/assets"],
]) {
  const actors = [];
  const load = {};
  for (const key of ["samael", "aryn", "ytha", "lua"]) {
    const bytes = await readFile(`${folder}/${key}.glb`);
    const start = performance.now();
    const gltf = await new GLTFLoader().parseAsync(
      new Uint8Array(bytes).buffer,
      "",
    );
    load[key] = performance.now() - start;
    const mixer = new AnimationMixer(gltf.scene);
    mixer.clipAction(gltf.animations.find((c) => c.name === "walk")).play();
    actors.push({ ...gltf, mixer });
  }
  const frame = () => {
    for (const a of actors) {
      a.mixer.update(1 / 60);
      a.scene.updateMatrixWorld(true);
      const skeletons = new Set();
      a.scene.traverse((o) => {
        if (o.isSkinnedMesh) skeletons.add(o.skeleton);
      });
      for (const skeleton of skeletons) skeleton.update();
    }
  };
  for (let i = 0; i < 60; i++) frame();
  const times = [];
  for (let i = 0; i < 300; i++) {
    const start = performance.now();
    frame();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  result.versions[label] = {
    parseMs: load,
    animationFrameMs: { p50: times[150], p95: times[285], p99: times[297] },
    heapUsed: process.memoryUsage().heapUsed,
  };
  for (const a of actors) {
    a.mixer.stopAllAction();
    a.mixer.uncacheRoot(a.scene);
    const resources = new Set();
    a.scene.traverse((o) => {
      if (o.isMesh) {
        resources.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          resources.add(m);
        if (o.isSkinnedMesh) resources.add(o.skeleton);
      }
    });
    for (const r of resources) r.dispose();
  }
}
await writeFile(
  process.argv[2] || "/tmp/inhabitant-costs.json",
  JSON.stringify(result, null, 2) + "\n",
);
