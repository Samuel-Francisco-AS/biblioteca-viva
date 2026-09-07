# STATUS — Biblioteca Viva

> Atualização de estado: 2026-09-06.

## Estado atual

- baseline histórico: Prompts 1–19, R1–R3, P1, P2, W1 e W2;
- P3-C concluiu tecnicamente W3-A1–W3-A6, preservado como histórico verdadeiro;
- a validação física posterior no Moto G06 **reabriu W3-A**: a planta não forma uma sala visualmente contínua e o painel “Peças colocadas” impede a manipulação e retira o protagonismo do mapa;
- W3-A-R0, W3-A-R1 e W3-A-R2 foram integralmente aceitas pelo usuário; W3-A-R3-A, W3-A-R3-B, W3-A-R3-C-A e W3-A-R3-C-B1 também foram aceitas nominalmente;
- **W3-A-R3-C-B2 está tecnicamente concluída**: a repetição oficial passou com 9/9 casos, sete capturas de uma única geração e 31/31 emendas sem canal conectado de fundo;
- o resultado histórico de 8/9 motivou FIX-A/B1/B2 e o acabamento longitudinal; sua evidência reprovada e a geração parcial posterior foram substituídas pela baseline completa vigente;
- **W3-A-R3-C-B2-FIX-A foi aceita nominalmente**; a primeira tentativa de FIX-B foi interrompida corretamente, sem escrita, por faltar a semântica de batente/folha da porta;
- **W3-A-R3-C-B2-FIX-B1 e o reparo diagnóstico de inicialização foram aceitos nominalmente por Sam**; a restauração também foi confirmada manualmente no Firefox com estado `ready`, uma instância ativa e um canvas;
- **W3-A-R3-C-B2-FIX-B2 e o acabamento longitudinal de 14 px-fonte foram aceitos por Sam**: a normal interior vem somente da adjacência do piso, a translação assinada nasce na transformação canônica e o oráculo evoluiu de 19/31 para 31/31; FIX-C foi absorvida pelas regressões, sem abertura separada;
- **a direção visual proposta em `art-guides/w3-a-r4-ux-proposal/` foi aprovada por Sam com uma alteração**: a etiqueta contextual da Biblioteca deve completar aparição e desaparecimento em 5.000 ms;
- **R4 está concluída e aprovada pelo usuário no escopo web**: a direção visual foi aprovada por Sam; shell, conteúdos R4, Construção responsiva e Resumo foram integrados e os três acabamentos finais foram incorporados;
- **R5 está tecnicamente concluída**: a auditoria curta não encontrou regressão de produto, o smoke Firefox isolado passou, os dois arquivos focados passaram com 49/49 testes, build/sync/build Android passaram e o APK debug técnico foi gerado sem instalação;
- **o gate final pré-R6 está tecnicamente concluído**: os controles superiores obsoletos saíram da Biblioteca, Busca e Filtros passaram a recolher no fluxo com estado preservado, e a carga inicial do mapa foi reduzida sem alterar assets, geometria ou persistência;
- **R6 foi aprovada pelo usuário no Moto G06**: as capturas humanas e a inspeção da aplicação Android real confirmaram as alterações aparentes do gate e a preservação dos dados pessoais;
- **a rodada corretiva W3-A está integralmente encerrada**; a próxima etapa de produto ainda não foi iniciada;
- stack preservada: React + Phaser + Dexie + Capacitor, local-first, sem conta, backend ou sincronização;
- schema Dexie é v7 e o backup é v5, com leitor v1–v4 compatível;
- não há APK release, assinatura, instalação automática ou publicação.

## R4 — implementação web concluída

