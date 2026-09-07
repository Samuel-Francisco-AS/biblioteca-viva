# Changelog

> **ARQUIVO HISTÓRICO:** estrutura anterior com várias seções “Não lançado” e estados intermediários. O changelog vigente está na raiz do pacote.

Mudanças relevantes da Biblioteca Viva serão registradas neste arquivo.

O formato segue a ideia de **Keep a Changelog** e o projeto utilizará versionamento semântico quando houver artefatos executáveis.

## [Não lançado]

### Adicionado

- integração limitada W2 de `furniture.desk.wood-01` e `furniture.chair.wood-01`, com quatro sprites runtime por orientação, footprints declarados e compatibilidade de leitura para o objeto procedural legado;
- W1 do reboot espacial: mundo Phaser procedural efêmero maior que a viewport, dois espaços neutros conectados, câmera com bounds e pan X/Y por toque/pointer, sem schema ou persistência espacial;

- P2-C com catálogo declarativo dos cinco residentes, presença por estágio, rotinas compartilhadas por âncoras, comportamento por período, reduced motion sem loops, interação tipada, falas contextuais e política determinística de presença da criatura;
- P2-SOL com Room Engine declarativo, cinco salas, estágios monotônicos por milestones, seletor React e troca de sala na mesma instância Phaser;
- P2-B com renderer procedural compartilhado para Study, Projection, Training e Office, estágios, decorações derivadas, iluminação por período e retorno à Biblioteca Principal sem nova instância Phaser;

- início documental de `P1 — Vida Registrada`, com seis tipos oficiais e estrutura futura P1/P2/P3;
- P1-A com união discriminada de Livro, Filme, Série, Estudo, Atividade Física e Trabalho, CRUD e progresso especializados;
- P1-B com etiquetas normalizadas, favoritos, sessões tipadas e persistentes, Arquivo/Coleção filtráveis, milestones preparatórios, schema Dexie v5 e backup v3 retrocompatível;
- P1-C com Estatísticas, timeline unificada, sessões recentes, janelas temporais, resumo global da Biblioteca e fatos derivados para as futuras salas de P2;
- schema Dexie v4 aditivo, anotações ligadas a `entryId`, localização discriminada e migração sem revisão artificial;
- rotas de registro, seletor de tipo e Coleção unificada, mantendo redirecionamentos para URLs históricas de livros;

- sistema visual escuro semântico e drawer lateral acessível para as cinco áreas do aplicativo;
- Biblioteca com canvas protagonista, bottom sheet compartilhado, balões React e alternativa acessível compacta;
- atmosferas procedurais de manhã, tarde, noite e madrugada pela hora local, com preview somente diagnóstico;

- backup Android com salvamento em local escolhido, compartilhamento nativo e restauração recuperável;
- exclusão transacional de livros, notas, citações e atividades relacionadas.
- preferências de experiência, conteúdo contextual, marcos e luminária de leitura;
- perfil estrutural do runtime, Playwright Chromium e GitHub Actions para checks web.
- barra acessível de progresso no detalhe, com porcentagem, páginas lidas e restantes, e estado textual sem total conhecido.
- edição, exclusão confirmada e compartilhamento explícito de notas e citações no detalhe e no Arquivo;
- playlist musical declarativa, sequencial e validada, preparada para múltiplos cues sem adicionar assets.

### Alterado

- fluxos automatizados de detalhe e backup agora percorrem os disclosures nativos da UX vigente; cópias públicas não usadas das paredes experimentais do Kit Zero deixaram de ser empacotadas;
- W1 do reboot espacial substituiu a composição dependente da viewport por uma planta fixa: `space-a` 12×9 e `space-b` 10×8, conexão curta em L, bounds derivados e enquadramento inicial voltado à saída;
- arquitetura W1 passou a montar paredes procedurais em segmentos de uma célula e a repetir o piso em módulos menores; os PNGs de parede do Kit Zero aguardam revisão de escala em W5;
- a Biblioteca deixa de trocar a sala P2 por arraste; o gesto do canvas passa a explorar o mundo espacial único e preserva toque curto para interações futuras;

- Coleção agora abre livros pela superfície inteira do card; detalhe, formulários, Arquivo e Configurações usam hierarquia mais contínua e menos caixas;
- Android usa fundo escuro edge-to-edge com system bars transparentes e controles protegidos por safe areas;

- validação física de atualização, limpeza de armazenamento e restauração no Moto G06, com aprovação dos Gates G5 e G6.
- documentação pública e operacional alinhada ao protótipo tecnicamente implementado até o Prompt 19.
- progresso positivo inicia livros planejados e a última página conhecida reutiliza a conclusão transacional existente;
- estantes pequenas usam uma representação por livro até cinco, com compressão gradual limitada a oito para coleções maiores.
- restauração dispensa backup de segurança em base funcionalmente vazia e oferece escolha explícita, com confirmação adicional, quando há dados atuais;
- música local é preparada após o primeiro gesto permitido e reutiliza a decodificação entre entradas na Biblioteca.
- áudio avança pelo término natural real, protege callbacks obsoletos e mantém efeitos substituíveis somente pelo manifesto.

### Corrigido

