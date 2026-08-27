import { useEffect, useRef, useState } from "react";

import {
  STRUCTURE_CATALOG,
  structureDefinition,
  type StructuralInventory,
  type StructurePlacement,
  type WorldStructureState,
} from "../../application";

export type ConstructionTool =
  "explore" | "select" | "place-structure" | "paint-floor" | "remove-floor";

interface ConstructionControlsProps {
  readonly inventory: StructuralInventory;
  readonly onAddFloor: (cell: { x: number; y: number }) => void;
  readonly onExit: () => void;
  readonly onMove: (placement: StructurePlacement) => void;
  readonly onPlace: (definitionId: string) => void;
  readonly onRemoveFloor: (cell: { x: number; y: number }) => void;
  readonly onRotate: (placement: StructurePlacement) => void;
  readonly onStore: (placement: StructurePlacement) => void;
  readonly structure: WorldStructureState;
  readonly tool: ConstructionTool;
  readonly onToolChange: (tool: ConstructionTool) => void;
}

function humanName(id: string): string {
  if (id.includes("corner")) return "Canto de pedra";
  if (id.includes("door")) return "Porta horizontal";
  if (id.includes("vertical")) return "Parede vertical";
  return "Parede horizontal";
}

function focalCell(structure: WorldStructureState) {
  const cell = structure.floorCells[0] ?? { x: 3, y: 4 };
  return { x: cell.x, y: cell.y };
}

