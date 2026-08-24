# Plano de testes

## 1. Objetivo

Garantir que a Biblioteca Viva preserve dados, funcione no Android real, mantenha a separação React–Phaser e continue utilizável com áudio, movimento ou cenário visual reduzidos.

## 2. Níveis

### Evidência P1-A

P1-A encerrou com 620 testes Vitest em 67 arquivos e nove E2E Chromium. As novas matrizes cobrem factories e updates das seis variantes, auto-start/auto-complete aplicável, totais desconhecidos, eventos sem conteúdo pessoal, formulário de seis tipos, Coleção unificada, backup v1/v2 histórico e migração real v3 → v4 com banco vazio, múltiplos status, Unicode, anotações, atividades, settings, milestones, luminária e reabertura idempotente. A automação Android compilou o APK debug; não houve instalação, TalkBack ou validação física.

### Evidência P1-B

P1-B encerrou com 639 testes Vitest em 71 arquivos e nove E2E Chromium. As provas novas cobrem normalização/colisão de tags, associação/favorito, exclusão cruzada, cinco kinds de sessão cobrindo seis tipos, unicidade global, pause/resume/complete por `Clock`, integrações de Livro/Série/Estudo, migração v4 → v5, backup v3 e conversão de sessão ativa em pausada. Formatação/check, lint, typecheck, áudio, build/performance, Android sync/build, ZIP e diff também passaram; nenhuma validação física é alegada.

### Evidência P1-C

P1-C e a auditoria final encerraram com 644 testes Vitest em 72 arquivos e dez E2E Chromium. O agregador puro possui datasets determinísticos, incluindo 300 Entries e 2.000 Sessions. Testes cobrem janelas, filtros, totais por tipo, duração, métricas especializadas, deduplicação Activity/Session, exclusão da sessão ativa, atualização após edição/exclusão e uma leitura por coleção. A regressão final prova edição/exclusão do histórico sem retroceder progresso e cancelamento de sessão aberta. O E2E novo cobre tag/favorito, sessão através de navegação, pause/reload/resume/complete e atualização de Estatísticas; a matriz estreita cobre Estatísticas em 320 × 640. Formatação/check, lint, typecheck, áudio, build/performance, Android sync/build, ZIP e diff passaram. Não houve instalação, TalkBack, teste perceptivo, uso prolongado ou validação física.

### Domínio

- invariantes de livro;
- progresso com total conhecido e desconhecido;
- transições de status;
- conclusão e reversão;
- marcos idempotentes;
- projeções da biblioteca.

### Domínio disponível após o Prompt 4

`src/domain/domain.test.ts` usa a diretiva `@vitest-environment node`, preservando os testes React existentes em jsdom. A suíte cobre criação mínima e completa, normalização, IDs e títulos vazios, páginas e avaliações nos limites, total conhecido e desconhecido, datas UTC, revisão, imutabilidade, preservação de identidade, matriz completa de status, conclusão explícita e repetida, notas, citações, schemas Zod com `unknown`, erros tipados, seis eventos e ausência de `window`/`document`.

No encerramento técnico do Prompt 4, a suíte possui 69 testes: 61 do domínio em Node e 8 do shell React em jsdom. Não há teste manual necessário para regras puras; a revisão humana do diff ainda decide o avanço ao Prompt 5, e os testes físicos de persistência continuam pertencendo ao Gate G3 após o Prompt 6.

### Aplicação

- casos de uso com repositórios falsos;
- eventos emitidos uma única vez;
- falhas de persistência propagadas de modo compreensível;
- relógio e IDs controláveis em testes.

### Aplicação disponível após o Prompt 5

`src/application/application.test.ts` usa ambiente Node e mantém todos os fakes dentro do teste. Os 40 cenários cobrem os oito casos de uso, validação de DTOs, carga e listagem, transições permitidas e proibidas, conclusão idempotente, preservação de identidade, atividades sem conteúdo pessoal, eventos corretos e ordem `entidade → atividade → evento`.

Falhas simuladas cobrem consulta e gravação de livros, notas, citações, atividades e publicação. Os testes verificam códigos públicos, ausência de vazamento das mensagens internas, nenhuma publicação após gravação anterior falhar e a limitação honesta de não haver rollback entre portas. Também confirmam ausência de `window`, `document` e `indexedDB`. Com os 61 testes de domínio e oito React existentes, a suíte totaliza 109 testes.

Não há teste físico necessário no Prompt 5: não existe adapter ou alteração de interface/Android. Persistência em navegador e aparelho continua como evidência obrigatória do Gate G3 após o Prompt 6.

### Persistência

- CRUD Dexie;
- transações;
- migrações a partir de fixtures antigas;
- rollback ou preservação após falha;
- índices e consultas reais;
- reabertura do banco.

### Infraestrutura disponível após o Prompt 6

Os testes Node usam `fake-indexeddb` para abrir bancos isolados e cobrem schema v2, criação v1, migração v1 → v2 com preservação, reabertura, repositórios e rejeição de dado externo inválido. Também verificam ordenação técnica, imutabilidade observável, tabelas próprias de notas/citações, atividades mínimas e falhas sanitizadas.

Transações são exercitadas com commit e aborto reais: livro/anotação e atividade permanecem juntos, e eventos só são observados após o commit. Falha de publicação preserva o estado já confirmado e chega como `EVENT_PUBLICATION_FAILED`. Clock, UUID criptográfico, armazenamento persistente nos quatro resultados, event bus, composition root e painel possuem testes próprios. A disponibilidade do painel é testada para DEV, modo `diagnostics` e produção normal desabilitada. O build normal deve excluir seus textos, enquanto `build:diagnostics` deve incluí-los. Com 31 novos cenários e os 109 anteriores preservados, a suíte totaliza 140 testes automatizados.

### Gate G3 — execução manual aprovada

Sam executou e aprovou o Gate G3 em 2026-07-29. O artefato Android foi o APK diagnóstico interno em `android/app/build/outputs/apk/debug/app-debug.apk`, SHA-256 `dec455d72ccba0eaf0b652d9c388097d53678da069bf3f78af73c3c90843c210`. Ele não constitui release pública.

#### Evidências no navegador

- [x] criar um livro diagnóstico pelo caso de uso real;
- [x] confirmar que a contagem permaneceu após recarregar a página;
- [x] encerrar e reabrir o servidor e confirmar a mesma contagem;
- [x] abrir duas abas da mesma origem e confirmar que ambas acessaram a mesma base e exibiram a mesma contagem;
- [x] realizar novas atualizações e confirmar que as contagens continuaram corretas.

#### Evidências no Android

- aparelho: Moto G06;
- sistema: Android 15;
- banco: `biblioteca-viva`, aberto na versão 2;
- [x] criar um livro diagnóstico pelo caso de uso real;
- [x] confirmar `libraryEntries` de 0 para 1 e `activities` de 0 para 1;
- [x] confirmar `metadata` em 1 e `notes`, `quotes` e `settings` em 0;
- [x] fechar e reabrir o aplicativo e confirmar todas as contagens;
- [x] reiniciar o aparelho e confirmar todas as contagens;
- [x] instalar outro APK diagnóstico por cima e confirmar preservação das contagens;
- [x] validar navegação e botão Voltar sem regressão;
- [x] solicitar armazenamento persistente e obter `denied`;
- [x] confirmar que `denied` foi tratado como resultado válido e não bloqueou o uso;
- [x] registrar ausência de defeito bloqueador.

Resultado: **G3 aprovado**. Não foram realizados testes de backup, criptografia, exclusão, APK release assinado ou AAB neste gate.

### React

- navegação;
- formulários acessíveis;
- mensagens de erro;
- estados vazios e falhas;
- coleção, detalhe, arquivo e configurações;
- alternativa textual da biblioteca.

### Prompt 7 — validação no navegador concluída

Em 2026-07-29, foram adicionados 20 testes para cadastro, edição, destino mínimo, fronteira arquitetural e datas históricas de leitura. A suíte completa passou com 160 testes em 11 arquivos. A revisão temporal cobre início e conclusão anteriores a `createdAt`, aceita `completedAt` igual ou posterior a `startedAt`, rejeita a ordem inversa, valida o round-trip pela infraestrutura e confirma que o formulário mantém o dia histórico escolhido. Também passaram `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run android:sync` e `npm run android:build:debug`. O APK debug foi gerado em `android/app/build/outputs/apk/debug/app-debug.apk`; ele ainda não foi instalado nem validado fisicamente para este prompt.

#### Evidências observadas no navegador em 2026-07-30

- [x] abrir Novo livro e cadastrar um livro;
- [x] aceitar uma data de início histórica;
- [x] salvar e confirmar redirecionamento para um detalhe válido;
- [x] recarregar a página de detalhe e recuperar o registro persistido;
- [x] abrir a edição e carregar corretamente os dados salvos;
- [x] confirmar progresso, status e data de início desabilitados na edição com explicação textual;
- [x] confirmar pelo diagnóstico do IndexedDB `libraryEntries >= 1` e `activities >= 1` após o cadastro;
- [x] confirmar que a Coleção ainda não lista livros, comportamento esperado antes do Prompt 8.

Números totais exatos das tabelas não foram registrados; os limites acima expressam apenas a evidência mínima confirmada, sem presumir a ausência de dados anteriores.

#### Checkpoint transferido para o encerramento do Bloco 5 no Moto G06 — pendente

- [ ] instalar o novo APK debug por cima do anterior;
- [ ] confirmar preservação dos dados existentes;
- [ ] abrir o formulário;
- [ ] testar teclado virtual em todos os campos;
- [ ] confirmar que o campo focado não fica oculto;
- [ ] cadastrar um livro;
- [ ] editar o livro;
- [ ] fechar e reabrir o aplicativo;
- [ ] confirmar persistência;
- [ ] testar toques repetidos no botão Salvar;
- [ ] testar botão Voltar do Android;
- [ ] confirmar safe areas;
- [ ] confirmar ausência de travamento ou tela branca.

Essa checklist não foi executada no Prompt 7. A validação física foi adiada para evitar instalações repetidas de APK e posteriormente transferida para o checkpoint do encerramento do Bloco 5; isso não representa defeito ou falha. O Prompt 7 está concluído pela validação no navegador, mas esta evidência não aprova o Gate G4.

