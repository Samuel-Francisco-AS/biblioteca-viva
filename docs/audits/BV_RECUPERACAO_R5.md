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
