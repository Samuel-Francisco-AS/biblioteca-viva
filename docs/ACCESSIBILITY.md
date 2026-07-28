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
