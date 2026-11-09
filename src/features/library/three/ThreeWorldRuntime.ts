import { createOrbitalArena } from "./orbitalArena";
import { createBoundedPointLighting } from "./boundedPointLighting";
import { GpuTimer } from "./gpuTimer";
import type { LightingExperiment } from "./lightingExperiment";
import { batchStaticBookshelf } from "./staticVisuals";
import { createSessionBookVisuals } from "./sessionBookVisuals";
import { createAmbientMagic } from "./ambientMagic";
import { createLivingScrollVisuals } from "./livingScrollVisuals";
import { createNarrativeVisuals } from "./narrativeVisuals";
import type { NarrativeSnapshot } from "../narrative/contracts";
import { STORIES } from "../narrative/stories";
import { nodeFor } from "../narrative/session";
import { InhabitantAgency, type AgencySnapshot } from "../inhabitantAgency";
import type { InhabitantContinuitySnapshot } from "../inhabitantContinuity";
import { InhabitantNavigation } from "../inhabitantNavigation";
import { collectInhabitantObstacles } from "./inhabitantObstacles";
import { createInhabitantSceneProps } from "./inhabitantSceneProps";
import {
  INHABITANTS,
  INHABITANT_ENVELOPES,
  type InhabitantAction,
  type InhabitantKey,
} from "../inhabitants";
import {
  createInhabitantVisuals,
  type InhabitantLoader,
} from "./inhabitantVisuals";
import { createLivingVisuals } from "./livingVisuals";
import type { LivingSession } from "../livingObjects";
import type { NightLightingSession } from "../nightLighting";
import { LIBRARY_SHELVES } from "../libraryShelfLayout";
import { LIBRARY_ROOMS } from "../libraryBuildingGeometry";
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PointLight,
  Object3D,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import type {
  WorldDiagnosticsListener,
  WorldFixtureStatus,
  WorldRuntime,
  WorldRuntimeDiagnostics,
  WorldRuntimeFailureListener,
  WorldRuntimeState,
  WorldSelectableObject,
  WorldSelection,
  WorldSelectionListener,
} from "../worldRuntime";
import type { ReadingAreaBook } from "../readingAreaBookContract";
import type { WorldSessionActivity } from "../../../contracts/worldSessionActivity";
import { createSessionWorldVisuals } from "./sessionWorldVisuals";
import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import {
  assignLibraryRecordSlots,
  type LibraryRecordPlacement,
} from "../libraryRecordLayout";
import { createProceduralLibraryBuilding } from "./proceduralLibraryBuilding";
import {
  createLibraryRecordComposition,
  replaceLibraryRecordRepresentation,
  type LibraryRecordVisual,
} from "./libraryRecordComposition";
import type {
  BookRecordFactory,
  RecordAssetFactory,
} from "./recordAssetContract";
import { type QuestProbeEvent, PerformanceProbe } from "./performanceProbe";
import { FrameMetricsWindow } from "./frameMetrics";
import {
  CAMERA_REFERENCE_HALF_HEIGHT,
  CAMERA_REFERENCE_HALF_WIDTH,
} from "./cameraMath";
import { CameraNavigation } from "./CameraNavigation";
import type { PerformanceScenario } from "./performanceScenarios";
import {
  createReferenceScene,
  disposeObjectTree,
  REFERENCE_SCENE_PROXY_TYPES,
  type ReferenceScene,
} from "./referenceScene";
import {
  createProceduralComposition,
  READING_SHELF_COMPOSITION_DEFINITIONS,
  replaceProceduralBookshelfRepresentation,
  type ProceduralComposition,
  type ProceduralRepresentationReplacement,
} from "./proceduralComposition";
import { collectSceneTextureMetrics } from "./sceneTextureMetrics";
import { ThreeWorldInteraction } from "./ThreeWorldInteraction";
import {
  reconcileReadingAreaBookVisuals,
  replaceReadingAreaBookRepresentation,
  validateReadingAreaBookSnapshot,
  type ReadingAreaBookVisual,
} from "./readingAreaBookVisuals";

interface RendererInfo {
  readonly programs?: readonly unknown[] | null;
  readonly memory: {
    readonly geometries: number;
    readonly textures: number;
  };
  readonly render: {
    readonly calls: number;
    readonly triangles: number;
  };
}

export interface ThreeWorldRenderer {
  readonly domElement: HTMLCanvasElement;
  readonly info?: RendererInfo;
  readonly shadowMap: { enabled: boolean };
  dispose(): void;
  forceContextLoss?(): void;
  getContext?(): WebGLRenderingContext | WebGL2RenderingContext;
  render(scene: Scene, camera: OrthographicCamera): void;
  setPixelRatio(value: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
}

interface FrameScheduler {
  cancel(frameId: number): void;
  request(callback: FrameRequestCallback): number;
}

export interface FixtureModelLoader {
  load(
    url: string,
    onLoad: (model: Object3D) => void,
    onError: (error: unknown) => void,
  ): void;
}

export interface ThreeWorldRuntimeDependencies {
  /** Host-mounted production scenes allow touch feedback to paint before picking. */
  readonly deferPicking?: boolean;
  readonly livingSession?: LivingSession;
  readonly nightLighting?: NightLightingSession;
  readonly inhabitantLoader?: InhabitantLoader;
  readonly inhabitantContinuity?: InhabitantContinuitySnapshot;
  readonly onInhabitantCheckpoint?: (
    snapshot: InhabitantContinuitySnapshot,
  ) => void;
  readonly createRenderer?: () => ThreeWorldRenderer;
  readonly fixtureLoader?: FixtureModelLoader;
  readonly frameScheduler?: FrameScheduler;
  readonly now?: () => number;
  readonly performanceScenario?: PerformanceScenario;
  /** Optional immutable logical snapshot; no query or domain object enters Three. */
  readonly readingAreaBooks?: readonly ReadingAreaBook[];
  /** Optional BF-3B snapshot; mutually exclusive with readingAreaBooks. */
  readonly libraryWorldSnapshot?: LibraryWorldSnapshot;
}

const defaultFrameScheduler: FrameScheduler = {
  cancel: (frameId) => window.cancelAnimationFrame(frameId),
  request: (callback) => window.requestAnimationFrame(callback),
};

const FIXTURE_SELECTABLE: WorldSelectableObject = Object.freeze({
  id: "fixture-pyramid",
  label: "Pirâmide técnica",
});

const READING_SHELF_LABELS: Readonly<Record<string, string>> = Object.freeze({
  "reading-shelf-01": "Estante de leitura 1",
  "reading-shelf-02": "Estante de leitura 2",
  "reading-shelf-03": "Estante de leitura 3",
});

const LIBRARY_RECORD_LABELS: Readonly<
  Record<LibraryRecordPlacement["modelTypeId"], string>
> = Object.freeze({
  "movie-record": "Filme",
  "series-record": "Série",
  "study-record": "Estudo",
  "physical-activity-record": "Atividade física",
  "work-record": "Trabalho",
});

function readingShelfLabel(instanceId: string): string {
  const label = READING_SHELF_LABELS[instanceId];
  if (!label) {
    throw new Error(
      `A composição procedural não possui rótulo para instanceId: ${instanceId}.`,
    );
  }
  return label;
}

function createFunctionalAreaScenario(): PerformanceScenario {
  return Object.freeze({
    assets: Object.freeze([]),
    description: "Área de leitura procedural sem fixture diagnóstica F1.",
    id: "f1-baseline",
    label: "Área de leitura",
  });
}

const DIAGNOSTICS_PUBLISH_INTERVAL_MS = 250;

function createFixtureLoader(): FixtureModelLoader {
  const loader = new GLTFLoader();
  return {
    load: (url, onLoad, onError) => {
      loader.load(url, (gltf) => onLoad(gltf.scene), undefined, onError);
    },
  };
}

/** Resources that live and are released together for one runtime mount. */
class ThreeWorldMount {
  private disposed = false;
  private frameGeneration = 0;
  private readonly fixtures: Object3D[] = [];
  private interaction: ThreeWorldInteraction | undefined;
  private proceduralComposition: ProceduralComposition | undefined;
  private libraryBuilding: Group | undefined;
  private libraryRecords: Group | undefined;
  private referenceScene: ReferenceScene | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private webglContextLostListener: ((event: Event) => void) | undefined;
  private webglContextRestoredListener: (() => void) | undefined;
  private visibilityListener: (() => void) | undefined;
  private windowResizeListener: (() => void) | undefined;

  private constructor(
    readonly host: HTMLElement,
    readonly renderer: ThreeWorldRenderer,
    readonly scene: Scene,
    readonly camera: OrthographicCamera,
    private readonly frameScheduler: FrameScheduler,
    private frameId: number | undefined = undefined,
  ) {}

