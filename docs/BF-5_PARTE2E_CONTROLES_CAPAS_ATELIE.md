# BF-5 Parte 2E — seletores internos, capas e ateliê

Data: 2026-11-04. **Candidata de implementação; BF-5 aberta. Sem merge, aceite físico/artístico ou declaração de CI global verde.**

## Preparação e stack

`git fetch origin` confirmou checkout limpo, worktree único e HEAD `13c2af08fe5d24b1d007d8e292c7b1628c5d698c`, igual à branch remota e à cabeça da PR draft #28 (`feat/bf5-parte2d-entretenimento`). Nova branch `feat/bf5-parte2e-controles-capas-atelie`, derivada diretamente da #28, preserva #25/#26/#27. Node 24.18.0, npm 12.0.2, `npm ls --depth=0` íntegro; pacote/lock/dependências/versão sem alteração. Commit, push e PR draft encadeada autorizados expressamente pelo pedido.

Consultados AGENTS, STATUS/README/índice de ADRs, ADR-014–018, relatórios ativos da Parte 2/2B/2C/2D e contratos de arquitetura/dados/UX/Android/testes/arte/acessibilidade/segurança/desempenho. Código, testes, scripts, histórico de versões, portas, backup e Git conferidos. Orientações antigas de fase não iniciada permanecem cronologia; a solicitação atual autoriza esta implementação. Mundo/renderer e seis tipos não mudam.

## Auditoria e controles

O proprietário relatou tela branca com símbolo azul no Moto G06 ao selecionar foco/datas. Não houve reprodução física nesta entrega nem causa comprovada. Inspecionados separadamente: selects, inputs de data explícitos, helpers que produziam datas, rádios DOM já existentes e pontes de arquivo/Share/SAF. Não se atribui a essas famílias uma causa única.

Substituição global dos selects convencionais e calendários de data por `BVSelectSheet` / `BVDatePicker`:

- Estudo: duração 15/25/45 e unidade de progresso; cadastro/prazo, anotações e demais escolhas do fólio.
- Atividade Física: período do plano e dia consultado/registrado. Rádios de categoria e gráfico próprios anteriores preservados.
- Livro: estado/avaliação no formulário, início opcional, tipo de anotação e escolha explícita de citação no ateliê.
- Entretenimento: estreia/data assistida do cadastro e data assistida no fólio. Formatos/estados já usavam rádios DOM e continuam assim.
- Trabalho e demais formulários: prazo por helper compartilhado; data de experiência nas sessões.
- Coleção/Arquivo/Resumo: tipos, estado, etiqueta, ordenação/período conforme contratos anteriores. Ajustes: tamanho do texto.

Opções e calendário aparecem em `<dialog>` DOM na top layer, sobre o dock, com limites de viewport/safe area e rolagem em ambas as orientações. Seleção provisória, Cancelar/Confirmar, campos ano/mês/dia, calendário mensal, validação de datas civis/limites, ausência opcional e FormData/reset/required preservados. As escolhas não salvam artificialmente o registro: continuam sujeitas ao envio do fluxo correspondente. Escape/Back fecham só a superfície superior e devolvem foco; guardas de rascunho da página permanecem. Rádios/botões/entrada numérica permitem toque e teclado. Acessibilidade automatizada não representa aprovação TalkBack.

Arquivo do dispositivo, Share e SAF continuam nativos: são integrações distintas e necessárias, com seus contratos de cancelamento/erro anteriores. Não há dependência nova de picker Android para opções/datas. [ADR-019](decisions/ADR-019-controles-internos-capas-atelie.md).

## Capas e persistência

`RecordImage` / `RecordImagesPort` generalizam mídia; aliases `LocalPoster` / `PosterPort` preservam chamadores anteriores. Livros, filmes e séries possuem uma imagem por `entryId` na tabela `media`, fora das entidades e dos snapshots do mundo. Editor compartilhado nas ações recolhidas do fólio: importar, pré-visualizar, Salvar capa; substituir; preparar remoção e confirmar pelo mesmo salvamento, ou cancelar sem modificar o persistido. Falha mantém rascunho e permite repetir. Cabeçalho do livro apresenta capa proporcional ao lado da identidade; audiovisual conserva seu cabeçalho cinematográfico. Ausência mantém composição padrão, título/autor/estado/progresso legíveis.

