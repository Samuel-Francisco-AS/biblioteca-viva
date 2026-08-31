# W3-A — log de correção

> Estado documental: **R0 aceito para prosseguimento**. R1-A e R1-B estão tecnicamente concluídas e aguardam aceite humano conjunto. W3-A-R2-A permanece pendente e não autorizada.

## Resultado do gate W3-A-R0

A validação física posterior ao P3-C reabriu W3-A. O Moto G06 demonstrou dois defeitos objetivos: a planta inicial não é percebida como uma sala contínua e o painel “Peças colocadas” retira do mapa o papel de superfície principal durante seleção e movimento.

R0 é exclusivamente diagnóstico. A auditoria não alterou código de produção, testes, PNGs, schema, backup, blueprint, grants, migrações, máquina de estados ou UI. Os artefatos temporários usados para inspecionar os PNGs e reconstruir a composição ficaram fora do repositório.

O usuário aceitou R0 para prosseguimento ao autorizar nominalmente a execução de W3-A-R1. Esse aceite encerra somente o bloqueio diagnóstico de R0; não aprova automaticamente R1 nem qualquer gate posterior.

## Estado Git

- commit-base: `b64d18f14ebaaaf649a6bbe19dc04f09321255fd` (`feat: integrate structural progression`);
- branch: `main`, 29 commits à frente de `origin/main` no início de R0;
- fingerprint inicial do `git status --porcelain=v1`: `b97f0362ee3fe2684dc5f6175a17b25c66b81e14921544255fc90434e578e064`;
- worktree inicial: 30 arquivos rastreados modificados e 1 arquivo não rastreado, todos preexistentes e preservados;
- nenhum commit, tag, push, rebase ou reset foi executado em R0.

Estado inicial da worktree:

```text
 M CHANGELOG.md
 M README.md
 M docs/00_LEIA-ME.md
 M docs/ACCESSIBILITY.md
 M docs/ARCHITECTURE.md
 M docs/ASSET_REGISTRY.md
 M docs/ASSET_SPEC.md
 M docs/AUDIO.md
 M docs/DECISIONS.md
 M docs/EXECUTION_PLAN.md
 M docs/MAINTENANCE.md
 M docs/PERFORMANCE.md
 M docs/PRODUCT.md
 M docs/ROADMAP.md
 M docs/STATUS.md
 M docs/TEST_PLAN.md
 M docs/WORLD_MODEL.md
 M e2e/construction-editor.spec.ts
 M e2e/search-and-backup.spec.ts
 M playwright.config.ts
 M src/application/world.test.ts
 M src/features/library-visual/ConstructionControls.tsx
 M src/features/library-visual/phaser/wallComposition.ts
 M src/infrastructure/backup/backupCodec.ts
 M src/infrastructure/database/migrationV4.test.ts
 M src/infrastructure/database/migrationV5.test.ts
 M src/infrastructure/experience/experienceSettingsRepository.test.ts
 M src/pages.test.tsx
 M src/pages.tsx
 M src/styles.css
?? src/infrastructure/database/migrationV7.test.ts
```

O estado final deve conter exatamente esse conjunto preexistente, mais as alterações documentais de R0 em `docs/STATUS.md`, `docs/ROADMAP.md` e neste arquivo. A conferência final está no fim deste registro.

## Mapa de arquivos e responsabilidades reais

