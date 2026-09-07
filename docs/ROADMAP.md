# Roadmap — Reboot espacial

> Estado operacional: 2026-09-06.

## W1 e W2 — histórico integrado

W1 estabeleceu a cena Phaser única, câmera e pan; W2 introduziu `PlacedObject` persistido. Permanecem como compatibilidade do reboot, mas a geometria estrutural vigente não é mais a planta fixa W1.

## W3-A — construção estrutural — rodada corretiva encerrada

- [x] W3-A1: modelo `WorldStructureState`, células, arestas, orientações e validação pura;
- [x] W3-A2: catálogo, 12 assets runtime RGBA, fallback e blueprint idempotente;
- [x] W3-A3: Dexie v7, backup v5, restore/reload e compatibilidade v4;
- [x] W3-A4: casos de uso, revisão otimista, single-flight, seleção React e alternativa acessível;
- [x] W3-A5: Phaser de uma cena/canvas, pan, snap, previews e lifecycle efêmeros;
- [x] W3-A6: progressão por sessões elegíveis, marcos 1/5/15/30, grants e feedback consolidado;
- [x] P3-C: regressão, E2E, áudio/assets/performance, documentação e APK debug.

Os itens abaixo registram a entrega técnica histórica do P3-C; não equivalem à aprovação atual da W3-A.

### Reprovação física posterior

O Moto G06 confirmou planta visualmente descontínua e UI de construção que cobre o mapa e bloqueia a manipulação. A evidência reabriu W3-A sem apagar o histórico de P3-C.

### Correção W3-A-R0–R6

- [x] **R0 — auditoria e especificação executável:** evidência técnica aceita para prosseguimento;
- [x] **R1 — geometria canônica e identidade:** R1-A/R1-B tecnicamente concluídas e aceitas pelo usuário;
- [x] **R2-A — contrato de arte e planos de junção:** tecnicamente concluída e aceita pelo usuário;
- [x] **Produção artística:** quatro candidatos determinísticos produzidos fora dos caminhos ativos e aprovados visualmente pelo usuário;
- [x] **R2-B1 — pré-integração e validação estrita:** tecnicamente concluída, com hashes conferidos, validação estrita e cinco montagens diagnósticas, e aceita nominalmente pelo usuário;
- [x] **R2-B2 — integração dos cantos:** tecnicamente concluída e aceita nominalmente; R2 integralmente encerrada;
  - [x] **R2-B2-A — preparação do pipeline:** tecnicamente concluída e aceita nominalmente pelo usuário;
  - [x] **R2-B2-B — integração controlada:** quatro candidatos promovidos, runtimes `production` validados, tolerância retirada do comando padrão e relatório derivado regenerado; aceita nominalmente pelo usuário;
- [x] **R3 — compositor e hit areas:** tecnicamente concluída; renderer, hit testing, depth e fallback procedimental compartilham a transformação canônica, e a repetição visual passou 9/9 com 31/31 emendas sem canal conectado de fundo;
  - [x] **R3-A — contrato puro de transformação visual:** metadado canônico dos 12 assets, fórmula por planos/insets, bounds, regiões de interação e composição pura dos oito encontros concluídos tecnicamente e aceitos nominalmente;
  - [x] **R3-B — integração de renderer e hit testing:** tecnicamente concluída, com posição/escala/bounds/regiões vindos de `structureVisualGeometry`, porta sem offset legado e cantos com hit area em dois braços; aceita nominalmente;
  - [x] **R3-C-A — depth estrutural canônico:** tecnicamente concluída com base visível inferior, bandas relativas ao interior e desempate estável; aceita nominalmente;
  - [x] **R3-C-B1 — fallback procedimental canônico:** retas, portas e cantos usam regiões visuais e depth da mesma transformação, com lifecycle sem Graphics órfãos; tecnicamente concluída e aceita nominalmente;
  - [x] **R3-C-B2 — evidência visual do renderer ativo:** repetição concluída com 9/9 casos, sete capturas coerentes e 31/31 emendas sem canal conectado de fundo;
  - [x] **W3-A-R3-C-B2-FIX — correção transversal subdividida:** rodada corretiva concluída sem mudança de asset ou persistência;
    - [x] **FIX-A — contrato transversal e oráculo de continuidade:** concluído tecnicamente e aceito nominalmente; detecta gaps, overlaps, saltos e incompatibilidades gerais nas composições sintéticas e B2 sem alterar posições;
    - [x] **FIX-B — correção geral subdividida:** B1, B2 e acabamento longitudinal aceitos e comprovados pela repetição visual;
      - [x] **FIX-B1 — contrato semântico de encaixe das portas:** concluído tecnicamente e aceito nominalmente; perfil estrutural horizontal único separado do envelope visual, sem mudança de posição;
      - [x] **reparo diagnóstico pré-FIX-B2:** inicialização visual restaurada por snapshot seguro antes do primeiro render, aceita nominalmente e confirmada manualmente no Firefox;
      - [x] **FIX-B2 — normal topológica e alinhamento assinado:** aceita; 31/31 junções e acabamento longitudinal de 14 px-fonte confirmados sem canal conectado de fundo;
    - [x] **FIX-C — consolidação/regressão posterior:** absorvida pelas regressões de consumidores de FIX-B2, sem abertura separada;
    - [x] **repetição de R3-C-B2:** concluída com 9/9 e nova baseline completa;
- [x] **R4 — máquina de estados e UI mobile:** tecnicamente concluída no escopo web após aprovação da direção visual; Construção funciona e persiste fora da planta inicial, atualiza sem reload, usa paletas/faixa de peças compactas e ações exclusivas; Resumo recebeu métricas e tipos compactos, histórico leve e gráfico real filtrável;
- [x] **R5 — regressão, compatibilidade e APK técnico:** concluída sem regressão de produto; smoke Firefox isolado, 49/49 testes em dois arquivos, build web, sync e build Android passaram; APK debug técnico gerado e não instalado;
- [x] **Gate final pré-R6 — limpeza de interface e desempenho inicial:** controles superiores obsoletos removidos, Busca/Filtros recolhíveis e acessíveis, boot instrumentado, leitura DEV deduplicada e texturas não essenciais adiadas; fluxo Firefox 320 px e APK debug concluídos;
- [x] **R6 — validação física final no Moto G06:** aprovada pelo usuário; controles do gate, dock, Busca/Filtros e preservação dos dados pessoais confirmados na aplicação Android real. A demora inicial da Biblioteca e o engasgo no card do Resumo, anteriores ao gate, foram aceitos como ressalvas não bloqueadoras e adiados para a fase final específica de otimização; desempenho físico não foi marcado como aprovado ou resolvido.

## Próxima etapa de produto

R3-C-B2, R4, R5, o gate final pré-R6 e R6 estão encerrados, e a rodada corretiva W3-A foi integralmente concluída. A próxima etapa de produto ainda não foi iniciada. A implementação estrutural usa somente piso/arestas/perfis e não contém correção por blueprint, coordenada ou `instanceId`. Estantes reativas, livros visuais vinculados às atividades, livro aberto manipulável e visualizador em forma de livro não fazem parte de R0–R6. Continuam fora do escopo XP, moeda, nível, streak, portas verticais, multiplayer, nuvem e novos mundos.
