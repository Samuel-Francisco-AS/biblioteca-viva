import {
  Box3,
  Matrix4,
  Quaternion,
  Raycaster,
  Vector3,
  type Object3D,
} from "three";
import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import type { AgentView } from "../inhabitantAgency";
import { InhabitantNavigation } from "../inhabitantNavigation";
import { INHABITANTS, INHABITANT_ENVELOPES } from "../inhabitants";
import type { InteractionCoordinator } from "../inhabitantInteractions";
import type { ReadingAreaBookVisual } from "./readingAreaBookVisuals";
import {
  LIBRARY_FURNISHING,
  FURNITURE_DIMENSIONS,
  furnitureWorldPoint,
} from "./libraryFurnishingLayout";
import { clearFlight, flightObstacles } from "./scrollFlightRoutes";

const stage = LIBRARY_FURNISHING.find((p) => p.id === "bf4-prop:2")!;
export const SESSION_READING_SUPPORT = furnitureWorldPoint(stage, {
  x: 0,
  y: FURNITURE_DIMENSIONS.lounge.top,
  z: -0.3,
});
export const SESSION_READING_RESOURCE = `surface:${stage.id}`;
interface Pose {
  position: Vector3;
  rotation: Quaternion;
}
interface Journey {
  visual: ReadingAreaBookVisual;
  task: string;
  points: readonly Pose[];
  progress: number;
  opening: number;
  half: Vector3;
  homePosition: Vector3;
  homeRotation: Quaternion;
  obstacles: readonly Box3[];
  recovering: boolean;
}
function belongsTo(object: Object3D, root: Object3D): boolean {
  for (let p: Object3D | null = object; p; p = p.parent)
    if (p === root) return true;
  return false;
}
function sample(points: readonly Pose[], progress: number): Pose {
  const i = Math.min(points.length - 2, Math.floor(progress));
  const t = Math.max(0, Math.min(1, progress - i));
  const u = t * t * (3 - 2 * t);
  return {
    position: points[i].position.clone().lerp(points[i + 1].position, u),
    rotation: points[i].rotation.clone().slerp(points[i + 1].rotation, u),
  };
}
function halfAt(half: Vector3, rotation: Quaternion) {
  return new Box3(half.clone().negate(), half.clone())
    .applyMatrix4(new Matrix4().makeRotationFromQuaternion(rotation))
    .getSize(new Vector3())
    .multiplyScalar(0.5);
}
/** Swept envelope, including all intermediate orientations; no point-only collision test. */
export function clearBookSegment(
  a: Pose,
  b: Pose,
  half: Vector3,
  obstacles: readonly Box3[],
): boolean {
  const extent =
    a.rotation.angleTo(b.rotation) < 1e-6
      ? halfAt(half, a.rotation)
      : new Vector3().setScalar(half.length());
  return clearFlight(
    [a.position, b.position],
    obstacles.map((box) => box.clone().expandByVector(extent)),
  );
}