- o contrato central de rotas alimenta o roteamento e o dock com Biblioteca, Coleção, Arquivo, Resumo e Ajustes; “Resumo” reutiliza `/estatisticas`, enquanto `/novo-registro`, `/novo-livro` e os retornos históricos continuam válidos;
- “Novo registro” saiu da navegação primária e permanece como ação contextual da Coleção;
- o drawer primário anterior foi removido depois que seus destinos passaram ao dock; os links nativos preservam rótulo, ícone, foco visível, teclado, `aria-current="page"`, alvo de pelo menos 48 CSS px e safe area inferior;
- o shell React envolve o host Phaser existente. Entrar/sair de Construção apenas alterna overlays: o dock some durante a tarefa e volta na saída sem desmontar o canvas;
- a etiqueta usa sala e período reais, reinicia somente quando um desses contextos muda, cancela o ciclo anterior e é removida do DOM aos 5.000 ms. Movimento reduzido elimina fade/deslocamento sem mudar a duração; uma alternativa textual permanente continua disponível;
- a Construção expande piso e estruturas além da planta inicial; commits aparecem imediatamente e persistem. Paletas ficam fechadas por padrão, e “Peças colocadas” usa faixa horizontal de `320×205 px`, fecha ao selecionar, destaca/enquadra a peça e apresenta somente ações contextuais;
- o Resumo usa métricas coesas, tipos compactos, estados vazios leves e gráfico SVG responsivo derivado da duração real das sessões ou da contagem real da categoria selecionada, sem valores fictícios;
- a sonda Selenium abriu Firefox visível e completou numa sessão pública contínua expansão auxiliar, colocação, seleção pela faixa, movimento com resposta imediata e inspeção do Resumo em `320×640` e `1280×800`; quatro capturas finais ficam em `art-guides/w3-a-r4-ux-proposal/captures/r4-final/`. `npm run build` e `git diff --check` passaram;
- validações físicas específicas no Moto G06, TalkBack, teclado virtual, áudio percebido, Android e APK permanecem verificações posteriores separadas e não mantêm R4 aberta.

## R5 — regressão, compatibilidade e APK técnico

- a inspeção dos diffs R3/R4 e dos caminhos de StrictMode/lifecycle, ponte React–Phaser, Dexie, backup, restauração estrutural, inventário/grants, rotas, Android Back, safe areas e Capacitor não encontrou defeito objetivo; nenhum código de produção, schema, formato de backup, asset ou regra de domínio foi alterado em R5;
- Dexie permanece v7 e backup v5, com leitores v1–v4. A inspeção dos schemas/adapters e o teste focado confirmam preservação das coleções persistidas, estrutura, peças, preferências, inventário derivado e marcos; restauração usou somente bancos fictícios descartáveis;
- `src/infrastructure/backup/backup.test.ts` e `src/features/library-visual/LibraryVisualHost.test.tsx` passaram juntos: 2 arquivos, 49 testes. Nenhum terceiro arquivo Vitest, suíte global, E2E completo, B2, matriz 31/31, assets, performance ou acessibilidade foi executado;
- o smoke Selenium/Firefox 155 headless usou perfil temporário e somente a interface pública. Criou `Registro fictício R5 — 2026-09-06`, confirmou Coleção/detalhe/Biblioteca/canvas/Construção/Resumo, fez um reload e confirmou o registro e 8/8 peças antes/depois. A primeira tentativa encontrou apenas um seletor de harness excessivamente estrito para `↙ Sair`; a captura foi preservada em `art-guides/w3-a-r4-ux-proposal/captures/r5/failure-7-construction.png`, e o mesmo fluxo passou após corrigir somente o seletor temporário;
- `npm run build`, `npm run android:sync` e `npm run android:build:debug` passaram. Avisos não bloqueadores: chunks Vite acima de 500 kB e uso de `flatDir` pelo Gradle;
- APK debug técnico não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `99d379427949798ba1e1c20728bb254a1f021d09599f4f173b3bcbb0cb08e6fe`, gerado em 2026-09-06 18:35:54 -03:00;
- nenhum perfil pessoal, dado pessoal ou backup real foi acessado; não houve commit, push, tag, rebase ou mudança de versão. A próxima etapa é R6 no Moto G06, sem aprovação física antecipada.

