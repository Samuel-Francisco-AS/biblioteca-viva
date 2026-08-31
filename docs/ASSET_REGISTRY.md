# Registro de assets e licenças

Todo asset visual, sonoro, fonte ou ícone incluído no projeto deve aparecer neste arquivo antes de um release.

## Regras

- não usar material sem origem conhecida;
- registrar licença e restrições;
- preservar comprovante quando a licença depender de compra;
- indicar modificações realizadas;
- diferenciar asset temporário, definitivo e gerado;
- não incluir arquivo de fonte proprietário no repositório sem permissão;
- não assumir que “gratuito” significa uso comercial ou redistribuição permitidos;
- assets gerados por IA precisam ter ferramenta, data e revisão humana registradas quando forem mantidos.

## Status

| ID | Tipo | Arquivo/manifesto | Origem/autoria | Licença | Modificado | Uso | Estado |
|---|---|---|---|---|---|---|---|
| `architecture.floor.wood-01` | imagem (architecture/floor) | `public/assets/world/architecture/floors/wood-floor-01-a.png`, `wood-floor-01-b.png`, `wood-floor-01-c.png`, `wood-floor-01-d.png` | nova geração por IA específica para o projeto, 2026-08-18 | criação para o projeto; licença final acompanha o projeto | conjunto visual substituído; cópias de runtime normalizadas deterministicamente de 1254×1254 para 1280×1280 px por Lanczos; fontes preservadas em `art-source/` | piso base do reboot espacial / Kit Zero | candidato em validação humana |
| `architecture.floor.exterior-ground-01-{a,b,c,d}` | imagem (architecture/floor exterior) | `public/assets/world/architecture/floors/exterior/exterior-ground-01-a.png` a `-d.png` | geração por IA específica para o projeto, 2026-08-22 | criação para o projeto; licença final acompanha o projeto | tratamento externo para reduzir seams; sem alteração destrutiva adicional no runtime | exterior/background do mundo W2, quatro variantes determinísticas | candidato em validação humana |
| `furniture.desk.wood-01` | imagem (furniture/desk) | fontes: `art-source/world/furniture/desks/wood-desk-01-{north,east,south,west}.png`; runtime: `public/assets/world/furniture/desks/wood-desk-01-{north,east,south,west}.png` | geração por IA específica para o projeto, 2026-08-26 | criação para o projeto; licença final acompanha o projeto | originais preservados; cópias runtime normalizadas para 256×256 px RGBA; W2.1 removeu por flood-fill o preto conectado à borda, produzindo alpha zero real sem alterar arte/pivot | W2, `furniture.desk.wood-01`, quatro orientações e footprint 3×2 | candidato em validação humana |
| `furniture.chair.wood-01` | imagem (furniture/seating) | fontes: `art-source/world/furniture/seating/chair-wood-01-a-front.png`, `-b-rear-oblique.png`, `-c-front-oblique.png`, `-d-rear.png`; runtime: `public/assets/world/furniture/seating/wood-chair-01-{north,east,south,west}.png` | geração por IA específica para o projeto, 2026-08-26 | criação para o projeto; licença final acompanha o projeto | originais preservados; cópias runtime normalizadas para 256×256 px RGBA; W2.1 removeu por flood-fill o preto conectado à borda, produzindo alpha zero real sem alterar arte/pivot; vistas mapeadas semanticamente para as quatro orientações | W2, `furniture.chair.wood-01`, quatro orientações e footprint 1×1 | candidato em validação humana |

Nota de integração W2 (2026-08-24): o filesystem real usa `public/assets/world/architecture/floors/interior/` para os quatro pisos internos e `.../architecture/floors/exterior/` para o exterior. A grafia `arquitecture` citada em material operacional não existe no checkout atual; ela é dívida de consistência documental/técnica e não foi renomeada nesta correção.
| `architecture.wall.stone-01` | imagem (architecture/walls) | fontes: `art-source/world/architecture/walls/wall-{corner-{ne,nw,se,sw},door-horizontal-{closed,open},horizontal{-1cell,-2cell},vertical{-1cell,-2cell}}.png`; runtime: `public/assets/world/architecture/walls/` (12 PNGs) | Kit Zero específico do projeto, fontes entregues em 2026-08-26 | criação para o projeto; licença final acompanha o projeto | cópias runtime PNG32 RGBA geradas por `scripts/process-wall-assets.mjs`; nenhum pixel removido: canal alpha já era real, sem fundo técnico conectado à borda detectado; metadata removida somente | W3-A: segmentos 1/2/4, cantos NE/NW/SE/SW, porta horizontal fechada/aberta; porta vertical ausente deliberadamente | candidato; validação humana pendente |

