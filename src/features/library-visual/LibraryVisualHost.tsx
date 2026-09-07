import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type {
  LibraryInteraction,
  LibraryVisualFactoryModule,
  LibraryVisualGame,
  LibraryVisualPeriod,
  LibraryVisualSize,
  LibraryViewModel,
  RoomViewModel,
  ConstructionSceneState,
} from "./contracts";
import type { LibraryVisualDiagnostics } from "./diagnostics";
import {
  markStartupEvent,
  measureStartupPhase,
  startupNow,
} from "../../startupPerformance";

const worldPanStyle = { touchAction: "none" } as const;

interface LibraryVisualHostProps {
  readonly diagnostics?: LibraryVisualDiagnostics;
  readonly loadFactory?: () => Promise<LibraryVisualFactoryModule>;
  readonly onInteraction?: (interaction: LibraryInteraction) => void;
  readonly onAvailabilityChange?: (available: boolean) => void;
  readonly period?: LibraryVisualPeriod;
  readonly projection: LibraryViewModel;
  readonly reducedMotion?: boolean;
  readonly room?: RoomViewModel;
  readonly placementModeInstanceId?: string;
  readonly constructionState?: ConstructionSceneState;
}

let phaserFactoryPromise: Promise<LibraryVisualFactoryModule> | undefined;

const loadPhaserFactory = () => {
  phaserFactoryPromise ??= import("./phaser/createPhaserGame");
  return phaserFactoryPromise;
};

export function preloadLibraryVisualFactory(): void {
  void loadPhaserFactory().catch(() => undefined);
}

function sizeFromContainer(container: HTMLElement): LibraryVisualSize {
  const bounds = container.getBoundingClientRect();
  return {
    height: Math.max(1, Math.round(bounds.height)),
    width: Math.max(1, Math.round(bounds.width)),
  };
}

function isDocumentHidden(): boolean {
  return document.visibilityState === "hidden";
}