## Gate final pré-R6 — interface e abertura da Biblioteca

- a Biblioteca não renderiza mais as setas entre salas nem o gatilho superior “Resumo acessível”; o botão “Resumo” acima do dock abre o mesmo conteúdo textual/acessível em painel próprio, enquanto Construir, o Resumo estatístico do dock e a etiqueta contextual de cinco segundos foram preservados;
- Coleção inicia com “Buscar registros” recolhido e Arquivo inicia com “Filtros do Arquivo” recolhido. Os botões amarelos Busca/Filtros têm `aria-expanded`, contagem ativa, alvo de 48 px, foco ao abrir, fechamento por Escape/Android Back e animação de 200 ms eliminada por movimento reduzido. Recolher não altera parâmetros nem resultados; “Buscar no Arquivo” permanece visível;
- a instrumentação sem conteúdo pessoal separou shell React, bootstrap/leitura Dexie, projeção, módulo/instância Phaser, texturas, primeiro `renderWorld` e primeiro frame. No build de produção local, o primeiro frame observado passou de 1.642 para 1.453 ms a frio e de 1.426 para 1.233 ms no reload com cache; a carga bloqueante caiu de 28 para 17 texturas e as 11 restantes são carregadas após o primeiro frame. Em DEV, as leituras duplicadas pelo StrictMode caíram de duas para uma; continuaram uma instância Phaser e um único `renderWorld` no boot;
- o fluxo Selenium final passou em Firefox visível, perfil temporário, origem `http://localhost:5173`, interface pública e viewport exata de 320×640, sem overflow. As quatro capturas ficam em `art-guides/w3-a-r4-ux-proposal/captures/pre-r6-final/`;
- `npm run build`, `npm run android:sync`, `npm run android:build:debug` e `git diff --check` passaram. Avisos não bloqueadores: chunks Vite acima de 500 kB e dois avisos Gradle sobre `flatDir`;
- APK debug técnico não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `348b9f549f1ebdc552f6b42b0b1f0c10ff0fa15584c6955ef989870f1e9a0330`, gerado em 2026-09-06 19:59:44 -03:00. Nenhum dado pessoal foi acessado ou removido, e não houve commit, push, tag, rebase ou mudança de versão. Desempenho e operação físicos continuam exclusivos da R6.

## R6 — validação física aprovada

- o usuário instalou e inspecionou o APK no Moto G06; as capturas humanas confirmam a aplicação Android real;
- os controles superiores obsoletos estão ausentes na Biblioteca; o botão Resumo inferior e Construir foram preservados, e o dock inferior funcionou;
- a Coleção apresentou Busca recolhida ao lado de Novo registro; o Arquivo apresentou Filtros recolhidos com a busca textual visível;
- os dados pessoais permaneceram preservados, e as alterações aparentes do gate foram aprovadas pelo usuário;
- permanecem duas ressalvas não bloqueadoras, ambas anteriores a este gate: demora perceptível na abertura inicial da Biblioteca e engasgo no card do Resumo. Elas foram aceitas e adiadas para a fase final específica de otimização;
- R6 não aprova nem declara resolvido o desempenho físico. Com a aprovação funcional acima e essas ressalvas registradas, a rodada corretiva W3-A está integralmente encerrada.

## W3-A — estado técnico entregue por P3-C (histórico)

- **W3-A1:** `WorldStructureState` é persistido separadamente de `PlacedObject`; piso usa células e paredes/cantos/porta usam arestas e orientações tipadas. A planta fixa W1 não é autoridade de geometria.
- **W3-A2:** o catálogo declarativo contém piso, paredes 1/2/4 horizontais e verticais, quatro cantos e porta horizontal aberta/fechada. Há 12 PNGs runtime RGBA validados, fallback procedimental e nenhuma porta vertical.
- **W3-A3:** `worldStructures` foi adicionado no Dexie v7; backup v5 carrega estrutura e marcos, aceita v4 e restaura repetidamente sem duplicação. O blueprint só é criado se ausente e o inventário é derivado.
- **W3-A4/A5:** React controla modo, seleção, revisão otimista, single-flight e alternativa acessível; Phaser recebe projeção, emite intenções tipadas e mantém pan, snap, preview, hit areas e limpeza efêmeros em uma cena/canvas.
- **W3-A6:** sessões concluídas, positivas e associadas a registros válidos concedem marcos cumulativos em 1/5/15/30. Grants `structure-grant`, inventário, feedback consolidado, áudio pós-commit e reconciliação idempotente pertencem aos dados/casos de uso, não à cena.

