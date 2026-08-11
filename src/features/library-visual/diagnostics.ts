import type { LibraryVisualHostState } from "./contracts";

export interface LibraryVisualDiagnosticsSnapshot {
  readonly activeTweens: number | null;
  readonly activeInstances: number;
  readonly activeLifecycleListeners: number;
  readonly activeObservers: number;
  readonly canvasCount: number;
  readonly createdInstances: number;
  readonly creationDurationMs: number | null;
  readonly displayObjects: number | null;
  readonly fps: number | null;
  readonly destroyedInstances: number;
  readonly generation: number;
  readonly interactiveZones: number | null;
  readonly libraryPreparationDurationMs: number | null;
  readonly state: LibraryVisualHostState;
}

export interface LibraryVisualDiagnostics {
  snapshot(this: void): LibraryVisualDiagnosticsSnapshot;
  subscribe(this: void, listener: () => void): () => void;
  resources(
    this: void,
    resources: Partial<
      Pick<
        LibraryVisualDiagnosticsSnapshot,
        | "activeLifecycleListeners"
        | "activeObservers"
        | "canvasCount"
        | "creationDurationMs"
        | "activeTweens"
        | "displayObjects"
        | "fps"
        | "interactiveZones"
        | "libraryPreparationDurationMs"
      >
    >,
  ): void;
  transition(
    this: void,
    state: LibraryVisualHostState,
    generation: number,
    activeInstances: number,
    createdInstance?: boolean,
    destroyedInstance?: boolean,
  ): void;
}

export function createLibraryVisualDiagnostics(): LibraryVisualDiagnostics {
  let snapshot: LibraryVisualDiagnosticsSnapshot = {
    activeInstances: 0,
    activeTweens: null,
    activeLifecycleListeners: 0,
    activeObservers: 0,
    canvasCount: 0,
    createdInstances: 0,
    creationDurationMs: null,
    displayObjects: null,
    fps: null,
    destroyedInstances: 0,
    generation: 0,
    interactiveZones: null,
    libraryPreparationDurationMs: null,
    state: "destroyed",
  };
  const listeners = new Set<() => void>();

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  return {
    snapshot: () => snapshot,
    resources(resources) {
      snapshot = { ...snapshot, ...resources };
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    transition(
      state,
      generation,
      activeInstances,
      createdInstance = false,
      destroyedInstance = false,
    ) {
      snapshot = {
        ...snapshot,
        activeInstances,
        createdInstances: snapshot.createdInstances + (createdInstance ? 1 : 0),
        destroyedInstances:
          snapshot.destroyedInstances + (destroyedInstance ? 1 : 0),
        generation,
        state,
      };
      notify();
    },
  };
}
