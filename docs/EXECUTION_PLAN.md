# Biblioteca Viva — Plano de Execução por Blocos e Prompts do Codex

> Data: 28 de julho de 2026  
> Base arquitetural: `ARQUITETURA_E_STACK_BIBLIOTECA_VIVA.md`  
> Escopo: protótipo de uso pessoal, visual e sonoro, com qualidade de portfólio e APK Android

> Este documento permanece histórico para os Prompts 1–19. A fase de produto iniciada por D-049 usa `PRODUCT_PHASE_PLAN.md`; o reboot vigente usa `ROADMAP.md`, `WORLD_MODEL.md` e `ASSET_SPEC.md`. P1 não é Prompt 20 nem R4.

---

## 1. Como usar este plano

O desenvolvimento está dividido em **11 blocos**, contendo **19 prompts principais de código**.

A divisão não segue quantidade fixa de arquivos ou horas. Cada prompt representa uma mudança coesa que o Codex consegue executar, testar e explicar sem receber liberdade suficiente para remodelar o projeto inteiro durante uma crise de criatividade sintética.

Cada bloco termina com um **gate**. O bloco seguinte só começa quando o gate anterior estiver aprovado ou quando uma pendência estiver explicitamente documentada como não bloqueadora.

### Regras operacionais

> Atualização operacional: D-034, de 2026-08-10, substitui somente a cadência de aprovação/commit abaixo durante o modo acelerado. Checkpoints técnicos podem ser commitados após validação automática e documentação; validações manuais de G7–G9 podem ser acumuladas sem aprovar gates. As exceções de risco de dados e código nativo permanecem imediatas.

- Um prompt por vez.
- Revisar relatório, `git diff` e aplicação antes do próximo prompt.
- Validar no navegador responsivo e por teclado em todo gate de interface web.
- Concentrar testes físicos nos gates que envolvam Android, persistência nativa, toque, desempenho ou release.
- Fazer commit apenas depois de aprovação humana.
- Não acumular três prompts sem commit quando eles alterarem código de produção.
- Não permitir que o Codex antecipe funções de blocos futuros.
- Não aceitar reestruturação global não solicitada.
- Não criar dependências “por precaução”.
- Não substituir arquitetura compreensível por abstrações misteriosas.

---

## 2. Instrução fixa para acrescentar a todo prompt do Codex

Copiar este trecho ao final de cada prompt, adaptando apenas quando necessário:

```text
Regras obrigatórias desta tarefa:

1. Antes de alterar código, leia AGENTS.md e os documentos indicados no prompt.
2. Inspecione a estrutura e o código existentes; não presuma arquivos ou APIs.
3. Faça somente o escopo solicitado. Não antecipe blocos futuros.
4. Preserve a separação entre presentation, application, domain e infrastructure.
5. Domain não pode importar React, Phaser, Dexie, Capacitor ou APIs do navegador.
6. Não use `any`, `@ts-ignore`, desativação de lint ou captura silenciosa de erros para fazer o build passar.
7. Não adicione dependências sem explicar a necessidade no relatório final.
8. Não faça commit, tag, push, rebase, reset destrutivo ou alteração de versão.
9. Execute ao final os scripts disponíveis de formatação, lint, typecheck, testes e build.
10. Execute `git diff --check` e `git status --short`.
11. Entregue um relatório final com:
   - arquivos criados e modificados;
   - decisões tomadas;
   - testes executados e resultados;
   - testes manuais ainda necessários;
   - limitações ou riscos encontrados;
   - confirmação explícita de que não fez commit nem push.
```

---

# BLOCO 0 — Contrato do protótipo

## Natureza

Produto, UX e documentação. Não é um bloco de implementação.

## Objetivo

Congelar o que será construído antes de abrir o repositório para uma sequência de agentes.

## Entregas humanas

- nome provisório confirmado;
- frase de produto;
- usuário principal: o próprio criador;
- fluxo principal desenhado;
- escopo incluído e excluído;
- referência visual inicial;
- lista inicial de sons;
- definição do primeiro ciclo emocional;
- critérios de sucesso;
- escolha do aparelho Android principal para testes.

## Primeiro ciclo emocional

```text
Abrir app
→ entrar na coleção
→ cadastrar um livro
→ voltar à biblioteca
→ ver a estante reagir
→ ouvir uma resposta sonora discreta
→ atualizar progresso
→ concluir o livro
→ receber reação visual, fala e pequeno desbloqueio
→ fechar e reabrir sem perder nada
```

## Gate G0

- O fluxo acima está aprovado.
- Tudo que não participa desse ciclo está fora do protótipo ou claramente subordinado a ele.
- Os documentos `VISION.md`, `PRODUCT.md` e `ROADMAP.md` podem ser escritos sem contradições.

---

# BLOCO 1 — Fundação do repositório

## PROMPT 1 — Scaffold, ferramentas e documentação-base

### Objetivo

Criar o projeto executável, rigoroso e documentado, ainda sem implementar funcionalidades do produto.

### Prompt para o Codex

