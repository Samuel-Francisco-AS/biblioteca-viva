# Relatório — W3-A-R4, auditoria e proposta visual

## Resultado

Foi produzida uma direção única para a reforma completa da interface atualmente existente, acompanhada de protótipo estático navegável e capturas comparáveis. Nenhum componente, estilo, rota, regra, persistência, schema, backup, Phaser, câmera, geometria, asset ou dependência de produção foi alterado.

A instrução desta execução aceita nominalmente W3-A-R3-C-B2 e autoriza a abertura da R4. Os documentos oficiais ainda registram R4 como não iniciada; eles foram preservados porque esta entrega é proposta para revisão, não redesign aprovado.

### Método e limites da evidência

- autoridades lidas: `AGENTS.md`, `docs/STATUS.md`, `docs/00_LEIA-ME.md`, decisão mais recente em `docs/DECISIONS.md`, `docs/ROADMAP.md`, prompt histórico em `docs/EXECUTION_PLAN.md`, `docs/UX_FLOWS.md`, `docs/ACCESSIBILITY.md`, `docs/ART_DIRECTION.md` e o template de relatório;
- aplicação real inspecionada em preview de produção, numa origem local nova, com IndexedDB descartável e seis registros claramente fictícios;
- código, testes, estilos, rotas e estados React/Phaser relevantes também foram inspecionados;
- interface atual capturada em 320×640, 360×800 e 1280×800;
- a janela de navegador integrada não estava disponível; a inspeção visual automatizada usou o Chromium/Playwright já instalado no projeto;
- as capturas não são prova de aparelho, toque físico, teclado virtual, TalkBack, áudio percebido, contraste percebido ou desempenho no Moto G06.

## Auditoria do estado atual

### Síntese mensurável

| Estado atual                             |                                                                       Evidência em viewport móvel |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------: |
| Construção inicial, 320×640              |                                        painel de 296×560 px; **80,9% da área** e 92,5% da largura |
| Construção com palette, 320×640          |                                       34 controles focáveis e **três scroll owners** concorrentes |
| Construção com peça selecionada, 360×800 | ação `Mover` inicia 244 px abaixo do fim do documento visível e termina 292 px abaixo da viewport |
| Coleção preenchida, 320×640              |                                    2.289 px de altura; seis campos de busca/filtro antes da lista |
| Cadastro de livro, 320×640               |                      1.334 px de altura; `Salvar livro` termina 480 px abaixo da viewport inicial |
| Detalhe de livro, 360×800                |                             3.153 px, 12 campos, 35 controles focáveis e nove superfícies/cartões |
| Detalhe: `Iniciar sessão`, 360×800       |                                                       termina 1.652 px abaixo da viewport inicial |
| Arquivo, 320×640                         |                                              2.044 px; cinco campos de filtro antes das anotações |
| Estatísticas, 360×800                    |                                                                 3.744 px e 14 superfícies/cartões |
| Ajustes, 320×640                         |                                              2.765 px, nove campos e cinco grandes seções abertas |
| Backup, 360×800                          |                                              restauração aparece dentro de uma página de 2.603 px |

As 25 capturas atuais consolidadas (24 estados/tamanhos metrificados e um estado vazio adicional) não produziram erro de console, falha de request ou overflow horizontal no preview de produção. Isso é positivo, mas não elimina os problemas de distância, densidade, scroll e sobreposição.

### Shell e navegação

- O drawer conserva o canvas quando fechado e já possui foco contido, Escape, backdrop e `aria-current`.
- A navegação permanece invisível até a pessoa alcançar o acionador no canto superior esquerdo. Trocar de área exige abrir o drawer e escolher um destino; a descoberta e o uso com uma mão ficam piores justamente nas rotas mais longas.
- O drawer ocupa até 88% da largura. Sobre o mapa, ele interrompe o contexto espacial e cobre o conteúdo em vez de manter orientação constante.
- O código expõe seis destinos no drawer. “Novo registro” é uma ação, não uma área de informação; sua presença como destino permanente disputa hierarquia com as cinco áreas conceituais.
- Cabeçalho e conteúdo repetem títulos como “Coleção”, “Estatísticas” e “Ajustes”, usando altura e atenção sem adicionar orientação.
- No desktop, o mesmo drawer evita uma segunda arquitetura, mas não aproveita a largura para manter orientação; a troca de área continua escondida e em duas etapas.

