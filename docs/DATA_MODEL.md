# Modelo de dados

> Contrato do domínio implementado no Prompt 4 em 2026-07-29. Persistência continua fora deste documento até os Prompts 5 e 6.

## 1. Limites e camadas

- **domínio:** entidades imutáveis, invariantes, transições, erros e eventos puros em `src/domain/`;
- **fronteira:** schemas Zod recebem `unknown`, validam estrutura e tipos e fazem normalização textual segura antes das factories;
- **aplicação:** existe em `src/application/`; orquestra IDs, relógio, repositórios, atividades e publicação dos eventos por portas;
- **persistência:** ainda não existe; Dexie, schemas de banco e migrações pertencem ao Prompt 6.

O domínio não confia nos schemas: toda factory e operação protege novamente as invariantes relacionais. Ele não importa React, DOM, Phaser, Capacitor ou Dexie.

## 2. Metadados comuns

`EntityMetadata` é uma interface simples, sem classe-base:

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `string` | estável, normalizado e não vazio |
| `createdAt` | `string` | ISO 8601 UTC canônico |
| `updatedAt` | `string` | ISO 8601 UTC; nunca anterior a `createdAt` nem à atualização anterior |
| `revision` | `number` | inteiro positivo; começa em 1 e cresce uma unidade por alteração |

Operações recebem IDs e datas explicitamente. Elas não usam relógio ou gerador oculto. `id` e `createdAt` não fazem parte das entradas de atualização e são preservados.

## 3. LibraryEntry e BookEntry

`LibraryEntry` é uma união discriminada cujo único membro atual é `BookEntry`. Apenas `type: "book"` é aceito; filmes, séries e estudos permanecem fora do protótipo.

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| metadados comuns | `EntityMetadata` | sim | conforme seção 2 |
| `type` | `"book"` | sim | discriminante imutável |
| `title` | `string` | sim | texto normalizado e não vazio |
| `author` | `string` | não | texto normalizado; vazio vira ausente |
| `status` | `EntryStatus` | sim | padrão `planned` |
| `totalPages` | `number` | não | inteiro positivo |
| `currentPage` | `number` | sim | inteiro não negativo; padrão 0 |
| `rating` | `number` | não | inteiro de 1 a 5, inclusive |
| `startedAt` | `string` | não | ISO UTC, não anterior à criação |
| `completedAt` | `string` | não | obrigatório somente em `completed`; não anterior à criação nem ao início |

O modelo mínimo não inclui `tags`, `favorite`, `location`, `deletedAt` ou campos de capa. Eles não são necessários ao Prompt 4 e só poderão entrar quando um fluxo aprovado justificar seu contrato.

## 4. EntryStatus e transições

Estados implementados:

- `planned`: leitura planejada, ainda não iniciada;
- `in_progress`: leitura em andamento;
- `paused`: leitura iniciada e temporariamente pausada;
- `completed`: leitura concluída de forma explícita;
- `abandoned`: leitura interrompida sem apagar o progresso alcançado.

`not_started` foi consolidado em `planned`, evitando dois estados com a mesma semântica atual. `archived` não é status de leitura e será decidido junto ao fluxo de arquivamento.

Transições permitidas:

| Origem | Destinos |
|---|---|
| `planned` | `in_progress`, `abandoned` |
| `in_progress` | `paused`, `completed`, `abandoned` |
| `paused` | `in_progress`, `completed`, `abandoned` |
| `completed` | `in_progress` |
| `abandoned` | `in_progress` |

Aplicar novamente o mesmo status por `changeBookStatus` é inválido. `completeBook` é a exceção idempotente: se o livro já estiver concluído, retorna o mesmo valor e não aumenta a revisão.

Chegar a `currentPage === totalPages` **não conclui automaticamente**. A conclusão é uma intenção explícita. Com total conhecido, `completeBook` ajusta `currentPage` ao total; sem total, preserva a página atual e permite conclusão manual. Para reduzir o progresso de um concluído, primeiro é necessário reabri-lo como `in_progress`. Pausar ou abandonar preserva progresso.

## 5. Invariantes do livro

- textos são aparados e sequências de whitespace viram um espaço;
- IDs e título não podem ficar vazios após normalização;
- `totalPages`, quando presente, é inteiro maior que zero;
- `currentPage` é inteiro, nunca negativo e não excede o total conhecido;
- avaliação opcional é inteira entre 1 e 5;
- livro concluído com total conhecido está exatamente na última página;
- `completedAt` existe somente em livro concluído;
- todas as datas usam ISO 8601 UTC canônico, por exemplo `2026-07-29T10:00:00.000Z`;
- revisões são inteiras positivas e crescentes;
- operações retornam novos objetos congelados, sem alterar a entrada; conclusão repetida retorna a mesma referência;
- `type`, `id` e `createdAt` não podem ser trocados por operações de atualização.

