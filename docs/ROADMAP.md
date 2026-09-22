# Roadmap

> Atualizado em 2026-09-21.

## Baseline concluído

- Aplicativo convencional funcional, local-first, com Dexie v8 e backup v6 somente para dados convencionais.
- Mundo anterior, Phaser e contratos espaciais legados removidos pelo WORLD RESET.
- **F0 — Definição da Fundação concluída.**
- **F1 — Three.js Foundation Spike concluída:** Three.js aprovado como renderer da Fundação com host React próprio, `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, interação bidirecional, lifecycle explícito e prova física no Moto G06.
- A cena vigente continua técnica e descartável; P3D-A formalizou o contrato e P3D-B1 registrou a proveniência do candidato `bookshelf`, mas a Biblioteca final, fonte canônica normalizada, assets produtivos e persistência espacial ainda não existem.

## Biblioteca Funcional Primeiro

```text
BF-0 ✅ replanejamento e decisão arquitetural
BF-1 ✅ camada mínima de conteúdo procedural — encerramento técnico
  BF-1A ✅ contrato mínimo e primeira fábrica procedural
  BF-1B ✅ composição declarativa e posicionamento determinístico
  BF-1C ✅ integração estática com runtime e seleção
  BF-1C-FIX ✅ correção geométrica e variantes — gate visual humano no navegador PASS
  BF-1D ✅ substituição, descarte e gate integrado
