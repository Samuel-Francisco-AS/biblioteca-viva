import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type {
  BookEntry,
  ReachedMilestone,
  RoomProgress,
} from "./domain";
import { ROOM_NAMES } from "./content";
import type {
  AudioPort,
  DialoguePort,
  LocalizedDialogue,
  StatisticsSnapshot,
} from "./application";
import {
  ApplicationError,
  DEFAULT_PLACED_OBJECTS,
  nextObjectRotation,
  rotatedStructureDefinitionId,
  type GridPoint,
  type PlacedObject,
  type StructuralInventory,
  type StructuralProgressionSnapshot,
  type WorldStructureState,
} from "./application";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import {
  LibraryBottomSheet,
  type LibrarySheetMode,
} from "./features/library-visual/LibraryBottomSheet";
import { LibraryContextLabel } from "./features/library-visual/LibraryContextLabel";
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
import {
  markStartupEvent,
  measureStartupPhase,
  startupNow,
} from "./startupPerformance";

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
    readonly getStructuralProgress?: {
      execute(): Promise<StructuralProgressionSnapshot>;
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
      readonly structuralProgress?: StructuralProgressionSnapshot;
    };

type AtmosphereOverride = LibraryPeriod | "automatic";

function isStaleStructureConflict(failure: unknown): boolean {
  return (
    failure instanceof ApplicationError &&
    failure.code === "CONFLICT" &&
    failure.context.operation === "structure_stale_state"
  );
}

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
  pendingStructuralUnlock?: import("./features/library-visual/contracts").StructuralUnlockFeedback,
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
    ...(pendingStructuralUnlock && { pendingStructuralUnlock }),
    ...(placedObjects && { placedObjects }),
    ...(worldStructure && { worldStructure }),
  };
}

function loadLibraryPageData(application: LibraryPageApplication) {
  return Promise.all([
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
    application.queries.getStructuralProgress?.execute() ??
      Promise.resolve(undefined),
  ]);
}

