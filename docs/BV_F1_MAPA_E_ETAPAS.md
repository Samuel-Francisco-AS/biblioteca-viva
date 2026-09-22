# Biblioteca Viva — Mapa da FUNDAÇÃO e detalhamento da F1

**Data de referência:** 2026-09-21

**Estado geral:** F0–F6 concluídos no plano técnico/arquitetural; Three.js aprovado como renderer da Fundação; a FUNDAÇÃO está concluída. A dívida humana assistiva permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release aplicável.

**Escopo:** Fundação técnica do novo mundo 3D da Biblioteca Viva

## Papel e autoridade deste documento

Este documento é um mapa vivo de orientação, navegação e decomposição das fases da FUNDAÇÃO/F1. `docs/STATUS.md` continua sendo a única autoridade operacional sobre o estado presente do projeto.

- [`docs/decisions/ADR-009-three-foundation.md`](decisions/ADR-009-three-foundation.md) registra a decisão vigente; o contrato F0-D concluído está preservado em [`docs/history/plans/`](history/plans/F0-D_THREE_FOUNDATION_SPIKE_CONTRACT.md);
- este mapa não autoriza implementação sozinho;
- qualquer divergência de estado deve ser resolvida em favor de `docs/STATUS.md`;
- o mapa pode ser atualizado a cada checkpoint para preservar contexto e facilitar navegação.

---

# 1. Visão geral

A etapa **FUNDAÇÃO** existe para provar que a base técnica do novo mundo 3D é viável antes de começarmos a construir a Biblioteca real.

A direção aprovada até aqui é:

```text
React
  ↓
WorldHost
  ↓
ThreeWorldRuntime
  ↓
Three.js
```

com:

- 3D real;
- apresentação ortográfica/2.5D;
- integração com o aplicativo React existente;
- Three.js como renderer aprovado da Fundação;
- `WebGLRenderer` como baseline inicial;
- `OrthographicCamera`;
- GLTF/GLB como caminho experimental de assets;
- Android/Capacitor;
- acessibilidade preservada por superfícies React semânticas;
- nenhum reaproveitamento da antiga W3-A;
- nenhuma persistência espacial prematura.

A F1 aprovou a viabilidade da base Three.js, F2 concluiu a integração e o endurecimento do runtime, F3 concluiu o contrato de câmera e interação mobile, F4 concluiu o contrato experimental de assets, F5 consolidou o envelope físico e os guardrails no Moto G06, e F6 fechou a fronteira técnica/arquitetural de acessibilidade. A ADR-010 continua formalizando o Pipeline 3D v1; P3D-B1 está concluída documentalmente e P3D-B2–F estão adiados. BF-0 replanejou a próxima trilha para Biblioteca Funcional Primeiro.

---

# 2. Mapa geral da FUNDAÇÃO

```text
FUNDAÇÃO

F0 — Planejamento e contrato                         ✅ CONCLUÍDA
 │
 ├─ F0-A Requisitos e não negociáveis               ✅
 ├─ F0-B Protocolo de prova                          ✅
 ├─ F0-C Pesquisa e escolha tecnológica              ✅
 └─ F0-D Contrato do spike                           ✅
 │
 ▼
F1 — Three.js Foundation Spike                       ✅ CONCLUÍDA
 │
 ├─ F1-A Bootstrap da fundação                       ✅ CONCLUÍDA
 ├─ F1-A-FIX Tipagem e mapa operacional              ✅ CONCLUÍDA
 ├─ F1-B Cena de referência + GLB                    ✅ CONCLUÍDA
 ├─ F1-C Interação + ponte React ↔ Three             ✅ CONCLUÍDA
 ├─ F1-D Lifecycle + observabilidade                 ✅ CONCLUÍDA
 ├─ F1-E Gates técnicos + Android build              ✅ CONCLUÍDA
 └─ F1-F Gate físico no Moto G06                     ✅ CONCLUÍDA
     └─ F1-F-FIX Alternativa React                   ✅ CONCLUÍDA
 │
 ▼
F2 — Integração e endurecimento do runtime           ✅ CONCLUÍDA
 │
 ▼
F3 — Câmera e interação mobile                       ✅ CONCLUÍDA
 │
 ├─ F3-A Contrato e baseline da câmera                ✅ CONCLUÍDA
 ├─ F3-B Modelo de câmera, framing e limites          ✅ CONCLUÍDA
 ├─ F3-C Pan, zoom e pinch                            ✅ CONCLUÍDA
 ├─ F3-D Tap, seleção e arbitragem de gestos          ✅ CONCLUÍDA
 ├─ F3-E Viewport, orientação e integração mobile     ✅ CONCLUÍDA
 ├─ F3-F1 Gate técnico consolidado + APK               ✅ CONCLUÍDO
 └─ Fechamento: bounds, gates e evidência humana        ✅ CONCLUÍDO
 │
 ▼
F4 — Contrato experimental de assets 3D              ✅ CONCLUÍDA
 │
 ├─ F4-A Contrato + preflight de autoria              ✅ CONCLUÍDA
 │   ├─ A1 Auditoria do caminho atual                 ✅ CONCLUÍDA
 │   ├─ A2 Contrato experimental v0                  ✅ CONCLUÍDA
 │   └─ A3 Preflight real de autoria                 ✅ CONCLUÍDA
 ├─ F4-B Geometria, escala, eixos e pivô             ✅ CONCLUÍDA
 ├─ F4-C Materiais, UV e texturas                     ✅ CONCLUÍDA
 ├─ F4-D Loading, unload e ownership/disposal         ✅ CONCLUÍDA EXPERIMENTALMENTE
 ├─ F4-E Custo e compressão experimental              ✅ CONCLUÍDA EXPERIMENTALMENTE
 │   ├─ E1 Baseline de custo                          ✅ CONCLUÍDA
 │   ├─ E2 Diagnóstico e seleção de hipótese          ✅ CONCLUÍDA
 │   ├─ E3 Experimento selecionado                    ✅ CONCLUÍDA
 │   ├─ E4 Comparação objetiva + gate humano PASS     ✅ CONCLUÍDA
 │   └─ E5 Fechamento                                 ✅ CONCLUÍDA
└─ F4-F Regressão, consolidação e handoff F5         ✅ CONCLUÍDA
 │
 ▼
F5 — Performance e Android físico                    ✅ CONCLUÍDA
 │
 ├─ F5-A Baseline e cenário de carga                 ✅ CONCLUÍDA
 ├─ F5-B Stress físico, loading e limites            ✅ CONCLUÍDA
 └─ F5-C Consolidação, guardrails e gate final        ✅ CONCLUÍDA
 │
 ▼
F6 — Acessibilidade + fechamento arquitetural        ✅ CONCLUÍDA TECNICAMENTE
 │
 ├─ F6-A Contrato de acessibilidade e auditoria      ✅ CONCLUÍDA
 ├─ F6-B Evidência automatizada e APK candidato      ✅ CONCLUÍDA
 └─ F6-C Fechamento documental com dívida aceita     ✅ CONCLUÍDA
 │
 ▼
FUNDAÇÃO ✅ CONCLUÍDA
 │
 ▼
PIPELINE 3D v1 — P3D-B1 CONCLUÍDA; B2–F ADIADOS
 │
 ├─ B1 Proveniência e organização documental de `bookshelf` ✅
 └─ B2–F Retomada condicionada a GLB definitivo          ⏸
 │
 ▼
BF-0 ✅ → BF-1 ✅ CAMADA MÍNIMA PROCEDURAL
 │
 ▼
BF-2 ⏳ PRIMEIRA ÁREA DE LEITURA FUNCIONAL
 ├─ BF-2A ✅ CONTRATO E PROJEÇÃO NEUTRA DOS LIVROS REAIS
 ├─ BF-2B ✅ LIVRO PROCEDURAL E LAYOUT DETERMINÍSTICO
 ├─ BF-2C ✅ INTEGRAÇÃO COM RUNTIME E SELEÇÃO
 ├─ BF-2D ✅ PONTE REACT/APLICAÇÃO E FLUXO FUNCIONAL
 └─ BF-2E 🟡 GATE TÉCNICO APROVADO — FÍSICO DIRIGIDO PENDENTE
 │
 ▼
PRIMEIRO RECORTE REAL + VALIDAÇÃO TALKBACK
```

