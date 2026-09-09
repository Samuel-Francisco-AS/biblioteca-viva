import {
  Color,
  Mesh,
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
import { FrameMetricsWindow } from "./frameMetrics";
import fixtureUrl from "./fixtures/f1-technical-pyramid.glb?url&no-inline";
import {
  createReferenceScene,
  disposeObjectTree,
  REFERENCE_SCENE_PROXY_TYPES,
  type ReferenceScene,
} from "./referenceScene";
import { ThreeWorldInteraction } from "./ThreeWorldInteraction";

interface RendererInfo {
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
  readonly createRenderer?: () => ThreeWorldRenderer;
  readonly fixtureLoader?: FixtureModelLoader;
  readonly fixtureUrl?: string;
  readonly frameScheduler?: FrameScheduler;
  readonly now?: () => number;
}

const defaultFrameScheduler: FrameScheduler = {
  cancel: (frameId) => window.cancelAnimationFrame(frameId),
  request: (callback) => window.requestAnimationFrame(callback),
};

const FIXTURE_SELECTABLE: WorldSelectableObject = Object.freeze({
  id: "fixture-pyramid",
  label: "Pirâmide técnica",
});

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
  private fixture: Object3D | undefined;
  private interaction: ThreeWorldInteraction | undefined;
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
        new OrthographicCamera(-9, 9, 7, -7, 0.1, 100),
        frameScheduler,
      );
    } catch (error) {
      renderer.dispose();
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

  addFixture(fixture: Object3D): void {
    this.fixture = fixture;
  }

  appendCanvas(): void {
    this.host.append(this.renderer.domElement);
  }

  cancelFrame(): void {
    const frameId = this.frameId;
    this.frameId = undefined;
    if (frameId === undefined) return;
    this.frameScheduler.cancel(frameId);
  }

  getInteraction(): ThreeWorldInteraction | undefined {
    return this.interaction;
  }

  hasActiveFrame(): boolean {
    return this.frameId !== undefined;
  }

  requestFrame(callback: FrameRequestCallback): void {
    this.frameId = this.frameScheduler.request(callback);
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
    const fixture = this.fixture;
    this.fixture = undefined;
    this.safely(() => {
      if (fixture) disposeObjectTree(fixture);
    });
    const referenceScene = this.referenceScene;
    this.referenceScene = undefined;
    this.safely(() => {
      if (referenceScene) disposeObjectTree(referenceScene.root);
    });
    this.safely(() => this.scene.clear());
    this.safely(() => this.renderer.dispose());
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
  private drawCalls = 0;
  private fixtureLoadMs: number | null = null;
  private fixtureLoadStartedAt: number | undefined;
  private fixtureStatus: WorldFixtureStatus = "idle";
  private failureReported = false;
  private readonly frameMetrics = new FrameMetricsWindow();
  private geometries = 0;
  private lastDiagnosticsPublishedAt: number | undefined;
  private meshes = 0;
  private mountStartedAt: number | undefined;
  private mountedWorld: ThreeWorldMount | undefined;
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
  private viewportReady = false;
  private readonly createRenderer: () => ThreeWorldRenderer;
  private readonly fixtureLoader: FixtureModelLoader;
  private readonly fixtureUrl: string;
  private readonly frameScheduler: FrameScheduler;
  private readonly now: () => number;

  constructor(dependencies: ThreeWorldRuntimeDependencies = {}) {
    this.createRenderer =
      dependencies.createRenderer ??
      (() => new WebGLRenderer({ antialias: true, alpha: false }));
    this.fixtureLoader = dependencies.fixtureLoader ?? createFixtureLoader();
    this.fixtureUrl = dependencies.fixtureUrl ?? fixtureUrl;
    this.frameScheduler = dependencies.frameScheduler ?? defaultFrameScheduler;
    this.now = dependencies.now ?? (() => performance.now());
  }

  getDiagnostics(): WorldRuntimeDiagnostics {
    const frameMetrics = this.frameMetrics.snapshot();
    return Object.freeze({
      activeFrameLoops:
        this.state === "running" && this.mountedWorld?.hasActiveFrame() ? 1 : 0,
      drawCalls: this.drawCalls,
      fixtureLoadMs: this.fixtureLoadMs,
      fixtureStatus: this.fixtureStatus,
      fps: this.state === "running" ? frameMetrics.fps : null,
      frameTimeMs: this.state === "running" ? frameMetrics.frameTimeMs : null,
      geometries: this.geometries,
      meshes: this.meshes,
      renderedFrames: this.renderedFrames,
      runtimeState: this.state,
      sceneObjects: this.sceneObjects,
      selectableObjects: this.selectableObjects.length,
      textures: this.textures,
      timeToFirstUsableFrameMs: this.timeToFirstUsableFrameMs,
      triangles: this.triangles,
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
    try {
      const mountedWorld = ThreeWorldMount.create(
        host,
        this.createRenderer,
        this.frameScheduler,
      );
      this.mountedWorld = mountedWorld;
      const referenceScene = createReferenceScene();
      const { camera, renderer, scene } = mountedWorld;

      scene.background = new Color(0x18342d);
      scene.add(referenceScene.root);
      mountedWorld.addReferenceScene(referenceScene);
      camera.position.set(12, 11, 14);
      camera.lookAt(0, 1.1, 0);

      renderer.shadowMap.enabled = false;
      renderer.domElement.className = "three-world-canvas";
      renderer.domElement.dataset.fixtureStatus = "loading";
      renderer.domElement.dataset.referenceMeshes = String(
        referenceScene.meshCount,
      );
      renderer.domElement.dataset.referenceObjects = String(
        referenceScene.meshCount + 1,
      );
      renderer.domElement.dataset.referenceProxyTypes = String(
        REFERENCE_SCENE_PROXY_TYPES,
      );
      renderer.domElement.dataset.threeWorldCanvas = "true";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.selectableObjects = Object.freeze([
        ...referenceScene.selectables.map(({ descriptor }) => descriptor),
        FIXTURE_SELECTABLE,
      ]);
      const interaction = new ThreeWorldInteraction({
        camera,
        canvas: renderer.domElement,
        catalog: this.selectableObjects,
        onSelectionChange: this.handleSelectionChange,
        render: () => {
          if (!this.renderCurrentFrame()) return;
          this.publishDiagnostics(false);
        },
        scene,
        selectables: referenceScene.selectables,
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
      this.loadFixture();
      mountedWorld.watchResize(this.handleWindowResize);
      mountedWorld.watchVisibility(this.handleVisibilityChange);
      this.publishDiagnostics(true);
    } catch (error) {
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
      this.pausedByVisibility = true;
      this.resetFrameMetrics();
      this.mountedWorld?.getInteraction()?.cancelActiveGestures();
      this.publishDiagnostics(true);
      return;
    }

    this.activateLoop();
  }

  onDiagnosticsChange(listener: WorldDiagnosticsListener): () => void {
    if (this.isTerminal()) return () => undefined;
    this.diagnosticsListeners.add(listener);
    listener(this.getDiagnostics());
    return () => this.diagnosticsListeners.delete(listener);
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
  }

  resume(): void {
    if (this.state === "running") return;
    if (this.state !== "paused" && this.state !== "mounted") return;
    if (document.hidden) {
      this.state = "paused";
      this.pausedByVisibility = true;
      this.publishDiagnostics(true);
      return;
    }
    this.activateLoop();
  }

  resize(): void {
    const mountedWorld = this.mountedWorld;
    if (!mountedWorld || this.isTerminal()) return;
    const { camera, host, renderer } = mountedWorld;

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
      this.viewportReady = false;
      mountedWorld.cancelFrame();
      return;
    }
    const aspect = width / height;
    const referenceHalfWidth = 9;
    const referenceHalfHeight = 7;
    const referenceAspect = referenceHalfWidth / referenceHalfHeight;
    const halfWidth =
      aspect >= referenceAspect
        ? referenceHalfHeight * aspect
        : referenceHalfWidth;
    const halfHeight =
      aspect >= referenceAspect
        ? referenceHalfHeight
        : referenceHalfWidth / aspect;

    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    try {
      renderer.setSize(width, height, false);
    } catch {
      this.failRuntime();
      return;
    }
    mountedWorld.getInteraction()?.setViewport(width, height);
    this.viewportReady = true;
    if (this.state === "paused") return;
    if (!this.renderCurrentFrame()) return;
    if (this.state === "running" && !mountedWorld.hasActiveFrame()) {
      mountedWorld.requestFrame(this.renderFrame);
    }
    this.publishDiagnostics(false);
  }

  selectObject(id: string | null): void {
    if (this.isTerminal()) return;
    this.mountedWorld?.getInteraction()?.selectObject(id);
  }

  dispose(): void {
    if (this.state === "disposed") return;

    if (this.state === "failed") {
      this.clearListeners();
      return;
    }

    this.state = "disposed";
    this.releaseMount();
    this.resetRuntimeData();
    this.failureListeners.clear();
    this.selectionListeners.clear();
    this.publishDiagnostics(true);
    this.diagnosticsListeners.clear();
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.isTerminal()) return;
    if (document.hidden) {
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
    this.selection = selection;
    for (const listener of this.selectionListeners) listener(selection);
  };

  private loadFixture(): void {
    this.fixtureLoadStartedAt = this.now();
    this.fixtureLoadMs = null;
    this.fixtureStatus = "loading";
    const mountedWorld = this.mountedWorld;
    if (mountedWorld)
      mountedWorld.renderer.domElement.dataset.fixtureStatus = "loading";
    try {
      this.fixtureLoader.load(
        this.fixtureUrl,
        this.handleFixtureLoaded,
        this.handleFixtureError,
      );
    } catch {
      this.handleFixtureError();
    }
  }

  private readonly handleFixtureLoaded = (model: Object3D): void => {
    const mountedWorld = this.mountedWorld;
    if (this.isTerminal() || !mountedWorld) {
      disposeObjectTree(model);
      return;
    }

    model.name = "f1-technical-gltf-fixture";
    model.position.set(0.4, 0.1, 2.6);
    model.scale.setScalar(1.35);
    mountedWorld.scene.add(model);
    mountedWorld.addFixture(model);
    mountedWorld.getInteraction()?.addSelectable(FIXTURE_SELECTABLE, model);
    if (this.isTerminal() || this.mountedWorld !== mountedWorld) return;
    const elapsed = Math.max(0, this.now() - (this.fixtureLoadStartedAt ?? 0));
    this.fixtureLoadMs = elapsed;
    this.fixtureStatus = "ready";
    mountedWorld.renderer.domElement.dataset.fixtureLoadMs = elapsed.toFixed(1);
    mountedWorld.renderer.domElement.dataset.fixtureStatus = "ready";
    if (!this.renderCurrentFrame()) return;
    this.publishDiagnostics(true);
  };

  private readonly handleFixtureError = (): void => {
    const mountedWorld = this.mountedWorld;
    if (this.isTerminal() || !mountedWorld) return;
    this.fixtureStatus = "error";
    mountedWorld.renderer.domElement.dataset.fixtureStatus = "error";
    this.publishDiagnostics(true);
    console.error("[Biblioteca Viva] f1-technical-fixture-load-failed");
  };

  private readonly renderFrame = (timestamp: number): void => {
    if (this.state !== "running") return;

    const mountedWorld = this.mountedWorld;
    if (!mountedWorld) return;
    mountedWorld.settleFrame();
    if (!this.renderCurrentFrame()) return;
    if (this.state !== "running") return;
    this.renderedFrames += 1;
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
      renderer.render(scene, camera);
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
    this.updateObjectCounts(scene);
    return true;
  }

  private activateLoop(): void {
    if (this.isTerminal() || this.state === "running") return;
    const mountedWorld = this.mountedWorld;
    if (!mountedWorld) return;
    this.state = "running";
    this.pausedByVisibility = false;
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
    this.frameMetrics.record(timestamp);
    this.publishDiagnostics(true, timestamp);
  }

  private pauseLoop(): void {
    if (this.state !== "running" && this.state !== "mounted") return;
    this.mountedWorld?.cancelFrame();
    this.state = "paused";
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

  private releaseMount(): void {
    const mountedWorld = this.mountedWorld;
    this.mountedWorld = undefined;
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
    this.meshes = 0;
    this.sceneObjects = 0;
    this.selectableObjects = [];
    this.selection = null;
    this.textures = 0;
    this.triangles = 0;
    this.pausedByVisibility = false;
    this.viewportReady = false;
  }

  private clearListeners(): void {
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
    const diagnostics = this.getDiagnostics();
    this.updateCanvasDiagnostics(diagnostics);
    for (const listener of this.diagnosticsListeners) listener(diagnostics);
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
    canvas.dataset.renderedFrames = String(diagnostics.renderedFrames);
    canvas.dataset.runtimeState = diagnostics.runtimeState;
    canvas.dataset.sceneObjects = String(diagnostics.sceneObjects);
    canvas.dataset.textures = String(diagnostics.textures);
    canvas.dataset.triangles = String(diagnostics.triangles);
  }

  private updateObjectCounts(scene: Scene): void {
    let meshes = 0;
    let sceneObjects = 0;
    scene.traverseVisible((object) => {
      if (object === scene) return;
      sceneObjects += 1;
      if (object instanceof Mesh) meshes += 1;
    });
    this.meshes = meshes;
    this.sceneObjects = sceneObjects;
  }
}

export function createThreeWorldRuntime(): WorldRuntime {
  return new ThreeWorldRuntime();
}
