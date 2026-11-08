import {
  Matrix4,
  Mesh,
  SkinnedMesh,
  Vector4,
  type Object3D,
  type Skeleton,
  type Vector3,
} from "three";

/** Exact CPU skinning for one synchronous bounds/raycast query. Three r185's
 * getVertexPosition recomputes world × inverseBind for every influence of every
 * vertex. Prepare those double-precision products once per skeleton/query.
 * No cross-frame cache, approximation, bone/clip mutation or GPU palette change.
 * Morph positions still use Mesh.getVertexPosition. Restore methods even on error.
 */
function isSkin(node: Object3D): node is SkinnedMesh {
  return node instanceof SkinnedMesh;
}
export function withPreparedSkinning<T>(
  roots: readonly Object3D[],
  read: () => T,
  reuseVertices = false,
): T {
  const palettes = new Map<Skeleton, readonly Matrix4[]>();
  const meshes = new Set<SkinnedMesh>();
  const restore: (() => void)[] = [];
  for (const root of roots)
    root.traverse((node) => {
      if (isSkin(node)) meshes.add(node);
    });
  try {
    for (const mesh of meshes) {
      // Respect custom readers and nested prepared queries.
      if (mesh.getVertexPosition !== SkinnedMesh.prototype.getVertexPosition)
        continue;
      const skinIndex = mesh.geometry.getAttribute("skinIndex");
      const skinWeight = mesh.geometry.getAttribute("skinWeight");
      if (!skinIndex || !skinWeight) continue; // Native reader retains its validation/failure behavior.
      let matrices = palettes.get(mesh.skeleton);
      if (!matrices) {
        matrices = mesh.skeleton.bones.map((bone, index) =>
          new Matrix4().multiplyMatrices(
            bone.matrixWorld,
            mesh.skeleton.boneInverses[index],
          ),
        );
        palettes.set(mesh.skeleton, matrices);
      }
      const prepared = matrices;
      // Tap reads the same pose for boxes, spheres and triangle intersections.
      // Float64 preserves the exact CPU result. Frame highlight scans once and
      // leaves this disabled, avoiding per-frame vertex-buffer allocation.
      const positions = reuseVertices
        ? new Float64Array(mesh.geometry.getAttribute("position").count * 3)
        : null;
      const populated = positions ? new Uint8Array(positions.length / 3) : null;
      const baseReader = Mesh.prototype.getVertexPosition.bind(mesh);
      const indices = new Vector4(),
        weights = new Vector4(),
        base = new Vector4(),
        influence = new Vector4();
      const descriptor = Object.getOwnPropertyDescriptor(
        mesh,
        "getVertexPosition",
      );
      Object.defineProperty(mesh, "getVertexPosition", {
        configurable: true,
        writable: true,
        value: (index: number, target: Vector3) => {
          if (positions && populated?.[index])
            return target.fromArray(positions, index * 3);
          baseReader(index, target);
          indices.set(
            skinIndex.getX(index),
            skinIndex.getY(index),
            skinIndex.getZ(index),
            skinIndex.getW(index),
          );
          weights.set(
            skinWeight.getX(index),
            skinWeight.getY(index),
            skinWeight.getZ(index),
            skinWeight.getW(index),
          );
          base
            .set(target.x, target.y, target.z, 1)
            .applyMatrix4(mesh.bindMatrix);
          target.set(0, 0, 0);
          for (let i = 0; i < 4; i++) {
            const weight = weights.getComponent(i);
            if (weight !== 0)
              target.addScaledVector(
                influence
                  .copy(base)
                  .applyMatrix4(prepared[indices.getComponent(i)]),
                weight,
              );
          }
          target.applyMatrix4(mesh.bindMatrixInverse);
          if (positions && populated) {
            target.toArray(positions, index * 3);
            populated[index] = 1;
          }
          return target;
        },
      });
      restore.push(() => {
        if (descriptor)
          Object.defineProperty(mesh, "getVertexPosition", descriptor);
        else Reflect.deleteProperty(mesh, "getVertexPosition");
      });
    }
    return read();
  } finally {
    for (const reset of restore.reverse()) reset();
  }
}