---

# 3. Fases já concluídas

## F0 — Definição da Fundação

**Estado: ✅ CONCLUÍDA**

A F0 foi a fase de planejamento e decisão anterior à implementação do novo mundo.

Ela definiu o que precisava ser provado, qual tecnologia seria testada e quais limites arquiteturais seriam respeitados.

### F0-A — Requisitos e não negociáveis

**Estado: ✅ CONCLUÍDA**

Definiu os requisitos que a nova fundação deve respeitar:

- arquitetura React/application/domain existente;
- 3D real;
- apresentação ortográfica/2.5D;
- Android/Capacitor;
- input mobile;
- lifecycle controlável;
- integração acessível;
- assets 3D;
- observabilidade;
- ausência de persistência espacial prematura.

Também consolidou que o aplicativo convencional precisa continuar funcional e que o canvas 3D não pode eliminar as superfícies semânticas React.

### F0-B — Protocolo de prova

**Estado: ✅ CONCLUÍDA**

Definiu como a fundação será testada na prática.

A prova utiliza uma cena pequena e artificial com:

- piso;
- paredes;
- proxies de móveis/objetos;
- pelo menos um GLB/GLTF;
- 25–50 objetos visíveis aproximadamente;
- iluminação simples;
- câmera ortográfica;
- pan;
- zoom;
- pinch;
- seleção;
- integração da seleção com uma superfície React acessível.

Também definiu provas de:

- mount/unmount;
- pause/resume;
- background/resume;
- disposal;
- bundle;
- FPS/frame time;
- draw calls;
- triângulos;
- carregamento;
- comportamento em APK;
- Moto G06 físico.

### F0-C — Pesquisa e escolha tecnológica

**Estado: ✅ CONCLUÍDA**

Foram avaliados:

- Three.js;
- PlayCanvas;
- Babylon.js;
- React Three Fiber;
- Godot.

A conclusão foi:

**Three.js será o candidato primário da Fundação.**

A prova será feita de forma sequencial, sem implementar engines concorrentes em paralelo.

Também ficou definido que:

- R3F não entra inicialmente;
- R3F poderá ser estudado depois apenas se resolver problemas concretos de integração React ↔ Three;
- WebGPU não é baseline;
- Godot permanece apenas como alternativa futura caso a solução web demonstre um limite estrutural relevante.

### F0-D — Contrato do spike

**Estado: ✅ CONCLUÍDA**

Transformou as decisões da F0 em um contrato executável para a F1.

O contrato congelou:

- stack inicial;
- limites arquiteturais;
- cena padrão;
- câmera;
- input;
- picking;
- lifecycle;
- GLTF/GLB;
- acessibilidade estrutural;
- observabilidade;
- budget provisório;
- gates técnicos;
- gate físico;
- testes mínimos;
- proibições;
- critérios de aprovação;
- critérios de abandono.

A F0-D autorizou explicitamente o início da F1 e agora está preservada como contrato histórico concluído.

---

# 4. F1 — Three.js Foundation Spike

**Estado: ✅ CONCLUÍDA**

A F1 é a primeira implementação do novo mundo.

Ela **não constrói ainda a Biblioteca real**.

Seu objetivo foi provar que Three.js pode funcionar como renderer primário dentro da arquitetura atual, em navegador e Android, com lifecycle controlável, input mobile, GLB, integração React e desempenho minimamente viável.

A execução em checkpoints reduziu o risco e impediu que runtime, assets, input, lifecycle e Android virassem um único bloco difícil de diagnosticar.

---

# 5. F1-A — Bootstrap da fundação

**Estado: ✅ CONCLUÍDA**

## Objetivo

Criar o primeiro esqueleto executável:

```text
LibraryPage
   ↓
World Host
   ↓
Three World Runtime
   ↓
Three.js
```

## Escopo

Nesta etapa serão tratados:

- sincronização documental da F0;
- inspeção do checkout;
- baseline de bundle antes de Three.js;
- instalação de Three.js;
- host React próprio;
- runtime Three.js isolado;
- `WebGLRenderer`;
- `Scene`;
- `OrthographicCamera`;
- canvas único;
- loop de renderização;
- resize básico;
- API de lifecycle;
- mount;
- unmount;
- remount;
- fallback React se o renderer falhar;
- testes básicos de criação e destruição.

## Fora do escopo

Ainda não entram:

- cena completa;
- GLB;
- `GLTFLoader`;
- pan;
- pinch;
- picking;
- seleção;
- ponte bidirecional de seleção;
- benchmark físico;
- pipeline 3D;
- Blender;
- persistência espacial.

## Critério de saída

F1-A termina quando o projeto demonstrar que consegue hospedar e descartar uma instância Three.js limpa, sem violar as fronteiras arquiteturais e sem degradar o aplicativo convencional.

### F1-A-FIX — Tipagem e mapa operacional

**Estado: ✅ CONCLUÍDA**

Checkpoint corretivo que substituiu a declaração artesanal parcial por tipagem comunitária compatível e reposicionou este mapa como documento ativo subordinado a `docs/STATUS.md` e ao contrato F0-D então vigente. Não adicionou funcionalidade da F1-B.

---

# 6. F1-B — Cena de referência + GLB

**Estado: ✅ CONCLUÍDA**

## Objetivo

Transformar o runtime vazio em uma cena 3D técnica suficiente para provar renderização real e ingestão de assets.

## Escopo

A cena deverá incluir:

- piso simples;
- quatro segmentos de parede ou proxies equivalentes;
- 3–5 proxies distintos de mobiliário/objetos;
- aproximadamente 25–50 objetos visíveis;
- iluminação ambiente/hemisférica simples;
- uma luz direcional;
- câmera ortográfica inclinada;
- pelo menos um GLB/GLTF carregado via `GLTFLoader`.

O GLB será apenas um **fixture técnico**.

Ele não representa ainda um asset oficial da Biblioteca e não inicia o pipeline artístico.

## Primeiro contato com objeto 3D

É nesta etapa que ocorre o primeiro carregamento real de um modelo 3D.

A necessidade aqui é apenas provar:

```text
arquivo GLB/GLTF
        ↓
GLTFLoader
        ↓
Three.js
        ↓
objeto visível na cena
```

Não é ainda uma etapa de aprendizado profundo de Blender ou produção de assets.

## Critério de saída

A cena deve renderizar corretamente, o modelo 3D deve carregar de maneira previsível e o runtime deve continuar estruturalmente simples e descartável.

## Evidência do checkpoint

A implementação concluída possui 45 meshes técnicos de piso, paredes e proxies, mais um mesh do fixture GLB interno. O carregamento real por `GLTFLoader`, os caminhos de sucesso/erro e o disposal após carregamento normal ou tardio possuem cobertura automatizada; o Chromium de produção confirmou o fixture carregado e a cena sem fallback. Métricas e bundle estão registrados em `PERFORMANCE.md`.

---

# 7. F1-C — Interação e ponte React ↔ Three

**Estado: ✅ CONCLUÍDA**

## Objetivo

Provar que o usuário consegue navegar e selecionar elementos no mundo e que o estado relevante pode ser representado fora do canvas.

## Escopo

Desktop:

- drag para pan;
- wheel para zoom;
- clique para seleção.

Mobile:

- arrasto para pan;
- pinch para zoom;
- toque para seleção;
- limiar entre toque e pan;
- tratamento de `pointercancel` e interrupções equivalentes.

Picking:

- `Raycaster` ou solução equivalente apropriada;
- feedback visual simples no objeto selecionado.

Ponte bidirecional:

```text
Mundo 3D
   ↓
estado efêmero
   ↓
React acessível

React acessível
   ↓
estado efêmero
   ↓
Mundo 3D
```

A superfície React deve:

- descrever o ambiente experimental;
- informar o objeto selecionado;
- permitir mudar a seleção por controle nativo sem depender de gesto preciso no canvas;
- refletir a seleção novamente no mundo.

## Critério de saída

A interação espacial e a representação semântica React precisam funcionar nos dois sentidos.

## Evidência do checkpoint

Os dez proxies e o fixture receberam identidade técnica efêmera. `Raycaster`, `Box3Helper`, pan, wheel, pinch, distinção de tap/drag, cancelamento e captura defensiva foram integrados ao lifecycle. O host React apresentou inicialmente label em texto e um `select` nativo que comandava o mesmo highlight. O F1-F-FIX posterior preservou a ponte e substituiu esse controle, incompatível no Moto G06, por botões nativos `Anterior`/`Próximo`. Testes unitários e Chromium cobrem os dois sentidos.

---

# 8. F1-D — Lifecycle e observabilidade

**Estado: ✅ CONCLUÍDA**

## Objetivo

Provar que o runtime pode viver dentro de um aplicativo real sem acumular recursos, loops ou estados órfãos.

## Escopo

Lifecycle:

```text
create / mount
start
pause
resume
resize
dispose
```

Validar:

- entrada na Biblioteca;
- saída;
- retorno;
- 10 ciclos Biblioteca → outra rota → Biblioteca;
- background;
- resume;
- visibilidade;
- resize;
- orientation;
- disposal de geometries, materials, textures e renderer;
- ausência de múltiplos canvases;
- ausência de múltiplos loops;
- ausência de listeners acumulados.

Observabilidade:

- FPS;
- frame time;
- draw calls;
- triângulos;
- geometries;
- textures;
- quantidade aproximada de objetos;
- tempo até primeiro frame utilizável;
- carregamento do GLB;
- impacto no bundle;
- erros WebGL/Three relevantes.

## Critério de saída

Precisamos ter evidência de que o runtime consegue ser criado, pausado, retomado e destruído previsivelmente e que conseguimos observar seu custo técnico.

## Evidência do checkpoint

O runtime passou a expor estados explícitos, um único RAF, pause/resume idempotentes, integração com visibilidade, resize por observer/fallback e disposal terminal. Callbacks tardios não retomam uma instância descartada; pausa e background cancelam gestos ativos com pointer capture defensivo.

Snapshots locais combinam janela móvel de 750 ms para FPS/frame time, `renderer.info`, contagens distintas da cena, primeiro frame utilizável e carregamento do fixture. A superfície React recebe no máximo quatro atualizações por segundo durante o loop, sem timer, store global, persistência ou telemetria.

Vitest cobre transições, cleanup, métricas e callbacks tardios. Playwright Chromium de produção completou dez ciclos Biblioteca → Coleção → Biblioteca com exatamente um canvas e um loop na montagem ativa; seleção, pan e wheel permaneceram funcionais e o diagnóstico existiu somente na rota Biblioteca. Background/visibility real e desempenho físico permanecem para Android humano.

---

# 9. F1-E — Gates técnicos + Android build

**Estado: ✅ CONCLUÍDA**

## Objetivo

Executar a regressão completa e provar que a implementação pode ser empacotada para Android.

## Escopo

Validar, no mínimo:

```text
npm run format
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
git diff --check
git status --short
```

Também verificar:

- funcionamento convencional do app;
- rota Biblioteca;
- lifecycle automatizável;
- fallback do renderer;
- bundle;
- geração do APK debug.

## Limite

Gerar o APK **não significa aprovar Three.js**.

Desempenho físico, toque, temperatura e estabilidade real pertencem ao gate seguinte.

## Evidência do checkpoint

Em 2026-09-09, a regressão consolidada passou `format`, `format:check`, lint, typecheck, 63 arquivos/443 testes Vitest, áudio, build Vite de produção, relatório de bundle, 12 E2E Chromium e `git diff --check`. A prova E2E incluiu desktop, viewport mobile sintético, ponte bidirecional, fallback coberto em teste e dez ciclos Biblioteca → Coleção → Biblioteca sem canvas ou loop duplicado.

O baseline web de produção preservou 46 meshes, 11 selecionáveis, 46 draw calls sem highlight, 47 com highlight e 546 triângulos. `android:sync` encontrou somente os três plugins Capacitor existentes e `android:build:debug` concluiu o Gradle; o APK de 7.525.817 bytes foi gerado no caminho esperado. Nenhuma instalação ou validação física foi realizada.

---

# 10. F1-F — Gate físico no Moto G06

**Estado: ✅ CONCLUÍDA**

## Objetivo

Responder a principal pergunta da F1:

> Three.js é tecnicamente viável para a Biblioteca Viva no hardware Android de referência?

## Autoridade física

O Moto G06 é o aparelho de referência deste checkpoint.

