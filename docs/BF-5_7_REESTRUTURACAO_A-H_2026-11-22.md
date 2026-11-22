# BF-5.7 — Reestruturação do planejamento mestre A–H

**Data:** 22/11/2026  
**Natureza desta entrega:** reorganização documental do planejamento; não é implementação de produto.  
**Estado geral:** BF-5.7 permanece ABERTA. BF-5.7A e BF-5.7B encerradas com ressalvas conforme seus termos. Etapas C–H ainda não iniciadas.

## 1. Decisão estrutural

A BF-5.7 passa de sete etapas (A–G) para oito (A–H).

A mudança preserva A e B, transfere para a nova C o escopo não executado do plano original da BF-5.7B e desloca as etapas posteriores uma posição adiante:

| Estrutura anterior | Nova estrutura | Relação |
|---|---|---|
| A — Crystal Controls | **A — Crystal Controls** | Mantida |
| B — Reforma do Arcanário | **B — Reforma do Arcanário** | Mantida e reconciliada |
| Subetapas B3, B4 e B5 não executadas | **C — Consolidação do escopo remanescente do Arcanário** | Novo recorte que absorve o trabalho não executado |
| C — Auditoria proativa de UI/UX restante | **D — Auditoria proativa de UI/UX restante** | Deslocada |
| D — Reformas das áreas convencionais | **E — Reformas das áreas convencionais** | Deslocada |
| E — Mundo e interfaces de contexto | **F — Mundo e interfaces de contexto** | Deslocada |
| F — Acessibilidade, performance e regressão transversal | **G — Acessibilidade, performance e regressão transversal** | Deslocada |
| G — Auditoria final, documentação e fechamento | **H — Auditoria final, documentação e fechamento** | Deslocada |

A antiga nomenclatura não deve continuar sendo usada como estado vigente. Referências históricas a BF-5.7C–G devem ser interpretadas conforme a tabela de migração acima.

## 2. Estado reconciliado das etapas A e B

### BF-5.7A — Crystal Controls
**Estado: CONCLUÍDA COM RESSALVAS.** PR #51 integrada à `main`. O termo de fechamento permanece a fonte de evidência e de ressalvas.

### BF-5.7B — Reforma do Arcanário
**Estado: ENCERRADA por decisão expressa do proprietário, com ressalvas técnicas documentadas.** PR #58 integrou a cadeia de retirada do TCG e saneamento. A reconciliação B1–B6 está em [BF-5_7B_RECONCILIACAO_2026-11-22.md](BF-5_7B_RECONCILIACAO_2026-11-22.md).

Resumo:
- B1 concluída.
- B2.1 encerrada como obsoleta após a decisão de descarte dos dados locais de teste.
- B2.2–B2.5 concluídas/integradas; B2.6 absorvida pela consolidação da PR #58, sem entrega independente.
- B3 e B4 não executadas como subetapas independentes.
- B5 não executada.
- B6 aceita nos aspectos funcionais do Moto G06, com ressalvas de fluidez, E2E, acessibilidade e métricas não certificadas.

Não atribuir retrospectivamente B3, B4 ou B5 à BF-5.7B. O conteúdo pendente passa a ser trabalho da nova BF-5.7C. As dívidas transversais de validação/performance que não pertencem à consolidação funcional do Arcanário são rastreadas na nova BF-5.7G.

## 3. Nova decomposição A–H

### BF-5.7A — Reforma guiada pelo proprietário / Crystal Controls
**Estado: CONCLUÍDA COM RESSALVAS.**

- Controles com identidade visual de cristais mágicos.
- Feedback de pressão e transições.
- Refinamentos dirigidos em Coleção, Livros, Estudos, Trabalho, Atividade Física, Entretenimento e acessos ao Arcanário.
- PR #51 integrada; ressalvas preservadas no termo de fechamento.

