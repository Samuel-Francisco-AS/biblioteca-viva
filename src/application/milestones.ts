import {
  createMilestoneReachedEvent,
  type DomainEvent,
  type ReachedMilestone,
} from "../domain";

export interface MilestoneProcessor {
  process(event: DomainEvent): Promise<readonly ReachedMilestone[]>;
}

export interface MilestoneRepository {
  list(): Promise<readonly ReachedMilestone[]>;
}

export class ListMilestones {
  constructor(private readonly milestones: MilestoneRepository) {}

  list(): Promise<readonly ReachedMilestone[]> {
    return this.milestones.list();
  }
}

export function milestoneReachedEvents(
  reached: readonly ReachedMilestone[],
): readonly DomainEvent[] {
  return Object.freeze(
    reached.map((milestone) =>
      createMilestoneReachedEvent({
        aggregateId: milestone.id,
        eventId: `event.${milestone.id}.${milestone.source.eventId}`,
        occurredAt: milestone.reachedAt,
        payload: {
          decorationIds: milestone.rewards.flatMap((reward) =>
            reward.decorationId ? [reward.decorationId] : [],
          ),
          milestoneId: milestone.id,
          rewardIds: milestone.rewards.map(({ id }) => id),
          sourceEventType: milestone.source.eventType,
        },
        revision: milestone.ruleVersion,
      }),
    ),
  );
}
