# BF-5 — Integração da PR #20 com dívidas explicitamente aceitas

**Data da decisão:** 04/11/2026  
**PR:** [#20 — O Códice Iluminado](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/20)  
**Merge aprovado e executado:** `f1829919fc54fe2ece62ffe1a82fe7054362a179` (`merge`, histórico preservado)  
**Head integrado:** `05644e278a2e5627441689f85eae6b8f95e2f4fb`  
**Status da fase:** **BF-5 EM ANDAMENTO — NÃO ENCERRADA.**

## Decisão

O proprietário avaliou o APK R9 no Moto G06 como satisfatório provisoriamente, aprovou a identidade artística do Códice Iluminado e **autorizou explicitamente o merge da PR #20 à main com registro das dívidas restantes**.

A integração é um checkpoint de fundação visual/técnica, **não** certificação de todos os fluxos, aceite de todas as falhas E2E, declaração de desempenho perfeito ou fechamento da BF-5.

Nenhuma informação de usuário foi modificada para validar o gate. A `main` recebe a UI aprovada, o canvas fullscreen, mundo residente, seis categorias de registros, gameplay/narrativa existentes, ícone Android autoral, a abertura encantada e a organização inicial do CSS.

## Evidências de validação no momento do merge

| Gate | Evidência / resultado |
| --- | --- |
| Teste físico | APK R9 instalado e julgado satisfatório provisoriamente pelo proprietário; abertura temática aprovada. |
| Visual | Direção artística R6 aprovada; pan/pinch e rolagem Coleção R7: PASS dirigidos. |
| Unitários, lint, tipos, áudio, build, performance | PASS; **732/732 unitários** na [CI 41837064636](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41837064636). |
| E2E amplo | **NÃO APROVADO**: 21 PASS / 27 FAIL (48 casos; shard 2: 11 PASS/13 FAIL; shard 1: 10 PASS/14 FAIL). Falhas mantidas, com logs e traces, sem desativar asserções. |
| Dados e persistência | Testes unitários verdes. Os E2E de backup/restauração e ficha de treino **não figuram nas 27 falhas** da CI final (casos executados no shard 2), embora ainda falte validação dirigida no Android e da experiência real. Não há aceite de risco de perda de dados. |
| CSS | Sete imports antigos reduzidos a três (base, legado consolidado, atelier). As cinco folhas intermediárias foram preservadas integralmente em ordem, sem provar remoção de regras obsoletas. |
| Android pós-merge | Não foi realizado um novo gate físico do commit de merge; validação do APK anterior é representativa, não certificação nova. |

**Nota após fechamento da CI:** os 27 casos falhos concentram-se em testes de exploração BF-4, canvas/rotas BF-5R5 e shell/leitura; o teste de backup/reforço de IndexedDB e o histórico de execução não constam entre os casos falhos. Isso é uma melhoria objetiva em relação aos relatórios anteriores, sem certificação física abrangente.

**Importante:** falhas de E2E não devem ser reinterpretadas automaticamente como problemas do Chromium software nem como regressões reais; é necessária classificação por evidência. O resultado verde de testes unitários não substitui teste de integração.

## Registro de dívidas aceitas para integração

### A. Persistência de backup/restauração — alta criticidade
**Issue [#21](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/21).**
Validar exportação, inspeção, restauração transacional, rejeição/cancelamento, sobrevivência a reload, ausência de itens removidos e apresentação correta após retorno. A mensagem de sucesso sozinha não é evidência de integridade. Executar com base fictícia isolada e backup de segurança.

### B. Histórico de sessões / treino — alta criticidade
**Issue [#22](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/22).**
Validar registro datado, dias de prática, histórico persistido, notas, carga e imutabilidade do snapshot após editar a ficha reutilizável. Avaliar Android e E2E dirigido, sem apagar expectativas funcionais.

### C. E2E de navegação, runtime 3D, RPG e acessibilidade — criticidade técnica
**Issue [#23](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/23).**
Triage de 27 falhas no gate de integração: seletores herdados BF-4, drawers, rota/dock, canvas residente, WebGL software, diálogo/quest, falha de execução e/ou regressões funcionais. Evidências anteriores e dependências: [#4](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/4), [#11](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/11), [#15](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/15). Manter critérios verdadeiros; não marcar pipelines verdes artificialmente.

### D. BF-5 — segunda parte de interface e formulários
**Issue [#24](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/24).**
Refinar estrutura e ergonomia dos formulários e detalhes de livros, séries, filmes, estudos, atividades físicas e trabalhos; inputs, teclado Android, acessibilidade, transições, estados e toque. Preservar paleta, ornamentação e Canvas aprovados. Reavaliar seletivamente CSS legado com capturas e gate físico; não consolidar regras às cegas.

## Política pós-merge

1. **BF-5 permanece aberta**, e nenhuma etapa BF-6 ou BF-7 é antecipada por este merge.
2. Criar **nova branch/PR** para a segunda parte da BF-5, mantendo a `main` como base estável de integração, com testes dirigidos e validação Moto G06.
3. Priorizar as dívidas de integridade (#21/#22) e classificar os E2E (#23) em paralelo ao planejamento dos formulários (#24). Não depender de uma suíte E2E de 48 casos integralmente verde para começar a planejar UX, mas não encerrar a fase omitindo bloqueios.
4. Mudança da decisão ou aceite definitivo de dívidas exige registro explícito. Somente o proprietário autoriza fechar a BF-5.
5. O registro da PR #20, as evidências e as issues acima permanecem como trilha de auditoria.

## Referências

- [Auditoria pré-merge](BF-5_PRE_MERGE_AUDIT.md)
- [Relatório BF-5R9](BF-5R9_RELATORIO.md)
- [Decisão estética BF-5R6](BF-5R6_RELATORIO.md)
- [PR #20 integrada](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/20)
