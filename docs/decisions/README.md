# Decisões arquiteturais

Este índice distingue as decisões vigentes das preservadas para contexto. O registro monolítico anterior está em `../history/legacy/DECISIONS_LEGACY.md`.

| ID | Decisão | Estado |
|---|---|---|
| ADR-001 | produto local-first e privado por padrão | aceita |
| ADR-002 | arquitetura híbrida anterior | substituída por ADR-008 |
| ADR-003 | mundo persistente e objetos anteriores | substituída por ADR-008 |
| ADR-004 | geometria visual anterior | substituída por ADR-008 |
| ADR-005 | progressão estrutural anterior | substituída por ADR-008 |
| ADR-006 | schema e backup anteriores | substituída por ADR-008 |
| ADR-007 | autoridade e ciclo de vida da documentação | aceita |
| ADR-008 | WORLD RESET e novo baseline | aceita |
| ADR-009 | Three.js como renderer da Fundação | aceita |
| ADR-010 | Pipeline 3D v1 | aceita |

ADR-008 permanece a autoridade do WORLD RESET. [`ADR-009`](ADR-009-three-foundation.md) a complementa ao aprovar Three.js como renderer da Fundação depois da evidência técnica e física da F1; não substitui o reset.

[`ADR-010`](ADR-010-3d-pipeline-v1.md) complementa ambas ao formalizar o contrato produtivo inicial de assets 3D; não cria o runtime produtivo, um mundo real ou persistência espacial.

Uma nova decisão recebe o próximo número. Substituição preserva a decisão anterior com estado e link para a sucessora.