  static create(
    host: HTMLElement,
    createRenderer: () => ThreeWorldRenderer,
    frameScheduler: FrameScheduler,
  ): ThreeWorldMount {
    const renderer = createRenderer();
    try {
      return new ThreeWorldMount(
        host,
        renderer,
        new Scene(),
        new OrthographicCamera(
          -CAMERA_REFERENCE_HALF_WIDTH,
          CAMERA_REFERENCE_HALF_WIDTH,
          CAMERA_REFERENCE_HALF_HEIGHT,
          -CAMERA_REFERENCE_HALF_HEIGHT,
          0.1,
          100,
        ),
        frameScheduler,
      );
    } catch (error) {
      renderer.dispose();
      renderer.forceContextLoss?.();
      renderer.domElement.remove();
      throw error;
    }
  }

  addReferenceScene(referenceScene: ReferenceScene): void {
    this.referenceScene = referenceScene;
  }

  addInteraction(interaction: ThreeWorldInteraction): void {
    this.interaction = interaction;
  }

  addProceduralComposition(composition: ProceduralComposition): void {
    this.proceduralComposition = composition;
  }

  addLibraryBuilding(root: Group): void {
    this.libraryBuilding = root;
  }

  addLibraryRecords(root: Group): void {
    this.libraryRecords = root;
  }

  addFixture(fixture: Object3D): void {
    this.fixtures.push(fixture);
  }

  appendCanvas(): void {
    this.host.append(this.renderer.domElement);
  }

  cancelFrame(): void {
    // Invalidates queued callbacks even if delivered after a later resume.
    this.frameGeneration++;
    const frameId = this.frameId;
    this.frameId = undefined;
    if (frameId === undefined) return;
    this.frameScheduler.cancel(frameId);
  }

  getInteraction(): ThreeWorldInteraction | undefined {
    return this.interaction;
  }

  getProceduralComposition(): ProceduralComposition | undefined {
    return this.proceduralComposition;
  }

  hasActiveFrame(): boolean {
    return this.frameId !== undefined;
  }

  requestFrame(callback: FrameRequestCallback): void {
    if (this.disposed || this.frameId !== undefined) return;
    const generation = this.frameGeneration;
    this.frameId = this.frameScheduler.request((timestamp) => {
      if (this.disposed || generation !== this.frameGeneration) return;
      callback(timestamp);
    });
  }

  settleFrame(): void {
    this.frameId = undefined;
  }

  watchResize(listener: () => void): void {
    if (typeof ResizeObserver === "undefined") {
      this.windowResizeListener = listener;
      window.addEventListener("resize", listener);
      return;
    }
    this.resizeObserver = new ResizeObserver(listener);
    this.resizeObserver.observe(this.host);
  }

  watchVisibility(listener: () => void): void {
    this.visibilityListener = listener;
    document.addEventListener("visibilitychange", listener);
  }

  watchWebGLContext(
    onLost: (event: Event) => void,
    onRestored: () => void,
  ): void {
    this.webglContextLostListener = onLost;
    this.webglContextRestoredListener = onRestored;
    this.renderer.domElement.addEventListener("webglcontextlost", onLost);
    this.renderer.domElement.addEventListener(
      "webglcontextrestored",
      onRestored,
    );
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.safely(() => this.cancelFrame());
    const resizeObserver = this.resizeObserver;
    this.resizeObserver = undefined;
    this.safely(() => resizeObserver?.disconnect());
    const windowResizeListener = this.windowResizeListener;
    this.windowResizeListener = undefined;
    this.safely(() => {
      if (windowResizeListener) {
        window.removeEventListener("resize", windowResizeListener);
      }
    });
    const visibilityListener = this.visibilityListener;
    this.visibilityListener = undefined;
    this.safely(() => {
      if (visibilityListener) {
        document.removeEventListener("visibilitychange", visibilityListener);
      }
    });
    const webglContextLostListener = this.webglContextLostListener;
    this.webglContextLostListener = undefined;
    this.safely(() => {
      if (webglContextLostListener) {
        this.renderer.domElement.removeEventListener(
          "webglcontextlost",
          webglContextLostListener,
        );
      }
    });
    const webglContextRestoredListener = this.webglContextRestoredListener;
    this.webglContextRestoredListener = undefined;
    this.safely(() => {
      if (webglContextRestoredListener) {
        this.renderer.domElement.removeEventListener(
          "webglcontextrestored",
          webglContextRestoredListener,
        );
      }
    });
    const interaction = this.interaction;
    this.interaction = undefined;
    this.safely(() => interaction?.dispose());
    const fixtures = this.fixtures.splice(0);
    this.safely(() => {
      for (const fixture of fixtures) disposeObjectTree(fixture);
    });
    const proceduralComposition = this.proceduralComposition;
    this.proceduralComposition = undefined;
    this.safely(() => {
      if (proceduralComposition) disposeObjectTree(proceduralComposition.root);
    });
    const libraryRecords = this.libraryRecords;
    this.libraryRecords = undefined;
    this.safely(() => {
      if (libraryRecords) disposeObjectTree(libraryRecords);
    });
    const libraryBuilding = this.libraryBuilding;
    this.libraryBuilding = undefined;
    this.safely(() => {
      if (libraryBuilding) disposeObjectTree(libraryBuilding);
    });
    const referenceScene = this.referenceScene;
    this.referenceScene = undefined;
    this.safely(() => {
      if (referenceScene) disposeObjectTree(referenceScene.root);
    });
    this.safely(() => this.scene.clear());
    this.safely(() => this.renderer.dispose());
    // dispose() releases renderer caches, but does not release its WebGL context.
    // This mount owns the context; resident pauses never take this terminal path.
    this.safely(() => this.renderer.forceContextLoss?.());
    this.safely(() => this.renderer.domElement.remove());
  }

  private safely(cleanup: () => void): void {
    try {
      cleanup();
    } catch {
      // Terminal cleanup continues so that one failed release cannot retain
      // the remaining mount resources or revive the runtime.
    }
  }
}

export class ThreeWorldRuntime implements WorldRuntime {
  private readonly diagnosticsListeners = new Set<WorldDiagnosticsListener>();
  private readonly failureListeners = new Set<WorldRuntimeFailureListener>();
  private baseSelectableObjects: readonly WorldSelectableObject[] = [];
  private drawCalls = 0;
  private fixtureLoadMs: number | null = null;
  private fixtureLoadStartedAt: number | undefined;
  private fixtureStatus: WorldFixtureStatus = "idle";
  private failureReported = false;
  private readonly performanceProbe = new PerformanceProbe(() => this.now());
  private readonly boundedPointLighting = createBoundedPointLighting();
  private activePointLights = 0;
  private gpuTimer?: GpuTimer;
  private lightingExperiment: LightingExperiment | null = null;
  private readonly frameMetrics = new FrameMetricsWindow();
  private geometries = 0;
  private lastDiagnosticsPublishedAt: number | undefined;
  private materialTextureReferences = 0;
  private meshes = 0;
  private readonly recordVisuals = new Map<string, LibraryRecordVisual>();
  private mountStartedAt: number | undefined;
  private mountedWorld: ThreeWorldMount | undefined;
  private navigation: CameraNavigation | undefined;
  private performanceScenarioAssetsLoaded = 0;
  private performanceScenarioFailed = false;
  private performanceScenarioPendingAssets = 0;
  private readonly performanceScenario: PerformanceScenario;
  private readonly performanceScenarioDiagnosticsEnabled: boolean;
  private readonly readingAreaBooks: readonly ReadingAreaBook[];
  private readonly libraryRecordPlacements:
    readonly LibraryRecordPlacement[] | undefined;
  private readingAreaBookVisuals = new Map<string, ReadingAreaBookVisual>();
  private pausedByVisibility = false;
  private renderedFrames = 0;
  private sceneObjects = 0;
  private selectableObjects: readonly WorldSelectableObject[] = [];
  private selection: WorldSelection = null;
  private readonly selectionListeners = new Set<WorldSelectionListener>();
  private state: WorldRuntimeState = "created";
  private textures = 0;
  private timeToFirstUsableFrameMs: number | null = null;
  private triangles = 0;
  private uniqueMaterialTextures = 0;
  private lastValidViewport:
    { readonly height: number; readonly width: number } | undefined;
  private viewportReady = false;
  private readonly createRenderer: () => ThreeWorldRenderer;
  private readonly fixtureLoader: FixtureModelLoader;
  private readonly frameScheduler: FrameScheduler;
  private readonly now: () => number;
  private readonly deferPicking: boolean;

