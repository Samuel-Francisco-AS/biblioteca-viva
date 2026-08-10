export const AUDIO_CATEGORIES = [
  "music",
  "ambience",
  "ui",
  "interaction",
  "milestone",
] as const;

export type AudioCategory = (typeof AUDIO_CATEGORIES)[number];

export const AUDIO_CUE_IDS = [
  "music.library",
  "ambience.library-room",
  "ui.page-turn",
  "interaction.shelf-touch",
  "interaction.librarian-touch",
  "interaction.creature-touch",
  "milestone.book-completed",
] as const;

export type AudioCueId = (typeof AUDIO_CUE_IDS)[number];
export type AudioFallback = "silence";

export interface AudioCueDefinition {
  readonly category: AudioCategory;
  readonly fallback: AudioFallback;
  readonly gain: number;
  readonly id: AudioCueId;
  readonly loop: boolean;
  readonly sources: readonly string[];
}

/**
 * Asset paths live only here. Replacing a file at the same path or changing a
 * source entry never requires changes to the service or presentation.
 */
export const AUDIO_MANIFEST: Readonly<Record<AudioCueId, AudioCueDefinition>> =
  Object.freeze({
    "music.library": Object.freeze({
      category: "music",
      fallback: "silence",
      gain: 0.72,
      id: "music.library",
      loop: true,
      sources: Object.freeze(["/audio/library-ambient.wav"]),
    }),
    "ambience.library-room": Object.freeze({
      category: "ambience",
      fallback: "silence",
      gain: 0.12,
      id: "ambience.library-room",
      loop: true,
      sources: Object.freeze([]),
    }),
    "ui.page-turn": Object.freeze({
      category: "ui",
      fallback: "silence",
      gain: 0.5,
      id: "ui.page-turn",
      loop: false,
      sources: Object.freeze(["/audio/ui-page.wav"]),
    }),
    "interaction.shelf-touch": Object.freeze({
      category: "interaction",
      fallback: "silence",
      gain: 0.58,
      id: "interaction.shelf-touch",
      loop: false,
      sources: Object.freeze(["/audio/shelf-touch.wav"]),
    }),
    "interaction.librarian-touch": Object.freeze({
      category: "interaction",
      fallback: "silence",
      gain: 0.48,
      id: "interaction.librarian-touch",
      loop: false,
      sources: Object.freeze(["/audio/librarian-touch.wav"]),
    }),
    "interaction.creature-touch": Object.freeze({
      category: "interaction",
      fallback: "silence",
      gain: 0.48,
      id: "interaction.creature-touch",
      loop: false,
      sources: Object.freeze(["/audio/creature-touch.wav"]),
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

export function validateAudioManifest(
  manifest: Readonly<Record<AudioCueId, AudioCueDefinition>>,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const id of AUDIO_CUE_IDS) {
    const cue = manifest[id];
    if (cue.id !== id) issues.push(`ID divergente: ${id}`);
    if (seen.has(cue.id)) issues.push(`ID duplicado: ${cue.id}`);
    seen.add(cue.id);
    if (!AUDIO_CATEGORIES.includes(cue.category))
      issues.push(`Categoria inválida: ${cue.id}`);
    if (cue.gain < 0 || cue.gain > 1)
      issues.push(`Ganho fora do limite: ${cue.id}`);
    if (cue.loop !== (cue.category === "music" || cue.category === "ambience"))
      issues.push(`Política de loop inválida: ${cue.id}`);
  }
  return Object.freeze(issues);
}
