# Fechamento do programa de recuperação R1–R5 — 08/11/2026

**Decisão do proprietário:** encerramento funcional/artístico **por aceite dirigido com ressalvas**, autorizado após a instalação da candidata R5R e do reparo da borda no Moto G06. A integração final de R5 ocorre pela [PR #40](https://github.com/Samuel-Francisco-AS/biblioteca-viva/pull/40), base da main após R4 `7100ff6e5fecc2f20ade8bfff5c9c4ca5b6b231e`; cabeça aprovada antes deste registro `2b5651b6947bb407b1ba75e7ee51be32ef1357e1`. Este relatório foi preparado na branch da PR antes do merge; o SHA do merge é verificável no histórico da PR e da main.

## O que o aceite cobre

| Rodada | Resultado aceito e integração |
| --- | --- |
| **R1** | Recuperação de input/câmera, clamp de navegação e picking exato. Aceites físicos dirigidos prévios; já incluída na integração anterior das PRs #32–#38. |
| **R2** | Grafo/obstáculos, redução do trabalho de renderização e seis representações de registros; saneamento do Livro da Estrela. O proprietário confirmou melhorias e correção do livro no Moto G06; já incluída pela integração anterior. |
| **R3** | Loop, agência, trabalho ocioso e lifecycle com descarte dirigido. Aceite físico de fluidez e navegação no Moto G06 após saneamento; já incluída na integração anterior. |
| **R4** | Dados/sessões, observabilidade, backup/integridade, ciclo e interface de leitura. Integração da PR #39 com aceite físico dirigido e dívidas documentadas. |
| **R5 / R5E** | Quatro habitantes estilizados com rigs/GLBs, skins/clips/sockets, expressividade e identidade próprios. Refinamentos posteriores recuperaram a legibilidade visual. |
| **R5P** | Limitação de trabalho de PointLights fora do alcance e preparação exata de skinning para consultas de CPU; proprietário percebeu redução considerável de lag e travamentos no Moto G06. |
| **R5Q** | Primeiro frame noturno correto (PASS Moto G06); seleção/quests com custo CPU reduzido no host. Abertura de quests melhorou, **mas mantém engasgo residual perceptível**. |
| **R5R + reparo** | Aura lilás de Samael, dourado de Aryn, halo/asas de Ytha, magia de Lua, pergaminho e livro em leitura ficaram mais perceptíveis; feedback humano confirmou melhora luminosa. Contorno verde de 2 px durante tap→pan identificado por reprodução sem WebGL e removido; proprietário testou e confirmou que **a listra desapareceu**. |

**Gate humano final:** o proprietário declara suficientes os reparos da R5 e autoriza explicitamente encerrar e mesclar a série R1–R5. Essa decisão aceita o engasgo residual da abertura das quests como dívida, não como correção completa ou como medição de latência. Gestos, aparência e fluidez geral foram validados **no escopo exploratório informado**, não em todos os dispositivos, ciclos ou condições de carga.

## Evidência técnica e exceções explicitamente mantidas

- R5P: 962/962 unitários (154 arquivos), build/Android e gates locais PASS; E2E dirigido final **0/2**. Comparações SwiftShader não demonstraram ganho consistente de RAF; não equivalem a GPU Android.
- R5Q: primeira ampla 972 PASS/1 falha de fixture, runtime corrigido 55/55 PASS, total de 973 testes distintos aprovados **entre execuções**, não uma ampla final verde. Complemento: 120 dirigidos PASS, ampla 981 PASS/1 timeout no hover de Ytha e arquivo isolado 3/3 PASS, sem segunda ampla verde. E2E dirigido anterior **0/1** por espera de estabilidade do Canvas.
- R5R: 139 testes dirigidos PASS, gates locais/Android e um ciclo WebGL PASS. Capturas completas, mas harness de captura recebeu sinal 143 no encerramento; não foi convertido em sucesso de processo. Reparação do contorno: 69 dirigidos PASS, reprodução antes/depois sem WebGL, formato/lint/tipos/build/Android PASS. A suíte ampla e E2E não foram repetidas nessas últimas rodadas.
- **CI global não está verde nem foi executada para os commits recentes.** A cota do GitHub Actions estava esgotada até 01/12/2026. Commits de entrega, fechamento e integração usam `[skip ci]` para evitar consumo; checks pendentes/omitidos não substituem validação automatizada.
- **Quests:** pausa residual entre toque/seleção e apresentação do card, apesar de redução de custo de CPU/UX. Causa dominante no Moto G06 não foi medida; o diagnóstico R5Q opt-in de até 12 seleções permanece disponível para investigação futura, sem telemetria/persistência. Não declarar resolvida.
- **E2E/estabilidade:** prazos de Canvas/seleção/hover com falhas e flutuação históricas, incluindo R2, permanecem dívida. Testes/assertivas/prazos não foram relaxados para fabricar um resultado verde.
- **Memória/lifecycle:** regressões de descarte/RAF próprio passaram, mas retenção global heap/DOM em host de ciclos sucessivos permanece sem causalidade atribuída; nenhum teste prolongado de memória/termal/GPU física foi concluído.
- **Acessibilidade:** TalkBack e gate assistivo abrangente continuam pendentes.
- **Arte e interações:** rigs não incluem animação facial, dedos independentes, IK/pega física nem assento/leitura sentada. Hover de Ytha não significa voo 3D livre. Não atribuir entregas F2B/F2C ou gates narrativos futuros à R5.
- **Dados:** Dexie v14, backup v6, IDs e contratos narrativos preservados; autorização de merge não autoriza migração de engine, versão, beta, publicação ou mudanças destrutivas.

## Limite da conclusão e continuidade

**Recuperação R1–R5 encerrada por exceção técnica e aceite humano, não por prova de perfeição, CI global verde ou release.** A PR #40 contém a R5 cumulativa e o fechamento documental; R1–R4 já haviam sido integradas.

**BF-5.5 continua parcial** (principalmente F2B/F2C, leitura sentada/rigs, gate integrado G e demais validações). BF-6/RPG e BF-7/consolidação permanecem no roadmap, sem início automático por este aceite. As próximas etapas podem tratar a dívida de quests, memória/CI e acessibilidade com planejamento próprio, sem reabrir artificialmente o programa de recuperação.

## Referências

- [Plano histórico de recuperação](BV_PLANO_RECUPERACAO_EXECUCAO.md)
- [R5 — assets e pipeline](BV_RECUPERACAO_R5.md) · [R5E](BV_RECUPERACAO_R5E.md)
- [R5P — desempenho](BV_SANEAMENTO_PERFORMANCE_R5P.md)
- [R5Q — primeiro frame e quests](BV_SANEAMENTO_R5Q.md)
- [R5R — efeitos, transição e reparo do contorno](BV_POLIMENTO_R5R.md)
- [Integração R1–R3 e BF-5.5 parcial](BV_INTEGRACAO_PR32_38_2026-11-07.md)
- [Integração R4](BV_INTEGRACAO_PR39_R4_2026-11-07.md)
