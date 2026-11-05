# BF-5.5 — O Despertar da Biblioteca | Plano e contrato de fase

**Data:** 05/11/2026  
**Estado:** planejamento aprovado pelo proprietário e registrado na `main`; **implementação não iniciada neste registro**.  
**Ordem vigente:** BF-5 (encerrada com ressalvas) → **BF-5.5 — O Despertar da Biblioteca** → BF-6 (habitantes/RPG) → BF-7 (consolidação funcional e assistiva).  
**Decisão de sequência:** [ADR-023](decisions/ADR-023-bf-5-5-despertar-da-biblioteca.md). **Histórico da BF-5:** [fechamento formal](BF-5_FECHAMENTO_2026-11-05.md).

> **BF-5.5A — candidata na PR draft #32:** checkpoint versionado dos habitantes, restauração geométrica, armazenamento na tabela `settings` já coberta por backup v6 e saves em lifecycle. **Implementação em branch separada, ainda não validada fisicamente nem integrada à main.** [Relatório](BF-5_5A_RELATORIO.md) · [PR #32](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/32). Frentes B–G continuam planejadas.

## 1. Visão e objetivo de produto

Transformar o cenário 3D existente em um lugar persistentemente habitado e visivelmente encantado. A arquitetura, a iluminação e os objetos devem responder às rotinas dos quatro habitantes e às atividades reais do jogador; as interações precisam acontecer **fisicamente na cena**, com consequências observáveis, não apenas por texto ou gestos decorativos. A experiência deve preservar a identidade de fantasia sobrenatural, com magia regularmente presente e momentos espetaculares, mantendo legibilidade, conforto e operação mobile.

Esta fase prepara o ambiente para a futura BF-6; **não** implementa agora exploração de masmorras, combate, árvores de habilidades, grandes campanhas, LLM generativa ou o RPG completo.

## 2. Baseline verificado antes do planejamento

- BF-5 encerrada em 05/11/2026 no escopo aprovado, com CI E2E global ainda vermelha e dívidas #21–#24; `WorldHost` permanece residente entre abas na sessão do shell, mas isso **não** equivale a persistência entre inicializações do aplicativo.
- `InhabitantAgency` recria habitantes em posições/rotinas iniciais por instância, com estado em memória e semente padrão; `ThreeWorldRuntime` a constrói na montagem. Não há restauração durável das poses/intenções dos quatro.
- `LivingSession` mantém estado ambiental efêmero; `livingVisuals.ts` já usa `PointLight` para uma luminária interativa e o braseiro, mas não há ritual completo de iluminação distribuída. `actFromInhabitant` atualmente limita ações de NPCs a planta/globo/relógio.
- A apresentação usa Three.js/WebGL, câmera ortográfica, snapshots lógicos e seleção por `entryId`/`instanceId`; as categorias convencionais continuam sendo seis tipos técnicos. O mundo 3D não deve acessar Dexie diretamente.
- A persistência convencional de livros, anotações, estudos, sessões e mídia foi ampliada na BF-5, mas seus contratos devem ser auditados antes de projetar eventos/estados específicos para o mundo.

Esses pontos são **diagnóstico do baseline**, não funcionalidades já entregues na BF-5.5.

## 3. Escopo criativo e funcional

### BF-5.5A — Continuidade e persistência dos habitantes

- Persistir/reconstruir localmente, de modo versionado e recuperável, **posição, orientação, atividade/intenção, destino, objeto reservado/manipulado e estado de ocupação** dos quatro habitantes. Distinguir estado durável da pose/interpolação visual por frame.
- Registrar checkpoints em transições relevantes, pausas e momentos controlados; não gravar IndexedDB a cada frame, nem assumir que o encerramento do processo sempre permite um último salvamento.
- Ao reabrir, reconciliar o checkpoint com a geometria e os objetos atuais: posição válida, circulação livre, reservas expiradas, sessões concluídas e estado de iluminação. Corrigir apenas posições inválidas com fallback seguro e documentado.
- Tempo fora do app pode produzir evolução **limitada, plausível e determinável** das rotinas, sem simular segundo a segundo nem prometer processamento em segundo plano. Retorno rápido deve preservar continuidade. Evitar repetição automática da mesma rota/ação inicial e a falsa impressão de reinício.
- Preferências e hábitos simples podem influenciar a variedade das rotinas. Persistência de histórico/relacionamentos complexos e evolução profunda de personalidade pertencem à BF-6, salvo novo aceite.

