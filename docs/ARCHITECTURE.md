# Biblioteca Viva — Decisão de Arquitetura e Stack

> Data da decisão: 28 de julho de 2026  
> Estado: arquitetura inicial aprovada para protótipo de uso pessoal com qualidade de portfólio  
> Objetivo de distribuição: aplicativo web instalável durante o desenvolvimento e APK Android ao fim do protótipo

---

## 1. Decisão executiva

A arquitetura recomendada para a Biblioteca Viva é uma aplicação híbrida web-first, local-first e modular, composta por:

- **TypeScript em modo estrito** como linguagem principal;
- **React** para telas convencionais, navegação, formulários, coleção, arquivo, configurações e acessibilidade;
- **Vite** para desenvolvimento e build;
- **Phaser 3** exclusivamente para a representação visual e interativa da biblioteca;
- **Capacitor 8** para empacotar a aplicação no Android e produzir APK/AAB;
- **Dexie sobre IndexedDB** como persistência inicial, isolada atrás de interfaces de repositório;
- **Zod** para validar formulários, importações, backups e dados recebidos de integrações futuras;
- **Vitest** para testes unitários e de integração;
- **React Testing Library** para componentes e fluxos de interface;
- **Playwright** para testes de ponta a ponta da versão web;
- testes reais e recorrentes em Android para validar WebView, persistência, áudio, desempenho e ciclo de vida;
- **CSS Modules e design tokens** para a interface, sem depender de uma biblioteca visual genérica;
- um **AudioService** desacoplado, inicialmente implementável com Howler.js ou Web Audio, sem permitir que React ou Phaser controlem áudio diretamente de forma espalhada;
- Git, documentação arquitetural, gates de qualidade e commits pequenos como parte da própria arquitetura.

Essa stack é a opção mais adequada para o objetivo atual. Ela entrega a experiência visual e sonora como parte do núcleo, permite um aplicativo convencional realmente utilizável e mantém um caminho direto até Android sem obrigar a manter dois produtos separados.

---

## 2. O produto que esta arquitetura deve sustentar

A Biblioteca Viva será inicialmente:

- um aplicativo de uso pessoal real;
- um projeto de portfólio público e bem documentado;
- local-first e funcional sem conta;
- prioritariamente Android;
- utilizável também no navegador durante desenvolvimento e demonstração;
- visual e sonoramente expressivo desde o protótipo;
- preparado para novos tipos de registro, salas, personagens, decorações, diálogos, áudio, sincronização e backend futuros;
- incapaz de depender de backend, login, assinatura ou serviço pago para suas funções essenciais.

Ela **não será tratada agora como um produto comercial**, mas também não deverá ser construída de modo descartável.

---

## 3. Por que a stack híbrida é a melhor escolha

### 3.1 React para o aplicativo

A maior parte da Biblioteca Viva é uma aplicação de dados:

- cadastro;
- edição;
- busca;
- filtros;
- formulários;
- listas;
- detalhes;
- notas;
- configurações;
- backup;
- acessibilidade.

React é adequado para esse tipo de interface, possui suporte sólido a TypeScript, permite organizar estados e componentes de maneira previsível e possui um ecossistema amplo para testes e manutenção.

O React não deverá conter as regras de negócio. Componentes chamam casos de uso e exibem resultados; eles não decidem marcos, desbloqueios ou regras de progresso.

### 3.2 Phaser para a biblioteca viva

A biblioteca visual precisa de:

- renderização 2D;
- sprites;
- animações;
- iluminação;
- câmeras;
- efeitos;
- interações por toque;
- personagens com rotinas simples;
- carregamento de atlas;
- controle de desempenho mobile.

Phaser oferece esses recursos sem obrigar o projeto a transformar formulários, listas e textos em uma cena de jogo. Ele deve ser tratado como uma **view especializada**, não como o dono do aplicativo.

### 3.3 Capacitor para Android

Capacitor envolve o build web em um projeto Android nativo, dá acesso a APIs do aparelho por plugins e mantém o mesmo núcleo TypeScript/HTML/CSS usado no navegador.

Isso permite:

