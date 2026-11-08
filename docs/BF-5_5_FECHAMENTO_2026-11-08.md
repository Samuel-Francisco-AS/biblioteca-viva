# BF-5.5 — O Despertar da Biblioteca | Fechamento com ressalvas

**Data:** 08/11/2026  
**Decisão:** encerramento **funcional e artístico por aceite humano com ressalvas**, solicitado expressamente pelo proprietário após testar a BF-5.5G no Moto G06: “não ficou perfeito, mas vamos consolidar, integrar na main e documentar o fechamento da fase”.

A fase **não é declarada perfeita**, nem recebe certificação de CI global, desempenho sustentado, acessibilidade, ergonomia em todas as orientações ou release. A integração autorizada será feita em ordem **PR #41 (F2) → PR #42 (G)**, com histórico preservado e commit de merge `[skip ci]`; os SHAs de merge e o estado final são os registros autoritativos das PRs no GitHub.

## Entregas incorporadas à BF-5.5

| Frente | Escopo efetivamente implementado e situação de aceite |
| --- | --- |
| A — continuidade | Posições/intenções e checkpoints conciliados entre sessões e reinícios, sem persistir poses por frame. |
| B — tarefas e objetos | Agência única, navegação e `InteractionCoordinator` para reservas e objetos manipulados sem duplicação intencional. |
| C — noite e luz | Estado noturno, nove luminárias e tarefas/ritual com fallback independente; primeiro frame noturno foi corrigido na recuperação R5Q. |
| D — magia e pergaminhos | Pergaminhos pessoais vivos com limite de materializações, rotas/interação e abertura de origem; preservação da privacidade. |
| E — mobília | Representações/âncoras físicas das estações e móveis de leitura, estudos, trabalho, treino e entretenimento. |
| F1/F2A | Projeção de sessões confirmadas; mesmo livro pessoal `reading-book:<entryId>` via estante/mesa/mãos/assento/retorno. Recolhimento manual validado em implementação apenas para Samael e Aryn; Lua/Ytha mantêm fallback autônomo. |
| F2B | Assentos com reserva e ocupação distintas, sentar/levantar reversíveis e estudo com consulta/escrita. 19 clips por habitante na F2. |
| F2C | Trabalho na bancada `bf4-prop:16`, treino na `bf4-prop:14`, observação de entretenimento na `bf4-prop:6`, vinculados a estado de sessão real. |
| G — refinamento | Apresentação de voo/hover da Ytha, caminhada de Samael/Aryn/Lua, feedback de navegação entre abas, marca temporária (~3 s), notificações ambientais no topo, acesso à lista no rodapé e ajustes de sobreposição do HUD. |

**Integrações anteriores:** A–E e F parcial entraram na main pela integração acumulada das PRs #32–#38; a recuperação R1–R5 foi integrada posteriormente pela PR #40. F2 foi entregue na PR #41 (`d8b2c4eb151f8fe2643cd3e3e0a3ceaf534e53ea`), G na PR #42 (`2dc2a2c09f8a5e46418d49ddb83dd2b95db0aae9`), antes do registro de fechamento documental nesta última.

## Aceites físicos — distinção entre F2 e G

1. **F2: PASS dirigido em cinco grupos no Moto G06**, informado pelo proprietário: leitura física; estudo/assentos; trabalho/treino/entretenimento; interrupções/continuidade; fluidez/mundo. O aceite foi registrado na conversa da PR #41. Não é cobertura exaustiva de todos os contatos, combinações e condições.
2. **G: proprietário instalou/avaliou a candidata no Moto G06 e autorizou explicitamente o fechamento apesar de não estar perfeita.** Não foram fornecidos PASS individuais para Ytha, passadas, HUD paisagem e transições. Registrar **aceite global por exceção**, e não fabricar PASS 5/5 ou afirmar eliminação de quaisquer engasgos.
3. A autorização inclui **merge da #41 e #42** e formalização documental. Não autoriza beta, release, BF-6/BF-7, exclusão das dívidas ou remoção de mecanismos de diagnóstico.

