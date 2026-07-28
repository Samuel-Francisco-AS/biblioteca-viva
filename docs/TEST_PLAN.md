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

### Aplicação

- casos de uso com repositórios falsos;
- eventos emitidos uma única vez;
- falhas de persistência propagadas de modo compreensível;
- relógio e IDs controláveis em testes.

### Persistência

- CRUD Dexie;
- transações;
- migrações a partir de fixtures antigas;
- rollback ou preservação após falha;
- índices e consultas reais;
- reabertura do banco.

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

## 4. Gates mínimos

- **G1:** rotas, dimensões móveis no navegador responsivo e navegação por teclado;
- **G2:** APK debug instalado e ciclo de vida básico;
- **G3:** domínio, persistência e migração;
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
