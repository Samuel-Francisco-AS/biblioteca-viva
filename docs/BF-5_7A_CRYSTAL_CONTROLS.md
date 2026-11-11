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
