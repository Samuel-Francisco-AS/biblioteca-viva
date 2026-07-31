import Phaser from "phaser";

import type {
  LibraryInteraction,
  LibraryVisualGameFactory,
  LibraryVisualSize,
} from "../contracts";
import { InitialLibraryScene } from "./InitialLibraryScene";

function gameConfig(
  container: HTMLElement,
  size: LibraryVisualSize,
  scene: InitialLibraryScene,
): Phaser.Types.Core.GameConfig {
  return {
    banner: false,
    backgroundColor: "#d8c5a3",
    height: size.height,
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
  projection,
  size,
}) => {
  let game: Phaser.Game | undefined;
  let destroyed = false;
  const scene = new InitialLibraryScene(projection, onInteraction);
  try {
    game = new Phaser.Game(gameConfig(container, size, scene));
    onSceneEvent({ type: "scene-ready" });
    return Promise.resolve({
      destroy: () => {
        if (destroyed) return;
        destroyed = true;
        game?.destroy(true);
        game = undefined;
      },
      pause: () => {
        if (!destroyed) game?.loop.sleep();
      },
      resize: (nextSize) => {
        if (!destroyed) game?.scale.resize(nextSize.width, nextSize.height);
      },
      resume: () => {
        if (!destroyed) game?.loop.wake();
      },
      setInteractionHandler: (
        nextHandler: ((interaction: LibraryInteraction) => void) | undefined,
      ) => {
        if (!destroyed) scene.setInteractionHandler(nextHandler);
      },
      updateProjection: (nextProjection) => {
        if (!destroyed) scene.updateProjection(nextProjection);
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
