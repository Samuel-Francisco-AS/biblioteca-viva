# Roadmap

> Atualizado em 2026-09-09.

## Baseline concluído

- Aplicativo convencional funcional, local-first, com Dexie v8 e backup v6 somente para dados convencionais.
- Mundo anterior, Phaser e contratos espaciais legados removidos pelo WORLD RESET.
- **F0 — Definição da Fundação concluída.**
- **F1 — Three.js Foundation Spike concluída:** Three.js aprovado como renderer da Fundação com host React próprio, `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, interação bidirecional, lifecycle explícito e prova física no Moto G06.
- A cena vigente continua técnica e descartável; a Biblioteca final, o pipeline 3D formal e a persistência espacial ainda não existem.

## FUNDAÇÃO

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ▶ PRÓXIMA
F5 ⏳
F6 ⏳
```

### F2 — Integração e endurecimento da Fundação Three.js — concluída

Integração e endurecimento da Fundação Three.js, consolidando limites React/runtime, lifecycle, recuperação, organização interna e contratos estáveis. F2-B definiu a falha terminal pública e o fallback React; F2-C consolidou ownership da montagem; F2-D1 tornou falhas estruturais de render/resize terminais e impede render incidental durante pausa; F2-D2 definiu `webglcontextlost` como falha terminal e torna restoration tardia inerte; F2-E endureceu viewport/orientation/input contra dimensões transitórias, callbacks tardios e interrupções de Pointer Events, sem calibrar a ergonomia. F2-F executou a regressão consolidada, build web, E2E e Android técnico sem detectar regressão material.

F2 está concluída técnica e fisicamente no escopo da validação curta: a revalidação humana no Moto G06 confirmou lifecycle observável por background/resume, alinhamento React/canvas, seleção/highlight, pan, pinch, toque, controles React e rotação/orientação, sem regressão funcional perceptível. Quedas transitórias de FPS em orientação e em extremos rápidos de zoom recuperaram para aproximadamente 60 FPS, são não bloqueantes e não estabelecem causalidade com a F2. Câmera e interação finais continuam em F3.

### F3 — Câmera e interação mobile — concluída

Refinar câmera ortográfica/2.5D, pan, zoom, pinch, limites, seleção e ergonomia em tela pequena.

#### F3-A — Contrato e baseline da câmera — concluída

Mapeou e testou o baseline real: o runtime possui a instância/ciclo de vida da câmera e a interação possui a navegação por gesto; o frustum da fixture F1 é derivado por matemática pura somente de viewport válido. Não houve mudança de calibração, persistência espacial ou UX observável.

#### F3-B — Modelo de câmera, framing e limites — concluída

Consolidou estado runtime-only único para foco X/Z e zoom, framing determinístico a partir dos bounds técnicos da fixture, clamp dependente de viewport/zoom e resize que preserva a exploração e seleção. Target Y foi fixado porque sua liberdade era deriva incidental do pan no `camera.up`; o GLB tardio não participa do framing.

#### F3-C — Pan, zoom e pinch — concluída

Transformou o modelo F3-B em navegação espacial ancorada: pan resolve a tela no plano X/Z, wheel preserva o ponto sob o cursor e pinch usa razão de distâncias, midpoint e seu deslocamento para pan+zoom. Bounds, lifecycle e seleção foram preservados; não houve calibração física nem alteração da arbitragem tap/gesto.

#### F3-D — Tap, seleção e arbitragem de gestos — concluída

Consolidou uma candidatura de tap monotônica por pointer: até `8` CSS px inclusive permanece tap, ultrapassar o slop consome o primeiro delta e invalida seleção mesmo que o pointer retorne à origem. Segundo pointer/pinch, wheel com pointer ativo, cancelamento, perda de capture, pausa e terminalidade também invalidam; o Raycaster só executa no `pointerup` confirmado e tap vazio limpa seleção. Não houve recalibração de câmera, persistência espacial ou alteração da ponte React ↔ Three.

#### F3-E — Viewport, orientação, safe areas e integração mobile — concluída

Consolidou a autoridade do tamanho no `world-host` observado, sem transportar constantes de header, dock, safe areas ou breakpoints para Three. O layout reutiliza o contrato global de safe areas e a reserva já existente do dock fixo; o canvas se adapta sem overflow horizontal. Resize/orientação preservam a montagem, seleção e exploração lógica salvo clamp necessário, anulam somente o gesto em curso e mantêm picking no bounding rect atual. O gate Chromium cobriu 390×844, 844×390 e 320×640, sem provar a ergonomia ou system bars físicos.

#### F3-F1 — Gate técnico consolidado + APK — concluído

Executou a regressão completa, confirmou os contratos acumulados, gerou build web, APK debug e cobertura E2E integral. Não forneceu evidência de instalação ou uso físico.

#### F3-F2-FIX — Correção dos limites diagonais — concluída tecnicamente

O gate físico encontrou perda total da fixture nos limites superiores. O clamp deixou de combinar apenas os extremos independentes do retângulo envolvente: ele conserva um patch retangular de área mínima dentro da projeção convexa do piso técnico e dentro da viewport. A regra cobre portrait/landscape, quatro cantos e zoom `0.7–2.2`, sem alterar pan, zoom focal, pinch, seleção, lifecycle ou renderer.

#### Fechamento F3 — evidência humana e correção final dos bounds

A validação humana ampla no Moto G06 foi positiva para abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo, inclusive durante rotação. A observação é da fixture técnica e não é benchmark ou garantia do mundo final.

Durante essa validação, os limites superiores esquerdo/direito ainda podiam mostrar somente fundo. A correção F3-F2-FIX substituiu o AABB da projeção por região convexa válida de centros de câmera e preserva um patch do piso técnico de 15% dos spans projetados, limitado pelo espaço disponível. Ela preservou `CameraNavigation`, gestos, zoom, lifecycle e renderer; passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync Android e debug build, com novo APK. Não houve revalidação física específica desse fix no Moto G06; a ausência foi aceita como risco residual não bloqueante porque a falha era localizada, a correção é matemática e coberta, os contratos não mudaram e a fixture é descartável. F3 está encerrada.

### F4 — Contrato experimental de assets 3D — próxima fase autorizada

Provar escala, eixos, pivôs, materiais, texturas, carregamento, descarregamento e custo de GLTF/GLB sem congelar o pipeline artístico completo.

### F5 — Performance e Android físico — planejada

Aprofundar densidade de cena, frame time, recursos, loading, estabilidade, temperatura e limites iniciais de conteúdo no Moto G06.

### F6 — Acessibilidade e fechamento da FUNDAÇÃO — planejada

Consolidar o contrato entre a superfície 3D e React semântico, executar o gate humano de acessibilidade e fechar a FUNDAÇÃO inteira.

F1 aprovou a viabilidade da base Three.js; não concluiu câmera, interação, assets, performance ou acessibilidade finais.

## Depois da FUNDAÇÃO

1. Formalizar o pipeline de assets 3D a partir da evidência acumulada.
2. Projetar e implementar o primeiro recorte real do novo mundo.
3. Projetar persistência espacial nova somente quando esse recorte demonstrar o que precisa ser salvo.
4. Planejar sistemas maiores em fases próprias.
