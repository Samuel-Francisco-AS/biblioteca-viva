import { useEffect, useRef, useState } from "react";

import type {
  WorldRuntime,
  WorldRuntimeDiagnostics,
  WorldRuntimeFactory,
  WorldRuntimeFailure,
  WorldSelectableObject,
  WorldSelection,
} from "./worldRuntime";
import type { ReadingAreaBook } from "./readingAreaBookContract";
import type { LibraryWorldSnapshot } from "./libraryWorldEntryContract";
import type { PerformanceScenario } from "./three/performanceScenarios";

export type WorldHostStatus = "initializing" | "ready" | "failed";

const EMPTY_DIAGNOSTICS: WorldRuntimeDiagnostics = {
  activeFrameLoops: 0,
  drawCalls: 0,
  fixtureLoadMs: null,
  fixtureStatus: "idle",
  fps: null,
  frameTimeMs: null,
  geometries: 0,
  materialTextureReferences: 0,
  meshes: 0,
  performanceScenarioAssetsLoaded: 0,
  performanceScenarioAssetsTotal: 0,
  performanceScenarioId: "f1-baseline",
  performanceScenarioLabel: "Baseline F1",
  renderedFrames: 0,
  runtimeState: "created",
  sceneObjects: 0,
  selectableObjects: 0,
  textures: 0,
  timeToFirstUsableFrameMs: null,
  triangles: 0,
  uniqueMaterialTextures: 0,
};

function metric(value: number | null, suffix = ""): string {
  return value === null ? "Aguardando" : `${value.toFixed(1)}${suffix}`;
}

const createRuntime = async (
  readingAreaBooks: readonly ReadingAreaBook[] | undefined,
  libraryWorldSnapshot: LibraryWorldSnapshot | undefined,
): Promise<WorldRuntime> => {
  if (libraryWorldSnapshot && readingAreaBooks) {
    throw new Error("Use somente um snapshot BF por montagem.");
  }
  const { createThreeWorldRuntime } = await import("./three/ThreeWorldRuntime");
  return createThreeWorldRuntime(
    libraryWorldSnapshot ? { libraryWorldSnapshot } : { readingAreaBooks },
  );
};

export interface WorldHostProps {
  readonly libraryWorldSnapshot?: LibraryWorldSnapshot;
  readonly onSelectableObjectsChange?: (
    objects: readonly WorldSelectableObject[],
  ) => void;
  readonly onSelectionChange?: (selection: WorldSelection) => void;
  readonly onStatusChange?: (status: WorldHostStatus) => void;
  readonly performanceScenario?: PerformanceScenario;
  readonly readingAreaBooks?: readonly ReadingAreaBook[];
  readonly runtimeFactory?: WorldRuntimeFactory;
  readonly selectedObjectId?: string | null;
}

type SelectionDirection = -1 | 1;

function adjacentSelectionId(
  selectableObjects: readonly WorldSelectableObject[],
  selection: WorldSelection,
  direction: SelectionDirection,
): string | null {
  if (selectableObjects.length === 0) return null;

  const currentIndex = selection
    ? selectableObjects.findIndex(({ id }) => id === selection.id)
    : -1;
  if (currentIndex === -1) {
    return direction === 1
      ? (selectableObjects[0]?.id ?? null)
      : (selectableObjects.at(-1)?.id ?? null);
  }

  const nextIndex =
    (currentIndex + direction + selectableObjects.length) %
    selectableObjects.length;
  return selectableObjects[nextIndex]?.id ?? null;
}

