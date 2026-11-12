# BF-5.7A — Botões de cristal: primeira candidata

**Escopo:** alteração visual e tátil global de controles na PR draft da BF-5.7A. Não inclui reescrita de navegação, engine, banco, backup ou UX de tela inteira.

## Intenção artística
- Pequenos botões analógicos talhados em cristal: facetas diagonais discretas, estrias estáticas, bordas iluminadas, base escura e sombra de contato.
- Preservar o vocabulário do Códice Iluminado: rosa ameixa (primário), violeta escuro (secundário), rubi (perigo), ametista (Arcanário), lápis-lazúli e ouro (arena), quartzo claro em controles dos fólios; medallhões do dock como cristais encaixados.
- Não redesenhar cards de registros, imagens das cartas, campos de texto ou o próprio palco 3D como pequenos botões. Eles conservam seu material e resposta próprios.

## Contrato de interação
- Pointerdown continua fazendo o reconhecimento imediato existente da BV-UXC. Depois do clique, um eco de pressão dura 190 ms para não desaparecer entre pointerup e a próxima pintura.
- Para Links internos e dock que acionam a cortina R6, iniciar a cobertura **120 ms depois** de confirmar um clique por ponteiro; apenas então usar o fluxo de saída opaca, trabalho adiado, prontidão e revelação já aprovado. Nenhuma ação de rota ocorre atrás de uma cobertura ainda transparente.
- Ativação por teclado/assistiva, aba oculta e movimento reduzido **não** têm esse atraso adicional; preservam acesso direto e o contrato de redução de movimento.
- Segunda intenção cancela a etapa anterior quando ainda está aguardando; navegação externa cancela a etapa pendente. Não adiar ações normais dos formulários nem interceptar botões com lógica própria.
- Nada de JavaScript por frame, partículas, SVG dinâmico, filtros ou imagens novas.

## Áreas cobertas
- Ações tradicionais e links com classe de botão, controles de formulários, botões de texto e categoria, seletores e calendário inclusive em dialog nativo portalled, navegação e áreas do Arcanário, arena e controles de exploração/quests, teclas circulares do dock.
- Cards inteiros (livros, cartas TCG, mão/campo da arena e seletor de tipos) conservam materiais, cores e posicionamento; cartas jogáveis reagem com escala independente do transform dos slots, e o selo do seletor de tipos deprime em separado.

## Código e rastreio
- styles-crystal.css: camada terminal de materiais e pressão.
- app/crystalPress.ts: eco visual e agendamento cancelável de navegação por toque.
- App.tsx / PrimaryDock.tsx: integração sem alterar o ciclo de vida da cortina.
- Testes dirigidos de eco, prelude, cancelamento, teclado e redução de movimento.

## Validação e gate pendente
**Ainda sem evidência de teste local, CI, E2E, APK ou gate físico nesta operação remota.** Não classificar como PASS o que não rodou. Ações do GitHub foram edição estática e revisão de diff.

Rodada sugerida no Moto G06 (retrato e paisagem): (1) Coleção/Arquivo/Resumo/Ajustes via dock e botão Buscar/Novo registro; (2) botão primário, secundário, perigo, desabilitado e alternância de filtros; (3) Folio Estudos e Entretenimento, Notas/Citações, temporizador e salvar; (4) seletores/modal/calendário e Back; (5) Arcanário Portal/Acervo/Oficina/Provações e duelo em tela única; (6) quests, navegação rápida, toque duplo, scroll em cards; (7) movimento reduzido e alto contraste. Comparar sensação de pressione → cortina sem piscadas e observar custo de pintura no dispositivo.

**Integração à main bloqueada** até revisão e autorização explícita do proprietário, com reparos de regressões se houver.

## R1 — Pressão rápida e continuidade da navegação (11/11/2026)

**Feedback no Moto G06:** aparência de cristal aprovada preliminarmente para continuar refinando, mas os controles de incremento/decremento de páginas permaneciam pressionados tempo demais; engasgos também foram percebidos em trocas de tela.

