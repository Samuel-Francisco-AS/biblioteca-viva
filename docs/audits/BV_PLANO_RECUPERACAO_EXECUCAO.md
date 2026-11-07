> **R3C — 07/11/2026:** A `f1086b7`, B `a9fc253` publicadas; C candidata com descarte de runas, RAF por geração e contexto terminal, dez ciclos dirigidos PASS. [Relatório e retenção host ainda sem atribuição](BV_RECUPERACAO_R3.md). Memória física, CI E2E global e recuperação integral abertas; R4/R5 não executadas.

> **R3B — 07/11/2026:** A publicada em `f1086b7`; entradas da agência por fase e catálogo autoral separados, regressões PASS. [Relatório R3](BV_RECUPERACAO_R3.md). C aguarda publicação B; sem antecipar R4/R5 ou gate físico.

> **R3A — 07/11/2026:** redução do trabalho ocioso implementada e validada no host; [relatório R3](BV_RECUPERACAO_R3.md). B/C ainda pendentes até publicação sequencial; R4/R5 e recuperação integral abertas. Sem gate Moto G06 R3/CI global verde.

# Recuperação da Biblioteca Viva — execução

Data: 06/11/2026. Programa **parcial**, na stack React/TypeScript/Three.js/Capacitor/Dexie. Autorização: missão de recuperação R1–R5 do proprietário. Sem migração de engine, schema, backup, IDs, merge ou alteração das PRs #32–#37.

## Base, autoridade e sequência

- Base local/remota F conferida após `git fetch origin`: `254ae15d48a10896d00b8a6b539532725375d13c`; checkout original limpo. Branch de execução: `perf/bv-recuperacao-integral`, criada exatamente desse SHA.
- [Auditoria integral](BV_AUDITORIA_ARQUITETURA_PERFORMANCE_STACK.md) e suas evidências copiadas **sem alteração** de `47eaabf63fa5292e2bd086ab866ca5940a774ff8`. Sem merge da branch de auditoria. O relatório foi lido integralmente antes da alteração de produção; suas recomendações de migração não constituem execução autorizada.
- Ordem autorizada: **R1 input/câmera/picking → publicação → R2 navegação/render/representações → publicação → R3 loop/agência/lifecycle → publicação → R4 dados/observabilidade/backup/CI → publicação → R5 assets/pipeline**. Não executar outra rodada antes do push íntegro da anterior.
- R1, R2A (`50f425d`), R2B (`291b0b4`) e R2C (`10c664c`) publicadas. **Saneamento focalizado pós-R2 vigente:** [Livro da Estrela, quatro representações e retorno ao Moto G06](BV_SANEAMENTO_POS_R2.md). O proprietário confirmou melhora do Canvas ainda com lag/travamentos; esta rodada corrige o livro/refina quatro assets, sem iniciar R3/R4/R5. A recomendação atual é novo teste físico antes de decidir R3; substitui a indicação anterior de avanço direto. Recuperação integral aberta, PR #38 draft sem merge.
- `adb devices -l`: **nenhum aparelho conectado**. Android/WebView atuais, resolução física, DPR físico, temperatura, memória, latência de apresentação e profiling Moto G06 indisponíveis. Gate físico **pendente**; os congelamentos relatados não foram declarados resolvidos.

## Matriz obrigatória dos 18 achados

“Resolvido” abaixo refere-se ao mecanismo demonstrado com regressão e evidência indicada, não ao desempenho físico global. Causas dos itens ainda pendentes são as classificações da auditoria, sem nova investigação presumida. `three/` abrevia `src/features/library/three/`. Testes/medidas R1 são detalhados nas próximas seções.

