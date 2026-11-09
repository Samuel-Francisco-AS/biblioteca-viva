import {
  Box3,
  InstancedMesh,
  Line,
  Matrix4,
  Mesh,
  Object3D,
  Points,
  SkinnedMesh,
  Sphere,
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
  private readonly center = new Vector3();
  private readonly sphere = new Sphere();

  /** Compute static bounds once when registering, never in a tap callback. */
  register(root: Object3D, id: string): void {
    this.cached.delete(root);
    if (id.startsWith("character:")) return;
    // Animated child transforms (living props and orbiting grimoire) are not
    // frozen into a static box; they keep the exact fallback until supported
    // by a dedicated conservative authored envelope.
    if (id.startsWith("living:") || id === "portal:duelo-arcano") return;
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
      const size = bounds.getSize(this.center);
      const expansion = Math.max(0.3, Math.max(size.x, size.y, size.z) * 0.3);
      bounds.expandByScalar(expansion);
    }
    this.cached.set(root, {
      bounds: hasGeometry && !hasUnknownRaycast ? bounds : null,
      childCount: root.children.length,
    });
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
      // Rigs, wings, props and full action clips are contained by a generous
      // envelope around the authored character origin. Agent translation is
      // applied every touch, but no skinned vertex is evaluated for misses.
      const radial = Math.max(limits.magic, limits.work, limits.travel);
      const radius =
        Math.hypot(radial * 2 + 1, actor.height * 1.5 + 1) *
        root.matrixWorld.getMaxScaleOnAxis();
      this.center.set(0, actor.height * 0.6, 0).applyMatrix4(root.matrixWorld);
      this.sphere.set(this.center, radius);
      return ray.intersectsSphere(this.sphere);
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
