import { OrthographicCamera } from "three";

import {
  CAMERA_INITIAL_OFFSET,
  CAMERA_TARGET_Y,
  clampCameraNavigationState,
  clampCameraZoom,
  initialCameraNavigationState,
  orthographicFrustumForViewport,
  panCameraNavigationStateBetweenScreenPoints,
  type CameraNavigationState,
  zoomCameraNavigationStateBetweenScreenPoints,
} from "./cameraMath";

/** Single runtime authority for logical target/zoom and its camera projection. */
export class CameraNavigation {
  private state: CameraNavigationState;
  private viewport: { readonly height: number; readonly width: number } | null =
    null;

  constructor(
    private readonly camera: OrthographicCamera,
    initialZoom = 1,
  ) {
    // Initial framing must exist before the first viewport-triggered render.
    // The legacy F3/F5 path retains zoom 1.
    this.state = Object.freeze({
      ...initialCameraNavigationState(),
      zoom: clampCameraZoom(initialZoom),
    });
    this.applyState();
  }

  getState(): CameraNavigationState {
    return this.state;
  }

  invalidateViewport(): void {
    this.viewport = null;
  }

  panBetweenScreenPoints(
    previous: { readonly x: number; readonly y: number },
    current: { readonly x: number; readonly y: number },
  ): boolean {
    if (!this.viewport) return false;
    const next = panCameraNavigationStateBetweenScreenPoints(
      this.state,
      previous,
      current,
      this.viewport.width,
      this.viewport.height,
    );
    return this.commit(next);
  }

  setViewport(width: number, height: number): boolean {
    const next = clampCameraNavigationState(this.state, width, height);
    const frustum = orthographicFrustumForViewport(width, height);
    if (!next || !frustum) return false;
    this.viewport = Object.freeze({ height, width });
    this.state = next;
    this.camera.left = frustum.left;
    this.camera.right = frustum.right;
    this.camera.top = frustum.top;
    this.camera.bottom = frustum.bottom;
    this.applyState();
    return true;
  }

  setZoom(zoom: number): boolean {
    if (!this.viewport) return false;
    return this.commit({ ...this.state, zoom: clampCameraZoom(zoom) });
  }

  zoomBetweenScreenPoints(
    previous: { readonly x: number; readonly y: number },
    current: { readonly x: number; readonly y: number },
    zoom: number,
  ): boolean {
    if (!this.viewport) return false;
    return this.commit(
      zoomCameraNavigationStateBetweenScreenPoints(
        this.state,
        previous,
        current,
        zoom,
        this.viewport.width,
        this.viewport.height,
      ),
    );
  }

  private commit(candidate: CameraNavigationState | null): boolean {
    if (!candidate || !this.viewport) return false;
    const next = clampCameraNavigationState(
      candidate,
      this.viewport.width,
      this.viewport.height,
    );
    if (!next) return false;
    const changed =
      next.targetX !== this.state.targetX ||
      next.targetZ !== this.state.targetZ ||
      next.zoom !== this.state.zoom;
    this.state = next;
    if (changed) this.applyState();
    return changed;
  }

  private applyState(): void {
    this.camera.position.set(
      this.state.targetX + CAMERA_INITIAL_OFFSET.x,
      CAMERA_TARGET_Y + CAMERA_INITIAL_OFFSET.y,
      this.state.targetZ + CAMERA_INITIAL_OFFSET.z,
    );
    this.camera.zoom = this.state.zoom;
    this.camera.lookAt(this.state.targetX, CAMERA_TARGET_Y, this.state.targetZ);
    this.camera.updateProjectionMatrix();
  }
}
