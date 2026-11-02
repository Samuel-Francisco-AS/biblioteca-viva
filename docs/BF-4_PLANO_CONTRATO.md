# BF-4 — Mundo Vivo e Habitável: plano e contrato

> **BF-4F1 encerrada no escopo dirigido (2026-11-02):** o usuário aprovou os quatro modelos iniciais e sua seleção canvas/React no Moto G06. Próxima fase F2 (animação corporal). [Relatório](BF-4F1_RELATORIO.md). CI global FAIL: 20 E2E PASS, 6 FAIL e 1 flaky.

> **Estado atual (2026-11-02):** BF-4A documental PASS; BF-4B concluída com PASS dirigido; BF-4C, **BF-4D e BF-4E encerradas no escopo técnico e físico/visual dirigido por exceção explícita ao gate de CI remota**. BF-4F–G pendentes. Issues #4 e #11, R-19 e TalkBack continuam abertos; sem beta/release. Trechos BF-4A preservam planejamento histórico. **Atualização de concepção BF-4F (ADR-013): quatro habitantes — Samael, Aryn, Ytha e Lua — e diálogos RPG ramificados com escolhas locais; nenhuma implementação BF-4F iniciada.** [Bíblia dos habitantes](BF-4F_CONCEPCAO_HABITANTES.md).
>
> **Baseline auditado:** `main` `a702f897f6db5903c0becb61df54bc9f18be455a` (fechamento BF-3), sob ADR-008–012. As seções identificadas como planejamento prescrevem trabalho futuro; os estados B/C/D registram a evolução autorizada posterior.

## Objetivo e decisão de escopo

A BF-4 transforma **o conjunto dos cinco cômodos** já existente em um mundo estilizado, mobiliado, habitado e interativo. O usuário rejeitou o caminho de um protótipo isolado de um único cômodo: **BF-4B modifica o mundo inteiro desde sua primeira entrega**, com diferenças observáveis por checkpoint. Não substituir esse objetivo por experimentos desconectados ou prolongamento documental.

A BF-4 deve entregar **personagens visualmente distintos**, **animações variadas**, **comportamentos autônomos contextuais**, **interação com objetos** e **conversação textual contextual**; não rebaixar BF-4F a NPCs meramente estáticos. **Alvo inicial atualizado expressamente pelo usuário: quatro habitantes — Samael, Aryn, Ytha e Lua**, com identidades sobrenaturais, animações, rotinas, relações entre si, quatro quests individuais e um arco compartilhado no mundo dos cinco cômodos. A conversa será **RPG local com três ou quatro escolhas predefinidas por nó decisório**, sem LLM, campo livre ou NLP aberto. A decisão posterior [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) substitui a contagem antiga da ADR-012 somente para a BF-4F; consultar a [bíblia de concepção](BF-4F_CONCEPCAO_HABITANTES.md) antes de decompor ou implementar.

## Auditoria BF-4A — evidência do código e fronteiras

