# ADR-007 — Autoridade documental

- **Estado:** aceita
- **Data:** 2026-09-07

## Contexto

Planos, handoffs, checklists e logs encerrados continuavam descrevendo épocas diferentes como estado atual.

## Decisão

Separar documentação ativa, decisões vigentes e arquivo histórico. `STATUS.md` é a única declaração operacional do presente. Planos encerrados não definem próximo trabalho.

## Consequências

Índices redundantes foram fundidos; documentos ativos descrevem contratos, não cronologia; evidência histórica permanece disponível com aviso explícito. Divergência com o checkout deve ser reportada antes de alterar a área.
