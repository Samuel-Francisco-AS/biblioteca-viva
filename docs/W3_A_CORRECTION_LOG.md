# W3-A — log de correção

> Estado documental em 2026-09-06: **R0–R3-C-B2 e a rodada FIX estão concluídas; R4 foi concluída e aprovada; R5 e o gate final pré-R6 foram concluídos; R6 foi aprovada pelo usuário no Moto G06 com duas ressalvas não bloqueadoras**. A rodada corretiva W3-A está integralmente encerrada, e a próxima etapa de produto ainda não foi iniciada.

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

| Responsabilidade                                                      | Autoridade real                                                                                   | Observação de R0                                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tipos, catálogo, células, arestas, placements, blueprint e inventário | `src/application/worldStructure.ts`                                                               | `GridPoint` representa célula, âncora ou vértice conforme o uso; não existe entidade `Vertex`.               |
| Regras de place/move/rotate/store e piso                              | `src/application/worldStructureEditing.ts`                                                        | Valida conflito de aresta, proximidade do piso, inventário e revisão; não exige fechamento global da sala.   |
| Bootstrap e concorrência persistente                                  | `src/infrastructure/database/worldStructureRepository.ts`                                         | Cria `world.main` somente se ausente e preserva o estado existente.                                          |
| Schema Dexie                                                          | `src/infrastructure/database/schema.ts`, `database.ts`                                            | `worldStructures` pertence ao schema v7.                                                                     |
| Backup/restauração                                                    | `src/infrastructure/backup/backupCodec.ts`, `dexieBackupStore.ts`                                 | Backup v5 aceita estrutura opcional; restore substitui `worldStructures` dentro da transação.                |
| Compatibilidade de `PlacedObject`                                     | `src/application/world.ts`, `worldStructureObjects.ts`                                            | `space-a` e `space-b` legados apontam para o mesmo footprint do cômodo 12×10.                                |
| Projeção estrutural para render                                       | `src/features/library-visual/phaser/structureRenderPlan.ts`                                       | Projeta somente placements explícitos; não recompõe limites a partir do piso.                                |
| Metadados runtime dos 12 PNGs                                         | `src/features/library-visual/phaser/wallAssets.ts`                                                | É uma segunda fonte de offset/pivô/span, separada do catálogo da aplicação.                                  |
| Carregamento, compositor efetivo e depth                              | `src/features/library-visual/phaser/SpatialWorldScene.ts`                                         | Aplica `offset`, `pivot`, escala e depth a cada sprite; `wallComposition.ts` não é chamado no runtime atual. |
| Mapeamento de tela, snap e hit areas                                  | `src/features/library-visual/phaser/constructionInput.ts`                                         | Hit areas usam o offset do catálogo de aplicação, enquanto sprites usam o offset de `wallAssets.ts`.         |
| Estado React da rota                                                  | `src/pages.tsx`                                                                                   | Controla modo, ferramenta, seleção, placing, moving, projeção, inventário e toast.                           |
| Estado local e DOM do editor                                          | `src/features/library-visual/ConstructionControls.tsx`                                            | Controla sheet, confirmação e célula focal; renderiza sempre a alternativa completa.                         |
| Layout, overlay, scroll e safe areas                                  | `src/styles.css`                                                                                  | A rota fixa o stage em `100dvh` com overflow oculto; o painel da construção é o scroll owner.                |
| Android Back                                                          | `src/useAndroidBackButton.ts`                                                                     | Na rota `/`, encerra o app sem consultar os subestados da construção.                                        |
| Validação dos PNGs                                                    | `scripts/process-wall-assets.mjs`                                                                 | Confere formato e tamanho do conteúdo alfa, mas a medição atual perde o offset real do conteúdo no canvas.   |
| Cobertura automatizada                                                | `src/application/worldStructure.test.ts`, testes Phaser/React e `e2e/construction-editor.spec.ts` | Prova contratos lógicos e fluxo desktop; não prova a composição visual nem o editor em viewport mobile.      |

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

| Família          | Concedido inicial | Colocado | Disponível | Placements da planta                    |
| ---------------- | ----------------: | -------: | ---------: | --------------------------------------- |
| piso de madeira  |               144 |      120 |         24 | 120 células                             |
| parede curta     |                 2 |        0 |          2 | nenhuma                                 |
| parede média     |                 4 |        2 |          2 | uma vertical à esquerda e uma à direita |
| parede longa     |                 2 |        1 |          1 | uma horizontal no topo                  |
| canto de pedra   |                 5 |        4 |          1 | quatro orientações                      |
| porta horizontal |                 1 |        1 |          0 | fechada, no centro inferior             |

O inventário é por família física. A UI percorre variantes do catálogo e repete a mesma disponibilidade em cada orientação; os números repetidos não são estoques independentes.

### Cobertura e conexão lógica

| Verificação do blueprint v1                              |       Resultado |
| -------------------------------------------------------- | --------------: |
| arestas de perímetro esperadas                           |              44 |
| arestas reivindicadas pelos 8 placements                 |              44 |
| arestas descobertas                                      |               0 |
| arestas extras fora do perímetro                         |               0 |
| arestas sobrepostas/duplicadas                           |               0 |
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

| PNG                               | Canvas px | Bounds alfa reais |  Padding px | Canvas em world units | Alfa em world units |
| --------------------------------- | --------: | ----------------: | ----------: | --------------------: | ------------------: |
| `wall-corner-ne.png`              | 1248×1182 |   1200×1134+24+24 | 24/24/24/24 |         133,12×126,08 |       128,00×120,96 |
| `wall-corner-nw.png`              | 1218×1248 |   1170×1200+24+24 | 24/24/24/24 |         129,92×133,12 |       124,80×128,00 |
| `wall-corner-se.png`              | 1248×1170 |   1200×1122+24+24 | 24/24/24/24 |         133,12×124,80 |       128,00×119,68 |
| `wall-corner-sw.png`              | 1248×1157 |   1200×1109+24+24 | 24/24/24/24 |         133,12×123,41 |       128,00×118,29 |
| `wall-door-horizontal-closed.png` |  1248×612 |    1200×564+24+24 | 24/24/24/24 |          133,12×65,28 |        128,00×60,16 |
| `wall-door-horizontal-open.png`   |  1248×788 |    1200×740+24+24 | 24/24/24/24 |          133,12×84,05 |        128,00×78,93 |
| `wall-horizontal-1cell.png`       |   348×477 |     300×429+24+24 | 24/24/24/24 |           37,12×50,88 |         32,00×45,76 |
| `wall-horizontal-2cell.png`       |   648×477 |     600×429+24+24 | 24/24/24/24 |           69,12×50,88 |         64,00×45,76 |
| `wall-horizontal.png`             |  1248×477 |    1200×429+24+24 | 24/24/24/24 |          133,12×50,88 |        128,00×45,76 |
| `wall-vertical-1cell.png`         |   284×348 |     235×300+25+24 | 25/24/24/24 |           30,29×37,12 |         25,07×32,00 |
| `wall-vertical-2cell.png`         |   284×648 |     235×600+25+24 | 25/24/24/24 |           30,29×69,12 |         25,07×64,00 |
| `wall-vertical.png`               |  284×1248 |    236×1200+24+24 | 24/24/24/24 |          30,29×133,12 |        25,17×128,00 |

O check atual relata, por exemplo, `1200x1134+0+0` porque executa `-trim` antes de `%@`. Assim ele valida o tamanho do conteúdo recortado, mas não a posição `+24+24` no canvas original. A documentação anterior de “48 px à direita/abaixo” não descreve os arquivos reais: há 24 px em cada lado, salvo a margem esquerda de 25 px em dois verticais.

### Planos de junção e origem dos vãos

Segmentos horizontais têm exatamente 300/600/1200 px de conteúdo no eixo longitudinal; verticais têm exatamente 300/600/1200 px no eixo longitudinal. O padding simétrico desloca os planos de encontro em 24 px, mas peças consecutivas da mesma família ainda se encontram no mesmo plano quando seus spans são corretos.

Os cantos declaram braços de 1.200 px nos dois eixos, mas o conteúdo real é menor em um deles:

| Canto |             Déficit contra 1200 px | Efeito na planta v1                                  |
| ----- | ---------------------------------: | ---------------------------------------------------- |
| `ne`  | 66 px no eixo Y = 7,04 world units | braço/horizontal inferior não alcança o plano lógico |
| `nw`  | 30 px no eixo X = 3,20 world units | braço horizontal não alcança a peça seguinte         |
| `se`  | 78 px no eixo Y = 8,32 world units | braço vertical termina antes do segmento direito     |
| `sw`  | 91 px no eixo Y = 9,71 world units | braço vertical termina antes do segmento esquerdo    |

A reconstrução temporária da planta com os offsets e dimensões reais reproduziu: topo contínuo; vãos entre os cantos superiores e os segmentos verticais; junções inferiores incompletas; porta sobreposta ao canto esquerdo e separada do canto direito. Não foi aplicado crop, normalização ou edição aos assets.

Classificação causal:

| Sintoma                                 | Geometria lógica                 | Metadado                                 | Compositor                                   | Conteúdo PNG                                                           |
| --------------------------------------- | -------------------------------- | ---------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| vãos dos braços de canto                | íntegra                          | span declara 4×4 sem bounds/planos reais | confia no span e aplica escala única         | braço real é 30–91 px menor                                            |
| porta deslocada                         | ocupa as quatro arestas corretas | `offset.xCells=-1` em dois catálogos     | aplica o offset literalmente                 | largura longitudinal é correta                                         |
| sobreposição porta/canto esquerdo       | sem aresta duplicada             | causada pelo offset                      | door e corner podem compartilhar área visual | conteúdos se sobrepõem                                                 |
| separação porta/canto direito           | sem aresta descoberta            | causada pelo offset e pelo canto         | não compensa plano de junção                 | canto `ne` também não alcança Y lógico                                 |
| seams finos entre módulos do mesmo eixo | contínua                         | não há perfil de seam                    | LINEAR pode tornar alpha parcial perceptível | bordas foram produzidas separadamente e têm alpha/contorno irregulares |

Não há evidência de que mudar `CELL_SIZE`, câmera ou piso corrija esses vãos. O defeito está no contrato entre arte, metadado e compositor.

## C. Interação e responsividade

### Estados que coexistem atualmente

| Estado                                                               | Dono                       | Pode coexistir com                                                      |
| -------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| `constructionMode`                                                   | `pages.tsx`                | todos os subestados e overlays abaixo                                   |
| ferramenta `explore/select/place-structure/paint-floor/remove-floor` | `pages.tsx`                | seleção, sheet e toast                                                  |
| `selectedStructureId`                                                | `pages.tsx`                | moving, placing, sheet, alternativa e confirmação                       |
| `movingStructureId`                                                  | `pages.tsx`                | seleção permanece definida                                              |
| `placingStructureDefinitionId`                                       | `pages.tsx`                | seleção pode permanecer definida                                        |
| sheet `structures/floor`                                             | `ConstructionControls.tsx` | seleção e alternativa completa                                          |
| `confirmStore`                                                       | `ConstructionControls.tsx` | seleção, alternativa e demais overlays                                  |
| célula focal/ferramenta de piso                                      | `ConstructionControls.tsx` | seleção anterior não é limpa                                            |
| inventário e progresso                                               | projeção React             | sempre visíveis quando o painel correspondente abre                     |
| toast `placementNotice`                                              | `pages.tsx`                | construção, sheet, seleção e overlays da Biblioteca                     |
| bottom sheet da Biblioteca                                           | `pages.tsx`                | pode ser aberto pelo acionador que continua presente durante construção |
| room explorer, resumo acessível e botão de resumo                    | `pages.tsx`                | continuam montados durante construção                                   |
| gesto/preview/floor batch                                            | `SpatialWorldScene.ts`     | efêmeros no Phaser, sem autoridade sobre o DOM                          |

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

| Cobertura existente                            | Lacuna objetiva                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/construction-editor.spec.ts`              | fixa 1280×800; usa deliberadamente `.construction-alternative`; não mede obstrução, scroll interno, safe areas nem elemento fora da viewport |
| E2E de layout mobile                           | visita `/` em 320/360/412 px, mas nunca entra em Construção                                                                                  |
| teste React “propaga a instância em movimento” | verifica `movingInstanceId`, mas não exige que seleção/lista/sheet sejam fechados                                                            |
| testes de Escape                               | cobrem saída sem subestado; não cobrem coexistência nem Android Back                                                                         |
| `structureRenderPlan.test.ts`                  | conta peças e orientação da porta; não verifica coordenadas visuais ou planos de junção                                                      |
| `wallAssets.test.ts` e `wall-assets:check`     | validam catálogo, dimensões e tamanho alfa aparado; não preservam offset do alpha bbox nem comparam perfis das bordas                        |
| teste do blueprint                             | não compara o conjunto de arestas com o perímetro e não compõe os PNGs                                                                       |
| jsdom                                          | não calcula layout CSS, viewport real, overflow ou cobertura do canvas                                                                       |

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

O aceite de R0 autorizou exclusivamente R1-A e, em complementação nominal posterior, R1-B. O usuário aceitou tecnicamente as duas partes em 2026-08-31 e, naquele momento, autorizou nominalmente somente R2-A; produção artística e gates posteriores ainda não estavam autorizados.

### R1 — geometria canônica e identidade

**Estado:** `tecnicamente concluída — aceita tecnicamente pelo usuário em 2026-08-31`. Este estado reúne R1-A e R1-B e não autoriza produção artística ou integração visual.

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

| Medida                        | Resultado |
| ----------------------------- | --------: |
| `floorCells`                  |       120 |
| arestas de perímetro          |        44 |
| arestas estruturais únicas    |        44 |
| ausentes                      |         0 |
| extras                        |         0 |
| duplicadas/sobrepostas        |         0 |
| componentes conectados        |         1 |
| endpoints/graus incompatíveis |         0 |
| fechado                       |       sim |

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

| Comando                                                                                                                                                                                                                 | Resultado                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| baseline de R1-A `npx vitest run src/application/worldStructureGeometry.test.ts src/application/worldStructure.test.ts src/application/worldStructureEditing.test.ts`                                                   | passou: 32 testes em 3 arquivos |
| focado de R1-A/R1-B `npx vitest run src/application/worldStructureAnalysis.test.ts src/application/worldStructureGeometry.test.ts src/application/worldStructure.test.ts src/application/worldStructureEditing.test.ts` | passou: 53 testes em 4 arquivos |
| `npm run format`                                                                                                                                                                                                        | passou                          |
| `npm run format:check`                                                                                                                                                                                                  | passou                          |
| `npm run lint`                                                                                                                                                                                                          | passou                          |
| `npm run typecheck`                                                                                                                                                                                                     | passou                          |
| `git diff --check`                                                                                                                                                                                                      | passou, sem saída               |

A cobertura consolidada preserva toda R1-A e acrescenta retângulo, concavidade, buraco, múltiplos componentes, ausência, extra, duplicidade, ordem invertida, não mutação e blueprint v1 para o perímetro. Identidade cobre blueprint intacto; ordem/metadados/IDs ignorados; piso alterado; placement adicionado, removido e movido; orientação, porta e definição alteradas; versões desconhecida e futuras.

#### Limitações e pendências preservadas

- R1 não exige fechamento global para salvar layouts editados; as funções de conexão validam a relação solicitada e `validateWorldStructure` continua responsável por integridade e conflitos de ocupação, não por transformar todo layout em um cômodo fechado;
- `visualSpanCells` permanece apenas para compatibilidade mecânica dos chamadores visuais existentes; nenhuma regra nova de geometria o consulta e nenhuma consolidação de metadado visual foi iniciada;
- o analisador e o classificador não possuem consumidor de escrita: são contratos puros para diagnóstico/decisão posterior e não bloqueiam edição nem autorizam substituição automática;
- a assinatura é calculada em memória, não contém hash persistido e não altera `WorldStructureState`;
- nenhum estado persistido foi regravado; schema v7, backup v5, blueprint, grants, milestones e inventário permaneceram inalterados;
- nenhum arquivo Phaser, React, CSS, PNG ou catálogo visual runtime foi tocado;
- no fechamento técnico de R1, R2-A ainda não havia sido iniciado; a execução posterior só começou após a autorização humana nominal de 2026-08-31 e preservou integralmente R1.

### R2-A — contrato de arte e planos de junção

**Estado:** `tecnicamente concluída — aceita pelo usuário antes da produção dos quatro candidatos`.

#### Causa e contrato adotado

O check anterior aplicava `-trim` antes de imprimir `%@`; o canvas aparado redefinia a page geometry e convertia offsets reais como `+24+24` em `+0+0`. A medição agora extrai o alpha no canvas original e consulta `%@` sem aparar a imagem. O parser preserva sinais e offsets e deriva padding esquerdo/superior/direito/inferior.

As seis retas ativas são a autoridade geométrica e artística. O sistema usa bordas de pixel com origem no topo esquerdo e retângulos semiabertos:

- 300 px-fonte por célula; braços de canto têm exatamente 4 células/1200 px;
- retas horizontais usam planos `x=24` e `x=24 + span×300`, com perfil transversal `y=[24,453)`;
- retas verticais usam planos `y=24` e `y=24 + span×300`, com perfil de referência `x=[24,260)`;
- novos cantos exigem canvas 1248×1248, bbox `1200x1200+24+24`, origem visual `(0,0)` e alpha somente na união dos dois corredores da orientação;
- tolerância é 0 px para canvas, span longitudinal, planos de junção e alpha fora da área; 1 px cobre somente a diferença transversal existente das retas verticais 1/2 contra a reta 4;
- não há crop, stretching, rotação runtime ou compensação por `CELL_SIZE`, câmera ou piso;
- portas open/closed foram medidas em 1200 px horizontais e compartilham `x=24`/`x=1224`; não foram redesenhadas ou integradas.

| Canto | Direções lógicas |       Vértice | Planos externos    | Situação do PNG antigo                                 |
| ----- | ---------------- | ------------: | ------------------ | ------------------------------------------------------ |
| `ne`  | oeste+norte      | `(1224,1224)` | `x=24`, `y=24`     | ativo; canvas 1248×1182 e bbox 1200×1134, não conforme |
| `nw`  | leste+norte      |   `(24,1224)` | `x=1224`, `y=24`   | ativo; canvas 1218×1248 e bbox 1170×1200, não conforme |
| `se`  | oeste+sul        |   `(1224,24)` | `x=24`, `y=1224`   | ativo; canvas 1248×1170 e bbox 1200×1122, não conforme |
| `sw`  | leste+sul        |     `(24,24)` | `x=1224`, `y=1224` | ativo; canvas 1248×1157 e bbox 1200×1109, não conforme |

#### Artefatos e caminhos

- contrato humano: `art-guides/w3-a-r2-a/README.md`;
- contrato máquina-legível: `art-guides/w3-a-r2-a/wall-corner-contract.json`;
- relatório máquina-legível dos 12 fontes: `art-guides/w3-a-r2-a/validator-report.json`;
- gabaritos: `art-guides/w3-a-r2-a/templates/wall-corner-template-{ne,nw,se,sw}.png`;
- montagens: `art-guides/w3-a-r2-a/montages/wall-corner-inspection-{ne,nw,se,sw}.png`;
- pasta reservada que, no fechamento de R2-A, ainda não continha PNG candidato: `art-candidates/w3-a-r2-b/wall-corners/`;
- geração/check determinísticos: `scripts/generate-wall-corner-guides.mjs` e scripts npm `wall-guides:generate`/`wall-guides:check`;
- medição/teste: `scripts/wall-asset-metrics.mjs` e `scripts/wall-asset-metrics.test.mjs`;
- validador ativo com modo estrito reservado aos candidatos: `scripts/process-wall-assets.mjs`.

Os quatro gabaritos são PNG sRGBA 8-bit 1248×1248 com transparência fora das áreas permitidas. As montagens são PNG sRGBA 8-bit 2448×2448 e alinham, sem escala, cada gabarito às duas retas longas. O relatório comum mantém os quatro cantos antigos em `legacy-nonconforming-report-only`, preservando uma matriz verde durante a transição; `--strict-corner-directory` torna o contrato obrigatório somente para candidatos de R2-B.

#### Testes e checks de R2-A

| Comando                                                                                                    | Resultado                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| baseline `npm run wall-assets:check` antes da correção                                                     | passou nos 12 PNGs, reproduzindo a perda de offsets do check antigo                                  |
| `npx vitest run scripts/wall-asset-metrics.test.mjs src/features/library-visual/phaser/wallAssets.test.ts` | passou: 4 testes em 2 arquivos; bbox deslocado `+7+9`, padding, alpha permitido e catálogo           |
| validador estrito contra cópias temporárias dos quatro gabaritos                                           | passou: 4 orientações conformes; nenhum caminho ativo usado como destino                             |
| `npm run wall-assets:check` atualizado                                                                     | passou: 12 PNGs; 6 retas conformes, 2 portas medidas e 4 cantos antigos não conformes em report-only |
| `npm run wall-guides:check`                                                                                | passou: 9 artefatos determinísticos (4 gabaritos, 4 montagens e 1 relatório)                         |
| paths/JSON focados                                                                                         | passou: 12 caminhos documentados e 2 JSONs máquina-legíveis válidos                                  |
| `npm run format`                                                                                           | passou                                                                                               |
| `npm run format:check`                                                                                     | passou                                                                                               |
| `npm run lint`                                                                                             | passou                                                                                               |
| `npm run typecheck`                                                                                        | passou                                                                                               |
| `git diff --check`                                                                                         | passou, sem saída                                                                                    |

Não foram executados E2E, build, assets de produção, Android ou APK, conforme a restrição explícita de R2-A.

#### Limitações preservadas

- no fechamento técnico de R2-A, nenhum `wall-corner-*.png` de `art-source/` ou runtime havia sido alterado; os antigos continuavam ativos e recuperáveis pelo histórico;
- no fechamento técnico de R2-A, nenhum canto novo/final havia sido produzido e a pasta de candidatos continha somente instruções;
- `WALL_ASSETS`, `structureRenderPlan`, `SpatialWorldScene`, `constructionInput`, Phaser, porta runtime, blueprint, schema, backup, inventário, React e CSS não foram tocados;
- validação automática garante formato e geometria; seam de textura, argamassa, perspectiva e luz continua inspeção humana nas montagens;
- produção artística e R2-B ainda não haviam sido iniciadas naquele gate.

### R2-B1 — pré-integração e validação estrita dos quatro cantos

**Estado:** `W3-A-R2-B1 tecnicamente concluída e aceita nominalmente pelo usuário em 2026-09-01`.

O usuário autorizou nominalmente R2-B1 em 2026-09-01 depois da produção determinística e da aprovação visual dos quatro candidatos. O escopo desta rodada permaneceu estritamente diagnóstico: inventário, validação, montagens e documentação, sem copiar arquivo algum para `art-source/` ou `public/`.

#### Baseline registrado antes de qualquer escrita

- HEAD: `02f0fde84a4b620f6c829277bca8b3b4e65fead8`;
- os oito caminhos rastreados modificados e os cinco caminhos não rastreados abaixo eram preexistentes e foram preservados;
- o diretório candidato continha exatamente os quatro PNGs esperados e `README.md`, sem PNG extra.

```text
 M docs/ART_DIRECTION.md
 M docs/ASSET_REGISTRY.md
 M docs/ASSET_SPEC.md
 M docs/ROADMAP.md
 M docs/STATUS.md
 M docs/W3_A_CORRECTION_LOG.md
 M package.json
 M scripts/process-wall-assets.mjs
