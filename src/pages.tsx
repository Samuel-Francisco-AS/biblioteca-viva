import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type {
  BookEntry,
  ReachedMilestone,
  RoomId,
  RoomProgress,
} from "./domain";
import { RESIDENT_CATALOG, ROOM_NAMES } from "./content";
import type {
  AudioPort,
  DialoguePort,
  LocalizedDialogue,
  StatisticsSnapshot,
} from "./application";
import {
  DEFAULT_PLACED_OBJECTS,
  nextObjectRotation,
  type PlacedObject,
  type StructuralInventory,
  type WorldStructureState,
} from "./application";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import {
  LibraryBottomSheet,
  type LibrarySheetMode,
} from "./features/library-visual/LibraryBottomSheet";
import { LibrarySpeechBubble } from "./features/library-visual/LibrarySpeechBubble";
import { LibraryVisualDiagnosticsPanel } from "./features/library-visual/LibraryVisualDiagnostics";
import { LibraryVisualHost } from "./features/library-visual/LibraryVisualHost";
import { LibraryProjectionService } from "./features/library-visual/LibraryProjectionService";
import { LibraryTextAlternative } from "./features/library-visual/LibraryTextAlternative";
import {
  ConstructionControls,
  type ConstructionTool,
} from "./features/library-visual/ConstructionControls";
import type {
  LibraryInteraction,
  LibraryViewModel,
} from "./features/library-visual/contracts";
import { createLibraryVisualDiagnostics } from "./features/library-visual/diagnostics";
import {
  createLibraryPeriodMonitor,
  deriveLibraryPeriod,
  LIBRARY_PERIOD_LABELS,
  type LibraryPeriod,
} from "./features/library-visual/libraryAtmosphere";

export interface LibraryPageApplication {
  readonly audio?: Pick<AudioPort, "emit">;
  readonly dialogue: Pick<DialoguePort, "enterLibrary" | "select">;
  readonly queries: {
    readonly listBookEntries: { execute(): Promise<readonly BookEntry[]> };
    readonly listMilestones: { list(): Promise<readonly ReachedMilestone[]> };
    readonly getStatistics?: {
      execute(input?: unknown): Promise<StatisticsSnapshot>;
    };
    readonly getRoomProgress?: { execute(): Promise<readonly RoomProgress[]> };
    readonly listPlacedObjects?: {
      execute(): Promise<readonly PlacedObject[]>;
    };
    readonly getWorldStructure?: {
      execute(): Promise<WorldStructureState | undefined>;
    };
    readonly getStructuralInventory?: {
      execute(): Promise<StructuralInventory>;
    };
  };
  readonly commands?: {
    readonly updatePlacedObjectTransform: {
      execute(input: unknown): Promise<PlacedObject>;
    };
    readonly placeStructure?: {
      execute(input: unknown): Promise<WorldStructureState>;
    };
    readonly moveStructure?: {
      execute(input: unknown): Promise<WorldStructureState>;
    };
    readonly rotateStructure?: {
      execute(input: unknown): Promise<WorldStructureState>;
    };
    readonly storeStructure?: {
      execute(input: unknown): Promise<WorldStructureState>;
    };
    readonly addFloorCells?: {
      execute(input: unknown): Promise<{
        state: WorldStructureState;
        placed: number;
        ignored: number;
      }>;
    };
    readonly removeFloorCells?: {
      execute(input: unknown): Promise<{
        state: WorldStructureState;
        removed: number;
        ignored: number;
      }>;
    };
  };
}

interface PendingPlacedObjectTransform {
  readonly next: PlacedObject;
  readonly previous: PlacedObject;
  readonly successNotice: string;
}

