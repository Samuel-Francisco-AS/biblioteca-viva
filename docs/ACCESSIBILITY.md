# Acessibilidade

## 1. Regra central

A biblioteca visual nunca é a única forma de acessar informação ou executar uma tarefa. Phaser fornece atmosfera; React fornece estrutura semântica, leitura, foco e alternativa textual.

## 2. Requisitos da interface

- HTML semântico;
- labels associados a campos;
- mensagens de erro ligadas ao controle;
- ordem de foco lógica;
- foco visível;
- navegação por teclado no web desktop;
- áreas de toque com alvo aproximado mínimo de 44 × 44 CSS px;
- texto redimensionável sem corte;
- sem overflow horizontal em 320 px;
- contraste suficiente;
- informação não transmitida apenas por cor;
- linguagem simples e consistente.

## 3. Movimento

A preferência de redução de movimento deve:

- reduzir ou remover partículas;
- encurtar transições;
- limitar movimentos contínuos da criatura;
- evitar flashes;
- preservar feedback por texto e mudanças estáticas;
- respeitar `prefers-reduced-motion` no web quando possível.

Não desligar toda a biblioteca sem oferecer uma versão estática coerente.

A política efetiva do Prompt 17 possui três escolhas persistidas: `system` (padrão), `reduce` e `normal`. `system` acompanha `prefers-reduced-motion`; as outras duas são overrides explícitos do usuário. A resolução acontece uma vez na aplicação e o booleano efetivo é entregue a React e Phaser. Alterar a preferência atualiza a mesma instância/canvas: com redução ativa, bibliotecária, criatura, livro recente e luminária permanecem visíveis, mas a cena cria zero tween repetitivo e conclui desbloqueio no estado estático.

## 4. Áudio

- volumes separados para música e efeitos;
- mute acessível;
- áudio só inicia após gesto permitido;
- eventos sonoros importantes têm feedback textual ou visual;
- nenhum fluxo depende de ouvir;
- retorno do segundo plano não causa explosão de sons acumulados.

## 5. Biblioteca visual

Fornecer texto equivalente com:

- quantidade de livros;
- livros em andamento e concluídos;
- estado da estante;
- livro em destaque;
- marco ou decoração desbloqueada;
- ações disponíveis.

Objetos tocáveis possuem alternativa React e nome compreensível.

## 6. Formulários

- instruções antes do erro;
- preservar entrada inválida;
- foco no primeiro problema após envio;
- não usar placeholder como único rótulo;
- teclado virtual apropriado para números;
- campos opcionais indicados;
- confirmação para ações destrutivas.

## 7. Conteúdo

- diálogos curtos;
- sem linguagem punitiva;
- textos não dependem de referências visuais obscuras;
- ícones acompanhados de rótulo quando a função não for universal;
- datas e números formatados para pt-BR inicialmente.

## 8. Testes

Em todo gate de UI, verificar:

- teclado;
- leitor de estrutura semântica quando disponível;
- zoom e fonte maior;
- contraste;
- redução de movimento;
- mute;
- toque com uma mão;
- alternativa textual da biblioteca;
- mensagens de erro.

Problemas que bloqueiam acesso ao CRUD são S1 e bloqueiam gate.

## 9. Implementado no shell do Prompt 2

- regiões semânticas `header`, `nav` e `main`;
- link de salto para o conteúdo principal;
- nomes acessíveis completos para as cinco opções de navegação;
- rota ativa indicada por `aria-current="page"`, cor, fundo e sublinhado;
- foco visível global e foco movido para o conteúdo após mudança de rota;
- alvos com altura mínima de 44 CSS px;
- navegação por teclado usando links nativos;
- suporte a `100dvh`, safe areas e espaço inferior para a navegação fixa;
- quebra de texto e largura fluida para evitar overflow horizontal a partir de 320 px;
- estrutura única de navegação adaptada por CSS entre mobile e desktop.

No G1, Sam validou manualmente Tab, Enter, foco visível, link de salto, dimensões móveis no modo responsivo do navegador e ausência de overflow horizontal. A validação física do shell foi transferida para o G2, por meio do primeiro APK Android.

## 10. Implementado no formulário do Prompt 7

