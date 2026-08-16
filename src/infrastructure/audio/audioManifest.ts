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
  readonly id: string;
  readonly loop: boolean;
  readonly sources: readonly string[];
}

export interface AudioConfiguration {
  readonly manifest: Readonly<Record<string, AudioCueDefinition>>;
  readonly playlists: Readonly<Record<"library", readonly string[]>>;
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
      loop: false,
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
    if (cue.loop !== (cue.category === "ambience"))
      issues.push(`Política de loop inválida: ${cue.id}`);
  }
  return Object.freeze(issues);
}

export const AUDIO_PLAYLISTS = Object.freeze({
  library: Object.freeze(["music.library"]),
}) satisfies AudioConfiguration["playlists"];

export const AUDIO_CONFIGURATION: AudioConfiguration = Object.freeze({
  manifest: AUDIO_MANIFEST,
  playlists: AUDIO_PLAYLISTS,
});

export function validateAudioConfiguration(
  configuration: AudioConfiguration,
): readonly string[] {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  for (const [key, cue] of Object.entries(configuration.manifest)) {
    if (cue.id !== key) issues.push(`ID divergente: ${key}`);
    if (seenIds.has(cue.id)) issues.push(`ID duplicado: ${cue.id}`);
    seenIds.add(cue.id);
  }
  for (const [playlistId, cueIds] of Object.entries(configuration.playlists)) {
    if (cueIds.length === 0) issues.push(`Playlist vazia: ${playlistId}`);
    for (const cueId of cueIds) {
      const cue = configuration.manifest[cueId];
      if (!cue) issues.push(`Cue inexistente em ${playlistId}: ${cueId}`);
      else if (cue.category !== "music")
        issues.push(`Cue não musical em ${playlistId}: ${cueId}`);
    }
  }
  return Object.freeze(issues);
}
