import { InvalidFieldError, InvalidStatusTransitionError } from "./errors";
import type { EntryType, Session } from "./types";
import {
  nextMetadata,
  requireId,
  requireIsoUtc,
  requireText,
} from "./validation";

export type SessionSpecificInput =
  | {
      readonly entryType: "book";
      readonly startPage?: number;
      readonly endPage?: number;
    }
  | {
      readonly entryType: "movie" | "series";
      readonly watchedDuration?: number;
      readonly episodesCompleted?: number;
    }
  | { readonly entryType: "study" }
  | {
      readonly entryType: "physical_activity";
      readonly distanceMeters?: number;
      readonly perceivedExertion?: number;
    }
  | { readonly entryType: "work"; readonly result?: string };

function nonnegative(
  value: number | undefined,
  field: string,
): number | undefined {
  if (value !== undefined && (!Number.isInteger(value) || value < 0))
    throw new InvalidFieldError(field, "deve ser inteiro não negativo");
  return value;
}

function positive(
  value: number | undefined,
  field: string,
): number | undefined {
  if (value !== undefined && (!Number.isInteger(value) || value <= 0))
    throw new InvalidFieldError(field, "deve ser inteiro positivo");
  return value;
}

function specific(input: SessionSpecificInput) {
  switch (input.entryType) {
    case "book":
      return {
        kind: "reading" as const,
        entryType: input.entryType,
        ...(positive(input.startPage, "startPage") !== undefined && {
          startPage: input.startPage,
        }),
        ...(positive(input.endPage, "endPage") !== undefined && {
          endPage: input.endPage,
        }),
      };
    case "movie":
    case "series":
      return {
        kind: "viewing" as const,
        entryType: input.entryType,
        ...(nonnegative(input.watchedDuration, "watchedDuration") !==
          undefined && { watchedDuration: input.watchedDuration }),
        ...(nonnegative(input.episodesCompleted, "episodesCompleted") !==
          undefined && { episodesCompleted: input.episodesCompleted }),
      };
    case "study":
      return { kind: "study" as const, entryType: input.entryType };
    case "physical_activity": {
      const exertion = positive(input.perceivedExertion, "perceivedExertion");
      if (exertion !== undefined && exertion > 10)
        throw new InvalidFieldError(
          "perceivedExertion",
          "deve ficar entre 1 e 10",
        );
      return {
        kind: "physical_activity" as const,
        entryType: input.entryType,
        ...(nonnegative(input.distanceMeters, "distanceMeters") !==
          undefined && { distanceMeters: input.distanceMeters }),
        ...(exertion !== undefined && { perceivedExertion: exertion }),
      };
    }
    case "work":
      return {
        kind: "work" as const,
        entryType: input.entryType,
        ...(input.result !== undefined && {
          result: requireText(input.result, "result"),
        }),
      };
  }
}

export function createTimedSession(
  input: {
    readonly id: string;
    readonly entryId: string;
    readonly startedAt: string;
    readonly note?: string;
  } & SessionSpecificInput,
): Session {
  const startedAt = requireIsoUtc(input.startedAt, "startedAt");
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    ...specific(input),
    status: "active",
    startedAt,
    accumulatedDuration: 0,
    activeSince: startedAt,
    ...(input.note !== undefined && { note: requireText(input.note, "note") }),
    createdAt: startedAt,
    updatedAt: startedAt,
    revision: 1,
  });
}

export function createManualSession(
  input: {
    readonly id: string;
    readonly entryId: string;
    readonly occurredAt: string;
    readonly duration: number;
    readonly note?: string;
  } & SessionSpecificInput,
): Session {
  const occurredAt = requireIsoUtc(input.occurredAt, "occurredAt");
  const duration = positive(input.duration, "duration");
  if (duration === undefined)
    throw new InvalidFieldError("duration", "é obrigatória");
  return Object.freeze({
    id: requireId(input.id),
    entryId: requireId(input.entryId, "entryId"),
    ...specific(input),
    status: "completed",
    startedAt: occurredAt,
    endedAt: occurredAt,
    accumulatedDuration: duration,
    ...(input.note !== undefined && { note: requireText(input.note, "note") }),
    createdAt: occurredAt,
    updatedAt: occurredAt,
    revision: 1,
  });
}

function elapsedSeconds(from: string, to: string): number {
  const elapsed = Math.floor((Date.parse(to) - Date.parse(from)) / 1000);
  if (!Number.isFinite(elapsed) || elapsed < 0)
    throw new InvalidFieldError("occurredAt", "não pode preceder a sessão");
  return elapsed;
}

export function currentSessionDuration(session: Session, now: string): number {
  const timestamp = requireIsoUtc(now, "now");
  return session.status === "active" && session.activeSince !== undefined
    ? session.accumulatedDuration +
        elapsedSeconds(session.activeSince, timestamp)
    : session.accumulatedDuration;
}

export function pauseSession(session: Session, pausedAt: string): Session {
  if (session.status !== "active" || session.activeSince === undefined)
    throw new InvalidStatusTransitionError(session.status, "paused");
  const timestamp = requireIsoUtc(pausedAt, "pausedAt");
  return Object.freeze({
    ...session,
    ...nextMetadata(session, timestamp),
    status: "paused",
    accumulatedDuration: currentSessionDuration(session, timestamp),
    activeSince: undefined,
  });
}

export function resumeSession(session: Session, resumedAt: string): Session {
  if (session.status !== "paused")
    throw new InvalidStatusTransitionError(session.status, "active");
  const timestamp = requireIsoUtc(resumedAt, "resumedAt");
  return Object.freeze({
    ...session,
    ...nextMetadata(session, timestamp),
    status: "active",
    activeSince: timestamp,
    endedAt: undefined,
  });
}

export function completeSession(session: Session, endedAt: string): Session {
  if (session.status === "completed")
    throw new InvalidStatusTransitionError(session.status, "completed");
  const timestamp = requireIsoUtc(endedAt, "endedAt");
  const accumulatedDuration = currentSessionDuration(session, timestamp);
  return Object.freeze({
    ...session,
    ...nextMetadata(session, timestamp),
    status: "completed",
    accumulatedDuration,
    activeSince: undefined,
    endedAt: timestamp,
  });
}

export function editCompletedSession(
  session: Session,
  input: { readonly duration: number; readonly note?: string },
  updatedAt: string,
): Session {
  if (session.status !== "completed")
    throw new InvalidStatusTransitionError(session.status, "completed");
  const duration = positive(input.duration, "duration");
  if (duration === undefined)
    throw new InvalidFieldError("duration", "é obrigatória");
  return Object.freeze({
    ...session,
    ...nextMetadata(session, requireIsoUtc(updatedAt, "updatedAt")),
    accumulatedDuration: duration,
    note:
      input.note === undefined ? undefined : requireText(input.note, "note"),
  });
}

export function sessionKindFor(entryType: EntryType): Session["kind"] {
  switch (entryType) {
    case "book":
      return "reading";
    case "movie":
    case "series":
      return "viewing";
    case "study":
      return "study";
    case "physical_activity":
      return "physical_activity";
    case "work":
      return "work";
  }
}
