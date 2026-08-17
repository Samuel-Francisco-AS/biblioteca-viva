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

export const DECORATION_ID = Object.freeze({
  readingLamp: "decoration.reading-lamp",
} as const);
export const DECORATION_IDS = Object.freeze(Object.values(DECORATION_ID));

export const REWARD_ID = Object.freeze({
  firstCompletionReadingLamp: "reward.first-completion-reading-lamp",
} as const);
export type DecorationId = (typeof DECORATION_IDS)[number];
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

export interface MilestoneRewardDefinition {
  readonly decorationId?: DecorationId;
  readonly id: string;
  readonly type: "decoration";
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
  readonly rewardIds: readonly string[];
  readonly ruleVersion: number;
}

export interface GrantedMilestoneReward {
  readonly decorationId?: DecorationId;
  readonly id: string;
  readonly type: "decoration";
}

export interface ReachedMilestone {
  readonly id: MilestoneId;
  readonly reachedAt: string;
  readonly rewards: readonly GrantedMilestoneReward[];
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

export interface MilestoneEvaluationInput {
  readonly definitions: readonly MilestoneDefinition[];
  readonly event: DomainEvent;
  readonly facts: MilestoneFacts;
  readonly reached: readonly ReachedMilestone[];
  readonly rewards: readonly MilestoneRewardDefinition[];
}

function conditionMatches(
  condition: MilestoneCondition,
  facts: MilestoneFacts,
): boolean {
  return (facts[condition.fact] ?? 0) >= condition.value;
}

/** Pure policy: it evaluates facts and returns candidates without side effects. */
export class MilestoneEngine {
  evaluate(input: MilestoneEvaluationInput): readonly ReachedMilestone[] {
    if (input.event.type === "MilestoneReached") return Object.freeze([]);
    const sourceEvent = input.event;
    const reachedIds = new Set(input.reached.map(({ id }) => id));
    const rewardsById = new Map(
      input.rewards.map((reward) => [reward.id, reward]),
    );

    return Object.freeze(
      input.definitions
        .filter(
          (definition) =>
            definition.eventType === input.event.type &&
            !reachedIds.has(definition.id) &&
            definition.conditions.every((condition) =>
              conditionMatches(condition, input.facts),
            ),
        )
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((definition) =>
          Object.freeze({
            id: definition.id,
            reachedAt: input.event.occurredAt,
            rewards: Object.freeze(
              definition.rewardIds.map((rewardId) => {
                const reward = rewardsById.get(rewardId);
                if (!reward) throw new Error("MILESTONE_REWARD_MISSING");
                return Object.freeze({ ...reward });
              }),
            ),
            ruleVersion: definition.ruleVersion,
            source: Object.freeze({
              eventId: sourceEvent.eventId,
              eventType: sourceEvent.type,
            }),
          }),
        ),
    );
  }
}
