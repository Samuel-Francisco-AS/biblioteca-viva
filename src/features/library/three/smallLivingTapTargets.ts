import { Box3, type Object3D, type OrthographicCamera, Vector3 } from "three";
import type { PointerPosition } from "./interactionMath";

// In CSS pixels, not world units: independent of zoom and canvas resolution.
export const SMALL_LIVING_TAP_RADIUS_PX = 28;
const SMALL_LIVING_IDS = ["living:table", "living:book"] as const;

type ViewportBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

/** Supplement small props only when actual raycasting has missed everything. */
export function findExpandedLivingTap(
  roots: ReadonlyMap<string, Object3D>,
  camera: OrthographicCamera,
  bounds: ViewportBounds,
  pointer: PointerPosition,
): string | undefined {
  if (bounds.width <= 0 || bounds.height <= 0) return undefined;
  const maxDistanceSquared =
    SMALL_LIVING_TAP_RADIUS_PX * SMALL_LIVING_TAP_RADIUS_PX;
  let nearestDistanceSquared = maxDistanceSquared;
  let nearestId: string | undefined;
  for (const id of SMALL_LIVING_IDS) {
    const root = roots.get(id);
    if (!root || !root.visible) continue;
    const box = new Box3().setFromObject(root);
    if (box.isEmpty()) continue;
    const projected = box.getCenter(new Vector3()).project(camera);
    if (
      projected.x < -1 ||
      projected.x > 1 ||
      projected.y < -1 ||
      projected.y > 1 ||
      projected.z < -1 ||
      projected.z > 1
    ) {
      continue;
    }
    const screenX = bounds.left + ((projected.x + 1) * bounds.width) / 2;
    const screenY = bounds.top + ((1 - projected.y) * bounds.height) / 2;
    const dx = pointer.x - screenX;
    const dy = pointer.y - screenY;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      nearestId = id;
    }
  }
  return nearestId;
}