```text
Você está iniciando o repositório do projeto Biblioteca Viva.

Leia:
- o plano mestre disponível;
- ARQUITETURA_E_STACK_BIBLIOTECA_VIVA.md;
- PLANO_DE_EXECUCAO_POR_BLOCOS_BIBLIOTECA_VIVA.md.

Implemente apenas a fundação técnica:

1. Crie uma aplicação Vite com React e TypeScript.
2. Configure TypeScript em modo estrito e mantenha configurações separadas quando apropriado para app, Node e testes.
3. Configure scripts npm claros para:
   - dev;
   - build;
   - preview;
   - lint;
   - typecheck;
   - test;
   - test:run;
   - format;
   - format:check.
4. Configure ESLint e Prettier de forma compatível com React e TypeScript.
5. Configure Vitest com um teste mínimo real, não um teste vazio.
6. Crie somente a estrutura inicial necessária de pastas. Não crie dezenas de diretórios vazios.
7. Adicione aliases de importação pequenos e previsíveis, sem mascarar dependências entre camadas.
8. Crie:
   - AGENTS.md;
   - docs/00_LEIA-ME.md;
   - docs/ARCHITECTURE.md;
   - docs/DECISIONS.md;
   - docs/TEST_PLAN.md;
   - docs/ROADMAP.md.
9. Registre nos documentos:
   - objetivo do protótipo;
   - stack escolhida;
   - regra de dependências entre camadas;
   - comandos do projeto;
   - práticas obrigatórias do Codex;
   - fora de escopo atual.
10. Substitua a tela padrão do Vite por uma tela mínima “Biblioteca Viva — Fundação pronta”, sem criar layout definitivo.
11. Não instale Phaser, Capacitor, Dexie, Zod, React Router ou bibliotecas de estado ainda.

Critério de conclusão:
- projeto inicia;
- teste passa;
- lint passa;
- typecheck passa;
- build passa;
- documentação descreve fielmente o estado real.
```

### Verificação humana

- conferir se os scripts são compreensíveis;
- abrir a aplicação no navegador;
- ler `AGENTS.md` e remover qualquer regra teatral ou impossível;
- confirmar que a estrutura não começou inchada.

---

## PROMPT 2 — Shell responsivo e navegação

### Objetivo

Criar a carcaça convencional do aplicativo sem banco e sem Phaser.

### Prompt para o Codex

```text
Implemente o shell responsivo da Biblioteca Viva.

Escopo:

1. Instale e configure React Router.
2. Crie rotas para:
   - Biblioteca;
   - Coleção;
   - Novo livro;
   - Arquivo;
   - Configurações.
3. Crie navegação inferior para mobile e uma adaptação simples para desktop.
4. Use HTML semântico e foco visível.
5. Crie design tokens para:
   - cores semânticas;
   - espaçamento;
   - tipografia;
   - bordas;
   - tamanhos de toque;
   - camadas de interface.
6. Use CSS Modules ou CSS organizado por componente; não adicione Tailwind, Material UI, Ionic UI ou outro design system.
7. Crie placeholders úteis em cada rota, deixando claro o que será implementado posteriormente.
8. Implemente uma barra superior simples com título da seção.
9. Garanta funcionamento entre 320 px e desktop sem overflow horizontal.
10. Adicione testes para navegação e presença das regiões principais.
11. Não implemente formulários, banco, Phaser, gamificação ou áudio.

Critério de conclusão:
- todas as rotas abrem;
- navegação mobile é utilizável;
- teclado e foco funcionam no navegador;
- testes, lint, typecheck e build passam.
```

## Gate G1 — Fundação navegável

- aplicação web abre sem erros;
- cinco áreas existem;
- navegação funciona nas dimensões móveis pelo modo responsivo do navegador;
- navegação por teclado e foco visível funcionam;
- estrutura e documentação estão compreensíveis;
- nenhum código de negócio foi enterrado em componentes.

O G1 não exige acesso físico pelo navegador em um smartphone.

Marco sugerido: `v0.1.0-alpha.1`.

---

# BLOCO 2 — Prova Android antecipada

## PROMPT 3 — Capacitor e primeiro APK de depuração

### Objetivo

Eliminar cedo o risco de descobrir no final que a aplicação não empacota ou não funciona no aparelho.

### Prompt para o Codex

```text
Integre Capacitor ao projeto Biblioteca Viva e prepare o primeiro build Android de depuração.

Escopo:

1. Confirme a versão estável compatível do Capacitor e registre a decisão em docs/DECISIONS.md.
2. Instale e configure Capacitor Core, CLI e Android.
3. Defina um appId provisório estável e um appName coerente.
4. Configure webDir para o build real do Vite.
5. Adicione a plataforma Android.
6. Crie scripts npm claros para:
   - sincronizar build web com Android;
   - abrir Android Studio;
   - executar Android quando o ambiente permitir.
7. Trate safe areas básicas e o botão voltar do Android de forma simples:
   - em rotas internas, voltar navega para trás;
   - na raiz, não invente confirmação de saída ainda.
8. Registre em docs/TEST_PLAN.md a checklist manual do APK:
   - instalação;
   - abertura;
   - navegação;
   - rotação, se permitida;
   - retorno do segundo plano;
   - fechamento e reabertura.
9. Atualize AGENTS.md com os comandos Android reais.
10. Não adicione plugins nativos que não sejam necessários.
11. Não configure assinatura de release ainda.

Critério de conclusão:
- build web passa;
- sincronização do Capacitor passa;
- projeto Android é gerado e abre no Android Studio;
- o relatório informa o caminho esperado do APK de debug e qualquer passo manual restante.
```

## Verificação humana obrigatória

- gerar o APK debug;
- instalar no smartphone;
- navegar entre todas as telas;
- minimizar e restaurar;
- fechar e reabrir;
- registrar modelo do aparelho, versão Android e resultado em `docs/TEST_PLAN.md`.

## Gate G2 — Android existe

O bloco termina somente quando um APK real estiver instalado e utilizável no smartphone. Esta é a primeira validação física obrigatória do projeto.

---

# BLOCO 3 — Domínio, casos de uso e persistência

## PROMPT 4 — Modelo de domínio de livros

### Objetivo

Criar regras puras antes de criar formulário ou banco.

### Prompt para o Codex