?? art-candidates/
?? art-guides/
?? scripts/generate-wall-corner-guides.mjs
?? scripts/wall-asset-metrics.mjs
?? scripts/wall-asset-metrics.test.mjs
```

#### Candidatos autorizados

Todos os quatro arquivos são PNG sRGBA de 8 bits, não entrelaçados, em canvas 1248×1248. Os hashes observados coincidem byte a byte com os hashes fornecidos na autorização.

| Canto | Arquivo                                                    | SHA-256 observado e esperado                                       | Resultado |
| ----- | ---------------------------------------------------------- | ------------------------------------------------------------------ | --------- |
| NE    | `art-candidates/w3-a-r2-b/wall-corners/wall-corner-ne.png` | `dd300eb3698c42972ac566d8a26e5f5582c8f36e79e549ccece7495026c74af0` | coincide  |
| NW    | `art-candidates/w3-a-r2-b/wall-corners/wall-corner-nw.png` | `b9f3707837d5ee1841b06679a2b39697d297688f39bd456c04d44092e5adcae5` | coincide  |
| SE    | `art-candidates/w3-a-r2-b/wall-corners/wall-corner-se.png` | `ebc988db63ff4254aba083e96351bf35f28071655592e608e8a6983b10d3452f` | coincide  |
| SW    | `art-candidates/w3-a-r2-b/wall-corners/wall-corner-sw.png` | `063723acdd690c8f7b6467115b12da35485afff6619f61fe94443d370a297d9f` | coincide  |

#### Hashes dos cantos antigos preservados

O runtime continua carregando os quatro arquivos de `public/`; as fontes correspondentes em `art-source/` também foram registradas para tornar a transição auditável. Nenhum desses oito arquivos foi escrito nesta rodada.

| Canto | SHA-256 fonte antiga em `art-source/`                              | SHA-256 runtime ativo em `public/`                                 |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| NE    | `e6f2f5d576ee699798adc450d55222f6190cb8884e5b1afb49cf4bf723ca1b8e` | `9a398d958aae13bfa06a63a360fa1f85b04fcec7da094bd403fd0445a3637110` |
| NW    | `3a44602d2eee406b193c80e0226a405a6d839215f1bd34bc111e48f8f581df52` | `c9da9aeb1a34c2c1beeaf9dd455c51bd2192c14991b52c3404d6014cbd4ff159` |
| SE    | `3b8ccdb1a72866aaa8a47b4dcb2f4fe0e08b69daedbdd085758586267d47c176` | `6289d6a314ea94eb28ef8517e70ed66a9ea31e7d0cfb280cb78ad5ee8f61a5c1` |
| SW    | `c7f798f350af35a73538e845da769f18abcd19efcd4e308ac0661ec4de6a037e` | `1c2121abaadd8ff246af38b54a719cf8db6928d12e1d7f396a987b8216098da9` |

#### Validação estrita e diagnósticos

O comando obrigatório foi executado sem alteração do validador, do contrato ou dos candidatos:

```text
node scripts/process-wall-assets.mjs --check --strict-corner-directory art-candidates/w3-a-r2-b/wall-corners
```

Resultado: passou para quatro candidatos. Para NE/NW/SE/SW, o check confirmou canvas 1248×1248, PNG sRGBA de 8 bits com alpha, bbox `1200x1200+24+24`, orientação e planos externos derivados do contrato e alpha máximo zero fora da união dos corredores permitidos.

As montagens foram compostas com o mesmo ImageMagick já usado pelos guias R2-A. Os arquivos de entrada foram posicionados 1:1, sem escala, crop ou compensação; o fundo quadriculado pertence apenas aos diagnósticos.

- `art-guides/w3-a-r2-b/montages/wall-corner-candidate-inspection-ne.png`;
- `art-guides/w3-a-r2-b/montages/wall-corner-candidate-inspection-nw.png`;
- `art-guides/w3-a-r2-b/montages/wall-corner-candidate-inspection-se.png`;
- `art-guides/w3-a-r2-b/montages/wall-corner-candidate-inspection-sw.png`;
- `art-guides/w3-a-r2-b/montages/wall-corner-candidates-closed-room.png`.

As quatro inspeções medem 2448×2448; a sala fechada 12×12 mede 3648×3648 e usa, em cada lado, quatro células de um braço, quatro da reta longa original e quatro do braço oposto.

| Check focado                                                                                               | Resultado                                                                                                 |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| validação estrita obrigatória                                                                              | passou: 4 candidatos                                                                                      |
| `npm run wall-assets:check`                                                                                | passou: 12 ativos; 4 cantos antigos permanecem não conformes somente em report-only                       |
| `npm run wall-guides:check`                                                                                | passou: 9 artefatos determinísticos de R2-A                                                               |
| `npx vitest run scripts/wall-asset-metrics.test.mjs src/features/library-visual/phaser/wallAssets.test.ts` | passou: 4 testes em 2 arquivos                                                                            |
| `npm run format`                                                                                           | passou; todos os arquivos abrangidos permaneceram inalterados                                             |
| `npm run format:check`                                                                                     | passou                                                                                                    |
| `git diff --check`                                                                                         | passou, sem saída                                                                                         |
| `git status --short`                                                                                       | preservou as 13 entradas de topo do baseline; as cinco montagens estão sob `art-guides/` já não rastreado |

#### Limitações e parada obrigatória

- a automação confirma contrato geométrico, não concede aceite humano de seam, textura, perspectiva ou luz;
- o `README.md` do diretório candidato ainda descreve o estado anterior à chegada dos PNGs e foi preservado porque não está entre os três documentos autorizados para alteração nesta rodada;
- os quatro cantos antigos permanecem ativos e byte a byte preservados; nenhum asset ativo foi substituído;
- R2-B2, integração, compositor, catálogo, offsets, porta, hit areas, UI, schema, backup, blueprint, grants e milestones não foram iniciados nem alterados;
- aquela execução parou obrigatoriamente no relatório e o usuário concedeu depois o aceite humano nominal de R2-B1.

### R2-B2-A — preparação controlada do pipeline

**Estado:** `W3-A-R2-B2-A tecnicamente concluída e aceita nominalmente pelo usuário em 2026-09-01`.

O usuário aceitou nominalmente R2-B1 e autorizou inicialmente R2-B2. A tentativa de integração foi interrompida preventivamente, antes de qualquer escrita, porque a inspeção comprovou que o processador validava tanto a fonte quanto o runtime dos cantos exclusivamente contra `asset.baseline`. Assim, os candidatos aprovados, que obedecem a `asset.production`, seriam recusados pelo pipeline oficial. O usuário aceitou essa interrupção e autorizou somente R2-B2-A para corrigir a semântica do pipeline sem ativar PNG algum.

#### Baseline e causa-raiz

- HEAD antes da escrita: `02f0fde84a4b620f6c829277bca8b3b4e65fead8`;
- o `git status --short` continuava com as mesmas 13 entradas de topo registradas por R2-B1; os diffs preexistentes dos arquivos autorizados foram inspecionados e preservados;
- `scripts/process-wall-assets.mjs` usava `validatePng(source, asset.baseline)` e `validatePng(runtime, asset.baseline)` no mesmo fluxo de processamento;
- os hashes esperados dos quatro candidatos, das quatro fontes antigas e dos quatro runtimes antigos foram reconfirmados na tentativa interrompida; a divergência era semântica no pipeline, não nos arquivos;
- nenhum candidato foi copiado e nenhum PNG de `art-source/` ou `public/` foi escrito na tentativa interrompida nem em R2-B2-A.

#### Semântica implementada

- `baseline` permanece o registro histórico e diagnóstico imutável dos quatro cantos antigos;
- qualquer canto com especificação `production` é validado contra ela tanto na entrada quanto no runtime gerado; não existe fallback silencioso para `baseline` durante processamento;
- a seleção da expectativa fica centralizada no mesmo caminho usado para fonte e runtime;
- assets sem `production`, incluindo retas e portas, preservam a validação anterior contra `baseline`;
- `--strict-corner-directory` continua estritamente vinculado a `production` e rejeita combinação com a tolerância legada;
- `--allow-legacy-corners` só é válido com `--check` nos assets ativos, tolera exclusivamente os quatro cantos que coincidam com canvas, alpha bbox, formato, espaço de cor, bit depth e alpha do `baseline` conhecido, e emite `legacy-nonconforming-report-only`;
- opções desconhecidas, repetidas, sem argumento ou combinações inválidas falham explicitamente;
- o comando transitório registrado é `node scripts/process-wall-assets.mjs --check --allow-legacy-corners`; R2-B2-B deverá remover a permissão do comando padrão depois da integração.

O contrato `art-guides/w3-a-r2-a/wall-corner-contract.json` não foi alterado. Seu SHA-256 observado é `62bd2a2f4f418c4c5ffee728703902144a1328180ed6d905950f9cf9a9618c62`, e um teste focado fixa todos os pares `baseline`/`production` dos quatro cantos.

#### Cobertura focada

`scripts/process-wall-assets.test.mjs` monta projetos completos somente sob diretórios criados por `mkdtemp`, copia para lá o processador, as métricas e o contrato e gera fixtures PNG. Nenhum caminho ativo é destino de teste. Os 14 casos provam:

1. cantos históricos passam apenas com a tolerância explícita e falham sem ela;
2. cantos `production` passam sem tolerância;
3. alpha fora das áreas contratuais reprova um canto `production`;
4. processamento real aceita fontes `production`, gera runtime e revalida canvas, bbox e alpha externo; um `magick` controlado pelo teste também injeta runtime inválido e comprova sua rejeição pelo processador;
5. processamento rejeita fonte de canto histórica;
6. retas e portas mantêm a validação anterior;
7. diretório estrito usa `production`;
8. tolerância legada rejeita geometria arbitrária;
9. combinações inválidas e opções desconhecidas falham;
10. todos os valores `baseline` e `production` dos quatro cantos permanecem idênticos ao contrato aprovado.

#### Arquivos efetivamente criados ou alterados

- `scripts/process-wall-assets.mjs`;
- `scripts/process-wall-assets.test.mjs` (novo);
- `package.json`, somente em `wall-assets:check`;
- `docs/W3_A_CORRECTION_LOG.md`;
- `docs/STATUS.md`;
- `docs/ROADMAP.md`.

#### Validações de R2-B2-A

| Check                                                                                                                                          | Resultado                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| baseline focada antes da alteração: `npx vitest run scripts/wall-asset-metrics.test.mjs src/features/library-visual/phaser/wallAssets.test.ts` | passou: 4 testes em 2 arquivos                                                                                       |
| `npx vitest run scripts/process-wall-assets.test.mjs`                                                                                          | passou: 14 testes em 1 arquivo                                                                                       |
| matriz focada final: processador + métricas + catálogo                                                                                         | passou: 18 testes em 3 arquivos                                                                                      |
| validação estrita dos quatro candidatos                                                                                                        | passou: 4 candidatos `production`                                                                                    |
| `npm run wall-assets:check`                                                                                                                    | passou: 12 ativos; quatro cantos antigos tolerados explicitamente como `legacy-nonconforming-report-only`            |
| `npm run wall-guides:check`                                                                                                                    | passou: 9 artefatos determinísticos de R2-A                                                                          |
| `npm run format` e `npm run format:check`                                                                                                      | passaram                                                                                                             |
| `npm run lint` e `npm run typecheck`                                                                                                           | passaram                                                                                                             |
| `git diff --check`                                                                                                                             | passou, sem saída                                                                                                    |
| `git status --short`                                                                                                                           | preservou as 13 entradas de topo do baseline e acrescentou somente o novo teste focado; nenhum PNG aparece no status |

#### Limitações preservadas e parada

- os quatro candidatos continuam somente em `art-candidates/`; fontes e runtime permanecem com os cantos antigos;
- a tolerância legada é intencionalmente transitória e limitada ao check read-only; não pode ser usada no processamento nem no diretório estrito;
- o pipeline não foi executado contra `art-source/`, e nenhum PNG, contrato, métrica, catálogo, offset, placement, compositor, Phaser, UI, CSS, schema, backup, blueprint, grant ou milestone foi alterado;
- R2-B2-B, a integração de assets e R3 não foram iniciadas e exigem nova autorização humana nominal.

### R2-B2-B — promoção e integração definitiva dos quatro cantos

**Estado:** `W3-A-R2-B2-B tecnicamente concluída e aceita nominalmente pelo usuário em 2026-09-02; R2 integralmente encerrada`.

O usuário aceitou nominalmente R2-B2-A e autorizou somente a promoção dos quatro candidatos aprovados, o processamento oficial dos runtimes e a retirada da tolerância legada do comando padrão. Catálogo, compositor, offsets, placements e etapas posteriores permaneceram fora do escopo.

#### Baseline e preconditions antes da primeira escrita

- HEAD: `02f0fde84a4b620f6c829277bca8b3b4e65fead8`;
- o `git status --short` continha as 14 entradas de topo preservadas ao final de R2-B2-A;
- o diretório candidato continha `README.md` e exatamente `wall-corner-{ne,nw,se,sw}.png`, sem PNG extra;
- os quatro hashes candidatos, os quatro hashes de fonte antiga, os quatro hashes de runtime antigo e o contrato SHA-256 `62bd2a2f4f418c4c5ffee728703902144a1328180ed6d905950f9cf9a9618c62` coincidiram com a autorização;
- o manifesto SHA-256 completo registrou, antes do processamento, 12 fontes e 12 runtimes, incluindo as seis retas e as duas portas;
- `node scripts/process-wall-assets.mjs --check --strict-corner-directory art-candidates/w3-a-r2-b/wall-corners` passou para as quatro orientações antes de qualquer escrita.

#### Promoção, processamento e hashes

Cada candidato foi copiado byte a byte para a fonte de mesmo nome. A igualdade SHA-256 candidato/fonte foi comprovada imediatamente antes do processamento. O único comando de produção usado foi:

```text
npm run wall-assets:process
```

O script oficial percorreu os 12 assets e reportou quatro cantos `conforming`, seis retas `conforming`, duas portas `measured-only` e zero canto legado.

| Canto | Fonte antiga                                                       | Candidato = fonte final                                            | Runtime antigo                                                     | Runtime final                                                      |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| NE    | `e6f2f5d576ee699798adc450d55222f6190cb8884e5b1afb49cf4bf723ca1b8e` | `dd300eb3698c42972ac566d8a26e5f5582c8f36e79e549ccece7495026c74af0` | `9a398d958aae13bfa06a63a360fa1f85b04fcec7da094bd403fd0445a3637110` | `017940c201d09e35181e2054523cb5e1d3ef463f51781176fdc4a6bc247a7adc` |
| NW    | `3a44602d2eee406b193c80e0226a405a6d839215f1bd34bc111e48f8f581df52` | `b9f3707837d5ee1841b06679a2b39697d297688f39bd456c04d44092e5adcae5` | `c9da9aeb1a34c2c1beeaf9dd455c51bd2192c14991b52c3404d6014cbd4ff159` | `eb6ecceed52bd3d6383405a9c6a42d3d2af6a304fb32a4d26a44ab5a3f0a905a` |
| SE    | `3b8ccdb1a72866aaa8a47b4dcb2f4fe0e08b69daedbdd085758586267d47c176` | `ebc988db63ff4254aba083e96351bf35f28071655592e608e8a6983b10d3452f` | `6289d6a314ea94eb28ef8517e70ed66a9ea31e7d0cfb280cb78ad5ee8f61a5c1` | `a19899b28cded17df1c24ecece092463eaf148e0726ad866c67d3eb3a03f47ce` |
| SW    | `c7f798f350af35a73538e845da769f18abcd19efcd4e308ac0661ec4de6a037e` | `063723acdd690c8f7b6467115b12da35485afff6619f61fe94443d370a297d9f` | `1c2121abaadd8ff246af38b54a719cf8db6928d12e1d7f396a987b8216098da9` | `6e6612fdda0f84c9e6552e52eeeebb4455026b14c1a7e38943b6862f1a07aa8c` |

#### Equivalência decodificada e contrato `production`

O SHA-256 do fluxo RGBA de 8 bits decodificado coincide entre candidato, fonte e runtime para cada orientação. Portanto, as diferenças byte a byte entre candidato e runtime se limitam à codificação PNG/metadata produzida pelo pipeline.

| Canto | SHA-256 RGBA decodificado — candidato = fonte = runtime            |
| ----- | ------------------------------------------------------------------ |
| NE    | `13d1698815ece9e00248512b9726c4079eaad59a9ccb26efa6dbd6b8b0ea3b5a` |
| NW    | `614af5728f7c4138033a3c62ecc898d20f38005d79f14e176b0a54ceb1adda61` |
| SE    | `0c247509d72b03dd47be7bc2376acc59b905381bca166a0ebbb8ffb06437bd00` |
| SW    | `4b9d4575a7d5a2a3785dfa62438128594ad4977e2f8e444f3dc39465804aeb19` |

Cópias somente dos quatro runtimes foram colocadas em um diretório `mktemp -d`, validadas por `--strict-corner-directory` e removidas em seguida. O check confirmou canvas 1248×1248, PNG sRGBA de 8 bits, bbox `1200x1200+24+24`, orientação, planos externos e alpha zero fora das regiões permitidas para os quatro cantos.

#### Retas e portas preservadas byte a byte

Os hashes abaixo são idênticos antes e depois do processamento oficial.

| Asset                             | SHA-256 fonte antes = depois                                       | SHA-256 runtime antes = depois                                     |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `wall-door-horizontal-closed.png` | `17c89b19c0ee1977f97dbed96df57dc171f689f47c6bb43a8e017f32379f9281` | `ba9c9e935aa055f44bb2dc2433ab3a923367af7de2c7f8195da301b9ad2ce191` |
| `wall-door-horizontal-open.png`   | `b312cdf120083f59a31fea59f203bde2e5fdd9878c09d7a714a5c32d8a09a163` | `948bcbe81f4110bb9ad974b6fa06415eb18c5ec5ee2bace0f1825f53fc4c6d58` |
| `wall-horizontal-1cell.png`       | `2d3f899db1a5bfa71d692a7061aeec22dbeb68a69d7ecdda7720cc6180988966` | `feeaf542f9632680447d50f0b861bff377ce79d3acb2de2146711ef8f2069599` |
| `wall-horizontal-2cell.png`       | `d85f6a7b0926865acb2836a713dc9166a7559d61ee2ff8499da04b91325ccd5a` | `3c54bd12fb681e89ce65b6fab63c52ba289cad39a76b3b9828894bd5c6bac97f` |
| `wall-horizontal.png`             | `b4c8d8f9d044fd291275a3bdc76e55c050c7d9afb7eef94a641ed21520edf35f` | `3a1f1dc2fd90690bfb41535ab699390c5171036fb9dbd622b819f254c5c3faa6` |
| `wall-vertical-1cell.png`         | `ee161cf3c403001809fead263759e29f61ec3de6c2042b7e5f9ba910a70cf7c2` | `498a6e67b0c58ebdf0642b3d8cb2bd716f26fa1c07c84d35b3fc5a26121825b7` |
| `wall-vertical-2cell.png`         | `c82482de0dab1c64dc88da8cbdee7dce42c9e41b9d264e4ce71a35ee8620da73` | `37b0d4c43ab84c4cc4aa3b07fc9f9e7b78722d80c47e3aa617e7d3ba2ad2b92b` |
| `wall-vertical.png`               | `d8adc6aab5cc6d3bada0ac7124ad543010f73fd78d4e04e6db64c7721373ac7a` | `b64f24d4f97c3a96c474b11dbb9211c83190f056798f2539510f09cc7894ec9c` |

#### Encerramento da tolerância e arquivos alterados

Somente depois de todas as verificações dos runtimes, `wall-assets:check` voltou a `node scripts/process-wall-assets.mjs --check`. A implementação diagnóstica de `--allow-legacy-corners` foi preservada no script, mas o comando padrão não a fornece e passa com os quatro cantos `conforming`.

Os arquivos alterados especificamente por R2-B2-B são:

- `art-source/world/architecture/walls/wall-corner-{ne,nw,se,sw}.png`;
- `public/assets/world/architecture/walls/wall-corner-{ne,nw,se,sw}.png`;
- `package.json`, somente para retirar `--allow-legacy-corners` de `wall-assets:check`;
- `art-candidates/w3-a-r2-b/wall-corners/README.md`;
- `docs/W3_A_CORRECTION_LOG.md`;
- `docs/STATUS.md`;
- `docs/ROADMAP.md`;
- `docs/ASSET_REGISTRY.md`.

#### Validações de R2-B2-B

| Check                                                                         | Resultado                                                                                                                               |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| validação estrita dos candidatos antes da escrita                             | passou: 4 candidatos                                                                                                                    |
| `npm run wall-assets:process`                                                 | passou: 12 assets; 4 cantos `production`, zero legado                                                                                   |
| validação estrita dos runtimes em diretório temporário                        | passou: 4 runtimes; temporário removido                                                                                                 |
| igualdade de arquivo candidato/fonte e igualdade RGBA candidato/fonte/runtime | passou: 4 orientações                                                                                                                   |
| comparação SHA-256 das seis retas e duas portas, fonte e runtime              | passou: 16 arquivos idênticos ao baseline                                                                                               |
| testes focados de processador, métricas e catálogo                            | passaram: 18 testes em 3 arquivos                                                                                                       |
| `npm run wall-assets:check` sem tolerância legada                             | passou: 12 ativos; 4 cantos `conforming`; zero legado                                                                                   |
| `npm run wall-guides:check`                                                   | falhou na primeira rodada por `validator-report.json` desatualizado; após o complemento autorizado, passou: 9 artefatos determinísticos |
| `npm run format` e `npm run format:check`                                     | passaram                                                                                                                                |
| `npm run lint` e `npm run typecheck`                                          | passaram                                                                                                                                |
| `git diff --check`                                                            | passou, sem saída                                                                                                                       |

#### Limitações preservadas e parada

- o catálogo, compositor, Phaser, offsets, placements, hit areas, React, CSS, schema, backup, blueprint, grants e milestones não foram alterados;
- o contrato, scripts, testes, métricas, candidatos, gabaritos e montagens permaneceram inalterados;
- a primeira rodada parou corretamente antes de alterar `art-guides/w3-a-r2-a/validator-report.json`, que não constava da autorização original; o complemento nominal posterior regenerou o relatório pelo ferramental oficial;
- naquele encerramento técnico, R2-B2-B ainda não recebia aceite humano por inferência e R3–R6 permaneciam não iniciadas;
- a execução parou corretamente no relatório e aguardou o aceite nominal de R2-B2-B, concedido pelo usuário em 2026-09-02 antes da autorização de R3-A.

#### Complemento de fechamento do relatório derivado

O usuário aceitou a interrupção preventiva e autorizou somente `npm run wall-guides:generate`, os checks finais e a atualização documental. Antes da escrita, foram reconfirmados HEAD, estado Git, todos os hashes de candidatos, fontes, runtimes, retas, portas, contrato, quatro gabaritos, quatro montagens e relatório legado.

O gerador oficial percorreu os nove artefatos de R2-A. A comparação SHA-256 pré/pós comprovou mudança efetiva de conteúdo somente em `art-guides/w3-a-r2-a/validator-report.json`:

- hash anterior: `f454624bc2e9751e2eca0dc36f4ee0a207df28a899342f34b1975e1d454a216f`;
- hash final: `ab428930f6d41c2d1d8ded61c40370cefba2b158af1b46755cc05d2974ebd0f8`.

O relatório final contém 12 assets ativos: quatro cantos `conforming` com canvas 1248×1248, bbox `1200x1200+24+24` e planos externos contratuais; seis retas `conforming-reference`; duas portas `measured-only`; zero ocorrência legada. Contrato, candidatos, fontes, runtimes, quatro gabaritos, quatro montagens e o manifesto de todos os PNGs permaneceram byte a byte idênticos.

Os checks finais passaram: `wall-guides:check` validou nove artefatos, `wall-assets:check` validou 12 ativos sem `--allow-legacy-corners`, os quatro candidatos e os quatro runtimes temporários passaram o modo estrito, `format:check` passou e `git diff --check` permaneceu limpo.

### R3 — compositor e hit testing únicos

#### R3-A — transformação visual pura e metadado canônico

**Estado:** `W3-A-R3-A tecnicamente concluída e aceita nominalmente em 2026-09-02`. O usuário aceitou nominalmente R2-B2-B, declarou R2 integralmente concluída e autorizou somente este contrato puro. Nenhum consumidor real foi migrado naquela rodada.

##### Diagnóstico focado

O posicionamento visual permanecia distribuído entre três autoridades:

- `STRUCTURE_CATALOG` conserva `visualOffsetCells`, `visualSpanCells` e `pivot`; `constructionInput` ainda usa os dois primeiros para hit areas;
- `WALL_ASSETS` repetia ID, caminho, span, offset, pivot, escala e depth; `structureRenderPlan`, `SpatialWorldScene` e o compositor histórico leem essa cópia;
- `SpatialWorldScene` combinava a âncora do plano com `asset.offset`, `asset.pivot` e `CELL_SIZE / pixelsPerLogicalCell`, enquanto as zonas eram recalculadas pelo catálogo da aplicação.

Os quatro cantos ainda possuíam offsets legados de até quatro células, e as duas portas mantinham `offset.xCells = -1` nas duas cópias. Persistem somente `definitionId`, `instanceId` e âncora no placement; offsets, pivôs, spans visuais, paths e depth são definições runtime. `structureRenderPlan`, `SpatialWorldScene` e `constructionInput` precisavam permanecer compatíveis até R3-B e, por isso, não foram alterados.

##### Autoridade e transformação puras

`src/features/library-visual/phaser/structureVisualGeometry.ts` contém agora uma única autoridade nova para os 12 assets ativos. Cada entrada fixa definição/textura/path estáveis, orientação, canvas, alpha bbox, 300 pixels-fonte por célula, ponto-fonte de referência, planos de junção, eixos/braços, regiões ocupadas e camada de depth sem objeto Phaser. Os quatro cantos são transcritos do contrato `production`; as seis retas e duas portas correspondem ao relatório derivado vigente.

A transformação recebe definição, placement, orientação normalizada e `placementGeometry` de R1. Sua fórmula, sem arredondamento, é:

```text
scale = CELL_SIZE / sourcePixelsPerCell
joinOrigin = logicalReference * CELL_SIZE
spriteCanvasPosition = joinOrigin - sourceReferencePx * scale
worldBounds = spriteCanvasPosition + sourceBoundsPx * scale
```

Para cantos, `logicalReference` é o vértice e `sourceReferencePx` é o `logicalVertex` production. Para paredes e portas, a referência é o início do intervalo lógico e o primeiro plano longitudinal medido. A saída imutável reúne referência lógica, origem de junção, topo esquerdo do canvas, escala, canvas bounds, alpha bounds, planos em world units, regiões de interação, orientação e descritor de depth. Coordenadas fracionárias e negativas são preservadas.

As regiões lineares seguem o alpha bbox. Cada canto expõe dois corredores — braço horizontal e vertical — em vez do quadrado 4×4 que inclui transparência interna. O deslocamento histórico da porta, `visualSpanCells`, pivôs e offsets legados não participam do cálculo; um teste altera todos esses campos e obtém resultado idêntico.

`wallAssets.ts` passou a derivar sua API histórica da autoridade canônica. Os mesmos 12 IDs, paths, roles, spans, escala, depth, pivô `(0,0)` e offsets legados continuam disponíveis para os consumidores ainda não migrados. Essa projeção é deliberadamente compatível e não é consultada pela transformação nova.

##### Cobertura e composição pura

O teste focado novo cobre:

- 12 definições e correspondência integral com canvas/alpha bbox do `validator-report.json`;
- vértices, planos e áreas permitidas dos quatro cantos `production`;
- escala derivada de `CELL_SIZE`, paredes horizontais/verticais, NE/NW/SE/SW e portas open/closed sem deslocamento longitudinal;
- alinhamento dos dois planos externos de cada canto com retas compatíveis e da porta com segmentos vizinhos;
- ordem de leitura, negativos, frações, ausência de mutação, bounds distintos, dois corredores de interação por canto e rejeição de metadado ausente/incoerente;
- isolamento de offset/pivô/span legado, identidade por definição e estabilidade de `WALL_ASSETS`;
- composição pura da planta canônica com os oito encontros comprovados por planos de junção, sem Phaser ou screenshot.

Baseline anterior: 39 testes em cinco arquivos. A matriz focada com o novo módulo, geometria R1 e as três APIs legadas obrigatórias passou com 59 testes em cinco arquivos; o teste novo isolado possui 25 casos.

##### Arquivos e limitações preservadas

- criado `src/features/library-visual/phaser/structureVisualGeometry.ts` e seu teste focado;
- alterado `wallAssets.ts` somente para derivar a projeção compatível;
- atualizados somente este log, `STATUS.md` e `ROADMAP.md`;
- `SpatialWorldScene`, `structureRenderPlan`, `constructionInput`, `wallComposition`, catálogo de aplicação, blueprint, persistência, UI, assets e guias permaneceram inalterados;
- a porta, os sprites, hit areas, fallback e depth reais ainda usam o caminho legado. R3-A prepara a fonte única, mas não alega correção visual do runtime;
- na entrega de R3-A, R3-B ainda não havia sido iniciada e exigia nova autorização humana nominal, posteriormente concedida após o aceite de R3-A.

#### R3-B — integração do renderer e hit testing

**Estado:** `W3-A-R3-B tecnicamente concluída e aceita nominalmente em 2026-09-02`. R3-A foi aceita nominalmente pelo usuário antes daquela autorização. R3-C ainda não havia sido iniciada naquela entrega.

##### Fluxo ativo e consumidores migrados

O caminho anterior projetava a âncora lógica em `structureRenderPlan`, entregava `WALL_ASSETS` à cena e reaplicava `offset`, `pivot` e escala manual no sprite. Em paralelo, `constructionInput` reconstruía um retângulo a partir de `visualOffsetCells` e `visualSpanCells`. Renderer e seleção podiam, portanto, divergir.

O caminho ativo passa a ser:

```text
StructurePlacement
→ structureVisualTransform
→ StructureRenderPiece.transform
→ structureSpriteProjection
→ sprite Phaser

