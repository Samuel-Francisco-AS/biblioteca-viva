import type { PhysicalProfilePort } from "../../application/workouts";
import {
  physicalProfileSchema,
  type PhysicalProfile,
} from "../../domain/workouts";
import type { Clock } from "../../application";
import type { BibliotecaDatabase } from "./database";
export const PHYSICAL_PROFILE_KEY = "physical.profile.v1";
export class DexiePhysicalProfile implements PhysicalProfilePort {
  constructor(
    private readonly db: BibliotecaDatabase,
    private readonly clock: Clock,
  ) {}
  async load() {
    const row = await this.db.settings.get(PHYSICAL_PROFILE_KEY);
    return row ? physicalProfileSchema.parse(row.value) : undefined;
  }
  async save(profile: PhysicalProfile | undefined) {
    if (!profile) {
      await this.db.settings.delete(PHYSICAL_PROFILE_KEY);
      return;
    }
    await this.db.settings.put({
      key: PHYSICAL_PROFILE_KEY,
      value: physicalProfileSchema.parse(profile),
      updatedAt: await this.clock.now(),
    });
  }
}
