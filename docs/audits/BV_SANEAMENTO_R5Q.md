# R5Q — Inicialização noturna e fluidez das quests

08/11/2026. Base local limpa `e3b437ac6c4c2092b8d4db1b3a54b525ed3982e9`, branch `feat/bv-r5-renascimento-artistico`, mesma PR draft #40. Missão expressa do proprietário autoriza saneamento e publicação, sem merge ou nova fase.

O proprietário instalou R5P no Moto G06 e relatou **melhora perceptível de fluidez e forte redução dos travamentos**. Esse feedback humano dirigido é preservado; não é medição quantitativa, aprovação artística dos habitantes, conclusão de R5 ou recuperação integral. Restaram flash diurno ao abrir à noite e travamento entre selecionar habitante e abrir quest. R1–R4 e as ressalvas E2E/assistivas/memória permanecem.

## A — Causa e correção do primeiro desenho

LivingSession e NightLightingSession já inicializavam seus snapshots com a hora correta. WorldHost aguarda checkpoints opcionais antes de montar. O descompasso estava nos visuais: céu/sun/background nasciam diurnos e nove PointLights nasciam com intensidade zero e visible=true. `mount → resize → renderCurrentFrame` e `start → renderCurrentFrame` desenhavam antes de livingVisuals.update. O primeiro RAF ainda tinha delta zero; a noite só chegava pela interpolação posterior. Não era necessário esperar o ritual ou carregar dados novamente.

Agora, antes do primeiro desenho válido, o runtime atualiza o contexto das duas sessões e aplica iluminação/encenação narrativa vigente com delta zero e **snap apenas da iluminação**. Nove núcleos, potências, cores e fundo já correspondem ao estado real. WorldHost fornece o snapshot narrativo antes de mount; o runtime o aceita nessa etapa e aplica sua agência assim que ela existe. Uma fenda em curso também começa com luz e ambiente corretos na substituição da cena.

A retomada invalida só essa preparação inicial de luz: o primeiro desenho após foreground usa o horário atual. O anoitecer durante uso contínuo conserva o blend normal; manhã, movimento reduzido, tempo de animação, ritual, controle manual, checkpoints e fallback não foram substituídos. Não há ocultação/delay do Canvas, novo timer/RAF ou reconstrução adicional da cena.

| Abertura |     Céu antes | Céu candidata | Nove luminárias na candidata           |
| -------- | ------------: | ------------: | -------------------------------------- |
| 12h      |          2,00 |          2,00 | apagadas                               |
| 17h59    |          2,00 |          2,00 | apagadas                               |
| 18h00    | 2,00 (errado) |          1,08 | potência 0,68; completadas preservam 1 |
| 23h      | 2,00 (errado) |          1,08 | potência 1                             |
| 03h      | 2,00 (errado) |          1,08 | potência 1; ciclo da véspera           |

Valores são intensidade HemisphereLight no primeiro renderer.render, não luminância física. [Antes](evidence/bv-r5q/before/metrics.json) / [depois](evidence/bv-r5q/after/metrics.json). Regressões também cobrem fenda diurna antes de mount, retomada noite/dia, interpolação no uso, modo reduzido e checkpoint parcial às 18h00:10 sem alteração de capture().

## B — Instrumentação e isolamento

`scripts/benchmark-quest-opening.mjs` monta **WorldHost, NarrativePanel, NarrativeSession e runtime reais**, com os quatro GLBs R5P, CSS produtivo e seis categorias vazias fictícias. O harness instrumenta temporariamente métodos/Profiler somente na página isolada; essa instrumentação não entra no APK nem grava dados. Não há diagnóstico permanente novo ou mudança de contrato narrativo.

| Etapa           | Observação registrada                                                              | Limite                                                                                |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1. Recebimento  | receivedAt e retorno do handler                                                    | gesto sintetizado, exclui hardware/bridge/input-to-photon                             |
| 2. Picking      | pickCpu e raycastCpu                                                               | pickCpu inclui preparação, highlight e publicação; não somar tempos aninhados         |
| 3. Highlight    | highlightCpu e highlightFollowCpu                                                  | bounds deformados reais, inclusive acompanhamento após seleção                        |
| 4. Semântica    | selectionPublishCpu                                                                | inclui listeners síncronos do runtime/host                                            |
| 5. talk()       | talkCpu, contagem de chamadas                                                      | inclui aplicação síncrona da narrativa; idempotência preservada                       |
| 6. React        | Profiler actualDuration, commits e domCommitAt                                     | commit DOM não é paint/composição                                                     |
| 7. Agência/cena | interrupt/conversation/applyNarrative e passo de cena                              | rotina autônoma congelada igualmente para manter poses; conversa continua real        |
| 8. Apresentação | primeira/segunda oportunidade RAF após evento, opacity observada e submissão WebGL | apresentação física/compositor não medidos; não chamar RAF de primeira imagem exibida |