```text
Implemente o domínio inicial da Biblioteca Viva, limitado a livros.

Escopo:

1. Instale Zod para validação em runtime nas fronteiras.
2. Crie tipos e regras puras para:
   - BookEntry;
   - EntryStatus;
   - progresso por páginas;
   - Note;
   - Quote;
   - metadados de entidade.
3. Use uma união discriminada preparada para futuros LibraryEntry, mas implemente somente `type: "book"`.
4. Não use `Record` como nome da entidade principal.
5. Defina invariantes, incluindo:
   - título obrigatório normalizado;
   - total de páginas opcional, mas positivo quando informado;
   - página atual nunca negativa;
   - página atual não excede total conhecido;
   - conclusão coerente com status;
   - avaliação opcional em faixa definida;
   - datas em ISO UTC;
   - revisão crescente.
6. Crie funções ou factories explícitas para criar e atualizar entidades.
7. Defina eventos de domínio iniciais:
   - LibraryEntryCreated;
   - LibraryEntryUpdated;
   - ProgressUpdated;
   - LibraryEntryCompleted;
   - NoteCreated;
   - QuoteCreated.
8. Escreva testes de casos válidos, limites e erros.
9. Domain não pode importar React, browser, Dexie, Phaser ou Capacitor.
10. Atualize docs/DATA_MODEL.md, criando-o se necessário.

Critério de conclusão:
- domínio possui cobertura relevante;
- regras podem ser executadas em Node sem DOM;
- nenhuma persistência foi implementada.
```

---

## PROMPT 5 — Portas e casos de uso

### Objetivo

Criar a aplicação sem escolher ainda como os dados são salvos.

### Prompt para o Codex

```text
Implemente a camada de aplicação para o domínio de livros.

Escopo:

1. Defina portas pequenas para:
   - LibraryEntryRepository;
   - NoteRepository;
   - ActivityRepository;
   - IdGenerator;
   - Clock;
   - ApplicationEventBus.
2. Crie casos de uso para:
   - CreateBookEntry;
   - UpdateBookEntry;
   - GetBookEntry;
   - ListBookEntries;
   - UpdateBookProgress;
   - ChangeBookStatus;
   - AddNote;
   - AddQuote.
3. Casos de uso devem:
   - validar entrada;
   - carregar estado necessário;
   - aplicar regra do domínio;
   - persistir por portas;
   - registrar atividade útil;
   - publicar eventos somente após persistência bem-sucedida.
4. Crie implementações fake/in-memory apenas em testes.
5. Padronize erros de aplicação compreensíveis, sem expor detalhes de infraestrutura.
6. Não crie uma classe Service gigantesca.
7. Não implemente React, Dexie ou Phaser.
8. Escreva testes de integração da camada de aplicação usando repositórios em memória.
9. Atualize docs/ARCHITECTURE.md com o fluxo completo de uma operação.

Critério de conclusão:
- casos de uso funcionam sem navegador;
- falhas de validação e persistência são testadas;
- eventos não são emitidos em transações fracassadas.
```

---

## PROMPT 6 — Dexie, migrações e composição

### Objetivo

Implementar persistência real sem contaminá-la nas camadas internas.

### Prompt para o Codex

```text
Implemente a persistência local inicial da Biblioteca Viva usando Dexie sobre IndexedDB.

Escopo:

1. Instale Dexie.
2. Crie um adaptador Dexie para as portas existentes.
3. Defina schema inicial para:
   - libraryEntries;
   - notes;
   - activities;
   - settings;
   - metadata de banco.
4. Crie índices apenas para consultas reais previstas neste protótipo.
5. Implemente uma primeira migração versionada e uma migração de teste subsequente pequena, para provar o mecanismo sem alterar significado dos dados.
6. Garanta transações quando uma operação escreve em mais de uma tabela.
7. Implemente adapters de Clock e IdGenerator usando APIs de plataforma atrás das portas.
8. Crie o composition root que conecta casos de uso aos adapters sem usar singleton global indiscriminado.
9. Solicite armazenamento persistente por uma abstração de plataforma quando disponível, tratando recusa sem quebrar o app.
10. Crie testes de integração do banco, incluindo:
    - CRUD;
    - transação abortada;
    - migração;
    - consulta ordenada;
    - exclusão lógica ou política definida.
11. Adicione uma tela de diagnóstico somente em desenvolvimento que informe versão do banco e disponibilidade de armazenamento, sem expor conteúdo pessoal.
12. Atualize docs/DATA_MODEL.md e docs/DECISIONS.md.
13. Não implemente ainda formulários reais ou a cena Phaser.

Critério de conclusão:
- casos de uso usam Dexie somente por injeção;
- testes de migração passam;
- build Android continua sincronizando.
```

## Gate G3 — Dados confiáveis em camada isolada

Testes obrigatórios:

- criar dados por um teste ou tela temporária de desenvolvimento;
- recarregar navegador e confirmar persistência;
- testar APK após fechar e reabrir;
- reiniciar o aparelho e confirmar persistência;
- instalar uma atualização debug por cima e confirmar dados existentes;
- documentar resultado.

Marco sugerido: `v0.2.0-alpha.1`.

---

# BLOCO 4 — Aplicativo pessoal utilizável

## PROMPT 7 — Cadastro e edição de livro

### Objetivo

Transformar o domínio em uma função útil por meio de uma interface acessível.

### Prompt para o Codex

```text
Implemente o fluxo de cadastro e edição de livros na interface React.

Escopo:

1. Conecte a rota “Novo livro” ao caso de uso CreateBookEntry.
2. Crie formulário acessível com campos do protótipo:
   - título;
   - autor;
   - total de páginas opcional;
   - página atual;
   - status;
   - avaliação opcional;
   - data de início opcional;
   - gênero ou etiquetas simples, se já estiverem previstos no modelo.
3. Use o schema de fronteira para validação, sem duplicar regras em handlers.
4. Exiba erros por campo e resumo de erro quando necessário.
5. Implemente edição reutilizando a estrutura do formulário sem duplicar uma segunda versão inteira.
6. Após salvar, navegue para a tela de detalhes do livro.
7. Proteja contra duplo envio.
8. Não implemente upload ou busca de capa.
9. Crie testes de componente e fluxo para sucesso, erro e edição.
10. Remova qualquer tela temporária de escrita criada apenas para testar o banco.

Critério de conclusão:
- livro pode ser criado e editado pelo navegador e APK;
- validação é consistente com o domínio;
- nenhum componente importa Dexie.
```

