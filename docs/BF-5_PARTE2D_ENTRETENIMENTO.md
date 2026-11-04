# BF-5 Parte 2D — Entretenimento

Data: 2026-11-04. Implementação candidata completa para avaliação. **BF-5 aberta; sem merge ou aceite artístico/físico.**

## Stack e auditoria

`git fetch origin` confirmou checkout limpo e worktree único em `feat/bf5-parte2c-atividade-fisica`, SHA `17bb336e5cfcef232c77ac0a9aac93d5a89479e2`, igual ao remoto e à cabeça da PR draft #27. #27 depende da #26 (`e4d88e7`), que depende da #25 (`5fcc7ec`), sobre `main` (`f35258c`). Nova branch `feat/bf5-parte2d-entretenimento`, encadeada à #27. Commit/push/PR draft autorizados pelo pedido; sem alteração da versão do pacote ou dependências.

Inspecionados AGENTS, STATUS/README, DATA_MODEL, WORLD, UX, relatórios BF-5 das entregas anteriores, decisões aplicáveis, domínio/schema, sessões, anotações, organização, filtros, backup v6, PNG/SAF Android e projeções. A fixture 3D continua descartável: classificação audiovisual não cria contratos espaciais. [ADR-018](decisions/ADR-018-entretenimento-catalogo-midia-local.md) registra a decisão vigente.

## Experiência entregue

- Cinco grupos na Coleção, cadastro, Arquivo e Resumo: Livro, Entretenimento, Estudo, Atividade física e Trabalho. Biblioteca mantém seis tipos técnicos. Busca, ordenação, favoritos, etiquetas, contagens, links e filtros técnicos anteriores preservados.
- Quatro escolhas gráficas de formato; Anime/Animação podem ser unitários ou episódicos. Opções e estados em botões/rádios DOM, sem selects nativos no novo cadastro/compositor. Mudar estrutura durante um rascunho preenchido pede confirmação; edição conserva o discriminante original.
- Título obrigatório; plataforma, ano, gênero, estreia, poster, duração/direção, avaliação, data assistida, totais de temporadas/episódios e marcador são opcionais conforme estrutura. Nenhuma informação de lançamento é inventada ou consultada em rede.
- Catálogo pessoal com desejos, favoritos, lançamentos, andamento e concluídos sobrepostos, sem duplicar obras. Filtros internos em disclosure e grade responsiva, sem nova barra longa. Busca inclui formato, gênero, ano e estreia.
- Fólio cinematográfico contínuo em marfim/ameixa/cobre: poster, identidade, estado, favorito/desejos, contagem civil, marcador/progresso/temporadas, diário e compositor. Organização, histórico e ações secundárias recolhidos. Exclusão usa diálogo modal, foco/restauração e contraste explícito.
- Notas/opiniões e citações reutilizam contratos existentes: minuto para filme; temporada/episódio e minuto opcional para série. Edição, compartilhamento textual, exclusão e Arquivo preservados. Opções por anotação ficam recolhidas no fólio audiovisual.
- Acompanhamento grava estado, avaliação e marcador juntos; revisão esperada evita sobrescrita obsoleta. Temporadas concluídas ficam separadas do número global de episódios. Sessões e histórico antigos continuam disponíveis no painel secundário, sem conversão ou duração inventada.
- Compositor real com quatro modos, duas composições, poster/fundo local/gravura, mensagem editável, prévia do próprio arquivo, PNG 4:5/9:16, salvamento web/Android e compartilhamento. Nenhuma nota privada entra automaticamente na imagem. Cancelamento/falhas preservam a imagem; exportação fica bloqueada enquanto a prévia está obsoleta.
- Proteção de rascunhos por link, unload e Back Android; modais tomam Back e retornam foco. Disclosures, controles confortáveis, grade responsiva, dock recolhido durante formulários e movimento reduzido. Datas reconciliadas na montagem/retorno de lifecycle e enquanto a tela permanece aberta.

## Campos e compatibilidade

`MovieEntry.catalog?` / `SeriesEntry.catalog?` são opcionais:

