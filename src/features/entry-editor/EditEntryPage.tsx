import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { LibraryEntry } from "../../domain";
import { safeReturnPath } from "../books/navigationOrigin";
import { entryTypeLabels } from "../collection/collectionControls";
import { EditBookPage, type EditorApplication } from "./EntryEditorPages";
import { presentApplicationError } from "./errorMessages";

interface EditEntryApplication extends EditorApplication {
  readonly commands: EditorApplication["commands"] & {
    readonly updateLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
  readonly queries: EditorApplication["queries"] & {
    readonly getLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
}

function value(form: FormData, name: string): string | undefined {
  const item = form.get(name);
  if (typeof item !== "string") return undefined;
  const normalized = item.trim();
  return normalized === "" ? undefined : normalized;
}

function numeric(form: FormData, name: string): number | undefined {
  const item = value(form, name);
  return item === undefined ? undefined : Number(item);
}

function updateInput(
  entry: Exclude<LibraryEntry, { readonly type: "book" }>,
  form: FormData,
) {
  const common = {
    id: entry.id,
    type: entry.type,
    title: value(form, "title") ?? "",
  };
  switch (entry.type) {
    case "movie":
      return {
        ...common,
        director: value(form, "director"),
        year: numeric(form, "year"),
        durationMinutes: numeric(form, "durationMinutes"),
        platform: value(form, "platform"),
      };
    case "series":
      return {
        ...common,
        platform: value(form, "platform"),
        totalEpisodes: numeric(form, "totalEpisodes"),
      };
    case "study":
      return {
        ...common,
        area: value(form, "area"),
        discipline: value(form, "discipline"),
        objective: value(form, "objective"),
        progressUnit: entry.progressUnit,
        progressTotal: numeric(form, "progressTotal"),
        deadline: entry.deadline,
      };
    case "physical_activity":
      return {
        ...common,
        category: entry.category,
        modality: value(form, "modality"),
        objective: value(form, "objective"),
      };
    case "work":
      return {
        ...common,
        area: value(form, "area"),
        organization: value(form, "organization"),
        description: value(form, "description"),
        deadline: entry.deadline,
        nextAction: value(form, "nextAction"),
      };
  }
}

function Input({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  readonly defaultValue?: string | number;
  readonly label: string;
  readonly name: string;
  readonly type?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={`edit-${name}`}>{label}</label>
      <input
        defaultValue={defaultValue}
        id={`edit-${name}`}
        name={name}
        type={type}
      />
    </div>
  );
}

export function EditEntryPage({
  application,
}: {
  readonly application?: EditEntryApplication;
}) {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const returnPath = safeReturnPath(params.get("from"));
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LibraryEntry>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!application) return;
    let active = true;
    void application.queries.getLibraryEntry.execute({ id }).then(
      (loaded) => active && setEntry(loaded),
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
        <h2>Edição indisponível</h2>
      </section>
    );
  if (error)
    return (
      <section className="content-card" role="alert">
        <h2>Não foi possível abrir o registro</h2>
        <p>{error}</p>
        <Link to={returnPath}>Voltar</Link>
      </section>
    );
  if (!entry) return <p role="status">Carregando registro…</p>;
  if (entry.type === "book") return <EditBookPage application={application} />;
  const current = entry;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const updated = await application?.commands.updateLibraryEntry.execute(
        updateInput(current, new FormData(event.currentTarget)),
      );
      if (updated)
        void navigate(
          `/registros/${encodeURIComponent(updated.id)}?from=${encodeURIComponent(returnPath)}`,
        );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      setBusy(false);
    }
  }
  return (
    <section className="content-card" aria-labelledby="edit-entry-title">
      <p className="eyebrow">{entryTypeLabels[current.type]}</p>
      <h2 id="edit-entry-title">Editar registro</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => void submit(event)}>
        <Input defaultValue={current.title} label="Título" name="title" />
        {current.type === "movie" && (
          <>
            <Input
              defaultValue={current.director}
              label="Direção (opcional)"
              name="director"
            />
            <Input
              defaultValue={current.year}
              label="Ano (opcional)"
              name="year"
              type="number"
            />
            <Input
              defaultValue={current.durationMinutes}
              label="Duração em minutos (opcional)"
              name="durationMinutes"
              type="number"
            />
            <Input
              defaultValue={current.platform}
              label="Plataforma (opcional)"
              name="platform"
            />
          </>
        )}
        {current.type === "series" && (
          <>
            <Input
              defaultValue={current.platform}
              label="Plataforma (opcional)"
              name="platform"
            />
            <Input
              defaultValue={current.totalEpisodes}
              label="Total de episódios (opcional)"
              name="totalEpisodes"
              type="number"
            />
          </>
        )}
        {current.type === "study" && (
          <>
            <Input
              defaultValue={current.area}
              label="Área (opcional)"
              name="area"
            />
            <Input
              defaultValue={current.discipline}
              label="Disciplina (opcional)"
              name="discipline"
            />
            <Input
              defaultValue={current.objective}
              label="Objetivo (opcional)"
              name="objective"
            />
            <Input
              defaultValue={current.progressTotal}
              label="Total (opcional)"
              name="progressTotal"
              type="number"
            />
          </>
        )}
        {current.type === "physical_activity" && (
          <>
            <Input
              defaultValue={current.modality}
              label="Modalidade (opcional)"
              name="modality"
            />
            <Input
              defaultValue={current.objective}
              label="Objetivo (opcional)"
              name="objective"
            />
          </>
        )}
        {current.type === "work" && (
          <>
            <Input
              defaultValue={current.area}
              label="Área (opcional)"
              name="area"
            />
            <Input
              defaultValue={current.organization}
              label="Organização ou cliente (opcional)"
              name="organization"
            />
            <Input
              defaultValue={current.description}
              label="Descrição (opcional)"
              name="description"
            />
            <Input
              defaultValue={current.nextAction}
              label="Próxima ação (opcional)"
              name="nextAction"
            />
          </>
        )}
        <div className="form-actions">
          <button
            className="button button--primary"
            disabled={busy}
            type="submit"
          >
            {busy ? "Salvando…" : "Salvar"}
          </button>
          <Link
            className="button button--secondary"
            to={`/registros/${encodeURIComponent(id)}?from=${encodeURIComponent(returnPath)}`}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
