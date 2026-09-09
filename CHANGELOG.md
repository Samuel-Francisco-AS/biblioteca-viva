# Changelog

Mudanças observáveis da Biblioteca Viva seguem a estrutura do Keep a Changelog. O registro bruto anterior à reorganização documental, incluindo checkpoints intermediários, está preservado em `docs/history/legacy/CHANGELOG_LEGACY.md`.

## [Não lançado]

### F1-CLOSE — Fundação Three.js aprovada — 2026-09-09

- concluída a F1 com a fundação Three.js integrada por host React próprio, cena técnica 3D, fixture GLB, interação bidirecional, lifecycle explícito e diagnóstico local;
- registrado o gate físico aprovado no Moto G06, incluindo aproximadamente 60 FPS estabilizados na cena mínima, pan, pinch, picking, dez ciclos, background/resume e recuperação limpa após process death;
- promovido Three.js a renderer aprovado da Fundação pela ADR-009, sem aprovar a Biblioteca final, pipeline 3D, persistência espacial, TalkBack ou performance de cenas complexas;
- encerrado e arquivado o contrato temporário F0-D; F2 passa a ser a próxima fase.

### F1-F-FIX — Alternativa React no Android — 2026-09-09

- registrada a evidência humana inicial positiva da F1-F e o comportamento físico incompatível do `<select>` no Moto G06, que abria uma superfície branca vazia;
- removidos o dropdown, suas opções e o label específico, sem alterar picking, highlight, gestos, câmera, cena, lifecycle ou observabilidade;
- adicionados botões HTML nativos `Anterior`/`Próximo` com wrap centralizado, usando a seleção emitida pelo runtime como única fonte de verdade;
- ampliados testes React e Chromium para navegação nos dois sentidos, extremidades, seleção Three → React → Three e layout mobile;
- gerado novo APK debug para revalidação curta; F1-F permanece em validação humana e Three.js continua candidato experimental.

### F1-E — Gates técnicos consolidados e Android — 2026-09-09

- auditados os gates T1–T6 da Fundação Three.js sem adicionar funcionalidade ao mundo;
- consolidados regressão convencional, build Vite de produção, baseline Chromium desktop/mobile, ponte React ↔ Three e dez ciclos de lifecycle;
- confirmadas as fronteiras arquiteturais, o baseline estrutural de 46 meshes/11 selecionáveis/46–47 draw calls/546 triângulos e a ausência de persistência espacial;
- concluídos sync Capacitor e build Gradle debug, com APK técnico identificado para a validação humana no Moto G06;
- preservados Three.js como candidato experimental, R-09 como risco aberto e F1-F como gate físico pendente.

### F1-D — Lifecycle formal e observabilidade — 2026-09-08

- formalizados os estados `created`, `mounted`, `running`, `paused` e `disposed`, com start/pause/resume/dispose idempotentes, um único RAF e proteção contra callbacks tardios;
- integradas pausa por visibilidade, retomada previsível, cancelamento seguro de gestos, resize por `ResizeObserver` com fallback de `window.resize` e cleanup determinístico;
- adicionados snapshots locais de FPS, frame time médio, `renderer.info`, malhas, objetos, selecionáveis, primeiro frame utilizável e carregamento do GLB, exibidos em uma superfície React compacta atualizada em até 4 Hz;
- ampliada a cobertura unitária de métricas/lifecycle/disposal e a E2E Chromium com dez ciclos completos de saída e retorno, canvas/loop únicos e interação funcional após a repetição;
- preservados a cena e o bundle experimentais sem biblioteca de métricas, analytics, telemetria, persistência espacial ou funcionalidade da F1-E.

### F1-C — Interação e ponte React ↔ Three — 2026-09-08