---

## PROMPT 8 — Coleção, detalhes, progresso, notas e citações

### Objetivo

Completar o ciclo prático mínimo de uso pessoal.

### Prompt para o Codex

```text
Implemente a coleção e a tela de detalhes do livro.

Escopo:

1. Na Coleção, liste livros com:
   - título;
   - autor;
   - status;
   - progresso textual e visual;
   - última atualização.
2. Crie estado vazio com ação clara para cadastrar o primeiro livro.
3. Crie rota de detalhe por ID com tratamento de ID inexistente.
4. Na tela de detalhe, permita:
   - atualizar página atual;
   - alterar status;
   - concluir;
   - retomar;
   - editar dados;
   - adicionar nota;
   - adicionar citação.
5. Exiba histórico básico de notas e citações do livro.
6. Use casos de uso; não faça escrita direta no banco.
7. Reaja a atualizações sem recarregar toda a aplicação.
8. Implemente confirmação antes de exclusão ou arquivamento conforme a política existente.
9. Crie testes de componente e integração para:
   - estado vazio;
   - lista;
   - detalhe;
   - progresso;
   - conclusão;
   - nota;
   - citação;
   - item inexistente.

Critério de conclusão:
- o usuário consegue manter um diário simples de leitura real;
- conclusão emite evento de domínio;
- interface continua funcional sem Phaser.
```

---

## PROMPT 9 — Busca, filtros e arquivo

### Objetivo

Tornar a aplicação utilizável quando a coleção deixar de ter três itens bonitinhos e começar a ter volume.

### Prompt para o Codex

```text
Implemente busca e organização básica do protótipo.

Escopo:

1. Adicione busca por título e autor na Coleção.
2. Adicione filtros por status.
3. Adicione ordenação por:
   - atualização recente;
   - título;
   - progresso.
4. Preserve filtros e busca durante a navegação da sessão sem torná-los dados persistentes obrigatórios.
5. Implemente a rota Arquivo com pesquisa e agrupamento de notas e citações.
6. Permita navegar de uma nota ou citação para o livro relacionado.
7. Garanta consultas eficientes pelos índices reais do banco ou por uma estratégia explícita adequada ao volume do protótipo.
8. Não implemente busca textual avançada, ranking, tags complexas ou paginação prematura.
9. Crie testes para combinações de busca, filtro, ordenação e arquivo vazio.
10. Documente limites conhecidos da busca atual.

Critério de conclusão:
- uma coleção de teste com pelo menos 100 livros permanece utilizável;
- busca e filtros não alteram dados;
- nenhum filtro invade o domínio como regra de negócio.
```

## Gate G4 — Ferramenta real

O aplicativo precisa ser útil mesmo com a aba Biblioteca visual ainda vazia.

Teste de uso:

- cadastrar pelo menos dez livros reais;
- editar;
- atualizar progresso;
- concluir um;
- adicionar notas e citações;
- buscar e filtrar;
- usar durante alguns dias sem recorrer ao console.

Marco sugerido: `v0.3.0-alpha.1`.

---

# BLOCO 5 — Integridade, backup e segurança inicial

## PROMPT 10 — Backup, restauração, recuperação e endurecimento

### Objetivo

Evitar que o aplicativo se torne emocionalmente marcante pela perda de todas as anotações.

### Prompt para o Codex

```text
Implemente confiabilidade local, backup e controles iniciais de segurança.

Escopo:

1. Crie um formato de backup JSON versionado contendo:
   - versão do formato;
   - data de criação;
   - versão do app;
   - dados do protótipo;
   - metadados mínimos;
   - checksum ou mecanismo simples de integridade quando tecnicamente adequado.
2. Implemente ExportBackup e ImportBackup atrás de portas.
3. Valide todo arquivo importado com Zod antes de modificar o banco.
4. Faça a importação ocorrer em transação.
5. Ofereça duas políticas explícitas:
   - substituir todos os dados;
   - mesclar apenas quando a regra puder ser segura e testável.
   Caso mescla segura ainda não exista, implemente somente substituição e documente a decisão.
6. Antes de substituir, crie backup de segurança ou permita cancelamento claro.
7. Implemente tela de Configurações com:
   - exportar;
   - importar;
   - informação de versão do banco;
   - status de persistência;
   - aviso de privacidade do arquivo exportado.
8. No Android, use Capacitor Filesystem/Share somente se necessário para a experiência. Mantenha adaptação web equivalente.
9. Adicione Error Boundary e uma tela de recuperação que não apague dados automaticamente.
10. Configure uma Content Security Policy inicial compatível com os assets locais.
11. Garanta que logs não incluam título, nota, citação ou conteúdo do backup.
12. Crie testes para:
    - exportação;
    - importação válida;
    - arquivo inválido;
    - versão futura incompatível;
    - rollback em falha;
    - restauração em banco limpo.
13. Atualize docs/SECURITY.md e docs/TEST_PLAN.md.

Critério de conclusão:
- dados de uma instalação podem ser restaurados em outra instalação limpa;
- importação inválida não modifica o banco;
- APK consegue exportar e importar por um fluxo compreensível.
```

## Gate G5 — Dados recuperáveis

Teste destrutivo controlado:

1. preencher base de teste;
2. exportar;
3. limpar dados do aplicativo;
4. reinstalar ou abrir base vazia;
5. importar;
6. comparar contagens e amostras;
7. confirmar que a biblioteca pessoal voltou.

Nenhum polimento visual tem prioridade sobre este gate.

---

# BLOCO 6 — Integração da biblioteca visual

## PROMPT 11 — Host Phaser e ciclo de vida

### Objetivo

Adicionar Phaser sem permitir que ele tome posse do aplicativo inteiro.

### Prompt para o Codex