BF-2 ⏳ primeira área de leitura integrada a registros reais
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E 🟡 gate técnico aprovado; validação física dirigida pendente
BF-3 ⏳ integração dos seis tipos de registro
BF-4 ⏳ ambiente habitável, mobília e personagens provisórios
BF-5 ⏳ consolidação do marco funcional
```

O caminho BF usa conteúdo procedural/provisório em TypeScript/Three.js e mantém React como superfície semântica das funções essenciais. A identidade lógica separa tipo de modelo, instância do mundo e ID de registro convencional associado quando houver; a representação visual poderá ser procedural agora e GLB definitivo depois, sem alterar essa identidade. Não há persistência espacial produtiva, tabela nova ou mudança de backup neste plano.

### BF-0 — Replanejamento — concluída

ADR-011 está aceita e estabeleceu a prioridade funcional, preservando P3D-B1 e adiando P3D-B2–F.

### BF-1 — Camada mínima de conteúdo procedural

#### BF-1A — Contrato mínimo e primeira fábrica — concluída

Definiu a identidade lógica mínima e implementou uma fábrica procedural isolada de `bookshelf`, com testes dirigidos de geometria, transforms, isolamento e recursos. A fábrica não está integrada ao runtime, seleção ou composição; a documentação desta decomposição foi atualizada.

#### BF-1B — Composição do conteúdo — concluída

Definiu instâncias declarativas, posicionamento determinístico e uma pequena composição de três estantes procedurais, separando definições de conteúdo da criação de objetos Three.js. A composição valida `instanceId` duplicado antes de criar recursos, mantém a root local da fábrica em identidade, aplica layout em wrapper de instância e cobre determinismo, isolamento e descarte; ela ainda não está integrada ao runtime ou à seleção.

#### BF-1C — Integração com runtime e seleção — concluída tecnicamente

Integra estaticamente a composição BF-1B somente na experiência normal, distinguida da diagnóstica pela ausência de `performanceScenario`. As três instâncias preservam `instanceId`, posição e root local; entram no catálogo de `WorldRuntime` já em `mount()` como `reading-shelf-01`–`03`, com rótulos distintos, roots selecionáveis por wrapper e destaque/picking existentes. Em sobreposição com um proxy F1, a interseção procedural recebe prioridade para que a estante continue selecionável; fora dela, a regra técnica existente permanece. Os controles React, anúncio acessível, foco, teclado e fallback continuam sendo o caminho semântico complementar ao canvas. A montagem possui a root da composição e a libera por `disposeObjectTree()` em descarte terminal ou falha; novas montagens usam recursos independentes. F5 não recebe a composição, nem tem seus counts, catálogo, payload ou resultados alterados. Foram acrescentadas somente as validações de `instanceId` vazio e coordenadas não finitas. A fixture F1 permanece visível; a oclusão projetada anterior foi tratada pela BF-1C-FIX e seu gate humano PASS; BF-1D fecha a troca de representação sem reforma de layout.

#### BF-1C-FIX — Correção geométrica e apresentação — concluída, gate visual humano aprovado

Sem reescrever a BF-1C versionada em `34015b6`, corrige a fábrica após a inspeção humana identificar linhas, massa visual pouco legível e variação aparente por enquadramento. A causa comprovada foi a coincidência da face frontal do fundo com as prateleiras e interseções internas; a inspeção de código não encontrou mudança de câmera/projeção/viewport pela rolagem. A nova família evita essas sobreposições, cria três variantes moderadas e determinísticas e desloca somente a variante larga para `[3, 0, -2.1]` após demonstrar a colisão com banco F1. A seleção, lifecycle, fallback e F5 permanecem preservados. Após `493c887`, o usuário aprovou no navegador as três estantes, as variantes e a leitura das prateleiras, sem as deformidades, linhas ou perdas de definição reportadas; este PASS não aprova TalkBack, Android físico nem arte final.

#### BF-1D — Substituição, descarte e gate — concluída tecnicamente

Implementou uma operação síncrona e estreita da composição para trocar uma instância `bookshelf` existente por outra variante procedural. `reading-shelf-02: reading-dark-tall → reading-balanced` preserva `modelTypeId`, `instanceId`, `entryId` quando houver, posição e o wrapper selecionável; a representação nova é preparada e anexada antes de a antiga ser liberada uma única vez. Pedir a variante já ativa retorna inerte; `instanceId`/variante inválidos ou falha de preparação/attach preservam a representação anterior. A montagem terminal libera somente as roots ainda possuídas. Se a estante selecionada troca, o helper anterior é descartado e o novo acompanha os bounds atualizados sem reconstruir catálogo, ID ou seleção React. F5 permanece sem composição e responde explicitamente que a operação está indisponível. Passaram testes de fábrica/composição/runtime/interação/host/fronteiras, format, lint, typecheck, 546 testes Vitest, build e 6 E2E da rota Biblioteca. Não houve API nova em `WorldRuntime`, controle React, GLB, cache, persistência espacial ou remoção pública de estantes. BF-1 está encerrada somente no plano técnico desta camada; a dívida TalkBack ainda impede declarar fechado o primeiro recorte real.

### BF-2 — Primeira área de leitura funcional

Integrará registros reais de livros ao mundo, mantendo os casos de uso existentes e a operação essencial pela interface React.

#### BF-2A — Contrato e projeção dos livros reais — concluída

Criou a projeção neutra `BookEntry → ReadingAreaBook` para ocorrências futuras `book-volume` da área de leitura. Ela preserva `entryId`, deriva `instanceId` estável como `reading-book:${entryId}`, ordena deterministicamente por `createdAt` e `id`, inclui título, autor opcional e progresso de leitura disponível, e rejeita `entryId` duplicado. A projeção permanece sem integração com `ThreeWorldRuntime`, seleção, carregamento na rota Biblioteca, persistência espacial ou outra categoria de registro.

#### BF-2B — Livro procedural e layout determinístico — concluída

Criou a representação procedural isolada `book-volume` e o contrato determinístico de slots das três estantes existentes. A fábrica exige `entryId` por um contrato mais estreito, escolhe entre quatro variantes discretas a partir da identidade estável e mantém recursos próprios por criação. BF-2D-BOOK-VIS-FIX ampliou seus volumes para 0,190–0,225 m de largura, 0,370–0,400 m de altura e 0,320–0,360 m de profundidade, para legibilidade no enquadramento normal sem ultrapassar o envelope físico das estantes. O layout puro consome a ordem recebida, preenche as estantes declaradas, depois níveis internos de baixo para cima e slots da esquerda para a direita; a capacidade inicial deriva de 24 + 25 + 21 = 70 slots e qualquer excedente é devolvido como overflow ordenado. As posições são locais ao wrapper estável da estante, não à root descartável de sua representação BF-1D. Não há attach ao runtime, livro real visível, seleção, React/aplicação, schema, backup ou persistência espacial.

#### BF-2C — Integração com runtime e seleção — concluída tecnicamente

`ReadingAreaBook` agora chega ao `ThreeWorldRuntime` por contrato neutro e snapshot imutável, sem query, `BookEntry`, application, Dexie ou React. Cada livro colocado é wrapper selecionável irmão da representação substituível da estante; o catálogo e `WorldSelection` preservam `entryId`. Slots são regenerados pelas variantes atuais e BF-1D relayouta sem recriar livros ainda visíveis; overflow não tem root ou seleção e pode retornar após aumento de capacidade. A configuração inicial deriva 70 slots (24 + 25 + 21), sem transformar esse número em capacidade universal. F5 ignora o snapshot. Não houve persistência espacial, navegação nem integração da rota; BF-2D permanece responsável por trazer registros reais.

#### BF-2D — Ponte React/aplicação e fluxo funcional — concluída tecnicamente

A Biblioteca consulta `listBookEntries` por um contrato React/aplicação estreito, projeta um snapshot imutável com `projectReadingAreaBooks()` e o entrega ao `WorldHost` na montagem. Loading, indisponibilidade e erro público não se confundem com vazio; o vazio real mantém estantes sem livros e ação convencional para criar livro. A lista React preserva todos os livros e seus links por `entryId`, inclusive overflow; o catálogo neutro do host informa quais livros estão visíveis e permite seleção React → canvas, enquanto a seleção do canvas retorna `entryId` para abrir o registro sem foco forçado. F5 continua sem query ou livros reais e agora ignora inclusive snapshot inválido. Não há sincronização live, schema, backup ou persistência espacial.

#### BF-2E — Gate integrado e fechamento da BF-2 — gate técnico aprovado

Consolidou regressão integrada com base convencional real: criação, projeção, representação, seleção bidirecional, abertura por `entryId`, edição/retorno, vazio, overflow 70 + 1, fallback e lifecycle. O APK debug funcional está pronto para o roteiro dirigido no Moto G06. Permanecem pendentes somente a validação física dirigida e a dívida humana obrigatória de TalkBack; não há PASS humano nem fechamento integral da BF-2.

### BF-3 — Integração dos seis tipos de registro

Representará os seis tipos e sincronizará suas alterações convencionais com o mundo, sem duplicar lógica de negócio.

### BF-4 — Mundo habitável

Expandirá mobília, organização espacial, objetos e personagens provisórios, com comportamentos definidos conforme necessidade funcional.

### BF-5 — Consolidação funcional

Executará regressão, validação Android, acessibilidade e fechamento do marco funcional aprovado.

O fechamento do primeiro recorte real continua bloqueado pela dívida de TalkBack: a remediação e a validação física incremental no Moto G06 usarão builds representativos então vigentes. Não há budget preventivo; mudanças materiais de densidade ou renderização exigem nova medição conforme a necessidade observada.

## Pipeline 3D v1 — adiado após P3D-B1

```text
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2 ⏸ ADIADO — fonte canônica editável normalizada
P3D-B3 ⏸ ADIADO — exportação e validação
P3D-B4 ⏸ ADIADO — promoção final
P3D-C ⏸ ADIADO — validação e relatório automatizados
P3D-D ⏸ ADIADO — preparação/exportação reproduzível
P3D-E ⏸ ADIADO — ingestão produtiva, ownership e unload
P3D-F ⏸ ADIADO — gate integrado e fechamento
```

ADR-010 continua regulando assets GLB produtivos. B1 preservou integralmente a proveniência de `bookshelf`: o upstream Quaternius é a fonte de partida, enquanto o `.blend` normalizado da F4 permanece apenas evidência histórica; o fixture F4-B não foi promovido. Os checkpoints adiados não foram concluídos nem cancelados e só retomam quando houver necessidade demonstrada de ingestão ou substituição por assets GLB definitivos.

## FUNDAÇÃO

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ✅ CONTRATO EXPERIMENTAL DE ASSETS 3D CONCLUÍDO
  F4-A ✅ CONCLUÍDA (preflight técnico + humano)
  F4-B ✅ CONCLUÍDA
  F4-C ✅ CONCLUÍDA
  F4-D ✅ CONCLUÍDA EXPERIMENTALMENTE
    D1 ✅ auditoria e contrato experimental
    D2 ✅ load → attach → unload com host vivo
    D3 ✅ repetição, isolamento e disposal
    D4 ✅ assíncrono, abandono, callbacks tardios e erros
    D5 ✅ regressão, consolidação e fechamento
  F4-E ✅ CONCLUÍDA EXPERIMENTALMENTE
    E1 ✅ baseline de custo
    E2 ✅ diagnóstico e seleção de hipótese
    E3 ✅ experimento selecionado
    E4 ✅ comparação objetiva + gate humano PASS
    E5 ✅ consolidação e fechamento
  F4-F ✅ consolidação final e handoff para F5
F5 ✅ CONCLUÍDA — performance e validação Android física
  F5-A ✅ baseline e cenário de carga
  F5-B ✅ stress físico, loading e limites
  F5-C ✅ consolidação, guardrails iniciais e gate final
F6 ✅ CONCLUÍDA — fechamento técnico/arquitetural
  F6-A ✅ contrato de acessibilidade e auditoria de lacunas
  F6-B ✅ evidência automatizada, regressão técnica e APK candidato
  F6-C ✅ fechamento documental com dívida assistiva aceita; sem PASS humano
FUNDAÇÃO ✅ CONCLUÍDA
P3D-A ✅ contrato produtivo e estrutura
P3D-B1 ✅ proveniência e organização documental de `bookshelf`
P3D-B2–F ⏸ ADIADOS
BF-0 ✅ replanejamento e decisão arquitetural
BF-1A ✅ contrato mínimo e primeira fábrica procedural isolada
BF-1B ✅ composição declarativa e posicionamento determinístico
BF-1C ✅ integração estática com runtime e seleção
BF-1C-FIX ✅ técnico + gate visual humano no navegador PASS
BF-1D ✅ substituição procedural, descarte seletivo e gate integrado
BF-1 ✅ tecnicamente concluída
BF-2A ✅ contrato e projeção neutra dos livros reais
BF-2B ✅ livro procedural e layout determinístico isolados
BF-2C ✅ integração com runtime e seleção
BF-2D ✅ ponte React/aplicação e fluxo funcional
BF-2E 🟡 gate técnico aprovado; físico dirigido pendente
PRÓXIMO: validação humana dirigida no Moto G06; sem persistência espacial ou sincronização live nesta etapa
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

### F4 — Contrato experimental de assets 3D — concluída

F4 produz evidência experimental para um pipeline 3D posterior; não o formaliza. GLTF/GLB continua o caminho de runtime da Fundação. Não há persistência espacial, catálogo real, asset manager definitivo ou pipeline artístico aprovado nesta fase.

#### F4-A — Contrato + preflight de autoria — concluída

Auditoria do caminho atual, contrato experimental e preflight da ferramenta de autoria foram concluídos. Blender 3.3.21 passou no preflight técnico (CLI, save `.blend`, export GLB 2.0 e reimport) e no gate humano no Fedora (viewport e operações básicas utilizáveis, sem falha visual ou de estabilidade relevante). Ele está aprovado somente como ferramenta experimental de autoria durante F4, continua substituível e não se torna dependência nem ferramenta definitiva do Pipeline 3D.

#### F4-B — Geometria, escala, eixos e pivô — concluída

O `GLTFLoader` instalado confirmou quatro GLBs normalizados com procedência suficiente sem correções individuais: root lógico em identidade, chão no `Y=0` e bounds `[largura, altura, profundidade]`. O mapeamento observado é Blender `X →` Three `X`, `Y → -Z` e `Z → Y`. O diagnóstico do Azrael confirmou root lógico utilizável com nove meshes, mas a ausência de evidência local suficiente de licença/proveniência impede sua promoção ao checkout. O contrato permanece experimental; frente visual/funcional, materiais/texturas, custo e pipeline definitivo não foram congelados.

#### F4-C — Materiais, UV e texturas — concluída experimentalmente

F4-C1 inventariou materiais, UVs e imagens dos quatro espécimes F4-B; F4-C2 registrou o contrato técnico mínimo experimental; F4-C3 comprovou os quatro GLBs pelo `GLTFLoader` instalado; C4 preparou um harness isolado e temporário; C5 registrou observação humana visual coerente; e C6 consolidou o contrato e removeu o harness. F4-C não estabelece especificação artística ou técnica permanente, equivalência pixel a pixel ou fidelidade científica.

#### F4-D — Loading, unload e ownership/disposal — concluída experimentalmente

D1 mapeou o fixture F1 real: a montagem terminal é seu único owner registrado, `disposeObjectTree()` deduplica recursos dentro de uma árvore e não existe unload mantendo host vivo. O contrato experimental exige um owner único depois do attach, cancelamento lógico de intenção durante loading, descarte do resultado tardio, unload idempotente que remove/libera somente o root alvo e falha individual separada da falha do host. Não escolhe API, `AssetManager`, cache, abort físico ou gerenciamento global.

D2 comprovou em harness isolado o ciclo KayKit real `GLTFLoader` → owner local → `THREE.Scene` → `disposeObjectTree()`: geometry, material e texture emitiram disposal, o sentinel e a mesma instância de host permaneceram, e novo parse/attach funcionou. O owner existe somente no teste; não há API, manager, cache ou mudança de `ThreeWorldRuntime`.

D3 comprovou unload repetido inerte, três ciclos KayKit sem acúmulo, owners independentes para Poly Haven e Kenney no mesmo host e unload seletivo de A sem disposal de B. A `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único `dispose`; `referenceScene.test.ts` mantém a cobertura complementar da deduplicação geral intrárvore. Não há política de sharing entre assets, referência contada, cache, manager ou API de produção.

