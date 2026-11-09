import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { PackCatalogueEntry } from "../../application/packCatalogue";
import { PackError } from "../../application/educationalPacks";
import type { PackManifest, PackReceipt } from "../../domain/packManifest";
import { ArcanaSeal } from "./ArcanaArt";
import { useArcana, arcanaError } from "./context";
const bytes = (n: number) =>
  n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KiB`;
function packState(m: PackManifest, r?: PackReceipt) {
  if (m.category === "reference") return "Indisponível · referência oficial";
  if (!r) return "Disponível para instalar";
  if (r.status === "removed") return "Desinstalado";
  if (r.status === "restore-required") return "Reinstalação necessária";
  if (m.editorialVersion > r.manifest.editorialVersion)
    return "Atualização disponível";
  return r.items.length < m.publishedCount
    ? "Parcialmente instalado"
    : "Instalado";
}
export function PackLibrary() {
  const { app, data, reload } = useArcana();
  const [catalogue, setCatalogue] = useState<PackCatalogueEntry[]>([]),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(""),
    [preview, setPreview] = useState<{
      content: string;
      manifest: PackManifest;
      count: number;
    }>();
  const [errorKind, setErrorKind] = useState("");
  const status = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    let active = true;
    void app.packCatalogue
      .list()
      .then((c) => {
        if (active) setCatalogue(c);
      })
      .catch((e) => {
        if (active) setError(arcanaError(e));
      });
    return () => {
      active = false;
    };
  }, [app]);
  const act = async (id: string, work: () => Promise<string>) => {
    if (busy) return;
    setBusy(id);
    setError("");
    setErrorKind("");
    setMessage("");
    try {
      setMessage(await work());
      await reload();
      status.current?.focus();
    } catch (e) {
      setErrorKind(
        e instanceof PackError
          ? e.code === "INCOMPATIBLE"
            ? "Incompatível"
            : e.code === "INTEGRITY"
              ? "Problema de integridade"
              : "Inválido"
          : "Erro recuperável",
      );
      setError(e instanceof PackError ? e.message : arcanaError(e));
    } finally {
      setBusy("");
    }
  };
  const receipts = data.packs ?? [];
  const entries = [
    ...catalogue,
    ...receipts
      .filter((r) => !catalogue.some((c) => c.manifest.id === r.id))
      .map((r) => ({ manifest: r.manifest, editions: [] })),
  ];
  return (
    <>
      <div className="arcana-heading arcana-pack-heading">
        <div>
          <p className="arcana-eyebrow">
            Grimórios de estudo · arquivo expansível
          </p>
          <h2>Biblioteca de Provas</h2>
          <p>
            Abra um volume. Acrescente conhecimentos. A memória das suas
            Provações permanece com você.
          </p>
        </div>
        <ArcanaSeal kind="workshop" />
      </div>
      <p className="arcana-panel">
        Catálogo local, sem conta ou servidor. Pacotes instalados funcionam
        offline no aplicativo. Uma seleção parcial não representa a prova
        completa. Referências oficiais aguardam permissão editorial; a
        demonstração contém exercícios originais.
      </p>
      <p
        ref={status}
        tabIndex={-1}
        role="status"
        className="arcana-pack-feedback"
      >
        {busy
          ? "Operação em andamento · conferindo e guardando o volume…"
          : message}
      </p>
      {error && (
        <div role="alert" className="arcana-error">
          <strong>{errorKind || "Erro recuperável"}</strong>
          <p>{error}</p>
          <p>
            Nenhuma instalação incompleta é mantida. Tente novamente pelo mesmo
            botão ou escolha outro arquivo.
          </p>
        </div>
      )}
      {!entries.length && (
        <p>
          O catálogo está vazio. Importe um pacote local ou reabra esta sala.
        </p>
      )}
      <div className="arcana-pack-shelf">
        {entries.map((entry) => {
          const m = entry.manifest,
            r = receipts.find((p) => p.id === m.id),
            installed = r?.status === "installed" ? r.items.length : 0;
          const selectedEdition = r ? entry.editions.at(-1) : entry.editions[0];
          const install = async (version: number) => {
            const raw = await app.packCatalogue.load(m.id, version);
            const result = await app.educationalPacks.install(raw, "bundled");
            return `${m.name}: ${result.receipt.items.length} questões disponíveis. ${result.written} revisões gravadas.`;
          };
          return (
            <article
              className={`arcana-pack-volume ${m.category === "reference" ? "arcana-pack-volume--reference" : ""}`}
              key={m.id}
              aria-label={m.name}
            >
              <div className="arcana-pack-seal" aria-hidden="true">
                {m.category === "reference" ? "◇" : "✦"}
              </div>
              <p className="arcana-eyebrow">
                {m.category === "reference"
                  ? "Referência oficial · sem enunciados"
                  : m.category === "author-demo"
                    ? "Demonstração autoral · original"
                    : "Reprodução oficial · origem declarada"}
              </p>
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <p className="arcana-pack-state">{packState(m, r)}</p>
              <dl className="arcana-pack-metadata">
                <div>
                  <dt>Instituição</dt>
                  <dd>{m.institution}</dd>
                </div>
                <div>
                  <dt>Edição e caderno</dt>
                  <dd>
                    {m.year} · {m.application} · {m.booklet} · {m.language}
                  </dd>
                </div>
                <div>
                  <dt>Conhecimentos</dt>
                  <dd>{m.areas.join(" · ")}</dd>
                </div>
                <div>
                  <dt>Contagem</dt>
                  <dd>
                    {installed} instaladas · {m.publishedCount} publicadas de{" "}
                    {m.expectedCount} previstas para esta coleção
                  </dd>
                </div>
                <div>
                  <dt>Completude</dt>
                  <dd>
                    {m.completeness === "complete"
                      ? "Coleção completa"
                      : m.completeness === "partial"
                        ? "Seleção parcial; prova de origem pode ser maior"
                        : "Somente referência; nenhum exercício incluído"}
                  </dd>
                </div>
                <div>
                  <dt>Versão editorial conhecida</dt>
                  <dd>
                    {m.editorialVersion}
                    {r
                      ? ` · registro local ${r.manifest.editorialVersion}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt>Arquivos dos lotes</dt>
                  <dd>
                    {bytes(m.lots.reduce((n, l) => n + l.bytes, 0))} publicados
                    ·{" "}
                    {bytes(
                      r?.installedLots.reduce((n, l) => n + l.bytes, 0) ?? 0,
                    )}{" "}
                    registrados localmente
                  </dd>
                </div>
              </dl>
              <details>
                <summary>Procedência, direitos e lotes</summary>
                <p>{m.rights.basis}</p>
                <p>
                  Verificação editorial registrada:{" "}
                  {new Date(m.verifiedAt).toLocaleDateString("pt-BR")}.
                </p>
                <p>
                  {r?.assurance === "self-declared"
                    ? "Arquivo externo: origem e licença autodeclaradas; checksum não autentica a instituição."
                    : "Catálogo distribuído com o aplicativo. Integridade não substitui revisão de direitos."}
                </p>
                <ul>
                  {m.sources.map((u, i) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer">
                        Fonte {i + 1} · {m.institution}
                      </a>
                    </li>
                  ))}
                </ul>
                <ul>
                  {m.lots.map((l) => (
                    <li key={l.id}>
                      {l.id} · {l.count} questões · {bytes(l.bytes)} · SHA-256{" "}
                      <code className="arcana-pack-hash">{l.sha256}</code>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="arcana-actions">
                {selectedEdition && (
                  <button
                    className="button button--primary"
                    disabled={!!busy}
                    onClick={() =>
                      void act(m.id, () => install(selectedEdition.version))
                    }
                  >
                    {!r
                      ? "Instalar lote 1"
                      : r.status === "removed" ||
                          r.status === "restore-required"
                        ? "Reinstalar pacote"
                        : m.editorialVersion > r.manifest.editorialVersion
                          ? "Atualizar · instalar lote adicional"
                          : "Verificar e reinstalar"}
                  </button>
                )}
                {r?.status === "installed" && (
                  <>
                    <Link
                      to={`/arcanario/acervo?pacote=${encodeURIComponent(m.id)}`}
                    >
                      Abrir coleção no Acervo
                    </Link>
                    <Link
                      className="button button--secondary"
                      to={`/arcanario/provacoes?pacote=${encodeURIComponent(m.id)}`}
                    >
                      Preparar Provação
                    </Link>
                    <button
                      disabled={!!busy}
                      onClick={() =>
                        void act(m.id, async () => {
                          const i = await app.educationalPacks.integrity(m.id);
                          return `${i.missing} revisões ausentes · ${i.corrupt} divergentes · ${i.retainedVersions} revisões retidas. Bytes lógicos de conteúdo: ${bytes(new TextEncoder().encode(JSON.stringify(data.versions.filter((v) => (v.card.origin.kind === "official" || v.card.origin.kind === "imported") && v.card.origin.packId === m.id))).byteLength)}. Não mede overhead do IndexedDB.`;
                        })
                      }
                    >
                      Conferir integridade e espaço
                    </button>
                    <button
                      className="arcana-danger"
                      disabled={!!busy}
                      onClick={() =>
                        void act(m.id, async () => {
                          await app.educationalPacks.remove(m.id);
                          return "Pacote removido das novas seleções. Revisões, respostas e resultados preservados; espaço histórico retido.";
                        })
                      }
                    >
                      Remover pacote
                    </button>
                  </>
                )}
                {r && r.status !== "installed" && (
                  <p>
                    Histórico preservado.{" "}
                    {entry.editions.length
                      ? "Reinstale para disponibilizar novas sessões."
                      : "Selecione novamente o arquivo original abaixo para reinstalar."}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <section className="arcana-panel arcana-pack-import">
        <h3>Trazer um volume de arquivo</h3>
        <p>
          Pacote educacional JSON v1, até 10 MiB; somente questões textuais.
          Este formato preserva identidades e difere da troca autoral de Ecos.
        </p>
        <label>
          Arquivo de pacote (.json)
          <input
            type="file"
            accept="application/json,.json"
            disabled={!!busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setPreview(undefined);
              if (file.size > 10 * 1024 * 1024) {
                setErrorKind("Inválido");
                setError("O pacote excede 10 MiB.");
                return;
              }
              void act("import", async () => {
                const content = await file.text();
                const valid = await app.educationalPacks.inspect(content);
                setPreview({
                  content,
                  manifest: valid.manifest,
                  count: valid.lots.reduce(
                    (n, l) =>
                      n +
                      new Set(
                        l.lot.questions.map((q) => JSON.stringify(q.identity)),
                      ).size,
                    0,
                  ),
                });
                return "Arquivo validado. Confira a origem e a licença declaradas antes de instalar.";
              });
            }}
          />
        </label>
        {preview && (
          <div className="arcana-pack-preview">
            <h4>{preview.manifest.name}</h4>
            <p>
              {preview.count} questões neste arquivo ·{" "}
              {preview.manifest.publishedCount} publicadas no manifesto · edição{" "}
              {preview.manifest.editorialVersion}
            </p>
            <p>
              Origem e direitos autodeclarados pelo arquivo:{" "}
              {preview.manifest.rights.basis}
            </p>
            <p>
              Hashes conferem os bytes com o manifesto recebido; não comprovam
              autenticidade editorial.
            </p>
            <button
              disabled={!!busy}
              onClick={() =>
                void act(preview.manifest.id, async () => {
                  const result = await app.educationalPacks.install(
                    preview.content,
                  );
                  setPreview(undefined);
                  return `Pacote importado: ${result.receipt.items.length} questões, ${result.written} novas revisões. Nenhuma resposta substituída.`;
                })
              }
            >
              Instalar arquivo conferido
            </button>
            <button disabled={!!busy} onClick={() => setPreview(undefined)}>
              Descartar prévia
            </button>
          </div>
        )}
      </section>
    </>
  );
}
