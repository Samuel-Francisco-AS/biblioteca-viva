import { StudyDetailPage } from "./StudyDetailPage";
import type { FlashCardApplication } from "./StudyFlashCards";
import { EntryPortrait } from "./EntryPortrait";
import { RecordMemories } from "./RecordMemories";
import { ExerciseList } from "./ExerciseList";
import { entryExperience } from "./entryExperience";
import { ArtifactGlyph } from "../../app/ArtifactGlyph";
import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { EntryStatus, LibraryEntry, Note, Quote } from "../../domain";
import { statusLabels } from "../books/bookPresentation";
import { safeReturnPath } from "../books/navigationOrigin";
import { entryTypeLabels } from "../collection/collectionControls";
import { presentApplicationError } from "../entry-editor/errorMessages";
import { BookDetailPage, type BookDetailApplication } from "./BookDetailPage";
import {
  SessionPanel,
  type SessionApplication,
} from "../sessions/SessionPanel";
import {
  OrganizationPanel,
  type OrganizationApplication,
} from "../tags/OrganizationPanel";

export interface EntryDetailApplication extends BookDetailApplication {
  readonly commands: BookDetailApplication["commands"] &
    FlashCardApplication["commands"] & {
      readonly changeLibraryEntryStatus: {
        execute(input: unknown): Promise<LibraryEntry>;
      };
      readonly deleteLibraryEntry: {
        execute(input: unknown): Promise<{ readonly deleted: true }>;
      };
      readonly updateLibraryEntryProgress: {
        execute(input: unknown): Promise<LibraryEntry>;
      };
      readonly completeSession: SessionApplication["commands"]["completeSession"];
      readonly createManualSession: SessionApplication["commands"]["createManualSession"];
      readonly createTag: OrganizationApplication["commands"]["createTag"];
      readonly deleteTag: OrganizationApplication["commands"]["deleteTag"];
      readonly deleteSession: SessionApplication["commands"]["deleteSession"];
      readonly editSession: SessionApplication["commands"]["editSession"];
      readonly organizeLibraryEntry: OrganizationApplication["commands"]["organizeLibraryEntry"];
      readonly renameTag: OrganizationApplication["commands"]["renameTag"];
      readonly pauseSession: SessionApplication["commands"]["pauseSession"];
      readonly resumeSession: SessionApplication["commands"]["resumeSession"];
      readonly startSession: SessionApplication["commands"]["startSession"];
    };
  readonly queries: BookDetailApplication["queries"] & {
    readonly getLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
    readonly listNotesByEntry: {
      execute(input: unknown): Promise<readonly Note[]>;
    };
    readonly listQuotesByEntry: {
      execute(input: unknown): Promise<readonly Quote[]>;
    };
    readonly getOpenSession: SessionApplication["queries"]["getOpenSession"];
    readonly listSessionsByEntry: SessionApplication["queries"]["listSessionsByEntry"];
    readonly listTags: OrganizationApplication["queries"]["listTags"];
  };
}