| Campo | Contrato |
| --- | --- |
| `format?` | `film`, `series`, `anime`, `animation`; `film` exige `movie`, `series` exige `series`; demais aceitam ambos. Ausente usa o discriminante legado. |
| `wishlist?` | Booleano independente do favorito; ausente deriva de `planned`. |
| `intent?` | `release` ou `rewatch`; só muda apresentação de `planned`/`in_progress`. |
| `releaseDate?`, `watchedOn?` | Datas civis ISO válidas; sem timestamp/fuso embutido. |
| `genre?`, `year?` | Gênero até 160 caracteres; ano positivo até 9999. O campo legado `movie.year` continua canônico para filmes; o editor mantém valores coerentes. |
| `rating?` | Inteiro 1–5; ausência significa sem avaliação. |
| `seasonCount?`, `completedSeasons?` | Total conhecido positivo até 10000 e lista única de números positivos até esse total; ausência não exige completar temporadas/episódios desconhecidos. |

`movie`/`series`, campos legados, sessões, favoritos, etiquetas, IDs, revisão e relacionamentos continuam existindo. `SaveEntertainment` é um comando específico; não altera o contrato global de transições dos outros tipos. Progresso de episódios preserva os limites existentes e pode concluir ao atingir um total conhecido. Marcador manual não cria artificialmente uma sessão de visualização; histórico continua sendo o das sessões registradas.

Dexie **v12**, com tabela `media` adicional às nove da v11; upgrade só cria a tabela/marcador, sem reescrever linhas. Cada poster é identificado e possuído pelo `entryId`, separado da entidade e do mundo. JPEG/PNG local de até 10 MiB/24 MP passa por validação e normalização até 1600 px/350.000 caracteres de data URL JPEG. Substituição/remoção/exclusão não afetam a mídia de outra obra. Falha de poster após criação mantém a obra e permite repetir só a mídia.

Backup **v6** inclui `media?` opcional com JPEG reduzido, ownership/duplicatas validados e checksum, sem originais/fundos/PNGs. Backups antigos continuam aceitos; restore substitui posters e registros em transação, e backup sem mídia resulta em ausência de posters. Limite global de **10 MiB** mantido: coleção com muitas imagens pode excedê-lo e receber erro explícito; não há descarte silencioso. Downgrade não é suportado. [Justificativa e consequências completas](decisions/ADR-018-entretenimento-catalogo-midia-local.md).

## Verificações

