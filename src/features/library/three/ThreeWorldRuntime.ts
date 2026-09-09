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

export class ThreeWorldRuntime implements WorldRuntime {
  private camera: OrthographicCamera | undefined;
  private readonly diagnosticsListeners = new Set<WorldDiagnosticsListener>();
  private drawCalls = 0;
  private fixture: Object3D | undefined;
  private fixtureLoadMs: number | null = null;
  private fixtureLoadStartedAt: number | undefined;
  private fixtureStatus: WorldFixtureStatus = "idle";
  private frameId: number | undefined;
  private readonly frameMetrics = new FrameMetricsWindow();
  private geometries = 0;
  private host: HTMLElement | undefined;
  private interaction: ThreeWorldInteraction | undefined;
  private lastDiagnosticsPublishedAt: number | undefined;
  private meshes = 0;
  private mountStartedAt: number | undefined;
  private referenceScene: ReferenceScene | undefined;
  private pausedByVisibility = false;
  private renderedFrames = 0;
  private renderer: ThreeWorldRenderer | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private scene: Scene | undefined;
  private sceneObjects = 0;
  private selectableObjects: readonly WorldSelectableObject[] = [];
  private selection: WorldSelection = null;
  private readonly selectionListeners = new Set<WorldSelectionListener>();
  private state: WorldRuntimeState = "created";
  private textures = 0;
  private timeToFirstUsableFrameMs: number | null = null;
  private triangles = 0;
  private usingWindowResize = false;

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
        this.state === "running" && this.frameId !== undefined ? 1 : 0,
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
      const renderer = this.createRenderer();
      this.renderer = renderer;
      const scene = new Scene();
      const camera = new OrthographicCamera(-9, 9, 7, -7, 0.1, 100);
      const referenceScene = createReferenceScene();

      scene.background = new Color(0x18342d);
      scene.add(referenceScene.root);
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

      this.host = host;
      this.scene = scene;
      this.camera = camera;
      this.referenceScene = referenceScene;
      this.selectableObjects = Object.freeze([
        ...referenceScene.selectables.map(({ descriptor }) => descriptor),
        FIXTURE_SELECTABLE,
      ]);
      this.interaction = new ThreeWorldInteraction({
        camera,
        canvas: renderer.domElement,
        catalog: this.selectableObjects,
        onSelectionChange: this.handleSelectionChange,
        render: () => {
          this.renderCurrentFrame();
          this.publishDiagnostics(false);
        },
        scene,
        selectables: referenceScene.selectables,
      });
      this.state = "mounted";

      host.append(renderer.domElement);
      this.resize();
      this.loadFixture();

      if (typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", this.handleWindowResize);
        this.usingWindowResize = true;
      } else {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(host);
      }
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
      this.publishDiagnostics(true);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  start(): void {
    if (this.state === "running") return;
    if (this.state !== "mounted" && this.state !== "paused") {
      throw new Error("ThreeWorldRuntime must be mounted before it starts.");
    }

    if (document.hidden) {
      this.state = "paused";
      this.pausedByVisibility = true;
      this.resetFrameMetrics();
      this.interaction?.cancelActiveGestures();
      this.publishDiagnostics(true);
      return;
    }

    this.activateLoop();
  }

  onDiagnosticsChange(listener: WorldDiagnosticsListener): () => void {
    if (this.state === "disposed") return () => undefined;
    this.diagnosticsListeners.add(listener);
    listener(this.getDiagnostics());
    return () => this.diagnosticsListeners.delete(listener);
  }

  onSelectionChange(listener: WorldSelectionListener): () => void {
    if (this.state === "disposed") return () => undefined;
    this.selectionListeners.add(listener);
    listener(this.selection);
    return () => this.selectionListeners.delete(listener);
  }

  pause(): void {
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
    if (!this.host || !this.renderer || !this.camera) return;

    const bounds = this.host.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
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

    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.interaction?.setViewport(width, height);
    this.renderCurrentFrame();
    this.publishDiagnostics(false);
  }

  selectObject(id: string | null): void {
    this.interaction?.selectObject(id);
  }

  dispose(): void {
    if (this.state === "disposed") return;

    this.state = "disposed";
    if (this.frameId !== undefined) {
      this.frameScheduler.cancel(this.frameId);
      this.frameId = undefined;
    }
    this.resetFrameMetrics();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    if (this.usingWindowResize) {
      window.removeEventListener("resize", this.handleWindowResize);
      this.usingWindowResize = false;
    }
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );

