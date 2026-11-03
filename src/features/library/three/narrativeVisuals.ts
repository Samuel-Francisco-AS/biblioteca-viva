import {
  BoxGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
  TorusGeometry,
  SphereGeometry,
  PointLight,
  type Object3D,
} from "three";
import type { NarrativeSnapshot } from "../narrative/contracts";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";
/** Fictional scenography. All resources attach to the building owner; one world RAF.
 * BF-4E objects are anchors only: no discovery variables, materials or actions are changed. */
export function createNarrativeVisuals(building: Object3D) {
  const root = new Group();
  root.name = "narrative-scenography";
  building.add(root);
  const box = new BoxGeometry(1, 1, 1);
  const sphere = new SphereGeometry(1, 12, 8);
  const brass = new MeshLambertMaterial({ color: 0xb99555 });
  const paper = new MeshLambertMaterial({ color: 0xeed5a5 });
  const ash = new MeshLambertMaterial({ color: 0x624249 });
  const petal = new MeshLambertMaterial({
    color: 0x8a8490,
    emissive: 0x181223,
  });
  const leaf = new MeshLambertMaterial({ color: 0x666d64 });
  const glow = new MeshBasicMaterial({
    color: 0xb68bea,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const colors = [0xa47ad7, 0xf5d68e, 0xe3a6cb, 0x86c7b0];
  function part(
    parent: Object3D,
    material: MeshLambertMaterial | MeshBasicMaterial,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    round = false,
  ) {
    const mesh = new Mesh(round ? sphere : box, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }
  function at(anchor: string, name: string, y = 1.08) {
    const placement = LIBRARY_FURNISHING.find((p) => p.id === anchor);
    const group = new Group();
    group.name = name;
    group.position.set(placement?.x ?? 0, y, placement?.z ?? 0);
    root.add(group);
    return group;
  }
  const pages = at("bf4-prop:15", "narrative-ashes");
  for (let i = 0; i < 4; i++) {
    const p = part(
      pages,
      i === 0 ? ash : paper,
      (i - 1.5) * 0.15,
      i * 0.025,
      0,
      0.33,
      0.012,
      0.45,
    );
    p.rotation.y = i * 0.28;
    for (let line = 0; line < 3; line++)
      part(
        pages,
        ash,
        (i - 1.5) * 0.15,
        i * 0.025 + 0.014,
        (line - 1) * 0.08,
        0.2,
        0.006,
        0.015,
      );
  }
  const atlas = at("bf4-prop:9", "narrative-atlas");
  atlas.position.x += 0.6;
  const cover = part(
    atlas,
    new MeshLambertMaterial({ color: 0x6b3546 }),
    0,
    0,
    0,
    0.7,
    0.08,
    0.55,
  );
  const left = part(atlas, paper, -0.17, 0.06, 0, 0.3, 0.025, 0.48);
  const right = part(atlas, paper, 0.17, 0.08, 0.06, 0.3, 0.025, 0.48);
  const suture = new Group();
  atlas.add(suture);
  for (let i = 0; i < 5; i++)
    part(suture, brass, 0, 0.09, (i - 2) * 0.085, 0.12, 0.012, 0.025);
  const plant = at("bf4-prop:13", "narrative-memory-flower", 1.5);
  part(plant, leaf, 0, -0.15, 0, 0.028, 0.4, 0.028);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const p = part(
      plant,
      petal,
      Math.cos(a) * 0.18,
      0.14,
      Math.sin(a) * 0.18,
      0.15,
      0.055,
      0.1,
      true,
    );
    p.rotation.y = -a;
    part(
      plant,
      leaf,
      Math.cos(a) * 0.2,
      -0.12,
      Math.sin(a) * 0.2,
      0.18,
      0.025,
      0.075,
      true,
    );
  }
  part(plant, brass, 0, 0.16, 0, 0.075, 0.07, 0.075, true);
  const window = new Mesh(new TorusGeometry(0.36, 0.015, 6, 32), glow);
  window.rotation.x = Math.PI / 2;
  window.position.y = 0.32;
  plant.add(window);
  const glyph = at("bf4-prop:13", "narrative-spell-glyph", 1.6);
  glyph.position.set(-14.9, 1.3, 7.1);
  const spellRing = new Mesh(
    new TorusGeometry(0.35, 0.018, 6, 28, Math.PI * 1.7),
    glow,
  );
  glyph.add(spellRing);
  const stars: Mesh[] = [];
  for (let i = 0; i < 3; i++)
    stars.push(
      part(
        glyph,
        brass,
        (i - 1) * 0.25,
        0.06 + Math.abs(i - 1) * 0.15,
        0,
        0.045,
        0.045,
        0.045,
      ),
    );
  const rift = new Group();
  rift.name = "narrative-lilac-rift";
  rift.position.set(0.8, 0.5, -0.5);
  root.add(rift);
  const seam = new Group();
  rift.add(seam);
  const seamGlow = glow.clone();
  for (let i = 0; i < 11; i++) {
    const shard = part(
      seam,
      seamGlow,
      Math.sin(i * 1.2) * 0.13,
      i * 0.2,
      0,
      0.08 + Math.sin(i * 0.4) * 0.045,
      0.25,
      0.07,
    );
    shard.rotation.z = Math.sin(i) * 0.35;
  }
  const halo = new Group();
  halo.position.y = 1;
  rift.add(halo);
  const arcs: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const arc = new Mesh(
      new TorusGeometry(0.85, 0.035, 8, 40, Math.PI * 0.4),
      new MeshBasicMaterial({ color: colors[i] }),
    );
    arc.rotation.z = (i * Math.PI) / 2;
    halo.add(arc);
    arcs.push(arc);
  }
  const light = new PointLight(0x9f6ccc, 0, 17, 1.6);
  light.position.y = 2.5;
  rift.add(light);
  const roomSignals = [
    at("bf4-prop:7", "narrative-echo-b", 2),
    at("bf4-prop:9", "narrative-support-c", 1.6),
    at("bf4-prop:12", "narrative-return-d", 1.8),
    at("bf4-prop:15", "narrative-heat-e", 1.7),
  ];
  roomSignals.forEach((g, i) => {
    const ring = new Mesh(
      new TorusGeometry(0.27, 0.022, 6, 24),
      new MeshBasicMaterial({ color: colors[i] }),
    );
    g.add(ring);
  });
  const clue = new Mesh(
    new TorusGeometry(0.52, 0.035, 8, 32),
    new MeshBasicMaterial({ color: 0xf6dc92 }),
  );
  clue.name = "narrative-inspection-marker";
  clue.rotation.x = -Math.PI / 2;
  root.add(clue);
  let elapsed = 0;
  return {
    root,
    update(
      state: NarrativeSnapshot | undefined,
      delta: number,
      reduced: boolean,
    ) {
      elapsed += delta;
      pages.visible = Boolean(state?.scenes.ashes);
      pages.children.forEach((p, i) => {
        p.rotation.z =
          state?.scenes.ashes === "restored" ? 0 : Math.sin(i) * 0.1;
      });
      atlas.visible = Boolean(state?.scenes.anatomy);
      const restored = state?.scenes.anatomy === "restored";
      cover.rotation.z = restored ? 0 : 0.09;
      right.rotation.z = restored ? 0 : -0.22;
      left.rotation.z = restored ? 0 : 0.1;
      suture.visible = restored;
      plant.visible = Boolean(state?.scenes.petals || state?.scenes.rift);
      const alive =
        state?.scenes.petals === "restored" ||
        state?.scenes.rift === "restored";
      const shifted =
        state?.scenes.rift === "experimental" &&
        state.facts.includes("rift:color-shift");
      seamGlow.color.set(shifted ? 0xe5a2c9 : 0xb68bea);
      petal.color.set(
        shifted
          ? 0xb18be0
          : alive
            ? state?.facts.includes("petals:silver")
              ? 0xd3b5de
              : 0xe99bc2
            : 0x8a8490,
      );
      leaf.color.set(alive ? 0x4f9869 : 0x666d64);
      window.visible = alive && Boolean(state?.facts.includes("petals:map"));
      plant.rotation.y = reduced ? 0 : Math.sin(elapsed * 0.5) * 0.05;
      glyph.visible = Boolean(state?.scenes.spell);
      spellRing.rotation.z = state?.scenes.spell === "restored" ? 0 : Math.PI;
      stars.forEach((p, i) => {
        p.position.y =
          state?.scenes.spell === "restored"
            ? 0.08
            : 0.12 + (reduced ? 0 : Math.sin(elapsed + i) * 0.08);
      });
      const stage = state?.scenes.rift;
      rift.visible = Boolean(stage);
      seam.visible = stage !== "restored";
      const closed = state?.facts.includes("rift:contained");
      halo.scale.setScalar(stage === "restored" ? 0.7 : 1);
      halo.rotation.z =
        reduced || stage === "restored" ? 0 : Math.sin(elapsed * 0.35) * 0.12;
      arcs.forEach((arc, i) => {
        arc.visible = !(stage === "restored" && closed && i > 1);
        if (arc.material instanceof MeshBasicMaterial)
          arc.material.color.set(
            stage === "restored" && closed ? 0xa4b8bd : colors[i],
          );
      });
      light.intensity =
        stage === "restored" ? 0 : stage === "experimental" ? 15 : 10;
      seam.scale.x = reduced ? 1 : 1 + Math.sin(elapsed * 1.5) * 0.12;
      roomSignals.forEach((g) => {
        g.visible = Boolean(stage && stage !== "restored");
      });
      clue.visible = Boolean(state?.inspection);
      if (state?.inspection) {
        const target = building.getObjectByName(state.inspection);
        if (target) {
          target.getWorldPosition(clue.position);
          root.worldToLocal(clue.position);
          clue.position.y += 1.8;
        } else clue.visible = false;
      }
    },
  };
}