```text
Integre Phaser à rota Biblioteca como uma view especializada e carregada sob demanda.

Escopo:

1. Instale Phaser 3 em versão estável compatível e registre a decisão.
2. Carregue o bundle do Phaser somente quando a rota Biblioteca for aberta.
3. Crie um componente React host responsável por:
   - montar o canvas;
   - criar a instância Phaser;
   - redimensionar;
   - pausar ao perder visibilidade;
   - retomar;
   - destruir completamente ao desmontar.
4. Crie uma cena inicial pequena, com câmera fixa e placeholders geométricos:
   - chão;
   - parede;
   - uma estante;
   - balcão;
   - espaço da bibliotecária;
   - espaço da criatura.
5. Não acesse Dexie ou casos de uso diretamente na cena.
6. Crie contratos tipados mínimos para a ponte React–Phaser.
7. Adicione fallback textual quando WebGL/Canvas falhar.
8. Garanta que entrar e sair da rota repetidamente não crie múltiplas instâncias nem listeners órfãos.
9. Crie testes possíveis no ambiente unitário para lifecycle e contratos; documente o que exige teste manual.
10. Adicione diagnóstico de desenvolvimento para contagem de instâncias e estado da cena.
11. Não implemente ainda reação aos livros, personagens ou áudio.

Critério de conclusão:
- cena abre no navegador e APK;
- sair e voltar funciona repetidamente;
- coleção continua independente;
- bundle inicial não carrega Phaser antes da rota.
```

---

## PROMPT 12 — Projeção visual e ponte de eventos

### Objetivo

Transformar dados reais em um modelo visual pequeno e testável.

### Prompt para o Codex

```text
Implemente a projeção visual da biblioteca e a ponte bidirecional entre aplicação e Phaser.

Escopo:

1. Crie um LibraryProjectionService puro, fora do Phaser, que receba dados necessários e produza um LibraryViewModel imutável.
2. O primeiro view model deve incluir:
   - quantidade total de livros;
   - quantidade em andamento;
   - quantidade concluída;
   - estado de lotação da estante;
   - livro recentemente atualizado;
   - existência do primeiro marco de conclusão;
   - estado visual padrão da sala.
3. Defina estados de estante por faixas, não um sprite completo por livro.
4. Conecte a projeção à rota Biblioteca por casos de consulta.
5. Envie atualizações à cena pela ponte tipada sem recriar o jogo inteiro.
6. Defina interações de saída:
   - ShelfSelected;
   - LibrarianSelected;
   - CreatureSelected;
   - HighlightedBookSelected.
7. Conecte ShelfSelected à abertura de um painel React acessível com resumo e ação para abrir Coleção.
8. Phaser não deve abrir modal HTML nem navegar diretamente.
9. Escreva testes abrangentes da projeção para biblioteca vazia, parcial e com concluídos.
10. Documente o contrato da ponte.

Critério de conclusão:
- adicionar ou concluir um livro altera o view model;
- a cena recebe o novo estado;
- tocar a estante abre interface React;
- nenhuma regra de desbloqueio foi codificada na cena.
```

---

## PROMPT 13 — Primeira sala reativa, bibliotecária e criatura

### Objetivo

Entregar a primeira versão visual emocionalmente reconhecível, ainda com arte provisória ou inicial.

### Prompt para o Codex

```text
Implemente a primeira sala reativa da Biblioteca Viva com arquitetura orientada a dados.

Escopo:

1. Substitua placeholders conforme os assets disponíveis, mantendo fallback geométrico quando faltar asset.
2. Implemente:
   - uma estante com estados visuais vazio, inicial, ocupada e com concluído;
   - uma bibliotecária com idle simples;
   - uma criatura com idle e pequena movimentação delimitada;
   - iluminação ambiente simples;
   - objeto de destaque para o livro recentemente atualizado.
3. Use manifests/configurações para assets, posições e animações; evite números espalhados pela cena.
4. Implemente interação por toque nos três elementos.
5. Exiba painéis React com:
   - resumo da estante;
   - fala provisória da bibliotecária;
   - descrição da criatura.
6. Respeite safe areas e diferentes proporções de tela.
7. Mantenha câmera fixa e sem joystick.
8. Limite animações e efeitos para aparelhos modestos.
9. Não implemente múltiplas salas, editor de decoração ou pathfinding complexo.
10. Crie testes de integridade dos manifests e da escolha de estado visual.
11. Documente orçamento inicial de assets e animações.

Critério de conclusão:
- biblioteca vazia e biblioteca preenchida são visualmente diferentes;
- toque funciona no APK;
- cena mantém desempenho estável no aparelho-alvo;
- ausência de um asset produz fallback, não tela preta.
```

## Gate G6 — A metáfora funciona

Teste principal:

- abrir biblioteca vazia;
- cadastrar livro;
- voltar;
- observar mudança;
- atualizar progresso;
- concluir;
- observar estado de concluído;
- tocar estante, bibliotecária e criatura;
- confirmar que as telas convencionais continuam melhores para editar dados.

Marco sugerido: `v0.4.0`.

---

# BLOCO 7 — Som e conteúdo contextual

## PROMPT 14 — Arquitetura de áudio e primeira paisagem sonora

### Objetivo

Tratar som como núcleo sem espalhar chamadas de reprodução pelo projeto.

### Prompt para o Codex

