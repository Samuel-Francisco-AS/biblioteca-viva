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

interface EntryDetailApplication extends BookDetailApplication {
  readonly commands: BookDetailApplication["commands"] & {
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

function details(
  entry: Exclude<LibraryEntry, { readonly type: "book" }>,
): readonly string[] {
  switch (entry.type) {
    case "movie":
      return [
        entry.director,
        entry.year?.toString(),
        entry.durationMinutes === undefined
          ? undefined
          : `${entry.durationMinutes} min`,
        entry.platform,
      ].filter((value): value is string => value !== undefined);
    case "series":
      return [
        entry.platform,
        `${entry.episodesWatched}${entry.totalEpisodes === undefined ? " episódios" : ` de ${entry.totalEpisodes} episódios`}`,
        entry.currentSeason === undefined
          ? undefined
          : `Temporada ${entry.currentSeason}`,
        entry.currentEpisode === undefined
          ? undefined
          : `Episódio ${entry.currentEpisode}`,
      ].filter((value): value is string => value !== undefined);
    case "study":
      return [
        entry.area,
        entry.discipline,
        entry.objective,
        `${entry.progressCurrent}${entry.progressTotal === undefined ? "" : ` de ${entry.progressTotal}`} · ${entry.progressUnit}`,
      ].filter((value): value is string => value !== undefined);
    case "physical_activity":
      return [entry.category, entry.modality, entry.objective].filter(
        (value): value is string => value !== undefined,
      );
    case "work":
      return [
        entry.area,
        entry.organization,
        entry.description,
        entry.nextAction === undefined
          ? undefined
          : `Próxima ação: ${entry.nextAction}`,
      ].filter((value): value is string => value !== undefined);
  }
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
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o registro</h2>
        <p>{error}</p>
        <Link className="text-link" to={returnPath}>
          Voltar à Coleção
        </Link>
      </section>
    );
  if (!entry) return <p role="status">Carregando registro…</p>;
  if (entry.type === "book")
    return (
      <>
        <BookDetailPage application={application} />
        <OrganizationPanel
          application={application}
          entry={entry}
          onChange={setEntry}
        />
        <SessionPanel application={application} entry={entry} />
      </>
    );
  const availableApplication = application;
  const currentEntry = entry;

  async function changeStatus(status: EntryStatus) {
    setBusy(true);
    setError(undefined);
    try {
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
      const input =
        currentEntry.type === "series"
          ? { id, type: "series", episodesWatched: value }
          : {
              id,
              type: "study",
              progressCurrent:
                currentEntry.type === "study" &&
                currentEntry.progressUnit === "hours"
                  ? value * 60
                  : value,
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

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    const content = new FormData(event.currentTarget).get("note");
    try {
      const note = await availableApplication.commands.addNote.execute({
        entryId: id,
        content,
      });
      setNotes((current) => [...current, note]);
      event.currentTarget.reset();
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
    <section aria-labelledby="entry-title">
      <Link className="text-link" to={returnPath}>
        Voltar à Coleção
      </Link>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{entryTypeLabels[currentEntry.type]}</p>
          <h2 id="entry-title">{currentEntry.title}</h2>
          <p className="status-badge">{statusLabels[currentEntry.status]}</p>
        </div>
        <Link
          className="button button--secondary"
          to={`/registros/${encodeURIComponent(id)}/editar`}
        >
          Editar
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <section className="content-card" aria-labelledby="entry-data-title">
        <h3 id="entry-data-title">Detalhes</h3>
        <ul>
          {details(currentEntry).map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
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
          <button
            disabled={busy}
            type="button"
            className="button button--danger"
            onClick={() => void removeEntry()}
          >
            Excluir registro
          </button>
        </div>
      </section>
      {(currentEntry.type === "series" || currentEntry.type === "study") && (
        <form
          className="content-card"
          onSubmit={(event) => void updateProgress(event)}
        >
          <h3>Atualizar progresso</h3>
          <div className="form-field">
            <label htmlFor="entry-progress">
              {currentEntry.type === "series"
                ? "Episódios assistidos"
                : currentEntry.progressUnit === "hours"
                  ? "Horas estudadas"
                  : `Progresso em ${currentEntry.progressUnit}`}
            </label>
            <input
              id="entry-progress"
              name="progress"
              type="number"
              min="0"
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
      <section className="content-card" aria-labelledby="entry-notes-title">
        <h3 id="entry-notes-title">Notas</h3>
        <form onSubmit={(event) => void addNote(event)}>
          <div className="form-field">
            <label htmlFor="entry-note">Nova nota</label>
            <textarea id="entry-note" name="note" required />
          </div>
          <button
            className="button button--primary"
            disabled={busy}
            type="submit"
          >
            Adicionar nota
          </button>
        </form>
        {notes.length === 0 ? (
          <p>Nenhuma nota neste registro.</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>{note.content}</li>
            ))}
          </ul>
        )}
      </section>
      {(currentEntry.type === "movie" ||
        currentEntry.type === "series" ||
        currentEntry.type === "study") && (
        <section className="content-card">
          <h3>Citações</h3>
          {quotes.length === 0 ? (
            <p>Nenhuma citação neste registro.</p>
          ) : (
            <ul>
              {quotes.map((quote) => (
                <li key={quote.id}>{quote.content}</li>
              ))}
            </ul>
          )}
        </section>
      )}
      <OrganizationPanel
        application={availableApplication}
        entry={currentEntry}
        onChange={setEntry}
      />
      <SessionPanel application={availableApplication} entry={currentEntry} />
    </section>
  );
}
