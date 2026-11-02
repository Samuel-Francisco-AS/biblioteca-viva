# BF-4D — Organização espacial, circulação e atividades

2026-11-02. **BF-4D encerrada no escopo técnico e físico/visual dirigido, por aceitação explícita de duas dívidas de CI remota.** D1–D4 implementadas, auditadas e aceitas no Moto G06. A seção de acompanhamento documenta a decisão intermediária de suspender o merge; o fechamento por exceção ao final deste relatório registra a decisão posterior, que a substitui. Sem release ou tag.

## Estado inicial e auditoria

Checkout limpo em `feat/bf-4c-expanded-furnishing`, HEAD `ea8f2f1c84ea6d8f64a4ef8188e4011300ad9d9b`, sem arquivos não rastreados ou commits locais não publicados. `git fetch --prune origin` encontrou `main` em `6804fee4c3fff49f8807c0111bba4e08716639cf`, o merge BF-4C conhecido, sem avanço posterior. `git switch main` e `git pull --ff-only origin main` precederam qualquer edição. HEAD e origin/main conferidos iguais. A branch `feat/bf-4d-spatial-organization` não existia localmente nem no remoto e foi criada a partir dessa base. Sem stash, reset, descarte ou alteração direta da main remota.

Leitura dirigida de AGENTS, STATUS/README, roadmap, WORLD, contrato BF-4, relatórios B/C, decisões aplicáveis (ADR-011/012), arte, performance, testes e riscos. O fechamento BF-4C registra aceite físico dirigido e exceção CI PR #9, com composição provisória encaminhada à D. A autorização desta execução substitui a indicação anterior de D ainda não autorizada.

O código confirmou cinco pisos/quatro passagens; mobiliário em batches possuídos pelo edifício; snapshots convencionais e seleção por wrappers; estantes no núcleo antigo e registros BF-3 transladados por sinal. Câmera usa os pisos reais, e lifecycle/F5 têm caminhos próprios. A implementação altera declarações de layout e a escolha de estantes do mundo composto, sem refazer fábrica, geometria, câmera ou ownership.

## D1 — Composição dos cinco cômodos

Coordenadas abaixo em metros, X/Z; Y permanece zero. A arquitetura BF-4C e dimensões de todos os objetos permanecem. Estantes/representações mantêm frente +Z e rotação zero, adequada ao observador ortográfico em +X/+Z. Não foi necessário ampliar APIs de rotação dos registros.

| Cômodo | Organização inicial BF-4D |
| --- | --- |
| A — salão | Estante 01 junto à faixa posterior; estudo 3 e filme 2 com armário de apoio nessa faixa; duas mesas em ilhas separadas pelo eixo central; lounge junto ao limite frontal; plantas nos cantos. O centro e as conexões transversais ficam livres. |
| B — ala X−/Z− | Filme 1 e série 1 próximos à parede posterior, trabalho 3 na lateral; poltronas voltadas para essa composição; armário lateral e planta junto à entrada sem invadir sua reserva. |
| C — ala X+/Z− | Estante 02 posterior, dois registros de estudo em faixa intermediária, mesa na metade frontal e banco lateral. Galerias livres separam estante, registros e assentos. |
| D — ala X−/Z+ | Estante 03 atrás da mesa; banco paralelo à lateral externa; dois registros físicos na faixa oposta; planta junto à entrada. Duas faixas transversais atendem leitura e registros. |
| E — ala X+/Z+ | Série 2 e armário junto à faixa posterior; lounge girado para os trabalhos 1/2 e atividade física 3 na faixa frontal; planta junto à entrada. |

A combinação de livros, estudo, filmes, séries, trabalho e atividades em diferentes salas é somente a distribuição inicial. Não há propriedade de categoria em cômodos nem restrição futura de tipos.

### Estantes e livros

| Identidade | Antes X/Z | Depois X/Z | Cômodo | Capacidade preservada |
| --- | --- | --- | --- | --- |
| reading-shelf-01 | −3 / −2 | −3 / −7,2 | A | 24 |
| reading-shelf-02 | 0 / −2 | 15,8 / −11,2 | C | 25 |
| reading-shelf-03 | 3 / −2,1 | −15,5 / 3,6 | D | 21 |

`libraryShelfLayout.ts` reaproveita as mesmas identidades, variantes e ordem de `readingShelfDefinitions.ts`. Slots dos 70 livros continuam locais aos wrappers. Nenhuma identidade/ordenação é derivada da posição. O caminho legado conserva sua declaração anterior; F5 permanece isolado. Troca de representação e reconciliação continuam pelo contrato existente.