### Biblioteca visual

- A composição atual preserva bem a identidade: sala escura, madeira, pedra, verde e dourado, sem aparência corporativa. A Biblioteca visual é a primeira superfície e deve continuar sendo.
- `Construir` e `Resumo acessível` ficam próximos do polegar, mas disputam o mesmo canto e mudam de posição por regra CSS quando a construção está disponível.
- O seletor de sala central, o header, o resumo, Construir, avisos e balões formam várias camadas absolutas com z-index independentes. O modelo funciona em estados simples, mas aumenta o risco de colisão quando sessão, unlock, sheet, fala ou objeto selecionado coexistem.
- A alternativa textual é correta como princípio e deve permanecer. Ela não deve reaparecer como painel permanente visualmente competitivo quando o canvas está funcional.
- Loading, erro e canvas indisponível já têm conteúdo textual real; falta unificar o tratamento visual e deixar mais clara a continuidade dos dados e das rotas convencionais.

### Modo Construção

- O problema crítico é comprovado: `construction-controls` é um painel rolável quase integral sobre o mapa. “Peças colocadas” é sempre renderizado e sozinho lista todas as peças.
- Abrir `Estruturas` cria um sheet rolável dentro do painel rolável, enquanto a alternativa de peças e o resumo da Biblioteca continuam presentes. São três donos de scroll e mais de um contexto de ação.
- A estrutura de estado não é exclusiva: `sheet`, `selected`, `confirmStore`, `tool`, `placingStructureDefinitionId` e `movingStructureId` vivem em níveis diferentes e podem produzir combinações que a interface não explica.
- `Escape` fecha confirmação, sheet, seleção ou sai. Ele não conhece explicitamente `placing` e `moving`; sem sheet ou seleção, pode sair da Construção em vez de cancelar a ação corrente.
- O Android Back atual é global por rota: na rota `/`, tenta sair do aplicativo. Não consulta drawer, sheet, balão, seleção, movimento, confirmação ou Construção. Portanto não segue a ordem de Escape.
- Os comandos de seleção (`Mover`, `Girar`, `Guardar`, fechar) podem estar fora da viewport porque aparecem depois da lista permanente de peças.
- `Piso` continua dentro do painel e exige ler coordenada/foco enquanto o mapa fica coberto, separando o controle da superfície em que ele atua.
- A confirmação de Guardar é mais uma superfície dentro do painel existente, não um único estado modal claramente prioritário.

### Coleção, busca, filtros e ordenação

- Sem registros, o estado vazio e a ação principal são claros.
- Com registros, seis controles aparecem antes do primeiro item. Em 320×640, a primeira dobra é quase toda ocupada por cabeçalho, CTA e filtros.
- Busca, tipo, status, favorito, etiqueta e ordenação têm boa semântica, mas sua exposição permanente mostra detalhes antes de serem necessários.
- Cards integrais são corretos para toque e navegação, porém a combinação de borda, badge, eyebrow, metadados, progresso e barra repete muita decoração por item.
- `Novo registro` aparece no topo e desaparece após rolagem longa, tornando a ação primária distante.

### Cadastro e edição dos seis tipos

- Os seis tipos existem e foram inspecionados: Livro, Filme, Série, Estudo, Atividade física e Trabalho.
- As alturas iniciais em 320×640 variam de 640 px (Série) a 1.334 px (Livro). Estudo usa 883 px e Trabalho 905 px.
- O formulário de livro apresenta sete campos em sequência; o CTA fica 480 px abaixo da viewport. Não há ação persistente acima da safe area/teclado.
- Campos obrigatórios e opcionais são rotulados, erros são associados e o foco de erro é tratado; essa base acessível deve ser mantida.
- Campos raramente necessários têm o mesmo peso de título/status. A proposta deve reorganizar por essencial primeiro e detalhes opcionais sob demanda, sem remover campo algum.
- Em edição, controles desabilitados explicam que progresso/status mudam no detalhe. A distribuição de responsabilidades é correta, mas a mensagem aumenta o comprimento e poderia ser resumida no contexto.

### Detalhe, progresso, notas, citações e sessões

