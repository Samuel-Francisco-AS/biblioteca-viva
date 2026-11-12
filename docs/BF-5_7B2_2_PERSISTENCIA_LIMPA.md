# BF-5.7B2.2 — Persistência limpa

## Base e escopo

- Base: `origin/main` em `9abf0c0b058686ff6233525213574095d9ee07cf`.
- Branch: `feat/bf-5-7b2-clean-persistence`.
- A única alteração local preexistente, em
  `docs/audits/evidence/bf56f-refinement/lua-no-mundo.png`, foi preservada e
  não faz parte desta entrega.
- Não houve merge, alteração nas branches #52/#53, remoção de interface,
  motor, arena, assets, schema ou formato de backup.

## Mapa dos armazenamentos

| Armazenamento | Uso | Identidade na B2.2 |
| --- | --- | --- |
| IndexedDB/Dexie | registros educacionais, biblioteca, atividades, preferências, Arcanário, continuidade e pacotes | novo banco `biblioteca-viva-bf57` |
| IndexedDB antigo | dados da geração anterior | `biblioteca-viva`, não é aberto nem importado pelo bootstrap padrão |
| `localStorage` | rascunhos privados da Oficina | chave inclui o nome do banco; a nova identidade cria namespace separado |
| `navigator.storage` | somente consulta/solicitação de persistência do navegador | não contém registros da aplicação |
| Arquivos externos/Cache Android | exportação, compartilhamento e arquivos temporários | fora do banco; temporários seguem limpeza do fluxo de entrega |

O bootstrap continua em `createApplication()`: instancia
`BibliotecaDatabase`, abre o banco, grava o marcador da versão atual e compõe
os serviços. As migrações Dexie históricas não foram alteradas.

## Alternativas avaliadas

**A — nova identidade do banco.** Uma identidade estável para a nova geração
isola os dados antigos sem operação destrutiva, funciona offline, é simples de
testar e não repete o corte em cada abertura. O banco antigo permanece
fisicamente disponível até uma limpeza explícita futura.

**B — reset versionado.** Exigiria uma migração destrutiva, marcador adicional,
tratamento de falhas no meio da limpeza e maior risco de apagar dados novamente
em cenários de inicialização interrompida. Também misturaria o corte de produto
com a evolução do schema.

## Estratégia escolhida

Foi escolhida a **Alternativa A**. `DATABASE_NAME` passou de
`biblioteca-viva` para `biblioteca-viva-bf57`; a versão Dexie permanece 19 e o
formato de backup permanece v11. Não existe `clear()`, `delete()` ou reset no
bootstrap. Assim, a abertura repetida e as atualizações comuns reutilizam
somente a nova identidade, enquanto falhas de inicialização não têm caminho
destrutivo para repetir.

Em instalações existentes, o aplicativo começa vazio na nova identidade e não
importa o IndexedDB antigo nem seus rascunhos. O armazenamento antigo e chaves
antigas de `localStorage` podem permanecer fisicamente; esta missão não afirma
que foram apagados. Em instalações novas, somente a identidade nova é criada.

## Arquivos modificados

- `src/infrastructure/database/schema.ts`: nova identidade estável do banco.
- `src/app/createApplication.test.ts`: isolamento do banco antigo, persistência
  após fechamento e reabertura repetida.
- `src/infrastructure/files/workshopDrafts.test.ts`: isolamento dos namespaces
  de rascunhos no `localStorage`.
- `docs/BF-5_7B2_2_PERSISTENCIA_LIMPA.md`: este registro.

## Testes dirigidos

- Instalação/corte limpo: banco antigo sem importação, banco novo vazio,
  registro novo preservado após duas reaberturas.
- Rascunhos antigos e novos: namespaces separados pela identidade.
- Persistência, coexistência educacional, atividades e backup atual continuam
  cobertos pela suíte existente de `createApplication`, `database`,
  `backup`, `arcanarium` e `workouts`.

## Validação

### PASS

- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run build` — PASS, com o aviso preexistente de chunks acima de 500 kB.
- `npm run test:run -- src/app/createApplication.test.ts
  src/infrastructure/files/workshopDrafts.test.ts
  src/infrastructure/database/database.test.ts
  src/infrastructure/backup/backup.test.ts` — 4 arquivos, 55 testes PASS.
- `npm run test:run -- src/features/arcanarium/ArcanariumPage.test.tsx` —
  11 testes PASS.
- `npm run test:run -- src/features/library/three/inhabitantPickupContact.test.ts
  src/features/library/libraryRecordLayout.test.ts
  src/features/sessions/SessionPanel.test.tsx` — 3 arquivos, 13 testes PASS.
- `npm run format:check` nos arquivos modificados — PASS.
- `git diff --check` — PASS.

### FAIL

- `npm run test:run` global — 189/193 arquivos e 1254/1260 testes PASS.
  Quatro arquivos e seis testes falharam apenas sob a execução global
  concorrente, por timeouts/expectativa transitória em UI e Three.js. Os mesmos
  testes afetados passaram quando executados isoladamente; nenhuma falha
  reproduzida envolveu os arquivos da B2.2.

### Não executado

- GitHub Actions, por cota esgotada.
- E2E e validação Android/Moto G06.

## Riscos, limitações e B2.3

O corte troca a identidade lógica, mas não libera automaticamente espaço físico
nem remove IndexedDB, `localStorage`, backups exportados ou caches antigos.
Backups v11 e contratos do TCG continuam presentes nesta etapa por restrição de
escopo; a B2.3 deverá avaliar a retirada da experiência ativa sem introduzir
um reset concorrente.

Antes da B2.3, revisar a decisão sobre limpeza física opcional, confirmar o
namespace de produção e preservar a persistência educacional, offline e de
backup da nova geração.
