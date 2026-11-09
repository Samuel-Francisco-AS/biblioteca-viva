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
}

export interface UiActionProbeSnapshot {
  readonly enabled: boolean;
  readonly observations: readonly UiActionObservation[];
}

const MAX_ACTIONS = 20;
const listeners = new Set<() => void>();
const startTimes = new Map<number, number>();
const arcanariumAreas = new Set([
  "duelos",
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
let snapshot: UiActionProbeSnapshot = { enabled: false, observations: [] };

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
  startTimes.clear();
  publish([], enabled);
}

function revise(sequenceId: number, patch: Partial<UiActionObservation>): void {
  if (!snapshot.enabled) return;
  const index = snapshot.observations.findIndex(
    (observation) => observation.sequence === sequenceId,
  );
  if (index < 0) return;
  publish(
    snapshot.observations.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    ),
  );
}

export function recordUiActionStart(args: {
  readonly source: UiActionObservation["source"];
  readonly kind: UiActionObservation["kind"];
  readonly from: string;
  readonly to: string | null;
}): void {
  if (!snapshot.enabled) return;
  const started = performance.now();
  const id = ++sequence;
  startTimes.set(id, started);
  while (startTimes.size > MAX_ACTIONS) {
    const oldest = startTimes.keys().next().value;
    if (oldest === undefined) break;
    startTimes.delete(oldest);
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
  const target = uiRouteCategory(pathname);
  const pending = [...snapshot.observations].reverse().find(
    (item) => item.to === target && item.routeCommitMs === null,
  );
  if (!pending) return;
  const started = startTimes.get(pending.sequence);
  if (started === undefined) return;
  revise(pending.sequence, {
    routeCommitMs: Math.max(0, performance.now() - started),
  });
}