Nota W3 estrutural (2026-08-27): os cantos medem braços de quatro células na escala comum 300 px-fonte = 32 world units. A topologia observada é `ne` esquerda/cima, `nw` direita/cima, `se` esquerda/baixo e `sw` direita/baixo; o blueprint explícito os ancora pelo vértice, sem sobrepor segmentos. A porta horizontal aberta continua asset visual do mesmo vão lógico, ainda sem interação. Porta vertical não possui asset aprovado.
| `room-procedural-v1` | gráficos procedurais | `src/features/library-visual/phaser/roomManifest.ts` | autoria interna do projeto, 2026-07-31; ampliado em 2026-08-10 | código do repositório; licença final acompanha o projeto | formas e paleta configuráveis | primeira sala, estante, balcão, personagens, livro, luz e luminária de leitura desbloqueável | provisório |
| `audio-procedural-v1` | áudio sintetizado em runtime | removido do `audioBackend.ts` | autoria interna do projeto, 2026-08-06 | código do repositório; licença final acompanha o projeto | fallback reprovado na validação física | não usado | remover |
| `music-library-provisional-v1` | áudio WAV | `public/audio/library-ambient.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, progressão harmônica e melodia determinísticas | música em loop da Biblioteca | gerado |
| `ui-page-provisional-v1` | áudio WAV | `public/audio/ui-page.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, ruído determinístico envelopado | interface/navegação | gerado |
| `shelf-touch-provisional-v1` | áudio WAV | `public/audio/shelf-touch.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, papel e impacto suave | estante | gerado |
| `librarian-touch-provisional-v1` | áudio WAV | `public/audio/librarian-touch.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, duas notas consonantes | bibliotecária | gerado |
| `creature-touch-provisional-v1` | áudio WAV | `public/audio/creature-touch.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, glissando curto arredondado | criatura | gerado |
| `book-completed-provisional-v1` | áudio WAV | `public/audio/book-completed.wav` | autoria interna; gerado por `scripts/generate-audio-assets.mjs` em 2026-08-07 | criação própria; licença final acompanha o projeto | PCM mono 22.050 Hz/16-bit, três notas ascendentes | conclusão de livro | gerado |

A primeira sala e a paisagem sonora não usam conteúdo externo ou baixado. Phaser Graphics gera os elementos visuais. Os seis WAVs provisórios são criação interna determinística, reproduzível apenas com Node padrão e substituível pelo caminho ou manifesto. Ausência de arquivo sonoro degrada para silêncio. Nova validação humana decide se os itens gerados podem avançar de estado.

## Estados

- `provisório`: pode ser substituído e não entra em release sem revisão;
- `aprovado`: origem e uso validados;
- `restrito`: permitido apenas em condição específica;
- `remover`: não pode permanecer no projeto;
- `gerado`: produzido para o projeto, aguardando ou com aprovação.

## Dados mínimos por item

- ID estável;
- categoria: imagem, sprite, atlas, áudio, fonte, ícone ou outro;
- caminho no repositório;
- URL ou referência de aquisição, quando aplicável;
- autor e plataforma;
- nome e versão da licença;
- permissão para modificação e redistribuição;
- atribuição obrigatória;
- data de aquisição;
- alterações feitas;
- telas/cenas que usam o asset;
- responsável pela validação.

## Assets próprios

Para assets criados no projeto, registrar:

- arquivo-fonte;
- exportações usadas;
- autoria;
- data;
- ferramentas;
- resolução/escala;
- versão do manifesto;
- decisão sobre licença futura do repositório.

## Fontes

Fontes exigem cuidado separado:

- confirmar licença para embedding em aplicativo;
- não redistribuir arquivo comprado sem permissão;
- manter fallback de sistema;
- testar acentos e caracteres pt-BR;
- registrar subconjunto ou conversão, se houver.

## Release

Antes do Gate G11:

- [ ] todos os assets do bundle aparecem neste registro;
- [ ] atribuições obrigatórias estão no aplicativo ou documentação;
- [ ] nenhum item está em estado `remover` ou `restrito` incompatível;
- [ ] arquivos-fonte privados não foram empacotados por engano;
- [ ] screenshots e vídeo de portfólio também usam conteúdo autorizado.

## W3-A / P3-C — estado de assets estruturais

Os 12 PNGs runtime em `public/assets/world/architecture/walls/` correspondem um a um às fontes preservadas em `art-source/world/architecture/walls/`: quatro cantos, três segmentos horizontais, três verticais e porta horizontal aberta/fechada. `npm run wall-assets:check` valida presença, dimensão, PNG RGBA, alpha e bounds; o processamento gera PNG32 sem modificar `art-source`. O catálogo `WALL_ASSETS` usa os mesmos paths e fornece fallback Graphics se uma textura não carregar. Não há PNG ou definição de porta vertical. Seams, coesão e leitura artística permanecem pendentes de inspeção humana.