StructurePlacement
→ structureVisualTransform
→ interactionRegions
→ zonas, seleção, preview e destaque
```

`structureRenderPlan` não consulta mais `STRUCTURE_CATALOG` para span/offset nem `WALL_ASSETS`; ele materializa a transformação canônica, deriva papel e extensão do metadado único e preserva `instanceId`. `SpatialWorldScene` também carrega os 12 paths por `STRUCTURE_VISUAL_ASSETS` e cria cada sprite com `textureKey`, topo esquerdo fracionário do canvas, escala canônica e origin `(0,0)`. Não há offset, pivot, margem corretiva ou arredondamento no renderer.

A fórmula efetivamente consumida permanece a de R3-A:

```text
scale = CELL_SIZE / sourcePixelsPerCell
joinOrigin = logicalReference * CELL_SIZE
spriteCanvasPosition = joinOrigin - sourceReferencePx * scale
```

A porta fechada com âncora `(7,14)` mantém os planos longitudinais em `x=224` e `x=352`; o canvas começa em `x=221,44`, sem a subtração histórica de uma célula. Retas e os quatro cantos usam os planos e insets medidos no contrato `production`. Coordenadas negativas e fracionárias chegam ao sprite sem arredondamento.

##### Regiões compostas e interação

`constructionInput` expõe diretamente os bounds das `interactionRegions` da mesma transformação. Retas e portas produzem uma região. Cada canto produz dois retângulos — braço horizontal e vertical — ambos com o mesmo placement e `instanceId`. A busca de seleção avalia uma única vez cada placement e usa união booleana das regiões; assim, qualquer braço seleciona a peça, a sobreposição no vértice não emite uma segunda seleção e o centro transparente do antigo quadrado 4×4 fica fora da área ativa.

As zonas Phaser, o preview de colocação e o destaque de seleção percorrem essas mesmas regiões. Pan, conversão tela→mundo, snap, validade lógica e commit continuam pertencendo às APIs anteriores e não receberam fórmula paralela.

##### Compatibilidade e limites preservados

- `WALL_ASSETS` ainda exporta offsets, pivôs, spans e demais campos históricos para compatibilidade, e `STRUCTURE_CATALOG` conserva `visualOffsetCells`, `visualSpanCells` e `pivot`; `SpatialWorldScene`, `structureRenderPlan` e `constructionInput` não leem nenhum deles no caminho estrutural ativo;
- `wallComposition.ts` continua histórico, fora do runtime e inalterado;
- o cálculo numérico de depth permanece exatamente `10|50 + joinOrigin.y`, equivalente ao comportamento anterior; R3-B não melhora ordenação;
- o desenho procedimental de fallback, seus retângulos simples e sua política permanecem sem revisão; a correção de fallback e depth pertence a R3-C;
- blueprint, rotação persistida, aplicação R1, schema, backup, grants, milestones, inventário, móveis, pisos, câmera, React, CSS, overlays, assets e pipeline de arte permaneceram fora do escopo;
- não houve screenshot, navegador, teste físico ou aceite visual humano nesta rodada.

##### Cobertura focada

O baseline anterior passou com 59 testes em cinco arquivos. R3-B adicionou ou ampliou testes estruturados para projeção do sprite, porta sem deslocamento, quatro cantos `production`, segmentos, frações, negativos, isolamento de campos legados, identidade/textura, cardinalidade estável e depth inalterado. A interação cobre duas regiões por canto, interior transparente, ambos os braços, interseção única, portas open/closed, movimento/orientação e alinhamento exato com a transformação.

Os cinco testes focados de R3-A/R3-B passaram com 52 casos. A matriz consolidada de geometria, análise e edição R1 mais R3-A/R3-B passou com 105 testes em nove arquivos, incluindo os oito encontros da planta canônica e coerência renderer/input para as 12 definições. `wall-assets:check`, `wall-guides:check`, `format`, `format:check`, `lint`, `typecheck` e `git diff --check` também passaram.

#### R3-C-A — autoridade canônica de depth estrutural

**Estado:** `W3-A-R3-C-A tecnicamente concluída e aceita nominalmente em 2026-09-02`. R3-B foi aceita nominalmente antes daquela autorização. R3-C-B ainda não havia sido iniciada naquela entrega.

##### Inventário anterior à escrita

O único cálculo estrutural ativo estava em `structurePieceDepth`: `10 + joinOrigin.y` para `architecture-back` e `50 + joinOrigin.y` para `architecture-front`, consumido por `SpatialWorldScene`. Na planta canônica, isso produzia faixa traseira de 138 a 458 e faixa frontal em 178, usando a âncora lógica já convertida em world units, sem considerar altura visível, alpha ou braços.

Na mesma `SpatialWorldScene`, móveis e objetos continuam em `40 + object.y + footprint.height`: considerando placements válidos na área vigente e os três footprints conhecidos, sua faixa é 200 a 488; os dois objetos iniciais ficam em 328. Zonas dos objetos usam esse valor +1. Zonas estruturais permanecem em 80, destaque em 89, preview em 90, pisos em 1, arquitetura procedimental de fundo em 2 e feedback estrutural de viewport em 50. Nenhum personagem participa da cena espacial ativa. `InitialLibraryScene` e `RoomSceneRenderer` possuem depths próprios, mas não são consumidores do renderer estrutural ativo e permaneceram inalterados. O cálculo histórico semelhante em `wallComposition.ts` também permaneceu intocado porque o compositor está fora do runtime e fora do escopo.

##### Contrato definido antes da integração

A coordenada visual de ordenação é a borda inferior da união das regiões visivelmente ocupadas: `max(region.bounds.y + region.bounds.height)`. Ela representa a base visível mais baixa de retas, portas e cantos, inclusive quando canvas, alpha bbox e âncora lógica começam em alturas diferentes. Portanto, não depende apenas de `anchor.y` e não precisa reconhecer blueprint, coordenada ou instância especial.

O depth estrutural usa a mesma origem `40` do cálculo vigente do interior e duas sub-bandas simétricas na mesma coordenada visual:

```text
visualSortY = max(bottom das interactionRegions)
depth(back)  = 40 + visualSortY - 0.25
depth(front) = 40 + visualSortY + 0.25
```

Assim, uma estrutura `architecture-back` fica imediatamente atrás de um elemento interior com a mesma base visível, e uma `architecture-front` fica imediatamente à frente, enquanto diferenças reais de Y continuam determinando a ordem espacial. Empates de valor são resolvidos pela chave estável do placement em ordem lexical; `structureRenderPlan` aplica esse comparador antes da criação dos sprites, tornando o resultado independente da ordem do array de entrada sem introduzir epsilon que pudesse inverter coordenadas fracionárias próximas.

##### Autoridade e integração atômica

`structureVisualGeometry` agora declara `visible-bounds-bottom` como referência de ordenação e entrega `visualSortY` junto da transformação. O novo helper puro `structureVisualDepth.ts` é a única fórmula estrutural ativa: recebe a transformação, aplica a origem de interior 40 e o offset de banda `-0,25` ou `+0,25`, e produz valor, camada, coordenada visual e chave estável imutáveis.

`structureRenderPlan` calcula esse descritor uma vez para cada placement, ordena a coleção pelo comparador canônico e mantém `structurePieceDepth` somente como acesso ao valor já calculado. `SpatialWorldScene` continua chamando esse acesso e não recompõe fórmula, banda ou coordenada. Mover ou trocar a definição/orientação refaz a transformação e, consequentemente, `visualSortY` e depth. Sprites com depth idêntico são criados na ordem lexical estável; reverter o array de placements produz o mesmo plano.

Nenhum offset, pivot, span legado, `instanceId` especial, coordenada especial ou fingerprint do blueprint participa do cálculo. `instanceId` é usado genericamente apenas como chave final de desempate, nunca para escolher fórmula ou banda.

##### Regressão e limites preservados

- os 12 assets foram cobertos; retas, portas open/closed e NE/NW/SE/SW mantêm suas camadas declaradas;
- negativos e coordenadas visuais fracionárias são preservados; placements lógicos continuam inteiros conforme o invariante de R1;
- movimento e mudança de orientação recalculam depth, e duas estruturas não trocam de ordem quando o array de entrada é invertido;
- um teste ortogonal comprova que mudar somente o descritor de depth não altera texture, posição, escala, canvas/alpha bounds, planos de junção ou regiões de interação de R3-B;
- `constructionInput`, zonas, destaque, preview, móveis, personagens, fallback, `wallComposition`, assets, guias, scripts, catálogo, blueprint, schema, backup, grants, milestones, React e CSS não foram alterados nesta rodada;
- o desenho procedimental de fallback e a validação visual humana permanecem pendentes para autorização posterior.

O baseline R1 + R3-A + R3-B passou com 105 testes em nove arquivos antes da escrita. A autoridade isolada passou com 12 testes, plano+cena com nove testes e a matriz consolidada R1 + R3-A + R3-B + R3-C-A com 118 testes em dez arquivos. `wall-assets:check`, `wall-guides:check`, `format`, `format:check`, `lint`, `typecheck` e `git diff --check` também passaram; nenhum PNG, guia, contrato ou candidato mudou.

#### R3-C-B1 — fallback procedimental na geometria canônica

**Estado:** `W3-A-R3-C-B1 tecnicamente concluída e aceita nominalmente em 2026-09-02`. O usuário aceitou nominalmente R3-C-A antes daquela autorização.

##### Diagnóstico e ativação anterior

O fallback estrutural existia somente em `SpatialWorldScene.renderWallPiece`: `textures.exists(textureKey)` selecionava o sprite normal quando a textura estava disponível e, quando retornava falso — inclusive após falha de carregamento que deixasse a chave indisponível — criava um único `Phaser.GameObjects.Graphics`. Com todas as 12 texturas válidas, nenhum fallback era criado.

Embora posição inicial e depth já viessem do plano canônico, a forma era recomposta localmente com `widthCells`, `heightCells`, espessura arbitrária `CELL_SIZE × 0,72` e um “L” sempre orientado a partir do topo esquerdo. Isso ignorava a orientação dos quatro cantos, preenchia corredores diferentes dos PNGs e tratava as portas aberta/fechada como o mesmo retângulo lógico. O fallback não criava zonas, hit areas ou listeners: seleção e eventos continuavam nas `structureZones` derivadas por `constructionInput`. Sprites e Graphics eram destruídos e recriados em cada `renderWorld`, além de serem limpos no shutdown.

##### Autoridade e representação novas

O helper puro `structureVisualFallback.ts` recebe o mesmo `StructureVisualTransform` usado pelo sprite e o descritor pronto de `structureVisualDepth`. Ele não consulta offset, pivot, span legado, coordenada de blueprint ou regra particular de porta/canto. Sua saída imutável conserva `instanceId`, definição, depth, bounds, planos de junção e as regiões ocupadas canônicas.

As `interactionRegions` podem representar visualmente o fallback porque não são aproximações de input: em R3-A elas já foram derivadas de `occupiedRegionsPx`, isto é, dos corredores visíveis medidos em pixels-fonte. R3-C-B1 prova adicionalmente que o bounds agregado coincide com o alpha bounds e que cada plano externo coincide com a borda e o perfil da região de mesma parte. Assim:

- cada reta usa seu retângulo visível medido, horizontal ou vertical;
- cada canto desenha somente `horizontal-arm` e `vertical-arm` na orientação NE/NW/SE/SW, sem preencher o quadrado transparente entre os braços;
- as duas portas preservam planos longitudinais `x=224` e `x=352`, sem `offset.xCells=-1`; a aberta mantém a altura visível de 740 pixels-fonte e a fechada, 564, portanto continuam semanticamente distintas;
- coordenadas mundiais negativas e frações originadas pela escala `CELL_SIZE / 300` atravessam a projeção sem arredondamento;
- o Graphics recebe exatamente o mesmo valor de depth produzido em R3-C-A.

`SpatialWorldScene` agora delega a escolha atômica a um adaptador testável: textura disponível configura e cria somente o mesmo sprite de R3-B; textura ausente cria somente um Graphics, registra o `instanceId` como dado e desenha as regiões canônicas. Nenhuma hit area alternativa ou evento é criado. O mesmo ciclo de limpeza destrói cada objeto antes do rerender, cobre movimento/mudança de orientação e remove integralmente um fallback quando a textura volta a ficar disponível ou a instância desaparece.

##### Cobertura e limites preservados

A baseline consolidada R1 + R3-A + R3-B + R3-C-A passou com 118 testes em dez arquivos antes da escrita. Os testes isolados do helper e da cena passaram com 18 casos; a matriz consolidada com R3-C-B1 passou com 134 testes em 11 arquivos. A cobertura força fallback nos 12 assets, verifica bounds/planos, quatro cantos em dois braços, interior transparente, portas distintas e sem deslocamento, negativos/frações, movimento/orientação, depth idêntico, isolamento dos campos legados, caminho normal sem Graphics, cardinalidade, transição fallback→textura e destruição sem objetos órfãos. Os testes de `constructionInput` na mesma matriz preservam hit testing, pan, snap, drag, commit e cardinalidade de eventos.

`wall-assets:check`, `wall-guides:check`, `format`, `format:check`, `lint`, `typecheck` e `git diff --check` passaram. A fórmula/bandas de depth, `constructionInput`, `structureRenderPlan`, `wallComposition`, assets, guias, scripts, catálogo, blueprint, persistência, móveis, personagens, overlays, preview, destaque, React e CSS permaneceram inalterados. Não houve navegador, screenshot, build, E2E, Android, APK nem validação visual humana naquela rodada. A comprovação visual do fallback pertence à R3-C-B2, não sua implementação.

#### R3-C-B2 — composição no renderer ativo e evidência visual

**Estado:** `W3-A-R3-C-B2 tecnicamente não concluída — evidência visual bloqueadora preservada e aguardando correção nominal`. R3-C-B1 foi aceita nominalmente antes da autorização de B2. A primeira tentativa de B2 parou corretamente quando não havia Chromium; após a instalação manual, a retomada produziu as evidências e foi interrompida por cota. A recuperação de 2026-09-03 preservou o estado e formalizou o bloqueio, sem alterar produção.

##### Renderer e harness recuperados

O teste `e2e/w3-a-r3-c-b2.spec.ts` usa o factory Phaser real com estado descartável em memória e a cadeia `WorldStructureState → structureRenderPlan → structureVisualGeometry → SpatialWorldScene → canvas Phaser`. O servidor foi iniciado por Vite em desenvolvimento, sem build. Chromium `151.0.7922.34` executou com `--disable-webgl`, levando `Phaser.AUTO` ao backend Canvas e evitando a exceção de framebuffer do SwiftShader sem mudança de produção. As capturas são screenshots diretos do elemento canvas, sem crop corretivo, escala, deslocamento ou montagem posterior.

Os ajustes da infraestrutura E2E ficaram restritos ao harness: instrumentação da mesma instância Phaser usada pelo factory; conversão world→canvas pela câmera ativa; coleta de sprites e Graphics; supressão externa de disponibilidade de texturas pelo `TextureManager` para forçar fallback sem erro artificial de rede; hashes, dimensões e manifesto determinísticos. O caminho normal continuou sem fallback, o cenário forçado manteve um único Graphics por placement e nenhuma instância teve sprite e fallback simultaneamente.

Sete imagens e `capture-manifest.json` foram preservados em `art-guides/w3-a-r3-c-b2/`. A matriz final executou nove casos: oito passaram — sete cenários/capturas e a validação dos PNGs/hashes — e um falhou precisamente no gate de colinearidade real. Não houve erro de console, exceção Phaser, warning ou request failure nas capturas. Fechamento lógico, coordenadas dos planos, porta sem a antiga célula extra, ordenação independente da entrada, depth com móveis, seleção, destaque, preview e fallback canônico passaram nas asserções estruturadas; isso não supera a falha visual.

##### Divergência bloqueadora

Na sala canônica, `initial.corner.top-right` (`corner-se`, âncora `(15,4)`) ocupa no braço vertical `x=454,826667..480`; `initial.wall.right` (`vertical-2`, âncora `(15,8)`) ocupa `x=480..505,066667`; e `initial.corner.bottom-right` (`corner-ne`, âncora `(15,14)`) volta a `x=454,826667..480`. Seus planos longitudinais coincidem em `y=256` e `y=320`, mas os perfis ficam em lados opostos do eixo lógico `x=480`. Os sprites usam respectivamente posições world `(349,44;125,44)`, `(477,333333;253,44)` e `(349,44;317,44)`. A troca entre centerlines é de aproximadamente `25,12` world units, ou `25,12 px` no zoom 1.

No cômodo modificado, `modified.corner.top-right` (`corner-se`, `(17,2)`), `modified.right.medium-a/b` e `modified.right.short` (`vertical-2/2/1`, `(17,6)`, `(17,8)`, `(17,10)`) e `modified.corner.bottom-right` (`corner-ne`, `(17,15)`) repetem o problema. Os encontros externos em `(17,6)` e `(17,11)` trocam de `x=518,826667..544` para `x=544..569,066667`; encontros reta→reta permanecem colineares. `canonical-room-full.png`, `modified-room-full.png`, `door-states-detail.png` e `fallback-detail.png` exibem o salto à direita.

O lado esquerdo mantém todas as regiões a leste do eixo, com apenas a variação tolerada de um pixel-fonte entre as retas de 235 px e os braços de 236 px (`0,106667` world unit). O lado superior também permanece no mesmo lado transversal. O lado inferior revela a mesma lacuna contratual em outro eixo: braços dos cantos ficam ao norte da aresta, enquanto paredes/porta lineares são projetadas ao sul; na parede inferior modificada, a diferença entre centerlines é `45,76` world units. Os planos longitudinais da porta continuam corretos, mas não definem o lado transversal da espessura.

Os assets `production` e seus metadados de canto são internamente coerentes e não foram modificados. A causa é combinada: os assets lineares são assimétricos em relação ao eixo; seu `sourceReferencePx` é sempre o início do alpha bbox e projeta a ocupação para o lado positivo; os cantos leste/sul ocupam o lado negativo; e placement/geometria lógica não carregam normal, centerline ou side transversal. O contrato valida cada asset e seu alcance ao plano externo; a antiga composição pura agrupava somente coordenada/cardinalidade do encontro, embora `WorldJoinPlane.profile` já exista, e não comparava os perfis vizinhos. Planos coincidentes, portanto, não garantem continuidade de espessura.

O fallback de R3-C-B1 está correto em relação à autoridade atual e por isso reproduz a divergência em `fallback-detail.png`; B2 apenas a comprova visualmente. Nenhum código em `src/`, asset, contrato, script, dependência, blueprint, banco, UI ou CSS foi alterado pela B2/recuperação. R4 não foi iniciado. Uma correção futura exige gate nominal próprio para representar e validar o lado/normal transversal sem offset específico de blueprint.

Na validação de recuperação, `format:check`, `typecheck`, validação independente dos sete PNGs/manifesto e `git diff --check` passaram. `npm run lint` ficou vermelho exclusivamente por quatro parâmetros não usados já preexistentes em `src/features/library-visual/phaser/SpatialWorldScene.test.ts:70` e `:72`; o novo teste E2E não conserva erro de lint. O arquivo em `src/` não foi tocado porque a recuperação proíbe alterações de produção e testes anteriores fora do harness B2.

#### W3-A-R3-C-B2-FIX-A — contrato transversal e oráculo de continuidade

**Estado:** `tecnicamente concluída, aguardando revisão`. Sam autorizou nominalmente somente FIX-A em 2026-09-03. R3-C-B2 permanece 8/9, tecnicamente reprovada/não concluída. FIX-B, FIX-C, a repetição de B2 e R4 não foram iniciadas.

##### Resultado

FIX-A ampliou a autoridade existente em `structureVisualGeometry` e acrescentou `structureVisualContinuity`, um analisador puro, determinístico, independente de Phaser e de blueprint. O analisador aceita composições sintéticas válidas, caracteriza falhas sintéticas sem deixar testes vermelhos e detecta mecanicamente as descontinuidades das três composições reais preservadas de B2. Nenhuma posição ou aparência foi corrigida.

##### Estado inicial e preservação

- HEAD inicial: `02f0fde84a4b620f6c829277bca8b3b4e65fead8` (`02f0fde`);
- `git status --short` inicial: worktree propositalmente sujo, com 33 entradas rastreadas modificadas e 15 não rastreadas, todas provenientes das rodadas W3 anteriores e preservadas; os únicos arquivos novos de FIX-A são `structureVisualContinuity.ts` e seu teste;
- `git diff --check` inicial: passou, sem saída;
- a baseline focada R1/R3 foi descoberta nos caminhos reais e executada antes da escrita: 134/134 testes passaram em 11 arquivos;
- nenhuma alteração preexistente bloqueava a ampliação localizada de `structureVisualGeometry`; o arquivo ainda não rastreado já era a autoridade produzida em R3-A e foi preservado fora do trecho ampliado;
- as sete capturas e o manifesto B2 existiam e foram inspecionados sem regeneração. Hashes iniciais:

| Evidência B2                        | SHA-256 inicial                                                    |
| ----------------------------------- | ------------------------------------------------------------------ |
| `capture-manifest.json`             | `26bd584587259838cb29db16d918875482e9892dd82942f19e388b90c97fb902` |
| `canonical-room-full.png`           | `1ab04d010cd40c50c4883b11de223d96b0de79fdbf141198758d8a1c6a3982d8` |
| `canonical-room-mobile-320x640.png` | `6c146e5510a7007f83773128abb93a7286a6605106df8da874b709cad1bf1f0c` |
| `canonical-room-mobile-360x800.png` | `d9e46317453195f3730db31fade33d9faa4b15e5ba3372e66de6a21a267c799e` |
| `depth-selection-detail.png`        | `022df991bb117328fec7483418fa507e43f6d4654135a78c797f8dd70393f1f2` |
| `door-states-detail.png`            | `118ace0a8eeeff20e15f227e966ab104cd20672f353b7f0ead5a131fa9332c56` |
| `fallback-detail.png`               | `6d752d25639ab09cf143ef89b1cd5b6b7b5c2c80bf69b71e3e5a0e3d41b5a825` |
| `modified-room-full.png`            | `bfac2fbc16bfc85886eddbfbd51fcd60a3114b6f49fa05c0c96fc244577ff0ad` |

##### Arquivos

Criados por FIX-A:

- `src/features/library-visual/phaser/structureVisualContinuity.ts`;
- `src/features/library-visual/phaser/structureVisualContinuity.test.ts`.

Modificados por FIX-A:

- `src/features/library-visual/phaser/structureVisualGeometry.ts`;
- `docs/W3_A_CORRECTION_HANDOFF.md`;
- `docs/W3_A_CORRECTION_LOG.md`;
- `docs/STATUS.md`;
- `docs/ROADMAP.md`;
- `docs/TEST_PLAN.md`;
- `docs/DECISIONS.md`.

Nenhuma dependência foi adicionada, removida ou atualizada.

##### Decisões

FIX-A amplia a autoridade `WorldJoinPlane` já existente, usa offsets transversais relativos ao eixo lógico para evitar perda de precisão e mantém a descoberta de vizinhos como entrada explícita do analisador de coleção. A convenção, os dados reaproveitados e as alternativas de FIX-B estão detalhados nas próximas seções; nenhuma escolha de correção visual foi feita.

##### Inventário do contrato anterior

| Dado anterior                                    | Significado real                                                                                         | Espaço/unidade      | Reuso em FIX-A                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| `SourceJoinPlane.side` / `WorldJoinPlane.side`   | cardinal do endpoint longitudinal (`west/east` ou `north/south`)                                         | sem unidade         | preservado sem mudança semântica; não é o lado transversal ocupado          |
| `SourceJoinPlane.profile`                        | intervalo semiaberto perpendicular ao plano de junção                                                    | pixels-fonte        | origem do perfil comparável                                                 |
| `WorldJoinPlane.profile`                         | projeção absoluta do mesmo intervalo                                                                     | world units         | preservado e exposto também como `transverseProfile.interval`               |
| `alphaBoundsPx`                                  | bbox visível agregado do PNG                                                                             | pixels-fonte        | continua definindo bounds; não substitui o perfil local do plano            |
| `occupiedRegionsPx`                              | regiões visíveis medidas, inclusive dois braços por canto                                                | pixels-fonte        | continua alimentando interação e fallback; não foi alterado                 |
| `sourceReferencePx`                              | ponto do source mapeado ao `logicalReference`; nas retas coincide com o começo transversal do alpha bbox | pixels-fonte        | origem da projeção e dos offsets assinados                                  |
| `sourcePixelsPerCell`                            | densidade do asset, atualmente 300                                                                       | pixels-fonte/célula | `scale = 32 / sourcePixelsPerCell`; um pixel convertido define a tolerância |
| intervalos/endpoints/vértices de R1              | extensão e encontros da estrutura persistida                                                             | células lógicas     | fornecem `logicalEndpoint` geral, sem reconhecimento de sala                |
| `spriteCanvasPosition`, bounds, planos e regiões | transformação canônica consumida por renderer/input/fallback                                             | world units         | valores visuais preservados exatamente                                      |

Não foi criado um segundo sistema de planos. `WorldJoinPlane` continua sendo o contrato canônico e recebeu apenas a semântica que faltava para comparar o `profile` já existente.

##### Convenção transversal exata

- o plano com `axis: "x"` pertence a uma tangente/longitudinal horizontal; sua normal transversal é o eixo `y`, com negativo = `north` e positivo = `south`;
- o plano com `axis: "y"` pertence a uma tangente/longitudinal vertical; sua normal transversal é o eixo `x`, com negativo = `west` e positivo = `east`;
- `logicalEndpoint` vem do endpoint ou vértice lógico de R1. Sua coordenada no eixo normal, multiplicada por `CELL_SIZE`, define `logicalAxisCoordinate`;
- `axisRelativeInterval = [(source.profile.start - sourceReferenceTransverse) × scale, (source.profile.end - sourceReferenceTransverse) × scale)`; a forma semiaberta funciona igualmente com negativos e frações;
- intervalo com `end <= 0` ocupa `negative`; com `start >= 0`, `positive`; cruzando zero, `straddles-axis`. Um intervalo que termina exatamente no eixo e outro que começa exatamente nele somente se tocam: não existe epsilon classificatório;
- `axisRelativeCenterline = (start + end) / 2`; a centerline absoluta soma o eixo lógico; `thickness = end - start`;
- `sourcePixelTolerance = scale`, exatamente um pixel-fonte do próprio asset convertido. A tolerância do par é `max(first.scale, second.scale)`, isto é, no máximo o pixel convertido da escala mais grossa. O plano longitudinal exige igualdade e tolerância zero;
- as diferenças são calculadas nos offsets relativos ao eixo, evitando cancelamento numérico em coordenadas mundiais grandes, negativas ou fracionárias. Nenhum epsilon arbitrário foi introduzido.

##### API do analisador puro

`analyzeStructureVisualContinuity(sources)` recebe uma coleção explícita de `{ definitionId, placementKey, joinPlanes }`. Ele valida a coerência dos planos, agrupa por `logicalEndpoint + longitudinalAxis`, encontra exatamente um fim e um início opostos, ordena chaves/participantes e devolve:

- `compatible` global;
- `junctions`, cada qual com participantes, endpoint, eixo, métricas longitudinais/transversais e `issues` tipadas;
- `unpairedEndpoints` para ausência ou ambiguidade de vizinho;
- relações longitudinais `aligned/gap/overlap`;
- relações transversais `aligned/contained/disjoint/partial-overlap/touching`;
- problemas `longitudinal-gap`, `longitudinal-overlap`, `transverse-side-mismatch`, `centerline-jump`, `transverse-gap`, `transverse-overlap`, `transverse-interval-mismatch` e `thickness-mismatch`.

A busca de vizinhos é uma operação geral sobre a entrada inteira e fica explícita na API da coleção; a transformação individual não consulta estado global. A saída congelada e ordenada independe da ordem dos placements e dos planos.

##### Todas as junções reais avaliadas

Nas tabelas, `H` usa normal `y` (`−north/+south`) e `V` usa normal `x` (`−west/+east`). `P1 → P2` segue o fim do trecho de coordenada menor para o início do trecho de coordenada maior. Cada perfil mostra `lado [intervalo absoluto semiaberto); centerline; espessura`, em world units. A tolerância transversal de todos os pares abaixo é `0,106667`; o plano longitudinal é exato em todos. Códigos: `S` lado, `C` centerline, `G` gap, `O` overlap, `I` intervalo e `T` espessura.

Sala canônica — 8 junções, 4 compatíveis e 4 incompatíveis:

| Eixo:endpoint | P1 → P2                                               | Perfil P1                                    | Perfil P2                                    | Resultado            |
| ------------- | ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------- |
| H:(11,14)     | `initial.door.bottom` → `initial.corner.bottom-right` | + `[448..508,16)`; 478,08; 60,16             | − `[402,24..448)`; 425,12; 45,76             | incompatível S/C/I/T |
| H:(11,4)      | `initial.wall.top` → `initial.corner.top-right`       | + `[128..173,76)`; 150,88; 45,76             | + `[128..173,76)`; 150,88; 45,76             | compatível           |
| H:(7,14)      | `initial.corner.bottom-left` → `initial.door.bottom`  | − `[402,24..448)`; 425,12; 45,76             | + `[448..508,16)`; 478,08; 60,16             | incompatível S/C/I/T |
| H:(7,4)       | `initial.corner.top-left` → `initial.wall.top`        | + `[128..173,76)`; 150,88; 45,76             | + `[128..173,76)`; 150,88; 45,76             | compatível           |
| V:(15,10)     | `initial.wall.right` → `initial.corner.bottom-right`  | + `[480..505,066667)`; 492,533333; 25,066667 | − `[454,826667..480)`; 467,413333; 25,173333 | incompatível S/C/I   |
| V:(15,8)      | `initial.corner.top-right` → `initial.wall.right`     | − `[454,826667..480)`; 467,413333; 25,173333 | + `[480..505,066667)`; 492,533333; 25,066667 | incompatível S/C/I   |
| V:(3,10)      | `initial.wall.left` → `initial.corner.bottom-left`    | + `[96..121,066667)`; 108,533333; 25,066667  | + `[96..121,173333)`; 108,586667; 25,173333  | compatível           |
| V:(3,8)       | `initial.corner.top-left` → `initial.wall.left`       | + `[96..121,173333)`; 108,586667; 25,173333  | + `[96..121,066667)`; 108,533333; 25,066667  | compatível           |

Composição modificada — 15 junções, 10 compatíveis e 5 incompatíveis:

| Eixo:endpoint | P1 → P2                                                  | Perfil P1                                    | Perfil P2                                    | Resultado            |
| ------------- | -------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------- |
| H:(10,15)     | `modified.bottom.door` → `modified.bottom.medium`        | + `[480..558,933333)`; 519,466667; 78,933333 | + `[480..525,76)`; 502,88; 45,76             | incompatível C/I/T   |
| H:(10,2)      | `modified.top.long` → `modified.top.medium`              | + `[64..109,76)`; 86,88; 45,76               | + `[64..109,76)`; 86,88; 45,76               | compatível           |
| H:(12,15)     | `modified.bottom.medium` → `modified.bottom.short`       | + `[480..525,76)`; 502,88; 45,76             | + `[480..525,76)`; 502,88; 45,76             | compatível           |
| H:(12,2)      | `modified.top.medium` → `modified.top.short`             | + `[64..109,76)`; 86,88; 45,76               | + `[64..109,76)`; 86,88; 45,76               | compatível           |
| H:(13,15)     | `modified.bottom.short` → `modified.corner.bottom-right` | + `[480..525,76)`; 502,88; 45,76             | − `[434,24..480)`; 457,12; 45,76             | incompatível S/C/I   |
| H:(13,2)      | `modified.top.short` → `modified.corner.top-right`       | + `[64..109,76)`; 86,88; 45,76               | + `[64..109,76)`; 86,88; 45,76               | compatível           |
| H:(6,15)      | `modified.corner.bottom-left` → `modified.bottom.door`   | − `[434,24..480)`; 457,12; 45,76             | + `[480..558,933333)`; 519,466667; 78,933333 | incompatível S/C/I/T |
| H:(6,2)       | `modified.corner.top-left` → `modified.top.long`         | + `[64..109,76)`; 86,88; 45,76               | + `[64..109,76)`; 86,88; 45,76               | compatível           |
| V:(17,10)     | `modified.right.medium-b` → `modified.right.short`       | + `[544..569,066667)`; 556,533333; 25,066667 | + `[544..569,066667)`; 556,533333; 25,066667 | compatível           |
| V:(17,11)     | `modified.right.short` → `modified.corner.bottom-right`  | + `[544..569,066667)`; 556,533333; 25,066667 | − `[518,826667..544)`; 531,413333; 25,173333 | incompatível S/C/I   |
| V:(17,6)      | `modified.corner.top-right` → `modified.right.medium-a`  | − `[518,826667..544)`; 531,413333; 25,173333 | + `[544..569,066667)`; 556,533333; 25,066667 | incompatível S/C/I   |
| V:(17,8)      | `modified.right.medium-a` → `modified.right.medium-b`    | + `[544..569,066667)`; 556,533333; 25,066667 | + `[544..569,066667)`; 556,533333; 25,066667 | compatível           |
| V:(2,10)      | `modified.left.long` → `modified.left.short`             | + `[64..89,173333)`; 76,586667; 25,173333    | + `[64..89,066667)`; 76,533333; 25,066667    | compatível           |
| V:(2,11)      | `modified.left.short` → `modified.corner.bottom-left`    | + `[64..89,066667)`; 76,533333; 25,066667    | + `[64..89,173333)`; 76,586667; 25,173333    | compatível           |
| V:(2,6)       | `modified.corner.top-left` → `modified.left.long`        | + `[64..89,173333)`; 76,586667; 25,173333    | + `[64..89,173333)`; 76,586667; 25,173333    | compatível           |

Composição de portas — 8 junções, 2 compatíveis e 6 incompatíveis:

| Eixo:endpoint | P1 → P2                                               | Perfil P1                                    | Perfil P2                                    | Resultado            |
| ------------- | ----------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------- |
| H:(11,14)     | `initial.door.bottom` → `initial.corner.bottom-right` | + `[448..508,16)`; 478,08; 60,16             | − `[402,24..448)`; 425,12; 45,76             | incompatível S/C/I/T |
| H:(11,4)      | `detail.door.open` → `initial.corner.top-right`       | + `[128..206,933333)`; 167,466667; 78,933333 | + `[128..173,76)`; 150,88; 45,76             | incompatível C/I/T   |
| H:(7,14)      | `initial.corner.bottom-left` → `initial.door.bottom`  | − `[402,24..448)`; 425,12; 45,76             | + `[448..508,16)`; 478,08; 60,16             | incompatível S/C/I/T |
| H:(7,4)       | `initial.corner.top-left` → `detail.door.open`        | + `[128..173,76)`; 150,88; 45,76             | + `[128..206,933333)`; 167,466667; 78,933333 | incompatível C/I/T   |
| V:(15,10)     | `initial.wall.right` → `initial.corner.bottom-right`  | + `[480..505,066667)`; 492,533333; 25,066667 | − `[454,826667..480)`; 467,413333; 25,173333 | incompatível S/C/I   |
| V:(15,8)      | `initial.corner.top-right` → `initial.wall.right`     | − `[454,826667..480)`; 467,413333; 25,173333 | + `[480..505,066667)`; 492,533333; 25,066667 | incompatível S/C/I   |
| V:(3,10)      | `initial.wall.left` → `initial.corner.bottom-left`    | + `[96..121,066667)`; 108,533333; 25,066667  | + `[96..121,173333)`; 108,586667; 25,173333  | compatível           |
| V:(3,8)       | `initial.corner.top-left` → `initial.wall.left`       | + `[96..121,173333)`; 108,586667; 25,173333  | + `[96..121,066667)`; 108,533333; 25,066667  | compatível           |

Nos encontros direitos canônicos, `492,533333 − 467,413333 = 25,12`. No encontro inferior modificado entre reta e canto, `502,88 − 457,12 = 45,76`. Os valores coincidem com a evidência B2 na precisão adequada e surgem do contrato geral. Não há gap longitudinal. Nos pares reta/canto opostos, os intervalos transversais somente se tocam no eixo (`gap = 0`, `overlap = 0`) e por isso o diagnóstico combina lado, centerline e intervalo, em vez de inventar uma distância vazia. A diferença de 235/236 pixels dos perfis verticais esquerdos é exatamente a tolerância de um pixel-fonte e permanece compatível.

##### Ausência de mudança visual

A regressão serializa antes/depois e exige igualdade exata de `spriteCanvasPosition`, `joinOrigin`, `sourceReferencePx`, escala, canvas/alpha bounds, `interactionRegions`, depth, fallback e chave/ordem do render plan. O analisador apenas lê planos já derivados. `SpatialWorldScene`, `constructionInput`, preview, destaque, hit testing e os metadados dos 12 assets não foram modificados. A forma do fallback é comparada diretamente à mesma análise da transformação e produz saída idêntica.

##### Alternativas para FIX-B

| Alternativa                                            | Evidência/efeito                                                                                                                                               | Avaliação                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| centralizar todo perfil em torno do eixo lógico        | independe de lado, mas deslocaria retas e cantos de ambos os lados, mudaria a silhueta inteira e não resolve por si só o alpha bbox mais alto das portas       | geral, porém ampla demais e com maior risco visual                               |
| deslocamento assinado somente por definição/orientação | os cantos carregam NE/NW/SE/SW, mas a mesma definição `vertical-*` ou `horizontal-*` é usada nos dois lados opostos da sala                                    | insuficiente sem inventar estado no placement ou reconhecer coordenadas          |
| derivação por conectividade/topologia                  | `WorldStructureState` já contém piso, arestas, endpoints e perímetro; a célula interior adjacente distingue norte/sul/leste/oeste para qualquer cômodo fechado | menor regra geral capaz de escolher o sinal sem schema, blueprint ou ID especial |
| refinar o perfil local do endpoint                     | o `profile` já é por plano; portas usam hoje o alpha bbox integral (564/740 px) embora a seção visual junto ao batente possa ser menor                         | complemento contratual provável para portas, a medir/validar sem editar PNG      |
| normalizar/regerar PNGs                                | alteraria assets já aprovados e deslocaria o problema para o pipeline de arte                                                                                  | fora do escopo e não recomendada                                                 |

**Recomendação mínima para eventual FIX-B:** derivar da topologia/perímetro a normal interior de cada trecho, fornecê-la como entrada geral e explícita ao render plan/transformação e aplicar um único alinhamento assinado de perfil. O placement persistido não precisa mudar: as `floorCells` e arestas atuais já representam a informação. No mesmo gate, antes de mover a porta, deve-se decidir e testar se seu `SourceJoinPlane.profile` precisa representar a seção visível no endpoint em vez do bbox total; isso evita usar a altura da folha como espessura do batente. Essa recomendação não autoriza nem implementa FIX-B.

##### Dependências

Nenhuma dependência foi adicionada, removida ou atualizada. O módulo usa somente tipos e autoridades internas existentes.

##### Testes manuais pendentes

Nenhum teste manual pertence a FIX-A. Não houve novo screenshot, aparelho, TalkBack, áudio percebido ou performance física. B2 não foi repetida e sua futura validação visual permanece bloqueada por FIX-B/FIX-C.

##### Riscos e limitações

- limitação revelada: portas expõem no plano o perfil transversal do alpha bbox total, causando diferenças de 33,173333 world units na aberta e 14,4 na fechada contra a reta; FIX-A corretamente caracteriza o contrato vigente, mas não decide qual seção visual futura deve valer no endpoint;
- nenhum dado persistido, PNG, blueprint, manifest, hash `production`, catálogo recorrente, schema, backup, grant, milestone, UI ou renderer precisou mudar;
- existe uma convenção única para retas, portas e os dois braços de cada canto. A topologia/floor adjacency necessária para escolher o sinal futuro já está representada em `WorldStructureState`, portanto nenhuma condição de parada foi acionada;
- uma futura regra de topologia deve permanecer entrada explícita da autoridade visual; escondê-la na transformação individual recriaria acoplamento global.

##### Validação automática

| Comando                                                       | Resultado                                                                                                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| baseline R1/R3 antes da escrita                               | passou: 134 testes em 11 arquivos                                                                                                                       |
| novo contrato/analisador                                      | passou: 16 testes em 1 arquivo                                                                                                                          |
| matriz focada geometria/render plan/depth/fallback/input/cena | passou: 150 testes em 12 arquivos, incluindo os 16 novos                                                                                                |
| `npm run format`                                              | passou; Prettier não mudou arquivo fora do conjunto já formatado                                                                                        |
| `npm run format:check`                                        | passou                                                                                                                                                  |
| `npm run lint`                                                | falhou exclusivamente pelos quatro parâmetros não usados preexistentes em `SpatialWorldScene.test.ts:70/72`; zero erro novo de FIX-A                    |
| `npm run typecheck`                                           | passou                                                                                                                                                  |
| `npm run wall-assets:check`                                   | passou: 12 PNGs ativos, quatro cantos `conforming`, zero canto legado não conforme                                                                      |
| `npm run wall-guides:check`                                   | passou: 9 artefatos determinísticos                                                                                                                     |
| `git diff --check`                                            | passou, sem saída                                                                                                                                       |
| `git status --short`                                          | worktree sujo preservado: 33 entradas rastreadas modificadas e 17 não rastreadas; o acréscimo sobre a baseline são somente os 2 arquivos novos de FIX-A |

Build, suíte global, E2E B2, Android sync/build e APK não foram executados porque o prompt os manteve fora deste subgate e nenhuma exigência real do repositório os tornou necessários.

##### Preservação de PNGs e evidências

Os oito hashes B2 da tabela inicial foram reconferidos no fechamento e permaneceram idênticos. Os 12 PNGs-fonte e os 12 runtimes também conservam os hashes registrados em R2; em particular, fontes NE/NW/SE/SW continuam `dd300e…`, `b9f370…`, `ebc988…`, `063723…`, e runtimes NE/NW/SE/SW continuam `017940…`, `eb6ecc…`, `a19899…`, `6e6612…`. Nenhuma ferramenta de geração foi executada.

##### Documentação atualizada

Somente os seis documentos autorizados foram ajustados: este log, handoff, status, roadmap, plano de testes e D-NEW-14 em decisões. A revisão/remanejamento geral foi deliberadamente preservada para o encerramento integral da rodada corretiva.

##### Estado Git

Nenhum commit, tag, push, rebase, reset, checkout destrutivo ou mudança de versão foi realizado. O worktree preexistente permaneceu preservado.

##### Recomendação de gate

A recomendação técnica é aprovar FIX-A: o contrato/oráculo cumpre o escopo e os checks ficaram verdes, com a única falha de lint preexistente e explicitamente fora do gate. A única continuação possível depois de revisão e autorização nominal é `W3-A-R3-C-B2-FIX-B`. FIX-C, repetição de B2, R4, R5 e R6 continuam bloqueados/não iniciados.

#### W3-A-R3-C-B2-FIX-B1 — contrato semântico de encaixe das portas

**Estado:** `tecnicamente concluída, aguardando revisão`. Sam aceitou nominalmente FIX-A, aceitou a condição de parada da primeira tentativa de FIX-B e confirmou que ela não escreveu arquivos. Em seguida, autorizou exclusivamente FIX-B1 e decidiu que porta aberta/fechada substitui o mesmo trecho horizontal de quatro células com interfaces oeste/leste iguais ao corredor estrutural oficial. FIX-B2, FIX-C, a repetição de B2 e R4 não foram iniciadas; R3-C-B2 permanece 8/9, tecnicamente reprovada/não concluída.

##### Resultado

FIX-B1 separou no sistema de planos existente a conexão estrutural contínua do envelope visual. A classe única `stone-01-horizontal-corridor` resolve o perfil `[24,453)` da autoridade `referenceProfiles.horizontal`, com 429 px-fonte ou `45,76` world units. Retas horizontais, braços horizontais dos quatro cantos e endpoints oeste/leste das portas aberta/fechada referenciam essa mesma classe. `SourceJoinPlane.profile` e `WorldJoinPlane.profile` alimentam o analisador; `visualProfile`, alpha bounds e regiões ocupadas conservam folha, moldura, arco, sombra e projeções para renderer, bounds, interação, fallback e depth.

Nenhuma posição mudou. FIX-B1 não consulta topologia, não deriva normal interior e não aplica alinhamento assinado. O passo relativo `after-reference → [r,r+t)` ou `before-reference → [r-t,r)` apenas resolve o perfil fonte vigente de cada braço usando a espessura compartilhada; ele não translada canvas nem escolhe lado por placement.

##### Estado inicial

- HEAD: `02f0fde84a4b620f6c829277bca8b3b4e65fead8` (`02f0fde`);
- `git status --short`: 33 arquivos rastreados modificados e 17 não rastreados, 50 entradas no total; fingerprint SHA-256 `820fc26b5173e81c5ac0c55f5297ca472dd8fefe0965367acff961c8aa9f522c`;
- `git diff --check`: passou, sem saída;
- os dois arquivos criados em FIX-A e sua documentação estavam presentes;
- a baseline de FIX-A passou antes da escrita: 150/150 testes em 12 arquivos;
- os oito hashes B2 e os 24 PNGs estruturais coincidiram com os registros de FIX-A/R2;
- não surgiu sobreposição incompreensível. O worktree propositalmente sujo foi preservado.

##### Arquivos

Alterados por FIX-B1 no contrato/código/testes:

- `art-guides/w3-a-r2-a/wall-corner-contract.json`;
- `art-guides/w3-a-r2-a/validator-report.json`, regenerado pelo comando oficial;
- `scripts/generate-wall-corner-guides.mjs`;
- `scripts/process-wall-assets.mjs` e seu teste;
- `scripts/wall-asset-metrics.mjs` e seu teste;
- `structureVisualGeometry.ts` e seu teste;
- `structureVisualFallback.ts` e seu teste;
- `structureVisualContinuity.test.ts`.

Documentação mínima alterada: este log, handoff, status, roadmap, plano de testes e decisões. Nenhum arquivo foi criado e nenhuma dependência mudou em B1.

##### Autoridade e representação máquina-legível

`wall-corner-contract.json` é fonte, não artefato derivado: `generate-wall-corner-guides.mjs` e `process-wall-assets.mjs` o leem. A versão 2 acrescenta à referência horizontal a classe, a política de perfil contínuo/envelope e a regra de suporte nos endpoints; cada reta/porta horizontal e cada orientação de canto referencia a classe nominal. O runtime importa essa fonte, valida `end − start = thickness` e expõe uma coleção congelada de classes. Um plano declara discriminadamente `measured` ou `compatibility-reference`; a resolução falha para classe/referência incoerente, e o validador rejeita membros divergentes.

O único artefato derivado alterado foi `validator-report.json`, de `ab428930f6d41c2d1d8ded61c40370cefba2b158af1b46755cc05d2974ebd0f8` para `7f9fae2e36a1777d97d728e27a3d712d201cfe06daacf12616358e9f17a48be5`, registrando contrato v2, classe, intervalo, espessura, política e membros. O contrato fonte mudou de `62bd2a2f4f418c4c5ffee728703902144a1328180ed6d905950f9cf9a9618c62` para `2547195b94f3ebc25e8940eadb2b9ae639f9da608a805945d88aee8ff6927a04`. Os quatro gabaritos e quatro montagens regenerados pelo comando oficial mantiveram seus hashes.

##### Perfil das portas e sanidade alpha

| Estado  | Envelope alpha global |   Envelope local observado no plano |   Perfil estrutural |                  World units |
| ------- | --------------------: | ----------------------------------: | ------------------: | ---------------------------: |
| fechada |   564 px (`[24,588)`) |        oeste ~542 px; leste ~543 px | 429 px (`[24,453)`) | `[0,45,76)` relativo ao eixo |
| aberta  |   740 px (`[24,764)`) | 618 px, descontínuo, nos dois lados | 429 px (`[24,453)`) | `[0,45,76)` relativo ao eixo |

Folha e batente não foram inferidos por connected components: a decisão humana define semanticamente a interface, e o PNG achatado permanece envelope visual. A checagem read-only colapsa somente cada linha da faixa lateral de largura `outerPaddingPx` e exige alpha em todas as linhas do corredor, salvo a tolerância já existente. Fonte e runtime, aberta e fechada, oeste e leste possuem exatamente uma linha sem suporte; isso cabe no único pixel-fonte permitido. O validador não segmenta a folha, não amplia tolerância e rejeita fixture com três linhas sem suporte.

##### Antes/depois das 31 junções

Códigos preservados de FIX-A: `S` lado, `C` centerline, `G` gap, `O` overlap, `I` intervalo e `T` espessura. Todos os planos longitudinais continuam exatos e não surgiram endpoints ausentes/ambíguos.

| Composição | Eixo:endpoint | P1 → P2                                                  | Antes FIX-B1         | Depois FIX-B1      |
| ---------- | ------------- | -------------------------------------------------------- | -------------------- | ------------------ |
| canônica   | H:(11,14)     | `initial.door.bottom` → `initial.corner.bottom-right`    | incompatível S/C/I/T | incompatível S/C/I |
| canônica   | H:(11,4)      | `initial.wall.top` → `initial.corner.top-right`          | compatível           | compatível         |
| canônica   | H:(7,14)      | `initial.corner.bottom-left` → `initial.door.bottom`     | incompatível S/C/I/T | incompatível S/C/I |
| canônica   | H:(7,4)       | `initial.corner.top-left` → `initial.wall.top`           | compatível           | compatível         |
| canônica   | V:(15,10)     | `initial.wall.right` → `initial.corner.bottom-right`     | incompatível S/C/I   | incompatível S/C/I |
| canônica   | V:(15,8)      | `initial.corner.top-right` → `initial.wall.right`        | incompatível S/C/I   | incompatível S/C/I |
| canônica   | V:(3,10)      | `initial.wall.left` → `initial.corner.bottom-left`       | compatível           | compatível         |
| canônica   | V:(3,8)       | `initial.corner.top-left` → `initial.wall.left`          | compatível           | compatível         |
| modificada | H:(10,15)     | `modified.bottom.door` → `modified.bottom.medium`        | incompatível C/I/T   | compatível         |
| modificada | H:(10,2)      | `modified.top.long` → `modified.top.medium`              | compatível           | compatível         |
| modificada | H:(12,15)     | `modified.bottom.medium` → `modified.bottom.short`       | compatível           | compatível         |
| modificada | H:(12,2)      | `modified.top.medium` → `modified.top.short`             | compatível           | compatível         |
| modificada | H:(13,15)     | `modified.bottom.short` → `modified.corner.bottom-right` | incompatível S/C/I   | incompatível S/C/I |
| modificada | H:(13,2)      | `modified.top.short` → `modified.corner.top-right`       | compatível           | compatível         |
| modificada | H:(6,15)      | `modified.corner.bottom-left` → `modified.bottom.door`   | incompatível S/C/I/T | incompatível S/C/I |
| modificada | H:(6,2)       | `modified.corner.top-left` → `modified.top.long`         | compatível           | compatível         |
| modificada | V:(17,10)     | `modified.right.medium-b` → `modified.right.short`       | compatível           | compatível         |
| modificada | V:(17,11)     | `modified.right.short` → `modified.corner.bottom-right`  | incompatível S/C/I   | incompatível S/C/I |
| modificada | V:(17,6)      | `modified.corner.top-right` → `modified.right.medium-a`  | incompatível S/C/I   | incompatível S/C/I |
| modificada | V:(17,8)      | `modified.right.medium-a` → `modified.right.medium-b`    | compatível           | compatível         |
| modificada | V:(2,10)      | `modified.left.long` → `modified.left.short`             | compatível           | compatível         |
| modificada | V:(2,11)      | `modified.left.short` → `modified.corner.bottom-left`    | compatível           | compatível         |
| modificada | V:(2,6)       | `modified.corner.top-left` → `modified.left.long`        | compatível           | compatível         |
| portas     | H:(11,14)     | `initial.door.bottom` → `initial.corner.bottom-right`    | incompatível S/C/I/T | incompatível S/C/I |
| portas     | H:(11,4)      | `detail.door.open` → `initial.corner.top-right`          | incompatível C/I/T   | compatível         |
| portas     | H:(7,14)      | `initial.corner.bottom-left` → `initial.door.bottom`     | incompatível S/C/I/T | incompatível S/C/I |
| portas     | H:(7,4)       | `initial.corner.top-left` → `detail.door.open`           | incompatível C/I/T   | compatível         |
| portas     | V:(15,10)     | `initial.wall.right` → `initial.corner.bottom-right`     | incompatível S/C/I   | incompatível S/C/I |
| portas     | V:(15,8)      | `initial.corner.top-right` → `initial.wall.right`        | incompatível S/C/I   | incompatível S/C/I |
| portas     | V:(3,10)      | `initial.wall.left` → `initial.corner.bottom-left`       | compatível           | compatível         |
| portas     | V:(3,8)       | `initial.corner.top-left` → `initial.wall.left`          | compatível           | compatível         |

Resumo: canônica 4/8 → 4/8; modificada 10/15 → 11/15; portas 2/8 → 4/8. A mudança matemática é somente `t_porta: 564|740 → 429 px` para continuidade: a porta aberta passa de `78,933333` para `45,76` world units e a fechada, de `60,16` para `45,76`; o envelope visual continua nos valores anteriores. Não resta `thickness-mismatch` de porta. Os saltos `25,12` e `45,76` ainda existem onde os lados não foram alinhados, como esperado antes de FIX-B2.

##### Validação automática

| Comando                                                  | Resultado                                                                                                            |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| baseline FIX-A antes da escrita                          | passou: 150/150 testes em 12 arquivos                                                                                |
| contrato visual/continuidade + matriz R1/R3/FIX-A/FIX-B1 | passou: 171/171 testes em 14 arquivos                                                                                |
| `npm run format` / `npm run format:check`                | passaram                                                                                                             |
| `npm run lint`                                           | falhou somente pelos quatro parâmetros não usados preexistentes em `SpatialWorldScene.test.ts:70/72`; zero erro novo |
| `npm run typecheck`                                      | passou                                                                                                               |
| `npm run wall-assets:check`                              | passou: 12 PNGs, duas portas `conforming-structural-profile` e zero canto legado                                     |
| `npm run wall-guides:check`                              | passou: 9 artefatos determinísticos                                                                                  |
| `git diff --check`                                       | passou, sem saída                                                                                                    |

Não foram executados E2E B2, screenshots, suíte global, build, performance, Android, APK ou teste manual. Os oito artefatos B2 mantiveram os hashes registrados em FIX-A; os 12 PNGs-fonte e 12 runtimes mantiveram os hashes de R2. Nenhum PNG, dado persistido, schema Dexie v7, backup v5/v4, blueprint, inventário, grant, progressão, sessão, UI, versão, `SpatialWorldScene`, input, preview ou destaque foi alterado.

##### Riscos, documentação e Git

FIX-B1 deliberadamente não corrige os lados/centerlines ainda incompatíveis. `structureVisualFallback` recebeu somente a distinção necessária para validar o envelope visual por `visualProfile`; desenho, bounds, regiões, depth e autoridade da transformação permanecem os mesmos. A documentação mínima autorizada foi atualizada sem reorganização.

Nenhum commit, tag, push, rebase, reset, checkout destrutivo ou mudança de versão foi realizado. A recomendação técnica é aprovar FIX-B1 e aguardar autorização nominal de `W3-A-R3-C-B2-FIX-B2`. FIX-C, repetição de B2 e R4 permanecem bloqueadas/não iniciadas.

#### Reparo diagnóstico de inicialização anterior a FIX-B2

**Estado:** `tecnicamente concluído, aguardando revisão`. Antes de iniciar FIX-B2, a aplicação foi reproduzida no navegador com React, dados e alternativa acessível carregados, mas diagnóstico `failed`, 1 instância criada, 0 ativa e 0 canvas. A rejeição capturada pelo host foi recuperada: `TypeError: Cannot read properties of undefined (reading 'getTweens')`, originada em `SpatialWorldScene.runtimeSnapshot()`.

A factory cria `Phaser.Game` e resolve antes de `SpatialWorldScene.create()` terminar. O host marca a instância pronta e consulta imediatamente `runtimeSnapshot()`; nessa janela, os plugins `tweens` e `children` ainda não foram injetados. A exceção entra no `.catch()` da cadeia de criação, que limpa a instância e troca o host pelo fallback React. Isso explica exatamente a transição 1 criada → 0 ativa e a remoção do canvas. `structureVisualGeometry` e `structureVisualFallback` foram inspecionados e não participam da stack; ao neutralizar somente o snapshot prematuro, a cena B1 renderizou normalmente.

A correção mínima ficou em `SpatialWorldScene.runtimeSnapshot()`: enquanto `rendered === false`, retorna um snapshot vazio e tipado; depois do primeiro `renderWorld`, conserva a leitura real de tweens, display objects, FPS e zonas. A regressão instancia a scene antes do boot e prova que o diagnóstico não acessa plugins ausentes. Não houve mudança de posição, transformação, fallback, depth, input, dados, contrato da porta ou PNG.

| Validação                                        | Resultado                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| regressão + host/geometria/continuidade/fallback | 84/84 em 5 arquivos                                                                                                             |
| matriz R1/R3/FIX-A/FIX-B1 + regressão            | 172/172 em 14 arquivos                                                                                                          |
| navegador DEV                                    | `ready`, 1 instância ativa, 1 canvas visível 1184×900, 67 display objects, 2 zonas, zero exceção                                |
| preview do build                                 | 1 canvas visível 1184×900, sem fallback ou erro                                                                                 |
| Prettier focado                                  | passou                                                                                                                          |
| `npm run typecheck`                              | passou                                                                                                                          |
| `npm run build`                                  | passou; somente aviso não bloqueador de chunks grandes                                                                          |
| `npm run lint`                                   | falhou apenas nos mesmos quatro parâmetros não usados preexistentes, agora em `SpatialWorldScene.test.ts:86/88`; zero erro novo |
| `git diff --check`                               | passou                                                                                                                          |

Os 24 PNGs estruturais, `wall-corner-contract.json` (`2547195…`) e os oito artefatos B2 conservaram os hashes registrados. Não houve E2E B2, screenshot persistido, suíte global, performance, Android, APK, commit ou push. FIX-B2, FIX-C, repetição de B2 e R4 permanecem não iniciados.

#### Sincronização documental e handoff

W3-A-DOC-SYNC-HANDOFF não reinterpreta nem corrige o resultado: R3-C-B2 foi executada, terminou com 8/9 casos e está tecnicamente reprovada/não concluída. A causa combinada permanece a assimetria transversal dos assets lineares, `sourceReferencePx` linear no início do alpha bbox, braços leste/sul dos cantos no lado oposto e ausência de semântica explícita de normal/lado/centerline/perfil transversal compartilhado. O `side` hoje presente em `WorldJoinPlane` identifica o lado longitudinal do plano de junção; ele não define a lateral ocupada em relação ao eixo lógico. Os testes anteriores provaram endpoints e planos, mas não a continuidade dos perfis transversais vizinhos.

O handoff conciso está em [`W3_A_CORRECTION_HANDOFF.md`](W3_A_CORRECTION_HANDOFF.md). O próximo gate recomendado recebe o nome provisório **W3-A-R3-C-B2-FIX**, deverá ser subdividido e depende de autorização humana nominal. Ele não foi iniciado. R4 e as etapas posteriores também não foram iniciadas. Nenhum código, teste, asset ou artefato de evidência foi alterado por esta sincronização documental.

### R4 — máquina de estados e UI mobile

- reducer/estado discriminado com transições exclusivas para explorar, palette, placing, selecting, moving, floor e confirmação;
- iniciar moving fecha lista/sheet e substitui o cartão, sem empilhamento;
- “Peças colocadas” vira alternativa sob demanda e rolável, não overlay permanente;
- mapa conserva a maior área interativa; overlays convencionais incompatíveis ficam fechados durante construção;
- layout prova 320×640, 360×800, texto maior, alto contraste e safe areas nos quatro lados;
- Escape e Android Back compartilham a mesma ordem de fechamento antes de sair/encerrar o app.

### R5 — compatibilidade e regressão integrada — concluída em 2026-09-06

- os dois arquivos focados de backup/restauração e lifecycle do host passaram com 49/49 testes;
- o smoke Selenium/Firefox isolado passou pela interface pública, com um reload, registro fictício preservado e 8 peças estruturais antes/depois;
- Dexie v7, backup v5/leitores v1–v4, estrutura, inventário/grants, rotas, Android Back, safe areas e Capacitor foram auditados sem regressão objetiva;
- build web, sync Android e build debug passaram; o APK técnico foi gerado sem instalação ou aprovação física;
- documentação e relatório de gate foram atualizados sem executar suíte global, E2E completo, B2, matriz 31/31, assets, performance ou acessibilidade.

## Riscos

| Área           | Risco                                                                          | Restrição para a correção                                                                           |
| -------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| schema         | adicionar fingerprint persistido exigiria nova versão Dexie                    | preferir assinatura calculada em R1; migrar schema somente com necessidade comprovada e autorização |
| backup         | backup v5 carrega `worldStructure`; reescrita ingênua perde construção pessoal | preservar qualquer estado que não seja match exato do canônico conhecido                            |
| migração       | `initializeIfAbsent` não atualiza instalações existentes                       | não trocar blueprint por ausência de fingerprint; definir classificador antes                       |
| IDs            | `definitionId` está em dados persistidos                                       | manter IDs ou fornecer migração explícita e testada                                                 |
| arte           | runtime e fonte hoje são pixel-identical                                       | preservar `art-source`; normalização deve ser gerada, auditável e aprovada visualmente              |
| compositor     | catálogo duplicado pode divergir novamente                                     | consolidar transformação antes de ampliar o catálogo                                                |
| grants         | estoque é por família, não orientação                                          | não converter variantes em estoques independentes                                                   |
| acessibilidade | remover a lista permanente pode retirar a alternativa ao canvas                | torná-la sob demanda e plenamente operável, não eliminá-la                                          |

## Decisões humanas — snapshot anterior a FIX-B2

Resolvidas até FIX-B1:

1. R0 foi aceito para prosseguimento e R1 foi autorizada nominalmente em duas partes;
2. schema v7 e backup v5 foram preservados; a assinatura é somente calculada em memória;
3. porta ocupa quatro arestas e somente a variante aberta expõe as duas centrais como passagem.
4. R2-A foi aceita e permitiu a produção determinística posterior dos quatro candidatos;
5. os quatro candidatos foram aprovados visualmente e autorizaram somente a pré-integração diagnóstica R2-B1;
6. R2-B1 foi aceita nominalmente; a tentativa de R2-B2 foi interrompida sem escrita diante da incompatibilidade `baseline`/`production`, e o usuário autorizou somente a preparação R2-B2-A;
7. R2-B2-A foi aceita nominalmente e o usuário autorizou somente R2-B2-B para promover e integrar os quatro cantos aprovados.
8. R2-B2-B e R2 integral foram aceitas nominalmente; o usuário autorizou somente o contrato puro R3-A, sem conexão ao runtime.
9. R3-A foi aceita nominalmente; o usuário autorizou somente R3-B para conectar renderer e hit testing à geometria canônica, mantendo depth e fallback fora do escopo.
10. R3-B foi aceita nominalmente; o usuário autorizou somente R3-C-A para tornar o depth estrutural canônico, mantendo fallback e R3-C-B fora do escopo.
11. R3-C-A foi aceita nominalmente; o usuário autorizou somente R3-C-B1 para alinhar o fallback procedimental à geometria e ao depth canônicos, mantendo R3-C-B2 fora do escopo.
12. R3-C-B1 foi aceita nominalmente; R3-C-B2 foi autorizada apenas para evidência visual e permaneceu tecnicamente não concluída após expor a descontinuidade transversal.
13. Sam autorizou nominalmente `W3-A-R3-C-B2-FIX-A` como primeiro subgate corretivo, limitado ao contrato transversal, analisador puro, regressão executável e documentação mínima, sem mover sprites nem repetir B2.
14. Sam aceitou nominalmente FIX-A e aceitou a parada sem escrita da primeira tentativa de FIX-B diante da ausência de semântica capaz de separar folha e batente no PNG achatado.
15. Sam subdividiu FIX-B, autorizou somente FIX-B1 e decidiu que portas aberta/fechada compartilham a interface do corredor horizontal oficial; folha e projeções permanecem apenas no envelope visual.

Ainda pendentes e não autorizadas naquele snapshot:

1. revisar FIX-B1 e autorizar nominalmente `W3-A-R3-C-B2-FIX-B2` antes de derivar normal topológica ou mover qualquer sprite;
2. autorizar posteriormente FIX-C e a repetição de R3-C-B2; FIX-B2 e essas etapas não foram iniciadas;
3. aprovar o padrão mobile da alternativa “Peças colocadas” (disclosure, sheet ou drawer compacto);
4. decidir em gate futuro se um blueprint v1 canônico persistido poderá ser migrado automaticamente; R1 não autoriza essa escrita;
5. executar e decidir R6 no Moto G06; automação não aprova seams, toque, safe areas, TalkBack, áudio percebido ou desempenho físico.

## Matriz de gates W3-A-R0–R6

| Gate                 | Entrega                                          | Estado                                                                   | Evidência/saída necessária                                                                          |
| -------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| R0                   | auditoria e especificação executável             | **aceito para prosseguimento**                                           | autorização humana nominal que iniciou R1                                                           |
| R1                   | R1-A geometria/porta + R1-B perímetro/identidade | **tecnicamente concluída e aceita pelo usuário**                         | 53 testes focados/checks verdes e autorização nominal de R2-A                                       |
| R2-A                 | contrato de arte, gabaritos e validador          | **tecnicamente concluída e aceita pelo usuário**                         | contrato, quatro gabaritos, quatro montagens e checks verdes                                        |
| Produção artística   | quatro cantos candidatos fora do runtime         | **concluída e aprovada visualmente pelo usuário**                        | quatro PNGs determinísticos preservados fora dos caminhos ativos                                    |
| R2-B1                | pré-integração, validação estrita e montagens    | **tecnicamente concluída e aceita nominalmente**                         | hashes coincidentes, quatro candidatos estritos, cinco montagens e aceite humano                    |
| R2-B2-A              | preparação do pipeline para `production`         | **tecnicamente concluída e aceita nominalmente**                         | 14 testes focados, tolerância legada explícita e zero PNG alterado                                  |
| R2-B2-B              | substituição e integração dos quatro cantos      | **tecnicamente concluída e aceita nominalmente; R2 encerrada**           | fontes/runtimes `production`, equivalência RGBA, relatório derivado atualizado e checks verdes      |
| R3-A                 | metadado e transformação visual puros            | **tecnicamente concluída e aceita nominalmente**                         | 12 assets canônicos, fórmula por inset/planos, regiões e oito encontros puros                       |
| R3-B                 | integração do renderer e hit areas               | **tecnicamente concluída e aceita nominalmente**                         | renderer/input compartilham a transformação, porta sem offset e cantos com dois braços              |
| R3-C-A               | depth estrutural canônico                        | **tecnicamente concluída e aceita nominalmente**                         | base visível, bandas relativas ao interior, desempate estável e 118 testes consolidados             |
| R3-C-B1              | fallback procedimental canônico                  | **tecnicamente concluída e aceita nominalmente**                         | mesma geometria/depth do sprite, 12 assets, lifecycle limpo e 134 testes consolidados               |
| R3-C-B2              | evidência do renderer ativo                      | **tecnicamente concluída**                                               | repetição oficial 9/9 e 31/31 emendas sem canal conectado                                           |
| W3-A-R3-C-B2-FIX-A   | contrato transversal e oráculo de continuidade   | **tecnicamente concluída e aceita nominalmente**                         | `WorldJoinPlane` ampliado, analisador puro, 31 junções B2 caracterizadas e nenhuma posição alterada |
| W3-A-R3-C-B2-FIX-B1  | contrato semântico de encaixe das portas         | **tecnicamente concluída e aceita nominalmente**                         | perfil estrutural horizontal único, envelope preservado, 4/8–11/15–4/8 e nenhuma posição alterada   |
| W3-A-R3-C-B2-FIX-B2  | normal topológica e alinhamento assinado         | **concluída e aceita por Sam**                                           | regra por adjacência de piso, 31/31 junções e nenhuma exceção por blueprint/placement               |
| W3-A-R3-C-B2-FIX-C   | consolidação/regressão posterior                 | **não aberto separadamente**                                             | regressões dos consumidores foram incluídas em FIX-B2 conforme autorização atual                    |
| repetição de R3-C-B2 | nova evidência do renderer ativo                 | **concluída**                                                            | 9/9, sete capturas e manifesto; 31/31 emendas sem canal conectado                                    |
| R4                   | máquina de estados e UI responsiva               | **concluída e aprovada pelo usuário**                                    | mapa protagonista, overlays exclusivos, Back/Escape, mobile e Resumo real                           |
| R5                   | regressão, compatibilidade e APK técnico         | **tecnicamente concluída**                                               | smoke Firefox, 49/49 em dois arquivos, build/sync/APK debug sem aprovação física                    |
| R6                   | validação física final                           | **aprovada pelo usuário com duas ressalvas não bloqueadoras**             | Moto G06 confirmou o gate e os dados; demora inicial e engasgo no Resumo seguem para otimização     |

## Validação de R0 e estado final

| Check                                           | Resultado                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| leitura documental obrigatória                  | concluída                                                                                           |
| inspeção de código, testes, histórico e assets  | concluída                                                                                           |
| `npm run wall-assets:check`                     | passou: 12 PNGs validados; limitação da medição documentada                                         |
| Markdown, links locais e referências de caminho | passou nos 3 documentos de R0 por verificação read-only; não há script Markdown dedicado no projeto |
| `git diff --check`                              | passou, sem saída                                                                                   |
| `git status --short` final                      | 30 rastreados modificados e 2 não rastreados                                                        |

O conjunto preexistente permaneceu presente. R0 acrescentou somente `docs/W3_A_CORRECTION_LOG.md` como segundo arquivo não rastreado e alterou conteúdo nos já modificados `docs/STATUS.md` e `docs/ROADMAP.md`. Nenhum arquivo de produção, teste ou asset foi alterado por R0.

R0 parou depois desses checks e foi posteriormente aceito para prosseguimento pela autorização humana que iniciou R1. R1-A e R1-B foram aceitas tecnicamente em 2026-08-31; somente R2-A foi então autorizada naquele ponto histórico. Produção artística e R2-B ainda não haviam sido iniciadas no encerramento de R0.

## W3-A-R3-C-B2-FIX-B2 — normal interior e alinhamento assinado

### Resultado

Sam aceitou nominalmente FIX-B1 e o reparo de inicialização e autorizou FIX-B2. A implementação deriva a normal interior exclusivamente da adjacência das células de piso às arestas lógicas e translada o perfil estrutural para o lado resolvido. O resultado automatizado evoluiu de 19/31 para 31/31 junções compatíveis. R3-C-B2 continua 8/9 e tecnicamente reprovada até sua repetição autorizada; R4 não foi iniciado.

A sessão não disponibilizou navegador controlável depois da alteração. Portanto, o código e suas regressões estão concluídos, mas FIX-B2 permanece aguardando revisão e reconfirmação visual ao vivo; não se registra conclusão plena do gate com base apenas no build/teste.

### Estado inicial e arquivos

- HEAD curto: `02f0fde`;
- worktree intencionalmente sujo preservado; fingerprint da lista de paths inicial: `820fc26b5173e81c5ac0c55f5297ca472dd8fefe0965367acff961c8aa9f522c`;
- `git diff --check` inicial: passou;
- baseline anterior à escrita: 172/172 testes em 14 arquivos;
- oito hashes B2 e contrato B1 conferidos antes da escrita.

Criados por FIX-B2:

- `src/features/library-visual/phaser/structureVisualTopology.ts`;
- `src/features/library-visual/phaser/structureVisualTopology.test.ts`.

Alterados por FIX-B2 dentro do worktree preservado:

- `src/features/library-visual/phaser/structureVisualGeometry.ts` e teste;
- `src/features/library-visual/phaser/structureRenderPlan.ts` e teste;
- `src/features/library-visual/phaser/constructionInput.ts` e teste;
- `src/features/library-visual/phaser/SpatialWorldScene.ts` e teste;
- `src/features/library-visual/phaser/structureVisualContinuity.test.ts`;
- `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/TEST_PLAN.md`, `docs/DECISIONS.md`, `docs/W3_A_CORRECTION_HANDOFF.md` e este log.

Nenhuma dependência foi adicionada ou removida.

### Algoritmo e política topológica

Para cada intervalo lógico, o resolvedor enumera as arestas unitárias e consulta somente `floorCells`:

| Eixo       | Célula negativa | Célula positiva | Normal resolvida         |
| ---------- | --------------- | --------------- | ------------------------ |
| horizontal | `(x,y-1)`       | `(x,y)`         | norte `-y` ou sul `+y`   |
| vertical   | `(x-1,y)`       | `(x,y)`         | oeste `-x` ou leste `+x` |

Todas as arestas com piso exclusivamente no mesmo lado produzem `resolved`. Piso nos dois lados, nenhum piso ou mistura entre aresta apoiada e não apoiada produzem `ambiguous`; lados exclusivos opostos dentro do mesmo braço produzem `inconsistent`. O resultado não resolvido preserva a posição e é propagado por `StructureVisualAlignmentIssue`. Uma cadeia aberta uniformemente apoiada resolve; peça isolada não se move. Os dois braços dos cantos são intervalos independentes. A regra foi testada também após translação global, em coordenadas negativas e sob reordenação de piso/placements.

O render plan chama o resolvedor com `WorldStructureState` e entrega o contexto explicitamente a `structureVisualTransform`. A transformação individual não consulta estado global, React, Phaser ou Dexie. O algoritmo não lê nome de blueprint, coordenada conhecida ou identidade de instância.

### Fórmula e deslocamentos

Com perfil relativo medido `[a,b)` e `t=b-a`:

- normal positiva: alvo `[0,t)`;
- normal negativa: alvo `[-t,0)`;
- translação no eixo normal: `target.start - a`.

Restrições repetidas no mesmo eixo devem concordar dentro da tolerância existente de um pixel-fonte; acima disso o sprite inteiro é preservado com `conflicting-axis-translations`, sem média. Um canto combina a componente `y` de seu braço horizontal e a componente `x` do vertical numa única translação 2D.

| Definição/perfil                         |                        Normal positiva |                        Normal negativa |
| ---------------------------------------- | -------------------------------------: | -------------------------------------: |
| retas horizontais 1/2/4 e portas, 429 px |                               `y += 0` |         `y -= 429 px` = `-45,76` world |
| retas verticais 1/2, 235 px              |                               `x += 0` |     `x -= 235 px` = `-25,066667` world |
| reta vertical 4, 236 px                  |                               `x += 0` |     `x -= 236 px` = `-25,173333` world |
| canto `sw`, perfis `+y/+x`               |              zero nas normais próprias | componente `-t` ao inverter cada braço |
| canto `se`, perfis `+y/-x`               |            `y=0`; `x=+236 px` se leste |   `y=-429 px` se norte; `x=0` em oeste |
| canto `nw`, perfis `-y/+x`               |     `y=+429 px` se sul; `x=0` em leste |            `y=0`; `x=-236 px` se oeste |
| canto `ne`, perfis `-y/-x`               | componente `+t` ao inverter cada braço |              zero nas normais próprias |

Nas composições preservadas, todos os cantos já estavam no lado topológico próprio e conservaram `(0,0)`. A parede direita canônica recebeu `x=-25,066667`; a porta inferior recebeu `y=-45,76`. O perfil da porta continua sendo o corredor FIX-B1 `[24,453)`, não o envelope alpha.

### Antes/depois das 31 junções

| Composição            | Antes FIX-B2 | Depois FIX-B2 | Endpoints não pareados depois | Issues depois |
| --------------------- | -----------: | ------------: | ----------------------------: | ------------: |
| sala canônica         |          4/8 |           8/8 |                             0 |             0 |
| composição modificada |        11/15 |         15/15 |                             0 |             0 |
| composição de portas  |          4/8 |           8/8 |                             0 |             0 |
| total                 |        19/31 |         31/31 |                             0 |             0 |

Todas as 31 linhas já individualizadas na tabela de FIX-B1 agora são compatíveis. Há zero `transverse-side-mismatch`, `centerline-jump`, `transverse-gap`, `transverse-overlap`, `transverse-interval-mismatch`, `thickness-mismatch`, gap/overlap longitudinal ou endpoint ausente/ambíguo. O teste compara os planos longitudinais antes/depois e exige igualdade. A diferença residual de um pixel-fonte entre perfis verticais de 235/236 px permanece dentro da tolerância original, sem epsilon adicional.

### Autoridade e preservações

`spriteCanvasPosition` recebe a translação uma única vez. `canvasBounds`, `alphaBounds`, planos, `interactionRegions` e `visualSortY` nascem depois dela; render plan, sprite, zonas, seleção, preview, fallback e depth consomem esses resultados. `SpatialWorldScene` mudou somente para passar o `WorldStructureState` às mesmas hit regions no zone/preview/destaque. Não há fórmula paralela nesses consumidores.

`WorldStructureState`, placements, IDs, células, arestas, classificação, porta, revisão, inventário, grants, Dexie v7, backup v5/v4 e ordem persistida não foram alterados. `visualOffsetCells`, `pivot`, `visualSpanCells` e o offset legado da porta continuam sem leitura no caminho estrutural ativo. Nenhum PNG, contrato FIX-B1, artefato derivado ou evidência B2 foi modificado.

### Validação automática

| Comando                                            | Resultado                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| baseline pré-escrita                               | 172/172 em 14 arquivos                                                                                              |
| topologia/geometria/continuidade/render/input/cena | 109/109 em 6 arquivos                                                                                               |
| matriz R1/R3/FIX-A/B1/B2                           | 203/203 em 15 arquivos                                                                                              |
| host/cena/geometria/continuidade/input/topologia   | 131/131 em 7 arquivos                                                                                               |
| `npm run format` / `npm run format:check`          | passaram                                                                                                            |
| `npm run typecheck`                                | passou                                                                                                              |
| `npm run build`                                    | passou; somente aviso não bloqueador de chunks maiores que 500 kB                                                   |
| `npm run lint`                                     | falhou somente nos quatro parâmetros não usados preexistentes de `SpatialWorldScene.test.ts:86/88`; zero falha nova |
| `npm run wall-assets:check`                        | passou: 12 assets                                                                                                   |
| `npm run wall-guides:check`                        | passou: 9 artefatos                                                                                                 |
| `git diff --check`                                 | passou                                                                                                              |

O teste do host conserva diagnóstico `state: ready`, `activeInstances: 1` e `canvasCount: 1`; a cena antes do boot conserva snapshot seguro. A validação visual real pós-FIX-B2 não pôde ser executada porque a lista de navegadores controláveis estava vazia. Isso não foi substituído por Playwright/E2E ou screenshot.

### Hashes e estado Git

Os oito artefatos B2 mantiveram:

- manifesto `26bd584587259838cb29db16d918875482e9892dd82942f19e388b90c97fb902`;
- canônica `1ab04d010cd40c50c4883b11de223d96b0de79fdbf141198758d8a1c6a3982d8`;
- mobile 320 `6c146e5510a7007f83773128abb93a7286a6605106df8da874b709cad1bf1f0c`;
- mobile 360 `d9e46317453195f3730db31fade33d9faa4b15e5ba3372e66de6a21a267c799e`;
- depth `022df991bb117328fec7483418fa507e43f6d4654135a78c797f8dd70393f1f2`;
- portas `118ace0a8eeeff20e15f227e966ab104cd20672f353b7f0ead5a131fa9332c56`;
- fallback `6d752d25639ab09cf143ef89b1cd5b6b7b5c2c80bf69b71e3e5a0e3d41b5a825`;
- modificada `bfac2fbc16bfc85886eddbfbd51fcd60a3114b6f49fa05c0c96fc244577ff0ad`.

O contrato B1 manteve `2547195b94f3ebc25e8940eadb2b9ae639f9da608a805945d88aee8ff6927a04`; os 12 PNGs-fonte e 12 runtimes preservaram os hashes registrados em FIX-B1. Nenhum commit, push, tag, rebase, reset ou mudança de versão foi realizado.

### Riscos, limitações e recomendação de gate

A política segura deixa estruturas não periféricas/ambíguas imóveis; um editor que futuramente queira escolher um lado nesses casos precisará de semântica adicional explícita, não de heurística escondida. Isso não ocorre nas três composições preservadas.

Recomendação: revisar a implementação e executar o smoke visual ao vivo. Somente depois, autorizar nominalmente a repetição de R3-C-B2. Não foram executados E2E B2, screenshots, suíte global, performance, Android ou APK; FIX-C separado e R4 não foram iniciados.

## Acabamento longitudinal antes da repetição visual B2

Sam aceitou o alinhamento de FIX-B2 e registrou smoke manual no Firefox em `ready`, com uma instância, um canvas e seleção funcional. A inspeção 1:1 dos PNGs e da montagem preservada confirmou fundo realmente exposto nos encontros, não apenas rejunte opaco: no corpo estável dos perfis, o recuo alpha combinado máximo mediu 14 px-fonte na horizontal e 10 px-fonte na vertical. A escala `32/300` converte essas medidas em `1,493333` e `1,066667` world units; filtragem LINEAR/subpixel torna a falha fina na tela, mas não é sua origem.

A transformação canônica passou a expor sobrecobertura simétrica de 14 px-fonte por endpoint somente no eixo longitudinal dos sprites retos. Cantos e alinhamento transversal não mudam; planos lógicos, `spriteCanvasPosition`, bounds, hit regions, preview, fallback e depth permanecem com a geometria anterior. Uma composição alpha read-only em `/tmp`, reduzida pela escala vigente, levou o suporte na linha central de 14,5% para 100% na horizontal e de 90,9% para 100% na vertical, sem editar PNG.

Regressões focadas: 152/152 passaram, incluindo continuidade 31/31 e host/cena; `npm run typecheck`, `npm run build` e `npm run lint` passaram, e `git diff --check` permaneceu limpo. Os oito hashes B2 ficaram idênticos. A sessão não ofereceu navegador controlável para um novo smoke ao vivo; a inspeção humana do acabamento continua pendente. E2E/capturas B2 não foram repetidos, R4 não foi iniciado e não houve commit ou push.

## Repetição concluída de W3-A-R3-C-B2

### Tentativas e correção do oráculo

A primeira tentativa oficial chegou ao primeiro caso e foi interrompida com 1 falha e 8 casos não executados: `expectedSpriteRecords()` ainda exigia `scaleX === scaleY` para todas as peças. A captura canônica `d075c9b1…` e o manifesto parcial `74435e19…` não constituíram baseline. O oráculo passou a derivar, sem ler as escalas dos sprites renderizados, a escala-base `CELL_SIZE/sourcePixelsPerCell`, o eixo pela orientação, o span pelo alpha bounds fonte e a escala longitudinal com 14 px-fonte simétricos por endpoint. Cantos permanecem uniformes; posição, textura, depth, origem, visibilidade e cardinalidade continuam verificadas.

Com a escala corrigida, canônica e as duas capturas mobile passaram. A composição modificada foi interrompida por uma comparação RGB na emenda `(6,2)` entre `modified.corner.top-left` e `modified.top.long`, a `+1` world pixel do endpoint. Nenhuma evidência parcial dessa tentativa foi promovida.

### Diagnóstico alpha de `(6,2)` e varredura completa

O endpoint lógico é `(6,2)`, equivalente ao eixo lógico world `(192,64)` e canvas `(460,8;24)` sob câmera `scroll=(-268,8;40)`, zoom 1. O centro do perfil `[64;109,76)` fica em world `(192;86,88)` e canvas `(460,8;46,88)`. `+1` significa leste, `+x`, isto é, world `(193;85,88|86,88|87,88)` e pixels canvas `(461;45|46|47)`.

| Peça                       |        Posição world |                  Escala x/y |          Extensão renderizada do canvas fonte |
| -------------------------- | -------------------: | --------------------------: | --------------------------------------------: |
| `modified.corner.top-left` |      `(61,44;61,44)` | `0,106666667 / 0,106666667` |          `x=61,44..194,56`, `y=61,44..194,56` |
| `modified.top.long`        | `(187,886933;61,44)` | `0,109155556 / 0,106666667` | `x=187,886933..324,113067`, `y=61,44..112,32` |

Nas três amostras de `+1`, o canto corresponde a `sourceX=1233,375` e a reta a `sourceX=46,842020`; os `sourceY` são `229,125`, `238,5` e `247,875`. O canto contribui alpha 0, a reta alpha 255 e a composição alpha 255 em todas elas. A matriz de ocupação 11×46 ao redor da emenda, com `.` para alpha 0, `+` para alpha parcial e `#` para 255, contém somente `+`/`#`: zero pixel transparente e nenhum canal transversal conectado por vizinhança 4 ou 8. O recorte original e sua ampliação diagnóstica 16× sem interpolação foram preservados em `/tmp/w3-a-r3-c-b2-seams.OlWPYH/`; não são evidência oficial.