| Superfície existente | Evidência concreta | Implicação para BF-4 |
| --- | --- | --- |
| Planta e construção | `libraryBuildingGeometry.ts` define `room-a` a `room-e`; `proceduralLibraryBuilding.ts` cria pisos, paredes baixas e quatro passagens, sem mobília de BF-4 | Reaproveitar os **cinco cômodos**, aprimorando sua composição global; não tratar a planta como arte final |
| Registros e mobiliário legado | `libraryRecordLayout.ts` define 13 slots iniciais; BF-2 tem três estantes e 70 slots derivados de livros | Preservar registros, capacidade e seleção; planejar móveis contra as geometrias reais, sem usar categoria como identidade de sala |
| Montagem | `ThreeWorldRuntime.ts` monta `createProceduralLibraryBuilding`, `createLibraryRecordComposition` e composição BF-1/BF-2 somente no caminho funcional | Integrar novas roots por owner explícito e desmontagem segura; não inserir BF-4 nos cenários diagnósticos F5 |
| Picking e React | `ThreeWorldInteraction.ts` usa raycast e wrappers selecionáveis; `WorldHost.tsx` publica catálogo, status e seleção | Planejar picking sem roubar seleção de livros/registros e ação textual acessível para conversar/interagir |
| Loop e câmera | `ThreeWorldRuntime.ts` já gerencia RAF/pausa/resume; `CameraNavigation.ts` é autoridade de câmera | Adicionar atualização de personagens ao lifecycle existente, com delta limitado e sem segundo RAF independente; revisar bounds ao expandir massa visual |
| Assets | ADR-010 e `ASSET_PIPELINE.md` só aprovam GLB 2.0 produtivo no perfil **rígido/estático** | Procedural articulado é candidato inicial; GLB animado/skinning exige extensão explícita do contrato + prova de exportação/ingestão antes de promoção |
| Diálogo/IA | `worldRuntime.ts` não define APIs de diálogo, agentes, caminho ou memória; `package.json` não contém stack de LLM | Projetar camada nova, simples, testável e opcionalmente extensível, sem alegar que existe hoje |
| Dispositivo/qualidade | BF-3F: 11/11 PASS dirigido no Moto G06; issue #4 permanece aberta, TalkBack pendente | Fazer gates físicos intermediários, não inferir benchmark sustentado ou CI integral do PASS anterior |

**Resultado A:** auditoria dirigida e planejamento documentais concluídos, sem execução de testes, APK, profiling, alteração de runtime ou gate de código. A base é apta **a iniciar BF-4B**, condicionada à autorização de implementação e à análise do checkout local pelo Codex.

## Contratos transversais

1. **Identidade e dados:** preservar `modelTypeId` / `instanceId` / `entryId`; móveis/personagens sem registro convencional não inventam `entryId`. IDs de personagens e props devem possuir namespaces distintos dos IDs BF-1/BF-2/BF-3. Nunca derivar identidade de posição, geometria, mesh ou nome do personagem.
2. **Arquitetura:** `React → WorldHost → ThreeWorldRuntime → Three.js`; dados convencionais via application/projeção neutra, sem consulta Dexie no renderer. Agentes e diálogos não devem contaminar o domínio de registros ou tornar o canvas o único canal de função essencial.
3. **Espaço:** layout reproduzível por configuração declarativa, inicialmente efêmero, para mobília, pontos de atividade e caminhos. Proibir retomada acidental de `PlacedObject`, `WorldStructureState`, grid legado ou persistência espacial. Não criar schema Dexie ou ampliar backup v6 na BF-4 sem outra decisão.
4. **Montagem e desempenho:** componentes adicionados devem ter ownership, cleanup idempotente, falha segura, isolamento entre montagens, proteção de callbacks tardios e respeito a pause/resume/background. Animações devem ser acionadas pelo loop existente ou mecanismo com owner/lifecycle equivalente comprovado. Não presumir sombras, pós-processamento, novas dependências, cache ou otimizações sem evidência.
5. **Cômodos e navegação:** os cinco cômodos permanecem **semanticamente neutros**. Mobília não pode bloquear as quatro passagens, ocultar rotineiramente os registros ou invalidar picking, câmera e bounds sem correção dirigida. Movimento autônomo não significa editor espacial nem movimento do usuário.
6. **Personagens:** cada personagem terá identidade, visual, animações/estados e comportamento próprios, com representação inicial tecnicamente viável e validada; metas de comportamento e interação são parte obrigatória de F. O cérebro escolhe ações autorizadas dentre atividades e destinos existentes — não pode executar comandos arbitrários no app ou alterar registros por fala.
7. **Conversação e privacidade:** contrato mínimo **local, textual e determinístico/testável**, com intenções/contexto de sessão, identidade de personagem e efeitos de diálogo explicitamente limitados. Entrada do usuário é não confiável, deve ser delimitada; falha da conversa não pode derrubar mundo ou operações convencionais. Memória efêmera por padrão, sem telemetria ou transmissão de notas pessoais.
8. **LLM generativa:** não faz parte da promessa técnica já aprovada. Caso desejada, requer antes proposta concreta de local versus serviço externo, latência, distribuição/execução no Moto G06 ou servidor, custo explícito, consentimento, minimização e fronteiras de rede/privacidade; a alternativa offline e convencional permanece funcional. Não inserir provedor, backend, chave ou cobrança por conveniência.
9. **Acessibilidade:** interações e diálogos têm controles React semânticos e utilizáveis sem toque preciso, som ou animação; fornecer texto, anúncios/foco pertinentes e respeito a redução de movimento. TalkBack físico permanece bloqueante antes do primeiro recorte real/beta.
10. **Qualidade:** gates técnicos proporcionais por checkpoint; CI não é declarada verde por histórico. Rastrear a issue #4 e não mascarar o E2E `r4-shell` com `skip`/timeouts artificiais. Gatilhos materiais de geometria/iluminação/animação exigem aferição no Moto G06, inclusive estabilidade, orientação e retorno de background.

