import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ImageFilesPort, PngArtifact } from "../../application/imageFiles";
import type { LocalPoster } from "../../application/media";
import { importLocalImage } from "../../infrastructure/files/localImage";
import { BVSelectSheet } from "../../ui/BVPicker";
import { BVChoiceGroup } from "../../ui/BVChoiceGroup";
import {
  imageHeight,
  type CompositionStyle,
  type ShareComposition,
} from "./composition";
import "./share-composer.css";
export interface ShareMode {
  readonly id: string;
  readonly label: string;
  readonly text?: string;
  readonly message?: string;
}
interface Labels {
  readonly open: string;
  readonly close: string;
  readonly share: string;
  readonly save: string;
  readonly message: string;
}
export function BVShareComposer({
  title,
  modes,
  initialMode,
  poster,
  files,
  renderImage,
  labels,
  contentKey,
  book = false,
}: {
  contentKey: string;
  title: string;
  modes: readonly ShareMode[];
  initialMode?: string;
  poster?: LocalPoster;
  files?: ImageFilesPort;
  renderImage: (options: ShareComposition) => Promise<PngArtifact>;
  labels: Labels;
  book?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  const dialogTitle = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(initialMode ?? modes[0]?.id ?? "");
  const preset = modes.find((item) => item.id === mode) ?? modes[0];
  const [editedTitle, setEditedTitle] = useState<string>();
  const [text, setText] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [aspect, setAspect] = useState<CompositionStyle["aspect"]>("post");
  const [layout, setLayout] = useState<CompositionStyle["layout"]>(
    book ? "folio" : "nocturne",
  );
  const [frame, setFrame] = useState<CompositionStyle["frame"]>("copper");
  const [alignment, setAlignment] = useState<CompositionStyle["alignment"]>();
  const [position, setPosition] =
    useState<CompositionStyle["position"]>("lower");
  const [showRating, setShowRating] = useState(true);
  const [darkness, setDarkness] = useState(0.25);
  const [background, setBackground] =
    useState<Awaited<ReturnType<typeof importLocalImage>>>();
  const [source, setSource] = useState("poster");
  const [generated, setGenerated] = useState<{
    key: string;
    image: PngArtifact;
  }>();
  const [importError, setImportError] = useState("");
  const [error, setError] = useState(""),
    [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false),
    busyRef = useRef(false);
  const [importing, setImporting] = useState(false),
    importLock = useRef(false);
  const [generation, setGeneration] = useState(0);
  const selectedBackground =
    source === "custom" ? background : source === "poster" ? poster : undefined;
  const options: ShareComposition = useMemo(
    () => ({
      showRating,
      mode,
      aspect,
      layout,
      frame,
      alignment,
      position,
      darkness,
      title: editedTitle ?? title,
      text: text ?? preset?.text ?? "",
      message: message ?? preset?.message ?? "",
      background: selectedBackground,
    }),
    [
      showRating,
      mode,
      aspect,
      layout,
      frame,
      alignment,
      position,
      darkness,
      editedTitle,
      title,
      text,
      preset,
      message,
      selectedBackground,
    ],
  );
  // Include current content and image source: delivery can never reuse a stale preview.
  const key = JSON.stringify([options, contentKey]);
  const image =
    generated?.key === key && !importing ? generated.image : undefined;
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    node?.showModal();
    const back = (event: Event) => {
      if (Array.from(document.querySelectorAll("dialog[open]")).at(-1) !== node)
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!busyRef.current && !importLock.current) {
        node?.close();
        setOpen(false);
        opener.current?.focus();
      }
    };
    window.addEventListener("biblioteca-viva:native-back", back, true);
    return () =>
      window.removeEventListener("biblioteca-viva:native-back", back, true);
  }, [open]);
  useEffect(() => {
    if (!open || importing) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setError("");
      void renderImage(options).then(
        (result) => {
          if (active) setGenerated({ key, image: result });
        },
        (failure) => {
          if (active)
            setError(
              failure instanceof Error
                ? failure.message
                : "Não foi possível compor o PNG.",
            );
        },
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, key, generation, renderImage, importing, options]);
  function close() {
    if (busyRef.current || importLock.current) return;
    dialog.current?.close();
    setOpen(false);
    opener.current?.focus();
  }
  async function deliver(action: "save" | "share") {
    if (!image || busyRef.current || importLock.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      if (!files) throw new Error("Entrega indisponível");
      const result = await files[action](image);
      setFeedback(
        result === "cancelled"
          ? "Operação cancelada. A imagem continua aqui."
          : result === "unavailable"
            ? `Compartilhamento indisponível. Use ${labels.save}.`
            : action === "save"
              ? "Imagem entregue ao salvamento."
              : "Menu de compartilhamento encerrado.",
      );
    } catch {
      setError(
        action === "share"
          ? `Não foi possível compartilhar. Tente ${labels.save}.`
          : "Não foi possível salvar. Confira o espaço disponível e tente novamente.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const blocked = busy || importing;
  return (
    <div className="bv-share">
      <button
        ref={opener}
        type="button"
        className="button button--secondary"
        onClick={() => {
          setOpen(true);
          setError("");
          setFeedback("");
        }}
      >
        {labels.open}
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="bv-share-dialog"
          aria-labelledby={dialogTitle}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <header className="bv-share-heading">
            <div>
              <p>✧ Ateliê do Códice</p>
              <h2 id={dialogTitle}>
                {book
                  ? "Compartilhar como imagem"
                  : "Uma história para compartilhar"}
              </h2>
            </div>
            <button
              type="button"
              className="button button--secondary"
              disabled={blocked}
              onClick={close}
            >
              {labels.close}
            </button>
          </header>
          <div className="bv-share-grid">
            <div className="bv-share-preview" aria-busy={!image && !error}>
              {image ? (
                <img
                  src={image.dataUrl}
                  width={1080}
                  height={imageHeight(aspect)}
                  alt={`Prévia ${book ? "da leitura" : "do banner"} de ${options.title}: ${options.text} ${options.message}`}
                />
              ) : (
                <p role="status">
                  {error ? "Prévia indisponível" : "Compondo PNG…"}
                </p>
              )}
            </div>
            <div className="bv-share-controls">
              <fieldset disabled={blocked} className="bv-share-fields">
                {book ? (
                  <label className="form-field">
                    Composição
                    <BVSelectSheet
                      value={mode}
                      onChange={(e) => {
                        setMode(e.target.value);
                        setText(undefined);
                        setMessage(undefined);
                      }}
                    >
                      {modes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </BVSelectSheet>
                  </label>
                ) : (
                  <BVChoiceGroup
                    label="O que compartilhar"
                    value={mode}
                    options={modes.map((item) => ({
                      value: item.id,
                      label: item.label,
                    }))}
                    onChange={(value) => {
                      setMode(value);
                      setMessage(undefined);
                    }}
                  />
                )}
                <BVChoiceGroup
                  label="Proporção"
                  value={aspect}
                  options={[
                    { value: "post", label: "Publicação · 4:5" },
                    { value: "story", label: "Story · 9:16" },
                    { value: "square", label: "Quadrado · 1:1" },
                  ]}
                  onChange={setAspect}
                />
                <label className="form-field">
                  Título na imagem
                  <input
                    value={options.title}
                    maxLength={220}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </label>
                {book && mode !== "summary" && (
                  <label className="form-field">
                    Trecho para a imagem
                    <textarea
                      rows={4}
                      value={options.text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </label>
                )}
                <label className="form-field">
                  {labels.message}
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={options.message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setFeedback("");
                    }}
                  />
                </label>
                <details>
                  <summary>Imagem e acabamento</summary>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={showRating}
                      onChange={(event) => setShowRating(event.target.checked)}
                    />
                    Incluir avaliação, quando houver
                  </label>
                  <BVChoiceGroup
                    label="Composição visual"
                    value={layout}
                    options={[
                      { value: "nocturne", label: "Noturno editorial" },
                      { value: "premiere", label: "Estreia celestial" },
                      { value: "folio", label: "Fólio de marfim" },
                    ]}
                    onChange={setLayout}
                  />
                  <BVChoiceGroup
                    label="Moldura"
                    value={frame ?? "copper"}
                    options={[
                      { value: "copper", label: "Cobre gravado" },
                      { value: "lunar", label: "Selo lunar" },
                      { value: "none", label: "Sem moldura" },
                    ]}
                    onChange={setFrame}
                  />
                  <BVChoiceGroup
                    label="Alinhamento"
                    value={
                      alignment ?? (layout === "premiere" ? "center" : "left")
                    }
                    options={[
                      { value: "left", label: "À esquerda" },
                      { value: "center", label: "Ao centro" },
                      { value: "right", label: "À direita" },
                    ]}
                    onChange={setAlignment}
                  />
                  <BVChoiceGroup
                    label="Posição do texto"
                    value={position ?? "lower"}
                    options={[
                      { value: "middle", label: "Central" },
                      { value: "lower", label: "Inferior" },
                    ]}
                    onChange={setPosition}
                  />
                  <BVChoiceGroup
                    label="Imagem de fundo"
                    value={source}
                    options={[
                      {
                        value: "poster",
                        label: book ? "Capa do livro" : "Poster da obra",
                        disabled: !poster,
                      },
                      { value: "engraving", label: "Gravura do Códice" },
                      ...(background
                        ? [{ value: "custom", label: "Minha imagem" }]
                        : []),
                    ]}
                    onChange={setSource}
                  />
                  <label className="form-field">
                    Escolher fundo do dispositivo
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file || importLock.current) return;
                        importLock.current = true;
                        setImporting(true);
                        setImportError("");
                        void importLocalImage(file)
                          .then(
                            (value) => {
                              setBackground(value);
                              setSource("custom");
                            },
                            (failure) =>
                              setImportError(
                                failure instanceof Error
                                  ? failure.message
                                  : "Imagem indisponível.",
                              ),
                          )
                          .finally(() => {
                            importLock.current = false;
                            setImporting(false);
                          });
                      }}
                    />
                  </label>
                  <label className="form-field">
                    Escurecimento do fundo
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={Math.round(darkness * 100)}
                      onChange={(e) =>
                        setDarkness(Number(e.target.value) / 100)
                      }
                    />
                  </label>
                </details>
              </fieldset>
              <p className="bv-share-privacy">
                {book
                  ? "Só a composição escolhida. Suas notas ficam no livro."
                  : "Somente dados deste modo e sua mensagem. Notas e citações ficam fora do banner."}
              </p>
              {(error || importError) && (
                <p role="alert">{error || importError}</p>
              )}
              {feedback && <p role="status">{feedback}</p>}
              <div className="form-actions">
                <button
                  type="button"
                  className="button button--primary"
                  disabled={!image || blocked}
                  onClick={() => void deliver("share")}
                >
                  {labels.share}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!image || blocked}
                  onClick={() => void deliver("save")}
                >
                  {labels.save}
                </button>
                {error && (
                  <button
                    type="button"
                    className="text-button"
                    disabled={blocked}
                    onClick={() => setGeneration((value) => value + 1)}
                  >
                    Atualizar prévia
                  </button>
                )}
              </div>
              <small>1080 × {imageHeight(aspect)} · PNG</small>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
