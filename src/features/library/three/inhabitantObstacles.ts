import {
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  type Object3D,
} from "three";
import { getSpatialComponents, navigationBoxes } from "./spatialComponents";
import type { NavigationObstacle } from "../inhabitantNavigation";

/** Carried props are governed by leases/anchors, never a permanent collider at their old pose. */
export function isCarriedProp(object: Object3D): boolean {
  for (let parent: Object3D | null = object; parent; parent = parent.parent)
    if (parent.userData.carriedObject === true) return true;
  return false;
}

/** Authored components first. Mesh fallback is restricted to unconverted/technical roots. */
export function collectInhabitantObstacles(
  roots: readonly Object3D[],
): readonly NavigationObstacle[] {
  const result: NavigationObstacle[] = [];
  const visited = new Set<Object3D>();
  for (const root of roots) {
    if (visited.has(root)) continue;
    root.updateMatrixWorld(true);
    const visit = (o: Object3D, authored = false) => {
      if (visited.has(o)) return;
      visited.add(o);
      if (isCarriedProp(o)) return;
      const spatial = getSpatialComponents(o);
      if (spatial) result.push(...navigationBoxes(o, spatial.navigation));
      for (const child of o.children) visit(child, authored || !!spatial);
      if (authored || spatial) return;
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
    };
    visit(root);
  }
  return result;
}
