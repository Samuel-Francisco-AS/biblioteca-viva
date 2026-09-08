import {
  AUDIO_PREFERENCE_DEFAULTS,
  type AudioAvailability,
  type AudioIntent,
  type AudioPort,
  type AudioPreferences,
  type AudioSettingsPort,
} from "../../application";
import type {
  AudioBackend,
  AudioErrorReporter,
  AudioPlayback,
} from "./audioBackend";
import {
  AUDIO_CONFIGURATION,
  validateAudioConfiguration,
  type AudioConfiguration,
  type AudioCueId,
} from "./audioManifest";

function volume(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new RangeError("O volume deve estar entre 0 e 1.");
  return value;
}

export class AudioService implements AudioPort {
  private state: AudioAvailability = "not-initialized";
  private currentPreferences: AudioPreferences = AUDIO_PREFERENCE_DEFAULTS;
  private readonly effects = new Set<AudioPlayback>();
  private initializing?: Promise<AudioAvailability>;
  private paused = false;
  private readonly pendingEffects: AudioCueId[] = [];
  private persistenceQueue: Promise<void> = Promise.resolve();

  constructor(
    private readonly backend: AudioBackend,
    private readonly settings: AudioSettingsPort,
    private readonly reporter: AudioErrorReporter,
    private readonly configuration: AudioConfiguration = AUDIO_CONFIGURATION,
  ) {
    if (validateAudioConfiguration(configuration).length > 0)
      throw new RangeError("Configuração de áudio inválida.");
  }

  async loadPreferences(): Promise<void> {
    try {
      this.currentPreferences =
        (await this.settings.load()) ?? AUDIO_PREFERENCE_DEFAULTS;
    } catch {
      this.reporter.warn("PREFERENCES_LOAD_FAILED");
      this.currentPreferences = AUDIO_PREFERENCE_DEFAULTS;
    }
  }

  availability(): AudioAvailability {
    return this.state;
  }

  diagnostics() {
    return Object.freeze({
      activeEffects: this.effects.size,
      pendingEffects: this.pendingEffects.length,
      state: this.state,
      suspended: this.paused,
    });
  }

  preferences(): AudioPreferences {
    return Object.freeze({ ...this.currentPreferences });
  }

  initialize(): Promise<AudioAvailability> {
    if (this.state !== "not-initialized") return Promise.resolve(this.state);
    if (this.initializing) return this.initializing;
    this.initializing = this.backend
      .initialize()
      .then((available) => {
        if (this.state === "disposed") return this.state;
        this.state = available ? "ready" : "unavailable";
        if (!available) {
          this.reporter.warn("BACKEND_UNAVAILABLE");
          this.pendingEffects.length = 0;
        } else {
          for (const id of this.pendingEffects.splice(0)) this.playEffect(id);
        }
        return this.state;
      })
      .catch(() => {
        this.state = "unavailable";
        this.pendingEffects.length = 0;
        this.reporter.warn("BACKEND_INITIALIZATION_FAILED");
        return this.state;
      })
      .finally(() => {
        this.initializing = undefined;
      });
    return this.initializing;
  }

  emit(intent: AudioIntent): void {
    if (this.state === "disposed") return;
    this.playEffect(
      intent.type === "PageChanged"
        ? "ui.page-turn"
        : "milestone.book-completed",
    );
  }

  pause(): void {
    if (this.paused || this.state === "disposed") return;
    this.paused = true;
    this.pendingEffects.length = 0;
    for (const effect of [...this.effects]) effect.stop();
    this.effects.clear();
  }

  resume(): void {
    if (!this.paused || this.state === "disposed") return;
    this.paused = false;
  }

  async setEffectsVolume(next: number): Promise<void> {
    this.currentPreferences = Object.freeze({
      ...this.currentPreferences,
      effectsVolume: volume(next),
    });
    for (const effect of this.effects)
      effect.setVolume(this.currentPreferences.effectsVolume);
    await this.persist();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.currentPreferences = Object.freeze({
      ...this.currentPreferences,
      muted,
    });
    if (muted) {
      for (const effect of [...this.effects]) effect.stop();
      this.effects.clear();
    }
    await this.persist();
  }

  dispose(): void {
    if (this.state === "disposed") return;
    this.state = "disposed";
    this.pendingEffects.length = 0;
    for (const effect of [...this.effects]) effect.stop();
    this.effects.clear();
    this.backend.dispose();
  }

  private playEffect(id: AudioCueId): void {
    if (this.state === "not-initialized" && this.initializing) {
      if (this.pendingEffects.length < 4) this.pendingEffects.push(id);
      return;
    }
    if (this.state !== "ready" || this.paused || this.currentPreferences.muted)
      return;
    void this.backend
      .play(
        this.configuration.manifest[id],
        this.currentPreferences.effectsVolume,
      )
      .then((playback) => {
        if (
          this.state !== "ready" ||
          this.paused ||
          this.currentPreferences.muted
        ) {
          playback.stop();
          return;
        }
        playback.setVolume(this.currentPreferences.effectsVolume);
        this.effects.add(playback);
        void playback.completed.finally(() => this.effects.delete(playback));
      })
      .catch(() => this.reporter.warn("EFFECT_PLAYBACK_FAILED"));
  }

  private persist(): Promise<void> {
    const snapshot = this.preferences();
    const operation = this.persistenceQueue.then(() =>
      this.settings.save(snapshot),
    );
    this.persistenceQueue = operation.catch(() => undefined);
    return operation.catch((error: unknown) => {
      this.reporter.warn("PREFERENCES_SAVE_FAILED");
      throw error;
    });
  }
}
