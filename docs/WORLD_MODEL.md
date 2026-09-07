# Modelo do mundo

`WorldStructureState` representa o mundo estrutural persistido `world.main`. Seus pisos são células inteiras e suas peças são placements com identidade estável, `definitionId` e âncora em grade. Arestas horizontais/verticais e cantos explícitos tornam ocupação e colisão determinísticas; peças duplicadas ou arestas duplicadas são inválidas.

## Geometria lógica normalizada

Uma célula de piso é o quadrado cujo vértice noroeste é `(x,y)`. Uma aresta unitária começa em `(x,y)` e avança uma célula no eixo horizontal ou vertical. Paredes e portas viram intervalos semiabertos com eixo, início, fim e `logicalSpanCells` inteiro positivo; o endpoint final é `start + span` no eixo. Um canto possui um vértice lógico e dois intervalos perpendiculares de quatro células, derivados exclusivamente de `ne | nw | se | sw`.

O perímetro do piso é o conjunto de arestas expostas após cancelar somente as arestas internas compartilhadas. Fechamento lógico significa cobertura exata desse perímetro, sem aresta ausente, extra ou duplicada, com grau dois em todos os vértices de cada componente. Essa análise é pura e diagnóstica: layouts editados podem permanecer abertos se respeitarem as regras locais de edição.

A identidade normalizada ordena células e placements e conserva somente definição, âncora, orientação e estado da porta. Timestamps, revisão e `instanceId` não participam. Assim, `canonical-v1` exige igualdade geométrica completa com o blueprint; qualquer diferença na versão 1 é `modified-v1`, e outra versão é `future/unknown`.

O blueprint inicial é um cômodo 12×10 idempotente. Ele só preenche uma instalação sem estrutura; nunca sobrescreve edição ou restore. `PlacedObject` continua um agregado separado e é recuperado para o footprint vigente somente no primeiro bootstrap quando necessário.

O catálogo possui as famílias físicas `floor.wood`, `wall.short`, `wall.medium`, `wall.long`, `corner.stone` e `door.horizontal`. Inventário é derivado de reserva inicial, placements e grants persistidos. Horizontal e vertical são variantes corretas de paredes; aberta/fechada são variantes da mesma porta horizontal. Porta vertical não é modelada.

A porta horizontal aberta ou fechada ocupa o mesmo intervalo estrutural externo de quatro arestas. A variante fechada não expõe passagem; a aberta expõe somente as duas arestas centrais, sem mudar endpoints, placement ou planos longitudinais. O antigo deslocamento visual de uma célula não pertence à semântica lógica e não é consultado pela transformação canônica.

## Fechamento lógico e continuidade visual

Fechamento lógico não comprova continuidade visual transversal. Dois assets podem compartilhar o mesmo endpoint e o mesmo plano longitudinal, mas desenhar sua espessura em lados opostos do eixo. R3-C-B2 confirmou esse caso nos lados direito e inferior mesmo com os cômodos canônico e modificado logicamente fechados.

O contrato visual vigente declara, independentemente do blueprint, normal transversal, lado ocupado, centerline e perfil comparável por junção. A normal interior é derivada somente da adjacência do piso e a translação assinada é aplicada uma vez na transformação canônica. O analisador compara vizinhos pelo endpoint/eixo; a repetição B2 confirmou 31/31 emendas sem canal conectado de fundo.

Phaser transforma estrutura em plano de renderização e usa previews apenas em memória. Preview, seleção, pan, realce, timer e tween não são persistidos e não devem sobreviver reload, pause, shutdown ou troca de modo. Sprite, hit testing, depth e fallback estrutural derivam da mesma transformação canônica, incluindo o alinhamento transversal já validado.
