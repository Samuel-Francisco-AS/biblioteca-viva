import { setSpatialComponents, spatialBox } from "./spatialComponents";
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
  Box3,
  Quaternion,
  Vector3,
  Color,
  MeshBasicMaterial,
  MeshPhongMaterial,
  type Scene,
} from "three";
import type { AgentView } from "../inhabitantAgency";
import { NIGHT_LAMPS, type NightLightingSession } from "../nightLighting";
import {
  LIVING_OBJECTS,
  type LivingSession,
  type Atmosphere,
} from "../livingObjects";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import {
  LIBRARY_FURNISHING,
  furnitureLamp,
  SCENIC_BOOK_ANCHORS,
} from "./libraryFurnishingLayout";
/** Resources are attached to the building owner before use, and disposed with it. */
export function createLivingVisuals(
  building: Group,
  scene: Scene,
  session: LivingSession,
  nightLighting?: NightLightingSession,
) {
  const root = new Group();
  root.name = "living-objects";
  // Effects have no physical volume. Each tangible family below owns its own
  // component; sparks/glows must not fall back to visual mesh extraction.
  setSpatialComponents(root, {
    physical: [],
    navigation: [],
    mobility: "dynamic",
  });
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
        adopt(`living-shade:${object.anchor}`, group);
        if (placement) {
          const lamp = furnitureLamp(placement);
          if (lamp) {
            light = new PointLight(0xffc878, 0, 7, 1.5);
            light.position.set(lamp.local.x, lamp.local.y, lamp.local.z);
            group.add(light);
            moving.add(
              part(
                0.18,
                0.16,
                0.18,
                lamp.local.x,
                lamp.local.y,
                lamp.local.z,
                glow,
                true,
              ),
            );
          }
        }
        break;
      case "table":
        moving.position.set(0.65, 0.97, -0.15);
        moving.add(part(0.53, 0.02, 0.35, 0, 0, 0.175, paper));
        part(0.05, 0.025, 0.25, 0.65, 0.99, 0, brass);
        break;
      case "book":
        group.userData.carriedObject = true;
        group.position.x = SCENIC_BOOK_ANCHORS.source.x;
        group.position.z = SCENIC_BOOK_ANCHORS.source.z - 0.05;
        adopt("living-book-base", group);
        moving.position.set(-0.22, 0.9665, 0.05);
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
        adopt("living-cabinet-drawer", moving);
        adopt("living-cabinet-handle", moving);
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
    // Maximal authorised motion envelopes, independent of ornament/animation meshes.
    const physical = (() => {
      switch (object.family) {
        case "clock":
          return [spatialBox(-0.5, 1.5, 0.02, 0.72, 0.78, 0.3)];
        case "globe":
          return [spatialBox(0, 1.22, 0, 0.62, 0.66, 0.62)];
        case "table":
          return [spatialBox(0.65, 1, -0.02, 0.56, 0.16, 0.4)];
        case "hearth":
          return [spatialBox(0, 0.92, 0, 0.52, 0.6, 0.52)];
        // Furniture already reserves these complete motion envelopes.
        default:
          return [];
      }
    })();
    setSpatialComponents(group, {
      physical,
      navigation: physical,
      mobility: "dynamic",
    });
    return {
      descriptor: { id: object.objectId, label: object.label },
      root: group,
      object,
      moving,
      light,
      shade:
        object.family === "lamp"
          ? building.getObjectByName(`living-shade:${object.anchor}`)
          : undefined,
    };
  });
  // Existing BF-4 furniture already has physical lamps in nine positions.
  // Add luminous cores at the real shades, not duplicate models or pickables.
  const shadeGlowGeometry = nightLighting
    ? new SphereGeometry(0.14, 12, 8)
    : undefined;
  const shadeGlowMaterial = nightLighting
    ? new MeshBasicMaterial({
        color: 0xffd6a1,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      })
    : undefined;
  const ambientLamps =
    nightLighting && shadeGlowGeometry && shadeGlowMaterial
      ? NIGHT_LAMPS.map((fixture) => {
          const group = new Group();
          group.name = fixture.id;
          group.position.set(fixture.x, fixture.y, fixture.z);
          const glow = new Mesh(shadeGlowGeometry, shadeGlowMaterial);
          glow.name = `${fixture.id}:ember`;
          group.add(glow);
          const light = new PointLight(0xffbf79, 0, 6.5, 1.65);
          light.name = `${fixture.id}:light`;
          group.add(light);
          root.add(group);
          const shade = building.getObjectByName(
            `living-shade:${fixture.id.replace("night-lamp:", "")}`,
          );
          return { fixture, group, light, glow, shade };
        })
      : [];
  const daytimeSky = new Color(0xffedd2);
  const nighttimeSky = new Color(0xa1c8ff);
  const daytimeGround = new Color(0x58665b);
  const nighttimeGround = new Color(0x233f63);
  const daytimeSun = new Color(0xffdfac);
  const nighttimeMoon = new Color(0x8dbbff);
  const daytimeBackdrop = new Color(0x18342d);
  const nighttimeBackdrop = new Color(0x12263c);
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
  let bookDisplaced = false;
  let bookCarried = false;
  const book = selectables.find(
    (item) => item.object.objectId === "living:book",
  );
  const bookRestPosition = book?.root.position.clone();
  const bookRestQuaternion = book?.root.quaternion.clone();
  const bookRestWorldPosition = book?.root.getWorldPosition(new Vector3());
  const bookRestWorldQuaternion = book?.root.getWorldQuaternion(
    new Quaternion(),
  );
  const bookRestBounds = book ? new Box3().setFromObject(book.root) : undefined;
  const bookCarryOffset =
    book && bookRestWorldPosition && bookRestBounds
      ? bookRestWorldPosition
          .clone()
          .sub(bookRestBounds.getCenter(new Vector3()))
      : undefined;
  const bookDestination = new Vector3(
    SCENIC_BOOK_ANCHORS.destination.x,
    0,
    SCENIC_BOOK_ANCHORS.destination.z - 0.05,
  );
  const bookDestinationSurfaceY = SCENIC_BOOK_ANCHORS.destination.y + 0.004;
  const parentWorldQuaternion = new Quaternion();
  const worldPosition = new Vector3();
  const worldQuaternion = new Quaternion();
  const setBookWorldPosition = (position: Vector3) => {
    if (!book?.root.parent) return;
    book.root.parent.worldToLocal(book.root.position.copy(position));
  };
  const setBookWorldQuaternion = (quaternion: Quaternion) => {
    if (!book?.root.parent) return;
    book.root.parent.getWorldQuaternion(parentWorldQuaternion).invert();
    book.root.quaternion.copy(
      parentWorldQuaternion.multiply(worldQuaternion.copy(quaternion)),
    );
  };
  const placeBook = () => {
    if (!book || !bookRestWorldPosition || !bookRestBounds) return;
    setBookWorldPosition(
      bookDestination.set(
        bookDestination.x,
        bookRestWorldPosition.y,
        bookDestination.z,
      ),
    );
    setBookWorldQuaternion(bookRestWorldQuaternion ?? new Quaternion());
    book.root.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(book.root);
    setBookWorldPosition(
      bookDestination.set(
        bookDestination.x,
        bookDestination.y + bookDestinationSurfaceY - bounds.min.y,
        bookDestination.z,
      ),
    );
  };
  return {
    selectables,
    update(delta: number, reduced: boolean, narrativeAtmosphere?: Atmosphere) {
      delta = Number.isFinite(delta) ? Math.min(Math.max(delta, 0), 0.05) : 0;
      elapsed += delta;
      const state = session.getSnapshot();
      const atmosphere = narrativeAtmosphere ?? state.atmosphere;
      sparks.visible = atmosphere === "encantada";
      const blend = reduced ? 1 : Math.min(1, delta * 3);
      for (const { fixture, light, glow, shade } of ambientLamps) {
        const target = nightLighting?.power(fixture.id) ?? 0;
        light.intensity = reduced
          ? 4.2 * target
          : light.intensity + (4.2 * target - light.intensity) * blend;
        // A zero-power light otherwise still participates in Three's light list/shader.
        if (target === 0 && light.intensity < 0.0001) light.intensity = 0;
        light.visible = light.intensity > 0;
        glow.visible = target > 0;
        if (
          shade instanceof Mesh &&
          shade.material instanceof MeshPhongMaterial
        ) {
          shade.material.emissive.setHex(0xffac51);
          shade.material.emissiveIntensity = target * 0.55;
        }
        if (glow.visible)
          glow.scale.setScalar(
            reduced ? 0.75 : 0.86 + 0.04 * Math.sin(elapsed * 1.7),
          );
      }
      if (sparks.visible)
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
        const approach = (current: number, next: number) => {
          const value = reduced
            ? next
            : current + (next - current) * Math.min(1, delta * 9);
          return item.object.family === "book" && Math.abs(next - value) < 1e-5
            ? next
            : value;
        };
        switch (item.object.family) {
          case "lamp":
            if (item.light)
              item.light.intensity = target * (5 + (value.turns % 3) * 3);
            item.moving.visible = value.active;
            {
              const shade = item.shade;
              if (
                shade instanceof Mesh &&
                shade.material instanceof MeshPhongMaterial
              ) {
                shade.material.emissive.setHex(0xffac51);
                shade.material.emissiveIntensity = target * 0.55;
              }
            }
            break;
          case "hearth":
            if (item.light) item.light.intensity = target * 8;
            item.moving.visible = value.active;
            item.moving.scale.y = reduced
              ? 1
              : 1 + 0.12 * Math.sin(elapsed * 5);
            break;
          case "book":
            if (bookCarried) break;
            {
              const pages = item.root.getObjectByName("living-page-pivot");
              if (pages)
                pages.rotation.x = approach(
                  pages.rotation.x,
                  value.active && item.moving.rotation.z >= 2.09
                    ? -(value.turns % 2) * 2.4
                    : 0,
                );
            }
            item.moving.rotation.z = approach(
              item.moving.rotation.z,
              target * 2.1,
            );
            item.moving.rotation.x = 0;
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
      // Moonlit blue fill preserves legibility; amber pools reveal the furniture.
      // Narrative darkness affects sky, but does not turn off the real clock lamps.
      const dark =
        atmosphere === "noturna" ||
        (nightLighting?.getSnapshot().cycleKey !== null &&
          nightLighting !== undefined);
      for (const item of selectables)
        if (item.light) item.light.visible = item.light.intensity > 0;
      scene.traverse((object) => {
        if (object instanceof HemisphereLight) {
          const intensity = dark ? 1.08 : atmosphere === "encantada" ? 1.25 : 2;
          object.intensity = reduced
            ? intensity
            : object.intensity + (intensity - object.intensity) * blend;
          object.color.lerp(dark ? nighttimeSky : daytimeSky, blend);
          object.groundColor.lerp(
            dark ? nighttimeGround : daytimeGround,
            blend,
          );
        }
        if (object instanceof DirectionalLight) {
          const intensity = dark ? 0.8 : 1.5;
          object.intensity = reduced
            ? intensity
            : object.intensity + (intensity - object.intensity) * blend;
          object.color.lerp(dark ? nighttimeMoon : daytimeSun, blend);
        }
      });
      if (scene.background instanceof Color)
        scene.background.lerp(
          dark ? nighttimeBackdrop : daytimeBackdrop,
          blend,
        );
    },
    driveInhabitantInteractions(
      poses: readonly AgentView[],
      getCarryAnchor: (id: string) => import("three").Object3D | null,
    ) {
      if (!book || !bookRestPosition) return;
      const interaction = poses.find(
        (pose) =>
          pose.interactionObjectId === "living:book" &&
          pose.interactionState !== null,
      );
      bookCarried = false;
      if (!interaction) {
        // Restore the transported root once; cover articulation belongs to update().
        if (!bookDisplaced) return;
        bookDisplaced = false;
        book.root.position.copy(bookRestPosition);
        book.root.quaternion.copy(bookRestQuaternion ?? book.root.quaternion);
        return;
      }
      if (interaction.interactionState === "placing") {
        bookDisplaced = true;
        placeBook();
        return;
      }
      if (
        interaction.interactionState !== "carrying" &&
        interaction.interactionState !== "recollecting" &&
        interaction.interactionState !== "returning"
      )
        return;
      bookCarried = true;
      const anchor = getCarryAnchor(interaction.id);
      if (!anchor) return;
      bookDisplaced = true;
      anchor.updateWorldMatrix(true, false);
      if (bookCarryOffset) {
        setBookWorldPosition(
          anchor.getWorldPosition(worldPosition).add(bookCarryOffset),
        );
      }
      setBookWorldQuaternion(anchor.getWorldQuaternion(worldQuaternion));
      book.moving.rotation.set(0, 0, 0);
      book.root.getObjectByName("living-page-pivot")?.rotation.set(0, 0, 0);
    },
  };
}
