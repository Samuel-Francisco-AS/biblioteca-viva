import { Box3, Matrix4, Ray, Vector3, type Object3D } from "three";
import { INHABITANTS, INHABITANT_ENVELOPES } from "../inhabitants";

/**
 * R4: interaction geometry is intentionally independent of animated GLB
 * meshes. Only the mathematical volume is tested on a tap; the artist's
 * model, rig, materials, visual position and animations stay untouched.
 *
 * Values are intentionally generous mobile touch targets. Never use these
 * boxes for physics, character navigation, or visible rendering.
 */
export class InhabitantTouchVolumes {
  private readonly inverse = new Matrix4();
  private readonly localRay = new Ray();
  private readonly localHit = new Vector3();
  private readonly worldHit = new Vector3();
  private readonly localBounds = new Box3();
  private readonly volumes = new Map<string, readonly Box3[]>();

  constructor() {
    for (const descriptor of INHABITANTS) {
      const envelope = INHABITANT_ENVELOPES[descriptor.key];
      const width = Math.max(envelope.travel, envelope.work, 0.63) + 0.17;
      const magicWidth = Math.max(envelope.magic, width) + 0.08;
      const centerY = descriptor.height * 0.61;
      this.volumes.set(descriptor.id, [
        new Box3(
          new Vector3(-width, -0.35, -width * 0.76),
          new Vector3(width, descriptor.height + 0.48, width * 0.76),
        ),
        new Box3(
          new Vector3(-magicWidth, centerY - 0.34, -width * 0.65),
          new Vector3(magicWidth, descriptor.height + 0.5, width * 0.65),
        ),
      ]);
    }
  }

  has(id: string | undefined): id is string {
    return !!id && this.volumes.has(id);
  }

  /** Current animated actor root transforms only (no traversal of its rig). */
  intersect(
    root: Object3D,
    id: string,
    worldRay: Ray,
  ): { distance: number; point: Vector3; object: Object3D } | null {
    const volumes = this.volumes.get(id);
    if (
      !volumes ||
      !root.visible ||
      root.userData.loadState === "error" ||
      root.userData.loadState === "loading"
    )
      return null;
    root.updateWorldMatrix(true, false);
    this.inverse.copy(root.matrixWorld).invert();
    this.localRay.copy(worldRay).applyMatrix4(this.inverse);
    let closestDistance = Infinity;
    let closestPoint: Vector3 | null = null;
    for (const box of volumes) {
      const hit = this.localRay.intersectBox(box, this.localHit);
      if (!hit) continue;
      this.worldHit.copy(hit).applyMatrix4(root.matrixWorld);
      const distance = worldRay.origin.distanceTo(this.worldHit);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = this.worldHit.clone();
      }
    }
    return closestPoint
      ? { distance: closestDistance, point: closestPoint, object: root }
      : null;
  }

  /** Conservative, pose-independent local box for the selection decoration. */
  bounds(id: string): Box3 | null {
    const volumes = this.volumes.get(id);
    if (!volumes) return null;
    this.localBounds.makeEmpty();
    for (const volume of volumes) this.localBounds.union(volume);
    return this.localBounds.clone();
  }
}