- gerar APK de depuração desde cedo;
- gerar APK assinado e AAB de lançamento posteriormente;
- usar Android Studio quando necessário;
- acessar ciclo de vida do aplicativo;
- adicionar arquivos, compartilhamento, notificações, biometria ou armazenamento seguro no futuro;
- preservar a versão web sem reescrever o produto.

### 3.4 Vite e TypeScript

Vite oferece desenvolvimento rápido, build moderno e integração natural com React e Vitest. TypeScript estrito reduz erros de integração entre domínio, banco, React, Phaser e Capacitor.

TypeScript deverá ser usado com:

- `strict: true`;
- ausência de `any` sem justificativa;
- tipos discriminados para os tipos de registro;
- validação em runtime nas fronteiras;
- contratos explícitos para repositórios, eventos e adaptadores.

---

## 4. Alternativas avaliadas

### 4.1 Flutter

**Vantagens:** excelente experiência mobile, widgets consistentes, bom desempenho e um único projeto para várias plataformas.

**Problemas neste projeto:** exigiria Dart; substituiria React e Phaser; a biblioteca visual precisaria ser refeita com outra tecnologia, como Flame ou renderização personalizada; reduziria o reaproveitamento do conhecimento já adquirido; aumentaria o custo inicial antes de validar o produto.

**Conclusão:** tecnicamente viável, mas não é a opção mais econômica nem coerente para este projeto.

### 4.2 React Native

**Vantagens:** componentes nativos, grande ecossistema e boa integração com Android.

**Problemas:** Phaser não roda como parte natural de uma árvore React Native; seria necessário usar WebView, Skia ou outro motor; isso produziria duas camadas de renderização e integração mais difícil do que usar Capacitor diretamente.

**Conclusão:** acrescenta complexidade sem oferecer benefício proporcional para uma aplicação que já depende de uma experiência web 2D.

### 4.3 Godot

**Vantagens:** excelente para cenas, animações, áudio e exportação Android.

**Problemas:** formulários, listas extensas, edição de texto, acessibilidade, busca, filtros e interfaces convencionais são muito mais trabalhosos; a aplicação tenderia a parecer um jogo que imita um app.

**Conclusão:** seria adequada se a Biblioteca Viva fosse primeiro um jogo. Não é.

### 4.4 Tudo em Phaser

**Vantagens:** uma única tecnologia visual.

**Problemas:** manutenção ruim de formulários e textos, acessibilidade limitada, navegação difícil, edição de dados penosa e acoplamento entre conteúdo pessoal e cena.

**Conclusão:** rejeitado.

### 4.5 Tudo em React e CSS

**Vantagens:** simplicidade inicial.

**Problemas:** a evolução para personagens, salas, animações, atlas, iluminação e rotinas transformaria a interface em um motor de jogo artesanal e frágil.

**Conclusão:** suficiente para uma maquete, inadequado para a visão de longo prazo.

---

## 5. Decisão sobre armazenamento

### 5.1 Escolha inicial

O protótipo usará **Dexie sobre IndexedDB**, porque oferece:

- funcionamento local e offline;
- consultas melhores que IndexedDB puro;
- transações;
- migrações versionadas;
- reatividade;
- integração direta com TypeScript e navegador;
- baixo custo para iniciar.

### 5.2 Limitação que não pode ser ignorada

IndexedDB é armazenamento de WebView. Não deve ser tratado como cofre invulnerável nem ficar espalhado pelo código.

Por isso:

- React, Phaser e casos de uso nunca importarão Dexie diretamente;
- toda persistência passará por portas de repositório;
- o app solicitará armazenamento persistente quando a plataforma permitir;
- exportação e restauração versionadas entrarão antes do polimento visual final;
- migrações serão testadas;
- anexos e arquivos grandes não serão armazenados como blobs indiscriminadamente;
- dados sensíveis não serão considerados criptografados apenas porque estão no armazenamento privado do aplicativo.

### 5.3 Caminho para SQLite

Uma implementação SQLite nativa poderá substituir ou complementar Dexie no Android sem reescrever domínio e interface.

A migração será considerada obrigatória antes de uma versão pública quando ocorrer pelo menos uma destas condições:

- qualquer perda ou evicção de dados for reproduzida em testes Android;
- o volume de anotações, índices ou histórico degradar consultas;
- anexos offline passarem a fazer parte do núcleo;
- criptografia local forte se tornar requisito;
- a aplicação exigir busca textual mais avançada;
- a sincronização exigir transações ou controle de conflitos mais robustos.

