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
  // The little living book and table may move/animate, but their bodies stay
  // within this generous world-space envelope of the selectable root origin.
  // The projection check prevents exact Box3 hierarchy traversals for clicks
  // on genuinely empty floor; it is NOT used to decide a positive hit.
  const worldHeight = (camera.top - camera.bottom) / camera.zoom;
  const worldWidth = (camera.right - camera.left) / camera.zoom;
  const pixelsPerWorld = Math.max(
    bounds.width / Math.max(0.001, worldWidth),
    bounds.height / Math.max(0.001, worldHeight),
  );
  const safeScreenDistance = SMALL_LIVING_TAP_RADIUS_PX + 3 * pixelsPerWorld;
  const safeDistanceSquared = safeScreenDistance * safeScreenDistance;
  const origin = new Vector3();
  for (const id of SMALL_LIVING_IDS) {
    const root = roots.get(id);
    if (!root || !root.visible) continue;
    const projectedOrigin = root.getWorldPosition(origin).project(camera);
    const originScreenX =
      bounds.left + ((projectedOrigin.x + 1) * bounds.width) / 2;
    const originScreenY =
      bounds.top + ((1 - projectedOrigin.y) * bounds.height) / 2;
    if (
      (pointer.x - originScreenX) ** 2 + (pointer.y - originScreenY) ** 2 >
      safeDistanceSquared
    )
      continue;
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
