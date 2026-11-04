> **Estado atual (04/11/2026):** a PR #20 (O Códice Iluminado) foi integrada à `main` com dívidas rastreadas, **sem fechar a BF-5**. A continuação prioriza formulários/UX e validação de integridade. [Decisão de integração](BF-5_INTEGRACAO_PR20.md) · [Auditoria pré-merge](BF-5_PRE_MERGE_AUDIT.md).\n\n[BF-5R9 — Auditoria Final, Polimento e Identidade Android](BF-5R9_RELATORIO.md): candidata final de implementação; sem fechamento automático da BF-5.

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

| Documento | Pergunta respondida |
|---|---|
| [`decisions/ADR-014-replanejamento-pos-bf4.md`](decisions/ADR-014-replanejamento-pos-bf4.md) | Qual a nova ordem BF-5/BF-6/BF-7 e por que a BF-5 será uma reforma ampla seguida de refinamentos? |
| [`BF-5_DIRECAO_VISUAL_GLOBAL.md`](BF-5_DIRECAO_VISUAL_GLOBAL.md) | Qual é a identidade de fantasia sobrenatural editorial, a linguagem de magia/transições e sua aplicação às cinco abas? |
| [`BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md`](BF-5_BIBLIOTECA_MANIFESTO_CONTRATO.md) | Qual é a visão de game/RPG e como funcionará a tela Biblioteca em exploração full-screen? |
| [`BF-4G_RELATORIO.md`](BF-4G_RELATORIO.md) | Quais contratos foram inspecionados, quais gates passaram e o que falta para o gate integrado BF-4G? |
| [`BF-4F4_RELATORIO.md`](BF-4F4_RELATORIO.md) | Quais cinco histórias foram entregues e como a F4 foi encerrada por aceite funcional dirigido e exceção CI? |
| [`BF-4F3_RELATORIO.md`](BF-4F3_RELATORIO.md) | Como ocorreu a entrega de autonomia/relações F3, seu aceite físico dirigido e o fechamento por exceção CI/Lua? |
| [`BF-4F2_RELATORIO.md`](BF-4F2_RELATORIO.md) | Entrega, gate físico e exceção CI no fechamento BF-4F2. |
| [`../README.md`](../README.md) | O que é a Biblioteca Viva? |
| [`STATUS.md`](STATUS.md) | Onde estamos? |
| [`ART_DIRECTION.md`](ART_DIRECTION.md) | Qual ambição artística/visual guia os próximos checkpoints? |
| [`TESTING.md`](TESTING.md) | Como validar proporcionalmente sem loops de cota? |
| [`PERFORMANCE.md`](PERFORMANCE.md) | Quando medir e otimizar gargalos reais? |
| [`ROADMAP.md`](ROADMAP.md) | Qual é o próximo trabalho? |
| [`BF-4F1_RELATORIO.md`](BF-4F1_RELATORIO.md) | Qual foi o resultado físico, técnico e documental da integração dos quatro habitantes? |
| [`BF-4F_PLANO_TECNICO.md`](BF-4F_PLANO_TECNICO.md) | Como executar BF-4F1–F4, criar os quatro personagens sem preflight separado e realizar gates/PRs? |
| [`BF-4F_CONCEPCAO_HABITANTES.md`](BF-4F_CONCEPCAO_HABITANTES.md) | Quem são os quatro habitantes, como se relacionam, animam, agem e participam de quests com diálogos RPG? |
| [`BF-4E_RELATORIO.md`](BF-4E_RELATORIO.md) | Como foi a implementação, revisão da experiência, aceite físico e fechamento dirigido da BF-4E com CI FAIL (#4/#11)? |
| [`BF-4E_VISAO_CONTRATO.md`](BF-4E_VISAO_CONTRATO.md) | Qual é a visão aprovada de objetos vivos, reações, atmosfera e descoberta da BF-4E? |
| [`BF-4D_RELATORIO.md`](BF-4D_RELATORIO.md) | Qual foi a organização espacial BF-4D, seu fechamento dirigido e as dívidas CI #4/#11? |
| [`BF-4C_RELATORIO.md`](BF-4C_RELATORIO.md) | Como ocorreu o fechamento dirigido da ampliação e mobília BF-4C? |
| [`BF-4B_RELATORIO.md`](BF-4B_RELATORIO.md) | O que a implementação BF-4B entregou e como verificá-la? |
| [`BF-4_PLANO_CONTRATO.md`](BF-4_PLANO_CONTRATO.md) | Quais entregas, arquitetura, gates e critérios da BF-4? |
| [`PRODUCT.md`](PRODUCT.md) | Qual é o produto? |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Como o aplicativo atual funciona? |
| [`DATA_MODEL.md`](DATA_MODEL.md) | O que persistimos? |
| [`WORLD.md`](WORLD.md) | Qual é a direção e o estado do mundo? |
| [`BV_F1_MAPA_E_ETAPAS.md`](BV_F1_MAPA_E_ETAPAS.md) | Como a FUNDAÇÃO/F1 está decomposta? |
| [`ART_DIRECTION.md`](ART_DIRECTION.md) | Qual aparência buscamos? |
| [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md) | Como assets entrarão? |
| [`ASSET_REGISTRY.md`](ASSET_REGISTRY.md) | Quais assets ativos existem? |
| [`UX.md`](UX.md) | Como os fluxos atuais se comportam? |
| [`ACCESSIBILITY.md`](ACCESSIBILITY.md) | Quais compromissos de acessibilidade estão vigentes? |
| [`AUDIO.md`](AUDIO.md) | Qual é o contrato de áudio convencional? |
| [`TESTING.md`](TESTING.md) | Como validamos o aplicativo? |
| [`PERFORMANCE.md`](PERFORMANCE.md) | Quais métricas gerais acompanhamos? |
| [`ANDROID.md`](ANDROID.md) | Como sincronizamos e geramos o APK? |
| [`SECURITY.md`](SECURITY.md) | Quais limites de segurança aplicamos? |
| [`PRIVACY.md`](PRIVACY.md) | Como os dados pessoais são tratados? |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Como mantemos o checkout? |
| [`RISKS.md`](RISKS.md) | Quais riscos continuam abertos? |
| [`GLOSSARY.md`](GLOSSARY.md) | O que significam os termos atuais? |
| [`HISTORY.md`](HISTORY.md) | Qual é o resumo histórico do produto? |
| [`decisions/`](decisions/README.md) | Por que tomamos as decisões atuais? |
| [`history/`](history/README.md) | Como chegamos aqui? |

`STATUS.md` é a única declaração operacional do presente. Histórico nunca autoriza implementação.

A F1 encerrou o contrato temporário F0-D. [`ADR-009`](decisions/ADR-009-three-foundation.md) registra Three.js como renderer aprovado da Fundação; o contrato integral foi preservado em [`history/plans/`](history/plans/F0-D_THREE_FOUNDATION_SPIKE_CONTRACT.md).

A [BF-4E](BF-4E_RELATORIO.md) foi concluída no escopo funcional e físico dirigido por autorização do usuário, preservando explicitamente as falhas E2E da CI como dívida técnica (#4/#11). A próxima etapa é BF-4F; sua [concepção de quatro habitantes](BF-4F_CONCEPCAO_HABITANTES.md) e a [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) estão aprovadas documentalmente, **sem código implementado**. Não confundir esse planejamento com CI verde, TalkBack aprovado ou beta.

**BF-4F1 concluída no escopo dirigido em 2026-11-02:** o usuário aceitou visualmente os quatro primeiros modelos e sua seleção no Moto G06; falta a expressividade da BF-4F2, IA local F3 e quests F4. [Relatório F1](BF-4F1_RELATORIO.md). Notas antigas sobre ausência de implementação são histórico, não estado vigente. E2E finalizou FAIL (20 PASS, 6 FAIL, 1 flaky); TalkBack e desempenho sustentado não foram declarados PASS.

**Estado vigente:** BF-4/BF-4G encerradas somente no escopo funcional/físico dirigido, com ressalvas e CI FAIL; [relatório BF-4G](BF-4G_RELATORIO.md). **Próxima fase planejada: BF-5 — reforma global de UI/UX**, seguida de BF-6 (Mundo Vivo/RPG) e BF-7 (consolidação funcional/assistiva; antiga BF-5). A estratégia BF-5 aprovada é macroreforma integrada e refinamentos posteriores; **sem implementação iniciada**. O histórico anterior continua preservado, mas não tem precedência sobre a [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md) e o [STATUS](STATUS.md). Agentes seguem [AGENTS](../AGENTS.md), [direção artística](ART_DIRECTION.md), [testes](TESTING.md) e [desempenho](PERFORMANCE.md).