/** Compact DOM alternative: all edit operations remain possible without canvas precision. */
export function ConstructionControls({
  inventory,
  onAddFloor,
  onExit,
  onMove,
  onPlace,
  onRemoveFloor,
  onRotate,
  onStore,
  onToolChange,
  structure,
  tool,
}: ConstructionControlsProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [sheet, setSheet] = useState<"structures" | "floor" | null>(null);
  const [selected, setSelected] = useState<StructurePlacement>();
  const [confirmStore, setConfirmStore] = useState(false);
  const [focus, setFocus] = useState(() => focalCell(structure));
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (confirmStore) setConfirmStore(false);
        else if (sheet) {
          setSheet(null);
          triggerRef.current?.focus();
        } else if (selected) setSelected(undefined);
        return;
      }
      const delta =
        event.key === "ArrowLeft"
          ? [-1, 0]
          : event.key === "ArrowRight"
            ? [1, 0]
            : event.key === "ArrowUp"
              ? [0, -1]
              : event.key === "ArrowDown"
                ? [0, 1]
                : undefined;
      if (delta) {
        event.preventDefault();
        setFocus((cell) => ({ x: cell.x + delta[0], y: cell.y + delta[1] }));
      }
      if (event.key === "Enter" && sheet === "floor") {
        if (tool === "paint-floor") onAddFloor(focus);
        if (tool === "remove-floor") onRemoveFloor(focus);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [confirmStore, focus, onAddFloor, onRemoveFloor, selected, sheet, tool]);
  const currentDefinition =
    selected && structureDefinition(selected.definitionId);
  return (
    <aside className="construction-controls" aria-label="Modo Construção">
      <p className="construction-controls__context" role="status">
        Modo Construção. Móveis e livros estão temporariamente bloqueados.
      </p>
      <div
        className="construction-toolbar"
        role="toolbar"
        aria-label="Ferramentas de construção"
      >
        <button
          className="button button--secondary"
          aria-pressed={tool === "explore"}
          onClick={() => onToolChange("explore")}
          type="button"
        >
          Explorar
        </button>
        <button
          ref={triggerRef}
          className="button button--secondary"
          aria-expanded={sheet === "structures"}
          onClick={() => {
            setSheet("structures");
            onToolChange("place-structure");
          }}
          type="button"
        >
          Estruturas
        </button>
        <button
          className="button button--secondary"
          aria-expanded={sheet === "floor"}
          onClick={() => setSheet("floor")}
          type="button"
        >
          Piso
        </button>
        <button
          className="button button--secondary"
          onClick={onExit}
          type="button"
        >
          Sair
        </button>
      </div>
      {sheet === "structures" && (
        <section
          className="construction-sheet"
          aria-modal="true"
          aria-labelledby="structure-inventory-title"
          role="dialog"
        >
          <h3 id="structure-inventory-title">Peças estruturais</h3>
          {(["wall", "corner", "door"] as const).map((category) => (
            <div key={category}>
              <h4>
                {category === "wall"
                  ? "Paredes"
                  : category === "corner"
                    ? "Cantos"
                    : "Portas"}
              </h4>
              {STRUCTURE_CATALOG.filter(
                (item) => item.category === category,
              ).map((item) => {
                const available = inventory.available[item.id] ?? 0;
                return (
                  <div className="construction-item" key={item.id}>
                    <span>
                      {humanName(item.id)} · {item.visualSpanCells ?? 1} célula
                      {(item.visualSpanCells ?? 1) === 1 ? "" : "s"} ·{" "}
                      {item.orientation ?? item.corner}
                    </span>
                    <span>
                      {available} disponível{available === 1 ? "" : "is"}
                    </span>
                    <button
                      className="button button--primary"
                      disabled={available === 0}
                      onClick={() => {
                        onPlace(item.id);
                        setSheet(null);
                      }}
                      type="button"
                    >
                      Colocar
                    </button>
                    {available === 0 && <small>Sem disponibilidade.</small>}
                  </div>
                );
              })}
            </div>
          ))}
          <button
            className="button button--secondary"
            onClick={() => {
              setSheet(null);
              triggerRef.current?.focus();
            }}
            type="button"
          >
            Fechar
          </button>
        </section>
      )}
      {sheet === "floor" && (
        <section
          className="construction-sheet"
          aria-modal="true"
          aria-labelledby="floor-tools-title"
          role="dialog"
        >
          <h3 id="floor-tools-title">Piso</h3>
          <p>
            {inventory.available["architecture.floor.wood-01"] ?? 0} unidades
            disponíveis. Célula focal: {focus.x}, {focus.y}.
          </p>
          <button
            className="button button--primary"
            aria-pressed={tool === "paint-floor"}
            onClick={() => onToolChange("paint-floor")}
            type="button"
          >
            Adicionar piso
          </button>
          <button
            className="button button--secondary"
            aria-pressed={tool === "remove-floor"}
            onClick={() => onToolChange("remove-floor")}
            type="button"
          >
            Remover piso
          </button>
          <button
            className="button button--secondary"
            onClick={() => onToolChange("explore")}
            type="button"
          >
            Cancelar ferramenta
          </button>
          <button
            className="button button--secondary"
            onClick={() => {
              setSheet(null);
              triggerRef.current?.focus();
            }}
            type="button"
          >
            Fechar
          </button>
        </section>
      )}
      <section
        className="construction-alternative"
        aria-label="Alternativa de construção"
      >
        <h3>Peças colocadas</h3>
        {structure.placements.map((placement) => (
          <button
            className="button button--secondary"
            key={placement.instanceId}
            onClick={() => setSelected(placement)}
            type="button"
          >
            {humanName(placement.definitionId)} ·{" "}
            {structureDefinition(placement.definitionId)?.orientation ??
              structureDefinition(placement.definitionId)?.corner}
          </button>
        ))}
      </section>
      {selected && (
        <section
          className="construction-selection"
          aria-label="Peça selecionada"
        >
          <h3>{humanName(selected.definitionId)}</h3>
          <p>
            Orientação:{" "}
            {currentDefinition?.orientation ?? currentDefinition?.corner}.
            Extensão: {currentDefinition?.visualSpanCells ?? 1}.
          </p>
          <button
            className="button button--primary"
            onClick={() => onMove(selected)}
            type="button"
          >
            Mover
          </button>
          {currentDefinition?.rotatable !== false && (
            <button
              className="button button--secondary"
              onClick={() => onRotate(selected)}
              type="button"
            >
              Girar
            </button>
          )}
          <button
            className="button button--secondary"
            onClick={() => setConfirmStore(true)}
            type="button"
          >
            Guardar
          </button>
          <button
            className="button button--secondary"
            onClick={() => setSelected(undefined)}
            type="button"
          >
            Fechar seleção
          </button>
        </section>
      )}
      {confirmStore && selected && (
        <section
          className="construction-confirm"
          aria-modal="true"
          role="dialog"
          aria-label="Guardar esta peça"
        >
          <p>Guardar esta peça? Ela voltará ao inventário.</p>
          <button
            className="button button--primary"
            onClick={() => {
              onStore(selected);
              setSelected(undefined);
              setConfirmStore(false);
            }}
            type="button"
          >
            Guardar peça
          </button>
          <button
            className="button button--secondary"
            onClick={() => setConfirmStore(false)}
            type="button"
          >
            Cancelar
          </button>
        </section>
      )}
    </aside>
  );
}
