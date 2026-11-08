import {
  AnimationMixer,
  LoopOnce,
  LoopRepeat,
  type AnimationClip,
  type Object3D,
  type AnimationAction,
} from "three";
import { PHYSICAL_ACTIONS, type InhabitantAction } from "../inhabitants";

/** One principal action; the existing world RAF is its only clock. */
export function createInhabitantAnimator(
  scene: Object3D,
  clips: AnimationClip[],
  wrapper: Object3D,
  walkDistance: number,
  unstableMagic: boolean,
  externalPosition = false,
) {
  const mixer = new AnimationMixer(scene);
  const actions = new Map<InhabitantAction, AnimationAction>();
  const names: readonly InhabitantAction[] = [
    "idle",
    "walk",
    "turn",
    "react",
    "gesture",
    "work",
    "magic",
    "recover",
    ...PHYSICAL_ACTIONS,
  ];
  for (const name of names) {
    const clip = clips.find((clip) => clip.name === name);
    if (clip) {
      // F2 authored a demonstration yaw in Facing. Navigation owns world facing.
      const bodyClip =
        externalPosition && (name === "walk" || name === "carry_walk")
          ? clip.clone()
          : clip;
      if (bodyClip !== clip)
        bodyClip.tracks = bodyClip.tracks.filter(
          (t) => t.name !== "Facing.quaternion",
        );
      actions.set(name, mixer.clipAction(bodyClip));
    }
  }
  let current: InhabitantAction = "idle";
  let elapsed = 0;
  let reduced = false;
  let disposed = false;
  let returnX = wrapper.position.x;
  const startX = wrapper.position.x;
  let repeating = false;
  function play(name: InhabitantAction, repeat = false) {
    if (disposed || reduced || !actions.has(name)) return false;
    if (
      current === name &&
      repeating === repeat &&
      name !== "idle" &&
      elapsed > 0
    )
      return true;
    const previous = actions.get(current);
    const next = actions.get(name)!;
    // Retire old fades before another transition; at most two weighted actions.
    for (const action of actions.values())
      if (action !== previous) action.stop();
    returnX = wrapper.position.x;
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
    next.setLoop(
      name === "idle" || repeat ? LoopRepeat : LoopOnce,
      name === "idle" || repeat ? Infinity : 1,
    );
    next.clampWhenFinished = name !== "idle" && !repeat;
    repeating = repeat;
    next.play();
    if (previous && previous !== next)
      next.crossFadeFrom(previous, 0.22, false);
    current = name;
    elapsed = 0;
    return true;
  }
  play("idle");
  return {
    play,
    /** Phase time belongs to the agency for contact-critical sequences. No
     * autonomous return to idle while sitting, holding or standing up. */
    sample(name: InhabitantAction, seconds: number) {
      if (disposed) return;
      const action = actions.get(name);
      if (!action) return;
      mixer.stopAllAction();
      action.reset().setEffectiveWeight(1).setLoop(LoopOnce, 1).play();
      action.clampWhenFinished = true;
      mixer.update(Math.min(Math.max(0, seconds), action.getClip().duration));
      current = name;
      elapsed = seconds;
    },
    get action() {
      return current;
    },
    update(delta: number, reducedMotion: boolean) {
      if (disposed) return;
      if (reducedMotion) {
        if (!reduced) {
          mixer.stopAllAction();
          if (!externalPosition) wrapper.position.x = startX;
          current = "idle";
          elapsed = 0;
        }
        reduced = true;
        return;
      }
      if (reduced) {
        reduced = false;
        play("idle");
      }
      const dt = Math.max(0, Math.min(delta, 0.05));
      elapsed += dt;
      mixer.update(dt);
      const action = actions.get(current);
      if (!action) return;
      if (!externalPosition && current === "walk") {
        const progress = Math.min(1, action.time / action.getClip().duration);
        // Local out-and-back demonstration; smooth endpoints, no accumulated drift.
        wrapper.position.x =
          startX + walkDistance * Math.sin(progress * Math.PI) ** 2;
      }
      if (!externalPosition && current !== "walk")
        wrapper.position.x =
          returnX + (startX - returnX) * Math.min(1, elapsed / 0.22);
      if (
        !repeating &&
        current !== "idle" &&
        elapsed >= action.getClip().duration - 0.22
      )
        play(current === "magic" && unstableMagic ? "recover" : "idle");
      if (current === "idle" && elapsed > 0.25)
        for (const [name, retired] of actions)
          if (name !== current && retired.isRunning()) retired.stop();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      mixer.stopAllAction();
      mixer.uncacheRoot(scene);
      actions.clear();
    },
  };
}
