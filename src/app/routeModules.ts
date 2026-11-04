/**
 * Modules stay split from the initial bundle. Native/dynamic imports are
 * cached by the browser once requested; warm-up is strictly opportunistic.
 */
export const routeModules = {
  collection: () => import("../features/collection/CollectionPage"),
  archive: () => import("../features/archive/ArchivePage"),
  statistics: () => import("../features/statistics/StatisticsPage"),
  settings: () => import("../features/settings/SettingsPage"),
  newEntry: () => import("../features/entry-editor/NewEntryPage"),
  editEntry: () => import("../features/entry-editor/EditEntryPage"),
  detail: () => import("../features/entry-detail/EntryDetailPage"),
};

export function preloadRoute(path: string): void {
  const pathname = path.split(/[?#]/, 1)[0];
  const load =
    pathname === "/colecao"
      ? routeModules.collection
      : pathname === "/arquivo"
        ? routeModules.archive
        : pathname === "/estatisticas"
          ? routeModules.statistics
          : pathname === "/configuracoes"
            ? routeModules.settings
            : pathname === "/novo-registro" || pathname === "/novo-livro"
              ? routeModules.newEntry
              : /^\/(registros|livros)\/[^/]+\/editar$/.test(pathname)
                ? routeModules.editEntry
                : /^\/(registros|livros)\/[^/]+$/.test(pathname)
                  ? routeModules.detail
                  : undefined;
  if (load) void load().catch(() => undefined);
}

/** Warm only the most likely secondary route, after the first usable world. */
export function warmCollectionWhenIdle(): () => void {
  let cancelled = false;
  const warm = () => {
    if (!cancelled && document.visibilityState !== "hidden")
      preloadRoute("/colecao");
  };
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(warm);
    return () => {
      cancelled = true;
      window.cancelIdleCallback(id);
    };
  }
  const id = window.setTimeout(warm, 1200);
  return () => {
    cancelled = true;
    window.clearTimeout(id);
  };
}
