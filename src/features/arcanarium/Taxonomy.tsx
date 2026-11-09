import { useState } from "react";
import { Link } from "react-router-dom";
import type { KnowledgeTag, CardContent } from "../../domain/arcanarium";
import { knowledgeTagSchema } from "../../domain/arcanarium";
import { arcanaError, useArcana } from "./context";
import { Choices } from "./Choices";
import { levelNames, tagPath } from "./presentation";
export function ClassificationEditor({
  value,
  onChange,
}: {
  readonly value: Extract<CardContent, { type: "question" }>["classification"];
  readonly onChange: (
    v: Extract<CardContent, { type: "question" }>["classification"],
  ) => void;
}) {
  const { data } = useArcana();
  const [search, setSearch] = useState("");
  const toggle = (ids: string[], id: string) =>
    ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
  return (
    <fieldset>
      <legend>Conhecimentos e etiquetas</legend>
      <p>
        Hierarquia editorial e etiquetas pessoais são independentes dos
        metadados da prova.
      </p>
      <Link to="/arcanario/assuntos">Organizar classificações →</Link>
      <label>
        Pesquisar classificações
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
          .map((t) => (
            <label className="arcana-check" key={t.id}>
              <input
                type="checkbox"
                checked={(t.namespace === "editorial"
                  ? value.knowledgeTagIds
                  : value.personalTagIds
                ).includes(t.id)}
                onChange={() => {
                  const next = {
                    ...value,
                    [t.namespace === "editorial"
                      ? "knowledgeTagIds"
                      : "personalTagIds"]: toggle(
                      t.namespace === "editorial"
                        ? value.knowledgeTagIds
                        : value.personalTagIds,
                      t.id,
                    ),
                  };
                  if (
                    next.primarySubjectId &&
                    !next.knowledgeTagIds.includes(next.primarySubjectId)
                  )
                    delete next.primarySubjectId;
                  onChange(next);
                }}
              />
              <span>
                {tagPath(t, data.tags)} <small>{levelNames[t.level]}</small>
              </span>
            </label>
          ))}
      </div>
      {!data.tags.length && (
        <p>
          Ainda sem classificações. Crie sua primeira área em Organizar
          classificações; seu rascunho será guardado.
        </p>
      )}
      <Choices
        label="Assunto principal"
        value={value.primarySubjectId ?? ""}
        options={[
          { value: "", label: "Sem assunto principal" },
          ...data.tags
            .filter((t) => ["subject", "subsubject"].includes(t.level))
            .map((t) => ({ value: t.id, label: tagPath(t, data.tags) })),
        ]}
        onChange={(id) => {
          const { primarySubjectId: _previous, ...rest } = value;
          void _previous;
          onChange(
            id
              ? {
                  ...rest,
                  primarySubjectId: id,
                  knowledgeTagIds: [...new Set([...value.knowledgeTagIds, id])],
                }
              : rest,
          );
        }}
      />
    </fieldset>
  );
}
export function Taxonomy() {
  const { data, app, reload } = useArcana();
  const [editing, setEditing] = useState<KnowledgeTag>();
  const [label, setLabel] = useState(""),
    [synonyms, setSynonyms] = useState(""),
    [level, setLevel] = useState<KnowledgeTag["level"]>("area"),
    [parent, setParent] = useState(""),
    [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const previousLevel = {
    area: "",
    discipline: "area",
    subject: "discipline",
    subsubject: "subject",
    skill: "subsubject",
    label: "",
  }[level];
  const reset = () => {
    setEditing(undefined);
    setLabel("");
    setSynonyms("");
    setParent("");
    setLevel("area");
  };
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">A árvore dos saberes</p>
          <h2>Classificações de conhecimento</h2>
          <p>
            Área → Disciplina → Assunto → Subassunto → Habilidade. Nenhum
            catálogo é instalado automaticamente.
          </p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <form
        className="arcana-panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          void app.arcanarium
            .saveTag(
              {
                id: editing?.id ?? `local:tag:${crypto.randomUUID()}`,
                revision: (editing?.revision ?? 0) + 1,
                label: label.trim(),
                namespace: level === "label" ? "personal" : "editorial",
                level,
                parentIds: parent ? [parent] : [],
                relatedIds: editing?.relatedIds ?? [],
                synonyms: synonyms
                  .split(";")
                  .map((v) => v.trim())
                  .filter(Boolean),
              },
              editing?.revision,
            )
            .then(async () => {
              await reload();
              reset();
              setMessage(
                "Classificação salva. Sessões anteriores conservam seus retratos históricos.",
              );
            })
            .catch((e) => setError(arcanaError(e)))
            .finally(() => setBusy(false));
        }}
      >
        <h3>{editing ? "Editar classificação" : "Criar classificação"}</h3>
        <fieldset disabled={busy}>
          <label>
            Nome da classificação
            <input
              required
              maxLength={160}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <Choices
            label="Nível"
            value={level}
            options={Object.entries(levelNames)
              .filter(([id]) => !editing || id === editing.level)
              .map(([value, label]) => ({ value, label }))}
            onChange={(v) => {
              setLevel(knowledgeTagSchema.shape.level.parse(v));
              setParent("");
            }}
          />
          {previousLevel && (
            <Choices
              label="Classificação pai"
              value={parent}
              options={[
                { value: "", label: "Escolha o pai" },
                ...data.tags
                  .filter((t) => t.level === previousLevel)
                  .map((t) => ({ value: t.id, label: tagPath(t, data.tags) })),
              ]}
              onChange={setParent}
            />
          )}
          <label>
            Sinônimos (separados por ponto e vírgula)
            <input
              maxLength={1000}
              value={synonyms}
              onChange={(e) => setSynonyms(e.target.value)}
            />
          </label>
          <button
            className="button button--primary"
            disabled={!!previousLevel && !parent}
            type="submit"
          >
            Salvar classificação
          </button>
          {editing && (
            <button type="button" onClick={reset}>
              Cancelar edição
            </button>
          )}
        </fieldset>
      </form>
      <section className="arcana-panel">
        <h3>Navegar pela hierarquia</h3>
        <label>
          Buscar nome, caminho ou sinônimo
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <ul className="arcana-list">
          {data.tags
            .filter((t) =>
              `${tagPath(t, data.tags)} ${t.synonyms.join(" ")}`
                .toLocaleLowerCase()
                .includes(search.toLocaleLowerCase()),
            )
            .sort((a, b) =>
              tagPath(a, data.tags).localeCompare(tagPath(b, data.tags)),
            )
            .map((t) => (
              <li key={t.id}>
                <span>
                  {tagPath(t, data.tags)} · {levelNames[t.level]} · revisão{" "}
                  {t.revision}
                </span>
                <button
                  onClick={() => {
                    setEditing(t);
                    setLabel(t.label);
                    setLevel(t.level);
                    setParent(t.parentIds[0] ?? "");
                    setSynonyms(t.synonyms.join("; "));
                    setMessage("");
                  }}
                >
                  Editar {t.label}
                </button>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
