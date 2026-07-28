# Desempenho e estabilidade

## 1. Princípio

Medir no aparelho alvo antes de otimizar. O objetivo é uma experiência estável em hardware modesto, não pontuação abstrata de benchmark.

## 2. Metas iniciais

- navegação React sem travamentos perceptíveis;
- resposta comum ao toque em até aproximadamente 100 ms;
- biblioteca próxima de 60 FPS no aparelho alvo;
- piso estável de 30 FPS em modo reduzido;
- abertura offline funcional;
- ausência de crescimento contínuo de memória ao entrar e sair da Biblioteca;
- retorno do segundo plano sem recriar serviços ou áudio em duplicidade.

Essas metas são guardrails. Registrar medições reais e ajustar apenas com justificativa.

## 3. Estratégia de carregamento

- carregar Phaser apenas na rota Biblioteca;
- separar bundle da cena quando possível;
- carregar assets por manifesto;
- manter shell React utilizável durante falha ou atraso do Phaser;
- não carregar assets de expansões inexistentes;
- carregar sala única no protótipo;
- suspender ou destruir corretamente ao sair.

## 4. Cena

- câmera fixa;
- poucos objetos ativos;
- atlas de texturas quando útil;
- partículas discretas e limitadas;
- sem filtro caro em tela inteira sem medição;
- movimentação da criatura simples;
- estante por estado, não um objeto complexo por livro;
- atualização incremental do view model;
- fallback geométrico leve.

## 5. React e dados

- consultas orientadas por índices reais;
- paginação ou virtualização somente quando volume justificar;
- evitar armazenar coleção inteira duplicada em store;
- memoização apenas após identificar custo;
- busca com estratégia que não bloqueie digitação;
- formulários não rerenderizam a cena a cada tecla.

## 6. Áudio

- preload apenas do necessário;
- liberar recursos;
- evitar múltiplas instâncias do mesmo loop;
- pausar no ciclo de vida;
- verificar suporte e formato na WebView.

## 7. Perfil obrigatório no G9

Testar:

1. abrir e fechar Biblioteca repetidamente;
2. alternar rotas por alguns minutos;
3. segundo plano e retorno;
4. coleção com volume de fixture;
5. busca e filtros;
6. áudio ligado e desligado;
7. movimento normal e reduzido;
8. atualização de projeção durante a cena;
9. uso de memória antes e depois;
10. FPS e quedas perceptíveis.

Registrar ferramenta, aparelho, build, cenário e resultado. Não afirmar “otimizado” sem evidência.

## 8. Regressões bloqueadoras

- memória cresce a cada visita;
- áudio duplica;
- toque fica atrasado;
- teclado ou scroll travam;
- cena preta sem fallback;
- shell React depende do carregamento do Phaser;
- queda sustentada abaixo de 30 FPS no modo reduzido;
- persistência bloqueia interface de forma prolongada.
