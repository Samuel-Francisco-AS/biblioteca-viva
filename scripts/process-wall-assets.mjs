import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  countAlphaUnsupportedRows,
  formatImageGeometry,
  inspectPng,
  maximumAlphaOutsideRectangles,
  runImageMagick,
} from "./wall-asset-metrics.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(root, "art-source/world/architecture/walls");
const runtimeDirectory = resolve(
  root,
  "public/assets/world/architecture/walls",
);
const contractPath = resolve(
  root,
  "art-guides/w3-a-r2-a/wall-corner-contract.json",
);
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

function validateConnectionProfileContract() {
  const profile = contract.referenceProfiles.horizontal;
  if (
    typeof profile.compatibilityClass !== "string" ||
    profile.compatibilityClass.length === 0 ||
    profile.alphaEndExclusive - profile.alphaStart !== profile.alphaThickness ||
    profile.alphaThickness <= 0 ||
    profile.semantics?.kind !== "continuous-structural-connection-profile" ||
    profile.semantics.alphaOutsideProfile !== "visual-envelope-only" ||
    profile.semantics.endpointSupportCheck !==
      "each-profile-row-has-alpha-in-outer-padding-band" ||
    profile.semantics.endpointSupportTolerance !==
      "tolerancePx.transverseProfileEdge"
  ) {
    throw new Error("Contrato do perfil estrutural horizontal incoerente.");
  }
  for (const asset of contract.assets.filter(
    ({ axis }) => axis === "horizontal",
  )) {
    if (asset.connectionProfileClass !== profile.compatibilityClass) {
      throw new Error(
        `Classe de perfil estrutural incoerente em ${asset.name}.`,
      );
    }
  }
  for (const orientation of contract.orientations) {
    if (
      orientation.horizontalConnectionProfileClass !==
      profile.compatibilityClass
    ) {
      throw new Error(
        `Classe de perfil horizontal incoerente no canto ${orientation.id}.`,
      );
    }
  }
}

validateConnectionProfileContract();

function parseArguments(args) {
  let allowLegacyCorners = false;
  let checkOnly = false;
  let strictCornerDirectory;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check") {
      if (checkOnly) throw new Error("Opção duplicada: --check.");
      checkOnly = true;
      continue;
    }
    if (argument === "--allow-legacy-corners") {
      if (allowLegacyCorners) {
        throw new Error("Opção duplicada: --allow-legacy-corners.");
      }
      allowLegacyCorners = true;
      continue;
    }
    if (argument === "--strict-corner-directory") {
      if (strictCornerDirectory) {
        throw new Error("Opção duplicada: --strict-corner-directory.");
      }
      const directory = args[index + 1];
      if (!directory || directory.startsWith("--")) {
        throw new Error("Informe um caminho após --strict-corner-directory.");
      }
      strictCornerDirectory = resolve(process.cwd(), directory);
      index += 1;
      continue;
    }
    throw new Error(`Opção desconhecida: ${argument}.`);
  }
  if (strictCornerDirectory && !checkOnly) {
    throw new Error("A validação estrita de candidatos exige --check.");
  }
  if (allowLegacyCorners && !checkOnly) {
    throw new Error("--allow-legacy-corners exige --check.");
  }
  if (allowLegacyCorners && strictCornerDirectory) {
    throw new Error(
      "--allow-legacy-corners não pode ser combinado com --strict-corner-directory.",
    );
  }
  return { allowLegacyCorners, checkOnly, strictCornerDirectory };
}

const { allowLegacyCorners, checkOnly, strictCornerDirectory } = parseArguments(
  process.argv.slice(2),
);

function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(`${message}: ${actual}`);
}

function canvasGeometry(canvas) {
  return `${canvas.width}x${canvas.height}`;
}

