# Decisões arquiteturais

Este índice distingue as decisões vigentes das preservadas para contexto. O registro monolítico anterior está em `../history/legacy/DECISIONS_LEGACY.md`.

| ID      | Decisão                                    | Estado                  |
| ------- | ------------------------------------------ | ----------------------- |
| ADR-001 | produto local-first e privado por padrão   | aceita                  |
| ADR-002 | arquitetura híbrida anterior               | substituída por ADR-008 |
| ADR-003 | mundo persistente e objetos anteriores     | substituída por ADR-008 |
| ADR-004 | geometria visual anterior                  | substituída por ADR-008 |
| ADR-005 | progressão estrutural anterior             | substituída por ADR-008 |
| ADR-006 | schema e backup anteriores                 | substituída por ADR-008 |
| ADR-007 | autoridade e ciclo de vida da documentação | aceita                  |
| ADR-008 | WORLD RESET e novo baseline                | aceita                  |
| ADR-009 | Three.js como renderer da Fundação         | aceita                  |
| ADR-010 | Pipeline 3D v1                             | aceita                  |
| ADR-011 | Biblioteca Funcional Primeiro              | aceita                  |
| ADR-012 | BF-4 — Mundo Vivo e Habitável               | aceita (escopo)         |
| ADR-013 | BF-4F — 4 habitantes e conversação RPG      | aceita (escopo criativo) |

ADR-008 permanece a autoridade do WORLD RESET. [`ADR-009`](ADR-009-three-foundation.md) a complementa ao aprovar Three.js como renderer da Fundação depois da evidência técnica e física da F1; não substitui o reset.

[`ADR-010`](ADR-010-3d-pipeline-v1.md) complementa ambas ao formalizar o contrato produtivo inicial de assets 3D; não cria o runtime produtivo, um mundo real ou persistência espacial.

[`ADR-011`](ADR-011-biblioteca-funcional-primeiro.md) complementa ADR-010 ao priorizar conteúdo procedural/provisório para a Biblioteca funcional. ADR-010 continua regulando GLBs produtivos; P3D-B2–F ficam adiados, sem cancelamento ou promoção de fixtures.

[`ADR-012`](ADR-012-bf-4-mundo-vivo.md) especifica o escopo integrado dos cinco cômodos, personagens animados com IA local e conversação contextual, **sem** aprovar automaticamente GLB animado nem LLM externa. O contrato operacional está em [`BF-4_PLANO_CONTRATO.md`](../BF-4_PLANO_CONTRATO.md).

[`ADR-013`](ADR-013-bf-4f-quatro-habitantes-rpg.md) atualiza para **quatro** o número inicial de habitantes e fixa o **diálogo local em árvores de 3–4 escolhas de RPG**, sem LLM; não substitui os demais contratos da ADR-012. A autoridade criativa é a [concepção BF-4F](../BF-4F_CONCEPCAO_HABITANTES.md).

Uma nova decisão recebe o próximo número. Substituição preserva a decisão anterior com estado e link para a sucessora.
