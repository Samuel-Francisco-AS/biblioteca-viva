# Modelo do mundo

`WorldStructureState` representa o mundo estrutural persistido `world.main`. Seus pisos são células inteiras e suas peças são placements com âncora em grade. Arestas horizontais/verticais e cantos explícitos tornam ocupação e colisão determinísticas; peças duplicadas ou arestas duplicadas são inválidas.

O blueprint inicial é um cômodo 12×10 idempotente. Ele só preenche uma instalação sem estrutura; nunca sobrescreve edição ou restore. `PlacedObject` continua um agregado separado e é recuperado para o footprint vigente somente no primeiro bootstrap quando necessário.

O catálogo possui as famílias físicas `floor.wood`, `wall.short`, `wall.medium`, `wall.long`, `corner.stone` e `door.horizontal`. Inventário é derivado de reserva inicial, placements e grants persistidos. Horizontal e vertical são variantes corretas de paredes; aberta/fechada são variantes da mesma porta horizontal. Porta vertical não é modelada.

Phaser transforma estrutura em plano de renderização e usa previews apenas em memória. Preview, seleção, pan, realce, timer e tween não são persistidos e não devem sobreviver reload, pause, shutdown ou troca de modo.
