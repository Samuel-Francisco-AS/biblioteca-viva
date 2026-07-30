import type { ComponentType } from "react";

import {
  ArchivePage,
  CollectionPage,
  LibraryPage,
  SettingsPage,
} from "./pages";

interface AppRoute {
  Component?: ComponentType;
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
    Component: CollectionPage,
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
    Component: ArchivePage,
    navigationLabel: "Arquivo",
    path: "/arquivo",
    title: "Arquivo",
  },
  {
    Component: SettingsPage,
    navigationLabel: "Ajustes",
    path: "/configuracoes",
    title: "Configurações",
  },
];
