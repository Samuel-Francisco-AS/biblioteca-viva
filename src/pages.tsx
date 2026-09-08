import { Link } from "react-router-dom";

export function LibraryPage() {
  return (
    <section className="library-placeholder" aria-labelledby="library-title">
      <p className="eyebrow">Biblioteca</p>
      <h2 id="library-title">Uma nova experiência está sendo preparada</h2>
      <p>
        A experiência visual da Biblioteca está em reformulação. Sua coleção e
        as demais ferramentas continuam disponíveis.
      </p>
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
