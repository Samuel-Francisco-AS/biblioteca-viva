/** Renderer-free X/Z geometry, in metres. Touching edges are not collisions. */
export interface SpatialRectangle {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export function validRectangle(rect: SpatialRectangle): boolean {
  return (
    [rect.minX, rect.maxX, rect.minZ, rect.maxZ].every(Number.isFinite) &&
    rect.maxX > rect.minX &&
    rect.maxZ > rect.minZ
  );
}

export function containsRectangle(
  outer: SpatialRectangle,
  inner: SpatialRectangle,
): boolean {
  const epsilon = 1e-6;
  return (
    inner.minX >= outer.minX - epsilon &&
    inner.maxX <= outer.maxX + epsilon &&
    inner.minZ >= outer.minZ - epsilon &&
    inner.maxZ <= outer.maxZ + epsilon
  );
}

export function rectanglesOverlap(
  a: SpatialRectangle,
  b: SpatialRectangle,
): boolean {
  return (
    Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) > 1e-6 &&
    Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ) > 1e-6
  );
}

/** Exact partition at rectangle edges; no sampling grid or navigation algorithm. */
export function coveredByRectangles(
  target: SpatialRectangle,
  surfaces: readonly SpatialRectangle[],
): boolean {
  if (!validRectangle(target)) return false;
  const xs = [
    ...new Set([
      target.minX,
      target.maxX,
      ...surfaces
        .flatMap((s) => [s.minX, s.maxX])
        .filter((x) => x > target.minX && x < target.maxX),
    ]),
  ].sort((a, b) => a - b);
  const zs = [
    ...new Set([
      target.minZ,
      target.maxZ,
      ...surfaces
        .flatMap((s) => [s.minZ, s.maxZ])
        .filter((z) => z > target.minZ && z < target.maxZ),
    ]),
  ].sort((a, b) => a - b);
  return xs.slice(1).every((maxX, x) =>
    zs.slice(1).every((maxZ, z) =>
      surfaces.some((surface) =>
        containsRectangle(surface, {
          minX: xs[x],
          maxX,
          minZ: zs[z],
          maxZ,
        }),
      ),
    ),
  );
}

/** Tests connectivity of the reserved area after erosion by half the clearance.
 * Overlapping/touching eroded rectangles allow a square envelope to pass.
 * Conservative at corners; this does not find paths or simulate characters.
 */
export function connectedWithClearance(
  regions: readonly SpatialRectangle[],
  clearance: number,
): boolean {
  if (
    !Number.isFinite(clearance) ||
    clearance <= 0 ||
    !regions.length ||
    !regions.every(validRectangle)
  )
    return false;
  const half = clearance / 2;
  const eroded = regions.map((r) => ({
    minX: r.minX + half,
    maxX: r.maxX - half,
    minZ: r.minZ + half,
    maxZ: r.maxZ - half,
  }));
  if (eroded.some((r) => r.minX > r.maxX + 1e-6 || r.minZ > r.maxZ + 1e-6))
    return false;
  const visited = new Set([0]);
  for (let previous = -1; previous !== visited.size;) {
    previous = visited.size;
    for (const [i, a] of eroded.entries()) {
      if (!visited.has(i)) continue;
      eroded.forEach((b, j) => {
        if (
          a.minX <= b.maxX + 1e-6 &&
          a.maxX >= b.minX - 1e-6 &&
          a.minZ <= b.maxZ + 1e-6 &&
          a.maxZ >= b.minZ - 1e-6
        )
          visited.add(j);
      });
    }
  }
  return visited.size === regions.length;
}
