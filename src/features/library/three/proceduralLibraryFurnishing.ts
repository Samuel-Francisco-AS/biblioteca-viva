import {
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
  Group,
  Mesh,
  InstancedMesh,
  Matrix4,
  MeshPhongMaterial,
  type BufferGeometry,
  type Object3D,
} from "three";
import { createFurnitureMaterials } from "./furnitureMaterials";
import {
  furnitureBlock,
  turnedProfile,
  archedPanel,
} from "./furnitureGeometry";
import {
  LIBRARY_FURNISHING,
  furnitureLamp,
  FURNITURE_DIMENSIONS,
} from "./libraryFurnishingLayout";

function isFurnitureMesh(
  object: Object3D,
): object is Mesh<BufferGeometry, MeshPhongMaterial> {
  return object instanceof Mesh && object.material instanceof MeshPhongMaterial;
}

/** Authored furniture; resources are shared only inside this single disposable owner. */
export function createLibraryFurnishing(interactive = false): Group {
  const root = new Group();
  root.name = "bf4-furnishing";
  const m = createFurnitureMaterials();
  const geometries = {
    back: archedPanel(),
    box: new BoxGeometry(1, 1, 1),
    soft: furnitureBlock(0.12),
    edge: furnitureBlock(0.035),
    round: new CylinderGeometry(0.5, 0.5, 1, 16),
    pot: turnedProfile([
      [0, 0],
      [0.22, 0],
      [0.25, 0.06],
      [0.29, 0.12],
      [0.31, 0.35],
      [0.27, 0.43],
      [0.32, 0.46],
      [0.32, 0.51],
      [0.27, 0.51],
      [0.26, 0.45],
    ]),
    leg: turnedProfile([
      [0, 0],
      [0.055, 0],
      [0.07, 0.08],
      [0.045, 0.13],
      [0.04, 0.38],
      [0.075, 0.5],
      [0.065, 0.58],
      [0.06, 0.85],
      [0.08, 1],
      [0, 1],
    ]),
    shade: new CylinderGeometry(0.18, 0.31, 0.36, 16, 1, true),
    ring: new TorusGeometry(0.5, 0.025, 6, 24),
    leaf: new SphereGeometry(0.5, 12, 8),
  };
  const usedMaterials = new Set<MeshPhongMaterial>();
  const usedGeometries = new Set<BufferGeometry>();
  for (const p of LIBRARY_FURNISHING) {
    const island = new Group();
    island.name = p.id;
    island.userData = {
      roomId: p.roomId,
      kind: p.kind,
      identity:
        p.id === "bf4-prop:16"
          ? "artisan-workbench"
          : p.id === "bf4-prop:14"
            ? "training-bench"
            : p.kind,
    };
    island.position.set(p.x, 0, p.z);
    island.rotation.y = p.rotation;
    root.add(island);
    const upholstery =
      p.roomId === "room-b" || p.roomId === "room-a" ? m.burgundy : m.green;
    function part(
      shape: keyof typeof geometries,
      material: MeshPhongMaterial,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      name = shape as string,
    ) {
      const mesh = new Mesh(geometries[shape], material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      island.add(mesh);
      usedMaterials.add(material);
      usedGeometries.add(mesh.geometry);
      return mesh;
    }
    function ring(
      x: number,
      y: number,
      z: number,
      diameter: number,
      material = m.brass,
    ) {
      const r = part(
        "ring",
        material,
        x,
        y,
        z,
        diameter,
        diameter,
        diameter,
        "metal-collar",
      );
      r.rotation.x = Math.PI / 2;
      return r;
    }
    function legs(
      x: number,
      z: number,
      w: number,
      d: number,
      height: number,
      heavy = false,
    ) {
      for (const dx of [-w / 2 + 0.12, w / 2 - 0.12])
        for (const dz of [-d / 2 + 0.12, d / 2 - 0.12]) {
          part(
            "leg",
            m.timber,
            x + dx,
            0.04,
            z + dz,
            heavy ? 1.6 : 1,
            height - 0.04,
            heavy ? 1.6 : 1,
            "turned-leg",
          );
          part(
            "round",
            m.brass,
            x + dx,
            0.065,
            z + dz,
            0.13,
            0.055,
            0.13,
            "foot-ferrule",
          );
        }
    }
    function book(
      x: number,
      y: number,
      z: number,
      color = m.burgundy,
      turn = 0,
      width = 0.42,
    ) {
      // Scenic only: no record ID, no slot and no independent selectable.
      const parts = [
        part(
          "edge",
          color,
          x,
          y + 0.012,
          z,
          width,
          0.024,
          0.32,
          "scenic-book-cover",
        ),
        part(
          "box",
          m.paper,
          x,
          y + 0.047,
          z,
          width - 0.03,
          0.045,
          0.28,
          "scenic-book-pages",
        ),
        part(
          "edge",
          color,
          x,
          y + 0.08,
          z,
          width,
          0.02,
          0.32,
          "scenic-book-cover",
        ),
        part(
          "box",
          m.brass,
          x,
          y + 0.093,
          z,
          width * 0.35,
          0.006,
          0.025,
          "binding-title",
        ),
      ];
      parts.forEach((o) => (o.rotation.y = turn));
    }
    function rug(w: number, d: number) {
      part("edge", m.leather, 0, 0.012, 0, w, 0.024, d, "rug-binding");
      part(
        "box",
        upholstery,
        0,
        0.029,
        0,
        w - 0.12,
        0.014,
        d - 0.12,
        "woven-rug",
      );
      for (const x of [-w / 2 + 0.22, w / 2 - 0.22])
        part(
          "box",
          m.plaster,
          x,
          0.04,
          0,
          0.025,
          0.006,
          d - 0.38,
          "woven-border",
        );
      for (const z of [-d / 2 + 0.2, d / 2 - 0.2])
        for (let i = -3; i <= 3; i++) {
          const stitch = part(
            "box",
            m.brass,
            i * 0.22,
            0.041,
            z,
            0.07,
            0.006,
            0.07,
            "rug-lozenge",
          );
          stitch.rotation.y = Math.PI / 4;
        }
    }
    function chair(x: number, z: number, facing: number, soft = false) {
      const w = soft ? 0.88 : 0.55;
      legs(x, z, w, 0.65, 0.42);
      part("edge", m.timber, x, 0.44, z, w, 0.12, 0.68, "seat-frame");
      const cushion = part(
        "soft",
        upholstery,
        x,
        0.53,
        z,
        w - 0.08,
        0.13,
        0.6,
        "seat-cushion",
      );
      if (interactive && p.id === "bf4-prop:6" && x === -1)
        cushion.name = "living-seat-cushion";
      const backZ = z + facing * 0.29;
      const height = soft ? (p.roomId === "room-a" ? 0.69 : 0.84) : 0.6;
      part(
        "back",
        m.timber,
        x,
        0.87,
        backZ,
        w,
        height,
        0.18,
        "carved-back",
      ).rotation.x = -facing * 0.09;
      part(
        "back",
        soft ? upholstery : m.leather,
        x,
        0.89,
        backZ - facing * 0.09,
        w - 0.12,
        height - 0.14,
        0.1,
        "back-inset",
      );
      for (const dx of [-w * 0.38, w * 0.38]) {
        part(
          "leg",
          m.timber,
          x + dx,
          0.48,
          backZ,
          0.65,
          0.7,
          0.65,
          "back-post",
        );
        if (soft) {
          part(
            "soft",
            m.timber,
            x + dx,
            0.71,
            z,
            0.13,
            0.16,
            0.73,
            "rolled-arm",
          );
          part(
            "soft",
            upholstery,
            x + dx,
            0.77,
            z - 0.04,
            0.12,
            0.09,
            0.5,
            "arm-pad",
          );
        }
      }
      if (soft) {
        for (const dx of [-0.19, 0, 0.19])
          part(
            "leaf",
            m.brass,
            x + dx,
            0.97,
            backZ - facing * 0.15,
            0.035,
            0.035,
            0.025,
            "tuft-button",
          );
        if (x === 1) {
          part(
            "soft",
            m.plaster,
            x + 0.22,
            0.62,
            z - 0.08,
            0.22,
            0.06,
            0.53,
            "folded-throw",
          );
          part(
            "soft",
            m.plaster,
            x + 0.22,
            0.49,
            z - 0.34,
            0.22,
            0.24,
            0.04,
            "throw-drape",
          );
        }
      }
    }
    function lamp() {
      const a = furnitureLamp(p);
      if (!a) return;
      const { x, z, y } = a.local;
      part(
        "edge",
        m.stone,
        x,
        a.base + 0.035,
        z,
        0.37,
        0.07,
        0.37,
        "lamp-plinth",
      );
      part(
        "leg",
        m.brass,
        x,
        a.base + 0.07,
        z,
        1.2,
        a.height - 0.1,
        1.2,
        "lamp-turned-stem",
      );
      part(
        "leaf",
        m.green,
        x,
        a.base + a.height * 0.38,
        z,
        0.17,
        0.26,
        0.17,
        "lamp-patina-vase",
      );
      const shade = part(
        "shade",
        p.roomId === "room-c" ? m.green : m.plaster,
        x,
        y,
        z,
        1,
        1,
        1,
        "lamp-shade",
      );
      // Keep the emissive shade available to C; it is never baked into a batch.
      if (interactive) shade.name = `living-shade:${p.id}`;
      shade.material = shade.material.clone();
      ring(x, y - 0.18, z, 0.62);
      ring(x, y + 0.18, z, 0.36);
      part(
        "round",
        m.brass,
        x,
        y + 0.17,
        z,
        0.025,
        0.36,
        0.025,
        "shade-crossbar",
      ).rotation.z = Math.PI / 2;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const rib = part(
          "round",
          m.brass,
          x + Math.sin(a) * 0.245,
          y,
          z + Math.cos(a) * 0.245,
          0.012,
          0.38,
          0.012,
          "shade-rib",
        );
        rib.rotation.z = Math.sin(a) * 0.34;
        rib.rotation.x = -Math.cos(a) * 0.34;
      }
      part("leaf", m.brass, x, y + 0.22, z, 0.09, 0.1, 0.09, "lamp-finial");
    }
    switch (p.kind) {
      case "study": {
        const top = FURNITURE_DIMENSIONS.study;
        rug(3.4, 2.8);
        legs(0, 0, 2.25, 0.94, 0.78);
        part("edge", m.timber, 0, 0.73, 0, 2.3, 0.19, 0.95, "desk-apron");
        part(
          "edge",
          m.oakLight,
          0,
          top.top - 0.06,
          0,
          top.width,
          0.12,
          top.depth,
          "desk-top",
        );
        part(
          "box",
          m.leather,
          0,
          0.902,
          0,
          1.65,
          0.004,
          0.68,
          "writing-leather",
        );
        for (const x of [-0.65, 0.65]) {
          chair(x, 1, 1);
          // C is a two-reader desk; its rear working aisle must remain open
          // for the book handoff between the two ends of the tabletop.
          if (p.roomId !== "room-c") chair(x, -1, -1);
          part("edge", m.oak, x, 0.73, 0.49, 0.53, 0.12, 0.035, "desk-drawer");
          part(
            "round",
            m.brass,
            x,
            0.73,
            0.52,
            0.065,
            0.045,
            0.065,
            "drawer-pull",
          );
          if (p.id === "bf4-prop:9") {
            if (x < 0) {
              // Entire scenic volume is adopted by B; no duplicate cover remains behind.
              const cover = part(
                "edge",
                m.burgundy,
                x,
                0.92,
                0.05,
                0.43,
                0.04,
                0.34,
                "scenic-book-base",
              );
              const page = part(
                "box",
                m.paper,
                x,
                0.947,
                0.05,
                0.39,
                0.014,
                0.3,
                "scenic-book-page",
              );
              if (interactive) {
                cover.name = "living-book-base";
                page.name = "living-book-page";
              }
            }
          } else if (p.roomId !== "room-d" && !(p.id === "bf4-prop:0" && x > 0))
            book(x, 0.91, 0.04, upholstery, x * 0.1);
        }
        if (p.roomId === "room-c" || p.roomId === "room-a") {
          part("round", m.iron, -0.32, 0.95, -0.27, 0.1, 0.1, 0.1, "inkwell");
          part(
            "leaf",
            m.paper,
            -0.31,
            1.12,
            -0.27,
            0.065,
            0.28,
            0.025,
            "quill",
          ).rotation.z = -0.25;
          part("box", m.brass, 0.33, 0.912, -0.28, 0.38, 0.018, 0.035, "ruler");
        }
        lamp();
        break;
      }
      case "lounge":
        rug(3.4, 2.8);
        chair(-1, 0.35, 1, true);
        chair(1, 0.35, 1, true);
        part(
          "leg",
          m.timber,
          0,
          0.04,
          -0.3,
          2.8,
          0.54,
          2.8,
          "tea-table-pedestal",
        );
        part(
          "round",
          m.timber,
          0,
          0.07,
          -0.3,
          0.6,
          0.08,
          0.6,
          "tea-table-foot",
        );
        part(
          "round",
          m.oakLight,
          0,
          0.6,
          -0.3,
          0.9,
          0.12,
          0.9,
          "tea-table-top",
        );
        ring(0, 0.657, -0.3, 0.84);
        // Centre stays clear for D; E retains its BF-4E brazier.
        lamp();
        break;
      case "bench": {
        legs(0, 0, 1.8, 0.65, 0.44, p.roomId === "room-d");
        part("edge", m.timber, 0, 0.45, 0, 1.9, 0.15, 0.7, "bench-frame");
        part(
          "soft",
          p.roomId === "room-d" ? m.leather : upholstery,
          0,
          0.56,
          0,
          1.7,
          0.12,
          0.6,
          "bench-cushion",
        );
        for (const x of [-0.83, 0.83]) {
          if (p.roomId === "room-d") {
            part(
              "edge",
              m.timber,
              x,
              0.78,
              -0.19,
              0.14,
              1.48,
              0.18,
              "training-upright",
            );
            part(
              "edge",
              m.brass,
              x,
              1.25,
              -0.09,
              0.22,
              0.08,
              0.3,
              "barbell-cradle",
            );
          } else {
            part("soft", m.timber, x, 0.68, 0, 0.1, 0.15, 0.7, "bench-arm");
          }
        }
        if (p.roomId === "room-d") {
          const bar = part(
            "round",
            m.iron,
            0,
            1.32,
            -0.2,
            0.055,
            1.84,
            0.055,
            "training-bar",
          );
          bar.rotation.z = Math.PI / 2;
          for (const x of [-0.67, 0.67]) {
            const weight = part(
              "round",
              m.stone,
              x,
              1.32,
              -0.2,
              0.26,
              0.18,
              0.26,
              "stone-weight",
            );
            weight.rotation.z = Math.PI / 2;
            part(
              "edge",
              m.brass,
              x,
              0.57,
              0.22,
              0.12,
              0.015,
              0.12,
              "leather-strap",
            );
          }
        }
        break;
      }
      case "cabinet": {
        const work = p.roomId === "room-e";
        legs(0, 0, 1.8, 0.55, 0.2, work);
        part("box", m.timber, 0, 0.58, -0.24, 1.8, 0.8, 0.08, "cabinet-back");
        for (const y of [0.2, 0.62, 1.04])
          part(
            "edge",
            m.oak,
            0,
            y,
            0,
            1.9,
            0.1,
            0.6,
            y === 1.04 ? "cabinet-top" : "cabinet-shelf",
          );
        for (const x of [-0.85, 0.85])
          part("edge", m.timber, x, 0.62, 0, 0.12, 0.9, 0.55, "cabinet-stile");
        // Lower recessed doors frame the open display niche. E's upper drawer is dynamic.
        for (const x of [-0.41, 0.41]) {
          part("edge", m.oak, x, 0.42, 0.26, 0.76, 0.32, 0.055, "cabinet-door");
          part(
            "edge",
            work ? m.leather : upholstery,
            x,
            0.42,
            0.294,
            0.58,
            0.22,
            0.014,
            "door-inset",
          );
          part(
            "leaf",
            m.brass,
            x + 0.23,
            0.44,
            0.31,
            0.05,
            0.05,
            0.04,
            "door-knob",
          );
          for (const y of [0.32, 0.51])
            part(
              "box",
              m.brass,
              x - 0.34,
              y,
              0.296,
              0.035,
              0.05,
              0.02,
              "hinge",
            );
        }
        if (work) {
          part(
            "edge",
            m.leather,
            -0.05,
            1.095,
            0,
            0.65,
            0.01,
            0.46,
            "work-mat",
          );
          part(
            "box",
            m.timber,
            -0.12,
            1.13,
            -0.06,
            0.38,
            0.055,
            0.22,
            "repair-stock",
          ).rotation.y = -0.15;
          part(
            "round",
            m.oakLight,
            0.05,
            1.17,
            0.12,
            0.04,
            0.3,
            0.04,
            "mallet-handle",
          ).rotation.z = Math.PI / 2;
          part(
            "edge",
            m.iron,
            0.19,
            1.19,
            0.12,
            0.09,
            0.12,
            0.12,
            "mallet-head",
          );
          for (let i = 0; i < 4; i++)
            part(
              "box",
              m.brass,
              -0.3 + i * 0.1,
              1.135,
              0.04,
              0.015,
              0.018,
              0.09,
              "work-clamp",
            );
          part(
            "edge",
            m.iron,
            0.73,
            1.12,
            0.25,
            0.27,
            0.14,
            0.14,
            "bench-vice",
          );
          part(
            "round",
            m.brass,
            0.73,
            1.04,
            0.29,
            0.035,
            0.28,
            0.035,
            "vice-screw",
          ).rotation.z = Math.PI / 2;
          if (interactive) {
            part(
              "edge",
              m.oak,
              0,
              0.82,
              0,
              1.5,
              0.22,
              0.48,
              "living-cabinet-drawer",
            );
            part(
              "edge",
              m.brass,
              0,
              0.81,
              0.265,
              0.24,
              0.055,
              0.045,
              "living-cabinet-handle",
            );
          }
        } else {
          for (let i = 0; i < 5; i++) {
            const h = 0.2 + (i % 3) * 0.045;
            part(
              "edge",
              [m.burgundy, m.green, m.blue][i % 3],
              -0.55 + i * 0.2,
              0.67 + h / 2,
              -0.02,
              0.13 + (i % 2) * 0.025,
              h,
              0.3,
              "cabinet-scenic-spine",
            ).rotation.z = i === 4 ? -0.12 : 0;
            part(
              "box",
              m.brass,
              -0.55 + i * 0.2,
              0.73,
              0.175,
              0.1,
              0.018,
              0.008,
              "spine-band",
            );
          }
        }
        lamp();
        break;
      }
      case "plant":
        part("pot", m.stone, 0, 0, 0, 1, 1, 1, "carved-planter");
        ring(0, 0.47, 0, 0.61);
        part("round", m.timber, 0, 0.46, 0, 0.52, 0.03, 0.52, "soil");
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          part(
            "round",
            m.oak,
            Math.sin(angle) * 0.12,
            0.74,
            Math.cos(angle) * 0.12,
            0.025,
            0.55,
            0.025,
            "plant-stem",
          );
          const leaf = part(
            "leaf",
            i % 2 ? m.green : m.blue,
            Math.sin(angle) * 0.23,
            1 + (i % 2) * 0.16,
            Math.cos(angle) * 0.23,
            0.34,
            0.72,
            0.11,
            "plant-leaf",
          );
          leaf.rotation.z = Math.sin(angle) * 0.55;
          leaf.rotation.y = angle;
          if (interactive && p.id === "bf4-prop:13")
            leaf.name = `living-leaf-${i}`;
          if (i % 2 === 0)
            part(
              "leaf",
              m.burgundy,
              Math.sin(angle) * 0.17,
              1.28,
              Math.cos(angle) * 0.17,
              0.12,
              0.14,
              0.12,
              "flower-bud",
            );
        }
        break;
    }
  }
  // Same batching strategy as BF-4B, per geometry/material; metadata groups remain for inspection.
  root.updateMatrixWorld(true);
  const batches = new Map<
    BufferGeometry,
    Map<MeshPhongMaterial, Mesh<BufferGeometry, MeshPhongMaterial>[]>
  >();
  root.traverse((object) => {
    if (!isFurnitureMesh(object) || object.name.startsWith("living-")) return;
    const materials =
      batches.get(object.geometry) ??
      new Map<MeshPhongMaterial, Mesh<BufferGeometry, MeshPhongMaterial>[]>();
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
      batch.userData.parts = parts.map((part) => part.name);
      parts.forEach((part, index) => {
        batch.setMatrixAt(index, new Matrix4().copy(part.matrixWorld));
        part.removeFromParent();
      });
      batch.computeBoundingBox();
      batch.computeBoundingSphere();
      root.add(batch);
    }
  for (const material of Object.values(m))
    if (!usedMaterials.has(material)) material.dispose();
  for (const geometry of Object.values(geometries))
    if (!usedGeometries.has(geometry)) geometry.dispose();
  return root;
}