type LibraryPageState =
  | { readonly kind: "loading" }
  | { readonly kind: "error"; readonly message: string }
  | {
      readonly kind: "ready";
      readonly recentBookTitle?: string;
      readonly viewModel: LibraryViewModel;
      readonly rooms: readonly RoomProgress[];
      readonly productSummary?: {
        readonly totalEntries: number;
        readonly activeSessionType?: string;
      };
      readonly placedObjects: readonly PlacedObject[];
      readonly structuralInventory?: StructuralInventory;
    };

type AtmosphereOverride = LibraryPeriod | "automatic";

function useAutomaticLibraryPeriod(): LibraryPeriod {
  const [period, setPeriod] = useState(() => deriveLibraryPeriod(new Date()));
  useEffect(() => {
    const monitor = createLibraryPeriodMonitor(setPeriod, {
      clearTimer: (timer) => window.clearTimeout(timer),
      now: () => new Date(),
      setTimer: (callback, delay) => window.setTimeout(callback, delay),
      visibilitySource: document,
    });
    return () => monitor.dispose();
  }, []);
  return period;
}

function projectionInput(
  books: readonly BookEntry[],
  milestones: readonly ReachedMilestone[],
  pendingDecorationUnlock?: { readonly eventId: string },
  placedObjects?: readonly PlacedObject[],
  worldStructure?: WorldStructureState,
) {
  return {
    books: books.map(
      ({ currentPage, id, status, title, totalPages, updatedAt }) => ({
        currentPage,
        id,
        status,
        title,
        totalPages,
        updatedAt,
      }),
    ),
    milestones,
    ...(pendingDecorationUnlock && { pendingDecorationUnlock }),
    ...(placedObjects && { placedObjects }),
    ...(worldStructure && { worldStructure }),
  };
}

