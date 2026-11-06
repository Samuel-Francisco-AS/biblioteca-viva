# Recuperação da Biblioteca Viva — execução

Data: 06/11/2026. Programa **parcial**, na stack React/TypeScript/Three.js/Capacitor/Dexie. Autorização: missão de recuperação R1–R5 do proprietário. Sem migração de engine, schema, backup, IDs, merge ou alteração das PRs #32–#37.

## Base, autoridade e sequência

- Base local/remota F conferida após `git fetch origin`: `254ae15d48a10896d00b8a6b539532725375d13c`; checkout original limpo. Branch de execução: `perf/bv-recuperacao-integral`, criada exatamente desse SHA.
- [Auditoria integral](BV_AUDITORIA_ARQUITETURA_PERFORMANCE_STACK.md) e suas evidências copiadas **sem alteração** de `47eaabf63fa5292e2bd086ab866ca5940a774ff8`. Sem merge da branch de auditoria. O relatório foi lido integralmente antes da alteração de produção; suas recomendações de migração não constituem execução autorizada.
- Ordem autorizada: **R1 input/câmera/picking → publicação → R2 navegação/render/representações → publicação → R3 loop/agência/lifecycle → publicação → R4 dados/observabilidade/backup/CI → publicação → R5 assets/pipeline**. Não executar outra rodada antes do push íntegro da anterior.
- Escopo desta janela: R1. R2–R5 permanecem pendentes, sem alegação de recuperação integral. O próximo passo concreto é o baseline de grafo/colisores de BV-02/BV-03 na mesma cena da F, antes de alterá-los.
- `adb devices -l`: **nenhum aparelho conectado**. Android/WebView atuais, resolução física, DPR físico, temperatura, memória, latência de apresentação e profiling Moto G06 indisponíveis. Gate físico **pendente**; os congelamentos relatados não foram declarados resolvidos.

## Matriz obrigatória dos 18 achados

“Resolvido” abaixo refere-se ao mecanismo demonstrado com regressão e evidência indicada, não ao desempenho físico global. Causas dos itens ainda pendentes são as classificações da auditoria, sem nova investigação presumida. `three/` abrevia `src/features/library/three/`. Testes/medidas R1 são detalhados nas próximas seções.

