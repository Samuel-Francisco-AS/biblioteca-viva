import { z } from "zod";
import { INHABITANTS } from "./inhabitants";

/**
 * BF-5.5A: versioned intention and position checkpoint, never per-frame data.
 * Does not contain personal-library text or other record content.
 */
const pointSchema = z.strictObject({
  x: z.number().finite(),
  z: z.number().finite(),
});
const agentSchema = z.strictObject({
  id: z.enum([
    "character:samael",
    "character:aryn",
    "character:ytha",
    "character:lua",
  ]),
  x: z.number().finite(),
  z: z.number().finite(),
  facing: z.number().finite(),
  phase: z.enum(["idle", "navigate", "work"]),
  taskId: z.string().max(80).nullable(),
  destination: pointSchema.nullable(),
  remainingSeconds: z.number().finite().min(0).max(90),
  recentTaskIds: z.array(z.string().max(80)).max(6),
  taskCount: z.number().int().min(0).max(100_000_000),
});
export const inhabitantContinuitySchema = z.strictObject({
  version: z.literal(1),
  savedAt: z.string().datetime({ offset: true }),
  randomState: z.number().int().min(0).max(0xffffffff),
  agents: z.array(agentSchema).length(INHABITANTS.length),
});
export type InhabitantContinuitySnapshot = z.infer<
  typeof inhabitantContinuitySchema
>;
export interface InhabitantContinuityPort {
  load(): Promise<InhabitantContinuitySnapshot | undefined>;
  save(snapshot: InhabitantContinuitySnapshot): Promise<void>;
}

/** Malformed, legacy or partial data must never enter the navigation engine. */
export function parseInhabitantContinuity(
  input: unknown,
): InhabitantContinuitySnapshot | undefined {
  const result = inhabitantContinuitySchema.safeParse(input);
  if (!result.success) return undefined;
  const ids = result.data.agents.map(({ id }) => id);
  if (
    new Set(ids).size !== INHABITANTS.length ||
    INHABITANTS.some(({ id }) => !ids.includes(id)) ||
    !Number.isFinite(Date.parse(result.data.savedAt))
  ) {
    return undefined;
  }
  return result.data;
}
