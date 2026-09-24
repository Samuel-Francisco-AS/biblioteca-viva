import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import type { LibraryEntry } from "./domain";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import { WorldHost, type WorldHostStatus } from "./features/library/WorldHost";
import {
  projectLibraryWorldEntries,
  type LibraryWorldSnapshot,
} from "./features/library/libraryWorldEntries";
import type {
  WorldSelectableObject,
  WorldSelection,
} from "./features/library/worldRuntime";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";

const diagnosticsBuildEnabled =
  import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
const PerformanceScenarioHarness = diagnosticsBuildEnabled
  ? lazy(async () => {
      const module =
        await import("./features/library/PerformanceScenarioHarness");
      return { default: module.PerformanceScenarioHarness };
    })
  : undefined;

export interface LibraryApplication {
  readonly queries: {
    readonly listLibraryEntries: {
      execute(): Promise<readonly LibraryEntry[]>;
    };
  };
}

interface LibraryPageSnapshot {
  readonly application: LibraryApplication;
  readonly world?: LibraryWorldSnapshot;
  readonly error?: string;
}

interface ApplicationBound<Value> {
  readonly application: LibraryApplication;
  readonly value: Value;
}

function entryPath(entryId: string): string {
  return `/registros/${encodeURIComponent(entryId)}`;
}

