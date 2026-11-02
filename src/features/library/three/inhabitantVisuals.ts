import { Group, type Object3D, type AnimationClip } from "three";
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
) {
  let disposed = false;
  const animators = new Map<
    string,
    ReturnType<typeof createInhabitantAnimator>
  >();
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
        root.userData.loadState = "ready";
        animators.set(
          descriptor.id,
          createInhabitantAnimator(
            scene,
            animations,
            root,
            INHABITANT_WALK_DISTANCE[descriptor.key],
            descriptor.key === "lua",
          ),
        );
        onReady(descriptor.id);
      })
      .catch(() => {
        if (!disposed) root.userData.loadState = "error";
      });
    return { descriptor, root };
  });
  return {
    selectables,
    play(id: string, action: InhabitantAction) {
      if (disposed) return "unavailable";
      const actor = selectables.find(({ descriptor }) => descriptor.id === id);
      if (!actor || actor.root.userData.loadState === "error")
        return "unavailable";
      if (actor.root.userData.loadState === "loading") return "loading";
      return animators.get(id)?.play(action) ? "playing" : "reduced";
    },
    update(delta: number, reducedMotion: boolean) {
      if (disposed) return;
      for (const animator of animators.values())
        animator.update(delta, reducedMotion);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const animator of animators.values()) animator.dispose();
      animators.clear();
      for (const { root } of selectables) disposeObjectTree(root);
    },
  };
}