| Responsabilidade | Autoridade real | Observação de R0 |
|---|---|---|
| Tipos, catálogo, células, arestas, placements, blueprint e inventário | `src/application/worldStructure.ts` | `GridPoint` representa célula, âncora ou vértice conforme o uso; não existe entidade `Vertex`. |
| Regras de place/move/rotate/store e piso | `src/application/worldStructureEditing.ts` | Valida conflito de aresta, proximidade do piso, inventário e revisão; não exige fechamento global da sala. |
| Bootstrap e concorrência persistente | `src/infrastructure/database/worldStructureRepository.ts` | Cria `world.main` somente se ausente e preserva o estado existente. |
| Schema Dexie | `src/infrastructure/database/schema.ts`, `database.ts` | `worldStructures` pertence ao schema v7. |
| Backup/restauração | `src/infrastructure/backup/backupCodec.ts`, `dexieBackupStore.ts` | Backup v5 aceita estrutura opcional; restore substitui `worldStructures` dentro da transação. |
| Compatibilidade de `PlacedObject` | `src/application/world.ts`, `worldStructureObjects.ts` | `space-a` e `space-b` legados apontam para o mesmo footprint do cômodo 12×10. |
| Projeção estrutural para render | `src/features/library-visual/phaser/structureRenderPlan.ts` | Projeta somente placements explícitos; não recompõe limites a partir do piso. |
| Metadados runtime dos 12 PNGs | `src/features/library-visual/phaser/wallAssets.ts` | É uma segunda fonte de offset/pivô/span, separada do catálogo da aplicação. |
| Carregamento, compositor efetivo e depth | `src/features/library-visual/phaser/SpatialWorldScene.ts` | Aplica `offset`, `pivot`, escala e depth a cada sprite; `wallComposition.ts` não é chamado no runtime atual. |
| Mapeamento de tela, snap e hit areas | `src/features/library-visual/phaser/constructionInput.ts` | Hit areas usam o offset do catálogo de aplicação, enquanto sprites usam o offset de `wallAssets.ts`. |
| Estado React da rota | `src/pages.tsx` | Controla modo, ferramenta, seleção, placing, moving, projeção, inventário e toast. |
| Estado local e DOM do editor | `src/features/library-visual/ConstructionControls.tsx` | Controla sheet, confirmação e célula focal; renderiza sempre a alternativa completa. |
| Layout, overlay, scroll e safe areas | `src/styles.css` | A rota fixa o stage em `100dvh` com overflow oculto; o painel da construção é o scroll owner. |
| Android Back | `src/useAndroidBackButton.ts` | Na rota `/`, encerra o app sem consultar os subestados da construção. |
| Validação dos PNGs | `scripts/process-wall-assets.mjs` | Confere formato e tamanho do conteúdo alfa, mas a medição atual perde o offset real do conteúdo no canvas. |
| Cobertura automatizada | `src/application/worldStructure.test.ts`, testes Phaser/React e `e2e/construction-editor.spec.ts` | Prova contratos lógicos e fluxo desktop; não prova a composição visual nem o editor em viewport mobile. |

## A. Geometria e dados

### Representação e catálogo

- `WorldStructureState` persiste `id`, `blueprintVersion`, timestamps, `floorCells`, `placements` e `revision`.
- Uma célula de piso é o quadrado cujo vértice noroeste é `(x, y)`.
- Uma `UnitEdge` começa em `(x, y)` e ocupa uma unidade no eixo `horizontal` ou `vertical`.
- Parede e porta ocupam 1, 2 ou 4 arestas conforme `visualSpanCells`; cada canto ocupa dois braços de quatro arestas.
- As orientações de canto são `ne | nw | se | sw`; paredes usam `horizontal | vertical`. Porta vertical não existe.
- `validateWorldStructure` rejeita ID, revisão ou versão inválidos, células/instâncias duplicadas e arestas sobrepostas. Ele não compara placements com o perímetro do piso, não exige ciclo fechado e não rejeita uma peça desconectada.

### Planta inicial calculada

O piso ocupa `x=3..14` e `y=4..13`: 12×10, total de 120 células. O perímetro dessa região contém 44 arestas unitárias: 12 norte, 12 sul, 10 oeste e 10 leste.

| Família | Concedido inicial | Colocado | Disponível | Placements da planta |
|---|---:|---:|---:|---|
| piso de madeira | 144 | 120 | 24 | 120 células |
| parede curta | 2 | 0 | 2 | nenhuma |
| parede média | 4 | 2 | 2 | uma vertical à esquerda e uma à direita |
| parede longa | 2 | 1 | 1 | uma horizontal no topo |
| canto de pedra | 5 | 4 | 1 | quatro orientações |
| porta horizontal | 1 | 1 | 0 | fechada, no centro inferior |

O inventário é por família física. A UI percorre variantes do catálogo e repete a mesma disponibilidade em cada orientação; os números repetidos não são estoques independentes.

### Cobertura e conexão lógica

| Verificação do blueprint v1 | Resultado |
|---|---:|
| arestas de perímetro esperadas | 44 |
| arestas reivindicadas pelos 8 placements | 44 |
| arestas descobertas | 0 |
| arestas extras fora do perímetro | 0 |
| arestas sobrepostas/duplicadas | 0 |
| componentes do contorno, tratando a porta como estrutura | 1 ciclo fechado |

A planta inicial é, portanto, contínua no modelo lógico. O teste existente chamado “continuous initial rectangle” não prova esse resultado completo: ele verifica contagem de piso, ausência de duplicação e bounds, mas não compara o conjunto de arestas com o perímetro esperado.

Layouts editados podem legitimamente deixar de ser um ciclo: as regras atuais exigem ao menos uma aresta adjacente a piso e ausência de conflito, não fechamento do cômodo.

### Porta

- placement: âncora `(7,14)`;
- ocupação lógica: quatro arestas horizontais `x=7..10`, `y=14`;
- passagem declarada por `passableEdges`: as duas arestas centrais `x=8..9`, mas somente para a definição `closed`; a função não possui consumidor no runtime e retorna vazio para `open`;
- estado efetivamente usado pelo blueprint: `closed`;
- asset: 1.248×612 px, conteúdo alfa de 1.200×564 px;
- transformação visual: o renderer aplica `offset.xCells=-1`, posicionando o canvas uma célula à esquerda da ocupação lógica;
- hit area: também usa `-1`, por uma cópia separada do metadado.

