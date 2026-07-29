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
