// @vitest-environment node

import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  formatImageGeometry,
  inspectPng,
  maximumAlphaOutsideRectangles,
  parseImageGeometry,
  runImageMagick,
} from "./wall-asset-metrics.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "art-guides/w3-a-r2-a/wall-corner-contract.json"),
    "utf8",
  ),
);
const sourceRelative = "art-source/world/architecture/walls";
const runtimeRelative = "public/assets/world/architecture/walls";
const temporaryProjects = [];
let suiteDirectory;
let legacyTemplate;
let productionTemplate;

function parseCanvas(value) {
  const [width, height] = value.split("x").map(Number);
  return { height, width };
}

function rectangleCommand({ height, width, x, y }) {
  return `rectangle ${x},${y} ${x + width - 1},${y + height - 1}`;
}

function createPng(file, canvas, rectangles, extraDraw = []) {
  mkdirSync(dirname(file), { recursive: true });
  runImageMagick([
    "-size",
    `${canvas.width}x${canvas.height}`,
    "xc:none",
    "-colorspace",
    "sRGB",
    "-fill",
    "white",
    "-draw",
    [...rectangles.map(rectangleCommand), ...extraDraw].join(" "),
    "-depth",
    "8",
    "-strip",
    "-define",
    "png:color-type=6",
    `PNG32:${file}`,
  ]);
}

function createContractPng(file, asset, cornerMode) {
  const production = cornerMode === "production" && asset.production;
  const expected = production ? asset.production : asset.baseline;
  const canvas = parseCanvas(expected.canvas);
  if (production) {
    const orientation = contract.orientations.find(
      ({ id }) => asset.name === `wall-corner-${id}.png`,
    );
    if (!orientation) throw new Error(`Orientação ausente para ${asset.name}.`);
    createPng(file, canvas, orientation.allowedAlphaRectangles);
    return;
  }
  createPng(file, canvas, [parseImageGeometry(expected.alphaBounds)]);
}

function copyProcessorFiles(project) {
  const scriptDirectory = resolve(project, "scripts");
  const contractDirectory = resolve(project, "art-guides/w3-a-r2-a");
  mkdirSync(scriptDirectory, { recursive: true });
  mkdirSync(contractDirectory, { recursive: true });
  copyFileSync(
    resolve(repositoryRoot, "scripts/process-wall-assets.mjs"),
    resolve(scriptDirectory, "process-wall-assets.mjs"),
  );
  copyFileSync(
    resolve(repositoryRoot, "scripts/wall-asset-metrics.mjs"),
    resolve(scriptDirectory, "wall-asset-metrics.mjs"),
  );
  copyFileSync(
    resolve(repositoryRoot, "art-guides/w3-a-r2-a/wall-corner-contract.json"),
    resolve(contractDirectory, "wall-corner-contract.json"),
  );
}

function createTemplate(project, cornerMode) {
  copyProcessorFiles(project);
  for (const asset of contract.assets) {
    for (const relativeDirectory of [sourceRelative, runtimeRelative]) {
      createContractPng(
        resolve(project, relativeDirectory, asset.name),
        asset,
        cornerMode,
      );
    }
  }
}

function cloneTemplate(template, label) {
  const parent = mkdtempSync(join(tmpdir(), `${label}-`));
  const project = resolve(parent, "project");
  cpSync(template, project, { recursive: true });
  temporaryProjects.push(parent);
  return project;
}

function runProcessor(project, args, extraEnvironment = {}) {
  return spawnSync(
    process.execPath,
    [resolve(project, "scripts/process-wall-assets.mjs"), ...args],
    {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, ...extraEnvironment },
    },
  );
}