**Alterações na mesma PR draft:**
- Eco pós-clique dos comandos comuns reduzido de 190 ms para **76 ms**. Botões .folio-step e elementos data-crystal-repeat ficam sem esse eco e seguem somente o contato real do dedo.
- +/− do fólio de leitura usam retorno de **48 ms** e facetas claras estáticas; nenhuma espera foi adicionada ao incremento ou decremento.
- O acabamento mantém sombras estáticas, mas apenas transform/scale anima no toque; evita interpolação de sombras e bordas, que provocaria trabalho de pintura.
- A espera fixa de **120 ms** antes da cortina foi substituída por dois requestAnimationFrame (uma oportunidade de pintura do botão antes da cortina), com fallback cancelável de **72 ms** caso o WebView reduza a frequência de quadros. Contrato R6.1 de cobertura opaca e prontidão preservado.
- O dock mantém estado pending sem setState em cada toque, reduzindo reconciliação React.
- Testes dirigidos adicionados/atualizados; **não executados** nesta operação remota.

**Limite:** sem perfil físico de CPU/RAF/paint ainda não é possível afirmar a causa integral dos engasgos. Nova instalação APK e gate retrato/paisagem no Moto G06 necessários. Não marcar CI, E2E, build, acessibilidade ou performance como PASS por inspeção estática.

## R2 — Um único gesto tátil, sem dois ciclos visuais (11/11/2026)

**Feedback do usuário após R1 no Moto G06:** os engasgos anteriores e os controles de páginas foram resolvidos no teste físico inicial, mas alguns botões pareciam afundar duas vezes ou congelar a meio caminho, sobretudo ao abrir cards ou trocar de rota.

**Diagnóstico estático confirmado no código:**
- `App.tsx` removia `data-tap-active` em `pointerup` e reaplicava `data-crystal-pressed` somente no `click`. A possível descontinuidade entre os eventos reativava a transição CSS.
- As folhas de estilo antigas ainda aplicavam `filter: brightness` e fundos distintos enquanto `:active`/estado de toque estavam ativos, ao passo que o cristal implementava outra transformação.
- `canvas-hud.css` aplicava um brilho e fundo novos ao medalhão quando `data-pending=true`, criando outra mudança de aparência logo depois do toque.

**Correção candidata R2:**
- Handoff contínuo: ao levantar o dedo sobre o mesmo controle, o eco cristalino é criado **antes** de remover `data-tap-active`. No `click`, se o eco já existe, não é reiniciado. Cliques por teclado permanecem reconhecidos. Scroll (movimento acima do limiar), cancelamento e cards ilustrados mantêm suas regras anteriores.
- Botões repetitivos `.folio-step` continuam sem eco pós-clique.
- O tema cristalino reutiliza a mesma superfície, sombra e ausência de filtro durante o estado pressionado, sem executar novas mudanças de brilho/fundo.
- O dock conserva sua tecla cristalina sem os estilos concorrentes de `pending`/`:active` da folha antiga; `data-pending` continua como informação funcional para os fluxos e testes.
- Testes atualizados para garantir um único gesto pointerdown→pointerup→click, sem prolongamento indevido do cronômetro; caso de scroll cancelado também coberto.

**Estado:** implementação remota e inspeção estática, **sem compilação nem testes automatizados executados nesta operação**. O desaparecimento das pausas em WebView Android com abertura de cards ou mudanças de rota ainda exige confirmação real. Manter a PR draft, sem merge.

## R2.1 — Diagnóstico dos testes R6 e separação de contratos (11/11/2026)

**Evidência local trazida pelo proprietário:** TypeScript PASS; 28/29 testes PASS; falha recorrente apenas no teste integrado R6. Após corrigir o disparo do término da cortina, a falha mudou para o teste exigir `data-route=colecao` imediatamente após **dois RAFs**. O estado da cortina já havia chegado a `waiting`.

**Análise de código:** o caminho do dock é `PrimaryDock` → `schedulePressedPassage` → `beginPassage` / `schedulePassage` → `completePassageDeparture` → `navigate()`. O teste anterior contava dois quadros do agendador, mas não aguardava o commit de rota assíncrono do React Router/Suspense/lazy importação de `CollectionPage`. Isso pode deixar `data-route` temporariamente na rota antiga mesmo depois da chamada de navegação. O relatório isolado ainda não prova um erro no produto; também não autoriza afirmar que o produto está isento de problemas.

