import * as T from "three";
import type { ArenaEventView, ArenaView } from "./arenaModel";
import type { Affinity } from "../../../domain/duel/contracts";
const colors: Record<Affinity, number> = {
  ruin: 0xff8b53,
  knowledge: 0x9de5ff,
  bloom: 0x99f0b5,
  chaos: 0xd4a3ff,
  neutral: 0xf6d9a0,
};
const visibleEvents = new Set([
  "summon",
  "spell",
  "artifact",
  "attack",
  "damage",
  "heal",
  "shield",
  "empower",
  "exhaust",
  "shatter",
  "death",
  "roll",
  "activate",
  "result",
]);
type Channel = {
  kind: ArenaEventView["type"];
  born: number;
  duration: number;
  from: T.Vector3;
  to: T.Vector3;
  affinity: Affinity;
  root: T.Group;
  rings: T.Mesh[];
  beam: T.Mesh;
  barrier: T.Mesh;
  flare: T.Mesh;
  material: T.MeshBasicMaterial;
};

/** Fixed reusable visual channels. Commands and persistence never wait for these. */
export function createArenaEffects(scene: T.Scene) {
  const root = new T.Group();
  root.name = "confirmed-ritual-effects";
  scene.add(root);
  const ringGeo = new T.TorusGeometry(1, 0.027, 6, 48),
    beamGeo = new T.CylinderGeometry(0.035, 0.11, 1, 8),
    sphereGeo = new T.IcosahedronGeometry(1, 1),
    planeGeo = new T.PlaneGeometry(1, 1),
    fragmentGeo = new T.OctahedronGeometry(1);
  const pixels = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      const r = Math.hypot(x - 31.5, y - 31.5) / 31.5,
        i = (y * 64 + x) * 4;
      pixels.set([255, 255, 255, Math.round(Math.max(0, 1 - r) ** 2 * 255)], i);
    }
  const glow = new T.DataTexture(pixels, 64, 64);
  glow.needsUpdate = true;
  const channels: Channel[] = Array.from({ length: 16 }, () => {
    const group = new T.Group();
    group.visible = false;
    root.add(group);
    const material = new T.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: T.AdditiveBlending,
      depthWrite: false,
    });
    const rings = Array.from({ length: 3 }, () => {
      const m = new T.Mesh(ringGeo, material);
      group.add(m);
      return m;
    });
    const beam = new T.Mesh(beamGeo, material);
    group.add(beam);
    const barrier = new T.Mesh(
      sphereGeo,
      new T.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        wireframe: true,
        opacity: 0.5,
        depthWrite: false,
        blending: T.AdditiveBlending,
      }),
    );
    group.add(barrier);
    const flare = new T.Mesh(
      planeGeo,
      new T.MeshBasicMaterial({
        map: glow,
        color: 0xffffff,
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        side: T.DoubleSide,
      }),
    );
    group.add(flare);
    return {
      kind: "summon",
      born: -10000,
      duration: 1,
      from: new T.Vector3(),
      to: new T.Vector3(),
      affinity: "neutral",
      root: group,
      rings,
      beam,
      barrier,
      flare,
      material,
    };
  });
  const particleMat = new T.MeshBasicMaterial({
    transparent: true,
    opacity: 0.85,
    blending: T.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new T.InstancedMesh(fragmentGeo, particleMat, 128);
  particles.visible = false;
  particles.frustumCulled = false;
  particles.instanceMatrix.setUsage(T.DynamicDrawUsage);
  root.add(particles);
  const transform = new T.Object3D(),
    direction = new T.Vector3(),
    normal = new T.Vector3(),
    offset = new T.Vector3(),
    up = new T.Vector3(0, 1, 0),
    tint = new T.Color();
  let lastRevision = -1;
  const clearParticle = (index: number) => {
    transform.position.set(0, 0, 0);
    transform.scale.setScalar(0);
    transform.updateMatrix();
    particles.setMatrixAt(index, transform.matrix);
  };
  return {
    confirm(view: ArenaView, locate: (id?: string) => T.Vector3, time: number) {
      if (view.revision <= lastRevision) return;
      lastRevision = view.revision;
      channels.forEach((c) => {
        c.root.visible = false;
        c.duration = 0;
      });
      const events = view.events
        .filter((e) => visibleEvents.has(e.type))
        .slice(0, channels.length);
      events.forEach((e, i) => {
        const c = channels[i];
        c.kind = e.type;
        c.born = time;
        c.duration =
          e.type === "result"
            ? 1800
            : ["summon", "artifact", "shield"].includes(e.type)
              ? 1050
              : ["death", "shatter", "empower"].includes(e.type)
                ? 900
                : 650;
        c.affinity = (e.player === 0 ? view.player : view.opponent).affinity;
        c.from.copy(locate(e.source ?? (e.player === 0 ? "p0" : "p1")));
        c.to.copy(
          locate(
            e.type === "result"
              ? view.result?.winner === 0
                ? "p0"
                : "p1"
              : e.target,
          ),
        );
        c.root.position.set(0, 0, 0);
        c.root.visible = true;
      });
    },
    active(time: number) {
      return channels.some((c) => c.duration > 0 && time - c.born < c.duration);
    },
    update(time: number, reduced: boolean) {
      if (
        reduced ||
        !channels.some(
          (c) => c.duration > 0 && time >= c.born && time - c.born < c.duration,
        )
      ) {
        channels.forEach((c) => {
          c.root.visible = false;
        });
        particles.visible = false;
        return;
      }
      let any = false;
      channels.forEach((c, index) => {
        const t = (time - c.born) / c.duration,
          alive = !reduced && c.duration > 0 && t >= 0 && t < 1;
        c.root.visible = alive;
        if (!alive) {
          for (let j = 0; j < 8; j++) clearParticle(index * 8 + j);
          return;
        }
        any = true;
        const heal = c.kind === "heal",
          shield = c.kind === "shield",
          empower = c.kind === "empower",
          death = c.kind === "death" || c.kind === "shatter",
          chaos = c.kind === "roll" || c.affinity === "chaos",
          summon = c.kind === "summon",
          result = c.kind === "result",
          attack = c.kind === "attack" || c.kind === "spell";
        const color = heal
          ? 0x9cf3bc
          : shield
            ? 0xb0e4ff
            : empower
              ? 0xf2d88f
              : death
                ? 0xf1a17e
                : colors[c.affinity];
        tint.setHex(color);
        c.material.color.copy(tint);
        c.material.opacity = Math.sin(Math.PI * t) * 0.85;
        for (let j = 0; j < 3; j++) {
          const ring = c.rings[j];
          ring.position.copy(c.to);
          ring.position.y =
            0.32 +
            (summon || heal || empower
              ? (t + j * 0.16) * 1.4
              : result
                ? t * 2
                : 0.04 * j);
          ring.rotation.set(
            shield ? j * 0.7 : Math.PI / 2,
            0,
            (chaos ? -1 : 1) * (t * 2 + j),
          );
          ring.scale.setScalar(
            death
              ? 1.2 * (1 - t) + j * 0.12
              : result
                ? 0.7 + t * (2 + j * 0.4)
                : summon
                  ? 0.25 + t * 0.9 + j * 0.17
                  : 0.2 + t * (0.7 + j * 0.13),
          );
          ring.visible = j === 0 || summon || shield || result || empower;
        }
        c.beam.visible = attack;
        if (attack) {
          direction.subVectors(c.to, c.from);
          c.beam.position.lerpVectors(c.from, c.to, 0.5);
          c.beam.position.y += 0.65;
          c.beam.quaternion.setFromUnitVectors(
            up,
            normal.copy(direction).normalize(),
          );
          c.beam.scale.set(
            0.5 + Math.sin(Math.PI * t),
            direction.length() * Math.sin(Math.PI * t),
            0.5 + Math.sin(Math.PI * t),
          );
        }
        c.barrier.visible = shield;
        if (shield) {
          c.barrier.position.copy(c.to);
          c.barrier.position.y += 0.65;
          c.barrier.scale.setScalar(0.8 + t * 0.35);
          c.barrier.rotation.y = t * 0.8;
          const m = c.barrier.material;
          if (m instanceof T.MeshBasicMaterial) {
            m.color.copy(tint);
            m.opacity = (1 - t) * 0.65;
          }
        }
        c.flare.position.copy(c.to);
        c.flare.position.y = 0.3;
        c.flare.rotation.x = -Math.PI / 2;
        c.flare.scale.setScalar(result ? 3 + 4 * t : summon ? 1.5 : 1 + t);
        const flareMaterial = c.flare.material;
        if (flareMaterial instanceof T.MeshBasicMaterial) {
          flareMaterial.color.copy(tint);
          flareMaterial.opacity = Math.sin(Math.PI * t) * 0.7;
        }
        for (let j = 0; j < 8; j++) {
          const a = (j * Math.PI) / 4 + (chaos ? t * 8 : 0),
            r = death
              ? t * 1.7
              : heal
                ? 0.4
                : result
                  ? 0.7 + t * 2
                  : 0.3 + t * 0.65;
          transform.position.set(
            c.to.x + Math.cos(a) * r,
            0.4 +
              (heal || empower || result
                ? t * (1.7 + (j % 3) * 0.3)
                : death
                  ? Math.sin(Math.PI * t) * 0.8 - t * t * 0.5
                  : chaos
                    ? Math.sin(a + t * 18) * 0.5
                    : t * 0.6),
            c.to.z + Math.sin(a) * r,
          );
          if (attack)
            transform.position
              .lerpVectors(c.from, c.to, Math.min(1, t + j * 0.035))
              .add(offset.set(Math.sin(a) * 0.08, 0.6 + Math.cos(a) * 0.08, 0));
          transform.scale.set(0.035, empower ? 0.24 : 0.07, 0.035);
          transform.rotation.set(a, a * 2, t * 4);
          transform.updateMatrix();
          particles.setMatrixAt(index * 8 + j, transform.matrix);
          particles.setColorAt(index * 8 + j, tint);
        }
      });
      particles.visible = any;
      particles.instanceMatrix.needsUpdate = true;
      if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
    },
    dispose() {
      channels.forEach((c) => {
        c.material.dispose();
        if (c.barrier.material instanceof T.Material)
          c.barrier.material.dispose();
        if (c.flare.material instanceof T.Material) c.flare.material.dispose();
      });
      particleMat.dispose();
      for (const g of [ringGeo, beamGeo, sphereGeo, planeGeo, fragmentGeo])
        g.dispose();
      glow.dispose();
      root.removeFromParent();
    },
  };
}