### BF-5.5B — Tarefas, reservas e manipulação física de objetos

- Ampliar a agência atual, **sem criar um segundo motor concorrente de movimentação**, com tarefas explícitas, prioridades, estados de execução, cancelamento/replanejamento e resultado final observável.
- Modelo de ocupação/lease por objeto e local: um livro só pode estar em um lugar ou nas mãos de um habitante; cadeiras/mesas/pontos de uso não são ocupados simultaneamente de forma impossível.
- Coordenar aproximação, orientação, alcance, gesto, **anexação real ao ponto de mão/apoio**, movimentação conjunta e soltura/devolução. O objeto selecionável mantém a identidade original; não criar duplicata visual com outro ID.
- Prever interrupção por navegação, conversa, mudança de sessão, unload, redução de movimento e perda de WebGL; reconciliar ou liberar reservas sem objetos presos, sumidos ou duplicados.
- Avaliar rig/ossos/âncoras e animações atuais de Samael, Aryn, Ytha e Lua; refinar as animações necessárias para sentar, levantar, pegar, segurar, ler, escrever, entregar e devolver. Não rotular um gesto genérico sem contato como interação física concluída.

### BF-5.5C — Noite e ritual de iluminação

- Preservar a boa apresentação diurna e reconstruir a noturna com **luz ambiente azulada legível** e luminárias/abajures existentes efetivamente luminosos, de distribuição adequada, calor e profundidade visual.
- Quando anoitecer, atribuir tarefas de acender os abajures aos habitantes disponíveis, com deslocamento e interação física; cenas podem acontecer em sequência, sem forçar todos os personagens a abandonar ocupações críticas.
- **Estado de iluminação separado da coreografia:** a condição noturna deve resultar na iluminação funcional independentemente de a tarefa de NPC terminar. Cada luminária e tarefa são idempotentes; interrupção/reabertura não as reinicia em loop. Definir prazo/fallback mágico para concluir a iluminação sem ficar escuro.
- Projetar regra explícita de precedência para controles manuais e para a luminária/segredo existente; não destruir a possibilidade de o usuário interagir com os objetos, nem quebrar a sequência narrativa BF-4E.
- Reconstruir coerentemente ao iniciar já de noite, ao cruzar o horário de mudança com o app aberto, ao retornar de background e depois de reabrir. A base atual usa 06h–18h como período diurno; qualquer ajuste do relógio/controle manual deve ser definido no contrato de execução.

### BF-5.5D — Magia ambiental e pergaminhos vivos

- Separar **ciclo temporal (dia/noite)** da **intensidade/estado encantado**, permitindo dia encantado e noite encantada. Efeitos constantes, porém hierarquizados, com episódios de maior impacto: partículas, inscrições, luzes, objetos e manifestações arcanas distribuídos pelos cômodos, sem poluição visual.
- Projetar uma representação de **um pergaminho por anotação/citação/resumo elegível**, proveniente de livros, estudo ou entretenimento, com **no máximo dez materializados simultaneamente**. Determinar seleção estável (preferencialmente dez elegíveis mais recentes) e atualização de edição, exclusão e novo 11º sem perda do conteúdo subjacente.
- Pergaminhos repousam em superfícies válidas, ocasionalmente voam com brilho e rastros, percorrem rotas seguras, pousam novamente, e podem ser percebidos, recolhidos, examinados e devolvidos por habitantes. Interações físicas devem usar as reservas de B.
- Toque em pergaminho deve levar à anotação de origem quando disponível, preservando o fallback React. **Não renderizar automaticamente texto pessoal legível no 3D nem incluí-lo em telemetria/logs**; projetar metadados mínimos, privacidade e exclusões.
- Não confundir o novo conjunto de pergaminhos pessoais com o pergaminho cenográfico do segredo BF-4E: IDs, proprietários e regras são distintos.

