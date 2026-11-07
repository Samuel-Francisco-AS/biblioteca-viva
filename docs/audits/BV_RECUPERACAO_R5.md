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