export function WorldHost({
  libraryWorldSnapshot,
  onSelectableObjectsChange,
  onSelectionChange,
  onStatusChange,
  performanceScenario,
  readingAreaBooks,
  runtimeFactory,
  selectedObjectId,
}: WorldHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<WorldRuntime | null>(null);
  const [selectableObjects, setSelectableObjects] = useState<
    readonly WorldSelectableObject[]
  >([]);
  const [selection, setSelection] = useState<WorldSelection>(null);
  const [diagnostics, setDiagnostics] =
    useState<WorldRuntimeDiagnostics>(EMPTY_DIAGNOSTICS);
  const [failure, setFailure] = useState<WorldRuntimeFailure | null>(null);
  const [status, setStatus] = useState<WorldHostStatus>("initializing");
  const selectionChangeRef = useRef(onSelectionChange);
  const selectableObjectsChangeRef = useRef(onSelectableObjectsChange);
  const statusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    selectionChangeRef.current = onSelectionChange;
    selectableObjectsChangeRef.current = onSelectableObjectsChange;
    statusChangeRef.current = onStatusChange;
  }, [onSelectableObjectsChange, onSelectionChange, onStatusChange]);

  const publishSelectableObjects = (
    objects: readonly WorldSelectableObject[],
  ): void => {
    setSelectableObjects(objects);
    selectableObjectsChangeRef.current?.(objects);
  };

  const publishSelection = (nextSelection: WorldSelection): void => {
    setSelection(nextSelection);
    selectionChangeRef.current?.(nextSelection);
  };

  const publishStatus = (nextStatus: WorldHostStatus): void => {
    setStatus(nextStatus);
    statusChangeRef.current?.(nextStatus);
  };

  const selectAdjacentObject = (direction: SelectionDirection): void => {
    const id = adjacentSelectionId(selectableObjects, selection, direction);
    if (id !== null) runtimeRef.current?.selectObject(id);
  };

  useEffect(() => {
    const host = hostRef.current;
    let active = true;
    let runtime: WorldRuntime | undefined;
    let unsubscribeDiagnostics: (() => void) | undefined;
    let unsubscribeFailure: (() => void) | undefined;
    let unsubscribeSelection: (() => void) | undefined;
    let terminalFailureReported = false;

    if (!host) return;

    publishSelectableObjects([]);
    publishSelection(null);
    setDiagnostics(EMPTY_DIAGNOSTICS);
    setFailure(null);
    publishStatus("initializing");

    const effectiveRuntimeFactory =
      runtimeFactory ??
      (performanceScenario
        ? async () => {
            const { createThreeWorldRuntime } =
              await import("./three/ThreeWorldRuntime");
            return createThreeWorldRuntime({ performanceScenario });
          }
        : () => createRuntime(readingAreaBooks, libraryWorldSnapshot));

    void effectiveRuntimeFactory()
      .then((createdRuntime) => {
        if (!active) {
          createdRuntime.dispose();
          return;
        }

        runtime = createdRuntime;
        runtime.mount(host);
        runtimeRef.current = runtime;
        publishSelectableObjects(runtime.getSelectableObjects());
        unsubscribeDiagnostics = runtime.onDiagnosticsChange(
          (nextDiagnostics) => {
            if (active) setDiagnostics(nextDiagnostics);
          },
        );
        unsubscribeSelection = runtime.onSelectionChange((nextSelection) => {
          if (active) publishSelection(nextSelection);
        });
        unsubscribeFailure = runtime.onFailure((nextFailure) => {
          if (!active || runtime !== createdRuntime) return;

          terminalFailureReported = true;
          unsubscribeDiagnostics?.();
          unsubscribeSelection?.();
          unsubscribeFailure?.();
          runtimeRef.current = null;
          runtime.dispose();
          publishSelectableObjects([]);
          publishSelection(null);
          setDiagnostics(EMPTY_DIAGNOSTICS);
          setFailure(nextFailure);
          publishStatus("failed");
          console.error(
            `[Biblioteca Viva] three-world-runtime-failed:${nextFailure.code}`,
            nextFailure.message,
          );
        });
        if (terminalFailureReported) return;
        runtime.start();
        if (terminalFailureReported) return;
        publishStatus("ready");
      })
      .catch(() => {
        unsubscribeDiagnostics?.();
        unsubscribeFailure?.();
        unsubscribeSelection?.();
        runtime?.dispose();
        runtimeRef.current = null;
        if (!active) return;
        console.error("[Biblioteca Viva] three-world-initialization-failed");
        publishStatus("failed");
      });

    return () => {
      active = false;
      unsubscribeDiagnostics?.();
      unsubscribeFailure?.();
      unsubscribeSelection?.();
      runtime?.dispose();
      runtime = undefined;
      runtimeRef.current = null;
    };
  }, [
    performanceScenario,
    readingAreaBooks,
    libraryWorldSnapshot,
    runtimeFactory,
  ]);

  useEffect(() => {
    if (selectedObjectId === undefined || status !== "ready") return;
    runtimeRef.current?.selectObject(selectedObjectId);
  }, [selectedObjectId, status]);

  return (
    <div className="world-surface" data-status={status}>
      <div
        aria-hidden="true"
        className="world-host"
        data-testid="three-world-host"
        ref={hostRef}
      />
      {status === "initializing" && (
        <p className="world-status" role="status">
          Preparando a área de leitura…
        </p>
      )}
      {status === "ready" && (
        <>
          <p className="world-status" role="status">
            Ambiente 3D em execução.
          </p>
          <aside
            aria-label="Diagnóstico técnico do ambiente 3D"
            className="world-diagnostics"
            data-runtime-state={diagnostics.runtimeState}
            data-testid="world-diagnostics"
          >
            <h3>Diagnóstico local</h3>
            <dl>
              <div>
                <dt>Runtime</dt>
                <dd>{diagnostics.runtimeState}</dd>
              </div>
              <div>
                <dt>Cenário</dt>
                <dd>{diagnostics.performanceScenarioLabel}</dd>
              </div>
              <div>
                <dt>Assets do cenário</dt>
                <dd>
                  {diagnostics.performanceScenarioAssetsLoaded}/
                  {diagnostics.performanceScenarioAssetsTotal}
                </dd>
              </div>
              {performanceScenario && (
                <>
                  <div>
                    <dt>Maps declarados</dt>
                    <dd>{diagnostics.materialTextureReferences}</dd>
                  </div>
                  <div>
                    <dt>Texturas únicas declaradas</dt>
                    <dd>{diagnostics.uniqueMaterialTextures}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>FPS</dt>
                <dd>{metric(diagnostics.fps)}</dd>
              </div>
              <div>
                <dt>Frame médio</dt>
                <dd>{metric(diagnostics.frameTimeMs, " ms")}</dd>
              </div>
              <div>
                <dt>Chamadas</dt>
                <dd>{diagnostics.drawCalls}</dd>
              </div>
              <div>
                <dt>Triângulos</dt>
                <dd>{diagnostics.triangles}</dd>
              </div>
              <div>
                <dt>Geometrias</dt>
                <dd>{diagnostics.geometries}</dd>
              </div>
              <div>
                <dt>Texturas</dt>
                <dd>{diagnostics.textures}</dd>
              </div>
              <div>
                <dt>Malhas</dt>
                <dd>{diagnostics.meshes}</dd>
              </div>
              <div>
                <dt>Selecionáveis</dt>
                <dd>{diagnostics.selectableObjects}</dd>
              </div>
              <div>
                <dt>Primeiro frame</dt>
                <dd>{metric(diagnostics.timeToFirstUsableFrameMs, " ms")}</dd>
              </div>
              <div>
                <dt>GLB</dt>
                <dd>{metric(diagnostics.fixtureLoadMs, " ms")}</dd>
              </div>
            </dl>
          </aside>
          <fieldset className="world-selection-controls">
            <legend>Seleção da cena</legend>
            <p aria-live="polite" className="world-selection-status">
              Objeto selecionado:{" "}
              {selection?.label ?? "Nenhum objeto selecionado"}.
            </p>
            <p className="world-selection-help">
              Use estes controles para selecionar sem usar o canvas.
            </p>
            <div className="world-selection-actions">
              <button
                className="button button--secondary"
                onClick={() => selectAdjacentObject(-1)}
                type="button"
              >
                ← Anterior
              </button>
              <button
                className="button button--secondary"
                onClick={() => selectAdjacentObject(1)}
                type="button"
              >
                Próximo →
              </button>
            </div>
          </fieldset>
        </>
      )}
      {status === "failed" && (
        <div className="world-fallback" role="alert">
          <h3>O ambiente 3D não pôde ser iniciado</h3>
          <p>
            A Biblioteca visual está indisponível neste dispositivo. Sua coleção
            e as demais áreas continuam funcionando normalmente.
          </p>
          {failure && <p>{failure.message}</p>}
        </div>
      )}
    </div>
  );
}