- formulário semântico compartilhado entre cadastro e edição;
- labels reais, indicação textual de obrigatoriedade e instruções antes dos campos com limites;
- ajuda e erro associados por `aria-describedby` e campos inválidos marcados com `aria-invalid`;
- erros próximos aos controles e resumo com `role="alert"` que recebe foco após falha;
- valores preservados após falha, envio por teclado e Cancelar com `type="button"`;
- estado “Salvando…” e controles bloqueados durante a operação;
- inputs numéricos com teclado apropriado, ordem natural e alvos mínimos baseados no token de 44 CSS px;
- layout fluido a partir de 320 px e safe areas herdadas do shell.

A validação manual com teclado, leitor de estrutura, zoom, larguras móveis e teclado virtual Android permanece pendente.

## 11. Implementado na consulta do Prompt 9

- busca, status e ordenação possuem labels reais e instrução textual;
- os controles da Coleção estão agrupados semanticamente e permanecem na ordem natural de teclado;
- contagens de resultados usam região `aria-live="polite"` e não dependem de cor;
- Coleção vazia e nenhum resultado possuem headings e ações diferentes;
- limpar busca devolve foco ao campo correspondente;
- o Arquivo usa headings, listas, artigos e `time` com `dateTime` para notas e citações;
- links do Arquivo nomeiam o livro de destino e registros sem livro relacionado recebem texto seguro;
- campos e cartões continuam fluidos, com quebra de conteúdo longo e espaço inferior do shell.

## 12. Backup e recuperação

- seletor com label, ajuda, erro associado e estados anunciados;
- confirmação inline com heading, resumo e consequência textual;
- foco movido à confirmação e devolvido ao seletor ao cancelar ou falhar;
- ações inequívocas, teclado nativo, alvo mínimo e bloqueio durante operação;
- valores preservados após falha e layout fluido a partir de 320 px;
- Error Boundary com heading e ações explícitas, sem detalhes internos.

## 13. Sala reativa do Prompt 13

- estante, bibliotecária e criatura abrem painéis React semânticos, nunca texto dentro do canvas como única representação;
- somente um painel existe por vez, cada painel possui heading e botão de fechar focado ao abrir;
- a Coleção convencional permanece disponível antes, durante e depois da cena;
- painéis usam largura fluida, quebra de texto, alvos mínimos e ordem natural de teclado a partir de 320 px;
- `prefers-reduced-motion` elimina os tweens repetitivos e preserva a sala estática completa;
- conclusão combina lombada/marcador dourado com contagem e descrição textual, sem depender somente de cor;
- o canvas não é declarado operável por teclado; ações essenciais e conteúdo textual pertencem ao React.

## 14. Controles sonoros do Prompt 14

- sliders HTML nativos com labels que anunciam nome e porcentagem atual;
- mute como checkbox rotulado, sem depender de ícone ou cor;
- ordem natural de teclado, foco visível e alvo mínimo preservados pelo shell;
- alteração imediata em memória e persistência assíncrona com erro textual;
- controles continuam operáveis quando backend ou asset está indisponível;
- nenhum autoplay: o primeiro `pointerdown` em qualquer parte do documento ou `keydown` válido inicializa o backend, seja a origem React ou Phaser;
- mudança de rota mantém título, foco e estado ativo; estante, bibliotecária e criatura mantêm seus painéis React como equivalentes visuais; conclusão mantém mensagem e projeção visual;
- asset ausente degrada para silêncio sem bloquear controles, navegação ou feedback textual;
- pause descarta efeitos em curso e não acumula respostas para o retorno;
- validação manual com leitor de tela, zoom, fone e aparelho físico permanece pendente.

## 15. Conteúdo contextual do Prompt 15

- falas permanecem em painel React semântico com heading, texto localizado e botão de fechar focado;
- atributo `lang="pt-BR"` acompanha a fala;
- áudio dos personagens não é necessário para compreender a resposta;
- Phaser somente emite interação e nunca renderiza o diálogo como única alternativa;
- textos são curtos, sem culpa, cobrança, streak ou interpretação de livro;
- fallback textual explícito mantém painel utilizável quando não há candidato específico;
- validação manual de leitor de tela, ampliação e conforto de repetição foi acumulada para o checkpoint integrado.

## 16. Primeiro desbloqueio do Prompt 16

