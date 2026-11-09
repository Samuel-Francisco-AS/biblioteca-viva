import * as T from "three";
import type { ArenaCardView, ArenaView } from "./arenaModel";

export const arenaColors: Record<string, number> = {
  ruin: 0xff7757,
  order: 0x78cfff,
  knowledge: 0x72f1c8,
  chaos: 0xc49aff,
  neutral: 0xe5cca0,
};
export interface ArenaAnchor {
  id: string;
  x: number;
  y: number;
}
export function arenaSlot(
  index: number,
  player: number,
  artifact: boolean,
  landscape: boolean,
): T.Vector3 {
  return new T.Vector3(
    artifact ? (index - 0.5) * 3.6 : (index - 1.5) * 1.65,
    0.34,
    (player === 0 ? 1 : -1) * (artifact ? 0.55 : landscape ? 1.65 : 2.15),
  );
}

/** Original procedural architecture; no battle rules, hidden cards or persistence. */
export function createArenaScene() {
  const scene = new T.Scene();
  scene.background = new T.Color(0x080b19);
  scene.fog = new T.FogExp2(0x080b19, 0.035);
  const camera = new T.OrthographicCamera(-4, 4, 4, -4, 0.1, 70);
  camera.position.set(0, 11, 6.3);
  camera.lookAt(0, 0, 0);
  scene.add(new T.HemisphereLight(0xb6c6ff, 0x201428, 2.4));
  const moon = new T.DirectionalLight(0xaac6ff, 3.2);
  moon.position.set(-4, 9, -5);
  scene.add(moon);
  const ember = new T.DirectionalLight(0xfcb875, 1.6);
  ember.position.set(4, 3, 5);
  scene.add(ember);
  const geometries = new Set<T.BufferGeometry>();
  const materials = new Set<T.Material>();
  const textures = new Map<string, T.Texture>();
  let disposed = false;
  const geo = <G extends T.BufferGeometry>(g: G) => {
    geometries.add(g);
    return g;
  };
  const mat = <M extends T.Material>(m: M) => {
    materials.add(m);
    return m;
  };
  const stone = mat(
    new T.MeshStandardMaterial({
      color: 0x292a46,
      roughness: 0.83,
      metalness: 0.35,
    }),
  );
  const edge = mat(
    new T.MeshStandardMaterial({
      color: 0x746591,
      metalness: 0.8,
      roughness: 0.32,
    }),
  );
  const gold = mat(
    new T.MeshStandardMaterial({
      color: 0xcab486,
      metalness: 0.8,
      roughness: 0.38,
    }),
  );
  const glow = mat(
    new T.MeshBasicMaterial({
      color: 0x6fdcd9,
      transparent: true,
      opacity: 0.65,
    }),
  );
  const box = geo(new T.BoxGeometry(1, 1, 1));
  const octagon = geo(new T.CylinderGeometry(1, 1, 1, 8));
  const crystal = geo(new T.OctahedronGeometry(1));
  const torus = geo(new T.TorusGeometry(1, 0.018, 6, 80));
  const mesh = (
    g: T.BufferGeometry,
    m: T.Material,
    parent: T.Object3D,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    parent.add(o);
    return o;
  };
  const root = new T.Group();
  scene.add(root);
  // Floating, layered dais with cut masonry, metal inlays and a luminous core.
  mesh(octagon, stone, root, 0, -0.52, 0, 5.05, 0.72, 4.7);
  mesh(octagon, edge, root, 0, -0.12, 0, 4.87, 0.13, 4.53);
  mesh(octagon, stone, root, 0, -0.015, 0, 4.7, 0.12, 4.38);
  const core = mesh(torus, glow, root, 0, -0.25, 0, 4.85);
  core.rotation.x = Math.PI / 2;
  const circle = mesh(torus, gold, root, 0, 0.065, 0, 3.4);
  circle.rotation.x = Math.PI / 2;
  const inner = mesh(torus, glow, root, 0, 0.08, 0, 1.15);
  inner.rotation.x = Math.PI / 2;
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const rune = mesh(
      box,
      i % 4 ? gold : glow,
      root,
      Math.sin(a) * 3.5,
      0.08,
      Math.cos(a) * 3.5,
      0.025,
      0.016,
      i % 4 ? 0.12 : 0.25,
    );
    rune.rotation.y = a;
  }
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 ? 1 : -1) * 4.1,
      z = (i < 2 ? -1 : 1) * 3.2;
    mesh(octagon, stone, root, x, 0.23, z, 0.43, 0.6, 0.43);
    mesh(box, edge, root, x, 0.9, z, 0.2, 1.35, 0.25).rotation.z = x * 0.018;
    mesh(crystal, glow, root, x, 1.8, z, 0.22, 0.48, 0.22);
    const orbit = mesh(torus, gold, root, x, 1.8, z, 0.48);
    orbit.rotation.x = 0.8;
    orbit.rotation.y = i;
  }
  for (let i = 0; i < 18; i++) {
    const a = i * 2.39996;
    const rubble = mesh(
      octagon,
      stone,
      root,
      Math.sin(a) * (5.3 + (i % 3)),
      -1.5 - (i % 4),
      Math.cos(a) * (5.3 + (i % 3)),
      0.25 + (i % 3) * 0.14,
      0.4,
      0.6,
    );
    rubble.rotation.set(a, a / 3, a / 2);
  }
  const starsGeo = geo(new T.BufferGeometry());
  const positions = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    const a = i * 2.39996,
      r = 5 + (i % 13);
    positions.set(
      [Math.cos(a) * r, -3 + (i % 17) * 0.45, Math.sin(a) * r],
      i * 3,
    );
  }
  starsGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
  const stars = new T.Points(
    starsGeo,
    mat(
      new T.PointsMaterial({
        color: 0x9cbbe4,
        size: 0.035,
        transparent: true,
        opacity: 0.75,
      }),
    ),
  );
  scene.add(stars);
  const zones = new T.Group();
  root.add(zones);
  const cards = new Map<string, T.Group>();
  const effectRoot = new T.Group();
  scene.add(effectRoot);
  const fxMaterial = mat(
    new T.MeshBasicMaterial({
      color: 0xffc77c,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
  );
  const pulse = mesh(torus, fxMaterial, effectRoot, 0, 0.5, 0);
  pulse.rotation.x = Math.PI / 2;
  pulse.visible = false;
  const bolt = mesh(box, fxMaterial, effectRoot, 0, 0.65, 0);
  bolt.visible = false;
  let last: ArenaView | undefined,
    landscape = false,
    fxStart = -10000,
    fxType = "",
    fxOrigin = new T.Vector3(),
    fxTarget = new T.Vector3();
  let selected: string | undefined,
    targets = new Set<string>();
  const cardMaterials = new Map<string, T.MeshStandardMaterial>();
  const cardGeometry = geo(new T.BoxGeometry(1.26, 0.12, 1.48));
  const artPlane = geo(new T.PlaneGeometry(1.18, 1.35));
  function texture(id: string) {
    let value = textures.get(id);
    if (!value) {
      value = new T.TextureLoader().load(`/assets/duel/${id}.svg`, (t) => {
        if (disposed) t.dispose();
      });
      value.colorSpace = T.SRGBColorSpace;
      textures.set(id, value);
    }
    return value;
  }
  function populate(card: ArenaCardView) {
    const g = new T.Group();
    const color = arenaColors[card.affinity] ?? arenaColors.neutral;
    let border = cardMaterials.get(card.affinity);
    if (!border) {
      border = mat(
        new T.MeshStandardMaterial({
          color,
          metalness: 0.55,
          roughness: 0.36,
          emissive: color,
          emissiveIntensity: 0.18,
        }),
      );
      cardMaterials.set(card.affinity, border);
    }
    mesh(cardGeometry, border, g, 0, 0, 0);
    const art = mat(
      new T.MeshBasicMaterial({ map: texture(card.artId), toneMapped: false }),
    );
    mesh(artPlane, art, g, 0, 0.066, 0).rotation.x = -Math.PI / 2;
    // An apparition rises above the physical grimoire: each tradition has its own silhouette.
    if (card.kind === "creature") {
      const ghost = mesh(crystal, border, g, 0, 0.6, -0.17, 0.2, 0.5, 0.18);
      if (card.affinity === "ruin")
        for (const sign of [-1, 1])
          mesh(
            crystal,
            border,
            ghost,
            sign * 1.2,
            0.8,
            0,
            0.45,
            0.8,
            0.4,
          ).rotation.z = sign * -0.4;
      else if (card.affinity === "order")
        for (const sign of [-1, 1])
          mesh(
            box,
            border,
            ghost,
            sign * 1.7,
            0.2,
            0,
            1.4,
            0.22,
            0.2,
          ).rotation.z = sign * -0.6;
      else {
        const halo = mesh(torus, border, ghost, 0, 0.7, 0, 1.7);
        halo.rotation.x = card.affinity === "chaos" ? 0.5 : Math.PI / 2;
      }
    } else mesh(crystal, border, g, 0, 0.6, 0, 0.24, 0.45, 0.24);
    return g;
  }
  function locate(id?: string) {
    if (id === "p0" || id === "p1")
      return new T.Vector3(0, 0.35, id === "p0" ? 3.2 : -3.2);
    return cards.get(id ?? "")?.position.clone() ?? new T.Vector3(0, 0.35, 0);
  }
  function highlight() {
    for (const [id, group] of cards) {
      const active = selected === id || targets.has(id);
      group.scale.setScalar(active ? 1.08 : 1);
      group.position.y = active ? 0.55 : 0.24;
    }
  }
  function update(view: ArenaView, time = performance.now()) {
    const wanted = new Set<string>();
    [view.player, view.opponent].forEach((p, index) => {
      [p.units, p.artifacts].forEach((items, kind) =>
        items.forEach((c, i) => {
          wanted.add(c.id);
          let g = cards.get(c.id);
          if (!g) {
            g = populate(c);
            cards.set(c.id, g);
            root.add(g);
          }
          g.position.copy(arenaSlot(i, index, kind === 1, landscape));
        }),
      );
    });
    if (last && view.revision > last.revision) {
      const e =
        view.events.find((e) =>
          ["attack", "spell", "summon", "artifact", "activate"].includes(
            e.type,
          ),
        ) ?? view.events[0];
      if (e && !["pause", "resume", "turn", "draw"].includes(e.type)) {
        fxType = view.events.some((e) => e.type === "roll")
          ? "roll"
          : view.events.some((e) => e.type === "heal")
            ? "heal"
            : view.events.some((e) => e.type === "shield")
              ? "shield"
              : view.events.some((e) => e.type === "empower")
                ? "empower"
                : view.events.some((e) => e.type === "exhaust")
                  ? "exhaust"
                  : view.events.some((e) =>
                        ["death", "shatter"].includes(e.type),
                      )
                    ? "death"
                    : e.type;
        fxOrigin = locate(e.source);
        fxTarget = locate(
          view.events.find((x) =>
            ["damage", "heal", "shield", "empower", "exhaust"].includes(x.type),
          )?.target ?? e.target,
        );
        fxStart = time;
      }
    }
    for (const [id, g] of cards)
      if (!wanted.has(id)) {
        // Shared geometry/materials survive; each per-card art material is released now.
        g.traverse((o) => {
          if (
            o instanceof T.Mesh &&
            o.material instanceof T.MeshBasicMaterial
          ) {
            o.material.dispose();
            materials.delete(o.material);
          }
        });
        root.remove(g);
        cards.delete(id);
      }
    last = view;
    highlight();
  }
  function resize(width: number, height: number) {
    landscape = width / height > 1.4;
    const aspect = width / height;
    const h = Math.max(landscape ? 5.2 : 7.3, 8.3 / aspect);
    camera.left = (-h * aspect) / 2;
    camera.right = (h * aspect) / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    zones.clear();
    for (let player = 0; player < 2; player++)
      for (let kind = 0; kind < 2; kind++)
        for (let i = 0; i < (kind ? 2 : 4); i++) {
          const pos = arenaSlot(i, player, kind === 1, landscape);
          const ring = mesh(
            torus,
            kind ? gold : glow,
            zones,
            pos.x,
            0.11,
            pos.z,
            kind ? 0.48 : 0.68,
          );
          ring.rotation.x = Math.PI / 2;
        }
    if (last) {
      const v = last;
      last = undefined;
      update(v);
    }
  }
  return {
    scene,
    camera,
    resize,
    update,
    select(id: string | undefined, legalTargets: Set<string>) {
      selected = id;
      targets = legalTargets;
      highlight();
    },
    anchors(): ArenaAnchor[] {
      return [...cards.keys(), "p0", "p1"].map((id) => {
        const p = locate(id);
        p.y = 0.25;
        p.project(camera);
        return { id, x: (p.x + 1) * 50, y: (1 - p.y) * 50 };
      });
    },
    animate(time: number, reduced: boolean) {
      stars.rotation.y = reduced ? 0 : time * 0.000008;
      const t = (time - fxStart) / 850;
      pulse.visible = !reduced && t >= 0 && t < 1;
      bolt.visible = pulse.visible && fxType === "attack";
      if (pulse.visible) {
        fxMaterial.color.setHex(
          (
            {
              heal: 0x6effbb,
              shield: 0x7cdfff,
              empower: 0xffdf75,
              exhaust: 0x8e80d6,
              death: 0xff626d,
              roll: 0xe38fff,
            } as Record<string, number>
          )[fxType] ?? 0xffac66,
        );
        fxMaterial.opacity = (1 - t) * 0.9;
        pulse.position.copy(fxTarget);
        pulse.position.y = fxType === "summon" ? 0.25 + t * 1.7 : 0.4;
        pulse.rotation.x = fxType === "shield" ? 0 : Math.PI / 2;
        pulse.scale.setScalar(
          fxType === "death" ? 1.7 * (1 - t) : 0.2 + t * 1.7,
        );
        bolt.position.lerpVectors(fxOrigin, fxTarget, t);
        bolt.position.y = 0.7;
        bolt.scale.set(0.12, 0.12, 1.3);
        bolt.lookAt(fxTarget.x, 0.7, fxTarget.z);
      }
    },
    dispose() {
      disposed = true;
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      scene.clear();
    },
  };
}
