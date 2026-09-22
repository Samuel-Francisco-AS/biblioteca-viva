# Estado atual

> Referência documental: 2026-09-22.

## Produto

- O aplicativo convencional está funcional com os seis tipos de registro e operação local-first, sem conta, backend, sincronização, nuvem ou analytics.
- React, Dexie v8, backup v6, Capacitor, Vite, Vitest e Playwright permanecem ativos; Dexie e backup contêm somente dados convencionais.

## Mundo

- **F0–F6 estão concluídas no plano técnico/arquitetural; a FUNDAÇÃO está concluída.** F5 consolidou no Moto G06 um envelope diagnóstico físico, guardrails de remediação e a decisão de não adotar otimizações preventivas; não encontrou o teto do aparelho nem criou hard budgets. P3D-A formalizou o contrato produtivo e P3D-B1 registrou documentalmente o candidato `bookshelf`, sem criar fonte canônica normalizada ou asset produtivo; P3D-B2–F estão adiados. BF-0 concluiu o replanejamento, BF-1A a fábrica procedural isolada, BF-1B a composição declarativa isolada, BF-1C a integração estática e BF-1D a substituição procedural síncrona com descarte seletivo e gate integrado. Three.js está aprovado como renderer da Fundação do novo mundo. F6-A fechou o contrato, F6-B a evidência automatizada e F6-C aceitou documentalmente a dívida humana assistiva; **TalkBack não foi aprovado.**
- A linha ativa é `React → WorldHost → ThreeWorldRuntime → Three.js`, com `WebGLRenderer`, `OrthographicCamera`, GLTF/GLB, lifecycle explícito, integração React ↔ Three e Android/Capacitor.
- F3 consolidou `CameraNavigation` runtime-only como autoridade de `targetX`, `targetZ` e `zoom`; framing e bounds dependem de projeção, viewport e zoom. Pan, wheel focal e pinch focal navegam no plano X/Z; tap elegível só faz picking no `pointerup`, e o layout entrega ao runtime somente o `world-host` real observado. Resize/orientação preservam exploração e seleção quando possível e cancelam somente o gesto ativo.
- A correção final dos bounds substituiu o AABB da projeção por uma região convexa válida de centros de câmera, preservando na viewport um patch do piso técnico de largura e altura equivalentes a 15% dos spans projetados, limitado pelo espaço disponível. Ela não alterou `CameraNavigation`, gestos, lifecycle ou renderer.
- A validação humana ampla da F3 no Moto G06 foi positiva: abertura, framing, pan, tap/seleção, pinch, pinch → pan, zoom, rotação, background/resume e fluidez permaneceram funcionais, sem crash, travamento ou regressão funcional perceptível; o FPS ficou aproximadamente em 60 ou muito próximo durante interações e rotação. Isto é evidência humana da fixture técnica, não benchmark nem garantia do mundo final.
- A correção final dos bounds passou por regressão dirigida e novo build Android, mas não recebeu revalidação física específica no Moto G06. Essa ausência é risco residual aceito e não bloqueia o encerramento da F3; haverá nova validação física nas fases posteriores conforme necessário.
- A auditoria F4-A1 confirmou um único caminho de fixture GLB técnico, importado pelo build e carregado por `GLTFLoader` dentro de `ThreeWorldRuntime`; a montagem é dona do modelo e o libera com a cena. Não há cache, unload com runtime vivo, registry de runtime ou asset manager. Esse caminho F1 é evidência de baseline, não arquitetura de asset management permanente.
- F4-A foi concluída: a auditoria e o contrato experimental preservam GLTF/GLB no runtime e exigirão fonte editável e procedência em cada prova futura. O preflight técnico confirmou que Blender 3.3.21 executa via CLI, salva `.blend`, exporta GLB 2.0 e reimporta o arquivo produzido; o gate humano no Fedora confirmou viewport e operações básicas utilizáveis, sem crash, travamento, tela preta, corrupção visual, flickering ou lentidão persistente relevante. Blender 3.3.21 está aprovado somente como ferramenta experimental de autoria durante F4; continua substituível, não é dependência do projeto nem ferramenta definitiva do Pipeline 3D.
- F4-B foi concluída experimentalmente: quatro GLBs normalizados de fontes externas com proveniência suficiente foram carregados pelo `GLTFLoader` instalado e têm roots sem scale, rotação ou offset corretivos, chão no `Y=0` e dimensões Three `[largura, altura, profundidade]`. O mapeamento observado é Blender `X →` Three `X`, Blender `Y →` Three `-Z` e Blender `Z →` Three `Y`; Azrael também foi carregado no diagnóstico com nove meshes sob root lógico, mas não entrou no checkout porque a licença/proveniência local disponível não é suficiente. O contrato continua experimental, não formaliza frente visual/funcional nem Pipeline 3D definitivo.
- F4-D1 auditou loading, ownership e disposal sem alterar produção ou assets. O fixture F1 ainda é possuído somente pela montagem terminal; `disposeObjectTree()` deduplica geometry/material/texture por árvore e remove sua raiz. Não há unload com host vivo, token de intenção ou abort no baseline. O contrato D1 separa semanticamente host, root, owner e loading, exige um único owner após attach, unload idempotente que preserva o host e descarte de sucesso tardio já não desejado. D2 realizou a primeira prova em harness isolado, sem mudança no runtime.
- F4-D2 comprovou em harness isolado que KayKit real, carregado pelo `GLTFLoader` instalado após SHA-256, pode ser aceito por owner experimental local, anexado a `Scene`, removido por `disposeObjectTree()` com eventos reais de disposal de geometry/material/texture e substituído por nova root no mesmo host. O sentinel permaneceu; não houve mudança de runtime, produção ou asset, nem criação de API, manager ou cache.
- F4-D3 estendeu esse harness sem alterar produção, runtime ou assets: unload repetido de KayKit é inerte depois da liberação única; três ciclos usam roots e recursos distintos sem acumular ownership; e owners locais independentes permitem descarregar Poly Haven sem tocar Kenney. A `Texture` compartilhada por metallic/roughness no Poly Haven emitiu um único `dispose`; a cobertura complementar de `referenceScene.test.ts` mantém a deduplicação geral intrárvore. Não foi aprovada política de sharing entre assets, referência contada, manager ou cache.
- F4-D4 usou roots Quaternius reais parseadas pelo `GLTFLoader` instalado e um double local somente para ordenar callbacks: abandono lógico, segundo sucesso, erro recuperável, erro tardio e owner encerrado não ressuscitam ownership nem host. Roots rejeitadas emitiram um único disposal de geometry/material; nova tentativa após erro foi aceita. Não houve abort físico, cancelamento de rede, API, manager, cache ou mudança de runtime/asset.
- F4-D foi concluída experimentalmente após D5: o gate F4-B/C/D dirigido aprovou 4 arquivos/20 testes e a suíte unitária integral aprovou 67 arquivos/510 testes, sem retries ou falhas. O contrato sobrevivente cobre ownership único, transferência única, unload seletivo/idempotente, repetição, isolamento, deduplicação intrárvore, cancelamento lógico e falha recuperável; permanece somente em harness de teste e não altera runtime, produção ou assets.
- F4-E1/E2 concluíram o baseline estrutural e o diagnóstico dos quatro GLBs F4-B sem alterar assets: hashes conferem, o corpus soma 5.901.424 bytes e Poly Haven concentra 98,766% dele, quase todo em três imagens 1024×1024 (5.814.197 bytes codificados; estimativa RGBA8 base de 12 MiB). A geometria inteira do corpus é 66.240 bytes lógicos e não sustenta experimento de compressão geométrica. A hipótese selecionada para E3/E4 é somente uma variante offline de resolução de texturas de Poly Haven, comparada ao original e submetida a contrato material/UV e gate visual; KTX2/Basis, Meshopt e Draco não foram adotados. Essas métricas não medem FPS, GPU, RAM, Android nem Moto G06.
- F4-E3/E4 concluíram experimentalmente a variante laboratorial Poly Haven 512 sem tocar o fixture registrado: GLB caiu de 5.828.612 para 711.352 bytes (-87,796%), imagens de 5.814.197 para 696.943 bytes (-88,013%) e estimativa RGBA8 base de 12 para 3 MiB. Geometria lógica, UV, transforms, hierarchy, material e metallic/roughness compartilhado passaram por comparação objetiva e `GLTFLoader` real. O gate humano foi PASS com leve desfoque perceptível apenas em comparação próxima, considerado irrelevante no uso ortográfico/2.5D pretendido; não houve perda bloqueante de identidade visual, material ou leitura geral. O harness/teste temporários foram removidos. Isso não cria budget global, asset final ou pipeline definitivo.
- F4-E foi concluída experimentalmente: a evidência sustenta medir antes de otimizar, separar payload de estimativa estrutural e performance física, e dimensionar texturas conforme necessidade visual e custo observado. Não há budget 512×512, codec adotado, mudança de runtime ou Pipeline 3D definitivo; KTX2/Basis, Draco, Meshopt e quantização permanecem possibilidades futuras dependentes de nova evidência. A variante laboratorial e seu script permanecem fora do checkout/registry como evidência não autoritativa.
- A cena atual é um spike técnico com fixture, não a Biblioteca final nem arquitetura permanente de conteúdo. BF-1C/BF-1D permanecem aprovadas nos seus contratos de wrappers, seleção e substituição. **BF-2 está concluída no escopo técnico-funcional e físico dirigido:** a Biblioteca recebe um contrato estreito de `listBookEntries`, consulta uma vez por montagem, reutiliza `projectReadingAreaBooks()` e fornece o snapshot imutável ao `WorldHost`/runtime normal. Loading, indisponibilidade e erro público não se confundem com coleção vazia; o vazio real mantém estantes sem conteúdo artificial. React lista todos os livros, inclusive overflow, abre somente por `entryId` e sobrevive à falha WebGL. A ponte neutra do host permite seleção React → runtime e canvas → React sem remontagem ou foco forçado; F5 continua sem livros reais e ignora inclusive a validação do snapshot BF. BF-2D-BOOK-VIS-FIX definiu o envelope máximo dos quatro `book-volume` como 0,225 × 0,400 × 0,360 m e a capacidade inicial derivada como 24 + 25 + 21 = 70, com bounds reais sem interseção. Não há atualização live, schema, backup ou persistência espacial.
- **Estado corrente BF-2E/BF-2:** o gate técnico integrado passou e o roteiro humano dirigido no Moto G06 foi positivo para livros reais, seleção por canvas e React, alternância entre esses métodos, highlight, abertura/edição/retorno, pan, pinch, zoom, retrato → paisagem → retrato e background/resume, com responsividade adequada e sem travamentos ou quedas de FPS percebidas. A observação humana é qualitativa: não estabelece FPS, benchmark, teto de carga ou desempenho do mundo futuro. A capacidade inicial corrente é **70** (24 + 25 + 21), nunca 89. Os volumes procedurais permanecem pequenos no enquadramento geral, mas são selecionáveis e foram aceitos pelo usuário para o escopo funcional atual. **BF-2E está concluída no escopo acordado, e BF-2 está concluída no escopo técnico-funcional e físico dirigido.** TalkBack continua dívida humana obrigatória; o primeiro recorte real e beta/release aplicável não estão fechados. Não há GLB produtivo, loader produtivo, cache, `PlacedObject`, `WorldStructureState` ou tabela espacial.
- **BF-3C3 e BF-3C estão concluídas no escopo procedural provisório aprovado.** A hipótese 1 de sala única recebeu FAIL visual por escala/reconhecibilidade; a hipótese 2 melhorou os objetos, mas a planta recebeu FAIL. A hipótese 3 recebeu PASS humano explícito nos cenários A/B/C (5/13/13 placements; 0/0/4 overflow). O núcleo e as quatro salas periféricas são semanticamente neutros, com quatro passagens abertas; a associação atual de categorias é só distribuição inicial, sem reservar cômodos. A ressalva humana de que a planta não reproduz fielmente a referência 2D permanece; não é edifício definitivo. `libraryBuildingGeometry.ts`, `proceduralLibraryBuilding.ts` e `libraryRecordLayout.ts` consolidam construção, cômodos e layout. A capacidade inicial dos cinco tipos deriva de 13 slots (2/2/3/3/3), separada dos 70 slots exclusivos dos livros BF-2. Testes reais de Box3, passagens, colisões, ownership, descarte, ordem e overflow passaram; prévia HTML, bootstrap, renderer e cenários temporários foram removidos. Não houve integração ao runtime produtivo nem aprovação de Android, TalkBack, seleção, movimento, persistência espacial, desempenho físico, ergonomia ou arte final.
- R3F e WebGPU não estão aprovados; renderers alternativos só voltam a ser considerados diante de evidência estrutural futura.

