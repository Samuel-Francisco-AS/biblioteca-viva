import Phaser from "phaser";

import type {
  LibraryInteraction,
  LibraryVisualGameFactory,
  LibraryVisualSize,
} from "../contracts";
import { InitialLibraryScene } from "./InitialLibraryScene";
import { LIBRARY_CANVAS_TOUCH_ACTION } from "./roomConfig";

function gameConfig(
  container: HTMLElement,
  size: LibraryVisualSize,
  scene: InitialLibraryScene,
): Phaser.Types.Core.GameConfig {
  return {
    banner: false,
    backgroundColor: "#09100f",
    height: size.height,
    input: {
      mouse: { preventDefaultWheel: false },
      touch: { capture: false },
    },
    parent: container,
    scene: [scene],
    scale: {
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.RESIZE,
    },
    type: Phaser.AUTO,
    width: size.width,
  };
}

export const createLibraryVisualGame: LibraryVisualGameFactory = ({
  container,
  onInteraction,
  onSceneEvent,
  period,
  projection,
  reducedMotion,
  room,
  size,
}) => {
  let game: Phaser.Game | undefined;
  let destroyed = false;
  const scene = new InitialLibraryScene(
    projection,
    reducedMotion,
    room,
    onInteraction,
    period,
  );
  try {
    game = new Phaser.Game(gameConfig(container, size, scene));
    game.canvas.style.touchAction = LIBRARY_CANVAS_TOUCH_ACTION;
    onSceneEvent({ type: "scene-ready" });
    return Promise.resolve({
      destroy: () => {
        if (destroyed) return;
        destroyed = true;
        game?.destroy(true);
        game = undefined;
      },
      pause: () => {
        if (!destroyed) {
          scene.pauseMotion();
          game?.loop.sleep();
        }
      },
      resize: (nextSize) => {
        if (!destroyed) game?.scale.resize(nextSize.width, nextSize.height);
      },
      resume: () => {
        if (!destroyed) {
          game?.loop.wake();
          scene.resumeMotion();
        }
      },
      runtimeSnapshot: () => scene.runtimeSnapshot(),
      setAtmosphere: (nextPeriod, animate) => {
        if (!destroyed) scene.setAtmosphere(nextPeriod, animate);
      },
      setInteractionHandler: (
        nextHandler: ((interaction: LibraryInteraction) => void) | undefined,
      ) => {
        if (!destroyed) scene.setInteractionHandler(nextHandler);
      },
      setReducedMotion: (nextReducedMotion) => {
        if (!destroyed) scene.setReducedMotion(nextReducedMotion);
      },
      updateProjection: (nextProjection) => {
        if (!destroyed) scene.updateProjection(nextProjection);
      },
      updateRoom: (nextRoom) => {
        if (!destroyed) scene.updateRoom(nextRoom);
      },
    });
  } catch (error: unknown) {
    destroyed = true;
    game?.destroy(true);
    onSceneEvent({ type: "scene-failed" });
    return Promise.reject(
      error instanceof Error
        ? error
        : new Error("Não foi possível criar a visualização da biblioteca."),
    );
  }
};
