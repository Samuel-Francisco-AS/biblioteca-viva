import { useEffect, useRef, useState } from "react";

import type {
  LibraryInteraction,
  LibraryVisualFactoryModule,
  LibraryVisualGame,
  LibraryVisualSize,
  LibraryViewModel,
} from "./contracts";
import type { LibraryVisualDiagnostics } from "./diagnostics";

const verticalPanStyle = { touchAction: "pan-y" } as const;

interface LibraryVisualHostProps {
  readonly diagnostics?: LibraryVisualDiagnostics;
  readonly loadFactory?: () => Promise<LibraryVisualFactoryModule>;
  readonly onInteraction?: (interaction: LibraryInteraction) => void;
  readonly projection: LibraryViewModel;
  readonly reducedMotion?: boolean;
}

const loadPhaserFactory = () => import("./phaser/createPhaserGame");

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
  onInteraction,
  projection,
  reducedMotion = false,
}: LibraryVisualHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generationRef = useRef(0);
  const gameRef = useRef<LibraryVisualGame | undefined>(undefined);
  const latestInteractionRef = useRef(onInteraction);
  const latestProjectionRef = useRef(projection);
  const latestReducedMotionRef = useRef(reducedMotion);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    latestInteractionRef.current = onInteraction;
    latestProjectionRef.current = projection;
    latestReducedMotionRef.current = reducedMotion;
    gameRef.current?.setInteractionHandler(onInteraction);
    gameRef.current?.updateProjection(projection);
    gameRef.current?.setReducedMotion(reducedMotion);
  }, [onInteraction, projection, reducedMotion]);

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

    diagnostics?.transition("creating", generation, 0);

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
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", pauseOrResume);
      const didDestroyInstance = Boolean(game);
      if (game) {
        game.destroy();
        game = undefined;
      }
      gameRef.current = undefined;
      return didDestroyInstance;
    };

    document.addEventListener("visibilitychange", pauseOrResume);
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", resize);
    } else {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    }

    void loadFactory()
      .then(({ createLibraryVisualGame }) => {
        if (destroyed) return undefined;
        requestedCreationSize = sizeFromContainer(container);
        return createLibraryVisualGame({
          container,
          onInteraction: (interaction) => {
            if (!destroyed) latestInteractionRef.current?.(interaction);
          },
          onSceneEvent: (event) => {
            if (!destroyed && event.type === "scene-failed") setFailed(true);
          },
          projection: latestProjectionRef.current,
          reducedMotion: latestReducedMotionRef.current,
          size: requestedCreationSize,
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
        lastAppliedSize = requestedCreationSize;
        createdGame.setInteractionHandler(latestInteractionRef.current);
        createdGame.updateProjection(latestProjectionRef.current);
        diagnostics?.transition("ready", generation, 1, true);
        resize();
        pauseOrResume();
      })
      .catch(() => {
        if (destroyed) return;
        cleanup();
        setFailed(true);
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
  }, [diagnostics, loadFactory]);

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
      style={verticalPanStyle}
    />
  );
}