### Treze slots BF-3

| Slot | Antes X/Z | Depois X/Z | Cômodo atual |
| --- | --- | --- | --- |
| movie-1 | −15,4 / −9,2 | −16,5 / −10,8 | B |
| movie-2 | −15,4 / −6,8 | 5,6 / −7,2 | A |
| series-1 | −13,4 / −9,2 | −14,1 / −10,8 | B |
| series-2 | −13,4 / −6,8 | 16,1 / 3,6 | E |
| study-1 | 13,4 / −9,2 | 14,1 / −8,3 | C |
| study-2 | 15,4 / −9,2 | 16 / −8,3 | C |
| study-3 | 14,4 / −6,8 | 3 / −7,2 | A |
| physical_activity-1 | −15,4 / 6,8 | −17,1 / 10,8 | D |
| physical_activity-2 | −13,4 / 6,8 | −15,3 / 10,8 | D |
| physical_activity-3 | −14,4 / 9,2 | 17 / 10,8 | E |
| work-1 | 13,4 / 6,8 | 14,1 / 10,8 | E |
| work-2 | 15,4 / 6,8 | 15,6 / 10,8 | E |
| work-3 | 14,4 / 9,2 | −16,7 / −8,2 | B |

`libraryRecordLayout.ts` deixa de aplicar offsets da planta antiga e declara as posições finais. `slotId`, `entryId`, `instanceId`, `modelTypeId`, sequência por categoria, capacidade 2/2/3/3/3 e overflow não mudam. A lista React mantém todos os registros, inclusive excedentes.

### Dezoito conjuntos ambientais

IDs continuam `bf4-prop:<n>`. Não há retirada de componentes nem entryId/seleção convencional de móveis.

| n / cômodo / conjunto | Antes X/Z; rotação | Depois X/Z; rotação |
| --- | --- | --- |
| 0 / A / estudo | −5,5/−5,5; 0 | −4,5/−2; 0 |
| 1 / A / estudo | 4,8/4,8; 0 | 4,5/2; 0 |
| 2 / A / lounge | −5,5/5,3; 0 | −4,5/6,8; 0 |
| 3 / A / armário | 6,5/−6,8; 0 | 7,7/−7,2; 0 |
| 4 / A / planta | −8/−7; 0 | −8/7; 0 |
| 5 / A / planta | 8/7; 0 | 8/7; 0 |
| 6 / B / lounge | −14,6/−4,4; π | −15,4/−4,6; 0 |
| 7 / B / armário | −12,1/−10,8; π/2 | −17/−6,8; 0 |
| 8 / B / planta | −17,2/−3,5; 0 | −11,7/−3,4; 0 |
| 9 / C / estudo | 14,6/−4,4; 0 | 15,4/−4,8; 0 |
| 10 / C / planta | 17,2/−3,5; 0 | 11,7/−3,4; 0 |
| 11 / C / banco | 12/−10,7; π/2 | 17,3/−8,3; π/2 |
| 12 / D / estudo | −14,6/4,4; 0 | −14,9/7,1; 0 |
| 13 / D / planta | −17,2/3,5; 0 | −11,7/3,4; 0 |
| 14 / D / banco | −12/10,7; π/2 | −17,55/7,2; π/2 |
| 15 / E / lounge | 14,6/4,4; 0 | 15,3/6,9; π |
| 16 / E / armário | 12/10,7; π/2 | 13,7/3,4; 0 |
| 17 / E / planta | 17,2/3,5; 0 | 11,7/3,4; 0 |

Mantidos mesas, cadeiras, poltronas, bancos, tapetes, luminárias, armários, livros decorativos e plantas. Orientações alinham banco com parede e poltronas com a faixa de observação. A separação foi verificada contra volumes reais, incluindo saliências, folhas e tapetes; não só centros declarados.

## D2 — Circulação e acessos

`librarySpatialLayout.ts` declara **18 retângulos** com prefixo `bf4-circulation:`. Eixos transversais `north-link`/`south-link` conectam as quatro passagens em Z=±4,8 e X entre ±12,2. `hall-spine` liga os dois no salão. Galeria posterior e acesso de estudo atendem A; espinhas laterais e galerias/ramais atendem B–E. Os centros de passagens vêm de `LIBRARY_PASSAGES`, sem duplicação da planta.

