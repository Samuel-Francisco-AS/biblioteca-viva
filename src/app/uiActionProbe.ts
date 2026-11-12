import { distribution, type Distribution } from "../performanceDistribution";

/**
 * BV-UXC R4: optional, volatile action-to-RAF instrumentation. No event
 * text, personal content, record/deck IDs, DOM snapshots, storage or network.
 *
 * RAF callbacks do not prove that the GPU has presented the pixels.
 */
export interface UiActionObservation {
  readonly sequence: number;
  readonly source: "dock" | "arcanarium" | "library-controls" | "other";
  readonly kind: "link" | "control";
  readonly from: string;
  readonly to: string | null;
  readonly firstRafMs: number | null;
  readonly secondRafMs: number | null;
  readonly routeCommitMs: number | null;
  readonly routeContentCommitMs: number | null;
  readonly reactRenderMs: number;
  readonly reactCommits: number;
}

export interface UiActionProbeSnapshot {
  readonly enabled: boolean;
  readonly observations: readonly UiActionObservation[];
  readonly frameIntervals: Distribution;
  readonly longTasks: {
    readonly count: number;
    readonly maxMs: number;
    readonly totalMs: number;
  };
}

const MAX_ACTIONS = 20;
const listeners = new Set<() => void>();
const startTimes = new Map<number, number>();
const arcanariumAreas = new Set([
  "acervo",
  "pacotes",
  "relicario",
  "cartas",
  "baralhos",
  "oficina",
  "ecos",
  "provacoes",
  "assuntos",
  "diagnostico",
  "importar",
]);
const staticRoutes = new Set([
  "colecao",
  "arquivo",
  "estatisticas",
  "configuracoes",
  "novo-registro",
]);
let sequence = 0;
const frames: number[] = [];
const reactWork = new Map<
  number,
  { reactRenderMs: number; reactCommits: number }
>();
let longTasks = { count: 0, maxMs: 0, totalMs: 0 };
let frame = 0;
let lastFrame: number | undefined;
let observer: PerformanceObserver | undefined;
let generation = 0;
let snapshot: UiActionProbeSnapshot = {
  enabled: false,
  observations: [],
  frameIntervals: distribution([]),
  longTasks,
};