  private readonly livingSession?: LivingSession;
  private readonly nightLighting?: NightLightingSession;
  private inhabitants?: ReturnType<typeof createInhabitantVisuals>;
  private ambientMagic?: ReturnType<typeof createAmbientMagic>;
  private orbital?: ReturnType<typeof createOrbitalArena>;
  private scrollVisuals?: ReturnType<typeof createLivingScrollVisuals>;
  private readonly scrolls: readonly import("../../../contracts/livingScroll").LivingScroll[];
  private lightingInitialized = false;
  private livingVisuals?: ReturnType<typeof createLivingVisuals>;
  private livingFrameTime: number | undefined;
  private readonly inhabitantLoader?: InhabitantLoader;
  private agency?: InhabitantAgency;
  private agencyClock = 0;
  private readonly continuity?: InhabitantContinuitySnapshot;
  private readonly onInhabitantCheckpoint?: (
    snapshot: InhabitantContinuitySnapshot,
  ) => void;
  private lastContinuityCheckpointAt: number | undefined;
  private pausedCheckpointIdle?: number;
  private pausedCheckpointTimer?: number;
  private readonly inhabitantActivations = new Set<
    (key: InhabitantKey) => void
  >();
  private narrative?: NarrativeSnapshot;
  private narrativeVisuals?: ReturnType<typeof createNarrativeVisuals>;
  private readonly agencyListeners = new Set<
    (snapshot: AgencySnapshot) => void
  >();
  private unsubscribeAgency?: () => void;
  private unsubscribeLivingEvents?: () => void;
  private sceneProps?: ReturnType<typeof createInhabitantSceneProps>;
  private worldSessionActivity: WorldSessionActivity | null = null;
  private sessionBooks?: ReturnType<typeof createSessionBookVisuals>;
  private sessionVisuals?: ReturnType<typeof createSessionWorldVisuals>;
  constructor(dependencies: ThreeWorldRuntimeDependencies = {}) {
    this.deferPicking = dependencies.deferPicking ?? false;
    this.inhabitantLoader = dependencies.inhabitantLoader;
    this.scrolls = dependencies.libraryWorldSnapshot?.scrolls ?? [];
    this.continuity = dependencies.inhabitantContinuity;
    this.onInhabitantCheckpoint = dependencies.onInhabitantCheckpoint;
    this.nightLighting = dependencies.performanceScenario
      ? undefined
      : dependencies.nightLighting;
    this.livingSession = dependencies.performanceScenario
      ? undefined
      : dependencies.livingSession;
    this.createRenderer =
      dependencies.createRenderer ??
      (() => new WebGLRenderer({ antialias: true, alpha: false }));
    this.fixtureLoader = dependencies.fixtureLoader ?? createFixtureLoader();
    this.performanceScenario =
      dependencies.performanceScenario ?? createFunctionalAreaScenario();
    this.performanceScenarioDiagnosticsEnabled =
      dependencies.performanceScenario !== undefined;
    // F5 ignores even malformed BF snapshots; its diagnostic corpus is fixed.
    const worldSnapshot = this.performanceScenarioDiagnosticsEnabled
      ? undefined
      : dependencies.libraryWorldSnapshot;
    if (
      worldSnapshot !== undefined &&
      dependencies.readingAreaBooks !== undefined
    ) {
      throw new Error("Use somente um snapshot BF por montagem.");
    }
    if (worldSnapshot !== undefined) {
      const assignment = assignLibraryRecordSlots(worldSnapshot);
      const books = worldSnapshot.categories[0];
      if (books.type !== "book") {
        throw new Error("A primeira categoria do snapshot BF deve ser book.");
      }
      validateReadingAreaBookSnapshot(books.entries);
      const ids = new Set(books.entries.map(({ instanceId }) => instanceId));
      const entryIds = new Set(books.entries.map(({ entryId }) => entryId));
      for (const entry of [...assignment.placements, ...assignment.overflow]) {
        if (ids.has(entry.instanceId) || entryIds.has(entry.entryId)) {
          throw new Error(
            "Identidade duplicada entre livros e outros registros.",
          );
        }
      }
      this.readingAreaBooks = Object.freeze([...books.entries]);
      this.libraryRecordPlacements = assignment.placements;
    } else {
      const books = this.performanceScenarioDiagnosticsEnabled
        ? []
        : (dependencies.readingAreaBooks ?? []);
      if (!this.performanceScenarioDiagnosticsEnabled)
        validateReadingAreaBookSnapshot(books);
      this.readingAreaBooks = Object.freeze([...books]);
      this.libraryRecordPlacements = undefined;
    }
    this.frameScheduler = dependencies.frameScheduler ?? defaultFrameScheduler;
    this.now = dependencies.now ?? (() => performance.now());
  }

  getDiagnostics(): WorldRuntimeDiagnostics {
    const frameMetrics = this.frameMetrics.snapshot();
    return Object.freeze({
      shaderPrograms:
        this.mountedWorld?.renderer.info?.programs?.length ?? null,
      activePointLights: this.activePointLights,
      lightingExperiment: this.lightingExperiment,
      frameIntervals: this.frameMetrics.distribution(),
      cpuMetrics: this.performanceProbe.snapshot(),
      questProbe: this.performanceProbe.questSnapshot(),
      gpuTimer: this.gpuTimer?.snapshot(),
      longTasksSupported: this.performanceProbe.longTasksSupported,
      jsHeapUsedBytes: this.readJsHeap(),
      activeFrameLoops:
        this.state === "running" && this.mountedWorld?.hasActiveFrame() ? 1 : 0,
      drawCalls: this.drawCalls,
      fixtureLoadMs: this.fixtureLoadMs,
      fixtureStatus: this.fixtureStatus,
      fps: this.state === "running" ? frameMetrics.fps : null,
      frameTimeMs: this.state === "running" ? frameMetrics.frameTimeMs : null,
      geometries: this.geometries,
      meshes: this.meshes,
      materialTextureReferences: this.materialTextureReferences,
      performanceScenarioAssetsLoaded: this.performanceScenarioAssetsLoaded,
      performanceScenarioAssetsTotal: this.performanceScenario.assets.length,
      performanceScenarioId: this.performanceScenario.id,
      performanceScenarioLabel: this.performanceScenario.label,
      renderedFrames: this.renderedFrames,
      runtimeState: this.state,
      sceneObjects: this.sceneObjects,
      selectableObjects: this.selectableObjects.length,
      textures: this.textures,
      timeToFirstUsableFrameMs: this.timeToFirstUsableFrameMs,
      triangles: this.triangles,
      uniqueMaterialTextures: this.uniqueMaterialTextures,
    });
  }

  getSelectableObjects(): readonly WorldSelectableObject[] {
    return this.selectableObjects;
  }

