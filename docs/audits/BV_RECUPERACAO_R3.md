# Recuperação R3 — Loop, Agência e Lifecycle

Missão de 07/11/2026; branch `perf/bv-recuperacao-integral`, [PR #38 draft](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/38), base `feat/bf-5-5f-real-session-response`. Recuperação integral aberta; sem merge, R4/R5 ou expansão de BF-5.5F.

## Proveniência e limites

Checkout inicial limpo em `849dd290c2f715012257b5b49e3e8d59c7d6f50a`. Fetch confirmou avanço documental legítimo para `15ba07f29975160d530d8af4dda3553839eaf5a7`; diff examinado e fast-forward, sem alterações descartadas. Este é o SHA inicial da execução R3. PR aberta/draft, base e refs conferidas pelo conector GitHub. O aceite humano de R2/saneamento no Moto G06 é o baseline artístico/funcional; não se estende automaticamente à R3.

`adb devices -l`: nenhum dispositivo. Não há GPU/heap/FPS Android, temperatura, toque, TalkBack ou aprovação física R3. CI de produção R2 `849dd290`: estáticos/unitários/build SUCCESS, ambos E2E FAIL; não é dívida corrigida implicitamente aqui. [Autoridade de retomada](BV_RETOMADA_R3_2026-11-07.md).

## R3A — BV-05, BV-06, BV-08

### Diagnóstico e mudanças

- `livingVisuals`: `scene.traverse` procurava Hemisphere/Directional em todo frame. Montagem do runtime fornece as referências que possui; fábrica isolada descobre uma vez. Referências são liberadas com o controlador, árvore continua pertencendo à montagem. Interpolação dorme ao atingir o alvo (tolerância 1e-5; assentamento exato), acorda por atmosfera/noite/movimento reduzido/reconciliação no resume. Cores, potências e curvas mantidas até o residual imperceptível de assentamento. Nove luminárias conservam fallback de 45 s, inclusive sem nova revisão do ritual; chama, magia e brilho pulsante continuam animados.
- `sessionBookVisuals`: capa/bounds de abertura e emissivo só são escritos quando mudam. Envelope navegável é reutilizado enquanto abertura e matriz mundial forem iguais; movimento, giro, escala do parent e capa invalidam. Descendentes recebem a nova matriz antes de calcular bounds; substituição de representação/layout continua liberando a jornada. Snapshot anterior não é modificado. Geometria de voo é coletada na partida como antes; nenhum cache novo de obstáculos ou trajetórias.
- `InteractionCoordinator.retain`: consulta a autoridade dos dois recursos a cada frame; renova leases imutáveis de 30 s apenas quando faltam até 10 s. Expiração, liberação ou outro owner são detectados imediatamente. Não há lease paralelo, TTL em wall time de background ou cache de ownership. Reserva inicial/recuperação continuam no mesmo coordenador.
- Runtime: duas fases de poses em vez de quatro (cinco se checkpoint habilitado): pré-agência para colisões do livro, pós-agência compartilhada por visuais, transporte, pergaminhos e checkpoint. Manter ambas é necessário à ordem física existente; nenhum consumidor recebe `Agent` mutável. Cadência do checkpoint é testada antes de criar snapshots adicionais.
- Pergaminhos: 36 vetores por trilha alocados na montagem e reutilizados em anel só com trilha visível; repouso deixa de fazer clone/unshift/escrever nove motes por frame. Candidatos não criam Vector3 para distância. Âncoras de transporte e `Magic` dos habitantes são resolvidas uma vez por asset; conclusão de loader invalida fallback e descarte libera mapas.

### Comparação reproduzível no host

[Antes](evidence/bv-r3/before.json) / [depois](evidence/bv-r3/after.json), mesmo teste `r3Loop.probe.test.ts`, Node/Vitest/jsdom, deltas determinísticos, dia, três livros pessoais, um pergaminho em repouso e livro de sessão já pousado/aberto. 900 passos de 50 ms para pouso, 600 frames de aquecimento da atmosfera, depois 600 de 1/60 s. Sem renderer, GLBs ou GPU nessa probe; testes integrados cobrem o runtime separadamente.

| Trabalho em 600 frames | Antes | Depois |
|---|---:|---:|
| Travessias globais da cena | 600 | 0 |
| Interpolações de cor | 2.400 | 0 |
| Box3.setFromObject (capa + envelope) | 1.200 | 1 |
| Escritas de capa | 1.200 | 0 |
| Escritas de brilho do livro pessoal | 600 | 0 |
| Criações/renovações por reserve | 1.200 | 0 |
| Clones de Vector3 | 600 | 0 |

Zero `reserve` nesta janela não significa zero consultas: são mantidas 1.200 verificações diretas de autoridade; janelas maiores renovam perto do prazo. O único Box3 inicial preenche o cache de navegação. Menos trabalho/alocações comprovados; impacto em GC e fluidez Android continua hipótese. Não há limite de FPS ou tempo inventado. Tradeoff: 36 vetores por pergaminho retidos desde a montagem (antes cresciam até 36), duas cópias pequenas de poses por frame e cache de um envelope por jornada. Nenhuma luz, mesh, animação, resolução ou asset foi reduzido.

Reprodução depois: `BV_R3_PROBE=after npx vitest run src/features/library/three/r3Loop.probe.test.ts --no-file-parallelism`. Para antes, usar worktree temporário em `15ba07f`, mesmas dependências e uma cópia desse único arquivo de probe, com `BV_R3_PROBE=before`; não substituir fontes do checkout de trabalho. O teste usa APIs já existentes na base. Asserções funcionais exigem mesmo livro aberto, duas reservas e pergaminho parado; contadores não são budgets de CI.

### Regressões e gates

102 testes distintos aprovados entre as rodadas dirigidas, 11 arquivos. Rodada integrada inicial: 94 PASS / 1 FAIL novo no teste de invalidação de parent; a primeira hipótese (atualizar matriz local) não resolveu. Inspeção do `Object3D.updateWorldMatrix` instalado demonstrou necessidade de propagação forçada; corrigida apenas na invalidação. Teste dirigido passou, depois rodada final de livro/runtime/GLBs/probe: **65/65 PASS**, quatro arquivos; demais 37 já aprovados, sem mudança posterior nesses mecanismos. Lint dirigido final também identificou async sem await e leitura sem tipo do resultado de spy no teste novo: corrigidos com Promise.resolve e fronteira unknown, sem supressões. Sem timeout/assert removido ou retry E2E.

Cobertura: dia/noite/45 s/reversão/reconciliação; Livro da Estrela abrir/fechar, comandos rápidos, reversão, páginas/exame, transporte/pouso/retorno e runtime pausa/resume; livro pessoal de três estantes/coleção cheia, identidade, interrupção/conclusão/leases perdidos e asset substituído; pergaminhos voando/retorno/cauda; quatro GLBs reais, continuidade, agência e seleção. Teste do runtime exige duas chamadas de `getPoses` por frame e estabilidade do snapshot anterior.

PASS: lint global, typecheck, format:check, build web, performance:report e diff check; checagens dirigidas adicionais após ajustes finais. Bundle Three aproximadamente 824,6 kB bruto / 220,3 kB gzip (R2 822,8 / 219,6); warning >500 kB mantido. Report é build, não runtime. E2E conhecido bloqueado antes da seleção em R2 não foi repetido em A sem hipótese nova; investigação de lifecycle em C. CI desta candidata consultada após publicação; não presumir verde.

Publicação: commit que introduz esta seção (consultável com `git log -- docs/audits/BV_RECUPERACAO_R3.md`); SHA remoto será registrado em R3B antes de sua implementação, evitando hash autorreferente.

## R3B — BV-10

R3A publicada e push confirmado em `f1086b7ee842a63d28b8c7523f422d31773b694a` antes de modificar B. [CI A 42386112957](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/42386112957): na consulta durante B, formatação/lint/tipos PASS, unitários e E2E ainda rodando; sem conclusão antecipada.

### Antes e depois

Antes: agência continha catálogo autoral e preferências junto ao escalonamento; callbacks instalados no construtor consultavam envelope/candidatos dos visuais de dentro de movimento, escolhas, encontros e recuperação. A mesma atualização podia solicitar várias vezes o mesmo estado; a fase em que esse estado era válido dependia da composição por closures. Pergaminhos consultavam snapshots diagnósticos completos para saber se uma superfície estava reservada.

Depois:

| Responsabilidade | Owner/contrato |
|---|---|
| Pontos, rótulos, interação cenográfica e preferências individuais | `inhabitantActivities.ts`, catálogo extraído sem mudar valores/ordem/âncoras |
| Obstáculos físicos, oportunidade de leitura e pergaminhos | `AgencyEnvironment`, somente dados readonly; composição fornece a `agency.update(environment)` |
| Amostragem e ordem física | Runtime: livro usa poses prévias → amostra entradas atuais → agência move/decide → snapshot pós-agência → visuais |
| Escolha/prioridades, rotas, cancelamento, narrativa, continuidade | Mesma `InhabitantAgency`, única autoridade de movimento |
| Exclusividade, expiração, renovação e disputa | Mesmo `InteractionCoordinator`; `isReserved(resource, now)` consulta uma superfície sem copiar leases |
| Livro pessoal: root, capa e devolução | Mesmo `sessionBookVisuals`; oportunidade é intenção disponível, não reserva/transformação transferida ao NPC |
| Livro da Estrela/pergaminhos carregados | Visuais seguem estado da agência e âncora, sem decidir movimento de personagens |

Removidos os três callbacks de leitura de estado do construtor da agência. Navegação/encontros compartilham o envelope amostrado durante toda a atualização, sem chamar Three. Catálogo de aproximadamente 130 linhas e tipos autorais saiu do coordenador; não se criou scheduler, segunda agência ou framework. Layout continua compartilhado (dados sem renderer), e a navegação mantém os mesmos envelopes, incluindo Ytha.

Capturar entradas explicitamente em cada frame poderia alocar candidatos em repouso; por isso livro mantém uma oportunidade imutável por jornada e pergaminhos retornam a lista anterior quando IDs/elegibilidade/posições não mudam. Durante transporte, mudança de posição/ownership/voo invalida; snapshots entregues antes continuam estáveis. `isTransporting()` evita construir o snapshot diagnóstico do livro para arbitrar novos voos. Não há cache de autoridade de lease.

### Evidências, riscos e gates

Antes: regressões A aprovadas. Depois da troca de contrato: **81/81 PASS, sete arquivos**, incluindo agência completa, todos encontros/manipulação cenográfica, sessão/prioridade, leases órfãos, continuidade, runtime e pergaminhos. Depois dos snapshots estáveis e testes novos: **23/23 PASS, cinco arquivos**, com sobreposição. Novo teste bloqueia movimento com envelope temporário e exige retomada no próximo update após removê-lo. Outros asserts verificam expiração/disputa de superfície e identidade/imutabilidade de oportunidades. Probe A continua PASS; nenhuma asserção anterior retirada (testes apenas passaram a fornecer as mesmas entradas por argumento).

PASS: lint global (mais dirigido após os últimos imports), typecheck, format:check, build web, performance:report e git diff --check. Um format:check intermediário identificou formatação pendente em livingScrollVisuals; corrigida e check global repetido com PASS. Warning de bundle >500 kB permanece; inventário em evidence/bv-r3/build-r3b.json. E2E global conhecido permanece dívida; não foi repetido em B sem nova hipótese. Nenhuma leitura sentada, rig, F2B/F2C ou simplificação visual. Riscos mantidos: coordenador ainda extenso, coreografia especializada e geometria autoral precisam disciplina; entradas valem por uma atualização, e novos sistemas devem respeitar a fase declarada. Isso não pretende resolver autoria de rigs/assentos ou R5.

Publicação B: commit que introduz esta seção; SHA remoto registrado em C após push e antes de sua implementação.

## R3C — BV-15

Pendente; somente após publicação integral de R3B.
