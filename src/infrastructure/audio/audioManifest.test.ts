import { describe, expect, it } from "vitest";

import {
  AUDIO_CUE_IDS,
  AUDIO_MANIFEST,
  validateAudioConfiguration,
} from "./audioManifest";

describe("manifesto de áudio", () => {
  it("declara apenas os dois cues convencionais com assets existentes", () => {
    expect(AUDIO_CUE_IDS).toEqual(["ui.page-turn", "milestone.book-completed"]);
    expect(AUDIO_MANIFEST["ui.page-turn"].sources).toEqual([
      "/audio/ui-page.wav",
    ]);
    expect(AUDIO_MANIFEST["milestone.book-completed"].sources).toEqual([
      "/audio/book-completed.wav",
    ]);
    expect(validateAudioConfiguration({ manifest: AUDIO_MANIFEST })).toEqual(
      [],
    );
  });
});