  mount(host: HTMLElement): void {
    if (this.state !== "created") {
      throw new Error("ThreeWorldRuntime can only be mounted once.");
    }

    this.mountStartedAt = this.now();
    let unattachedProceduralComposition: ProceduralComposition | undefined;
    try {
      const mountedWorld = ThreeWorldMount.create(
        host,
        this.createRenderer,
        this.frameScheduler,
      );
      this.mountedWorld = mountedWorld;
      const { camera, renderer, scene } = mountedWorld;
      const composedWorld = this.libraryRecordPlacements !== undefined;
      // F1 floor/walls/proxies overlap the BF-3C building; preserve the
      // unmodified reference scene for legacy BF-2 and F5 only.
      const referenceScene = composedWorld ? undefined : createReferenceScene();

      const environmentLights: (HemisphereLight | DirectionalLight)[] = [];
      scene.background = new Color(0x18342d);
      if (referenceScene) {
        mountedWorld.addReferenceScene(referenceScene);
        scene.add(referenceScene.root);
      } else {
        const hemisphere = new HemisphereLight(0xffedd2, 0x58665b, 2);
        environmentLights.push(hemisphere);
        scene.add(hemisphere);
        const sunlight = new DirectionalLight(0xffdfac, 1.5);
        sunlight.position.set(-4, 12, 7);
        environmentLights.push(sunlight);
        scene.add(sunlight);
      }
      const proceduralSelectables = this.performanceScenarioDiagnosticsEnabled
        ? []
        : (() => {
            const composition = createProceduralComposition(
              composedWorld
                ? LIBRARY_SHELVES
                : READING_SHELF_COMPOSITION_DEFINITIONS,
            );
            unattachedProceduralComposition = composition;
            if (composedWorld)
              for (const instance of composition.instances)
                batchStaticBookshelf(instance.representation.root);
            scene.add(composition.root);
            mountedWorld.addProceduralComposition(composition);
            unattachedProceduralComposition = undefined;
            return composition.instances.map(({ identity, node }) => ({
              descriptor: {
                id: identity.instanceId,
                label: readingShelfLabel(identity.instanceId),
              },
              root: node,
            }));
          })();
      const readingAreaBookVisuals =
        this.performanceScenarioDiagnosticsEnabled || !this.mountedWorld
          ? []
          : reconcileReadingAreaBookVisuals(
              this.mountedWorld.getProceduralComposition() ??
                (() => {
                  throw new Error("Composição procedural ausente para livros.");
                })(),
              this.readingAreaBooks,
              this.readingAreaBookVisuals,
            ).visible;
      this.readingAreaBookVisuals = new Map(
        readingAreaBookVisuals.map((visual) => [
          visual.book.instanceId,
          visual,
        ]),
      );
      let libraryRecordSelectables: readonly {
        readonly descriptor: WorldSelectableObject;
        readonly root: Object3D;
      }[] = [];
      const orbitalSelectables =
        composedWorld && !this.performanceScenarioDiagnosticsEnabled
          ? [createOrbitalArena()]
          : [];
      this.orbital = orbitalSelectables[0];
      if (composedWorld) {
        this.inhabitants = createInhabitantVisuals(
          scene,
          this.inhabitantLoader,
          (id) => {
            const actor = scene.getObjectByName(id);
            if (actor) this.boundedPointLighting.apply(actor);
            mountedWorld
              .getInteraction()
              ?.refreshHighlightForSelectedObject(id);
            renderer.domElement.dataset.inhabitantsReady = String(
              this.inhabitants?.selectables.filter(
                ({ root }) => root.userData.loadState === "ready",
              ).length ?? 0,
            );
          },
          true,
        );
        const building = createProceduralLibraryBuilding(
          Boolean(this.livingSession),
        );
        for (const orbital of orbitalSelectables) building.add(orbital.root);
        mountedWorld.addLibraryBuilding(building);
        scene.add(building);
        this.sessionVisuals = createSessionWorldVisuals(building);
        this.sessionVisuals.apply(this.worldSessionActivity);
        if (this.livingSession)
          this.livingVisuals = createLivingVisuals(
            building,
            scene,
            this.livingSession,
            this.nightLighting,
            environmentLights,
          );
        const records = createLibraryRecordComposition(
          this.libraryRecordPlacements ?? [],
        );
        for (const visual of records.instances)
          this.recordVisuals.set(visual.instanceId, visual);
        mountedWorld.addLibraryRecords(records.root);
        scene.add(records.root);
        this.sceneProps = createInhabitantSceneProps(building);
        const obstacles = collectInhabitantObstacles([
          building,
          records.root,
          ...proceduralSelectables.map((s) => s.root),
          ...readingAreaBookVisuals.map((v) => v.node),
        ]);
        this.scrollVisuals = createLivingScrollVisuals(
          building,
          this.scrolls,
          [
            building,
            records.root,
            ...proceduralSelectables.map((s) => s.root),
            ...readingAreaBookVisuals.map((v) => v.node),
          ],
          (furnitureId) =>
            !this.sessionBooks?.isTransporting() &&
            !this.agency?.interactions.isReserved(
              `surface:${furnitureId}`,
              this.agency.interactionTime,
            ),
        );
        this.ambientMagic = createAmbientMagic(building, (episode) =>
          this.agency?.reactToMagic(episode),
        );
        const inhabitantNavigation = new InhabitantNavigation(obstacles);
        inhabitantNavigation.prepare(
          INHABITANTS.map((a) => INHABITANT_ENVELOPES[a.key].travel),
        );
        this.agency = new InhabitantAgency(inhabitantNavigation, {
          now: () => this.agencyClock,
          hour: () => new Date().getHours(),
          nightLighting: this.nightLighting,
          canPhysicalActor: (id) =>
            this.inhabitants?.hasPhysicalActions(id) ?? false,
          canPhysicalStep: (pose) => {
            if (pose.interactionObjectId?.startsWith("reading-book:"))
              return (
                this.inhabitants?.probePhysicalPose(
                  pose,
                  (socket) =>
                    this.sessionBooks?.checkHandPose(socket, pose) ?? true,
                ) ?? false
              );
            return true;
          },
          onEnvironmentAction: (key, objectId) => {
            this.livingSession?.actFromInhabitant(key, objectId);
          },
        });
        this.sessionBooks = createSessionBookVisuals({
          books: () => this.readingAreaBookVisuals,
          obstacleRoots: [
            building,
            records.root,
            ...proceduralSelectables.map((s) => s.root),
          ],
          interactions: this.agency.interactions,
          now: () => this.agency?.interactionTime ?? 0,
          canDepart: () => !this.scrollVisuals?.hasFlight(),
          occupiedSurfaces: () => this.scrollVisuals?.occupiedSurfaces() ?? [],
          navigation: inhabitantNavigation,
          pickupProfiles: () =>
            this.inhabitants?.getPickupProfiles() ?? new Map(),
        });
        this.sessionBooks.apply(this.worldSessionActivity);
        if (this.continuity) {
          this.agency.restoreContinuity(this.continuity);
        }
        this.narrativeVisuals = createNarrativeVisuals(building);
        this.unsubscribeAgency = this.agency.subscribe(() => {
          const snapshot = this.agency?.getSnapshot();
          if (snapshot)
            for (const listener of this.agencyListeners) listener(snapshot);
        });
        this.unsubscribeLivingEvents = this.livingSession?.onEvents(
          (events, source) => this.agency?.perceive(events, source),
        );
        libraryRecordSelectables = records.instances
          .filter(
            ({ node }) =>
              node.parent === records.root && node.children.length > 0,
          )
          .map(({ entryId, instanceId, modelTypeId, node }) => ({
            descriptor: Object.freeze({
              entryId,
              id: instanceId,
              label: `${LIBRARY_RECORD_LABELS[modelTypeId]}: ${entryId}`,
            }),
            root: node,
          }));
      }
      if (this.narrative) this.applyNarrativeToAgency(this.narrative);
      if (composedWorld) camera.far = 1000;
      this.navigation = new CameraNavigation(
        camera,
        1,
        composedWorld ? LIBRARY_ROOMS : undefined,
        composedWorld ? 10 : 1,
      );

      if (composedWorld) this.boundedPointLighting.apply(scene);
      renderer.shadowMap.enabled = false;
      renderer.domElement.className = "three-world-canvas";
      renderer.domElement.dataset.fixtureStatus = "loading";
      renderer.domElement.dataset.referenceMeshes = String(
        referenceScene?.meshCount ?? 0,
      );
      renderer.domElement.dataset.referenceObjects = String(
        referenceScene ? referenceScene.meshCount + 1 : 0,
      );
      renderer.domElement.dataset.referenceProxyTypes = String(
        referenceScene ? REFERENCE_SCENE_PROXY_TYPES : 0,
      );
      renderer.domElement.dataset.performanceScenario =
        this.performanceScenario.id;
      renderer.domElement.dataset.threeWorldCanvas = "true";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.baseSelectableObjects = Object.freeze([
        ...orbitalSelectables.map(({ descriptor }) => descriptor),
        ...(this.inhabitants?.selectables ?? []).map(
          ({ descriptor }) => descriptor,
        ),
        ...(this.scrollVisuals?.selectables ?? []).map(
          ({ descriptor }) => descriptor,
        ),
        ...(this.livingVisuals?.selectables ?? []).map(
          ({ descriptor }) => descriptor,
        ),
        ...(referenceScene?.selectables ?? []).map(
          ({ descriptor }) => descriptor,
        ),
        ...proceduralSelectables.map(({ descriptor }) => descriptor),
        ...libraryRecordSelectables.map(({ descriptor }) => descriptor),
        ...(this.performanceScenarioDiagnosticsEnabled
          ? [FIXTURE_SELECTABLE]
          : []),
      ]);
      this.refreshSelectableObjects();
      const interaction = new ThreeWorldInteraction({
        probe: this.performanceProbe,
        deferPicking: this.deferPicking,
        fastPicking: this.deferPicking,
        onPickStart: () =>
          this.observeQuest({ type: "begin", source: "canvas" }),
        camera,
        canvas: renderer.domElement,
        catalog: this.selectableObjects,
        navigation: this.navigation,
        onSelectionChange: this.handleSelectionChange,
        onTapObject: (id) => {
          if (this.isTerminal() || this.state !== "running") return;
          if (id.startsWith("living:")) this.livingSession?.actPrimary(id);
          const actor = INHABITANTS.find((a) => a.id === id);
          if (actor)
            for (const listener of this.inhabitantActivations)
              listener(actor.key);
        },
        pickingPriorityRoots: [
          ...orbitalSelectables.map(({ root }) => root),
          ...proceduralSelectables.map(({ root }) => root),
          ...libraryRecordSelectables.map(({ root }) => root),
        ],
        render: () => {
          // The active RAF presents input changes on its next frame. Avoid
          // submitting an extra complete scene for every pointer event.
          if (this.state === "running") return;
          if (!this.renderCurrentFrame()) return;
          this.publishDiagnostics(false);
        },
        scene,
        selectables: [
          ...orbitalSelectables,
          ...(this.inhabitants?.selectables ?? []),
          ...(this.livingVisuals?.selectables ?? []),
          ...(this.scrollVisuals?.selectables ?? []),
          ...(referenceScene?.selectables ?? []),
          ...proceduralSelectables,
          ...libraryRecordSelectables,
          ...readingAreaBookVisuals.map(({ book, node }) => ({
            descriptor: {
              entryId: book.entryId,
              id: book.instanceId,
              label: book.title,
            },
            root: node,
          })),
        ],
      });
      mountedWorld.addInteraction(interaction);
      this.state = "mounted";

      mountedWorld.watchWebGLContext(
        this.handleWebGLContextLost,
        this.handleWebGLContextRestored,
      );
      mountedWorld.appendCanvas();
      this.resize();
      if (!this.mountedWorld) {
        throw new Error("ThreeWorldRuntime renderer failed while mounting.");
      }
      this.loadScenarioFixtures();
      mountedWorld.watchResize(this.handleWindowResize);
      mountedWorld.watchVisibility(this.handleVisibilityChange);
      window.addEventListener("pagehide", this.handlePageHide);
      this.publishDiagnostics(true);
    } catch (error) {
      if (unattachedProceduralComposition) {
        disposeObjectTree(unattachedProceduralComposition.root);
      }
      this.dispose();
      throw error;
    }
  }

