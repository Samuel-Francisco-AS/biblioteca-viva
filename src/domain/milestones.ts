import type { DomainEvent } from "./events";

export const MILESTONE_ID = Object.freeze({
  firstBook: "milestone.first-book",
  firstCompletedBook: "milestone.first-completed-book",
  firstNote: "milestone.first-note",
  firstQuote: "milestone.first-quote",
  firstMovie: "milestone.first-movie",
  firstSeries: "milestone.first-series",
  firstStudy: "milestone.first-study",
  firstPhysicalActivity: "milestone.first-physical-activity",
  firstWork: "milestone.first-work",
  firstSession: "milestone.first-session",
} as const);

export const MILESTONE_IDS = Object.freeze(Object.values(MILESTONE_ID));
export type MilestoneId = (typeof MILESTONE_IDS)[number];
export type MilestoneSourceEventType = Exclude<
  DomainEvent["type"],
  "MilestoneReached"
>;

export type MilestoneFact =
  | "totalBooks"
  | "totalMovies"
  | "totalSeries"
  | "totalStudies"
  | "totalPhysicalActivities"
  | "totalWorkEntries"
  | "totalSessions"
  | "totalNotes"
  | "totalQuotes"
  | "completedBooks";

export interface MilestoneCondition {
  readonly fact: MilestoneFact;
  readonly operator: "gte";
  readonly value: number;
}

export interface MilestoneDefinition {
  readonly conditions: readonly MilestoneCondition[];
  readonly eventType:
    | "LibraryEntryCreated"
    | "NoteCreated"
    | "QuoteCreated"
    | "LibraryEntryCompleted"
    | "SessionChanged";
  readonly id: MilestoneId;
  readonly ruleVersion: number;
}

export interface ReachedMilestone {
  readonly id: MilestoneId;
  readonly reachedAt: string;
  readonly ruleVersion: number;
  readonly source: {
    readonly eventId: string;
    readonly eventType: MilestoneSourceEventType;
  };
}

export interface MilestoneFacts {
  readonly completedBooks: number;
  readonly totalBooks: number;
  readonly totalNotes: number;
  readonly totalQuotes: number;
  readonly totalMovies?: number;
  readonly totalSeries?: number;
  readonly totalStudies?: number;
  readonly totalPhysicalActivities?: number;
  readonly totalWorkEntries?: number;
  readonly totalSessions?: number;
}

const definition = (
  id: MilestoneId,
  eventType: MilestoneDefinition["eventType"],
  fact: MilestoneFact,
): MilestoneDefinition =>
  Object.freeze({
    conditions: Object.freeze([{ fact, operator: "gte" as const, value: 1 }]),
    eventType,
    id,
    ruleVersion: 1,
  });

export const PRODUCT_MILESTONE_DEFINITIONS: readonly MilestoneDefinition[] =
  Object.freeze([
    definition(MILESTONE_ID.firstBook, "LibraryEntryCreated", "totalBooks"),
    definition(
      MILESTONE_ID.firstCompletedBook,
      "LibraryEntryCompleted",
      "completedBooks",
    ),
    definition(MILESTONE_ID.firstNote, "NoteCreated", "totalNotes"),
    definition(MILESTONE_ID.firstQuote, "QuoteCreated", "totalQuotes"),
    definition(MILESTONE_ID.firstMovie, "LibraryEntryCreated", "totalMovies"),
    definition(MILESTONE_ID.firstSeries, "LibraryEntryCreated", "totalSeries"),
    definition(MILESTONE_ID.firstStudy, "LibraryEntryCreated", "totalStudies"),
    definition(
      MILESTONE_ID.firstPhysicalActivity,
      "LibraryEntryCreated",
      "totalPhysicalActivities",
    ),
    definition(
      MILESTONE_ID.firstWork,
      "LibraryEntryCreated",
      "totalWorkEntries",
    ),
    definition(MILESTONE_ID.firstSession, "SessionChanged", "totalSessions"),
  ]);

function conditionMatches(
  condition: MilestoneCondition,
  facts: MilestoneFacts,
): boolean {
  return (facts[condition.fact] ?? 0) >= condition.value;
}

/** Pure policy for conventional product milestones. */
export class MilestoneEngine {
  evaluate(input: {
    readonly definitions: readonly MilestoneDefinition[];
    readonly event: DomainEvent;
    readonly facts: MilestoneFacts;
    readonly reached: readonly ReachedMilestone[];
  }): readonly ReachedMilestone[] {
    if (input.event.type === "MilestoneReached") return Object.freeze([]);
    const sourceEvent = input.event;
    const reachedIds = new Set(input.reached.map(({ id }) => id));
    return Object.freeze(
      input.definitions
        .filter(
          (candidate) =>
            candidate.eventType === input.event.type &&
            !reachedIds.has(candidate.id) &&
            candidate.conditions.every((condition) =>
              conditionMatches(condition, input.facts),
            ),
        )
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((candidate) =>
          Object.freeze({
            id: candidate.id,
            reachedAt: sourceEvent.occurredAt,
            ruleVersion: candidate.ruleVersion,
            source: Object.freeze({
              eventId: sourceEvent.eventId,
              eventType: sourceEvent.type,
            }),
          }),
        ),
    );
  }
}
