import {
  Box3,
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  type Object3D,
} from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createBook,
  createMovie,
  createPhysicalActivity,
  createSeries,
  createStudy,
  createWork,
  type LibraryEntry,
} from "../../../domain";
import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import { projectLibraryWorldEntries } from "../libraryWorldEntries";
import { assignLibraryRecordSlots } from "../libraryRecordLayout";
import { disposeObjectTree } from "./referenceScene";
import { createLibraryRecordComposition } from "./libraryRecordComposition";
import { PERFORMANCE_SCENARIOS } from "./performanceScenarios";
import {
  ThreeWorldRuntime,
  type ThreeWorldRenderer,
} from "./ThreeWorldRuntime";

class TestRenderer implements ThreeWorldRenderer {
  readonly domElement = document.createElement("canvas");
  readonly dispose = vi.fn();
  readonly shadowMap = { enabled: false };
  readonly renderedZooms: number[] = [];
  readonly render = vi.fn<(scene: Scene, camera: OrthographicCamera) => void>(
    (_scene, camera) => {
      this.renderedZooms.push(camera.zoom);
    },
  );
  readonly setPixelRatio = vi.fn();
  readonly setSize = vi.fn();

  constructor() {
    this.domElement.getBoundingClientRect = () => ({
      width: 640,
      height: 360,
      left: 0,
      top: 0,
      right: 640,
      bottom: 360,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  }
}

function tap(canvas: HTMLCanvasElement, x: number, y: number): void {
  for (const type of ["pointerdown", "pointerup"]) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      button: { value: 0 },
      clientX: { value: x },
      clientY: { value: y },
      pointerId: { value: 1 },
      pointerType: { value: "mouse" },
    });
    canvas.dispatchEvent(event);
  }
}

class TestResizeObserver implements ResizeObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {}
}

function host() {
  const element = document.createElement("div");
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    width: 640,
    height: 360,
    x: 0,
    y: 0,
    top: 0,
    right: 640,
    bottom: 360,
    left: 0,
    toJSON: () => ({}),
  });
  document.body.append(element);
  return element;
}

function snapshot(): LibraryWorldSnapshot {
  const entries: LibraryEntry[] = [];
  for (let index = 0; index < 70; index++) {
    entries.push(
      createBook({
        id: "book-" + index,
        title: "Livro " + index,
        author: "Teste",
        currentPage: 0,
        createdAt: "2026-09-01T00:00:00.000Z",
      }),
    );
  }
  for (let index = 0; index < 4; index++) {
    const common = {
      id: "movie-" + index,
      title: "Filme " + index,
      createdAt: "2026-09-02T00:00:00.000Z",
    };
    entries.push(createMovie({ ...common, durationMinutes: 90, year: 2025 }));
  }
  for (let index = 0; index < 2; index++) {
    entries.push(
      createSeries({
        id: "series-" + index,
        title: "Série " + index,
        createdAt: "2026-09-03T00:00:00.000Z",
        episodesWatched: 1,
      }),
    );
  }
  for (let index = 0; index < 5; index++) {
    entries.push(
      createStudy({
        id: "study-" + index,
        title: "Estudo " + index,
        createdAt: "2026-09-04T00:00:00.000Z",
        progressCurrent: 1,
        progressUnit: "sessions",
      }),
    );
  }
  for (let index = 0; index < 3; index++) {
    entries.push(
      createPhysicalActivity({
        id: "activity-" + index,
        title: "Atividade " + index,
        createdAt: "2026-09-05T00:00:00.000Z",
        category: "cardio",
      }),
    );
    entries.push(
      createWork({
        id: "work-" + index,
        title: "Trabalho " + index,
        createdAt: "2026-09-06T00:00:00.000Z",
      }),
    );
  }
  return projectLibraryWorldEntries(entries);
}