A igualdade RGB com o frame sem paredes era coincidência cromática e não prova transparência. A asserção final compõe os alphas individuais usando as fontes carregadas, posições/escalas reais e filtragem LINEAR, e procura um caminho alpha-zero atravessando toda a faixa estrutural. Ela não desloca amostras, não ignora emendas e não tolera canal real de fundo.

A varredura anterior à correção da asserção cobriu todas as 15 emendas modificadas e as 8 de portas. Na modificada, todas as horizontais têm zero pixel transparente; sete emendas verticais somam 31 pixels isolados de contorno, sem canal 4/8. Em portas, todas as horizontais têm zero pixel transparente; quatro emendas verticais somam 23 pixels isolados, também sem canal 4/8. Não houve outra falha equivalente. A sobrecobertura permaneceu em 14 px-fonte; não houve erro inclusivo/exclusivo nem necessidade de 15 px.

### Resultado, evidências e validação

Os nove casos foram repetidos desde o início em staging dedicado e passaram; após uma limpeza tipada no harness, uma segunda execução completa também passou 9/9 e produziu arquivos byte a byte idênticos. Os oito artefatos oficiais foram substituídos conjuntamente pela geração completa:

- `canonical-room-full.png`: `d075c9b11543dfa9f41c7136cad37a02f894ea85a02879fb7a00f6952afc8b19`;
- `canonical-room-mobile-320x640.png`: `9f24e524f44ec8ce474354ff0c2b6e7a9ffae3b6454bc63e7b9b8aeb31d85600`;
- `canonical-room-mobile-360x800.png`: `4c0bcce157330b3ffb08dbd4a98ee5e6064cc787f624b2cc091e3ee59218ab18`;
- `depth-selection-detail.png`: `dc01a027495d4c356a1b66b91262131f0846c6f4929f1857b4cc890614a0de9a`;
- `door-states-detail.png`: `ff34f73bda8549c06716d226b65febf37edcddd620ed061c278c339576ae1ce3`;
- `fallback-detail.png`: `8a0e8720dba3e3bdf3a38d6f225743550f98a9373b716a7134f3b1b8e4271269`;
- `modified-room-full.png`: `ce452f0147e2f11bb6f118a7ca00b4bfc8e2e72f9a332ad5f2562d5e9966a662`;
- `capture-manifest.json`: `9c89ee9d485700f2bed6ea7d15198d27f3b2320ee0c35d013cd7c01e18fd9192`.