## Evidência humana

No Moto G06, o APK abriu corretamente e a Biblioteca exibiu piso, paredes, proxies e fixture sem objeto cortado, corrupção visual, crash, travamento ou artefato gráfico relevante. Pan, pinch físico, seleção por toque, picking, highlight, Three → React e React → Three passaram.

Durante o preenchimento inicial da janela de FPS, foram vistos valores de aproximadamente 8–12 FPS que subiram rapidamente por valores intermediários. Depois da estabilização, a cena sustentou aproximadamente 60 FPS; a primeira interação com certos grupos causou quedas breves para aproximadamente 53–57 FPS, seguidas de recuperação rápida. Pan e pinch não produziram queda perceptível relevante nem lag relatado. O valor inicial baixo não representa desempenho sustentado.

O usuário percebeu abertura mais rápida e maior fluidez em comparação contextual com a antiga implementação 2D removida na W3. Essa observação é subjetiva e não constitui benchmark científico entre Phaser e Three.js.

Ao ativar o `<select>` da alternativa React, porém, o Moto G06 abriu uma superfície branca vazia sem opções utilizáveis. O aplicativo e o runtime permaneceram ativos, e o Back do Android retornou normalmente. Não foi atribuída uma causa interna ao WebView; registrou-se apenas o comportamento físico incompatível observado.

### F1-F-FIX — substituição da alternativa React

**Estado: ✅ CONCLUÍDA E REVALIDADA FISICAMENTE**

O `<select>` foi removido e substituído por botões HTML nativos `Anterior`/`Próximo`. Os controles percorrem o catálogo efêmero com wrap: sem seleção, Próximo escolhe o primeiro e Anterior o último; nas extremidades, a navegação continua pela extremidade oposta. A seleção permanece no runtime, preservando React → Three → highlight → callback → texto React.

Na revalidação física, os botões ficaram visíveis e funcionais, o objeto foi identificado corretamente no React, `Próximo` e `Anterior` mudaram a seleção e o highlight acompanhou a mudança. Canvas → React e React → Three permaneceram funcionais; a superfície branca deixou de ser necessária. Os botões são somente uma prova experimental da Fundação e não definem a UX final da Biblioteca.

## Lifecycle e processo Android

Dez ciclos físicos `Biblioteca → outra rota → Biblioteca` reconstruíram a cena em menos de aproximadamente um segundo, segundo a percepção humana. Em cada retorno houve um breve quadro preto e reinício momentâneo da janela de FPS, seguido de recuperação para aproximadamente 60 FPS. Não houve degradação progressiva, duplicação observável ou perda de interação. O quadro preto é comportamento atual do spike, não defeito estrutural comprovado.

Background/resume passou quando o processo permaneceu vivo: o aplicativo retornou ao estado em que estava e continuou funcional. Sob pressão de memória provocada por outro aplicativo pesado, o Android encerrou o processo; ao retornar, a Biblioteca Viva iniciou novamente sem corrupção ou crash. Encerramento do processo pelo sistema não é falha do lifecycle Three.js; o requisito é recuperação limpa em um novo processo.

Em aproximadamente cinco minutos de teste não houve comportamento térmico anormal nem throttling percebido. Isso não constitui teste térmico prolongado. TalkBack completo não foi executado e permanece para F6 ou outro gate humano específico.

## Resultado

O piso provisório de 30 FPS foi superado com folga na cena mínima. Essa evidência não define o budget nem garante desempenho do mundo final.

**Three.js está aprovado como renderer da Fundação do novo mundo.** Alternativas não serão implementadas preventivamente e só serão reconsideradas diante de evidência estrutural futura.

---

# 11. F2 — Integração e endurecimento do runtime

**Estado: ✅ CONCLUÍDA TÉCNICA E FISICAMENTE**

A F2 sucede a F1. O checkpoint F2-B consolidou a fronteira pública React ↔ runtime: falha terminal tipada, fallback React e a garantia de no máximo uma instância montada/viva por host. O F2-C agrupou os recursos de cada montagem do `ThreeWorldRuntime` sob um owner interno e unificou sua liberação em `dispose()`, inclusive quando `mount()` é interrompido. O F2-D1 tornou falha estrutural de render/resize terminal, com cleanup único e notificação ao host, sem transformar falha de fixture em falha terminal e sem render incidental durante pausa. O F2-D2 definiu `webglcontextlost` como falha terminal: os listeners pertencem à montagem/canvas, são removidos no cleanup e uma restoration tardia não revive a instância. F2-E preservou essa montagem através de resize/orientation: viewport inválido aguarda dimensão válida, `ResizeObserver` não acumula e o fallback de janela é removido corretamente; Pointer Events não conservam gestos órfãos após cancelamento, perda de capture, pausa ou terminalidade. Não foram definidos parâmetros de câmera ou UX final.

F2-F executou a regressão consolidada sem correção de comportamento: os gates de formatação, análise estática, 459 testes Vitest, áudio, build e relatório de bundle, 12 cenários E2E Chromium, sync Capacitor e Gradle debug passaram. A revalidação humana física curta posterior no Moto G06 confirmou background/resume, alinhamento do canvas com React, seleção/highlight, pan, pinch, seleção por toque, botões React sincronizados e rotação/orientação, sem crash, travamento, degradação sustentada, perda de interação ou dessincronização React ↔ Three. Em orientação houve queda transitória de aproximadamente 37–45 FPS e, na sequência extrema zoom-out/zoom-in, de aproximadamente 45–48 FPS; ambas recuperaram e estabilizaram em aproximadamente 60 FPS. São observações não bloqueantes, sem causalidade atribuída à F2 e disponíveis para reavaliação em F3 (ergonomia e extremos de zoom) e F5 (performance, frame time e Android físico). A F2 está concluída técnica e fisicamente no escopo dessa validação curta; ela não aprova benchmark formal, mundo final, temperatura prolongada, TalkBack, densidade real ou budget artístico.

---

# 12. F3 — Câmera e interação mobile

**Estado: ✅ CONCLUÍDA**

F3-A mapeou e formalizou o baseline da câmera. F3-B consolidou a autoridade navegável runtime-only: `CameraNavigation` mantém target X/Z e zoom; `ThreeWorldInteraction` continua owner de Pointer Events, wheel, pinch, picking e highlight, mas encaminha mudanças ao modelo. F3-C completou a navegação espacial: coordenadas do canvas passam pelo bounding rect atual para o viewport lógico, pan deriva dois pontos no plano X/Z, wheel preserva sua âncora e pinch usa razão de distâncias/midpoints sucessivos para compor pan+zoom. F3-D consolidou a intenção: a candidatura de tap é monotônica, pertence ao pointer inicial e só permite picking no `pointerup` se nunca cruzou o slop de `8` CSS px. F3-E consolidou a integração: React/CSS preserva safe areas e reserva o dock, enquanto o runtime recebe somente a caixa efetiva observada do host. O frustum da fixture agora é matemática pura e somente deriva de viewport finito, positivo e representável; viewport transitório mantém o último estado confiável e aguarda novo valor válido.