- O detalhe de livro já usa disclosures para status, nota, citação e histórico, uma boa base de divulgação progressiva.
- Mesmo assim, progresso, organização, sessão e zona destrutiva formam nove superfícies numa página de 3.153 px; a ação frequente `Iniciar sessão` fica muito abaixo da identidade do registro.
- Progresso é mostrado em resumo e novamente numa seção grande; “Editar dados”, “Salvar progresso” e mudar status ficam em regiões distintas.
- Notas e citações podem ser criadas/alteradas/excluídas/compartilhadas com semântica e foco adequados. O atrito principal é encontrar a ação no fluxo longo.
- Sessão oferece timer, pausa, conclusão, cancelamento, sessão manual e histórico na mesma seção. É funcional, mas denso e sem uma hierarquia que destaque a ação vigente.
- O indicador de sessão usa tokens de fallback (`--surface`, `--border`) que não pertencem ao sistema semântico principal, produzindo desvio visual.

### Arquivo

- Busca e filtros são completos e as notas/citações usam estrutura semântica e links de retorno.
- Cinco controles aparecem antes do conteúdo e repetem o padrão pesado da Coleção.
- Notas e citações ficam em colunas no desktop e em artigos com borda lateral no mobile; o padrão é legível, mas ações de editar/excluir/compartilhar adicionam densidade a cada item.

### Estatísticas

- Os dados são textuais e não dependem de gráfico ou cor, o que deve ser preservado.
- Filtros aparecem antes da história principal e 14 cartões/superfícies transformam o conjunto num dashboard genérico.
- Métricas têm o mesmo peso e não formam uma frase significativa sobre ritmo. A página chega a 3.744 px em 360×800.
- O CSS usa `var(--surface, #231f2b)` e `var(--border, #51495e)`, criando superfícies roxas fora dos tokens verdes/dourados vigentes.

### Ajustes, áudio, experiência, backup e restauração

- Controles nativos, labels, radios, sliders e checkboxes são uma base sólida.
- Experiência, áudio, informação local, exportação e importação ficam todas abertas na mesma página, produzindo 2.765 px em 320×640.
- Backup e restauração são processos de risco diferente, mas ficam no fim de uma página geral. A restauração e suas confirmações exigem muita rolagem antes de a pessoa compreender o estado corrente.
- As três decisões da restauração preenchida estão corretas: criar backup, continuar sem backup e cancelar. Elas devem permanecer num fluxo dedicado, com revisão e confirmação modal apenas após o arquivo ser validado.

### Diálogos, confirmações, toasts e estados

- Drawer é modal de verdade; bottom sheets são diálogos não modais; confirmações de exclusão são inline; alguns fluxos ainda usam `window.confirm`/`window.prompt`. A mistura produz comportamento de foco e aparência diferentes para decisões equivalentes.
- Toasts textuais e regiões `aria-live` já existem, mas o posicionamento concorre com controles da Biblioteca e Construção.
- Estados vazios distinguem “sem dados” de “sem resultado”, um comportamento correto a preservar.
- Estados de indisponibilidade informam que dados continuam acessíveis, mas não compartilham um componente visual único.

### Acessibilidade e robustez visual

Pontos positivos existentes:

- landmarks, skip link, links/botões nativos, `aria-current`, labels e erros associados;
- alvo mínimo global de 44 px;
- alto contraste, três tamanhos de texto e redução de movimento;
- alternativa React para o canvas;
- foco após mudança de rota, erro e fechamento de vários contextos.

Problemas/riscos encontrados:

- Android Back não respeita a pilha de UI da rota Biblioteca;
- ações críticas ficam fora da viewport, especialmente sessão, salvar formulário e ações de peça;
- múltiplos scroll owners na Construção dificultam toque, teclado e leitor de tela;
- alguns tokens CSS estão indefinidos (`--space-8`, `--shadow-medium`, `--color-text`, além dos fallbacks `--surface`/`--border`), enfraquecendo consistência;
- texto maior piora a oclusão do painel de Construção, ainda que as capturas não mostrem overflow horizontal;
- safe areas são tratadas em muitos pontos, mas a soma de overlays independentes não tem uma autoridade única;
- a automação não valida contraste percebido, zoom real, teclado virtual, TalkBack nem gesto Android.

## Direção recomendada

### 1. Arquitetura de navegação

