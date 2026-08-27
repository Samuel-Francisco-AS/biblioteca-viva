// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import {
  AUDIO_PREFERENCE_DEFAULTS,
  type AudioPreferences,
  type AudioSettingsPort,
} from "../../application";
import type {
  AudioBackend,
  AudioErrorReporter,
  AudioPlayback,
} from "./audioBackend";
import type { AudioConfiguration, AudioCueDefinition } from "./audioManifest";
import { AUDIO_CONFIGURATION } from "./audioManifest";
import { AudioService } from "./audioService";

class FakePlayback implements AudioPlayback {
  readonly available = true;
  readonly volumes: number[];
  stopped = false;
  private finish: () => void = () => undefined;
  readonly completed = new Promise<void>((resolve) => {
    this.finish = resolve;
  });

  constructor(volume: number) {
    this.volumes = [volume];
  }

  setVolume(volume: number): void {
    this.volumes.push(volume);
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.finish();
  }

  complete(): void {
    this.finish();
  }
}

class FakeBackend implements AudioBackend {
  available = true;
  disposed = false;
  initializeCalls = 0;
  readonly plays: Array<{
    cue: AudioCueDefinition;
    playback: FakePlayback;
    volume: number;
  }> = [];
  readonly prepared: string[] = [];
  reject = new Set<string>();

  dispose(): void {
    this.disposed = true;
    this.plays.forEach(({ playback }) => playback.stop());
  }

  initialize(): Promise<boolean> {
    this.initializeCalls += 1;
    return Promise.resolve(this.available);
  }

  prepare(cue: AudioCueDefinition): Promise<void> {
    this.prepared.push(cue.id);
    return Promise.resolve();
  }

  play(cue: AudioCueDefinition, volume: number): Promise<AudioPlayback> {
    if (this.reject.has(cue.id)) return Promise.reject(new Error("private"));
    const playback = new FakePlayback(volume);
    this.plays.push({ cue, playback, volume });
    return Promise.resolve(playback);
  }
}

class FakeSettings implements AudioSettingsPort {
  stored?: AudioPreferences;
  readonly saves: AudioPreferences[] = [];
  failLoad = false;
  failSave = false;

  load(): Promise<AudioPreferences | undefined> {
    if (this.failLoad)
      return Promise.reject(new Error("invalid persisted data"));
    return Promise.resolve(this.stored);
  }

