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
