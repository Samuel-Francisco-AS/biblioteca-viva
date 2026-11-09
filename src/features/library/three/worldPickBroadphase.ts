import {
  Box3,
  InstancedMesh,
  Line,
  Matrix4,
  Mesh,
  Object3D,
  Points,
  SkinnedMesh,
  Vector3,
  type Ray,
} from "three";
import { INHABITANTS, INHABITANT_ENVELOPES } from "../inhabitants";

/**
 * Conservative rejection stage for Canvas picking.
 *
 * The expensive exact raycast still determines intersections, occlusion and
 * precedence. This stage only rejects roots whose envelope is clearly
 * disjoint from the touch ray. It never CPU-skins an avatar to find a miss.
 */
export class WorldPickBroadphase {
  private readonly cached = new WeakMap<
    Object3D,
    { readonly bounds: Box3 | null; readonly childCount: number }
  >();
  private readonly inverse = new Matrix4();
  private readonly transform = new Matrix4();
  private readonly worldBounds = new Box3();
  private readonly size = new Vector3();
  private readonly actorBounds = new Box3();

  /** Compute static bounds once when registering, never in a tap callback. */
  register(root: Object3D, id: string): void {
    this.cached.delete(root);
    if (id.startsWith("character:")) return;
    // Animated child transforms (living props and orbiting grimoire) are not
    // frozen into a static box; they keep the exact fallback until supported
    // by a dedicated conservative authored envelope.
    if (id.startsWith("living:") || id === "portal:duelo-arcano") return;
    try {
    root.updateWorldMatrix(true, true);
    this.inverse.copy(root.matrixWorld).invert();
    const bounds = new Box3();
    let hasGeometry = false;
    let hasUnknownRaycast = false;
    root.traverse((node) => {
      if (node instanceof SkinnedMesh) {
        hasUnknownRaycast = true;
        return;
      }
      if (
        !(node instanceof Mesh) &&
        !(node instanceof Line) &&
        !(node instanceof Points)
      ) {
        if (node.raycast !== Object3D.prototype.raycast) {
          // Sprites or custom hit-test readers need the precise fallback.
          hasUnknownRaycast = true;
        }
        return;
      }
      const geometry = node.geometry;
      if (!geometry || geometry.morphAttributes?.position?.length) {
        hasUnknownRaycast = true;
        return;
      }
      let box: Box3 | null;
      if (node instanceof InstancedMesh) {
        if (!node.boundingBox) node.computeBoundingBox();
        box = node.boundingBox;
      } else {
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        box = geometry.boundingBox;
      }
      if (!box || box.isEmpty()) {
        hasUnknownRaycast = true;
        return;
      }
      this.transform.multiplyMatrices(this.inverse, node.matrixWorld);
      bounds.union(box.clone().applyMatrix4(this.transform));
      hasGeometry = true;
    });
    if (hasGeometry && !hasUnknownRaycast) {
      const size = bounds.getSize(this.size);
      const expansion = Math.max(0.3, Math.max(size.x, size.y, size.z) * 0.3);
      bounds.expandByScalar(expansion);
    }
    if (
      ![bounds.min.x, bounds.min.y, bounds.min.z,
        bounds.max.x, bounds.max.y, bounds.max.z]
        .every(Number.isFinite)
    ) hasUnknownRaycast = true;
    this.cached.set(root, {
      bounds: hasGeometry && !hasUnknownRaycast ? bounds : null,
      childCount: root.children.length,
    });
    } catch {
      // An optimization must never turn an otherwise valid world into a
      // failed mount. Exotic/custom nodes keep the legacy exact raycast.
      this.cached.set(root, { bounds: null, childCount: root.children.length });
    }
  }

  invalidate(root: Object3D): void {
    this.cached.delete(root);
  }

  mayIntersect(root: Object3D, id: string | undefined, ray: Ray): boolean {
    if (!root.visible) return false;
    root.updateWorldMatrix(true, false);
    const actor = INHABITANTS.find((item) => item.id === id);
    if (actor) {
      const limits = INHABITANT_ENVELOPES[actor.key];
      // These radial limits are measured from the real animated assets.
      // Add a generous touch margin, but use a box rather than an oversized
      // sphere: empty taps near the actors must remain genuinely cheap.
      const radial = Math.max(limits.magic, limits.work, limits.travel) + 0.65;
      this.actorBounds.min.set(-radial, -0.65, -radial);
      this.actorBounds.max.set(radial, actor.height + 1.1, radial);
      return ray.intersectsBox(
        this.worldBounds.copy(this.actorBounds).applyMatrix4(root.matrixWorld),
      );
    }
    const cached = this.cached.get(root);
    // No trusted proxy: keep exact hit testing, never drop an unknown root.
    if (!cached || !cached.bounds || cached.childCount !== root.children.length)
      return true;
    return ray.intersectsBox(
      this.worldBounds.copy(cached.bounds).applyMatrix4(root.matrixWorld),
    );
  }
}
