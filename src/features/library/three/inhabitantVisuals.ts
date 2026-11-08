import { createInhabitantPresence } from "./inhabitantPresence";
import type { AgentView } from "../inhabitantAgency";
import { Group, Object3D, Vector3, type AnimationClip } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { createInhabitantAnimator } from "./inhabitantAnimator";
import {
  INHABITANT_WALK_DISTANCE,
  PHYSICAL_ACTIONS,
  SESSION_BOOK_HANDLERS,
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
  let pointLightEnabled = true;
  const animators = new Map<
    string,
    ReturnType<typeof createInhabitantAnimator>
  >();
  const presence = new Map<
    string,
    ReturnType<typeof createInhabitantPresence>
  >();
  const anchors = new Map<string, Object3D>();
  const pickupProfiles = new Map<string, { x: number; y: number; z: number }>();
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
        presence.set(
          descriptor.id,
          createInhabitantPresence(scene, descriptor.key, parent),
        );
        presence.get(descriptor.id)?.setPointLightEnabled(pointLightEnabled);
        // Replace a pre-load fallback with the real rig socket if one exists.
        anchors.delete(descriptor.id);
        root.userData.loadState = "ready";
        root.userData.physicalReady =
          PHYSICAL_ACTIONS.every((name) =>
            animations.some((c) => c.name === name),
          ) &&
          ["socket_carry", "socket_hand_right", "socket_seat"].every((name) =>
            scene.getObjectByName(name),
          );
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
        const animator = animators.get(descriptor.id)!;
        if (animations.some((c) => c.name === "pickup")) {
          animator.sample("pickup", 0.8);
          root.updateWorldMatrix(true, true);
          const socket = scene.getObjectByName("socket_carry");
          if (socket && SESSION_BOOK_HANDLERS.includes(descriptor.key)) {
            const p = root.worldToLocal(socket.getWorldPosition(new Vector3()));
            pickupProfiles.set(descriptor.id, { x: p.x, y: p.y, z: p.z });
          }
          animator.sample("idle", 0);
          animator.play("idle");
        }
        onReady(descriptor.id);
      })
      .catch(() => {
        if (!disposed) root.userData.loadState = "error";
      });
    return { descriptor, root };
  });
  const driven = new Map<string, string>();
  let motionReduced = false;
  const physicalTimes = new Map<
    string,
    { action: InhabitantAction; seconds: number }
  >();
  return {
    selectables,
    setPointLightEnabled(enabled: boolean) {
      pointLightEnabled = enabled;
      for (const effect of presence.values())
        effect.setPointLightEnabled(enabled);
    },
    drive(poses: readonly AgentView[]) {
      if (disposed) return;
      for (const p of poses) {
        const actor = selectables.find((s) => s.descriptor.id === p.id);
        if (!actor || !p.available) continue;
        actor.root.position.set(p.x, 0, p.z);
        actor.root.rotation.y = p.facing;
        if (p.physicalActionTime !== undefined) {
          physicalTimes.set(p.id, {
            action: p.action,
            seconds: p.physicalActionTime,
          });
          continue;
        }
        physicalTimes.delete(p.id);
        const repeat =
          p.state === "navigate" || (p.state === "work" && p.action === "work");
        const token = `${p.action}:${repeat}`;
        if (driven.get(p.id) !== token) {
          if (animators.get(p.id)?.play(p.action, repeat))
            driven.set(p.id, token);
        }
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
        const phase = physicalTimes.get(id);
        if (phase) {
          const duration =
            phase.action === "sit" || phase.action === "stand"
              ? 2
              : phase.action === "pickup"
                ? 1.6
                : phase.action === "train"
                  ? 5
                  : phase.action === "walk" || phase.action === "carry_walk"
                    ? 3.2
                    : phase.action === "carry"
                      ? 3
                      : 4;
          animator.sample(
            phase.action,
            ["sit", "stand", "pickup"].includes(phase.action)
              ? phase.seconds
              : phase.seconds % duration,
          );
        } else animator.update(delta, reducedMotion);
        presence.get(id)?.update(delta, animator.action, reducedMotion);
      }
    },
    probePhysicalPose<T>(
      pose: AgentView,
      read: (socket: Object3D) => T,
    ): T | null {
      const actor = selectables.find((s) => s.descriptor.id === pose.id),
        animator = animators.get(pose.id);
      const socket = actor?.root.getObjectByName("socket_carry");
      if (!actor || !animator || !socket) return null;
      const position = actor.root.position.clone(),
        yaw = actor.root.rotation.y;
      const current = physicalTimes.get(pose.id);
      try {
        actor.root.position.set(pose.x, 0, pose.z);
        actor.root.rotation.y = pose.facing;
        const durations: Partial<Record<InhabitantAction, number>> = {
          pickup: 1.6,
          sit: 2,
          stand: 2,
          carry: 3,
          carry_walk: 3.2,
          walk: 3.2,
        };
        const duration = durations[pose.action] ?? 4;
        const time = pose.physicalActionTime ?? 0;
        animator.sample(
          pose.action,
          ["sit", "stand", "pickup"].includes(pose.action)
            ? time
            : time % duration,
        );
        actor.root.updateWorldMatrix(true, true);
        return read(socket);
      } finally {
        actor.root.position.copy(position);
        actor.root.rotation.y = yaw;
        if (current) animator.sample(current.action, current.seconds);
        actor.root.updateWorldMatrix(true, true);
      }
    },
    hasPhysicalActions(id: string) {
      return (
        selectables.find((s) => s.descriptor.id === id)?.root.userData
          .physicalReady === true
      );
    },
    getPickupProfiles() {
      return pickupProfiles;
    },
    getSocket(
      id: string,
      name: "socket_carry" | "socket_hand_right" | "socket_seat",
    ): Object3D | null {
      if (disposed) return null;
      return (
        selectables
          .find((s) => s.descriptor.id === id)
          ?.root.getObjectByName(name) ?? null
      );
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
      pickupProfiles.clear();
      for (const effect of presence.values()) effect.dispose();
      presence.clear();
      driven.clear();
      physicalTimes.clear();
      for (const { root } of selectables) disposeObjectTree(root);
    },
  };
}
