import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  ENTRY_TYPES,
  PHYSICAL_ACTIVITY_CATEGORIES,
  STUDY_PROGRESS_UNITS,
  type EntryType,
  type LibraryEntry,
} from "../../domain";
import { entryTypeLabels } from "../collection/collectionControls";
import { presentApplicationError } from "./errorMessages";
import { NewBookPage, type EditorApplication } from "./EntryEditorPages";

interface NewEntryApplication extends EditorApplication {
  readonly commands: EditorApplication["commands"] & {
    readonly createLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
  };
}

const descriptions: Readonly<Record<EntryType, string>> = {
  book: "Acompanhe páginas, notas e citações.",
  movie: "Guarde filmes vistos ou que deseja assistir.",
  series: "Acompanhe episódios e onde parou.",
  study: "Registre uma área, disciplina ou percurso de estudo.",
  physical_activity: "Registre uma prática ao longo do tempo.",
  work: "Acompanhe um projeto ou atividade profissional.",
};

function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

function positiveInteger(form: FormData, name: string): number | undefined {
  const value = field(form, name);
  return value === undefined ? undefined : Number(value);
}

function specificInput(type: Exclude<EntryType, "book">, form: FormData) {
  const title = field(form, "title") ?? "";
  switch (type) {
    case "movie":
      return {
        type,
        title,
        director: field(form, "director"),
        year: positiveInteger(form, "year"),
        durationMinutes: positiveInteger(form, "durationMinutes"),
        platform: field(form, "platform"),
      };
    case "series":
      return {
        type,
        title,
        platform: field(form, "platform"),
        totalEpisodes: positiveInteger(form, "totalEpisodes"),
      };
    case "study": {
      const progressUnit = field(form, "progressUnit") ?? "sessions";
      const total = positiveInteger(form, "progressTotal");
      return {
        type,
        title,
        area: field(form, "area"),
        discipline: field(form, "discipline"),
        objective: field(form, "objective"),
        progressUnit,
        progressTotal:
          progressUnit === "hours" && total !== undefined ? total * 60 : total,
        deadline: field(form, "deadline")
          ? `${field(form, "deadline")}T00:00:00.000Z`
          : undefined,
      };
    }
    case "physical_activity":
      return {
        type,
        title,
        category: field(form, "category") ?? "other",
        modality: field(form, "modality"),
        objective: field(form, "objective"),
      };
    case "work":
      return {
        type,
        title,
        area: field(form, "area"),
        organization: field(form, "organization"),
        description: field(form, "description"),
        deadline: field(form, "deadline")
          ? `${field(form, "deadline")}T00:00:00.000Z`
          : undefined,
        nextAction: field(form, "nextAction"),
      };
  }
}

function OptionalField({
  label,
  name,
  type = "text",
}: {
  readonly label: string;
  readonly name: string;
  readonly type?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={`entry-${name}`}>{label}</label>
      <input id={`entry-${name}`} name={name} type={type} />
    </div>
  );
}

export function NewEntryPage({
  application,
}: {
  readonly application?: NewEntryApplication;
}) {
  const [selectedType, setSelectedType] = useState<EntryType>();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!application)
    return (
      <section className="content-card" role="alert">
        <h2>Formulário indisponível</h2>
        <p>Não foi possível iniciar o armazenamento local.</p>
      </section>
    );
  if (selectedType === "book") return <NewBookPage application={application} />;
  if (!selectedType)
    return (
      <section aria-labelledby="entry-type-title">
        <p className="eyebrow">Cadastro</p>
        <h2 id="entry-type-title">Novo registro</h2>
        <p>O que você quer guardar na Biblioteca Viva?</p>
        <ul className="type-picker">
          {ENTRY_TYPES.map((type) => (
            <li key={type}>
              <button
                className="content-card type-picker__option"
                type="button"
                onClick={() => setSelectedType(type)}
              >
                <strong>{entryTypeLabels[type]}</strong>
                <span>{descriptions[type]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || !selectedType || selectedType === "book" || submitting)
      return;
    setError(undefined);
    setSubmitting(true);
    try {
      const entry = await application.commands.createLibraryEntry.execute(
        specificInput(selectedType, new FormData(event.currentTarget)),
      );
      void navigate(`/registros/${encodeURIComponent(entry.id)}`);
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
      setSubmitting(false);
    }
  }

  return (
    <section className="content-card" aria-labelledby="new-entry-title">
      <p className="eyebrow">{entryTypeLabels[selectedType]}</p>
      <h2 id="new-entry-title">Novo registro</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(event) => void submit(event)} noValidate>
        <div className="form-field">
          <label htmlFor="entry-title">Título</label>
          <input
            id="entry-title"
            name="title"
            required
            aria-invalid={error ? true : undefined}
          />
        </div>
        {selectedType === "movie" && (
          <>
            <OptionalField label="Direção (opcional)" name="director" />
            <OptionalField label="Ano (opcional)" name="year" type="number" />
            <OptionalField
              label="Duração em minutos (opcional)"
              name="durationMinutes"
              type="number"
            />
            <OptionalField label="Plataforma (opcional)" name="platform" />
          </>
        )}
        {selectedType === "series" && (
          <>
            <OptionalField label="Plataforma (opcional)" name="platform" />
            <OptionalField
              label="Total de episódios (opcional)"
              name="totalEpisodes"
              type="number"
            />
          </>
        )}
        {selectedType === "study" && (
          <>
            <OptionalField label="Área (opcional)" name="area" />
            <OptionalField label="Disciplina (opcional)" name="discipline" />
            <OptionalField label="Objetivo (opcional)" name="objective" />
            <div className="form-field">
              <label htmlFor="entry-progressUnit">Unidade de progresso</label>
              <select id="entry-progressUnit" name="progressUnit">
                {STUDY_PROGRESS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <OptionalField
              label="Total (opcional)"
              name="progressTotal"
              type="number"
            />
            <OptionalField
              label="Prazo (opcional)"
              name="deadline"
              type="date"
            />
          </>
        )}
        {selectedType === "physical_activity" && (
          <>
            <div className="form-field">
              <label htmlFor="entry-category">Categoria</label>
              <select id="entry-category" name="category">
                {PHYSICAL_ACTIVITY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <OptionalField label="Modalidade (opcional)" name="modality" />
            <OptionalField label="Objetivo (opcional)" name="objective" />
          </>
        )}
        {selectedType === "work" && (
          <>
            <OptionalField label="Área (opcional)" name="area" />
            <OptionalField
              label="Organização ou cliente (opcional)"
              name="organization"
            />
            <div className="form-field">
              <label htmlFor="entry-description">Descrição (opcional)</label>
              <textarea id="entry-description" name="description" />
            </div>
            <OptionalField
              label="Prazo (opcional)"
              name="deadline"
              type="date"
            />
            <OptionalField label="Próxima ação (opcional)" name="nextAction" />
          </>
        )}
        <div className="form-actions">
          <button
            className="button button--primary"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Salvando…" : "Salvar registro"}
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={submitting}
            onClick={() => setSelectedType(undefined)}
          >
            Escolher outro tipo
          </button>
        </div>
      </form>
    </section>
  );
}
