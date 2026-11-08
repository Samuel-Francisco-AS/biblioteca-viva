# R5P — Recuperação da fluidez noturna

07/11/2026. Mesma branch `feat/bv-r5-renascimento-artistico` e [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40). Base conferida, limpa, local/remota `0a50fad83e70dfd39e55889386098f138827c282`. Pedido expresso do proprietário autoriza saneamento, commit/push e atualização desta PR, sem merge ou fase seguinte.

O proprietário instalou R5E no Moto G06 e relatou lag/travamentos relevantes, piora percebida na passagem para noite e poucas diferenças artísticas perceptíveis além da escala de Ytha. Aura de Samael, magia de Lua e interações de Aryn não foram consideradas suficientemente visíveis. **R5/R5E não aprovadas; avaliação artística suspensa até a navegação voltar a ser satisfatória.** Contexto R1–R4 e aceites dirigidos já registrados permanecem, com suas ressalvas; não há encerramento da recuperação integral.

## Diagnóstico e hipóteses

Inspecionados runtime, livingVisuals, inhabitantPresence/Visuals, frameMetrics/performanceProbe e NightLightingSession, confrontados com R1–R4 e R5E. `shadowMap.enabled=false`: nenhuma causa atribuída a sombras. Nove luzes âmbar de raio 6,5 m + luz feérica de Ytha de 2,4 m; luzes manuais/narrativas permanecem independentes.

- **Iluminação por fragmento:** o `lights_fragment_begin` do Three r185 chama `getPointLightInfo` e `RE_Direct` para todas as PointLights, inclusive fragmentos além do raio. A função de atenuação zera a contribuição além do cutoff, mas só depois de normalização, distância/pow e preparação do BRDF. Luzes finitas não são automaticamente restringidas por cômodo/mesh. Distância finita não elimina esse trabalho global.
- **Variantes/compilação:** variar `.visible` muda o número de pontos e a chave de shader. Medir primeira transição separadamente da cena aquecida; programas acumulados não são tempo de compilação. As nove luminárias entram juntas no primeiro update noturno; o ritual modifica intensidade/núcleos/estado, sem necessariamente criar nove variantes sucessivas.
- **Transparência/overdraw:** núcleos e FX preservados em todos os pares B/C/D/E. C remove apenas os nove pontos, não suas superfícies luminosas. Sem atribuir transparência residual ao custo de luz por contagem isolada.
- **Deformação/CPU:** mesmos quatro GLBs, rigs, clips, efeitos, posições e dt. Sem redução de polígonos/habitantes/qualidade/AA/DPR. Comparação isola luz; agência é congelada igualmente apenas no harness, com atualização dos visuais/mixers mantida. Esse isolamento não mede todos os custos da agência em sessão real.
- **Lifecycle/input:** RAF único e controle de câmera existentes; instrumentação sem controlador/RAF próprio no produto. Sem custo de bridge Capacitor por frame introduzido.

## Experimento reproduzível

`scripts/benchmark-night-lighting.mjs` usa runtime real, seis categorias/24 registros fictícios e quatro pergaminhos, quatro habitantes R5E carregados e mesmas poses/clips. Chromium headless/SwiftShader, 800×600, DPR1, AA ligado, sombras desligadas, sem seleção. Mesmo percurso de câmera por índice para todos os pares em pan/pinch; parada mantém câmera fixa. A cada caso, montagem isolada e relógio simulado determinístico, sem Dexie. Animação avança 16,667 ms por frame; RAF observado vem do navegador, não desse dt. Não é tempo de frame Android nem movimento humano. 8 frames de aquecimento + 32 amostras; P99 de intervalo tem amostra pequena e é próximo do máximo.

| Caso      | Atmosfera e contribuições                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| A         | Dia original + Ytha                                                                                                  |
| B         | Noite completa original, nove pontos + Ytha                                                                          |
| C         | Mesma noite sem contribuição dos nove pontos, núcleos/emissão/cores/fundo intactos                                   |
| D         | Mesma noite, três pontos mais próximos do alvo inicial, fixos durante todo movimento; nove luminárias visuais acesas |
| E         | Mesma noite original sem PointLight de Ytha; seus FX/rig intactos                                                    |
| A-no-ytha | Isolamento adicional da luz feérica durante o dia                                                                    |

