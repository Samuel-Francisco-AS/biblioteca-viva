# BF-4G — Consolidação e fechamento dirigido da BF-4

Data: 2026-11-03. **Estado vigente: BF-4G e BF-4 concluídas no escopo técnico/funcional dirigido, por decisão expressa do usuário, com ressalvas de CI e validações específicas pendentes.** As seções a seguir preservam a evidência original do executor enquanto a etapa era candidata; **o fechamento independente e posterior, com resultados reais, está documentado ao final e prevalece sobre os trechos históricos de NOT RUN**. O exame inicial foi realizado pelo agente executor, não equivalia a auditoria independente.

## Identificação e escopo

- Repositório: `Samuel-Francisco-AS/biblioteca-viva`.
- Baseline e código do APK: `0fba133bc574c2a1e7971c4214e5e03b3fcd6fcb`, merge da PR #17. `main` limpa, remoto conferido, `git fetch origin` e `git pull --ff-only origin main` concluídos sem avanço.
- Branch: `feat/bf-4g-integracao-consolidacao`. Commit documental e PR draft serão identificados na entrega e no histórico desta branch; não há mudança de código em relação ao baseline.
- Nenhum modelo, rig, clip, diálogo, layout, dimensão, dependência, schema, backup ou versão alterado. Sem instalação automática, merge ou release.

A inspeção focou interfaces e provas existentes, não repetiu auditorias artísticas B–F. Não foi encontrado defeito novo demonstrável que justificasse alterar produção. O teste integrado já presente em `WorldHost.test.tsx` cobre seleção → escolha → adiar → retomar → falha terminal → narrativa em fallback → callback tardio. O teste final de `ThreeWorldRuntime.test.ts` integra GLBs reais, agência, narrativa, relações, sessão BF-4E, pausa/redução e perda WebGL em scheduler controlado. Acrescentar outro teste equivalente seria redundante. A entrega é documental, com reexecução proporcional das provas existentes.

## Matriz de integração e evidências

Caminhos abaixo relativos a `src/features/library/`, salvo indicação. PASS técnico dirigido significa evidência automatizada/estática no limite descrito, não aprovação global ou física.

