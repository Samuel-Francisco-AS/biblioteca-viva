import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  TorusGeometry,
  Vector3,
  type Object3D,
} from "three";
import type { LivingScroll } from "../../../application/livingScrolls";
import type { AgentView } from "../inhabitantAgency";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";

// Narrow lanes along the free outer edges of existing desks; no wall crossings.
export const SCROLL_SURFACES = LIBRARY_FURNISHING.filter(
  (p) => p.kind === "study" || p.kind === "cabinet",
).flatMap((p) =>
  (p.kind === "cabinet" ? [-1] : [-1, 1]).map((side) => ({
    x: p.x + side * (p.kind === "study" ? 1 : 0.72),
    z: p.z - 0.22,
    y: p.kind === "study" ? 0.92 : 1.11,
  })),
);
export function scrollFlight(t: number) {
  const u = Math.max(0, Math.min(1, t));
  const smooth = u * u * (3 - 2 * u);
  return { z: 0.38 * smooth, y: 0.7 * Math.sin(Math.PI * u) ** 2 };
}
export function enchantmentAt(seconds: number) {
  const phase = seconds % 90;
  return phase < 60 ? 0 : Math.sin((Math.PI * (phase - 60)) / 30) ** 2;
}
export function createLivingScrollVisuals(
  building: Group,
  scrolls: readonly LivingScroll[],
) {
  if (scrolls.length === 0)
    return { selectables: [], candidates: () => [], update: () => {} };
  const root = new Group();
  root.name = "living-scrolls";
  building.add(root);
  const paper = new MeshStandardMaterial({ color: 0xd8b77c, roughness: 0.95 });
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
    const surface = SCROLL_SURFACES[i];
    const group = new Group();
    group.position.set(surface.x, surface.y, surface.z);
    root.add(group);
    const sheet = new Mesh(box, paper);
    sheet.scale.set(0.25, 0.012, 0.25);
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
    };
  });
  return {
    selectables,
    candidates: () =>
      selectables
        .filter(
          (s) =>
            !s.held &&
            Math.abs(s.root.position.y - s.surface.y) < 0.02 &&
            (elapsed + s.index * 7) % 48 < 30,
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
        const cycle = (elapsed + s.index * 7) % 48;
        const flight = !reduced && !pose && cycle > 30;
        const step = scrollFlight(flight ? (cycle - 30) / 18 : 0);
        // Alternate outward/return journeys without accumulating displacement.
        const outward = Math.floor((elapsed + s.index * 7) / 48) % 2 === 0;
        const z = reduced ? 0 : outward ? step.z : 0.38 - step.z;
        const target = new Vector3(
          s.surface.x,
          s.surface.y + step.y,
          s.surface.z + z,
        );
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
        s.root.rotation.z = flight ? Math.sin(elapsed * 1.2) * 0.09 : 0;
        s.sheet.scale.z =
          0.25 + (flight ? Math.sin((Math.PI * (cycle - 30)) / 18) * 0.07 : 0);
        s.trail.visible = flight;
        s.trail.children.forEach((m, j) => {
          m.position.copy(s.root.position);
          m.position.y -= j * 0.025;
          m.position.z -= j * 0.025 * (outward ? 1 : -1);
        });
      }
    },
  };
}
