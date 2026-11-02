# BF-4F3 — autonomia e relações dos quatro habitantes

Data: 2026-11-02. Branch `feat/bf-4f3-autonomia-relacoes`, base `5671ee6a1efb4338efb07a104526c4b56092000b` (merge BF-4F2). Checkout inicial limpo; `main` verificada, `fetch origin` e `pull --ff-only origin main` executados antes de criar a branch.

**Candidata à auditoria e ao gate artístico/físico no Moto G06. Não é fechamento humano da F3.** F4/quests, BF-4G, TalkBack e desempenho sustentado permanecem pendentes. Sem merge, alteração de versão, instalação ou dados pessoais modificados.

## A — núcleo e navegação efetivos

`InhabitantAgency` é uma FSM local, independente de React, Three, browser, Dexie e rede. Quatro estados individuais contêm intenção, destino, posição, orientação, disponibilidade, cooldowns e memória curta. Estados: `idle`, `navigate`, `work`, `socialize`, `react`, `recover`; pausa é uma projeção semântica do modo global. Modos `running/paused/reduced/unavailable` suspendem decisões e deslocamento. Relógio monotônico, hora contextual e seed são injetáveis; o runtime entrega somente tempo ativo pelo RAF existente. A lógica roda a cada 250 ms, o movimento acompanha o delta limitado existente (50 ms no runtime); não há catch-up de minutos em retomadas, timer ou RAF por habitante.

Prioridades combinam interesse individual, dia/noite, descanso após trabalho, novidade de lugar, distância, espaço disponível, vínculos e necessidade de reparo. Variação seeded desempata interesses; não constitui a personalidade. Atividades têm permanência, conclusão e repouso. Encontros respeitam um mínimo de trabalho/deslocamento antes da aceitação, cooldown individual/global e uma cena conjunta por vez. Pares ainda sem encontro recebem oportunidade antes de pares já familiares monopolizarem a convivência. Aryn passa a esperar a iniciativa alheia após experiências de cooperação; a confiança favorece a iniciativa de Ytha. Samael costuma aceitar aproximações dos demais em vez de iniciá-las.

Navegação: grafo pequeno de visibilidade construído das linhas centrais/interseções das **18 regiões BF-4D**, pontos de atividade, posições iniciais, baias livres do salão e pontos explícitos nas quatro passagens. Não se presume navmesh. Dijkstra encontra caminhos com segmentos contínuos. Cada ligação respeita união dos pisos A–E/passagens e obstáculos reais extraídos por instância das meshes montadas: paredes, detalhes, mobília, estantes, livros e representações presentes dos registros. São coordenadas geométricas, sem leitura de conteúdo pessoal. A extração reserva a extensão da gaveta E e oscilação de folhas BF-4E. Não usa o AABB gigante de um batch arquitetural inteiro como obstáculo.

Envelopes radiais foram conferidos nos vértices de todos os clips reais, incluindo asas, notebook, flor e grimório. Valores arredondados para fora, em metros:

| Habitante | Circulação/gestos | Trabalho | Magia | Velocidade (m/s) |
|---|---:|---:|---:|---:|
| Samael | 0,66 | 0,86 | 1,65 | 0,95 |
| Aryn | 0,62 | 0,66 | 1,30 | 1,22 |
| Ytha | 0,92 | 0,92 | 1,30 | 1,02 |
| Lua | 0,58 | 0,62 | 1,24 | 1,13 |

O teste usa a geometria real com **todos os 13 slots fictícios**, objetos vivos e folio de treino. Cada habitante alcança os cinco cômodos; segmentos de travessia são verificados contra as passagens. O navegador usa envelope quadrado conservador ao redor do raio. Ocupantes e destinos reservados são obstáculos dinâmicos; bloqueio interrompe a passada, tenta nova rota após 3 s e abandona/cancela com texto quando não há caminho. Encontros possuem prazo de aproximação e liberam reservas ao cancelar. Não há empurrão, atravessamento deliberado ou teletransporte de recuperação. A malha não é editor espacial nem posição persistente.

As conexões estáticas validadas são reutilizadas; o cache de conexões de origem/destino tem limite de 128 entradas. O grafo pertence à montagem. Essa reutilização corrigiu custo redundante demonstrado na simulação lógica, sem alegar gargalo ou otimização física do Moto G06.

### Integração F2 e interrupções

A translação e o yaw mundial pertencem à F3. A caminhada corporal usa cópia do clip sem o canal demonstrativo `Facing.quaternion`; pernas e braços permanecem articulados. Caminhada e trabalho podem repetir durante a intenção, enquanto magia/reação/recuperação são finitos. O animador não devolve a root à origem F1. A demonstração F2 isolada preserva ida/volta; **no mundo autônomo o botão Caminhar demonstra os passos no lugar**, sem disputar a posição do navegador.

