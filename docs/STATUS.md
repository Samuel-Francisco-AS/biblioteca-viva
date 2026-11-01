# Estado atual

> Referência documental: 2026-11-01.

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
- **BF-3C3 e BF-3C estão concluídas no escopo procedural provisório aprovado.** A hipótese 1 de sala única recebeu FAIL visual por escala/reconhecibilidade; a hipótese 2 melhorou os objetos, mas a planta recebeu FAIL. A hipótese 3 recebeu PASS humano explícito nos cenários A/B/C (5/13/13 placements; 0/0/4 overflow). O núcleo e as quatro salas periféricas são semanticamente neutros, com quatro passagens abertas; a associação atual de categorias é só distribuição inicial, sem reservar cômodos. A ressalva humana de que a planta não reproduz fielmente a referência 2D permanece; não é edifício definitivo. `libraryBuildingGeometry.ts`, `proceduralLibraryBuilding.ts` e `libraryRecordLayout.ts` consolidam construção, cômodos e layout. A capacidade inicial dos cinco tipos deriva de 13 slots (2/2/3/3/3), separada dos 70 slots exclusivos dos livros BF-2. Testes reais de Box3, passagens, colisões, ownership, descarte, ordem e overflow passaram; prévia HTML, bootstrap, renderer e cenários temporários foram removidos. A montagem e seleção no runtime vieram depois, em BF-3D; Android, TalkBack, movimento, persistência espacial, desempenho físico, ergonomia e arte final não receberam aprovação.
- **BF-3D1/D2/D3 e o gate D receberam PASS técnico local.** O snapshot composto monta 13 wrappers BF-3, preserva 70 livros e três estantes BF-2, identidade `instanceId`/`entryId`, overflow sem root, caminho legado e F5 isolado. Catálogo, picking e seleção por ID/canvas mantêm destaque único; a prova pós-auditoria D2 inclui livros e estantes BF-2 por canvas no mundo composto. A D3 comprovou rollback da composição, falha depois de criar edifício e registros, attach parcial da interação, falha WebGL terminal, descarte repetido, montagens independentes, seleção obsoleta e callbacks tardios existentes. Um vazamento de listener no attach parcial foi corrigido na interação. Passaram 6 arquivos/85 testes dirigidos, 78 arquivos/626 testes Vitest, format:check, lint, typecheck, audio:check, build, performance:report e 17 E2E. O aviso de chunks acima de 500 kB continua; o relatório estático aponta 634.053 bytes iniciais e 659.439 bytes no chunk dinâmico Three, sem medir desempenho físico. Naquele checkpoint D, BF-3 não estava concluída.
- R3F e WebGPU não estão aprovados; renderers alternativos só voltam a ser considerados diante de evidência estrutural futura.

## Validações abertas

- **Dívida assistiva obrigatória:** a validação humana com TalkBack no Moto G06 não foi executada no fechamento da F6 por indisponibilidade temporária do aparelho e não constitui PASS. Antes de declarar concluído o primeiro recorte real do mundo — e antes de beta/release dependente dessa experiência — validar o build então atual e representativo: TalkBack, ordem/leitura, anúncios, foco percebido, navegação convencional, operação essencial sem canvas, ergonomia, contraste, tamanho de texto Android e áudio quando relevante.
- R-09 foi parcialmente mitigado pela evidência da cena mínima no Moto G06, mas permanece ativo para densidade, assets, iluminação, personagens e mundo real.
- F5 mediu somente a fixture/corpus diagnóstico; conteúdo real, iluminação, animação, transparências, personagens, pós-processamento, memória GPU exata e teto de capacidade permanecem fora do envelope. Nova densidade ou mudança material de renderização exige nova medição no Moto G06.
- A apresentação BF-3 integrada recebeu PASS humano **dirigido** na rodada 2 do Moto G06 (seis categorias, representações, picking e seleção React, edição/retorno, inspeção visual e fluidez percebida), sem anomalias relatadas. Isto não prova ausência de toda oclusão em todos os ângulos: a sobreposição projetada série × estante e os bounds ainda derivados do piso técnico permanecem limites da composição provisória. TalkBack **não** recebeu validação humana.

