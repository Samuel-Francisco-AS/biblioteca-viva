import {
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  Group,
  Mesh,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  type BufferGeometry,
  type Object3D,
} from "three";
import { createLibraryBuildingMaterials } from "./libraryBuildingMaterials";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";

function isFurnitureMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, MeshLambertMaterial> {
  return (
    object instanceof Mesh && object.material instanceof MeshLambertMaterial
  );
}

/** All shared resources belong exclusively to this returned root; no cross-mount cache. */
export function createLibraryFurnishing(interactive = false): Group {
  const root = new Group();
  root.name = "bf4-furnishing";
  const m = createLibraryBuildingMaterials();
  const geometries = {
    box: new BoxGeometry(1, 1, 1),
    round: new CylinderGeometry(0.5, 0.5, 1, 12),
    pot: new CylinderGeometry(0.5, 0.34, 1, 10),
    shade: new CylinderGeometry(0.25, 0.5, 1, 12),
    leaf: new SphereGeometry(0.5, 8, 5),
  };
  for (const placement of LIBRARY_FURNISHING) {
    const island = new Group();
    island.name = placement.id;
    island.userData = { roomId: placement.roomId, kind: placement.kind };
    island.position.set(placement.x, 0, placement.z);
    island.rotation.y = placement.rotation;
    root.add(island);
    const upholstery =
      placement.roomId === "room-b" || placement.roomId === "room-a"
        ? m.burgundy
        : m.green;
    function part(
      shape: keyof typeof geometries,
      material: MeshLambertMaterial,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
    ) {
      const mesh = new Mesh(geometries[shape], material);
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      island.add(mesh);
      return mesh;
    }
    function legs(x: number, z: number, w: number, d: number, h: number) {
      for (const dx of [-w / 2 + 0.1, w / 2 - 0.1])
        for (const dz of [-d / 2 + 0.1, d / 2 - 0.1])
          part("round", m.timber, x + dx, h / 2, z + dz, 0.1, h, 0.1);
    }
    function lamp(x: number, z: number, base: number) {
      part("round", m.brass, x, base + 0.035, z, 0.36, 0.07, 0.36);
      part("round", m.brass, x, base + 0.36, z, 0.055, 0.65, 0.055);
      part("shade", m.plaster, x, base + 0.73, z, 0.58, 0.35, 0.58);
      part("round", m.brass, x, base + 0.91, z, 0.16, 0.04, 0.16);
    }
    function rug(w: number, d: number) {
      part("box", m.brass, 0, 0.012, 0, w, 0.024, d);
      part("box", upholstery, 0, 0.028, 0, w - 0.15, 0.012, d - 0.15);
      for (const x of [-w / 2 + 0.25, w / 2 - 0.25])
        part("box", m.plaster, x, 0.038, 0, 0.035, 0.008, d - 0.4);
    }
    function chair(x: number, z: number, facing: number, soft = false) {
      const w = soft ? 0.9 : 0.55;
      legs(x, z, w, 0.65, 0.42);
      part("box", m.timber, x, 0.44, z, w, 0.12, 0.68);
      const cushion = part("box", upholstery, x, 0.53, z, w - 0.08, 0.13, 0.6);
      if (interactive && placement.id === "bf4-prop:6" && x === -1)
        cushion.name = "living-seat-cushion";
      const back = part(
        "box",
        soft ? upholstery : m.oak,
        x,
        0.85,
        z + facing * 0.29,
        w,
        0.66,
        0.14,
      );
      back.rotation.x = facing * -0.12;
      if (soft)
        for (const dx of [-0.4, 0.4])
          part("box", m.timber, x + dx, 0.68, z, 0.12, 0.15, 0.74);
      else
        for (const dx of [-0.2, 0.2])
          part(
            "round",
            m.brass,
            x + dx,
            0.84,
            z + facing * 0.38,
            0.035,
            0.4,
            0.035,
          );
    }
    switch (placement.kind) {
      case "study":
        rug(3.4, 2.8);
        legs(0, 0, 2.3, 0.95, 0.76);
        part("box", m.timber, 0, 0.72, 0, 2.3, 0.18, 0.95);
        part("box", m.oakLight, 0, 0.84, 0, 2.45, 0.12, 1.08);
        for (const x of [-0.65, 0.65]) {
          chair(x, 1, 1);
          chair(x, -1, -1);
          part("box", m.burgundy, x, 0.92, 0.05, 0.43, 0.04, 0.34);
          const page = part("box", m.plaster, x, 0.947, 0.05, 0.39, 0.014, 0.3);
          if (interactive && placement.id === "bf4-prop:9" && x === -0.65)
            page.name = "living-book-page";
        }
        lamp(0, 0, 0.9);
        break;
      case "lounge":
        rug(3.4, 2.8);
        chair(-1, 0.35, 1, true);
        chair(1, 0.35, 1, true);
        part("round", m.timber, 0, 0.28, -0.3, 0.18, 0.56, 0.18);
        part("round", m.oakLight, 0, 0.6, -0.3, 0.9, 0.12, 0.9);
        part("box", m.green, 0, 0.69, -0.3, 0.4, 0.06, 0.3);
        lamp(1.2, -0.9, 0.04);
        break;
      case "bench":
        legs(0, 0, 1.8, 0.65, 0.44);
        part("box", m.oak, 0, 0.45, 0, 1.9, 0.15, 0.7);
        part("box", upholstery, 0, 0.56, 0, 1.7, 0.12, 0.6);
        for (const x of [-0.9, 0.9])
          part("box", m.timber, x, 0.68, 0, 0.1, 0.15, 0.7);
        break;
      case "cabinet":
        legs(0, 0, 1.8, 0.55, 0.18);
        part("box", m.timber, 0, 0.55, 0.22, 1.8, 0.8, 0.1);
        for (const y of [0.2, 0.62, 1.04])
          part("box", m.oak, 0, y, 0, 1.9, 0.1, 0.6);
        for (const x of [-0.85, 0.85])
          part("box", m.timber, x, 0.62, 0, 0.12, 0.9, 0.55);
        for (let i = 0; i < 7; i++)
          part(
            "box",
            i % 2 ? m.burgundy : m.green,
            -0.6 + i * 0.18,
            0.41,
            0,
            0.13,
            0.3,
            0.32,
          );
        lamp(0.5, 0, 1.09);
        break;
      case "plant":
        part("pot", m.oak, 0, 0.25, 0, 0.62, 0.5, 0.62);
        part("round", m.brass, 0, 0.46, 0, 0.64, 0.08, 0.64);
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          part(
            "round",
            m.timber,
            Math.sin(angle) * 0.12,
            0.7,
            Math.cos(angle) * 0.12,
            0.04,
            0.7,
            0.04,
          );
          const leaf = part(
            "leaf",
            m.green,
            Math.sin(angle) * 0.25,
            1 + (i % 2) * 0.2,
            Math.cos(angle) * 0.25,
            0.4,
            0.85,
            0.25,
          );
          leaf.rotation.z = Math.sin(angle) * 0.5;
          if (interactive && placement.id === "bf4-prop:13")
            leaf.name = `living-leaf-${i}`;
        }
    }
  }
  // Same batching strategy as BF-4B, per geometry/material; metadata groups remain for inspection.
  root.updateMatrixWorld(true);
  const batches = new Map<
    BufferGeometry,
    Map<MeshLambertMaterial, Mesh<BufferGeometry, MeshLambertMaterial>[]>
  >();
  root.traverse((object) => {
    if (!isFurnitureMesh(object) || object.name.startsWith("living-")) return;
    const materials =
      batches.get(object.geometry) ??
      new Map<
        MeshLambertMaterial,
        Mesh<BufferGeometry, MeshLambertMaterial>[]
      >();
    const parts = materials.get(object.material) ?? [];
    parts.push(object);
    materials.set(object.material, parts);
    batches.set(object.geometry, materials);
  });
  for (const [geometry, materials] of batches)
    for (const [material, parts] of materials) {
      const batch = new InstancedMesh(geometry, material, parts.length);
      batch.name = "bf4-furniture-details";
      batch.userData.placements = parts.map((part) => part.parent?.name);
      parts.forEach((part, index) => {
        batch.setMatrixAt(index, new Matrix4().copy(part.matrixWorld));
        part.removeFromParent();
      });
      batch.computeBoundingBox();
      batch.computeBoundingSphere();
      root.add(batch);
    }
  const usedMaterials = new Set(
    [...batches.values()].flatMap((values) => [...values.keys()]),
  );
  for (const material of Object.values(m))
    if (!usedMaterials.has(material)) material.dispose();
  for (const geometry of Object.values(geometries))
    if (!batches.has(geometry)) geometry.dispose();
  return root;
}
