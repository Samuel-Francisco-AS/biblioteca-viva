import Phaser from "phaser";

import type { LibraryVisualGameFactory, LibraryVisualSize } from "../contracts";
import { InitialLibraryScene } from "./InitialLibraryScene";

function gameConfig(
  container: HTMLElement,
  size: LibraryVisualSize,
): Phaser.Types.Core.GameConfig {
  return {
    banner: false,
    backgroundColor: "#d8c5a3",
    height: size.height,
    parent: container,
    scene: [InitialLibraryScene],
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
  onSceneEvent,
  size,
}) => {
  let game: Phaser.Game | undefined;
  try {
    game = new Phaser.Game(gameConfig(container, size));
    onSceneEvent({ type: "scene-ready" });
    return Promise.resolve({
      destroy: () => game?.destroy(true),
      pause: () => game?.loop.sleep(),
      resize: (nextSize) => game?.scale.resize(nextSize.width, nextSize.height),
      resume: () => game?.loop.wake(),
    });
  } catch (error: unknown) {
    game?.destroy(true);
    onSceneEvent({ type: "scene-failed" });
    return Promise.reject(
      error instanceof Error
        ? error
        : new Error("Não foi possível criar a visualização da biblioteca."),
    );
  }
};