| Alternativa                                     | Descoberta                           | Uma mão                           | Canvas                                                                | Desktop                                               | Avaliação                                       |
| ----------------------------------------------- | ------------------------------------ | --------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Drawer atual                                    | baixa: destinos escondidos           | baixa: acionador no topo esquerdo | excelente quando fechado, interrompe quando aberto                    | consistente, mas sempre oculto                        | preservar apenas como histórico; não recomendar |
| Barra inferior pura                             | alta: cinco destinos sempre visíveis | alta                              | consome cerca de 68 px                                                | pode parecer uma barra mobile ampliada                | boa, mas precisa de contexto de página          |
| **Híbrida: barra inferior + header contextual** | **alta**                             | **alta**                          | **canvas passa por trás da barra; controles respeitam a zona segura** | **mesmo dock, centralizado; sem segunda arquitetura** | **recomendada**                                 |

Recomendação:

- uma barra inferior persistente para as cinco áreas: **Biblioteca, Coleção, Arquivo, Resumo (tela Estatísticas) e Ajustes**;
- ícone simples sempre acompanhado de nome visível e nome acessível completo;
- header contextual reduzido com título, Voltar e no máximo uma ação textual;
- `Novo registro` deixa de ser destino primário e vira ação contextual estendida apenas na Coleção e nos estados vazios;
- no desktop, a mesma barra vira um dock central com largura limitada; não aparece sidebar/rail diferente;
- ao entrar na Construção, a navegação global é substituída temporariamente pela barra da tarefa e por `Sair`, pois Construção é um modo explícito;
- não há drawer primário na direção recomendada.

O custo de altura da barra é previsível e inferior ao custo cognitivo do drawer. Conteúdo convencional reserva espaço; o canvas se estende atrás do dock, mantendo atmosfera sem colocar controles interativos sob ele.

### 2. Sistema visual

#### Tipografia

| Papel            |                Escala recomendada | Uso                               |
| ---------------- | --------------------------------: | --------------------------------- |
| Título de página | 28–40 px fluido, serif de sistema | identidade, no máximo um por tela |
| Título de seção  |                      20 px / 1,25 | separação principal               |
| Corpo            |                      16 px / 1,55 | leitura e formulários             |
| Rótulo/ação      |          14–16 px / 1,3, peso 700 | controles                         |
| Metadado         |                       13 px / 1,4 | data, tipo, contagem              |
| Navegação        |         mínimo 10,5–11 px + ícone | cinco destinos em 320 px          |

A serif de sistema entra somente em títulos e nomes de registros para recuperar calor editorial sem nova fonte/dependência. Corpo, labels e controles mantêm sans de sistema.

#### Espaçamento, raios, bordas e elevação

- escala única: **4, 8, 12, 16, 24, 32 e 48 px**;
- alvo interativo mínimo: **48 px** na proposta mobile;
- raio de controle 10 px, grupo 14 px e sheet/dialog 20 px;
- superfície base sem borda; divisores de 1 px entre seções; borda forte só para foco, seleção e confirmação;
- elevação 0 para conteúdo, 1 para barra sticky/FAB, 2 para sheet/dialog; sem sombra em todo cartão;
- sem glassmorphism pesado: scrim e superfícies opacas; blur não é requisito.

#### Cores e superfícies semânticas

- consolidar os tokens existentes em `bg-deep`, `bg`, `surface`, `surface-raised`, `text`, `text-muted`, `border`, `focus`, `accent-gold`, `selection-green`, `error`, `success` e `warning`;
- preservar o verde profundo e o dourado atual; dourado sinaliza ação/ênfase, não cobre toda superfície;
- alto contraste sobrescreve os mesmos papéis, sem tema paralelo;
- remover fallbacks roxos e variáveis indefinidas antes de migrar componentes;
- não depender de cor: seleção combina fundo, borda, indicador e texto; erro combina borda, mensagem e resumo; indisponibilidade usa título, causa pública e próxima ação.

#### Controles