- adicionados pan desktop/touch por Pointer Events, wheel zoom e pinch experimental com limites, distinção de tap/drag e pointer capture defensivo;
- onze objetos técnicos receberam IDs e labels efêmeros; piso e paredes permanecem fora da seleção;
- picking passou a usar `Raycaster` e resolve meshes filhos do GLB para o objeto lógico selecionável;
- seleção ganhou highlight ciano por `Box3Helper`, removido e descartado ao trocar, limpar ou desmontar;
- `WorldRuntime` passou a expor catálogo, callback de seleção e comando por ID, formando a ponte Three ↔ React sem persistência;
- adicionada superfície React compacta com texto `aria-live` e `select` HTML nativo como alternativa ao canvas;
- adicionada cobertura unitária e Chromium para seleção, gestos, cleanup, ponte bidirecional e viewport mobile sintético, sem antecipar a observabilidade da F1-D.

### F1-B — Cena de referência + GLB — 2026-09-08

- substituída a geometria única da F1-A por uma cena técnica descartável com piso, quatro segmentos de parede, quatro tipos de proxies e 46 meshes visíveis;
- mantida a câmera ortográfica em apresentação 2.5D e adicionadas iluminação hemisférica e direcional simples, materiais baratos e sombras desligadas;
- adicionado o fixture interno `f1-technical-pyramid.glb`, carregado pelo addon oficial `GLTFLoader`, com procedência registrada e sem pipeline 3D formal;
- falha de asset passou a ser diagnosticável sem derrubar o canvas ou o aplicativo convencional, e callbacks tardios após unmount descartam o modelo carregado;
- disposal passou a liberar geometrias, materiais e texturas da cena e do fixture sem descarte duplicado de recursos compartilhados;
- adicionados testes do GLB real, construção da cena, sucesso/erro/loading tardio, disposal e smoke Chromium observável, sem antecipar interação da F1-C;
- ajustada a altura do canvas em viewport estreita para preservar leitura da cena e evitar espaço vertical excessivo.

### F1-A — Bootstrap da Fundação Three.js — 2026-09-08

- incorporada a documentação final da F0 e instalado o contrato F0-D como autoridade temporária da F1;
- adicionado `three@0.185.1` como candidato experimental, carregado sob demanda pela rota Biblioteca;
- criada a fronteira `LibraryPage → WorldHost → ThreeWorldRuntime`, com `WebGLRenderer`, `Scene`, `OrthographicCamera`, uma geometria técnica e um único canvas;
- adicionado lifecycle explícito de mount, start, pause, resume, resize e disposal, com limpeza de loop, observer, listener, canvas e recursos Three;
- falha de inicialização do renderer passou a apresentar fallback textual sem bloquear as áreas convencionais;
- adicionados testes de contrato/lifecycle/React e smoke Chromium de mount, unmount e remount sem acúmulo de canvas;
- Dexie v8, backup v6 e as fronteiras de domínio/aplicação permanecem inalterados; não foi criado estado espacial persistente.

### WORLD RESET — 2026-09-08

- removidos integralmente o mundo visual anterior, seu renderer Phaser, Construção, contratos espaciais, progressão estrutural, salas, personagens, diálogos, assets, fontes, candidatos, guias, scripts e testes exclusivos;
- a rota Biblioteca passou a apresentar um placeholder React curto e acessível, sem canvas ou estado espacial;
- removido `phaser` e o preload visual; o aplicativo abre diretamente pelo bootstrap React;
- criado o schema Dexie v8, que descarta os dados de desenvolvimento existentes e mantém somente as tabelas convencionais no schema ativo;
- criado o backup v6 somente para dados convencionais; formatos v1–v5 são deliberadamente incompatíveis e rejeitados antes da escrita;
- preservados os dez marcos convencionais, sem rewards, grants, decoração, diálogo ou efeitos no mundo;
- reconciliada a documentação para um baseline sem mundo e registrada a direção futura de 3D real com apresentação ortográfica/2.5D, sem escolha de renderer neste checkpoint.

### Adicionado

