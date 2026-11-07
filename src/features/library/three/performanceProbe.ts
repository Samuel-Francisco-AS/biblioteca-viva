/** Local opt-in CPU/RAF observations, never GPU or presentation timings. */
export const PROBE_CAPACITY = 4096;
export type ProbeStage =
  | "rafInterval"
  | "updateCpu"
  | "bookCpu"
  | "agencyCpu"
  | "effectsCpu"
  | "submitCpu"
  | "gestureToSubmit"
  | "longTask";
export interface Distribution {
  readonly count: number;
  readonly p50: number | null;
  readonly p95: number | null;
  readonly p99: number | null;
  readonly max: number | null;
}
export function distribution(values: readonly number[]): Distribution {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p: number) =>
    sorted.length
      ? sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)]
      : null;
  return {
    count: sorted.length,
    p50: percentile(0.5),
    p95: percentile(0.95),
    p99: percentile(0.99),
    max: sorted.at(-1) ?? null,
  };
}
export class PerformanceProbe {
  private readonly samples = new Map<ProbeStage, number[]>();
  private observer?: PerformanceObserver;
  private canvas?: HTMLCanvasElement;
  private inputAt?: number;
  private frameAt?: number;
  active = false;
  longTasksSupported = false;
  constructor(private readonly now: () => number) {}
  private readonly input = () => {
    if (this.inputAt === undefined) this.inputAt = this.now();
  };
  start(canvas: HTMLCanvasElement): void {
    if (this.active) return;
    this.active = true;
    this.canvas = canvas;
    for (const type of ["pointerdown", "pointermove", "pointerup"])
      canvas.addEventListener(type, this.input, {
        capture: true,
        passive: true,
      });
    this.longTasksSupported =
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes?.includes("longtask");
    if (this.longTasksSupported) {
      this.observer = new PerformanceObserver((list) => {
        if (this.active)
          for (const entry of list.getEntries())
            this.record("longTask", entry.duration);
      });
      this.observer.observe({ type: "longtask" });
    }
  }
  stop(): void {
    this.active = false;
    this.frameAt = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
    for (const type of ["pointerdown", "pointermove", "pointerup"])
      this.canvas?.removeEventListener(type, this.input, true);
    this.canvas = undefined;
    this.inputAt = undefined;
  }
  reset(): void {
    this.samples.clear();
    this.frameAt = undefined;
    this.inputAt = undefined;
    this.observer?.takeRecords();
  }
  frame(timestamp: number): void {
    if (!this.active) return;
    if (this.frameAt !== undefined)
      this.record("rafInterval", timestamp - this.frameAt);
    this.frameAt = timestamp;
  }
  record(stage: ProbeStage, value: number): void {
    if (!this.active || !Number.isFinite(value) || value < 0) return;
    const values = this.samples.get(stage) ?? [];
    if (values.length === PROBE_CAPACITY) values.shift();
    values.push(value);
    this.samples.set(stage, values);
  }
  submitted(): void {
    if (this.inputAt !== undefined) {
      this.record("gestureToSubmit", this.now() - this.inputAt);
      this.inputAt = undefined;
    }
  }
  snapshot(): Readonly<Partial<Record<ProbeStage, Distribution>>> {
    return Object.freeze(
      Object.fromEntries(
        [...this.samples].map(([key, values]) => [
          key,
          Object.freeze(distribution(values)),
        ]),
      ),
    );
  }
}
