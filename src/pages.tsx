import { useMemo } from "react";
import { Link } from "react-router-dom";

import { LibraryVisualDiagnosticsPanel } from "./features/library-visual/LibraryVisualDiagnostics";
import { LibraryVisualHost } from "./features/library-visual/LibraryVisualHost";
import { createLibraryVisualDiagnostics } from "./features/library-visual/diagnostics";

export function LibraryPage() {
  const diagnosticsEnabled =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DIAGNOSTICS === "true";
  const diagnostics = useMemo(
    () => (diagnosticsEnabled ? createLibraryVisualDiagnostics() : undefined),
    [diagnosticsEnabled],
  );

  return (
    <section className="library-page" aria-labelledby="library-visual-title">
      <div className="library-page__introduction">
        <p className="placeholder__status">Visualização estrutural</p>
        <h2 id="library-visual-title">Biblioteca inicial</h2>
        <p>
          Esta é uma estrutura visual inicial da biblioteca. Seus livros,
          anotações e leituras continuam acessíveis na área convencional.
        </p>
        <Link className="text-link" to="/colecao">
          Abrir Coleção
        </Link>
      </div>
      <LibraryVisualHost diagnostics={diagnostics} />
      {diagnostics && (
        <LibraryVisualDiagnosticsPanel diagnostics={diagnostics} />
      )}
    </section>
  );
}
