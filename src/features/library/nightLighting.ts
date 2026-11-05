import { z } from "zod";
import { LIBRARY_FURNISHING } from "./three/libraryFurnishingLayout";

/** Existing physical shades, not new furniture or selectable objects. */
const lampOffsets = {
  study: { x: 0, z: 0, y: 1.63 },
  lounge: { x: 1.2, z: -0.9, y: 0.77 },
  cabinet: { x: 0.5, z: 0, y: 1.82 },
} as const;

export const NIGHT_LAMPS = Object.freeze(
  LIBRARY_FURNISHING.filter(
    (p) =>
      (p.kind === "study" || p.kind === "lounge" || p.kind === "cabinet") &&
      // The BF-4E parchment lamp remains exclusively player-operated.
      p.id !== "bf4-prop:0",
  ).map((p) => {
    const offset = lampOffsets[p.kind as keyof typeof lampOffsets];
    const cosine = Math.cos(p.rotation);
    const sine = Math.sin(p.rotation);
    return Object.freeze({
      id: `night-lamp:${p.id}`,
      roomId: p.roomId,
      x: p.x + offset.x * cosine + offset.z * sine,
      z: p.z - offset.x * sine + offset.z * cosine,
      y: offset.y,
    });
  }),
);

const checkpointSchema = z.strictObject({
  version: z.literal(1),
  cycleKey: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  completedLampIds: z.array(z.string().max(80)).max(NIGHT_LAMPS.length),
});
export type NightLightingCheckpoint = z.infer<typeof checkpointSchema>;

export interface NightLightingPort {
  load(): Promise<NightLightingCheckpoint | undefined>;
  save(value: NightLightingCheckpoint): Promise<void>;
}

export function parseNightLightingCheckpoint(
  value: unknown,
): NightLightingCheckpoint | undefined {
  const parsed = checkpointSchema.safeParse(value);
  if (!parsed.success) return undefined;
  const ids = parsed.data.completedLampIds;
  if (
    new Set(ids).size !== ids.length ||
    ids.some((id) => !NIGHT_LAMPS.some((lamp) => lamp.id === id)) ||
    (parsed.data.cycleKey === null && ids.length > 0)
  ) {
    return undefined;
  }
  return parsed.data;
}

/** Local 18:00–06:00 cycle; post-midnight hours belong to the prior evening. */
export function nightCycleKey(date: Date): string | null {
  const hour = date.getHours();
  if (hour >= 6 && hour < 18) return null;
  const day =
    hour < 6
      ? new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
      : date;
  return [day.getFullYear(), day.getMonth() + 1, day.getDate()]
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, "0"),
    )
    .join("-");
}

export interface NightLightingSnapshot {
  readonly cycleKey: string | null;
  readonly completedLampIds: readonly string[];
  readonly revision: number;
}

/**
 * Lamp luminosity is authoritative and independent of inhabitant gestures.
 * At dusk lamps already give usable light; after 45s their full intensity is
 * guaranteed even if nobody reaches the lamp. No timers or frame writes.
 */
export class NightLightingSession {
  private snapshot: NightLightingSnapshot;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly now: () => Date = () => new Date()) {
    this.snapshot = {
      cycleKey: nightCycleKey(now()),
      completedLampIds: [],
      revision: 0,
    };
  }

  getSnapshot = (): NightLightingSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  refreshContext(): void {
    const cycleKey = nightCycleKey(this.now());
    if (cycleKey !== this.snapshot.cycleKey) {
      this.publish({ cycleKey, completedLampIds: [] });
    }
  }

  restore(value: unknown): boolean {
    const parsed = parseNightLightingCheckpoint(value);
    if (!parsed || parsed.cycleKey !== this.snapshot.cycleKey) return false;
    this.snapshot = {
      ...this.snapshot,
      completedLampIds: [...parsed.completedLampIds],
    };
    return true;
  }

  capture(): NightLightingCheckpoint {
    return {
      version: 1,
      cycleKey: this.snapshot.cycleKey,
      completedLampIds: [...this.snapshot.completedLampIds],
    };
  }

  pending(): readonly (typeof NIGHT_LAMPS)[number][] {
    if (this.snapshot.cycleKey === null) return [];
    return NIGHT_LAMPS.filter(
      (lamp) => !this.snapshot.completedLampIds.includes(lamp.id),
    );
  }

  complete(lampId: string): boolean {
    if (
      this.snapshot.cycleKey === null ||
      !NIGHT_LAMPS.some((lamp) => lamp.id === lampId) ||
      this.snapshot.completedLampIds.includes(lampId)
    ) {
      return false;
    }
    this.publish({
      ...this.snapshot,
      completedLampIds: [...this.snapshot.completedLampIds, lampId],
    });
    return true;
  }

  /** 0 by day; usable 0.68 at dusk; full after gesture or magic fallback. */
  power(lampId: string): number {
    const key = this.snapshot.cycleKey;
    if (key === null || !NIGHT_LAMPS.some((lamp) => lamp.id === lampId))
      return 0;
    if (this.snapshot.completedLampIds.includes(lampId)) return 1;
    const now = this.now();
    const dusk = new Date(`${key}T18:00:00`).getTime();
    return now.getTime() - dusk >= 45_000 ? 1 : 0.68;
  }

  private publish(value: Omit<NightLightingSnapshot, "revision">): void {
    this.snapshot = { ...value, revision: this.snapshot.revision + 1 };
    for (const listener of this.listeners) listener();
  }
}
