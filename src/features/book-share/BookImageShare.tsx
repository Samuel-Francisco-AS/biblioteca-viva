import { useEffect, useMemo, useRef, useState } from "react";
import type { BookEntry, Quote } from "../../domain";
import type { ImageFilesPort, PngArtifact } from "../../application/imageFiles";
import { createBookImage } from "./bookImage";

export function BookImageShare({
  book,
  quotes,
  files,
}: {
  readonly book: BookEntry;
  readonly quotes: readonly Quote[];
  readonly files?: ImageFilesPort;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState("summary");
  const [excerpt, setExcerpt] = useState("");
  const [appliedExcerpt, setAppliedExcerpt] = useState("");
  const [image, setImage] = useState<PngArtifact>();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quote = quotes.find((item) => item.id === selection);

  const previewQuote = useMemo(
    () => (quote ? { ...quote, content: appliedExcerpt } : undefined),
    [quote, appliedExcerpt],
  );

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    function onNativeBack(event: Event) {
      event.preventDefault();
      if (busyRef.current) return;
      dialog.current?.close();
      setOpen(false);
      opener.current?.focus();
    }
    window.addEventListener("biblioteca-viva:native-back", onNativeBack);
    let active = true;
    void createBookImage(book, previewQuote).then(
      (result) => {
        if (active) setImage(result);
      },
      (failure: unknown) => {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : "Não foi possível gerar a imagem.",
          );
      },
    );
    return () => {
      active = false;
      window.removeEventListener("biblioteca-viva:native-back", onNativeBack);
    };
  }, [open, book, previewQuote]);

  function close() {
    if (busyRef.current) return;
    dialog.current?.close();
    setOpen(false);
    opener.current?.focus();
  }
  async function deliver(action: "save" | "share") {
    if (!image || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (!files)
        throw new Error("Entrega de imagem indisponível nesta plataforma.");
      const result = await files[action](image);
      setMessage(
        result === "cancelled"
          ? "Operação cancelada. Sua imagem continua disponível."
          : result === "unavailable"
            ? "Compartilhamento direto indisponível. Use Salvar imagem PNG."
            : action === "save"
              ? "Imagem entregue ao salvamento."
              : "Menu de compartilhamento encerrado.",
      );
    } catch {
      setError(
        action === "share"
          ? "Não foi possível compartilhar. Tente Salvar imagem PNG."
          : "Não foi possível salvar. A imagem continua disponível para tentar novamente.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <button
        ref={opener}
        className="button button--secondary"
        type="button"
        onClick={() => {
          setImage(undefined);
          setError("");
          setMessage("");
          setOpen(true);
        }}
      >
        Criar imagem da leitura
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="book-image-dialog"
          aria-labelledby="image-dialog-title"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div className="folio-dialog-heading">
            <div>
              <p className="folio-kicker">Uma página para levar</p>
              <h2 id="image-dialog-title">Compartilhar como imagem</h2>
            </div>
            <button
              className="button button--secondary"
              type="button"
              disabled={busy}
              onClick={close}
            >
              Fechar prévia
            </button>
          </div>
          <label className="form-field">
            Composição
            <select
              value={selection}
              disabled={busy}
              onChange={(event) => {
                setImage(undefined);
                setError("");
                setMessage("");
                setSelection(event.target.value);
                const selected = quotes.find(
                  (item) => item.id === event.target.value,
                );
                setExcerpt(selected?.content ?? "");
                setAppliedExcerpt(selected?.content ?? "");
              }}
            >
              <option value="summary">Resumo da leitura</option>
              {quotes.map((item, index) => (
                <option key={item.id} value={item.id}>
                  Citação {index + 1}
                  {item.location?.type === "book"
                    ? ` · p. ${item.location.page}`
                    : ""}{" "}
                  · {item.content.slice(0, 55)}
                </option>
              ))}
            </select>
          </label>
          {quote && (
            <details className="folio-excerpt">
              <summary>Ajustar trecho para a imagem</summary>
              <label className="form-field">
                Trecho para a imagem
                <textarea
                  rows={4}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  disabled={busy}
                />
              </label>
              <p className="folio-hint">
                Ajuste somente esta imagem. A citação salva permanece inteira no
                livro.
              </p>
              <button
                className="button button--secondary"
                type="button"
                disabled={busy || !excerpt.trim() || excerpt === appliedExcerpt}
                onClick={() => {
                  setImage(undefined);
                  setError("");
                  setMessage("");
                  setAppliedExcerpt(excerpt.trim());
                }}
              >
                Atualizar prévia
              </button>
            </details>
          )}
          <p className="folio-hint">
            Apenas o resumo ou a citação escolhida. Suas notas pessoais ficam no
            livro.
          </p>
          {image ? (
            <img
              className="book-image-preview"
              src={image.dataUrl}
              width="1080"
              height="1350"
              alt={
                quote
                  ? `Prévia da citação: ${appliedExcerpt}. ${book.title}, ${book.author ?? "autor não informado"}${quote.location?.type === "book" ? `, página ${quote.location.page}` : ""}.`
                  : `Prévia do resumo de ${book.title}: ${book.currentPage} de ${book.totalPages ?? "total não informado"} páginas.`
              }
            />
          ) : (
            !error && <p role="status">Compondo imagem PNG…</p>
          )}
          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
          <div className="folio-image-actions">
            <button
              className="button button--primary"
              type="button"
              disabled={!image || busy}
              onClick={() => void deliver("share")}
            >
              Compartilhar imagem
            </button>
            <button
              className="button button--secondary"
              type="button"
              disabled={!image || busy}
              onClick={() => void deliver("save")}
            >
              Salvar imagem PNG
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
