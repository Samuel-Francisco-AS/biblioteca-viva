# Estratégia de testes

## Camadas

- Domínio: factories, transições e regras puras.
- Aplicação: casos de uso, concorrência, transações e erros públicos.
- Persistência: schemas, Dexie v8, upgrade v7→v8, reabertura e backup v6.
- React: shell, navegação, formulários, foco e estados acessíveis.
- E2E: fluxos convencionais e montagem/desmontagem segura do viewport técnico da Biblioteca.
- Runtime 3D: contratos de lifecycle, resize, ponte React ↔ Three e fallback; performance gráfica não é provada por mocks.
- Android: build técnico automatizado; instalação, toque, ergonomia e desempenho exigem evidência humana separada.

## F1 — cobertura concluída

A F1 cobriu:

- criação e destruição do runtime;
- proteção contra mount duplicado;
- resize e atualização da câmera;
- seleção runtime → React;
- seleção React → runtime;
- Biblioteca monta e desmonta um único viewport;
- visitas repetidas não acumulam canvases;
- falha de inicialização do renderer apresenta fallback textual;
- lifecycle não acumula listeners, observers ou loops.

Testes unitários/mocks podem validar contrato e cleanup, mas não devem ser apresentados como prova de WebGL real, FPS ou estabilidade física.

### Evidência da F1-A

- unitários: criação, mount único, proteção contra remount da mesma instância, loop único, resize, desconexão de observer/listener, disposal idempotente, remoção do canvas e falha do renderer;
- React: uma fábrica/instância por host, mount/start/dispose e fallback sem retry;
- Playwright Chromium: canvas WebGL real único, remoção ao sair da rota, novo canvas único ao retornar e navegação convencional preservada.

Mocks da F1-A provam somente contrato e lifecycle. O smoke Chromium prova inicialização WebGL naquele ambiente, não compatibilidade Android ou desempenho.

### Evidência da F1-B

- GLB real aceito pelo `GLTFLoader` instalado;
- cena com 45 primitivas e um mesh GLB, loading, sucesso, erro e conclusão tardia;
- disposal deduplicado de geometrias, materiais e texturas;
- Chromium de produção confirmando fixture e métricas básicas sem fallback.

### Evidência da F1-C

- matemática pura de limiar tap/drag, distância, clamp, wheel, pinch e transformação de pan;
- catálogo técnico `{id, label}` com dez proxies e o fixture;
- seleção válida/inexistente, troca e limpeza de `Box3Helper`;
- picking por `Raycaster`, inclusive resolução de mesh filho do GLB para a raiz lógica;
- Pointer Events, pan sem seleção acidental, wheel, pinch sintético, `pointercancel`, pointer capture defensivo e remoção de listeners;
- React refletindo callback do runtime e enviando seleção pelo controle nativo então vigente, com foco preservado;
- Chromium desktop e viewport mobile cobrindo picking/tap, pan, wheel, pinch sintético, ponte nos dois sentidos, highlight observável e dock acessível.

O multi-touch do Chromium é sintético e valida o estado de Pointer Events, não a ergonomia ou o pinch físico. A repetição formal de dez ciclos foi executada na F1-D.

A validação automatizada repetiu dez ciclos Biblioteca → outra rota → Biblioteca. A repetição física de dez ciclos também foi executada no gate Android.

### Evidência da F1-D

- funções puras cobrem janela móvel de FPS/frame time, ausência de valor antes de dois frames e reset explícito ou por relógio regressivo;
- runtime cobre estados explícitos, start/pause/resume/dispose repetidos, um RAF pendente, callback tardio, reset da janela durante pausa e retomada limpa;
- `visibilitychange` sintético em jsdom cobre pausa, cancelamento de gesto/pointer capture, preservação da seleção e retomada da mesma montagem com um loop;
- resize cobre o mesmo renderer, canvas, câmera e seleção, recalculando o frustum; `ResizeObserver` é o caminho primário e `window.resize`, testado com remoção do listener, é fallback;
- disposal cobre RAF, observer, listeners de documento/canvas, gesto, highlight, geometrias, materiais, texturas, fixture tardio, renderer, canvas, seleção e assinaturas de diagnóstico;
- emissão diagnóstica durante o loop é limitada por teste determinístico a quatro vezes por segundo e transições relevantes emitem imediatamente;
- Playwright Chromium de produção executa dez ciclos Biblioteca → Coleção → Biblioteca, verificando em cada retorno um canvas, um loop e uma superfície diagnóstica; no fim, seleção, pan e um único incremento de wheel continuam funcionais, sem erro de página/console;
- Chromium real também verifica FPS/frame time positivos e valores reais de draw calls, triângulos, geometrias, texturas, malhas, selecionáveis, primeiro frame e GLB.

