# STATUS — Biblioteca Viva

> Atualização de estado: 2026-08-30.

## Estado atual

- baseline histórico: Prompts 1–19, R1–R3, P1, P2, W1 e W2;
- P3-C concluiu tecnicamente W3-A1–W3-A6, preservado como histórico verdadeiro;
- a validação física posterior no Moto G06 **reabriu W3-A**: a planta não forma uma sala visualmente contínua e o painel “Peças colocadas” impede a manipulação e retira o protagonismo do mapa;
- W3-A-R0 produziu a auditoria técnica e o contrato de correção em `W3_A_CORRECTION_LOG.md`; o aceite humano de R0 e todos os gates R1–R6 permanecem pendentes;
- stack preservada: React + Phaser + Dexie + Capacitor, local-first, sem conta, backend ou sincronização;
- schema Dexie é v7 e o backup é v5, com leitor v1–v4 compatível;
- não há APK release, assinatura, instalação automática ou publicação.

## W3-A — estado técnico entregue por P3-C (histórico)

- **W3-A1:** `WorldStructureState` é persistido separadamente de `PlacedObject`; piso usa células e paredes/cantos/porta usam arestas e orientações tipadas. A planta fixa W1 não é autoridade de geometria.
- **W3-A2:** o catálogo declarativo contém piso, paredes 1/2/4 horizontais e verticais, quatro cantos e porta horizontal aberta/fechada. Há 12 PNGs runtime RGBA validados, fallback procedimental e nenhuma porta vertical.
- **W3-A3:** `worldStructures` foi adicionado no Dexie v7; backup v5 carrega estrutura e marcos, aceita v4 e restaura repetidamente sem duplicação. O blueprint só é criado se ausente e o inventário é derivado.
- **W3-A4/A5:** React controla modo, seleção, revisão otimista, single-flight e alternativa acessível; Phaser recebe projeção, emite intenções tipadas e mantém pan, snap, preview, hit areas e limpeza efêmeros em uma cena/canvas.
- **W3-A6:** sessões concluídas, positivas e associadas a registros válidos concedem marcos cumulativos em 1/5/15/30. Grants `structure-grant`, inventário, feedback consolidado, áudio pós-commit e reconciliação idempotente pertencem aos dados/casos de uso, não à cena.

## P3-C — evidência automatizada

- corrigidos: marcador de schema obsoleto em testes v4/v5/v6, aviso de backup que tratava schema v7 como futuro, teste de footprint da planta antiga, abertura do compositor legado e token de navegação que reabria Construção após reload;
- adicionado E2E real: sessão manual positiva → unlock do primeiro marco → anúncio acessível → `Abrir construção` → inventário derivado → reload sem nova concessão;
- migração v6→v7 é coberta preservando objetos e criando `worldStructures` vazio; backup v5/restauração repetida, v4 e inventário derivado já são cobertos pela suíte;
- matriz final: 798 testes Vitest em 93 arquivos e 12 cenários Playwright passaram; formatação, lint, tipos, áudio, assets, build, relatório de performance, sync e build Android também passaram;
- APK debug não instalado: `android/app/build/outputs/apk/debug/app-debug.apk`, 36.125.507 bytes, SHA-256 `87973cc480abf2d8112438c24155ba0a79bf8d0d195fa6fb1e242b830b55a454`, gerado em 2026-08-28 04:48:53 -03:00;
- inspeção visual automatizada por navegador controlado não foi possível nesta sessão porque não havia navegador disponível. O Playwright Chromium executou os fluxos E2E; isso não substitui inspeção artística nem dispositivo físico.

## W3-A-R0 — reabertura diagnóstica

- a topologia inicial 12×10 fecha logicamente suas 44 arestas sem descoberta, duplicação ou sobreposição;
- os vãos foram reproduzidos pelo contrato visual: braços de canto menores que o span declarado, porta deslocada uma célula, metadados duplicados e compositor sem planos de junção verificáveis;
- a alternativa “Peças colocadas” é incondicional, pode coexistir com seleção/movimento/sheets e ocupa quase toda a viewport mobile como scroll owner;
- `blueprintVersion` não distingue construção canônica de construção modificada; qualquer migração exige comparação exata e preservação de dados pessoais;
- R0 não alterou produção, testes, PNGs, schema, backup, blueprint, grants ou UI e não autoriza R1.

## Próximo checkpoint humano

Revisar e aceitar ou corrigir nominalmente o diagnóstico W3-A-R0. Somente depois disso um novo prompt pode autorizar W3-A-R1 no escopo exato registrado em `W3_A_CORRECTION_LOG.md`. Estantes reativas, livros visuais ligados a atividades, livro aberto manipulável e leitor em forma de livro continuam fora desta correção.