export function EntryDetailPage({
  application,
}: {
  readonly application?: EntryDetailApplication;
}) {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get("from"));
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LibraryEntry>();
  const [notes, setNotes] = useState<readonly Note[]>([]);
  const [quotes, setQuotes] = useState<readonly Quote[]>([]);
  const [error, setError] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!application) return;
    let active = true;
    void Promise.all([
      application.queries.getLibraryEntry.execute({ id }),
      application.queries.listNotesByEntry.execute({ id }),
      application.queries.listQuotesByEntry.execute({ id }),
    ]).then(
      ([loadedEntry, loadedNotes, loadedQuotes]) => {
        if (active) {
          setEntry(loadedEntry);
          setNotes(loadedNotes);
          setQuotes(loadedQuotes);
        }
      },
      (failure: unknown) =>
        active && setError(presentApplicationError(failure).message),
    );
    return () => {
      active = false;
    };
  }, [application, id]);

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Registro indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (error && !entry)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o registro</h2>
        <p>{error}</p>
        <Link className="text-link" to={returnPath}>
          {returnPath.startsWith("/arquivo")
            ? "Voltar ao Arquivo"
            : returnPath.startsWith("/colecao")
              ? "Voltar à Coleção"
              : "Voltar à Biblioteca"}
        </Link>
      </section>
    );
  if (!entry) return <p role="status">Carregando registro…</p>;
  if (entry.type === "book")
    return (
      <BookDetailPage
        application={application}
        refreshKey={refreshKey}
        secondary={(book, onUpdated) => (
          <>
            <details className="folio-secondary-flow">
              <summary>Organização e favoritos</summary>
              <OrganizationPanel
                application={application}
                entry={book}
                onChange={(updated) => {
                  if (updated.type === "book") onUpdated(updated);
                }}
              />
            </details>
            <details className="folio-secondary-flow">
              <summary>Sessões de leitura</summary>
              <SessionPanel
                application={application}
                entry={book}
                onChanged={() => setRefreshKey((value) => value + 1)}
              />
            </details>
          </>
        )}
      />
    );
  if (entry.type === "study")
    return (
      <StudyDetailPage
        key={id}
        application={application}
        entry={entry}
        notes={notes}
        quotes={quotes}
        returnPath={returnPath}
        onChange={setEntry}
      />
    );
  const availableApplication = application;
  const currentEntry = entry;

  async function changeStatus(status: EntryStatus) {
    setBusy(true);
    setError(undefined);
    try {
      if (status === "completed" && currentEntry.status === "planned") {
        const started =
          await availableApplication.commands.changeLibraryEntryStatus.execute({
            id,
            status: "in_progress",
          });
        setEntry(started);
      }
      setEntry(
        await availableApplication.commands.changeLibraryEntryStatus.execute({
          id,
          status,
        }),
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  async function updateProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const raw = form.get("progress");
    const value = typeof raw === "string" ? Number(raw) : Number.NaN;
    try {
      if (currentEntry.type !== "series") return;
      const input = {
        id,
        type: "series",
        episodesWatched: value,
        currentSeason: form.get("season")
          ? Number(form.get("season"))
          : undefined,
        currentEpisode: form.get("episode")
          ? Number(form.get("episode"))
          : undefined,
      };
      setEntry(
        await availableApplication.commands.updateLibraryEntryProgress.execute(
          input,
        ),
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry() {
    if (!window.confirm("Excluir este registro e suas anotações?")) return;
    setBusy(true);
    try {
      await availableApplication.commands.deleteLibraryEntry.execute({ id });
      void navigate("/colecao");
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      setBusy(false);
    }
  }

  return (
    <section className="entry-detail-page" aria-labelledby="entry-title">
      <Link className="text-link entry-detail-return" to={returnPath}>
        {returnPath.startsWith("/arquivo")
          ? "Voltar ao Arquivo"
          : returnPath.startsWith("/colecao")
            ? "Voltar à Coleção"
            : "Voltar à Biblioteca"}
      </Link>
      <div className="section-heading entry-detail-hero">
        <span aria-hidden="true" className="entry-detail-hero__emblem">
          <ArtifactGlyph type={currentEntry.type} />
        </span>
        <div className="entry-detail-hero__body">
          <p className="eyebrow">{entryTypeLabels[currentEntry.type]}</p>
          <h2 id="entry-title">{currentEntry.title}</h2>
          <p className="status-badge">{statusLabels[currentEntry.status]}</p>
        </div>
        <Link
          className="button button--secondary entry-detail-hero__edit"
          to={`/registros/${encodeURIComponent(id)}/editar?from=${encodeURIComponent(returnPath)}`}
        >
          Editar
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="entry-detail-sections">
        <section className="content-card" aria-labelledby="entry-data-title">
          <p className="eyebrow">{entryTypeLabels[currentEntry.type]}</p>
          <h3 id="entry-data-title">
            {entryExperience[currentEntry.type].chapter}
          </h3>
          <EntryPortrait entry={currentEntry} />
          {currentEntry.type === "series" &&
            currentEntry.totalEpisodes !== undefined && (
              <progress
                className="journey-meter"
                aria-label="Progresso da série"
                max={currentEntry.totalEpisodes}
                value={currentEntry.episodesWatched}
              />
            )}
          {currentEntry.completedAt && (
            <p className="completion-memory">
              Concluído em{" "}
              {new Date(currentEntry.completedAt).toLocaleDateString("pt-BR")}
            </p>
          )}
          {currentEntry.type === "work" && currentEntry.deadline && (
            <p>
              Prazo ·{" "}
              {new Date(currentEntry.deadline).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </p>
          )}
          {currentEntry.type === "physical_activity" &&
            currentEntry.exercises && (
              <ExerciseList exercises={currentEntry.exercises} />
            )}
          {currentEntry.type === "physical_activity" && (
            <p className="field-help">
              Repita esta prática em dias diferentes. As execuções ficam no seu
              histórico; concluir o registro encerra a prática.
            </p>
          )}
          <div className="form-actions">
            {currentEntry.status === "planned" && (
              <button
                disabled={busy}
                type="button"
                className="button button--primary"
                onClick={() => void changeStatus("in_progress")}
              >
                Iniciar
              </button>
            )}
            {(currentEntry.status === "completed" ||
              currentEntry.status === "abandoned" ||
              currentEntry.status === "paused") && (
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => void changeStatus("in_progress")}
              >
                Retomar registro
              </button>
            )}
            {currentEntry.status === "in_progress" && (
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => void changeStatus("paused")}
              >
                Pausar registro
              </button>
            )}
            {currentEntry.status !== "completed" &&
              currentEntry.status !== "abandoned" && (
                <button
                  disabled={busy}
                  type="button"
                  className="button button--secondary"
                  onClick={() => void changeStatus("completed")}
                >
                  Concluir
                </button>
              )}
          </div>
        </section>
        {currentEntry.type === "series" && (
          <form
            className="content-card"
            onSubmit={(event) => void updateProgress(event)}
          >
            <p className="eyebrow">Seu marcador</p>
            <h3>Retomar a história</h3>
            <div className="ritual-pair">
              <label className="form-field">
                Temporada atual
                <input
                  name="season"
                  type="number"
                  min="1"
                  defaultValue={currentEntry.currentSeason}
                />
              </label>
              <label className="form-field">
                Episódio em que parou
                <input
                  name="episode"
                  type="number"
                  min="1"
                  defaultValue={currentEntry.currentEpisode}
                />
              </label>
            </div>
            <div className="form-field">
              <label htmlFor="entry-progress">Episódios assistidos</label>
              <input
                id="entry-progress"
                name="progress"
                type="number"
                min="0"
                step="1"
                max={currentEntry.totalEpisodes}
                defaultValue={currentEntry.episodesWatched}
                required
              />
            </div>
            <button
              className="button button--primary"
              disabled={busy}
              type="submit"
            >
              Salvar progresso
            </button>
          </form>
        )}
        <SessionPanel
          application={availableApplication}
          entry={currentEntry}
          onChanged={() => {
            void availableApplication.queries.getLibraryEntry
              .execute({ id })
              .then(setEntry, (failure: unknown) =>
                setError(presentApplicationError(failure).message),
              );
          }}
        />
        <RecordMemories
          key={id}
          application={availableApplication}
          entry={currentEntry}
          initialNotes={notes}
          initialQuotes={quotes}
        />
        <OrganizationPanel
          application={availableApplication}
          entry={currentEntry}
          onChange={setEntry}
        />
        <details className="record-care">
          <summary>Cuidar deste registro</summary>
          <p>
            Excluir remove também notas, citações e sessões vinculadas. Esta
            ação pede confirmação.
          </p>
          <button
            className="button button--danger"
            type="button"
            disabled={busy}
            onClick={() => void removeEntry()}
          >
            Excluir registro
          </button>
        </details>
      </div>
    </section>
  );
}
