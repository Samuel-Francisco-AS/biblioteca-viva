# BF-5.6 — O Arcanário | Fechamento global com ressalvas

**Data da decisão:** 11/11/2026  
**Decisão do proprietário:** **ENCERRAR A BF-5.6 GLOBAL COM RESSALVAS**, após a entrega da auditoria BF-5.6G.  
**Autorização textual nesta conversa:** “Entendo, Luna, você foi muito bem em sua execução, obrigado. Agora, eu prefiro por encerrar essa fase com suas ressalvas.”

**Estado resultante:** BF-5.6A–G **encerrada formalmente com ressalvas** na `main`. Esta decisão não é uma declaração de CI global verde, de bateria física exaustiva, de segurança certificada, de produto finalizado ou de publicação Play Store. A BF-6 e a BF-7 **não foram iniciadas** nem autorizadas por este fechamento.

## 1. Linha de conclusão e entregas aceitas

| Marco | Entrega consolidada | Situação |
| --- | --- | --- |
| **A — Fundação** | Cartas globais e vínculos educacionais; migração dos antigos flashcards | Integrada e aceita dentro da sequência A–C, com gate físico parcial documentado |
| **B — Oficina e coleções** | Baralhos, Oficina, coleção, Ecos, Relicário, mídia/troca autoral local | Integrada; ressalvas de A–C preservadas |
| **C — Provações** | Questões, taxonomia, filtros, sessões, diagnósticos e relatórios offline | Integrada; reparos de etiquetas e contraste documentados |
| **D — Biblioteca de Provas** | Manifestos, lotes, hashes, instalação/remoção/reinstalação, quatro exercícios **originais** e referências ENEM/CNU sem redistribuição | [PR #46](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/46), gate físico de seis grupos reportado PASS; sem certificação CI |
| **E — Duelo Arcano** | TCG local determinístico v1, 48 cartas, quatro decks/afinidades, IA, replay, histórico e persistência | [PR #47](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/47) integrada, aceitação mecânica do proprietário, dívida artística original tratada parcialmente em F |
| **F — Arena Viva** | Arena 3D de jogo em tela única, HUD contextual, lua orbital interativa, observatório ritual, 48 pinturas, efeitos de duelo | [PR #48](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/48) integrada, após teste/artístico do Moto G06 e refinamento R1–R4; [fechamento F](BF-5_6F_FECHAMENTO_2026-11-09.md) |
| **G — Auditoria e saneamento** | Inventário, revisão estática de integridade/lifecycle, acesso semântico direto ao portal orbital e teste associado, ADRs renumeradas (030/031), matriz de evidências | [Auditoria G](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md) concluída em rodada única na `main` com ressalvas; **testes criados/atualizados, mas não executados nesta rodada** |

A melhoria paralela **BV-UXC** de continuidade do toque e transições foi integrada à `main` pela [PR #49](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/49), aceita separadamente com ressalvas; [fechamento BV-UXC](BV_UXC_FECHAMENTO_2026-11-10.md). Sua presença faz parte da base examinada em G, mas não apaga seu histórico de validação.

## 2. Parecer de integridade e compatibilidade

- **Dexie v19**, backup privado **v11**, importação de backups v6–v10 e limite de **10 MiB** continuam como contratos da BF-5.6. A auditoria G não alterou migrações, esquema, regulamentação do duelo, identidades de cartas, motor, IA ou dados pessoais.
- Backups possuem verificação de integridade, validações de vínculos e replay; substituição pelo Dexie usa transação. **Isso foi inspecionado no código, não testado novamente em G no Android**.
- Pacotes educacionais distinguem conteúdo autoral e referência. **Não há questões oficiais do ENEM/CNU redistribuídas** apenas porque um PDF está disponível publicamente.
- Remover pacote mantém versões/revisões históricas e **não assegura liberação imediata do armazenamento**; limite e política de retenção permanecem explícitos.
- O mundo residente e a arena têm estratégias separadas de lifecycle; microengasgos de quests e timeouts de ambientes gráficos não foram eliminados por evidência de testes de ponta a ponta.

## 3. Ressalvas aceitas explicitamente — não converter em PASS

O proprietário **aceita encerrar a fase com estes débitos registrados**, sem exigir que sejam reparados ou certificados antes do fechamento documental:

1. **CI global e testes pós-G:** GitHub Actions indisponível por cota esgotada. Na G, não houve checkout local, Vitest, E2E, compilação, lint global, APK novo ou gate Moto G06. O botão semântico “Abrir Salão de Duelos” e a atualização de testes são **implementações não validadas fisicamente nem por teste executado**.
2. **E2E gráficos:** o acesso orbital tinha timeout em duas tentativas antes do reparo G; a suíte ampla antiga F2 teve **1.174 PASS/12 FAIL**, com **seis timeouts gráficos residuais**. A BV-UXC tem E2E de lifecycle 3D com timeout. Eles são dívidas, não aprovações ou falhas físicas automaticamente provadas.
3. **Desempenho e acesso assistivo:** TalkBack humano, texto ampliado, P95/P99/FPS prolongado, memória, temperatura e baixa memória no Moto G06 não certificados. Microengasgos de quests permanecem relatados/aceitos no fechamento da BV-UXC.
4. **Balanceamento TCG:** simulações históricas revelaram vantagem da afinidade Ruína (**59/72** vitórias) e desempenho inferior de Conhecimento (**19/72**). Nenhum rebalanceamento foi aprovado ou aplicado na G.
5. **UI/UX das outras salas:** Portal, Acervo, Oficina, Provações e demais áreas do Arcanário ainda carecem de retrabalho transversal; o refinamento da arena em F não resolve automaticamente essas telas.
6. **Conteúdo editorial e escala:** licenciamento de questões de provas ENEM/CNU continua sem confirmação suficiente para redistribuição; backups volumosos, mídias, longas sessões e milhares de questões necessitam medições físicas específicas.
7. **APK de referência:** o último APK citado do refinamento F antecede PR #49 e G. **Não representa o código atualizado da `main`**; uma instalação para gate posterior exige novo build, SHA e backup pessoal antes de atualizar.

Os riscos foram classificados e preservados no [relatório G](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md), no [inventário estruturado G](audits/evidence/bf56g/inventory.json) e nos documentos de implementação/fechamento A–F.

## 4. Encerramento versus trabalhos futuros

**Decisão:** nenhuma pendência acima impede o **fechamento formal com ressalvas**, expressamente escolhido pelo proprietário; as pendências continuam abertas **como dívida técnica/editorial/assistiva e de validação**, e não como subetapas da BF-5.6 ainda em execução.

Uma rodada futura de regressão em APK da `main` atual, investigação objetiva dos timeouts ou reestruturação de UI/UX deve ser tratada como **trabalho novo ou manutenção**, com autorização/escopo próprios. O fechamento **não autoriza** refatorações adicionais, publicação de aplicativo, alteração de regras ou início automático de BF-6/BF-7.

**Não repetir gates históricos nem atribuir ao proprietário testes que ele não reportou.**

## 5. Rastreabilidade da decisão

- [Plano original](BF-5_6_ARCANARIO_PLANO.md)
- [Fechamento F](BF-5_6F_FECHAMENTO_2026-11-09.md)
- [Auditoria G](BF-5_6G_AUDITORIA_CONSOLIDACAO_2026-11-11.md)
- [Matriz de evidências G](audits/evidence/bf56g/inventory.json)
- [Fechamento independente da BV-UXC](BV_UXC_FECHAMENTO_2026-11-10.md)
- [STATUS](STATUS.md) · [ROADMAP](ROADMAP.md)

**Condição final:** **BF-5.6 encerrada globalmente com ressalvas por decisão expressa de 11/11/2026.** Não houve nova validação ou merge nesta operação documental; o repositório já estava na `main` e sem PRs abertas.