## P3-C — evidência automatizada

- corrigidos: marcador de schema obsoleto em testes v4/v5/v6, aviso de backup que tratava schema v7 como futuro, teste de footprint da planta antiga, abertura do compositor legado e token de navegação que reabria Construção após reload;
- adicionado E2E real: sessão manual positiva → unlock do primeiro marco → anúncio acessível → `Abrir construção` → inventário derivado → reload sem nova concessão;
- migração v6→v7 é coberta preservando objetos e criando `worldStructures` vazio; backup v5/restauração repetida, v4 e inventário derivado já são cobertos pela suíte;
- matriz final: 798 testes Vitest em 93 arquivos e 12 cenários Playwright passaram; formatação, lint, tipos, áudio, assets, build, relatório de performance, sync e build Android também passaram;
- APK debug não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.125.507 bytes, SHA-256 `87973cc480abf2d8112438c24155ba0a79bf8d0d195fa6fb1e242b830b55a454`, gerado em 2026-08-28 04:48:53 -03:00;
- inspeção visual automatizada por navegador controlado não foi possível nesta sessão porque não havia navegador disponível. O Playwright Chromium executou os fluxos E2E; isso não substitui inspeção artística nem dispositivo físico.

## W3-A-R0 — reabertura diagnóstica

- a topologia inicial 12×10 fecha logicamente suas 44 arestas sem descoberta, duplicação ou sobreposição;
- os vãos foram reproduzidos pelo contrato visual: braços de canto menores que o span declarado, porta deslocada uma célula, metadados duplicados e compositor sem planos de junção verificáveis;
- a alternativa “Peças colocadas” é incondicional, pode coexistir com seleção/movimento/sheets e ocupa quase toda a viewport mobile como scroll owner;
- `blueprintVersion` não distingue construção canônica de construção modificada; qualquer migração exige comparação exata e preservação de dados pessoais;
- R0 não alterou produção, testes, PNGs, schema, backup, blueprint, grants ou UI e não autoriza R1.

## W3-A-R1, R2, R3-C-B2, FIX-A e FIX-B1 — correção vigente

