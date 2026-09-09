# Biblioteca Viva — Mapa da FUNDAÇÃO e detalhamento da F1

**Data de referência:** 2026-09-09

**Estado geral:** F0 concluída; F1 e todos os seus checkpoints concluídos; Three.js aprovado como renderer da Fundação; F2 é a próxima fase

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

A F1 aprovou a viabilidade da base Three.js. A FUNDAÇÃO inteira termina somente depois de F2–F6; câmera, interação, assets, performance e acessibilidade ainda possuem trabalho futuro.

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
F2 — Integração e endurecimento do runtime           ▶ PRÓXIMA
 │
 ▼
F3 — Câmera e interação mobile                       ⏳ PLANEJADA
 │
 ▼
F4 — Contrato experimental de assets 3D              ⏳ PLANEJADA
 │
 ▼
F5 — Performance e Android físico                    ⏳ PLANEJADA
 │
 ▼
F6 — Acessibilidade + fechamento arquitetural        ⏳ PLANEJADA
 │
 ▼
FUNDAÇÃO CONCLUÍDA
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
**Estado: ▶ PRÓXIMA**

A F2 é o próximo trabalho depois da conclusão da F1.

Seu objetivo será transformar o spike em uma fundação mais confiável.

Escopo previsto:

- fronteiras definitivas entre React e runtime;
- organização interna;
- ownership de recursos;
- lifecycle endurecido;
- erros;
- recuperação;
- resize/orientation;
- input;
- testabilidade;
- contratos estáveis da fundação.

A subdivisão exata poderá ser ajustada conforme os problemas reais encontrados na F1.

---

# 12. F3 — Câmera e interação mobile
**Estado: ⏳ PLANEJADA**

A F1 provou que pan, zoom, pinch e seleção funcionam.

A F3 deverá transformar isso em comportamento utilizável pelo produto.

Escopo previsto:

- comportamento final da câmera ortográfica;
- enquadramento;
- pan;
- zoom;
- pinch;
- limites;
- ergonomia;
- relação entre toque, seleção e movimentação;
- leitura em telas pequenas;
- safe areas;
- experiência mobile previsível.

---

# 13. F4 — Contrato experimental de assets 3D
**Estado: ⏳ PLANEJADA**

Esta será a primeira fase em que começaremos a trabalhar seriamente com objetos 3D.

O objetivo não será ainda produzir todo o catálogo da Biblioteca, mas aprender e formalizar como um asset precisa ser preparado para o runtime.

Escopo previsto:

- busca ou criação de assets de teste;
- origem;
- autoria;
- licença;
- fonte editável;
- Blender ou ferramenta equivalente;
- escala;
- pivô;
- eixos;
- orientação;
- materiais;
- texturas;
- normalização;
- exportação;
- GLTF/GLB;
- compressão;
- loading;
- unload;
- custo de GPU;
- validação no runtime.

O processo será conduzido de forma didática, assumindo **zero conhecimento prévio de Blender ou modelagem 3D**.

A F4 não é ainda o pipeline 3D definitivo.

---

# 14. F5 — Performance e Android físico
**Estado: ⏳ PLANEJADA**

F1 produziu o primeiro baseline.

F5 deverá transformar essa evidência inicial em um baseline mais confiável para o mundo.

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

---

# 15. F6 — Acessibilidade e fechamento arquitetural
**Estado: ⏳ PLANEJADA**

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

Escopo previsto:

- semântica React associada ao mundo;
- alternativas a gestos precisos;
- foco;
- estados textuais;
- tecnologias assistivas;
- limites finais React ↔ runtime;
- consolidação arquitetural integral da FUNDAÇÃO;
- atualização das autoridades documentais;
- gate humano de acessibilidade, incluindo TalkBack.

Somente depois dessa etapa a **FUNDAÇÃO inteira** poderá ser declarada concluída. A ADR-009 já aprova especificamente Three.js como renderer da Fundação com base na F1.

---

# 16. Depois da FUNDAÇÃO

As fases posteriores ainda não possuem planejamento formal completo.

A sequência geral já estabelecida é:

```text
FUNDAÇÃO
   ↓
PIPELINE 3D
   ↓
PRIMEIRO RECORTE DO MUNDO
   ↓
PERSISTÊNCIA ESPACIAL
   ↓
SISTEMAS MAIORES
```

---

## Pipeline 3D
**Estado: 🔒 FUTURO / NÃO INICIADO**

Transformará as provas da F4 em um processo oficial e repetível:

```text
buscar / criar asset
        ↓
verificar origem e licença
        ↓
fonte editável
        ↓
manipulação / correção
        ↓
normalização
        ↓
otimização
        ↓
exportação GLB
        ↓
validação
        ↓
registro
        ↓
runtime
```

Será o momento de começar a produzir e preparar assets de maneira sistemática.

---

## Primeiro recorte do mundo
**Estado: 🔒 FUTURO / NÃO PLANEJADO EM DETALHE**

Será a primeira fase que realmente começará a construir a Biblioteca como ambiente do produto.

Ela utilizará:

- fundação técnica aprovada;
- pipeline de assets já comprovado;
- câmera e interação endurecidas;
- limites de performance conhecidos.

O conteúdo exato desse primeiro recorte ainda deverá ser planejado.

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

| Etapa | Estado | Função principal |
|---|---|---|
| F0 | ✅ Concluída | Definir e contratar a Fundação |
| F0-A | ✅ Concluída | Requisitos e não negociáveis |
| F0-B | ✅ Concluída | Protocolo de prova |
| F0-C | ✅ Concluída | Escolha tecnológica |
| F0-D | ✅ Concluída | Contrato executável da F1 |
| F1 | ✅ Concluída | Three.js provado e aprovado como renderer da Fundação |
| F1-A | ✅ Concluída | Bootstrap do runtime |
| F1-A-FIX | ✅ Concluída | Tipagem sustentável e mapa operacional |
| F1-B | ✅ Concluída | Cena técnica + GLB |
| F1-C | ✅ Concluída | Interação + ponte React ↔ Three |
| F1-D | ✅ Concluída | Lifecycle + observabilidade |
| F1-E | ✅ Concluída | Gates técnicos + APK |
| F1-F | ✅ Concluída | Gate físico aprovado no Moto G06 |
| F1-F-FIX | ✅ Concluída | Botões React revalidados fisicamente |
| F2 | ▶ Próxima | Endurecer runtime e integração |
| F3 | ⏳ Planejada | Câmera e interação mobile |
| F4 | ⏳ Planejada | Contrato experimental de assets 3D |
| F5 | ⏳ Planejada | Baseline de performance Android |
| F6 | ⏳ Planejada | Acessibilidade e fechamento |
| Pipeline 3D | 🔒 Futuro | Produção sistemática de assets |
| Primeiro recorte | 🔒 Futuro | Construção inicial da Biblioteca real |
| Persistência espacial | 🔒 Futuro | Salvar estado real do mundo |
| Sistemas maiores | 🔒 Futuro | Personagens, progressão, IA etc. |

---

# 18. Ponto de retomada

O projeto deve ser considerado neste estado:

> **F0 concluída. F1 e todos os seus checkpoints concluídos. Three.js aprovado como renderer da Fundação. Próxima ação: F2 — integração e endurecimento da Fundação Three.js.**

A FUNDAÇÃO inteira ainda não está concluída: F2–F6 permanecem futuras. A cena da F1 continua uma fixture técnica, sem pipeline formal ou persistência espacial.