function createRuntimeCorruptingMagick(project) {
  const lookup = spawnSync("which", ["magick"], { encoding: "utf8" });
  if (lookup.status !== 0) throw new Error("ImageMagick não encontrado.");
  const realMagick = lookup.stdout.trim();
  const binaryDirectory = resolve(project, "test-bin");
  const wrapper = resolve(binaryDirectory, "magick");
  mkdirSync(binaryDirectory, { recursive: true });
  writeFileSync(
    wrapper,
    [
      `#!${process.execPath}`,
      'import { renameSync } from "node:fs";',
      'import { spawnSync } from "node:child_process";',
      `const realMagick = ${JSON.stringify(realMagick)};`,
      "const args = process.argv.slice(2);",
      'const result = spawnSync(realMagick, args, { stdio: "inherit" });',
      "if (result.status !== 0) process.exit(result.status ?? 1);",
      "const conversionOutput = args.at(-1);",
      "if (",
      '  conversionOutput?.startsWith("PNG32:") &&',
      '  conversionOutput.endsWith("/wall-corner-ne.png")',
      ") {",
      '  const output = conversionOutput.slice("PNG32:".length);',
      "  const invalidOutput = `${output}.invalid.png`;",
      "  const corruption = spawnSync(",
      "    realMagick,",
      "    [",
      "      output,",
      '      "-crop",',
      '      "1247x1248+0+0",',
      '      "+repage",',
      '      "-strip",',
      '      "-define",',
      '      "png:color-type=6",',
      "      `PNG32:${invalidOutput}`,",
      "    ],",
      '    { stdio: "inherit" },',
      "  );",
      "  if (corruption.status !== 0) process.exit(corruption.status ?? 1);",
      "  renameSync(invalidOutput, output);",
      "}",
      "",
    ].join("\n"),
  );
  chmodSync(wrapper, 0o755);
  return binaryDirectory;
}

