/**
 * Runtime-only camera model for the disposable F1 technical fixture.
 *
 * The bounds deliberately describe only the known technical geometry. The
 * asynchronously loaded GLB is not part of the framing contract, so its
 * arrival cannot move an already usable camera.
 */
export const CAMERA_TARGET_Y = 1.1;
export const CAMERA_MIN_ZOOM = 0.7;
export const CAMERA_MAX_ZOOM = 2.2;
export const CAMERA_FRAMING_PADDING = 1.15;
export const CAMERA_NAVIGATION_MIN_VISIBLE_FRACTION = 0.15;

export const TECHNICAL_FIXTURE_BOUNDS = Object.freeze({
  maxX: 7,
  maxY: 3.3,
  maxZ: 5,
  minX: -7,
  minY: -0.1,
  minZ: -5.1,
});

export const CAMERA_INITIAL_OFFSET = Object.freeze({
  x: 12,
  y: 9.9,
  z: 14,
});

interface Vector3Like {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface ProjectedBounds {
  readonly maxX: number;
  readonly maxY: number;
  readonly minX: number;
  readonly minY: number;
}

interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
}

interface CameraNavigationConstraint {
  readonly allowedViewRegion: readonly ProjectedPoint[];
  readonly bounds: CameraNavigationBounds;
  readonly minimumVisibleProjectionArea: number;
}

function normalize(vector: Vector3Like): Vector3Like {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  return Object.freeze({
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  });
}

// These axes are derived once from the fixed initial offset and world-up.
// Keeping them here makes the framing and navigation geometry testable without
// making Three.js the authority for the logical state.
const cameraBackward = normalize(CAMERA_INITIAL_OFFSET);
const cameraRight = normalize({
  x: cameraBackward.z,
  y: 0,
  z: -cameraBackward.x,
});
const cameraUp = normalize({
  x: cameraBackward.y * cameraRight.z,
  y: cameraBackward.z * cameraRight.x - cameraBackward.x * cameraRight.z,
  z: -cameraBackward.y * cameraRight.x,
});

function projectPoint(point: Vector3Like): ProjectedPoint {
  const relativeX = point.x;
  const relativeY = point.y - CAMERA_TARGET_Y;
  const relativeZ = point.z;
  return Object.freeze({
    x:
      relativeX * cameraRight.x +
      relativeY * cameraRight.y +
      relativeZ * cameraRight.z,
    y: relativeX * cameraUp.x + relativeY * cameraUp.y + relativeZ * cameraUp.z,
  });
}

function projectTechnicalFixtureBounds(): ProjectedBounds {
  const projected = [
    TECHNICAL_FIXTURE_BOUNDS.minX,
    TECHNICAL_FIXTURE_BOUNDS.maxX,
  ].flatMap((x) =>
    [TECHNICAL_FIXTURE_BOUNDS.minY, TECHNICAL_FIXTURE_BOUNDS.maxY].flatMap(
      (y) =>
        [TECHNICAL_FIXTURE_BOUNDS.minZ, TECHNICAL_FIXTURE_BOUNDS.maxZ].map(
          (z) => projectPoint({ x, y, z }),
        ),
    ),
  );
  return Object.freeze({
    maxX: Math.max(...projected.map((point) => point.x)),
    maxY: Math.max(...projected.map((point) => point.y)),
    minX: Math.min(...projected.map((point) => point.x)),
    minY: Math.min(...projected.map((point) => point.y)),
  });
}

const projectedTechnicalFixtureBounds = projectTechnicalFixtureBounds();

// The technical floor is the one continuous, visible surface of the fixture.
// Its projection, rather than the axis-aligned box around every mesh, is the
// reference for the navigation guarantee. In particular, an AABB has empty
// diagonal corners that cannot prove that a visible mesh remains on screen.
const projectedTechnicalFixtureFloor = convexHull(
  [
    { x: TECHNICAL_FIXTURE_BOUNDS.minX, y: 0.1, z: -5 },
    { x: TECHNICAL_FIXTURE_BOUNDS.maxX, y: 0.1, z: -5 },
    {
      x: TECHNICAL_FIXTURE_BOUNDS.maxX,
      y: 0.1,
      z: TECHNICAL_FIXTURE_BOUNDS.maxZ,
    },
    {
      x: TECHNICAL_FIXTURE_BOUNDS.minX,
      y: 0.1,
      z: TECHNICAL_FIXTURE_BOUNDS.maxZ,
    },
  ].map(projectPoint),
);
const projectedTechnicalFixtureFloorBounds = boundsForProjectedPoints(
  projectedTechnicalFixtureFloor,
);

