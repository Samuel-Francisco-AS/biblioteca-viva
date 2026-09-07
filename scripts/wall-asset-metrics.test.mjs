// @vitest-environment node

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  countAlphaUnsupportedRows,
  derivePadding,
  inspectPng,
  maximumAlphaOutsideRectangles,
  parseImageGeometry,
  runImageMagick,
} from "./wall-asset-metrics.mjs";

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("wall asset alpha measurement", () => {
  it("preserves a shifted alpha bounding box on the original canvas", () => {
    const directory = mkdtempSync(join(tmpdir(), "wall-asset-metrics-"));
    temporaryDirectories.push(directory);
    const file = join(directory, "shifted-alpha.png");
    runImageMagick([
      "-size",
      "20x20",
      "xc:none",
      "-fill",
      "white",
      "-draw",
      "rectangle 7,9 10,14",
      `PNG32:${file}`,
    ]);

    const measured = inspectPng(file);

    expect(measured.canvas).toEqual({ height: 20, width: 20 });
    expect(measured.alphaBounds).toEqual({
      height: 6,
      width: 4,
      x: 7,
      y: 9,
    });
    expect(measured.padding).toEqual({
      bottom: 5,
      left: 7,
      right: 9,
      top: 9,
    });
    expect(
      maximumAlphaOutsideRectangles(file, [
        { height: 6, width: 4, x: 7, y: 9 },
      ]),
    ).toBe(0);
    expect(
      maximumAlphaOutsideRectangles(file, [
        { height: 5, width: 4, x: 7, y: 9 },
      ]),
    ).toBe(1);
  });

  it("parses signed ImageMagick geometry without discarding its offset", () => {
    expect(parseImageGeometry("235x300+25+24")).toEqual({
      height: 300,
      width: 235,
      x: 25,
      y: 24,
    });
    expect(
      derivePadding(
        { height: 348, width: 284 },
        { height: 300, width: 235, x: 25, y: 24 },
      ),
    ).toEqual({ bottom: 24, left: 25, right: 24, top: 24 });
  });

  it("counts profile rows without alpha inside a read-only endpoint band", () => {
    const directory = mkdtempSync(join(tmpdir(), "wall-alpha-support-"));
    temporaryDirectories.push(directory);
    const file = join(directory, "endpoint.png");
    runImageMagick([
      "-size",
      "8x6",
      "xc:none",
      "-fill",
      "white",
      "-draw",
      "rectangle 1,1 6,2 rectangle 3,3 6,3 rectangle 1,4 6,4",
      `PNG32:${file}`,
    ]);

    expect(
      countAlphaUnsupportedRows(file, { height: 4, width: 2, x: 1, y: 1 }),
    ).toBe(1);
    expect(
      countAlphaUnsupportedRows(file, { height: 4, width: 4, x: 1, y: 1 }),
    ).toBe(0);
  });
});
