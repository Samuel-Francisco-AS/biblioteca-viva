import { z } from "zod";

import type { AudioPreferences, AudioSettingsPort } from "../../application";
import type { Clock } from "../../application";
import type { BibliotecaDatabase } from "../database/database";

export const AUDIO_SETTINGS_KEY = "audio.preferences.v1";

const audioPreferencesSchema = z.strictObject({
  effectsVolume: z.number().min(0).max(1),
  muted: z.boolean(),
});

export class DexieAudioSettingsRepository implements AudioSettingsPort {
  constructor(
    private readonly database: BibliotecaDatabase,
    private readonly clock: Clock,
  ) {}

  async load(): Promise<AudioPreferences | undefined> {
    const stored = await this.database.settings.get(AUDIO_SETTINGS_KEY);
    if (!stored) return undefined;
    return Object.freeze(audioPreferencesSchema.parse(stored.value));
  }

  async save(preferences: AudioPreferences): Promise<void> {
    const value = audioPreferencesSchema.parse(preferences);
    await this.database.settings.put({
      key: AUDIO_SETTINGS_KEY,
      value,
      updatedAt: await this.clock.now(),
    });
  }
}
