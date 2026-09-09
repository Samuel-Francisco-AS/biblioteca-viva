export interface WorldSelectableObject {
  readonly id: string;
  readonly label: string;
}

export type WorldSelection = WorldSelectableObject | null;
export type WorldSelectionListener = (selection: WorldSelection) => void;

/**
 * A failure that makes the current runtime instance unusable. Its message is
 * safe for the host to show in the local fallback or record in diagnostics.
 */
export interface WorldRuntimeFailure {
  readonly code: "unavailable";
  readonly message: string;
}

export type WorldRuntimeFailureListener = (
  failure: WorldRuntimeFailure,
) => void;

export type WorldRuntimeState =
  "created" | "mounted" | "running" | "paused" | "disposed";

export type WorldFixtureStatus = "idle" | "loading" | "ready" | "error";

export interface WorldRuntimeDiagnostics {
  readonly activeFrameLoops: 0 | 1;
  readonly drawCalls: number;
  readonly fixtureLoadMs: number | null;
  readonly fixtureStatus: WorldFixtureStatus;
  readonly fps: number | null;
  readonly frameTimeMs: number | null;
  readonly geometries: number;
  readonly meshes: number;
  readonly renderedFrames: number;
  readonly runtimeState: WorldRuntimeState;
  readonly sceneObjects: number;
  readonly selectableObjects: number;
  readonly textures: number;
  readonly timeToFirstUsableFrameMs: number | null;
  readonly triangles: number;
}

export type WorldDiagnosticsListener = (
  diagnostics: WorldRuntimeDiagnostics,
) => void;

/**
 * A runtime belongs to one host session and can be mounted only once. Its
 * owner disposes it before mounting a replacement for that host.
 */
export interface WorldRuntime {
  getDiagnostics(): WorldRuntimeDiagnostics;
  getSelectableObjects(): readonly WorldSelectableObject[];
  mount(host: HTMLElement): void;
  onDiagnosticsChange(listener: WorldDiagnosticsListener): () => void;
  onFailure(listener: WorldRuntimeFailureListener): () => void;
  onSelectionChange(listener: WorldSelectionListener): () => void;
  start(): void;
  pause(): void;
  resume(): void;
  resize(): void;
  selectObject(id: string | null): void;
  dispose(): void;
}

export type WorldRuntimeFactory = () => Promise<WorldRuntime>;
