# Auditoria integral pré-expurgo do mundo atual

## 1. Resumo executivo

A remoção integral é tecnicamente viável sem sacrificar o aplicativo convencional.

O mundo atual representa aproximadamente:

- 23 mil linhas de TypeScript/TSX dedicadas diretamente ao mundo;
- cerca de 4,8 mil linhas adicionais em `LibraryPage`, seus testes e CSS misto;
- cerca de 2,2 mil linhas de E2E exclusivamente espaciais;
- 28 PNGs runtime, totalizando 30.054.061 bytes, aproximadamente 28,7 MiB;
- aproximadamente 30,2 MiB de fontes, 4,7 MiB de candidatos e 41 MiB de guias/evidências visuais.

Assim, o expurgo tocará cerca de 30 mil linhas entre código e testes, além de aproximadamente 105 MiB de arte runtime, fontes, candidatos e guias.

O acoplamento é:

- alto dentro de `src/features/library-visual/`;
- alto em [`pages.tsx`](../src/pages.tsx#L216);
- moderado no composition root, schema, backup, áudio e progressão;
- baixo no restante do aplicativo convencional.

Não há dependência funcional inevitável entre Phaser e Coleção, registros, notas, citações, etiquetas, favoritos, sessões, histórico, Resumo, Arquivo ou Ajustes.

Principais riscos:

1. apagar estado espacial persistido sem uma política explícita de descarte ou exportação de segurança;
2. restaurar backups antigos sem filtrar mundo, recompensas e IDs estruturais;
3. confundir marcos convencionais com progressão estrutural, pois ambos estão na mesma tabela;
4. deixar documentação ou ADRs antigos marcados como vigentes;
5. retirar apenas o renderer e manter arquitetura morta em domínio, aplicação, banco ou tooling.

A dívida documental é alta: a documentação foi organizada recentemente, mas cristalizou justamente a arquitetura que agora foi abandonada. Dos 38 documentos ativos considerados, 28 mencionam diretamente componentes ou eras do mundo; 21 citam Phaser.

Estado Git observado durante a auditoria original:

```text
inicial: ?? inventario/
final:   ?? inventario/
```

Os dois arquivos em `inventario/` já eram não rastreados e permaneceram intactos. `git diff --check` e `git diff --stat` não apontaram mudanças rastreadas durante a auditoria original.

---

## 2. Fronteira do produto

| Área | Natureza | Destino |
|---|---|---|
| Seis tipos de registro e progresso próprio | aplicativo convencional | preservar |
| Notas, citações, etiquetas e favoritos | aplicativo convencional | preservar |
| Sessões e histórico de atividades | aplicativo convencional | preservar |
| Coleção, Arquivo, Resumo e Ajustes | aplicativo convencional | preservar |
| Shell, header, dock e navegação | aplicativo convencional | preservar |
| Backup, entrega de arquivo e Capacitor | aplicativo convencional, com formatos mistos | separar |
| Preferências de áudio e experiência | aplicativo convencional | preservar |
| Rota Biblioteca | entrada de produto, implementação atual espacial | reescrever como placeholder |
| Phaser, canvas, cenas e render plan | mundo atual | remover |
| Construção, seleção e organização espacial | mundo atual | remover |
| `PlacedObject` atual | mundo atual | remover; conceito poderá ser recriado |
| `WorldStructureState` atual | mundo atual | remover; conceito não é fundamento futuro |
| Salas, personagens e diálogos do mundo | mundo atual | remover |
| Pisos, paredes, portas, móveis e gráficos procedurais | mundo atual | remover |
| Marcos genéricos | progressão de produto | preservar após separação |
| Marcos de salas, concessões e inventário estrutural | mundo atual | remover |
| Áudio de página e conclusão | produto convencional | preservar |
| Música da Biblioteca e cues de entidades espaciais | mundo atual | remover |

A linha divisória prática é: dados e fluxos que continuam úteis sem qualquer superfície espacial pertencem ao produto; tudo que existe para projetar, editar, recompensar ou apresentar o espaço vigente pertence ao mundo.

---

## 3. Arquitetura atual do mundo

### Runtime

```text
main.tsx
→ preloadLibraryVisualFactory
→ App
→ rota /
→ LibraryPage
→ consultas de registros, marcos, salas, objetos e estrutura
→ LibraryProjectionService
→ LibraryViewModel
→ LibraryVisualHost
→ createPhaserGame
→ SpatialWorldScene / InitialLibraryScene
→ render plan, geometria, topologia, depth, input e fallback
→ PNGs e gráficos procedurais
```

Interações fazem o caminho inverso:

```text
Phaser
→ interação tipada
→ LibraryPage
→ caso de uso de aplicação
→ repositório
→ transação Dexie
→ evento após commit
→ nova projeção
```

Os limites arquiteturais atuais estão razoavelmente respeitados: Phaser não acessa Dexie, e as cenas consomem projeções. Isso não constitui motivo para preservar a implementação.

### `PlacedObject`

A definição está em [`world.ts`](../src/application/world.ts#L29):

```text
definitionId
instanceId
rotation: 0 | 90 | 180 | 270
spaceId: "space-a" | "space-b"
x
y
```

O mesmo arquivo inclui:

- definições e footprints em unidades 2D;
- pivô, hit area e dimensões de sprite;
- quatro fontes PNG por orientação;
- mesa e cadeira padrão;
- objeto legado `object.reading-table`;
- áreas fixas de 384×320;
- compatibilidade explícita com W2.

Campos conceitualmente genéricos:

- identificador de definição;
- identificador de instância;
- posição;
- orientação;
- footprint/ocupação.

Campos contaminados:

- coordenadas de pixel;
- `space-a` e `space-b`;
- rotações limitadas a quatro ângulos;
- dimensões e pivôs de sprites;
- hit area 2D;
- caminhos PNG;
- definições rígidas de mesa/cadeira;
- compatibilidade W2.

Persistência e consumidores:

```text
PlacedObject
→ schema Zod
→ tabela placedObjects, criada no Dexie v6
→ DexiePlacedObjectRepository
→ casos de uso worldObjects
→ LibraryPage
→ LibraryProjectionService
→ Phaser
→ backup v4/v5
```

Nenhuma funcionalidade convencional depende dele. Classificação: `DELETE` para a implementação atual. Possibilidade futura: reaproveitar somente o conceito, com novo contrato.

### `WorldStructureState`

Definido em [`worldStructure.ts`](../src/application/worldStructure.ts#L51):

```text
id: "world.main"
blueprintVersion
createdAt
updatedAt
revision
floorCells: {x,y}[]
placements:
  anchor
  definitionId
  instanceId
```

Seu catálogo incorpora:

- piso de madeira;
- quatro cantos;
- paredes horizontais e verticais de 1, 2 e 4 células;
- porta horizontal aberta/fechada;
- pivôs e offsets;
- spans lógicos e visuais;
- IDs de asset;
- fallback procedural;
- família de inventário;
- rotacionabilidade e mobilidade.

Também concentra geometria de arestas, intervalos, continuidade, ocupação e passabilidade. É persistido em `worldStructures`, adicionada no Dexie v7, inicializado automaticamente como `world.main`, incluído no backup v5 e consumido apenas pelo mundo.

Classificação: `DELETE`. O conceito de estrutura persistente poderá voltar, mas nenhuma parte desse schema deve ser assumida como contrato do novo mundo.

### Grid e coordenadas

Há duas autoridades de tamanho:

- `WORLD_CELL_SIZE = 32` na aplicação;
- `CELL_SIZE = 32` no código Phaser.

A estrutura usa células inteiras; `PlacedObject` usa coordenadas 2D contínuas em unidades de mundo. A ponte contém:

- `screenToWorld`;
- snapping de âncora e piso;
- footprints;
- ocupação por arestas e células;
- hit regions;
- checagem de sobreposição;
- offsets de render;
- conversão estrutura → geometria visual.

O conceito abstrato de grade ou snapping pode reaparecer. Os valores, transformações, footprints, ocupação e APIs atuais são específicos do mundo descartado.

### Fluxos complementares

```text
persistência
→ Dexie v6/v7
→ placedObjects / worldStructures
→ schemas atuais
→ repositórios
→ bootstrap de world.main
```

```text
backup
→ snapshot de 11 tabelas
→ codec v5
→ placedObjects + worldStructure + milestones
→ restore transacional
→ rebootstrap do mundo
```

```text
progressão
→ eventos de registros/sessões
→ MilestoneEngine
→ marcos genéricos + salas + estrutura
→ concessões
→ inventário
→ App/LibraryPage
→ construção e feedback Phaser
```

```text
assets
→ art-candidates
→ art-source
→ scripts de processamento
→ public/assets
→ manifestos
→ Phaser
```

```text
testes
→ domínio/geometria
→ aplicação/edição
→ projeções
→ cenas/fallback/input
→ E2E Construção/W3-A
→ performance do chunk Phaser
```

```text
documentação
→ STATUS/ROADMAP/W3_PLAN
→ WORLD_MODEL/ARCHITECTURE
→ ART_DIRECTION/ASSET_PIPELINE/REGISTRY
→ ADR-002–006
```

---

## 4. Dependências npm

| Dependência | Uso | Classificação | Efeito futuro |
|---|---|---:|---|
| `phaser@3.90.0` | somente `library-visual/phaser` | `DELETE` | retirar de `package.json` e lockfile |
| `eventemitter3@5.0.4` | transitiva exclusiva de Phaser | `DELETE` | será podada do lockfile |
| React/React DOM/Router | shell e aplicação convencional | `KEEP` | nenhum impacto |
| Dexie | persistência local | `KEEP` | evoluir para novo schema |
| Zod | validação de dados e backup | `KEEP` | reescrever schemas mistos |
| Capacitor e plugins | Android, arquivos e compartilhamento | `KEEP` | nenhum impacto arquitetural |
| Playwright | E2E convencional e futuro | `KEEP` | retirar cenários do mundo |
| Vitest/Testing Library/jsdom/fake-indexeddb | testes preservados | `KEEP` | nenhum impacto |
| Vite/TypeScript/ESLint/Prettier | build e qualidade | `KEEP` | ajustar métricas/configurações textuais |

Imports diretos de Phaser existem em cinco arquivos:

- `createPhaserGame.ts`;
- `RoomSceneRenderer.ts`;
- `residentRoutine.ts`;
- `InitialLibraryScene.ts`;
- `SpatialWorldScene.ts`.

Não foi identificado outro pacote npm exclusivo do mundo.

O script Python de inspeção usa Selenium, mas essa dependência não é gerenciada pelo `package.json`; desaparece junto com o script.

---

## 5. Código

| Área/arquivo | Responsabilidade | Dependentes | Classe | Motivo | Ação futura |
|---|---|---|---|---|---|
| `src/features/library-visual/` | host, projeções, overlays, cenas, render e input | rota Biblioteca | `DELETE` | inteiramente mundo atual | remover diretório |
| [`pages.tsx`](../src/pages.tsx#L216) | `LibraryPage`, construção, seleção, diálogo e resumo espacial | `App` | `REWRITE` | arquivo inteiro implementa o mundo | substituir por placeholder React |
| [`App.tsx`](../src/App.tsx#L100) | shell mais feedback de marcos/construção | todas as rotas | `SPLIT` | shell válido; reações espaciais não | manter shell/rotas, retirar mundo |
| [`main.tsx`](../src/main.tsx#L10) | bootstrap React e preload Phaser | aplicação | `SPLIT` | bootstrap válido | remover preload visual |
| `src/routes.ts` | catálogo de rotas e dock | shell | `KEEP` | Biblioteca pode continuar apontando para placeholder | preservar |
| `src/app/AppHeader.tsx`, `PrimaryDock.tsx`, `AppErrorBoundary.tsx` | shell | produto convencional | `KEEP` | independentes do mundo | preservar |
| `src/app/createApplication.ts` | composition root misto | toda a aplicação | `SPLIT` | compõe mundo, diálogos, marcos e serviços convencionais | retirar adapters e APIs espaciais |
| `src/application/world.ts` e `worldObjects.ts` | objetos W2 | LibraryPage/Phaser/Dexie | `DELETE` | implementação espacial 2D | remover |
| `worldStructure*.ts` | estado, análise, geometria e edição estrutural | LibraryPage/Phaser/Dexie | `DELETE` | W3-A integral | remover |
| `worldStructureRepository.ts` | porta estrutural | aplicação/infra | `DELETE` | sem consumidor futuro conhecido | remover |
| `rooms.ts` | progresso de salas antigas | Biblioteca/milestones | `DELETE` | salas antigas | remover |
| `structuralProgression.ts` | concessões e inventário estrutural | sessões/Biblioteca | `DELETE` | recompensa de peças antigas | remover |
| `domain/rooms.ts` | regras de estágios de salas | milestone store | `DELETE` | modelo antigo | remover |
| `domain/structuralProgress.ts` | elegibilidade e famílias estruturais | sessões/marcos | `DELETE` | catálogo antigo | remover |
| `domain/milestones.ts` | marcos genéricos e espaciais misturados | aplicação/infra | `SPLIT` | dez marcos são convencionais; demais são mundo | conservar apenas marcos de produto |
| `application/milestones.ts` | porta/listagem/eventos | composition root | `REWRITE` | pode sustentar marcos convencionais | remover rewards espaciais |
| `application/sessions.ts` | sessões mais resultado estrutural | UI de sessões | `SPLIT` | sessões sobrevivem | remover grants/progresso estrutural |
| `application/statistics.ts` | estatísticas mais fatos de salas | Resumo/salas | `SPLIT` | métricas convencionais sobrevivem | retirar `progressFacts` de salas |
| `application/internal.ts`, `ports.ts`, `index.ts` | utilitários e exports mistos | aplicação | `SPLIT` | remover portas/exports espaciais | preservar infraestrutura genérica |
| `domain/events.ts`, `domain/index.ts` | eventos convencionais e de marcos | aplicação | `SPLIT` | manter eventos convencionais e, se adotado, marcos genéricos | retirar payloads espaciais |
| `src/content/` | personagens, salas, diálogos, rewards e definições de marcos | mundo/composition root | `SPLIT` | somente definições dos marcos genéricos merecem extração | extrair definições; remover o restante |
| `application/dialogue*.ts` | diálogo contextual de habitantes | App/Biblioteca | `DELETE` | nenhum consumidor convencional | remover |
| `infrastructure/dialogue/` | histórico e reporter de diálogo | composition root | `DELETE` | exclusivo dos personagens | remover |
| `milestoneStore.ts` | marcos convencionais, salas e estrutura | application | `SPLIT` | tabela e store são mistos | filtrar para produto |
| `placedObjectRepository.ts` | persistência de objetos | mundo | `DELETE` | exclusivo | remover |
| `worldStructureRepository.ts` | persistência de estrutura | mundo | `DELETE` | exclusivo | remover |
| `database/schema.ts`, `database.ts` | schema convencional e espacial | persistência | `SPLIT` | manter v1–v7 como histórico de upgrade e adicionar v8 | retirar tabelas ativas do mundo |
| `backup/*` e `application/backup.ts` | export/restore misto | Ajustes | `SPLIT` | infraestrutura é essencial | criar formato sem mundo e leitor legado filtrado |
| `infrastructure/audio/*`, `application/audio.ts` | áudio genérico e cues do mundo | shell/mundo | `SPLIT` | backend e preferências sobrevivem | reduzir manifesto/intents |
| `useAudioExperience.ts` | lifecycle, página e música de rota | shell | `SPLIT` | remover entrada/saída musical da Biblioteca | manter lifecycle/cues gerais |
| `features/settings/SettingsPage.tsx` | preferências e backup | Ajustes | `REWRITE` | contagem/textos incluem marcos mistos | ajustar formato e avisos |
| `infrastructure/database/diagnostics.ts` | contagem convencional | Ajustes/dev | `KEEP` | já não expõe tabelas do mundo | preservar |
| `startupPerformance.ts` | marcação geral de startup | shell/renderer | `REWRITE` | infraestrutura útil, métricas antigas não | manter somente fases convencionais |
| `styles.css` | shell, funcionalidades e mundo | toda UI | `SPLIT` | muitos seletores espaciais | remover CSS morto |
| demais `domain/application/infrastructure/features` convencionais | registros, anotações, tags, sessões, busca e estatísticas | produto | `KEEP` | independentes do mundo | preservar |

Não deve ser mantida uma versão reduzida de `library-visual`, nem abstrações Phaser sem consumidor.

---

## 6. Assets

| Família/ID | Fontes e runtime | Tamanho aproximado | Referências | Licença atual | Classe |
|---|---|---:|---|---|---|
| `architecture.floor.wood-01` | 4 fontes + 4 PNGs internos | runtime 8,8 MiB | estrutura/manifestos | geração específica; validação humana pendente | `ARCHIVE_SOURCE` + runtime `DELETE` |
| `architecture.floor.exterior-ground-01-*` | 4 fontes + 4 PNGs exteriores | runtime 10,7 MiB | cena/exterior | geração específica; validação pendente | `ARCHIVE_SOURCE` + runtime `DELETE` |
| `architecture.wall.stone-01` | 12 fontes + 12 PNGs | runtime 8,7 MiB | catálogo, renderer, continuidade | criação do projeto; arte/licença final ainda sujeitas a gate | `ARCHIVE_SOURCE` + runtime `DELETE` |
| `furniture.desk.wood-01` | 4 fontes + 4 PNGs | runtime 0,27 MiB | `PlacedObject` | geração específica | `ARCHIVE_SOURCE` + runtime `DELETE` |
| `furniture.chair.wood-01` | 4 fontes + 4 PNGs | runtime 0,16 MiB | `PlacedObject` | geração específica | `ARCHIVE_SOURCE` + runtime `DELETE` |
| cantos candidatos W3-A | `art-candidates/w3-a-r2-b/` | 4,7 MiB | pipeline de paredes | origem auditável do projeto | `ARCHIVE_SOURCE` |
| guias W3-A | `art-guides/` | cerca de 41 MiB | inspeção/correções | artefatos internos | `DELETE`, preservando somente resumos textuais úteis |
| `room-procedural-v1` | código Phaser | sem arquivo externo | cena, estante, balcão, livro, lâmpada, personagens | autoria interna | `DELETE` |
| estantes/livros/props provisórios | Phaser Graphics, sem PNG dedicado | código | `roomManifest`/renderer | autoria interna | `DELETE` |
| personagens | desenho procedural | código | cenas/rotinas | autoria interna | `DELETE` |
| `music-library-provisional-v1` | `library-ambient.wav` | 705.644 B | playlist Biblioteca | geração interna | `DELETE` |
| `shelf-touch`, `librarian-touch`, `creature-touch` | 3 WAVs | 43.350 B | interações espaciais | geração interna | `DELETE` |
| `ui-page-provisional-v1` | `ui-page.wav` | 6.218 B | navegação | geração interna | `KEEP` |
| `book-completed-provisional-v1` | `book-completed.wav` | 36.206 B | conclusão de registro | geração interna | `KEEP` |

Diretórios inteiramente ligados ao mundo:

```text
public/assets/
art-source/
art-candidates/
art-guides/
```

No estado pós-expurgo, nenhum desses assets deve continuar no bundle. As fontes podem ser preservadas pelo Git ou por arquivo histórico externo; isso não exige mantê-las na linha ativa.

---

## 7. Persistência

O Dexie está na versão 7 e possui 11 tabelas. A evolução consta em [`schema.ts`](../src/infrastructure/database/schema.ts#L23).

### A. Dados convencionais

Preservar:

```text
libraryEntries
notes
quotes
activities
tags
sessions
settings
metadata
```

Isso inclui os seis tipos de registro e todo o conteúdo pessoal convencional.

### B. Dados do mundo

Remover:

```text
placedObjects
worldStructures
settings["dialogue.history.v1"]
```

### C. Dados mistos

`milestones` contém:

- dez marcos genéricos de produto;
- quinze estágios de salas;
- quatro marcos estruturais;
- recompensa de luminária no marco de primeiro livro concluído;
- concessões físicas de piso, paredes, cantos e porta.

Recomendação: preservar os dez marcos genéricos e seus timestamps, remover estágios de salas, marcos estruturais e todas as recompensas visuais/estruturais.

### Migração necessária

O expurgo requer Dexie v8:

1. declarar novo schema sem `placedObjects` e `worldStructures`;
2. filtrar `milestones` para IDs convencionais;
3. retirar recompensas espaciais dos marcos preservados;
4. remover `dialogue.history.v1`;
5. atualizar o marcador de schema;
6. preservar integralmente as oito categorias convencionais;
7. testar upgrade de v5, v6 e v7;
8. testar fechamento e reabertura do banco;
9. testar falha/rollback;
10. confirmar que a inicialização não recria `world.main`.

Versões v1–v7 não devem ser reescritas.

---

## 8. Backup

O formato atual é v5 e inclui explicitamente `milestones`, `placedObjects` e `worldStructure` em [`backup.ts`](../src/application/backup.ts#L13).

Impactos:

| Elemento | Política recomendada |
|---|---|
| `PlacedObject` | não exportar no novo formato; ignorar com aviso ao ler v4/v5 |
| `WorldStructureState` | não exportar; ignorar com aviso ao ler v5 |
| marcos genéricos | preservar |
| marcos de salas/estrutura | descartar |
| concessões estruturais | descartar |
| recompensa da luminária | remover do marco preservado |
| diálogo histórico | não exportar/restaurar |
| registros/notas/citações/atividades/tags/sessões/preferências | preservar |

Recomendação:

- criar `formatVersion: 6`;
- v6 não possuir `placedObjects` nem `worldStructure`;
- v6 validar apenas marcos genéricos;
- manter leitores v1–v5;
- validar checksum e schemas legados antes da transformação;
- importar somente conteúdo convencional e marcos genéricos;
- apresentar warning explícito sobre estado legado descartado;
- nunca recriar o mundo após restore;
- atualizar contagens e textos da tela de Ajustes.

Testes obrigatórios:

- round-trip v6;
- backup v5 contendo mundo → registros preservados e mundo descartado;
- backup com apenas mundo → inspeção informa ausência de conteúdo restaurável ou descarte explícito;
- checksum inválido falha antes da transformação;
- IDs duplicados continuam rejeitados;
- destino vazio e destino preenchido;
- safety backup antes de replace;
- rollback integral;
- reabertura após restore.

Compatibilidade deve signific “recuperar dados convencionais de backup antigo”, nunca restaurar o mundo antigo.

---

## 9. Progressão

### Progressão de produto

Podem sobreviver:

```text
milestone.first-book
milestone.first-completed-book
milestone.first-note
milestone.first-quote
milestone.first-movie
milestone.first-series
milestone.first-study
milestone.first-physical-activity
milestone.first-work
milestone.first-session
```

Esses marcos representam fatos pessoais do produto.

O marco `first-completed-book` deve perder:

- `decoration.reading-lamp`;
- diálogo da bibliotecária;
- unlock visual;
- dependência do renderer.

O cue `book-completed.wav` pode continuar sendo acionado por um evento convencional após commit.

### Progressão do mundo antigo

Remover:

- famílias de piso, paredes, cantos e porta;
- reserva inicial;
- inventário estrutural;
- thresholds 1/5/15/30;
- concessões físicas;
- `eligibleCompletedSessionCount` como progressão estrutural;
- quinze estágios de salas;
- reconciliação de progressão estrutural;
- feedback “novas peças desbloqueadas”;
- abertura automática da Construção.

Sessões continuam atualizando registros e histórico, mas deixam de produzir grants e snapshots estruturais.

---

## 10. Interface React

| Elemento | Classe | Ação |
|---|---|---|
| rota `/` Biblioteca | `REWRITE` | placeholder acessível e coerente |
| `LibraryVisualHost` | `DELETE` | remover |
| canvas Phaser | `DELETE` | remover |
| Construção | `DELETE` | remover |
| organização/movimento espacial | `DELETE` | remover |
| seleção, preview, labels e overlays espaciais | `DELETE` | remover |
| bottom sheet e alternativa textual do mundo | `DELETE` | remover junto ao comportamento descrito |
| header | `KEEP` | manter variante compatível com placeholder |
| dock | `KEEP` | Biblioteca continua como destino |
| active session indicator | `KEEP` | funcionalidade convencional |
| notificações de luminária e estrutura | `DELETE` | recompensas antigas |
| shell de contraste, texto e movimento reduzido | `KEEP` | acessibilidade convencional |
| Coleção/Arquivo/Resumo/Ajustes | `KEEP` | independentes |
| editores/detalhes | `KEEP` | independentes |
| CSS | `SPLIT` | excluir seletores de mundo/construção |

Placeholder mínimo recomendado:

- título “Biblioteca”;
- indicação de que o mundo anterior foi removido;
- indicação de que o novo mundo ainda não foi implementado;
- links para Coleção e criação de registro;
- nenhum canvas, loader, cena ou estado espacial.

---

## 11. Testes e E2E

Há 102 arquivos de teste em `src`; 27 estão em `library-visual`.

| Grupo | Classe | Tratamento |
|---|---|---|
| `library-visual/**/*.test.*` | `DELETE` | comportamento extinto |
| testes `world*` | `DELETE` | objetos, grid e estrutura antigos |
| testes de rooms/structuralProgress | `DELETE` | progressão antiga |
| testes de conteúdo/diálogo | `DELETE` ou `SPLIT` | extrair somente marcos genéricos |
| `milestones.test.ts` | `SPLIT` | manter casos convencionais |
| `milestoneStore.test.ts` | `SPLIT` | testar apenas marcos convencionais e migração |
| `pages.test.tsx` | `REWRITE` | placeholder Biblioteca |
| `App.test.tsx` | `SPLIT` | manter shell/rotas; retirar unlocks |
| `createApplication.test.ts` | `SPLIT` | manter composição convencional |
| `backup.test.ts` | `REWRITE` | v6 e import legado filtrado |
| `database.test.ts`, `schema.test.ts` | `REWRITE` | v8 |
| `migrationV7.test.ts` | `KEEP` | prova de upgrade histórico |
| novo `migrationV8.test.ts` | novo | remoção segura/reabertura |
| `sessions.test.ts` | `SPLIT` | retirar retorno estrutural |
| `statistics.test.ts` | `SPLIT` | retirar fatos de salas |
| testes de áudio | `SPLIT` | manter lifecycle e cues gerais |
| testes convencionais | `KEEP` | regressão do produto |

E2E:

| Arquivo | Classe |
|---|---|
| `construction-editor.spec.ts` | `DELETE` |
| `library-layout-v2.spec.ts` | `DELETE` |
| `w3-a-r3-c-b2.spec.ts` | `DELETE` |
| `critical-flow.spec.ts` | `REWRITE` |
| `r4-shell.spec.ts` | `SPLIT` |
| `search-and-backup.spec.ts` | `SPLIT` |
| `p1-entries.spec.ts` | `KEEP` |
| `p1-memory.spec.ts` | `KEEP` |
| `fixtures.ts` | `SPLIT` se contiver setup espacial |

`playwright.config.ts` deve perder comentários e decisões justificadas por Phaser/WebGL. A política de workers deve então ser reavaliada por evidência.

---

## 12. Scripts/tooling

| Script | Classe | Motivo |
|---|---|---|
| `process-wall-assets.mjs` | `DELETE` | pipeline PNG de paredes |
| `process-wall-assets.test.mjs` | `DELETE` | teste do pipeline removido |
| `generate-wall-corner-guides.mjs` | `DELETE` | guia W3-A |
| `wall-asset-metrics.mjs` | `DELETE` | métricas de paredes |
| `wall-asset-metrics.test.mjs` | `DELETE` | teste morto |
| `firefox_construction_probe.py` | `DELETE` | diagnóstico Construção/Phaser |
| `report-build-performance.mjs` | `REWRITE` | hoje exige chunk Phaser lazy |
| `generate-audio-assets.mjs` | `SPLIT` | manter somente áudio convencional |

Scripts npm a remover:

```text
wall-assets:process
wall-assets:check
wall-guides:generate
wall-guides:check
```

Scripts a preservar:

```text
dev
build
build:diagnostics
preview
lint
typecheck
test
test:run
test:e2e
test:e2e:ui
format
format:check
android:*
```

`audio:*` permanece após redução do manifesto. `performance:report` permanece somente se for reescrito como diagnóstico geral de bundle/startup.

Vite, Vitest, Capacitor e Gradle são gerais. A CI deve continuar, mas seus gates de áudio/performance precisam refletir os contratos sobreviventes.

---

## 13. Inventário documental

### Raiz

| Documento | Papel |
|---|---|
| `AGENTS.md` | regras de contribuição |
| `README.md` | apresentação do produto |
| `CHANGELOG.md` | histórico observável |
| `CONTRIBUTING.md` | fluxo humano |
| `MANIFEST.md` | índice antigo e redundante |
| `DOCUMENTATION_REVISION.md` | registro da reorganização documental |

### Canônicos

- estado: `STATUS.md`;
- visão: `PRODUCT.md`;
- direção: `ROADMAP.md`;
- arquitetura: `ARCHITECTURE.md`;
- dados/backup: `DATA_MODEL.md`;
- mundo atual: `WORLD_MODEL.md`;
- sequência abandonada: `W3_PLAN.md`;
- arte/assets: `ART_DIRECTION.md`, `ASSET_PIPELINE.md`, `ASSET_REGISTRY.md`;
- qualidade: `TESTING.md`, `PERFORMANCE.md`, `RISKS.md`, `MAINTENANCE.md`;
- experiência: `UX.md`, `ACCESSIBILITY.md`, `AUDIO.md`;
- plataforma e proteção: `ANDROID.md`, `SECURITY.md`, `PRIVACY.md`;
- apoio: `CONTENT_GUIDE.md`, `GLOSSARY.md`, `HISTORY.md`.

### Decisões

Sete ADRs aceitos, dos quais ADR-002 a ADR-006 são afetados.

### Histórico

O histórico já contém:

- planos do protótipo, W1 e W2;
- plano mestre e refinamentos;
- especificação de assets legada;
- decisões e changelog anteriores;
- plano, log e handoff da correção W3-A;
- plano de testes legado;
- checkpoints Android.

Há destino suficiente para W1/W2/W3-A. `W3_PLAN.md` ainda precisa entrar nesse histórico.

---

## 14. Mapa de autoridade documental

| Assunto | Documento(s) atual(is) | Autoridade clara? | Conflito? |
|---|---|---:|---:|
| estado do projeto | `STATUS.md` | sim | com decisão de reset e `MANIFEST` |
| roadmap | `ROADMAP.md`, `W3_PLAN.md`, ecos em `STATUS/PRODUCT/README` | não | sim |
| arquitetura geral | `ARCHITECTURE.md`, ADR-001/002 | sim | ADR-002 ficou obsoleto |
| mundo | `WORLD_MODEL.md`, ADR-003/004 | sim para mundo antigo | sim com reset |
| direção artística | `ART_DIRECTION.md` | sim | proíbe 3D real |
| assets | `ASSET_REGISTRY.md` | sim | path interno contraditório |
| pipeline de assets | `ASSET_PIPELINE.md` | sim | pipeline será abandonado |
| dados | `DATA_MODEL.md`, ADR-006 | sim | ficará obsoleto após v8 |
| backup | `DATA_MODEL.md`, `SECURITY.md`, `PRIVACY.md`, ADR-006 | distribuída | sem conflito atual |
| performance | `PERFORMANCE.md`, `STATUS.md` | sim | métricas Phaser caducarão |
| testes | `TESTING.md`, `AGENTS.md`, scripts npm | sim | comandos do mundo caducarão |
| riscos | `RISKS.md`, `STATUS.md` | sim | vários riscos morrerão |
| decisões | `decisions/README.md`, ADR-007 | sim | índice ainda declara ADRs antigos vigentes |
| W3 | `W3_PLAN.md`, `ROADMAP.md`, `STATUS.md`, `PRODUCT.md`, `README.md` | não | redundância e plano abandonado |

---

## 15. Contradições e redundâncias documentais

Principais divergências concretas:

1. [`STATUS.md`](../docs/STATUS.md#L50) e [`ROADMAP.md`](../docs/ROADMAP.md#L15) apresentam W3-B como próxima etapa; a decisão atual abandona W3-B–W3-F.
2. [`ART_DIRECTION.md`](../docs/ART_DIRECTION.md#L16) diz que 3D real não está aprovado e o lista novamente como “fora da direção”.
3. `ADR-002` declara Phaser parte da arquitetura aceita.
4. `ADR-003` e `WORLD_MODEL.md` tratam `WorldStructureState`/`PlacedObject` como contratos ativos.
5. `ADR-004` trata a geometria W3-A como autoridade.
6. `ADR-005` torna sessões fonte de peças estruturais.
7. `MANIFEST.md` diz que R3-C-B2 falhou e R4 não começou; `STATUS.md` diz que R0–R6 foram encerradas e validadas.
8. `DOCUMENTATION_REVISION.md` afirma que `MANIFEST.md` não existe separadamente, mas ele está no checkout.
9. `MANIFEST.md` referencia 13 paths inexistentes, incluindo `docs/PLANO_MESTRE.md`, `ASSET_SPEC.md`, `TEST_PLAN.md` e `DECISIONS.md`.
10. `ASSET_REGISTRY.md` primeiro registra um path de piso incorreto e depois o corrige em nota.
11. `W3_PLAN`, `ROADMAP`, `STATUS`, `PRODUCT` e `README` competem pela sequência futura.
12. `WORLD_MODEL`, `ARCHITECTURE` e `DATA_MODEL` repetem parte da autoridade espacial.

### Respostas às doze perguntas

1. **Quantos descrevem diretamente o mundo atual?**  
   Dos 38 documentos ativos considerados, 28 mencionam diretamente renderer, W3-A, blueprint, estrutura ou objetos. Excluindo documentos históricos por natureza (`CHANGELOG`, `HISTORY`, `DOCUMENTATION_REVISION`), são 25 orientativos/operacionais.

2. **Quantos citam Phaser?**  
   21.

3. **Quantos dependem de W1/W2/W3-A?**  
   11 mencionam explicitamente essas eras.

4. **Quantos tratam W3-B–W3-F como futuro ativo?**  
   Seis: `README`, `docs/README`, `STATUS`, `PRODUCT`, `ROADMAP`, `W3_PLAN`. Oito mencionam a sequência no total, contando `CHANGELOG` e `DOCUMENTATION_REVISION`.

5. **Quais descrevem PNGs como autoridade?**  
   `ART_DIRECTION.md`, `ASSET_REGISTRY.md` e, funcionalmente, `ASSET_PIPELINE.md`.

6. **Quais apresentam `WorldStructureState` como fundação?**  
   `STATUS`, `ARCHITECTURE`, `DATA_MODEL`, `WORLD_MODEL`, `ADR-003`; `W3_PLAN` pressupõe essa fundação para o trabalho posterior.

7. **Quais apresentam `PlacedObject` no futuro planejado?**  
   Principalmente `W3_PLAN`; `STATUS` e `ROADMAP` ecoam footprints, movimento e rotação como base de W3-B.

8. **Histórico usado como orientação ativa?**  
   Não. As referências ativas a `docs/history/` estão corretamente qualificadas como contexto. O problema está em documentos ativos que deveriam ser históricos.

9. **Há redundância vigente?**  
   Sim: `MANIFEST` versus `docs/README`; `W3_PLAN` versus roadmap/status; múltiplas descrições do mundo.

10. **Há propósito obscuro?**  
    Sim: `MANIFEST.md` e `DOCUMENTATION_REVISION.md` não têm função operacional contínua.

11. **Links quebrados?**  
    Não foram encontrados links Markdown atualmente quebrados. Há referências textuais inexistentes no `MANIFEST`. Após o reset, links para `W3_PLAN` e `WORLD_MODEL` quebrarão se índices e referências não forem atualizados no mesmo lote.

12. **README, MANIFEST, índices ou AGENTS precisam mudar?**  
    Todos: `README`, `AGENTS`, `docs/README`, `decisions/README`; `MANIFEST` deve desaparecer. `DOCUMENTATION_REVISION` deve ser arquivado.

---

## 16. Classificação documental

### Documentos ativos e raiz

| Documento | Papel atual | Legado | Classe | Destino | Motivo |
|---|---|---:|---|---|---|
| `AGENTS.md` | regras | sim | `REWRITE` | raiz | retirar invariantes Phaser/W3 e comandos de walls |
| `README.md` | entrada pública | sim | `REWRITE` | raiz | anunciar app convencional e placeholder |
| `CHANGELOG.md` | histórico | sim | `REWRITE` | raiz | adicionar remoção sem apagar história |
| `CONTRIBUTING.md` | contribuição | parcial | `REWRITE` | raiz | reconciliar referências e gates |
| `MANIFEST.md` | índice antigo | quase total | `DELETE` | Git | redundante e incorreto |
| `DOCUMENTATION_REVISION.md` | migração documental | total | `ARCHIVE` | `docs/history/documentation/` | evento encerrado |
| `docs/README.md` | índice canônico | sim | `REWRITE` | mesmo path | nova autoridade |
| `STATUS.md` | presente | quase total | `REWRITE` | mesmo path | novo estado é sem mundo |
| `PRODUCT.md` | visão | parcial | `REWRITE` | mesmo path | preservar produto, retirar mundo contratual |
| `ARCHITECTURE.md` | arquitetura | parcial | `REWRITE` | mesmo path | manter camadas; retirar Phaser/world |
| `DATA_MODEL.md` | dados | parcial | `REWRITE` | mesmo path | v8, formato v6, filtros legados |
| `WORLD_MODEL.md` | mundo W3-A | total | `ARCHIVE` | `history/world/WORLD_MODEL_LEGACY.md` | contrato abandonado |
| novo `WORLD.md` | ausência/intenção futura | — | `REWRITE` | `docs/WORLD.md` | nova autoridade, sem implementação |
| `ART_DIRECTION.md` | estética + sprites | alto | `SPLIT` | ativo + histórico W3 | preservar estética, arquivar regras 2D |
| `ASSET_PIPELINE.md` | pipeline geral + walls | alto | `SPLIT` | ativo + histórico | retirar comandos PNG, manter princípios |
| `ASSET_REGISTRY.md` | catálogo ativo + procedência | alto | `SPLIT` | ativo + snapshot histórico | catálogo ativo não pode listar arquivos apagados |
| `PERFORMANCE.md` | budgets gerais + Phaser | alto | `SPLIT` | mesmo path | estabelecer baseline pós-expurgo |
| `TESTING.md` | estratégia + mundo | alto | `SPLIT` | mesmo path | retirar gates extintos |
| `MAINTENANCE.md` | operação | parcial | `SPLIT` | mesmo path | retirar renderer e wall tooling |
| `RISKS.md` | riscos | parcial | `REWRITE` | mesmo path | aposentar riscos antigos e incluir 3D |
| `ROADMAP.md` | futuro | alto | `REWRITE` | mesmo path | remover W3-B–F |
| `W3_PLAN.md` | plano abandonado | total | `ARCHIVE` | `history/plans/W3_PLAN_LEGACY.md` | não é mais trabalho futuro |
| `AUDIO.md` | áudio geral + mundo | parcial | `SPLIT` | mesmo path | preservar infraestrutura/cues gerais |
| `UX.md` | fluxos gerais + Biblioteca | parcial | `SPLIT` | mesmo path | placeholder substitui experiência espacial |
| `ACCESSIBILITY.md` | acessibilidade | parcial | `REWRITE` | mesmo path | retirar contrato Phaser e manter requisitos |
| `ANDROID.md` | plataforma/gates | parcial | `REWRITE` | mesmo path | remover validação atual do canvas |
| `SECURITY.md` | proteção | parcial | `REWRITE` | mesmo path | tratar descarte legado |
| `PRIVACY.md` | dados pessoais | parcial | `REWRITE` | mesmo path | retirar mundo como dado ativo |
| `CONTENT_GUIDE.md` | diálogos/personagens | total | `ARCHIVE` | `history/world/` | sistema sem consumidor |
| `GLOSSARY.md` | termos | alto | `REWRITE` | mesmo path | eliminar vocabulário W3/Phaser |
| `HISTORY.md` | resumo histórico | não | `REWRITE` | mesmo path | registrar reset e apontar arquivos |
| `decisions/README.md` | índice ADR | sim | `REWRITE` | mesmo path | marcar substituições |

### Templates

| Documento | Classe | Destino |
|---|---|---|
| `ADR_TEMPLATE.md` | `KEEP` | mesmo path |
| `CODEX_PROMPT_TEMPLATE.md` | `KEEP` | mesmo path |
| `GATE_REPORT_TEMPLATE.md` | `KEEP` | mesmo path |
| `MANUAL_TEST_REPORT_TEMPLATE.md` | `KEEP` | mesmo path |
| `RELEASE_CHECKLIST.md` | `REWRITE` | retirar alternativa “sem Phaser” como fallback |

### Histórico existente

Todos os seguintes são `KEEP` no lugar, como evidência:

```text
docs/history/legacy/ANDROID_RELEASE_CHECKPOINTS.md
docs/history/legacy/ASSET_SPEC_LEGACY.md
docs/history/legacy/CHANGELOG_LEGACY.md
docs/history/legacy/DECISIONS_LEGACY.md
docs/history/plans/EXECUTION_PLAN_PROMPTS_1_19.md
docs/history/plans/PLANO_MESTRE_ORIGINAL.md
docs/history/plans/PRODUCT_PHASE_PLAN.md
docs/history/plans/REFINEMENT_PLAN.md
docs/history/testing/TEST_PLAN_LEGACY.md
docs/history/w3-a/CORRECTION_LOG.md
docs/history/w3-a/CORRECTION_PLAN.md
docs/history/w3-a/README.md
```

`docs/history/README.md`: `REWRITE` apenas para indexar os novos arquivos arquivados.

---

## 17. ADRs afetados

| ADR | Decisão | Afetada? | Sobrevive? | Substituição | Motivo |
|---|---|---:|---:|---:|---|
| ADR-001 | local-first | não materialmente | sim | não | produto e dados locais permanecem |
| ADR-002 | React + Phaser + Dexie + Capacitor | sim | parcialmente | sim | Phaser deixa a arquitetura |
| ADR-003 | mundo persistente e objetos separados | sim | não | sim | ambos os agregados serão removidos |
| ADR-004 | geometria estrutural canônica | sim | não | coberta pelo ADR de reset | implementação extinta |
| ADR-005 | progressão estrutural por sessões | sim | não | coberta pelo ADR de reset/dados | grants extintos |
| ADR-006 | schema aditivo e backup versionado | sim | princípio apenas | sim | números e semântica mudarão |
| ADR-007 | autoridade documental | não | sim | não | continua válida |

Não apagar ADRs. ADR-002–006 devem permanecer como decisões substituídas, com link para sucessoras.

Novos ADRs necessários:

1. reset integral do mundo e abandono de Phaser;
2. política de descarte/arquivamento de dados espaciais e importação de backups legados;
3. direção de apresentação 3D ortográfica/2.5D, sem ainda escolher implementação se isso não estiver decidido;
4. escolha futura do renderer 3D;
5. novo pipeline GLB/`.blend`/texturas;
6. nova persistência espacial, quando projetada.

Os itens 4–6 não bloqueiam o expurgo.

---

## 18. Roadmap e W3

Intenções de produto que podem ser reaproveitadas:

- Biblioteca como lugar pessoal e vivo;
- mundo relacionado aos registros, não separado deles;
- estantes e livros como metáforas possíveis;
- interação direta;
- apresentação ortográfica/2.5D;
- acessibilidade React paralela à apresentação visual;
- produto local-first e não coercitivo;
- ausência de XP, moedas, streaks e social.

Planejamento técnico obsoleto:

- W3-B como continuação de `PlacedObject`;
- sprites em quatro orientações;
- footprints e pivôs atuais;
- W3-C derivando sprites de livros;
- W3-D desbloqueando estante via reward atual;
- W3-E usando o objeto ativo atual;
- W3-F acoplado à sequência anterior;
- `WorldStructureState` como fundação;
- Phaser como host;
- continuidade do pipeline W3-A.

`W3_PLAN.md` deve ser arquivado integralmente. Apenas intenções de produto independentes da implementação devem ser reexpressas, em linguagem curta, no novo `WORLD.md` ou `ROADMAP.md`.

---

## 19. Estrutura documental recomendada pós-expurgo

```text
/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── docs/
    ├── README.md
    ├── STATUS.md
    ├── PRODUCT.md
    ├── ROADMAP.md
    ├── ARCHITECTURE.md
    ├── DATA_MODEL.md
    ├── WORLD.md
    ├── ART_DIRECTION.md
    ├── ASSET_PIPELINE.md
    ├── ASSET_REGISTRY.md
    ├── UX.md
    ├── ACCESSIBILITY.md
    ├── AUDIO.md
    ├── TESTING.md
    ├── PERFORMANCE.md
    ├── SECURITY.md
    ├── PRIVACY.md
    ├── ANDROID.md
    ├── MAINTENANCE.md
    ├── RISKS.md
    ├── GLOSSARY.md
    ├── HISTORY.md
    ├── decisions/
    ├── templates/
    └── history/
        ├── documentation/
        ├── legacy/
        ├── plans/
        ├── testing/
        ├── w3-a/
        └── world/
```

Autoridade:

- `README`: o que é o produto;
- `STATUS`: o que funciona hoje e o que não existe;
- `ROADMAP`: próxima decisão e trabalho aprovado;
- `WORLD`: intenção futura e limites conhecidos;
- `ARCHITECTURE`: software existente, sem inventar renderer futuro;
- `DATA_MODEL`: estado persistido ativo e compatibilidade;
- `ART_DIRECTION`: aparência desejada;
- `ASSET_PIPELINE`: processo válido para novos assets;
- `ASSET_REGISTRY`: somente assets realmente presentes;
- `history/`: mundo removido e razões históricas.

Um novo colaborador deverá seguir:

```text
README
→ docs/README
→ STATUS
→ PRODUCT / ROADMAP
→ ARCHITECTURE / DATA_MODEL
→ WORLD / ART_DIRECTION
→ decisions/
→ history/ somente se precisar de contexto
```

---

## 20. Ordem recomendada do expurgo

Tudo deve ser entregue em um único checkpoint coerente, sem feature flag ou convivência de renderers:

1. registrar as decisões sobre dados e backup legado;
2. adicionar testes de migração v8 e backup v6 antes de retirar os contratos;
3. separar marcos convencionais de salas/recompensas estruturais;
4. separar áudio convencional de música/cues espaciais;
5. substituir a rota Biblioteca por placeholder;
6. retirar feedback estrutural e de luminária do `App`;
7. retirar mundo, diálogos e progressão do composition root;
8. retirar `PlacedObject`, `WorldStructureState`, salas, estrutura e repositórios;
9. aplicar schema v8 e transformação de dados;
10. aplicar formato de backup v6 e leitura convencional de v1–v5;
11. remover `library-visual` e todos os consumidores Phaser;
12. remover assets runtime, fontes ativas, candidatos e guias;
13. remover scripts, diagnósticos e testes mortos;
14. remover Phaser e atualizar lockfile;
15. limpar CSS e configurações;
16. reescrever documentos canônicos;
17. arquivar W3, modelo do mundo e documentação de conteúdo;
18. marcar ADRs substituídos e adicionar sucessoras;
19. atualizar changelog e índices;
20. executar regressão completa.

Verificação proporcional:

```text
npm run format
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
git diff --check
git status --short
```

Validação Android, TalkBack, áudio percebido e performance física continuam exigindo evidência humana.

---

## 21. Estado técnico esperado após o expurgo

Continuará funcionando:

- inicialização React e abertura do Dexie;
- shell, header, dock e rotas;
- Biblioteca como placeholder;
- Coleção;
- seis tipos de registro;
- criação, edição, visualização e exclusão;
- progresso de livros, séries e estudos;
- status, datas e avaliações;
- notas e citações;
- etiquetas e favoritos;
- busca e filtros;
- sessões temporizadas e manuais;
- indicador de sessão ativa;
- histórico de atividades;
- Resumo/estatísticas;
- Arquivo;
- Ajustes;
- preferências de áudio e experiência;
- texto maior, contraste e movimento reduzido;
- persistência local;
- backup/export/restore convencional;
- entrega de arquivos no navegador e Android;
- Capacitor e build Android;
- diagnósticos gerais.

Não existirá:

- Phaser;
- canvas ou renderer;
- cenas;
- câmera/pan/zoom;
- construção;
- organização espacial;
- estrutura, pisos, paredes, cantos ou portas;
- objetos posicionados;
- personagens e diálogos;
- rewards espaciais;
- assets visuais do mundo;
- música/efeitos exclusivos do mundo;
- testes e tooling W1/W2/W3-A.

---

## 22. Estado documental esperado após o expurgo

A documentação vigente afirmará, sem ambiguidade:

> Aplicativo convencional preservado e funcional; mundo anterior removido; rota Biblioteca temporariamente sem mundo; novo mundo 3D ortográfico/2.5D ainda não implementado.

Também deverá afirmar:

- Phaser não faz parte da arquitetura ativa;
- W1/W2/W3-A são história;
- W3-B–W3-F não são roadmap ativo;
- nenhum schema espacial está aprovado para o novo mundo;
- nenhum pipeline 3D definitivo está aprovado enquanto não houver ADR;
- `PlacedObject` e `WorldStructureState` atuais são legados;
- assets PNG removidos não pertencem ao bundle;
- backups antigos recuperam conteúdo convencional, não o mundo;
- ADRs substituídos permanecem consultáveis;
- `docs/history/` nunca autoriza novo trabalho.

---

## 23. Bloqueadores reais

Não há bloqueador arquitetural para retirar Phaser ou deixar a Biblioteca como placeholder.

Há três decisões de dados que precisam ser fechadas antes da execução:

1. o estado `placedObjects/worldStructures` será descartado irreversivelmente ou haverá exportação de segurança explícita antes da migração?
2. backups v4/v5 serão aceitos para restauração convencional com warnings, ou totalmente rejeitados?
3. os dez marcos genéricos e seus timestamps devem sobreviver, sem rewards, ou o sistema inteiro de marcos será removido?

A recomendação desta auditoria é:

- oferecer/garantir uma forma explícita de backup antes da migração destrutiva;
- aceitar backups antigos, restaurando apenas dados convencionais;
- preservar os dez marcos genéricos e seus timestamps;
- nunca preservar ou restaurar o estado visual.

Escolha de engine 3D, pipeline e novo schema espacial não bloqueiam o expurgo.

---

## 24. Lista final de remoção

### Código/diretórios

```text
src/features/library-visual/

src/application/dialogue.ts
src/application/dialogue.test.ts
src/application/dialogueService.test.ts
src/application/rooms.ts
src/application/rooms.test.ts
src/application/structuralProgression.ts
src/application/structuralProgression.test.ts
src/application/world.ts
src/application/world.test.ts
src/application/worldObjects.ts
src/application/worldObjects.test.ts
src/application/worldStructure.ts
src/application/worldStructure.test.ts
src/application/worldStructureAnalysis.ts
src/application/worldStructureAnalysis.test.ts
src/application/worldStructureEditing.ts
src/application/worldStructureEditing.test.ts
src/application/worldStructureGeometry.test.ts
src/application/worldStructureObjects.ts
src/application/worldStructureRepository.ts

src/domain/rooms.ts
src/domain/rooms.test.ts
src/domain/structuralProgress.ts
src/domain/structuralProgress.test.ts

src/infrastructure/database/placedObjectRepository.ts
src/infrastructure/database/worldStructureRepository.ts
src/infrastructure/dialogue/

src/content/ após extração dos marcos genéricos
```

### Assets

```text
public/assets/
art-source/
art-candidates/
art-guides/

public/audio/library-ambient.wav
public/audio/shelf-touch.wav
public/audio/librarian-touch.wav
public/audio/creature-touch.wav
```

### Tooling

```text
scripts/process-wall-assets.mjs
scripts/process-wall-assets.test.mjs
scripts/generate-wall-corner-guides.mjs
scripts/wall-asset-metrics.mjs
scripts/wall-asset-metrics.test.mjs
scripts/firefox_construction_probe.py
```

### E2E

```text
e2e/construction-editor.spec.ts
e2e/library-layout-v2.spec.ts
e2e/w3-a-r3-c-b2.spec.ts
```

### Dependências

```text
phaser
eventemitter3, transitiva
```

### Estado persistido

```text
placedObjects
worldStructures
marcos room.*
marcos structure.*
rewards decoration/structure-grant
settings["dialogue.history.v1"]
```

### Documentação ativa

```text
MANIFEST.md
docs/W3_PLAN.md, movido ao histórico
docs/WORLD_MODEL.md, movido ao histórico
docs/CONTENT_GUIDE.md, movido ao histórico
DOCUMENTATION_REVISION.md, movido ao histórico
```

---

## 25. Lista final de preservação

Preservar:

```text
src/domain/ de registros, anotações, tags, sessões e validação
src/application/ de CRUD, anotações, tags, sessões, busca e estatísticas
src/infrastructure/database/ para tabelas convencionais
src/infrastructure/files/
src/infrastructure/platform/
src/infrastructure/events/
src/features/archive/
src/features/collection/
src/features/entry-detail/
src/features/entry-editor/
src/features/sessions/
src/features/settings/
src/features/statistics/
src/app/AppHeader.tsx
src/app/PrimaryDock.tsx
src/app/AppErrorBoundary.tsx
src/routes.ts
Capacitor
android/
Vite/Vitest/Playwright
public/audio/ui-page.wav
public/audio/book-completed.wav
```

Preservar após separação:

```text
App.tsx
main.tsx
pages.tsx
styles.css
createApplication.ts
application/backup.ts
application/audio.ts
application/sessions.ts
application/statistics.ts
application/milestones.ts
domain/milestones.ts
domain/events.ts
database/schema.ts
database/database.ts
database/milestoneStore.ts
infrastructure/backup/
infrastructure/audio/
SettingsPage.tsx
useAudioExperience.ts
```

Dados pessoais convencionais não devem ser alterados além do estritamente necessário para a migração versionada.

---

## 26. Lista final de documentação

### `KEEP`

```text
docs/decisions/ADR-001-local-first.md
docs/decisions/ADR-007-documentacao.md
docs/templates/ADR_TEMPLATE.md
docs/templates/CODEX_PROMPT_TEMPLATE.md
docs/templates/GATE_REPORT_TEMPLATE.md
docs/templates/MANUAL_TEST_REPORT_TEMPLATE.md
todos os documentos atualmente em docs/history/
```

### `REWRITE`

```text
AGENTS.md
README.md
CHANGELOG.md
CONTRIBUTING.md
docs/README.md
docs/STATUS.md
docs/PRODUCT.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATA_MODEL.md
docs/RISKS.md
docs/ACCESSIBILITY.md
docs/ANDROID.md
docs/SECURITY.md
docs/PRIVACY.md
docs/GLOSSARY.md
docs/HISTORY.md
docs/decisions/README.md
docs/templates/RELEASE_CHECKLIST.md
```

### `SPLIT`

```text
docs/ART_DIRECTION.md
docs/ASSET_PIPELINE.md
docs/ASSET_REGISTRY.md
docs/PERFORMANCE.md
docs/TESTING.md
docs/MAINTENANCE.md
docs/AUDIO.md
docs/UX.md
```

### `ARCHIVE`

```text
DOCUMENTATION_REVISION.md
  → docs/history/documentation/DOCUMENTATION_REVISION_2026-09-07.md

docs/W3_PLAN.md
  → docs/history/plans/W3_PLAN_LEGACY.md

docs/WORLD_MODEL.md
  → docs/history/world/WORLD_MODEL_LEGACY.md

docs/CONTENT_GUIDE.md
  → docs/history/world/CONTENT_GUIDE_LEGACY.md

ADR-002 a ADR-006
  → preservados em decisions/, marcados como substituídos e ligados às sucessoras
```

### `DELETE`

```text
MANIFEST.md
```

### `MERGE`

Nenhum documento exige merge adicional se `MANIFEST` for removido e `docs/README` permanecer como único índice.

### `REVIEW`

Nenhum documento permaneceu inconclusivo após a inspeção.

Novo documento:

```text
docs/WORLD.md
```

Ele substitui `WORLD_MODEL.md`, descrevendo ausência atual, intenção futura e questões ainda abertas, sem transformar o modelo antigo em fundação.

---

## 27. Questões de decisão

1. O upgrade v8 poderá apagar definitivamente `placedObjects` e `worldStructures`, ou deverá exigir/oferecer uma exportação de segurança antes da remoção?
2. Backups v4/v5 devem ser aceitos com restauração apenas do conteúdo convencional e warning de descarte do mundo, conforme recomendado?
3. Os dez marcos genéricos devem ser preservados com timestamps e sem recompensas, conforme recomendado, ou todos os marcos devem desaparecer?

Fora dessas três políticas de dados, a auditoria encontrou evidência suficiente para preparar um único expurgo integral, deixando a Biblioteca Viva funcional, sem Phaser, sem assets do mundo antigo e documentalmente pronta para um novo mundo construído do zero.
