# BF-5.7B2.5 — saneamento residual e integridade

## Identidade e escopo

Branch filha: `feat/bf-5-7b2-final-cleanup`.
SHA inicial/base remota R2: `d02a2acf7e8f55b716f7091cbeaac3c9bc0b6f77`,
[PR #56](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/56).
[PR filha #57](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/57), draft, sem merge.
SHA da implementação/auditoria: `9342762b08f3fb6c5f57c9dd6c2143ee55ea409b`.
O fechamento documental posterior não altera código produtivo; o HEAD exato
do APK será publicado na PR e no manifesto local do artefato.
PNG de auditoria preexistente preservado fora dos commits.

Entrada autorizada pelo checkpoint R2: lint/typecheck/build e 1218 testes
PASS; dois timeouts gráficos permanecem FAIL, não atribuídos exclusivamente
ao ambiente. O avanço é só saneamento, não aceite físico da R2/B2.5.

## Auditoria residual

Busca solicitada em src/e2e/scripts/public/assets: 375 linhas em 27 arquivos
na base. Classificação por ocorrência e inventário estão na evidência desta
entrega. As 293 linhas do fixture v11 TCG são necessárias para rejeição e
saneamento; não são catálogo produtivo nem importadas pelo aplicativo.

Removidos nesta etapa:

- Comentário produtivo em `pages.tsx` que afirmava que Duelo era sala ativa.
- Referência à sala aposentada no teste genérico de readiness de
  `interactionContinuity`: agora testa uma resposta obsoleta de Assuntos,
  conservando a mesma asserção e comportamento de transição.

Nenhum motor, serviço, CSS exclusivo, script ou asset TCG adicional foi
comprovado como morto: as remoções estruturais já ocorreram na B2.4. Não há
remoção de pacote npm justificável: Three.js continua necessário ao mundo.
Não se apagaram recursos nem histórico apenas por palavras encontradas.

Preservados por contrato:

- `orbitalArena`/`ORBITAL_ARENA_ID` e `portal:duelo-arcano`: identificação
  técnica lunar usada em seleção, broadphase, destaque e semântica.
- Rotas antigas em App/ArcanariumPage e `?tipo=combat`: redirecionamentos
  explícitos, cobertos por regressões de aposentadoria.
- `containsRetiredDuelData`: rejeita TCG antes da importação.
- `retireCombatData` e marcador v1: reparo único/transacional de v19 intermediária.
- Testes negativos e fixture histórica assinada: provam rejeição/rollback.
- Rota fictícia antiga em pages.test e alvo legado no teste de privacidade
  do probe: sentinelas de destino incorreto e normalização de rota histórica.
- Cartas, coleções, baralhos e sessões educativos: dependências vigentes.

## Persistência e retenção

Banco ativo `biblioteca-viva-bf57`, Dexie v19, backup v12. Sem mudança de
identidade, schema, versão de aplicativo ou reset. Bootstrap abre o banco,
executa o saneamento com marcador e só então expõe serviços educativos.
A transação cobre stores e marcador; schema e integridade cruzada são
validados antes do commit. Corrupção adicional reverte exclusões/marcador.
Sessões mistas incompatíveis continuam bloqueadas para não deslocar respostas;
isso exige recuperação específica, nunca reset recorrente.

Banco antigo `biblioteca-viva`: código produtivo não o abre, importa nem
exclui. O teste de bootstrap usa banco sintético e comprova retenção do registro
antigo, base nova vazia e persistência após três inicializações. Não houve
acesso ao banco real. Sem aparelho conectado, seu tamanho ocupado é **não
medido**; não há benefício quantitativo demonstrado para exclusão agora.
Uma proposta futura, dependente de autorização própria, pode inventariar
ambas as identidades, mostrar espaço/backup recuperável e oferecer descarte
único explicitamente dirigido ao nome antigo, sem afetar o ativo. Nenhuma
rotina de descarte foi implementada nesta etapa.

## Arquitetura, recursos e desempenho

Inspeção focada de imports, bootstrap, repositório, layout e scheduler não
identificou nova inicialização TCG, consulta TCG ou listener sem liberação.
Repositório educativo lê snapshot em transação readonly; comandos mantêm
transações/eventos após commit. Nenhuma refatoração preventiva foi feita.

WorldHost continua residente. A pausa cancela RAF/gestos e não destrói o
contexto; retorno usa o mesmo renderer. Visibilidade, resize e context listeners
têm caminhos de liberação no dispose. Testes runtime/host/interação cobrem
esse contrato. Retenção GPU fora da rota é intencional; não equivale a render
ativo. E2E gráfico incompleto ainda impede certificação integrada final.

Referência R2: runtime JS 871848 bytes, entrada JS 576082 bytes. Alterações B2.5
são comentário e testes; não há promessa de redução de bundle ou ganho FPS.
Comparação final do build será registrada nos gates abaixo.

## Regressão educativa e limitações

Novo E2E verifica carta educativa + classificação pessoal e gravação de nova
carta com rede offline após módulos carregados; recarrega online e confere
persistência. Esse ensaio é offline de sessão web aquecida. Não afirma cold
start offline do site hospedado; no Android os assets são locais no APK.

Regressões disponíveis abrangem Acervo/Oficina, Ecos/flashcards, Provações,
questões/taxonomia, pacotes, baralhos, Relicário, Estudos, atividades físicas,
backup e bootstrap. Escolhas compartilhadas permanecem radios nativos com
estilo cristalino e foco. Matriz final distingue testes executados e pendentes.

B2.6/B3/B5, merge, CI, aceite físico e liberação de produção não estão aprovados.


### Resultado estático B2.5

Lint, typecheck e build PASS. Relatório de build **idêntico** à referência R2,
com todos os deltas de chunks em zero: runtime 871848 bytes e entrada
576082 bytes. Não houve ganho de bytes ou inferência de FPS. Nenhum chunk de
motor/arena TCG no manifesto; strings combat preservadas no bundle pertencem
à rejeição/saneamento/rotas, não a um motor reintroduzido. Diretórios produtivos
de engine/arena continuam ausentes.

Busca final: 373 ocorrências preservadas. O JSON classifica individualmente as
375 da base: 294 fixture/documentação histórica (293 no JSON assinado),
24 saneamento/rejeição e testes, 22 rotas/ausência de TCG e testes,
32 identificação/órbita lunar e testes, uma privacidade de rota histórica e
duas removidas. Nenhum resíduo sem consumidor removido por suposição.

format:check global **FAIL em 25 arquivos históricos**, conservando a lista
anterior. Inclui pages.tsx e interactionContinuity.test.ts, tocados apenas em
comentário/string nesta etapa. Novo E2E formatado; não se reformatou o conjunto
para esconder o passivo. Ver log completo e comparação de build na evidência.


### Suíte global e integridade

`npm run test:run -- --maxWorkers=1`: **PASS, 183 arquivos / 1218 testes**,
em rodada isolada sem Playwright/WebGL. Inclui reinstalação sintética limpa,
reabertura/idempotência, banco antigo retido, coexistência educativa/TCG,
rollback, sessões, backup v12 educativo e rejeição v11 TCG assinada.
Inclui também os seis tipos de registro, domínio/serviços educativos,
UI Arcanário, WorldHost, raycast e os testes orbitais determinísticos da R2.
Avisos jsdom scrollTo/navigation são limitações do emulador DOM; não foram
silenciados e não impediram a conclusão dos 1218 casos.

## E2E ampliado e reparos localizados de teste

Rodada de 29 cenários, um worker e zero retries, sem outro gate pesado:
**24 PASS / 5 FAIL**. Registro integral em `e2e-initial.txt`.
Dois FAIL tiveram causas demonstradas no próprio teste e receberam reparo:

1. `bf56b-workshop:51`: o clique Interromper levou 48 ms; o reload seguinte
   ocorreu em 103 ms, antes da navegação coberta/animada. A captura permaneceu
   na revisão, com 1/2 respostas preservadas. Agora exige URL `/arcanario/ecos`
   antes do reload, mantendo retomada, segunda resposta e histórico.
2. `bf56d-packs:43`: após reload, PackLibrary não estava carregado naquele
   documento. Ao navegar offline, console registrou ERR_INTERNET_DISCONNECTED
   e falha do import de `PackLibrary-D6A8fKSx.js`; a fronteira exibiu recuperação,
   sem apagar dados. O teste agora visita a gestão de pacotes no documento
   atual antes de desligar a rede e volta à Provação pausada por navegação SPA.
   Mantém remoção/reinstalação e comparação de cartas/histórico sob offline.
   É ensaio web aquecido, não certificação de cold start web sem cache/SW.

Repetição somente dos dois testes alterados: **2 PASS / 2**, 10.7 s e 15.4 s,
sem mudança de timeout/retry. Não se recompôs uma rodada ampla verde: há
26 cenários distintos aprovados entre execuções e três cenários gráficos
não certificados. Código produtivo não foi alterado por esses reparos de teste.

| Fluxos | Evidência E2E |
| --- | --- |
| Atividades físicas, ficha/calendário/rascunho | 2 PASS |
| Integração Estudos/flashcards/fonte global/reabertura | 1 PASS |
| Oficina/baralho/Ecos/interrupção/histórico | PASS na repetição após assert de URL |
| Relicário/imagem/edição e troca autoral/importação | 2 PASS |
| Taxonomia/questão, filtros/Provação/diagnóstico, molduras e etiqueta inline | 4 PASS |
| Pacotes offline/remover/reinstalar e arquivos adversariais | PASS na repetição + 1 PASS inicial |
| Choices retrato/paisagem, seis estados e teclado | 2 PASS |
| Gravação educativa/classificação offline e reabertura | 1 PASS |
| Rotas TCG aposentadas e salas educativas | 7 PASS |
| Navegação DOM/dock/rascunhos | 1 PASS |
| Busca/backup real/restauração e persistência | 3 PASS |
| Portal residente B, portal lunar F, lifecycle navigation | 3 FAIL por prazo global |

Detalhes dos FAIL gráficos preservados:

- `bf56b-workshop:24`, cenário adicional da ampla: timeout 30 s; count Canvas
  5.14 s, evaluate de um atributo 13.23 s, clique Coleção 12.44 s. Não chegou
  ao Arcanário, portanto não certifica esse percurso completo.
- `bf56f-orbital-refinement:2`: timeout 60 s novamente na ativação lunar/URL;
  focus levou 3.09 s, Enter 1.37 s e o prazo já estava esgotando. Mesmo padrão
  de operações simples lentas da R2; sem prova de causa exclusivamente ambiental.
- `performance-navigation:66`: timeout 30 s; comparação de identidade levou
  6.43 s. Mesmo Canvas e retorno running foram observados, mas o caso permanece
  FAIL pelo deadline; não arredondar a observação parcial para certificação.

Traces binários da rodada ampliada em `/tmp/bf25/e2e-initial-results/`.
Estágios/erros relevantes em JSON na evidência pública. As 17 capturas
históricas regeneradas pelos specs foram preservadas em sua versão original;
novas capturas ficaram em `/tmp/bf25/refreshed-evidence/`, com hashes registrados.
O PNG preexistente protegido não foi tocado nem incluído em commits.

## Débitos e parecer para consolidação

**Saneamento residual entregue no escopo auditado, sem evidência de engine TCG
ou recurso exclusivo remanescente.** Integridade educativa e regressões locais
estão aprovadas nos escopos registrados. Não há ganho de bundle demonstrado.

Prontidão para B2.6: **condicionada**, não autorização de início/merge. Antes de
consolidação integral, o proprietário precisa avaliar a candidata no Moto G06:
posição/continuidade lunar, grimório, toque/controle acessível, ida/volta,
Assuntos sem pixels danificados, demais Choices, retrato/paisagem, Back,
reabertura e backup v12 com dados descartáveis. Os três E2E gráficos e o
passivo de 25 arquivos format:check continuam dívida explícita, com prioridade
alta para certificação de navegação/lifecycle. Corrupção de texto Android e
causa física integral da irregularidade não foram comprovadas resolvidas.
TalkBack/P95/P99/termal/memória e cold start web offline não certificados.
Sem novos resets, limpeza do banco antigo, CI/Actions, merge ou início B2.6/B3/B5.

O APK debug será compilado após o último commit documental desta candidata.
SHA exato de origem, SHA-256, bytes e correspondência dist/APK ficam no manifesto
local `android/app/build/outputs/apk/debug/BF57B25-apk-provenance.json` e na PR #57.
Nenhum APK ou chave é versionado. Gerar o artefato não equivale a gate físico.

## Checkpoint final de código e gates

SHA inicial: `d02a2acf7e8f55b716f7091cbeaac3c9bc0b6f77`.
SHA final de código/testes: `95764f1f75a11befdaa5579f1157b7b340191ced`
(inclui auditoria `9342762` e os dois reparos de E2E).
A revisão que publica este relatório/evidências é documental; seu SHA e o
HEAD exato usado no APK constam na PR #57 e no manifesto local do artefato,
evita-se uma autorreferência impossível ao hash do próprio documento.

| Gate | Resultado |
| --- | --- |
| lint global | PASS |
| lint type-aware dos três E2E novos/ajustados após reparos | PASS |
| typecheck, repetido após reparos | PASS |
| build | PASS, mesmo relatório/chunks da R2 |
| Vitest global isolado | PASS: 183 arquivos / 1218 testes |
| E2E ampliado inicial | FAIL: 24 PASS / 5 FAIL |
| Dois E2E ajustados, repetição dirigida | PASS: 2/2; três cenários gráficos continuam FAIL |
| format:check global | FAIL: mesmos 25 arquivos históricos |
| Prettier dos três E2E novos/ajustados | PASS |
| git diff --check | PASS |
| Gate Moto G06/Android físico/TalkBack/termal/memória | Não executado |
| GitHub Actions | Não executado |

Não houve segunda ampla de 29 casos nem nova ampla Vitest após alterações
exclusivamente nos dois specs Playwright. Produto, schema e bundle não mudaram;
foram executados os dois E2E afetados, lint type-aware e typecheck finais.
