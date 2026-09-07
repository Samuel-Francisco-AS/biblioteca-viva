import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  formatImageGeometry,
  inspectPng,
  maximumAlphaOutsideRectangles,
  runImageMagick,
} from "./wall-asset-metrics.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const guideDirectory = resolve(root, "art-guides/w3-a-r2-a");
const contract = JSON.parse(
  readFileSync(join(guideDirectory, "wall-corner-contract.json"), "utf8"),
);
const sourceDirectory = resolve(root, "art-source/world/architecture/walls");
const checkOnly = process.argv.includes("--check");
const artifactNames = [
  ...contract.orientations.map(
    ({ id }) => `templates/wall-corner-template-${id}.png`,
  ),
  ...contract.orientations.map(
    ({ id }) => `montages/wall-corner-inspection-${id}.png`,
  ),
  "validator-report.json",
];

function rectangleDraw(rectangle) {
  return `rectangle ${rectangle.x},${rectangle.y} ${rectangle.x + rectangle.width - 1},${rectangle.y + rectangle.height - 1}`;
}

function planeDraw(plane, orientation) {
  const insideCoordinate =
    plane.side === "east" || plane.side === "south"
      ? plane.coordinate - 1
      : plane.coordinate;
  if (plane.axis === "x") {
    const horizontal = orientation.allowedAlphaRectangles[0];
    return `line ${insideCoordinate},${horizontal.y} ${insideCoordinate},${horizontal.y + horizontal.height - 1}`;
  }
  const vertical = orientation.allowedAlphaRectangles[1];
  return `line ${vertical.x},${insideCoordinate} ${vertical.x + vertical.width - 1},${insideCoordinate}`;
}

function generateTemplate(outputDirectory, orientation) {
  const output = join(
    outputDirectory,
    "templates",
    `wall-corner-template-${orientation.id}.png`,
  );
  mkdirSync(dirname(output), { recursive: true });
  const allowedArea = orientation.allowedAlphaRectangles
    .map(rectangleDraw)
    .join(" ");
  const joinPlanes = orientation.externalJoinPlanes
    .map((plane) => planeDraw(plane, orientation))
    .join(" ");
  const vertex = orientation.logicalVertex;
  runImageMagick([
    "-size",
    `${contract.cornerCanvas.width}x${contract.cornerCanvas.height}`,
    "xc:none",
    "+antialias",
    "-fill",
    "rgba(48,181,122,0.28)",
    "-stroke",
    "none",
    "-draw",
    allowedArea,
    "-fill",
    "none",
    "-stroke",
    "rgba(255,196,76,1)",
    "-strokewidth",
    "1",
    "-draw",
    joinPlanes,
    "-stroke",
    "rgba(241,91,116,1)",
    "-strokewidth",
    "1",
    "-draw",
    `line ${Math.max(24, vertex.x - 14)},${vertex.y - (vertex.y === 24 ? 0 : 1)} ${Math.min(1223, vertex.x + 14)},${vertex.y - (vertex.y === 24 ? 0 : 1)} line ${vertex.x - (vertex.x === 24 ? 0 : 1)},${Math.max(24, vertex.y - 14)} ${vertex.x - (vertex.x === 24 ? 0 : 1)},${Math.min(1223, vertex.y + 14)}`,
    "-strip",
    "-define",
    "png:color-type=6",
    `PNG32:${output}`,
  ]);
  const measured = inspectPng(output);
  if (
    measured.canvas.width !== contract.cornerCanvas.width ||
    measured.canvas.height !== contract.cornerCanvas.height ||
    formatImageGeometry(measured.alphaBounds) !== "1200x1200+24+24" ||
    maximumAlphaOutsideRectangles(
      output,
      orientation.allowedAlphaRectangles,
    ) !== 0
  ) {
    throw new Error(`Gabarito inválido gerado para ${orientation.id}.`);
  }
}