Cada um separa cena parada e pan/pinch contínuo. Contadores por frame e percentis RAF/CPU/long tasks em JSON, sem conversão para FPS Android. Backend de software não mede GPU física. A API de timer é consultada sem waits bloqueantes; resultado só é lido disponível e sem disjoint. Suporte à extensão sem resultados válidos não autoriza inventar tempo GPU.

A leitura visual acontece após as amostras. Um fence WebGL é consultado assincronamente, sem `finish`, para drenar comandos antes da captura e não confundir fila de screenshots com latência de interação. Essa drenagem não integra métricas RAF/CPU. `preserveDrawingBuffer=false`, como no produto.

Reprodução da base imutável (dependências instaladas no checkout):

```bash
R5P_BASE_DIR=$(mktemp -d /tmp/bv-r5p-base.XXXXXX)
git archive 0a50fad83e70dfd39e55889386098f138827c282 | tar -x -C "$R5P_BASE_DIR"
ln -s "$PWD/node_modules" "$R5P_BASE_DIR/node_modules"
BV_R5P_ROOT="$R5P_BASE_DIR" node scripts/benchmark-night-lighting.mjs docs/audits/evidence/bv-r5p/before R5E 0a50fad83e70dfd39e55889386098f138827c282
node scripts/benchmark-night-lighting.mjs docs/audits/evidence/bv-r5p/after R5P
```

Preparação: primeira execução invalidada por HMR durante edição; substituída por arquivo imutável da base. Segunda encontrou timeout de screenshot por fila do software; amostras parciais não usadas no comparativo final. Correção fundamentada: buffer de apresentação normal, rodada compacta e drenagem assíncrona após medição. Sem aumentar timeout, retirar assert ou retry E2E. Limites/falhas de preparação ficam separados dos gates do produto.

## Resultado e interpretação

[Comparativo completo](evidence/bv-r5p/comparison.json), [antes](evidence/bv-r5p/before/metrics.json), [candidata](evidence/bv-r5p/after/metrics.json) e [tabela compacta](evidence/bv-r5p/comparison.md). Valores são do **host/SwiftShader**, nunca FPS/GPU Android. Todos os pares mantiveram exatamente os contadores WebGL de cada frame, câmera e poses dos quatro habitantes.

| Caso                    | RAF antes P50/P95/P99 (ms) | RAF candidata P50/P95/P99 (ms) | CPU fora render P95 antes → depois (ms) | CPU submissão P95 antes → depois (ms) | Pontos | Long tasks n antes → depois |
| ----------------------- | -------------------------- | ------------------------------ | --------------------------------------- | ------------------------------------- | ------ | --------------------------- |
| A-day-still             | 16.8/750.0/1016.6          | 33.3/866.7/2083.3              | 1.0 → 1.2                               | 9.4 → 19.6                            | 1      | 0 → 0                       |
| A-day-pan-pinch         | 16.7/483.3/633.3           | 16.7/1149.9/1800.0             | 1.1 → 1.2                               | 9.7 → 13.4                            | 1      | 0 → 0                       |
| B-night-still           | 16.7/1366.6/1449.9         | 16.7/2233.2/2349.9             | 1.0 → 1.0                               | 8.5 → 14.4                            | 10     | 0 → 0                       |
| B-night-pan-pinch       | 16.7/2333.2/2699.9         | 16.7/2166.6/2416.6             | 1.0 → 1.1                               | 15.0 → 15.2                           | 10     | 0 → 0                       |
| C-no-lamps-still        | 16.7/500.0/500.0           | 16.7/550.0/550.0               | 1.2 → 1.2                               | 10.5 → 11.5                           | 1      | 0 → 0                       |
| C-no-lamps-pan-pinch    | 16.8/550.0/566.6           | 16.7/483.3/500.0               | 0.9 → 0.8                               | 11.3 → 14.4                           | 1      | 0 → 0                       |
| D-three-lamps-still     | 16.7/1499.9/1550.0         | 16.7/983.2/1133.4              | 1.3 → 0.9                               | 12.3 → 9.6                            | 4      | 0 → 0                       |
| D-three-lamps-pan-pinch | 16.7/1633.2/2549.8         | 33.4/1566.6/1949.9             | 0.9 → 1.2                               | 13.7 → 20.5                           | 4      | 0 → 0                       |
| E-no-ytha-still         | 16.7/2599.9/2633.3         | 16.7/1550.1/1999.9             | 1.0 → 1.1                               | 18.6 → 14.5                           | 10     | 0 → 0                       |
| E-no-ytha-pan-pinch     | 16.7/2416.6/2566.6         | 16.7/1616.6/1649.9             | 0.8 → 1.0                               | 16.4 → 16.0                           | 10     | 0 → 0                       |
| A-no-ytha-still         | 16.7/616.6/633.3           | 16.7/383.4/400.0               | 1.0 → 1.0                               | 14.2 → 8.6                            | 1      | 0 → 0                       |
| A-no-ytha-pan-pinch     | 16.7/400.0/616.6           | 16.7/699.9/733.4               | 0.8 → 1.0                               | 9.8 → 12.5                            | 1      | 0 → 0                       |

