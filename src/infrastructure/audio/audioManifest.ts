export const AUDIO_CATEGORIES = ["ui", "milestone"] as const;
export type AudioCategory = (typeof AUDIO_CATEGORIES)[number];

export const AUDIO_CUE_IDS = [
  "ui.page-turn",
  "milestone.book-completed",
] as const;
export type AudioCueId = (typeof AUDIO_CUE_IDS)[number];

export interface AudioCueDefinition {
  readonly category: AudioCategory;
  readonly fallback: "silence";
  readonly gain: number;
  readonly id: AudioCueId;
  readonly loop: false;
  readonly sources: readonly string[];
}

export interface AudioConfiguration {
  readonly manifest: Readonly<Record<AudioCueId, AudioCueDefinition>>;
}

export const AUDIO_MANIFEST: AudioConfiguration["manifest"] = Object.freeze({
  "ui.page-turn": Object.freeze({
    category: "ui",
    fallback: "silence",
    gain: 0.5,
    id: "ui.page-turn",
    loop: false,
    sources: Object.freeze(["/audio/ui-page.wav"]),
  }),
  "milestone.book-completed": Object.freeze({
    category: "milestone",
    fallback: "silence",
    gain: 0.54,
    id: "milestone.book-completed",
    loop: false,
    sources: Object.freeze(["/audio/book-completed.wav"]),
  }),
});

export const AUDIO_CONFIGURATION: AudioConfiguration = Object.freeze({
  manifest: AUDIO_MANIFEST,
});

export function validateAudioConfiguration(
  configuration: AudioConfiguration,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const id of AUDIO_CUE_IDS) {
    const cue = configuration.manifest[id];
    if (!cue || cue.id !== id) issues.push(`ID divergente: ${id}`);
    if (cue && seen.has(cue.id)) issues.push(`ID duplicado: ${cue.id}`);
    if (cue) {
      seen.add(cue.id);
      if (!AUDIO_CATEGORIES.includes(cue.category))
        issues.push(`Categoria inválida: ${cue.id}`);
      if (cue.gain < 0 || cue.gain > 1)
        issues.push(`Ganho fora do limite: ${cue.id}`);
      if (cue.loop) issues.push(`Política de loop inválida: ${cue.id}`);
    }
  }
  return Object.freeze(issues);
}

export const validateAudioManifest = (
  manifest: AudioConfiguration["manifest"],
): readonly string[] => validateAudioConfiguration({ manifest });