- a notificação React usa região `status` com `aria-live="polite"` e `aria-atomic="true"`, sem mover foco;
- título do marco e nome da decoração tornam a mudança compreensível sem canvas, áudio ou cor;
- a luminária permanece no estado visual estático quando `prefers-reduced-motion: reduce` está ativo;
- a animação normal é curta, não bloqueia interação e não contém flash ou partículas;
- o diálogo contextual mantém seu painel React acessível, e mute não remove nenhum feedback textual;
- leitor de tela, reduced motion e conforto visual em aparelho real permanecem na checklist integrada de G8.

## 17. Consolidação do Prompt 17

### Preferências

`experience.preferences.v1` armazena na tabela `settings` somente:

- movimento: seguir sistema, reduzir ou normal;
- alto contraste: ligado/desligado;
- texto: padrão, grande ou maior.

Valores externos são validados estritamente. Ausência, corrupção ou opção futura desconhecida usa defaults seguros e não impede a abertura. Áudio continua em `audio.preferences.v1`; não existe segunda fonte para volume ou mute. Como settings já participa do backup v2, ambas as preferências seguem no snapshot sem mudar formato ou schema.

Alto contraste troca os tokens semânticos de fundo, superfície, texto, borda, foco, link, controle e erro, aumenta bordas e remove sombra dispensável; não cria tema paralelo. Tamanho de texto altera tokens e herança tipográfica em três escalas controladas, sem aplicar zoom ao canvas.

### Camada React equivalente

A Biblioteca expõe fora do canvas uma seção semanticamente nomeada com total, andamento, conclusões atuais, estado da estante, livro recente quando houver e marco/luminária histórica. A mesma seção oferece links/botões nativos para Coleção, estante, bibliotecária e criatura. Fechar um painel devolve foco ao equivalente React que o abriu; interações originadas no canvas também têm esse destino seguro.

Phaser permanece imagem/atmosfera complementar e não é declarado acessível ou operável por leitor de tela. Falha, ausência ou inutilidade do canvas não remove o resumo nem os caminhos React. Áudio, cor e movimento nunca são a única confirmação do marco, status, progresso, erro ou navegação.

O detalhe do livro usa `progress` HTML nativo com label textual para o total conhecido e mantém porcentagem, páginas lidas e restantes visíveis fora da barra. O estado sem total não apresenta porcentagem fictícia: informa página atual e ausência do total. A largura é fluida e os textos quebram sem depender de cor.

### Auditoria React

Foram preservados por já estarem corretos: `header`/`nav`/`main`, skip link, hierarquia por rota, links e botões nativos, `aria-current`, labels, fieldsets da Coleção, erros associados por `aria-describedby`/`aria-invalid`, foco após validação, confirmação destrutiva, backup/restauração, regiões de status e alvo mínimo de 44 px. Foram corrigidos o `aria-describedby` condicional do arquivo de backup, foco após erros assíncronos de progresso/nota/citação e retorno de foco dos painéis da Biblioteca. Nenhuma ARIA redundante foi adicionada.

R1-B mantém o resumo de restauração focalizável e ações nativas. Em base preenchida, as três escolhas têm rótulos explícitos; continuar sem backup abre confirmação textual adicional, e voltar devolve foco à ação que a abriu. Cancelar preserva dados, remove somente a seleção do fluxo e devolve foco ao campo de arquivo. Esses comportamentos possuem testes automatizados, mas TalkBack e toque físico continuam pendentes.

R2 usa um único padrão React para ações de nota e citação no detalhe e no Arquivo. Editar abre campos com labels reais e erro associado; cancelar ou concluir devolve foco ao botão de edição. Excluir abre um grupo de confirmação nomeado, separado visualmente da edição, e cancelar devolve foco ao botão de exclusão. Compartilhar só anuncia conclusão depois da resposta do adapter; indisponibilidade permanece recuperável. Os botões preservam o alvo mínimo global de 44 px. Teclado e foco têm cobertura automatizada, mas TalkBack e toque físico de R2 continuam pendentes.

### Checklist manual acumulada para G9

