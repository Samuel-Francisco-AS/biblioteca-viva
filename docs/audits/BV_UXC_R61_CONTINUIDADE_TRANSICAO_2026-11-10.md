# BV-UXC R6.1 — Remoção de piscada e suavização da transição

**Data:** 10/11/2026 · **Base:** R6 da PR draft #49 · **Estado:** candidata remota, sem merge/CI ou gate Moto G06 nesta sessão.

## Sintoma observado no hardware

O proprietário aprovou a direção da R6 por melhorar a percepção de interação, mas observou uma **piscada durante a transição** ao navegar no dock, ao abrir o Arcanário e entre salas do Arcanário, como se a tela ainda em preparação aparecesse cedo. Relatou também **início e fim abruptos** da cortina.

## Causa encontrada no código

- `schedulePassage` da R6 liberava a troca de rota após apenas dois `requestAnimationFrame`, tipicamente muito antes de acabar o fade de saída (400 ms); o conteúdo de destino, inclusive Suspense e módulos lazy, já podia mudar sob a cortina parcialmente transparente.
- A cortina em `waiting` parava em **opacidade 0,97**, vazando 3% da tela sendo montada. Mesmo uma pequena mudança de contraste no conteúdo subjacente ficava perceptível.
- Ao mudar de `departing` para `waiting` e depois `arriving`, a animação do sigilo era removida/reiniciada em vez de permanecer idêntica nas três fases.
- Um segundo clique durante uma transição ativa poderia reiniciar a saída de opacidade zero e revelar por um instante a tela inferior.

Essa análise localiza causas possíveis e verificáveis por inspeção, mas **não substitui uma filmagem em câmera lenta ou captura de frames no Moto G06**.

## Modificações R6.1

- A cortina agora usa opacidade **1,0** quando sela e permanece em `waiting` enquanto os dados e módulos de destino carregam. Fundo inteiramente opaco, não um overlay translúcido.
- `bv-passage-fold`: **560 ms**, easing simétrico `cubic-bezier(0.42, 0, 0.58, 1)`, partindo de 0 e chegando a 1 gradualmente.
- `bv-passage-unfold`: **660 ms**, a mesma curva, de opacidade 1 a 0. Mínimo visual antes de abrir: **740 ms**, sempre condicionado à prontidão. Os 740 ms não são um timeout para mostrar conteúdo inacabado; são apenas o mínimo da apresentação visual.
- A navegação/parse da próxima tela só é enviada **depois do `animationend` da cobertura completamente opaca**, com RAFs seguintes, ou fallback de 720 ms quando não há evento de animação (p.ex., WebView em segundo plano). Isso desloca o trabalho pesado para o período em que a cortina já esconde o conteúdo.
- Os pseudo-elementos do sigilo mantêm uma única animação contínua nos estados `departing`, `waiting`, `resealing` e `arriving`, sem saltos/volta ao ângulo inicial a cada fase.
- Toques rápidos são protegidos: uma cortina já opaca permanece assim; uma cortina saindo mantém seu progresso; uma revelação interrompida volta suavemente a cobrir a tela, partindo da opacidade atual calculada, sem reiniciar o fade em zero.
- `cancelPassage` cancela timers e limpa variáveis inline; callbacks antigos conferem a identidade da sessão. Movimento reduzido continua sem coreografia longa. Link/React Router, dados, Canvas, rig, shaders e persistência não foram alterados.
- Testes direcionados foram **escritos/ajustados** para garantir nenhuma navegação antes do selo completo, espera enquanto o destino não está pronto, cancelamento/Back, toque duplo e preferências de movimento.

## Riscos, validação e próximo gate

**Não foram executados nesta sessão:** `npm ci`, testes Vitest, lint/formato, typecheck, build, E2E, criação de APK e teste Moto G06. Não apresentar PASS não medido, nem alegar que os engasgos de CPU foram eliminados.

A cortina completa introduz deliberadamente uma espera perceptível antes de iniciar a navegação (~560 ms), a pedido do proprietário. A responsividade inicial visual é imediata, mas isso **não reduz a latência do trabalho de destino**. Se a camada do WebView/JS congelar, até a animação de espera poderá engasgar. Manter R5/R4 como intervenções independentes.

**Gate físico curto:**

1. Testar no Moto G06: Biblioteca → Coleção → Arquivo → Biblioteca, Arcanário → Acervo → Baralhos → Ecos → Portal, inclusive primeiro carregamento e retorno rápido.
2. Observar se há *algum* frame vazando da tela nova enquanto a cortina cobre ou espera; testar com modo paisagem/retrato, dados diferentes e telas escuras/claras.
3. Comparar suavidade de início/saída e verificar continuidade da rotação do sigilo sem voltar ao começo em `waiting`.
4. Repetir toques consecutivos durante saída, espera e abertura; testar Voltar nativo e movimento reduzido.
5. Se a cortina continuar piscando, registrar vídeo (preferencialmente captura de tela em FPS alto) ou trace de composição/RAF; não mascarar com novas esperas cegas.

**Reprodução:**
```bash
cd ~/Projetos/biblioteca-viva
git fetch origin
git switch feat/bv-ux-touch-continuity-2026-11-09
git pull --ff-only origin feat/bv-ux-touch-continuity-2026-11-09
npm ci
npx vitest run src/app/interactionContinuity.test.ts src/App.test.tsx src/app/PrimaryDock.test.tsx
npm run format:check
npm run lint
npm run android:build:debug
```

**Limites de aceite:** depender de gate Android para fechar a R6.1; PR draft #49 sem merge.