O framing contém bounds explícitos da fixture técnica com padding de 15%. Após F3-F2-FIX, os limites não usam apenas o retângulo envolvente da projeção: eles preservam dentro da viewport um patch retangular cuja largura e altura são ao menos 15% dos respectivos spans projetados do piso técnico, limitado somente pelo tamanho disponível da viewport. Esse patch pertence à projeção convexa real do piso, portanto também nos cantos diagonais há uma área visível de geometria técnica. Target Y é fixo em `1.1`, pois a faixa anterior era deriva incidental de `camera.up`, não plano navegável. A curva de wheel `0.0015` e os limites `0.7–2.2` foram aceitos para a fixture no fechamento da F3, sem constituir ergonomia final da Biblioteca. Câmera e seleção continuam runtime-only e não persistidas; os endurecimentos F2 de lifecycle, context loss, pausa, callbacks tardios, viewport, cancelamento e capture permanecem invariantes.

### F3-A — Contrato e baseline da câmera

**Estado: ✅ CONCLUÍDA**

Cobriu o cálculo de frustum e o baseline inicial com testes focados, sem alterar a calibragem, a cena ou a UX.

### F3-B — Modelo de câmera, framing e limites

**Estado: ✅ CONCLUÍDA**

Definiu framing determinístico sem GLB tardio, bounds explícitos e estado lógico único. Resize/orientação preservam foco, zoom e seleção se ainda forem válidos.

Escopo concluído:

- estado lógico único para foco X/Z e zoom;
- enquadramento ortográfico técnico;
- limites dependentes de viewport e zoom;
- preservação em resize/orientação válido.

### F3-C — Pan, zoom e pinch

**Estado: ✅ CONCLUÍDA**

Implementou pan derivado de screen space, wheel focal e pinch ancorado no midpoint, incluindo deslocamento simultâneo do midpoint. A razão incremental de distância torna o zoom independente da frequência de Pointer Events; todos os resultados passam pelo clamp F3-B. Não mudou seleção, thresholds de tap, safe areas ou ergonomia física.

### F3-D — Tap, seleção e arbitragem de gestos

**Estado: ✅ CONCLUÍDA**

Fixou `8` CSS px com borda inclusiva, consumindo o slop que inicia pan e proibindo reabilitação de tap após afastar e voltar. Segundo pointer/pinch (mesmo imóvel), pointer extra, wheel concorrente, cancelamento, perda de capture, pausa, disposal e terminalidade invalidam seleção; pinch → pan segue limpo. O Raycaster somente roda para tap confirmado pela câmera e bounding rect atuais; tap em espaço vazio limpa seleção. Não houve hitbox especulativa, recalibragem de câmera ou alteração da ponte React ↔ Three.

### F3-E — Viewport, orientação, safe areas e integração mobile

**Estado: ✅ CONCLUÍDA**

Consolidou o `world-host` como única autoridade do viewport Three: `ResizeObserver` observa a caixa real que o layout atribuiu, e Three não infere header, dock, safe areas ou breakpoints. O CSS reutiliza as variáveis globais de safe area, preserva a reserva do dock fixo, contém o canvas e reduz padding da Biblioteca em telas estreitas. Portrait, landscape e retorno preservam canvas/runtime, seleção e exploração salvo clamp necessário; viewport inválido segue aguardando. Resize encerra o gesto em curso para evitar coordenadas antigas, e picking seguinte usa bounding rect atual. Chromium cobriu 390×844, 844×390 e 320×640 sem overflow horizontal; a validação humana ampla posterior da F3 confirmou orientação e toque/pinch no Moto G06.

### F3-F1 — Gate técnico consolidado + APK

**Estado: ✅ CONCLUÍDO TECNICAMENTE**

Consolidou formatação, análise estática, 487 testes Vitest, áudio, build e relatório de bundle, 13 E2E Chromium, sync Capacitor e Gradle debug. O APK foi gerado com 7.525.817 bytes. Não houve evidência física nova, alteração Android nativa, persistência espacial ou mudança de renderer.

### F3-F2-FIX — Limites diagonais da fixture

**Estado: ✅ CONCLUÍDO TECNICAMENTE**

A validação humana ampla da F3 encontrou que os cantos superiores podiam mostrar apenas o fundo da cena. A causa era o clamp independente dos eixos do retângulo envolvente da projeção: seus cantos não pertencem necessariamente ao piso técnico inclinado. O modelo agora calcula uma região convexa de centros de câmera que mantém um patch retangular de área mínima dentro da projeção real do piso e da viewport. `CameraNavigation` continua a única autoridade; não houve alteração de gestos, renderer, lifecycle, zoom ou persistência. Os testes matemáticos cobrem quatro cantos, portrait, landscape e zoom `0.7`, `1` e `2.2`; build, sync e APK debug passaram. Não houve revalidação física específica desse fix; a limitação foi aceita como não bloqueante no fechamento da F3.

### Fechamento da F3 — evidência humana e bounds

**Estado: ✅ CONCLUÍDO**

A validação humana ampla no Moto G06 foi positiva para abertura, framing, pan, tap/seleção, pinch, pinch → um pointer → pan, zoom, rotação e background/resume, sem crash, travamento ou regressão perceptível; o FPS ficou aproximadamente em 60 ou próximo durante interações e rotação. A falha residual nos limites superiores foi corrigida por região convexa de centros de câmera com patch mínimo visível do piso. O fix passou 3 arquivos/61 testes dirigidos, `format:check`, `typecheck`, `git diff --check`, build, sync e debug build Android, mas não recebeu revalidação física específica. Essa limitação de evidência foi aceita como risco residual não bloqueante: a correção é localizada e matemática, seus contratos não mudaram e a fixture é técnica e descartável.

---

# 13. F4 — Contrato experimental de assets 3D

**Estado: ✅ CONCLUÍDA — F4-A–F concluídas; o resultado é contrato experimental, não Pipeline 3D definitivo**

F4 produz evidência para formalizar um Pipeline 3D somente depois da FUNDAÇÃO. Ela não inicia catálogo da Biblioteca, arte definitiva, persistência espacial ou gestão permanente de assets. GLTF/GLB continua o caminho experimental de runtime; a ferramenta de autoria permanece substituível. Blender 3.3.21 está aprovado somente como ferramenta experimental de autoria durante F4, não como obrigação arquitetural, dependência ou ferramenta definitiva.

### F4-A — Contrato + preflight de autoria

**Estado: ✅ CONCLUÍDA**