Não será criado um adaptador SQLite agora apenas para satisfazer uma arquitetura imaginária. A interface será preparada; a implementação será adicionada quando houver motivo verificável.

---

## 6. Arquitetura lógica

```text
┌───────────────────────────────────────────────────────────────┐
│ Presentation                                                  │
│ React UI                Phaser Library View                   │
│ telas, formulários      sala, estantes, personagens, efeitos │
└───────────────┬───────────────────────┬───────────────────────┘
                │                       │
                └──────────┬────────────┘
                           ▼
┌───────────────────────────────────────────────────────────────┐
│ Application                                                   │
│ casos de uso, comandos, consultas, eventos, orquestração      │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ Domain                                                        │
│ entidades, tipos, regras, progresso, marcos, projeções        │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ Ports                                                         │
│ repositórios, relógio, IDs, áudio, arquivos, backup, eventos  │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────┐
│ Infrastructure                                                │
│ Dexie, Capacitor, arquivos, áudio, telemetria, backend futuro │
└───────────────────────────────────────────────────────────────┘
```

### Regra principal

Dependências apontam para dentro:

- infraestrutura conhece portas;
- aplicação conhece domínio e portas;
- apresentação conhece aplicação;
- domínio não conhece React, Phaser, Dexie, Capacitor ou navegador.

---

## 7. Estrutura recomendada do repositório

Um único repositório e um único pacote são suficientes no protótipo. Monorepo agora seria teatro corporativo sem corporação.

```text
biblioteca-viva/
├── android/
├── public/
│   └── assets/
│       ├── audio/
│       ├── fonts/
│       ├── images/
│       └── phaser/
├── src/
│   ├── app/
│   │   ├── bootstrap/
│   │   ├── providers/
│   │   ├── routes/
│   │   └── App.tsx
│   ├── domain/
│   │   ├── library-entry/
│   │   ├── note/
│   │   ├── progress/
│   │   ├── milestone/
│   │   ├── dialogue/
│   │   ├── activity/
│   │   └── shared/
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── events/
│   │   ├── ports/
│   │   └── services/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── dexie/
│   │   │   └── migrations/
│   │   ├── audio/
│   │   ├── backup/
│   │   ├── files/
│   │   ├── platform/
│   │   └── security/
│   ├── features/
│   │   ├── library/
│   │   ├── collection/
│   │   ├── entry-editor/
│   │   ├── entry-detail/
│   │   ├── archive/
│   │   └── settings/
│   ├── library-view/
│   │   ├── bridge/
│   │   ├── scenes/
│   │   ├── systems/
│   │   ├── entities/
│   │   ├── projections/
│   │   └── config/
│   ├── content/
│   │   ├── dialogues/
│   │   ├── milestones/
│   │   ├── decorations/
│   │   ├── rooms/
│   │   ├── characters/
│   │   └── locale/
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   └── main.tsx
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── migrations/
├── docs/
│   ├── 00_LEIA-ME.md
│   ├── VISION.md
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── ROADMAP.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   ├── ACCESSIBILITY.md
│   ├── ART_DIRECTION.md
│   ├── CONTENT_GUIDE.md
│   └── DECISIONS.md
├── AGENTS.md
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

Pastas só devem ser criadas quando tiverem conteúdo real. A árvore é direção, não licença para produzir quarenta diretórios vazios.

### 7.1 Estrutura efetiva após o Prompt 1

A fundação inicial mantém somente os arquivos necessários:

```text
src/
├── test/
│   └── setup.ts
├── App.test.tsx
├── App.tsx
├── main.tsx
├── styles.css
└── vite-env.d.ts
```

Na raiz, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js` e os projetos `tsconfig.app.json`, `tsconfig.node.json` e `tsconfig.test.json` configuram build, testes, lint e TypeScript estrito. As camadas de domínio, aplicação e infraestrutura ainda não foram criadas porque não possuem implementação no Prompt 1. Nenhum alias foi adicionado: os poucos imports relativos atuais são diretos e não justificam configuração adicional.

