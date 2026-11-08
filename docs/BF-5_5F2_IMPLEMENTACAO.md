# BF-5.5F2 — Interações físicas e atividades reais

Candidata de implementação sobre `main` integrada `5b4be9a2495d74797dabe519242492f2d8562e8f`, em `feat/bf-5-5f2-interacoes-fisicas`. Preparação: fetch de `origin/main`, fast-forward local, HEAD conferido e worktree limpa antes de criar a branch. Uma PR draft, sem merge; commits com `[skip ci]`. **BF-5.5 não concluída. BF-5.5G não iniciada.**

## Autoridade e arquitetura

A autorização F2 do proprietário sucede a recuperação R1–R5 aceita com ressalvas. O contrato F1 continua vindo exclusivamente de sessões confirmadas pela aplicação. A agência recebe a projeção mínima em `AgencyEnvironment`; não consulta Dexie nem cria sessões. Mantidos Dexie v14, backup v6, IDs, seis registros, seleção Canvas/React, WorldHost/ThreeWorldRuntime e o RAF principal.

`InhabitantAgency` continua dona das tarefas, posição, orientação e rotas. `InteractionCoordinator` continua dono dos leases; ocupação de um assento é uma informação separada da reserva. `inhabitantAnimator` continua o único mixer por habitante. Fases de contato usam tempo da agência para amostrar o clip; poses transitórias não entram no checkpoint durável. A restauração BF-5.5A/R4 valida novamente a geometria e consulta F1, sem restaurar uma pose sentada ou um lease antigo.

## Leitura — complemento F2A

O núcleo original de estante → mesa, abertura, brilho e retorno foi preservado. A mesa permanece o fallback autônomo quando não há participante elegível. O complemento procura aproximações a partir do **alcance medido no socket do GLB carregado**, valida rota/envelope e reserva leitor e assento. Um gesto sem contato não autoriza transporte nem leitura sentada. **Samael e Aryn são os participantes habilitados ao recolhimento pessoal nesta candidata. Lua e Ytha conservam o fallback autônomo:** seus contatos de recolhimento não foram certificados, embora possuam os clips e possam ocupar assentos/estudar. O habitante recolhe o volume na mesa após o percurso autônomo já existente da estante; não se afirma retirada manual da estante.

A anexação usa o mesmo wrapper `reading-book:<entryId>`, reparentado ao `socket_carry`. Não cria outro volume, outro `instanceId` ou outra representação do registro. O controlador do livro continua único; enquanto a mão o possui, o voo autônomo não escreve sua transformação. A agência valida os passos físicos pelo mesmo controlador antes de avançar; soltura/interrupção percorre o caminho de mão inverso e depois o percurso original até a estante, mantendo o objeto selecionável.

A pega usa a borda vertical do volume fechado, em altura interna válida para o alcance anatômico; o punho conserva a orientação entre recolhimento/transporte/leitura. A manga recebeu correção de alcance de 2,5 cm por cinemática inversa assada na receita. A mão toca a borda, sem articulação individual dos dedos.

O envelope varrido de uma rotação usa os envelopes nas extremidades mais `2*r*sin(ângulo/4)`: todo ponto intermediário está a essa distância máxima da orientação extrema mais próxima. É uma verificação conservadora do volume completo, sem substituir uma pequena rotação de punho por uma esfera que penetre falsamente o tampo.

## Assentos e estudo — F2B

Assentos funcionais da leitura (`bf4-prop:2`) e estudo (`bf4-prop:9`) têm almofada, armação, pernas e apoio lombar com volumes físicos separados do bloqueio de navegação. A aproximação usa o grafo existente; somente o collider do **próprio assento reservado** é excluído no trecho final de acesso. Obstáculos restantes e o raio integral de Ytha continuam ativos. Reserva ocorre antes do percurso; ocupação começa apenas ao iniciar a transição no assento. A liberação acontece após levantar e alcançar a saída segura.

A geometria necessária ao contato foi ajustada: assento a 0,42 m, frente livre para as pernas, apoio lombar recuado e posição de aproximação própria para Ytha. Não é uma reforma ornamental. As nove luminárias e o ritual permanecem preservados; a luminária da leitura conserva a âncora original. Para manter o grafo e as folgas reais, a leitura recebe um único assento funcional à esquerda; o estudo usa o corredor lateral e assento traseiro. A bancada `bf4-prop:11` foi deslocada 20 cm e dois slots de estudo 20/17 cm para trás, preservando IDs e tipos. A regressão conserva todas as rotas válidas/inválidas e os obstáculos históricos R1. Não há persistência espacial nem migração.

