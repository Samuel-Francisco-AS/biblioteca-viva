/** Immersive F2 address; the legacy table retains its separate URL. */
const ARENA_ROUTE = /^\/arcanario\/duelos\/arena\/[^/]+\/?$/;

export function isArenaRoute(pathname: string): boolean {
  return ARENA_ROUTE.test(pathname);
}

export function arenaRouteFor(sessionId: string): string {
  return `/arcanario/duelos/arena/${encodeURIComponent(sessionId)}`;
}

export function legacyDuelRouteFor(sessionId: string): string {
  return `/arcanario/duelos/partida/${encodeURIComponent(sessionId)}`;
}
