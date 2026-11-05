import { useEffect, useRef, useState } from "react";
import type { ImageFilesPort, PngArtifact } from "../../application/imageFiles";
import type { LocalPoster } from "../../application/media";
import type { EntertainmentEntry } from "../../domain/entertainment";
import { releaseDays } from "../../domain/entertainment";
import { importLocalImage } from "../../infrastructure/files/localImage";
import {
  BANNER_MODES,
  bannerModeLabels,
  createCinemaImage,
  defaultBannerMessage,
  type CinemaComposition,
} from "./cinemaImage";
export function CinemaComposer({
  entry,
  poster,
  files,
  today,
}: {
  readonly entry: EntertainmentEntry;
  readonly poster?: LocalPoster;
  readonly files?: ImageFilesPort;
  readonly today: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CinemaComposition["mode"]>(
    (releaseDays(entry.catalog?.releaseDate, today) ?? -1) >= 0
      ? "release"
      : "wishlist",
  );
  const [aspect, setAspect] = useState<CinemaComposition["aspect"]>("post");
  const [layout, setLayout] = useState<CinemaComposition["layout"]>("nocturne");
  const [message, setMessage] = useState<string>();
  const [background, setBackground] =
    useState<Awaited<ReturnType<typeof importLocalImage>>>();
  const [source, setSource] = useState<"poster" | "custom" | "engraving">(
    "poster",
  );
  const [generated, setGenerated] = useState<{
    key: string;
    image: PngArtifact;
  }>();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false),
    busyRef = useRef(false);
  const [importing, setImporting] = useState(false);
  const text = message ?? defaultBannerMessage(mode, entry, today);
  const selectedBackground =
    source === "custom" ? background : source === "poster" ? poster : undefined;
  const key = JSON.stringify([
    entry,
    today,
    mode,
    aspect,
    layout,
    text,
    selectedBackground,
  ]);
  const image = generated?.key === key ? generated.image : undefined;
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const back = (event: Event) => {
      event.preventDefault();
      if (!busyRef.current) {
        dialog.current?.close();
        setOpen(false);
        opener.current?.focus();
      }
    };
    window.addEventListener("biblioteca-viva:native-back", back);
    return () =>
      window.removeEventListener("biblioteca-viva:native-back", back);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = window.setTimeout(() => {
      const options: CinemaComposition = {
        mode,
        aspect,
        layout,
        message: text,
        today,
        background: selectedBackground,
      };
      setError("");
      void createCinemaImage(entry, options).then(
        (result) => {
          if (active) setGenerated({ key, image: result });
        },
        (failure) => {
          if (active)
            setError(
              failure instanceof Error
                ? failure.message
                : "Não foi possível compor a imagem.",
            );
        },
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    open,
    key,
    generation,
    entry,
    mode,
    aspect,
    layout,
    text,
    today,
    selectedBackground,
  ]);
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
    setError("");
    setFeedback("");
    try {
      if (!files) throw new Error("Entrega de imagens indisponível.");
      const result = await files[action](image);
      setFeedback(
        result === "cancelled"
          ? "Operação cancelada. O banner continua aqui."
          : result === "unavailable"
            ? "Compartilhamento indisponível. Use Salvar PNG."
            : action === "save"
              ? "Banner entregue ao salvamento."
              : "Menu de compartilhamento encerrado.",
      );
    } catch {
      setError(
        action === "save"
          ? "Não foi possível salvar. Confira o espaço disponível e tente novamente."
          : "Não foi possível compartilhar. Você pode salvar o PNG.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="cinema-share">
      <button
        ref={opener}
        className="button button--secondary"
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
          setFeedback("");
        }}
      >
        Criar banner cinematográfico
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="cinema-dialog"
          aria-labelledby="cinema-dialog-title"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <header className="cinema-dialog-heading">
            <div>
              <p className="cinema-kicker">Ateliê de cinema</p>
              <h2 id="cinema-dialog-title">Uma história para compartilhar</h2>
            </div>
            <button
              className="button button--secondary"
              type="button"
              disabled={busy}
              onClick={close}
            >
              Fechar compositor
            </button>
          </header>
          <div className="cinema-composer-grid">
            <div className="cinema-preview" aria-busy={!image && !error}>
              {image ? (
                <img
                  src={image.dataUrl}
                  width="1080"
                  height={aspect === "story" ? 1920 : 1350}
                  alt={`Prévia do banner de ${entry.title}: ${text}`}
                />
              ) : (
                <p role="status">
                  {error ? "Prévia indisponível" : "Compondo PNG…"}
                </p>
              )}
            </div>
            <div className="cinema-composer-controls">
              <fieldset className="cinema-choices" disabled={busy || importing}>
                <legend>O que compartilhar</legend>
                {BANNER_MODES.map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="banner-mode"
                      checked={mode === item}
                      onChange={() => {
                        setMode(item);
                        setMessage(undefined);
                        setFeedback("");
                      }}
                    />
                    {bannerModeLabels[item]}
                  </label>
                ))}
              </fieldset>
              <fieldset className="cinema-choices" disabled={busy || importing}>
                <legend>Proporção</legend>
                <label>
                  <input
                    type="radio"
                    name="aspect"
                    checked={aspect === "post"}
                    onChange={() => setAspect("post")}
                  />
                  Publicação · 4:5
                </label>
                <label>
                  <input
                    type="radio"
                    name="aspect"
                    checked={aspect === "story"}
                    onChange={() => setAspect("story")}
                  />
                  Story · 9:16
                </label>
              </fieldset>
              <fieldset className="cinema-choices" disabled={busy || importing}>
                <legend>Composição</legend>
                <label>
                  <input
                    type="radio"
                    name="layout"
                    checked={layout === "nocturne"}
                    onChange={() => setLayout("nocturne")}
                  />
                  Noturno editorial
                </label>
                <label>
                  <input
                    type="radio"
                    name="layout"
                    checked={layout === "premiere"}
                    onChange={() => setLayout("premiere")}
                  />
                  Estreia celestial
                </label>
              </fieldset>
              <fieldset className="cinema-choices" disabled={busy || importing}>
                <legend>Imagem de fundo</legend>
                <label>
                  <input
                    type="radio"
                    name="background"
                    checked={source === "poster"}
                    disabled={!poster}
                    onChange={() => setSource("poster")}
                  />
                  Poster da obra
                </label>
                <label>
                  <input
                    type="radio"
                    name="background"
                    checked={source === "engraving"}
                    onChange={() => setSource("engraving")}
                  />
                  Gravura do Códice
                </label>
                {background && (
                  <label>
                    <input
                      type="radio"
                      name="background"
                      checked={source === "custom"}
                      onChange={() => setSource("custom")}
                    />
                    Minha imagem
                  </label>
                )}
              </fieldset>
              <label className="form-field">
                Escolher fundo do dispositivo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={busy || importing}
                  onChange={(event) => {
                    void (async () => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      setImporting(true);
                      setGenerated(undefined);
                      setError("");
                      try {
                        setBackground(await importLocalImage(file));
                        setSource("custom");
                      } catch (failure) {
                        setError(
                          failure instanceof Error
                            ? failure.message
                            : "Imagem indisponível.",
                        );
                      } finally {
                        setImporting(false);
                      }
                    })();
                  }}
                />
              </label>
              <label className="form-field">
                Mensagem do banner
                <textarea
                  rows={3}
                  maxLength={280}
                  value={text}
                  disabled={busy}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setFeedback("");
                  }}
                />
              </label>
              <p className="cinema-privacy">
                Somente título, formato, dados deste modo e sua mensagem. Notas
                e citações ficam fora do banner.
              </p>
              {error && <p role="alert">{error}</p>}
              {feedback && <p role="status">{feedback}</p>}
              <div className="form-actions">
                <button
                  className="button button--primary"
                  type="button"
                  disabled={!image || busy || importing}
                  onClick={() => void deliver("share")}
                >
                  Compartilhar banner
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={!image || busy || importing}
                  onClick={() => void deliver("save")}
                >
                  Salvar PNG
                </button>
                {error && (
                  <button
                    className="text-button"
                    type="button"
                    disabled={busy}
                    onClick={() => setGeneration((v) => v + 1)}
                  >
                    Atualizar prévia
                  </button>
                )}
              </div>
              <small>1080 × {aspect === "story" ? "1920" : "1350"} · PNG</small>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