**Mudanças na PR draft:**
- `App.test.tsx`: depois do fechamento opaco, drenar até 12 quadros programados, respeitando o agendamento de navegação, e aguardar a rota real com `waitFor` (limite 4 s). Continuar falhando se a rota nunca chegar.
- `PrimaryDock.test.tsx`: acrescentado teste de navegação real num `MemoryRouter` sem a importação lazy do app. Confirma que o dock só navega após a cortina e chega à rota exata, isolando mecanismo de navegação de carregamento assíncrono de páginas.
- `interactionContinuity.test.ts` permanece responsável por testar o contrato da cobertura opaca, cancelamento e espera por prontidão.
- **Nenhuma alteração na produção**, em transições, componentes React da aplicação ou no motor de navegação, pois o relatório ainda não demonstrou defeito funcional nesses contratos.

**Pendente:** executar os **30 testes dirigidos esperados**, `typecheck`, e, se PASS, build/APK e gate físico. O presente registro documenta uma hipótese técnica com testes discriminantes, não uma certificação. CI continua sem cota; não declarar PASS não executado.

## C1–C3 — Primeira rodada de refinamentos da Coleção (11/11/2026)

**Origem:** screenshot e três pedidos expressos após aprovação física do R2 dos controles. O proprietário deseja acumular pequenas alterações antes do próximo build/gate.

- **C1:** somente a rota `/colecao` recebe `padding-top: calc(env(safe-area-inset-top, 0px) + 1.65rem)` no contêiner que contém o frontispício. Evita o banner excessivamente próximo à status bar Android; não desloca HUD/dock de outras rotas. Ajuste alvo inferior a aproximadamente 0,5 cm na tela física, sujeito a conferência.
- **C2:** acesso ao Arcanário transformado de texto sublinhado em pequena tecla cristalina de ametista com sigilo circular ornamental, mantendo `href=/arcanario` e área compacta, sem competir com os CTAs Busca e Novo registro. Reutilização do mesmo componente para estado vazio e Coleção povoada.
- **C3:** removidas as duas linhas redundantes visíveis `Seus registros` e `Coleção` acima das ações. O `RealmIntro` continua como `h1`; o agrupamento de registros permanece com nome acessível `aria-label="Coleção"`, sem segunda heading visual. Demais rotas/áreas não alteradas.
- Testes dirigidos novos: título único da página, CTA com destino correto, Busca/Novo registro preservados e botão presente no estado vazio.

**Aprovação física anterior:** o proprietário confirmou que os problemas do R2 foram corrigidos em sua avaliação do Moto G06. **C1–C3 ainda não foram compilados, executados em Vitest nem verificados no APK.** PR draft, sem merge; continuar acumulando ajustes.

## L1–L9 — Refinamento do fólio de leitura (11/11/2026)

**Fonte:** quatro capturas do Moto G06 e nove alterações solicitadas pelo proprietário, para serem acumuladas antes do próximo gate.

1. **L1 — Identidade:** removido somente o kicker `Códice pessoal · Livro` do cabeçalho do livro.
2. **L2 — Título/autor:** ampliados título serifado e corpo/peso/contraste da autoria, preservando wrapping de títulos extensos.
3. **L3 — Selo de progresso:** a porcentagem ganha fundo de pergaminho quase opaco, anéis/contorno e afastamento sutil da borda para não sumir na filigrana superior direita. O fundo ornamental do fólio não é deslocado globalmente.
4. **L4 — Avaliação:** a legenda, as cinco estrelas e o resultado ficam juntos em um painel discreto com contorno de manuscrito; os alvos continuam acessíveis. O painel foi movido para a faixa inteira do cabeçalho em vez de disputar a coluna estreita do título e do selo.
5. **L5 — Estado:** `folio-status` recebe um lacre ornamental arredondado com sigilo, label e chevron. Mantidos `details/summary` nativos, transições e comandos existentes.
6. **L6 — Marcador:** removida a instrução redundante `Use um número inteiro a partir de zero... até N`; `min=0`, `max=N` e mensagens dinâmicas de erro continuam presentes e acessíveis.
7. **L7 — Leitura:** dentro do mesmo `form`, o botão `Iniciar sessão` passa para antes de `Páginas e nota (opcionais)`; histórico permanece abaixo. Sem alterar submissão/tempos/persistência.
8. **L8 — Notas/citações:** removidos `Use texto simples.` dos dois formulários e `O livro tem N páginas.` do formulário de nota. Conservadas regras de validação, erros dinâmicos e campos opcionais; menor gap vertical restrito à composição de anotação.
9. **L9 — Ações:** `Capa da obra`, `Mais informações` e `Organização e favoritos` ganham tinta escura sobre papel claro; o alto contraste permanece legível no tema escuro.

