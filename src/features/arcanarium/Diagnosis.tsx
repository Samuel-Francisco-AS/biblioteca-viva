import { z } from "zod";
import { useState } from "react";
import { Link } from "react-router-dom";
import { learningReport, reportCSV } from "../../domain/provations";
import { arcanaError, cardPath, useArcana } from "./context";
import { trialPath, statusNames, levelNames } from "./presentation";
import { cardTitle } from "./presentation";
export function Diagnosis() {
  const { app, data } = useArcana();
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const invalid =
    (!!from && !z.iso.date().safeParse(from).success) ||
    (!!to && !z.iso.date().safeParse(to).success) ||
    (!!from && !!to && from > to);
  const period =
    from || to
      ? {
          from: from ? `${from}T00:00:00.000Z` : "0001-01-01T00:00:00.000Z",
          to: to ? `${to}T23:59:59.999Z` : "9999-12-31T23:59:59.999Z",
        }
      : undefined;
  const report = learningReport(
    data,
    new Date().toISOString(),
    invalid ? undefined : period,
  );
  const exportReport = async (format: "json" | "csv") => {
    if (busy || invalid) return;
    setBusy(true);
    setError("");
    try {
      const current = await app.provations.report(period);
      const result = await app.saveLearningReport(
        format === "json"
          ? JSON.stringify(current, null, 2)
          : reportCSV(current),
        format,
      );
      setMessage(
        result === "cancelled"
          ? "Exportação cancelada."
          : "Relatório preparado no destino escolhido. Nenhum resultado foi enviado automaticamente.",
      );
    } catch (e) {
      setError(arcanaError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="arcana-heading">
        <div>
          <p className="arcana-eyebrow">O espelho do aprendizado</p>
          <h2>Diagnóstico e relatórios</h2>
          <p>Um retrato descritivo das suas respostas, com limites à vista.</p>
        </div>
      </div>
      <Link to="/arcanario/provacoes">← Provações</Link>
      <div className="arcana-panel">
        <h3>Período das respostas (UTC)</h3>
        <label>
          De (AAAA-MM-DD)
          <input
            type="text"
            inputMode="numeric"
            placeholder="AAAA-MM-DD"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Até (AAAA-MM-DD)
          <input
            type="text"
            inputMode="numeric"
            placeholder="AAAA-MM-DD"
            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <p>Deixe vazio para consultar todo o histórico.</p>
        <div className="arcana-actions">
          <button
            disabled={busy || invalid}
            onClick={() => void exportReport("json")}
          >
            Exportar relatório JSON v1
          </button>
          <button
            disabled={busy || invalid}
            onClick={() => void exportReport("csv")}
          >
            Exportar assuntos CSV
          </button>
        </div>
        <p>
          O JSON inclui sessões, tentativas, revisões e classificações
          históricas. O CSV resume classificações. São relatórios educacionais,
          separados do backup pessoal.
        </p>
      </div>
      {invalid && (
        <p role="alert">
          Informe datas válidas em AAAA-MM-DD, com o início antes do fim.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <dl className="arcana-score">
        {[
          ["Tentativas", report.summary.attempts],
          ["Questões distintas", report.summary.distinct],
          ["Repetições", report.summary.repetitions],
          ["Acertos", report.summary.correct],
          ["Erros", report.summary.incorrect],
          [
            "Acertos observados",
            report.summary.accuracy === null
              ? "Sem respostas"
              : `${report.summary.accuracy}%`,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className="arcana-panel">
        <h3>Orientações baseadas no histórico</h3>
        {!report.summary.attempts && (
          <p>
            Ainda não há respostas confirmadas. Não há evidência para um
            diagnóstico.
          </p>
        )}
        <ul className="arcana-list">
          {report.subjects
            .filter((s) =>
              ["subject", "subsubject"].includes(s.classification.level),
            )
            .map((s) => (
              <li key={`${s.classification.id}:${s.classification.revision}`}>
                <strong>
                  {s.classification.label} · revisão {s.classification.revision}
                </strong>
                <p>
                  {s.distinct} questões distintas · {s.attempts} tentativas ·{" "}
                  {s.repetitions} repetições · {s.incorrect} erros ·{" "}
                  {s.accuracy}% de acertos observados.
                </p>
                <p>
                  {s.incorrect
                    ? `Revisite este assunto: ${s.incorrect} de ${s.attempts} respostas tiveram erro.`
                    : "Nenhum erro observado neste recorte."}{" "}
                  {s.distinct < 5
                    ? "Pouco exercitado: evidência insuficiente; procure questões diferentes."
                    : "Observações disponíveis; não certificam domínio."}
                </p>
                <p>Tendência: {s.trend}.</p>
              </li>
            ))}
        </ul>
        {report.unexercised.length > 0 && (
          <>
            <h4>Conteúdos sem respostas no período</h4>
            <p>
              {report.unexercised.map((t) => t.label).join(" · ")}. Experimente
              questões desses conteúdos para começar a reunir evidências.
            </p>
          </>
        )}
      </section>
      <section className="arcana-panel">
        <h3>Distribuição por classificações</h3>
        <p>
          Uma tentativa pode pertencer a vários ramos; o total acima conta cada
          tentativa uma vez. Rótulos e revisões abaixo são os apresentados na
          sessão.
        </p>
        <div className="arcana-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Classificação histórica</th>
                <th>Distintas</th>
                <th>Tentativas</th>
                <th>Acertos</th>
                <th>Erros</th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((s) => (
                <tr key={JSON.stringify(s.classification)}>
                  <th>
                    {s.classification.label} ·{" "}
                    {levelNames[s.classification.level]} · r
                    {s.classification.revision}
                  </th>
                  <td>{s.distinct}</td>
                  <td>{s.attempts}</td>
                  <td>{s.correct}</td>
                  <td>{s.incorrect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Diversidade observada:{" "}
          {
            new Set(
              report.subjects
                .filter((s) =>
                  ["subject", "subsubject"].includes(s.classification.level),
                )
                .map((s) => s.classification.id),
            ).size
          }{" "}
          assuntos e{" "}
          {
            new Set(
              report.subjects
                .filter((s) => s.classification.level === "skill")
                .map((s) => s.classification.id),
            ).size
          }{" "}
          habilidades.
        </p>
      </section>
      <section className="arcana-panel">
        <h3>Questões e tentativas</h3>
        {report.questions.map((q) => {
          const card = data.cards.find((c) => c.id === q.cardId);
          return (
            <details key={q.cardId}>
              <summary>
                {card ? cardTitle(card.content) : "Questão preservada"} ·{" "}
                {q.attempts} tentativas · {q.incorrect} erros
                {q.incorrect ? " · merece revisão" : ""}
              </summary>
              <Link to={cardPath(q.cardId)}>Conferir questão e versões</Link>
              <ul>
                {q.history.map((a, i) => (
                  <li key={`${a.sessionId}:${i}`}>
                    <Link to={trialPath(a.sessionId)}>
                      {a.correct ? "Correta" : "Incorreta"} · revisão{" "}
                      {a.revision} ·{" "}
                      {new Date(a.answeredAt).toLocaleString("pt-BR")}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>
      <section className="arcana-panel">
        <h3>Provações no período</h3>
        <p>
          As sessões listadas intersectam o período; estas contagens são da
          sessão inteira. Os totais e assuntos acima usam as respostas do
          período.
        </p>
        <ul>
          {report.sessions.map((s) => (
            <li key={s.id}>
              <Link to={trialPath(s.id)}>
                {statusNames[s.status]} · {s.answered}/{s.presented} respondidas
                · {s.correct} corretas · {s.unanswered} não respondidas
              </Link>
            </li>
          ))}
        </ul>
        <h3>Limitações do método</h3>
        <ul>
          {report.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