| ID / rodada | Problema original | Causa comprovada ou grau da hipótese | Correção aplicada | Arquivos alterados | Testes executados | Evidência antes/depois | Estado | Ressalvas e riscos remanescentes |
|---|---|---|---|---|---|---|---|---|
| BV-01 / R1 | Restrições reconstruídas durante gestos | Cinco clamps por pan/quatro por pinch; cada um projeta cinco pisos e constrói regiões; sort reprojeta candidatos | Pisos preparados por câmera, cache de dois zooms por viewport, clamp linear e normalização única; commit recebe estado já limitado | `three/cameraMath.ts`, `CameraNavigation.ts`, `cameraRecovery.test.ts`; scripts/evidências R1 | Golden da F, extremos, cinco salas, orientação, invalidação/ownership; regressões de câmera/gestos/runtime/layout | 600 pans: 15.000→0 construções após aquecimento; pinch: 12.000→3.000; trajetórias equivalentes a 1e-9 | resolvido | Gate Moto G06 pendente; ainda há custos de render/simulação. E2E dirigido FAIL, discriminado abaixo |
| BV-02 / R2A/C | Construção/consulta de grafos cara | Pares simétricos repetidos e varredura de todos os volumes | Índice em células de 3 m com teste exato; pares não orientados uma vez; cache estático por envelope preparado na montagem, ocupação temporária separada | `inhabitantNavigation.ts`, `ThreeWorldRuntime.ts`, benchmark/regressões R2A | 72 pares contra baseline R1, oracle geométrico, quatro habitantes/cinco salas, consultas pareadas, leases/livros/pergaminhos | Grafo Ytha P50 95,94→18,31 ms em A / 18,85 ms final; 3.270.560→10.645 testes finais; 138 nós mantidos | mecanismo corrigido; melhoria comprovada no host | Grafo ainda síncrono na montagem; CPU host não é GPU/Android. Gate físico pendente |
| BV-03 / R2A/C | Decoração vira obstáculos | Extração automática de mesh/instâncias | Componentes autorais locais para físico/navegação, picking/âncoras separados; estante composta no voo e footprint no chão; envelopes móveis reservados, objeto transportado excluído; efeitos sem volume e roots deduplicados em C | `spatialComponents.ts`, factories de edifício/móveis/estantes/livros/registros/props, coletores | Regressões espaciais e funcionais; transformação/decoração independente; oracle R1 | 1.220→155 em A→125 final no mesmo cenário (13 registros não livrescos/estantes sem volumes pessoais); 65 válidos/7 inválidos preservados; ocupação bloqueia e liberação restaura | mecanismo corrigido; melhoria comprovada | Fallback geométrico permanece para roots técnicos/não convertidos; colisor novo requer autoria e revisão geométrica. Gate físico pendente |
| BV-04 / R2B | Custo de render/GPU | Peças estáticas separadas e luzes de potência zero confirmadas; gargalo físico não medido | Bake indexado por material nas estantes do mundo composto, caixa unitária compartilhada, transformações locais estáticas fixas, luzes zero invisíveis e efeitos ocultos sem atualização | `staticVisuals.ts`, `ThreeWorldRuntime.ts`, factories edifício/mobília, `livingVisuals.ts`, probe/regressões | Dez cenários equivalentes, imagens pareadas, geometria/picking/apoios/descarte e dia/noite | Normal 353→326 calls; afastada 452→403; 729→648 meshes; geometria potencial preservada; tempo CPU misto | otimização parcial; redução de trabalho comprovada | Buffers CPU +310.392 B, culling menos fino em alguns enquadramentos e mais variantes shader; GPU/Moto não medidos; sem ganho de FPS alegado |
| BV-05 / R3A | Travessia de luzes por frame | Travessia/interpolação estável reproduzidas | Referências da montagem, término exato e reconciliação da transição | livingVisuals, ThreeWorldRuntime | Dia/noite, fallback, reversão, descarte e runtime | 600→0 travessias; 2.400→0 lerps em 600 frames | mecanismo corrigido; candidata | Sem gate físico R3; brilho/magia preservados |
| BV-06 / R3A | Livro em repouso recalcula bounds/material | Custo reproduzido com leitura pousada | Envelope por matriz/abertura, capa/emissivo por mudança, retain verifica ownership sem renovar todo frame | sessionBookVisuals, InteractionCoordinator | Transformações de parent, transporte, exclusividade, recuperação, livro cenográfico | 1.200→1 bounds; 1.200→0 escritas de capa; 600→0 brilho | mecanismo corrigido; candidata | Consultas de ownership continuam; obstáculos não recebem cache novo; gate físico pendente |
| BV-07 / R1 | Matrizes globais e raycasts repetidos no tap | Confirmada: força toda a cena, testa prioridade/ambiente e repete-os no fallback | Uma lista de hierarquias selecionáveis sem duplicação ancestral; um raycast; classificação por distância/precedência original; matrizes só dessas hierarquias | `three/ThreeWorldInteraction.ts`, teste homônimo; script/evidência picking | Raycasts Three reais, misses, nested book, tolerância 2 cm, objeto em movimento, roots/representações dinâmicas; integração dos seis tipos/pergaminho/livro | Probe idêntica: 540→360 chamadas de mesh; cena forçada 6→0; visitas à decoração 600→0; mesmas seleções | resolvido | Probe sintética, não FPS do mundo completo. Não introduz proxies aproximados; raycasts exatos ainda escalam com selecionáveis. Gate físico/E2E pendentes |
| BV-08 / R3A | Alocações e poses repetidas | Trabalho reproduzido; GC físico hipótese | Snapshot por fase, trilhas em anel só visíveis, âncoras por asset | Runtime, livingScrollVisuals, inhabitantVisuals | Snapshot estável, voo/repouso, GLBs reais, continuidade | 4→2 getPoses/frame (5→2 com checkpoint); 600→0 clones em repouso | mecanismo corrigido; candidata | Duas fases físicas preservadas; 36 vetores retidos por trilha; sem FPS Android |
| BV-09 / R4 | Reconsulta/reprojeção/remontagem | Confirmada: SessionChanged lê catálogo/anotações e JSON; world diferente remonta | — | — | — | Auditoria; sem depois | pendente | Separar sessão/coleção, preservar câmera/continuidade |
| BV-10 / R3B | Agência concentra autoria e regras | Catálogo e callbacks de consultas interligavam agência/visuais | Catálogo extraído; AgencyEnvironment explícito por update; oportunidades estáveis e consulta de superfície sem snapshot | inhabitantActivities/Environment, agência, runtime, livro/pergaminhos/coordenador | 81/81 + 23/23 dirigidos com sobreposição; disputa/remoção de envelope/continuidade | Três callbacks internos removidos; snapshot físico único por update; valores autorais preservados | simplificação implementada; candidata | Agência ainda especializada/extensa; gate físico e CI global pendentes |
| BV-11 / R5 | Personagens sem rigs/clips de assento | Confirmado: zero skins e nenhum sit nos quatro GLBs | — | — | — | Inventário da auditoria; sem assets novos | pendente | Especificar rig/clips/sockets concretos; declarar bloqueio artístico se ferramentas/assets faltarem |
| BV-12 / R2C/R5 | Registros genéricos e factories acopladas | Cinco categorias sem reforma e sessão conhecendo variante/hinge | Seis assets nativos próprios; registry/contrato com dimensões, pivot, escala, orientação, volumes, picking, materiais e âncoras; livro por capacidade de abertura/brilho; substituição mantém wrappers/IDs | `recordAssetContract.ts`, `recordAssets.ts`, `recordArtifactModels.ts`, representações/composição/livro/sessão/runtime; ADR-024 | Cinco trocas com raycast/eventos reais + seleção semântica/highlight, perfil/ID inválidos rejeitados; livro sem campos procedurais transporta/retorna; snapshots das seis categorias | Antes/depois no mundo completo; 12 vistas por versão; custos individuais medidos; 155 obstáculos e 65/72 válidos preservados | mecanismo corrigido; melhoria visual web inspecionada; aceite artístico pendente | Sem aprovação humana/Moto; novos materiais/buffers/triângulos explícitos; perfil físico novo exige revisão/montagem. GLBs/rigs R5 não entregues |
| BV-13 / R4 | Média de FPS esconde jank | Confirmada: janela média e inventário inicial incompleto | Apenas probes locais R1; instrumentação geral ainda não corrigida | Scripts R1 (não encerra este achado) | Probes CPU dirigidas | P50/P95/P99 CPU local, não apresentação/GPU | pendente | CPU/simulação/render/input/long tasks/memória ainda por integrar sob demanda |
| BV-14 / R4 | Diagnóstico residente caro | Confirmada: contagem/assinatura mesmo fechado | — | — | — | Auditoria; sem depois | pendente | Preservar datasets usados por testes |
| BV-15 / R3C | Lifecycle/memória | Line sem dispose e RAF antigo pós-resume reproduzidos; retenção host residual não atribuída | Descarte de renderables, geração/agenda única RAF, liberação terminal de contexto; matriz de dez cenários | referenceScene, ThreeWorldRuntime, testes host/loaders e harness | Dez ciclos WebGL PASS; perda/restauração real; regressões dirigidas e timer/capture/late load | 8→0 recursos omitidos; 2→1 RAF retomado; zero recursos/listeners/RAF próprios pendentes; DOM host +1/ciclo mantido | mecanismos corrigidos; auditoria dirigida entregue; memória parcialmente aberta | Sem Android/retentores de heap; não declarar leak nem memória estabilizada; gate físico pendente |
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