Esse deslocamento cria sobreposição visual à esquerda e falta de uma célula à direita, embora a porta feche logicamente o contorno.

### Versão e fingerprint

`blueprintVersion=1` identifica a versão declarada do blueprint, mas continua igual depois de place, move, rotate, store ou edição de piso. `revision` aumenta em edições, porém não comprova identidade canônica após restore ou importação. Não existe fingerprint persistido nem função canônica capaz de distinguir com segurança “blueprint v1 intocado” de toda construção modificada.

Uma migração futura não pode substituir todo estado com `blueprintVersion=1`. O mínimo seguro é comparar a geometria normalizada com uma assinatura explícita do blueprint v1 antes de qualquer conversão; estado divergente deve ser preservado e encaminhado à decisão humana.

## B. Renderização e assets

### Pipeline efetivo

```text
WorldStructureState
→ structureRenderPlan (âncora em world units)
→ WALL_ASSETS (offset/pivô/escala/depth)
→ SpatialWorldScene.renderWallPiece
→ sprite Phaser com origin (0,0), escala 32/300 e filtering LINEAR
```

`wallComposition.ts` é um compositor histórico por limites de piso e não possui import de produção no estado atual. As mudanças preexistentes nesse arquivo foram preservadas e não explicam a planta renderizada por `WorldStructureState`.

### Origins, offsets, depth e hit areas

- todos os sprites estruturais usam pivot/origin `(0,0)`;
- escala comum: `32/300 = 0,106666…` world unit por pixel-fonte;
- segmentos usam offset `(0,0)`;
- cantos: `ne=(-4,-4)`, `nw=(0,-4)`, `se=(-4,0)`, `sw=(0,0)` células;
- porta horizontal: `(-1,0)` célula;
- `ne`, `nw`, portas e segmentos usam `architecture-back`; `se` e `sw` usam `architecture-front`;
- depth calculado: `10 + anchor.y` para back e `50 + anchor.y` para front. O valor usa a coordenada de grade, não `anchor.y * CELL_SIZE`;
- zonas de seleção ficam em depth 80 e usam retângulos lógicos. Um canto recebe hit area 4×4 células, inclusive sobre pixels transparentes;
- sprite e hit area consultam catálogos diferentes. Não existe teste que exija igualdade entre os dois offsets.

### Inspeção dos 12 PNGs em resolução original

Fontes em `art-source/` e cópias runtime têm zero pixels diferentes. Todos são sRGBA com alpha mínimo 0 e máximo 1. A tabela usa o bounding box alfa real antes de trim; padding está na ordem esquerda/topo/direita/base.

| PNG | Canvas px | Bounds alfa reais | Padding px | Canvas em world units | Alfa em world units |
|---|---:|---:|---:|---:|---:|
| `wall-corner-ne.png` | 1248×1182 | 1200×1134+24+24 | 24/24/24/24 | 133,12×126,08 | 128,00×120,96 |
| `wall-corner-nw.png` | 1218×1248 | 1170×1200+24+24 | 24/24/24/24 | 129,92×133,12 | 124,80×128,00 |
| `wall-corner-se.png` | 1248×1170 | 1200×1122+24+24 | 24/24/24/24 | 133,12×124,80 | 128,00×119,68 |
| `wall-corner-sw.png` | 1248×1157 | 1200×1109+24+24 | 24/24/24/24 | 133,12×123,41 | 128,00×118,29 |
| `wall-door-horizontal-closed.png` | 1248×612 | 1200×564+24+24 | 24/24/24/24 | 133,12×65,28 | 128,00×60,16 |
| `wall-door-horizontal-open.png` | 1248×788 | 1200×740+24+24 | 24/24/24/24 | 133,12×84,05 | 128,00×78,93 |
| `wall-horizontal-1cell.png` | 348×477 | 300×429+24+24 | 24/24/24/24 | 37,12×50,88 | 32,00×45,76 |
| `wall-horizontal-2cell.png` | 648×477 | 600×429+24+24 | 24/24/24/24 | 69,12×50,88 | 64,00×45,76 |
| `wall-horizontal.png` | 1248×477 | 1200×429+24+24 | 24/24/24/24 | 133,12×50,88 | 128,00×45,76 |
| `wall-vertical-1cell.png` | 284×348 | 235×300+25+24 | 25/24/24/24 | 30,29×37,12 | 25,07×32,00 |
| `wall-vertical-2cell.png` | 284×648 | 235×600+25+24 | 25/24/24/24 | 30,29×69,12 | 25,07×64,00 |
| `wall-vertical.png` | 284×1248 | 236×1200+24+24 | 24/24/24/24 | 30,29×133,12 | 25,17×128,00 |

