# ADR-014 — Replanejamento pós-BF-4: UI/UX, Mundo Vivo e consolidação

- **Estado:** aceita para sequência de fases e estratégia macro; implementação não iniciada
- **Data:** 2026-11-03
- **Complementa:** ADR-011, ADR-012 e ADR-013; preserva ADR-008–010
- **Atualiza especificamente:** numeração da consolidação prevista na ADR-011 (antiga BF-5 → BF-7) e abordagem de entrega da nova BF-5
- **Autoridade operacional:** [ROADMAP](../ROADMAP.md) e [STATUS](../STATUS.md)

## Contexto

A BF-4/BF-4G foi encerrada **no escopo técnico-funcional e físico dirigido** com aceite humano 6/6 no Moto G06, **sem** CI global verde: a PR #18 registrou 30 E2E PASS, 3 FAIL e 1 flaky. Já estavam expressamente reservadas duas frentes posteriores distintas: uma de UI/UX mobile e outra de aperfeiçoamento dos habitantes, animações, RPG, diálogos e interatividade. A ADR-011 havia nomeado de BF-5 a consolidação funcional/assistiva, mas a nova prioridade do usuário é transformar a experiência antes de consolidá-la.

Em 2026-11-03, o usuário aprovou reordenar a trilha BF e explicitou que **não** quer a BF-5 executada como uma coleção de pequenos checkpoints. A intenção é **realizar uma grande reforma e, depois, refinar a interface até alcançar o resultado esperado**.

## Decisão

### Ordem vigente após BF-4

1. **BF-5 — Reforma Global de UI/UX:** renovar de forma abrangente e integrada a interface e a experiência do aplicativo, incluindo fluxos convencionais, navegação, hierarquia, linguagem visual, componentes, tipografia, interação touch, responsividade, painéis de diálogo/diário/RPG, acessibilidade e convivência da superfície React com o mundo 3D. É uma direção de produto, não uma lista final de telas ou um design já aprovado.
2. **BF-6 — Aprimoramento do Mundo Vivo:** depois da reforma de interface, aprimorar os personagens, sua identidade e expressividade, animações/coreografias, efeitos, atuação, sistemas de RPG, diálogos, relações, narrativas, interatividade e consequências perceptíveis. Escopo detalhado e prioridades serão definidos em planejamento próprio.
3. **BF-7 — Consolidação Funcional e Assistiva:** assumir o objetivo originalmente atribuído à **BF-5 da ADR-011**, consolidando integrações, estabilidade, acessibilidade com gate físico (incluindo TalkBack), lifecycle, desempenho sustentado e avaliação da prontidão do marco funcional. Não é aprovação automática de beta ou release.

A BF-4 continua encerrada nos limites documentados. **Não reescrever ou reinterpretar como executadas** fases futuras, nem apagar a cronologia que chamava a consolidação de BF-5.

### Forma de execução escolhida para BF-5

- **Uma macroreforma integrada, coesa e substancial primeiro**: não adotar uma sequência obrigatória de pequenos checkpoints de implementação ou protótipos separados como produto da fase. A ambição é transformar o aplicativo em conjunto, e não polir pedaços da interface antiga de forma incremental.
- **Refinamentos depois da nova interface integrada**: submeter a experiência à apreciação humana (incluindo Moto G06) e realizar rodadas sucessivas de ajustes visuais, ergonômicos e interativos até o usuário aprovar o resultado.
- **Planejamento visual ainda aberto:** linguagem estética definitiva, arquitetura de informação e decisões técnicas da reforma serão discutidas antes de autorizar a implementação. Esta ADR não fixa mockups, telas finais ou tecnologia nova.
- **Responsabilidade técnica preservada:** a entrega ampla não dispensa commits internos, testes dirigidos durante o desenvolvimento, investigação de regressões, acessibilidade, validação de integração nem avaliação física. Não converter “sem pequenos checkpoints” em “sem testes” ou em alteração sem rastreabilidade. Evitar loops de CI sem hipótese e otimização preventiva sem gargalo observado.

### Guardrails e dívidas preservados

- Permanecem local-first, funções essenciais acessíveis pela superfície React, seis tipos de registro, seleção por IDs, arquitetura React → WorldHost → ThreeWorldRuntime → Three.js, lifecycle e integridade dos dados. Sem novas contas, rede obrigatória, LLM, persistência espacial, alterações de Dexie/backup ou dependências por implicação desta ADR.
- Issues **#4, #11 e #15**, flakiness de busca/Arquivo, **R-19**, cena de acidente/reparação do folio de Lua sem gate físico isolado, caminhos/finais RPG não examinados exaustivamente, **TalkBack NOT RUN** e falta de benchmarks sustentados **não foram resolvidos** pelo replanejamento. Quando uma pendência bloquear a experiência ou a entrega atual, tratar na fase que a encontra; BF-7 mantém o gate global.
- Não declarar CI verde, teste físico não realizado, arte final, beta ou publicação por consequência da reordenação.

## Consequências e autorização

Esta é uma **decisão exclusivamente documental de sequência e método de trabalho**. Não inicia BF-5, BF-6 nem BF-7, não autoriza design definitivo ou alteração de produção e não invalida o fechamento dirigido da BF-4. A próxima conversa deverá especificar a reforma da BF-5 como **uma entrega ampla seguida de refinamentos**, sem impor checkpointização contrária à decisão do usuário.

ADR-011 e ADR-012 permanecem como evidência das decisões anteriores; naquilo que concerne **somente à ordem futura e ao método da nova BF-5**, esta ADR é a autoridade mais recente.
