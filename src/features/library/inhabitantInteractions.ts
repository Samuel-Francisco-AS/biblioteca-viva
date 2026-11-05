import type { InhabitantKey } from "./inhabitants";

export type InteractionTaskState =
  | "queued"
  | "approaching"
  | "orienting"
  | "picking"
  | "carrying"
  | "placing"
  | "recollecting"
  | "returning"
  | "completed"
  | "cancelled"
  | "interrupted"
  | "failed";

export interface InteractionTask {
  readonly id: string;
  readonly actor: InhabitantKey;
  readonly objectId: string;
  readonly source: { readonly x: number; readonly z: number };
  readonly destination: { readonly x: number; readonly z: number };
  readonly reach: number;
  readonly state: InteractionTaskState;
}

export interface InteractionLease {
  readonly resourceId: string;
  readonly owner: InhabitantKey;
  readonly taskId: string;
  readonly expiresAt: number;
}

/**
 * Small, local coordinator for physical interactions. It is intentionally not
 * a general-purpose lock: one object or interaction point has one lease.
 */
export class InteractionCoordinator {
  private readonly leases = new Map<string, InteractionLease>();

  reserve(
    resourceId: string,
    owner: InhabitantKey,
    taskId: string,
    now: number,
    durationMs = 30_000,
  ): InteractionLease | null {
    this.reclaim(now);
    const current = this.leases.get(resourceId);
    if (current && (current.owner !== owner || current.taskId !== taskId))
      return null;
    const lease = Object.freeze({
      resourceId,
      owner,
      taskId,
      expiresAt: now + Math.max(1_000, durationMs),
    });
    this.leases.set(resourceId, lease);
    return lease;
  }

  renew(
    resourceId: string,
    owner: InhabitantKey,
    taskId: string,
    now: number,
    durationMs = 30_000,
  ): boolean {
    const current = this.leases.get(resourceId);
    if (
      !current ||
      current.owner !== owner ||
      current.taskId !== taskId ||
      current.expiresAt <= now
    ) {
      this.reclaim(now);
      return false;
    }
    this.leases.set(
      resourceId,
      Object.freeze({
        ...current,
        expiresAt: now + Math.max(1_000, durationMs),
      }),
    );
    return true;
  }

  owns(resourceId: string, owner: InhabitantKey, taskId: string, now: number) {
    this.reclaim(now);
    const lease = this.leases.get(resourceId);
    return lease?.owner === owner && lease.taskId === taskId;
  }

  release(resourceId: string, owner: InhabitantKey, taskId: string): void {
    const lease = this.leases.get(resourceId);
    if (lease?.owner === owner && lease.taskId === taskId)
      this.leases.delete(resourceId);
  }

  reclaim(now: number): void {
    for (const [resourceId, lease] of this.leases)
      if (lease.expiresAt <= now) this.leases.delete(resourceId);
  }

  snapshot(): readonly InteractionLease[] {
    return [...this.leases.values()];
  }
}