### BF-5.5E — Modelos e identidade de mobília

- Refinar qualidade, proporção, materialidade e variedade das lombadas/volumes nas estantes; mesa de estudo e instrumentos; bancada de trabalho/empreitadas; estação de treino; assentos, abajures e pontos de interação.
- Preservar diversidade e silhuetas reconhecíveis em câmera ortográfica mobile. Móveis devem ter **âncoras e volumes de interação** confiáveis, sem bloquear circulação, picking ou objetos da coleção.
- Procedural e GLB podem coexistir conforme evidência artística. Qualquer GLB produtivo novo ou animado respeita proveniência, licença, fonte editável, pipeline e descarte (ADR-010 e extensão formal quando necessária). Não promover assets/fixtures sem gate.

### BF-5.5F — Resposta às sessões e ações reais

- Conectar **eventos/estados de aplicação confirmados** (não eventos de toque antes do commit) ao mundo sem Dexie no renderer. Auditar primeiro os contratos existentes de sessões, notas e status.
- **Leitura:** ao iniciar sessão do livro `entryId`, o mesmo volume pode sair da estante, deslocar-se a mesa/poltrona/chão válido, abrir e emitir luz suave. Um habitante pode pegá-lo fisicamente, sentar e ler; ao término, liberar reservas e deixá-lo em repouso ou devolvê-lo de modo coerente.
- **Estudo:** sessão ativa torna a mesa uma ocupação disponível; habitante pode caminhar, ocupar a cadeira, sentar, consultar material, escrever e levantar. Priorizar a sessão real sobre a rotina casual.
- **Trabalho e atividade física:** reações ambientais próprias à bancada/estação e habitantes interagindo com elementos apropriados, preservadas as regras de cada categoria. Para entretenimento, mapear reações contextuais sem inventar sessão inexistente.
- Reconciliar sessão que já estava ativa ao abrir app, encerramento fora da Biblioteca, mudança entre telas, reinício, dados excluídos e múltiplas atividades. Nenhum objeto pode se multiplicar ou perder vínculo/picking por isso.

### BF-5.5G — Integração, acabamento e gate físico

- Integrar a transformação **como experiência coesa**, testar localmente os contratos críticos e realizar refinamento artístico com avaliação dirigida no Moto G06; não transformar as letras A–G em sete ciclos obrigatórios de mini-PRs.
- Avaliar iluminação de dia/noite, contraste e legibilidade em zoom, efeitos, trajetória/ocupação dos NPCs, interações com objetos e pergaminhos, feedback, fluidez física e resposta ao toque em retrato/paisagem.
- Preservar gestos de pan/pinch/seleção, lifecycle/pausa/retorno, redução de movimento, caminho React acessível e fallback na indisponibilidade WebGL. Sem RAF individual por objeto, timers descontrolados ou loops de testes/timeouts sem hipótese.

## 4. Diretrizes arquiteturais e decisões antes do código

