# Modelo de dados

> Documento conceitual. Tipos reais devem permanecer alinhados a ele e qualquer divergência precisa ser registrada.

## 1. Princípios

- o domínio usa `LibraryEntry`, nunca `Record` como entidade central;
- o protótipo implementa somente `BookEntry`;
- tipos futuros usam união discriminada, não uma entidade com dezenas de opcionais;
- datas persistentes usam ISO 8601 em UTC;
- IDs são estáveis e gerados por uma porta;
- validação em runtime acontece nas fronteiras;
- banco, backup e eventos possuem versões explícitas;
- migrações preservam dados e são testadas.

## 2. Metadados comuns

```ts
interface EntityMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  deletedAt?: string;
}
```

Regras:

- `revision` começa em 1 e aumenta em cada atualização persistida;
- `updatedAt` não pode ser anterior a `createdAt`;
- exclusão lógica só será usada quando houver necessidade real de histórico ou sincronização;
- `schemaVersion` pertence ao envelope de backup e ao schema do banco, não a todo objeto por hábito.

## 3. Livro

```ts
type EntryStatus =
  | 'planned'
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned'
  | 'archived';

interface BookEntry extends EntityMetadata {
  type: 'book';
  title: string;
  author?: string;
  status: EntryStatus;
  totalPages?: number;
  currentPage: number;
  rating?: number;
  startedAt?: string;
  completedAt?: string;
  tags: string[];
}
```

### Invariantes

- título normalizado e não vazio;
- total de páginas, quando presente, é inteiro positivo;
- página atual é inteiro maior ou igual a zero;
- página atual não excede total conhecido;
- avaliação, quando presente, usa a faixa aprovada pela interface e pelo domínio;
- `completedAt` só existe em estado concluído;
- concluir com total conhecido ajusta progresso de maneira coerente;
- abandonar ou pausar não apaga progresso;
- reabrir conclusão preserva histórico por atividade.

## 4. Progresso

O progresso é calculado pelo domínio:

- total conhecido: `currentPage / totalPages` limitado entre 0 e 1;
- total desconhecido: sem porcentagem fabricada;
- conclusão manual é possível quando o total é desconhecido;
- zero páginas não significa necessariamente “não iniciado” se o status foi definido explicitamente.

## 5. Nota e citação

```ts
type AnnotationKind = 'note' | 'quote';

interface Annotation extends EntityMetadata {
  entryId: string;
  kind: AnnotationKind;
  content: string;
  location?: string;
  page?: number;
  favorite: boolean;
  tags: string[];
}
```

Regras:

- conteúdo não vazio após normalização;
- `entryId` precisa existir;
- página, quando presente, é positiva e não excede total conhecido;
- citações e notas são texto simples no protótipo;
- renderização HTML não recebe conteúdo cru.

## 6. Atividade

Atividade preserva histórico útil sem event sourcing completo.

```ts
type ActivityType =
  | 'entry_created'
  | 'entry_updated'
  | 'progress_updated'
  | 'entry_completed'
  | 'annotation_created'
  | 'milestone_reached';
```

Cada atividade contém ID, tipo, referência da entidade, horário e payload mínimo validado. Não duplicar conteúdo pessoal inteiro no payload.

## 7. Marcos e recompensas

```ts
interface MilestoneDefinition {
  id: string;
  event: string;
  conditions: MilestoneCondition[];
  rewards: RewardDefinition[];
  once: boolean;
  contentVersion: number;
}
```

O estado alcançado guarda:

- ID da definição;
- data;
- versão da definição;
- recompensas aplicadas;
- identificador do evento causador quando necessário.

Reaplicar o mesmo evento não pode duplicar recompensa única.

## 8. Preferências

Preferências iniciais:

- volume geral;
- volume de música;
- volume de efeitos;
- mute;
- redução de movimento;
- efeitos reduzidos;
- modo de contraste, se implementado;
- orientação ou comportamento visual aprovado;
- versão das preferências.

Preferências não são segredos.

## 9. Projeção da biblioteca

`LibraryViewModel` é derivado, não fonte de verdade. Campos iniciais:

- total de livros;
- em andamento;
- concluídos;
- estado de lotação da estante;
- livro recentemente atualizado;
- primeiro marco alcançado;
- estado visual da sala;
- conteúdo textual equivalente.

Não persistir a projeção se ela puder ser recalculada de forma barata e determinística.

## 10. Banco conceitual

Tabelas iniciais esperadas:

- `libraryEntries`;
- `annotations`;
- `activities`;
- `milestoneStates`;
- `preferences`;
- `metadata` para versão e migração quando necessário.

Índices devem surgir de consultas reais: status, tipo, atualizado em, título normalizado, `entryId` e tipo de anotação. Não criar índice sem consulta correspondente.

## 11. Backup

```ts
interface BackupEnvelope {
  format: 'biblioteca-viva-backup';
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  checksum?: string;
  data: {
    libraryEntries: unknown[];
    annotations: unknown[];
    activities: unknown[];
    milestoneStates: unknown[];
    preferences: unknown[];
  };
}
```

A restauração deve:

1. validar envelope e versão;
2. migrar quando suportado;
3. apresentar resumo antes de substituir dados;
4. executar de modo transacional;
5. preservar backup anterior quando possível;
6. rejeitar conteúdo inválido sem corromper estado existente.

## 12. Migrações

Toda mudança de schema exige:

- versão nova;
- função de migração determinística;
- fixture da versão anterior;
- teste de upgrade;
- teste de falha e rollback quando aplicável;
- registro em `DECISIONS.md` quando alterar contrato relevante;
- atualização do formato de backup, se necessário.

Migrações não devem depender de React ou Phaser.