- **Unitários dirigidos PASS:** rodada de 188 testes/28 arquivos incluindo domínio, aplicação/sessões, banco/migrações, backup, formulários, Coleção/Arquivo, livro, compositor, lifecycle e arquitetura. Após o agrupamento do Resumo e os ajustes finais, 59/8 e última rodada 49/9 PASS, incluindo estatísticas, limites de imagem, ownership/restore, projeção/layout e fronteiras. São rodadas com sobreposição, não uma soma de cobertura distinta. A suíte global não foi repetida.
- **E2E:** 10/10 PASS em 1,4 min na rodada de novos fluxos + Livros/Estudo/Atividade Física/Coleção. Na rodada posterior com cobertura extra, os três novos cenários voltaram a passar (13,7s, 9,3s, 15,2s), incluindo edição que conserva poster/favorito/progresso, agrupamento do Resumo e exportação offline nos quatro modos. Dois cenários antigos, depois de corrigidos seus acessos aos disclosures/rótulos, passaram em 19,2s/4,6s (25,5s total). **12 cenários dirigidos distintos aprovados entre rodadas**; não se declara uma rodada global integral verde.
- **Pendência dirigida:** `reading-area: seis tipos abrem pela Biblioteca e preservam edição e retorno` FAIL por limite total de 30s, antes da abertura do detalhe de filme. O snapshot ainda estava na Biblioteca. Não houve nova tentativa, aumento de timeout ou alteração do renderer; a causa exata não foi demonstrada. A suíte de projeção/layout/arquitetura passou e compara explicitamente as identidades antes/depois de novos metadados, mas não substitui essa evidência E2E pendente nem o gate físico.
- **PASS:** format:check, lint, typecheck/build, audio:check, performance:report, android:sync, android:build:debug e git diff --check. APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`, **6.360.130 bytes**, SHA-256 `83c230dc132dc57256ab3f7867e204a8333de1019f03763a3128f503eba9b65f`. Build técnico sem instalação. Warnings conhecidos de chunks >500 kB/flatDir permanecem. Entrypoint 651.559 bytes é medida estática, não benchmark do Moto G06.

Falhas intermediárias: testes anteriores ainda esperavam seis grupos e banco v11/nove tabelas; expectativas avançadas para cinco grupos/v12/dez tabelas, mantendo os asserts de legado. Primeira inspeção visual detectou herança de cores do shell sobre o fólio; tokens/controles locais corrigidos e contraste de títulos/links ≥4,5:1 coberto no E2E. Regressão R4 aguardava Editar dentro do disclosure fechado do livro da Parte 2; teste agora o abre. Regressão R5 tinha rótulo parcial que encontrava campo e checkbox de temporada; agora usa nome exato e preserva asserts de progresso 8/9 e citação. Erros de tipos/lint de callbacks/valores externos foram corrigidos sem any, cast cego, disable ou omissão de assert. Nenhum timeout/retry foi acrescentado.

A geração binária é verificada pela assinatura PNG e dimensões 1080 × 1350/1920, além do conteúdo da prévia. Contratos de Share/SAF cobrem nomes de livros/cinema, cancelamento, indisponibilidade, falha e possibilidade de salvar; não equivalem à execução do chooser no Android real. Sem alegação de CI global, teste físico ou aceite artístico.

Baseline remoto auditado da PR #27: [CI 41887463492](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41887463492) **FAIL**, gates estáticos/unitários/build PASS; shards E2E 12 PASS/15 FAIL e 17 PASS/10 FAIL, total **29 PASS/25 FAIL**. São falhas anteriores ao SHA desta Parte 2D, não novas regressões atribuídas automaticamente a ela. Issues #21/#22/#23 e demais dívidas acumuladas não são declaradas resolvidas; resultado remoto desta PR deve ser comparado a esse baseline por cenário e causa.

## Evidências fictícias

[Cadastro](evidence/BF-5P2D/cadastro-anime.png), [fólio retrato](evidence/BF-5P2D/folio-anime-retrato.png), [fólio paisagem](evidence/BF-5P2D/folio-anime-paisagem.png), [compositor retrato](evidence/BF-5P2D/compositor-retrato.png), [compositor paisagem](evidence/BF-5P2D/compositor-paisagem.png). PNGs reais: [lançamento](evidence/BF-5P2D/banner-0.png), [desejos](evidence/BF-5P2D/banner-1.png), [acompanhamento](evidence/BF-5P2D/banner-2.png), [recomendação](evidence/BF-5P2D/banner-3.png), [story](evidence/BF-5P2D/banner-story.png).

A imagem `e2e/fixtures/entertainment/ceu-ficticio.jpg` é uma fixture sintética original, desenhada localmente com gradiente, estrelas, lua e montanhas, sem fotografia, texto pessoal ou conteúdo remoto. Somente os testes a importam; runtime oferece gravura Canvas própria e imagens escolhidas pelo usuário. Capturas full-page guardam a posição fixa do dock no viewport e não provam sobreposição durante o uso.

## Limites e avaliação Moto G06

Sem calendário completo de estreias por temporada/episódio, notificações ou metadados externos. Atualizar o relógio do aparelho altera o dia civil considerado. Fundos e configurações do compositor duram a visita, não são rascunhos persistentes; poster e catálogo são persistentes. JPEG normalizado não preserva transparência/metadados originais. Composição faz recorte central, sem editor de crop; textos excessivos pedem redução. Banco/web offline não significa service worker para abrir uma instalação web nunca carregada; APK contém os recursos locais.

1. Atualizar o APK preservando dados; abrir Filme/Série anteriores e verificar poster ausente, sessões, notas, etiquetas, favorito e seleção/abertura no Canvas.
2. Criar Filme, Série, Anime e Animação, incluindo unitário/episódico. Deixar totais desconhecidos; editar metadados, desejo e favorito; conferir os cinco grupos e filtros.
3. Informar estreia futura; suspender/retomar e reabrir, conferir data/contagem local. Atualizar episódios/temporadas/avaliação e reler após reinício. Conferir histórico legado e citações por minuto/T/E.
4. Importar poster e fundo próprio; cancelar seletor, testar arquivo inválido e substituir imagem. Exportar os quatro modos e story, abrir o PNG fora do app, compartilhar/cancelar e salvar por SAF. Conferir mensagem, recorte e ausência de notas privadas.
5. Com dados fictícios, exportar/restaurar backup com posters e um v6 antigo; verificar imagens, sessões e mesmos IDs. Nunca substituir dados pessoais sem recuperação/consentimento explícitos.
6. Avaliar teclado, dock, rotação, fonte ampliada, contraste, movimento reduzido, foco/Back/modal/TalkBack e fluidez. Avaliar arte e personalidade da composição. Registrar os resultados humanos; a candidata não os antecipa.
