import type { WorldSessionActivity } from "../../contracts/worldSessionActivity";
import type { NavigationObstacle, Position } from "./inhabitantNavigation";

export interface ReadingOpportunity {
  readonly id: string;
  readonly sessionId: string;
  readonly source: Position;
  readonly physical?: {
    readonly attachedActor?: string;
    readonly approaches: Readonly<
      Partial<
        Record<
          import("./inhabitants").InhabitantKey,
          readonly { readonly position: Position; readonly facing: number }[]
        >
      >
    >;
  };
}
export interface ScrollOpportunity {
  readonly id: string;
  readonly source: Position;
}
/** Inputs sampled by composition AFTER book movement and BEFORE agency motion.
 * No renderer references, transform setters or lease authority cross this boundary.
 * Values are stable for the complete update, including navigation and recovery. */
export interface AgencyEnvironment {
  readonly sessionActivity?: WorldSessionActivity | null;
  readonly physicalObstacles: readonly NavigationObstacle[];
  readonly readingCandidate: ReadingOpportunity | null;
  readonly scrollCandidates: readonly ScrollOpportunity[];
}
export const EMPTY_AGENCY_ENVIRONMENT: AgencyEnvironment = Object.freeze({
  physicalObstacles: Object.freeze([]),
  readingCandidate: null,
  scrollCandidates: Object.freeze([]),
});