function generateMontage(outputDirectory, orientation) {
  const output = join(
    outputDirectory,
    "montages",
    `wall-corner-inspection-${orientation.id}.png`,
  );
  mkdirSync(dirname(output), { recursive: true });
  const template = join(
    outputDirectory,
    "templates",
    `wall-corner-template-${orientation.id}.png`,
  );
  const horizontal = join(sourceDirectory, "wall-horizontal.png");
  const vertical = join(sourceDirectory, "wall-vertical.png");
  const cornerX = orientation.horizontalDirection === "west" ? 1200 : 0;
  const cornerY = orientation.verticalDirection === "north" ? 1200 : 0;
  const horizontalX = orientation.horizontalDirection === "west" ? 0 : 1200;
  const horizontalY = cornerY + orientation.horizontalReferenceOrigin.y;
  const verticalX = cornerX + orientation.verticalReferenceOrigin.x;
  const verticalY = orientation.verticalDirection === "north" ? 0 : 1200;
  runImageMagick([
    "-size",
    "2448x2448",
    "pattern:checkerboard",
    "+level-colors",
    "#17241f,#263a31",
    horizontal,
    "-geometry",
    `+${horizontalX}+${horizontalY}`,
    "-composite",
    vertical,
    "-geometry",
    `+${verticalX}+${verticalY}`,
    "-composite",
    template,
    "-geometry",
    `+${cornerX}+${cornerY}`,
    "-composite",
    "-strip",
    "-define",
    "png:color-type=6",
    `PNG32:${output}`,
  ]);
}

function artifactStatus(asset, measured) {
  if (asset.role === "legacy-corner") {
    const conforms =
      `${measured.canvas.width}x${measured.canvas.height}` ===
        asset.production.canvas &&
      formatImageGeometry(measured.alphaBounds) ===
        asset.production.alphaBounds;
    return conforms ? "conforming" : "legacy-nonconforming-report-only";
  }
  return asset.role === "door-measure-only"
    ? "conforming-structural-profile"
    : "conforming-reference";
}

function connectionProfileClass(asset) {
  if (asset.connectionProfileClass) return asset.connectionProfileClass;
  const orientation = contract.orientations.find(
    ({ id }) => asset.name === `wall-corner-${id}.png`,
  );
  return orientation?.horizontalConnectionProfileClass;
}

function generateReport(outputDirectory) {
  const report = {
    contractVersion: contract.contractVersion,
    connectionProfiles: {
      [contract.referenceProfiles.horizontal.compatibilityClass]: {
        axis: "horizontal",
        continuous: true,
        interval: {
          endExclusive: contract.referenceProfiles.horizontal.alphaEndExclusive,
          start: contract.referenceProfiles.horizontal.alphaStart,
        },
        referenceAsset: contract.referenceProfiles.horizontal.asset,
        thickness: contract.referenceProfiles.horizontal.alphaThickness,
        visualEnvelopePolicy:
          contract.referenceProfiles.horizontal.semantics.alphaOutsideProfile,
      },
    },
    generatedFrom: "art-source/world/architecture/walls",
    tolerancesPx: contract.tolerancePx,
    assets: contract.assets.map((asset) => {
      const measured = inspectPng(join(sourceDirectory, asset.name));
      return {
        name: asset.name,
        canvas: `${measured.canvas.width}x${measured.canvas.height}`,
        alphaBounds: formatImageGeometry(measured.alphaBounds),
        padding: measured.padding,
        longitudinalAxis: asset.axis,
        logicalSpan: asset.logicalSpan,
        externalJoinPlanes: asset.joinPlanes,
        connectionProfileClass: connectionProfileClass(asset) ?? null,
        status: artifactStatus(asset, measured),
      };
    }),
  };
  writeFileSync(
    join(outputDirectory, "validator-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}

function generateAll(outputDirectory) {
  mkdirSync(outputDirectory, { recursive: true });
  for (const orientation of contract.orientations) {
    generateTemplate(outputDirectory, orientation);
    generateMontage(outputDirectory, orientation);
  }
  generateReport(outputDirectory);
}

function compareGenerated(generatedDirectory) {
  for (const name of artifactNames) {
    const expected = join(guideDirectory, name);
    const generated = join(generatedDirectory, name);
    if (!existsSync(expected)) throw new Error(`Artefato ausente: ${expected}`);
    if (!readFileSync(expected).equals(readFileSync(generated))) {
      throw new Error(`Artefato desatualizado: ${basename(expected)}`);
    }
  }
}

if (checkOnly) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "wall-corner-guides-"));
  try {
    generateAll(temporaryDirectory);
    compareGenerated(temporaryDirectory);
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  }
  process.stdout.write(
    `Validated ${artifactNames.length} deterministic wall guide artifacts.\n`,
  );
} else {
  generateAll(guideDirectory);
  process.stdout.write(
    `Generated ${artifactNames.length} wall guide artifacts outside active asset paths.\n`,
  );
}