O manifesto registra Chromium `151.0.7922.34`, Canvas direto, dimensões mobile exatas, arrays vazios de erro/warning/request failure e 8/8 + 15/15 + 8/8 emendas sem canal conectado. A regressão focada de continuidade, geometria, render plan e cena passou 78/78 em quatro arquivos; `wall-assets:check` validou 12 assets; typecheck, lint e build passaram, com apenas o aviso não bloqueador de chunks grandes; `git diff --check` passou. A limpeza de lint em `SpatialWorldScene.test.ts` remove apenas parâmetros ociosos dos stubs.

Nenhum código de produção, PNG-fonte, persistência, schema, backup, blueprint, contrato artístico ou dependência foi alterado. Não houve commit, push, tag ou mudança de versão. R3-C-B2 está tecnicamente encerrada; R4 permanece não iniciado.

## Nota R4 — retrabalho da Construção

Em 2026-09-05, Sam reprovou a primeira implementação R4 da Construção porque a lista permanente, os controles sobrepostos, a expansão externa e a atualização imediata da cena não funcionavam no produto real. A interface foi retrabalhada segundo o protótipo aprovado: mapa dominante, dock de tarefa, sheets sob demanda, ações exclusivas e preview confirmado no mesmo canvas. A R4 permanece aberta para as demais migrações e para validação humana.

