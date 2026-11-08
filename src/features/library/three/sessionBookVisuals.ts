import {
  Box3,
  Matrix4,
  Quaternion,
  Raycaster,
  Vector3,
  type Object3D,
} from "three";
import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import {
  EMPTY_AGENCY_ENVIRONMENT,
  type ReadingOpportunity,
} from "../inhabitantEnvironment";
import type { AgentView } from "../inhabitantAgency";
import { InhabitantNavigation } from "../inhabitantNavigation";
import {
  INHABITANTS,
  INHABITANT_ENVELOPES,
  INHABITANT_GROUND_CLEARANCE,
  inhabitantActionRadius,
} from "../inhabitants";
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
  opportunity: ReadingOpportunity;
  task: string;
  points: readonly Pose[];
  progress: number;
  opening: number;
  half: Vector3;
  homePosition: Vector3;
  homeRotation: Quaternion;
  obstacles: readonly Box3[];
  carrier: { id: string; parent: Object3D; rotation: Quaternion } | null;
  handPath: Pose[];
  handReturn: number;
  contactOwner: string | undefined;
  lastHandPose: Pose | null;
  physicalOpportunity: ReadingOpportunity | null;
  profileCount: number;
  recovering: boolean;
  glow: number;
  bounds: Box3;
  boundsMatrix: Matrix4;
  boundsOpening: number;
  navigation: readonly import("../inhabitantNavigation").NavigationObstacle[];
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
  const angle = a.rotation.angleTo(b.rotation);
  const aHalf = halfAt(half, a.rotation),
    bHalf = halfAt(half, b.rotation);
  // A rotating corner differs from its endpoint chord by at most r*angle²/8
  // (linear interpolation error bound, ||R''v|| <= r*angle²). This preserves
  // height/rotation correlation when lifting from a supporting surface.
  const sweep = new Box3(
    a.position.clone().sub(aHalf),
    a.position.clone().add(aHalf),
  )
    .union(
      new Box3(b.position.clone().sub(bHalf), b.position.clone().add(bHalf)),
    )
    .expandByScalar((half.length() * angle * angle) / 8);
  const relevant = obstacles.filter((box) => sweep.intersectsBox(box));
  if (relevant.length === 0) return true;
  // Every intermediate corner is also bounded by its nearest endpoint
  // orientation plus 2*r*sin(angle/4), over the complete centre segment.
  const extent = aHalf
    .max(bHalf)
    .addScalar(2 * half.length() * Math.sin(angle / 4));
  return clearFlight(
    [a.position, b.position],
    relevant.map((box) => box.clone().expandByVector(extent)),
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
  onContactBlocked?: (
    a: Pose,
    b: Pose,
    half: Vector3,
    obstacles: readonly Box3[],
  ) => void;
  pickupProfiles?: () => ReadonlyMap<
    string,
    { x: number; y: number; z: number }
  >;
  navigation?: InhabitantNavigation;
}) {
  let confirmed: WorldSessionActivity | null = null;
  let journey: Journey | null = null;
  let disposed = false;
  let retryAfter = 0;
  let currentPoses: readonly AgentView[] = [];
  const ended = new Set<string>();
  const lightMaterials = (visual: ReadingAreaBookVisual, strength: number) => {
    visual.representation.setSessionGlow(strength);
  };
  function release() {
    if (!journey) return;
    const j = journey;
    if (j.carrier) j.carrier.parent.attach(j.visual.node);
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
      support.x + (options.pickupProfiles ? 0.15 : 0),
      support.y + half.x + 0.006,
      support.z - (options.pickupProfiles ? 0 : 0.14),
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
      lastHandPose: null,
      physicalOpportunity: null,
      profileCount: -1,
      carrier: null,
      handPath: [],
      handReturn: -1,
      contactOwner: undefined,
      visual,
      opportunity: Object.freeze({
        id: visual.book.instanceId,
        sessionId: confirmed.sessionId,
        source: SESSION_READING_SUPPORT,
      }),
      task,
      points,
      half,
      progress: 0,
      opening: 0,
      homePosition: visual.node.position.clone(),
      homeRotation: visual.node.quaternion.clone(),
      obstacles,
      recovering: false,
      glow: NaN,
      bounds: new Box3(),
      boundsMatrix: new Matrix4(),
      boundsOpening: NaN,
      navigation: [],
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
  function reconcileCarrier(poses: readonly AgentView[]) {
    const j = journey;
    if (!j?.carrier) return;
    const owner = poses.find((p) => p.id === j.carrier!.id);
    if (
      owner?.physicalSessionId === j.opportunity.sessionId &&
      owner.interactionState !== "interrupted"
    )
      return;
    j.visual.node.updateWorldMatrix(true, true);
    const pose = {
      position: j.visual.node.localToWorld(new Vector3(0, j.half.y, 0)),
      rotation: j.visual.node.getWorldQuaternion(new Quaternion()),
    };
    j.carrier.parent.attach(j.visual.node);
    j.carrier = null;
    j.handPath.push(pose);
    j.handReturn = j.handPath.length - 1;
    j.recovering = true;
    j.lastHandPose = pose;
  }
  return {
    reconcileCarrier,
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
      if (!options.pickupProfiles) return journey.opportunity;
      const profileCount = options.pickupProfiles().size;
      if (
        journey.physicalOpportunity &&
        journey.profileCount === profileCount &&
        journey.physicalOpportunity.physical?.attachedActor ===
          journey.carrier?.id
      )
        return journey.physicalOpportunity;
      const approaches: Partial<
        Record<
          import("../inhabitants").InhabitantKey,
          { position: { x: number; z: number }; facing: number }[]
        >
      > = {};
      const landing = journey.points[journey.points.length - 1];
      const center = landing.position
        .clone()
        .add(
          new Vector3(0, 0, journey.half.z).applyQuaternion(landing.rotation),
        );
      for (const actor of INHABITANTS) {
        const grip = options.pickupProfiles().get(actor.id);
        if (
          !grip ||
          grip.y < landing.position.y - journey.half.x + 0.025 ||
          grip.y > landing.position.y + journey.half.x - 0.025
        )
          continue;
        for (let i = 0; i < 16; i++) {
          const facing = (i * Math.PI) / 8,
            c = Math.cos(facing),
            s = Math.sin(facing);
          const position = {
            x: center.x - grip.x * c - grip.z * s,
            z: center.z + grip.x * s - grip.z * c,
          };
          if (
            options.navigation?.clear(
              position,
              position,
              INHABITANT_ENVELOPES[actor.key].travel,
            )
          ) {
            (approaches[actor.key] ??= []).push({ position, facing });
          }
        }
      }
      journey.profileCount = profileCount;
      journey.physicalOpportunity = Object.freeze({
        ...journey.opportunity,
        physical: Object.freeze({
          approaches: Object.freeze(approaches),
          attachedActor: journey.carrier?.id,
        }),
      });
      return journey.physicalOpportunity;
    },
    navigationObstacles() {
      if (!journey || journey.carrier)
        return EMPTY_AGENCY_ENVIRONMENT.physicalObstacles;
      const j = journey;
      // Opening changes local geometry; parent translation/rotation/scale also
      // invalidates. Layout/representation replacement releases the journey.
      j.visual.node.updateWorldMatrix(true, false, true);
      if (
        j.boundsOpening !== j.opening ||
        !j.boundsMatrix.equals(j.visual.node.matrixWorld)
      ) {
        j.visual.node.updateWorldMatrix(false, true, true);
        j.bounds.setFromObject(j.visual.node);
        j.boundsMatrix.copy(j.visual.node.matrixWorld);
        j.boundsOpening = j.opening;
        const box = j.bounds;
        j.navigation =
          box.min.y > 2.1
            ? []
            : [
                Object.freeze({
                  id: "session-book-envelope",
                  contactOwner: j.contactOwner,
                  minX: box.min.x - 0.02,
                  maxX: box.max.x + 0.02,
                  minZ: box.min.z - 0.02,
                  maxZ: box.max.z + 0.02,
                }),
              ];
      }
      return j.navigation;
    },
    isTransporting() {
      return journey !== null && journey.progress !== journey.points.length - 1;
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
      currentPoses = poses;
      if (!journey && !reduced && options.now() >= retryAfter) {
        retryAfter = options.now() + 2000;
        start();
      }
      const j = journey;
      if (!j) return;
      const dt = Math.min(0.05, Math.max(0, delta));
      // The same coordinator clock as the agency; background time does not expire a physical owner.
      const bookLease = options.interactions.retain(
        j.visual.book.instanceId,
        "session",
        j.task,
        options.now(),
      );
      const surfaceLease = options.interactions.retain(
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
      const reader = poses.find((p) => p.id === j.carrier?.id);
      const pendingReader = poses.some(
        (p) => p.physicalSessionId === j.opportunity.sessionId,
      );
      const desiredOpening =
        active &&
        j.progress === end &&
        (j.carrier ? reader?.interactionState === "reading" : !pendingReader)
          ? 1
          : 0;
      const nextOpening =
        j.opening +
        Math.sign(desiredOpening - j.opening) *
          Math.min(Math.abs(desiredOpening - j.opening), dt * 0.65);
      // Opening is real cover articulation on the original volume, not skeletal page animation.
      if (nextOpening !== j.opening) {
        j.visual.representation.animation.setOpening(nextOpening);
        j.visual.node.updateWorldMatrix(true, true);
        const coverBox = j.visual.representation.animation.worldBounds();
        if (
          nextOpening <= j.opening ||
          !j.obstacles.some((b) => b.intersectsBox(coverBox))
        )
          j.opening = nextOpening;
        else j.visual.representation.animation.setOpening(j.opening);
      }
      if (j.carrier || j.handReturn >= 0) {
        const glow = active ? 0.8 : 0.07;
        if (j.glow !== glow) {
          j.glow = glow;
          lightMaterials(j.visual, glow);
        }
        return;
      }
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
            const radius =
              Math.max(
                INHABITANT_ENVELOPES[p.key].travel,
                inhabitantActionRadius(p.key, p.action),
              ) + 0.04;
            const height = INHABITANTS.find((i) => i.key === p.key)!.height;
            return new Box3(
              new Vector3(p.x - radius, 0, p.z - radius),
              new Vector3(
                p.x + radius,
                Math.max(
                  2.14,
                  height + INHABITANT_GROUND_CLEARANCE[p.key] + 0.1,
                ),
                p.z + radius,
              ),
            );
          });
        if (clearBookSegment(a, b, j.half, occupants)) {
          j.progress = next;
          write(j, b);
        }
      }
      const glow = active ? 0.4 + j.opening * 0.65 : 0.07;
      if (j.glow !== glow) {
        j.glow = glow;
        lightMaterials(j.visual, glow);
      }
      if (returning && j.progress === 0 && j.opening === 0) release();
    },
    checkHandPose(socket: Object3D, pose?: AgentView): boolean {
      const j = journey;
      if (!j?.carrier) return true;
      if (pose?.action === "stand" && j.opening > 0) return false;
      if (
        !options.interactions.owns(
          j.visual.book.instanceId,
          "session",
          j.task,
          options.now(),
        ) ||
        !options.interactions.owns(
          SESSION_READING_RESOURCE,
          "session",
          j.task,
          options.now(),
        )
      )
        return false;
      const node = j.visual.node;
      node.updateWorldMatrix(true, false);
      const old = j.lastHandPose ?? {
        position: node.localToWorld(new Vector3(0, j.half.y, 0)),
        rotation: node.getWorldQuaternion(new Quaternion()),
      };
      const matrix = new Matrix4()
        .compose(node.position, node.quaternion, node.scale)
        .premultiply(socket.matrixWorld);
      const next = {
        position: new Vector3(0, j.half.y, 0).applyMatrix4(matrix),
        rotation: new Quaternion().setFromRotationMatrix(matrix),
      };
      const people = currentPoses
        .filter((p) => p.available && p.id !== j.carrier!.id)
        .map((p) => {
          const radius =
            Math.max(
              INHABITANT_ENVELOPES[p.key].travel,
              inhabitantActionRadius(p.key, p.action),
            ) + 0.04;
          return new Box3(
            new Vector3(p.x - radius, 0, p.z - radius),
            new Vector3(
              p.x + radius,
              INHABITANTS.find((a) => a.id === p.id)!.height +
                INHABITANT_GROUND_CLEARANCE[p.key] +
                0.1,
              p.z + radius,
            ),
          );
        });
      const clear = clearBookSegment(
        old,
        next,
        j.half,
        j.obstacles.concat(people),
      );
      if (!clear) options.onContactBlocked?.(old, next, j.half, j.obstacles);
      return clear;
    },
    followInhabitant(
      delta: number,
      poses: readonly AgentView[],
      anchorFor: (id: string) => Object3D | null,
    ) {
      const j = journey;
      if (!j || disposed) return;
      reconcileCarrier(poses);
      const actor = poses.find(
        (p) =>
          p.physicalSessionId === confirmed?.sessionId &&
          p.interactionObjectId === j.visual.book.instanceId,
      );
      if (
        !j.carrier &&
        j.handReturn < 0 &&
        actor?.interactionState === "picking" &&
        (actor.physicalActionTime ?? 0) >= 0.8
      ) {
        const anchor = anchorFor(actor.id),
          parent = j.visual.node.parent;
        if (!anchor || !parent || j.opening > 0) return;
        anchor.updateWorldMatrix(true, true);
        const center = j.visual.node.localToWorld(new Vector3(0, j.half.y, 0));
        const grip = j.visual.node.localToWorld(
          new Vector3(0, j.half.y, j.half.z),
        );
        const profile = options.pickupProfiles?.().get(actor.id);
        if (!profile) return;
        // Grasp the real vertical edge at this anatomy's palm height, within
        // the closed volume; the book stays on its actual supporting surface.
        grip.y = profile.y;
        if (grip.distanceTo(anchor.getWorldPosition(new Vector3())) > 0.035)
          return;
        const rotation = j.visual.node.getWorldQuaternion(new Quaternion());
        j.carrier = { id: actor.id, parent, rotation };
        j.contactOwner = actor.id;
        anchor.attach(j.visual.node);
        // The grasp preserves the existing pose exactly; the named socket is
        // now the physical parent of the same canonical selectable wrapper.
        j.handPath = [{ position: center, rotation }];
      }
      if (j.carrier) {
        const owner = poses.find((p) => p.id === j.carrier!.id);
        j.visual.node.updateWorldMatrix(true, true);
        const pose = {
          position: j.visual.node.localToWorld(new Vector3(0, j.half.y, 0)),
          rotation: j.visual.node.getWorldQuaternion(new Quaternion()),
        };
        j.lastHandPose = pose;
        const previous = j.handPath[j.handPath.length - 1];
        if (
          owner?.physicalSessionId &&
          owner.physicalSessionId === j.opportunity.sessionId
        ) {
          if (
            owner.interactionState !== "reading" &&
            (pose.position.distanceTo(previous.position) > 0.025 ||
              pose.rotation.angleTo(previous.rotation) > 0.04)
          )
            j.handPath.push(pose);
          return;
        }
        j.carrier.parent.attach(j.visual.node);
        j.carrier = null;
        j.handPath.push(pose);
        j.handReturn = j.handPath.length - 1;
        j.recovering = true;
      }
      if (j.handReturn >= 0) {
        j.opening = Math.max(0, j.opening - Math.min(0.05, delta) * 0.65);
        j.visual.representation.animation.setOpening(j.opening);
        if (j.opening > 0) return;
        if (j.handReturn === 0) {
          j.handReturn = -1;
          j.handPath = [];
          return;
        }
        const end = j.handPath.length - 1;
        const current = sample(j.handPath, Math.min(j.handReturn, end));
        const index = Math.max(0, Math.ceil(j.handReturn) - 1),
          target = j.handPath[index];
        const next = Math.max(
          0,
          j.handReturn -
            Math.min(0.05, delta) /
              Math.max(
                0.04,
                j.handPath[index + 1].position.distanceTo(target.position) /
                  1.1,
              ),
        );
        const pose = sample(j.handPath, next);
        const occupants = poses
          .filter((p) => p.available)
          .map(
            (p) =>
              new Box3(
                new Vector3(
                  p.x - INHABITANT_ENVELOPES[p.key].travel - 0.04,
                  0,
                  p.z - INHABITANT_ENVELOPES[p.key].travel - 0.04,
                ),
                new Vector3(
                  p.x + INHABITANT_ENVELOPES[p.key].travel + 0.04,
                  2.14,
                  p.z + INHABITANT_ENVELOPES[p.key].travel + 0.04,
                ),
              ),
          );
        if (clearBookSegment(current, pose, j.half, occupants)) {
          j.handReturn = next;
          write(j, pose);
        }
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      confirmed = null;
      release();
    },
  };
}