**Clearance de 1,2 m**, ou 0,6 m por lado do eixo. A escolha deixa reserva substancial dentro das passagens de 2,2 m efetivamente livres, sem pressupor corpo de NPC ou norma assistiva. Os retângulos incluem essa meia largura nas extremidades, permitindo junções completas. A conectividade é verificada após erosão por 0,6 m: contatos estreitos de cantos não podem fingir conexão útil. A cobertura de cada região pela união dos pisos é verificada por partição exata nas bordas, sem amostragem em grid ou navmesh.

Testes complementares varrem aproximações de 1,2 m até pelo menos um lado de cada estante/registro, com separação final de 5 cm do objeto, limite de 2 m do eixo livre e ausência de obstáculos no volume varrido. A prova é geométrica conservadora em X/Z, não rota executada por personagem. Paredes/objetos são medidos a partir das geometrias instanciadas. Os quatro vãos preservam o teste existente de faixa livre de 2,2 m até 2 m de altura.

## D3 — Zonas e pontos declarativos

**18 zonas quadradas de 1,2 × 1,2 m e 18 pontos**, um por zona. IDs `bf4-zone:<nome>`/`bf4-point:<nome>` não dependem de registros. Ponto tem X/Z, raio 0,35 m e orientação em radianos; cômodo/atividade/referência de mobília pertencem à zona, sem duplicar esses dados. Zero de orientação aponta para +Z. Tudo é imutável e independente de React, renderer e persistência.

| Nome | Cômodo / atividade | Centro X/Z | Direção | Referência ambiental |
| --- | --- | --- | --- | --- |
| a-reading | A / leitura | −3/−5,7 | π | — |
| a-study | A / estudo | −4,5/−4,3 | 0 | prop:0 |
| a-rest | A / descanso | −4,5/4,8 | 0 | prop:2 |
| b-rest | B / descanso | −15,2/−6,8 | 0 | prop:6 |
| c-reading | C / leitura | 15,8/−9,8 | π | — |
| c-study | C / estudo | 15,4/−6,9 | 0 | prop:9 |
| d-reading | D / leitura | −15,5/4,8 | π | — |
| d-study | D / estudo | −14,9/9,6 | π | prop:12 |
| e-rest | E / descanso | 15,3/9,5 | π | prop:15 |
| e-observation | E / observação | 16,1/4,8 | π | — |
| room-b/c/d/e-inner | A / circulação | X=±8,6; Z=±4,8 | para a ala | — |
| room-b/c/d/e-outer | ala correspondente / circulação | X=±11,6; Z=±4,8 | para o salão | — |

Cada zona está no cômodo declarado e coberta por circulação livre. Pontos cabem integralmente na zona, têm referências válidas e orientação coerente com a mobília. São aproximações para uso futuro, **não** posições sentadas, atividades em execução, animações, destinos já aprovados fisicamente ou estado de ocupação. BF-4E/F deverão definir ações e dimensões/poses de personagens, conflitos de uso e navegação sob autorização própria.

## D4 — Contratos, regressões e resultados

Preservados `React → WorldHost → ThreeWorldRuntime → Three.js`, seis tipos, consulta por snapshot, abertura por entryId, overflow, seleção/highlight, substituição, ownership e descarte seletivo/terminal, falhas de montagem, fallback e F5. Só muda a declaração escolhida para estantes do mundo composto; não há nova API do host/runtime, segundo loop, dependência, asset externo, schema Dexie ou backup. A câmera F3 não foi editada.

- Box3 expande cada InstancedMesh com matriz local e de ancestrais; verifica paredes, 18 ilhas, três estantes e 13 representações, tanto com 70 livros quanto com coleção vazia.
- Validação pura rejeita NaN, dimensões inválidas, IDs duplicados, referências incompatíveis, pontos fora da zona, lacunas de piso e gargalos/desconexões.
- Raycast da cena inteira encontra ponto visível de **cada um dos 70 livros**, das três estantes e dos 13 registros após pan, em hosts 760×468 e 324×244. Não ignora decoração/paredes ao procurar o primeiro hit.
- Pan contínuo cruza quatro passagens nos extremos 0,7/2,2 em ambas proporções. Testes existentes conservam wheel, pinch, orientação, seleção bidirecional, remount, falhas e F5.
- E2E WebGL real semeia 70 livros fictícios e cria 13 registros pela UI; mantém seleção React/highlight e visita todas as salas, com capturas por ala em paisagem/retrato. O cenário existente verifica a troca de orientação na mesma montagem. Dados pessoais não foram usados.

### Gates executados