function validatePng(file, expected, measured) {
  if (!existsSync(file)) throw new Error(`Asset ausente: ${file}`);
  const result = measured ?? inspectPng(file);
  assertEqual(result.format, "PNG", `Formato inesperado em ${file}`);
  assertEqual(result.colorSpace, "sRGB", `Espaço de cor inesperado em ${file}`);
  assertEqual(result.bitDepth, 8, `Profundidade inesperada em ${file}`);
  assertEqual(
    canvasGeometry(result.canvas),
    expected.canvas,
    `Canvas inesperado em ${file}`,
  );
  if (!result.channels.includes("a")) {
    throw new Error(`Canal alpha ausente em ${file}.`);
  }
  if (result.alphaMinimum !== 0 || result.alphaMaximum !== 1) {
    throw new Error(`Alpha inválido em ${file}.`);
  }
  assertEqual(
    formatImageGeometry(result.alphaBounds),
    expected.alphaBounds,
    `Alpha bbox inesperado em ${file}`,
  );
  return result;
}

function matchesGeometry(measured, expected) {
  return (
    canvasGeometry(measured.canvas) === expected.canvas &&
    formatImageGeometry(measured.alphaBounds) === expected.alphaBounds
  );
}

function cornerOrientation(asset) {
  const orientation = contract.orientations.find(
    (candidate) => asset.name === `wall-corner-${candidate.id}.png`,
  );
  if (!orientation) {
    throw new Error(`Orientação sem contrato para ${asset.name}.`);
  }
  return orientation;
}

function validateProductionCorner(file, asset, measured) {
  if (!asset.production) {
    throw new Error(`Contrato production ausente para ${asset.name}.`);
  }
  const result = validatePng(file, asset.production, measured);
  const outsideMaximum = maximumAlphaOutsideRectangles(
    file,
    cornerOrientation(asset).allowedAlphaRectangles,
  );
  if (outsideMaximum !== 0) {
    throw new Error(
      `${asset.name} possui alpha fora da área permitida (máximo ${outsideMaximum}).`,
    );
  }
  return result;
}

function validateActiveAsset(file, asset, options) {
  if (!existsSync(file)) throw new Error(`Asset ausente: ${file}`);
  const measured = inspectPng(file);
  if (!asset.production) {
    return {
      legacyCorner: false,
      measured: validatePng(file, asset.baseline, measured),
    };
  }
  if (options.allowLegacyCorners && matchesGeometry(measured, asset.baseline)) {
    return {
      legacyCorner: true,
      measured: validatePng(file, asset.baseline, measured),
    };
  }
  return {
    legacyCorner: false,
    measured: validateProductionCorner(file, asset, measured),
  };
}

function cornerContractErrors(asset, measured) {
  if (!asset.production) return [];
  const errors = [];
  if (canvasGeometry(measured.canvas) !== asset.production.canvas) {
    errors.push(`canvas esperado ${asset.production.canvas}`);
  }
  if (
    formatImageGeometry(measured.alphaBounds) !== asset.production.alphaBounds
  ) {
    errors.push(`bbox esperado ${asset.production.alphaBounds}`);
  }
  return errors;
}

function validateStraightReference(asset, measured) {
  const logicalSpan = Number(asset.logicalSpan);
  const expectedLongitudinal = logicalSpan * contract.pixelsPerLogicalCell;
  const actualLongitudinal =
    asset.axis === "horizontal"
      ? measured.alphaBounds.width
      : measured.alphaBounds.height;
  assertEqual(
    actualLongitudinal,
    expectedLongitudinal,
    `Span longitudinal incompatível em ${asset.name}`,
  );
  const profile = contract.referenceProfiles[asset.axis];
  const start =
    asset.axis === "horizontal"
      ? measured.alphaBounds.y
      : measured.alphaBounds.x;
  const end =
    start +
    (asset.axis === "horizontal"
      ? measured.alphaBounds.height
      : measured.alphaBounds.width);
  const tolerance = contract.tolerancePx.transverseProfileEdge;
  if (
    Math.abs(start - profile.alphaStart) > tolerance ||
    Math.abs(end - profile.alphaEndExclusive) > tolerance
  ) {
    throw new Error(`Perfil transversal incompatível em ${asset.name}.`);
  }
}