```text
Implemente o sistema de áudio desacoplado da Biblioteca Viva.

Escopo:

1. Crie um AudioPort na aplicação e uma implementação web/mobile atrás dele.
2. Avalie Howler.js ou Web Audio para a implementação; escolha uma opção, registre a decisão e mantenha-a substituível.
3. Crie um manifesto de áudio com IDs estáveis e categorias:
   - música;
   - ambiente;
   - interface;
   - interação;
   - marco.
4. Implemente:
   - inicialização após primeira interação do usuário;
   - música ambiente da biblioteca;
   - efeito de página/interface;
   - efeito ao tocar estante;
   - efeito de conclusão;
   - volumes separados para música e efeitos;
   - mute;
   - persistência de preferências;
   - pausa e retomada no ciclo de vida do app;
   - liberação de recursos.
5. React e Phaser devem emitir intenções; nenhum deles deve controlar diretamente a biblioteca de áudio em arquivos espalhados.
6. Crie controles acessíveis em Configurações.
7. Forneça feedback visual/textual equivalente para eventos importantes.
8. Não implemente reprodução em segundo plano.
9. Teste comportamento sem áudio disponível e com arquivo ausente.
10. Documente formatos, duração e orçamento de tamanho dos arquivos.

Critério de conclusão:
- áudio inicia de forma permitida no Android;
- volumes persistem;
- minimizar e restaurar não cria duas músicas simultâneas;
- desligar áudio realmente silencia tudo.
```

---

## PROMPT 15 — Conteúdo externo, localização e diálogos básicos

### Objetivo

Permitir que textos e conteúdo cresçam sem alteração do motor.

### Prompt para o Codex

```text
Implemente a infraestrutura de conteúdo e diálogos básicos orientados a dados.

Escopo:

1. Crie schemas validados para:
   - diálogos;
   - personagens;
   - salas;
   - decorações;
   - textos de interface relevantes.
2. Prepare localização com pt-BR como idioma inicial e fallback explícito.
3. Mova textos contextuais da bibliotecária e criatura para arquivos de conteúdo.
4. Implemente um DialogueSelector puro com:
   - evento;
   - condições simples;
   - prioridade;
   - `once`;
   - cooldown ou bloqueio de repetição;
   - fallback.
5. Persista somente o histórico necessário para não repetir falas únicas.
6. Crie diálogos para:
   - biblioteca vazia;
   - primeiro livro;
   - livro em andamento;
   - primeira conclusão;
   - retorno após alguns dias, sem culpa.
7. Não use IA nem comentários sobre conteúdo real dos livros.
8. Crie testes de seleção, prioridade, fallback, repetição e conteúdo inválido.
9. Atualize docs/CONTENT_GUIDE.md com regras de tom e limites.

Critério de conclusão:
- adicionar novas falas exige principalmente editar conteúdo;
- conteúdo inválido falha cedo em desenvolvimento;
- a bibliotecária não afirma conhecer uma obra apenas pelo título.
```

## Gate G7 — Identidade sensorial

- música e ambiente funcionam no aparelho;
- controles de áudio funcionam;
- os elementos visuais possuem respostas sonoras coerentes;
- a bibliotecária apresenta falas contextuais sem repetição irritante;
- redução de movimento e mute não quebram o ciclo.

Marco sugerido: `v0.5.0`.

---

# BLOCO 8 — Marco, desbloqueio e primeiro ciclo completo

## PROMPT 16 — Motor de marcos e primeiro desbloqueio

### Objetivo

Completar a promessa emocional do protótipo com regras testáveis, não com um `if` escondido na cena.

### Prompt para o Codex

```text
Implemente o motor inicial de marcos e desbloqueios da Biblioteca Viva.

Escopo:

1. Crie definições declarativas validadas para marcos e recompensas.
2. Implemente um MilestoneEngine puro que avalia eventos de domínio e estado consultável.
3. Implemente persistência de:
   - marco alcançado;
   - data;
   - recompensas concedidas;
   - evento de origem;
   - versão da regra quando necessária.
4. Crie os marcos do protótipo:
   - primeiro livro cadastrado;
   - primeira nota;
   - primeira citação;
   - primeiro livro concluído.
5. O primeiro livro concluído deve desbloquear uma decoração pequena e gerar:
   - evento de domínio/aplicação;
   - atualização da projeção;
   - animação visual;
   - efeito sonoro;
   - diálogo contextual;
   - notificação React acessível.
6. Garanta idempotência: reprocessar o mesmo evento não concede a recompensa duas vezes.
7. Não crie níveis, moeda, árvore de progressão ou dezenas de conquistas.
8. Crie testes para ordem, idempotência, regras não atendidas e restauração de backup.
9. Permita reconstruir projeções derivadas quando possível sem apagar desbloqueios legítimos.
10. Atualize documentação de progressão.

Critério de conclusão:
- o ciclo cadastrar → progredir → concluir → reagir funciona de ponta a ponta;
- regras são independentes do Phaser;
- repetir conclusão ou recarregar não duplica recompensa.
```

## Gate G8 — Núcleo do produto demonstrado

O protótipo só avança quando a seguinte experiência estiver completa no APK:

1. cadastrar livro;
2. ver estante crescer;
3. atualizar progresso;
4. concluir;
5. ouvir e ver reação;
6. receber fala;
7. desbloquear decoração;
8. fechar e reabrir;
9. encontrar estado preservado;
10. exportar e restaurar o mesmo estado.

---

# BLOCO 9 — Acessibilidade, robustez e desempenho

## PROMPT 17 — Acessibilidade e preferências de experiência

### Objetivo

Garantir que a camada encantadora não transforme o aplicativo em um objeto bonito e hostil.

### Prompt para o Codex

```text
Implemente e consolide acessibilidade e preferências de experiência no protótipo.

Escopo:

1. Faça uma auditoria das telas React para:
   - semântica;
   - rótulos;
   - foco;
   - ordem de navegação;
   - mensagens de erro;
   - tamanho de toque;
   - contraste;
   - suporte a fonte ampliada.
2. Implemente preferências persistidas para:
   - reduzir movimento;
   - alto contraste;
   - tamanho de texto entre opções controladas;
   - volumes e mute já existentes.
3. Faça a cena Phaser respeitar redução de movimento:
   - menos partículas;
   - animações decorativas reduzidas;
   - transições simplificadas;
   - ausência de flashes agressivos.
4. Adicione uma alternativa textual do estado atual da biblioteca fora do canvas.
5. Garanta que toda ação essencial da biblioteca possua equivalente React.
6. Verifique que informação não dependa apenas de cor ou som.
7. Crie testes automatizados possíveis e uma checklist manual de leitor de tela/teclado.
8. Não tente prometer acessibilidade total do canvas; documente limites com honestidade.

Critério de conclusão:
- app permanece utilizável com animação reduzida e áudio desligado;
- navegação essencial funciona sem depender do canvas;
- controles são operáveis com tecnologia assistiva na camada React.
```