## R2A — navegação e colisores (06/11/2026)

Baseline exclusivo R1 `bf26e8d`, mesmo mundo: edifício interativo, três estantes, 13 registros fictícios nos slots e objetos vivos/caderno cenográfico. Mais objetos que o subconjunto de 1.114 obstáculos da auditoria, portanto o antes correto desta comparação é **1.220**, não 1.114. [Antes](evidence/bv-recovery-r2/navigation-before.json) · [depois](evidence/bv-recovery-r2/navigation-after.json). Receita: `node scripts/benchmark-world-navigation.mjs /tmp/navigation.json etiqueta`.

`spatialComponents.ts` centraliza volumes locais físicos e de navegação, mobilidade e canais independentes de picking, manipulação, apoio e aproximação. Os pontos existentes de mobília permanecem canônicos em `libraryFurnishingLayout.ts`; supports os reutilizam. WeakMap pertence aos objetos montados, sem cache global de recursos, persistência ou schema. Colliders não são meshes invisíveis e não entram no picking. A decoração pode mudar sem gerar volumes novos; componente filho independente continua descoberto. Recursos não convertidos/fixtures conservam fallback geométrico, sem se tornar política de conteúdo novo.

Paredes e pilares têm volumes estruturais, sem uma caixa por moldura. Cada cadeira/mesa/luminária/planta ocupa volumes funcionais. Estante usa um footprint de chão e volumes de vãos/prateleiras no voo para permitir a saída do livro original. Folhagem animada e gaveta reservam excursão máxima; props carregados não deixam obstáculo na origem. Bases abaixo do limiar de degrau vigente (15 cm) não viram uma parede de corpo inteiro. Os raios dos habitantes, inclusive **Ytha 0,92 m**, não mudaram.

O índice de células reduz candidatos, mas `segmentHits` continua exato. Teste de 400 consultas compara índice com força bruta. Cada aresta estática é testada uma vez e registrada nos dois sentidos, cache por raio/montagem; prepare ocorre antes da agência/input. Ocupação transitória continua parâmetro de consulta e não destrói grafos. Não há segundo controlador de movimento nem teletransporte.

| Métrica CPU host | Antes | Depois |
|---|---:|---:|
| Obstáculos / coleta ms (amostra) | 1.220 / 6,57 | 155 / 2,16 |
| Nós por grafo | 138 | 138 |
| Arestas para raios 0,66 / 0,62 / 0,92 / 0,58 | 1.433 / 1.441 / 782 / 1.453 | 1.433 / 1.440 / 773 / 1.451 |
| Construção P50 ms, mesmos raios | 110,50 / 107,79 / 95,94 / 107,76 | 25,09 / 20,93 / 18,31 / 17,90 |
| Construção P95 ms | 232,54 / 108,82 / 98,37 / 110,06 | 48,48 / 21,68 / 19,84 / 18,24 |
| Testes exatos no grafo Ytha | 3.270.560 | 12.187 |
| Rotas frias que constroem grafo, quatro habitantes (ms) | 113,64 / 111,96 / 100,14 / 109,80 | 20,02 / 19,54 / 19,62 / 19,26 |
| Rota repetida P50 / P95 ms | 0,290 / 0,592 | 0,237 / 0,448 |
| Consulta espacial P50 / P95 ms | 0,0068 / 0,0561 | 0,0061 / 0,0079 |
| Testes exatos, conjunto rotas/consultas | 22.221.609 | 107.350 |
| Pares válidos / inválidos | 65 / 7 | 65 / 7 |

Sete construções por envelope (P95 é máximo desta amostra pequena); 20 repetições de cada par; 800 consultas. Valores locais diagnósticos, sem equivalência a FPS, tempo GPU ou significância estatística. Cold inclui primeira construção; demais pares aproveitam cache. Nenhum benchmark de tempo vira assert de CI. JSON conserva todos os pares e volumes anteriores. Regressão compara também cada trecho novo com os **volumes detalhados da R1**, além da validade das 72 combinações; não prova só contagem menor. Obstáculo temporário bloqueia destino e liberação restaura rota sem reconstrução estática.