Dexie **v13 aditiva**, mesmas dez tabelas/índices v12; upgrade atualiza apenas marcador. Fonte JPEG/PNG local até 10 MiB/24 MP; JPEG normalizado até 1600 px/350.000 caracteres, cabeçalho/dimensões revalidados. Save exige dono Livro/Filme/Série; substituição usa a mesma chave, remoção/exclusão isolam o dono. IDs, dados anteriores, relações, sessões e mundo preservados.

Backup **v6** mantém `media?`, checksum e restore atômico, agora aceitando capas de livros. Órfãos, duplicatas, formato/dimensões inconsistentes recusados. V6 antigo sem mídia continua aceito e restaura sem capas; fundos/PNGs/originais não entram no backup. Limite global de 10 MiB pode impedir exportar muitas capas, com erro explícito e sem descarte. Aplicativos antigos podem recusar capas de livro; downgrade não suportado. Testes usam somente imagens/registros fictícios, nunca base pessoal.

## Ateliê compartilhado

`BVShareComposer` compartilha interface/lifecycle/prévia/entrega; `BookImageShare` e `CinemaComposer` especializam os modos. `renderSharePlate` desenha com Canvas 2D local, sem screenshot do DOM, rede ou consulta a notas privadas.

Mantidos marcador/progresso e citação escolhida no Livro; lançamento, desejos, acompanhamento e conclusão/recomendação no audiovisual. Novos controles: 4:5, 9:16 e 1:1; Noturno editorial, Estreia celestial e Fólio de marfim; Cobre gravado, Selo lunar e ausência de moldura; alinhamento esquerdo/central/direito, posição central/inferior, título editável, mensagem, trecho escolhido editável, capa/gravura/fundo importado e escurecimento. Acabamento fica recolhido. Fonte editorial, ameixa/marfim/cobre, gravuras e ornamentos preservam O Códice Iluminado.

Prévia é o PNG real: 1080 × 1350/1920/1080, independente da tela. Edição invalida entrega anterior imediatamente; resultados assíncronos obsoletos não são promovidos. Texto excessivo gera erro legível em vez de corte silencioso. Alterar trecho não modifica citação salva. Cancelamentos/indisponibilidade/falhas de Share/SAF conservam composição e permitem salvar/repetir; operações concorrentes ficam bloqueadas.

Configuração/fundo duram a visita. Recorte central, sem crop livre ou editor de camadas. Escurecimento soma tratamento a um véu fixo de contraste. Não há serviço remoto, conta, metadados buscados, analytics ou inclusão automática de conteúdo privado.

## Flashcards

[ADR-020](decisions/ADR-020-baralhos-e-cartas-globais.md) registra a investigação de modelos globais, fronteiras, migração/associação, revisão independente, backup e integração futura por referência neutra no Canvas. É recomendação para uma entrega própria: sem tabelas/migração especulativas ou minigame nesta candidata. Cartas embutidas, IDs/texto, comandos e revisão atuais preservados, com regressão dirigida. Não introduz XP, moedas ou novas estruturas espaciais.

## Verificações

