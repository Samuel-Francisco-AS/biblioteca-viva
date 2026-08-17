import type { EntryType } from "./types";
import { MILESTONE_ID, type MilestoneId } from "./milestones";

export const ROOM_IDS = [
  "main-library",
  "study-room",
  "projection-room",
  "training-room",
  "office",
] as const;
export type RoomId = (typeof ROOM_IDS)[number];
export type RoomStage = 0 | 1 | 2 | 3 | 4;

export type RoomRequirement =
  | {
      readonly type: "entry-count";
      readonly entryTypes: readonly EntryType[];
      readonly minimum: number;
    }
  | {
      readonly type: "completed-entry-count";
      readonly entryTypes: readonly EntryType[];
      readonly minimum: number;
    }
  | {
      readonly type: "session-count";
      readonly entryTypes: readonly EntryType[];
      readonly minimum: number;
    }
  | {
      readonly type: "session-duration";
      readonly entryTypes: readonly EntryType[];
      readonly minimumMinutes: number;
    }
  | {
      readonly type: "milestone";
      readonly milestoneIds: readonly MilestoneId[];
    };

export interface RoomStageRule {
  readonly stage: Exclude<RoomStage, 0>;
  readonly groups: readonly {
    readonly operator: "all" | "any";
    readonly requirements: readonly RoomRequirement[];
  }[];
}

export interface RoomDefinition {
  readonly id: RoomId;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly associatedEntryTypes: readonly EntryType[];
  readonly connections: readonly RoomId[];
  readonly stages: readonly RoomStageRule[];
}

export interface RoomProgressFacts {
  readonly entryCountsByType: Readonly<Record<EntryType, number>>;
  readonly completedCountsByType: Readonly<Record<EntryType, number>>;
  readonly sessionCountsByType: Readonly<Record<EntryType, number>>;
  /** Completed-session duration in seconds. */
  readonly sessionDurationByType: Readonly<Record<EntryType, number>>;
  readonly reachedMilestoneIds: readonly string[];
}

export interface RoomRequirementProgress {
  readonly requirement: RoomRequirement;
  readonly met: boolean;
  readonly current: number;
  readonly target: number;
}

export interface RoomProgress {
  readonly roomId: RoomId;
  readonly unlocked: boolean;
  readonly currentStage: RoomStage;
  readonly highestReachedStage: RoomStage;
  readonly requirements: readonly RoomRequirementProgress[];
}

export const ROOM_STAGE_MILESTONE_IDS: Readonly<
  Record<RoomId, Readonly<Partial<Record<RoomStage, MilestoneId>>>>
> = Object.freeze({
  "main-library": {
    2: MILESTONE_ID.mainLibraryStage2,
    3: MILESTONE_ID.mainLibraryStage3,
    4: MILESTONE_ID.mainLibraryStage4,
  },
  "study-room": {
    2: MILESTONE_ID.studyRoomStage2,
    3: MILESTONE_ID.studyRoomStage3,
    4: MILESTONE_ID.studyRoomStage4,
  },
  "projection-room": {
    2: MILESTONE_ID.projectionRoomStage2,
    3: MILESTONE_ID.projectionRoomStage3,
    4: MILESTONE_ID.projectionRoomStage4,
  },
  "training-room": {
    2: MILESTONE_ID.trainingRoomStage2,
    3: MILESTONE_ID.trainingRoomStage3,
    4: MILESTONE_ID.trainingRoomStage4,
  },
  office: {
    2: MILESTONE_ID.officeStage2,
    3: MILESTONE_ID.officeStage3,
    4: MILESTONE_ID.officeStage4,
  },
});

function total(
  record: Readonly<Record<EntryType, number>>,
  types: readonly EntryType[],
): number {
  return types.reduce((sum, type) => sum + record[type], 0);
}

function evaluateRequirement(
  requirement: RoomRequirement,
  facts: RoomProgressFacts,
): RoomRequirementProgress {
  let current: number;
  let target: number;
  if (requirement.type === "entry-count") {
    current = total(facts.entryCountsByType, requirement.entryTypes);
    target = requirement.minimum;
  } else if (requirement.type === "completed-entry-count") {
    current = total(facts.completedCountsByType, requirement.entryTypes);
    target = requirement.minimum;
  } else if (requirement.type === "session-count") {
    current = total(facts.sessionCountsByType, requirement.entryTypes);
    target = requirement.minimum;
  } else if (requirement.type === "session-duration") {
    current = Math.floor(
      total(facts.sessionDurationByType, requirement.entryTypes) / 60,
    );
    target = requirement.minimumMinutes;
  } else {
    current = requirement.milestoneIds.some((id) =>
      facts.reachedMilestoneIds.includes(id),
    )
      ? 1
      : 0;
    target = 1;
  }
  return Object.freeze({
    requirement,
    current,
    target,
    met: current >= target,
  });
}

export function deriveRoomProgress(
  definition: RoomDefinition,
  facts: RoomProgressFacts,
): RoomProgress {
  let currentStage: RoomStage = definition.id === "main-library" ? 1 : 0;
  const evaluations = new Map<RoomStage, readonly RoomRequirementProgress[]>();
  for (const rule of definition.stages) {
    const progress = rule.groups.flatMap((group) =>
      group.requirements.map((requirement) =>
        evaluateRequirement(requirement, facts),
      ),
    );
    evaluations.set(rule.stage, progress);
    const met = rule.groups.every((group) =>
      group.operator === "all"
        ? group.requirements.every(
            (requirement) => evaluateRequirement(requirement, facts).met,
          )
        : group.requirements.some(
            (requirement) => evaluateRequirement(requirement, facts).met,
          ),
    );
    if (met && rule.stage <= currentStage + 1) currentStage = rule.stage;
  }
  const historicalStages = Object.entries(
    ROOM_STAGE_MILESTONE_IDS[definition.id],
  )
    .filter(
      ([, id]) => id !== undefined && facts.reachedMilestoneIds.includes(id),
    )
    .map(([stage]) => Number(stage) as RoomStage);
  const highestReachedStage = Math.max(
    currentStage,
    ...historicalStages,
  ) as RoomStage;
  const nextRule = definition.stages.find(
    ({ stage }) => stage > highestReachedStage,
  );
  return Object.freeze({
    roomId: definition.id,
    unlocked: highestReachedStage >= 1,
    currentStage,
    highestReachedStage,
    requirements: Object.freeze(
      nextRule ? (evaluations.get(nextRule.stage) ?? []) : [],
    ),
  });
}

export const RESIDENT_IDS = [
  "librarian",
  "researcher",
  "projectionist",
  "training-keeper",
  "scribe",
] as const;
export type ResidentId = (typeof RESIDENT_IDS)[number];
export interface ResidentDefinition {
  readonly id: ResidentId;
  readonly homeRoomId: RoomId;
}