**Testes escritos:** apresentação do cabeçalho, acessibilidade do selo e das ações, ausência de textos redundantes, página mínima/máxima e ordenação de início de leitura/entradas opcionais/histórico. **Não houve execução de typecheck, Vitest, lint, build ou APK durante esta edição remota.** Próximo gate será conjunto com C1–C3 e outras micro-rodadas que o proprietário solicitar. PR draft #51, sem merge.

## S1/E1/W1/P1 — Hierarquia de títulos e organização (11/11/2026)

**Origem:** quatro capturas do Moto G06 e quatro demandas do proprietário, acumuladas depois da rodada C1–C3 e L1–L9 da mesma PR draft #51.

1. **Estudos:** removida a frase redundante `Seu percurso de conhecimento` do cabeçalho. Título e subtema (área/disciplina), tipografia, contraste e ritmo vertical são fortalecidos, com redução do vazio que a frase ocupava. Status e link Editar estudo seguem utilizáveis.
2. **Acenda seu foco:** removidas somente as três linhas explicativas sobre poder sair do aplicativo e o tempo ser recuperado. Mantidos o seletor de duração, o relógio, o foco persistente e os controles de sessão. Espaço vertical da introdução diminuído.
3. **Entretenimento:** `PersistedRating` movido para um painel de pergaminho distinto, com a mesma linguagem do fólio de livros, cinco alvos de estrela acessíveis e espaço livre do pôster em celular. O título/metadata da obra ganham hierarquia tipográfica maior; classificação de formato e estado continuam disponíveis.
4. **Trabalho:** `Criar a primeira tarefa` deixa de flutuar na área de progresso, que passa a explicar o estado vazio; `＋ Nova tarefa` e `＋ Etapa` se unem em uma barra de ações próxima ao título Etapas e tarefas. `Próxima ação` e `Diário da empreitada` usam o mesmo alinhamento de ações, com layout vertical no mobile e alinhamento lateral em telas largas. `＋ Tarefa nesta etapa` permanece dentro de sua etapa, sem mudar os comandos/mutações.
5. **Coerência em todas as categorias:** o fólio de trabalho evita o kicker genérico `Empreitadas · Trabalho` e mostra apenas tipo de trabalho/área quando informados, sob um título maior; o fólio de atividade física também apresenta primeiro o título, depois tipo/estado e período. Não foram removidos dados úteis nem mudou o modelo persistido.

**Testes acrescentados:** `StudyPomodoro.test.tsx` para ausência do texto e permanência do seletor/start; reforço do E2E de empreitadas para os dois botões agrupados, a ausência de duplicação e o progresso vazio. Validação estática de JSX/CSS e seletor de layout; **não houve execução de TypeScript, Vitest, E2E, build ou APK nesta operação remota**. Gate conjunto pendente por solicitação do proprietário.

**Regressões a verificar no Moto G06:** retrato/paisagem, títulos compridos com pôster, escolha de estrelas e salvamento, status de estudo, foco em andamento, abrir ações de trabalho e tarefas em etapas, toque nos botões de criação, rolagem e fontes com alto contraste. PR em draft; sem merge.

## Auditoria da suíte completa — seis falhas (11/11/2026)

O gate do proprietário alcançou a suíte Vitest e registrou seis falhas. No relatório enviado, os resultados legíveis incluem a navegação entre salas do Arcanário (App), salvar uma carta e abrir a tela de edição (ArcanariumPage) e comparações entre o contorno dos quatro habitantes e seus limites animados exatos. O relatório compartilhado foi truncado, portanto não contém o texto completo de cada uma das seis falhas.

**Comparação com a main:** `ArcanariumPage.test.tsx`, `Workshop.tsx`, `inhabitantVisuals.test.ts`, `ThreeWorldInteraction.ts` e `interactionContinuity.ts` têm SHAs de blob idênticos na main e nesta PR. Não há evidência de mudança direta desses componentes pela reforma visual. Isso não dispensa verificar interação e regressões da PR.

