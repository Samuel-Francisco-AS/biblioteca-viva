# Termo de fechamento — BF-5.7A: cristal, continuidade e refinamentos de interface

**Decisão:** **concluída funcional e artisticamente com ressalvas, por aceite expresso do proprietário em 12/11/2026**, com autorização explícita de merge na `main` e encerramento da [PR #51](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/51).  
**Branch:** `feat/bf-5-7a-crystal-controls`  
**Candidato aceito antes do commit de fechamento:** `c59d3f413e47f5936fc86b3b0561ac1d9a62d3b9`  
**Escopo:** BF-5.7A (não encerra a frente BF-5.7 como um todo, nem inicia BF-6).  
**Integração confirmada:** PR #51 mesclada e encerrada automaticamente em **12/11/2026 às 15:53:07 UTC**, usando método **merge**. Commit de integração na `main`: [`1f22b08e7ac1767eff712d6c8d1b438a46594cd4`](https://github.com/Samuel-Francisco-AS/biblioteca-viva/commit/1f22b08e7ac1767eff712d6c8d1b438a46594cd4). O histórico da PR e o termo de fechamento foram preservados.  
**Referências:** [relatório incremental BF-5.7A](BF-5_7A_CRYSTAL_CONTROLS.md) · [caderno de 17 propostas de UX](BF-5_7_CADERNO_PROPOSTAS_UX_FLUIDEZ_2026-11-11.md) · [issue #50](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/50).

## 1. Decisão e critérios

O proprietário conferiu o APK debug no **Moto G06** após as intervenções G8 e relatou que, pela inspeção realizada, os problemas observados estavam sanados. Posteriormente confirmou a execução dirigida bem-sucedida dos reparos G8-R: `npm run lint && npm run typecheck && npm run test:run -- src/infrastructure/backup/backup.test.ts src/pages.test.tsx`, com **42 testes PASS em dois arquivos** (12 de backup, 30 da página Biblioteca). Em 12/11/2026, autorizou expressamente **consolidação documental, merge da PR #51 e encerramento da PR**.

O aceite é **dirigido e com ressalvas**. Não significa certificação de fluidez universal, de ausência definitiva de artefatos em outros dispositivos, de CI global verde nem de desempenho quantitativo P95/P99 no Android. O APK anteriormente inspecionado não foi recompilado especificamente para o último commit pontual `c59d3f4` (ajustes de lint e reação à preferência). Esse código foi coberto pelo gate dirigido de lint, tipos e testes, mas não por novo gate físico declarado.

## 2. Entregas consolidadas

| Frente | Resultado incorporado ao escopo |
| --- | --- |
| Cristais e resposta tátil | Materiais e botões cristalinos, feedback de pressão de ciclo único, prevenção de pressão dupla, revisão da resposta do dock e passagem/revelação; preservação de teclado, cancelamento, movimento reduzido e contrastes de elementos funcionais. |
| Coleção e fólios | Refinamentos de densidade e hierarquia na Coleção, leitura/Livros, Estudos, Trabalho, Atividade Física e Entretenimento; botões e seletores com apresentação mais coerente. |
| Canvas e histórias | Medalhões compactos para Diário de Histórias e Noite da Fenda Lilás, com progresso e nomes acessíveis, posicionados próximos ao dock; acesso lunar ao Arcanário corrigido para o **Portal** em vez do Duelo. |
| Exploração acessível | Botão **Acervo e habitantes** tornou-se preferência persistente `showCanvasAccessButton`, **desativada por padrão**, acessível nas Configurações; quando desligada, painel oculto imediatamente e estado aberto limpo para evitar reabertura fantasma. Recursos assistivos subjacentes preservados, com recuperação em falhas do mundo. |
| Arcanário | Filtros de Família e outros conjuntos curtos em grade responsiva compacta, tipografia/estados/áreas de toque; redução de composição das miniaturas e paginação mais limitada; mudança de sala inicia no topo sem perder o foco acessível; ajustes experimentais de renderização de cartas de combate e Eco/flashcard. |
| Backup | Nova preferência integrada à arquitetura já existente de experiência/Dexie e compatibilidade com registros antigos; integridade SHA-256 de backup calculada sobre payload assinado original **antes** de aplicar defaults novos; regressões protegidas por testes. |
| Rastreio | Documentação incremental, testes unitários/E2E dirigidos, investigação de HUD fora da viewport, diagnósticos de rolagem e caderno separado com 17 ideias futuras **não automaticamente aprovadas/implementadas**. |

A frente foi conduzida em rodadas R1/R2, C/L/S/E/W/P, G1–G8 e G8-R, com intervenções tanto remotas quanto via Copilot CLI. O relatório incremental preserva a origem e o contexto de cada mudança; este termo é o resumo canônico do **estado aceito**, sem apagar hipóteses nem falhas anteriores.

## 3. Evidências que podem ser afirmadas

1. **Gate físico humano:** o proprietário informou geração de APK debug, instalou e inspecionou o resultado G8 no Moto G06, aprovando visualmente o conjunto observado. O feedback final é qualitativo, não uma medição automatizada de GPU/scroll.
2. **Lint, TypeScript e testes G8-R:** execução local encadeada com `&&`, relatada pelo proprietário como aprovada em 12/11/2026; `backup.test.ts` **12 PASS** e `pages.test.tsx` **30 PASS**, **42/42** em 5,13 s. Nessa rodada, o teste **G3 abre Portal do Arcanário** passou (779 ms).
3. **Rodada ampla anterior, G8 via Copilot:** relatório do agente informa `typecheck` e `lint` PASS, dirigidos 57/57 PASS, APK debug gerado (13.083.215 bytes), E2E orbital 1/1 PASS. A suíte completa teve **1.254 PASS e 2 FAIL**; não registrar essa suíte como verde.
4. **E2E de rolagem:** relatório G8 aponta `ERR_CONNECTION_REFUSED` no ambiente de teste. Houve também falhas anteriores em cenários de entrada orbital e detalhe-scroll, tratadas em rodadas dirigidas. Nenhuma confirmação global posterior de Playwright completo.
5. **Verificações GitHub:** commits e relatórios em PR #51, revisão estática do HEAD, confirmação de que a base `main` estava preservada antes do merge. **GitHub Actions/CI global sem certificação de execução por cota**.

## 4. Ressalvas remanescentes — assumidas e não bloqueantes por decisão do proprietário

- **Vitest completo:** duas falhas relatadas pela execução ampla G8: `ArcanariumPage.test.tsx` (link de edição após persistência) e `inhabitantPickupContact.test.ts` (timeout geométrico). Não foram corrigidas nessa última rodada e **não devem ser declaradas PASS**; classificadas como dívidas históricas, sem comprovação de regressão causada pela G8.
- **E2E/Playwright:** rolagem bloqueada por falha de conexão na rodada G8; outros E2E/diagnósticos anteriores não passaram todos de ponta a ponta. Distinguir falha de automação/ambiente de falha física do APK; investigar em tarefa específica caso volte a bloquear a entrega.
- **Compositor Android:** pixels/quadradinhos claros/coloridos em cartas e lacunas temporárias durante rolagem do Acervo motivaram mitigações direcionadas de pintura, clipping e redução de carga. O proprietário avaliou a última versão visualmente como satisfatória; a **causa-raiz gráfica não foi comprovada com trace de compositor**, e não há certificado quantitativo para todos os aparelhos.
- **Métricas e amplitude:** P95/P99, estabilidade térmica, memória longa duração, TalkBack integral, toda a matriz retrato/paisagem e CI global não certificados.
- **Código/format:** histórico de falha `format:check` relatada pelo Copilot, atribuída a arquivos preexistentes e não saneada integralmente nesta etapa. Nenhuma afirmação de gate de formatação global verde; avaliar o conjunto exato antes de intervenção futura.
- **Arquivo local não rastreado:** o PNG de evidência `docs/audits/evidence/bf56f-refinement/lua-no-mundo.png` permaneceu como alteração local preexistente na máquina do proprietário conforme relatório do Copilot; nunca foi apagado/descartado pelo fechamento remoto.

O aceite explícito significa que esses pontos **não impedem o encerramento da BF-5.7A**, mas seguem visíveis. Não atribuir sucesso a testes não executados; abrir recortes futuros apenas com nova decisão e evidência.

## 5. Continuidade, não reabertura automática

- A **BF-5.7A fica encerrada com ressalvas** após integrar a PR #51.
- O [caderno de 17 propostas](BF-5_7_CADERNO_PROPOSTAS_UX_FLUIDEZ_2026-11-11.md) continua em estado **ideação controlada**, não como tarefas automaticamente autorizadas. Divide AG-01–AG-09 e FP-01–FP-08; o princípio principal continua sendo **fluidez percebida = resposta ao contato + transformação contínua + revelação coerente + repouso**, não otimização isolada do tempo.
- A BF-5.6 permanece fechada conforme seu termo próprio. BF-6 RPG e demais frentes não são iniciadas por este merge.
- Os testes históricos, o E2E de rolagem e eventuais resíduos de WebView/quest devem ser tratados em tickets/recortes próprios, sem reabrir retroativamente a BF-5.7A por padrão.
- Para reproduzir a candidata aceita após merge, sincronizar `main` no Fedora; não descartar arquivos locais para conseguir o fast-forward.

**Autorização:** pedido expresso do proprietário em 12/11/2026 para documentação, merge na `main` e fechamento da PR #51.  
**Integração confirmada:** `main` recebeu o merge `1f22b08e7ac1767eff712d6c8d1b438a46594cd4` e a PR #51 aparece como **merged/closed** no GitHub. Este registro documental pós-merge atualiza somente a referência histórica; não altera funcionalidades nem o escopo aceito.
