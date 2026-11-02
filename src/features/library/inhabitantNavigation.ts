import { LIBRARY_PASSAGES, LIBRARY_ROOMS } from "./libraryBuildingGeometry";
import {
  LIBRARY_ACTIVITY_POINTS,
  LIBRARY_CIRCULATION,
} from "./librarySpatialLayout";
import {
  containsRectangle,
  coveredByRectangles,
  type SpatialRectangle,
} from "./librarySpatialGeometry";
import { INHABITANTS } from "./inhabitants";

export interface Position {
  readonly x: number;
  readonly z: number;
}
export interface NavigationObstacle extends SpatialRectangle {
  readonly id: string;
}
export const distance = (a: Position, b: Position) =>
  Math.hypot(a.x - b.x, a.z - b.z);
export const roomAt = (p: Position) =>
  LIBRARY_ROOMS.find(
    (r) => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ,
  )?.id;

/** Swept square envelope; conservative for the measured radial character envelopes. */
export function segmentHits(
  a: Position,
  b: Position,
  box: SpatialRectangle,
  radius: number,
): boolean {
  if (
    Math.max(a.x, b.x) + radius <= box.minX ||
    Math.min(a.x, b.x) - radius >= box.maxX ||
    Math.max(a.z, b.z) + radius <= box.minZ ||
    Math.min(a.z, b.z) - radius >= box.maxZ
  )
    return false;
  let lo = 0,
    hi = 1;
  for (const [start, end, min, max] of [
    [a.x, b.x, box.minX - radius, box.maxX + radius],
    [a.z, b.z, box.minZ - radius, box.maxZ + radius],
  ]) {
    const d = end - start;
    if (Math.abs(d) < 1e-9) {
      if (start <= min || start >= max) return false;
    } else {
      const t1 = (min - start) / d,
        t2 = (max - start) / d;
      lo = Math.max(lo, Math.min(t1, t2));
      hi = Math.min(hi, Math.max(t1, t2));
      if (lo >= hi) return false;
    }
  }
  return hi >= 0 && lo <= 1;
}
const floors: readonly SpatialRectangle[] = [
  ...LIBRARY_ROOMS,
  ...[-1, 1].flatMap((sx) =>
    [-1, 1].map((sz) => ({
      minX: sx * LIBRARY_PASSAGES.x - LIBRARY_PASSAGES.length / 2,
      maxX: sx * LIBRARY_PASSAGES.x + LIBRARY_PASSAGES.length / 2,
      minZ: sz * LIBRARY_PASSAGES.z - LIBRARY_PASSAGES.width / 2,
      maxZ: sz * LIBRARY_PASSAGES.z + LIBRARY_PASSAGES.width / 2,
    })),
  ),
];
const centerlines = LIBRARY_CIRCULATION.map((r) => ({
  a: {
    x: r.maxX - r.minX > r.maxZ - r.minZ ? r.minX + 0.6 : (r.minX + r.maxX) / 2,
    z: r.maxZ - r.minZ > r.maxX - r.minX ? r.minZ + 0.6 : (r.minZ + r.maxZ) / 2,
  },
  b: {
    x: r.maxX - r.minX > r.maxZ - r.minZ ? r.maxX - 0.6 : (r.minX + r.maxX) / 2,
    z: r.maxZ - r.minZ > r.maxX - r.minX ? r.maxZ - 0.6 : (r.minZ + r.maxZ) / 2,
  },
}));
const candidates: Position[] = [
  ...LIBRARY_ACTIVITY_POINTS,
  ...INHABITANTS,
  ...centerlines.flatMap((l) => [l.a, l.b]),
];
for (const a of centerlines)
  for (const b of centerlines) {
    const p = { x: a.a.x, z: b.a.z };
    if (
      p.x >= Math.min(b.a.x, b.b.x) &&
      p.x <= Math.max(b.a.x, b.b.x) &&
      p.z >= Math.min(a.a.z, a.b.z) &&
      p.z <= Math.max(a.a.z, a.b.z)
    )
      candidates.push(p);
  }
// Portal midpoints prevent diagonal floor bounds from bypassing a real threshold.
for (const sx of [-1, 1])
  for (const sz of [-1, 1])
    for (const x of [8.3, 9.5, 10.1, 10.7, 11.8, 12.2])
      for (const offset of [-0.15, 0, 0.15])
        candidates.push({ x: sx * x, z: sz * 4.8 + offset });
