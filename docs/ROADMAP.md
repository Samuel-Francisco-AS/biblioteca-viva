# Roadmap — Reboot espacial

> Estado operacional: 2026-08-30.

## W1 e W2 — histórico integrado

W1 estabeleceu a cena Phaser única, câmera e pan; W2 introduziu `PlacedObject` persistido. Permanecem como compatibilidade do reboot, mas a geometria estrutural vigente não é mais a planta fixa W1.

## W3-A — construção estrutural — reaberta após validação física

- [x] W3-A1: modelo `WorldStructureState`, células, arestas, orientações e validação pura;
- [x] W3-A2: catálogo, 12 assets runtime RGBA, fallback e blueprint idempotente;
- [x] W3-A3: Dexie v7, backup v5, restore/reload e compatibilidade v4;
- [x] W3-A4: casos de uso, revisão otimista, single-flight, seleção React e alternativa acessível;
- [x] W3-A5: Phaser de uma cena/canvas, pan, snap, previews e lifecycle efêmeros;
- [x] W3-A6: progressão por sessões elegíveis, marcos 1/5/15/30, grants e feedback consolidado;
- [x] P3-C: regressão, E2E, áudio/assets/performance, documentação e APK debug.

Os itens abaixo registram a entrega técnica histórica do P3-C; não equivalem à aprovação atual da W3-A.

### Reprovação física posterior

O Moto G06 confirmou planta visualmente descontínua e UI de construção que cobre o mapa e bloqueia a manipulação. A evidência reabriu W3-A sem apagar o histórico de P3-C.

### Correção W3-A-R0–R6

- [ ] **R0 — auditoria e especificação executável:** evidência técnica produzida em `W3_A_CORRECTION_LOG.md`; aceite humano pendente;
- [ ] **R1 — geometria canônica e identidade:** não iniciado e não autorizado;
- [ ] **R2 — assets e planos de junção:** não iniciado;
- [ ] **R3 — compositor e hit areas:** não iniciado;
- [ ] **R4 — máquina de estados e UI mobile:** não iniciado;
- [ ] **R5 — regressão, compatibilidade e APK técnico:** não iniciado;
- [ ] **R6 — validação física final no Moto G06:** não iniciado.

## Próxima etapa de produto

As próximas etapas W3 permanecem bloqueadas até a decisão humana de R0 e a correção nominal de W3-A. Estantes reativas, livros visuais vinculados às atividades, livro aberto manipulável e visualizador em forma de livro não fazem parte de R0–R6. Continuam fora do escopo XP, moeda, nível, streak, portas verticais, multiplayer, nuvem e novos mundos.
