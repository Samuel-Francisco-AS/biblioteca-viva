# BF-5.7B2.5-R3 — reparos após gate físico

## Base, autoridade e limites

Branch existente `feat/bf-5-7b2-final-cleanup`, [PR #57](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/57).
Base local/remota confirmada `6963a2b6b2e1fcc6369c35896df4961198aebb1e`.
[Gate do proprietário](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/57#issuecomment-6841285178):
primeiro acesso lunar e flashcard persistente PASS dirigido; reentrada lunar,
texto Android e sensação de posição/movimento lunar FAIL. A R2/B2.5 não recebeu
aceite físico integral. Não fechar B2.5 ou iniciar B2.6/B3.

## Gate físico Moto G06 — consolidação de 21/11/2026

O proprietário realizou nova validação física no Moto G06 com o APK debug
`Biblioteca-Viva-BF57B2-PR58-debug.apk`, gerado a partir do HEAD
`2f27ca3e4b363274d14f1d93136b5adc60ac86f5` antes da criação deste commit,
mais as correções locais da consolidação.

Validação funcional aprovada:

- entrada e saída da órbita lunar;
- reentrada pela alternativa acessível;
- reentrada pelo Canvas;
- navegação do Arcanário e das salas educativas;
- criação, edição e persistência de flashcards e questões;
- persistência dos dados no APK validado.

Limitação física registrada, sem métrica nova:

- travamentos durante transições e animações;
- fluidez geral ainda insatisfatória, com sensação de execução travada.

O desempenho não foi aprovado. Nenhum FPS, P95/P99, latência, uso de memória,
temperatura, TalkBack ou teste físico sustentado foi registrado nesta validação.
Os travamentos são mantidos como dívida técnica posterior; não transformam a
conclusão funcional da BF-5.7B em bloqueio automático. Não foi iniciada uma fase
BF-5.7C nesta consolidação.

Alteração local preexistente preservada e fora dos commits:
`docs/audits/evidence/bf56f-refinement/lua-no-mundo.png`, SHA-256
`16dc95bd6a9fceb84fa872849677bd154575aa9e3f20816181d648121c1f1dba`.
As duas novas capturas Android não vieram anexadas ao contexto nem ao comentário
como URLs recuperáveis; foram solicitadas no início. Nenhum dispositivo ADB
conectado, nenhum AVD configurado e `/dev/kvm` ausente. Há imagem API35 x86_64
instalada, mas não houve execução Android compatível nesta sessão. Não se
alega teste em emulador, WebView ou Moto G06.

## 1. Reentrada — causa demonstrada e reparo

`ThreeWorldInteraction.selectObject` deduplica seleção pelo ID. A lua usa essa
notificação para navegar; o mundo residente conservava sua seleção no retorno,
logo o segundo toque não publicava outro evento. O teste do caminho acessível reproduziu
a retenção antes do reparo. A primeira fixture Canvas falhou antes disso porque
o alvo estava fora do viewport; foi corrigida com pan pela entrada normal de
ponteiro, sem mudar a câmera produtiva. O FAIL inicial Canvas não é atribuído
retrospectivamente à retenção; ambos os caminhos passaram após o reparo.

Decisão localizada: o portal é comando de navegação e sua seleção é transitória.
`pauseLoop` limpa **somente** `portal:duelo-arcano` depois de interromper RAF/gestos.
Não altera deduplicação global de seleção, ativação dos habitantes, seleção de
livros/pergaminhos/móveis nem identidade da cena. A limpeza também remove o
helper lunar e usa o callback existente de seleção nula, sem render extra
quando pausado. Ao retomar, o próximo toque publica uma nova seleção lunar.
Essa opção evita ampliar a interface do runtime com um novo barramento de eventos.

Em `pages.tsx`, a intenção lunar permanece retida até `active=false` confirmar
a saída. Callbacks duplicados/atrasados na mesma passagem ou no mundo inativo
não agendam navegações adicionais. O destino continua `/arcanario`.

Novas regressões: três ciclos por raycast real e pelo método usado pelo controle
acessível, sem toque vazio; entrada duplicada na mesma passagem; loops 0/1;
mesmo renderer/objeto; seleção de estante preservada em pausa; três rotas com
host residente e uma chave de navegação por ciclo. O teste Canvas faz um pan
pela entrada normal de ponteiro para colocar a fase inicial fora do viewport
em posição tocável. Não muda a câmera produtiva.

Observabilidade pontual: `data-orbital-world` e `data-orbital-book-ndc` publicam
posição mundial e projeção do centro do grimório na cadência diagnóstica já
existente (250 ms). Não há novo RAF, renderer, timer, backend, log pessoal ou
persistência de métricas. O E2E usa a projeção atual e entrega eventos ao Canvas
para exercitar o raycast; não chama selectObject no caminho Canvas.

## 2. Texto Android — experimentos e limite explícito

O relato em Sinônimos invalida restringir a causa a radios. R3 não apresenta a
mitigação de radio da R2 como solução do defeito físico.

Experimentos isolados em Chromium, viewport 390×844, contexto fictício limpo:

- Formulário original, com seis radios e label normal Sinônimos.
- Painel opaco e ornamentos globais neutralizados, mantendo dimensões/texto.
- Sombras, text-shadow, filters e transforms neutralizados no Arcanário.
- Rolagem e captura durante transição, seguida de captura após término do véu.
- Mesmo formulário após visitar Biblioteca e navegar por Coleção → Arcanário:
  um Canvas residente, runtime paused, zero loops e Canvas invisível.

Todas as capturas apresentam glifos íntegros no desktop, inclusive Sinônimos.
Uma captura intermediária registra o sigilo/texto do véu sobre o formulário
em chegada; a captura estabilizada não tem esse overlay. Isso não prova que
seja a corrupção relatada, pois as capturas físicas recentes estão ausentes.
Spans/labels computados não têm transform/filter/text-shadow próprios.
Retenção de contexto WebGL pausado, por si só, não reproduziu o defeito local.

**Nenhum CSS especulativo foi aplicado na R3.** Não se adicionaram will-change,
translateZ, redução de fonte ou remoção geral da pele cristalina. Permanecem
hipóteses de rasterização/invalidação/composição do WebView, transparência e
transição; nenhuma foi confirmada como causa física. Fragmentação Android
continua FAIL do gate anterior e sem certificação de reparo.

### Safe area é uma investigação separada

O viewport tem viewport-fit=cover; o header usa env(safe-area-inset-top).
MainActivity opera edge-to-edge e Capacitor 8 inclui SystemBars com tratamento
nativo dos insets e variáveis CSS. No Chromium sem barras do Android, header
estabilizado em y=0 com padding-top de 8 px, esperado para inset desktop zero.
Isso não certifica a posição perante a barra física do Moto G06.

A [documentação oficial Android](https://developer.android.com/develop/ui/views/layout/webapps/understand-window-insets)
distingue suporte de insets por versão WebView e alerta sobre padding duplo.
Sem versão WebView/medidas/captura física, não se alterou padding nativo ou CSS
arbitrariamente. Texto sob a barra de status permanece hipótese separada,
não explicação comprovada da fragmentação em labels no meio da página.

## 3. Órbita — matemática, enquadramento e apresentação

Confirmados no código: raio XZ 28, período 420 s, activeDelta independente do
passo de 50 ms dos habitantes, referência temporal zerada em pausa/retomada,
mesma câmera/projeção e mesmo raycast. A R3 não muda raio, velocidade, trajetória,
arte, zoom/pan inicial ou qualidade do mundo.

Comparação com main/marco aprovado F (`690be5b`): geometria e textura do grimório
preservadas (WebP com o mesmo SHA-256), diferença de URL já documentada na R2.
Referências F inspecionadas: lua-detalhe-3d mostra a construção isolada;
lua-anel-mundo mostra o anel arquitetural; lua-no-mundo não contém a lua no
quadro. Esses arquivos não oferecem um par de frames lunares mundialmente
equivalentes às novas capturas físicas. Sem essas capturas, a diferença
percebida de distância não pode ser quantificada por comparação de pixels.

Posição aparente depende da fase, viewport, zoom/pan e oclusão. Em câmera
ortográfica, profundidade não muda escala como em perspectiva. O centro da lua
continua sobre raio 28 mesmo quando sua projeção se aproxima de paredes na tela.
Não se considera isso prova de que a percepção do proprietário esteja resolvida.

### Medições locais de frame

Harness com runtime real, quatro GLBs ready, LivingSession/NightLightingSession,
registros fictícios vazios e viewport 390×844. Três segundos de aquecimento,
seguidos de janela de 4,5 s, sem trace/screencast ou outro gate pesado.
Backend identificado: ANGLE/Vulkan SwiftShader (renderização por software).
Amostras curtas, descritivas; não constituem P95/P99 físico nem benchmark Moto.

| Condição                   | Amostras RAF  | Mediana intervalo | Mediana update CPU | Mediana submit CPU |
| -------------------------- | ------------- | ----------------- | ------------------ | ------------------ |
| Dia 12h, sem seleção       | 26 intervalos | 166,7 ms          | 0,7 ms             | 3,1 ms             |
| Noite 22h, sem seleção     | 10 intervalos | 483,3 ms          | 0,8 ms             | 3,5 ms             |
| Noite 22h, lua selecionada | 10 intervalos | 483,3 ms          | 0,8 ms             | 3,5 ms             |

Dia: 203 draw calls / 217466 triângulos. Noite: 209 calls / 218474 triângulos.
Atualização CPU máxima 1,2 ms; submit máximo 7,1 ms nas janelas estáveis.
Long tasks máximas: 287 ms (dia), 617 ms (noite), 490 ms (noite selecionada).
Velocidade angular efetiva permaneceu 0,014959965017094 rad/s (2π/420),
independentemente do intervalo consumido. Coordenadas/projeção/matrizes da
câmera e timestamps estão no JSON bruto.

A seleção no ensaio padrão fica fora do viewport inicial: não se usa esse par
para concluir custo do destaque visível no Moto G06. O helper usa envelope
transformado, sem scan articulado por frame, e a R3 o limpa após a passagem.

GPU timer query: **não suportado**, zero amostras. Três renders manuais de
controle após pausa, com gl.finish, retornaram espera de 0–0,1 ms; não fornecem
medição confiável do tempo de apresentação nem justificam chamar GPU de rápida.
O harness não observa o instante físico em que o display mostra cada frame.

Conclusão limitada: há frame pacing ruim no backend software, muito pior no
cenário noturno, sem custo dominante demonstrado na simulação JS da órbita ou
dos habitantes. O restante do custo pode estar no pipeline nativo/driver/
rasterização/composição; sua atribuição exige profiling do backend real.
Não se provou que esse seja o gargalo do Moto G06, nem que os E2E vermelhos
sejam exclusivamente ambientais. Não se justifica mudar raio, acelerar a lua,
cortar modelos/luzes ou reescrever Three.js com esses dados.

A menor intervenção segura nesta rodada é a correção funcional de seleção e
sua observabilidade. Não há otimização de FPS física demonstrável sem nova
captura/perfil do aparelho. Para uma correção de stalls, o próximo diagnóstico
precisa correlacionar RAF/update/submit/GPU disponível com frames apresentados
no Moto G06, incluindo versão do WebView, hora/iluminação, zoom/pan e seleção.
Este é débito de R3, não início de B2.6 nem um novo sistema implementado.

## Preservação

Nenhuma alteração em identidade `biblioteca-viva-bf57`, Dexie v19, backup v12,
saneamento TCG, schemas, dados educativos ou mecânicas dos habitantes. Não se
abriu/limpou banco real. O flashcard persistente relatado pelo proprietário é
PASS dirigido histórico, não dado acessado pela automação. Regressões de
Arcanário/Oficina/reabertura e banco/backup/bootstrap continuam obrigatórias.

## Gates e candidata

Resultados finais serão registrados após os comandos, distinguindo os dois
novos E2E de três ciclos dos três cenários gráficos antigos. Nenhum timeout,
retry ou assert essencial dos três casos antigos foi alterado. O orçamento
explícito de 120 s por novo cenário cobre três idas/voltas, readiness, identidade,
raycast/teclado e contagem de navegações; as esperas por estado mantêm 10 s.

O APK debug será produzido após o checkpoint final; SHA de origem, caminho,
bytes, SHA-256 e conferência dist/APK serão registrados no manifesto local e
na própria PR #57. Sem binário versionado, Actions, merge, fechamento B2.5 ou
início B2.6/B3.

### Resultado E2E: separar fixture, reparo e débito antigo

Rodada inicial com 12 cenários: **7 PASS / 5 FAIL**, zero retries. Três FAIL
são os cenários gráficos preexistentes; dois eram os novos cenários R3.

- Canvas R3 completou uma ida/volta, depois a projeção mudou de fase e saiu
  verticalmente do viewport (NDC y≈1,56), apesar do pan horizontal fixo. O
  FAIL foi na pré-condição de alvo enquadrado, não na reativação lunar.
- Acessível R3 avançou ciclos, mas esgotou o orçamento global de 120 s em
  verificações DOM separadas, com 1–6 s por chamada no renderer software.
  A captura continha o botão lunar; não foi demonstrado que estivesse ausente.

Ajuste fundamentado **somente da fixture nova**: enquadrar o alvo atual por
pan normal nos dois eixos antes de cada toque Canvas; agrupar observações
DOM de URL, visibilidade, identidade, quantidade, estado, seleção e loops.
Todas essas asserções permanecem, agora numa leitura coerente por estado;
o teste ainda verifica o Arcanário e a contagem de navegações a cada ciclo.
Controle acessível usa Enter. Nenhuma chamada produtiva a selectObject é
injetada no E2E Canvas; os eventos passam pelo gesto e raycast reais.

Reexecução dirigida dos dois novos cenários: **2/2 PASS**, três ciclos por
Canvas e três por controle acessível, sem toque vazio ou renderer substituído.
A versão final conserva o orçamento de 120 s do novo cenário. Não houve retry
automático, alteração dos prazos antigos ou segunda ampla verde de 12 casos.
Os tempos são próximos do limite no software; não certificam latência Android.

Débitos gráficos reexecutados e ainda **FAIL**:

| Cenário antigo                         | Resultado R3 e estágio observado                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `bf56b-workshop:24`, portal residente  | 30 s; evaluate Canvas 13,25 s, clique Coleção 12,96 s; percurso completo não certificado          |
| `bf56f-orbital-refinement:2`, lunar    | 60 s; chegou a detalhes semânticos/portal visível, não concluiu foco/ativação antes do deadline   |
| `performance-navigation:66`, lifecycle | 30 s; retorno running observado, evaluate identidade 3,22 s no fim do prazo; teste permanece FAIL |

Oficina/Ecos, Relicário, troca autoral, Choices retrato/paisagem, gravação
educativa offline/reabertura e navegação DOM passaram na rodada inicial.
Traces integrais originais em `/tmp/bf25-r3/e2e-initial-results/`; estágios e
logs publicados na evidência da R3. Não se atribui a causa exclusivamente ao
ambiente nem se certifica desempenho pelo PASS dos dois novos testes.

## Parecer de entrega

**Corrigido com evidência local:** reentrada lunar sem limpar seleção
manualmente, três ciclos por cada caminho; mesmo Canvas/renderer e loop;
seleções não lunares preservadas; navegação lunar deduplicada. Global e
regressões dirigidas preservam a persistência educativa e os contratos de dados.

**Não corrigido/certificado no aparelho nesta sessão:** fragmentação dos glifos,
eventual sobreposição à barra de status, percepção de distância e stalls físicos.
Os experimentos e medições delimitam hipóteses, não substituem novo gate Moto.
Não se entrega uma redução artística como se fosse solução de frame pacing.

O novo APK deve ser avaliado pelo proprietário para reentrada (3 ciclos),
texto normal/radios de Assuntos, retrato/paisagem/rolagem/transições, movimento
lunar após 30–60 s e retorno, flashcard após fechar/reabrir e backup v12 com
dados descartáveis. Registrar versão do WebView e hora/iluminação quando houver
artefato. O diagnóstico local já existente pode registrar RAF/update/submit e
GPU quando suportada; isso não constitui autorização de B2.6 ou novo sistema.

B2.5 permanece aberta na PR draft #57. Sem merge, aceite físico integral,
fechamento B2.5, CI ou início B2.6/B3.

### Checkpoint final de validação

Base: `6963a2b6b2e1fcc6369c35896df4961198aebb1e`.
SHA final de código/testes R3: `0867acea80210bbdd7b32883ee312c6387ed2536`.
O commit posterior apenas publica este relatório e evidências. O SHA exato
desse HEAD utilizado no APK consta na PR #57 e no manifesto local, sem criar
uma autorreferência ao hash do próprio documento.

| Gate executado                                                                         | Resultado                                                 |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| lint global                                                                            | PASS                                                      |
| lint type-aware da fixture E2E final                                                   | PASS                                                      |
| typecheck, repetido após a fixture final                                               | PASS                                                      |
| build                                                                                  | PASS; aviso conhecido de chunks >500 kB                   |
| Vitest global isolado                                                                  | PASS, 183 arquivos / 1221 testes                          |
| Dirigidos interação/runtime/órbita/host/rotas/Choices/Arcanário/banco/backup/bootstrap | PASS, 12 arquivos / 234 testes                            |
| E2E inicial de 12 cenários                                                             | FAIL, 7 PASS / 5 FAIL                                     |
| Novos E2E R3 após ajuste da fixture                                                    | PASS, 2/2, três ciclos por cada caminho                   |
| Três E2E gráficos antigos                                                              | FAIL, deadlines preservados                               |
| Prettier runtime/órbita/novo E2E                                                       | PASS; arquivos pages têm passivo histórico fora do escopo |
| git diff --check                                                                       | PASS                                                      |
| Android/Moto G06, TalkBack, termal/memória físicos                                     | Não executado                                             |
| GitHub Actions                                                                         | Não executado                                             |

Não houve nova ampla de 12 E2E verde. A ampla Vitest foi anterior à compactação
exclusivamente da fixture Playwright; depois foram executados o novo E2E,
lint type-aware, typecheck e os 234 dirigidos. Não se repetiu a suíte global
sem alteração produtiva que justificasse esse custo.

### Recuperação do APK

Artefato esperado: `android/app/build/outputs/apk/debug/app-debug.apk`.
Cópia estável da R3 e metadados ficam na mesma pasta; manifesto:
`BF57B25R3-apk-provenance.json`. O manifesto e a PR registram comando
`npm run android:build:debug`, origem, variante debug, applicationId, bytes,
SHA-256 e comparação por hash entre os assets de dist e do APK.
A pasta de build é ignorada pelo Git; não há APK ou chave em commits.

### Artefato validado pelo proprietário

O APK usado no gate Moto G06 foi nomeado
`Biblioteca-Viva-BF57B2-PR58-debug.apk`. Ele foi gerado a partir do HEAD
`2f27ca3e4b363274d14f1d93136b5adc60ac86f5` mais alterações locais não commitadas
da correção documental/E2E; portanto, não corresponde a um commit já existente.

- tamanho: 11.644.813 bytes;
- SHA-256: `9744344d5bf1c41f0edd892ef9a5266db6d2399ae8044e8a3f379161f763c7f6`;
- build: `npm run android:build:debug`;
- original reproduzível em `android/app/build/outputs/apk/debug/app-debug.apk`;
- cópia nomeada em `android/app/build/outputs/apk/debug/Biblioteca-Viva-BF57B2-PR58-debug.apk`.

O gate físico aprovou os aspectos funcionais registrados acima. O fluxo não
representa aprovação de desempenho, TalkBack, P95/P99, térmico ou memória.
