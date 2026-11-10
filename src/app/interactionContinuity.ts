/**
 * BV-UXC R6: visible departure -> route/data work -> ready-gated reveal.
 * No destination is considered ready merely because its URL changed.
 */
const MIN_VISIBLE_MS = 560;
const REVEAL_FALLBACK_MS = 540;
let serial = 0;
let active: {
  readonly id: number;
  target: string | null;
  arrivedAt: string | null;
  ready: boolean;
  readonly startedAt: number;
  holdTimer?: ReturnType<typeof setTimeout>;
  revealTimer?: ReturnType<typeof setTimeout>;
} | null = null;
function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".app-shell");
}
function reducedMotion(): boolean {
  return shell()?.dataset.reducedMotion === "true" ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
function clearTimers(): void {
  if (!active) return;
  if (active.holdTimer !== undefined) clearTimeout(active.holdTimer);
  if (active.revealTimer !== undefined) clearTimeout(active.revealTimer);
}
export function cancelPassage(): void {
  clearTimers();
  active = null;
  shell()?.removeAttribute("data-passage");
}
function tryReveal(): void {
  const current = active;
  if (!current || !current.ready || current.arrivedAt === null) return;
  const node = shell();
  if (!node) return;
  if (reducedMotion()) {
    cancelPassage();
    return;
  }
  const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - current.startedAt));
  if (current.holdTimer !== undefined) clearTimeout(current.holdTimer);
  current.holdTimer = setTimeout(() => {
    if (active?.id !== current.id) return;
    node.dataset.passage = "arriving";
    current.revealTimer = setTimeout(() => {
      if (active?.id === current.id) completePassageAnimation();
    }, REVEAL_FALLBACK_MS);
  }, remaining);
}
/** Synchronous gesture acknowledgement: no module loads or navigation here. */
export function beginPassage(target?: string): void {
  clearTimers();
  active = {
    id: ++serial, target: target ?? null, arrivedAt: null,
    ready: false, startedAt: performance.now(),
  };
  shell()?.setAttribute("data-passage", reducedMotion() ? "waiting" : "departing");
}
/** Called when React Router commits the destination pathname. */
export function notifyPassageLocation(pathname: string): void {
  if (!active) return;
  // Android Back or an unrelated navigation may win BEFORE the deferred
  // Link executes. Abort the stale intent instead of navigating over Back.
  if (active.arrivedAt === null && active.target !== null &&
      active.target !== pathname) {
    cancelPassage();
    return;
  }
  active.target = pathname;
  active.arrivedAt = pathname;
  active.ready = false;
  // Keep the 400ms fold alive even if this route commits very quickly.
  // The CSS animationend marks the waiting phase without an opacity jump.
  if (shell()?.dataset.passage !== "departing")
    shell()?.setAttribute("data-passage", "waiting");
}
/** Called by the destination only after its known data and lazy module are ready. */
export function signalPassageReady(pathname: string): void {
  const current = active;
  if (!current || current.arrivedAt !== pathname || current.target !== pathname) return;
  current.ready = true;
  tryReveal();
}
/** The departure fold finishes before switching to the held-loading loop. */
export function completePassageDeparture(): void {
  if (active && shell()?.dataset.passage === "departing")
    shell()?.setAttribute("data-passage", "waiting");
}
/** CSS animationend cleanup, with background/no-event timer fallback. */
export function completePassageAnimation(): void {
  if (shell()?.dataset.passage === "arriving") cancelPassage();
}
/** Let the acknowledgement paint BEFORE calling the costly route handler. */
export function schedulePassage(action: () => void): () => void {
  let cancelled = false;
  let first = 0;
  let second = 0;
  const id = active?.id;
  const commit = () => {
    if (cancelled || (id !== undefined && active?.id !== id)) return;
    action();
  };
  if (
    reducedMotion() ||
    document.visibilityState === "hidden" ||
    typeof requestAnimationFrame !== "function"
  ) {
    queueMicrotask(commit);
  } else {
    first = requestAnimationFrame(() => {
      if (cancelled || (id !== undefined && active?.id !== id)) return;
      second = requestAnimationFrame(commit);
    });
  }
  return () => {
    cancelled = true;
    if (first) cancelAnimationFrame(first);
    if (second) cancelAnimationFrame(second);
  };
}