Playwright não reproduziu uma transição de visibilidade real de background de forma confiável; esse contrato ficou na camada de runtime com `document.hidden` controlado. Isso não equivale a background/resume Android físico.

### Evidência consolidada da F1-E

Em 2026-09-09, o checkout consolidado passou:

- `npm run format` e `npm run format:check`, sem reescrita;
- `npm run lint` e `npm run typecheck`, sem erro ou warning próprio;
- `npm run test:run`: 63 arquivos e 443 testes aprovados;
- `npm run audio:check`: os dois WAVs declarados foram verificados deterministicamente;
- `npm run build` e `npm run performance:report`: build Vite 8.1.5 de produção com 222 módulos;
- `npm run test:e2e`: 12 testes Chromium aprovados em 32,7 s, sem retry e sem flake observado; o fluxo de busca/Arquivo passou na primeira execução;
- `npm run android:sync` e `npm run android:build:debug`: sync Capacitor e Gradle debug aprovados;
- `git diff --check`: aprovado.

Os warnings observados foram o limite já conhecido de chunks Vite acima de 500 kB, a mensagem de ambiente `NO_COLOR`/`FORCE_COLOR` do runner Playwright e os avisos Gradle preexistentes sobre `flatDir`. Nenhum deles bloqueou o gate. O E2E continua sendo prova Chromium; background/resume, toque, pinch, desempenho, temperatura, ergonomia e TalkBack no Moto G06 permanecem humanos.

Observação separada: `npm audit --omit=dev` continua relatando duas ocorrências de severidade alta associadas ao `react-router@7.18.1`, transitivo de `react-router-dom@7.18.1`, no advisory GHSA-qwww-vcr4-c8h2. A versão já existia antes da F1; nenhuma atualização ampla ou correção automática foi feita na F1-E.

### Evidência da F1-F-FIX

A primeira validação humana no Moto G06 confirmou a cena e as interações principais, mas encontrou comportamento físico incompatível no `<select>` da alternativa React: a ativação abriu uma superfície branca vazia sem opções utilizáveis. O app e o runtime permaneceram ativos e o Back retornou normalmente. O controle foi removido, sem tentativa de diagnosticar internamente o WebView, e substituído por botões HTML nativos `Anterior`/`Próximo`.

- testes React cobrem Próximo/Anterior sem seleção, avanço/retorno, wrap nas duas extremidades, seleção Three seguida de navegação React, chamadas a `selectObject`, texto e foco;
- E2E Chromium cobre picking → texto, Próximo/Anterior → highlight, wrap, saída/retorno, remoção completa do combobox e viewport mobile sem overflow horizontal;
- pan, wheel, pinch, lifecycle, cena e runtime Three permanecem nos testes existentes e não foram modificados;
- regressão final: 63 arquivos/446 testes Vitest e 12 E2E Chromium aprovados;
- a primeira execução E2E após a troca expôs coordenadas de pan obsoletas depois do auto-scroll dos novos botões; o teste passou a trazer o canvas de volta à viewport e recalcular sua caixa, e a suíte integral seguinte passou sem retry.

Essa cobertura não substituiu a revalidação física curta do novo APK nem aprovou TalkBack.

### Evidência humana consolidada da F1-F

No Moto G06, o gate humano da F1 foi concluído com:

- abertura do APK e renderização da cena, GLB, pan, pinch físico, picking, highlight e ponte React ↔ Three;
- revalidação dos botões `Anterior`/`Próximo` da F1-F-FIX nos dois sentidos;
- dez ciclos físicos `Biblioteca → outra rota → Biblioteca`, complementando os dez ciclos automatizados, sem degradação progressiva ou duplicação observável;
- background/resume funcional enquanto o processo permaneceu vivo;
- recuperação limpa após process death provocado pelo Android sob pressão de memória;
- aproximadamente 60 FPS após estabilização na cena mínima, sem crash ou artefato relevante;
- teste curto sem comportamento térmico anormal perceptível.