Na base, B→C derruba P95 RAF 1366,6→500,0 ms parado e 2333,2→550,0 ms em movimento, com mesma geometria/FX noturnos e CPU fora do render perto de 1 ms. Há custo significativo associado aos nove pontos no software. D tem resultado misto, e E não demonstra benefício confiável da retirada de Ytha. Remover sua luz não foi adotado. Cena diurna também sofre com a execução software; a iluminação não explica todo atraso possível.

**A candidata não demonstrou ganho consistente de RAF no host.** B parado piorou 1366,6→2233,2 ms no P95; B em movimento variou 2333,2→2166,6 ms. Amostra curta, submissão assíncrona/filas do software, JIT e possível sobreposição dos primeiros casos da candidata com ferramentas estáticas limitam causalidade. Não se publicou porcentagem de ganho, FPS sustentado, redução de input latency, nem superioridade de GPU/Android.

O timer WebGL retornou zero amostras válidas na base (queries na cauda descartados pela primeira versão da coleta); **GPU da base não medida**. A coleta da candidata recolhe cauda assincronamente, fora da janela RAF/CPU. Oito amostras de timer por caso são de **SwiftShader**, não GPU física e não um A/B de GPU: B parado P50 1146,7 ms, C 326,7 ms, D 612,3 ms, E 1311,2 ms. Nos dois ambientes, **GPU física, compositor/input-to-photon, temperatura e Moto G06 não medidos**. Extensão disponível com backend software não equivale a medição real de GPU.

Causa confirmada no código e sustentada pelo isolamento host: trabalho de iluminação global também para contribuições que já são nulas por distância. **Causa dominante dos travamentos físicos ainda indeterminada.** O hotspot CPU condicionado à seleção/toque foi medido separadamente e corrigido abaixo. Não há evidência para culpar sombras, reduzir rigs/polígonos/FX ou declarar CPU/driver/compilação descartados no Android. Programas acumulados ficaram em 26 em todos os pares; essa contagem não mede stall de compilação nem resolve a primeira transição física.

## CPU de geometria deformável: custo confirmado e corrigido

A iluminação não encerra o diagnóstico. Inspeção adicional de `ThreeWorldInteraction` encontrou bounds precisos por vértice para personagem selecionado a cada frame, e bounding box/sphere de todos os rigs antes de cada raycast. O Three r185 recompunha `bone.matrixWorld × inverseBind` por influência de cada vértice em cada leitura. Isso é CPU, independente da iluminação, e pode contribuir para travamento ao selecionar/tocar.

[Probe CPU pareada](evidence/bv-r5p/inhabitant-cpu.json), reproduzível por `node scripts/benchmark-inhabitant-cpu.mjs <saida.json>`: quatro GLBs reais, mesmos clips idle/poses, 8 aquecimentos + 32 amostras por caminho; inclui custo de preparar paletas/métodos temporários. **Sem renderer, RAF, GPU ou Android.** Mede bounds; não todo o handler de tap nem input-to-photon. Os highlights são alternativas individuais, não quatro seleções simultâneas.

| Consulta CPU (host)             | P50 antes → depois (ms) | P95 antes → depois (ms) | P99 antes → depois (ms) |
| ------------------------------- | ----------------------- | ----------------------- | ----------------------- |
| Bounds de toque dos quatro rigs | 75.83 → 28.21           | 78.24 → 28.73           | 79.73 → 29.04           |
| Highlight de Samael             | 6.35 → 2.54             | 6.76 → 2.75             | 6.84 → 2.84             |
| Highlight de Aryn               | 11.38 → 4.54            | 12.01 → 4.82            | 12.79 → 5.21            |
| Highlight de Ytha               | 14.93 → 6.01            | 15.63 → 6.12            | 15.77 → 6.15            |
| Highlight de Lua                | 6.73 → 2.70             | 7.14 → 2.82             | 7.35 → 2.82             |

