import {
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  type Object3D,
} from "three";
import type { NavigationObstacle } from "../inhabitantNavigation";

/** Carried props are governed by leases/anchors, never a permanent collider at their old pose. */
export function isCarriedProp(object: Object3D): boolean {
  for (let parent: Object3D | null = object; parent; parent = parent.parent)
    if (parent.userData.carriedObject === true) return true;
  return false;
}

/** Per-instance bounds, never the giant AABB of a whole architectural batch.
 * Includes walls, props, shelves and present records; never reads entry content. */
export function collectInhabitantObstacles(
  roots: readonly Object3D[],
): readonly NavigationObstacle[] {
  const result: NavigationObstacle[] = [];
  for (const root of roots) {
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (
        isCarriedProp(o) ||
        !(o instanceof Mesh) ||
        !(o.geometry instanceof BufferGeometry)
      )
        return;
      o.geometry.computeBoundingBox();
      const local = o.geometry.boundingBox;
      if (!local) return;
      const add = (matrix: Matrix4, index: number) => {
        const b = local.clone().applyMatrix4(matrix);
        if (b.max.y <= 0.15 || b.min.y > 2.1) return;
        // Reserve the authorized moving envelope, not just the closed snapshot.
        let cabinet = false;
        for (let parent = o.parent; parent; parent = parent.parent)
          if (parent.name === "living:cabinet") cabinet = true;
        const leaf = o.name.startsWith("living-leaf-") ? 0.12 : 0;
        result.push({
          id: `obstacle:${result.length}:${index}`,
          minX: b.min.x - leaf,
          maxX: b.max.x + leaf,
          minZ: b.min.z - leaf,
          maxZ: b.max.z + leaf + (cabinet ? 0.42 : 0),
        });
      };
      if (o instanceof InstancedMesh)
        for (let i = 0; i < o.count; i++) {
          const m = new Matrix4();
          o.getMatrixAt(i, m);
          add(m.premultiply(o.matrixWorld), i);
        }
      else add(o.matrixWorld, 0);
    });
  }
  return result;
}
