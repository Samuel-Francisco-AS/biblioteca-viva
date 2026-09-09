import { describe, expect, it } from "vitest";

import {
  CAMERA_FRAMING_PADDING,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
  CAMERA_REFERENCE_HALF_HEIGHT,
  CAMERA_REFERENCE_HALF_WIDTH,
  CAMERA_TARGET_Y,
  cameraNavigationBoundsForViewport,
  clampCameraNavigationState,
  clampCameraZoom,
  initialCameraNavigationState,
  navigationPlanePointForScreenPosition,
  orthographicFrustumForViewport,
  panCameraNavigationStateBetweenScreenPoints,
  panCameraNavigationState,
  technicalFixtureProjectionVisibilityForNavigationState,
  zoomCameraNavigationStateBetweenScreenPoints,
} from "./cameraMath";

describe("modelo de câmera da F3", () => {
  it("deriva framing técnico com padding explícito em portrait e landscape", () => {
    expect(CAMERA_FRAMING_PADDING).toBeGreaterThan(1);
    expect(orthographicFrustumForViewport(640, 360)).toEqual({
      bottom: -CAMERA_REFERENCE_HALF_HEIGHT,
      left: -(CAMERA_REFERENCE_HALF_HEIGHT * (640 / 360)),
      right: CAMERA_REFERENCE_HALF_HEIGHT * (640 / 360),
      top: CAMERA_REFERENCE_HALF_HEIGHT,
    });
    expect(orthographicFrustumForViewport(360, 640)).toEqual({
      bottom: -CAMERA_REFERENCE_HALF_WIDTH / (360 / 640),
      left: -CAMERA_REFERENCE_HALF_WIDTH,
      right: CAMERA_REFERENCE_HALF_WIDTH,
      top: CAMERA_REFERENCE_HALF_WIDTH / (360 / 640),
    });
  });

  it("centraliza o clamp de zoom e mantém o estado inicial no plano X/Z", () => {
    expect(clampCameraZoom(-100)).toBe(CAMERA_MIN_ZOOM);
    expect(clampCameraZoom(100)).toBe(CAMERA_MAX_ZOOM);
    expect(clampCameraZoom(Number.NaN)).toBe(1);
    expect(initialCameraNavigationState()).toEqual({
      targetX: 0,
      targetZ: 0,
      zoom: 1,
    });
    expect(CAMERA_TARGET_Y).toBe(1.1);
  });

  it("faz os limites dependerem do viewport e do zoom", () => {
    const wide = cameraNavigationBoundsForViewport(1280, 720, 1);
    const portrait = cameraNavigationBoundsForViewport(360, 640, 1);
    const close = cameraNavigationBoundsForViewport(1280, 720, 2.2);
    expect(wide).not.toBeNull();
    expect(portrait).not.toBeNull();
    expect(close).not.toBeNull();
    expect(wide?.maxViewX).not.toBe(portrait?.maxViewX);
    expect(close?.maxViewX).toBeLessThan(wide?.maxViewX ?? Infinity);
  });

  it("clampa target em eixos de view e preserva o foco lógico em resize válido", () => {
    const explored = panCameraNavigationState(
      initialCameraNavigationState(),
      3,
      -2,
      640,
      360,
    );
    expect(explored).not.toBeNull();
    const resized = clampCameraNavigationState(explored!, 360, 640);
    expect(resized).toEqual(explored);
    const bounded = panCameraNavigationState(resized!, 1e100, -1e100, 360, 640);
    expect(bounded).not.toBeNull();
    expect(Number.isFinite(bounded!.targetX)).toBe(true);
    expect(Number.isFinite(bounded!.targetZ)).toBe(true);
  });

  it.each([
    { height: 640, width: 360, zoom: CAMERA_MIN_ZOOM },
    { height: 640, width: 360, zoom: 1 },
    { height: 640, width: 360, zoom: CAMERA_MAX_ZOOM },
    { height: 360, width: 640, zoom: CAMERA_MIN_ZOOM },
    { height: 360, width: 640, zoom: CAMERA_MAX_ZOOM },
  ])(
    "mantém uma área útil da projeção do piso técnico nos quatro cantos para $width×$height em zoom $zoom",
    ({ height, width, zoom }) => {
      for (const viewDeltaX of [-1e100, 1e100]) {
        for (const viewDeltaY of [-1e100, 1e100]) {
          const corner = panCameraNavigationState(
            { ...initialCameraNavigationState(), zoom },
            viewDeltaX,
            viewDeltaY,
            width,
            height,
          );
          const visibility = corner
            ? technicalFixtureProjectionVisibilityForNavigationState(
                corner,
                width,
                height,
              )
            : null;

          expect(corner).not.toBeNull();
          expect(visibility).not.toBeNull();
          expect(visibility?.minimumArea).toBeGreaterThan(0);
          expect(visibility?.visibleArea).toBeGreaterThanOrEqual(
            (visibility?.minimumArea ?? Number.POSITIVE_INFINITY) - 1e-8,
          );
        }
      }
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "não deriva frustum de dimensão inválida: %s",
    (invalidDimension) => {
      expect(orthographicFrustumForViewport(invalidDimension, 360)).toBeNull();
      expect(orthographicFrustumForViewport(640, invalidDimension)).toBeNull();
    },
  );

  it("não aceita viewport finito cujo aspect faria o frustum transbordar", () => {
    expect(orthographicFrustumForViewport(Number.MAX_VALUE, 1)).toBeNull();
  });

  it("não fabrica estado de navegação para viewport inválido ou overflow", () => {
    const state = { targetX: Number.POSITIVE_INFINITY, targetZ: 1, zoom: 1 };
    expect(clampCameraNavigationState(state, 0, 360)).toBeNull();
    expect(clampCameraNavigationState(state, Number.MAX_VALUE, 1)).toBeNull();
  });

  it.each([
    [640, 360, 0.7],
    [640, 360, 2.2],
    [360, 640, 0.7],
    [360, 640, 2.2],
  ])(
    "deriva pan no plano navegável para %ix%i com zoom %f",
    (width, height, zoom) => {
      const state = { targetX: 0, targetZ: 0, zoom };
      const previous = { x: width * 0.4, y: height * 0.45 };
      const current = { x: width * 0.55, y: height * 0.6 };
      const before = navigationPlanePointForScreenPosition(
        state,
        previous.x,
        previous.y,
        width,
        height,
      );
      const after = navigationPlanePointForScreenPosition(
        state,
        current.x,
        current.y,
        width,
        height,
      );
      const panned = panCameraNavigationStateBetweenScreenPoints(
        state,
        previous,
        current,
        width,
        height,
      );

      expect(before).not.toBeNull();
      expect(after).not.toBeNull();
      expect(panned).not.toBeNull();
      expect(panned?.targetX).toBeCloseTo(
        (before?.x ?? 0) - (after?.x ?? 0),
        12,
      );
      expect(panned?.targetZ).toBeCloseTo(
        (before?.z ?? 0) - (after?.z ?? 0),
        12,
      );
      expect(panned?.zoom).toBe(zoom);
    },
  );

  it("clampa pan derivado da tela sem introduzir estado fora do plano X/Z", () => {
    const state = panCameraNavigationStateBetweenScreenPoints(
      initialCameraNavigationState(),
      { x: 320, y: 180 },
      { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
      640,
      360,
    );
    const bounds = cameraNavigationBoundsForViewport(640, 360, 1);

    expect(state).not.toBeNull();
    expect(bounds).not.toBeNull();
    expect(Number.isFinite(state?.targetX)).toBe(true);
    expect(Number.isFinite(state?.targetZ)).toBe(true);
    expect(state?.zoom).toBe(1);
  });

  it.each([
    { height: 360, width: 640, x: 320, y: 180, zoom: 1.6 },
    { height: 360, width: 640, x: 520, y: 96, zoom: 1.6 },
    { height: 640, width: 360, x: 320, y: 560, zoom: 0.8 },
  ])(
    "preserva a âncora focal sem bounds em $width×$height para zoom $zoom",
    ({ height, width, x, y, zoom }) => {
      const state = { ...initialCameraNavigationState(), zoom: 1 };
      const before = navigationPlanePointForScreenPosition(
        state,
        x,
        y,
        width,
        height,
      );
      const zoomed = zoomCameraNavigationStateBetweenScreenPoints(
        state,
        { x, y },
        { x, y },
        zoom,
        width,
        height,
      );
      const after = zoomed
        ? navigationPlanePointForScreenPosition(zoomed, x, y, width, height)
        : null;

      expect(zoomed?.zoom).toBe(zoom);
      expect(after?.x).toBeCloseTo(before?.x ?? 0, 10);
      expect(after?.z).toBeCloseTo(before?.z ?? 0, 10);
    },
  );

  it("clampa zoom nos extremos e deixa bounds terem autoridade sobre a âncora", () => {
    const edge = panCameraNavigationState(
      initialCameraNavigationState(),
      -1e100,
      0,
      640,
      360,
    );
    expect(edge).not.toBeNull();
    const before = navigationPlanePointForScreenPosition(
      edge!,
      0,
      180,
      640,
      360,
    );
    const close = zoomCameraNavigationStateBetweenScreenPoints(
      edge!,
      { x: 0, y: 180 },
      { x: 0, y: 180 },
      100,
      640,
      360,
    );
    const after = close
      ? navigationPlanePointForScreenPosition(close, 0, 180, 640, 360)
      : null;
    const far = zoomCameraNavigationStateBetweenScreenPoints(
      initialCameraNavigationState(),
      { x: 320, y: 180 },
      { x: 320, y: 180 },
      -100,
      640,
      360,
    );

    expect(close?.zoom).toBe(CAMERA_MAX_ZOOM);
    expect(far?.zoom).toBe(CAMERA_MIN_ZOOM);
    expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeGreaterThan(1e-6);
  });
});
