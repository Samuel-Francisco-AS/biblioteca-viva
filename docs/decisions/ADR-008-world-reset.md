# ADR-008 — WORLD RESET

- **Estado:** aceita
- **Data:** 2026-09-08
- **Substitui:** ADR-002, ADR-003, ADR-004, ADR-005 e ADR-006 nos contratos afetados

## Contexto

O mundo anterior acumulava renderer, contratos espaciais, progressão, conteúdo e pipeline de assets incompatíveis com a direção aprovada para a próxima experiência. Os dados existentes eram exclusivamente de desenvolvimento e teste.

## Decisão

- remover integralmente o mundo anterior e abandonar Phaser;
- encerrar os contratos espaciais antigos, sem fallback, coexistência ou conversão;
- descartar os dados locais existentes durante o upgrade para Dexie v8;
- adotar backup v6 apenas para dados convencionais pós-reset e rejeitar formatos v1–v5;
- manter a rota Biblioteca como página React sem implementação de mundo;
- construir o próximo mundo do zero como o único mundo ativo, em 3D real estilizado com apresentação ortográfica/2.5D.

O renderer, o pipeline 3D e a persistência espacial serão decididos em trabalho posterior. Esta decisão não escolhe Three.js, R3F ou qualquer outra tecnologia.

## Consequências

O aplicativo convencional permanece funcional, enquanto código, dados, assets, scripts, testes e documentação operacional do mundo encerrado deixam o checkout ativo. O Git e a documentação histórica preservam o contexto necessário, não binários duplicados.
