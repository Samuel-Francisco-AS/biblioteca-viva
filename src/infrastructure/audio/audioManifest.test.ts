// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  AUDIO_CATEGORIES,
  AUDIO_CUE_IDS,
  AUDIO_MANIFEST,
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
  });

  it("mantém caminhos substituíveis fora da lógica de reprodução", () => {
    for (const cue of Object.values(AUDIO_MANIFEST)) {
      expect(cue.fallback).toBe("silence");
      expect(cue.loop).toBe(
        cue.category === "music" || cue.category === "ambience",
      );
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
});
