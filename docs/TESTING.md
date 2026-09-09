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