O breve quadro preto antes da reconstrução da cena e a janela de FPS inicialmente baixa foram observados, sem evidência de defeito estrutural ou desempenho sustentado baixo. TalkBack completo não foi executado e permanece pendente para F6 ou outro gate humano específico.

## F2-D1 — falhas terminais de execução

- doubles determinísticos cobrem exceção de `renderer.render()` dentro do RAF, sem RAF posterior, com canvas/recursos liberados e uma única falha pública `unavailable`;
- o mesmo caminho terminal cobre `setSize()` no resize e render solicitado por seleção fora do RAF; `start`, `resume`, `pause`, `resize`, seleção e `dispose()` após a falha não revivem a instância nem repetem cleanup ou notificação;
- pausa cobre resize e conclusão do fixture sem frame incidental, seguida de retomada normal; erro de carregamento do GLB continua degradado/recuperável e conclusão tardia após falha descarta o modelo;
- `WorldHost` cobre uma falha síncrona emitida por `start()` sem anunciar a experiência como pronta.

## F2-D2 — context loss terminal e assíncrono em voo

- doubles determinísticos disparam `webglcontextlost` durante execução e comprovam `preventDefault`, estado `failed`, uma falha pública `unavailable`, cancelamento do RAF e gesto, remoção de canvas/listeners e cleanup único;
- `webglcontextrestored` tardio, visibility, `start`, `pause`, `resume`, resize, seleção e `dispose()` depois da perda não agendam RAF, renderizam ou revivem a instância;
- conclusão tardia do fixture GLB após context loss libera o modelo sem alterar o estado terminal; o teste de erro normal do fixture continua provando degradação recuperável sem falha pública.

Esses doubles provam a política terminal e seus invariantes no runtime; não constituem reprodução física de perda de contexto WebGL em aparelho.

## F2-E — viewport e input resistentes a interrupções

- doubles do runtime cobrem `0×0`, viewport válido posterior pelo `ResizeObserver`, preservação do mesmo canvas/renderer e um único RAF; dimensão inválida não chama `setSize()` ou `render()`, nem torna o runtime terminal, e callback tardio do observer depois de `dispose()` é inerte;
- resize com mudança forte de aspect ratio preserva câmera, montagem e seleção; picking posterior usa a bounding box atual do canvas, não coordenadas anteriores;
- Pointer Events cobrem `pointercancel`, `lostpointercapture` com capture/release indisponíveis, pausa durante pan e início limpo após resume; pinch para um pointer muda para pan sem origem antiga ou seleção no encerramento, e pointer adicional além dos dois não entra no gesto;
- terminalidade durante gesto continua coberta pelo context loss: o input é removido/cancelado, `pointerup` tardio não emite seleção nem renderiza;
- gate unitário: `ThreeWorldRuntime.test.ts` (24 testes) e `npm run typecheck` aprovados; `git diff --check` aprovado;
- gate browser dirigido: `npm run build` foi necessário para preview; passaram em Chromium os cenários de montagem, desktop (picking/pan/wheel), viewport mobile sintético (tap/pan/pinch) e dez ciclos Biblioteca → Coleção → Biblioteca, sem acumular canvas ou loop. Os warnings conhecidos de chunk Vite acima de 500 kB e `NO_COLOR`/`FORCE_COLOR` não bloquearam a prova.

## F2-F — regressão consolidada e fechamento técnico

Em 2026-09-09, o checkout consolidado passou sem correções de comportamento durante o checkpoint:

- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram; o formatter alterou somente uma quebra de linha em teste, inspecionada como formatação;
- `npm run test:run`: 63 arquivos e 459 testes Vitest aprovados, sem falha ou reexecução;
- `npm run audio:check`: os dois WAVs declarados foram verificados deterministicamente;
- `npm run build` e `npm run performance:report`: build Vite 8.1.5 com 222 módulos, fixture GLB e chunk Three dinâmico preservados;
- `npm run test:e2e`: 12 cenários Chromium aprovados; a suíte cobriu fluxos convencionais, uma superfície Three, mount/unmount, saída/retorno, picking, ponte React ↔ Three, pan, wheel, pinch sintético, fallback, viewport mobile e dez ciclos vigentes;
- `npm run android:sync` e `npm run android:build:debug`: sync Capacitor e `assembleDebug` aprovados, com APK debug gerado;
- `git diff --check` passou.

