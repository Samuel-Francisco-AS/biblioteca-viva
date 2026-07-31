export type LibraryVisualHostState =
  "creating" | "ready" | "paused" | "failed" | "destroyed";

export interface LibraryVisualSize {
  readonly height: number;
  readonly width: number;
}

export type LibrarySceneEvent =
  { readonly type: "scene-ready" } | { readonly type: "scene-failed" };

/** Reserved for the typed React–scene bridge introduced in Prompt 12. */
export interface FutureLibrarySceneInteraction {
  readonly type: never;
}

export interface LibraryVisualGame {
  destroy(this: void): void;
  pause(this: void): void;
  resize(this: void, size: LibraryVisualSize): void;
  resume(this: void): void;
}

export interface CreateLibraryVisualGameOptions {
  readonly container: HTMLElement;
  readonly onSceneEvent: (event: LibrarySceneEvent) => void;
  readonly size: LibraryVisualSize;
}

export type LibraryVisualGameFactory = (
  options: CreateLibraryVisualGameOptions,
) => Promise<LibraryVisualGame>;

export interface LibraryVisualFactoryModule {
  readonly createLibraryVisualGame: LibraryVisualGameFactory;
}