CPU/DOM: Vite/React de desenvolvimento com Profiler e renderer double sem WebGL, mas modelos, câmera, bounds, raycasts e React reais. 800×700, DPR1, viewport do mundo 800×480, mesma câmera por habitante, posições fixas e mesmos passos de animação. Uma nova montagem por hora/habitante/via distingue primeira abertura da repetição e do card já aberto. Foram **48 casos por versão**: dia/noite × quatro habitantes × Canvas/botão React × first/repeat/already-open. Botão recebe foco e click DOM; Canvas recebe PointerEvents. Não são gestos físicos Android.

A iluminação de B é estabilizada igualmente antes de cada comparação, sem misturá-la ao bug A. Os primeiros desenhos A são capturados separadamente, antes dessa estabilização. Em card já aberto pode haver zero commit porque talk() é idempotente; isso não é medição ausente de um card novo. Relógio fixo, timer com granularidade observada de 1 ms, amostra única e sem replicação estatística. Tarefas/sessões reais e todas as fases sociais dos habitantes não foram caracterizadas em desempenho.

Reprodução a partir do checkout com dependências instaladas:

```bash
R5Q_BASE_DIR=$(mktemp -d /tmp/bv-r5q-base.XXXXXX)
git archive e3b437ac6c4c2092b8d4db1b3a54b525ed3982e9 | tar -x -C "$R5Q_BASE_DIR"
ln -s "$PWD/node_modules" "$R5Q_BASE_DIR/node_modules"
BV_R5Q_ROOT="$R5Q_BASE_DIR" node scripts/benchmark-quest-opening.mjs /tmp/r5q-before
node scripts/benchmark-quest-opening.mjs /tmp/r5q-after
# Passagem curta adicional com renderer WebGL real:
BV_R5Q_WEBGL=1 node scripts/benchmark-quest-opening.mjs /tmp/r5q-webgl
```

[Resumo](evidence/bv-r5q/summary.json) · [todos os grupos antes/depois](evidence/bv-r5q/comparison.json) · [tabela por hora/via/abertura](evidence/bv-r5q/quest-comparison.md). Tempos abaixo são P50/P95 por nearest-rank do **host**, não latência Moto G06:

| Custo CPU/DOM, 24 casos por via  | P50 antes → depois (ms) | P95 antes → depois (ms) |
| -------------------------------- | ----------------------: | ----------------------: |
| Handler Canvas completo          |                 52 → 33 |                 66 → 57 |
| Raycast dentro do handler        |                  18 → 7 |                 28 → 13 |
| Handler botão React              |                   4 → 4 |                 10 → 12 |
| React actualDuration, via Canvas |                   6 → 6 |                   8 → 9 |
| React actualDuration, via botão  |                   6 → 6 |                   8 → 8 |

O bloqueio de JS comprovado no fixture concentra-se no picking. talk(), publicação e aplicação à agência ficaram geralmente abaixo da resolução de 1 ms nos grupos; não foram considerados gratuitos nem descartados no aparelho. Houve zero ou um commit por evento, sem evidência de avalanche de renders. As chamadas duplicadas/idempotentes de talk() não justificaram refatorar a narrativa. CSS usa a animação de entrada existente de 220 ms, opacidade/transform, sem backdrop-filter específico no card; essa animação foi mantida, sem atrasos novos ou remoção para mascarar custo.

## B — Correção orientada pela medição

R5P já prepara world × inverseBind por Skeleton/consulta. Ainda assim, bounding box, bounding sphere e triângulos do raycast pediam várias vezes **o mesmo vértice na mesma pose**. R5Q habilita reutilização exata dos resultados apenas durante a consulta síncrona de toque. Float64 preserva as coordenadas CPU; Uint8 marca os índices preenchidos. Métodos são restaurados em finally e cada nova consulta começa vazia, inclusive após animação/mudança de pose. Morfos e leitores personalizados mantêm o caminho anterior.

O acompanhamento de highlight por frame conserva o modo R5P sem esses buffers, pois visita cada vértice uma vez. Não há cache entre frames, remoção de vértices/rigs/clips, aproximação de bounds, simplificação do raycast, exclusão de habitantes ou mudança de prioridade de seleção. O oracle compara todos os vértices, boxes/spheres, pontos/distâncias/faces/hits dos quatro GLBs em idle/walk/magic com e sem cache: igualdade exata. Publicação, highlight, quest, foco e animação continuam no mesmo fluxo, sem postergar o card.

Tradeoff explícito: buffers temporários de até 25 bytes por vértice preparado (3×Float64 + Uint8), restritos ao toque e liberáveis após a consulta; não é medição de RAM Android ou prova de GC sem custo. Preservados os ganhos do guard de luz e da preparação de matrizes da R5P. Não houve motivo demonstrado para alterar React, CSS, contrato de quests ou persistência.

## Renderer e incerteza de apresentação

