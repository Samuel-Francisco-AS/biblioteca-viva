import type { LibraryVisualHostState } from "./contracts";

export interface LibraryVisualDiagnosticsSnapshot {
  readonly activeInstances: number;
  readonly createdInstances: number;
  readonly destroyedInstances: number;
  readonly generation: number;
  readonly state: LibraryVisualHostState;
}

export interface LibraryVisualDiagnostics {
  snapshot(this: void): LibraryVisualDiagnosticsSnapshot;
  subscribe(this: void, listener: () => void): () => void;
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
    createdInstances: 0,
    destroyedInstances: 0,
    generation: 0,
    state: "destroyed",
  };
  const listeners = new Set<() => void>();

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  return {
    snapshot: () => snapshot,
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