Validação dirigida: 110 testes em dez arquivos; na primeira rodada final, 109 PASS e uma regressão estrutural (pisos movidos para outro parent). Corrigido preservando os nove pisos no root. Reexecução dirigida desse arquivo e oracle espacial: 16/16 PASS. Rodadas anteriores detectaram bloqueios novos de asas/apoios e base de marcador; corrigidos no contrato, sem alterar raios, timeouts, agência ou asserts existentes. Testes incluem quatro habitantes/cinco salas, rotas impossíveis, encontros de seis pares sem colisão, livros cenográfico/original, interrupção/retorno, reservas, apoio de quatro cantos, pergaminhos e movimento reduzido. R1 não reimplementada. Estáticos/build e publicação registrados junto ao checkpoint; gate Moto G06 continua pendente.

Gates R2A finais: format:check, lint, typecheck, build e diff --check PASS. Lint inicial detectou import de process ausente no benchmark e parsing não tipado do JSON de teste; corrigidos, sem desativação de regras. Warning de chunks >500 kB permanece; runtime Three 807,91 kB bruto / 215,14 kB gzip. E2E não repetido nesta etapa: rodada dirigida integrada fica após R2C. CI anterior R1 `42270783115`: estáticos/unitários/build SUCCESS; shard 1 FAIL e shard 2 cancelled, global FAIL. ADB novamente sem dispositivo.

## R2B — renderização sem redução artística (06/11/2026)

R2A remota confirmada: `50f425d9fc972f1dd91914e4092fef45fffd5e0b`, antes de iniciar B. [Antes](evidence/bv-recovery-r2/render-before/metrics.json) · [depois indexado](evidence/bv-recovery-r2/render-after/metrics.json) · [comparação visual inspecionada](evidence/bv-recovery-r2/render-comparison.png) · [diferença de pixels](evidence/bv-recovery-r2/render-image-diff.json). O probe monta o **ThreeWorldRuntime real**, mesmo edifício/estantes, 12 livros + dois registros de cada outra categoria, quatro GLBs carregados, quatro pergaminhos, luzes e efeitos reais. Host diagnóstico dedicado sem React/Dexie; não é screenshot de peças isoladas nem uma cena vazia comparada com mundo completo.

Mudanças concretas:

- `batchStaticBookshelf` transforma triângulos/normais/UVs para o espaço do mesmo root e concatena por material. **Mantém índices**, materiais, texturas, slots, colisor independente, wrapper e seleção. Somente mundo composto: fixtures/authoring continuam expondo peças individuais. Aplicado na montagem e na substituição existente, antes de anexar livros; não toca capas articuladas, personagens ou props móveis. Recursos pertencem à representação e originais são liberados uma vez. Sem cache entre owners ou mudança de pipeline GLB.
- Batches arquiteturais compartilham uma caixa unitária por edifício. Matrizes locais de meshes estáticos são preparadas uma vez; matrizes mundiais continuam acompanhando parent. Batches de mobília preservam instâncias, materiais e riqueza geométrica.
- Luz de potência exatamente zero deixa a lista visível do renderer; transição de apagamento conclui abaixo de 0,0001. Luzes reais reacendem com o mesmo target/intensidade. Nove luzes noturnas, segredo/manual e braseiro continuam funcionando. Dia: 11→0 PointLights visíveis; noite: 11→9 (as outras duas estavam desligadas). Brilhos/sparks ocultos deixam de alterar transformações sem efeito visível. Travessia geral de luzes por frame continua dívida R3/BV-05.
- A CI R2A `42310425566` revelou **falha nova**, 888 PASS/1 FAIL, em `libraryRecordLayout.test.ts:434`: batches deixaram o root direto. B preserva essa hierarquia visual e usa um grupo só de componentes para os colliders; o assert e os testes de descarte não foram alterados. Não classificar esta falha como histórica ou timeout do runner.

| Cenário equivalente | Draw calls antes→depois | Triângulos renderizados antes→depois |
|---|---:|---:|
| Biblioteca estática com registros | 353→326 | 178.252→178.252 |
| Quatro habitantes/atualização | 353→326 | 178.252→178.252 |
| Noturno | 358→331 | 179.092→179.092 |
| Pergaminhos em atualização local | 358→331 | 179.092→179.092 |
| Livro original em transporte (estado confirmado) | 359→332 | 179.860→179.860 |
| Câmera próxima | 224→206 | 161.848→162.940 |
| Câmera afastada | 452→403 | 188.176→188.752 |
| Movimento reduzido | 451→402 | 188.140→188.716 |
| Pausa/retorno | 451→402 | 188.140→188.716 |
| Três pergaminhos voando (suplemento) | 380→353 | 178.576→178.576 |

Suplemento [antes](evidence/bv-recovery-r2/flight-before/metrics.json)/[depois](evidence/bv-recovery-r2/flight-after/metrics.json): somente wakeAt antecipado no diagnóstico; rotas/voo/ocupação reais permanecem validados pelo controlador. Seis frames medidos, três de preparação por caso. Categoria/registro e quatro habitantes permanecem presentes em todos. A rodada de atualização local não era voo; suplemento não confunde os estados. Formato do argumento ref vazio falhou **depois** de persistir amostras/imagem do suplemento B; metadados recuperados a partir dessas amostras, sem refazer medição nem inventar estado de descarte/erros daquele suplemento. Script corrige normalização do argumento; registros brutos preservados.

Meshes estruturais **729→648**, materiais **165→165**, texturas renderer **3→3** na normal e **4→4** após visão ampla. Geometrias renderer **132→119** na normal, **165→147** na ampla. São recursos inicializados, dependentes do culling, não bytes GPU. Matrizes locais: **5.808→4.872** nas seis atualizações normais. Triângulos potenciais de toda a cena não foram reduzidos. Culling de material agregado é menos fino: +1.092 triângulos na próxima e +576 na afastada; redução de calls não finge redução de geometria executada em todo enquadramento.