- R1-A e R1-B foram aceitas tecnicamente pelo usuário em 2026-08-31; a geometria lógica, a porta, o analisador de perímetro e o classificador canônico permanecem puros e sem regravação de dados;
- R2-A corrige a medição do alpha bbox no canvas original, fixa planos de junção pelas seis retas ativas e gera quatro gabaritos e quatro montagens fora de `art-source/` e `public/`; seu aceite permitiu produzir os quatro candidatos posteriormente aprovados visualmente pelo usuário;
- R2-B1 confirmou os quatro hashes autorizados e validou estritamente canvas 1248×1248, PNG sRGBA de 8 bits, bbox `1200x1200+24+24`, orientação, planos externos e ausência de alpha fora das áreas permitidas;
- cinco montagens 1:1 em `art-guides/w3-a-r2-b/montages/` registram as quatro junções com as retas originais e uma sala fechada;
- R2-B1 foi aceita nominalmente; a tentativa posterior de R2-B2 foi interrompida antes de qualquer escrita ao confirmar que o processador ainda aplicava `baseline` aos cantos de fonte e runtime;
- R2-B2-A preserva `baseline` como registro histórico e torna `production` obrigatório no processamento de todo canto que possua essa especificação, sem fallback silencioso; retas e portas conservam a validação anterior;
- R2-B2-A foi aceita nominalmente; R2-B2-B promoveu os quatro candidatos byte a byte para `art-source/` e gerou os runtimes exclusivamente por `npm run wall-assets:process`;
- candidatos, fontes e runtimes são RGBA pixel-equivalentes; os quatro runtimes passam o contrato `production`, enquanto todas as retas e portas mantêm os hashes anteriores;
- `wall-assets:check` voltou a executar sem `--allow-legacy-corners`; os quatro cantos aparecem como `conforming`, e a opção diagnóstica permanece implementada somente para investigação explícita;
- o complemento autorizado regenerou `art-guides/w3-a-r2-a/validator-report.json` pelo gerador oficial: o hash mudou de `f454624bc2e9751e2eca0dc36f4ee0a207df28a899342f34b1975e1d454a216f` para `ab428930f6d41c2d1d8ded61c40370cefba2b158af1b46755cc05d2974ebd0f8`, com 12 assets, quatro cantos `conforming` e zero legado;
- `wall-guides:check` e `wall-assets:check` passam; contrato, gabaritos, montagens e todos os PNGs permaneceram byte a byte idênticos durante o complemento;
- R2-B2-B foi aceita nominalmente pelo usuário em 2026-09-02, encerrando R2 integralmente;
- R3-A foi aceita nominalmente pelo usuário em 2026-09-02 antes da autorização exclusiva de R3-B;
- `structureVisualGeometry.ts` passa a ser a autoridade runtime canônica dos metadados medidos dos 12 assets: canvas, alpha bbox, pixels-fonte por célula, referência-fonte, planos, braços, regiões ocupadas e descritor puro de depth;
- a transformação pura aplica `scale = CELL_SIZE / sourcePixelsPerCell` e `spriteCanvasPosition = logicalReference × CELL_SIZE − sourceReferencePx × scale`, preservando frações e coordenadas negativas;
- cantos usam os quatro `logicalVertex` e corredores `production`; paredes e portas usam seus intervalos de R1, e a porta nova não consulta o `offset.xCells = -1` legado;
- bounds de canvas, bounds de alpha, planos e regiões de interação saem da mesma transformação; os cantos expõem a união dos dois braços, não um quadrado transparente de 4×4;
- `structureRenderPlan` agora materializa `structureVisualTransform` para cada placement; `SpatialWorldScene` carrega a textura canônica e aplica `spriteCanvasPosition`, escala e origin `(0,0)` sem offset, pivot, span ou arredondamento adicional;
- `constructionInput`, zonas Phaser, preview e destaque usam as mesmas `interactionRegions`: retas e portas têm uma região e cada canto tem dois braços associados ao mesmo `instanceId`, sem selecionar o grande interior transparente;
- a porta em `(7,14)` conserva planos longitudinais `x=224` e `x=352`; renderer e hit testing não consultam mais a correção histórica `offset.xCells=-1`;
- `WALL_ASSETS` e os campos `visualOffsetCells`, `visualSpanCells` e `pivot` continuam exportados somente para compatibilidade; nenhum consumidor estrutural ativo em `SpatialWorldScene`, `structureRenderPlan` ou `constructionInput` os lê;
- na entrega de R3-B, o depth numérico e o algoritmo procedimental de fallback foram preservados; a revisão de depth ocorreu somente em R3-C-A, e o fallback permanecia pendente naquele gate;
- 25 testes novos cobrem os 12 assets, contrato `production`, paredes, quatro cantos, duas portas, planos, imutabilidade, ordem, negativos, bounds, regiões, rejeições, isolamento dos offsets legados e os oito encontros da sala canônica.
- R3-B acrescenta cobertura focada de projeção Phaser, 12 definições coerentes entre renderer e input, porta sem uma célula extra, frações/negativos, quatro cantos compostos, interseção sem seleção duplicada, lifecycle estável e depth inalterado; a matriz consolidada R1 + R3-A + R3-B passou com 105 testes em nove arquivos.
- R3-B foi aceita nominalmente pelo usuário antes da autorização exclusiva de R3-C-A;
- o depth estrutural antigo `10|50 + joinOrigin.y` foi substituído por uma autoridade pura: `visualSortY` é a borda inferior da união das regiões ocupadas, e `depth = 40 + visualSortY ± 0,25` posiciona as bandas traseira/frontal imediatamente atrás/à frente de um interior com a mesma base visual;
- `structureRenderPlan` calcula o depth uma vez, ordena empates numericamente iguais pela chave estável do placement e entrega o valor pronto à cena; reordenar placements não muda a ordem visual;
- os 12 assets, negativos, coordenadas visuais fracionárias, movimento, orientação, portas e quatro cantos são cobertos; posição, escala, planos e hit regions de R3-B permanecem inalterados, e a matriz consolidada R1 + R3-A + R3-B + R3-C-A passou com 118 testes em dez arquivos;
- móveis continuam com `40 + y + footprint.height`; zonas estruturais permanecem em 80, destaque em 89 e preview em 90. Nenhuma regra desses consumidores foi alterada, e não há personagem na `SpatialWorldScene` ativa;
- R3-C-A foi aceita nominalmente antes da autorização exclusiva de R3-C-B1;
- o fallback anterior era ativado somente por textura estrutural indisponível e, embora já recebesse posição/depth do plano, recompunha a forma com span lógico, espessura `0,72` célula e um “L” fixo, perdendo orientação dos cantos e a diferença visual entre portas;
- `structureVisualFallback.ts` deriva bounds, planos e regiões de desenho diretamente do mesmo `structureVisualTransform` usado pelo sprite e recebe sem recomposição o depth de R3-C-A; cada plano é validado contra o perfil da região visível correspondente;
- retas usam uma região medida, cantos usam exatamente dois braços sem preencher o interior transparente e portas aberta/fechada preservam alturas distintas e planos `x=224..352`, sem o offset legado;
- textura disponível continua criando somente o sprite normal de R3-B; textura indisponível cria exatamente um Graphics sem hit area ou evento alternativo, vinculado ao `instanceId` e destruído no rerender, remoção, shutdown ou transição para textura disponível;
- a baseline de 118 testes passou antes da escrita; helper+cena passaram com 18 casos e a matriz consolidada R1 + R3-A + R3-B + R3-C-A + R3-C-B1 passou com 134 testes em 11 arquivos;
- R3-C-B1 foi aceita nominalmente antes da autorização de R3-C-B2; fallback canônico foi implementado em B1, enquanto B2 é somente sua comprovação visual no renderer ativo;
- R3-C-B2 usa estado descartável e o factory Phaser real pela cadeia `WorldStructureState → structureRenderPlan → structureVisualGeometry → SpatialWorldScene → canvas`; sete screenshots diretos e um manifesto foram preservados em `art-guides/w3-a-r3-c-b2/`;
- a matriz visual final executou nove casos: oito passaram, sem erro de console, exceção Phaser, warning ou falha de request; o nono reprovou a colinearidade dos perfis visíveis, mantendo B2 tecnicamente aberta;
- na parede direita canônica, `corner-se`/`corner-ne` ocupam `x=454,826667..480`, enquanto `vertical-2` ocupa `x=480..505,066667`; planos em `y=256/320` coincidem, mas a centerline salta aproximadamente `25,12` world units/px;
- o cômodo modificado repete a troca em `(17,6)` e `(17,11)`; `fallback-detail.png` também a mostra porque o fallback reproduz corretamente a geometria canônica atual, sem sprite simultâneo;
- lados esquerdo e superior permanecem colineares dentro da tolerância de um pixel-fonte; o lado inferior expõe a mesma ausência de normal transversal, com paredes lineares ao sul dos braços dos cantos e salto de `45,76` world units entre centerlines no cenário modificado;
- a causa não é corrupção dos PNGs: o contrato/validação individual não define centerline, normal ou lado ocupado do placement, e a composição anterior não comparava os `profile` transversais entre peças vizinhas. Assets lineares são projetados sempre para o lado positivo pelo `sourceReferencePx`, enquanto braços leste/sul dos cantos ocupam o lado negativo;
- nenhum arquivo de produção foi alterado em B2 ou na recuperação; a baseline 134/134 foi reutilizada conforme autorizado. Uma correção visual exige autorização nominal separada.
- `format:check`, `typecheck`, PNGs/manifesto e `git diff --check` passam; o lint global permanece vermelho somente por quatro parâmetros não usados no teste preexistente `SpatialWorldScene.test.ts:70/72`, fora do escopo desta recuperação, enquanto o harness B2 está limpo.
- FIX-A ampliou `WorldJoinPlane` com endpoint lógico, eixo longitudinal, normal transversal assinada, intervalo relativo ao eixo, lateral ocupada, centerline, espessura e tolerância de exatamente um pixel-fonte convertido; `side` continua significando somente o lado longitudinal;
- `structureVisualContinuity.ts` agrupa vizinhos por endpoint lógico + eixo, compara planos com tolerância longitudinal zero e perfis transversais com a maior escala de um pixel-fonte dos participantes, e retorna gaps, overlaps, saltos de centerline, incompatibilidades de lado/intervalo/espessura e endpoints sem par de forma tipada e determinística;
- a regressão pura de FIX-A cobre entradas sintéticas válidas/inválidas, negativos/frações, escalas diferentes, paredes 1/2/4, quatro cantos, portas, fallback e as composições B2 canônica/modificada/door-states; a sala canônica produz 8 junções (4 compatíveis/4 incompatíveis), a modificada 15 (10/5) e o cenário de portas 8 (2/6);
- o oráculo reproduz `25,12` world units nos encontros direitos e `45,76` na junção inferior reta/canto modificada; renderer, hit testing, depth, fallback, preview, destaque, PNGs e evidências não foram corrigidos nem regenerados.
- a regressão isolada de FIX-A passou com 16/16 e a matriz focada final, com 150/150 em 12 arquivos; formatação, typecheck, assets, guias e `git diff --check` passam, e o lint conserva somente as quatro falhas preexistentes autorizadas em `SpatialWorldScene.test.ts:70/72`.
- Sam aceitou nominalmente FIX-A e aceitou a parada sem escrita da tentativa inicial de FIX-B; FIX-B1 e o reparo de inicialização foram depois aceitos, e FIX-B2 foi autorizada nominalmente;
- FIX-B1 elevou `wall-corner-contract.json` à versão 2 e nomeou a classe única `stone-01-horizontal-corridor`, referenciada pelas retas horizontais, pelos braços horizontais dos quatro cantos e por ambos os endpoints das portas;
- o perfil estrutural contínuo é `[24,453)` em pixels-fonte, espessura 429 px ou `45,76` world units; `SourceJoinPlane.profile`/`WorldJoinPlane.profile` o carregam, enquanto `visualProfile`, `alphaBoundsPx` e `occupiedRegionsPx` preservam folha, moldura, arco, sombra e outras projeções no envelope visual;
- a checagem read-only nos dois endpoints encontrou uma única linha sem alpha em cada faixa da porta fechada e aberta, dentro da tolerância preexistente de um pixel-fonte; nenhuma segmentação por componentes ou ampliação de tolerância foi usada;
- após B1, o oráculo preserva 4/8 junções compatíveis na sala canônica, evolui a composição modificada de 10/15 para 11/15 e a composição de portas de 2/8 para 4/8; nenhuma incompatibilidade de espessura causada pela porta permanece, e as falhas restantes são somente as transversais ainda destinadas a FIX-B2;
- a matriz focada passou com 171/171 testes em 14 arquivos. `format`, `format:check`, typecheck, assets, guias e `git diff --check` passam; o lint conserva somente os quatro erros preexistentes em `SpatialWorldScene.test.ts:70/72`. O contrato e o relatório derivado mudaram, mas gabaritos, montagens, 24 PNGs estruturais e oito evidências B2 permaneceram byte a byte idênticos.
- antes de FIX-B2, a falha real do host foi reproduzida como `TypeError` em `SpatialWorldScene.runtimeSnapshot()`: o diagnóstico era consultado depois da criação do `Phaser.Game`, mas antes de `create()` injetar `tweens` e `children`. O snapshot agora devolve zeros tipados enquanto `rendered === false`; depois do render, continua lendo os contadores reais. A matriz focada passou com 172/172, typecheck e build passaram, e o navegador confirmou estado `ready`, 1 instância ativa, 1 canvas visível, 67 display objects e 2 zonas interativas;
- FIX-B2 acrescenta uma resolução pura por aresta unitária: um único lado adjacente de piso resolve norte/sul/leste/oeste; zero, ambos, suporte misto ou lados contraditórios produzem diagnóstico tipado e preservam a posição. Cada braço de canto é independente, e o render plan passa esse contexto explicitamente à transformação;
- a transformação converte o perfil medido no alvo semiaberto `[0,t)` ou `[-t,0)` e aplica `target.start − measured.start` uma vez ao sprite. Retas horizontais e portas movem somente `y`, retas verticais somente `x`, e os cantos combinam as duas restrições; discordância do mesmo eixo além de um pixel-fonte preserva a posição sem média;
- nas três composições preservadas, todas as normais foram resolvidas e o oráculo passou de 4/8, 11/15 e 4/8 para 8/8, 15/15 e 8/8: 31/31, sem issue transversal ou longitudinal. A parede direita canônica translada `-25,066667` em `x` e a porta inferior, `-45,76` em `y`, ambos derivados dos perfis;
- a matriz R1/R3/FIX-A/B1/B2 passou com 203/203 testes em 15 arquivos; o conjunto direto com host passou com 131/131 em sete arquivos; typecheck, build, formatação, assets, guias e `git diff --check` passaram. O lint manteve somente os quatro erros preexistentes em `SpatialWorldScene.test.ts:86/88`;
- o navegador controlável não estava disponível nesta sessão após a implementação. O host automatizado prova `ready`, uma instância e um canvas, e o build passa, mas a reconfirmação visual ao vivo permanece explicitamente pendente; nenhuma captura/E2E B2 foi repetida.
- o smoke humano posterior no Firefox confirmou `ready`, uma instância ativa, um canvas, seleção funcional e alinhamento das paredes direita/inferior e da porta; a repetição oficial preservou a sobrecobertura longitudinal de 14 px-fonte;
- a primeira continuação da repetição foi interrompida porque o oráculo E2E ainda exigia escala uniforme; uma segunda tentativa isolou `(6,2)` por comparação RGB, mas a composição alpha provou 0 pixels transparentes na matriz 11×46 e nenhum canal transversal. A checagem final usa conectividade alpha 4 e 8 na faixa estrutural inteira;
- o Playwright final passou 9/9 duas vezes no Chromium `151.0.7922.34`; o manifesto registra 8/8 emendas canônicas, 15/15 modificadas e 8/8 de portas, todas sem canal conectado. Os testes focados passaram 78/78; typecheck, lint, build, 12 assets e `git diff --check` passaram.

## Próxima etapa de produto

R3-C-B2, R4, R5, o gate final pré-R6 e R6 estão encerrados; R6 foi aprovada pelo usuário no Moto G06 com as duas ressalvas não bloqueadoras registradas acima. A rodada corretiva W3-A está integralmente encerrada. A próxima etapa de produto ainda não foi iniciada, e o desempenho físico permanece sem aprovação ou declaração de resolução.

O ponto de retomada conciso está em [`W3_A_CORRECTION_HANDOFF.md`](W3_A_CORRECTION_HANDOFF.md); o histórico completo permanece em [`W3_A_CORRECTION_LOG.md`](W3_A_CORRECTION_LOG.md).