| ID / rodada | Problema original | Causa comprovada ou grau da hipótese | Correção aplicada | Arquivos alterados | Testes executados | Evidência antes/depois | Estado | Ressalvas e riscos remanescentes |
|---|---|---|---|---|---|---|---|---|
| BV-01 / R1 | Restrições reconstruídas durante gestos | Cinco clamps por pan/quatro por pinch; cada um projeta cinco pisos e constrói regiões; sort reprojeta candidatos | Pisos preparados por câmera, cache de dois zooms por viewport, clamp linear e normalização única; commit recebe estado já limitado | `three/cameraMath.ts`, `CameraNavigation.ts`, `cameraRecovery.test.ts`; scripts/evidências R1 | Golden da F, extremos, cinco salas, orientação, invalidação/ownership; regressões de câmera/gestos/runtime/layout | 600 pans: 15.000→0 construções após aquecimento; pinch: 12.000→3.000; trajetórias equivalentes a 1e-9 | resolvido | Gate Moto G06 pendente; ainda há custos de render/simulação. E2E dirigido FAIL, discriminado abaixo |
| BV-02 / R2 | Construção/consulta de grafos cara | Confirmada: pares de nós contra obstáculos e busca linear; grafo lazy por raio já existe | — | — | — | Baseline da auditoria; nova comparação pendente | pendente | Preservar rotas válidas e envelopes; não confundir cache já existente com solução |
| BV-03 / R2 | Decoração vira obstáculos | Confirmada: extração de detalhes/instâncias/toro; 1.114 obstáculos no subconjunto medido | — | — | — | Auditoria; sem depois | pendente | Colisores autorais, navegação/área interativa/âncoras separados; incluir asas de Ytha |
| BV-04 / R2 | Custo de render/GPU | Crescimento confirmado; gargalo GPU provável, sem profiling físico | — | — | — | Inventário da auditoria; sem medição GPU nova | pendente | Mesma cena, luzes, DPR e arte; não reduzir qualidade por contagens |
| BV-05 / R3 | Travessia de luzes por frame | Confirmada: `scene.traverse` e interpolação estável | — | — | — | Auditoria; sem depois | pendente | Referências de montagem e término da transição |
| BV-06 / R3 | Livro em repouso recalcula bounds/material | Confirmada: Box3, capa, leases e obstáculos consultados repetidamente | — | — | — | Auditoria; sem depois | pendente | Manter segurança física/exclusividade |
| BV-07 / R1 | Matrizes globais e raycasts repetidos no tap | Confirmada: força toda a cena, testa prioridade/ambiente e repete-os no fallback | Uma lista de hierarquias selecionáveis sem duplicação ancestral; um raycast; classificação por distância/precedência original; matrizes só dessas hierarquias | `three/ThreeWorldInteraction.ts`, teste homônimo; script/evidência picking | Raycasts Three reais, misses, nested book, tolerância 2 cm, objeto em movimento, roots/representações dinâmicas; integração dos seis tipos/pergaminho/livro | Probe idêntica: 540→360 chamadas de mesh; cena forçada 6→0; visitas à decoração 600→0; mesmas seleções | resolvido | Probe sintética, não FPS do mundo completo. Não introduz proxies aproximados; raycasts exatos ainda escalam com selecionáveis. Gate físico/E2E pendentes |
| BV-08 / R3 | Alocações e poses repetidas | Trabalho confirmado, impacto GC hipótese | — | — | — | Auditoria; sem depois | pendente | Snapshot por frame e propriedade controlada |
| BV-09 / R4 | Reconsulta/reprojeção/remontagem | Confirmada: SessionChanged lê catálogo/anotações e JSON; world diferente remonta | — | — | — | Auditoria; sem depois | pendente | Separar sessão/coleção, preservar câmera/continuidade |
| BV-10 / R3 | Agência concentra autoria e regras | Acoplamento comportamental confirmado | — | — | — | Auditoria; sem depois | pendente | Extrair responsabilidades com uso real; manter coordenador único |
| BV-11 / R5 | Personagens sem rigs/clips de assento | Confirmado: zero skins e nenhum sit nos quatro GLBs | — | — | — | Inventário da auditoria; sem assets novos | pendente | Especificar rig/clips/sockets concretos; declarar bloqueio artístico se ferramentas/assets faltarem |
| BV-12 / R2/R5 | Representações pessoais difíceis de evoluir | Factories/capa/dimensões acopladas confirmadas; wrappers já preservam IDs | — | — | — | Auditoria; sem depois | pendente | Contrato técnico não equivale a qualidade artística dos seis tipos |
| BV-13 / R4 | Média de FPS esconde jank | Confirmada: janela média e inventário inicial incompleto | Apenas probes locais R1; instrumentação geral ainda não corrigida | Scripts R1 (não encerra este achado) | Probes CPU dirigidas | P50/P95/P99 CPU local, não apresentação/GPU | pendente | CPU/simulação/render/input/long tasks/memória ainda por integrar sob demanda |
| BV-14 / R4 | Diagnóstico residente caro | Confirmada: contagem/assinatura mesmo fechado | — | — | — | Auditoria; sem depois | pendente | Preservar datasets usados por testes |
| BV-15 / R3/R4 | Lifecycle/memória | Leak físico não verificado; limpeza existente por inspeção | — | — | Regressões existentes executadas em R1, insuficientes para encerrar memória | Sem heap/device novo | pendente | Dez ciclos, background/context loss e memória física ainda por medir |
| BV-16 / R4 | Hipótese WebView/bridge | Hipótese não confirmada; input sem bridge por movimento | — | — | ADB sem dispositivo | Ausência de trace físico persiste | pendente | Investigar JS/WebGL/composição/driver separadamente; sem migração nesta missão |
| BV-17 / R4 | Dívidas de restore/integridade | Dívida de aceite confirmada; corrupção não verificada | — | — | — | Auditoria; sem ensaio de restore novo | pendente | Base fictícia, IDs/referências/mídia/rollback/legados; schema intocado |
| BV-18 / R4 | CI e autoridades ambíguas | Confirmada: notas históricas sobrepostas e CI anterior FAIL | Registro atual da recuperação e classificação dirigida inicial; consolidação restante pendente | Este plano, STATUS, README, ROADMAP, WORLD, PERFORMANCE, TESTING, CHANGELOG | Gates R1 abaixo; comparação E2E contra F | Histórico e falhas novas separados no registro R1 | em andamento | Não fechar CI global, dívidas antigas ou autoridades de outras fases por esta rodada |