Os únicos warnings observados foram os já conhecidos: chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` no runner Playwright e `flatDir` no Gradle. A E2E continua sendo prova Chromium; não comprova toque, pinch, background/resume, desempenho, temperatura, instalação ou orientação física no Moto G06.

## Evidência humana da F2 — revalidação física curta no Moto G06

Após os gates automatizados da F2-F, uma validação humana curta e dirigida no Moto G06 confirmou que background/resume, alinhamento do canvas com a interface React, seleção e highlight, pan, pinch, seleção por toque, botões React sincronizados e rotação/orientação permaneceram funcionais. Não houve crash, travamento, degradação sustentada, perda de interação, dessincronização React ↔ Three nem evidência de regressão funcional associada à F2.

Durante a rotação/orientação, houve queda transitória de aproximadamente 37–45 FPS, com recuperação e estabilização em aproximadamente 60 FPS. Na sequência extrema de zoom-out até o máximo e zoom-in até o máximo, houve queda transitória de aproximadamente 45–48 FPS, também seguida de recuperação e estabilização em aproximadamente 60 FPS. São observações humanas não bloqueantes, não benchmark formal e não regressão comprovada.

Playwright e os demais gates automatizados não provaram esse comportamento físico. A validação humana complementa o gate técnico da F2; foi curta e dirigida, não aprova temperatura prolongada, TalkBack, densidade real da Biblioteca, performance do mundo final ou budget artístico.

## F3-A — contrato e baseline da câmera

- `cameraMath.test.ts` cobre o frustum ortográfico de referência da fixture F1 para viewport horizontal, de referência e vertical, além de rejeitar zero, negativo, `NaN`, infinito e overflow sem fabricar estado de câmera;
- `ThreeWorldRuntime.test.ts` confirma a posição, zoom, planos near/far e frustum inicial da câmera, preservando os testes de resize, viewport transitório, picking por bounding box atual, pan, wheel, pinch e cancelamento;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 34 testes. Não houve E2E, build, Android ou teste físico neste checkpoint.

## F3-B — modelo de câmera, framing e limites

- `cameraMath.test.ts` cobre framing com padding em portrait/landscape, zoom mínimo/máximo, target lógico no plano X/Z, bounds que variam com viewport/zoom, clamp, resize válido, entradas não finitas e viewport/overflow inválidos;
- `ThreeWorldRuntime.test.ts` cobre framing inicial, preservação de target/zoom/seleção após orientação válida e a garantia de que a conclusão do GLB não reposiciona nem reenquadra a câmera;
- a suíte preserva os testes F2 de viewport transitório, mesma montagem/canvas, seleção, picking pela bounding box atual, cancelamento, pinch → pan, pausa e terminalidade;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 40 testes; `npm run typecheck`, `npm run format:check` e `git diff --check` passaram. Não houve E2E, build, Android ou teste físico neste checkpoint.

## F3-C — pan, zoom e pinch

- `cameraMath.test.ts` cobre pan derivado de pontos de tela em landscape/portrait e nos extremos de zoom, clamp no plano X/Z, zoom focal no centro, fora dele e próximo da borda, zoom-in/out, mínimos/máximos e a autoridade final dos bounds quando a âncora não pode permanecer exata;
- `interactionMath.test.ts` cobre normalização de `WheelEvent.deltaMode`, curva exponencial de wheel e composição da razão de pinch sem depender da quantidade de eventos;
- `ThreeWorldRuntime.test.ts` cobre wheel ancorado no bounding rect atual, midpoint de pinch em movimento com pan+zoom, pinch → pan e os contratos preexistentes de pointer adicional, cancelamento, pausa, terminalidade, seleção, picking e resize;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 52 testes; `npm run typecheck`, `npm run format:check` e `git diff --check` passaram. Não houve E2E dirigido, build, Android ou teste físico neste checkpoint.

## F3-D — tap, seleção e arbitragem de gestos

- `interactionMath.test.ts` fixa o threshold centralizado em `8` CSS px e sua borda inclusiva (`<=`); `ThreeWorldRuntime.test.ts` cobre tap sem movimento, jitter, borda, ultrapassagem com retorno, slop sem salto, tap após pan e wheel, espaço vazio, segundo/terceiro pointer, pinch imóvel, wheel concorrente, `pointercancel`, `lostpointercapture`, pausa e `pointerup` tardio terminal;
- `cameraMath.test.ts` preserva a matemática de framing/bounds/F3-C e `WorldHost.test.tsx` preserva os botões React `Anterior`/`Próximo`, wrap e a ponte bidirecional;
- gate focado: `npm run test:run -- src/features/library/three/interactionMath.test.ts src/features/library/three/cameraMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts src/features/library/WorldHost.test.tsx` aprovou 4 arquivos e 65 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` passaram;
- E2E dirigido: `npm run test:e2e -- e2e/r4-shell.spec.ts` aprovou 5 cenários Chromium da Biblioteca, incluindo tap → seleção, drag → nenhuma seleção, pinch sintético → nenhuma seleção e controles React. Não houve E2E integral, build, Android ou teste físico; o aviso conhecido `NO_COLOR`/`FORCE_COLOR` do runner não bloqueou.

