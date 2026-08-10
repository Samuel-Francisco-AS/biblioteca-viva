import { z } from "zod";

import type {
  Clock,
  ExperienceErrorReporter,
  ExperiencePreferences,
  ExperienceSettingsPort,
} from "../../application";
import type { BibliotecaDatabase } from "../database/database";

export const EXPERIENCE_SETTINGS_KEY = "experience.preferences.v1";

export const experiencePreferencesSchema = z.strictObject({
  highContrast: z.boolean(),
  motion: z.enum(["system", "reduce", "normal"]),
  textSize: z.enum(["default", "large", "larger"]),
});

export const consoleExperienceErrorReporter: ExperienceErrorReporter = {
  warn(code) {
    console.warn(`[Biblioteca Viva] ${code}`);
  },
};

export class DexieExperienceSettingsRepository implements ExperienceSettingsPort {
  constructor(
    private readonly database: BibliotecaDatabase,
    private readonly clock: Clock,
  ) {}

  async load(): Promise<ExperiencePreferences | undefined> {
    const stored = await this.database.settings.get(EXPERIENCE_SETTINGS_KEY);
    if (!stored) return undefined;
    return Object.freeze(experiencePreferencesSchema.parse(stored.value));
  }

  async save(preferences: ExperiencePreferences): Promise<void> {
    const value = experiencePreferencesSchema.parse(preferences);
    await this.database.settings.put({
      key: EXPERIENCE_SETTINGS_KEY,
      value,
      updatedAt: await this.clock.now(),
    });
  }
}
