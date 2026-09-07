# W3-A-R2-A — contrato dos cantos de parede

Estes artefatos são gabaritos e diagnósticos. Eles não são carregados pela aplicação, não substituem os PNGs ativos e não contêm arte final de canto.

## Autoridade e coordenadas

O contrato máquina-legível é `wall-corner-contract.json`. As coordenadas usam bordas de pixel, origem `(0,0)` no canto superior esquerdo, `x` para a direita e `y` para baixo. Retângulos são semiabertos: um retângulo `x=24, width=1200` ocupa os pixels `24..1223` e termina no plano `x=1224`.

- escala: 300 px-fonte por célula lógica;
- braço: 4 células, portanto 1200 px longitudinais;
- canvas de todo novo canto: 1248×1248 px;
- alpha bbox obrigatório: `1200x1200+24+24`;
- formato: PNG, sRGB, 8 bits por canal, RGBA não premultiplicado;
- margem externa: 24 px totalmente transparentes em cada lado;
- origem visual do arquivo: `(0,0)`; não recortar, redimensionar, esticar ou deslocar para aprovação;
- tolerância: 0 px para canvas, span, plano de junção e alpha fora da área permitida; 1 px somente para a diferença transversal já medida entre as retas verticais de 1/2 células e a reta vertical de 4 células.

As seis retas ativas são as matrizes obrigatórias. A reta horizontal longa ocupa `x=[24,1224)` e tem perfil transversal `y=[24,453)`. A reta vertical longa ocupa `y=[24,1224)` e tem perfil transversal `x=[24,260)`. Os segmentos de 1/2/4 células preservam o span longitudinal 300/600/1200 px; a variação transversal vertical de 1 px está dentro da tolerância registrada.

## Orientações

Os nomes seguem o contrato lógico já aceito em R1: `ne` estende para oeste+norte; `nw`, leste+norte; `se`, oeste+sul; `sw`, leste+sul.

| Canto | Direções | Vértice lógico | Origem da referência H | Origem da referência V | Planos externos | Áreas permitidas para alpha |
|---|---|---:|---:|---:|---|---|
| `ne` | oeste+norte | `(1224,1224)` | `(0,771)` | `(964,0)` | `x=24` oeste; `y=24` norte | `(24,795,1200,429)` ∪ `(988,24,236,1200)` |
| `nw` | leste+norte | `(24,1224)` | `(0,771)` | `(0,0)` | `x=1224` leste; `y=24` norte | `(24,795,1200,429)` ∪ `(24,24,236,1200)` |
| `se` | oeste+sul | `(1224,24)` | `(0,0)` | `(964,0)` | `x=24` oeste; `y=1224` sul | `(24,24,1200,429)` ∪ `(988,24,236,1200)` |
| `sw` | leste+sul | `(24,24)` | `(0,0)` | `(0,0)` | `x=1224` leste; `y=1224` sul | `(24,24,1200,429)` ∪ `(24,24,236,1200)` |

Cada tupla de área é `(x,y,width,height)`. O alpha final pode variar dentro da união das duas áreas, mas não pode existir fora dela. O alpha bbox completo não substitui a inspeção dos dois braços: ambos precisam alcançar seu plano externo e conservar o perfil, a espessura, a perspectiva, a luz, a argamassa e a densidade visual das retas correspondentes.

## Gabaritos e montagens

Gabaritos orientados:

- `templates/wall-corner-template-ne.png`;
- `templates/wall-corner-template-nw.png`;
- `templates/wall-corner-template-se.png`;
- `templates/wall-corner-template-sw.png`.

Nas imagens, verde marca a área permitida, amarelo marca o último pixel interno adjacente ao plano externo e vermelho marca o vértice lógico. Todo o restante é transparente. As cores são legenda técnica: não devem aparecer no candidato e o gabarito não deve ser usado como camada visível da arte final.

Montagens com as retas longas ativas:

- `montages/wall-corner-inspection-ne.png`;
- `montages/wall-corner-inspection-nw.png`;
- `montages/wall-corner-inspection-se.png`;
- `montages/wall-corner-inspection-sw.png`.

Cada montagem mede 2448×2448 px, alinha as retas aos dois planos externos sem escala e mostra o gabarito sobre um fundo quadriculado. Ela prova orientação e geometria; não prova qualidade artística de um candidato ainda inexistente.

## Produção humana — etapa posterior

R2-A não autoriza produção. Depois de aceite humano nominal deste gate, produzir uma orientação por vez usando o gabarito correspondente, `wall-horizontal.png`, `wall-vertical.png` e o canto antigo apenas como referência de linguagem.

Salvar os quatro candidatos, sem tocar `art-source/` ou `public/`, exatamente em:

```text
art-candidates/w3-a-r2-b/wall-corners/wall-corner-ne.png
art-candidates/w3-a-r2-b/wall-corners/wall-corner-nw.png
art-candidates/w3-a-r2-b/wall-corners/wall-corner-se.png
art-candidates/w3-a-r2-b/wall-corners/wall-corner-sw.png
```

Não adicionar fundo, piso, sombra de cenário, texto, marca, porta ou mobiliário. Não compensar uma falha com crop, padding novo ou stretching. Se gabarito e referência visual entrarem em conflito, parar e registrar o conflito.

## Procedimento reservado a R2-B

R2-B só pode começar depois do aceite de R2-A e da aprovação visual nominal dos quatro candidatos.

1. Registrar hashes, dimensões e caminhos dos quatro candidatos e dos 12 assets ativos.
2. Sem mover os candidatos, executar:

   ```text
   node scripts/process-wall-assets.mjs --check --strict-corner-directory art-candidates/w3-a-r2-b/wall-corners
   ```

3. Reprovar e parar se canvas, formato, alpha bbox, orientação ou área permitida falhar; não corrigir automaticamente.
4. Produzir montagens candidato+retas e inspecionar em resolução original. A validação geométrica automática não substitui a inspeção humana de seam, textura, perspectiva e luz.
5. Somente após aprovação, substituir os quatro fontes pelos candidatos e gerar runtime pelo pipeline oficial. Manter retas e portas byte a byte, IDs e nomes estáveis.
6. Executar o check estrito novamente e registrar os hashes finais. Não alterar compositor, offsets, porta, hit areas ou UI em R2-B.

`validator-report.json` registra a medição atual dos 12 fontes. Os quatro cantos antigos aparecem como `legacy-nonconforming-report-only`; continuam ativos até uma R2-B autorizada. As portas aberta/fechada foram apenas medidas e compartilham planos externos `x=24` e `x=1224`.
