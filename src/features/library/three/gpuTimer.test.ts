import { expect, it, vi } from "vitest";
import { GpuTimer, type TimerContext } from "./gpuTimer";
function context(supported = true) {
  let available = false,
    disjoint = false;
  const result = vi.fn(() => 2_500_000);
  const created = vi.fn(() => ({})),
    deleted = vi.fn();
  const gl: TimerContext = {
    QUERY_RESULT_AVAILABLE: 1,
    QUERY_RESULT: 2,
    getExtension: () =>
      supported ? { TIME_ELAPSED_EXT: 3, GPU_DISJOINT_EXT: 4 } : null,
    getParameter: () => disjoint,
    getQueryParameter: (_q, p) => (p === 1 ? available : result()),
    createQuery: created,
    beginQuery: vi.fn(),
    endQuery: vi.fn(),
    deleteQuery: deleted,
    flush: vi.fn(),
    isContextLost: () => false,
  };
  return {
    gl,
    created,
    deleted,
    result,
    ready: () => {
      available = true;
    },
    disjoint: () => {
      disjoint = true;
    },
  };
}
it("polls only available results, bounds pending queries, deletes all resources", () => {
  const c = context(),
    timer = new GpuTimer(c.gl);
  for (let i = 0; i < 20; i++) {
    timer.begin();
    timer.end();
  }
  expect(c.created).toHaveBeenCalledTimes(4);
  expect(c.result).not.toHaveBeenCalled();
  c.ready();
  timer.begin();
  timer.end();
  expect(timer.snapshot()).toMatchObject({
    supported: true,
    milliseconds: { count: 4, p95: 2.5 },
  });
  expect(c.deleted).toHaveBeenCalledTimes(4);
  timer.dispose();
  timer.dispose();
  expect(c.deleted).toHaveBeenCalledTimes(5);
});
it("discards disjoint results and makes unsupported timers a no-op", () => {
  const c = context(),
    timer = new GpuTimer(c.gl);
  timer.begin();
  timer.end();
  c.ready();
  c.disjoint();
  timer.begin();
  expect(c.result).not.toHaveBeenCalled();
  expect(timer.snapshot()).toMatchObject({
    discarded: 1,
    milliseconds: { count: 0 },
  });
  timer.dispose();
  expect(c.deleted).toHaveBeenCalledOnce();
  const unsupported = context(false),
    absent = new GpuTimer(unsupported.gl);
  absent.begin();
  absent.end();
  absent.dispose();
  expect(absent.snapshot().supported).toBe(false);
  expect(unsupported.created).not.toHaveBeenCalled();
});