Tradeoff medido: soma de arrays geométricos CPU únicos **1.401.916→1.712.308 B** (+310.392), apesar de menos objetos/geometrias. A primeira candidata não indexada usava 2.451.268 B e foi corrigida com índices, sem remover peças. [Candidata intermediária](evidence/bv-recovery-r2/render-after-nonindexed/metrics.json) preservada, não é a entrega final. Programas acumulados após livro/noite **25→46** por variantes de iluminação; compilação/transição e memória GPU precisam gate físico. Não esconder estes custos.

CPU/submissão tem resultado **misto**, sem ganho temporal global comprovado: P50 frame normal 4,2→7,9 ms, quatro habitantes 6,1→5,0, noite 6,5→4,7, transporte 4,9→7,1 e afastada 7,5→6,4; seis amostras por caso, SwiftShader e agendamento/backpressure. P95 e tempos de subsistemas constam nos JSONs; não são tempo real de GPU, apresentação ou Android. Não usar estes valores pequenos/amostras para alegar regressão física ou FPS recuperado. Melhoria comprovada é trabalho eliminado: calls, recomposição de matrizes e luzes zero. DPR **1**, framebuffer **1280×900**, antialias e resolução mantidos; política de DPR do produto intocada.

Comparação visual inspecionada de dia/noite/afastada: móveis, entalhes, capas, personagens, luz e atmosfera mantidos, sem perda aparente nesses frames. Diferenças numéricas esparsas de rasterização na crista das estantes não são aceite artístico humano, nem prova de todos os ângulos/mobile. Imagens integrais de todos os casos preservadas. Primeira captura interrompida por espera de estabilidade do screenshot, sem timeout aumentado; coletor passou a persistir amostras por cenário e usar screenshot da página. [Três imagens parciais da tentativa](evidence/bv-recovery-r2/render-before-attempt1/).

Receita: `node scripts/measure-world-render.mjs /tmp/render-before R2A 50f425d9fc972f1dd91914e4092fef45fffd5e0b`; depois `node scripts/measure-world-render.mjs /tmp/render-after R2B`; suplemento acrescenta ref e argumento `flight`. O plugin diagnóstico carrega os quatro módulos alterados em B diretamente do Git para o baseline, sem checkout/branch/PR nova; demais fontes são iguais nesta etapa. Não serve para comparar futuras mudanças nesses outros módulos sem ampliar o conjunto de fontes de referência.

Testes novos verificam três variantes, triângulos, bounds, raycast real, vãos físicos, descarte exato dos recursos antigos/novos e transformação por parent. Dia/noite confirma luzes ocultas/reacesas. Primeira rodada: 96 PASS/5 FAIL na fixture técnica por aplicação indevida do bake; restrito ao mundo composto, mantendo fixtures e seus asserts. Reexecução desses dois arquivos: 49 PASS; rodada final abaixo inclui o teste que falhou na CI A e oracle R1. Sem resolução baixa, supressão de habitantes/pergaminhos, redução de ornamentos, stack nova, schema ou alegação de aprovação Moto G06.

Gates finais R2B: 72/72 testes dirigidos PASS em seis arquivos, incluindo a falha nova da CI A e oracle de navegação R1; typecheck/build/diff --check PASS. format:check global PASS; lint global encontrou somente tipagem de Mesh/spy dos dois módulos novos, corrigida com type guards/imports explícitos e lint dirigido desses módulos e probe PASS, sem casts/any ou supressões. Quatro testes de bake reexecutados após os guards. Build Three 812,95 kB bruto / 216,41 kB gzip; warning >500 kB mantido. Probe completo termina sem pageerror, zero canvas e estado disposed; isso não mede heap/GPU física nem dez ciclos. Moto/CI global/E2E integrado ainda não aprovados.

## R2C — seis representações pessoais e assets substituíveis (06/11/2026)

B remota confirmada `291b0b4bee546645e583e61cdb70b90c6925a54f` antes de iniciar C. [Comparação inspecionada das seis categorias](evidence/bv-recovery-r2/record-comparison.png) · [vistas anteriores integrais](evidence/bv-recovery-r2/records-before/) · [vistas novas integrais](evidence/bv-recovery-r2/records-after/) · [custos por peça/enquadramento](evidence/bv-recovery-r2/record-costs.json) · [ADR-024](../decisions/ADR-024-recuperacao-r2-componentes-e-assets.md).

Reforma concreta, sem confundir objeto pessoal com mobília/estação:

- **Livro:** encadernação de quatro variantes determinísticas preservada, agora com ferragens de canto, tooling de capa, selo e headbands costurados. Detalhes acompanham a capa articulada; lombada e corpo permanecem fixos. Geometrias de encadernação instanciadas em grupos fixo/articulado, sem duplicar vértices por ornamento.
- **Filme:** projetor de memória em laca verde, dois carretéis vazados com raios, percurso de película, lente de cristal e ferragens. Substitui painel genérico, sem criar reprodução audiovisual no mundo.
- **Série:** receptor episódico em laca ameixa, vidro escuro, capítulos luminosos, seletores e antenas. Silhueta diferente do projetor e do códice; três marcadores de episódios permanecem elementos visuais, sem inventar progresso do registro.
- **Estudo:** fólio aberto com duas páginas, escrita abstrata, pena/tinteiro e anel de pesquisa. É o registro de estudo; mesa decorativa não foi remodelada nesta etapa.
- **Atividade física:** kettlebell de ferro/latão com alça real, selo e tapete enrolado, substituindo a placa direcional. O tapete é apoio de treino baixo, não pedestal genérico; equipamento decorativo da sala permanece separado.
- **Trabalho:** estojo de ofício com alça, malhete, planta/rolo de projeto, couro e metal. É o objeto do registro, sem confundi-lo com a bancada da sessão.

