import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

import { appRoutes } from "./routes";
import { useAndroidBackButton } from "./useAndroidBackButton";
import { DevelopmentDiagnostics } from "./app/DevelopmentDiagnostics";
import type { ApplicationDiagnostics } from "./app/createApplication";
import type { ApplicationRuntime } from "./app/createApplication";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";
import { CollectionPage } from "./features/collection/CollectionPage";
import { ArchivePage } from "./features/archive/ArchivePage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { BookDetailPage } from "./features/entry-detail/BookDetailPage";
import {
  EditBookPage,
  NewBookPage,
} from "./features/entry-editor/EntryEditorPages";
import "./styles.css";
import { useAudioExperience } from "./useAudioExperience";
import { MILESTONE_ID, type MilestoneReached } from "./domain";
import { LibraryPage } from "./pages";
import { useExperiencePreferences } from "./useExperiencePreferences";

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

const unsafeContextGuidance =
  "Este ambiente não oferece todas as APIs necessárias para salvar e exportar com segurança. Abra a aplicação por localhost, HTTPS ou pelo APK Android. Os dados de outras origens do navegador não foram apagados.";

export function App({ application, diagnostics }: AppProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathRef = useRef(location.pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const restoreMenuFocusRef = useRef(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [milestoneReaction, setMilestoneReaction] = useState<{
    readonly dialogue?: string;
    readonly dialogueUnavailable?: boolean;
    readonly eventId: string;
  } | null>(null);
  const [pendingDecorationUnlock, setPendingDecorationUnlock] = useState<{
    readonly eventId: string;
  } | null>(null);
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
  useAudioExperience(application?.audio);
  const effectiveExperience = useExperiencePreferences(application?.experience);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!navigationOpen) {
      if (restoreMenuFocusRef.current) {
        restoreMenuFocusRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }
    const firstLink = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navigationOpen]);

  function closeNavigation({ restoreFocus = true } = {}) {
    restoreMenuFocusRef.current = restoreFocus;
    setNavigationOpen(false);
  }

  function handleDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeNavigation();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  useEffect(() => {
    if (!application) return;
    let active = true;
    const reactToFirstCompletion = async (event: MilestoneReached) => {
      setMilestoneReaction({ eventId: event.eventId });
      setPendingDecorationUnlock({ eventId: event.eventId });
      try {
        const books = await application.queries.listBookEntries.execute();
        if (!active) return;
        application.dialogue.updateLibraryFacts({
          completedBooks: books.filter(({ status }) => status === "completed")
            .length,
          inProgressBooks: books.filter(
            ({ status }) => status === "in_progress",
          ).length,
          totalBooks: books.length,
        });
        const dialogue = await application.dialogue.select(
          "book.first-completed",
        );
        if (active)
          setMilestoneReaction({
            dialogue: dialogue.text,
            eventId: event.eventId,
          });
      } catch {
        if (active)
          setMilestoneReaction({
            dialogueUnavailable: true,
            eventId: event.eventId,
          });
      }
    };
    const unsubscribe = application.events.subscribe(
      "MilestoneReached",
      (event) => {
        if (
          event.type === "MilestoneReached" &&
          event.payload.milestoneId === MILESTONE_ID.firstCompletedBook
        ) {
          void reactToFirstCompletion(event);
        }
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [application]);

  return (
    <div
      className="app-shell"
      data-high-contrast={effectiveExperience.highContrast}
      data-reduced-motion={effectiveExperience.reducedMotion}
      data-text-size={effectiveExperience.textSize}
    >
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo principal
      </a>

      <header className="top-bar">
        <button
          aria-controls="primary-navigation"
          aria-expanded={navigationOpen}
          aria-label="Abrir menu principal"
          className="menu-button"
          onClick={() => setNavigationOpen(true)}
          ref={menuButtonRef}
          type="button"
        >
          <span aria-hidden="true" className="menu-button__icon" />
        </button>
        <div>
          <p className="top-bar__brand">Biblioteca Viva</p>
          <h1>{sectionTitle}</h1>
        </div>
      </header>

      {navigationOpen && (
        <div className="navigation-layer">
          <button
            aria-label="Fechar menu principal"
            className="navigation-backdrop"
            onClick={() => closeNavigation()}
            tabIndex={-1}
            type="button"
          />
          <aside
            aria-label="Menu principal"
            aria-modal="true"
            className="primary-navigation"
            id="primary-navigation"
            onKeyDown={handleDrawerKeyDown}
            ref={drawerRef}
            role="dialog"
          >
            <div className="primary-navigation__heading">
              <div>
                <p className="eyebrow">Biblioteca Viva</p>
                <h2>Explorar</h2>
              </div>
              <button
                aria-label="Fechar menu principal"
                className="drawer-close"
                onClick={() => closeNavigation()}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label="Navegação principal">
              <ul>
                {appRoutes.map((route) => (
                  <li key={route.path}>
                    <NavLink
                      aria-label={route.title}
                      className={({ isActive }) =>
                        `primary-navigation__link${isActive ? " primary-navigation__link--active" : ""}`
                      }
                      end={route.path === "/"}
                      onClick={() => closeNavigation({ restoreFocus: false })}
                      to={route.path}
                    >
                      <strong>{route.navigationLabel}</strong>
                      <span>{route.description}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      <main
        className="app-content"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {application?.platform.supported === false && (
          <p className="context-guidance" role="alert">
            {unsafeContextGuidance}
          </p>
        )}
        {milestoneReaction && (
          <section
            aria-atomic="true"
            aria-live="polite"
            className="milestone-notification"
            role="status"
          >
            <p>
              Primeiro livro concluído. A luminária de leitura foi desbloqueada.
            </p>
            {milestoneReaction.dialogue && (
              <p lang="pt-BR">{milestoneReaction.dialogue}</p>
            )}
            {milestoneReaction.dialogueUnavailable && (
              <p>O diálogo contextual não pôde ser carregado agora.</p>
            )}
            <button
              className="button button--secondary"
              onClick={() => setMilestoneReaction(null)}
              type="button"
            >
              Fechar aviso
            </button>
          </section>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <LibraryPage
                application={application}
                onDecorationUnlockPresented={(eventId) => {
                  setPendingDecorationUnlock((pending) =>
                    pending?.eventId === eventId ? null : pending,
                  );
                }}
                pendingDecorationUnlock={pendingDecorationUnlock ?? undefined}
                reducedMotion={effectiveExperience.reducedMotion}
              />
            }
          />
          <Route
            path="/colecao"
            element={<CollectionPage application={application} />}
          />
          <Route
            path="/arquivo"
            element={<ArchivePage application={application} />}
          />
          <Route
            path="/configuracoes"
            element={
              <SettingsPage
                application={application}
                diagnostics={diagnostics}
              />
            }
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