- [ ] TalkBack no Moto G06: landmarks, títulos, navegação e alternativa da Biblioteca;
- [ ] leitor de tela desktop quando disponível: formulários, Configurações, painéis e marco;
- [ ] Tab e Shift+Tab; Enter e Space nos controles nativos; retorno de foco ao fechar painéis;
- [ ] foco no primeiro erro/resumo, conteúdo preservado e ações destrutivas;
- [ ] alto contraste em todas as rotas, estados ativos, links, foco, erro e controles;
- [ ] texto grande/maior em 320 px, sem corte, sobreposição ou overflow horizontal desnecessário;
- [ ] seguir o sistema, reduzir e movimento normal no navegador e Android;
- [ ] sala estática completa, luminária e livro recente perceptíveis com redução ativa;
- [ ] mute e volumes zero mantendo conclusão, marco, diálogo, navegação e erros compreensíveis;
- [ ] backup/restauração controlados preservando preferências;
- [ ] toque com uma mão e teclado virtual no Moto G06.

Nenhum item desta checklist foi executado no Prompt 17. Não há alegação de conformidade total WCAG. Prompt 17 e G9 permanecem abertos até validação humana integrada; G7 e G8 também permanecem abertos.

## 18. Shell e rotas convencionais de R3-A

O drawer é um diálogo modal React com nome acessível, navegação interna identificada, contenção de Tab/Shift+Tab, Escape, fechamento explícito, backdrop sem clique atravessando e retorno de foco ao botão de menu. Cada destino é um link nativo de área inteira e mantém `aria-current`. A Coleção usa um único link envolvendo o conteúdo não interativo do livro; não há botão ou link aninhado, e um teste clica no autor para provar que a superfície inteira navega.

O tema escuro usa tokens semânticos para fundos, superfícies, texto, bordas, foco, estado e controles. Alto contraste substitui os mesmos tokens; texto grande/maior e alvo mínimo de 44 px permanecem. Detalhe e Configurações reduziram bordas sem remover headings, labels, erros associados, confirmações ou zona destrutiva. A automação cobre estrutura, foco e teclado; contraste percebido, TalkBack, teclado virtual, safe areas físicas e conforto visual continuam humanos.

## 19. Biblioteca, sheet e balões em R3-B

O canvas continua apenas visual e recebe descrição curta, não equivalência falsa de leitor de tela. O disclosure “Resumo acessível” mantém contagens, estante, marco e botões nativos; ao falhar Phaser, ele abre automaticamente. O bottom sheet é diálogo DOM com heading, conteúdo rolável, Escape, botão fechar e retorno ao acionador React. Os balões usam `aria-live="polite"`, uma única frase localizada e nenhum foco automático; fechar pelo equivalente React devolve foco à personagem correspondente.

Drawer e sheet respeitam safe areas; system bars transparentes não recebem controles essenciais sob seus insets. Períodos alteram somente iluminação, nunca informação exclusiva. Reduced motion elimina loops e a transição de atmosfera, mas toque ainda produz highlight/estado, texto, sheet ou balão. Testes automatizam semântica, foco, Escape, superfície integral, texto ampliado estrutural e overflow; contraste percebido, TalkBack, teclado virtual, barras reais e conforto continuam humanos.

## 20. P1-A

O seletor de tipo usa botões de superfície inteira com nome e descrição; formulários específicos mantêm labels reais, submissão única e erros públicos. Coleção oferece controles nativos de tipo, status, favorito e ordenação, e cards continuam links integrais. A automação cobre os seis tipos e viewport estreita; TalkBack, teclado virtual, texto ampliado e contraste percebido ainda exigem validação humana.

## 21. P1-B

Tags usam checkbox com nome visível, favorito expõe `aria-pressed`, e ações de renomear/excluir permanecem botões explícitos com confirmação. Timer anuncia estado/duração em região viva, possui controles textuais e não depende de cor. Filtros de Coleção/Arquivo usam label e controles nativos. Prompt/confirm do browser são provisórios acessíveis pelo agente do usuário; foco, TalkBack, teclado virtual, 320 px e texto ampliado ainda exigem prova humana.

## 22. P1-C

Estatísticas usa headings, filtros nativos, números e listas textuais. Nenhum valor depende de barra ou cor. Timeline usa lista ordenada e `time`; sessão ativa oferece link textual aos controles. A automação cobre semântica/viewport, mas leitura TalkBack, contraste percebido e texto ampliado continuam evidência humana pendente.

## W3 estrutural — Processo 1

O resumo acessível informa o cômodo inicial, células de piso e peças estruturais colocadas. O canvas permanece complementar; não há ainda modo Construção acessível, editor ou inventário UI.