---

## PROMPT 18 — Perfil de desempenho e estabilidade mobile

### Objetivo

Medir e corrigir gargalos reais antes de polir detalhes.

### Prompt para o Codex

```text
Faça uma rodada controlada de desempenho e estabilidade do protótipo, com foco em Android modesto.

Escopo:

1. Adicione ferramentas de diagnóstico apenas em desenvolvimento para:
   - FPS aproximado da cena;
   - tempo de carregamento da biblioteca;
   - quantidade de objetos ativos;
   - eventos/listeners ativos quando mensurável;
   - tamanho dos principais chunks do build.
2. Analise o bundle e confirme que Phaser é carregado sob demanda.
3. Teste e corrija:
   - entrar e sair da biblioteca 20 vezes;
   - minimizar e restaurar;
   - rotação ou bloqueio de orientação conforme decisão;
   - perda e restauração de contexto gráfico quando reproduzível;
   - áudio duplicado;
   - listeners órfãos;
   - vazamento evidente de memória;
   - toque em aparelhos lentos.
4. Otimize apenas gargalos encontrados, priorizando:
   - atlas;
   - redução de draw calls;
   - limites de partículas;
   - carregamento de assets;
   - destruição correta;
   - imagens e áudios comprimidos.
5. Crie um modo automático ou configurável de efeitos reduzidos quando necessário, sem degradar dados ou funcionalidades.
6. Registre métricas antes e depois no TEST_PLAN.
7. Não faça refatoração global sem evidência de ganho.

Critério de conclusão:
- aplicação suporta a checklist no aparelho-alvo;
- não há duplicação de cena ou áudio;
- desempenho é estável e documentado;
- build permanece funcional.
```

## Gate G9 — Qualidade mobile

- teste completo no smartphone principal;
- teste em pelo menos uma segunda configuração Android quando possível;
- todos os fluxos funcionam offline;
- nenhum erro crítico após 30 minutos de uso misto;
- desempenho e limitações registrados;
- acessibilidade essencial aprovada.

Marco sugerido: `v0.6.0`.

---

# BLOCO 10 — Testes de regressão, CI e documentação final

## PROMPT 19 — Suíte crítica, CI e documentação de manutenção

### Objetivo

Transformar o protótipo em projeto de portfólio que outra pessoa — e o próprio criador daqui a três meses — consiga compreender e manter.

### Prompt para o Codex

```text
Consolide testes, integração contínua e documentação do protótipo Biblioteca Viva.

Escopo:

1. Revise a suíte e cubra os fluxos críticos sem buscar porcentagem artificial:
   - criação e edição de livro;
   - progresso e conclusão;
   - notas e citações;
   - busca e filtros;
   - migração;
   - backup e restauração;
   - projeção visual;
   - diálogo;
   - marco idempotente.
2. Configure Playwright para E2E web dos principais fluxos.
3. Crie fixtures pequenas e determinísticas.
4. Configure CI no GitHub para executar em pull request e push na branch principal:
   - instalação limpa;
   - format check;
   - lint;
   - typecheck;
   - testes;
   - build.
5. Não coloque segredos, keystore ou assinatura Android na CI inicial.
6. Revise e atualize:
   - README.md;
   - AGENTS.md;
   - docs/00_LEIA-ME.md;
   - ARCHITECTURE.md;
   - DATA_MODEL.md;
   - ROADMAP.md;
   - TEST_PLAN.md;
   - SECURITY.md;
   - ACCESSIBILITY.md;
   - ART_DIRECTION.md;
   - CONTENT_GUIDE.md;
   - DECISIONS.md;
   - CHANGELOG.md.
7. Inclua diagramas textuais simples quando ajudarem; não gere documentação promocional vazia.
8. Documente como:
   - instalar;
   - executar;
   - testar;
   - gerar build web;
   - sincronizar Android;
   - gerar APK debug;
   - adicionar um novo diálogo;
   - adicionar uma decoração;
   - criar uma migração;
   - restaurar backup.
9. Remova código temporário, flags de diagnóstico expostas em produção e TODOs obsoletos.
10. Liste débitos técnicos reais restantes, sem fingir que o projeto está perfeito.

Critério de conclusão:
- clone limpo pode ser instalado e validado seguindo README;
- CI passa;
- documentação corresponde ao código;
- fluxo E2E crítico passa no web;
- checklist Android continua separada e atualizada.
```

## Gate G10 — Candidato a protótipo

- todos os checks automatizados passam;
- E2E crítico passa;
- build Android debug passa;
- uso real de alguns dias não revelou perda de dados;
- backup foi restaurado novamente;
- documentação foi lida e conferida;
- débitos estão explícitos.

---

# BLOCO 11 — APK assinado e apresentação de portfólio

## Natureza

Mistura de operação manual, arte final, documentação e pequenos ajustes. Não deve ser entregue a um único prompt amplo do Codex.

## Atividades

### 11.1 Identidade mínima

- nome final ou provisório estável;
- ícone;
- splash;
- paleta consolidada;
- tipografia licenciada;
- créditos de assets;
- sons e músicas com licença documentada;
- capturas de tela.

### 11.2 Assinatura Android

- definir appId definitivo antes de distribuição;
- gerar keystore;
- armazenar keystore fora do repositório;
- criar duas cópias seguras;
- manter senhas fora do Git;
- gerar APK release assinado;
- gerar AAB se houver intenção de Play Store;
- testar atualização assinada sobre versão anterior compatível.

### 11.3 Portfólio

