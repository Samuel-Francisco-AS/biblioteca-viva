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

Nota de integração W2 (2026-08-24): o filesystem real usa `public/assets/world/architecture/floors/interior/` para os quatro pisos internos e `.../architecture/floors/exterior/` para o exterior. A grafia `arquitecture` citada em material operacional não existe no checkout atual; ela é dívida de consistência documental/técnica e não foi renomeada nesta correção.
| `architecture.wall.stone-01` | imagem (architecture/walls) | `art-source/world/architecture/walls/*.png` | Kit Zero, fontes em `art-source/world/architecture/walls/` | criação para o projeto; licença final acompanha o projeto | fontes preservadas, sem cópia de runtime | avaliado no W1; não empacotado por incompatibilidade de escala modular | revisão W5 |
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
