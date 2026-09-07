# W3-A-R3-C-B2 — evidências do renderer ativo

Estas capturas são produzidas diretamente do elemento `canvas` criado pelo renderer Phaser ativo. O teste entrega um `WorldStructureState` descartável à mesma cadeia de produção usada pelo runtime:

```text
WorldStructureState
→ structureRenderPlan
→ structureVisualGeometry
→ SpatialWorldScene
→ canvas Phaser
```

O Chromium headless executa com `--disable-webgl`, fazendo `Phaser.AUTO` selecionar o backend Canvas. Isso evita a falha de framebuffer do SwiftShader no ambiente headless sem alterar código de produção, geometria, depth, assets ou composição.

## Capturas

- `canonical-room-full.png`: sala canônica inteira, porta fechada, quatro cantos, texturas reais e móveis.
- `canonical-room-mobile-320x640.png`: a mesma sala em viewport 320×640.
- `canonical-room-mobile-360x800.png`: a mesma sala em viewport 360×800.
- `modified-room-full.png`: cômodo fechado diferente do blueprint, com peças de 1, 2 e 4 células, quatro cantos e porta aberta.
- `door-states-detail.png`: portas aberta e fechada em lados opostos, ambas nos planos longitudinais `x=224..352` e ligadas aos cantos vizinhos.
- `depth-selection-detail.png`: móvel sobre a faixa traseira e sob a faixa frontal, seleção e preview estruturais ativos.
- `fallback-detail.png`: supressão externa, pelo harness E2E, da disponibilidade das texturas de uma reta, um canto e das duas portas; somente os fallbacks canônicos correspondentes são desenhados.

`capture-manifest.json` é gerado pelo teste e registra viewport, dimensões PNG, cenário, estado da porta, versão do navegador, mensagens do console e SHA-256.

As imagens não recebem crop corretivo, escala, deslocamento, retoque, guias ou composição posterior. O único recorte é o recorte automático do próprio elemento `canvas` realizado pelo Playwright.

## Resultado do gate

**W3-A-R3-C-B2 tecnicamente não concluída — evidência visual bloqueadora preservada e aguardando correção nominal.**

A matriz focada executou nove casos: oito passaram e o gate de colinearidade falhou. As sete capturas foram produzidas antes da asserção bloqueadora e permanecem válidas. `canonical-room-full.png`, `modified-room-full.png`, `door-states-detail.png` e `fallback-detail.png` mostram que a reta vertical do lado direito troca de lado ao encontrar os braços dos cantos. A mesma interpretação transversal também desloca para baixo o trecho linear inferior, mais claramente em `modified-room-full.png`.

Após a recuperação do harness, `format:check` e `typecheck` passaram. O lint do próprio arquivo E2E ficou limpo; o comando global ainda encontra quatro parâmetros não usados no teste preexistente `SpatialWorldScene.test.ts`, fora do escopo autorizado desta recuperação.

### Diagnóstico numérico do lado direito

A escala ativa é `32 / 300 = 0,1066666667`. Na sala canônica, os três sprites envolvidos são:

| instanceId | definitionId | âncora | posição do sprite `(x,y)` | alpha bounds | interactionRegion vertical |
|---|---|---:|---:|---:|---:|
| `initial.corner.top-right` | `architecture.wall.stone-01.corner-se` | `(15,4)` | `(349,44;125,44)` | `(352;128;128×128)` | `x=454,826667..480`, `y=128..256` |
| `initial.wall.right` | `architecture.wall.stone-01.vertical-2` | `(15,8)` | `(477,333333;253,44)` | `(480;256;25,066667×64)` | `x=480..505,066667`, `y=256..320` |
| `initial.corner.bottom-right` | `architecture.wall.stone-01.corner-ne` | `(15,14)` | `(349,44;317,44)` | `(352;320;128×128)` | `x=454,826667..480`, `y=320..448` |

Os planos longitudinais coincidem em `y=256` e `y=320`, mas seus perfis transversais não: os cantos ocupam `x=454,826667..480` (oeste do eixo lógico `x=480`) e a reta ocupa `x=480..505,066667` (leste). As regiões apenas tocam o eixo. A distância entre suas centerlines é aproximadamente `25,12` world units, equivalente a `25,12 px` no zoom 1 das capturas.

No cômodo modificado, o mesmo padrão envolve `modified.corner.top-right` (`corner-se`, âncora `(17,2)`), `modified.right.medium-a`, `modified.right.medium-b`, `modified.right.short` (`vertical-2/2/1`, âncoras `(17,6)`, `(17,8)`, `(17,10)`) e `modified.corner.bottom-right` (`corner-ne`, âncora `(17,15)`). Os encontros externos falham em `(17,6)`/`y=192` e `(17,11)`/`y=352`: cantos em `x=518,826667..544`, retas em `x=544..569,066667`. As junções entre as próprias retas permanecem alinhadas.

No lado esquerdo, cantos e retas ficam todos a leste do eixo lógico; há apenas a diferença tolerada de um pixel-fonte entre perfis de 235 e 236 px (`0,106667` world unit), sem o salto lateral. No lado superior, cantos e reta ficam todos ao sul do eixo e permanecem colineares. No lado inferior, porém, os braços dos cantos ficam ao norte do eixo e os assets lineares são projetados ao sul: na sala modificada, as centerlines das paredes diferem em `45,76` world units. A porta conserva corretamente os planos longitudinais, mas o contrato vigente não decide em qual lado transversal deve ficar sua espessura.

### Causa isolada

Os PNGs e as orientações `production` não foram alterados e o renderer aplica fielmente os metadados atuais. A divergência nasce da combinação entre:

- assets lineares assimétricos em torno do eixo lógico;
- `sourceReferencePx` linear fixado no início do alpha bbox, sempre projetando a região para o lado positivo do eixo;
- cantos NE/SE com braço vertical no lado negativo de `x`, e NE/NW com braço horizontal no lado negativo de `y`;
- ausência de normal/side/centerline transversal na definição lógica do placement.

O contrato de arte prova cada asset isoladamente e seus planos externos longitudinais. A transformação chega a produzir um `profile` transversal, mas a composição anterior contava apenas coordenada e cardinalidade dos encontros; não comparava o lado ocupado nem a continuidade da espessura entre vizinhos. Portanto, planos coincidentes não bastam para garantir continuidade visual.

O fallback não introduz uma segunda falha: `fallback-detail.png` repete o salto porque o `Graphics` consome corretamente as mesmas regiões canônicas. Também foi comprovado que nenhuma instância possui simultaneamente sprite e fallback.
