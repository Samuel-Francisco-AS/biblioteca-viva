# R5 — Renascimento artístico dos habitantes

07/11/2026. Missão expressamente autorizada pelo proprietário, sobre main `7100ff6e5fecc2f20ade8bfff5c9c4ca5b6b231e`. Merge R4 `960d8cecb94f7de776215e5d91c1dbe16bc65c4a` confirmado na história e PR #39 fechada/integrada pelo conector. Árvore inicial limpa; branch `feat/bv-r5-renascimento-artistico`. Sem merge, release, migração de dados ou fechamento do programa.

## R5A — inventário e concepção

Inventário reproduzível pelo GLTFLoader instalado: `node scripts/inspect-inhabitants.mjs src/features/library/three/assets /tmp/inventory.json`. [Baseline completo](evidence/bv-r5/before.json): hierarquia, materiais, skins, tracks/durações, dimensões, buffers e SHA-256. Sem texturas externas. Os quatro GLBs têm oito clips, zero skins e nenhuma mão deformável ou clip de assento.

| Habitante | Bytes | Meshes | Triângulos | Dimensões X/Y/Z (m) |
|---|---:|---:|---:|---|
| Samael | 315256 | 23 | 5500 | 1,142 / 2 / 0,508 |
| Aryn | 344344 | 22 | 6544 | 0,737 / 1,70 / 0,465 |
| Ytha | 395624 | 27 | 7300 | 1,580 / 1,70 / 0,465 |
| Lua | 352352 | 22 | 6936 | 0,742 / 1,60 / 0,504 |

Ownership: uma árvore por carregamento/montagem; resultado tardio é descartado. Animador usa o RAF do mundo, agência possui posição/yaw e coordenador existente possui reservas. Mão atual é fallback fixo quando busca Bone falha. F2B já demonstrou colisões de roupa/objetos na pose sentada; não promover assento sem sequência completa. R2 e seus seis artefatos aprovados serão preservados.

### Fichas autorais e plano de modelagem

- **Samael:** o modelo antigo tem rosto pequeno, corpo estreito em relação à intenção e chifres discretos. Transformação: massa torácica e mandíbula infernal, chifres recurvos estriados, mãos com dedos/garras, sobretudo dividido com couro e armadura patinada, selos lilás e gola alta. Café e notebook permanecem; magia com brasa e sigilo angular, atuação pesada e reservada.
- **Aryn:** antigo vestido simétrico e orelhas tubulares não exprimem origem élfica. Transformação: face alongada, maçãs altas, orelhas em lâmina esculpida, penteado longo trançado, sobrevestes verdes com painéis marfim e filigrana de restauração, óculos dourados e instrumentos. Gestos cuidadosos e inscrição de sutura dourada.
- **Ytha:** asas antigas planas e poucas veias; rosto/roupa similares às demais. Transformação: asas lobadas com membranas coloridas, nervuras ramificadas e ocelos, vestido de pétalas sobrepostas, tiara botânica, cachos rosa/lilás e flores. Preservar raio mínimo 0,92 m, medir os vértices deformados sem reduzir envelope para liberar caminhos.
- **Lua:** antiga capa acadêmica pouco diferenciada. Transformação: silhueta curta e assimétrica, penteado volumoso azul, casaco ameixa de caudas divididas, gola lunar, broches/ampolas e grimório com ferragens. Glifo orbital fraturado e pequenos cristais; concentração e recuperação de postura sem ciclo de acidentes obrigatório.

Modelagem por superfícies de perfis, curvas afiladas, faces e ornamentação geométrica original em Blender; nenhum asset de terceiros. Fontes editáveis e receita versionadas. Padrões comuns de latão envelhecido, tecido e cristal asseguram universo compartilhado; proporções e construção específicas asseguram identidades. As vistas dos GLBs importados serão a referência de validação; descrição e render de fonte isolada não equivalem a integração.