export function LibraryVisualHost({
  diagnostics,
  loadFactory = loadPhaserFactory,
  onAvailabilityChange,
  onInteraction,
  period = "night",
  projection,
  reducedMotion = false,
  room = {
    roomId: "main-library",
    unlocked: true,
    stage: 1,
    dayPeriod: period,
    reducedMotion,
    highContrast: false,
  },
  placementModeInstanceId,
  constructionState = { active: false, tool: "explore" },
}: LibraryVisualHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const gameRef = useRef<LibraryVisualGame | undefined>(undefined);
  const latestInteractionRef = useRef(onInteraction);
  const latestProjectionRef = useRef(projection);
  const latestPeriodRef = useRef(period);
  const latestReducedMotionRef = useRef(reducedMotion);
  const latestRoomRef = useRef(room);
  const latestPlacementModeRef = useRef(placementModeInstanceId);
  const latestConstructionRef = useRef(constructionState);
  const [failed, setFailed] = useState(false);

  latestInteractionRef.current = onInteraction;
  latestProjectionRef.current = projection;
  latestPeriodRef.current = period;
  latestReducedMotionRef.current = reducedMotion;
  latestRoomRef.current = room;
  latestPlacementModeRef.current = placementModeInstanceId;
  latestConstructionRef.current = constructionState;

  useLayoutEffect(() => {
    gameRef.current?.updateProjection(projection);
  }, [projection]);

  useEffect(() => {
    gameRef.current?.setInteractionHandler(onInteraction);
    gameRef.current?.setAtmosphere(period, !reducedMotion);
    gameRef.current?.setReducedMotion(reducedMotion);
    gameRef.current?.updateRoom(room);
    gameRef.current?.setObjectPlacementMode?.(placementModeInstanceId);
    gameRef.current?.setConstructionState?.(constructionState);
  }, [
    onInteraction,
    period,
    placementModeInstanceId,
    constructionState,
    reducedMotion,
    room,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let destroyed = false;
    let paused = false;
    let game: LibraryVisualGame | undefined;
    let lastAppliedSize: LibraryVisualSize | undefined;
    let requestedCreationSize: LibraryVisualSize | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let diagnosticTimer: number | undefined;
    const creationStartedAt = performance.now();

    diagnostics?.transition("creating", generation, 0);
    diagnostics?.resources({
      activeLifecycleListeners: 1,
      activeObservers: 0,
      canvasCount: 0,
      creationDurationMs: null,
    });

    const resize = () => {
      if (destroyed || !game) return;
      const nextSize = sizeFromContainer(container);
      if (
        lastAppliedSize?.height === nextSize.height &&
        lastAppliedSize.width === nextSize.width
      ) {
        return;
      }
      game.resize(nextSize);
      lastAppliedSize = nextSize;
    };
    const pauseOrResume = () => {
      if (destroyed || !game) return;
      if (isDocumentHidden()) {
        if (!paused) {
          game.pause();
          paused = true;
          diagnostics?.transition("paused", generation, 1);
        }
        return;
      }
      if (paused) {
        game.resume();
        paused = false;
        diagnostics?.transition("ready", generation, 1);
      }
    };
    const cleanup = () => {
      if (destroyed) return false;
      destroyed = true;
      resizeObserver?.disconnect();
      if (diagnosticTimer !== undefined) window.clearInterval(diagnosticTimer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", pauseOrResume);
      const didDestroyInstance = Boolean(game);
      if (game) {
        game.destroy();
        game = undefined;
      }
      gameRef.current = undefined;
      diagnostics?.resources({
        activeTweens: null,
        activeLifecycleListeners: 0,
        activeObservers: 0,
        canvasCount: 0,
        displayObjects: null,
        fps: null,
        interactiveZones: null,
      });
      return didDestroyInstance;
    };

    document.addEventListener("visibilitychange", pauseOrResume);
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", resize);
    } else {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      diagnostics?.resources({ activeObservers: 1 });
    }

    const factoryLoadStartedAt = startupNow();
    markStartupEvent("phaser-factory-requested");
    void loadFactory()
      .then(({ createLibraryVisualGame }) => {
        measureStartupPhase("phaser-module-load", factoryLoadStartedAt);
        if (destroyed) return undefined;
        requestedCreationSize = sizeFromContainer(container);
        const phaserStartedAt = startupNow();
        return createLibraryVisualGame({
          container,
          onInteraction: (interaction) => {
            if (!destroyed) latestInteractionRef.current?.(interaction);
          },
          onSceneEvent: (event) => {
            if (!destroyed && event.type === "scene-failed") setFailed(true);
          },
          projection: latestProjectionRef.current,
          period: latestPeriodRef.current,
          reducedMotion: latestReducedMotionRef.current,
          room: latestRoomRef.current,
          size: requestedCreationSize,
          placementModeInstanceId: latestPlacementModeRef.current,
          constructionState: latestConstructionRef.current,
        }).then((createdGame) => {
          measureStartupPhase("phaser-instance", phaserStartedAt);
          return createdGame;
        });
      })
      .then((createdGame) => {
        if (!createdGame) return;
        if (destroyed) {
          createdGame.destroy();
          return;
        }
        game = createdGame;
        gameRef.current = createdGame;
        onAvailabilityChange?.(true);
        lastAppliedSize = requestedCreationSize;
        createdGame.setInteractionHandler(latestInteractionRef.current);
        createdGame.updateProjection(latestProjectionRef.current);
        createdGame.setObjectPlacementMode?.(latestPlacementModeRef.current);
        createdGame.setConstructionState?.(latestConstructionRef.current);
        diagnostics?.transition("ready", generation, 1, true);
        diagnostics?.resources({
          canvasCount: container.querySelectorAll("canvas").length,
          creationDurationMs: Math.max(
            0,
            performance.now() - creationStartedAt,
          ),
        });
        if (diagnostics && createdGame.runtimeSnapshot) {
          const updateRuntimeDiagnostics = () =>
            diagnostics.resources(createdGame.runtimeSnapshot?.() ?? {});
          updateRuntimeDiagnostics();
          diagnosticTimer = window.setInterval(updateRuntimeDiagnostics, 1_000);
        }
        resize();
        pauseOrResume();
      })
      .catch(() => {
        if (destroyed) return;
        cleanup();
        setFailed(true);
        onAvailabilityChange?.(false);
        diagnostics?.transition("failed", generation, 0);
      });

    return () => {
      const didDestroyInstance = cleanup();
      diagnostics?.transition(
        "destroyed",
        generation,
        0,
        false,
        didDestroyInstance,
      );
    };
  }, [diagnostics, loadFactory, onAvailabilityChange]);

  if (failed) {
    return (
      <section className="library-visual-fallback" role="alert">
        <h3>A visualização da biblioteca não pôde ser carregada</h3>
        <p>
          Seus dados continuam disponíveis na Coleção convencional. Você pode
          continuar usando o aplicativo normalmente.
        </p>
      </section>
    );
  }

  return (
    <div
      aria-label="Sala visual da biblioteca"
      aria-describedby="library-text-summary"
      className="library-visual-host"
      ref={containerRef}
      role="img"
      style={worldPanStyle}
      tabIndex={0}
    />
  );
}
