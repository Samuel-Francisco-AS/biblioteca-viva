import {
  Box3,
  Box3Helper,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  Vector3,
} from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ThreeWorldRuntime,
  type FixtureModelLoader,
  type ThreeWorldRenderer,
} from "./ThreeWorldRuntime";

class TestRenderer implements ThreeWorldRenderer {
  readonly domElement = document.createElement("canvas");
  readonly dispose = vi.fn();
  readonly info = {
    memory: { geometries: 46, textures: 0 },
    render: { calls: 46, triangles: 546 },
  };
  readonly render = vi.fn<(scene: Scene, camera: OrthographicCamera) => void>();
  readonly setPixelRatio = vi.fn();
  readonly setSize = vi.fn();
  readonly shadowMap = { enabled: true };
}

class TestFixtureLoader implements FixtureModelLoader {
  private onError: ((error: unknown) => void) | undefined;
  private onLoad: ((model: Object3D) => void) | undefined;

  readonly load = vi.fn(
    (
      _url: string,
      onLoad: (model: Object3D) => void,
      onError: (error: unknown) => void,
    ) => {
      this.onLoad = onLoad;
      this.onError = onError;
    },
  );

  fail(error: unknown): void {
    this.onError?.(error);
  }

  succeed(model: Object3D): void {
    this.onLoad?.(model);
  }
}

class TestResizeObserver implements ResizeObserver {
  static instances: TestResizeObserver[] = [];

  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }
}

function createHost(width = 640, height = 360): HTMLDivElement {
  const host = document.createElement("div");
  vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  document.body.append(host);
  return host;
}

function dispatchPointer(
  canvas: HTMLCanvasElement,
  type:
    | "lostpointercapture"
    | "pointercancel"
    | "pointerdown"
    | "pointermove"
    | "pointerup",
  init: {
    readonly clientX: number;
    readonly clientY: number;
    readonly pointerId: number;
    readonly pointerType?: "mouse" | "touch";
  },
): void {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: init.clientX },
    clientY: { value: init.clientY },
    pointerId: { value: init.pointerId },
    pointerType: { value: init.pointerType ?? "mouse" },
  });
  canvas.dispatchEvent(event);
}