O check atual relata, por exemplo, `1200x1134+0+0` porque executa `-trim` antes de `%@`. Assim ele valida o tamanho do conteúdo recortado, mas não a posição `+24+24` no canvas original. A documentação anterior de “48 px à direita/abaixo” não descreve os arquivos reais: há 24 px em cada lado, salvo a margem esquerda de 25 px em dois verticais.

### Planos de junção e origem dos vãos

Segmentos horizontais têm exatamente 300/600/1200 px de conteúdo no eixo longitudinal; verticais têm exatamente 300/600/1200 px no eixo longitudinal. O padding simétrico desloca os planos de encontro em 24 px, mas peças consecutivas da mesma família ainda se encontram no mesmo plano quando seus spans são corretos.

Os cantos declaram braços de 1.200 px nos dois eixos, mas o conteúdo real é menor em um deles:

| Canto | Déficit contra 1200 px | Efeito na planta v1 |
|---|---:|---|
| `ne` | 66 px no eixo Y = 7,04 world units | braço/horizontal inferior não alcança o plano lógico |
| `nw` | 30 px no eixo X = 3,20 world units | braço horizontal não alcança a peça seguinte |
| `se` | 78 px no eixo Y = 8,32 world units | braço vertical termina antes do segmento direito |
| `sw` | 91 px no eixo Y = 9,71 world units | braço vertical termina antes do segmento esquerdo |

A reconstrução temporária da planta com os offsets e dimensões reais reproduziu: topo contínuo; vãos entre os cantos superiores e os segmentos verticais; junções inferiores incompletas; porta sobreposta ao canto esquerdo e separada do canto direito. Não foi aplicado crop, normalização ou edição aos assets.

Classificação causal:

| Sintoma | Geometria lógica | Metadado | Compositor | Conteúdo PNG |
|---|---|---|---|---|
| vãos dos braços de canto | íntegra | span declara 4×4 sem bounds/planos reais | confia no span e aplica escala única | braço real é 30–91 px menor |
| porta deslocada | ocupa as quatro arestas corretas | `offset.xCells=-1` em dois catálogos | aplica o offset literalmente | largura longitudinal é correta |
| sobreposição porta/canto esquerdo | sem aresta duplicada | causada pelo offset | door e corner podem compartilhar área visual | conteúdos se sobrepõem |
| separação porta/canto direito | sem aresta descoberta | causada pelo offset e pelo canto | não compensa plano de junção | canto `ne` também não alcança Y lógico |
| seams finos entre módulos do mesmo eixo | contínua | não há perfil de seam | LINEAR pode tornar alpha parcial perceptível | bordas foram produzidas separadamente e têm alpha/contorno irregulares |

Não há evidência de que mudar `CELL_SIZE`, câmera ou piso corrija esses vãos. O defeito está no contrato entre arte, metadado e compositor.

## C. Interação e responsividade

### Estados que coexistem atualmente

| Estado | Dono | Pode coexistir com |
|---|---|---|
| `constructionMode` | `pages.tsx` | todos os subestados e overlays abaixo |
| ferramenta `explore/select/place-structure/paint-floor/remove-floor` | `pages.tsx` | seleção, sheet e toast |
| `selectedStructureId` | `pages.tsx` | moving, placing, sheet, alternativa e confirmação |
| `movingStructureId` | `pages.tsx` | seleção permanece definida |
| `placingStructureDefinitionId` | `pages.tsx` | seleção pode permanecer definida |
| sheet `structures/floor` | `ConstructionControls.tsx` | seleção e alternativa completa |
| `confirmStore` | `ConstructionControls.tsx` | seleção, alternativa e demais overlays |
| célula focal/ferramenta de piso | `ConstructionControls.tsx` | seleção anterior não é limpa |
| inventário e progresso | projeção React | sempre visíveis quando o painel correspondente abre |
| toast `placementNotice` | `pages.tsx` | construção, sheet, seleção e overlays da Biblioteca |
| bottom sheet da Biblioteca | `pages.tsx` | pode ser aberto pelo acionador que continua presente durante construção |
| room explorer, resumo acessível e botão de resumo | `pages.tsx` | continuam montados durante construção |
| gesto/preview/floor batch | `SpatialWorldScene.ts` | efêmeros no Phaser, sem autoridade sobre o DOM |

### Por que “Peças colocadas” permanece

`ConstructionControls` renderiza `.construction-alternative` incondicionalmente para todo `structure.placements`. Não existe estado de colapso, paginação, viewport ou condição por ferramenta. A lista inicial já contém oito placements e cada item vira um botão.

Ao tocar “Mover”, `pages.tsx` define `movingStructureId` e muda a ferramenta para `place-structure`, mas não limpa `selectedStructureId`. Portanto, a alternativa continua montada e `.construction-selection`, declarada depois dela no DOM, é empilhada abaixo. A lista também continua durante `placing`, `paint-floor`, `remove-floor` e sheets.

