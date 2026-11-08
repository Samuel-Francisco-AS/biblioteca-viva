# R5R — Polimento de abertura das quests e legibilidade mágica

> **Atualização física e reparo pontual — 08/11/2026:** proprietário reconheceu melhora perceptível da luminosidade/detalhes mágicos, mas quests ainda engasgam. Listra clara de borda reproduzida por CSS sem WebGL e retirada por remoção do outline de tap. Efeitos e navegação intactos; aprovação Moto G06 deste reparo pendente. [Complemento e evidências](#complemento--contorno-do-canvas).

08/11/2026. Base limpa `c6ca58229c14a6a418e460ff54b6bf97d94fd471`, branch `feat/bv-r5-renascimento-artistico`, mesma PR draft #40. Missão expressa autoriza um único commit/publicação, sem merge ou nova fase. Dados fictícios nas evidências.

O proprietário relata que a R5Q complementar melhorou o fluxo Canvas → quest, mas ainda há engasgada no Moto G06. Também considera fracos os efeitos dos quatro habitantes, pergaminho e livro em leitura. Aceites dirigidos anteriores de início noturno e fluidez geral preservados; arte e R5 continuam abertas. Esta rodada é **polimento perceptivo autorizado**, não declaração de que um bloqueio de JS/driver foi resolvido.

## Quest: continuidade sem espera artificial

Na base, a animação final `living-panel-arrive` fazia **todo o card**, inclusive o header, começar em opacity 0,6 e translateY(5px), por 155 ms. Isso acrescentava uma fase de leitura incompleta depois do commit. Agora frame, título, sigilo e Adiar aparecem com opacidade integral na mesma montagem React. O conteúdo entra em um único wrapper com opacity 0,92 → 1 e translateY(2px) → 0 em **120 ms**, sem animation-delay. Nada aguarda o fim dessa animação: foco, escolhas e Back/Escape ficam disponíveis imediatamente no fluxo existente.

O estado de gesto já publicado pela interação alimenta um contorno fino enquanto `data-gesture="tap"`. É confirmação de contato, não seleção antecipada; pan/pinch/cancel retiram esse estado pelo mecanismo existente. O highlight real permanece exato. Não há novo estado de carregamento, timer, RAF, sleep, flushSync, split de narrativa ou atraso de montagem. Um toque muito rápido pode acabar antes que o contorno seja apresentado: **CSS, DOM e RAF não provam apresentação no display**.

O diagnóstico R5Q continua opt-in, limitado e em memória. Os eventos CSS agora observam o wrapper de conteúdo, ignorando descendentes; reactCommit continua sendo observação de DOM, não paint/compositor. Movimento reduzido do sistema e preferência do app desativam a entrada nova; frame/header permanecem estáveis.

## Magia: presença na câmera do mundo

- **Samael:** pulso lento negro/lilás mais presente em idle (ciclo de 16 s com intervalos quietos), mantendo picos de react/magic/recover. Filamentos existentes ganham contraste/emissão; halo lilás e névoa escura pequena envolvem a silhueta, sem luz nova. Modo reduzido usa presença estática.
- **Aryn:** assinatura dourada mais clara, ativada também em gesture além de work/magic. Halo localizado na mão do livro, com órbitas e suturas GLB existentes reforçadas. Nenhuma alteração de rig, clip ou osso.
- **Ytha:** halo feérico e membranas emissivas mais legíveis. A curva da sua PointLight é **exatamente a anterior**: mesmo nível/tempo/intensidade, inclusive modo reduzido e toggle diagnóstico. O reforço vem de materiais, não de aumentar luz dinâmica.
- **Lua:** emissão mais legível em gesture/magic/recover, halo frio e arco arcano de baixa geometria no mesmo controlador de presença. Rotação lenta apenas quando movimento é permitido, sem controlador paralelo.
- **Pergaminho:** selo e inscrições mais espessos e claros, papel levemente emissivo, halo pequeno de menta e cauda de voo com pontos maiores. Limite de dez, IDs, reserva, voo, manipulação e dados mantidos.
- **Livro em leitura:** emissão durante a sessão maior, crescendo com abertura; selo da estação de leitura 1,3× e mais claro. Pausa/retorno/descarte preservam autoridade da sessão, sem cópia de registro. A luz de estação existente mantém sua intensidade.

Halos usam planos unlit com mapa radial local **32×32 RGBA**, centro suavemente vazado, depth test e depthWrite=false. `onBeforeRender` orienta o plano para a câmera dentro da submissão existente; não agenda trabalho. Controladores atuais atualizam posições/opacidades. Os halos dos habitantes são irmãos das raízes selecionáveis e o do pergaminho é irmão do objeto: **não ampliam bounds/picking/volumes/navegação**. Texturas, materiais e geometrias pertencem à montagem e seguem disposeObjectTree; nenhum cache global ou persistente.

Uma revisão visual corrigiu a ordem da névoa escura (antes do lilás, para não atenuá-lo) e aplicou filtragem linear no mapa radial. As capturas finais foram regeneradas por essa alteração visual, não para perseguir percentis favoráveis. A dispersão entre passagens não prova ganho de renderer.

Sem novas PointLights, bloom, pós-processamento, sombras, DPR/antialiasing ou engine diferentes. Nove luminárias/ritual/fallback e guard R5P não foram alterados. GLBs, quatro rigs, clips, sockets, geometria corporal, IDs, Dexie v14, backup v6 e contratos narrativos intactos. A geometria decorativa do selo/inscrições do pergaminho é intencionalmente maior; suas posições, plano físico e seleção semântica permanecem.

## Evidência pareada e limites

`scripts/capture-r5r-polish.mjs` monta o runtime real com três livros, os seis tipos fictícios, um pergaminho e uma sessão real projetada até a mesa. GLBs/clips reais em magic aos 1,8 s, posições autônomas congeladas igualmente. Capturas 800×600, DPR1, antialias ligado, sombras desligadas, câmera produtiva ortográfica com zoom 0,7 e 1,5, dia 12h/noite 23h. São **24 vistas por versão**, seis alvos × dois horários × dois zooms. [Base](evidence/bv-r5r/before/metrics.json) / [candidata](evidence/bv-r5r/after/metrics.json) / [contadores](evidence/bv-r5r/art-comparison.json). Valores de todas as PointLights e estados de câmera foram comparados e são idênticos por vista.

| Visão geral de Samael, dia |   Base |    R5R |
| -------------------------- | -----: | -----: |
| Chamadas                   |    301 |    307 |
| Triângulos                 | 273726 | 274136 |
| Geometrias carregadas      |    101 |    107 |
| Texturas WebGL carregadas  |      7 |     12 |
| Programas                  |     26 |     28 |

Contadores são recursos carregados/visíveis daquela vista, não orçamento, VRAM Android ou teto do aparelho. Mais transparência e mapas têm custo real; planos pequenos, sem trabalho de iluminação pontual por fragmento. Cinco submissões aquecidas por vista (60 amostras por horário/versão): CPU renderer.render dia P50/P95 **3,0/5,7 → 2,2/4,0 ms**; noite **2,7/4,5 → 2,7/5,4 ms**. Amostras curtas em Chromium SwiftShader, ordem fixa e contextos separados, sem distribuição de replicações: **não são tempo GPU, FPS sustentado, composição, input-to-photon ou fluidez no Moto G06**. Não se afirma custo zero nem preservação física já aprovada da candidata.

Capturas examinadas mostram aura lilás distinguível na visão geral e halo dourado junto ao livro de Aryn, asas/halo de Ytha, arco de Lua e objetos luminosos sem mudar a atmosfera geral. Aceite artístico permanece humano. [Samael dia antes](evidence/bv-r5r/before/12-samael-0.7.jpg) / [depois](evidence/bv-r5r/after/12-samael-0.7.jpg), [Samael noite](evidence/bv-r5r/after/23-samael-1.5.jpg), [Aryn](evidence/bv-r5r/after/12-aryn-1.5.jpg), [Ytha](evidence/bv-r5r/after/12-ytha-1.5.jpg), [Lua](evidence/bv-r5r/after/12-lua-1.5.jpg), [pergaminho](evidence/bv-r5r/after/12-scroll-1.5.jpg), [livro](evidence/bv-r5r/after/12-reading-1.5.jpg). Demais pares têm nomes correspondentes em before/after. Quatro vistas extras por versão mostram Samael em idle aos 7,5 s: [antes](evidence/bv-r5r/before/idle-12-samael-0.7.jpg) / [depois](evidence/bv-r5r/after/idle-12-samael-0.7.jpg). [Card móvel antes](evidence/bv-r5r/before/card-mobile.jpg) / [depois](evidence/bv-r5r/after/card-mobile.jpg), NarrativePanel real em fixture 412×892; [CSS/foco/movimento reduzido](evidence/bv-r5r/after/ui.json). Essas imagens de UI comprovam layout, não latência ou apresentação física.

Reprodução:

```bash
R5R_BASE_DIR=$(mktemp -d /tmp/bv-r5r-base.XXXXXX)
git archive c6ca58229c14a6a418e460ff54b6bf97d94fd471 | tar -x -C "$R5R_BASE_DIR"
ln -s "$PWD/node_modules" "$R5R_BASE_DIR/node_modules"
BV_R5R_ROOT="$R5R_BASE_DIR" node scripts/capture-r5r-polish.mjs /tmp/r5r-before
node scripts/capture-r5r-polish.mjs /tmp/r5r-after
BV_R5Q_ROOT="$R5R_BASE_DIR" node scripts/benchmark-quest-opening.mjs /tmp/r5r-quests-before
node scripts/benchmark-quest-opening.mjs /tmp/r5r-quests-after
```

O benchmark de quests reutiliza WorldHost/NarrativePanel/NarrativeSession reais, CSS final e renderer double para isolar CPU/DOM, com 64 casos por versão (quatro habitantes × dia/noite × duas vias × primeira/reabertura/já aberto/troca). O seletor morto `.world-canvas-host` foi retirado e canvasBounds passou a registrar a dimensão efetiva **800×700**, imposta pelo min-height:100dvh da cascata produtiva. A descrição histórica de Canvas 800×480 era uma intenção do harness, não seu tamanho efetivo. Os dois lados desta rodada têm dimensões verificadas iguais. Amostras de passagens distintas não devem ser misturadas como uma série estatística. Cliques programáticos em botões ocultos com card aberto continuam sendo cobertura do handler, não um percurso acessível físico; no app deve-se adiar antes de escolher outro botão. Os limites de apresentação e do fixture descritos na R5Q continuam.

| Quests — handler CPU host (8 casos/grupo) | P50 antes → depois | P95 antes → depois |
| ----------------------------------------- | -----------------: | -----------------: |
| Canvas · primeira                         |         43 → 41 ms |         73 → 70 ms |
| Canvas · reabertura                       |         44 → 38 ms |         60 → 48 ms |
| Canvas · troca                            |         31 → 31 ms |         57 → 45 ms |
| Canvas · já aberto                        |         38 → 41 ms |         48 → 58 ms |
| Botão · primeira                          |          10 → 8 ms |         16 → 18 ms |
| Botão · reabertura                        |           8 → 5 ms |         12 → 19 ms |

[Todos os grupos](evidence/bv-r5r/quest-comparison.json). P95 nearest-rank de oito casos é o máximo. Não se atribuem oscilações de uma passagem a ganho de CPU da UX: picking/narrativa não foram reformados. Houve 48 commits nos 64 casos de cada versão, zero/um por evento; sem renders redundantes novos demonstrados. Nas oportunidades observadas depois do evento, a candidata tinha artigo/header em opacity 1, conteúdo em transição de 120 ms e delay 0. O header da base herdava a opacidade animada do artigo; sua própria opacity isolada não representaria o valor efetivo. Esses valores **não são primeira imagem no display**. O bloqueio residual de JS/driver/compositor Android continua sem causa dominante confirmada.

## Validação e publicação

Gates, resultados e APK finais estão registrados em `evidence/bv-r5r/local-gates.json` e `apk.json`. **139 testes distintos PASS em 13 arquivos**. Primeiro conjunto dirigido: 53 PASS/6 arquivos (painel/host/halos/sessão/pergaminho), segundo: 25 PASS/5 arquivos (presença/visuais/picking/oracle/R3); runtime/probe: 61 PASS/2 arquivos. Após ordenação/filtro finais: 5 PASS/2 arquivos, sobrepostos. O ponto quieto de recover foi tornado coerente com o novo ciclo (tempo global 15 s, idade da ação 3 s): o teste numérico correspondente passou, 1 PASS/2 casos não selecionados por -t; o arquivo completo e o hover já tinham passado na rodada final de cinco. Nenhum timeout, assert ou caso foi removido. O typecheck e a primeira tentativa de build detectaram `map.image` como unknown na fixture nova; acrescentada guarda explícita de DataTexture, preservando o assert de 32×32 e sem cast. Typecheck corrigido PASS; teste do halo reexecutado após a guarda, sem mudança de produto. A primeira tentativa de captura falhou por nome errado do campo de livros no harness; corrigido para readingAreaBookVisuals antes da comparação completa. Imagens parciais dessa tentativa foram descartadas; não foi falha do produto nem um teste físico. A rodada final de 24 vistas escreveu métricas/capturas completas, errors=[] e teardown disposed/zero Canvas; o processo do harness terminou com sinal 143 durante o encerramento, sem causa isolada. Esse status é preservado, não convertido em exit 0; não houve nova passagem para perseguir um resultado de saída. A rodada final de idle e o lifecycle separado terminaram com exit 0.

Falhas históricas E2E permanecem abertas: R5Q 0/1 na estabilidade de scrollIntoViewIfNeeded, linha 60, mais dívidas R2/R5P. A suíte ampla não foi repetida nesta rodada proporcional. A ampla anterior terminou 981 PASS/1 timeout de hover de Ytha, com arquivo isolado 3 PASS. Sem omissão/assert/prazo editado, sem loops E2E ou alegação de CI global verde. Workflows preservados, um commit com [skip ci], nenhum dispatch/rerun, PR #40 draft e sem merge. ADB sem aparelhos; agente não instalou/testou a R5R no Moto G06. Gates estáticos/build/Android são verificação local, não certificação de fluidez ou aprovação artística. [Lifecycle WebGL real](evidence/bv-r5r/lifecycle/lifecycle.json): um ciclo PASS, sem omissões/duplicações de descarte ou listeners/RAF/observers próprios pendentes; não prova heap/GC prolongado.

Formato/check, lint global e da fixture corrigida, tipos, build, áudio, performance report, Android sync/debug e diff PASS. Warnings conhecidos de chunk >500 kB e Gradle flatDir preservados. APK final: `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5R-debug.apk`, **10,641,553 B**, SHA-256 `0043bd6b8cc10951a298b3b86b681e40f9f025a63b058576ab044d9d4baabf5c`. Bundles inicial/runtime conferidos byte a byte com dist e quatro GLBs com a base/ZIP; hashes das fontes em [apk.json](evidence/bv-r5r/apk.json). Nenhuma instalação física pelo agente.

## Roteiro Moto G06

1. Sem diagnóstico: selecionar os quatro habitantes pelo Canvas, adiar/reabrir e trocar; repetir pelos botões acessíveis. Observar contato/realce, header e Adiar, entrada do conteúdo, foco, Back/Escape e escolhas. Se ainda engasgar, usar a rodada curta opt-in R5Q e informar se a demora precede o header ou aparece na entrada. Nenhum marco local equivale à exibição física.
2. Na câmera habitual e depois aproximada: observar Samael em idle por cerca de 16 s e em reação/magia; dourado junto ao livro de Aryn, asas/halo de Ytha e círculo/feitiços de Lua. Dia/noite conforme ocasião, sem alterar relógio ou dados pessoais. Procurar presença clara sem encobrir a silhueta.
3. Observar um pergaminho existente em repouso/voo e o livro durante sessão de leitura ativa na mesa, depois pausada/encerrada. Verificar brilho, navegação, seleção e continuidade da sessão. Repetir trecho curto com movimento reduzido e após background/retorno.
4. Informar separadamente suavidade da abertura, leitura dos seis efeitos e fluidez geral/noturna. **Candidata aguardando validação física e artística; R5 permanece aberta.**

## Complemento — contorno do Canvas

Base limpa `34f1c02470273abb52c8fb641934b06075895812`, mesma branch/PR draft #40. Feedback humano do proprietário: **melhoria perceptível de luminosidade e detalhes mágicos da R5R**; abertura de quests continua com engasgos; movimento brusco de câmera mostra brevemente uma listra branca/esverdeada à esquerda. Melhora artística parcial registrada, sem promover R5 ou considerar quests resolvidas.

A única alteração de produto remove quatro linhas de styles-atelier.css: outline 2px solid #b5e9df, offset -2px, de `.three-world-canvas[data-gesture="tap"]`. Não se adicionou `outline:none`, nem regra global que apague foco. Optou-se por remover o feedback de moldura: o highlight real e os controles acessíveis já oferecem feedback de seleção. Nenhum JS de produção, material, rig, shader, luz, navegação, efeito mágico, narrativa ou diagnóstico foi alterado.

### Causa e reprodução dirigida

ThreeWorldInteraction inicia um contato único em tap. Só após ultrapassar o limiar de arrasto passa a pan; portanto um pan brusco também pode ter uma fase inicial tap. Nessa fase o seletor R5R desenhava a moldura **dentro** do Canvas fullscreen. A borda esquerda é parte dessa moldura, compatível com a listra/cor relatadas. Não é necessário um renderer ou driver WebGL para produzi-la.

`scripts/check-canvas-outline.mjs` usa CSS produtivo completo, ThreeWorldInteraction e CameraNavigation reais, em Chromium 412×892/DPR1, com Canvas de fundo CSS e **sem criar renderer/contexto WebGL**. Controle positivo serve styles-atelier.css da base pelo Git; candidata serve arquivo atual. Um pointerdown real produz tap e registra estilos/captura; um único movimento de 200 px produz pan e altera a câmera. Depois verifica release, pinch de PointerEvents sintéticos, roda de zoom e foco com Tab. O contato inicial é mantido apenas no harness para observar a regra: não há sleep, novo timer, delay de produto, aumento de timeout ou prova de apresentação física do Moto G06.

| Estado/observação        | Base                                      | Reparo                   |
| ------------------------ | ----------------------------------------- | ------------------------ |
| tap no Canvas fullscreen | solid, 2px, rgb(181,233,223), offset -2px | outline-style:none       |
| pan e release            | sem contorno                              | sem contorno             |
| Tab no botão acessível   | focus-visible, solid 2px                  | focus-visible, solid 2px |
| Pan / pinch / zoom       | câmera e zoom mudam                       | câmera e zoom mudam      |
| Renderer/WebGL           | não criado                                | não criado               |

[Captura tap antes](evidence/bv-r5r/canvas-outline/before/tap.png) / [depois](evidence/bv-r5r/canvas-outline/after/tap.png), [foco antes](evidence/bv-r5r/canvas-outline/before/keyboard-focus.png) / [depois](evidence/bv-r5r/canvas-outline/after/keyboard-focus.png), [observações base](evidence/bv-r5r/canvas-outline/before/reproduction.json) / [candidata](evidence/bv-r5r/canvas-outline/after/reproduction.json). Reprodução confirma **a origem CSS da moldura e a janela tap→pan**; correspondência com a apresentação transitória exata do aparelho ainda requer o teste físico. Não se atribui a listra a WebGL nem se altera renderer.

A primeira execução do harness esperava outline-width:0 em pan; Chromium retorna a largura default medium (3px) mesmo com outline-style:none. Corrigida a expectativa para o estilo que determina se existe traço, preservando os asserts de tap, gesto, câmera, pinch/zoom e foco. Controle positivo e candidata completos: PASS/exit 0, sem erros da página. Não houve alteração de testes existentes ou prazos.

```bash
node scripts/check-canvas-outline.mjs docs/audits/evidence/bv-r5r/canvas-outline/before before
node scripts/check-canvas-outline.mjs docs/audits/evidence/bv-r5r/canvas-outline/after
```

### Gates e escopo preservado

**69 testes dirigidos PASS/3 arquivos**: ThreeWorldInteraction (quatro GLBs e seleção exata), ThreeWorldRuntime (gestos/lifecycle/iluminação/diagnóstico) e NarrativePanel (foco/escolhas/Back/Escape). Formato, lint, tipos, build e Android debug registrados em [gates](evidence/bv-r5r/canvas-outline/local-gates.json). E2E global e ampla não foram repetidos; dívidas históricas permanecem abertas, sem CI global verde. Nenhuma nova investigação/otimização das quests nesta rodada. Código dos seis efeitos e diagnóstico opt-in R5Q comparado com os hashes da R5R; somente styles-atelier.css difere entre as fontes produtivas.

Publicação com [skip ci], mesma PR draft #40, workflows inalterados e nenhum dispatch/rerun. Não houve merge, nova fase ou alteração de versão/persistência. O APK e sua CSS empacotada foram conferidos contra dist, incluindo ausência do seletor removido e manutenção das regras de focus-visible, em [apk.json](evidence/bv-r5r/canvas-outline/apk.json). Agente sem teste físico novo; aprovação depende do proprietário.

Verificação local final deste complemento: formato/check, lint, tipos, build, Android sync/debug e diff PASS. Warnings existentes de chunks >500 kB e Gradle flatDir mantidos. O hash do bundle do runtime mudou pelo nome importado do entrypoint; substituindo somente esse nome de dependência, seus **842.516 bytes são idênticos** à R5R. As 88 fontes produtivas anteriores foram verificadas: apenas styles-atelier.css mudou. GLBs também idênticos no APK/base. Não houve mudança escondida no código dos efeitos ou navegação.

APK de verificação: `android/app/build/outputs/apk/debug/Biblioteca-Viva-R5R-contorno-debug.apk`, **10,641,553 B**, SHA-256 `cb0fba8e15d06a55d27abbc8221069ddee32c88d7c99005c2100c92d3b415662`. ADB sem aparelhos, sem instalação/teste físico pelo agente. Candidata aguarda o Moto G06.

### Teste Moto G06 deste reparo

Instalar o APK de verificação preservando dados. Fazer pans bruscos em ambas as direções, iniciando perto da borda esquerda e do centro; a listra não deve aparecer. Conferir pinch/zoom e seleção/highlight, além de foco com teclado quando disponível. A melhora mágica deve permanecer; **engasgo das quests é pendência separada e não foi tratado aqui**. Se a listra persistir, registrar em qual gesto/posição ocorre para discriminar outras causas, sem presumir defeito de WebGL. R5 e aceite artístico final permanecem abertos.