export function LibraryPage({
  application,
  onDecorationUnlockPresented,
  pendingDecorationUnlock,
  pendingStructuralUnlock,
  reducedMotion = false,
  highContrast = false,
  onConstructionModeChange,
}: {
  readonly application?: LibraryPageApplication;
  readonly onDecorationUnlockPresented?: (eventId: string) => void;
  readonly pendingDecorationUnlock?: { readonly eventId: string };
  readonly pendingStructuralUnlock?: import("./features/library-visual/contracts").StructuralUnlockFeedback;
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
  readonly onConstructionModeChange?: (active: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
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
  const libraryLoadRef = useRef<{
    readonly application: LibraryPageApplication;
    readonly attempt: number;
    readonly promise: ReturnType<typeof loadLibraryPageData>;
  }>(undefined);
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
  const [atmosphereOverride, setAtmosphereOverride] =
    useState<AtmosphereOverride>("automatic");
  const period =
    atmosphereOverride === "automatic" ? automaticPeriod : atmosphereOverride;
  const handleAvailabilityChange = useCallback((available: boolean) => {
    setCanvasFailed(!available);
    if (!available) setSheetMode("summary");
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
  const [openStructuresToken, setOpenStructuresToken] = useState<string>();
  const [placingStructureDefinitionId, setPlacingStructureDefinitionId] =
    useState<import("./application").StructureDefinitionId>();
  const [movingStructureId, setMovingStructureId] = useState<string>();
  const [selectedStructureId, setSelectedStructureId] = useState<string>();
  const [structurePreviewAnchor, setStructurePreviewAnchor] =
    useState<GridPoint>();
  const [structurePreviewValid, setStructurePreviewValid] = useState(false);
  const [floorPreviewCells, setFloorPreviewCells] = useState<
    readonly GridPoint[]
  >([]);
  const [floorPreviewValid, setFloorPreviewValid] = useState(false);
  const [floorPreviewIssue, setFloorPreviewIssue] =
    useState<import("./application").StructureOperationCode>();
  const [structureBusy, setStructureBusy] = useState(false);
  const mountedRef = useRef(true);
  const structureOperationRef = useRef({ pending: false, token: 0 });
  useEffect(() => {
    onConstructionModeChange?.(constructionMode);
  }, [constructionMode, onConstructionModeChange]);
  useEffect(
    () => () => {
      onConstructionModeChange?.(false);
    },
    [onConstructionModeChange],
  );
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      structureOperationRef.current.token += 1;
    };
  }, []);
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

  function operationIsCurrent(token: number): boolean {
    return mountedRef.current && structureOperationRef.current.token === token;
  }

  function applyStructureState(
    next: WorldStructureState,
    structuralInventory?: StructuralInventory,
    structuralProgress?: StructuralProgressionSnapshot,
  ): void {
    if (!mountedRef.current) return;
    setSelectedStructureId((selected) =>
      selected &&
      !next.placements.some((placement) => placement.instanceId === selected)
        ? undefined
        : selected,
    );
    setState((current) =>
      current.kind === "ready"
        ? {
            ...current,
            viewModel: { ...current.viewModel, worldStructure: next },
            ...(structuralInventory && { structuralInventory }),
            ...(structuralProgress && { structuralProgress }),
          }
        : current,
    );
  }

  function refreshStructuralInventory(token: number): void {
    void application?.queries.getStructuralInventory?.execute().then(
      (structuralInventory) =>
        operationIsCurrent(token) &&
        setState((current) =>
          current.kind === "ready"
            ? { ...current, structuralInventory }
            : current,
        ),
      () => undefined,
    );
  }

  async function refreshStructureState(token: number): Promise<boolean> {
    const getStructure = application?.queries.getWorldStructure;
    if (!getStructure) return false;
    const [structure, structuralInventory, structuralProgress] =
      await Promise.all([
        getStructure.execute(),
        application?.queries.getStructuralInventory?.execute() ??
          Promise.resolve(undefined),
        application?.queries.getStructuralProgress?.execute() ??
          Promise.resolve(undefined),
      ]);
    if (!operationIsCurrent(token) || !structure) return false;
    applyStructureState(structure, structuralInventory, structuralProgress);
    return true;
  }

  function applySuccessfulStructureState(
    next: WorldStructureState,
    token: number,
  ): void {
    if (!operationIsCurrent(token)) return;
    applyStructureState(next);
    refreshStructuralInventory(token);
  }

  function runStructure(
    operation: () => Promise<
      WorldStructureState | { readonly state: WorldStructureState }
    >,
    success: string,
    callbacks?: { readonly onSuccess?: (state: WorldStructureState) => void },
  ): void {
    if (structureOperationRef.current.pending) return;
    const token = structureOperationRef.current.token + 1;
    structureOperationRef.current = { pending: true, token };
    setStructureBusy(true);
    void operation()
      .then(
        (result) => {
          if (!operationIsCurrent(token)) return;
          const next = "state" in result ? result.state : result;
          applySuccessfulStructureState(next, token);
          callbacks?.onSuccess?.(next);
          showPlacementNotice(success);
        },
        async (failure: unknown) => {
          if (!operationIsCurrent(token)) return;
          if (isStaleStructureConflict(failure)) {
            try {
              const refreshed = await refreshStructureState(token);
              if (refreshed && operationIsCurrent(token)) {
                showPlacementNotice(
                  failure instanceof ApplicationError
                    ? failure.message
                    : presentApplicationError(failure).message,
                );
                return;
              }
            } catch (refreshFailure: unknown) {
              if (!operationIsCurrent(token)) return;
              showPlacementNotice(
                presentApplicationError(refreshFailure).message,
              );
              return;
            }
          }
          if (!operationIsCurrent(token)) return;
          showPlacementNotice(presentApplicationError(failure).message);
        },
      )
      .finally(() => {
        if (structureOperationRef.current.token === token) {
          structureOperationRef.current.pending = false;
          setStructureBusy(false);
        }
      });
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
        reducedMotion ? 0 : 220,
      );
    }, 2_500);
    return () => window.clearTimeout(placementNoticeTimer.current);
  }, [placementNotice, reducedMotion]);

  useEffect(() => {
    if (!application) return;
    let active = true;
    const preparationStartedAt = performance.now();
    if (
      libraryLoadRef.current?.application !== application ||
      libraryLoadRef.current.attempt !== attempt
    ) {
      const dataReadStartedAt = startupNow();
      markStartupEvent("library-data-read-requested");
      libraryLoadRef.current = {
        application,
        attempt,
        promise: loadLibraryPageData(application).then((loaded) => {
          measureStartupPhase("dexie-library-read", dataReadStartedAt);
          return loaded;
        }),
      };
    }
    void libraryLoadRef.current.promise.then(
      ([
        books,
        milestones,
        statistics,
        rooms,
        placedObjects,
        worldStructure,
        structuralInventory,
        structuralProgress,
      ]) => {
        const projectionStartedAt = startupNow();
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
        const viewModel = projectionService.project(
          projectionInput(
            books,
            milestones,
            pendingDecorationUnlock,
            pendingStructuralUnlock,
            placedObjects,
            worldStructure,
          ),
        );
        measureStartupPhase("library-projection", projectionStartedAt);
        setState({
          kind: "ready",
          ...(recent && { recentBookTitle: recent.title }),
          viewModel,
          rooms,
          placedObjects,
          ...(structuralInventory && { structuralInventory }),
          ...(structuralProgress && { structuralProgress }),
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
    pendingStructuralUnlock,
    projectionService,
  ]);

  useEffect(() => {
    const token = (
      location.state as { readonly openStructuralConstruction?: string } | null
    )?.openStructuralConstruction;
    if (!token || state.kind !== "ready") return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setConstructionMode(true);
      setConstructionTool("explore");
      setPlacingStructureDefinitionId(undefined);
      setMovingStructureId(undefined);
      setSelectedStructureId(undefined);
      setStructurePreviewAnchor(undefined);
      setStructurePreviewValid(false);
      setFloorPreviewCells([]);
      setOpenStructuresToken(token);
      setSheetMode(null);
      setSpeechBubble(null);
      setSelectedObjectId(undefined);
      setObjectActionsObjectId(undefined);
      setObjectActionsClosing(false);
      void navigate(location.pathname, { replace: true, state: null });
    });
    return () => {
      active = false;
    };
  }, [location.pathname, location.state, navigate, state.kind]);

  useEffect(() => {
    if (!application || state.kind !== "ready") return;
    void application.dialogue.enterLibrary({
      completedBooks: state.viewModel.completedBooks,
      inProgressBooks: state.viewModel.inProgressBooks,
      totalBooks: state.viewModel.totalBooks,
    });
  }, [application, state]);

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

  function clearConstructionPreview(): void {
    setStructurePreviewAnchor(undefined);
    setStructurePreviewValid(false);
    setFloorPreviewCells([]);
    setFloorPreviewValid(false);
    setFloorPreviewIssue(undefined);
  }

  function cancelConstructionAction(): void {
    const returnToSelection = Boolean(movingStructureId && selectedStructureId);
    setPlacingStructureDefinitionId(undefined);
    setMovingStructureId(undefined);
    clearConstructionPreview();
    setConstructionTool(returnToSelection ? "select" : "explore");
  }

  function confirmConstructionAction(): void {
    if (state.kind !== "ready" || !state.viewModel.worldStructure) return;
    const revision = state.viewModel.worldStructure.revision;
    if (
      constructionTool === "place-structure" &&
      structurePreviewAnchor &&
      structurePreviewValid &&
      placingStructureDefinitionId &&
      application?.commands?.placeStructure
    ) {
      runStructure(
        () =>
          application.commands!.placeStructure!.execute({
            anchor: structurePreviewAnchor,
            definitionId: placingStructureDefinitionId,
            expectedRevision: revision,
          }),
        "Peça colocada.",
        {
          onSuccess: () => {
            setPlacingStructureDefinitionId(undefined);
            setSelectedStructureId(undefined);
            clearConstructionPreview();
            setConstructionTool("explore");
          },
        },
      );
      return;
    }
    if (
      constructionTool === "place-structure" &&
      structurePreviewAnchor &&
      structurePreviewValid &&
      movingStructureId &&
      application?.commands?.moveStructure
    ) {
      runStructure(
        () =>
          application.commands!.moveStructure!.execute({
            anchor: structurePreviewAnchor,
            expectedRevision: revision,
            instanceId: movingStructureId,
          }),
        "Peça movida.",
        {
          onSuccess: () => {
            setMovingStructureId(undefined);
            clearConstructionPreview();
            setConstructionTool("select");
          },
        },
      );
      return;
    }
    if (
      (constructionTool === "paint-floor" ||
        constructionTool === "remove-floor") &&
      floorPreviewCells.length > 0 &&
      floorPreviewValid
    ) {
      const command =
        constructionTool === "paint-floor"
          ? application?.commands?.addFloorCells
          : application?.commands?.removeFloorCells;
      if (!command) return;
      runStructure(
        () =>
          command.execute({
            cells: floorPreviewCells,
            expectedRevision: revision,
          }),
        constructionTool === "paint-floor"
          ? "Piso aplicado."
          : "Piso removido.",
        {
          onSuccess: () => {
            clearConstructionPreview();
            setConstructionTool("explore");
          },
        },
      );
    }
  }

  function rotatePlacementPreview(): void {
    if (placingStructureDefinitionId) {
      const rotated = rotatedStructureDefinitionId(
        placingStructureDefinitionId,
      );
      if (!rotated) return;
      setPlacingStructureDefinitionId(rotated);
      setStructurePreviewValid(false);
      return;
    }
    if (state.kind !== "ready") return;
    const moving = state.viewModel.worldStructure?.placements.find(
      (placement) => placement.instanceId === movingStructureId,
    );
    const revision = state.viewModel.worldStructure?.revision;
    if (!moving || !revision || !application?.commands?.rotateStructure) return;
    runStructure(
      () =>
        application.commands!.rotateStructure!.execute({
          expectedRevision: revision,
          instanceId: moving.instanceId,
        }),
      "Orientação atualizada.",
    );
  }

  function handleInteraction(interaction: LibraryInteraction) {
    if (interaction.type === "StructurePreviewChanged") {
      if (!constructionMode) return;
      setStructurePreviewAnchor(interaction.anchor);
      setStructurePreviewValid(interaction.valid);
      return;
    }
    if (interaction.type === "FloorPreviewChanged") {
      if (!constructionMode) return;
      setFloorPreviewCells(interaction.cells);
      setFloorPreviewValid(interaction.valid);
      setFloorPreviewIssue(interaction.issue);
      return;
    }
    if (interaction.type === "StructureSelected") {
      if (!constructionMode || state.kind !== "ready") return;
      if (
        state.viewModel.worldStructure?.placements.some(
          (placement) => placement.instanceId === interaction.instanceId,
        )
      ) {
        setSelectedStructureId(interaction.instanceId);
        setPlacingStructureDefinitionId(undefined);
        setMovingStructureId(undefined);
        setStructurePreviewAnchor(undefined);
        setStructurePreviewValid(false);
      } else setSelectedStructureId(undefined);
      return;
    }
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
    if (interaction.type === "DecorationUnlockPresented") {
      onDecorationUnlockPresented?.(interaction.eventId);
      return;
    }
    if (interaction.type === "ShelfSelected") {
      dialogueRequest.current += 1;
      application?.audio?.emit({ type: "ShelfSelected" });
      setSpeechBubble(null);
      setSheetMode("shelf");
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
        <div
          className="library-stage"
          data-construction-mode={constructionMode}
          data-period={period}
        >
          <LibraryVisualHost
            diagnostics={diagnostics}
            onAvailabilityChange={handleAvailabilityChange}
            onInteraction={handleInteraction}
            period={period}
            projection={state.viewModel}
            placementModeInstanceId={movingObjectId}
            constructionState={{
              active: constructionMode,
              floorAvailable:
                state.structuralInventory?.available[
                  "structure-family.floor.wood"
                ] ?? 0,
              ...(floorPreviewCells.length > 0 && { floorPreviewCells }),
              ...(movingStructureId && { movingInstanceId: movingStructureId }),
              ...(placingStructureDefinitionId && {
                placingDefinitionId: placingStructureDefinitionId,
              }),
              ...(structurePreviewAnchor && {
                previewAnchor: structurePreviewAnchor,
              }),
              ...(selectedStructureId && {
                selectedInstanceId: selectedStructureId,
              }),
              tool: constructionTool,
            }}
            reducedMotion={reducedMotion}
            room={{
              roomId: "main-library",
              unlocked: true,
              stage:
                state.rooms.find((room) => room.roomId === "main-library")
                  ?.highestReachedStage ?? 1,
              unlockedRoomIds: state.rooms
                .filter((room) => room.unlocked)
                .map((room) => room.roomId),
              dayPeriod: period,
              reducedMotion,
              highContrast,
            }}
          />
          {!constructionMode && (
            <>
              <LibraryContextLabel
                periodLabel={LIBRARY_PERIOD_LABELS[period].toLocaleLowerCase(
                  "pt-BR",
                )}
                reducedMotion={reducedMotion}
                roomName={ROOM_NAMES["main-library"]}
              />
              <p className="visually-hidden" aria-live="polite">
                Sala atual: {ROOM_NAMES["main-library"]}. Período visual:{" "}
                {LIBRARY_PERIOD_LABELS[period]}.
              </p>
            </>
          )}
          {!constructionMode && state.viewModel.worldStructure && (
            <button
              className="button button--primary library-construction-trigger"
              onClick={() => {
                setConstructionMode(true);
                setConstructionTool("explore");
                setPlacingStructureDefinitionId(undefined);
                setMovingStructureId(undefined);
                setSelectedStructureId(undefined);
                clearConstructionPreview();
                setSheetMode(null);
                setSpeechBubble(null);
                closeObjectActions();
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
                busy={structureBusy}
                canRotatePlacement={Boolean(
                  rotatedStructureDefinitionId(
                    placingStructureDefinitionId ??
                      state.viewModel.worldStructure.placements.find(
                        (placement) =>
                          placement.instanceId === movingStructureId,
                      )?.definitionId ??
                      "architecture.floor.wood-01",
                  ),
                )}
                floorPreviewCount={floorPreviewCells.length}
                floorPreviewIssue={floorPreviewIssue}
                floorPreviewValid={floorPreviewValid}
                hasValidStructurePreview={structurePreviewValid}
                inventory={state.structuralInventory}
                onCancelAction={cancelConstructionAction}
                onConfirmAction={confirmConstructionAction}
                onExit={() => {
                  setConstructionMode(false);
                  setConstructionTool("explore");
                  setPlacingStructureDefinitionId(undefined);
                  setMovingStructureId(undefined);
                  setSelectedStructureId(undefined);
                  clearConstructionPreview();
                  showPlacementNotice("Modo Construção encerrado.");
                }}
                onMove={(placement) => {
                  setMovingStructureId(placement.instanceId);
                  setPlacingStructureDefinitionId(undefined);
                  setStructurePreviewAnchor(placement.anchor);
                  setStructurePreviewValid(true);
                  setConstructionTool("place-structure");
                }}
                onPlace={(definitionId) => {
                  setPlacingStructureDefinitionId(definitionId);
                  setMovingStructureId(undefined);
                  setSelectedStructureId(undefined);
                  setStructurePreviewAnchor(undefined);
                  setStructurePreviewValid(false);
                  setConstructionTool("place-structure");
                }}
                onRemove={(placement) =>
                  runStructure(
                    () =>
                      application.commands!.storeStructure!.execute({
                        expectedRevision:
                          state.viewModel.worldStructure!.revision,
                        instanceId: placement.instanceId,
                      }),
                    "Peça removida e devolvida ao inventário.",
                    {
                      onSuccess: () => {
                        setSelectedStructureId(undefined);
                        setConstructionTool("explore");
                      },
                    },
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
                onRotatePlacement={rotatePlacementPreview}
                onToolChange={(tool) => {
                  clearConstructionPreview();
                  setConstructionTool(tool);
                }}
                openStructuresToken={openStructuresToken}
                placementKind={
                  movingStructureId
                    ? "move"
                    : placingStructureDefinitionId
                      ? "place"
                      : undefined
                }
                selectedInstanceId={selectedStructureId}
                onSelectionChange={setSelectedStructureId}
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
          {!constructionMode && speechBubble && (
            <LibrarySpeechBubble
              anchor={speechAnchor}
              dialogue={speechBubble}
              onClose={closeSpeechBubble}
            />
          )}
          {!constructionMode && (
            <button
              aria-label="Abrir resumo da Biblioteca"
              className="button button--secondary library-summary-trigger"
              onClick={() => {
                setSpeechBubble(null);
                setSheetMode("summary");
              }}
              ref={summaryButtonRef}
              type="button"
            >
              Resumo
            </button>
          )}
          {!constructionMode && sheetMode && sheetMode !== "summary" && (
            <LibraryBottomSheet
              mode={sheetMode}
              onClose={closeSheet}
              period={period}
              recentBookTitle={state.recentBookTitle}
              productSummary={state.productSummary}
              viewModel={state.viewModel}
            />
          )}
          {!constructionMode && sheetMode === "summary" && (
            <section
              aria-labelledby="library-accessible-panel-title"
              className="library-bottom-sheet library-accessible-panel"
              onKeyDown={(event) => {
                if (event.key === "Escape") closeSheet();
              }}
              role="dialog"
            >
              <div aria-hidden="true" className="library-bottom-sheet__handle" />
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Alternativa ao cenário visual</p>
                  <h2 id="library-accessible-panel-title">
                    Resumo da Biblioteca
                  </h2>
                </div>
                <button
                  aria-label="Fechar resumo da Biblioteca"
                  autoFocus
                  className="drawer-close"
                  onClick={closeSheet}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <LibraryTextAlternative
                creatureButtonRef={creatureButtonRef}
                librarianButtonRef={librarianButtonRef}
                onInteraction={handleInteraction}
                shelfButtonRef={shelfButtonRef}
                viewModel={state.viewModel}
                residentButtonRef={residentButtonRef}
              />
              {canvasFailed && (
                <p role="status">
                  O cenário visual está indisponível; seus dados permanecem
                  acessíveis neste resumo.
                </p>
              )}
            </section>
          )}
          {!constructionMode && diagnostics && (
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
