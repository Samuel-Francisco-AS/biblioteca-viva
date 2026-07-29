import { useState } from "react";

import type {
  ApplicationDiagnostics,
  ApplicationDiagnosticsSnapshot,
} from "./createApplication";

interface DevelopmentDiagnosticsProps {
  readonly diagnostics: ApplicationDiagnostics;
}

export function DevelopmentDiagnostics({
  diagnostics,
}: DevelopmentDiagnosticsProps) {
  const [snapshot, setSnapshot] = useState<ApplicationDiagnosticsSnapshot>();
  const [actionStatus, setActionStatus] = useState("Pronto para consultar.");

  async function refresh() {
    setSnapshot(await diagnostics.inspect());
    setActionStatus("Contagens atualizadas.");
  }

  async function createDiagnosticBook() {
    try {
      await diagnostics.createDiagnosticBook();
      setActionStatus("Livro de diagnóstico criado.");
      setSnapshot(await diagnostics.inspect());
    } catch {
      setActionStatus("Falha controlada ao criar dado de diagnóstico.");
    }
  }

  async function requestPersistence() {
    const status = await diagnostics.requestPersistence();
    setActionStatus(`Armazenamento persistente: ${status}.`);
    setSnapshot(await diagnostics.inspect());
  }

  return (
    <section className="placeholder" aria-labelledby="diagnostics-title">
      <h2 id="diagnostics-title">Diagnóstico de desenvolvimento</h2>
      <p role="status">{actionStatus}</p>
      <div>
        <button type="button" onClick={() => void refresh()}>
          Consultar contagens
        </button>
        <button type="button" onClick={() => void createDiagnosticBook()}>
          Criar livro de diagnóstico
        </button>
        <button type="button" onClick={() => void requestPersistence()}>
          Solicitar armazenamento persistente
        </button>
      </div>
      {snapshot && (
        <dl>
          <dt>Banco</dt>
          <dd>{snapshot.databaseName}</dd>
          <dt>Versão</dt>
          <dd>{snapshot.databaseVersion}</dd>
          <dt>Aberto</dt>
          <dd>{snapshot.isOpen ? "sim" : "não"}</dd>
          <dt>Persistência</dt>
          <dd>{snapshot.persistence}</dd>
          {Object.entries(snapshot.counts).map(([table, count]) => (
            <div key={table}>
              <dt>{table}</dt>
              <dd>{count}</dd>
            </div>
          ))}
          {snapshot.lastFailure && (
            <>
              <dt>Última falha</dt>
              <dd>{snapshot.lastFailure}</dd>
            </>
          )}
        </dl>
      )}
    </section>
  );
}
