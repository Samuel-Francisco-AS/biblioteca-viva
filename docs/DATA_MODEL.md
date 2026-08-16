# Modelo de dados

> Contrato do domínio e da persistência local implementados no Bloco 3 em 2026-07-29.

## 1. Limites e camadas

- **domínio:** entidades imutáveis, invariantes, transições, erros e eventos puros em `src/domain/`;
- **fronteira:** schemas Zod recebem `unknown`, validam estrutura e tipos e fazem normalização textual segura antes das factories;
- **aplicação:** existe em `src/application/`; orquestra IDs, relógio, repositórios, atividades e publicação dos eventos por portas;
- **persistência:** `src/infrastructure/database/` implementa portas com Dexie/IndexedDB, tipos persistidos explícitos e validação Zod na leitura.

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

No baseline do protótipo, `LibraryEntry` ainda possui somente `BookEntry`. D-049 aprova para P1 a evolução aditiva para uma união discriminada com `BookEntry`, `MovieEntry`, `SeriesEntry`, `StudyEntry`, `PhysicalActivityEntry` e `WorkEntry`. A implementação e o schema continuam em v3 até P1-A concluir sua migração; esta seção não antecipa estado técnico.

Campos comuns aprovados para P1: `id`, `type`, `title`, `status`, `createdAt`, `updatedAt`, `revision`, `startedAt?`, `completedAt?`, `favorite` e `tagIds`. Cada variante mantém campos e progresso próprios; é proibido concentrar páginas, episódios, disciplina, distância e cliente em uma entidade amorfa de opcionais.

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
| `startedAt` | `string` | não | ISO UTC; pode anteceder a criação do registro |
| `completedAt` | `string` | não | obrigatório somente em `completed`; pode anteceder a criação do registro, mas não o início |

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

Atualizar um livro `planned` para `currentPage > 0` inicia a leitura e preenche `startedAt` pelo relógio da aplicação quando ausente. Com total conhecido, chegar a `currentPage === totalPages` em estado compatível reutiliza `completeBook` e conclui automaticamente; a conclusão explícita continua válida. Sem total, o progresso inicia a leitura, mas não conclui automaticamente. Para reduzir o progresso de um concluído, primeiro é necessário reabri-lo como `in_progress`. Pausar ou abandonar preserva progresso.

## 5. Invariantes do livro

- textos são aparados e sequências de whitespace viram um espaço;
- IDs e título não podem ficar vazios após normalização;
- `totalPages`, quando presente, é inteiro maior que zero;
- `currentPage` é inteiro, nunca negativo e não excede o total conhecido;
- avaliação opcional é inteira entre 1 e 5;
- início da leitura pode anteceder a criação do registro no aplicativo;
- conclusão da leitura pode anteceder a criação do registro no aplicativo;
- conclusão não pode anteceder o início da leitura quando ambos existem;
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

Ambas possuem os metadados comuns, começam em revisão 1 e referenciam uma entrada por ID não vazio. A aplicação verifica a existência efetiva do livro; `createQuote` e `updateQuote` recebem o livro como contexto para validar referência e limite de página. Edição preserva `id`, `entryId` e `createdAt`, atualiza `updatedAt` e incrementa `revision`. Não há Markdown avançado, anexos ou formatação rica.

## 7. Factories e operações

- `createBook`;
- `updateBibliographicData`;
- `updateProgress`;
- `changeBookStatus`;
- `completeBook`;
- `createNote`;
- `updateNote`;
- `createQuote`;
- `updateQuote`.

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

Os schemas públicos cobrem criação de livro, atualização bibliográfica, progresso, status e criação/edição de nota e citação. Eles usam objetos estritos, recusam campos inesperados, recebem valores desconhecidos e produzem entradas tipadas. Normalizam somente strings seguras. Relações como página versus total, coerência de conclusão e crescimento de revisão continuam no domínio.

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

Conteúdo, título, autor, texto de nota e texto de citação não são copiados para eventos. `LocalEventBus` é uma implementação em memória, pós-commit e sem persistência; não existe broker ou processamento remoto.

## 10.1 Atividades da aplicação

Atividades possuem `id`, `type`, `aggregateId`, `occurredAt`, `revision` relacionada e metadados mínimos. Os tipos atuais são `book_created`, `book_updated`, `progress_updated`, `status_changed`, `note_added` e `quote_added`.

Os metadados guardam somente status, campos alterados, progresso, transição ou ID da anotação e página opcional. Título, autor, conteúdo de nota e texto de citação são proibidos. Atividade é histórico útil, não event sourcing nem cópia da entidade.

## 11. Decisões abertas

