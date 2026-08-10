import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { BookEntry } from "./domain";
import type { AudioPort } from "./application";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import {
  LibraryCharacterPanel,
  type LibraryCharacterPanelKind,
} from "./features/library-visual/LibraryCharacterPanel";
import { LibraryVisualDiagnosticsPanel } from "./features/library-visual/LibraryVisualDiagnostics";
import { LibraryVisualHost } from "./features/library-visual/LibraryVisualHost";
import { LibraryProjectionService } from "./features/library-visual/LibraryProjectionService";
import { LibraryShelfPanel } from "./features/library-visual/LibraryShelfPanel";
import type {
  LibraryInteraction,
  LibraryViewModel,
} from "./features/library-visual/contracts";
import { createLibraryVisualDiagnostics } from "./features/library-visual/diagnostics";

export interface LibraryPageApplication {
  readonly audio?: Pick<AudioPort, "emit">;
  readonly queries: {
    readonly listBookEntries: { execute(): Promise<readonly BookEntry[]> };
  };
}

type LibraryPageState =
  | { readonly kind: "loading" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "ready"; readonly viewModel: LibraryViewModel };

type OpenLibraryPanel = LibraryCharacterPanelKind | "shelf" | null;

function projectionInput(books: readonly BookEntry[]) {
  return {
    books: books.map(
      ({ currentPage, id, status, title, totalPages, updatedAt }) => ({
        currentPage,
        id,
        status,
        title,
        totalPages,
        updatedAt,
      }),
    ),
  };
}

export function LibraryPage({
  application,
}: {
  readonly application?: LibraryPageApplication;
}) {
  const diagnosticsEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
  const diagnostics = useMemo(
    () => (diagnosticsEnabled ? createLibraryVisualDiagnostics() : undefined),
    [diagnosticsEnabled],
  );
  const projectionService = useMemo(() => new LibraryProjectionService(), []);
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [openPanel, setOpenPanel] = useState<OpenLibraryPanel>(null);
  const [state, setState] = useState<LibraryPageState>(() =>
    application
      ? { kind: "loading" }
      : {
          kind: "error",
          message: "Não foi possível iniciar o armazenamento local.",
        },
  );

  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.listBookEntries.execute().then(
      (books) => {
        if (!active) return;
        setState({
          kind: "ready",
          viewModel: projectionService.project(projectionInput(books)),
        });
      },
      (failure: unknown) => {
        if (!active) return;
        setState({
          kind: "error",
          message: presentApplicationError(failure).message,
        });
      },
    );
    return () => {
      active = false;
    };
  }, [application, attempt, projectionService]);

  function handleInteraction(interaction: LibraryInteraction) {
    if (interaction.type === "ShelfSelected") {
      application?.audio?.emit({ type: "ShelfSelected" });
      setOpenPanel("shelf");
    }
    if (interaction.type === "LibrarianSelected") {
      application?.audio?.emit({ type: "LibrarianSelected" });
      setOpenPanel("librarian");
    }
    if (interaction.type === "CreatureSelected") {
      application?.audio?.emit({ type: "CreatureSelected" });
      setOpenPanel("creature");
    }
  }

  return (
    <section className="library-page" aria-labelledby="library-visual-title">
      <div className="library-page__introduction">
        <p className="placeholder__status">Sala reativa</p>
        <h2 id="library-visual-title">Sua Biblioteca Viva</h2>
        <p>
          A visualização resume sua coleção. Seus livros, anotações e leituras
          continuam acessíveis na área convencional.
        </p>
        <Link className="text-link" to="/colecao">
          Abrir Coleção
        </Link>
      </div>
      {state.kind === "loading" && (
        <p role="status">Carregando visualização da Biblioteca…</p>
      )}
      {state.kind === "error" && (
        <section className="library-visual-fallback" role="alert">
          <h3>Não foi possível preparar a visualização da biblioteca</h3>
          <p>{state.message}</p>
          {application && (
            <button
              className="button button--secondary"
              onClick={() => {
                setOpenPanel(null);
                setState({ kind: "loading" });
                setAttempt((current) => current + 1);
              }}
              type="button"
            >
              Tentar novamente
            </button>
          )}
        </section>
      )}
      {state.kind === "ready" && (
        <>
          <LibraryVisualHost
            diagnostics={diagnostics}
            onInteraction={handleInteraction}
            projection={state.viewModel}
          />
          {openPanel === "shelf" && (
            <LibraryShelfPanel
              onClose={() => setOpenPanel(null)}
              onOpenCollection={() => void navigate("/colecao")}
              viewModel={state.viewModel}
            />
          )}
          {(openPanel === "librarian" || openPanel === "creature") && (
            <LibraryCharacterPanel
              kind={openPanel}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </>
      )}
      {diagnostics && (
        <LibraryVisualDiagnosticsPanel diagnostics={diagnostics} />
      )}
    </section>
  );
}
