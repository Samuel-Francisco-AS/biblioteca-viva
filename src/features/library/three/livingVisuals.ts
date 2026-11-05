import {
  BoxGeometry,
  TorusGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  SphereGeometry,
  PointLight,
  HemisphereLight,
  DirectionalLight,
  type Scene,
} from "three";
import type { AgentView } from "../inhabitantAgency";
import {
  LIVING_OBJECTS,
  type LivingSession,
  type Atmosphere,
} from "../livingObjects";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { LIBRARY_FURNISHING } from "./libraryFurnishingLayout";
/** Resources are attached to the building owner before use, and disposed with it. */
export function createLivingVisuals(
  building: Group,
  scene: Scene,
  session: LivingSession,
) {
  const root = new Group();
  root.name = "living-objects";
  building.add(root);
  const box = new BoxGeometry(1, 1, 1),
    sphere = new SphereGeometry(0.5, 12, 8);
  const wood = new MeshLambertMaterial({ color: 0x673f2d });
  const brass = new MeshLambertMaterial({ color: 0xd7af58 });
  const paper = new MeshLambertMaterial({ color: 0xf3dfaa });
  const green = new MeshLambertMaterial({ color: 0x416947 });
  const glow = new MeshLambertMaterial({ color: 0xffb64c, emissive: 0xff6800 });
  const selectables = LIVING_OBJECTS.map((object) => {
    const group = new Group();
    group.name = object.objectId;
    const placement = LIBRARY_FURNISHING.find((p) => p.id === object.anchor);
    group.position.set(placement?.x ?? -4.5, 0, placement?.z ?? -2);
    root.add(group);
    function part(
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      material = brass,
      round = false,
    ) {
      const mesh = new Mesh(round ? sphere : box, material);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, y, z);
      group.add(mesh);
      return mesh;
    }
    const moving = new Group();
    group.add(moving);
    let light: PointLight | undefined;
    function adopt(name: string, parent: Group) {
      const piece = building.getObjectByName(name);
      if (piece) {
        building.updateMatrixWorld(true);
        parent.attach(piece);
      }
    }
    switch (object.family) {
      case "lamp":
        part(0.32, 0.04, 0.32, 0, 1.43, 0);
        light = new PointLight(0xffc878, 0, 7, 1.5);
        light.position.set(0, 1.65, 0);
        group.add(light);
        moving.add(part(0.28, 0.2, 0.28, 0, 1.55, 0, glow, true));
        break;
      case "table":
        moving.position.set(0.65, 0.97, -0.15);
        moving.add(part(0.65, 0.02, 0.35, 0, 0, 0.175, paper));
        part(0.05, 0.025, 0.25, 0.65, 0.99, 0, brass);
        break;
      case "book":
        group.position.x -= 0.65;
        moving.position.set(-0.22, 0.99, 0.05);
        {
          const cover = part(0.44, 0.025, 0.34, 0.22, 0, 0, wood);
          moving.add(cover);
        }
        {
          const pages = new Group();
          pages.name = "living-page-pivot";
          pages.position.set(-0.2, 0.96, -0.1);
          group.add(pages);
          adopt("living-book-page", pages);
        }
        break;
      case "seat":
        group.position.x -= 1;
        group.position.z += 0.35;
        moving.position.y = 0.47;
        adopt("living-seat-cushion", moving);
        break;
      case "cabinet":
        moving.add(part(1.5, 0.22, 0.48, 0, 0.82, -0.02, wood));
        part(0.18, 0.18, 0.18, 0, 0.75, 0, brass, true);
        break;
      case "plant":
        moving.add(part(0.2, 0.2, 0.2, 0, 1.45, 0, paper, true));
        for (let i = 0; i < 5; i++) adopt(`living-leaf-${i}`, group);
        break;
      case "clock":
        part(0.6, 0.6, 0.04, -0.5, 1.5, 0.1, paper, true);
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          part(
            0.035,
            0.035,
            0.025,
            -0.5 + Math.sin(a) * 0.24,
            1.5 + Math.cos(a) * 0.24,
            0.13,
          );
        }
        part(0.7, 0.75, 0.15, -0.5, 1.5, 0, wood);
        moving.position.set(-0.5, 1.5, 0.15);
        {
          const hand = part(0.04, 0.28, 0.03, 0, 0.12, 0);
          moving.add(hand);
        }
        break;
      case "globe":
        group.position.x += 0.65;
        moving.position.y = 1.2;
        moving.add(part(0.52, 0.52, 0.52, 0, 0, 0, green, true));
        {
          const mark = part(0.07, 0.12, 0.05, 0, 0, 0.26);
          moving.add(mark);
        }
        {
          const ring = new Mesh(new TorusGeometry(0.28, 0.015, 6, 24), brass);
          ring.rotation.x = Math.PI / 2;
          moving.add(ring);
        }
        part(0.18, 0.24, 0.18, 0, 0.98, 0);
        break;
      case "hearth":
        group.position.z += 0.3;
        part(0.5, 0.1, 0.5, 0, 0.72, 0, wood);
        {
          const flame = new Mesh(new ConeGeometry(0.14, 0.4, 7), glow);
          flame.position.set(0, 0.95, 0);
          moving.add(flame);
        }
        light = new PointLight(0xff8738, 0, 6, 1.5);
        light.position.set(0, 1.15, 0);
        group.add(light);
        break;
      case "shelf":
        {
          const shelf = LIBRARY_SHELVES.find(
            (s) => s.identity.instanceId === object.anchor,
          );
          if (shelf)
            group.position.set(shelf.position[0], 2.4, shelf.position[2] + 0.3);
        }
        {
          const star = part(0.2, 0.2, 0.04, 0, 0, 0);
          star.rotation.z = Math.PI / 4;
          moving.add(star);
        }
        moving.add(part(0.12, 0.12, 0.05, 0, 0, 0, paper));
        break;
    }
    return {
      descriptor: { id: object.objectId, label: object.label },
      root: group,
      object,
      moving,
      light,
    };
  });
  const sparks = new Group();
  root.add(sparks);
  for (const item of selectables) {
    for (let i = 0; i < 3; i++) {
      const spark = new Mesh(box, brass);
      spark.scale.setScalar(0.035);
      spark.position.copy(item.root.position);
      spark.position.x += (i - 1) * 0.3;
      spark.position.y = 1.7 + i * 0.15;
      spark.userData.baseY = spark.position.y;
      sparks.add(spark);
    }
  }
  let elapsed = 0;
  const book = selectables.find(
    (item) => item.object.objectId === "living:book",
  );
  const bookRestPosition = book?.root.position.clone();
  const bookRestRotation = book?.moving.rotation.clone();
  return {
    selectables,
    update(delta: number, reduced: boolean, narrativeAtmosphere?: Atmosphere) {
      delta = Number.isFinite(delta) ? Math.min(Math.max(delta, 0), 0.05) : 0;
      elapsed += delta;
      const state = session.getSnapshot();
      const atmosphere = narrativeAtmosphere ?? state.atmosphere;
      sparks.visible = atmosphere === "encantada";
      sparks.children.forEach((spark, index) => {
        const y: unknown = spark.userData.baseY;
        if (typeof y === "number")
          spark.position.y =
            y + (reduced ? 0 : Math.sin(elapsed + index) * 0.12);
      });
      for (const item of selectables) {
        const value = state.objects[item.object.objectId];
        if (!value) continue;
        const target = value.active ? 1 : 0;
        const approach = (current: number, next: number) =>
          reduced ? next : current + (next - current) * Math.min(1, delta * 9);
        switch (item.object.family) {
          case "lamp":
            if (item.light)
              item.light.intensity = target * (5 + (value.turns % 3) * 3);
            item.moving.visible = value.active;
            break;
          case "hearth":
            if (item.light) item.light.intensity = target * 8;
            item.moving.visible = value.active;
            item.moving.scale.y = reduced
              ? 1
              : 1 + 0.12 * Math.sin(elapsed * 5);
            break;
          case "book":
            {
              const pages = item.root.getObjectByName("living-page-pivot");
              if (pages)
                pages.rotation.x = approach(
                  pages.rotation.x,
                  value.active ? -(value.turns % 2) * 2.4 : 0,
                );
            }
            item.moving.rotation.z = approach(
              item.moving.rotation.z,
              target * 2.1,
            );
            item.moving.rotation.x = reduced
              ? 0
              : Math.sin(value.turns + elapsed) * 0.04 * target;
            break;
          case "cabinet":
            item.moving.position.z = approach(
              item.moving.position.z,
              target * 0.42,
            );
            break;
          case "seat":
            item.moving.scale.y = approach(
              item.moving.scale.y,
              value.active ? 0.65 : 1,
            );
            break;
          case "plant":
            item.moving.visible = value.active || atmosphere === "encantada";
            item.moving.rotation.z = reduced ? 0 : Math.sin(elapsed * 2) * 0.12;
            item.root.children.forEach((child) => {
              if (child.name.startsWith("living-leaf-"))
                child.rotation.x =
                  reduced || !value.active ? 0 : Math.sin(elapsed * 2) * 0.18;
            });
            break;
          case "clock":
            item.moving.rotation.z = approach(
              item.moving.rotation.z,
              (-value.turns * Math.PI) / 3,
            );
            break;
          case "globe":
            item.moving.rotation.y = approach(
              item.moving.rotation.y,
              (value.turns * Math.PI) / 2,
            );
            break;
          case "table":
            item.moving.scale.z = approach(
              item.moving.scale.z,
              value.turns % 2 ? 1 : 0.2,
            );
            item.root.children.forEach((child) => {
              if (child instanceof Mesh) child.visible = state.discovery > 0;
            });
            break;
          case "shelf":
            item.moving.position.z = approach(
              item.moving.position.z,
              target * 0.12,
            );
            break;
        }
      }
      // Scene lighting eases toward context; reduced-motion takes the target.
      const blend = reduced ? 1 : Math.min(1, delta * 3);
      scene.traverse((object) => {
        if (object instanceof HemisphereLight) {
          const targetIntensity =
            atmosphere === "noturna"
              ? 0.65
              : atmosphere === "encantada"
                ? 1.25
                : 2;
          object.intensity = reduced
            ? targetIntensity
            : object.intensity + (targetIntensity - object.intensity) * blend;
        }
        if (object instanceof DirectionalLight) {
          const targetIntensity = atmosphere === "noturna" ? 0.4 : 1.5;
          object.intensity = reduced
            ? targetIntensity
            : object.intensity + (targetIntensity - object.intensity) * blend;
        }
      });
    },
    driveInhabitantInteractions(
      poses: readonly AgentView[],
      getCarryAnchor: (id: string) => import("three").Object3D | null,
    ) {
      if (!book || !bookRestPosition || !bookRestRotation) return;
      const carrier = poses.find(
        (pose) =>
          pose.interactionObjectId === "living:book" &&
          (pose.interactionState === "carrying" ||
            pose.interactionState === "placing" ||
            pose.interactionState === "returning"),
      );
      if (!carrier) {
        book.root.position.copy(bookRestPosition);
        book.moving.rotation.copy(bookRestRotation);
        return;
      }
      const anchor = getCarryAnchor(carrier.id);
      if (!anchor) return;
      anchor.updateWorldMatrix(true, false);
      book.root.parent?.worldToLocal(
        book.root.position.copy(anchor.getWorldPosition(book.root.position)),
      );
      book.root.position.y = 0;
      book.moving.rotation.set(0, 0, 0);
    },
  };
}
