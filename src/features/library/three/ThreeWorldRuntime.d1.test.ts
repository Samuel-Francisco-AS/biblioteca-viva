import { Mesh, OrthographicCamera, Scene, type Object3D } from "three";
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
  readonly render = vi.fn<(scene: Scene, camera: OrthographicCamera) => void>();
  readonly setPixelRatio = vi.fn();
  readonly setSize = vi.fn();
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

describe("BF-3D1: snapshot composto e ownership", () => {
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
    ).toHaveLength(0);
    expect(
      runtime
        .getSelectableObjects()
        .filter(({ id }) => id.startsWith("reading-book:")),
    ).toHaveLength(70);
    expect(renderer.domElement.dataset.referenceMeshes).toBe("0");
    const mesh = firstMesh(building as Object3D);
    const disposed = vi.spyOn(mesh.geometry, "dispose");
    runtime.dispose();
    runtime.dispose();
    expect(disposed).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
    expect(renderer.domElement.isConnected).toBe(false);
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
    const scene = renderer.render.mock.calls.at(-1)?.[0];
    expect(scene?.getObjectByName("f1-b-reference-scene")).toBeDefined();
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
    const invalid = {
      ...placements[1],
      modelTypeId: "invalid-record",
    } as unknown as (typeof placements)[number];
    expect(() =>
      createLibraryRecordComposition([placements[0], invalid]),
    ).toThrow();
    expect(disposeIndependent).not.toHaveBeenCalled();
    const mesh = firstMesh(independent.root);
    expect(mesh.geometry).toBeDefined();
    // The independent caller retains ownership and may release it normally.
    disposeObjectTree(independent.root);
    expect(disposeIndependent).toHaveBeenCalledOnce();
  });
});