## R1 — mudança e redução de complexidade

`CameraNavigation` continua sendo a única autoridade imperativa de câmera. Uma instância de `CameraNavigationGeometry` pertence a ela: os polígonos dos pisos são preparados uma vez e não retêm referências mutáveis dos chamadores. Restrições dependentes de zoom/viewport têm no máximo duas entradas; orientação/dimensão nova limpa o cache, layout novo exige nova instância. Não há cache global, timer, debounce ou crescimento proporcional à duração do pinch.

O clamp busca o ponto mais próximo uma vez por região, sem `sort`/projeções repetidas no comparador. Pan e pinch normalizam a entrada uma vez e calculam os pontos de tela sobre esse mesmo estado. O commit não repete o clamp já efetuado; `setZoom` continua validando. Cada gesto lê um retângulo DOM para os dois pontos. Input permanece imediato; o RAF existente apresenta a pose mais recente, sem render adicional por movimento nem fila/latência nova. Coalescência adicional de eventos foi evitada neste checkpoint para conservar a semântica de slop, limites e pinch→pan; não é necessária para eliminar o mecanismo medido de reconstrução.

Picking continua geométrico, com oclusão, tolerância de profundidade de 2 cm, prioridade de registros/estantes, fallback técnico e expansão dos pequenos objetos após miss. O índice guarda roots, não folhas/meshes que ficariam obsoletos quando uma representação ou GLB muda. Registro/remoção invalida a lista; filhos atuais são consultados recursivamente uma vez. Matrizes de hierarquias selecionáveis são atualizadas inclusive antes do próximo render para não selecionar a pose anterior de um habitante/livro. Decoração não selecionável fora dessas hierarquias deixa de ser atualizada pelo tap. O highlight e os callbacks de ação repetida permanecem.

Produção alterada: **três módulos** de câmera/input, sem nova engine, serviço, dependência, asset, redução gráfica ou mudança de catálogo. O custo removido é verificável por contadores, em vez de apenas mover cálculo para outro subsistema.

## Baseline e comparação reproduzível

[Antes](evidence/bv-recovery-r1/before.json) e [depois](evidence/bv-recovery-r1/after.json): Node 24.18.0/Linux, mesmas cinco salas reais, 412×840 e 840×412, 100 eventos de aquecimento + 600 medidos por cenário. Execuções em processos sequenciais sem build/teste simultâneo nas capturas de câmera usadas. A primeira captura concorrente foi descartada antes da implementação. Contadores inseridos pelo plugin do script apenas durante o benchmark; não há clock/histórico de amostras novo no caminho produtivo. Fonte do antes: F intacta; depois: código R1 deste checkpoint (campo `base` no JSON identifica o ancestral Git, não finge SHA de alterações ainda não commitadas).