Stack efetivamente instalada ao fim do Prompt 1: React 19, Vite 8, TypeScript 6, ESLint 10, Prettier 3, Vitest 4, Testing Library e jsdom. Naquele ponto, Phaser, Capacitor, Dexie, Zod, roteamento e estado global ainda não estavam instalados.

### 7.2 Estrutura de apresentação após o Prompt 2

React Router DOM 7 foi adicionado para o roteamento declarativo do shell. `BrowserRouter` é composto em `main.tsx`; `App.tsx` contém o shell sem regras de negócio; `routes.ts` mantém uma única tabela tipada para rotas e navegação; e `pages.tsx` contém apenas os cinco placeholders de apresentação.

```text
src/
├── App.tsx
├── main.tsx
├── pages.tsx
├── routes.ts
└── styles.css
```

Os caminhos são `/`, `/colecao`, `/novo-livro`, `/arquivo` e `/configuracoes`. Uma rota curinga apresenta erro simples e retorno à Biblioteca. A navegação usa a mesma lista e o mesmo HTML no mobile e no desktop: CSS a posiciona embaixo em telas estreitas e como barra lateral a partir de 768 px. Os estilos globais permanecem em um único arquivo porque o shell ainda é pequeno; design tokens cobrem cores, superfícies, texto, foco, espaçamento, tipografia, bordas, raios, sombra, toque, camadas e largura de conteúdo.

### 7.3 Integração Android após o Prompt 3

Capacitor `8.4.2` empacota o mesmo build Vite de `dist/` no projeto `android/`. A configuração TypeScript em `capacitor.config.ts` preserva `appId` `com.samuelfrancisco.bibliotecaviva` e `appName` “Biblioteca Viva”. O projeto nativo gerado usa API mínima 24, compile/target SDK 36 e Gradle Wrapper 8.14.3.

O plugin oficial `@capacitor/app` `8.1.1` é a única extensão nativa instalada. A apresentação registra um listener somente em plataforma nativa: rotas internas usam o histórico existente, uma entrada interna sem histórico retorna à Biblioteca e Voltar na raiz encerra sem confirmação. O listener é removido no desmontar; a navegação do navegador não é substituída. Safe areas continuam resolvidas por CSS nos quatro lados, sem dimensões específicas do aparelho.

### 7.4 Domínio efetivo após o Prompt 4

O domínio inicial existe em `src/domain/` e não importa apresentação, navegador ou infraestrutura:

```text
src/domain/
├── annotations.ts  # factories de Note e Quote
├── book.ts         # criação e operações de BookEntry
├── errors.ts       # erros tipados
├── events.ts       # contratos e factories dos seis eventos iniciais
├── schemas.ts      # Zod somente nas fronteiras
├── types.ts        # entidades, entradas e EntryStatus
├── validation.ts   # invariantes compartilhadas internas
├── index.ts        # API pública pequena
└── domain.test.ts  # suíte Node, sem DOM
```

Essa estrutura é deliberadamente local: aplicação, portas, repositórios, Dexie e composition root continuam ausentes até os Prompts 5 e 6. A API pública evita imports futuros de detalhes internos, sem barrels entre submódulos nem ciclos.

### 7.5 Aplicação efetiva após o Prompt 5

```text
src/application/
├── ports.ts             # sete portas assíncronas e dependências explícitas
├── activities.ts        # histórico mínimo sem conteúdo pessoal
├── errors.ts            # códigos públicos e tradução segura de falhas
├── schemas.ts           # DTOs de entrada da aplicação
├── internal.ts          # coordenação interna de validação e efeitos
├── useCases.ts          # seis comandos de escrita
├── queries.ts           # GetBookEntry e ListBookEntries
├── index.ts             # API pública deliberada
└── application.test.ts  # fakes e testes em Node
```

As dependências continuam apontando para dentro: `application` importa somente a API pública de `domain` e suas próprias portas; `domain` não conhece `application`. Não há implementação concreta, repositório em memória de produção, Dexie, navegador ou composition root.

Fluxo de `CreateBookEntry`:

```text
entrada unknown
→ schema da aplicação
→ IdGenerator + Clock
→ createBook do domínio
→ LibraryEntryRepository.save
→ ActivityRepository.save
→ ApplicationEventBus.publish
→ BookEntry
```

