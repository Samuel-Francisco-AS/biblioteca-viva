# ADR-003 — Mundo persistente e objetos separados

- **Estado:** aceita
- **Data original:** 2026-08-27

## Decisão

`WorldStructureState` persiste pisos e peças estruturais de `world.main`. `PlacedObject` permanece agregado separado. O blueprint inicial só é aplicado quando não existe estrutura.

## Consequências

Edição pessoal e restore não são sobrescritos. Seleção, preview, câmera e ferramentas são efêmeros. Mudança de qualquer forma persistida exige migração e compatibilidade de backup.