#### Produto e registros

- união discriminada de seis tipos de registro: Livro, Filme, Série, Estudo, Atividade física e Trabalho;
- criação, edição, detalhamento, progresso e conclusão especializados por tipo;
- Coleção unificada, busca, filtros, ordenação e redirecionamentos para URLs históricas de livros;
- notas e citações generalizadas para os tipos compatíveis, com edição, exclusão confirmada e compartilhamento explícito;
- etiquetas normalizadas e favoritos em registros, notas e citações;
- sessões tipadas e persistentes, com uma sessão aberta globalmente, pause, retomada e duração baseada em timestamps;
- timeline, sessões recentes, estatísticas por período e categoria e resumo global da Biblioteca;
- métricas derivadas sem tabela própria, score, ranking ou streak.

#### Dados, backup e progressão

- schema Dexie v4 para registros múltiplos e anotações generalizadas;
- schema Dexie v5 com tabelas de etiquetas e sessões;
- schema Dexie v6 com `placedObjects`;
- schema Dexie v7 com `worldStructures`;
- backup v3 para etiquetas, sessões e dados da fase P1;
- backup v4 para objetos posicionados;
- backup v5 para estrutura persistente, preservando leitura dos formatos v1 a v4;
- inspeção de backup sem escrita, integridade SHA-256, restauração transacional e união monotônica de marcos;
- marcos idempotentes, recompensas declarativas e progressão estrutural por sessões elegíveis;
- concessões físicas por família nos limiares 1, 5, 15 e 30, com inventário derivado.

#### Experiência convencional

- sistema visual escuro semântico e componentes responsivos;
- dock global com Biblioteca, Coleção, Arquivo, Resumo e Ajustes;
- Novo registro como ação contextual da Coleção;
- Busca e Filtros recolhíveis, com estado preservado, foco, Escape e Android Back;
- Resumo com métricas reais, estados vazios, tipos compactos e gráfico SVG responsivo;
- preferências de movimento, contraste e tamanho de texto;
- edge-to-edge Android com system bars transparentes e safe areas.

#### Biblioteca visual e reboot espacial

- host Phaser carregado sob demanda, com uma instância, uma cena e um canvas;
- projeção tipada entre aplicação, React e Phaser;
- W1 com mundo maior que a viewport, câmera, bounds, pan e atmosfera por período;
- W2 com objetos persistentes, seleção, mover, girar, drag coalescido, preview e rollback;
- pisos internos e exteriores modulares, objetos de mesa e cadeira em quatro orientações e fallback procedural;
- `WorldStructureState` persistente para `world.main`, separado de `PlacedObject`;
- catálogo estrutural de pisos, paredes de 1/2/4 células, quatro cantos e porta horizontal aberta/fechada;
- editor de Construção para piso e peças, com revisão otimista, single-flight e inventário físico;
- alternativa textual acessível, feedback consolidado de desbloqueio e ação `Abrir construção`;
- etiqueta contextual de sala/período com ciclo de 5.000 ms;
- faixa compacta de peças colocadas e ações contextuais que preservam o mapa como superfície principal.

#### Áudio, conteúdo e qualidade

- serviço de áudio atrás de porta da aplicação;
- seis WAVs próprios e determinísticos, com silêncio como fallback;
- playlist musical declarativa, sequencial e validada;
- preferências independentes de música e efeitos;
- conteúdo contextual local, locale `pt-BR`, fallbacks e seleção determinística de diálogos;
- diagnóstico técnico restrito a desenvolvimento e builds internos;
- suíte Playwright Chromium e CI web;
- validações de assets estruturais, relatório de desempenho e scripts Android reproduzíveis.

### Alterado

