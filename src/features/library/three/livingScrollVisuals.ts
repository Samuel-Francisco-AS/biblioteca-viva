import {
  BoxGeometry,
  PlaneGeometry,
  DoubleSide,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TorusGeometry,
  Vector3,
  type Object3D,
} from "three";
import type { LivingScroll } from "../../../contracts/livingScroll";
import type { AgentView } from "../inhabitantAgency";
import {
  SCROLL_SURFACES,
  flightObstacles,
  planScrollFlight,
  sampleScrollFlight,
  type ScrollSurface,
} from "./scrollFlightRoutes";
export { SCROLL_SURFACES } from "./scrollFlightRoutes";
export function enchantmentAt(seconds: number) {
  const phase = seconds % 90;
  return phase < 60 ? 0 : Math.sin((Math.PI * (phase - 60)) / 30) ** 2;
}
export function createLivingScrollVisuals(
  building: Group,
  scrolls: readonly LivingScroll[],
  obstacleRoots: readonly Object3D[] = [building],
  surfaceAvailable: (furnitureId: string) => boolean = () => true,
) {
  if (scrolls.length === 0)
    return {
      selectables: [],
      occupiedSurfaces: () => [],
      hasFlight: () => false,
      candidates: () => [],
      update: () => {},
    };
  const obstacles = obstacleRoots.flatMap((root) => flightObstacles(root));
  const root = new Group();
  root.name = "living-scrolls";
  building.add(root);
  const paper = new MeshStandardMaterial({
    color: 0xd8b77c,
    roughness: 0.95,
    side: DoubleSide,
  });
  const gold = new MeshStandardMaterial({
    color: 0xa77c36,
    metalness: 0.65,
    roughness: 0.4,
  });
  const ink = new MeshBasicMaterial({
    color: 0x9cdccd,
    transparent: true,
    opacity: 0.65,
  });
  const box = new BoxGeometry(1, 1, 1);
  const roll = new CylinderGeometry(0.035, 0.035, 0.26, 12);
  let elapsed = 0;
  const selectables = scrolls.slice(0, 10).map((scroll, i) => {
    const surface = SCROLL_SURFACES[(i * 2) % SCROLL_SURFACES.length];
    const group = new Group();
    group.position.set(surface.x, surface.y, surface.z);
    root.add(group);
    const sheetGeometry = new PlaneGeometry(0.25, 0.25, 8, 12);
    const vertices = sheetGeometry.attributes.position;
    for (let v = 0; v < vertices.count; v++) {
      const x = vertices.getX(v),
        z = vertices.getY(v);
      vertices.setXYZ(
        v,
        x,
        0.006 + 0.012 * Math.pow(Math.abs(z) / 0.125, 6),
        z,
      );
    }
    sheetGeometry.computeVertexNormals();
    const sheet = new Mesh(sheetGeometry, paper);
    group.add(sheet);
    for (const z of [-0.14, 0.14]) {
      const cylinder = new Mesh(roll, paper);
      cylinder.rotation.z = Math.PI / 2;
      cylinder.position.set(0, 0.03, z);
      group.add(cylinder);
    }
    const seal = new Mesh(new TorusGeometry(0.045, 0.007, 6, 20), gold);
    seal.rotation.x = -Math.PI / 2;
    seal.position.y = 0.014;
    group.add(seal);
    for (let j = 0; j < 3; j++) {
      const mark = new Mesh(box, ink);
      mark.scale.set(0.12 - j * 0.02, 0.003, 0.008);
      mark.position.set(0, 0.015, -0.07 + j * 0.025);
      group.add(mark);
    }
    const trail = new Group();
    root.add(trail);
    for (let j = 0; j < 9; j++) {
      const mote = new Mesh(box, ink);
      mote.scale.setScalar(0.012 * (1 - j / 12));
      trail.add(mote);
    }
    return {
      descriptor: {
        id: scroll.id,
        entryId: scroll.entryId,
        label: `Pergaminho de ${scroll.kind === "note" ? "anotação" : "citação"} ${i + 1}`,
      },
      root: group,
      surface,
      sheet,
      trail,
      index: i,
      held: false,
      reservedPosition: group.position.clone(),
      rest: surface,
      flight: null as {
        points: readonly Vector3[];
        destination: ScrollSurface;
        time: number;
      } | null,
      wakeAt: 15 + i * 5,
      history: [] as Vector3[],
    };
  });
  return {
    selectables,
    hasFlight: () => selectables.some((s) => s.flight !== null),
    occupiedSurfaces: () =>
      selectables.flatMap((s) => [
        s.rest.furnitureId,
        ...(s.flight ? [s.flight.destination.furnitureId] : []),
      ]),
    candidates: () =>
      selectables
        .filter(
          (s) =>
            !s.held &&
            !s.flight &&
            s.root.position.distanceTo(
              new Vector3(s.rest.x, s.rest.y, s.rest.z),
            ) < 0.02,
        )
        .map((s) => ({
          id: s.descriptor.id,
          source: { x: s.root.position.x, z: s.root.position.z },
        })),
    update(
      delta: number,
      reduced: boolean,
      poses: readonly AgentView[],
      anchor: (id: string) => Object3D | null,
    ) {
      if (!reduced) elapsed += Math.min(delta, 0.1);
      for (const s of selectables) {
        const pose = poses.find(
          (p) => p.interactionObjectId === s.descriptor.id,
        );
        if (pose && !s.held) s.reservedPosition.copy(s.root.position);
        s.held = Boolean(pose);
        if (!pose && !reduced && !s.flight && elapsed >= s.wakeAt) {
          const occupied = new Set(
            selectables
              .filter((o) => o !== s)
              .flatMap((o) => [
                o.rest.id,
                ...(o.flight ? [o.flight.destination.id] : []),
              ]),
          );
          for (const destination of SCROLL_SURFACES.filter(
            (p) => !occupied.has(p.id) && surfaceAvailable(p.furnitureId),
          )) {
            const points = planScrollFlight(s.rest, destination, obstacles);
            if (points) {
              s.flight = { points, destination, time: 0 };
              break;
            }
          }
          s.wakeAt = elapsed + 45 + s.index * 3;
        }
        if (s.flight && !pose) {
          // Reduced motion completes the already validated journey without animation.
          s.flight.time += reduced ? 18 : Math.min(delta, 0.1);
          if (s.flight.time >= 18) {
            s.rest = s.flight.destination;
            s.flight = null;
            s.wakeAt = elapsed + 35 + s.index * 3;
          }
        }
        const flight = Boolean(s.flight);
        const target = s.flight
          ? sampleScrollFlight(s.flight.points, s.flight.time / 18)
          : new Vector3(s.rest.x, s.rest.y, s.rest.z);
        if (pose) target.copy(s.reservedPosition);
        if (
          pose &&
          ["carrying", "recollecting", "returning"].includes(
            pose.interactionState ?? "",
          )
        ) {
          const hand = anchor(pose.id);
          if (hand) {
            hand.updateWorldMatrix(true, false);
            hand.getWorldPosition(target);
            root.worldToLocal(target);
          }
        }
        if (reduced) s.root.position.copy(target);
        else s.root.position.lerp(target, Math.min(1, delta * 5));
        const intensity = s.flight
          ? Math.sin((Math.PI * s.flight.time) / 18)
          : 0;
        s.root.rotation.z = reduced
          ? 0
          : Math.sin(elapsed * 2.1) * 0.12 * intensity;
        s.root.rotation.x = reduced
          ? 0
          : Math.sin(elapsed * 1.3) * 0.08 * intensity;
        if (s.flight) {
          const direction = s.flight.points[2].clone().sub(s.flight.points[1]);
          const yaw = Math.atan2(direction.x, direction.z) * intensity;
          s.root.rotation.y +=
            Math.atan2(
              Math.sin(yaw - s.root.rotation.y),
              Math.cos(yaw - s.root.rotation.y),
            ) * Math.min(1, delta * 2);
        }
        s.sheet.scale.z = 1 + intensity * 0.25;
        s.trail.visible = flight && !reduced;
        s.history.unshift(s.root.position.clone());
        s.history.length = Math.min(s.history.length, 36);
        s.trail.children.forEach((m, j) => {
          m.position.copy(s.history[Math.min(s.history.length - 1, j * 4)]);
        });
      }
    },
  };
}
