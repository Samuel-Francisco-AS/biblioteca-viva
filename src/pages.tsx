import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type {
  BookEntry,
  ReachedMilestone,
  RoomId,
  RoomProgress,
} from "./domain";
import { ROOM_NAMES } from "./content";
import type {
  AudioPort,
  DialoguePort,
  LocalizedDialogue,
  StatisticsSnapshot,
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
  };
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
  const summaryButtonRef = useRef<HTMLButtonElement>(null);
  const shelfButtonRef = useRef<HTMLButtonElement>(null);
  const librarianButtonRef = useRef<HTMLButtonElement>(null);
  const creatureButtonRef = useRef<HTMLButtonElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [sheetMode, setSheetMode] = useState<LibrarySheetMode | null>(null);
  const [speechBubble, setSpeechBubble] = useState<LocalizedDialogue | null>(
    null,
  );
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
  const [state, setState] = useState<LibraryPageState>(() =>
    application
      ? { kind: "loading" }
      : {
          kind: "error",
          message: "Não foi possível iniciar o armazenamento local.",
        },
  );

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
    ]).then(
      ([books, milestones, statistics, rooms]) => {
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
            projectionInput(books, milestones, pendingDecorationUnlock),
          ),
          rooms,
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
    event: "creature.interaction" | "librarian.interaction",
  ) {
    if (!application) return;
    const request = dialogueRequest.current + 1;
    dialogueRequest.current = request;
    const dialogue = await application.dialogue.select(event);
    if (request !== dialogueRequest.current) return;
    setSpeechBubble(dialogue);
  }

  function handleInteraction(interaction: LibraryInteraction) {
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
      setSheetMode("shelf");
    }
    if (interaction.type === "LibrarianSelected") {
      application?.audio?.emit({ type: "LibrarianSelected" });
      void openCharacterDialogue("librarian.interaction");
    }
    if (interaction.type === "CreatureSelected") {
      application?.audio?.emit({ type: "CreatureSelected" });
      void openCharacterDialogue("creature.interaction");
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
          <section aria-label="Salas" className="room-selector">
            {state.rooms.map((room) => (
              <button
                aria-current={room.roomId === activeRoomId ? "true" : undefined}
                className="room-selector__item"
                key={room.roomId}
                onClick={() => requestRoom(room.roomId)}
                type="button"
              >
                <strong>{ROOM_NAMES[room.roomId]}</strong>
                <span>
                  {room.unlocked
                    ? `Estágio ${room.highestReachedStage}`
                    : "Bloqueada"}
                </span>
              </button>
            ))}
            {roomNotice && <p role="status">{roomNotice}</p>}
          </section>
          <LibraryVisualHost
            diagnostics={diagnostics}
            onAvailabilityChange={handleAvailabilityChange}
            onInteraction={handleInteraction}
            period={period}
            projection={state.viewModel}
            reducedMotion={reducedMotion}
            room={{
              roomId: activeRoomId,
              unlocked: true,
              stage:
                state.rooms.find((room) => room.roomId === activeRoomId)
                  ?.highestReachedStage ?? 1,
              dayPeriod: period,
              reducedMotion,
              highContrast,
            }}
          />
          {speechBubble && (
            <LibrarySpeechBubble
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
          {sheetMode && (
            <LibraryBottomSheet
              mode={sheetMode}
              onClose={closeSheet}
              period={period}
              recentBookTitle={state.recentBookTitle}
              productSummary={state.productSummary}
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
