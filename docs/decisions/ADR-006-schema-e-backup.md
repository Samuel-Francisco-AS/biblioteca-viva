# ADR-006 — Schema aditivo e backup versionado

- **Estado:** substituída por [ADR-008](ADR-008-world-reset.md)
- **Data consolidada:** 2026-09-07

## Decisão

Schemas Dexie evoluem por versões aditivas e backups por `formatVersion` próprio. O estado atual é Dexie v7 e backup v5 com leitores v1–v4.

## Consequências

Versões publicadas não são editadas. Restore inspeciona sem escrever, revalida e usa transação. Integridade SHA-256 não é assinatura ou criptografia. Marcos preservam semântica monotônica quando o formato exigir.