| Comando / gate | Resultado |
| --- | --- |
| `npm run format:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:run` | PASS — 80 arquivos / 645 testes, 26,93 s |
| `npm run audio:check` | PASS — dois arquivos conferidos |
| `npm run build` | PASS — aviso conhecido >500 kB |
| `npm run performance:report` | PASS — tamanhos abaixo |
| `npm run test:e2e` | PASS — 21/21, 164,15 s, zero skips/retries/flaky |
| `npm run android:build:debug` | PASS — build web, sync Capacitor e assembleDebug; 184 tarefas, Gradle 20 s |
| `git diff --check` | PASS |
| Auditoria Luna / Moto G06 / TalkBack | PENDENTES — nenhum PASS humano novo |

Regressão espacial dirigida final: 7/7 PASS. E2E dirigido por formato: 3/3 PASS; o gate integral posterior confirma o harness final com leituras agrupadas. `r4-shell` de dez ciclos passou localmente em 26,9 s; nenhuma falha desse cenário foi reproduzida nesta execução. Isso não prova resolução da issue #4 nem CI remota integral. Os testes gráficos ainda se aproximam do limite em algumas condições: coleção cheia desktop 27,8 s nesta suíte. CI deve ser avaliada independentemente, sem retries extras ou timeout aumentado.

APK debug gerado, não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, **10.568.058 bytes**, SHA-256 `dbe40ee494ed5e15e85bd1171da11adf94e34cf0921d3e5fe54d74a79daaf184`. Warnings `flatDir` e chunks grandes preservados. Nenhuma alteração Android gerada entrou no diff. Logs locais de gates ficam em arquivos temporários `bf4d-*` fora do checkout; capturas/traces em `test-results/` são ignorados pelo Git. Resultados estruturados do E2E confirmam 21 esperados, zero inesperados, zero skipped e zero flaky.

### Achados intermediários e investigação

A primeira rodada dirigida encontrou planta com saliência 1,44 mm além da margem de 0,3 m exigida pelo teste; reposicionamento corrigiu, preservando seu volume. O picking integrado das estantes pressupunha todas no enquadramento inicial: foi atualizado para executar pan por Pointer Events antes de selecionar, com o mesmo raycast/primeiro hit/highlight. A primeira movimentação consome o slop F3; o movimento seguinte produz o pan, como no contrato existente. Não se alterou a câmera para acomodar o teste.

O novo E2E inicialmente comparava projeção calculada com dimensões internas do canvas às dimensões do host utilizadas pelo runtime. Diferenças de 6–8 mm no alvo vieram da borda/rounding do viewport do harness; passou a usar o host arredondado, preservando tolerância de 0,005 m. Depois, o trace mostrou todas as quatro alas em paisagem aprovadas e a primeira em retrato, até o limite global de 30 s durante a continuação. O cenário foi dividido por formato, conservando as provas, e leituras/assertivas foram agrupadas para reduzir viagens de protocolo. Sem aumento de timeout, skip ou retries. Isso é investigação do teste **novo**, não identificação da causa histórica da issue #4.

## Métricas disponíveis

Build web: **638.489 bytes** iniciais, inalterados frente à BF-4C; chunk dinâmico Three **669.387 bytes**, contra 669.201 (+186 bytes). Aviso de chunks >500 kB permanece. As zonas/validadores ficam disponíveis em módulos para E/F e não adicionam malhas, materiais ou execução ao renderer.

Amostras Chromium headless local, SwiftShader, DPR 1, viewport 1280×900, zoom 0,7, target 0/0, sem highlight:

| Métrica observada | Vazio | 70 livros + 13 registros |
| --- | ---: | ---: |
| Selecionáveis | 3 | 86 |
| Meshes na cena | 60 | 323 |
| Draw calls no frame | 49 | 227 |
| Triângulos no frame | 22.452 | 24.652 |
| Geometrias reportadas pelo renderer | 32 | 165 |
| Texturas renderer / referências materiais | 1 / 0 | 1 / 0 |
| Loops ativos | 1 | 1 |

Essas contagens são dependentes de câmera/culling e recursos já renderizados; não são custo integral de todos os objetos nem otimização comprovada. A mobília preserva os mesmos 13 batches e as mesmas fábricas. O framebuffer não adiciona texturas de conteúdo. FPS/frame time e primeiro frame do headless sob testes não são benchmark físico nem comparação válida com Moto G06. Não foi medida memória GPU/RAM, temperatura ou desempenho sustentado.

## Inspeção humana e riscos residuais