D4 comprovou com roots Quaternius reais e callbacks controlados somente no teste que abandono lógico, sucesso adicional, erro tardio e encerramento do owner rejeitam resultados stale sem anexá-los; cada resultado rejeitado é liberado uma vez. Erro individual deixa o host utilizável para nova tentativa. Não há abort físico, cancelamento de rede, cache, manager ou API de produção.

D5 reuniu F4-B/C/D em gate dirigido de 4 arquivos/20 testes e confirmou a suíte unitária integral com 67 arquivos/510 testes, sem retries ou falhas. F4-D está concluída experimentalmente: o owner e o double permanecem somente no harness, `ThreeWorldRuntime` não recebeu unload dinâmico e não há API, manager, cache ou abort físico.

#### F4-E — Custo e compressão experimental — concluída experimentalmente

E1–E5 concluíram baseline, diagnóstico, variante, comparação e consolidação sem alterar o fixture registrado. Poly Haven concentrou o custo do corpus em três imagens 1024×1024; a variante 512 reduziu o GLB de 5.828.612 para 711.352 bytes (-87,796%), as imagens codificadas em -88,013% e a estimativa RGBA8 base de 12 para 3 MiB, preservando geometry/índices/UV/transforms/material e o `GLTFLoader` atual. O gate humano foi PASS, com leve desfoque em comparação próxima considerado irrelevante para objetos menores e mais distantes na composição ortográfica/2.5D. É evidência deste asset/experimento, não budget global, asset final ou Pipeline 3D definitivo. KTX2/Basis, Draco, Meshopt e quantização não foram adotados.

