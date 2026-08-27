import type { DecorationId, ResidentId, RoomId, RoomStage } from "../../domain";

export type LibraryVisualHostState =
  "creating" | "ready" | "paused" | "failed" | "destroyed";

export interface LibraryVisualSize {
  readonly height: number;
  readonly width: number;
}

export type LibraryVisualPeriod =
  "lateNight" | "morning" | "afternoon" | "night";

export interface RoomViewModel {
  readonly roomId: RoomId;
  readonly unlocked: boolean;
  readonly stage: RoomStage;
  readonly dayPeriod: LibraryVisualPeriod;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
  readonly unlockedRoomIds?: readonly RoomId[];
}

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
  readonly placedObjects?: readonly import("../../application").PlacedObject[];
  readonly worldStructure?: import("../../application").WorldStructureState;
}

export type LibrarySceneEvent =
  { readonly type: "scene-ready" } | { readonly type: "scene-failed" };

export type LibraryInteraction =
  | { readonly type: "ShelfSelected" }
  | {
      readonly anchor?: { readonly x: number; readonly y: number };
      readonly type: "LibrarianSelected";
    }
  | {
      readonly anchor?: { readonly x: number; readonly y: number };
      readonly type: "CreatureSelected";
    }
  | {
      readonly anchor?: { readonly x: number; readonly y: number };
      readonly residentId: ResidentId;
      readonly roomId: RoomId;
      readonly type: "ResidentInteracted";
    }
  | { readonly roomId: RoomId; readonly type: "RoomRequested" }
  | { readonly entryId: string; readonly type: "HighlightedBookSelected" }
  | {
      readonly decorationId: DecorationId;
      readonly eventId: string;
      readonly type: "DecorationUnlockPresented";
    }
  | { readonly type: "PlacedObjectSelected"; readonly instanceId: string }
  | {
      readonly instanceId: string;
      readonly rotation: import("../../application").ObjectRotation;
      readonly spaceId: "space-a" | "space-b";
      readonly type: "PlacedObjectTransformCommitted";
      readonly x: number;
      readonly y: number;
    }
  | { readonly instanceId: string; readonly type: "StructureSelected" }
  | {
      readonly anchor: { readonly x: number; readonly y: number };
      readonly definitionId: import("../../application").StructureDefinitionId;
      readonly type: "StructurePlacementCommitted";
    }
  | {
      readonly anchor: { readonly x: number; readonly y: number };
      readonly instanceId: string;
      readonly type: "StructureMoveCommitted";
    }
  | {
      readonly cells: readonly { readonly x: number; readonly y: number }[];
      readonly mode: "paint-floor" | "remove-floor";
      readonly type: "FloorCellsCommitted";
    };

export interface ConstructionSceneState {
  readonly active: boolean;
  readonly movingInstanceId?: string;
  readonly placingDefinitionId?: import("../../application").StructureDefinitionId;
  readonly tool:
    "explore" | "select" | "place-structure" | "paint-floor" | "remove-floor";
}

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
  updateRoom(this: void, room: RoomViewModel): void;
  setInteractionHandler(
    this: void,
    onInteraction: ((interaction: LibraryInteraction) => void) | undefined,
  ): void;
  setObjectPlacementMode?(this: void, instanceId: string | undefined): void;
  setConstructionState?(this: void, state: ConstructionSceneState): void;
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
  readonly room: RoomViewModel;
  readonly size: LibraryVisualSize;
  readonly placementModeInstanceId?: string;
  readonly constructionState?: ConstructionSceneState;
}

export type LibraryVisualGameFactory = (
  options: CreateLibraryVisualGameOptions,
) => Promise<LibraryVisualGame>;

export interface LibraryVisualFactoryModule {
  readonly createLibraryVisualGame: LibraryVisualGameFactory;
}
