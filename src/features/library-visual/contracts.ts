export type LibraryVisualHostState =
  "creating" | "ready" | "paused" | "failed" | "destroyed";

export interface LibraryVisualSize {
  readonly height: number;
  readonly width: number;
}

export type LibraryVisualPeriod =
  "lateNight" | "morning" | "afternoon" | "night";

export type ShelfOccupancy = "empty" | "initial" | "growing" | "full";

export type LibraryProgressSummary =
  | { readonly kind: "none" }
  | { readonly currentPage: number; readonly kind: "open" }
  | {
      readonly currentPage: number;
      readonly kind: "bounded";
      readonly totalPages: number;
    };

export interface HighlightedLibraryBook {
  readonly entryId: string;
  readonly progress: LibraryProgressSummary;
  readonly status:
    "planned" | "in_progress" | "paused" | "completed" | "abandoned";
}

/** A serializable, read-only summary consumed by the specialized visual view. */
export interface LibraryViewModel {
  readonly completedBooks: number;
  readonly decorationUnlockAnimation: {
    readonly decorationId: DecorationId;
    readonly eventId: string;
  } | null;
  readonly hasCompletedBook: boolean;
  readonly hasFirstCompletionMilestone: boolean;
  readonly highlightedBook: HighlightedLibraryBook | null;
  readonly inProgressBooks: number;
  readonly roomState: "default";
  readonly shelfOccupancy: ShelfOccupancy;
  readonly shelfVisualGroupCount: number;
  readonly totalBooks: number;
  readonly unlockedDecorationIds: readonly DecorationId[];
}

export type LibrarySceneEvent =
  { readonly type: "scene-ready" } | { readonly type: "scene-failed" };

export type LibraryInteraction =
  | { readonly type: "ShelfSelected" }
  | { readonly type: "LibrarianSelected" }
  | { readonly type: "CreatureSelected" }
  | { readonly entryId: string; readonly type: "HighlightedBookSelected" }
  | {
      readonly decorationId: DecorationId;
      readonly eventId: string;
      readonly type: "DecorationUnlockPresented";
    };

export interface LibraryVisualGame {
  destroy(this: void): void;
  pause(this: void): void;
  resize(this: void, size: LibraryVisualSize): void;
  resume(this: void): void;
  runtimeSnapshot?(this: void): LibraryVisualRuntimeSnapshot;
  setAtmosphere(
    this: void,
    period: LibraryVisualPeriod,
    animate: boolean,
  ): void;
  setReducedMotion(this: void, reducedMotion: boolean): void;
  setInteractionHandler(
    this: void,
    onInteraction: ((interaction: LibraryInteraction) => void) | undefined,
  ): void;
  updateProjection(this: void, projection: LibraryViewModel): void;
}

export interface LibraryVisualRuntimeSnapshot {
  readonly activeTweens: number;
  readonly displayObjects: number;
  readonly fps: number | null;
  readonly interactiveZones: number;
}

export interface CreateLibraryVisualGameOptions {
  readonly container: HTMLElement;
  readonly onInteraction: (interaction: LibraryInteraction) => void;
  readonly onSceneEvent: (event: LibrarySceneEvent) => void;
  readonly period: LibraryVisualPeriod;
  readonly projection: LibraryViewModel;
  readonly reducedMotion: boolean;
  readonly size: LibraryVisualSize;
}

export type LibraryVisualGameFactory = (
  options: CreateLibraryVisualGameOptions,
) => Promise<LibraryVisualGame>;

export interface LibraryVisualFactoryModule {
  readonly createLibraryVisualGame: LibraryVisualGameFactory;
}
import type { DecorationId } from "../../domain";
