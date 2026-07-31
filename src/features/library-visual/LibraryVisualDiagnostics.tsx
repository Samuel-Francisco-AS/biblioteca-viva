import { useSyncExternalStore } from "react";

import type { LibraryVisualDiagnostics } from "./diagnostics";

interface LibraryVisualDiagnosticsProps {
  readonly diagnostics: LibraryVisualDiagnostics;
}

export function LibraryVisualDiagnosticsPanel({
  diagnostics,
}: LibraryVisualDiagnosticsProps) {
  const snapshot = useSyncExternalStore(
    diagnostics.subscribe,
    diagnostics.snapshot,
    diagnostics.snapshot,
  );

  return (
    <section
      className="library-visual-diagnostics"
      aria-labelledby="library-visual-diagnostics-title"
    >
      <h3 id="library-visual-diagnostics-title">
        Diagnóstico visual de desenvolvimento
      </h3>
      <dl>
        <dt>Estado</dt>
        <dd>{snapshot.state}</dd>
        <dt>Geração</dt>
        <dd>{snapshot.generation}</dd>
        <dt>Instâncias criadas</dt>
        <dd>{snapshot.createdInstances}</dd>
        <dt>Instâncias ativas</dt>
        <dd>{snapshot.activeInstances}</dd>
        <dt>Destruições</dt>
        <dd>{snapshot.destroyedInstances}</dd>
      </dl>
    </section>
  );
}