Os quatro rigs R5 são preservados e ampliados por receita editável. Draperia acompanha as coxas e dobra atrás do quadril, pés ficam apoiados nas transições e as asas se articulam sem reduzir seu envelope de navegação. `sit(t)` e `stand(duração-t)` permitem cancelar sem redefinir a pelve. Estudo possui consulta e escrita, com materiais próprios; não usa uma sessão fictícia nem um segundo livro pessoal.

## Atividades — F2C

- Trabalho reserva `surface:bf4-prop:16`, alcança a bancada correta e usa gesto manual e materiais de ofício próprios.
- Treino reserva `surface:bf4-prop:14`, alcança sua área livre e alterna mobilidade de ombros/corpo com recuperação. Não há combate, XP, habilidade ou cópia do equipamento. A barra permanece na estação; não se afirma levantamento de peso sem contato demonstrado.
- Entretenimento alcança e observa a área de `bf4-prop:6`, com orientação e movimentos de atenção próprios. A ocupação sentada dessa área não é promovida: a aproximação ampla de Ytha encontrou bloqueio na composição existente. A resposta usa observação em pé, sem reprodução de vídeo nem sessão inventada. Assentos de leitura e estudo permanecem funcionais.

## Interrupções e continuidade

Pausa de sessão, conclusão, troca de sessão/registro e conversa solicitam saída segura. Cancelar durante sentar inicia o trecho inverso de levantar. Um comando manual aguarda a liberação física antes do gesto solicitado. Narrativa e rotina casual não substituem uma tarefa física confirmada em execução. Um corredor ocupado provoca espera/replanejamento; não se reduz raio ou atravessa outro habitante. Expiração e perda de leases são verificadas pelo coordenador existente.

Background e troca de abas congelam o relógio e os poses transitórios da tarefa residente. Descarte/remount/WebGL perdido libera os recursos antes de descartar a árvore; a próxima montagem reconcilia continuidade e sessão. Movimento reduzido impede novas tarefas e permite a saída funcional necessária. A ausência de WebGL conserva a interface semântica e a sessão real.

## Evidências, gates e limites

A rodada dirigida final executou **266/266 testes em 31 arquivos**. Capturas usam registros fictícios e os GLBs reais. Teste de código, raycast, triângulos e imagem headless **não** equivalem a aceite artístico, desempenho Android, TalkBack ou validação humana de contato. As dívidas históricas de CI/E2E, memória e quests da recuperação continuam separadas das regressões desta missão.

BF-5.5G reserva refinamento artístico, avaliação integrada, consolidação e fechamento. BF-6/BF-7 permanecem fora desta entrega.

### Assets e contato verificado

As fontes `.blend`, `build.py`, `physical.py`, quatro GLBs e manifest são entregues juntos. São 19 clips por rig: oito originais e `pickup`, `carry`, `carry_walk`, `sit`, `seated`, `read_seated`, `study_seated`, `stand`, `workshop`, `train`, `watch`. Sockets conservam os nomes `socket_carry`, `socket_hand_right`, `socket_seat`, agora associados explicitamente aos ossos. As ferramentas de escrita são geometria real ligada a ToolL/ToolR; a receita resolve os braços e grava keyframes, sem IK adicional por frame. Adereços pessoais são guardados lateralmente durante contato, sem substituir os rigs R5.

| Interação | Evidência e alcance |
| --- | --- |
| Sentar/levantar dos quatro | 17 amostras por clip de sentar, leitura, estudo e levantar; triângulos sólidos contra peças reais da cadeira, margem de 5 mm; apoio do socket por raycast; altura dos pés preservada. |
| Recolhimento Samael/Aryn | 33 poses contra mesa e mobília reais; correção das mangas e preservação das solas. A aproximação efetiva depende de rota e ocupação. |
| Leitura integrada | Agência, modelos reais, livro canônico e superfície reais; pega interrompida, devolução, retomada, transporte, assento, abertura e retorno. Verifica identidade, orientação no assento, apoio e leases. |
| Estudo/ofício dos quatro | 16 amostras por atividade/rig: ponta real do estilete contra faces reais da prancha, distância inferior a 3 mm. A prancha é segurada; não se afirma contato da ferramenta com toda a bancada. |
| Treino/entretenimento | Tarefa chega à estação e executa mobilidade corporal/observação, com saída e liberação. Sem contato com barra ou reprodução de vídeo. |