### Prompt 8 — validação no navegador concluída

Em 2026-07-30, a suíte completa passou com 186 testes em 14 arquivos. Os novos cenários cobrem Coleção carregando, vazia, listada e com falha; detalhe, progresso, transições de status, conclusão e retomada; formulários e históricos de notas e citações; proteção contra envio duplicado; consultas de aplicação; filtragem e ordenação no Dexie; e limites arquiteturais da apresentação. Também passaram formatação, lint, typecheck, build web, sincronização Android e build do APK debug.

#### Navegador — evidências observadas em 2026-07-30

- [x] abrir Coleção e confirmar os registros já existentes no IndexedDB;
- [x] abrir os detalhes dos livros;
- [x] editar dados bibliográficos;
- [x] atualizar progresso com zero, valor intermediário e valor no limite total;
- [x] rejeitar progresso negativo e acima do total;
- [x] concluir um livro e bloquear alteração de progresso enquanto concluído;
- [x] retomar, pausar e abandonar leituras;
- [x] adicionar nota e confirmar sua persistência;
- [x] adicionar citação com página válida e sem página;
- [x] rejeitar página de citação acima do total;
- [x] atualizar o histórico de notas e citações sem reload global;
- [x] atualizar a página e confirmar a persistência das alterações;
- [x] testar o layout em 320 × 915;
- [x] confirmar ausência de overflow horizontal aparente;
- [x] confirmar cartões, textos longos, formulários e botões utilizáveis;
- [x] confirmar que a navegação inferior fixa permite rolar o conteúdo para uma área visível.

Não foram registrados nesta validação manual: submissões repetidas para verificar duplicação, encerramento e reabertura do servidor, navegação completa por Tab e Enter, comportamento de foco após erro ou uma segunda largura mobile maior. Esses pontos possuem cobertura automatizada quando aplicável ou permanecem para uma revisão manual posterior; não foram marcados como executados.

#### Android — transferido para o encerramento do Bloco 5

- [ ] instalar o APK por cima da versão anterior;
- [ ] confirmar preservação dos dados existentes;
- [ ] testar Coleção e detalhe;
- [ ] testar teclado virtual e confirmar que o campo focado não fica oculto;
- [ ] atualizar progresso;
- [ ] concluir e retomar;
- [ ] adicionar nota e citação;
- [ ] fechar e reabrir o aplicativo;
- [ ] testar botão Voltar;
- [ ] confirmar safe areas;
- [ ] confirmar ausência de tela branca ou travamento.

Nenhum item Android acima foi executado no Prompt 8. A validação foi transferida para o checkpoint do encerramento do Bloco 5; isso continua sendo uma decisão operacional, não representa defeito e não aprova nem reprova G4.

### Prompt 9 — validação no navegador concluída

Em 2026-07-30, a suíte completa passou com 223 testes em 17 arquivos. Os novos cenários cobrem normalização, combinações de busca/status/ordem, parâmetros inválidos, preservação em URL, estados vazios e sem resultado, Arquivo global, busca por conteúdo e livro, vínculo ausente, consultas globais, fronteira Dexie, ausência de N+1 e uma fixture determinística com 100 livros. Formatação, lint, typecheck, build web, sincronização Android e APK debug também passaram.

#### Navegador — evidências aprovadas em 2026-07-30

- [x] abrir Coleção com registros existentes;
- [x] buscar por título e por autor;
- [x] normalizar maiúsculas, espaços externos e acentos;
- [x] filtrar pelos status reais;
- [x] combinar busca, filtro e ordenação;
- [x] ordenar por atualização recente, título e progresso;
- [x] confirmar a política para total de páginas desconhecido;
- [x] apresentar e limpar o estado sem resultado;
- [x] preservar parâmetros na URL ao recarregar;
- [x] navegar Coleção → livro → Coleção preservando controles;
- [x] abrir o Arquivo global de notas e citações;
- [x] pesquisar por conteúdo, título do livro e autor;
- [x] navegar Arquivo → livro → Arquivo preservando a busca;
- [x] validar responsividade a partir de 320 px;
- [x] confirmar ausência aparente de overflow horizontal.

#### Gate G4 — uso real prolongado pendente e não bloqueador

- [ ] cadastrar e manter pelo menos dez livros reais;
- [ ] utilizar o aplicativo durante alguns dias;
- [ ] confirmar que o uso normal não exige console ou ferramentas de desenvolvimento.

Esses itens mantêm G4 aberto, mas não bloqueiam o início do Bloco 5.

#### Android — transferido para o encerramento do Bloco 5

- [ ] instalar o APK por cima da versão anterior;
- [ ] confirmar preservação dos dados existentes;
- [ ] testar Coleção, busca, filtros e ordenação;
- [ ] testar Arquivo;
- [ ] abrir livros a partir dos resultados;
- [ ] testar botão Voltar;
- [ ] testar teclado virtual;
- [ ] testar safe areas;
- [ ] minimizar e restaurar;
- [ ] fechar e reabrir;
- [ ] confirmar persistência;
- [ ] confirmar ausência de tela branca ou travamento.
- [ ] validar exportação, importação e restauração após sua implementação no Prompt 10.

Nenhum item Android desta seção foi executado. Instalação sobre a versão anterior, preservação dos dados, teclado virtual, botão Voltar, safe areas, minimizar/restaurar, fechar/reabrir e estabilidade geral serão verificados no encerramento do Bloco 5, junto a backup, importação e restauração. O adiamento é operacional e não representa defeito.

### Ponte e Phaser

- contrato de `LibraryViewModel`;
- eventos de interação tipados;
- atualização sem recriar o jogo;
- destruição e retomada da cena;
- fallback quando assets falham;
- ausência de regra de negócio na cena.

### E2E web

- criar livro;
- atualizar progresso;
- adicionar nota e citação;
- concluir;
- buscar;
- exportar e restaurar;
- reabrir e conferir persistência.

### Android real

- instalação e abertura;
- navegação e botão voltar;
- teclado virtual;
- toque e safe areas;
- segundo plano e retorno;
- reinício do app e do aparelho;
- persistência após atualização;
- áudio e foco;
- desempenho e memória;
- exportação e restauração.

### W2 — validação técnica e checkpoint humano pendente

Cobertura focada W2: bounds exteriores finitos, distribuição determinística das quatro variantes, validação por footprint e backup/migração de `placedObjects`. A automação não substitui a inspeção no Moto G06: percorrer o perímetro, conferir seams/filtering/repetição, selecionar o objeto, entrar em Mover, arrastar sem pan simultâneo, girar, fechar/reabrir e confirmar persistência. Nenhum desses itens físicos está marcado como executado.

Em 2026-08-24, o primeiro teste físico W2 foi reprovado: piso interno preto, pan vertical sem percurso útil, ações do objeto não visíveis/operáveis e macro-repetição exterior. A correção executou testes focados para paths internos/externos, distribuição/crop determinísticos, intervalo vertical após resize e ponte Phaser → React para Mover/Girar. A revalidação humana no Moto G06 continua obrigatória.

## 3. Comandos obrigatórios

