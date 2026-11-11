/**
 * BF-5.7A — A tactile crystal control acknowledges the click before its
 * navigation curtain starts. Only pointer-driven route changes receive the
 * short prelude. No prelude for keyboard/assistive activation, hidden tabs or
 * reduced motion. The old R6 readiness/opaque-cover contract stays intact.
 */
import {
  beginPassage,
  schedulePassage,
} from "./interactionContinuity";

export const CRYSTAL_PRESS_PRELUDE_MS = 120;
const PRESS_ECHO_MS = 190;
const echoes = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function echoCrystalPress(control: HTMLElement): void {
  if (
    control.matches(":disabled, [aria-disabled='true']") ||
    control.matches(".book-card__link, .combat-card, .arcana-card")
  )
    return;
  const old = echoes.get(control);
  if (old !== undefined) clearTimeout(old);
  control.setAttribute("data-crystal-pressed", "true");
  echoes.set(
    control,
    setTimeout(() => {
      control.removeAttribute("data-crystal-pressed");
      echoes.delete(control);
    }, PRESS_ECHO_MS),
  );
}

/**
 * Cancelling before the prelude expires must not open an obsolete curtain.
 * The returned cancellation also cancels the scheduled route action once
 * the normal passage sequence has begun.
 */
export function schedulePressedPassage(
  target: string,
  action: () => void,
  pointerActivation: boolean,
): () => void {
  let cancelled = false;
  let startTimer: ReturnType<typeof setTimeout> | undefined;
  let cancelScheduledWork: (() => void) | undefined;
  const shell = document.querySelector<HTMLElement>(".app-shell");
  const reducedMotion =
    shell?.dataset.reducedMotion === "true" ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const start = () => {
    startTimer = undefined;
    if (cancelled) return;
    beginPassage(target);
    cancelScheduledWork = schedulePassage(action);
  };
  if (pointerActivation && !reducedMotion && document.visibilityState !== "hidden")
    startTimer = setTimeout(start, CRYSTAL_PRESS_PRELUDE_MS);
  else start();

  return () => {
    cancelled = true;
    if (startTimer !== undefined) clearTimeout(startTimer);
    cancelScheduledWork?.();
  };
}