## Validações abertas

- **Dívida assistiva obrigatória:** a validação humana com TalkBack no Moto G06 não foi executada no fechamento da F6 por indisponibilidade temporária do aparelho e não constitui PASS. Antes de declarar concluído o primeiro recorte real do mundo — e antes de beta/release dependente dessa experiência — validar o build então atual e representativo: TalkBack, ordem/leitura, anúncios, foco percebido, navegação convencional, operação essencial sem canvas, ergonomia, contraste, tamanho de texto Android e áudio quando relevante.
- R-09 foi parcialmente mitigado pela evidência da cena mínima no Moto G06, mas permanece ativo para densidade, assets, iluminação, personagens e mundo real.
- F5 mediu somente a fixture/corpus diagnóstico; conteúdo real, iluminação, animação, transparências, personagens, pós-processamento, memória GPU exata e teto de capacidade permanecem fora do envelope. Nova densidade ou mudança material de renderização exige nova medição no Moto G06.

## Próximo trabalho

**BF-2E/BF-2, BF-3A, BF-3B e BF-3C1/C2/C3 passaram seus gates aplicáveis. BF-3C está concluída no escopo aprovado.** Próximo checkpoint: **BF-3D**, ainda não iniciado. Consumir a construção, o layout e as fábricas consolidados para integrar wrappers selecionáveis, catálogo, picking e descarte ao runtime normal; preservar estantes, livros, 70 slots BF-2, `entryId` e isolamento F5. BF-3E/3F e BF-4 continuam posteriores. TalkBack continua obrigatório antes do fechamento do primeiro recorte real e de beta/release aplicável e não recebeu PASS. P3D-B1 permanece registro documental de `bookshelf`; P3D-B2–F seguem adiados até necessidade concreta de GLB definitivo. A cena continua provisória, sem mundo final ou persistência espacial.