## Encerramento técnico R4 — 2026-09-06

Sam aprovou a correção funcional da Construção e a direção visual. Os três acabamentos finais incorporaram “Peças colocadas” como sheet fechado por padrão e faixa horizontal de `320×205 px`, seleção com destaque/enquadramento e barra contextual exclusiva; reformaram o Resumo em métricas/tipos/listas compactos; e adicionaram “Atividade no período” como SVG responsivo alimentado somente pela timeline filtrada real (duração de sessões concluídas ou contagem da categoria selecionada).

A sonda Selenium em Firefox visível usou uma sessão contínua e somente a interface pública para criar expansão auxiliar, colocar uma peça, selecioná-la pela faixa, mover e confirmar a mudança imediata; depois inspecionou o Resumo em `320×640` e `1280×800`. As quatro capturas finais estão em `art-guides/w3-a-r4-ux-proposal/captures/r4-final/`; `npm run build` e `git diff --check` passaram. A Construção continua funcionando fora da planta inicial, com atualização imediata e persistência já aprovadas. R4 fica tecnicamente concluída no escopo web; verificações físicas específicas no Moto G06 permanecem posteriores e separadas.

## W3-A-R5 — estabilização e APK técnico — 2026-09-06

R4 foi concluída e aprovada pelo usuário antes desta rodada. A auditoria curta confrontou os diffs R3/R4 com lifecycle React/StrictMode, sincronização React–Phaser, Dexie, backup v5/leitores v1–v4, restauração estrutural, inventário/grants, navegação/Android Back, safe areas, dock e Capacitor. Nenhuma regressão objetiva foi encontrada; R5 não alterou código de produção, schema, backup, assets, inventário, progressão ou regras de domínio.