export function LibraryPage({
  application,
  onDecorationUnlockPresented,
  pendingDecorationUnlock,
  reducedMotion = false,
  highContrast = false,
}: {
  readonly application?: LibraryPageApplication;
  readonly onDecorationUnlockPresented?: (eventId: string) => void;
  readonly pendingDecorationUnlock?: { readonly eventId: string };
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
}) {
  const diagnosticsEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
  const diagnostics = useMemo(
    () => (diagnosticsEnabled ? createLibraryVisualDiagnostics() : undefined),
    [diagnosticsEnabled],
  );
  const projectionService = useMemo(() => new LibraryProjectionService(), []);
  const automaticPeriod = useAutomaticLibraryPeriod();
  const dialogueRequest = useRef(0);
  const placedObjectTransformQueues = useRef(
    new Map<
      string,
      {
        inFlight: boolean;
        pending?: PendingPlacedObjectTransform;
      }
    >(),
  );
  const objectActionsCloseTimer = useRef<number | undefined>(undefined);
  const placementNoticeTimer = useRef<number | undefined>(undefined);
  const summaryButtonRef = useRef<HTMLButtonElement>(null);
  const shelfButtonRef = useRef<HTMLButtonElement>(null);
  const librarianButtonRef = useRef<HTMLButtonElement>(null);
  const creatureButtonRef = useRef<HTMLButtonElement>(null);
  const residentButtonRef = useRef<HTMLButtonElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [sheetMode, setSheetMode] = useState<LibrarySheetMode | null>(null);
  const [speechBubble, setSpeechBubble] = useState<LocalizedDialogue | null>(
    null,
  );
  const [speechAnchor, setSpeechAnchor] = useState<
    { readonly x: number; readonly y: number } | undefined
  >();
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<RoomId>("main-library");
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const [atmosphereOverride, setAtmosphereOverride] =
    useState<AtmosphereOverride>("automatic");
  const period =
    atmosphereOverride === "automatic" ? automaticPeriod : atmosphereOverride;
  const handleAvailabilityChange = useCallback((available: boolean) => {
    setCanvasFailed(!available);
  }, []);
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [objectActionsObjectId, setObjectActionsObjectId] = useState<string>();
  const [objectActionsClosing, setObjectActionsClosing] = useState(false);
  const [movingObjectId, setMovingObjectId] = useState<string>();
  const [placementNotice, setPlacementNotice] = useState<string | null>(null);
  const [placementNoticeExiting, setPlacementNoticeExiting] = useState(false);
  const [constructionMode, setConstructionMode] = useState(false);
  const [constructionTool, setConstructionTool] =
    useState<ConstructionTool>("explore");
  const [placingStructureDefinitionId, setPlacingStructureDefinitionId] =
    useState<import("./application").StructureDefinitionId>();
  const [movingStructureId, setMovingStructureId] = useState<string>();
  const [state, setState] = useState<LibraryPageState>(() =>
    application
      ? { kind: "loading" }
      : {
          kind: "error",
          message: "Não foi possível iniciar o armazenamento local.",
        },
  );

  function applyPlacedObjectPreview(next: PlacedObject): void {
    setState((current) => {
      if (current.kind !== "ready") return current;
      const placedObjects = current.placedObjects.map((object) =>
        object.instanceId === next.instanceId ? next : object,
      );
      return {
        ...current,
        placedObjects,
        viewModel: { ...current.viewModel, placedObjects },
      };
    });
  }

  function showPlacementNotice(message: string | null): void {
    setPlacementNoticeExiting(false);
    setPlacementNotice(message);
  }

  function applyStructureState(next: WorldStructureState): void {
    setState((current) =>
      current.kind === "ready"
        ? {
            ...current,
            viewModel: { ...current.viewModel, worldStructure: next },
          }
        : current,
    );
    void application?.queries.getStructuralInventory?.execute().then(
      (structuralInventory) =>
        setState((current) =>
          current.kind === "ready"
            ? { ...current, structuralInventory }
            : current,
        ),
      () => undefined,
    );
  }

  function runStructure(
    operation: () => Promise<
      WorldStructureState | { readonly state: WorldStructureState }
    >,
    success: string,
  ): void {
    void operation().then(
      (result) => {
        applyStructureState("state" in result ? result.state : result);
        showPlacementNotice(success);
      },
      (failure: unknown) =>
        showPlacementNotice(presentApplicationError(failure).message),
    );
  }

  function queuePlacedObjectTransform(
    next: PlacedObject,
    previous: PlacedObject,
    successNotice: string,
  ): void {
    const command = application?.commands?.updatePlacedObjectTransform;
    if (!command) return;
    const queues = placedObjectTransformQueues.current;
    const queue = queues.get(next.instanceId) ?? { inFlight: false };
    queue.pending = { next, previous, successNotice };
    queues.set(next.instanceId, queue);
    if (queue.inFlight) return;
    queue.inFlight = true;
    void (async () => {
      while (queue.pending) {
        const pending = queue.pending;
        queue.pending = undefined;
        try {
          await command.execute({
            instanceId: pending.next.instanceId,
            rotation: pending.next.rotation,
            spaceId: pending.next.spaceId,
            x: pending.next.x,
            y: pending.next.y,
          });
          if (!queue.pending) showPlacementNotice(pending.successNotice);
        } catch (failure: unknown) {
          if (!queue.pending) {
            applyPlacedObjectPreview(pending.previous);
            showPlacementNotice(presentApplicationError(failure).message);
          }
        }
      }
      queue.inFlight = false;
      queues.delete(next.instanceId);
    })();
  }

  function closeObjectActions(): void {
    setMovingObjectId(undefined);
    setSelectedObjectId(undefined);
    if (!objectActionsObjectId || reducedMotion) {
      setObjectActionsObjectId(undefined);
      setObjectActionsClosing(false);
      return;
    }
    setObjectActionsClosing(true);
    window.clearTimeout(objectActionsCloseTimer.current);
    objectActionsCloseTimer.current = window.setTimeout(() => {
      setObjectActionsObjectId(undefined);
      setObjectActionsClosing(false);
    }, 200);
  }

  useEffect(
    () => () => window.clearTimeout(objectActionsCloseTimer.current),
    [],
  );

  useEffect(() => {
    if (!placementNotice) return;
    window.clearTimeout(placementNoticeTimer.current);
    placementNoticeTimer.current = window.setTimeout(() => {
      setPlacementNoticeExiting(true);
      placementNoticeTimer.current = window.setTimeout(
        () => {
          setPlacementNotice(null);
          setPlacementNoticeExiting(false);
        },
        reducedMotion ? 0 : 300,
      );
    }, 2_500);
    return () => window.clearTimeout(placementNoticeTimer.current);
  }, [placementNotice, reducedMotion]);

  useEffect(() => {
    if (!application) return;
    let active = true;
    const preparationStartedAt = performance.now();
    void Promise.all([
      application.queries.listBookEntries.execute(),
      application.queries.listMilestones.list(),
      application.queries.getStatistics?.execute({ window: "all" }) ??
        Promise.resolve(undefined),
      application.queries.getRoomProgress?.execute() ??
        Promise.resolve([
          {
            roomId: "main-library",
            unlocked: true,
            currentStage: 1,
            highestReachedStage: 1,
            requirements: [],
          },
        ] as const),
      application.queries.listPlacedObjects?.execute() ??
        Promise.resolve(DEFAULT_PLACED_OBJECTS),
      application.queries.getWorldStructure?.execute() ??
        Promise.resolve(undefined),
      application.queries.getStructuralInventory?.execute() ??
        Promise.resolve(undefined),
    ]).then(
      ([
        books,
        milestones,
        statistics,
        rooms,
        placedObjects,
        worldStructure,
        structuralInventory,
      ]) => {
        if (!active) return;
        diagnostics?.resources({
          libraryPreparationDurationMs: Math.max(
            0,
            performance.now() - preparationStartedAt,
          ),
        });
        const recent = [...books].sort((first, second) =>
          second.updatedAt.localeCompare(first.updatedAt),
        )[0];
        setState({
          kind: "ready",
          ...(recent && { recentBookTitle: recent.title }),
          viewModel: projectionService.project(
            projectionInput(
              books,
              milestones,
              pendingDecorationUnlock,
              placedObjects,
              worldStructure,
            ),
          ),
          rooms,
          placedObjects,
          ...(structuralInventory && { structuralInventory }),
          ...(statistics && {
            productSummary: {
              totalEntries: statistics.totalEntries,
              ...(statistics.activeSession && {
                activeSessionType: statistics.activeSession.entryType,
              }),
            },
          }),
        });
      },
      (failure: unknown) => {
        if (!active) return;
        setState({
          kind: "error",
          message: presentApplicationError(failure).message,
        });
      },
    );
    return () => {
      active = false;
    };
  }, [
    application,
    attempt,
    diagnostics,
    pendingDecorationUnlock,
    projectionService,
  ]);

  useEffect(() => {
    if (!application || state.kind !== "ready") return;
    const activeRoom = state.rooms.find((room) => room.roomId === activeRoomId);
    const context =
      activeRoomId === "main-library"
        ? {}
        : {
            roomStage: activeRoom?.highestReachedStage ?? 1,
            hasRecentSession: Number(
              (state.productSummary?.totalEntries ?? 0) > 0,
            ),
            sessionCountBand: Math.min(
              2,
              Math.floor((state.viewModel.totalBooks ?? 0) / 3),
            ),
            hasCompletedAssociatedEntry: Number(
              (activeRoom?.highestReachedStage ?? 1) >= 4,
            ),
          };
    void application.dialogue.enterLibrary({
      completedBooks: state.viewModel.completedBooks,
      inProgressBooks: state.viewModel.inProgressBooks,
      totalBooks: state.viewModel.totalBooks,
      ...context,
    });
  }, [activeRoomId, application, state]);

  useEffect(
    () => () => {
      dialogueRequest.current += 1;
    },
    [],
  );

  async function openCharacterDialogue(
    event:
      | "creature.interaction"
      | "librarian.interaction"
      | "researcher.interaction"
      | "projectionist.interaction"
      | "training-keeper.interaction"
      | "scribe.interaction",
  ) {
    if (!application) return;
    const request = dialogueRequest.current + 1;
    dialogueRequest.current = request;
    const dialogue = await application.dialogue.select(event);
    if (request !== dialogueRequest.current) return;
    setSpeechBubble(dialogue);
  }

  function handleInteraction(interaction: LibraryInteraction) {
    if (interaction.type === "StructurePlacementCommitted") {
      if (state.kind !== "ready" || !application?.commands?.placeStructure)
        return;
      runStructure(
        () =>
          application.commands!.placeStructure!.execute({
            anchor: interaction.anchor,
            definitionId: interaction.definitionId,
            expectedRevision: state.viewModel.worldStructure?.revision,
          }),
        "Peça colocada.",
      );
      setPlacingStructureDefinitionId(undefined);
      setConstructionTool("select");
      return;
    }
    if (interaction.type === "StructureMoveCommitted") {
      if (state.kind !== "ready" || !application?.commands?.moveStructure)
        return;
      runStructure(
        () =>
          application.commands!.moveStructure!.execute({
            anchor: interaction.anchor,
            expectedRevision: state.viewModel.worldStructure?.revision,
            instanceId: interaction.instanceId,
          }),
        "Peça movida.",
      );
      setMovingStructureId(undefined);
      setConstructionTool("select");
      return;
    }
    if (interaction.type === "FloorCellsCommitted") {
      if (state.kind !== "ready") return;
      const command =
        interaction.mode === "paint-floor"
          ? application?.commands?.addFloorCells
          : application?.commands?.removeFloorCells;
      if (!command) return;
      runStructure(
        () =>
          command.execute({
            cells: interaction.cells,
            expectedRevision: state.viewModel.worldStructure?.revision,
          }),
        interaction.mode === "paint-floor"
          ? "Piso atualizado."
          : "Piso removido.",
      );
      return;
    }
    if (interaction.type === "StructureSelected") return;
    if (
      constructionMode &&
      (interaction.type === "PlacedObjectSelected" ||
        interaction.type === "PlacedObjectTransformCommitted")
    )
      return;
    if (interaction.type === "PlacedObjectSelected") {
      window.clearTimeout(objectActionsCloseTimer.current);
      setSelectedObjectId(interaction.instanceId);
      setObjectActionsObjectId(interaction.instanceId);
      setObjectActionsClosing(false);
      setMovingObjectId(undefined);
      showPlacementNotice(null);
      return;
    }
    if (interaction.type === "PlacedObjectTransformCommitted") {
      const previous =
        state.kind === "ready"
          ? state.placedObjects.find(
              (object) => object.instanceId === interaction.instanceId,
            )
          : undefined;
      const next: PlacedObject = {
        definitionId: previous?.definitionId ?? "object.reading-table",
        instanceId: interaction.instanceId,
        rotation: interaction.rotation,
        spaceId: interaction.spaceId,
        x: interaction.x,
        y: interaction.y,
      };
      applyPlacedObjectPreview(next);
      setMovingObjectId(undefined);
      if (previous)
        queuePlacedObjectTransform(next, previous, "Posição salva.");
      return;
    }
    if (interaction.type === "RoomRequested") {
      requestRoom(interaction.roomId);
      return;
    }
    if (interaction.type === "DecorationUnlockPresented") {
      onDecorationUnlockPresented?.(interaction.eventId);
      return;
    }
    if (interaction.type === "ShelfSelected") {
      dialogueRequest.current += 1;
      application?.audio?.emit({ type: "ShelfSelected" });
      setSpeechBubble(null);
      setSheetMode(activeRoomId === "main-library" ? "shelf" : "room");
    }
    if (interaction.type === "LibrarianSelected") {
      setSpeechAnchor(interaction.anchor);
      application?.audio?.emit({ type: "LibrarianSelected" });
      void openCharacterDialogue("librarian.interaction");
    }
    if (interaction.type === "CreatureSelected") {
      setSpeechAnchor(interaction.anchor);
      application?.audio?.emit({ type: "CreatureSelected" });
      void openCharacterDialogue("creature.interaction");
    }
    if (interaction.type === "ResidentInteracted") {
      setSpeechAnchor(interaction.anchor);
      const event = `${interaction.residentId}.interaction` as Parameters<
        typeof openCharacterDialogue
      >[0];
      void openCharacterDialogue(event);
    }
  }

  function requestRoom(roomId: RoomId) {
    if (state.kind !== "ready") return;
    const room = state.rooms.find((candidate) => candidate.roomId === roomId);
    if (!room?.unlocked) {
      const subject =
        roomId === "study-room"
          ? "estudo"
          : roomId === "projection-room"
            ? "filme ou série"
            : roomId === "training-room"
              ? "atividade física"
              : "trabalho";
      setRoomNotice(
        `${ROOM_NAMES[roomId]} bloqueada. Registre seu primeiro ${subject} para desbloquear.`,
      );
      return;
    }
    setRoomNotice(null);
    setActiveRoomId(roomId);
  }

  function closeSheet() {
    const mode = sheetMode;
    setSheetMode(null);
    requestAnimationFrame(() => {
      if (mode === "summary") summaryButtonRef.current?.focus();
      if (mode === "shelf") shelfButtonRef.current?.focus();
    });
  }

  function closeSpeechBubble() {
    const dialogue = speechBubble;
    setSpeechBubble(null);
    setSpeechAnchor(undefined);
    requestAnimationFrame(() => {
      if (dialogue?.characterId === "character.librarian")
        librarianButtonRef.current?.focus();
      if (dialogue?.characterId === "character.creature")
        creatureButtonRef.current?.focus();
    });
  }

  return (
    <section className="library-page" aria-labelledby="library-visual-title">
      <h2 className="visually-hidden" id="library-visual-title">
        Sua Biblioteca Viva
      </h2>
      {state.kind === "loading" && (
        <p role="status">Carregando visualização da Biblioteca…</p>
      )}
      {state.kind === "error" && (
        <section className="library-visual-fallback" role="alert">
          <h3>Não foi possível preparar a visualização da biblioteca</h3>
          <p>{state.message}</p>
          <Link className="button button--secondary" to="/colecao">
            Abrir Coleção
          </Link>
          {application && (
            <button
              className="button button--secondary"
              onClick={() => {
                setSheetMode(null);
                setState({ kind: "loading" });
                setAttempt((current) => current + 1);
              }}
              type="button"
            >
              Tentar novamente
            </button>
          )}
        </section>
      )}
      {state.kind === "ready" && (
        <div className="library-stage" data-period={period}>
          <LibraryVisualHost
            diagnostics={diagnostics}
            onAvailabilityChange={handleAvailabilityChange}
            onInteraction={handleInteraction}
            period={period}
            projection={state.viewModel}
            placementModeInstanceId={movingObjectId}
            constructionState={{
              active: constructionMode,
              ...(movingStructureId && { movingInstanceId: movingStructureId }),
              ...(placingStructureDefinitionId && {
                placingDefinitionId: placingStructureDefinitionId,
              }),
              tool: constructionTool,
            }}
            reducedMotion={reducedMotion}
            room={{
              roomId: activeRoomId,
              unlocked: true,
              stage:
                state.rooms.find((room) => room.roomId === activeRoomId)
                  ?.highestReachedStage ?? 1,
              unlockedRoomIds: state.rooms
                .filter((room) => room.unlocked)
                .map((room) => room.roomId),
              dayPeriod: period,
              reducedMotion,
              highContrast,
            }}
          />
          {!constructionMode && state.viewModel.worldStructure && (
            <button
              className="button button--primary library-construction-trigger"
              onClick={() => {
                setConstructionMode(true);
                setConstructionTool("explore");
                setPlacingStructureDefinitionId(undefined);
                setMovingStructureId(undefined);
                closeObjectActions();
                showPlacementNotice("Modo Construção iniciado.");
              }}
              type="button"
            >
              Construir
            </button>
          )}
          {constructionMode &&
            state.viewModel.worldStructure &&
            state.structuralInventory &&
            application?.commands?.placeStructure &&
            application.commands.moveStructure &&
            application.commands.rotateStructure &&
            application.commands.storeStructure &&
            application.commands.addFloorCells &&
            application.commands.removeFloorCells && (
              <ConstructionControls
                inventory={state.structuralInventory}
                onAddFloor={(cell) =>
                  runStructure(
                    () =>
                      application.commands!.addFloorCells!.execute({
                        cells: [cell],
                        expectedRevision:
                          state.viewModel.worldStructure!.revision,
                      }),
                    "Piso atualizado.",
                  )
                }
                onExit={() => {
                  setConstructionMode(false);
                  setConstructionTool("explore");
                  setPlacingStructureDefinitionId(undefined);
                  setMovingStructureId(undefined);
                  showPlacementNotice("Modo Construção encerrado.");
                }}
                onMove={(placement) => {
                  setMovingStructureId(placement.instanceId);
                  setPlacingStructureDefinitionId(undefined);
                  setConstructionTool("place-structure");
                }}
                onPlace={(definitionId) => {
                  setPlacingStructureDefinitionId(
                    definitionId as import("./application").StructureDefinitionId,
                  );
                  setMovingStructureId(undefined);
                  setConstructionTool("place-structure");
                }}
                onRemoveFloor={(cell) =>
                  runStructure(
                    () =>
                      application.commands!.removeFloorCells!.execute({
                        cells: [cell],
                        expectedRevision:
                          state.viewModel.worldStructure!.revision,
                      }),
                    "Piso atualizado.",
                  )
                }
                onRotate={(placement) =>
                  runStructure(
                    () =>
                      application.commands!.rotateStructure!.execute({
                        expectedRevision:
                          state.viewModel.worldStructure!.revision,
                        instanceId: placement.instanceId,
                      }),
                    "Orientação atualizada.",
                  )
                }
                onStore={(placement) =>
                  runStructure(
                    () =>
                      application.commands!.storeStructure!.execute({
                        expectedRevision:
                          state.viewModel.worldStructure!.revision,
                        instanceId: placement.instanceId,
                      }),
                    "Peça guardada no inventário.",
                  )
                }
                onToolChange={setConstructionTool}
                structure={state.viewModel.worldStructure}
                tool={constructionTool}
              />
            )}
          {objectActionsObjectId && (
            <section
              className={`library-object-actions${
                objectActionsClosing ? " library-object-actions--exiting" : ""
              }`}
              aria-label="Objeto selecionado"
            >
              <p>Objeto selecionado</p>
              <button
                aria-label="Fechar ações do objeto"
                className="library-object-actions__close"
                disabled={objectActionsClosing}
                onClick={closeObjectActions}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
              <button
                className="button button--primary"
                disabled={!selectedObjectId || objectActionsClosing}
                onClick={() => setMovingObjectId(selectedObjectId)}
                type="button"
              >
                Mover
              </button>
              <button
                className="button button--secondary"
                disabled={!selectedObjectId || objectActionsClosing}
                onClick={() => {
                  const object =
                    state.placedObjects.find(
                      (candidate) => candidate.instanceId === selectedObjectId,
                    ) ??
                    state.viewModel.placedObjects?.find(
                      (candidate) => candidate.instanceId === selectedObjectId,
                    );
                  if (!object) return;
                  const rotation = nextObjectRotation(object.rotation);
                  const next = { ...object, rotation };
                  applyPlacedObjectPreview(next);
                  queuePlacedObjectTransform(next, object, "Orientação salva.");
                }}
                type="button"
              >
                Girar
              </button>
              {movingObjectId && (
                <p role="status">
                  Arraste o objeto para uma posição válida e solte para
                  confirmar.
                </p>
              )}
            </section>
          )}
          {placementNotice && (
            <p
              aria-live="polite"
              className={`library-room-notice library-placement-toast${
                placementNoticeExiting
                  ? " library-placement-toast--exiting"
                  : ""
              }`}
              role="status"
            >
              {placementNotice}
            </p>
          )}
          {speechBubble && (
            <LibrarySpeechBubble
              anchor={speechAnchor}
              dialogue={speechBubble}
              onClose={closeSpeechBubble}
            />
          )}
          <button
            aria-label="Abrir resumo da Biblioteca"
            className="library-summary-trigger"
            onClick={() => {
              setSpeechBubble(null);
              setSheetMode("summary");
            }}
            ref={summaryButtonRef}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
          <nav aria-label="Explorar salas" className="library-room-explorer">
            <button
              aria-label="Sala anterior"
              disabled={
                state.rooms.findIndex(
                  (room) => room.roomId === activeRoomId,
                ) === 0
              }
              onClick={() => {
                const index = state.rooms.findIndex(
                  (room) => room.roomId === activeRoomId,
                );
                const previous = state.rooms[index - 1];
                if (previous) requestRoom(previous.roomId);
              }}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <p aria-live="polite">
              <strong>{ROOM_NAMES[activeRoomId]}</strong>
              <span>Deslize para explorar</span>
            </p>
            <button
              aria-label="Próxima sala"
              disabled={
                state.rooms.findIndex(
                  (room) => room.roomId === activeRoomId,
                ) ===
                state.rooms.length - 1
              }
              onClick={() => {
                const index = state.rooms.findIndex(
                  (room) => room.roomId === activeRoomId,
                );
                const next = state.rooms[index + 1];
                if (next) requestRoom(next.roomId);
              }}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </nav>
          {roomNotice && (
            <p className="library-room-notice" role="status">
              {roomNotice}
            </p>
          )}
          {sheetMode && (
            <LibraryBottomSheet
              mode={sheetMode}
              onClose={closeSheet}
              period={period}
              recentBookTitle={state.recentBookTitle}
              productSummary={state.productSummary}
              room={
                sheetMode === "room"
                  ? state.rooms.find((room) => room.roomId === activeRoomId)
                  : undefined
              }
              viewModel={state.viewModel}
            />
          )}
          <details className="library-accessible-summary" open={canvasFailed}>
            <summary>Resumo acessível</summary>
            <LibraryTextAlternative
              creatureButtonRef={creatureButtonRef}
              librarianButtonRef={librarianButtonRef}
              onInteraction={handleInteraction}
              shelfButtonRef={shelfButtonRef}
              viewModel={state.viewModel}
              resident={RESIDENT_CATALOG.find(
                (candidate) => candidate.homeRoomId === activeRoomId,
              )}
              residentButtonRef={residentButtonRef}
            />
          </details>
          {diagnostics && (
            <div className="library-atmosphere-diagnostics">
              <label htmlFor="library-atmosphere-override">
                Pré-visualizar período
              </label>
              <select
                id="library-atmosphere-override"
                onChange={(event) =>
                  setAtmosphereOverride(
                    event.target.value as AtmosphereOverride,
                  )
                }
                value={atmosphereOverride}
              >
                <option value="automatic">Automático</option>
                {(["morning", "afternoon", "night", "lateNight"] as const).map(
                  (value) => (
                    <option key={value} value={value}>
                      {LIBRARY_PERIOD_LABELS[value]}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>
      )}
      {diagnostics && (
        <LibraryVisualDiagnosticsPanel diagnostics={diagnostics} />
      )}
    </section>
  );
}