1. Reproduzir os gates com `npm run test:run` e `npm run build && npm run test:e2e`; capturas em `test-results/bf4-environment-*`. O cenário cheio usa exclusivamente dados fictícios num contexto Playwright descartável em `127.0.0.1:4173`.
2. Gerar `npm run android:build:debug`; avaliar o APK atual no Moto G06, registrando build/SHA e condições. Esta execução não instala APK nem manipula dados pessoais.
3. Conferir A/C/D com estantes, 24/25/21 livros quando preenchidas; selecionar cada estante e livros por toque e React, alternar seleção, testar troca de representação onde disponível no harness. Não esperar ver todas as estantes no enquadramento inicial.
4. Inspecionar B/C/D/E por pan, os quatro vãos e acesso visual aos registros; testar coleção vazia e representativa, zoom, pinch → pan, retrato ↔ paisagem, background/resume, seleção e abertura/edição/retorno pela UI.
5. Julgar distâncias, coesão dos conjuntos, conforto visual e eventuais oclusões persistentes. Capturas automatizadas inspecionadas mostram conjuntos e livros reconhecíveis; isso não é aprovação estética humana. Nas aproximações máximas parte do cômodo sai do viewport, como previsto por F3/BF-4C.
6. Registrar R-19 durante movimento: não corrigida, sem evidência física nova de melhora ou agravamento. Reavaliar fluidez/densidade no aparelho; nenhum FPS sustentado foi aprovado. TalkBack permanece gate humano obrigatório antes de primeiro recorte real/beta. A issue #4 continua aberta; aprovação local isolada não encerra flakiness histórica.

Não foram implementados editor de mobília, persistência, NPC, animação, diálogo, pathfinding/navmesh ou ações BF-4E. A auditoria independente e o fechamento são posteriores.

## Arquivos e entrega

Criados: `src/features/library/libraryShelfLayout.ts`, `librarySpatialGeometry.ts`, `librarySpatialLayout.ts`, `librarySpatialLayout.test.ts`; `docs/BF-4D_RELATORIO.md`.

Alterados: `src/features/library/libraryRecordLayout.ts`, `libraryRecordLayout.test.ts`, `three/libraryFurnishingLayout.ts`, `three/ThreeWorldRuntime.ts`, `three/ThreeWorldRuntime.d1.test.ts`; `e2e/bf4-environment.spec.ts`; `CHANGELOG.md`, `docs/README.md`, `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/WORLD.md`, `docs/PERFORMANCE.md`, `docs/TESTING.md`, `docs/RISKS.md`, `docs/BF-4_PLANO_CONTRATO.md`.

Removidos: nenhum. APK, logs, capturas, traces, caches e builds ficam fora do Git. Commit/push/PR são autorizados somente na branch BF-4D; nenhum merge será realizado por esta execução. O SHA publicado e a URL da PR constam da entrega final, evitando referência circular ao próprio commit deste relatório.

## Acompanhamento pós-auditoria — 2026-11-02 (sem encerramento)

**Revisão estática independente:** a Luna examinou a PR #10 (`daf0894b1c8e4dd9af7b72dd59157119c4b1c496`), a integração dos wrappers de estantes ao mundo composto, a reserva declarativa das 18 regiões e das 18 zonas/pontos, os testes de geometria, seleção e navegabilidade. Nenhum bloqueante estático inequívoco foi identificado; testes remotos e físico permanecem evidências distintas.

**Gate humano dirigido — Moto G06:** usuário recompilou/atualizou APK e compartilhou quatro capturas do mundo BF-4D, aprovou a composição espacial para o escopo e relatou PASS em arraste/pan, seleção, zoom e alternância de orientação retrato↔paisagem, sem travamentos ou regressões percebidas. As capturas exibem leituras pontuais de aproximadamente 58,8–60,1 FPS e 16,6–17,0 ms/frame, sem prova de desempenho sustentado, temperatura, consumo GPU/RAM, stress com coleção cheia, TalkBack ou retorno de segundo plano nesta rodada específica.

