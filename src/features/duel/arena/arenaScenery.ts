import * as T from "three";
import type { Affinity } from "../../../domain/duel/contracts";

/** Sculpted observatory dressing, owned by the arena; no clock or renderer of its own. */
export function createArenaScenery(parent: T.Group) {
  const root = new T.Group();
  root.name = "ritual-observatory";
  parent.add(root);
  const geos = new Set<T.BufferGeometry>(),
    mats = new Set<T.Material>();
  const geo = <G extends T.BufferGeometry>(g: G) => {
    geos.add(g);
    return g;
  };
  const mat = <M extends T.Material>(m: M) => {
    mats.add(m);
    return m;
  };
  const stone = mat(
    new T.MeshStandardMaterial({
      color: 0x46545b,
      roughness: 0.7,
      metalness: 0.16,
    }),
  );
  const bronze = mat(
    new T.MeshStandardMaterial({
      color: 0xc6a365,
      roughness: 0.34,
      metalness: 0.82,
    }),
  );
  const dark = mat(
    new T.MeshStandardMaterial({
      color: 0x172634,
      roughness: 0.56,
      metalness: 0.4,
    }),
  );
  const paper = mat(
    new T.MeshStandardMaterial({ color: 0xe8d8b9, roughness: 0.76 }),
  );
  const aqua = mat(
    new T.MeshBasicMaterial({
      color: 0x94d6cd,
      transparent: true,
      opacity: 0.55,
    }),
  );
  const box = geo(new T.BoxGeometry(1, 1, 1));
  const ring = geo(new T.TorusGeometry(1, 0.018, 6, 96));
  const disk = geo(new T.CylinderGeometry(1, 1, 1, 48));
  const leaf = geo(new T.SphereGeometry(1, 8, 6));
  const shard = geo(new T.OctahedronGeometry(1));
  const add = (
    g: T.BufferGeometry,
    m: T.Material,
    owner: T.Object3D,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const mesh = new T.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    owner.add(mesh);
    return mesh;
  };
  // A single reusable marble/mosaic texture; actual depth remains in the architecture.
  const n = 512,
    pixels = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const dx = x - n / 2,
        dy = y - n / 2,
        r = Math.hypot(dx, dy),
        a = Math.atan2(dy, dx);
      const veins =
        Math.sin(x * 0.07 + Math.sin(y * 0.027) * 5) +
        Math.cos(y * 0.09 + Math.sin(x * 0.023) * 4);
      const grain = ((x * 73 + y * 137) % 23) - 11;
      const joints =
        Math.abs(Math.sin(r * 0.105)) < 0.025 ||
        (r > 150 && Math.abs(Math.sin(a * 12)) < 0.014);
      const v = joints ? -30 : veins * 6 + grain * 0.35;
      const i = (y * n + x) * 4;
      pixels.set([76 + v, 88 + v, 88 + v, 255], i);
    }
  const texture = new T.DataTexture(pixels, n, n);
  texture.colorSpace = T.SRGBColorSpace;
  texture.needsUpdate = true;
  const floor = mat(
    new T.MeshStandardMaterial({
      map: texture,
      roughness: 0.64,
      metalness: 0.2,
      bumpMap: texture,
      bumpScale: 0.045,
    }),
  );
  add(disk, floor, root, 0, 0.07, 0, 4.5, 0.08, 4.5);
  for (const radius of [1.03, 1.18, 3.45, 3.64, 4.22, 4.34]) {
    const o = add(
      ring,
      radius < 1.2 ? aqua : bronze,
      root,
      0,
      0.122,
      0,
      radius,
    );
    o.rotation.x = -Math.PI / 2;
  }
  // Inlaid star/compass spokes with a quiet, readable central play surface.
  const spokes: number[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24,
      r = i % 4 === 0 ? 3.8 : 4.04;
    spokes.push(
      Math.sin(a) * r,
      0.125,
      Math.cos(a) * r,
      Math.sin(a) * 4.16,
      0.125,
      Math.cos(a) * 4.16,
    );
  }
  const spokeGeo = geo(new T.BufferGeometry());
  spokeGeo.setAttribute("position", new T.Float32BufferAttribute(spokes, 3));
  root.add(
    new T.LineSegments(
      spokeGeo,
      mat(
        new T.LineBasicMaterial({
          color: 0xc2aa79,
          transparent: true,
          opacity: 0.8,
        }),
      ),
    ),
  );
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const lozenge = add(
      box,
      bronze,
      root,
      Math.sin(a) * 3.82,
      0.14,
      Math.cos(a) * 3.82,
      0.09,
      0.026,
      0.18,
    );
    lozenge.rotation.y = a + Math.PI / 4;
  }
  // Lathed stone, capitals and rounded vaults replace the old block-built arches.
  const profile = [
    new T.Vector2(0.36, 0),
    new T.Vector2(0.36, 0.14),
    new T.Vector2(0.23, 0.22),
    new T.Vector2(0.18, 0.42),
    new T.Vector2(0.15, 1.3),
    new T.Vector2(0.24, 1.45),
    new T.Vector2(0.31, 1.5),
  ];
  const column = geo(new T.LatheGeometry(profile, 12)),
    arch = geo(new T.TorusGeometry(1.55, 0.11, 8, 48, Math.PI));
  for (const sign of [-1, 1]) {
    const gateway = new T.Group();
    gateway.position.set(0, 0.1, sign * 4.8);
    root.add(gateway);
    for (const x of [-1.55, 1.55]) {
      add(column, stone, gateway, x, 0, 0);
      add(disk, bronze, gateway, x, 0.18, 0, 0.37, 0.045, 0.37);
      add(disk, bronze, gateway, x, 1.56, 0, 0.33, 0.06, 0.33);
    }
    add(arch, stone, gateway, 0, 1.55, 0);
    add(arch, bronze, gateway, 0, 1.55, 0.055, 0.92);
    add(shard, bronze, gateway, 0, 3.12, 0, 0.12, 0.25, 0.12);
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI) / 8 + Math.PI / 8;
      const inlay = add(
        box,
        aqua,
        gateway,
        Math.cos(a) * 1.55,
        1.55 + Math.sin(a) * 1.55,
        0.12,
        0.035,
        0.11,
        0.025,
      );
      inlay.rotation.z = a;
    }
  }
  const colors: Record<Affinity, number> = {
    ruin: 0xff8e55,
    knowledge: 0x9edcff,
    bloom: 0x9ee8b5,
    chaos: 0xd3acff,
    neutral: 0xe4ce9a,
  };
  const foci = new Map<
    Affinity,
    { root: T.Group; light: T.MeshBasicMaterial; halo: T.Mesh }
  >();
  (["ruin", "knowledge", "bloom", "chaos"] as const).forEach((affinity, i) => {
    const focus = new T.Group();
    focus.position.set((i % 2 ? 1 : -1) * 4.22, 0.15, (i < 2 ? -1 : 1) * 3.1);
    root.add(focus);
    add(disk, stone, focus, 0, 0.12, 0, 0.48, 0.3, 0.48);
    add(disk, bronze, focus, 0, 0.3, 0, 0.5, 0.06, 0.5);
    add(column, dark, focus, 0, 0.34, 0, 0.72, 0.6, 0.72);
    add(disk, bronze, focus, 0, 1.23, 0, 0.33, 0.07, 0.33);
    const light = mat(
      new T.MeshBasicMaterial({
        color: colors[affinity],
        transparent: true,
        opacity: 0.8,
      }),
    );
    if (affinity === "knowledge") {
      for (const sign of [-1, 1])
        add(
          box,
          paper,
          focus,
          sign * 0.19,
          1.48,
          0,
          0.37,
          0.055,
          0.48,
        ).rotation.z = sign * 0.28;
      add(leaf, light, focus, 0, 1.9, 0, 0.16);
      const meridian = add(ring, bronze, focus, 0, 1.9, 0, 0.3);
      meridian.rotation.y = 0.6;
    } else if (affinity === "bloom") {
      add(box, bronze, focus, 0, 1.56, 0, 0.055, 0.65, 0.055);
      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5;
        const petal = add(
          leaf,
          light,
          focus,
          Math.sin(a) * 0.2,
          1.8,
          Math.cos(a) * 0.2,
          0.12,
          0.28,
          0.075,
        );
        petal.rotation.z = a * 0.2;
      }
    } else if (affinity === "ruin") {
      add(disk, bronze, focus, 0, 1.42, 0, 0.33, 0.14, 0.33);
      add(shard, light, focus, 0, 1.77, 0, 0.16, 0.4, 0.16);
      for (const sign of [-1, 1])
        add(
          shard,
          bronze,
          focus,
          sign * 0.28,
          1.55,
          0,
          0.07,
          0.28,
          0.07,
        ).rotation.z = sign * 0.4;
    } else {
      for (let j = 0; j < 3; j++) {
        const a = j * 2.1;
        add(
          shard,
          light,
          focus,
          Math.sin(a) * 0.23,
          1.7 + j * 0.08,
          Math.cos(a) * 0.23,
          0.1,
          0.24,
          0.1,
        ).rotation.z = a;
      }
    }
    const halo = add(ring, light, focus, 0, 1.75, 0, 0.52);
    halo.rotation.x = Math.PI / 2;
    foci.set(affinity, { root: focus, light, halo });
  });
  // Distant circular galleries establish scale without crowding selectable zones.
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5,
      r = 7.4;
    const tower = new T.Group();
    tower.position.set(Math.sin(a) * r, -2, Math.cos(a) * r);
    root.add(tower);
    add(column, dark, tower, 0, 0, 0, 1.5, 2.4 + (i % 3), 1.5);
    for (let j = 0; j < 3; j++)
      add(ring, bronze, tower, 0, j * 1.3 + 0.4, 0, 0.55).rotation.x =
        Math.PI / 2;
  }
  const moon = add(
    geo(new T.SphereGeometry(2, 24, 16)),
    mat(new T.MeshBasicMaterial({ color: 0x8dacae })),
    root,
    0,
    3,
    -13,
  );
  const moonRing = add(ring, bronze, root, 0, 3, -13, 2.3);
  moonRing.rotation.y = 0.5;
  moonRing.rotation.z = 0.3;
  const positions: number[] = [];
  for (let i = 0; i < 160; i++) {
    const a = i * 2.39996,
      r = 5 + (i % 13);
    positions.push(Math.cos(a) * r, -2 + (i % 17) * 0.42, Math.sin(a) * r);
  }
  const starGeo = geo(new T.BufferGeometry());
  starGeo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  const stars = new T.Points(
    starGeo,
    mat(
      new T.PointsMaterial({
        color: 0xc9d9cf,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    ),
  );
  root.add(stars);
  let active: Affinity = "neutral";
  return {
    root,
    setAffinity(a: Affinity) {
      active = a;
    },
    update(time: number, reduced: boolean) {
      const t = reduced ? 0 : time * 0.001;
      stars.rotation.y = t * 0.006;
      moon.rotation.y = t * 0.012;
      for (const [a, f] of foci) {
        f.light.opacity =
          0.52 + (a === active ? 0.23 : 0.08) * (1 + Math.sin(t * 1.3));
        f.halo.rotation.z = t * (a === "chaos" ? -0.35 : 0.18);
      }
    },
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texture.dispose();
      root.removeFromParent();
    },
  };
}
