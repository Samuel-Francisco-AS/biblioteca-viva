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
        <dt>Canvas no host</dt>
        <dd>{snapshot.canvasCount}</dd>
        <dt>Listeners de lifecycle do host</dt>
        <dd>{snapshot.activeLifecycleListeners}</dd>
        <dt>Observers do host</dt>
        <dd>{snapshot.activeObservers}</dd>
        <dt>Tempo até instância pronta</dt>
        <dd>
          {snapshot.creationDurationMs === null
            ? "não medido"
            : `${snapshot.creationDurationMs.toFixed(1)} ms`}
        </dd>
        <dt>Preparação dos dados da Biblioteca</dt>
        <dd>
          {snapshot.libraryPreparationDurationMs === null
            ? "não medido"
            : `${snapshot.libraryPreparationDurationMs.toFixed(1)} ms`}
        </dd>
        <dt>FPS aproximado</dt>
        <dd>
          {snapshot.fps === null ? "não medido" : snapshot.fps.toFixed(1)}
        </dd>
        <dt>Display objects</dt>
        <dd>{snapshot.displayObjects ?? "não medido"}</dd>
        <dt>Zonas interativas</dt>
        <dd>{snapshot.interactiveZones ?? "não medido"}</dd>
        <dt>Tweens ativos</dt>
        <dd>{snapshot.activeTweens ?? "não medido"}</dd>
        <dt>Destruições</dt>
        <dd>{snapshot.destroyedInstances}</dd>
      </dl>
    </section>
  );
}
