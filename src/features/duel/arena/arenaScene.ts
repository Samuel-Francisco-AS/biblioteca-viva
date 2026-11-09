import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createArenaScenery } from "./arenaScenery";
import { createArenaEffects } from "./arenaEffects";
import { duelArtUrl } from "../duelArt";
import * as T from "three";
import type { Affinity } from "../../../domain/duel/contracts";
import type { ArenaCardView, ArenaView } from "./arenaModel";

export const arenaColors: Record<Affinity, number> = {
  ruin: 0xff7757,
  bloom: 0x8fdb93,
  knowledge: 0x78cfff,
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
    (player === 0 ? 1 : -1) * (artifact ? 0.85 : landscape ? 2.1 : 2.15),
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
      color: 0x27353c,
      roughness: 0.83,
      metalness: 0.35,
    }),
  );
  // Small procedural stone texture is bundled as code and never fetches remote art.
  const grain = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < 128 * 128; i++) {
    const x = i % 128,
      y = Math.floor(i / 128);
    const seam = x % 32 === 0 || y % 32 === 0;
    const value = seam ? 35 : 105 + ((i * 73 + y * 37) % 35);
    grain.set([value, value, value, 255], i * 4);
  }
  const masonry = new T.DataTexture(grain, 128, 128);
  masonry.needsUpdate = true;
  masonry.wrapS = masonry.wrapT = T.RepeatWrapping;
  masonry.repeat.set(3, 3);
  stone.bumpMap = masonry;
  stone.bumpScale = 0.09;
  textures.set("masonry", masonry);
  const edge = mat(
    new T.MeshStandardMaterial({
      color: 0x8b784d,
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
  const octagon = geo(new T.CylinderGeometry(1, 1, 1, 8));
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
  const scenery = createArenaScenery(root);
  const zones = new T.Group();
  root.add(zones);
  const cards = new Map<string, T.Group>();
  const artifactIds = new Set<string>();
  const effects = createArenaEffects(scene);
  let last: ArenaView | undefined,
    landscape = false;
  let selected: string | undefined,
    targets = new Set<string>();
  const cardMaterials = new Map<string, T.MeshStandardMaterial>();
  const cardGeometry = geo(new T.BoxGeometry(1.26, 0.12, 1.48));
  const artPlane = geo(new T.PlaneGeometry(1.08, 1.2));
  const framePieces: T.BufferGeometry[] = [],
    cornerPieces: T.BufferGeometry[] = [];
  for (const sign of [-1, 1]) {
    framePieces.push(
      new T.BoxGeometry(0.035, 0.045, 1.39).translate(sign * 0.58, 0.075, 0),
    );
    framePieces.push(
      new T.BoxGeometry(1.16, 0.045, 0.035).translate(0, 0.075, sign * 0.67),
    );
    for (const other of [-1, 1])
      cornerPieces.push(
        new T.OctahedronGeometry(1)
          .scale(0.06, 0.035, 0.06)
          .translate(sign * 0.53, 0.12, other * 0.62),
      );
  }
  const mergedFrame = mergeGeometries(framePieces),
    mergedCorners = mergeGeometries(cornerPieces);
  [...framePieces, ...cornerPieces].forEach((g) => g.dispose());
  if (!mergedFrame || !mergedCorners)
    throw new Error("Moldura da arena incompatível.");
  const frameGeometry = geo(mergedFrame),
    cornerGeometry = geo(mergedCorners);

  function texture(id: string) {
    let value = textures.get(id);
    if (!value) {
      value = new T.TextureLoader().load(duelArtUrl(id), (t: T.Texture) => {
        if (disposed) {
          t.dispose();
          return;
        }
        // SVGs have a viewBox but no intrinsic pixel dimensions. Rasterize once
        // at a bounded size before GPU upload (also reliable in Android WebView).
        const source: unknown = t.image;
        if (
          id &&
          duelArtUrl(id).endsWith(".svg") &&
          source instanceof HTMLImageElement
        ) {
          source.width = 384;
          source.height = 288;
          const canvas = document.createElement("canvas");
          canvas.width = 384;
          canvas.height = 288;
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(source, 0, 0, 384, 288);
            t.image = canvas;
            t.needsUpdate = true;
          }
        }
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
    mesh(frameGeometry, gold, g, 0, 0, 0);
    mesh(cornerGeometry, border, g, 0, 0, 0);
    if (card.kind === "artifact") {
      const relic = mesh(torus, border, g, 0, 0.14, 0, 0.5);
      relic.rotation.x = Math.PI / 2;
    }
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
      group.scale.setScalar(
        (artifactIds.has(id) ? 0.7 : 1) * (active ? 1.08 : 1),
      );
      group.position.y = active ? 0.55 : 0.24;
    }
  }
  function update(view: ArenaView, time = performance.now()) {
    const wanted = new Set<string>();
    [view.player, view.opponent].forEach((p, index) => {
      [p.units, p.artifacts].forEach((items, kind) =>
        items.forEach((c, i) => {
          wanted.add(c.id);
          if (c.kind === "artifact") artifactIds.add(c.id);
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
    if (last && view.revision > last.revision)
      effects.confirm(view, locate, time);
    scenery.setAffinity(
      (view.active === 0 ? view.player : view.opponent).affinity,
    );
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
        artifactIds.delete(id);
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
    effectsActive(time: number) {
      return effects.active(time);
    },
    animate(time: number, reduced: boolean) {
      scenery.update(time, reduced);
      effects.update(time, reduced);
    },
    dispose() {
      disposed = true;
      scenery.dispose();
      effects.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      scene.clear();
    },
  };
}
