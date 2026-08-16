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
  private desiredMusic = false;
  private musicIndex = 0;
  private music?: AudioPlayback;
  private musicGeneration = 0;
  private musicStarting = false;
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
    const issues = validateAudioConfiguration(configuration);
    if (issues.length > 0)
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
      activeMusicPlayers: this.music ? 1 : 0,
      desiredMusic: this.desiredMusic,
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
          if (!this.desiredMusic)
            void this.backend
              .prepare(this.libraryTrack(0))
              .catch(() => this.reporter.warn("MUSIC_PREPARATION_FAILED"));
          this.startDesiredMusic();
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
    switch (intent.type) {
      case "LibraryEntered":
        this.desiredMusic = true;
        this.startDesiredMusic();
        return;
      case "LibraryExited":
        this.desiredMusic = false;
        this.musicIndex = 0;
        this.stopMusic();
        return;
      case "PageChanged":
        this.playEffect("ui.page-turn");
        return;
      case "ShelfSelected":
        this.playEffect("interaction.shelf-touch");
        return;
      case "LibrarianSelected":
        this.playEffect("interaction.librarian-touch");
        return;
      case "CreatureSelected":
        this.playEffect("interaction.creature-touch");
        return;
      case "BookCompleted":
        this.playEffect("milestone.book-completed");
    }
  }

  pause(): void {
    if (this.paused || this.state === "disposed") return;
    this.paused = true;
    this.pendingEffects.length = 0;
    this.stopMusic();
    for (const effect of [...this.effects]) effect.stop();
    this.effects.clear();
  }

  resume(): void {
    if (!this.paused || this.state === "disposed") return;
    this.paused = false;
    this.startDesiredMusic();
  }

  async setMusicVolume(next: number): Promise<void> {
    this.currentPreferences = Object.freeze({
      ...this.currentPreferences,
      musicVolume: volume(next),
    });
    this.music?.setVolume(this.currentPreferences.musicVolume);
    await this.persist();
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
      this.stopMusic();
      for (const effect of [...this.effects]) effect.stop();
      this.effects.clear();
    } else {
      this.startDesiredMusic();
    }
    await this.persist();
  }

  dispose(): void {
    if (this.state === "disposed") return;
    this.state = "disposed";
    this.desiredMusic = false;
    this.musicIndex = 0;
    this.pendingEffects.length = 0;
    this.stopMusic();
    for (const effect of [...this.effects]) effect.stop();
    this.effects.clear();
    this.backend.dispose();
  }

  private startDesiredMusic(): void {
    if (
      !this.desiredMusic ||
      this.music ||
      this.musicStarting ||
      this.paused ||
      this.currentPreferences.muted ||
      this.state !== "ready"
    )
      return;
    const cue = this.libraryTrack(this.musicIndex);
    const generation = this.musicGeneration;
    this.musicStarting = true;
    void this.backend
      .play(cue, this.currentPreferences.musicVolume)
      .then((playback) => {
        if (generation === this.musicGeneration) this.musicStarting = false;
        if (
          generation !== this.musicGeneration ||
          this.state !== "ready" ||
          this.paused ||
          this.currentPreferences.muted ||
          !this.desiredMusic ||
          this.libraryTrack(this.musicIndex).id !== cue.id ||
          this.music
        ) {
          playback.stop();
          return;
        }
        playback.setVolume(this.currentPreferences.musicVolume);
        this.music = playback;
        void playback.completed.finally(() => {
          if (generation !== this.musicGeneration || this.music !== playback)
            return;
          this.music = undefined;
          if (
            playback.available &&
            this.desiredMusic &&
            this.state === "ready" &&
            !this.paused &&
            !this.currentPreferences.muted
          ) {
            this.musicIndex =
              (this.musicIndex + 1) %
              this.configuration.playlists.library.length;
            this.startDesiredMusic();
          }
        });
      })
      .catch(() => {
        if (generation === this.musicGeneration) this.musicStarting = false;
        this.reporter.warn("MUSIC_PLAYBACK_FAILED");
      });
  }

  private stopMusic(): void {
    this.musicGeneration += 1;
    this.musicStarting = false;
    this.music?.stop();
    this.music = undefined;
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

  private libraryTrack(index: number) {
    const id = this.configuration.playlists.library[index];
    const cue = id === undefined ? undefined : this.configuration.manifest[id];
    if (!cue) throw new RangeError("Configuração de playlist inválida.");
    return cue;
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
