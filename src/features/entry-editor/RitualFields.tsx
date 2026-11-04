import { useState } from "react";
import { WorkoutFields } from "./WorkoutFields";
import type { ReactNode } from "react";
import {
  PHYSICAL_ACTIVITY_CATEGORIES,
  STUDY_PROGRESS_UNITS,
  type EntryType,
  type LibraryEntry,
} from "../../domain";

export function RitualChapter({
  number,
  title,
  children,
}: {
  readonly number: string;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <fieldset className="ritual-chapter">
      <legend>
        <span className="ritual-chapter__number">{number}</span>
        <span className="ritual-chapter__title">{title}</span>
      </legend>
      <div className="ritual-chapter__body">
        <span className="ritual-chapter__seal" aria-hidden="true">
          ✦
        </span>
        {children}
      </div>
    </fieldset>
  );
}
function Inscription({
  name,
  label,
  value,
  type = "text",
  multiline = false,
  required = false,
  numericStep = "1",
}: {
  readonly name: string;
  readonly label: string;
  readonly value?: string | number;
  readonly type?: string;
  readonly multiline?: boolean;
  readonly required?: boolean;
  readonly numericStep?: string;
}) {
  const id = `ritual-${name}`;
  return (
    <div className={`form-field inscription inscription--${name}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} name={name} defaultValue={value} rows={3} />
      ) : (
        <input
          id={id}
          name={name}
          defaultValue={value}
          type={type}
          required={required}
          inputMode={type === "number" ? "numeric" : undefined}
          step={type === "number" ? numericStep : undefined}
        />
      )}
      {required && <small>Obrigatório</small>}
    </div>
  );
}
export function RitualFields({
  type,
  entry,
}: {
  readonly type: Exclude<EntryType, "book">;
  readonly entry?: LibraryEntry;
}) {
  const movie = entry?.type === "movie" ? entry : undefined;
  const series = entry?.type === "series" ? entry : undefined;
  const study = entry?.type === "study" ? entry : undefined;
  const activity = entry?.type === "physical_activity" ? entry : undefined;
  const work = entry?.type === "work" ? entry : undefined;
  const [category, setCategory] = useState(activity?.category ?? "other");
  const [unit, setUnit] = useState(study?.progressUnit ?? "sessions");
  const detail = (
    <details className="ritual-marginalia">
      <summary>Datas e referências opcionais</summary>
      <div className="ritual-chapter__body">
        {type === "movie" && (
          <>
            <Inscription
              name="durationMinutes"
              label="Duração em minutos (opcional)"
              value={movie?.durationMinutes}
              type="number"
            />
            <Inscription
              name="platform"
              label="Plataforma (opcional)"
              value={movie?.platform}
            />
          </>
        )}
        {(type === "study" || type === "work") && (
          <Inscription
            name="deadline"
            label="Prazo (opcional)"
            type="date"
            value={(study?.deadline ?? work?.deadline)?.slice(0, 10)}
          />
        )}
        {type === "work" && (
          <>
            <Inscription
              name="area"
              label="Área (opcional)"
              value={work?.area}
            />
            <Inscription
              name="organization"
              label="Organização ou cliente (opcional)"
              value={work?.organization}
            />
          </>
        )}
      </div>
    </details>
  );
  return (
    <div className="ritual-fields" data-craft={type}>
      <RitualChapter
        number="I"
        title={
          type === "work"
            ? "A intenção"
            : type === "study"
              ? "A pergunta inicial"
              : type === "physical_activity"
                ? "O nome da sua prática"
                : type === "movie"
                  ? "Uma obra para lembrar"
                  : "Uma história em capítulos"
        }
      >
        <Inscription
          name="title"
          label="Título"
          value={entry?.title}
          required
        />
        {type === "movie" && (
          <div className="ritual-pair">
            <Inscription
              name="director"
              label="Direção (opcional)"
              value={movie?.director}
            />
            <Inscription
              name="year"
              label="Ano (opcional)"
              value={movie?.year}
              type="number"
            />
          </div>
        )}
        {type === "study" && (
          <div className="ritual-pair">
            <Inscription
              name="area"
              label="Área (opcional)"
              value={study?.area}
            />
            <Inscription
              name="discipline"
              label="Disciplina (opcional)"
              value={study?.discipline}
            />
          </div>
        )}
        {type === "work" && (
          <Inscription
            name="description"
            label="Descrição (opcional)"
            value={work?.description}
            multiline
          />
        )}
      </RitualChapter>
      {type === "series" && (
        <RitualChapter number="II" title="O fio da narrativa">
          <p>
            Uma história de cada vez. Seu marcador de temporada e episódio fica
            na ficha.
          </p>
          {!series && (
            <Inscription
              name="episodesWatched"
              label="Episódios já assistidos (opcional)"
              type="number"
            />
          )}
          {!series && (
            <div className="ritual-pair">
              <Inscription
                name="currentSeason"
                label="Temporada em que parou (opcional)"
                type="number"
              />
              <Inscription
                name="currentEpisode"
                label="Episódio em que parou (opcional)"
                type="number"
              />
            </div>
          )}
          <div className="ritual-pair">
            <Inscription
              name="totalEpisodes"
              label="Total de episódios (opcional)"
              value={series?.totalEpisodes}
              type="number"
            />
            <Inscription
              name="platform"
              label="Plataforma (opcional)"
              value={series?.platform}
            />
          </div>
        </RitualChapter>
      )}
      {type === "study" && (
        <RitualChapter number="II" title="Seu percurso">
          <Inscription
            name="objective"
            label="Objetivo (opcional)"
            value={study?.objective}
            multiline
          />
          <div className="ritual-pair">
            <div className="form-field">
              <label htmlFor="ritual-progressUnit">Unidade de progresso</label>
              <select
                id="ritual-progressUnit"
                name="progressUnit"
                value={unit}
                onChange={(event) => {
                  const selected = STUDY_PROGRESS_UNITS.find(
                    (value) => value === event.target.value,
                  );
                  if (selected) setUnit(selected);
                }}
                disabled={Boolean(study)}
              >
                {STUDY_PROGRESS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {
                      {
                        hours: "Horas",
                        sessions: "Sessões",
                        modules: "Módulos",
                        topics: "Tópicos",
                        exercises: "Exercícios",
                        percent: "Porcentagem",
                      }[unit]
                    }
                  </option>
                ))}
              </select>
            </div>
            <Inscription
              name="progressTotal"
              label="Total (opcional)"
              value={
                study?.progressTotal === undefined
                  ? undefined
                  : study.progressTotal /
                    (study.progressUnit === "hours" ? 60 : 1)
              }
              numericStep={unit === "hours" ? "any" : "1"}
              type="number"
            />
          </div>
        </RitualChapter>
      )}
      {type === "physical_activity" && (
        <RitualChapter number="II" title="Corpo em movimento">
          <div className="form-field">
            <label htmlFor="ritual-category">Categoria</label>
            <select
              id="ritual-category"
              name="category"
              value={category}
              onChange={(event) => {
                const selected = PHYSICAL_ACTIVITY_CATEGORIES.find(
                  (value) => value === event.target.value,
                );
                if (selected) setCategory(selected);
              }}
            >
              {PHYSICAL_ACTIVITY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {
                    {
                      strength: "Força",
                      cardio: "Cardio",
                      mobility: "Mobilidade",
                      sport: "Esporte",
                      mixed: "Mista",
                      other: "Outra",
                    }[category]
                  }
                </option>
              ))}
            </select>
          </div>
          <Inscription
            name="modality"
            label="Modalidade (opcional)"
            value={activity?.modality}
          />
          <Inscription
            name="objective"
            label="Objetivo (opcional)"
            value={activity?.objective}
            multiline
          />
        </RitualChapter>
      )}
      {type === "physical_activity" &&
        (category === "strength" ||
          category === "mobility" ||
          category === "mixed" ||
          Boolean(activity?.exercises?.length)) && (
          <RitualChapter number="III" title="Sua ficha de exercícios">
            <WorkoutFields exercises={activity?.exercises} />
          </RitualChapter>
        )}
      {type === "work" && (
        <RitualChapter number="II" title="O próximo passo">
          <Inscription
            name="nextAction"
            label="Próxima ação (opcional)"
            value={work?.nextAction}
            multiline
          />
        </RitualChapter>
      )}
      {(type === "movie" || type === "study" || type === "work") && detail}
    </div>
  );
}