## Evidências técnicas e dívida explícita

- **F2**: 266 Vitest dirigidos PASS/31 arquivos; 1 E2E dirigido PASS sem retries. Gates locais (formato, lint, TS, áudio, web, performance, Android, diff) passaram. Não houve CI global nem validação assistiva formal.
- **G**: na rodada integrada, 277 PASS e **1 timeout** (envelope de Ytha); o arquivo isolado passou 13/13, comprovando os 278 casos distintos **entre execuções**, não uma rodada integrada 100% verde. Verificações finais locais dos módulos modificados e 4/4 layouts CSS passaram.
- **G E2E**: **1 PASS / 1 timeout/FAIL** na candidata: retrato passou, o cenário integrado de HUD em paisagem terminou no limite. Após a correção de layout, a fixture CSS passou, **mas o E2E integrado de paisagem não foi comprovado novamente**. Essa ressalva permanece e merece gate posterior específico, sem presumir equivalência do teste de CSS ao aplicativo.
- **CI global**: GitHub Actions omitido por cota nos commits `[skip ci]`. Não equivale a verde. Permanecem testes E2E históricos de Canvas/seleção/quests e suas causas não totalmente isoladas.
- **Qualidade artística/perceptiva**: Ytha permanece hover/deslocamento em rotas 2D, **sem voo livre**. Passadas foram melhoradas, não declaradas perfeitas; transições entre abas são suavização perceptiva, sem comprovar latência física zero. Engasgo residual da abertura das quests aceito no fechamento R5 ainda não foi totalmente resolvido.
- **F2**: Lua/Ytha não pegam o livro manualmente; entretenimento em pé; treino sem levantamento de equipamento; escrita/ofício em prancha segurada; ergonomia fina dos dedos e contato total com a bancada não comprovados.
- **Confiabilidade e dispositivo**: testes de memória sustentada/heap, GPU e termal Android, uso prolongado, TalkBack, texto aumentado/ergonomia em todos os layouts e comportamento de recuperação extremo não foram certificados. Não declarar ausência de leak ou suporte assistivo aprovado.
- **Dado e runtime**: Dexie v14, backup v6, IDs, contratos F1 e narrativa, RAF principal e sistema de leases preservados. Não há mudança de engine, release, migração autorizada ou início do RPG.
- **Performance/arte**: não remover efeitos e luzes aprovados para alcançar testes sintéticos. Avaliar regressões físicas reais em futuras etapas, especialmente no Moto G06.

## Decisão e continuidade

**BF-5.5 encerrada administrativamente no escopo aceito, com dívida registrada.** O fechamento significa conclusão suficiente de A–G conforme decisão do proprietário, não perfeição estética nem aprovação exaustiva de CI/UX. Incrementos de Ytha, passadas, ergonomia da HUD e as limitações F2 permanecem oportunidades de polimento posterior, planejadas separadamente, sem reabrir artificialmente esta fase.

As próximas frentes do roadmap são **BF-6 — sistemas RPG/mundo e personagens** e **BF-7 — consolidação funcional/assistiva**, cada uma sujeita a planejamento/autorização próprios. Isso não elimina prioridades anteriores de E2E, acessibilidade, memória e integridade.

## Fontes e rastreabilidade

- [Plano de BF-5.5](BF-5_5_O_DESPERTAR_DA_BIBLIOTECA.md)
- [Relatório F2 e roteiro](BF-5_5F2_IMPLEMENTACAO.md)
- [Relatório G, custos e roteiro](BF-5_5G_REFINAMENTO.md)
- [Integração prévia A–F parcial](audits/BV_INTEGRACAO_PR32_38_2026-11-07.md)
- [Fechamento da recuperação R1–R5](audits/BV_FECHAMENTO_RECUPERACAO_R1_R5_2026-11-08.md)
- [PR #41](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/41) e [PR #42](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/42)