### BF-5.7B — Reforma do Arcanário
**Estado: ENCERRADA COM RESSALVAS.**

- Reorientação do Arcanário para recursos educativos.
- Retirada da UI, motor, serviços, arena e assets exclusivos do Duelo Arcano/TCG.
- Preservação dos fluxos educativos existentes e da Lua orbital como entrada do Arcanário.
- Persistência isolada e integração final pela PR #58.
- Evidências, classificação B1–B6 e pendências descritas no documento de reconciliação.

### BF-5.7C — Consolidação do escopo remanescente do Arcanário
**Estado: PLANEJADA; NÃO INICIADA.** Esta etapa absorve somente o trabalho do plano original B3, B4 e B5 que não foi executado. Não reabre a BF-5.7B e não transforma trabalho preservado em entrega nova.

**C1 — Navegação e apresentação (origem: B3)**
- Revisar Portal, Acervo, Oficina, Provações, Ecos e Relicário.
- Corrigir hierarquia, densidade, navegação, estados vazios/erro e consistência visual.
- Verificar rotas, retorno/Back Android, foco, safe areas e movimento reduzido.
- Separar retirada de elementos TCG (já concluída na B) de melhorias de navegação ainda não realizadas.

**C2 — Consolidação educacional (origem: B4)**
- Avaliar e consolidar os fluxos de flashcards, baralhos e revisão.
- Avaliar autoria/edição de questões, correção, explicações, diagnósticos, filtros e histórico/versionamento.
- Revisar a gestão e atualização de pacotes offline.
- Preservar o que já existe; implementar somente lacunas demonstradas, sem duplicar funcionalidades.
- ENEM/concursos exigem procedência, licenças e direitos de uso verificados; não redistribuir enunciados sem autorização.

**C3 — Cartas de atividade física (origem: B5)**
- Prototipar e decidir se o conceito terá carta de plano/ficha de treino, carta de desempenho por período ou ambas.
- Definir a fonte canônica dos dados, campos opcionais/ausentes, atualização, histórico e exportação.
- Evitar histórico duplicado: cards devem derivar dos registros canônicos de Atividade Física.
- A implementação persistente depende de decisão explícita do proprietário após avaliar o protótipo.

**C4 — Integração e aceite da C**
- Executar regressões dos fluxos educativos existentes e dos novos recortes.
- Validar offline, persistência e backup sem regressões.
- Realizar gate funcional/físico aplicável no Moto G06 e documentar PASS/FAIL/não executado.
- Registrar decisões de produto ainda abertas, sem as converter em implementação presumida.

**Limites de C**
- B2.6 não é uma tarefa pendente independente: foi absorvida pela consolidação final da PR #58.
- B6 foi aceita nos aspectos funcionais com ressalvas. Dívidas gerais de acessibilidade, performance e regressão são tratadas na G, não repetidas como uma reabertura artificial de B6.
- Esta estrutura documental não autoriza começar a implementação da C; cada recorte deve ter escopo, branch/PR e gate próprios.

### BF-5.7D — Auditoria proativa de UI/UX restante
**Estado: NÃO INICIADA; sucessora da antiga C.**

- Inventariar interfaces e fluxos não cobertos pelas reformas A–C.
- Identificar fricção, densidade, inconsistências, estados vazios/erro, semântica e navegação.
- Produzir propostas priorizadas com evidências e trade-offs.
- Submeter propostas ao proprietário antes de implementar.
- Não duplicar trabalho já realizado ou planejado na C.

### BF-5.7E — Reformas das áreas convencionais
**Estado: NÃO INICIADA; sucessora da antiga D.**

- Aplicar melhorias derivadas da auditoria D em Coleção, Arquivo, Estatísticas, Livros/fólios, Entretenimento, Estudos, Atividade Física e Trabalho.
- Intervir somente onde houver problema demonstrado e direção aprovada.
- Preservar modelos canônicos, histórico, backup e funcionamento offline.
- Validar cada conjunto de mudanças sem acumular alterações não verificadas.