/** Store categories only. UUIDs, titles and dynamic route segments stay out. */
export function uiRouteCategory(pathname: string): string {
  const segments = pathname.split(/[/?#]/).filter(Boolean);
  const root = segments[0];
  if (!root) return "/";
  if (root === "arcanario") {
    const room = segments[1];
    return room && arcanariumAreas.has(room)
      ? `/arcanario/${room}`
      : "/arcanario";
  }
  if (staticRoutes.has(root)) return `/${root}`;
  if (root === "registros" || root === "livros") return `/${root}/:id`;
  return "/other";
}

function publish(
  observations: readonly UiActionObservation[],
  enabled = snapshot.enabled,
  notify = true,
) {
  snapshot = {
    enabled,
    observations: observations.map((item) => ({
      ...item,
      ...reactWork.get(item.sequence),
    })),
    frameIntervals: distribution(frames),
    longTasks,
  };
  if (notify) for (const listener of listeners) listener();
}

export function getUiActionProbeSnapshot(): UiActionProbeSnapshot {
  return snapshot;
}

export function subscribeUiActionProbe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function resetFrameBoundary(): void {
  lastFrame = undefined;
}

export function setUiActionProbeEnabled(enabled: boolean): void {
  generation++;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  lastFrame = undefined;
  frames.length = 0;
  observer?.disconnect();
  observer = undefined;
  longTasks = { count: 0, maxMs: 0, totalMs: 0 };
  startTimes.clear();
  reactWork.clear();
  document.removeEventListener("visibilitychange", resetFrameBoundary);
  publish([], enabled);
  if (!enabled) return;
  document.addEventListener("visibilitychange", resetFrameBoundary);
  const token = generation;
  const tick = (timestamp: number) => {
    if (token !== generation) return;
    if (document.visibilityState !== "hidden") {
      if (lastFrame !== undefined) {
        if (frames.length === 600) frames.shift();
        frames.push(timestamp - lastFrame);
      }
      lastFrame = timestamp;
    } else lastFrame = undefined;
    frame = requestAnimationFrame(tick);
  };
  if (typeof requestAnimationFrame === "function")
    frame = requestAnimationFrame(tick);
  if (
    typeof PerformanceObserver !== "undefined" &&
    PerformanceObserver.supportedEntryTypes?.includes("longtask")
  ) {
    observer = new PerformanceObserver((list) => {
      if (token !== generation) return;
      for (const entry of list.getEntries()) {
        longTasks = {
          count: longTasks.count + 1,
          maxMs: Math.max(longTasks.maxMs, entry.duration),
          totalMs: longTasks.totalMs + entry.duration,
        };
      }
      publish(snapshot.observations);
    });
    observer.observe({ type: "longtask" });
  }
}

function revise(
  sequenceId: number,
  patch: Partial<UiActionObservation>,
  notify = true,
): void {
  if (!snapshot.enabled) return;
  const index = snapshot.observations.findIndex(
    (observation) => observation.sequence === sequenceId,
  );
  if (index < 0) return;
  publish(
    snapshot.observations.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    ),
    snapshot.enabled,
    notify,
  );
}

export function recordUiActionStart(args: {
  readonly source: UiActionObservation["source"];
  readonly kind: UiActionObservation["kind"];
  readonly from: string;
  readonly to: string | null;
}): void {
  if (!snapshot.enabled) return;
  const token = generation;
  const started = performance.now();
  const id = ++sequence;
  startTimes.set(id, started);
  while (startTimes.size > MAX_ACTIONS) {
    const oldest = startTimes.keys().next().value;
    if (oldest === undefined) break;
    startTimes.delete(oldest);
    reactWork.delete(oldest);
  }
  publish([
    ...snapshot.observations.slice(-MAX_ACTIONS + 1),
    {
      sequence: id,
      source: args.source,
      kind: args.kind,
      from: uiRouteCategory(args.from),
      to: args.to === null ? null : uiRouteCategory(args.to),
      firstRafMs: null,
      secondRafMs: null,
      routeCommitMs: null,
      routeContentCommitMs: null,
      reactRenderMs: 0,
      reactCommits: 0,
    },
  ]);
  if (typeof requestAnimationFrame !== "function") return;
  requestAnimationFrame(() => {
    if (token !== generation) return;
    revise(id, { firstRafMs: Math.max(0, performance.now() - started) });
    requestAnimationFrame(() => {
      if (token !== generation) return;
      revise(id, { secondRafMs: Math.max(0, performance.now() - started) });
    });
  });
}

export function recordUiRouteCommit(pathname: string): void {
  if (!snapshot.enabled) return;
  const target = uiRouteCategory(pathname);
  const latest = snapshot.observations.at(-1);
  const pending =
    latest?.to === target && latest.routeCommitMs === null ? latest : undefined;
  if (!pending) return;
  const started = startTimes.get(pending.sequence);
  if (started === undefined) return;
  revise(pending.sequence, {
    routeCommitMs: Math.max(0, performance.now() - started),
  });
}

/** React duration covers render/reconciliation, not layout, GPU or commit work. */
export function recordUiReactRender(
  _id: string,
  _phase: string,
  actualDuration: number,
): void {
  if (!snapshot.enabled) return;
  const action = snapshot.observations.at(-1);
  if (!action) return;
  const started = startTimes.get(action.sequence);
  if (started === undefined || performance.now() - started > 1000) return;
  // Never publish or change useSyncExternalStore's snapshot inside a Profiler
  // commit: that would instrument the diagnostic's own render recursively.
  const previous = reactWork.get(action.sequence);
  reactWork.set(action.sequence, {
    reactRenderMs: (previous?.reactRenderMs ?? 0) + actualDuration,
    reactCommits: (previous?.reactCommits ?? 0) + 1,
  });
}

/** Destination subtree committed beyond Suspense; data loading can continue. */
export function recordUiRouteContentCommit(pathname: string): void {
  if (!snapshot.enabled) return;
  const action = snapshot.observations.at(-1);
  if (
    !action ||
    action.to !== uiRouteCategory(pathname) ||
    action.routeContentCommitMs !== null
  )
    return;
  const started = startTimes.get(action.sequence);
  if (started !== undefined)
    revise(action.sequence, {
      routeContentCommitMs: performance.now() - started,
    });
}