| Contrato | Interface inspecionada e prova reutilizada | Resultado e lacuna |
| --- | --- | --- |
| B/C/D: cinco cômodos A–E, quatro passagens, mobília, circulação/atividade | `libraryRecordLayout.test.ts`, `librarySpatialLayout.test.ts`, `three/libraryFurnishing.test.ts`; construção no mount normal | PASS dirigido; composição preservada. Oclusão e circulação percebida exigem gate físico |
| 70 livros + 13 posições dos demais registros; vazio e overflow | `three/readingAreaBookLayout.test.ts`, `libraryRecordLayout.test.ts`, `libraryWorldEntries.test.ts`, `src/pages.test.tsx` | PASS dirigido: slots derivados, IDs, limites, vazio e acesso React ao excedente. CI coleção cheia continua FAIL |
| Seleção canvas/React e câmera | `WorldHost`, `ThreeWorldRuntime`, `src/pages.tsx`; testes de picking de filhos, highlight, pan/pinch focal, resize/orientação e identidade | PASS dirigido em contratos; E2E shell e orientação falhos na CI anterior impedem afirmar integração global verde |
| E: seleção/ação primária, feedback, três atmosferas e Segredo | `LivingSession`, `livingObjects.test.ts`, `three/livingVisuals.test.ts`, `LivingFeedback.test.tsx`; runtime chama `actPrimary` somente para namespace `living:` | PASS dirigido; sequência 4/4 e capacidades autônomas restritas cobertas. Segredo E2E remoto FAIL permanece separado |
| E × F4: isolamento e Fenda | `applyNarrative` não escreve em `LivingSession`; frame passa override `noturna` enquanto `scenes.rift` não é `restored`; `livingVisuals.update` usa override ou atmosfera da sessão | Inspeção PASS. Ao concluir/reiniciar, retorna à atmosfera contextual atual, que pode ter mudado com horário/descoberta; não é restauração de um snapshot antigo. `narrativeVisuals.test.ts` comprova identidade do estado BF-4E e ausência de eventos ao progredir Fenda, mas não substitui inspeção física da iluminação |
| F1/F2: quatro modelos, clips, seleção e descarte | `three/inhabitantVisuals.test.ts`, `three/inhabitantAnimator.test.ts`; runtime integrado carrega quatro GLBs reais e atualiza highlight móvel | PASS dirigido; sem regeneração de assets. Quatro E2E F2 FAIL na CI (#15); nenhum aceite físico novo |
| F3: atividade, rotas, bloqueios, encontros e relações | `inhabitantAgency.test.ts`, navegação e obstáculos montados; `three/ThreeWorldRuntime.test.ts` | PASS dirigido: seed/clock, seis relações, memória limitada, interrupção manual, recuperação e posições preservadas. Folio/acidente/reparação de Lua segue sem aceite artístico físico específico |
| F4: cinco histórias, personagem/diário, efeitos, proteção e retomada | `narrative/session.test.ts`, `NarrativePanel.test.tsx`, `WorldHost.test.tsx`, `inhabitantAgency.test.ts`, `e2e/bf4-rpg.spec.ts` | Grafos 70 nós/174 escolhas preservados; decisões/duplicação/revisão/reset ficcional e retomada cobertos. UI funcional não é UI final |
| Lifecycle conjunto | Host cancela assinaturas/intervalo/listener; runtime encerra agência, animador e owner da cena; testes de criação/GLB/observer/RAF tardios, falha inicial/terminal, remontagem, pausa e redução | PASS dirigido; um scheduler existente. Sem prova de heap Android ou ausência universal de vazamentos |
| Acessibilidade/fallback | Testes de teclado/foco/anúncios, React sem canvas, texto das ações/consequências e E2E RPG sem WebGL | PASS dirigido onde automatizado; TalkBack físico NOT RUN, sem dependência de áudio para diálogo |

Evidências humanas anteriores são preservadas com seus limites: [F3](BF-4F3_RELATORIO.md) aprovou autonomia/convivência/integração, não folio; [F4](BF-4F4_RELATORIO.md) aprovou escolhas funcionando, não todos os finais/ramificações. Relatórios B–E e F1/F2 permanecem referências dos aceites dirigidos, não uma nova certificação feita nesta G.

## Integridade dos seis registros e privacidade

Livros, filmes, séries, estudos, atividades físicas e trabalhos passam por consulta agregada única na montagem (`src/pages.tsx`) e projeção imutável `projectLibraryWorldEntries`. A seleção só abre um registro quando `entryId` e `instanceId` correspondem à projeção/catálogo; objetos `living:*` e `character:*` não recebem identidade convencional. Lista React conserva todos os registros, inclusive overflow, e a navegação abre pelo `entryId`, sem editar por seleção.

`NarrativeSession` só aplica efeitos tipados de fatos, cena, inspeção e vínculo. Agência e sessão BF-4E não recebem porta de escrita convencional. A inspeção dos imports/caminhos de ação não encontrou acesso a Dexie, rede, armazenamento narrativo ou logging de conteúdo nessas camadas. Erros de consulta são apresentados por erro público; runtime publica códigos/mensagens técnicas. Testes de arquitetura, projeção, página, aplicação, Dexie e backup existentes foram reutilizados na suíte integral. O E2E RPG compara o conteúdo IndexedDB antes/depois com um livro fictício; a cobertura dos seis tipos vem das provas de projeção/página/aplicação, não de afirmar seis tipos nesse E2E.

Dexie v8 e backup v6 permanecem idênticos; nenhum segundo banco, salvamento narrativo ou persistência espacial. Nenhum dado pessoal foi usado em fixtures ou evidências. Esta revisão focada não equivale a auditoria exaustiva de segurança do aplicativo.

## Gates locais da candidata

| Gate | Resultado |
| --- | --- |
| `npm run format:check`, `lint`, `typecheck` | PASS |
| `npm run test:run -- --maxWorkers=2` | PASS — 91 arquivos, 708 testes, 72,76 s |
| `npm run audio:check` | PASS — dois WAVs determinísticos |
| Build web de produção + Capacitor sync | PASS, executados pelo script Android |
| `npm run performance:report` | PASS — JS inicial 720.583 bytes; Three dinâmico 730.377 bytes |
| `npm run test:e2e -- e2e/bf4-rpg.spec.ts` | PASS — 2/2, 23,6 s, sem retry |
| E2E global local | NOT RUN; reservado à CI da PR |
| `npm run android:build:debug` | PASS — assembleDebug, 184 tarefas, 24 executadas |
| `git diff --check` | PASS |
| Auditoria independente, Moto G06, TalkBack, arte e desempenho físico | NOT RUN nesta G |

Warning Vite de chunks >500 kB, avisos Gradle `flatDir` e aviso Playwright NO_COLOR/FORCE_COLOR permanecem; não são novos defeitos tratados nesta candidata. Bundle não mede FPS/GPU/RAM. Nenhum gate falhou localmente nesta rodada; não houve correção/retry de teste.

APK: `android/app/build/outputs/apk/debug/app-debug.apk`, **10.568.395 bytes**; SHA-256 `353f81eb311ed8d1a309d255e90c4c0a950f4fb36fafeea063e16d9718a62935`. JS/CSS/GLBs empacotados conferidos byte a byte contra `dist`. Código corresponde ao baseline acima; os commits G são documentais. APK local não versionado, sem instalação ou teste humano alegado.


## CI anterior: onze falhas, sem causa comum presumida

[Run 41550602711](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711), job `125636944394`, consultado por API e logs nesta G: **CI global FAIL; 23 E2E PASS / 11 FAIL**. Formato, lint, tipos, 708 Vitest, áudio, build e bundle PASS. Os dois E2E F4 passaram. Não transferir exceção de merge F4 para aprovação da G.

| Cenários FAIL | Sintoma no log | Classificação / hipótese a investigar, sem correção especulativa |
| --- | --- | --- |
| BF-4D orientação (1) | 30 s em screenshot do canvas | Timeout; custo de captura/runner ou responsividade a investigar. Não atribuído automaticamente a #11 |
| BF-4D coleção cheia 1280 e 390 (2) | 30 s em `canvas.evaluate`; retry mobile também screenshot | Timeout, #11 aberta. Densidade/custo do protocolo são hipóteses; FPS SwiftShader não diagnostica Moto G06 |
| BF-4F2 Samael, Aryn, Ytha, Lua (4) | Timeout durante ações/observação/foco nos controles | #15 aberta; runner, UI e produto ainda não discriminados; PASS local/físico anterior não resolve FAIL |
| BF-4E Segredo (1) | Timeout ao clicar Examinar — Armário da memória | Causa desconhecida, dívida própria neste relatório; verificar acessibilidade/scroll/responsividade antes de alterar código |
| Shell desktop (1) | Timeout em wheel e, no retry, mudança do target de pan | #4 aberta; gestos/runner continuam hipóteses |
| Shell dez ciclos (1) | Timeout em diagnóstico/atributo de loop; protocolo com sessão encerrada | #4; sessão encerrada pode ser consequência do timeout, não prova de crash ou vazamento |
| Reading-area seis tipos (1) | Timeout ao abrir registro; contexto/protocolo encerrado | Dívida própria; fluxo de retorno/runner a distinguir, sem prova de perda de dados |

Não há defeito de produto comprovado por esses logs, tampouco prova de que sejam apenas falhas do runner. Todas permanecem FAIL. Issues [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15) foram confirmadas abertas. Orientação, segredo e reading-area ficam explicitamente rastreados aqui, sem alegar cobertura integral nas três issues. Não houve campanha local global, aumento de timeout, skip, supressão de assert ou rerun manual.

**Nota histórica pré-CI:** à época do relatório da candidata, a CI G ainda não tinha resultado. **Resultado definitivo e classificação** documentados no fechamento posterior deste relatório: [run 41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247), CI global FAIL (30 E2E PASS, 3 FAIL, 1 flaky).

## Roteiro único Moto G06

Usar o APK identificado abaixo, preservando os dados existentes; não limpar banco nem restaurar backup pessoal. Preferir coleção fictícia representativa já disponível. Registrar versão/hash, duração aproximada e PASS/FAIL/NOT RUN de cada experiência com uma observação curta.

1. **Mundo e navegação:** abrir Biblioteca, explorar A–E e quatro passagens; pan, pinch, zoom, seleção e retrato → paisagem → retrato. Se possível, conferir também o vazio em ambiente de teste separado, sem apagar dados reais.
2. **Conteúdo e objetos:** selecionar registros por canvas e React, abrir e voltar; interagir com ao menos um objeto vivo. Conferir acesso à coleção e ao excedente pela lista, sem edição involuntária.
3. **Habitantes:** observar circulação espontânea e algum encontro, sem exigir todos os pares. Selecionar alguém em atividade, executar ação manual permitida e observar recuperação da autonomia.
4. **RPG:** iniciar história por personagem, escolher, adiar e retomar pelo diário; observar progresso/consequência e voltar à coleção. Quando percorrer Fenda naturalmente, observar atmosfera antes/depois; não exigir todos os finais nesta rodada.
5. **Lifecycle:** segundo plano → retorno, orientação e nova interação; sair da Biblioteca e reentrar. Ficção reinicia ao sair da rota, registros permanecem. Observar responsividade, travamento ou aquecimento perceptível e descrever cenário/duração se ocorrerem.
6. **Residuais:** registrar folio/acidente de Lua F3, R-19, bloqueio de passagem ou legibilidade se surgirem naturalmente; não forçar eventos aleatórios repetidos. Fluidez percebida é observação humana, não benchmark de FPS.

**TalkBack:** NOT RUN, procedimento físico separado ainda obrigatório para o marco assistivo. Não integra um PASS automático desta rodada.

## Classificação e pendências

Gate técnico dirigido: **PASS no recorte inspecionado e nos gates locais acima, sem regressão crítica nova conhecida; não significa BF-4G tecnicamente verde nem CI global PASS.** Gate integrado BF-4G: **NOT RUN/conclusão pendente**, pois faltam auditoria independente e rodada física. Nenhum PASS com ressalvas aceito foi presumido em nome do usuário. CI global anterior **FAIL**.

BF-5 mantém consolidação funcional/assistiva, inclusive TalkBack; sem execução automática. UI/UX futura abrange comprimento/rolagem/hierarquia do painel e integração com navegação inferior. Outra frente futura trata modelos/acabamento, variedade/expressividade, coreografias, relação espacial com acontecimentos, magia, ritmo narrativo, diálogos e consequências. Ambas sem numeração nem implementação autorizada. R-19, folio Lua e desempenho/memória/temperatura sustentados continuam abertos. Nenhuma declaração de beta, release ou BF-4 inteira concluída.

## Fechamento oficial da BF-4G e da BF-4 — 2026-11-03

### Auditoria independente e integridade da candidata

A [PR #18](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/18), HEAD inicial da candidata `c1b3820b23f1740a93e8a20ac9c56a1819ad3fed`, foi conferida independentemente no GitHub contra a `main` `0fba133bc574c2a1e7971c4214e5e03b3fcd6fcb`. A PR modificou **sete arquivos de documentação e nenhum arquivo de produção**. O relatório contém matriz B–F coerente, referências a testes existentes e limites honestos quanto a dados, ownership, fallback, lifecycle e execução física. Não foi demonstrado bloqueante de integração ou necessidade de mudanças de produção. Esta auditoria documental/estática **não é execução independente de 708 testes nem auditoria exaustiva do código**.

Gates executados pelo agente na candidata: formato, lint, tipos, 708 Vitest, áudio, build/bundle, dois E2E RPG dirigidos, Android debug e `git diff --check` **PASS**, conforme evidência técnica do relatório. No [GitHub Actions run 41570848247](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41570848247), 708 Vitest e gates não E2E passaram. **A CI GLOBAL permaneceu FAIL**: **30 E2E PASS, 3 FAIL e 1 flaky**. Os três FAIL são: BF-4D coleção cheia 1280px ([#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)), ações dirigidas de Samael BF-4F2 ([#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15)) e dez ciclos de rota shell ([#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4)). Busca/filtro/Arquivo foi **flaky**, não PASS estável. A CI anterior tinha 23 PASS/11 FAIL; esta mudança sem código é observação de variabilidade da suíte, não comprovação de causa runner-only, nem resolução de dívidas. Os cenários antes falhos e agora PASS **não** foram declarados permanentemente curados.

### Gate físico dirigido — Moto G06 (usuário)

O usuário confirmou os resultados para o gate conjunto, em uma rodada representativa:

| Procedimento | Resultado |
| --- | --- |
| 1. Mundo e navegação | **PASS** |
| 2. Registros e objetos vivos | **PASS** |
| 3. Habitantes | **PASS** |
| 4. RPG e diário | **PASS** |
| 5. Lifecycle | **PASS** |
| 6. Observações residuais | **PASS** |

**Resultado: 6/6 procedimentos PASS**, conforme declaração humana; sem regressão funcional relatada nos procedimentos executados. O sexto PASS significa que a inspeção residual foi realizada com aprovação, **não** que o acidente/reparação do folio de Lua foi observado ou que a tremulação R-19 foi medida/erradicada. Não houve relato de avaliação específica de TalkBack, benchmark prolongado de FPS/memória/temperatura ou todos os finais/ramificações narrativas. Preservar `NOT RUN` nessas verificações até prova própria. Não inferir limpeza de banco, acesso a dados reais, teste de todos os seis tipos numa única sessão ou execução de cada evento aleatório além do que o roteiro e os resultados sustentam.

### Decisão, exceções e continuidade

Após auditoria independente favorável e gate físico 6/6 PASS, o usuário autorizou expressamente **merge da PR #18, fechamento documental da BF-4G e encerramento da BF-4**. Classificação:

- **BF-4G: PASS no escopo técnico/funcional dirigido, COM RESSALVAS**;
- **BF-4 — Mundo Vivo e Habitável: CONCLUÍDA no escopo técnico/funcional dirigido, COM RESSALVAS**;
- **CI integrada: FAIL**, aceito para esta integração por exceção expressa, sem qualificação de gate verde;
- **BF-5, TalkBack físico, beta, release, carga/termal sustentada, arte final e refinamentos futuros: NÃO APROVADOS por este fechamento**.

Permanecem as issues #4/#11/#15, variação/flaky de busca/Arquivo, validação artística específica de folio de Lua BF-4F3, R-19 e lacunas de avaliação assistiva e sustentada. Não executar nova campanha de CI neste fechamento, não ocultar asserts, não reclassificar falhas antigas sem diagnóstico e não alterar o código de produção. O APK debug da candidata continua representando o código da `main` BF-4F4, pois BF-4G só modifica documentação.

**Próximos trabalhos, ainda não iniciados:** BF-5 como consolidação funcional e gate assistivo previsto; **fase autônoma de UI/UX mobile**; e **outra fase autônoma de aprimoramento de personagens, animação, RPG, diálogos e interatividade**. A ordem, escopo e numeração desses refinamentos exigem planejamento posterior. A ambição artística continua prioridade, com testes proporcionais e otimizações somente diante de problemas concretos.

O histórico acima, que descrevia gate físico e auditoria como NOT RUN, documenta a situação pré-fechamento e não prevalece sobre esta decisão.