Foram executados somente os dois arquivos focados autorizados: `src/infrastructure/backup/backup.test.ts` e `src/features/library-visual/LibraryVisualHost.test.tsx`, com 49/49 testes aprovados. O primeiro cobre formatos históricos e atual, restauração transacional/reabertura, estrutura, peças e marcos; o segundo cobre StrictMode, cleanup, resize, visibilidade e atualização da mesma instância Phaser.

O smoke Selenium em Firefox 155 headless usou perfil temporário, origem fixa `http://localhost:5173` e somente a interface pública. Criou `Registro fictício R5 — 2026-09-06`, confirmou Coleção/detalhe/Biblioteca/canvas, entrou e saiu de Construção, carregou o Resumo, recarregou uma vez e confirmou o registro e 8 peças estruturais antes/depois. A primeira tentativa preservou `art-guides/w3-a-r4-ux-proposal/captures/r5/failure-7-construction.png`: o único problema era o seletor temporário exato `Sair` diante do texto DOM `↙ Sair`; após corrigir somente o harness efêmero, o mesmo fluxo passou. Não houve acesso a perfil pessoal, store, IndexedDB direto ou backup real.

`npm run build`, `npm run android:sync` e `npm run android:build:debug` passaram. Vite repetiu o aviso não bloqueador de chunks maiores que 500 kB, e Gradle emitiu os dois avisos não bloqueadores sobre `flatDir`. APK não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `99d379427949798ba1e1c20728bb254a1f021d09599f4f173b3bcbb0cb08e6fe`, gerado em 2026-09-06 18:35:54 -03:00. Não houve commit, push, tag, rebase ou mudança de versão. A próxima etapa é R6 no Moto G06; R5 não aprova toque, áudio percebido, safe area física, desempenho ou funcionamento no aparelho.

