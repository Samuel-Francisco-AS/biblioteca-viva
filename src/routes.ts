import type { ComponentType } from "react";

import { LibraryPage, type LibraryPageApplication } from "./pages";

interface AppRoute {
  Component?: ComponentType<{ readonly application?: LibraryPageApplication }>;
  description: string;
  navigationLabel: string;
  path: string;
  title: string;
}

export const appRoutes: readonly AppRoute[] = [
  {
    Component: LibraryPage,
    description: "Sua sala e o resumo das leituras",
    navigationLabel: "Biblioteca",
    path: "/",
    title: "Biblioteca",
  },
  {
    description: "Seus livros e leituras",
    navigationLabel: "Coleção",
    path: "/colecao",
    title: "Coleção",
  },
  {
    description: "Adicionar uma obra à coleção",
    navigationLabel: "Novo",
    path: "/novo-livro",
    title: "Novo livro",
  },
  {
    description: "Notas e citações reunidas",
    navigationLabel: "Arquivo",
    path: "/arquivo",
    title: "Arquivo",
  },
  {
    description: "Experiência, áudio e dados",
    navigationLabel: "Ajustes",
    path: "/configuracoes",
    title: "Configurações",
  },
];