## F3-E — viewport, orientação, safe areas e integração mobile

- `ThreeWorldRuntime.test.ts` cobre portrait → landscape durante candidatura de tap: a mesma montagem mantém seleção, encerra o gesto e o `pointerup` antigo não faz picking; um gesto posterior seleciona pela geometria nova. Os testes preexistentes preservam canvas/renderer/câmera únicos, clamp, viewport inválido e bounding rect atual;
- o gate focado `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts src/features/library/WorldHost.test.tsx src/pages.test.tsx` aprovou 5 arquivos e 67 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` passaram;
- `npm run build` foi executado para o preview E2E; o warning conhecido de chunks acima de 500 kB permaneceu sem bloquear;
- E2E dirigido: `npm run test:e2e -- e2e/r4-shell.spec.ts` aprovou 6 cenários Chromium. A sequência acrescentada cobre 390×844 → 844×390 → 390×844, uma seleção/picking após a mudança, a identidade do mesmo canvas/runtime, zoom preservado, controles/dock e ausência de overflow; também cobre 320×640. O aviso conhecido `NO_COLOR`/`FORCE_COLOR` não bloqueou;
- Chromium não prova safe areas ou system bars físicos, rotação física, toque/pinch físico, ergonomia, TalkBack, FPS Android ou temperatura. A validação humana ampla posterior fechou o escopo F3; performance aprofundada e acessibilidade permanecem para F5/F6.

## F3-F1 — gate técnico consolidado + APK

- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram; o formatter não alterou arquivos;
- `npm run test:run`: 64 arquivos e 487 testes Vitest aprovados;
- `npm run audio:check` verificou deterministicamente os dois WAVs declarados;
- `npm run build` e `npm run performance:report` passaram com 224 módulos; o entrypoint inicial permaneceu em 628.314 bytes e o chunk dinâmico `ThreeWorldRuntime` ficou em 629.884 bytes;
- `npm run test:e2e` aprovou 13 cenários Chromium em 37,2 s. A repetição precisou forçar o servidor local pelo modo CI porque o modo interativo tentou reutilizar portas já encerradas; os mesmos 13 cenários passaram, sem retry funcional;
- `npm run android:sync` e `npm run android:build:debug` passaram; `assembleDebug` gerou `android/app/build/outputs/apk/debug/app-debug.apk` com 7.525.817 bytes;
- `git diff --check` passou. Os warnings conhecidos permaneceram: chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` no Playwright e `flatDir` no Gradle.

Este gate confirma a regressão automatizada e o empacotamento. A validação humana ampla posterior fechou o escopo de câmera/interação da F3; performance aprofundada e TalkBack permanecem para F5/F6.

## F3-F2-FIX — limites diagonais da fixture

- `cameraMath.test.ts` força os quatro cantos por pan para os extremos e mede a interseção entre viewport e a projeção convexa do piso técnico; ela é sempre ao menos o patch mínimo explícito, com largura e altura de 15% dos spans projetados do piso, limitadas somente pela viewport disponível;
- os casos cobrem portrait em zoom mínimo (`0.7`), normal (`1`) e máximo (`2.2`), além de landscape em zoom mínimo e máximo; as rotas de `CameraNavigation`, interação, lifecycle e renderer permanecem cobertas pelos testes preexistentes;
- gate dirigido: `npm run test:run -- src/features/library/three/cameraMath.test.ts src/features/library/three/interactionMath.test.ts src/features/library/three/ThreeWorldRuntime.test.ts` aprovou 3 arquivos e 61 testes; `npm run format:check`, `npm run typecheck` e `git diff --check` foram executados neste checkpoint;
- `npm run build`, `npm run android:sync` e `npm run android:build:debug` passaram; o APK debug foi atualizado em `android/app/build/outputs/apk/debug/app-debug.apk` com 7.525.817 bytes. Permaneceram os warnings conhecidos de chunks Vite acima de 500 kB e `flatDir` do Gradle;
- não houve E2E adicional: não existe uma asserção Chromium simples que meça a área de geometria WebGL sem reintroduzir coordenadas de screenshot; a garantia é coberta na matemática pura.

