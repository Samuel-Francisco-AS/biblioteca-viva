import Dexie from "dexie";

import type {
  MilestoneProcessor,
  MilestoneRepository,
} from "../../application";
import {
  MilestoneEngine,
  type DomainEvent,
  type MilestoneDefinition,
  type MilestoneRewardDefinition,
  type ReachedMilestone,
  deriveRoomProgress,
  ROOM_STAGE_MILESTONE_IDS,
  type RoomDefinition,
} from "../../domain";
import { roomFacts } from "../../application";
import type { BibliotecaDatabase } from "./database";
import { persistedMilestoneSchema, type PersistedMilestone } from "./schema";
import { InfrastructureError } from "./errors";

function readMilestone(value: unknown): ReachedMilestone {
  const parsed = persistedMilestoneSchema.safeParse(value);
  if (!parsed.success)
    throw new InfrastructureError("DATABASE_READ_FAILED", "read_milestone");
  return Object.freeze({
    ...parsed.data,
    rewards: Object.freeze(
      parsed.data.rewards.map((reward) => Object.freeze(reward)),
    ),
    source: Object.freeze(parsed.data.source),
  });
}

export class DexieMilestoneStore
  implements MilestoneProcessor, MilestoneRepository
{
  constructor(
    private readonly database: BibliotecaDatabase,
    private readonly engine: MilestoneEngine,
    private readonly definitions: readonly MilestoneDefinition[],
    private readonly rewards: readonly MilestoneRewardDefinition[],
    private readonly rooms: readonly RoomDefinition[] = [],
  ) {}

  async list(): Promise<readonly ReachedMilestone[]> {
    try {
      const stored: unknown[] = await this.database.milestones.toArray();
      return Object.freeze(
        stored
          .map(readMilestone)
          .sort(
            (left, right) =>
              left.reachedAt.localeCompare(right.reachedAt) ||
              left.id.localeCompare(right.id),
          ),
      );
    } catch (error: unknown) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("DATABASE_READ_FAILED", "list_milestones");
    }
  }

  async process(event: DomainEvent): Promise<readonly ReachedMilestone[]> {
    if (event.type === "MilestoneReached") return Object.freeze([]);
    const [entries, totalNotes, totalQuotes, totalSessions, reached] =
      await Promise.all([
        this.database.libraryEntries.toArray(),
        this.database.notes.count(),
        this.database.quotes.count(),
        this.database.sessions.count(),
        this.list(),
      ]);
    const candidates = this.engine.evaluate({
      definitions: this.definitions,
      event,
      facts: {
        completedBooks: entries.filter(
          ({ type, status }) => type === "book" && status === "completed",
        ).length,
        totalBooks: entries.filter(({ type }) => type === "book").length,
        totalMovies: entries.filter(({ type }) => type === "movie").length,
        totalSeries: entries.filter(({ type }) => type === "series").length,
        totalStudies: entries.filter(({ type }) => type === "study").length,
        totalPhysicalActivities: entries.filter(
          ({ type }) => type === "physical_activity",
        ).length,
        totalWorkEntries: entries.filter(({ type }) => type === "work").length,
        totalSessions,
        totalNotes,
        totalQuotes,
      },
      reached,
      rewards: this.rewards,
    });
    const inserted: ReachedMilestone[] = [];
    for (const candidate of candidates) {
      const parsed = persistedMilestoneSchema.parse(candidate);
      try {
        await this.database.milestones.add({
          ...parsed,
        } satisfies PersistedMilestone);
        inserted.push(readMilestone(parsed));
      } catch (error: unknown) {
        if (error instanceof Dexie.ConstraintError) continue;
        throw new InfrastructureError(
          "DATABASE_WRITE_FAILED",
          "save_milestone",
        );
      }
    }
    const allReached = [...reached, ...inserted];
    const affectedType =
      "payload" in event && "entryType" in event.payload
        ? event.payload.entryType
        : undefined;
    const affectedRooms = this.rooms.filter(
      (room) =>
        room.id === "main-library" ||
        (affectedType !== undefined &&
          room.associatedEntryTypes.includes(affectedType)),
    );
    if (affectedRooms.length > 0) {
      const sessions = await this.database.sessions.toArray();
      const facts = roomFacts({
        entries,
        sessions,
        milestoneIds: allReached.map(({ id }) => id),
      });
      for (const room of affectedRooms) {
        const progress = deriveRoomProgress(room, facts);
        for (const stage of [2, 3, 4] as const) {
          const id = ROOM_STAGE_MILESTONE_IDS[room.id][stage];
          if (
            !id ||
            stage > progress.currentStage ||
            allReached.some((item) => item.id === id)
          )
            continue;
          const candidate: ReachedMilestone = Object.freeze({
            id,
            reachedAt: event.occurredAt,
            rewards: Object.freeze([]),
            ruleVersion: 1,
            source: Object.freeze({
              eventId: event.eventId,
              eventType: event.type,
            }),
          });
          try {
            await this.database.milestones.add(
              persistedMilestoneSchema.parse(candidate),
            );
            inserted.push(candidate);
            allReached.push(candidate);
          } catch (error: unknown) {
            if (!(error instanceof Dexie.ConstraintError))
              throw new InfrastructureError(
                "DATABASE_WRITE_FAILED",
                "save_room_stage_milestone",
              );
          }
        }
      }
    }
    return Object.freeze(inserted);
  }
}