Mixers/matrizes/presença dos quatro juntos: P95 0,40 ms original e 0,16 ms na segunda passagem; esse caminho não foi alterado, e sua variação/JIT não é ganho atribuído à correção. Bounds de toque caíram cerca de 63% e highlight de Ytha cerca de 60% nesta amostra CPU host; isso não é porcentagem de ganho de FPS ou promessa no Moto G06. [Medição exploratória anterior](evidence/bv-r5p/inhabitant-cpu-initial.json) identificou o mesmo custo antes da correção.

`preparedSkinning.ts` prepara produtos de matrizes em **dupla precisão**, uma vez por Skeleton/consulta, para os leitores de vértice CPU usados nos bounds e nos raycasts. Mantém Mesh.getVertexPosition para morphs e a mesma soma de quatro influências/bind/inverseBind. Não usa paleta Float32 da GPU para aproximar coordenadas, não remove vértices, não troca os volumes por envelopes e não altera rigor do picking/highlight. Métodos de cada instância são emprestados apenas durante a leitura síncrona e restaurados em `finally`; leitores personalizados/nested queries são respeitados. Não há cache entre frames, controle de animação, tarefa assíncrona, recurso GPU ou referência persistente adicional.

Oracle dos quatro GLBs em idle/walk/magic: **todos os vértices CPU, limites mundiais, boxes/spheres e hits/face/distance/point de raycasts iguais ao Three original**, sem tolerância relaxada. Testados restauração após exceção e leitores customizados. Rodada dirigida da mudança: 8 PASS/2 arquivos. [Verificação WebGL final pós-CPU](evidence/bv-r5p/final-check/regressions.json) repete os modos, transições 0/44/45 s, seleção/highlight dos quatro rigs, retorno e restauração normal; [descarte final](evidence/bv-r5p/final-check/disposal.json) disposed/zero canvases. As vistas sem seleção do comparativo de luz não executam esse leitor CPU e permanecem válidas.

## Correção candidata e preservação visual

`boundedPointLighting.ts` especializa somente o trecho de PointLights de materiais Lambert/Phong/Standard: antes de normalização, atenuação/pow e BRDF, testa cor nula e distância quadrática fora do raio finito. Dentro do alcance conserva o shader Three original; pontos de alcance ilimitado continuam ilimitados. Demais luzes, hemisfério, cores, fundo, sombras desligadas, geometrias, transparências e clips são preservados. **Não reduz o número de luzes da noite normal:** nove luminárias reais + Ytha continuam contribuindo onde sua atenuação já era não nula. Luz narrativa/manual também mantém alcance/contribuição originais. Não foi necessário alterar luz ambiente ou substituir Ytha por efeito aproximado.

A instalação do shader ocorre na montagem, na chegada dos GLBs e na substituição já suportada dos registros/livros; não percorre a cena por frame. Política por runtime e WeakSet de materiais, sem mutação global do Three ou referências fortes a representações descartadas. Cache distingue shader original/candidato; troca explícita no diagnóstico recompila variantes sem reconstruir cena. Não há seleção dependente de câmera, flicker, troca de slots ou novo controlador. O guard depende do chunk Three r185 atual; alteração futura de Three exige testes/validação real de compilação, não cast ou fallback silencioso.

**24 capturas pareadas:** [noite original antes](evidence/bv-r5p/before/B-night-still.png) / [candidata depois](evidence/bv-r5p/after/B-night-still.png), [pan/pinch antes](evidence/bv-r5p/before/B-night-pan-pinch.png) / [depois](evidence/bv-r5p/after/B-night-pan-pinch.png). Dos 12 pares, **10 são idênticos pixel a pixel**; C/D parados diferem apenas 1 nível no canal verde de 1 pixel em 480 mil. Em B, E, A e todas as vistas em movimento, diferença zero. Nove núcleos/ritual e quatro identidades não foram remodelados. A leitura das capturas não é aceite artístico humano; aprovação posterior segue pendente.

Os controles no diagnóstico existente oferecem A/B/C/D e E (toggle independente de Ytha), mais **Noite candidata R5P · nove pontos**. A–D usam shader original para isolar as hipóteses; a preparação CPU exata de picking permanece igual e ativa em todos os modos; o botão da candidata usa o guard novo com nove pontos e mesma noite. D fixa três lâmpadas próximas ao alvo na escolha explícita, sem oscilar durante a navegação; não é estratégia promovida ao ciclo normal. Fechar/desmontar o painel restaura política candidata e estado normal do relógio, cores e luz própria. Overrides nunca entram em NightLightingSession/LivingSession, agência ou storage. Não simulam a rotina noturna dos habitantes quando a hora real é diurna.