[WebGL antes](evidence/bv-r5q/webgl-before/metrics.json) / [depois](evidence/bv-r5q/webgl-after/metrics.json): oito casos por versão, Samael, dia/noite, Canvas/React, primeira/repetida, Chromium SwiftShader real. **Zero submissões durante o handler** em todos esses casos; a RAF existente recebe a alteração. Primeiro submit posterior via Canvas diurno: 129→127 ms; noturno: 14→41 ms. Primeira via React noturna: 51→56 ms; repetições: aproximadamente 5–10 ms. Há uma variante/programa adicional ao apresentar o highlight; contagem não isola compilação/link, upload ou espera de driver. Ordem fixa e cache do driver entre contextos também limitam inferências.

Não se comprovou ganho consistente de renderer, nem se atribuiu todo o travamento à compilação ou ao CSS. renderer.render mede CPU/submissão e pode incluir espera do driver, **não GPU**. As oportunidades RAF/commit/opacity não comprovam quando o card apareceu no display. GPU, composição, input-to-photon e fluidez física no Moto G06 continuam sem medição pelo agente. Se o primeiro card ainda travar no aparelho, esses caminhos precisam de evidência física adicional; não foram introduzidos prewarm, timers, reduções artísticas ou atrasos especulativos.

## Validação e publicação

[Gates locais](evidence/bv-r5q/local-gates.json): formato/check, lint global, tipos, build, áudio, performance report, Android sync/debug e diff check PASS. Primeira rodada dirigida: **126 PASS/9 arquivos**. Ampla única: **972 PASS/1 FAIL em 154 arquivos**; a falha era a fixture do novo teste reduzido tentando espionar matchMedia inexistente no jsdom. Corrigida para mock explícito, sem alterar produto, assert ou prazo; arquivo de runtime inteiro reexecutado: **55/55 PASS**. Assim, **973 casos unitários distintos passaram entre as execuções**; não se afirma uma segunda ampla verde que não foi executada. [Preparação e falha discriminadas](evidence/bv-r5q/preparation.json).

[Lifecycle WebGL real, um ciclo](evidence/bv-r5q/lifecycle/lifecycle.json): pausa/retorno, frame antigo, seleção e encerramento terminal de contexto; zero omissões/duplicações de recursos e zero listeners/RAF/observers próprios pendentes. Não é medição prolongada de heap/GC. R5P/R3 conservam a pendência global de memória.

E2E dirigido executado uma vez, sem retry: **0/1 PASS**, BF-4F1 Canvas, deadline global de 30 s em scrollIntoViewIfNeeded, linha 60, esperando estabilidade. O mesmo cenário/etapa está registrado na R5P, mas não se presume causa idêntica ou ausência de regressão. Traces/contextos permanecem localmente em test-results; classificação compacta em local-gates.json. Nenhum arquivo E2E, assert ou timeout alterado. Demais falhas R2/R5P não foram repetidas e continuam abertas; **sem CI global verde**.

Não houve instalação/teste físico R5Q: ADB sem aparelhos. APK final e fonte conferidos no ZIP (bundle inicial + runtime e quatro GLBs inalterados), em [apk.json](evidence/bv-r5q/apk.json). Warnings conhecidos de chunk >500 kB e Gradle flatDir permanecem.

Mesma PR draft #40, commit `[skip ci]`, sem merge ou fase nova. Gatilhos conferidos: CI push main/pull_request e preview dispatch/push main filtrado; nenhum dispatch/rerun autorizado. Dexie v14, backup v6, IDs, quatro GLBs/rigs/clips, seis tipos e checkpoints preservados. R5 e recuperação integral abertas; avaliação artística não é reaberta por este saneamento.

APK debug final: `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5Q-debug.apk` (também `android/app/build/outputs/apk/debug/app-debug.apk`), **10,641,553 B**, SHA-256 `61616603429cb544eaf154e053e021d667261288f5e134b676e300053c9707d7`. Bundles e hashes de fontes registrados para ligar o artefato à implementação. O tamanho total coincide com R5P; hashes/bundles são diferentes e o conteúdo atual foi conferido, sem mudança de versão.

**Candidata localmente verificada nos limites acima, aguardando teste físico de abertura/quests.** A melhora de CPU host e o primeiro desenho correto não comprovam que todo travamento percebido no Moto G06 terminou. R5 não concluída.

## Roteiro Moto G06

Instalar o APK debug final preservando os dados. Testar abertura diurna, abertura noturna direta (18h/23h/03h conforme ocasião) e retorno de background atravessando mudança de período: primeiro desenho deve corresponder ao horário, sem flash claro. Conferir anoitecer suave no uso, manhã, nove luminárias, ritual/fallback e estado narrativo de fenda em curso. Não alterar o relógio real para simular teste sobre sessões pessoais ativas.

No mesmo catálogo/câmera, tocar cada habitante: primeira quest, adiar/reabrir, card já aberto e troca de personagem; repetir por botão acessível, dia/noite. Conferir seleção/highlight, heading com foco, Escape/Back e devolução de foco, escolhas e progresso mantidos na visita. Repetir com movimento reduzido e após background/retorno. Anotar travamento percebido e diferenciar toque→card, entrada animada e navegação posterior. Sem aprovação física automática: **critério continua ser abrir diretamente na atmosfera correta e abrir quests sem travamentos perceptíveis no Moto G06**.
