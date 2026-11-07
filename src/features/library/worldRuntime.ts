import type { NarrativeSnapshot } from "./narrative/contracts";
import type { WorldSessionActivity } from "../../contracts/worldSessionActivity";
import type { AgencySnapshot } from "./inhabitantAgency";
import type { InhabitantAction, InhabitantKey } from "./inhabitants";
export interface WorldSelectableObject {
  readonly entryId?: string;
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
  "created" | "mounted" | "running" | "paused" | "failed" | "disposed";

export type WorldFixtureStatus = "idle" | "loading" | "ready" | "error";

export interface WorldRuntimeDiagnostics {
  readonly shaderPrograms?: number | null;
  readonly activePointLights?: number;
  readonly gpuTimer?: ReturnType<
    import("./three/gpuTimer").GpuTimer["snapshot"]
  >;
  readonly lightingExperiment?:
    import("./three/lightingExperiment").LightingExperiment | null;
  readonly frameIntervals?: import("./three/performanceProbe").Distribution & {
    readonly lateFramesOver33Ms: number;
  };
  readonly cpuMetrics?: Readonly<
    Partial<
      Record<
        import("./three/performanceProbe").ProbeStage,
        import("./three/performanceProbe").Distribution
      >
    >
  >;
  readonly longTasksSupported?: boolean;
  readonly jsHeapUsedBytes?: number | null;
  readonly activeFrameLoops: 0 | 1;
  readonly drawCalls: number;
  readonly fixtureLoadMs: number | null;
  readonly fixtureStatus: WorldFixtureStatus;
  readonly fps: number | null;
  readonly frameTimeMs: number | null;
  readonly geometries: number;
  readonly meshes: number;
  readonly materialTextureReferences: number;
  readonly performanceScenarioAssetsLoaded: number;
  readonly performanceScenarioAssetsTotal: number;
  readonly performanceScenarioId: string;
  readonly performanceScenarioLabel: string;
  readonly renderedFrames: number;
  readonly runtimeState: WorldRuntimeState;
  readonly sceneObjects: number;
  readonly selectableObjects: number;
  readonly textures: number;
  readonly timeToFirstUsableFrameMs: number | null;
  readonly triangles: number;
  readonly uniqueMaterialTextures: number;
}

export type WorldDiagnosticsListener = (
  diagnostics: WorldRuntimeDiagnostics,
) => void;

/**
 * A runtime belongs to one host session and can be mounted only once. Its
 * owner disposes it before mounting a replacement for that host.
 */
export interface WorldRuntime {
  setLightingExperiment?(
    value: import("./three/lightingExperiment").LightingExperiment | null,
  ): void;
  resetPerformanceProbe?(): void;
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
  getInhabitantSnapshot?(): AgencySnapshot | null;
  onInhabitantsChange?(
    listener: (snapshot: AgencySnapshot) => void,
  ): () => void;
  playInhabitantAction?(
    id: string,
    action: InhabitantAction,
  ): "playing" | "loading" | "unavailable" | "reduced";
  onInhabitantActivate?(listener: (key: InhabitantKey) => void): () => void;
  applyNarrative?(snapshot: NarrativeSnapshot): void;
  applyWorldSession?(activity: WorldSessionActivity | null): void;
  selectObject(id: string | null): void;
  dispose(): void;
}

export type WorldRuntimeFactory = () => Promise<WorldRuntime>;