Diagnóstico acumula até 4096 amostras por canal (incluindo `rafInterval`), reset explícito entre rodadas e remoção de listeners/observer/queries ao fechar, pausar, falhar ou descartar. A janela rápida de FrameMetrics continua 750 ms; **usar o canal `rafInterval` para a rodada completa de 45–60 s**. GPU query opt-in: máximo quatro pendentes, flush sem bloqueio, polling só de resultados disponíveis, descarte de disjoint e limpeza no lifecycle. Sem `finish`, espera síncrona, RAF ou timer paralelo no produto. Leituras são números agregados locais, sem conteúdo pessoal ou telemetria.

## Regressões e gates

[Regressões WebGL reais](evidence/bv-r5p/after/regressions.json): dia→noite e noite→dia; nove potências nos instantes 0/44/45 s; ritual parcial preservado; modos e nove núcleos; toggle/restauração de Ytha; nenhuma mutação de sessão; seleção/highlight dos quatro rigs e pausa/retomada no mesmo canvas com um loop. [Descarte](evidence/bv-r5p/after/disposal.json): disposed/zero canvases. Unitários dirigidos iniciais: **73 PASS/8 arquivos**, incluindo emissão/presença/hover real, redução de movimento, luminosidade/fallback, runtime, percentis/janela de 45 s e queries indisponíveis/disjoint/limpeza. Nenhum assert removido ou prazo ampliado.

Lint de desenvolvimento encontrou tipagem insegura inferida por `instanceof` de classes genéricas do Three e referências de método não vinculadas nos testes. Corrigidos com validação por subclasses concretas e binding, sem `any`, casts cegos ou lint desativado. Primeira suíte ampla (antes da correção adicional comprovada de skinning): **960/960 PASS em 153 arquivos**, com dois workers para conter concorrência/memória local. Formato, lint global corrigido, tipos, áudio, build e performance report PASS; warnings conhecidos de chunk >500 kB mantidos. Não foi reexecutada a suíte E2E global: rodada dirigida cobre os fluxos em risco e conserva a dívida global aberta. A mudança posterior no picking justificou uma única nova rodada ampla: **962/962 PASS em 154 arquivos**, dois workers, seguida do E2E final dirigido, sem ampliar prazo. Formato, lint global e tipos finais novamente PASS.

E2E inicial da candidata (antes da correção posterior de CPU): **0/3 PASS**, sem retry/prazo alterado. Mobília chega à captura noturna após reload (linha 49) e falha por deadline/elemento destacado do DOM; input residente falha no poll de zoom após pinch (linha 48); R2 falha ao abrir ferramentas antes da primeira seleção (linha 82). R2 é cenário historicamente vermelho, com ponto variável. Mobília/input são observações novas nesta rodada e receberam **uma única comparação na base R5E imutável**: **0/2 PASS**. Mobília falha na mesma linha 49, esperando estabilidade da captura; input avança o poll e esgota prazo no assert seguinte (linha 49). Isso demonstra falhas desses fluxos na base, mas não prova causa comum nem exclui regressão temporal. [Classificação compacta](evidence/bv-r5p/e2e.json). **E2E final pós-CPU: 0/2 PASS.** BF-4F1 Canvas esgota 30 s em scrollIntoViewIfNeeded (linha 60); input residente esgota prazo na leitura do zoom após pinch (linha 47). O BF-4F1 já falhava na R5D; o ponto atual não prova causa idêntica. Testes E2E não foram editados; nenhum retry automático, prazo aumentado ou assert omitido. Traces finais permanecem locais em test-results. sem loop de correção de testes/timeouts.

E2E R2 e os dois BF-4F1 da R5D anteriores continuam dívidas; sem CI global verde ou novo consumo Actions. Gatilhos conferidos: CI em push main/pull_request; preview dispatch/push main filtrado. Publicação única com `[skip ci]`, PR mantida draft e sem merge.

