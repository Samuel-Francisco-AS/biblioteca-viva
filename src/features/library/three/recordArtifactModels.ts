import {
  Box3,
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from "three";
import { furnitureBlock } from "./furnitureGeometry";
import type {
  LibraryRecordModelTypeId,
  ProceduralLibraryRecordDimensions,
} from "./libraryRecordDimensions";

/** Original small prop designs. Native code assets, not decorative room furniture.
 * A shared five-material language: lacquer, patinated brass, parchment, ink, crystal. */
export function createRecordArtifact(
  type: LibraryRecordModelTypeId,
  dimensions: Readonly<ProceduralLibraryRecordDimensions>,
) {
  const root = new Group(),
    model = new Group();
  root.add(model);
  const palette = {
    body: new MeshStandardMaterial({
      color:
        type === "series-record"
          ? 0x543748
          : type === "physical-activity-record"
            ? 0x304a48
            : 0x315c59,
      roughness: 0.64,
      metalness: 0.12,
    }),
    brass: new MeshStandardMaterial({
      color: 0xc2a26b,
      roughness: 0.42,
      metalness: 0.6,
    }),
    paper: new MeshStandardMaterial({ color: 0xe8d7b6, roughness: 0.88 }),
    ink: new MeshStandardMaterial({
      color: 0x242a38,
      roughness: 0.7,
      metalness: 0.15,
    }),
    glow: new MeshStandardMaterial({
      color: 0x8cd8c9,
      emissive: 0x4d9f9a,
      emissiveIntensity: 0.35,
      roughness: 0.38,
      metalness: 0.2,
    }),
  };
  const box = new BoxGeometry(1, 1, 1),
    soft = furnitureBlock(0.065, type === "series-record" ? 4 : 2),
    cylinder = new CylinderGeometry(0.5, 0.5, 1, 16);
  const used = new Set<MeshStandardMaterial>(),
    geometries = new Set<BufferGeometry>();
  const add = (
    name: string,
    g: BufferGeometry,
    m: MeshStandardMaterial,
    x: number,
    y: number,
    z: number,
    w = 1,
    h = 1,
    d = 1,
  ) => {
    const mesh = new Mesh(g, m);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    model.add(mesh);
    used.add(m);
    geometries.add(g);
    return mesh;
  };
  const block = (
    name: string,
    m: MeshStandardMaterial,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    rounded = true,
  ) => add(name, rounded ? soft : box, m, x, y, z, w, h, d);
  const disc = (
    name: string,
    m: MeshStandardMaterial,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
  ) => add(name, cylinder, m, x, y, z, w, h, d);
  const arch = (
    name: string,
    m: MeshStandardMaterial,
    points: readonly (readonly [number, number, number])[],
    tube = 0.025,
  ) =>
    add(
      name,
      new TubeGeometry(
        new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
        20,
        tube,
        6,
        false,
      ),
      m,
      0,
      0,
      0,
    );
  const seal = (x: number, y: number, z: number, r = 0.09) => {
    add(
      "arcane-seal",
      new TorusGeometry(r, 0.012, 5, 20),
      palette.brass,
      x,
      y,
      z,
    );
    const jewel = block(
      "memory-crystal",
      palette.glow,
      x,
      y,
      z + 0.006,
      r * 0.7,
      r * 0.7,
      0.025,
    );
    jewel.rotation.z = Math.PI / 4;
  };
  switch (type) {
    case "movie-record": {
      block("projector-body", palette.body, 0, 0.46, -0.04, 0.89, 0.57, 0.29);
      block(
        "projector-brass-housing",
        palette.brass,
        0,
        0.46,
        0.115,
        0.76,
        0.43,
        0.035,
      );
      block("projector-inset", palette.ink, 0, 0.46, 0.137, 0.65, 0.33, 0.018);
      for (const x of [-0.5, 0.5])
        block("projector-foot", palette.ink, x, 0.055, 0, 0.296, 0.11, 0.48);
      for (const x of [-0.31, 0.31]) {
        add(
          "projector-reel",
          new TorusGeometry(0.205, 0.025, 4, 16),
          palette.brass,
          x,
          0.965,
          -0.03,
        );
        const hub = disc(
          "projector-hub",
          palette.ink,
          x,
          0.965,
          -0.03,
          0.09,
          0.08,
          0.09,
        );
        hub.rotation.x = Math.PI / 2;
        for (let i = 0; i < 3; i++) {
          const spoke = block(
            "reel-spoke",
            palette.body,
            x,
            0.965,
            -0.03,
            0.38,
            0.035,
            0.035,
            false,
          );
          spoke.rotation.z = (i * Math.PI) / 3;
        }
      }
      const lens = disc(
        "projector-lens-barrel",
        palette.ink,
        0.29,
        0.48,
        0.14,
        0.29,
        0.2,
        0.29,
      );
      lens.rotation.x = Math.PI / 2;
      const rim = disc(
        "projector-lens-rim",
        palette.brass,
        0.29,
        0.48,
        0.228,
        0.31,
        0.025,
        0.31,
      );
      rim.rotation.x = Math.PI / 2;
      const glass = disc(
        "projector-lens-crystal",
        palette.glow,
        0.29,
        0.48,
        0.244,
        0.235,
        0.009,
        0.235,
      );
      glass.rotation.x = Math.PI / 2;
      block(
        "projector-film-thread",
        palette.ink,
        0,
        0.72,
        -0.02,
        0.65,
        0.045,
        0.04,
        false,
      );
      // Solid emissive memory image: no light, transparency, postprocess or frame work.
      palette.glow.emissiveIntensity = 1.25;
      const memory = block(
        "projector-memory-frame",
        palette.brass,
        -0.18,
        0.46,
        0.17,
        0.32,
        0.23,
        0.025,
      );
      memory.rotation.z = -0.08;
      block(
        "projector-luminous-frame",
        palette.glow,
        -0.18,
        0.46,
        0.188,
        0.27,
        0.18,
        0.012,
        false,
      );
      for (const x of [-0.29, -0.07])
        for (const y of [0.4, 0.51])
          block(
            "film-perforation",
            palette.ink,
            x,
            y,
            0.197,
            0.025,
            0.025,
            0.01,
            false,
          );
      seal(0.05, 0.65, 0.153, 0.045);
      break;
    }
    case "series-record": {
      block("series-bakelite-case", palette.body, 0, 0.57, 0, 1.1, 0.77, 0.36);
      block(
        "series-screen-frame",
        palette.brass,
        -0.1,
        0.59,
        0.183,
        0.8,
        0.56,
        0.04,
      );
      block(
        "series-curved-glass",
        palette.ink,
        -0.1,
        0.59,
        0.211,
        0.71,
        0.47,
        0.024,
      );
      for (let i = 0; i < 3; i++) {
        block(
          "series-episode-marker",
          palette.glow,
          -0.33 + i * 0.23,
          0.54,
          0.23,
          0.17,
          0.035,
          0.008,
          false,
        );
        block(
          "series-episode-line",
          palette.brass,
          -0.33 + i * 0.23,
          0.64,
          0.229,
          0.13,
          0.012,
          0.01,
          false,
        );
      }
      for (const y of [0.48, 0.73]) {
        const knob = disc(
          "series-tuning-dial",
          palette.brass,
          0.43,
          y,
          0.202,
          0.12,
          0.06,
          0.12,
        );
        knob.rotation.x = Math.PI / 2;
      }
      for (const x of [-0.46, 0.46])
        block("series-foot", palette.ink, x, 0.09, 0, 0.15, 0.18, 0.4);
      arch(
        "series-antenna-left",
        palette.brass,
        [
          [0, 0.94, 0],
          [-0.1, 1.08, 0],
          [-0.26, 1.23, 0],
        ],
        0.012,
      );
      arch(
        "series-antenna-right",
        palette.brass,
        [
          [0, 0.94, 0],
          [0.12, 1.1, 0],
          [0.26, 1.23, 0],
        ],
        0.012,
      );
      block(
        "series-chapter-binding",
        palette.brass,
        0,
        0.23,
        0.188,
        0.66,
        0.028,
        0.018,
        false,
      );
      seal(0, 0.81, 0.236, 0.045);
      break;
    }
    case "study-record": {
      // A personal research desk within the existing slot, with paired notebooks
      // and a suspended theorem crystal rather than a generic scenic table.
      block("study-desk-top", palette.body, 0, 0.65, 0, 1.232, 0.09, 0.8);
      block(
        "study-desk-edge",
        palette.brass,
        0,
        0.605,
        0,
        1.18,
        0.025,
        0.75,
        false,
      );
      for (const x of [-0.49, 0.49]) {
        for (const z of [-0.28, 0.28]) {
          block("study-desk-leg", palette.body, x, 0.3, z, 0.075, 0.6, 0.075);
          block(
            "study-brass-foot",
            palette.brass,
            x,
            0.04,
            z,
            0.09,
            0.08,
            0.09,
          );
        }
        block(
          "study-desk-stretcher",
          palette.brass,
          x,
          0.19,
          0,
          0.035,
          0.035,
          0.6,
          false,
        );
      }
      for (const side of [-1, 1]) {
        block(
          "study-notebook-cover",
          palette.ink,
          side * 0.19 - 0.13,
          0.72,
          0.06,
          0.35,
          0.045,
          0.44,
        );
        block(
          "study-open-pages",
          palette.paper,
          side * 0.18 - 0.13,
          0.75,
          0.06,
          0.33,
          0.025,
          0.41,
          false,
        );
        for (let line = 0; line < 3; line++)
          block(
            "study-ink-line",
            palette.body,
            side * 0.18 - 0.13,
            0.765,
            -0.04 + line * 0.09,
            0.23,
            0.005,
            0.012,
            false,
          );
      }
      block(
        "study-stacked-notebook",
        palette.body,
        0.31,
        0.72,
        -0.2,
        0.32,
        0.05,
        0.27,
      );
      block(
        "study-stacked-pages",
        palette.paper,
        0.31,
        0.754,
        -0.2,
        0.29,
        0.025,
        0.24,
        false,
      );
      disc("study-inkwell", palette.ink, 0.4, 0.77, 0.21, 0.11, 0.14, 0.11);
      const quill = block(
        "study-quill",
        palette.brass,
        0.39,
        0.9,
        0.21,
        0.018,
        0.24,
        0.018,
        false,
      );
      quill.rotation.z = -0.25;
      const crystal = block(
        "study-theorem-crystal",
        palette.glow,
        0.06,
        0.98,
        -0.19,
        0.1,
        0.1,
        0.1,
        false,
      );
      crystal.rotation.z = crystal.rotation.x = Math.PI / 4;
      const ring = add(
        "study-research-ring",
        new TorusGeometry(0.11, 0.009, 4, 16),
        palette.brass,
        0.06,
        0.98,
        -0.19,
      );
      ring.rotation.x = Math.PI / 2;
      break;
    }
    case "physical-activity-record": {
      // Two recognisable dumbbells on a compact two-tier display rack.
      block("training-rack-base", palette.body, 0, 0.045, 0, 0.92, 0.09, 0.8);
      for (const x of [-0.25, 0.25]) {
        const upright = block(
          "training-rack-upright",
          palette.body,
          x,
          0.52,
          -0.06,
          0.075,
          1,
          0.08,
        );
        upright.rotation.x = -0.32;
        for (const [y, z] of [
          [0.35, 0.18],
          [0.93, -0.13],
        ])
          block(
            "training-rack-cradle",
            palette.brass,
            x,
            y,
            z,
            0.11,
            0.07,
            0.23,
          );
      }
      const plateGeometry = new CylinderGeometry(0.5, 0.5, 1, 10);
      for (const [y, z] of [
        [0.46, 0.18],
        [1.04, -0.13],
      ]) {
        const handle = disc(
          "training-dumbbell-grip",
          palette.brass,
          0,
          y,
          z,
          0.065,
          0.82,
          0.065,
        );
        handle.rotation.z = Math.PI / 2;
        for (const side of [-1, 1]) {
          const plate = add(
            "training-dumbbell-plate",
            plateGeometry,
            palette.ink,
            side * 0.32,
            y,
            z,
            0.28,
            0.14,
            0.28,
          );
          plate.rotation.z = Math.PI / 2;
          const hub = disc(
            "training-dumbbell-collar",
            palette.brass,
            side * 0.41,
            y,
            z,
            0.105,
            0.025,
            0.105,
          );
          hub.rotation.z = Math.PI / 2;
        }
      }
      seal(0, 0.12, 0.38, 0.045);
      break;
    }
    case "work-record": {
      palette.body.color.setHex(0x553b48);
      block("work-tool-chest", palette.body, 0, 0.22, 0, 1.2, 0.44, 0.8);
      block("work-tool-tray", palette.ink, 0, 0.45, 0, 1.05, 0.04, 0.66);
      const lid = block(
        "work-open-lid",
        palette.body,
        0,
        0.72,
        -0.32,
        1.18,
        0.62,
        0.07,
      );
      lid.rotation.x = -0.18;
      const inset = block(
        "work-lid-inset",
        palette.ink,
        0,
        0.72,
        -0.269,
        1.01,
        0.45,
        0.018,
      );
      inset.rotation.x = -0.18;
      for (const x of [-0.5, 0.5]) {
        block(
          "work-chest-binding",
          palette.brass,
          x,
          0.22,
          0.405,
          0.045,
          0.4,
          0.02,
          false,
        );
        block(
          "work-lid-binding",
          palette.brass,
          x,
          0.73,
          -0.26,
          0.035,
          0.52,
          0.025,
          false,
        );
        block("work-chest-foot", palette.ink, x, 0.025, 0, 0.14, 0.05, 0.64);
      }
      for (const x of [-0.24, 0.24])
        block("work-latch", palette.brass, x, 0.36, 0.415, 0.08, 0.12, 0.025);
      const hammer = block(
        "work-mallet-shaft",
        palette.body,
        -0.36,
        0.65,
        0.04,
        0.05,
        0.4,
        0.05,
      );
      hammer.rotation.z = -0.22;
      block(
        "work-mallet-head",
        palette.brass,
        -0.4,
        0.85,
        0.04,
        0.26,
        0.13,
        0.13,
      );
      block(
        "work-chisel-grip",
        palette.body,
        0.37,
        0.61,
        -0.09,
        0.08,
        0.24,
        0.08,
      );
      block(
        "work-chisel-blade",
        palette.brass,
        0.37,
        0.8,
        -0.09,
        0.075,
        0.14,
        0.025,
        false,
      );
      block(
        "work-project-sheet",
        palette.paper,
        0,
        0.49,
        0.13,
        0.49,
        0.018,
        0.42,
        false,
      );
      for (let i = 0; i < 3; i++)
        block(
          "work-project-line",
          palette.body,
          -0.02,
          0.503,
          0.03 + i * 0.09,
          0.28 - i * 0.04,
          0.006,
          0.012,
          false,
        );
      const rule = block(
        "work-measuring-rule",
        palette.brass,
        0.02,
        0.53,
        0.25,
        0.62,
        0.025,
        0.04,
        false,
      );
      rule.rotation.y = -0.18;
      seal(0, 0.24, 0.416, 0.075);
      break;
    }
  }
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model),
    size = bounds.getSize(new Vector3()),
    center = bounds.getCenter(new Vector3());
  const scale: readonly [number, number, number] = [
    dimensions.width / size.x,
    dimensions.height / size.y,
    dimensions.depth / size.z,
  ];
  model.scale.set(...scale);
  model.position.set(
    -center.x * scale[0],
    -bounds.min.y * scale[1],
    -center.z * scale[2],
  );
  for (const material of Object.values(palette))
    if (!used.has(material)) material.dispose();
  for (const geometry of [box, soft, cylinder])
    if (!geometries.has(geometry)) geometry.dispose();
  root.updateMatrixWorld(true);
  return { root, scale, materials: [...used] };
}
