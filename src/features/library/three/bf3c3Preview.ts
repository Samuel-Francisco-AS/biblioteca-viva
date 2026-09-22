import { Color, Group, OrthographicCamera, Scene, WebGLRenderer } from "three";

import type { LibraryWorldSnapshot } from "../libraryWorldEntryContract";
import {
  CAMERA_REFERENCE_HALF_HEIGHT,
  CAMERA_REFERENCE_HALF_WIDTH,
} from "./cameraMath";
import { CameraNavigation } from "./CameraNavigation";
import {
  createProceduralMovieRecord,
  createProceduralPhysicalActivityRecord,
  createProceduralSeriesRecord,
  createProceduralStudyRecord,
  createProceduralWorkRecord,
} from "./libraryRecordRepresentations";
import { assignLibraryWorldRecordsToSlots } from "./libraryRecordLayout";
import {
  createProceduralComposition,
  READING_SHELF_COMPOSITION_DEFINITIONS,
} from "./proceduralComposition";
import { reconcileReadingAreaBookVisuals } from "./readingAreaBookVisuals";
import { createReferenceScene, disposeObjectTree } from "./referenceScene";
import { ThreeWorldInteraction } from "./ThreeWorldInteraction";
const CATEGORY_LABELS = Object.freeze({
  movie: "Filme",
  series: "Série",
  study: "Estudo",
  physical_activity: "Atividade física",
  work: "Trabalho",
});

export type Bf3c3PreviewCategoryType = keyof typeof CATEGORY_LABELS;

export type Bf3c3PreviewScenarioId =
  "low-density" | "full-capacity" | "overflow";

export interface Bf3c3PreviewScenarioView {
  readonly description: string;
  readonly id: Bf3c3PreviewScenarioId;
  readonly overflowByCategory: Readonly<
    Record<Bf3c3PreviewCategoryType, number>
  >;
  readonly placementsByCategory: Readonly<
    Record<Bf3c3PreviewCategoryType, number>
  >;
  readonly snapshot: LibraryWorldSnapshot;
}

export interface Bf3c3PreviewMount {
  dispose(): void;
}

function createRepresentation(
  placement: ReturnType<
    typeof assignLibraryWorldRecordsToSlots
  >["placements"][number],
) {
  switch (placement.modelTypeId) {
    case "movie-record":
      return createProceduralMovieRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "movie-record",
      });
    case "series-record":
      return createProceduralSeriesRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "series-record",
      });
    case "study-record":
      return createProceduralStudyRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "study-record",
      });
    case "physical-activity-record":
      return createProceduralPhysicalActivityRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "physical-activity-record",
      });
    case "work-record":
      return createProceduralWorkRecord({
        entryId: placement.entryId,
        instanceId: placement.instanceId,
        modelTypeId: "work-record",
      });
  }
}

class Bf3c3Preview {
  private readonly camera = new OrthographicCamera(
    -CAMERA_REFERENCE_HALF_WIDTH,
    CAMERA_REFERENCE_HALF_WIDTH,
    CAMERA_REFERENCE_HALF_HEIGHT,
    -CAMERA_REFERENCE_HALF_HEIGHT,
    0.1,
    100,
  );
  private readonly composition = createProceduralComposition(
    READING_SHELF_COMPOSITION_DEFINITIONS,
  );
  private disposed = false;
  private readonly interaction: ThreeWorldInteraction;
  private readonly navigation = new CameraNavigation(this.camera);
  private recordRoot: Group | undefined;
  private readonly referenceScene = createReferenceScene();
  private readonly renderer = new WebGLRenderer({ antialias: true });
  private readonly resizeObserver: ResizeObserver;
  private readonly scene = new Scene();

