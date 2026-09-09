import { describe, expect, it } from "vitest";

import { FrameMetricsWindow } from "./frameMetrics";

describe("FrameMetricsWindow", () => {
  it("calcula FPS e tempo médio entre frames sobre uma janela móvel", () => {
    const metrics = new FrameMetricsWindow(750);

    for (let timestamp = 0; timestamp <= 1_000; timestamp += 20) {
      metrics.record(timestamp);
    }

    expect(metrics.snapshot().fps).toBeCloseTo(50, 8);
    expect(metrics.snapshot().frameTimeMs).toBeCloseTo(20, 8);
  });

  it("não inventa medição antes de existir um intervalo", () => {
    const metrics = new FrameMetricsWindow();

    expect(metrics.snapshot()).toEqual({ fps: null, frameTimeMs: null });
    expect(metrics.record(100)).toEqual({ fps: null, frameTimeMs: null });
  });

  it("reinicia explicitamente e também diante de relógio regressivo", () => {
    const metrics = new FrameMetricsWindow();
    metrics.record(100);
    metrics.record(120);
    expect(metrics.snapshot().fps).toBeCloseTo(50, 8);

    metrics.reset();
    expect(metrics.snapshot()).toEqual({ fps: null, frameTimeMs: null });

    metrics.record(200);
    expect(metrics.record(150)).toEqual({ fps: null, frameTimeMs: null });
  });
});
