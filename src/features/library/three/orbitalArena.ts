import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  TorusGeometry,
  BoxGeometry,
} from "three";
export const ORBITAL_ARENA_ID = "portal:duelo-arcano";
/** Suspended outside walkable rooms: no new ground obstacle or speculative spatial data. */
export function createOrbitalArena() {
  const root = new Group();
  root.name = ORBITAL_ARENA_ID;
  root.position.set(0, 3, -10.4);
  const stone = new MeshStandardMaterial({
    color: 0x35344e,
    roughness: 0.7,
    metalness: 0.3,
  });
  const bronze = new MeshStandardMaterial({
    color: 0xc6a869,
    roughness: 0.35,
    metalness: 0.75,
  });
  const magic = new MeshBasicMaterial({ color: 0x9ceae8 });
  const base = new Mesh(new CylinderGeometry(1.6, 1.2, 0.45, 8), stone);
  root.add(base);
  const ringGeo = new TorusGeometry(1.35, 0.045, 6, 48);
  for (let i = 0; i < 3; i++) {
    const ring = new Mesh(ringGeo, i === 1 ? magic : bronze);
    ring.position.y = 1.1;
    ring.rotation.set(Math.PI / 2 + i * 0.7, i * 1.1, i * 0.45);
    root.add(ring);
  }
  const crystal = new Mesh(new OctahedronGeometry(0.5), magic);
  crystal.position.y = 1.1;
  crystal.scale.y = 1.7;
  root.add(crystal);
  const pillarGeo = new BoxGeometry(0.2, 0.9, 0.2);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const pillar = new Mesh(pillarGeo, bronze);
    pillar.position.set(Math.sin(a) * 1.3, 0.5, Math.cos(a) * 1.3);
    root.add(pillar);
  }
  root.userData.kind = "duel-portal";
  return {
    root,
    descriptor: {
      id: ORBITAL_ARENA_ID,
      label: "Arena orbital · abrir Duelo Arcano",
    },
  };
}
