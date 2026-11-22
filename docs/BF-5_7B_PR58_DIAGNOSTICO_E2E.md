# BF-5.7B / PR #58 — diagnóstico das falhas E2E

## Contexto

- Pull Request: [#58](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/58)
- Branch de origem: `feat/bf-5-7b2-final-cleanup`
- Branch de destino: `main`
- Base remota no diagnóstico: `7ae058a15ed39ffeb34441cb9a8f13c13528a1db`
- Merge commit de sincronização: `c05474b2603231957254bc71ed9f1c799983b48b`
- Commit de consolidação da branch: `06410d9eb0ca66650385b8efee49d6a03341499a`
- Execução CI analisada: `44973107292`

A integração já havia concluído a remoção produtiva do TCG/Duelo Arcano,
retirado a arena e os contratos exclusivos de combate e preservado o fluxo
educacional do Arcanário. Os dois stashes locais permanecem intactos e não
foram aplicados durante a investigação.

## Gate funcional do proprietário

O proprietário realizou validação física no Moto G06 com o APK de BF-5.7B.
Aprovou os resultados funcionais de:

- entrada e saída da órbita lunar;
- reentrada pelo Canvas;
- reentrada pelo controle acessível;
- navegação do Arcanário;
- flashcards e questões;
- persistência dos dados.

Foram registrados travamentos de transição e fluidez geral insatisfatória como
dívida técnica. Não houve métricas de FPS, latência, P95/P99, memória, térmica
ou TalkBack nesta validação.

## Resumo da CI

A execução `44973107292` passou no gate estático, unitário e de build:

- `format:check`: PASS;
- `lint`: PASS;
- `typecheck`: PASS;
- Vitest: PASS;
- `audio:check`: PASS;
- build: PASS;
- `performance:report`: PASS.

Os dois shards E2E falharam:

| Shard | Falhas | Evidência principal                                                        |
| ----- | -----: | -------------------------------------------------------------------------- |
| 1/2   |     21 | Timeouts 30 s, waits 10 s e elementos não encontrados em fluxos 3D/legados |
| 2/2   |     15 | Timeouts 30 s, seletores ausentes e canvas/rota não estabilizados          |
| Total |     36 | Nenhuma falha específica de BF-5.7B apareceu nos logs                      |

## Falhas do shard 1/2

### Mundo 3D, habitantes e residência

**Testes:** 13 cenários em `e2e/bf4-environment.spec.ts`,
`e2e/bf4-inhabitants.spec.ts`, `e2e/bf4-living.spec.ts` e
`e2e/bf4-rpg.spec.ts`.

Mensagens recorrentes:

- `Test timeout of 30000ms exceeded`;
- `locator.click` aguardando elementos até o timeout;
- `mouse.click` aguardando o canvas;
- `Target page, context or browser has been closed`.

Classificação: **teste legado incompatível/instável — inconclusivo quanto a
regressão atual**. Esses cenários exercitam arquitetura BF-4/BF-5 anterior,
com Canvas residente, habitantes, quatro modelos, RPG e ações narrativas.
Não há falha específica de BF-5.7B nestes logs e a suíte não possui evidência
de que a retirada do TCG alterou esses caminhos.

### Interface BF-5.5/BF-5 anterior

**Testes:** `e2e/bf5-parte2e-controles-capas.spec.ts`,
`e2e/bf5-parte2f-empreitadas-atlas.spec.ts`,
`e2e/bf5-ritual.spec.ts`, `e2e/bf5-rpg-hud.spec.ts` e
`e2e/bf55g-refinement.spec.ts`.

Mensagens observadas:

- strict mode com dois elementos para `getByLabel("Duração do foco")`;
- dois `role=status` concorrentes;
- elemento não encontrado e timeout de 10 s/30 s;
- canvas de residência não estabilizado.

Classificação: **causa inconclusiva / instabilidade legada**. Dois casos têm
ambiguidade real de seletor DOM, mas não foram causados pela alteração da
PR #58 e não comprometem o fluxo educativo aprovado pelo proprietário.

### Workshop/Canvas residente BF-5.6

**Teste:** `e2e/bf56b-workshop.spec.ts:24`.

Erro local reproduzido:

- timeout de 30 s em `getByRole("link", { name: "Coleção", exact: true })`;
- o link aparece no snapshot da página, mas o clique não conclui dentro do
  prazo.

Classificação: **instabilidade de ambiente / falha não reproduzida como
regressão BF-57B**. O teste chega ao mundo residente e o timeout ocorre em uma
transição para `/colecao`. A implementação atual mantém residência e
reentrada por contratos separados cobertos pelos testes BF-57B. Não há
evidência de perda funcional no gate Moto G06.

## Falhas do shard 2/2

### Rotina de residência, recuperação e shell

**Testes:** `e2e/bf5r5-experience.spec.ts`,
`e2e/bf5r5-world-input.spec.ts`, `e2e/bv-recovery-r2.spec.ts`,
`e2e/r4-shell.spec.ts` e `e2e/reading-area.spec.ts`.

Mensagens recorrentes:

- timeout em clique ou espera de elemento;
- Canvas não ocultado/visível dentro da expectativa;
- seleção React não encontrada;
- rota 3D não acumulou canvas/loop conforme esperado;
- elementos de leitura ou área convencional não encontrados.

Classificação: **teste legado incompatível/instabilidade de ambiente**.
Esses cenários pertencem às fases BF-5R5/R4 e à recuperação de leitura.
Não existe evidência nos logs de que a remoção do TCG ou o saneamento de
BF-5.7B alterou diretamente esses contratos.

### Memória e leitura histórica

**Testes:** `e2e/p1-memory.spec.ts`,
`e2e/post-r4-reading.spec.ts`.

Mensagens observadas:

- timeout em clique;
- elemento de timer não encontrado;
- assertivas que dependem de estado/tempo durante transições.

Classificação: **falha não reproduzida como regressão comprovada**. Os testes
dependem de relógios, sessões e transições históricas. Vitest e os testes
BF-57B dirigidos não demonstraram regressão equivalente na persistência.

## Evidências locais

Execução dirigida BF-5.7B:

- 12/12 testes passaram, incluindo:
  - reentrada lunar pelo Canvas;
  - reentrada lunar pelo controle acessível;
  - redirecionamento de rotas aposentadas;
  - Choices em retrato/paisagem;
  - persistência educativa offline aquecida.

Execução representativa legada `bf56b-workshop.spec.ts:24`:

- reproduziu timeout local de 30 s no clique do link Coleção;
- o elemento foi localizado, mas o clique não concluiu;
- o teste foi localizado como cenário histórico de residência BF-56,
  não como teste BF-57B.

Vitest completo local:

- 1218/1221 PASS;
- dois testes do Arcanário e um teste físico de leitura falharam sob carga;
- os três foram reexecutados isoladamente e passaram 14/14.

Validações estáticas:

- `format:check`: PASS;
- ESLint: PASS;
- Typecheck: PASS;
- build: PASS;
- chunk Three.js acima de 500 kB permanece aviso conhecido.

## Correções realizadas

Esta investigação não encontrou uma regressão crítica da PR #58.
Nenhum teste foi desabilitado, removido ou convertido em sucesso artificial.

Correções já incorporadas antes deste diagnóstico:

- documentar estado vigente e gate Moto G06;
- corrigir pausa/layout da residência no `WorldHost`;
- corrigir E2E lunar Canvas para gestos reais;
- corrigir timeout headroom proporcional a SwiftShader;
- formatar o conjunto conhecido de 25 arquivos reportado pelo CI.

## Falhas que permanecem

As 36 falhas E2E correspondem a testes históricos/legados de mundo 3D,
residência, leitura, RPG, controles antigos e reprodução de UI.
Elas não possuem evidência de regressão crítica na BF-5.7B.

Dívidas preservadas:

- travamentos em transições e animações;
- fluidez geral insatisfatória no Moto G06;
- testes E2E 3D amplos com deadlines antigos;
- TalkBack, P95/P99, térmica e memória não certificados;
- nenhum novo benchmark ou métrica física foi inventado.

## Conclusão

Os shards falharam em 36 cenários legados e instáveis do mundo 3D, controles
anteriores e lifecycle amplo. Os testes específicos da BF-5.7B passaram
localmente e no gate físico. Não foi comprovada uma regressão crítica causada
pela integração da PR #58.

Por decisão explícita do proprietário, a integração pode prosseguir com estas
falhas documentadas. O risco residual é limitado à dívida técnica conhecida de
fluidez e à cobertura histórica E2E, não à retirada do TCG ou à persistência
educativa aprovada no dispositivo.