## BF-3E3/BF-3E — PASS técnico (2026-11-01)

A BF-3E1/E2 foi consolidada na E3: consulta única e snapshot dos seis tipos, listas semânticas, identidades e catálogo publicado, seleção bidirecional, overflow acessível, fallback, isolamento entre montagens e preservação BF-2/F5. A suíte E2E comprova abertura, edição e retorno de todos os tipos: livro no fluxo BF-2 existente; os cinco tipos restantes no cenário ampliado E3. O teste do shell espera o título vigente, `Registros da Biblioteca`, sem perder acesso à Coleção. `p1-memory` agora aguarda o estado visível `Sessão pausada` antes do reload; cinco repetições dirigidas locais passaram sem retries. A corrida é plausível pelo fluxo assíncrono, mas os logs históricos não provam causa única.

O gate local e a CI do PR #2 (`4aef4088df4944cedab2f80551dc52c5be379a25`, GitHub Actions [41272609003](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41272609003)) passaram: format:check, lint, typecheck, 78 arquivos/635 testes Vitest, audio:check, build, performance:report e 18 E2E. Relatório estático: 638.489 bytes iniciais e 659.439 bytes no chunk dinâmico Three; aviso acima de 500 kB permanece. A auditoria independente da Luna em 2026-11-01 aprovou o gate técnico, sem bloqueantes no diff do PR. Esta evidência **não** valida APK, desempenho/legibilidade Android, oclusão/iluminação integrada, bounds F3 ou TalkBack. BF-3F e BF-3 permanecem abertas.

## BF-3F/BF-3 — Fechamento no escopo acordado (2026-11-01)

