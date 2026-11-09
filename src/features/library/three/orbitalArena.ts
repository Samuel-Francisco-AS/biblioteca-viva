import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  TorusGeometry,
} from "three";
import { batchStaticVisual } from "./staticVisuals";
export const ORBITAL_ARENA_ID = "portal:duelo-arcano";
export const ORBITAL_RADIUS = 28; // Existing middle architectural ring.
export const ORBITAL_PERIOD_SECONDS = 420;

/** One moving selectable owned by the existing building and its frame scheduler. */
export function createOrbitalArena() {
  const root = new Group();
  root.name = ORBITAL_ARENA_ID;
  const body = new Group();
  root.add(body);
  const stone = new MeshStandardMaterial({
    color: 0x303c4c,
    roughness: 0.75,
    metalness: 0.2,
  });
  const bronze = new MeshStandardMaterial({
    color: 0xd5b574,
    roughness: 0.32,
    metalness: 0.8,
  });
  const leather = new MeshStandardMaterial({
    color: 0x1f344b,
    roughness: 0.5,
    metalness: 0.3,
  });
  const paper = new MeshStandardMaterial({ color: 0xf0dfb8, roughness: 0.8 });
  const magic = new MeshBasicMaterial({ color: 0x9eeaff });
  const glow = new MeshBasicMaterial({
    color: 0x8be6fa,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const box = new BoxGeometry(1, 1, 1),
    ringGeo = new TorusGeometry(1.65, 0.035, 6, 72);
  const add = (
    parent: Group,
    geometry: BoxGeometry | CylinderGeometry | TorusGeometry,
    material: MeshStandardMaterial | MeshBasicMaterial,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = sx,
    sz = sx,
  ) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);
    return mesh;
  };
  add(body, new CylinderGeometry(1.5, 1.1, 0.4, 16), stone, 0, -0.45, 0);
  add(body, new CylinderGeometry(1.52, 1.52, 0.06, 32), bronze, 0, -0.21, 0);
  const crescent = add(
    body,
    new TorusGeometry(1.55, 0.16, 8, 64, Math.PI * 1.6),
    bronze,
    0,
    1.1,
    -0.25,
  );
  crescent.rotation.z = -0.3 * Math.PI;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const x = Math.sin(a) * 1.15,
      z = Math.cos(a) * 1.15;
    add(body, box, bronze, x, 0.03, z, 0.1, 0.5, 0.1);
    add(body, new CylinderGeometry(0, 0.12, 0.35, 6), magic, x, 0.45, z);
  }
  // Static masonry is batched; the grimoire and ritual rings remain articulated.
  const book = new Group();
  book.name = "orbital-living-grimoire";
  book.position.y = 0.85;
  book.rotation.z = -0.12;
  root.add(book);
  add(book, box, paper, 0, 0, 0, 1.05, 1.5, 0.24);
  for (const sign of [-1, 1]) {
    add(book, box, leather, 0, 0, sign * 0.15, 1.2, 1.65, 0.07);
    for (const side of [-1, 1]) {
      add(book, box, bronze, side * 0.48, 0, sign * 0.2, 0.025, 1.45, 0.025);
      add(book, box, bronze, 0, side * 0.68, sign * 0.2, 1, 0.025, 0.025);
    }
    const sigil = add(
      book,
      new TorusGeometry(0.31, 0.025, 6, 32),
      magic,
      0,
      0,
      sign * 0.21,
    );
    sigil.rotation.z = Math.PI / 4;
    add(book, box, bronze, 0, 0, sign * 0.21, 0.11, 0.72, 0.025).rotation.z =
      Math.PI / 4;
    add(book, box, bronze, 0, 0, sign * 0.21, 0.11, 0.72, 0.025).rotation.z =
      -Math.PI / 4;
  }
  add(book, box, bronze, -0.6, 0, 0, 0.08, 1.7, 0.38);
  const rings = new Group();
  rings.position.y = 0.8;
  root.add(rings);
  for (let i = 0; i < 3; i++) {
    const ring = add(
      rings,
      ringGeo,
      i === 1 ? glow : bronze,
      0,
      0,
      0,
      1 + i * 0.12,
    );
    ring.rotation.set(Math.PI / 2 + i * 0.68, i * 1.1, i * 0.45);
  }
  const dustGeo = new BufferGeometry(),
    dust: number[] = [];
  for (let i = 0; i < 40; i++) {
    const a = i * 2.39996,
      r = 1.8 + (i % 4) * 0.14;
    dust.push(Math.cos(a) * r, Math.sin(a * 3) * 0.65 + 0.8, Math.sin(a) * r);
  }
  dustGeo.setAttribute("position", new Float32BufferAttribute(dust, 3));
  const motes = new Points(
    dustGeo,
    new PointsMaterial({
      color: 0xbbefff,
      size: 0.065,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  root.add(motes);
  batchStaticVisual(body, root);
  let elapsed = 0;
  const place = () => {
    const angle = 0.72 + (elapsed * Math.PI * 2) / ORBITAL_PERIOD_SECONDS;
    root.position.set(
      Math.sin(angle) * ORBITAL_RADIUS,
      5.4 + Math.sin((elapsed * Math.PI) / 3) * 0.18,
      Math.cos(angle) * ORBITAL_RADIUS,
    );
    book.rotation.y = 0.3 + elapsed * 0.4;
    rings.rotation.y = elapsed * 0.12;
    rings.rotation.z = Math.sin(elapsed * 0.17) * 0.12;
    motes.rotation.y = -elapsed * 0.16;
    glow.opacity = 0.5 + Math.sin(elapsed * 1.4) * 0.16;
    // Update batched static children before picking/highlight, not only at render.
    root.updateMatrixWorld(true);
  };
  place();
  return {
    root,
    descriptor: {
      id: ORBITAL_ARENA_ID,
      label: "Lua do Arcanário · abrir Duelo Arcano",
    },
    update(deltaSeconds: number, reduced: boolean) {
      if (reduced) return;
      elapsed += Math.min(0.05, Math.max(0, deltaSeconds));
      place();
    },
  };
}
