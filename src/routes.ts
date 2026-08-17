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
    description: "Tudo o que você registra",
    navigationLabel: "Coleção",
    path: "/colecao",
    title: "Coleção",
  },
  {
    description: "Registrar leitura, mídia, estudo, prática ou trabalho",
    navigationLabel: "Novo registro",
    path: "/novo-registro",
    title: "Novo registro",
  },
  {
    description: "Notas e citações reunidas",
    navigationLabel: "Arquivo",
    path: "/arquivo",
    title: "Arquivo",
  },
  {
    description: "Histórico, sessões e resumos derivados",
    navigationLabel: "Estatísticas",
    path: "/estatisticas",
    title: "Estatísticas",
  },
  {
    description: "Experiência, áudio e dados",
    navigationLabel: "Ajustes",
    path: "/configuracoes",
    title: "Configurações",
  },
];