### Por que o mapa deixa de ser principal

- `.library-stage` tem `height:100dvh` e `overflow:hidden`; o documento não rola nessa rota.
- `.construction-controls` é absoluto no canto inferior direito, com `max-width:min(20rem, 100vw - 1.5rem)`, `max-height:calc(100dvh - 5rem)` e `overflow-y:auto`.
- Em 320×640 CSS px, o envelope permitido chega a 296×560 px: 92,5% da largura, 87,5% da altura e 80,9% da área da viewport. O próprio `aside`, mesmo transparente entre cartões, participa do hit testing e intercepta o canvas sob seu retângulo.
- O scroll pertence ao painel, não ao documento/mapa. O cartão de seleção pode existir abaixo da dobra interna, obrigando scroll antes de manipular.
- Toolbar, room explorer, botão de resumo, resumo acessível e toast não são mutuamente exclusivos com o editor.

### Safe areas, Escape e Android Back

- construção aplica apenas `right` e `bottom` com safe area; não reserva explicitamente `top`/`left`;
- o `max-height` não subtrai `safe-area-inset-top`, o header fixo nem a margem inferior efetiva;
- Escape segue a ordem confirmação → sheet → seleção → sair do modo, mas não há reducer único para os demais overlays;
- o bottom sheet possui outro handler de Escape e pode coexistir com a construção;
- Android Back é tratado globalmente. Em `/`, chama `exitApp()` sem consultar modo, sheet, seleção, moving ou confirmação. Não equivale à hierarquia de Escape.

### Testes que não detectaram a regressão

| Cobertura existente | Lacuna objetiva |
|---|---|
| `e2e/construction-editor.spec.ts` | fixa 1280×800; usa deliberadamente `.construction-alternative`; não mede obstrução, scroll interno, safe areas nem elemento fora da viewport |
| E2E de layout mobile | visita `/` em 320/360/412 px, mas nunca entra em Construção |
| teste React “propaga a instância em movimento” | verifica `movingInstanceId`, mas não exige que seleção/lista/sheet sejam fechados |
| testes de Escape | cobrem saída sem subestado; não cobrem coexistência nem Android Back |
| `structureRenderPlan.test.ts` | conta peças e orientação da porta; não verifica coordenadas visuais ou planos de junção |
| `wallAssets.test.ts` e `wall-assets:check` | validam catálogo, dimensões e tamanho alfa aparado; não preservam offset do alpha bbox nem comparam perfis das bordas |
| teste do blueprint | não compara o conjunto de arestas com o perímetro e não compõe os PNGs |
| jsdom | não calcula layout CSS, viewport real, overflow ou cobertura do canvas |

Uma tentativa de medir a UI em Chromium local não prosseguiu porque o binário Playwright não está instalado no ambiente atual. R0 não instalou navegador, não executou a matriz E2E e não transforma a observação física do Moto G06 em alegação de browser.

## Causa-raiz consolidada

### Geometria

O blueprint v1 fecha corretamente o perímetro, mas os validadores e testes são mais fracos que o nome sugere: não há invariante geral de boundary/closure/conexão. A geometria lógica não é a causa dos vãos observados na planta canônica.

### Assets/compositor

Os quatro cantos não cumprem os dois spans de 1.200 px declarados; a porta recebe offset visual de uma célula; compositor e hit testing leem metadados duplicados; depth e origin são aplicados sem contrato de planos de junção. O check de assets perde a posição real do conteúdo alfa. Esses fatores reproduzem vãos e sobreposição mesmo com arestas lógicas perfeitas.

### Blueprint/dados

O blueprint mistura ocupação lógica de quatro arestas, uma passagem central de duas e um asset deslocado para a esquerda. `blueprintVersion` não distingue estado canônico de estado editado e não existe fingerprint. Bootstrap idempotente impede que uma constante corrigida substitua instalações existentes — proteção correta contra perda, mas risco para uma futura correção automática ingênua.

### UI/estado

A alternativa acessível foi implementada como lista permanente dentro do overlay principal. Estados independentes permitem seleção + moving + sheet + lista + toast e overlays convencionais. CSS entrega quase toda a viewport ao scroll do painel. Android Back não participa dessa hierarquia.

## Contrato e execução de R1–R5

O aceite de R0 autorizou exclusivamente R1-A e, em complementação nominal posterior, R1-B. Nenhum gate a partir de R2-A foi autorizado.

### R1 — geometria canônica e identidade

**Estado:** `tecnicamente concluída — aguardando aceite humano`. Este estado reúne R1-A e R1-B e não registra nem presume aprovação humana.

#### R1-A — geometria lógica, rotação e porta — concluída