## 6. Note e Quote

As duas entidades são pequenas e distintas, em texto simples:

| Entidade | Campos próprios | Regras adicionais |
|---|---|---|
| `Note` | `entryId`, `content` | conteúdo normalizado e não vazio |
| `Quote` | `entryId`, `content`, `page?` | página inteira positiva e, quando o livro é fornecido à operação, não superior a `totalPages` |

Ambas possuem os metadados comuns, começam em revisão 1 e referenciam uma entrada por ID não vazio. A existência efetiva do livro será verificada pela aplicação/repositório no Prompt 5; `createQuote` já aceita o livro como contexto para validar referência e limite de página. Não há Markdown avançado, anexos ou formatação rica.

## 7. Factories e operações

- `createBook`;
- `updateBibliographicData`;
- `updateProgress`;
- `changeBookStatus`;
- `completeBook`;
- `createNote`;
- `createQuote`.

As operações bibliográficas permitem remover `totalPages` e `rating` por `null` explícito. Datas e IDs são fornecidos pelo chamador; relógio e geração de IDs serão portas de aplicação futuras.

Exemplo mínimo:

```ts
const book = createBook({
  id: "book-1",
  title: "  A   ilha  ",
  createdAt: "2026-07-29T10:00:00.000Z",
});
// title: "A ilha", status: "planned", currentPage: 0, revision: 1
```

## 8. Erros de domínio

`DomainError` possui `code`, `field` opcional e mensagem específica. Especializações atuais:

- `InvalidFieldError` / `INVALID_FIELD`;
- `InvalidProgressError` / `INVALID_PROGRESS`;
- `InvalidStatusTransitionError` / `INVALID_STATUS_TRANSITION`;
- `InvalidDateError` / `INVALID_DATE`;
- `InvalidRevisionError` / `INVALID_REVISION`.

Isso permite que a futura aplicação traduza falhas sem comparar mensagens genéricas.

## 9. Schemas de fronteira

Os schemas públicos cobrem criação de livro, atualização bibliográfica, progresso, status, nota e citação. Eles usam objetos estritos, recusam campos inesperados, recebem valores desconhecidos e produzem entradas tipadas. Normalizam somente strings seguras. Relações como página versus total, coerência de conclusão e crescimento de revisão continuam no domínio.

Zod não é usado para modelar entidades internas nem substitui factories.

## 10. Eventos iniciais

Todo evento contém `type` estável, `eventId`, `aggregateId`, `occurredAt` em ISO UTC, `revision` da entidade e payload mínimo:

| Evento | Payload |
|---|---|
| `LibraryEntryCreated` | tipo da entrada e status |
| `LibraryEntryUpdated` | nomes dos campos alterados |
| `ProgressUpdated` | página atual e total opcional |
| `LibraryEntryCompleted` | data de conclusão |
| `NoteCreated` | ID da nota |
| `QuoteCreated` | ID da citação e página opcional |

Conteúdo, título, autor, texto de nota e texto de citação não são copiados para eventos. A aplicação agora possui a porta `ApplicationEventBus`, mas não existe implementação concreta, armazenamento ou processamento de eventos.

## 10.1 Atividades da aplicação

Atividades possuem `id`, `type`, `aggregateId`, `occurredAt`, `revision` relacionada e metadados mínimos. Os tipos atuais são `book_created`, `book_updated`, `progress_updated`, `status_changed`, `note_added` e `quote_added`.

Os metadados guardam somente status, campos alterados, progresso, transição ou ID da anotação e página opcional. Título, autor, conteúdo de nota e texto de citação são proibidos. Atividade é histórico útil, não event sourcing nem cópia da entidade.

## 11. Decisões abertas

- política e representação de arquivamento serão decididas quando o fluxo entrar no escopo;
- atualização e exclusão de notas/citações ainda não possuem operações;
- IDs são strings estáveis fornecidas por `IdGenerator`; formato e implementação concreta entram no Prompt 6;
- atividades possuem contrato na aplicação; persistência e schema do banco entram no Prompt 6;
- tags só serão consideradas quando busca/filtros aprovados demonstrarem necessidade.

## 12. Persistência e migrações futuras

O banco conceitual continua previsto com entradas, anotações, atividades, preferências e metadados. O schema real, índices, exclusão e migrações não existem ainda e não devem ser inferidos destes tipos. Mudanças futuras de schema exigirão versão, migração determinística, fixture e teste de upgrade.