São designs originais pequenos em fonte nativa Three/TypeScript, dentro dos envelopes aprovados, normalizados em torno do pivot de chão. Não foi necessário promover GLBs, consumir fixtures ou criar pipeline/loader novo. Há Blender disponível; não se alega bloqueio de ferramenta nem se promete que estes modelos já tiveram aceite artístico. Se a avaliação humana exigir autoria mais sofisticada, ela continua própria de refinamento/R5. Arte prioriza silhueta/material/legibilidade; não há texto pessoal em textura, luz nova ou shader customizado.

### Contrato e identidade

`RecordAsset` contém `assetId`, identidade mínima, dimensões, pivot, escala de normalização, orientação, root/geometry, materiais e canais espaciais independentes. `RECORD_ASSETS` registra seis factories, sem cache global ou persistência. Os apoios reais da mobília continuam em `libraryFurnishingLayout.ts`; não se inventam superfícies de pouso nos registros. Picking bounds são metadados independentes; a seleção continua por raycast geométrico exato R1, sem proxy aproximado.

Substituir exige root independente/desanexado, bounds medidos finitos/centrados/apoiados, dimensões dentro do perfil e os mesmos três IDs. Perfil navegável dos registros estáticos deve ser idêntico; outro perfil exige montagem/revisão espacial, não troca silenciosa. Um livro em jornada retorna **busy** antes de criar sucessor; quando livre, conserva wrapper, parent, posição, `entryId`, `instanceId`, seleção e persistência. Callbacks do runtime atualizam highlight/diagnóstico. Root/material/geometry anteriores são liberados após anexar o sucessor; nenhum clone persistente é registrado.

Sessões deixaram de consultar `variant`, `getProceduralBookVolumeDimensions` ou o hinge concreto. `BookRecordAsset` oferece dimensões, `setSessionGlow` e capacidade `animation` de abertura/bounds/estado. Teste substitui por asset **sem campos variant/coverHinge** e comprova voo, pouso, abertura, rejeição de troca durante transporte, retorno, capa fechada e leases livres. O default mantém campos de authoring antigos, sem torná-los dependência do consumidor.

### Custos e comparações

Mesmo runtime completo fictício da B, quatro GLBs, quatro pergaminhos, 12 livros e dois registros de cada outra categoria. Capturas com câmera normal (zoom 1) e próxima (2,2), próxima com seleção/destaque, no cômodo real com personagens/mobília e relação de escala. Normalização centra a aparência no mesmo wrapper/slot; o fólio anterior tinha centro X assimétrico em ~2,2 cm, então o target derivado do centro visual varia ligeiramente nesse caso. Não se alega câmera pixel-idêntica em todos os seis recortes. Câmera/limites do produto não mudaram.

| Registro pessoal | Meshes antes→depois (runtime) | Triângulos potenciais da peça antes→depois |
|---|---:|---:|
| Livro | 8→6 | 1.536→1.740 |
| Filme | 3→5 | 36→2.596 |
| Série | 7→4 | 84→2.044 |
| Estudo | 4→5 | 48→1.824 |
| Atividade física | 3→4 | 100→1.560 |
| Trabalho | 4→5 | 48→1.664 |

Cena inteira: **220.362→241.554** triângulos potenciais (+21.192, ~9,6%), meshes **648→628**, materiais **165→191**, geometrias estruturais **219→235**, arrays geométricos CPU únicos **1.712.308→2.326.308 B**. Texturas renderer iguais em cada enquadramento (3 inicialmente, até 5 ao visitar as três estantes/cômodos); nenhuma textura de registro nova. Draw calls dependem da vista: livro normal 295→272, filme 263→238, série 265→240, estudo 147→148, treino 118→120, trabalho 122→121. Não são a mesma vista normal global da B; não comparar 272 com 353 como se fosse uma sequência única de FPS.

Custo artístico aumentado deliberadamente, medido sem hard budget inventado e sem promessa de desempenho mobile. Candidata inicial de bake da encadernação usava 2.987.556 B no mundo: corrigida por instancing dos dois recursos compartilhados da capa/corpo. [Imagens/métricas dessa candidata](evidence/bv-recovery-r2/records-after-baked/) preservadas; a entrega é `records-after`. Menos meshes não significa menos bytes ou trabalho GPU, nem aprova estes custos no Moto.

[Revalidação final de navegação](evidence/bv-recovery-r2/navigation-r2-final.json): **125 obstáculos, 138 nós**, arestas por raio 0,66/0,62/0,92/0,58 = **1.432/1.440/773/1.451**. Mesmos 72 pares: **65 válidos/7 rejeitados**, ocupação bloqueia e liberação restaura. Ytha mantém **0,92 m**, P50/P95 de grafo no host **18.85/20.02 ms**, 10.645 testes exatos; rota repetida P50/P95 **0.237/0.488 ms**. Peso novo usa envelope de corpo de 0,54 m em Z cobrindo o selo; tapete abaixo do limiar vigente de 15 cm é steppable. Não encolhe habitantes nem ignora o corpo do objeto. Oracle R1 continua verificando os trechos novos contra os obstáculos detalhados anteriores.

Imagens inspecionadas: as cinco silhuetas antes genéricas ficam reconhecíveis e coerentes com a madeira/latão/pergaminho do cenário; livros recebem acabamento sem perder leitura/encaixe. Esse é um parecer visual web da implementação, **não aprovação artística do proprietário ou do Moto G06**. Reprodução: `node scripts/measure-world-render.mjs /tmp/records R2C '' records`. Usa assets reais do runtime, sem Dexie/shell; E2E do app React é discriminado abaixo.

### Testes e arquivos

61 testes dirigidos PASS em seis arquivos após instancing final: sessão/livro substituível, cinco trocas com ponteiros Three reais, 70 slots/13 registros, layout de prateleiras, física/voos e oracle. Mais 44 PASS na rodada imediatamente anterior cobrindo as cinco fábricas/estantes/ownership. Testes estruturais antigos de listas de cubos sem interseção foram atualizados para as novas peças autorais: geometrias finitas, contidas no envelope declarado, componentes reconhecíveis e distinção de silhueta. O teste de limpeza parcial agora compara todos os BufferGeometry/materiais (incluindo bake temporário) com um ciclo completo e exige descarte único por owner, em lugar de contar três caixas/dois materiais do modelo removido. Asserções funcionais de identidade, picking, rotas, leases e recuperação não foram retiradas ou relaxadas.