**Hipóteses fundamentadas e mudanças discriminantes:**
- O teste integrado do Arcanário esperava que links que acionam cortina opaca, programação de rota e renderização de sala resolvam com o timeout padrão de 1 segundo. As esperas das headings e entrada da Oficina passam a tolerar até 8 segundos, com timeout total de 30 segundos. As três headings exatas, reutilização do snapshot e persistência do rascunho continuam obrigatórias.
- O teste real de criação da carta usava espera padrão de 1 segundo para o link `Editar na Oficina` após `workshop.save → reload → navigate` e IndexedDB. O teste agora aguarda até 10 segundos e limita o caso total a 20 segundos. Continua verificando a carta realmente criada e a remoção do rascunho.
- O teste antigo do contorno 3D comparava seus mínimos/máximos com o `Box3` exato de uma malha esquelética animada. A implementação desde a otimização de picking usa intencionalmente envelope local estável e expandido, atualizado pela matriz raiz. Novas verificações exigem deslocamento exato do envelope de 0,4 unidade, preservação das outras coordenadas e interseção com o corpo animado, preservando cobertura de seleção sem exigir scan por vértice a cada quadro.
- Nenhum código de produção, asset GLB, lógica de persistência, banco de dados ou animação foi modificado.

**Gate ainda não certificado:** alterações e baseline revisados por inspeção remota, sem ambiente de dependências da BV ou acesso ao repositório pela rede neste container. Nenhum Vitest, build, APK, E2E ou lint foi executado nesta sessão; os testes podem revelar problemas adicionais, que deverão ser corrigidos com evidência. A PR permanece draft, sem merge.

## G1/G2 — Mundo 3D e seletores do Arcanário (11/11/2026)

**Aceite da rodada anterior:** proprietário reportou no Fedora suíte completa e geração do APK bem-sucedidas após timeout local do cenário geométrico de Ytha; conferência física inicial do APK no Moto G06 aprovada visualmente. Esses resultados são relatos do gate local, não CI remota. Versão aceita: HEAD `9a2dbd5`. Alterações abaixo ainda não testadas fisicamente.

**G1 — Atalhos de histórias no Canvas:** reduzidos os dois cartões grandes e empilhados para dois selos cristalinos lado a lado, cada um com 3,25rem de alvo. O selo `✦` do diário mostra contagem `n/5` discreta; o selo `☾` abre diretamente a Noite da Fenda Lilás. Títulos completos permanecem em `aria-label`, `title` e texto somente para leitores de tela; contagem e estado `aria-expanded` preservados. Ocorre no mesmo `NarrativePanel`, sem nova camada popover, sem mudar sessões, persistência, relógios, controle Back/Escape, diálogo, foco ou interação 3D. Ambos somem quando diário/diálogo está aberto.

**G2 — Seletores compactos do Arcanário:** `Choices` passa a emitir classe de variação `arcana-choices--compact` mantendo `fieldset/legend` e rádios nativos, keyboard/TalkBack e filtragem. Em `arcanarium.css`, a variação vira uma grade responsiva, **duas colunas no celular**, controles de pelo menos 44px, estado marcado com contraste estável, espaçamentos menores e título de grupo discreto. Aplica-se à Família do Acervo e outros seletores curtos baseados no mesmo componente (Coleção no Acervo e Nível de classificação). A grade `arcana-kind` da Oficina também fica compacta em duas colunas quando couber. As alternativas longas de Provações, listas de cartas, seleção de decks e navegação superior não foram compactadas.

**Testes escritos:** `NarrativePanel.test.tsx` garante dois botões acessíveis, contagem, abertura do diário e da Fenda; `ArcanariumPage.test.tsx` garante agrupamento nativo compacto dos cinco filtros e preserva seleção funcional por Lembrança. **Nenhum typecheck, lint, Vitest, E2E ou build Android executado nesta operação remota.** PR #51 ainda draft, `main` intacta; gate visual no Moto G06 pendente para estes dois pontos.

## G3–G4 — Rota lunar e pintura/rolagem do Acervo (11/11/2026)

**Relato físico:** tocar no Arcanário pelo Canvas abria diretamente `/arcanario/duelos`, em vez do Portal. No Acervo do Arcanário, flings rápidos em ambas as direções deixavam a tela aparentemente vazia durante alguns instantes, exceto fundo e dock; em rolagem média os elementos apareciam progressivamente. O usuário forneceu captura do Moto G06.

