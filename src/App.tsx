import { useEffect, useRef } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { appRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
import type { ApplicationDiagnostics } from "./app/createApplication";
import type { ApplicationRuntime } from "./app/createApplication";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";
import { CollectionPage } from "./features/collection/CollectionPage";
import { BookDetailPage } from "./features/entry-detail/BookDetailPage";
import {
  EditBookPage,
  NewBookPage,
} from "./features/entry-editor/EntryEditorPages";
import "./styles.css";

function NotFoundPage() {
  return (
    <section className="placeholder" aria-labelledby="not-found-title">
      <p className="placeholder__status">Caminho desconhecido</p>
      <h2 id="not-found-title">Esta página não existe</h2>
      <p>O endereço informado não corresponde a uma área da Biblioteca Viva.</p>
      <Link className="text-link" to="/">
        Voltar para a Biblioteca
      </Link>
    </section>
  );
}

interface AppProps {
  readonly application?: ApplicationRuntime;
  readonly diagnostics?: ApplicationDiagnostics;
}

const diagnosticsBuildEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";

export function App({ application, diagnostics }: AppProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const activeRoute = appRoutes.find(
    (route) => route.path === location.pathname,
  );
  const sectionTitle =
    activeRoute?.title ??
    (location.pathname.endsWith("/editar")
      ? "Editar livro"
      : location.pathname.startsWith("/livros/")
        ? "Detalhes do livro"
        : "Página não encontrada");

  useAndroidBackButton();

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo principal
      </a>

      <header className="top-bar">
        <p className="top-bar__brand">Biblioteca Viva</p>
        <h1>{sectionTitle}</h1>
      </header>

      <nav className="primary-navigation" aria-label="Navegação principal">
        <ul>
          {appRoutes.map((route) => (
            <li key={route.path}>
              <NavLink
                aria-label={route.title}
                className={({ isActive }) =>
                  `primary-navigation__link${isActive ? " primary-navigation__link--active" : ""}`
                }
                end={route.path === "/"}
                to={route.path}
              >
                <span aria-hidden="true">{route.navigationLabel}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main
        className="app-content"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        <Routes>
          {appRoutes
            .filter((route) => route.Component)
            .map((route) => (
              <Route
                element={route.Component ? <route.Component /> : undefined}
                key={route.path}
                path={route.path}
              />
            ))}
          <Route
            path="/colecao"
            element={<CollectionPage application={application} />}
          />
          <Route
            path="/novo-livro"
            element={<NewBookPage application={application} />}
          />
          <Route
            path="/livros/:id/editar"
            element={<EditBookPage application={application} />}
          />
          <Route
            path="/livros/:id"
            element={<BookDetailPage application={application} />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {diagnosticsBuildEnabled &&
          isDiagnosticsEnabled(
            import.meta.env.DEV,
            import.meta.env.VITE_ENABLE_DIAGNOSTICS,
          ) &&
          location.pathname === "/configuracoes" &&
          diagnostics && <DevelopmentDiagnostics diagnostics={diagnostics} />}
      </main>
    </div>
  );
}