## Gate final pré-R6 — limpeza de interface e desempenho inicial — 2026-09-06

O gate não reabriu R3, R4 ou R5. Foram removidos da árvore da Biblioteca somente o controle de setas entre salas e a duplicata superior “Resumo acessível”, junto do estado/evento `RoomRequested` e do modo de sheet usados exclusivamente pela navegação antiga. O botão Resumo acima do dock passou a abrir diretamente a alternativa textual já existente. Construir, o destino estatístico Resumo do dock, canvas, geometria e etiqueta contextual de cinco segundos permaneceram intactos.

Coleção e Arquivo receberam expansores inline amarelos, recolhidos por padrão, com `aria-expanded`/`aria-controls`, foco inicial, alvos de 48 px e transição de 200 ms (instantânea com movimento reduzido). Escape e `biblioteca-viva:native-back` recolhem antes da navegação. Os parâmetros de URL e resultados permanecem ativos ao recolher; os botões mostram sua quantidade. A busca textual do Arquivo fica fora do fieldset avançado e agora altera somente `q`, sem apagar filtros avançados.

A instrumentação User Timing não registra títulos, autores, notas nem outros dados do usuário. A mesma máquina, origem, Firefox e perfil descartável foram usados em cada par. Tempos em milissegundos, uma observação controlada por condição:

| Fase | Produção fria antes | Produção fria depois | Produção cache antes | Produção cache depois |
|---|---:|---:|---:|---:|
| shell React | 12 | 10 | 6 | 7 |
| bootstrap Dexie | 35 | 23 | 28 | 15 |
| leitura Dexie da Biblioteca | 16 | 33 | 13 | 15 |
| projeção da Biblioteca | 1 | 0 | 0 | 1 |
| módulo Phaser | 231 | 142 | 190 | 163 |
| instância Phaser | 43 | 34 | 13 | 18 |
| texturas bloqueantes | 839 | 716 | 701 | 608 |
| primeiro `renderWorld` | 8 | 12 | 7 | 7 |
| primeiro frame visível, acumulado | 1.642 | 1.453 | 1.426 | 1.233 |

O gargalo demonstrado foi a sequência do chunk Phaser seguida do carregamento/decodificação de 28 texturas, cerca de 30 MB compactados; Dexie, projeção e geometria do primeiro render ficaram na casa de dezenas de milissegundos ou menos. Não havia espera artificial, recriação de Phaser ou mais de um `renderWorld` no boot. Em DEV, o StrictMode disparava duas leituras equivalentes; o pedido agora é compartilhado por tentativa e caiu para uma, mantendo uma instância e um render. O chunk Phaser começa em paralelo ao bootstrap da rota inicial. Somente as 17 texturas usadas no primeiro mapa bloqueiam o frame; 11 orientações/peças ausentes da projeção inicial carregam 250 ms depois, sem mudar arquivo, qualidade, depth, hit region ou geometria. O DEV frio observado foi de 2.912 para 2.772 ms, enquanto o reload variou de 1.760 para 1.932 ms; por isso não se declara ganho geral em DEV nem desempenho físico.

O único fluxo final Selenium passou em Firefox visível, perfil temporário, origem fixa `http://localhost:5173`, interface pública e viewport 320×640. Confirmou os controles removidos, Resumo inferior acessível, Busca/Filtros recolhidos, toggle, foco, Escape, preservação/contadores, busca do Arquivo visível e ausência de overflow. Exatamente quatro capturas finais foram preservadas em `art-guides/w3-a-r4-ux-proposal/captures/pre-r6-final/`.

`npm run build`, `npm run android:sync`, `npm run android:build:debug` e `git diff --check` passaram. Vite manteve o aviso não bloqueador de chunks maiores que 500 kB; Gradle manteve dois avisos `flatDir`. APK técnico não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.952.055 bytes, SHA-256 `348b9f549f1ebdc552f6b42b0b1f0c10ff0fa15584c6955ef989870f1e9a0330`, gerado em 2026-09-06 19:59:44 -03:00. Não houve acesso ou remoção de dados pessoais, commit, push, tag, rebase ou mudança de versão. A validação física continua exclusiva da R6 no Moto G06.

## W3-A-R6 — validação física e encerramento — 2026-09-06

O usuário instalou e inspecionou o APK no Moto G06. As capturas humanas confirmaram, na aplicação Android real, a ausência dos controles superiores obsoletos na Biblioteca; a preservação do Resumo inferior e de Construir; o funcionamento do dock; a Busca recolhida ao lado de Novo registro na Coleção; os Filtros recolhidos com a busca textual visível no Arquivo; e a preservação dos dados pessoais. As alterações aparentes do gate foram aprovadas pelo usuário.

Duas ressalvas não bloqueadoras permanecem registradas sem afirmação de correção: a abertura inicial da Biblioteca ainda tem demora perceptível no Moto G06, e existe um engasgo no card do Resumo. Ambos os comportamentos já existiam antes deste gate, foram aceitos como não bloqueadores e ficam adiados para a fase final específica de otimização. O desempenho físico não está aprovado nem declarado resolvido.

R3-C-B2, R4, R5, o gate final pré-R6 e R6 estão concluídos. A rodada corretiva W3-A está integralmente encerrada, sem reabrir qualquer gate, e a próxima etapa de produto ainda não foi iniciada. Este encerramento alterou somente documentação: não executou build, testes, Selenium ou sync Android, não gerou APK e não alterou código, versão ou artefatos.
