# Direção artística

## Intenção

Criar um lugar íntimo, antigo, mágico e habitado, construído ao longo do tempo. O mundo deve parecer contínuo e pessoal, não uma coleção de dashboards ou salas obrigatórias por categoria.

## Espaço

- construção contínua e expansível;
- cômodos semanticamente neutros;
- corredores e passagens legíveis;
- câmera sobre área maior que a viewport;
- objetos de naturezas diferentes coexistindo;
- mapa como superfície principal durante edição.

## Perspectiva e profundidade

A direção atual é top-down oblíquo 2.5D ortogonal. Profundidade vem de sobreposição e ordenação pela base visível. Isometria e 3D real não estão aprovados.

## Linguagem visual

- atmosfera verde-escura e dourada;
- tipografia editorial concentrada em títulos;
- header compacto e dock de cinco áreas;
- overlays temporários e compactos;
- manhã, tarde, noite e madrugada como atmosfera global;
- luz local pode pertencer a objetos sem exigir iluminação dinâmica complexa.

## Estrutura W3-A

A escala estrutural comum é 300 px-fonte para 32 unidades de mundo. Paredes, cantos e porta horizontal usam assets próprios e transformação canônica. Os quatro cantos promovidos têm canvas 1248×1248 e braços de 1200 px. A continuidade final não depende apenas dos PNGs: normal topológica e perfis estruturais alinham as peças no runtime.

A baseline passou 9/9 cenários e 31/31 junções. Esse resultado técnico não dispensa revisão artística antes de uma distribuição pública.

## Objetos

Todo objeto posicionável precisa declarar footprint, orientação, origem, hit area, depth, estados, legibilidade mobile e fallback. Asset visual não define regra de domínio.

## Interface sobre o mundo

A Biblioteca permanece dominante. Construção pode ocultar o dock, mas paletas, seleção e faixa de peças não devem impedir manipulação do mapa. A etiqueta contextual dura 5.000 ms e não substitui informação permanente.

## Fora da direção

- sala fixa por categoria;
- troca de sala como navegação principal;
- câmera sempre fixa;
- composição obrigada a caber inteira na viewport;
- 3D real;
- UI permanente cobrindo o mundo;
- correção de arte por escala ou offset específico de um blueprint.
