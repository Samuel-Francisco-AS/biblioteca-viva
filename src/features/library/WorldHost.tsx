import { useEffect, useRef, useState } from "react";

import type {
  WorldRuntime,
  WorldRuntimeDiagnostics,
  WorldRuntimeFactory,
  WorldRuntimeFailure,
  WorldSelectableObject,
  WorldSelection,
} from "./worldRuntime";

type WorldHostStatus = "initializing" | "ready" | "failed";

const EMPTY_DIAGNOSTICS: WorldRuntimeDiagnostics = {
  activeFrameLoops: 0,
  drawCalls: 0,
  fixtureLoadMs: null,
  fixtureStatus: "idle",
  fps: null,
  frameTimeMs: null,
  geometries: 0,
  meshes: 0,
  renderedFrames: 0,
  runtimeState: "created",
  sceneObjects: 0,
  selectableObjects: 0,
  textures: 0,
  timeToFirstUsableFrameMs: null,
  triangles: 0,
};

function metric(value: number | null, suffix = ""): string {
  return value === null ? "Aguardando" : `${value.toFixed(1)}${suffix}`;
}

const createRuntime: WorldRuntimeFactory = async () => {
  const { createThreeWorldRuntime } = await import("./three/ThreeWorldRuntime");
  return createThreeWorldRuntime();
};

interface WorldHostProps {
  readonly runtimeFactory?: WorldRuntimeFactory;
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

export function WorldHost({ runtimeFactory = createRuntime }: WorldHostProps) {
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

    setSelectableObjects([]);
    setSelection(null);
    setDiagnostics(EMPTY_DIAGNOSTICS);
    setFailure(null);
    setStatus("initializing");

    void runtimeFactory()
      .then((createdRuntime) => {
        if (!active) {
          createdRuntime.dispose();
          return;
        }

        runtime = createdRuntime;
        runtime.mount(host);
        runtimeRef.current = runtime;
        setSelectableObjects(runtime.getSelectableObjects());
        unsubscribeDiagnostics = runtime.onDiagnosticsChange(
          (nextDiagnostics) => {
            if (active) setDiagnostics(nextDiagnostics);
          },
        );
        unsubscribeSelection = runtime.onSelectionChange((nextSelection) => {
          if (active) setSelection(nextSelection);
        });
        unsubscribeFailure = runtime.onFailure((nextFailure) => {
          if (!active || runtime !== createdRuntime) return;

          terminalFailureReported = true;
          unsubscribeDiagnostics?.();
          unsubscribeSelection?.();
          unsubscribeFailure?.();
          runtimeRef.current = null;
          runtime.dispose();
          setSelectableObjects([]);
          setSelection(null);
          setDiagnostics(EMPTY_DIAGNOSTICS);
          setFailure(nextFailure);
          setStatus("failed");
          console.error(
            `[Biblioteca Viva] three-world-runtime-failed:${nextFailure.code}`,
            nextFailure.message,
          );
        });
        if (terminalFailureReported) return;
        runtime.start();
        setStatus("ready");
      })
      .catch(() => {
        unsubscribeDiagnostics?.();
        unsubscribeFailure?.();
        unsubscribeSelection?.();
        runtime?.dispose();
        runtimeRef.current = null;
        if (!active) return;
        console.error("[Biblioteca Viva] three-world-initialization-failed");
        setStatus("failed");
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
  }, [runtimeFactory]);

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
          Preparando o ambiente 3D experimental…
        </p>
      )}
      {status === "ready" && (
        <>
          <p className="world-status" role="status">
            Ambiente 3D experimental em execução.
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
              Controle experimental da Fundação para selecionar sem usar o
              canvas.
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