- política e representação de arquivamento serão decididas quando o fluxo entrar no escopo;
- atualização e exclusão de notas/citações ainda não possuem operações;
- IDs persistidos novos são UUIDs produzidos por `crypto.randomUUID` atrás de `IdGenerator`;
- atividades são persistidas, mas retenção e limpeza ainda não foram decididas;
- tags só serão consideradas quando busca/filtros aprovados demonstrarem necessidade.

## 12. Persistência e migrações

O banco estável chama-se `biblioteca-viva`. Os adapters persistem somente dados serializáveis e validam registros lidos antes de devolvê-los à aplicação.

| Tabela | Chave/índices atuais | Finalidade |
|---|---|---|
| `libraryEntries` | `&id`, `createdAt` | livros; listagem técnica por `createdAt` e desempate por `id` |
| `notes` | `&id`, `entryId` | notas vinculadas ao livro |
| `quotes` | `&id`, `entryId` | citações próprias, inclusive página opcional |
| `activities` | `&id`, `aggregateId`, `occurredAt`, `[aggregateId+occurredAt]` | histórico mínimo sem conteúdo pessoal |
| `settings` | `&key` | preferências futuras, sem contrato de produto antecipado |
| `metadata` | `&key` | marcadores técnicos do schema |
| `milestones` | `&id`, `reachedAt` | marcos históricos e recompensas mínimas, monotônicos por ID |

A versão 1 contém as quatro tabelas de dados suficientes para gravar livros e seus efeitos. A versão 2 acrescenta `settings` e `metadata`. A versão 3 acrescenta somente `milestones` e atualiza a marca técnica para `schema-version = 3`, preservando integralmente bancos v1 e v2. As migrações são aditivas, idempotentes na reabertura e possuem testes reais com `fake-indexeddb` para v1 → v3 e v2 → v3.

Entidade/anotação, atividade e eventual marco/recompensa são confirmados na mesma transação. Eventos são publicados somente após o commit. Exclusão de livro não inclui `milestones`: um marco histórico legítimo e sua decoração sobrevivem à remoção posterior do registro de origem. Arquivamento, outbox e política de retenção permanecem abertos e exigirão migrações próprias quando aprovados.

## 13. Marcos históricos

Cada registro preserva `id`, `reachedAt`, `ruleVersion`, `rewards` e `source` com apenas `eventId` e tipo técnico do evento. Não guarda ID obrigatório do livro, título, autor, nota, citação, fala ou outro conteúdo pessoal. A chave primária é o ID estável do marco; `add`, e não `put`, torna a concessão única mesmo sob eventos equivalentes ou concorrentes.

Os quatro IDs atuais são `milestone.first-book`, `milestone.first-note`, `milestone.first-quote` e `milestone.first-completed-book`. Somente a primeira conclusão concede `reward.first-completion-reading-lamp`, que referencia `decoration.reading-lamp`.

“Há atualmente um livro concluído” continua sendo um fato calculado a partir dos livros. “A primeira conclusão já foi alcançada” é histórico persistido. Retomar ou excluir o livro pode tornar o primeiro fato falso sem remover o segundo nem a luminária.

## 14. Backup v2

O envelope estrito atual usa `kind: biblioteca-viva-backup`, `formatVersion: 2`, `createdAt`, `appVersion`, `databaseVersion`, `data`, `metadata.policy: replace` e `integrity` SHA-256. Compatibilidade é governada por `formatVersion`, não por `appVersion`.

`data` contém `libraryEntries`, `notes`, `quotes`, `activities`, `settings` e `milestones`, ordenados por ID ou chave. `metadata` do IndexedDB, inclusive `schema-version`, é técnico e não entra. O checksum cobre o envelope canônico sem `integrity`, após a normalização pela mesma representação JSON gravada no arquivo.

Backups v1 íntegros continuam aceitos e são normalizados com zero marcos: uma instalação limpa não inventa recompensa. Na restauração, as cinco coleções anteriores mantêm política `replace`; marcos usam união monotônica por ID entre destino e arquivo. Essa exceção estreita impede que backup antigo ou incompleto apague desbloqueio legítimo e continua idempotente em restaurações repetidas. Importação não publica `MilestoneReached` e, portanto, não repete áudio, diálogo, notificação ou concessão.

### Preferências de experiência

`experience.preferences.v1` usa a tabela `settings` existente, sem schema v4. O valor estrito contém `motion: system | reduce | normal`, `highContrast: boolean` e `textSize: default | large | larger`. Não contém conteúdo pessoal. Valor ausente ou inválido produz defaults em memória; gravações válidas entram automaticamente no backup v2 e seguem a política `replace` de settings.
