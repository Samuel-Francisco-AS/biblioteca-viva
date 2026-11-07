import { WorkDetailPage } from "./WorkDetailPage";
import type { WorkEntry } from "../../domain";
import {
  EntertainmentDetail,
  type EntertainmentApplication,
} from "../entertainment/EntertainmentDetail";
import {
  WorkoutDetailPage,
  type WorkoutApplication,
} from "./WorkoutDetailPage";
import { StudyDetailPage } from "./StudyDetailPage";
import type { FlashCardApplication } from "./StudyFlashCards";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import type { LibraryEntry, Note, Quote } from "../../domain";
import { safeReturnPath } from "../books/navigationOrigin";
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
  readonly posters?: EntertainmentApplication["posters"];
  readonly physicalProfile?: WorkoutApplication["physicalProfile"];
  readonly commands: BookDetailApplication["commands"] &
    FlashCardApplication["commands"] &
    EntertainmentApplication["commands"] &
    WorkoutApplication["commands"] & {
      readonly saveEndeavor?: { execute(input: unknown): Promise<WorkEntry> };
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
  const [entry, setEntry] = useState<LibraryEntry>();
  const [notes, setNotes] = useState<readonly Note[]>([]);
  const [quotes, setQuotes] = useState<readonly Quote[]>([]);
  const [error, setError] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);

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
        key={id}
        refreshKey={refreshKey}
        readingSession={(book) => (
          <SessionPanel
            application={application}
            entry={book}
            onChanged={() => setRefreshKey((value) => value + 1)}
          />
        )}
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
  if (entry.type === "physical_activity")
    return (
      <WorkoutDetailPage
        key={id}
        application={application}
        entry={entry}
        notes={notes}
        quotes={quotes}
        returnPath={returnPath}
        onChange={setEntry}
      />
    );
  if (entry.type === "movie" || entry.type === "series")
    return (
      <EntertainmentDetail
        key={id}
        application={application}
        entry={entry}
        notes={notes}
        quotes={quotes}
        returnPath={returnPath}
        onChange={setEntry}
      />
    );
  return (
    <WorkDetailPage
      key={id}
      application={application}
      entry={entry}
      notes={notes}
      quotes={quotes}
      returnPath={returnPath}
      onChange={setEntry}
    />
  );
}