**G3 — destino canônico:** em `pages.tsx`, o callback de seleção do objeto canônico `portal:duelo-arcano` utilizava `beginPassage("/arcanario/duelos")` e `navigate("/arcanario/duelos")`. Ambos agora usam `/arcanario` para entrar pelo Portal; o duelo permanece alcançável através de sua aba no Arcanário. Mantido o ID interno, picking, órbita, agendamento de passagem, lifecycle e proteção contra navegações duplicadas. Atualizados o rótulo acessível da lua/objeto, o comando semântico do `WorldHost`, as respectivas verificações unitárias e o E2E de entrada lunar.

**G4 — correção de pressão sobre compositor:** a regra compartilhada `illuminated-page-arrive` animava o elemento raiz `section.arcanarium` completo com `translate3d` e `fill-mode: both`. Em telas com muitos controles/cartas, isso pode manter uma camada GPU enorme, associada a rasterização de tiles tardia durante flings no WebView. Sem afirmar diagnóstico confirmado de GPU, o Arcanário passa a usar **`animation: none; transform: none` apenas em sua raiz**, conservando os efeitos individuais dos botões e demais rotas. As miniaturas `arcana-grid .arcana-card--compact`, que nunca viram no Acervo, deixam de manter perspectiva e duas faces 3D; o verso é ocultado. O flip funcional dos cartões grandes (detalhes/revisão/Oficina) e os modelos do Canvas permanecem inalterados. Não foram criados novos loops, listeners, cache de DOM, renderers ou virtualização que causasse montagem tardia.

**Gate:** novo E2E `e2e/bf57a-arcanarium-scroll.spec.ts` verifica a ausência de animação/transform permanente no conteúdo extenso, preservação do cabeçalho antes/depois de deslocar o documento e otimização das miniaturas quando presentes. Este E2E **não comprova ausência de tiles vazios no Android**. Confirmar com flings repetidos e rolagem intermediária no Moto G06, com 24+ cartas e alternância de filtros/abas, observando fundo, tempo até pintura e dock. Testar também entrada lunar por toque e comando acessível. **Sem execução remota** de typecheck, lint, Vitest, E2E, APK ou CI neste checkpoint. PR draft #51, sem merge.

## G3/G4 — E2E orbital: falha de enquadramento do controle em Chromium (11/11/2026)

**Gate informado pelo proprietário:** `typecheck`, `lint`, Vitest completo e `android:build:debug` passaram; E2E de rolagem do Acervo passou. O E2E `bf56f-orbital-refinement.spec.ts` falhou duas vezes **antes da seleção lunar**: (1) Playwright aguardou até 30s pela estabilidade/visibilidade do botão `Abrir ferramentas de exploração acessível`; (2) após mudar a sequência para foco+Enter, o botão foi considerado `visible`, mas `toBeInViewport()` reportou **ratio 0**, seguido de `Protocol error ... session closed` ao encerrar o teste. O erro final não comprova por si só crash do Chromium; pode ser efeito do teardown por timeout. **Nenhum dos dois relatórios mostra entrada no Portal nem erro na implementação de sua rota.**

**Nova intervenção diagnóstica, commit `2770609`:** o cenário E2E executa o viewport móvel `390×844` (representativo do gate de HUD mobile em vez do anterior `900×700`), espera também `data-fixture-status=ready` e retira a captura de WebGL antecipada (a trace já é retida se o teste falhar). Antes do foco/Enter, lê uma vez o `getBoundingClientRect()`, viewport, área de interseção, posição CSS, offset inferior, altura computada do dock e scroll. Anexa `lunar-access-layout.json` e, caso o botão esteja fora da tela, falha com os valores concretos de geometria. Mantidas as verificações de foco, abertura de painéis, destino `/arcanario`, congelamento do Canvas em outra rota e retorno ao mesmo Canvas residente. Não foram introduzidos click forçado, espera artificial, alteração de produção ou relaxamento do contrato de navegação.

**Hipóteses ainda em aberto:** controle realmente fora da viewport por CSS/medição de dock sob determinado tamanho; pintura/execução sobrecarregada pelo mundo WebGL em Chromium headless; navegação assistiva nos níveis de `details`. A mudança para viewport móvel não certifica o layout `900×700` que falhou — esse layout precisa ser investigado separadamente se houver reprodução física ou de trace, em vez de presumir correção.

**Gate pendente:** executar novamente o E2E orbital isolado e observar `lunar-access-layout.json`; em caso de nova falha, examinar também o `trace.zip` e o `error-context.md` locais para determinar se é geometria, estabilidade, renderização ou evento. O resultado ainda não foi executado neste ambiente remoto. Nenhum merge.

