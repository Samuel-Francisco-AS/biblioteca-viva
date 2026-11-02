import {
  AnimationMixer,
  Group,
  type Object3D,
  type AnimationClip,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { INHABITANTS } from "../inhabitants";
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
  const mixers: AnimationMixer[] = [];
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
        const mixer = new AnimationMixer(scene);
        for (const clip of animations) mixer.clipAction(clip).play();
        mixers.push(mixer);
        onReady(descriptor.id);
      })
      .catch(() => {
        if (!disposed) root.userData.loadState = "error";
      });
    return { descriptor, root };
  });
  return {
    selectables,
    update(delta: number, reducedMotion: boolean) {
      if (disposed) return;
      for (const mixer of mixers) mixer.update(reducedMotion ? 0 : delta);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const mixer of mixers) {
        mixer.stopAllAction();
        mixer.uncacheRoot(mixer.getRoot());
      }
      mixers.length = 0;
      for (const { root } of selectables) disposeObjectTree(root);
    },
  };
}
