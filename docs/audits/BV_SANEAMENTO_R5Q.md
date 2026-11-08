# R5Q — Inicialização noturna e fluidez das quests

> **Complemento R5R (08/11/2026):** polimento perceptivo autorizado de quests e legibilidade mágica, sobre `c6ca582`. Header/frame/Adiar integrais no commit e conteúdo em 120 ms sem delay; diagnóstico CSS passa a observar o conteúdo. Halos/emissão reforçam os seis alvos sem novas luzes dinâmicas. R5/arte e comprovação física da suavidade permanecem abertas. [Relatório vigente R5R, capturas e gates](BV_POLIMENTO_R5R.md). O harness agora registra viewport efetivo 800×700; a menção histórica a Canvas 800×480 não correspondia ao min-height produtivo.

> **R5Q residual — aceite físico de 08/11/2026:** proprietário instalou `94bae8b` no Moto G06: **PASS abertura diretamente noturna; PASS fluidez geral preservada; PARCIAL abertura de quests, melhor mas ainda com engasgos**. São observações humanas dirigidas, sem FPS/latência quantitativa. Esta rodada modifica somente o cálculo imediato do highlight e o diagnóstico opt-in de abertura. Iluminação aprovada preservada; R5 e arte continuam pendentes. [Investigação complementar](#complemento--engasgo-residual-das-quests).

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

## Complemento — engasgo residual das quests

Base limpa `94bae8bbf95863d6e847b18cbdff4fae24e545e0`; mesma branch/PR draft #40. O aceite físico acima substitui o estado pendente da primeira candidata descrita nas seções históricas. Não há novo teste físico pelo agente: ADB continua sem aparelho. O objetivo aqui é exclusivamente seleção → abertura de quest; primeiro desenho noturno, nove luminárias, transições, fallback, ganhos R5P, contratos narrativos e persistência não foram reformados.

### Evidência e intervenção mínima

A consulta R5Q reutilizava vértices para boxes, spheres e triângulos, mas encerrava esse escopo **antes** de calcular o bounds exato do highlight. Assim, o habitante escolhido passava por outro skinning completo na mesma pose e no mesmo handler. O benchmark da base registrou highlight síncrono P50 de 7 ms na primeira seleção via Canvas e 5 ms na reabertura (P95 21/8 ms). Isso confirma trabalho repetido de CPU; não prova que ele explique todo o engasgo residual Android.

Agora a mesma consulta preparada calcula também o Box3 preciso do habitante atingido. Só esse box destacado sai do escopo; leitores são restaurados em finally **antes da publicação e de talk()**. applyHighlight continua criando o mesmo Box3Helper, com mesmos recursos/cor/descarte. Botão React e acompanhamento por frame mantêm seu caminho anterior. Nenhum cache persiste entre toques/frames; não há novas matrizes, arrays de vértices ou redução de precisão além dos temporários R5Q já existentes. Regressão com os quatro GLBs em idle/walk/magic exige box idêntico ao cálculo nativo, uma leitura base por vértice e métodos restaurados no callback semântico. Oracle anterior de vértices/faces/hits permanece.

O harness anterior carregava somente styles.css e não reproduzia a cascata final do App. Corrigido para importar também styles-legacy.css e styles-atelier.css, com ancestrais app-shell/library-page. **Correção da afirmação histórica sobre animação:** na composição final o card usa living-panel-arrive de **155 ms**, fundo com ornamento/gradiente e backdrop-filter:none; a regra base realm-reveal/220 ms não é a regra final. CSS produtivo não foi alterado. Isso melhora a validade da investigação, sem comprovar gargalo no compositor.

Nova rodada CPU/DOM: **64 casos por versão**, quatro habitantes × dia/noite × Canvas/botão × primeira/reabertura/já aberto/troca. Mesmo viewport 800×700, DPR1, câmera/zoom2 por habitante, GLBs, poses e registros fictícios vazios; agência autônoma congelada igualmente, clips mantidos, luz estabilizada antes das medições. Base completa arquivada, sem misturar fontes. [Antes](evidence/bv-r5q/residual/before/metrics.json), [depois](evidence/bv-r5q/residual/after/metrics.json), [comparativo](evidence/bv-r5q/residual/comparison.json).

| Handler CPU, host (8 casos/grupo) | P50 antes → depois | P95 antes → depois |
| --------------------------------- | -----------------: | -----------------: |
| Canvas · primeira                 |         52 → 46 ms |         97 → 79 ms |
| Canvas · reabertura               |         48 → 40 ms |         65 → 58 ms |
| Canvas · troca                    |         42 → 31 ms |         56 → 43 ms |
| Canvas · já aberto                |         39 → 42 ms |         53 → 56 ms |
| Botão · primeira                  |         10 → 11 ms |         24 → 23 ms |
| Botão · reabertura                |           6 → 6 ms |           9 → 9 ms |
| Botão · troca                     |           5 → 5 ms |         10 → 12 ms |
| Botão · já aberto                 |           1 → 0 ms |           1 → 1 ms |

Uma passagem por versão, sem distribuição de repetições: P95 nearest-rank de oito casos corresponde ao máximo. Dispersão, JIT, carga do host e diferenças entre personagens limitam inferência. O grupo já aberto não recalcula highlight e não demonstra ganho; pequenas oscilações não são “correções”. Profiler continua mostrando zero/um commit por evento, sem avalanche de renders. Custos aninhados não devem ser somados. A medida antiga highlightCpu agora captura só a construção do helper no Canvas: o cálculo do box foi movido para dentro de pickCpu; **não comparar essa coluna isolada como custo total de highlight**. O diagnóstico embarcado delimita highlightStart antes do box e highlightEnd após o helper.

Os cliques do harness são sintéticos. Na UI real, o card aberto oculta Explorar: “já aberto/troca” por button.click() exercitam o handler, mas não representam um controle acessível visível nessa condição. No aparelho, adiar A e escolher B pelo botão é a troca acessível disponível; a troca com card aberto é exercitada pelo Canvas. A interação real e a montagem completa da rota continuam sendo o gate físico, não esse fixture de WorldHost.

### WebGL, foco e limite da causa

[Passagem WebGL da base](evidence/bv-r5q/residual/webgl-before/metrics.json) e [candidata com diagnóstico opt-in](evidence/bv-r5q/residual/webgl-opt-in/metrics.json): 12 casos por versão, Samael, dia/noite, duas vias, primeira/reabertura/troca, CSS final e Chromium/SwiftShader. Ambas habilitam o probe existente; a candidata acrescenta os marcos locais. Zero submissões dentro do handler. Há aumento de 21 para 22 programas na primeira submissão do highlight; contagem não isola compilação/link, upload ou espera do driver. Tempos de submissão seguem irregulares: ver [tabela compacta](evidence/bv-r5q/residual/webgl-comparison.json). A candidata registrou 2531 ms no wrapper renderer.render da troca noturna via Canvas (2534 ms no par submit do probe, que inclui seu encerramento) e 400 ms no primeiro submit diurno; a base também teve 2404 ms na troca noturna via botão; não se escondeu esse resultado nem se transformou em FPS/GPU Android.

Em uma abertura, o foco síncrono após commit custou 29 ms; outras ficaram menores. Render/commit, layout provocado por foco e submissão merecem discriminação no aparelho, mas uma amostra host não autoriza remover foco, animação, highlight ou preaquecer recursos especulativamente. Primeiro e segundo RAF são oportunidades de execução; commit é DOM; eventos animationstart/end indicam despacho CSS na thread principal. **GPU física, rasterização/composição e input-to-photon não foram medidos. Causa dominante do engasgo residual Moto G06 continua indeterminada.** O mecanismo repetido de CPU foi corrigido; não se declara o problema físico resolvido.

### Diagnóstico embarcado, local e opt-in

Reutiliza PerformanceProbe e o painel existente: ferramentas acessíveis → Explorar → Diagnóstico do mundo → **R5Q · abertura de quests** → “Registrar próximas seleções localmente”. Nada se ativa automaticamente. Até **12 registros**, somente origem canvas/accessible, IDs fixos dos habitantes, estado aberto/fechado, offsets numéricos, contadores de programas e long tasks. Não contém textos, IDs de registros pessoais, relógio civil, telemetria, Dexie, backup ou arquivo persistido. A textarea permite selecionar/copiar voluntariamente. Fechar o diagnóstico desativa e apaga; pausa/retomada invalida a abertura em andamento, evitando medir background como latência. “Zerar amostras” inicia uma rodada vazia.

- Marco zero: entrada no trecho do handler de pointerup confirmado ou onClick, excluindo hardware, duração do toque e fila anterior ao handler.
- prepared−pickStart: preparação de matrizes/boxes/spheres; raycastEnd−raycastStart: interseções. pickEnd inclui highlight e publicação.
- highlightEnd−highlightStart: bounds preciso e helper imediato; publish/talk/narrative Start/End: primeira chamada síncrona, com tempos aninhados. Chamadas idempotentes posteriores não viram novas aberturas.
- reactCommit: observação via layout effect depois da mutação DOM; offset inclui espera/render/commit, não duração isolada do render React nem apresentação. focusStart/End: foco acessível existente.
- sceneStart/End e submitStart/End: primeira atualização e submissão posteriores no loop/renderer existentes. Resize pode produzir uma submissão antes da próxima atualização; os pares são independentes. ProgramsBefore/After não são duração de compilação.
- animationStart/End: eventos do próprio card, ignorando filhos. Troca sem remontagem/reduced motion pode não emitir eventos; ausência é válida. Um animationend tardio sem start da mesma observação é ignorado. Nenhum RAF, timer, sleep ou controlador novo.
- Long tasks suportadas pelo browser: contagem/máximo de tarefas que sobrepõem o primeiro segundo da abertura, limitada pela próxima seleção; podem incluir trabalho externo e chegar depois do snapshot. Ausência/zero não comprova falta de bloqueio. O probe geral mantém percentis CPU/RAF e timer GPU assíncrono quando disponível, com as ressalvas R5P.

Depois do retorno do handler, adiar/decidir uma quest não acrescenta trabalho síncrono a essa abertura. Cada marco é registrado uma vez; snapshots são destacados, listas limitadas e observer/listeners são os já geridos pelo lifecycle. Sem ativação, não há leitura adicional de performance.now por marco ou buffers de abertura. O diagnóstico tem custo próprio e deve ser desligado ao avaliar a sensação final.

### Validação complementar

Resultados finais e APK em [gates](evidence/bv-r5q/residual/local-gates.json) e [proveniência do APK](evidence/bv-r5q/residual/apk.json). Dirigidos estabilizados: **120 PASS/7 arquivos**. Ampla única: **981 PASS/1 FAIL em 154 arquivos**; teste existente do hover real de Ytha, linha 89, excedeu 5000 ms (6119 ms reportados). É uma ocorrência desta rodada, não dívida E2E histórica. Houve concorrência com o benchmark WebGL; contenção é hipótese, não causa provada. Uma execução isolada do arquivo sem o benchmark: **3/3 PASS**, teste/asserts/timeout inalterados. **982 casos distintos passaram entre execuções**, sem uma segunda ampla verde. Após ajustar atribuição de long tasks sobrepostas e limpeza terminal do probe: **61/61 PASS** em probe/runtime, conjunto sobreposto.

Formato/check, lint global, tipos, áudio, build, performance report, Android sync/debug e diff check PASS. [Lifecycle WebGL, um ciclo](evidence/bv-r5q/residual/lifecycle/lifecycle.json): pausa/retomada/context loss terminal, zero recursos próprios sem descarte ou descartados duas vezes, zero listeners/observers/RAF próprios pendentes; não prova heap/GC prolongado. Warnings existentes de chunks >500 kB e Gradle flatDir mantidos.

Os registros WebGL opt-in foram capturados durante desenvolvimento do probe; sua atribuição de long tasks foi corrigida depois para incluir tarefas iniciadas antes do handler que sobrepõem a abertura, coberta por teste numérico. Os zeros históricos nesses snapshots não são prova de ausência de long tasks. O mecanismo de performance medido permaneceu o mesmo; não houve nova rodada WebGL para perseguir outliers.

A primeira rodada dirigida teve 113 PASS/1 FAIL: jsdom expõe WebkitAnimation sem AnimationEvent e React registrou nomes prefixados; fixture passou a despachar os nomes corretos, preservando asserts. Nova regressão em Chromium usa os eventos CSS nativos. Lint inicial encontrou cinco problemas de tipagem em testes novos; corrigidos com mocks tipados, guarda de tipo e referência ligada, sem any/cast cego/omissão. Nenhum E2E, prazo ou assert histórico alterado.

E2E global não foi repetido nesta rodada: permanece o **0/1 histórico da R5Q**, deadline de estabilidade em scrollIntoViewIfNeeded linha 60, além das dívidas R2/R5P. Benchmarks dirigidos fazem asserts de seleção/card/foco e usam teardown; não substituem a suíte E2E do produto. Sem CI global verde e sem retry/loop. Publicação única com [skip ci], workflows inalterados, nenhum dispatch/rerun e sem merge.

APK complementar: `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5Q-quests-debug.apk`, **10,641,553 B**, SHA-256 `0d5a4b86f340e1d0a942a0f7b7f48864a9dcbdfbad38d52481c094e4fcb529b9`. Bundles inicial/runtime conferidos byte a byte com dist no ZIP, quatro GLBs idênticos às fontes; hashes das fontes ligam o artefato à implementação, sem mudança de versão. O APK não foi instalado/testado fisicamente pelo agente.

### Roteiro físico limitado às quests

1. Instalar o APK complementar preservando dados. Sem diagnóstico, mesma câmera: abrir cada um dos quatro habitantes, adiar, reabrir e trocar para outro pelo Canvas. Distinguir demora até o card, engasgo da entrada e navegação posterior. Repetir por botões acessíveis, adiando a conversa antes de escolher outro. Conferir highlight, heading com foco, Back/Escape e escolhas, sem reiniciar progresso.
2. Se persistir, ativar o registro opt-in, zerar amostras e fazer uma rodada curta com o mesmo habitante: primeira abertura desta visita, adiar/reabrir e trocar; Canvas e botão. Ao adiar, voltar ao painel e selecionar/copiar os registros. Identificar apenas dia/noite, via e quais ações engasgaram. Não alterar relógio/dados para simular noite; repetir à noite na ocasião se a diferença for relevante.
3. Handler/picking/highlight alto somente no Canvas aponta para CPU da seleção. talk/narrative altos apontam publicação; distância handlerEnd→reactCommit alta ainda combina fila, render e commit; focus alto aponta layout/foco. submit alto mesmo via botão sugere custo/espera no renderer/driver; não prova GPU ou compilação. Marcos curtos com engasgo visível de entrada deixam raster/compositor/display como hipótese, exigindo profiling Android externo para confirmação. Eventos CSS curtos/tardios não medem imagem exibida.
4. Fechar o diagnóstico e repetir uma vez a ação incômoda. Informar se ficou satisfatória. Iluminação e fluidez geral já aprovadas são controles preservados; não é necessário reabrir sua avaliação nesta rodada. **Quest ainda aguarda comprovação física; R5 e avaliação artística continuam abertas, sem merge.**
