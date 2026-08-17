import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import type { LibraryViewModel } from "./contracts";
import type { LibraryPeriod } from "./libraryAtmosphere";
import { LIBRARY_PERIOD_LABELS } from "./libraryAtmosphere";
import {
  libraryPanelSummary,
  progressDescription,
} from "./libraryPresentation";

export type LibrarySheetMode = "summary" | "shelf";

interface LibraryBottomSheetProps {
  readonly mode: LibrarySheetMode;
  readonly onClose: () => void;
  readonly period: LibraryPeriod;
  readonly recentBookTitle?: string;
  readonly viewModel: LibraryViewModel;
  readonly productSummary?: {
    readonly totalEntries: number;
    readonly activeSessionType?: string;
  };
}

export function LibraryBottomSheet({
  mode,
  onClose,
  period,
  recentBookTitle,
  viewModel,
  productSummary,
}: LibraryBottomSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const summary = libraryPanelSummary(viewModel);
  const recentProgress = viewModel.highlightedBook
    ? progressDescription(viewModel.highlightedBook.progress)
    : null;

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [mode]);

  return (
    <section
      aria-labelledby="library-sheet-title"
      className="library-bottom-sheet"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="dialog"
    >
      <div aria-hidden="true" className="library-bottom-sheet__handle" />
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {mode === "summary" ? LIBRARY_PERIOD_LABELS[period] : "Estante"}
          </p>
          <h2 id="library-sheet-title">
            {mode === "summary" ? "Sua biblioteca" : "Resumo da estante"}
          </h2>
        </div>
        <button
          aria-label="Fechar resumo da Biblioteca"
          className="drawer-close"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <dl className="library-sheet-stats">
        {productSummary && (
          <div>
            <dt>Registros</dt>
            <dd>{productSummary.totalEntries}</dd>
          </div>
        )}
        <div>
          <dt>Livros</dt>
          <dd>{viewModel.totalBooks}</dd>
        </div>
        <div>
          <dt>Em leitura</dt>
          <dd>{viewModel.inProgressBooks}</dd>
        </div>
        <div>
          <dt>Concluídos</dt>
          <dd>{viewModel.completedBooks}</dd>
        </div>
      </dl>
      {productSummary?.activeSessionType && (
        <p>Sessão em andamento · {productSummary.activeSessionType}</p>
      )}
      {mode === "shelf" && <p>{summary.shelf}</p>}
      {recentBookTitle && (
        <div className="library-sheet__recent">
          <p className="eyebrow">Leitura recente</p>
          <h3>{recentBookTitle}</h3>
          {recentProgress && <p>{recentProgress}</p>}
        </div>
      )}
      <p>{summary.milestone}</p>
      <button
        className="button button--primary"
        onClick={() => void navigate("/colecao")}
        type="button"
      >
        Abrir Coleção
      </button>
      <button
        className="button button--secondary"
        onClick={() => void navigate("/estatisticas")}
        type="button"
      >
        Abrir Estatísticas
      </button>
    </section>
  );
}
