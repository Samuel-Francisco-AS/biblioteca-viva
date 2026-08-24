# STATUS — Biblioteca Viva

> Atualização de estado: 2026-08-24.

## Estado
- baseline: Prompts 1–19, R1–R3, P1 e P2 tecnicamente concluídos;
- P1 implementou seis tipos, tags, favoritos, sessões e estatísticas; P2 implementou a fundação histórica das salas temáticas;
- nova fase: reboot espacial;
- W2: primeiro teste físico no Moto G06 reprovado; correção cirúrgica técnica aplicada e nova validação física pendente;
- stack: React + Phaser + Dexie + Capacitor preservada;
- W1 atual: dois espaços neutros fixos conectados, mundo maior que viewport, câmera X/Y e pan manual;
- integração visual atual: piso `architecture.floor.wood-01` modular e paredes procedurais de uma célula; o Kit Zero de parede foi considerado incompatível com a escala W1 e aguarda W5;
- nenhuma migração do reboot executada;
- schema Dexie v6 e backup v4 incluem a transformação do objeto de teste; backups v1–v3 continuam aceitos;

## W2 — registro técnico
- W1 foi preservada: uma cena/canvas Phaser e mundo contínuo de dois espaços; bounds agora incluem perímetro exterior finito de quatro células.
- terreno exterior `exterior-ground-01-{a,b,c,d}` ocupa depth 00, com hash por célula determinístico e filtering LINEAR; inspeção física de seams/repetição permanece pendente.
- há um único objeto procedural de teste (`object.reading-table`): seleção, ação React Mover, drag efêmero, rotação 0/90/180/270, validação por footprint nos espaços e commit Dexie apenas no soltar/rotacionar.
- persistência usa `placedObjects` no schema v6; backup v4 valida e restaura transacionalmente a coleção, aceitando backups anteriores sem objetos.
- o primeiro teste físico reprovou piso interno, pan vertical, fluxo de seleção/Mover/Girar e macro-repetição do exterior. A correção usa o path real de interior `public/assets/world/architecture/floors/interior/`; não existe diretório `arquitecture` no filesystem atual, apesar da inconsistência registrada no prompt/documentação.
- bounds de câmera agora são derivados também da viewport para garantir intervalo vertical mínimo de duas margens exteriores, sem zoom; zonas do objeto são interativas e o painel React é sobreposto e visível; exterior usa células de 64 units com crop/offset determinísticos.
- gates humanos históricos não mudam;
- nenhuma release pública assinada.

## Preservar
Seis tipos, CRUD, Arquivo, Estatísticas, sessões/tags, domínio/casos de uso, backup, áudio, milestones, acessibilidade React, instância Phaser única, lazy load, lifecycle e local-first.

## Substituir gradualmente
RoomId como eixo da experiência, seletor/troca de sala, sala temática fixa, câmera fixa e renderer desenhado para uma sala inteira.

## Não fazer ainda
Migração grande, editor completo, inventário sofisticado, pathfinding geral, 3D, produção em massa de assets ou refactor total antes do spike.

## Próximo checkpoint
Nova validação humana W1/W2 no Moto G06: piso interno, pan vertical real, perímetro exterior, seleção/Mover/Girar, persistência e leitura de repetição. W2 não está aprovada.

## W1 — registro técnico
- `space-a` (12×9 células, x=3/y=4) e `space-b` (10×8, x=15/y=13) pertencem à mesma cena/coordenadas; o conector em L tem segmento vertical de três células e curva curta até a entrada de B, sem troca de `RoomId`;
- `CELL_SIZE=32`, parede=1 célula, porta=2 e corredor central=3; bounds derivados são 832×672 units, com margem externa de uma célula e sem área externa fixa gigantesca;
- câmera inicia em A com viés para a saída, usa clamp X/Y e pan por pointer/touch; toque curto não inicia pan e cancelamento limpa o gesto;
- resize reaproveita a mesma instância/canvas e preserva a câmera clampada;
- piso usa material modular repetido; as paredes procedurais agora são células discretas com bordas e soleiras nas portas, mantendo o fallback deliberado porque os PNGs atuais possuem dimensões/perspectiva incompatíveis com segmentos de 32 units;
- testes puros cobrem spawn, extremos X/Y, curva e entrada de B, exigindo piso conectado substancial e presente no centro da viewport de retrato;
- nenhuma alteração Dexie, migração, backup ou persistência de câmera/layout;
- format/check, lint, typecheck, áudio, build, relatório de performance, Android sync/debug e diff passaram; Vitest integral passou com 702 testes e Playwright com 10 cenários; os fluxos históricos foram atualizados para abrir disclosures nativos antes de interagir;
- a auditoria removeu do runtime dez cópias públicas de paredes do Kit Zero sem referência na W1; as fontes continuam em `art-source/`, e o APK debug passou de 19.890.133 para 16.783.450 bytes, sem validação física inferida;
- W1 foi tecnicamente corrigida novamente após smoke test físico reprovado; nova validação no Moto G06 permanece pendente e não há aprovação do reboot.
