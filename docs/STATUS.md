# Estado atual

> **BF-4F4 — candidata implementada (2026-11-02):** cinco histórias RPG offline (quatro individuais e A Noite da Fenda Lilás), escolhas consequentes, diário, integração F3/BF-4E e fallback React. **Auditoria e gate artístico Moto G06 pendentes; sem encerramento de F4/BF-4F e sem merge.** Contrato, caminhos, limites e resultados: [relatório F4](BF-4F4_RELATORIO.md). F3 mantém a ressalva física do folio de Lua; issues #4/#11/#15, TalkBack e BF-4G permanecem abertos. Os registros anteriores abaixo são cronologia.

> **BF-4F3 CONCLUÍDA NO ESCOPO DIRIGIDO (2026-11-02):** usuário aprovou no Moto G06 **Autonomia PASS, Convivência PASS e Integração PASS**. **Acidente/reparação do folio de Lua NÃO TESTADO fisicamente**; sua implementação tem cobertura automatizada, mas não aceite artístico humano. A auditoria estática não identificou bloqueio inequívoco. 690 Vitest PASS e novo E2E F3 PASS na CI. [CI da PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077): **E2E 21 PASS, 10 FAIL, 1 flaky; CI global FAIL**; os dez cenários FAIL têm os mesmos nomes da CI F2, sem prova de causa idêntica. Dívidas #4/#11/#15 permanecem. O usuário autorizou expressamente o fechamento e merge da [PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/16) **com exceção CI e ressalva física de Lua**. Próxima: **BF-4F4 (RPG e quests)**, sem início antecipado. [Fechamento](BF-4F3_RELATORIO.md).


> **Diretriz prioritária do projeto (2026-11-02):** ambição artística e criativa acima de otimização preventiva; não supor que o Moto G06 não aguenta. Construir uma experiência rica, testar proporcionalmente e medir gargalos reais antes de simplificar. Evitar loops de timeout/Playwright consumindo cota sem novo diagnóstico. [Arte](ART_DIRECTION.md), [testes](TESTING.md) e [desempenho](PERFORMANCE.md).

