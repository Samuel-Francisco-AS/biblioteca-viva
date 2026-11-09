/**
 * Let the touch feedback reach one painted frame before mounting a new route.
 * This is a frame boundary, never a fixed loading delay or a performance claim.
 * A cancelled/unmounted interaction must not navigate later.
 */
export function afterFeedbackFrame(action: () => void): () => void {
  let cancelled = false;
  let first = 0;
  let second = 0;
  const commit = () => {
    if (!cancelled) action();
  };
  if (
    typeof requestAnimationFrame !== "function" ||
    document.visibilityState === "hidden" ||
    document.querySelector(".app-shell[data-reduced-motion='true']") !== null ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  ) {
    queueMicrotask(commit);
  } else {
    first = requestAnimationFrame(() => {
      second = requestAnimationFrame(commit);
    });
  }
  return () => {
    cancelled = true;
    if (first) cancelAnimationFrame(first);
    if (second) cancelAnimationFrame(second);
  };
}

/** The fixed visual veil never owns focus or pointer input. */
export function beginPassage(): void {
  document
    .querySelector<HTMLElement>(".app-shell")
    ?.setAttribute("data-passage", "departing");
}