function firstMesh(root: Object3D): Mesh {
  let found: Mesh | undefined;
  root.traverse((part) => {
    if (!found && part instanceof Mesh) found = part;
  });
  if (!found) throw new Error("Mesh ausente.");
  return found;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("BF-3D1/D2/D3: montagem, seleção e robustez", () => {
  it("anexa edifício e 13 wrappers, conserva 70 livros e não materializa overflow nem fixture F1", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const source = snapshot();
    const assigned = assignLibraryRecordSlots(source);
    expect(assigned.placements).toHaveLength(13);
    expect(assigned.overflow).toHaveLength(4);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: source,
      createRenderer: () => renderer,
    });
    runtime.mount(host());
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    expect(scene).toBeDefined();
    const building = scene?.getObjectByName("procedural-library-building");
    const records = scene?.getObjectByName("library-record-composition");
    const shelves = scene?.getObjectByName("procedural-content-composition");
    expect(
      building?.children.filter(({ name }) => name.endsWith("-floor")),
    ).toHaveLength(9);
    expect(records?.children).toHaveLength(13);
    expect(records?.children.map(({ position }) => position.toArray())).toEqual(
      assigned.placements.map(({ position }) => [...position]),
    );
    expect(shelves?.children).toHaveLength(3);
    let visibleBooks = 0;
    shelves?.traverse((part) => {
      if (part.name === "procedural-reading-area-book") visibleBooks += 1;
    });
    expect(visibleBooks).toBe(70);
    expect(scene?.getObjectByName("f1-b-reference-scene")).toBeUndefined();
    expect(
      runtime
        .getSelectableObjects()
        .filter(({ id }) => id.startsWith("library-")),
    ).toHaveLength(13);
    expect(
      runtime
        .getSelectableObjects()
        .filter(({ id }) => id.startsWith("reading-book:")),
    ).toHaveLength(70);
    expect(
      runtime
        .getSelectableObjects()
        .filter(({ id }) => id.startsWith("reading-shelf-")),
    ).toHaveLength(3);
    expect(renderer.domElement.dataset.referenceMeshes).toBe("0");
    expect(renderer.domElement.dataset.referenceObjects).toBe("0");
    expect(renderer.domElement.dataset.referenceProxyTypes).toBe("0");
    expect(renderer.renderedZooms[0]).toBe(0.7);
    const mesh = firstMesh(building as Object3D);
    const disposed = vi.spyOn(mesh.geometry, "dispose");
    const record = firstMesh(records as Object3D);
    const recordGeometryDisposed = vi.spyOn(record.geometry, "dispose");
    const recordMaterial = Array.isArray(record.material)
      ? record.material[0]
      : record.material;
    const recordMaterialDisposed = vi.spyOn(recordMaterial, "dispose");
    const expectedNames = {
      "movie-record": "procedural-movie-record",
      "series-record": "procedural-series-record",
      "study-record": "procedural-study-record",
      "physical-activity-record": "procedural-physical-activity-record",
      "work-record": "procedural-work-record",
    } as const;
    for (const [index, placement] of assigned.placements.entries()) {
      const wrapper = records?.children[index];
      expect(wrapper?.name).toBe(
        "library-record-instance:" + placement.instanceId,
      );
      expect(wrapper?.userData.libraryRecordInstanceId).toBe(
        placement.instanceId,
      );
      expect(wrapper?.children[0]?.name).toBe(
        expectedNames[placement.modelTypeId],
      );
    }
    const contractComposition = createLibraryRecordComposition(
      assigned.placements,
    );
    expect(
      contractComposition.instances.map(
        ({ entryId, instanceId, modelTypeId }) => ({
          entryId,
          instanceId,
          modelTypeId,
        }),
      ),
    ).toEqual(
      assigned.placements.map(({ entryId, instanceId, modelTypeId }) => ({
        entryId,
        instanceId,
        modelTypeId,
      })),
    );
    disposeObjectTree(contractComposition.root);
    runtime.dispose();
    runtime.dispose();
    expect(disposed).toHaveBeenCalledOnce();
    expect(recordGeometryDisposed).toHaveBeenCalledOnce();
    expect(recordMaterialDisposed).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.domElement.isConnected).toBe(false);
  });

  it("cataloga apenas placements anexados e alterna ID, highlight e picking entre categorias BF-1/BF-2/BF-3", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const source = snapshot();
    const assignment = assignLibraryRecordSlots(source);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: source,
      createRenderer: () => renderer,
    });
    const selections: (string | null)[] = [];
    const selectedEntries: (string | undefined)[] = [];
    runtime.onSelectionChange((selection) => {
      selections.push(selection?.id ?? null);
      selectedEntries.push(selection?.entryId);
    });
    runtime.mount(host());
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    const camera = renderer.render.mock.calls.at(-1)?.[1];
    const catalog = runtime.getSelectableObjects();
    expect(catalog).toHaveLength(86);
    expect(new Set(catalog.map(({ id }) => id)).size).toBe(catalog.length);
    for (const placement of assignment.placements) {
      const descriptor = catalog.find(({ id }) => id === placement.instanceId);
      expect(descriptor).toMatchObject({
        entryId: placement.entryId,
        id: placement.instanceId,
      });
      expect(descriptor?.label).toContain(placement.entryId);
      runtime.selectObject(placement.instanceId);
      expect(selections.at(-1)).toBe(placement.instanceId);
      expect(selectedEntries.at(-1)).toBe(placement.entryId);
      expect(renderer.domElement.dataset.highlightedObject).toBe(
        placement.instanceId,
      );
      expect(
        scene?.getObjectsByProperty("name", "f1-c-selection-highlight"),
      ).toHaveLength(1);
    }
    for (const overflow of assignment.overflow) {
      expect(catalog.some(({ id }) => id === overflow.instanceId)).toBe(false);
      runtime.selectObject(overflow.instanceId);
      expect(selections.at(-1)).toBeNull();
      expect(renderer.domElement.dataset.highlightedObject).toBe("");
    }
    for (const id of [
      "reading-book:book-0",
      "reading-shelf-01",
      assignment.placements[0].instanceId,
    ]) {
      runtime.selectObject(id);
      expect(selections.at(-1)).toBe(id);
      expect(renderer.domElement.dataset.highlightedObject).toBe(id);
      expect(
        scene?.getObjectsByProperty("name", "f1-c-selection-highlight"),
      ).toHaveLength(1);
    }
    runtime.selectObject("missing-id");
    expect(selections.at(-1)).toBeNull();
    expect(scene?.getObjectByName("f1-c-selection-highlight")).toBeUndefined();
    expect(renderer.domElement.dataset.highlightedObject).toBe("");

    if (!scene || !camera) throw new Error("Cena ausente.");
    camera.updateMatrixWorld();
    for (const modelTypeId of [
      "movie-record",
      "series-record",
      "study-record",
      "physical-activity-record",
      "work-record",
    ] as const) {
      const placement = assignment.placements.find(
        (item) => item.modelTypeId === modelTypeId,
      );
      if (!placement) throw new Error("Placement ausente.");
      if (modelTypeId === "series-record") {
        const overlappingCenter = new Vector3(
          placement.position[0],
          0.6,
          placement.position[2],
        ).project(camera);
        tap(
          renderer.domElement,
          (overlappingCenter.x + 1) * 320,
          (1 - overlappingCenter.y) * 180,
        );
        expect(selections.at(-1)).toBe("reading-shelf-01");
      }
      for (const y of [0.6, 1, 0.25]) {
        for (const x of [0, -0.4, 0.4]) {
          const projected = new Vector3(
            placement.position[0] + x,
            y,
            placement.position[2],
          ).project(camera);
          tap(
            renderer.domElement,
            (projected.x + 1) * 320,
            (1 - projected.y) * 180,
          );
          if (selections.at(-1) === placement.instanceId) break;
        }
        if (selections.at(-1) === placement.instanceId) break;
      }
      expect(selections.at(-1)).toBe(placement.instanceId);
      expect(selectedEntries.at(-1)).toBe(placement.entryId);
      expect(renderer.domElement.dataset.highlightedObject).toBe(
        placement.instanceId,
      );
    }
    runtime.dispose();
    expect(runtime.getSelectableObjects()).toHaveLength(0);
    expect(scene.getObjectByName("f1-c-selection-highlight")).toBeUndefined();
    expect(renderer.domElement.dataset.highlightedObject).toBe("");
  });

  it("preserva picking por canvas dos livros e das três estantes no mundo composto", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const source = snapshot();
    const assignment = assignLibraryRecordSlots(source);
    expect(source.categories[0].entries).toHaveLength(70);
    expect(assignment.placements).toHaveLength(13);
    expect(assignment.overflow).toHaveLength(4);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: source,
      createRenderer: () => renderer,
    });
    runtime.mount(host());
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    const camera = renderer.render.mock.calls.at(-1)?.[1];
    const shelves = scene?.getObjectByName("procedural-content-composition");
    const records = scene?.getObjectByName("library-record-composition");
    if (!scene || !camera || !shelves || !records)
      throw new Error("Cena composta ausente.");
    expect(shelves.children).toHaveLength(3);
    expect(records.children).toHaveLength(13);
    const priorityRoots = [...shelves.children, ...records.children];
    const selectableRoots: Object3D[] = [...priorityRoots];
    const rootIds = new Map<Object3D, string>();
    for (const [index, shelf] of shelves.children.entries()) {
      rootIds.set(shelf, `reading-shelf-0${index + 1}`);
      shelf.traverse((part) => {
        if (part.name !== "procedural-reading-area-book") return;
        const id: unknown = part.userData.readingAreaBookInstanceId;
        if (typeof id !== "string") throw new Error("Livro sem instanceId.");
        rootIds.set(part, id);
        selectableRoots.push(part);
      });
    }
    for (const [index, record] of records.children.entries()) {
      rootIds.set(record, assignment.placements[index].instanceId);
    }
    expect(selectableRoots).toHaveLength(86);
    const idOf = (object: Object3D): string | undefined => {
      let part: Object3D | null = object;
      while (part) {
        const id = rootIds.get(part);
        if (id) return id;
        part = part.parent;
      }
      return undefined;
    };
    const raycaster = new Raycaster();
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    const inspect = (x: number, y: number) => {
      raycaster.setFromCamera(new Vector2(x / 320 - 1, 1 - y / 180), camera);
      const first = (roots: readonly Object3D[]) =>
        raycaster.intersectObjects([...roots], true).map((hit) => ({
          distance: hit.distance,
          id: idOf(hit.object),
          name: hit.object.name,
        }));
      return {
        scene: first(scene.children),
        priority: first(priorityRoots),
        all: first(selectableRoots),
      };
    };
    const visiblePoint = (target: Object3D, expectedId: string) => {
      const bounds = new Box3().setFromObject(target);
      const corners = [bounds.min.x, bounds.max.x].flatMap((x) =>
        [bounds.min.y, bounds.max.y].flatMap((y) =>
          [bounds.min.z, bounds.max.z].map((z) =>
            new Vector3(x, y, z).project(camera),
          ),
        ),
      );
      const minX = Math.min(...corners.map(({ x }) => x));
      const maxX = Math.max(...corners.map(({ x }) => x));
      const minY = Math.min(...corners.map(({ y }) => y));
      const maxY = Math.max(...corners.map(({ y }) => y));
      for (const xFactor of [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9]) {
        for (const yFactor of [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9]) {
          const x = ((minX + (maxX - minX) * xFactor + 1) * 640) / 2;
          const y = ((1 - (minY + (maxY - minY) * yFactor)) * 360) / 2;
          if (x < 0 || x > 640 || y < 0 || y > 360) continue;
          const hits = inspect(x, y);
          if (
            hits.scene[0]?.id !== expectedId ||
            hits.all[0]?.id !== expectedId
          )
            continue;
          expect(hits.priority[0]?.id, `${expectedId} em ${x}, ${y}`).toBe(
            expectedId,
          );
          return { x, y, hits };
        }
      }
      return undefined;
    };
    const selected: { id: string; entryId?: string }[] = [];
    runtime.onSelectionChange((selection) => {
      if (selection) selected.push(selection);
    });
    for (const [index, shelf] of shelves.children.entries()) {
      const shelfId = `reading-shelf-0${index + 1}`;
      const bookNodes = selectableRoots.filter(
        (node) =>
          node.name === "procedural-reading-area-book" && node.parent === shelf,
      );
      expect(bookNodes.length).toBeGreaterThan(0);
      const bookPoint = bookNodes
        .map((node) => {
          const id = rootIds.get(node);
          return id ? visiblePoint(node, id) : undefined;
        })
        .find((point) => point !== undefined);
      expect(bookPoint, `Livro visível na estante ${shelfId}`).toBeDefined();
      if (!bookPoint) throw new Error("Livro não atingível.");
      const bookId = bookPoint.hits.all[0].id;
      if (!bookId) throw new Error("Livro sem hit.");
      tap(renderer.domElement, bookPoint.x, bookPoint.y);
      expect(selected.at(-1)).toMatchObject({
        id: bookId,
        entryId: bookId.slice("reading-book:".length),
      });
      expect(renderer.domElement.dataset.highlightedObject).toBe(bookId);
      const shelfPoint = visiblePoint(shelf, shelfId);
      expect(shelfPoint, `Estante ${shelfId} visível`).toBeDefined();
      if (!shelfPoint) throw new Error("Estante não atingível.");
      tap(renderer.domElement, shelfPoint.x, shelfPoint.y);
      expect(selected.at(-1)).toMatchObject({ id: shelfId });
      expect(selected.at(-1)?.entryId).toBeUndefined();
      expect(renderer.domElement.dataset.highlightedObject).toBe(shelfId);
      expect(
        scene.getObjectsByProperty("name", "f1-c-selection-highlight"),
      ).toHaveLength(1);
    }
    runtime.dispose();
  });

  it("preserva caminho legado BF-2 e rejeita fontes duplicadas", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const source = snapshot();
    expect(
      () =>
        new ThreeWorldRuntime({
          libraryWorldSnapshot: source,
          readingAreaBooks: [],
          createRenderer: () => new TestRenderer(),
        }),
    ).toThrow("somente um snapshot");
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({ createRenderer: () => renderer });
    runtime.mount(host());
    expect(renderer.renderedZooms[0]).toBe(1);
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    expect(scene?.getObjectByName("f1-b-reference-scene")).toBeDefined();
    expect(renderer.domElement.dataset.referenceProxyTypes).toBe("4");
    expect(
      scene?.getObjectByName("procedural-library-building"),
    ).toBeUndefined();
    expect(
      scene?.getObjectByName("library-record-composition"),
    ).toBeUndefined();
    runtime.dispose();
  });

  it("mantém F5 independente inclusive de snapshot inválido", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      createRenderer: () => renderer,
      performanceScenario: PERFORMANCE_SCENARIOS[0],
      libraryWorldSnapshot: null as unknown as LibraryWorldSnapshot,
      readingAreaBooks: [{ modelTypeId: "invalid" }] as never,
    });
    runtime.mount(host());
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    expect(scene?.getObjectByName("f1-b-reference-scene")).toBeDefined();
    expect(renderer.domElement.dataset.referenceProxyTypes).toBe("4");
    expect(
      scene?.getObjectByName("procedural-library-building"),
    ).toBeUndefined();
    expect(
      scene?.getObjectByName("library-record-composition"),
    ).toBeUndefined();
    expect(
      runtime
        .getSelectableObjects()
        .some(({ id }) => id.startsWith("reading-book:")),
    ).toBe(false);
    expect(
      runtime
        .getSelectableObjects()
        .some(({ id }) => id.startsWith("library-")),
    ).toBe(false);
    runtime.dispose();
  });

  it("falha na criação parcial e libera roots sem afetar uma composição independente", () => {
    const source = snapshot();
    const placements = assignLibraryRecordSlots(source).placements;
    const independent = createLibraryRecordComposition(placements.slice(0, 1));
    const disposeIndependent = vi.spyOn(
      firstMesh(independent.root).geometry,
      "dispose",
    );
    // Observe the actual resource types used by a movie representation.
    // A second invalid model throws after the first valid movie was built.
    const geometryDisposals = vi.spyOn(BoxGeometry.prototype, "dispose");
    const materialDisposals = vi.spyOn(
      MeshStandardMaterial.prototype,
      "dispose",
    );
    const invalid = {
      ...placements[1],
      modelTypeId: "invalid-record",
    } as unknown as (typeof placements)[number];
    expect(() =>
      createLibraryRecordComposition([placements[0], invalid]),
    ).toThrow("Modelo BF-3 desconhecido");
    expect(geometryDisposals).toHaveBeenCalledTimes(3);
    expect(materialDisposals).toHaveBeenCalledTimes(2);
    expect(disposeIndependent).not.toHaveBeenCalled();
    const mesh = firstMesh(independent.root);
    expect(mesh.geometry).toBeDefined();
    // The independent caller retains ownership and may release it normally.
    disposeObjectTree(independent.root);
    expect(disposeIndependent).toHaveBeenCalledOnce();
  });
  it("duas montagens compostas não compartilham geometria ou descarte", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const source = snapshot();
    const firstRenderer = new TestRenderer();
    const secondRenderer = new TestRenderer();
    const first = new ThreeWorldRuntime({
      libraryWorldSnapshot: source,
      createRenderer: () => firstRenderer,
    });
    const second = new ThreeWorldRuntime({
      libraryWorldSnapshot: source,
      createRenderer: () => secondRenderer,
    });
    first.mount(host());
    second.mount(host());
    first.selectObject("library-movie:movie-0");
    second.selectObject("library-series:series-0");
    expect(firstRenderer.domElement.dataset.highlightedObject).toBe(
      "library-movie:movie-0",
    );
    expect(secondRenderer.domElement.dataset.highlightedObject).toBe(
      "library-series:series-0",
    );
    const firstRoot = firstRenderer.render.mock.calls
      .at(-1)?.[0]
      .getObjectByName("library-record-composition");
    const secondRoot = secondRenderer.render.mock.calls
      .at(-1)?.[0]
      .getObjectByName("library-record-composition");
    const firstMeshInstance = firstMesh(firstRoot as Object3D);
    const secondMeshInstance = firstMesh(secondRoot as Object3D);
    expect(firstMeshInstance.geometry).not.toBe(secondMeshInstance.geometry);
    const firstMaterial = Array.isArray(firstMeshInstance.material)
      ? firstMeshInstance.material[0]
      : firstMeshInstance.material;
    const secondMaterial = Array.isArray(secondMeshInstance.material)
      ? secondMeshInstance.material[0]
      : secondMeshInstance.material;
    expect(firstMaterial).not.toBe(secondMaterial);
    const firstGeometryDisposed = vi.spyOn(
      firstMeshInstance.geometry,
      "dispose",
    );
    const secondGeometryDisposed = vi.spyOn(
      secondMeshInstance.geometry,
      "dispose",
    );
    const secondMaterialDisposed = vi.spyOn(secondMaterial, "dispose");
    first.dispose();
    first.dispose();
    expect(firstGeometryDisposed).toHaveBeenCalledOnce();
    expect(secondGeometryDisposed).not.toHaveBeenCalled();
    expect(secondMaterialDisposed).not.toHaveBeenCalled();
    expect(secondRoot?.children).toHaveLength(13);
    expect(secondRenderer.domElement.dataset.highlightedObject).toBe(
      "library-series:series-0",
    );
    second.dispose();
    second.dispose();
    expect(secondGeometryDisposed).toHaveBeenCalledOnce();
    expect(secondMaterialDisposed).toHaveBeenCalledOnce();
    expect(firstRenderer.dispose).toHaveBeenCalledOnce();
    expect(secondRenderer.dispose).toHaveBeenCalledOnce();
  });

  it("reverte edifício e registros quando a preparação falha antes do attach", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const sceneAdds = vi.spyOn(Scene.prototype, "add");
    const geometryDisposals = vi.spyOn(BoxGeometry.prototype, "dispose");
    const materialDisposals = vi.spyOn(
      MeshStandardMaterial.prototype,
      "dispose",
    );
    renderer.setPixelRatio.mockImplementation(() => {
      throw new Error("pixel ratio unavailable");
    });
    const container = host();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: snapshot(),
      createRenderer: () => renderer,
    });
    const failure = vi.fn();
    runtime.onFailure(failure);

    expect(() => runtime.mount(container)).toThrow("pixel ratio unavailable");
    expect(geometryDisposals.mock.calls.length).toBeGreaterThan(13);
    expect(materialDisposals.mock.calls.length).toBeGreaterThan(13);
    const records = sceneAdds.mock.calls
      .flat()
      .find(({ name }) => name === "library-record-composition");
    const building = sceneAdds.mock.calls
      .flat()
      .find(({ name }) => name === "procedural-library-building");
    expect(records?.children).toHaveLength(0);
    expect(records?.parent).toBeNull();
    expect(building?.parent).toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(runtime.getDiagnostics().runtimeState).toBe("disposed");
    expect(runtime.getSelectableObjects()).toHaveLength(0);
    expect(failure).not.toHaveBeenCalled();
    runtime.selectObject("library-movie:movie-0");
    expect(renderer.domElement.dataset.highlightedObject).toBeUndefined();
    expect(() => runtime.mount(container)).toThrow(/only be mounted once/u);
  });

  it("remove listeners parciais quando a interação falha durante attach", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const add = renderer.domElement.addEventListener.bind(renderer.domElement);
    const remove = vi.spyOn(renderer.domElement, "removeEventListener");
    vi.spyOn(renderer.domElement, "addEventListener").mockImplementation(
      (type, listener, options) => {
        if (type === "pointermove") throw new Error("listener unavailable");
        add(type, listener, options);
      },
    );
    const geometryDisposals = vi.spyOn(BoxGeometry.prototype, "dispose");
    const container = host();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: snapshot(),
      createRenderer: () => renderer,
    });

    expect(() => runtime.mount(container)).toThrow("listener unavailable");
    expect(remove).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(geometryDisposals.mock.calls.length).toBeGreaterThan(13);
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(container.querySelector("canvas")).toBeNull();
    expect(runtime.getDiagnostics().runtimeState).toBe("disposed");
    expect(runtime.getSelectableObjects()).toHaveLength(0);
    expect(renderer.domElement.dataset.selectedObject).toBeUndefined();
    expect(renderer.domElement.dataset.highlightedObject).toBeUndefined();
  });

  it("encerra seleção composta após falha WebGL sem callbacks tardios efetivos", () => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    const renderer = new TestRenderer();
    const runtime = new ThreeWorldRuntime({
      libraryWorldSnapshot: snapshot(),
      createRenderer: () => renderer,
    });
    const container = host();
    runtime.mount(container);
    runtime.selectObject("library-movie:movie-0");
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    const record = scene?.getObjectByName("library-record-composition");
    if (!scene || !record) throw new Error("Cena composta ausente.");
    const disposed = vi.spyOn(firstMesh(record).geometry, "dispose");
    const highlight = scene.getObjectByName("f1-c-selection-highlight");
    expect(highlight).toBeDefined();
    const failure = vi.fn();
    const selection = vi.fn();
    runtime.onFailure(failure);
    runtime.onSelectionChange(selection);
    const selectionCalls = selection.mock.calls.length;

    renderer.domElement.dispatchEvent(
      new Event("webglcontextlost", { cancelable: true }),
    );
    expect(failure).toHaveBeenCalledOnce();
    expect(failure).toHaveBeenCalledWith(
      expect.objectContaining({ code: "unavailable" }),
    );
    expect(runtime.getDiagnostics().runtimeState).toBe("failed");
    expect(runtime.getSelectableObjects()).toHaveLength(0);
    expect(container.querySelector("canvas")).toBeNull();
    expect(scene.getObjectByName("f1-c-selection-highlight")).toBeUndefined();
    expect(disposed).toHaveBeenCalledOnce();
    runtime.selectObject("library-movie:movie-0");
    runtime.resize();
    runtime.resume();
    renderer.domElement.dispatchEvent(new Event("webglcontextrestored"));
    tap(renderer.domElement, 320, 180);
    expect(selection).toHaveBeenCalledTimes(selectionCalls);
    expect(failure).toHaveBeenCalledOnce();
    runtime.dispose();
    expect(disposed).toHaveBeenCalledOnce();
  });
});
