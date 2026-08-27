import {
  STRUCTURAL_MILESTONE_DEFINITIONS,
  deriveStructuralProgressFacts,
  type GrantedStructureMilestoneReward,
  type LibraryEntry,
  type ReachedMilestone,
  type Session,
  type StructuralMilestoneDefinition,
} from "../domain";
import { milestoneReachedEvents } from "./milestones";
import { publishEvents } from "./internal";
import type { ApplicationEventBus } from "./ports";

export interface StructuralProgressionStore {
  list(): Promise<readonly ReachedMilestone[]>;
  reconcile(input: {
    readonly reachedAt: string;
    readonly sourceEventId: string;
  }): Promise<readonly ReachedMilestone[]>;
}

export interface StructuralProgressionSnapshot {
  readonly eligibleCompletedSessionCount: number;
  readonly isComplete: boolean;
  readonly nextMilestone?: StructuralMilestoneDefinition;
  readonly progressCurrent: number;
  readonly progressPercent: number;
  readonly progressRequired: number;
  readonly reachedMilestones: readonly ReachedMilestone[];
}

export interface StructuralProgressionQueryDependencies {
  readonly entries: { list(): Promise<readonly LibraryEntry[]> };
  readonly milestones: { list(): Promise<readonly ReachedMilestone[]> };
  readonly sessions: { list(): Promise<readonly Session[]> };
}

export interface StructuralReconciliationDependencies {
  readonly clock: { now(): Promise<string> };
  readonly events: ApplicationEventBus;
  readonly progression: StructuralProgressionStore;
}

export function isStructuralMilestone(milestone: ReachedMilestone): boolean {
  return isStructuralMilestoneId(milestone.id);
}

export function isStructuralMilestoneId(id: string): boolean {
  return STRUCTURAL_MILESTONE_DEFINITIONS.some(
    (definition) => definition.id === id,
  );
}

export function structuralGrants(
  milestones: readonly ReachedMilestone[],
): readonly GrantedStructureMilestoneReward[] {
  return Object.freeze(
    milestones.flatMap((milestone) =>
      milestone.rewards.filter(
        (reward): reward is GrantedStructureMilestoneReward =>
          reward.type === "structure-grant",
      ),
    ),
  );
}

export function projectStructuralProgress(input: {
  readonly entries: readonly LibraryEntry[];
  readonly milestones: readonly ReachedMilestone[];
  readonly sessions: readonly Session[];
}): StructuralProgressionSnapshot {
  const facts = deriveStructuralProgressFacts(input.sessions, input.entries);
  const reachedMilestones = Object.freeze(
    input.milestones.filter(isStructuralMilestone),
  );
  const reachedIds = new Set(reachedMilestones.map(({ id }) => id));
  const nextMilestone = STRUCTURAL_MILESTONE_DEFINITIONS.find(
    (definition) => !reachedIds.has(definition.id),
  );
  if (!nextMilestone)
    return Object.freeze({
      eligibleCompletedSessionCount: facts.eligibleCompletedSessionCount,
      isComplete: true,
      progressCurrent: facts.eligibleCompletedSessionCount,
      progressPercent: 100,
      progressRequired: 0,
      reachedMilestones,
    });
  const progressCurrent = Math.min(
    facts.eligibleCompletedSessionCount,
    nextMilestone.threshold,
  );
  return Object.freeze({
    eligibleCompletedSessionCount: facts.eligibleCompletedSessionCount,
    isComplete: false,
    nextMilestone,
    progressCurrent,
    progressPercent: Math.max(
      0,
      Math.min(
        100,
        Math.round((progressCurrent / nextMilestone.threshold) * 100),
      ),
    ),
    progressRequired: Math.max(0, nextMilestone.threshold - progressCurrent),
    reachedMilestones,
  });
}

export class GetStructuralProgress {
  constructor(
    private readonly dependencies: StructuralProgressionQueryDependencies,
  ) {}

  async execute(): Promise<StructuralProgressionSnapshot> {
    const [entries, milestones, sessions] = await Promise.all([
      this.dependencies.entries.list(),
      this.dependencies.milestones.list(),
      this.dependencies.sessions.list(),
    ]);
    return projectStructuralProgress({ entries, milestones, sessions });
  }
}

export class ReconcileStructuralProgress {
  constructor(
    private readonly dependencies: StructuralReconciliationDependencies,
  ) {}

  async execute(): Promise<readonly ReachedMilestone[]> {
    const reached = await this.dependencies.progression.reconcile({
      reachedAt: await this.dependencies.clock.now(),
      sourceEventId: "event.structure-reconciliation",
    });
    await publishEvents(this.dependencies, milestoneReachedEvents(reached));
    return reached;
  }
}
