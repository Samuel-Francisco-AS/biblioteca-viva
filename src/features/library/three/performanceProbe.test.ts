import { expect, it, vi } from "vitest";
import {
  PerformanceProbe,
  distribution,
  PROBE_CAPACITY,
} from "./performanceProbe";
import { FrameMetricsWindow } from "./frameMetrics";
it("measures outliers with nearest-rank percentiles and bounded storage", () => {
  const values = Array.from({ length: 100 }, (_, i) => (i < 95 ? 16 : 100));
  expect(distribution(values)).toMatchObject({
    p50: 16,
    p95: 16,
    p99: 100,
    max: 100,
  });
  const probe = new PerformanceProbe(() => 0);
  probe.record("updateCpu", 10);
  expect(probe.snapshot()).toEqual({});
  const canvas = document.createElement("canvas");
  probe.start(canvas);
  for (let i = 0; i < PROBE_CAPACITY * 2; i++) probe.record("updateCpu", i);
  expect(probe.snapshot().updateCpu?.count).toBe(PROBE_CAPACITY);
  probe.stop();
  probe.record("updateCpu", 9999);
  expect(probe.snapshot().updateCpu?.max).toBe(PROBE_CAPACITY * 2 - 1);
  const metrics = new FrameMetricsWindow(1000);
  [0, 16, 32, 132].forEach((t) => metrics.record(t));
  expect(metrics.distribution()).toMatchObject({
    count: 3,
    p99: 100,
    lateFramesOver33Ms: 1,
  });
  metrics.reset();
  expect(metrics.distribution().count).toBe(0);
});
it("timestamps gesture receipt to submission, and detaches on pause/disposal", () => {
  let time = 5;
  const probe = new PerformanceProbe(() => time);
  const canvas = document.createElement("canvas");
  const remove = vi.spyOn(canvas, "removeEventListener");
  probe.start(canvas);
  canvas.dispatchEvent(new Event("pointermove"));
  time = 20;
  probe.submitted();
  expect(probe.snapshot().gestureToSubmit?.p50).toBe(15);
  probe.stop();
  expect(remove).toHaveBeenCalledTimes(3);
  canvas.dispatchEvent(new Event("pointermove"));
  time = 100;
  probe.submitted();
  expect(probe.snapshot().gestureToSubmit?.count).toBe(1);
});
it("captures a full dusk interval and resets experiments without mixing pause gaps", () => {
  const probe = new PerformanceProbe(() => 0),
    canvas = document.createElement("canvas");
  probe.start(canvas);
  for (let i = 0; i <= 2700; i++) probe.frame((i * 1000) / 60);
  expect(probe.snapshot().rafInterval).toMatchObject({ count: 2700 });
  expect(probe.snapshot().rafInterval?.p95).toBeCloseTo(1000 / 60);
  probe.reset();
  probe.frame(100000);
  probe.frame(100020);
  expect(probe.snapshot().rafInterval).toMatchObject({ count: 1, p99: 20 });
  probe.stop();
  probe.start(canvas);
  probe.frame(200000);
  expect(probe.snapshot().rafInterval?.count).toBe(1);
  probe.stop();
});
