import process from "node:process";
// Structural inventory through the same GLTFLoader used by the application.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Box3, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const folder = process.argv[2] || "src/features/library/three/assets";
const result = {};
for (const key of ["samael", "aryn", "ytha", "lua"]) {
  const bytes = await readFile(`${folder}/${key}.glb`);
  const json = JSON.parse(
    bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString(),
  );
  const { scene, animations } = await new GLTFLoader().parseAsync(
    new Uint8Array(bytes).buffer,
    "",
  );
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene, true);
  const nodes = [];
  let bufferBytes = 0;
  scene.traverse((o) => {
    nodes.push({ name: o.name, type: o.type, parent: o.parent?.name });
    if (o.isMesh)
      for (const a of Object.values(o.geometry.attributes))
        bufferBytes += a.array.byteLength;
  });
  result[key] = {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length,
    nodes,
    meshes: json.meshes.length,
    materials: json.materials,
    textures: json.textures || [],
    skins: json.skins || [],
    triangles: json.meshes.reduce(
      (s, m) =>
        s +
        m.primitives.reduce(
          (n, p) => n + json.accessors[p.indices].count / 3,
          0,
        ),
      0,
    ),
    bufferBytes,
    dimensions: bounds.getSize(new Vector3()).toArray(),
    min: bounds.min.toArray(),
    max: bounds.max.toArray(),
    animations: animations.map((c) => ({
      name: c.name,
      duration: c.duration,
      tracks: c.tracks.map((t) => ({ name: t.name, keys: t.times.length })),
    })),
  };
}
await writeFile(
  process.argv[3] || "/tmp/inhabitants.json",
  JSON.stringify(result, null, 2) + "\n",
);
