# ADR-001 — Produto local-first

- **Estado:** aceita
- **Data consolidada:** 2026-09-07

## Decisão

Funções essenciais e dados permanecem locais e offline. Não existem conta, backend, sincronização, nuvem, analytics ou social no escopo atual.

## Consequências

IndexedDB e backups locais concentram risco de perda e exposição. O produto precisa oferecer exportação explícita, restore seguro e afirmações honestas: local-first não significa criptografia ou preservação absoluta.
