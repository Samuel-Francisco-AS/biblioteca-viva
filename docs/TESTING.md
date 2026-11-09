## BF-5.6E — testes da candidata TCG

Motor e efeitos: preparação, custos, zonas, alvos, Guardião/Ímpeto, combate simultâneo, escudo, cura/drenagem, buffs/expiração, exaustão, artefatos, compra/overflow/fadiga, terminais, ações ilegais, limites e replay. Matriz de IA usa 16 casos independentes, mesmas asserções e timeout de 5 s; visão filtrada testada contra alterações de cartas ocultas. Catálogo confere 48 identidades/artes/hashes e quatro decks. Integração Dexie cobre upgrade v18→v19/reabertura, rollback após escrita, revisões, histórico, autoria, formatos originais v6–v10 e backup v11 com replay. E2E `bf56e-duel.spec.ts` usa controles reais, partida completa, retomada/resultado/novo duelo, decks e Oficina dos três tipos; seu limite de 180 s cobre uma partida inteira com cadência visível de IA, sem mudar timeout de Canvas.

`node scripts/generate-duel-art.mjs --check` verifica procedência/bytes. `node scripts/simulate-duels.mjs 12` executa 192 duelos determinísticos e grava relatório por seed/par/carta. Ensaios inicial e após uma rodada de ajuste estão preservados; não equivalem a equilíbrio competitivo. [Resultados exatos e separação de falhas](BF-5_6E_TCG_DUELO_ARCANO_IMPLEMENTACAO.md). Não repetir suíte ampla por timeouts históricos; revalidar reparos de forma dirigida. Nenhuma evidência automatizada aprova arte/TalkBack/termal no aparelho.

## BF-5.6D — verificação da candidata

`educationalPacks.test.ts` exercita schema/hash/versão/contagens, colisões, rollback, idempotência, incremento, correção/anulação, remoção/reinstalação e backup v10/v9. Regressões A–C conservam originais v6/v7/v8. `educationalPacksVolume.test.ts` usa 200/1.000/3.000 questões sintéticas em bancos descartáveis e grava métricas em `/tmp`, sem conteúdo fictício no catálogo. `PackLibrary.test.tsx` cobre gestão, prévia sem escrita, erros, Portal resumido e arquivadas. E2E D usa arquivos reais locais e rede offline, retrato/paisagem e histórico. `npm run packs:check` confere bytes/pins do conteúdo embarcado. [Resultados exatos, falhas e roteiro físico](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md). Ampla 1.120 PASS/11 FAIL antes dos reparos dirigidos; não inferir CI global verde. Canvas histórico e gates físicos permanecem pendentes.

## BF-5.6C — verificação da candidata

Novas suítes de domínio, Dexie/fake-indexeddb e React verificam seleção, taxonomia, IDs estáveis/gabarito, histórico/snapshots, dez questões, correção, conflitos, pausa/reabertura, rollback/backup v9 e importação v8 original. Regressões A+B preservam v6/v7, mídia e troca v1. E2E `bf56c-provations.spec.ts` percorre editor/taxonomia, dez respostas com pausa/reload, diagnóstico/download JSON/CSV e reparos de molduras/família/nome. Dados estritamente fictícios. [Resultados exatos, falhas intermediárias e gate físico A+B+C](BF-5_6C_PROVACOES_DIAGNOSTICO_IMPLEMENTACAO.md). Nenhum resultado automatizado certifica TalkBack ou Android físico.

## BF-5.6B — verificação da candidata

`arcanariumWorkshop.test.ts` usa Dexie/fake-indexeddb reais para upgrade v15→v16, Oficina transacional, mídia/ownership, referências órfãs, rollback, fonte canônica, sessões, v8/v7 e troca v1. Regressão da A cobre v14→atual, IDs legados e restore v6. `ArcanariumPage.test.tsx` exercita editor/rascunho/conflito/baralho/retomada com aplicação e banco reais; `bf56b-workshop.spec.ts` cobre navegação/Canvas residente, teclado, duas respostas com reabertura, Relicário/mídia/retrato-paisagem e download/importação real. Não há retries ou ampliação de timeouts. [Resultados, falhas e roteiro físico](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md). Nenhum PASS Android/TalkBack/artístico é inferido.

