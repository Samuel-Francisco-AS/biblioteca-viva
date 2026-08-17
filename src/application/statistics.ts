import { z } from "zod";

import {
  ENTRY_TYPES,
  type EntryType,
  type LibraryEntry,
  type Session,
} from "../domain";
import type { Activity } from "./activities";
import { currentTime, parseInput } from "./internal";
import type { ApplicationDependencies } from "./ports";

export const STATISTICS_WINDOWS = ["7d", "30d", "all"] as const;
export type StatisticsWindow = (typeof STATISTICS_WINDOWS)[number];
export type TimelineCategory = "entry" | "progress" | "annotation" | "session";

export interface TypeStatistics {
  readonly entries: number;
  readonly inProgress: number;
  readonly completed: number;
  readonly sessions: number;
  readonly duration: number;
  readonly pagesRegistered: number;
  readonly episodesRegistered: number;
  readonly distanceMeters: number;
  readonly progressByUnit: Readonly<Record<string, number>>;
}

export interface TimelineItem {
  readonly id: string;
  readonly entryId: string;
  readonly entryType?: EntryType;
  readonly category: TimelineCategory;
  readonly kind: Activity["type"] | "session";
  readonly occurredAt: string;
  readonly duration?: number;
  readonly fromPage?: number;
  readonly toPage?: number;
}

export interface ProductProgressFacts {
  readonly entryCountsByType: Readonly<Record<EntryType, number>>;
  readonly completedCountsByType: Readonly<Record<EntryType, number>>;
  readonly sessionCountsByType: Readonly<Record<EntryType, number>>;
  readonly sessionDurationByType: Readonly<Record<EntryType, number>>;
  readonly reachedMilestoneIds: readonly string[];
}

export interface StatisticsSnapshot {
  readonly window: StatisticsWindow;
  readonly totalEntries: number;
  readonly inProgress: number;
  readonly completed: number;
  readonly favorites: number;
  readonly sessions: number;
  readonly duration: number;
  readonly byType: Readonly<Record<EntryType, TypeStatistics>>;
  readonly recentSessions: readonly Session[];
  readonly activeSession?: Session;
  readonly timeline: readonly TimelineItem[];
  readonly progressFacts: ProductProgressFacts;
}

function emptyType(): TypeStatistics {
  return {
    entries: 0,
    inProgress: 0,
    completed: 0,
    sessions: 0,
    duration: 0,
    pagesRegistered: 0,
    episodesRegistered: 0,
    distanceMeters: 0,
    progressByUnit: {},
  };
}

function typeRecord(): Record<EntryType, TypeStatistics> {
  return {
    book: emptyType(),
    movie: emptyType(),
    series: emptyType(),
    study: emptyType(),
    physical_activity: emptyType(),
    work: emptyType(),
  };
}

function numberRecord(): Record<EntryType, number> {
  return {
    book: 0,
    movie: 0,
    series: 0,
    study: 0,
    physical_activity: 0,
    work: 0,
  };
}

function cutoff(window: StatisticsWindow, now: string): number | undefined {
  if (window === "all") return undefined;
  const days = window === "7d" ? 7 : 30;
  return Date.parse(now) - days * 24 * 60 * 60 * 1_000;
}

function within(value: string, minimum?: number): boolean {
  return minimum === undefined || Date.parse(value) >= minimum;
}

function activityCategory(type: Activity["type"]): TimelineCategory {
  if (type === "session_started" || type === "session_completed")
    return "session";
  if (type === "progress_updated") return "progress";
  if (type === "note_added" || type === "quote_added") return "annotation";
  return "entry";
}

