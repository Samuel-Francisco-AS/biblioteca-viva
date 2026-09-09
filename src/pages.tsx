import { Link } from "react-router-dom";

import { WorldHost } from "./features/library/WorldHost";

export function LibraryPage() {
  return (
    <section className="library-page" aria-labelledby="library-title">
      <p className="eyebrow">Biblioteca</p>
      <h2 id="library-title">Fundação 3D experimental</h2>
      <p>
        Esta superfície mínima valida a integração inicial com Three.js. Sua
        coleção e as demais ferramentas continuam disponíveis em React.
      </p>
      <WorldHost />
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
