# BF-4F2 — articulação e expressividade dirigida

Data: 2026-11-02. Base `8489541c2340c071f2ac20030e73ce3ea6e17439`, branch `feat/bf-4f2-expressividade`. **Candidata para auditoria; aceite visual, fluidez e ergonomia física pendentes.** Sem F3/F4/G, merge, release ou alteração de versão.

## Implementação efetiva

Os quatro modelos F1 foram reaproveitados, incluindo geometria, roupa, materiais e acessórios. A receita existente separa mangas superiores/antebraços e cria pivôs rígidos hierárquicos para orientação, torso, cabeça, ombros, cotovelos, quadris e asas de Ytha. Livros, café, flor e lápis acompanham os membros. Fontes `.blend` preservam peças desagrupadas; exportação agrupa exclusivamente por pai/material. Extensão localizada documentada na ADR-010; sem skinning, bones, IK, dependências ou pipeline genérico.

Cada GLB contém oito clips: `idle`, `walk`, `turn`, `react`, `gesture`, `work`, `magic`, `recover`. Durações autorais: 3,6/3,2/2,4/1,8/2,8/4/3,6/2,4 s respectivamente (o exportador amostra em 30 Hz). Ações principais finitas fazem crossfade de 0,22 s ao repouso; idle é o único loop. Lua passa por recover após magic. Repetir a ação corrente não reinicia o relógio; interrupções mantêm até duas ações ponderadas, sem callbacks de conclusão acumulados. Velocidade de reprodução fixa explícita em 1×.

| Habitante | Repouso/deslocamento | Atividade | Habilidade |
|---|---|---|---|
| Samael | Respiração pesada de torso, passada firme e braços contrabalançados | Eleva café e movimenta notebook cenográfico | Abre os braços com expansão/rotação da aura lilás |
| Aryn | Cabeça atenta, passada mais ampla e ágil | Eleva mão junto ao rosto e inspeciona folio cenográfico | Recolhe braços/livro em gesto de restauração com motes dourados |
| Ytha | Asas articuladas, passos menores e leves | Inclina corpo/cabeça e eleva flor | Abre braços e bate asas com motes verdes |
| Lua | Postura compacta, passos expressivos | Movimenta lápis e grimório | Conjuração com oscilação assimétrica/recuo, seguida por recuperação |

Todos oferecem giro corporal de ida/volta, reação à seleção, cumprimento e recuperação manual. O gesto de café/óculos é estilizado: não há solver de contato mão–rosto, dedos articulados ou reparo físico de páginas. Efeitos usam geometria emissiva existente, sem bloom, flashes, novas lâmpadas ou fogo adicional. A aura cumpre a alternativa lilás; nenhuma operação alcança livros ou plantas de registros reais.

## Integração e lifecycle

`inhabitantAnimator.ts` possui um AnimationMixer por modelo, com ações pré-criadas, atualizado pelo RAF já existente de ThreeWorldRuntime. Pausa/visibilidade/background continuam impedindo atualização; o delta de retomada é reinicializado no runtime existente. Movimento reduzido interrompe ações, restaura propriedades e posição local, suprime demonstração e mantém seleção/texto. Ao desativar, idle retoma. Dispose idempotente interrompe ações, libera bindings/mixer e o owner descarta a árvore; carregamentos tardios e falhas continuam isolados.

Caminhada é uma demonstração local no eixo X com retorno à origem, de 0,65 m (Samael/Aryn), 0,55 m (Ytha) e 0,60 m (Lua). Facing orienta corpo e pernas; quadris e braços articulam passos. São trajetórias fixas verificadas em 128 frames contra a geometria real de paredes, móveis, três estantes e todos os 13 slots BF-4D. Não é pathfinding nem contrato de navegação. Cinco cômodos, quatro passagens e posições F1 permanecem. Highlight acompanha os bounds por frame; raízes `character:*` e picking existentes continuam no mesmo owner.

Painel Habitantes existente mostra seis botões contextuais somente para o selecionado: caminhar, girar, cumprimentar, atividade, habilidade e recuperar postura. Feedback `role=status` descreve a ação e retorno finito, carga, indisponibilidade e movimento reduzido. Fallback sem WebGL preserva descrições; não simula animação bem-sucedida. Sem overlay permanente novo ou alteração de domínio, registros, Dexie, backup ou F5.

## Evidências e reprodução

`assets/3d/source/inhabitants/build.py` exporta as quatro fontes e GLBs reais; README de autoria e `manifest.json` registram receita e SHA-256. `render-actions.py` gera 12 poses de fonte reais (idle/work/magic) em `docs/evidence/bf4f2/`. Inspeção visual automatizada confirmou mudanças corporais/poses individuais, sem conceder aceite artístico. Eevee falhou por ausência de display; alternativa Cycles CPU produziu as poses. Capturas Chromium, quando presentes no mesmo diretório, mostram o mundo integrado, não o Moto G06.

Custo de arquivos: quatro GLBs somam **1.407.576 bytes** contra 774.356 na F1: **+633.220 bytes**. **94 meshes** contra 49 (+45), **26.280 triângulos** mantidos e **32 clips** contra quatro. A separação por pivôs aumenta meshes/draw calls potenciais; tamanho maior inclui canais de animação. Sem texturas, skins ou decoders adicionados. Não se mediu RAM/GPU, FPS, temperatura ou desempenho físico. Fontes Blender são quatro arquivos, sem envio ao bundle.

## Verificação

Gates executados na candidata:

| Comando | Resultado |
|---|---|
| `npm run format:check` | PASS; arquivos alterados formatados com Prettier |
| `npm run lint` | PASS após correções dos testes; E2E final também passou por `npx eslint e2e/bf4-inhabitants.spec.ts` |
| `npm run typecheck` | PASS |
| `npm run test:run -- --maxWorkers=2` | PASS, 86 arquivos / 676 testes; inclui oito novos testes de animação/colisão e regressão React |
| `npm run audio:check` | PASS |
| `npm run build` | PASS; aviso existente de chunks acima de 500 kB |
| `npm run performance:report` | PASS; JS inicial 649.211 bytes, chunk dinâmico Three 694.423 bytes; sem medição física |
| `npx cap sync android` e `./android/gradlew -p android assembleDebug` | PASS, reutilizando o build aprovado sem recompilá-lo; 184 tarefas, 27 executadas e 157 atualizadas |
| `npx playwright test e2e/bf4-inhabitants.spec.ts --grep BF-4F2` | PASS, 4/4 finais; três cenários F1 também PASS na execução inicial. Falhas intermediárias discriminadas abaixo |
| `git diff --check` | PASS |
| E2E global, teste humano/Moto G06/TalkBack | NOT RUN; suíte global reservada à CI, aparelho/avaliação humana posteriores |

APK local: `android/app/build/outputs/apk/debug/app-debug.apk`, **10.568.395 bytes**. Não foi instalado no aparelho. Fontes e 12 renders finais foram produzidos por Blender 3.3.21; parse real no GLTFLoader instalado.

A primeira execução E2E dirigida teve 3 PASS (mundo, fallback e picking) e 1 FAIL no caso novo agregado: 20 ações e capturas excederam 30 segundos durante clique. O cenário foi separado por habitante, mantendo ações, asserts e timeout. Não se atribui essa falha automaticamente às issues históricas. A primeira reexecução dividida teve 2 PASS (Aryn/Lua) e 2 FAIL por timeout (Samael/Ytha); Samael excedeu no último clique após os cinco comandos e captura. O trace local localizou a espera de estabilidade do botão ao voltar do canvas; os comandos dirigidos passam a usar foco + Enter, cobrindo teclado sem esperar dois frames de estabilidade WebGL para cada ação. Nenhum assert ou timeout foi alterado; **Rodada final: 4/4 PASS**, um caso por habitante, com as cinco ações, seleção estável, captura integrada e feedback de movimento reduzido. Somados aos três cenários existentes aprovados antes, sete cenários de habitantes verificados em execuções dirigidas separadas; não se executou novamente a suíte E2E global. Não há alegação de CI remota verde. Dívida anterior: BF-4F1 667 Vitest PASS, E2E 20 PASS/6 FAIL/1 flaky; #4/#11 continuam abertas. A suíte E2E global fica para CI, sem campanha de estabilização, skips, retries novos ou timeouts ampliados.

Falhas investigadas durante desenvolvimento: NLA apagava tracks anteriores (corrigido preservando trilhas, oito clips reais verificados); teste work de Ytha observava cotovelo esquerdo em vez do direito que segura a flor (corrigido mantendo o limiar de articulação); mock React não continha personagens e anulava seleção (corrigido no mock); lint/tipos detectaram import/estreitamento geométrico e opções de matcher inadequadas em testes (corrigidos). Asserções por obstáculo/frame causaram timeout no gate concorrente: agregação preserva todos os obstáculos e 128 frames com uma asserção final. A correção teve omissão de import BufferGeometry, detectada e reparada; nenhuma falha foi ocultada.

## Roteiro Moto G06 e pendências

1. Instalar APK debug com `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`, preservando dados. Identificar os quatro no mundo inteiro; selecionar pelo canvas e painel e aproximar a câmera.
2. Para cada um, observar idle e executar os seis botões. Conferir pés/braços na caminhada, orientação, asas, café/livros/flor/lápis, magia, recuperação de Lua e retorno sem salto. Registrar PASS/FAIL por personagem e legibilidade no enquadramento ortográfico.
3. Repetir seleção/ação rapidamente e interromper caminhada por outra ação; pan/pinch/zoom e selecionar livros, seis tipos e objetos BF-4E durante/depois. Confirmar identidades e destaques.
4. Enviar ao background durante atividade, retomar e girar retrato/paisagem; sair/entrar. Ativar redução de movimento antes e durante uma ação; conferir estado/texto e retomada.
5. Validar fallback, TalkBack, foco/ordem, botões e anúncios, ergonomia e fluidez/aquecimento sustentados. Registrar evidência humana, sem extrapolar fixtures F5.

Aceite artístico, contato estilizado dos gestos, legibilidade dos efeitos/asas, custo acrescido de meshes e ergonomia exigem avaliação humana. TalkBack, R-19 e performance física continuam pendentes. Não declarar BF-4F2 encerrada nem BF-4F3/F4/G concluídas.


## Arquivos e fechamento técnico

Código: `inhabitants.ts`, `worldRuntime.ts`, `WorldHost.tsx`, `three/ThreeWorldRuntime.ts`, `three/inhabitantVisuals.ts` e novo `three/inhabitantAnimator.ts`. Regressões: `WorldHost.test.tsx`, novo `three/inhabitantAnimator.test.ts` e `e2e/bf4-inhabitants.spec.ts`. Fontes: quatro `.blend`, `build.py`, `manifest.json`, README e novo `render-actions.py`; runtime: quatro GLBs. Documentação: STATUS, ROADMAP, CHANGELOG, índice, plano técnico, ADR-010, este relatório e 16 PNGs (12 poses e quatro capturas integradas) com README de evidência. Sem alterações em arquivos históricos, versão, schema ou dependências.

Gates técnicos locais aprovados após correções proporcionais. Candidata segue para PR draft e auditoria; aprovação visual/fluidez/ergonomia do Moto G06 e CI remota não foram concedidas por estes resultados.
