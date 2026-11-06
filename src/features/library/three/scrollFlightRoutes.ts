import { getSpatialComponents } from "./spatialComponents";
import { isCarriedProp } from "./inhabitantObstacles";
import {
  Box3,
  BufferGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  Ray,
  Vector3,
  TorusGeometry,
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
export function flightObstacles(
  root: Object3D,
  clearance = new Vector3(0.2, 0.015, 0.2),
  exclude: (object: Object3D) => boolean = () => false,
  hollowRings = false,
): readonly Box3[] {
  const boxes: Box3[] = [];
  root.updateMatrixWorld(true);
  const visit = (o: Object3D, authored = false) => {
    if (exclude(o) || isCarriedProp(o)) return;
    const spatial = getSpatialComponents(o);
    if (spatial)
      for (const local of spatial.physical)
        boxes.push(
          local.clone().applyMatrix4(o.matrixWorld).expandByVector(clearance),
        );
    for (const child of o.children) visit(child, authored || !!spatial);
    if (authored || spatial) return;
    if (
      exclude(o) ||
      isCarriedProp(o) ||
      !(o instanceof Mesh) ||
      !(o.geometry instanceof BufferGeometry)
    )
      return;
    o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox;
    if (!b) return;
    const pieces = [b];
    if (hollowRings && o.geometry instanceof TorusGeometry) {
      pieces.length = 0;
      const { radius, tube } = o.geometry.parameters;
      // Sixty-four conservative arc envelopes preserve the real central opening.
      for (let i = 0; i < 64; i++) {
        const a = (i * Math.PI) / 32,
          c = ((i + 1) * Math.PI) / 32;
        pieces.push(
          new Box3()
            .setFromPoints([
              new Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0),
              new Vector3(Math.cos(c) * radius, Math.sin(c) * radius, 0),
            ])
            .expandByScalar(tube),
        );
      }
    }
    const add = (m: Matrix4) => {
      for (const piece of pieces)
        boxes.push(piece.clone().applyMatrix4(m).expandByVector(clearance));
    };
    if (o instanceof InstancedMesh)
      for (let i = 0; i < o.count; i++) {
        const m = new Matrix4();
        o.getMatrixAt(i, m);
        add(m.premultiply(o.matrixWorld));
      }
    else add(o.matrixWorld);
  };
  visit(root);
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
    if (length < 1e-9) return boxes.every((box) => !box.containsPoint(a));
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
