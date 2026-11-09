/** Reserved F2 address. F1 redirects it to the existing working 2D table. */
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
