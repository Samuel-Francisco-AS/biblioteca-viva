// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  AUDIO_CATEGORIES,
  AUDIO_CUE_IDS,
  AUDIO_CONFIGURATION,
  AUDIO_MANIFEST,
  validateAudioConfiguration,
  validateAudioManifest,
} from "./audioManifest";

describe("manifesto de áudio", () => {
  it("possui IDs estáveis, únicos e as cinco categorias explícitas", () => {
    expect(Object.keys(AUDIO_MANIFEST)).toEqual(AUDIO_CUE_IDS);
    expect(new Set(AUDIO_CUE_IDS).size).toBe(AUDIO_CUE_IDS.length);
    expect(
      new Set(Object.values(AUDIO_MANIFEST).map((cue) => cue.category)),
    ).toEqual(new Set(AUDIO_CATEGORIES));
    expect(validateAudioManifest(AUDIO_MANIFEST)).toEqual([]);
    expect(validateAudioConfiguration(AUDIO_CONFIGURATION)).toEqual([]);
  });

  it("mantém caminhos substituíveis fora da lógica de reprodução", () => {
    for (const cue of Object.values(AUDIO_MANIFEST)) {
      expect(cue.fallback).toBe("silence");
      expect(cue.loop).toBe(cue.category === "ambience");
    }
    expect(AUDIO_MANIFEST["music.library"].sources).toEqual([
      "/audio/library-ambient.wav",
    ]);
    expect(AUDIO_MANIFEST["ambience.library-room"].sources).toEqual([]);
    expect(AUDIO_CUE_IDS.filter((id) => id.startsWith("interaction."))).toEqual(
      [
        "interaction.shelf-touch",
        "interaction.librarian-touch",
        "interaction.creature-touch",
      ],
    );
    for (const cue of Object.values(AUDIO_MANIFEST).filter(
      ({ id }) => id !== "ambience.library-room",
    )) {
      expect(cue.sources).toHaveLength(1);
      expect(cue.sources[0]).toMatch(/^\/audio\/[a-z-]+\.wav$/u);
    }
  });

  it("valida playlists múltiplas, MP3 e referências inconsistentes", () => {
    const trackA = {
      ...AUDIO_MANIFEST["music.library"],
      id: "music.a",
      sources: ["/audio/a.mp3"],
    };
    const trackB = { ...trackA, id: "music.b", sources: ["/audio/b.wav"] };
    expect(
      validateAudioConfiguration({
        manifest: { "music.a": trackA, "music.b": trackB },
        playlists: { library: ["music.b", "music.a"] },
      }),
    ).toEqual([]);
    expect(
      validateAudioConfiguration({
        manifest: {
          duplicate: trackA,
          effect: AUDIO_MANIFEST["ui.page-turn"],
        },
        playlists: { library: ["missing", "effect"] },
      }),
    ).toEqual(
      expect.arrayContaining([
        "ID divergente: duplicate",
        "ID divergente: effect",
        "Cue inexistente em library: missing",
        "Cue não musical em library: effect",
      ]),
    );
    expect(
      validateAudioConfiguration({
        manifest: {
          "music.a": trackA,
          "music.alias": { ...trackB, id: "music.a" },
        },
        playlists: { library: ["music.a"] },
      }),
    ).toEqual(
      expect.arrayContaining([
        "ID divergente: music.alias",
        "ID duplicado: music.a",
      ]),
    );
    expect(
      validateAudioConfiguration({ manifest: {}, playlists: { library: [] } }),
    ).toContain("Playlist vazia: library");
  });
});