function validateDoorConnectionSupport(file, asset, measured) {
  if (asset.role !== "door-measure-only") return;
  const profile = contract.referenceProfiles.horizontal;
  const bandWidth = contract.outerPaddingPx;
  const profileHeight = profile.alphaEndExclusive - profile.alphaStart;
  const bands = [
    {
      height: profileHeight,
      width: bandWidth,
      x: measured.alphaBounds.x,
      y: profile.alphaStart,
    },
    {
      height: profileHeight,
      width: bandWidth,
      x: measured.alphaBounds.x + measured.alphaBounds.width - bandWidth,
      y: profile.alphaStart,
    },
  ];
  const tolerance = contract.tolerancePx.transverseProfileEdge;
  for (const [index, band] of bands.entries()) {
    const unsupportedRows = countAlphaUnsupportedRows(file, band);
    if (unsupportedRows > tolerance) {
      throw new Error(
        `Suporte visual insuficiente no endpoint ${index === 0 ? "west" : "east"} de ${asset.name}: ${unsupportedRows} linhas sem alpha.`,
      );
    }
  }
}

function reportLine(asset, measured, status) {
  const padding = measured.padding;
  const tolerance =
    asset.role === "straight-reference"
      ? `long=0/cross=${contract.tolerancePx.transverseProfileEdge}`
      : asset.role === "door-measure-only"
        ? `join=0/cross=${contract.tolerancePx.transverseProfileEdge}`
        : "join=0";
  return [
    asset.name,
    canvasGeometry(measured.canvas),
    formatImageGeometry(measured.alphaBounds),
    `${padding.left}/${padding.top}/${padding.right}/${padding.bottom}`,
    `${asset.axis}:${asset.logicalSpan}`,
    asset.joinPlanes.join(","),
    tolerance,
    status,
  ].join(" | ");
}

function processActiveAssets() {
  if (!checkOnly) mkdirSync(runtimeDirectory, { recursive: true });
  const lines = [];
  let legacyNonconforming = 0;
  for (const asset of contract.assets) {
    const source = resolve(sourceDirectory, asset.name);
    const runtime = resolve(runtimeDirectory, asset.name);
    const sourceResult = validateActiveAsset(source, asset, {
      allowLegacyCorners,
    });
    const sourceMetrics = sourceResult.measured;
    if (asset.role === "straight-reference") {
      validateStraightReference(asset, sourceMetrics);
    }
    validateDoorConnectionSupport(source, asset, sourceMetrics);
    if (!checkOnly) {
      runImageMagick([
        source,
        "-strip",
        "-define",
        "png:color-type=6",
        `PNG32:${runtime}`,
      ]);
    }
    const runtimeResult = validateActiveAsset(runtime, asset, {
      allowLegacyCorners,
    });
    validateDoorConnectionSupport(runtime, asset, runtimeResult.measured);
    if (sourceResult.legacyCorner !== runtimeResult.legacyCorner) {
      throw new Error(
        `Fonte e runtime usam contratos diferentes em ${asset.name}.`,
      );
    }
    let status =
      asset.role === "door-measure-only"
        ? "conforming-structural-profile"
        : "conforming";
    if (sourceResult.legacyCorner) {
      const contractErrors = cornerContractErrors(asset, sourceMetrics);
      legacyNonconforming += 1;
      status = `legacy-nonconforming-report-only[${contractErrors.join("; ")}]`;
    }
    lines.push(reportLine(asset, sourceMetrics, status));
  }
  return { legacyNonconforming, lines };
}

function validateStrictCandidates(directory) {
  const corners = contract.assets.filter(
    (asset) => asset.role === "legacy-corner",
  );
  for (const asset of corners) {
    const file = resolve(directory, asset.name);
    const measured = validateProductionCorner(file, asset);
    const errors = cornerContractErrors(asset, measured);
    if (errors.length > 0) {
      throw new Error(`${asset.name} não conforme: ${errors.join("; ")}`);
    }
  }
  process.stdout.write(
    `Validated ${corners.length} strict corner candidates in ${directory}.\n`,
  );
}

if (strictCornerDirectory) {
  validateStrictCandidates(strictCornerDirectory);
} else {
  const report = processActiveAssets();
  process.stdout.write(
    [
      "name | canvas | alpha bbox | padding L/T/R/B | axis:span | external join planes | tolerance px | status",
      ...report.lines,
      `${checkOnly ? "Validated" : "Processed and validated"} ${contract.assets.length} active wall PNGs; ${report.legacyNonconforming} legacy corners are nonconforming in report-only mode.`,
      "",
    ].join("\n"),
  );
}