1. **Fonte da verdade:** entidades, anotações e sessões continuam no domínio/aplicação. Construir adaptador de projeção/eventos para o mundo; `ThreeWorldRuntime` consome dados mínimos e não consulta o banco.
2. **Persistência nova explícita:** antes de implementar A/B, definir esquema/versionamento, atomicidade de checkpoint, invalidação e migração, integridade, exportação/restauração e compatibilidade de backup. O planejamento **não altera agora Dexie v14 nem backup v6**. Nenhum estado de personagem deve tornar restauração convencional insegura.
3. **Autoridade independente:** luz obrigatória da noite não depende do NPC; estado confirmado de leitura/estudo não depende de animação terminar; NPCs representam fisicamente a consequência.
4. **Tempo, cancelamento e recuperação:** distinguir horas reais de delta de animação; atualizar lógica de forma limitada; ações idempotentes com saída segura; reconciliação após interrupção ou reabertura.
5. **Prioridade contextual:** comando do usuário/sessão ativa > ações de restauração e segurança > tarefas sociais/rotina; respeitar exclusão, diálogos e controle manual. Política definitiva de empate/reserva será coberta por testes.
6. **Acessibilidade, privacidade e dispositivo:** informações essenciais seguem acessíveis pela interface semântica, inclusive sem WebGL; evitar conteúdo pessoal exposto em superfícies públicas, logs ou capturas de teste.
7. **Ambição artística primeiro:** não reduzir previamente luzes, animações ou magia com base em receio especulativo sobre o Moto G06; medir e corrigir impactos reais preservando o resultado criativo.

## 5. Cenários mínimos de aceite propostos

- **Continuidade:** sair e voltar entre abas, fechar e reabrir app, pausar/retomar e relançar após interrupção; posições e ocupações compatíveis, sem rotina idêntica reiniciada em toda abertura, e recuperação segura de checkpoint antigo/corrompido.
- **Noite:** abrir direto às 22h, cruzar entardecer com app aberto, interromper NPC no meio do percurso, retornar depois e alterar controle manual; iluminação noturna sempre funcional e completa, sem loop de abajur.
- **Manipulação:** NPC alcança livro/pergaminho, pega e mantém o **mesmo objeto** anexado à mão, senta/usa, solta e devolve; duas ações concorrentes não duplicam nem atravessam objetos ou móveis.
- **Pergaminhos:** 0, 1, 10 e 11+ anotações elegíveis; criar/editar/excluir; rotas de voo e repouso; toque abre anotação correta; nenhum vazamento textual na geometria/diagnóstico.
- **Sessões:** início, continuidade após navegação/relaunch e encerramento de leitura/estudo; correspondência por ID, prioridades e desmontagem sem objetos fantasmas. Reações de trabalho/treino e diferenças dos tipos técnicos permanecem verificáveis.
- **Regressão:** livros e seis tipos selecionáveis por React/canvas, zoom/pan/rotação, objetos e segredo BF-4E, RPG BF-4F, dados convencionais, backup/restore (antes de fechar qualquer mudança de schema), redução de movimento e fallback.
- **Gates:** testes de domínio/estado dirigidos + integração + E2E representativos + inspeção física Moto G06; registrar PASS/FAIL/NOT RUN, desempenho observado e desvios. CI global histórica e TalkBack só serão declarados aprovados mediante execução real, nunca por inferência.

## 6. Método de execução e fronteiras

A implementação será uma reforma integrada com checkpoints técnicos internos necessários, revisão/artística e refinamentos até aceite do proprietário. **Primeira ação executiva sugerida:** auditoria dirigida de schema, backups, sessões, snapshots 3D, iluminação, animações/rig e ciclo de vida, seguida de contrato de persistência/eventos; só então produção. Não há autorização para merge automático, publicação, beta ou apagar dívidas por consequência deste plano.

**Fora da BF-5.5:** exploração controlável de masmorras, combate por turnos, party/progressão de RPG completos e aprofundamento narrativo dos habitantes (BF-6); gate assistivo/funcional global e decisão de beta/release (BF-7). Reparos críticos de integridade podem ser antecipados se necessários à BF-5.5, **sem declarar** as issues #21–#24 resolvidas.

**Estado ao registrar:** proposta aceita para planejamento; zero implementação BF-5.5, zero gate físico/CI novo, zero mudança no banco/backup por este commit.