O contrato anterior derivava ocupação lógica de `visualSpanCells`, expandia placements diretamente em arestas unitárias e não representava endpoints, intervalos ou o vértice ocupado por um canto. Assim, ele detectava uma aresta repetida, mas não conseguia distinguir deterministicamente gap, overlap, intervalo duplicado, conexão colinear, conexão perpendicular de canto ou porta anexada fora de um vão. `passableEdges` também estava invertido: a porta fechada expunha as duas arestas centrais e a aberta não expunha passagem.

R1 separou o span lógico mínimo no catálogo e introduziu uma geometria pura normalizada: segmento com eixo, início, fim e span inteiro positivo seguro; canto com vértice e braços horizontal/vertical; parede e porta com intervalo explícito. As validações ordenam cópias dos dados, nunca corrigem nem mutam o estado recebido, e retornam erros específicos para eixo incompatível, não colinearidade, gap, overlap, duplicidade, endpoint incorreto, canto incompatível e porta externa. Coordenadas inteiras negativas continuam válidas; coordenadas ou endpoints fora de `Number.isSafeInteger` são rejeitados como já ocorre na fronteira Zod.

#### Contrato adotado

- paredes de 1, 2 e 4 células nos eixos horizontal e vertical usam `logicalSpanCells`; `placementEdges` não consulta offset, pivot, alpha, bounding box, tamanho de PNG nem `visualSpanCells`;
- dois segmentos colineares válidos compartilham exatamente um endpoint; leitura em qualquer ordem produz a mesma ordenação e o mesmo resultado;
- cada orientação `ne | nw | se | sw` ocupa o vértice-âncora, cria dois braços perpendiculares de quatro células e só aceita vizinhos nas extremidades livres compatíveis;
- porta horizontal aberta ou fechada ocupa quatro arestas na mesma linha entre dois intervalos; uma porta externa, sobreposta ou usada como vizinha de outra porta é inválida;
- porta fechada não expõe passagem; porta aberta expõe somente as duas arestas centrais sem alterar o intervalo estrutural externo;
- intervalos exatos, overlaps parciais e dois cantos no mesmo vértice são inválidos; a validação de `WorldStructureState` reutiliza essa ocupação normalizada;
- rotação é uma função pura compartilhada pelo caso de uso: muda o eixo das paredes 1/2/4 e preserva o span; cantos conservam o ciclo já existente;
- a planta inicial foi preservada e continua com 120 células de piso e 44 arestas estruturais únicas; a porta inferior foi validada entre os braços dos dois cantos reais.

#### R1-B — analisador puro de perímetro — concluída

`deriveFloorPerimeterEdges` cancela somente arestas internas compartilhadas e deriva um conjunto unitário ordenado para formas retangulares, côncavas, com buracos e com múltiplos componentes. Célula repetida ou coordenada fora de inteiro seguro retorna erro; a entrada não é deduplicada nem corrigida silenciosamente.

`analyzeStructurePerimeter` compara esse perímetro com todas as arestas produzidas pelos placements e retorna, sem mutar o estado:

- `perimeterEdges` e `structuralEdges` únicos e ordenados;
- `missingEdges`, `extraEdges` e `duplicateEdges` em listas separadas;
- `connectedComponents`, cada um com arestas, graus de vértice e diagnóstico próprio de fechamento;
- `endpoints` e `incompatibleDegrees` ordenados;
- `closed`, que só é verdadeiro quando há perímetro, cobertura exata, ausência de duplicidade e grau 2 em todos os vértices de todos os componentes.

Fechamento permanece diagnóstico: nenhuma classe de edição importa ou consulta o analisador.

Resultado explícito do blueprint v1:

| Medida | Resultado |
|---|---:|
| `floorCells` | 120 |
| arestas de perímetro | 44 |
| arestas estruturais únicas | 44 |
| ausentes | 0 |
| extras | 0 |
| duplicadas/sobrepostas | 0 |
| componentes conectados | 1 |
| endpoints/graus incompatíveis | 0 |
| fechado | sim |

#### R1-B — assinatura e classificador — concluída

`normalizeWorldStructureSignature` produz uma representação ordenada com todas as células e, para cada placement, `definitionId`, âncora, orientação lógica e estado de porta (`open | closed | null`). Timestamps, revisão e IDs de instância são deliberadamente ignorados; diferenças de quantidade ou geometria permanecem na representação.

`worldStructureSignature` serializa essa representação de forma estável, sem hash e sem persistência. `CANONICAL_WORLD_STRUCTURE_V1_SIGNATURE` fixa em memória a assinatura derivada do blueprint v1 explícito. `classifyWorldStructureIdentity` compara a assinatura completa e possui somente três resultados:

