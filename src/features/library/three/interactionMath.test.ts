import { describe, expect, it } from "vitest";

import {
  MAX_CAMERA_ZOOM,
  MIN_CAMERA_ZOOM,
  TAP_DRAG_THRESHOLD_PX,
  clampCameraZoom,
  exceedsTapDragThreshold,
  panDistanceForPixels,
  pointerDistance,
  zoomFromPinch,
  zoomFromWheel,
} from "./interactionMath";

describe("matemática de interação da F1-C", () => {
  it("distingue tap de drag pelo limiar centralizado de oito pixels", () => {
    expect(TAP_DRAG_THRESHOLD_PX).toBe(8);
    expect(exceedsTapDragThreshold({ x: 10, y: 10 }, { x: 16, y: 14 })).toBe(
      false,
    );
    expect(exceedsTapDragThreshold({ x: 10, y: 10 }, { x: 19, y: 10 })).toBe(
      true,
    );
  });

  it("calcula distância de pointers e pinch proporcional com clamp", () => {
    expect(pointerDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(zoomFromPinch(1, 100, 150)).toBe(1.5);
    expect(zoomFromPinch(2, 100, 300)).toBe(MAX_CAMERA_ZOOM);
    expect(zoomFromPinch(1, 0, 200)).toBe(1);
  });

  it("mantém wheel e entradas inválidas dentro dos limites experimentais", () => {
    expect(zoomFromWheel(1, -10_000)).toBe(MAX_CAMERA_ZOOM);
    expect(zoomFromWheel(1, 10_000)).toBe(MIN_CAMERA_ZOOM);
    expect(clampCameraZoom(Number.NaN)).toBe(1);
  });

  it("transforma pixels de pan conforme viewport e zoom", () => {
    expect(panDistanceForPixels(100, 18, 600, 1)).toBe(3);
    expect(panDistanceForPixels(100, 18, 600, 2)).toBe(1.5);
    expect(panDistanceForPixels(100, 18, 0, 1)).toBe(0);
  });
});
