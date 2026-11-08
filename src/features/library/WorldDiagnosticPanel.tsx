import type { LightingExperimentMode } from "./three/lightingExperiment";
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
    const unsubscribe = runtime.onDiagnosticsChange(setDiagnostics);
    return () => {
      unsubscribe();
      runtime.setLightingExperiment?.(null);
      runtime.setQuestProbeEnabled?.(false);
    };
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
        {runtime?.setQuestProbeEnabled && (
          <fieldset>
            <legend>R5Q · abertura de quests (experimental, opt-in)</legend>
            <label>
              <input
                type="checkbox"
                checked={diagnostics.questProbe?.enabled ?? false}
                onChange={(event) =>
                  runtime.setQuestProbeEnabled?.(event.target.checked)
                }
              />
              Registrar próximas seleções localmente
            </label>
            <p>
              Até 12 toques/cliques. Sem textos pessoais, persistência ou envio.
              Fechar este diagnóstico desativa e apaga os registros. Adie a
              conversa para voltar aqui. Compare Canvas e botões, primeira
              abertura, reabertura e troca de habitante. Zerar amostras inicia
              outra rodada.
            </p>
            <p>
              marks: milissegundos desde o início do handler de toque
              confirmado/click. Pares Start/End delimitam CPU síncrona;
              reactCommit observa o commit DOM, scene/submit seguem a RAF
              existente, animation registra eventos CSS. Nenhum deles mede
              apresentação física. Campos ausentes não foram observados;
              programas adicionais não provam compilação cara. Long tasks:
              primeiro segundo.
            </p>
            <label>
              Registros locais R5Q (selecione para copiar)
              <textarea
                readOnly
                rows={12}
                value={JSON.stringify(
                  diagnostics.questProbe?.observations ?? [],
                  null,
                  2,
                )}
              />
            </label>
          </fieldset>
        )}
        {runtime?.setLightingExperiment && (
          <fieldset>
            <legend>R5P · iluminação experimental (temporária)</legend>
            <p>
              Não altera a hora nem os dados. Fechar o diagnóstico restaura o
              ciclo normal. D fixa três luzes próximas à câmera no momento da
              escolha; as nove luminárias continuam acesas.
            </p>
            <button
              type="button"
              onClick={() => runtime.setLightingExperiment?.(null)}
              aria-pressed={!diagnostics.lightingExperiment}
            >
              Ciclo normal
            </button>
            {(
              [
                ["day", "A · Dia original"],
                ["original", "B · Noite original"],
                ["no-lamps", "C · Noite sem pontos das luminárias"],
                ["limited", "D · Noite com três pontos fixos"],
                ["candidate", "Noite candidata R5P · nove pontos"],
              ] satisfies [LightingExperimentMode, string][]
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={diagnostics.lightingExperiment?.mode === mode}
                onClick={() =>
                  runtime.setLightingExperiment?.({
                    mode,
                    ythaLight:
                      diagnostics.lightingExperiment?.ythaLight ?? true,
                  })
                }
              >
                {label}
              </button>
            ))}
            <label>
              <input
                type="checkbox"
                disabled={!diagnostics.lightingExperiment}
                checked={diagnostics.lightingExperiment?.ythaLight ?? true}
                onChange={(event) => {
                  if (diagnostics.lightingExperiment)
                    runtime.setLightingExperiment?.({
                      ...diagnostics.lightingExperiment,
                      ythaLight: event.target.checked,
                    });
                }}
              />
              E · Contribuição PointLight de Ytha
            </label>
            <button
              type="button"
              onClick={() => runtime.resetPerformanceProbe?.()}
            >
              Zerar amostras
            </button>
            <p>
              RAF e canais: até 4096 amostras por rodada. Submissão é CPU, não
              tempo GPU.
            </p>
          </fieldset>
        )}
        <p>
          Timer GPU assíncrono:{" "}
          {diagnostics.gpuTimer?.supported
            ? `${metric(diagnostics.gpuTimer.milliseconds.p50)} / ${metric(diagnostics.gpuTimer.milliseconds.p95)} / ${metric(diagnostics.gpuTimer.milliseconds.p99)} ms (P50/P95/P99), n=${diagnostics.gpuTimer.milliseconds.count}`
            : "indisponível; custo GPU não medido"}
          . O renderer/driver determina a interpretação; SwiftShader mede
          software.
        </p>
        <p>
          PointLights ativas: {diagnostics.activePointLights ?? "indisponível"}{" "}
          · Programas WebGL: {diagnostics.shaderPrograms ?? "indisponível"}
        </p>
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
            <dt>RAF P50 / P95 / P99 (janela de 750 ms)</dt>
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
                <dt>{name} P50/P95/P99 (observação local)</dt>
                <dd>
                  {metric(values.p50)} / {metric(values.p95)} /{" "}
                  {metric(values.p99)} ms · n={values.count}
                </dd>
              </div>
            ),
          )}
          <div>
            <dt>Heap JS disponível</dt>
            <dd>{metric(diagnostics.jsHeapUsedBytes ?? null, " B")}</dd>
          </div>
          <div>
            <dt>
              Long tasks suportadas · n=
              {diagnostics.cpuMetrics?.longTask?.count ?? 0}
            </dt>
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
