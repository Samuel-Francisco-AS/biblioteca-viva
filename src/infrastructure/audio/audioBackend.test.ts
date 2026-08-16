// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserAudioBackend } from "./audioBackend";
import { AUDIO_MANIFEST } from "./audioManifest";

class FakeAudioParam {
  value = 0;
  setValueAtTime(value: number): void {
    this.value = value;
  }
}

class FakeAudioNode {
  connect(): this {
    return this;
  }
  disconnect(): void {}
}

class FakeBufferSource extends FakeAudioNode {
  buffer?: object;
  loop = false;
  started = false;
  private ended?: () => void;
  addEventListener(_event: string, listener: () => void): void {
    this.ended = listener;
  }
  start(): void {
    this.started = true;
  }
  stop(): void {
    this.ended?.();
  }
}

class FakeGain extends FakeAudioNode {
  readonly gain = new FakeAudioParam();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  readonly currentTime = 0;
  readonly destination = new FakeAudioNode();
  readonly sources: FakeBufferSource[] = [];
  oscillatorCalls = 0;
  decodeCalls = 0;
  state: AudioContextState = "running";
  constructor() {
    FakeAudioContext.instances.push(this);
  }
  close(): Promise<void> {
    this.state = "closed";
    return Promise.resolve();
  }
  createGain(): FakeGain {
    return new FakeGain();
  }
  createBufferSource(): FakeBufferSource {
    const source = new FakeBufferSource();
    this.sources.push(source);
    return source;
  }
  createOscillator(): never {
    this.oscillatorCalls += 1;
    throw new Error("drone procedural proibido");
  }
  decodeAudioData(): Promise<object> {
    this.decodeCalls += 1;
    return Promise.resolve({ decoded: true });
  }
  resume(): Promise<void> {
    this.state = "running";
    return Promise.resolve();
  }
}

afterEach(() => {
  FakeAudioContext.instances.length = 0;
  vi.unstubAllGlobals();
});

describe("BrowserAudioBackend", () => {
  it("informa indisponibilidade quando Web Audio não existe", async () => {
    vi.stubGlobal("AudioContext", undefined);
    const backend = new BrowserAudioBackend({ warn: vi.fn() });
    await expect(backend.initialize()).resolves.toBe(false);
  });

  it("usa o asset musical declarado no manifesto", async () => {
    const fetchAsset = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        ok: true,
      }),
    );
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("fetch", fetchAsset);
    const backend = new BrowserAudioBackend({ warn: vi.fn() });
    await backend.initialize();
    const playback = await backend.play(AUDIO_MANIFEST["music.library"], 0.5);
    const context = FakeAudioContext.instances[0];
    expect(fetchAsset).toHaveBeenCalledWith("/audio/library-ambient.wav");
    expect(context?.sources).toHaveLength(1);
    expect(context?.sources[0]).toMatchObject({ loop: true, started: true });
    playback.stop();
  });

  it("prepara após initialize e reutiliza o buffer decodificado em novas entradas", async () => {
    const fetchAsset = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        ok: true,
      }),
    );
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal("fetch", fetchAsset);
    const backend = new BrowserAudioBackend({ warn: vi.fn() });
    await backend.initialize();
    await backend.prepare(AUDIO_MANIFEST["music.library"]);
    const first = await backend.play(AUDIO_MANIFEST["music.library"], 0.5);
    first.stop();
    const second = await backend.play(AUDIO_MANIFEST["music.library"], 0.5);
    expect(fetchAsset).toHaveBeenCalledTimes(1);
    expect(FakeAudioContext.instances[0]?.decodeCalls).toBe(1);
    second.stop();
  });

  it("asset musical ausente degrada para silêncio sem criar oscilador", async () => {
    const warn = vi.fn();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false })),
    );
    const backend = new BrowserAudioBackend({ warn });
    await backend.initialize();
    const playback = await backend.play(AUDIO_MANIFEST["music.library"], 0.5);
    const context = FakeAudioContext.instances[0];
    expect(warn).toHaveBeenCalledWith("ASSET_UNAVAILABLE");
    expect(context?.oscillatorCalls).toBe(0);
    expect(context?.sources).toEqual([]);
    playback.stop();
  });
});
