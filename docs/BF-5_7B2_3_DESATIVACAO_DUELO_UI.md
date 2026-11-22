# BF-5.7B2.3 — Desativação da experiência ativa do Duelo Arcano

## Base e branch

- Base: `origin/feat/bf-5-7b2-clean-persistence`
- SHA de base: `8be2c243b04912977f1c1a31b704596ff6af3fb1`
- Branch: `feat/bf-5-7b2-retire-duel-ui`
- Banco preservado: `biblioteca-viva-bf57`
- Alteração local preexistente preservada: `docs/audits/evidence/bf56f-refinement/lua-no-mundo.png`

Esta entrega remove somente a experiência ativa do Duelo Arcano. O motor,
contratos `combat`/`combat_match`, tabelas Dexie, validadores, backup v11 e
assets históricos não foram removidos.

## Entradas retiradas

- Portal e navegação do Arcanário não exibem mais “Duelo Arcano”.
- O botão externo “Arena orbital · Duelo Arcano” foi removido.
- As telas lazy `DuelHall`, `DuelTable`, `DuelDeckEditor`, `DuelRules` e
  `ArenaDuel` deixaram de ser importadas pelo Arcanário.
- Rotas antigas sob `/arcanario/duelos/*` redirecionam com `replace` para
  `/arcanario`, sem montar lógica de combate.
- `?tipo=combat` na Oficina redireciona para o Portal; a opção de criação e o
  import de `CombatEditor` foram removidos.
- Cartas `combat` são filtradas do Acervo e o acesso direto a uma carta de
  combate retorna ao Acervo.
- Baralhos de combate não são exibidos nos Baralhos; acesso direto a um
  baralho de combate retorna à listagem educativa.
- A projeção de contagens do Portal exclui cartas e baralhos de combate.

## Lua orbital e dependências residuais

O identificador `portal:duelo-arcano` foi preservado. A seleção na lua continua
conduzindo ao Portal do Arcanário, conforme os testes de `pages` e `WorldHost`.
Não houve remodelagem, alteração de raycast, câmera, toque ou controles.

Ainda permanecem para o checkpoint estrutural seguinte:

- `src/domain/duel/`
- `src/application/duels.ts`
- schemas e validadores históricos em `src/domain/arcanarium.ts`
- validação e armazenamento de `combat`/`combat_match` no backup e Dexie
- rotas auxiliares, modelos e testes específicos do motor sob `features/duel`
- assets históricos, incluindo a dependência visual provisória da lua

Esses elementos foram deliberadamente preservados nesta etapa.

## Arquivos modificados

- `src/App.tsx`
- `src/app/uiActionProbe.ts`
- `src/app/uiActionProbe.test.ts`
- `src/application/arcanarium.ts`
- `src/features/arcanarium/ArcanaCard.tsx`
- `src/features/arcanarium/ArcanariumPage.tsx`
- `src/features/arcanarium/ArcanariumPage.test.tsx`
- `src/features/arcanarium/Catalogue.tsx`
- `src/features/arcanarium/Decks.tsx`
- `src/features/arcanarium/Workshop.tsx`
- `src/infrastructure/database/arcanariumRepository.ts`
- `src/pages.tsx`
- `docs/BF-5_7B2_3_DESATIVACAO_DUELO_UI.md`

Nenhuma alteração foi feita na `main`, na PR #52, na PR #53 ou na PR #54.

## Testes e validação

### PASS

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Testes dirigidos de Arcanário, navegação, mundo 3D, instrumentação e
  persistência: **6 arquivos, 95 testes PASS**
- O build confirmou que as telas lazy de duelo não fazem mais parte do
  carregamento do Arcanário; o chunk `ArcanariumPage` foi gerado sem essas
  importações.

Os novos testes verificam:

1. Portal sem Duelo Arcano.
2. Redirecionamento de URLs antigas de duelo.
3. Redirecionamento da criação `?tipo=combat`.
4. Ocultação de cartas de combate no Acervo.
5. Retorno seguro de acesso direto a carta de combate.
6. Preservação do portal lunar e do identificador histórico.

### FAIL / ressalvas

- `npm run test:run` global terminou com **189/193 arquivos e 1258/1263
  testes PASS**, com 4 arquivos e 5 testes falhando no lote concorrente:
  - dois testes existentes de `ArcanariumPage.test.tsx` por timeout de
    espera;
  - `PackLibrary.test.tsx` por timeout de espera;
  - dois testes Three.js por timeout de 5 segundos.
- Os testes afetados do Arcanário passaram na execução dirigida acima; as
  falhas não foram reproduzidas como regressão da B2.3.
- O build emitiu o aviso preexistente de chunks acima de 500 kB.

### Não executado

- GitHub Actions/CI, por cota esgotada.
- E2E, Android e validação física no Moto G06.

## Riscos e próximo checkpoint

O acesso direto a URLs antigas depende do redirect do Router e não remove
fisicamente dados ou assets históricos. O motor e os contratos TCG continuam
compiláveis e testáveis para permitir a retirada estrutural posterior.

O próximo checkpoint pode avaliar a remoção definitiva dessas dependências,
mas somente após revisão desta desativação, confirmação da persistência
educativa e decisão explícita sobre assets e formatos históricos.

## Revisão de testes após B2.3 — 12/11/2026

O proprietário autorizou eliminar ou atualizar testes desatualizados no remoto.

- Excluídos `e2e/bf56e-duel.spec.ts` e `e2e/bf56f-arena.spec.ts`, pois verificavam partidas TCG aposentadas. O histórico permanece disponível via Git.
- Atualizado `e2e/bf56f-orbital-refinement.spec.ts`: a lua orbital permanece como acesso ao Arcanário, preservando suspensão/retomada do mundo 3D e verificando que o link de Duelo Arcano não existe.
- Atualizado `e2e/performance-navigation.spec.ts`: percorre apenas as salas ativas e não procura o regulamento do duelo.
- Criado `e2e/bf57b-retired-duel.spec.ts`: verifica o retorno ao Portal para rotas antigas e para `?tipo=combat`; valida a continuidade da Oficina educativa.
- Reforçado `src/features/arcanarium/ArcanariumPage.test.tsx`: confere a URL final dos redirecionamentos, além do conteúdo visível.
- Atualizadas referências IndexedDB em oito arquivos E2E (`e2e/fixtures.ts`, `bf4-rpg`, `bf56a-arcanarium`, `bv-recovery-r2`, `bf56d-packs`, `bf56c-provations`, `search-and-backup`, `bf5-parte2d-entretenimento`) para `biblioteca-viva-bf57`. Eventos e nomes de arquivos não relacionados ficaram intocados.

**Validação desta revisão:** inspeção estática remota; sem nova execução de lint, typecheck, build, Vitest, Playwright, CI ou Android. Os PASS anteriores são do checkpoint original, **antes** destes commits, e precisam ser confirmados localmente antes do merge. Os testes unitários do motor TCG permanecem para revisão na retirada estrutural B2.4. A lua orbital não foi alterada em produção.
