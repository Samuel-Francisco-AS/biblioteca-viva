import { useEffect, useRef } from "react";

import type { LibraryViewModel } from "./contracts";
import {
  libraryPanelSummary,
  progressDescription,
} from "./libraryPresentation";

interface LibraryShelfPanelProps {
  readonly onClose: () => void;
  readonly onOpenCollection: () => void;
  readonly viewModel: LibraryViewModel;
}

export function LibraryShelfPanel({
  onClose,
  onOpenCollection,
  viewModel,
}: LibraryShelfPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const summary = libraryPanelSummary(viewModel);
  const highlightedProgress = viewModel.highlightedBook
    ? progressDescription(viewModel.highlightedBook.progress)
    : null;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <section
      className="library-shelf-panel"
      aria-labelledby="library-shelf-panel-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Estante</p>
          <h3 id="library-shelf-panel-title">Resumo da sua coleção</h3>
        </div>
        <button
          className="button button--secondary"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          Fechar painel
        </button>
      </div>
      <dl className="library-shelf-panel__counts">
        <div>
          <dt>Total de livros</dt>
          <dd>{viewModel.totalBooks}</dd>
        </div>
        <div>
          <dt>Em andamento</dt>
          <dd>{viewModel.inProgressBooks}</dd>
        </div>
        <div>
          <dt>Concluídos</dt>
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
      <button
        className="button button--primary"
        onClick={onOpenCollection}
        type="button"
      >
        Abrir Coleção
      </button>
    </section>
  );
}
