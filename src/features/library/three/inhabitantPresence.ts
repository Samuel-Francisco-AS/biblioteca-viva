import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  PointLight,
  TorusGeometry,
} from "three";
import { createMagicHalo } from "./magicHalo";
import { disposeObjectTree } from "./referenceScene";
import type { InhabitantAction, InhabitantKey } from "../inhabitants";

/** Visual presence only. Never writes actor/bone transforms or agency state. */
export function inhabitantPresenceLevel(
  key: InhabitantKey,
  action: InhabitantAction,
  time: number,
  actionAge: number,
  reduced: boolean,
): number {
  if (reduced) return key === "ytha" ? 0.28 : 0.24;
  const durations: Partial<Record<InhabitantAction, number>> = {
    react: 1.8,
    magic: 3.6,
    recover: 2.4,
    gesture: 2.8,
    work: 4,
  };
  const duration = durations[action];
  const pulse =
    duration && actionAge < duration
      ? Math.sin((Math.PI * actionAge) / duration) ** 2
      : 0;
  if (key === "samael") {
    const phase = time % 16;
    const occasional =
      phase > 2 && phase < 13
        ? 0.62 * Math.sin((Math.PI * (phase - 2)) / 11) ** 2
        : 0;
    return ["react", "magic", "recover"].includes(action)
      ? Math.max(occasional, pulse)
      : occasional;
  }
  if (key === "ytha") return 0.48 + 0.1 * Math.sin(time * 0.7) + 0.3 * pulse;
  if (key === "aryn")
    return (
      0.22 +
      (["work", "gesture", "magic"].includes(action)
        ? 0.72 * pulse
        : 0.08 * pulse)
    );
  return (
    0.28 +
    0.2 * Math.sin((time * Math.PI) / 7) ** 2 +
    (["gesture", "magic", "recover"].includes(action) ? 0.5 * pulse : 0)
  );
}

export function createInhabitantPresence(
  scene: Object3D,
  key: InhabitantKey,
  effectParent?: Object3D,
) {
  const materials = new Set<MeshStandardMaterial>();
  const effects: Object3D[] = [];
  const wings = new Set<MeshStandardMaterial>();
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const candidates: unknown[] = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of candidates) {
      if (
        key === "ytha" &&
        material instanceof MeshStandardMaterial &&
        material.name.includes("membrane")
      )
        wings.add(material);
      if (
        material instanceof MeshStandardMaterial &&
        material.name.startsWith("FX")
      ) {
        materials.add(material);
        effects.push(node);
      }
    }
  });
  const light =
    key === "ytha" && materials.size
      ? new PointLight(0xb4ffd5, 0.25, 2.4, 2)
      : null;
  if (light) {
    light.name = "ytha-fey-light";
    (scene.getObjectByName("Torso") ?? scene).add(light);
  }
  // Independent of selectable GLB roots: glow cannot enlarge their precise bounds.
  const glowRoot = new Group();
  glowRoot.name = `inhabitant-glow:${key}`;
  const halo = createMagicHalo(
    { samael: 0xb873ff, aryn: 0xffd47e, ytha: 0x9dffdb, lua: 0x91baff }[key],
    key === "samael" ? 1.8 : key === "aryn" ? 0.85 : 1.5,
    key === "samael" ? 2.1 : key === "aryn" ? 0.85 : 1.5,
  );
  glowRoot.add(halo);
  const shadow =
    key === "samael" ? createMagicHalo(0x15071f, 2.05, 2.35) : null;
  if (shadow) {
    shadow.material.blending = NormalBlending;
    // Dark smoke precedes the lilac glow instead of dimming it afterward.
    shadow.renderOrder = -1;
    glowRoot.add(shadow);
  }
  const rune =
    key === "lua"
      ? new Mesh(
          new TorusGeometry(0.39, 0.022, 5, 40, Math.PI * 1.65),
          new MeshBasicMaterial({
            color: 0x9bbfff,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false,
          }),
        )
      : null;
  if (rune) {
    rune.rotation.x = -0.5;
    glowRoot.add(rune);
  }
  effectParent?.add(glowRoot);
  const anchor =
    scene.getObjectByName(key === "aryn" ? "HandR" : "Torso") ?? scene;
  let time = 0,
    age = 0;
  let previous: InhabitantAction = "idle";
  let disposed = false;
  const controller = {
    setPointLightEnabled(enabled: boolean) {
      if (!disposed && light) light.visible = enabled;
    },
    update(delta: number, action: InhabitantAction, reduced: boolean) {
      if (disposed) return;
      const dt = reduced ? 0 : Math.max(0, Math.min(delta, 0.05));
      time += dt;
      if (action !== previous) {
        age = 0;
        previous = action;
      }
      age += dt;
      const level = inhabitantPresenceLevel(key, action, time, age, reduced);
      for (const material of materials) {
        const shadow = material.name.includes("shadow");
        material.opacity = (shadow ? 0.5 : 0.96) * level;
        material.emissiveIntensity = shadow ? 0 : 2 + level * 3;
      }
      for (const effect of effects) effect.visible = level > 0.005;
      for (const material of wings)
        material.emissiveIntensity = 0.9 + level * 0.8;
      halo.material.opacity = Math.min(
        1,
        (key === "samael" ? 1.5 : key === "aryn" ? 1.2 : 1.05) * level,
      );
      if (shadow) shadow.material.opacity = Math.min(1, level * 1.1);
      if (rune) {
        rune.material.opacity = level * 0.85;
        rune.rotation.z = reduced ? 0 : time * 0.15;
      }
      glowRoot.visible = level > 0.005;
      if (effectParent) {
        anchor.getWorldPosition(glowRoot.position);
        effectParent.worldToLocal(glowRoot.position);
      }
      // Ytha retains the exact R5Q light curve. Legibility comes from unlit glow.
      if (light) light.intensity = 0.34 * level;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      light?.removeFromParent();
      light?.dispose();
      disposeObjectTree(glowRoot);
      wings.clear();
      materials.clear();
      effects.length = 0;
    },
  };
  controller.update(0, "idle", false);
  return controller;
}