> **BF-5.6A candidata (08/11/2026):** [matriz e resultados da fundação](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md#verificação-e-resultados). Testes puros de domínio, integração Dexie com fake-indexeddb, rollback/restore v6-v7 e E2E de Estudos/fonte global separados. Gate Moto G06 pendente; timeout amplo histórico da Ytha e ausência de CI global verde permanecem.

> **BF-5.5 — gate final por aceitação com ressalvas (08/11/2026).** F2 obteve 5/5 grupos PASS no Moto G06, 266 Vitest dirigidos e 1 E2E dirigido PASS. G: proprietário autorizou fechamento após inspeção física, sem afirmar perfeição ou PASS individual para todas as verificações. Rodada G 277 PASS/1 timeout e o arquivo isolado 13/13 PASS (278 distintos entre execuções); fixture de HUD CSS 4/4 PASS; **E2E G 1 PASS/1 FAIL por timeout, HUD paisagem final ainda sem PASS integrado**. CI remoto omitido por cota, TalkBack/memória/termal/GPU e dívidas R5 permanecem. Não converter aceite humano por exceção em CI verde. [Fechamento e limites](BF-5_5_FECHAMENTO_2026-11-08.md).

> **BF-5.5G — 08/11/2026:** novas regressões medem apoio dos pés contra a velocidade real da agência, levantamento na recuperação, fechamento do ciclo, hover vertical/asas de Ytha, duração/cleanup da vinheta e feedback do dock sem estado residual no retorno. Integração dirigida preserva F2, agência, noite, pergaminhos, quests, seleção e lifecycle. [Resultados exatos, falhas intermediárias e gate físico pendente](BF-5_5G_REFINAMENTO.md#verificações). O aceite funcional F2 foi informado pelo proprietário nesta missão; não equivale a aceite visual da G ou CI global verde.

> **BF-5.5F2 — 08/11/2026:** testes novos exercitam agência real, exclusividade/ocupação, saída em cancelamento/conversa/reduced/background e reabertura; GLBs reais verificam triângulos nas transições, apoio por raycast e ponta do estilete contra a prancha. O teste integrado percorre o livro original da estante à mão/assento e de volta, com pausa/retomada, identidade e recursos. [Resultados executados e limites](BF-5_5F2_IMPLEMENTACAO.md). O teste preexistente de hover de Ytha passa a um caso por clip (19), preservando todos os vértices, nove poses, asserts e timeout de 5.000 ms; a candidata ampliou a coleção de 8 para 19 clips. Capturas headless não aprovam contato humano ou GPU Android. Verificação final: 266/266 dirigidos (31 arquivos), um E2E PASS sem retries, formato/lint/TypeScript/áudio/build/report/sync/debug e diff PASS; contato/fluidez no Moto G06 pendentes.

> **GATE FINAL R1–R5 — 08/11/2026:** encerramento autorizado **por aceite físico dirigido e exceção técnica**, sem alegar CI global verde. No Moto G06: melhora substancial do Canvas, primeiro frame noturno PASS, luminosidade/arte melhoradas e contorno esverdeado corrigido; engasgo das quests residual aceito como dívida. R5P 962/962, R5R 139 dirigidos e reparo 69 dirigidos PASS, mas há E2E de estabilidade/seleção pendentes, hover com timeout na ampla e retenção heap/DOM sem esclarecimento; não arredondar execuções distintas em ampla verde. TalkBack, termal/memória sustentada e Android GPU não foram validados. [Fechamento completo](audits/BV_FECHAMENTO_RECUPERACAO_R1_R5_2026-11-08.md).

> **R5R — 08/11/2026:** 139 dirigidos PASS/13 arquivos, mais cinco finais sobrepostos e um caso numérico de fixture. Cobertura de quests/foco/Back, glow/ownership, seleção exata, sessões/pergaminho e primeiro frame noturno. Um lifecycle WebGL PASS; 24 vistas magic + quatro idle por versão e UI móvel/reduced motion. Harness final escreveu artefatos completos mas terminou com sinal 143 no encerramento, preservado como limitação; E2E/ampla não repetidos, dívidas históricas abertas. [Evidências e gates](audits/BV_POLIMENTO_R5R.md).

> **R5Q residual — 08/11/2026:** proprietário: início noturno/fluidez geral PASS, quests PARCIAL no Moto G06. Dirigidos 120 PASS/7 arquivos; ampla única 981 PASS/1 timeout em hover de Ytha (5000 ms preservados), arquivo isolado 3 PASS; 982 casos distintos passaram entre execuções, sem segunda ampla verde. Probe/runtime final 61 PASS sobrepostos; 64 casos CPU/DOM e 12 WebGL por versão, um lifecycle real PASS. E2E não repetido, 0/1 histórico R5Q e dívidas R2/R5P abertos. [Evidências e limites](audits/BV_SANEAMENTO_R5Q.md#complemento--engasgo-residual-das-quests).

> **R5Q — 08/11/2026:** 126 dirigidos PASS; ampla 972 PASS/1 FAIL de fixture matchMedia, corrigida sem alterar assert/produto/prazo; runtime final 55 PASS, total de 973 casos distintos aprovados entre execuções. Primeiro desenho/retomada/narrativa/ritual e oracle exato de vértices/raycast; 48 casos CPU/DOM e oito WebGL por versão. E2E dirigido 0/1 na espera histórica de estabilidade do Canvas, sem retry; CI global e gate Moto G06 continuam abertos. [Relatório](audits/BV_SANEAMENTO_R5Q.md).

> **R5P — 07/11/2026:** 73 testes dirigidos iniciais e 8 da mudança de CPU (conjuntos com escopos próprios); ampla final **962 PASS/154 arquivos**, após uma primeira ampla de 960 antes do hotspot adicional. Oracle de todos os vértices/bounds/hits dos quatro GLBs em idle/walk/magic sem aproximação; modos WebGL/0–45 s/seleção/lifecycle PASS. E2E: inicial 0/3; controle R5E 0/2 nos fluxos mobília/input; final pós-CPU 0/2 em Canvas/input. Falhas e pontos diferentes discriminados, sem causa comum presumida, retry, prazo/assert editado ou CI verde. [Relatório e evidências](audits/BV_SANEAMENTO_PERFORMANCE_R5P.md).

> **R5E:** `assets:inhabitants:check` inclui intermitência/níveis/redução de efeitos, ownership da luz e hover real dos clips de Ytha (clearance e X/Z), além dos rigs/envelopes/picking. [Relatório R5E](audits/BV_RECUPERACAO_R5E.md). E2E R5D/R2 continuam dívidas; não repetidos nesta rodada artística.

> **R5 — candidata em implementação (07/11/2026):** R5A–D candidatas publicadas na [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), sobre main `7100ff6` integrada com R4. Quatro GLBs remodelados, skins reais, oito clips reconstruídos, sockets explícitos e descarte de Skeleton. 950 unitários PASS; E2E dirigido 0/2 após correção de preparação, sem retries; APK debug gerado; aceite artístico individual/Moto G06 pendentes, assento/F2B/F2C não entregues, CI remota omitida por cota. Recuperação integral aberta. [Relatório vigente](audits/BV_RECUPERACAO_R5.md) · [Pipeline](INHABITANT_ART_PIPELINE.md). Notas abaixo preservam a cronologia.

## Saneamento pós-R4 — sessões de leitura (07/11/2026)

Nova regressão cobre o clock de 1 s compartilhado, pausa/retomada, visibilidade DOM/Activity, reabertura, descarte inclusive de listener nativo tardio e um só intervalo entre consumidores. Integração real com Dexie verifica relógio/indicador/duração final, acesso direto no fólio, sessão global concorrente, histórico e cinco tipos restantes. O teste de projeção do Canvas passa a iniciar pela UI. Suíte final **946 testes / 149 arquivos PASS**. E2E dirigido de leitura + Pomodoro **2/2 PASS**; nova execução só da leitura após correção visual **1/1 PASS**, zero retries. Seletores antigos de timer de Estudo passaram a usar seu nome acessível, pois há também um timer global. Asserts funcionais preservados. R2 FAIL histórico por deadline permanece sem reexecução ou causa presumida. [Gates, capturas e limitações físicas](audits/BV_SANEAMENTO_POS_R4_LEITURA.md).

> **R4 — candidata de 07/11/2026:** main base `d5eb469` integra PRs #32–#38 e aceites físicos dirigidos R2/R3/segurança. R4A–D implementadas na PR draft #39; gates estáticos, 935 unitários, web e APK debug locais PASS. Dados/sessões separados, diagnóstico opt-in e integridade v6 reforçada. Playwright dirigido **3 PASS/1 FAIL** (seleção R2 por deadline, causa não atribuída); sem aprovação física R4 ou CI global verde. [Autoridade canônica e evidências](audits/BV_RECUPERACAO_R4.md). BF-5.5 parcial; R5, F2B/F2C e BF-5.5G não iniciadas. Notas anteriores são cronologia.

## Saneamento de segurança pós-R3 — 07/11/2026

`npm ci`, auditorias produção/completa (zero), format:check, lint, typecheck,
923 testes/144 arquivos, áudio, build, performance report e APK debug PASS.
Override localizado de minimatch mantém os mesmos 427 arquivos do lint,
sem erros/avisos. Fixture adversarial de backup: 512 notas inválidas e limite
10 MiB + 1 byte, base intacta e sem casts/consumo de memória exaustivo.

Playwright: rodada inicial 7 PASS/2 FAIL; assert antigo de `toHaveValue` no
botão do seletor de tamanho substituído por exibição + radio checked/value,
backup final 1/1 PASS. Oito cenários distintos PASS; R2 seleção/highlight
continua FAIL. Comparação única da base a29f2ca também FAIL em seleção, em
ponto distinto, sem causa comum presumida ou timeout/retry ampliado.
Um ciclo real de lifecycle com seis categorias/quatro GLBs/pergaminho PASS.
[Relatório, comandos, limitações e APK](audits/BV_SANEAMENTO_SEGURANCA_POS_R3.md).
Sem nova CI (publicação com `[skip ci]`), sem aparelho/teste físico novo;
aceite humano anterior da R3 preservado, recuperação integral aberta.

> **R3C — 07/11/2026:** harness real de dez ciclos PASS (zero retries), perda/restauração WebGL terminal e pointer capture; testes de host residente/timer único, quatro loaders tardios, livros e retomada. [Matriz, falhas de desenvolvimento/instrumentação e limites de memória](audits/BV_RECUPERACAO_R3.md#r3c--bv-15). Não equivale à CI E2E do produto ou gate físico Moto G06.

> **R3B — 07/11/2026:** agência/continuidade/interações/runtime 81 PASS; subconjunto final com contratos novos 23 PASS (sobreposição), incluindo envelope temporário bloqueando e removido, disputa/expiração e oportunidades estáveis. [Evidências](audits/BV_RECUPERACAO_R3.md#r3b--bv-10); gate físico R3 pendente.

> **R3A — 07/11/2026:** regressões de invalidação por matriz/capa, ownership em toda utilização, transições de luz, cauda de pergaminho e poses estáveis. [102 testes distintos e gates, com falha intermediária documentada](audits/BV_RECUPERACAO_R3.md). Sem novo aceite físico R3 ou CI global verde.

> **GATE FÍSICO DIRIGIDO — 07/11/2026:** proprietário instalou APK pós-R2 no Moto G06 e confirmou melhora considerável de interação/lag do Canvas, arte de quatro categorias aprovada e reparo do Livro da Estrela funcional. Observação humana sem números de FPS, P95/P99, GPU/heap ou cobertura exaustiva de lifecycle/TalkBack/E2E React; CI global permanece FAIL nos shards E2E. [Handoff R3](audits/BV_RETOMADA_R3_2026-11-07.md).

## Saneamento pós-R2 — regressão focalizada (06/11/2026)

Livro da Estrela reproduzido na ordem real drive→update: base fica em 0,315 rad após 120 frames. Regressões cobrem convergência, abrir/fechar, duplo comando, reversões em transição, página/examinar, transporte/pouso/retorno, movimento reduzido e runtime pausado/retomado com seleção/highlight. UI sincroniza os dois menus; quatro navegações React e raycasts de troca preservam IDs. E2E R2 executado uma vez: timeout de 30 s antes da primeira seleção, sem alcançar reload/abertura e sem retry/timeout alterado. [Gates, falhas intermediárias, CI da base e roteiro físico](audits/BV_SANEAMENTO_POS_R2.md#gates-e-falhas). Capturas são do mundo integrado com dados fictícios, não teste Android.

## Recuperação R1 — regressões (06/11/2026)

Baseline F: 97 testes existentes PASS em seis arquivos, repetidos após a mudança; nove novos PASS validam trajetória golden da F, cache limitado/invalidação, ownership, raycasts reais, precedência e ausência de trabalho duplicado. Scripts dirigidos de CPU/picking ficam fora da CI e não impõem expectativas de tempo. [Comandos, resultados finais e falhas E2E discriminadas](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md). Sem timeout/retry/assert removido; sem PASS físico presumido.

## BF-5 — Atlas clássico projetado

19 unitários dirigidos em oito arquivos e cinco E2E distintos (três novos + duas regressões de treino) PASS. Cobertura: conjunto por gênero/preferência/fallback, seis artes locais, permanência e decodificação antes da dissolução, pausa/redução de movimento, viewport/visibilidade/cleanup, cancelamento e falhas sem loop; fórmulas MET e treinos preservados. Removidos testes do motor de poses aposentado; a regressão agora exige imagem raster carregada/dimensões, mantendo os asserts funcionais anteriores. [Resultados, falhas intermediárias e roteiro físico](BF-5_ATLAS_CLASSICO_PROJETADO.md). Sem CI global verde, retries/timeouts alterados ou teste físico presumido.

## BF-5 Parte 2F — verificação dirigida

214 testes aprovados na rodada ampliada (30 arquivos), dois do renderizador após corrigir mock e 75/75 na rodada final (10 arquivos, com sobreposição). Oito E2E distintos aprovados entre rodadas: quatro novos de Empreitadas/Atlas/avaliações/PNG e quatro de regressão (dois de treino, catálogo audiovisual e criação/edição dos seis tipos). Asserções cobrem revisão concorrente/rollback, referências, progresso/diário, upgrade/reabertura, restore v6 antigo/novo, sessões e projeção 3D preservadas, escolha voluntária de perfil, poses/pausa/movimento reduzido, estrelas nativas/teclado e PNG real nas três proporções. Contraste de Trabalho é verificado contra o papel; imagens/vídeo usam fixtures.

Gates de formatação/lint/tipos/áudio/build/performance/sync/APK aprovados. Falhas intermediárias novas e CI histórica da #29 explicitamente separadas no [relatório Parte 2F](BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md). Sem timeouts aumentados, omissão de asserts, CI global verde ou teste físico presumido.

# BF-5 Parte 2E — verificação proporcional (2026-11-04)

Controles DOM testados por toque/teclado, confirmação/cancelamento, FormData/reset/required e Back da superfície superior. Chromium verifica foco real/inert/top layer, datas e recuperação de foco persistido. Imagens têm upgrade v12→v13/reabertura, ownership, duplicatas, remoção/substituição/restore/exclusão isolada. Ateliê compara byte a byte prévia e download PNG, assinatura e dimensões 1080 × 1080/1350/1920, modos offline, capa, fundo e personalização. [Resultados finais, falhas intermediárias e roteiro físico](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md).

Suíte ampla local: 777 PASS/9 FAIL antes de adequar expectativas; oito de contrato corrigidas, timeout antigo da agência preservado e não repetido. Rodada dirigida 71 PASS/13 arquivos e posterior 9 PASS/3 arquivos, com sobreposição; seis E2E distintos aprovados entre rodadas e rodada final nova 2/2. Nenhuma alegação de CI global verde ou teste físico/TalkBack. Baseline remoto #28 FAIL (780 unitários PASS/1 expectativa antiga FAIL; E2E 30 PASS/27 FAIL), separado das regressões desta candidata.

## BF-5 Parte 2D — evidência dirigida

[Relatório e resultados](BF-5_PARTE2D_ENTRETENIMENTO.md): criação das seis combinações de formato/estrutura, legado, filtros/listas/datas civis, progresso/temporadas/diário, revisão concorrente, poster limitado/ownership, upgrade/reabertura e restore v6 antigo/novo. Playwright valida o PNG binário 1080 × 1350/1920 offline, fundos/mensagem/prévia e ergonomia web; mocks verificam Share/SAF/cancelamento/erro. Preservam-se regressões dos livros/estudo/treinos e seis projeções 3D. Nenhum resultado equivale a aceite físico/artístico, TalkBack ou CI global verde.

# Estratégia de testes

## BF-5R7 — desempenho e preservação

Regressões verificam pan sem reconstrução de projeção, diagnóstico sem atualização global de cena, resize idêntico sem `setSize`, cancelamento/liberação de feedback e pulsos de comandos rápidos independentes. Testes de falha de resize usam dimensão realmente nova, sem retirar asserts. E2E adicional cobre 120 registros fictícios e abertura de detalhes. Capturas antes/depois e limites da instrumentação headless estão no [relatório R7](BF-5R7_RELATORIO.md). Nenhum resultado substitui vibração percebida, teclado, TalkBack ou fluidez física.


## BF-5R5 — regressões proporcionais

Novos testes cobrem residência/pausa/retomada, fábrica assíncrona finalizada fora da rota, tentativa após falha, cadência diagnóstica e haptic com ausência/negação/movimento reduzido. Migração v8→v9 testa preservação de seis tipos e entidades relacionadas, reabertura e backup de fichas/execuções; aplicação verifica cópia imutável das execuções e validação estrita. E2E R5 cobre identidade/câmera/rotação e loops, ficha de força e série/citação sem minutos obrigatórios. Testes de lifecycle antigos passam a exigir um canvas oculto/pausado, em vez de nenhum canvas. Não são removidos asserts de interação ou contagem. [Resultados exatos](BF-5R5_RELATORIO.md).


## BF-5R4

Projeção: `sanctuaryCamera.test.ts` reproduz clipping no retrato afastado e verifica piso nos quatro cantos com zoom mínimo/normal/máximo em três proporções. Interação: regressões do runtime e E2E de arraste de um movimento em retrato/paisagem. Editores: suíte da área, recuperação após falha sem perder dados/prazo e E2E de criação/reabertura/edição dos seis tipos. [Resultados exatos, falhas e roteiro físico](BF-5R4_RELATORIO.md). Screenshots usam somente fixtures; nenhum PASS Android/TalkBack é inferido.

> **BF-4F1 fechada no escopo dirigido (2026-11-02):** os quatro modelos iniciais e a seleção canvas/React foram aceitos no Moto G06. F2, F3 e F4 seguem pendentes. [Relatório F1](BF-4F1_RELATORIO.md).

## Camadas

- Domínio: factories, transições e regras puras.
- Aplicação: casos de uso, concorrência, transações e erros públicos.
- Persistência: schemas, Dexie v8, upgrade v7→v8, reabertura e backup v6.
- React: shell, navegação, formulários, foco e estados acessíveis.
- E2E: fluxos convencionais e montagem/desmontagem segura do viewport técnico da Biblioteca.
- Runtime 3D: contratos de lifecycle, resize, ponte React ↔ Three e fallback; performance gráfica não é provada por mocks.
- Android: build técnico automatizado; instalação, toque, ergonomia e desempenho exigem evidência humana separada.

## Testes proporcionais, sem consumo exagerado de cota (2026-11-02)

**Aplicação ao replanejamento BF-5 (2026-11-03):** a [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md) aprova reforma global integrada de UI/UX seguida de refinamentos, **não checkpoints pequenos obrigatórios**. Isso altera a **forma de entregar a interface**, não os critérios de evidência: durante a macroreforma, empregar verificações internas pertinentes, revisão da integração e gate físico no Moto G06 para a entrega substancial; em refinamentos, testar regressões do que for alterado. A CI global continua informativa sobre falhas históricas e novas, sem fabricar PASS.

Inspecionar fontes relevantes, implementar diretamente no trabalho real, rodar testes **dirigidos ao escopo alterado** e uma rodada final proporcional. A suíte integrada roda na CI da PR; não repetir baterias globais ou ciclos de timeout sem novo diagnóstico. Investigar a causa antes de alterar; após até duas tentativas fundamentadas sem progresso, registrar o bloqueio e planejar triagem independente.

Não mascarar defeitos com skips, retries e timeouts artificiais. Falhas novas da CI devem ser rastreadas separadamente das antigas: os quatro testes novos F2 passaram localmente, mas falharam na CI integrada [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). Chromium/SwiftShader sob carga não equivale a desempenho Android. Gate físico e artístico não significa CI, TalkBack ou benchmark prolongado PASS. Ver [direção artística](ART_DIRECTION.md).

## BF-4A — Revisão documental e CI da candidata (2026-11-01)

A PR #7 contém somente mudanças de documentação; não houve implementação BF-4 nem novo teste Android físico. No commit inicial `057ca943`, a [CI 41330596100](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41330596100) aprovou `format:check`, lint, typecheck, 635 testes Vitest (78 arquivos), áudio, build e performance report; a suíte E2E concluiu **17 PASS e 1 FAIL** em `r4-shell.spec.ts` (timeout no `boundingBox` / `scrollIntoViewIfNeeded` do canvas, inclusive retry). Trata-se do cenário já rastreado na [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4); a causa permanece inconclusiva, sem PASS CI integral. Nenhuma remediação de runtime ou de E2E está incluída nesta PR documental.

## BF-3F/BF-3 — Evidência humana e fechamento dirigido (2026-11-01)

**Motorola Moto G06, APK debug atualizado pelo usuário.** A [issue #5](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/5) registra duas rodadas humanas: **5/5 PASS** na rodada 1 (três estantes e highlight, Próximo/Anterior, pan/pinch/zoom, retrato/paisagem e background/resume) e **6/6 PASS** na rodada 2 (seis categorias e registros, representações procedurais, seleção pelo canvas e React, abertura/edição/retorno e inspeção visual/fluidez). Total **11/11 procedimentos PASS** por relato humano; sem anomalias específicas reportadas. Captura do diagnóstico na rodada 2: runtime `running`, 12 selecionáveis, 100 meshes, 1.264 triângulos, ~60,0 FPS / 16,7 ms instantâneos e ~200,4 ms para o primeiro frame. Os números não constituem benchmark sustentado; o SHA incorporado ao APK não foi verificado. Isso não aprova todos os cenários, ângulos de oclusão, bounds finais ou TalkBack.

**Limite do gate automatizado:** a CI da `main` [41277733624](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41277733624) falhou com 17/18 E2E, no `r4-shell`. A mitigação experimental do PR #3 não comprovou estabilização e não foi integrada. A [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) permanece aberta. BF-3 foi encerrada por decisão explícita **apenas no escopo técnico-funcional e físico dirigido**, com exceção ao critério de CI estável; não declarar PASS E2E remoto ou beta/recorte real. Nenhuma nova suíte completa é afirmada nesta consolidação documental.

## BF-3E3/BF-3E — Gate técnico aprovado (2026-11-01)

A cobertura de projeção, página, host e runtime verifica consulta única, seis categorias, identidade, catálogo efetivo, seleção bidirecional, overflow, fallback, montagens isoladas, BF-2 e diagnóstico F5. O E2E `reading-area` comprova abertura, edição e retorno dos seis tipos no conjunto: o livro no cenário BF-2 já existente e os cinco demais tipos no cenário ampliado E3, com dados fictícios. `r4-shell` preserva picking, gestos e remontagens. Em `p1-memory`, o reload espera a apresentação observável da sessão pausada e continua verificando recuperação, favoritos, etiquetas e estatísticas. Cinco repetições locais dirigidas passaram sem retries; os logs antigos não comprovam que a corrida foi a única causa da falha remota.

Gate local e CI do PR #2 aprovados no commit `4aef4088df4944cedab2f80551dc52c5be379a25`, execução [41272609003](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41272609003): format:check, lint, typecheck, 78 arquivos/635 testes Vitest, audio:check, build, performance:report e 18 E2E. Auditoria independente da Luna: PASS técnico sem bloqueantes. Aviso de chunks acima de 500 kB permanece; relatório de tamanho de bundle não mede FPS, GPU, ergonomia, legibilidade nem comportamento físico Android. BF-3F e validação humana/assistiva continuam abertas.

## F1 — cobertura concluída

A F1 cobriu:

- criação e destruição do runtime;
- proteção contra mount duplicado;
- resize e atualização da câmera;
- seleção runtime → React;
- seleção React → runtime;
- Biblioteca monta e desmonta um único viewport;
- visitas repetidas não acumulam canvases;
- falha de inicialização do renderer apresenta fallback textual;
- lifecycle não acumula listeners, observers ou loops.

Testes unitários/mocks podem validar contrato e cleanup, mas não devem ser apresentados como prova de WebGL real, FPS ou estabilidade física.

### Evidência da F1-A

- unitários: criação, mount único, proteção contra remount da mesma instância, loop único, resize, desconexão de observer/listener, disposal idempotente, remoção do canvas e falha do renderer;
- React: uma fábrica/instância por host, mount/start/dispose e fallback sem retry;
- Playwright Chromium: canvas WebGL real único, remoção ao sair da rota, novo canvas único ao retornar e navegação convencional preservada.

Mocks da F1-A provam somente contrato e lifecycle. O smoke Chromium prova inicialização WebGL naquele ambiente, não compatibilidade Android ou desempenho.

### Evidência da F1-B

- GLB real aceito pelo `GLTFLoader` instalado;
- cena com 45 primitivas e um mesh GLB, loading, sucesso, erro e conclusão tardia;
- disposal deduplicado de geometrias, materiais e texturas;
- Chromium de produção confirmando fixture e métricas básicas sem fallback.

### Evidência da F1-C

- matemática pura de limiar tap/drag, distância, clamp, wheel, pinch e transformação de pan;
- catálogo técnico `{id, label}` com dez proxies e o fixture;
- seleção válida/inexistente, troca e limpeza de `Box3Helper`;
- picking por `Raycaster`, inclusive resolução de mesh filho do GLB para a raiz lógica;
- Pointer Events, pan sem seleção acidental, wheel, pinch sintético, `pointercancel`, pointer capture defensivo e remoção de listeners;
- React refletindo callback do runtime e enviando seleção pelo controle nativo então vigente, com foco preservado;
- Chromium desktop e viewport mobile cobrindo picking/tap, pan, wheel, pinch sintético, ponte nos dois sentidos, highlight observável e dock acessível.

O multi-touch do Chromium é sintético e valida o estado de Pointer Events, não a ergonomia ou o pinch físico. A repetição formal de dez ciclos foi executada na F1-D.

A validação automatizada repetiu dez ciclos Biblioteca → outra rota → Biblioteca. A repetição física de dez ciclos também foi executada no gate Android.

### Evidência da F1-D

- funções puras cobrem janela móvel de FPS/frame time, ausência de valor antes de dois frames e reset explícito ou por relógio regressivo;
- runtime cobre estados explícitos, start/pause/resume/dispose repetidos, um RAF pendente, callback tardio, reset da janela durante pausa e retomada limpa;
- `visibilitychange` sintético em jsdom cobre pausa, cancelamento de gesto/pointer capture, preservação da seleção e retomada da mesma montagem com um loop;
- resize cobre o mesmo renderer, canvas, câmera e seleção, recalculando o frustum; `ResizeObserver` é o caminho primário e `window.resize`, testado com remoção do listener, é fallback;
- disposal cobre RAF, observer, listeners de documento/canvas, gesto, highlight, geometrias, materiais, texturas, fixture tardio, renderer, canvas, seleção e assinaturas de diagnóstico;
- emissão diagnóstica durante o loop é limitada por teste determinístico a quatro vezes por segundo e transições relevantes emitem imediatamente;
- Playwright Chromium de produção executa dez ciclos Biblioteca → Coleção → Biblioteca, verificando em cada retorno um canvas, um loop e uma superfície diagnóstica; no fim, seleção, pan e um único incremento de wheel continuam funcionais, sem erro de página/console;
- Chromium real também verifica FPS/frame time positivos e valores reais de draw calls, triângulos, geometrias, texturas, malhas, selecionáveis, primeiro frame e GLB.

Playwright não reproduziu uma transição de visibilidade real de background de forma confiável; esse contrato ficou na camada de runtime com `document.hidden` controlado. Isso não equivale a background/resume Android físico.

### Evidência consolidada da F1-E

Em 2026-09-09, o checkout consolidado passou:

- `npm run format` e `npm run format:check`, sem reescrita;
- `npm run lint` e `npm run typecheck`, sem erro ou warning próprio;
- `npm run test:run`: 63 arquivos e 443 testes aprovados;
- `npm run audio:check`: os dois WAVs declarados foram verificados deterministicamente;
- `npm run build` e `npm run performance:report`: build Vite 8.1.5 de produção com 222 módulos;
- `npm run test:e2e`: 12 testes Chromium aprovados em 32,7 s, sem retry e sem flake observado; o fluxo de busca/Arquivo passou na primeira execução;
- `npm run android:sync` e `npm run android:build:debug`: sync Capacitor e Gradle debug aprovados;
- `git diff --check`: aprovado.

Os warnings observados foram o limite já conhecido de chunks Vite acima de 500 kB, a mensagem de ambiente `NO_COLOR`/`FORCE_COLOR` do runner Playwright e os avisos Gradle preexistentes sobre `flatDir`. Nenhum deles bloqueou o gate. O E2E continua sendo prova Chromium; background/resume, toque, pinch, desempenho, temperatura, ergonomia e TalkBack no Moto G06 permanecem humanos.

Observação separada: `npm audit --omit=dev` continua relatando duas ocorrências de severidade alta associadas ao `react-router@7.18.1`, transitivo de `react-router-dom@7.18.1`, no advisory GHSA-qwww-vcr4-c8h2. A versão já existia antes da F1; nenhuma atualização ampla ou correção automática foi feita na F1-E.

### Evidência da F1-F-FIX

A primeira validação humana no Moto G06 confirmou a cena e as interações principais, mas encontrou comportamento físico incompatível no `<select>` da alternativa React: a ativação abriu uma superfície branca vazia sem opções utilizáveis. O app e o runtime permaneceram ativos e o Back retornou normalmente. O controle foi removido, sem tentativa de diagnosticar internamente o WebView, e substituído por botões HTML nativos `Anterior`/`Próximo`.

- testes React cobrem Próximo/Anterior sem seleção, avanço/retorno, wrap nas duas extremidades, seleção Three seguida de navegação React, chamadas a `selectObject`, texto e foco;
- E2E Chromium cobre picking → texto, Próximo/Anterior → highlight, wrap, saída/retorno, remoção completa do combobox e viewport mobile sem overflow horizontal;
- pan, wheel, pinch, lifecycle, cena e runtime Three permanecem nos testes existentes e não foram modificados;
- regressão final: 63 arquivos/446 testes Vitest e 12 E2E Chromium aprovados;
- a primeira execução E2E após a troca expôs coordenadas de pan obsoletas depois do auto-scroll dos novos botões; o teste passou a trazer o canvas de volta à viewport e recalcular sua caixa, e a suíte integral seguinte passou sem retry.

Essa cobertura não substituiu a revalidação física curta do novo APK nem aprovou TalkBack.

### Evidência humana consolidada da F1-F

No Moto G06, o gate humano da F1 foi concluído com:

- abertura do APK e renderização da cena, GLB, pan, pinch físico, picking, highlight e ponte React ↔ Three;
- revalidação dos botões `Anterior`/`Próximo` da F1-F-FIX nos dois sentidos;
- dez ciclos físicos `Biblioteca → outra rota → Biblioteca`, complementando os dez ciclos automatizados, sem degradação progressiva ou duplicação observável;
- background/resume funcional enquanto o processo permaneceu vivo;
- recuperação limpa após process death provocado pelo Android sob pressão de memória;
- aproximadamente 60 FPS após estabilização na cena mínima, sem crash ou artefato relevante;
- teste curto sem comportamento térmico anormal perceptível.

O breve quadro preto antes da reconstrução da cena e a janela de FPS inicialmente baixa foram observados, sem evidência de defeito estrutural ou desempenho sustentado baixo. TalkBack completo não foi executado e permanece pendente para F6 ou outro gate humano específico.

## F2-D1 — falhas terminais de execução

- doubles determinísticos cobrem exceção de `renderer.render()` dentro do RAF, sem RAF posterior, com canvas/recursos liberados e uma única falha pública `unavailable`;
- o mesmo caminho terminal cobre `setSize()` no resize e render solicitado por seleção fora do RAF; `start`, `resume`, `pause`, `resize`, seleção e `dispose()` após a falha não revivem a instância nem repetem cleanup ou notificação;
- pausa cobre resize e conclusão do fixture sem frame incidental, seguida de retomada normal; erro de carregamento do GLB continua degradado/recuperável e conclusão tardia após falha descarta o modelo;
- `WorldHost` cobre uma falha síncrona emitida por `start()` sem anunciar a experiência como pronta.

## F2-D2 — context loss terminal e assíncrono em voo

- doubles determinísticos disparam `webglcontextlost` durante execução e comprovam `preventDefault`, estado `failed`, uma falha pública `unavailable`, cancelamento do RAF e gesto, remoção de canvas/listeners e cleanup único;
- `webglcontextrestored` tardio, visibility, `start`, `pause`, `resume`, resize, seleção e `dispose()` depois da perda não agendam RAF, renderizam ou revivem a instância;
- conclusão tardia do fixture GLB após context loss libera o modelo sem alterar o estado terminal; o teste de erro normal do fixture continua provando degradação recuperável sem falha pública.

Esses doubles provam a política terminal e seus invariantes no runtime; não constituem reprodução física de perda de contexto WebGL em aparelho.

## F2-E — viewport e input resistentes a interrupções

- doubles do runtime cobrem `0×0`, viewport válido posterior pelo `ResizeObserver`, preservação do mesmo canvas/renderer e um único RAF; dimensão inválida não chama `setSize()` ou `render()`, nem torna o runtime terminal, e callback tardio do observer depois de `dispose()` é inerte;
- resize com mudança forte de aspect ratio preserva câmera, montagem e seleção; picking posterior usa a bounding box atual do canvas, não coordenadas anteriores;
- Pointer Events cobrem `pointercancel`, `lostpointercapture` com capture/release indisponíveis, pausa durante pan e início limpo após resume; pinch para um pointer muda para pan sem origem antiga ou seleção no encerramento, e pointer adicional além dos dois não entra no gesto;
- terminalidade durante gesto continua coberta pelo context loss: o input é removido/cancelado, `pointerup` tardio não emite seleção nem renderiza;
- gate unitário: `ThreeWorldRuntime.test.ts` (24 testes) e `npm run typecheck` aprovados; `git diff --check` aprovado;
- gate browser dirigido: `npm run build` foi necessário para preview; passaram em Chromium os cenários de montagem, desktop (picking/pan/wheel), viewport mobile sintético (tap/pan/pinch) e dez ciclos Biblioteca → Coleção → Biblioteca, sem acumular canvas ou loop. Os warnings conhecidos de chunk Vite acima de 500 kB e `NO_COLOR`/`FORCE_COLOR` não bloquearam a prova.

## F2-F — regressão consolidada e fechamento técnico

Em 2026-09-09, o checkout consolidado passou sem correções de comportamento durante o checkpoint:

- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram; o formatter alterou somente uma quebra de linha em teste, inspecionada como formatação;
- `npm run test:run`: 63 arquivos e 459 testes Vitest aprovados, sem falha ou reexecução;
- `npm run audio:check`: os dois WAVs declarados foram verificados deterministicamente;
- `npm run build` e `npm run performance:report`: build Vite 8.1.5 com 222 módulos, fixture GLB e chunk Three dinâmico preservados;
- `npm run test:e2e`: 12 cenários Chromium aprovados; a suíte cobriu fluxos convencionais, uma superfície Three, mount/unmount, saída/retorno, picking, ponte React ↔ Three, pan, wheel, pinch sintético, fallback, viewport mobile e dez ciclos vigentes;
- `npm run android:sync` e `npm run android:build:debug`: sync Capacitor e `assembleDebug` aprovados, com APK debug gerado;
- `git diff --check` passou.

Os únicos warnings observados foram os já conhecidos: chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` no runner Playwright e `flatDir` no Gradle. A E2E continua sendo prova Chromium; não comprova toque, pinch, background/resume, desempenho, temperatura, instalação ou orientação física no Moto G06.

## Evidência humana da F2 — revalidação física curta no Moto G06

Após os gates automatizados da F2-F, uma validação humana curta e dirigida no Moto G06 confirmou que background/resume, alinhamento do canvas com a interface React, seleção e highlight, pan, pinch, seleção por toque, botões React sincronizados e rotação/orientação permaneceram funcionais. Não houve crash, travamento, degradação sustentada, perda de interação, dessincronização React ↔ Three nem evidência de regressão funcional associada à F2.

Durante a rotação/orientação, houve queda transitória de aproximadamente 37–45 FPS, com recuperação e estabilização em aproximadamente 60 FPS. Na sequência extrema de zoom-out até o máximo e zoom-in até o máximo, houve queda transitória de aproximadamente 45–48 FPS, também seguida de recuperação e estabilização em aproximadamente 60 FPS. São observações humanas não bloqueantes, não benchmark formal e não regressão comprovada.

Playwright e os demais gates automatizados não provaram esse comportamento físico. A validação humana complementa o gate técnico da F2; foi curta e dirigida, não aprova temperatura prolongada, TalkBack, densidade real da Biblioteca, performance do mundo final ou budget artístico.

## F3-A — contrato e baseline da câmera

- `cameraMath.test.ts` cobre o frustum ortográfico de referência da fixture F1 para viewport horizontal, de referência e vertical, além de rejeitar zero, negativo, `NaN`, infinito e overflow sem fabricar estado de câmera;
- `ThreeWorldRuntime.test.ts` confirma a posição, zoom, planos near/far e frustum inicial da câmera, preservando os testes de resize, viewport transitório, picking por bounding box atual, pan, wheel, pinch e cancelamento;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 34 testes. Não houve E2E, build, Android ou teste físico neste checkpoint.

## F3-B — modelo de câmera, framing e limites

- `cameraMath.test.ts` cobre framing com padding em portrait/landscape, zoom mínimo/máximo, target lógico no plano X/Z, bounds que variam com viewport/zoom, clamp, resize válido, entradas não finitas e viewport/overflow inválidos;
- `ThreeWorldRuntime.test.ts` cobre framing inicial, preservação de target/zoom/seleção após orientação válida e a garantia de que a conclusão do GLB não reposiciona nem reenquadra a câmera;
- a suíte preserva os testes F2 de viewport transitório, mesma montagem/canvas, seleção, picking pela bounding box atual, cancelamento, pinch → pan, pausa e terminalidade;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 40 testes; `npm run typecheck`, `npm run format:check` e `git diff --check` passaram. Não houve E2E, build, Android ou teste físico neste checkpoint.

## F3-C — pan, zoom e pinch

- `cameraMath.test.ts` cobre pan derivado de pontos de tela em landscape/portrait e nos extremos de zoom, clamp no plano X/Z, zoom focal no centro, fora dele e próximo da borda, zoom-in/out, mínimos/máximos e a autoridade final dos bounds quando a âncora não pode permanecer exata;
- `interactionMath.test.ts` cobre normalização de `WheelEvent.deltaMode`, curva exponencial de wheel e composição da razão de pinch sem depender da quantidade de eventos;
- `ThreeWorldRuntime.test.ts` cobre wheel ancorado no bounding rect atual, midpoint de pinch em movimento com pan+zoom, pinch → pan e os contratos preexistentes de pointer adicional, cancelamento, pausa, terminalidade, seleção, picking e resize;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 52 testes; `npm run typecheck`, `npm run format:check` e `git diff --check` passaram. Não houve E2E dirigido, build, Android ou teste físico neste checkpoint.

## F3-D — tap, seleção e arbitragem de gestos

- `interactionMath.test.ts` fixa o threshold centralizado em `8` CSS px e sua borda inclusiva (`<=`); `ThreeWorldRuntime.test.ts` cobre tap sem movimento, jitter, borda, ultrapassagem com retorno, slop sem salto, tap após pan e wheel, espaço vazio, segundo/terceiro pointer, pinch imóvel, wheel concorrente, `pointercancel`, `lostpointercapture`, pausa e `pointerup` tardio terminal;
- `cameraMath.test.ts` preserva a matemática de framing/bounds/F3-C e `WorldHost.test.tsx` preserva os botões React `Anterior`/`Próximo`, wrap e a ponte bidirecional;
- gate focado: `npm run test:run -- src/features/library/three/interactionMath.test.ts src/features/library/three/cameraMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts src/features/library/WorldHost.test.tsx` aprovou 4 arquivos e 65 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` passaram;
- E2E dirigido: `npm run test:e2e -- e2e/r4-shell.spec.ts` aprovou 5 cenários Chromium da Biblioteca, incluindo tap → seleção, drag → nenhuma seleção, pinch sintético → nenhuma seleção e controles React. Não houve E2E integral, build, Android ou teste físico; o aviso conhecido `NO_COLOR`/`FORCE_COLOR` do runner não bloqueou.

## F3-E — viewport, orientação, safe areas e integração mobile

- `ThreeWorldRuntime.test.ts` cobre portrait → landscape durante candidatura de tap: a mesma montagem mantém seleção, encerra o gesto e o `pointerup` antigo não faz picking; um gesto posterior seleciona pela geometria nova. Os testes preexistentes preservam canvas/renderer/câmera únicos, clamp, viewport inválido e bounding rect atual;
- o gate focado `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts src/features/library/WorldHost.test.tsx src/pages.test.tsx` aprovou 5 arquivos e 67 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` passaram;
- `npm run build` foi executado para o preview E2E; o warning conhecido de chunks acima de 500 kB permaneceu sem bloquear;
- E2E dirigido: `npm run test:e2e -- e2e/r4-shell.spec.ts` aprovou 6 cenários Chromium. A sequência acrescentada cobre 390×844 → 844×390 → 390×844, uma seleção/picking após a mudança, a identidade do mesmo canvas/runtime, zoom preservado, controles/dock e ausência de overflow; também cobre 320×640. O aviso conhecido `NO_COLOR`/`FORCE_COLOR` não bloqueou;
- Chromium não prova safe areas ou system bars físicos, rotação física, toque/pinch físico, ergonomia, TalkBack, FPS Android ou temperatura. A validação humana ampla posterior fechou o escopo F3; performance aprofundada e acessibilidade permanecem para F5/F6.

## F3-F1 — gate técnico consolidado + APK

- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram; o formatter não alterou arquivos;
- `npm run test:run`: 64 arquivos e 487 testes Vitest aprovados;
- `npm run audio:check` verificou deterministicamente os dois WAVs declarados;
- `npm run build` e `npm run performance:report` passaram com 224 módulos; o entrypoint inicial permaneceu em 628.314 bytes e o chunk dinâmico `ThreeWorldRuntime` ficou em 629.884 bytes;
- `npm run test:e2e` aprovou 13 cenários Chromium em 37,2 s. A repetição precisou forçar o servidor local pelo modo CI porque o modo interativo tentou reutilizar portas já encerradas; os mesmos 13 cenários passaram, sem retry funcional;
- `npm run android:sync` e `npm run android:build:debug` passaram; `assembleDebug` gerou `android/app/build/outputs/apk/debug/app-debug.apk` com 7.525.817 bytes;
- `git diff --check` passou. Os warnings conhecidos permaneceram: chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` no Playwright e `flatDir` no Gradle.

Este gate confirma a regressão automatizada e o empacotamento. A validação humana ampla posterior fechou o escopo de câmera/interação da F3; performance aprofundada e TalkBack permanecem para F5/F6.

## F3-F2-FIX — limites diagonais da fixture

- `cameraMath.test.ts` força os quatro cantos por pan para os extremos e mede a interseção entre viewport e a projeção convexa do piso técnico; ela é sempre ao menos o patch mínimo explícito, com largura e altura de 15% dos spans projetados do piso, limitadas somente pela viewport disponível;
- os casos cobrem portrait em zoom mínimo (`0.7`), normal (`1`) e máximo (`2.2`), além de landscape em zoom mínimo e máximo; as rotas de `CameraNavigation`, interação, lifecycle e renderer permanecem cobertas pelos testes preexistentes;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 61 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` foram executados neste checkpoint;
- `npm run build`, `npm run android:sync` e `npm run android:build:debug` passaram; o APK debug foi atualizado em `android/app/build/outputs/apk/debug/app-debug.apk` com 7.525.817 bytes. Permaneceram os warnings conhecidos de chunks Vite acima de 500 kB e `flatDir` do Gradle;
- não houve E2E adicional: não existe uma asserção Chromium simples que meça a área de geometria WebGL sem reintroduzir coordenadas de screenshot; a garantia é coberta na matemática pura.

## F3-CLOSE — fechamento de câmera e interação mobile

- F3-F1 consolidou 64 arquivos/487 testes Vitest, 13 cenários E2E Chromium, `format`, `format:check`, `lint`, `typecheck`, `audio:check`, build, relatório de performance, sync Capacitor e debug build Android; warnings conhecidos não bloquearam o gate;
- a validação humana ampla no Moto G06 foi positiva: app abriu normalmente, framing inicial, pan, tap/seleção, pinch, pinch → um pointer → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume permaneceram funcionais, sem crash, travamento ou regressão perceptível; o FPS ficou aproximadamente em 60 ou próximo durante interação e rotação;
- a correção posterior dos bounds passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync e debug build Android, com novo APK;
- **o fix final dos bounds não recebeu revalidação física específica no Moto G06.** A ausência foi aceita como risco residual não bloqueante: a evidência humana ampla da F3 já era positiva, a falha era localizada, a correção matemática tem regressão dirigida, os contratos de câmera/input/lifecycle/renderer não mudaram e a fixture é descartável. Não é evidência física inexistente.

## F4-C — materiais, UV e texturas

- `f4cMaterialContract.test.ts` usa os quatro GLBs F4-B reais, confere seus SHA-256 registrados e faz `parseAsync()` com o `GLTFLoader` de `three@0.185.1` instalado;
- KayKit prova `MeshStandardMaterial`, `map`, UV, Base Color branco multiplicador, roughness `0,5` e metalness `0`;
- Kenney prova material por fatores sem maps, UV presente mas não necessário ao material, Base Color numérico, roughness `1` e metalness `0`, sem inferir comportamento da lista global `extensionsUsed`;
- Poly Haven prova UV, `map`, `normalMap`, `metalnessMap` e `roughnessMap`, incluindo a identidade do mesmo objeto `Texture` para metallic e roughness combinados;
- Quaternius prova material por fatores sem maps nem UV, Base Color numérico, roughness `0,5` e metalness `0`;
- o adaptador jsdom só permite concluir o parse e observar criação/referência estrutural dos maps de imagens embutidas; ele não prova fidelidade visual, equivalência pixel a pixel, orientação visual de UV/textura, colorimetria percebida, qualidade EXR → PNG, performance, custo, loading/unload ou Android;
- no gate humano C5, o usuário orbitou, aproximou e afastou os quatro espécimes no harness Three temporário: Poly Haven exibiu Base Color, UV, normal e metallic/roughness plausíveis, sem fallback ou discrepância perceptível; KayKit exibiu Base Color texture e UV corretos sem artefato; Kenney exibiu material simples normal; e Quaternius apareceu claro/cinza de modo coerente com seus fatores, não como textura ausente;
- não houve comparação pixel a pixel, medição colorimétrica nem comparação humana com Blender para Quaternius. O harness foi removido após esse gate e não se tornou página, rota ou ferramenta permanente.

## F4-D2 — load, attach e unload com host vivo

- `f4dAssetLifecycle.test.ts` lê o GLB KayKit F4-B real, confere o SHA-256 registrado e usa `GLTFLoader.parseAsync()` do `three@0.185.1` instalado; o adaptador jsdom permite somente o parse estrutural da imagem embutida;
- um owner experimental local ao teste aceita a root em `THREE.Scene` real e chama o `disposeObjectTree()` real ao unload; listeners `dispose` nos recursos KayKit confirmam geometry, material e texture usados uma vez no primeiro ciclo;
- um `Group` sentinela confirma que o unload remove somente a root alvo: a mesma `Scene`, o sentinel e a possibilidade de carregar/anexar nova root real permanecem após o unload;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 4 testes. Não prova idempotência repetida, A/B simultâneos, isolamento entre assets, callbacks/erros tardios, cancelamento lógico, cache, manager, renderer, performance ou Android.

## F4-D3 — repetição, isolamento e disposal

- `f4dAssetLifecycle.test.ts` mantém o owner somente como mecanismo local de prova e exercita `GLTFLoader.parseAsync()` real com KayKit, Poly Haven e Kenney F4-B, após conferir os SHA-256 registrados;
- um caso KayKit comprova que o segundo unload é inerte: os eventos reais de `dispose` de geometry, material e texture permanecem em um, e host/sentinel ficam intactos;
- três ciclos KayKit comprovam roots, geometries, materiais e textures distintos por parse, liberação única por conjunto e ausência de acúmulo de roots de asset, com o mesmo host e sentinel durante toda a sequência;
- dois owners independentes anexam Poly Haven e Kenney à mesma `Scene`; o unload seletivo de Poly Haven libera seus recursos sem remover Kenney nem disparar seus eventos de disposal, e o unload posterior de Kenney encerra seu próprio cleanup;
- no Poly Haven, Base Color, normal e a `Texture` única compartilhada por metallic/roughness são observadas por eventos reais de `dispose`; a texture compartilhada recebe um único evento. `referenceScene.test.ts` preserva a cobertura complementar da deduplicação geral de geometry/material/texture compartilhados dentro de uma árvore;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 7 testes. Ainda não prova operação em voo, abandono, callbacks ou erros tardios, cancelamento lógico, abort físico, cache, preload, registry, sharing entre assets, referência contada, renderer, performance ou Android.

## F4-D4 — assíncrono em voo, abandono, callbacks tardios e erros

- `f4dAssetLifecycle.test.ts` usa Quaternius F4-B real, com SHA-256 conferido e `GLTFLoader.parseAsync()` do `three@0.185.1`, para fornecer roots concretas ao harness;
- um double assíncrono exclusivo do teste retém callbacks e entrega sucesso/erro na ordem escolhida. Ele testa somente a política experimental de aceitação; D2/D3 continuam sendo a evidência de parse/load real, attach e unload com `GLTFLoader`;
- os cinco casos D4 comprovam abandono lógico antes de sucesso, transferência única com segundo sucesso rejeitado, erro individual recuperável com nova tentativa manual, erro tardio inerte e owner encerrado que rejeita sucesso posterior;
- listeners reais de `dispose` em geometry/material Quaternius comprovam liberação única dos resultados tardios ou adicionais rejeitados; root aceita permanece sem disposal até o unload normal, e host/sentinel não são ressuscitados nem destruídos;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 12 testes. Não prova abort físico, cancelamento de rede, cache, retry automático, preload, registry, sharing interasset, referência contada, renderer, performance, Android ou arquitetura final de loading.

## F4-D5 — regressão, consolidação e fechamento

- o gate dirigido `npm run test:run -- f4bAssetAxisGate f4cMaterialContract f4dAssetLifecycle referenceScene` reuniu geometria/eixos, materiais, lifecycle experimental e helper de disposal: 4 arquivos e 20 testes aprovados;
- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram. O lint exigiu somente tipagem segura nos adaptadores jsdom e guards locais de `Mesh` dos testes F4-B/C/D; parsing, fixtures, runtime e produção não mudaram;
- a suíte unitária integral `npm run test:run` aprovou 67 arquivos e 510 testes, sem retries ou falhas;
- o fechamento preserva a separação de evidência: D2/D3 provam `GLTFLoader` real, enquanto D4 usa double apenas para ordenar callbacks de roots reais. Não prova abort físico/rede, cache, retry automático, preload, registry, sharing interasset, referência contada, renderer, performance, Android ou arquitetura final de loading.

## F4-E1/E2 — baseline estrutural de custo e diagnóstico

- a medição leu os bytes dos quatro GLBs F4-B diretamente, verificou GLB 2.0/chunks e recalculou SHA-256 antes de qualquer interpretação; hashes, nomes e tamanhos coincidiram com `ASSET_REGISTRY.md`;
- o parser local temporário extraiu JSON/BIN, nodes/meshes/primitives/accessors, atributos, índices, materiais, referências texture→image, bytes/dimensões/MIME de PNG/JPEG, extensões e componentes adicionais. Ele foi removido ao fim do diagnóstico; não houve código de produção, alteração de fixture ou dependência nova;
- medidas exatas (estrutura e bytes), derivadas (triângulos e bytes lógicos de accessor) e estimativas foram separadas em `ASSET_PIPELINE.md`. A estimativa de imagem é somente `width × height × 4` para RGBA8 no nível base, sem mipmaps e sem alegar memória GPU/heap/RAM;
- a inspeção local de `three@0.185.1` confirmou a presença de `DRACOLoader`, `KTX2Loader`, decoder meshopt e hooks do `GLTFLoader`, mas nenhuma técnica foi configurada, implementada ou testada em runtime;
- F4-E1/E2 não executou benchmark de renderer, FPS, frame time, Android, Moto G06, GPU, VRAM, heap, temperatura, bateria ou fidelidade visual de variante. A evidência principal e a hipótese experimental selecionada estão em `ASSET_PIPELINE.md`.

## F4-E3/E4 — variante de textura e comparação objetiva

- um teste temporário leu o original e a variante laboratorial Poly Haven pelo `GLTFLoader` de `three@0.185.1`, confirmou SHA do original, parse, UV, maps PBR e a mesma `Texture` para metallic/roughness;
- `POSITION`, `NORMAL`, `TEXCOORD_0` e índices foram comparados byte a byte; hierarchy, transforms, accessors, material, samplers, extensões e bounding box permaneceram equivalentes. As três imagens mantiveram MIME/ordem e passaram de 1024×1024 para 512×512;
- o comparador A/B temporário usou um renderer, câmera, iluminação e controles comuns, alternando somente original/variante. O gate humano foi **PASS**: observou leve desfoque em comparação próxima, considerado irrelevante para objetos menores e mais distantes na composição ortográfica/2.5D; não houve perda bloqueante de identidade visual, material ou leitura geral;
- o teste, harness e cópia untracked servida por Vite foram removidos após o gate. Não houve mudança no fixture registrado, produção, runtime, dependência, extensão glTF, decoder ou benchmark físico.

## F4-E5 — consolidação e fechamento

- a auditoria de fechamento preservou a evidência E1–E4: baseline estrutural dos quatro GLBs, diagnóstico de Poly Haven como outlier de textura, variante 512 isolada, comparação de accessors/material/loader e gate humano A/B; a autoridade detalhada é `ASSET_PIPELINE.md`;
- `f4eTextureVariant.test.ts` e o comparador visual foram instrumentos temporários de E3/E4 e já foram removidos; não são cobertura permanente da aplicação. A variante continua apenas no laboratório externo, fora do checkout e do registry;
- o gate humano final foi **PASS** com leve desfoque percebido em comparação próxima, aceito como não bloqueante para objetos menores e mais distantes na apresentação ortográfica/2.5D. Não representa prova de equivalência pixel a pixel, FPS, frame time, RAM, GPU, Android ou performance física;
- o fechamento E5 aprovou `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck`; o gate dirigido F4-B/C/D + `referenceScene` aprovou 4 arquivos e 20 testes, e a suíte unitária integral aprovou 67 arquivos e 510 testes, sem retries ou falhas. Não foram executados E2E, build, Android ou benchmark físico porque não houve mudança de produção, runtime ou fixture.

## F4-F — consolidação final e handoff

- testes permanentes de contrato: `f4bAssetAxisGate.test.ts` confere hash, parse pelo `GLTFLoader`, root/transforms/bounds do corpus; `f4cMaterialContract.test.ts` confere semântica material/UV; `f4dAssetLifecycle.test.ts` prova ownership, unload, disposal e callbacks adversos exclusivamente em harness; `referenceScene.test.ts` preserva a fixture F1 e a deduplicação intrárvore de `disposeObjectTree()`;
- eles são rápidos e determinísticos, leem somente fixtures versionados no checkout e não dependem de `../bv-f4-lab/`, da variante Poly Haven 512 ou de arquitetura produtiva especulativa;
- provas temporárias removidas: harness visual F4-C, `f4eTextureVariant.test.ts`, comparador/harness F4-E e cópia Vite da variante 512;
- evidência humana preservada fora dos testes automatizados: preflight Blender, gate visual F4-C e gate A/B E3/E4. Nenhuma deles equivale a performance física, Android físico ou fidelidade universal.
- gate de fechamento: `format`, `format:check`, `lint` e `typecheck` passaram; o gate dirigido aprovou 4 arquivos/20 testes, a suíte integral 67 arquivos/510 testes, sem retries ou falhas, e `npm run build` passou. O aviso conhecido de chunks Vite acima de 500 kB não bloqueou; não foram executados Android, E2E, relatório de performance ou F5.

## F5-A — baseline e cenários de carga

- `performanceScenarios.test.ts` fixa os três IDs, a escada de 1/5/17 GLBs, o uso exclusivo do fixture F1 e dos quatro fixtures F4 registrados e as posições determinísticas do cenário de stress;
- `ThreeWorldRuntime.test.ts` cobre o carregamento agregado do corpus, metadados de progresso e liberação de todas as roots ao disposal da montagem; o contrato existente de lifecycle continua coberto;
- `PerformanceScenarioHarness.test.tsx` confirma que os três cenários são escolhidos por botões DOM, sem `combobox`, e que `aria-pressed` e o texto ativo acompanham a mesma configuração entregue ao `WorldHost`;
- não há teste de FPS em CI. A verificação local de Chromium serve apenas para confirmar o harness e a composição; medição, stress, loading percebido, temperatura e limites físicos pertencem à F5-B no Moto G06.

## F5-B — instrumentos e gates físicos

- `sceneTextureMetrics.test.ts` fixa a contagem estrutural de referências de textura e instâncias únicas em materiais Three; ela não mede recursos WebGL ou memória;
- `securityPolicy.test.ts` fixa a permissão explícita de `blob:` em `connect-src`, necessária ao `GLTFLoader` para resolver imagens embutidas dos GLBs no WebView Android sem abrir origem remota;
- o gate dirigido aprovou 5 arquivos/45 testes: CSP, métricas de textura, runtime, `WorldHost`, cenários e harness. `format:check`, `lint`, `typecheck`, build diagnóstico, sync Capacitor, `assembleDebug` e `git diff --check` passaram; o warning conhecido de chunks Vite acima de 500 kB e os avisos Gradle `flatDir` não bloquearam;
- FPS, frame pacing, `dumpsys meminfo`, estado térmico, loading percebido, pan, pinch, picking, orientação, background/resume e aquecimento foram coletados no Moto G06 por instrumentação local/ADB e confirmação humana. Não há teste CI que possa substituí-los.

## F5-C — regressão final e isolamento do diagnóstico

- o gate dirigido F5 aprovou 5 arquivos/45 testes; a regressão unitária ampla aprovou 70 arquivos/516 testes, sem retry ou falha;
- `format:check`, lint e typecheck passaram. O build normal e o diagnóstico passaram; a inspeção do `dist` normal confirmou ausência de `PerformanceScenarioHarness` e dos quatro GLBs F4, enquanto o build diagnóstico emite o harness e o corpus somente sob `VITE_ENABLE_DIAGNOSTICS=true`;
- `android:build:diagnostics` passou localmente com sync Capacitor e `assembleDebug`, sem aparelho conectado. Permaneceram somente os warnings conhecidos de chunks Vite acima de 500 kB e `flatDir` Gradle;
- F5-C não alterou runtime, assets, loading, lifecycle, Android ou o harness e não fez ADB, instalação ou validação física. A regressão não transforma o envelope F5-B em hard budget nem substitui nova medição no Moto G06 quando conteúdo real exceder materialmente o corpus.

## F6-B — evidência automatizada e regressão técnica

- a matriz F6-A encontrou uma única lacuna automatizável: `WorldHost.test.tsx` não provava explicitamente tabulação/ativação nativa nem os marcos semânticos do host; o teste agora cobre `role="status"`, host/canvas semanticamente oculto, `role="alert"`, `aria-live="polite"`, foco em `Anterior` antes do canvas e ativação por Space/Enter;
- gate dirigido: `npm run test:run -- src/features/library/WorldHost.test.tsx` aprovou 1 arquivo/11 testes; não houve mudança de produção;
- regressão consolidada: `format:check`, lint, typecheck, Vitest (70 arquivos/517 testes), `audio:check`, build, `performance:report`, E2E (13 testes), sync Capacitor e debug build Android passaram;
- essa evidência não aprova TalkBack, leitura/anúncios ou foco percebidos, ergonomia, contraste, tamanho de texto Android, áudio percebido ou qualquer validação física de F6-C.

## F6-C — fechamento documental e dívida humana

- F6-C não executou teste, APK, instalação, ADB ou validação física; apenas reconciliou a evidência F6-A/F6-B;
- os gates técnicos já aprovados permanecem: 70 arquivos/517 testes Vitest, 13 E2E, `format:check`, lint, typecheck, `audio:check`, build, `performance:report`, sync e debug build Android;
- automação não substitui TalkBack ou percepção humana. O gate assistivo obrigatório deve usar o build atual e representativo do primeiro recorte real antes de seu fechamento e antes de beta/release aplicável.

## BF-2 — primeira área de leitura funcional (evidência consolidada)

- BF-2A/B: `readingAreaBooks.test.ts`, `proceduralContent.test.ts` e `readingAreaBookLayout.test.ts` cobrem projeção neutra e ordenação por `createdAt`/`id`, identidade `entryId`/`instanceId`, duplicidade, variantes procedurais, slots derivados das estantes, limites geométricos e overflow ordenado. O ajuste BF-2D-BOOK-VIS-FIX deixou os quatro volumes dentro do envelope máximo de 0,225 × 0,400 × 0,360 m e reduziu a capacidade inicial para 70 (24 + 25 + 21), sem estabelecer teto universal;
- BF-2C/D: `ThreeWorldRuntime.test.ts`, `WorldHost.test.tsx` e `pages.test.tsx` cobrem snapshot neutro, ownership/relayout, seleção bidirecional e highlight, lista React de livros visíveis e excedentes, carregamento/vazio/erro/fallback, abertura pelo `entryId`, isolamento F5 e ausência de remount por seleção;
- BF-2E: `pages.test.tsx` cobre também a troca de instância de `application` sem vazamento de snapshot, erro, catálogo ou seleção. `e2e/reading-area.spec.ts` executa cenários de vazio real, criação e leitura de livros convencionais, seleção React → runtime e navegação pelos controles, abertura/edição/retorno, overflow com 71 livros (70 representados + 1 excedente) e três ciclos de saída/retorno com canvas único;
- o seed de 70 livros é exclusivo do contexto Playwright descartável servido em `127.0.0.1:4173`; o reuso de servidor Playwright é opt-in. A BF-2E registrou gate técnico web e APK debug funcional, e a CI do commit de fechamento BF-2-FINAL (`2e71264`) passou `npm ci`, `format:check`, lint, typecheck, Vitest, `audio:check`, build, `performance:report` e E2E. Isso não prova instalação nem desempenho Android;
- a validação humana dirigida no Moto G06 foi positiva para livros reais, seleção alternada por canvas e React, abertura/edição/retorno, pan, pinch, zoom, rotação e background/resume, sem travamentos ou quedas de FPS percebidos. É evidência qualitativa do recorte atual, não benchmark, garantia do mundo futuro, aprovação de arte final ou PASS TalkBack. A validação assistiva humana continua obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável.

## Comandos

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
```

Dados e backup exigem round-trip v6, rejeição segura de formato legado, checksum, duplicatas, transação e reabertura. O upgrade v7→v8 deve abrir sem erro, remover o mundo anterior e permitir criar/persistir novos registros.

A F1 não autoriza mudança de schema ou backup por causa do mundo.

Somente uma pessoa pode aprovar TalkBack, áudio percebido, toque, ergonomia, desempenho físico, instalação e atualização em aparelho real. Three.js foi aprovado como renderer da Fundação pela combinação dos gates automatizados com a evidência humana identificada da F1-F; TalkBack e os limites do mundo complexo não foram aprovados por essa decisão.

## BF-4B — ambiente integrado

`libraryRecordLayout.test.ts` expande as matrizes de cada `InstancedMesh` para conferir Box3 reais dos acabamentos: passagens livres, ausência de colisões com três estantes/70 livros e 13 registros, framing em dois formatos e disposal único dos batches/materiais. `bf4-environment.spec.ts` cria seis tipos fictícios, captura paisagem/retrato e aproximação com seleção, testa zoom, pan e preservação da seleção na orientação. Os testes existentes de runtime, interação e host conservam fallback, falhas e F5. Resultados executados, investigação de `r4-shell` e limitações estão no [relatório BF-4B](BF-4B_RELATORIO.md); não inferir gate físico das capturas.

Na investigação BF-4B, `visibleShelfPoint` de `r4-shell` passou a executar sua grade de taps e leitura imperativa de seleção dentro de uma chamada ao navegador. A grade e a exigência de picking real são preservadas, assim como o clique desktop subsequente e assertivas de interação. Isso elimina o custo de centenas de viagens de protocolo observado nos traces, sem skip, retry adicional ou aumento de timeout. A CI remota/issue #4 ainda requer validação própria.


## BF-4B — fechamento automatizado e físico dirigido (2026-11-02)

CI da PR #8, [run 41379918451](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41379918451), commit `153dd6a`: **PASS** em formato, lint, tipos, Vitest, áudio, build, performance report e E2E. A issue #4 segue aberta até evidência de estabilidade histórica/pós-merge.

**Moto G06 (usuário):** APK atualizado instalado, quatro capturas; estética geral dos cinco cômodos PASS, pan/zoom/seleção sem regressões, rotação retrato/paisagem PASS, background/retorno PASS, abertura de registro React/retorno PASS. Leve tremulação/borramento das malhas de paredes ao mover câmera é ressalva R-19 aceita e adiada. Não afirmar novo gate específico de pinch, TalkBack, FPS sustentado/termal, beta ou BF-4C–G. [Relatório BF-4B](BF-4B_RELATORIO.md).

## BF-4C — Fechamento dirigido por exceção CI (2026-11-02)

A BF-4C adiciona testes de dimensões, focal zoom nos cinco cômodos, distribuição das 18 ilhas, Box3 de instâncias reais, recursos independentes e descarte único. A regressão de layout verifica passagens livres de 2,2 m × 2 m de altura, paredes, móveis, 13 registros e 70 livros. A antiga expectativa de sobreposição série/estante foi substituída por seleção direta da série, agora afastada. E2E BF-4 captura retrato/paisagem, seleção, zoom, mudança real de target por pan e métricas do renderer. Testes de runtime cobrem falhas, remount, pausa/resume e isolamento F5. [Resultados e gate humano dirigido final](BF-4C_RELATORIO.md).

Gate local BF-4C: 79 arquivos/638 testes unitários PASS; 19/19 E2E PASS final sem retries. Rodada inicial concorrente com builds: 17 PASS e dois timeouts do shell; repetição sem builds concorrentes passou, sem mudar esses testes ou limites. **CI remota da PR #9, [41387959550](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41387959550), FAIL**: formatação, lint, tipos, 638 unitários, áudio, build e performance PASS; 18/19 E2E PASS, timeout no `r4-shell` de dez ciclos de rota, incluindo retry. A causa não foi demonstrada; issue #4 permanece aberta. **Gate físico dirigido:** APK BF-4C recompilado e instalado no Moto G06, nove capturas, inspeção visual aprovada e pan/zoom/seleção/orientação/background-resume PASS informado pelo usuário; nenhum travamento ou regressão percebida. Por autorização expressa, encerramento **por exceção de CI**, sem alegar CI verde ou teste assistivo TalkBack. Nem FPS sustentado nem validação de editor de móveis foram demonstrados.

## BF-4D — Fechamento no escopo dirigido com exceção CI

`librarySpatialLayout.test.ts` valida dados imutáveis e rejeita NaN, regiões inválidas, duplicatas, referências incorretas, pontos fora das zonas, áreas fora do piso e conexões insuficientes. Mede cada instância real da mobília/arquitetura, paredes, estantes e registros; verifica contenção, colisões, corredores e zonas livres, aproximações com largura de 1,2 m, orientação dos pontos e cenários vazio/cheio. Pan contínuo atravessa as quatro passagens em ambos extremos de zoom e duas proporções. Raycast de cena completa comprova ponto visível para três estantes, cada um dos 70 livros e os 13 registros após pan.

`ThreeWorldRuntime.d1.test.ts` explora as novas posições por Pointer Events antes de testar picking/highlight de estantes e livros. Regressões existentes mantêm overflow, troca de representação, React, fallback, falhas, remount e F5. `bf4-environment.spec.ts` mantém seleção durante orientação e amplia o WebGL real com 70 livros + 13 registros, exploração de todos os cômodos por formato e capturas por ala. O seed usa somente o IndexedDB descartável do Playwright. Não há alteração de timeout, retries ou skip. [Resultados executados, ajustes do harness e roteiro humano](BF-4D_RELATORIO.md).

Gate local BF-4D: **80 arquivos/645 Vitest PASS; 21/21 E2E PASS em 164,15 s**, sem retries/skips/flaky, incluindo dez ciclos `r4-shell` (26,9 s). Formato, lint, tipos, áudio, build, performance, Android sync/assembleDebug e diff --check PASS. A issue #4 permanece aberta; CI não é inferida de PASS local. Na entrega local, APK ainda não instalado e gates humanos pendentes; avaliações posteriores constam na sequência desta seção.

**BF-4D — auditoria remota/humana posterior (2026-11-02):** Moto G06 com APK atualizado e quatro capturas: aprovação visual e PASS dirigido para arraste, seleção, zoom e orientação, sem travamentos/regressões percebidos; 58,8–60,1 FPS pontuais, não benchmark sustentado. A [CI PR #10, run 41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) terminou **FAIL** com formato/lint/typecheck/645 Vitest/áudio/build/performance PASS e **19/21 E2E PASS**. Timeouts (com retries) no `r4-shell` histórico (issue #4) e no **novo** cenário `bf4-environment` de coleção cheia em 1280px, durante `canvas.evaluate` sob SwiftShader com telemetria pontual de ~8,4 FPS. Segundo caso ainda sem causa demonstrada; investigar trace, seed, overhead de screenshot e renderização em software, sem relaxar verificações/timeout arbitrariamente. Não declarar CI verde ou BF-4D encerrada; PR permanece sem merge até reavaliação.

**BF-4D — decisão final de fechamento (2026-11-02):** o usuário autorizou expressamente encerrar/mesclar mesmo com os timeouts E2E, como dívida técnica, após aprovação física dirigida. O gate local 21/21 E2E não substitui CI: [41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) continua **FAIL 19/21**, sem causa determinada, com `r4-shell` [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) e novo E2E BF-4D coleção cheia [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) abertos. Não houve alteração de asserts, retries ou timeout. Concluir BF-4D significa aceite funcional do escopo, **não** CI verde ou disponibilidade de release/beta. TalkBack, teste sustentado e BF-4E–G permanecem pendentes.

## BF-4E — checkpoint de implementação (2026-11-02)

BF-4E acrescenta testes de catálogo, transições inválidas, sequência completa, reversibilidade, isolamento e descarte; provas Three de peças, luz e limites dos cômodos/circulação; E2E do segredo com e sem WebGL. Contagens BF-4D/shell incluem os dez selecionáveis ambientais. Não foram adicionados retries, skips ou timeouts. Evidências e falhas constam no relatório. [Relatório técnico](BF-4E_RELATORIO.md).

**BF-4E — revalidação após crítica de UX (2026-11-02):** testes dirigidos novos cobrem ação primária por família, relógio local e prioridades de atmosfera, descoberta por sequência direta e toque repetido sobre luminária via canvas; E2E de fallback foi adaptado para painel acessível recolhido/aberto em erro. Os testes precisam passar na execução remota antes de serem descritos como PASS; validação manual das dez áreas de toque e aparência dia/noite no Moto G06 continua pendente. Issues #4/#11 não devem ser reclassificadas como resolvidas sem prova.

**BF-4E — polimento de alvos, gaveta e mensagens (2026-11-02):** acrescentadas regressões do alvo ampliado de 28 px em livro/pergaminho, sem capturar toques distantes, registros convencionais ou props fora do viewport; gaveta E deve usar deslocamento positivo +0,42 m no Z local e retornar a zero; faixa inicial oculta, fade aos 3,6 s, remoção aos 4 s e novo ciclo em toque subsequente. A CI e o teste humano do APK atualizado ainda precisam avaliar o conjunto, mantendo issues #4/#11 e gate TalkBack independentes.

## BF-4E — Gate de fechamento dirigido (2026-11-02)

**Aceite humano Moto G06:** depois da rejeição da interface de botões, o usuário aprovou a interação primária por toque e observou arraste/seleção/zoom sem regressões percebidas. Completou o Segredo do Pergaminho 4/4 pelo canvas (A→C→E). Após o hotfix final, instalou novo APK e confirmou que livro e pergaminho ficaram mais fáceis de tocar, gaveta E abre na direção correta e feedback desaparece após aproximadamente 4 segundos. Essas são provas funcionais dirigidas, **não** aprovação TalkBack, benchmark sustentado ou avaliação exaustiva de todas as famílias/densidades.

**CI remota [PR #12/41438324911](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41438324911):** formato, lint, typecheck, **661/661 Vitest em 84 arquivos**, áudio, build e performance **PASS**; **Playwright 20/24 PASS e 4 FAIL** (coleção cheia 1280 px + 390 px em `bf4-environment.spec.ts:94`; `r4-shell.spec.ts:114` interação desktop + `:384` dez ciclos). **CI global FAIL**. A correspondência por famílias de testes está rastreada em [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), **sem causa atribuída/solução presumida**, nem eliminação de testes/assertivas. Testes específicos da BF-4E passaram na rodada, não substituindo o gate físico. O usuário autorizou explicitamente **fechar e mesclar com essas dívidas**, a exemplo das exceções anteriores. Carga cheia, estabilidade prolongada, R-19 e TalkBack continuam pendentes antes de gates que os exijam. [Relatório final](BF-4E_RELATORIO.md).

**Fechamento BF-4F1 (2026-11-02):** quatro habitantes integrados, visual inicial aprovado e seleção pelo canvas e React confirmada no Moto G06. Microgestos de cabeça não representam animação corporal; essa expressividade fica para BF-4F2. Capturas indicaram ~60 FPS pontuais, sem benchmark sustentado. [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206) passou os gates não E2E e 667 Vitest; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem CI global PASS. Issues #4/#11, R-19 e TalkBack permanecem. [Relatório](BF-4F1_RELATORIO.md).

## R5 — assets e rigs deformáveis

`npm run assets:inhabitants:check` carrega os GLBs reais com GLTFLoader e comprova skin/pesos/deformação, sockets parentados às mãos, payload anexado, oito clips/transições, dimensões, picking/highlight animado, envelopes completos e descarte de Skeleton/boneTexture. O ensaio de envelope conserva todos os vértices e 33 amostras por clip, com palette de matrizes preparada por pose para evitar multiplicações redundantes; não aumentar timeout para compensar o custo do verificador.

Rodada ampla, estática, web/Android e falhas intermediárias são preservadas no [relatório R5](audits/BV_RECUPERACAO_R5.md). A prova de payload não equivale a IK, dedos fechando, roupa sem interseção ou assento seguro. Avaliar [roteiro Moto G06](audits/evidence/bv-r5/MOTO_G06.md) com aceite artístico independente por personagem. Nenhum teste automatizado aprova arte, áudio percebido ou TalkBack. CI remota omitida por cota até 01/12/2026; não chamar checks omitidos de verdes. E2E R2 histórico preservado.
