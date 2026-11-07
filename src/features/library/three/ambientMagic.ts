import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
} from "three";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";
import { enchantmentAt } from "./livingScrollVisuals";

/** Separate from the wall clock and functional illumination. Owned by building. */
export function createAmbientMagic(
  building: Group,
  onEpisode?: (episode: number) => void,
) {
  const root = new Group();
  root.name = "ambient-magic";
  building.add(root);
  const dustMaterial = new MeshBasicMaterial({
    color: 0xbce4cd,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const runeMaterial = new LineBasicMaterial({
    color: 0xd9b577,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const dustGeometry = new SphereGeometry(0.018, 6, 4);
  const islands = LIBRARY_FURNISHING.filter(
    (p) => p.kind === "study" || p.kind === "lounge",
  ).map((p, i) => {
    const island = new Group();
    island.position.set(p.x, 1.8, p.z);
    root.add(island);
    for (let j = 0; j < 16; j++) {
      const mote = new Mesh(dustGeometry, dustMaterial);
      const a = j * 2.399;
      mote.position.set(
        Math.cos(a) * (0.3 + j * 0.07),
        Math.sin(j * 1.7) * 0.6,
        Math.sin(a) * (0.3 + j * 0.07),
      );
      island.add(mote);
    }
    const rune = new Group();
    rune.position.set(p.x, 2.35, p.z);
    root.add(rune);
    const ring = new Mesh(
      new TorusGeometry(0.42, 0.007, 5, 64),
      new MeshBasicMaterial({
        color: 0xd9b577,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    rune.add(ring);
    const vertices = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * 6 * Math.PI) / 7;
      vertices.push(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    rune.add(new Line(geometry, runeMaterial));
    return { island, rune, ring, index: i };
  });
  let elapsed = 0;
  let episode = -1;
  return {
    update(delta: number, reduced: boolean) {
      if (!reduced) elapsed += Math.min(delta, 0.1);
      const nextEpisode = Math.floor((elapsed - 60) / 90);
      if (!reduced && nextEpisode >= 0 && nextEpisode > episode) {
        episode = nextEpisode;
        onEpisode?.(episode);
      }
      const intensity = reduced ? 0.12 : enchantmentAt(elapsed);
      dustMaterial.opacity = 0.22 + intensity * 0.4;
      runeMaterial.opacity = intensity * 0.65;
      for (const { island, rune, ring, index } of islands) {
        island.rotation.y = reduced
          ? 0
          : Math.sin(elapsed * 0.08 + index) * 0.2;
        ring.material.opacity = intensity * 0.5;
        rune.rotation.y = reduced ? 0 : elapsed * 0.12;
        rune.scale.setScalar(0.85 + intensity * 0.3);
      }
    },
  };
}