**Veredito humano:** Moto G06, APK debug atualizado pelo usuário; [issue #5](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/5). Rodada 1: **5/5 PASS** — toque nas três estantes e destaque, Próximo/Anterior, pan/pinch/zoom, retrato ↔ paisagem e segundo plano/retorno. Rodada 2: **6/6 PASS** — seis tipos/categorias, suas representações procedurais, seleção no canvas, seleção por React, abertura/edição/retorno e inspeção visual/fluidez. **11/11 procedimentos com PASS por relato humano**; nenhuma anomalia específica reportada. Captura do diagnóstico: runtime `running`, 12 objetos selecionáveis, 100 meshes, 1.264 triângulos, ~60,0 FPS / 16,7 ms de frame médio e ~200,4 ms no primeiro frame. Valores pontuais, não prova de FPS sustentado, stress ou limite do aparelho. Não foi verificado hash/SHA do APK instalado; a origem exata do binário não foi demonstrada criptograficamente.

**Exceção expressa ao gate automatizado:** a BF-3E tem PASS técnico histórico no PR #2 e na CI [41272609003](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41272609003); depois do merge, a CI da `main` [41277733624](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41277733624) falhou com 17 E2E aprovados e um timeout no `r4-shell`, de causa ainda inconclusiva. A mitigação experimental do PR #3 foi rejeitada para merge; a [issue #4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4) mantém a dívida aberta. **Não há PASS integral/estável da CI atual**, nem gate E2E pós-merge verde confirmado. O usuário optou por não dedicar mais tempo a essa falha agora e autorizou o encerramento com essa exceção declarada, sem enfraquecer os testes.

**Decisão:** **BF-3F e BF-3 encerradas no escopo técnico-funcional e físico dirigido acordado, com ressalva explícita de CI pendente**. Não declarar release/beta, primeiro recorte real, desempenho sustentado, acessibilidade assistiva ou arte/edifício definitivos como aprovados. TalkBack permanece obrigatório antes do primeiro recorte real/beta; não houve novo gate assistivo. Persistência espacial, GLB produtivo, assets definitivos e mudanças de schema não pertencem a BF-3.

## Próximo trabalho

A **BF-4 — Mundo Vivo e Habitável** foi autorizada para **planejamento e BF-4A documental** em 2026-11-01: auditoria dirigida, decomposição BF-4B–G e [contrato](BF-4_PLANO_CONTRATO.md) registrados com [ADR-012](decisions/ADR-012-bf-4-mundo-vivo.md). **BF-4A: PASS exclusivamente documental. BF-4B–G: pendentes de implementação.** O plano exige evolução integrada dos cinco cômodos e personagens com identidade visual, animações, inteligência comportamental local e conversa textual contextual; **nenhuma dessas funcionalidades BF-4 foi implementada neste checkpoint**. A dívida de CI [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), a dívida humana TalkBack, o risco de oclusão/bounds da geometria provisória e performance futura sob maior densidade permanecem abertos, sem impor nova rodada à BF-3F. P3D-B2–F continuam adiados até necessidade demonstrada de assets GLB definitivos.

**Evidência separada:** D1 aprovou montagem e ownership após auditorias independentes e CI; D2 aprovou catálogo, picking e seleção e recebeu prova adicional dirigida do canvas BF-2 após auditoria; D3 corrigiu o attach parcial de listeners e concluiu a regressão consolidada local. Luna concluiu a auditoria independente da D3 com PASS técnico dirigido no commit `2cb4c9d`. A CI remota da BF-3E1 no commit `ae606e0` aprovou formato, lint, tipos, 630 testes Vitest, áudio, build e relatório estático de performance, mas falhou em cinco E2E `r4-shell` que ainda esperavam a fixture F1 na rota composta e em `p1-memory` após reload. A correção E2E local preserva as provas funcionais; `p1-memory` passou isolado nesta revalidação, e seu histórico de oscilação permanece registrado. Nenhuma dessas evidências representa PASS humano visual, ergonomia, FPS físico, Android ou TalkBack.

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
BF-3 ✅ CONCLUÍDA NO ESCOPO TÉCNICO-FUNCIONAL E FÍSICO DIRIGIDO — CI PENDENTE COMO DÍVIDA
  BF-3A ✅ contrato e fronteiras — CONCLUÍDA DOCUMENTALMENTE
  BF-3B ✅ projeção neutra dos cinco tipos restantes — CONTRATOS E TESTES PUROS
  BF-3C ✅ procedural e layout isolados — CONCLUÍDA NO ESCOPO APROVADO
    BF-3C1 ✅ contrato breve e cinco fábricas
    BF-3C2 ✅ layout determinístico, bounds e overflow — PASS TÉCNICO
    BF-3C3 ✅ hipótese 3 com PASS humano e técnico; prévia removida
  BF-3D ✅ runtime e seleção — PASS TÉCNICO LOCAL
    BF-3D1 ✅ montagem e ownership — PASS TÉCNICO DIRIGIDO
    BF-3D2 ✅ catálogo, picking e seleção — PASS TÉCNICO LOCAL
    BF-3D3 ✅ robustez, regressão e fechamento — PASS TÉCNICO LOCAL
  BF-3E ✅ React/aplicação e fluxo funcional — PASS TÉCNICO
    BF-3E1 ✅ consulta agregada e ponte React → runtime — escopo operacional local
    BF-3E2 ✅ interface funcional dos seis tipos — coberta pelo gate E3
    BF-3E3 ✅ gate consolidado — auditoria independente e CI PASS
  BF-3F ✅ 11/11 procedimentos físicos PASS — exceção formal: CI E2E instável (issue #4)
BF-4 🔄 PLANEJADA — SEM IMPLEMENTAÇÃO DE MUNDO VIVO
  BF-4A ✅ auditoria + contrato + decomposição — DOCUMENTAL
  BF-4B–G ⏳ implementação, integração, personagens e gate físico PENDENTES
```
