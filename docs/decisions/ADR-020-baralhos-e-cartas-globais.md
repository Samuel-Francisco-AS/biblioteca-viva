# ADR-020 — Evolução para baralhos e cartas globais

- Data: 2026-11-04.
- Estado: recomendação arquitetural documentada a pedido do proprietário; **sem migração, schema ou minigame implementados**.
- Complementa ADR-016 e ADR-019; implementação futura exige entrega própria autorizada. Não inicia BF-6 nem cria persistência espacial.

## Evidência atual

`StudyEntry.flashCards?` embute até 1.000 cartas `{id, front, back}` por estudo, com frente até 4.000 e verso até 8.000 caracteres. Unicidade é local ao estudo. `SaveFlashCard`/`DeleteFlashCard` reconsultam o estudo em transação e publicam evento após commit. A revisão atual em `StudyFlashCards` embaralha um snapshot em memória, revela verso, conta lembradas e separa cartas para outra rodada; não persiste histórico de revisão nem agenda. Backup v6 já preserva essas cartas. Esse contrato continua canônico nesta candidata.

## Arquitetura recomendada

Criar um subsistema convencional de memória separado dos seis tipos de registro. Um baralho (`Deck`) possui ID estável, título, tema/apresentação e metadados/revisão próprios. Cada carta (`Card`) possui ID global, um `deckId` e frente/verso independentes. A associação opcional a um estudo é referência de origem, nunca condição de existência. Começar com texto validado; conteúdo rico futuro deve ser estrutura limitada/validada, sem HTML arbitrário, URLs remotas obrigatórias ou bytes grandes embutidos. Arte pertence à apresentação e, se persistida, a uma porta própria com ownership e limites explícitos — não ampliar automaticamente a elegibilidade de `RecordImage` desta entrega.

Separar o estado da carta do progresso de revisão (`CardReviewState`) e da rodada (`ReviewSession`). Uma rodada seleciona IDs e snapshot das faces/ordem, permite lembrar/rever, interromper e retomar fora do fólio de Estudo. Datas e resultados podem servir a retomada/histórico; algoritmo de repetição espaçada e política de retenção devem ser decididos na entrega funcional, sem comprometer um algoritmo especulativo agora. Não introduzir XP, moedas, streaks, placares, conta ou sincronização.

Domínio define invariantes/transições sem React/DOM/Dexie/Three. Aplicação coordena criar/mover cartas, associar/desassociar origem, montar/retomar/concluir revisão e transações; portas de baralhos/cartas/revisão recebem adaptadores Dexie. UI não acessa banco. Eventos somente após commit, revisão esperada para edição concorrente, cancelamento/rollback sem eventos. Índices iniciais a avaliar na implementação: cartas por baralho, origem opcional e estados por carta; sem tabela espacial.

## Transição dos flashcards existentes

Não usar o `card.id` antigo sozinho como chave global: duas origens podem compartilhar esse valor. A migração futura precisa de mapa único e persistido `(studyId, legacyCardId) → globalCardId`, com vínculo de proveniência e política explícita para manter o ID antigo quando não colidir. Preservar IDs dos estudos e texto integral. Um baralho inicial por estudo é uma opção de importação determinística, seguida de organização pelo usuário; o baralho não deve herdar o ciclo de exclusão do estudo.

Preparar upgrade **aditivo**, idempotente e transacional, em versão de banco e contrato de backup próprios, quando o produto da migração estiver implementado. Testar duas origens com IDs de cartas iguais, abertura interrompida/retomada, repetição sem duplicar, rollback, reabertura, exportação/restauração e conteúdo inválido. Não apagar campos legados no primeiro upgrade. Ao promover cartas, definir uma única fonte canônica e adaptar comandos/telas antigos; evitar duas cópias editáveis ou dual write indefinido. Backup deve representar explicitamente baralhos, cartas, revisão, referências opcionais e mapa de origem; aceitar v6 antigo e migrá-lo apenas após validação/restauração segura. Nunca migrar a base pessoal em teste automatizado.

Excluir estudo não deve excluir cartas já independentes: desassociar a referência de origem preservando o baralho. Excluir baralho exigirá decisão explícita sobre suas cartas/revisões e recuperação, com confirmação adequada. Não adotar cascade implícito copiado dos registros atuais.

## Jogo e integração futura

Acesso convencional independente é o primeiro fluxo funcional recomendado. Uma futura construção/item no Canvas solicita à aplicação abrir um baralho/revisão por ID. O mundo recebe somente uma projeção neutra de referência/estado visual mínimo; não transporta faces privadas, imagens grandes ou snapshots de revisão. `WorldHost`/`ThreeWorldRuntime` continuam os hosts aprovados, com pausa/resume e retorno de foco. A localização definitiva do objeto e sua persistência dependem da fase espacial autorizada.

Puxar uma carta, virar em 3D, deslizar e acomodar pilha pertencem ao estado de apresentação da rodada, sem alterar domínio a cada frame. Planejar gestos canceláveis e botões equivalentes para toque/teclado/TalkBack, conteúdo longo, movimento reduzido, suspensão/retorno e rotação. Nenhuma capacidade física é presumida insuficiente; medir gargalos depois de uma implementação artística convincente. A avaliação humana aprova arte/ergonomia, enquanto testes verificam estado e integridade.

## Consequências e escopo desta candidata

A fundação entregue é esta decisão documentada, baseada no código vigente. Cartas atuais, persistência, backup, revisão e mundo 3D permanecem operantes. Não há novas tabelas, stubs, migração de cartas ou animação especulativa. O minigame completo fica para entrega própria, com gates de migração/backup, revisão independente, acesso convencional e somente depois a integração autorizada com o Canvas.