## Checkpoints e gates

### BF-4A — Auditoria e contrato (PASS documental)

- Conferir baseline, cinco cômodos, sistema de montagem/seleção, câmera, diagnóstico F5 e ADRs.
- Formalizar arquitetura-alvo, BF-4B–G, riscos, critérios de aceite e decisões ainda condicionais.
- **Entrega:** este documento, ADR-012, roadmap/status/índice/riscos coerentes. **Sem código de produção, dependências, assets, mudanças de dados ou testes alegados.**

### BF-4B — Ambiente completo dos cinco cômodos (CONCLUÍDA; PASS dirigido)

Evidência de auditoria, CI, gate físico e ressalva R-19: [fechamento BF-4B](BF-4B_RELATORIO.md). Não equivale a benchmark sustentado, TalkBack ou arte final.

- Evoluir **simultaneamente os cinco cômodos**: piso, paredes, paleta, materiais, iluminação, detalhes arquitetônicos e leitura global; manter passagens e leitura mobile. Sem protótipo descartável limitado a um cômodo.
- Escolher solução visual econômica e compatível com Three.js atual; corrigir colisões e oclusões efetivamente observadas, sem reabrir a planta inteira por precaução.
- **Gate B:** build navegável do mundo inteiro, inspeção visual humana **integrada**, regressões de câmera, picking e BF-3, inspeção de custos e, se mudança material, build físico dirigido Moto G06. Sem alegar aprovação de arte final.

### BF-4C — Ampliação, mobília e decoração (CONCLUÍDA POR EXCEÇÃO CI)