Todos os comandos seguem `validar → carregar quando necessário → aplicar domínio → persistir entidade/anotação → persistir atividade → publicar evento → retornar`. Eventos nunca são publicados antes das gravações obrigatórias. IDs de evento e atividade são gerados somente quando o efeito correspondente será executado.

Após o Prompt 6, `ApplicationTransactionRunner` agrupa a gravação da entidade/anotação e da atividade. O adapter Dexie aborta ambas se uma delas falhar. O evento permanece fora da transação e só é publicado depois do commit; se um assinante falhar, a aplicação retorna `EVENT_PUBLICATION_FAILED`, mas os dados já confirmados não são desfeitos. Uma outbox durável não pertence a esta etapa.

### 7.6 Infraestrutura e composição após o Prompt 6

```text
src/infrastructure/
├── database/       # schema, Dexie, repositórios, transação, diagnóstico e testes
├── events/         # event bus local tipado
├── platform/       # Clock, UUID seguro e persistência do navegador
└── index.ts        # API pública pequena
src/app/
├── createApplication.ts          # composition root e fechamento controlado
└── DevelopmentDiagnostics.tsx    # painel condicionado a DEV
```

`infrastructure` implementa portas de `application` e usa tipos públicos de `domain`; nenhuma dependência aponta de volta. A composição abre uma única conexão, instancia repositórios, runner, adapters, bus, comandos e consultas, e oferece `close`. React recebe apenas a fachada de diagnóstico e não importa Dexie.

O fluxo concreto de `CreateBookEntry` é `unknown → schema → ID/Clock → domínio → transação Dexie (livro + atividade) → commit → evento local → resultado`. A mesma fronteira transacional vale para os demais comandos. A solicitação de armazenamento persistente é apenas uma tentativa da plataforma e sua recusa não bloqueia o uso.

### 7.7 Apresentação do cadastro e edição após o Prompt 7

`src/features/entry-editor/` contém um formulário React compartilhado, containers de cadastro e edição, conversão dos valores HTML, mensagens públicas de erro e o destino mínimo de detalhe. O runtime criado em `src/app/createApplication.ts` é entregue pelo bootstrap ao shell; os componentes recebem somente os métodos `execute` necessários e não importam Dexie, banco ou adapters.

As rotas internas são `/livros/:id` e `/livros/:id/editar`. A edição usa `GetBookEntry` e `UpdateBookEntry`; como o contrato vigente de atualização é somente bibliográfico, status, progresso e data de início são exibidos e preservados, mas ficam indisponíveis nessa rota.

### 7.8 Coleção e detalhe após o Prompt 8

A Coleção recebe `ListBookEntries` pelo composition root. O detalhe recebe `GetBookEntry`, `UpdateBookProgress`, `ChangeBookStatus`, `AddNote`, `AddQuote` e as consultas `ListNotesByBook` e `ListQuotesByBook`. Estas duas consultas usam métodos explícitos das portas e índices `entryId` já existentes nos adapters; a apresentação nunca consulta ou filtra tabelas Dexie.

Após uma escrita, o detalhe usa o retorno do caso de uso para substituir o livro ou acrescentar a anotação ao estado local. A Coleção refaz sua consulta ao ser montada novamente. Essa reatividade é deliberadamente local, não cria store global e não muda o formato persistente.

### 7.9 Busca e Arquivo após o Prompt 9

A Coleção carrega `ListBookEntries` uma vez por montagem e deriva em memória busca normalizada, filtro e ordenação sobre uma cópia. `q`, `status` e `sort` ficam em parâmetros de URL; os links para o detalhe levam uma origem validada, permitindo retornar à Coleção ou ao Arquivo com os controles da sessão. Valores inválidos usam fallbacks seguros e não entram no domínio nem no IndexedDB.

`ListAllNotes` e `ListAllQuotes` usam métodos globais mínimos das portas. O Arquivo executa essas duas consultas e `ListBookEntries` em paralelo, monta um único mapa `entryId → BookEntry` e associa todas as anotações sem consultas individuais. Os adapters validam cada registro e retornam arrays congelados em ordem recente determinística. Para aproximadamente 100 livros e algumas centenas de anotações, filtragem e ordenação em memória evitam consultas por tecla e complexidade prematura. Essa política deve ser revista se medições reais mostrarem degradação ou se o volume exigir busca textual avançada.

