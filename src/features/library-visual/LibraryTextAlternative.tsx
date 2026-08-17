import type { RefObject } from "react";
import { Link } from "react-router-dom";

import type { LibraryInteraction, LibraryViewModel } from "./contracts";
import type { ResidentCatalogEntry } from "../../content";
import {
  libraryPanelSummary,
  progressDescription,
} from "./libraryPresentation";

interface LibraryTextAlternativeProps {
  readonly creatureButtonRef: RefObject<HTMLButtonElement | null>;
  readonly librarianButtonRef: RefObject<HTMLButtonElement | null>;
  readonly onInteraction: (interaction: LibraryInteraction) => void;
  readonly shelfButtonRef: RefObject<HTMLButtonElement | null>;
  readonly viewModel: LibraryViewModel;
  readonly resident?: ResidentCatalogEntry;
  readonly residentButtonRef: RefObject<HTMLButtonElement | null>;
}

export function LibraryTextAlternative({
  creatureButtonRef,
  librarianButtonRef,
  onInteraction,
  shelfButtonRef,
  viewModel,
  resident,
  residentButtonRef,
}: LibraryTextAlternativeProps) {
  const summary = libraryPanelSummary(viewModel);
  const highlightedProgress = viewModel.highlightedBook
    ? progressDescription(viewModel.highlightedBook.progress)
    : null;

  return (
    <section
      className="library-text-alternative"
      aria-labelledby="library-text-summary-title"
      id="library-text-summary"
    >
      <div>
        <p className="eyebrow">Alternativa ao cenário visual</p>
        <h3 id="library-text-summary-title">Estado da Biblioteca</h3>
      </div>
      <dl className="library-text-alternative__counts">
        <div>
          <dt>Livros</dt>
          <dd>{viewModel.totalBooks}</dd>
        </div>
        <div>
          <dt>Em andamento</dt>
          <dd>{viewModel.inProgressBooks}</dd>
        </div>
        <div>
          <dt>Concluídos agora</dt>
          <dd>{viewModel.completedBooks}</dd>
        </div>
      </dl>
      <p>{summary.shelf}</p>
      {viewModel.highlightedBook ? (
        <p>
          Há um livro atualizado recentemente
          {highlightedProgress ? ` — ${highlightedProgress}.` : "."}
        </p>
      ) : (
        <p>Nenhum livro atualizado para destacar.</p>
      )}
      <p>{summary.milestone}</p>
      <div className="library-text-alternative__actions">
        <button
          className="button button--secondary"
          onClick={() => onInteraction({ type: "ShelfSelected" })}
          ref={shelfButtonRef}
          type="button"
        >
          Ver detalhes da estante
        </button>
        {resident && resident.id !== "librarian" && (
          <button
            className="button button--secondary"
            onClick={() =>
              onInteraction({
                residentId: resident.id,
                roomId: resident.homeRoomId,
                type: "ResidentInteracted",
              })
            }
            ref={residentButtonRef}
            type="button"
          >
            Conversar com{" "}
            {resident.nameKey.split(".").at(-1) === "researcher"
              ? "Pesquisador"
              : resident.nameKey.split(".").at(-1) === "projectionist"
                ? "Projecionista"
                : resident.nameKey.split(".").at(-1) === "training-keeper"
                  ? "Cuidador do treino"
                  : "Escriba"}
          </button>
        )}
        <button
          className="button button--secondary"
          onClick={() => onInteraction({ type: "LibrarianSelected" })}
          ref={librarianButtonRef}
          type="button"
        >
          Conversar com a bibliotecária
        </button>
        <button
          className="button button--secondary"
          onClick={() => onInteraction({ type: "CreatureSelected" })}
          ref={creatureButtonRef}
          type="button"
        >
          Interagir com a criatura
        </button>
        <Link className="button button--primary" to="/colecao">
          Consultar Coleção
        </Link>
      </div>
    </section>
  );
}