Autorização específica de 2026-11-02 acrescentou C1 (salão 1,8–2× e laterais 1,5–1,7× por eixo horizontal) e C2 (mobília nos cinco cômodos). **Fechamento:** auditoria técnica e testes dirigidos no Moto G06 aprovados; [CI PR #9 / 41387959550](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41387959550) **FAIL (18/19 E2E)** no `r4-shell`, exceção expressamente aceita e rastreada na issue #4. [Relatório final](BF-4C_RELATORIO.md). A disposição de registros permanece provisória para organização BF-4D; C não autoriza editor espacial, agentes, TalkBack PASS ou BF-4D.

- Criar variedade útil de mesas, cadeiras, bancos, sofás, luminárias, tapetes e decoração com materiais coerentes; **preencher os cinco cômodos**, não só um.
- Produção por conjuntos e fábricas/representações com owner, descarte e dimensões confiáveis; reutilização de geometria/material somente com regra explícita de ownership.
- **Gate C:** cenas completas observáveis e testes de construção, escala, Box3, integridade, descarte e regressões de BF-2/BF-3; sem asset externo sem origem/licença.

### BF-4D — Organização espacial (CONCLUÍDA NO ESCOPO DIRIGIDO, EXCEÇÃO CI)

- Organizar mobília, decoração, zonas de atividade e pontos de parada/caminho pela planta inteira. Tratar acessos, encontros, oclusão, distância visual e colisão com os registros reais.
- Layout declarativo/determinístico; validadores de dimensões e interseções proporcionais, sem transformar tudo em grid persistido ou simulação física geral.
- **Gate D:** placements reproduzíveis, quatro passagens livres, registros alcançáveis via canvas/React, sem clipping impeditivo; cenário com densidade representativa e inspeção humana.

Autorização de 2026-11-02 implementa D1–D4 na branch própria, sobre o merge BF-4C `6804fee4`. Três estantes em A/C/D, 13 slots explícitos nos cinco cômodos e 18 conjuntos ambientais preservados. Reservas de circulação de 1,2 m, dez zonas de atividade e oito de entrada, com pontos/raios/orientações e validação geométrica independente do renderer. [Relatório BF-4D](BF-4D_RELATORIO.md) registra as provas reais e os gates. **Fechamento:** auditoria estática independente e gate físico/visual dirigido no Moto G06 favoráveis; [CI PR #10/41405622312](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41405622312) FAIL em `r4-shell` histórico (#4) e novo E2E de coleção cheia 1280px ([#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11)), 19/21 E2E PASS. Usuário expressamente decidiu aceitar essas dívidas e autorizar o fechamento/merge, sem declarar CI verde ou resolução causal. [Relatório](BF-4D_RELATORIO.md). Pontos são aproximações, sem animação, pose de assento, pathfinding, editor, persistência ou interações E. Não altera ADR-012 nem amplia o escopo futuro autorizado.

### BF-4E — Objetos vivos, interação e atmosfera (CONCLUÍDA NO ESCOPO DIRIGIDO; EXCEÇÃO CI)

- Integrar a cena habitável, props e zonas de interação ao runtime funcional e host; objetos com ações simples e observáveis, feedback visual + textual, sem comandos arriscados.
- Garantir falhas, fallback React, montagem/desmontagem, F5 isolado, independência de snapshots BF-3 e interação sem conflito com tap/pan/pinch.
- **Gate E:** testes de picking e interação, ownership/falhas/lifecycle, regressão dos seis tipos, acesso sem WebGL e build físico intermediário.

**Extensão criativa adotada em 2026-11-02 (registro anterior ao fechamento):** a BF-4E evolui de ações isoladas para um ambiente interativo integrado. [Visão e contrato BF-4E](BF-4E_VISAO_CONTRATO.md): dez famílias-alvo de objetos vivos (mínimo de oito plenamente funcionais), animações reais de props, luz cênica dinâmica, efeitos sonoros/táteis opcionais, três atmosferas, estados efêmeros, eventos locais e uma descoberta ficcional encadeada. Cinco cômodos, React acessível e distinção entre interação ambiental e registros convencionais são obrigatórios. Isso é **visão aprovada, não código pronto, não autorização de merge, nem escopo BF-4F**. Gate físico e CI futuros; dívidas #4/#11, R-19 e TalkBack preservadas.

### BF-4F — Habitantes, animação, comportamento e conversa (PENDENTE)

**F1 — Identidade visual e personagem:** meta inicial de **quatro habitantes (Samael, Aryn, Ytha e Lua)**, com silhueta, traje/acessórios, escala, rosto/expressão visual e papel próprios; todos integrados aos cinco cômodos e selecionáveis via canvas/React. **Não há preflight experimental separado:** validar articulação, GLB/animador, normalização e descarte usando um dos personagens definitivos na própria F1, aproveitando essa implementação nos outros três. Gate visual humano posterior; nenhuma recoloração superficial do mesmo boneco. Ver [plano técnico BF-4F](BF-4F_PLANO_TECNICO.md).

**F2 — Animações:** repertório por personagem, incluindo repouso, caminhada, giro, gestos, atividade com objeto e reação à seleção/conversa, conforme viabilidade real; transições coerentes, controle de velocidade, pausa, limpeza e redução de movimento. Não inferir suporte GLB com rigging do perfil estático ADR-010.

**F3 — IA comportamental:** agentes locais, com estados/intenção/prioridades, percepção **apenas de eventos autorizados**, pontos de atividade e rotas verificadas, retomada após interrupção e memória **de sessão**. Pode usar FSM, behavior tree pequena ou avaliação de utilidade; escolher a menor implementação suficiente e testar decisões, bloqueios, determinismo por seed/clock e falhas. Sem prometer consciência, aprendizagem de modelo ou livre agência.

**F4 — Conversação RPG, quests e reação ambiental:** diálogo textual **ramificado por escolhas de três ou quatro botões predefinidos nos nós de decisão**, via React e seleção do personagem; quatro quests individuais, uma quest coletiva com os quatro, personalidades e relações mutáveis na sessão, condições/efeitos de escolha tipados e ações autorizadas de objetos/animações. Tudo deve funcionar offline, sem LLM e sem entrada livre exigida. [Concepção canônica BF-4F](BF-4F_CONCEPCAO_HABITANTES.md).

- **Gate F:** **quatro personagens distintivos** em cenário integrado, várias animações demonstráveis, execução autônoma com rotas/atividades seguras, relações/interações entre os próprios habitantes, objetos e **diálogo RPG com escolhas ramificadas, quatro quests individuais e um arco compartilhado**;  nenhuma regressão dos seis tipos. Provas de cancelamento, estado terminal, memória efêmera, redução de movimento, rotas e interação sob orientação/background, além de validação no Moto G06.

### BF-4G — Integração, gate físico e fechamento (PENDENTE)

- Regressão proporcional consolidada: `format:check`, `lint`, `typecheck`, Vitest, `audio:check`, build, `performance:report`, E2E aplicáveis, `git diff --check`; build Android e verificações humanas separadas.
- Moto G06: os cinco cômodos, objetos e personagens; seleção canvas/React, diálogo/interação, fluidez com animações, pan/pinch/zoom, retrato/paisagem, pausa/retomada, runtime/disposal, fallback; memória/termal quando mudança justificar.
- **Gate G:** classificar PASS/FAIL e limitações sem apagar a dívida CI/issue #4 nem declarar TalkBack aprovado sem evidência humana; atualizar documentação e decidir transição à BF-5.
- **BF-5** continua responsável pela consolidação funcional e gate humano assistivo antes do primeiro recorte real/beta.

## Questões técnicas condicionais, não bloqueios para B

- **Rigging/GLB animado:** a BF-4F prefere personagens 3D estilizados de fonte editável, articulados/animados, com GLB 2.0 e Three.js/AnimationMixer quando viáveis; procedural articulado só é alternativa se a qualidade individual exigida se mantiver. **Verificar o fluxo durante a produção de um personagem definitivo dentro de F1, sem spike/preflight isolado.** Formalizar extensão proporcional da ADR-010 quando houver uso produtivo comprovado de skinned meshes/clips, sem reabrir P3D-B2–F inteiro por formalismo. O perfil v1 não os aprova automaticamente.
- **Diálogo generativo aberto:** avaliar somente após prova do contrato local; requer aprovação própria de produto e arquitetura.
- **Navegação:** começar por pontos/rotas e obstáculos derivados da planta aprovada; não assumir navmesh complexa, pathfinding universal ou simulação física.
- **Aparência final:** material e composição devem ser verificáveis no mundo integral; direção estilizada ortográfica/2.5D de `ART_DIRECTION.md` permanece referência, não congelamento de asset final.

## Handoff histórico BF-4A → BF-4B

O próximo executor deve inspecionar o checkout real e seus testes, propor o recorte **integrado dos cinco cômodos**, listar arquivos e riscos antes de modificar, produzir um ambiente visivelmente mais rico e executável, e registrar os testes efetivamente realizados. **Sem commit, push ou merge pelo Codex sem autorização de Git específica.**

A BF-4A documental não produzia autorização automática para o código da BF-4B nem validação de entrega futura. A BF-4B foi posteriormente autorizada, implementada e fechada no escopo dirigido em 2026-11-02; BF-4C requer autorização e gate próprios.

## BF-4E — checkpoint histórico de implementação (2026-11-02)

E1–E3 têm implementação integrada sob verificação: catálogo ambiental e sessão compartilhados, peças articuladas no loop existente, três atmosferas e descoberta. E4 reúne testes, APK e publicação. A fase permanece aberta para auditoria e gate humano. [Relatório técnico](BF-4E_RELATORIO.md).

## BF-4E — Decisão final de fechamento (2026-11-02)

A BF-4E entregou nos cinco cômodos dez famílias de objetos vivos, animações e estados efêmeros, interação primária pelo toque no canvas, fallback React acessível, atmosfera contextual (horário local, atividade de estudo, descoberta) e sequência completa do Segredo do Pergaminho. O usuário validou em APK no Moto G06 a descoberta 4/4 e correções posteriores de toque dos props pequenos, abertura da gaveta E e faixa de pista de 4 segundos, sem regressão percebida de pan/zoom/seleção. **Fechamento/merge autorizado expressamente após esse gate dirigido.** [CI PR #12/41438324911](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41438324911) **FAIL 20/24 E2E** nos cenários BF-4D coleção cheia (1280/390) e r4-shell (interação/dez ciclos), sob investigação das issues [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11) e [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4); 661 Vitest e demais gates técnicos PASS. Isso **não aprova CI, TalkBack, R-19, desempenho sustentado, beta ou release.** BF-4F, com **quatro habitantes completos** (Samael, Aryn, Ytha e Lua) e diálogos por **3–4 opções de RPG**, sem LLM, é o próximo recorte de implementação, segundo [ADR-013](decisions/ADR-013-bf-4f-quatro-habitantes-rpg.md) e a [concepção canônica](BF-4F_CONCEPCAO_HABITANTES.md). [Relatório final](BF-4E_RELATORIO.md).

## BF-4F — Diretriz técnica vigente (2026-11-02)

O usuário aprovou executar a BF-4F **diretamente pelos quatro checkpoints F1–F4, sem preflight independente**. As verificações técnicas de modelo, rigging, importação/GLB, animação e descarte serão incorporadas à **produção real dos quatro habitantes na F1**, começando pelo fluxo de um deles como entrega aproveitável, jamais por protótipo isolado. F1 apresenta os quatro com identidade visual convincente no mundo inteiro e seleção; F2 entrega repertórios de animação; F3, rotinas/relações entre os habitantes; F4, diálogos RPG e quests. Critérios objetivos e disciplina Codex/Git: [BF-4F_PLANO_TECNICO.md](BF-4F_PLANO_TECNICO.md). **Planejamento documentado, não autorização de merge nem gate técnico/físico de F1.**

## BF-4F1 — Encerramento dirigido (2026-11-02)

O usuário aprovou no Moto G06 os quatro modelos como primeira versão, confirmou seleção canvas/React e autorizou merge da [PR #13](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/13). F1 **CONCLUÍDA no escopo visual/integração dirigido**. Os microgestos de cabeça não equivalem a movimentos completos: **BF-4F2 é próxima** (animações corporais e expressão); depois F3 agência, F4 diálogo RPG. CI [41520167206](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41520167206): 667 Vitest, build e gates não E2E PASS; E2E final FAIL (20 PASS, 6 FAIL, 1 flaky), sem CI global PASS. #4/#11, R-19, TalkBack, desempenho sustentado e BF-4G pendentes. [Relatório F1](BF-4F1_RELATORIO.md).