/** Sole transform authority for the original selectable wrapper. No timers, clones or persistence. */
export function createSessionBookVisuals(options: {
  books: () => ReadonlyMap<string, ReadingAreaBookVisual>;
  obstacleRoots: readonly Object3D[];
  interactions: InteractionCoordinator;
  now: () => number;
  canDepart?: () => boolean;
  occupiedSurfaces?: () => readonly string[];
}) {
  let confirmed: WorldSessionActivity | null = null;
  let journey: Journey | null = null;
  let disposed = false;
  let retryAfter = 0;
  const ended = new Set<string>();
  const lightMaterials = (visual: ReadingAreaBookVisual, strength: number) => {
    visual.representation.setSessionGlow(strength);
  };
  function release() {
    if (!journey) return;
    const j = journey;
    j.visual.node.position.copy(j.homePosition);
    j.visual.node.quaternion.copy(j.homeRotation);
    j.visual.representation.animation.setOpening(0);
    j.visual.sessionControlled = false;
    lightMaterials(j.visual, 0);
    options.interactions.release(j.visual.book.instanceId, "session", j.task);
    options.interactions.release(SESSION_READING_RESOURCE, "session", j.task);
    journey = null;
  }
  function start(): void {
    if (options.canDepart?.() === false) return;
    if (
      !confirmed ||
      confirmed.status !== "active" ||
      confirmed.kind !== "reading"
    )
      return;
    const id = `reading-book:${confirmed.entryId}`;
    if (confirmed.instanceId !== id) return;
    const visual = options.books().get(id);
    if (!visual || options.occupiedSurfaces?.().includes(stage.id)) return;
    const dimensions = visual.representation.dimensions;
    const half = new Vector3(
      dimensions.width / 2,
      dimensions.height / 2,
      dimensions.depth / 2,
    );
    visual.node.updateWorldMatrix(true, true);
    const homeRotation = visual.node.getWorldQuaternion(new Quaternion());
    const home = visual.node.localToWorld(new Vector3(0, half.y, 0));
    const out = visual.node.localToWorld(new Vector3(0, half.y, 0.75));
    const high = new Vector3(out.x, Math.max(2.8, out.y), out.z);
    const flat = new Quaternion().setFromAxisAngle(
      new Vector3(0, 0, 1),
      -Math.PI / 2,
    );
    const support = SESSION_READING_SUPPORT;
    // Offset compensates the cover's expansion behind the spine.
    const landing = new Vector3(
      support.x,
      support.y + half.x + 0.006,
      support.z - 0.14,
    );
    const obstacles = options.obstacleRoots.flatMap((root) =>
      flightObstacles(
        root,
        new Vector3(0.001, 0.001, 0.001),
        (o) => {
          if (belongsTo(o, visual.node)) return true;
          for (let p: Object3D | null = o; p; p = p.parent)
            if (
              p.name === "bf55f-confirmed-session-aura" ||
              p.name === "ambient-magic"
            )
              return true;
          return false;
        },
        true,
      ),
    );
    // Use the existing room/passage graph at flight height. Cutaway walls do
    // not authorize diagonals through the exterior gaps between rooms.
    const airNavigation = new InhabitantNavigation(
      obstacles
        .filter((b) => b.max.y >= high.y - half.x && b.min.y <= high.y + half.x)
        .map((b, i) => ({
          id: `air:${i}`,
          minX: b.min.x,
          maxX: b.max.x,
          minZ: b.min.z,
          maxZ: b.max.z,
        })),
    );
    const route = airNavigation.route(
      high,
      landing,
      Math.max(half.y, half.z) + 0.01,
    );
    if (!route) return;
    const points = [
      { position: home, rotation: homeRotation },
      { position: out, rotation: homeRotation },
      { position: high, rotation: homeRotation },
      { position: high.clone(), rotation: flat },
      ...route.map((p) => ({
        position: new Vector3(p.x, high.y, p.z),
        rotation: flat,
      })),
      { position: landing, rotation: flat },
    ];
    if (
      !points
        .slice(1)
        .every((p, i) => clearBookSegment(points[i], p, half, obstacles))
    )
      return;
    // A real tabletop must support all four corners, not merely a named anchor.
    for (const dx of [-half.y, half.y])
      for (const dz of [-half.z, half.z]) {
        const ray = new Raycaster(
          new Vector3(landing.x + dx, support.y + 0.025, landing.z + dz),
          new Vector3(0, -1, 0),
          0,
          0.04,
        );
        if (
          !options.obstacleRoots.some(
            (root) => ray.intersectObject(root, true).length > 0,
          )
        )
          return;
      }
    const task = `session:${confirmed.sessionId}`;
    if (
      !options.interactions.reserve(
        SESSION_READING_RESOURCE,
        "session",
        task,
        options.now(),
      )
    )
      return;
    if (!options.interactions.reserve(id, "session", task, options.now())) {
      options.interactions.release(SESSION_READING_RESOURCE, "session", task);
      return;
    }
    journey = {
      visual,
      task,
      points,
      half,
      progress: 0,
      opening: 0,
      homePosition: visual.node.position.clone(),
      homeRotation: visual.node.quaternion.clone(),
      obstacles,
      recovering: false,
    };
    visual.sessionControlled = true;
  }
  function write(j: Journey, pose: Pose) {
    const parent = j.visual.node.parent;
    if (!parent) return;
    const base = pose.position
      .clone()
      .sub(new Vector3(0, j.half.y, 0).applyQuaternion(pose.rotation));
    j.visual.node.position.copy(parent.worldToLocal(base));
    j.visual.node.quaternion.copy(
      parent
        .getWorldQuaternion(new Quaternion())
        .invert()
        .multiply(pose.rotation),
    );
    j.visual.node.updateWorldMatrix(true, true);
  }
  return {
    // Representation replacement is an explicit recovery boundary, like remount.
    // Release before the reconciler reassigns or disposes any shelf slots.
    releaseForLayoutChange: release,
    apply(activity: WorldSessionActivity | null) {
      if (disposed) return;
      if (
        activity &&
        (ended.has(activity.sessionId) ||
          (confirmed?.sessionId === activity.sessionId &&
            activity.revision < confirmed.revision))
      )
        return;
      if (confirmed && confirmed.sessionId !== activity?.sessionId)
        ended.add(confirmed.sessionId);
      confirmed = activity;
      retryAfter = 0;
    },
    candidate() {
      if (
        !journey ||
        journey.recovering ||
        !confirmed ||
        confirmed.status !== "active" ||
        journey.task !== `session:${confirmed.sessionId}` ||
        journey.progress < journey.points.length - 1
      )
        return null;
      return {
        id: journey.visual.book.instanceId,
        sessionId: confirmed.sessionId,
        source: SESSION_READING_SUPPORT,
      };
    },
    navigationObstacles() {
      if (!journey) return [];
      const box = new Box3().setFromObject(journey.visual.node);
      if (box.min.y > 2.1) return [];
      return [
        {
          id: "session-book-envelope",
          minX: box.min.x - 0.02,
          maxX: box.max.x + 0.02,
          minZ: box.min.z - 0.02,
          maxZ: box.max.z + 0.02,
        },
      ];
    },
    snapshot() {
      return {
        sessionId: confirmed?.sessionId ?? null,
        instanceId: journey?.visual.book.instanceId ?? null,
        progress: journey?.progress ?? 0,
        opening: journey?.opening ?? 0,
        state: !journey
          ? "shelf"
          : journey.progress === journey.points.length - 1
            ? "resting"
            : "transport",
      };
    },
    update(delta: number, reduced: boolean, poses: readonly AgentView[] = []) {
      if (disposed) return;
      if (!journey && !reduced && options.now() >= retryAfter) {
        retryAfter = options.now() + 2000;
        start();
      }
      const j = journey;
      if (!j) return;
      const dt = Math.min(0.05, Math.max(0, delta));
      // The same coordinator clock as the agency; background time does not expire a physical owner.
      const bookLease = options.interactions.reserve(
        j.visual.book.instanceId,
        "session",
        j.task,
        options.now(),
      );
      const surfaceLease = options.interactions.reserve(
        SESSION_READING_RESOURCE,
        "session",
        j.task,
        options.now(),
      );
      if (!bookLease || !surfaceLease) {
        // Never animate without both authorities. Keep the physical envelope
        // in navigation, withdraw the reader and wait for a safe return.
        j.recovering = true;
        return;
      }
      const returning =
        j.recovering ||
        reduced ||
        !confirmed ||
        confirmed.kind !== "reading" ||
        j.task !== `session:${confirmed.sessionId}`;
      const active = !returning && confirmed?.status === "active";
      const end = j.points.length - 1;
      const desiredOpening = active && j.progress === end ? 1 : 0;
      const nextOpening =
        j.opening +
        Math.sign(desiredOpening - j.opening) *
          Math.min(Math.abs(desiredOpening - j.opening), dt * 0.65);
      // Opening is real cover articulation on the original volume, not skeletal page animation.
      j.visual.representation.animation.setOpening(nextOpening);
      j.visual.node.updateWorldMatrix(true, true);
      const coverBox = j.visual.representation.animation.worldBounds();
      if (
        nextOpening <= j.opening ||
        !j.obstacles.some((b) => b.intersectsBox(coverBox))
      )
        j.opening = nextOpening;
      j.visual.representation.animation.setOpening(j.opening);
      const direction = returning ? -1 : 1; // A pause finishes the safe landing, then rests closed.
      if (
        (!returning || j.opening === 0) &&
        !(j.progress === end && !returning)
      ) {
        const i = Math.min(end - 1, Math.floor(j.progress));
        const length = j.points[i].position.distanceTo(
          j.points[i + 1].position,
        );
        const next = Math.max(
          0,
          Math.min(
            end,
            j.progress + (direction * dt) / Math.max(1.2, length / 1.15),
          ),
        );
        const a = sample(j.points, j.progress),
          b = sample(j.points, next);
        const occupants = poses
          .filter((p) => p.available)
          .map((p) => {
            const radius = Math.max(
              INHABITANT_ENVELOPES[p.key].travel,
              INHABITANT_ENVELOPES[p.key].work,
            );
            const height = INHABITANTS.find((i) => i.key === p.key)!.height;
            return new Box3(
              new Vector3(p.x - radius, 0, p.z - radius),
              new Vector3(p.x + radius, height + 0.1, p.z + radius),
            );
          });
        if (clearBookSegment(a, b, j.half, occupants)) {
          j.progress = next;
          write(j, b);
        }
      }
      lightMaterials(j.visual, active ? 0.12 + j.opening * 0.16 : 0.025);
      if (returning && j.progress === 0 && j.opening === 0) release();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      confirmed = null;
      release();
    },
  };
}