#### F4-F — Regressão, consolidação e handoff F5 — concluída

Consolidou A–E em contrato experimental: autoria editável e substituível, normalização no asset antes do runtime, materiais PBR relevantes, lifecycle/ownership apenas em harness e custo medido antes de otimizar. Confirmou os quatro fixtures registrados, manteve os testes de contrato, excluiu o laboratório externo da dependência de F5 e não criou `AssetManager`, budget, codec, pipeline produtivo, conteúdo ou persistência espacial.

### F5 — Performance e Android físico — concluída

F5-A preparou o build de diagnóstico para o Moto G06: baseline F1, corpus F4 uma vez e corpus F4 ×4, todos pelo `ThreeWorldRuntime`/`WebGLRenderer` reais. F5-B mediu os três cenários no aparelho, inclusive loading, repouso, memória, remount, interação, orientação, background/resume e sessão de aproximadamente 15 minutos no corpus ×4. F5-C consolidou isso como envelope observado e gatilhos de remedição, não como hard caps: o teto do aparelho não foi encontrado e nenhuma otimização avançada foi justificada.

F6 foi concluída tecnicamente/arquiteturalmente sem criar mundo ou persistência espacial. P3D-A posterior formalizou o contrato produtivo do Pipeline 3D v1; P3D-B1 preservou documentalmente o candidato `bookshelf`, sem criar fonte canônica normalizada, GLB, ingestão produtiva ou implementação de mundo. BF-0 adiou P3D-B2–F e priorizou a trilha funcional com conteúdo procedural/provisório. A dívida de validação humana assistiva permanece obrigatória antes do fechamento do primeiro recorte real e de beta/release dependente da experiência acessível; ela deve usar o build então vigente, não necessariamente o APK F6-B.

