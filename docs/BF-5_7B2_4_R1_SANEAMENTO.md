# BF-5.7B2.4-R1 — saneamento técnico

## Identidade e limites

SHA inicial: `3226a06a792777e74a78eaa0dc56d35650607007`.
Branch: `feat/bf-5-7b2-remove-tcg-engine`; [PR draft #56](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56).
SHA final do reparo técnico: `f9ae8243d9b904014974ac89a05efb4cad26359b`.
O commit documental posterior publica este relatório; seu SHA completo está
registrado no comentário de encerramento da PR.
Fetch e consulta da revisão remota confirmaram a base solicitada. A alteração
preexistente de `lua-no-mundo.png` foi preservada e excluída dos commits;
SHA-256 local `16dc95bd6a9fceb84fa872849677bd154575aa9e3f20816181d648121c1f1dba`.
Sem merge, Actions, alteração de main, APK ou início de B2.5.

## Persistência intermediária

Risco confirmado por regressão: inserir registros combat válidos na v19,
fechar/reabrir e chamar `DexieArcanariumRepository.read()` gera erro de schema.
Não é necessário restaurar o motor nem mudar a identidade/schema do banco.

`retireCombatData.ts`, chamado após open no bootstrap, executa uma transação
abrangendo os stores e um marcador `arcanarium.retired-combat.v1`. Exclui
cartas combat, suas revisões, decks combat, links dependentes e sessões
combat_match. Coleções educativas conservam identidade e referências
sobreviventes; critérios dinâmicos perdem somente o tipo combat. Valida schema
e integridade cruzada antes de gravar o marcador. Falha adicional reverte tudo,
inclusive exclusões e marcador: não há catch que aceite dados quebrados.

Perda intencional: somente dados de teste TCG aposentados e suas referências.
Sessões educativas mistas com referências inválidas não são truncadas, pois
isso poderia deslocar respostas: são bloqueadas pela validação, com rollback.
Esse caso exige recuperação específica se encontrado, nunca reset geral.
Nenhum dado real foi acessado ou limpo nesta revisão.

Casos sintéticos de `retireCombatData.test.ts`: A instalação limpa; B v19 com
TCG; C coexistência TCG/flashcard educativo; D exclusivamente educativo;
rollback por revisão educativa ausente; coleção educativa com referência TCG.
Todos fecham e reabrem o IndexedDB. Os casos A–D repetem a inicialização para
verificar idempotência, identidade e versão 19.

## Backup

Fixture `src/test/fixtures/backup-v11-tcg.json`: produzida pelo codec histórico
no commit `02c9251`, usando archive isolado, exportada e inspecionada com
sucesso pelo código anterior. Catálogo sintético copiado para ownership local
(o exportador omite itens oficiais), revisões completas, decks e sessão
combat_match. O teste atual recalcula e compara SHA-256 ao digest original,
exige INVALID_BACKUP_DATA com mensagem Duelo Arcano, compara destino ocupado
antes/depois e após reabertura. Não há restauração parcial.

Teste positivo v11 educativo assinado continua aceito. O round-trip educativo
v12 existente foi ampliado com questão autoral, preservando flashcards,
baralhos, versões, respostas, tags, tombstones e sessões. Compara snapshot,
restaura em base vazia/ocupada, exige decisão de substituição e entrega do
backup de segurança. Testes existentes de adulteração/checksum permanecem.
Não houve relaxamento de validação nem mudança do codec.

## Lua, lifecycle e investigação E2E

Inspeção: `orbitalArena.ts` carrega o WebP educativo e mantém update orbital.
O asset existe em `public/assets/arcanarium/` e no build distribuído.
`WorldHost` mantém runtime residente, usa pause/resume no efeito de active e
pausa se a inicialização termina fora da Biblioteca. O runtime evita ativação
se já running, cancela checkpoint ao retomar e interrompe loop ao pausar.
A textura tem carregamento próprio: ready da fixture não certifica conclusão
de textura. Não foi introduzido segundo Canvas ou novo loop nesta revisão.
Seleção conserva identificador histórico e destino `/arcanario`.

Ordem da passagem inspecionada: cobertura opaca → callback agendado → commit
da localização → readiness da tela/dados → revelação. A inspeção estática não
certifica ausência de corrida ou bloqueio em aparelho real.

Reprodução inicial sem ajustes: **8/10 PASS**, não 7/10. Os sete casos de
`bf57b-retired-duel.spec.ts` passaram; nenhum deles reproduziu falha.

- `bf56f-orbital-refinement.spec.ts:2`: timeout global de 60 s em linha 148,
  asserção de ausência do link Duelo Arcano. URL `/arcanario` já confirmada;
  Canvas inicial único, ready e loop 1 confirmados. Trace mostra operações
  simples de DOM custando 1–3 s repetidamente; screenshot/contexto ainda
  mostra conteúdo da Biblioteca na captura. Pausa/retomada finais não foram
  certificadas. Erro secundário: Runtime.callFunctionOn session closed após
  encerramento pelo timeout.
- `performance-navigation.spec.ts:66`: timeout global 30 s perto do assert
  final de loop. Trace confirma running → paused → running e comparação do
  mesmo elemento true; falta concluir assert final dentro do prazo. Não é
  evidência de um segundo renderer.
- `performance-navigation.spec.ts:3`: passou nesta reprodução (salas,
  rascunhos, dock). A entrega anterior não deixou neste checkout uma
  identificação objetiva dos três casos/stack traces originais; não se
  atribui retrospectivamente uma causa não observada ao terceiro caso.

Evidência inicial: `audits/evidence/bf57b24-r1/e2e-before.log` e eventos dos
traces. Traces binários completos preservados localmente antes da nova rodada.
Hipótese investigada: readback gráfico contínuo do trace somado ao SwiftShader
contribui para custo de automação. Um experimento nos dois specs conservou DOM/actions e screenshot de falha,
desativando somente screencast contínuo. O experimento também falhou (8/10):
orbital esgotou 60 s em keyboard.press ao abrir ferramentas, e lifecycle
esgotou 30 s ao aguardar paused. Essa alteração foi revertida, pois não
resolveu o problema. Uma segunda reprodução com configuração original também
terminou 8/10. Não há mudança final nos specs.
Nenhum timeout, retry, assert de lifecycle ou acesso lunar foi removido.
O resultado desse experimento deve ser interpretado como evidência limitada,
nunca como certificação física nem prova automática de causa ambiental.

## Arquivos e documentação

- Bootstrap e novo reparo: compatibilidade seletiva da v19 intermediária.
- Testes de banco/backup e fixture histórica: regressão persistente e integridade.
- Specs gráficos: experimento de captura revertido; nenhuma alteração final.
- CHANGELOG: removida somente a segunda entrada B2.4, no final; história intacta.
- Relatório B2.4 e STATUS: ressalvas e referência desta revisão.

Busca residual encontrou identificador portal, redirects antigos e detecção
de TCG para rejeição/limpeza; essas ocorrências têm função de compatibilidade.
Não foi reintroduzido serviço, engine, arena ou dependência de assets duel.
Referências históricas BF-5.6 permanecem legítimas.

## Validação e decisão

CI, Moto G06, TalkBack e
termal/memória não certificados. Um novo APK é necessário para testar o
bootstrap reparado, persistência, backup v12 e a lua no dispositivo; nenhum
APK anterior contém esta revisão. B2.5 não está autorizada por este relatório.

### Gates dirigidos e formatação

- `npm run test:run -- src/infrastructure/database/retireCombatData.test.ts src/infrastructure/database/arcanarium.test.ts src/infrastructure/backup/backup.test.ts src/app/createApplication.test.ts`: **4 arquivos / 53 testes PASS**. Inclui preservação da sessão educativa ao lado de combat_match.
- `npm run test:e2e -- e2e/bf57b-retired-duel.spec.ts e2e/bf56f-orbital-refinement.spec.ts e2e/performance-navigation.spec.ts`: **8 PASS / 2 FAIL**, reproduzido em duas rodadas originais e no experimento. Sem retry. Hipótese de overhead de screencast insuficiente; causa raiz dos atrasos não encerrada. Não certificar passagem, ausência de corrida ou fluxo completo da lua.
- `npm run format:check`: **FAIL histórico em 25 arquivos**, listados no log de evidência. Nenhum desses arquivos foi reformatado em massa. Arquivos de código alterados verificados separadamente.
- `git diff --check`: PASS.
- Lint inicial detectou problemas nos testes novos; corrigidos com validação Zod explícita, mensagens exatas e Promise.resolve, sem supressões.

### Parecer

**B2.4 ainda bloqueada para aceite técnico integral e liberação automática de B2.5.**
Compatibilidade do banco e cobertura de backup foram reparadas, mas o E2E
gráfico continua vermelho. Não foi provado defeito novo causado pela retirada
do TCG, tampouco foi provada causa exclusivamente ambiental. A próxima
investigação deve medir tempo do main thread/GPU e estados de passagem/rota
em execução gráfica controlada, sem aumentar retries/timeouts como solução.
A revisão entrega reparos seguros e preserva os bloqueadores, não os encerra.

### Gates finais locais

| Comando                                                                  | Resultado                                     |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| `npm run typecheck`                                                      | PASS, exit 0                                  |
| `npm run lint`                                                           | PASS, exit 0, após corrigir os novos testes   |
| `npm run build`                                                          | PASS, exit 0; aviso de chunks >500 kB         |
| `npm run test:run -- --maxWorkers=1`                                     | FAIL: 179/182 arquivos, 1207/1211 testes PASS |
| Reexecução dirigida dos três arquivos que falharam, com `--maxWorkers=1` | 3 arquivos / 19 testes PASS                   |
| Banco/backup/bootstrap dirigidos finais                                  | 4 arquivos / 53 testes PASS                   |
| Prettier dos seis arquivos TS/JSON alterados                             | PASS                                          |
| format:check global                                                      | FAIL: 25 arquivos preexistentes               |

Falhas globais originais preservadas em `vitest-global.log`:
`ArcanariumPage.test.tsx:271` e `:344` aguardavam o link Editar na Oficina;
`PackLibrary.test.tsx:78` aguardava o heading Provações;
`inhabitantPickupContact.test.ts:32` excedeu 5 s no caso Aryn.
A execução global coincidiu com outros processos de validação, inclusive
Playwright/software WebGL. A repetição dirigida passou sem outros gates
pesados em execução. Isso demonstra sensibilidade às condições da execução,
mas não prova causa exclusivamente ambiental nem torna a suíte global verde.
Nenhuma dessas quatro falhas foi suprimida ou convertida em PASS global.
Não houve nova alteração produtiva nesses componentes para buscar resultado.

Os últimos frames extraídos do trace inicial mostram um mundo renderizado
no retorno e o botão lunar semântico visível. São frames anteriores ao timeout,
não capturas garantidas do estado exato no encerramento. A textura no build
foi verificada; sua aparência física e toque via raycast continuam pendentes.