- **A1 — Auditoria do caminho atual: ✅ concluída.** Mapeou o fixture F1 desde o import de URL até o `GLTFLoader`, a cena, ownership da montagem, tratamento de erro, callback tardio e disposal deduplicado. Não há cache, unload com runtime vivo ou asset manager no baseline.
- **A2 — Contrato experimental v0: ✅ concluída.** Exige fonte editável/proveniência para cada prova futura, preserva GLTF/GLB no runtime e deixa escala, eixos, pivô, materiais, texturas, compressão e arquitetura de assets como hipóteses abertas.
- **A3 — Preflight real da ferramenta de autoria: ✅ concluída.** Blender 3.3.21 executou via CLI, salvou `.blend`, exportou e reimportou GLB 2.0 em prova descartável. No gate humano no Fedora, viewport, seleção, órbita, transformações, Object/Edit Mode, edição geométrica, save e export GLB foram utilizáveis por alguns minutos, sem crash, travamento, tela preta, flickering, corrupção visual ou lentidão persistente relevante. O resultado aprova Blender somente como ferramenta experimental durante F4; não fixa o Pipeline 3D futuro.

### F4-B — Geometria, escala, eixos e pivô

**Estado: ✅ CONCLUÍDA EXPERIMENTALMENTE**

Quatro GLBs normalizados de fontes externas com proveniência suficiente foram testados diretamente pelo `GLTFLoader` instalado. Sem transformação corretiva no runtime, seus roots lógicos chegam em identidade, os bounds encostam no chão Three `Y=0` e as dimensões chegam como `[largura, altura, profundidade]`; o mapeamento observado é Blender `X →` Three `X`, `Y → -Z`, `Z → Y`. Azrael também confirmou root lógico com nove meshes no diagnóstico, mas ficou fora do checkout porque a evidência local de licença/proveniência não permite promovê-lo. O contrato de autoria é experimental: não fixa frente visual/funcional nem antecipa materiais, custo, ownership/load/unload ou Pipeline 3D.

### F4-C — Materiais, UV e texturas

**Estado: ✅ CONCLUÍDA EXPERIMENTALMENTE**

O diagnóstico, o contrato mínimo, a prova estrutural dos quatro GLBs pelo `GLTFLoader` instalado e o gate humano visual confirmaram materiais por fatores quando não há textura/UV necessária, materiais texturizados quando há UV correspondente e representação metallic-roughness combinada válida. KayKit e Poly Haven foram observados com textura/UV coerentes; Kenney e Quaternius permaneceram materiais por fatores válidos; a aparência clara de Quaternius não representa textura perdida. O harness visual temporário foi removido. Não foram aprovados equivalência pixel a pixel, shader/formato definitivo, compressão, custo, loading/unload ou Pipeline 3D permanente.

### F4-D — Loading, unload e ownership/disposal

**Estado: ✅ CONCLUÍDA EXPERIMENTALMENTE — D1–D5 concluídas**

D1 auditou o fixture F1 e definiu o contrato experimental mínimo sem mudar produção. D2 comprovou em harness isolado que KayKit real pode ser carregado pelo `GLTFLoader`, aceito por owner local de teste, anexado a `THREE.Scene`, removido com `disposeObjectTree()` e substituído por nova root no mesmo host, preservando um sentinel. D3 comprovou unload repetido inerte, três ciclos sem acúmulo e unload seletivo de Poly Haven sem tocar Kenney; geometry, material e texture emitiram disposal, e a texture metallic/roughness compartilhada do Poly Haven foi descartada uma vez. D4 usou roots Quaternius reais e callbacks controlados somente no teste para comprovar abandono lógico, transferência única, erro recuperável, callback stale inerte e owner terminal, sem abort físico. D5 confirmou o conjunto por gate dirigido de 4 arquivos/20 testes e suíte unitária integral de 67 arquivos/510 testes, sem retries ou falhas. Não houve `AssetManager`, cache, API permanente ou alteração de runtime.

### F4-E — Custo e compressão experimental

**Estado: ✅ CONCLUÍDA EXPERIMENTALMENTE — E1–E5 concluídas**

E1 mediu diretamente os quatro GLBs F4-B e E2 identificou Poly Haven como outlier de textura e selecionou a única variante autorizada. E3/E4 reduziram somente suas três imagens de 1024×1024 para 512×512: GLB 5.828.612 → 711.352 bytes (-87,796%), imagens codificadas -88,013% e estimativa RGBA8 base 12 → 3 MiB. E5 consolidou que geometry/índices/UV/transforms/material e `GLTFLoader` foram preservados. O gate humano foi PASS com leve desfoque em comparação próxima, considerado irrelevante para a apresentação ortográfica/2.5D de objetos menores e distantes; identidade visual, material e leitura geral foram preservados. A evidência é restrita a este asset/experimento: não aprova budget, asset final, decoder, runtime, compressão ou Pipeline 3D definitivo. O princípio sobrevivente é medir antes de otimizar e dimensionar textura conforme necessidade visual e custo observado.

### F4-F — Regressão, consolidação e handoff F5

**Estado: ✅ CONCLUÍDA**

Consolidou autoria editável e substituível, normalização antes do runtime, semântica material relevante, lifecycle experimental em harness e custo medido. Os quatro fixtures e seus hashes foram reconfirmados; os testes de contrato permanecem; o laboratório externo e a variante 512 não são dependência de F5. Não foram criados assets de produção, `AssetManager`, cache, budget, codec ou Pipeline 3D definitivo.

---

# 14. F5 — Performance e Android físico

**Estado: ✅ CONCLUÍDA — F5-A/F5-B/F5-C concluídas; F6 e a FUNDAÇÃO foram concluídas posteriormente**

F1 produziu o primeiro baseline.

F5 transformou essa evidência inicial em um envelope físico observado e guardrails de remedição, sem definir hard budgets para o mundo.

Escopo previsto:

- FPS;
- frame time;
- draw calls;
- triângulos;
- memória;
- carregamento;
- estabilidade;
- densidade de cena;
- comportamento após uso prolongado;
- background/resume;
- temperatura;
- Android físico;
- limites iniciais de conteúdo.

O Moto G06 permanece autoridade física.

O objetivo é descobrir o que o mundo pode sustentar antes de aumentar significativamente sua complexidade.

### F5-A — Baseline e cenário de carga — concluída tecnicamente

O build de diagnóstico (`VITE_ENABLE_DIAGNOSTICS=true`) expõe um seletor temporário que recria o `ThreeWorldRuntime` real e seu `WebGLRenderer`; o build normal mantém somente a fixture F1. Não há manager, cache, catálogo, persistência espacial ou otimização preventiva.

- **Baseline F1:** fixture técnica atual, 1 GLB e nenhum asset F4; referência estrutural anterior: 46 meshes e 546 triângulos.
- **Corpus F4:** baseline mais uma cópia de KayKit, Kenney, Poly Haven e Quaternius: 5 GLBs no total, quatro meshes F4/1.104 triângulos adicionais conhecidos pelo corpus.
- **Corpus F4 ×4:** baseline mais quatro cópias determinísticas do mesmo corpus: 17 GLBs no total, 16 meshes F4/4.416 triângulos adicionais conhecidos pelo corpus.