### F6 — Acessibilidade e fechamento da FUNDAÇÃO — concluída tecnicamente

F6-A concluiu a auditoria do contrato entre a superfície 3D e React semântico. F6-B confirmou a única lacuna automatizável — foco/teclado e marcos semânticos estruturais — sem alteração de produção; a regressão técnica, E2E e build Android aprovaram o APK candidato. F6-C aceitou documentalmente a indisponibilidade temporária do Moto G06 como dívida assistiva, sem declarar TalkBack ou acessibilidade humana Android aprovados. A FUNDAÇÃO está concluída no plano técnico/arquitetural. P3D-A continua regulando GLBs, P3D-B1 preserva a proveniência de `bookshelf` e P3D-B2–F estão adiados; BF-1A/B concluíram fábrica e composição, BF-1C a integrou estaticamente ao runtime normal, BF-1C-FIX recebeu PASS visual humano no navegador e BF-1D concluiu a troca procedural e seu gate integrado.

F1 aprovou a viabilidade da base Three.js; não concluiu câmera, interação, assets, performance ou acessibilidade finais.

## Depois da FUNDAÇÃO

1. Antes do fechamento do primeiro recorte real e de beta/release aplicável, validar TalkBack no Moto G06; essa dívida humana continua pendente e não reabre o encerramento técnico da BF-1.
2. BF-2–BF-5 só avançam com autorização explícita: integrar progressivamente leitura, os seis tipos de registro e o ambiente provisório, preservando a operação essencial em React.
3. Retomar P3D-B2–F somente se a ingestão ou substituição por GLB definitivo se tornar necessária.
4. Projetar persistência espacial nova somente quando uma necessidade funcional demonstrar o que deve ser salvo.
