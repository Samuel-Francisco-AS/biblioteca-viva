import type { ComponentType } from "react";

import { LibraryPage, type LibraryPageApplication } from "./pages";

interface AppRoute {
  Component?: ComponentType<{ readonly application?: LibraryPageApplication }>;
  navigationLabel: string;
  path: string;
  title: string;
}

export const appRoutes: readonly AppRoute[] = [
  {
    Component: LibraryPage,
    navigationLabel: "Biblioteca",
    path: "/",
    title: "Biblioteca",
  },
  {
    navigationLabel: "Coleção",
    path: "/colecao",
    title: "Coleção",
  },
  {
    navigationLabel: "Novo",
    path: "/novo-livro",
    title: "Novo livro",
  },
  {
    navigationLabel: "Arquivo",
    path: "/arquivo",
    title: "Arquivo",
  },
  {
    navigationLabel: "Ajustes",
    path: "/configuracoes",
    title: "Configurações",
  },
];
