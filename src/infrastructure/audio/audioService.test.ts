import { describe, expect, it, vi } from "vitest";

import type { AudioPreferences } from "../../application";
import type { AudioBackend, AudioPlayback } from "./audioBackend";
import { AudioService } from "./audioService";

describe("AudioService", () => {
  it("toca navegação e conclusão com preferências persistidas", async () => {
    const play = vi.fn<(id: string, volume: number) => void>();
    const playback: AudioPlayback = {
      available: true,
      completed: new Promise<void>(() => undefined),
      setVolume: vi.fn(),
      stop: vi.fn(),
    };
    const backend: AudioBackend = {
      dispose: vi.fn(),
      initialize: vi.fn(() => Promise.resolve(true)),
      prepare: vi.fn(() => Promise.resolve()),
      play: (cue, volume) => {
        play(cue.id, volume);
        return Promise.resolve(playback);
      },
    };
    let stored: AudioPreferences | undefined;
    const service = new AudioService(
      backend,
      {
        load: () => Promise.resolve(stored),
        save: (preferences) => {
          stored = preferences;
          return Promise.resolve();
        },
      },
      { warn: vi.fn() },
    );

    await service.initialize();
    service.emit({ type: "PageChanged" });
    service.emit({ type: "BookCompleted" });
    await vi.waitFor(() => expect(play).toHaveBeenCalledTimes(2));
    expect(play.mock.calls.map(([id]) => id)).toEqual([
      "ui.page-turn",
      "milestone.book-completed",
    ]);
    await service.setEffectsVolume(0.4);
    await service.setMuted(true);
    expect(stored).toMatchObject({ effectsVolume: 0.4, muted: true });
    service.dispose();
  });

  it("degrada com segurança quando o backend está indisponível", async () => {
    const service = new AudioService(
      {
        dispose: vi.fn(),
        initialize: () => Promise.resolve(false),
        prepare: vi.fn(() => Promise.resolve()),
        play: vi.fn(),
      },
      { load: () => Promise.resolve(undefined), save: () => Promise.resolve() },
      { warn: vi.fn() },
    );
    await expect(service.initialize()).resolves.toBe("unavailable");
    expect(() => service.emit({ type: "PageChanged" })).not.toThrow();
  });
});
