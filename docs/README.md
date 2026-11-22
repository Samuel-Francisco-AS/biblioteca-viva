> **PLANEJAMENTO BF-5.7 — 22/11/2026:** consulte a [reestruturação A–H](BF-5_7_REESTRUTURACAO_A-H_2026-11-22.md), sua [PR #60](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/60) e a [reconciliação final da BF-5.7B](BF-5_7B_RECONCILIACAO_2026-11-22.md). A BF-5.7 permanece aberta; C–H não iniciadas. O corpo da issue #50 será sincronizado após o aceite da PR #60.

---

> **REGISTRO HISTÓRICO — 21/11/2026 (superado em 22/11/2026):** BF-5.7B concluída funcionalmente e consolidada na [PR #58](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58). A BF-5.7A permanece integrada pela PR #51 e a BF-5.6 permanece encerrada com ressalvas. O gate Moto G06 aprovou órbita, reentrada, Arcanário, flashcards, questões e persistência. Travamentos de transição e fluidez insuficiente continuam como dívida técnica conhecida, sem métricas físicas ou certificação de desempenho. Use a [issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50) como planejamento mestre.

[BF-5.7B2.5-R3 — reparos após gate físico](BF-5_7B2_5_R3_GATE_FISICO_REPAROS.md): resultado funcional aprovado no Moto G06, com dívidas de fluidez registradas sem métrica nova.

[BF-5.7B2.5 — saneamento residual](BF-5_7B2_5_SANEAMENTO_RESIDUAL.md): auditoria de dependências, integridade e retenção.

[BF-5.7B2.4-R2 — reparos físicos](BF-5_7B2_4_R2_REPAROS_FISICOS.md): órbita por tempo ativo, Choices e limites da validação Android.

**FECHAMENTO CANÔNICO — 11/11/2026: BF-5.6 O Arcanário ENCERRADA COM RESSALVAS** após aceite explícito do proprietário. [Termo global A–G](BF-5_6_FECHAMENTO_GLOBAL_2026-11-11.md) · [Auditoria G](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md). E2E, CI, acessibilidade/termal e UI/UX residual continuam pendências registradas. Sem novo APK pós-G nem início automático da BF-6/BF-7. Notas antigas indicando “aguarda aceite” são históricas.

**BF-5.6G — 11/11/2026:** [Auditoria integrada e consolidação, G1–G4](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md) · [Matriz de evidências](audits/evidence/bf56g/inventory.json). Rodada realizada diretamente na `main`: reparo de alternativa acessível para portal orbital (teste escrito, não executado), ADR-031 única para performance, inventário de versões/risco. **Auditoria G entregue com ressalvas; BF-5.6 global ainda aguarda aceite expresso para fechamento.** Não alegar CI verde, APK pós-G ou TalkBack/FPS/termal certificados; notas anteriores são cronologia.

> **BV-UXC R5:** [relatório global e gate Moto G06](audits/BV_UXC_R5_DESEMPENHO_GLOBAL_2026-11-09.md), [ADR-031](decisions/ADR-031-desempenho-rotas-consultas.md), [validação](audits/evidence/bv-uxc-r5/validation.json). Candidata draft #49, sem merge ou aceite físico.

**CANDIDATA DE UX (09/11/2026):** [BV-UXC — Continuidade entre toque e ação](BV_UX_CONTINUIDADE_TOQUE_2026-11-09.md), branch remota separada, sem merge, CI esgotada e gate Moto G06 pendente. Estado canônico da `main` abaixo preservado.

**ESTADO — 09/11/2026: BF-5.6A–F integradas à `main`.** A PR #48 (F1+F2+R1–R4) foi aprovada pelo proprietário e integrada no merge `690be5b5798d34e6436610bf9d209ede38629fd7`. [Fechamento formal F com ressalvas](BF-5_6F_FECHAMENTO_2026-11-09.md): arena de game fullscreen, lua arcana orbitante e cartas/efeitos refinados; E2E de acesso orbital e timeouts gráficos pendentes, CI sem cota. A fase global BF-5.6 continua aberta para a G, ainda não iniciada. Notas anteriores de “candidata/PR draft” abaixo são cronologia.

[BF-5.6F2 — Arena Viva e construção orbital](BF-5_6F_ARENA_VIVA_IMPLEMENTACAO.md): candidata PR #48, arquitetura, evidências e roteiro físico.

**BF-5.6F1 — fundação técnica em branch/PR dedicada (09/11/2026):** [contratos, rota e handoff para F2](BF-5_6F_F1_HANDOFF.md). O Duelo Arcano 2D permanece público; a arena 3D ainda não existe. F1 não foi integrada à main nem certificada por Android/CI; F2 continuará na mesma PR draft. Experiência-alvo: game fullscreen, sem scroll ou instruções persistentes, HUD contextual com safe areas do Moto G06 e mundo 3D residente preservado.

**ATUALIZAÇÃO — 09/11/2026:** BF-5.6E [PR #47](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/47) **integrada à `main`** (merge `19eb076a`) após aceite funcional inicial no Moto G06. Motor TCG, 48 cartas/gravuras e decks, IA PvE, autoria e backup v11. **UI/UX do Arcanário, navegação do duelo e arte final NÃO aprovadas:** reformulação transversal posterior, não concluída nesta PR. [Fechamento E e dívidas prioritárias](BF-5_6E_FECHAMENTO_2026-11-09.md). A BF-5.6 segue aberta para F/G, revisão UX/arte, equilíbrio e gates restantes. Notas abaixo são cronologia.

[BF-5.6E — Duelo Arcano: implementação candidata](BF-5_6E_TCG_DUELO_ARCANO_IMPLEMENTACAO.md): regulamento, 48 cartas ilustradas, decks, IA local, mesa 2D, autoria, dados, simulações, validação e gate Moto G06. [ADR-029](decisions/ADR-029-duelo-arcano-regulamento.md). Sem merge/encerramento BF-5.6 ou F/G/BF-6.

**ATUALIZAÇÃO — 09/11/2026:** BF-5.6D integrada na `main` após [gate dirigido 6/6 PASS no Moto G06](BF-5_6D_FECHAMENTO_2026-11-09.md), [PR #46](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/46) merge `b3db5d87`. Marco A–D educacional integrado; Dexie v18/backup v10 e biblioteca de pacotes offline. **BF-5.6 continua aberta** para TCG (E), arena (F), auditoria (G). Pendências de CI/Canvas headless/TalkBack/termal e direitos oficiais permanecem. Notas abaixo são cronologia.

**BF-5.6D — Biblioteca de Provas em candidata (09/11/2026):** [implementação D1/D2/D3, fontes, direitos, testes, APK e gates](BF-5_6D_PACOTES_OFICIAIS_IMPLEMENTACAO.md) · [ADR-028: pacotes e retenção](decisions/ADR-028-pacotes-educacionais-retencao.md) · [roteiro Moto G06](audits/evidence/bf56d/MOTO_G06.md). Dexie v18/backup v10, lê v6–v9. ENEM/CNU são referências sem enunciados; demonstração autoral instalável de quatro questões. Sem aceite físico, merge D, encerramento da fase ou E–G.

> **BF-5.6C [PR #45 draft](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/45) (08/11/2026):** [Provações, taxonomia, diagnóstico, reparos B-R1/B-R2, evidências e roteiro A+B+C](BF-5_6C_PROVACOES_DIAGNOSTICO_IMPLEMENTACAO.md) · [ADR-027](decisions/ADR-027-provacao-taxonomia-diagnostico.md). Dexie v17/backup v9; C sobre B/PR #44 sobre A/PR #43, sem merge/fechamento ou aceite físico. D–G não iniciadas; notas abaixo são cronologia.

> **BF-5.6B candidata, [PR #44 draft](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/44) (08/11/2026):** [Oficina, Coleções, Ecos e Relicário — implementação, evidências e gate A+B](BF-5_6B_OFICINA_COLECOES_IMPLEMENTACAO.md); [ADR-026 — mídia, backup v8 e troca autoral v1](decisions/ADR-026-arcanario-oficina-midias-troca.md). Dependente da A/PR #43 sem merge; ambas aguardam gate físico/aceite. C–G não iniciadas. A cronologia abaixo não substitui este estado.

> **BF-5.6A candidata (08/11/2026):** [fundação implementada, migração, backup e roteiro Moto G06](BF-5_6A_FUNDACAO_IMPLEMENTACAO.md) · [ADR-025](decisions/ADR-025-arcanario-fundacao-persistencia.md). Dexie v15/backup v7; aceite do proprietário pendente, B–G não iniciadas. Notas anteriores abaixo são cronologia.

> **08/11/2026 — Próxima fase planejada: BF-5.6 — O Arcanário.** O proprietário aprovou inserir cartas e baralhos globais, Provações educativas com tags e diagnóstico, pacotes oficiais instaláveis, Relicário, TCG PvE autoral e arena orbital **antes da BF-6**. [Plano em 7 etapas, marcos e gates](BF-5_6_ARCANARIO_PLANO.md) · [ADR-020 revisada](decisions/ADR-020-baralhos-e-cartas-globais.md). **Documentação apenas**, sem implementação ou autorização automática para a etapa A. BF-5.5 permanece fechada com ressalvas; entradas anteriores abaixo são cronologia.

> **08/11/2026 — Fechamento BF-5.5:** o proprietário aceitou a F2 funcionalmente (5/5 grupos no Moto G06) e autorizou encerramento por ressalvas da G após avaliação física. Integração sequencial das PRs #41 e #42, preservando histórico; não declarar CI global verde, HUD paisagem E2E aprovado ou acabamento perfeito. [Registro final de BF-5.5](BF-5_5_FECHAMENTO_2026-11-08.md). Notas anteriores são cronologia.

> **BF-5.5G — candidata atual:** [refinamento de animações, navegação e HUD, resultados e roteiro Moto G06](BF-5_5G_REFINAMENTO.md). F2 aprovada funcionalmente; G aguarda aceite artístico/físico, sem fechamento da BF-5.5 ou merge. STATUS continua autoridade do presente; as notas abaixo são cronologia.

> **08/11/2026 — Fechamento R1–R5:** o programa de recuperação foi aceito pelo proprietário no Moto G06 e integrado via PR #40 com ressalvas documentadas. Quests mantêm engasgo residual; CI/E2E, memória sustentada e TalkBack não foram aprovados. BF-5.5 continua parcial. [Relatório canônico de fechamento](audits/BV_FECHAMENTO_RECUPERACAO_R1_R5_2026-11-08.md). Notas anteriores registram a cronologia.

> **R5R — reparo pontual do contorno (08/11/2026):** proprietário confirmou melhora perceptível da luminosidade/detalhes mágicos, mas quests ainda engasgam e surgiu listra clara na borda ao mover a câmera. Reprodução sem WebGL confirmou o outline fullscreen durante o estado inicial tap; removida somente essa regra. Foco por teclado/seleção e navegação preservados; magia e diagnóstico R5Q intactos. Verificação física do reparo pendente, R5 aberta, mesma PR draft #40. [Causa, pares e gates](audits/BV_POLIMENTO_R5R.md#complemento--contorno-do-canvas).

> **R5R — candidata de polimento (08/11/2026):** proprietário ainda percebe engasgo nas quests e magia discreta no Moto G06. Frame/header/Adiar ficam integrais no commit, conteúdo entra em 120 ms sem delay; feedback de contato usa o gesto existente. Halos unlit, contraste emissivo, pergaminho e livro ativo mais legíveis, sem novas PointLights ou alteração dos ganhos R5P/Q. Candidata exige aceite físico de suavidade/fluidez e arte; R5 aberta, mesma PR draft #40, sem merge ou fase nova. [Comparações, custos e roteiro](audits/BV_POLIMENTO_R5R.md). Notas anteriores são cronologia.

> **R5Q residual — 08/11/2026:** proprietário testou `94bae8b` no Moto G06: **PASS início diretamente noturno; PASS fluidez geral; PARCIAL quests**, melhores mas ainda com engasgos. Complemento reaproveita os vértices exatos do toque também no highlight imediato; host Canvas P50 primeira 52→46 ms, troca 42→31 ms. Diagnóstico local opt-in limitado a 12 aberturas discrimina JS/DOM/foco/cena/submissão/CSS; não mede apresentação. Causa dominante residual Android e novo gate físico pendentes. Mesma PR draft #40, sem merge, R5/arte abertas. [Relatório e roteiro só de quests](audits/BV_SANEAMENTO_R5Q.md#complemento--engasgo-residual-das-quests). Notas abaixo preservam a cronologia.

> **R5Q — inicialização e quests:** [diagnóstico, medições e candidata](audits/BV_SANEAMENTO_R5Q.md). R5P recebeu relato físico de melhora; R5Q corrige primeiro desenho noturno e CPU do toque, com gate físico pendente na mesma PR draft #40.

> **R5P — prioridade fluidez:** [diagnóstico, A/B, candidata e limites](audits/BV_SANEAMENTO_PERFORMANCE_R5P.md). R5E recebeu relato físico de lag; arte suspensa e R5/R5E não aprovadas. Mesma PR draft #40, sem merge.

> **R5E — refinamento candidato:** [arte/comportamento/efeitos e custos](audits/BV_RECUPERACAO_R5E.md) · [roteiro Moto G06](audits/evidence/bv-r5e/MOTO_G06.md). Mesma PR #40, sem merge ou aceite automático.

> **R5 — candidata:** [Renascimento artístico dos habitantes](audits/BV_RECUPERACAO_R5.md), [pipeline autoral](INHABITANT_ART_PIPELINE.md) e [roteiro Moto G06](audits/evidence/bv-r5/MOTO_G06.md). PR draft #40, sem aceite humano ou encerramento da recuperação.

> **Integração R4:** [registro canônico e ressalvas](audits/BV_INTEGRACAO_PR39_R4_2026-11-07.md); R5 não iniciada. As notas anteriores de candidata são cronologia.

Saneamento ativo: [relógio e fólio de leitura pós-R4](audits/BV_SANEAMENTO_POS_R4_LEITURA.md), sobre R4A–D na PR draft #39; gate humano da candidata pendente.

> **R4 — candidata de 07/11/2026:** main base `d5eb469` integra PRs #32–#38 e aceites físicos dirigidos R2/R3/segurança. R4A–D implementadas na PR draft #39; gates estáticos, 935 unitários, web e APK debug locais PASS. Dados/sessões separados, diagnóstico opt-in e integridade v6 reforçada. Playwright dirigido **3 PASS/1 FAIL** (seleção R2 por deadline, causa não atribuída); sem aprovação física R4 ou CI global verde. [Autoridade canônica e evidências](audits/BV_RECUPERACAO_R4.md). BF-5.5 parcial; R5, F2B/F2C e BF-5.5G não iniciadas. Notas anteriores são cronologia.

> **Recuperação R3:** [relatório de loop, agência e lifecycle](audits/BV_RECUPERACAO_R3.md), candidata na PR draft #38; gate físico R3 e recuperação integral abertos.

> **RETOMADA VIGENTE (07/11/2026):** R2 e saneamento aprovados em teste dirigido no Moto G06; melhora considerável da fluidez, remodelagens aprovadas e Livro da Estrela corrigido. **Próxima: R3A–R3C**, na PR draft #38, sem merge; E2E/CI e gate quantitativo pendentes. [Resumo canônico para a próxima conversa](audits/BV_RETOMADA_R3_2026-11-07.md) · [Matriz de recuperação](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md). As notas antigas abaixo preservam a cronologia.

> **Saneamento pós-R2 (06/11/2026), PR draft #38:** [Livro da Estrela, quatro representações, custos e gates](audits/BV_SANEAMENTO_POS_R2.md). Feedback físico da R2 recebido; candidata nova requer retorno ao Moto G06. Recuperação integral aberta; R3/R4/R5 não iniciadas nesta rodada, sem merge. STATUS permanece autoridade do presente; notas anteriores abaixo são cronologia.

> **Recuperação vigente — 06/11/2026:** [execução R1–R5 e matriz dos 18 achados](audits/BV_PLANO_RECUPERACAO_EXECUCAO.md), sobre F `254ae15`; [auditoria de origem](audits/BV_AUDITORIA_ARQUITETURA_PERFORMANCE_STACK.md). R1 candidata, R2–R5 pendentes, sem gate físico/CI global verde. STATUS continua sendo a autoridade do presente; notas antigas abaixo são cronologia.

> BF-5.5D candidata: [relatório](BF-5_5D_RELATORIO.md) e [auditoria B/C](BF-5_5D_AUDITORIA_PRELIMINAR.md). Sem aceite físico ou fechamento.

> **PRÓXIMA FASE APROVADA EM PLANEJAMENTO — 05/11/2026: BF-5.5 — O Despertar da Biblioteca.** Inserida entre BF-5 (fechada no escopo aceito, com dívidas) e BF-6 (habitantes/RPG), preservando BF-7 (consolidação). Persistência dos habitantes, interação física com livros/pergaminhos/mobília, ritual de iluminação noturna robusto, magia visível e integração com sessões reais. **Documentação apenas, sem implementação iniciada.** [Plano e contrato](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md) · [ADR-023](decisions/ADR-023-bf-5-5-despertar-da-biblioteca.md) · [Roadmap](ROADMAP.md). A indicação histórica de BF-6 como próxima fase abaixo antecede esta decisão.

> **ESTADO VIGENTE — BF-5 ENCERRADA NO ESCOPO ARTÍSTICO/FUNCIONAL DIRIGIDO (05/11/2026).** As PRs #25–#30 foram integradas à `main` por merge commits após aceite do proprietário no Moto G06. CI global E2E continua vermelha, e as issues #21–#24 seguem rastreadas; nenhuma certificação de TalkBack, backup/restauração real ou beta/release é presumida. [**Relatório de fechamento e histórico completo**](BF-5_FECHAMENTO_2026-11-05.md). **BF-6 Mundo Vivo/RPG é a próxima fase para planejamento**, BF-7 guarda a consolidação e acessibilidade. As anotações abaixo sobre PRs draft/“BF-5 aberta” são históricas.

> **BF-5 — Atlas clássico projetado (2026-11-05), candidata na PR draft #30:** substitui o atlas articulado rejeitado por seis gravuras estáticas originais, três por conjunto, com dissolução suave, pausa/lifecycle e movimento reduzido. Empreitadas, avaliações, perfil e cálculos de treino preservados. Sem schema novo (Dexie v14 / backup v6). [Entrega e validação](BF-5_ATLAS_CLASSICO_PROJETADO.md) · [ADR-022](decisions/ADR-022-atlas-classico-projetado.md). **BF-5 aberta; sem merge ou aceite artístico/físico.** Para o atlas, esta nota substitui os estados anteriores.

> **BF-5 Parte 2F — candidata (2026-11-05):** Empreitadas com etapas/tarefas/diário e progresso calculado; Atlas Vivo SVG articulado masculino/feminino, perfil voluntário; avaliações por estrelas nos fólios/formulários e PNG Canvas. Branch `feat/bf5-parte2f-empreitadas-atlas-avaliacoes`, base da PR #29 `7267a3e`. Dexie v14 aditiva, backup v6 compatível. [Contrato, evidências, verificações e roteiro físico](BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md) · [ADR-021](decisions/ADR-021-empreitadas-atlas-avaliacoes.md). **BF-5 aberta; sem merge, aceite físico/artístico ou CI global verde.** Esta nota prevalece para este recorte; demais contratos da stack permanecem vigentes.

[BF-5 Parte 2E — seletores, capas e ateliê](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md): candidata sobre a #28, com [ADR-019](decisions/ADR-019-controles-internos-capas-atelie.md) e [recomendação de baralhos globais](decisions/ADR-020-baralhos-e-cartas-globais.md). BF-5 aberta; teste físico pendente.

[BF-5 Parte 2D — Entretenimento, catálogo e compositor cinematográfico](BF-5_PARTE2D_ENTRETENIMENTO.md): candidata encadeada à #27, com [ADR-018](decisions/ADR-018-entretenimento-catalogo-midia-local.md), mídia local e preservação dos seis tipos técnicos. BF-5 aberta.

[BF-5 Parte 2C — ficha viva, gráfico e estimativa local](BF-5_PARTE2C_ATIVIDADE_FISICA.md): candidata sobre a PR #26, Dexie v11 aditiva e backup v6; [ADR-017](decisions/ADR-017-ficha-viva-e-estimativa-local.md). BF-5 aberta.

[BF-5 Parte 2B — fólio de Estudo, pomodoro e cartas](BF-5_PARTE2B_ESTUDO.md): candidata encadeada à Parte 2; contrato de persistência na [ADR-016](decisions/ADR-016-estudo-folio-pomodoro-cartas.md). BF-5 aberta.

> **BF-5 parte 2 — candidata de implementação:** [fólio de leitura e toque da Coleção](BF-5_PARTE2_FOLIO.md), com PNG real, limites e validação. BF-5 aberta; demais notas datadas abaixo são cronologia.

> **Estado atual (04/11/2026):** a PR #20 (O Códice Iluminado) foi integrada à `main` com dívidas rastreadas, **sem fechar a BF-5**. A continuação prioriza formulários/UX e validação de integridade. [Decisão de integração](BF-5_INTEGRACAO_PR20.md) · [Auditoria pré-merge](BF-5_PRE_MERGE_AUDIT.md).

[BF-5R9 — Auditoria Final, Polimento e Identidade Android](BF-5R9_RELATORIO.md): candidata final de implementação; sem fechamento automático da BF-5.

# Documentação da Biblioteca Viva

> **BF-5R5 — candidata de refinamento (2026-11-04):** mundo residente/pausado, fichas e detalhes contextuais dos seis registros, dados v9 aditivos e toque. [Relatório, gates e roteiro Moto G06](BF-5R5_RELATORIO.md), [decisão técnica](decisions/ADR-015-bf5r5-residencia-e-fichas.md). BF-5 continua aberta, PR #20 draft. Notas antigas abaixo são cronologia.

> **BF-5R4 — candidata em revisão:** editores dos seis tipos, composição ambiental/profundidade de câmera e linguagem de papel/tinta/latão implementados na branch da PR draft #20. [Relatório e limites](BF-5R4_RELATORIO.md). Não há aceite artístico/físico, CI verde ou fechamento da BF-5; textos anteriores de planejamento são cronologia.

> **PRÓXIMA SEQUÊNCIA APROVADA (2026-11-03):** **BF-5 — Reforma Global de UI/UX → BF-6 — Aprimoramento do Mundo Vivo/RPG → BF-7 — Consolidação Funcional e Assistiva (antiga BF-5)**. A BF-5 adotará **grande reforma integrada e refinamentos posteriores até o aceite**, em vez de pequenos checkpoints obrigatórios. Apenas o replanejamento está autorizado; design detalhado e implementação futuros. Consulte [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md), [ROADMAP](ROADMAP.md) e [STATUS](STATUS.md). Os blocos abaixo registram estados históricos da BF-4 e não revogam a nova ordem.

> **BF-4G E BF-4 CONCLUÍDAS NO ESCOPO TÉCNICO/FUNCIONAL DIRIGIDO (2026-11-03), com exceção CI explicitamente aceita.** Auditoria independente da candidata documental sem bloqueante inequívoco nem mudança de produção; gate físico Moto G06 fornecido pelo usuário **6/6 PASS**: mundo/navegação, registros/objetos vivos, habitantes, RPG/diário, lifecycle e observações residuais. Esses PASS atestam a rodada representativa, **não** teste de cada variação, do folio F3 de Lua, de R-19 em condições específicas, de TalkBack nem de carga/temperatura sustentadas. [CI PR #18 — run 41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247) **FAIL global**: 708 Vitest PASS; E2E 30 PASS, 3 FAIL e 1 flaky (busca/Arquivo). FAIL: BF-4D coleção cheia 1280px (#11), BF-4F2 Samael (#15) e dez ciclos shell (#4). Causa do runner versus produto **não demonstrada**; issues [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15) seguem abertas. O usuário **autorizou expressamente o fechamento e merge da [PR #18](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/18)** com estas ressalvas, sem CI verde, beta/release ou BF-5 iniciada. Refinamento futuro de **UI/UX** e, separadamente, de **personagens, RPG, diálogos e interatividade** permanece planejado sem numeração/implementação autorizada. [Relatório de fechamento](BF-4G_RELATORIO.md).

As notas datadas abaixo preservam a cronologia; declarações antigas de fase próxima ou não implementada não substituem o estado BF-4G acima.

> **BF-4F4 FECHADA no escopo funcional dirigido (2026-11-02), série BF-4F1–F4 concluída nesse recorte.** O usuário validou no Moto G06 o funcionamento das questões/escolhas narrativas e compartilhou capturas do diálogo de Samael e do início/progresso da Fenda Lilás. Não houve relato de teste físico exaustivo de todas as histórias/finais ou do acidente F3 de Lua. A [CI da PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711) terminou **FAIL global: 23 E2E PASS, 11 FAIL**; os dois novos E2E F4 PASS. [Merge da PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/17) e fechamento foram expressamente autorizados com exceção CI. **BF-4G é o próximo gate integrado planejado.** Refinamentos de **UI/UX** e, em outra fase, de **personagens, RPG, diálogos e interatividade** foram reservados pelo usuário para etapas futuras próprias, ainda sem numeração ou autorização de execução. [Relatório F4](BF-4F4_RELATORIO.md).

> **BF-4F3 ENCERRADA no escopo dirigido (2026-11-02):** no Moto G06, Autonomia, Convivência e Integração **PASS**; Acidente de Lua **NÃO TESTADO fisicamente**, com cobertura automatizada e ressalva preservada. [CI PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) **FAIL**: E2E 21 PASS, 10 FAIL, 1 flaky (novo F3 PASS; falhas remanescentes com mesmos nomes da execução F2). Fechamento e merge da [PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/16) expressamente autorizados com exceções documentadas. **Próxima: BF-4F4, RPG/quests**, ainda não iniciada. [Relatório final](BF-4F3_RELATORIO.md).

> **BF-4F2 encerrada no escopo dirigido (2026-11-02):** animações e seleção aprovadas pelo usuário no Moto G06, sem regressões percebidas. Merge da [PR #14](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/14) expressamente autorizado por exceção CI: 20 E2E PASS, 10 FAIL, 1 flaky (quatro falhas novas BF-4F2 em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15)). **BF-4F3 próxima.** [Fechamento](BF-4F2_RELATORIO.md).

Este é o único índice da documentação ativa.

[BF-5R7 — Performance, Latência e Fluidez](BF-5R7_RELATORIO.md): candidata, comparação visual com a R6 aprovada e limites das medições.

| Documento                                                                                    | Pergunta respondida                                                                                                    |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`decisions/ADR-014-replanejamento-pos-bf4.md`](decisions/ADR-014-replanejamento-pos-bf4.md) | Qual a nova ordem BF-5/BF-6/BF-7 e por que a BF-5 será uma reforma ampla seguida de refinamentos?                      |
| [`BF-5_DIRECAO_VISUAL_GLOBAL.md`](BF-5_DIRECAO_VISUAL_GLOBAL.md)                             | Qual é a identidade de fantasia sobrenatural editorial, a linguagem de magia/transições e sua aplicação às cinco abas? |
| [`BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md`](BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md)             | Qual é a visão de game/RPG e como funcionará a tela Biblioteca em exploração full-screen?                              |
| [`BF-4G_RELATORIO.md`](BF-4G_RELATORIO.md)                                                   | Quais contratos foram inspecionados, quais gates passaram e o que falta para o gate integrado BF-4G?                   |
| [`BF-4F4_RELATORIO.md`](BF-4F4_RELATORIO.md)                                                 | Quais cinco histórias foram entregues e como a F4 foi encerrada por aceite funcional dirigido e exceção CI?            |
| [`BF-4F3_RELATORIO.md`](BF-4F3_RELATORIO.md)                                                 | Como ocorreu a entrega de autonomia/relações F3, seu aceite físico dirigido e o fechamento por exceção CI/Lua?         |
| [`BF-4F2_RELATORIO.md`](BF-4F2_RELATORIO.md)                                                 | Entrega, gate físico e exceção CI no fechamento BF-4F2.                                                                |
| [`../README.md`](../README.md)                                                               | O que é a Biblioteca Viva?                                                                                             |
| [`STATUS.md`](STATUS.md)                                                                     | Onde estamos?                                                                                                          |
| [`ART_DIRECTION.md`](ART_DIRECTION.md)                                                       | Qual ambição artística/visual guia os próximos checkpoints?                                                            |
| [`TESTING.md`](TESTING.md)                                                                   | Como validar proporcionalmente sem loops de cota?                                                                      |
| [`PERFORMANCE.md`](PERFORMANCE.md)                                                           | Quando medir e otimizar gargalos reais?                                                                                |
| [`ROADMAP.md`](ROADMAP.md)                                                                   | Qual é o próximo trabalho?                                                                                             |
| [`BF-4F1_RELATORIO.md`](BF-4F1_RELATORIO.md)                                                 | Qual foi o resultado físico, técnico e documental da integração dos quatro habitantes?                                 |
| [`BF-4F_PLANO_TECNICO.md`](BF-4F_PLANO_TECNICO.md)                                           | Como executar BF-4F1–F4, criar os quatro personagens sem preflight separado e realizar gates/PRs?                      |
| [`BF-4F_CONCEPCAO_HABITANTES.md`](BF-4F_CONCEPCAO_HABITANTES.md)                             | Quem são os quatro habitantes, como se relacionam, animam, agem e participam de quests com diálogos RPG?               |
| [`BF-4E_RELATORIO.md`](BF-4E_RELATORIO.md)                                                   | Como foi a implementação, revisão da experiência, aceite físico e fechamento dirigido da BF-4E com CI FAIL (#4/#11)?   |
| [`BF-4E_VISAO_CONTRATO.md`](BF-4E_VISAO_CONTRATO.md)                                         | Qual é a visão aprovada de objetos vivos, reações, atmosfera e descoberta da BF-4E?                                    |
| [`BF-4D_RELATORIO.md`](BF-4D_RELATORIO.md)                                                   | Qual foi a organização espacial BF-4D, seu fechamento dirigido e as dívidas CI #4/#11?                                 |
| [`BF-4C_RELATORIO.md`](BF-4C_RELATORIO.md)                                                   | Como ocorreu o fechamento dirigido da ampliação e mobília BF-4C?                                                       |
| [`BF-4B_RELATORIO.md`](BF-4B_RELATORIO.md)                                                   | O que a implementação BF-4B entregou e como verificá-la?                                                               |
| [`BF-4_PLANO_CONTRATO.md`](BF-4_PLANO_CONTRATO.md)                                           | Quais entregas, arquitetura, gates e critérios da BF-4?                                                                |
| [`PRODUCT.md`](PRODUCT.md)                                                                   | Qual é o produto?                                                                                                      |
| [`ARCHITECTURE.md`](ARCHITECTURE.md)                                                         | Como o aplicativo atual funciona?                                                                                      |
| [`DATA_MODEL.md`](DATA_MODEL.md)                                                             | O que persistimos?                                                                                                     |
| [`WORLD.md`](WORLD.md)                                                                       | Qual é a direção e o estado do mundo?                                                                                  |
| [`BV_F1_MAPA_E_ETAPAS.md`](BV_F1_MAPA_E_ETAPAS.md)                                           | Como a FUNDAÇÃO/F1 está decomposta?                                                                                    |
| [`ART_DIRECTION.md`](ART_DIRECTION.md)                                                       | Qual aparência buscamos?                                                                                               |
| [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md)                                                     | Como assets entrarão?                                                                                                  |
| [`ASSET_REGISTRY.md`](ASSET_REGISTRY.md)                                                     | Quais assets ativos existem?                                                                                           |
| [`UX.md`](UX.md)                                                                             | Como os fluxos atuais se comportam?                                                                                    |
| [`ACCESSIBILITY.md`](ACCESSIBILITY.md)                                                       | Quais compromissos de acessibilidade estão vigentes?                                                                   |
| [`AUDIO.md`](AUDIO.md)                                                                       | Qual é o contrato de áudio convencional?                                                                               |
| [`TESTING.md`](TESTING.md)                                                                   | Como validamos o aplicativo?                                                                                           |
| [`PERFORMANCE.md`](PERFORMANCE.md)                                                           | Quais métricas gerais acompanhamos?                                                                                    |
| [`ANDROID.md`](ANDROID.md)                                                                   | Como sincronizamos e geramos o APK?                                                                                    |
| [`SECURITY.md`](SECURITY.md)                                                                 | Quais limites de segurança aplicamos?                                                                                  |
| [`PRIVACY.md`](PRIVACY.md)                                                                   | Como os dados pessoais são tratados?                                                                                   |
| [`MAINTENANCE.md`](MAINTENANCE.md)                                                           | Como mantemos o checkout?                                                                                              |
| [`RISKS.md`](RISKS.md)                                                                       | Quais riscos continuam abertos?                                                                                        |
| [`GLOSSARY.md`](GLOSSARY.md)                                                                 | O que significam os termos atuais?                                                                                     |
| [`HISTORY.md`](HISTORY.md)                                                                   | Qual é o resumo histórico do produto?                                                                                  |
| [`decisions/`](decisions/README.md)                                                          | Por que tomamos as decisões atuais?                                                                                    |
| [`history/`](history/README.md)                                                              | Como chegamos aqui?                                                                                                    |

`STATUS.md` é a única declaração operacional do presente. Histórico nunca autoriza implementação.

A F1 encerrou o contrato temporário F0-D. [`ADR-009`](decisions/ADR-009-three-foundation.md) registra Three.js como renderer aprovado da Fundação; o contrato integral foi preservado em [`history/plans/`](history/plans/F0-D_THREE_FOUNDATION_SPIKE_CONTRACT.md).

A [BF-4E](BF-4E_RELATORIO.md) foi concluída no escopo funcional e físico dirigido por autorização do usuário, preservando explicitamente as falhas E2E da CI como dívida técnica (#4/#11). A próxima etapa é BF-4F; sua [concepção de quatro habitantes](BF-4F_CONCEPCAO_HABITANTES.md) e a [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) estão aprovadas documentalmente, **sem código implementado**. Não confundir esse planejamento com CI verde, TalkBack aprovado ou beta.

**BF-4F1 concluída no escopo dirigido em 2026-11-02:** o usuário aceitou visualmente os quatro primeiros modelos e sua seleção no Moto G06; falta a expressividade da BF-4F2, IA local F3 e quests F4. [Relatório F1](BF-4F1_RELATORIO.md). Notas antigas sobre ausência de implementação são histórico, não estado vigente. E2E finalizou FAIL (20 PASS, 6 FAIL, 1 flaky); TalkBack e desempenho sustentado não foram declarados PASS.

**Estado vigente:** BF-4/BF-4G encerradas somente no escopo funcional/físico dirigido, com ressalvas e CI FAIL; [relatório BF-4G](BF-4G_RELATORIO.md). **Próxima fase planejada: BF-5 — reforma global de UI/UX**, seguida de BF-6 (Mundo Vivo/RPG) e BF-7 (consolidação funcional/assistiva; antiga BF-5). A estratégia BF-5 aprovada é macroreforma integrada e refinamentos posteriores; **sem implementação iniciada**. O histórico anterior continua preservado, mas não tem precedência sobre a [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md) e o [STATUS](STATUS.md). Agentes seguem [AGENTS](../AGENTS.md), [direção artística](ART_DIRECTION.md), [testes](TESTING.md) e [desempenho](PERFORMANCE.md).
