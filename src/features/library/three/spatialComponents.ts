import { Box3, Vector3, type Object3D } from "three";
import type { NavigationObstacle } from "../inhabitantNavigation";

export interface SpatialAnchor {
  readonly id: string;
  readonly position: readonly [number, number, number];
}
/** Local metres, independently authored; visual topology never defines navigation. */
export interface SpatialComponents {
  readonly physical: readonly Box3[];
  readonly navigation: readonly Box3[];
  readonly mobility: "static" | "dynamic";
  readonly picking?: readonly Box3[];
  readonly manipulation?: readonly SpatialAnchor[];
  readonly supports?: readonly SpatialAnchor[];
  readonly approaches?: readonly SpatialAnchor[];
}
const components = new WeakMap<Object3D, SpatialComponents>();
export function setSpatialComponents(
  object: Object3D,
  value: SpatialComponents,
) {
  components.set(object, value);
}
export function getSpatialComponents(object: Object3D) {
  return components.get(object);
}
export function spatialBox(
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
): Box3 {
  return new Box3(
    new Vector3(x - width / 2, y - height / 2, z - depth / 2),
    new Vector3(x + width / 2, y + height / 2, z + depth / 2),
  );
}
export function navigationBoxes(
  object: Object3D,
  boxes: readonly Box3[],
): NavigationObstacle[] {
  return boxes.flatMap((local, index) => {
    const box = local.clone().applyMatrix4(object.matrixWorld);
    if (box.max.y <= 0.15 || box.min.y > 2.1) return [];
    return [
      {
        id: `spatial:${object.id}:${index}`,
        minX: box.min.x,
        maxX: box.max.x,
        minZ: box.min.z,
        maxZ: box.max.z,
      },
    ];
  });
}
