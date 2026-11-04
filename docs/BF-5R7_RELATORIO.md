# BF-5R7 — Performance, Latência e Fluidez

Data: 2026-11-04. Branch `feat/bf-5-uiux-global-rework`; [PR #20](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/20) permanece draft, sem merge e sem fechamento da BF-5.

## Referência e autorização

Checkout inicialmente limpo; fetch e merge `--ff-only` confirmaram remoto sem commits posteriores. SHA inicial e referência visual: `d5923cbec0cb6f6952395745ecb5360d3a9e4bc0`. O proprietário informou aprovação artística física da R6 no pedido desta rodada. Isso atualiza a pendência artística do relatório R6, mas não constitui aceite físico da R7.

## Diagnóstico e correções

- **Pan:** a posição mudava e `CameraNavigation.applyState()` reconstruía também a matriz de projeção, mesmo sem mudança de zoom/frustum. Ensaio de 60 eventos (8 dentro do limiar de gesto) observou 52 reconstruções. Agora o pan atualiza posição/orientação; zoom e viewport continuam reconstruindo a projeção. Sem mudança de enquadramento, limites, distância ou DPR.
- **Resize:** duas notificações de tamanho idêntico provocavam duas chamadas a `renderer.setSize`, reconstrução da projeção e diagnóstico. Agora tamanho válido e idêntico retorna sem trabalho adicional. Viewport invalidado, rotação e dimensões novas continuam pelo caminho completo. Testes de falha e listener agora provocam uma mudança real de tamanho, preservando todos os asserts.
- **Diagnóstico técnico de picking:** `updateTestPickDiagnostic` forçava matrizes da cena inteira para projetar `crate-01`. Passa a atualizar somente a hierarquia necessária. A redução de 52 para zero atualizações globais é comprovada **na fixture técnica**; o mundo produtivo sem `crate-01` já retornava antes desse trabalho. Não atribuir a esta mudança ganho no pátio produtivo.
- **Controles:** o estado `data-tap-active` dependia de timer de 230 ms e persistia quando o toque virava scroll. Agora acompanha o ponteiro primário e é limpo por deslocamento superior a 8 px, cancelamento, liberação ou perda de captura. Não usa estado React por movimento, não navega nem executa comandos em pointerdown. Segundo ponteiro limpa o feedback anterior. Ativação funcional permanece click.
- **Coleção:** hover de cartão e link, inclusive nas folhas CSS herdadas, é restrito a `(hover: hover) and (pointer: fine)`. Foco por teclado e compressão ativa mantêm os mesmos valores. Isso evita aplicar a elevação de mouse como hover sintético persistente em touch; não remove sombras, textura, ornamentos ou animações. Não foi demonstrada necessidade de virtualização: lista e foco continuam íntegros.
- **Tátil:** retirado debounce temporal global de 135 ms, que descartava comandos independentes rápidos. Uma chamada por click delegado, incluindo agora links de fichas e links comuns. Controles desabilitados e aba corrente continuam excluídos; movimento reduzido continua suprimindo o pulso. A ponte é solicitada na captura, antes do handler funcional.

## Vibração Android: limite explícito

Auditados `touchFeedback.ts`, delegação em `App.tsx`, registro anterior ao `super.onCreate` em `MainActivity` e `TactileFeedbackPlugin`. O nativo já usa a UI thread, respeita `HAPTIC_FEEDBACK_ENABLED`, tenta `performHapticFeedback` e só usa Vibrator como fallback. Não foi encontrada evidência que justificasse mudar esse contrato. Não há ADB conectado nesta sessão.

Não se antecipou vibração ao pointerdown: um toque sobre cartão pode se tornar scroll, pan ou gesto cancelado. O click é a confirmação semântica comum a touch e teclado. A remoção do debounce corrige supressão, **não comprova redução da latência percebida da ponte ou do motor físico**. Esse requisito permanece pendente de medição no Moto G06; não declarar resolvido.

## Mundo, inicialização, navegação e RPG

`WorldHost`, residência do mundo, pausas, retomada, carregamento dos modelos, autonomia, narrativa e overlays foram inspecionados e preservados. A R5 já coalesce pedidos de desenho de gestos no RAF: a hipótese inicial de render duplicado foi descartada. Picking real continua atualizando matrizes antes do raycast; bounds dos highlights animados continuam acompanhando personagens e objetos vivos. Não se mudou conteúdo, frequência das animações, renderer, qualidade ou resolução.

O bootstrap aguarda a aplicação/Dexie e então monta React; Three permanece em chunk dinâmico. Medidas existentes de startup e atributos diagnósticos foram coletados. Não houve evidência isolada suficiente para atribuir engasgos de abertura a Dexie, montagem React ou carregamento GLB, nem para introduzir adiamento de conteúdo. Nenhum delay fixo foi adicionado ao produto.

Navegação mantém transições de 140/120 ms e a arquitetura residente. Não espera animação para executar comando. Diálogo de Samael foi aberto e capturado; conteúdo, escolhas e foco não foram modificados. Back, teclado virtual, segundo plano e percepção de transição continuam requerendo o roteiro físico. Não alegamos eliminar todos os engasgos relatados.

## Medições antes/depois

Chromium headless local, viewport 390×844, coleção com 120 registros fictícios, contexto descartável próprio. Captura adicional em 844×390. Performance API no harness, amostragem CDP CPU e dados diagnósticos existentes; sem analytics, conteúdo pessoal ou instrumentação permanente por evento. Coleta ocorreu enquanto a suíte ampla rodava: há contenção, SwiftShader e amostras pequenas. **Não é benchmark Android nem experimento causal de ganho de FPS.**

| Medida | R6 | R7 | Interpretação |
| --- | ---: | ---: | --- |
| Projeções reconstruídas em 60 eventos de pan | 52 | 0 | Teste determinístico; zoom/resize mantêm atualização |
| Atualizações globais da cena no diagnóstico de gesto | 52 | 0 | Somente fixture técnica `crate-01` |
| `setSize` em dois resizes idênticos | 2 | 0 | Teste determinístico |
| Scroll, mediana / p95 / máximo, 59 intervalos RAF (ms) | 16,7 / 16,8 / 33,4 | 16,7 / 33,3 / 33,3 | Sem ganho demonstrado |
| Pan produtivo, mediana / p95 / máximo, 59 intervalos RAF (ms) | 366,7 / 550,1 / 750 | 283,4 / 500 / 600 | Ambiente headless sob carga; não extrapolar |
| Handler sintético de pan, mediana / p95 / máximo, 60 amostras (ms) | 2,65 / 10,8 / 12,6 | 2,4 / 12,1 / 19,3 | Variável; sem melhora consistente |
| Navegação, dispatch síncrono mediano, 12 ativações (ms) | 3,2 | 1,25 | Inclui captura e handler, não ponte nativa |
| Navegação até segundo RAF, mediana (ms) | 99,55 | 99,45 | Aproxima oportunidade de pintura; não apresentação física |
| Dexie bootstrap, uma amostra (ms) | 47,4 | 56,5 | Sem melhoria de startup demonstrada |
| React shell, uma amostra (ms) | 16,5 | 19,3 | Não inclui primeiro frame do mundo |

O perfil do mundo usa instalação descartável vazia (17 selecionáveis); as capturas usam 120 registros. Cada cenário é equivalente entre versões, não entre si. Primeiro frame utilizável observado no perfil: 361,4 → 335,8 ms (uma amostra por build, sem conclusão causal).

Primeiro intervalo RAF descartado por começar antes do instante de registro. p95 usa ordem empírica `floor(0.95*(n-1))`. Tempo do ensaio unitário não é microbenchmark: variou com carga; as contagens são a evidência estável. Dados completos: [antes](evidence/bf5r7/before.json), [depois](evidence/bf5r7/after.json). Perfil CPU preserva nomes minificados; não permite atribuir cada amostra a React/layout/pintura. O harness não mede latência física de entrada nem motor de vibração. RAF tampouco mede GPU.

## Preservação visual

Pranchas com dados fictícios: [R6](evidence/bf5r7/before.webp) e [R7](evidence/bf5r7/after.webp); [comparação por pixels](evidence/bf5r7/visual-comparison.json). Incluem Biblioteca em repouso e selecionada, Coleção e cartão pressionado, detalhe, seleção de categoria e formulário de livro, diálogo, Arquivo, Resumo, Ajustes e Coleção em paisagem. Os SVG, a paleta e os demais valores de estilo não foram alterados. Diferença funcional intencional: hover passa a depender da capacidade do ponteiro e estado pressionado não persiste durante rolagem. Não houve nova avaliação artística humana da R7. Dez estados tiveram zero pixels diferentes; diálogo diferiu em um pixel. O formulário apresentou diferença média de 0,829 por canal (escala 0–255), com mesma geometria e conteúdo na inspeção lado a lado; não se afirma igualdade pixel a pixel nesse estado. As primeiras capturas do formulário tinham transição/scroll em instantes diferentes; foram substituídas por captura estabilizada no topo. Não houve alteração em CSS ou componente do formulário.

## Gates

**Redução de escopo de validação por orientação do proprietário:** durante a execução, o usuário informou cota acabando e pediu prioridade para empacotamento, commit, PR e relatório. A suíte ampla baseline foi interrompida: **15 PASS, 24 FAIL, 1 interrompido e 6 não executados (46 cenários; 14,2 min)**. A ampla final R7 não foi executada. Não há comparação ampla conclusiva de regressões nem gate global verde. [Inventário parcial](evidence/bf5r7/e2e-baseline-partial.json).

Unitário amplo R7: **726 PASS / 1 FAIL, 96 arquivos, 82,10 s**. Falha: timeout de 5 s em `inhabitantAgency` / “enacts autonomous encounters, six mutable pairs, conflict, cooperation and cosmetic repair without collisions”; mesmo nome registrado na R5, sem prova de causa idêntica. Código da agência não foi alterado. Dirigidos: 49 PASS em App/runtime/touch; após ajuste de projeção, 45 PASS no runtime. Format, lint, typecheck e áudio PASS. Lint/typecheck inicialmente apontaram problemas nos testes novos, corrigidos antes da entrega.

Falhas E2E baseline incluem mundo/habitantes e seletores antigos; os três seletores de categorias foram corrigidos na R7, mas não se declara a aprovação desses fluxos sem execução final. Nenhum assert removido, timeout aumentado ou teste desabilitado. O cenário sintético antigo de feedback passou a declarar `isPrimary: true`, como o primeiro dedo real; novo teste cobre cancelamento, liberação e ausência de navegação antecipada. Nova regressão E2E usa contexto touch/mobile e cobre 120 fichas e abertura de detalhe. Três seletores de categoria anteriores à R6 foram atualizados para o prefixo acessível `FÓLIO`, preservando asserts de criação, edição, histórico e citação.

## Roteiro objetivo — Moto G06

1. Instalar o APK debug sobre a instalação existente, sem limpar dados; preservar backup pelo fluxo normal. Confirmar SHA-256 do artefato.
2. Comparar aberturas frias e retomadas com a R6, mesma coleção, orientação e condições térmicas. Anotar tempo até mundo utilizável e pausas percebidas.
3. Arrastar em todas as direções, pinch contínuo, pinch→um dedo→pan, selecionar objetos e quatro habitantes; verificar enquadramento idêntico e ausência de seleção involuntária.
4. Rolar Coleção, iniciar toque e convertê-lo em scroll, cancelar gesto, abrir ficha. Testar volume pequeno e 120 registros fictícios em ambiente descartável, sem substituir dados reais.
5. Testar pulsos em dock, cartão, filtros, salvar e escolhas RPG; duas ativações rápidas independentes; controles desabilitados; pan/pinch e scroll sem vibração. Repetir com feedback Android desligado e movimento reduzido. Registrar separadamente resposta visual, ação e instante percebido do pulso.
6. Cinco abas, detalhes/voltar, seis formulários e edição, teclado aberto/dock/safe areas; notas, citações, ficha de treino/histórico e backup fictício.
7. Abrir/fechar diálogo e quest, escolher opções, voltar à Biblioteca, Back Android, retrato/paisagem/retrato, segundo plano/retomada. Confirmar ausência de loops duplicados e perda de estado.
8. Sessão sustentada e TalkBack: registrar falhas, calor, fluidez e foco. Capturar trace WebView/Android somente com dados fictícios se ainda houver atraso; correlacionar evento JS, chamada nativa e percepção, sem confundir resolve do plugin com vibração efetiva.

Pendências: latência física tátil, jank de startup/pinch/quests e navegação no aparelho, teclado/safe areas reais, TalkBack e dívidas globais de CI. A rodada entrega correções verificadas, mas **não certifica o critério experiencial de sucesso** sem esses resultados.

## Empacotamento e entrega

`npm run android:build:debug` PASS, incluindo build web e Capacitor sync; Gradle `BUILD SUCCESSFUL`, 184 tarefas (27 executadas). `performance:report` PASS: entrypoint 749.202 bytes, chunk dinâmico ThreeWorldRuntime 731.479 bytes; warning conhecido de chunks >500 kB mantido. `git diff --check` PASS. APK não versionado e não instalado em aparelho nesta sessão.

Artefato: `android/app/build/outputs/apk/debug/app-debug.apk`.

SHA-256: `4b912423ea2026b49015f0a26aeb1b91d04982726e207b03ba17f84f527a37f5`.

A entrega mantém a PR #20 draft. Nenhum merge, mudança de versão, schema, backup ou publicação. Critério experiencial e vibração física permanecem pendentes; o pedido final de economia de cota abreviou a validação, não transforma o resultado em aprovação global.

E2E final dirigido R7: **1 PASS (6,6 s)** em contexto mobile/touch, com 120 fichas, cancelamento durante movimento e abertura funcional de detalhes. Primeira tentativa falhou somente no nome esperado do link (`Editar livro`); corrigido para o contrato existente `Editar dados`, mantendo o assert, e reexecutado uma vez. Isso **não substitui a suíte ampla não executada**.
