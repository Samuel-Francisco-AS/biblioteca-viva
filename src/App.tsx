import { useEffect, useRef } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { appRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
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

export function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const activeRoute = appRoutes.find(
    (route) => route.path === location.pathname,
  );
  const sectionTitle = activeRoute?.title ?? "Página não encontrada";

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
          {appRoutes.map((route) => (
            <Route
              element={<route.Component />}
              key={route.path}
              path={route.path}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
