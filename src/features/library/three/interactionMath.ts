import {
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
  clampCameraZoom,
} from "./cameraMath";

export const TAP_DRAG_THRESHOLD_PX = 8;
export const MIN_CAMERA_ZOOM = CAMERA_MIN_ZOOM;
export const MAX_CAMERA_ZOOM = CAMERA_MAX_ZOOM;
export const WHEEL_ZOOM_SENSITIVITY = 0.0015;
export const WHEEL_LINE_HEIGHT_PX = 16;

export { clampCameraZoom };

export interface PointerPosition {
  readonly x: number;
  readonly y: number;
}

export function pointerDistance(
  first: PointerPosition,
  second: PointerPosition,
): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function exceedsTapDragThreshold(
  start: PointerPosition,
  current: PointerPosition,
  threshold = TAP_DRAG_THRESHOLD_PX,
): boolean {
  return pointerDistance(start, current) > threshold;
}

export function wheelDeltaPixels(
  deltaY: number,
  deltaMode: number,
  pageHeight: number,
): number {
  if (!Number.isFinite(deltaY)) return 0;
  if (deltaMode === 1) return deltaY * WHEEL_LINE_HEIGHT_PX;
  if (deltaMode === 2 && Number.isFinite(pageHeight) && pageHeight > 0) {
    return deltaY * pageHeight;
  }
  return deltaY;
}

export function zoomFromWheel(
  currentZoom: number,
  deltaY: number,
  deltaMode = 0,
  pageHeight = 0,
): number {
  const pixels = wheelDeltaPixels(deltaY, deltaMode, pageHeight);
  return clampCameraZoom(
    currentZoom * Math.exp(-pixels * WHEEL_ZOOM_SENSITIVITY),
  );
}

export function zoomFromPinch(
  initialZoom: number,
  initialDistance: number,
  currentDistance: number,
): number {
  if (
    !Number.isFinite(initialDistance) ||
    !Number.isFinite(currentDistance) ||
    initialDistance <= 0 ||
    currentDistance <= 0
  ) {
    return clampCameraZoom(initialZoom);
  }
  return clampCameraZoom(initialZoom * (currentDistance / initialDistance));
}

export function panDistanceForPixels(
  pixels: number,
  viewSize: number,
  viewportPixels: number,
  zoom: number,
): number {
  if (
    !Number.isFinite(pixels) ||
    !Number.isFinite(viewSize) ||
    !Number.isFinite(viewportPixels) ||
    viewportPixels <= 0
  ) {
    return 0;
  }
  return (pixels * viewSize) / (viewportPixels * clampCameraZoom(zoom));
}