Arquivos principais R2A: `inhabitantNavigation.ts`; `three/{spatialComponents,inhabitantObstacles,scrollFlightRoutes,proceduralLibraryBuilding,proceduralLibraryFurnishing,proceduralContent,libraryRecordRepresentations,livingVisuals,inhabitantSceneProps,ThreeWorldRuntime}.ts`; `spatialComponents.test.ts`; benchmark de navegação; docs/evidências.

Arquivos principais R2B: `three/{staticVisuals,ThreeWorldRuntime,proceduralLibraryBuilding,proceduralLibraryFurnishing,livingVisuals}.ts`; testes de bake/luz; `scripts/measure-world-render.mjs`; docs/evidências. Corrige a hierarquia que falhou na CI A. CI B `42312421722`: **Static, unit and build gates SUCCESS**; shard E2E 1 FAIL e 2 ainda em andamento na consulta, sem CI global verde.

Arquivos principais R2C: `three/{recordAssetContract,recordAssets,recordArtifactModels,libraryRecordRepresentations,libraryRecordComposition,proceduralContent,readingAreaBookVisuals,sessionBookVisuals,ThreeWorldRuntime,staticVisuals}.ts`; testes de assets/modelos/sessão/runtime e `e2e/bv-recovery-r2.spec.ts`; probe de vistas; ADR-024, documentação e evidências. Seis tipos e dados Dexie v14/backup v6 preservados; nenhuma alteração de domínio/storage, stack, versão ou main. Código de câmera/picking R1 segue **sem diff** contra `bf26e8d`.

## Validação consolidada R2 e pendências explícitas

Rodada ampla única inicial: **896 PASS / 3 FAIL**, todas em `ThreeWorldRuntime.test.ts`, procurando a capa por nome/pivot anteriores. O batch de peça única agora preserva nome e pivot reais com o mesmo produto de matrizes; não foi acrescentado proxy/test-double nem alterado assert. Regressão dirigida final **82/82 PASS** em cinco arquivos. Repetição ampla justificada pela correção: **899/899 PASS em 142 arquivos**, 57,56 s. Nenhum timeout aumentado, assert removido, skip ou retry automático acrescentado.

[Paridade final do livro](evidence/bv-recovery-r2/book-pivot-parity.json) e [duas vistas finais](evidence/bv-recovery-r2/records-final-book/): normal **zero pixels alterados**, próxima 18/1.152.000 pixels com diferença média de canal 0,0000223; mesmos 628 meshes, 241.554 triângulos potenciais e 2.326.308 B de buffers. Mantidas as capturas completas anteriores, sem fingir que nomes/pivots são identidade do registro.

Gates finais: **format:check, lint global, typecheck, audio:check, build, performance:report e diff --check PASS**; lint dirigido novamente após os últimos guards/pivot e E2E. [Build final](evidence/bv-recovery-r2/build-final.json): entry 668.041 B, Three dinâmico ~821,88 kB / 219,31 kB gzip; warning >500 kB permanece. Android sync/APK não gerados nesta R2; ADB sem aparelho. Não houve teste manual Android, TalkBack, áudio percebido, heap físico, GPU timing ou temperatura.

### E2E: falhas existentes e teste novo separados

[Evidência dirigida](evidence/bv-recovery-r2/e2e-directed.json) · [frame real do app React no bloqueio](evidence/bv-recovery-r2/react-e2e-blocked.jpeg). Duas **execuções**, sem retries automáticos: primeira com dois cenários distintos (**0 PASS/2 FAIL**), segunda somente o novo após correção fundamentada da preparação (**0 PASS/1 FAIL**). Não se somam como três defeitos distintos.

- Existente `bf5r5-world-input.spec.ts`: timeout de 30 s no click de **Próximo →**, depois das etapas de residência/pinch. Cenário já falhava na R1, mas aqui parou em outra etapa; não foi repetida a R1 nem atribuída causa comum/ausência de regressão por nome igual. Teste/código da R1 intocados.
- **Novo** `bv-recovery-r2.spec.ts`: inicialmente bloqueou no helper que abria o painel genérico de exploração, desnecessário para selecionar registros. Corrigido para abrir a lista de registros pela UI real. Segunda execução exibiu seis registros fictícios como representados, mas consumiu os 30 s antes da primeira seleção. Trace registra ~9,66 s no click da bússola e ~9,48 s na abertura da lista. Sem prova causal suficiente para separar DOM/renderer/runner, nem aprovação dos asserts de seleção/reload. Esta é **falha nova de teste/cobertura**, não classificada como histórica, produto regredido ou runner-only. Ficou ativa na suíte, sem enfraquecer asserts ou timeout; triagem adicional fica explícita para R4/integração.

Não continuar loops de E2E sem hipótese nova. Os testes de ponte/picking/identidade passam no nível unitário/integrado do runtime, mas isso **não substitui o E2E React nem o gate físico**. Nenhuma aprovação artística ou CI verde é inferida da inspeção das imagens.