- **Unitários dirigidos PASS:** 13 arquivos/71 testes após as correções de contrato e, depois do ajuste de foco/required, 3 arquivos/9 testes PASS. Rodadas sobrepostas, sem soma como cobertura distinta. A rodada ampla anterior permanece discriminada abaixo. Cobrem seleção/cancelamento/Back/reset, datas civis/limites/bissexto/required, prévia e falhas/cancelamentos de entrega, capa em rascunho, upgrade/reabertura/ownership/duplicatas/restore/exclusão isolada e regressões de Livro/Coleção.
- **E2E:** seis cenários dirigidos distintos aprovados entre rodadas: Estudo/pomodoro, cartas, quatro modos de cinema, fólio/notas/citação/PNG de Livro, seletores/datas e capas/ateliê. Rodada final dos dois novos cenários **2/2 PASS, 19,7 s**; seletores 7,3 s, capas 10,7 s. Sem retries ou aumento de timeout. Valida toque/teclado/Back/Escape, retrato/paisagem, duração recuperada, datas do formulário, capa após reload/substituição/remoção, três proporções offline, assinatura/dimensões PNG e igualdade byte a byte com a prévia. Share/SAF têm contratos automatizados já exercitados; não se declara execução do chooser físico.
- **PASS:** lint, format:check, typecheck, build, audio:check, performance:report, android:sync, android:build:debug e `git diff --check`. Android sync executado pelo script de build, preservando os três plugins existentes. Warnings conhecidos de chunks >500 kB e `flatDir` mantidos. Entrypoint estático **651.821 bytes**, sem benchmark físico.
- **APK debug:** `android/app/build/outputs/apk/debug/app-debug.apk`, **6.360.372 bytes**, SHA-256 **`3a40defcc4908fe5856e5877197ff782a0da0caca90b570b6808f8f5c2d8b986`**. Gerado, sem instalação no Moto G06. APK não versionado.
- A CI da nova PR é independente desses gates locais e não foi declarada verde. Não houve rodada E2E ampla nova, teste manual, TalkBack ou aceite artístico/físico.

Evidências fictícias inspecionadas: [calendário em paisagem](evidence/BF-5P2E/calendario-paisagem.png), [capa no fólio](evidence/BF-5P2E/livro-capa-retrato.png), [ateliê retrato](evidence/BF-5P2E/atelie-retrato.png), [ateliê paisagem](evidence/BF-5P2E/atelie-paisagem.png); PNGs de Livro [4:5](evidence/BF-5P2E/livro-1350.png), [9:16](evidence/BF-5P2E/livro-1920.png), [1:1](evidence/BF-5P2E/livro-1080.png) e cinema [lançamento](evidence/BF-5P2E/banner-0.png), [desejos](evidence/BF-5P2E/banner-1.png), [acompanhamento](evidence/BF-5P2E/banner-2.png), [recomendação](evidence/BF-5P2E/banner-3.png). A fixture gráfica de céu é a mesma imagem fictícia original da Parte 2D. Evidências antigas foram preservadas; capturas desta execução ficam na pasta Parte 2E. Full-page conserva a coordenada fixa do dock e não comprova sobreposição permanente durante a rolagem.

Baseline remoto auditado da #28: [CI 41898923694](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41898923694) **FAIL**. Lint/formato/tipos PASS; unitários **780 PASS/1 FAIL**, expectativa antiga `experienceSettingsRepository` exigia banco v11 quando o produto já era v12. E2E shards **15 PASS/14 FAIL** e **15 PASS/13 FAIL**, total **30 PASS/27 FAIL**; build dos shards PASS, áudio/build/performance do job estático não executados após o unitário. Essa é evidência anterior a esta intervenção, não novas regressões atribuídas automaticamente à Parte 2E. Issues #4/#11/#15/#21/#22/#23/#24 e demais pendências não são declaradas resolvidas.

A rodada local ampla desta candidata teve **777 PASS/9 FAIL (113 arquivos/786 testes)**: sete expectativas relacionadas à nova apresentação/versão, a expectativa v11 preexistente e um timeout de `inhabitantAgency` em 5 s. As oito expectativas de contrato foram atualizadas sem omitir asserts de preservação/reabertura. O timeout da agência já ocorrera em entregas locais anteriores e não foi repetido nem teve limite ampliado; não foi a falha unitária da CI #28, e não se presume causa do runner. A rodada ampla não é reclassificada como verde por testes dirigidos posteriores.

Falhas intermediárias: primeiro teste dos controles detectou associação do rótulo ao input auxiliar; campo foi reposicionado depois do botão. JSDOM node exigiu guarda do stub de diálogo; expectativas de chamadas do compositor e datas foram adaptadas às interações reais. Teste novo de backup tinha fixture de estudo sem `progressUnit` e foi corrigido. Build intermediário rejeitou setter de erro ainda não conectado; corrigido sem cast/disable. Primeiro E2E novo detectou foco recusado por opener ainda inerte após Back; fechamento síncrono do diálogo antes da restauração corrige essa ordem. A rodada seguinte confirmou o foco e avançou até a consulta do botão Dia; testes foram adaptados para papel/nome do botão, mantendo as verificações de valor. Uma substituição excessivamente ampla também atingiu o campo Dia do helper de calendário e foi corrigida; o cenário então passou em 7,8 s, antes da rodada final 2/2. A inspeção visual detectou altura intrínseca da capa esticando o cabeçalho: CSS/grade móvel corrigidos e assert de proporção/ausência de overflow acrescentado; botões secundários do calendário receberam fundo/contraste explícitos. O PNG passou a respeitar a separação entre texto e mensagem. Nenhum assert, retry ou timeout foi reduzido/ampliado para ocultar falha.

