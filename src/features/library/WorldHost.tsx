import { equalSnapshot, worldSceneIdentity } from "./snapshotEquality";
import { WorldDiagnosticPanel } from "./WorldDiagnosticPanel";
import { NarrativePanel } from "./NarrativePanel";
import { NarrativeSession } from "./narrative/session";
import { InhabitantRuntimeLife } from "./InhabitantRuntimeLife";
import {
  INHABITANT_ACTIONS,
  INHABITANT_ACTIVITIES,
  INHABITANTS,
} from "./inhabitants";
import { LivingSession } from "./livingObjects";
import { NightLightingSession, type NightLightingPort } from "./nightLighting";
import type { WorldSessionActivity } from "../../contracts/worldSessionActivity";
import { LivingControls, LivingFeedback } from "./LivingControls";
import type {
  InhabitantContinuityPort,
  InhabitantContinuitySnapshot,
} from "./inhabitantContinuity";
import { useCallback, useEffect, useRef, useState } from "react";
import { completeStartupExperience } from "../../startupExperience";

import type {
  WorldRuntime,
  WorldRuntimeFactory,
  WorldRuntimeFailure,
  WorldSelectableObject,
  WorldSelection,
} from "./worldRuntime";
import type { ReadingAreaBook } from "./readingAreaBookContract";
import type { LibraryWorldSnapshot } from "./libraryWorldEntryContract";
import type { PerformanceScenario } from "./three/performanceScenarios";

export type WorldHostStatus = "initializing" | "ready" | "failed";

const createRuntime = async (
  readingAreaBooks: readonly ReadingAreaBook[] | undefined,
  libraryWorldSnapshot: LibraryWorldSnapshot | undefined,
  livingSession: LivingSession,
  nightLighting: NightLightingSession,
  continuity?: InhabitantContinuityPort,
  nightLightingContinuity?: NightLightingPort,
): Promise<WorldRuntime> => {
  if (libraryWorldSnapshot && readingAreaBooks) {
    throw new Error("Use somente um snapshot BF por montagem.");
  }
  // Wait for the durable checkpoint before mounting real agents.
  let restored: InhabitantContinuitySnapshot | undefined;
  if (libraryWorldSnapshot && continuity) {
    try {
      restored = await continuity.load();
    } catch {
      // Optional world continuity must not prevent using the library.
    }
  }
  nightLighting.refreshContext();
  if (libraryWorldSnapshot && nightLightingContinuity) {
    try {
      nightLighting.restore(await nightLightingContinuity.load());
    } catch {
      // Corrupted or unavailable optional ritual data cannot block the world.
    }
  }
  const { createThreeWorldRuntime } = await import("./three/ThreeWorldRuntime");
  return createThreeWorldRuntime(
    libraryWorldSnapshot
      ? {
          libraryWorldSnapshot,
          livingSession,
          nightLighting,
          ...(restored ? { inhabitantContinuity: restored } : {}),
          ...(continuity
            ? {
                onInhabitantCheckpoint: (
                  snapshot: InhabitantContinuitySnapshot,
                ) => {
                  void continuity.save(snapshot).catch(() => undefined);
                },
              }
            : {}),
        }
      : { readingAreaBooks },
  );
};

