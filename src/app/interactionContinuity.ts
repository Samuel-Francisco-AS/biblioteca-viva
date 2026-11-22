/**
 * BV-UXC R6.1: gesture -> smooth, opaque cover -> destination work ->
 * readiness-held cover -> smooth reveal. No background navigation may begin
 * until the original surface is fully covered.
 */
const COVER_FALLBACK_MS = 720; // CSS fold = 560ms; fallback only if animationend is absent
const MIN_VISIBLE_MS = 740;
const REVEAL_FALLBACK_MS = 820; // CSS unfold = 660ms
let sequence = 0;

interface Passage {
  readonly id: number;
  target: string | null;
  arrivedAt: string | null;
  ready: boolean;
  sealed: boolean;
  readonly startedAt: number;
  pendingWork?: () => void;
  sealTimer?: ReturnType<typeof setTimeout>;
  holdTimer?: ReturnType<typeof setTimeout>;
  revealTimer?: ReturnType<typeof setTimeout>;
}
let active: Passage | null = null;

function shell(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".app-shell");
}
function reducedMotion(): boolean {
  return (
    shell()?.dataset.reducedMotion === "true" ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}
function clearTimers(passage: Passage): void {
  if (passage.sealTimer !== undefined) clearTimeout(passage.sealTimer);
  if (passage.holdTimer !== undefined) clearTimeout(passage.holdTimer);
  if (passage.revealTimer !== undefined) clearTimeout(passage.revealTimer);
}
export function cancelPassage(): void {
  if (active) clearTimers(active);
  active = null;
  const node = shell();
  node?.removeAttribute("data-passage");
  node
    ?.querySelector<HTMLElement>(".passage-veil")
    ?.style.removeProperty("--passage-resume-opacity");
}

/** Do not reveal until both the cover has sealed and the content is ready. */
function tryReveal(): void {
  const current = active;
  if (
    !current ||
    !current.ready ||
    !current.sealed ||
    current.arrivedAt === null
  )
    return;
  const node = shell();
  if (!node) return;
  if (reducedMotion()) {
    cancelPassage();
    return;
  }
  const remaining = Math.max(
    0,
    MIN_VISIBLE_MS - (performance.now() - current.startedAt),
  );
  if (current.holdTimer !== undefined) clearTimeout(current.holdTimer);
  current.holdTimer = setTimeout(() => {
    if (active?.id !== current.id) return;
    node.dataset.passage = "arriving";
    current.revealTimer = setTimeout(() => {
      if (active?.id === current.id) completePassageAnimation();
    }, REVEAL_FALLBACK_MS);
  }, remaining);
}

/** Begin the gentle cover synchronously on the confirmed gesture. */
export function beginPassage(target?: string): void {
  const node = shell();
  const previousPhase = node?.dataset.passage;
  if (active) clearTimers(active);
  const skipAnimation =
    reducedMotion() || document.visibilityState === "hidden";
  // A second gesture must not restart the curtain at alpha=0. In particular,
  // clicking while the previous route is still held opaque must stay opaque.
  const alreadyCovered = !skipAnimation && previousPhase === "waiting";
  const current: Passage = {
    id: ++sequence,
    target: target ?? null,
    arrivedAt: null,
    ready: false,
    sealed: skipAnimation || alreadyCovered,
    startedAt: performance.now(),
  };
  active = current;
  if (skipAnimation || alreadyCovered) {
    node?.setAttribute("data-passage", "waiting");
  } else if (previousPhase === "departing") {
    // Keep the in-flight fold; the old work is invalidated by passage ID.
  } else if (previousPhase === "arriving" || previousPhase === "resealing") {
    // Re-cover from the actual current compositor alpha, not from zero.
    const veil = node?.querySelector<HTMLElement>(".passage-veil");
    const sampled = veil
      ? Number.parseFloat(window.getComputedStyle(veil).opacity)
      : NaN;
    const alpha = Number.isFinite(sampled)
      ? Math.max(0, Math.min(1, sampled))
      : 0.5;
    veil?.style.setProperty("--passage-resume-opacity", String(alpha));
    node?.setAttribute("data-passage", "resealing");
  } else {
    node?.setAttribute("data-passage", "departing");
  }
  if (!current.sealed)
    current.sealTimer = setTimeout(() => {
      if (active?.id === current.id) completePassageDeparture();
    }, COVER_FALLBACK_MS);
}

/** React Router URL commit is not equivalent to destination readiness. */
export function notifyPassageLocation(pathname: string): void {
  const current = active;
  if (!current) return;
  if (
    current.arrivedAt === null &&
    current.target !== null &&
    current.target !== pathname
  ) {
    // A real Android Back/external navigation won the race.
    cancelPassage();
    return;
  }
  current.target = pathname;
  current.arrivedAt = pathname;
  current.ready = false;
  if (current.sealed) shell()?.setAttribute("data-passage", "waiting");
}

/** The destination explicitly confirms mounted content/data or visible failure. */
export function signalPassageReady(pathname: string): void {
  const current = active;
  if (!current || current.arrivedAt !== pathname || current.target !== pathname)
    return;
  current.ready = true;
  tryReveal();
}

/**
 * Cover became fully opaque. Never switch to waiting at partial alpha:
 * the underlying route is allowed to change only after this boundary.
 */
export function completePassageDeparture(): void {
  const current = active;
  if (!current || current.sealed) return;
  current.sealed = true;
  if (current.sealTimer !== undefined) clearTimeout(current.sealTimer);
  current.sealTimer = undefined;
  shell()?.setAttribute("data-passage", "waiting");
  const pendingWork = current.pendingWork;
  current.pendingWork = undefined;
  // A fresh frame keeps the fully opaque layer committed before heavy work.
  if (pendingWork) {
    if (
      typeof requestAnimationFrame === "function" &&
      document.visibilityState !== "hidden"
    )
      requestAnimationFrame(pendingWork);
    else queueMicrotask(pendingWork);
  }
  tryReveal();
}

/** CSS animationend cleanup; fallback handles background/no-event cases. */
export function completePassageAnimation(): void {
  if (shell()?.dataset.passage === "arriving") cancelPassage();
}

/** The route callback waits until the cover has sealed. No early crossfade. */
export function schedulePassage(action: () => void): () => void {
  let cancelled = false;
  let frame = 0;
  const current = active;
  const commit = () => {
    if (cancelled || (current && active?.id !== current.id)) return;
    action();
  };
  const dispatch = () => {
    if (cancelled) return;
    if (
      typeof requestAnimationFrame === "function" &&
      document.visibilityState !== "hidden" &&
      !reducedMotion()
    )
      frame = requestAnimationFrame(commit);
    else queueMicrotask(commit);
  };
  if (!current || current.sealed) queueMicrotask(commit);
  else current.pendingWork = dispatch;

  return () => {
    cancelled = true;
    if (current?.pendingWork === dispatch) current.pendingWork = undefined;
    if (frame) cancelAnimationFrame(frame);
  };
}
