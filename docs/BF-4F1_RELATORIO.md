# BF-4F1 — quatro habitantes: conclusão no escopo dirigido

Data: 2026-11-02. **Fase concluída no escopo visual e de integração dirigido, com merge da PR #13 expressamente autorizado pelo usuário.** As seções abaixo registram a situação inicial da candidata; a decisão final e suas ressalvas estão ao fim.

## Entrega efetiva

Samael, Aryn, Ytha e Lua têm fontes Blender editáveis, GLBs autocontidos e integração no mundo composto. Identidades estão em `inhabitants.ts`, representação/ownership em `three/inhabitantVisuals.ts`; `ThreeWorldRuntime` somente monta, atualiza e libera esse owner. `WorldHost` oferece nomes, descrições e seleção semântica mesmo sem WebGL. Não há alterações de domínio, Dexie, backup ou registros pessoais.

- Samael: 2 m incluindo chifres, ombros largos, casaco carvão, fissuras lilás, notebook e café.
- Aryn: 1,70 m, orelhas élficas, cabelo escuro preso, óculos, traje verde/creme, avental com instrumentos e livro cenográfico.
- Ytha: 1,70 m, cabelo rosa, duas asas com lobos de borboleta, nervuras, saia de pétalas e flor.
- Lua: 1,60 m, cabelo azul-escuro, óculos claros, capa acadêmica vinho, grimório com crescente e lápis.

As prévias individuais estão em `assets/3d/source/inhabitants/{samael,aryn,ytha,lua}.png`. Elas mostram os modelos reais das fontes, com iluminação Blender; não comprovam legibilidade no aparelho. Os modelos são candidatos aproveitáveis, **não uma declaração de que o contrato artístico foi integralmente satisfeito**.

## Autoria e exportação

`assets/3d/source/inhabitants/build.py`, quatro `.blend`, `render.py` e README registram autoria original por Codex sob direção do solicitante. Não foram usados assets externos nem downloads/licenças de terceiros; não se altera o licenciamento do repositório. Ferramenta disponível: Blender 3.3.21 CLI. O aplicativo usa Three/GLTFLoader já instalados, sem novas dependências.

Geometria de perfis, superfícies, curvas e volumes modela roupas, anatomia e acessórios. Cada fonte guarda peças separadas editáveis. GLBs ficam em `src/features/library/three/assets/`. Exportação agrupa peças por material e pai após salvar o `.blend`: medida localizada motivada por lentidão dos primeiros testes WebGL, preservando aparência e microgesto.

A articulação F1 é rígida por nó Head, com clip importado e `AnimationMixer`; não é skinning nem um rig completo. Evita introduzir pesos/esqueleto sem repertório corporal nesta fase. F2 ainda precisará de autoria de articulação corporal; esta entrega não comprova essa etapa. A normalização inicial apresentou deslocamento da cabeça, corrigido na fonte atual; o teste real de parse verifica as quatro alturas e apoio no piso sem correções de runtime.

## Integração e lifecycle

Posições iniciais A/B/C/D, sem exclusividade de cômodos: Samael (-2,1), Aryn (-13,-8), Ytha (12,4; -10,4), Lua (-13,10), no plano X/Z. Cinco cômodos e quatro passagens permanecem. IDs `character:*` não têm `entryId`. Catálogo inclui os quatro mesmo durante loading/falha; carregamento bem-sucedido atualiza highlight já selecionado. Picking considera profundidade de personagens/objetos vivos e mantém prioridade de registros/estantes em empate. Nenhum personagem é anexado a F5 ou ao caminho legado BF-2.

Owner por montagem, sem cache global. Sucesso tardio após dispose libera a árvore; falha de arquivo deixa o restante do mundo operante e a seleção textual disponível. Nova montagem tenta novamente. Não há botão individual de retry nem mensagem individual de falha de asset na interface nesta versão (limitação). O owner interrompe mixers, remove bindings e libera árvores de forma idempotente. Não existem skeletons/bone textures a liberar. Animação usa o RAF existente, pausa/resume existentes e delta limitado; reduced-motion congela o microgesto.

## Limites artísticos e técnicos

Os rostos são simplificados e compartilham linguagem de construção; proporções, roupas, asas, orelhas, cabelo e acessórios individualizam os candidatos, mas precisam de revisão artística. A aura é apenas sugerida por pequenos elementos emissivos: a aura negra de Samael usa fitas translúcidas, e as asas de Ytha usam alpha PBR; a percepção de fumaça/luz feérica ainda requer refinamento e gate humano. Não declarar F1 concluída com essas pendências. As asas são rígidas e translúcidas; não há repertório F2, agência, diálogos ou quests.

