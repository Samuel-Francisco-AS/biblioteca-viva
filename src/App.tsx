import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      mainRef.current?.focus();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

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
