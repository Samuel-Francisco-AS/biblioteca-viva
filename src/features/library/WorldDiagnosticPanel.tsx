import { useEffect, useState } from "react";
import type { WorldRuntime, WorldRuntimeDiagnostics } from "./worldRuntime";
import type { PerformanceScenario } from "./three/performanceScenarios";
const EMPTY_DIAGNOSTICS: WorldRuntimeDiagnostics = {
  activeFrameLoops: 0,
  drawCalls: 0,
  fixtureLoadMs: null,
  fixtureStatus: "idle",
  fps: null,
  frameTimeMs: null,
  geometries: 0,
  materialTextureReferences: 0,
  meshes: 0,
  performanceScenarioAssetsLoaded: 0,
  performanceScenarioAssetsTotal: 0,
  performanceScenarioId: "f1-baseline",
  performanceScenarioLabel: "Baseline F1",
  renderedFrames: 0,
  runtimeState: "created",
  sceneObjects: 0,
  selectableObjects: 0,
  textures: 0,
  timeToFirstUsableFrameMs: null,
  triangles: 0,
  uniqueMaterialTextures: 0,
};

function metric(value: number | null, suffix = ""): string {
  return value === null ? "Aguardando" : `${value.toFixed(1)}${suffix}`;
}

export function WorldDiagnosticPanel({
  runtime,
  performanceScenario,
}: {
  readonly runtime: WorldRuntime | null;
  readonly performanceScenario?: PerformanceScenario;
}) {
  const [diagnostics, setDiagnostics] = useState(
    () => runtime?.getDiagnostics() ?? EMPTY_DIAGNOSTICS,
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !runtime) return;
    return runtime.onDiagnosticsChange(setDiagnostics);
  }, [runtime, open]);
  return (
    <details
      className="world-technical"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Diagnóstico do mundo</summary>
      <aside
        aria-label="Diagnóstico técnico do ambiente 3D"
        className="world-diagnostics"
        data-runtime-state={diagnostics.runtimeState}
        data-testid="world-diagnostics"
      >
        <h3>Diagnóstico local</h3>
        <dl>
          <div>
            <dt>Runtime</dt>
            <dd>{diagnostics.runtimeState}</dd>
          </div>
          <div>
            <dt>Cenário</dt>
            <dd>{diagnostics.performanceScenarioLabel}</dd>
          </div>
          <div>
            <dt>Assets do cenário</dt>
            <dd>
              {diagnostics.performanceScenarioAssetsLoaded}/
              {diagnostics.performanceScenarioAssetsTotal}
            </dd>
          </div>
          {performanceScenario && (
            <>
              <div>
                <dt>Maps declarados</dt>
                <dd>{diagnostics.materialTextureReferences}</dd>
              </div>
              <div>
                <dt>Texturas únicas declaradas</dt>
                <dd>{diagnostics.uniqueMaterialTextures}</dd>
              </div>
            </>
          )}
          <div>
            <dt>FPS</dt>
            <dd>{metric(diagnostics.fps)}</dd>
          </div>
          <div>
            <dt>Frame médio</dt>
            <dd>{metric(diagnostics.frameTimeMs, " ms")}</dd>
          </div>
          <div>
            <dt>RAF P50 / P95 / P99</dt>
            <dd>
              {metric(diagnostics.frameIntervals?.p50 ?? null)} /{" "}
              {metric(diagnostics.frameIntervals?.p95 ?? null)} /{" "}
              {metric(diagnostics.frameIntervals?.p99 ?? null)} ms
            </dd>
          </div>
          <div>
            <dt>Intervalos RAF &gt;33,34 ms</dt>
            <dd>{diagnostics.frameIntervals?.lateFramesOver33Ms ?? 0}</dd>
          </div>
          {Object.entries(diagnostics.cpuMetrics ?? {}).map(
            ([name, values]) => (
              <div key={name}>
                <dt>{name} P95 (CPU/observação local)</dt>
                <dd>{metric(values.p95, " ms")}</dd>
              </div>
            ),
          )}
          <div>
            <dt>Heap JS disponível</dt>
            <dd>{metric(diagnostics.jsHeapUsedBytes ?? null, " B")}</dd>
          </div>
          <div>
            <dt>Long tasks suportadas</dt>
            <dd>{diagnostics.longTasksSupported ? "Sim" : "Não informado"}</dd>
          </div>
          <div>
            <dt>Chamadas</dt>
            <dd>{diagnostics.drawCalls}</dd>
          </div>
          <div>
            <dt>Triângulos</dt>
            <dd>{diagnostics.triangles}</dd>
          </div>
          <div>
            <dt>Geometrias</dt>
            <dd>{diagnostics.geometries}</dd>
          </div>
          <div>
            <dt>Texturas</dt>
            <dd>{diagnostics.textures}</dd>
          </div>
          <div>
            <dt>Malhas</dt>
            <dd>{diagnostics.meshes}</dd>
          </div>
          <div>
            <dt>Selecionáveis</dt>
            <dd>{diagnostics.selectableObjects}</dd>
          </div>
          <div>
            <dt>Primeiro frame</dt>
            <dd>{metric(diagnostics.timeToFirstUsableFrameMs, " ms")}</dd>
          </div>
          <div>
            <dt>GLB</dt>
            <dd>{metric(diagnostics.fixtureLoadMs, " ms")}</dd>
          </div>
        </dl>
      </aside>
    </details>
  );
}