| Comportamento solicitado | Evidência e estado |
|---|---|
| Pan/pinch R1, zoom/limites | Golden/cameraMath/CameraNavigation, gestos e runtime no amplo PASS; fontes sem diff R1. E2E antigo avançou por essas etapas, fluxo completo FAIL |
| Seis registros via Canvas | Raycasts/eventos reais em runtime D1 e cinco substituições; livro incluído nos testes de runtime/sessão, PASS |
| Seleção via React e persistência após reload | Contratos/controlado WorldHost/projeções no amplo PASS; **E2E novo bloqueado antes de selecionar, pendente** |
| Quatro habitantes selecionáveis | Loaders/GLBs/rigs/picking/runtime no amplo PASS; quatro GLBs presentes nas capturas completas |
| Pergaminhos e livros selecionáveis | Raycasts, scroll flight e sessão no amplo PASS; três pergaminhos voando medidos em B, sem supressão |
| Navegação entre salas e rotas válidas/inválidas | 72 pares, 65/7 preservados; quatro habitantes/cinco salas e oracle detalhado R1 PASS |
| Colisões, asas e envelopes | Raio Ytha 0,92 intacto; consultas força-bruta/indexadas e trechos contra geometria anterior PASS |
| Reserva/liberação, apoios e retorno interrompido | Agency/InteractionCoordinator/livro/pergaminhos no amplo PASS; lease perdido/ocupação recusam manipulação insegura |
| Livro cenográfico e original | Ciclos, interrupções, retorno e capa por capacidade real PASS; sem clones/novo dono de movimento |
| Efeitos e dia/noite | LivingVisuals/NightLighting/AmbientMagic e runtime PASS; luzes e efeitos preservados nas imagens B |
| Movimento reduzido | Agência/animação/voo/sessão/runtime PASS; vista específica B preservada |
| Segundo plano/retorno | Visibility/pause/resume/residência/contexto no amplo PASS; probe pausa/retorno sem erro; E2E antigo completo FAIL |
| Descarte | Owners independentes, buffers temporários/compostos e duas montagens no amplo PASS; probe termina com zero canvas/disposed. Heap/memória física não medidos |
| Identidade/dados e ausência de regressão funcional | 899 unitários PASS, incluindo domínio/storage/backup legados, seis tipos e novas trocas; sem schema. Não equivale a ausência absoluta de regressões E2E/mobile |

**Estado da recuperação:** R2 implementada em três checkpoints incrementais, com mecanismos BV-02/BV-03 corrigidos, redução de trabalho BV-04 medida e BV-12 reformado tecnicamente/visualmente em candidata. **E2E React/persistência, aceite artístico humano, Moto G06 e profiling GPU/desempenho físico NÃO CONCLUÍDOS.** R3, R4 e R5 permanecem abertas. Próximo recomendado: R3 (loop/agência/efeitos/lifecycle), com essas ressalvas preservadas e sem migração de engine.

CI B encerrada na consulta final: run [42312421722](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42312421722) **FAIL global**; estáticos/unitários/build SUCCESS, E2E shard 1 FAIL e shard 2 cancelled pelo workflow. Não houve rerun manual. A CI do commit C será disparada pelo push, sem resultado presumido nesta documentação.

### Fechamento físico/lógico do collector

Revisão final encontrou **30 faíscas puramente visuais** ainda alcançadas pelo fallback sob o owner de objetos vivos. Owner agora declara componente vazio para efeitos; componentes físicos filhos (relógio/globo/etc.) continuam descobertos. Roots sobrepostos (estante contendo livro e livro listado à parte) são visitados uma vez, inclusive sem forçar matrizes novamente. Novo teste injeta uma decoração enorme no owner real e exige obstáculos idênticos; outro repete roots e exige ausência de duplicação. Sem alterar geometria/render, raios ou volumes físicos dos móveis.

O checkpoint A permanece historicamente **1.220→155**. Após esta limpeza da consolidação C, o **mesmo cenário** termina em **125** (1.220→125 desde R1), com as mesmas arestas/65 rotas válidas/7 rejeitadas e oracle R1 PASS. Esse cenário tem edifício, três estantes, **13 registros não livrescos e objetos vivos, sem volumes pessoais nas estantes**. Livros originais, 70 slots/capacidade, transporte e catálogo com seis tipos foram validados separadamente em testes/runtime de render completo; 125 não é um teto universal de obstáculos para qualquer catálogo. A presença de livros/ocupação altera as contagens; a deduplicação mantém o mesmo objeto singular.

Rodada ampla final após essa correção e o novo teste: **900/900 PASS em 142 arquivos**, 55,94 s. Format global/typecheck, lint dirigido do collector/owner/teste e build novamente PASS; áudio e lint global anteriores PASS, sem mudança nesses contratos. O estado operacional final substitui o total anterior de 899 (que continua registrado como histórico da rodada antes do teste adicional). Arquivos adicionais C: `three/inhabitantObstacles.ts`, `livingVisuals.ts`, `spatialComponents.test.ts`. Nenhuma falha unitária remanescente conhecida; **E2E continua pendente/FAIL**, sem novo ensaio após a limpeza de volumes que não altera o DOM.

Build publicado final após o collector: Three dinâmico **821,99 kB bruto / 219,32 kB gzip**, entry **668.041 B**; [manifest final](evidence/bv-recovery-r2/build-final.json). As contagens anteriores de bundle descrevem suas respectivas rodadas, não outro gate final.

## Aceite físico e artístico dirigido — 07/11/2026

**Registro posterior ao relato de implementação:** o proprietário atualizou o APK no Moto G06, observou **melhora considerável nos travamentos e no lag do Canvas**, aprovou as remodelagens de **Estudo, Trabalho, Filmes e Atividade Física** e confirmou explicitamente que **o Livro da Estrela agora abre corretamente e o bug parou**. R2 + saneamento aprovados para seguir à R3. Não é certificação de FPS, de performance livre de jank, de todas as seleções/gestos, de E2E React, GPU/memória, acessibilidade ou backup.

SHA da implementação aprovada: `849dd290c2f715012257b5b49e3e8d59c7d6f50a`. [CI correspondente](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42330962430): estáticos/unitários/build **SUCCESS**, shards E2E **FAIL**, resultado global **FAIL**. PR draft #38 sem merge. R3A–R3C são a próxima execução; R4/R5 pendentes. [Ponto canônico de retomada](BV_RETOMADA_R3_2026-11-07.md).
