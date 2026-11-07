# Recuperação R3 — Loop, Agência e Lifecycle

Missão de 07/11/2026; branch `perf/bv-recuperacao-integral`, [PR #38 draft](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/38), base `feat/bf-5-5f-real-session-response`. Recuperação integral aberta; sem merge, R4/R5 ou expansão de BF-5.5F.

## Proveniência e limites

Checkout inicial limpo em `849dd290c2f715012257b5b49e3e8d59c7d6f50a`. Fetch confirmou avanço documental legítimo para `15ba07f29975160d530d8af4dda3553839eaf5a7`; diff examinado e fast-forward, sem alterações descartadas. Este é o SHA inicial da execução R3. PR aberta/draft, base e refs conferidas pelo conector GitHub. O aceite humano de R2/saneamento no Moto G06 é o baseline artístico/funcional; não se estende automaticamente à R3.

`adb devices -l`: nenhum dispositivo. Não há GPU/heap/FPS Android, temperatura, toque, TalkBack ou aprovação física R3. CI de produção R2 `849dd290`: estáticos/unitários/build SUCCESS, ambos E2E FAIL; não é dívida corrigida implicitamente aqui. [Autoridade de retomada](BV_RETOMADA_R3_2026-11-07.md).

## R3A — BV-05, BV-06, BV-08

### Diagnóstico e mudanças

- `livingVisuals`: `scene.traverse` procurava Hemisphere/Directional em todo frame. Montagem do runtime fornece as referências que possui; fábrica isolada descobre uma vez. Referências são liberadas com o controlador, árvore continua pertencendo à montagem. Interpolação dorme ao atingir o alvo (tolerância 1e-5; assentamento exato), acorda por atmosfera/noite/movimento reduzido/reconciliação no resume. Cores, potências e curvas mantidas até o residual imperceptível de assentamento. Nove luminárias conservam fallback de 45 s, inclusive sem nova revisão do ritual; chama, magia e brilho pulsante continuam animados.
- `sessionBookVisuals`: capa/bounds de abertura e emissivo só são escritos quando mudam. Envelope navegável é reutilizado enquanto abertura e matriz mundial forem iguais; movimento, giro, escala do parent e capa invalidam. Descendentes recebem a nova matriz antes de calcular bounds; substituição de representação/layout continua liberando a jornada. Snapshot anterior não é modificado. Geometria de voo é coletada na partida como antes; nenhum cache novo de obstáculos ou trajetórias.
- `InteractionCoordinator.retain`: consulta a autoridade dos dois recursos a cada frame; renova leases imutáveis de 30 s apenas quando faltam até 10 s. Expiração, liberação ou outro owner são detectados imediatamente. Não há lease paralelo, TTL em wall time de background ou cache de ownership. Reserva inicial/recuperação continuam no mesmo coordenador.
- Runtime: duas fases de poses em vez de quatro (cinco se checkpoint habilitado): pré-agência para colisões do livro, pós-agência compartilhada por visuais, transporte, pergaminhos e checkpoint. Manter ambas é necessário à ordem física existente; nenhum consumidor recebe `Agent` mutável. Cadência do checkpoint é testada antes de criar snapshots adicionais.
- Pergaminhos: 36 vetores por trilha alocados na montagem e reutilizados em anel só com trilha visível; repouso deixa de fazer clone/unshift/escrever nove motes por frame. Candidatos não criam Vector3 para distância. Âncoras de transporte e `Magic` dos habitantes são resolvidas uma vez por asset; conclusão de loader invalida fallback e descarte libera mapas.

### Comparação reproduzível no host

[Antes](evidence/bv-r3/before.json) / [depois](evidence/bv-r3/after.json), mesmo teste `r3Loop.probe.test.ts`, Node/Vitest/jsdom, deltas determinísticos, dia, três livros pessoais, um pergaminho em repouso e livro de sessão já pousado/aberto. 900 passos de 50 ms para pouso, 600 frames de aquecimento da atmosfera, depois 600 de 1/60 s. Sem renderer, GLBs ou GPU nessa probe; testes integrados cobrem o runtime separadamente.

| Trabalho em 600 frames | Antes | Depois |
|---|---:|---:|
| Travessias globais da cena | 600 | 0 |
| Interpolações de cor | 2.400 | 0 |
| Box3.setFromObject (capa + envelope) | 1.200 | 1 |
| Escritas de capa | 1.200 | 0 |
| Escritas de brilho do livro pessoal | 600 | 0 |
| Criações/renovações por reserve | 1.200 | 0 |
| Clones de Vector3 | 600 | 0 |

Zero `reserve` nesta janela não significa zero consultas: são mantidas 1.200 verificações diretas de autoridade; janelas maiores renovam perto do prazo. O único Box3 inicial preenche o cache de navegação. Menos trabalho/alocações comprovados; impacto em GC e fluidez Android continua hipótese. Não há limite de FPS ou tempo inventado. Tradeoff: 36 vetores por pergaminho retidos desde a montagem (antes cresciam até 36), duas cópias pequenas de poses por frame e cache de um envelope por jornada. Nenhuma luz, mesh, animação, resolução ou asset foi reduzido.

Reprodução depois: `BV_R3_PROBE=after npx vitest run src/features/library/three/r3Loop.probe.test.ts --no-file-parallelism`. Para antes, usar worktree temporário em `15ba07f`, mesmas dependências e uma cópia desse único arquivo de probe, com `BV_R3_PROBE=before`; não substituir fontes do checkout de trabalho. O teste usa APIs já existentes na base. Asserções funcionais exigem mesmo livro aberto, duas reservas e pergaminho parado; contadores não são budgets de CI.

### Regressões e gates

102 testes distintos aprovados entre as rodadas dirigidas, 11 arquivos. Rodada integrada inicial: 94 PASS / 1 FAIL novo no teste de invalidação de parent; a primeira hipótese (atualizar matriz local) não resolveu. Inspeção do `Object3D.updateWorldMatrix` instalado demonstrou necessidade de propagação forçada; corrigida apenas na invalidação. Teste dirigido passou, depois rodada final de livro/runtime/GLBs/probe: **65/65 PASS**, quatro arquivos; demais 37 já aprovados, sem mudança posterior nesses mecanismos. Lint dirigido final também identificou async sem await e leitura sem tipo do resultado de spy no teste novo: corrigidos com Promise.resolve e fronteira unknown, sem supressões. Sem timeout/assert removido ou retry E2E.

Cobertura: dia/noite/45 s/reversão/reconciliação; Livro da Estrela abrir/fechar, comandos rápidos, reversão, páginas/exame, transporte/pouso/retorno e runtime pausa/resume; livro pessoal de três estantes/coleção cheia, identidade, interrupção/conclusão/leases perdidos e asset substituído; pergaminhos voando/retorno/cauda; quatro GLBs reais, continuidade, agência e seleção. Teste do runtime exige duas chamadas de `getPoses` por frame e estabilidade do snapshot anterior.

PASS: lint global, typecheck, format:check, build web, performance:report e diff check; checagens dirigidas adicionais após ajustes finais. Bundle Three aproximadamente 824,6 kB bruto / 220,3 kB gzip (R2 822,8 / 219,6); warning >500 kB mantido. Report é build, não runtime. E2E conhecido bloqueado antes da seleção em R2 não foi repetido em A sem hipótese nova; investigação de lifecycle em C. CI desta candidata consultada após publicação; não presumir verde.

Publicação: commit que introduz esta seção (consultável com `git log -- docs/audits/BV_RECUPERACAO_R3.md`); SHA remoto será registrado em R3B antes de sua implementação, evitando hash autorreferente.

## R3B — BV-10

R3A publicada e push confirmado em `f1086b7ee842a63d28b8c7523f422d31773b694a` antes de modificar B. [CI A 42386112957](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42386112957): na consulta durante B, formatação/lint/tipos PASS, unitários e E2E ainda rodando; sem conclusão antecipada.

### Antes e depois

Antes: agência continha catálogo autoral e preferências junto ao escalonamento; callbacks instalados no construtor consultavam envelope/candidatos dos visuais de dentro de movimento, escolhas, encontros e recuperação. A mesma atualização podia solicitar várias vezes o mesmo estado; a fase em que esse estado era válido dependia da composição por closures. Pergaminhos consultavam snapshots diagnósticos completos para saber se uma superfície estava reservada.

Depois:

| Responsabilidade | Owner/contrato |
|---|---|
| Pontos, rótulos, interação cenográfica e preferências individuais | `inhabitantActivities.ts`, catálogo extraído sem mudar valores/ordem/âncoras |
| Obstáculos físicos, oportunidade de leitura e pergaminhos | `AgencyEnvironment`, somente dados readonly; composição fornece a `agency.update(environment)` |
| Amostragem e ordem física | Runtime: livro usa poses prévias → amostra entradas atuais → agência move/decide → snapshot pós-agência → visuais |
| Escolha/prioridades, rotas, cancelamento, narrativa, continuidade | Mesma `InhabitantAgency`, única autoridade de movimento |
| Exclusividade, expiração, renovação e disputa | Mesmo `InteractionCoordinator`; `isReserved(resource, now)` consulta uma superfície sem copiar leases |
| Livro pessoal: root, capa e devolução | Mesmo `sessionBookVisuals`; oportunidade é intenção disponível, não reserva/transformação transferida ao NPC |
| Livro da Estrela/pergaminhos carregados | Visuais seguem estado da agência e âncora, sem decidir movimento de personagens |

Removidos os três callbacks de leitura de estado do construtor da agência. Navegação/encontros compartilham o envelope amostrado durante toda a atualização, sem chamar Three. Catálogo de aproximadamente 130 linhas e tipos autorais saiu do coordenador; não se criou scheduler, segunda agência ou framework. Layout continua compartilhado (dados sem renderer), e a navegação mantém os mesmos envelopes, incluindo Ytha.

Capturar entradas explicitamente em cada frame poderia alocar candidatos em repouso; por isso livro mantém uma oportunidade imutável por jornada e pergaminhos retornam a lista anterior quando IDs/elegibilidade/posições não mudam. Durante transporte, mudança de posição/ownership/voo invalida; snapshots entregues antes continuam estáveis. `isTransporting()` evita construir o snapshot diagnóstico do livro para arbitrar novos voos. Não há cache de autoridade de lease.

### Evidências, riscos e gates

Antes: regressões A aprovadas. Depois da troca de contrato: **81/81 PASS, sete arquivos**, incluindo agência completa, todos encontros/manipulação cenográfica, sessão/prioridade, leases órfãos, continuidade, runtime e pergaminhos. Depois dos snapshots estáveis e testes novos: **23/23 PASS, cinco arquivos**, com sobreposição. Novo teste bloqueia movimento com envelope temporário e exige retomada no próximo update após removê-lo. Outros asserts verificam expiração/disputa de superfície e identidade/imutabilidade de oportunidades. Probe A continua PASS; nenhuma asserção anterior retirada (testes apenas passaram a fornecer as mesmas entradas por argumento).

PASS: lint global (mais dirigido após os últimos imports), typecheck, format:check, build web, performance:report e git diff --check. Um format:check intermediário identificou formatação pendente em livingScrollVisuals; corrigida e check global repetido com PASS. Warning de bundle >500 kB permanece; inventário em evidence/bv-r3/build-r3b.json. E2E global conhecido permanece dívida; não foi repetido em B sem nova hipótese. Nenhuma leitura sentada, rig, F2B/F2C ou simplificação visual. Riscos mantidos: coordenador ainda extenso, coreografia especializada e geometria autoral precisam disciplina; entradas valem por uma atualização, e novos sistemas devem respeitar a fase declarada. Isso não pretende resolver autoria de rigs/assentos ou R5.

Publicação B: commit que introduz esta seção; SHA remoto registrado em C após push e antes de sua implementação.

## R3C — BV-15

B publicada e push confirmado em `a9fc253b6139c9a7054a212eb987ac4f605632cc` antes de modificar C. [CI B 42386553098](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42386553098): gates estáticos/unitários/áudio/build/performance SUCCESS; E2E ainda em execução na consulta durante C. Mesmos gates A também SUCCESS; sem presumir conclusão E2E.

### Diagnóstico e reparos demonstrados

Baseline dirigido anterior à alteração: **103/103 PASS, cinco arquivos** de host/runtime/GLBs/animação. Dois novos testes reproduziram FAIL na base B:

1. `disposeObjectTree` aceitava apenas Mesh. As runas ambientais usam Line; suas geometrias e material compartilhado nunca recebiam dispose. O probe real contou **8 recursos da árvore não descartados em 341**, e cinco geometrias inicializadas ainda apareciam no renderer. Helper agora inclui Mesh, Line (inclusive subclasses) e Points, deduplicando materiais, texturas e geometrias pelo mesmo owner. A cena continua exatamente igual; não se suprimiu a magia. O defeito é falta de liberação demonstrada, sem inferir bytes vazados ou leak Android.
2. Callback RAF cancelado, entregue após pause/resume, aceitava o estado running da nova época, renderizava e sobrescrevia o identificador do RAF atual. Reprodução real/manual: **dois RAFs na retomada**, um sobrava no background e após descarte. A montagem agora invalida callbacks por geração e recusa um segundo agendamento enquanto já possui um. Não muda delta, cadência ou animação. Três drivers de testes que reutilizavam o callback anterior após resume passaram a buscar o callback realmente vigente; asserts de repouso, capa, livro original, retorno e contexto foram preservados.

Inspeção do Three instalado confirmou que `WebGLRenderer.dispose()` limpa caches mas não perde o contexto. A montagem agora também chama `forceContextLoss` no encerramento terminal (opcional para renderers de teste), após remover listeners. **Pausar/ocultar aba não executa esse caminho.** Harness confirma contexto perdido nos dez descartes. Um experimento de dois ciclos demonstrou que liberar o contexto não explica sozinho a retenção DOM observada abaixo; não se registra isso como correção completa de memória.

### Matriz de lifecycle

| Cenário obrigatório | Evidência / resultado |
|---|---|
| Montagem inicial | Runtime real, seis categorias fictícias, quatro GLBs carregados e um pergaminho; 341 recursos acompanhados por montagem |
| Abas/residência | Host React com dez alternâncias, uma fábrica/montagem/canvas; runtime pausado mantém recursos e seleção |
| Retorno sem RAF duplicado | Dez ciclos Chromium; um frame pendente após resume repetido e callback antigo inerte |
| Pausa/retomada repetida | Delta congelado e seleção conservada; regressões dos livros pessoal/cenográfico e habitantes |
| Background/foreground | `document.hidden` controlado; zero frames no background; rota explicitamente inativa continua paused ao voltar |
| Orientação/viewport | 800×600 ↔ 600×800, mesmo canvas e seleção; regressões de target/zoom, dimensões inválidas e resize fallback |
| Gestos/capture | Pointer real do Chromium, capture true antes e false após pausa, gesture idle; cancel/lostcapture/pinch nos unitários |
| Loaders tardios | Quatro modelos e respectivas texturas concluídos após dispose: todos liberados uma vez, sem ready/âncora; fixture tardio e factory React cancelada também cobertos |
| Descarte/remontagem/subsistemas | Dez instâncias sequenciais; árvores/mixers/leases/subscriptions/observer/listeners/RAF liberados; novo runtime funcional |
| Contexto perdido/restaurado | WEBGL_lose_context real no décimo ciclo: perda → failed; contexto restaurado pelo harness → mesma instância continua terminal; harness libera a restauração que ele próprio pediu |

### Dez ciclos e memória

Receita: `node scripts/check-world-lifecycle.mjs docs/audits/evidence/bv-r3/lifecycle-after 10`. Vite dedicado, Chromium/SwiftShader, DPR1, sem React/Dexie no harness gráfico; testes React separados cobrem residência/timer/sessão. Scheduler manual e relógio injetado permitem verificar callbacks tardios; não são FPS reais. Cada ciclo monta, espera quatro GLBs, seleciona Livro da Estrela, captura gesto, pausa/retoma, alterna viewport/background, descarta e coleta contadores. Sessão pessoal em transporte/pausa/conclusão é exercida nos testes integrados, não simulada artificialmente no harness de recursos.

[Baseline B, um ciclo com falhas](evidence/bv-r3/lifecycle-before.json) · [dez ciclos finais](evidence/bv-r3/lifecycle-after/lifecycle.json). **PASS dos contratos dirigidos nos dez ciclos**:

| Contador por montagem | Residente/pausado | Após descarte (todos os dez) |
|---|---:|---:|
| Canvas anexado | 1 | 0 |
| RAF pendente | 0 pausado / 1 retomado | 0 |
| Listeners DOM do runtime/renderer | 13 | 0 |
| ResizeObserver ativo | 1 | 0 |
| Recursos da árvore observados | 341 retidos intencionalmente | 341 com dispose único; 0 omitidos/duplicados |
| Leases após descarte | — | 0 |
| Contexto WebGL | ativo residente | perdido em 10/10 |
| Geometrias renderer.info | 108 ou 118 conforme viewport | 0 |

`renderer.info.memory.textures` termina em **1** em cada instância, embora todas texturas da árvore recebam dispose e contexto termine perdido; contador interno não mede bytes de GPU nem prova recurso produtivo vivo. Não forçar esse contador a zero nem desativar assert para produzir uma narrativa de limpeza absoluta.

**Retenção ainda não atribuída:** após GC via CDP, DOM total **8→17 nós** em dez ciclos (um documento e 13 listeners globais estáveis do Playwright); a inspeção de uma rodada intermediária identificou canvases destacados. Heap JS pós-GC **22.948.376→24.765.420 B**; backingStorage **20.611.877 B** em nove ciclos e **20.611.912 B** após restauração. Não há prova suficiente para classificar todo crescimento como vazamento do produto: harness, DevTools, JIT/caches e finalização nativa não foram isolados por retentores de heap. Também **não se declara memória estabilizada/ausência de leak**. A amostra comprova estabilidade dos recursos explicitamente possuídos e revela uma pendência de retenção host; memória sustentada e Android permanecem gates abertos. Depois do experimento dirigido de contexto sem eliminar o resíduo, não se executaram novos loops exploratórios dessa causa.

### Instrumentação, falhas intermediárias e validação

- Primeira probe B parou no assert de background (RAF antigo). Segunda probe B de um ciclo persistiu todos contadores antes dos asserts: dois RAFs/um órfão e oito recursos omitidos. Traces preservados localmente em `/tmp/bv-r3c-before/` e `/tmp/bv-r3c-before2/`; não são teste físico.
- [Primeira captura após reparos](evidence/bv-r3/lifecycle-first-after.json): dez ciclos completos, asserts funcionais/recursos atendidos, mas check global de listeners falhou contando 13 handlers da automação. [Segunda](evidence/bv-r3/lifecycle-second-after.json): adicionou baseline e retirou snapshots do tracing; ainda contava a inicialização tardia dos event guards do Playwright. Inicializar os guards antes do contador resolveu em ensaio de um ciclo; a rodada seguinte de dez passou. Nenhum listener do runtime foi excluído da contagem.
- Com snapshots do tracing havia +39 nós/ciclo; sem snapshots +1. Consultar detached nodes via CDP foi retirado para não reter identificadores no agente DOM; o resíduo +1 persistiu, portanto essa hipótese **não** foi declarada resolvida. [Rodada sem perda explícita do contexto](evidence/bv-r3/lifecycle-pre-context-release.json) e [experimento de liberação, dois ciclos](evidence/bv-r3/context-release-diagnostic.json) preservados. A rodada final verifica também o contexto terminal.
- Uma execução auxiliar de um ciclo falhou por variável removida ainda referenciada no harness; corrigida antes da rodada final. Lint exigiu globals explícitos do browser, guards de tipos Three no teste de recursos e await do act com timer. Sem desligar regra/assert, aumentar timeout ou retry. A primeira edição do helper de descarte deixou uma referência antiga no contador da fixture, causando 48 falhas dessa mesma causa mais três drivers RAF obsoletos; corrigida a referência e os drivers. Rodada subsequente 64 PASS/1 driver ainda obsoleto; corrigido, teste dirigido PASS.
- Depois dos reparos: **108/108 PASS, seis arquivos**; novos testes de timer/late load e regressões complementares **47/47 PASS, cinco arquivos**, com sobreposição. **Rodada final: 125/125 PASS, nove arquivos**. Lint global, typecheck, format:check, audio:check, build web e performance:report PASS; diff check final após remover linha em branco extra no relatório. Warning >500 kB preservado; inventário build-r3c.json.

Inspeção de ownership: `ThreeWorldMount` remove RAF/context/viewport/visibilidade e árvores; interação cancela captures e helper; `sessionBooks.dispose` restaura root/capa e libera seus dois leases antes do descarte; agência libera interações e listeners; habitantes param/uncache mixers e rejeitam todos loads tardios; recursos dos efeitos pertencem ao building. Host possui um timeout alinhado ao minuto, depois um intervalo, com unsubscribe/cleanup; teste fake-clock exige **1 timer**, inclusive em dez trocas de rota, e **0** após unmount. Nenhum timer por habitante ou subsistema novo.

## Estado da candidata e gate físico

R3A/B/C implementadas em checkpoints sequenciais na PR draft #38; SHA C é o commit que introduz esta seção, registrado na PR após push. **Candidata ao Moto G06; recuperação integral aberta.** BV-15 permanece parcialmente verificável: defeitos de ownership/RAF corrigidos e matriz dirigida executada; retenção host sem atribuição e memória/ergonomia/temperatura físicas continuam abertas. R4/R5, E2E global, F2B/F2C, leitura sentada/rigs e dívidas assistivas não foram encerrados.

Roteiro Moto G06: mesmo catálogo fictício/condições da R2; Canvas pan/pinch/seleção e câmera; ciclo dia/noite/nove luminárias e magia; Samael/Aryn/Ytha/Lua e pergaminhos; Livro da Estrela abrir/fechar, duplo comando, reversão, páginas/examinar/transporte/retorno; livro pessoal iniciar leitura, pousar, pausar/retomar/concluir e devolver com identidade preservada. Alternar abas dez vezes, background/foreground, retrato/paisagem, cancelar gesto e confirmar seleção/sessão; observar aquecimento, travamentos e fluidez sem presumir FPS. Não limpar dados pessoais.

No Fedora, checkout da branch publicada, `git pull --ff-only`, dependências do lockfile com `npm ci`, JDK/SDK Android configurados pelo ambiente existente; executar **`npm run android:build:debug`**, que já encadeia build web → Capacitor sync → Gradle assembleDebug. APK em `android/app/build/outputs/apk/debug/app-debug.apk`. Não precisa rodar sync separado antes. Instalar atualizando o app existente (pelo método habitual ou `adb install -r ...`), sem desinstalar/limpar dados. Nenhum APK novo foi gerado nesta missão; não se afirma instalação ou gate Android. [Fluxo vigente](../ANDROID.md).

## CI comparada e publicação

Logs de [R2 aprovada `849dd290`, run 42330962430](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42330962430) e [R3A `f1086b7`, run 42386112957](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42386112957) consultados pelo conector após conclusão: gates estáticos/unitários/áudio/build/performance **SUCCESS em ambas**, E2E **FAIL global em ambas**. Base aprovada: **30 PASS / 37 FAIL**; A: **34 PASS / 33 FAIL**. Nenhum nome de falha novo; quatro nomes antes reprovados passaram (HUD BF-5R1, transição/tátil BF-5R2, arraste BF-5R4 e coleção vazia). Comparação por nome **não prova causalidade ou correção desses quatro cenários**. [Listas exatas por shard e comparação](evidence/bv-r3/ci-r2-r3a-comparison.json). A referência de 31/36 no saneamento era a R2C `10c664c`, outra execução.

B tem gates estáticos/unitários/build SUCCESS na consulta; resultados E2E e CI do HEAD C são atualizados na descrição da PR após push. Não atribuir o PASS do harness isolado à suíte E2E do aplicativo. Sem merge, mudança de base ou PR anterior alterada. Worktree será conferida após publicação C.
