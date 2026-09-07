# Modelo do mundo

## Estrutura lógica

`WorldStructureState` representa `world.main`. Pisos são células inteiras. Peças estruturais têm identidade estável, `definitionId`, âncora em grade e revisão do agregado.

Uma célula ocupa o quadrado iniciado em `(x,y)`. Uma aresta unitária avança uma célula no eixo horizontal ou vertical. Paredes e portas formam intervalos semiabertos; cantos possuem um vértice e dois braços perpendiculares.

Peças duplicadas, arestas duplicadas ou estado fora do catálogo são inválidos. Layouts editados podem permanecer abertos quando respeitam regras locais; fechamento global é diagnóstico, não pré-condição de toda edição.

## Perímetro e identidade

O perímetro é formado pelas arestas externas após cancelar arestas internas compartilhadas. Fechamento lógico exige cobertura exata, ausência de duplicidade e grau dois nos vértices do componente.

A identidade normalizada ignora timestamps, revisão e `instanceId`. O blueprint é `canonical-v1` somente quando a geometria completa coincide; uma edição na mesma versão é `modified-v1`; versões desconhecidas são `future/unknown`.

## Blueprint e inventário

O blueprint inicial é um cômodo 12×10. Ele só é criado quando `world.main` não existe. O inventário é calculado por família física a partir de reserva, placements e concessões. Orientações não criam estoques distintos.

## Peças vigentes

- piso de madeira;
- paredes curtas, médias e longas;
- quatro orientações de canto;
- porta horizontal aberta ou fechada.

A porta ocupa o mesmo intervalo estrutural nos dois estados. Porta vertical não é modelada por falta de asset aprovado.

## Estrutura versus objeto

`PlacedObject` não faz parte da estrutura. Objetos possuem footprint e orientação próprios, enquanto paredes, cantos, portas e pisos seguem as regras de células e arestas.

## Continuidade visual

Fechamento lógico não prova continuidade visual. O contrato atual compara, por junção, eixo, normal transversal, lado ocupado, centerline, perfil e tolerância.

A normal interior é derivada exclusivamente da adjacência do piso. A translação assinada é aplicada uma vez pela transformação canônica. Não existem offsets especiais por cômodo, coordenada ou instância.

Sprite, fallback, depth, hit testing, preview e seleção consomem a mesma transformação. A baseline final da W3-A possui 31/31 junções válidas e 9/9 cenários visuais.

## Estado efêmero

Preview, seleção, pan, câmera, realce, timer, tween e ferramenta ativa vivem somente em memória e são limpos ao sair do modo, pausar, desmontar ou receber nova projeção.