- botão primário: dourado sólido, texto escuro, um por região;
- secundário: transparente com borda forte;
- destrutivo: outline no início; preenchido somente na confirmação final;
- campos: uma superfície escura, label acima, ajuda curta após label e erro diretamente associado;
- filtros frequentes: chips roláveis; conjunto completo em bottom sheet;
- cards: somente registros, escolhas de tipo, resumo narrativo e entidades autônomas; configurações e detalhes usam linhas/seções planas;
- ícones universais ainda recebem nome em navegação e ações ambíguas; fechar/voltar podem ser ícone com nome acessível;
- foco: outline de 3 px dourado claro, offset de 3 px, nunca removido por sombra;
- seleção: superfície verde + borda/handle dourado + anúncio textual;
- indisponível: controle não interativo com opacidade moderada e motivo visível perto, sem parecer carregando.

#### Transições

- 120 ms para feedback de pressão/seleção;
- 180 ms para sheet e barra contextual;
- 220 ms para mudança de contexto de página;
- nenhuma animação cosmética contínua, bounce ou parallax;
- com movimento reduzido: troca imediata, sem deslocamento; estados preservam contraste, texto e foco.

### 3. Padrões de interação

| Padrão                     | Quando usar                                                                 | Quando não usar                                            |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Página dedicada            | formulário longo, detalhe, Estatísticas, Ajustes e backup/restauração       | escolha rápida sobre o mapa                                |
| Bottom sheet               | filtros completos, resumo da Biblioteca, palette, nota/citação curta, áudio | formulário longo, confirmação destrutiva, lista permanente |
| Drawer                     | não é navegação primária na direção recomendada                             | cinco áreas principais                                     |
| Diálogo                    | confirmação destrutiva ou decisão que bloqueia commit                       | informação, filtro, edição comum                           |
| Painel contextual          | desktop com largura; no mobile vira sheet/barra inferior                    | ocupar lateral permanente do mapa em 320 px                |
| Barra de ações fixa/sticky | salvar/cancelar formulário, sessão ativa, peça selecionada/movendo          | ações secundárias de leitura                               |
| FAB estendida              | somente `Novo registro` na Coleção, com texto visível                       | global, Biblioteca ou Construção                           |
| Disclosure                 | metadados, organização, histórico e detalhes opcionais                      | ação primária ou erro                                      |

A barra de formulário deve ficar acima de safe area e teclado. Na implementação, a posição deve responder ao `visualViewport`, conservar `scroll-padding-bottom` e permitir que o campo focado seja rolado para a área visível.

### 4. Máquina de estados do modo Construção

Estados exclusivos recomendados:

| Estado      | Conteúdo visível                              | Ação que substitui o estado                   | Escape / Android Back |
| ----------- | --------------------------------------------- | --------------------------------------------- | --------------------- |
| `explore`   | mapa + Estruturas, Piso, Colocadas            | abrir palette, piso ou lista                  | sair da Construção    |
| `palette`   | mapa escurecido + sheet até 56%               | escolher peça → `placing`                     | `explore`             |
| `placing`   | mapa + preview + Cancelar/Girar/Colocar       | confirmar → `explore`; cancelar → `palette`   | `palette`             |
| `selecting` | mapa + highlight + Mover/Girar/Guardar/Fechar | ação escolhida substitui barra                | `explore`             |
| `moving`    | mapa + preview + Cancelar/Confirmar           | confirmar → `explore`; cancelar → `selecting` | `selecting`           |
| `floor`     | mapa + grade + Adicionar/Remover/Concluir     | concluir → `explore`                          | `explore`             |
| `confirm`   | diálogo único de Guardar                      | confirmar → `explore`; cancelar → `selecting` | `selecting`           |

Regras invariantes:

- só um desses estados existe por vez; iniciar uma ação destrói/substitui a anterior;
- “Peças colocadas” é sheet sob demanda; escolher uma linha fecha o sheet, centraliza e entra em `selecting`;
- palette fecha assim que uma peça é escolhida; o mapa volta a receber o gesto de posicionamento;
- seleção e movimento usam uma barra de ações única junto ao polegar;
- nenhuma folha permanece aberta durante placing, moving ou floor;
- resumo comum da Biblioteca, exploração de salas e interação de móveis ficam indisponíveis/ocultos durante Construção;
- Escape e Android Back consultam a mesma função pura de redução de estado, na ordem da tabela;
- saída do modo ocorre somente em `explore`; se houver preview local não confirmado, ele é descartado antes;
- o protótipo propõe confirmação explícita de movimento/colocação. Ao implementar, isso deve ser conciliado com as intenções existentes sem mudar persistência ou regra de negócio por acidente.