**CI remota — PR #10:** [run 41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312), commit `daf0894b1c8e4dd9af7b72dd59157119c4b1c496`, terminou **FAIL**: format:check, lint, typecheck, **645 Vitest**, áudio, build e performance report PASS; **19/21 E2E PASS**, com dois timeouts (incluindo retries): (1) o cenário histórico `e2e/r4-shell.spec.ts` de dez ciclos, já acompanhado na issue #4, e (2) o **novo** `e2e/bf4-environment.spec.ts` 'coleção cheia explora cinco cômodos e quatro conexões em 1280px', durante `canvas.evaluate` na exploração após zoom. O canvas reportou aproximadamente **8,4 FPS / 119,06 ms** naquele instante sob o renderizador de software do CI (SwiftShader), sem comparação direta com o Moto G06. Esse segundo timeout não estava coberto pela exceção histórica à issue #4; não há causa raiz demonstrada, nem é lícito presumir que seja exclusivamente contenção do runner ou regressão do runtime.

**Decisão intermediária do gate (substituída pela decisão final abaixo):** aceite físico dirigido registrado, mas fechamento/merge inicialmente suspensos pela condição de ausência de bloqueantes até nova decisão do usuário. A decisão expressa posterior aprovou concluir com dívida CI documentada, sem declarar CI verde. Não confundir a pendência com falta de aprovação estética.

**Investigação futura, agora dívida explícita:** investigar traces e custo do novo teste no runner; discriminar demora de semeadura, renderização SwiftShader, Playwright e runtime. Preservar provas de 70 livros/13 registros, cinco cômodos e seleção, sem mascarar testes. Rastreada na [issue #11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11); issue #4, R-19 e TalkBack permanecem abertos. A investigação pode ocorrer após o fechamento, antes de julgar CI estável/release. Nenhuma funcionalidade BF-4E autorizada neste acompanhamento.

## Decisão final de fechamento por exceção — 2026-11-02

**Autorização expressa do usuário, posterior à avaliação anterior:** "prefiro por fechar a BF-4D agora, essas falhas de testes podem ficar como dívida". Essa decisão **substitui a suspensão de merge documentada na seção anterior**, sem afirmar que as falhas desapareceram, que a CI ficou verde ou que o novo timeout foi explicado. A [PR #10](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/10) foi explicitamente autorizada para integração na `main`; seu estado de merge é verificável no GitHub.

**Resultado no escopo aprovado: PASS técnico-funcional e visual/físico dirigido, COM EXCEÇÃO CI.** Auditoria independente estática da implementação não encontrou defeito arquitetural demonstrado que exigisse reverter a organização. A planta manteve cinco salas/quatro passagens; três estantes reposicionadas em A/C/D; 70 slots de livro, 13 registros BF-3 e 18 conjuntos ambientais preservados; 18 regiões de circulação de 1,2 m e 18 zonas/18 pontos declarativos preparados para BF-4E/F, não rotas executadas. Testes locais relatados: 645/645 Vitest, 21/21 E2E e build Android debug. O usuário instalou APK novo, aprovou a composição em quatro capturas e verificou pan/arraste, zoom, seleção e mudança retrato↔paisagem sem travamentos/regressões percebidos. Aprovação dirigida, não stress prolongado nem aprovação de TalkBack.

**CI da PR #10 — exceção consciente:** a [execução 41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) terminou **FAIL**, com checks de formato, lint, tipo, 645 Vitest, áudio, build e performance PASS; 19/21 E2E PASS e dois timeouts inclusive retries: (1) `r4-shell` de dez ciclos, dívida histórica [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4); (2) `bf4-environment.spec.ts` com coleção cheia, cinco salas e 1280px, **nova dívida específica [issue #11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)**. O runner com Chromium/SwiftShader mostrou ~8,4 FPS pontuais, sem demonstrar se a causa é harness, renderização em software ou runtime. **Nenhum teste foi desativado, afrouxado ou considerado aprovado ficticiamente**; a aceitação significa postergar investigação, não sanar defeito. CI de commits documentais posteriores e pós-merge deve ser classificada por seus próprios resultados, sem retroativamente alterar esta evidência.

**Limitações mantidas:** R-19 (tremulação/borramento das paredes durante movimento) permanece sem diagnóstico/correção; TalkBack humano ainda necessário antes do primeiro recorte real/beta; não há benchmark sustentado de FPS, GPU/RAM ou temperatura, nem garantia de execução de NPC em corredores de 1,2 m. O gate humano desta fase não verificou separadamente background/resume nem coleção saturada com 70 livros/13 registros. Editor de mobília e persistência espacial não foram implementados.

**Handoff:** BF-4E — integração do mundo habitável e objetos interativos — é a próxima etapa **a planejar e autorizar separadamente**. A BF-4D está concluída somente no recorte aprovado, com issues #4 e #11 abertas e CI integral não aprovada; BF-4E/F/G e release/beta continuam pendentes.
