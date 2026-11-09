/** Coalesce same-turn intentions without imposing animation-frame latency.
 * Lazy loading and React own destination scheduling; feedback owns no delay.
 */
export function schedulePassage(action: () => void): () => void {
  let cancelled = false;
  queueMicrotask(() => {
    if (!cancelled) action();
  });
  return () => {
    cancelled = true;
  };
}

/** The fixed visual veil never owns focus or pointer input. */
export function beginPassage(): void {
  document
    .querySelector<HTMLElement>(".app-shell")
    ?.setAttribute("data-passage", "departing");
}