Bounds físicos e ausência de cruzamento com passagens/slots não provam ausência de sobreposição projetada em todos os zooms. Densidade, alvos pequenos, custo GPU, qualidade do rosto e percepção das assinaturas precisam do Moto G06. Não existe aprovação de TalkBack, R-19, desempenho sustentado ou beta/release.

## Verificações

Resultados finais são registrados abaixo após os comandos. A rodada inicial teve 2 falhas unitárias por contagens antigas (86/96 → 90/100), corrigidas mantendo as asserções de identidade. A rodada seguinte passou 85 arquivos/666 testes. Os testes novos fazem parse dos quatro GLBs reais, bounds/altura/clip, eventos de descarte, late load, isolamento e falha de carga. E2E acrescenta seleção React com/sem WebGL e picking dos quatro.

Contagens E2E passam a incluir quatro habitantes (19 → 23, 96 → 100 e estantes+10 → estantes+14); isso é mudança esperada do catálogo, não relaxamento de assert. Não foram usados skip, retries novos ou alteração de timeout. Falhas históricas #4/#11 permanecem abertas e não se presume que toda falha nova tenha a mesma causa.

## Construção e validação física

Da raiz: `npm run android:build:debug`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Instalação no aparelho conectado: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`; não limpar dados. Não foi executada instalação física pelo Codex.

1. Abrir Biblioteca em retrato e paisagem; identificar cada personagem pela silhueta antes de ler o nome. Conferir altura, rosto, roupa, acessórios, asas, aura e legibilidade em zoom normal/aproximado. Registrar PASS/FAIL individual e screenshots fictícios.
2. Selecionar os quatro pelo canvas e pelos botões Habitantes. Confirmar feedback único e alternância com livros, seis tipos de registro e objetos BF-4E; abrir/editar/retornar registros.
3. Percorrer os cinco cômodos e quatro passagens com pan/pinch/zoom; conferir paredes, estantes e móveis sem interseção grave. Avaliar oclusões e alvos ao toque.
4. Girar aparelho, enviar app ao background/retomar, sair/entrar repetidamente. Confirmar ausência de duplicação e microgesto pausado; testar movimento reduzido.
5. Validar fallback sem WebGL, ordem/foco/leitura TalkBack e seleção por nome. Registrar desempenho sustentado e aquecimento no Moto G06, sem extrapolar medições de fixtures F5.
6. Submeter código/assets à revisão independente e refinamento artístico antes de qualquer aceite F1. Sem merge nesta entrega.

### Custo observado e correções locais

A primeira exportação agrupada tinha 79.308 triângulos nos personagens. A exportação atual reduz amostragem de curvas e superfícies mantendo as peças: 26.280 triângulos, 49 meshes, 774.356 bytes GLB no total (hashes em `manifest.json`). O trace Chromium de uma rodada concorrente registrou 0,7 FPS com o mundo completo e a exportação anterior: evidência de ambiente automatizado lento, **não medição do Moto G06 nem prova da causa única dos timeouts**. Não se inferiu desempenho físico aceitável. Nenhum timeout foi ampliado. O picking real por `ThreeWorldInteraction` também foi testado com os quatro GLBs, projeção ortográfica e eventos de toque no jsdom, sem renderer simulado substituir a geometria.

### Arquivos de implementação e evidência

- Novos: `src/features/library/inhabitants.ts`, `three/inhabitantVisuals.ts` e `three/inhabitantVisuals.test.ts` (os dois últimos sob `src/features/library/`).
- Integração: `src/features/library/WorldHost.tsx`, `three/ThreeWorldRuntime.ts`, `three/ThreeWorldInteraction.ts` e regressões em `three/ThreeWorldRuntime.d1.test.ts`.
- Browser: `e2e/bf4-inhabitants.spec.ts`; contagens ajustadas em `e2e/bf4-environment.spec.ts` e `e2e/r4-shell.spec.ts`, sem remoção de assertivas.
- Assets: quatro GLBs sob `src/features/library/three/assets/`; quatro fontes `.blend`, quatro PNGs, receita `build.py`, prévia `render.py`, README de autoria e `manifest.json` sob `assets/3d/source/inhabitants/`.
- Contratos: STATUS, ROADMAP, CHANGELOG, README documental, WORLD, TESTING, ART_DIRECTION, ASSET_PIPELINE, concepção/plano BF-4F, plano BF-4 e extensão localizada da ADR-010.

O painel Habitantes fica fora de `living-world-stage`, para não deslocar o feedback absoluto dos objetos BF-4E ao abrir as descrições.

Capturas do mundo real integrado (Chromium, dados fictícios): [visão geral/Samael](evidence/bf4f1/world-overview.png), [Aryn](evidence/bf4f1/world-aryn.png), [Ytha](evidence/bf4f1/world-ytha.png), [Lua](evidence/bf4f1/world-lua.png). O README adjacente distingue captura disponível de resultado do teste completo.

### Regressão investigada durante o gate

A introdução dos habitantes no início do catálogo fez o botão genérico “Próximo” selecionar Samael antes da estante. Isso causou falhas reais nos E2E desktop e orientação, com `character:samael` recebido em lugar de `reading-shelf-01`; **não era dívida histórica**. A correção mantém `character:*` fora da navegação anterior/próximo dos objetos, assim como `living:*` já era separado. Os personagens continuam selecionáveis pelo painel nominal e canvas. `WorldHost.test.tsx` cobre catálogo precedido pelos quatro habitantes e retorno à navegação de objetos após seleção de personagem. Os asserts E2E de estante/orientação foram preservados.

## Fechamento BF-4F1 — gate físico dirigido aprovado (2026-11-02)

**Aceite e autorização:** o usuário instalou no Moto G06 o APK da branch e apresentou quatro capturas reais, com Samael, Aryn, Lua e Ytha em diferentes cômodos. Considerou **os quatro modelos iniciais bons** e confirmou que **todos são selecionáveis diretamente pelo cenário 3D e pelo painel React**, sem regressão de seleção de livros/objetos percebida no teste dirigido. Autorizou expressamente **aprovar a integração, encerrar BF-4F1 e realizar merge da [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13)**. Isso constitui **PASS físico/artístico dirigido**, não teste exaustivo de todas as funcionalidades.

**Escopo aceito:** quatro personagens distintos, arquivos GLB e fontes Blender editáveis, alturas e silhuetas próprias, integração no mundo de cinco cômodos, picking canvas e alternativa textual React; lifecycle próprio e microgestos técnicos. A ausência de **animações corporais perceptíveis** foi observada e aceita porque esses movimentos pertencem à **BF-4F2**. A F1 contém somente clip leve de cabeça via `AnimationMixer`, não caminhada, gestos completos, magia, rotinas autônomas ou quests.

**Desempenho observado:** as quatro capturas do Moto G06 indicam cerca de **60,0–60,1 FPS e 16,7 ms/quadro** pontualmente. **Não** comprovam FPS sustentado, comportamento térmico, RAM/GPU sob carga ou coleção cheia.

**CI remota [run 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206):** os gates de formato, ESLint, TypeScript, **667 Vitest**, áudio, build e relatório de performance **PASS**. Os **E2E concluíram com 20 PASS, 6 FAIL e 1 flaky; CI global FAIL**. Falharam: coleção cheia 1280/390px da BF-4D, segredo completo BF-4E, interação desktop e dez ciclos do shell R4, e abertura/edição/retorno dos seis tipos; não atribuir toda falha a problemas antigos sem prova. A regressão de botão “Próximo” que selecionava Samael foi corrigida antes do commit, mas deve permanecer sob auditoria de CI. Issues #4/#11, R-19, TalkBack e testes de estabilidade permanecem abertos.

**Reservas artísticas:** rostos, auras, asas, poses, transições e expressividade podem ser refinados nas etapas próprias. O aceite dos modelos iniciais não implica conclusão de F2/F3/F4, BF-4G, beta ou release. As recomendações de testes ainda pendentes acima são **gates adicionais futuros**, não invalidação do aceite dirigido concedido.

**Próximo checkpoint: BF-4F2 — animações e expressividade dos quatro habitantes**, reaproveitando a modelagem existente sem preflight independente. Não criar automaticamente branch/PR da F2 sem instrução. **F1: CONCLUÍDA por autorização do usuário.**

**CI concluída após o início da documentação:** [run 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206) final **FAIL global**. Gates não E2E PASS, **667/667 Vitest em 85 arquivos**; Playwright **20 PASS, 6 FAIL e 1 flaky**. Falhas: BF-4D coleção cheia 1280/390; BF-4E segredo completo; R4 shell interação desktop e dez ciclos; reading-area seis tipos abrindo/editando/retornando. Flaky: BF-4D orientação/zoom/pan/seleção. Causas e regressões ainda não demonstradas. Este resultado não invalida o aceite dirigido do usuário nem autoriza declarar CI verde; todos esses cenários exigem triagem rastreável antes de gate integrado/release.