Seleção/ação manual suspende o percurso, cancela um encontro quando necessário, mantém a posição durante a demonstração e depois recupera a intenção por uma rota novamente verificada. O gesto só é aceito se o envelope couber no local; React informa indisponibilidade/ausência de espaço em vez de fingir a ação. Magia conjunta também depende de espaço; o trabalho/gesto seguro mantém a encenação quando o gesto amplo não cabe. Highlight acompanha os bounds móveis; picking continua ligado à mesma root `character:*`.

Pausa e background preservam posições e intenções. Movimento reduzido suspende percursos/cenas sem teletransporte e suprime animação decorativa; texto explica a suspensão. Falha WebGL publica indisponibilidade, encerra a agência e mantém no React somente o último estado confirmado, explicitamente identificado. GLBs, fontes e clips F2 não foram regenerados.

## B — atividades, relações e acontecimentos

| Habitante | O que se pode observar |
|---|---|
| Samael | Notebook/café fictícios, estudo e observação de mecanismos; repouso maior durante o dia, trabalho favorecido à noite; passada pesada, gestos secos e gratidão discreta. Aura contida em calma e mais presente em reação, além dos gestos corporais. |
| Aryn | Inspeção e restauração de folhas de treino, leitura, iniciativa social e resposta ao acidente; aprende durante a sessão a esperar o sinal de Lua e compartilhar a condução com Ytha. |
| Ytha | Cuidado da planta estrelada, ficção, repouso das asas e acolhimento; hesita em encontros iniciais e toma mais iniciativa com confiança. Asas/gestos F2 acompanham sua atuação. |
| Lua | Desenho e revisão de grimório, curiosidade por mecanismos, busca de companhia e ensaio mágico no cômodo D; reage ao erro, aceita ajuda e reconhece a própria correção. |

Atividades usam pontos compartilhados dos cinco cômodos; nenhum cômodo pertence a um habitante. Leitura, café, desenho, inspeção e reparos usam acessórios e props fictícios. Registros do usuário não são alvos da agência.

Existem seis relações bidirecionais independentes, com **confiança, afinidade, tensão simultânea**, descrição e até cinco acontecimentos por par. Sem HUD numérico ou amizade do jogador. O histórico global guarda até oito mensagens; o histórico de atividades guarda seis IDs por personagem. Nenhum dado vai para Dexie, backup, arquivos ou rede.

| Par | Encontro próprio e consequência |
|---|---|
| Samael ↔ Aryn | Ela tenta ordenar as anotações; ele resiste com sarcasmo; restauração consentida de uma folha e agradecimento discreto. Atrito aumenta tensão; colaboração aumenta confiança. |
| Samael ↔ Ytha | Companhia silenciosa no repouso; cuidado da flor e ajuda prática, acolhimento sem medo. Confiança cresce e tensão diminui. |
| Samael ↔ Lua | Rivalidade sobre um mecanismo imaginário, impaciência e revisão compartilhada. Confiança e tensão podem coexistir. |
| Aryn ↔ Ytha | Restauração/florada em conjunto; Ytha assume a condução e Aryn deixa de dar todas as instruções. Cooperação aumenta confiança e alivia tensão. |
| Aryn ↔ Lua | Correção precoce provoca contrariedade; Aryn aprende a esperar a autorização de Lua para refazer o símbolo. Reconhecimento melhora o vínculo. |
| Ytha ↔ Lua | Desenho de folhas/constelação de pétalas, tempo para a opinião tímida e celebração conjunta. Acolhimento favorece novas iniciativas. |

Encontros começam com aceitação e aproximação real de ambos até posições livres, espera de chegada, orientação mútua, abertura, reação/atrito, cooperação e reconhecimento. Só há consequência de conclusão após os beats correspondentes; um conflito já encenado pode deixar tensão mesmo se o restante for interrompido. Relações influenciam prioridades e disponibilidade futura.

### Acidente cenográfico

Lua pode realizar um ensaio após trabalho próprio e disponibilidade espacial. O símbolo imperfeito dobra/chamusca visualmente um **novo folio cenográfico sobre a mesa D**, sem destruir móveis ou dados. Ciclo explícito: `intact → damaged-cosmetic → repairing → intact`. Cor e inclinação das folhas mostram dano; luz/motes contidos acompanham o reparo. Não há flashes, colisão destrutiva nem alteração de registros.

