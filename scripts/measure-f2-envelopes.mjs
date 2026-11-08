import process from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import { AnimationMixer, Matrix4, Mesh, SkinnedMesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const result = {};
for (const key of ["samael", "aryn", "ytha", "lua"]) {
  const gltf = await new GLTFLoader().parseAsync(
    new Uint8Array(
      await readFile(`src/features/library/three/assets/${key}.glb`),
    ).buffer,
    "",
  );
  const clips = {};
  const point = new Vector3(),
    base = new Vector3(),
    influence = new Vector3();
  for (const clip of gltf.animations) {
    const mixer = new AnimationMixer(gltf.scene);
    mixer.clipAction(clip).play();
    let radius = 0,
      minY = Infinity;
    for (let frame = 0; frame <= 32; frame++) {
      mixer.setTime(Math.max(0, (clip.duration * frame) / 32 - 0.00001));
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((mesh) => {
        if (!(mesh instanceof Mesh)) return;
        const positions = mesh.geometry.getAttribute("position");
        const palette =
          mesh instanceof SkinnedMesh
            ? mesh.skeleton.bones.map((b, i) =>
                new Matrix4().multiplyMatrices(
                  b.matrixWorld,
                  mesh.skeleton.boneInverses[i],
                ),
              )
            : null;
        const weights = mesh.geometry.getAttribute("skinWeight"),
          indices = mesh.geometry.getAttribute("skinIndex");
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i);
          if (palette) {
            base.copy(point).applyMatrix4(mesh.bindMatrix);
            point.set(0, 0, 0);
            for (let j = 0; j < 4; j++) {
              const w = weights.getComponent(i, j);
              if (w)
                point.addScaledVector(
                  influence
                    .copy(base)
                    .applyMatrix4(palette[indices.getComponent(i, j)]),
                  w,
                );
            }
            point.applyMatrix4(mesh.bindMatrixInverse);
          }
          point.applyMatrix4(mesh.matrixWorld);
          radius = Math.max(radius, Math.hypot(point.x, point.z));
          if (!mesh.name.includes("_FX_")) minY = Math.min(minY, point.y);
        }
      });
    }
    clips[clip.name] = { radius, minY };
    mixer.stopAllAction();
    mixer.uncacheRoot(gltf.scene);
  }
  result[key] = clips;
}
await writeFile(
  process.argv[2] ?? "/tmp/bv-f2-envelopes.json",
  JSON.stringify(result, null, 2) + "\n",
);
