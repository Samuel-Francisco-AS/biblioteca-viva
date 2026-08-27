import { z } from "zod";

import {
  changeBookStatus,
  changeEntryStatus,
  completeSession,
  createManualSession,
  createSessionChangedEvent,
  createTimedSession,
  editCompletedSession,
  pauseSession,
  resumeSession,
  updateProgress,
  updateSeriesProgress,
  updateStudyProgress,
  type LibraryEntry,
  type Session,
} from "../domain";
import { createActivity } from "./activities";
import { ApplicationError, persistenceFailed } from "./errors";
import {
  applyDomain,
  currentTime,
  generatedId,
  parseInput,
  publishEvent,
  publishEvents,
  processMilestones,
  processMilestonesWithDetails,
  runTransaction,
  saveActivity,
  saveEntity,
} from "./internal";
import type { ApplicationDependencies } from "./ports";
import {
  structuralGrants,
  type StructuralProgressionSnapshot,
} from "./structuralProgression";

const id = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
const specific = z.discriminatedUnion("entryType", [
  z.strictObject({
    entryType: z.literal("book"),
    startPage: z.int().positive().optional(),
    endPage: z.int().positive().optional(),
  }),
  z.strictObject({
    entryType: z.literal("movie"),
    watchedDuration: z.int().nonnegative().optional(),
    episodesCompleted: z.int().nonnegative().optional(),
  }),
  z.strictObject({
    entryType: z.literal("series"),
    watchedDuration: z.int().nonnegative().optional(),
    episodesCompleted: z.int().nonnegative().optional(),
  }),
  z.strictObject({ entryType: z.literal("study") }),
  z.strictObject({
    entryType: z.literal("physical_activity"),
    distanceMeters: z.int().nonnegative().optional(),
    perceivedExertion: z.int().min(1).max(10).optional(),
  }),
  z.strictObject({ entryType: z.literal("work"), result: optionalText }),
]);
const startSchema = z.intersection(
  z.strictObject({ entryId: id, note: optionalText }),
  specific,
);
const manualSchema = z.intersection(
  z.strictObject({
    entryId: id,
    note: optionalText,
    occurredAt: z.iso.datetime({ offset: false }).optional(),
    duration: z.int().positive(),
  }),
  specific,
);
const sessionIdSchema = z.strictObject({ id });
const editSchema = z.strictObject({
  id,
  duration: z.int().positive(),
  note: optionalText,
});

type SessionDependencies = Pick<
  ApplicationDependencies,
  | "activities"
  | "clock"
  | "events"
  | "ids"
  | "libraryEntries"
  | "milestones"
  | "sessions"
  | "transaction"
>;

export interface SessionCompletionResult {
  readonly newStructuralMilestones: readonly import("../domain").ReachedMilestone[];
  readonly session: Session;
  readonly structuralGrants: readonly import("../domain").GrantedStructureMilestoneReward[];
  readonly structuralProgress?: StructuralProgressionSnapshot;
}

function completionResult(
  session: Session,
  reached: readonly import("../domain").ReachedMilestone[],
  progress?: StructuralProgressionSnapshot,
): SessionCompletionResult {
  const newStructuralMilestones = reached.filter((milestone) =>
    milestone.rewards.some((reward) => reward.type === "structure-grant"),
  );
  return Object.freeze({
    newStructuralMilestones: Object.freeze(newStructuralMilestones),
    session,
    structuralGrants: structuralGrants(newStructuralMilestones),
    ...(progress && { structuralProgress: progress }),
  });
}

async function loadEntry(dependencies: SessionDependencies, entryId: string) {
  const entry = await dependencies.libraryEntries.getById(entryId);
  if (!entry)
    throw new ApplicationError("NOT_FOUND", "Registro não encontrado.");
  return entry;
}

async function loadSession(
  dependencies: SessionDependencies,
  sessionId: string,
) {
  const session = await dependencies.sessions.getById(sessionId);
  if (!session)
    throw new ApplicationError("NOT_FOUND", "Sessão não encontrada.");
  return session;
}

function startEntry(entry: LibraryEntry, now: string): LibraryEntry {
  if (entry.status !== "planned") return entry;
  return entry.type === "book"
    ? changeBookStatus(entry, "in_progress", now)
    : changeEntryStatus(entry, "in_progress", now);
}

function applyCompletedSession(
  entry: LibraryEntry,
  session: Session,
  now: string,
): LibraryEntry {
  if (
    session.kind === "reading" &&
    entry.type === "book" &&
    session.endPage !== undefined &&
    session.endPage > entry.currentPage
  )
    return updateProgress(entry, session.endPage, now);
  if (
    session.kind === "viewing" &&
    entry.type === "series" &&
    session.episodesCompleted !== undefined
  )
    return updateSeriesProgress(
      entry,
      { episodesWatched: entry.episodesWatched + session.episodesCompleted },
      now,
    );
  if (session.kind === "study" && entry.type === "study") {
    if (entry.progressUnit === "sessions")
      return updateStudyProgress(entry, entry.progressCurrent + 1, now);
    if (entry.progressUnit === "hours")
      return updateStudyProgress(
        entry,
        entry.progressCurrent + Math.ceil(session.accumulatedDuration / 60),
        now,
      );
  }
  return startEntry(entry, now);
}

