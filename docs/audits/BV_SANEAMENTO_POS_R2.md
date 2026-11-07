# Saneamento pós-R2 — Livro da Estrela e quatro registros

Rodada de 06/11/2026, PR draft [#38](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/38), branch `perf/bv-recuperacao-integral`. Base local/remota sincronizada e limpa: `10c664c95a4edd94e7b59b856ae02bdc80996748`. O SHA publicado desta rodada é consultável no histórico da mesma PR; não há merge nem encerramento da recuperação. **R3/R4/R5 não iniciadas nesta rodada. Próximo passo recomendado: novo teste no Moto G06.**

## Feedback e limites

O proprietário confirmou no Moto G06 melhora do Canvas, ainda com lag/travamentos, oscilação da capa do Livro da Estrela e necessidade de refinar quatro representações. Isso é evidência humana da R2 anterior, não aprovação desta candidata. `adb devices -l` nesta rodada: nenhum aparelho conectado. Sem medição física/GPU, TalkBack, áudio percebido, APK/Android sync ou fluidez mobile declarada.

Stack, seis tipos, esquema Dexie/backup, IDs, posições/slots, organização, mobília e habitantes preservados. A intervenção no controlador existente é somente a correção do livro; não é início da reforma de loop/agência R3.

## Livro da Estrela: reprodução e correção

O livro afetado é **`living:book`**, cenográfico; não é um volume pessoal da coleção. Não havia uma máquina explícita opening/closing nem clamp oscilante: `LivingSession.active` guarda a intenção, e a capa interpola até 0 ou 2,1 rad.

Reprodução automatizada na base: um `toggle`, seguido de 120 frames na ordem real do runtime (`driveInhabitantInteractions` antes de `update`, delta 1/60). Estado lógico aberto, mas capa em **0,315 rad**, em vez de 2,1. O controlador de transporte copiava a rotação fechada **a cada frame sem interação de NPC**. A animação só conseguia realizar o primeiro passo novamente. O teste anterior chamava apenas `update` com movimento reduzido e não exercitava esse conflito.

Correção em `three/livingVisuals.ts`:

- Retorno restaura posição/quaternion da root uma vez, somente se houve deslocamento por transporte. A articulação da capa pertence a `update`, inclusive quando o livro foi pousado. Não restaura a capa fechada em repouso.
- Transporte mantém capa e página recolhidas e suspende sua animação enquanto a agência controla o objeto. Uma intenção recebida durante transporte continua válida após pouso/retorno, sem disputar a pose de transporte.
- Abertura/fechamento interpolam com o delta limitado existente, convergem e assentam exatamente no alvo com tolerância de 1e-5 rad. Retirada a oscilação auxiliar de X da capa; a animação articulada de abertura/fechamento e das páginas permanece.
- Comandos rápidos usam a última intenção: dois toggles antes do frame resultam em fechado; um toggle durante a transição reverte a direção continuamente. Sem timers, filas de toggles ou input duplicado novo.
- `turn` não abre um livro fechado: comando recusado no modelo e botão desabilitado nos dois menus. Com abertura solicitada, uma página pode ser solicitada; o movimento espera a capa alcançar 2,09 rad. Ao fechar, páginas retornam ao repouso. `examine` não altera a intenção.
- Os dois menus usam `aria-pressed` no toggle para a mesma intenção aberta/fechada. O botão de página acompanha essa intenção; não promete transição instantânea. Seleção sozinha não executa toggle.

Regressões: reprodução de 120 frames; abrir/fechar; duplo clique rápido; quatro ciclos de alternância; reversão durante abertura/fechamento; examinar/página concorrentes; limites finitos da capa; movimento reduzido; transporte/pouso/retorno do original com intenção aberta; runtime completo pausado durante abertura, frame tardio sem movimento, retorno com conclusão e fechamento, seleção/highlight preservados. UI cobre menus contextual/alternativo, estado pressionado, página desabilitada e ausência de toggle na seleção inicial. O sistema de livros pessoais mantém seus testes de sessão/capacidade.

## Representações

- **Estudo:** mesinha pessoal verde/latão com quatro pernas e pés, cadernos abertos com linhas, outro caderno, tinteiro/pena e cristal de teorema suspenso em aro. O conteúdo de estudo domina o tampo; não é a mesa decorativa da sala.
- **Trabalho:** estojo de ofício ameixa aberto, tampa com interior escuro, ferragens/fechos, malhete, formão, planta e régua. Silhueta de caixa de instrumentos, distinta da bancada ambiental.
- **Filmes:** projetor com dois rolos, lente emissiva mais legível e pequena memória luminosa em moldura/perfurações de película. Material emissivo sólido; nenhuma luz dinâmica, transparência, shader especial, pós-processamento ou atualização por frame adicional.
- **Atividade física:** dois halteres de ferro/latão em suporte compacto de duas alturas. Discos e pegadores reconhecíveis; substitui kettlebell/tapete, sem alterar o banco de treino ambiental.

Assets dessas quatro categorias recebem IDs de revisão v2. Livro pessoal e série conservam seus designs. Dimensões externas e perfil espacial aprovado de cada slot permanecem iguais: Estudo 1,232×1,056×0,8 m; Trabalho 1,2×1,05×0,8 m; Filme 1,296×1,2×0,48 m; Atividade física 0,92×1,18×0,8 m. Footprint navegável da atividade permanece o anterior, 0,54 m de profundidade. Sem persistência espacial nova.

Caixas pequenas usam duas subdivisões por eixo para o arredondamento em vez de quatro; o helper conserva quatro como default para o restante do mundo/série. Filme substitui tubo curvo por tira e reduz tesselação dos aros; discos de halteres usam dez lados. Mantidos acabamento, metais e batches por material. Tests de picking de Estudo/Atividade apontam agora para o tampo/pegador reais, em vez de um ponto que passou a ser espaço vazio; asserções de identidade/highlight não foram retiradas.

## Custo pareado

[Dados antes](evidence/bv-post-r2/before/metrics.json) · [dados depois](evidence/bv-post-r2/after/metrics.json) · [comparação visual](evidence/bv-post-r2/comparison.png).

Por **uma representação montada**, após o batch estático já existente:

| Categoria | Triângulos potenciais antes→depois | Meshes antes→depois | Materiais antes→depois | Calls locais, inteiramente visível |
|---|---:|---:|---:|---:|
| Estudo | 1.824→936 | 5→5 | 5→5 | 5→5 |
| Trabalho | 1.664→896 | 5→5 | 5→5 | 5→5 |
| Filmes | 2.596→1.256 | 5→4 | 5→4 | 5→4 |
| Atividade física | 1.560→1.128 | 4→4 | 4→4 | 4→4 |
| Soma, uma de cada | 7.644→4.216 (−44,8%) | 19→18 | 19→18 | 19→18 |

Calls locais decorrem de um batch opaco por material, sem passe extra. As calls efetivamente medidas do **mundo completo**, por vista, são:

| Foco | Normal: calls / triângulos antes→depois | Próxima: calls / triângulos antes→depois | Próxima com destaque: calls antes→depois |
|---|---|---|---|
| Filmes | 238→237 / 181.572→180.232 | 118→117 / 149.704→148.364 | 119→118 |
| Estudo | 148→147 / 159.736→156.620 | 112→112 / 149.012→147.236 | 113→113 |
| Atividade física | 120→120 / 153.896→153.032 | 104→104 / 148.844→147.980 | 105→105 |
| Trabalho | 121→121 / 146.608→145.072 | 86→86 / 142.312→140.776 | 87→87 |

Mesmo cenário completo: quatro GLBs, 12 livros, dois registros de cada outra categoria, quatro pergaminhos, edifício, mobília, objetos vivos e efeitos. **241.554→234.698 triângulos potenciais**, meshes **628→626**, materiais **191→189**, arrays geométricos CPU **2.326.308→2.187.380 B**. Luzes existentes 13→13; texturas por vista mantidas (4 na primeira vista). Os buffers não medem RAM/VRAM totais. Culling por material pode alterar o subconjunto desenhado; a queda de calls de Estudo normal inclui outros objetos no frustum.

Método: `scripts/measure-world-render.mjs`, modo `post-r2`, Chromium/SwiftShader headless, 1280×900, DPR1, antialias, quadros manuais de delta zero, mesma câmera/foco XZ/zoom 1 e 2,2. Cada categoria possui **normal, próxima sem destaque e próxima com destaque**, antes/depois; 24 PNGs no cenário integrado, sem cena vazia. As métricas temporais brutas são diagnósticas e não isoladas de outros processos; **não são usadas para alegar ganho de CPU/FPS/GPU/input**. Nenhum aumento de calls ou geometria desenhada nas 12 vistas comparadas. Aceite artístico/mobile permanece humano.

Reprodução (fora da CI, sem loop):

```sh
node scripts/measure-world-render.mjs docs/audits/evidence/bv-post-r2/before post-r2-before 10c664c95a4edd94e7b59b856ae02bdc80996748 post-r2
node scripts/measure-world-render.mjs docs/audits/evidence/bv-post-r2/after post-r2-after '' post-r2
```

O plugin repõe fontes visuais/runtime da referência antes do Vite transformar; a API adicional de tesselação mantém o default anterior. As capturas depois correspondem à geometria final e ao assentamento da capa; a última proteção de página recolhida durante transporte foi testada depois, sem afetar estas vistas estáticas. Câmera e contagens físicas dos slots não mudaram. Capturas sem pageerrors; dispose termina com zero canvas e estado disposed.

## Gates e falhas

Rodada final: **129/129 PASS em 13 arquivos**, `--no-file-parallelism`, 42,90 s. Gates `npm run lint`, `npm run typecheck`, `npm run build`, `npm run format:check`, `npm run performance:report` e `git diff --check`: **PASS**. Após o ajuste final do enquadramento no script, lint dirigido do script também PASS. Última proteção de página durante transporte: **32/32 PASS em 3 arquivos** (subconjunto dos 129, não soma de testes únicos), lint dirigido, typecheck e build novamente PASS. Build Three dinâmico 822.820 B (219,57 kB gzip); entry 668.393 B. Warning pré-existente de chunks >500 kB permanece. [Manifest de build](evidence/bv-post-r2/build-final.json). Sem suíte unitária global local adicional; a suíte global continua na CI.

A primeira composição final de testes teve 127 PASS / 2 FAIL: o teste de pouso media o centro visual depois de começar a abertura, que legitimamente muda o centro dos bounds; preservado o assert de pouso antes da animação e acrescentada a verificação de abertura depois. O teste existente de layout excedeu 5 s durante lint/compilação concorrentes; a rodada serial passou sem mudança de código funcional, timeout ou assert desse teste. Esse timeout local é registrado separadamente da CI da base. A captura final também corrigiu o enquadramento pelo pivot estável do wrapper: bounds de Trabalho deslocavam o foco em 0,001622 m; as 12 câmeras finais antes/depois são exatamente iguais, e custos mantidos. Não é um loop de E2E. Rodadas intermediárias: reprodução do livro FAIL intencional na base; três expectativas novas falharam por nomes antigos/pontos de raycast agora vazios, adequadas à geometria real sem retirar asserts; um teste novo exigia zero exato após easing residual de −4,25e-9, corrigido com assentamento explícito do livro. Nenhuma dessas falhas é atribuída à CI histórica.

**E2E local: 1 FAIL, uma execução, zero retries.** `npm run test:e2e -- e2e/bv-recovery-r2.spec.ts --retries=0`: 30,7 s, timeout no click de `Selecionar no ambiente: Livro R2 livro fictício` (linha 102). Preparação/Canvas e abertura da lista foram alcançados; seleção, novos asserts de links, reload e abertura de Trabalho não foram alcançados. Mesmo ponto de bloqueio local registrado em R2C; causa DOM/renderer/runner ainda não demonstrada. Trace preservado localmente em `test-results/`; não se alongou timeout, não se removeu assert e não se repetiu o E2E. Testes React de navegação dos quatro afetados e picking do runtime passam separadamente, sem substituir este gate.

CI da **base** `10c664c`: [42316880825](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42316880825) FAIL global; estáticos/unitários/build SUCCESS; E2E shards FAIL, 31 PASS / 36 FAIL no total. Essa dívida antecede a rodada. [Nomes das 36 falhas da base](evidence/bv-post-r2/ci-baseline.json), preservados para comparação posterior, sem classificá-los como regressões novas. A CI do novo SHA será consultada após push e relatada na mesma PR, sem presumir verde. Sem auditoria integral ou triagem R4 nesta rodada.

## Roteiro físico e próximo passo

Instalar a candidata pelo fluxo Android habitual e repetir no Moto G06: abrir/fechar Livro da Estrela uma vez; dois comandos rápidos; reverter durante transição; examinar/virar página; pausar/voltar durante abertura; confirmar seleção/highlight/menu e livro pessoal de leitura. Inspecionar os quatro objetos em zoom normal/próximo/destaque, selecionar/abrir seus registros e comparar pan/pinch com R2 anterior no mesmo catálogo. Registrar lag/travamentos, continuidade e leitura artística; não certificar fluidez com contagens de host.

**Recomendação: retornar ao Moto G06 antes de decidir R3.** O lag físico não foi declarado resolvido. R3/R4/R5, dívida E2E/CI, aceite desta arte e gate físico continuam abertos; recuperação integral aberta e PR draft sem merge.