### 5. Fluxos completos propostos

1. **Navegar entre áreas:** tocar uma das cinco opções do dock; a área ativa mantém indicador dourado, fundo verde e `aria-current`; a tela recebe foco no heading.
2. **Encontrar e abrir:** Coleção abre com busca e três chips rápidos; filtros completos ficam em sheet; tocar qualquer ponto da linha abre o detalhe.
3. **Cadastrar ou editar:** CTA estendida abre seletor dos seis tipos; após escolher, a página mostra Essencial primeiro e detalhes opcionais em disclosure; Cancelar/Salvar ficam sticky acima da navegação/teclado.
4. **Sessão:** no detalhe, `Iniciar sessão` é a primeira ação; a página de sessão mostra timer, anotação, Pausar e Concluir; indicador compacto permanece disponível enquanto a sessão estiver ativa.
5. **Notas/citações:** atalhos no detalhe abrem sheet curto; o histórico recente aparece no detalhe e o acervo completo no Arquivo.
6. **Estatísticas:** período e filtros principais ficam em chips; a primeira superfície conta uma história de ritmo; métricas secundárias e timeline vêm depois, sem grade de cartões equivalente.
7. **Preferências:** Ajustes é uma lista de categorias; Experiência e Áudio abrem sheets curtos; as escolhas persistentes continuam com controles nativos.
8. **Backup/restauração:** Ajustes → página dedicada; Exportar e Restaurar são seções separadas; arquivo é validado antes do diálogo com as três decisões atuais.
9. **Construção:** Biblioteca → Construir → `explore`; escolher ferramenta substitui o estado; sair retorna à Biblioteca sem deixar painel residual.

## Mapa de impacto para uma futura implementação

| Área              | Componentes/arquivos que provavelmente mudariam                                                                                  | Responsabilidade                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Shell e navegação | `src/App.tsx`, `src/routes.ts`, `src/styles.css`, `src/App.test.tsx`                                                             | dock de cinco áreas, header contextual, foco e safe areas              |
| Android Back      | `src/useAndroidBackButton.ts`, contrato de estado no shell/Biblioteca e testes                                                   | mesma redução de estado usada por Escape                               |
| Biblioteca        | `src/pages.tsx`, `LibraryBottomSheet.tsx`, `LibrarySpeechBubble.tsx`, `LibraryTextAlternative.tsx`, `LibraryVisualHost.test.tsx` | ordenar overlays sem alterar o canvas                                  |
| Construção        | `ConstructionControls.tsx`, contratos do host em `pages.tsx` e testes de interação                                               | máquina exclusiva, barra contextual, sheets sob demanda                |
| Coleção           | `CollectionPage.tsx`, `collectionControls.ts`, testes                                                                            | busca/chips visíveis, filtros completos em sheet, CTA estendida        |
| Cadastro/edição   | `NewEntryPage.tsx`, `EntryEditorPages.tsx`, `BookForm.tsx`, conversões/testes                                                    | essencial primeiro, disclosures e ações sticky                         |
| Detalhe/progresso | `EntryDetailPage.tsx`, `BookDetailPage.tsx`, `ProgressForm.tsx`, `StatusActions.tsx`                                             | hierarquia e ações frequentes próximas                                 |
| Sessões           | `ActiveSessionIndicator.tsx`, `SessionPanel.tsx`, testes                                                                         | contexto ativo único e controles alcançáveis                           |
| Notas/citações    | `AnnotationForms.tsx`, `AnnotationActions.tsx`, detalhe/Arquivo                                                                  | sheet de criação e ações consistentes                                  |
| Arquivo           | `ArchivePage.tsx` e testes                                                                                                       | chips + filtros em sheet; lista mais plana                             |
| Estatísticas      | `StatisticsPage.tsx` e testes                                                                                                    | narrativa principal, menos cartões, filtros progressivos               |
| Ajustes/backup    | `SettingsPage.tsx` e testes                                                                                                      | índice de categorias e subpágina dedicada                              |
| Estados globais   | `AppErrorBoundary.tsx`, componentes de loading/empty/error/toast                                                                 | padrões visuais e de foco unificados                                   |
| Regressão         | testes React, `e2e/`, documentação de UX/acessibilidade/teste                                                                    | 320×640, 360×800, desktop, texto, contraste, movimento, teclado e Back |