Lua reage com constrangimento e procura ajuda; habitantes disponíveis podem aceitar a reparação, com prioridade para a parceria Aryn/Lua. Quem está próximo também pode reagir. A dupla caminha e executa a correção; o folio volta intacto e o vínculo registra confiança maior/tensão menor. Cancelamento durante reparo devolve ao dano cosmético recuperável e permite nova tentativa. Novo acidente respeita cooldown de quatro minutos de tempo ativo e não ocorre enquanto o anterior está aberto. Sem campanha de acidentes contínuos ou dependência de cliques do jogador.

### Ponte BF-4E real

`LivingSession.act()/actPrimary()` continuam retornando os mesmos eventos tipados e notificando snapshots. A F3 adiciona `onEvents(events, source)` **depois da mutação/publicação do snapshot**; `source` distingue `user` e o habitante. A agência apenas percebe esses eventos, com cooldown de reação de 18 s. Não se presumiu barramento global nem se deduziu evento de qualquer mudança de snapshot.

`actFromInhabitant()` permite somente **planta/touch, globo/turn e relógio/turn**. Luminária, pergaminho, livro da estrela e armário não são capacidades autônomas: o Segredo do Pergaminho continua nas mãos do usuário. O guard de emissão impede ações recursivas tanto de callbacks de snapshot quanto de eventos. As assinaturas são removidas no teardown; nenhum callback ressuscita a montagem.

## C — experiência e verificação

A superfície **Habitantes da Biblioteca** continua recolhida e fora do canvas. Oferece atividades/localizações, aproximação real, pausa, disponibilidade e mensagem importante; um segundo detalhe recolhido mostra os seis vínculos e acontecimentos recentes, sem números. Os seis botões F2 continuam contextuais. Não há painel de simulação permanentemente sobre o cenário, diálogos, quests ou entrada livre.

Captura única de inspeção técnica: [mundo após início autônomo](evidence/bf4f3/world-autonomy.png), Chromium desktop/coleção vazia. Quatro modelos carregados, runtime `running`, nenhum `pageerror`; o enquadramento mostra uma parte do mundo. A imagem estática não prova percurso, encontro concluído ou aprovação artística. Não houve ciclo de renders/GLBs.

### Resultados locais

| Verificação | Resultado |
|---|---|
| Prettier `format:check` | PASS |
| ESLint | PASS |
| TypeScript | PASS |
| `test:run -- --maxWorkers=2` | **PASS: 88 arquivos / 690 testes** |
| Áudio | PASS: dois WAVs determinísticos |
| Build de produção | PASS: 260 módulos; warning conhecido de chunks >500 kB |
| Relatório de bundle | PASS: inicial **651.367 bytes**; Three dinâmico **723.595 bytes** |
| E2E novo F3 dirigido | **PASS: 1/1**, Chromium de produção; iniciativa sem comandos e suspensão honesta com redução |
| E2E integrado global | NOT RUN localmente; reservado à CI da PR |
| Sync/Gradle/APK debug | **PASS**: `cap sync android` + `assembleDebug`, 184 tarefas (27 executadas / 157 atualizadas); sem instalação |
| Moto G06, TalkBack, expressão artística, fluidez sustentada | **NOT RUN nesta F3; exigem avaliação humana específica** |

Os 14 testes acrescidos cobrem núcleo/rotas/relacionamentos, estados semânticos e assinatura React, eventos BF-4E sem recursão, envelopes reais, caminhada corporal externa e runtime com GLBs reais sob um único scheduler. A simulação seeded tem horizonte máximo de vinte minutos e termina ao comprovar os seis vínculos, convivência, conflito, reparação e circulação; verifica cada segmento de movimento lógico, limites de memória, ausência de saltos e separação dos habitantes. Não representa vinte minutos de FPS físico.

Falhas de desenvolvimento e correções: Ytha inicialmente não alcançava D por falta de pontos intermediários na travessia; Lua não tinha espaço para magia no ponto entre cadeiras (ensaio transferido para a aproximação livre de sua posição inicial). Disponibilidade social foi refinada para não depender da coincidência de dois finais de tarefa nem deixar pares familiares monopolizarem os demais. Ao incluir o mundo BF-4E real, a medição por corda de 500 ms acusou falsos cruzamentos em curvas; o teste passou a conferir cada segmento de 100 ms, preservando os asserts. O teste de renderer passou a respeitar a latência semântica de até 250 ms. A simulação longa excedeu inicialmente 5 s de CPU; reutilização das conexões geométricas estáticas e cache limitado corrigiram o trabalho redundante, **sem aumentar timeout, skip, retry ou remover assert**. Lint detectou mocks/atributos insuficientemente tipados, corrigidos sem `any`/casts cegos. Todos os resultados anteriores são intermediários; o gate Vitest final foi PASS.

