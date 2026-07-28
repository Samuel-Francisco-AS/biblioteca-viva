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
