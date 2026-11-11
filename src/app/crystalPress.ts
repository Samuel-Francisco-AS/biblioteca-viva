/**
 * BF-5.7A/R1: tactile crystal feedback and paint-first navigation.
 * Repeatable counters do not retain a post-click pressed state.
 */
import { beginPassage, schedulePassage } from "./interactionContinuity";

export const CRYSTAL_PRESS_ECHO_MS = 76;
export const CRYSTAL_PRESS_FALLBACK_MS = 72;
const echoes = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function echoCrystalPress(control: HTMLElement): void {
  if (
    control.matches(":disabled, [aria-disabled='true']") ||
    control.matches(
      ".book-card__link, .combat-card, .arcana-card, .folio-step, [data-crystal-repeat='true']",
    )
  ) return;
  const old = echoes.get(control);
  if (old !== undefined) clearTimeout(old);
  control.setAttribute("data-crystal-pressed", "true");
  echoes.set(
    control,
    setTimeout(() => {
      control.removeAttribute("data-crystal-pressed");
      echoes.delete(control);
    }, CRYSTAL_PRESS_ECHO_MS),
  );
}

/** Two RAFs permit one painted press before the established opaque curtain.
 * A bounded fallback handles throttling; keyboard and reduced motion start
 * immediately. Cancellation applies to both the prelude and scheduled route. */
export function schedulePressedPassage(
  target: string,
  action: () => void,
  pointerActivation: boolean,
): () => void {
  let cancelled = false;
  let started = false;
  let firstFrame: number | undefined;
  let secondFrame: number | undefined;
  let fallback: ReturnType<typeof setTimeout> | undefined;
  let cancelScheduledWork: (() => void) | undefined;
  const shell = document.querySelector<HTMLElement>(".app-shell");
  const reducedMotion =
    shell?.dataset.reducedMotion === "true" ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const start = () => {
    if (cancelled || started) return;
    started = true;
    if (fallback !== undefined) clearTimeout(fallback);
    if (firstFrame !== undefined) cancelAnimationFrame(firstFrame);
    if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    beginPassage(target);
    cancelScheduledWork = schedulePassage(action);
  };
  if (
    pointerActivation &&
    !reducedMotion &&
    document.visibilityState !== "hidden" &&
    typeof requestAnimationFrame === "function"
  ) {
    firstFrame = requestAnimationFrame(() => {
      if (cancelled || started) return;
      secondFrame = requestAnimationFrame(start);
    });
    fallback = setTimeout(start, CRYSTAL_PRESS_FALLBACK_MS);
  } else {
    start();
  }
  return () => {
    cancelled = true;
    if (fallback !== undefined) clearTimeout(fallback);
    if (firstFrame !== undefined) cancelAnimationFrame(firstFrame);
    if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    cancelScheduledWork?.();
  };
}