## F3-CLOSE — fechamento de câmera e interação mobile

- F3-F1 consolidou 64 arquivos/487 testes Vitest, 13 cenários E2E Chromium, `format`, `format:check`, `lint`, `typecheck`, `audio:check`, build, relatório de performance, sync Capacitor e debug build Android; warnings conhecidos não bloquearam o gate;
- a validação humana ampla no Moto G06 foi positiva: app abriu normalmente, framing inicial, pan, tap/seleção, pinch, pinch → um pointer → pan, zoom mínimo/máximo, portrait → landscape → portrait e background/resume permaneceram funcionais, sem crash, travamento ou regressão perceptível; o FPS ficou aproximadamente em 60 ou próximo durante interação e rotação;
- a correção posterior dos bounds passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync e debug build Android, com novo APK;
- **o fix final dos bounds não recebeu revalidação física específica no Moto G06.** A ausência foi aceita como risco residual não bloqueante: a evidência humana ampla da F3 já era positiva, a falha era localizada, a correção matemática tem regressão dirigida, os contratos de câmera/input/lifecycle/renderer não mudaram e a fixture é descartável. Não é evidência física inexistente.

## F4-C — materiais, UV e texturas

- `f4cMaterialContract.test.ts` usa os quatro GLBs F4-B reais, confere seus SHA-256 registrados e faz `parseAsync()` com o `GLTFLoader` de `three@0.185.1` instalado;
- KayKit prova `MeshStandardMaterial`, `map`, UV, Base Color branco multiplicador, roughness `0,5` e metalness `0`;
- Kenney prova material por fatores sem maps, UV presente mas não necessário ao material, Base Color numérico, roughness `1` e metalness `0`, sem inferir comportamento da lista global `extensionsUsed`;
- Poly Haven prova UV, `map`, `normalMap`, `metalnessMap` e `roughnessMap`, incluindo a identidade do mesmo objeto `Texture` para metallic e roughness combinados;
- Quaternius prova material por fatores sem maps nem UV, Base Color numérico, roughness `0,5` e metalness `0`;
- o adaptador jsdom só permite concluir o parse e observar criação/referência estrutural dos maps de imagens embutidas; ele não prova fidelidade visual, equivalência pixel a pixel, orientação visual de UV/textura, colorimetria percebida, qualidade EXR → PNG, performance, custo, loading/unload ou Android;
- no gate humano C5, o usuário orbitou, aproximou e afastou os quatro espécimes no harness Three temporário: Poly Haven exibiu Base Color, UV, normal e metallic/roughness plausíveis, sem fallback ou discrepância perceptível; KayKit exibiu Base Color texture e UV corretos sem artefato; Kenney exibiu material simples normal; e Quaternius apareceu claro/cinza de modo coerente com seus fatores, não como textura ausente;
- não houve comparação pixel a pixel, medição colorimétrica nem comparação humana com Blender para Quaternius. O harness foi removido após esse gate e não se tornou página, rota ou ferramenta permanente.

## F4-D2 — load, attach e unload com host vivo

- `f4dAssetLifecycle.test.ts` lê o GLB KayKit F4-B real, confere o SHA-256 registrado e usa `GLTFLoader.parseAsync()` do `three@0.185.1` instalado; o adaptador jsdom permite somente o parse estrutural da imagem embutida;
- um owner experimental local ao teste aceita a root em `THREE.Scene` real e chama o `disposeObjectTree()` real ao unload; listeners `dispose` nos recursos KayKit confirmam geometry, material e texture usados uma vez no primeiro ciclo;
- um `Group` sentinela confirma que o unload remove somente a root alvo: a mesma `Scene`, o sentinel e a possibilidade de carregar/anexar nova root real permanecem após o unload;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 4 testes. Não prova idempotência repetida, A/B simultâneos, isolamento entre assets, callbacks/erros tardios, cancelamento lógico, cache, manager, renderer, performance ou Android.

## F4-D3 — repetição, isolamento e disposal

