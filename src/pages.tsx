import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import type { LibraryEntry } from "./domain";
import { presentApplicationError } from "./features/entry-editor/errorMessages";
import { entryTypeLabels } from "./features/collection/collectionControls";
import { WorldHost, type WorldHostStatus } from "./features/library/WorldHost";
import {
  projectLibraryWorldEntries,
  type LibraryWorldCategory,
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

const categoryHeadings: Record<LibraryWorldCategory["type"], string> = {
  book: "Livros da área de leitura",
  movie: "Filmes",
  series: "Séries",
  study: "Estudos",
  physical_activity: "Atividades físicas",
  work: "Trabalhos",
};

const selectionDescriptions: Record<LibraryWorldCategory["type"], string> = {
  book: "Livro selecionado",
  movie: "Filme selecionado",
  series: "Série selecionada",
  study: "Estudo selecionado",
  physical_activity: "Atividade física selecionada",
  work: "Trabalho selecionado",
};

function findSelectedEntry(
  snapshot: LibraryWorldSnapshot | undefined,
  selection: WorldSelection,
) {
  if (!snapshot || !selection?.entryId) return undefined;
  for (const category of snapshot.categories) {
    const entry = category.entries.find(
      (item) =>
        item.entryId === selection.entryId && item.instanceId === selection.id,
    );
    if (entry) return { ...entry, type: category.type };
  }
  return undefined;
}

const applicationMountIds = new WeakMap<LibraryApplication, number>();
let nextApplicationMountId = 0;

export function LibraryPage({
  application,
}: {
  readonly application?: LibraryApplication;
}) {
  if (!application) return <LibraryPageContent key="unavailable" />;
  let mountId = applicationMountIds.get(application);
  if (mountId === undefined) {
    mountId = ++nextApplicationMountId;
    applicationMountIds.set(application, mountId);
  }
  return <LibraryPageContent application={application} key={mountId} />;
}

function LibraryPageContent({
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
    if (application)
      setSelectableObjectsState({
        application,
        value: objects,
      });
  }

  function handleWorldStatus(status: WorldHostStatus): void {
    if (application)
      setWorldStatusState({
        application,
        value: status,
      });
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
  const representedIds = new Set(selectableObjects.map(({ id }) => id));
  const representedBooks = readingAreaBooks?.filter(({ instanceId }) =>
    representedIds.has(instanceId),
  );
  const selectedEntry =
    worldStatus === "ready" &&
    selection?.entryId &&
    selectableObjects.some(
      ({ id, entryId }) => id === selection.id && entryId === selection.entryId,
    )
      ? findSelectedEntry(libraryWorldSnapshot, selection)
      : undefined;
  const totalEntries = libraryWorldSnapshot?.categories.reduce(
    (total, category) => total + category.entries.length,
    0,
  );

  return (
    <section className="library-page" aria-labelledby="library-title">
      <p className="eyebrow">Biblioteca</p>
      <h2 id="library-title">Registros da Biblioteca</h2>
      <p>
        Seus registros podem ser abertos pela lista, com ou sem ambiente 3D.
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
          <h3>Não foi possível preparar a Biblioteca</h3>
          <p>{error}</p>
        </section>
      ) : !readingAreaBooks ? (
        <p className="world-status" role="status">
          Carregando Biblioteca…
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
          {worldStatus === "ready" && readingAreaBooks.length > 0 && (
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
          {selectedEntry && (
            <section className="reading-area-selection" aria-live="polite">
              <p>
                {selectionDescriptions[selectedEntry.type]}:{" "}
                {selectedEntry.title}.
              </p>
              <Link
                className="button button--secondary"
                to={{
                  pathname: entryPath(selectedEntry.entryId),
                  search: `?from=${encodeURIComponent(returnPath)}`,
                }}
              >
                Abrir registro
              </Link>
            </section>
          )}
          {totalEntries === 0 && (
            <section className="content-card reading-area-empty">
              <h3>Ainda não há registros na Biblioteca</h3>
              <p>Crie um registro para começar.</p>
            </section>
          )}
          {libraryWorldSnapshot.categories.map((category) => (
            <section className="reading-area-books" key={category.type}>
              <h3>{categoryHeadings[category.type]}</h3>
              {category.entries.length === 0 ? (
                <p>Nenhum registro nesta categoria.</p>
              ) : (
                <ul>
                  {category.entries.map((entry) => {
                    const represented =
                      worldStatus === "ready" &&
                      representedIds.has(entry.instanceId);
                    const overflow = worldStatus === "ready" && !represented;
                    return (
                      <li key={entry.instanceId}>
                        <div>
                          <p>{entryTypeLabels[category.type]}</p>
                          <Link
                            to={{
                              pathname: entryPath(entry.entryId),
                              search: `?from=${encodeURIComponent(returnPath)}`,
                            }}
                          >
                            {entry.title}
                          </Link>
                          {category.type === "book" && (
                            <p>
                              {"author" in entry
                                ? (entry.author ?? "Autor não informado")
                                : "Autor não informado"}
                            </p>
                          )}
                          {represented && (
                            <p>
                              {category.type === "book"
                                ? "Nas estantes visuais."
                                : "Representado no ambiente."}
                            </p>
                          )}
                          {overflow && <p>Fora da capacidade visual atual.</p>}
                          {worldStatus === "failed" && (
                            <p>Representação visual indisponível.</p>
                          )}
                        </div>
                        {represented && (
                          <button
                            aria-pressed={
                              selectedEntry?.instanceId === entry.instanceId
                            }
                            aria-label={`Selecionar no ambiente: ${entryTypeLabels[category.type]} ${entry.title}`}
                            className="button button--secondary"
                            onClick={() =>
                              application &&
                              setRequestedSelectionState({
                                application,
                                value: entry.instanceId,
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
              )}
            </section>
          ))}
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