| Cenário | Restrições antes→depois | Convex hulls antes→depois | P50 CPU ms antes→depois | P95 CPU ms antes→depois | P99 CPU ms antes→depois |
|---|---:|---:|---:|---:|---:|
| Pan retrato | 15.000→0 | 30.000→0 | 0,406→0,015 | 0,592→0,026 | 0,846→0,062 |
| Pinch retrato | 12.000→3.000 | 24.000→3.000 | 0,330→0,078 | 0,554→0,140 | 0,700→0,198 |
| Pan paisagem | 15.000→0 | 30.000→0 | 0,396→0,007 | 0,636→0,017 | 0,824→0,023 |
| Pinch paisagem | 12.000→3.000 | 24.000→3.000 | 0,320→0,069 | 0,381→0,079 | 0,574→0,128 |

Pan usa cache aquecido: a preparação fria continua construindo cinco restrições. Pinch ainda constrói cinco restrições por zoom **realmente novo**, sem reconstruir a projeção dos pisos. Maior diferença de target entre amostras antes/depois: **<6,4e-14 unidades**. O teste golden usa tolerância 1e-9, sem expectativa de tempo em CI. O máximo isolado do pinch retrato aumentou de 0,994 para 1,305 ms; não foi ocultado nem interpretado como Android. Tempos do host são amostras diagnósticas locais, sem inferência de significância estatística, FPS, GPU ou input-to-photon.

[Picking pareado](evidence/bv-recovery-r1/picking.json): os dois controladores executam raycasts Three reais sobre a **mesma** hierarquia sintética (60 roots selecionáveis sintéticas, incluindo 30 filhos aninhados; 100 decorações; seis taps com acertos, misses e repetição). O script carrega o controlador anterior diretamente do SHA auditado. Mede quantidade de trabalho, sem usar esse subconjunto para alegar melhoria da cena completa. Os testes de integração usam também factories reais e os seis tipos. Contagens finais: **540→360 raycasts de mesh, 6→0 forças de matriz global e 600→0 visitas à decoração**; seleções iguais são assert obrigatório do script.

Reprodução (não roda automaticamente na CI):

```sh
node scripts/benchmark-world-input.mjs /tmp/bv-input.json nome-da-versao
node scripts/benchmark-world-picking.mjs /tmp/bv-picking.json
```

Para repetir o antes da câmera, usar checkout F isolado com o mesmo script/dependências e condições; nunca sobrescrever os JSON de baseline para atualizar expectativas. Os scripts não carregam dados pessoais, não geram seed no app real e não adicionam orçamento ou timeout de aprovação.

## Validação e limites do checkpoint

Evidência inicial: **97/97 testes existentes PASS**, em seis arquivos, na F antes de modificar produção; os mesmos 97 PASS após a mudança. Mais **9 testes novos PASS** (dois arquivos; caso aninhado acrescentado na revisão final), incluindo trajetória golden da F e raycasts reais.

Comando dirigido existente:

```sh
npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/sanctuaryCamera.test.ts src/features/library/three/ThreeWorldRuntime.test.ts src/features/library/three/ThreeWorldRuntime.d1.test.ts src/features/library/librarySpatialLayout.test.ts src/features/library/three/smallLivingTapTargets.test.ts
```

Novos: `cameraRecovery.test.ts` e `ThreeWorldInteraction.test.ts`. Cobrem cache limitado, entrada imutável, orientação e invalidação, extremos e cômodos, golden de pan/pinch, precedência/oclusão, hierarquia aninhada, miss sem repetição, movimento antes de render, registro/remoção e substituição de filhos. A revisão pareada revelou que elegibilidade ambiental pertence à hierarquia, não somente ao ID final do hit; corrigida e coberta por teste de filho selecionável sob habitante. O script exige acertos e misses, impedindo equivalência vazia. As regressões preexistentes mantêm cancelamento/pausa/context loss, tap/slop, pinch→pan, seleção/entryId dos seis tipos, pergaminho canônico, livro em transporte, fallback semântico e troca de representação.

