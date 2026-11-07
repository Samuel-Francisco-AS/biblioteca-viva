import { distribution } from "./performanceProbe";

interface TimerExtension {
  readonly TIME_ELAPSED_EXT: number;
  readonly GPU_DISJOINT_EXT: number;
}
/** Narrow WebGL2 surface also permits deterministic lifecycle tests. */
export interface TimerContext {
  readonly QUERY_RESULT_AVAILABLE: number;
  readonly QUERY_RESULT: number;
  getExtension(name: string): unknown;
  getParameter(parameter: number): unknown;
  getQueryParameter(query: WebGLQuery, parameter: number): unknown;
  createQuery(): WebGLQuery | null;
  beginQuery(target: number, query: WebGLQuery): void;
  endQuery(target: number): void;
  deleteQuery(query: WebGLQuery): void;
  isContextLost(): boolean;
  flush(): void;
}
function timerExtension(value: unknown): value is TimerExtension {
  return (
    typeof value === "object" &&
    value !== null &&
    "TIME_ELAPSED_EXT" in value &&
    typeof value.TIME_ELAPSED_EXT === "number" &&
    "GPU_DISJOINT_EXT" in value &&
    typeof value.GPU_DISJOINT_EXT === "number"
  );
}
/** Never waits, finishes or reads an unavailable query. No RAF/timer of its own. */
export class GpuTimer {
  private readonly extension: TimerExtension | null;
  private readonly pending: WebGLQuery[] = [];
  private active: WebGLQuery | null = null;
  private readonly samples: number[] = [];
  private cursor = 0;
  private discarded = 0;
  constructor(private readonly gl: TimerContext) {
    const extension = gl.getExtension("EXT_disjoint_timer_query_webgl2");
    this.extension = timerExtension(extension) ? extension : null;
  }
  snapshot() {
    return {
      supported: this.extension !== null,
      discarded: this.discarded,
      milliseconds: distribution(this.samples),
    };
  }
  begin(): void {
    const ext = this.extension;
    const gl = this.gl;
    if (!ext || gl.isContextLost()) return;
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) {
      this.discarded += this.pending.length;
      this.clearQueries();
      return;
    }
    while (
      this.pending.length &&
      gl.getQueryParameter(this.pending[0], gl.QUERY_RESULT_AVAILABLE)
    ) {
      const query = this.pending.shift()!;
      const ns = gl.getQueryParameter(query, gl.QUERY_RESULT);
      if (typeof ns === "number" && Number.isFinite(ns) && ns >= 0) {
        if (this.samples.length < 4096) this.samples.push(ns / 1e6);
        else {
          this.samples[this.cursor] = ns / 1e6;
          this.cursor = (this.cursor + 1) % 4096;
        }
      }
      gl.deleteQuery(query);
    }
    if (this.pending.length >= 4) return;
    this.active = gl.createQuery();
    if (this.active) gl.beginQuery(ext.TIME_ELAPSED_EXT, this.active);
  }
  end(): void {
    if (!this.active || !this.extension) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.gl.flush();
    this.pending.push(this.active);
    this.active = null;
  }
  private clearQueries(): void {
    for (const query of this.pending) this.gl.deleteQuery(query);
    this.pending.length = 0;
  }
  dispose(): void {
    if (this.active && this.extension) {
      this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
      this.gl.deleteQuery(this.active);
      this.active = null;
    }
    this.clearQueries();
  }
}