- README com proposta, GIF ou vídeo curto;
- explicação da arquitetura;
- limitações honestas;
- roadmap futuro;
- APK identificado como versão de teste quando apropriado;
- release no GitHub, caso desejado;
- tag de versão somente após aprovação.

## Gate G11 — Protótipo concluído

O protótipo está concluído quando:

- existe APK release assinado e testado;
- fluxo principal funciona offline;
- experiência visual e sonora está presente;
- dados são persistentes, exportáveis e restauráveis;
- coleção continua funcional sem a cena;
- primeiro marco reage corretamente;
- acessibilidade essencial está implementada;
- código e documentação permitem continuidade;
- não existem segredos no repositório;
- o projeto pode receber novos livros, diálogos, sons, decorações e regras sem refazer a base.

Marco sugerido: `v0.7.0` ou `v1.0.0-prototype`, conforme a estratégia de versionamento escolhida.

---

## 3. Resumo dos prompts

| Prompt | Entrega principal | Risco controlado |
|---:|---|---|
| 1 | Scaffold e qualidade | caos estrutural |
| 2 | Shell e rotas | UI improvisada |
| 3 | APK debug cedo | descoberta tardia de incompatibilidade |
| 4 | Domínio | regras espalhadas |
| 5 | Casos de uso e portas | acoplamento |
| 6 | Dexie e migrações | persistência frágil |
| 7 | Cadastro/edição | formulário sem contrato |
| 8 | Coleção/detalhe | app visual, mas inútil |
| 9 | Busca/arquivo | degradação com volume |
| 10 | Backup/segurança | perda de dados |
| 11 | Host Phaser | ciclo de vida quebrado |
| 12 | Projeção e ponte | Phaser dono do domínio |
| 13 | Sala reativa | visual rígido |
| 14 | Áudio | som espalhado e duplicado |
| 15 | Conteúdo/diálogo | textos presos ao código |
| 16 | Marcos | gamificação acoplada |
| 17 | Acessibilidade | experiência excludente |
| 18 | Desempenho | otimização por chute |
| 19 | Testes, CI e docs | dependência permanente do Codex |

---

## 4. Quando dividir um prompt

Dividir um prompt somente quando, durante a execução, uma destas condições aparecer:

- mais de um subsistema central precisa ser criado do zero;
- o Codex propõe alterar mais de aproximadamente 15 arquivos de produção com responsabilidades distintas;
- a tarefa exige uma migração destrutiva e uma funcionalidade nova simultaneamente;
- testes não podem ser executados antes de concluir uma segunda grande parte;
- o relatório indica decisões arquiteturais não previstas;
- a revisão humana deixa de conseguir explicar o diff de forma razoável.

Não dividir apenas porque há muitos arquivos pequenos, testes correspondentes ou documentação associada à mesma mudança coesa.

---

## 5. Quando juntar prompts

Prompts vizinhos podem ser unidos apenas quando:

- o repositório já possui abstrações equivalentes prontas;
- o diff estimado permanece local;
- o gate pode ser testado de uma vez;
- nenhum dos prompts esconde risco de plataforma, migração ou ciclo de vida;
- o Codex recebeu documentação atualizada e o usuário compreende a área.

Não juntar:

- persistência e formulário inicial;
- integração Phaser e sala completa;
- backup e sincronização;
- áudio e progressão;
- assinatura Android e refatoração de código.

---

## 6. Cadência de commits sugerida

- um commit por prompt quando a mudança for substancial;
- dois prompts no mesmo commit apenas se o primeiro for scaffold incompleto do segundo e ambos forem revisados juntos;
- mensagem descrevendo resultado, não atividade genérica;
- tag somente em gates relevantes;
- documentação atualizada no mesmo commit da mudança que descreve.

Exemplos:

```text
chore: initialize strict React TypeScript foundation
feat: add responsive application shell and routes
build: add Capacitor Android debug project
feat(domain): add book entry rules and events
feat(storage): add versioned Dexie persistence
feat(library): connect visual shelf projection
feat(audio): add lifecycle-aware audio service
feat(progression): add first completion milestone
```

---

## 7. Estimativa por faixa, não promessa

Com uma pessoa, Codex, revisão humana e produção gradual de assets:

- Blocos 0–3: 1 a 2 semanas;
- Blocos 4–5: 1 a 2 semanas;
- Blocos 6–8: 2 a 4 semanas;
- Blocos 9–11: 1 a 3 semanas.

Faixa provável do protótipo: **5 a 10 semanas**, dependendo principalmente de:

- tempo semanal disponível;
- aprendizado de React e TypeScript;
- qualidade e disponibilidade de pixel art;
- música e efeitos;
- problemas específicos do Android;
- quantidade de revisões de UX;
- disciplina para não puxar filmes, séries, estudos e três novas salas para dentro do primeiro mês.

O código provavelmente não será o único gargalo. Arte, áudio, testes reais e decisões de interface tendem a consumir uma parte considerável do trabalho.

---

## 8. Próximas expansões após o protótipo

A ordem recomendada depois do Gate G11 é:

1. uso pessoal contínuo e correção de atritos;
2. filmes, séries e estudos por novos tipos discriminados;
3. tags e estatísticas melhores;
4. segunda sala e novo personagem;
5. revisão de persistência e possível SQLite Android;
6. anexos e capas;
7. sincronização e conta somente após uma proposta concreta de produto;
8. recursos públicos ou sociais por último.

Cada expansão deverá entrar como módulo vertical completo: domínio, aplicação, persistência, interface, projeção visual, testes e documentação.

---

## 9. Definição final de pronto

O trabalho não termina quando “o Codex implementou”. Termina quando:

- o diff foi compreendido;
- os testes passaram;
- o APK foi testado;
- o comportamento foi observado;
- a documentação foi atualizada;
- o gate foi aprovado;
- o usuário consegue continuar o projeto sem depender da memória da conversa.