```text
F0 ✅
F1 ✅
F2 ✅
F3 ✅ CONCLUÍDA
F4 ✅ CONTRATO EXPERIMENTAL DE ASSETS 3D CONCLUÍDO
  F4-A ✅ CONCLUÍDA
    A1 ✅ auditoria do caminho atual
    A2 ✅ contrato experimental v0
    A3 ✅ preflight técnico + humano
  F4-B ✅ CONCLUÍDA
  F4-C ✅ CONCLUÍDA
    C1 ✅ inventário e diagnóstico
    C2 ✅ contrato técnico mínimo experimental
    C3 ✅ prova automatizada GLB → GLTFLoader/Three
    C4 ✅ preparação temporária do gate visual
    C5 ✅ gate visual humano
    C6 ✅ consolidação e limpeza
  F4-D ✅ CONCLUÍDA EXPERIMENTALMENTE
    D1 ✅ auditoria e contrato experimental de loading/unload/ownership
    D2 ✅ load → attach → unload com host vivo
    D3 ✅ repetição, isolamento e disposal
    D4 ✅ assíncrono em voo, abandono, callbacks tardios e erros
    D5 ✅ regressão, consolidação e fechamento
  F4-E ✅ CONCLUÍDA EXPERIMENTALMENTE — custo e compressão experimental
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
P3D-B2–F ⏸ ADIADOS — retomada condicionada a GLB definitivo
BF-0 ✅ replanejamento e decisão arquitetural
BF-1 ✅ TECNICAMENTE CONCLUÍDA
  BF-1A ✅ contrato mínimo e primeira fábrica procedural isolada
  BF-1B ✅ composição declarativa e posicionamento determinístico
  BF-1C ✅ integração estática com runtime e seleção
  BF-1C-FIX ✅ técnico + gate visual humano no navegador PASS
  BF-1D ✅ substituição procedural, descarte seletivo e gate integrado
BF-2 ✅ CONCLUÍDA — escopo técnico-funcional e físico dirigido
  BF-2A ✅ contrato e projeção neutra dos livros reais
  BF-2B ✅ livro procedural e layout determinístico isolados
  BF-2C ✅ integração com runtime e seleção
  BF-2D ✅ ponte React/aplicação e fluxo funcional
  BF-2E ✅ gate técnico e validação física dirigida positiva
BF-3 ⏳ CONTRATO, PROJEÇÃO E C CONCLUÍDOS; D/E/F PENDENTES
  BF-3A ✅ contrato e fronteiras — CONCLUÍDA DOCUMENTALMENTE
  BF-3B ✅ projeção neutra dos cinco tipos restantes — CONTRATOS E TESTES PUROS
  BF-3C ✅ procedural e layout isolados — CONCLUÍDA NO ESCOPO APROVADO
    BF-3C1 ✅ contrato breve e cinco fábricas
    BF-3C2 ✅ layout determinístico, bounds e overflow — PASS TÉCNICO
    BF-3C3 ✅ hipótese 3 com PASS humano e técnico; prévia removida
  BF-3D ⏳ runtime e seleção
  BF-3E ⏳ React/aplicação e fluxo funcional
  BF-3F ⏳ gate integrado, físico dirigido e fechamento
```
