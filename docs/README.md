# Documentação da Biblioteca Viva

> **BF-4F1 encerrada no escopo dirigido (2026-11-02):** o usuário aprovou os quatro modelos iniciais e sua seleção canvas/React no Moto G06. Próxima fase F2 (animação corporal). [Relatório](BF-4F1_RELATORIO.md). CI global FAIL: 20 E2E PASS, 6 FAIL e 1 flaky.

Este é o único índice da documentação ativa.

| Documento | Pergunta respondida |
|---|---|
| [`../README.md`](../README.md) | O que é a Biblioteca Viva? |
| [`STATUS.md`](STATUS.md) | Onde estamos? |
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
