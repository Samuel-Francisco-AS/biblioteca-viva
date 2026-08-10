import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { BookEntry, ReachedMilestone } from "./domain";
import type { AudioPort, DialoguePort, LocalizedDialogue } from "./application";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import { LibraryCharacterPanel } from "./features/library-visual/LibraryCharacterPanel";
import { LibraryVisualDiagnosticsPanel } from "./features/library-visual/LibraryVisualDiagnostics";
import { LibraryVisualHost } from "./features/library-visual/LibraryVisualHost";
import { LibraryProjectionService } from "./features/library-visual/LibraryProjectionService";
import { LibraryShelfPanel } from "./features/library-visual/LibraryShelfPanel";
import { LibraryTextAlternative } from "./features/library-visual/LibraryTextAlternative";
import type {
  LibraryInteraction,
  LibraryViewModel,
} from "./features/library-visual/contracts";
import { createLibraryVisualDiagnostics } from "./features/library-visual/diagnostics";

export interface LibraryPageApplication {
  readonly audio?: Pick<AudioPort, "emit">;
  readonly dialogue: Pick<DialoguePort, "enterLibrary" | "select">;
  readonly queries: {
    readonly listBookEntries: { execute(): Promise<readonly BookEntry[]> };
    readonly listMilestones: { list(): Promise<readonly ReachedMilestone[]> };
  };
}

type LibraryPageState =
  | { readonly kind: "loading" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "ready"; readonly viewModel: LibraryViewModel };

type OpenLibraryPanel =
  | { readonly kind: "shelf" }
  | { readonly dialogue: LocalizedDialogue; readonly kind: "character" }
  | null;

function projectionInput(
  books: readonly BookEntry[],
  milestones: readonly ReachedMilestone[],
  pendingDecorationUnlock?: { readonly eventId: string },
) {
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
    milestones,
    ...(pendingDecorationUnlock && { pendingDecorationUnlock }),
  };
}

export function LibraryPage({
  application,
  onDecorationUnlockPresented,
  pendingDecorationUnlock,
  reducedMotion = false,
}: {
  readonly application?: LibraryPageApplication;
  readonly onDecorationUnlockPresented?: (eventId: string) => void;
  readonly pendingDecorationUnlock?: { readonly eventId: string };
  readonly reducedMotion?: boolean;
}) {
  const diagnosticsEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
  const diagnostics = useMemo(
    () => (diagnosticsEnabled ? createLibraryVisualDiagnostics() : undefined),
    [diagnosticsEnabled],
  );
  const projectionService = useMemo(() => new LibraryProjectionService(), []);
  const navigate = useNavigate();
  const dialogueRequest = useRef(0);
  const shelfButtonRef = useRef<HTMLButtonElement>(null);
  const librarianButtonRef = useRef<HTMLButtonElement>(null);
  const creatureButtonRef = useRef<HTMLButtonElement>(null);
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
    void Promise.all([
      application.queries.listBookEntries.execute(),
      application.queries.listMilestones.list(),
    ]).then(
      ([books, milestones]) => {
        if (!active) return;
        setState({
          kind: "ready",
          viewModel: projectionService.project(
            projectionInput(books, milestones, pendingDecorationUnlock),
          ),
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
  }, [application, attempt, pendingDecorationUnlock, projectionService]);

  useEffect(() => {
    if (!application || state.kind !== "ready") return;
    void application.dialogue.enterLibrary({
      completedBooks: state.viewModel.completedBooks,
      inProgressBooks: state.viewModel.inProgressBooks,
      totalBooks: state.viewModel.totalBooks,
    });
  }, [application, state]);

  useEffect(
    () => () => {
      dialogueRequest.current += 1;
    },
    [],
  );

  async function openCharacterDialogue(
    event: "creature.interaction" | "librarian.interaction",
  ) {
    if (!application) return;
    const request = dialogueRequest.current + 1;
    dialogueRequest.current = request;
    const dialogue = await application.dialogue.select(event);
    if (request !== dialogueRequest.current) return;
    setOpenPanel({ dialogue, kind: "character" });
  }

  function handleInteraction(interaction: LibraryInteraction) {
    if (interaction.type === "DecorationUnlockPresented") {
      onDecorationUnlockPresented?.(interaction.eventId);
      return;
    }
    if (interaction.type === "ShelfSelected") {
      dialogueRequest.current += 1;
      application?.audio?.emit({ type: "ShelfSelected" });
      setOpenPanel({ kind: "shelf" });
    }
    if (interaction.type === "LibrarianSelected") {
      application?.audio?.emit({ type: "LibrarianSelected" });
      void openCharacterDialogue("librarian.interaction");
    }
    if (interaction.type === "CreatureSelected") {
      application?.audio?.emit({ type: "CreatureSelected" });
      void openCharacterDialogue("creature.interaction");
    }
  }

  function closePanel() {
    const panel = openPanel;
    setOpenPanel(null);
    requestAnimationFrame(() => {
      if (panel?.kind === "shelf") shelfButtonRef.current?.focus();
      if (panel?.kind === "character") {
        if (panel.dialogue.characterId === "character.librarian")
          librarianButtonRef.current?.focus();
        if (panel.dialogue.characterId === "character.creature")
          creatureButtonRef.current?.focus();
      }
    });
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
          <LibraryTextAlternative
            creatureButtonRef={creatureButtonRef}
            librarianButtonRef={librarianButtonRef}
            onInteraction={handleInteraction}
            shelfButtonRef={shelfButtonRef}
            viewModel={state.viewModel}
          />
          <LibraryVisualHost
            diagnostics={diagnostics}
            onInteraction={handleInteraction}
            projection={state.viewModel}
            reducedMotion={reducedMotion}
          />
          {openPanel?.kind === "shelf" && (
            <LibraryShelfPanel
              onClose={closePanel}
              onOpenCollection={() => void navigate("/colecao")}
              viewModel={state.viewModel}
            />
          )}
          {openPanel?.kind === "character" && (
            <LibraryCharacterPanel
              dialogue={openPanel.dialogue}
              onClose={closePanel}
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