[Três ciclos WebGL reais de lifecycle](evidence/bv-r5p/lifecycle/lifecycle.json): 303 recursos acompanhados por montagem, zero omissões/duplicações de descarte; zero loops, canvases, leases, observers e listeners próprios residuais; retorno no mesmo canvas e frame antigo ignorado. Último ciclo provoca perda/restauração terminal de contexto e permanece inerte em `failed`, como previsto pelo teste R3. **Não prova heap/DOM global estável:** nós 8→10 e heap pós-GC 23.784.824→24.744.780 B em três ciclos; pendência host R3 preservada, sem atribuição causal ou alegação de ausência geral de vazamentos. Queries novas têm regressão própria de recursos e encerramento.

## Entrega técnica final

[Resumo dos gates](evidence/bv-r5p/local-gates.json): formato/check, lint global, tipos, **962 unitários/154 arquivos**, áudio, build final, performance report, sync/Android debug e diff check PASS. Duas rodadas amplas totais: 960 antes e 962 após a correção adicional comprovada de CPU; a segunda foi necessária pela mudança do mecanismo de picking. E2E final 0/2 e demais dívidas acima continuam abertas. Nenhum script/assert E2E modificado, nenhum retry ou timeout ampliado. Não há CI global verde.

[APK debug final e proveniência](evidence/bv-r5p/apk.json): `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5P-debug.apk` (também no caminho canônico `android/app/build/outputs/apk/debug/app-debug.apk`), **10,641,553 B**, SHA-256 `3e15958db0824a285a1d57cadd3b300e96b4af0189b3feb9e70592d21092c5c0`. ZIP conferido: bundle runtime final `assets/ThreeWorldRuntime-COE7duDT.js` idêntico ao dist, com guard de luzes; quatro GLBs byte a byte idênticos à fonte R5E. Hashes dos arquivos de implementação em apk.json vinculam o empacotamento ao código final. Tamanho total coincidente com o APK R5E; hashes/bundle diferentes e conteúdo final conferido. Versão do app inalterada. Primeiro APK intermediário pré-CPU não é a entrega; foi substituído pelo build final.

Candidata na mesma branch/PR draft #40 com `[skip ci]`, sem merge nem fase seguinte. Schema Dexie v14, backup v6, IDs, persistência, seis representações e quatro GLBs/rigs/clips preservados. Workflows/dependências/versionamento não alterados. **Critério atual: candidata com gates locais e visual preservado, E2E aberto, aguardando comprovação de melhora de fluidez e aceite visual no Moto G06.** R5/R5E e recuperação integral não encerradas.

## Android e aceite pendente

[Roteiro compacto Moto G06](evidence/bv-r5p/MOTO_G06.md). ADB conferido sem aparelhos conectados.

Usar o mesmo catálogo/câmera/orientação para comparar. Não limpar dados reais. Registrar SHA, versão WebView, bateria/temperatura e preferência de movimento reduzido. Nenhum aparelho foi instalado ou testado pelo agente nesta rodada.

1. Abrir Biblioteca → Explorar → Diagnóstico do mundo. Experimentos R5P são opt-in e render-only. Não alteram relógio, agência, ritual, Dexie ou backup. Fechar painel/unmount remove overrides e restaura o ciclo normal. As luzes e cores retomam sua interpolação normal; aguardar estabilização antes de medir.
2. Comparar A/B/C/D/E e **Noite candidata R5P · nove pontos** (B versus candidata é o A/B do shader), esperando estabilização e zerando amostras antes de cada rodada. Fazer 45–60 s parado e depois 45–60 s de pan/pinch no mesmo percurso. Anotar P50/P95/P99 de `rafInterval` acumulado, CPU, long tasks, calls/triângulos/programas/pontos e timer GPU quando suportado e válido. Até 4096 amostras por canal; repetir manualmente se exceder essa janela, sem misturar rodadas. Timer GPU em driver físico não mede input-to-photon, memória GPU ou temperatura.
3. No ciclo normal: dia→noite, primeiros 45 s (fallback 0,68→1 e acendimento por habitantes), nove núcleos e ritual; noite→dia; luz narrativa especial; brilho próprio de Ytha; aura Samael e magias Lua/Aryn, mantendo arte R5E.
4. Pan/pinch, seleção/highlight de registros e dos quatro habitantes; cena carregada, alternância de rota, background/retorno, orientação e movimento reduzido. Não presumir ausência de vazamento por uma sessão curta; observar degradação em retornos repetidos.
5. Comparar imagens e percepção noturna. **Aprovação artística posterior e comprovação de fluidez no Moto G06 continuam obrigatórias.** Somente retomar avaliação artística dos quatro após navegação satisfatória. Sem merge, R5 encerrada ou fase nova.
