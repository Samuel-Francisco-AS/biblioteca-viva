# ADR-004 — Geometria visual estrutural canônica

- **Estado:** substituída por [ADR-008](ADR-008-world-reset.md)
- **Data original:** 2026-09-04

## Decisão

Uma transformação canônica produz posição, escala, bounds, perfis, regiões e depth a partir da estrutura lógica. A normal interior vem da adjacência do piso e o alinhamento é geral.

## Consequências

Sprite, fallback, input, preview, seleção e depth usam a mesma autoridade. Correções por blueprint, coordenada ou `instanceId` são proibidas. A baseline possui 31/31 junções e 9/9 cenários.
