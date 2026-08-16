import type { AudioCueDefinition } from "./audioManifest";

export interface AudioPlayback {
  readonly available: boolean;
  readonly completed: Promise<void>;
  setVolume(volume: number): void;
  stop(): void;
}

export interface AudioBackend {
  dispose(): void;
  initialize(): Promise<boolean>;
  prepare(cue: AudioCueDefinition): Promise<void>;
  play(cue: AudioCueDefinition, volume: number): Promise<AudioPlayback>;
}

export interface AudioErrorReporter {
  warn(code: string): void;
}

export const consoleAudioErrorReporter: AudioErrorReporter = {
  warn(code) {
    console.warn(`Áudio degradado: ${code}.`);
  },
};

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export class BrowserAudioBackend implements AudioBackend {
  private context?: AudioContext;
  private readonly decodedSources = new Map<
    string,
    Promise<AudioBuffer | undefined>
  >();
  private readonly playbacks = new Set<AudioPlayback>();

  constructor(
    private readonly reporter: AudioErrorReporter = consoleAudioErrorReporter,
  ) {}

  async initialize(): Promise<boolean> {
    if (this.context) {
      if (this.context.state === "suspended") await this.context.resume();
      return this.context.state !== "closed";
    }
    if (typeof globalThis.AudioContext === "undefined") return false;
    try {
      this.context = new AudioContext();
      if (this.context.state === "suspended") await this.context.resume();
      return this.context.state !== "closed";
    } catch {
      this.reporter.warn("BACKEND_INITIALIZATION_FAILED");
      return false;
    }
  }

  async play(cue: AudioCueDefinition, volume: number): Promise<AudioPlayback> {
    const context = this.context;
    if (!context || context.state === "closed")
      throw new Error("AUDIO_BACKEND_NOT_READY");
    const buffer = await this.loadCueBuffer(context, cue);
    if (buffer)
      return this.track(
        this.createBufferPlayback(context, buffer, cue, volume),
      );
    return this.track(this.createSilentPlayback(cue.loop));
  }

  async prepare(cue: AudioCueDefinition): Promise<void> {
    const context = this.context;
    if (!context || context.state === "closed")
      throw new Error("AUDIO_BACKEND_NOT_READY");
    await this.loadCueBuffer(context, cue);
  }

  dispose(): void {
    for (const playback of [...this.playbacks]) playback.stop();
    this.playbacks.clear();
    this.decodedSources.clear();
    const context = this.context;
    this.context = undefined;
    if (context && context.state !== "closed") {
      void context
        .close()
        .catch(() => this.reporter.warn("BACKEND_DISPOSE_FAILED"));
    }
  }

  private async loadCueBuffer(
    context: AudioContext,
    cue: AudioCueDefinition,
  ): Promise<AudioBuffer | undefined> {
    for (const source of cue.sources) {
      let decoded = this.decodedSources.get(source);
      if (!decoded) {
        decoded = fetch(source)
          .then((response) => {
            if (!response.ok) throw new Error("asset unavailable");
            return response.arrayBuffer();
          })
          .then((bytes) => context.decodeAudioData(bytes))
          .catch(() => {
            this.reporter.warn("ASSET_UNAVAILABLE");
            return undefined;
          });
        this.decodedSources.set(source, decoded);
      }
      const buffer = await decoded;
      if (buffer) return buffer;
    }
    return undefined;
  }

  private track(playback: AudioPlayback): AudioPlayback {
    this.playbacks.add(playback);
    void playback.completed.finally(() => this.playbacks.delete(playback));
    return playback;
  }

  private createBufferPlayback(
    context: AudioContext,
    buffer: AudioBuffer,
    cue: AudioCueDefinition,
    volume: number,
  ): AudioPlayback {
    const source = context.createBufferSource();
    const gain = context.createGain();
    let stopped = false;
    let finish: () => void = () => undefined;
    const completed = new Promise<void>((resolve) => {
      finish = resolve;
    });
    source.buffer = buffer;
    source.loop = cue.loop;
    gain.gain.value = clamp(volume * cue.gain);
    source.connect(gain).connect(context.destination);
    const cleanup = () => {
      if (stopped) return;
      stopped = true;
      source.disconnect();
      gain.disconnect();
      finish();
    };
    source.addEventListener("ended", cleanup, { once: true });
    source.start();
    return {
      available: true,
      completed,
      setVolume(next) {
        gain.gain.setValueAtTime(clamp(next * cue.gain), context.currentTime);
      },
      stop() {
        if (stopped) return;
        source.stop();
        cleanup();
      },
    };
  }

  private createSilentPlayback(loop: boolean): AudioPlayback {
    let stopped = false;
    let finish: () => void = () => undefined;
    const completed = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const stop = () => {
      if (stopped) return;
      stopped = true;
      finish();
    };
    if (!loop) queueMicrotask(stop);
    return {
      available: false,
      completed,
      setVolume() {},
      stop,
    };
  }
}