R5A publica inventário e proposta, sem declarar remodelagem ou rig resolvidos. Blender 3.3.21, Node 24.18.0 e npm 12.0.2 disponíveis. `gh` sem autenticação; conector GitHub disponível. Workflows conferidos: push somente main, pull_request; preview dispatch/push main filtrado. Publicações com `[skip ci]`; nenhum dispatch/rerun autorizado antes de 01/12/2026. CI omitida não é CI verde.

## R5B — remodelagem efetiva

R5A publicada em `9cce068134be07f6954b655bd791f125718a1ff1`, PR draft [#40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40). Quatro GLBs e fontes `.blend` substituídos pela receita autoral `assets/3d/source/inhabitants/build.py`. Nenhuma alteração nos seis modelos pessoais R2. Superfícies com faces, dedos/garras, alfaiataria, bordados, materiais metal/tecido, mechas, acessórios e magia geométrica estão efetivamente nos GLBs.

[32 capturas pareadas GLTFLoader/WebGL](evidence/bv-r5/portraits/): antes/depois de cada personagem em frontal, três-quartos, noite e magia; mesma câmera e luz por par. `scripts/capture-inhabitants.mjs` reproduz; o antes pode ser extraído com `git show 7100ff6:src/features/library/three/assets/<nome>.glb` para `/tmp/bv-r5-before/`. Não são ilustrações conceituais nem render de fonte divergente. Modelos anteriores permanecem na história Git. [Inventário novo](evidence/bv-r5/after.json) identifica os bytes exatos.

Samael ganhou chifres recurvos estriados, ombreiras infernais, garras e face de obsidiana; Aryn tem gown pregueado, tranças/mechas longas, orelhas laminares e ferramentas de restauração; Ytha tem asas opalinas lobadas, nervuras/ocelos, coroa floral e vestido de pétalas; Lua tem cabelo de nó lateral/franja assimétrica, gola lunar, saia assimétrica, ampolas e grimório com ferragens. Faces e proporções são parametrizadas por espécie, com olhos/íris/pupilas/pálpebras e sobrancelhas modelados, não texturas pintadas.

A estrutura de skin foi produzida junto da modelagem para preservar continuidade das superfícies; sua integração/contratos são publicados separadamente em R5C. A regressão de picking detectada nos quatro modelos foi corrigida: `SkinnedMesh.updateMatrixWorld` atualiza bind inverso, diferente do caminho `updateWorldMatrix` anterior. Somente hierarquias selecionáveis são atualizadas, com bounds deformados recalculados no tap. Não se voltou à travessia da decoração inteira por input.

Inspeção das imagens realizada, sem aprovação humana automática. Estilo permanece estilizado geométrico; sem morph targets faciais, tecido simulado ou dedos independentes. O usuário deve avaliar beleza, personalidade, riqueza e leitura ortográfica de cada um separadamente. A candidatura não chama esse resultado de arte final aprovada.

## R5C — rigs, sockets, animação e limites físicos

R5B publicada em `c49b089748b7c142143a99eff5d370eadc0e6639` antes desta integração. Um esqueleto por personagem: Facing → Pelvis → Torso → Head/ShoulderL/R; Shoulder → Elbow → Hand; Pelvis → Hip → Knee. Magic pertence a Facing; Ytha acrescenta WingL/R em Torso. **15/17 bones reais**, uma skin compartilhada entre meshes do mesmo personagem, pesos suaves em cintura/cotovelos/joelhos e superfícies rígidas apropriadas nos acessórios. Nenhum bone fictício criado para satisfazer contagem.

Oito clips reconstruídos: idle 3,6 s; walk 3,2; turn 2,4; react 1,8; gesture 2,8; work 4; magic 3,6; recover 2,4. Continuam no mesmo `createInhabitantAnimator`, crossfade 220 ms, relógio RAF e agência. Sem root motion concorrente, novo lease ou scheduler. Orientação local de Facing corrigida na autoria para yaw; testes de vértices deformados detectaram a inclinação acidental antes da publicação B.

`socket_carry` é filho de **HandL**; `socket_hand_right` de **HandR**; `socket_seat` de **Pelvis**. Resolver produtivo usa o nome explícito, sem escolher arbitrariamente o primeiro bone por regex. Compatibilidade de fallback mantida só para modelos indisponíveis/legados; resultado de load invalida o cache. Teste comprova substituir fallback pelo socket real. Descarte agora deduplica Skeleton e libera sua boneTexture, além dos materiais/geometrias/texturas da árvore.

**Provas dirigidas: 33/33 PASS em cinco arquivos.** Pesos normalizados, mais de 20 vértices com influência múltipla por modelo, mais de 100 vértices realmente deformados, socket acompanha mão em clip real, payload filho acompanha contato sem alterar wrapper, descarte de boneTexture uma única vez, clips/transições/redução, navegação/envelopes e picking dos quatro GLBs. O teste antigo de envelope passa a aplicar `applyBoneTransform` a cada vértice antes da matriz mundial; não confunde bind pose com pose deformada. Os raios existentes permanecem, inclusive Ytha 0,92 m.

### Capacidades investigadas e preservadas

- Aproximação/orientação, reserva exclusiva, pegar/transporte/colocar/recolher/devolver do livro cenográfico continuam na agência/coordenador existentes; passam a obter contato da mão animada real em vez de âncora fixa. Livro pessoal de sessão continua seu percurso aéreo F2A, sem transferência automática para mãos.
- Demonstração unitária de payload anexado comprova seguimento do socket. **Não comprova IK, fechamento independente dos dedos ou alinhamento exato da palma ao volume de todo objeto.** Os acessórios autorais permanecem junto às mãos; resolver ocupação por acessório e empunhadura específica requer próxima coreografia. Não chamar esta prova de preensão anatômica completa.
- Assento: a fonte agora tem pelve/coxa/joelho deformáveis e socket anatômico, mas roupas e acessórios precisam prova contra cada cadeira, além de rota, alinhamento, lease, descida, estabilidade, subida, cancelamento e retorno. Nenhum clip sit foi publicado nem fluxo inseguro de sentar ativado. A evidência F2B anterior de interseções não foi anulada pela skin. **Leitura sentada e BF-5.5F2B/F2C continuam não entregues.**
- Rosto modelado, sem blendshapes ou rig facial; mãos deformam com bone de palma, dedos não articulam individualmente. Magia de Lua não dispara acidentes repetitivos. Pele/roupa não são simulação física. Não se promete ausência universal de interpenetrações em toda combinação de gesto/móvel.

Falhas novas de desenvolvimento: agrupamento Blender retinha objetos removidos após join, referência de material incorreta, ações órfãs de personagens anteriores exportavam clips extras, bind inverso desatualizado no picking e Facing inicialmente inclinava em vez de girar. Causas corrigidas com evidência dirigida, sem supressões, retries ou aumento de timeout. Separadas do E2E R2 histórico, que não foi reexecutado.

## R5D — pipeline e consolidação

R5C publicada em `2e50bbf` antes da consolidação. [Contrato completo de autoria/exportação/validação/integração](../INHABITANT_ART_PIPELINE.md). Comandos npm `assets:inhabitants:build`, `assets:inhabitants:inspect` e `assets:inhabitants:check` tornam a receita e seus gates explícitos. Manifest voltou a representar a geração vigente; recipe atualiza-o após exportação. `.blend`, fonte e GLBs versionados; terceiros não incorporados. PNGs F1 antigos nas fontes permanecem históricos, não prévias R5.

### Custos observados

| Habitante | Bytes R4 → R5 | Meshes R4 → R5 | Triângulos R4 → R5 | Skin / bones R5 |
|---|---:|---:|---:|---:|
| Samael | 315256 → 1312488 | 23 → 9 | 5500 → 26566 | 1 / 15 |
| Aryn | 344344 → 1852552 | 22 → 9 | 6544 → 44922 | 1 / 15 |
| Ytha | 395624 → 1913216 | 27 → 11 | 7300 → 44456 | 1 / 17 |
| Lua | 352352 → 1264600 | 22 → 9 | 6936 → 25034 | 1 / 15 |

Soma GLBs: 1.407.576 → 6.342.856 bytes; 94 → 38 meshes; 26.280 → 140.978 triângulos. Zero texturas nos personagens, 38 materiais no conjunto. Dimensões completas em after.json; asas/corpo/acessórios de Ytha têm largura total em repouso ≈1,508 m, e o teste de todos os vértices deformados de todos os clips conserva o envelope 0,92 m. Os demais raios também não mudaram.

[CPU de animação/carregamento dos quatro simultâneos](evidence/bv-r5/animation-costs.json): 60 frames de aquecimento + 300 amostras, mixers/matrizes/paleta de skin; sem render. P50 conjunto 0,062 → 0,124 ms, P95 0,172 → 0,387 ms; P99 5,923 → 3,224 ms. Parse isolado por GLB ≈13–51 ms antes / 28–37 ms depois, exclui disco/rede/upload. Amostras host com JIT/GC/carga do sistema, sem inferência de significância ou ganho físico. Heap do processo ≈13,4 → 18,6 MB não é retenção após GC, memória GPU ou custo isolado dos assets. Host tinha ≈8,2 GB totais / 2,8 GB disponíveis; **nenhum aparelho ADB conectado**, memória disponível Android desconhecida.

[Capturas e contagens do mundo antes](evidence/bv-r5/world-before/metrics.json) / [depois](evidence/bv-r5/world-after/metrics.json), quatro habitantes carregados, mesmo mundo fictício e câmera por cenário. Nas quatro vistas próximas, draw calls: Samael 137 → 122; Aryn 97 → 84; Ytha 105 → 89; Lua 110 → 97. Triângulos renderizados: 153192 → 174042; 147764 → 186142; 137900 → 175062; 150764 → 168862. Buffers de atributos/indexação inventariados no mundo: 2.187.380 → 5.618.616 bytes. Mais geometria/skin e menos objetos/calls são custos explícitos, não razão preventiva para remover arte. Transparência/paleta/shaders também custam; medir no aparelho. Zero pageerrors e teardown disposed/zero canvases nas duas capturas. CPU SwiftShader não mede GPU Android; tempos de capturas sob carga não são benchmark controlado.

### Gates e investigação de falhas

[Saídas locais completas](evidence/bv-r5/local-gates.json) preservam primeira rodada e verificações finais. Primeira ampla: **948 PASS / 2 FAIL**, ambos timeouts novos nos envelopes deformados Aryn/Ytha sob carga host. A amostragem original recalculava world × inverseBind por influência de cada vértice. Cache por pose preserva todos os vértices, quatro influências, 33 amostras/clip e limites, evitando produto matricial redundante; não ampliou timeout, retirou assert nem mudou geometria. Após correção: **23/23 dirigidos PASS**. Rodada final ampla registrada abaixo quando concluída. Falha E2E R2 histórica preservada, sem retries/sleeps ou alteração arbitrária de prazo.

Lint inicial também apontou imports explícitos de process/performance/globalThis em scripts e tipo genérico inseguro do teste; corrigidos com imports e validação de tipos sem casts cegos ou suppressions. Não foram falhas de CI remota: nenhuma execução solicitada por esta missão.

Rodada ampla corrigida, sem renderer concorrente e com `--maxWorkers=2`: **950/950 testes PASS em 150 arquivos**. Contagens/amostras de envelope preservadas; tempos não são gate de performance Android. Revisão final acrescentou regressão de highlight após gesto e deslocamento: personagens precisam bounds precisos da pose atual, não cache de bind pose. O cálculo percorre somente o personagem selecionado; objetos estáticos conservam seu caminho de bounds. Picking mantém atualização restrita aos selecionáveis.

O gate físico/artístico está em [MOTO_G06.md](evidence/bv-r5/MOTO_G06.md). Nenhum teste manual, instalação, TalkBack, áudio percebido, memória/fluidez sustentada foi alegado. A aceitação histórica de R4 e dos artefatos R2 não aprova esses novos habitantes. F2B/F2C, rig facial/dedos individuais, coreografia de preensão/ocupação de acessórios e assento completo permanecem limitações explícitas.

### Resultado final local e E2E

`npm ci`, audits produção/completo (zero vulnerabilidades), formato, lint global, tipos, áudio, build web, performance:report, Android sync/debug e diff --check **PASS**. Suite ampla corrigida **950/950 PASS**, dirigida de assets **23/23 PASS**, seleção/highlight/interação final **12/12 PASS**. Ver contagens exatas nas saídas preservadas. Após alteração exclusiva dos E2E, lint dirigido e formato repetidos; nenhum produto foi mudado para fazer teste passar. Mantidos warnings de chunk >500 kB e Gradle flatDir.

E2E dirigido (dois cenários BF-4F1 existentes): primeira execução **0 PASS/2 FAIL**. React clicou Samael e abriu a conversa RPG (snapshot mostrava o heading e respostas), enquanto o teste procurava aria-pressed no painel oculto; Canvas projetava com zoom 0,7/distância 1, divergentes do runtime composto 1/10. Testes ajustados para seguir a conversa/adiamento e câmera atual, **mantendo assertions de aria-pressed/seleção/highlight, acrescentando heading e sem ampliar prazos**. Uma única execução após a correção: **0 PASS/2 FAIL por deadline global de 30 s**. React chegou ao assert Canvas de Samael com seleção vazia; Canvas esgotou prazo em boundingBox. A correção da preparação não aprovou os fluxos completos. Não atribuir causa exclusivamente ao runner nem declarar ausência de regressão; permanecem cobertura/investigação E2E abertas, separadas do FAIL R2 histórico (não reexecutado). Traces finais preservados localmente em `test-results/`; contextos sanitizados e logs em evidence/bv-r5. Nenhum retry automático, sleep ou timeout aumentado.

Vista ampla `all-four`: quatro habitantes carregados/atualizados nas posições reais, **não quatro visíveis no mesmo frustum**. Draw calls 369 → 341; triângulos renderizados 197312 → 256540. O culling produtivo foi preservado, sem rearranjar personagens para produzir benchmark artificial. Custo de animação dos quatro é medido separadamente no diagnóstico CPU. Texturas GPU no mundo variam de 4–5 antes para 6–9 depois (paletas de skin alocadas conforme visibilidade, além de texturas ambientais); zero texturas de superfície nos GLBs não significa zero texturas GPU. Os totais CPU da etapa inhabitants são seis frames por cenário, não tempo por frame nem GPU.

APK debug atualizado: `android/app/build/outputs/apk/debug/app-debug.apk`, **10.352.166 bytes**, SHA-256 `725142bb5a890062cec6518cc0a30d215d35d357d6239d52f8c30fb6d0fea5ea`. A autoridade do checksum é [apk.json](evidence/bv-r5/apk.json); não foi instalado. Logs sanitizam prefixos do checkout/home, sem omitir erros. APK, dados pessoais e traces brutos não versionados.

### Publicação e estado

R5A `9cce068134be07f6954b655bd791f125718a1ff1`; R5B `c49b089748b7c142143a99eff5d370eadc0e6639`; R5C `2e50bbf018ea3499f9a91243b4682af4b773b2db`; R5D é o commit que publica esta consolidação, identificável na PR e `git log --format=%H --grep='R5D' -1`. Uma única [PR draft #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), baseada em main, publicações sequenciais `[skip ci]`. Workflows não alterados, nenhum dispatch/rerun/merge. Consulta de runs de PR associadas a C retornou vazia; ferramenta limitada a runs de PR, não prova aprovação nem auditoria de faturamento. **Sem CI global verde.**

**R5A–D candidata técnica/artística publicada para revisão, não encerrada.** O proprietário deve avaliar os quatro personagens independentemente e executar o roteiro físico; ainda poderá exigir remodelagem/refinamento. Recuperação integral, gate físico/artístico/assistivo, cobertura E2E, memória física e BF-5.5 parcial permanecem abertas. Não há beta, release, dados/schema/backup alterados ou merge na main.
