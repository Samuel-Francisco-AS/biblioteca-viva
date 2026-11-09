/**
 * BV-UXC R4: opt-in, volatile input-to-RAF instrumentation across dock,
 * Arcanário and ordinary React controls. No input text, personal content,
 * DOM snapshots, network calls, storage or telemetry is collected.
 *
 * RAF callback timings are NOT equivalent to pixels being presented on GPU.
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
}
export interface UiActionProbeSnapshot {
  readonly enabled: boolean;
  readonly observations: readonly UiActionObservation[];
}
const MAX_ACTIONS = 20;
const listeners = new Set<() => void>();
let sequence = 0;
let snapshot: UiActionProbeSnapshot = {
  enabled: false,
  observations: [],
};
function publish(observations: readonly UiActionObservation[], enabled = snapshot.enabled) {
  snapshot = { enabled, observations };
  for (const listener of listeners) listener();
}
export function getUiActionProbeSnapshot(): UiActionProbeSnapshot {
  return snapshot;
}
export function subscribeUiActionProbe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function setUiActionProbeEnabled(enabled: boolean): void {
  sequence = 0;
  publish([], enabled);
}
function revise(sequenceId: number, patch: Partial<UiActionObservation>): void {
  if (!snapshot.enabled) return;
  const index = snapshot.observations.findIndex(
    (observation) => observation.sequence === sequenceId,
  );
  if (index < 0) return;
  publish(snapshot.observations.map((item, i) =>
    i === index ? { ...item, ...patch } : item,
  ));
}
export function recordUiAction(args: {
  readonly source: UiActionObservation["source"];
  readonly kind: UiActionObservation["kind"];
  readonly from: string;
  readonly to: string | null;
}): void {
  if (!snapshot.enabled) return;
  const started = performance.now();
  const id = ++sequence;
  publish([
    ...snapshot.observations.slice(-MAX_ACTIONS + 1),
    {
      sequence: id,
      ...args,
      firstRafMs: null,
      secondRafMs: null,
      routeCommitMs: null,
    },
  ]);
  if (typeof requestAnimationFrame !== "function") return;
  requestAnimationFrame(() => {
    revise(id, { firstRafMs: Math.max(0, performance.now() - started) });
    requestAnimationFrame(() => {
      revise(id, { secondRafMs: Math.max(0, performance.now() - started) });
    });
  });
}
export function recordUiRouteCommit(pathname: string): void {
  if (!snapshot.enabled) return;
  const pending = [...snapshot.observations].reverse().find(
    (item) => item.to === pathname && item.routeCommitMs === null,
  );
  if (!pending) return;
  // Mouse/action timestamps are relative to input receipt, not a DOM paint.
  // The click's clock isn't kept in persistent state, only in this process.
  const started = startTimes.get(pending.sequence);
  if (started === undefined) return;
  revise(pending.sequence, {
    routeCommitMs: Math.max(0, performance.now() - started),
  });
}
const startTimes = new Map<number, number>();
export function recordUiActionStart(args: Parameters<typeof recordUiAction>[0]): void {
  if (!snapshot.enabled) return;
  const id = sequence + 1;
  startTimes.set(id, performance.now());
  while (startTimes.size > MAX_ACTIONS) {
    const oldest = startTimes.keys().next().value;
    if (oldest === undefined) break;
    startTimes.delete(oldest);
  }
  recordUiAction(args);
}
