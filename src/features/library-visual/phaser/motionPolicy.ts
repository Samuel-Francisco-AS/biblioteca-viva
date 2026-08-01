import type { LibrarySceneLayoutMode, SceneLayoutSize } from "./sceneLayout";

export type ResizeMotionAction = "ignore" | "remap" | "replace-all";

export function resizeMotionAction(
  previousSize: SceneLayoutSize | undefined,
  previousMode: LibrarySceneLayoutMode | undefined,
  nextSize: SceneLayoutSize,
  nextMode: LibrarySceneLayoutMode,
): ResizeMotionAction {
  if (
    previousSize?.height === nextSize.height &&
    previousSize.width === nextSize.width
  ) {
    return "ignore";
  }
  if (previousMode !== undefined && previousMode !== nextMode) {
    return "replace-all";
  }
  return "remap";
}

export function highlightMotionNeedsReplacement(
  previousPresent: boolean,
  nextPresent: boolean,
): boolean {
  return previousPresent !== nextPresent;
}