O diagnóstico reutiliza FPS/frame médio por RAF e `renderer.info` para draw calls, triângulos, geometrias e texturas, além de contar meshes/objetos visíveis e exibir o progresso de assets do cenário. Estes números devem ser lidos no aparelho depois de todos os assets carregarem; a F5-A não define budget, threshold, FPS aceitável ou limite de conteúdo.

### F5-B — Stress físico, loading e limites — concluída

No Moto G06 (Android 15/API 35), F5-B mediu os três cenários no `ThreeWorldRuntime`/`WebGLRenderer` reais, após corrigir a CSP que bloqueava os URLs `blob:` usados pelo `GLTFLoader` para imagens embutidas. O corpus confirmou mapas materiais/texturas no aparelho e o cenário ×4 sustentou observações de repouso, loading/remount, memória por ADB, orientação, background/resume, pan, pinch, picking somente dos objetos F1 e sessão humana de aproximadamente 15 minutos. Não houve crash, kill, tela preta, recarregamento, artefato, perda humana de fluidez ou aquecimento percebido; `dumpsys thermalservice` permaneceu em status `0`. `renderer.info.memory.textures` foi registrado como recursos WebGL contabilizados, não como contagem de imagens nem memória GPU total; as contagens diagnósticas de referências/`Texture` únicas dos materiais são complementares. A variação de memória entre remounts e resume não permite declarar leak. Nenhum cenário adicional, otimização, asset novo, manager, streaming ou budget foi adotado; F5-C consolidou essa evidência sem promover a fixture a mundo produtivo.

### F5-C — Consolidação, guardrails iniciais e gate final — concluída

F5-C reconciliou F5-A/F5-B sem nova validação física. O ×4 é o maior envelope observado e confortável no corpus diagnóstico, não um máximo do Moto G06; portanto não há hard cap de FPS, calls, triângulos, geometrias, texturas, objetos, PSS ou Graphics. Os guardrails são gatilhos de remedição: antes de conteúdo simultâneo materialmente maior que 17 GLBs/16 `Texture` únicas, de remount interno na ordem de um segundo, de pico recorrente de memória, ou de recursos como personagens, animação, transparência, sombras, partículas e pós-processamento, medir novamente no aparelho. Loading não é cache frio; PSS/Graphics não são VRAM exata; sensores térmicos USB não definem limite térmico. O harness permanece versionado e exclusivo de `VITE_ENABLE_DIAGNOSTICS=true`, pois é isolado, reproduzível e útil para regressão futura; não foi promovido a produto nem removido sem nova necessidade física. KTX2/Basis, Draco, Meshopt, LOD, instancing, atlas, merge, streaming, preload/cache e `AssetManager` continuam não adotados até gargalo correspondente. F6 herda renderer aprovado e envelope documentado, mas ainda precisa do gate humano de acessibilidade/TalkBack; a fixture, o Pipeline 3D e a persistência espacial seguem futuros.

---

# 15. F6 — Acessibilidade e fechamento arquitetural

**Estado: ✅ CONCLUÍDA TECNICAMENTE/ARQUITETURALMENTE — dívida humana assistiva aceita**

Última fase da FUNDAÇÃO.

O objetivo será comprovar que o mundo 3D consegue coexistir com os compromissos de acessibilidade do aplicativo.

Princípio central:

> O canvas 3D não pode ser a única representação semântica de uma função essencial.

O estado relevante do mundo deverá poder alimentar superfícies React acessíveis.

Exemplo:

```text
objeto 3D selecionado
        ↓
estado compartilhado
   ↙             ↘
highlight       React acessível
```

F6-A confirmou a fronteira existente: descrição/status/fallback em React, seleção textual anunciada, botões nativos e ponte bidirecional com o mesmo highlight; canvas fora da árvore semântica. F6-B cobriu a única lacuna automatizável — foco/teclado e marcos semânticos — sem mudança de produção, e aprovou a regressão integral e o APK debug técnico. F6-C aceitou conscientemente a indisponibilidade temporária do Moto G06 como dívida assistiva, sem declarar TalkBack, leitura/anúncios/foco percebidos, ergonomia, contraste ou tamanho de texto Android aprovados. Pan, zoom, pinch, câmera e exploração são não essenciais nesta fixture.

Contrato sobrevivente e dívida futura:

- React preserva a semântica, os estados textuais, o fallback, o foco/teclado automatizável e as alternativas a gesto preciso das funções essenciais da fixture;
- o canvas não é requisito semântico, e pan/zoom/pinch/exploração não recebem paridade especulativa nesta fixture;
- a dívida humana não reabre F6: o gate futuro de tecnologias assistivas, incluindo TalkBack, valida o build atual antes do fechamento do primeiro recorte real e de beta/release aplicável.

A **FUNDAÇÃO está concluída** no plano técnico/arquitetural. A dívida humana assistiva exige validar o build então atual e representativo antes de fechar o primeiro recorte real e antes de beta/release dependente dessa experiência. A ADR-009 já aprova especificamente Three.js como renderer da Fundação com base na F1.

---

# 16. Depois da FUNDAÇÃO

BF-0 aprovou a sequência Biblioteca Funcional Primeiro. BF-1 está tecnicamente concluída; BF-2A concluiu o contrato e a projeção neutra dos livros reais, BF-2B a fábrica/layout isolados, BF-2C a integração de snapshot neutro e BF-2D a ponte React/aplicação por snapshot de montagem, lista semântica, overflow acessível e seleção bidirecional. BF-2E aprovou o gate técnico com base convencional real, overflow 70 + 1 e lifecycle; aguarda a validação física dirigida no Moto G06. Não existe persistência espacial.

```text
FUNDAÇÃO
   ↓
BF-0 ✅ replanejamento
   ↓
BF-1–BF-5 Biblioteca funcional com conteúdo provisório
   ↓
PRIMEIRO RECORTE REAL + validação TalkBack bloqueante
   ↓
PERSISTÊNCIA ESPACIAL, somente se necessária
```

## Biblioteca Funcional Primeiro

O conteúdo inicial será procedural/provisório em TypeScript/Three.js. React mantém a superfície semântica e uma seleção visual não pode ser o único caminho para funções essenciais. BF-1A materializou a identidade procedural; BF-2C a corrigiu para que `bookshelf` aceite somente seu contrato estreito, enquanto `book-volume` exige `entryId`. `ReadingAreaBook` é contrato neutro e entra no runtime como snapshot carregado por montagem pela query estreita da Biblioteca: livros visíveis são selecionáveis, carregam `entryId` e são irmãos da representação da estante; todos, inclusive overflow, continuam na lista React. Slots são derivados da variante corrente e BF-1D relayouta; a capacidade inicial atual é 70, não 89. Não há atualização live, schema, tabela, backup ou persistência espacial; BF-2E tem gate técnico aprovado e aguarda físico dirigido.

