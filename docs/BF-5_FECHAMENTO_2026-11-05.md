# BF-5 — Fechamento da reforma de UI/UX e integração das PRs #25–#30

**Data da decisão:** 05/11/2026  
**Situação:** **BF-5 ENCERRADA no escopo de reforma visual e funcional aprovado pelo proprietário, com ressalvas técnicas e gates globais pendentes.**  
**Base já integrada:** main em 1df8adadb153e41d068f5d98e899dacb8d18de74, antes deste registro documental.  
**Próxima fase no roadmap:** BF-6 — Mundo Vivo/RPG, **apenas para planejamento posterior**. BF-7 — consolidação funcional e assistiva, incluindo as dívidas aceitas.  
**Não significa:** publicação, beta, aprovação da CI E2E global, cobertura física exaustiva, TalkBack validado ou eliminação de todas as pendências.

## Autorização e alcance do aceite

Em 05/11/2026, após instalar a candidata atualizada no Moto G06, o proprietário declarou que, pelo que observou, as modificações estavam boas o suficiente para aprovação e **autorizou a integração à main e a documentação de fechamento**, com intenção de avançar. Essa manifestação constitui aceite artístico e funcional **dirigido ao que foi observado**, inclusive a substituição do atlas articulado rejeitado pelo Atlas Clássico projetado. Não houve relatório de execução de todas as etapas dos roteiros anteriores, restauração de dados reais, TalkBack humano, medição de desempenho prolongado nem certificação de todos os fluxos.

O fechamento da BF-5 é uma decisão de produto com **exceções técnicas explícitas**. A revisão dirigida e a integração não devem ser retroativamente descritas como CI verde ou gate assistivo concluído.

## Integração preservando o histórico

