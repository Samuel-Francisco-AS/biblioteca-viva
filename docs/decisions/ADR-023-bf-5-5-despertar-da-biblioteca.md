# ADR-023 — BF-5.5: O Despertar da Biblioteca entre UI/UX e RPG

- **Estado:** aceita para sequência, visão, escopo e guardrails de planejamento; implementação pendente.
- **Data:** 2026-11-05
- **Complementa e atualiza prospectivamente:** ADR-014 (ordem pós-BF-4); preserva ADR-008–013, ADR-015 e as demais decisões aplicáveis.
- **Contrato de fase:** [BF-5.5 — O Despertar da Biblioteca](../BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md).

## Contexto

A BF-5 terminou em 05/11/2026 no escopo artístico/funcional aceito, com ressalvas. A sequência anterior previa avançar diretamente à BF-6 de aprimoramento dos habitantes/RPG e depois à BF-7 de consolidação. O proprietário aprovou uma fase **intermediária e específica para mundo 3D**: qualidade noturna e abajures acesos por NPCs, magia mais impactante, até dez pergaminhos vivos associados às anotações, melhores móveis/representações e objetos que reajam fisicamente a sessões de leitura/estudo/trabalho/treino.

A discussão posterior identificou duas bases inegociáveis: personagens não podem reiniciar sempre a trajetória desde posições-padrão ao reabrir o app; o ritual noturno não pode depender de chegada de NPC e deixar luminárias eternamente apagadas. Interações devem ser **manipulação física real**, não reações cosméticas simuladas.

## Decisão

1. **Sequência vigente:** BF-5 ✅ → **BF-5.5 — O Despertar da Biblioteca (planejada)** → BF-6 — aprofundamento dos habitantes e RPG → BF-7 — consolidação. BF-6 e BF-7 mantêm identificação e escopos próprios; esta ADR não reinterpreta fatos anteriores.
2. **BF-5.5 como transformação do mundo existente**, não novo engine nem construção de um segundo mundo. Prioridades: continuidade de habitantes; tarefas/reservas/manipulação física; iluminação noturna robusta; magia/pergaminhos; reforma visual da mobília; reatividade a registros/sessões; integração/gate.
3. **Persistir estado sem persistir frames:** projetar snapshots versionados e recuperar posições, orientações, intenções, destinos e ocupações coerentes. Tempo fora do aplicativo admite reconciliação limitada, não simulação contínua em background. Desenhar migração/backup antes de mudar schema, com estado legado seguro.
4. **Luz independente de coreografia:** o estado noturno deve iluminar a biblioteca mesmo se NPC for interrompido. Ações de luminárias idempotentes, com mecanismo de finalização/fallback; respeitar controle manual e segredo BF-4E.
5. **Interações físicas e identidade:** objeto móvel singular por ID, reserva exclusiva, anexação a mão/mesa/cadeira, animação compatível e recuperação segura; sessão ativa/ação do usuário prevalece sobre rotina decorativa.
6. **Magia e anotações:** separar ciclo diurno/noturno de intensidade encantada; pergaminho individual por anotação elegível com limite de dez em cena, origem rastreável, voo/repouso e interação com habitantes, sem usar textos pessoais em render/log sem necessidade.
7. **Preservar arquitetura local-first:** ponte aplicação/React → `WorldHost` → runtime Three, seis tipos, IDs, escolha no canvas e via React, ciclo de vida/fallback, domínio sem Three e runtime sem Dexie. Mudanças de esquema, assets animados/produtivos e backup exigem gates próprios; não estão implicitamente aprovadas apenas porque constam na visão.
8. **Entrega integrada com testes proporcionais:** ambição artística priorizada, refinamento a partir de avaliações reais no Moto G06, sem limites gráficos preventivos injustificados nem repetição cega de CI. Acessibilidade e integridade de dados não são negociáveis.

## Consequências e limites da autorização

Esta decisão **autoriza o registro e planejamento detalhado da BF-5.5 na `main`**, não entrega código, novas migrações, efeitos, estados persistidos ou gate físico. Início de implementação e integração exigem execução posterior explícita. BF-5 permanece encerrada com ressalvas; CI E2E global vermelha e dívidas #21–#24 continuam abertas. Não iniciar BF-6, BF-7, beta ou release por implicação.

A ADR-014 permanece válida para o fechamento da BF-4, a decisão da macroreforma BF-5 e os escopos BF-6/BF-7. **Somente a ordem futura é atualizada** pela inserção da BF-5.5.
