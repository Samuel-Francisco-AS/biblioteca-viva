export const AUDIO_PREFERENCE_DEFAULTS = Object.freeze({
  effectsVolume: 0.6,
  musicVolume: 0.35,
  muted: false,
});

export interface AudioPreferences {
  readonly effectsVolume: number;
  readonly musicVolume: number;
  readonly muted: boolean;
}

export type AudioAvailability =
  "not-initialized" | "ready" | "unavailable" | "disposed";

export type AudioIntent =
  | { readonly type: "PageChanged" }
  | { readonly type: "LibraryEntered" }
  | { readonly type: "LibraryExited" }
  | { readonly type: "ShelfSelected" }
  | { readonly type: "LibrarianSelected" }
  | { readonly type: "CreatureSelected" }
  | { readonly type: "BookCompleted" };

export interface AudioDiagnosticsSnapshot {
  readonly activeEffects: number;
  readonly activeMusicPlayers: number;
  readonly desiredMusic: boolean;
  readonly pendingEffects: number;
  readonly state: AudioAvailability;
  readonly suspended: boolean;
}

/** Application-facing audio contract. Presentation emits intentions only. */
export interface AudioPort {
  availability(this: void): AudioAvailability;
  diagnostics?(this: void): AudioDiagnosticsSnapshot;
  dispose(this: void): void;
  emit(this: void, intent: AudioIntent): void;
  initialize(this: void): Promise<AudioAvailability>;
  pause(this: void): void;
  preferences(this: void): AudioPreferences;
  resume(this: void): void;
  setEffectsVolume(this: void, volume: number): Promise<void>;
  setMusicVolume(this: void, volume: number): Promise<void>;
  setMuted(this: void, muted: boolean): Promise<void>;
}

export interface AudioSettingsPort {
  load(): Promise<AudioPreferences | undefined>;
  save(preferences: AudioPreferences): Promise<void>;
}