function cross(
  origin: ProjectedPoint,
  first: ProjectedPoint,
  second: ProjectedPoint,
): number {
  return (
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x)
  );
}

function convexHull(
  points: readonly ProjectedPoint[],
): readonly ProjectedPoint[] {
  const sorted = [...points].sort((first, second) =>
    first.x === second.x ? first.y - second.y : first.x - second.x,
  );
  if (sorted.length < 3) return Object.freeze(sorted);

  const lower: ProjectedPoint[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: ProjectedPoint[] = [];
  for (const point of [...sorted].reverse()) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return Object.freeze([...lower, ...upper]);
}

function boundsForProjectedPoints(
  points: readonly ProjectedPoint[],
): ProjectedBounds {
  return Object.freeze({
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y)),
    minX: Math.min(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
  });
}

function clipPolygonAgainstEdge(
  polygon: readonly ProjectedPoint[],
  edgeStart: ProjectedPoint,
  edgeEnd: ProjectedPoint,
  inset: number,
): readonly ProjectedPoint[] {
  const edgeX = edgeEnd.x - edgeStart.x;
  const edgeY = edgeEnd.y - edgeStart.y;
  const distance = (point: ProjectedPoint): number =>
    edgeX * (point.y - edgeStart.y) - edgeY * (point.x - edgeStart.x) - inset;
  const result: ProjectedPoint[] = [];
  for (const [index, point] of polygon.entries()) {
    const next = polygon[(index + 1) % polygon.length];
    const pointDistance = distance(point);
    const nextDistance = distance(next);
    const pointInside = pointDistance >= 0;
    const nextInside = nextDistance >= 0;
    if (pointInside) result.push(point);
    if (pointInside === nextInside) continue;
    const ratio = pointDistance / (pointDistance - nextDistance);
    result.push(
      Object.freeze({
        x: point.x + (next.x - point.x) * ratio,
        y: point.y + (next.y - point.y) * ratio,
      }),
    );
  }
  return Object.freeze(result);
}

function insetConvexPolygonByRectangle(
  polygon: readonly ProjectedPoint[],
  halfWidth: number,
  halfHeight: number,
): readonly ProjectedPoint[] {
  let inset = polygon;
  for (const [index, start] of polygon.entries()) {
    const end = polygon[(index + 1) % polygon.length];
    const edgeX = end.x - start.x;
    const edgeY = end.y - start.y;
    inset = clipPolygonAgainstEdge(
      inset,
      start,
      end,
      Math.abs(edgeX) * halfHeight + Math.abs(edgeY) * halfWidth,
    );
    if (inset.length === 0) return inset;
  }
  return inset;
}

function expandConvexPolygonByRectangle(
  polygon: readonly ProjectedPoint[],
  halfWidth: number,
  halfHeight: number,
): readonly ProjectedPoint[] {
  return convexHull(
    polygon.flatMap((point) =>
      [-halfWidth, halfWidth].flatMap((x) =>
        [-halfHeight, halfHeight].map((y) =>
          Object.freeze({ x: point.x + x, y: point.y + y }),
        ),
      ),
    ),
  );
}

function isPointInsideConvexPolygon(
  point: ProjectedPoint,
  polygon: readonly ProjectedPoint[],
): boolean {
  return polygon.every(
    (vertex, index) =>
      cross(vertex, polygon[(index + 1) % polygon.length], point) >= -1e-10,
  );
}

function closestPointOnSegment(
  point: ProjectedPoint,
  start: ProjectedPoint,
  end: ProjectedPoint,
): ProjectedPoint {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX ** 2 + deltaY ** 2;
  if (lengthSquared === 0) return start;
  const position = Math.min(
    1,
    Math.max(
      0,
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
        lengthSquared,
    ),
  );
  return Object.freeze({
    x: start.x + deltaX * position,
    y: start.y + deltaY * position,
  });
}

function closestPointInConvexPolygon(
  point: ProjectedPoint,
  polygon: readonly ProjectedPoint[],
): ProjectedPoint | null {
  if (polygon.length === 0) return null;
  if (isPointInsideConvexPolygon(point, polygon)) return point;
  let closest: ProjectedPoint | undefined;
  let closestDistanceSquared = Number.POSITIVE_INFINITY;
  for (const [index, start] of polygon.entries()) {
    const candidate = closestPointOnSegment(
      point,
      start,
      polygon[(index + 1) % polygon.length],
    );
    const distanceSquared =
      (candidate.x - point.x) ** 2 + (candidate.y - point.y) ** 2;
    if (distanceSquared < closestDistanceSquared) {
      closest = candidate;
      closestDistanceSquared = distanceSquared;
    }
  }
  return closest ?? null;
}

