import {
  Box3,
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from "three";
import { furnitureBlock, turnedProfile } from "./furnitureGeometry";
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
    soft = furnitureBlock(0.065),
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
          new TorusGeometry(0.205, 0.025, 6, 24),
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
      arch(
        "projector-film-thread",
        palette.ink,
        [
          [-0.31, 0.77, -0.02],
          [-0.42, 0.69, -0.02],
          [0.1, 0.71, -0.02],
          [0.31, 0.76, -0.02],
        ],
        0.028,
      );
      for (let i = 0; i < 3; i++)
        block(
          "film-perforation",
          palette.paper,
          -0.22 + i * 0.12,
          0.7,
          0.011,
          0.025,
          0.018,
          0.012,
          false,
        );
      seal(-0.2, 0.47, 0.153, 0.11);
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
      for (const side of [-1, 1]) {
        const cover = block(
          "study-open-cover",
          palette.body,
          side * 0.29,
          0.08,
          0,
          0.61,
          0.09,
          0.8,
        );
        cover.rotation.z = side * 0.11;
        const pages = block(
          "study-open-pages",
          palette.paper,
          side * 0.28,
          0.153,
          0,
          0.55,
          0.1,
          0.72,
        );
        pages.rotation.z = side * 0.11;
        for (let line = 0; line < 4; line++)
          block(
            "study-ink-line",
            palette.ink,
            side * 0.29,
            0.22,
            -0.2 + line * 0.11,
            0.34,
            0.008,
            0.012,
            false,
          );
      }
      block("study-spine-ribbon", palette.brass, 0, 0.105, 0, 0.05, 0.08, 0.79);
      disc("study-inkwell", palette.ink, 0.44, 0.31, -0.18, 0.18, 0.22, 0.18);
      const stem = block(
        "study-quill-stem",
        palette.brass,
        0.37,
        0.61,
        -0.18,
        0.018,
        0.62,
        0.018,
        false,
      );
      stem.rotation.z = -0.22;
      const feather = new Shape();
      feather.moveTo(0, 0);
      feather.quadraticCurveTo(-0.2, 0.23, 0.02, 0.49);
      feather.quadraticCurveTo(0.18, 0.23, 0, 0);
      const quill = add(
        "study-quill",
        new ExtrudeGeometry(feather, {
          depth: 0.012,
          bevelEnabled: false,
          curveSegments: 8,
        }),
        palette.paper,
        0.31,
        0.55,
        -0.18,
      );
      quill.rotation.z = -0.22;
      add(
        "study-research-ring",
        new TorusGeometry(0.12, 0.014, 5, 24),
        palette.brass,
        -0.39,
        0.38,
        -0.16,
      );
      seal(-0.39, 0.38, -0.14, 0.065);
      break;
    }
    case "physical-activity-record": {
      block("training-rolled-mat", palette.body, 0, 0.035, 0, 0.92, 0.07, 0.8);
      for (const z of [-0.35, 0.35]) {
        const roll = disc(
          "training-mat-roll",
          palette.ink,
          0,
          0.07,
          z,
          0.12,
          0.88,
          0.12,
        );
        roll.rotation.z = Math.PI / 2;
      }
      const bell = add(
        "training-kettlebell",
        turnedProfile([
          [0, 0],
          [0.24, 0],
          [0.39, 0.08],
          [0.46, 0.3],
          [0.43, 0.53],
          [0.24, 0.7],
          [0.16, 0.73],
          [0, 0.73],
        ]),
        palette.ink,
        0,
        0.07,
        0,
        1,
        1,
        0.54,
      );
      bell.userData.design = "cast-iron-training-weight";
      arch(
        "training-kettlebell-handle",
        palette.brass,
        [
          [-0.22, 0.65, 0],
          [-0.28, 0.98, 0],
          [0, 1.12, 0],
          [0.28, 0.98, 0],
          [0.22, 0.65, 0],
        ],
        0.045,
      );
      for (const x of [-0.24, 0.24])
        block(
          "training-handle-binding",
          palette.body,
          x,
          0.73,
          0,
          0.12,
          0.14,
          0.1,
        );
      seal(0, 0.42, 0.245, 0.11);
      break;
    }
    case "work-record": {
      block("work-tool-chest", palette.body, 0, 0.24, 0, 1.2, 0.48, 0.8);
      block(
        "work-leather-inset",
        palette.ink,
        0,
        0.24,
        0.405,
        1.06,
        0.29,
        0.02,
      );
      for (const x of [-0.5, 0.5])
        block(
          "work-chest-binding",
          palette.brass,
          x,
          0.24,
          0.422,
          0.055,
          0.42,
          0.02,
          false,
        );
      arch(
        "work-carry-handle",
        palette.brass,
        [
          [-0.28, 0.47, 0],
          [-0.28, 0.89, 0],
          [0, 1.025, 0],
          [0.28, 0.89, 0],
          [0.28, 0.47, 0],
        ],
        0.025,
      );
      const hammer = block(
        "work-mallet-shaft",
        palette.body,
        -0.35,
        0.65,
        -0.16,
        0.05,
        0.5,
        0.05,
      );
      hammer.rotation.z = -0.18;
      block(
        "work-mallet-head",
        palette.brass,
        -0.4,
        0.89,
        -0.16,
        0.28,
        0.14,
        0.12,
      );
      const roll = disc(
        "work-blueprint-scroll",
        palette.paper,
        0.37,
        0.59,
        0.04,
        0.14,
        0.54,
        0.14,
      );
      roll.rotation.x = Math.PI / 2;
      for (const z of [-0.15, 0.23]) {
        const band = disc(
          "work-scroll-binding",
          palette.brass,
          0.37,
          0.59,
          z,
          0.15,
          0.035,
          0.15,
        );
        band.rotation.x = Math.PI / 2;
      }
      block(
        "work-project-sheet",
        palette.paper,
        0,
        0.49,
        0.11,
        0.54,
        0.018,
        0.48,
        false,
      );
      for (let i = 0; i < 3; i++)
        block(
          "work-project-line",
          palette.body,
          -0.04,
          0.503,
          -0.05 + i * 0.1,
          0.28 - i * 0.04,
          0.008,
          0.012,
          false,
        );
      seal(0, 0.25, 0.437, 0.1);
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
