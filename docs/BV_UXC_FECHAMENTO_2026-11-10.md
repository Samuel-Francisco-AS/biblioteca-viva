# Fechamento BV-UXC — Continuidade de toque, transições e desempenho

**Data do aceite:** 10/11/2026  
**Escopo:** BV-UXC R1–R6.2, PR [#49](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/49)  
**Decisão:** aprovado pelo proprietário **com ressalvas**, com autorização explícita de integração à `main` e fechamento desta fase.  
**Identificação do candidato aprovado:** `05714b50321398c25ab615c22baf5eff7d6703d5` (antes do commit documental de fechamento).  
**Confirmação do merge:** consultar o estado final da PR #49; o SHA confirmado do merge deve constar no registro pós-integração.

## 1. Motivo e escopo concluído

A Biblioteca Viva apresentava pausas perceptíveis em toques, seleção dos habitantes, navegação por dock, entrada no Arcanário e em suas salas, abertura de painéis e execução de ações. O objetivo da BV-UXC foi **melhorar a continuidade percebida do toque sem empobrecer a direção artística nem comprometer estado e mecânicas**.

- **R1–R3:** feedback do gesto, broadphase e redução do custo de toques vazios.
- **R4:** envelopes matemáticos para selecionar personagens e acompanhar destaque, reduzindo dependência de CPU skinning/GLB durante o picking; diagnóstico de controles/dock/Arcanário.
- **R5:** intervenção transversal em React/rotas, consultas do Arcanário e estudos, drafts, transações de leitura e reconciliação da arena.
- **R6:** coreografia de navegação em três etapas — toque/saída, preparação, revelação após prontidão declarada da tela.
- **R6.1:** cobertura totalmente opaca, prevenção de piscada/underlay, easing mais gradual e sigilo contínuo entre estados.
- **R6.2:** foco e custo de estilos na abertura das quests, evitando seletores amplos `:has()` e refoco repetido em cada escolha narrativa.

Não foram removidas animações, funcionalidades ou os quatro habitantes; não houve migração nova de schema, alteração do backup nem reescrita do motor do Duelo Arcano.

## 2. Evidências e aceite físico

### Evidências locais R5 verificadas pelo Codex

- Replay fictício de seis trocas de sala: **48 → 0 leituras**; também 12 → 0 transações.
- Digitação do roteiro: **36 → 1 gravações** de rascunho.
- **420 testes dirigidos PASS** na rodada integrada R5; suplementos sobrepostos, não somáveis.
- Lint, formato, tipos, builds e APKs normal/diagnóstico **PASS local na R5**.
- E2E UI **PASS local**; E2E lifecycle 3D **FAIL por timeout**. Não tratar timeout como PASS.
- Não há comparação temporal controlada P95/P99 no Moto G06, nem CI global certificada.

### Sequência de feedback no Moto G06

- Após R3: toques vazios deixaram de provocar o mesmo congelamento; ações válidas ainda engasgavam.
- Após R5: usuário relatou melhora, porém permanência de desconforto perceptível.
- Após R6: usuário observou melhora clara das transições, com piscada e chegada abrupta.
- Após R6.1: usuário confirmou melhora, restando principalmente pequenos engasgos ao tocar habitantes e abrir o card de quest.
- Após R6.2: **usuário confirmou nova melhora**, embora o comportamento ainda não esteja 100% fluido, e **autorizou expressamente merge e fechamento**.

Esse retorno representa **aceite humano funcional dirigido** do conjunto, com ressalvas. Não representa aprovação de testes físicos exaustivos nem prova quantitativa de desempenho sustentado.

## 3. Ressalvas não encerradas

1. **Microengasgos residuais em cards de quest**, ainda perceptíveis no Moto G06; investigar com R5Q/trace Android WebView, React commit, CSS/style/layout, foco e `ThreeWorldRuntime.applyNarrativeToAgency` quando houver nova demanda.
2. **E2E 3D lifecycle timeout** na R5; diagnóstico sem equivalência automática com defeito físico, mas ainda não resolvido por evidência de testes.
3. **P95/P99, FPS sustentado, GPU/CPU, memória/temperatura e TalkBack** não certificados no dispositivo físico.
4. A prontidão de transição cobre as consultas principais e módulos das rotas; widgets internos podem ter atividades assíncronas adicionais.
5. **CI global não executada**, por limites de cota. Testes das correções remotas R6–R6.2 foram escritos, mas **não executados nesta sessão**. Não transportar indevidamente o PASS local da R5 para todas as mudanças posteriores.
6. Não houve promessa de release, publicação Play Store nem de desempenho perfeito em todo hardware.

Esses itens permanecem **dívida rastreável**, sem bloquear o aceite com ressalvas declarado pelo proprietário.

## 4. Estado de planejamento após o fechamento

- **BV-UXC:** escopo fechado por aceite com ressalvas, integrado mediante PR #49 autorizada.
- **BF-5.6A–F:** já integradas anteriormente à `main`.
- **BF-5.6G:** continua **planejada/não iniciada**; a conclusão da BV-UXC não a executa nem fecha BF-5.6 global.
- **BF-6/BF-7:** sem mudança de autorização por este merge.
- O Arcanário conserva dívidas anteriores de UX transversal/balanceamento que não passam a ser consideradas resolvidas apenas pelo tratamento de transições.

### Fontes técnicas

- [BV-UXC — histórico e medições de seleção](BV_UX_CONTINUIDADE_TOQUE_2026-11-09.md)
- [R5 — auditoria global e validações](audits/BV_UXC_R5_DESEMPENHO_GLOBAL_2026-11-09.md)
- [R6 — coreografia e prontidão](audits/BV_UXC_R6_TRANSICOES_2026-11-10.md)
- [R6.1 — continuidade e piscada](audits/BV_UXC_R61_CONTINUIDADE_TRANSICAO_2026-11-10.md)
- [R6.2 — abertura de quests](audits/BV_UXC_R62_QUEST_CARD_2026-11-10.md)
- [PR #49 — commits e integração](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/49)

## 5. Próximo trabalho eventual (não automaticamente autorizado)

Se necessário, realizar sessão curta e instrumentada no Moto G06 para confirmar a origem dos microengasgos remanescentes ao abrir quests; corrigir o que as métricas mostrarem, sem reabrir retroativamente a BV-UXC e sem confundir refinamento posterior com reprovação do escopo funcional aceito.