> **BF-4F2 CONCLUÍDA NO ESCOPO DIRIGIDO (2026-11-02):** quatro habitantes animados com reações à seleção e ações pelo React aprovadas no Moto G06, sem regressão/perda de fluidez percebida; animações simples aceitas para F2, sem limitar evolução artística. 676 Vitest PASS, 4 E2E F2 locais PASS. [CI PR #14 / 41532160557](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41532160557): gates não E2E PASS; **E2E 20 PASS, 10 FAIL, 1 flaky — CI global FAIL**, incluindo quatro casos novos F2 [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15) além de #4/#11. **Merge da PR #14 expressamente autorizado por exceção CI.** Próxima BF-4F3. [Fechamento](BF-4F2_RELATORIO.md).

> **Fechamento BF-4F1 (2026-11-02):** modelos iniciais de Samael, Aryn, Ytha e Lua e seleção por canvas/React **aprovados pelo usuário no Moto G06**. F1 concluída no escopo dirigido; animações corporais ficam para **F2**, autonomia para F3, diálogos/quests para F4. [Relatório final](BF-4F1_RELATORIO.md). A CI não foi declarada verde porque E2E final falhou (20 PASS, 6 FAIL, 1 flaky).

> Referência documental: 2026-11-02.
> BF-4E: **concluída no escopo funcional e físico dirigido**, integração autorizada via PR #12 com **CI E2E FAIL assumida como dívida** (#4/#11). BF-4F é a próxima fase; TalkBack, R-19 e medição sustentada permanecem abertos.

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

**BF-4B** continua concluída com PASS dirigido e ressalva visual R-19. **BF-4C ENCERRADA em 2026-11-02 no escopo técnico, visual e físico dirigido, por exceção formal ao gate de CI remota**, conforme autorização do usuário. C1 ampliou salão para 19 × 17,1 m, laterais para 7,68 × 10,08 m e quatro passagens para 1,2 × 2,6 m; C2 acrescentou 18 conjuntos ambientais. Auditoria estática: sem bloqueantes. Local: 638 Vitest/19 E2E PASS relatados. [CI PR #9 (41387959550)](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41387959550): **FAIL global, 638 Vitest PASS e 18/19 E2E PASS**; timeout no `r4-shell` de dez ciclos de rota; issue #4 segue aberta sem causa comprovada. **Moto G06:** novo APK instalado, nove capturas, aparência aprovada e PASS dirigido em pan/zoom/seleção, orientação e segundo plano/retorno, sem regressões/travamentos percebidos; ~58,7–60,1 FPS apenas em leituras pontuais. **Ressalva de layout aceita:** estantes e outras representações de registros ainda em posições provisórias, a organizar na BF-4D; não há editor de móveis aprovado. R-19 e TalkBack continuam pendentes, sem desempenho sustentado nem release/beta. **BF-4D foi posteriormente auditada, aprovada no Moto G06 e encerrada no escopo dirigido por autorização expressa para aceitar as dívidas da CI (#4/#11).** [Fechamento BF-4C](BF-4C_RELATORIO.md). P3D-B2–F continuam adiados.

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
BF-4 🔄 BF-4B–E e BF-4F1/F2/F3 concluídas no escopo dirigido; BF-4F4 CANDIDATA À AUDITORIA
  BF-4A ✅ auditoria + contrato + decomposição — DOCUMENTAL
  BF-4B ✅ cinco cômodos — CI e Moto G06 PASS dirigido, ressalva R-19
  BF-4C ✅ ampliação e mobília dos cinco cômodos — PASS dirigido; CI E2E FAIL aceita (#4)
  BF-4D ✅ organização espacial — auditoria e Moto G06 PASS dirigido; CI FAIL 19/21 aceita (#4/#11)
  BF-4E ✅ objetos vivos, interação por toque e atmosfera contextual — Moto G06 PASS dirigido; CI E2E FAIL aceita (#4/#11)
  BF-4F 🔄 F1/F2/F3 concluídas por gates dirigidos (F3 com exceções); F4 pendente
    BF-4F1 ✅ quatro habitantes integrados, seleção canvas/React — PASS físico dirigido
    BF-4F2 ✅ animações corporais e expressividade — gate dirigido PASS, CI E2E FAIL (#15)
    BF-4F3 ✅ comportamento autônomo e relações — 3 gates físicos PASS, Lua não testada, CI E2E FAIL
    BF-4F4 🔄 cinco histórias RPG implementadas — candidata à auditoria e ao gate humano
  BF-4G ⏳ gate integrado PENDENTE
```

## BF-4D — Encerrada por exceção explícita à CI (2026-11-02)

Base sincronizada em `6804fee4c3fff49f8807c0111bba4e08716639cf`, branch `feat/bf-4d-spatial-organization`. Estantes distribuídas em A/C/D, 13 slots BF-3 reorganizados nos cinco cômodos e 18 conjuntos ambientais preservados. Circulação declarativa de 1,2 m, quatro passagens livres, 18 zonas e 18 pontos (dez atividades e oito entradas), com validação pura e Box3 das instâncias reais. Identidades, 70 livros, overflow, seleção, câmera F3, lifecycle e F5 preservados. Sem agentes, ações BF-4E, editor, persistência, dependências ou alteração de arquitetura.

**Gate local BF-4D PASS:** formato, lint, tipos, 645 testes/80 arquivos, áudio, build, performance, 21/21 E2E, Android debug e diff --check. **Auditoria estática independente sem bloqueante inequívoco e gate dirigido Moto G06 PASS** (quatro capturas; arraste, zoom, seleção, orientação, sem regressão/travamento relatado; ~58,8–60,1 FPS pontuais). **CI remota PR #10 [41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) FAIL**, 19/21 E2E PASS: timeout histórico `r4-shell` e **timeout novo** na coleção cheia BF-4D de 1280px; este último requer investigação específica. **Fechamento/merge autorizados expressamente em decisão posterior, mesmo com os dois timeouts, como dívida rastreada em #4 (histórico) e [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) (BF-4D novo).** Não declarar CI verde, causa comprovada, desempenho sustentado ou beta. R-19 e TalkBack continuam pendentes. BF-4E é a próxima etapa ainda sem autorização de implementação. [Relatório BF-4D](BF-4D_RELATORIO.md).

## BF-4E — Registro histórico da aprovação criativa (2026-11-02)

O usuário adotou a proposta de transformar os cinco cômodos em ambiente reativo, com **dez famílias-alvo de objetos vivos**, animações de móveis/objetos, luz cênica real, efeitos locais, estados de sessão, três modos ambientais e descoberta ficcional encadeada. Contrato canônico: [BF-4E_VISAO_CONTRATO.md](BF-4E_VISAO_CONTRATO.md). **Registro histórico anterior à implementação e ao gate físico; o fechamento posterior está documentado abaixo.** Preservar seis categorias, BF-4D, F5 e React acessível; BF-4F/objetos persistidos não foram antecipados. Dívidas #4 e #11, R-19 e TalkBack permanecem abertas.

## BF-4E — checkpoint histórico de implementação (2026-11-02)

Implementação BF-4E em verificação na branch `feat/bf-4e-living-objects`. Dez famílias ambientais distribuídas nos cinco cômodos, sessão efêmera, três atmosferas e descoberta encadeada integradas. A autorização posterior do usuário permite implementação/publicação, substituindo as indicações anteriores de ausência de autorização. Não há encerramento nem PASS humano. [Relatório técnico](BF-4E_RELATORIO.md).

**BF-4E — correção de UX após teste físico inicial (2026-11-02):** o usuário não aprovou o painel de botões nem os controles manuais de atmosfera. Implementação dirigida na branch da PR #12: ação primária pelo toque, ambiente contextual (hora local e atividade da sessão), React como alternativa recolhida/fallback e mensagens breves junto à cena. **Novo APK ainda requer teste humano; nenhuma aprovação final ou merge.** A CI remota da revisão deverá ser avaliada separadamente; issues #4/#11 permanecem. [Relatório BF-4E](BF-4E_RELATORIO.md).

**BF-4E — novos refinamentos autorizados (2026-11-02):** o usuário concluiu o Segredo do Pergaminho pelo toque no Moto G06. Foram identificadas três melhorias localizadas, agora implementadas na candidata da PR #12: alvos de toque ampliados para livro/pergaminho pequenos, gaveta E movendo-se para o lado acessível e feedback temporário de quatro segundos. Revalidação remota e do APK **pendentes**; sem merge/fechamento da BF-4E. Issues #4/#11, R-19 e TalkBack continuam abertas.

## BF-4E — Fechamento dirigido autorizado (2026-11-02)

**BF-4E concluída e integração autorizada via [PR #12](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/12).** O usuário validou no Moto G06 a interação primária por toque sem botões principais, pan/zoom/seleção sem regressões percebidas, Segredo do Pergaminho completo 4/4, e após hotfix: alvos ampliados do pergaminho/livro, gaveta E no sentido correto e faixa temporária de 4 segundos. Dez famílias e três atmosferas implementadas, sem personagens e sem alterar Dexie/backup. A última [CI 41438324911](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41438324911) **FAIL global** apesar de 661/661 Vitest e gates estáticos/build PASS: 20/24 E2E PASS; falhas nos cenários BF-4D coleção cheia 1280/390 px e `r4-shell` interação/dez ciclos. #11/#4 seguem abertas, sem prova causal nem CI verde; TalkBack, R-19 e benchmark sustentado pendentes. **Próxima fase BF-4F**; BF-4G não iniciada. [Relatório final](BF-4E_RELATORIO.md).

## BF-4F — Concepção canônica aprovada, sem código (2026-11-02)

**Escopo de produto confirmado:** quatro habitantes completos, **Samael, Aryn, Ytha e Lua**, em vez dos três historicamente mencionados na BF-4A/ADR-012; personagens fantásticos/sobrenaturais, únicos em silhueta/atuação, hábitos e poderes, relacionamentos mútuos e atividades autônomas nos cinco cômodos. **Conversação offline como quests RPG**, com 3–4 alternativas predefinidas por nó decisório, escolhas consequentes, quatro quests individuais e uma compartilhada inicialmente obrigatória — não LLM/chat livre. Autoridade criativa: [BF-4F_CONCEPCAO_HABITANTES.md](BF-4F_CONCEPCAO_HABITANTES.md), decisão de escopo [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md). **Somente documentação aprovada:** sem personagens, modelos, quests ou agentes implementados, nenhum teste/CI/APK da BF-4F. Próximo passo: planejamento e prompt de execução autorizados separadamente. BF-4G, issues #4/#11, R-19 e TalkBack pendentes.

## BF-4F — Plano técnico aprovado, implementação não iniciada (2026-11-02)

O usuário aprovou os quatro checkpoints **F1 (quatro personagens integrados), F2 (animações), F3 (agência/relações), F4 (diálogos RPG/quests)** e **rejeitou um preflight técnico separado por custo de tempo/cota Codex**. Validações de GLB/rigging/importação/animação/ownership serão feitas **dentro da produção de personagem definitivo na F1**, com evidência reaproveitável, sem protótipo descartável. F1 deverá apresentar **Samael, Aryn, Ytha e Lua** visualmente distintos no mundo completo, com seleção/alternativa React, respeitando renderer, BF-4D/E, F5 e Moto G06. Plano operacional: [BF-4F_PLANO_TECNICO.md](BF-4F_PLANO_TECNICO.md). **Ainda nenhuma feature BF-4F executada**; branch/PR, auditoria e gate físico próprios pendentes. Issues #4/#11, R-19 e TalkBack permanecem.

## BF-4F1 — Fechamento dirigido (2026-11-02)

Quatro modelos iniciais integrados, fotos do mundo real no Moto G06 e seleção dos quatro pelo toque e React **aprovados pelo usuário**. Commit `de0bea64718ccfb2501a11f1541d8ac4abca3396`, [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13). Formatação, lint, TypeScript, 667 Vitest, áudio, build e relatório de performance PASS na [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206); **E2E concluídos com **20 PASS, 6 FAIL e 1 flaky; CI global FAIL****. Microgestos de cabeça não equivalem a animação corporal: **F2 é a próxima etapa**. F3/F4, BF-4G, questões #4/#11, R-19 e TalkBack permanecem. As observações anteriores de F1 “aberta” ou “não implementada” são históricas. [Relatório](BF-4F1_RELATORIO.md).

## BF-4F2 — Fechamento e transição para BF-4F3 (2026-11-02)

O usuário atualizou o APK no Moto G06 e confirmou animações ao selecionar personagens e ao tocar nos botões React. Nenhuma regressão/queda de desempenho foi percebida; animações atuais simples aprovadas no recorte F2. Captura pontual indica 60,1 FPS, 16,7 ms/frame e 73 chamadas, sem prova de estabilidade prolongada. [CI 41532160557](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41532160557) global FAIL com 20 PASS, 10 FAIL, 1 flaky E2E, incluindo quatro **novas falhas F2** em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15); não atribuir causa histórica. O usuário autorizou fechamento e merge da [PR #14](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/14) com exceção CI, sem declarar testes globais PASS. BF-4F3 é a próxima fase; F4, BF-4G, TalkBack, R-19 e avaliação sustentada pendentes. Menções anteriores a F1/F2 'não implementadas' descrevem planejamento histórico.

## BF-4F3 — fechamento funcional/artístico dirigido (2026-11-02)

**Aceite humano registrado:** o usuário executou no Moto G06 três procedimentos: **Autonomia PASS**, **Convivência PASS** e **Integração PASS**. O quarto procedimento, **Acidente de Lua NÃO TESTADO**, não foi observado no dispositivo; portanto, não há aceite humano da legibilidade do folio, do acidente nem do reparo. O usuário solicitou expressamente fechar e integrar assim mesmo, mantendo a ressalva. O funcionamento lógico desse ciclo foi coberto em testes automatizados; não se presume aprovação visual.

**Auditoria e CI:** revisão estática da PR #16 favorável sem defeito inequívoco, 690 Vitest PASS relatados localmente e confirmados no pipeline. [CI 41542040077](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) **FAIL global**: E2E 21 PASS, 10 FAIL e 1 flaky; novo cenário F3 passou. Os dez casos com falha correspondem nominalmente aos dez da PR #14 (dois BF-4D coleção cheia, quatro F2, BF-4E, dois shell, reading-area); identidade de causa não comprovada. Issues #4/#11/#15 ainda abertas. Essa exceção CI **não representa gate integrado verde**, nem TalkBack, carga sustentada ou BF-4G concluídos.

**Decisão:** BF-4F3 **concluída no escopo dirigido com ressalva física isolada e exceção CI documentadas**, mediante autorização expressa de merge da [PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/16). A próxima frente planejada é BF-4F4, sob primazia artística e testes proporcionais; só iniciar com checkpoint próprio. Textos históricos sobre F3 “pendente” permanecem cronologia, não autoridade atual.
