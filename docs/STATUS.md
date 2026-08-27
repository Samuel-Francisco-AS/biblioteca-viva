# STATUS — Biblioteca Viva

> Atualização de estado: 2026-08-26.

## Estado
- baseline: Prompts 1–19, R1–R3, P1 e P2 tecnicamente concluídos;
- P1 implementou seis tipos, tags, favoritos, sessões e estatísticas; P2 implementou a fundação histórica das salas temáticas;
- nova fase: reboot espacial;
- W2: **aprovada humanamente no Moto G06 em 2026-08-26** após as correções W2.1–W2.4;
- stack: React + Phaser + Dexie + Capacitor preservada;
- W1 atual: dois espaços neutros fixos conectados, mundo maior que viewport, câmera X/Y e pan manual;
- integração visual atual: piso `architecture.floor.wood-01` modular e paredes W3-A compostas por catálogo declarado; não há porta vertical;
- nenhuma migração do reboot executada;
- schema Dexie v6 e backup v4 incluem a transformação do objeto de teste; backups v1–v3 continuam aceitos;

## W2 — registro técnico
- W1 foi preservada: uma cena/canvas Phaser e mundo contínuo de dois espaços; bounds agora incluem perímetro exterior finito de quatro células.
- terreno exterior `exterior-ground-01-{a,b,c,d}` ocupa depth 00, com hash por célula determinístico e filtering LINEAR; a leitura contínua foi aprovada na validação W2.
- escrivaninha `furniture.desk.wood-01` (3×2) e cadeira `furniture.chair.wood-01` (1×1) usam quatro sprites runtime por orientação, pivot de base e o pipeline W2 existente: seleção, painel React, Mover, drag efêmero, rotação 0/90/180/270 e commit Dexie somente no soltar/rotacionar; `object.reading-table` permanece como fallback procedural explícito para leitura de estado legado.
- correção W2.1: os oito PNGs runtime agora removem por flood-fill determinístico apenas o fundo preto conectado à borda, preservando RGBA real; durante drag, Phaser atualiza o sprite/zona da instância em vez de destruir e recriar todos os objetos a cada `pointermove`; o deadzone de pan foi reduzido de 12 para 6 px e cancelamento restaura o preview sem commit.
- correção W2.2: Girar e confirmar Mover atualizam a projeção React de forma otimista e revertem apenas em falha de persistência; Phaser mantém o preview confirmado até receber essa projeção, eliminando o retorno visual a X. O exterior deixou os 224 crops de 64 units por 16 texturas completas de 256 units, removendo a grade visual e reduzindo composição; pan continua sem React/Dexie/reconstrução no hot path.
- correção W2.3: drag coalesce somente o último `pointermove` até o próximo frame Phaser, evitando reproduzir posições obsoletas; giros em rajada mantêm preview imediato e serializam/coalescem a persistência para o último estado desejado. A inspeção do pan encontrou `setScroll` síncrono, ganho 1:1 fora dos bounds e deadzone de 6 px, sem backlog técnico; nenhum ajuste de calibração foi aplicado sem nova evidência física.
- acabamento W2.4: o cartão React de objeto selecionado tem fechamento acessível, transição curta e encerra Mover ao fechar; confirmações de transformação usam toast temporário reutilizável. A fixture procedural histórica `placed-object.reading-table` deixou a composição normal sem apagar o dado legado.
- aprovação humana W2 em 2026-08-26: cadeira/escrivaninha transparentes, seleção/Mover/Girar, drag suficiente para esta fase, snapback corrigido, exterior contínuo, câmera aceitável e persistência após fechar/reabrir repetidamente.
- persistência usa `placedObjects` no schema v6; backup v4 valida e restaura transacionalmente a coleção, aceitando backups anteriores sem objetos.
- o primeiro teste físico reprovou piso interno, pan vertical, fluxo de seleção/Mover/Girar e macro-repetição do exterior. A correção usa o path real de interior `public/assets/world/architecture/floors/interior/`; não existe diretório `arquitecture` no filesystem atual, apesar da inconsistência registrada no prompt/documentação.
- bounds de câmera agora são derivados também da viewport para garantir intervalo vertical mínimo de duas margens exteriores, sem zoom; zonas do objeto são interativas e o painel React é sobreposto e visível; o exterior usa 16 texturas completas de 256 units, distribuídas deterministicamente.
- gates humanos históricos não mudam;
- nenhuma release pública assinada.

## Preservar
Seis tipos, CRUD, Arquivo, Estatísticas, sessões/tags, domínio/casos de uso, backup, áudio, milestones, acessibilidade React, instância Phaser única, lazy load, lifecycle e local-first.

## Substituir gradualmente
RoomId como eixo da experiência, seletor/troca de sala, sala temática fixa, câmera fixa e renderer desenhado para uma sala inteira.

## Não fazer ainda
Migração grande, editor completo, inventário sofisticado, pathfinding geral, 3D, produção em massa de assets ou refactor total antes do spike.