- o produto deixou de ser centrado apenas em livros e passou a representar seis tipos de experiência;
- a direção inicial de cinco salas temáticas foi substituída por um mundo espacial contínuo, semanticamente neutro e construído pelo usuário;
- a antiga navegação por drawer foi substituída por um dock único;
- a Biblioteca deixou de trocar salas por arraste; o gesto em área livre passou a explorar o mundo;
- Construção passou a ocultar temporariamente o dock sem desmontar o host Phaser;
- o blueprint fixo W1 deixou de ser a autoridade da estrutura; `world.main` persistido passou a ser a fonte de verdade;
- estrutura e objetos passaram a possuir agregados, regras de ocupação e persistência independentes;
- o renderer estrutural deixou de consultar offsets, pivôs e spans visuais legados;
- sprite, fallback, hit testing, preview, seleção e depth passaram a consumir a mesma transformação canônica;
- o inventário deixou de ser uma contagem independente e passou a ser derivado de reserva, placements e concessões;
- restauração em base preenchida passou a exigir escolha explícita sobre backup de segurança;
- música passou a ser preparada após gesto permitido e a reutilizar decodificação entre entradas;
- fluxos automatizados foram adaptados aos disclosures e à navegação vigentes;
- somente as 17 texturas necessárias ao mapa inicial permanecem bloqueantes; 11 texturas são carregadas depois do primeiro frame;
- a leitura inicial duplicada em desenvolvimento pelo StrictMode foi deduplicada.

### Corrigido

#### Produto, dados e Android

- exportação Android passou a diferenciar salvamento em destino escolhido e compartilhamento nativo;
- exclusão de registros, anotações e atividades relacionadas passou a ser transacional;
- restauração preserva marcos legítimos e não repete recompensa, áudio ou notificação;
- atualização de schema preserva IDs, datas, revisões, objetos e conteúdo existente;
- aviso de backup v5 passou a comparar corretamente com o schema Dexie v7;
- sessão ativa restaurada volta em estado seguro, sem acumular duração fictícia;
- rolagem vertical e rodinha do mouse deixaram de disputar toque curto no canvas;
- Android Back passou a fechar subestados antes de sair da rota ou encerrar o aplicativo.

#### W1 e W2

- caminhos de assets internos foram reconciliados com a grafia real `architecture`;
- bounds passaram a considerar viewport alta e margens de câmera;
- ações de objeto selecionado deixaram de ficar fora da área visível;
- exterior passou a usar células e crops determinísticos menores para reduzir macro-tiles;
- o cartão de objeto recebeu fechamento acessível e confirmação por toast;
- drag descarta posições intermediárias acima da cadência de frame;
- giros rápidos persistem o último estado desejado e restauram estado seguro em falha.

#### Rodada corretiva W3-A R0–R6

- quatro cantos estruturais não conformes foram substituídos por candidatos determinísticos aprovados e promovidos às fontes e ao runtime;
- metadado visual duplicado foi unificado em `structureVisualGeometry`;
- porta horizontal deixou de depender do offset visual legado;
- depth passou a ser derivado da base visível, com bandas e desempate estável;
- fallback procedural passou a usar a mesma geometria e depth dos sprites;
- hit areas passaram a usar as regiões da transformação canônica, incluindo os dois braços de cantos;
- inicialização do Phaser foi protegida contra leitura de tweens antes do primeiro render;
- o contrato de porta passou a separar corredor estrutural de envelope visual;
- normal interior passou a ser derivada exclusivamente da adjacência do piso;
- alinhamento transversal passou a usar translação assinada geral, sem exceção por blueprint, coordenada ou `instanceId`;
- acabamento longitudinal passou a respeitar a tolerância de um pixel-fonte;
- a matriz de continuidade evoluiu de 19/31 para 31/31 junções;
- a repetição oficial do renderer ativo passou 9/9 cenários;
- controles superiores obsoletos foram removidos da Biblioteca;
- paletas e peças colocadas deixaram de cobrir permanentemente o mapa;
- expansão de piso, colocação, seleção, movimento e Resumo passaram a atualizar sem reload;
- R6 confirmou no Moto G06 o dock, Construção, Busca/Filtros recolhidos e preservação dos dados pessoais.

