import type { DomainEvent } from "./events";
import type {
  StructuralInventoryFamilyId,
  StructuralProgressFacts,
} from "./structuralProgress";

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
  mainLibraryStage2: "milestone.room.main-library.stage-2",
  mainLibraryStage3: "milestone.room.main-library.stage-3",
  mainLibraryStage4: "milestone.room.main-library.stage-4",
  studyRoomStage2: "milestone.room.study-room.stage-2",
  studyRoomStage3: "milestone.room.study-room.stage-3",
  studyRoomStage4: "milestone.room.study-room.stage-4",
  projectionRoomStage2: "milestone.room.projection-room.stage-2",
  projectionRoomStage3: "milestone.room.projection-room.stage-3",
  projectionRoomStage4: "milestone.room.projection-room.stage-4",
  trainingRoomStage2: "milestone.room.training-room.stage-2",
  trainingRoomStage3: "milestone.room.training-room.stage-3",
  trainingRoomStage4: "milestone.room.training-room.stage-4",
  officeStage2: "milestone.room.office.stage-2",
  officeStage3: "milestone.room.office.stage-3",
  officeStage4: "milestone.room.office.stage-4",
  structureFirstActivity: "milestone.structure.first-activity",
  structureLibraryExpansion: "milestone.structure.library-expansion",
  structureNewSpace: "milestone.structure.new-space",
  structureConsolidated: "milestone.structure.consolidated",
} as const);

export const MILESTONE_IDS = Object.freeze(Object.values(MILESTONE_ID));

export type MilestoneId = (typeof MILESTONE_IDS)[number];

export const DECORATION_ID = Object.freeze({
  readingLamp: "decoration.reading-lamp",
} as const);
export const DECORATION_IDS = Object.freeze(Object.values(DECORATION_ID));

