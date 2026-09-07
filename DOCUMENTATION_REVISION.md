# Revisão documental de 2026-09-07

Este pacote foi produzido inicialmente a partir de `Documentação da Biblioteca viva.zip`, SHA-256 `d846326f700b32808b9c46beec6d768668358f20eb0c95223eb476076a2aec4f`.

A revisão foi complementada com a documentação do reboot espacial de 2026-08-18 e com mensagens de planejamento recuperadas pelo usuário. Essas fontes esclareceram que W3-B–W3-F formam uma sequência já planejada; não eram candidatas independentes à escolha.

## Objetivo

Separar o presente do histórico, eliminar autoridades duplicadas e impedir que planos ou handoffs encerrados sejam usados como instrução operacional.

## Principais transformações

| Origem | Destino |
|---|---|
| `MANIFEST.md` + `docs/00_LEIA-ME.md` | `docs/README.md` |
| `docs/VISION.md` + `docs/PRODUCT.md` | `docs/PRODUCT.md` |
| `docs/TEST_PLAN.md` | `docs/TESTING.md` + cópia histórica |
| `docs/DECISIONS.md` | decisões vigentes em `docs/decisions/` + cópia histórica |
| planos mestre, de execução, refinamento e fase de produto | `docs/history/plans/` |
| plano e log corretivo W3-A | `docs/history/w3-a/` |
| handoff W3-A | substituído por `docs/history/w3-a/README.md` |
| `docs/ASSET_SPEC.md` | `docs/ASSET_PIPELINE.md` + cópia histórica |
| `docs/ANDROID_RELEASE.md` | `docs/ANDROID.md` + checkpoints históricos |
| roadmap do reboot + planejamento posterior | `docs/W3_PLAN.md` + correções em `STATUS.md`, `ROADMAP.md` e `PRODUCT.md` |

`MANIFEST.md`, `docs/00_LEIA-ME.md`, `docs/VISION.md` e `W3_A_CORRECTION_HANDOFF.md` não existem separadamente no novo conjunto porque suas funções foram absorvidas.

## Regra de confiança

Quando houver divergência, a ordem documental é:

1. evidência do código, testes e checkout atual;
2. decisão vigente não substituída;
3. `docs/STATUS.md`;
4. contrato técnico ativo da área;
5. roadmap;
6. material histórico, apenas para contexto.