### Desempenho

- no cenário local de produção do gate pré-R6, o primeiro frame observado mudou de 1.642 para 1.453 ms a frio e de 1.426 para 1.233 ms com cache;
- a carga inicial bloqueante foi reduzida de 28 para 17 texturas;
- a demora inicial da Biblioteca e o engasgo no card do Resumo continuam conhecidos e não foram declarados resolvidos.

### Removido

- composição futura baseada em cinco salas obrigatórias por categoria;
- drawer como segunda navegação primária;
- controles superiores obsoletos da Biblioteca;
- fixture procedural histórica da composição normal de objetos;
- cópias públicas de paredes experimentais sem uso no runtime;
- áudio procedural reprovado como fallback ativo;
- tolerância legada do comando padrão de validação dos cantos.

### Segurança e privacidade

- registros, sessões, estrutura e backups continuam locais, sem conta, backend, sincronização ou telemetria;
- arquivos externos são validados por tamanho, schema, versão, duplicatas e integridade antes de qualquer escrita;
- restauração ocorre em transação e não publica eventos de conquista;
- fixtures, E2E e CI usam conteúdo fictício e não recebem backups pessoais;
- logs e diagnósticos não incluem títulos, autores, notas, citações, etiquetas ou payload de backup.

### Documentação

- documentação reorganizada entre contratos vigentes, decisões e arquivo histórico;
- `MANIFEST.md` e `docs/00_LEIA-ME.md` foram fundidos em `docs/README.md`;
- visão e contrato do produto foram consolidados em `docs/PRODUCT.md`;
- estado atual foi reconciliado com Dexie v7, backup v5 e encerramento da W3-A;
- planos concluídos, checklists antigos e logs integrais foram movidos para `docs/history/`;
- plano de testes cumulativo foi substituído por `docs/TESTING.md`;
- decisões vigentes foram consolidadas em ADRs individuais;
- o handoff obsoleto da W3-A foi substituído por um resumo histórico.
- o roteiro já definido da W3-B à W3-F foi restaurado como planejamento vigente, distinguindo etapa planejada de etapa em execução;
- `docs/W3_PLAN.md` passou a registrar a continuidade entre o reboot espacial, a ampliação da W3-A e as próximas etapas de estantes e livros.

## [0.2.0-alpha.1] — 2026-07-29

### Adicionado

- domínio puro de livros, progresso, status, notas e citações;
- schemas Zod de fronteira e eventos mínimos sem conteúdo pessoal;
- camada de aplicação com portas, casos de uso, atividades e erros públicos;
- persistência Dexie/IndexedDB com migração v1 para v2;
- repositórios concretos, transações, event bus pós-commit, Clock e IDs de plataforma;
- diagnóstico técnico interno para desenvolvimento e APKs de gate;
- suíte inicial de domínio, aplicação e persistência;
- validação manual de persistência no navegador e no Moto G06.

### Alterado

- comandos de escrita passaram a usar a fronteira transacional;
- eventos passaram a ser publicados somente após commit;
- documentação técnica foi alinhada aos contratos dos Prompts 4–6.

### Corrigido

- painel técnico passou a usar modo diagnóstico explícito e a permanecer fora do build normal.

## [0.1.0] — 2026-07-28

### Adicionado

- fundação React, Vite e TypeScript estrito;
- formatação, lint, testes e build web;
- shell responsivo com Biblioteca, Coleção, Novo livro, Arquivo e Configurações;
- React Router e tratamento inicial de Android Back;
- Capacitor 8, plataforma Android e primeiro APK debug;
- safe areas e prova física inicial no Moto G06.

### Alterado

- Gates G0, G1 e G2 foram aprovados;
- Blocos de contrato, fundação e prova Android foram encerrados.