  save(preferences: AudioPreferences): Promise<void> {
    if (this.failSave) return Promise.reject(new Error("database internals"));
    this.stored = preferences;
    this.saves.push(preferences);
    return Promise.resolve();
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("AudioService", () => {
  let backend: FakeBackend;
  let settings: FakeSettings;
  let reporter: AudioErrorReporter;
  let warningCodes: string[];
  let service: AudioService;

  beforeEach(() => {
    backend = new FakeBackend();
    settings = new FakeSettings();
    warningCodes = [];
    reporter = { warn: (code) => warningCodes.push(code) };
    service = new AudioService(backend, settings, reporter);
  });

  it("inicializa de forma idempotente", async () => {
    await Promise.all([service.initialize(), service.initialize()]);
    await service.initialize();
    expect(backend.initializeCalls).toBe(1);
    expect(service.availability()).toBe("ready");
    expect(backend.prepared).toEqual(["music.library"]);
  });

  it("prepara somente a música local após o unlock e antes de uma entrada posterior", async () => {
    await service.initialize();
    expect(backend.prepared).toEqual(["music.library"]);
    expect(backend.plays).toEqual([]);
    service.emit({ type: "LibraryEntered" });
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual(["music.library"]);
  });

  it("reproduz playlist declarativa em ordem, avança no fim natural e faz wrap-around", async () => {
    const music = (id: string): AudioCueDefinition => ({
      category: "music",
      fallback: "silence",
      gain: 1,
      id,
      loop: false,
      sources: [`/audio/${id}.mp3`],
    });
    const configuration: AudioConfiguration = {
      manifest: {
        "music.a": music("music.a"),
        "music.b": music("music.b"),
        "music.c": music("music.c"),
      },
      playlists: { library: ["music.b", "music.a", "music.c"] },
    };
    service = new AudioService(backend, settings, reporter, configuration);
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    await flush();
    backend.plays[0]?.playback.complete();
    await flush();
    backend.plays[1]?.playback.complete();
    await flush();
    backend.plays[2]?.playback.complete();
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual([
      "music.b",
      "music.a",
      "music.c",
      "music.b",
    ]);
  });

  it("playlist de um item reinicia no fim natural sem duplicar player", async () => {
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    await flush();
    backend.plays[0]?.playback.complete();
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual([
      "music.library",
      "music.library",
    ]);
    expect(service.diagnostics().activeMusicPlayers).toBe(1);
  });

  it("fim tardio de player interrompido não inicia música fantasma", async () => {
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    await flush();
    const old = backend.plays[0]?.playback;
    service.emit({ type: "LibraryExited" });
    old?.complete();
    await flush();
    expect(backend.plays).toHaveLength(1);
    expect(service.diagnostics().activeMusicPlayers).toBe(0);
  });

  it("não reproduz efeitos antes da inicialização permitida", async () => {
    service.emit({ type: "PageChanged" });
    service.emit({ type: "ShelfSelected" });
    service.emit({ type: "BookCompleted" });
    await flush();
    expect(backend.plays).toEqual([]);
  });

  it("reutiliza o efeito de milestone para um feedback estrutural consolidado", async () => {
    await service.initialize();
    service.emit({ type: "StructuralUnlocked" });
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual([
      "milestone.book-completed",
    ]);
  });

  it("reproduz a intenção do mesmo gesto somente depois que a inicialização termina", async () => {
    const initialization = service.initialize();
    service.emit({ type: "PageChanged" });
    expect(backend.plays).toEqual([]);
    await initialization;
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual(["ui.page-turn"]);
  });

  it("substitui source de efeito somente pela configuração declarativa", async () => {
    const replacement = {
      ...AUDIO_CONFIGURATION.manifest["ui.page-turn"],
      sources: ["/audio/effect-replacement.mp3"],
    };
    service = new AudioService(backend, settings, reporter, {
      ...AUDIO_CONFIGURATION,
      manifest: {
        ...AUDIO_CONFIGURATION.manifest,
        "ui.page-turn": replacement,
      },
    });
    await service.initialize();
    service.emit({ type: "PageChanged" });
    await flush();
    expect(backend.plays.at(-1)?.cue.sources).toEqual([
      "/audio/effect-replacement.mp3",
    ]);
  });

  it("inicia a música desejada após o gesto e nunca cria uma segunda instância", async () => {
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    service.resume();
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual(["music.library"]);
  });

  it.each([
    ["PageChanged", "ui.page-turn"],
    ["ShelfSelected", "interaction.shelf-touch"],
    ["LibrarianSelected", "interaction.librarian-touch"],
    ["CreatureSelected", "interaction.creature-touch"],
    ["BookCompleted", "milestone.book-completed"],
  ] as const)("reproduz a intenção %s pelo cue %s", async (type, cueId) => {
    await service.initialize();
    service.emit({ type });
    await flush();
    expect(backend.plays.at(-1)?.cue.id).toBe(cueId);
  });

  it("aplica volumes independentes e persiste snapshots ordenadamente", async () => {
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    service.emit({ type: "ShelfSelected" });
    await flush();
    await Promise.all([
      service.setMusicVolume(0.2),
      service.setEffectsVolume(0.8),
    ]);
    const music = backend.plays.find(({ cue }) => cue.category === "music");
    const effect = backend.plays.find(({ cue }) => cue.category !== "music");
    expect(music?.playback.volumes).toEqual([0.35, 0.35, 0.2]);
    expect(effect?.playback.volumes).toEqual([0.6, 0.6, 0.8]);
    expect(settings.stored).toEqual({
      effectsVolume: 0.8,
      musicVolume: 0.2,
      muted: false,
    });
  });

  it("mute global interrompe todos os canais e unmute retoma só a música desejada", async () => {
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    service.emit({ type: "ShelfSelected" });
    await flush();
    await service.setMuted(true);
    expect(backend.plays.every(({ playback }) => playback.stopped)).toBe(true);
    service.emit({ type: "BookCompleted" });
    await flush();
    expect(backend.plays).toHaveLength(2);
    await service.setMuted(false);
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual([
      "music.library",
      "interaction.shelf-touch",
      "music.library",
    ]);
  });

  it("carrega preferências persistidas antes de tocar", async () => {
    settings.stored = { effectsVolume: 0.1, musicVolume: 0.25, muted: false };
    await service.loadPreferences();
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    await flush();
    expect(service.preferences()).toEqual(settings.stored);
    expect(backend.plays[0]?.volume).toBe(0.25);
  });

  it("usa defaults e relata preferência externa inválida", async () => {
    settings.failLoad = true;
    await service.loadPreferences();
    expect(service.preferences()).toEqual(AUDIO_PREFERENCE_DEFAULTS);
    expect(warningCodes).toContain("PREFERENCES_LOAD_FAILED");
  });

  it("pausa, retoma e tolera múltiplos ciclos sem duplicar música", async () => {
    service.emit({ type: "LibraryEntered" });
    await service.initialize();
    await flush();
    service.pause();
    service.pause();
    service.resume();
    service.resume();
    await flush();
    service.pause();
    service.resume();
    await flush();
    expect(backend.plays.map(({ cue }) => cue.id)).toEqual([
      "music.library",
      "music.library",
      "music.library",
    ]);
    expect(
      backend.plays.filter(({ playback }) => !playback.stopped),
    ).toHaveLength(1);
    expect(service.diagnostics()).toMatchObject({
      activeMusicPlayers: 1,
      suspended: false,
    });
  });

  it("expõe somente contagens técnicas e zera players conhecidos no dispose", async () => {
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    service.emit({ type: "ShelfSelected" });
    await flush();
    expect(service.diagnostics()).toEqual({
      activeEffects: 1,
      activeMusicPlayers: 1,
      desiredMusic: true,
      pendingEffects: 0,
      state: "ready",
      suspended: false,
    });

    service.dispose();
    expect(service.diagnostics()).toEqual({
      activeEffects: 0,
      activeMusicPlayers: 0,
      desiredMusic: false,
      pendingEffects: 0,
      state: "disposed",
      suspended: false,
    });
  });

  it("sair da Biblioteca e remontar mantém uma única música", async () => {
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    await flush();
    service.emit({ type: "LibraryExited" });
    service.emit({ type: "LibraryEntered" });
    service.emit({ type: "LibraryEntered" });
    await flush();
    expect(backend.plays).toHaveLength(2);
    expect(
      backend.plays.filter(({ playback }) => !playback.stopped),
    ).toHaveLength(1);
  });

  it("dispose é idempotente, interrompe recursos e impede nova reprodução", async () => {
    await service.initialize();
    service.emit({ type: "LibraryEntered" });
    await flush();
    service.dispose();
    service.dispose();
    service.emit({ type: "ShelfSelected" });
    service.resume();
    await flush();
    expect(service.availability()).toBe("disposed");
    expect(backend.disposed).toBe(true);
    expect(backend.plays).toHaveLength(1);
  });

  it("backend indisponível degrada sem reprodução nem rejeição", async () => {
    backend.available = false;
    await expect(service.initialize()).resolves.toBe("unavailable");
    service.emit({ type: "LibraryEntered" });
    service.emit({ type: "ShelfSelected" });
    await flush();
    expect(backend.plays).toEqual([]);
    expect(warningCodes).toContain("BACKEND_UNAVAILABLE");
  });

  it("falha de arquivo ou reprodução é relatada sem bloquear a intenção", async () => {
    backend.reject.add("interaction.shelf-touch");
    await service.initialize();
    expect(() => service.emit({ type: "ShelfSelected" })).not.toThrow();
    await flush();
    expect(warningCodes).toContain("EFFECT_PLAYBACK_FAILED");
  });

  it("falha de persistência mantém controle imediato e retorna erro sanitizável à UI", async () => {
    settings.failSave = true;
    await expect(service.setMusicVolume(0.4)).rejects.toBeInstanceOf(Error);
    expect(service.preferences().musicVolume).toBe(0.4);
    expect(warningCodes).toContain("PREFERENCES_SAVE_FAILED");
  });
});
