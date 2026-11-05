import { useRef, useState } from "react";
import type { LocalPoster, PosterPort } from "../application/media";
import { importLocalImage } from "../infrastructure/files/localImage";
import "./record-cover.css";

/** Import is staged; only the explicit save mutates the local image port. */
export function RecordCoverEditor({
  entryId,
  images,
  cover,
  onSaved,
}: {
  entryId: string;
  images?: PosterPort;
  cover?: LocalPoster;
  onSaved: (image: LocalPoster | undefined) => void;
}) {
  const [draft, setDraft] = useState<{ image?: LocalPoster }>();
  const [busy, setBusy] = useState(false),
    lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const preview = draft ? draft.image : cover;
  async function save() {
    if (!images || !draft || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (draft.image) await images.save(draft.image);
      else await images.remove(entryId);
      onSaved(draft.image);
      setDraft(undefined);
      setMessage(draft.image ? "Capa salva." : "Capa removida.");
    } catch {
      setError("Não foi possível salvar a capa. Tente novamente.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!images) return null;
  return (
    <details
      className="bv-cover-editor"
      data-has-record-draft={Boolean(draft) || busy}
    >
      <summary>Capa da obra</summary>
      {preview && (
        <img
          src={preview.dataUrl}
          alt="Prévia da capa"
          width={preview.width}
          height={preview.height}
        />
      )}
      <label className="form-field">
        {cover ? "Substituir imagem" : "Escolher imagem do dispositivo"}
        <input
          type="file"
          accept="image/jpeg,image/png"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || lock.current) return;
            lock.current = true;
            setBusy(true);
            setError("");
            setMessage("");
            void importLocalImage(file)
              .then(
                (image) => setDraft({ image: { ...image, entryId } }),
                (failure) =>
                  setError(
                    failure instanceof Error
                      ? failure.message
                      : "Imagem indisponível.",
                  ),
              )
              .finally(() => {
                lock.current = false;
                setBusy(false);
              });
          }}
        />
      </label>
      <div className="form-actions">
        {preview && (
          <button
            className="text-button"
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft({});
              setMessage("");
            }}
          >
            Remover capa
          </button>
        )}
        {draft && (
          <>
            <button
              className="button button--primary"
              type="button"
              disabled={busy}
              onClick={() => void save()}
            >
              Salvar capa
            </button>
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(undefined);
                setError("");
              }}
            >
              Cancelar alteração
            </button>
          </>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </details>
  );
}