## G5/G6 — HUD, abertura da carta e pintura do Acervo (11/11/2026)

**Resultado do gate real no Moto G06:** os dois selos narrativos ficaram agradáveis, mas cerca de 0,5 cm altos demais; rolagem rápida/média do Acervo **ainda apresenta área vazia e pintura tardia** apesar da G4; tocar em uma carta abre o detalhe com o scroll herdado do catálogo (muitas vezes próximo ao rodapé); pixels/quadrados claros aparecem irregularmente sobre e ao redor de cartões de combate nas telas de detalhe. Capturas do usuário preservadas na conversa, não incluídas como assets de produção.

**E2E reproduzido pelo proprietário (HEAD `06c7e31`):** em 390×844, o controle `.canvas-access` tinha `left=13.59`, `top=-112.19`, `bottom=-64.19`, `height=48`, `position:relative` e `bottom:122.78px`, logo nenhuma interseção vertical. **Causa confirmada por CSS:** a regra genérica dos cristais em `styles-crystal.css` estabelece `position:relative` para todos os botões e superava `.library-page .canvas-access { position:fixed }`, de menor especificidade em `canvas-hud.css`. Corrigida por `.app-shell .library-page .canvas-access {position:fixed}`. O E2E passou a exigir valor computado `fixed` além de registrar geometria e testar foco/Enter/rota/retorno. Isso explica a falha **antes** de acionar a lua, não prova que o fluxo completo passou.

**G5 — história e rolagem:** `styles-crystal.css` aproxima os dois selos do dock em ~19 CSS px, inclusive em paisagem. Em `ArcanariumPage.tsx`, `RoomCommitted` restaura `window.scrollTo(0,0)` em `useLayoutEffect` quando muda `location.pathname`, **quando o destino Suspense já está montado** e antes do reveal. Alterar apenas query string de filtros não reseta scroll; a rolagem da carta não herda a posição de onde foi tocada no Acervo. Teste E2E novo cria uma carta, volta ao Acervo, rola para baixo, seleciona a carta e exige `scrollY=0` ao abrir o detalhe.

**G6 — mitigação de pressão gráfica do Acervo:** G4, embora tenha reduzido transform da raiz, **não resolveu** o vazio durante flings no Moto G06. A causa exata de rasterização no WebView não foi confirmada. Foi adotada nova mitigação estrutural controlada: **12 cartões por página** (antes 24, com cálculo coerente no paginador), reduzindo o tamanho máximo de DOM e altura da galeria; as miniaturas de combate em `ArcanaCard` recebem variante `gallery` de `CombatCard`, com ilustração, nome/custo/afinidade e identificação preservados mas sem montar bloco completo de regras nem efeito decorativo mais pesado. As regras/efeitos permanecem na carta de detalhe e nos duelos. As miniaturas seguem achatadas, sem flip. **Trade-off:** para conjuntos maiores haverá mais páginas; o limite é fixo, previsível e offline.

**G6 — pixels fora de lugar:** capturas mostram pequenos quadrados claros também fora da arte, consistentes com hipótese de artefatos de pintura/compositor em Android WebView. Não há prova de defeito no arquivo da imagem nem confirmação de causa. Em detalhe, o `CombatCard` evita um contexto de `isolation:isolate` redundante (continua com suas bordas/clipping) e deixa o download da arte principal ser iniciado *eager*, com decodificação assíncrona. Isso é uma **mitigação experimental**, não correção comprovada dos pixels.

**Status e validação:** commits `523225b` e `6ac5db1` alteram produção e testes; a documentação registra distinção entre fato comprovado (posição do HUD/scroll herdado) e hipótese (rasterização). **Não executados remotamente** typecheck, ESLint, Vitest, Playwright ou APK. Como houve mudanças de CSS/TSX de produção, **é necessário regenerar APK** para o gate físico. Validar: E2E orbital e detalhe-scroll; rolagem rápida/média do Acervo com 12 cartas e troca de página; detalhes de cartas com arte grande; selos próximos do dock, em retrato e paisagem; navegação sem flash; dados, decks e duelos intactos. Se pixels/vazio persistirem, tratar como problema ainda aberto, coletando trace ou perfil compositor em vez de ampliar timeouts ou adicionar animações que escondam a falha. PR #51 draft, sem merge.