Phaser, geometria, câmera e assets não precisam ser redesenhados para executar esta direção. A interface futura deve continuar enviando apenas estados e interações tipadas ao host existente.

## Ordem recomendada de implementação dentro da R4

1. **R4-1 — contratos e baseline visual:** congelar capturas, consolidar tokens, introduzir primitivas de header, dock, sheet, diálogo, toast e barra sticky; nenhuma tela migra parcialmente sem teste.
2. **R4-2 — shell e navegação:** cinco áreas, foco, deep links, desktop com o mesmo dock e integração de safe area; manter drawer atrás de flag somente durante a migração e removê-lo no final do slice.
3. **R4-3 — fluxos frequentes convencionais:** Coleção, seletor dos seis tipos, cadastro/edição, detalhe, progresso e sessões.
4. **R4-4 — memória e preferências:** notas/citações, Arquivo, Estatísticas, Ajustes, áudio, backup/restauração e estados globais.
5. **R4-5 — Biblioteca visual:** harmonizar header, dock, resumo, balões, unlock, fallback e alternativa React sem tocar Phaser.
6. **R4-6 — Construção:** reducer/máquina de estados exclusiva, palette, piso, seleção, movimento, lista sob demanda e confirmação; Escape/Android Back compartilhados.
7. **R4-7 — endurecimento:** teclado, foco, texto maior, alto contraste, movimento reduzido, visualViewport/teclado, matriz 320×640/360×800/desktop, E2E e depois gate humano no Moto G06/TalkBack.

Essa ordem reduz o risco de duplicar shell e componentes enquanto mantém cada slice revisável. A Construção vem depois das primitivas, mas antes do gate final, porque concentra o maior risco de sobreposição e Back.

## Riscos e mitigação da migração

| Risco                                           | Impacto | Mitigação                                                                                  |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| Regressão de foco ao trocar drawer por dock     | alto    | manter links/botões nativos, `aria-current`, foco no heading e E2E de Tab/Back             |
| Dock cobrir conteúdo ou canvas                  | alto    | espaço reservado nas páginas, padding seguro no canvas e teste de todos os overlays        |
| Teclado virtual cobrir salvar/concluir          | alto    | visualViewport + barra sticky + scroll-padding; teste Android humano                       |
| Misturar estados da Construção durante migração | alto    | reducer discriminado e tabela de transição testada antes de trocar UI                      |
| Alterar sem querer o timing de commit Phaser    | alto    | adapter entre novo estado de UI e intenções existentes; regressão de persistência/rollback |
| Back fechar o nível errado ou sair do app       | alto    | uma autoridade de unwind compartilhada por Escape e callback Capacitor                     |
| Texto maior quebrar dock/chips                  | médio   | rótulos curtos, wrap controlado, teste 320 px nos três tamanhos                            |
| Mais semântica visual virar mais DOM/overdraw   | médio   | poucas superfícies, sem blur obrigatório, animações curtas e relatório de performance      |
| Estatísticas perderem dados por simplificação   | médio   | divulgação progressiva; nenhum dado ou filtro removido                                     |
| Confirmações de backup ficarem cosméticas       | alto    | preservar inspeção, proteção e transação atuais; mudar somente apresentação                |

## Arquivos

### Criados

- `art-guides/w3-a-r4-ux-proposal/index.html`;
- `art-guides/w3-a-r4-ux-proposal/styles.css`;
- `art-guides/w3-a-r4-ux-proposal/app.js`;
- `art-guides/w3-a-r4-ux-proposal/README.md`;
- `art-guides/w3-a-r4-ux-proposal/AUDIT_AND_PROPOSAL.md`;
- `art-guides/w3-a-r4-ux-proposal/CAPTURE_INDEX.md`;
- `art-guides/w3-a-r4-ux-proposal/capture-current.mjs`;
- `art-guides/w3-a-r4-ux-proposal/capture-proposal.mjs`;
- `art-guides/w3-a-r4-ux-proposal/captures/current/*.png` e `audit-metrics.json`;
- `art-guides/w3-a-r4-ux-proposal/captures/proposal/*.png` e `audit-metrics.json`.

### Modificados

- nenhum arquivo de produção ou documentação oficial;
- os arquivos do worktree recebidos permaneceram intocados.

## Decisões

