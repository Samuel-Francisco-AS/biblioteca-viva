export type SceneMotionId = "creature" | "highlighted-book" | "librarian";

export interface SceneMotionHandle {
  pause(): void;
  resume(): void;
  stop(): void;
}

export interface SceneMotionDefinition {
  readonly create: (onUnexpectedEnd: () => void) => SceneMotionHandle;
  readonly id: SceneMotionId;
}

export type MotionReconciliationReason =
  "initial" | "layout-mode-change" | "highlight-presence-change";

export interface SceneMotionSnapshot {
  readonly activeIds: readonly SceneMotionId[];
  readonly lastReason: MotionReconciliationReason | null;
  readonly reconciliations: number;
}

/** Owns only the tweens created by the library scene; it never uses killAll. */
export class SceneMotionLifecycle {
  private destroyed = false;
  private readonly handles = new Map<SceneMotionId, SceneMotionHandle>();
  private lastReason: MotionReconciliationReason | null = null;
  private paused = false;
  private reconciliations = 0;

  get activeCount(): number {
    return this.handles.size;
  }

  snapshot(): SceneMotionSnapshot {
    return {
      activeIds: [...this.handles.keys()].sort(),
      lastReason: this.lastReason,
      reconciliations: this.reconciliations,
    };
  }

  replace(
    definitions: readonly SceneMotionDefinition[],
    reason: MotionReconciliationReason,
  ): void {
    if (this.destroyed) return;
    this.stopCurrent();
    definitions.forEach((definition) => this.create(definition));
    this.recordReconciliation(reason);
  }

  replaceOne(
    definition: SceneMotionDefinition | undefined,
    id: SceneMotionId,
    reason: MotionReconciliationReason,
  ): void {
    if (this.destroyed) return;
    const previous = this.handles.get(id);
    this.handles.delete(id);
    previous?.stop();
    if (definition) this.create(definition);
    this.recordReconciliation(reason);
  }

  pause(): void {
    if (this.destroyed || this.paused) return;
    this.paused = true;
    this.handles.forEach((handle) => handle.pause());
  }

  resume(): void {
    if (this.destroyed || !this.paused) return;
    this.paused = false;
    this.handles.forEach((handle) => handle.resume());
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopCurrent();
  }

  private create(definition: SceneMotionDefinition): void {
    const created: { handle?: SceneMotionHandle } = {};
    const onUnexpectedEnd = () => {
      if (
        created.handle &&
        this.handles.get(definition.id) === created.handle
      ) {
        this.handles.delete(definition.id);
      }
    };
    created.handle = definition.create(onUnexpectedEnd);
    this.handles.set(definition.id, created.handle);
    if (this.paused) created.handle.pause();
  }

  private recordReconciliation(reason: MotionReconciliationReason): void {
    this.lastReason = reason;
    this.reconciliations += 1;
  }

  private stopCurrent(): void {
    const current = [...this.handles.values()];
    this.handles.clear();
    current.forEach((handle) => handle.stop());
  }
}
