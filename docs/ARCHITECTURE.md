# Arquitetura — Reboot espacial

> Revisão: 2026-08-18.

## Decisão executiva
Preservar TypeScript estrito, React, Vite, Phaser 3, Capacitor 8, Dexie/IndexedDB atrás de portas, Zod, Vitest/Testing Library/Playwright e AudioPort. O reboot não justifica migração para Godot ou 3D.

## Responsabilidades
**React:** navegação, formulários, Coleção/Arquivo/Estatísticas/Configurações, painéis, menus, acessibilidade, backup e feedback textual.

**Phaser:** no W1, mundo efêmero, câmera, profundidade visual simples e pan. Objetos/habitantes, seleção, posicionamento e iluminação local são etapas futuras e continuam emitindo/recebendo apenas contratos tipados quando existirem.

**Application/Domain:** desbloqueios, validação, persistência coordenada, eventos e políticas de expansão/posicionamento que sobrevivem ao renderer.

**Infrastructure:** Dexie, repositórios, migrações, backup, adapters e áudio concreto.

## Mudança conceitual
```text
ANTES: RoomId → sala atual → renderer → troca de sala
ALVO: WorldState → espaços + objetos + habitantes → WorldProjection → Phaser → Camera

W1 implementa somente uma configuração efêmera mínima de `World/Space/Connection` dentro da projeção visual. Não há `WorldState` persistido, objetos, habitantes ou `PlacedObject` ainda.
```

## Modelo espacial
- `World`: raiz lógica.
- `Space`: cômodo/corredor/área semanticamente neutra.
- `Connection`: continuidade entre áreas.
- `ObjectDefinition`: definição declarativa.
- `PlacedObject`: instância persistida.
- `Resident`: habitante.
- `Anchor`: ponto semântico para rotinas.

Modelo mínimo candidato:
```ts
interface PlacedObject {
  instanceId: string
  definitionId: string
  spaceId: string
  x: number
  y: number
  rotation: 0 | 90 | 180 | 270
  layer: number
}
```
O contrato final deve nascer do código real; não copiar este exemplo mecanicamente.

## Persistência
W2 usa a tabela aditiva `placedObjects` no Dexie v6 e backup v4. A aplicação valida/commita transformação por porta; Phaser conserva somente seleção, preview e drag efêmeros. Backups v1–v3 normalizam para nenhuma instância persistida.

Não converter automaticamente as cinco salas P2 para um layout pessoal sem política explícita.

## Fonte de verdade
```text
registros → repositórios atuais
desbloqueios → domínio/milestones
catálogo → configuração declarativa
layout escolhido (W2 futuro) → persistência espacial
visual derivado → WorldProjection
câmera/preview → Phaser efêmero
UI convencional → React
```

## Ponte
```text
Application → WorldProjectionService → WorldViewModel → Phaser
Phaser → WorldInteraction → React/Application
```
Preview de drag pode ficar local; persistir apenas no commit.

## Câmera
Mundo maior que viewport, bounds, pan X/Y, zoom inicialmente fixo, resize sem recriar game e distinção clara entre toque, pan e drag.

## Posicionamento
Separar seleção → modo edição → preview → validação → commit. Não escrever no IndexedDB em cada `pointermove`.

## Colisão
Começar simples: bounds, footprint simples, zonas proibidas e overlap básico. Não introduzir física sem necessidade.

## 2.5D
Preferir ordenação determinística por camada/Y. A fórmula depende da direção artística.

## Habitantes
Preservar scheduler único. Usar âncoras/rotas controladas e adiar pathfinding geral.

## Performance
Preservar uma instância/canvas, lazy load, cleanup e Phaser sem regra de negócio. Medir antes de culling/spatial index.

## Acessibilidade
React mantém acesso aos dados e feedback. O editor espacial exigirá alternativa específica antes de ser considerado finalizado.

## Processo 2 — editor estrutural

`pages.tsx` é o orquestrador: envia `constructionState` ao mesmo host/canvas, recebe intenções tipadas, chama os casos de uso e aplica apenas a projeção confirmada. Phaser centraliza conversão tela→mundo→grid, hit areas e preview efêmeros; não acessa Dexie nem escreve em `pointermove`. `WorldStructureState` e `PlacedObject` continuam repositórios e coleções de backup separados. Conflito de revisão recarrega estrutura/inventário sem repetir escrita.

## Gatilhos para reconsiderar Phaser
Somente geometria/iluminação 3D real, pathfinding/editor extremamente complexos ou gargalo físico persistente e comprovado.