- `canonical-v1`: versão 1 exatamente igual ao blueprint canônico, inclusive piso, placements, definições, âncoras, orientações e estado da porta;
- `modified-v1`: versão 1 com qualquer diferença relevante;
- `future/unknown`: qualquer versão diferente de 1, mesmo que a geometria coincida, sem possibilidade de ser tratada como canônica pelo classificador.

#### Arquivos

- R1-A preservada em `src/application/worldStructure.ts`, `src/application/worldStructureEditing.ts` e `src/application/worldStructureGeometry.test.ts`;
- `src/application/worldStructureAnalysis.ts`: perímetro, componentes, graus, normalização, assinatura e classificação puras;
- `src/application/worldStructureAnalysis.test.ts`: regressões focadas de perímetro e identidade;
- `src/application/index.ts`: exportação mecânica do novo contrato puro;
- `docs/W3_A_CORRECTION_LOG.md`: registro operacional reconciliado de R0 e R1.

#### Testes e checks

| Comando | Resultado |
|---|---|
| baseline de R1-A `npx vitest run src/application/worldStructureGeometry.test.ts src/application/worldStructure.test.ts src/application/worldStructureEditing.test.ts` | passou: 32 testes em 3 arquivos |
| focado de R1-A/R1-B `npx vitest run src/application/worldStructureAnalysis.test.ts src/application/worldStructureGeometry.test.ts src/application/worldStructure.test.ts src/application/worldStructureEditing.test.ts` | passou: 53 testes em 4 arquivos |
| `npm run format` | passou |
| `npm run format:check` | passou |
| `npm run lint` | passou |
| `npm run typecheck` | passou |
| `git diff --check` | passou, sem saída |

A cobertura consolidada preserva toda R1-A e acrescenta retângulo, concavidade, buraco, múltiplos componentes, ausência, extra, duplicidade, ordem invertida, não mutação e blueprint v1 para o perímetro. Identidade cobre blueprint intacto; ordem/metadados/IDs ignorados; piso alterado; placement adicionado, removido e movido; orientação, porta e definição alteradas; versões desconhecida e futuras.

#### Limitações e pendências preservadas

- R1 não exige fechamento global para salvar layouts editados; as funções de conexão validam a relação solicitada e `validateWorldStructure` continua responsável por integridade e conflitos de ocupação, não por transformar todo layout em um cômodo fechado;
- `visualSpanCells` permanece apenas para compatibilidade mecânica dos chamadores visuais existentes; nenhuma regra nova de geometria o consulta e nenhuma consolidação de metadado visual foi iniciada;
- o analisador e o classificador não possuem consumidor de escrita: são contratos puros para diagnóstico/decisão posterior e não bloqueiam edição nem autorizam substituição automática;
- a assinatura é calculada em memória, não contém hash persistido e não altera `WorldStructureState`;
- nenhum estado persistido foi regravado; schema v7, backup v5, blueprint, grants, milestones e inventário permaneceram inalterados;
- nenhum arquivo Phaser, React, CSS, PNG ou catálogo visual runtime foi tocado;
- W3-A-R2-A não foi iniciado.

### R2-A — contrato de arte e planos de junção

- escolha humana entre reexportar/normalizar os quatro cantos e declarar insets/join anchors explícitos; não esticar arte silenciosamente;
- fontes preservadas, runtime gerado deterministicamente e IDs estáveis;
- check passa a registrar canvas, bbox com offset real, padding, planos longitudinais e perfis de seam;
- cada braço de canto alcança o plano acordado; porta aberta/fechada compartilham os mesmos planos externos;
- nenhuma porta vertical.

### R3 — compositor e hit testing únicos

- uma fonte de metadado para renderer e hit areas;
- transformação explícita `anchor lógico → join origin → source inset → sprite`;
- remover o deslocamento acidental da porta ou redefinir conjuntamente sua âncora lógica, sem duplicar a correção;
- depth coerente com arquitetura traseira/frontal e móveis;
- fallback usa os mesmos planos e bounds;
- teste de composição completa verifica todos os encontros, não apenas quantidade de sprites.

### R4 — máquina de estados e UI mobile

- reducer/estado discriminado com transições exclusivas para explorar, palette, placing, selecting, moving, floor e confirmação;
- iniciar moving fecha lista/sheet e substitui o cartão, sem empilhamento;
- “Peças colocadas” vira alternativa sob demanda e rolável, não overlay permanente;
- mapa conserva a maior área interativa; overlays convencionais incompatíveis ficam fechados durante construção;
- layout prova 320×640, 360×800, texto maior, alto contraste e safe areas nos quatro lados;
- Escape e Android Back compartilham a mesma ordem de fechamento antes de sair/encerrar o app.

### R5 — compatibilidade e regressão integrada

