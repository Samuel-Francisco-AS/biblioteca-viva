import { useState } from "react";

import { WorldHost } from "./WorldHost";
import {
  DEFAULT_PERFORMANCE_SCENARIO,
  PERFORMANCE_SCENARIOS,
} from "./three/performanceScenarios";

/**
 * F5-A diagnostic-only surface. Its static scenarios deliberately remount the
 * real runtime; it is not a content or asset-management API.
 */
export function PerformanceScenarioHarness() {
  const [scenarioId, setScenarioId] = useState(DEFAULT_PERFORMANCE_SCENARIO.id);
  const scenario =
    PERFORMANCE_SCENARIOS.find(({ id }) => id === scenarioId) ??
    DEFAULT_PERFORMANCE_SCENARIO;

  return (
    <>
      <fieldset className="world-selection-controls">
        <legend>Cenário experimental F5-A</legend>
        <p className="world-selection-help">
          Escolha a carga da cena. O cenário ativo é indicado pelo botão
          pressionado e pelo estado abaixo.
        </p>
        <div className="world-selection-actions">
          {PERFORMANCE_SCENARIOS.map(({ id, label }) => {
            const active = id === scenario.id;
            return (
              <button
                aria-pressed={active}
                className={`button ${active ? "button--primary" : "button--secondary"}`}
                key={id}
                onClick={() => setScenarioId(id)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="world-selection-status">
          Cenário ativo: {scenario.label}.
        </p>
        <p className="world-selection-help">
          {scenario.description} A troca recria a montagem Three; use o contador
          de assets e o diagnóstico local após o carregamento.
        </p>
      </fieldset>
      <WorldHost performanceScenario={scenario} />
    </>
  );
}
