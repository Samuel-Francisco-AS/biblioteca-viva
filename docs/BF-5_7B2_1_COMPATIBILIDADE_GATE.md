# BF-5.7B2.1 — Gate de compatibilidade do Arcanário

**Escopo:** travas de compatibilidade para a futura descontinuação do Duelo
Arcano. Esta entrega altera somente testes e documentação; não altera produção,
schema Dexie, formato de backup ou os validadores históricos.

## Baseline

- Branch de implementação: `feat/bf-5-7b2-compat-tests`.
- Base: `origin/main` em `9abf0c0b058686ff6233525213574095d9ee07cf`.
- Estado de referência: Dexie v19 e backup v11, com leitura de v6 a v10.
- Baseline dirigido antes das alterações: 4 arquivos, 29 testes, todos PASS.
- A árvore já continha uma alteração não relacionada em
  `docs/audits/evidence/bf56f-refinement/lua-no-mundo.png`; ela foi preservada.

## Arquivos modificados

- `src/infrastructure/database/duels.test.ts`: dois testes sintéticos de
  compatibilidade F2 e F3.
- `docs/BF-5_7B2_1_COMPATIBILIDADE_GATE.md`: este registro.

Não houve alteração em código produtivo nem na `main`.

## Cenários cobertos

- **F2 — conteúdo autoral legado:** cria cartas `combat`, baralho e
  `combat_match` pelo serviço real; cria uma nova revisão; fecha/reabre o banco;
  exporta e inspeciona backup v11; restaura em banco isolado; confirma cartas,
  revisões, baralho, sessão, referências congeladas e replay.
- **F3 — conteúdo oficial legado:** cria catálogo e sessão oficial pelo serviço
  real; confirma que cartas referenciadas sobrevivem à política de
  `privateArcanarium()`, que cartas oficiais não referenciadas e baralhos
  iniciais não são copiados, e que a restauração valida a sessão sem
  resemeadura ou nova partida.
- **F0/F1/F4/F5 já cobertos:** F0/F1 em
  `src/infrastructure/database/arcanarium.test.ts` (incluindo o round-trip v7);
  F4 em `src/infrastructure/database/migrationV11.test.ts` e nos testes de
  v6–v10 de `src/infrastructure/database/duels.test.ts`; F5 em
  `src/infrastructure/backup/backup.test.ts` e
  `src/infrastructure/backup/r4Integrity.test.ts`.

## Validação

### PASS

- Baseline:
  `npm run test:run -- src/infrastructure/database/duels.test.ts src/infrastructure/backup/backup.test.ts src/infrastructure/backup/r4Integrity.test.ts src/domain/arcanarium.test.ts`
  — 4 arquivos, 29 testes.
- Testes novos/dirigidos:
  `npm run test:run -- src/infrastructure/database/duels.test.ts`
  — 1 arquivo, 10 testes.
- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm run build` — PASS, com apenas o aviso preexistente de chunks acima de
  500 kB.

### FAIL

- Nenhum teste desta missão falhou após a correção da fixture.

### Ainda não executados

- CI do GitHub Actions, E2E e validação Android/Moto G06.

## Riscos e pendências

O gate comprova preservação sintética nos caminhos exercitados, não certifica
dados reais do dispositivo, desempenho, acessibilidade ou restauração em
hardware. A política de retenção oficial continua dependente de manter
`privateArcanarium()`, `cardSessionSchema`, `validateArcanarium()` e a validação
de replay.

**B2.2 permanece bloqueada até revisão/aceite deste gate.** Esta entrega não
inicia a remoção da interface, assets, rotas ou runtime do Duelo Arcano.