  start(): void {
    if (this.state === "running") return;
    if (this.state === "failed") return;
    if (this.state !== "mounted" && this.state !== "paused") {
      throw new Error("ThreeWorldRuntime must be mounted before it starts.");
    }

    if (document.hidden) {
      this.state = "paused";
      this.performanceProbe.stop();
      this.gpuTimer?.dispose();
      this.gpuTimer = undefined;
      this.livingFrameTime = undefined;
      this.pausedByVisibility = true;
      this.resetFrameMetrics();
      this.mountedWorld?.getInteraction()?.cancelActiveGestures();
      this.publishDiagnostics(true);
      return;
    }

    this.activateLoop();
  }

  setLightingExperiment(value: LightingExperiment | null): void {
    if (this.isTerminal() || (value && this.diagnosticsListeners.size === 0))
      return;
    this.lightingExperiment = value;
    if (this.mountedWorld)
      this.boundedPointLighting.setEnabled(
        value === null || value.mode === "candidate",
        this.mountedWorld.scene,
      );
    const target = this.navigation?.getState();
    this.livingVisuals?.setLightingExperiment(
      value,
      target?.targetX,
      target?.targetZ,
    );
    this.inhabitants?.setPointLightEnabled(value?.ythaLight ?? true);
    this.resetPerformanceProbe();
    this.publishDiagnostics(true);
  }

  setQuestProbeEnabled(enabled: boolean): void {
    this.performanceProbe.setQuestEnabled(enabled);
    this.publishDiagnostics(true);
  }

  observeQuest(event: QuestProbeEvent): void {
    if (event.type === "begin")
      this.performanceProbe.beginQuest(
        event.source,
        this.narrative?.talkingTo ?? null,
        Boolean(this.narrative?.active),
        this.mountedWorld?.renderer.info?.programs?.length ?? null,
      );
    else this.performanceProbe.markQuest(event.stage, event.inhabitant);
  }

  resetPerformanceProbe(): void {
    this.gpuTimer?.dispose();
    this.gpuTimer = undefined;
    this.performanceProbe.reset();
    this.frameMetrics.reset();
  }

  onDiagnosticsChange(listener: WorldDiagnosticsListener): () => void {
    if (this.isTerminal()) return () => undefined;
    this.diagnosticsListeners.add(listener);
    if (this.mountedWorld && this.state === "running")
      this.performanceProbe.start(this.mountedWorld.renderer.domElement);
    if (this.mountedWorld) this.updateObjectCounts(this.mountedWorld.scene);
    listener(this.getDiagnostics());
    return () => {
      this.diagnosticsListeners.delete(listener);
      if (this.diagnosticsListeners.size === 0) {
        this.performanceProbe.stop();
        this.performanceProbe.setQuestEnabled(false);
        this.gpuTimer?.dispose();
        this.gpuTimer = undefined;
        this.setLightingExperiment(null);
      }
    };
  }

  onFailure(listener: WorldRuntimeFailureListener): () => void {
    if (this.isTerminal()) return () => undefined;
    this.failureListeners.add(listener);
    return () => this.failureListeners.delete(listener);
  }

  onSelectionChange(listener: WorldSelectionListener): () => void {
    if (this.isTerminal()) return () => undefined;
    this.selectionListeners.add(listener);
    listener(this.selection);
    return () => this.selectionListeners.delete(listener);
  }

  pause(): void {
    if (this.isTerminal()) return;
    this.pausedByVisibility = false;
    this.pauseLoop();
    // Let the destination present before serializing an agent snapshot.
    // Visibility/pagehide and disposal still checkpoint synchronously.
    this.schedulePausedCheckpoint();
  }

  resume(): void {
    this.cancelPausedCheckpoint();
    if (this.state === "running") return;
    if (this.state !== "paused" && this.state !== "mounted") return;
    if (document.hidden) {
      this.state = "paused";
      this.performanceProbe.stop();
      this.gpuTimer?.dispose();
      this.gpuTimer = undefined;
      this.livingFrameTime = undefined;
      this.pausedByVisibility = true;
      this.publishDiagnostics(true);
      return;
    }
    this.activateLoop();
  }

  resize(): void {
    const mountedWorld = this.mountedWorld;
    if (!mountedWorld || this.isTerminal()) return;
    const { host, renderer } = mountedWorld;

    const bounds = host.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      // A container can be briefly collapsed while navigation or layout is in
      // flight. Keep the last trusted viewport and wait for ResizeObserver (or
      // the fallback) to provide a usable one instead of manufacturing a 1px
      // frustum or making a normal layout transition terminal.
      this.invalidateViewport(mountedWorld);
      return;
    }
    const viewportChanged =
      this.lastValidViewport?.width !== width ||
      this.lastValidViewport.height !== height;
    if (!viewportChanged && this.viewportReady) return;
    // Coordinates captured before a real layout change cannot safely continue
    // through a different screen plane. Selection remains intact; only the
    // active gesture is terminated, so the next gesture starts from the new
    // canvas geometry.
    if (viewportChanged) mountedWorld.getInteraction()?.cancelActiveGestures();
    if (!this.navigation?.setViewport(width, height)) {
      this.invalidateViewport(mountedWorld);
      return;
    }
    try {
      renderer.setSize(width, height, false);
    } catch {
      this.failRuntime();
      return;
    }
    mountedWorld.getInteraction()?.setViewport(width, height);
    this.lastValidViewport = Object.freeze({ height, width });
    this.viewportReady = true;
    if (this.state === "paused") return;
    if (!this.renderCurrentFrame()) return;
    if (this.state === "running" && !mountedWorld.hasActiveFrame()) {
      mountedWorld.requestFrame(this.renderFrame);
    }
    this.publishDiagnostics(false);
  }

  playInhabitantAction(
    id: string,
    action: InhabitantAction,
  ): "playing" | "loading" | "unavailable" | "reduced" {
    if (this.isTerminal() || this.state !== "running") return "unavailable";
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return "reduced";
    if (this.agency && !this.agency.interrupt(id, action)) return "unavailable";
    if (this.agency?.getPoses().find((p) => p.id === id)?.physicalSessionId)
      return "playing";
    return this.inhabitants?.play(id, action) ?? "unavailable";
  }

  onInhabitantActivate(listener: (key: InhabitantKey) => void): () => void {
    if (this.isTerminal()) return () => {};
    this.inhabitantActivations.add(listener);
    return () => {
      this.inhabitantActivations.delete(listener);
    };
  }

  applyWorldSession(activity: WorldSessionActivity | null): void {
    if (this.isTerminal()) return;
    this.worldSessionActivity = activity;
    this.sessionVisuals?.apply(activity);
    this.sessionBooks?.apply(activity);
  }

  applyNarrative(snapshot: NarrativeSnapshot): void {
    if (
      this.isTerminal() ||
      (this.narrative && snapshot.revision <= this.narrative.revision)
    )
      return;
    this.performanceProbe.markQuest("narrativeStart");
    this.narrative = snapshot;
    this.applyNarrativeToAgency(snapshot);
    this.performanceProbe.markQuest("narrativeEnd");
  }

  private applyNarrativeToAgency(snapshot: NarrativeSnapshot): void {
    if (!this.agency) return;
    const node = nodeFor(snapshot);
    const ensemble =
      snapshot.active === "rift" &&
      ["energy", "structure", "life", "conjure", "check", "surge"].some(
        (id) => node?.nodeId === `rift:${id}`,
      );
    this.agency.setNarrativeBonds(snapshot.bonds);
    this.agency.setConversation(
      snapshot.talkingTo,
      node?.action,
      ensemble,
      snapshot.active ? STORIES[snapshot.active].owner : undefined,
    );
  }

  getInhabitantSnapshot(): AgencySnapshot | null {
    return this.agency?.getSnapshot() ?? null;
  }

  onInhabitantsChange(
    listener: (snapshot: AgencySnapshot) => void,
  ): () => void {
    if (this.isTerminal()) return () => {};
    this.agencyListeners.add(listener);
    if (this.agency) listener(this.agency.getSnapshot());
    return () => {
      this.agencyListeners.delete(listener);
    };
  }

  selectObject(id: string | null): void {
    if (this.isTerminal()) return;
    this.mountedWorld?.getInteraction()?.selectObject(id);
  }

