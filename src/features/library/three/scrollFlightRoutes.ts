import { isCarriedProp } from "./inhabitantObstacles";
import {
  Box3,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  Ray,
  Vector3,
  type Object3D,
} from "three";
import {
  LIBRARY_FURNISHING,
  furnitureScrollSupports,
  furnitureWorldPoint,
} from "./libraryFurnishingLayout";
export const SCROLL_SURFACES = LIBRARY_FURNISHING.flatMap((p) =>
  furnitureScrollSupports(p).map((point, i) => ({
    ...furnitureWorldPoint(p, point),
    id: `${p.id}:${i}`,
    furnitureId: p.id,
    roomId: p.roomId,
  })),
);
export type ScrollSurface = (typeof SCROLL_SURFACES)[number];
export function flightObstacles(root: Object3D): readonly Box3[] {
  const boxes: Box3[] = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (
      isCarriedProp(o) ||
      !(o instanceof Mesh) ||
      !(o.geometry instanceof BufferGeometry)
    )
      return;
    o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox;
    if (!b) return;
    const add = (m: Matrix4) =>
      boxes.push(
        b
          .clone()
          .applyMatrix4(m)
          .expandByVector(new Vector3(0.2, 0.015, 0.2)),
      );
    if (o instanceof InstancedMesh)
      for (let i = 0; i < o.count; i++) {
        const m = new Matrix4();
        o.getMatrixAt(i, m);
        add(m.premultiply(o.matrixWorld));
      }
    else add(o.matrixWorld);
  });
  return boxes;
}
export function clearFlight(
  points: readonly Vector3[],
  boxes: readonly Box3[],
): boolean {
  return points.slice(1).every((b, i) => {
    const a = points[i];
    const direction = b.clone().sub(a);
    const length = direction.length();
    const ray = new Ray(a, direction.normalize());
    return boxes.every((box) => {
      if (box.containsPoint(a) || box.containsPoint(b)) return false;
      const hit = ray.intersectBox(box, new Vector3());
      return !hit || hit.distanceTo(a) > length;
    });
  });
}
export function planScrollFlight(
  from: ScrollSurface,
  to: ScrollSurface,
  boxes: readonly Box3[],
): readonly Vector3[] | null {
  if (from.roomId !== to.roomId || from.furnitureId === to.furnitureId)
    return null;
  const points = [
    new Vector3(from.x, from.y, from.z),
    new Vector3(from.x, 2.8, from.z),
    new Vector3(to.x, 2.8, to.z),
    new Vector3(to.x, to.y, to.z),
  ];
  return clearFlight(points, boxes) ? points : null;
}
export function sampleScrollFlight(
  points: readonly Vector3[],
  progress: number,
): Vector3 {
  const t = Math.min(1, Math.max(0, progress)) * 3;
  const i = Math.min(2, Math.floor(t));
  const u = t - i;
  const eased = u * u * (3 - 2 * u);
  return points[i].clone().lerp(points[i + 1], eased);
}
