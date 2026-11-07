import { Mesh, MeshStandardMaterial, Object3D, PointLight } from "three";
import type { InhabitantAction, InhabitantKey } from "../inhabitants";

/** Light/material performance only. Never writes a bone, position or agency state. */
export function inhabitantPresenceLevel(
  key: InhabitantKey,
  action: InhabitantAction,
  time: number,
  actionAge: number,
  reduced: boolean,
): number {
  if (reduced) return key === "ytha" ? 0.28 : key === "samael" ? 0 : 0.12;
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
    const phase = time % 22;
    const occasional =
      phase > 14 && phase < 20
        ? 0.24 * Math.sin((Math.PI * (phase - 14)) / 6) ** 2
        : 0;
    return ["react", "magic", "recover"].includes(action)
      ? Math.max(occasional, pulse)
      : occasional;
  }
  if (key === "ytha") return 0.48 + 0.1 * Math.sin(time * 0.7) + 0.3 * pulse;
  if (key === "aryn")
    return (
      0.08 + (["work", "magic"].includes(action) ? 0.72 * pulse : 0.08 * pulse)
    );
  return (
    0.16 +
    0.22 * Math.sin((time * Math.PI) / 7) ** 2 +
    (["gesture", "magic", "recover"].includes(action) ? 0.58 * pulse : 0)
  );
}

export function createInhabitantPresence(scene: Object3D, key: InhabitantKey) {
  const materials = new Set<MeshStandardMaterial>();
  const effects: Object3D[] = [];
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const candidates: unknown[] = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of candidates) {
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
  let time = 0,
    age = 0;
  let previous: InhabitantAction = "idle";
  let disposed = false;
  const controller = {
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
        material.opacity = (shadow ? 0.28 : 0.72) * level;
        material.emissiveIntensity = shadow ? 0 : 1.1 + level * 1.7;
      }
      for (const effect of effects) effect.visible = level > 0.005;
      if (light) light.intensity = 0.34 * level;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      light?.removeFromParent();
      light?.dispose();
      materials.clear();
      effects.length = 0;
    },
  };
  controller.update(0, "idle", false);
  return controller;
}