Após o scaffold, manter scripts equivalentes a:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:run
npm run build
git diff --check
git status --short
```

Os nomes reais prevalecem e devem ser registrados no README e `AGENTS.md`.

### Política acelerada a partir de 2026-08-10

Testes automatizados relevantes, formatação, lint, typecheck, build web, barreiras arquiteturais, `git diff --check` e build/sync Android quando adequado continuam obrigatórios em cada prompt. Validações manuais repetitivas no navegador, instalação frequente de APK e testes físicos individuais de G7, G8 e G9 ficam acumulados para um checkpoint integrado próximo ao final do protótipo. Itens não executados permanecem desmarcados e os gates continuam abertos.

O agrupamento não se aplica quando houver risco de perda ou corrupção de dados, migração destrutiva, backup/restauração, exclusão de dados ou alteração nativa capaz de impedir a abertura. Prompt 14 está tecnicamente implementado após correção, mas sua primeira validação humana continua registrada como reprovada e a revalidação está acumulada; isso não aprova Prompt 14 nem G7.

### Fundação disponível após o Prompt 1

- Vitest 4 executa testes em jsdom;
- React Testing Library verifica conteúdo observável da interface;
- `src/App.test.tsx` confirma que o título principal “Biblioteca Viva — Fundação pronta” é renderizado e visível;
- `npm run test` mantém o runner interativo;
- `npm run test:run` executa a suíte uma vez para gates e automação local;
- testes E2E e Android ainda não existem e permanecem fora do Prompt 1.

### Shell disponível após o Prompt 2

`src/App.test.tsx` cobre:

- abertura da Biblioteca na rota inicial;
- regiões semânticas principais;
- presença das cinco opções de navegação;
- navegação para cada área e título correspondente;
- `aria-current="page"` somente na rota ativa;
- caminho desconhecido e retorno à Biblioteca.

Validação manual do Prompt 2, realizada por Sam em 2026-07-28:

- [x] abrir e navegar pelas cinco rotas;
- [x] testar dimensões móveis pelo modo responsivo do navegador;
- [x] confirmar a navegação inferior em dimensões móveis e a lateral em desktop;
- [x] navegar com Tab e Enter;
- [x] confirmar foco visível e funcionamento do link de salto;
- [x] confirmar ausência de overflow horizontal;
- [x] confirmar que “Ajustes” leva deliberadamente à rota `/configuracoes`, cujo título completo é “Configurações”.

A validação física do shell não foi realizada e foi transferida para o G2. O acesso ao servidor de desenvolvimento pelo smartphone exigiria um túnel HTTPS Cloudflare devido ao isolamento entre dispositivos imposto pelo roteador; não há evidência de teste do aplicativo no Moto G06 neste gate.

### APK debug disponível após o Prompt 3

Validação automatizada e de build concluída em 2026-07-28:

- build Vite e sincronização Capacitor concluídos;
- Gradle Wrapper 8.14.3 executou `assembleDebug` com sucesso;
- APK confirmado em `android/app/build/outputs/apk/debug/app-debug.apk`;
- testes automatizados cobrem navegação web, retorno nativo, registro único e remoção do listener;
- orientação não foi bloqueada; o comportamento de rotação deve ser observado no aparelho.

Checklist física executada por Sam em 2026-07-28 no Moto G06 com Android 15, usando o APK debug em `android/app/build/outputs/apk/debug/app-debug.apk` (SHA-256 `af45ac6ca5641b634560cf54bef60459b27fab0f367cd3d171e6c0a2fe2497fe`):

- [x] instalar fisicamente o APK debug;
- [x] abrir pela primeira vez sem tela branca ou erro bloqueador;
- [x] abrir Biblioteca, Coleção, Novo livro, Arquivo e Configurações e confirmar resposta ao toque;
- [x] confirmar a indicação correta da opção ativa;
- [x] usar Voltar em rotas internas e percorrer o histórico das rotas;
- [x] usar Voltar na Biblioteca e confirmar o encerramento sem diálogo;
- [x] minimizar e restaurar o aplicativo;
- [x] remover o aplicativo pelo seletor de recentes e reabri-lo;
- [x] confirmar que barras do sistema e safe areas não cobrem o conteúdo;
- [x] confirmar ausência de overflow horizontal;
- [x] registrar que nenhum defeito bloqueador foi encontrado.

Não foram registrados teste de rotação, reinício do aparelho, teclado virtual ou identificador de commit. As evidências visuais foram fornecidas por Sam e não foram copiadas para o repositório. Resultado: **aprovado**; Sam aprovou o Gate G2.

## 4. Gates mínimos

- **G1:** rotas, dimensões móveis no navegador responsivo e navegação por teclado;
- **G2:** APK debug instalado e ciclo de vida básico;
- **G3:** domínio, persistência e migração — aprovado em 2026-07-29;
- **G4:** ciclo CRUD real;
- **G5:** restauração em instalação limpa;
- **G6:** dado altera a cena e cena abre React;
- **G7:** áudio e diálogo respeitam preferências;
- **G8:** primeiro ciclo emocional completo;
- **G9:** acessibilidade e perfil Android;
- **G10:** regressão crítica e CI;
- **G11:** atualização assinada e release final.

## 5. Matriz de plataformas

| Ambiente | Uso | Frequência |
|---|---|---|
| Node/Vitest | domínio e aplicação | toda tarefa |
| navegador desktop | desenvolvimento e teclado | toda tarefa de UI |
| viewport mobile | responsividade | toda tarefa de UI |
| Playwright | fluxos críticos web | gates relevantes |
| Android real principal | verdade da plataforma | principalmente G2, G3, G6, G9 e G11 |
| Android secundário | compatibilidade | antes do G11, se disponível |

Os principais pontos de teste físico em smartphone são:

- **G2:** instalação e ciclo de vida do primeiro APK Android;
- **G3:** persistência após reinício e atualização do APK;
- **G6:** toque e desempenho da biblioteca visual;
- **G9:** acessibilidade, desempenho e uso mobile prolongado;
- **G11:** instalação e atualização do APK release assinado.

## 6. Dados de teste

Manter fixtures sem conteúdo pessoal real:

- biblioteca vazia;
- um livro planejado;
- livro em andamento com total conhecido;
- livro com total desconhecido;
- livro concluído;
- título longo e Unicode;
- notas e citações longas;
- conjunto com volume suficiente para busca;
- backup de cada versão de schema.

## 7. Regressões críticas

Uma versão não pode avançar com falha em:

- criação, edição ou leitura de livro;
- persistência após reabrir;
- migração;
- exportação/restauração;
- navegação Android;
- acesso à coleção sem Phaser;
- perda de foco ou fechamento de formulário;
- marco duplicando recompensa;
- conteúdo pessoal em logs.

## 8. Severidade

- **S0:** perda/corrupção de dados, segredo exposto, app não abre;
- **S1:** fluxo principal bloqueado, migração falha, APK instável;
- **S2:** função importante degradada com alternativa;
- **S3:** problema visual, texto ou polimento sem perda funcional.

S0 e S1 bloqueiam gate. S2 precisa de decisão explícita. S3 pode ser documentado como não bloqueador.

## 9. Evidência manual

Cada teste em aparelho deve registrar:

- data;
- versão/commit;
- modelo e Android;
- build debug ou release;
- passos;
- resultado;
- evidência visual quando útil;
- defeitos encontrados;
- decisão de gate.

Use `templates/MANUAL_TEST_REPORT_TEMPLATE.md`.

## 10. Prompt 10 — evidência automática e validação no navegador

Em 2026-07-30, 256 testes em 22 arquivos passaram após o endurecimento final. A cobertura nova inclui envelope v1, identificador/versões/data, coleções e metadados, ordenação e canonicalização, SHA-256 e adulteração, Unicode e conteúdo longo, limite de 10 MiB, JSON/versões/IDs/checksum inválidos sem replace, inspeção sem escrita, round-trip do texto final por JSON, Blob e File com campos opcionais ausentes, snapshot consistente, substituição das cinco coleções, preservação de metadata técnico, rollback Dexie em `libraryEntries`, `notes`, `activities` e `settings`, reabertura e consultas reais, ausência de eventos/atividades artificiais, backup de segurança/cancelamento, base vazia, Web Share e fallback Blob, interface, foco, Error Boundary, CSP, limites arquiteturais e indisponibilidade de contexto seguro. Os testes Dexie usam bancos `fake-indexeddb` isolados e dados fictícios.

Comandos técnicos concluídos: `npm run format`, `format:check`, `lint`, `typecheck`, `test:run`, `build`, smoke de `npm run dev`, `android:sync`, `android:build:debug` e `git diff --check`. Todos passaram. O APK debug final foi verificado como ZIP íntegro em `android/app/build/outputs/apk/debug/app-debug.apk`, com 4.389.778 bytes e SHA-256 `3bc09b29e87a59b192c4e2049e012ed16d62d268e7a292182f4fc1e199366f57`. Não foi instalado nem testado fisicamente.

### Navegador — aprovado em 2026-07-31

- [x] exportar backup e conferir aviso de privacidade;
- [x] selecionar e inspecionar sem escrita;
- [x] cancelar sem alteração na base vazia;
- [x] restaurar em origem isolada;
- [x] comparar livros, progresso, status, notas, citações e atividades (4 livros, 1 nota, 2 citações e 21 atividades);
- [x] recarregar e reabrir, confirmando persistência e consultas de Coleção e Arquivo;
- [x] criar backup de segurança antes de substituir base preenchida, sem duplicatas;
- [x] rejeitar arquivo adulterado sem alterar dados;
- [x] abrir em origem HTTP insegura e confirmar orientação sem alegação de perda entre origens.

### Navegador — pendente

- [ ] conferir visualmente 320 px, texto longo e ausência de overflow;
- [ ] provocar Error Boundary somente por teste controlado e confirmar que não apaga dados.

### Destrutiva controlada — pendente

- [ ] preencher base fictícia isolada, exportar e guardar evidência;
- [ ] limpar somente a origem de teste pelo mecanismo humano apropriado;
- [ ] importar em base vazia;
- [ ] comparar snapshot, contagens e amostras após reabertura;
- [ ] registrar resultado sem usar ou apagar dados pessoais reais.

### Moto G06 e G5 — pendente, não executado

- [ ] carregar o Moto G06 e registrar commit, hash do APK, modelo e Android;
- [ ] instalar APK novo sobre a versão anterior e confirmar preservação dos dados Android existentes;
- [ ] abrir Configurações, exportar e compartilhar ou salvar o arquivo fora do aplicativo;
- [ ] confirmar que o arquivo existe e pode ser selecionado;
- [ ] limpar dados ou desinstalar de forma controlada somente após backup confirmado;
- [ ] reinstalar e confirmar base vazia;
- [ ] importar em instalação limpa e comparar livros, progresso, status, notas, citações e atividades;
- [ ] testar teclado virtual, botão Voltar, safe areas, minimizar/restaurar, reabertura e reinício;
- [ ] confirmar estabilidade geral, ausência de tela branca/travamento e registrar no template manual.

G5 permanece aberto; nenhum item humano acima foi marcado como executado.

## 11. Prompt 11 — Host Phaser e ciclo de vida

Em 2026-07-31, 12 cenários novos de host e quatro testes arquiteturais elevaram a suíte a 268 testes em 24 arquivos. Eles usam factory injetável sem WebGL real e cobrem criação, destruição, entradas repetidas, Strict Mode, importação tardia, resize sem recriação, listener/observer, pausa e retomada idempotentes, fallback sanitizado, cleanup de criação parcial, diagnóstico e acesso contínuo à Coleção. Também impedem Phaser em domínio, aplicação e entrypoint eager, e impedem Dexie, repositórios, casos de uso e navegação direta na cena.

Após a violação CSP manual, dois testes adicionais configuram Zod no entrypoint com `jitless: true` e substituem `Function` por uma falha controlada durante um parse real: a validação continua sem executar a construção dinâmica. A suíte passou com 270 testes em 25 arquivos. O build final mantém `script-src 'self'`, sem `unsafe-eval`; a sonda permanece no pacote transitivo, mas não no caminho executado.

### Navegador — aprovado em 2026-07-31

- [x] abrir Biblioteca e visualizar a cena estrutural;
- [x] confirmar canvas único;
- [x] entrar e sair repetidamente, inclusive saída rápida durante importação, sem instância órfã;
- [x] redimensionar em desktop e viewport estreito sem duplicar canvas;
- [x] sair para Coleção e confirmar destruição da instância e remoção do canvas;
- [x] ocultar e restaurar a aba, confirmando pause e resume pelo diagnóstico;
- [x] navegar por Voltar, Avançar e recarga direta;
- [x] confirmar Coleção convencional e demais funções sem Phaser;
- [x] confirmar CSP sem `unsafe-eval` e ausência da violação `eval` após `jitless`;
- [x] confirmar fallback por teste automatizado;

### Android — pendente ao fim do Bloco 6

- [ ] registrar o teste conjunto de G5 e G6 no Moto G06;
- [ ] abrir Biblioteca, testar toque/viewport/safe areas, segundo plano e retorno;
- [ ] confirmar ausência de tela branca ou animação em segundo plano;
- [ ] executar a restauração física em instalação limpa já pendente de G5.

G4, G5 e G6 permanecem abertos; esta seção não aprova gate algum.

## 12. Prompt 12 — Projeção visual e ponte bidirecional

Os testes automatizados exercitam projeção pura, fronteiras de lotação, desempate do livro recente, privacidade dos contratos, atualização sem recriar a instância e abertura do painel React por `ShelfSelected`, sem WebGL real.

O ajuste responsivo acrescenta testes do layout puro para a escolha regular/compacta e sua fronteira de `520` px, separação das áreas principais, truncamento do recente, contadores, área mínima tocável da estante e marcador de conclusão. Os testes do host cobrem os dois cruzamentos de modo por `ResizeObserver`, na mesma instância, sem observer ou listener de visibilidade adicional.

### Navegador — aprovado em 2026-07-31

- [x] abrir Biblioteca com coleção preenchida e confirmar contagens, lotação, destaque recente e primeiro marco de conclusão;
- [x] alterar dados e confirmar atualização da projeção, do painel React e da mesma instância Phaser;
- [x] abrir e fechar o painel por `ShelfSelected`, sem abertura duplicada, e abrir Coleção pelo painel;
- [x] restaurar backup em outra origem e confirmar a cadeia IndexedDB → consultas → projeção → Phaser → painel React;
- [x] abrir Biblioteca vazia e confirmar valores zerados, estante vazia, ausência de destaque/marco, painel e acesso à Coleção;
- [x] confirmar um único canvas em entrada, atualização e troca entre layouts regular e compacto;
- [x] validar layout desktop, 320 × 915 e 360 × 640, sem sobreposição ou overflow horizontal;
- [x] confirmar CSP estrita sem `unsafe-eval`.

Avisos de AudioContext e WebGL observados no navegador são não bloqueantes.

### Android — pendente ao fim do Bloco 6

- [ ] executar o teste físico conjunto G5/G6 no Moto G06, incluindo toque, safe areas, segundo plano, retorno e restauração em instalação limpa.

G4, G5 e G6 permanecem abertos; esta seção não aprova gate algum.

## 13. Prompt 13 — Primeira sala reativa

Os testes automatizados usam manifestos, projeções, layout e adapters de lifecycle sem WebGL real. Cobrem IDs/fallbacks/caminhos/profundidades/orçamento; estados vazio, inicial, crescente e cheio; conclusão como complemento; destaque ausente, presente e substituído; limite de oito grupos para cem livros; fallback de asset ausente ou com falha; alvos e relações de layout; movimento determinístico; reduced motion; pausa, retomada, resize, destroy e remontagem; eventos tardios ignorados; painéis React, foco, fechamento e substituição; e barreiras contra imports, conteúdo e recursos antecipados.

Após o defeito observado na validação manual, a regressão usa fase e relógio puros para percorrer vários ciclos sem espera real. Ela exige repetição infinita e `yoyo` senoidal para os dois personagens, continuidade nas extremidades, amplitude segura, permanência nos limites, conservação dos handles em projeção, resize idêntico/no mesmo modo e pausa/retomada, substituição única entre modos, limpeza de término inesperado, destroy e remontagem, zero tween em reduced motion e orçamento máximo de três tweens.

A suíte corrigida passou com 349 testes em 31 arquivos. Build web, `android:sync` e `android:build:debug` passaram; o APK não foi instalado.

### Web — validado no navegador em 2026-08-01

- [x] abrir biblioteca vazia e preenchida;
- [x] confirmar estante reativa e estado com livro concluído;
- [x] observar livro recente e iluminação;
- [x] observar idle contínuo da bibliotecária;
- [x] observar criatura delimitada em múltiplos ciclos, sem parada ou salto;
- [x] confirmar ausência de aceleração ou acúmulo visual;
- [x] clicar e tocar estante, bibliotecária e criatura;
- [x] confirmar painel correspondente, painel único e fechamento;
- [x] abrir a Coleção convencional;
- [x] ocultar e restaurar a aba;
- [x] sair da rota e retornar, com canvas único dentro e zero fora;
- [x] validar layout desktop, 320 × 915 e 360 × 640, sem overflow horizontal;
- [x] confirmar CSP sem `unsafe-eval`;
- [x] cobrir `prefers-reduced-motion` por teste automatizado;
- [x] cobrir fallbacks por teste automatizado.

Limitação não bloqueadora: durante resize contínuo por arraste da janela no navegador, o canvas pode piscar brevemente. Reavaliar no Android durante abertura da Biblioteca, minimizar/restaurar, botão Voltar, mudança de orientação caso testada e retorno do segundo plano.

### Android — checkpoint físico conjunto de G5 e G6, pendente

#### G5 — pendente no Moto G06

- [x] instalar APK por cima da versão anterior;
- [x] confirmar preservação dos dados;
- [ ] exportar backup;
- [ ] confirmar entrega do arquivo;
- [ ] preservar uma cópia fora do app;
- [ ] limpar dados ou reinstalar de forma controlada;
- [ ] importar backup em instalação limpa;
- [ ] comparar livros;
- [ ] comparar progresso e status;
- [ ] comparar notas e citações;
- [ ] fechar e reabrir;
- [ ] confirmar persistência.

#### G6 — pendente no Moto G06

- [ ] abrir biblioteca vazia;
- [ ] restaurar ou cadastrar livros;
- [ ] observar reação da estante;
- [ ] concluir livro;
- [ ] observar estado concluído;
- [ ] tocar estante;
- [ ] tocar bibliotecária;
- [ ] tocar criatura;
- [ ] trocar e fechar painéis;
- [ ] testar botão Voltar;
- [ ] minimizar e restaurar;
- [ ] verificar safe areas;
- [ ] verificar navegação inferior;
- [ ] verificar teclado virtual nas telas convencionais;
- [ ] observar estabilidade;
- [ ] observar fluidez;
- [ ] confirmar ausência de tela preta persistente;
- [ ] observar a piscada durante lifecycle real;
- [ ] confirmar que as telas convencionais continuam funcionando.

A validação manual web foi concluída após a correção de lifecycle. O primeiro checkpoint Android foi iniciado: atualização por cima e preservação do livro existente passaram; exportação externa e rolagem sobre o canvas falharam antes da rodada corretiva. Os demais itens continuam pendentes. G4, G5 e G6 permanecem abertos.

## 14. Rodada corretiva após o primeiro checkpoint físico — 2026-08-03

### Evidência física já aprovada

- [x] instalar o APK mais recente por cima da versão anterior no Moto G06;
- [x] confirmar que o livro existente permaneceu após a atualização.

Essa evidência aprova somente a preservação de dados na atualização do APK. Não aprova G4, G5 ou G6.

### Falhas confirmadas antes da correção

- [x] “Exportar backup” não abriu folha nativa nem seletor de destino;
- [x] nenhum arquivo `biblioteca-viva-backup` foi localizado em Downloads, Documentos, Recentes ou pesquisa;
- [x] gesto vertical iniciado sobre o canvas não rolava a página no navegador nem no Android;
- [x] não existia ação de exclusão permanente de livro.

### Nova rodada física — exportação

- [ ] tocar “Exportar backup”;
- [ ] confirmar que a folha nativa aparece;
- [ ] escolher Arquivos ou Drive;
- [ ] confirmar nome terminado em `.json`;
- [ ] localizar o arquivo fora do aplicativo;
- [ ] copiar o arquivo para o computador;
- [ ] selecionar o mesmo arquivo para inspeção;
- [ ] confirmar que exportar e compartilhar não alteraram o banco.

### Nova rodada física — rolagem e toque

- [ ] rolar começando sobre área vazia da sala;
- [ ] rolar começando sobre a estante;
- [ ] rolar começando sobre a bibliotecária;
- [ ] rolar começando sobre a criatura;
- [ ] confirmar que arraste não abre painel;
- [ ] confirmar que toque curto abre o painel correto;
- [ ] confirmar que a navegação inferior continua acessível.

### Nova rodada manual — exclusão

- [ ] criar um livro descartável;
- [ ] adicionar uma nota e uma citação;
- [ ] abrir a confirmação e cancelar;
- [ ] confirmar preservação do livro e das anotações;
- [ ] excluir permanentemente;
- [ ] confirmar ausência na Coleção;
- [ ] confirmar ausência no Arquivo;
- [ ] fechar e reabrir o aplicativo;
- [ ] confirmar que a exclusão persistiu;
- [ ] confirmar que outros livros não foram afetados.

Limpeza de dados, reinstalação destrutiva e restauração física permanecem pendentes e suspensas até que o backup externo seja localizado e verificado fora da Biblioteca Viva.

### Evidência automática da correção

Em 2026-08-03, 385 testes em 36 arquivos passaram. A cobertura inclui adapters web/Android injetáveis, texto e URI exatos, MIME/extensão, ordem da limpeza, escrita/compartilhamento/cancelamento/limpeza falhos, operação sem alteração do banco, inspeção posterior, bloqueio de concorrência, configuração `pan-y`/captura, política de toque e arraste, lifecycle, interface destrutiva, exclusão associada, preservações, reabertura e rollback no início da transação, em notas, citações e atividades. Build web, sync Capacitor e build Android passaram. O APK debug não foi instalado; possui 7.525.449 bytes, SHA-256 `c92068db7ccbeffbe892a9acb5fc0050f8ffecd6f7c536259e44d5edc465ef28` e integridade ZIP confirmada.

## 15. Continuação da rodada corretiva — 2026-08-05

### Evidência aprovada no Moto G06

- [x] atualização do APK por cima preservou os dados;
- [x] folha nativa de compartilhamento abriu;
- [x] arquivo JSON apareceu na folha;
- [x] rolagem por toque sobre o canvas funcionou;
- [x] arraste sobre o canvas não abriu painel;
- [x] toque curto abriu os painéis corretos;
- [x] estante, bibliotecária e criatura responderam;
- [x] exclusão permanente respondeu corretamente;
- [x] demais funções convencionais permaneceram operacionais;
- [x] nenhuma permissão ampla foi solicitada.

A ausência de uma ação explícita para escolher pasta foi confirmada. A folha de compartilhamento permanece válida como compartilhamento, não como prova de salvamento.

### Salvamento Android — aprovado em 2026-08-06

- [x] tocar “Salvar backup no dispositivo”;
- [x] confirmar que o seletor de documentos aparece;
- [x] escolher um local externo;
- [x] confirmar nome terminado em `.json`;
- [x] concluir o salvamento, localizar o arquivo e confirmar que permaneceu acessível;
- [x] confirmar banco inalterado.

### Compartilhamento — aprovado em 2026-08-06

- [x] confirmar que a ação separada abre Share;
- [x] confirmar JSON na folha e destinos como Drive, Gmail, WhatsApp e Quick Share;
- [x] confirmar backup de segurança compartilhado e localizado no Drive;
- [x] confirmar que fechar a folha sem compartilhar cancela a restauração;
- [x] confirmar que compartilhar a segurança permite continuar a importação em banco preenchido;
- [x] confirmar ausência de bypass do requisito de segurança.

### Navegador — rodinha aprovada em 2026-08-06

- [x] usar a rodinha sobre o canvas;
- [x] confirmar que os cliques continuam abrindo os painéis;
- [x] confirmar canvas único.

### Android — interação e exclusão aprovadas

- [x] arrastar sobre o canvas e rolar a página;
- [x] confirmar que arraste não abre painel;
- [x] tocar brevemente estante, bibliotecária e criatura;
- [x] abrir, cancelar e confirmar a exclusão permanente;
- [x] confirmar preservação dos dados não relacionados.

### Evidência final de G5 — aprovado em 2026-08-06

- [x] instalar APK novo por cima e confirmar preservação dos dados;
- [x] salvar o backup em arquivo externo e localizá-lo fora do armazenamento privado do aplicativo;
- [x] compartilhar o backup de segurança com o Drive e confirmar o arquivo no destino;
- [x] fechar a folha sem compartilhar e confirmar que a restauração foi bloqueada;
- [x] limpar cache e armazenamento de forma controlada somente após confirmar a cópia externa;
- [x] abrir o aplicativo com banco vazio, Coleção vazia e sala visual com total zero;
- [x] selecionar e importar o backup externo em armazenamento limpo;
- [x] recuperar os dois livros existentes;
- [x] comparar títulos, autores, status e progresso com o estado anterior;
- [x] confirmar que a sala visual reagiu do total zero para total dois;
- [x] fechar e reabrir o aplicativo e confirmar persistência dos dados restaurados.

Resultado: **G5 aprovado por Sam em 2026-08-06**. A exportação produz uma cópia recuperável, a restauração em armazenamento limpo funciona e os dados permanecem após reabertura. Oferecer “Salvar no dispositivo” também no backup de segurança pré-restauração continua apenas como melhoria futura de uniformidade; o Share atual foi validado com cancelamento bloqueando a restauração e cópia comprovada no Drive.

### Evidência final de G6 — aprovado em 2026-08-06

A aprovação considera o uso físico repetido no Moto G06 e a adequação funcional ao estágio atual do protótipo.

- [x] validar navegação inferior e navegação convencional entre áreas;
- [x] testar o botão Voltar;
- [x] minimizar, retornar e retomar a sala Phaser;
- [x] verificar safe areas;
- [x] verificar formulários e teclado virtual;
- [x] rolar verticalmente e distinguir toque curto de arraste;
- [x] interagir com estante, bibliotecária e criatura e abrir os painéis React;
- [x] confirmar atualização da cena conforme os dados;
- [x] confirmar canvas único;
- [x] observar fluidez e estabilidade geral;
- [x] confirmar ausência de tela preta persistente e de perda de dados durante o uso testado.

Resultado: **G6 aprovado por Sam em 2026-08-06**. Refinamento artístico, sala visual dominante, composição futura e possíveis painéis sobrepostos não integram o critério funcional deste gate e permanecem no backlog de UX, arte e polimento.

Em 2026-08-05, a suíte passou com 406 testes em 38 arquivos. A continuação cobre seletor injetável, nome/MIME/texto exatos, UTF-8 sem BOM ou quebra adicional, saved/cancelled/falhas sanitizadas, espera pela escrita, concorrência, desmontagem, separação save/share, contrato nativo, permissões e `preventDefaultWheel: false`. O APK debug possui 7.525.555 bytes, SHA-256 `1eec4278a332a3e883cc1f8c03e92efb2b19743edded752ccbb235426a8e68fb` e ZIP íntegro.

G4 permanece pendente por exigir uso pessoal prolongado com ao menos dez livros reais. G9 ainda concentrará acessibilidade, desempenho e uso mobile mais rigoroso; G11 ainda tratará APK release assinado, atualização final entre builds de produção e demais requisitos de distribuição.

## 16. Prompt 14 — Áudio desacoplado e primeira paisagem sonora

### Primeira validação humana — reprovada

Em 2026-08-07, a validação no APK Android foi **reprovada**. O áudio só começou após interação com o canvas, a música procedural foi percebida como zumbido grave contínuo e desagradável, os efeitos de interface tinham timbre desagradável e bibliotecária e criatura não responderam com som. A estante, os efeitos de ações, os volumes e as intents existentes funcionaram. O resultado mantém Prompt 14 e G7 abertos e bloqueia o avanço para Prompt 15.

A rodada corretiva usa desbloqueio global por primeiro gesto, seis WAVs próprios determinísticos, efeitos distintos para estante, bibliotecária e criatura e silêncio quando a música estiver ausente. Testes automáticos verificam contratos e regressões, mas não avaliam qualidade artística. Toda a checklist abaixo deve ser repetida no navegador e no Moto G06 antes de qualquer aprovação.

### Evidência automática da implementação inicial

Em 2026-08-06, a suíte completa passou com 436 testes em 44 arquivos. Os testes novos usam backend, playback, settings e lifecycle controláveis, sem alto-falante ou Web Audio real, e cobrem:

- integridade do manifesto, cinco categorias, IDs, ganhos, loops e fontes intercambiáveis;
- inicialização idempotente e nenhuma reprodução antes do gesto/inicialização;
- intenção ocorrida durante o desbloqueio tocando somente depois da inicialização;
- música da Biblioteca, saída/retorno, remontagem e ausência de segunda instância;
- efeitos de interface, estante e conclusão pós-commit;
- volumes independentes, mute global, persistência, reabertura e valor externo inválido;
- pause, resume, ciclos repetidos, descarte de efeitos pendentes e dispose idempotente;
- arquivo ausente com fallback procedural na implementação inicial, backend indisponível e reprodução falha degradável;
- primeiro gesto, `visibilitychange`, `App.appStateChange` e remoção de listeners;
- controles de Configurações rotulados, focáveis, atualizados imediatamente e persistíveis;
- fronteiras que impedem React e Phaser de importar backend, manifesto, Web Audio ou Howler.

`format:check`, lint, typecheck, suíte, build web, `android:sync` e `android:build:debug` passaram. O Gradle concluiu `BUILD SUCCESSFUL`; o APK debug possui 7.525.555 bytes, SHA-256 `9e64d4afa80ab8aac0f223f2c2e9dcdffac1305cf09264d0551ff4250a1b8981` e ZIP íntegro. Ele foi gerado, mas não instalado nem testado fisicamente. Nenhuma biblioteca, plugin, permissão, mídia externa, migração ou versão foi adicionada/alterada.

### Checklist manual pendente para Sam — navegador e Moto G06

1. [ ] abrir o app inicialmente sem áudio tocando sozinho;
2. [ ] usar um botão ou navegação React como primeiro gesto e confirmar música sem tocar o canvas;
3. [ ] recarregar e usar o canvas Phaser como primeiro gesto permitido;
4. [ ] entrar na Biblioteca e ouvir apenas uma música ambiente reconhecível e discreta;
5. [ ] sair e voltar à Biblioteca sem duplicação;
6. [ ] tocar a estante e ouvir a resposta correspondente;
7. [ ] tocar a bibliotecária e ouvir uma resposta distinta;
8. [ ] tocar a criatura e ouvir uma resposta distinta;
9. [ ] executar uma ação de interface coberta pelo efeito previsto;
10. [ ] concluir um livro e confirmar resposta sonora + feedback visual/textual;
11. [ ] alterar volume da música;
12. [ ] alterar volume dos efeitos;
13. [ ] ativar mute e confirmar silêncio total;
14. [ ] desativar mute;
15. [ ] fechar e reabrir e confirmar preferências persistidas;
16. [ ] minimizar e restaurar repetidamente;
17. [ ] confirmar que não aparecem duas músicas simultâneas nem áudio indevido em segundo plano;
18. [ ] confirmar que Coleção, formulários, backup e sala continuam utilizáveis.

No Moto G06, repetir com alto-falante e fone em volume confortável, observar interrupção do sistema/bloqueio de tela quando aplicável e registrar commit/hash do APK usado. Esta seção não afirma execução manual e não aprova G7.

### Evidência automática da rodada corretiva

Em 2026-08-07, formatação, `format:check`, lint, typecheck, geração/verificação determinística dos seis WAVs, suíte completa, build web, `android:sync` e `android:build:debug` passaram. Foram 442 testes em 44 arquivos. O APK debug contém os seis assets, possui 7.526.051 bytes, SHA-256 `9d3b71db91ab58e210f482d6721f27e117f09b0b7e38fa7bf0d270b431f7f614` e ZIP íntegro. O artefato não foi instalado nem testado fisicamente nesta rodada; a correção, Prompt 14 e G7 continuam sem aprovação.

## 17. Prompt 15 — Conteúdo externo, localização e diálogos

Em 2026-08-10, formatação, `format:check`, lint, typecheck, a suíte completa, build web, `android:sync`, `android:build:debug` e `git diff --check` passaram. Foram 473 testes em 49 arquivos. O APK debug não instalado possui 7.526.051 bytes, SHA-256 `c59b76f9b8d1065426e870b6d77dd7f474924a78327bd393129ff10492963296` e integridade ZIP confirmada. Nenhum teste manual foi executado nesta etapa, e essa evidência não aprova Prompt 15 nem G7.

Os testes automáticos do Prompt 15 cobrem:

- catálogo válido e falha cedo para ID ausente/duplicado, locale inválido, chave ou referência inexistente;
- personagens, sala, decoração reservada e textos contextuais declarativos;
- `pt-BR`, fallback de locale e fallback de chave ausente;
- seleção básica, prioridade, desempate determinístico, condições satisfeitas/não satisfeitas, histórico vazio/existente, `once`, cooldown, repetição posterior e fallback explícito;
- Biblioteca vazia, primeiro livro, leitura em andamento, primeira conclusão e retorno após alguns dias;
- rotação de falas gerais da bibliotecária e respostas da criatura;
- contrato `book.first-completed` reutilizável sem `MilestoneEngine`;
- gravação/carregamento em `dialogue.history.v1`, deduplicação de `once`, validação externa e ausência de conteúdo pessoal;
- falhas de leitura/gravação sanitizadas e degradáveis;
- composition root, recarga do histórico, contexto agregado, painel React e coexistência com intents de áudio;
- barreiras que impedem Phaser de importar conteúdo, selector, histórico ou Dexie e impedem aplicação/conteúdo de depender de plataforma/apresentação.

### Checklist acumulada para checkpoint integrado

- [ ] conferir o tom de vazio, primeiro livro, andamento, conclusão e retorno;
- [ ] tocar repetidamente a bibliotecária e confirmar variedade sem insistência da fala especial;
- [ ] tocar repetidamente a criatura e confirmar respostas curtas e coerentes;
- [ ] fechar/reabrir e confirmar que falas `once` não retornam;
- [ ] simular retorno após três ou mais dias sem culpa ou cobrança;
- [ ] confirmar que nenhum diálogo interpreta título, autor ou conteúdo da obra;
- [ ] validar painel, foco, leitor de tela, zoom e largura mobile;
- [ ] confirmar som e texto coexistindo com mute ligado/desligado;
- [ ] confirmar Coleção, formulários, backup e sala sem regressão;
- [ ] repetir no Moto G06 durante o checkpoint integrado de G7/G8/G9.

Nenhum item desta checklist foi executado nesta etapa. Prompt 15 e G7 permanecem abertos; avanço técnico posterior não equivale a aprovação humana.

## 18. Prompt 16 — Marcos e primeiro desbloqueio

Em 2026-08-10, formatação, `format:check`, lint, typecheck, verificação determinística dos áudios, build web, `android:sync`, `android:build:debug` e `git diff --check` passaram. A suíte completa passou com **505 testes em 53 arquivos**. A rodada específica de maior risco passou com 49 testes de banco, migração, reabertura e backup/restauração. O APK debug não instalado possui 7.526.051 bytes, SHA-256 `1481cb7933b1769c17f0e319a2f00ceac64852235aace5b41637f83e85e6c3b2` e integridade ZIP confirmada. A automação cobre:

- catálogo válido e rejeição de ID duplicado, recompensa/decoração inexistente, condição inválida e versão inválida;
- `MilestoneEngine` puro em Node para primeiro livro, nota, citação e conclusão, não atendimento, múltiplas regras, ordem determinística, estado alcançado, reprocessamento e avaliações concorrentes;
- transação única para ação, atividade, marco e recompensa; chave única, subscriber duplicado, reload/recomposição, retry após falha e rollback;
- persistência mínima, validação na leitura, erro sanitizado, reabertura e ausência de título, autor, nota, citação ou fala no marco;
- schema v3 aditivo, migração automatizada v1 → v3 e v2 → v3, preservação de registros e reabertura;
- luminária concedida uma vez, projeção reconstruída, contrato mínimo React–Phaser, animação sem regra, reduced motion estático, áudio pós-commit, mute, diálogo existente e notificação `status` polite;
- exclusão/retomada preservando o marco histórico, distinta do fato atual de existir livro concluído;
- backup v2 novo, round-trip, aceite estrito do v1, checksum/adulteração, união monotônica, restauração repetida e preservação do desbloqueio;
- fronteiras contra engine/persistência no Phaser, regra de progressão em React e dependência de plataforma no domínio.

### Checklist acumulada para G8

- [ ] concluir o primeiro livro no navegador e no Moto G06 e observar luminária, aviso, diálogo e efeito uma única vez;
- [ ] repetir conclusão, sair/voltar e fechar/reabrir sem nova concessão ou áudio indevido;
- [ ] ativar mute e reduced motion e confirmar equivalentes estáticos/textuais;
- [ ] retomar e excluir o livro concluído e confirmar que a luminária histórica permanece;
- [ ] validar anúncio com leitor de tela, foco preservado, zoom e larguras móveis;
- [ ] exportar backup v2 real, restaurar de forma controlada e confirmar marco/decoração sem duplicação;
- [ ] confirmar Coleção, Arquivo, formulários, áudio, diálogos e sala sem regressão.

Nenhum item manual desta checklist foi executado. Não houve limpeza, instalação de APK nem restauração destrutiva real. Prompt 16, G7 e G8 permanecem abertos até o checkpoint humano integrado.

## 19. Prompt 17 — Acessibilidade e preferências

Em 2026-08-10, a suíte completa passou com **519 testes em 57 arquivos**. A cobertura nova verifica:

- defaults e resolução `system | reduce | normal`, incluindo mudança da media query e overrides;
- alto contraste, três tamanhos de texto, subscribers, aplicação imediata, persistência ordenada, retry e fallback após dado inválido/futuro;
- gravação, leitura e reabertura de `experience.preferences.v1` no schema v3;
- Configurações com fieldset, legend, radios, checkbox, select, labels e feedback de falha;
- atributos efetivos no shell para contraste, texto e movimento;
- resumo React da Biblioteca e equivalentes para estante, bibliotecária, criatura e Coleção;
- retorno de foco ao acionador React após fechar painel;
- atualização da preferência na mesma instância Phaser, sem segundo canvas;
- movimento normal, zero tween repetitivo com redução e decoração estática preservada pela cobertura existente da sala;
- fronteiras sem React/persistência no Phaser, browser no domínio ou Dexie no React;
- backup v2 round-trip de settings usando a chave real de experiência;
- associação condicional de erro do seletor de backup e foco após erros assíncronos dos formulários.

`format`, `format:check`, lint, typecheck, `audio:check`, build web, `android:sync`, `android:build:debug` e `git diff --check` passaram. O APK debug não instalado possui 7.526.051 bytes, SHA-256 `dc293fd389b580a0e110857edf4ce21978bec57dd4150286b26923d8d7e0aa65` e integridade ZIP confirmada.

### Checklist manual acumulada para G9

- [ ] TalkBack no Moto G06 e leitor de tela desktop quando disponível;
- [ ] landmarks, headings, navegação, formulários, Configurações e backup/restauração;
- [ ] Tab/Shift+Tab, Enter, Space, retorno de foco e foco após erro;
- [ ] alternativa textual, estante, bibliotecária, criatura e anúncio de marco;
- [ ] texto grande/maior em 320 px e zoom do navegador sem corte/overflow desnecessário;
- [ ] alto contraste em foco, links, controles, estados e erros;
- [ ] movimento seguindo sistema e overrides reduzir/normal no navegador e Android;
- [ ] mute/volumes zero sem perda de feedback;
- [ ] alvos de toque, teclado virtual e uso com uma mão;
- [ ] reabertura e restauração controlada preservando preferências.

Nenhum item manual foi executado ou aprovado. Não há automação de TalkBack, alegação WCAG ou validação física de G9. Prompt 14–17 e G7–G9 permanecem abertos.

## Prompt 18 — perfil técnico e estabilidade mobile

### Medido automaticamente

- [x] Phaser preservado como dynamic entry e ausente do chunk inicial pelo manifesto Vite;
- [x] tamanhos reais dos chunks registrados por `npm run performance:report`;
- [x] 20 montagens/desmontagens com uma instância e um canvas durante cada montagem e zero depois;
- [x] 20 observers desconectados e listeners próprios de visibility removidos, sem crescimento;
- [x] desmontagem durante import tardio, criação tardia e falha parcial com cleanup;
- [x] visible → hidden → visible repetido, pause/resume idempotente e retorno sem segunda instância;
- [x] resize repetido/idêntico, mudança de proporção e retorno sem reconstrução;
- [x] máximo de três tweens repetitivos e zero com reduced motion;
- [x] áudio com no máximo uma música ativa conhecida, mute global, pause/resume e dispose zerando players;
- [x] projeção limitada para 0, 1, 10, 100 e volume maior razoável, sem objeto por livro;
- [x] diagnóstico restrito a desenvolvimento ou build interno explícito;
- [x] assets, imports Android e ausência de dependência remota essencial auditados.

O tempo de criação e FPS exibidos no painel são observacionais; milissegundos de jsdom não são usados como gate. Memória real da WebView não é inferida de APIs não padronizadas.

### Ainda pendente no Moto G06 — G9

- [ ] FPS real e frame pacing;
- [ ] memória real da WebView e estabilidade estrutural após 30 minutos;
- [ ] temperatura e comportamento sob pressão de outros apps;
- [ ] toque e abertura percebidos;
- [ ] retorno real do background e múltiplos eventos equivalentes;
- [ ] rotação física e retorno ao retrato;
- [ ] context loss/tela preta em condições reais;
- [ ] offline físico;
- [ ] acessibilidade essencial, áudio, texto ampliado, alto contraste, reduced motion e TalkBack quando possível;
- [ ] segunda configuração Android, se disponível.

Prompt 18 é checkpoint técnico, não aprovação. Prompt 14–18 e G7–G9 permanecem abertos.

## 21. Prompt 19 — suíte crítica, E2E e CI

### Auditoria

Os 521 testes Vitest existentes cobrem criação/edição/detalhe, progresso/status/conclusão, notas/citações/exclusão, busca/filtros/ordenação/Arquivo, transações, schema v1→v3 e v2→v3, backup v1/v2/restauração/adulteração, preferências, projeção/bridge/lifecycle, áudio, diálogo/cooldown/once, marcos/decoração, acessibilidade e performance estrutural. Não foram adicionados unitários duplicados.

A lacuna real era o atravessamento da aplicação em navegador com IndexedDB, download/upload e recarga. Quatro testes Playwright Chromium cobrem:

1. cadastro → detalhe → progresso → nota → citação → conclusão → reação textual/marco → recarga;
2. múltiplos livros → busca por autor/título → filtro/status → ordenação → detalhe/retorno → Arquivo/retorno;
3. backup web real → download v2 → arquivo inválido → inspeção → backup de segurança → replace → preferências/marco/dados após recarga;
4. rota desconhecida e ID inexistente mantendo caminhos convencionais.

Cada teste limpa somente o IndexedDB da origem `127.0.0.1:4173` via CDP antes do cenário. Não há endpoint de reset no produto. Fixtures contêm apenas nomes/textos fictícios; v1/v2 continuam cobertos de forma mais adequada pelo codec e banco em Vitest.

CI em `.github/workflows/ci.yml` usa Ubuntu 24.04, Node 22, `npm ci`, Chromium e permissões somente de leitura. Executa format check, lint, typecheck, 521 testes, áudio, build, relatório do manifesto e quatro E2E. Android permanece local: configurar SDK/JDK/Gradle na CI inicial aumentaria custo e fragilidade sem cobrir comportamento físico. Workflow configurado; execução hospedada depende de push posterior.

Em 2026-08-11, a cadeia local completa passou: formatação, `format:check`, lint, typecheck, 521 testes em 57 arquivos, `audio:check`, `performance:report`, build web, quatro E2E Chromium, ausência do painel diagnóstico no build normal, `android:sync`, `android:build:debug` e `git diff --check`. Uma cópia temporária formada somente pelos arquivos do repositório reproduziu `npm ci` (332 pacotes), formatação, lint, typecheck, os 521 testes, build e relatório sem reutilizar `node_modules`. O APK debug não instalado tem 7.526.051 bytes, SHA-256 `318a5cc16226e8f493b5cadc15c69e872aa50ea013a345fcbb81553ce36dbe38` e integridade ZIP confirmada.

### Checklist humana integrada — única sequência operacional

As checklists de prompts anteriores permanecem como histórico de origem. A sequência abaixo as consolida e evita repetir a mesma ação; nenhum item está aprovado.

1. **Preparação e G4**
   - [ ] instalar o APK técnico atual por cima, confirmar dados e criar backup externo verificável;
   - [ ] manter ao menos dez livros reais e usar CRUD, busca, Arquivo e Configurações por alguns dias sem ferramentas de desenvolvimento;
2. **G7 — som e conteúdo**
   - [ ] avaliar música e efeitos em alto-falante/fone, volumes e mute;
   - [ ] interagir com estante, bibliotecária e criatura; avaliar falas, repetição, cooldown e naturalidade;
   - [ ] alternar rotas/background repetidamente sem áudio duplicado ou explosão sonora;
3. **G8 — ciclo emocional e recuperação**
   - [ ] cadastrar livro, observar estante, atualizar progresso e concluir;
   - [ ] confirmar som, fala, aviso e luminária uma única vez, inclusive com mute/reduced motion;
   - [ ] fechar/reabrir e confirmar persistência; exportar e restaurar backup físico novamente sem duplicar marco;
4. **G9 — qualidade mobile**
   - [ ] usar 30 minutos offline no Moto G06, alternando rotas, áudio e background;
   - [ ] observar FPS/frame pacing, memória/estabilidade perceptível, temperatura e pressão de outros apps;
   - [ ] testar toque, scroll, rotação quando aplicável, retorno, tela preta/context loss e segunda configuração Android se disponível;
   - [ ] testar texto maior, alto contraste, reduced motion, teclado/foco, alternativa textual e TalkBack quando possível;
5. **G10 — revisão final do checkpoint**
   - [ ] confirmar toda automação e E2E verdes, APK debug e documentação;
   - [ ] revisar débitos, CI configurada, README/AGENTS/MAINTENANCE e ausência de dados pessoais;
   - [ ] confirmar restauração física, uso real sem perda e decidir explicitamente cada gate.

Prompt 19 tecnicamente concluído não aprova G10. G4 e G7–G10 permanecem abertos.

## 22. Primeira rodada integrada pós-protótipo — Moto G06

Sessão realizada por Sam em **2026-08-13**. Este registro separa observação funcional de aprovação formal: G4 e G7–G10 continuam abertos.

### Comportamentos aprovados na observação

- [x] cadastrar, modificar e excluir livros;
- [x] criar notas e citações;
- [x] observar a estante reagir à coleção;
- [x] ouvir efeito sonoro e música ambiente;
- [x] ajustar volume e usar mute;
- [x] exportar backup para o local escolhido;
- [x] desinstalar e confirmar remoção dos dados locais;
- [x] reinstalar e iniciar sem dados anteriores;
- [x] importar/restaurar backup e conferir os dados restaurados;
- [x] concluir o primeiro livro e ouvir o efeito;
- [x] conferir registro do primeiro marco e exibição da luminária.

### Defeitos encontrados

- [ ] investigar pequeno delay no efeito sonoro ao navegar de outra aba para `Biblioteca`;
- [ ] rever a sensação de cena congelada quando movimento reduzido deixa personagens completamente estáticos.

### Melhorias desejadas

- início e conclusão dirigidos automaticamente pelo progresso;
- barra horizontal com porcentagem, páginas lidas, total e restantes;
- correspondência mais direta da estante para pequenas coleções;
- edição, exclusão e compartilhamento de notas e citações;
- backup de segurança opcional conforme banco vazio ou preenchido;
- playlist sequencial declarativa e áudio modular;
- redesign extenso com menor densidade, tema escuro coerente e Biblioteca protagonista.

### Itens ainda não testados ou não aprovados

- uso real por vários dias com ao menos dez livros e sem ferramentas de desenvolvimento;
- edição, exclusão e compartilhamento futuros de notas/citações;
- progresso e conclusão automáticos, barra e nova projeção da estante;
- nova política de restauração e playlist, ainda não implementadas;
- TalkBack, teclado completo, alto contraste e escalas de texto;
- reduced motion revisado, lifecycle extensivo, fone e ausência de duplicação em ciclos repetidos;
- 30 minutos de estabilidade, FPS, memória, temperatura, pressão de outros apps e segunda configuração Android;
- redesign, tema escuro e responsividade posterior;
- revisão formal e decisão explícita de G4 e G7–G10.

Resultado: evidência física parcial registrada; nenhum gate adicional aprovado.

## 23. R1-A — leitura, progresso e estante

Em 2026-08-13, a cobertura automatizada passou a verificar início automático na primeira página positiva, preservação de início existente, página zero, total desconhecido, rejeição de limites inválidos, conclusão automática pela cadeia compartilhada, atividade, evento pós-commit, rollback, milestone/recompensa idempotentes e manutenção da conclusão explícita/retomada. O detalhe cobre 0%, valor intermediário, 100%, clamp defensivo, restantes, texto equivalente e ausência de barra/porcentagem sem total.

A projeção cobre 0, 1, 2, 3, 4, 5, 10, 15 e 100 livros. De um a cinco, a contagem visual corresponde diretamente ao total; depois cresce de forma comprimida até o máximo preservado de oito. Destaque recente, conclusão, marco, luminária, determinismo e fronteira mínima entregue ao Phaser continuam cobertos. Nenhuma validação manual foi executada nesta tarefa; R1-B, o checkpoint Android e os gates humanos permanecem pendentes.

Resultado automático final: 537 testes Vitest em 57 arquivos e quatro E2E Playwright Chromium aprovados. Também passaram formatação, lint, typecheck, verificação dos áudios, build web, relatório de performance, sincronização Android, APK debug e integridade ZIP. A primeira execução E2E encontrou apenas ambiguidade de seletor causada pelos dois textos de progresso; a asserção foi tornada exata e a suíte integral passou na repetição.

## 24. R1-B — restauração contextual e entrada sonora

Em 2026-08-16, a suíte passou a cobrir a definição explícita de destino vazio para as seis coleções substituídas, metadata técnica isolada, inspeção sem escrita, mudança concorrente do destino, restauração direta em vazio, três escolhas em base preenchida, confirmação adicional sem backup, cancelamento/falha da entrega, rollback Dexie, reabertura, settings e união monotônica de milestones. O E2E Chromium usa apenas a origem isolada e dados fictícios para provar tanto base vazia quanto base preenchida sem backup.

No áudio, testes controlados provam que a intenção de rota não depende do Phaser, o primeiro gesto React/canvas continua governando unlock, a preparação não reproduz, o mesmo source é buscado/decodificado uma vez por lifecycle, entradas repetidas não duplicam música e falhas continuam silenciosas. Pause, resume, mute, background, dispose e ausência de autoplay permanecem cobertos. Não há asserção artificial de milissegundos nem alegação física Android.

Resultado automático: 544 testes Vitest em 57 arquivos e cinco E2E Chromium. Build normal preservou Phaser como dynamic entry; Android sync/build gerou APK debug de 7.526.051 bytes, SHA-256 `b0a875a2aa160054fd6bc80a6818b0adfb39f0330803b3822f89e2d0c4f11016`, com ZIP íntegro e sem instalação. A restauração e a latência percebida ainda exigem validação humana no Moto G06; G4 e G7–G10 permanecem abertos.

## 25. R2 — gerenciamento de anotações e playlist declarativa

Em 2026-08-16, a cobertura de domínio passou a validar edição de nota/citação, normalização, limites, página com total conhecido/desconhecido, remoção opcional da página, datas, revisão e identidade preservada. Aplicação cobre encontrado/inexistente, persistência, falha sanitizada, exclusão, preservação em falha, compartilhamento nos resultados de sucesso/cancelamento/indisponibilidade/falha e ausência de novo evento de criação, atividade ou milestone. Dexie cobre update/delete reais, consultas globais e por livro, outras entidades preservadas e reabertura.

React cobre edição, cancelamento, conteúdo após erro, validação/foco, confirmação/cancelamento/falha de exclusão, compartilhamento e indisponibilidade para os dois tipos no componente compartilhado, além de integração no detalhe e no Arquivo. O E2E isolado amplia o ciclo principal com criar, editar, acionar compartilhamento testável e excluir nota e citação, conferindo o estado persistido.

Áudio cobre validação de configuração, playlist de um e vários itens, ordem, wrap-around por término natural, source MP3 aceito, cue ausente/não musical, troca estrutural de efeito, callback obsoleto, entrada/saída, pause/resume, mute/unmute, volumes, asset ausente, decode falho, silêncio sem loop, uma música, unlock e dispose. `audio:check` continua verificando somente os seis WAVs físicos reais.

Resultado automático: 568 testes Vitest em 62 arquivos e cinco E2E Chromium. Formatação, lint, typecheck, áudio, build, relatório de performance, Android sync/build e ZIP passaram. O APK debug não instalado possui 7.526.051 bytes e SHA-256 `b494feb26b124c40f16cd596124df35fd27f82ca965d6fa4de1b0b6bb38c5d85`. A primeira execução E2E de R2 encontrou somente um locator estrito que correspondia aos dois feedbacks idênticos de compartilhamento indisponível; o seletor foi limitado ao item atual e os cinco cenários passaram. Durante a matriz, um mock novo exigiu tipagem pela porta e a contagem de milestones foi corrigida para usar sua consulta pública; nenhuma regra foi relaxada. Nenhuma evidência Android física ou aprovação de gate é inferida.

## 26. R3-A — sistema visual e rotas convencionais

Cobertura React demonstra drawer aberto/fechado, cinco destinos, `aria-current`, Escape, retorno de foco e navegação. A Coleção possui regressão explícita que clica no autor dentro do card integral e confirma a URL do detalhe; os testes existentes continuam cobrindo busca, filtro, ordenação, progresso, vazio e nenhum resultado. Detalhe, anotações, editores, Arquivo, Configurações, backup e restauração preservam suas suítes.

A matriz automática integral passou com 569 testes Vitest em 62 arquivos e cinco E2E Chromium, além de formatação, lint, typecheck, áudio, build, performance, Android sync/build e ZIP. A inspeção responsiva automatizável usa E2E e DOM; aparência, contraste percebido, texto ampliado extremo, TalkBack, teclado virtual e safe areas no Moto G06 permanecem no checkpoint humano integrado. R3-B continua pendente e nenhum gate é aprovado por R3-A.

## 27. R3-B — Biblioteca protagonista e atmosfera

A cobertura Vitest inclui as oito fronteiras de período, cálculo do próximo limite, transição agendada, refresh por visibilidade e cleanup sem timer; override diagnóstico e retorno a automático; período inicial e troca normal/reduced na mesma instância; layout da sala em 320×640, 320×915, 360×640, 360×800, 412×915 e desktop; sheet de resumo/estante, foco/fechamento; balões localizados sem foco automático; fallback expandido; quatro zonas, interação curta, resize, lifecycle e prova de 20 ciclos.

O Playwright possui oito cenários finais. O fluxo R3 mobile prova canvas único, resumo inferior, drawer, Coleção, clique no canto do card fora do título, retorno à Biblioteca, canvas único, toque na estante e balão. Um cenário percorre Biblioteca, Coleção, Novo livro, Arquivo, Configurações e detalhe em 320×640 sem overflow; outro cobre a matriz prática 320×915, 360×640, 412×915 e 1280×800. A suíte convencional preserva CRUD, progresso/conclusão/marco, notas/citações, Arquivo, backup/restauração, preferências e áudio.

Resultado final da matriz: 589 testes Vitest em 63 arquivos e oito E2E Chromium, além de formatação, lint, typecheck, áudio, build, performance, Android sync/build, ZIP e diff. A primeira E2E completa encontrou dois problemas apenas no teste novo: locator de heading sem `exact` e coordenada coberta pelo botão de resumo; ambos foram corrigidos sem relaxar comportamento. A primeira matriz após acrescentar o ciclo integrado excedeu o timeout padrão de cinco segundos; o teste manteve as 20 iterações e recebeu limite explícito de 15 segundos, passando em cerca de cinco. Aparência, TalkBack, teclado virtual, system bars, áudio percebido, transição horária real, FPS/aquecimento e uso prolongado continuam no checkpoint integrado Android.

## 28. P2-SOL — fundação arquitetural

A matriz do Room Engine cobre integridade dos cinco IDs/conexões, quatro políticas de unlock incluindo Movie OU Series, fronteiras `threshold - 1 / threshold / threshold + 1`, monotonicidade após redução dos fatos e fallback de navegação. O host prova 50 trocas entre salas com uma única criação de game/host, sem destroy ou listener/observer adicional. A suíte preserva os testes de backup v3 e milestones; P2 visual e validação humana não são inferidos.

Resultado automático: 661 testes Vitest em 74 arquivos e dez E2E Chromium. Passaram formatação/check, lint, typecheck, áudio, build, relatório de performance com Phaser lazy, Android sync/build e diff. Nenhum teste físico, TalkBack, áudio percebido ou profiling de FPS foi executado.

## 29. P2-B — salas e evolução visual

A cobertura unitária verifica o mapeamento declarativo de decorações no estágio 1 e 4 para Study, Projection, Training e Office, além das 20 combinações puras de sala e período. O host preserva uma única factory/game durante 50 trocas que percorrem os cinco `RoomId` e também atualiza Study 1 → 2 sem recriar a instância. A interface React mantém selector bloqueado/desbloqueado e bottom sheet contextual; a semântica do canvas não substitui esse caminho.

A validação física de composição, contraste percebido, toque, áudio, TalkBack, FPS e conforto das cinco salas continua pendente do checkpoint Android; esta automação não aprova gate humano.

## 30. P2-C — habitantes, rotinas e vida ambiental

A cobertura automatizada valida o catálogo dos cinco residentes, residência, ausência no estágio 1 e presença monotônica a partir do estágio 2; estados permitidos por período, âncoras conhecidas, transição e política determinística da criatura com fallback. O contrato `ResidentInteracted` contém somente `residentId` e `roomId`, e o teste arquitetural mantém Phaser sem importação de conteúdo ou serviço de diálogo.

Resultado automático desta implementação: 692 testes Vitest em 77 arquivos. Formatação, format:check, lint, typecheck e diff passaram. A prova humana de 30 trocas, percepção visual, TalkBack, áudio, FPS e estabilidade Android permanece pendente e não é inferida pela automação.

## 31. P2-D — composição espacial e densidade mobile

A regressão React cobre a retirada do selector em cinco abas, a navegação compacta equivalente e a âncora percentual recebida do Phaser para o balão React. A âncora é calculada a partir da posição corrente da entidade e do tamanho renderizado da cena, preservando a referência proporcional quando o host muda de tamanho; texto, diálogo e foco permanecem em React. O host preserva a mesma factory, game, canvas, cena e lifecycle, e trata arraste horizontal como pedido tipado de troca de sala.

Detalhes de livro deixam apenas identidade e progresso expandidos; status, notas, citações, histórico e metadados passam a disclosures nativos. O bottom sheet limita sua altura no retrato e os controles de exploração ocupam uma única cápsula segura, sem restaurar as cinco abas.

Ainda é obrigatória a validação humana no Moto G06: arrastar entre salas desbloqueadas/bloqueadas, keyboard/Touch exploration, safe areas, TalkBack, texto ampliado, não sobreposição de header/sheet/balão e conforto visual. Nenhum gate humano é aprovado por automação.

# Adendo ao plano de testes — Reboot espacial

## W1 corrigida novamente após smoke test físico reprovado — 2026-08-22

Automação específica em `spatialWorld.test.ts` cobre `CELL_SIZE=32`, `space-a` 12×9, `space-b` 10×8, parede de uma célula, portas de duas, corredor de três, posição relativa compacta, ausência de overlap entre os espaços, conexão contínua na curva, portas encaixadas, bounds derivados 832×672 e mundo maior que viewport. Também cobre posição inicial determinística, clamp X/Y nos dois extremos, limiar de pan e `pointercancel`. A composição pura amostra spawn, extremos X/Y, curva e entrada de B; em cada caso exige piso conectado substancial e presente no centro da viewport, sem screenshot/pixel assertion frágil. `woodFloorMaterial.test.ts` cobre repetição determinística dos módulos de piso de 10 células.

`LibraryVisualHost.test.tsx` e testes de lifecycle preservam uma factory/game/canvas, resize sem recriação, cleanup de observer/listener e ausência de pedido `RoomRequested` por arraste. A cena W1 não importa Dexie/repository e a arquitetura existente continua protegendo domínio sem Phaser.

Resultado da estabilização: `format`, `format:check`, lint, typecheck, `audio:check`, build, `performance:report`, `android:sync`, `android:build:debug`, ZIP do APK e `git diff --check` passaram. Vitest passou com 702 testes em 79 arquivos; os sete testes de `BookDetailPage.test.tsx` passaram a abrir os disclosures nativos que a UX atual mantém fechados. Playwright passou com 10 cenários; os três fluxos históricos de detalhe/backup abriram os disclosures antes de interagir, e o filtro de favoritos foi tornado idempotente quando já está ativo. O cenário móvel integrado conserva todas as asserções e usa timeout explícito de 45 s para a execução concorrente. Nenhum resultado físico anterior vale como evidência da composição corrigida.

### Checklist humana pendente — Moto G06

- [ ] Space A parece um ambiente, não uma moldura gigante.
- [ ] Escala das paredes e do piso parece natural.
- [ ] Enquadramento inicial e saída de A são compreensíveis.
- [ ] A → conexão → B é entendido sem instrução e B pertence ao mesmo edifício.
- [ ] Pan horizontal, vertical, diagonal e com uma mão são confortáveis.
- [ ] Câmera não revela grandes oceanos vazios; bounds e terminações parecem naturais.
- [ ] Não há canvas duplicado, tela preta persistente ou travamento.
- [ ] Demais funções React continuam operacionais e desempenho percebido continua aceitável.

Não instalar APK, aprovar W1 ou inferir FPS, temperatura, TalkBack, safe areas físicas ou conforto de pan sem essa validação.

## W2
Automação: schema/migração, round-trip de PlacedObject, rotações, bounds, commit só ao concluir, falha/rollback, backup, reload e Phaser sem Dexie.

Humano: selecionar, mover, girar, cancelar, bordas, erro recuperável e precisão de toque.

## Regressões
Preservar CRUD, Coleção, Arquivo, Estatísticas, backup, áudio, preferências, fallback sem canvas, build web e Android debug quando aplicável.

## Performance
Medir FPS, objetos, tamanho do mundo, hit areas, tweens, ordenação e memória estrutural antes de culling, spatial index ou física.
