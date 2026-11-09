> **Rodada paralela autorizada — BV-UXC (09/11/2026):** melhorar continuidade percebida do toque em personagens, dock e Arcanário, preservando o peso artístico. Candidata de PR separada, sem merge. Próximo passo: gates locais disponíveis fora do CI e validação física no Moto G06; a BF-5.6G permanece distinta e não iniciada. [Detalhes e pendências](BV_UX_CONTINUIDADE_TOQUE_2026-11-09.md).

> **MARCO ATUAL — 09/11/2026: BF-5.6F CONCLUÍDA FUNCIONAL/ARTISTICAMENTE EM GATE DIRIGIDO E MERGE NA MAIN.** A [PR #48](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/48) foi integrada por autorização expressa, SHA `690be5b5798d34e6436610bf9d209ede38629fd7`, reunindo F1 + F2 + R1–R4; [fechamento com ressalvas](BF-5_6F_FECHAMENTO_2026-11-09.md). **BF-5.6A–F integradas. Próximo marco planejado: BF-5.6G — auditoria integrada, saneamento, evidências e decisão de fechamento global**, ainda **não iniciada nem autorizada automaticamente**. Prioridades G: E2E orbital timeout, seis timeouts gráficos da suíte anterior, CI sem cota, TalkBack/termal/memória, rastreabilidade e avaliação de riscos. Balanceamento Ruína/Conhecimento e retrabalho global UI/UX do Arcanário persistem como dívidas explícitas (não foram resolvidos pela arena). Notas antigas de candidata/merge pendente abaixo são história.

> **Próximo gate — refinamento F (09/11/2026):** avaliar no Moto G06 a lua orbital/rotação/picking, o cenário ritual, as 48 pinturas/molduras e os efeitos confirmados, preservando fluidez e ergonomia em retrato/paisagem. [Roteiro R4](BF-5_6F_ARENA_VIVA_IMPLEMENTACAO.md#refinamento-r4--validação-e-entrega). Mesma PR draft #48. Não reabrir motor já testado sem defeito comprovado; aceite artístico e G/merge continuam decisões independentes.

> **Atualização F2 — 09/11/2026:** arena/órbita implementadas como candidata na PR draft #48; próximo passo é avaliação humana no Moto G06 pelo [roteiro F2](BF-5_6F_ARENA_VIVA_IMPLEMENTACAO.md). F1+F2 permanecem na mesma PR. G continua planejada para auditoria integrada após avaliação/autorização, sem execução nesta missão. Reforma transversal do restante do Arcanário, balanceamento e dívidas assistivas/performance preservados.

> **BF-5.6F — DIVISÃO AUTORIZADA (09/11/2026):** **F1 fundação técnica pelo assistente diretamente na branch/PR remota dedicada** + **F2 implementação 3D/visual pelo Codex na mesma PR draft**. Não criar PRs separadas, não integrar F1 isoladamente à main. F1 entrega projeção filtrada do duelo, contrato de ações, lifecycle, shell fullscreen/rota reservada (fallback 2D) e handoff; [relatório e contrato F2](BF-5_6F_F1_HANDOFF.md). F2 entrega arena de game fullscreen sem rolagem da página, HUD e ações contextuais, construção orbital/3D e teste Moto G06; inspirar-se na ergonomia mobile de Duel Links sem copiar IP. Regras E imutáveis no motor; não montar dois mundos 3D permanentes. F2/gate/merge futuros ainda não concluídos. CI, artes, equilíbrio e retrabalho de outras áreas do Arcanário continuam como dívidas.

> **DIRETRIZ NOVA PARA BF-5.6F / REFORMA ARCANÁRIO — 09/11/2026:** proprietário definiu como modelo de experiência a **arena mobile Yu-Gi-Oh! Duel Links**, reinterpretada originalmente. **Duelo fullscreen, todo o jogo na mesma tela do Moto G06, sem rolagem de página, sem blocos permanentes de instrução/texto de interface;** HUD e ações contextuais, inspeção sobreposta, mão acessível, dock global oculto e nenhum controle sob safe areas. 3D deve ser a apresentação de um game, reutilizando motor E, sem cópia de assets ou regras de Duel Links. Gate físico/UX específico obrigatório; priorizar coesão antes de construir uma arena custosa. [Contrato detalhado](BF-5_6_ARCANARIO_PLANO.md). Registro apenas de requisito, **sem início de F ou reforma**.

> **RUMO VIGENTE — 09/11/2026: A–E integradas à main.** A E/PR #47 foi aprovada **somente como primeira versão funcional**, merge `19eb076a`; [fechamento com ressalvas](BF-5_6E_FECHAMENTO_2026-11-09.md). **Prioridade de planejamento:** uma **fase/rodada futura dedicada à reformulação da UI/UX do Arcanário inteiro**, especialmente a mesa de combate no Moto G06 (mão truncada, dock+comandos sobrepostos, scrolls longos, insets Android) e evolução da arte procedimental abstrata. Não confundir com mero CSS local ou com o aceite funcional; a ordem frente à **F (arena e construção orbital 3D)** deverá ser acordada para evitar retrabalho. **G** conserva auditoria e fechamento; dívida de balanceamento Ruína/Conhecimento, testes amplos/CI/TalkBack/termal e preservação de dados permanecem abertas. **Nenhuma F/G/reforma está implementada ou automaticamente autorizada nesta integração.** Notas abaixo são cronologia.

## Próximo gate aprovado — candidata BF-5.6E (09/11/2026)

Concluir revisão da PR draft e realizar gate funcional/artístico no Moto G06: atualização sobre A–D, seis registros, catálogo/Oficina/decks, duelos das quatro tradições, Criador/Livre, retomada após segundo plano/encerramento, backup e retorno ao Canvas. Balanceamento ainda favorece Ruína e desfavorece Conhecimento no ensaio de IA; refinamento futuro exige evidência humana, sem alegar competitividade. [Roteiro e limitações E](BF-5_6E_TCG_DUELO_ARCANO_IMPLEMENTACAO.md). F continua reservada à arena/construção orbital/3D usando o motor E; G à auditoria/encerramento. Nenhuma implementação F/G/BF-6 ou merge da E autorizado por esta entrega. Ressalvas A–D/BF-5.5 preservadas.

> **MARCO ATUAL — 09/11/2026:** BF-5.6A/B/C/D **integradas à `main`**, fechando o recorte educacional por aceites dirigidos; D teve **6/6 PASS no Moto G06** e merge autorizado da [#46](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/46), commit `b3db5d87`. [Registro de fechamento D](BF-5_6D_FECHAMENTO_2026-11-09.md). **Próximo escopo planejado: BF-5.6E — TCG estratégico** (duelista, cartas oficiais originais, quatro afinidades, IA local PvE e editor autoral); F continua reservada à construção orbital/arena 3D e G à auditoria/encerramento global. Nenhum merge futuro ou implementação E–G fica automaticamente autorizado por este fechamento. Preservar dívidas CI/E2E Canvas, TalkBack, memória/termal, histórico, armazenamento e bloqueio editorial de ENEM/CNU. As notas antigas abaixo são cronologia.

> **BF-5.6D — candidata autorizada (09/11/2026):** implementação contínua D1–D3 de pacotes/lotes locais, Biblioteca de Provas e acervo expansível. Próximo trabalho aprovado: gate Moto G06 e refinamento integrado A–D, revisão editorial para liberar futuras questões autênticas e auditoria da PR draft. E/F/G seguem planejadas e exigem pedido próprio de execução; sem merge/fechamento automático. [Entrega e pendências](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md). As notas anteriores preservam a cronologia.

> **Rumo vigente — 09/11/2026:** A, B e C do Arcanário integradas na `main` (PRs #43/#44/#45, merges sequenciais). O proprietário autorizou a integração **com gate Moto G06 parcial** para evitar pilha extensa; reparos de etiquetas e contraste estão no código integrado, aguardando revalidação Android. Antes da BF-5.6D, priorizar a pequena revisão física dessas correções e manter como dívidas os testes incompletos A+B+C, Canvas, CI, TalkBack, termal/memória, backup restore destrutivo apenas em base descartável. BF-5.6D (pacotes oficiais) **não autorizada/implementada por esta integração**; E/F/G ainda planejadas. A fase BF-5.6 permanece aberta; [gate parcial](BF-5_6ABC_GATE_PARCIAL_REPAROS_2026-11-09.md). Notas abaixo são cronologia.

> **Próximo gate aprovado — A+B+C conjunto (08/11/2026):** auditar a candidata C e validar no Moto G06 migração, reparos da Oficina, questões, taxonomia, baralhos, dez exercícios, correção, pausa/reabertura, diagnóstico/arquivos e arte/ergonomia. [Roteiro e limitações](BF-5_6C_PROVACOES_DIAGNOSTICO_IMPLEMENTACAO.md#roteiro-moto-g06--gate-conjunto-abc). Após aceite explícito, tratar separadamente a integração A → B → C na main; nenhum merge nesta missão. D–G/BF-6/7 continuam futuras e sem execução autorizada. Notas anteriores abaixo são cronologia.

> **Próximo gate — BF-5.6A+B conjunto (08/11/2026):** avaliar a candidata B dependente da PR #43 pelo [roteiro Moto G06](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md#roteiro-físico-conjunto-ab), conferir integridade/migração/backup, Oficina/coleções/Ecos/Relicário e arte/ergonomia. Refinamentos somente conforme evidência e feedback. Integrações futuras A → B exigem aceite e autorização próprios; nenhum merge/fechamento automático. C–G permanecem planejadas, sem execução autorizada; BF-6/7 futuras. Notas anteriores abaixo são cronologia.

> **PRÓXIMO GATE — BF-5.6A (08/11/2026):** auditar a candidata da fundação, validar upgrade/Estudos/revisão/backup v7 e importação v6 no Moto G06, registrar feedback e decidir aceite/integração. [Relatório e limites](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md). BF-5.6B–G permanecem planejadas, sem execução autorizada por esta entrega; BF-6/BF-7 futuras. Não apagar as ressalvas da BF-5.5. Esta nota substitui indicações anteriores de A ainda não iniciada.

> **PLANEJAMENTO VIGENTE — 08/11/2026: inserir BF-5.6 — O Arcanário antes da BF-6.** Ordem: **BF-5 (fechada) → BF-5.5 (fechada com ressalvas) → BF-5.6 (planejada, não iniciada) → BF-6 (mundo/RPG) → BF-7 (consolidação)**. A fase BF-5.6 compreende **A** fundação/migração de flashcards, **B** Oficina/Relicário/coleções, **C** questões/tags/diagnósticos, **D** pacotes oficiais expansíveis, **E** TCG estratégico PvE e cartas autorais, **F** arena 3D orbital/arte, **G** auditoria e aceite. Marco Educacional A–D e Fantástico E–G, com integrações e gates distintos. Plano: [BF-5.6 — O Arcanário](BF-5_6_ARCANARIO_PLANO.md); contrato: [ADR-020 revista](decisions/ADR-020-baralhos-e-cartas-globais.md). **Somente planejamento/documentação autorizado agora; BF-5.6A requer autorização específica.** Nenhuma implementação, CI/gate, merge de código, backend ou BF-6 iniciados; ressalvas da BF-5.5 permanecem. Registros anteriores abaixo são cronologia.

> **08/11/2026 — BF-5.5 fechada por exceção técnica e aceite humano.** A–E e F parcial já integradas; F2 foi aprovada no Moto G06 (5/5 grupos) e G foi considerada suficiente para fechar apesar do acabamento ainda imperfeito. Merge ordenado autorizado: #41→main, depois #42→main. Dívidas: HUD paisagem E2E integrado sem PASS, refinamentos de Ytha/locomoção/ergonomia, limitações F2, quests R5, CI/TalkBack/memória. **Próximos capítulos:** BF-6 (RPG/mundo) e BF-7 (consolidação funcional/assistiva), sem implementação automaticamente autorizada. [Decisão formal](BF-5_5_FECHAMENTO_2026-11-08.md). Prioridades anteriores abaixo são históricas.

> **PRÓXIMO GATE — BF-5.5G (08/11/2026):** avaliar a candidata de refinamento no Moto G06 pelo [roteiro G](BF-5_5G_REFINAMENTO.md#roteiro-moto-g06), com arte individual dos quatro habitantes, navegação/HUD e preservação da F2 já aprovada funcionalmente. Registrar feedback e refinar apenas o necessário ao aceite; **fechamento da BF-5.5 depende de decisão final do proprietário**, sem merge automático. BF-6/RPG, BF-7, release/beta e recuperação global não iniciados/autorizados por esta entrega. As notas abaixo são cronologia.

> **DECISÃO DE 08/11/2026 — programa de recuperação R1–R5 concluído no escopo aprovado**, com ressalvas explícitas: leve engasgo residual das quests, E2E/CI, retenção heap/DOM, profiling Android sustentado e TalkBack. R1–R4 já integradas; integração da R5 via [PR #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40). A sequência planejada retorna a **BF-5.5 parcial (F2B/F2C, leitura sentada, gate G)** antes de BF-6/RPG e BF-7/consolidação, sujeita a planejamento e autorização próprios; nada é iniciado automaticamente. [Relatório formal](audits/BV_FECHAMENTO_RECUPERACAO_R1_R5_2026-11-08.md). As prioridades R5P/Q/R abaixo são cronologia, não trabalho pendente para reabrir R5.

> **Gate R5R (08/11/2026):** proprietário deve avaliar abertura/reabertura/troca de quests e leitura mágica de Samael, Aryn, Ytha, Lua, pergaminho e livro ativo, preservando a fluidez geral/noturna já aprovada nas versões anteriores. Sem merge, nova fase ou R5 concluída. [Candidata e roteiro](audits/BV_POLIMENTO_R5R.md#roteiro-moto-g06).

> **Próximo gate R5Q residual (08/11/2026):** comprovar apenas abertura/reabertura/troca de quests no Moto G06, usando diagnóstico local opt-in se o engasgo persistir. Início noturno e fluidez geral já receberam PASS físico dirigido; preservar esses mecanismos. R5/arte continuam abertas, sem merge ou fase nova. [Roteiro e limites](audits/BV_SANEAMENTO_R5Q.md#roteiro-físico-limitado-às-quests).

> **Prioridade R5Q (08/11/2026):** verificar no Moto G06 atmosfera correta desde a abertura e seleção/quests sem travamentos, preservando a melhora relatada da R5P. Sem merge, R5 encerrada ou nova fase. [Candidata e roteiro](audits/BV_SANEAMENTO_R5Q.md).

> **Prioridade vigente — R5P (07/11/2026):** comprovar fluidez diurna/noturna da candidata no Moto G06, comparando shader original/candidato pelo diagnóstico sem reconstrução. Só retomar avaliação artística de Samael/Aryn/Ytha/Lua após navegação satisfatória; R5/R5E e recuperação integral abertas. Sem merge ou próxima fase autorizados. [Candidata, limites e roteiro](audits/BV_SANEAMENTO_PERFORMANCE_R5P.md).

> **Após R5E:** reavaliar individualmente os quatro habitantes no Moto G06 e responder ao feedback no escopo R5, mantendo PR #40 draft. R5/R5E não encerradas; R6 não iniciada. Hover não entrega voo livre, assento ou F2B/F2C. [Candidata e roteiro](audits/BV_RECUPERACAO_R5E.md).

> **R5 — candidata em implementação (07/11/2026):** R5A–D candidatas publicadas na [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), sobre main `7100ff6` integrada com R4. Quatro GLBs remodelados, skins reais, oito clips reconstruídos, sockets explícitos e descarte de Skeleton. 950 unitários PASS; E2E dirigido 0/2 após correção de preparação, sem retries; APK debug gerado; aceite artístico individual/Moto G06 pendentes, assento/F2B/F2C não entregues, CI remota omitida por cota. Recuperação integral aberta. [Relatório vigente](audits/BV_RECUPERACAO_R5.md) · [Pipeline](INHABITANT_ART_PIPELINE.md). Notas abaixo preservam a cronologia.

> **Após integração R4 (07/11/2026):** preservar dívida E2E R2, pendências assistivas, memória host e BF-5.5 parcial. Recuperação integral segue aberta; R5 não iniciada e requer autorização própria. [Integração](audits/BV_INTEGRACAO_PR39_R4_2026-11-07.md). Notas abaixo são cronologia.

> **Próximo trabalho autorizado — pós-R4 (07/11/2026):** validar no Moto G06 o relógio e o fólio reformado, registrar feedback e refinar dentro do saneamento de leitura. Preservar R4A–D e dívidas; R5, F2B/F2C, rigs/leitura sentada e BF-5.5G não iniciadas. [Roteiro e limites](audits/BV_SANEAMENTO_POS_R4_LEITURA.md).

> **Próximo gate aprovado — R4 candidata:** concluir validação técnica local e validar fisicamente no Moto G06 conforme [relatório R4](audits/BV_RECUPERACAO_R4.md). Main integra R1–R3/segurança; BF-5.5 parcial. R5, F2B/F2C, rigs/leitura sentada e BF-5.5G exigem autorização própria. Sem merge/release autorizado. Notas datadas abaixo são cronologia.

> **MARCO DE INTEGRAÇÃO — 07/11/2026:** o código cumulativo das PRs #32–#38 foi autorizado para a `main` após ensaio sem conflitos, preservação das duas linhagens e correção Prettier no workflow de preview Android. R1–R3 e segurança aprovados em teste dirigido pelo proprietário; falha E2E de seleção/highlight aceita **como dívida**, sem CI verde. BF-5.5F segue parcial (F2B/F2C, leitura sentada/rigs), G e demais gates pendentes; **R4 é a próxima rodada do programa de recuperação, não iniciada; R5 também permanece futura**. [Decisão, testes e ressalvas](audits/BV_INTEGRACAO_PR32_38_2026-11-07.md). Cronologia abaixo descreve estados anteriores.

> **Após R3 — 07/11/2026:** validar candidata A/B/C no Moto G06 pelo [roteiro R3](audits/BV_RECUPERACAO_R3.md#estado-da-candidata-e-gate-físico), incluindo retenção/memória ainda não atribuída no harness. R4/R5 e recuperação integral continuam abertas, sem antecipação de implementação; BF-5.5F2B/F2C permanecem pendentes.

> **R3 em execução — 07/11/2026:** A implementada em candidata; publicar A antes de B (BV-10) e B antes de C (BV-15), conforme [missão vigente](audits/BV_RECUPERACAO_R3.md). Gate Moto G06 depois de R3C; R4/R5 permanecem futuras, sem execução nesta missão.

> **PRÓXIMA ETAPA — 07/11/2026: R3 autorizada para continuação em conversa nova.** R2 e saneamento receberam aceite dirigido no Moto G06: melhora considerável do Canvas, novas representações aprovadas e Livro da Estrela corrigido. Em PR draft #38, sem merge: **R3A BV-05/06/08 (loop/livro/alocações) → R3B BV-10 (agência/interações) → R3C BV-15 (lifecycle/memória)**, cada uma com commit/push. Preservar arte aprovada e R1/R2; R4/R5 e E2E/CI seguem abertas. [Resumo e comandos de retomada](audits/BV_RETOMADA_R3_2026-11-07.md). O teste Moto solicitado nas notas antigas já ocorreu.

> **Próximo passo vigente após saneamento pós-R2 (06/11/2026): novo teste no Moto G06.** Validar abertura/fechamento/página/lifecycle do Livro da Estrela, arte dos quatro registros e interação no mesmo catálogo. Lag/travamentos remanescentes não foram declarados resolvidos. R3/R4/R5 continuam futuras e abertas; não iniciá-las nesta rodada nem integrar a PR draft #38. [Candidata e roteiro](audits/BV_SANEAMENTO_POS_R2.md). Esta indicação substitui a recomendação anterior de avançar diretamente a R3.

> **Próximo após a R2 candidata (06/11/2026): R3 — loop/agência/efeitos/lifecycle.** R2 tem 900 unitários PASS e evidências das três frentes; E2E React/persistência e gate físico/artístico seguem pendentes, sem recuperação integral concluída. R4 deve classificar o bloqueio novo de cobertura React junto às dívidas de CI/dados; R5 conserva pipeline/rigs/GLBs. Não executar R3/R4/R5 por implicação desta entrega R2. [Validação consolidada](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md#validação-consolidada-r2-e-pendências-explícitas).

> **Recuperação R2 — implementação 06/11/2026:** A/B publicadas; C em fechamento/publicação e validação consolidada. Próxima rodada recomendada **R3 — loop, agência, efeitos em repouso e lifecycle**, preservando câmera/picking R1, colliders/grafos e seis assets R2. R4 dados/observabilidade/backup/CI e R5 pipeline/rigs seguem abertas. Gate Moto G06 e aceite artístico dos seis registros continuam próprios, sem recuperação integral encerrada. [Plano](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md).

> **Recuperação R2B — 06/11/2026:** R2A remota `50f425d`; publicar B íntegra e então executar C (representações concretas dos seis registros), seguida da validação consolidada. R3/R4/R5 abertas; desempenho físico e arte continuam gates próprios. [Plano](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md).

> **Recuperação autorizada — R2A implementada (06/11/2026):** publicar R2A antes de R2B (renderização), depois publicar R2B antes de R2C (seis representações); finalizar com validação consolidada. R3 loop/agência/lifecycle, R4 dados/observabilidade/backup/CI e R5 assets permanecem futuras e abertas. [Plano vigente](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md).

> **Prioridade autorizada — recuperação R1–R5 (06/11/2026):** concluir/publicar R1 input e picking; depois R2 navegação/colisores/render/representações, R3 loop/agência/lifecycle, R4 dados/observabilidade/backup/CI, R5 assets/pipeline, com push de cada checkpoint antes do seguinte. [Plano e matriz](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md). Próxima implementação: baseline BV-02/BV-03 na F completa, após publicação da R1. Gate Moto G06 pendente. Não antecipa novas features F2B/C, BF-6, migração de engine ou merge das candidatas.

> **Próximos passos F2 — 06/11/2026:** núcleo físico F2A publicado parcialmente na #37 (`43d2c82`); completar manipulação por habitante e leitura sentada, depois F2B (estudo/ocupação exclusiva) e F2C (trabalho/treino/entretenimento), publicando cada checkpoint autorizado. [Limites e evidências](BF-5_5F_RELATORIO.md). Antes de integrar F2B, resolver colisões dos rigs com a cadeira e provar aproximação/sentar/levantar; a pose final isolada de Lua não conclui o assento. G permanece reservado, não iniciado. Preservar base E e reconciliar F1/main somente na futura integração autorizada.

> **BF-5.5F — checkpoint F1:** projeção real de sessões e resposta ambiental inicial; animações de livros/habitantes e provas de concorrência planejadas para F2. [Relatório](BF-5_5F_RELATORIO.md). Nenhuma PR A–E foi integrada automaticamente; gate físico permanece G.

> **BF-5.5E em candidata — 05/11/2026:** mobília reformulada e integrada aos contratos B/C/D; [relatório](BF-5_5E_RELATORIO.md). Próximos trabalhos previstos: F, resposta a sessões reais; G, integração e gate artístico/físico no Moto G06. **F/G não iniciadas e sem autorização automática por esta entrega.** Manter revisão da stack #32–#35 e da candidata E, sem merge ou encerramento implícito. As indicações antigas de E como ainda não implementada são cronologia anterior.

> **BF-5.5D — saneamento na PR draft #35:** contrato neutro, liberação de leases no handoff/descarte, voo validado entre móveis, reações dos quatro habitantes e acesso à anotação/citação específica. [Relatório vigente](BF-5_5D_RELATORIO.md). Sem merge, CI global verde ou aceite físico; avaliação Moto G06 acumulada para G. E/F permanecem futuras.

> **BF-5.5D — candidata em revisão (05/11/2026):** magia ambiental independente do relógio e até dez projeções de notas/citações, com voo local, interação pela agência B e acesso ao registro original. Base C `8cc12c2`; sem merge ou aceite físico. Limites (rotas locais, rig, foco da anotação e validação WebGL) e evidências no [relatório](BF-5_5D_RELATORIO.md). BF-5.5 permanece aberta; refinamento físico em G e E/F ainda pendentes.

> **BF-5.5C em candidata (05/11/2026):** noite azulada legível, nove abajures físicos luminosos, fallback mágico e ritual autônomo idempotente com checkpoint local. [Relatório](BF-5_5C_RELATORIO.md) · [PR draft #34](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/34). Encadeada às PRs #33/#32; **sem merge, gate físico ou CI global verde confirmado**. BF-5.5D–G continuam planejadas.

> **BF-5.5B em candidata (05/11/2026):** leases exclusivos e ciclo físico do livro cenográfico sobre a BF-5.5A, sem nova migração. **Sem merge, gate físico ou CI global verde confirmado.** [Relatório](BF-5_5B_RELATORIO.md). B permanece encadeada à PR #32; C–G e BF-6 não foram iniciadas.

> **BF-5.5A em candidata na PR draft #32 (05/11/2026):** continuidade local dos quatro habitantes, checkpoint seguro de pose/intenção e restauração antes da montagem do mundo. **Sem merge, gate físico ou CI global verde confirmado.** [Relatório](BF-5_5A_RELATORIO.md).

## PLANEJAMENTO VIGENTE — 05/11/2026: BF-5.5 inserida entre BF-5 e BF-6

Por autorização do proprietário, após o fechamento da BF-5, foi planejada a **BF-5.5 — O Despertar da Biblioteca**. As candidatas A–E implementam continuidade, tarefas/manipulação, iluminação, magia/pergaminhos e reforma da mobília em branches encadeadas. Resposta às sessões reais (F) e gate integrado (G) permanecem futuros. [Plano e contrato](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md) · [ADR-023](decisions/ADR-023-bf-5-5-despertar-da-biblioteca.md).

**Nova ordem:** BF-5 ✅ → BF-5.5 ⏳ → BF-6 (habitantes/RPG) ⏳ → BF-7 (consolidação) ⏳. A cronologia anterior abaixo, inclusive a indicação de BF-6 como próximo passo, descreve o estado **anterior a esta decisão**, não o planejamento vigente. As ressalvas técnicas da BF-5, issues #21–#24 e ausência de CI E2E global verde permanecem. Não há entrega BF-5.5, gate novo, beta ou release neste registro.

## Estado vigente em 05/11/2026 — BF-5 encerrada no escopo aprovado

A **BF-5 — Reforma Global de UI/UX** foi integrada à `main` pelas PRs #25–#30, com aceite artístico/funcional dirigido no Moto G06 e **exceções técnicas registradas**, sem CI E2E global verde. [Fechamento formal e commits de merge](BF-5_FECHAMENTO_2026-11-05.md).

**Próximo passo: planejamento independente da BF-6 — Mundo Vivo/RPG**, aprofundando personagens, exploração, diálogos, interatividade e sistemas de RPG, a definir com o proprietário. **BF-7 permanece futura**, com testes globais, estabilidade, acessibilidade, TalkBack e gate de consolidação. Dívidas [#21](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/21), [#22](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/22), [#23](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/23) e [#24](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/24) não foram encerradas por implicação; integridade de dados é prioritária quando relevante. **Não há autorização automática para BF-6, BF-7, beta ou release.** Os planos de avaliação da BF-5 abaixo são registros históricos anteriores ao fechamento.

## BF-5 — revisão do Atlas clássico

Candidata estática projetada substitui o atlas articulado por solicitação do proprietário. Próximo trabalho aprovado: apreciação/refinamento desta apresentação e validação física acumulada no Moto G06, mantendo Empreitadas e avaliações. Sem encerramento BF-5 ou avanço automático à BF-6. [Relatório](BF-5_ATLAS_CLASSICO_PROJETADO.md).

## BF-5 Parte 2F — continuidade aprovada

Empreitadas, Atlas Vivo e avaliações implementados como candidata sobre a PR #29; [entrega](BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md). Próximo trabalho aprovado: apreciação/refinamento da candidata e validação física ampla acumulada no Moto G06. BF-5 permanece aberta; BF-6/BF-7 e dívidas #21–#24 não são encerradas nem executadas por esta entrega. Sem merge automático.

# BF-5 Parte 2E — sequência vigente (2026-11-04)

Candidata de seletores internos, capas por registro e ateliê compartilhado entregue para revisão sobre a PR #28; [contrato e pendências](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md). Próxima avaliação: instalar APK preservando dados e executar o roteiro dirigido no Moto G06; refinar com feedback, sem encerrar BF-5 ou realizar merge automático. Testes físicos amplos acumulados para fase posterior por opção do proprietário.

Baralhos/cartas globais e revisão independente ficam em entrega própria futura. [ADR-020](decisions/ADR-020-baralhos-e-cartas-globais.md) recomenda arquitetura e transição, **sem autorizar migração ou minigame 3D nesta candidata**. Ordem BF-5 → BF-6 → BF-7 da ADR-014 preservada.

> **Próxima avaliação aprovada — Parte 2D (2026-11-04):** revisar a candidata de [Entretenimento](BF-5_PARTE2D_ENTRETENIMENTO.md), encadeada à #27; acumular a validação física/artística das Partes 2/2B/2C/2D para a rodada posterior da BF-5, conforme orientação do proprietário. Refinar a partir desse feedback. Sem merge automático, fechamento BF-5, início BF-6/BF-7 ou publicação.

> **BF-5 Parte 2C em candidata (2026-11-04):** após #25/#26, avaliar no Moto G06 a reconstrução de Atividade Física e refinar a experiência com feedback humano; testes físicos amplos permanecem acumulados por orientação do proprietário. Sem fechamento da BF-5 ou avanço para BF-6. [Escopo, limites e roteiro](BF-5_PARTE2C_ATIVIDADE_FISICA.md).

> **Próxima validação aprovada — Parte 2B:** revisar a PR draft encadeada e avaliar no Moto G06 o fólio de Estudo, foco com tela desligada/retomada/reabertura, acumulado, caderno, revisão de cartas, contraste, teclado e orientações. [Roteiro](BF-5_PARTE2B_ESTUDO.md). Refinar conforme feedback; preservar também a avaliação da Parte 2 de livros. Sem fechamento de BF-5/#24, início de BF-6/BF-7 ou merge automático.

> **Próxima ação vigente (2026-11-04):** revisar a PR da BF-5 parte 2 e validar no Moto G06 o [fólio de livros, scroll da Coleção e exportação PNG](BF-5_PARTE2_FOLIO.md). Refinar conforme aceite humano. Escopo restante das seis categorias da issue #24 e dívidas #21–23 continuam abertos. Não iniciar BF-6/BF-7, fechar BF-5 ou publicar beta por esta candidata.

# Roadmap

> **BF-5R5 — refinamento autorizado em candidata (2026-11-04):** próxima ação é avaliar a R5 no Moto G06, incluindo arte, fluidez, toque, teclado e seis categorias, e refinar conforme feedback até o aceite. [Relatório](BF-5R5_RELATORIO.md). Não fechar BF-5, não iniciar BF-6/BF-7 nem publicar beta/release por consequência desta rodada.

> **BF-5 — implementação candidata em revisão (2026-11-03).** Reforma de apresentação nas cinco abas, autorizada pelo proprietário como macroentrega. Biblioteca com canvas ocupando o viewport, superfícies semânticas recolhidas e diálogo sobreposto; Coleção com categorias diretas e densidade; Arquivo, Resumo e Ajustes com composição editorial. **BF-5 não concluída nem aprovada artisticamente.** Gates, limitações e evidências em [BF-5_RELATORIO.md](BF-5_RELATORIO.md). As notas anteriores de ausência de autorização descrevem o planejamento histórico.

> **DECISÃO VIGENTE — REPLANEJAMENTO PÓS-BF-4 (2026-11-03):** a sequência futura aprovada é **BF-5 — Reforma Global de UI/UX → BF-6 — Aprimoramento do Mundo Vivo (personagens, animações, RPG, diálogos e interatividade) → BF-7 — Consolidação Funcional e Assistiva**. A BF-7 herda a responsabilidade da **antiga BF-5** da ADR-011. A BF-5 será uma **grande reforma integrada**, seguida de **rodadas de refinamento da nova interface até o aceite do usuário**, e **não** uma sequência de pequenos checkpoints de implementação. Planejamento detalhado, direção de design e execução ainda serão definidos separadamente. Nenhuma das três fases foi iniciada. [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md).

> **BF-4G E BF-4 CONCLUÍDAS NO ESCOPO TÉCNICO/FUNCIONAL DIRIGIDO (2026-11-03), com exceção CI explicitamente aceita.** Auditoria independente da candidata documental sem bloqueante inequívoco nem mudança de produção; gate físico Moto G06 fornecido pelo usuário **6/6 PASS**: mundo/navegação, registros/objetos vivos, habitantes, RPG/diário, lifecycle e observações residuais. Esses PASS atestam a rodada representativa, **não** teste de cada variação, do folio F3 de Lua, de R-19 em condições específicas, de TalkBack nem de carga/temperatura sustentadas. [CI PR #18 — run 41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247) **FAIL global**: 708 Vitest PASS; E2E 30 PASS, 3 FAIL e 1 flaky (busca/Arquivo). FAIL: BF-4D coleção cheia 1280px (#11), BF-4F2 Samael (#15) e dez ciclos shell (#4). Causa do runner versus produto **não demonstrada**; issues [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15) seguem abertas. O usuário **autorizou expressamente o fechamento e merge da [PR #18](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/18)** com estas ressalvas, sem CI verde, beta/release ou BF-5 iniciada. Refinamento futuro de **UI/UX** e, separadamente, de **personagens, RPG, diálogos e interatividade** permanece planejado sem numeração/implementação autorizada. [Relatório de fechamento](BF-4G_RELATORIO.md).

As notas datadas abaixo preservam a cronologia; declarações antigas de fase próxima ou não implementada não substituem o estado BF-4G acima.

> **BF-4F4 ENCERRADA NO ESCOPO DIRIGIDO (2026-11-02), BF-4F1–F4 concluídas por aceite funcional dirigido.** O usuário instalou a candidata no Moto G06, confirmou o funcionamento das questões/escolhas em diálogos e apresentou capturas da conversa de Samael e do início/progressão da Fenda Lilás. **Não foi relatada prova física individual de todos os cinco finais, de todas as ramificações ou do acidente F3 de Lua.** A revisão estática da [PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/17) não identificou bloqueante inequívoco; 708 Vitest PASS, novos E2E F4 2/2 PASS localmente e na CI. [CI run 41550602711](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711): **23 E2E PASS, 11 FAIL; CI global FAIL**. Os onze cenários são dez nomes já reprovados antes e o BF-4D orientação (antes flaky), sem prova de causa comum. Issues #4/#11/#15, TalkBack, folio F3, R-19 e gate BF-4G permanecem. O usuário **autorizou explicitamente fechar F4 e executar o merge da PR #17 por exceção**, adiando UI/UX e refinamentos de personagens, RPG, diálogos e interatividade para **fases posteriores separadas, ainda sem numeração nem implementação autorizada**. [Fechamento F4](BF-4F4_RELATORIO.md). **Próximo marco previsto: BF-4G, gate integrado**, que ainda não foi executado.

> **BF-4F3 ENCERRADA no escopo humano dirigido (2026-11-02), com exceções documentadas.** Moto G06: autonomia, convivência e integração **PASS**; acidente/reparação de Lua **NÃO TESTADO** fisicamente. [CI PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) **FAIL**: 21 E2E PASS, 10 FAIL, 1 flaky; novo E2E BF-4F3 PASS. O usuário autorizou fechamento e merge apesar das ressalvas. **Próximo checkpoint: BF-4F4 — diálogos RPG e quests**, ainda não implementado, exigindo planejamento e PR próprios. [Relatório](BF-4F3_RELATORIO.md).

> **Fechamento BF-4F1 (2026-11-02):** modelos iniciais de Samael, Aryn, Ytha e Lua e seleção por canvas/React **aprovados pelo usuário no Moto G06**. F1 concluída no escopo dirigido; animações corporais ficam para **F2**, autonomia para F3, diálogos/quests para F4. [Relatório final](BF-4F1_RELATORIO.md). A CI não foi declarada verde porque E2E final falhou (20 PASS, 6 FAIL, 1 flaky).

**BF-4F2 concluída no escopo físico/artístico dirigido:** seleção e animações React aprovadas pelo usuário no Moto G06, sem regressões percebidas. Merge da [PR #14](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/14) autorizado por exceção CI; 20 E2E PASS, 10 FAIL, 1 flaky, incluindo quatro casos novos F2 em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). **Próxima BF-4F3 — agência e relações.** F4 está em candidata para auditoria/gate humano; BF-4G segue pendente. [Relatório](BF-4F2_RELATORIO.md).

> Atualizado em 2026-11-02.

## Diretriz para os próximos checkpoints

**Ambição artística primeiro.** BF-4F3/F4 devem criar habitantes e relações interessantes, encenações e narrativas expressivas, sem podar qualidade por pressupor limites do Moto G06. O aparelho não teve teto comprovado; o gate F2 foi positivo. Construir resultado visual/funcional útil, validar com o usuário e otimizar somente quando houver problema real. Proteger a cota do Codex com inspeção focada, testes dirigidos, apenas uma rodada final proporcional e sem loops de timeout. Sem mascarar falhas da CI ou abandonar dados, lifecycle e acessibilidade. [Arte](ART_DIRECTION.md), [testes](TESTING.md), [desempenho](PERFORMANCE.md). Notas históricas afirmando F1–F4 não implementadas são do planejamento original.

## Baseline concluído

- Aplicativo convencional funcional, local-first, com Dexie v8 e backup v6 somente para dados convencionais.
- Mundo anterior, Phaser e contratos espaciais legados removidos pelo WORLD RESET.
- **F0 — Definição da Fundação concluída.**
- **F1 — Three.js Foundation Spike concluída:** Three.js aprovado como renderer da Fundação com host React próprio, `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, interação bidirecional, lifecycle explícito e prova física no Moto G06.
- A cena vigente continua técnica e descartável; P3D-A formalizou o contrato e P3D-B1 registrou a proveniência do candidato `bookshelf`, mas a Biblioteca final, fonte canônica normalizada, assets produtivos e persistência espacial ainda não existem.

## Biblioteca Funcional Primeiro

```text
BF-0 ✅ replanejamento e decisão arquitetural
BF-1 ✅ camada mínima de conteúdo procedural — encerramento técnico
  BF-1A ✅ contrato mínimo e primeira fábrica procedural
  BF-1B ✅ composição declarativa e posicionamento determinístico
  BF-1C ✅ integração estática com runtime e seleção
  BF-1C-FIX ✅ correção geométrica e variantes — gate visual humano no navegador PASS
  BF-1D ✅ substituição, descarte e gate integrado
BF-2 ✅ primeira área de leitura integrada a registros reais
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E ✅ gate técnico e validação física dirigida positiva
BF-3 ✅ concluída no escopo funcional/físico dirigido; dívida CI E2E aberta
  BF-3A ✅ contrato e fronteiras — documental
  BF-3B ✅ projeção neutra dos cinco tipos restantes — contratos e testes puros
  BF-3C ✅ representação procedural e layout isolados — concluída no escopo aprovado
    BF-3C1 ✅ auditoria curta, contrato e cinco fábricas procedurais
    BF-3C2 ✅ layout determinístico, bounds e overflow — CONCLUÍDA TECNICAMENTE
    BF-3C3 ✅ hipótese 3 PASS visual humano e técnico; prévia removida
  BF-3D ✅ runtime e seleção — PASS TÉCNICO LOCAL
    BF-3D1 ✅ montagem e ownership — PASS TÉCNICO DIRIGIDO
    BF-3D2 ✅ catálogo, picking e seleção — PASS TÉCNICO LOCAL
    BF-3D3 ✅ robustez, regressão e fechamento — PASS TÉCNICO LOCAL
  BF-3E ✅ ponte React/aplicação e fluxo funcional — PASS TÉCNICO
    BF-3E1 ✅ consulta agregada e ponte React → runtime
    BF-3E2 ✅ interface funcional dos seis tipos — implementação local
    BF-3E3 ✅ gate consolidado — auditoria independente e CI PASS
  BF-3F ✅ gate físico dirigido 11/11 PASS; exceção CI documentada (#4)
BF-4 ✅ Mundo Vivo e Habitável — BF-4B–G encerradas em escopo dirigido, 6/6 gate físico PASS, CI global FAIL aceita
  BF-4A ✅ auditoria dirigida, decisões e contrato (documental)
  BF-4B ✅ cinco cômodos; auditoria, CI e Moto G06 PASS dirigido (R-19)
  BF-4C ✅ ampliação e mobília concluídas com PASS dirigido, exceção CI (#4)
  BF-4D ✅ organização espacial, passagens e zonas — PASS dirigido, CI FAIL aceita (#4/#11)
  BF-4E ✅ dez famílias e três atmosferas contextuais, interação canvas e Segredo do Pergaminho 4/4 — Moto G06 PASS; CI E2E FAIL aceita (#4/#11)
  BF-4F ✅ F1–F4 concluídas no escopo funcional dirigido; refinamentos artísticos/UX futuros
    BF-4F1 ✅ modelos distintos integrados e seleção por canvas/React — PASS físico dirigido
    BF-4F2 ✅ animações variadas e transições — PASS físico dirigido, CI global FAIL
    BF-4F3 ✅ comportamento autônomo, relações e interação ambiental — 3 PASS físicos; folio Lua não testado; CI FAIL
    BF-4F4 ✅ diálogos RPG e cinco histórias — aceite funcional Moto G06; CI global FAIL, refinamentos futuros
  BF-4G ✅ integração e gate físico dirigido 6/6 PASS; exceção CI preservada
BF-5 ✅ reforma global de UI/UX — encerrada no escopo dirigido, com ressalvas
BF-5.5 ⏳ O Despertar da Biblioteca — persistência, magia, iluminação e objetos reativos
BF-6 ⏳ aprimoramento do Mundo Vivo — personagens, RPG, animações, diálogos e interação
BF-7 ⏳ consolidação funcional/assistiva — antiga BF-5; gate antes de beta/release
```

### BF-5 — direção visual global (2026-11-03)

O usuário escolheu para **todas as telas** uma identidade de **fantasia sobrenatural**, bonita, mágica, misteriosa, elegante, organizada e confortável ao toque, com transições suaves e efeitos contextuais **sem poluição visual**. O guia [BF-5 — Direção Visual Global: Fantasia Sobrenatural Editorial](BF-5_DIRECAO_VISUAL_GLOBAL.md) estabelece pilares, paleta/materiais/tipografia ainda exploratórios, gramática de movimento/feedback e personalidade coerente para Biblioteca, Coleção, Arquivo, Resumo e Ajustes. O conceito global está aprovado; detalhes finais de aparência e layout serão definidos tela por tela. **Nenhuma implementação ou design system final está aprovado por esta documentação.**

### BF-5 — planejamento da tela Biblioteca (2026-11-03)

O usuário definiu o **canvas como experiência dominante em tela inteira**, com **dock estilizado como única navegação persistente** e interação contextual com linguagem de **RPG/game mobile**. A Biblioteca Viva deve ser concebida com potencial de evolução para um game, sem abandonar funções essenciais ou decidir antecipadamente novas mecânicas. O [manifesto criativo e contrato funcional da tela Biblioteca](BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md) registra a visão, estados, gatilhos propostos, destinos dos elementos atuais, ergonomia e fronteiras BF-5/BF-6. **Planejamento documental; implementação e design definitivo não iniciados.** A BF-5 continua uma grande reforma integrada seguida de refinamentos, não checkpoints pequenos obrigatórios.

### Pós-BF-4 — contrato de sequência e modo de trabalho (ADR-014, 2026-11-03)

**BF-5 — Reforma Global de UI/UX:** revisar em uma **única reforma ampla e coesa** o design e a experiência do aplicativo, inclusive telas convencionais, navegação, hierarquia de informação, componentes, tipografia, interações, painéis de narrativa/RPG, ergonomia mobile, integração React↔mundo 3D, orientações de tela e acessibilidade. O desenho visual detalhado, propostas estéticas, alcance exato e critérios finais serão discutidos e aprovados **antes da implementação**. **Não impor uma série de pequenos checkpoints como modelo de execução da BF-5**: produzir uma nova interface integrada substancial e depois refiná-la em rodadas de feedback visual/físico até o usuário considerá-la satisfatória. Commits técnicos e testes internos não são proibidos; só não constituem entregas fragmentadas obrigatórias. Validação e correções não podem ser suprimidas em nome da amplitude.

**BF-6 — Aprimoramento do Mundo Vivo:** após a BF-5, evoluir acabamento/expressividade dos quatro habitantes, animações, coreografias, magia/efeitos, encenação espacial, relações sociais, diálogos, histórias, escolhas, feedback e consequências RPG/interativas. O escopo concreto será planejado à parte, sem antecipar decisões de engine, LLM, persistência ou mecânicas novas.

**BF-7 — Consolidação Funcional e Assistiva (antiga BF-5):** estabilizar a experiência integrada, investigar e classificar regressões e dívidas da CI, executar validação assistiva real (incluindo TalkBack) e gates proporcionais de funcionalidade, lifecycle e desempenho sustentado para avaliar o marco funcional. A mudança de ordem **não** declara sanadas as issues #4/#11/#15, flakiness, R-19, folio de Lua, variações narrativas nem os testes ausentes; defeitos bloqueadores observados na BF-5/6 devem ser tratados sem adiá-los artificialmente à BF-7. Não há beta/release automática.

**Fronteiras:** preservam-se a arquitetura local-first, os seis tipos de registro, identidades de seleção, alternativa React semântica, integridade dos dados, Dexie/backup, ownership/lifecycle e a ambição artística. Nenhuma dessas fases está implementada ou tem código autorizado por esta decisão exclusivamente documental. Textos anteriores que chamavam a consolidação de “BF-5” são histórico, não o próximo plano operacional.

**BF-4E — registro histórico de autorização criativa (implementação e fechamento ocorreram posteriormente):** [visão e contrato dos objetos vivos](BF-4E_VISAO_CONTRATO.md). Dez famílias-alvo, interações entre objetos, modos ambientais e uma descoberta encadeada nos cinco cômodos; nenhum código BF-4E implementado por essa decisão documental. Próximo passo: prompt de execução e gates independentes, sem antecipar personagens BF-4F.

O caminho BF usa conteúdo procedural/provisório em TypeScript/Three.js e mantém React como superfície semântica das funções essenciais. A identidade lógica separa tipo de modelo, instância do mundo e ID de registro convencional associado quando houver; a representação visual poderá ser procedural agora e GLB definitivo depois, sem alterar essa identidade. Não há persistência espacial produtiva, tabela nova ou mudança de backup neste plano.

### BF-0 — Replanejamento — concluída

ADR-011 está aceita e estabeleceu a prioridade funcional, preservando P3D-B1 e adiando P3D-B2–F.

### BF-1 — Camada mínima de conteúdo procedural

#### BF-1A — Contrato mínimo e primeira fábrica — concluída

Definiu a identidade lógica mínima e implementou uma fábrica procedural isolada de `bookshelf`, com testes dirigidos de geometria, transforms, isolamento e recursos. A fábrica não está integrada ao runtime, seleção ou composição; a documentação desta decomposição foi atualizada.

#### BF-1B — Composição do conteúdo — concluída

Definiu instâncias declarativas, posicionamento determinístico e uma pequena composição de três estantes procedurais, separando definições de conteúdo da criação de objetos Three.js. A composição valida `instanceId` duplicado antes de criar recursos, mantém a root local da fábrica em identidade, aplica layout em wrapper de instância e cobre determinismo, isolamento e descarte; ela ainda não está integrada ao runtime ou à seleção.

#### BF-1C — Integração com runtime e seleção — concluída tecnicamente

Integra estaticamente a composição BF-1B somente na experiência normal, distinguida da diagnóstica pela ausência de `performanceScenario`. As três instâncias preservam `instanceId`, posição e root local; entram no catálogo de `WorldRuntime` já em `mount()` como `reading-shelf-01`–`03`, com rótulos distintos, roots selecionáveis por wrapper e destaque/picking existentes. Em sobreposição com um proxy F1, a interseção procedural recebe prioridade para que a estante continue selecionável; fora dela, a regra técnica existente permanece. Os controles React, anúncio acessível, foco, teclado e fallback continuam sendo o caminho semântico complementar ao canvas. A montagem possui a root da composição e a libera por `disposeObjectTree()` em descarte terminal ou falha; novas montagens usam recursos independentes. F5 não recebe a composição, nem tem seus counts, catálogo, payload ou resultados alterados. Foram acrescentadas somente as validações de `instanceId` vazio e coordenadas não finitas. A fixture F1 permanece visível; a oclusão projetada anterior foi tratada pela BF-1C-FIX e seu gate humano PASS; BF-1D fecha a troca de representação sem reforma de layout.

#### BF-1C-FIX — Correção geométrica e apresentação — concluída, gate visual humano aprovado

Sem reescrever a BF-1C versionada em `34015b6`, corrige a fábrica após a inspeção humana identificar linhas, massa visual pouco legível e variação aparente por enquadramento. A causa comprovada foi a coincidência da face frontal do fundo com as prateleiras e interseções internas; a inspeção de código não encontrou mudança de câmera/projeção/viewport pela rolagem. A nova família evita essas sobreposições, cria três variantes moderadas e determinísticas e desloca somente a variante larga para `[3, 0, -2.1]` após demonstrar a colisão com banco F1. A seleção, lifecycle, fallback e F5 permanecem preservados. Após `493c887`, o usuário aprovou no navegador as três estantes, as variantes e a leitura das prateleiras, sem as deformidades, linhas ou perdas de definição reportadas; este PASS não aprova TalkBack, Android físico nem arte final.

#### BF-1D — Substituição, descarte e gate — concluída tecnicamente

Implementou uma operação síncrona e estreita da composição para trocar uma instância `bookshelf` existente por outra variante procedural. `reading-shelf-02: reading-dark-tall → reading-balanced` preserva `modelTypeId`, `instanceId`, `entryId` quando houver, posição e o wrapper selecionável; a representação nova é preparada e anexada antes de a antiga ser liberada uma única vez. Pedir a variante já ativa retorna inerte; `instanceId`/variante inválidos ou falha de preparação/attach preservam a representação anterior. A montagem terminal libera somente as roots ainda possuídas. Se a estante selecionada troca, o helper anterior é descartado e o novo acompanha os bounds atualizados sem reconstruir catálogo, ID ou seleção React. F5 permanece sem composição e responde explicitamente que a operação está indisponível. Passaram testes de fábrica/composição/runtime/interação/host/fronteiras, format, lint, typecheck, 546 testes Vitest, build e 6 E2E da rota Biblioteca. Não houve API nova em `WorldRuntime`, controle React, GLB, cache, persistência espacial ou remoção pública de estantes. BF-1 está encerrada somente no plano técnico desta camada; a dívida TalkBack ainda impede declarar fechado o primeiro recorte real.

### BF-2 — Primeira área de leitura funcional

Integrará registros reais de livros ao mundo, mantendo os casos de uso existentes e a operação essencial pela interface React.

#### BF-2A — Contrato e projeção dos livros reais — concluída

Criou a projeção neutra `BookEntry → ReadingAreaBook` para ocorrências futuras `book-volume` da área de leitura. Ela preserva `entryId`, deriva `instanceId` estável como `reading-book:${entryId}`, ordena deterministicamente por `createdAt` e `id`, inclui título, autor opcional e progresso de leitura disponível, e rejeita `entryId` duplicado. A projeção permanece sem integração com `ThreeWorldRuntime`, seleção, carregamento na rota Biblioteca, persistência espacial ou outra categoria de registro.

#### BF-2B — Livro procedural e layout determinístico — concluída

Criou a representação procedural isolada `book-volume` e o contrato determinístico de slots das três estantes existentes. A fábrica exige `entryId` por um contrato mais estreito, escolhe entre quatro variantes discretas a partir da identidade estável e mantém recursos próprios por criação. BF-2D-BOOK-VIS-FIX ampliou seus volumes para 0,190–0,225 m de largura, 0,370–0,400 m de altura e 0,320–0,360 m de profundidade, para legibilidade no enquadramento normal sem ultrapassar o envelope físico das estantes. O layout puro consome a ordem recebida, preenche as estantes declaradas, depois níveis internos de baixo para cima e slots da esquerda para a direita; a capacidade inicial deriva de 24 + 25 + 21 = 70 slots e qualquer excedente é devolvido como overflow ordenado. As posições são locais ao wrapper estável da estante, não à root descartável de sua representação BF-1D. Não há attach ao runtime, livro real visível, seleção, React/aplicação, schema, backup ou persistência espacial.

#### BF-2C — Integração com runtime e seleção — concluída tecnicamente

`ReadingAreaBook` agora chega ao `ThreeWorldRuntime` por contrato neutro e snapshot imutável, sem query, `BookEntry`, application, Dexie ou React. Cada livro colocado é wrapper selecionável irmão da representação substituível da estante; o catálogo e `WorldSelection` preservam `entryId`. Slots são regenerados pelas variantes atuais e BF-1D relayouta sem recriar livros ainda visíveis; overflow não tem root ou seleção e pode retornar após aumento de capacidade. A configuração inicial deriva 70 slots (24 + 25 + 21), sem transformar esse número em capacidade universal. F5 ignora o snapshot. Não houve persistência espacial, navegação nem integração da rota; BF-2D permanece responsável por trazer registros reais.

#### BF-2D — Ponte React/aplicação e fluxo funcional — concluída tecnicamente

A Biblioteca consulta `listBookEntries` por um contrato React/aplicação estreito, projeta um snapshot imutável com `projectReadingAreaBooks()` e o entrega ao `WorldHost` na montagem. Loading, indisponibilidade e erro público não se confundem com vazio; o vazio real mantém estantes sem livros e ação convencional para criar livro. A lista React preserva todos os livros e seus links por `entryId`, inclusive overflow; o catálogo neutro do host informa quais livros estão visíveis e permite seleção React → canvas, enquanto a seleção do canvas retorna `entryId` para abrir o registro sem foco forçado. F5 continua sem query ou livros reais e agora ignora inclusive snapshot inválido. Não há sincronização live, schema, backup ou persistência espacial.

#### BF-2E — Gate integrado e fechamento da BF-2 — concluída no escopo acordado

Consolidou regressão integrada com base convencional real: criação, projeção, representação, seleção bidirecional, abertura por `entryId`, edição/retorno, vazio, overflow 70 + 1, fallback e lifecycle. O gate técnico e a validação física dirigida no Moto G06 foram positivos; BF-2E está concluída no escopo acordado e BF-2 no escopo técnico-funcional e físico dirigido. Os volumes procedurais permanecem pequenos no enquadramento geral, mas são selecionáveis e foram aceitos pelo usuário para o escopo funcional atual. A observação humana é qualitativa, sem estabelecer benchmark, FPS, teto de carga ou aprovação da arte definitiva. TalkBack continua obrigatório antes do fechamento do primeiro recorte real e de beta/release aplicável.

### BF-3 — Integração dos seis tipos de registro — encerrada no escopo físico-funcional, com dívida CI

**Estado:** BF-3A/B/C estão concluídas nos escopos aprovados, e BF-3D1/D2/D3 receberam PASS técnico local conjunto. A BF-2 já integra `book` na área de leitura; a D monta e seleciona `movie`, `series`, `study`, `physical_activity` e `work` no runtime composto. BF-3E1 conectou a consulta real e a ponte React → runtime; E2 implementou a interface dos seis tipos; E3 recebeu PASS técnico após auditoria independente e CI verde em 2026-11-01. BF-3F recebeu PASS humano em duas rodadas no Moto G06 (11/11 procedimentos). BF-3 está concluída no escopo técnico-funcional e físico dirigido por exceção expressa: a CI remota do E2E `r4-shell` permanece falhando/intermitente (issue #4), sem gate CI integral aprovado. `docs/STATUS.md` permanece a autoridade sobre o presente.

**Resultado funcional pretendido:** cada registro convencional existente pode ser encontrado, identificado pelo seu tipo, selecionado quando houver representação 3D e aberto pelo `entryId`; todos continuam acessíveis por uma superfície React semântica mesmo sem WebGL ou quando não couberem visualmente. Não se exige uma sala definitiva por categoria: composição, formas e capacidade devem ser proporcionais à prova funcional, não uma antecipação da BF-4. O layout provisório deve preservar legibilidade e interação no Moto G06.

**Invariantes comuns e limites:**

- Preservar a identidade lógica da ADR-011: `modelTypeId` (tipo visual), `instanceId` (ocorrência estável e única no mundo) e `entryId` (registro convencional) são distintos. Não derivar identidade de mesh, posição, título ou URL; IDs entre categorias não podem colidir. `book-volume` e a área de leitura BF-2 permanecem válidos.
- Projetar dados convencionais em contratos neutros, imutáveis e determinísticos; domínio/aplicação não conhecem Three.js, e runtime não consulta Dexie nem casos de uso. Na Biblioteca, reutilizar `listLibraryEntries` uma vez por montagem normal, sem quebrar a consulta estreita `listBookEntries` já aprovada fora dessa rota ou prometer sincronização live.
- Procedural leve, geometria e posicionamento isolados, ownership único após attach, disposal idempotente e proteção a callbacks tardios. F5 continua diagnóstico e não recebe snapshots funcionais; não promover fixture F1/F4, GLB de laboratório ou candidato P3D-B1 a asset produtivo.
- Sem `PlacedObject`, `WorldStructureState`, persistência espacial, tabela/schema Dexie, alteração de backup, `AssetManager`, cache, novos loaders, dependências ou refatoração ampla não justificados. Os 70 slots atuais são capacidade derivada **apenas dos livros**, não limite global de BF-3. Sem novas mecânicas ou personagens de BF-4.
- React permanece o caminho convencional de busca/abertura/edição, lista integral e alternativa de seleção. Distinguir vazio real, loading, armazenamento indisponível, erro de consulta, erro WebGL e overflow. Seleção não força foco, não recria o mundo e não inventa objeto 3D para excedentes. TalkBack humano permanece obrigatório para fechar o primeiro recorte real e beta/release aplicável.
- Usar checkpoints pequenos e retomáveis: testes dirigidos durante cada implementação e regressão ampla somente no gate integrado ou em mudança que a justifique. Não declarar benchmark/FPS medido por CI; gatilhos de densidade ou renderização nova exigem medição proporcional no Moto G06.

#### BF-3A — Contrato e fronteiras — concluída documentalmente

O baseline real confirmou que `ListBookEntries` chama `ListLibraryEntries` e filtra `book`. Assim, BF-3E fará uma única chamada a `listLibraryEntries` por montagem normal da Biblioteca e projetará os seis tipos do mesmo resultado; `listBookEntries` e a projeção BF-2 permanecem intactos fora dessa rota. O contrato detalhado vigente está em `WORLD.md`: fixa campos, metadados disponíveis, `modelTypeId` semântico, namespaces de `instanceId`, ordenação `createdAt`/`id`, duplicidade, snapshot imutável, vazio e overflow; reserva uma zona complementar provisória sem coordenadas, capacidades ou salas finais; e fecha a fronteira de runtime, React, lifecycle, WebGL e F5.

Os tipos novos usarão `movie-record`/`library-movie:${entryId}`, `series-record`/`library-series:${entryId}`, `study-record`/`library-study:${entryId}`, `physical-activity-record`/`library-physical-activity:${entryId}` e `work-record`/`library-work:${entryId}`. Esses identificadores não descrevem a geometria provisória. Mídia, caderno, marcador e pasta permanecem hipóteses a inspecionar no navegador em BF-3C, não uma obrigação visual. A reconciliação geral pós-BF-2 de README, mapa, UX e TESTING já foi feita em `0430b2a`; como BF-3A não alterou comportamento vigente, ela não a repetiu.

**Gate A: PASS documental.** Contrato conferido contra ADR-011, BF-2, tipos e testes existentes; limites, riscos e ponto de retomada atualizados. Nenhum runtime, código, teste, asset, schema, dependência ou APK foi alterado.

#### BF-3B — Projeção neutra dos cinco tipos restantes — concluída

Implementou e testou a projeção renderer-independent `projectLibraryWorldEntries()` a partir de `LibraryEntry[]`. O snapshot imutável contém as seis categorias na ordem de `ENTRY_TYPES`: reutiliza integralmente `projectReadingAreaBooks()` para `book`, sem acrescentar `type` ou `createdAt`, e projeta os cinco tipos restantes com seus discriminantes, metadados mínimos, `modelTypeId` e `instanceId` semânticos. A projeção ordena por `createdAt`/`id`, rejeita `entryId` duplicado antes de publicar e verifica unicidade de `instanceId`, sem mutar a entrada. Não houve geometria, layout, runtime, React, consulta, dependência ou persistência espacial.

**Gate B: PASS.** Testes puros cobrem os seis tipos, identidade sem colisão, ordenação, opcionais, duplicidade, imutabilidade, determinismo, fronteira arquitetural e regressão da projeção BF-2; não houve representação no runtime.

#### BF-3C — Representação procedural e layout isolados — decomposição em três checkpoints

**Estado:** BF-3C1/C2/C3 e BF-3C concluídas no escopo procedural provisório. A hipótese 1 recebeu FAIL visual por escala/reconhecibilidade; a hipótese 2 melhorou os objetos mas recebeu FAIL na planta. A hipótese 3 recebeu PASS humano explícito, com ressalva de que a planta não reproduz fielmente a referência 2D e não é definitiva. O gate técnico consolidou construção, layout, geometria real e descarte; BF-3D1 integrou a montagem runtime e passou no gate técnico dirigido. BF-3D2 recebeu PASS técnico local.

##### BF-3C1 — Contrato breve e cinco representações procedurais

Concluiu a auditoria dirigida da composição vigente — estantes e livros no plano local `Y=0`, piso técnico de 14 × 10 m, proxies já ocupados e câmera ortográfica/2.5D — sem alterar essa cena. Criou raízes isoladas para `movie-record`, `series-record`, `study-record`, `physical-activity-record` e `work-record`, usando os identificadores estreitos da projeção BF-3B. As formas são, respectivamente, painel audiovisual, três casos de mídia, caderno, marcador de percurso neutro e pasta de trabalho; são hipóteses provisórias, não arte final. Cada chamada cria recursos próprios, mantidos apenas dentro de sua root e liberáveis por `disposeObjectTree()`; não há cache, pooling, coordenada global, capacidade ou slot. Os envelopes reais medidos (largura × altura × profundidade) são 0,720 × 0,480 × 0,240 m, 0,660 × 0,500 × 0,200 m, 0,560 × 0,132 × 0,400 m, 0,460 × 0,590 × 0,400 m e 0,600 × 0,300 × 0,400 m.

**Gate C1: PASS técnico.** Testes dirigidos cobrem geometria, dimensões por `Box3`, identidade, raiz local, componentes, distinção filme/série, determinismo estrutural, isolamento de recursos, descarte deduplicado/repetido e entrada inválida antes de anexar recursos. Não houve montagem na cena produtiva, alteração do snapshot BF-3B, runtime, React, Dexie ou integração de consulta.

##### BF-3C2 — Layout determinístico e overflow — concluída tecnicamente

Medir os bounds reais das cinco representações da C1 e derivar a zona complementar provisória e seus slots, sem propor cinco cômodos ou estado espacial persistente. Implementar atribuição pura que consuma as ocorrências na ordem lógica do snapshot BF-3B, preserve `entryId`/`instanceId`, derive a capacidade a partir dos slots efetivos e devolva overflow ordenado, sem criar representação para excedentes. Garantir posições finitas, espaçamento positivo e ausência de interseção positiva com a área de leitura, os livros colocados e os proxies técnicos relevantes; considerar também enquadramento, navegação e selecionabilidade da câmera atual. Os **70 slots de livros** são exclusivos das estantes BF-2 e não integram a capacidade dos novos tipos.

**Gate C2: PASS técnico.** A zona complementar central/frontal, cinco faixas e 37 slots derivados (6 filme, 7 série, 8 estudo, 9 atividade física, 7 trabalho) foram declarados e testados contra bounds reais C1, área de leitura com 70 livros e proxies técnicos modelados. A atribuição é pura, imutável e retorna placement/overflow ordenado sem roots. Ainda não foram anexados tipos ao `ThreeWorldRuntime` ou à rota Biblioteca; C3 é o próximo checkpoint.

##### BF-3C3 — Prévia visual isolada, decisão humana e fechamento — concluída

A primeira hipótese de sala única recebeu FAIL visual por escala e reconhecibilidade; o layout de 37 slots permanece evidência histórica C2. A segunda hipótese melhorou as representações mas recebeu FAIL visual na planta retangular subdividida. A terceira hipótese, com núcleo central, quatro salas periféricas conectadas e cômodos semanticamente neutros, recebeu PASS humano explícito para o escopo procedural provisório nos cenários A/B/C. A planta ainda não reproduz fielmente a referência 2D e não é definitiva. A/B/C mantiveram 5/13/13 placements e 0/0/4 overflow; ausência de picking é esperada até BF-3D.

O fechamento promoveu construção e layout a módulos independentes da prévia, testou roots e Box3 reais contra passagens, paredes, representações, estantes e livros BF-2, e removeu os instrumentos temporários. A capacidade inicial dos cinco tipos deriva dos slots 2/2/3/3/3; os 70 slots de livros permanecem exclusivos. O PASS técnico local cobriu 77 arquivos/616 testes, format:check, lint, typecheck, audio:check e build. Este gate não aprova planta ou arte final, GLB, seleção, movimento, persistência espacial, desempenho Android, TalkBack ou ergonomia física.

#### BF-3D — Runtime, catálogo e seleção — PASS técnico local D1/D2/D3

**Objetivo e fronteira:** consumir `LibraryWorldSnapshot`, `createProceduralLibraryBuilding()`, `LIBRARY_ROOMS`, `INITIAL_LIBRARY_RECORD_SLOTS`, `assignLibraryRecordSlots()` e as cinco fábricas C1 no `ThreeWorldRuntime` normal. O runtime recebe somente dados neutros por montagem, sem consulta ou dependência de domínio/Dexie. Cômodos permanecem semanticamente neutros; distribuição inicial não reserva categorias nem implementa movimentação ou persistência espacial. BF-3E permanece responsável pela única consulta convencional dos seis tipos e pela ponte React; BF-3F, pelo gate físico integrado.

**BF-3D1 — Snapshot, montagem e ownership (PASS TÉCNICO DIRIGIDO; integrada):** adicionar uma entrada opcional `LibraryWorldSnapshot` às dependências de criação do runtime, mantendo o caminho legado `readingAreaBooks` para BF-2. Quando houver snapshot composto, sua categoria `book` alimenta o mecanismo BF-2 existente; não montar livros em duplicidade nem misturar fontes incompatíveis silenciosamente. Montar a construção procedural e os wrappers dos placements dos cinco tipos apenas no caminho normal, com roots locais, ownership único e cleanup terminal/falha. Overflow não cria root. Auditar a convivência do edifício aprovado com `referenceScene`, composição BF-1/BF-2 e enquadramento atual: a prévia C3 não montou os proxies técnicos. Se houver colisão, oclusão ou incompatibilidade material que exija mudar a composição aprovada, registrar bloqueio/correção dirigida sem remodelar F5 ou presumir novo PASS visual. **Gate D1:** testes dirigidos de montagem, posição/identidade, 13 slots iniciais, overflow, F5 ignorando inclusive snapshot inválido, preservação de três estantes/70 livros e ownership/descarte. Não adicionar seleção nova nem modificar `LibraryPage`/`WorldHost`.

**Resultado D1 (2026-09-23):** PR #1 integrado à `main` por squash (`6b613e2`), após duas auditorias independentes e microverificação do Codex. Snapshot neutro opcional, 13 wrappers não selecionáveis, 70 livros BF-2, overflow sem root e F5 isolado; no mundo composto, a construção substitui apenas a geometria técnica F1 sobreposta, com luzes próprias, sem alterar o caminho legado/diagnóstico. Testes verificam identidade (`entryId`, `instanceId`, `modelTypeId`), descarte de geometria/material, rollback parcial, mounts independentes, indicadores consistentes e zoom inicial 0,7 já no primeiro quadro; a última CI do HEAD aprovado na branch passou integralmente, inclusive E2E. **Não há PASS visual integrado:** oclusão/iluminação, exploração ergonômica e bounds F3 derivados do piso técnico permanecem para validação dirigida; Android e TalkBack não foram aprovados. Não declarar BF-3 completa nem avançar escopo para BF-3E.

**BF-3D2 — Catálogo, picking e seleção:** registrar apenas wrappers efetivamente anexados como selecionáveis com `id: instanceId`, `entryId` e rótulo seguro; incorporar `getSelectableObjects()`, `ThreeWorldInteraction`, raycast, `selectObject(id)`, `WorldSelection` e destaque sem duplicar catálogo nem alterar a identidade BF-2. A seleção de um tipo não pode interferir em livros/estantes ou outros tipos. Overflow e falha de representação não são selecionáveis; o caminho React convencional, anunciado/alternativo, continua sob BF-3E. **Gate D2:** testes dirigidos das cinco categorias, seleção por canvas e ID, highlight, prioridade de picking com objetos já existentes, seleção inválida, isolamento BF-1/BF-2 e F5 sem conteúdo BF. Não criar controles React de novos tipos.

**Resultado D2 (2026-09-23):** PASS técnico local para os wrappers anexados. O catálogo único entrega 13 registros BF-3, três estantes e 70 livros no snapshot de teste composto; `WorldSelection` conserva `instanceId`/`entryId`, e o helper de highlight é trocado ou removido nas seleções inválidas e no descarte. Raycast dirigido selecionou representantes das cinco categorias em pontos visíveis, e os testes cobriram overflow, montagens independentes, caminho legado e F5 inválido. O centro projetado de uma série incidiu sobre uma estante: o teste usa parte visível, sem mudança global de prioridade, planta ou câmera. Gate: format:check, lint, typecheck, 78 arquivos/622 testes Vitest, build e 17 E2E passaram. Os E2E exercitam BF-2/rota atual; a ponte React BF-3E ainda não existe. D3 e validações visuais/físicas permanecem pendentes.

**BF-3D3 — Robustez, regressão e fechamento:** testar falhas de preparação/attach, rollback sem wrappers, catálogo ou highlight órfãos, dispose repetido, mounts independentes, WebGL indisponível, seleção obsoleta e proteção dos callbacks tardios já existentes. Não inventar sincronização live, reconciliação de snapshots após montagem ou mecanismo assíncrono para as fábricas síncronas; qualquer callback realmente diferido deve respeitar o owner e descartar resultado stale. Executar testes dirigidos durante correções e regressão consolidada proporcional no gate (BF-1/BF-2/F5, arquitetura, format, lint, typecheck, Vitest, build e E2E aplicáveis), com documentação e riscos reconciliados. **Gate D3/D:** PASS somente com montagem, catálogo, picking, seleção, falha/lifecycle, ownership e F5 demonstrados em conjunto. BF-3E passa a próxima execução ainda não iniciada.

**Resultado D3/D (2026-09-23): PASS técnico local.** D1 comprova snapshot, montagem, ownership, rollback e F5; D2 comprova catálogo, picking, seleção, highlight e a prova posterior de livros/estantes BF-2 por canvas no mundo composto; D3 acrescenta falhas controladas na composição, depois de criar as roots e no attach parcial da interação, além de falha WebGL terminal. O attach parcial revelou um listener remanescente no canvas; o construtor da interação agora limpa o registro parcial antes de propagar a falha. Os testes verificam ausência de canvas, catálogo e highlight utilizáveis após estado terminal, descarte repetido, montagens independentes, IDs obsoletos e callbacks tardios existentes. Gate local: 6 arquivos/85 testes dirigidos, 78 arquivos/626 testes Vitest, format:check, lint, typecheck, audio:check, build, performance:report e 17 E2E, todos verdes. O build mantém aviso convencional de chunks acima de 500 kB; o relatório estático indica 634.053 bytes iniciais e 659.439 bytes no chunk dinâmico Three. Não há PASS visual integrado nem físico: avaliar apresentação, oclusão e bounds F3 sem alterar a planta C3 por precaução. BF-3E é a próxima implementação; BF-3F, Android e TalkBack continuam pendentes.

**Limites de toda a D:** sem `listLibraryEntries`, consulta de registros reais, alterações de schema/backup, persistência ou drag/drop espacial, editor de cômodos, novos GLBs/dependências, redecoração, alteração de fixture F1/F4 ou benchmark/APK Android. Não declarar BF-3 completa, desempenho físico, TalkBack ou planta definitiva. Preservar a decisão visual C3 aprovada para o escopo provisório; se houver alteração material, gate humano dirigido fica pendente até nova aprovação.

#### BF-3E — Ponte React/aplicação e fluxo funcional

**E1 concluída (2026-09-23):** a rota Biblioteca usa uma consulta `listLibraryEntries` por montagem vigente e `projectLibraryWorldEntries` para entregar `LibraryWorldSnapshot` ao `WorldHost` normal. O host usa a entrada composta do runtime existente; preserva a entrada legada BF-2, a precedência diagnóstica F5 e o `runtimeFactory` explícito. Resultado ou erro tardio de outra instância de `application` é descartado. Naquele checkpoint, a lista React de livros BF-2 permanecia operacional e a organização dos outros cinco tipos ainda pertencia à E2.

**E2 implementada (2026-09-24):** a superfície React apresenta as seis categorias a partir do snapshot E1, conserva livros BF-2 e usa o catálogo publicado pelo host para disponibilizar seleção. Registros fora do catálogo permanecem abríveis; falha 3D não vira overflow. Canvas → React exige par `instanceId`/`entryId` vigente. A rota de detalhe/edição preserva o retorno à Biblioteca. Testes dirigidos React e E2E fictício cobrem seleção, vazio, overflow, fallback e edição/retorno. A consolidação E3 e a auditoria independente sucederam esse checkpoint; F continua não iniciado.

Consultar os seis tipos pelo caminho aprovado em A/B e entregar snapshot neutro ao host normal, respeitando ciclo de vida da instância vigente de `application`. Exibir lista/organização semântica por categoria com todos os registros, inclusive overflow; indicar quais têm representação visual e habilitar seleção no ambiente somente para esses. Integrar canvas → React e React → runtime, abertura convencional pelo `entryId`, edição/retorno e os estados vazio/loading/erro/armazenamento indisponível/falha WebGL. Preservar os recursos da Coleção, Arquivo, Resumo e o fluxo de livros; não prometer atualização live.

**Resultado BF-3E3/BF-3E (2026-11-01): PASS técnico.** A auditoria independente confirmou os contratos E1/E2 e as correções dos testes do shell e de `p1-memory`. A suíte E2E comprova edição/retorno de livros no fluxo BF-2 e dos cinco demais tipos no cenário ampliado da E3. O gate local e a CI remota [41272609003](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41272609003) passaram no commit `4aef4088df4944cedab2f80551dc52c5be379a25`: 78 arquivos/635 Vitest, 18 E2E, formato, lint, tipos, áudio, build e relatório estático. A corrida histórica `p1-memory` não foi comprovada como causa única. Sem mudança em produção, sem prova física ou TalkBack.

**Gate E: PASS técnico.** Testes React/host e E2E com registros fictícios dos seis tipos, seleção bidirecional, overflow, erro, criação/edição/retorno e múltiplas montagens, preservando operação essencial sem canvas.

#### BF-3F — Gate físico dirigido e fechamento — concluída com exceção CI (2026-11-01)

O APK debug atualizado foi instalado e testado pelo usuário no Moto G06. **Rodada 1: 5/5 PASS**, abrangendo seleção das três estantes, Próximo/Anterior, pan/pinch/zoom, orientação e segundo plano/retorno. **Rodada 2: 6/6 PASS**, abrangendo seis tipos/categorias, representações procedurais, seleção canvas/React, abertura/edição/retorno e inspeção visual e fluidez. Evidência humana e diagnóstico pontual registrados na [issue #5](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/5); nenhum defeito específico relatado, mas não houve benchmark prolongado, prova de todos os ângulos de oclusão, nem hash de proveniência do APK.

**Gate F: fechamento no escopo aprovado com ressalva CI.** A BF-3E teve gate automatizado aprovado previamente; a CI da `main` pós-merge falhou no E2E gráfico `r4-shell` (17/18), com causa inconclusiva, e a correção candidata do PR #3 não foi integrada. Por decisão explícita, a dívida fica na [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) e **não** recebe PASS fictício. BF-3 é concluída somente no escopo funcional/técnico e físico dirigido, não no critério de CI estável, nem como primeiro recorte real, beta/release, aprovação TalkBack, mundo/arte finais ou GLB produtivo. BF-4 requer autorização própria.

**Fechamento C3/C:** `libraryBuildingGeometry.ts` e `proceduralLibraryBuilding.ts` preservam os cinco cômodos neutros, núcleo e quatro passagens; `libraryRecordLayout.ts` contém somente a distribuição inicial, 13 slots derivados (2/2/3/3/3), placements e overflow imutáveis. A/B/C foram 5/13/13 placements e 0/0/4 overflow na inspeção aprovada. Testes `Box3` reais cobrem as fábricas, passagens, colisões e convivência com três estantes e 70 livros BF-2; 77 arquivos/616 testes passaram, junto de format:check, lint, typecheck, audio:check e build. A prévia temporária foi removida; a referência PNG 2D permanece documental. Não houve gate físico, assistivo, de ergonomia ou seleção.

**Handoff BF-3 → BF-4:** planejamento e BF-4A documental autorizados e registrados em 2026-11-01; BF-4B foi implementada e encerrada com CI e gate humano dirigido PASS sob autorização posterior; BF-4C foi implementada, auditada e fechada no escopo dirigido por exceção expressa ao gate CI (PR #9: 18/19 E2E); BF-4D foi auditada, aceita no Moto G06 e encerrada por exceção explícita às falhas E2E remotas (#4 e #11); BF-4E foi fechada posteriormente no escopo dirigido; BF-4F–G permanecem pendentes. O risco de oclusão/bounds e novos cenários de densidade/iluminação permanece para a evolução do mundo; TalkBack continua obrigatório antes do primeiro recorte real/beta. A intermitência CI `r4-shell` segue rastreada na issue #4, sem gate verde.

### BF-4 — Mundo Vivo e Habitável — BF-4B/BF-4C concluídas (2026-11-02)

**Contrato e gates detalhados:** [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md); decisão de escopo [ADR-012](decisions/ADR-012-bf-4-mundo-vivo.md).

BF-4B evolui **os cinco cômodos como um todo**, sem protótipo isolado de um cômodo; BF-4C os mobília, BF-4D organiza acessos e zonas de atividades, BF-4E integra interações ao runtime. BF-4F entrega **quatro habitantes sobrenaturais individualizados**, animações variadas, agentes comportamentais locais e **conversa RPG com 3–4 escolhas predefinidas por nó**, quests individuais e uma compartilhada (atualização ADR-013), dividida em F1–F4; BF-4G executa o gate integrado e físico. Há gates proporcionais e resultados observáveis por implementação, sem multiplicar checkpoints administrativos.

**BF-4A: PASS apenas documental.** Auditoria do baseline e contrato concluídos; **não** foram implementados ambiente, mobília, animação, agentes, diálogo ou integração, nem executados testes ou build nesta decisão. Posteriormente, BF-4B foi implementada, auditada e aprovada com a correção pontual de faixas de latão, CI verde da PR #8 e gate estético/funcional dirigido no Moto G06. **Fechada com ressalva visual R-19, não bloqueante**. **BF-4C concluída** após auditoria independente e validação física dirigida no Moto G06, aceitando por exceção [CI PR #9 (41387959550)](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41387959550) FAIL em 1/19 E2E `r4-shell` sob issue #4. A organização de estantes/TV/registros foi revisitada e aceita no gate físico dirigido da BF-4D; a [PR #10](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/10) foi autorizada a integrar por exceção CI, preservando [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) e [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11). Editor livre de mobília não está aprovado. Ver [fechamento](BF-4C_RELATORIO.md). Perfil produtivo GLB animado/skinning não é coberto pela ADR-010; conversação generativa aberta depende de nova decisão sobre execução/custo/privacidade. Sem persistência espacial, alteração de dados ou bypass das dívidas CI/TalkBack.

### BF-5 — Consolidação funcional

Executará regressão, validação Android, acessibilidade e fechamento do marco funcional aprovado.

O fechamento do primeiro recorte real continua bloqueado pela dívida de TalkBack: a remediação e a validação física incremental no Moto G06 usarão builds representativos então vigentes. Não há budget preventivo; mudanças materiais de densidade ou renderização exigem nova medição conforme a necessidade observada.

## Pipeline 3D v1 — adiado após P3D-B1

```text
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2 ⏸ ADIADO — fonte canônica editável normalizada
P3D-B3 ⏸ ADIADO — exportação e validação
P3D-B4 ⏸ ADIADO — promoção final
P3D-C ⏸ ADIADO — validação e relatório automatizados
P3D-D ⏸ ADIADO — preparação/exportação reproduzível
P3D-E ⏸ ADIADO — ingestão produtiva, ownership e unload
P3D-F ⏸ ADIADO — gate integrado e fechamento
```

ADR-010 continua regulando assets GLB produtivos. B1 preservou integralmente a proveniência de `bookshelf`: o upstream Quaternius é a fonte de partida, enquanto o `.blend` normalizado da F4 permanece apenas evidência histórica; o fixture F4-B não foi promovido. Os checkpoints adiados não foram concluídos nem cancelados e só retomam quando houver necessidade demonstrada de ingestão ou substituição por assets GLB definitivos.

## FUNDAÇÃO

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ✅ CONTRATO EXPERIMENTAL DE ASSETS 3D CONCLUÍDO
  F4-A ✅ CONCLUÍDA (preflight técnico + humano)
  F4-B ✅ CONCLUÍDA
  F4-C ✅ CONCLUÍDA
  F4-D ✅ CONCLUÍDA EXPERIMENTALMENTE
    D1 ✅ auditoria e contrato experimental
    D2 ✅ load → attach → unload com host vivo
    D3 ✅ repetição, isolamento e disposal
    D4 ✅ assíncrono, abandono, callbacks tardios e erros
    D5 ✅ regressão, consolidação e fechamento
  F4-E ✅ CONCLUÍDA EXPERIMENTALMENTE
    E1 ✅ baseline de custo
    E2 ✅ diagnóstico e seleção de hipótese
    E3 ✅ experimento selecionado
    E4 ✅ comparação objetiva + gate humano PASS
    E5 ✅ consolidação e fechamento
  F4-F ✅ consolidação final e handoff para F5
F5 ✅ CONCLUÍDA — performance e validação Android física
  F5-A ✅ baseline e cenário de carga
  F5-B ✅ stress físico, loading e limites
  F5-C ✅ consolidação, guardrails iniciais e gate final
F6 ✅ CONCLUÍDA — fechamento técnico/arquitetural
  F6-A ✅ contrato de acessibilidade e auditoria de lacunas
  F6-B ✅ evidência automatizada, regressão técnica e APK candidato
  F6-C ✅ fechamento documental com dívida assistiva aceita; sem PASS humano
FUNDAÇÃO ✅ CONCLUÍDA
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2–F ⏸ ADIADOS
BF-0 ✅ replanejamento e decisão arquitetural
BF-1A ✅ contrato mínimo e primeira fábrica procedural isolada
BF-1B ✅ composição declarativa e posicionamento determinístico
BF-1C ✅ integração estática com runtime e seleção
BF-1C-FIX ✅ técnico + gate visual humano no navegador PASS
BF-1D ✅ substituição procedural, descarte seletivo e gate integrado
BF-1 ✅ tecnicamente concluída
BF-2 ✅ primeira área de leitura integrada a registros reais
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico isolados
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E ✅ gate técnico e validação física dirigida positiva
BF-3 ✅ CONCLUÍDA NO ESCOPO TÉCNICO-FUNCIONAL E FÍSICO DIRIGIDO; CI PENDENTE
  BF-3A ✅ contrato e fronteiras — CONCLUÍDA DOCUMENTALMENTE
  BF-3B ✅ projeção neutra dos cinco tipos restantes — CONTRATOS E TESTES PUROS
  BF-3C ✅ procedural e layout isolados — CONCLUÍDA NO ESCOPO APROVADO
    BF-3C1 ✅ contrato breve e cinco fábricas — CONCLUÍDA TECNICAMENTE
    BF-3C2 ✅ layout determinístico e overflow — CONCLUÍDA TECNICAMENTE
    BF-3C3 ✅ hipótese 3 PASS humano e técnico; prévia removida
  BF-3D ✅ runtime e seleção — PASS TÉCNICO LOCAL
    BF-3D1 ✅ montagem e ownership — PASS TÉCNICO DIRIGIDO
    BF-3D2 ✅ catálogo, picking e seleção — PASS TÉCNICO LOCAL
    BF-3D3 ✅ robustez, regressão e fechamento — PASS TÉCNICO LOCAL
  BF-3E ✅ React/aplicação e fluxo funcional — PASS TÉCNICO
    BF-3E1 ✅ consulta agregada e ponte React → runtime
    BF-3E2 ✅ interface funcional dos seis tipos — implementação local
    BF-3E3 ✅ gate consolidado — auditoria independente e CI PASS
  BF-3F ✅ gate físico dirigido 11/11 PASS; exceção CI documentada (#4)
```

### F2 — Integração e endurecimento da Fundação Three.js — concluída

Integração e endurecimento da Fundação Three.js, consolidando limites React/runtime, lifecycle, recuperação, organização interna e contratos estáveis. F2-B definiu a falha terminal pública e o fallback React; F2-C consolidou ownership da montagem; F2-D1 tornou falhas estruturais de render/resize terminais e impede render incidental durante pausa; F2-D2 definiu `webglcontextlost` como falha terminal e torna restoration tardia inerte; F2-E endureceu viewport/orientation/input contra dimensões transitórias, callbacks tardios e interrupções de Pointer Events, sem calibrar a ergonomia. F2-F executou a regressão consolidada, build web, E2E e Android técnico sem detectar regressão material.

F2 está concluída técnica e fisicamente no escopo da validação curta: a revalidação humana no Moto G06 confirmou lifecycle observável por background/resume, alinhamento React/canvas, seleção/highlight, pan, pinch, toque, controles React e rotação/orientação, sem regressão funcional perceptível. Quedas transitórias de FPS em orientação e em extremos rápidos de zoom recuperaram para aproximadamente 60 FPS, são não bloqueantes e não estabelecem causalidade com a F2. Câmera e interação finais continuam em F3.

### F3 — Câmera e interação mobile — concluída

Refinar câmera ortográfica/2.5D, pan, zoom, pinch, limites, seleção e ergonomia em tela pequena.

#### F3-A — Contrato e baseline da câmera — concluída

Mapeou e testou o baseline real: o runtime possui a instância/ciclo de vida da câmera e a interação possui a navegação por gesto; o frustum da fixture F1 é derivado por matemática pura somente de viewport válido. Não houve mudança de calibração, persistência espacial ou UX observável.

#### F3-B — Modelo de câmera, framing e limites — concluída

Consolidou estado runtime-only único para foco X/Z e zoom, framing determinístico a partir dos bounds técnicos da fixture, clamp dependente de viewport/zoom e resize que preserva a exploração e seleção. Target Y foi fixado porque sua liberdade era deriva incidental do pan no `camera.up`; o GLB tardio não participa do framing.

#### F3-C — Pan, zoom e pinch — concluída

Transformou o modelo F3-B em navegação espacial ancorada: pan resolve a tela no plano X/Z, wheel preserva o ponto sob o cursor e pinch usa razão de distâncias, midpoint e seu deslocamento para pan+zoom. Bounds, lifecycle e seleção foram preservados; não houve calibração física nem alteração da arbitragem tap/gesto.

#### F3-D — Tap, seleção e arbitragem de gestos — concluída

Consolidou uma candidatura de tap monotônica por pointer: até `8` CSS px inclusive permanece tap, ultrapassar o slop consome o primeiro delta e invalida seleção mesmo que o pointer retorne à origem. Segundo pointer/pinch, wheel com pointer ativo, cancelamento, perda de capture, pausa e terminalidade também invalidam; o Raycaster só executa no `pointerup` confirmado e tap vazio limpa seleção. Não houve recalibração de câmera, persistência espacial ou alteração da ponte React ↔ Three.

#### F3-E — Viewport, orientação, safe areas e integração mobile — concluída

Consolidou a autoridade do tamanho no `world-host` observado, sem transportar constantes de header, dock, safe areas ou breakpoints para Three. O layout reutiliza o contrato global de safe areas e a reserva já existente do dock fixo; o canvas se adapta sem overflow horizontal. Resize/orientação preservam a montagem, seleção e exploração lógica salvo clamp necessário, anulam somente o gesto em curso e mantêm picking no bounding rect atual. O gate Chromium cobriu 390×844, 844×390 e 320×640, sem provar a ergonomia ou system bars físicos.

#### F3-F1 — Gate técnico consolidado + APK — concluído

Executou a regressão completa, confirmou os contratos acumulados, gerou build web, APK debug e cobertura E2E integral. Não forneceu evidência de instalação ou uso físico.

#### F3-F2-FIX — Correção dos limites diagonais — concluída tecnicamente

O gate físico encontrou perda total da fixture nos limites superiores. O clamp deixou de combinar apenas os extremos independentes do retângulo envolvente: ele conserva um patch retangular de área mínima dentro da projeção convexa do piso técnico e dentro da viewport. A regra cobre portrait/landscape, quatro cantos e zoom `0.7–2.2`, sem alterar pan, zoom focal, pinch, seleção, lifecycle ou renderer.

#### Fechamento F3 — evidência humana e correção final dos bounds

A validação humana ampla no Moto G06 foi positiva para abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo, inclusive durante rotação. A observação é da fixture técnica e não é benchmark ou garantia do mundo final.

Durante essa validação, os limites superiores esquerdo/direito ainda podiam mostrar somente fundo. A correção F3-F2-FIX substituiu o AABB da projeção por região convexa válida de centros de câmera e preserva um patch do piso técnico de 15% dos spans projetados, limitado pelo espaço disponível. Ela preservou `CameraNavigation`, gestos, zoom, lifecycle e renderer; passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync Android e debug build, com novo APK. Não houve revalidação física específica desse fix no Moto G06; a ausência foi aceita como risco residual não bloqueante porque a falha era localizada, a correção é matemática e coberta, os contratos não mudaram e a fixture é descartável. F3 está encerrada.

### F4 — Contrato experimental de assets 3D — concluída

F4 produz evidência experimental para um pipeline 3D posterior; não o formaliza. GLTF/GLB continua o caminho de runtime da Fundação. Não há persistência espacial, catálogo real, asset manager definitivo ou pipeline artístico aprovado nesta fase.

#### F4-A — Contrato + preflight de autoria — concluída

Auditoria do caminho atual, contrato experimental e preflight da ferramenta de autoria foram concluídos. Blender 3.3.21 passou no preflight técnico (CLI, save `.blend`, export GLB 2.0 e reimport) e no gate humano no Fedora (viewport e operações básicas utilizáveis, sem falha visual ou de estabilidade relevante). Ele está aprovado somente como ferramenta experimental de autoria durante F4, continua substituível e não se torna dependência nem ferramenta definitiva do Pipeline 3D.

#### F4-B — Geometria, escala, eixos e pivô — concluída

O `GLTFLoader` instalado confirmou quatro GLBs normalizados com procedência suficiente sem correções individuais: root lógico em identidade, chão no `Y=0` e bounds `[largura, altura, profundidade]`. O mapeamento observado é Blender `X →` Three `X`, `Y → -Z` e `Z → Y`. O diagnóstico do Azrael confirmou root lógico utilizável com nove meshes, mas a ausência de evidência local suficiente de licença/proveniência impede sua promoção ao checkout. O contrato permanece experimental; frente visual/funcional, materiais/texturas, custo e pipeline definitivo não foram congelados.

#### F4-C — Materiais, UV e texturas — concluída experimentalmente

F4-C1 inventariou materiais, UVs e imagens dos quatro espécimes F4-B; F4-C2 registrou o contrato técnico mínimo experimental; F4-C3 comprovou os quatro GLBs pelo `GLTFLoader` instalado; C4 preparou um harness isolado e temporário; C5 registrou observação humana visual coerente; e C6 consolidou o contrato e removeu o harness. F4-C não estabelece especificação artística ou técnica permanente, equivalência pixel a pixel ou fidelidade científica.

#### F4-D — Loading, unload e ownership/disposal — concluída experimentalmente

D1 mapeou o fixture F1 real: a montagem terminal é seu único owner registrado, `disposeObjectTree()` deduplica recursos dentro de uma árvore e não existe unload mantendo host vivo. O contrato experimental exige um owner único depois do attach, cancelamento lógico de intenção durante loading, descarte do resultado tardio, unload idempotente que remove/libera somente o root alvo e falha individual separada da falha do host. Não escolhe API, `AssetManager`, cache, abort físico ou gerenciamento global.

D2 comprovou em harness isolado o ciclo KayKit real `GLTFLoader` → owner local → `THREE.Scene` → `disposeObjectTree()`: geometry, material e texture emitiram disposal, o sentinel e a mesma instância de host permaneceram, e novo parse/attach funcionou. O owner existe somente no teste; não há API, manager, cache ou mudança de `ThreeWorldRuntime`.

D3 comprovou unload repetido inerte, três ciclos KayKit sem acúmulo, owners independentes para Poly Haven e Kenney no mesmo host e unload seletivo de A sem disposal de B. A `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único `dispose`; `referenceScene.test.ts` mantém a cobertura complementar da deduplicação geral intrárvore. Não há política de sharing entre assets, referência contada, cache, manager ou API de produção.

D4 comprovou com roots Quaternius reais e callbacks controlados somente no teste que abandono lógico, sucesso adicional, erro tardio e encerramento do owner rejeitam resultados stale sem anexá-los; cada resultado rejeitado é liberado uma vez. Erro individual deixa o host utilizável para nova tentativa. Não há abort físico, cancelamento de rede, cache, manager ou API de produção.

D5 reuniu F4-B/C/D em gate dirigido de 4 arquivos/20 testes e confirmou a suíte unitária integral com 67 arquivos/510 testes, sem retries ou falhas. F4-D está concluída experimentalmente: o owner e o double permanecem somente no harness, `ThreeWorldRuntime` não recebeu unload dinâmico e não há API, manager, cache ou abort físico.

#### F4-E — Custo e compressão experimental — concluída experimentalmente

E1–E5 concluíram baseline, diagnóstico, variante, comparação e consolidação sem alterar o fixture registrado. Poly Haven concentrou o custo do corpus em três imagens 1024×1024; a variante 512 reduziu o GLB de 5.828.612 para 711.352 bytes (-87,796%), as imagens codificadas em -88,013% e a estimativa RGBA8 base de 12 para 3 MiB, preservando geometry/índices/UV/transforms/material e o `GLTFLoader` atual. O gate humano foi PASS, com leve desfoque em comparação próxima considerado irrelevante para objetos menores e mais distantes na composição ortográfica/2.5D. É evidência deste asset/experimento, não budget global, asset final ou Pipeline 3D definitivo. KTX2/Basis, Draco, Meshopt e quantização não foram adotados.

#### F4-F — Regressão, consolidação e handoff F5 — concluída

Consolidou A–E em contrato experimental: autoria editável e substituível, normalização no asset antes do runtime, materiais PBR relevantes, lifecycle/ownership apenas em harness e custo medido antes de otimizar. Confirmou os quatro fixtures registrados, manteve os testes de contrato, excluiu o laboratório externo da dependência de F5 e não criou `AssetManager`, budget, codec, pipeline produtivo, conteúdo ou persistência espacial.

### F5 — Performance e Android físico — concluída

F5-A preparou o build de diagnóstico para o Moto G06: baseline F1, corpus F4 uma vez e corpus F4 ×4, todos pelo `ThreeWorldRuntime`/`WebGLRenderer` reais. F5-B mediu os três cenários no aparelho, inclusive loading, repouso, memória, remount, interação, orientação, background/resume e sessão de aproximadamente 15 minutos no corpus ×4. F5-C consolidou isso como envelope observado e gatilhos de remedição, não como hard caps: o teto do aparelho não foi encontrado e nenhuma otimização avançada foi justificada.

F6 foi concluída tecnicamente/arquiteturalmente sem criar mundo ou persistência espacial. P3D-A posterior formalizou o contrato produtivo do Pipeline 3D v1; P3D-B1 preservou documentalmente o candidato `bookshelf`, sem criar fonte canônica normalizada, GLB, ingestão produtiva ou implementação de mundo. BF-0 adiou P3D-B2–F e priorizou a trilha funcional com conteúdo procedural/provisório. A dívida de validação humana assistiva permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release dependente da experiência acessível; ela deve usar o build então vigente, não necessariamente o APK F6-B.

### F6 — Acessibilidade e fechamento da FUNDAÇÃO — concluída tecnicamente

F6-A concluiu a auditoria do contrato entre a superfície 3D e React semântico. F6-B confirmou a única lacuna automatizável — foco/teclado e marcos semânticos estruturais — sem alteração de produção; a regressão técnica, E2E e build Android aprovaram o APK candidato. F6-C aceitou documentalmente a indisponibilidade temporária do Moto G06 como dívida assistiva, sem declarar TalkBack ou acessibilidade humana Android aprovados. A FUNDAÇÃO está concluída no plano técnico/arquitetural. P3D-A continua regulando GLBs, P3D-B1 preserva a proveniência de `bookshelf` e P3D-B2–F estão adiados; BF-1A/B concluíram fábrica e composição, BF-1C a integrou estaticamente ao runtime normal, BF-1C-FIX recebeu PASS visual humano no navegador e BF-1D concluiu a troca procedural e seu gate integrado.

F1 aprovou a viabilidade da base Three.js; não concluiu câmera, interação, assets, performance ou acessibilidade finais.

## Depois da FUNDAÇÃO

1. Antes do fechamento do primeiro recorte real e de beta/release aplicável, validar TalkBack no Moto G06; essa dívida humana continua pendente e não reabre o encerramento técnico da BF-1.
2. BF-2–BF-5 só avançam com autorização explícita: integrar progressivamente leitura, os seis tipos de registro e o ambiente provisório, preservando a operação essencial em React.
3. Retomar P3D-B2–F somente se a ingestão ou substituição por GLB definitivo se tornar necessária.
4. Projetar persistência espacial nova somente quando uma necessidade funcional demonstrar o que deve ser salvo.

## BF-4D — Fechamento no escopo dirigido, exceção CI (2026-11-02)

D1–D4 implementadas e avaliadas: organização dos cinco cômodos, circulação de 1,2 m, 18 zonas/pontos, regressões. **Auditoria estática e gate físico/visual dirigido no Moto G06 aprovados** (quatro capturas; pan/zoom/seleção/orientação sem regressões relatadas). **CI [PR #10/41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) FAIL**, 19/21 E2E PASS: `r4-shell` histórico ([#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4)) e E2E BF-4D novo com coleção cheia 1280px ([#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)). Usuário autorizou explicitamente concluir e integrar apesar das duas dívidas, sem falso PASS de CI; BF-4D fechada no escopo dirigido. [Relatório final](BF-4D_RELATORIO.md).

BF-4E e BF-4F poderão consumir as reservas geométricas após autorização própria. Precisarão validar dimensões dos personagens, destinos/poses, ocupação simultânea e comportamento; dados BF-4D não são navmesh, ações ou rotas fisicamente aprovadas. Editor de arraste livre/persistência de mobília continuam fora do escopo aprovado. BF-4G conserva o gate integrado/físico; TalkBack e issue #4 permanecem.

## BF-4E — checkpoint histórico de implementação (2026-11-02)

BF-4E: implementação integrada em verificação. Próximos gates autorizados: regressão, revisão independente da Luna e validação humana Moto G06. BF-4F permanece futura; nenhuma entidade/autonomia de personagem foi criada. [Relatório técnico](BF-4E_RELATORIO.md).

## BF-4E — Encerrada no escopo dirigido com dívida CI (2026-11-02)

[PR #12](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/12) autorizada para merge após validação física no Moto G06: dez famílias ambientais, interação direta, atmosfera pelo horário/atividade/descoberta, três modos, Segredo do Pergaminho concluído 4/4 e hotfix dos alvos pequenos, gaveta E e mensagens temporárias confirmados. [CI 41438324911](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41438324911): 661 Vitest PASS, gates estáticos/build PASS, mas **20/24 E2E PASS / CI FAIL**; coleção cheia (#11) e shell (#4) permanecem dívidas não resolvidas. Sem benchmark sustentado, TalkBack PASS, beta/release, edição persistente de móveis ou NPCs. O próximo planejamento é **BF-4F1–F4**, visando **quatro** habitantes — Samael, Aryn, Ytha e Lua — com animações, atividades, relações próprias e **quests com diálogo RPG ramificado offline**; BF-4G fará gate integrado. [Relatório final](BF-4E_RELATORIO.md).

## BF-4F — Concepção aprovada dos quatro habitantes (2026-11-02)

O usuário adotou a criação inicial de **Samael (espírito demoníaco), Aryn (elfa), Ytha (fada) e Lua (maga imortal)**, com silhuetas/roupas/expressões distintas, rotinas com preferência de horário, poderes, seis relações mútuas, **quatro quests individuais** e arcos conjuntos, além de **diálogo local por escolhas de três ou quatro botões** no estilo de quests de RPG (sem LLM). **A meta anterior de três foi superada pela decisão expressa mais recente**, formalizada na [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) e detalhada na [bíbia de concepção BF-4F](BF-4F_CONCEPCAO_HABITANTES.md). BF-4F1–F4 continuam **não implementadas**; roteiro de Codex, branch, testes, APK, gate físico e merge requerem autorização própria. BF-4G e dívidas #4/#11, R-19 e TalkBack permanecem.

## BF-4F — Sequência técnica aprovada sem preflight independente (2026-11-02)

A execução terá **somente F1–F4**, com integração progressiva: **F1** cria/integra no mundo completo os quatro habitantes visualmente distintos (validação embutida de autoria, articulação, GLB/animador e descarte durante a produção de personagem real, **sem spike separado**); **F2** implementa movimentos/gestos/transições; **F3** desenvolve agência local, rotas, vínculos mútuos e eventos; **F4** entrega motor de diálogo por 3–4 botões, quatro quests individuais e uma coletiva. Cada checkpoint terá testes e revisão proporcionais, commit/push e **PR sem merge**; aprovação de PR e gate físico humanos posteriores. Contrato operacional: [BF-4F_PLANO_TECNICO.md](BF-4F_PLANO_TECNICO.md). Nenhuma F1–F4 iniciada por este planejamento. BF-4G e dívidas históricas permanecem.

## BF-4F1 — Fechamento dirigido (2026-11-02)

Quatro modelos iniciais integrados, fotos do mundo real no Moto G06 e seleção dos quatro pelo toque e React **aprovados pelo usuário**. Commit `de0bea64718ccfb2501a11f1541d8ac4abca3396`, [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13). Formatação, lint, TypeScript, 667 Vitest, áudio, build e relatório de performance PASS na [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206); **E2E concluídos com **20 PASS, 6 FAIL e 1 flaky; CI global FAIL****. Microgestos de cabeça não equivalem a animação corporal: **F2 é a próxima etapa**. F3/F4, BF-4G, questões #4/#11, R-19 e TalkBack permanecem. As observações anteriores de F1 “aberta” ou “não implementada” são históricas. [Relatório](BF-4F1_RELATORIO.md).

## BF-4F3 — fechamento e transição para F4 (2026-11-02)

Autonomia, convivência e integração passaram no Moto G06; o acidente de Lua e o reparo do folio não tiveram validação artística física. O usuário autorizou explicitamente encerrar F3 por exceção. O núcleo, a navegação A–E, as seis relações e cenas têm provas de código/testes, mas não há aprovação artística exaustiva de cada par. A CI remota [#16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) permaneceu **FAIL (21 PASS, 10 FAIL, 1 flaky)**; novo cenário F3 passou, dez FAIL correspondem aos nomes de cenários F2 anteriores. Não mascarar nem reclassificar regressões sem diagnóstico. Dívidas #4/#11/#15, R-19, TalkBack, gate BF-4G, desempenho sustentado e o folio continuam rastreados.

**Próxima F4:** quatro diálogos RPG/quests individuais e arco coletivo, com 3–4 escolhas predefinidas nos nós narrativos, consequências contextuais e progressão de sessão. Priorizar escrita, caracterização e encenação; evitar engine genérica e centralizar F4 em módulos próprios, não acrescentar toda a lógica ao `inhabitantAgency.ts` (~1040 linhas). Preservar a cota Codex com testes dirigidos, sem loops de timeout e sem simplificação artística preventiva. Não iniciar esta etapa durante o fechamento F3.

## Próximos passos da candidata BF-4F4

Auditar a única PR draft da F4 e validar no Moto G06 personalidade, cinco histórias, dois caminhos significativos, acontecimento coletivo e conforto do painel. Corrigir defeitos demonstrados no mesmo escopo. **Não iniciar novas quests, persistência narrativa ou BF-4G antes de decisão própria.** Somente decisão expressa do usuário poderá encerrar F4/BF-4F ou autorizar merge. [Relatório e roteiro](BF-4F4_RELATORIO.md).

## Pós-BF-4F4 — transição para BF-4G e refinamentos futuros (2026-11-02)

**BF-4F1–F4 concluídas em escopo dirigido.** Na BF-4F4, o usuário aprovou funcionalmente as questões/escolhas da experiência RPG no Moto G06 e autorizou encerrar/mesclar a [PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/17), mesmo com [CI global FAIL (23 PASS, 11 FAIL)](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711). As capturas evidenciam diálogos, escolhas e mundo 3D; não provam todas as rotas/finais ou a cena de Lua F3. As issues #4/#11/#15, folio Lua, TalkBack, R-19 e desempenho sustentado não foram resolvidos por esse aceite.

**BF-4G é a próxima etapa já prevista:** gate integrado dos cinco cômodos, habitantes, BF-4E e narrativas, correção apenas de regressões concretas e documentação honesta de exceções. **Não confundir BF-4G com beta/release ou declarar CI global verde sem prova.** Preparar planejamento e autorização de implementação em etapa própria.

**Dois eixos de refinamento intencionalmente adiados para fases posteriores distintas, ainda sem números ou branches definidos:**

1. **UI/UX e ergonomia mobile:** hierarquia, dimensão e rolagem do painel de pergaminho, tipografia, alvos de toque, integração do diário, espaço seguro diante da barra de navegação inferior e orientação retrato/paisagem, acessibilidade e polimento. As capturas do Moto G06 revelam painel longo com opções alcançadas por rolagem e proximidade/oclusão visual pela navegação inferior; melhorar sem substituir o mundo por UI dominante.
2. **Personagens e RPG/diálogos/interatividade:** acabamento e identidade visual, atuação corporal durante conversas, coesão espacial da Fenda, gestos, efeitos, dinamismo social, variedade e profundidade narrativa e consequências perceptíveis. Sem presumir limitação do Moto G06 nem antecipar engine genérica, LLM ou dependências.

Esses eixos são **intenção futura do usuário, não defeitos bloqueadores da entrega F4 nem autorização automática de implementação**. Definir escopo e prioridades posteriormente; priorizar ambição criativa, medir gargalos reais e usar testes proporcionais.

## BF-4G encerrada e próximos passos (2026-11-03)

**BF-4 / BF-4G concluídas em escopo funcional dirigido:** auditoria independente favorável, rodada física Moto G06 **6/6 PASS** e merge da [PR #18](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/18) autorizado expressamente. [CI #41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247) **FAIL global (30 E2E PASS, 3 FAIL, 1 flaky)**; #4/#11/#15 permanecem abertas, com uma flakiness adicional no fluxo busca/Arquivo. Folio de Lua, R-19, TalkBack, desempenho sustentado e avaliação individual de todos os arcos não receberam novo gate específico.

**Planejamento subsequente, não implementação aprovada:** BF-5 mantém a consolidação funcional e o gate assistivo antes de qualquer beta/release. O usuário reservou separadamente uma fase de **UI/UX mobile** e outra de **aprimoramento dos personagens/RPG/diálogos/interatividade**, ambas sem numeração nem início autorizado. O refinamento deverá preservar a ambição artística e empregar otimização reativa e testes proporcionais. [Fechamento BF-4G](BF-4G_RELATORIO.md).

## Próximos passos após a candidata R5

Avaliar individualmente Samael, Aryn, Ytha e Lua no Moto G06 com o roteiro R5; registrar arte, contato, animação, seleção, lifecycle e fluidez percebida. Refinamentos no escopo R5 podem responder aos defeitos demonstrados sem reabrir as seis representações R2 aprovadas. Somente o proprietário poderá aceitar/encerrar R5 e o programa ou autorizar integração. Assento/leitura sentada, BF-5.5F2B/F2C, gate G e dívida assistiva permanecem reservados; sockets e skins não os concluem. Não disparar Actions antes de 01/12/2026 sem nova autorização.