Durante a implementação foram encontrados e corrigidos: pose sentada voltando à orientação do recolhimento e saindo da almofada; mangas tocando o tampo; ações antigas herdando deslocamento de pelve; folgas de circulação e materiais ao redor da cadeira de estudo. O teste integrado passou a verificar orientação e apoio efetivo, além do nome do clip. O teste de torus usa segmentos do aro real: seu AABB inteiro preenchia artificialmente o vão. Nenhum assert foi removido para aprovar contato.

### Execuções locais em 08/11/2026

| Gate | Resultado |
| --- | --- |
| Receita Blender/GLBs | Build concluído; quatro hashes SHA-256 iguais ao manifest; 19 clips, skins e três sockets inventariados por rig. |
| Vitest dirigido final | 266 PASS / 31 arquivos, 58,12 s. Inclui agência/continuidade/F1, todos os arquivos do gate de rigs, contatos físicos, livro, runtime/context loss, mobiliário, seleção e magia/pergaminhos. Não é a suíte global. |
| Contatos após tipagem final | 15 PASS / 4 arquivos, 8,79 s; recolhimento, assento, ferramenta e sequência canônica novamente, sem alterar asserts. Sobrepostos aos 266. |
| Regressão de layout após correção | 42 PASS / 5 arquivos, incluindo todos os pares R1 e o raio integral de Ytha. Sobreposta à rodada final, não somada a ela. |
| E2E dirigido | `npx playwright test e2e/post-r4-reading.spec.ts --project=chromium`: 1 PASS, 11,4 s, retries=0. Relógio, pausa persistida, retorno, histórico e orientação móvel; não comprova contato Android. |
| Formato / lint / TypeScript | `npm run format`, `format:check`, `lint`, `typecheck`: PASS final; sem supressões. |
| Build web | `npm run build` dentro de `android:sync`: PASS; aviso de chunks >500 kB preservado, sem mudar limiar. |
| Performance report | PASS: entrada 690.476 bytes, runtime dinâmico 861.387 bytes. Bytes estáticos, sem alegar FPS Android. |
| Android sync/debug | `npm run android:build:debug` executa build web + `cap sync android` + `assembleDebug`: PASS final, 184 tarefas (27 executadas/157 atualizadas), 5 s no Gradle. Aviso existente `flatDir` permanece. |
| Diff | `git diff --check`: PASS. |
| Áudio | `npm run audio:check`: dois assets conferidos, sem alteração de áudio. |

O comando da rodada Vitest final selecionou `src/application/sessions.test.ts`, `src/pages.sessions.test.tsx`, `WorldHost.test.tsx`, `inhabitant*.test.ts`, layouts espacial/de registros, e em `three/`: `inhabitant*.test.ts`, `session*.test.ts`, `bookSweep`, `ThreeWorldRuntime*`, `livingVisuals`, `livingScrollVisuals`, `libraryFurnishing`, `furnitureIdentity`, `spatialComponents`, com `--maxWorkers=2`.

As primeiras rodadas detectaram regressões **novas** de circulação, metadados de batching e composição espacial (uma rodada 254 PASS/7 FAIL; depois 265 PASS/1 FAIL). Foram corrigidas em produção e verificadas novamente, sem alterar os asserts R1. Não são falhas históricas. O timeout preexistente do teste monolítico de hover de Ytha foi tratado dividindo a mesma cobertura por clip e preparando skinning exato: todos os vértices, nove poses, asserts e timeout de 5 s por caso permanecem. Lint também detectou tipagem implícita dos guards Three.js dos novos testes, corrigida com predicados tipados e sem `any` ou supressões.

### Evidências e custo

Em [evidence/bv-f2](audits/evidence/bv-f2): quatro marcos da sequência do livro (`reading-*.png` e `reading-sequence.json`), poses intermediárias/finais dos quatro personagens, estudo e ofício, exemplos de treino/observação; JSONs de inventário, envelopes e CPU. As imagens de estudo mais recentes e exemplos adicionais correspondem a `supplement-poses.json`; as demais poses a `poses.json`. São fixtures fictícias usando geometrias e rigs reais. A inspeção visual identificou a orientação errada do leitor e confirmou sua correção na captura final; o livro mantém as dimensões existentes, com dedos/ergonomia fina ainda sujeitos a avaliação humana.