- W2 ganha fechamento acessível do cartão de objeto, toast temporário de confirmação e remoção visual da fixture procedural histórica, sem alterar compatibilidade de dados.
- W2 descarta posições intermediárias de drag acima da cadência de frame e coalesce a persistência de giros rápidos no último estado desejado, mantendo preview imediato e rollback seguro.
- W1 reorganiza os dois espaços em uma planta mais compacta, encurta a curva da passagem, reduz os bounds verticais e torna paredes/soleiras procedurais contínuas; a nova validação física no Moto G06 permanece pendente.
- interação da sala Phaser para permitir rolagem por toque e rodinha sem perder cliques ou toques curtos.

### Removido

- nada registrado.

## [0.2.0-alpha.1] — 2026-07-29

### Adicionado

- domínio puro de livros, progresso, status, notas e citações, com operações imutáveis e erros tipados;
- schemas Zod de fronteira, eventos mínimos sem conteúdo pessoal e suíte de domínio em ambiente Node;
- camada de aplicação com portas assíncronas, oito casos de uso, atividades mínimas e erros públicos estáveis;
- testes Node de orquestração, ordem dos efeitos e falhas de repositórios, atividades e eventos;
- persistência local Dexie/IndexedDB com seis tabelas, migração v1 → v2, repositórios concretos e validação na leitura;
- transações para entidade e atividade, event bus local pós-commit, Clock e IDs de plataforma e composition root;
- diagnóstico técnico interno para desenvolvimento e APKs de gate, ausente do build normal;
- validação automatizada com 140 testes e validação manual de persistência no navegador e no Moto G06 com Android 15.

### Alterado

- documentação do modelo de dados, arquitetura e testes alinhada aos contratos dos Prompts 4–6;
- comandos de escrita passaram a usar a porta transacional, com publicação de eventos somente após o commit.

### Corrigido

- disponibilidade do painel técnico em APKs internos por um modo diagnóstico explícito, sem incluí-lo no build normal de produção.

### Removido

- nada registrado.

## [0.1.0] — 2026-07-28

### Adicionado

- fundação React, Vite e TypeScript estrito, com lint, formatação, testes e build web;
- shell responsivo e navegável com Biblioteca, Coleção, Novo livro, Arquivo e Configurações;
- integração Capacitor 8.4.2, plataforma Android e geração do primeiro APK debug;
- tratamento do botão Voltar nativo e das safe areas no shell Android;
- prova física no Moto G06 com Android 15, aprovando instalação, abertura, navegação, ciclo de vida e encerramento pela raiz.

### Alterado

- Gates G0, G1 e G2 aprovados; Blocos 0, 1 e 2 concluídos.

## Não lançado — Processo 2 técnico (2026-08-27)

### Adicionado

- P2-C1: ponte React–Phaser para edição estrutural, projeção confirmada, single-flight e recuperação de revisão;
- P2-C2: hit areas por modo, seleção/snap, previews efêmeros, colocar/mover e piso em lote;
- P2-C3: E2E estrutural, cobertura de backup v5/reload e regressão de foco de anotação.

### Alterado

- o acionador e o painel de Construção não disputam mais a área do resumo acessível e o inventário permanece rolável na viewport.

### Pendente

- Gate humano Moto G06/TalkBack e aprovação artística; Processo 3 não foi iniciado.

## Como atualizar

- registre mudanças observáveis, não cada arquivo tocado;
- mova itens de “Não lançado” para uma versão somente após gate aprovado;
- use datas absolutas no formato `AAAA-MM-DD`;
- nunca reescreva versões antigas para esconder decisões ou regressões.

## Não lançado — W3-A / P3-C técnico (2026-08-28)

### Adicionado

- migração Dexie v6→v7 coberta para `worldStructures` sem perda de `PlacedObject`;
- E2E de sessão elegível, unlock estrutural consolidado, abertura de Construção e reload sem duplicação.

### Corrigido

- aviso de backup v5 agora compara contra o schema Dexie v7 vigente, sem alertar sobre o próprio artefato recém-exportado;
- abertura horizontal do compositor legado não mantém segmento atrás da porta;
- token de `Abrir construção` é consumido e não reabre o modo em reload;
- Escape sai do modo Construção quando não há subpainel, confirmação ou seleção ativos.

### Documentado

- W3-A1 a W3-A6 e P3-C estão tecnicamente concluídos; teste físico/artístico, TalkBack, safe areas, áudio e desempenho no Moto G06 permanecem pendentes.

### Correção W3-A em andamento

- R1 introduziu spans, intervalos, endpoints, vértices, análise de perímetro e identidade normalizada sem regravar dados;
- R2 promoveu os quatro cantos `production`, gerou runtimes pixel-equivalentes pelo pipeline oficial e encerrou a tolerância legada do check padrão;
- R3 unificou metadado e transformação visual, renderer e hit testing, depth por base visível e fallback procedimental na mesma geometria;
- R3-C-B2 executou o renderer Phaser ativo em Chromium e preservou sete capturas e manifesto: 8/9 casos passaram, mas a continuidade transversal falhou nos lados direito e inferior;
- W3-A permanece aberta: o próximo gate corretivo para normal/lado/centerline/perfil transversal ainda não foi autorizado, e R4 não foi iniciado.

### Falha visual conhecida

- planos longitudinais e fechamento lógico podem coincidir enquanto perfis visíveis ocupam lados opostos do eixo; a sala canônica apresenta salto de centerline de aproximadamente 25,12 world units à direita, e o cenário modificado chega a 45,76 no lado inferior;
- o fallback reproduz corretamente a geometria atual e não é um defeito independente; não foi aplicada correção por offset, coordenada ou blueprint.