async function sessionEvent(
  dependencies: SessionDependencies,
  session: Session,
  status: "active" | "paused" | "completed" | "deleted",
  now: string,
) {
  return createSessionChangedEvent({
    eventId: await generatedId(dependencies, "generate_event_id"),
    aggregateId: session.entryId,
    occurredAt: now,
    revision: session.revision,
    payload: { entryType: session.entryType, sessionId: session.id, status },
  });
}

export class GetOpenSession {
  constructor(private readonly sessions: SessionDependencies["sessions"]) {}
  async execute(): Promise<Session | undefined> {
    try {
      return await this.sessions.getOpen();
    } catch {
      throw persistenceFailed("get_open_session");
    }
  }
}

export class ListSessions {
  constructor(private readonly sessions: SessionDependencies["sessions"]) {}
  async execute(): Promise<readonly Session[]> {
    return this.sessions.list();
  }
}

export class ListSessionsByEntry {
  constructor(private readonly sessions: SessionDependencies["sessions"]) {}
  async execute(input: unknown): Promise<readonly Session[]> {
    const { id: entryId } = parseInput(sessionIdSchema, input);
    return this.sessions.listByEntryId(entryId);
  }
}

export class StartSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<Session> {
    const parsed = parseInput(startSchema, input);
    const entry = await loadEntry(this.dependencies, parsed.entryId);
    if (entry.type !== parsed.entryType)
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "O tipo da sessão não corresponde ao registro.",
      );
    const [sessionId, activityId, now] = await Promise.all([
      generatedId(this.dependencies, "generate_session_id"),
      generatedId(this.dependencies, "generate_activity_id"),
      currentTime(this.dependencies),
    ]);
    const session = applyDomain(() =>
      createTimedSession({ id: sessionId, startedAt: now, ...parsed }),
    );
    const updatedEntry = applyDomain(() => startEntry(entry, now));
    const activity = createActivity({
      id: activityId,
      type: "session_started",
      aggregateId: entry.id,
      occurredAt: now,
      revision: session.revision,
      metadata: { sessionId, entryType: entry.type },
    });
    const event = await sessionEvent(this.dependencies, session, "active", now);
    let milestoneEvents = Object.freeze(
      [],
    ) as readonly import("../domain").DomainEvent[];
    await runTransaction(this.dependencies, async () => {
      if (await this.dependencies.sessions.getOpen())
        throw new ApplicationError(
          "CONFLICT",
          "Já existe uma sessão em andamento.",
        );
      await saveEntity(
        () => this.dependencies.sessions.save(session),
        "save_session",
      );
      if (updatedEntry !== entry)
        await saveEntity(
          () => this.dependencies.libraryEntries.save(updatedEntry),
          "save_entry",
        );
      await saveActivity(this.dependencies, activity);
      milestoneEvents = await processMilestones(this.dependencies, event);
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return session;
  }
}

export class PauseSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<Session> {
    const { id: sessionId } = parseInput(sessionIdSchema, input);
    const existing = await loadSession(this.dependencies, sessionId);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() => pauseSession(existing, now));
    await runTransaction(this.dependencies, () =>
      saveEntity(
        () => this.dependencies.sessions.save(updated),
        "save_session",
      ),
    );
    await publishEvent(
      this.dependencies,
      await sessionEvent(this.dependencies, updated, "paused", now),
    );
    return updated;
  }
}

export class ResumeSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<Session> {
    const { id: sessionId } = parseInput(sessionIdSchema, input);
    const existing = await loadSession(this.dependencies, sessionId);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() => resumeSession(existing, now));
    await runTransaction(this.dependencies, async () => {
      const open = await this.dependencies.sessions.getOpen();
      if (open && open.id !== existing.id)
        throw new ApplicationError(
          "CONFLICT",
          "Já existe uma sessão em andamento.",
        );
      await saveEntity(
        () => this.dependencies.sessions.save(updated),
        "save_session",
      );
    });
    await publishEvent(
      this.dependencies,
      await sessionEvent(this.dependencies, updated, "active", now),
    );
    return updated;
  }
}

export class CompleteSession {
  private readonly inFlight = new Map<
    string,
    Promise<SessionCompletionResult>
  >();

  constructor(private readonly dependencies: SessionDependencies) {}

  async execute(input: unknown): Promise<SessionCompletionResult> {
    const { id: sessionId } = parseInput(sessionIdSchema, input);
    const existing = this.inFlight.get(sessionId);
    if (existing) return existing;
    const operation = this.complete(sessionId);
    this.inFlight.set(sessionId, operation);
    try {
      return await operation;
    } finally {
      if (this.inFlight.get(sessionId) === operation)
        this.inFlight.delete(sessionId);
    }
  }

