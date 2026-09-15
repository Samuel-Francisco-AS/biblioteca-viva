# Changelog

Mudanças observáveis da Biblioteca Viva seguem a estrutura do Keep a Changelog. O registro bruto anterior à reorganização documental, incluindo checkpoints intermediários, está preservado em `docs/history/legacy/CHANGELOG_LEGACY.md`.

## [Não lançado]

### F4-E-CLOSE — Custo e compressão experimental concluídos — 2026-09-15

- consolidada a evidência E1–E4: o baseline dos quatro fixtures identificou Poly Haven como outlier de textura, e a variante laboratorial 512 reduziu seu GLB de 5.828.612 para 711.352 bytes (-87,796%) e a estimativa RGBA8 base de 12 para 3 MiB (-75%);
- preservadas geometry, índices, UV, transforms, hierarchy, material e metallic/roughness compartilhado, com `GLTFLoader` real de `three@0.185.1`; o gate humano foi PASS com leve desfoque em comparação próxima, considerado aceitável e não bloqueante para o uso ortográfico/2.5D;
- nenhum fixture registrado, runtime, dependência, decoder ou extensão foi alterado. Não foram adotados budget 512×512, KTX2/Basis, Draco, Meshopt, quantização ou Pipeline 3D definitivo; F4-F passa a ser o próximo checkpoint.

### F4-E3/E4 — Variante de textura e comparação objetiva concluídas experimentalmente — 2026-09-14

- criada somente no laboratório a variante Poly Haven 512: GLB 5.828.612 → 711.352 bytes (-87,796%), imagens codificadas -88,013% e estimativa RGBA8 base 12 → 3 MiB (-75%);
- comprovadas geometry, índices, UV, transforms, hierarchy, material e metallic/roughness compartilhado inalterados, com parse real do `GLTFLoader` de `three@0.185.1` e sem extensão, decoder, dependência ou mudança de runtime;
- gate humano A/B aprovou a variante para o uso ortográfico/2.5D pretendido: houve leve desfoque em comparação próxima, considerado não bloqueante; identidade visual, material e leitura geral foram preservados;
- removidos o harness, teste e cópia Vite temporários após o gate. Nenhum fixture registrado, produção ou `ASSET_REGISTRY.md` foi alterado; 512×512 não é budget, asset final ou Pipeline 3D definitivo.

### F4-E1/E2 — Baseline de custo, diagnóstico e hipótese experimental — 2026-09-14

- medidos diretamente os quatro GLBs F4-B, com SHA-256 confirmado contra o registry: o corpus soma 5.901.424 bytes e Poly Haven concentra 98,766%, dos quais 5.814.197 bytes são suas três imagens 1024×1024; a geometria inteira do corpus soma 66.240 bytes lógicos;
- separado payload de estrutura/estimativa: as imagens de Poly Haven somam estimativa RGBA8 base de 12 MiB, que não é medição de GPU, heap, RAM, Android ou performance física;
- selecionada somente a hipótese de variante offline de resolução das texturas Poly Haven para F4-E3/E4, mantendo material/UV e comparação objetiva com o original. KTX2/Basis, Draco, Meshopt, budgets ou pipeline final não foram adotados;
- não houve alteração de asset, runtime, produção, dependência, arquitetura ou benchmark físico.

### F4-D-CLOSE — Loading, unload e ownership/disposal concluídos experimentalmente — 2026-09-14

- consolidada a evidência experimental de ownership único, transferência única, unload seletivo/idempotente com host vivo, disposal real, repetição, isolamento A/B e deduplicação intrárvore;
- confirmados cancelamento lógico, descarte/liberação de callbacks stale, falha individual recuperável e owner terminal; o gate F4-B/C/D aprovou 4 arquivos/20 testes e a suíte unitária integral aprovou 67 arquivos/510 testes, sem retries ou falhas;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados `AssetManager`, registry, cache, abort físico ou arquitetura definitiva; F4-E — Custo e compressão experimental — passa a ser o próximo checkpoint.

### F4-D4 — assíncrono em voo, abandono, callbacks tardios e erros — 2026-09-13

- estendida a prova isolada com roots Quaternius F4-B reais, SHA-256 registrado, `GLTFLoader` de `three@0.185.1` e `disposeObjectTree()` reais; um double exclusivo do teste controlou somente a ordem de callbacks;
- comprovados abandono lógico, transferência única, descarte/liberação única de sucessos tardios ou adicionais, erro individual recuperável, erro tardio inerte e owner encerrado com operação em voo, preservando host e sentinel;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados abort físico, cancelamento de rede, API permanente, `AssetManager`, cache ou registry; F4-D5 passa a ser o próximo checkpoint para regressão, consolidação e fechamento da F4-D.

### F4-D3 — repetição, isolamento e disposal — 2026-09-13

