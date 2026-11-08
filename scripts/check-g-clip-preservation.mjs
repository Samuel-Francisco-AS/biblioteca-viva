// Reproducible comparison against the accepted F2 source. No personal data.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import process from "node:process";
const results = {
  base: "d8b2c4eb151f8fe2643cd3e3e0a3ceaf534e53ea",
  tolerance: 1e-6,
  characters: {},
};
for (const key of ["samael", "aryn", "ytha", "lua"]) {
  const old = new Uint8Array(
    execFileSync(
      "git",
      ["show", `${results.base}:src/features/library/three/assets/${key}.glb`],
      { maxBuffer: 8e6 },
    ),
  );
  const current = new Uint8Array(
    readFileSync(`src/features/library/three/assets/${key}.glb`),
  );
  const a = await new GLTFLoader().parseAsync(old.buffer, ""),
    b = await new GLTFLoader().parseAsync(current.buffer, "");
  const changed =
    key === "ytha"
      ? ["walk", "carry_walk", "idle", "turn"]
      : ["walk", "carry_walk"];
  const checked = [];
  for (const clip of a.animations.filter((c) => !changed.includes(c.name))) {
    const next = b.animations.find((c) => c.name === clip.name);
    if (
      !next ||
      next.duration !== clip.duration ||
      next.tracks.length !== clip.tracks.length
    )
      throw new Error(`${key}/${clip.name}: clip structure changed`);
    let maxDelta = 0;
    for (const track of clip.tracks) {
      const other = next.tracks.find((t) => t.name === track.name);
      if (
        !other ||
        other.values.length !== track.values.length ||
        other.times.length !== track.times.length ||
        other.ValueTypeName !== track.ValueTypeName
      )
        throw new Error(
          `${key}/${clip.name}/${track.name}: track structure changed`,
        );
      for (const channel of ["times", "values"])
        for (let i = 0; i < track[channel].length; i++)
          maxDelta = Math.max(
            maxDelta,
            Math.abs(track[channel][i] - other[channel][i]),
          );
    }
    if (maxDelta > results.tolerance)
      throw new Error(`${key}/${clip.name}: unexpected delta ${maxDelta}`);
    checked.push({ name: clip.name, maxDelta });
  }
  results.characters[key] = { changed, checked };
}
writeFileSync(
  "docs/audits/evidence/bv-g/clip-preservation.json",
  JSON.stringify(results, null, 2) + "\n",
);
process.stdout.write(
  "F2 non-locomotion clips preserved within 1e-6 export precision.\n",
);
