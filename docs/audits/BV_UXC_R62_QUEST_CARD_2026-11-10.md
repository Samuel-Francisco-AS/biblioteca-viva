# BV-UXC R6.2 — continuidade na abertura dos cards de quest

**Data:** 10/11/2026. **PR:** #49 draft. **Estado:** correção candidata remota; sem merge, CI, compilação, execução de testes ou validação física nesta sessão.

## Retorno físico

O usuário relata melhora consistente após a R6.1: transições de navegação ficaram perceptivelmente mais suaves, e o único engasgo ainda percebido é ao tocar um dos habitantes e abrir o card narrativo/quest correspondente no Canvas.

## Inspeção de código

Caminho relevante: `ThreeWorldInteraction.selectObject` → `ThreeWorldRuntime.handleSelectionChange` → `WorldHost.publishSelection` → `NarrativeSession.talk` → `NarrativePanel`.

- A sessão narrativa não consulta IndexedDB ou rede; a atualização de estado de uma quest é local. Isso NÃO exclui custos síncronos de renderização 3D/React/estilos.
- O painel é montado no React durante a seleção; simultaneamente, regras CSS com `:has(.rpg-dialogue)`, `:has(.rpg-journal)` ou `:has(.rpg-dialogue, .rpg-journal)` podiam forçar reavaliação de estilo de grandes áreas da Biblioteca.
- O efeito de foco aplicava `heading.focus({preventScroll:true})` a cada revisão do estado, mesmo ao escolher um ramo narrativo. Na coleta R5Q anterior, o foco havia custado aproximadamente 16–32 ms em diversas aberturas. O custo atual após R4/R5/R6.1 **não foi medido**.
- A R5 já deixou `render()` da seleção sem submissão 3D extra quando o loop está ativo, portanto não regressar para um render síncrono por clique.

## Implementação

1. `NarrativePanel.tsx`: expõe estado explícito `data-quest-panel-open` na raiz `.library-page` somente durante card/diário visível, com remoção no fechamento/desmontagem; expõe `data-journal-open` no componente correspondente.
2. `canvas-hud.css`, `styles-legacy.css` e `styles.css`: seletores de visibilidade e deslocamento que dependiam da procura ampla `:has(.rpg-dialogue/.rpg-journal)` agora usam atributos de estado local. Outras regras CSS não relacionadas são preservadas.
3. `NarrativePanel.tsx`: foca o cabeçalho no próximo frame disponível, após o commit visual do card, em vez de forçar possível layout imediatamente durante o primeiro efeito; mantém `preventScroll`. O foco só é reenviado na abertura ou troca de interlocutor (não a cada escolha). Anulação de RAF pendente ao fechar card, desativar Mundo ou desmontar.
4. `NarrativePanel.test.tsx`: casos atualizados para foco assíncrono e diagnósticos R5Q, além de regressão de atributo explícito de card e de fechamento.

**Importante:** Estas são intervenções nos suspeitos identificados por inspeção; ainda não houve rastreamento físico que comprove a origem exata da interrupção, nem comparação P95/P99. Nenhuma animação ou mecânica foi retirada. Esta rodada não insere a cortina de navegação nas quests.

## Gate físico rápido — Moto G06

1. Depois de atualizar o APK, tocar sucessivamente em Samael, Aryn, Ytha e Lua; confirmar seleção, abertura do card, progresso e fechamento.
2. Fazer escolhas do diálogo; confirmar que o foco não salta de volta ao título a cada escolha e que Escape/Voltar fecha corretamente. Testar navegação acessível por teclado/controle e sem gestos.
3. Verificar fluidêz do mundo enquanto o card abre e fecha; repetir 10–12 toques e comparar com R6.1. Abrir o diagnóstico R5Q e comparar `reactCommit` → `focusStart/End`, `animationStart`, `longTasks` e atrasos após `handlerEnd`.
4. Garantir que painéis de exploração ocultem/apareçam adequadamente quando o card/diário está aberto, inclusive rotação retrato ↔ paisagem.
5. Se o engasgo permanecer, coletar trace da thread principal e composição Android/WebView no único clique que abre a quest; focar React commit, layout/style, `applyNarrativeToAgency` e animação de personagem.

Não declarar PASS físico nem fechar a PR sem o gate.

Compilar no Fedora após sincronizar:
```bash
cd ~/Projetos/biblioteca-viva
git fetch origin
git switch feat/bv-ux-touch-continuity-2026-11-09
git pull --ff-only origin feat/bv-ux-touch-continuity-2026-11-09
npm ci
npx vitest run src/features/library/NarrativePanel.test.tsx src/features/library/WorldHost.test.tsx
npm run lint
npm run android:build:debug
```
