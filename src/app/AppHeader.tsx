import { Link } from "react-router-dom";

interface AppHeaderProps {
  readonly backTo?: string;
  readonly brandOnly?: boolean;
  readonly immersive?: boolean;
  readonly title: string;
}

export function AppHeader({
  backTo,
  brandOnly = false,
  immersive = false,
  title,
}: AppHeaderProps) {
  return (
    <header className={`top-bar${immersive ? " top-bar--immersive" : ""}`}>
      {backTo && (
        <Link
          aria-label="Voltar para a Coleção"
          className="top-bar__back"
          to={backTo}
        >
          <span aria-hidden="true">←</span>
        </Link>
      )}
      {brandOnly ? (
        <h1 className="top-bar__wordmark">Biblioteca Viva</h1>
      ) : (
        <div className="top-bar__title">
          <p className="top-bar__brand">Biblioteca Viva</p>
          <h1>{title}</h1>
        </div>
      )}
    </header>
  );
}
