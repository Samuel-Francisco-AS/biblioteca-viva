import { Disclosure } from "./Disclosure";
import { useState } from "react";
import { dynamicCriteriaSchema } from "../../domain/arcanarium";
import { Choices } from "./Choices";
import { useArcana } from "./context";
import { tagPath } from "./presentation";
import { type Criteria } from "./presentation";
export function TrialFilters({
  value,
  onChange,
}: {
  readonly value: Criteria;
  readonly onChange: (c: Criteria) => void;
}) {
  const { data } = useArcana();
  const [search, setSearch] = useState("");
  const patch = (change: Partial<Criteria>) =>
    onChange({ ...value, ...change });
  const text = (key: "exam" | "board", v: string) => {
    const next = { ...value };
    if (v.trim()) next[key] = v;
    else delete next[key];
    onChange(next);
  };
  return (
    <fieldset className="arcana-trial-filters">
      <legend>Critérios da seleção</legend>
      <p>
        Todos os filtros preenchidos são combinados por <strong>E</strong>.
        Todas as tags selecionadas devem corresponder; selecionar uma área
        inclui seus descendentes. Prova e banca usam correspondência exata, sem
        distinguir maiúsculas.
      </p>
      <label>
        Quantidade desejada
        <input
          type="number"
          min={1}
          max={500}
          required
          value={value.limit}
          onChange={(e) =>
            patch({
              limit: Math.max(1, Math.min(500, Number(e.target.value) || 1)),
            })
          }
        />
      </label>
      <Disclosure
        label={`Conhecimentos e etiquetas (${value.knowledgeTagIds.length + value.personalTagIds.length})`}
      >
        <label>
          Pesquisar filtros de classificação
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="arcana-choice-list">
          {data.tags
            .filter((t) =>
              `${tagPath(t, data.tags)} ${t.synonyms.join(" ")}`
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase()),
            )
            .map((t) => {
              const key =
                t.namespace === "editorial"
                  ? "knowledgeTagIds"
                  : "personalTagIds";
              return (
                <label key={t.id} className="arcana-check">
                  <input
                    type="checkbox"
                    checked={value[key].includes(t.id)}
                    onChange={() =>
                      patch({
                        [key]: value[key].includes(t.id)
                          ? value[key].filter((id) => id !== t.id)
                          : [...value[key], t.id],
                      })
                    }
                  />
                  {tagPath(t, data.tags)}
                </label>
              );
            })}
        </div>
        {!data.tags.length && (
          <p>
            Crie classificações para filtrar por área, disciplina, assunto,
            subassunto e habilidade.
          </p>
        )}
      </Disclosure>
      <Disclosure label="Origem, prova e dificuldade">
        <label>
          Prova (filtro)
          <input
            maxLength={160}
            value={value.exam ?? ""}
            onChange={(e) => text("exam", e.target.value)}
          />
        </label>
        <label>
          Ano (filtro)
          <input
            type="number"
            min={1}
            max={9999}
            value={value.year ?? ""}
            onChange={(e) => {
              const next = { ...value };
              if (e.target.value) next.year = Number(e.target.value);
              else delete next.year;
              onChange(next);
            }}
          />
        </label>
        <label>
          Banca (filtro)
          <input
            maxLength={160}
            value={value.board ?? ""}
            onChange={(e) => text("board", e.target.value)}
          />
        </label>
        <Choices
          label="Origem"
          value={value.origin ?? ""}
          options={[
            { value: "", label: "Todas as origens" },
            { value: "local", label: "Autoral local" },
            { value: "study", label: "Estudo" },
            { value: "imported", label: "Importada" },
            { value: "official", label: "Oficial" },
          ]}
          onChange={(v) => {
            const next = { ...value };
            if (v)
              next.origin =
                dynamicCriteriaSchema.options[1].shape.origin.parse(v);
            else delete next.origin;
            onChange(next);
          }}
        />
        <Choices
          label="Dificuldade"
          value={value.difficulty ?? ""}
          options={[
            { value: "", label: "Qualquer dificuldade" },
            { value: "easy", label: "Fácil" },
            { value: "medium", label: "Média" },
            { value: "hard", label: "Difícil" },
          ]}
          onChange={(v) => {
            const next = { ...value };
            if (v)
              next.difficulty =
                dynamicCriteriaSchema.options[1].shape.difficulty.parse(v);
            else delete next.difficulty;
            onChange(next);
          }}
        />
      </Disclosure>
      <Disclosure label="Histórico de tentativas">
        <Choices
          label="Respostas anteriores"
          value={value.history}
          options={[
            { value: "all", label: "Todas as questões" },
            { value: "never", label: "Nunca respondidas" },
            { value: "incorrect", label: "Com pelo menos um erro anterior" },
            { value: "answered", label: "Já respondidas" },
          ]}
          onChange={(v) =>
            patch({
              history: dynamicCriteriaSchema.options[1].shape.history.parse(v),
            })
          }
        />
        {(["minAttempts", "maxAttempts"] as const).map((key) => (
          <label key={key}>
            {key === "minAttempts"
              ? "Mínimo de tentativas"
              : "Máximo de tentativas"}
            <input
              type="number"
              min={0}
              value={value[key] ?? ""}
              onChange={(e) => {
                const next = { ...value };
                if (e.target.value) next[key] = Number(e.target.value);
                else delete next[key];
                onChange(next);
              }}
            />
          </label>
        ))}
      </Disclosure>
    </fieldset>
  );
}
