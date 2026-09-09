export interface WorldSelectableObject {
  readonly id: string;
  readonly label: string;
}

export type WorldSelection = WorldSelectableObject | null;
export type WorldSelectionListener = (selection: WorldSelection) => void;

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

export interface WorldRuntime {
  getDiagnostics(): WorldRuntimeDiagnostics;
  getSelectableObjects(): readonly WorldSelectableObject[];
  mount(host: HTMLElement): void;
  onDiagnosticsChange(listener: WorldDiagnosticsListener): () => void;
  onSelectionChange(listener: WorldSelectionListener): () => void;
  start(): void;
  pause(): void;
  resume(): void;
  resize(): void;
  selectObject(id: string | null): void;
  dispose(): void;
}

export type WorldRuntimeFactory = () => Promise<WorldRuntime>;
