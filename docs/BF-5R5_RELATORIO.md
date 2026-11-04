# BF-5R5 — Refinamento artístico, categorias e fluidez (candidata)

Data da rodada: 2026-11-03–04. Branch: `feat/bf-5-uiux-global-rework`. SHA inicial: `fe770962d83ec20b4ff7ce5636e28e13d389a32f`. Checkout inicial limpo; `git fetch origin`, checkout explícito e merge `--ff-only` confirmaram sincronização. A PR [#20](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/20) foi confirmada aberta, utilizável e draft pelo conector GitHub. Sem trabalho em main, PR nova ou merge.

## O que foi preservado da R4

Pátio circular, pisos, composição ambiental, distância/profundidade da câmera ortográfica, zoom inicial 1 e correção do primeiro delta de pan permanecem. Nenhuma alteração em `CameraNavigation`, `ThreeWorldInteraction`, `cameraMath` ou `proceduralLibraryBuilding`. Não há workaround de zoom, máscara inferior, recorte novo, mudança de coordenadas de picking nem redução da cena/modelos. A Fundação segue WorldHost → ThreeWorldRuntime → Three.js; não há contrato/persistência espacial nova.

## Direção e trabalho artístico/ergonômico

A R5 usa o trabalho de um encadernador como continuidade da linguagem R4: folhas e instrumentos com bordas suaves, costuras/disclosures mais claros, latão nos comandos e campos com superfície encaixada. A revisão percorre controles comuns, fichas, formulário, edição/detalhe, cartões de Coleção, cabeçalhos, Arquivo, Resumo, Ajustes, HUD, diálogo e diário. Campos numéricos/textuais têm tamanho legível em touch; exercícios se organizam em pares, com toque/alvo e remoção explícita. Não foram adicionados assets externos ou fontes remotas.

Ações principais têm compressão curta em transform e relevo, foco visível e estados desabilitados. O tempo opcional sai do corpo principal de registro manual para um disclosure; o cronômetro também fica recolhido quando não está ativo. A exclusão genérica fica em “Cuidar deste registro”, com confirmação. O cabeçalho e a gravura R4 permanecem, com nova proporção de bordas/espaços/camadas. A nova folha de treino e a apresentação de memórias são mudanças estruturais, além das superfícies compartilhadas. Os retratos de detalhe são específicos: créditos/duração/plataforma para filme, marcador episódico para série, intenção e avanço para estudo, modalidade/ficha para prática e próxima ação destacada para trabalho. Aceite de arte e sensação artesanal continuam humanos.

## Desempenho: causas, intervenções e limites

### Reconstrução entre abas

O checkout R4 desmontava LibraryPage/WorldHost em cada rota; voltar implicava renderer, cena, materiais, carregamentos e listeners novamente. A R5 monta a Biblioteca somente na primeira visita e conserva uma residência pertencente ao shell. Fora da rota fica `hidden`/`inert`, com `pause()` do runtime: RAF, gesto e agência suspensos. Retorno faz resize/resume, preservando a mesma câmera/canvas quando não houve alteração representada. Uma fábrica que termina de carregar depois da saída é imediatamente pausada. Destruir o shell/aplicação continua descartando o mundo.

Reconsulta no retorno compara a projeção lógica: identidade igual evita remontar; título/progresso/criação/exclusão representados diferentes provocam a substituição segura já existente. Essa substituição pode reiniciar câmera e seleção; **não prometemos preservação de câmera após toda mutação**. Falha terminal tem botão de nova tentativa e fallback convencional. Não há cache global de WebGL, serviço remoto ou persistência narrativa nova. Histórias da visita permanecem ao trocar abas e reiniciam ao recarregar.

O tradeoff é conservar memória de uma cena enquanto o shell vive. O sistema Android ainda pode encerrar o processo. Recuperação de dados convencionais, contexto WebGL, rotação e pressão de memória precisam de validação física específica.

### Trabalho por frame e React

`renderCurrentFrame` contava todos os objetos via `traverseVisible` em cada desenho. A contagem passa para a publicação diagnóstica de 250 ms, preservando a taxa de animação/desenho. Teste exige 3–4 travessias em 60 frames simulados, mantendo métricas não vazias, em vez de uma travessia por frame. Isso mede redução de trabalho específico; não é estimativa de ganho percentual de FPS.

Diagnósticos e snapshot semântico de habitantes atualizavam o estado de WorldHost quatro vezes por segundo. Agora as assinaturas ficam em `WorldDiagnosticPanel` e `InhabitantRuntimeLife`; atualizar essas métricas/listas não recompõe o diálogo e o restante do host. Dados/formulários continuam pela aplicação, sem React importar Dexie.

Não foram simplificados personagens/cenário, inventados budgets ou escondido trabalho com timers. A navegação mantém chegada de 140 ms e o painel tem chegada de 120 ms em opacity/transform; não há blur novo, sequência longa ou bloqueio artificial de navegação. Os formulários continuam inputs locais; não foram introduzidos estados globais de cada tecla. Bundle continua com warning >500 kB; tamanho de build não comprova fluidez. CPU/GPU e jank físico no pan/pinch continuam sujeitos ao roteiro Moto G06.

## Os seis tipos: criação, edição, detalhe e histórico

| Tipo | Experiência implementada |
| --- | --- |
| Livro | Folha de rosto, marcador/páginas, avaliação e estado R4 preservados; sessões com página inicial/final, nota e tempo opcional. Histórico passa a mostrar páginas e conteúdo da nota. Após sessão o detalhe/progresso é recarregado. Notas/citações continuam editáveis/compartilháveis no fluxo existente. |
| Série/anime | Criação admite temporada/episódio e episódios já assistidos. Detalhe tem marcador de temporada/episódio e total assistido; progresso visível e ação de registrar episódios sem exigir minutos. História de episódios e citações localizadas em temporada/episódio. Contagem e marcador são explícitos: não se inventa tamanho de temporada nem se avança temporada automaticamente. |
| Filme | Obra/direção/ano/duração/plataforma preservados; exibições e reencontros com dia/nota e tempo opcional. Memórias “Depois dos créditos” acolhem opinião e falas; citações admitem minuto da cena. Registrar exibição não infere conclusão; iniciar/concluir são ações de estado explícitas. |
| Estudo | Área, disciplina, objetivo, unidade/meta/prazo mantidos; unidades traduzidas e minutos de armazenamento exibidos em horas quando aplicável. Trilhas mostram avanço/meta. Sessões de horas/sessões alimentam progresso; outras unidades têm atualização explícita. Caderno guarda descobertas, materiais e referências em notas. |
| Atividade física | Categoria passa a ser editável; força/mobilidade/mista oferecem ficha de exercícios com nome, séries, repetições, kg, segundos e observação. Ficha existente é preservada no editor inclusive se a categoria muda. Execução em diferentes dias captura cópia da ficha; alterações futuras não reescrevem história. Histórico mostra exercícios, esforço, nota e dias de prática distintos. Distância aparece no formulário de cardio, não no treino de força; valores antigos permanecem no histórico. |
| Trabalho | Intenção, descrição, área/organização, próximo passo/prazo e estado; histórico “Passos realizados” guarda resultado/nota/tempo opcional. Pausa/retomada claras, sem números fictícios ou checklist/percentual inventados. |

Nos detalhes genéricos, notas/citações agora permitem criação, edição, exclusão e compartilhamento, com textos por categoria. Rascunhos de nota e citação são separados durante troca de tipo. Editar uma citação fora de livro não oferece página de livro e preserva a localização contextual. Tags/favoritos continuam pelo painel de organização. Datas de conclusão/prazo aparecem quando existem. Erros de ação não desmontam a ficha. A ação Concluir em planejados executa as transições válidas, mantendo visível o início se a segunda operação falhar. Sessão e registro têm nomes de pausa/retomada distintos.

Não foram adicionados nota numérica de filme/série, previsão de temporada, check por série de exercício, progressão percentual de trabalho nem checklist estruturado. Opinião, materiais e decisões usam notas existentes. Esses itens opcionais do pedido não foram apresentados como funções prontas. A ficha de treino é uma lista reutilizável enxuta; não pretende ser um app completo de academia.

## Dados, migração e backup

[ADR-015](decisions/ADR-015-bf5r5-residencia-e-fichas.md) registra Dexie **v9 aditiva**, com as mesmas tabelas/índices; v8→v9 só atualiza o marcador, sem limpeza. Campos `exercises?` da atividade e da sessão são opcionais/estritos e têm nome/séries/repetições/kg/segundos/observação. A aplicação captura uma cópia no início ou registro manual; domínio valida e congela as listas/itens. Entrada externa inválida é rejeitada.

Sessões manuais/editadas aceitam duração zero para tempo não informado. Estudo em horas sem tempo informado passa a iniciado, mantendo zero minutos de progresso, com regressão específica. Não se fabrica um minuto para satisfazer um formulário; sessões cronometradas e valores antigos continuam válidos. O formato de backup segue v6, com campos opcionais novos nos schemas estritos, checksum e fluxo protegido preservados. Backups v6 de banco v8 continuam aceitos. Aplicativos antigos podem rejeitar os campos novos: **importação de fichas para uma versão anterior não é suportada**. Não mudou versão de pacote, assinatura, backend ou políticas de restauração.

O teste v8→v9 verifica seis tipos, notas/citações/sessões/etiquetas/preferências, reabertura e round-trip das novas fichas e cópias de execução no codec. A suíte existente verifica transações e publicação pós-commit. Nenhum dado real foi limpo/restaurado; fixtures e capturas são fictícias.

## Microinterações, haptic, quest e diálogo

Captura de ativação em controles importantes solicita um pulso `navigator.vibrate(8)` quando suportado, com intervalo mínimo de 180 ms. Não há vibrar no movimento do canvas. Movimento reduzido efetivo desabilita o pulso; ausência ou negação da API não impede a ação. Android declara a permissão normal VIBRATE, sem plugin/dependência nova nem prompt de permissão. O retorno booleano da API não é interpretado como prova de sensação física. Não há preferência de vibração separada nesta candidata; movimento reduzido desativa o recurso.

Foi reproduzido um erro concreto de posicionamento no fallback: o ancestral de exploração conservava `backdrop-filter: blur(17px)` por especificidade de CSS. Ao ficar estático/sem altura durante conversa, ele se tornava o bloco de referência dos descendentes fixed, posicionando o diálogo em y=−815,98 numa viewport 390×844. Uma regra explícita sem backdrop-filter moveu o painel para y=28,02 e permitiu clicar a escolha seguinte. Evidência diagnóstica em `artifacts/bf5r5/dialogue-position.json` (fix injetado durante a prova); o E2E da fonte final está registrado abaixo. A correção também remove o blur efetivo do dock/bússola/comandos, sem alterar canvas ou câmera. A primeira compilação ainda falhou em três E2E (7 PASS/3 FAIL na rodada de dez): o asset minificado conservava somente `-webkit-backdrop-filter: none`, sem o reset padrão efetivo neste Chromium. Reordenadas as declarações para manter a propriedade padrão no build, com verificação explícita do asset antes da regressão final. Não foi repetido E2E/timeout sem hipótese nova.

Diálogo/diário usam camadas sólidas sem blur e transição curta; escolhas mantêm chaves/estado narrativo e têm pressão/foco legíveis. Sair da aba fecha conversa e suspende encenação; a visita/narrativa continua disponível ao retornar. Sem reescrita das histórias, escolhas, consequências ou sistemas BF-6. Back/teclado/foco continuam pelos caminhos existentes, sem listener de exploração ativo na aba oculta.

## Verificação e rastreabilidade

Uma rodada dirigida intermediária passou **159 testes em 13 arquivos**. Após isolamento dos diagnósticos, um teste do host precisou aguardar a assinatura do componente filho; o assert foi preservado com `waitFor`. A rodada ampla intermediária teve **719 PASS / 1 FAIL em 95 arquivos**, 52,58 s: timeout de 5 s em `inhabitantAgency` / “enacts autonomous encounters, six mutable pairs, conflict, cooperation and cosmetic repair without collisions”. O nome coincide com a falha R4; a mesma causa não foi demonstrada. Não houve relaxamento de timeout/asserção nem declaração de suíte global verde.

E2E dirigido intermediário: **8 PASS / 1 FAIL em 1,3 min**. Passaram criar/reabrir/editar seis tipos, pan retrato/paisagem, dock, canvas residente/câmera/pausa/rotação, ficha de força/histórico, série/citação e ciclo principal de livro. FAIL de sessões: seletor “Pausar” ambíguo após adicionar pausa de registro. Corrigidos nomes explícitos de sessão e registro, preservando a cobertura de pausa/retomada.

**Execução ampla descartada como gate final:** um erro de JSX no ajuste de plural fez o build falhar; um encadeamento de shell sem `&&` iniciou E2E no build anterior. Foi interrompido para proteger cota: 4 FAIL / 1 interrompido / 39 não executados. Não valida a fonte final. O JSX foi corrigido e a nova sequência exige formato/build aprovados antes do E2E. Capturas iniciais eram do build anterior; o inventário final indica seu estado. Esse incidente não é atribuído a falha do produto nem ocultado como PASS.

### Gate final da candidata

- `npm run format` / `format:check`: PASS na fonte entregue.
- `npm run lint`: PASS; `npm run typecheck`: PASS.
- `npm run audio:check`: PASS (dois WAV locais).
- `npm run build`: PASS antes do E2E amplo, warning existente de chunks >500 kB mantido.
- `npm run performance:report`: PASS: entrada JS **747.417 bytes** e chunk ThreeWorldRuntime **731.413 bytes** no build final (a candidata ampla tinha 745.416 bytes de entrada). É relatório de bundle, sem alegação de redução de payload.
- Regressão dirigida após correções: **153 PASS / 13 arquivos**, 20,99 s. Inclui residência/fábrica tardia/retry, refetch sem snapshot obsoleto, contagem por cadência, haptic, migração/backup, sessões, editor e detalhe.
- E2E amplo: **19 PASS / 25 FAIL**, inventário completo abaixo. Regressão final dirigida após os ajustes e fix de posicionamento registrada abaixo, sem repetir a suíte ampla.

## APK

`npm run android:build:debug` executou `npm run android:sync` (incluindo TypeScript/build e Capacitor sync) e `assembleDebug`: **PASS**, `BUILD SUCCESSFUL in 2s`, 184 tarefas (27 executadas/157 up-to-date). Warnings existentes de chunks >500 kB e `flatDir` mantidos. Nenhuma dependência ou versão de pacote mudou.

- Arquivo: `android/app/build/outputs/apk/debug/app-debug.apk`
- Tamanho: **10.568.395 bytes**
- SHA-256: `f4dc7799d5fd45e0490c59a595e15a5ba29d9f543e00521f32b69c0a4e9db390`

O APK anterior desta rodada foi substituído após a correção do CSS compilado/edição de citação. Este hash identifica o artefato final. Não há instalação, assinatura de release ou publicação.

## Roteiro físico Moto G06

1. Exportar backup de segurança antes de instalar sobre o desenvolvimento. Não limpar dados. Confirmar que os seis tipos e referências antigos permanecem após upgrade/reabertura.
2. Abrir Biblioteca sem zoom: conferir pátio até a base, composição/seleção visual. Arrastar curto/longo em cinco cômodos; pinch em extremos; pinch→um dedo→pan; tap em registros, habitantes e objetos.
3. Trocar cada aba e voltar várias vezes: câmera continua quando os dados não mudaram, sem quadro de reconstrução; nenhuma simulação/som/gesto ativo da aba oculta. Girar retrato/paisagem, sair/retomar o app, abrir diálogo/diário, adiar e continuar história. Testar recuperação da superfície se o contexto se perder. Registrar vídeo/engasgos sem atribuição prévia de causa.
4. Criar/editar/reabrir os seis tipos com fixtures. Livro: páginas/sessões/citação. Série: temporada/episódio, total, episódio concluído sem tempo, citação localizada. Filme: exibição/reencontro, impressão e conclusão explícita. Estudo: horas fracionárias/metas/prazo e sessão. Trabalho: próxima ação/resultado/pausa. Conferir datas e traduções.
5. Força “peito e tríceps”: ficha com exercícios/séries/repetições/kg/tempo; executar em dois dias, mudar carga e confirmar snapshot antigo. Cardio: distância e esforço, sem exigir ficha de força. Verificar frequência e histórico; editar nota/duração de uma experiência sem perder exercícios.
6. Abrir teclado nos primeiros/últimos campos, rolar ficha longa, remover/adicionar exercícios, salvar com erro, cancelar e voltar. Testar texto grande, contraste, redução de movimento, safe areas, dock, modais, vazios e Back. A simulação web de viewport não substitui teclado Android real.
7. Sentir resposta de botões/dock/escolhas: pulso leve e espaçado; pan/pinch não vibram; reduzir movimento desliga. Registrar se a WebView/dispositivo ignora a API. Validar TalkBack separadamente, sem inferir PASS por semântica DOM.
8. Comparar pan/pinch/abertura de diálogo/abas em sessão sustentada. Observar temperatura, memória/encerramento do processo e retomada limpa; não considerar um timeout SwiftShader ou bundle como benchmark Android.
9. Exportar/inspecionar backup fictício com fichas e histórico. Restaurar apenas em instalação descartável autorizada. Aceite artístico e encerramento da BF-5 dependem do proprietário; PR permanece draft, sem merge/release.

## Limitações mantidas

Sem PASS físico R5, TalkBack, intensidade tátil percebida, benchmark sustentado, aprovação artística ou conclusão BF-5. Falhas E2E/CI prévias não foram dispensadas (#4/#11/#15 e demais registros R4); R-19 e validações assistivas anteriores mantêm seu estado. A regressão dirigida não transforma os resultados amplos documentados em gate integrado verde; a CI do push tem seu próprio estado.

## E2E amplo — resultado preservado

`npm run test:e2e`: **19 PASS / 25 FAIL, 44 testes, 14,6 min**. A candidata ampla tinha build aprovado. Esta rodada precede os últimos ajustes de retratos/campos, o tratamento do estudo sem tempo e a correção do ancestral com blur. A fonte final terá regressão dirigida, sem repetir toda a suíte ampla. Nenhum assert foi omitido, timeout ampliado ou teste removido/desabilitado. Inventário legível por máquina em `artifacts/bf5r5/e2e-broad-results.json`.

- FAIL: e2e/bf4-environment.spec.ts:6:1 › BF-4D: ambiente integrado em paisagem/retrato, zoom, pan e seleção
- FAIL: e2e/bf4-environment.spec.ts:94:3 › BF-4D: coleção cheia explora cinco cômodos e quatro conexões em 1280px
- FAIL: e2e/bf4-environment.spec.ts:94:3 › BF-4D: coleção cheia explora cinco cômodos e quatro conexões em 390px
- FAIL: e2e/bf4-inhabitants.spec.ts:7:3 › BF-4F1 four inhabitants world
- FAIL: e2e/bf4-inhabitants.spec.ts:7:3 › BF-4F1 four inhabitants fallback
- FAIL: e2e/bf4-inhabitants.spec.ts:42:1 › BF-4F1 canvas selects all four loaded models
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 samael: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 aryn: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 ytha: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:68:3 › BF-4F2 lua: directed actions in the five-room world
- FAIL: e2e/bf4-inhabitants.spec.ts:111:1 › BF-4F3 spontaneous life and honest reduced-motion semantics
- FAIL: e2e/bf4-living.spec.ts:6:3 › BF-4E: segredo completo no mundo
- FAIL: e2e/bf4-living.spec.ts:69:1 › BF-4E: tocar a luminária executa e repete ação sem botões React
- FAIL: e2e/bf4-rpg.spec.ts:8:3 › BF-4F4 RPG choices, objective, resume and conclusion from canvas
- FAIL: e2e/bf4-rpg.spec.ts:8:3 › BF-4F4 RPG choices, objective, resume and conclusion without WebGL
- FAIL: e2e/bf5-ui.spec.ts:3:1 › BF-5: five realms, density and narrative Back in the semantic fallback
- FAIL: e2e/r4-shell.spec.ts:54:1 › shell abre a Biblioteca com uma única superfície Three.js
- FAIL: e2e/r4-shell.spec.ts:114:1 › interação desktop conecta picking, pan, zoom e seleção React
- FAIL: e2e/r4-shell.spec.ts:201:1 › viewport mobile mantém tap, pan, pinch sintético e alternativa React
- FAIL: e2e/r4-shell.spec.ts:313:1 › Biblioteca preserva a mesma superfície em portrait, landscape e viewport estreito
- FAIL: e2e/r4-shell.spec.ts:384:1 › dez ciclos de rota não acumulam canvases, loops ou interação
- FAIL: e2e/reading-area.spec.ts:41:1 › livros convencionais preservam identidade entre lista, runtime, seleção e retorno
- FAIL: e2e/reading-area.spec.ts:158:1 › retornos da Biblioteca preservam um canvas pausado e um único snapshot
- FAIL: e2e/reading-area.spec.ts:188:1 › seis tipos abrem pela Biblioteca e preservam edição e retorno
- FAIL: e2e/search-and-backup.spec.ts:48:1 › backup web real é baixado, validado, restaurado e persiste

Todos os 25 casos possuem correspondentes na lista FAIL ampla da R4; o teste de retorno foi renomeado para o contrato de residência, preservando verificação de contagem e loops. Isso é coincidência nominal, não prova de mesma causa. A R4 ampla tinha 9 PASS/31 FAIL; a R5 ampla tem 19 PASS/25 FAIL com quatro casos a mais, portanto a comparação bruta não é benchmark nem gate verde. Passaram os três E2E R5, os três R4 dirigidos, fichas Coleção/detalhe, HUD/toque, livro/notas/citações/edição/conclusão, seis tipos P1, etiquetas/favoritos/sessões/estatísticas, navegação convencional, vazio/overflow, busca/Arquivo e rejeição de backup inválido.

Triagem concreta: BF-4D ambiente expirou na captura do canvas; coleção cheia exigiu 83 botões de seleção enquanto a alternativa estava recolhida; vários testes F1/F2 aguardaram summary de Habitantes não visível; provas antigas de picking usam câmera inicial 0,7 e posições fixas, divergentes da câmera R4 atual. Os FAIL de RPG fallback/BF-5 Back reproduziram diálogo fora da viewport pelo backdrop-filter ancestral, com correção localizada e regressão posterior. Outros casos (incluindo backup/download e seleções antigas) continuam sem causa encerrada. Não atribuímos todos a SwiftShader nem ao produto.

## Regressão final e inspeção visual

Após o reset efetivo no CSS de produção, a rodada de seis teve **4 PASS / 2 FAIL em 1,6 min**: os três fluxos R5 e o novo teste de entrada do mundo passaram. Os dois FAIL já avançaram além do posicionamento corrigido e identificaram expectativas antigas dos testes: o nome acessível de Fenda inclui o sigilo decorativo, e o botão de contagem do diário fica recolhido enquanto o diário está aberto. Ajustado o seletor de Fenda sem remover o alvo e fechado o diário antes de exigir o contador. Preservadas as escolhas, epílogo, contagem, Back, navegação e invariância dos registros. Reexecução **2 PASS / 2, 12,0 s**.

Os seis cenários finais estão aprovados **em duas execuções (4 + 2 PASS)**:

1. Identidade de canvas/câmera, zero loops fora da aba, um loop ao retornar e rotação.
2. Ficha de força, execução datada, esforço e snapshot histórico independente da edição da carga.
3. Série com marcador/episódios sem minutos, criação/reabertura/edição de citação contextual, sem página de livro indevida.
4. Pinch após retorno, ausência de seleção acidental, seleção/highlight semântico, abertura de Samael e clique de escolha no mundo residente.
5. RPG no fallback: escolhas, adiar/retomar, diário, final em retrato e paisagem, contador, dados convencionais invariantes e retorno à Coleção.
6. Cinco abas, Back de diálogo, densidade, contraste de layout e largura em paisagem; o teste exige backdrop padrão `none` e painel dentro da viewport.

A rodada anterior de dez, ainda com reset perdido na minificação, ficou **7 PASS/3 FAIL** (os três no posicionamento do diálogo). Seus PASS incluíram os três casos R4, sessões/estatísticas e os três casos R5. Não apresentamos essas rodadas como uma suíte ampla verde. O amplo **19 PASS/25 FAIL** e o unitário amplo **719 PASS/1 FAIL** permanecem registrados; não houve repetição global após refinamentos locais.

A edição de anotações/sessões recebeu mais uma regressão dirigida **10 PASS / 2 arquivos**, 2,42 s, após remover o campo de página fora de livros. São testes que se sobrepõem parcialmente à rodada de 153; não somamos como se fossem testes distintos.

Galeria final em `artifacts/bf5r5/`: editores/detalhes dos seis tipos, Coleção/Arquivo/Resumo/Ajustes, Biblioteca e diálogo real do build de produção. Somente conteúdo fictício. Os editores e retratos foram inspecionados visualmente; a coleta final substitui as primeiras capturas convencionais. `dialogue-position.json` preserva o diagnóstico com CSS injetado; `dialogue-position-final.json` verifica o build de produção sem injeção. Capturas locais e redução de movimento não são prova de uso/arte/teclado físico.

`git diff --check` limpo na revisão final. Branch/PR permanecem as autorizadas; nenhuma alteração de dados reais, commit em main, PR nova, merge ou fechamento BF-5.