Reprodução: `node scripts/capture-f2-reading.mjs`; `node scripts/capture-f2-contacts.mjs` (ou filtro `study,train,watch`); `node scripts/measure-f2-envelopes.mjs`; `node scripts/inspect-inhabitants.mjs`. São renderizações dirigidas, sem stress/retries. `measure-f2-envelopes` mede todos os vértices em 33 poses dos 19 clips. FX permanecem intangíveis, roupas/acessórios sólidos participam dos contatos.

O benchmark local comparou os quatro GLBs originais com os novos, usando quatro mixers, matrizes e paletas: P50 0,109 → 0,083 ms; P95 0,176 → 0,142 ms por atualização. Escopo: CPU Node do host, sem render/GPU; diferença pequena não estabelece ganho Android. O aumento de clips eleva os GLBs de aproximadamente 7,0 para 14,0 MB; heap do processo após versões cumulativas não é uma medição isolada por versão. O harness do livro registra separadamente fases de livro/agência/pose/follow e contagem de render. Nenhum loop por personagem foi acrescentado; amostragens e leases usam o RAF existente.

### Roteiro objetivo para Moto G06 — pendente de execução humana

1. Instalar o APK debug desta candidata preservando os dados locais; usar registros fictícios para evidências. Abrir a Biblioteca à noite e conferir quatro habitantes, nove luzes/ritual, auras, pergaminhos, quests e fluidez já aceita em R5.
2. Iniciar uma leitura real pela ficha de um livro visível. Voltar à Biblioteca: observar estante → mesa, aproximação de Samael/Aryn quando elegível, pega do **mesmo** volume, trajeto, assento e leitura. Selecionar o livro antes/durante/depois e confirmar a mesma ficha. Se o caminho estiver ocupado, observar espera ou fallback, nunca um segundo volume.
3. Pausar durante trajeto, durante sentar e já sentado em sessões separadas. Observar saída reversível, fechamento e retorno. Retomar a sessão e depois concluir; conferir histórico único e estação livre. Solicitar conversa/gesto com objeto na mão e verificar liberação anterior ao gesto.
4. Confirmar estudo real: localizar a mesa `bf4-prop:9`, acompanhar aproximação lateral, assento, consulta/escrita, pausa e liberação. Observar os quatro personagens em oportunidades distintas; quadro de contatos cobre numericamente os quatro, a escolha normal da agência não é um seletor de personagem.
5. Confirmar trabalho e treino reais: ofício na `bf4-prop:16`, mobilidade/recuperação na `bf4-prop:14`; concluir/interromper e verificar retorno à rotina. Filme/série confirmados devem causar atenção em pé na `bf4-prop:6`; não há reprodução de vídeo.
6. Durante tarefas, enviar ao background, trocar abas e retornar; reabrir o app; alternar sessões; excluir o registro vinculado. Conferir sessão/objeto reconciliados e recursos livres. Testar movimento reduzido e fallback React, seleção/highlight e pan/pinch/zoom. Context loss/remount têm regressão automatizada; registrar qualquer comportamento observado no aparelho, sem inferir PASS físico do teste de código.
7. Registrar personagem, atividade, ponto da sequência, contato/interseção e fluidez percebida. APK, testes e imagens tornam a candidata demonstrável; não equivalem a aceite artístico, TalkBack, termal/memória sustentada ou profiling Android.

Limites restantes: recolhimento pessoal não habilitado para Lua/Ytha; observação de entretenimento em pé; treino sem levantamento de equipamentos; escrita em prancha segurada; sem dedos articulados/IK de olhar. Bloqueios reais aguardam/replanejam ou devolvem por trajetória reversa. O aceite humano dos contatos e o refinamento integral continuam reservados à etapa posterior autorizada.

### APK debug da candidata

Arquivo local: `android/app/build/outputs/apk/debug/app-debug.apk` (aproximadamente 12 MB). SHA-256: `dd385ea8c3679c8e2aba1d601eb903d9419e0d5a08d821464e6f194fd15326ef`. Gerado do código final F2; não versionado. Sem assinatura/release, mudança de versão, workflow manual, preview remoto ou teste físico alegado.
