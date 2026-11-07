import type { AgentView } from "../inhabitantAgency";
import { Group, Object3D, type AnimationClip } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createInhabitantAnimator } from "./inhabitantAnimator";
import {
  INHABITANT_WALK_DISTANCE,
  type InhabitantAction,
  INHABITANTS,
} from "../inhabitants";
import { disposeObjectTree } from "./referenceScene";
import samael from "./assets/samael.glb?url&no-inline";
import aryn from "./assets/aryn.glb?url&no-inline";
import ytha from "./assets/ytha.glb?url&no-inline";
import lua from "./assets/lua.glb?url&no-inline";
const urls = { samael, aryn, ytha, lua };
export type InhabitantLoader = (
  url: string,
) => Promise<{ scene: Group; animations: AnimationClip[] }>;
/** One owner per mount. Late loads are released, never attached to a dead scene. */
export function createInhabitantVisuals(
  parent: Object3D,
  load: InhabitantLoader = (url) => new GLTFLoader().loadAsync(url),
  onReady: (id: string) => void = () => {},
  externalPosition = false,
) {
  let disposed = false;
  const animators = new Map<
    string,
    ReturnType<typeof createInhabitantAnimator>
  >();
  const magic = new Map<string, Object3D | undefined>();
  const anchors = new Map<string, Object3D>();
  const selectables = INHABITANTS.map((descriptor) => {
    const root = new Group();
    root.name = descriptor.id;
    root.position.set(descriptor.x, 0, descriptor.z);
    parent.add(root);
    root.userData.loadState = "loading";
    void load(urls[descriptor.key])
      .then(({ scene, animations }) => {
        if (disposed) {
          disposeObjectTree(scene);
          return;
        }
        root.add(scene);
        magic.set(descriptor.id, scene.getObjectByName("Magic"));
        // Replace a pre-load fallback with the real rig socket if one exists.
        anchors.delete(descriptor.id);
        root.userData.loadState = "ready";
        animators.set(
          descriptor.id,
          createInhabitantAnimator(
            scene,
            animations,
            root,
            INHABITANT_WALK_DISTANCE[descriptor.key],
            descriptor.key === "lua",
            externalPosition,
          ),
        );
        onReady(descriptor.id);
      })
      .catch(() => {
        if (!disposed) root.userData.loadState = "error";
      });
    return { descriptor, root };
  });
  const driven = new Map<string, string>();
  const moods = new Map<string, number>();
  let motionReduced = false;
  return {
    selectables,
    drive(poses: readonly AgentView[]) {
      if (disposed) return;
      for (const p of poses) {
        const actor = selectables.find((s) => s.descriptor.id === p.id);
        if (!actor || !p.available) continue;
        actor.root.position.set(p.x, 0, p.z);
        actor.root.rotation.y = p.facing;
        const repeat =
          p.state === "navigate" || (p.state === "work" && p.action === "work");
        const token = `${p.action}:${repeat}`;
        if (driven.get(p.id) !== token) {
          if (animators.get(p.id)?.play(p.action, repeat))
            driven.set(p.id, token);
        }
        // Keep signature effects inside the measured envelope; never replace gestures.
        moods.set(
          p.id,
          p.state === "react"
            ? 1
            : p.state === "socialize"
              ? 0.75
              : p.state === "work"
                ? 0.85
                : 0.65,
        );
      }
    },
    play(id: string, action: InhabitantAction) {
      if (disposed) return "unavailable";
      const actor = selectables.find(({ descriptor }) => descriptor.id === id);
      if (!actor || actor.root.userData.loadState === "error")
        return "unavailable";
      if (actor.root.userData.loadState === "loading") return "loading";
      driven.delete(id);
      return animators.get(id)?.play(action) ? "playing" : "reduced";
    },
    update(delta: number, reducedMotion: boolean) {
      if (disposed) return;
      if (motionReduced !== reducedMotion) {
        driven.clear();
        motionReduced = reducedMotion;
      }
      for (const [id, animator] of animators) {
        animator.update(delta, reducedMotion);
        const fx = magic.get(id);
        if (fx && externalPosition) {
          const target = reducedMotion ? 0.65 : (moods.get(id) ?? 0.65);
          fx.scale.setScalar(
            fx.scale.x + (target - fx.scale.x) * Math.min(1, delta * 4),
          );
        }
      }
    },
    getCarryAnchor(id: string): Object3D | null {
      if (disposed) return null;
      const cached = anchors.get(id);
      if (cached) return cached;
      const actor = selectables.find(({ descriptor }) => descriptor.id === id);
      if (!actor) return null;
      const named = actor.root.getObjectByName("socket_carry");
      if (named) {
        anchors.set(id, named);
        return named;
      }
      let anchor = actor.root.getObjectByName("interaction-hand-anchor");
      if (!anchor) {
        anchor = new Group();
        anchor.name = "interaction-hand-anchor";
        // Compatibility for unavailable/legacy models only. R5 assets expose
        // socket_carry attached to the deforming HandL bone.
        anchor.position.set(0.28, 1.02, 0.28);
        actor.root.add(anchor);
      }
      anchors.set(id, anchor);
      return anchor;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const animator of animators.values()) animator.dispose();
      animators.clear();
      anchors.clear();
      magic.clear();
      driven.clear();
      moods.clear();
      for (const { root } of selectables) disposeObjectTree(root);
    },
  };
}
