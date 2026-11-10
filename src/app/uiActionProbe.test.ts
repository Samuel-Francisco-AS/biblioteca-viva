import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  getUiActionProbeSnapshot,
  recordUiActionStart,
  recordUiRouteCommit,
  recordUiRouteContentCommit,
  recordUiReactRender,
  setUiActionProbeEnabled,
  subscribeUiActionProbe,
  uiRouteCategory,
} from "./uiActionProbe";
let callbacks: Map<number, FrameRequestCallback>, nextId: number;
beforeEach(() => {
  callbacks = new Map();
  nextId = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    callbacks.set(++nextId, cb);
    return nextId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));
});
afterEach(() => {
  setUiActionProbeEnabled(false);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function tick(t: number) {
  const batch = [...callbacks.values()];
  callbacks.clear();
  batch.forEach((cb) => cb(t));
}
const start = () =>
  recordUiActionStart({
    source: "dock",
    kind: "link",
    from: "/",
    to: "/colecao",
  });
it("keeps only route families without private route segments", () => {
  expect(uiRouteCategory("/registros/private/editar")).toBe("/registros/:id");
  expect(uiRouteCategory("/arcanario/duelos/arena/secret")).toBe(
    "/arcanario/duelos",
  );
  expect(uiRouteCategory("/arcanario/private")).toBe("/arcanario");
});
it("is idle by default and measures RAFs, route stages, render durations and frame tails when enabled", () => {
  start();
  expect(callbacks.size).toBe(0);
  setUiActionProbeEnabled(true);
  start();
  tick(0);
  tick(16);
  tick(80);
  recordUiRouteCommit("/colecao");
  recordUiRouteContentCommit("/colecao");
  const changed = vi.fn(),
    unsubscribe = subscribeUiActionProbe(changed);
  recordUiReactRender("route", "update", 7);
  expect(changed).not.toHaveBeenCalled(); // Profiler cannot trigger its own rerender.
  start(); // The next explicit probe publication includes the prior render work.
  expect(getUiActionProbeSnapshot().observations[0]).toMatchObject({
    reactRenderMs: 7,
    reactCommits: 1,
  });
  const observed = getUiActionProbeSnapshot().observations[0];
  expect(observed?.routeCommitMs).toBeTypeOf("number");
  expect(observed?.routeContentCommitMs).toBeTypeOf("number");
  expect(observed?.firstRafMs).toBeTypeOf("number");
  expect(observed?.secondRafMs).toBeTypeOf("number");
  expect(getUiActionProbeSnapshot().frameIntervals).toMatchObject({
    count: 2,
    p50: 16,
    p95: 64,
    p99: 64,
  });
  unsubscribe();
});
it("ignores obsolete callbacks even after disable/re-enable and disposes the sampling loop", () => {
  setUiActionProbeEnabled(true);
  start();
  const obsolete = [...callbacks.values()];
  setUiActionProbeEnabled(false);
  expect(callbacks.size).toBe(1); // action RAF is guarded, sampler cancelled
  setUiActionProbeEnabled(true);
  start();
  obsolete.forEach((cb) => cb(16));
  expect(getUiActionProbeSnapshot().observations[0]?.firstRafMs).toBeNull();
  setUiActionProbeEnabled(false);
  expect(getUiActionProbeSnapshot()).toMatchObject({
    enabled: false,
    observations: [],
    frameIntervals: { count: 0 },
  });
});
it("does not attribute a superseded route to an earlier intention and caps action history", () => {
  setUiActionProbeEnabled(true);
  start();
  recordUiActionStart({
    source: "dock",
    kind: "link",
    from: "/",
    to: "/arquivo",
  });
  recordUiRouteCommit("/colecao");
  expect(getUiActionProbeSnapshot().observations[0]?.routeCommitMs).toBeNull();
  for (let i = 0; i < 30; i++) start();
  expect(getUiActionProbeSnapshot().observations).toHaveLength(20);
});
it("observes long tasks only while enabled, without collecting attribution or DOM", () => {
  let receive:
    ((list: { getEntries(): { duration: number }[] }) => void) | undefined;
  const disconnect = vi.fn(),
    observe = vi.fn();
  vi.stubGlobal(
    "PerformanceObserver",
    class {
      static supportedEntryTypes = ["longtask"];
      constructor(cb: typeof receive) {
        receive = cb;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  setUiActionProbeEnabled(true);
  receive?.({ getEntries: () => [{ duration: 80 }, { duration: 120 }] });
  expect(getUiActionProbeSnapshot().longTasks).toEqual({
    count: 2,
    maxMs: 120,
    totalMs: 200,
  });
  setUiActionProbeEnabled(false);
  receive?.({ getEntries: () => [{ duration: 500 }] });
  expect(disconnect).toHaveBeenCalled();
  expect(getUiActionProbeSnapshot().longTasks.count).toBe(0);
});
