# ADR-012 — BF-4 como Mundo Vivo e Habitável

- **Estado:** aceita para escopo e fronteiras de planejamento
- **Data:** 2026-11-01
- **Complementa:** ADR-008, ADR-009, ADR-010 e ADR-011
- **Contrato de execução:** [BF-4 — Plano e contrato](../BF-4_PLANO_CONTRATO.md)

## Contexto

A BF-3 concluiu integração funcional dos seis tipos e validação física dirigida no Moto G06, com ressalva de CI E2E (issue #4) e TalkBack humano pendente. A proposta inicial de BF-4 com protótipo visual de um cômodo e NPCs ambientais mínimos foi rejeitada pelo usuário: a entrega desejada é a transformação do mundo **inteiro**, inclusive habitantes detalhados, animações, agência contextual e conversa.

O runtime atual ainda não implementa diálogo, navegação autônoma, animador de personagem nem persistência espacial. ADR-010 cobre GLBs produtivos rígidos e estáticos, não modelos com esqueleto/animados. Uma ampliação desse perfil requer decisão e prova específicas.

## Decisão

1. **BF-4B começa pelos cinco cômodos juntos**, sem checkpoint de protótipo visual descartável de apenas um cômodo. B/C/D/E evoluem o mesmo mundo, com resultados observáveis e gates integrados progressivos.
2. BF-4F contém quatro frentes **obrigatórias**: identidade visual individual (alvo inicial de três personagens), animação variada, comportamentos autônomos locais e interação/conversação contextual por texto. A fase não é atendida por figuras imóveis ou animação repetitiva isolada.
3. A IA comportamental inicial será **local e limitada por ações explícitas**, com estados, prioridades, percepção contextual e memória efêmera. A conversação inicial é local, textual, contextual e offline por contrato; não alegar LLM generativa a partir de respostas programadas.
4. **LLM generativa aberta** não está aprovada nesta ADR. Uma eventual integração exige decisão posterior sobre execução, custo, consentimento e privacidade, e jamais condiciona a operação convencional à rede.
5. Preservar Three.js, ponte React/WorldHost/runtime, seis registros, IDs, F5 diagnóstico, lifecycle e semântica acessível. **Sem** ressuscitar mundo legado, criar estado espacial persistente, mudar Dexie/backup ou introduzir dependências sem necessidade e autorização demonstradas.
6. ADR-010 permanece autoridade de GLB produtivo. Antes de usar GLB com rigging/skinning/animação como asset produtivo, formalizar extensão e provar pipeline e descarte; este documento não suspende as restrições do perfil v1.
7. Validação Android será incremental e repetida nos pontos de maior mudança; BF-4G consolida e BF-5 mantém seu gate funcional/assistivo. A issue #4 e TalkBack não são apagados por aprovações parciais.

## Consequências

A BF-4 tem escopo mais ambicioso e poderá exigir mudanças graduais em composição, interação, render loop, modelo de agentes e UX. Os contratos acima autorizam **planejar**, não implementam esses sistemas, não aprovam um provedor externo, não demonstram performance, não entregam arte definitiva e não declararam novo gate físico ou automatizado.

As decisões pendentes permanecem explícitas em [BF-4 — Plano e contrato](../BF-4_PLANO_CONTRATO.md).