### BF-5.7F — Mundo e interfaces de contexto
**Estado: NÃO INICIADA; sucessora da antiga E.**

- Revisar mundo 3D, HUD, portais, seleção de personagens, cards de quests e fluxos narrativos.
- Preservar identidade e interações aprovadas dos habitantes.
- Investigar microengasgos com instrumentação e evidências antes de refatorar.
- Evitar mudanças de arte, câmera, geometria ou runtime sem hipótese e critério de aceite claros.

### BF-5.7G — Acessibilidade, performance e regressão transversal
**Estado: NÃO INICIADA COMO ETAPA INTEGRADA; sucessora da antiga F.**

- Consolidar matriz de regressão entre áreas, rotas e lifecycle.
- Avaliar Moto G06, retrato/paisagem, safe areas, gestos, Back, teclado, foco e semântica.
- Realizar TalkBack quando disponível e registrar limitações.
- Avaliar memória, comportamento térmico, estabilidade e frame pacing com medições reproduzíveis.
- Separar medições locais, CI, E2E e validação física; não converter ausência de execução em PASS.
- Incorporar as dívidas transversais identificadas nos aceites de A e B, sem reabrir essas etapas automaticamente.

### BF-5.7H — Auditoria final, documentação e fechamento
**Estado: NÃO INICIADA; sucessora da antiga G.**

- Consolidar entregas, evidências, riscos e dívidas remanescentes.
- Atualizar README, STATUS, ROADMAP, issue mestre e referências/ADRs.
- Verificar coerência entre código integrado, relatórios, gates e estado das PRs.
- Obter aceite explícito do proprietário para encerrar formalmente a BF-5.7.
- BF-6 só poderá ser planejada/iniciada mediante decisão específica posterior.

## 4. Dependências e ordem de execução

1. A e B permanecem como marcos históricos encerrados com ressalvas.
2. C consolida o escopo não executado B3/B4/B5 da antiga BF-5.7B.
3. D audita o restante da UI/UX após C; E implementa melhorias selecionadas a partir dessa auditoria.
4. F revisa mundo e interfaces de contexto.
5. G executa regressão transversal, acessibilidade e performance após as reformas anteriores.
6. H consolida evidências e propõe o fechamento formal.
7. BF-6 permanece fora do escopo desta reorganização e exige autorização própria.

A ordem pode ser detalhada em subentregas e PRs, mas nenhuma dependência deve ser pulada apenas para manter uma sequência nominal.

## 5. Regras de estado e rastreabilidade

- **Concluída:** entrega executada e integrada, com critério de aceite e ressalvas explicitados.
- **Concluída com ressalvas:** aceite explícito do recorte entregue; dívidas não certificadas continuam rastreadas.
- **Planejada:** escopo definido, sem implementação iniciada.
- **Não iniciada:** ainda sem execução ou decomposição operacional.
- **Não executada na etapa de origem:** trabalho transferido sem atribuição retroativa de conclusão.
- **Não aplicável/absorvida:** checkpoint sem entrega autônoma, incorporado em outro marco; não criar tarefa fictícia.

Toda PR futura deve declarar etapa/subetapa, base/HEAD, arquivos e escopo, evidências, gates executados e não executados, limitações e autorização. PRs draft não significam entrega concluída.

## 6. Limites desta reestruturação

Esta PR é documental:
- não altera código de produto, schemas, persistência, assets ou testes;
- não inicia BF-5.7C nem qualquer implementação C–H;
- não fecha a issue #50 nem a BF-5.7;
- não autoriza BF-6;
- não apaga histórico das etapas anteriores.

A issue #50 permanece a coordenação mestre. A proposta de atualização de seu corpo e dos estados A–H acompanha esta PR para revisão; o corpo da issue deverá ser sincronizado após o aceite/merge da reestruturação.
