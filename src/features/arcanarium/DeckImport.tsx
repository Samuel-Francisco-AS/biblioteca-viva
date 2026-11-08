import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ExchangeData } from "../../application/cardExchange";
import { MAX_EXCHANGE_BYTES } from "../../application/cardExchange";
import { ArcanaCard } from "./ArcanaCard";
import { cardTitle } from "./presentation";
import { arcanaError, deckPath, useArcana } from "./context";
export function DeckImport() {
  const { app, reload } = useArcana();
  const navigate = useNavigate();
  const [file, setFile] = useState<{ content: string; data: ExchangeData }>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [committed, setCommitted] = useState(false);
  return (
    <>
      <Link to="/arcanario/baralhos">← Voltar aos baralhos</Link>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">Uma coleção que atravessa páginas</p>
          <h2>Importar baralho autoral</h2>
          <p>
            Arquivo local v1, até 500 cartas e 10 MiB. Conferimos o conteúdo e a
            integridade antes de gravar.
          </p>
        </div>
      </div>
      <div className="arcana-panel">
        <label>
          Arquivo de baralho (.json)
          <input
            disabled={busy || committed}
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const chosen = e.target.files?.[0];
              e.target.value = "";
              if (!chosen) return;
              setError("");
              setFile(undefined);
              if (chosen.size > MAX_EXCHANGE_BYTES) {
                setError("O baralho excede 10 MiB.");
                return;
              }
              setBusy(true);
              void chosen
                .text()
                .then(async (content) => {
                  const data = await app.cardExchange.inspect(content);
                  setFile({ content, data });
                })
                .catch((e) => setError(arcanaError(e)))
                .finally(() => setBusy(false));
            }}
          />
        </label>
        <p>
          Importar cria novas identidades para o baralho, cartas e imagens. Seu
          histórico local, Estudos e outras coleções permanecem intactos.
          Importar novamente cria outra cópia.
        </p>
        <p>
          Vínculos com registros e respostas pessoais não são transportados. As
          cartas compartilhadas com outros baralhos são copiadas integralmente
          nesta coleção, sem referências quebradas.
        </p>
        {error && (
          <p role="alert" className="arcana-error">
            {error}
          </p>
        )}
        {busy && <p role="status">Conferindo ou guardando o arquivo…</p>}
      </div>
      {file && (
        <>
          <div className="arcana-heading">
            <div>
              <p className="arcana-eyebrow">
                Prévia conferida · nenhuma escrita até confirmar
              </p>
              <h3>{file.data.name}</h3>
              <p>
                {file.data.cards.length} cartas · {file.data.media.length}{" "}
                imagens locais
              </p>
            </div>
            <button
              className="button button--primary"
              disabled={busy || committed}
              onClick={() => {
                setBusy(true);
                setError("");
                void app.cardExchange
                  .importCopy(file.content)
                  .then(async (deck) => {
                    setCommitted(true);
                    await reload();
                    void navigate(deckPath(deck.id));
                  })
                  .catch((e) => setError(arcanaError(e)))
                  .finally(() => setBusy(false));
              }}
            >
              {committed ? "Cópia importada" : "Importar como nova cópia"}
            </button>
          </div>
          <div className="arcana-grid">
            {file.data.cards.slice(0, 12).map((c) => (
              <div key={c.id}>
                <ArcanaCard
                  compact
                  content={c.content}
                  image={
                    file.data.media.find((m) => m.cardId === c.id)?.dataUrl
                  }
                />
                <p>{cardTitle(c.content)}</p>
              </div>
            ))}
          </div>
          {file.data.cards.length > 12 && (
            <p>
              A prévia mostra as primeiras 12 cartas; todas as{" "}
              {file.data.cards.length} foram validadas.
            </p>
          )}
        </>
      )}
    </>
  );
}