export function LibraryPage({
  application,
}: {
  readonly application?: LibraryApplication;
}) {
  const diagnosticsEnabled = isDiagnosticsEnabled(
    import.meta.env.DEV,
    import.meta.env.VITE_ENABLE_DIAGNOSTICS,
  );
  const diagnosticsActive = diagnosticsEnabled && PerformanceScenarioHarness;
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<LibraryPageSnapshot>();
  const [selectableObjectsState, setSelectableObjectsState] =
    useState<ApplicationBound<readonly WorldSelectableObject[]>>();
  const [selectionState, setSelectionState] =
    useState<ApplicationBound<WorldSelection>>();
  const [requestedSelectionState, setRequestedSelectionState] =
    useState<ApplicationBound<string | null>>();
  const [worldStatusState, setWorldStatusState] =
    useState<ApplicationBound<WorldHostStatus>>();

  // Do not let a previous application instance lend its data, error, catalog
  // or selected entry to the next one during the render before its effect runs.
  const currentSnapshot =
    snapshot?.application === application ? snapshot : undefined;
  const libraryWorldSnapshot = currentSnapshot?.world;
  const readingAreaBooks = libraryWorldSnapshot?.categories[0].entries;
  const error = currentSnapshot?.error;
  const selectableObjects =
    application && selectableObjectsState?.application === application
      ? selectableObjectsState.value
      : [];
  const selection =
    application && selectionState?.application === application
      ? selectionState.value
      : null;
  const requestedSelectionId =
    application && requestedSelectionState?.application === application
      ? requestedSelectionState.value
      : null;
  const worldStatus =
    application && worldStatusState?.application === application
      ? worldStatusState.value
      : "initializing";

  function handleWorldSelection(nextSelection: WorldSelection): void {
    if (!application) return;
    setSelectionState({ application, value: nextSelection });
    setRequestedSelectionState({
      application,
      value: nextSelection?.id ?? null,
    });
  }

  function handleSelectableObjects(
    objects: readonly WorldSelectableObject[],
  ): void {
    if (application) setSelectableObjectsState({ application, value: objects });
  }

  function handleWorldStatus(status: WorldHostStatus): void {
    if (application) setWorldStatusState({ application, value: status });
  }

  useEffect(() => {
    if (!application || diagnosticsActive) return;
    let active = true;
    const loadSnapshot = async (): Promise<void> => {
      try {
        const entries = await application.queries.listLibraryEntries.execute();
        if (!active) return;
        setSnapshot({
          application,
          world: projectLibraryWorldEntries(entries),
        });
      } catch (failure: unknown) {
        if (!active) return;
        setSnapshot({
          application,
          error: presentApplicationError(failure).message,
        });
      }
    };
    void loadSnapshot();
    return () => {
      active = false;
    };
  }, [application, diagnosticsActive]);

  const returnPath = `${location.pathname}${location.search}`;
  const representedBookIds = new Set(selectableObjects.map(({ id }) => id));
  const representedBooks = readingAreaBooks?.filter(({ instanceId }) =>
    representedBookIds.has(instanceId),
  );
  const selectedBook = selection?.entryId
    ? readingAreaBooks?.find(({ entryId }) => entryId === selection.entryId)
    : undefined;

  return (
    <section className="library-page" aria-labelledby="library-title">
      <p className="eyebrow">Biblioteca</p>
      <h2 id="library-title">Área de leitura</h2>
      <p>
        Seus livros aparecem nas estantes e continuam acessíveis pela lista
        abaixo.
      </p>
      {diagnosticsActive ? (
        <Suspense
          fallback={
            <p className="world-status">Preparando cenário experimental…</p>
          }
        >
          <PerformanceScenarioHarness />
        </Suspense>
      ) : !application ? (
        <section className="content-card" role="alert">
          <h3>Biblioteca indisponível</h3>
          <p>Não foi possível iniciar o armazenamento local.</p>
        </section>
      ) : error ? (
        <section className="content-card" role="alert">
          <h3>Não foi possível preparar a área de leitura</h3>
          <p>{error}</p>
        </section>
      ) : !readingAreaBooks ? (
        <p className="world-status" role="status">
          Carregando área de leitura…
        </p>
      ) : (
        <>
          <WorldHost
            libraryWorldSnapshot={libraryWorldSnapshot}
            onSelectableObjectsChange={handleSelectableObjects}
            onSelectionChange={handleWorldSelection}
            onStatusChange={handleWorldStatus}
            selectedObjectId={requestedSelectionId}
          />
          {worldStatus === "ready" && (
            <p className="reading-area-summary" aria-live="polite">
              {representedBooks?.length ?? 0}{" "}
              {(representedBooks?.length ?? 0) === 1
                ? "livro representado"
                : "livros representados"}
              {"; "}
              {readingAreaBooks.length - (representedBooks?.length ?? 0) === 1
                ? "1 livro fora da capacidade visual atual."
                : `${readingAreaBooks.length - (representedBooks?.length ?? 0)} livros fora da capacidade visual atual.`}
            </p>
          )}
          {readingAreaBooks && selection?.entryId && (
            <section className="reading-area-selection" aria-live="polite">
              <p>
                Livro selecionado: {selectedBook?.title ?? selection.label}.
              </p>
              <Link
                className="button button--secondary"
                to={{
                  pathname: entryPath(selection.entryId),
                  search: `?from=${encodeURIComponent(returnPath)}`,
                }}
              >
                Abrir registro
              </Link>
            </section>
          )}
          {readingAreaBooks.length === 0 ? (
            <section className="content-card reading-area-empty">
              <h3>Ainda não há livros na área de leitura</h3>
              <p>Crie um registro de livro para vê-lo nas estantes.</p>
              <Link className="button button--primary" to="/novo-registro">
                Criar livro
              </Link>
            </section>
          ) : (
            <section
              className="reading-area-books"
              aria-labelledby="reading-area-books-title"
            >
              <h3 id="reading-area-books-title">Livros da área de leitura</h3>
              <ul>
                {readingAreaBooks.map((book) => {
                  const represented =
                    worldStatus === "ready" &&
                    representedBookIds.has(book.instanceId);
                  const overflow = worldStatus === "ready" && !represented;
                  return (
                    <li key={book.instanceId}>
                      <div>
                        <Link
                          to={{
                            pathname: entryPath(book.entryId),
                            search: `?from=${encodeURIComponent(returnPath)}`,
                          }}
                        >
                          {book.title}
                        </Link>
                        <p>{book.author ?? "Autor não informado"}</p>
                        {represented && <p>Nas estantes visuais.</p>}
                        {overflow && <p>Fora da capacidade visual atual.</p>}
                        {worldStatus === "failed" && (
                          <p>Representação visual indisponível.</p>
                        )}
                      </div>
                      {represented && (
                        <button
                          aria-pressed={selection?.id === book.instanceId}
                          className="button button--secondary"
                          onClick={() =>
                            application &&
                            setRequestedSelectionState({
                              application,
                              value: book.instanceId,
                            })
                          }
                          type="button"
                        >
                          Selecionar no ambiente
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
      <div className="placeholder-actions">
        <Link className="button button--primary" to="/colecao">
          Abrir Coleção
        </Link>
        <Link className="button button--secondary" to="/novo-registro">
          Criar registro
        </Link>
      </div>
    </section>
  );
}
