# BF-4F — Plano técnico de execução dos quatro habitantes

> **BF-4F4 FECHADA no escopo funcional dirigido (2026-11-02), série BF-4F1–F4 concluída nesse recorte.** O usuário validou no Moto G06 o funcionamento das questões/escolhas narrativas e compartilhou capturas do diálogo de Samael e do início/progresso da Fenda Lilás. Não houve relato de teste físico exaustivo de todas as histórias/finais ou do acidente F3 de Lua. A [CI da PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711) terminou **FAIL global: 23 E2E PASS, 11 FAIL**; os dois novos E2E F4 PASS. [Merge da PR #17](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/17) e fechamento foram expressamente autorizados com exceção CI. **BF-4G é o próximo gate integrado planejado.** Refinamentos de **UI/UX** e, em outra fase, de **personagens, RPG, diálogos e interatividade** foram reservados pelo usuário para etapas futuras próprias, ainda sem numeração ou autorização de execução. [Relatório F4](BF-4F4_RELATORIO.md).

> **Contrato F3 concluído no escopo dirigido (2026-11-02):** FSM/seleção de utilidade, decisões discretas a 250 ms, navegação contínua por grafo BF-4D e obstáculos reais, seis vínculos independentes, encontros, evento de folio cosmético e ponte BF-4E tipada. A revisão estática foi favorável e o usuário registrou **Autonomia PASS, Convivência PASS, Integração PASS** no Moto G06; **Acidente de Lua NÃO TESTADO fisicamente**. [CI da PR #16](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41542040077) FAIL (21 E2E PASS, 10 FAIL, 1 flaky; novo cenário F3 PASS). O usuário autorizou fechamento e merge com ressalvas explícitas. **BF-4F4 é próxima**, não iniciada. [Relatório de fechamento](BF-4F3_RELATORIO.md).


> BF-4F2 (2026-11-02): contrato vigente de animação dirigida implementado na candidata descrita no [relatório F2](BF-4F2_RELATORIO.md). Oito clips por personagem (`idle/walk/turn/react/gesture/work/magic/recover`), pivôs rígidos em hierarquia, uma ação principal com crossfade de 0,22 s; sem skinning. Caminhada local de ida/volta no eixo X (0,55–0,65 m) verificada contra geometria BF-4D, sem navegação autônoma. O painel React descreve demonstrações e falhas; modo reduzido suprime animação e mantém texto. Este contrato não antecipa F3/F4.

> **Fechamento BF-4F1 (2026-11-02):** modelos iniciais de Samael, Aryn, Ytha e Lua e seleção por canvas/React **aprovados pelo usuário no Moto G06**. F1 concluída no escopo dirigido; animações corporais ficam para **F2**, autonomia para F3, diálogos/quests para F4. [Relatório final](BF-4F1_RELATORIO.md). A CI global terminou FAIL: 20 E2E PASS, 6 FAIL, 1 flaky; 667 Vitest e demais gates não E2E PASS.

> **Estado em 2026-11-02:** planejamento técnico **aprovado**, sem implementação. Esta é a referência de **execução/checkpoints** para o Codex. Identidades, narrativas e animações desejadas estão na [Bíblia dos quatro habitantes](BF-4F_CONCEPCAO_HABITANTES.md). A autoridade de escopo é [BF-4 — Plano e contrato](BF-4_PLANO_CONTRATO.md), complementada pela [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md), [ADR-012](decisions/ADR-012-bf-4-mundo-vivo.md) e [ADR-010](decisions/ADR-010-3d-pipeline-v1.md).
>
> **Decisão explícita posterior à concepção:** **NÃO realizar preflight, spike, PR ou checkpoint experimental isolado de personagens.** Verificações necessárias de autoria, exportação, articulação, rigging, loading, animador e descarte serão feitas **durante a produção de um dos quatro personagens definitivos**, dentro da BF-4F1, aproveitando toda evidência e todo asset útil no produto. Evitar gasto de cota Codex e horas com demonstrações descartáveis.

## Diretriz vigente após BF-4F2 — primazia criativa (2026-11-02)

F2 foi **encerrada no escopo dirigido**: usuário confirmou no Moto G06 reações à seleção e ações animadas pelo React, sem regressão de fluidez percebida. CI global FAIL com quatro falhas novas BF-4F2, rastreadas em [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). Antigas referências a F1/F2 'próximas' abaixo são cronologia de planejamento.

**F3 e F4 devem priorizar ambição artística, personagens interessantes, identidade e narrativa.** Não reduzir efeitos, animações, relações ou cenografia por supor limites do Moto G06. F3 não será mero movimento aleatório de NPCs: exige vida social significativa nos cinco cômodos. F4 exige escolhas, personalidade e consequências do RPG, sem simplificar a história para agradar testes. Reutilizar F1/F2, implementar trabalho real sem preflight descartável, usar testes dirigidos e uma rodada final proporcional, sem loops de timeout. Otimizar apenas gargalos demonstrados, sem negligenciar segurança, dados, acessibilidade e lifecycle. [Arte](ART_DIRECTION.md), [testes](TESTING.md), [desempenho](PERFORMANCE.md).

## 1. Objetivo e entregas

Transformar os cinco cômodos reais e integrados em espaço habitado por **Samael, Aryn, Ytha e Lua**, sem reduzir a ambição visual a esferas, caixas, recoloração do mesmo modelo ou ícones estáticos. A BF-4F terá **quatro checkpoints F1–F4**, cada qual com entrega visual/funcional verificável, branch/PR própria, auditoria técnica da Luna e gate humano do usuário no Moto G06 quando pertinente. **Não unir F1–F4 numa implementação única** e não multiplicar checkpoints burocráticos.

| Checkpoint | Entrega obrigatória | Fronteira explícita |
| --- | --- | --- |
| **BF-4F1 — Quatro habitantes e integração** | Modelos definitivos **para o recorte F1** ou candidatos visualmente sólidos de **todos os quatro**, individualizados por anatomia/silhueta, escala, roupa/acessórios, expressão básica e ancoragem no **mundo completo**; picking/seleção e fallback React; asset pipeline animado/articulado viabilizado **no próprio trabalho útil** | Não implementar ainda IA comportamental, motor de quests ou repertório completo de animações F2. Um idle simples quando tecnicamente necessário para verificar articulação faz parte de F1, não F2 antecipada |
| **BF-4F2 — Expressividade** | Idle variado, deslocamento e giro, gestos de conversa/seleção, atividades e poderes próprios, transições, pausas, retomada, cleanup e redução de movimento | Sem simulação de autonomia completa; usar disparadores de teste e atividades dirigidas onde necessário |
| **BF-4F3 — Agência e relações** | Sistema local tipado de estados/prioridades, rotinas contextuais, grafos de deslocamento seguro, eventos BF-4E, relações mútuas dos seis pares, cooperação, pequenos conflitos/acidentes **cenográficos reversíveis** | Sem LLM, livre-arbítrio aberto, trabalho em background ou estado durável novo |
| **BF-4F4 — RPG e quests** | Diálogo por **3–4 alternativas de texto em botões** nos nós decisórios, quatro quests individuais e **uma compartilhada pelos quatro** com ramos e consequências; interface React, toque no canvas, acessibilidade e retorno de sessão | Não usar entrada livre, LLM, rede, backend, banco/salvamento durável ou sistema genérico de scripting |

BF-4G permanece responsável pelo **gate integrado e consolidação** posterior; não declarar beta/release após BF-4F.

## 2. Estratégia sem preflight separado

1. Na BF-4F1, inspecionar **somente** os contratos, a disponibilidade real de ferramentas/arquivos e o checkout atual antes de editar. Isso é leitura normal de código, **não etapa independente nem longa pesquisa exploratória**.
2. Escolher rota de autoria **preferencialmente** com modelos estilizados articulados de autoria editável, exportados como **GLB 2.0** e animação por bones/clips, integrados ao Three.js com **`GLTFLoader` e `AnimationMixer`** se a evidência do checkout demonstrar viabilidade. Blender headless/CLI é candidato, **não obrigação absoluta**; outras ferramentas gratuitas e compatíveis são aceitáveis quando justificadas.
3. Validar primeiro **um dos quatro personagens reais** durante sua produção: normalização métrica, orientation, bound, rigging, clip de idle quando útil, carregamento/descarte, modelo na cena. Depois aplicar fluxo comprovado a outros três. Nenhum avatar de teste descartável, cena de laboratório autônoma, branch de estudo ou pacote de pipeline genérico.
4. Se rigged GLB ficar inviável no ambiente existente, considerar **personagem articulado procedural apenas se entregar qualidade individual comparável**, e documentar limites reais e evidência; **não** substituir silenciosamente por quatro bonecos geométricos genéricos. Se a qualidade exigida não for viável, fazer a maior entrega aproveitável possível e sinalizar impedimentos, sem falso PASS.
5. Quando efetivamente for usar rigging/skinning/clips importados como **asset produtivo**, registrar **extensão localizada** ao contrato de pipeline/ADR-010 com regras comprovadas de fonte, licença, normalização, exportação, parse, clips, montagem, descarte e regressão. **Não reabrir P3D-B2–F inteiro por formalismo.** Não alterar a ADR-010 como se suportasse rigging antes de evidência.
6. Não criar dependências, serviços pagos, downloads não verificáveis, bibliotecas de avatar sem proveniência, shaders/postprocessamento global nem uma engine paralela apenas por conveniência. A autoria deve ter fonte editável e licença compatível, com registro de origem.
7. Produzir prévias visuais/render/capturas **dos personagens reais** quando houver mecanismo no ambiente, e avaliar no **Moto G06**. CLI e testes não substituem julgamento artístico. Não forçar quatro checkpoints de aprovação por item de roupa ou acessório.

**Otimização:** medir quantidades e comportamento no aparelho antes de impor hard budget. A evidência ~60 FPS da BF-4E não prova performance com quatro personagens/auras/clips concorrentes; preservar fluidez sem eliminar arbitrariamente identidade visual.

## 3. Arquitetura pretendida, limitada ao necessário

Preservar `React → WorldHost → ThreeWorldRuntime → Three.js`. Não inflar `ThreeWorldRuntime.ts` com dezenas de responsabilidades: preferir controlador pequeno de personagens, composição de raízes e fontes de estado tipadas, separando **descrições** do ator, **ações autorizadas** e **representações Three**.

- **Identidade:** IDs fixos por personagem (por exemplo `character:samael`, `character:aryn`, `character:ytha`, `character:lua`) em namespace disjunto de `living:*`, `entryId` e `instanceId` de registros reais. Nomes não derivam identidade de mesh/posição.
- **Câmera e toque:** seleção pelo canvas com prioridade íntegra de estantes, livros e registros; React oferece nomes e seleção textual também quando WebGL falha. Não roubar pan/pinch/zoom nem exibir overlays permanentes cobrindo o mundo.
- **Cena e lifecycle:** roots dos quatro apenas no mundo composto, com owner explícito, dispose idempotente, cancelamento de callbacks assíncronos, falha recuperável, pausa/background e retorno; **isolar F5**, sem novo RAF por personagem.
- **Espaço:** respeitar planta A–E, quatro passagens, mobília, dados BF-4D e objetos BF-4E. Posicionamento de F1 deve ser seguro e visível, mas **BF-4D oferece zonas/pontos, não navmesh pronta**; F3 provará navegação.
- **F2:** animador independente de decisões; expor ações tipadas como idle, walk, turn, gesture, work, magic, recover; respeitar `prefers-reduced-motion`, com transições e custos medidos.
- **F3:** pequena FSM/utility selector com prioridades e relógio/seed injetáveis; memória **de sessão**, eventos autorizados, cooldowns, interrupção e recuperação. Relações se desenvolvem por encontros e efeitos, não só por clique do jogador.
- **F4:** grafos declarativos de quests e diálogos (IDs, destinos, condições puras, efeitos enumerados, saída/retomada). As escolhas são botões React, não textos executáveis; validar referências, alcançabilidade, duplicidade, loops e idempotência.

Nenhuma quest pode inspecionar ou modificar conteúdo pessoal dos seis tipos; notebook, fumaça, papel rasgado, livros de missão, fogo e plantas são **cenográficos**. Não haverá persistência Dexie/backup de personagens/quests por padrão.

## 4. Contrato de entrega específico da BF-4F1

**Objetivo:** ao abrir o mundo completo dos cinco cômodos, encontrar **os quatro** habitantes como personagens diferentes e convincentes, cada qual reconhecível em silhueta, proporções, rosto/expressão básica, vestes e acessórios, com disposição inicial segura e uma forma real de interação por toque/React.

**Resultado mínimo verificável:**
- Samael (2,00 m): corpo corpulento escuro, aura negro/lilás controlada, identidade demoníaca, roupa marcante e referência visual a notebook/café.
- Aryn (1,70 m): elfa esguia, pele clara, cabelo escuro, óculos, aura delicada e elementos de reparo/livros.
- Ytha (1,70 m): fada com cabelo rosa/lilás, asas de borboleta legíveis, aura suave e acessórios botânicos.
- Lua (1,60 m): maga imortal de óculos, silhueta compacta, grimório/desenho e identidade mágico-acadêmica.
- As quatro representações coexistem em A–E (distribuição de posicionamento inicial que não declare cômodos exclusivos), com escala normalizada, bounds finitos, seleção estável, texto alternativo em React e sem obstruir rotas, estantes ou registros.
- Fazer idle básico/microgesto somente quando necessário para provar expressividade/articulação; **não aceitar F1 só por quatro pontos ou objetos geométricos genéricos**. F2 fará repertório completo.
- Confirmar criação/destruição das quatro instâncias, fallback sem GLB/WebGL se aplicável, ausência de regressão de seleção/pan/zoom e exclusão do mundo em F5.
- Testes proporcionais (Vitest, integrações Three/picking/lifecycle, E2E relevantes, build, `git diff --check`); APK debug se ambiente disponível, mas **a validação humana só ocorre após instalação real**.
- Evidência artística no próprio trabalho: imagens/prévias do mundo e personagens quando possível; documentar limitações, proveniência, caminhos, ferramentas e métricas reais. O usuário decide o **PASS visual**; Codex não pode autopremiar modelos visualmente insuficientes.
- Manter histórico de falhas E2E #4/#11, R-19, TalkBack, desempenho sustentado e BF-4G separadamente. Não alterar timeout/retry/skip para disfarçar CI.

**Excluídos de F1:** implementação completa de rotinas inteligentes, grafos de rota, relações persistentes, missões, diálogos, efeitos destrutivos completos, novas categorias de registro, schema, backend, login, LLM, gamificação. Esses pertencem a F2/F3/F4 ou não estão autorizados.

## 5. Disciplina de execução com Codex e Git

Cada checkpoint terá um **pedido de implementação específico**. O primeiro pedido BF-4F1 deve:

1. Conferir `git status` e remote; **não descartar alterações locais**. Atualizar `main` com `git fetch --prune origin` e `git pull --ff-only origin main` a partir de checkout limpo. Se houver conflito/divergência/arquivos locais, parar e relatar; nunca reset/rebase/force por padrão.
2. Criar branch de feature **a partir da `main` sincronizada**, sem reaproveitar branches históricas.
3. Implementar **F1 por inteiro**, dentro do orçamento lógico de escopo, com a verificação do formato/articulação **incorporada ao desenvolvimento real**; preservar quatro habitantes e cinco cômodos.
4. Atualizar relatórios/testes/doc do checkpoint honestamente, distinguindo verificação local, CI remota e gate humano ainda pendente.
5. Concluir com `git diff --check`, inspeção do status, **commit e push autorizados na branch**, abrir **PR em draft** contra `main` quando possível, **SEM MERGE**. Se a PR não puder ser criada pelo ambiente, fornecer link compare e explicar impedimento. Não criar PR vazia ou declarar sucesso se não aconteceu.
6. Relatar commit SHA, branch, PR URL, arquivos, provedores/ferramentas/assets usados, testes PASS/FAIL/NOT RUN, riscos e roteiro concreto de inspeção no Moto G06.

**Aprovação e merge** são decisões posteriores, após auditoria independente e validação física do usuário. Não interpretar aprovação do planejamento como permissão genérica de merge dos próximos checkpoints.

## 6. Riscos ativos

| Risco | Mitigação embutida na entrega |
| --- | --- |
| Construir modelos sem rig/clip viável | Provar articulação com **personagem definitivo durante F1** antes de replicar; sem spike independente |
| Estética genérica ou personagens indistintos | Quatro silhuetas/roupas/acessórios/alturas/atuacões individualizadas; revisão artística humana |
| Custo GPU/CPU/memória no Moto G06 | Owners explícitos, compartilhamento justificado, medir no aparelho e evitar 4 RAFs/efeitos caros sem prova |
| Picking/câmera/oclusão quebrados | Testar registros reais, BF-4E, passagens, pan/pinch/zoom, retrato/paisagem e retorno |
| Rigging fora da ADR-010 v1 | Extensão formal **somente após caso produtivo comprovado**, sem bloqueio artificial de preflight |
| IA/narrativa invadindo dados privados | Tipagem, efeitos autorizados, cenário ficcional, estado efêmero e fronteira de domínio |
| CI remota historicamente falha | Tratar #4/#11 como abertas; não esconder timeouts, separar resultado técnico de aceite físico |

**Estado de referência:** BF-4E concluída em `main`, BF-4F1 **próxima implementação**. Este documento não a inicia, não cria branch/asset nem executa testes. A próxima conversa pode emitir o prompt BF-4F1 baseado neste contrato.

## BF-4F1 — Fechamento dirigido (2026-11-02)

Quatro modelos iniciais integrados, fotos do mundo real no Moto G06 e seleção dos quatro pelo toque e React **aprovados pelo usuário**. Commit `de0bea64718ccfb2501a11f1541d8ac4abca3396`, [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13). Formatação, lint, TypeScript, 667 Vitest, áudio, build e relatório de performance PASS na [CI 41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206); **E2E final FAIL (20 PASS, 6 FAIL, 1 flaky); CI global FAIL**. Microgestos de cabeça não equivalem a animação corporal: **F2 é a próxima etapa**. F3/F4, BF-4G, questões #4/#11, R-19 e TalkBack permanecem. As observações anteriores de F1 “aberta” ou “não implementada” são históricas. [Relatório](BF-4F1_RELATORIO.md).

## Contrato vigente BF-4F4 — candidata implementada

Cinco grafos autorais em `narrative/`, separados da agência: condições puras, efeitos enumerados, IDs estáveis, revisão esperada contra duplo acionamento, guard de publicação, memória limitada e nenhuma persistência. `NarrativeSession` pertence ao host React; fechamento/retomada, troca de habitante, rotação e falha WebGL preservam o progresso do mesmo host. Saída da rota/reload/processo novo cria outra sessão.

`setConversation` coordena falante/protagonista e ensemble de cooperação sem teletransporte, mantendo tarefa para reconsideração segura. `setNarrativeBonds` mantém escolhas separadas dos encontros espontâneos e influencia confiança/tensão efetivas na F3. `applyNarrative` recebe snapshots tipados; efeitos visuais e vínculos não dependem de callback de animação. Fallback continua a ficção, sem afirmar uma animação não executada.

O cenário tem owner único no building; investigação só ancora props ambientais permitidos. A noite da fenda é uma sobreposição do renderer, sem alterar horário/discovery BF-4E; nenhum dos quatro objetos do Segredo do Pergaminho recebe ação narrativa. Sem schema, backup, rede, dependência, GLB novo ou segundo RAF. Contratos, rotas narrativas e limitações detalhados no [relatório F4](BF-4F4_RELATORIO.md). Implementação não equivale a aprovação humana.

## Estado posterior à BF-4F4 — fechamento da série (2026-11-02)

A BF-4F1–F4 foi **concluída no escopo funcional e físico dirigido**, com **F4 aceita pelo usuário no Moto G06 quanto ao funcionamento das escolhas**. A implementação final entrega cinco narrativas offline, 70 nós, 174 escolhas, diário, estados de sessão, vínculos e cenografia; não houve prova humana específica de todos os desfechos, nem do acidente de Lua F3. Auditoria estática F4 favorável. [CI PR #17 / 41550602711](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41550602711) **FAIL: 23 E2E PASS, 11 FAIL**, com os dois novos E2E BF-4F4 PASS. O usuário autorizou fechamento/merge com exceção CI documentada; isso não equivale a aprovação de BF-4G, TalkBack ou beta/release.

**Refinamento futuro decidido:** UI/UX terá **fase própria**, assim como melhorias de **personagens e aspectos de RPG/diálogos/interatividade** terão outra frente. Ambas requerem planejamento posterior e escopo novo, sem numeração automática e sem constituírem bloqueio do aceite F4. A fase BF-4G continua sendo o **próximo gate integrado já previsto**. Preservar a ambição criativa e os testes proporcionais. Trechos anteriores que apresentam F4 como candidata ou F1–F4 pendentes são registros da evolução, não o estado operacional. [Fechamento F4](BF-4F4_RELATORIO.md).