afterEach(() => {
  document.body.replaceChildren();
  TestResizeObserver.instances = [];
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ThreeWorldRuntime", () => {
  it("monta a cena, inicia uma vez e descarta os recursos pertencentes", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const request = vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      callbacks.set(id, callback);
      return id;
    });
    const cancel = vi.fn((frameId: number) => callbacks.delete(frameId));
    const addCanvasListener = vi.spyOn(renderer.domElement, "addEventListener");
    const removeCanvasListener = vi.spyOn(
      renderer.domElement,
      "removeEventListener",
    );
    const addDocumentListener = vi.spyOn(document, "addEventListener");
    const removeDocumentListener = vi.spyOn(document, "removeEventListener");
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
      fixtureUrl: "/fixture.gltf",
      frameScheduler: { cancel, request },
    });

    runtime.mount(host);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      drawCalls: 46,
      geometries: 46,
      meshes: 45,
      runtimeState: "mounted",
      selectableObjects: 11,
      textures: 0,
      triangles: 546,
    });
    runtime.start();
    runtime.start();

    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    expect(renderer.shadowMap.enabled).toBe(false);
    expect(renderer.setPixelRatio).toHaveBeenCalledOnce();
    expect(renderer.setSize).toHaveBeenCalledWith(640, 360, false);
    expect(renderer.domElement.dataset.fixtureStatus).toBe("loading");
    expect(renderer.domElement.dataset.referenceMeshes).toBe("45");
    expect(renderer.domElement.dataset.referenceObjects).toBe("46");
    expect(renderer.domElement.dataset.referenceProxyTypes).toBe("4");
    expect(renderer.domElement.dataset.drawCalls).toBe("46");
    expect(renderer.domElement.dataset.triangles).toBe("546");
    expect(fixtureLoader.load).toHaveBeenCalledWith(
      "/fixture.gltf",
      expect.any(Function),
      expect.any(Function),
    );
    expect(request).toHaveBeenCalledOnce();
    expect(TestResizeObserver.instances).toHaveLength(1);
    expect(TestResizeObserver.instances[0]?.observe).toHaveBeenCalledWith(host);
    expect(addDocumentListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(addCanvasListener).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
    expect(addCanvasListener).toHaveBeenCalledWith(
      "wheel",
      expect.any(Function),
      { passive: false },
    );
    expect(addCanvasListener).toHaveBeenCalledWith(
      "webglcontextlost",
      expect.any(Function),
    );
    expect(addCanvasListener).toHaveBeenCalledWith(
      "webglcontextrestored",
      expect.any(Function),
    );

    runtime.dispose();
    runtime.dispose();

    expect(cancel).toHaveBeenCalledOnce();
    expect(TestResizeObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
    expect(removeDocumentListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "pointermove",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "pointerup",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "pointercancel",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "lostpointercapture",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "wheel",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "webglcontextlost",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "webglcontextrestored",
      expect.any(Function),
    );
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(host.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("insere o fixture carregado, registra o tempo e descarta seus recursos", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    const disposeGeometry = vi.spyOn(geometry, "dispose");
    const disposeMaterial = vi.spyOn(material, "dispose");
    const fixture = new Group();
    fixture.add(new Mesh(geometry, material));
    let timestamp = 100;
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
      now: () => timestamp,
    });

    runtime.mount(host);
    timestamp = 126.25;
    fixtureLoader.succeed(fixture);

    expect(renderer.domElement.dataset.fixtureStatus).toBe("ready");
    expect(renderer.domElement.dataset.fixtureLoadMs).toBe("26.3");
    const renderedScene = renderer.render.mock.calls.at(-1)?.[0];
    expect(renderedScene).toBeInstanceOf(Scene);
    expect(renderedScene?.getObjectByName("f1-technical-gltf-fixture")).toBe(
      fixture,
    );

    runtime.dispose();

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
  });

  it("formaliza pause/resume, mantém um RAF e reinicia a janela de FPS", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    let now = 0;
    let nextFrameId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    const request = vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      callbacks.set(id, callback);
      return id;
    });
    const cancel = vi.fn((frameId: number) => callbacks.delete(frameId));
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => new TestRenderer(),
      fixtureLoader: new TestFixtureLoader(),
      frameScheduler: { cancel, request },
      now: () => now,
    });
    runtime.mount(createHost());

    runtime.start();
    runtime.start();
    runtime.resume();
    expect(callbacks.size).toBe(1);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 1,
      fps: null,
      runtimeState: "running",
    });

    const staleCallback = callbacks.values().next().value;
    expect(staleCallback).toBeDefined();
    const firstFrameId = callbacks.keys().next().value;
    expect(firstFrameId).toBeDefined();
    if (firstFrameId === undefined) return;
    callbacks.delete(firstFrameId);
    now = 20;
    staleCallback?.(now);
    expect(callbacks.size).toBe(1);
    expect(runtime.getDiagnostics().fps).toBeCloseTo(50, 8);
    expect(runtime.getDiagnostics().frameTimeMs).toBeCloseTo(20, 8);

    runtime.pause();
    runtime.pause();
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      fps: null,
      frameTimeMs: null,
      runtimeState: "paused",
    });
    const framesWhilePaused = runtime.getDiagnostics().renderedFrames;
    staleCallback?.(40);
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics().renderedFrames).toBe(framesWhilePaused);

    now = 100;
    runtime.resume();
    runtime.resume();
    runtime.start();
    expect(callbacks.size).toBe(1);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 1,
      fps: null,
      runtimeState: "running",
    });

    runtime.dispose();
    runtime.dispose();
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      runtimeState: "disposed",
    });
    expect(() => runtime.start()).toThrow(/must be mounted/u);
  });

  it("encerra uma instância quando renderer.render falha no RAF", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const request = vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      callbacks.set(id, callback);
      return id;
    });
    const cancel = vi.fn((frameId: number) => callbacks.delete(frameId));
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
      frameScheduler: { cancel, request },
    });
    const failureListener = vi.fn();

    runtime.mount(host);
    runtime.onFailure(failureListener);
    runtime.start();
    const entry = callbacks.entries().next().value;
    expect(entry).toBeDefined();
    if (!entry) return;
    const [frameId, callback] = entry;
    callbacks.delete(frameId);
    renderer.render.mockImplementation(() => {
      throw new Error("render unavailable");
    });

    expect(() => callback(16)).not.toThrow();

    expect(failureListener).toHaveBeenCalledOnce();
    expect(failureListener).toHaveBeenCalledWith({
      code: "unavailable",
      message:
        "O ambiente 3D encontrou uma falha de renderização e foi encerrado.",
    });
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      runtimeState: "failed",
    });
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(host.querySelector("canvas")).not.toBeInTheDocument();

    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    const fixture = new Group();
    fixture.add(new Mesh(geometry, material));
    const disposeGeometry = vi.spyOn(geometry, "dispose");
    fixtureLoader.succeed(fixture);
    expect(disposeGeometry).toHaveBeenCalledOnce();

    runtime.start();
    runtime.resume();
    runtime.pause();
    runtime.resize();
    runtime.selectObject("table-01");
    runtime.dispose();
    runtime.dispose();
    expect(request).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(failureListener).toHaveBeenCalledOnce();
  });

  it("trata context loss como terminal e mantém restauração e GLB tardios inertes", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const request = vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      callbacks.set(id, callback);
      return id;
    });
    const cancel = vi.fn((frameId: number) => callbacks.delete(frameId));
    const removeCanvasListener = vi.spyOn(
      renderer.domElement,
      "removeEventListener",
    );
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
      frameScheduler: { cancel, request },
    });
    const failureListener = vi.fn();

    runtime.mount(host);
    runtime.onFailure(failureListener);
    const selectionListener = vi.fn();
    runtime.onSelectionChange(selectionListener);
    runtime.start();
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 100,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("tap");

    const contextLost = new Event("webglcontextlost", { cancelable: true });
    renderer.domElement.dispatchEvent(contextLost);

    expect(contextLost.defaultPrevented).toBe(true);
    expect(failureListener).toHaveBeenCalledOnce();
    expect(failureListener).toHaveBeenCalledWith({
      code: "unavailable",
      message:
        "O ambiente 3D encontrou uma falha de renderização e foi encerrado.",
    });
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      runtimeState: "failed",
    });
    expect(callbacks.size).toBe(0);
    expect(cancel).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(host.querySelector("canvas")).not.toBeInTheDocument();
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "webglcontextlost",
      expect.any(Function),
    );
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "webglcontextrestored",
      expect.any(Function),
    );

    const rendersBeforeLateCallbacks = renderer.render.mock.calls.length;
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: 100,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    const fixture = new Group();
    fixture.add(new Mesh(geometry, material));
    const disposeGeometry = vi.spyOn(geometry, "dispose");
    const disposeMaterial = vi.spyOn(material, "dispose");
    fixtureLoader.succeed(fixture);
    renderer.domElement.dispatchEvent(new Event("webglcontextrestored"));
    document.dispatchEvent(new Event("visibilitychange"));
    runtime.start();
    runtime.pause();
    runtime.resume();
    runtime.resize();
    runtime.selectObject("table-01");
    runtime.dispose();
    runtime.dispose();

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledTimes(rendersBeforeLateCallbacks);
    expect(selectionListener).toHaveBeenCalledOnce();
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      runtimeState: "failed",
    });
    expect(callbacks.size).toBe(0);
    expect(request).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(failureListener).toHaveBeenCalledOnce();
  });

  it("encerra a mesma montagem se resize não consegue atualizar o renderer", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    const failureListener = vi.fn();

    runtime.mount(host);
    runtime.onFailure(failureListener);
    renderer.setSize.mockImplementation(() => {
      throw new Error("resize unavailable");
    });

    expect(() => runtime.resize()).not.toThrow();

    expect(failureListener).toHaveBeenCalledOnce();
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 0,
      runtimeState: "failed",
    });
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(host.querySelector("canvas")).not.toBeInTheDocument();
  });

  it("não renderiza por resize ou fixture enquanto pausado e retoma normalmente", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
      frameScheduler: {
        cancel: (frameId) => callbacks.delete(frameId),
        request: (callback) => {
          const id = ++nextFrameId;
          callbacks.set(id, callback);
          return id;
        },
      },
    });

    runtime.mount(createHost());
    runtime.pause();
    const rendersWhilePaused = renderer.render.mock.calls.length;
    runtime.resize();
    fixtureLoader.succeed(new Group());

    expect(renderer.render).toHaveBeenCalledTimes(rendersWhilePaused);
    expect(runtime.getDiagnostics().runtimeState).toBe("paused");
    expect(callbacks.size).toBe(0);

    runtime.resume();
    expect(renderer.render).toHaveBeenCalledTimes(rendersWhilePaused + 1);
    expect(runtime.getDiagnostics().runtimeState).toBe("running");
    expect(callbacks.size).toBe(1);
    runtime.dispose();
  });

  it("encerra quando uma seleção pede render fora do RAF", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    const failureListener = vi.fn();

    runtime.mount(createHost());
    runtime.onFailure(failureListener);
    renderer.render.mockImplementation(() => {
      throw new Error("selection render unavailable");
    });

    expect(() => runtime.selectObject("table-01")).not.toThrow();
    expect(failureListener).toHaveBeenCalledOnce();
    expect(runtime.getDiagnostics().runtimeState).toBe("failed");
    expect(renderer.dispose).toHaveBeenCalledOnce();
  });

  it("limita emissões React a quatro vezes por segundo durante o loop", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    let now = 0;
    let nextFrameId = 0;
    const callbacks = new Map<number, FrameRequestCallback>();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => new TestRenderer(),
      fixtureLoader: new TestFixtureLoader(),
      frameScheduler: {
        cancel: (frameId) => {
          callbacks.delete(frameId);
        },
        request: (callback) => {
          const id = ++nextFrameId;
          callbacks.set(id, callback);
          return id;
        },
      },
      now: () => now,
    });
    runtime.mount(createHost());
    const listener = vi.fn();
    runtime.onDiagnosticsChange(listener);
    runtime.start();

    for (let frame = 1; frame <= 20; frame += 1) {
      const entry = callbacks.entries().next().value;
      expect(entry).toBeDefined();
      if (!entry) return;
      const [frameId, callback] = entry;
      callbacks.delete(frameId);
      now = frame * 16;
      callback(now);
    }

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activeFrameLoops: 1,
        runtimeState: "running",
      }),
    );
    expect(runtime.getDiagnostics().fps).toBeCloseTo(62.5, 8);

    runtime.pause();
    expect(listener).toHaveBeenCalledTimes(4);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ fps: null, runtimeState: "paused" }),
    );
    runtime.dispose();
    expect(listener).toHaveBeenCalledTimes(5);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ runtimeState: "disposed" }),
    );
  });

  it("pausa por visibility, cancela gesto e retoma a mesma montagem", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const renderer = new TestRenderer();
    renderer.domElement.setPointerCapture = vi.fn();
    renderer.domElement.hasPointerCapture = () => true;
    renderer.domElement.releasePointerCapture = vi.fn();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
      frameScheduler: {
        cancel: (frameId) => {
          callbacks.delete(frameId);
        },
        request: (callback) => {
          const id = ++nextFrameId;
          callbacks.set(id, callback);
          return id;
        },
      },
    });
    const host = createHost();
    runtime.mount(host);
    runtime.start();
    runtime.selectObject("table-01");
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 100,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("tap");

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(0);
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    expect(renderer.domElement.dataset.selectedObject).toBe("table-01");
    expect(runtime.getDiagnostics().runtimeState).toBe("paused");

    document.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(0);
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(1);
    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    expect(runtime.getDiagnostics()).toMatchObject({
      activeFrameLoops: 1,
      runtimeState: "running",
    });
    expect(renderer.domElement.dataset.selectedObject).toBe("table-01");

    runtime.pause();
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics().runtimeState).toBe("paused");

    runtime.dispose();
  });

  it("cancela um pan ao pausar e não reutiliza o pointer anterior após retomar", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });

    runtime.mount(createHost());
    runtime.start();
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 100,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    dispatchPointer(renderer.domElement, "pointermove", {
      clientX: 140,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("pan");

    runtime.pause();
    const rendersAfterPause = renderer.render.mock.calls.length;
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: 140,
      clientY: 100,
      pointerId: 7,
      pointerType: "touch",
    });
    expect(renderer.render).toHaveBeenCalledTimes(rendersAfterPause);

    runtime.resume();
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 160,
      clientY: 100,
      pointerId: 8,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("tap");
    dispatchPointer(renderer.domElement, "pointercancel", {
      clientX: 160,
      clientY: 100,
      pointerId: 8,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    runtime.dispose();
  });

  it("tolera perda de capture já interrompida e aceita o próximo gesto", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    renderer.domElement.setPointerCapture = vi.fn(() => {
      throw new Error("capture unavailable");
    });
    renderer.domElement.hasPointerCapture = vi.fn(() => {
      throw new Error("capture already lost");
    });
    renderer.domElement.releasePointerCapture = vi.fn(() => {
      throw new Error("release unavailable");
    });
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });

    runtime.mount(createHost());
    expect(() => {
      dispatchPointer(renderer.domElement, "pointerdown", {
        clientX: 100,
        clientY: 100,
        pointerId: 7,
        pointerType: "touch",
      });
      dispatchPointer(renderer.domElement, "lostpointercapture", {
        clientX: 100,
        clientY: 100,
        pointerId: 7,
        pointerType: "touch",
      });
    }).not.toThrow();
    expect(renderer.domElement.dataset.gesture).toBe("idle");

    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 120,
      clientY: 100,
      pointerId: 8,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("tap");
    runtime.dispose();
  });

  it("resize preserva renderer, canvas e seleção ao recalcular o frustum", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const host = createHost(640, 360);
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    runtime.mount(host);
    runtime.selectObject("bookshelf-02");
    const canvas = renderer.domElement;
    const firstCamera = renderer.render.mock.calls.at(-1)?.[1];
    const getBounds = vi.spyOn(host, "getBoundingClientRect");
    getBounds.mockReturnValue({
      bottom: 640,
      height: 640,
      left: 0,
      right: 360,
      top: 0,
      width: 360,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    runtime.resize();

    const resizedCamera = renderer.render.mock.calls.at(-1)?.[1];
    expect(renderer.setSize).toHaveBeenLastCalledWith(360, 640, false);
    expect(resizedCamera).toBe(firstCamera);
    expect(resizedCamera?.top).toBeGreaterThan(7);
    expect(host.querySelector("canvas")).toBe(canvas);
    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    expect(canvas.dataset.selectedObject).toBe("bookshelf-02");
    expect(TestResizeObserver.instances).toHaveLength(1);

    runtime.dispose();
  });

  it("aguarda dimensões transitórias inválidas e retoma o mesmo viewport quando elas voltam", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const renderer = new TestRenderer();
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrameId = 0;
    const request = vi.fn((callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      callbacks.set(id, callback);
      return id;
    });
    const host = createHost(0, 0);
    const getBounds = vi.spyOn(host, "getBoundingClientRect");
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
      frameScheduler: {
        cancel: (frameId) => callbacks.delete(frameId),
        request,
      },
    });

    runtime.mount(host);
    runtime.start();
    expect(renderer.setSize).not.toHaveBeenCalled();
    expect(renderer.render).not.toHaveBeenCalled();
    expect(callbacks.size).toBe(0);
    expect(runtime.getDiagnostics().runtimeState).toBe("running");

    getBounds.mockReturnValue({
      bottom: 360,
      height: 360,
      left: 0,
      right: 640,
      top: 0,
      width: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    TestResizeObserver.instances[0]?.callback([], {} as ResizeObserver);

    expect(renderer.setSize).toHaveBeenCalledOnce();
    expect(renderer.setSize).toHaveBeenLastCalledWith(640, 360, false);
    expect(renderer.render).toHaveBeenCalledOnce();
    expect(callbacks.size).toBe(1);
    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    expect(TestResizeObserver.instances).toHaveLength(1);

    const rendersBeforeInvalidViewport = renderer.render.mock.calls.length;
    getBounds.mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    TestResizeObserver.instances[0]?.callback([], {} as ResizeObserver);
    expect(renderer.setSize).toHaveBeenCalledOnce();
    expect(renderer.render).toHaveBeenCalledTimes(rendersBeforeInvalidViewport);
    expect(callbacks.size).toBe(0);

    getBounds.mockReturnValue({
      bottom: 360,
      height: 360,
      left: 0,
      right: 640,
      top: 0,
      width: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    TestResizeObserver.instances[0]?.callback([], {} as ResizeObserver);
    expect(renderer.setSize).toHaveBeenCalledTimes(2);
    expect(renderer.render).toHaveBeenCalledTimes(
      rendersBeforeInvalidViewport + 1,
    );
    expect(callbacks.size).toBe(1);

    runtime.dispose();
    const setSizeCallsAfterDispose = renderer.setSize.mock.calls.length;
    TestResizeObserver.instances[0]?.callback([], {} as ResizeObserver);
    expect(renderer.setSize).toHaveBeenCalledTimes(setSizeCallsAfterDispose);
  });

  it("mantém picking alinhado à caixa atual do canvas depois de resize", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const host = createHost(640, 360);
    const getHostBounds = vi.spyOn(host, "getBoundingClientRect");
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    const listener = vi.fn();

    runtime.mount(host);
    runtime.onSelectionChange(listener);
    getHostBounds.mockReturnValue({
      bottom: 680,
      height: 640,
      left: 80,
      right: 440,
      top: 40,
      width: 360,
      x: 80,
      y: 40,
      toJSON: () => ({}),
    });
    runtime.resize();
    vi.spyOn(renderer.domElement, "getBoundingClientRect").mockReturnValue({
      bottom: 680,
      height: 640,
      left: 80,
      right: 440,
      top: 40,
      width: 360,
      x: 80,
      y: 40,
      toJSON: () => ({}),
    });
    const pickX = Number(renderer.domElement.dataset.testPickX);
    const pickY = Number(renderer.domElement.dataset.testPickY);

    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 80 + pickX,
      clientY: 40 + pickY,
      pointerId: 1,
    });
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: 80 + pickX,
      clientY: 40 + pickY,
      pointerId: 1,
    });

    expect(renderer.setSize).toHaveBeenLastCalledWith(360, 640, false);
    expect(listener).toHaveBeenLastCalledWith({
      id: "crate-01",
      label: "Caixa técnica 1",
    });
    runtime.dispose();
  });

  it("usa window.resize somente como fallback e remove o listener", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const renderer = new TestRenderer();
    const addWindowListener = vi.spyOn(window, "addEventListener");
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    runtime.mount(createHost());

    expect(addWindowListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    const resizeCallsBeforeEvent = renderer.setSize.mock.calls.length;
    window.dispatchEvent(new Event("resize"));
    expect(renderer.setSize).toHaveBeenCalledTimes(resizeCallsBeforeEvent + 1);

    runtime.dispose();
    expect(removeWindowListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("seleciona por ID, troca highlight e limpa seleção inexistente", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    runtime.mount(createHost());
    const listener = vi.fn();
    runtime.onSelectionChange(listener);

    expect(runtime.getSelectableObjects()).toHaveLength(11);
    expect(runtime.getSelectableObjects().at(-1)).toEqual({
      id: "fixture-pyramid",
      label: "Pirâmide técnica",
    });
    expect(listener).toHaveBeenLastCalledWith(null);

    runtime.selectObject("bookshelf-01");
    expect(listener).toHaveBeenLastCalledWith({
      id: "bookshelf-01",
      label: "Estante técnica 1",
    });
    expect(renderer.domElement.dataset.selectedObject).toBe("bookshelf-01");
    expect(renderer.domElement.dataset.highlightedObject).toBe("bookshelf-01");
    const firstHighlight = renderer.render.mock.calls
      .at(-1)?.[0]
      .getObjectByName("f1-c-selection-highlight");
    expect(firstHighlight).toBeInstanceOf(Box3Helper);
    if (!(firstHighlight instanceof Box3Helper)) return;
    const disposeHighlightGeometry = vi.spyOn(
      firstHighlight.geometry,
      "dispose",
    );
    const firstHighlightMaterial = Array.isArray(firstHighlight.material)
      ? firstHighlight.material[0]
      : firstHighlight.material;
    expect(firstHighlightMaterial).toBeDefined();
    if (!firstHighlightMaterial) return;
    const disposeHighlightMaterial = vi.spyOn(
      firstHighlightMaterial,
      "dispose",
    );

    runtime.selectObject("table-02");
    expect(firstHighlight?.parent).toBeNull();
    expect(disposeHighlightGeometry).toHaveBeenCalledOnce();
    expect(disposeHighlightMaterial).toHaveBeenCalledOnce();
    expect(renderer.domElement.dataset.highlightedObject).toBe("table-02");

    runtime.selectObject("missing-object");
    expect(listener).toHaveBeenLastCalledWith(null);
    expect(renderer.domElement.dataset.selectedObject).toBe("");
    expect(renderer.domElement.dataset.highlightedObject).toBe("");

    runtime.dispose();
    runtime.selectObject("bookshelf-02");
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("resolve um mesh filho do fixture no picking Three → host", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    vi.spyOn(renderer.domElement, "getBoundingClientRect").mockReturnValue({
      bottom: 360,
      height: 360,
      left: 0,
      right: 640,
      top: 0,
      width: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const fixtureLoader = new TestFixtureLoader();
    const fixture = new Group();
    const nested = new Group();
    nested.add(new Mesh(new BoxGeometry(1, 1.7, 1), new MeshBasicMaterial()));
    fixture.add(nested);
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
    });
    runtime.mount(createHost());
    fixtureLoader.succeed(fixture);
    const listener = vi.fn();
    runtime.onSelectionChange(listener);
    const latestRender = renderer.render.mock.calls.at(-1);
    const scene = latestRender?.[0];
    const camera = latestRender?.[1];
    expect(scene).toBeDefined();
    expect(camera).toBeDefined();
    if (!scene || !camera) return;
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    const center = new Box3()
      .setFromObject(fixture)
      .getCenter(new Vector3())
      .project(camera);
    const x = ((center.x + 1) / 2) * 640;
    const y = ((1 - center.y) / 2) * 360;

    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: x,
      clientY: y,
      pointerId: 1,
    });
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: x,
      clientY: y,
      pointerId: 1,
    });

    expect(listener).toHaveBeenLastCalledWith({
      id: "fixture-pyramid",
      label: "Pirâmide técnica",
    });
    runtime.dispose();
  });

  it("faz pan sem selecionar, aplica wheel/pinch e limpa pointercancel", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    renderer.domElement.setPointerCapture = setPointerCapture;
    renderer.domElement.hasPointerCapture = () => true;
    renderer.domElement.releasePointerCapture = releasePointerCapture;
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });
    runtime.mount(createHost());
    const listener = vi.fn();
    runtime.onSelectionChange(listener);
    runtime.selectObject("table-01");
    const callsBeforePan = listener.mock.calls.length;
    const targetBefore = renderer.domElement.dataset.cameraTargetX;

    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      pointerType: "touch",
    });
    dispatchPointer(renderer.domElement, "pointermove", {
      clientX: 150,
      clientY: 120,
      pointerId: 1,
      pointerType: "touch",
    });
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: 150,
      clientY: 120,
      pointerId: 1,
      pointerType: "touch",
    });

    expect(renderer.domElement.dataset.cameraTargetX).not.toBe(targetBefore);
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    expect(listener).toHaveBeenCalledTimes(callsBeforePan);

    renderer.domElement.dispatchEvent(
      new WheelEvent("wheel", { cancelable: true, deltaY: -300 }),
    );
    expect(Number(renderer.domElement.dataset.cameraZoom)).toBeGreaterThan(1);

    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 100,
      clientY: 100,
      pointerId: 2,
      pointerType: "touch",
    });
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 200,
      clientY: 100,
      pointerId: 3,
      pointerType: "touch",
    });
    dispatchPointer(renderer.domElement, "pointerdown", {
      clientX: 300,
      clientY: 100,
      pointerId: 4,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("pinch");
    const zoomBeforePinch = Number(renderer.domElement.dataset.cameraZoom);
    dispatchPointer(renderer.domElement, "pointermove", {
      clientX: 260,
      clientY: 100,
      pointerId: 3,
      pointerType: "touch",
    });
    expect(Number(renderer.domElement.dataset.cameraZoom)).toBeGreaterThan(
      zoomBeforePinch,
    );
    dispatchPointer(renderer.domElement, "pointercancel", {
      clientX: 100,
      clientY: 100,
      pointerId: 2,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("pan");
    const targetBeforeRemainingPan = renderer.domElement.dataset.cameraTargetX;
    dispatchPointer(renderer.domElement, "pointermove", {
      clientX: 280,
      clientY: 100,
      pointerId: 3,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.cameraTargetX).not.toBe(
      targetBeforeRemainingPan,
    );
    dispatchPointer(renderer.domElement, "pointerup", {
      clientX: 280,
      clientY: 100,
      pointerId: 3,
      pointerType: "touch",
    });
    expect(renderer.domElement.dataset.gesture).toBe("idle");
    expect(setPointerCapture).toHaveBeenCalledTimes(3);
    expect(releasePointerCapture).toHaveBeenCalledTimes(3);

    runtime.dispose();
  });

  it("mantém a cena ativa e diagnostica falha do fixture sem reiniciar", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
    });
    const failureListener = vi.fn();

    runtime.mount(host);
    runtime.onFailure(failureListener);
    fixtureLoader.fail(new Error("invalid fixture"));

    expect(renderer.domElement.dataset.fixtureStatus).toBe("error");
    expect(host.querySelector("canvas")).toBeInTheDocument();
    expect(fixtureLoader.load).toHaveBeenCalledOnce();
    expect(runtime.getDiagnostics().runtimeState).toBe("mounted");
    expect(failureListener).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[Biblioteca Viva] f1-technical-fixture-load-failed",
    );

    runtime.dispose();
  });

  it("descarta com segurança um fixture que termina após o runtime", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const fixtureLoader = new TestFixtureLoader();
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    const disposeGeometry = vi.spyOn(geometry, "dispose");
    const disposeMaterial = vi.spyOn(material, "dispose");
    const fixture = new Group();
    fixture.add(new Mesh(geometry, material));
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader,
    });

    runtime.mount(createHost());
    runtime.dispose();
    fixtureLoader.succeed(fixture);

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(renderer.render).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "f1-technical-gltf-fixture" }),
      expect.anything(),
    );
  });

  it("protege contra mount duplicado e não reutiliza instância descartada", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const host = createHost();
    const first = new ThreeWorldRuntime({
      createRenderer: () => new TestRenderer(),
      fixtureLoader: new TestFixtureLoader(),
    });

    first.mount(host);
    expect(() => first.mount(host)).toThrow(/only be mounted once/u);
    first.dispose();
    expect(() => first.mount(host)).toThrow(/only be mounted once/u);

    const second = new ThreeWorldRuntime({
      createRenderer: () => new TestRenderer(),
      fixtureLoader: new TestFixtureLoader(),
    });
    second.mount(host);
    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    second.dispose();
  });

  it("mantém o host limpo quando o renderer falha ao inicializar", () => {
    const host = createHost();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => {
        throw new Error("renderer unavailable");
      },
      fixtureLoader: new TestFixtureLoader(),
    });

    expect(() => runtime.mount(host)).toThrow("renderer unavailable");
    expect(host.querySelector("canvas")).not.toBeInTheDocument();
    expect(() => runtime.dispose()).not.toThrow();
    expect(() => runtime.mount(host)).toThrow(/only be mounted once/u);
  });

  it("libera a montagem parcial quando anexar o canvas falha", () => {
    const renderer = new TestRenderer();
    const host = createHost();
    const removeCanvasListener = vi.spyOn(
      renderer.domElement,
      "removeEventListener",
    );
    vi.spyOn(host, "append").mockImplementation(() => {
      throw new Error("host unavailable");
    });
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      fixtureLoader: new TestFixtureLoader(),
    });

    expect(() => runtime.mount(host)).toThrow("host unavailable");
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(removeCanvasListener).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
    expect(host.querySelector("canvas")).not.toBeInTheDocument();
    expect(() => runtime.dispose()).not.toThrow();
    expect(() => runtime.mount(host)).toThrow(/only be mounted once/u);
  });
});
