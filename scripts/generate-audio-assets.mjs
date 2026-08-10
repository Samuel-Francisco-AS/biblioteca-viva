import { Buffer } from "node:buffer";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22_050;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "public/audio");
const checkOnly = process.argv.includes("--check");

function smoothstep(value) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function envelope(time, duration, attack, release) {
  if (time < 0 || time >= duration) return 0;
  const entrance = smoothstep(time / attack);
  const exit = smoothstep((duration - time) / release);
  return Math.min(entrance, exit);
}

function samples(duration) {
  return new Float64Array(Math.round(duration * SAMPLE_RATE));
}

function addTone(target, options) {
  const startSample = Math.max(0, Math.floor(options.start * SAMPLE_RATE));
  const endSample = Math.min(
    target.length,
    Math.ceil((options.start + options.duration) * SAMPLE_RATE),
  );
  for (let index = startSample; index < endSample; index += 1) {
    const time = index / SAMPLE_RATE - options.start;
    const shape = envelope(
      time,
      options.duration,
      options.attack,
      options.release,
    );
    const vibrato = options.vibrato
      ? Math.sin(2 * Math.PI * options.vibrato.rate * time) *
        options.vibrato.depth
      : 0;
    const phase = 2 * Math.PI * options.frequency * time + vibrato;
    target[index] +=
      shape *
      options.amplitude *
      (Math.sin(phase) + 0.12 * Math.sin(phase * 2));
  }
}

function normalize(target, peak) {
  let currentPeak = 0;
  for (const value of target)
    currentPeak = Math.max(currentPeak, Math.abs(value));
  if (currentPeak === 0) return target;
  const scale = peak / currentPeak;
  for (let index = 0; index < target.length; index += 1) target[index] *= scale;
  return target;
}

function createMusic() {
  const duration = 16;
  const output = samples(duration);
  const progression = [
    [261.63, 329.63, 392, 493.88],
    [220, 261.63, 329.63, 392],
    [174.61, 220, 261.63, 329.63],
    [196, 293.66, 392, 440],
  ];
  progression.forEach((chord, chordIndex) => {
    chord.forEach((frequency, noteIndex) => {
      addTone(output, {
        amplitude: 0.055 - noteIndex * 0.004,
        attack: 0.75,
        duration: 4.7,
        frequency,
        release: 1.05,
        start: chordIndex * 4,
        vibrato: { depth: 0.018, rate: 0.16 + noteIndex * 0.015 },
      });
    });
  });

  const melody = [
    [1.2, 659.25],
    [2.8, 783.99],
    [4.9, 659.25],
    [6.7, 587.33],
    [8.9, 523.25],
    [10.7, 659.25],
    [12.8, 587.33],
    [14.2, 493.88],
  ];
  melody.forEach(([start, frequency]) =>
    addTone(output, {
      amplitude: 0.026,
      attack: 0.16,
      duration: 1.15,
      frequency,
      release: 0.7,
      start,
      vibrato: { depth: 0.01, rate: 3.2 },
    }),
  );

  const fadeDuration = 0.45;
  for (let index = 0; index < output.length; index += 1) {
    const time = index / SAMPLE_RATE;
    output[index] *= Math.min(
      smoothstep(time / fadeDuration),
      smoothstep((duration - time) / fadeDuration),
    );
  }
  return normalize(output, 0.5);
}

function deterministicNoise(length, seed) {
  const output = new Float64Array(length);
  let state = seed >>> 0;
  let smoothed = 0;
  for (let index = 0; index < length; index += 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    const raw = (state / 0xffff_ffff) * 2 - 1;
    smoothed = smoothed * 0.72 + raw * 0.28;
    output[index] = smoothed;
  }
  return output;
}

function createInterfaceEffect() {
  const duration = 0.14;
  const output = samples(duration);
  const noise = deterministicNoise(output.length, 0x51a7);
  let previous = 0;
  for (let index = 0; index < output.length; index += 1) {
    const time = index / SAMPLE_RATE;
    const highPassed = noise[index] - previous * 0.82;
    previous = noise[index];
    output[index] = highPassed * envelope(time, duration, 0.025, 0.08) * 0.2;
  }
  return normalize(output, 0.32);
}

function createShelfEffect() {
  const duration = 0.24;
  const output = samples(duration);
  const noise = deterministicNoise(output.length, 0xb00c);
  for (let index = 0; index < output.length; index += 1) {
    const time = index / SAMPLE_RATE;
    const knock =
      Math.sin(2 * Math.PI * (185 - 45 * time) * time) *
      envelope(time, 0.13, 0.012, 0.1) *
      0.32;
    const paper = noise[index] * envelope(time, duration, 0.035, 0.14) * 0.12;
    output[index] = knock + paper;
  }
  return normalize(output, 0.42);
}

function createLibrarianEffect() {
  const output = samples(0.42);
  addTone(output, {
    amplitude: 0.16,
    attack: 0.035,
    duration: 0.35,
    frequency: 523.25,
    release: 0.25,
    start: 0,
  });
  addTone(output, {
    amplitude: 0.12,
    attack: 0.04,
    duration: 0.3,
    frequency: 659.25,
    release: 0.22,
    start: 0.09,
  });
  return normalize(output, 0.34);
}

function createCreatureEffect() {
  const duration = 0.32;
  const output = samples(duration);
  for (let index = 0; index < output.length; index += 1) {
    const time = index / SAMPLE_RATE;
    const progress = time / duration;
    const frequency = 330 + 85 * smoothstep(progress);
    const phase = 2 * Math.PI * frequency * time;
    output[index] =
      (Math.sin(phase) + 0.18 * Math.sin(phase * 0.5)) *
      envelope(time, duration, 0.055, 0.16) *
      0.18;
  }
  return normalize(output, 0.32);
}

function createCompletionEffect() {
  const output = samples(0.82);
  [523.25, 659.25, 783.99].forEach((frequency, index) =>
    addTone(output, {
      amplitude: 0.14 - index * 0.012,
      attack: 0.035,
      duration: 0.48,
      frequency,
      release: 0.34,
      start: index * 0.16,
    }),
  );
  return normalize(output, 0.4);
}

function encodeWav(source) {
  const dataBytes = source.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  source.forEach((value, index) => {
    const sample = Math.round(Math.min(1, Math.max(-1, value)) * 32_767);
    buffer.writeInt16LE(sample, 44 + index * 2);
  });
  return buffer;
}

const assets = new Map([
  ["library-ambient.wav", createMusic()],
  ["ui-page.wav", createInterfaceEffect()],
  ["shelf-touch.wav", createShelfEffect()],
  ["librarian-touch.wav", createLibrarianEffect()],
  ["creature-touch.wav", createCreatureEffect()],
  ["book-completed.wav", createCompletionEffect()],
]);

mkdirSync(outputDirectory, { recursive: true });
for (const [name, source] of assets) {
  const path = resolve(outputDirectory, name);
  const generated = encodeWav(source);
  if (checkOnly) {
    const current = readFileSync(path);
    if (!current.equals(generated))
      throw new Error(`Asset desatualizado: ${name}`);
  } else {
    writeFileSync(path, generated);
  }
  process.stdout.write(
    `${checkOnly ? "verificado" : "gerado"}: ${name} (${generated.length} bytes)\n`,
  );
}