- testes unitários de boundary/fingerprint e transformação visual;
- Playwright mobile entra em Construção, seleciona, move e verifica controles dentro da viewport, painel recolhido e ponto útil do canvas não coberto;
- reload, conflito, single-flight, backup v5/v4 e construção modificada permanecem preservados;
- `wall-assets:check`, build web, performance, sync/build Android e APK somente após as correções R1–R4;
- documentação e relatório de gate atualizados sem aprovar R6.

## Riscos

| Área | Risco | Restrição para a correção |
|---|---|---|
| schema | adicionar fingerprint persistido exigiria nova versão Dexie | preferir assinatura calculada em R1; migrar schema somente com necessidade comprovada e autorização |
| backup | backup v5 carrega `worldStructure`; reescrita ingênua perde construção pessoal | preservar qualquer estado que não seja match exato do canônico conhecido |
| migração | `initializeIfAbsent` não atualiza instalações existentes | não trocar blueprint por ausência de fingerprint; definir classificador antes |
| IDs | `definitionId` está em dados persistidos | manter IDs ou fornecer migração explícita e testada |
| arte | runtime e fonte hoje são pixel-identical | preservar `art-source`; normalização deve ser gerada, auditável e aprovada visualmente |
| compositor | catálogo duplicado pode divergir novamente | consolidar transformação antes de ampliar o catálogo |
| grants | estoque é por família, não orientação | não converter variantes em estoques independentes |
| acessibilidade | remover a lista permanente pode retirar a alternativa ao canvas | torná-la sob demanda e plenamente operável, não eliminá-la |

## Decisões humanas

Resolvidas para R1:

1. R0 foi aceito para prosseguimento e R1 foi autorizada nominalmente em duas partes;
2. schema v7 e backup v5 foram preservados; a assinatura é somente calculada em memória;
3. porta ocupa quatro arestas e somente a variante aberta expõe as duas centrais como passagem.

Ainda pendentes e não autorizadas:

1. aceitar ou reprovar tecnicamente R1 antes de autorizar R2-A;
2. escolher reexportação/normalização de arte ou join anchors explícitos para os cantos, sem distorção automática;
3. aprovar o padrão mobile da alternativa “Peças colocadas” (disclosure, sheet ou drawer compacto);
4. decidir em gate futuro se um blueprint v1 canônico persistido poderá ser migrado automaticamente; R1 não autoriza essa escrita;
5. executar e decidir R6 no Moto G06; automação não aprova seams, toque, safe areas, TalkBack, áudio percebido ou desempenho físico.

## Matriz de gates W3-A-R0–R6

| Gate | Entrega | Estado | Evidência/saída necessária |
|---|---|---|---|
| R0 | auditoria e especificação executável | **aceito para prosseguimento** | autorização humana nominal que iniciou R1 |
| R1 | R1-A geometria/porta + R1-B perímetro/identidade | **tecnicamente concluída; aceite humano pendente** | 53 testes focados e checks de R1 verdes |
| R2-A | contrato de arte, gabaritos e validador | **próximo gate pendente; não autorizado** | exige aceite humano nominal de R1 |
| Produção artística | quatro cantos candidatos fora do runtime | **bloqueada por R2-A** | exige aceite de R2-A e inspeção humana dos candidatos |
| R2-B | validação e integração dos quatro cantos | **bloqueada** | exige aprovação visual humana dos quatro candidatos |
| R3 | compositor, depth e hit areas | **pendente** | uma transformação única e composição sem vãos/sobreposições |
| R4 | máquina de estados e UI responsiva | **pendente** | mapa protagonista, overlays exclusivos, Back/Escape e mobile |
| R5 | regressão, compatibilidade e APK técnico | **pendente** | matriz automatizada acordada e artefato sem aprovação física inferida |
| R6 | validação física final | **pendente** | Moto G06: arte, toque, pan, safe areas, TalkBack, áudio, lifecycle e desempenho |

## Validação de R0 e estado final

| Check | Resultado |
|---|---|
| leitura documental obrigatória | concluída |
| inspeção de código, testes, histórico e assets | concluída |
| `npm run wall-assets:check` | passou: 12 PNGs validados; limitação da medição documentada |
| Markdown, links locais e referências de caminho | passou nos 3 documentos de R0 por verificação read-only; não há script Markdown dedicado no projeto |
| `git diff --check` | passou, sem saída |
| `git status --short` final | 30 rastreados modificados e 2 não rastreados |

O conjunto preexistente permaneceu presente. R0 acrescentou somente `docs/W3_A_CORRECTION_LOG.md` como segundo arquivo não rastreado e alterou conteúdo nos já modificados `docs/STATUS.md` e `docs/ROADMAP.md`. Nenhum arquivo de produção, teste ou asset foi alterado por R0.

R0 parou depois desses checks e foi posteriormente aceito para prosseguimento pela autorização humana que iniciou R1. R1-A e R1-B agora aguardam aceite humano conjunto; R2-A não foi iniciado.
