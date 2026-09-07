import { useEffect, useRef, useState } from "react";

import {
  STRUCTURE_CATALOG,
  structureOperationMessage,
  structuralInventoryFamilyForDefinition,
  structureDefinition,
  type StructuralInventory,
  type StructureDefinitionId,
  type StructurePlacement,
  type WorldStructureState,
} from "../../application";

export type ConstructionTool =
  "explore" | "select" | "place-structure" | "paint-floor" | "remove-floor";

type ConstructionSheet = "structures" | "floor" | "pieces";

interface ConstructionControlsProps {
  readonly busy: boolean;
  readonly canRotatePlacement: boolean;
  readonly floorPreviewCount: number;
  readonly floorPreviewIssue?: import("../../application").StructureOperationCode;
  readonly floorPreviewValid: boolean;
  readonly hasValidStructurePreview: boolean;
  readonly inventory: StructuralInventory;
  readonly onCancelAction: () => void;
  readonly onConfirmAction: () => void;
  readonly onExit: () => void;
  readonly onMove: (placement: StructurePlacement) => void;
  readonly onPlace: (definitionId: StructureDefinitionId) => void;
  readonly onRemove: (placement: StructurePlacement) => void;
  readonly onRotate: (placement: StructurePlacement) => void;
  readonly onRotatePlacement: () => void;
  readonly onSelectionChange: (instanceId: string | undefined) => void;
  readonly onToolChange: (tool: ConstructionTool) => void;
  readonly openStructuresToken?: string;
  readonly placementKind?: "move" | "place";
  readonly selectedInstanceId?: string;
  readonly structure: WorldStructureState;
  readonly tool: ConstructionTool;
}

function humanName(id: string): string {
  if (id.includes("floor")) return "Piso de madeira";
  if (id.includes("corner")) return "Canto de pedra";
  if (id.includes("door")) return "Porta horizontal";
  if (id.includes("vertical-4")) return "Parede vertical longa";
  if (id.includes("vertical-2")) return "Parede vertical média";
  if (id.includes("vertical")) return "Parede vertical curta";
  if (id.includes("horizontal-4")) return "Parede longa";
  if (id.includes("horizontal-2")) return "Parede média";
  return "Parede curta";
}

function paletteOrder(id: string): number {
  const order = [
    "horizontal-4",
    "horizontal-2",
    "horizontal-1",
    "vertical-4",
    "vertical-2",
    "vertical-1",
    "corner-sw",
    "corner-se",
    "corner-nw",
    "corner-ne",
    "door-horizontal.closed",
    "door-horizontal.open",
  ];
  return order.findIndex((part) => id.includes(part));
}

function orientationName(placement: StructurePlacement): string {
  const definition = structureDefinition(placement.definitionId);
  const orientation = definition?.orientation ?? definition?.corner;
  return orientation ? orientation.toLocaleUpperCase("pt-BR") : "Estrutural";
}