---

## 8. Modelo de domínio inicial

### 8.1 Nome da entidade

Evitar usar `Record` como nome central, porque `Record<K, V>` já é um tipo utilitário do TypeScript.

Usar **LibraryEntry**.

### 8.2 União discriminada

```text
LibraryEntry
├── BookEntry
├── MovieEntry          futuro
├── SeriesEntry         futuro
├── StudyEntry          futuro
└── FreeEntry           futuro
```

No protótipo, apenas `BookEntry` será implementado, mas o contrato deve permitir outros tipos sem criar dezenas de campos opcionais em uma entidade amorfa.

### 8.3 Metadados comuns

Toda entidade persistente relevante deverá possuir:

- `id` estável, preferencialmente UUID;
- `createdAt` em ISO 8601 UTC;
- `updatedAt` em ISO 8601 UTC;
- `revision` inteiro crescente;
- `deletedAt` opcional para exclusão lógica quando necessário;
- `schemaVersion` no formato de backup, não em cada objeto indiscriminadamente.

Esses campos facilitam histórico, backup, migração e sincronização futura.

### 8.4 Eventos, não event sourcing completo

O aplicativo usará eventos de domínio para desacoplar reações:

- `LibraryEntryCreated`;
- `LibraryEntryUpdated`;
- `ProgressUpdated`;
- `LibraryEntryCompleted`;
- `NoteCreated`;
- `MilestoneReached`;
- `DecorationUnlocked`.

Isso **não** significa implementar event sourcing. O estado atual continuará salvo normalmente. Uma tabela de atividades poderá preservar histórico útil sem tornar toda a aplicação dependente da reconstrução por eventos.

---

## 9. Separação entre React e Phaser

### 9.1 React é responsável por

- navegação;
- formulários;
- lista e detalhes;
- busca e filtros;
- modais e painéis;
- mensagens de erro;
- configurações;
- acessibilidade;
- importação e exportação;
- estado efêmero da interface.

### 9.2 Phaser é responsável por

- renderizar a sala;
- posicionar estantes e objetos;
- animar personagens e criaturas;
- reagir a uma projeção visual pronta;
- detectar toque em objetos do cenário;
- emitir interações sem abrir o banco diretamente;
- efeitos visuais e transições da biblioteca.

### 9.3 Ponte tipada

React e Phaser conversarão por uma ponte pequena:

```text
Application → LibraryProjection → Phaser
Phaser → LibraryInteraction → Application/React
```

Exemplos de `LibraryProjection`:

- estado visual da estante;
- quantidade visual de lombadas;
- livro em destaque;
- decoração desbloqueada;
- personagem ativo;
- clima de iluminação;
- evento visual pendente.

Exemplos de `LibraryInteraction`:

- estante tocada;
- bibliotecária tocada;
- livro visual selecionado;
- criatura tocada;
- animação concluída.

Phaser nunca recebe o banco inteiro e nunca executa regra de negócio.

---

## 10. Estado

### 10.1 Fonte de verdade

- **dados persistentes:** banco por repositórios;
- **regras:** domínio e casos de uso;
- **estado da interface:** React;
- **estado temporário da cena:** Phaser;
- **estado compartilhado efêmero:** uma store pequena, caso realmente necessária.

### 10.2 Zustand

Zustand pode ser usado para:

- painel atualmente aberto;
- seleção atual;
- estado da ponte React–Phaser;
- preferências carregadas em memória;
- notificações efêmeras.

Não deverá armazenar a coleção inteira como fonte primária nem substituir o banco.

---

## 11. Áudio

A experiência sonora é parte do núcleo, mas precisa permanecer controlável e acessível.

Criar um `AudioPort` com operações como:

- inicializar após gesto do usuário;
- tocar música ambiente;
- trocar faixa com transição;
- tocar efeito;
- pausar e retomar com ciclo de vida;
- definir volume geral, música e efeitos;
- aplicar mute;
- respeitar preferências persistidas;
- liberar recursos.

React e Phaser emitem intenções sonoras. Apenas o serviço de áudio decide como tocar.