export function deriveStatistics(input: {
  readonly activities: readonly Activity[];
  readonly entries: readonly LibraryEntry[];
  readonly milestones: readonly { readonly id: string }[];
  readonly now: string;
  readonly sessions: readonly Session[];
  readonly window: StatisticsWindow;
  readonly entryType?: EntryType;
  readonly category?: TimelineCategory;
}): StatisticsSnapshot {
  const minimum = cutoff(input.window, input.now);
  const entries =
    input.entryType === undefined
      ? input.entries
      : input.entries.filter(({ type }) => type === input.entryType);
  const entryById = new Map(input.entries.map((entry) => [entry.id, entry]));
  const completedSessions = input.sessions.filter(
    (session) =>
      session.status === "completed" &&
      within(session.endedAt ?? session.startedAt, minimum) &&
      (input.entryType === undefined || session.entryType === input.entryType),
  );
  const byType = typeRecord();
  for (const entry of entries) {
    const current = byType[entry.type];
    byType[entry.type] = {
      ...current,
      entries: current.entries + 1,
      inProgress: current.inProgress + Number(entry.status === "in_progress"),
      completed: current.completed + Number(entry.status === "completed"),
    };
  }
  for (const session of completedSessions) {
    const current = byType[session.entryType];
    const progressByUnit = { ...current.progressByUnit };
    const entry = entryById.get(session.entryId);
    if (session.kind === "study" && entry?.type === "study") {
      const amount =
        entry.progressUnit === "sessions"
          ? 1
          : entry.progressUnit === "hours"
            ? Math.ceil(session.accumulatedDuration / 60)
            : 0;
      if (amount > 0)
        progressByUnit[entry.progressUnit] =
          (progressByUnit[entry.progressUnit] ?? 0) + amount;
    }
    byType[session.entryType] = {
      ...current,
      sessions: current.sessions + 1,
      duration: current.duration + session.accumulatedDuration,
      pagesRegistered:
        current.pagesRegistered +
        (session.kind === "reading" && session.endPage !== undefined
          ? Math.max(
              0,
              session.endPage - (session.startPage ?? session.endPage),
            )
          : 0),
      episodesRegistered:
        current.episodesRegistered +
        (session.kind === "viewing" ? (session.episodesCompleted ?? 0) : 0),
      distanceMeters:
        current.distanceMeters +
        (session.kind === "physical_activity"
          ? (session.distanceMeters ?? 0)
          : 0),
      progressByUnit,
    };
  }
  const activityTimeline: TimelineItem[] = input.activities
    .filter((activity) => within(activity.occurredAt, minimum))
    .map((activity) => ({
      id: activity.id,
      entryId: activity.aggregateId,
      entryType: entryById.get(activity.aggregateId)?.type,
      category: activityCategory(activity.type),
      kind: activity.type,
      occurredAt: activity.occurredAt,
      ...(activity.type === "progress_updated" && {
        toPage: activity.metadata.currentPage,
      }),
      ...(activity.type === "session_completed" && {
        duration: activity.metadata.duration,
      }),
    }))
    .filter(
      (item) =>
        (input.entryType === undefined || item.entryType === input.entryType) &&
        (input.category === undefined || item.category === input.category),
    );
  const sessionIdsInActivities = new Set(
    input.activities
      .filter(({ type }) => type === "session_completed")
      .map(({ metadata }) =>
        "sessionId" in metadata ? metadata.sessionId : "",
      ),
  );
  const sessionTimeline: TimelineItem[] = completedSessions
    .filter((session) => !sessionIdsInActivities.has(session.id))
    .map((session): TimelineItem => ({
      id: `timeline-${session.id}`,
      entryId: session.entryId,
      entryType: session.entryType,
      category: "session",
      kind: "session",
      occurredAt: session.endedAt ?? session.startedAt,
      duration: session.accumulatedDuration,
    }))
    .filter(
      (item) =>
        input.category === undefined || item.category === input.category,
    );
  const entryCountsByType = numberRecord();
  const completedCountsByType = numberRecord();
  const sessionCountsByType = numberRecord();
  const sessionDurationByType = numberRecord();
  for (const type of ENTRY_TYPES) {
    entryCountsByType[type] = input.entries.filter(
      (entry) => entry.type === type,
    ).length;
    completedCountsByType[type] = input.entries.filter(
      (entry) => entry.type === type && entry.status === "completed",
    ).length;
    sessionCountsByType[type] = input.sessions.filter(
      (session) => session.entryType === type && session.status === "completed",
    ).length;
    sessionDurationByType[type] = input.sessions
      .filter(
        (session) =>
          session.entryType === type && session.status === "completed",
      )
      .reduce((total, session) => total + session.accumulatedDuration, 0);
  }
  const duration = completedSessions.reduce(
    (total, session) => total + session.accumulatedDuration,
    0,
  );
  return Object.freeze({
    window: input.window,
    totalEntries: entries.length,
    inProgress: entries.filter(({ status }) => status === "in_progress").length,
    completed: entries.filter(({ status }) => status === "completed").length,
    favorites: entries.filter(({ favorite }) => favorite).length,
    sessions: completedSessions.length,
    duration,
    byType: Object.freeze(byType),
    recentSessions: Object.freeze(
      completedSessions
        .slice()
        .sort((a, b) =>
          (b.endedAt ?? b.startedAt).localeCompare(a.endedAt ?? a.startedAt),
        )
        .slice(0, 8),
    ),
    activeSession: input.sessions.find(({ status }) => status !== "completed"),
    timeline: Object.freeze(
      [...activityTimeline, ...sessionTimeline].sort((a, b) =>
        b.occurredAt.localeCompare(a.occurredAt),
      ),
    ),
    progressFacts: Object.freeze({
      entryCountsByType: Object.freeze(entryCountsByType),
      completedCountsByType: Object.freeze(completedCountsByType),
      sessionCountsByType: Object.freeze(sessionCountsByType),
      sessionDurationByType: Object.freeze(sessionDurationByType),
      reachedMilestoneIds: Object.freeze(
        input.milestones.map(({ id }) => id).sort(),
      ),
    }),
  });
}

const querySchema = z.strictObject({
  window: z.enum(STATISTICS_WINDOWS).optional(),
  entryType: z.enum(ENTRY_TYPES).optional(),
  category: z.enum(["entry", "progress", "annotation", "session"]).optional(),
});

type StatisticsDependencies = Pick<
  ApplicationDependencies,
  "activities" | "clock" | "libraryEntries" | "sessions"
> & {
  readonly milestones: { list(): Promise<readonly { readonly id: string }[]> };
};

export class GetStatistics {
  constructor(private readonly dependencies: StatisticsDependencies) {}
  async execute(input: unknown = {}): Promise<StatisticsSnapshot> {
    const parsed = parseInput(querySchema, input);
    const [entries, sessions, activities, milestones, now] = await Promise.all([
      this.dependencies.libraryEntries.list(),
      this.dependencies.sessions.list(),
      this.dependencies.activities.list(),
      this.dependencies.milestones.list(),
      currentTime(this.dependencies),
    ]);
    return deriveStatistics({
      entries,
      sessions,
      activities,
      milestones,
      now,
      window: parsed.window ?? "30d",
      ...(parsed.entryType !== undefined && { entryType: parsed.entryType }),
      ...(parsed.category !== undefined && { category: parsed.category }),
    });
  }
}
