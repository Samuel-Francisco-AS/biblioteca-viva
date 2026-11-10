/** Bounded local diagnostics share percentile math, not renderer lifecycle. */
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
