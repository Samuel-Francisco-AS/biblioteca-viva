# Decisões arquiteturais

Este índice distingue as decisões vigentes das preservadas para contexto. O registro monolítico anterior está em `../history/legacy/DECISIONS_LEGACY.md`.

| ID      | Decisão                                    | Estado                  |
| ------- | ------------------------------------------ | ----------------------- |
| ADR-026 | [Oficina, mídias e troca autoral](ADR-026-arcanario-oficina-midias-troca.md) | candidata BF-5.6B; gate A+B pendente |
| ADR-025 | [Fundação persistente do Arcanário](ADR-025-arcanario-fundacao-persistencia.md) | candidata BF-5.6A; aceite pendente |
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
| ADR-014 | Pós-BF-4: BF-5 UI/UX → BF-6 Mundo Vivo → BF-7 consolidação | aceita (ordem histórica, atualizada pela ADR-023) |
| ADR-024 | [Recuperação R2: componentes espaciais e assets](ADR-024-recuperacao-r2-componentes-e-assets.md) | implementada em candidata R2; gates físico/artístico pendentes |
| ADR-023 | [BF-5.5 — O Despertar da Biblioteca](ADR-023-bf-5-5-despertar-da-biblioteca.md) | aceita (ordem/guardrails; implementação B candidata) |
| ADR-022 | [Atlas clássico projetado](ADR-022-atlas-classico-projetado.md) | candidata; substitui apresentação articulada da ADR-021 |
| ADR-021 | [Empreitadas, Atlas Vivo e avaliações](ADR-021-empreitadas-atlas-avaliacoes.md) | implementação candidata Parte 2F |
| ADR-020 | [Baralhos e cartas globais — Arcanário BF-5.6](ADR-020-baralhos-e-cartas-globais.md) | diretriz aceita em planejamento, revisada 08/11; sem implementação |
| ADR-019 | [Seletores internos, capas e ateliê](ADR-019-controles-internos-capas-atelie.md) | implementação candidata Parte 2E |
| ADR-018 | [Entretenimento: agrupamento e mídia local](ADR-018-entretenimento-catalogo-midia-local.md) | implementada como candidata Parte 2D |
| ADR-017 | [Ficha viva e estimativa local](ADR-017-ficha-viva-e-estimativa-local.md) | implementada como candidata Parte 2C |
| ADR-016 | [Estudo: fólio, foco persistido e cartas locais](ADR-016-estudo-folio-pomodoro-cartas.md) | implementada como candidata Parte 2B |
| ADR-015 | BF-5R5: residência do mundo e fichas de prática | aceita no escopo R5; candidata |

ADR-008 permanece a autoridade do WORLD RESET. [`ADR-009`](ADR-009-three-foundation.md) a complementa ao aprovar Three.js como renderer da Fundação depois da evidência técnica e física da F1; não substitui o reset.

[`ADR-010`](ADR-010-3d-pipeline-v1.md) complementa ambas ao formalizar o contrato produtivo inicial de assets 3D; não cria o runtime produtivo, um mundo real ou persistência espacial.

[`ADR-011`](ADR-011-biblioteca-funcional-primeiro.md) complementa ADR-010 ao priorizar conteúdo procedural/provisório para a Biblioteca funcional. ADR-010 continua regulando GLBs produtivos; P3D-B2–F ficam adiados, sem cancelamento ou promoção de fixtures.

[`ADR-012`](ADR-012-bf-4-mundo-vivo.md) especifica o escopo integrado dos cinco cômodos, personagens animados com IA local e conversação contextual, **sem** aprovar automaticamente GLB animado nem LLM externa. O contrato operacional está em [`BF-4_PLANO_CONTRATO.md`](../BF-4_PLANO_CONTRATO.md).

[`ADR-013`](ADR-013-bf-4f-quatro-habitantes-rpg.md) atualiza para **quatro** o número inicial de habitantes e fixa o **diálogo local em árvores de 3–4 escolhas de RPG**, sem LLM; não substitui os demais contratos da ADR-012. A autoridade criativa é a [concepção BF-4F](../BF-4F_CONCEPCAO_HABITANTES.md).

[`ADR-014`](ADR-014-replanejamento-pos-bf4.md) atualiza **somente o plano futuro** da ADR-011/ADR-012: a consolidação chamada anteriormente de BF-5 passa a **BF-7**; a nova BF-5 é reforma ampla de UI/UX, seguida de refinamentos; BF-6 aprofunda personagens/RPG/interatividade. Não altera os fatos nem os aceites históricos da BF-4, não implementa nenhuma fase e não retira a obrigação de TalkBack/gates assistivos.

[`ADR-023`](ADR-023-bf-5-5-despertar-da-biblioteca.md) insere a **BF-5.5** após o fechamento da BF-5, antes da BF-6, sem alterar escopo/número da BF-6 ou BF-7. Seu contrato de implementação futura está em [BF-5.5](../BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md). A BF-5.6 foi inserida posteriormente em 08/11/2026 entre BF-5.5 e BF-6 pelo [plano do Arcanário](../BF-5_6_ARCANARIO_PLANO.md) e a [revisão da ADR-020](ADR-020-baralhos-e-cartas-globais.md); a ADR-014 permanece registro válido da decisão anterior.

Uma nova decisão recebe o próximo número. Substituição preserva a decisão anterior com estado e link para a sucessora.