candidates.push({ x: -11.7, z: 5.6 }, { x: -13, z: 10 }, { x: -12.2, z: 6.3 });
// Open hall bays provide passing/meeting space off the main circulation lines.
for (const x of [-6.5, -2, 2, 6.5])
  for (const z of [-6.5, -3, 0, 3, 6.3]) candidates.push({ x, z });

/** Small visibility graph from BF-4D centre lines, crossings and activity points.
 * The mounted geometry is authoritative: every edge is checked, not assumed. */
export class InhabitantNavigation {
  readonly nodes: readonly Position[];
  private readonly graphs = new Map<number, readonly (readonly number[])[]>();
  private readonly connections = new Map<string, readonly number[]>();
  private links(p: Position, radius: number): readonly number[] {
    const key = `${p.x}:${p.z}:${radius}`;
    const cached = this.connections.get(key);
    if (cached) return cached;
    const links = this.nodes.flatMap((q, i) =>
      this.clear(p, q, radius) ? [i] : [],
    );
    if (this.connections.size >= 128)
      this.connections.delete(this.connections.keys().next().value!);
    this.connections.set(key, links);
    return links;
  }
  constructor(readonly obstacles: readonly NavigationObstacle[]) {
    this.nodes = candidates.filter(
      (p, i, all) => all.findIndex((q) => distance(p, q) < 0.01) === i,
    );
  }
  clear(
    a: Position,
    b: Position,
    radius: number,
    extra: readonly NavigationObstacle[] = [],
  ): boolean {
    if (![a.x, a.z, b.x, b.z, radius].every(Number.isFinite) || radius <= 0)
      return false;
    // Exact floor-union coverage of a conservative swept bounding rectangle.
    const sweep = {
      minX: Math.min(a.x, b.x) - radius,
      maxX: Math.max(a.x, b.x) + radius,
      minZ: Math.min(a.z, b.z) - radius,
      maxZ: Math.max(a.z, b.z) + radius,
    };
    if (
      !floors.some((floor) => containsRectangle(floor, sweep)) &&
      !coveredByRectangles(sweep, floors)
    )
      return false;
    return (
      !this.obstacles.some((o) => segmentHits(a, b, o, radius)) &&
      !extra.some((o) => segmentHits(a, b, o, radius))
    );
  }
  private graph(radius: number) {
    let graph = this.graphs.get(radius);
    if (!graph) {
      graph = this.nodes.map((a, i) =>
        this.nodes.flatMap((b, j) =>
          i !== j && distance(a, b) < 12 && this.clear(a, b, radius) ? [j] : [],
        ),
      );
      this.graphs.set(radius, graph);
    }
    return graph;
  }
  route(
    from: Position,
    to: Position,
    radius: number,
    occupied: readonly NavigationObstacle[] = [],
  ): readonly Position[] | null {
    if (
      !this.clear(from, from, radius) ||
      !this.clear(to, to, radius, occupied)
    )
      return null;
    if (this.clear(from, to, radius, occupied)) return [to];
    const nodes = [...this.nodes, from, to],
      start = nodes.length - 2,
      end = nodes.length - 1;
    const graph = this.graph(radius);
    const startLinks = this.links(from, radius),
      endLinks = new Set(this.links(to, radius));
    const costs = nodes.map(() => Infinity),
      previous = nodes.map(() => -1),
      done = new Set<number>();
    costs[start] = 0;
    while (done.size < nodes.length) {
      let i = -1;
      for (let j = 0; j < nodes.length; j++)
        if (!done.has(j) && (i < 0 || costs[j] < costs[i])) i = j;
      if (i < 0 || !Number.isFinite(costs[i])) return null;
      if (i === end) {
        const path: Position[] = [];
        for (let j = end; j !== start; j = previous[j]) path.unshift(nodes[j]);
        return path;
      }
      done.add(i);
      const neighbors =
        i === start
          ? startLinks
          : [...(graph[i] ?? []), ...(endLinks.has(i) ? [end] : [])];
      for (const j of neighbors) {
        if (done.has(j)) continue;
        const clear = !occupied.some((o) =>
          segmentHits(nodes[i], nodes[j], o, radius),
        );
        if (!clear) continue;
        const cost = costs[i] + distance(nodes[i], nodes[j]);
        if (cost < costs[j]) {
          costs[j] = cost;
          previous[j] = i;
        }
      }
    }
    return null;
  }
}
