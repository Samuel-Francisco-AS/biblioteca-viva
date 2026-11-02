import {
  BoxGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
} from "three";
import type { CosmeticState } from "../inhabitantAgency";
/** Fictional practice folio, owned and disposed with the building. No selectable record. */
export function createInhabitantSceneProps(building: Object3D) {
  const root = new Group();
  root.name = "inhabitants-practice-folio";
  root.position.set(-14.9, 1.02, 7.1);
  building.add(root);
  const geometry = new BoxGeometry(1, 1, 1);
  const paper = new MeshLambertMaterial({ color: 0xefdcaa });
  const cover = new MeshLambertMaterial({ color: 0x50305d });
  const light = new MeshLambertMaterial({
    color: 0xd6eab6,
    emissive: 0x365f33,
  });
  const base = new Mesh(geometry, cover);
  base.scale.set(0.65, 0.045, 0.5);
  root.add(base);
  const pages = new Group();
  root.add(pages);
  for (let i = 0; i < 3; i++) {
    const page = new Mesh(geometry, paper);
    page.scale.set(0.58, 0.012, 0.43);
    page.position.y = 0.035 + i * 0.015;
    pages.add(page);
  }
  const motes = new Group();
  root.add(motes);
  for (let i = 0; i < 6; i++) {
    const mote = new Mesh(geometry, light);
    mote.scale.setScalar(0.035);
    mote.position.set(
      Math.cos((i * Math.PI) / 3) * 0.5,
      0.15,
      Math.sin((i * Math.PI) / 3) * 0.4,
    );
    motes.add(mote);
  }
  let elapsed = 0;
  return {
    update(state: CosmeticState, delta: number, reduced: boolean) {
      elapsed += delta;
      paper.color.set(
        state === "damaged-cosmetic"
          ? 0x856347
          : state === "repairing"
            ? 0xd6eab6
            : 0xefdcaa,
      );
      pages.children.forEach((page, i) => {
        const target = state === "damaged-cosmetic" ? (i - 1) * 0.35 : 0;
        page.rotation.z = reduced
          ? target
          : page.rotation.z +
            (target - page.rotation.z) * Math.min(1, delta * 4);
      });
      motes.visible = state === "repairing";
      motes.rotation.y = reduced ? 0 : elapsed * 0.65;
    },
  };
}
