import { useEffect, useState, type FormEvent } from "react";

import type { LibraryEntry, Tag } from "../../domain";
import { presentApplicationError } from "../entry-editor/errorMessages";

export interface OrganizationApplication {
  readonly commands: {
    readonly createTag: { execute(input: unknown): Promise<Tag> };
    readonly deleteTag: {
      execute(input: unknown): Promise<{ readonly deleted: true }>;
    };
    readonly organizeLibraryEntry: {
      execute(input: unknown): Promise<LibraryEntry>;
    };
    readonly renameTag: { execute(input: unknown): Promise<Tag> };
  };
  readonly queries: {
    readonly listTags: { execute(): Promise<readonly Tag[]> };
  };
}

export function OrganizationPanel({
  application,
  entry,
  onChange,
}: {
  readonly application: OrganizationApplication;
  readonly entry: LibraryEntry;
  readonly onChange: (entry: LibraryEntry) => void;
}) {
  const [tags, setTags] = useState<readonly Tag[]>([]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void application.queries.listTags
      .execute()
      .then(setTags, (failure: unknown) =>
        setError(presentApplicationError(failure).message),
      );
  }, [application]);

  async function organize(input: {
    readonly favorite?: boolean;
    readonly tagIds?: readonly string[];
  }) {
    setBusy(true);
    setError(undefined);
    try {
      onChange(
        await application.commands.organizeLibraryEntry.execute({
          id: entry.id,
          ...input,
        }),
      );
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError(undefined);
    const name = new FormData(event.currentTarget).get("tagName");
    try {
      const tag = await application.commands.createTag.execute({ name });
      setTags((current) =>
        [...current, tag].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
      onChange(
        await application.commands.organizeLibraryEntry.execute({
          id: entry.id,
          tagIds: [...entry.tagIds, tag.id],
        }),
      );
      formElement.reset();
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  async function actTag(operation: () => Promise<void>) {
    setBusy(true);
    setError(undefined);
    try {
      await operation();
    } catch (failure: unknown) {
      setError(presentApplicationError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  async function rename(tag: Tag) {
    const name = window.prompt("Novo nome da etiqueta", tag.name);
    if (!name || name === tag.name) return;
    await actTag(async () => {
      const updated = await application.commands.renameTag.execute({
        id: tag.id,
        name,
      });
      setTags((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
    });
  }

  async function remove(tag: Tag) {
    if (
      !window.confirm(`Excluir a etiqueta ${tag.name} de todos os conteúdos?`)
    )
      return;
    await actTag(async () => {
      await application.commands.deleteTag.execute({ id: tag.id });
      setTags((current) => current.filter(({ id }) => id !== tag.id));
      if (entry.tagIds.includes(tag.id))
        onChange({
          ...entry,
          tagIds: entry.tagIds.filter((id) => id !== tag.id),
        });
    });
  }

  return (
    <section className="content-card" aria-labelledby="organization-title">
      <h3 id="organization-title">Organização</h3>
      {error && <p role="alert">{error}</p>}
      <button
        aria-pressed={entry.favorite}
        className="button button--secondary"
        disabled={busy}
        onClick={() => void organize({ favorite: !entry.favorite })}
        type="button"
      >
        {entry.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </button>
      <fieldset>
        <legend>Etiquetas</legend>
        {tags.length === 0 ? (
          <p>Nenhuma etiqueta criada.</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id}>
              <label>
                <input
                  checked={entry.tagIds.includes(tag.id)}
                  disabled={busy}
                  onChange={() =>
                    void organize({
                      tagIds: entry.tagIds.includes(tag.id)
                        ? entry.tagIds.filter((id) => id !== tag.id)
                        : [...entry.tagIds, tag.id],
                    })
                  }
                  type="checkbox"
                />{" "}
                {tag.name}
              </label>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => void rename(tag)}
                type="button"
              >
                Renomear
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => void remove(tag)}
                type="button"
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </fieldset>
      <form onSubmit={(event) => void create(event)}>
        <label className="form-field">
          Nova etiqueta
          <input name="tagName" required />
        </label>
        <button
          className="button button--secondary"
          disabled={busy}
          type="submit"
        >
          Criar e associar
        </button>
      </form>
    </section>
  );
}