- estendida a prova isolada com `GLTFLoader` de `three@0.185.1`, `THREE.Scene` e `disposeObjectTree()` reais: unload repetido de KayKit ficou inerte depois de uma única liberação, e três ciclos com roots e recursos distintos não acumularam ownership ou children de asset;
- comprovados owners experimentais locais independentes para Poly Haven e Kenney no mesmo host: descarregar Poly Haven libera somente seus recursos e preserva Kenney até seu unload próprio; a `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único evento `dispose`;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados API permanente, `AssetManager`, cache, sharing interasset ou referência contada; F4-D4 passa a ser o próximo checkpoint para assíncrono em voo, abandono, callbacks tardios e erros.

### F4-D2 — Load, attach e unload mantendo o host vivo — 2026-09-13

- adicionada prova isolada com KayKit F4-B real, SHA-256 registrado, `GLTFLoader` de `three@0.185.1`, `THREE.Scene` e `disposeObjectTree()` reais;
- comprovados owner experimental local, attach da root, unload com disposal observado de geometry/material/texture, sentinel preservado e novo load/attach no mesmo host;
- não foram alterados `ThreeWorldRuntime`, produção ou assets, nem criados API permanente, `AssetManager`, cache, renderer ou política de concorrência; F4-D3 passa a ser o próximo checkpoint.

### F4-D1 — Auditoria e contrato experimental de loading/unload/ownership — 2026-09-13

- auditado o caminho real do fixture F1: `GLTFLoader` entrega o root ao runtime, a montagem é seu único owner registrado até o disposal terminal e não existe unload de asset com host vivo, token de intenção ou abort de load;
- registrado o comportamento de callbacks tardios, pausa, falha terminal e `webglcontextlost`, além dos limites comprovados de `disposeObjectTree()` para meshes, geometry/material/texture deduplicados por árvore;
- definido somente o contrato experimental mínimo de host, root, owner, loading, unload idempotente, descarte de sucesso tardio e falha individual recuperável, sem introduzir API, `AssetManager`, cache, registry, streaming ou mudança de produção;
- decompostas as provas isoladas D2–D4; D2 passa a ser o próximo checkpoint para load → attach → unload mantendo o host vivo. Nenhum código ou asset foi alterado.

### F4-C-CLOSE — Materiais, UV e texturas concluídos experimentalmente — 2026-09-13

- consolidado o contrato experimental de materiais por fatores ou texturas, UV somente quando necessário, Base Color por fator/textura, normal map e metallic-roughness compartilhado permitido pelo glTF, sem patches por asset no runtime;
- a prova estrutural com os quatro GLBs F4-B, SHA-256 registrado e `GLTFLoader` de `three@0.185.1` confirmou KayKit texturizado, Kenney por fatores, Poly Haven com Base Color/normal/metallic-roughness combinado e Quaternius por fatores sem UV ou imagem;
- gate humano visual registrou Poly Haven e KayKit coerentes, Kenney sem artefato e Quaternius claro/cinza coerente com seu material por fatores, não como textura perdida; não houve comparação pixel a pixel, colorimetria ou benchmark;
- removido o harness visual temporário após cumprir o gate, sem alteração de produção, `ThreeWorldRuntime`, fixtures, fontes, materiais, UVs, imagens, loading/unload ou otimização; F4-D passa a ser o próximo checkpoint.

### F4-C3 — Prova automatizada de materiais, UV e texturas — 2026-09-13

- adicionado gate Vitest estrutural para os quatro GLBs F4-B, com SHA-256 registrado e `GLTFLoader` de `three@0.185.1`, sem alterar assets, runtime ou materiais após o parse;
- comprovados Base Color texturizado + UV no KayKit, material por fatores sem maps no Kenney, maps PBR e texture metallic-roughness compartilhada no Poly Haven e ausência legítima de maps/UV no Quaternius;
- registrado que o adaptador jsdom permite somente observar o parse e os maps estruturais: não declara fidelidade visual, equivalência de pixels, orientação visual, colorimetria, qualidade de conversão, custo, performance, loading/unload ou Android;
- F4-C permanece em andamento; F4-C4 é o próximo checkpoint.

### F4-C2 — Contrato técnico mínimo experimental de materiais, UV e texturas — 2026-09-13

- registrado o contrato experimental que exige preservar somente o significado material efetivamente usado — fatores, texturas, maps e UV necessário — entre fonte editável conhecida, GLB e `GLTFLoader`, sem correções por asset no runtime;
- formalizadas equivalências estruturais legítimas: metallic e roughness podem chegar combinados, formatos de imagem podem mudar, materiais por fatores não exigem textura/UV e imagens não utilizadas não exigem exportação;
- separada a prova estrutural automatizável da fidelidade visual, que não é demonstrada pelo adaptador jsdom nem foi declarada concluída; F4-C permanece em andamento e F4-C3 passa a ser a próxima etapa;
- não foram alterados fixtures, materiais, UVs, imagens, `ThreeWorldRuntime`, loading/unload, custo, compressão ou arquitetura de assets.

### F4-B-RUNTIME-AXIS-GATE — Geometria, escala, eixos e pivô concluídos — 2026-09-13

- comprovado com o `GLTFLoader` de `three@0.185.1` instalado que quatro GLBs normalizados e registrados chegam ao Three sem scale, rotação ou offset corretivos individuais: root em identidade, chão no plano `Y=0` e dimensões `[largura, altura, profundidade]`;
- registrado o mapeamento experimental observado Blender `X →` Three `X`, Blender `Y →` Three `-Z` e Blender `Z →` Three `Y`; uma frente visual/funcional não foi congelada;
- adicionadas quatro fixtures F4-B com hash, fonte, autoria, licença CC0, transformações e estado não-final registrados; materiais/texturas continuam pendentes para F4-C e custo/vertex splitting para F4-E;
- o diagnóstico Azrael confirmou nove meshes sob `F4_Azrael_Estanteria9`, mas o GLB não foi promovido ao checkout porque a evidência local disponível não comprova licença/proveniência suficiente;
- não foram alterados `ThreeWorldRuntime`, a cena técnica, câmera/interação, schema, persistência espacial, loading/unload, otimização ou compressão; F4-C passa a ser o próximo checkpoint autorizado.

### F4-A-CLOSE — Contrato e preflight de autoria concluídos — 2026-09-09

- concluída a F4-A: Blender 3.3.21 passou no preflight técnico por CLI, com save `.blend`, export GLB 2.0, validação estrutural e reimport do arquivo descartável;
- registrada a validação humana no Fedora: viewport, seleção, órbita, transformações, Object/Edit Mode, edição geométrica, save e export GLB foram utilizáveis, sem crash, travamento, tela preta, flickering, corrupção visual ou lentidão persistente relevante após alguns minutos de manipulação;
- Blender 3.3.21 está aprovado somente como ferramenta experimental de autoria durante F4; permanece substituível, não entra como dependência e não define o Pipeline 3D permanente;
- nenhum código, asset do projeto, arquivo humano de preflight ou infraestrutura de pipeline foi adicionado; F4-B passa a ser o próximo checkpoint autorizado.

### F4-A1/A2 — Auditoria e contrato experimental de assets 3D — 2026-09-09

- iniciada formalmente a F4: a auditoria registrou o caminho atual do fixture GLTF/GLB, seu ownership pela montagem Three e o disposal deduplicado, sem promover o fixture F1 a asset oficial ou criar código novo;
- criado o contrato experimental de assets e decomposta a F4 em A–F; F4-A permanece em andamento até o preflight de autoria A3;
- mantida a ferramenta de autoria substituível: Blender 3.3 é somente candidato atual e não foi aprovado, executado ou transformado em dependência;
- mantidos o Pipeline 3D permanente, persistência espacial, unload final e avaliação de compressão para trabalho posterior baseado em evidência.

### F3-CLOSE — Câmera e interação mobile concluída — 2026-09-09

- encerrada a F3 com contrato runtime-only de câmera/framing/bounds, pan no plano X/Z, wheel e pinch focais, tap monotônico, viewport real por `ResizeObserver` e preservação de exploração/seleção em orientação;
- consolidado o gate F3-F1: 64 arquivos/487 testes Vitest, 13 cenários E2E Chromium, format, lint, typecheck, áudio, build, relatório de performance, sync e debug build Android, com warnings conhecidos não bloqueantes;
- registrada validação humana ampla positiva no Moto G06 para abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom, rotação e background/resume, sem crash, travamento ou regressão funcional perceptível e com FPS aproximadamente em 60 ou próximo durante interação/rotação; não é benchmark do mundo final;
- registrada a correção matemática final dos bounds: região convexa de centros de câmera preserva patch mínimo projetado do piso técnico em vez de combinar os cantos vazios do AABB; ela passou 3 arquivos/61 testes dirigidos e novo build Android, sem alterar `CameraNavigation`, gestos, lifecycle ou renderer;
- o APK posterior ao fix dos bounds não recebeu revalidação física específica no Moto G06. Essa ausência foi aceita como não bloqueante para encerrar F3 e não constitui evidência física inexistente; F4 passa a ser a próxima fase autorizada.

### F3-F2-FIX — Limites diagonais da fixture — 2026-09-09

- corrigido o clamp que aceitava a combinação diagonal dos extremos do retângulo envolvente da projeção e podia deixar apenas o fundo da cena nos limites superiores;
- a região de navegação agora é convexa e garante na viewport um patch de área mínima pertencente à projeção real do piso técnico: 15% de cada span projetado, limitado somente pelo viewport disponível;
- adicionada regressão matemática para os quatro cantos, portrait, landscape e zoom `0.7`, `1` e `2.2`, sem alterar `CameraNavigation` como autoridade, os gestos, o renderer, lifecycle, seleção ou persistência;
- gerado novo APK debug em `android/app/build/outputs/apk/debug/app-debug.apk` (7.525.817 bytes), sem alteração Android nativa ou dependência nova;
- F3-F1 permanece concluída tecnicamente; F3 permanece aberta e aguarda somente revalidação física curta dos limites corrigidos no Moto G06.

### F3-F1 — Gate técnico consolidado + APK — 2026-09-09

- concluídos formatação, análise estática, 487 testes Vitest, áudio, build web, relatório de bundle, 13 cenários E2E Chromium, sync Capacitor e Gradle debug;
- confirmado o APK debug em `android/app/build/outputs/apk/debug/app-debug.apk`, com 7.525.817 bytes, sem alteração Android nativa ou dependência nova;
- corrigida uma tipagem objetiva no novo cenário E2E de orientação; não houve alteração de contrato de câmera, interação, lifecycle, renderer ou persistência;
- preservados os warnings conhecidos de chunks Vite acima de 500 kB, `NO_COLOR`/`FORCE_COLOR` e `flatDir`;
- F3 permanece aberta: instalação e validação física de orientação, safe areas, toque/pinch, ergonomia, background/resume e extremos no Moto G06 são F3-F2.

### F3-E — Viewport, orientação, safe areas e integração mobile — 2026-09-09

- consolidada a autoridade do viewport na caixa real observada do `world-host`: Three não calcula header, dock, safe areas ou breakpoints, e o CSS reutiliza o contrato global de `env(safe-area-inset-*)` e a reserva existente do dock fixo;
- a superfície da Biblioteca passou a conter largura e reduzir padding em tela estreita, com caixa responsiva baseada em proporção e limite vertical existente do app, sem overflow horizontal e sem duplicar safe areas;
- resize/orientação válido preserva a mesma montagem, canvas, seleção e estado lógico de câmera salvo clamp matematicamente necessário; viewport inválido continua aguardando dimensão válida, e mudança geométrica encerra apenas o gesto em curso para impedir picking com coordenadas antigas;
- adicionadas coberturas determinística e Chromium dirigida para gesto interrompido, picking após resize, portrait → landscape → portrait e 320×640. Não houve alteração Android nativa nem validação física de safe areas, system bars, orientação, toque/pinch, ergonomia ou FPS Android.

### F3-D — Tap, seleção e arbitragem de gestos — 2026-09-09

- consolidada uma candidatura de tap explícita, monotônica e vinculada ao `pointerId` inicial: somente `pointerup` elegível executa o `Raycaster` e pode alterar a seleção;
- preservado o threshold centralizado de `8` CSS px, inclusive na borda; ultrapassá-lo consome o slop antes de pan e continua inelegível mesmo que o pointer retorne à origem;
- pinch, segundo/terceiro pointer, wheel concorrente, cancelamento, perda de capture, pausa, disposal e terminalidade não geram seleção tardia; pinch → pan permanece limpo;
- formalizado que tap válido em espaço vazio limpa a seleção, sem alterar a ponte React ↔ Three, os botões `Anterior`/`Próximo`, highlight, câmera, bounds ou persistência;
- ampliada a cobertura focada de intenção de gesto e executado E2E Chromium dirigido à Biblioteca, sem teste físico, Android ou recalibragem ergonômica.

### F3-C — Pan, zoom e pinch — 2026-09-09

- pan passou a derivar posições sucessivas do canvas no plano navegável X/Z, mantendo escala coerente com viewport, aspect ratio e zoom sem alterar o target Y;
- wheel agora normaliza unidades de `deltaMode` antes da curva exponencial e aplica zoom focal, mantendo o ponto sob o cursor quando os bounds técnicos permitem;
- pinch passou a usar a razão entre distâncias sucessivas e a mapear o midpoint anterior para o atual, compondo pan+zoom sem depender da frequência dos eventos;
- todos os gestos continuam passando por `CameraNavigation` e pelo clamp F3-B; seleção, picking pelo bounding rect atual, pinch → pan, cancelamento, pausa e terminalidade foram preservados;
- ampliada a cobertura determinística para pan, âncoras, clamps, wheel normalizado, midpoint e pan+zoom, sem validar ergonomia física ou alterar a arbitragem final tap/gesto.

### F3-B — Modelo de câmera, framing e limites — 2026-09-09

- centralizado estado efêmero de foco X/Z e zoom em `CameraNavigation`, que passa a ser a única fonte para a `OrthographicCamera`; eventos continuam sob ownership de `ThreeWorldInteraction`;
- framing passou a derivar bounds explícitos da fixture técnica e padding de 15%, com frustum e bounds de navegação dependentes de viewport e zoom; GLB tardio não reposiciona a câmera;
- removida a deriva vertical incidental do pan: target Y é fixo, enquanto resize/orientação preservam estado lógico e seleção quando válidos;
- ampliada a cobertura focada para framing, bounds, zoom, viewport inválido, orientação e fixture tardio, sem recalibrar curva de wheel, ganho de pinch ou ergonomia final.

### F3-A — Contrato e baseline da câmera — 2026-09-09

- formalizada a autoridade da câmera efêmera: `ThreeWorldRuntime` possui a instância/lifecycle e `ThreeWorldInteraction` possui a navegação por gesto, sem estado React, Dexie ou persistência espacial;
- extraído o cálculo puro do frustum ortográfico da fixture F1, que rejeita viewport zero, negativo, não finito ou com derivação não representável em vez de fabricar estado de câmera;
- adicionada cobertura focada para frustum e baseline inicial, preservando a calibração, o comportamento observável e os contratos de lifecycle/input da F2;

### F2-F — Regressão consolidada e fechamento técnico e físico — 2026-09-09

- concluída tecnicamente a F2 — Integração e endurecimento da Fundação Three.js, sem nova funcionalidade espacial ou alteração de câmera, zoom, pan, pinch, framing, limites, safe areas ou UX mobile;
- confirmados os contratos de fronteira React/runtime, ownership de montagem, falha terminal, context loss, callbacks tardios, viewport transitório e cleanup de input pela regressão completa;
- aprovados os gates de formatação, análise estática, 459 testes Vitest, áudio, build, relatório de bundle, 12 cenários E2E Chromium, sync Capacitor e Gradle debug;
- concluída a revalidação humana física curta no Moto G06: background/resume, alinhamento React/canvas, seleção/highlight, pan, pinch, seleção por toque, controles React e rotação/orientação permaneceram funcionais, sem crash, travamento, degradação sustentada, perda de interação ou dessincronização React ↔ Three;
- registradas como observações não bloqueantes quedas transitórias para aproximadamente 37–45 FPS em orientação e 45–48 FPS na sequência extrema zoom-out/zoom-in, ambas com recuperação e estabilização em aproximadamente 60 FPS; não são benchmark formal, regressão comprovada ou causalidade atribuída à F2.

### F2-E — Viewport e input resistentes a interrupções — 2026-09-09

- resize passou a aguardar dimensões transitórias inválidas sem frustum artificial, frame, recriação ou falha terminal; retorno a uma dimensão válida atualiza a mesma montagem por `ResizeObserver`, preservando renderer, câmera, seleção e um único RAF;
- picking passou a usar a bounding box atual do canvas; mudança de proporção e resize não deixam coordenadas permanentemente obsoletas;
- Pointer Events agora saneiam `pointercancel`/perda de capture e a transição pinch → um pointer como pan limpo, sem seleção acidental ou gesto órfão após pausa, falha ou disposal;
- cobertura unitária e Chromium dirigida validaram viewport, gesture cleanup, desktop/mobile sintético e ciclos de rota, sem definir ergonomia final de câmera ou interação.

### F2-D2 — Context loss terminal e assíncrono em voo — 2026-09-09

- `webglcontextlost` passou a ser falha terminal da instância Three: previne o default, cancela RAF/gestos, libera a montagem e entrega uma única falha segura `unavailable` ao fallback React;
- listeners de context loss/restoration pertencem ao canvas da montagem e são removidos no cleanup; `webglcontextrestored` tardio não reconstrói nem retoma a instância descartada;
- GLB que conclui após `failed` ou `disposed` é descartado com seus recursos, sem renderização ou reativação; falha normal de carregamento do fixture continua recuperável.

### F2-D1 — Falhas terminais de execução do runtime — 2026-09-09

- exceções estruturais de `renderer.render()` e `setSize()` passaram a encerrar a instância Three de uso único, cancelar RAF/gestos, liberar a montagem e emitir uma única falha segura ao fallback React;
- renderizações fora do RAF seguem a mesma transição; chamadas posteriores de lifecycle, resize e seleção não revivem a instância;
- pausa passou a impedir frames incidentais de resize e conclusão do fixture, preservando retomada normal; falha de carregamento do GLB continua recuperável;

### F1-CLOSE — Fundação Three.js aprovada — 2026-09-09

- concluída a F1 com a fundação Three.js integrada por host React próprio, cena técnica 3D, fixture GLB, interação bidirecional, lifecycle explícito e diagnóstico local;
- registrado o gate físico aprovado no Moto G06, incluindo aproximadamente 60 FPS estabilizados na cena mínima, pan, pinch, picking, dez ciclos, background/resume e recuperação limpa após process death;
- promovido Three.js a renderer aprovado da Fundação pela ADR-009, sem aprovar a Biblioteca final, pipeline 3D, persistência espacial, TalkBack ou performance de cenas complexas;
- encerrado e arquivado o contrato temporário F0-D; F2 passa a ser a próxima fase.

### F1-F-FIX — Alternativa React no Android — 2026-09-09

- registrada a evidência humana inicial positiva da F1-F e o comportamento físico incompatível do `<select>` no Moto G06, que abria uma superfície branca vazia;
- removidos o dropdown, suas opções e o label específico, sem alterar picking, highlight, gestos, câmera, cena, lifecycle ou observabilidade;
- adicionados botões HTML nativos `Anterior`/`Próximo` com wrap centralizado, usando a seleção emitida pelo runtime como única fonte de verdade;
- ampliados testes React e Chromium para navegação nos dois sentidos, extremidades, seleção Three → React → Three e layout mobile;
- gerado novo APK debug para revalidação curta; F1-F permanece em validação humana e Three.js continua candidato experimental.

### F1-E — Gates técnicos consolidados e Android — 2026-09-09

- auditados os gates T1–T6 da Fundação Three.js sem adicionar funcionalidade ao mundo;
- consolidados regressão convencional, build Vite de produção, baseline Chromium desktop/mobile, ponte React ↔ Three e dez ciclos de lifecycle;
- confirmadas as fronteiras arquiteturais, o baseline estrutural de 46 meshes/11 selecionáveis/46–47 draw calls/546 triângulos e a ausência de persistência espacial;
- concluídos sync Capacitor e build Gradle debug, com APK técnico identificado para a validação humana no Moto G06;
- preservados Three.js como candidato experimental, R-09 como risco aberto e F1-F como gate físico pendente.

### F1-D — Lifecycle formal e observabilidade — 2026-09-08

- formalizados os estados `created`, `mounted`, `running`, `paused` e `disposed`, com start/pause/resume/dispose idempotentes, um único RAF e proteção contra callbacks tardios;
- integradas pausa por visibilidade, retomada previsível, cancelamento seguro de gestos, resize por `ResizeObserver` com fallback de `window.resize` e cleanup determinístico;
- adicionados snapshots locais de FPS, frame time médio, `renderer.info`, malhas, objetos, selecionáveis, primeiro frame utilizável e carregamento do GLB, exibidos em uma superfície React compacta atualizada em até 4 Hz;
- ampliada a cobertura unitária de métricas/lifecycle/disposal e a E2E Chromium com dez ciclos completos de saída e retorno, canvas/loop únicos e interação funcional após a repetição;
- preservados a cena e o bundle experimentais sem biblioteca de métricas, analytics, telemetria, persistência espacial ou funcionalidade da F1-E.

### F1-C — Interação e ponte React ↔ Three — 2026-09-08

- adicionados pan desktop/touch por Pointer Events, wheel zoom e pinch experimental com limites, distinção de tap/drag e pointer capture defensivo;
- onze objetos técnicos receberam IDs e labels efêmeros; piso e paredes permanecem fora da seleção;
- picking passou a usar `Raycaster` e resolve meshes filhos do GLB para o objeto lógico selecionável;
- seleção ganhou highlight ciano por `Box3Helper`, removido e descartado ao trocar, limpar ou desmontar;
- `WorldRuntime` passou a expor catálogo, callback de seleção e comando por ID, formando a ponte Three ↔ React sem persistência;
- adicionada superfície React compacta com texto `aria-live` e `select` HTML nativo como alternativa ao canvas;
- adicionada cobertura unitária e Chromium para seleção, gestos, cleanup, ponte bidirecional e viewport mobile sintético, sem antecipar a observabilidade da F1-D.

### F1-B — Cena de referência + GLB — 2026-09-08

- substituída a geometria única da F1-A por uma cena técnica descartável com piso, quatro segmentos de parede, quatro tipos de proxies e 46 meshes visíveis;
- mantida a câmera ortográfica em apresentação 2.5D e adicionadas iluminação hemisférica e direcional simples, materiais baratos e sombras desligadas;
- adicionado o fixture interno `f1-technical-pyramid.glb`, carregado pelo addon oficial `GLTFLoader`, com procedência registrada e sem pipeline 3D formal;
- falha de asset passou a ser diagnosticável sem derrubar o canvas ou o aplicativo convencional, e callbacks tardios após unmount descartam o modelo carregado;
- disposal passou a liberar geometrias, materiais e texturas da cena e do fixture sem descarte duplicado de recursos compartilhados;
- adicionados testes do GLB real, construção da cena, sucesso/erro/loading tardio, disposal e smoke Chromium observável, sem antecipar interação da F1-C;
- ajustada a altura do canvas em viewport estreita para preservar leitura da cena e evitar espaço vertical excessivo.

### F1-A — Bootstrap da Fundação Three.js — 2026-09-08

- incorporada a documentação final da F0 e instalado o contrato F0-D como autoridade temporária da F1;
- adicionado `three@0.185.1` como candidato experimental, carregado sob demanda pela rota Biblioteca;
- criada a fronteira `LibraryPage → WorldHost → ThreeWorldRuntime`, com `WebGLRenderer`, `Scene`, `OrthographicCamera`, uma geometria técnica e um único canvas;
- adicionado lifecycle explícito de mount, start, pause, resume, resize e disposal, com limpeza de loop, observer, listener, canvas e recursos Three;
- falha de inicialização do renderer passou a apresentar fallback textual sem bloquear as áreas convencionais;
- adicionados testes de contrato/lifecycle/React e smoke Chromium de mount, unmount e remount sem acúmulo de canvas;
- Dexie v8, backup v6 e as fronteiras de domínio/aplicação permanecem inalterados; não foi criado estado espacial persistente.

### WORLD RESET — 2026-09-08

- removidos integralmente o mundo visual anterior, seu renderer Phaser, Construção, contratos espaciais, progressão estrutural, salas, personagens, diálogos, assets, fontes, candidatos, guias, scripts e testes exclusivos;
- a rota Biblioteca passou a apresentar um placeholder React curto e acessível, sem canvas ou estado espacial;
- removido `phaser` e o preload visual; o aplicativo abre diretamente pelo bootstrap React;
- criado o schema Dexie v8, que descarta os dados de desenvolvimento existentes e mantém somente as tabelas convencionais no schema ativo;
- criado o backup v6 somente para dados convencionais; formatos v1–v5 são deliberadamente incompatíveis e rejeitados antes da escrita;
- preservados os dez marcos convencionais, sem rewards, grants, decoração, diálogo ou efeitos no mundo;
- reconciliada a documentação para um baseline sem mundo e registrada a direção futura de 3D real com apresentação ortográfica/2.5D, sem escolha de renderer neste checkpoint.

### Adicionado

#### Produto e registros

- união discriminada de seis tipos de registro: Livro, Filme, Série, Estudo, Atividade física e Trabalho;
- criação, edição, detalhamento, progresso e conclusão especializados por tipo;
- Coleção unificada, busca, filtros, ordenação e redirecionamentos para URLs históricas de livros;
- notas e citações generalizadas para os tipos compatíveis, com edição, exclusão confirmada e compartilhamento explícito;
- etiquetas normalizadas e favoritos em registros, notas e citações;
- sessões tipadas e persistentes, com uma sessão aberta globalmente, pause, retomada e duração baseada em timestamps;
- timeline, sessões recentes, estatísticas por período e categoria e resumo global da Biblioteca;
- métricas derivadas sem tabela própria, score, ranking ou streak.

#### Dados, backup e progressão

- schema Dexie v4 para registros múltiplos e anotações generalizadas;
- schema Dexie v5 com tabelas de etiquetas e sessões;
- schema Dexie v6 com `placedObjects`;
- schema Dexie v7 com `worldStructures`;
- backup v3 para etiquetas, sessões e dados da fase P1;
- backup v4 para objetos posicionados;
- backup v5 para estrutura persistente, preservando leitura dos formatos v1 a v4;
- inspeção de backup sem escrita, integridade SHA-256, restauração transacional e união monotônica de marcos;
- marcos idempotentes, recompensas declarativas e progressão estrutural por sessões elegíveis;
- concessões físicas por família nos limiares 1, 5, 15 e 30, com inventário derivado.

#### Experiência convencional

- sistema visual escuro semântico e componentes responsivos;
- dock global com Biblioteca, Coleção, Arquivo, Resumo e Ajustes;
- Novo registro como ação contextual da Coleção;
- Busca e Filtros recolhíveis, com estado preservado, foco, Escape e Android Back;
- Resumo com métricas reais, estados vazios, tipos compactos e gráfico SVG responsivo;
- preferências de movimento, contraste e tamanho de texto;
- edge-to-edge Android com system bars transparentes e safe areas.

#### Biblioteca visual e reboot espacial

- host Phaser carregado sob demanda, com uma instância, uma cena e um canvas;
- projeção tipada entre aplicação, React e Phaser;
- W1 com mundo maior que a viewport, câmera, bounds, pan e atmosfera por período;
- W2 com objetos persistentes, seleção, mover, girar, drag coalescido, preview e rollback;
- pisos internos e exteriores modulares, objetos de mesa e cadeira em quatro orientações e fallback procedural;
- `WorldStructureState` persistente para `world.main`, separado de `PlacedObject`;
- catálogo estrutural de pisos, paredes de 1/2/4 células, quatro cantos e porta horizontal aberta/fechada;
- editor de Construção para piso e peças, com revisão otimista, single-flight e inventário físico;
- alternativa textual acessível, feedback consolidado de desbloqueio e ação `Abrir construção`;
- etiqueta contextual de sala/período com ciclo de 5.000 ms;
- faixa compacta de peças colocadas e ações contextuais que preservam o mapa como superfície principal.

#### Áudio, conteúdo e qualidade

- serviço de áudio atrás de porta da aplicação;
- seis WAVs próprios e determinísticos, com silêncio como fallback;
- playlist musical declarativa, sequencial e validada;
- preferências independentes de música e efeitos;
- conteúdo contextual local, locale `pt-BR`, fallbacks e seleção determinística de diálogos;
- diagnóstico técnico restrito a desenvolvimento e builds internos;
- suíte Playwright Chromium e CI web;
- validações de assets estruturais, relatório de desempenho e scripts Android reproduzíveis.

### Alterado

- o produto deixou de ser centrado apenas em livros e passou a representar seis tipos de experiência;
- a direção inicial de cinco salas temáticas foi substituída por um mundo espacial contínuo, semanticamente neutro e construído pelo usuário;
- a antiga navegação por drawer foi substituída por um dock único;
- a Biblioteca deixou de trocar salas por arraste; o gesto em área livre passou a explorar o mundo;
- Construção passou a ocultar temporariamente o dock sem desmontar o host Phaser;
- o blueprint fixo W1 deixou de ser a autoridade da estrutura; `world.main` persistido passou a ser a fonte de verdade;
- estrutura e objetos passaram a possuir agregados, regras de ocupação e persistência independentes;
- o renderer estrutural deixou de consultar offsets, pivôs e spans visuais legados;
- sprite, fallback, hit testing, preview, seleção e depth passaram a consumir a mesma transformação canônica;
- o inventário deixou de ser uma contagem independente e passou a ser derivado de reserva, placements e concessões;
- restauração em base preenchida passou a exigir escolha explícita sobre backup de segurança;
- música passou a ser preparada após gesto permitido e a reutilizar decodificação entre entradas;
- fluxos automatizados foram adaptados aos disclosures e à navegação vigentes;
- somente as 17 texturas necessárias ao mapa inicial permanecem bloqueantes; 11 texturas são carregadas depois do primeiro frame;
- a leitura inicial duplicada em desenvolvimento pelo StrictMode foi deduplicada.

### Corrigido

#### Produto, dados e Android

- exportação Android passou a diferenciar salvamento em destino escolhido e compartilhamento nativo;
- exclusão de registros, anotações e atividades relacionadas passou a ser transacional;
- restauração preserva marcos legítimos e não repete recompensa, áudio ou notificação;
- atualização de schema preserva IDs, datas, revisões, objetos e conteúdo existente;
- aviso de backup v5 passou a comparar corretamente com o schema Dexie v7;
- sessão ativa restaurada volta em estado seguro, sem acumular duração fictícia;
- rolagem vertical e rodinha do mouse deixaram de disputar toque curto no canvas;
- Android Back passou a fechar subestados antes de sair da rota ou encerrar o aplicativo.

#### W1 e W2

- caminhos de assets internos foram reconciliados com a grafia real `architecture`;
- bounds passaram a considerar viewport alta e margens de câmera;
- ações de objeto selecionado deixaram de ficar fora da área visível;
- exterior passou a usar células e crops determinísticos menores para reduzir macro-tiles;
- o cartão de objeto recebeu fechamento acessível e confirmação por toast;
- drag descarta posições intermediárias acima da cadência de frame;
- giros rápidos persistem o último estado desejado e restauram estado seguro em falha.

#### Rodada corretiva W3-A R0–R6

- quatro cantos estruturais não conformes foram substituídos por candidatos determinísticos aprovados e promovidos às fontes e ao runtime;
- metadado visual duplicado foi unificado em `structureVisualGeometry`;
- porta horizontal deixou de depender do offset visual legado;
- depth passou a ser derivado da base visível, com bandas e desempate estável;
- fallback procedural passou a usar a mesma geometria e depth dos sprites;
- hit areas passaram a usar as regiões da transformação canônica, incluindo os dois braços de cantos;
- inicialização do Phaser foi protegida contra leitura de tweens antes do primeiro render;
- o contrato de porta passou a separar corredor estrutural de envelope visual;
- normal interior passou a ser derivada exclusivamente da adjacência do piso;
- alinhamento transversal passou a usar translação assinada geral, sem exceção por blueprint, coordenada ou `instanceId`;
- acabamento longitudinal passou a respeitar a tolerância de um pixel-fonte;
- a matriz de continuidade evoluiu de 19/31 para 31/31 junções;
- a repetição oficial do renderer ativo passou 9/9 cenários;
- controles superiores obsoletos foram removidos da Biblioteca;
- paletas e peças colocadas deixaram de cobrir permanentemente o mapa;
- expansão de piso, colocação, seleção, movimento e Resumo passaram a atualizar sem reload;
- R6 confirmou no Moto G06 o dock, Construção, Busca/Filtros recolhidos e preservação dos dados pessoais.

### Desempenho

- no cenário local de produção do gate pré-R6, o primeiro frame observado mudou de 1.642 para 1.453 ms a frio e de 1.426 para 1.233 ms com cache;
- a carga inicial bloqueante foi reduzida de 28 para 17 texturas;
- a demora inicial da Biblioteca e o engasgo no card do Resumo continuam conhecidos e não foram declarados resolvidos.

### Removido

- composição futura baseada em cinco salas obrigatórias por categoria;
- drawer como segunda navegação primária;
- controles superiores obsoletos da Biblioteca;
- fixture procedural histórica da composição normal de objetos;
- cópias públicas de paredes experimentais sem uso no runtime;
- áudio procedural reprovado como fallback ativo;
- tolerância legada do comando padrão de validação dos cantos.

### Segurança e privacidade

- registros, sessões, estrutura e backups continuam locais, sem conta, backend, sincronização ou telemetria;
- arquivos externos são validados por tamanho, schema, versão, duplicatas e integridade antes de qualquer escrita;
- restauração ocorre em transação e não publica eventos de conquista;
- fixtures, E2E e CI usam conteúdo fictício e não recebem backups pessoais;
- logs e diagnósticos não incluem títulos, autores, notas, citações, etiquetas ou payload de backup.

### Documentação

- documentação reorganizada entre contratos vigentes, decisões e arquivo histórico;
- `MANIFEST.md` e `docs/00_LEIA-ME.md` foram fundidos em `docs/README.md`;
- visão e contrato do produto foram consolidados em `docs/PRODUCT.md`;
- estado atual foi reconciliado com Dexie v7, backup v5 e encerramento da W3-A;
- planos concluídos, checklists antigos e logs integrais foram movidos para `docs/history/`;
- plano de testes cumulativo foi substituído por `docs/TESTING.md`;
- decisões vigentes foram consolidadas em ADRs individuais;
- o handoff obsoleto da W3-A foi substituído por um resumo histórico.
- o roteiro já definido da W3-B à W3-F foi restaurado como planejamento vigente, distinguindo etapa planejada de etapa em execução;
- `docs/W3_PLAN.md` passou a registrar a continuidade entre o reboot espacial, a ampliação da W3-A e as próximas etapas de estantes e livros.

## [0.2.0-alpha.1] — 2026-07-29

### Adicionado

- domínio puro de livros, progresso, status, notas e citações;
- schemas Zod de fronteira e eventos mínimos sem conteúdo pessoal;
- camada de aplicação com portas, casos de uso, atividades e erros públicos;
- persistência Dexie/IndexedDB com migração v1 para v2;
- repositórios concretos, transações, event bus pós-commit, Clock e IDs de plataforma;
- diagnóstico técnico interno para desenvolvimento e APKs de gate;
- suíte inicial de domínio, aplicação e persistência;
- validação manual de persistência no navegador e no Moto G06.

### Alterado

- comandos de escrita passaram a usar a fronteira transacional;
- eventos passaram a ser publicados somente após commit;
- documentação técnica foi alinhada aos contratos dos Prompts 4–6.

### Corrigido

- painel técnico passou a usar modo diagnóstico explícito e a permanecer fora do build normal.

## [0.1.0] — 2026-07-28

### Adicionado

- fundação React, Vite e TypeScript estrito;
- formatação, lint, testes e build web;
- shell responsivo com Biblioteca, Coleção, Novo livro, Arquivo e Configurações;
- React Router e tratamento inicial de Android Back;
- Capacitor 8, plataforma Android e primeiro APK debug;
- safe areas e prova física inicial no Moto G06.

### Alterado

- Gates G0, G1 e G2 foram aprovados;
- Blocos de contrato, fundação e prova Android foram encerrados.
