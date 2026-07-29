import type { Activity } from "./activities";
import type { ApplicationDependencies } from "./ports";
import type { DomainEvent } from "../domain";
import {
  ApplicationError,
  activityPersistenceFailed,
  eventPublicationFailed,
  persistenceFailed,
  toValidationError,
} from "./errors";
import { z } from "zod";

const generatedIdSchema = z.string().trim().min(1);
const clockValueSchema = z.iso.datetime({ offset: false });

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error: unknown) {
    throw toValidationError(error);
  }
}

export function applyDomain<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error: unknown) {
    if (error instanceof ApplicationError) throw error;
    throw toValidationError(error);
  }
}

export async function saveEntity(
  operation: () => Promise<void>,
  name: string,
): Promise<void> {
  try {
    await operation();
  } catch {
    throw persistenceFailed(name);
  }
}

export async function saveActivity(
  dependencies: Pick<ApplicationDependencies, "activities">,
  activity: Activity,
): Promise<void> {
  try {
    await dependencies.activities.save(activity);
  } catch {
    throw activityPersistenceFailed();
  }
}

export async function publishEvent(
  dependencies: Pick<ApplicationDependencies, "events">,
  event: DomainEvent,
): Promise<void> {
  try {
    await dependencies.events.publish(event);
  } catch {
    throw eventPublicationFailed();
  }
}

export async function generatedId(
  dependencies: Pick<ApplicationDependencies, "ids">,
  operation: string,
): Promise<string> {
  try {
    return generatedIdSchema.parse(await dependencies.ids.generate());
  } catch {
    throw persistenceFailed(operation);
  }
}

export async function currentTime(
  dependencies: Pick<ApplicationDependencies, "clock">,
): Promise<string> {
  try {
    return clockValueSchema.parse(await dependencies.clock.now());
  } catch {
    throw persistenceFailed("read_clock");
  }
}