export const REWARD_ID = Object.freeze({
  firstCompletionReadingLamp: "reward.first-completion-reading-lamp",
  structureFirstActivityFloor: "reward.structure.first-activity.floor",
  structureFirstActivityWallShort: "reward.structure.first-activity.wall-short",
  structureFirstActivityWallMedium:
    "reward.structure.first-activity.wall-medium",
  structureLibraryExpansionFloor: "reward.structure.library-expansion.floor",
  structureLibraryExpansionWallMedium:
    "reward.structure.library-expansion.wall-medium",
  structureLibraryExpansionWallLong:
    "reward.structure.library-expansion.wall-long",
  structureLibraryExpansionCorner: "reward.structure.library-expansion.corner",
  structureNewSpaceFloor: "reward.structure.new-space.floor",
  structureNewSpaceWallLong: "reward.structure.new-space.wall-long",
  structureNewSpaceCorner: "reward.structure.new-space.corner",
  structureNewSpaceDoor: "reward.structure.new-space.door",
  structureConsolidatedFloor: "reward.structure.consolidated.floor",
  structureConsolidatedWallLong: "reward.structure.consolidated.wall-long",
  structureConsolidatedCorner: "reward.structure.consolidated.corner",
  structureConsolidatedDoor: "reward.structure.consolidated.door",
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
  | "completedBooks"
  | "eligibleCompletedSessionCount";

export interface MilestoneCondition {
  readonly fact: MilestoneFact;
  readonly operator: "gte";
  readonly value: number;
}

export interface DecorationMilestoneRewardDefinition {
  readonly decorationId?: DecorationId;
  readonly id: string;
  readonly type: "decoration";
}

export interface StructureGrantMilestoneRewardDefinition {
  readonly familyId: StructuralInventoryFamilyId;
  readonly id: string;
  readonly quantity: number;
  readonly type: "structure-grant";
}

export type MilestoneRewardDefinition =
  DecorationMilestoneRewardDefinition | StructureGrantMilestoneRewardDefinition;

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

export interface GrantedDecorationMilestoneReward {
  readonly decorationId?: DecorationId;
  readonly id: string;
  readonly type: "decoration";
}

export interface GrantedStructureMilestoneReward {
  readonly familyId: StructuralInventoryFamilyId;
  readonly id: string;
  readonly quantity: number;
  readonly type: "structure-grant";
}

export type GrantedMilestoneReward =
  GrantedDecorationMilestoneReward | GrantedStructureMilestoneReward;

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
  readonly eligibleCompletedSessionCount?: number;
}

export interface StructuralMilestoneDefinition {
  readonly id: MilestoneId;
  readonly rewardIds: readonly string[];
  readonly ruleVersion: number;
  readonly threshold: number;
}

export const STRUCTURAL_MILESTONE_DEFINITIONS: readonly StructuralMilestoneDefinition[] =
  Object.freeze([
    Object.freeze({
      id: MILESTONE_ID.structureFirstActivity,
      rewardIds: Object.freeze([
        REWARD_ID.structureFirstActivityFloor,
        REWARD_ID.structureFirstActivityWallShort,
        REWARD_ID.structureFirstActivityWallMedium,
      ]),
      ruleVersion: 1,
      threshold: 1,
    }),
    Object.freeze({
      id: MILESTONE_ID.structureLibraryExpansion,
      rewardIds: Object.freeze([
        REWARD_ID.structureLibraryExpansionFloor,
        REWARD_ID.structureLibraryExpansionWallMedium,
        REWARD_ID.structureLibraryExpansionWallLong,
        REWARD_ID.structureLibraryExpansionCorner,
      ]),
      ruleVersion: 1,
      threshold: 5,
    }),
    Object.freeze({
      id: MILESTONE_ID.structureNewSpace,
      rewardIds: Object.freeze([
        REWARD_ID.structureNewSpaceFloor,
        REWARD_ID.structureNewSpaceWallLong,
        REWARD_ID.structureNewSpaceCorner,
        REWARD_ID.structureNewSpaceDoor,
      ]),
      ruleVersion: 1,
      threshold: 15,
    }),
    Object.freeze({
      id: MILESTONE_ID.structureConsolidated,
      rewardIds: Object.freeze([
        REWARD_ID.structureConsolidatedFloor,
        REWARD_ID.structureConsolidatedWallLong,
        REWARD_ID.structureConsolidatedCorner,
        REWARD_ID.structureConsolidatedDoor,
      ]),
      ruleVersion: 1,
      threshold: 30,
    }),
  ]);

export interface StructuralMilestoneEvaluationInput {
  readonly definitions: readonly StructuralMilestoneDefinition[];
  readonly facts: StructuralProgressFacts;
  readonly reached: readonly ReachedMilestone[];
  readonly reachedAt: string;
  readonly rewards: readonly MilestoneRewardDefinition[];
  readonly sourceEventId: string;
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

/** Pure structural progression policy; P3-B will supply the transaction/event. */
export function evaluateStructuralMilestones(
  input: StructuralMilestoneEvaluationInput,
): readonly ReachedMilestone[] {
  const reachedIds = new Set(input.reached.map(({ id }) => id));
  const rewardsById = new Map(
    input.rewards.map((reward) => [reward.id, reward]),
  );
  return Object.freeze(
    input.definitions
      .filter(
        (definition) =>
          !reachedIds.has(definition.id) &&
          input.facts.eligibleCompletedSessionCount >= definition.threshold,
      )
      .sort((left, right) => left.id.localeCompare(right.id))
      .map((definition) =>
        Object.freeze({
          id: definition.id,
          reachedAt: input.reachedAt,
          rewards: Object.freeze(
            definition.rewardIds.map((rewardId) => {
              const reward = rewardsById.get(rewardId);
              if (!reward) throw new Error("MILESTONE_REWARD_MISSING");
              return Object.freeze({ ...reward });
            }),
          ),
          ruleVersion: definition.ruleVersion,
          source: Object.freeze({
            eventId: input.sourceEventId,
            eventType: "SessionChanged" as const,
          }),
        }),
      ),
  );
}