P3D-B1 preserva `bookshelf` e sua proveniência. P3D-B2–F estão adiados, não concluídos nem cancelados, e só retomam quando houver necessidade demonstrada de ingestão ou substituição por GLB definitivo. ADR-010 continua a regular esse caminho GLB; fixtures F1/F4 e cenários F5 não são promovidos.

---

## Persistência espacial

**Estado: 🔒 FUTURO / DELIBERADAMENTE ADIADA**

Só será projetada quando um recorte real do mundo demonstrar concretamente quais estados precisam ser persistidos.

Até lá:

- nenhum `PlacedObject`;
- nenhum `WorldStructureState`;
- nenhuma tabela espacial;
- nenhuma alteração de backup por causa do mundo.

A persistência nascerá das necessidades reais do novo mundo, não dos contratos antigos.

---

## Sistemas maiores

**Estado: 🔒 FUTURO / NÃO PLANEJADO FORMALMENTE**

Poderão incluir posteriormente:

- construção;
- decoração;
- personagens;
- movimentação;
- comportamento;
- animações;
- interação personagem ↔ ambiente;
- progressão;
- diálogos;
- rotinas;
- camada opcional de IA.

Esses sistemas não pertencem à FUNDAÇÃO e não devem ser antecipados.

---

# 17. Situação consolidada

| Etapa                 | Estado          | Função principal                                                                                 |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| F0                    | ✅ Concluída    | Definir e contratar a Fundação                                                                   |
| F0-A                  | ✅ Concluída    | Requisitos e não negociáveis                                                                     |
| F0-B                  | ✅ Concluída    | Protocolo de prova                                                                               |
| F0-C                  | ✅ Concluída    | Escolha tecnológica                                                                              |
| F0-D                  | ✅ Concluída    | Contrato executável da F1                                                                        |
| F1                    | ✅ Concluída    | Three.js provado e aprovado como renderer da Fundação                                            |
| F1-A                  | ✅ Concluída    | Bootstrap do runtime                                                                             |
| F1-A-FIX              | ✅ Concluída    | Tipagem sustentável e mapa operacional                                                           |
| F1-B                  | ✅ Concluída    | Cena técnica + GLB                                                                               |
| F1-C                  | ✅ Concluída    | Interação + ponte React ↔ Three                                                                  |
| F1-D                  | ✅ Concluída    | Lifecycle + observabilidade                                                                      |
| F1-E                  | ✅ Concluída    | Gates técnicos + APK                                                                             |
| F1-F                  | ✅ Concluída    | Gate físico aprovado no Moto G06                                                                 |
| F1-F-FIX              | ✅ Concluída    | Botões React revalidados fisicamente                                                             |
| F2                    | ✅ Concluída    | Endurecimento do runtime e integração, com gates técnicos e revalidação física curta no Moto G06 |
| F3                    | ✅ Concluída    | Câmera e interação mobile                                                                        |
| F3-A                  | ✅ Concluída    | Contrato e baseline da câmera                                                                    |
| F3-B                  | ✅ Concluída    | Modelo de câmera, framing e limites                                                              |
| F3-C                  | ✅ Concluída    | Pan, wheel focal e pinch ancorado                                                                |
| F3-D                  | ✅ Concluída    | Tap, seleção e arbitragem de gestos                                                              |
| F3-E                  | ✅ Concluída    | Viewport, orientação, safe areas e integração mobile                                             |
| F3-F1                 | ✅ Técnico      | Gate consolidado e APK                                                                           |
| Fechamento F3         | ✅ Concluído    | Evidência humana ampla e correção técnica de bounds; sem revalidação física específica do fix    |
| F4                    | ✅ Concluída    | Contrato experimental de assets consolidado; sem pipeline produtivo definitivo                   |
| F5                    | ✅ Concluída    | Envelope Android físico, guardrails de remedição e gate final; sem teto/hard caps                |
| F6                    | ✅ Concluída    | Fechamento técnico/arquitetural; dívida humana assistiva aceita, sem PASS TalkBack               |
| Pipeline 3D v1        | ⏸ Adiado        | P3D-B1 documental concluída para `bookshelf`; B2–F dependem de GLB definitivo                    |
| BF-0                  | ✅ Concluída    | Replanejamento e decisão arquitetural                                                            |
| BF-1A                 | ✅ Concluída    | Contrato mínimo e primeira fábrica procedural isolada                                            |
| BF-1B                 | ✅ Concluída    | Composição declarativa e posicionamento determinístico isolados                                  |
| BF-1C                 | ✅ Técnica      | Integração estática e seleção                                                                    |
| BF-1C-FIX             | ✅ Concluída    | Correção geométrica; gate visual humano no navegador PASS                                        |
| BF-1D                 | ✅ Técnica      | Substituição procedural, descarte seletivo e gate integrado                                      |
| BF-2                  | 🟡 Em andamento | BF-2A/B/C/D concluídas; BF-2E com gate técnico aprovado e físico dirigido pendente              |
| BF-3–BF-5             | ⏳ Futuro       | Dependem da evolução autorizada da BF-2                                                          |
| Primeiro recorte      | 🔒 Futuro       | Fechamento condicionado à validação TalkBack humana                                              |
| Persistência espacial | 🔒 Futuro       | Salvar estado real do mundo                                                                      |
| Sistemas maiores      | 🔒 Futuro       | Personagens, progressão, IA etc.                                                                 |

---

# 18. Ponto de retomada

O projeto deve ser considerado neste estado:

> **F0–F4 estão concluídas. F4 consolidou autoria editável/substituível, eixos/chão/pivô normalizados antes do runtime, materiais por factors ou maps PBR relevantes, ownership/unload experimental somente em harness e medição de custo antes de otimizar. Quatro fixtures registrados e seus hashes permanecem como corpus experimental; Azrael não foi promovido; a variante Poly Haven 512 continua externa, não registrada e não final. Não houve asset/runtime de produção, decoder, budget, `AssetManager` ou pipeline definitivo. Three.js está aprovado como renderer da Fundação. F3 estabeleceu o contrato de câmera e interação runtime-only, viewport real e bounds convexos da fixture; a validação humana ampla foi positiva. A correção final dos bounds não foi revalidada especificamente no aparelho, limitação aceita como não bloqueante no fechamento.**

A FUNDAÇÃO está concluída no plano técnico/arquitetural. F6-A auditou o contrato de acessibilidade; F6-B cobriu a lacuna automatizável de foco/teclado, aprovou a regressão técnica e produziu o APK técnico; F6-C aceitou a ausência humana como dívida, sem PASS TalkBack. Antes do fechamento do primeiro recorte real e de beta/release aplicável, a validação assistiva deve usar um build então atual e representativo. F5 está concluída: F5-A preparou cenários reproduzíveis, F5-B coletou a evidência física no Moto G06 e F5-C consolidou envelope/guardrails sem confundi-los com máximos do aparelho. BF-0 prioriza conteúdo procedural/provisório, preserva P3D-B1 e adia P3D-B2–F; a cena da F1 continua uma fixture técnica, sem arquitetura produtiva de conteúdo ou persistência espacial.