    this.interaction?.dispose();
    this.interaction = undefined;
    this.selectionListeners.clear();
    if (this.fixture) disposeObjectTree(this.fixture);
    if (this.referenceScene) disposeObjectTree(this.referenceScene.root);
    this.scene?.clear();

    const canvas = this.renderer?.domElement;
    this.renderer?.dispose();
    canvas?.remove();

    this.camera = undefined;
    this.fixture = undefined;
    this.fixtureLoadStartedAt = undefined;
    this.frameId = undefined;
    this.host = undefined;
    this.drawCalls = 0;
    this.geometries = 0;
    this.meshes = 0;
    this.sceneObjects = 0;
    this.selectableObjects = [];
    this.selection = null;
    this.referenceScene = undefined;
    this.renderer = undefined;
    this.scene = undefined;
    this.textures = 0;
    this.triangles = 0;
    this.pausedByVisibility = false;
    this.publishDiagnostics(true);
    this.diagnosticsListeners.clear();
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.state === "disposed") return;
    if (document.hidden) {
      if (this.state === "running") {
        this.pausedByVisibility = true;
        this.pauseLoop();
      } else {
        this.interaction?.cancelActiveGestures();
      }
      return;
    }
    if (this.pausedByVisibility) {
      this.pausedByVisibility = false;
      this.activateLoop();
    }
  };

  private readonly handleWindowResize = (): void => this.resize();

  private readonly handleSelectionChange = (
    selection: WorldSelection,
  ): void => {
    if (this.state === "disposed") return;
    this.selection = selection;
    for (const listener of this.selectionListeners) listener(selection);
  };

  private loadFixture(): void {
    this.fixtureLoadStartedAt = this.now();
    this.fixtureLoadMs = null;
    this.fixtureStatus = "loading";
    if (this.renderer)
      this.renderer.domElement.dataset.fixtureStatus = "loading";
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
    if (this.state === "disposed" || !this.scene || !this.renderer) {
      disposeObjectTree(model);
      return;
    }

    model.name = "f1-technical-gltf-fixture";
    model.position.set(0.4, 0.1, 2.6);
    model.scale.setScalar(1.35);
    this.scene.add(model);
    this.fixture = model;
    this.interaction?.addSelectable(FIXTURE_SELECTABLE, model);
    const elapsed = Math.max(0, this.now() - (this.fixtureLoadStartedAt ?? 0));
    this.fixtureLoadMs = elapsed;
    this.fixtureStatus = "ready";
    this.renderer.domElement.dataset.fixtureLoadMs = elapsed.toFixed(1);
    this.renderer.domElement.dataset.fixtureStatus = "ready";
    this.renderCurrentFrame();
    this.publishDiagnostics(true);
  };

  private readonly handleFixtureError = (): void => {
    if (this.state === "disposed" || !this.renderer) return;
    this.fixtureStatus = "error";
    this.renderer.domElement.dataset.fixtureStatus = "error";
    this.publishDiagnostics(true);
    console.error("[Biblioteca Viva] f1-technical-fixture-load-failed");
  };

  private readonly renderFrame = (timestamp: number): void => {
    if (this.state !== "running") return;

    this.frameId = undefined;
    this.renderCurrentFrame();
    if (this.state !== "running") return;
    this.renderedFrames += 1;
    this.frameMetrics.record(timestamp);
    this.frameId = this.frameScheduler.request(this.renderFrame);
    if (this.state !== "running") {
      this.frameScheduler.cancel(this.frameId);
      this.frameId = undefined;
      return;
    }
    this.publishDiagnostics(false, timestamp);
  };

  private renderCurrentFrame(): void {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    if (!renderer || !scene || !camera || this.state === "disposed") return;
    renderer.render(scene, camera);
    if (!this.renderer || !this.scene || !this.camera) return;

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
  }

  private activateLoop(): void {
    if (this.state === "disposed" || this.state === "running") return;
    this.state = "running";
    this.pausedByVisibility = false;
    this.resetFrameMetrics();
    const timestamp = this.now();
    this.frameId = this.frameScheduler.request(this.renderFrame);
    this.renderCurrentFrame();
    if (this.state !== "running") return;
    this.renderedFrames += 1;
    this.frameMetrics.record(timestamp);
    this.publishDiagnostics(true, timestamp);
  }

  private pauseLoop(): void {
    if (this.state !== "running" && this.state !== "mounted") return;
    if (this.frameId !== undefined) {
      this.frameScheduler.cancel(this.frameId);
      this.frameId = undefined;
    }
    this.state = "paused";
    this.resetFrameMetrics();
    this.interaction?.cancelActiveGestures();
    this.publishDiagnostics(true);
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
    const canvas = this.renderer?.domElement;
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
