# Arquitetura

## Dependências

```text
presentation (React/Phaser) → application → domain
infrastructure → application ports
```

Domain não importa React, Phaser, Dexie, Capacitor, DOM ou browser. Infrastructure valida entradas externas e implementa portas. React e Phaser nunca acessam Dexie.

## Estrutura W3-A

`WorldStructureState` é a fonte de verdade da construção e permanece separado de `PlacedObject`. Ele contém células de piso, placements ancorados e revisão. `STRUCTURE_CATALOG` tipa família física, categoria, orientação, extensão, pivô, offset, fallback e asset. As regras de ocupação, arestas, rotações e inventário derivado são puras na aplicação/domínio.

`DexieWorldStructureRepository` persiste somente `world.main`. O bootstrap inicializa o blueprint uma vez, na mesma transação que recupera objetos legados quando isso é necessário. Edição usa expected revision; a UI faz recuperação de conflito por reload da projeção.

## Fronteira de transação e eventos

Sessão, atividade e milestones são tratados no fluxo transacional existente. O `DexieMilestoneStore` avalia os marcos estruturais antes do evento; `MilestoneReached` só é publicado após commit. Reconciliação lê sessões anteriores, insere somente IDs ausentes e é idempotente. Backup restaura estrutura e milestones antes de o inventário ser consultado, sem armazenar projeções visuais.

## Apresentação e renderização

React orquestra os casos de uso, modo Construção, seleção, alternativa acessível, notificações e feedback consolidado. Phaser recebe `LibraryViewModel` e `ConstructionSceneState`, renderiza o plano e emite intenções tipadas. Ele não conhece Dexie nem regras de progressão. Há uma instância Phaser, uma cena e um canvas; pan, hit areas, previews, Graphics, timers e realce de unlock são limpos em troca de modo, pausa, shutdown e nova projeção.