## Próximo checkpoint
W3-B — Unlock → disponibilidade. Otimização e refinamento fino de câmera, input e mecânicas espaciais ficam deliberadamente para rodada futura e não bloqueiam a W2.

## W3-A — paredes reais, conclusão técnica
- `wallAssets.ts` separa catálogo tipado, paths, pivôs, escala comum (300 px-fonte = 32 world units), offsets e fallback; `wallComposition.ts` é puro e transforma apenas piso/células/portas lógicas em plano estável de sprites.
- os 12 PNGs são PNG sRGBA: fonte/runtime conservam RGBA, alpha 0–1 e bounds/padding medidos. Nenhum fundo técnico conectado às bordas foi removido, pois os pixels transparentes e a arte de pedra foram considerados seguros; cópias PNG32 determinísticas ficam em `public/assets/world/architecture/walls/`.
- segmentos preferem 4, depois 2 e 1 célula; cantos NE/NW/SE/SW são explícitos. Phaser só pre-carrega e renderiza o plano em depth por Y/política, sem interação, listener, tween ou persistência de parede. Falha de textura recai em Graphics local procedural.
- para eliminar a abertura vertical antiga, `space-b` mudou de `(15,13)` para `(13,17)` células e o conector mudou de `turn 2×3 em (13,16)` para `2×2 em (13,15)`. A segunda passagem agora é horizontal na borda norte de B: abertura `(13,17)` de 2 células. As áreas de placement W2 acompanham a mesma geometria; schema Dexie v6 e backup v4 não mudaram.
- a porta está fechada nesta cena (não havia estado/interação anterior); o compositor prova que aberta/fechada compartilham âncora e extensão. Portas verticais permanecem fora de W3-A por ausência de assets aprovados.
- pendem inspeção humana no Moto G06: seams, leitura da abertura A→B, estado visual aberto, depth com escrivaninha/cadeira, pan/enquadramento e conforto físico. Isto não aprova arte nem aparelho.

## W1 — registro técnico
- `space-a` (12×9 células, x=3/y=4) e `space-b` (10×8, x=13/y=17) pertencem à mesma cena/coordenadas; o conector em L preserva passagem contínua e suas duas portas são horizontais, sem troca de `RoomId`;
- `CELL_SIZE=32`, abertura=2 e corredor central=3; bounds derivados agora são 960×992 units, com margem exterior de quatro células;
- câmera inicia em A com viés para a saída, usa clamp X/Y e pan por pointer/touch; toque curto não inicia pan e cancelamento limpa o gesto;
- resize reaproveita a mesma instância/canvas e preserva a câmera clampada;
- piso usa material modular repetido; paredes usam os assets W3-A por composição declarativa, com fallback procedural somente se uma textura local falhar;
- testes puros cobrem spawn, extremos X/Y, curva e entrada de B, exigindo piso conectado substancial e presente no centro da viewport de retrato;
- nenhuma alteração Dexie, migração, backup ou persistência de câmera/layout;
- format/check, lint, typecheck, áudio, build, relatório de performance, Android sync/debug e diff passaram; Vitest integral passou com 702 testes e Playwright com 10 cenários; os fluxos históricos foram atualizados para abrir disclosures nativos antes de interagir;
- a auditoria removeu do runtime dez cópias públicas de paredes do Kit Zero sem referência na W1; as fontes continuam em `art-source/`, e o APK debug passou de 19.890.133 para 16.783.450 bytes, sem validação física inferida;
- W1 foi tecnicamente corrigida novamente após smoke test físico reprovado; nova validação no Moto G06 permanece pendente e não há aprovação do reboot.

## W3 estrutural — Processo 1 — estado atual

A primeira W3-A visual foi reprovada no Moto G06: o compositor por limites de piso tratou cantos de braços longos como juntas unitárias, deixando braços externos e segmentos sobrepostos. O pipeline RGBA, catálogo, IDs e fallback foram preservados, mas aquele compositor não é usado na execução normal. O Processo 1 criou um único cômodo persistente 12×10 (x=3..14, y=4..13): pisos são células, paredes/cantos/porta são arestas explícitas. Dexie v7 adiciona `worldStructures`; backup v5 preserva o estado e aceita v1–v4. O editor/inventário UI veio nos Processos 2; porta vertical continua fora do escopo. Validação visual/física no Moto G06 continua pendente.

## Processo 2 — Gate P2 técnico — 2026-08-27

P2-C1 conectou React, host, Phaser, casos de uso e projeção confirmada, com single-flight, token, unmount e recuperação de revisão obsoleta. P2-C2 acrescentou hit areas por modo, seleção estrutural, snap centralizado, previews efêmeros, lote de piso e cleanup sem persistência no canvas. P2-C3 adicionou regressão integrada/E2E, prova de backup v5 com `WorldStructureState` separado de `PlacedObject`, reload e correções responsivas localizadas. O Gate P2 é técnico; a inspeção física Moto G06, TalkBack e aprovação artística permanecem pendentes. Processo 3 não foi iniciado.
