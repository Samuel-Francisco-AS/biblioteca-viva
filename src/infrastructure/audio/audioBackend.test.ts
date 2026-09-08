import { afterEach, describe, expect, it, vi } from "vitest";

import { AUDIO_MANIFEST } from "./audioManifest";
import { BrowserAudioBackend } from "./audioBackend";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BrowserAudioBackend", () => {
  it("informa indisponibilidade quando Web Audio não existe", async () => {
    vi.stubGlobal("AudioContext", undefined);
    await expect(new BrowserAudioBackend().initialize()).resolves.toBe(false);
  });

  it("exige inicialização antes de preparar um cue", async () => {
    const backend = new BrowserAudioBackend();
    await expect(
      backend.prepare(AUDIO_MANIFEST["ui.page-turn"]),
    ).rejects.toThrow("AUDIO_BACKEND_NOT_READY");
  });

  it("pode ser descartado sem contexto ativo", () => {
    expect(() => new BrowserAudioBackend().dispose()).not.toThrow();
  });
});