  /** Replace compatible visuals without changing the registered record wrapper. */
  replaceLibraryRecordRepresentation(
    instanceId: string,
    factory: RecordAssetFactory,
  ): "replaced" | "unavailable" {
    const visual = this.recordVisuals.get(instanceId);
    if (this.isTerminal() || !visual || !this.mountedWorld)
      return "unavailable";
    replaceLibraryRecordRepresentation(visual, factory);
    this.boundedPointLighting.apply(visual.node);
    this.mountedWorld
      .getInteraction()
      ?.refreshHighlightForSelectedObject(instanceId);
    this.updateObjectCounts(this.mountedWorld.scene);
    this.updateMaterialTextureMetrics(this.mountedWorld.scene);
    this.renderCurrentFrame();
    this.publishDiagnostics(true);
    return "replaced";
  }
  replaceReadingAreaBookRepresentation(
    instanceId: string,
    factory: BookRecordFactory,
  ): "replaced" | "busy" | "unavailable" {
    const visual = this.readingAreaBookVisuals.get(instanceId);
    if (this.isTerminal() || !visual || !this.mountedWorld)
      return "unavailable";
    const result = replaceReadingAreaBookRepresentation(visual, factory);
    if (result === "busy") return result;
    this.boundedPointLighting.apply(visual.node);
    this.mountedWorld
      .getInteraction()
      ?.refreshHighlightForSelectedObject(instanceId);
    this.updateObjectCounts(this.mountedWorld.scene);
    this.updateMaterialTextureMetrics(this.mountedWorld.scene);
    this.renderCurrentFrame();
    this.publishDiagnostics(true);
    return result;
  }

  /**
   * BF-1D's intentionally narrow, synchronous replacement proof.
   *
   * It is unavailable for F5 diagnostic scenarios, which do not mount the
   * procedural composition. It is deliberately absent from `WorldRuntime`:
   * React has no variant-switching control in this checkpoint.
   */
  replaceProceduralBookshelfRepresentation(
    instanceId: string,
    variant: string,
  ): ProceduralRepresentationReplacement | "unavailable" {
    if (this.isTerminal()) return "unavailable";
    const mountedWorld = this.mountedWorld;
    const composition = mountedWorld?.getProceduralComposition();
    if (!mountedWorld || !composition) return "unavailable";

    const result = replaceProceduralBookshelfRepresentation(
      composition,
      instanceId,
      variant,
    );
    if (result === "unchanged") return result;
    const replaced = composition.instances.find(
      (i) => i.identity.instanceId === instanceId,
    );
    if (replaced && this.libraryRecordPlacements !== undefined)
      batchStaticBookshelf(replaced.representation.root);

    this.sessionBooks?.releaseForLayoutChange();

    const reconciliation = reconcileReadingAreaBookVisuals(
      composition,
      this.readingAreaBooks,
      this.readingAreaBookVisuals,
    );
    const interaction = mountedWorld.getInteraction();
    for (const visual of reconciliation.removed) {
      interaction?.removeSelectable(visual.book.instanceId);
      visual.node.removeFromParent();
      disposeObjectTree(visual.node);
    }
    for (const visual of reconciliation.added) {
      interaction?.addSelectable(
        {
          entryId: visual.book.entryId,
          id: visual.book.instanceId,
          label: visual.book.title,
        },
        visual.node,
      );
    }
    this.readingAreaBookVisuals = new Map(
      reconciliation.visible.map((visual) => [visual.book.instanceId, visual]),
    );
    if (reconciliation.added.length > 0 || reconciliation.removed.length > 0) {
      this.refreshSelectableObjects();
    }
    for (const visual of reconciliation.visible) {
      this.boundedPointLighting.apply(visual.node);
      interaction?.refreshHighlightForSelectedObject(visual.book.instanceId);
    }

    interaction?.refreshHighlightForSelectedObject(instanceId);
    if (!this.renderCurrentFrame()) return result;
    this.publishDiagnostics(true);
    return result;
  }

