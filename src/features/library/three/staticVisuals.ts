import { BufferGeometry, Group, Material, Mesh, type Object3D } from "three";
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

/** Bake a wholly static bookshelf BEFORE books are attached. One disposable owner,
 * exact triangles/UVs/normals, same materials and collider on the unchanged root.
 * Never called on a character, articulated book, furnishing or selectable wrapper. */
export function batchStaticBookshelf(root: Group): void {
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
      mesh.name = "bookshelf-static-material";
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
  for (const geometry of originals) geometry.dispose();
}

/** Only the local transform is fixed. World matrices still follow parent changes. */
export function freezeLocalTransform(object: Object3D): void {
  object.updateMatrix();
  object.matrixAutoUpdate = false;
}
