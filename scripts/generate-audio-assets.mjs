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
  ["ui-page.wav", createInterfaceEffect()],
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