E2E dirigido executado **uma vez**, sem retries, asserts/timeouts alterados: `bf5r4-experience` (arraste de um movimento), `bf5r5-experience` (same canvas) e `bf5r5-world-input` (resident input). **0 PASS / 3 FAIL**: timeout em `mouse.move`; canvas ainda visível após clique de aba; loop ainda ativo após clique de aba, respectivamente. Não há PASS WebGL integrado nesta rodada. A F intacta também reprovou **0 PASS / 3 FAIL** numa única execução: arraste parou em `getAttribute` antes do movimento (linha 117); same canvas parou aguardando fixture pronta (linha 11); resident input parou no mesmo assert do loop ativo (linha 14). Há falhas nominais anteriores, **sem prova de causa idêntica ou de ausência de regressão**. A execução F se sobrepôs à suíte unitária ampla; não usar durações como comparação de performance. Nenhum E2E foi reexecutado na candidata para tentar obter verde. Traces locais preservados em `test-results/`, fora do Git; somente conteúdo fictício. A CI anterior da F já era FAIL ([run 42210455500](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42210455500)); a contagem histórica 31/35 pertence a `43d2c82`, não ao HEAD F.


Rodada ampla única: **138 arquivos PASS / 1 FAIL; 884 testes PASS / 1 timeout**, de 885, antes do último teste de picking aninhado. Falha: `inhabitantAgency.test.ts:245`, cenário de encontros/reparo, limite preexistente de 5 s (5,920 s nesta carga). Produção/teste de agência intocados. Investigação dirigida, sem mudar limite: arquivo isolado **9/9 PASS na F** e **9/9 PASS na candidata**. Isto demonstra sensibilidade à condição de execução, não causa única nem suíte ampla verde. Sem nova rodada global.

Após corrigir a elegibilidade da hierarquia, regressão final dirigida: **71/71 PASS em cinco arquivos** (`cameraRecovery`, `ThreeWorldInteraction`, os dois `ThreeWorldRuntime`, `smallLivingTapTargets`). Os demais testes de câmera/layout já haviam passado na rodada de 97 e na ampla. Os testes finais não somam contagens de rodadas sobrepostas para inventar total maior.

Gates finais **PASS**: `format:check` (mais check dos arquivos finais), `lint`, `typecheck`, `audio:check`, `build`, `performance:report` e `git diff --check`. O relatório de performance é inventário de bundle, não aprovação de runtime. Warning de chunks >500 kB permanece. Android sync/APK não executados neste checkpoint de TypeScript; sem aparelho para instalação/profiling. As tentativas de lint encontraram imports Node explícitos ausentes nos scripts e mock sem tipo no novo teste; corrigidos sem relaxar regras. Sem falha de produção ocultada.

[Hashes das três fontes antes/depois](evidence/bv-recovery-r1/source-hashes.json) vinculam as capturas ao código exato. Os JSON de câmera usam contadores, e a probe de picking tem `assert` de identidade de seleção. Arquivos de auditoria foram preservados byte a byte com suas evidências de origem.

O Moto G06 e TalkBack não foram testados. Metas de apresentação P95 ≤33,3 ms/P99 ≤50 ms continuam objetivos, sem medida nesta rodada. Memória/GPU e as causas BV-02–06/08–17 permanecem por tratar; este checkpoint não promete eliminar o travamento global.

## Publicação e continuidade

PR draft autorizada com base `feat/bf-5-5f-real-session-response`, sem merge. O SHA de implementação será o commit que introduz este relatório; `git log --follow -- docs/audits/BV_PLANO_RECUPERACAO_EXECUCAO.md` identifica-o sem autorreferência circular. SHA remoto, URL da PR draft e estado da CI são informados no relatório de entrega e na descrição da PR. O documento não usa SHA autorreferente nem atribui à CI resultados locais.

R2 deve começar medindo o grafo frio/quente e os obstáculos do mesmo edifício/estantes e dos perfis dos quatro habitantes; separar volumes físicos autorais dos detalhes renderizados antes de otimizar a busca. Incluir envelope de asas de Ytha, rotas dos livros/pergaminhos, identidade dos seis registros e comparação visual/quantitativa. R3–R5 seguem o inventário acima, com gate remoto entre rodadas. Nenhum item pendente foi refutado ou transformado em bloqueio sem investigação.