export interface WorldHostProps {
  readonly active?: boolean;
  readonly inhabitantContinuity?: InhabitantContinuityPort;
  readonly nightLightingContinuity?: NightLightingPort;
  readonly libraryWorldSnapshot?: LibraryWorldSnapshot;
  readonly worldSessionActivity?: WorldSessionActivity | null;
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
  active = true,
  inhabitantContinuity,
  nightLightingContinuity,
  libraryWorldSnapshot: incomingSnapshot,
  worldSessionActivity,
  onSelectableObjectsChange,
  onSelectionChange,
  onStatusChange,
  performanceScenario,
  readingAreaBooks,
  runtimeFactory,
  selectedObjectId,
}: WorldHostProps) {
  const [sceneInput, setSceneInput] = useState(() => ({
    snapshot: incomingSnapshot,
    identity: worldSceneIdentity(incomingSnapshot),
  }));
  const identity = worldSceneIdentity(incomingSnapshot);
  if (!equalSnapshot(sceneInput.identity, identity))
    setSceneInput({ snapshot: incomingSnapshot, identity });
  const libraryWorldSnapshot = sceneInput.snapshot;
  const [narrativeSession] = useState(() => new NarrativeSession());
  const [livingSession] = useState(() => new LivingSession());
  const [nightLighting] = useState(() => new NightLightingSession());
  const [livingSelection, setLivingSelection] = useState<string | null>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    if (active) {
      runtimeRef.current?.resize();
      runtimeRef.current?.resume();
    } else {
      runtimeRef.current?.pause();
      narrativeSession.close();
    }
  }, [active, narrativeSession]);
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<WorldRuntime | null>(null);
  const worldSessionRef = useRef<WorldSessionActivity | null>(
    worldSessionActivity ?? null,
  );
  useEffect(() => {
    worldSessionRef.current = worldSessionActivity ?? null;
    runtimeRef.current?.applyWorldSession?.(worldSessionRef.current);
  }, [worldSessionActivity]);
  const [viewRuntime, setViewRuntime] = useState<WorldRuntime | null>(null);
  const [selectableObjects, setSelectableObjects] = useState<
    readonly WorldSelectableObject[]
  >([]);
  const [inhabitantFeedback, setInhabitantFeedback] = useState("");
  const [selection, setSelection] = useState<WorldSelection>(null);
  const [failure, setFailure] = useState<WorldRuntimeFailure | null>(null);
  const [attempt, setAttempt] = useState(0);
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

  const talkTo = useCallback(
    (key: Parameters<NarrativeSession["talk"]>[0]) => {
      const runtime = runtimeRef.current;
      runtime?.observeQuest?.({
        type: "mark",
        stage: "talkStart",
        inhabitant: key,
      });
      try {
        narrativeSession.talk(key);
      } finally {
        runtime?.observeQuest?.({
          type: "mark",
          stage: "talkEnd",
          inhabitant: key,
        });
      }
    },
    [narrativeSession],
  );

  const publishSelection = useCallback(
    (nextSelection: WorldSelection): void => {
      setSelection(nextSelection);
      setInhabitantFeedback("");
      setLivingSelection(
        nextSelection?.id.startsWith("living:") ? nextSelection.id : null,
      );
      if (!performanceScenario && libraryWorldSnapshot) {
        const inhabitant = INHABITANTS.find((a) => a.id === nextSelection?.id);
        if (inhabitant) talkTo(inhabitant.key);
        else if (nextSelection) narrativeSession.close();
      }
      selectionChangeRef.current?.(nextSelection);
    },
    [narrativeSession, talkTo, performanceScenario, libraryWorldSnapshot],
  );

  const publishStatus = (nextStatus: WorldHostStatus): void => {
    setStatus(nextStatus);
    if (nextStatus === "ready" || nextStatus === "failed")
      completeStartupExperience();
    if (nextStatus !== "ready") setViewRuntime(null);
    statusChangeRef.current?.(nextStatus);
  };

  const selectAdjacentObject = (direction: SelectionDirection): void => {
    const id = adjacentSelectionId(
      selectableObjects.filter(
        (object) =>
          !object.id.startsWith("living:") &&
          !object.id.startsWith("character:"),
      ),
      selection,
      direction,
    );
    if (id !== null) runtimeRef.current?.selectObject(id);
  };

  useEffect(() => {
    const host = hostRef.current;
    let active = true;
    let runtime: WorldRuntime | undefined;
    let unsubscribeFailure: (() => void) | undefined;
    let unsubscribeSelection: (() => void) | undefined;
    let unsubscribeInhabitantActivation: (() => void) | undefined;
    let unsubscribeNarrative: (() => void) | undefined;
    let terminalFailureReported = false;

    if (!host) return;

    publishSelectableObjects([]);
    publishSelection(null);
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
        : () =>
            createRuntime(
              readingAreaBooks,
              libraryWorldSnapshot,
              livingSession,
              nightLighting,
              inhabitantContinuity,
              nightLightingContinuity,
            ));

    void effectiveRuntimeFactory()
      .then((createdRuntime) => {
        if (!active) {
          createdRuntime.dispose();
          return;
        }

        runtime = createdRuntime;
        if (!performanceScenario && libraryWorldSnapshot)
          runtime.applyNarrative?.(narrativeSession.getSnapshot());
        runtime.mount(host);
        runtimeRef.current = runtime;
        runtime.applyWorldSession?.(worldSessionRef.current);
        if (!performanceScenario && libraryWorldSnapshot) {
          const applyNarrative = () => {
            if (active && runtimeRef.current === createdRuntime)
              createdRuntime.applyNarrative?.(narrativeSession.getSnapshot());
          };
          unsubscribeInhabitantActivation = runtime.onInhabitantActivate?.(
            (key) => {
              if (active) talkTo(key);
            },
          );
          unsubscribeNarrative = narrativeSession.subscribe(applyNarrative);
          applyNarrative();
        }
        publishSelectableObjects(runtime.getSelectableObjects());
        unsubscribeSelection = runtime.onSelectionChange((nextSelection) => {
          if (active) publishSelection(nextSelection);
        });
        unsubscribeFailure = runtime.onFailure((nextFailure) => {
          if (!active || runtime !== createdRuntime) return;

          terminalFailureReported = true;
          unsubscribeSelection?.();
          unsubscribeFailure?.();
          unsubscribeNarrative?.();
          unsubscribeInhabitantActivation?.();
          runtimeRef.current = null;
          runtime.dispose();
          publishSelectableObjects([]);
          publishSelection(null);
          setFailure(nextFailure);
          publishStatus("failed");
          console.error(
            `[Biblioteca Viva] three-world-runtime-failed:${nextFailure.code}`,
            nextFailure.message,
          );
        });
        if (terminalFailureReported) return;
        runtime.start();
        if (!activeRef.current) runtime.pause();
        if (terminalFailureReported) return;
        setViewRuntime(runtime);
        publishStatus("ready");
      })
      .catch(() => {
        unsubscribeFailure?.();
        unsubscribeSelection?.();
        unsubscribeNarrative?.();
        unsubscribeInhabitantActivation?.();
        runtime?.dispose();
        runtimeRef.current = null;
        if (!active) return;
        console.error("[Biblioteca Viva] three-world-initialization-failed");
        publishStatus("failed");
      });

    return () => {
      active = false;
      unsubscribeFailure?.();
      unsubscribeSelection?.();
      unsubscribeNarrative?.();
      unsubscribeInhabitantActivation?.();
      runtime?.dispose();
      runtime = undefined;
      runtimeRef.current = null;
    };
  }, [
    livingSession,
    nightLighting,
    narrativeSession,
    inhabitantContinuity,
    nightLightingContinuity,
    publishSelection,
    talkTo,
    performanceScenario,
    readingAreaBooks,
    libraryWorldSnapshot,
    runtimeFactory,
    attempt,
  ]);

  useEffect(() => {
    if (performanceScenario || !libraryWorldSnapshot) return;
    const refresh = () => {
      livingSession.refreshContext();
      nightLighting.refreshContext();
    };
    refresh();
    // One host timer aligned to the wall-clock minute boundary. The evening
    // transition does not wait up to a full minute after 18:00.
    let interval: number | undefined;
    const initial = window.setTimeout(
      () => {
        refresh();
        interval = window.setInterval(refresh, 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(initial);
      if (interval !== undefined) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [livingSession, nightLighting, libraryWorldSnapshot, performanceScenario]);

  useEffect(() => {
    if (
      !nightLightingContinuity ||
      performanceScenario ||
      !libraryWorldSnapshot
    )
      return;
    return nightLighting.subscribe(() => {
      void nightLightingContinuity
        .save(nightLighting.capture())
        .catch(() => undefined);
    });
  }, [
    nightLighting,
    nightLightingContinuity,
    libraryWorldSnapshot,
    performanceScenario,
  ]);

  useEffect(() => {
    if (selectedObjectId === undefined || status !== "ready") return;
    runtimeRef.current?.selectObject(selectedObjectId);
  }, [selectedObjectId, status]);

  return (
    <div className="world-surface" data-status={status}>
      <div className="living-world-stage">
        <div
          aria-hidden="true"
          className="world-host"
          data-testid="three-world-host"
          ref={hostRef}
        />

        {!performanceScenario && libraryWorldSnapshot && (
          <LivingFeedback session={livingSession} />
        )}
      </div>
      {!performanceScenario && libraryWorldSnapshot && (
        <NarrativePanel
          session={narrativeSession}
          questProbe={viewRuntime ?? undefined}
          enabled={active}
          failed={status === "failed"}
        />
      )}
      {status === "initializing" && (
        <p className="world-status" role="status">
          Preparando a área de leitura…
        </p>
      )}
      <details className="world-explore" open={status === "failed"}>
        <summary>Explorar · habitantes e objetos</summary>
        {status === "ready" && (
          <>
            <p className="world-status" role="status">
              Ambiente 3D em execução.
            </p>
            <WorldDiagnosticPanel
              runtime={viewRuntime}
              performanceScenario={performanceScenario}
            />
            <details className="world-semantic">
              <summary>Selecionar elementos</summary>
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
            </details>
          </>
        )}
        {!performanceScenario && libraryWorldSnapshot && (
          <details aria-label="Habitantes">
            <summary>Habitantes da Biblioteca</summary>
            <InhabitantRuntimeLife
              runtime={viewRuntime}
              failed={status === "failed"}
            />
            {INHABITANTS.map((inhabitant) => (
              <div key={inhabitant.id}>
                <button
                  type="button"
                  aria-pressed={selection?.id === inhabitant.id}
                  onClick={() => {
                    runtimeRef.current?.observeQuest?.({
                      type: "begin",
                      source: "accessible",
                    });
                    if (status === "ready")
                      runtimeRef.current?.selectObject(inhabitant.id);
                    else publishSelection(inhabitant);
                    talkTo(inhabitant.key);
                    runtimeRef.current?.observeQuest?.({
                      type: "mark",
                      stage: "handlerEnd",
                    });
                  }}
                >
                  {inhabitant.label}
                </button>
                <p>{inhabitant.description}</p>
                {selection?.id === inhabitant.id && (
                  <fieldset>
                    <legend>Ações de {inhabitant.label}</legend>
                    {INHABITANT_ACTIONS.map(([action, label]) => (
                      <button
                        type="button"
                        key={action}
                        onClick={() => {
                          narrativeSession.close();
                          const result =
                            runtimeRef.current?.playInhabitantAction?.(
                              inhabitant.id,
                              action,
                            ) ?? "unavailable";
                          const detail =
                            action === "work"
                              ? INHABITANT_ACTIVITIES[inhabitant.key][0]
                              : action === "magic"
                                ? INHABITANT_ACTIVITIES[inhabitant.key][1]
                                : label;
                          setInhabitantFeedback(
                            `${inhabitant.label}: ${detail}. ${result === "playing" ? "Demonstração finita com retorno ao repouso." : result === "reduced" ? "Movimento reduzido ativo; demonstração descrita em texto." : result === "loading" ? "Modelo carregando; tente novamente." : "Animação indisponível ou sem espaço seguro neste ponto; descrição preservada."}`,
                          );
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </fieldset>
                )}
              </div>
            ))}
            <p role="status">
              {inhabitantFeedback ||
                (selection?.id.startsWith("character:")
                  ? `${selection.label} selecionado`
                  : "Selecione um habitante pelo nome ou pelo mundo.")}
            </p>
          </details>
        )}
      </details>
      {!performanceScenario && libraryWorldSnapshot && (
        <LivingControls
          session={livingSession}
          selected={livingSelection}
          fallback={status === "failed"}
          onSelect={(id) => {
            setLivingSelection(id);
            runtimeRef.current?.selectObject(id);
          }}
        />
      )}
      {status === "failed" && (
        <div className="world-fallback" role="alert">
          <h3>O ambiente 3D não pôde ser iniciado</h3>
          <p>
            A Biblioteca visual está indisponível neste dispositivo. Sua coleção
            e as demais áreas continuam funcionando normalmente.
          </p>
          {failure && <p>{failure.message}</p>}
          <button
            className="button button--primary"
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Tentar abrir o mundo novamente
          </button>
        </div>
      )}
    </div>
  );
}
