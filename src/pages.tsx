import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";

import { WorldHost } from "./features/library/WorldHost";
import { isDiagnosticsEnabled } from "./app/diagnosticsAvailability";

const diagnosticsBuildEnabled =
  import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
const PerformanceScenarioHarness = diagnosticsBuildEnabled
  ? lazy(async () => {
      const module =
        await import("./features/library/PerformanceScenarioHarness");
      return { default: module.PerformanceScenarioHarness };
    })
  : undefined;

export function LibraryPage() {
  const diagnosticsEnabled = isDiagnosticsEnabled(
    import.meta.env.DEV,
    import.meta.env.VITE_ENABLE_DIAGNOSTICS,
  );

  return (
    <section className="library-page" aria-labelledby="library-title">
      <p className="eyebrow">Biblioteca</p>
      <h2 id="library-title">Fundação 3D experimental</h2>
      <p>
        Esta superfície mínima valida a integração inicial com Three.js. Sua
        coleção e as demais ferramentas continuam disponíveis em React.
      </p>
      {diagnosticsEnabled && PerformanceScenarioHarness ? (
        <Suspense
          fallback={
            <p className="world-status">Preparando cenário experimental…</p>
          }
        >
          <PerformanceScenarioHarness />
        </Suspense>
      ) : (
        <WorldHost />
      )}
      <div className="placeholder-actions">
        <Link className="button button--primary" to="/colecao">
          Abrir Coleção
        </Link>
        <Link className="button button--secondary" to="/novo-registro">
          Criar registro
        </Link>
      </div>
    </section>
  );
}