A implementação inicial pode usar Howler.js ou Web Audio, desde que fique atrás do contrato e seja validada no Android real. Não haverá autoplay forçado nem música tocando antes de uma interação permitida pela plataforma.

---

## 12. Conteúdo orientado a dados

Diálogos, marcos, decorações e projeções não devem ser codificados em grandes cadeias de `if`.

Exemplo:

```ts
interface MilestoneDefinition {
  id: string;
  event: DomainEventType;
  conditions: MilestoneCondition[];
  rewards: RewardDefinition[];
  once: boolean;
}
```

Conteúdo deve possuir:

- IDs estáveis;
- schema validado;
- versão;
- texto fora da lógica;
- fallback;
- testes de integridade;
- suporte a localização futura.

Adicionar uma nova decoração, fala ou marco deverá ser principalmente uma alteração de conteúdo, não uma cirurgia no motor.

---

## 13. Segurança escalável

### 13.1 Agora

- nenhum segredo ou chave privada no bundle;
- nenhuma variável `VITE_*` tratada como secreta;
- Content Security Policy restritiva;
- HTTPS em qualquer integração externa;
- importações validadas por schema;
- Markdown sanitizado antes de renderizar HTML;
- permissões Android mínimas;
- logs sem anotações, títulos privados ou conteúdo pessoal;
- backups criados apenas por ação explícita;
- arquivos exportados identificados como potencialmente sensíveis;
- keystore de assinatura fora do Git e com cópia segura;
- dependências fixadas em lockfile;
- revisão de atualizações e plugins antes de instalar.

### 13.2 Depois, caso exista conta

- autenticação por protocolo adequado;
- PKCE em OAuth nativo;
- tokens no Android Keystore/armazenamento seguro;
- autorização sempre aplicada no backend;
- criptografia em trânsito;
- exclusão e exportação de dados;
- política de sessão;
- auditoria sem conteúdo privado.

### 13.3 O que não prometer

O protótipo local não deve anunciar “criptografia total” sem que exista criptografia real e gestão segura de chaves. O sandbox do Android reduz exposição, mas não substitui um projeto de criptografia.

---

## 14. Estratégia de testes

### 14.1 Pirâmide

1. **Domínio:** muitos testes rápidos e puros.
2. **Aplicação:** casos de uso com repositórios falsos.
3. **Persistência:** integração com Dexie e migrações.
4. **React:** componentes e fluxos críticos.
5. **E2E web:** ciclo completo no navegador.
6. **Android real:** smoke tests, ciclo de vida, persistência, áudio, toque e desempenho.

### 14.2 Gates obrigatórios para código

Todo prompt de código deverá terminar com:

- `npm run format:check` ou equivalente;
- `npm run lint`;
- `npm run typecheck`;
- `npm run test:run`;
- `npm run build`;
- `git diff --check`;
- relatório de arquivos alterados;
- limitações e testes manuais ainda necessários.

### 14.3 Teste Android

Playwright possui suporte Android experimental, portanto não será a única garantia para o APK. O projeto manterá uma checklist manual em aparelho real e poderá adotar Appium ou testes instrumentados apenas quando o custo se justificar.

---

## 15. Desempenho

### Regras iniciais

- carregar Phaser apenas ao abrir a aba Biblioteca;
- destruir ou suspender a cena corretamente ao sair;
- usar atlas de texturas;
- limitar animações simultâneas;
- evitar filtros e partículas caros em aparelhos modestos;
- usar câmera fixa e uma sala pequena no protótipo;
- não representar cada registro como objeto completo na cena;
- projetar estados de lotação e grupos de lombadas;
- pausar animação e áudio quando o aplicativo perder foco;
- medir no aparelho-alvo, não apenas no desktop;
- não otimizar por superstição antes de medir.

### Metas iniciais

- navegação convencional responsiva sem travamentos perceptíveis;
- biblioteca próxima de 60 FPS no aparelho-alvo, aceitando piso estável de 30 FPS em modo reduzido;
- resposta ao toque em até 100 ms em fluxos comuns;
- abertura funcional offline;
- ausência de crescimento contínuo de memória após entrar e sair da biblioteca repetidamente.

---

## 16. Acessibilidade

A biblioteca visual nunca será a única forma de acessar um dado.

Desde a fundação:

- HTML semântico;
- rótulos reais de formulário;
- áreas de toque adequadas;
- foco visível;
- suporte a teclado no web desktop;
- textos redimensionáveis;
- preferência de redução de movimento;
- controles separados de áudio;
- mensagens equivalentes aos efeitos sonoros importantes;
- alto contraste;
- ausência de informação transmitida apenas por cor;
- alternativa textual para o estado da biblioteca.

Phaser oferece encanto; React garante acesso.

---

## 17. Versionamento e evolução

### Versões sugeridas

- `v0.1.0`: fundação, navegação e APK vazio validado;
- `v0.2.0`: domínio, persistência e CRUD de livros;
- `v0.3.0`: progresso, notas, busca, backup e restauração;
- `v0.4.0`: biblioteca visual conectada aos dados;
- `v0.5.0`: áudio, bibliotecária, criatura e primeiro ciclo emocional;
- `v0.6.0`: marcos, diálogos, acessibilidade e polimento;
- `v0.7.0`: candidato a protótipo público de portfólio, com APK assinado.

A numeração pode ser ajustada, mas cada marco precisa ter gate e registro documental.

---

## 18. Escopo técnico do protótipo

### Incluído

- livros;
- coleção;
- cadastro e edição;
- status e progresso;
- notas e citações simples;
- busca e filtros básicos;
- uma sala;
- uma estante reativa;
- uma bibliotecária;
- uma criatura;
- iluminação simples;
- música ambiente e efeitos;
- primeiro marco de conclusão;
- diálogos contextuais pequenos;
- persistência local;
- backup e restauração;
- PWA básica ou versão web instalável;
- APK Android;
- acessibilidade essencial;
- documentação e testes.

### Fora do protótipo

- conta;
- backend;
- sincronização;
- filmes, séries e estudos;
- anexos;
- download automático de capas;
- editor Markdown avançado;
- múltiplas salas;
- personalização livre de móveis;
- feed social;
- IA;
- notificações complexas;
- loja ou monetização;
- SQLite nativo sem necessidade comprovada.

---

## 19. Critérios para considerar a arquitetura validada

A arquitetura estará validada quando:

- um livro puder ser criado, editado, concluído e restaurado sem depender da cena;
- a biblioteca reagir ao mesmo dado por uma projeção desacoplada;
- React e Phaser puderem ser testados separadamente;
- o aplicativo gerar e instalar um APK;
- dados persistirem após reinício do app, reinício do aparelho e atualização de versão de teste;
- uma migração de banco funcionar sobre dados existentes;
- backup exportado puder restaurar o estado em uma instalação limpa;
- adicionar um novo diálogo ou decoração não exigir alterar regras centrais;
- falha da biblioteca visual não impedir acesso à coleção;
- o código continuar compreensível por inspeção humana, sem depender do Codex para ser decifrado.

---

## 20. Decisão final

A stack originalmente sugerida estava essencialmente correta. As correções necessárias são:

1. **React fica confirmado**, não apenas listado como possibilidade.
2. **Capacitor entra desde o começo**, e não apenas perto da publicação.
3. **Phaser fica estritamente isolado como view visual**.
4. **Dexie é um adaptador inicial, não a arquitetura de persistência**.
5. **backup, migração e teste Android entram antes do polimento**.
6. **áudio recebe um serviço próprio e é tratado como núcleo**.
7. **segurança é incremental e honesta**, sem promessas vazias.
8. **o projeto permanece um modular monolith**, sem microserviços, monorepo ou abstrações decorativas.

O resultado esperado não é uma demonstração descartável. É uma primeira biblioteca pessoal pequena, confiável, encantadora e estruturalmente capaz de crescer.

---

## 21. Referências técnicas consultadas

- Documentação oficial do Capacitor 8: introdução, Android, jogos, armazenamento e segurança;
- documentação oficial do Phaser;
- documentação oficial do React com TypeScript e gerenciamento de estado;
- documentação oficial do Vite;
- documentação oficial do Dexie, incluindo versionamento e transações;
- documentação oficial do Vitest;
- documentação oficial do Playwright para Android WebView;
- Android Developers sobre APK/AAB e assinatura;
- OWASP Mobile Application Security Verification Standard, especialmente armazenamento e autenticação.