As seis PRs estavam originalmente empilhadas (#25 → #26 → #27 → #28 → #29 → #30). A main original era f35258cfc58ce62396668013533954950a994c4b, ancestral do commit final da stack, sem divergência antes do merge. Cada PR foi retargeted para main, marcada pronta para revisão e integrada **sequencialmente com merge commit** (não squash ou force push), mantendo o head original.

| PR | Entrega | Merge commit |
| --- | --- | --- |
| [#25](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/25) | Coleção, fólio de livros e PNG | 31d4174ac9be68a5c0fb4a15652086d5389d6009 |
| [#26](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/26) | Estudo, pomodoro, caderno e cartas locais | d06c1a35a4917566df214ed72024bf782d967a2a |
| [#27](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/27) | Ficha diária, gráfico, perfil físico e MET | 52b274f8d0b110e84444632ddac7f242210f0b58 |
| [#28](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/28) | Entretenimento, desejos, estreias e banners | 3011b4312fc9f02af5fe12328f79580384fc6866 |
| [#29](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/29) | Seletores internos, capas e ateliê compartilhado | 87069da608edce24355df3bd1f10ae99cf623287 |
| [#30](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/30) | Empreitadas, estrelas e Atlas Clássico projetado | 1df8adadb153e41d068f5d98e899dacb8d18de74 |

O head final de produto integrado é f7c79aec02c865a64f5eb2fb0a781615997b022c. Os commits de merge acima registram a integração efetiva. A PR #20 já havia estabelecido O Códice Iluminado na main; [decisão anterior](BF-5_INTEGRACAO_PR20.md).

## Resultado funcional incorporado

- **Interface global:** identidade O Códice Iluminado, Canvas predominante, dock, fólios, navegação e refinamento dos controles da Coleção.
- **Livros:** leitura/status, página atual/final, notas/citações com localização, capas, avaliação por estrelas e exportação PNG.
- **Estudo:** fólio contínuo, pomodoro por timestamps retomado após background, acumulado, caderno, flash cards locais. Sem alarme/notificação em segundo plano.
- **Atividade Física:** ficha-base reutilizável, execuções diárias ajustáveis, gráfico mensal, intensidade, perfil físico voluntário e estimativa aproximada MET. Atlas Clássico com seis gravuras originais estáticas, três de cada coleção, 8 s por prancha e dissolução de 1,8 s; sem rig/motor articulado.
- **Entretenimento:** cinco grupos visíveis, mantendo seis tipos técnicos de registros; filme/série e anime/animação, desejos/favoritos, estreias, acompanhamento, diário, pôsteres e banners locais.
- **Trabalho:** Empreitadas com etapas, tarefas, estado, progresso calculado, próxima ação e diário; sessões e notas anteriores mantidas.
- **Infraestrutura:** controles de opções/datas internos, mídia persistente separada dos snapshots 3D, ateliê de imagens compartilhadas, Dexie v14 por mudanças aditivas e backup v6 compatível com arquivos antigos. Não foi efetuado downgrade de banco.

Os tipos técnicos movie e series e suas projeções 3D, IDs, RPG e mundo residente foram preservados no escopo das alterações. Não foi implementado o minigame global de baralhos: a [ADR-020](decisions/ADR-020-baralhos-e-cartas-globais.md) documenta somente essa evolução futura.

## Evidência e limites dos gates

**Confirmado pelos relatórios das candidatas:** checks locais de formatação/lint/tipos/build e geração de APK debug foram aprovados por etapa; testes unitários e E2E **dirigidos** foram realizados, com falhas intermediárias documentadas. Na revisão final específica do Atlas Clássico: 19 unitários e 5 E2E dirigidos PASS; build, sincronização Android e APK debug PASS. Esses totais não são agregados nem reinterpretados como aprovação de toda a suíte.

**CI remota do head final #30:** [execução 41972766248](https://github.com/Samuel-Francisco-AS/biblioteca-viva/actions/runs/41972766248) finalizou **FAIL**: gate de estáticos/unitários/build PASS, os dois shards E2E FAIL. Não foi realizado novo gate completo nos commits de merge/documentação neste fechamento. Falhas não são automaticamente classificadas como problemas do runner nem todas como regressões do produto; a classificação continua necessária.

**Físico:** proprietário instalou a atualização e avaliou as modificações observadas como satisfatórias para avanço. Não há confirmação física sistemática de cada subtipo, exportação/restore, todo o ciclo de pomodoro, todas as rotas e controles, TalkBack humano ou desempenho sustentado. Este fechamento não inventa resultados.

## Dívidas expressamente preservadas

1. [#21 — Integridade de backup/restauração](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/21): gate E2E/Android com base fictícia, restore atômico e reload, incluindo backups com mídia.
2. [#22 — Histórico de sessões e execuções](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/22): consistência do histórico, imutabilidade da execução e validação Android.
3. [#23 — E2E, Canvas/WebGL, navegação e RPG](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/23): separar testes obsoletos/fixtures, timeouts e regressões reais; restaurar CI global confiável. Issues históricas #4, #11 e #15 permanecem independentes.
4. [#24 — Refinamento de formulários e saneamento CSS](https://github.com/Samuel-Francisco-AS/biblioteca-viva/issues/24): grande parte da UX foi entregue nas PRs; comparação/eliminação segura de CSS legado, validação assistiva e casos residuais seguem sem comprovação integral. A issue permanece aberta para rastreio, não como negação do aceite de escopo.
5. Limite global aproximado de 10 MiB para backup com muitas capas; incompatibilidades de downgrade; testes de importação/exportação reais ainda pendentes. A existência de testes dirigidos de mídia não elimina esses limites.
6. Pomodoro não dispõe de aviso nativo de conclusão em background; cartas globais/mesa 3D são apenas visão futura; avaliação do atlas não representa orientação biomecânica.

Esses itens devem ser tratados por prioridade de risco, especialmente dados, restauração e integridade, antes de qualquer declaração de prontidão para beta/release. BF-7 conserva o gate de consolidação e acessibilidade da [ADR-014](decisions/ADR-014-replanejamento-pos-bf4.md), sem impedir reparos de alta criticidade antes, caso bloqueiem a fase seguinte.

## Decisão de avanço

- **BF-5 fechada no escopo artístico/funcional aceito, com ressalvas técnicas listadas acima.**
- **BF-6 é a próxima fase para discussão e planejamento separado**, sobre aprimoramento do Mundo Vivo/RPG, sem implementação implicitamente autorizada por este documento.
- **BF-7 permanece futura** para consolidação funcional e assistiva; fechamento da BF-5 não antecipa sua aprovação.
- Não publicar na Play Store, marcar beta/release, limpar dados pessoais ou encerrar issues técnicas apenas por consequência dos merges.

## Referências

- [Roadmap](ROADMAP.md) · [Estado atual](STATUS.md) · [Direção da interface](UX.md)
- [Fólio de Livros](BF-5_PARTE2_FOLIO.md) · [Estudo](BF-5_PARTE2B_ESTUDO.md) · [Atividade Física](BF-5_PARTE2C_ATIVIDADE_FISICA.md)
- [Entretenimento](BF-5_PARTE2D_ENTRETENIMENTO.md) · [Controles e ateliê](BF-5_PARTE2E_CONTROLES_CAPAS_ATELIE.md) · [Empreitadas e estrelas](BF-5_PARTE2F_EMPREITADAS_ATLAS_AVALIACOES.md)
- [Atlas Clássico](BF-5_ATLAS_CLASSICO_PROJETADO.md) · [ADR-022](decisions/ADR-022-atlas-classico-projetado.md)