  private async complete(sessionId: string): Promise<SessionCompletionResult> {
    const existing = await loadSession(this.dependencies, sessionId);
    const entry = await loadEntry(this.dependencies, existing.entryId);
    const [activityId, now] = await Promise.all([
      generatedId(this.dependencies, "generate_activity_id"),
      currentTime(this.dependencies),
    ]);
    const completed = applyDomain(() => completeSession(existing, now));
    const updatedEntry = applyDomain(() =>
      applyCompletedSession(entry, completed, now),
    );
    const activity = createActivity({
      id: activityId,
      type: "session_completed",
      aggregateId: entry.id,
      occurredAt: now,
      revision: completed.revision,
      metadata: {
        sessionId,
        entryType: entry.type,
        duration: completed.accumulatedDuration,
      },
    });
    const event = await sessionEvent(
      this.dependencies,
      completed,
      "completed",
      now,
    );
    let milestoneEvents = Object.freeze(
      [],
    ) as readonly import("../domain").DomainEvent[];
    let reached = Object.freeze(
      [],
    ) as readonly import("../domain").ReachedMilestone[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.sessions.save(completed),
        "save_session",
      );
      if (updatedEntry !== entry)
        await saveEntity(
          () => this.dependencies.libraryEntries.save(updatedEntry),
          "save_entry",
        );
      await saveActivity(this.dependencies, activity);
      const processed = await processMilestonesWithDetails(
        this.dependencies,
        event,
      );
      milestoneEvents = processed.events;
      reached = processed.reached;
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return completionResult(completed, reached);
  }
}

export class CreateManualSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<SessionCompletionResult> {
    const parsed = parseInput(manualSchema, input);
    const entry = await loadEntry(this.dependencies, parsed.entryId);
    if (entry.type !== parsed.entryType)
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "O tipo da sessão não corresponde ao registro.",
      );
    const [sessionId, activityId, now] = await Promise.all([
      generatedId(this.dependencies, "generate_session_id"),
      generatedId(this.dependencies, "generate_activity_id"),
      currentTime(this.dependencies),
    ]);
    const occurredAt = parsed.occurredAt ?? now;
    const session = applyDomain(() =>
      createManualSession({ id: sessionId, ...parsed, occurredAt }),
    );
    const updatedEntry = applyDomain(() =>
      applyCompletedSession(entry, session, now),
    );
    const activity = createActivity({
      id: activityId,
      type: "session_completed",
      aggregateId: entry.id,
      occurredAt: now,
      revision: session.revision,
      metadata: {
        sessionId,
        entryType: entry.type,
        duration: session.accumulatedDuration,
      },
    });
    const event = await sessionEvent(
      this.dependencies,
      session,
      "completed",
      now,
    );
    let milestoneEvents = Object.freeze(
      [],
    ) as readonly import("../domain").DomainEvent[];
    let reached = Object.freeze(
      [],
    ) as readonly import("../domain").ReachedMilestone[];
    await runTransaction(this.dependencies, async () => {
      await saveEntity(
        () => this.dependencies.sessions.save(session),
        "save_session",
      );
      if (updatedEntry !== entry)
        await saveEntity(
          () => this.dependencies.libraryEntries.save(updatedEntry),
          "save_entry",
        );
      await saveActivity(this.dependencies, activity);
      const processed = await processMilestonesWithDetails(
        this.dependencies,
        event,
      );
      milestoneEvents = processed.events;
      reached = processed.reached;
    });
    await publishEvents(this.dependencies, [event, ...milestoneEvents]);
    return completionResult(session, reached);
  }
}

export class DeleteSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<{ readonly deleted: true }> {
    const { id: sessionId } = parseInput(sessionIdSchema, input);
    const existing = await loadSession(this.dependencies, sessionId);
    const now = await currentTime(this.dependencies);
    await runTransaction(this.dependencies, async () => {
      if (!(await this.dependencies.sessions.delete(sessionId)))
        throw new ApplicationError("NOT_FOUND", "Sessão não encontrada.");
    });
    await publishEvent(
      this.dependencies,
      await sessionEvent(this.dependencies, existing, "deleted", now),
    );
    return Object.freeze({ deleted: true as const });
  }
}

export class EditSession {
  constructor(private readonly dependencies: SessionDependencies) {}
  async execute(input: unknown): Promise<Session> {
    const parsed = parseInput(editSchema, input);
    const existing = await loadSession(this.dependencies, parsed.id);
    const now = await currentTime(this.dependencies);
    const updated = applyDomain(() =>
      editCompletedSession(existing, parsed, now),
    );
    await runTransaction(this.dependencies, () =>
      saveEntity(
        () => this.dependencies.sessions.save(updated),
        "save_session",
      ),
    );
    await publishEvent(
      this.dependencies,
      await sessionEvent(this.dependencies, updated, "completed", now),
    );
    return updated;
  }
}
