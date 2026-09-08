export type AppRouteId =
  | "library"
  | "collection"
  | "new-entry"
  | "archive"
  | "statistics"
  | "settings";

export type PrimaryNavigationIcon =
  "library" | "collection" | "archive" | "statistics" | "settings";

interface PrimaryNavigationDefinition {
  readonly accessibleLabel: string;
  readonly icon: PrimaryNavigationIcon;
  readonly label: string;
}

export interface AppRoute {
  readonly description: string;
  readonly id: AppRouteId;
  readonly path: string;
  readonly primaryNavigation?: PrimaryNavigationDefinition;
  readonly title: string;
}

export const APP_ROUTE_PATHS = {
  archive: "/arquivo",
  collection: "/colecao",
  entryDetail: "/registros/:id",
  entryEdit: "/registros/:id/editar",
  library: "/",
  legacyBookDetail: "/livros/:id",
  legacyBookEdit: "/livros/:id/editar",
  legacyNewBook: "/novo-livro",
  newEntry: "/novo-registro",
  settings: "/configuracoes",
  statistics: "/estatisticas",
} as const;

export const appRoutes: readonly AppRoute[] = [
  {
    description: "Experiência visual da Biblioteca em reformulação",
    id: "library",
    path: APP_ROUTE_PATHS.library,
    primaryNavigation: {
      accessibleLabel: "Biblioteca",
      icon: "library",
      label: "Biblioteca",
    },
    title: "Biblioteca",
  },
  {
    description: "Tudo o que você registra",
    id: "collection",
    path: APP_ROUTE_PATHS.collection,
    primaryNavigation: {
      accessibleLabel: "Coleção",
      icon: "collection",
      label: "Coleção",
    },
    title: "Coleção",
  },
  {
    description: "Registrar leitura, mídia, estudo, prática ou trabalho",
    id: "new-entry",
    path: APP_ROUTE_PATHS.newEntry,
    title: "Novo registro",
  },
  {
    description: "Notas e citações reunidas",
    id: "archive",
    path: APP_ROUTE_PATHS.archive,
    primaryNavigation: {
      accessibleLabel: "Arquivo",
      icon: "archive",
      label: "Arquivo",
    },
    title: "Arquivo",
  },
  {
    description: "Histórico, sessões e resumos derivados",
    id: "statistics",
    path: APP_ROUTE_PATHS.statistics,
    primaryNavigation: {
      accessibleLabel: "Resumo e estatísticas",
      icon: "statistics",
      label: "Resumo",
    },
    title: "Estatísticas",
  },
  {
    description: "Experiência, áudio e dados",
    id: "settings",
    path: APP_ROUTE_PATHS.settings,
    primaryNavigation: {
      accessibleLabel: "Ajustes",
      icon: "settings",
      label: "Ajustes",
    },
    title: "Ajustes",
  },
];

export const primaryAppRoutes = appRoutes.filter(
  (
    route,
  ): route is AppRoute & {
    readonly primaryNavigation: PrimaryNavigationDefinition;
  } => route.primaryNavigation !== undefined,
);

export function appRouteForPath(pathname: string): AppRoute | undefined {
  const exact = appRoutes.find((route) => route.path === pathname);
  if (exact) return exact;
  if (
    pathname.startsWith("/registros/") ||
    pathname.startsWith("/livros/") ||
    pathname === APP_ROUTE_PATHS.legacyNewBook
  )
    return appRoutes.find(({ id }) => id === "collection");
  return undefined;
}

export function primaryRouteIdForPath(
  pathname: string,
): AppRouteId | undefined {
  return appRouteForPath(pathname)?.id === "new-entry"
    ? "collection"
    : appRouteForPath(pathname)?.id;
}
