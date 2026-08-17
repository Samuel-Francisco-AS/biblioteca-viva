import type {
  RoomDefinition,
  RoomId,
  RoomProgress,
  RoomProgressFacts,
} from "../domain";
import { deriveRoomProgress } from "../domain";
import type { StatisticsSnapshot } from "./statistics";

export class GetRoomProgress {
  constructor(
    private readonly statistics: {
      execute(input?: unknown): Promise<StatisticsSnapshot>;
    },
    private readonly definitions: readonly RoomDefinition[],
  ) {}

  async execute(): Promise<readonly RoomProgress[]> {
    const snapshot = await this.statistics.execute({ window: "all" });
    return Object.freeze(
      this.definitions.map((definition) =>
        deriveRoomProgress(definition, snapshot.progressFacts),
      ),
    );
  }
}

export function selectInitialRoom(
  requested: RoomId | undefined,
  progress: readonly RoomProgress[],
): RoomId {
  return requested &&
    progress.some((room) => room.roomId === requested && room.unlocked)
    ? requested
    : "main-library";
}

export function roomFacts(input: {
  readonly entries: readonly {
    readonly type: keyof RoomProgressFacts["entryCountsByType"];
    readonly status: string;
  }[];
  readonly sessions: readonly {
    readonly entryType: keyof RoomProgressFacts["sessionCountsByType"];
    readonly status: string;
    readonly accumulatedDuration: number;
  }[];
  readonly milestoneIds: readonly string[];
}): RoomProgressFacts {
  const empty = (): Record<
    keyof RoomProgressFacts["entryCountsByType"],
    number
  > => ({
    book: 0,
    movie: 0,
    series: 0,
    study: 0,
    physical_activity: 0,
    work: 0,
  });
  const entryCountsByType = empty();
  const completedCountsByType = empty();
  const sessionCountsByType = empty();
  const sessionDurationByType = empty();
  for (const entry of input.entries) {
    entryCountsByType[entry.type] += 1;
    if (entry.status === "completed") completedCountsByType[entry.type] += 1;
  }
  for (const session of input.sessions)
    if (session.status === "completed") {
      sessionCountsByType[session.entryType] += 1;
      sessionDurationByType[session.entryType] += session.accumulatedDuration;
    }
  return Object.freeze({
    entryCountsByType: Object.freeze(entryCountsByType),
    completedCountsByType: Object.freeze(completedCountsByType),
    sessionCountsByType: Object.freeze(sessionCountsByType),
    sessionDurationByType: Object.freeze(sessionDurationByType),
    reachedMilestoneIds: Object.freeze([...input.milestoneIds]),
  });
}
