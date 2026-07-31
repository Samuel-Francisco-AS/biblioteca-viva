# Plano de testes

## 1. Objetivo

Garantir que a Biblioteca Viva preserve dados, funcione no Android real, mantenha a separação React–Phaser e continue utilizável com áudio, movimento ou cenário visual reduzidos.

## 2. Níveis

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
