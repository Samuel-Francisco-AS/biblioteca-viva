# Modelo de Mundo — Biblioteca Viva

> Documento novo para o reboot.

## Objetivo
Separar conteúdo registrado, recompensa/desbloqueio, estrutura física e organização escolhida.

## Conceitos
- **World:** ambiente global.
- **Space:** área navegável neutra.
- **Connection:** relação entre áreas.
- **ObjectDefinition:** modelo declarativo de objeto.
- **Unlock:** direito adquirido.
- **PlacedObject:** instância posicionada.
- **Resident:** habitante.
- **Anchor:** ponto semântico.

## Invariantes
- PlacedObject referencia definição conhecida e espaço válido.
- Posição respeita limites.
- Rotação pertence às opções da definição.
- Unlock e placement são separados.
- Mover objeto não altera o fato histórico que o desbloqueou.
- Phaser não é fonte de verdade do layout.

## Derivado, persistido e efêmero
**Derivado:** desbloqueio efetivo, atmosfera, destaque, reações, presença de residentes.

**Persistido (futuro W2):** instância colocada, posição, orientação, espaço e, futuramente se necessário, estado de armazenamento.

**Efêmero:** seleção, preview de drag, câmera, hover e animação.

## Inventário
O primeiro slice não precisa de inventário completo. Basta conceitualmente distinguir `desbloqueado + não colocado` e `desbloqueado + colocado`.

## Expansão
Ainda não decidir entre layouts predefinidos, extensões anexadas ou construção parcialmente livre. Portanto, não implementar editor de paredes nem modelo excessivamente genérico.

## Compatibilidade
P1 continua fonte dos registros. Milestones/fatos P2 podem originar unlocks, mas as salas temáticas deixam de ser estrutura definitiva. Não migrar automaticamente as cinco salas.

## Estado W2

O código preserva os dois espaços técnicos efêmeros e acrescenta as instâncias iniciais `placed-object.furniture.desk.wood-01` e `placed-object.furniture.chair.wood-01`. A transformação persistida contém instância, definição, espaço, posição e rotação; seleção, preview, drag e câmera permanecem efêmeros. `object.reading-table` continua definido apenas para leitura segura de estado W2 anterior. Não há inventário, unlock, residentes ou expansão livre.
