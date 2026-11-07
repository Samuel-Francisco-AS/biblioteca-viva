# Saneamento pós-R4 — relógio e fólio de leitura

Pedido do proprietário em 07/11/2026, sobre `c7497407def956709b3bcda303215a46b9d7b8d2`, na branch `perf/bv-r4-dados-observabilidade-integridade` e PR draft [#39](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/39). Os quatro checkpoints [R4A–D](BV_RECUPERACAO_R4.md) permanecem íntegros no histórico. Esta entrega é saneamento de UX/cronômetro, sem merge nem início de R5.

## Evidência humana de entrada

O proprietário informou que Canvas, seleção de habitantes, início de sessão e saída do livro pessoal da estante funcionaram no Moto G06; não percebeu regressão de fluidez em relação à R3. Também identificou o mostrador do fólio parado em `0 s`, embora a conclusão guardasse a duração correta. Isso registra somente o escopo observado, **não aprovação física integral da R4**, TalkBack ou benchmark sustentado. O novo fólio e APK ainda exigem validação humana.

## Diagnóstico e contrato vigente

`SessionPanel` chamava `currentSessionDuration` no render, sem relógio que provocasse novos renders. `StudyPomodoro` e `ActiveSessionIndicator` tinham intervalos locais separados. A conclusão já calculava corretamente pela combinação `activeSince` + `accumulatedDuration`, dentro da transação do caso de uso.

`useSessionClock` oferece um único timestamp externo de redesenho, com `useSyncExternalStore`, compartilhado por todos os consumidores ativos. Existe um intervalo de 1 s enquanto há consumidor ativo e a página/Activity está visível. Pausa, ocultação e último unmount retiram o intervalo; retorno atualiza imediatamente pelo relógio civil. O hook remove listeners DOM/nativos, inclusive registro nativo cuja Promise resolve após desmontagem. Novos consumidores compartilham o mesmo tick; não iniciam um segundo intervalo.

A duração continua calculada exclusivamente por `currentSessionDuration`: pausas não contam, retomada usa o novo `activeSince`, estudo mantém o limite persistido e leitura permanece livre. O redesenho não incrementa um contador acumulativo, não consulta/escreve Dexie e não usa RAF/Canvas. Não se altera o arredondamento por segmento em segundos inteiros já adotado pelo domínio. Mudança manual do relógio civil continua sendo limitação do contrato existente; não há serviço em background, wake lock ou alarme.

O painel consulta sessão global/histórico na montagem, nos eventos `SessionChanged` após commit e no retorno via `useAppResume`; reabrir a rota reconsulta o estado persistido. Respostas obsoletas são descartadas e ações concorrentes bloqueadas. O indicador global também descarta respostas de consulta ultrapassadas. Erro de carga impede iniciar sessão com estado desconhecido.

## Interface

No caminho ativo `EntryDetailPage → BookDetailPage`, uma única instância de `SessionPanel` ocupa a seção **Seu momento de leitura**, depois do marcador e antes das notas/citações. Removido o painel de “Ações do livro”; organização, metadados, capas e exclusão permanecem secundários.

Mostrador circular grande `HH:MM:SS`, papel marfim, tinta ameixa, anéis de latão e sigilo delicado, com estados Pronto para ler / Em andamento / Pausado. O círculo não representa porcentagem nem meta temporal e não tem animação contínua. Iniciar sessão, Pausar sessão, Retomar sessão e Concluir sessão distinguem o cronômetro do status editorial do livro. Cancelamento é secundário e confirmado. Páginas/nota opcionais ficam recolhidas antes do início; histórico e registro manual conservam edição/exclusão e ficam em disclosure próprio. Não foi criado formulário ou contrato novo de conclusão.

Controles têm alvos de pelo menos 48 px, foco visível e retorno de foco ao controle do relógio após ações. Timer tem `role="timer"` e `aria-live="off"`; o estado textual pode anunciar somente transições, sem anunciar cada segundo. O indicador global também deixa de envolver o relógio numa região live. Margens de rolagem e a regra existente de dock durante foco no formulário protegem os controles. A composição usa largura fluida e alto contraste local; não adiciona efeitos que dependam de movimento.

Layouts de Filmes, Séries, Trabalho, Estudo e Atividade Física preservados. Reutilizar o relógio não transforma leitura em Pomodoro. Nenhuma mudança em schemas, Dexie v14, backup v6, IDs, assets, contratos transacionais/eventos ou comportamento artístico 3D. Retirada/voo/pouso/abertura/retorno, agência e reservas seguem o pipeline aprovado.

## Arquivos alterados

- Relógio/apresentação: `src/features/sessions/useSessionClock.ts`, `sessionPresentation.ts`, `ActiveSessionIndicator.tsx` e `SessionPanel.tsx`.
- Integração/layout: `src/features/entry-detail/EntryDetailPage.tsx`, `BookDetailPage.tsx`, `book-folio.css` e `StudyPomodoro.tsx`.
- Regressão: `src/features/sessions/useSessionClock.test.tsx`, `SessionPanel.test.tsx`, `src/pages.sessions.test.tsx`, `e2e/post-r4-reading.spec.ts`; seletores acessíveis de timer em `e2e/bf5-parte2b-estudo.spec.ts` e `bf5-parte2e-controles-capas.spec.ts`.
- Documentação: `CHANGELOG.md`, `docs/README.md`, `STATUS.md`, `ROADMAP.md`, `UX.md`, `TESTING.md`, relatório R4 (somente nota de continuação), este relatório e quatro arquivos de evidência em `docs/audits/evidence/post-r4-reading/`.

## Verificações

| Gate local | Resultado |
| --- | --- |
| `npm run format` / `format:check` | PASS; retoques finais CSS/E2E também formatados/verificados |
| `npm run lint` | PASS; lint dirigido dos seletores/E2E após o gate amplo também PASS |
| `npm run typecheck` | PASS |
| `npm run test:run` | **946 testes / 149 arquivos PASS**, 85,59 s |
| `npm run audio:check` | PASS |
| `npm run build` | PASS; aviso conhecido de chunks acima de 500 kB, sem gate omitido |
| `npm run performance:report` | PASS |
| Playwright leitura + Pomodoro | **2/2 PASS**, 17,7 s, zero retries |
| Playwright leitura após revisão visual | **1/1 PASS**, 10,4 s, zero retries |
| Android debug (inclui build/sync) | PASS — build/sync e assembleDebug; 184 tarefas, 27 executadas, 157 up-to-date |
| `git diff --check` | PASS |

[Evidência compacta reproduzível](evidence/post-r4-reading/results.json). Capturas finais: [pronto/retrato](evidence/post-r4-reading/reading-ready-portrait.png), [ativo/retrato](evidence/post-r4-reading/reading-active-portrait.png), [pausado/paisagem](evidence/post-r4-reading/reading-paused-landscape.png). Revisão visual da primeira execução encontrou summary herdando dourado de baixo contraste e dock sobre controles em paisagem. Corrigidos com cor local, composição em duas colunas quando há largura e recolhimento do dock enquanto a seção tem foco; teste ganhou asserts para contraste/dock e passou novamente. Nenhum ajuste de timeout/retries.

Não repetido o cenário E2E R2 nesta missão: sua classificação anterior **FAIL por deadline global de 30 s**, causa não atribuída, permanece no relatório R4. Nenhum assert removido, timeout aumentado ou CI verde presumida.

Os testes novos cobrem: relógio por segundo; pausa/retomada; foreground DOM/nativo e reabertura; remoção de intervalos/listeners e resolução nativa tardia; múltiplos consumidores com um intervalo; limite de estudo; fólio com um único painel direto; igualdade do mostrador/indicador/duração persistida; ausência de consultas/escritas periódicas; sessão aberta em outro registro; cancelamento confirmado; histórico e regressão dos cinco outros tipos. `pages.sessions.test.tsx` agora inicia pela UI do painel e verifica o evento confirmado chegando à projeção do Canvas, pausa/retomada e conclusão fora da Biblioteca. Testes Three/agência existentes completam a regressão sem modificar o runtime.

Falhas novas de preparação: fixture de Estudo sem `progressUnit` foi recusada pela validação e corrigida; lint encontrou resets síncronos no efeito e tipagem de `act` em testes novos, corrigidos sem supressões. A primeira suíte ampla passou 945 testes; a mudança final para um único timer compartilhado motivou nova rodada proporcional. Essas ocorrências não reclassificam a dívida R2.

APK final: `android/app/build/outputs/apk/debug/app-debug.apk`, **8.607.490 bytes**; SHA-256 `f4406d958b03f8166875d3931da66ea45e346578416d229ce079c3c364436581`. `npm run android:build:debug` inclui `android:sync` e build web; assembleDebug final terminou com BUILD SUCCESSFUL em 2 s. `performance:report` PASS (bytes estáticos dos entrypoints, não CPU/GPU Android). APK técnico local, sem instalação, distribuição de release ou aceite físico novo.

## Publicação e limites

Workflows locais e da main remota conferidos antes da publicação: CI em `pull_request` e push somente main; preview Android em dispatch ou push main filtrado pelo arquivo do workflow. Sem `pull_request_target`, dispatch/rerun ou alteração dos workflows nesta missão. Uma única publicação da candidata após gates locais, com `[skip ci]` no commit. PR #39 permanece draft, sem merge. Ausência de runs não equivale a CI verde.

Não houve instalação nem teste físico novo nesta rodada; sem alegação de aprovação de TalkBack, áudio percebido ou desempenho sustentado. F2B/F2C, leitura sentada, rigs, R5, RPG novo e BF-5.5G permanecem fora do escopo. Aceite artístico pertence ao proprietário.

## Roteiro Moto G06

1. Atualizar o APK debug preservando os dados; anotar SHA, Android/WebView e orientação. Abrir um livro pela Coleção: conferir marcador → Seu momento de leitura → notas, sem abrir Ações do livro.
2. Iniciar sessão e observar pelo menos 10 s: avanço por segundo e indicador global com o mesmo tempo. Na Biblioteca, conferir saída/voo/pouso/abertura do livro e continuidade dos habitantes/reservas.
3. Pausar por 10 s: mostradores congelados. Retomar por 10 s: só o tempo ativo deve ser somado. Alternar abas, apagar tela/background por 20 s e retornar: atualizar imediatamente, sem acelerar contagem por ticks atrasados.
4. Reabrir o app/rota com sessão ativa e depois pausada. Concluir e conferir histórico/duração; observar retorno à estante. Tentar outro registro com sessão aberta e cancelar uma sessão, recusando e depois aceitando a confirmação.
5. Repetir controles em retrato/paisagem, texto ampliado, alto contraste, movimento reduzido e TalkBack/teclado. Confirmar foco, leitura não invasiva do timer, ausência de rolagem horizontal e controles livres do dock. Conferir páginas/nota, registro manual e histórico. Registrar achados, sem promover esse roteiro a PASS automaticamente.
