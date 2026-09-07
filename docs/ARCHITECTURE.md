# Arquitetura

## Dependências

```text
presentation (React/Phaser) → application → domain
infrastructure → application ports
```

Domain não importa React, Phaser, Dexie, Capacitor, DOM ou browser. Infrastructure valida entradas externas e implementa portas. React e Phaser nunca acessam Dexie.

## Estrutura W3-A

`WorldStructureState` é a fonte de verdade da construção e permanece separado de `PlacedObject`. Ele contém células de piso, placements ancorados e revisão. `STRUCTURE_CATALOG` tipa família física, categoria, orientação, extensão, campos visuais legados de compatibilidade, fallback e asset. Dados persistidos carregam identidade e placement lógico; canvas, alpha, escala, planos, regiões e depth são definições runtime, não estado pessoal.

`worldStructure.ts` é a autoridade para spans, intervalos, endpoints, vértices de canto, ocupação por arestas, rotação e semântica de porta. `worldStructureAnalysis.ts` deriva perímetro, componentes, fechamento diagnóstico e identidade normalizada `canonical-v1 | modified-v1 | future/unknown`. `worldStructureEditing.ts` orquestra place/move/rotate/store e piso sobre essas regras puras; ele não exige fechamento global nem consulta pixels.

`DexieWorldStructureRepository` persiste somente `world.main`. O bootstrap inicializa o blueprint uma vez, na mesma transação que recupera objetos legados quando isso é necessário. Edição usa expected revision; a UI faz recuperação de conflito por reload da projeção.

## Fronteira de transação e eventos

Sessão, atividade e milestones são tratados no fluxo transacional existente. O `DexieMilestoneStore` avalia os marcos estruturais antes do evento; `MilestoneReached` só é publicado após commit. Reconciliação lê sessões anteriores, insere somente IDs ausentes e é idempotente. Backup restaura estrutura e milestones antes de o inventário ser consultado, sem armazenar projeções visuais.

## Apresentação e renderização

React orquestra os casos de uso, modo Construção, seleção, alternativa acessível, notificações e feedback consolidado. Phaser recebe `LibraryViewModel` e `ConstructionSceneState`, renderiza o plano e emite intenções tipadas. Ele não conhece Dexie nem regras de progressão. Há uma instância Phaser, uma cena e um canvas; pan, hit areas, previews, Graphics, timers e realce de unlock são limpos em troca de modo, pausa, shutdown e nova projeção.

### Autoridades visuais entregues em W3-A-R3

O caminho estrutural ativo possui estas autoridades:

- `structureVisualGeometry.ts`: metadado canônico dos 12 assets e transformação pura de placement/geometria lógica em origem de junção, posição do canvas, escala, bounds, planos e regiões ocupadas;
- `structureVisualDepth.ts`: depth puro derivado da borda inferior visível, com bandas traseira/frontal e desempate estável;
- `structureVisualFallback.ts`: regiões procedurais e depth derivados da mesma transformação, sem hit area paralela;
- `structureRenderPlan.ts`: materializa transformação e depth uma vez por placement e ordena o plano;
- `SpatialWorldScene.ts`: aplica a projeção pronta ao sprite ou ao único fallback correspondente;
- `constructionInput.ts`: consome as mesmas `interactionRegions` usadas pelo renderer, incluindo os dois braços de cada canto.

`WALL_ASSETS`, `visualOffsetCells`, `visualSpanCells` e `pivot` permanecem como compatibilidade para APIs históricas; o renderer estrutural, o render plan e o hit testing ativos não os consultam. `wallComposition.ts` continua histórico e fora desse runtime.

### Continuidade estrutural vigente

A correção concluída deriva a normal interior da adjacência do piso e alinha o perfil estrutural por translação assinada na transformação canônica. Não há exceção por blueprint, coordenada ou `instanceId`. A repetição R3-C-B2 passou 9/9, com 31/31 emendas sem canal conectado de fundo; as oito evidências oficiais permanecem a baseline estrutural.

### Shell de apresentação em R4

`routes.ts` é o contrato central de destinos e metadados da navegação. `App` escolhe o header e o dock a partir desse contrato; “Resumo” aponta para a rota existente `/estatisticas`, e Novo registro continua sendo uma rota direta/contextual da Coleção. O drawer deixou de ser uma segunda navegação primária.

Na Biblioteca, o shell React é uma camada ao redor do `LibraryVisualHost`, não uma substituição do renderer. O host permanece montado ao alternar Construção, etiqueta, painel ou navegação visual; somente a saída real da rota encerra seu lifecycle. Construção comunica seu estado ao shell para ocultar o dock global e deixa um limite explícito para sua futura barra exclusiva.

`LibraryContextLabel` recebe sala/período já projetados pela página. Sua chave é apenas esse contexto; uma mudança real remonta o ciclo e cancela o timer anterior, enquanto rerenders comuns não o reiniciam. O ciclo React remove a etiqueta aos 5.000 ms, e a animação CSS normal ocupa exatamente esse intervalo. A alternativa semântica permanente permanece fora do canvas.

Nenhum contrato de domínio, aplicação, persistência, backup, inventário, progressão ou Phaser foi ampliado por R4. Os conteúdos internos das rotas e a máquina completa da Construção continuam pendentes.