## Arquivos principais

- `src/ui/BVPicker.tsx`, `pickers.css`, `BVChoiceGroup.tsx`: seletores e escolhas; testes em `BVPicker.test.tsx` e helpers reais em `src/test/pickers.ts` / `e2e/pickers.ts`.
- `src/ui/RecordCoverEditor.tsx`, `useRecordCover.ts`, `record-cover.css`: importação em rascunho, gravação por porta e apresentação de capa; teste do editor e `infrastructure/database/recordImages.test.ts`.
- `src/features/share-composer/`: estado/controles/estilo/Canvas compartilhados; adaptadores em `book-share/` e `entertainment/`.
- Fólios, formulários e filtros em `features/entry-detail`, `entry-editor`, `sessions`, `collection`, `archive`, `statistics` e `settings`; respectivos testes e fixtures E2E adaptados às interações novas.
- `application/media.ts`, `infrastructure/database/{media,schema,database}.ts`, `infrastructure/backup/backupCodec.ts` e testes de migração/reabertura/backup.
- `e2e/bf5-parte2e-controles-capas.spec.ts`, evidências fictícias Parte 2E, STATUS/ROADMAP/UX/DATA_MODEL/ARCHITECTURE/ANDROID/CHANGELOG e ADR-019/020. A aba Files changed da PR contém o manifesto integral.

## Roteiro Moto G06

Validação física ampla acumulada para fase posterior por opção do proprietário. Roteiro dirigido desta candidata, ainda **NOT RUN**:

1. Guardar backup recuperável antes de atualizar APK sem limpar dados. Abrir os seis tipos anteriores; conferir IDs/relações/notas/sessões e acesso/retorno pela Biblioteca.
2. Estudo: abrir duração, alternar 15/25/45, cancelar/confirmar, iniciar foco e reabrir. Conferir duração e recuperação. Testar unidade, anotações e prazo; nenhuma superfície branca de opções.
3. Treino: selecionar início/fim e dia por calendário/campos numéricos, cancelar/confirmar, mudar mês/ano, consultar passado/futuro e salvar um dia fictício. Reabrir e conferir data/execução. Repetir estreia/data assistida de audiovisual, início de livro e prazo de Trabalho.
4. Coleção/Arquivo/Resumo/Ajustes: testar filtros, ordenação e tamanho do texto; Back/Escape fecha só seletor, retorna ao controle e preserva o painel/rascunho. Repetir retrato/paisagem, teclado aberto, fonte ampliada e TalkBack. Conferir alvos, foco e dock.
5. Livro e audiovisual: escolher JPEG/PNG, cancelar importação, rejeitar arquivo inválido/grande, pré-visualizar e salvar. Fechar/reabrir app e conferir capa. Substituir, cancelar remoção e depois remover apenas a imagem de um registro fictício.
6. Ateliê offline: todos os modos, três proporções, moldura/layout, capa/fundo próprio, título/trecho/mensagem/alinhamento/posição/escurecimento. Abrir o PNG fora do app; comparar prévia, legibilidade e ausência de notas privadas. Compartilhar/cancelar; salvar/cancelar SAF; voltar ao fólio.
7. Em ambiente descartável com dados fictícios, exportar/restaurar backup com capas de livro/audiovisual e um v6 antigo sem mídia; conferir registros/imagens/cartas/histórico. Não substituir dados pessoais sem confirmação e recuperação.
8. Registrar conforto, arte, movimento reduzido, TalkBack, rotação, lifecycle e fluidez percebida. Nenhum resultado automatizado antecipa esse aceite.
