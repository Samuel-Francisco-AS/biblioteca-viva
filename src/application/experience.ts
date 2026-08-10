export const EXPERIENCE_PREFERENCE_DEFAULTS = Object.freeze({
  highContrast: false,
  motion: "system" as const,
  textSize: "default" as const,
});

export type MotionPreference = "system" | "reduce" | "normal";
export type TextSizePreference = "default" | "large" | "larger";

export interface ExperiencePreferences {
  readonly highContrast: boolean;
  readonly motion: MotionPreference;
  readonly textSize: TextSizePreference;
}

export interface EffectiveExperiencePreferences {
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly textSize: TextSizePreference;
}

export interface ExperienceSettingsPort {
  load(): Promise<ExperiencePreferences | undefined>;
  save(preferences: ExperiencePreferences): Promise<void>;
}

export interface ExperienceErrorReporter {
  warn(code: "EXPERIENCE_PREFERENCES_LOAD_FAILED"): void;
}

export type ExperiencePreferenceListener = (
  preferences: ExperiencePreferences,
) => void;

export interface ExperiencePreferencesPort {
  preferences(this: void): ExperiencePreferences;
  resolve(
    this: void,
    systemReducedMotion: boolean,
  ): EffectiveExperiencePreferences;
  setHighContrast(this: void, enabled: boolean): Promise<void>;
  setMotion(this: void, preference: MotionPreference): Promise<void>;
  setTextSize(this: void, preference: TextSizePreference): Promise<void>;
  subscribe(this: void, listener: ExperiencePreferenceListener): () => void;
}

export function resolveExperiencePreferences(
  preferences: ExperiencePreferences,
  systemReducedMotion: boolean,
): EffectiveExperiencePreferences {
  return Object.freeze({
    highContrast: preferences.highContrast,
    reducedMotion:
      preferences.motion === "reduce" ||
      (preferences.motion === "system" && systemReducedMotion),
    textSize: preferences.textSize,
  });
}

export class ExperiencePreferencesService implements ExperiencePreferencesPort {
  private current: ExperiencePreferences = EXPERIENCE_PREFERENCE_DEFAULTS;
  private readonly listeners = new Set<ExperiencePreferenceListener>();
  private persistenceQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly settings: ExperienceSettingsPort,
    private readonly reporter: ExperienceErrorReporter,
  ) {}

  async loadPreferences(): Promise<void> {
    try {
      this.current =
        (await this.settings.load()) ?? EXPERIENCE_PREFERENCE_DEFAULTS;
    } catch {
      this.current = EXPERIENCE_PREFERENCE_DEFAULTS;
      this.reporter.warn("EXPERIENCE_PREFERENCES_LOAD_FAILED");
    }
  }

  preferences(): ExperiencePreferences {
    return Object.freeze({ ...this.current });
  }

  resolve(systemReducedMotion: boolean): EffectiveExperiencePreferences {
    return resolveExperiencePreferences(this.current, systemReducedMotion);
  }

  setHighContrast(enabled: boolean): Promise<void> {
    return this.update({ ...this.current, highContrast: enabled });
  }

  setMotion(preference: MotionPreference): Promise<void> {
    return this.update({ ...this.current, motion: preference });
  }

  setTextSize(preference: TextSizePreference): Promise<void> {
    return this.update({ ...this.current, textSize: preference });
  }

  subscribe(listener: ExperiencePreferenceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private update(preferences: ExperiencePreferences): Promise<void> {
    this.current = Object.freeze(preferences);
    this.listeners.forEach((listener) => listener(this.preferences()));
    const save = this.persistenceQueue
      .catch(() => undefined)
      .then(() => this.settings.save(preferences));
    this.persistenceQueue = save;
    return save;
  }
}