function combinedOutput(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function cornerAssets() {
  return contract.assets.filter((asset) => asset.production);
}

beforeAll(() => {
  suiteDirectory = mkdtempSync(join(tmpdir(), "process-wall-assets-suite-"));
  legacyTemplate = resolve(suiteDirectory, "legacy");
  productionTemplate = resolve(suiteDirectory, "production");
  createTemplate(legacyTemplate, "legacy");
  createTemplate(productionTemplate, "production");
}, 60_000);

afterEach(() => {
  for (const directory of temporaryProjects.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

afterAll(() => {
  rmSync(suiteDirectory, { force: true, recursive: true });
});

describe("wall asset processor production transition", () => {
  it("accepts historical corners only with the explicit read-only tolerance", () => {
    const project = cloneTemplate(legacyTemplate, "legacy-corner-check");

    const strictResult = runProcessor(project, ["--check"]);
    const tolerantResult = runProcessor(project, [
      "--check",
      "--allow-legacy-corners",
    ]);

    expect(strictResult.status).not.toBe(0);
    expect(combinedOutput(strictResult)).toContain("Canvas inesperado");
    expect(tolerantResult.status).toBe(0);
    expect(tolerantResult.stdout).toContain("legacy-nonconforming-report-only");
    expect(tolerantResult.stdout).toContain(
      "4 legacy corners are nonconforming in report-only mode",
    );
  }, 90_000);

  it("accepts production corners without the legacy tolerance", () => {
    const project = cloneTemplate(productionTemplate, "production-check");

    const result = runProcessor(project, ["--check"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("0 legacy corners");
    expect(result.stdout).not.toContain("legacy-nonconforming-report-only");
  }, 90_000);

  it("rejects a horizontal asset outside the shared compatibility class", () => {
    const project = cloneTemplate(productionTemplate, "profile-class");
    const contractFile = resolve(
      project,
      "art-guides/w3-a-r2-a/wall-corner-contract.json",
    );
    const localContract = JSON.parse(readFileSync(contractFile, "utf8"));
    const door = localContract.assets.find(
      ({ name }) => name === "wall-door-horizontal-open.png",
    );
    door.connectionProfileClass = "incompatible-profile";
    writeFileSync(contractFile, `${JSON.stringify(localContract, null, 2)}\n`);

    const result = runProcessor(project, ["--check"]);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain(
      "Classe de perfil estrutural incoerente",
    );
  });

  it("rejects a processing source with alpha outside production areas", () => {
    const project = cloneTemplate(productionTemplate, "invalid-production");
    const asset = contract.assets.find(
      ({ name }) => name === "wall-corner-ne.png",
    );
    const orientation = contract.orientations.find(({ id }) => id === "ne");
    const source = resolve(project, sourceRelative, asset.name);
    createPng(
      source,
      parseCanvas(asset.production.canvas),
      orientation.allowedAlphaRectangles,
      ["point 500,500"],
    );

    const result = runProcessor(project, []);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain("alpha fora da área permitida");
  });

  it("processes and validates production sources and generated runtime corners", () => {
    const project = cloneTemplate(productionTemplate, "production-process");
    rmSync(resolve(project, runtimeRelative), { recursive: true });

    const result = runProcessor(project, []);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Processed and validated 12 active wall PNGs",
    );
    for (const asset of cornerAssets()) {
      const runtime = resolve(project, runtimeRelative, asset.name);
      const orientation = contract.orientations.find(
        ({ id }) => asset.name === `wall-corner-${id}.png`,
      );
      expect(existsSync(runtime)).toBe(true);
      const measured = inspectPng(runtime);
      expect(`${measured.canvas.width}x${measured.canvas.height}`).toBe(
        asset.production.canvas,
      );
      expect(formatImageGeometry(measured.alphaBounds)).toBe(
        asset.production.alphaBounds,
      );
      expect(
        maximumAlphaOutsideRectangles(
          runtime,
          orientation.allowedAlphaRectangles,
        ),
      ).toBe(0);
    }
  }, 90_000);

  it("rejects a generated runtime corner that violates production", () => {
    const project = cloneTemplate(productionTemplate, "invalid-runtime");
    rmSync(resolve(project, runtimeRelative), { recursive: true });
    const binaryDirectory = createRuntimeCorruptingMagick(project);

    const result = runProcessor(project, [], {
      PATH: `${binaryDirectory}:${process.env.PATH}`,
    });

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain("Canvas inesperado");
    expect(combinedOutput(result)).toContain(
      resolve(project, runtimeRelative, "wall-corner-ne.png"),
    );
  }, 90_000);

  it("rejects a historical corner as a processing source", () => {
    const project = cloneTemplate(legacyTemplate, "legacy-process");
    rmSync(resolve(project, runtimeRelative), { recursive: true });

    const result = runProcessor(project, []);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain("Canvas inesperado");
    expect(
      existsSync(resolve(project, runtimeRelative, "wall-corner-ne.png")),
    ).toBe(false);
  });

  it("preserves baseline validation for straight walls and doors", () => {
    const validProject = cloneTemplate(
      productionTemplate,
      "noncorner-baseline-valid",
    );
    const invalidProject = cloneTemplate(
      productionTemplate,
      "noncorner-baseline-invalid",
    );
    const horizontal = contract.assets.find(
      ({ name }) => name === "wall-horizontal.png",
    );
    const invalidSource = resolve(
      invalidProject,
      sourceRelative,
      horizontal.name,
    );
    const invalidBounds = parseImageGeometry(horizontal.baseline.alphaBounds);
    createPng(invalidSource, parseCanvas(horizontal.baseline.canvas), [
      { ...invalidBounds, width: invalidBounds.width - 1 },
    ]);

    expect(runProcessor(validProject, ["--check"]).status).toBe(0);
    const invalidResult = runProcessor(invalidProject, ["--check"]);
    expect(invalidResult.status).not.toBe(0);
    expect(combinedOutput(invalidResult)).toContain("Alpha bbox inesperado");
  }, 90_000);

  it("rejects a door whose declared corridor lacks endpoint alpha support", () => {
    const project = cloneTemplate(productionTemplate, "door-profile-support");
    const door = contract.assets.find(
      ({ name }) => name === "wall-door-horizontal-closed.png",
    );
    const source = resolve(project, sourceRelative, door.name);
    const bounds = parseImageGeometry(door.baseline.alphaBounds);
    const gapY = bounds.y + 100;
    const gapHeight = 3;
    createPng(source, parseCanvas(door.baseline.canvas), [
      { ...bounds, height: gapY - bounds.y },
      {
        height: gapHeight,
        width: bounds.width - contract.outerPaddingPx,
        x: bounds.x + contract.outerPaddingPx,
        y: gapY,
      },
      {
        ...bounds,
        height: bounds.y + bounds.height - gapY - gapHeight,
        y: gapY + gapHeight,
      },
    ]);

    const result = runProcessor(project, ["--check"]);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain("Suporte visual insuficiente");
  }, 90_000);

  it("keeps strict candidate directories on the production contract", () => {
    const productionProject = cloneTemplate(
      productionTemplate,
      "strict-production",
    );
    const legacyProject = cloneTemplate(legacyTemplate, "strict-legacy");

    const productionResult = runProcessor(productionProject, [
      "--check",
      "--strict-corner-directory",
      resolve(productionProject, sourceRelative),
    ]);
    const legacyResult = runProcessor(legacyProject, [
      "--check",
      "--strict-corner-directory",
      resolve(legacyProject, sourceRelative),
    ]);

    expect(productionResult.status).toBe(0);
    expect(productionResult.stdout).toContain(
      "Validated 4 strict corner candidates",
    );
    expect(legacyResult.status).not.toBe(0);
    expect(combinedOutput(legacyResult)).toContain("Canvas inesperado");
  }, 90_000);

  it("does not tolerate arbitrary nonconforming legacy geometry", () => {
    const project = cloneTemplate(legacyTemplate, "invalid-legacy");
    const asset = contract.assets.find(
      ({ name }) => name === "wall-corner-ne.png",
    );
    const bounds = parseImageGeometry(asset.baseline.alphaBounds);
    const source = resolve(project, sourceRelative, asset.name);
    createPng(source, parseCanvas(asset.baseline.canvas), [
      { ...bounds, height: bounds.height - 1 },
    ]);

    const result = runProcessor(project, ["--check", "--allow-legacy-corners"]);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain("Canvas inesperado");
  });

  it.each([
    [["--allow-legacy-corners"], "exige --check"],
    [
      ["--check", "--allow-legacy-corners", "--strict-corner-directory", "."],
      "não pode ser combinado",
    ],
    [["--strict-corner-directory", "."], "exige --check"],
    [["--unknown-option"], "Opção desconhecida"],
  ])("rejects invalid option combination %j", (args, message) => {
    const project = cloneTemplate(productionTemplate, "invalid-options");

    const result = runProcessor(project, args);

    expect(result.status).not.toBe(0);
    expect(combinedOutput(result)).toContain(message);
  });

  it("retains every historical and production corner geometry", () => {
    const expected = {
      "wall-corner-ne.png": {
        baseline: {
          alphaBounds: "1200x1134+24+24",
          canvas: "1248x1182",
        },
        production: {
          alphaBounds: "1200x1200+24+24",
          canvas: "1248x1248",
        },
      },
      "wall-corner-nw.png": {
        baseline: {
          alphaBounds: "1170x1200+24+24",
          canvas: "1218x1248",
        },
        production: {
          alphaBounds: "1200x1200+24+24",
          canvas: "1248x1248",
        },
      },
      "wall-corner-se.png": {
        baseline: {
          alphaBounds: "1200x1122+24+24",
          canvas: "1248x1170",
        },
        production: {
          alphaBounds: "1200x1200+24+24",
          canvas: "1248x1248",
        },
      },
      "wall-corner-sw.png": {
        baseline: {
          alphaBounds: "1200x1109+24+24",
          canvas: "1248x1157",
        },
        production: {
          alphaBounds: "1200x1200+24+24",
          canvas: "1248x1248",
        },
      },
    };
    const actual = Object.fromEntries(
      cornerAssets().map(({ baseline, name, production }) => [
        name,
        { baseline, production },
      ]),
    );

    expect(actual).toEqual(expected);
  });
});