function clipPolygonToRectangle(
  polygon: readonly ProjectedPoint[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): readonly ProjectedPoint[] {
  const rectangle = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
  let clipped = polygon;
  for (const [index, start] of rectangle.entries()) {
    clipped = clipPolygonAgainstEdge(
      clipped,
      start,
      rectangle[(index + 1) % rectangle.length],
      0,
    );
    if (clipped.length === 0) return clipped;
  }
  return clipped;
}

function polygonArea(polygon: readonly ProjectedPoint[]): number {
  if (polygon.length < 3) return 0;
  return Math.abs(
    polygon.reduce(
      (area, point, index) =>
        area +
        point.x * polygon[(index + 1) % polygon.length].y -
        point.y * polygon[(index + 1) % polygon.length].x,
      0,
    ) / 2,
  );
}

// Public aliases retained from F3-A. They are now derived from the explicit
// fixture bounds and padding rather than being independently tuned literals.
export const CAMERA_REFERENCE_HALF_WIDTH =
  Math.max(
    Math.abs(projectedTechnicalFixtureBounds.minX),
    Math.abs(projectedTechnicalFixtureBounds.maxX),
  ) * CAMERA_FRAMING_PADDING;
export const CAMERA_REFERENCE_HALF_HEIGHT =
  Math.max(
    Math.abs(projectedTechnicalFixtureBounds.minY),
    Math.abs(projectedTechnicalFixtureBounds.maxY),
  ) * CAMERA_FRAMING_PADDING;

export interface OrthographicFrustum {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

export interface CameraNavigationState {
  readonly targetX: number;
  readonly targetZ: number;
  readonly zoom: number;
}

export interface CameraNavigationBounds {
  readonly maxViewX: number;
  readonly maxViewY: number;
  readonly minViewX: number;
  readonly minViewY: number;
}

export interface NavigationPlanePoint {
  readonly x: number;
  readonly z: number;
}

export function initialCameraNavigationState(): CameraNavigationState {
  return Object.freeze({ targetX: 0, targetZ: 0, zoom: 1 });
}

export function clampCameraZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1;
  return Math.min(CAMERA_MAX_ZOOM, Math.max(CAMERA_MIN_ZOOM, zoom));
}

/**
 * Derives a contain-style orthographic frustum for a usable viewport. An
 * invalid viewport has no derived camera state: callers retain their last
 * trusted state and wait for a later valid viewport.
 */
export function orthographicFrustumForViewport(
  width: number,
  height: number,
): OrthographicFrustum | null {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const aspect = width / height;
  if (!Number.isFinite(aspect) || aspect <= 0) return null;
  const referenceAspect =
    CAMERA_REFERENCE_HALF_WIDTH / CAMERA_REFERENCE_HALF_HEIGHT;
  const halfWidth =
    aspect >= referenceAspect
      ? CAMERA_REFERENCE_HALF_HEIGHT * aspect
      : CAMERA_REFERENCE_HALF_WIDTH;
  const halfHeight =
    aspect >= referenceAspect
      ? CAMERA_REFERENCE_HALF_HEIGHT
      : CAMERA_REFERENCE_HALF_WIDTH / aspect;

  if (!Number.isFinite(halfWidth) || !Number.isFinite(halfHeight)) {
    return null;
  }

  return Object.freeze({
    bottom: -halfHeight,
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
  });
}

function cameraViewOffsetForTarget(state: CameraNavigationState): {
  readonly x: number;
  readonly y: number;
} {
  return Object.freeze({
    x: state.targetX * cameraRight.x + state.targetZ * cameraRight.z,
    y: state.targetX * cameraUp.x + state.targetZ * cameraUp.z,
  });
}

function targetForCameraViewOffset(
  viewX: number,
  viewY: number,
  zoom: number,
): CameraNavigationState | null {
  const determinant = cameraRight.x * cameraUp.z - cameraRight.z * cameraUp.x;
  if (!Number.isFinite(determinant) || determinant === 0) return null;
  const targetX = (viewX * cameraUp.z - cameraRight.z * viewY) / determinant;
  const targetZ = (cameraRight.x * viewY - viewX * cameraUp.x) / determinant;
  if (!Number.isFinite(targetX) || !Number.isFinite(targetZ)) return null;
  return Object.freeze({ targetX, targetZ, zoom: clampCameraZoom(zoom) });
}

function cameraNavigationConstraintForViewport(
  width: number,
  height: number,
  zoom: number,
): CameraNavigationConstraint | null {
  const frustum = orthographicFrustumForViewport(width, height);
  if (!frustum) return null;
  const safeZoom = clampCameraZoom(zoom);
  const halfWidth = (frustum.right - frustum.left) / (2 * safeZoom);
  const halfHeight = (frustum.top - frustum.bottom) / (2 * safeZoom);
  const floorWidth =
    projectedTechnicalFixtureFloorBounds.maxX -
    projectedTechnicalFixtureFloorBounds.minX;
  const floorHeight =
    projectedTechnicalFixtureFloorBounds.maxY -
    projectedTechnicalFixtureFloorBounds.minY;
  const visibleWidth = Math.min(
    floorWidth * CAMERA_NAVIGATION_MIN_VISIBLE_FRACTION,
    2 * halfWidth,
  );
  const visibleHeight = Math.min(
    floorHeight * CAMERA_NAVIGATION_MIN_VISIBLE_FRACTION,
    2 * halfHeight,
  );
  const visiblePatch = insetConvexPolygonByRectangle(
    projectedTechnicalFixtureFloor,
    visibleWidth / 2,
    visibleHeight / 2,
  );
  if (visiblePatch.length === 0) return null;
  const allowedViewRegion = expandConvexPolygonByRectangle(
    visiblePatch,
    halfWidth - visibleWidth / 2,
    halfHeight - visibleHeight / 2,
  );
  if (allowedViewRegion.length === 0) return null;
  const allowedBounds = boundsForProjectedPoints(allowedViewRegion);
  const bounds = Object.freeze({
    maxViewX: allowedBounds.maxX,
    maxViewY: allowedBounds.maxY,
    minViewX: allowedBounds.minX,
    minViewY: allowedBounds.minY,
  });
  if (
    !Object.values(bounds).every(Number.isFinite) ||
    !Number.isFinite(visibleWidth * visibleHeight)
  ) {
    return null;
  }
  return Object.freeze({
    allowedViewRegion,
    bounds,
    minimumVisibleProjectionArea: visibleWidth * visibleHeight,
  });
}

/**
 * Returns the extents of the valid camera-centre region in fixed view axes.
 * The region itself is convex, because a rectangular viewport must retain a
 * full visible patch of the projected technical floor at diagonal limits.
 */
export function cameraNavigationBoundsForViewport(
  width: number,
  height: number,
  zoom: number,
): CameraNavigationBounds | null {
  return (
    cameraNavigationConstraintForViewport(width, height, zoom)?.bounds ?? null
  );
}

/**
 * Clamps a logical camera state without consulting a Three.js camera. Invalid
 * viewports return null so resize can preserve the last trusted state.
 */
export function clampCameraNavigationState(
  state: CameraNavigationState,
  width: number,
  height: number,
): CameraNavigationState | null {
  const zoom = clampCameraZoom(state.zoom);
  const constraint = cameraNavigationConstraintForViewport(width, height, zoom);
  if (!constraint) return null;
  const normalized =
    Number.isFinite(state.targetX) && Number.isFinite(state.targetZ)
      ? state
      : initialCameraNavigationState();
  const view = cameraViewOffsetForTarget(normalized);
  const clampedView = closestPointInConvexPolygon(
    view,
    constraint.allowedViewRegion,
  );
  return clampedView
    ? targetForCameraViewOffset(clampedView.x, clampedView.y, zoom)
    : null;
}

/**
 * Reports the guaranteed floor patch and the actual projected floor area in
 * the viewport. It is pure so every allowed navigation limit is testable
 * without a renderer or screenshot-specific coordinates.
 */
export function technicalFixtureProjectionVisibilityForNavigationState(
  state: CameraNavigationState,
  width: number,
  height: number,
): { readonly minimumArea: number; readonly visibleArea: number } | null {
  const normalized = clampCameraNavigationState(state, width, height);
  const constraint = cameraNavigationConstraintForViewport(
    width,
    height,
    normalized?.zoom ?? state.zoom,
  );
  const frustum = orthographicFrustumForViewport(width, height);
  if (!normalized || !constraint || !frustum) return null;
  const view = cameraViewOffsetForTarget(normalized);
  const halfWidth = (frustum.right - frustum.left) / (2 * normalized.zoom);
  const halfHeight = (frustum.top - frustum.bottom) / (2 * normalized.zoom);
  const visibleFloor = clipPolygonToRectangle(
    projectedTechnicalFixtureFloor,
    view.x - halfWidth,
    view.x + halfWidth,
    view.y - halfHeight,
    view.y + halfHeight,
  );
  return Object.freeze({
    minimumArea: constraint.minimumVisibleProjectionArea,
    visibleArea: polygonArea(visibleFloor),
  });
}

/** Translates a screen-plane pan into the fixed world X/Z navigation plane. */
export function panCameraNavigationState(
  state: CameraNavigationState,
  viewDeltaX: number,
  viewDeltaY: number,
  width: number,
  height: number,
): CameraNavigationState | null {
  if (!Number.isFinite(viewDeltaX) || !Number.isFinite(viewDeltaY)) {
    return clampCameraNavigationState(state, width, height);
  }
  const normalized = clampCameraNavigationState(state, width, height);
  if (!normalized) return null;
  const view = cameraViewOffsetForTarget(normalized);
  const candidate = targetForCameraViewOffset(
    view.x + viewDeltaX,
    view.y + viewDeltaY,
    normalized.zoom,
  );
  return candidate
    ? clampCameraNavigationState(candidate, width, height)
    : normalized;
}

/**
 * Resolves a viewport position to the X/Z navigation plane for the current
 * orthographic state. This is the shared screen-space bridge used by pan and
 * focal zoom; it does not consult a Three.js camera or DOM rectangle.
 */
export function navigationPlanePointForScreenPosition(
  state: CameraNavigationState,
  screenX: number,
  screenY: number,
  width: number,
  height: number,
): NavigationPlanePoint | null {
  if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
  const normalized = clampCameraNavigationState(state, width, height);
  const frustum = orthographicFrustumForViewport(width, height);
  if (!normalized || !frustum) return null;
  const view = cameraViewOffsetForTarget(normalized);
  const viewX =
    view.x +
    (frustum.left + (screenX / width) * (frustum.right - frustum.left)) /
      normalized.zoom;
  const viewY =
    view.y +
    (frustum.top - (screenY / height) * (frustum.top - frustum.bottom)) /
      normalized.zoom;
  const point = targetForCameraViewOffset(viewX, viewY, normalized.zoom);
  return point ? Object.freeze({ x: point.targetX, z: point.targetZ }) : null;
}

/** Moves the logical target so the world follows a pointer between screens. */
export function panCameraNavigationStateBetweenScreenPoints(
  state: CameraNavigationState,
  previous: { readonly x: number; readonly y: number },
  current: { readonly x: number; readonly y: number },
  width: number,
  height: number,
): CameraNavigationState | null {
  const normalized = clampCameraNavigationState(state, width, height);
  const previousPoint = navigationPlanePointForScreenPosition(
    state,
    previous.x,
    previous.y,
    width,
    height,
  );
  const currentPoint = navigationPlanePointForScreenPosition(
    state,
    current.x,
    current.y,
    width,
    height,
  );
  if (!normalized || !previousPoint || !currentPoint) return normalized;
  return clampCameraNavigationState(
    {
      targetX: normalized.targetX + previousPoint.x - currentPoint.x,
      targetZ: normalized.targetZ + previousPoint.z - currentPoint.z,
      zoom: normalized.zoom,
    },
    width,
    height,
  );
}

/**
 * Changes zoom while mapping a world point from a previous screen position to
 * a current screen position. Equal positions produce ordinary focal zoom;
 * distinct positions compose midpoint pan and pinch zoom in one operation.
 */
export function zoomCameraNavigationStateBetweenScreenPoints(
  state: CameraNavigationState,
  previous: { readonly x: number; readonly y: number },
  current: { readonly x: number; readonly y: number },
  zoom: number,
  width: number,
  height: number,
): CameraNavigationState | null {
  const normalized = clampCameraNavigationState(state, width, height);
  const anchor = navigationPlanePointForScreenPosition(
    state,
    previous.x,
    previous.y,
    width,
    height,
  );
  const frustum = orthographicFrustumForViewport(width, height);
  if (!normalized || !anchor || !frustum) return normalized;
  const nextZoom = clampCameraZoom(zoom);
  const screenViewX =
    (frustum.left + (current.x / width) * (frustum.right - frustum.left)) /
    nextZoom;
  const screenViewY =
    (frustum.top - (current.y / height) * (frustum.top - frustum.bottom)) /
    nextZoom;
  const anchorView = cameraViewOffsetForTarget({
    targetX: anchor.x,
    targetZ: anchor.z,
    zoom: nextZoom,
  });
  const candidate = targetForCameraViewOffset(
    anchorView.x - screenViewX,
    anchorView.y - screenViewY,
    nextZoom,
  );
  return candidate
    ? clampCameraNavigationState(candidate, width, height)
    : normalized;
}