E2E dirigido: a primeira tentativa falhou por seletor `summary` ambíguo após a inclusão do detalhe interno de vínculos. O seletor passou a apontar para o `summary` filho direto em todos os casos de habitantes (inclusive F1/F2), preservando asserts e timeouts. A segunda tentativa F3 passou em 7,3 s. Essa falha nova do teste foi diagnosticada e corrigida, sem atribuição à dívida anterior. O E2E global não foi executado localmente.

APK: `android/app/build/outputs/apk/debug/app-debug.apk`, **10.568.395 bytes**, SHA-256 `54262c9f0e4aa4fd54cb8d817afec3d27e3835745337c642b85a9934e8200ff7`. Conferência do ZIP confirmou os bundles inicial e Three idênticos byte a byte aos artefatos aprovados de `dist`. Sem instalação automática, dados pessoais ou keystore versionado.

As dívidas existentes **#4, #11 e #15** não foram investigadas nesta fase. Nenhuma falha nova da F3 será automaticamente atribuída a elas. CI remota somente será descrita após resultado real. A F2 foi integrada por exceção CI; este relatório não transfere aquela exceção para a F3.

## Roteiro dirigido Moto G06

1. Instalar manualmente o APK debug atualizado preservando os dados. Abrir a Biblioteca e **observar sem selecionar personagens**. Aproximar a câmera: notar iniciativas, trabalho, repouso, caminhada de pesos distintos, orientação, asas e acessórios; circular entre A–E para acompanhar travessias.
2. Abrir brevemente Habitantes para localizar quem está se encontrando; fechar o painel e acompanhar ambos no canvas. Registrar chegada, espera, orientação mútua, gestos e reconhecimento. Observar as seis dinâmicas ao longo da sessão; não há promessa de que todas ocorram no primeiro minuto.
3. Acompanhar Lua em D: ensaio, folio chamuscado, constrangimento, chegada da ajuda, reparo luminoso e retorno intacto. Conferir texto e mudança do vínculo, sem efeito em registros. Registrar clareza artística e ritmo, inclusive se o acidente demora ou uma aproximação é cancelada.
4. Durante um percurso/encontro, selecionar pelo canvas e React e usar ações F2; conferir parada, highlight, posição preservada e retomada. Testar caminho ocupado, gestos indisponíveis por espaço e funcionamento das quatro pessoas. Usar pan/pinch/zoom, abrir/editar/retornar aos seis tipos e concluir o segredo BF-4E.
5. Background/retorno e retrato/paisagem durante atividade; movimento reduzido antes/durante deslocamento (sem salto) e retomada; sair e reentrar reinicia somente a sessão ficcional. Validar fallback e leitura/foco/ordem/anúncios com TalkBack. Registrar fluidez, aquecimento e duração real, sem extrapolar métricas pontuais.

Riscos residuais: legibilidade dos gestos/folio e distâncias sociais na câmera ortográfica, estilo dos gestos F2 reutilizados, possíveis esperas/cancelamentos em passagens estreitas, ação manual ampla indisponível em local apertado e necessidade do gate físico com coleção representativa. Não há engine física universal nem garantia de ausência de toda oclusão. R-14/R-15 recebem mitigação técnica, não encerramento humano; R-19 e TalkBack permanecem abertos.

## Arquivos da entrega

Núcleo: `inhabitantAgency.ts`, `inhabitantEncounters.ts`, `inhabitantNavigation.ts`, `inhabitants.ts`. Mundo: `three/inhabitantObstacles.ts`, `three/inhabitantSceneProps.ts`, `three/inhabitantAnimator.ts`, `three/inhabitantVisuals.ts`, `three/ThreeWorldRuntime.ts`, `livingObjects.ts`. Ponte/React: `worldRuntime.ts`, `WorldHost.tsx`, `InhabitantLife.tsx`. Testes: `inhabitantAgency.test.ts`, `InhabitantLife.test.tsx`, `WorldHost.test.tsx`, `livingObjects.test.ts`, `three/inhabitantAnimator.test.ts`, `three/ThreeWorldRuntime.test.ts`, `e2e/bf4-inhabitants.spec.ts`. Documentação: este relatório, STATUS, ROADMAP, plano técnico BF-4F, direção artística, RISKS, índice e CHANGELOG. Nenhum asset GLB, fonte Blender, dependência, schema ou versão alterado.
