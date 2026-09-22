import { Color, Group, OrthographicCamera, Scene, WebGLRenderer } from "three";

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
import {
  createBf3c3PreviewScenarioResult,
  getBf3c3PreviewScenario,
  type Bf3c3PreviewScenario,
  type Bf3c3PreviewScenarioId,
} from "./bf3c3PreviewScenarios";

const CATEGORY_LABELS = Object.freeze({
  movie: "Filme",
  series: "Série",
  study: "Estudo",
  physical_activity: "Atividade física",
  work: "Trabalho",
});

type CategoryType = keyof typeof CATEGORY_LABELS;

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

  constructor(private readonly host: HTMLElement) {
    this.scene.background = new Color(0x18342d);
    this.scene.add(this.referenceScene.root, this.composition.root);
    const initial = createBf3c3PreviewScenarioResult(
      getBf3c3PreviewScenario("low-density"),
    );
    reconcileReadingAreaBookVisuals(
      this.composition,
      initial.snapshot.categories[0].entries,
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

  setScenario(scenario: Bf3c3PreviewScenario): void {
    const result = createBf3c3PreviewScenarioResult(scenario);
    const assignment = assignLibraryWorldRecordsToSlots(result.snapshot);
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

const host = requiredElement<HTMLDivElement>("bf3c3-preview-canvas-host");
const description = requiredElement<HTMLParagraphElement>(
  "bf3c3-preview-description",
);
const counts = requiredElement<HTMLDivElement>("bf3c3-preview-counts");
const summary = requiredElement<HTMLParagraphElement>("bf3c3-preview-summary");
const preview = new Bf3c3Preview(host);

function updatePanel(scenario: Bf3c3PreviewScenario): void {
  const result = createBf3c3PreviewScenarioResult(scenario);
  description.textContent = scenario.description;
  counts.replaceChildren(
    ...Object.entries(CATEGORY_LABELS).map(([type, label]) => {
      const category = type as CategoryType;
      const row = document.createElement("div");
      row.className = "count-row";
      const placed = result.placementsByCategory[category];
      const overflow = result.overflowByCategory[category];
      row.innerHTML = `<span>${label}</span><strong>${placed} / ${overflow}</strong>`;
      return row;
    }),
  );
  const totalPlaced = Object.values(result.placementsByCategory).reduce(
    (total, value) => total + value,
    0,
  );
  const totalOverflow = Object.values(result.overflowByCategory).reduce(
    (total, value) => total + value,
    0,
  );
  summary.textContent = `${totalPlaced} placement(s) em slots reais; ${totalOverflow} ocorrência(s) somente no overflow.`;
}

function activateScenario(id: Bf3c3PreviewScenarioId): void {
  const scenario = getBf3c3PreviewScenario(id);
  preview.setScenario(scenario);
  updatePanel(scenario);
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-bf3c3-scenario]",
  )) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.bf3c3Scenario === scenario.id),
    );
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-bf3c3-scenario]",
)) {
  button.addEventListener("click", () => {
    const id = button.dataset.bf3c3Scenario as Bf3c3PreviewScenarioId;
    activateScenario(id);
  });
}

window.addEventListener("beforeunload", () => preview.dispose(), {
  once: true,
});
activateScenario("low-density");