  constructor(
    private readonly host: HTMLElement,
    initialSnapshot: LibraryWorldSnapshot,
  ) {
    this.scene.background = new Color(0x18342d);
    this.scene.add(this.referenceScene.root, this.composition.root);
    reconcileReadingAreaBookVisuals(
      this.composition,
      initialSnapshot.categories[0].entries,
      new Map(),
    );

    this.renderer.domElement.className = "bf3c3-preview-canvas";
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.host.append(this.renderer.domElement);
    this.interaction = new ThreeWorldInteraction({
      camera: this.camera,
      canvas: this.renderer.domElement,
      catalog: [],
      navigation: this.navigation,
      onSelectionChange: () => undefined,
      render: this.render,
      scene: this.scene,
      selectables: [],
    });
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  setScenario(snapshot: LibraryWorldSnapshot): void {
    const assignment = assignLibraryWorldRecordsToSlots(snapshot);
    const replacement = new Group();
    replacement.name = "bf3c3-preview-record-root";
    try {
      for (const placement of assignment.placements) {
        const representation = createRepresentation(placement);
        const wrapper = new Group();
        wrapper.name = `bf3c3-preview-record:${placement.instanceId}`;
        wrapper.position.set(...placement.position);
        wrapper.add(representation.root);
        replacement.add(wrapper);
      }
    } catch (error) {
      disposeObjectTree(replacement);
      throw error;
    }
    this.scene.add(replacement);
    const previous = this.recordRoot;
    this.recordRoot = replacement;
    if (previous) disposeObjectTree(previous);
    this.render();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.interaction.dispose();
    if (this.recordRoot) disposeObjectTree(this.recordRoot);
    disposeObjectTree(this.composition.root);
    disposeObjectTree(this.referenceScene.root);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly render = (): void => {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  };

  private readonly resize = (): void => {
    if (this.disposed) return;
    const { height, width } = this.host.getBoundingClientRect();
    const viewportWidth = Math.round(width);
    const viewportHeight = Math.round(height);
    if (viewportWidth <= 0 || viewportHeight <= 0) return;
    if (!this.navigation.setViewport(viewportWidth, viewportHeight)) return;
    this.renderer.setSize(viewportWidth, viewportHeight, false);
    this.interaction.setViewport(viewportWidth, viewportHeight);
    this.render();
  };
}

function requiredElement<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento BF-3C3 ausente: ${id}.`);
  return element as TElement;
}

export function mountBf3c3Preview(
  scenarios: readonly Bf3c3PreviewScenarioView[],
): Bf3c3PreviewMount {
  const initialScenario = scenarios[0];
  if (!initialScenario) {
    throw new Error("A prévia BF-3C3 exige ao menos um cenário.");
  }

  const scenariosById = new Map<
    Bf3c3PreviewScenarioId,
    Bf3c3PreviewScenarioView
  >();
  for (const scenario of scenarios) {
    if (scenariosById.has(scenario.id)) {
      throw new Error(`Cenário BF-3C3 duplicado: ${scenario.id}.`);
    }
    scenariosById.set(scenario.id, scenario);
  }

  const host = requiredElement<HTMLDivElement>("bf3c3-preview-canvas-host");
  const description = requiredElement<HTMLParagraphElement>(
    "bf3c3-preview-description",
  );
  const counts = requiredElement<HTMLDivElement>("bf3c3-preview-counts");
  const summary = requiredElement<HTMLParagraphElement>(
    "bf3c3-preview-summary",
  );
  const preview = new Bf3c3Preview(host, initialScenario.snapshot);
  const buttonListeners = new Map<HTMLButtonElement, () => void>();
  let disposed = false;

  function updatePanel(scenario: Bf3c3PreviewScenarioView): void {
    description.textContent = scenario.description;
    counts.replaceChildren(
      ...Object.entries(CATEGORY_LABELS).map(([type, label]) => {
        const category = type as Bf3c3PreviewCategoryType;
        const row = document.createElement("div");
        row.className = "count-row";
        const placed = scenario.placementsByCategory[category];
        const overflow = scenario.overflowByCategory[category];
        row.innerHTML = `<span>${label}</span><strong>${placed} / ${overflow}</strong>`;
        return row;
      }),
    );
    const totalPlaced = Object.values(scenario.placementsByCategory).reduce(
      (total, value) => total + value,
      0,
    );
    const totalOverflow = Object.values(scenario.overflowByCategory).reduce(
      (total, value) => total + value,
      0,
    );
    summary.textContent = `${totalPlaced} placement(s) em slots reais; ${totalOverflow} ocorrência(s) somente no overflow.`;
  }

  function activateScenario(id: Bf3c3PreviewScenarioId): void {
    const scenario = scenariosById.get(id);
    if (!scenario) throw new Error(`Cenário BF-3C3 desconhecido: ${id}.`);
    preview.setScenario(scenario.snapshot);
    updatePanel(scenario);
    for (const button of buttonListeners.keys()) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.bf3c3Scenario === scenario.id),
      );
    }
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    for (const [button, listener] of buttonListeners) {
      button.removeEventListener("click", listener);
    }
    buttonListeners.clear();
    window.removeEventListener("beforeunload", handleBeforeUnload);
    preview.dispose();
  }

  function handleBeforeUnload(): void {
    dispose();
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-bf3c3-scenario]",
  )) {
    const listener = () => {
      const id = button.dataset.bf3c3Scenario as Bf3c3PreviewScenarioId;
      activateScenario(id);
    };
    buttonListeners.set(button, listener);
    button.addEventListener("click", listener);
  }

  window.addEventListener("beforeunload", handleBeforeUnload, { once: true });
  activateScenario(initialScenario.id);
  return Object.freeze({ dispose });
}