export function ConstructionControls({
  busy,
  canRotatePlacement,
  floorPreviewCount,
  floorPreviewIssue,
  floorPreviewValid,
  hasValidStructurePreview,
  inventory,
  onCancelAction,
  onConfirmAction,
  onExit,
  onMove,
  onPlace,
  onRemove,
  onRotate,
  onRotatePlacement,
  onSelectionChange,
  onToolChange,
  openStructuresToken,
  placementKind,
  selectedInstanceId,
  structure,
  tool,
}: ConstructionControlsProps) {
  const lastTriggerRef = useRef<HTMLButtonElement>(null);
  const [sheet, setSheet] = useState<ConstructionSheet | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const selected = structure.placements.find(
    (placement) => placement.instanceId === selectedInstanceId,
  );
  const placing = tool === "place-structure" && placementKind !== undefined;
  const editingFloor = tool === "paint-floor" || tool === "remove-floor";

  function focusMap(): void {
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".library-visual-host")?.focus(),
    );
  }

  function closeSheet(): void {
    setSheet(null);
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }

  function handleBack(): void {
    if (confirmRemove) {
      setConfirmRemove(false);
      return;
    }
    if (sheet) {
      closeSheet();
      return;
    }
    if (placing || editingFloor) {
      onCancelAction();
      return;
    }
    if (selected) {
      onSelectionChange(undefined);
      onToolChange("explore");
      return;
    }
    onExit();
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      handleBack();
    };
    const onNativeBack = (event: Event) => {
      event.preventDefault();
      handleBack();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("biblioteca-viva:native-back", onNativeBack);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("biblioteca-viva:native-back", onNativeBack);
    };
  });

  useEffect(() => {
    if (!openStructuresToken) return;
    setSheet("structures");
  }, [openStructuresToken]);

  const floorAvailable =
    inventory.available[
      structuralInventoryFamilyForDefinition("architecture.floor.wood-01")
    ] ?? 0;

  return (
    <aside className="construction-controls" aria-label="Modo Construção">
      <p className="construction-mode-label" aria-live="polite">
        {placing
          ? placementKind === "move"
            ? "Mover peça"
            : "Posicionar estrutura"
          : editingFloor
            ? tool === "paint-floor"
              ? "Adicionar piso"
              : "Remover piso"
            : selected
              ? `${humanName(selected.definitionId)} selecionada`
              : sheet
                ? "Escolher no painel"
                : "Explore e expanda sua Biblioteca"}
      </p>

      {sheet === "structures" && (
        <div className="construction-sheet-layer">
          <section
            className="construction-sheet construction-sheet--structures"
            aria-labelledby="structure-inventory-title"
            role="dialog"
          >
            <div className="construction-sheet__handle" aria-hidden="true" />
            <div className="construction-sheet__heading">
              <div>
                <p className="eyebrow">Inventário disponível</p>
                <h3 id="structure-inventory-title">Estruturas</h3>
              </div>
              <button
                aria-label="Fechar estruturas"
                className="construction-sheet__close"
                onClick={closeSheet}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="construction-palette">
              {[...STRUCTURE_CATALOG]
                .filter((item) => item.category !== "floor")
                .sort(
                  (first, second) =>
                    paletteOrder(first.id) - paletteOrder(second.id),
                )
                .map((item) => {
                  const available =
                    inventory.available[
                      structuralInventoryFamilyForDefinition(item.id)
                    ] ?? 0;
                  return (
                    <button
                      className="construction-palette__item"
                      disabled={available === 0}
                      key={item.id}
                      onClick={() => {
                        onPlace(item.id);
                        setSheet(null);
                        focusMap();
                      }}
                      type="button"
                    >
                      <span
                        className={`construction-palette__preview construction-palette__preview--${item.orientation ?? "corner"}`}
                        aria-hidden="true"
                      />
                      <strong>{humanName(item.id)}</strong>
                      <small>
                        {item.visualSpanCells ?? 1} célula
                        {(item.visualSpanCells ?? 1) === 1 ? "" : "s"} ·{" "}
                        {available} disponíveis
                      </small>
                    </button>
                  );
                })}
            </div>
          </section>
        </div>
      )}

      {sheet === "floor" && (
        <div className="construction-sheet-layer">
          <section
            className="construction-sheet construction-sheet--compact"
            aria-labelledby="floor-tools-title"
            role="dialog"
          >
            <div className="construction-sheet__handle" aria-hidden="true" />
            <div className="construction-sheet__heading">
              <div>
                <p className="eyebrow">{floorAvailable} disponíveis</p>
                <h3 id="floor-tools-title">Piso</h3>
              </div>
              <button
                aria-label="Fechar piso"
                className="construction-sheet__close"
                onClick={closeSheet}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="construction-floor-options">
              <button
                className="construction-option"
                disabled={floorAvailable === 0}
                onClick={() => {
                  onToolChange("paint-floor");
                  setSheet(null);
                }}
                type="button"
              >
                <span aria-hidden="true">＋</span>
                <span>
                  <strong>Adicionar piso</strong>
                  <small>Expanda a planta por células conectadas.</small>
                </span>
              </button>
              <button
                className="construction-option"
                onClick={() => {
                  onToolChange("remove-floor");
                  setSheet(null);
                }}
                type="button"
              >
                <span aria-hidden="true">−</span>
                <span>
                  <strong>Remover piso</strong>
                  <small>Mantenha a área construída conectada.</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {sheet === "pieces" && (
        <div className="construction-sheet-layer">
          <section
            className="construction-sheet construction-sheet--pieces"
            aria-labelledby="placed-pieces-title"
            role="dialog"
          >
            <div className="construction-sheet__handle" aria-hidden="true" />
            <div className="construction-sheet__heading">
              <div>
                <p className="eyebrow">{structure.placements.length} no mapa</p>
                <h3 id="placed-pieces-title">Peças colocadas</h3>
              </div>
              <button
                aria-label="Fechar peças colocadas"
                className="construction-sheet__close"
                onClick={closeSheet}
                type="button"
              >
                ×
              </button>
            </div>
            <ul className="construction-piece-list">
              {structure.placements.map((placement, index) => (
                <li key={placement.instanceId}>
                  <button
                    aria-label={`${humanName(placement.definitionId)}, ${orientationName(placement)}, peça ${index + 1}, posição ${placement.anchor.x}, ${placement.anchor.y}`}
                    onClick={() => {
                      onSelectionChange(placement.instanceId);
                      onToolChange("select");
                      setSheet(null);
                      focusMap();
                    }}
                    type="button"
                  >
                    <span
                      className="construction-piece-list__mark"
                      aria-hidden="true"
                    >
                      {placement.definitionId.includes("corner") ? "⌜" : "━"}
                    </span>
                    <span>
                      <strong>{humanName(placement.definitionId)}</strong>
                      <small>
                        #{String(index + 1).padStart(2, "0")} ·{" "}
                        {orientationName(placement)}
                      </small>
                      <small>
                        posição {placement.anchor.x}, {placement.anchor.y}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {confirmRemove && selected && (
        <div className="construction-dialog-layer">
          <section
            className="construction-dialog"
            aria-describedby="remove-piece-description"
            aria-labelledby="remove-piece-title"
            role="alertdialog"
          >
            <p className="eyebrow">Volta para o inventário</p>
            <h3 id="remove-piece-title">Remover esta peça?</h3>
            <p id="remove-piece-description">
              Ela sairá do mapa e ficará disponível para usar novamente.
            </p>
            <div>
              <button
                className="button button--secondary"
                onClick={() => setConfirmRemove(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                disabled={busy}
                onClick={() => {
                  onRemove(selected);
                  setConfirmRemove(false);
                }}
                type="button"
              >
                Remover peça
              </button>
            </div>
          </section>
        </div>
      )}

      {placing ? (
        <>
          <p className="construction-hint" role="status">
            {hasValidStructurePreview
              ? "Posição válida. Confirme para salvar."
              : "Arraste ou toque em uma borda de piso livre."}
          </p>
          <div
            className="construction-action-bar"
            role="toolbar"
            aria-label="Posicionar peça"
          >
            <button onClick={onCancelAction} type="button">
              <span aria-hidden="true">×</span>
              Cancelar
            </button>
            {canRotatePlacement && (
              <button onClick={onRotatePlacement} type="button">
                <span aria-hidden="true">↻</span>
                Girar
              </button>
            )}
            <button
              className="construction-action-bar__primary"
              disabled={!hasValidStructurePreview || busy}
              onClick={onConfirmAction}
              type="button"
            >
              <span aria-hidden="true">✓</span>
              Confirmar
            </button>
          </div>
        </>
      ) : editingFloor ? (
        <>
          <p className="construction-hint" role="status">
            {floorPreviewCount > 0
              ? floorPreviewValid
                ? `${floorPreviewCount} célula${floorPreviewCount === 1 ? "" : "s"} pronta${floorPreviewCount === 1 ? "" : "s"} para aplicar.`
                : floorPreviewIssue
                  ? structureOperationMessage(floorPreviewIssue)
                  : "A seleção atual não pode ser aplicada."
              : "Toque ou arraste sobre o mapa para marcar o piso."}
          </p>
          <div
            className="construction-action-bar"
            role="toolbar"
            aria-label="Editar piso"
          >
            <button onClick={onCancelAction} type="button">
              <span aria-hidden="true">×</span>
              Cancelar
            </button>
            <button
              className="construction-action-bar__primary"
              disabled={floorPreviewCount === 0 || !floorPreviewValid || busy}
              onClick={onConfirmAction}
              type="button"
            >
              <span aria-hidden="true">✓</span>
              {tool === "paint-floor" ? "Aplicar piso" : "Aplicar remoção"}
              {floorPreviewCount > 0 ? ` (${floorPreviewCount})` : ""}
            </button>
          </div>
        </>
      ) : selected ? (
        <div
          className="construction-action-bar construction-action-bar--four"
          role="toolbar"
          aria-label="Peça selecionada"
        >
          <button onClick={() => onMove(selected)} type="button">
            <span aria-hidden="true">✥</span>
            Mover
          </button>
          <button
            disabled={
              structureDefinition(selected.definitionId)?.rotatable === false ||
              busy
            }
            onClick={() => onRotate(selected)}
            type="button"
          >
            <span aria-hidden="true">↻</span>
            Girar
          </button>
          <button onClick={() => setConfirmRemove(true)} type="button">
            <span aria-hidden="true">⇧</span>
            Remover
          </button>
          <button
            onClick={() => {
              onSelectionChange(undefined);
              onToolChange("explore");
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
            Cancelar
          </button>
        </div>
      ) : !sheet ? (
        <div
          className="construction-action-bar construction-action-bar--four"
          role="toolbar"
          aria-label="Ferramentas de construção"
        >
          <button
            ref={lastTriggerRef}
            onClick={() => setSheet("structures")}
            type="button"
          >
            <span aria-hidden="true">▥</span>
            Estruturas
          </button>
          <button
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget;
              setSheet("floor");
            }}
            type="button"
          >
            <span aria-hidden="true">▦</span>
            Piso
          </button>
          <button
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget;
              setSheet("pieces");
            }}
            type="button"
          >
            <span aria-hidden="true">◎</span>
            Peças
          </button>
          <button onClick={onExit} type="button">
            <span aria-hidden="true">↙</span>
            Sair
          </button>
        </div>
      ) : null}
    </aside>
  );
}