- `f4dAssetLifecycle.test.ts` mantém o owner somente como mecanismo local de prova e exercita `GLTFLoader.parseAsync()` real com KayKit, Poly Haven e Kenney F4-B, após conferir os SHA-256 registrados;
- um caso KayKit comprova que o segundo unload é inerte: os eventos reais de `dispose` de geometry, material e texture permanecem em um, e host/sentinel ficam intactos;
- três ciclos KayKit comprovam roots, geometries, materiais e textures distintos por parse, liberação única por conjunto e ausência de acúmulo de roots de asset, com o mesmo host e sentinel durante toda a sequência;
- dois owners independentes anexam Poly Haven e Kenney à mesma `Scene`; o unload seletivo de Poly Haven libera seus recursos sem remover Kenney nem disparar seus eventos de disposal, e o unload posterior de Kenney encerra seu próprio cleanup;
- no Poly Haven, Base Color, normal e a `Texture` única compartilhada por metallic/roughness são observadas por eventos reais de `dispose`; a texture compartilhada recebe um único evento. `referenceScene.test.ts` preserva a cobertura complementar da deduplicação geral de geometry/material/texture compartilhados dentro de uma árvore;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 7 testes. Ainda não prova operação em voo, abandono, callbacks ou erros tardios, cancelamento lógico, abort físico, cache, preload, registry, sharing entre assets, referência contada, renderer, performance ou Android.

## F4-D4 — assíncrono em voo, abandono, callbacks tardios e erros

- `f4dAssetLifecycle.test.ts` usa Quaternius F4-B real, com SHA-256 conferido e `GLTFLoader.parseAsync()` do `three@0.185.1`, para fornecer roots concretas ao harness;
- um double assíncrono exclusivo do teste retém callbacks e entrega sucesso/erro na ordem escolhida. Ele testa somente a política experimental de aceitação; D2/D3 continuam sendo a evidência de parse/load real, attach e unload com `GLTFLoader`;
- os cinco casos D4 comprovam abandono lógico antes de sucesso, transferência única com segundo sucesso rejeitado, erro individual recuperável com nova tentativa manual, erro tardio inerte e owner encerrado que rejeita sucesso posterior;
- listeners reais de `dispose` em geometry/material Quaternius comprovam liberação única dos resultados tardios ou adicionais rejeitados; root aceita permanece sem disposal até o unload normal, e host/sentinel não são ressuscitados nem destruídos;
- o gate dirigido `npm run test:run -- f4dAssetLifecycle referenceScene` aprovou 2 arquivos e 12 testes. Não prova abort físico, cancelamento de rede, cache, retry automático, preload, registry, sharing interasset, referência contada, renderer, performance, Android ou arquitetura final de loading.

## F4-D5 — regressão, consolidação e fechamento

- o gate dirigido `npm run test:run -- f4bAssetAxisGate f4cMaterialContract f4dAssetLifecycle referenceScene` reuniu geometria/eixos, materiais, lifecycle experimental e helper de disposal: 4 arquivos e 20 testes aprovados;
- `npm run format`, `npm run format:check`, `npm run lint` e `npm run typecheck` passaram. O lint exigiu somente tipagem segura nos adaptadores jsdom e guards locais de `Mesh` dos testes F4-B/C/D; parsing, fixtures, runtime e produção não mudaram;
- a suíte unitária integral `npm run test:run` aprovou 67 arquivos e 510 testes, sem retries ou falhas;
- o fechamento preserva a separação de evidência: D2/D3 provam `GLTFLoader` real, enquanto D4 usa double apenas para ordenar callbacks de roots reais. Não prova abort físico/rede, cache, retry automático, preload, registry, sharing interasset, referência contada, renderer, performance, Android ou arquitetura final de loading.

## Comandos

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run audio:check
npm run build
npm run performance:report
npm run test:e2e
npm run android:sync
npm run android:build:debug
```

Dados e backup exigem round-trip v6, rejeição segura de formato legado, checksum, duplicatas, transação e reabertura. O upgrade v7→v8 deve abrir sem erro, remover o mundo anterior e permitir criar/persistir novos registros.

A F1 não autoriza mudança de schema ou backup por causa do mundo.

Somente uma pessoa pode aprovar TalkBack, áudio percebido, toque, ergonomia, desempenho físico, instalação e atualização em aparelho real. Three.js foi aprovado como renderer da Fundação pela combinação dos gates automatizados com a evidência humana identificada da F1-F; TalkBack e os limites do mundo complexo não foram aprovados por essa decisão.
