export const FRAME_METRICS_WINDOW_MS = 750;

export interface FrameMetricsSnapshot {
  readonly fps: number | null;
  readonly frameTimeMs: number | null;
}

export class FrameMetricsWindow {
  private readonly timestamps: number[] = [];

  constructor(private readonly windowMs = FRAME_METRICS_WINDOW_MS) {
    if (windowMs <= 0)
      throw new Error("Frame metrics window must be positive.");
  }

  record(timestamp: number): FrameMetricsSnapshot {
    const previous = this.timestamps.at(-1);
    if (previous !== undefined && timestamp < previous) this.reset();
    this.timestamps.push(timestamp);
    this.prune(timestamp);
    return this.snapshot();
  }

  reset(): void {
    this.timestamps.length = 0;
  }

  snapshot(): FrameMetricsSnapshot {
    const first = this.timestamps[0];
    const last = this.timestamps.at(-1);
    const intervals = this.timestamps.length - 1;
    if (
      first === undefined ||
      last === undefined ||
      intervals < 1 ||
      last <= first
    ) {
      return { fps: null, frameTimeMs: null };
    }

    const elapsed = last - first;
    return {
      fps: (intervals * 1_000) / elapsed,
      frameTimeMs: elapsed / intervals,
    };
  }

  private prune(latestTimestamp: number): void {
    const cutoff = latestTimestamp - this.windowMs;
    while (
      this.timestamps.length > 2 &&
      (this.timestamps[1] ?? latestTimestamp) <= cutoff
    ) {
      this.timestamps.shift();
    }
  }
}
