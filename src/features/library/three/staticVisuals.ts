import {
  BufferGeometry,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  type Object3D,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function isStaticMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, Material> {
  return (
    object instanceof Mesh &&
    object.geometry instanceof BufferGeometry &&
    object.material instanceof Material
  );
}

/** Bake a wholly static asset subtree BEFORE dynamic children are attached. One disposable owner,
 * exact triangles/UVs/normals, same materials and collider on the unchanged root.
 * Never called on a character, articulated root, furnishing or selectable wrapper. */
export function batchStaticVisual(root: Group, owner: Object3D = root): void {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map<Material, BufferGeometry[]>();
  const originals = new Set<BufferGeometry>();
  root.traverse((object) => {
    if (!isStaticMesh(object)) return;
    const geometry = object.geometry.clone();
    // Preserve vertex sharing. Extruded pieces have no index; add an identity
    // index so mergeGeometries can concatenate them with the indexed solids.
    if (!geometry.index)
      geometry.setIndex(
        Array.from({ length: geometry.attributes.position.count }, (_, i) => i),
      );
    geometry.applyMatrix4(inverse.clone().multiply(object.matrixWorld));
    const pieces = groups.get(object.material) ?? [];
    pieces.push(geometry);
    groups.set(object.material, pieces);
    originals.add(object.geometry);
  });
  const batches: Mesh[] = [];
  try {
    for (const [material, pieces] of groups) {
      const geometry = mergeGeometries(pieces);
      if (!geometry) throw new Error("Geometria estática incompatível.");
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const mesh = new Mesh(geometry, material);
      mesh.name = "static-material-batch";
      freezeLocalTransform(mesh);
      batches.push(mesh);
    }
  } catch (error) {
    for (const batch of batches) batch.geometry.dispose();
    throw error;
  } finally {
    for (const pieces of groups.values())
      for (const piece of pieces) piece.dispose();
  }
  root.clear();
  root.add(...batches);
  const retained = new Set<BufferGeometry>();
  owner.traverse((object) => {
    if (isStaticMesh(object)) retained.add(object.geometry);
  });
  for (const geometry of originals)
    if (!retained.has(geometry)) geometry.dispose();
}

/** Only the local transform is fixed. World matrices still follow parent changes. */
export function freezeLocalTransform(object: Object3D): void {
  object.updateMatrix();
  object.matrixAutoUpdate = false;
}

export const batchStaticBookshelf = batchStaticVisual;

/** Book binding pieces repeat the same two geometries under two independently
 * moving owners. Instance those pieces instead of baking duplicate vertices. */
export function batchBookBinding(root: Group): void {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map<
    BufferGeometry,
    Map<Material, Mesh<BufferGeometry, Material>[]>
  >();
  root.traverse((object) => {
    if (!isStaticMesh(object)) return;
    const materials =
      groups.get(object.geometry) ??
      new Map<Material, Mesh<BufferGeometry, Material>[]>();
    const parts = materials.get(object.material) ?? [];
    parts.push(object);
    materials.set(object.material, parts);
    groups.set(object.geometry, materials);
  });
  root.clear();
  for (const [geometry, materials] of groups)
    for (const [material, parts] of materials) {
      const batch = new InstancedMesh(geometry, material, parts.length);
      batch.name = "book-binding-instances";
      if (parts.length === 1) {
        // A single authored component keeps its semantic name and pivot.
        // Moving its transform onto the batch preserves the same matrix product.
        const part = parts[0];
        batch.name = part.name;
        inverse
          .clone()
          .multiply(part.matrixWorld)
          .decompose(batch.position, batch.quaternion, batch.scale);
        batch.setMatrixAt(0, new Matrix4());
      } else
        parts.forEach((part, i) =>
          batch.setMatrixAt(i, inverse.clone().multiply(part.matrixWorld)),
        );
      batch.computeBoundingBox();
      batch.computeBoundingSphere();
      freezeLocalTransform(batch);
      root.add(batch);
    }
}
