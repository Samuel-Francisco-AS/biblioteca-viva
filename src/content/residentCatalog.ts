import type { ResidentDefinition } from "../domain";

export interface ResidentCatalogEntry extends ResidentDefinition {
  readonly nameKey: string;
  readonly dialogueProfileId: string;
  readonly visualDefinition: {
    readonly body: number;
    readonly detail: number;
    readonly accent: number;
  };
  readonly routineDefinition: {
    readonly states: readonly ResidentRoutineState[];
    readonly anchors: readonly ResidentAnchor[];
  };
}

export type ResidentRoutineState =
  "idle" | "working" | "organizing" | "resting" | "walking" | "observing";
export type ResidentAnchor =
  "home" | "work" | "shelf" | "rest" | "door" | "special";

const resident = (input: ResidentCatalogEntry): ResidentCatalogEntry =>
  Object.freeze(input);

export const RESIDENT_CATALOG: readonly ResidentCatalogEntry[] = Object.freeze([
  resident({
    id: "librarian",
    homeRoomId: "main-library",
    nameKey: "resident.librarian.name",
    dialogueProfileId: "librarian",
    visualDefinition: { body: 0x765a8c, detail: 0xd6c4a4, accent: 0x4b352b },
    routineDefinition: {
      states: ["organizing", "working", "observing", "resting"],
      anchors: ["home", "work", "shelf", "rest"],
    },
  }),
  resident({
    id: "researcher",
    homeRoomId: "study-room",
    nameKey: "resident.researcher.name",
    dialogueProfileId: "researcher",
    visualDefinition: { body: 0x667955, detail: 0xb58b61, accent: 0x8ca47d },
    routineDefinition: {
      states: ["working", "organizing", "observing", "resting"],
      anchors: ["work", "shelf", "special", "rest"],
    },
  }),
  resident({
    id: "projectionist",
    homeRoomId: "projection-room",
    nameKey: "resident.projectionist.name",
    dialogueProfileId: "projectionist",
    visualDefinition: { body: 0x292631, detail: 0x9b5a48, accent: 0xd0955e },
    routineDefinition: {
      states: ["working", "observing", "walking", "resting"],
      anchors: ["work", "special", "door", "rest"],
    },
  }),
  resident({
    id: "training-keeper",
    homeRoomId: "training-room",
    nameKey: "resident.training-keeper.name",
    dialogueProfileId: "training-keeper",
    visualDefinition: { body: 0x536b70, detail: 0xb4a071, accent: 0x879b8b },
    routineDefinition: {
      states: ["working", "observing", "walking", "resting"],
      anchors: ["home", "special", "work", "rest"],
    },
  }),
  resident({
    id: "scribe",
    homeRoomId: "office",
    nameKey: "resident.scribe.name",
    dialogueProfileId: "scribe",
    visualDefinition: { body: 0x4c5058, detail: 0x9b8063, accent: 0xb7a77f },
    routineDefinition: {
      states: ["working", "organizing", "observing", "resting"],
      anchors: ["work", "shelf", "special", "rest"],
    },
  }),
]);

export function residentForRoom(
  roomId: ResidentCatalogEntry["homeRoomId"],
): ResidentCatalogEntry | undefined {
  return RESIDENT_CATALOG.find((resident) => resident.homeRoomId === roomId);
}