- direção única: dock inferior de cinco áreas + header contextual;
- “Novo registro” é ação contextual, não sexta área;
- drawer primário é descartado após migração;
- serif de sistema somente para identidade editorial, sem dependência;
- cards reservados a entidades/decisões, com seções planas no restante;
- Construção usa sete estados exclusivos e Back/Escape compartilhados;
- FAB estendida é permitida somente na Coleção;
- nenhum redesign de Phaser/assets faz parte da direção.

## Dependências

- adicionadas: nenhuma;
- removidas: nenhuma;
- o protótipo usa HTML, CSS e JavaScript simples e reutiliza apenas texturas já existentes por referência relativa.

## Validação automática

| Comando                         | Resultado                                                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --check .../app.js`       | passou                                                                                                                                                     |
| captura atual em Chromium       | 25 capturas, com 24 estados/tamanhos metrificados; sem erro de console/request                                                                             |
| captura da proposta em Chromium | 25 estados/tamanhos e 9 checks de navegação; alvos visíveis ≥48 px; zero overflow horizontal, erro de console, page error, request failure ou ID duplicado |
| formatação restrita ao artefato | passou                                                                                                                                                     |
| `npm run lint`                  | passou                                                                                                                                                     |
| `npm run typecheck`             | passou                                                                                                                                                     |
| `npm run test:run`              | 978/978 passaram na repetição isolada; a primeira tentativa concorrente teve timeout em 1 teste de 20 ciclos                                               |
| `npm run build`                 | passou; warning preexistente de chunks acima de 500 kB                                                                                                     |
| E2E convencional sem o spec B2  | 11/12 passaram; `p1-memory` falha no `locator.check()` durante substituição do checkbox, embora o snapshot final o mostre marcado                          |
| `npm run test:e2e` completo     | não iniciou cenários: Node 22/24 exige atributo no import JSON estrutural preexistente usado pelo spec B2                                                  |
| `git diff --check`              | passou na verificação final                                                                                                                                |
| `git status --short`            | baseline suja preservada; novo artefato permanece sob `art-guides/` não rastreado                                                                          |

## Testes manuais pendentes

- revisão visual e escolha explícita de Sam;
- TalkBack no Moto G06;
- teclado virtual e barras/safe areas reais;
- alcance físico com uma mão em 320×640 e 360×800;
- texto padrão/grande/maior e alto contraste percebido em todas as rotas;
- redução de movimento no navegador/aparelho;
- ordem de Android Back após implementação real;
- áudio/mute e desempenho físico;
- comparação artística do canvas real com os novos overlays.

## Riscos e limitações

- o mapa do protótipo é CSS estático; ele avalia hierarquia e oclusão, não renderer;
- a proposta simula dados e commits; não toca IndexedDB/backup;
- a barra sticky sobre teclado é uma especificação; não é prova de comportamento nativo nesta entrega;
- a captura headless não substitui percepção humana;
- a baseline E2E recebida tem duas incompatibilidades de harness fora do escopo: import JSON no spec B2 sob os runtimes disponíveis e `check()` sobre um checkbox controlado substituído ao atualizar a URL; nenhum arquivo de produção/teste foi alterado para mascará-las;
- o worktree inicial já era extenso e não limpo; este artefato está dentro de um `art-guides/` que já aparecia como não rastreado no status inicial.

## Documentação atualizada

- somente a documentação isolada desta proposta;
- `STATUS`, `ROADMAP`, `TEST_PLAN` e decisões oficiais não foram alterados para não registrar o redesign como aprovado ou implementado.

## Estado Git

Estado inicial registrado em 2026-09-05:

- branch `main`, 31 commits à frente de `origin/main`;
- 33 arquivos rastreados modificados e diversos arquivos/diretórios não rastreados da correção anterior;
- `art-guides/` já aparecia como diretório não rastreado;
- nenhum estado preexistente foi limpo, revertido, formatado ou sobrescrito.

Nenhum commit, tag, push, rebase, reset, mudança de versão ou assinatura foi realizado nesta execução.

## Recomendação de gate

- **aprovar para revisão visual**, não para implementação automática;
- Sam deve revisar o protótipo e as comparações;
- após autorização explícita, iniciar R4-1 pela ordem recomendada;
- encerrar esta execução na proposta, conforme solicitado.
