export const TAP_DRAG_THRESHOLD_PX = 8;
export const MIN_CAMERA_ZOOM = 0.7;
export const MAX_CAMERA_ZOOM = 2.2;
export const WHEEL_ZOOM_SENSITIVITY = 0.0015;

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

export function clampCameraZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(MAX_CAMERA_ZOOM, Math.max(MIN_CAMERA_ZOOM, zoom));
}

export function zoomFromWheel(currentZoom: number, deltaY: number): number {
  if (!Number.isFinite(deltaY)) return clampCameraZoom(currentZoom);
  return clampCameraZoom(
    currentZoom * Math.exp(-deltaY * WHEEL_ZOOM_SENSITIVITY),
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