  dispose(): void {
    if (this.state === "disposed") return;

    if (this.state === "failed") {
      this.clearListeners();
      return;
    }

    this.state = "disposed";
    this.performanceProbe.setQuestEnabled(false);
    this.releaseMount();
    this.resetRuntimeData();
    this.failureListeners.clear();
    this.selectionListeners.clear();
    this.publishDiagnostics(true);
    this.performanceProbe.stop();
    this.gpuTimer?.dispose();
    this.gpuTimer = undefined;
    this.diagnosticsListeners.clear();
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.isTerminal()) return;
    if (document.hidden) {
      this.cancelPausedCheckpoint();
      this.checkpointInhabitants(true);
      if (this.state === "running") {
        this.pausedByVisibility = true;
        this.pauseLoop();
      } else {
        this.mountedWorld?.getInteraction()?.cancelActiveGestures();
      }
      return;
    }
    if (this.pausedByVisibility) {
      this.pausedByVisibility = false;
      this.activateLoop();
    }
  };

  private readonly handlePageHide = (): void =>
    this.checkpointInhabitants(true);

  private readonly handleWindowResize = (): void => this.resize();

  private readonly handleWebGLContextLost = (event: Event): void => {
    // Three.js also prevents the default when it owns the renderer. Doing it
    // here keeps the mount contract intact for renderer doubles and prevents
    // the browser from treating this loss as an unhandled canvas event.
    event.preventDefault();
    this.failRuntime();
  };

  private readonly handleWebGLContextRestored = (): void => {
    // Context loss is terminal for this use-once runtime. The listener is
    // removed during failure cleanup, so a late restoration has no path back
    // to a partially trusted renderer, scene, or interaction state.
  };

  private readonly handleSelectionChange = (
    selection: WorldSelection,
  ): void => {
    if (this.isTerminal()) return;
    if (selection?.id.startsWith("character:") && !this.narrative?.talkingTo)
      this.playInhabitantAction(selection.id, "react");
    this.selection = selection;
    for (const listener of this.selectionListeners) listener(selection);
  };

  private loadScenarioFixtures(): void {
    this.fixtureLoadStartedAt = this.now();
    this.fixtureLoadMs = null;
    this.fixtureStatus = "loading";
    this.performanceScenarioAssetsLoaded = 0;
    this.performanceScenarioFailed = false;
    this.performanceScenarioPendingAssets =
      this.performanceScenario.assets.length;
    const mountedWorld = this.mountedWorld;
    if (mountedWorld)
      mountedWorld.renderer.domElement.dataset.fixtureStatus = "loading";

    for (const asset of this.performanceScenario.assets) {
      try {
        this.fixtureLoader.load(
          asset.url,
          (model) => this.handleScenarioAssetLoaded(asset, model),
          () => this.handleScenarioAssetError(),
        );
      } catch {
        this.handleScenarioAssetError();
      }
    }
    if (mountedWorld) this.finalizeScenarioFixtureLoading(mountedWorld);
  }

  private handleScenarioAssetLoaded(
    asset: PerformanceScenario["assets"][number],
    model: Object3D,
  ): void {
    const mountedWorld = this.mountedWorld;
    if (this.isTerminal() || !mountedWorld) {
      disposeObjectTree(model);
      return;
    }

    model.name =
      asset.id === "f1-technical-pyramid"
        ? "f1-technical-gltf-fixture"
        : `performance-${asset.id}`;
    model.position.set(...asset.position);
    if (asset.id === "f1-technical-pyramid") model.scale.setScalar(1.35);
    mountedWorld.scene.add(model);
    mountedWorld.addFixture(model);
    this.updateMaterialTextureMetrics(mountedWorld.scene);
    if (asset.id === "f1-technical-pyramid") {
      mountedWorld.getInteraction()?.addSelectable(FIXTURE_SELECTABLE, model);
    }
    if (this.isTerminal() || this.mountedWorld !== mountedWorld) return;
    this.performanceScenarioAssetsLoaded += 1;
    this.performanceScenarioPendingAssets -= 1;
    this.finalizeScenarioFixtureLoading(mountedWorld);
    if (!this.renderCurrentFrame()) return;
    this.publishDiagnostics(true);
  }

  private handleScenarioAssetError(): void {
    const mountedWorld = this.mountedWorld;
    if (this.isTerminal() || !mountedWorld) return;
    this.performanceScenarioFailed = true;
    this.performanceScenarioPendingAssets -= 1;
    this.finalizeScenarioFixtureLoading(mountedWorld);
    this.publishDiagnostics(true);
    console.error(
      this.performanceScenario.id === "f1-baseline"
        ? "[Biblioteca Viva] f1-technical-fixture-load-failed"
        : "[Biblioteca Viva] performance-scenario-asset-load-failed",
    );
  }

  private finalizeScenarioFixtureLoading(mountedWorld: ThreeWorldMount): void {
    if (this.performanceScenarioPendingAssets > 0) return;
    const elapsed = Math.max(0, this.now() - (this.fixtureLoadStartedAt ?? 0));
    this.fixtureLoadMs = elapsed;
    this.fixtureStatus = this.performanceScenarioFailed ? "error" : "ready";
    mountedWorld.renderer.domElement.dataset.fixtureLoadMs = elapsed.toFixed(1);
    mountedWorld.renderer.domElement.dataset.fixtureStatus = this.fixtureStatus;
  }

  private readonly renderFrame = (timestamp: number): void => {
    if (this.state !== "running") return;

    const mountedWorld = this.mountedWorld;
    if (!mountedWorld) return;
    mountedWorld.settleFrame();
    this.performanceProbe.markQuest("sceneStart");
    const cpuStart = this.performanceProbe.active ? this.now() : 0;
    let bookEnd: number;
    let agencyEnd: number;
    const delta =
      this.livingFrameTime === undefined
        ? 0
        : Math.min(
            0.05,
            Math.max(0, (timestamp - this.livingFrameTime) / 1000),
          );
    this.livingFrameTime = timestamp;
    try {
      const reduced =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
      this.agency?.setMode(reduced ? "reduced" : "running");
      for (const actor of this.inhabitants?.selectables ?? [])
        this.agency?.setAvailable(
          actor.descriptor.id,
          actor.root.userData.loadState === "ready",
        );
      this.agencyClock += delta * 1000;
      this.sessionBooks?.update(delta, reduced, this.agency?.getPoses() ?? []);
      bookEnd = this.performanceProbe.active ? this.now() : 0;
      this.agency?.update({
        sessionActivity: this.worldSessionActivity,
        physicalObstacles: this.sessionBooks?.navigationObstacles() ?? [],
        readingCandidate: this.sessionBooks?.candidate() ?? null,
        scrollCandidates: this.scrollVisuals?.candidates() ?? [],
      });
      agencyEnd = this.performanceProbe.active ? this.now() : 0;
      // Session collision reads the preceding phase; all post-agency consumers
      // share one detached snapshot, never mutable Agent objects.
      const poses = this.agency?.getPoses() ?? [];
      this.checkpointInhabitants(false, poses);
      this.sessionBooks?.reconcileCarrier(poses);
      this.inhabitants?.drive(poses);
      if (this.agency && this.livingVisuals && this.inhabitants)
        this.livingVisuals.driveInhabitantInteractions(
          poses,
          (id) => this.inhabitants?.getCarryAnchor(id) ?? null,
        );
      this.inhabitants?.update(delta, reduced);
      this.sessionBooks?.followInhabitant(
        delta,
        poses,
        (id) => this.inhabitants?.getSocket(id, "socket_carry") ?? null,
      );
      this.ambientMagic?.update(delta, reduced);
      this.orbital?.update(delta, reduced);
      if (this.selection?.id === "portal:duelo-arcano")
        mountedWorld.getInteraction()?.updateHighlightBounds();
      this.scrollVisuals?.update(
        delta,
        reduced,
        poses,
        (id) => this.inhabitants?.getCarryAnchor(id) ?? null,
      );
      if (
        this.selection?.id.startsWith("scroll:") ||
        this.selection?.id.startsWith("reading-book:")
      )
        mountedWorld.getInteraction()?.updateHighlightBounds();
      if (this.agency)
        this.sceneProps?.update(
          this.narrative?.scenes.spell
            ? this.narrative.scenes.spell === "restored"
              ? "intact"
              : "damaged-cosmetic"
            : this.agency.getSnapshot().cosmetic,
          delta,
          reduced,
        );
      if (this.selection?.id.startsWith("character:"))
        mountedWorld.getInteraction()?.updateHighlightBounds();
      this.livingVisuals?.update(
        delta,
        reduced,
        this.narrative?.scenes.rift && this.narrative.scenes.rift !== "restored"
          ? "noturna"
          : undefined,
      );
      this.narrativeVisuals?.update(this.narrative, delta, reduced);
      if (this.livingVisuals && this.selection?.id.startsWith("living:"))
        mountedWorld.getInteraction()?.updateHighlightBounds();
    } catch {
      this.failRuntime();
      return;
    }
    this.performanceProbe.markQuest("sceneEnd");
    if (this.performanceProbe.active) {
      const end = this.now();
      this.performanceProbe.record("updateCpu", end - cpuStart);
      this.performanceProbe.record("bookCpu", bookEnd - cpuStart);
      this.performanceProbe.record("agencyCpu", agencyEnd - bookEnd);
      this.performanceProbe.record("effectsCpu", end - agencyEnd);
    }
    if (!this.renderCurrentFrame()) return;
    if (this.state !== "running") return;
    this.renderedFrames += 1;
    this.performanceProbe.frame(timestamp);
    this.frameMetrics.record(timestamp);
    mountedWorld.requestFrame(this.renderFrame);
    if (this.state !== "running") {
      mountedWorld.cancelFrame();
      return;
    }
    this.publishDiagnostics(false, timestamp);
  };

  private renderCurrentFrame(): boolean {
    const mountedWorld = this.mountedWorld;
    if (
      !mountedWorld ||
      this.isTerminal() ||
      this.state === "paused" ||
      !this.viewportReady
    ) {
      return true;
    }
    const { camera, renderer, scene } = mountedWorld;
    try {
      if (!this.lightingInitialized && this.livingVisuals) {
        this.livingSession?.refreshContext();
        this.nightLighting?.refreshContext();
        const reduced =
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
          false;
        this.livingVisuals.update(
          0,
          reduced,
          this.narrative?.scenes.rift &&
            this.narrative.scenes.rift !== "restored"
            ? "noturna"
            : undefined,
          true,
        );
        this.narrativeVisuals?.update(this.narrative, 0, reduced);
        this.lightingInitialized = true;
      }
      const start = this.performanceProbe.active ? this.now() : 0;
      if (this.performanceProbe.active && renderer.getContext) {
        const gl = renderer.getContext();
        if ("beginQuery" in gl) {
          this.gpuTimer ??= new GpuTimer(gl);
          this.gpuTimer.begin();
        }
      }
      try {
        this.performanceProbe.markQuest("submitStart");
        renderer.render(scene, camera);
      } finally {
        this.gpuTimer?.end();
      }
      if (this.performanceProbe.active) {
        this.performanceProbe.record("submitCpu", this.now() - start);
        this.performanceProbe.submitted();
        this.performanceProbe.questSubmitted(
          renderer.info?.programs?.length ?? null,
        );
      }
    } catch {
      this.failRuntime();
      return false;
    }
    if (this.mountedWorld !== mountedWorld) return false;

    if (
      this.timeToFirstUsableFrameMs === null &&
      this.mountStartedAt !== undefined
    ) {
      this.timeToFirstUsableFrameMs = Math.max(
        0,
        this.now() - this.mountStartedAt,
      );
    }

    const { info } = renderer;
    if (info) {
      this.drawCalls = info.render.calls;
      this.geometries = info.memory.geometries;
      this.textures = info.memory.textures;
      this.triangles = info.render.triangles;
    }
    return true;
  }

  private activateLoop(): void {
    if (this.isTerminal() || this.state === "running") return;
    const mountedWorld = this.mountedWorld;
    if (!mountedWorld) return;
    this.state = "running";
    if (this.diagnosticsListeners.size > 0)
      this.performanceProbe.start(mountedWorld.renderer.domElement);
    this.pausedByVisibility = false;
    this.nightLighting?.refreshContext();
    this.livingVisuals?.reconcileLighting();
    this.lightingInitialized = false;
    this.resetFrameMetrics();
    const timestamp = this.now();
    if (!this.viewportReady) {
      this.publishDiagnostics(true, timestamp);
      return;
    }
    mountedWorld.requestFrame(this.renderFrame);
    if (!this.renderCurrentFrame()) return;
    if (this.state !== "running") return;
    this.renderedFrames += 1;
    this.performanceProbe.frame(timestamp);
    this.frameMetrics.record(timestamp);
    this.publishDiagnostics(true, timestamp);
  }

  private pauseLoop(): void {
    if (this.state !== "running" && this.state !== "mounted") return;
    this.mountedWorld?.cancelFrame();
    this.state = "paused";
    this.performanceProbe.stop();
    this.gpuTimer?.dispose();
    this.gpuTimer = undefined;
    this.agency?.setMode("paused");
    this.livingFrameTime = undefined;
    this.resetFrameMetrics();
    this.mountedWorld?.getInteraction()?.cancelActiveGestures();
    this.publishDiagnostics(true);
  }

  private failRuntime(): void {
    if (this.failureReported || this.isTerminal()) return;

    this.failureReported = true;
    this.state = "failed";
    this.releaseMount();
    this.resetRuntimeData();
    const failure = Object.freeze({
      code: "unavailable" as const,
      message:
        "O ambiente 3D encontrou uma falha de renderização e foi encerrado.",
    });
    for (const listener of [...this.failureListeners]) {
      try {
        listener(failure);
      } catch {
        // A host listener cannot make this terminal runtime active again.
      }
    }
    this.clearListeners();
  }

  private isTerminal(): boolean {
    return this.state === "failed" || this.state === "disposed";
  }

  private cancelPausedCheckpoint(): void {
    if (this.pausedCheckpointIdle !== undefined) {
      window.cancelIdleCallback?.(this.pausedCheckpointIdle);
      this.pausedCheckpointIdle = undefined;
    }
    if (this.pausedCheckpointTimer !== undefined) {
      window.clearTimeout(this.pausedCheckpointTimer);
      this.pausedCheckpointTimer = undefined;
    }
  }

  private schedulePausedCheckpoint(): void {
    if (!this.agency || !this.onInhabitantCheckpoint) return;
    if (document.hidden) {
      this.cancelPausedCheckpoint();
      this.checkpointInhabitants(true);
      return;
    }
    if (
      this.pausedCheckpointIdle !== undefined ||
      this.pausedCheckpointTimer !== undefined
    )
      return;
    const capture = () => {
      this.pausedCheckpointIdle = undefined;
      this.pausedCheckpointTimer = undefined;
      if (this.state === "paused") this.checkpointInhabitants(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      this.pausedCheckpointIdle = window.requestIdleCallback(capture, {
        timeout: 1800,
      });
    } else {
      // A fallback on Android WebViews without requestIdleCallback.
      this.pausedCheckpointTimer = window.setTimeout(capture, 120);
    }
  }

  /** Periodic lightweight snapshots, plus pause/close; no IndexedDB per frame. */
  private checkpointInhabitants(
    force: boolean,
    poses?: readonly import("../inhabitantAgency").AgentView[],
  ): void {
    if (!this.agency || !this.onInhabitantCheckpoint) return;
    const now = this.now();
    if (
      !force &&
      this.lastContinuityCheckpointAt !== undefined &&
      now - this.lastContinuityCheckpointAt < 12_000
    ) {
      return;
    }
    if (!(poses ?? this.agency.getPoses()).some((actor) => actor.available))
      return;
    this.lastContinuityCheckpointAt = now;
    try {
      this.onInhabitantCheckpoint(this.agency.captureContinuity());
    } catch {
      // A failed persistence adapter cannot turn a working scene into a crash.
    }
  }

  private releaseMount(): void {
    this.cancelPausedCheckpoint();
    this.checkpointInhabitants(true);
    window.removeEventListener("pagehide", this.handlePageHide);
    const mountedWorld = this.mountedWorld;
    this.mountedWorld = undefined;
    this.navigation = undefined;
    this.recordVisuals.clear();
    this.sessionBooks?.dispose();
    this.sessionBooks = undefined;
    this.agency?.setMode("unavailable");
    this.unsubscribeAgency?.();
    this.unsubscribeLivingEvents?.();
    this.agency?.dispose();
    this.agency = undefined;
    this.agencyListeners.clear();
    this.inhabitantActivations.clear();
    this.sceneProps = undefined;
    this.sessionVisuals = undefined;
    this.inhabitants?.dispose();
    this.inhabitants = undefined;
    this.livingVisuals?.dispose();
    this.livingVisuals = undefined;
    this.scrollVisuals = undefined;
    this.ambientMagic = undefined;
    this.orbital = undefined;
    this.narrativeVisuals = undefined;
    this.narrative = undefined;
    this.livingFrameTime = undefined;
    try {
      mountedWorld?.dispose();
    } catch {
      // ThreeWorldMount keeps cleanup best-effort; the terminal state remains.
    }
  }

  private resetRuntimeData(): void {
    this.resetFrameMetrics();
    this.fixtureLoadStartedAt = undefined;
    this.drawCalls = 0;
    this.geometries = 0;
    this.activePointLights = 0;
    this.meshes = 0;
    this.materialTextureReferences = 0;
    this.performanceScenarioAssetsLoaded = 0;
    this.performanceScenarioFailed = false;
    this.performanceScenarioPendingAssets = 0;
    this.sceneObjects = 0;
    this.selectableObjects = [];
    this.baseSelectableObjects = [];
    this.readingAreaBookVisuals.clear();
    this.selection = null;
    this.textures = 0;
    this.triangles = 0;
    this.uniqueMaterialTextures = 0;
    this.pausedByVisibility = false;
    this.lastValidViewport = undefined;
    this.viewportReady = false;
  }

  private invalidateViewport(mountedWorld: ThreeWorldMount): void {
    this.viewportReady = false;
    this.lastValidViewport = undefined;
    this.navigation?.invalidateViewport();
    mountedWorld.getInteraction()?.cancelActiveGestures();
    mountedWorld.cancelFrame();
  }

  private clearListeners(): void {
    this.performanceProbe.stop();
    this.performanceProbe.setQuestEnabled(false);
    this.gpuTimer?.dispose();
    this.gpuTimer = undefined;
    this.diagnosticsListeners.clear();
    this.failureListeners.clear();
    this.selectionListeners.clear();
  }

  private publishDiagnostics(force: boolean, timestamp = this.now()): void {
    if (
      !force &&
      this.lastDiagnosticsPublishedAt !== undefined &&
      timestamp - this.lastDiagnosticsPublishedAt <
        DIAGNOSTICS_PUBLISH_INTERVAL_MS
    ) {
      return;
    }
    this.lastDiagnosticsPublishedAt = timestamp;
    if (this.mountedWorld && (force || this.diagnosticsListeners.size > 0))
      this.updateObjectCounts(this.mountedWorld.scene);
    const diagnostics = this.getDiagnostics();
    this.updateCanvasDiagnostics(diagnostics);
    for (const listener of this.diagnosticsListeners) listener(diagnostics);
  }

  private readJsHeap(): number | null {
    if (
      !this.performanceProbe.active ||
      typeof performance === "undefined" ||
      !("memory" in performance)
    )
      return null;
    const memory: unknown = performance.memory;
    if (!memory || typeof memory !== "object" || !("usedJSHeapSize" in memory))
      return null;
    return typeof memory.usedJSHeapSize === "number"
      ? memory.usedJSHeapSize
      : null;
  }

  private resetFrameMetrics(): void {
    this.frameMetrics.reset();
    this.lastDiagnosticsPublishedAt = undefined;
  }

  private updateCanvasDiagnostics(diagnostics: WorldRuntimeDiagnostics): void {
    const canvas = this.mountedWorld?.renderer.domElement;
    if (!canvas) return;
    canvas.dataset.activeFrameLoops = String(diagnostics.activeFrameLoops);
    canvas.dataset.drawCalls = String(diagnostics.drawCalls);
    canvas.dataset.fixtureLoadMs = diagnostics.fixtureLoadMs?.toFixed(1) ?? "";
    canvas.dataset.fixtureStatus = diagnostics.fixtureStatus;
    canvas.dataset.firstUsableFrameMs =
      diagnostics.timeToFirstUsableFrameMs?.toFixed(1) ?? "";
    canvas.dataset.fps = diagnostics.fps?.toFixed(1) ?? "";
    canvas.dataset.frameTimeMs = diagnostics.frameTimeMs?.toFixed(2) ?? "";
    canvas.dataset.geometries = String(diagnostics.geometries);
    canvas.dataset.meshes = String(diagnostics.meshes);
    canvas.dataset.materialTextureReferences = String(
      diagnostics.materialTextureReferences,
    );
    canvas.dataset.performanceScenario = diagnostics.performanceScenarioId;
    canvas.dataset.performanceScenarioAssetsLoaded = String(
      diagnostics.performanceScenarioAssetsLoaded,
    );
    canvas.dataset.performanceScenarioAssetsTotal = String(
      diagnostics.performanceScenarioAssetsTotal,
    );
    canvas.dataset.renderedFrames = String(diagnostics.renderedFrames);
    canvas.dataset.runtimeState = diagnostics.runtimeState;
    canvas.dataset.sceneObjects = String(diagnostics.sceneObjects);
    canvas.dataset.textures = String(diagnostics.textures);
    canvas.dataset.triangles = String(diagnostics.triangles);
    canvas.dataset.uniqueMaterialTextures = String(
      diagnostics.uniqueMaterialTextures,
    );
  }

  private updateObjectCounts(scene: Scene): void {
    let meshes = 0;
    let sceneObjects = 0;
    let pointLights = 0;
    scene.traverseVisible((object) => {
      if (object === scene) return;
      sceneObjects += 1;
      if (object instanceof Mesh) meshes += 1;
      if (object instanceof PointLight) pointLights += 1;
    });
    this.activePointLights = pointLights;
    this.meshes = meshes;
    this.sceneObjects = sceneObjects;
  }

  private refreshSelectableObjects(): void {
    const fixture = this.performanceScenarioDiagnosticsEnabled
      ? this.baseSelectableObjects.at(-1)
      : undefined;
    const beforeFixture = this.performanceScenarioDiagnosticsEnabled
      ? this.baseSelectableObjects.slice(0, -1)
      : this.baseSelectableObjects;
    this.selectableObjects = Object.freeze([
      ...beforeFixture,
      ...[...this.readingAreaBookVisuals.values()].map(({ book }) =>
        Object.freeze({
          entryId: book.entryId,
          id: book.instanceId,
          label: book.title,
        }),
      ),
      ...(fixture ? [fixture] : []),
    ]);
  }

  private updateMaterialTextureMetrics(scene: Scene): void {
    if (!this.performanceScenarioDiagnosticsEnabled) return;
    const metrics = collectSceneTextureMetrics(scene);
    this.materialTextureReferences = metrics.materialTextureReferences;
    this.uniqueMaterialTextures = metrics.uniqueMaterialTextures;
  }
}

export function createThreeWorldRuntime(
  dependencies?: ThreeWorldRuntimeDependencies,
): WorldRuntime {
  return new ThreeWorldRuntime(dependencies);
}
